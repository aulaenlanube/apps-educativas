// Tablas para `supabase.from(tabla)` en modo mock (SOLO desarrollo).
// Cada handler recibe el estado del query builder ({ op, values, filters… }) y
// devuelve filas (el builder aplica eq/order/limit/single) o { data, error }.
import { mockId } from '../fixtures/util.js';

let insertSeq = 0;

const eqValue = (state, column) => state.filters.find((f) => f.op === 'eq' && f.column === column)?.value;

function updateWhereId(list, state) {
  const id = eqValue(state, 'id');
  const row = list.find((r) => r.id === id);
  if (row && state.values) Object.assign(row, state.values);
  return { data: null, error: null };
}

export const tableHandlers = {
  teachers: (state, { world }) => {
    const rows = Object.values(world.teachers);
    if (state.op === 'update') return updateWhereId(rows, state);
    if (state.op === 'select') return rows;
    return { data: null, error: null };
  },

  game_sessions: (state, { world }) => {
    if (state.op !== 'select') return { data: null, error: null };
    const userId = eqValue(state, 'user_id');
    return userId ? world.sessionsFor(userId) : [];
  },

  quiz_battle_sessions: (state, { world }) => (state.op === 'select' ? world.hostHistory : { data: null, error: null }),

  groups: (state, { world }) => {
    if (state.op === 'select') return world.groups;
    if (state.op === 'update') return updateWhereId(world.groups, state);
    if (state.op === 'delete') {
      const id = eqValue(state, 'id');
      const i = world.groups.findIndex((g) => g.id === id);
      if (i >= 0) world.groups.splice(i, 1);
    }
    return { data: null, error: null };
  },

  students: (state, { world }) => {
    if (state.op === 'select') return world.students;
    if (state.op === 'update') return updateWhereId(world.students, state);
    if (state.op === 'delete') {
      const id = eqValue(state, 'id');
      for (const [gid, list] of world.byGroup.entries()) world.byGroup.set(gid, list.filter((s) => s.id !== id));
    }
    return { data: null, error: null };
  },

  assignments: (state, { world }) => {
    if (state.op === 'select') return world.assignments;
    if (state.op === 'insert') {
      const values = Array.isArray(state.values) ? state.values : [state.values];
      const nowIso = new Date().toISOString();
      const inserted = values.map((v) => {
        insertSeq += 1;
        const row = {
          id: mockId('a550', 0xa000 + insertSeq), created_at: nowIso, updated_at: nowIso,
          assignment_type: 'standard', duel_stake: null, duel_pair_id: null, duel_id: null,
          weight: 1, term: world.currentTerm, ...v,
        };
        world.assignments.push(row);
        return row;
      });
      return { data: inserted, error: null };
    }
    if (state.op === 'update') return updateWhereId(world.assignments, state);
    if (state.op === 'delete') {
      const id = eqValue(state, 'id');
      const i = world.assignments.findIndex((a) => a.id === id);
      if (i >= 0) world.assignments.splice(i, 1);
    }
    return { data: null, error: null };
  },
};
