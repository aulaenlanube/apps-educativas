// Generadores de preguntas del Explorador de España. Funciones puras: reciben
// { lv, difficulty, rng, geo } y devuelven preguntas con el formato del motor
// de mapas (src/apps/_shared/geo/QuizPlay.jsx). Capas del mapa: 'ccaa'
// (comunidades, clave = id) y 'prov' (provincias, clave = 'p' + INE).
//
// geo (de spain.js): { neighbors(key, layer) → iterable, hasFeature(id) }
import {
  CCAA, CCAA_BY_ID, PROVINCES, provKey, provincesOf, ccaaShort, ccaaFlag,
} from '../data/spain';
import { RIVERS, RANGES, SEAS, ISLANDS, VERTIENTES, RELIEF_TYPES } from '../data/relief';
import { LEVELS, ccaaPool, gamesFor } from './config';
import { shuffle, examSequence } from '../../explorador-mundo/engine/questions';

export const ROUND_SIZE = 10;
export const OPTION_COUNT = { easy: 3, medium: 4, exam: 4 };
export const LOCATE_ATTEMPTS = { easy: 3, medium: 2, exam: 1 };

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const pickOne = (list, rng) => list[Math.floor(rng() * list.length)];
const capFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const realProvinces = PROVINCES.filter((p) => !p.autonomous);
const multiCcaa = CCAA.filter((c) => provincesOf(c.id).length > 1);

const ccaaCard = (c) => ({ flag: ccaaFlag(c), title: c.name, sub: `Capital: ${c.cap}` });
const provCard = (p) => {
  const c = CCAA_BY_ID[p.ccaa];
  return { flag: ccaaFlag(c), title: p.autonomous ? p.name : `Provincia de ${p.name}`, sub: p.autonomous ? 'Ciudad autónoma' : `${ccaaShort(c)} · capital: ${p.cap}` };
};
const ccaaOption = (c) => ({ key: c.id, label: ccaaShort(c), flag: ccaaFlag(c) });
const provOption = (p) => ({ key: provKey(p), label: p.name });

function chooseTarget(list, ctx, keyFn) {
  const fresh = list.filter((x) => !ctx.used.has(keyFn(x)));
  const target = pickOne(fresh.length ? fresh : list, ctx.rng);
  ctx.used.add(keyFn(target));
  return target;
}

// Distractores de comunidad: en Fácil, de otra zona; en Medio y Examen, primero
// las vecinas (las que más se confunden) y luego las de la misma zona.
function ccaaDistractors(target, ctx, n, pool = ccaaPool(ctx.lv)) {
  const cand = pool.filter((c) => c.id !== target.id);
  const nb = new Set(ctx.geo.neighbors(target.id, 'ccaa'));
  const out = [];
  const take = (list) => {
    for (const c of shuffle(list, ctx.rng)) {
      if (out.length >= n) return;
      if (!out.includes(c)) out.push(c);
    }
  };
  if (ctx.difficulty === 'easy') take(cand.filter((c) => c.zone !== target.zone && !nb.has(c.id)));
  else {
    take(cand.filter((c) => nb.has(c.id)));
    take(cand.filter((c) => c.zone === target.zone));
  }
  take(cand);
  return out.slice(0, n);
}

function provDistractors(target, ctx, n) {
  const cand = realProvinces.filter((p) => p.ine !== target.ine);
  const nb = new Set(ctx.geo.neighbors(provKey(target), 'prov'));
  const out = [];
  const take = (list) => {
    for (const p of shuffle(list, ctx.rng)) {
      if (out.length >= n) return;
      if (!out.includes(p)) out.push(p);
    }
  };
  if (ctx.difficulty === 'easy') take(cand.filter((p) => p.ccaa !== target.ccaa && !nb.has(provKey(p))));
  else {
    take(cand.filter((p) => nb.has(provKey(p))));
    take(cand.filter((p) => p.ccaa === target.ccaa));
  }
  take(cand);
  return out.slice(0, n);
}

const wantsProvince = (ctx) => ctx.rng() < LEVELS[ctx.lv].provShare;

/* ───────── ¿Dónde está? ───────── */

