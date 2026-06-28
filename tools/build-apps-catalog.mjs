// tools/build-apps-catalog.mjs
// Genera src/data/appsCatalog.js (descripciones de usuario para el Catálogo público)
// y APPS_INTERNAL.md (ficha interna técnica/pedagógica de cada app) a partir del
// análisis de código producido por el workflow "analiza-apps-eduapps".
//
// Fuente de datos: tools/apps-analysis.json (snapshot versionado). Si no existe, se
// reconstruye leyendo los ficheros *.output del directorio de tareas del workflow
// (pásalo con la variable de entorno TASKS_DIR o como primer argumento).
//
// Uso:
//   node tools/build-apps-catalog.mjs [TASKS_DIR]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW_SNAPSHOT = path.join(ROOT, 'tools', 'apps-analysis.json');

const DEFAULT_TASKS_DIR = 'C:/Users/edtor/AppData/Local/Temp/claude/c--Users-edtor-Desktop-apps-educativas/d8d8d691-58ba-4112-8450-dd0ae63b5246/tasks';
const TASKS_DIR = process.argv[2] || process.env.TASKS_DIR || DEFAULT_TASKS_DIR;

// ---- Mapas estáticos (deterministas) ----------------------------------------

const CATALOG_CATEGORIES = [
  { id: 'palabras', label: 'Juegos de palabras y repaso', emoji: '📚' },
  { id: 'comprension', label: 'Comprensión lectora y oral', emoji: '📖' },
  { id: 'matematicas', label: 'Matemáticas', emoji: '🧮' },
  { id: 'ciencia', label: 'Ciencia y naturaleza', emoji: '🔬' },
  { id: 'programacion', label: 'Programación y robótica', emoji: '🤖' },
  { id: 'tutoria', label: 'Tutoría y bienestar', emoji: '🤝' },
];

const CONCEPT_CATEGORY = {
  // Juegos de palabras y repaso
  'rosco-del-saber': 'palabras', 'ahorcado': 'palabras', 'crucigrama': 'palabras',
  'sopa-de-letras': 'palabras', 'millonario': 'palabras', 'anagramas': 'palabras',
  'criptograma': 'palabras', 'velocidad-respuesta': 'palabras', 'conecta-parejas': 'palabras',
  'dictado-interactivo': 'palabras', 'torre-palabras': 'palabras', 'busca-el-intruso': 'palabras',
  'clasificador': 'palabras', 'juego-memoria': 'palabras', 'runner': 'palabras',
  'nave-palabras': 'palabras', 'snake': 'palabras', 'lluvia-de-palabras': 'palabras',
  'parejas': 'palabras', 'cazapalabras-3d': 'palabras', 'la-fortaleza': 'palabras',
  'excavacion-selectiva': 'palabras', 'ordena-la-frase': 'palabras', 'ordena-la-historia': 'palabras',
  'detective-de-palabras': 'palabras',
  // Comprensión
  'comprension-escrita': 'comprension', 'comprension-oral': 'comprension',
  // Matemáticas
  'ordena-bolas': 'matematicas', 'fracciones-eso': 'matematicas', 'regla-de-tres': 'matematicas',
  'porcentajes-proporciones': 'matematicas', 'rotaciones-grid': 'matematicas',
  'numeros-romanos': 'matematicas', 'mayor-menor': 'matematicas', 'ordena-numeros': 'matematicas',
  'medidas': 'matematicas', 'sumas': 'matematicas', 'restas': 'matematicas',
  'multiplicaciones': 'matematicas', 'divisiones': 'matematicas', 'supermercado-matematico': 'matematicas',
  'laboratorio-funciones-2d': 'matematicas', 'visualizador-3d': 'matematicas',
  // Ciencia y naturaleza
  'laboratorio-fisica': 'ciencia', 'mesa-crafteo': 'ciencia', 'entrenador-tabla': 'ciencia',
  'sistema-solar': 'ciencia', 'celula-animal': 'ciencia', 'celula-vegetal': 'ciencia',
  'infografias-interactivas': 'ciencia',
  // Programación y robótica
  'programacion-bloques': 'programacion', 'misiones-roboticas': 'programacion',
  'laboratorio-robotica': 'programacion', 'terminal-retro': 'programacion',
  // Tutoría y bienestar
  'isla-de-la-calma': 'tutoria', 'generador-personajes-historicos': 'tutoria',
  'banco-recursos-tutoria': 'tutoria',
};

