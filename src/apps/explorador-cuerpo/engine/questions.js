// Generadores de preguntas del Explorador del Cuerpo Humano. Funciones puras:
// reciben { lv, region, difficulty, rng, lang, world, duel } (world con las
// láminas del minijuego ya cargadas) y devuelven preguntas del motor de mapas.
import { BY_KEY, STRUCTURES } from '../../_shared/anatomia/data/structures';
import { SENSES, HORMONES, DISEASES, ROOTS, DIRECTIONS, DIRECTIONS_TERMS, PLANES } from '../../_shared/anatomia/data/extras';
import {
  nameOf, funcOf, systemName, ofSystem, ui, upperFirst, withArt,
} from '../../_shared/anatomia/text';
import {
  shuffle, pickOne, chooseFresh, plateKeys, locateQ, identifyQ, whichDoesQ, functionOfQ,
  systemQ, shapeQ, groupQ, sequenceQ, textChoiceQ, OPTION_COUNT,
} from '../../_shared/anatomia/qkit';
import { GAME_BY_ID, gamesFor, DENTRO } from './config';

export const ROUND_SIZE = 10;
const LI = { es: 0, en: 1, va: 2 };
const tx = (arr, lang) => arr[LI[lang] ?? 0];

const EXPLORER_SYSTEMS = ['sentidos', 'nervioso', 'digestivo', 'respiratorio', 'circulatorio', 'excretor', 'endocrino', 'inmune', 'reproductor'];
const inRegion = (s, region) => !region || region === 'all' || s.s === region || (s.s2 || []).includes(region);
const ORGANISH = new Set(['org', 'gla', 'vas', 'ner']);

// Texto fijo de las preguntas propias del Explorador.
const TXT = {
  es: {
    senseWhich: (verb) => `¿Qué sentido usamos para ${verb}?`,
    glandOf: (h) => `¿Qué glándula fabrica la hormona «${h}»?`,
    hormoneDoes: (h) => `¿Qué hace la hormona «${h}»?`,
    hormoneWhich: (d) => `¿Qué hormona ${d}?`,
    diseaseOrgan: (d) => `¿Qué parte del cuerpo afecta la enfermedad «${d}»?`,
    diseaseWhat: (d) => `¿Qué ocurre en la enfermedad «${d}»?`,
    rootMeans: (r, ex) => `¿Qué significa «${r}»? (como en «${ex}»)`,
    direction: (d) => `${upperFirst(d.a)} ${d.pl ? 'son' : 'es'} ___ respecto ${d.b.startsWith('el ') ? `al ${d.b.slice(3)}` : `a ${d.b}`}.`,
    plane: (p) => `¿Qué plano ${p}?`,
    orderLevels: 'Ordena los niveles de organización, del más sencillo al más complejo',
    groups: { cabeza: 'de la cabeza', tronco: 'del tronco', 'ext-sup': 'de los brazos (extremidades superiores)', 'ext-inf': 'de las piernas (extremidades inferiores)' },
  },
  en: {
    senseWhich: (verb) => `Which sense do we use to ${verb}?`,
    glandOf: (h) => `Which gland makes the hormone “${h}”?`,
    hormoneDoes: (h) => `What does the hormone “${h}” do?`,
    hormoneWhich: (d) => `Which hormone ${d}?`,
    diseaseOrgan: (d) => `Which part of the body does “${d}” affect?`,
    diseaseWhat: (d) => `What happens in “${d}”?`,
    rootMeans: (r, ex) => `What does “${r}” mean? (as in “${ex}”)`,
    direction: (d) => `${upperFirst(d.en[0])} ${d.pl ? 'are' : 'is'} ___ to ${d.en[1]}.`,
    plane: (p) => `Which plane ${p}?`,
    orderLevels: 'Put the levels of organisation in order, from simplest to most complex',
    groups: { cabeza: 'of the head', tronco: 'of the trunk', 'ext-sup': 'of the arms (upper limbs)', 'ext-inf': 'of the legs (lower limbs)' },
  },
  va: {
    senseWhich: (verb) => `Quin sentit fem servir per a ${verb}?`,
    glandOf: (h) => `Quina glàndula fabrica l'hormona «${h}»?`,
    hormoneDoes: (h) => `Què fa l'hormona «${h}»?`,
    hormoneWhich: (d) => `Quina hormona ${d}?`,
    diseaseOrgan: (d) => `Quina part del cos afecta la malaltia «${d}»?`,
    diseaseWhat: (d) => `Què passa en la malaltia «${d}»?`,
    rootMeans: (r, ex) => `Què significa «${r}»? (com en «${ex}»)`,
    direction: (d) => {
      const b = d.va[1];
      const resp = b.startsWith('el ') ? `al ${b.slice(3)}` : b.startsWith('els ') ? `als ${b.slice(4)}` : `a ${b}`;
      return `${upperFirst(d.va[0])} ${d.pl ? 'són' : 'és'} ___ respecte ${resp}.`;
    },
    plane: (p) => `Quin pla ${p}?`,
    orderLevels: "Ordena els nivells d'organització, del més senzill al més complex",
    groups: { cabeza: 'del cap', tronco: 'del tronc', 'ext-sup': 'dels braços (extremitats superiors)', 'ext-inf': 'de les cames (extremitats inferiors)' },
  },
};
const T = (ctx) => TXT[ctx.lang] || TXT.es;