function genDonde(ctx) {
  const easy = ctx.difficulty === 'easy';
  if (wantsProvince(ctx)) {
    const p = chooseTarget(PROVINCES, ctx, (x) => provKey(x));
    return {
      game: 'donde',
      kind: 'locate',
      layer: 'prov',
      prompt: p.autonomous ? `¿Dónde está ${p.name}?` : `¿Dónde está la provincia de ${p.name}?`,
      target: provKey(p),
      attempts: LOCATE_ATTEMPTS[ctx.difficulty],
      // Fácil: comunidades coloreadas y el mapa acercado a su zona (acercarlo a
      // su comunidad delataría las uniprovinciales).
      view: easy && !p.autonomous ? `z-${CCAA_BY_ID[p.ccaa].zone}` : 'world',
      colorBy: easy ? 'own' : 'uniform',
      answerLabel: p.name,
      card: provCard(p),
    };
  }
  const c = chooseTarget(ccaaPool(ctx.lv), ctx, (x) => x.id);
  return {
    game: 'donde',
    kind: 'locate',
    layer: 'ccaa',
    prompt: `¿Dónde está ${c.name}?`,
    target: c.id,
    attempts: LOCATE_ATTEMPTS[ctx.difficulty],
    view: 'world',
    colorBy: 'uniform',
    answerLabel: c.name,
    card: ccaaCard(c),
  };
}

/* ───────── Siluetas ───────── */

function genSiluetas(ctx) {
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  if (ctx.lv >= 4 && wantsProvince(ctx)) {
    const p = chooseTarget(realProvinces, ctx, (x) => provKey(x));
    return {
      game: 'siluetas',
      kind: 'choice',
      prompt: '¿Qué provincia tiene esta forma?',
      subject: { type: 'shape', key: provKey(p), layer: 'prov', name: p.name },
      hint: `Está en ${ccaaShort(CCAA_BY_ID[p.ccaa])}`,
      options: shuffle([p, ...provDistractors(p, ctx, n)], ctx.rng).map(provOption),
      answer: [provKey(p)],
      answerLabel: p.name,
      card: provCard(p),
    };
  }
  const pool = CCAA.filter((c) => !c.autonomous);
  const c = chooseTarget(pool, ctx, (x) => x.id);
  return {
    game: 'siluetas',
    kind: 'choice',
    prompt: '¿Qué comunidad autónoma tiene esta forma?',
    subject: { type: 'shape', key: c.id, layer: 'ccaa', name: c.name },
    hint: `Su capital es ${c.cap}`,
    options: shuffle([c, ...ccaaDistractors(c, ctx, n, pool)], ctx.rng).map(ccaaOption),
    answer: [c.id],
    answerLabel: c.name,
    card: ccaaCard(c),
  };
}

/* ───────── Banderas ───────── */

function genBanderas(ctx) {
  const pool = ccaaPool(ctx.lv);
  const c = chooseTarget(pool, ctx, (x) => x.id);
  const opts = shuffle([c, ...ccaaDistractors(c, ctx, OPTION_COUNT[ctx.difficulty] - 1, pool)], ctx.rng);
  const base = { game: 'banderas', kind: 'choice', answer: [c.id], answerLabel: c.name, card: ccaaCard(c), hint: `Su capital es ${c.cap}` };
  return ctx.rng() < 0.4
    ? { ...base, variant: 'flags', prompt: `¿Cuál es la bandera de ${c.name}?`, subject: { type: 'card', flag: ccaaFlag(c), hideFlag: true, title: c.name }, options: opts.map(ccaaOption) }
    : { ...base, prompt: '¿De qué comunidad es esta bandera?', subject: { type: 'flag', flag: ccaaFlag(c), name: c.name }, options: opts.map(ccaaOption) };
}

/* ───────── Capitales ───────── */

function capitalOptions(correct, extras, n) {
  const out = [];
  const add = (name) => {
    if (name && norm(name) !== norm(correct) && !out.some((o) => norm(o) === norm(name))) out.push(name);
  };
  extras.forEach(add);
  return [correct, ...out.slice(0, n - 1)];
}

