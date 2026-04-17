// Servicio de datos para "Programa al Robot".
// - Carga misiones desde Supabase con caché en memoria.
// - Si Supabase falla o no hay datos, recurre a los ficheros locales para no
//   romper la experiencia del alumno.
// - Registra las completaciones de retos y dispara la insignia por curso.

import { supabase } from '@/lib/supabase';
import {
  getMissions as getLocalMissions,
  getRetoMissions as getLocalRetos,
  pickRandomReto as pickLocalReto,
} from './misionesData';

const cache = new Map();
const cacheKey = (level, grade, kind) => `${level}:${grade}:${kind}`;

// Adapta una fila que viene de Supabase al shape que usa el cliente.
function adaptRow(row) {
  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    hint: row.hint,
    grid: row.grid,
    startDir: row.start_dir,
    objectives: row.objectives,
    suggestedBlocks: row.suggested_blocks,
  };
}

async function fetchMissionsFromSupabase(level, grade, kind) {
  const { data, error } = await supabase.rpc('get_robot_missions', {
    p_level: level,
    p_grade: parseInt(grade, 10),
    p_kind: kind,
  });
  if (error) {
    console.warn('[robotMissions] RPC error, usando datos locales:', error.message);
    return null;
  }
  if (!data || data.length === 0) return null;
  return data.map(adaptRow);
}

/**
 * Obtiene las misiones normales (1-10) de un curso ESO desde Supabase.
 * Si falla la llamada o no hay datos, vuelve a los datos locales.
 */
export async function fetchNormalMissions(grade) {
  const key = cacheKey('eso', grade, 'normal');
  if (cache.has(key)) return cache.get(key);
  const remote = await fetchMissionsFromSupabase('eso', grade, 'normal');
  const result = remote || getLocalMissions(grade);
  cache.set(key, result);
  return result;
}

/**
 * Obtiene los retos (5 por curso) de ESO desde Supabase (con fallback).
 */
export async function fetchRetoMissions(grade) {
  const key = cacheKey('eso', grade, 'reto');
  if (cache.has(key)) return cache.get(key);
  const remote = await fetchMissionsFromSupabase('eso', grade, 'reto');
  const result = remote || getLocalRetos(grade);
  cache.set(key, result);
  return result;
}

/**
 * Elige un reto aleatorio del pool de un curso. Si aún no se ha pedido el
 * pool a Supabase, lo carga; si algo falla, usa el pool local.
 */
export async function pickRandomReto(grade, excludeSlug = null) {
  const pool = await fetchRetoMissions(grade);
  if (!pool || pool.length === 0) return pickLocalReto(grade);
  const candidates = excludeSlug ? pool.filter(m => m.id !== excludeSlug) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Registra un reto superado en Supabase y concede la insignia si procede.
 *
 * @param {object} opts
 * @param {string} opts.userId   UUID del alumno o docente
 * @param {'student'|'teacher'} opts.userType
 * @param {string} opts.missionSlug
 * @param {number} opts.grade 1..4
 * @param {number} opts.blocksUsed
 * @param {number} opts.nota 0..10
 * @returns {Promise<{ distinct_retos?: number, total_retos?: number, new_badges?: Array } | null>}
 */
export async function recordRetoCompletion({
  userId, userType, missionSlug, grade, blocksUsed, nota,
}) {
  if (!userId || !userType || !missionSlug) return null;
  const { data, error } = await supabase.rpc('record_robot_reto', {
    p_user_id: userId,
    p_user_type: userType,
    p_mission_slug: missionSlug,
    p_grade: parseInt(grade, 10),
    p_blocks_used: blocksUsed,
    p_nota: nota,
  });
  if (error) {
    console.warn('[robotMissions] record_robot_reto error:', error.message);
    return null;
  }
  return data;
}
