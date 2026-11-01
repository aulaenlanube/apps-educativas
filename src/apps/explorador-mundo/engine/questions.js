// Generadores de preguntas de los minijuegos del Explorador del Mundo.
// Funciones puras: reciben un contexto { lv, region, difficulty, rng, geo } y
// devuelven preguntas con el formato del motor de mapas (src/apps/_shared/geo/QuizPlay.jsx):
//   kind 'choice'         subject + options + answer[keys]
//   kind 'locate'         tocar un país (target = iso)
//   kind 'locate-group'   tocar un continente (target = continente)
//   kind 'locate-feature' tocar un accidente del relieve (target = id)
//
// geo (de world.js): { locatable(iso), hasShape(iso), neighbors(iso), hasFeature(id) }
import { COUNTRIES, BY_ISO, CONTINENTS, INHABITED, displayName, largestCity } from '../data/countries';
import { CITIES, OCEANS, SIMILAR_FLAGS, IDENTICAL_FLAGS } from '../data/extras';
import { RELIEF, RELIEF_TYPES, RELIEF_POOLS } from '../data/relief';
import { LEVELS, countryPool, gamesFor } from './config';

export const ROUND_SIZE = 10;
export const OPTION_COUNT = { easy: 3, medium: 4, exam: 4 };
export const LOCATE_ATTEMPTS = { easy: 3, medium: 2, exam: 1 };

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const isAll = (region) => !region || region === 'all';

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pickOne = (list, rng) => list[Math.floor(rng() * list.length)];

const SIMILAR = (() => {
  const m = {};
  for (const group of SIMILAR_FLAGS) {
    for (const c of group) m[c] = [...new Set([...(m[c] || []), ...group.filter((x) => x !== c)])];
  }
  return m;
})();

// Ficha del país que se muestra al responder.
const cardOf = (k) => ({ flag: k.c, title: k.name, sub: `Capital: ${k.cap} · ${CONTINENTS[k.cont].name}` });

// Opciones de continente con su silueta.
const continentOptions = () => INHABITED.map((c) => ({ key: c, label: CONTINENTS[c].name, glyph: c, color: CONTINENTS[c].color, deep: CONTINENTS[c].deep }));

// Elige un objetivo que no haya salido en la ronda (si quedan).
function chooseTarget(list, ctx, keyFn = (k) => k.c) {
  const fresh = list.filter((x) => !ctx.used.has(keyFn(x)));
  const target = pickOne(fresh.length ? fresh : list, ctx.rng);
  ctx.used.add(keyFn(target));
  return target;
}

// Distractores de país. Fácil: de otros continentes (se descartan antes).
// Medio y Examen: primero los "parecidos" (banderas), luego la misma subregión
// y el mismo continente. clash(a, b): pares que no pueden salir juntos.
function countryDistractors(target, ctx, n, { similar = [], exclude = [], candidates = ctx.candidates, clash } = {}) {
  const banned = new Set([target.c, ...exclude]);
  const cand = candidates.filter((k) => !banned.has(k.c));
  const out = [];
  const take = (list) => {
    for (const k of shuffle(list, ctx.rng)) {
      if (out.length >= n) return;
      if (out.includes(k)) continue;
      if (clash && [target, ...out].some((o) => clash(o.c, k.c))) continue;
      out.push(k);
    }
  };
  if (ctx.difficulty === 'easy') {
    take(cand.filter((k) => k.cont !== target.cont));
  } else {
    const maxT = LEVELS[ctx.lv].tier + 1;
    take(similar.map((c) => BY_ISO[c]).filter((k) => k && !banned.has(k.c) && k.t <= maxT));
    take(cand.filter((k) => k.sub === target.sub));
    take(cand.filter((k) => k.cont === target.cont));
  }
  take(cand);
  if (out.length < n) take(COUNTRIES.filter((k) => !banned.has(k.c) && k.t <= 3));
  return out.slice(0, n);
}

const countryOption = (k) => ({ key: k.c, label: displayName(k), flag: k.c });

/* ───────── ¿Dónde está? ───────── */

function genDonde(ctx) {
  const list = ctx.candidates.filter((k) => ctx.geo.locatable(k.c));
  const t = chooseTarget(list, ctx);
  return {
    game: 'donde',
    kind: 'locate',
    prompt: `¿Dónde está ${t.name}?`,
    target: t.c,
    attempts: LOCATE_ATTEMPTS[ctx.difficulty],
    // Fácil: el mapa se acerca al continente; con región elegida, a la región.
    view: ctx.difficulty === 'easy' ? t.cont : !isAll(ctx.region) ? ctx.region : 'world',
    answerLabel: t.name,
    card: cardOf(t),
  };
}