function genCapitales(ctx) {
  const n = OPTION_COUNT[ctx.difficulty];
  const L = LEVELS[ctx.lv];
  const provQ = PROVINCES.filter((p) => p.capQ);
  if (L.capitals >= 2 && ctx.rng() < 0.3) {
    const p = chooseTarget(provQ, ctx, (x) => `cap:${provKey(x)}`);
    const sameCcaa = provincesOf(p.ccaa).filter((x) => x.ine !== p.ine).map((x) => x.cap);
    const others = provDistractors(p, ctx, n + 2).map((x) => x.cap);
    const traps = ctx.difficulty !== 'easy' && p.trap ? [p.trap] : [];
    return {
      game: 'capitales',
      kind: 'choice',
      prompt: `¿Cuál es la capital de la provincia de ${p.name}?`,
      subject: { type: 'card', flag: ccaaFlag(CCAA_BY_ID[p.ccaa]), title: p.name, sub: `Provincia de ${ccaaShort(CCAA_BY_ID[p.ccaa])}` },
      hint: `Empieza por «${p.cap[0]}»`,
      options: shuffle(capitalOptions(p.cap, [...traps, ...shuffle(sameCcaa, ctx.rng), ...others], n), ctx.rng).map((x) => ({ key: x, label: x })),
      answer: [p.cap],
      answerLabel: p.cap,
      explain: p.trap ? `${p.trap} es la ciudad más poblada de la provincia, pero la capital es ${p.cap}.` : null,
      card: provCard(p),
    };
  }

  const pool = CCAA.filter((c) => !c.autonomous);
  const c = chooseTarget(pool, ctx, (x) => `cap:${x.id}`);
  const nameInCap = norm(c.cap).includes(norm(ccaaShort(c))) || norm(ccaaShort(c)).includes(norm(c.cap));
  if (ctx.lv >= 3 && !nameInCap && c.id !== 'cn' && ctx.rng() < 0.35) {
    return {
      game: 'capitales',
      kind: 'choice',
      prompt: `¿De qué comunidad es capital ${c.cap}?`,
      subject: { type: 'text', text: c.cap, icon: 'capital', sub: 'Es una capital autonómica…' },
      options: shuffle([c, ...ccaaDistractors(c, ctx, n - 1, pool)], ctx.rng).map(ccaaOption),
      answer: [c.id],
      answerLabel: c.name,
      explain: c.capNote || null,
      card: ccaaCard(c),
    };
  }
  // Trampa en Medio y Examen: la ciudad que se confunde con la capital.
  const traps = ctx.difficulty !== 'easy' && c.trap ? [c.trap] : [];
  const provCaps = provincesOf(c.id).map((p) => p.cap);
  const others = ccaaDistractors(c, ctx, n + 2, pool).map((x) => x.cap);
  const options = shuffle(capitalOptions(c.cap, [...traps, ...shuffle(provCaps, ctx.rng), ...others], n), ctx.rng);
  return {
    game: 'capitales',
    kind: 'choice',
    prompt: `¿Cuál es la capital de ${c.name}?`,
    subject: { type: 'card', flag: ccaaFlag(c), title: c.name },
    hint: `Empieza por «${c.cap[0]}»`,
    options: options.map((x) => ({ key: x, label: x })),
    answer: [c.cap],
    answerLabel: c.cap,
    explain: c.capNote || (c.trap && options.includes(c.trap) ? `${c.trap} no es la capital: la capital es ${c.cap}.` : null),
    card: ccaaCard(c),
  };
}

/* ───────── Provincias ───────── */

const ccaaShapeOption = (c) => ({ key: c.id, label: ccaaShort(c), shape: c.id, layer: 'ccaa', color: c.color });