// Familias: conceptKey -> [ [appId, scope] ... ]
const FAMILY_MEMBERS = {
  'numeros-romanos': [
    ['numeros-romanos-3', 'Nivel básico: números romanos del 1 al 20.'],
    ['numeros-romanos-4', 'Nivel intermedio: hasta el 100.'],
    ['numeros-romanos-5', 'Nivel avanzado: hasta el 3999.'],
    ['numeros-romanos-6', 'Nivel experto: hasta 1.000.000 con la raya horizontal.'],
    ['numeros-romanos-eso', 'Versión ESO: hasta 1.000.000 con la raya horizontal.'],
  ],
  'mayor-menor': [
    ['mayor-menor-1', 'Comparar números del 1 al 20.'],
    ['mayor-menor-2', 'Comparar números hasta 100 y sumas sencillas.'],
    ['mayor-menor-3', 'Comparar resultados de las tablas de multiplicar.'],
    ['mayor-menor-4', 'Comparar operaciones combinadas.'],
    ['mayor-menor-5', 'Comparar números decimales.'],
    ['mayor-menor-6', 'Comparar expresiones matemáticas complejas.'],
  ],
  'ordena-numeros': [
    ['ordena-numeros-1', 'Ordenar de menor a mayor hasta el 20.'],
    ['ordena-numeros-2', 'Ordenar números y sumas hasta el 100.'],
    ['ordena-numeros-3', 'Ordenar resultados de las tablas de multiplicar.'],
    ['ordena-numeros-4', 'Ordenar operaciones combinadas.'],
    ['ordena-numeros-5', 'Ordenar números decimales.'],
    ['ordena-numeros-6', 'Ordenar expresiones matemáticas complejas.'],
  ],
  'medidas': [
    ['longitud-comparar', 'Comparar medidas de longitud (mm, cm, m, km…).'],
    ['longitud-ordenar', 'Ordenar medidas de longitud de menor a mayor.'],
    ['masa-comparar', 'Comparar medidas de masa (mg, g, kg…).'],
    ['masa-ordenar', 'Ordenar medidas de masa de menor a mayor.'],
    ['capacidad-comparar', 'Comparar medidas de capacidad (ml, cl, l…).'],
    ['capacidad-ordenar', 'Ordenar medidas de capacidad de menor a mayor.'],
  ],
  'sumas': [
    ['sumas-primaria-1', 'Sumas de dos cifras sin llevadas (1.º de Primaria).'],
    ['sumas-primaria-2-drag', 'Sumas de dos cifras con llevadas (2.º).'],
    ['sumas-primaria-3-drag', 'Sumas de 3 y 4 cifras con llevadas (3.º).'],
    ['sumas-primaria-4-drag', 'Sumas de tres sumandos (4.º).'],
    ['sumas-primaria-5-drag', 'Sumas con decimales (5.º).'],
    ['sumas-primaria-6-drag', 'Sumas de tres sumandos con decimales (6.º).'],
  ],
  'restas': [
    ['restas-primaria-1', 'Restas de dos cifras sin llevadas (1.º).'],
    ['restas-primaria-2', 'Restas de dos cifras con llevadas (2.º).'],
    ['restas-primaria-3', 'Restas de 3 y 4 cifras (3.º).'],
    ['restas-primaria-4', 'Restas con decimales, iniciación (4.º).'],
    ['restas-primaria-5', 'Restas con decimales (5.º).'],
    ['restas-primaria-6', 'Restas a completar: halla el término que falta (6.º).'],
  ],
  'multiplicaciones': [
    ['multiplicaciones-primaria-3', 'Multiplicaciones por una cifra (3.º).'],
    ['multiplicaciones-primaria-4', 'Multiplicaciones por varias cifras (4.º).'],
    ['multiplicaciones-primaria-5', 'Multiplicaciones de varios dígitos (5.º).'],
    ['multiplicaciones-primaria-6', 'Multiplicaciones con decimales (6.º).'],
  ],
  'divisiones': [
    ['divisiones-primaria-4', 'Iniciación a la división (4.º).'],
    ['divisiones-primaria-5', 'Divisores de 2 y 3 cifras (5.º).'],
    ['divisiones-primaria-6', 'Divisiones con decimales (6.º).'],
  ],
  'supermercado-matematico': [
    ['supermercado-matematico-1', 'Sumar precios sencillos (1.º).'],
    ['supermercado-matematico-2', 'Sumar precios con llevadas (2.º).'],
    ['supermercado-matematico-3', 'Multiplicar cantidades por precios (3.º).'],
    ['supermercado-matematico-4', 'Operar con precios decimales (4.º).'],
    ['supermercado-matematico-5', 'Calcular el cambio (5.º).'],
    ['supermercado-matematico-6', 'Aplicar descuentos (6.º).'],
  ],
};