/* ───────── minijuegos ───────── */

function genPartes(ctx) {
  const lv = ctx.lv;
  const plates = ['cuerpo-a', 'cuerpo-p', 'cara'].filter((p) => ctx.world.has(p));
  const r = ctx.rng();
  if (lv <= 2 && r < 0.14 && ctx.world.has('cuerpo-a')) {
    const g = pickOne(['cabeza', 'tronco', 'ext-sup', 'ext-inf'], ctx.rng);
    return groupQ(ctx, 'cuerpo-a', g, { game: 'partes', prompt: ui(ctx.lang).tapAny(T(ctx).groups[g]), label: upperFirst(systemName(g, ctx.lang)) });
  }
  const plate = r < (lv <= 2 ? 0.45 : 0.3) && plates.includes('cara') ? 'cara' : pickOne(plates.filter((p) => p !== 'cara'), ctx.rng);
  const keys = plateKeys(ctx, plate, (s) => s.t === 'reg' || s.grp);
  const k = chooseFresh(keys, ctx);
  if (!k) return null;
  return ctx.rng() < 0.72 || ctx.duel ? locateQ(ctx, plate, k, { game: 'partes' }) : identifyQ(ctx, plate, k, keys, { game: 'partes' });
}

function organPool(ctx, plate) {
  return plateKeys(ctx, plate, (s) => ORGANISH.has(s.t) && s.s !== 'oseo' && s.s !== 'muscular' && inRegion(s, ctx.region));
}

function genOrganos(ctx) {
  const plates = ['org-a', 'org-prof-a'].filter((p) => ctx.world.has(p) && organPool(ctx, p).length);
  if (!plates.length) return null;
  const plate = pickOne(plates, ctx.rng);
  const pool = organPool(ctx, plate);
  const k = chooseFresh(pool, ctx);
  if (!k) return null;
  const all = [...new Set(plates.flatMap((p) => organPool(ctx, p)))];
  return ctx.rng() < 0.6 ? locateQ(ctx, plate, k, { game: 'organos' }) : identifyQ(ctx, plate, k, all, { game: 'organos' });
}

function functionPool(ctx) {
  return STRUCTURES.filter((s) => s.l <= ctx.lv && s.p && funcOf(s.k, ctx.lang) && ORGANISH.has(s.t) && EXPLORER_SYSTEMS.includes(s.s) && inRegion(s, ctx.region)).map((s) => s.k);
}

function genFunciones(ctx) {
  const pool = functionPool(ctx);
  const k = chooseFresh(pool, ctx);
  if (!k) return null;
  return ctx.rng() < 0.55 ? whichDoesQ(ctx, k, pool, { game: 'funciones' }) : functionOfQ(ctx, k, pool, { game: 'funciones' });
}

