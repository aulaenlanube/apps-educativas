/**
 * Servicio unificado de datos de juego.
 * Reemplaza todas las cargas de JSON estáticos por consultas a Supabase.
 *
 * Cada función devuelve los datos en el MISMO formato que los JSON originales,
 * para que los componentes no necesiten cambiar su lógica de procesamiento.
 */

import { supabase } from '../lib/supabase';

// --- Cache en memoria para evitar consultas repetidas en la misma sesión ---
const cache = new Map();

function cacheKey(table, level, grade, subject) {
  return `${table}:${level}:${grade}:${subject}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  // TTL de 5 minutos
  if (Date.now() - entry.ts > 5 * 60 * 1000) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// --- Mapeo de Atención a la Diversidad → fuentes de datos existentes ---
// El nivel 'ad' no tiene datos propios en la BD; redirigimos a datos de
// primaria (nivel 3, contenido accesible) mapeando cada bloque a la
// asignatura que mejor encaja por contenido.
const AD_SUBJECT_MAP = {
  // Audición y Lenguaje → lengua (vocabulario, fonética, escritura)
  'articulacion':          { level: 'primaria', grade: 3, subject: 'lengua' },
  'vocabulario':           { level: 'primaria', grade: 3, subject: 'lengua' },
  'morfosintaxis':         { level: 'primaria', grade: 3, subject: 'lengua' },
  'conciencia-fonologica': { level: 'primaria', grade: 2, subject: 'lengua' },
  'lectoescritura':        { level: 'primaria', grade: 2, subject: 'lengua' },
  'lectoescritura-adaptada': { level: 'primaria', grade: 1, subject: 'lengua' },
  // Audición y Lenguaje → tutoria / ciencias (comprensión, pragmática)
  'pragmatica':            { level: 'primaria', grade: 3, subject: 'tutoria' },
  'comprension-oral':      { level: 'primaria', grade: 3, subject: 'tutoria' },
  // Pedagogía Terapéutica → tutoria / lengua / ciencias-naturales
  'atencion':              { level: 'primaria', grade: 3, subject: 'ciencias-naturales' },
  'memoria':               { level: 'primaria', grade: 3, subject: 'lengua' },
  'funciones-ejecutivas':  { level: 'primaria', grade: 3, subject: 'ciencias-naturales' },
  'razonamiento':          { level: 'primaria', grade: 3, subject: 'matematicas' },
  'habilidades-sociales':  { level: 'primaria', grade: 3, subject: 'tutoria' },
  'autonomia':             { level: 'primaria', grade: 2, subject: 'tutoria' },
  // Tutoría → tutoría directa
  'tutoria':               { level: 'primaria', grade: 3, subject: 'tutoria' },
};

/**
 * Si el nivel es 'ad', traduce los parámetros a una fuente de datos real.
 * Devuelve { level, grade, subject } resueltos.
 */
function resolveADParams(level, grade, subjectId) {
  if (level !== 'ad') return { level, grade, subject: subjectId };
  const mapping = AD_SUBJECT_MAP[subjectId];
  if (mapping) return { level: mapping.level, grade: mapping.grade, subject: mapping.subject };
  // Fallback genérico si no hay mapeo
  return { level: 'primaria', grade: 3, subject: 'lengua' };
}

/**
 * Obtener datos runner (formato: { categoria: [palabras...] })
 * Usado por: Runner, JuegoMemoria, Clasificador, LluviaDePalabras, ExcavacionSelectiva, SnakePalabras
 */
export async function getRunnerData(level, grade, subjectId) {
  const key = cacheKey('runner', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_runner_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando runner data:', error.message);
    return null;
  }

  // La función RPC devuelve un objeto JSONB; los valores pueden ser strings JSON
  const result = deepParseJSON(data || {});
  setCache(key, result);
  return result;
}

/**
 * Obtener preguntas del rosco (formato: [{id, letra, tipo, definicion, solucion, materia, difficulty}])
 * Usado por: RoscoJuego
 *
 * @param {number} maxDifficulty - Dificultad máxima (1-3). Default: 3 (todas).
 */
export async function getRoscoData(level, grade, subjectId, maxDifficulty = 3) {
  const key = cacheKey('rosco', level, grade, `${subjectId}:${maxDifficulty}`);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_rosco_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject,
    p_max_difficulty: maxDifficulty
  });

  if (error) {
    console.error('Error cargando rosco data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener sets de busca-el-intruso (formato: [{categoria, correctos, intrusos}])
 * Usado por: BuscaElIntruso
 */
export async function getIntrusoData(level, grade, subjectId) {
  const key = cacheKey('intruso', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_intruso_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando intruso data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener parejas (formato: [{id, a, b}])
 * Usado por: ParejasDeCartas
 */
export async function getParejasData(level, grade, subjectId) {
  const key = cacheKey('parejas', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_parejas_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando parejas data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener frases para ordenar (formato: ["frase1", "frase2", ...])
 * Usado por: OrdenaLaFraseJuego
 */
export async function getOrdenaFrasesData(level, grade, subjectId) {
  const key = cacheKey('ordena_frases', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_ordena_frases_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando ordena frases data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener historias para ordenar (formato: [["frase1", "frase2"...], [...]])
 * Usado por: OrdenaLaHistoriaJuego
 */
export async function getOrdenaHistoriasData(level, grade, subjectId) {
  const key = cacheKey('ordena_historias', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_ordena_historias_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando ordena historias data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener frases detective (formato: ["frase1", "frase2", ...])
 * Usado por: DetectiveDePalabrasJuego
 */
export async function getDetectiveData(level, grade, subjectId) {
  const key = cacheKey('detective', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_detective_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando detective data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener textos de comprensión (formato: [{id, titulo, texto, preguntas}])
 * Usado por: ComprensionEscrita, ComprensionOral
 */
export async function getComprensionData(level, grade, subjectId) {
  const key = cacheKey('comprension', level, grade, subjectId);
  const cached = getCached(key);
  if (cached) return cached;

  const r = resolveADParams(level, grade, subjectId);
  const { data, error } = await supabase.rpc('get_comprension_data', {
    p_level: r.level,
    p_grade: parseInt(r.grade),
    p_subject: r.subject
  });

  if (error) {
    console.error('Error cargando comprension data:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener materias por nivel y curso
 * Formato: [{id, nombre, icon}]
 */
export async function getSubjectsFromDB(level, grade) {
  const key = cacheKey('subjects', level, grade, 'all');
  const cached = getCached(key);
  if (cached) return cached;

  const { data, error } = await supabase.rpc('get_subjects', {
    p_level: level,
    p_grade: parseInt(grade)
  });

  if (error) {
    console.error('Error cargando subjects:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Obtener todos los datos de materias (formato original de materias.json)
 * Formato: { eso: { 1: [{id, nombre, icon}], ... }, primaria: { ... } }
 */
export async function getAllSubjects() {
  const cached = getCached('subjects:all:all:all');
  if (cached) return cached;

  const { data, error } = await supabase
    .from('subjects')
    .select('level, grade, subject_id, name, icon')
    .order('level')
    .order('grade')
    .order('subject_id');

  if (error) {
    console.error('Error cargando all subjects:', error.message);
    return {};
  }

  // Reconstruir formato original de materias.json
  const result = {};
  for (const row of data) {
    if (!result[row.level]) result[row.level] = {};
    if (!result[row.level][row.grade]) result[row.level][row.grade] = [];
    result[row.level][row.grade].push({
      id: row.subject_id,
      nombre: row.name,
      icon: row.icon
    });
  }

  setCache('subjects:all:all:all', result);
  return result;
}

/**
 * Obtener contenido especializado de apps (bloques, terminal-retro, etc.)
 * @param {string} appType - Tipo: 'bloques', 'terminal-retro', 'generador-personajes', 'elementos-quimica', 'banco-tutoria'
 * @param {string} level - Nivel (opcional)
 * @param {number} grade - Curso (opcional)
 */
export async function getAppContent(appType, level = null, grade = null) {
  const key = cacheKey('app_content', level || 'any', grade || 'any', appType);
  const cached = getCached(key);
  if (cached) return cached;

  const { data, error } = await supabase.rpc('get_app_content', {
    p_app_type: appType,
    p_level: level,
    p_grade: grade ? parseInt(grade) : null
  });

  if (error) {
    console.error(`Error cargando ${appType} data:`, error.message);
    return null;
  }

  // La función devuelve un array de contenidos JSONB; para la mayoría solo hay uno
  const result = (data && data.length > 0) ? deepParseJSON(data[0]) : null;
  setCache(key, result);
  return result;
}

// --- Utilidad: parsear strings JSON anidados que devuelve Supabase ---
function tryParseJSON(val) {
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return val; }
}

function deepParseJSON(obj) {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(deepParseJSON);
  if (typeof obj === 'string') return tryParseJSON(obj);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepParseJSON(v);
    }
    return out;
  }
  return obj;
}

/**
 * Obtener chistes (formato: ["chiste1", "chiste2", ...])
 * Usado por: Mascot
 */
export async function getJokes() {
  const key = 'jokes:all';
  const cached = getCached(key);
  if (cached) return cached;

  const { data, error } = await supabase.rpc('get_jokes');

  if (error) {
    console.error('Error cargando jokes:', error.message);
    return [];
  }

  const result = deepParseJSON(data || []);
  setCache(key, result);
  return result;
}

/**
 * Limpiar toda la caché (útil tras actualizar datos)
 */
export function clearCache() {
  cache.clear();
}