/* ───────── Siluetas ───────── */

function genSiluetas(ctx) {
  let list = ctx.candidates.filter((k) => ctx.geo.hasShape(k.c));
  if (list.length < 4) list = countryPool(ctx.lv, ctx.region, { maxTier: 5 }).filter((k) => ctx.geo.hasShape(k.c));
  const t = chooseTarget(list, ctx);
  const others = countryDistractors(t, ctx, OPTION_COUNT[ctx.difficulty] - 1, { candidates: list });
  return {
    game: 'siluetas',
    kind: 'choice',
    prompt: '¿Qué país tiene esta forma?',
    subject: { type: 'shape', key: t.c, name: t.name },
    hint: `Está en ${CONTINENTS[t.cont].name}`,
    options: shuffle([t, ...others], ctx.rng).map(countryOption),
    answer: [t.c],
    answerLabel: t.name,
    card: cardOf(t),
  };
}

/* ───────── Banderas ───────── */

const twinFlags = (a, b) => IDENTICAL_FLAGS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function genBanderas(ctx) {
  const t = chooseTarget(ctx.candidates, ctx);
  const others = countryDistractors(t, ctx, OPTION_COUNT[ctx.difficulty] - 1, { similar: SIMILAR[t.c] || [], clash: twinFlags });
  const opts = shuffle([t, ...others], ctx.rng);
  const reverse = ctx.rng() < 0.4;
  const base = { game: 'banderas', kind: 'choice', hint: `Está en ${CONTINENTS[t.cont].name}`, answer: [t.c], answerLabel: t.name, card: cardOf(t) };
  return reverse
    ? {
      ...base,
      variant: 'flags',
      prompt: `¿Cuál es la bandera de ${t.name}?`,
      subject: { type: 'card', flag: t.c, hideFlag: true, title: t.name },
      options: opts.map(countryOption),
    }
    : {
      ...base,
      prompt: '¿De qué país es esta bandera?',
      subject: { type: 'flag', flag: t.c, name: t.name },
      options: opts.map(countryOption),
    };
}

/* ───────── Capitales ───────── */

// "Luxemburgo → Luxemburgo": preguntar al revés no tendría gracia.
const capitalNamesCountry = (k) => norm(k.cap).includes(norm(k.name)) || norm(k.name).includes(norm(k.cap));

function genCapitales(ctx) {
  const pool = countryPool(ctx.lv, ctx.region, { maxTier: LEVELS[ctx.lv].capTier, filter: (k) => !k.noCapQ });
  const t = chooseTarget(pool, ctx);
  const n = OPTION_COUNT[ctx.difficulty];
  const reverse = ctx.lv >= 3 && !capitalNamesCountry(t) && ctx.rng() < 0.35;

  if (reverse) {
    const others = countryDistractors(t, ctx, n - 1, { candidates: pool });
    return {
      game: 'capitales',
      kind: 'choice',
      prompt: `¿De qué país es capital ${t.cap}?`,
      subject: { type: 'text', text: t.cap, icon: 'capital', sub: 'Es una capital…' },
      hint: `Está en ${CONTINENTS[t.cont].name}`,
      options: shuffle([t, ...others], ctx.rng).map(countryOption),
      answer: [t.c],
      answerLabel: t.name,
      explain: t.capNote || null,
      card: cardOf(t),
    };
  }

  // Trampa en Medio y Examen: la ciudad más poblada cuando no es la capital.
  const banned = new Set([norm(t.cap), ...(t.capAlt || []).map(norm)]);
  const caps = [];
  const add = (name) => {
    if (!name || banned.has(norm(name)) || caps.some((c) => norm(c) === norm(name))) return;
    caps.push(name);
  };
  const big = largestCity(t);
  const trap = ctx.difficulty !== 'easy' && big && big !== t.cap ? big : null;
  if (trap) add(trap);
  for (const k of countryDistractors(t, ctx, n + 2, { candidates: pool })) add(k.cap);
  const options = shuffle([t.cap, ...caps.slice(0, n - 1)], ctx.rng).map((c) => ({ key: c, label: c }));
  return {
    game: 'capitales',
    kind: 'choice',
    prompt: `¿Cuál es la capital de ${t.name}?`,
    subject: { type: 'card', flag: t.c, title: t.name },
    hint: `Empieza por «${t.cap[0]}»`,
    options,
    answer: [t.cap],
    answerLabel: t.cap,
    explain: t.capNote || (trap && options.some((o) => o.key === trap) ? `${trap} es la ciudad más poblada, pero la capital es ${t.cap}.` : null),
    card: cardOf(t),
  };
}