const EXPECTED_KEYS = Object.keys(CONCEPT_CATEGORY);

// ---- Lectura / parseo de las salidas del workflow ---------------------------

function extractArray(raw) {
  let cur = raw;
  for (let i = 0; i < 6; i++) {
    if (Array.isArray(cur)) return cur;
    if (typeof cur === 'string') {
      const t = cur.trim();
      if (!t) return null;
      try { cur = JSON.parse(t); continue; } catch { return null; }
    }
    if (cur && typeof cur === 'object') {
      if (Array.isArray(cur.result)) return cur.result;
      if (typeof cur.result === 'string') { cur = cur.result; continue; }
      return null;
    }
    return null;
  }
  return null;
}

function loadFromTasksDir(dir) {
  const merged = new Map();
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.output'))
      .map(f => path.join(dir, f))
      .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs); // antiguos primero -> reintentos ganan
  } catch (e) {
    console.error(`No se pudo leer TASKS_DIR (${dir}): ${e.message}`);
    return merged;
  }
  for (const f of files) {
    const arr = extractArray(fs.readFileSync(f, 'utf8'));
    if (!Array.isArray(arr)) continue;
    for (const obj of arr) {
      if (obj && obj.key) merged.set(obj.key, obj);
    }
  }
  return merged;
}

function loadData() {
  if (fs.existsSync(RAW_SNAPSHOT)) {
    const arr = JSON.parse(fs.readFileSync(RAW_SNAPSHOT, 'utf8'));
    const m = new Map();
    for (const o of arr) if (o && o.key) m.set(o.key, o);
    // completar con tasks dir si faltan claves
    if ([...EXPECTED_KEYS].some(k => !m.has(k))) {
      const extra = loadFromTasksDir(TASKS_DIR);
      for (const [k, v] of extra) if (!m.has(k)) m.set(k, v);
    }
    return m;
  }
  return loadFromTasksDir(TASKS_DIR);
}

// ---- Generación de ficheros -------------------------------------------------

function buildCatalogJs(byKey) {
  const concepts = {};
  for (const key of EXPECTED_KEYS) {
    const o = byKey.get(key);
    if (!o) continue;
    const u = o.user || {};
    concepts[key] = {
      key,
      name: o.name || key,
      emoji: o.emoji || '',
      queEs: u.queEs || '',
      porQueRelevante: u.porQueRelevante || '',
      comoFunciona: u.comoFunciona || '',
      instrucciones: Array.isArray(u.instrucciones) ? u.instrucciones : [],
      modos: Array.isArray(u.modos) ? u.modos : [],
      consejos: Array.isArray(u.consejos) ? u.consejos : [],
    };
  }

  const idToConcept = {};
  const variantScope = {};
  for (const key of EXPECTED_KEYS) {
    if (FAMILY_MEMBERS[key]) {
      for (const [appId, scope] of FAMILY_MEMBERS[key]) {
        idToConcept[appId] = key;
        variantScope[appId] = scope;
      }
    } else {
      idToConcept[key] = key; // standalone: id === key
    }
  }

  const header = `// src/data/appsCatalog.js
// AUTOGENERADO por tools/build-apps-catalog.mjs — NO editar a mano.
// Descripciones de usuario de cada app para el Catálogo público (/catalogo).
`;

  return header +
    `\nexport const CATALOG_CATEGORIES = ${JSON.stringify(CATALOG_CATEGORIES, null, 2)};\n` +
    `\nexport const CONCEPT_CATEGORY = ${JSON.stringify(CONCEPT_CATEGORY, null, 2)};\n` +
    `\nexport const APP_ID_TO_CONCEPT = ${JSON.stringify(idToConcept, null, 2)};\n` +
    `\nexport const APP_VARIANT_SCOPE = ${JSON.stringify(variantScope, null, 2)};\n` +
    `\nexport const APP_CONCEPTS = ${JSON.stringify(concepts, null, 2)};\n` +
    `\nexport function getConceptForApp(appId) {
  const key = APP_ID_TO_CONCEPT[appId] || appId;
  return APP_CONCEPTS[key] || null;
}
`;
}