function genSentidos(ctx) {
  const lv = ctx.lv;
  const r = ctx.rng();
  const detail = ['ojo', 'oido', 'piel', 'lengua'].filter((p) => ctx.world.has(p));
  if (lv >= 3 && detail.length && r < 0.6) {
    const plate = pickOne(detail, ctx.rng);
    const keys = plateKeys(ctx, plate);
    const k = chooseFresh(keys, ctx);
    if (!k) return null;
    return ctx.rng() < 0.55 ? locateQ(ctx, plate, k, { game: 'sentidos' }) : identifyQ(ctx, plate, k, keys, { game: 'sentidos' });
  }
  const sense = chooseFresh(SENSES, ctx, (s) => `sense:${s.id}`);
  const r2 = ctx.rng();
  if (r2 < 0.4 && !ctx.duel && ctx.world.has('cara')) {
    return locateQ(ctx, 'cara', sense.face, { game: 'sentidos', prompt: tx(sense.q, ctx.lang) });
  }
  if (r2 < 0.72) {
    return textChoiceQ(ctx, {
      game: 'sentidos',
      prompt: tx(sense.q, ctx.lang),
      right: { key: sense.organ, label: nameOf(sense.organ, ctx.lang) },
      wrong: SENSES.map((s) => ({ key: s.organ, label: nameOf(s.organ, ctx.lang) })),
      explain: upperFirst(funcOf(sense.organ, ctx.lang) || '') || undefined,
    });
  }
  return textChoiceQ(ctx, {
    game: 'sentidos',
    prompt: T(ctx).senseWhich(tx(sense.verb, ctx.lang)),
    right: { key: sense.id, label: tx(sense.n, ctx.lang) },
    wrong: SENSES.map((s) => ({ key: s.id, label: tx(s.n, ctx.lang) })),
  });
}

function genSistemas(ctx) {
  const systems = EXPLORER_SYSTEMS.filter((id) => id !== 'reproductor' || ctx.lv >= 3);
  if (ctx.rng() < 0.45 && ctx.world.has('org-a')) {
    const entries = ctx.world.layer('org-a');
    const counts = {};
    for (const [k, e] of entries) if (BY_KEY[k]?.l <= ctx.lv) counts[e.cont] = (counts[e.cont] || 0) + 1;
    const groups = Object.keys(counts).filter((g) => counts[g] >= 2 && systems.includes(g));
    const g = chooseFresh(groups, ctx, (x) => `grp:${x}`);
    if (g) return groupQ(ctx, 'org-a', g, { game: 'sistemas', prompt: ui(ctx.lang).tapAnyOrgan(ofSystem(g, ctx.lang)), label: systemName(g, ctx.lang) });
  }
  const pool = STRUCTURES.filter((s) => s.l <= ctx.lv && (s.t === 'org' || s.t === 'gla') && systems.includes(s.s)).map((s) => s.k);
  const k = chooseFresh(pool, ctx);
  return k ? systemQ(ctx, k, systems, { game: 'sistemas' }) : null;
}

function genSiluetas(ctx) {
  if (!ctx.world.has('org-a')) return null;
  const pool = plateKeys(ctx, 'org-a', (s) => inRegion(s, ctx.region)).filter((k) => ctx.world.hasShape(k, 'org-a'));
  const all = plateKeys(ctx, 'org-a').filter((k) => ctx.world.hasShape(k, 'org-a'));
  const k = chooseFresh(pool.length ? pool : all, ctx);
  return k ? shapeQ(ctx, 'org-a', k, all, { game: 'siluetas' }) : null;
}

function genDentro(ctx) {
  const plates = DENTRO.filter((p) => p.lv <= ctx.lv && ctx.world.has(p.id)).map((p) => p.id)
    .filter((p) => plateKeys(ctx, p, (s) => inRegion(s, ctx.region)).length >= 2);
  if (!plates.length) return null;
  const plate = chooseFresh(plates, ctx, (p) => `plate:${p}`);
  const keys = plateKeys(ctx, plate, (s) => inRegion(s, ctx.region));
  const k = chooseFresh(keys, ctx);
  if (!k) return null;
  const pool = plateKeys(ctx, plate);
  return ctx.rng() < 0.55 ? locateQ(ctx, plate, k, { game: 'dentro' }) : identifyQ(ctx, plate, k, pool, { game: 'dentro' });
}

function genReproduccion(ctx) {
  const plates = ['rep-m', 'rep-f', 'gametos', 'embarazo'].filter((p) => ctx.world.has(p) && plateKeys(ctx, p).length);
  if (!plates.length) return null;
  if (ctx.rng() < 0.2) {
    const pool = STRUCTURES.filter((s) => s.s === 'reproductor' && s.l <= ctx.lv && funcOf(s.k, ctx.lang)).map((s) => s.k);
    const k = chooseFresh(pool, ctx);
    if (k) return whichDoesQ(ctx, k, pool, { game: 'reproduccion' });
  }
  const plate = pickOne(plates, ctx.rng);
  const keys = plateKeys(ctx, plate);
  const k = chooseFresh(keys, ctx);
  if (!k) return null;
  return ctx.rng() < 0.55 ? locateQ(ctx, plate, k, { game: 'reproduccion' }) : identifyQ(ctx, plate, k, keys, { game: 'reproduccion' });
}