function genProvincias(ctx) {
  const n = OPTION_COUNT[ctx.difficulty];
  const r = ctx.rng();
  if (r < 0.5) {
    // Provincias de comunidades con varias (en las uniprovinciales el nombre lo delata).
    const pool = realProvinces.filter((p) => provincesOf(p.ccaa).length > 1);
    const p = chooseTarget(pool, ctx, (x) => `prov:${provKey(x)}`);
    const c = CCAA_BY_ID[p.ccaa];
    return {
      game: 'provincias',
      kind: 'choice',
      variant: 'glyphs',
      prompt: `¿A qué comunidad pertenece la provincia de ${p.name}?`,
      subject: { type: 'map', key: provKey(p), layer: 'prov' },
      options: shuffle([c, ...ccaaDistractors(c, ctx, n - 1, CCAA.filter((x) => !x.autonomous))], ctx.rng).map(ccaaShapeOption),
      answer: [c.id],
      answerLabel: c.name,
      explain: `${c.name} tiene ${provincesOf(c.id).length} provincias: ${provincesOf(c.id).map((x) => x.name).join(', ')}.`,
      card: provCard(p),
    };
  }
  if (r < 0.8) {
    const c = chooseTarget(multiCcaa, ctx, (x) => `inccaa:${x.id}`);
    const right = pickOne(provincesOf(c.id), ctx.rng);
    // Distractores de fuera: de comunidades vecinas (Medio y Examen) o lejanas (Fácil).
    const nbC = new Set(ctx.geo.neighbors(c.id, 'ccaa'));
    const outside = realProvinces.filter((p) => p.ccaa !== c.id);
    const near = shuffle(outside.filter((p) => nbC.has(p.ccaa)), ctx.rng);
    const far = shuffle(outside.filter((p) => !nbC.has(p.ccaa)), ctx.rng);
    const others = (ctx.difficulty === 'easy' ? [...far, ...near] : [...near, ...far]).slice(0, n - 1);
    return {
      game: 'provincias',
      kind: 'choice',
      prompt: `¿Cuál de estas provincias está en ${c.name}?`,
      subject: { type: 'shape', key: c.id, layer: 'ccaa', name: c.name, flag: ccaaFlag(c), showName: true, tone: 'sky' },
      options: shuffle([right, ...others], ctx.rng).map(provOption),
      answer: [provKey(right)],
      answerLabel: right.name,
      explain: `Las provincias de ${c.name} son ${provincesOf(c.id).map((x) => x.name).join(', ')}.`,
      card: provCard(right),
    };
  }
  const c = chooseTarget(CCAA.filter((x) => !x.autonomous), ctx, (x) => `count:${x.id}`);
  const count = provincesOf(c.id).length;
  const nums = shuffle([1, 2, 3, 4, 5, 8, 9].filter((x) => x !== count), ctx.rng).slice(0, n - 1);
  return {
    game: 'provincias',
    kind: 'choice',
    prompt: `¿Cuántas provincias tiene ${c.name}?`,
    subject: { type: 'shape', key: c.id, layer: 'ccaa', name: c.name, flag: ccaaFlag(c), showName: true, tone: 'sky' },
    options: [count, ...nums].sort((a, b) => a - b).map((x) => ({ key: String(x), label: x === 1 ? '1 provincia' : `${x} provincias` })),
    answer: [String(count)],
    answerLabel: count === 1 ? '1 provincia' : `${count} provincias`,
    explain: count === 1 ? `${c.name} es una comunidad uniprovincial.` : `Son ${provincesOf(c.id).map((x) => x.name).join(', ')}.`,
    card: ccaaCard(c),
  };
}

/* ───────── Relieve ───────── */

const RELIEF_LISTS = { river: RIVERS, range: RANGES, sea: SEAS, island: ISLANDS };

export function reliefPool(lv, geo) {
  const maxT = LEVELS[lv].relief || 1;
  return Object.entries(RELIEF_LISTS).flatMap(([type, list]) => list.filter((r) => r.t <= maxT && geo.hasFeature(r.id)).map((r) => ({ ...r, type })));
}

const reliefCard = (r) => ({ title: r.name, sub: r.type === 'river' ? `Vertiente ${VERTIENTES[r.v].name.toLowerCase()}` : capFirst(RELIEF_TYPES[r.type].one) });

// Encuadre: islas en su archipiélago (en Fácil); lo demás, la península.
const reliefView = (r, easy) => {
  if (r.type === 'island') return easy ? (r.prov === '07' ? 'ib' : 'cn') : 'world';
  if (r.type === 'sea') return 'world';
  return 'peninsula';
};

function genRelieve(ctx) {
  const pool = reliefPool(ctx.lv, ctx.geo);
  const t = chooseTarget(pool, ctx, (r) => `relief:${r.id}`);
  const easy = ctx.difficulty === 'easy';
  const same = pool.filter((r) => r.type === t.type);
  const sameAll = (RELIEF_LISTS[t.type] || []).filter((r) => ctx.geo.hasFeature(r.id)).map((r) => ({ ...r, type: t.type }));
  const base = { game: 'relieve', answerLabel: t.name, explain: t.fact, card: reliefCard(t) };
  const roll = ctx.rng();

  if (t.type === 'river' && ctx.lv >= 3 && roll > 0.75) {
    return {
      ...base,
      kind: 'choice',
      prompt: `¿A qué vertiente pertenece ${t.art}?`,
      subject: { type: 'feature', key: t.id },
      options: Object.values(VERTIENTES).map((v) => ({ key: v.id, label: v.name })),
      answer: [t.v],
      answerLabel: VERTIENTES[t.v].full,
    };
  }

  if (roll < 0.5 || t.type === 'sea') {
    let shown = same;
    if (easy && t.type === 'island') shown = same.filter((r) => r.prov === t.prov || (t.prov !== '07' && r.prov !== '07'));
    if (shown.length < 3) shown = sameAll.length >= 3 ? sameAll : [...same, ...sameAll];
    return {
      ...base,
      kind: 'locate-feature',
      prompt: `Toca ${t.art} en el mapa`,
      target: t.id,
      featurePool: [...new Set(shown.map((r) => r.id))],
      attempts: LOCATE_ATTEMPTS[ctx.difficulty],
      view: reliefView(t, easy),
    };
  }

  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const cand = (same.length > n ? same : sameAll).filter((r) => r.id !== t.id);
  return {
    ...base,
    kind: 'choice',
    prompt: RELIEF_TYPES[t.type].question,
    subject: { type: 'feature', key: t.id },
    options: shuffle([t, ...shuffle(cand, ctx.rng).slice(0, n)], ctx.rng).map((r) => ({ key: r.id, label: r.short })),
    answer: [t.id],
  };
}

