// src/apps/sistema-solar/model/questions.js
// Generadores de preguntas de las misiones (puros: reciben el nivel 1–5 y un
// rng con semilla). Los datos salen de planetFacts/interiors/riddles, así que
// las respuestas siempre son coherentes con la ficha del planeta.
//
// Formas de pregunta:
//   { type: 'versus', prompt, options: [idA, idB], answer: id, values, explain }
//   { type: 'choice', prompt, options: [texto…], answer: índice, explain, visual? }
//   { type: 'planet', prompt, clues?, options: [ids], answer: id, explain }
import {
  FACTS, PLANET_IDS, AU_KM, LIGHT_KM_S, fmt, fmtSmart, fmtSeconds, fmtTravel, fmtDays, fmtHours, bodyName, theName, TheName,
} from './planetFacts';
import { INTERIORS, layersFor } from './interiors';
import { RIDDLES } from './riddles';
import { shuffle, sample, pick } from './rng';
import { questionCount } from './missions';

/* ───────────────────────── ¿Más o menos? ───────────────────────── */

export const METRICS = [
  { id: 'size', minTier: 1, prompt: '¿Cuál es más grande?', value: (f) => f.diameterKm, show: (f) => `${fmt(f.diameterKm)} km de diámetro`, word: 'más grande' },
  { id: 'distance', minTier: 1, prompt: '¿Cuál está más lejos del Sol?', value: (f) => f.au, show: (f) => `${fmtSmart(f.au)} UA (${fmt(f.distMkm)} millones de km)`, word: 'más lejos' },
  { id: 'temp', minTier: 1, prompt: '¿Cuál es más caliente?', value: (f) => f.tempMeanC, show: (f) => `${fmt(f.tempMeanC)} °C de media`, word: 'más caliente', additive: true },
  { id: 'moons', minTier: 1, prompt: '¿Cuál tiene más lunas?', value: (f) => f.moons, show: (f) => `${fmt(f.moons)} ${f.moons === 1 ? 'luna' : 'lunas'}`, word: 'más lunas', additive: true },
  { id: 'gravity', minTier: 2, prompt: '¿En cuál pesarías más?', value: (f) => f.gravity, show: (f) => `${fmtSmart(f.gravity)} m/s² (${fmtSmart(f.gravity / 9.8)} g)`, word: 'más gravedad' },
  { id: 'year', minTier: 2, prompt: '¿En cuál dura más un año?', value: (f) => f.orbitDays, show: (f) => `año de ${fmtDays(f.orbitDays)}`, word: 'un año más largo' },
  { id: 'spin', minTier: 3, prompt: '¿Cuál tarda más en girar sobre sí mismo?', value: (f) => Math.abs(f.rotationHours), show: (f) => `rotación de ${fmtHours(f.rotationHours)}${f.rotationHours < 0 ? ' (retrógrada)' : ''}`, word: 'una rotación más lenta' },
  { id: 'mass', minTier: 3, prompt: '¿Cuál tiene más masa?', value: (f) => f.massEarth, show: (f) => `${fmtSmart(f.massEarth)} masas terrestres`, word: 'más masa' },
  { id: 'density', minTier: 4, prompt: '¿Cuál es más denso?', value: (f) => f.density, show: (f) => `${fmtSmart(f.density)} g/cm³`, word: 'más densidad' },
  { id: 'orbitSpeed', minTier: 4, prompt: '¿Cuál viaja más rápido en su órbita?', value: (f) => f.orbitKmS, show: (f) => `${fmtSmart(f.orbitKmS)} km/s`, word: 'más velocidad orbital' },
  { id: 'escape', minTier: 5, prompt: '¿De cuál cuesta más escapar (velocidad de escape)?', value: (f) => f.escapeKmS, show: (f) => `${fmtSmart(f.escapeKmS)} km/s`, word: 'más velocidad de escape' },
];

// Cuánta diferencia mínima exigimos según el nivel (más fino en cursos altos)
const RATIO_BY_TIER = { 1: 2.2, 2: 1.7, 3: 1.35, 4: 1.15, 5: 1.08 };
const DIFF_BY_TIER = { 1: 150, 2: 100, 3: 60, 4: 35, 5: 20 }; // para métricas aditivas (°C, lunas)
const MOON_DIFF_BY_TIER = { 1: 10, 2: 5, 3: 2, 4: 1, 5: 1 };

