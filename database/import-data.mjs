/**
 * Script de importación: JSON → Supabase
 *
 * Uso:
 *   node database/import-data.mjs
 *
 * Requiere variables de entorno:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY   (o SUPABASE_SERVICE_ROLE_KEY para bypasear RLS)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// --- Cargar .env.local automáticamente ---
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile();

// --- Configuración Supabase ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: No se encontraron las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Helpers ---
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function getGradeDirs(levelDir) {
  return fs.readdirSync(levelDir)
    .filter(d => /^\d+$/.test(d) && fs.statSync(path.join(levelDir, d)).isDirectory())
    .map(Number)
    .sort((a, b) => a - b);
}

function getJsonFiles(dir, suffix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(suffix))
    .map(f => ({
      subjectId: f.replace(suffix, ''),
      filePath: path.join(dir, f)
    }));
}

/**
 * Calcula la dificultad de una pregunta del rosco (1-3).
 * Heurística: longitud de la solución + longitud de la definición.
 */
function calcRoscoDifficulty(solution, definition) {
  const solLen = solution.length;
  const defLen = definition.length;
  // Palabras cortas y definiciones cortas = fácil
  if (solLen <= 6 && defLen <= 60) return 1;
  // Palabras largas o definiciones largas = difícil
  if (solLen >= 12 || defLen >= 150) return 3;
  return 2;
}

/**
 * Genera un hash simple para comparar contenido entre archivos.
 */
function contentHash(data) {
  return JSON.stringify(data);
}

// --- Importación por tipo ---

async function importSubjects() {
  console.log('\n📚 Importando materias...');
  const materias = readJSON(path.join(DATA_DIR, 'materias.json'));
  if (!materias) { console.error('  No se encontró materias.json'); return; }

  const rows = [];
  for (const [level, grades] of Object.entries(materias)) {
    for (const [grade, subjects] of Object.entries(grades)) {
      for (const s of subjects) {
        rows.push({
          level,
          grade: parseInt(grade),
          subject_id: s.id,
          name: s.nombre,
          icon: s.icon || null
        });
      }
    }
  }

  const { error } = await supabase.from('subjects').upsert(rows, {
    onConflict: 'level,grade,subject_id'
  });
  if (error) console.error('  Error subjects:', error.message);
  else console.log(`  ✅ ${rows.length} materias importadas`);
}

async function importRunnerData() {
  console.log('\n🏃 Importando datos runner...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    // Agrupar por subject para detectar duplicados entre cursos
    const subjectData = {}; // { subjectId: { hash: { grades: [], categories: {} } } }

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-runner.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!data || typeof data !== 'object') continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    // Generar rows deduplicados
    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const [categoryName, words] of Object.entries(data)) {
          if (!Array.isArray(words)) continue;
          rows.push({
            subject_id: subjectId,
            level,
            grades: g,
            category_name: categoryName,
            words: JSON.stringify(words)
          });
        }
      }
    }
  }

  // Insertar en batches de 500
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('runner_categories').insert(batch);
    if (error) { console.error(`  Error runner batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} categorías runner importadas`);
}