function mdSection(o) {
  const i = o.internal || {};
  const u = o.user || {};
  const list = (arr) => (arr && arr.length) ? arr.map(x => `- ${x}`).join('\n') : '_—_';
  const modos = (u.modos && u.modos.length) ? u.modos.map(m => `- **${m.nombre}**: ${m.descripcion}`).join('\n') : '_Sin modos diferenciados._';
  const pasos = (u.instrucciones && u.instrucciones.length) ? u.instrucciones.map((p, n) => `${n + 1}. ${p}`).join('\n') : '_—_';
  return `## ${o.emoji || ''} ${o.name} \`(${o.key})\`

### Ficha interna (técnica / pedagógica)

**Resumen.** ${i.resumen || ''}

**Software.** ${i.software || ''}

**Jugabilidad.** ${i.jugabilidad || ''}

**Educativo.** ${i.educativo || ''}

**Datos.** ${i.datos || ''}

**Integración.** ${i.integracion || ''}

**Ideas de mejora.**
${list(i.ideasMejora)}

### Ficha de usuario

**¿Qué es?** ${u.queEs || ''}

**¿Por qué es relevante?** ${u.porQueRelevante || ''}

**¿Cómo funciona?** ${u.comoFunciona || ''}

**Cómo se juega.**
${pasos}

**Modos.**
${modos}

**Consejos.**
${list(u.consejos)}

---
`;
}

function buildInternalMd(byKey) {
  const ordered = EXPECTED_KEYS.filter(k => byKey.has(k));
  const byCat = {};
  for (const k of ordered) {
    const cat = CONCEPT_CATEGORY[k] || 'otros';
    (byCat[cat] ||= []).push(byKey.get(k));
  }
  let out = `# APPS_INTERNAL.md — Ficha técnica y pedagógica de cada app de EduApps

> Documento de referencia AUTOGENERADO (tools/build-apps-catalog.mjs) a partir del
> análisis del código fuente de cada app. Sirve para entender el funcionamiento interno
> (software + jugabilidad + pedagogía) y planificar mejoras/ampliaciones. La versión
> "de usuario" de estas fichas se publica en la web en /catalogo.

Total de apps analizadas: **${ordered.length}** de ${EXPECTED_KEYS.length} previstas.

`;
  for (const cat of CATALOG_CATEGORIES) {
    const items = byCat[cat.id];
    if (!items || !items.length) continue;
    out += `\n# ${cat.emoji} ${cat.label}\n\n`;
    for (const o of items) out += mdSection(o) + '\n';
  }
  return out;
}