// Notas para las trampas típicas
const TRAPS = {
  'temp:mercury:venus': 'Venus está más lejos del Sol, pero su atmósfera de CO₂ atrapa el calor (efecto invernadero).',
  'mass:neptune:uranus': 'Neptuno es algo más pequeño que Urano, pero tiene más masa: es más denso.',
  'density:earth:mercury': 'Están muy igualados: Mercurio tiene un núcleo enorme, pero la Tierra está más comprimida por su propia gravedad.',
  'gravity:earth:saturn': 'Saturno tiene 95 veces la masa terrestre, pero es tan grande que en sus nubes la gravedad es parecida a la de la Tierra.',
  'gravity:saturn:venus': 'Saturno es enorme, pero su gravedad en lo alto de las nubes es casi como la de Venus.',
  'spin:venus': 'Venus gira tan despacio, y al revés, que tarda más en rotar que en dar la vuelta al Sol.',
  'moons:jupiter:saturn': 'En 2025 se confirmaron 128 lunas nuevas de Saturno: ya tiene muchas más que Júpiter.',
};

function trapNote(metricId, a, b) {
  const key = `${metricId}:${[a, b].sort().join(':')}`;
  return TRAPS[key] || TRAPS[`${metricId}:${a}`] || TRAPS[`${metricId}:${b}`] || '';
}

export function isClearPair(metric, a, b, tier) {
  const va = metric.value(FACTS[a]);
  const vb = metric.value(FACTS[b]);
  if (va == null || vb == null || va === vb) return false;
  if (metric.id === 'moons') return Math.abs(va - vb) >= MOON_DIFF_BY_TIER[tier];
  if (metric.additive) return Math.abs(va - vb) >= DIFF_BY_TIER[tier];
  const hi = Math.max(va, vb);
  const lo = Math.min(va, vb);
  return lo > 0 && hi / lo >= RATIO_BY_TIER[tier];
}

function versusExplain(metric, a, b, winner) {
  const fa = FACTS[a];
  const fb = FACTS[b];
  const loser = winner === a ? b : a;
  let ratio = '';
  if (!metric.additive) {
    const r = metric.value(FACTS[winner]) / metric.value(FACTS[loser]);
    if (r >= 1.5) ratio = ` → unas ${r >= 10 ? fmt(Math.round(r)) : fmt(r, 1).replace(/,0$/, '')} veces mayor`;
  }
  const trap = trapNote(metric.id, a, b);
  return `${fa.name}: ${metric.show(fa)} · ${fb.name}: ${metric.show(fb)}${ratio}.${trap ? ` ${trap}` : ''}`;
}

export function makeVersusQuestion(metric, a, b) {
  const va = metric.value(FACTS[a]);
  const vb = metric.value(FACTS[b]);
  const answer = va > vb ? a : b;
  return {
    type: 'versus',
    metric: metric.id,
    prompt: metric.prompt,
    options: [a, b],
    answer,
    values: { [a]: metric.show(FACTS[a]), [b]: metric.show(FACTS[b]) },
    raw: { [a]: va, [b]: vb },
    explain: versusExplain(metric, a, b, answer),
  };
}

export function makeVersusQuestions(tier, rng, n = questionCount('versus', tier)) {
  const metrics = METRICS.filter((m) => m.minTier <= tier);
  const used = new Set();
  const out = [];
  let guard = 0;
  let order = shuffle(metrics, rng);
  while (out.length < n && guard++ < 500) {
    if (!order.length) order = shuffle(metrics, rng);
    const metric = order.pop();
    const pairs = [];
    for (let i = 0; i < PLANET_IDS.length; i++) {
      for (let j = i + 1; j < PLANET_IDS.length; j++) {
        const a = PLANET_IDS[i];
        const b = PLANET_IDS[j];
        if (isClearPair(metric, a, b, tier) && !used.has(`${metric.id}:${a}:${b}`)) pairs.push([a, b]);
      }
    }
    if (!pairs.length) continue;
    const [a, b] = shuffle(pick(pairs, rng), rng);
    used.add(`${metric.id}:${[a, b].sort().join(':')}`);
    used.add(`${metric.id}:${a}:${b}`);
    used.add(`${metric.id}:${b}:${a}`);
    out.push({ id: `vs-${out.length}`, ...makeVersusQuestion(metric, a, b) });
  }
  return out;
}

