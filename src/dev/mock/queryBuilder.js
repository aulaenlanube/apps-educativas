// ─────────────────────────────────────────────────────────────────────────────
// Query builder falso, encadenable y "thenable", compatible con el subconjunto
// de PostgREST que usa la app: select/insert/update/upsert/delete + filtros
// (eq, neq, gt, gte, lt, lte, in, is, like, ilike, contains…) + order, limit,
// range, single, maybeSingle. Se usa tanto para `supabase.from(tabla)` como
// para el resultado de `supabase.rpc()` (que en supabase-js también es un
// builder y admite `.single()`, `.then()`…).
//
// El resolver recibe el estado acumulado y devuelve `{ data, error }` o los
// datos "a pelo". Si devuelve un array en una lectura, aquí se aplican los
// filtros, el orden y el límite, de modo que los handlers pueden devolver
// todas las filas de la tabla falsa y olvidarse del resto.
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'match'];
const NOOP_CHAIN = ['abortSignal', 'throwOnError', 'returns', 'csv', 'geojson', 'explain', 'rollback', 'setHeader', 'overrideTypes'];

function likeToRegExp(pattern, flags) {
  const escaped = String(pattern).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
  return new RegExp(`^${escaped}$`, flags);
}

function matchesFilter(row, f) {
  const v = row?.[f.column];
  switch (f.op) {
    case 'eq': return v === f.value || String(v) === String(f.value);
    case 'neq': return !(v === f.value || String(v) === String(f.value));
    case 'gt': return v > f.value;
    case 'gte': return v >= f.value;
    case 'lt': return v < f.value;
    case 'lte': return v <= f.value;
    case 'is': return f.value === null ? v == null : v === f.value;
    case 'in': return Array.isArray(f.value) && f.value.some((x) => x === v || String(x) === String(v));
    case 'like': return likeToRegExp(f.value, '').test(String(v ?? ''));
    case 'ilike': return likeToRegExp(f.value, 'i').test(String(v ?? ''));
    case 'match': return Object.entries(f.value || {}).every(([k, val]) => row?.[k] === val);
    default: return true; // contains/containedBy/or/not/filter: no se evalúan (se aceptan todas las filas)
  }
}

/** Aplica filtros, orden y límite de un estado de consulta a un array de filas. */
export function applyQueryToRows(rows, state) {
  let out = Array.isArray(rows) ? rows.slice() : [];
  for (const f of state.filters) out = out.filter((r) => matchesFilter(r, f));
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const { column, ascending } = state.orders[i];
    out.sort((a, b) => {
      const x = a?.[column];
      const y = b?.[column];
      if (x === y) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      return (x < y ? -1 : 1) * (ascending ? 1 : -1);
    });
  }
  if (state.range) out = out.slice(state.range[0], state.range[1] + 1);
  if (state.limit != null) out = out.slice(0, state.limit);
  return out;
}

function normalizeResult(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && ('data' in raw || 'error' in raw)) {
    return { data: raw.data ?? null, error: raw.error ?? null, count: raw.count ?? null };
  }
  return { data: raw === undefined ? null : raw, error: null, count: null };
}

/**
 * @param {string} target  nombre de tabla o `rpc:<nombre>` (solo informativo)
 * @param {(state) => any} resolver
 * @param {{ latencyMs?: number, initialOp?: string }} [opts]
 */
export function createQueryBuilder(target, resolver, opts = {}) {
  const { latencyMs = 0, initialOp = null } = opts;
  const state = {
    target,
    op: initialOp,
    columns: '*',
    values: null,
    filters: [],
    orders: [],
    limit: null,
    range: null,
    single: false,
    maybeSingle: false,
    head: false,
    count: null,
  };

  let promise = null;
  const execute = () => {
    if (!promise) {
      promise = new Promise((resolve) => {
        setTimeout(() => {
          let res;
          try {
            res = normalizeResult(resolver(state));
          } catch (err) {
            res = { data: null, error: { message: String(err?.message || err) }, count: null };
          }
          const isRead = state.op === 'select' || state.op === 'rpc';
          if (!res.error && isRead && Array.isArray(res.data)) {
            const total = res.data.length;
            res.data = applyQueryToRows(res.data, state);
            if (state.count) res.count = total;
            if (state.head) res.data = null;
          }
          if (!res.error && (state.single || state.maybeSingle)) {
            const rows = Array.isArray(res.data) ? res.data : (res.data == null ? [] : [res.data]);
            if (rows.length === 1) res.data = rows[0];
            else if (state.maybeSingle && rows.length === 0) res.data = null;
            else {
              res.data = null;
              res.error = {
                code: 'PGRST116',
                message: 'JSON object requested, multiple (or no) rows returned',
                details: `The result contains ${rows.length} rows`,
              };
            }
          }
          resolve({ ...res, status: res.error ? 400 : 200, statusText: res.error ? 'Bad Request' : 'OK' });
        }, latencyMs);
      });
    }
    return promise;
  };

  const builder = {};
  const chain = (fn) => (...args) => { fn(...args); return builder; };

  Object.assign(builder, {
    select: chain((columns = '*', options = {}) => {
      if (!state.op) state.op = 'select';
      state.columns = columns;
      if (options.count) state.count = options.count;
      if (options.head) state.head = true;
    }),
    insert: chain((values) => { state.op = 'insert'; state.values = values; }),
    upsert: chain((values) => { state.op = 'upsert'; state.values = values; }),
    update: chain((values) => { state.op = 'update'; state.values = values; }),
    delete: chain(() => { state.op = 'delete'; }),
    order: chain((column, options = {}) => { state.orders.push({ column, ascending: options.ascending !== false }); }),
    limit: chain((n) => { state.limit = n; }),
    range: chain((from, to) => { state.range = [from, to]; }),
    single: chain(() => { state.single = true; }),
    maybeSingle: chain(() => { state.maybeSingle = true; }),
    or: chain((expr) => { state.filters.push({ op: 'or', value: expr }); }),
    not: chain((column, op, value) => { state.filters.push({ op: 'not', column, value: [op, value] }); }),
    filter: chain((column, op, value) => { state.filters.push({ op: 'filter', column, value: [op, value] }); }),
    textSearch: chain((column, value) => { state.filters.push({ op: 'textSearch', column, value }); }),
    then(onFulfilled, onRejected) { return execute().then(onFulfilled, onRejected); },
    catch(onRejected) { return execute().catch(onRejected); },
    finally(onFinally) { return execute().finally(onFinally); },
  });
  for (const op of FILTER_OPS) {
    builder[op] = chain((column, value) => {
      if (op === 'match') state.filters.push({ op, column: null, value: column });
      else state.filters.push({ op, column, value });
    });
  }
  for (const name of NOOP_CHAIN) builder[name] = chain(() => {});

  return builder;
}