/* ───────── Continentes y océanos ───────── */

const CONTINENT_TARGETS = ['europa', 'asia', 'africa', 'america', 'oceania', 'europa', 'asia', 'africa', 'america', 'oceania', 'antartida'];

function genContinentes(ctx) {
  const r = ctx.rng();
  const mix = ctx.lv <= 2 ? [0.4, 0.75] : [0.5, 0.7];

  if (r < mix[0]) {
    const t = chooseTarget(countryPool(ctx.lv, 'all'), ctx);
    const both = [t.cont, t.cont2].filter(Boolean);
    return {
      game: 'continentes',
      kind: 'choice',
      variant: 'glyphs',
      prompt: `¿En qué continente está ${t.name}?`,
      // Los pequeños ven el país marcado en el mapa; los mayores, solo nombre y bandera.
      subject: ctx.lv <= 2 ? { type: 'map', key: t.c } : { type: 'card', flag: t.c, title: t.name },
      options: continentOptions(),
      answer: both,
      answerLabel: both.map((c) => CONTINENTS[c].name).join(' y '),
      explain: t.cont2 ? `${t.name} está entre ${CONTINENTS[t.cont].name} y ${CONTINENTS[t.cont2].name}: valen los dos.` : null,
      card: cardOf(t),
    };
  }

  if (r < mix[1]) {
    const c = chooseTarget(CONTINENT_TARGETS, ctx, (x) => `cont:${x}`);
    return {
      game: 'continentes',
      kind: 'locate-group',
      prompt: `Toca ${c === 'antartida' ? 'la Antártida' : CONTINENTS[c].name} en el mapa`,
      target: c,
      view: 'full',
      attempts: LOCATE_ATTEMPTS[ctx.difficulty],
      answerLabel: CONTINENTS[c].name,
    };
  }

  const o = chooseTarget(OCEANS, ctx, (x) => `ocean:${x.id}`);
  return {
    game: 'continentes',
    kind: 'choice',
    prompt: '¿Qué océano está señalado en el mapa?',
    subject: { type: 'point', key: o.id },
    options: OCEANS.map((x) => ({ key: x.id, label: x.name })),
    answer: [o.id],
    answerLabel: `el ${o.full}`,
  };
}

/* ───────── Relieve ───────── */

const capFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const reliefCard = (r) => ({ title: r.name, sub: `${capFirst(RELIEF_TYPES[r.type].one)} · ${CONTINENTS[r.cont].name}` });

export function reliefPool(lv, region, geo) {
  const has = (r) => geo.hasFeature(r.id) && (isAll(region) || r.cont === region);
  const pool = RELIEF.filter((r) => r.t <= (LEVELS[lv].reliefTier || 1) && has(r));
  return pool.length >= 6 ? pool : RELIEF.filter(has);
}