/* ───────────────────────── Plan de vuelo ───────────────────────── */

const lightTime = (id) => (FACTS[id].au * AU_KM) / LIGHT_KM_S;

// Opciones: el valor correcto + otros 3 cuerpos (todos reales y distintos al formatear)
function choiceFromBodies(correctId, pool, formatter, rng, count = 4) {
  const others = shuffle(pool.filter((id) => id !== correctId), rng);
  const labels = [formatter(correctId)];
  for (const id of others) {
    const l = formatter(id);
    if (!labels.includes(l)) labels.push(l);
    if (labels.length >= count) break;
  }
  const options = shuffle(labels, rng);
  return { options, answer: options.indexOf(labels[0]) };
}

const VEHICLES = {
  plane: { name: 'un avión', kmh: 900 },
  probe: { name: 'una sonda como New Horizons', kmh: 58000 },
};

const TRIP_TYPES = [
  {
    id: 'lightCompare', minTier: 1, maxTier: 2,
    make(rng) {
      const id = pick(PLANET_IDS.filter((p) => p !== 'earth'), rng);
      const farther = FACTS[id].au > 1;
      const labels = ['Más de 8 minutos', 'Menos de 8 minutos', 'Lo mismo: 8 minutos'];
      const options = shuffle(labels, rng);
      return {
        prompt: `La luz del Sol tarda unos 8 minutos en llegar a la Tierra. ¿Cuánto tardará en llegar a ${theName(id)}?`,
        options, answer: options.indexOf(farther ? labels[0] : labels[1]),
        explain: `${TheName(id)} está ${farther ? 'más lejos' : 'más cerca'} del Sol que la Tierra, así que su luz tarda ${farther ? 'más' : 'menos'}: unos ${fmtSeconds(lightTime(id))}.`,
        visual: { kind: 'route', from: 'sun', to: id, label: `Luz: ${fmtSeconds(lightTime(id))}` },
      };
    },
  },
  {
    id: 'farthest', minTier: 1, maxTier: 3,
    make(rng) {
      const ids = sample(PLANET_IDS, 4, rng);
      const closest = rng() < 0.5;
      const sorted = [...ids].sort((a, b) => FACTS[a].au - FACTS[b].au);
      const answer = closest ? sorted[0] : sorted[sorted.length - 1];
      return {
        type: 'planet',
        prompt: closest ? '¿Cuál de estos planetas está más cerca del Sol?' : '¿Cuál de estos planetas está más lejos del Sol?',
        options: ids, answer,
        explain: `Orden desde el Sol: ${sorted.map((id) => `${bodyName(id)} (${fmtSmart(FACTS[id].au)} UA)`).join(' → ')}.`,
      };
    },
  },
  {
    id: 'light', minTier: 2, maxTier: 5,
    make(rng) {
      const id = pick(PLANET_IDS, rng);
      const { options, answer } = choiceFromBodies(id, PLANET_IDS, (p) => fmtSeconds(lightTime(p)), rng);
      return {
        prompt: `La luz viaja a casi 300.000 km/s. ¿Cuánto tarda la luz del Sol en llegar a ${theName(id)}?`,
        options, answer,
        explain: `${TheName(id)} está a ${fmt(FACTS[id].distMkm)} millones de km: ${fmt(FACTS[id].distMkm * 1e6)} km ÷ 300.000 km/s ≈ ${fmtSeconds(lightTime(id))}.`,
        visual: { kind: 'route', from: 'sun', to: id, label: `Luz: ${fmtSeconds(lightTime(id))}` },
      };
    },
  },
  {
    id: 'au', minTier: 3, maxTier: 5,
    make(rng) {
      const id = pick(PLANET_IDS.filter((p) => p !== 'earth'), rng);
      const { options, answer } = choiceFromBodies(id, PLANET_IDS.filter((p) => p !== 'earth'), (p) => `${fmtSmart(FACTS[p].au)} UA`, rng);
      return {
        prompt: `Una unidad astronómica (UA) es la distancia media Tierra–Sol: unos 150 millones de km. ¿A cuántas UA está ${theName(id)} del Sol?`,
        options, answer,
        explain: `${fmt(FACTS[id].distMkm)} millones de km ÷ 149,6 millones de km ≈ ${fmtSmart(FACTS[id].au)} UA.`,
        visual: { kind: 'route', from: 'sun', to: id, label: `${fmtSmart(FACTS[id].au)} UA` },
      };
    },
  },
  {
    id: 'travel', minTier: 2, maxTier: 5,
    make(rng, tier) {
      const v = tier <= 2 ? VEHICLES.plane : VEHICLES.probe;
      const pool = PLANET_IDS.filter((p) => p !== 'earth');
      const id = pick(pool, rng);
      const hours = (p) => (Math.abs(FACTS[p].au - 1) * AU_KM) / v.kmh;
      const { options, answer } = choiceFromBodies(id, pool, (p) => fmtTravel(hours(p)), rng);
      const dist = Math.abs(FACTS[id].au - 1) * AU_KM;
      return {
        prompt: `Viajando en ${v.name} a ${fmt(v.kmh)} km/h en línea recta desde la órbita de la Tierra hasta la de ${theName(id)} (unos ${fmt(dist / 1e6)} millones de km), ¿cuánto tardarías?`,
        options, answer,
        explain: `Tiempo = distancia ÷ velocidad = ${fmt(dist / 1e6)} millones de km ÷ ${fmt(v.kmh)} km/h ≈ ${fmtTravel(hours(id))}. (Las naves reales siguen órbitas curvas y aprovechan la gravedad de los planetas.)`,
        visual: { kind: 'route', from: 'earth', to: id, label: fmtTravel(hours(id)) },
      };
    },
  },
  {
    id: 'kepler', minTier: 5, maxTier: 5,
    make(rng) {
      const a = pick([4, 9, 16], rng);
      const T = Math.sqrt(a ** 3);
      const labels = [T, a, a * a, Math.sqrt(a)].map((x) => `${fmtSmart(x)} años`);
      const options = shuffle([...new Set(labels)], rng);
      return {
        prompt: `Tercera ley de Kepler: T² = a³ (T en años, a en UA). Un asteroide orbita a ${a} UA del Sol. ¿Cuánto dura su año?`,
        options, answer: options.indexOf(labels[0]),
        explain: `T = √(a³) = √(${a}³) = √${fmt(a ** 3)} = ${fmtSmart(T)} años. Cuanto más lejos, más lenta y larga es la órbita.`,
      };
    },
  },
  {
    id: 'keplerPlanet', minTier: 4, maxTier: 5,
    make(rng) {
      const id = pick(['mars', 'jupiter', 'saturn', 'uranus', 'neptune'], rng);
      const T = (p) => Math.sqrt(FACTS[p].au ** 3);
      const { options, answer } = choiceFromBodies(id, ['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'venus'], (p) => `${fmtSmart(T(p))} años`, rng);
      return {
        prompt: `Con la 3ª ley de Kepler (T² = a³, en años y UA): ${bodyName(id)} está a ${fmtSmart(FACTS[id].au)} UA. ¿Cuánto dura su año?`,
        options, answer,
        explain: `T = √(${fmtSmart(FACTS[id].au)}³) ≈ ${fmtSmart(T(id))} años terrestres (medido: ${fmtDays(FACTS[id].orbitDays)}).`,
      };
    },
  },
  {
    id: 'escape', minTier: 5, maxTier: 5,
    make(rng) {
      const id = pick(PLANET_IDS, rng);
      const { options, answer } = choiceFromBodies(id, PLANET_IDS, (p) => `${fmtSmart(FACTS[p].escapeKmS)} km/s`, rng);
      return {
        prompt: `¿Qué velocidad mínima necesita un cohete para escapar de la gravedad de ${theName(id)} (velocidad de escape)?`,
        options, answer,
        explain: `v = √(2GM/R) ≈ ${fmtSmart(FACTS[id].escapeKmS)} km/s. Depende de la masa y del radio del planeta.`,
      };
    },
  },
];

export function makeTripQuestions(tier, rng, n = questionCount('viaje', tier)) {
  const types = TRIP_TYPES.filter((t) => tier >= t.minTier && tier <= t.maxTier);
  const out = [];
  const prompts = new Set();
  let bag = [];
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    if (!bag.length) bag = shuffle(types, rng);
    const t = bag.pop();
    const q = t.make(rng, tier);
    if (prompts.has(q.prompt)) continue;
    prompts.add(q.prompt);
    out.push({ id: `trip-${out.length}`, type: q.type || 'choice', trip: t.id, ...q });
  }
  return out;
}

/* ───────────────────────── ¿Qué planeta soy? ───────────────────────── */

export const RIDDLE_BODIES = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

export function makeRiddles(tier, rng, n = questionCount('adivina', tier)) {
  const ids = sample(RIDDLE_BODIES, n, rng);
  return ids.map((id, i) => ({ id: `riddle-${i}`, answer: id, clues: RIDDLES[id][tier <= 2 ? 'basic' : 'adv'] }));
}

// Puntos según las pistas vistas (acierto a la primera)
export const RIDDLE_POINTS = [300, 200, 120];

/* ───────────────────────── Viaje al interior ───────────────────────── */

export function layerBodiesFor(tier) {
  if (tier <= 2) return ['earth', 'sun'];
  if (tier === 3) return ['earth', 'sun', 'mars', 'jupiter', 'moon'];
  return ['earth', 'sun', 'mars', 'jupiter', 'moon', 'mercury', 'venus', 'saturn', 'uranus', 'neptune'];
}

const CLUE_PROB = { 1: 0, 2: 0.3, 3: 0.45, 4: 0.6, 5: 0.8 };

const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// ¿La descripción repite una palabra propia del nombre de la capa? (sería regalar la respuesta)
export function clueGivesAway(layer, siblings = []) {
  const clue = norm(layer.clue || '');
  const others = siblings.filter((l) => l.id !== layer.id).map((l) => norm(l.name));
  return norm(layer.name).split(/[^a-zñ]+/).filter((w) => w.length >= 5)
    .some((w) => clue.includes(w) && !others.some((o) => o.includes(w)));
}

export function makeLayerQuestions(tier, rng, n = questionCount('capas', tier)) {
  const bodies = layerBodiesFor(tier);
  const all = [];
  for (const b of bodies) for (const l of layersFor(b, tier)) all.push({ bodyId: b, layerId: l.id, layer: l });
  // Siempre algo de la Tierra; después, al azar
  const earth = shuffle(all.filter((x) => x.bodyId === 'earth'), rng).slice(0, Math.min(tier <= 2 ? 3 : 2, n));
  const rest = sample(all.filter((x) => !earth.includes(x)), n - earth.length, rng);
  const chosen = [...earth, ...rest];
  // agrupadas por cuerpo (menos cambios de escena), en el orden de la lista
  chosen.sort((a, b) => bodies.indexOf(a.bodyId) - bodies.indexOf(b.bodyId));
  return chosen.map((x, i) => {
    const byClue = rng() < CLUE_PROB[tier] && !!x.layer.clue && !clueGivesAway(x.layer, layersFor(x.bodyId, tier));
    return {
      id: `layer-${i}`,
      bodyId: x.bodyId,
      answer: x.layerId,
      byClue,
      prompt: byClue ? x.layer.clue : `Toca: ${x.layer.name}`,
      explain: tier <= 2 ? x.layer.basic : x.layer.desc,
      name: x.layer.name,
    };
  });
}

/* ───────────────────────── Ordena ───────────────────────── */

export const ORDER_CRITERIA = {
  distance: { id: 'distance', title: 'Por distancia al Sol', from: 'Más cerca del Sol', to: 'Más lejos', value: (f) => f.au, asc: true, show: (f) => `${fmtSmart(f.au)} UA` },
  size: { id: 'size', title: 'Por tamaño (diámetro)', from: 'Más grande', to: 'Más pequeño', value: (f) => f.diameterKm, asc: false, show: (f) => `${fmt(f.diameterKm)} km` },
  mass: { id: 'mass', title: 'Por masa', from: 'Más masa', to: 'Menos masa', value: (f) => f.massEarth, asc: false, show: (f) => `${fmtSmart(f.massEarth)} M⊕` },
  density: { id: 'density', title: 'Por densidad', from: 'Más denso', to: 'Menos denso', value: (f) => f.density, asc: false, show: (f) => `${fmtSmart(f.density)} g/cm³` },
};

export function orderRoundsFor(tier) {
  if (tier <= 1) return ['distance'];
  if (tier <= 3) return ['distance', 'size'];
  if (tier === 4) return ['distance', 'size', 'mass'];
  return ['distance', 'mass', 'density'];
}

export function correctOrder(criterionId, ids = PLANET_IDS) {
  const c = ORDER_CRITERIA[criterionId];
  return [...ids].sort((a, b) => (c.asc ? 1 : -1) * (c.value(FACTS[a]) - c.value(FACTS[b])));
}

// Barajado que nunca empieza ya resuelto
export function scrambled(ids, rng) {
  let s = shuffle(ids, rng);
  let guard = 0;
  while (s.every((id, i) => id === ids[i]) && guard++ < 10) s = shuffle(ids, rng);
  return s;
}

/* ───────────────────────── Gran examen ───────────────────────── */

function riddleAsPlanet(tier, rng, avoid) {
  const id = pick(RIDDLE_BODIES.filter((b) => !avoid.has(b)), rng);
  avoid.add(id);
  const clues = RIDDLES[id][tier <= 2 ? 'basic' : 'adv'];
  const options = shuffle([id, ...sample(RIDDLE_BODIES.filter((b) => b !== id), 3, rng)], rng);
  return {
    type: 'planet', prompt: '¿Qué astro es?', clues: clues.slice(0, 2), options, answer: id,
    explain: `Es ${theName(id)}: ${clues[2]}`,
  };
}

function layerAsChoice(tier, rng) {
  const bodies = layerBodiesFor(tier).filter((b) => INTERIORS[b]);
  const bodyId = pick(bodies, rng);
  const layers = layersFor(bodyId, tier);
  const fair = layers.filter((l) => !clueGivesAway(l, layers));
  const layer = pick(fair.length ? fair : layers, rng);
  const pool = shuffle(layers.filter((l) => l.id !== layer.id).map((l) => l.name), rng);
  const labels = [...new Set([layer.name, ...pool])].slice(0, 4);
  const options = shuffle(labels, rng);
  return {
    type: 'choice',
    prompt: `${bodyName(bodyId)}: ¿qué capa es? «${layer.clue}»`,
    options, answer: options.indexOf(layer.name),
    explain: `${layer.name}: ${tier <= 2 ? layer.basic : layer.desc}`,
  };
}

function orderAsPlanet(rng) {
  const i = Math.floor(rng() * (PLANET_IDS.length - 1));
  const id = PLANET_IDS[i];
  const next = PLANET_IDS[i + 1];
  const options = shuffle([next, ...sample(PLANET_IDS.filter((p) => p !== next && p !== id), 3, rng)], rng);
  return {
    type: 'planet', prompt: `Alejándote del Sol, ¿qué planeta viene justo después de ${theName(id)}?`,
    options, answer: next,
    explain: `Orden: ${PLANET_IDS.map(bodyName).join(' → ')}.`,
  };
}

export function makeExamQuestions(tier, rng) {
  const avoid = new Set();
  const qs = [
    ...makeVersusQuestions(tier, rng, 3),
    ...makeTripQuestions(tier, rng, 2),
    riddleAsPlanet(tier, rng, avoid),
    riddleAsPlanet(tier, rng, avoid),
    layerAsChoice(tier, rng),
    layerAsChoice(tier, rng),
    orderAsPlanet(rng),
  ];
  return shuffle(qs, rng).map((q, i) => ({ ...q, id: `exam-${i}` }));
}

// ¿Es correcta esta respuesta? (índice para 'choice', id para el resto)
export const isCorrect = (q, value) => value === q.answer;