async function importRoscoData() {
  console.log('\n🔤 Importando datos rosco...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-rosco.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const q of data) {
          rows.push({
            letter: (q.letra || '').toUpperCase(),
            type: q.tipo || 'empieza',
            definition: q.definicion,
            solution: q.solucion,
            subject_id: subjectId,
            level,
            grades: g,
            difficulty: calcRoscoDifficulty(q.solucion, q.definicion)
          });
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('rosco_questions').insert(batch);
    if (error) { console.error(`  Error rosco batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} preguntas rosco importadas`);
}

async function importIntrusoData() {
  console.log('\n🔍 Importando datos busca-el-intruso...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-busca-el-intruso.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const item of data) {
          if (item.categoria) {
            rows.push({
              subject_id: subjectId,
              level,
              grades: g,
              category: item.categoria,
              correct_items: JSON.stringify(item.correctos),
              intruder_items: JSON.stringify(item.intrusos)
            });
          }
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('intruso_sets').insert(batch);
    if (error) { console.error(`  Error intruso batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} sets de intruso importados`);
}

async function importParejasData() {
  console.log('\n🃏 Importando datos parejas...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-parejas.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const pair of data) {
          rows.push({
            subject_id: subjectId,
            level,
            grades: g,
            term_a: pair.a,
            term_b: pair.b
          });
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('parejas_items').insert(batch);
    if (error) { console.error(`  Error parejas batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} parejas importadas`);
}

async function importOrdenaFrasesData() {
  console.log('\n📝 Importando datos ordena-frase...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-ordena-frase.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const sentence of data) {
          if (typeof sentence === 'string') {
            rows.push({ subject_id: subjectId, level, grades: g, sentence });
          }
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('ordena_frases').insert(batch);
    if (error) { console.error(`  Error ordena_frases batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} frases importadas`);
}

async function importOrdenaHistoriasData() {
  console.log('\n📖 Importando datos ordena-historia...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-ordena-historia.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const storyArr of data) {
          if (Array.isArray(storyArr)) {
            rows.push({
              subject_id: subjectId,
              level,
              grades: g,
              sentences: JSON.stringify(storyArr)
            });
          }
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('ordena_historias').insert(batch);
    if (error) { console.error(`  Error ordena_historias batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} historias importadas`);
}

async function importDetectiveData() {
  console.log('\n🕵️ Importando datos detective...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-detective-palabras.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const item of data) {
          const sentence = typeof item === 'string' ? item : (item.solucion || '');
          if (sentence) {
            rows.push({ subject_id: subjectId, level, grades: g, sentence });
          }
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('detective_sentences').insert(batch);
    if (error) { console.error(`  Error detective batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} frases detective importadas`);
}

async function importComprensionData() {
  console.log('\n📖 Importando datos comprensión...');
  const rows = [];

  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);

    const subjectData = {};

    for (const grade of grades) {
      const dir = path.join(levelDir, String(grade));
      const files = getJsonFiles(dir, '-comprension.json');

      for (const { subjectId, filePath } of files) {
        const data = readJSON(filePath);
        if (!Array.isArray(data)) continue;

        const hash = contentHash(data);
        if (!subjectData[subjectId]) subjectData[subjectId] = {};
        if (!subjectData[subjectId][hash]) {
          subjectData[subjectId][hash] = { grades: [], data };
        }
        subjectData[subjectId][hash].grades.push(grade);
      }
    }

    for (const [subjectId, hashMap] of Object.entries(subjectData)) {
      for (const { grades: g, data } of Object.values(hashMap)) {
        for (const text of data) {
          rows.push({
            subject_id: subjectId,
            level,
            grades: g,
            title: text.titulo,
            text_content: text.texto,
            questions: JSON.stringify(text.preguntas)
          });
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('comprension_texts').insert(batch);
    if (error) { console.error(`  Error comprension batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} textos de comprensión importados`);
}

async function importSpecializedContent() {
  console.log('\n🔧 Importando contenido especializado...');
  const rows = [];

  // Programación Bloques
  for (const level of ['eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);
    const contentByHash = {};

    for (const grade of grades) {
      const filePath = path.join(levelDir, String(grade), 'programacion-bloques.json');
      const data = readJSON(filePath);
      if (!data) continue;
      const hash = contentHash(data);
      if (!contentByHash[hash]) contentByHash[hash] = { grades: [], data };
      contentByHash[hash].grades.push(grade);
    }

    for (const { grades: g, data } of Object.values(contentByHash)) {
      rows.push({
        app_type: 'bloques',
        subject_id: 'programacion',
        level,
        grades: g,
        content: JSON.stringify(data)
      });
    }
  }

  // Terminal Retro
  for (const level of ['eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);
    const contentByHash = {};

    for (const grade of grades) {
      const filePath = path.join(levelDir, String(grade), 'programacion-terminal-retro.json');
      const data = readJSON(filePath);
      if (!data) continue;
      const hash = contentHash(data);
      if (!contentByHash[hash]) contentByHash[hash] = { grades: [], data };
      contentByHash[hash].grades.push(grade);
    }

    for (const { grades: g, data } of Object.values(contentByHash)) {
      rows.push({
        app_type: 'terminal-retro',
        subject_id: 'programacion',
        level,
        grades: g,
        content: JSON.stringify(data)
      });
    }
  }

  // Generador Personajes
  for (const level of ['primaria', 'eso']) {
    const levelDir = path.join(DATA_DIR, level);
    if (!fs.existsSync(levelDir)) continue;
    const grades = getGradeDirs(levelDir);
    const contentByHash = {};

    for (const grade of grades) {
      const filePath = path.join(levelDir, String(grade), 'generador-personajes.json');
      const data = readJSON(filePath);
      if (!data) continue;
      const hash = contentHash(data);
      if (!contentByHash[hash]) contentByHash[hash] = { grades: [], data };
      contentByHash[hash].grades.push(grade);
    }

    for (const { grades: g, data } of Object.values(contentByHash)) {
      rows.push({
        app_type: 'generador-personajes',
        subject_id: null,
        level,
        grades: g,
        content: JSON.stringify(data)
      });
    }
  }

  // Elementos Química
  const elementosPath = path.join(DATA_DIR, 'quimica', 'elementos_info.json');
  const elementosData = readJSON(elementosPath);
  if (elementosData) {
    rows.push({
      app_type: 'elementos-quimica',
      subject_id: 'fisica',
      level: null,
      grades: null,
      content: JSON.stringify(elementosData)
    });
  }

  // Banco Recursos Tutoría
  const bancoPath = path.join(DATA_DIR, 'bancoRecursosTutoriaBlocks.json');
  const bancoData = readJSON(bancoPath);
  if (bancoData) {
    rows.push({
      app_type: 'banco-tutoria',
      subject_id: 'tutoria',
      level: null,
      grades: null,
      content: JSON.stringify(bancoData)
    });
  }

  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from('app_content').insert(batch);
    if (error) { console.error(`  Error app_content batch ${i}:`, error.message); return; }
  }
  console.log(`  ✅ ${rows.length} contenidos especializados importados`);
}

// --- EJECUCIÓN ---
async function main() {
  console.log('🚀 Iniciando importación de datos a Supabase...');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Data dir: ${DATA_DIR}`);

  await importSubjects();
  await importRunnerData();
  await importRoscoData();
  await importIntrusoData();
  await importParejasData();
  await importOrdenaFrasesData();
  await importOrdenaHistoriasData();
  await importDetectiveData();
  await importComprensionData();
  await importSpecializedContent();

  console.log('\n🎉 Importación completada.');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