const LEVEL_ORDER = ['nivel-celula', 'nivel-tejido', 'nivel-organo', 'nivel-aparato', 'nivel-organismo'];
function genOrganizacion(ctx) {
  const r = ctx.rng();
  if (r < 0.14 && !ctx.duel && ctx.world.has('niveles') && !ctx.used.has('seq:niveles')) {
    ctx.used.add('seq:niveles');
    return sequenceQ(ctx, 'niveles', LEVEL_ORDER, { game: 'organizacion', prompt: T(ctx).orderLevels });
  }
  if (r < 0.5 && ctx.world.has('tejidos')) {
    const keys = plateKeys(ctx, 'tejidos');
    const k = chooseFresh(keys, ctx);
    if (k) return ctx.rng() < 0.5 ? locateQ(ctx, 'tejidos', k, { game: 'organizacion' }) : whichDoesQ(ctx, k, keys, { game: 'organizacion' });
  }
  const pool = STRUCTURES.filter((s) => s.s === 'organizacion' && s.l <= ctx.lv).map((s) => s.k);
  const k = chooseFresh(pool, ctx);
  if (!k) return null;
  return ctx.world.has('niveles') && LEVEL_ORDER.includes(k) && ctx.rng() < 0.5
    ? locateQ(ctx, 'niveles', k, { game: 'organizacion' })
    : whichDoesQ(ctx, k, pool, { game: 'organizacion' });
}

function genHormonas(ctx) {
  const r = ctx.rng();
  if (r < 0.38 && ctx.world.has('endocrino')) {
    const keys = plateKeys(ctx, 'endocrino');
    const k = chooseFresh(keys, ctx);
    if (k) return locateQ(ctx, 'endocrino', k, { game: 'hormonas' });
  }
  const list = HORMONES.filter((h) => (h.lv || 5) <= ctx.lv);
  const h = chooseFresh(list, ctx, (x) => `h:${x.id}`);
  const name = tx(h.n, ctx.lang);
  const r2 = ctx.rng();
  if (r2 < 0.4) {
    const glands = [...new Set(list.map((x) => x.gland))];
    return textChoiceQ(ctx, {
      game: 'hormonas',
      prompt: T(ctx).glandOf(name),
      right: { key: h.gland, label: nameOf(h.gland, ctx.lang) },
      wrong: glands.map((g) => ({ key: g, label: nameOf(g, ctx.lang) })),
      explain: `${name}: ${tx(h.d, ctx.lang)}.`,
    });
  }
  if (r2 < 0.7) {
    return textChoiceQ(ctx, {
      game: 'hormonas',
      prompt: T(ctx).hormoneDoes(name),
      right: { key: h.id, label: upperFirst(tx(h.d, ctx.lang)) },
      wrong: list.filter((x) => x.d !== h.d).map((x) => ({ key: x.id, label: upperFirst(tx(x.d, ctx.lang)) })),
      explain: `${nameOf(h.gland, ctx.lang)} → ${name}.`,
    });
  }
  return textChoiceQ(ctx, {
    game: 'hormonas',
    prompt: T(ctx).hormoneWhich(tx(h.d, ctx.lang)),
    right: { key: h.id, label: name },
    wrong: list.map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
    explain: `${name} · ${nameOf(h.gland, ctx.lang)}.`,
  });
}

function genSalud(ctx) {
  const list = DISEASES.filter((d) => BY_KEY[d.organ] && inRegion(BY_KEY[d.organ], ctx.region));
  const d = chooseFresh(list.length ? list : DISEASES, ctx, (x) => `d:${x.id}`);
  const name = tx(d.n, ctx.lang);
  const tip = d.tip ? ` ${tx(d.tip, ctx.lang)}` : '';
  if (ctx.rng() < 0.5) {
    const organs = [...new Set(DISEASES.map((x) => x.organ))];
    return textChoiceQ(ctx, {
      game: 'salud',
      prompt: T(ctx).diseaseOrgan(name),
      right: { key: d.organ, label: nameOf(d.organ, ctx.lang) },
      wrong: organs.map((o) => ({ key: o, label: nameOf(o, ctx.lang) })),
      explain: `${upperFirst(tx(d.d, ctx.lang))}.${tip}`,
    });
  }
  return textChoiceQ(ctx, {
    game: 'salud',
    prompt: T(ctx).diseaseWhat(name),
    right: { key: d.id, label: upperFirst(tx(d.d, ctx.lang)) },
    wrong: DISEASES.map((x) => ({ key: x.id, label: upperFirst(tx(x.d, ctx.lang)) })),
    explain: `${nameOf(d.organ, ctx.lang)}.${tip}`,
  });
}