// Síntesis editorial de patrones que se repiten en las ideasMejora de muchas apps.
const TRANSVERSAL_MD = `## 🎯 Temas transversales (afectan a varias apps a la vez)

Estos patrones aparecen en el análisis de muchas apps; abordarlos de forma común
tiene más impacto que app por app.

### 1. Unificar el cálculo de nota y el tracking
Varias apps calculan la nota /10 "inline" en lugar de usar el helper estándar
\`Math.round(correct/total*100)/10\`, no envían \`durationSeconds\` real, o fijan un
\`maxScore\` heurístico que distorsiona el ranking. Conviene una pasada que homogenice
\`onGameComplete\` (nota, durationSeconds, maxScore coherente) en todas. *Apps citadas:*
Rosco, Velocidad, Runner, entre otras.

### 2. Selección de dificultad en pantalla previa (no en pestañas durante la partida)
CLAUDE.md exige elegir el modo ANTES de jugar; algunas apps aún usan tabs que reinician
la partida al cambiarlas a mitad. *Apps citadas:* Velocidad. Revisar el resto.

### 3. El modo examen no debería ser un toggle desactivable
En apps donde "examen" es un interruptor que el alumno puede dejar en práctica, las
partidas pueden no contar como intento de tarea. Forzar examen cuando corresponde.
*Apps citadas:* Runner.

### 4. Duelos 1 vs 1 pendientes
Apps con formato idóneo para duelo que aún no lo tienen (componente \`<Nombre>Duel.jsx\`
+ \`duelableApps.js\` + \`DuelChatBar\`). *Candidatas:* Velocidad, Runner, La Fortaleza
(motor ya preparado), y revisar más en cada ficha.

### 5. Instrucciones y material de estudio
Hay \`InstructionsModal\` desactualizados respecto al código real o ausentes, y apps de
vocabulario sin "material de estudio" (glosario por letra, patrón de Anagramas/RoscoUI).
*Apps citadas:* Velocidad (modal desactualizado), Runner (sin modal estándar).

### 6. Feedback sensorial y accesibilidad coherentes
Confeti/sonidos de acierto-fallo inconsistentes entre apps; oportunidades de TTS opcional
y modos de más tiempo para accesibilidad. Definir un estándar y aplicarlo.

> El detalle por app está debajo. Es un volcado de las "ideas de mejora" detectadas al
> leer el código de cada una; priorízalas según impacto y esfuerzo.

`;

function buildMejorasMd(byKey) {
  const ordered = EXPECTED_KEYS.filter(k => byKey.has(k));
  const byCat = {};
  let totalIdeas = 0;
  for (const k of ordered) {
    const o = byKey.get(k);
    const ideas = (o.internal && o.internal.ideasMejora) || [];
    totalIdeas += ideas.length;
    const cat = CONCEPT_CATEGORY[k] || 'otros';
    (byCat[cat] ||= []).push(o);
  }
  let out = `# MEJORAS_APPS.md — Backlog de mejoras y ampliaciones de las apps

> AUTOGENERADO por tools/build-apps-catalog.mjs a partir del análisis de código de cada
> app (campo \`ideasMejora\` de APPS_INTERNAL.md) + síntesis de patrones transversales.
> Es un backlog para implementar en el futuro; no es un compromiso ni un orden de prioridad.

Apps con propuestas: **${ordered.length}** · Ideas registradas: **${totalIdeas}**.

${TRANSVERSAL_MD}
`;
  for (const cat of CATALOG_CATEGORIES) {
    const items = byCat[cat.id];
    if (!items || !items.length) continue;
    out += `\n## ${cat.emoji} ${cat.label}\n\n`;
    for (const o of items) {
      const ideas = (o.internal && o.internal.ideasMejora) || [];
      out += `### ${o.emoji || ''} ${o.name} \`(${o.key})\`\n`;
      out += ideas.length ? ideas.map(x => `- [ ] ${x}`).join('\n') + '\n\n' : '_Sin propuestas registradas._\n\n';
    }
  }
  return out;
}

// ---- Main -------------------------------------------------------------------

const byKey = loadData();

const missing = EXPECTED_KEYS.filter(k => !byKey.has(k));
const present = EXPECTED_KEYS.filter(k => byKey.has(k));
console.log(`Conceptos encontrados: ${present.length}/${EXPECTED_KEYS.length}`);
if (missing.length) console.log(`FALTAN: ${missing.join(', ')}`);

// snapshot versionado (solo claves esperadas, en orden)
const snapshot = present.map(k => byKey.get(k));
fs.writeFileSync(RAW_SNAPSHOT, JSON.stringify(snapshot, null, 2), 'utf8');

fs.writeFileSync(path.join(ROOT, 'src', 'data', 'appsCatalog.js'), buildCatalogJs(byKey), 'utf8');
fs.writeFileSync(path.join(ROOT, 'APPS_INTERNAL.md'), buildInternalMd(byKey), 'utf8');
fs.writeFileSync(path.join(ROOT, 'MEJORAS_APPS.md'), buildMejorasMd(byKey), 'utf8');

console.log('Generados: src/data/appsCatalog.js, APPS_INTERNAL.md, MEJORAS_APPS.md, tools/apps-analysis.json');
if (missing.length) process.exitCode = 2;