function genRelieve(ctx) {
  const pool = reliefPool(ctx.lv, ctx.region, ctx.geo);
  const t = chooseTarget(pool, ctx, (r) => `relief:${r.id}`);
  const group = RELIEF_POOLS[t.type];
  const same = pool.filter((r) => group.includes(r.type));
  const sameAll = RELIEF.filter((r) => group.includes(r.type) && ctx.geo.hasFeature(r.id));
  const roll = ctx.rng();
  const base = { game: 'relieve', answerLabel: t.name, explain: t.fact, card: reliefCard(t) };

  if (roll < 0.45) {
    // En Fácil el mapa se acerca al continente y solo se ven sus elementos.
    let shown = ctx.difficulty === 'easy' ? same.filter((r) => r.cont === t.cont) : same;
    if (shown.length < 3) shown = same.length >= 3 ? same : sameAll.filter((r) => r.cont === t.cont || same.includes(r));
    if (shown.length < 3) shown = sameAll;
    return {
      ...base,
      kind: 'locate-feature',
      prompt: `Toca ${t.art} en el mapa`,
      target: t.id,
      featurePool: shown.map((r) => r.id),
      attempts: LOCATE_ATTEMPTS[ctx.difficulty],
      view: ctx.difficulty === 'easy' ? t.cont : !isAll(ctx.region) ? ctx.region : 'world',
    };
  }

  if (roll < 0.8 || t.type === 'sea') {
    const n = OPTION_COUNT[ctx.difficulty] - 1;
    const cand = (same.length > n ? same : sameAll).filter((r) => r.id !== t.id);
    const near = cand.filter((r) => r.cont === t.cont);
    const far = cand.filter((r) => r.cont !== t.cont);
    const ordered = ctx.difficulty === 'easy' ? [...shuffle(far, ctx.rng), ...shuffle(near, ctx.rng)] : [...shuffle(near, ctx.rng), ...shuffle(far, ctx.rng)];
    return {
      ...base,
      kind: 'choice',
      prompt: RELIEF_TYPES[t.type].question,
      subject: { type: 'feature', key: t.id },
      hint: `Está en ${CONTINENTS[t.cont].name}`,
      options: shuffle([t, ...ordered.slice(0, n)], ctx.rng).map((r) => ({ key: r.id, label: r.short })),
      answer: [t.id],
    };
  }

  return {
    ...base,
    kind: 'choice',
    variant: 'glyphs',
    prompt: `¿En qué continente está ${t.art}?`,
    subject: { type: 'text', text: t.name, icon: ['river', 'lake', 'sea'].includes(t.type) ? 'river' : 'mountain' },
    options: continentOptions(),
    answer: [t.cont],
    answerLabel: CONTINENTS[t.cont].name,
  };
}

/* ───────── Grandes ciudades ───────── */

const citiesOf = (c) => CITIES.filter((ci) => ci.c === c);

function genCiudades(ctx) {
  const maxT = LEVELS[ctx.lv].cityTier || 2;
  const inRegion = (c) => isAll(ctx.region) || BY_ISO[c].cont === ctx.region;
  const cities = CITIES.filter((ci) => ci.t <= maxT && inRegion(ci.c));
  const largestPool = countryPool(ctx.lv, ctx.region)
    .filter((k) => largestCity(k) && (k.city || citiesOf(k.c).length >= 2));
  const n = OPTION_COUNT[ctx.difficulty];

  if ((ctx.rng() < 0.5 && cities.length) || !largestPool.length) {
    const ci = chooseTarget(cities.length ? cities : CITIES.filter((x) => x.t <= 2), ctx, (x) => `city:${x.name}`);
    const t = BY_ISO[ci.c];
    const others = countryDistractors(t, ctx, n - 1, { exclude: ci.notWith });
    const isLargest = largestCity(t) === ci.name;
    return {
      game: 'ciudades',
      kind: 'choice',
      prompt: `¿En qué país está ${ci.name}?`,
      subject: { type: 'city', text: ci.name },
      hint: `Está en ${CONTINENTS[t.cont].name}`,
      options: shuffle([t, ...others], ctx.rng).map(countryOption),
      answer: [t.c],
      answerLabel: t.name,
      explain: isLargest
        ? `Es la ciudad más poblada de ${t.name}, pero la capital es ${t.cap}.`
        : `${ci.name} está en ${t.name}, cuya capital es ${t.cap}.`,
      card: cardOf(t),
    };
  }

  // Más probable un país "con trampa" (capital ≠ ciudad más poblada).
  const traps = largestPool.filter((k) => k.city);
  const list = traps.length && ctx.rng() < 0.65 ? traps : largestPool;
  const t = chooseTarget(list, ctx, (k) => `largest:${k.c}`);
  const correct = largestCity(t);
  const opts = [];
  const add = (name) => {
    if (name && norm(name) !== norm(correct) && !opts.some((o) => norm(o) === norm(name))) opts.push(name);
  };
  if (t.city) add(t.cap);
  shuffle(citiesOf(t.c), ctx.rng).forEach((ci) => add(ci.name));
  for (const k of countryDistractors(t, ctx, n + 2)) add(k.cap);
  return {
    game: 'ciudades',
    kind: 'choice',
    prompt: `¿Cuál es la ciudad más poblada de ${t.name}?`,
    subject: { type: 'card', flag: t.c, title: t.name },
    options: shuffle([correct, ...opts.slice(0, n - 1)], ctx.rng).map((c) => ({ key: c, label: c })),
    answer: [correct],
    answerLabel: correct,
    explain: t.city
      ? `La capital es ${t.cap}, pero la ciudad más poblada es ${correct}.`
      : `${correct} es a la vez la capital y la ciudad más poblada.`,
    card: cardOf(t),
  };
}