function genLenguaje(ctx) {
  const r = ctx.rng();
  if (r < 0.45) {
    const root = chooseFresh(ROOTS, ctx, (x) => `r:${x.r}`);
    const sameKind = ROOTS.filter((x) => Boolean(x.suf) === Boolean(root.suf));
    return textChoiceQ(ctx, {
      game: 'lenguaje',
      prompt: T(ctx).rootMeans(root.r, root.ex),
      right: { key: root.r, label: upperFirst(tx(root.m, ctx.lang)) },
      wrong: sameKind.map((x) => ({ key: x.r, label: upperFirst(tx(x.m, ctx.lang)) })),
    });
  }
  if (r < 0.85) {
    const d = chooseFresh(DIRECTIONS, ctx, (x) => `dir:${x.a}`);
    const terms = Object.keys(DIRECTIONS_TERMS);
    const sameAxis = DIRECTIONS.filter((x) => x.axis === d.axis).map((x) => x.ans);
    const wrong = shuffle(terms.filter((t) => t !== d.ans), ctx.rng).sort((a, b) => (sameAxis.includes(b) ? 1 : 0) - (sameAxis.includes(a) ? 1 : 0));
    return textChoiceQ(ctx, {
      game: 'lenguaje',
      prompt: T(ctx).direction(d),
      right: { key: d.ans, label: tx(DIRECTIONS_TERMS[d.ans], ctx.lang) },
      wrong: wrong.map((t) => ({ key: t, label: tx(DIRECTIONS_TERMS[t], ctx.lang) })),
    });
  }
  const p = chooseFresh(PLANES, ctx, (x) => `pl:${x.id}`);
  return textChoiceQ(ctx, {
    game: 'lenguaje',
    prompt: T(ctx).plane(tx(p.d, ctx.lang)),
    right: { key: p.id, label: tx(p.n, ctx.lang) },
    wrong: PLANES.map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
  });
}

const GEN = {
  partes: genPartes,
  organos: genOrganos,
  funciones: genFunciones,
  sentidos: genSentidos,
  sistemas: genSistemas,
  siluetas: genSiluetas,
  dentro: genDentro,
  reproduccion: genReproduccion,
  organizacion: genOrganizacion,
  hormonas: genHormonas,
  salud: genSalud,
  lenguaje: genLenguaje,
};
export const GAME_GENERATORS = GEN;

// Ronda de un minijuego o examen (preguntas mezcladas de todos los del curso).
export function buildRound(ctx0, gameId, n = ROUND_SIZE) {
  const ctx = { rng: Math.random, used: new Set(), lang: 'es', ...ctx0 };
  if (gameId === 'exam' || gameId === 'duel') {
    const games = shuffle(gamesFor(ctx.lv).map((g) => g.id), ctx.rng);
    const out = [];
    let i = 0; let guard = 0;
    while (out.length < n && guard < n * 10) {
      guard += 1;
      const g = games[i % games.length];
      i += 1;
      const q = GEN[g]({ ...ctx, region: 'all' });
      if (q && !(ctx.duel && q.kind === 'sequence')) out.push({ ...q, game: g });
    }
    return out;
  }
  const gen = GEN[gameId];
  if (!gen) return [];
  const out = [];
  let guard = 0;
  while (out.length < n && guard < n * 12) {
    guard += 1;
    const q = gen(ctx);
    if (q) out.push({ ...q, game: gameId });
  }
  if (out.length < n && ctx.region && ctx.region !== 'all') return buildRound({ ...ctx0, region: 'all' }, gameId, n);
  // Si un minijuego se queda corto (p. ej. sin traducción en ese idioma), se completa con otros.
  if (out.length < n) {
    const others = gamesFor(ctx.lv).map((g) => g.id).filter((g) => g !== gameId);
    let k = 0;
    while (out.length < n && k < n * 10 && others.length) {
      const g = others[k % others.length];
      k += 1;
      const q = GEN[g]({ ...ctx, region: 'all' });
      if (q) out.push({ ...q, game: g });
    }
  }
  return out;
}

export { GAME_BY_ID, OPTION_COUNT, withArt };