/* ───────── Fronteras ───────── */

function genVecinos(ctx) {
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const names = (list) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}` : list[0]);
  if (LEVELS[ctx.lv].neighbors >= 2 && ctx.rng() < 0.5) {
    const pool = realProvinces.filter((p) => [...ctx.geo.neighbors(provKey(p), 'prov')].length);
    const p = chooseTarget(pool, ctx, (x) => `nb:${provKey(x)}`);
    const nb = new Set(ctx.geo.neighbors(provKey(p), 'prov'));
    const right = pickOne(realProvinces.filter((x) => nb.has(provKey(x))), ctx.rng);
    const near = realProvinces.filter((x) => x.ine !== p.ine && !nb.has(provKey(x)) && [...ctx.geo.neighbors(provKey(x), 'prov')].some((k) => nb.has(k)));
    const far = realProvinces.filter((x) => x.ine !== p.ine && !nb.has(provKey(x)) && !near.includes(x) && [...ctx.geo.neighbors(provKey(x), 'prov')].length);
    const ordered = ctx.difficulty === 'easy' ? [...shuffle(far, ctx.rng), ...shuffle(near, ctx.rng)] : [...shuffle(near, ctx.rng), ...shuffle(far, ctx.rng)];
    const all = realProvinces.filter((x) => nb.has(provKey(x))).map((x) => x.name).sort((a, b) => a.localeCompare(b, 'es'));
    return {
      game: 'vecinos',
      kind: 'choice',
      prompt: `¿Qué provincia limita con ${p.name}?`,
      subject: { type: 'shape', key: provKey(p), layer: 'prov', name: p.name, showName: true, tone: 'amber' },
      options: shuffle([right, ...ordered.slice(0, n)], ctx.rng).map(provOption),
      answer: [provKey(right)],
      answerLabel: right.name,
      explain: `${p.name} limita con ${names(all)}.`,
      card: provCard(right),
    };
  }
  const land = CCAA.filter((c) => [...ctx.geo.neighbors(c.id, 'ccaa')].length);
  const c = chooseTarget(land, ctx, (x) => `nb:${x.id}`);
  const nb = new Set(ctx.geo.neighbors(c.id, 'ccaa'));
  const right = pickOne(land.filter((x) => nb.has(x.id)), ctx.rng);
  const notNb = land.filter((x) => x.id !== c.id && !nb.has(x.id));
  const near = notNb.filter((x) => x.zone === c.zone || [...ctx.geo.neighbors(x.id, 'ccaa')].some((k) => nb.has(k)));
  const far = notNb.filter((x) => !near.includes(x));
  const ordered = ctx.difficulty === 'easy' ? [...shuffle(far, ctx.rng), ...shuffle(near, ctx.rng)] : [...shuffle(near, ctx.rng), ...shuffle(far, ctx.rng)];
  const all = land.filter((x) => nb.has(x.id)).map((x) => ccaaShort(x)).sort((a, b) => a.localeCompare(b, 'es'));
  return {
    game: 'vecinos',
    kind: 'choice',
    prompt: `¿Qué comunidad limita con ${c.name}?`,
    subject: { type: 'shape', key: c.id, layer: 'ccaa', name: c.name, flag: ccaaFlag(c), showName: true, tone: 'amber' },
    options: shuffle([right, ...ordered.slice(0, n)], ctx.rng).map(ccaaOption),
    answer: [right.id],
    answerLabel: right.name,
    explain: `${c.name} limita con ${names(all)}.`,
    card: ccaaCard(right),
  };
}

const GENERATORS = {
  donde: genDonde,
  siluetas: genSiluetas,
  banderas: genBanderas,
  capitales: genCapitales,
  provincias: genProvincias,
  relieve: genRelieve,
  vecinos: genVecinos,
};

export function buildRound({ lv, difficulty, geo, rng = Math.random }, gameId, n = ROUND_SIZE) {
  const ctx = { lv, difficulty, geo, rng, used: new Set() };
  const ids = gameId === 'exam' ? examSequence(gamesFor(lv).map((g) => g.id), n, rng) : Array(n).fill(gameId);
  return ids.map((id, i) => ({ ...GENERATORS[id](ctx), n: i }));
}