/* ───────── Fronteras ───────── */

function neighborsOf(ctx, k) {
  return [...(ctx.geo.neighbors(k.c) || [])].map((c) => BY_ISO[c]).filter(Boolean);
}

function genVecinos(ctx) {
  const maxT = LEVELS[ctx.lv].tier;
  const list = ctx.candidates.filter((k) => neighborsOf(ctx, k).some((x) => x.cont === k.cont));
  const t = chooseTarget(list.length ? list : countryPool(ctx.lv, 'all').filter((k) => neighborsOf(ctx, k).length), ctx);
  const all = neighborsOf(ctx, t);
  const same = all.filter((x) => x.cont === t.cont);
  const known = same.filter((x) => x.t <= maxT);
  const correct = pickOne(known.length ? known : same.length ? same : all, ctx.rng);
  const nb = new Set(all.map((x) => x.c));
  // Solo países con fronteras terrestres: una isla se descartaría sin pensar.
  const far = COUNTRIES.filter((k) => k.cont === t.cont && k.c !== t.c && !nb.has(k.c) && k.t <= Math.max(3, maxT)
    && neighborsOf(ctx, k).length > 0);
  // Fácil: distractores lejanos; Medio y Examen: de la misma subregión (cerca, pero sin frontera).
  const near = far.filter((k) => k.sub === t.sub);
  const away = far.filter((k) => k.sub !== t.sub);
  const ordered = ctx.difficulty === 'easy' ? [...shuffle(away, ctx.rng), ...shuffle(near, ctx.rng)] : [...shuffle(near, ctx.rng), ...shuffle(away, ctx.rng)];
  const others = ordered.slice(0, OPTION_COUNT[ctx.difficulty] - 1);
  const names = all.map((x) => x.name).sort((a, b) => a.localeCompare(b, 'es'));
  const list2 = names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
  return {
    game: 'vecinos',
    kind: 'choice',
    prompt: `¿Qué país tiene frontera con ${t.name}?`,
    // Los microestados (Andorra, San Marino…) no tienen silueta reconocible: ficha con bandera.
    subject: ctx.geo.hasShape(t.c)
      ? { type: 'shape', key: t.c, name: t.name, flag: t.c, showName: true, tone: 'amber' }
      : { type: 'card', flag: t.c, title: t.name },
    options: shuffle([correct, ...others], ctx.rng).map(countryOption),
    answer: [correct.c],
    highlight: t.c,
    answerLabel: correct.name,
    explain: `${t.name} limita con ${list2}.`,
    card: cardOf(correct),
  };
}

const GENERATORS = {
  donde: genDonde,
  siluetas: genSiluetas,
  banderas: genBanderas,
  capitales: genCapitales,
  continentes: genContinentes,
  relieve: genRelieve,
  ciudades: genCiudades,
  vecinos: genVecinos,
};

// Examen: reparte las preguntas entre los minijuegos del curso sin repetir el
// mismo dos veces seguidas.
export function examSequence(gameIds, n, rng = Math.random) {
  const seq = [];
  let bag = [];
  while (seq.length < n) {
    if (!bag.length) bag = shuffle(gameIds, rng);
    let i = bag.findIndex((id) => id !== seq[seq.length - 1]);
    if (i < 0) i = 0;
    seq.push(bag.splice(i, 1)[0]);
  }
  return seq;
}

// Ronda de n preguntas de un minijuego, o de examen ('exam': mezcla de todos).
// El relieve solo entra en el examen si sus datos están cargados.
export function buildRound({ lv, region = 'all', difficulty, geo, rng = Math.random }, gameId, n = ROUND_SIZE) {
  const ctx = { lv, region, difficulty, geo, rng, used: new Set(), candidates: countryPool(lv, region) };
  const examGames = gamesFor(lv).map((g) => g.id).filter((id) => id !== 'relieve' || geo.hasFeature(RELIEF[0].id));
  const ids = gameId === 'exam' ? examSequence(examGames, n, rng) : Array(n).fill(gameId);
  return ids.map((id, i) => ({ ...GENERATORS[id](ctx), n: i }));
}

export const isCorrectChoice = (q, key) => q.answer.includes(key);
