// Registro de handlers del modo mock (SOLO desarrollo).
import { sharedHandlers } from './shared.js';
import { studentHandlers } from './student.js';
import { teacherHandlers } from './teacher.js';
import { tableHandlers } from './tables.js';

/**
 * RPCs de contenido PÚBLICO de solo lectura (las mismas que puede llamar un
 * visitante anónimo). En modo mock se siguen pidiendo al Supabase real para
 * que las apps (Rosco, Ahorcado…) tengan contenido si navegas a ellas.
 * Nunca se deja pasar nada que escriba o dependa del usuario.
 */
export const PASSTHROUGH_RPCS = new Set([
  'get_rosco_data', 'get_rosco_data_global', 'get_runner_data', 'get_intruso_data', 'get_parejas_data',
  'get_ordena_frases_data', 'get_ordena_historias_data', 'get_detective_data', 'get_comprension_data',
  'get_app_content', 'get_jokes', 'get_subjects', 'get_app_avg_rating', 'get_bulk_avg_ratings',
  'get_robot_missions', 'get_group_public_info',
]);

/** Tablas de catálogo público que se leen del Supabase real (solo SELECT). */
export const PASSTHROUGH_TABLES = new Set(['subjects']);

export const RPC_HANDLERS = { ...sharedHandlers, ...studentHandlers, ...teacherHandlers };

// Ida y vuelta por JSON: igual que si los datos llegaran por la red.
const clone = (x) => (x == null || typeof x !== 'object' ? x : JSON.parse(JSON.stringify(x)));

export function createRpcResolver(ctx) {
  return (fn, params) => {
    const handler = RPC_HANDLERS[fn];
    if (!handler) {
      if (!ctx.unknownRpcs.has(fn)) {
        ctx.unknownRpcs.add(fn);
        console.info(`[dev-mock] RPC sin fixture: "${fn}" → { data: null }. Añádela en src/dev/mock/handlers/.`, params);
      }
      return { data: null, error: null };
    }
    // Clonamos para que los componentes nunca muten el "mundo" por referencia.
    return clone(handler(params || {}, ctx));
  };
}

export function createTableResolver(ctx) {
  return (table, state) => {
    const handler = tableHandlers[table];
    if (!handler) {
      if (!ctx.unknownTables.has(table)) {
        ctx.unknownTables.add(table);
        console.info(`[dev-mock] Tabla sin fixture: "${table}" (${state.op}) → vacío. Añádela en src/dev/mock/handlers/tables.js.`);
      }
      return state.op === 'select' ? [] : { data: null, error: null };
    }
    return clone(handler(state, ctx));
  };
}
