// Generadores de preguntas de Huesos y Músculos. Funciones puras: reciben
// { lv, region, difficulty, rng, lang, world, duel } y devuelven preguntas del
// motor de mapas.
import { BY_KEY, STRUCTURES } from '../../_shared/anatomia/data/structures';
import { nameOf, actOf, upperFirst, withArt } from '../../_shared/anatomia/text';
import {
  shuffle, pickOne, chooseFresh, plateKeys, locateQ, identifyQ, whichDoesQ, textChoiceQ,
} from '../../_shared/anatomia/qkit';
import {
  ZONE, BONE_TYPES, JOINT_TYPES, DIARTHROSES, MOVES, MOVE_KINDS, MOVE_DEF, EXERCISES, ANTAGONISTS,
  LEVERS, CONTRACTIONS, PLANE_NAMES,
} from './data';
import { gamesFor } from './config';

export const ROUND_SIZE = 10;
const LI = { es: 0, en: 1, va: 2 };
const tx = (arr, lang) => arr[LI[lang] ?? 0];
const inZone = (k, region) => !region || region === 'all' || ZONE[k] === region;

const TXT = {
  es: {
    boneType: (k) => `¿Qué tipo de hueso es ${withArt(k, 'es')}?`,
    whichType: (t) => `¿Cuál de estos es un ${t.toLowerCase()}?`,
    jointType: (ex) => `¿Qué tipo de articulación hay en: ${ex}?`,
    diarthrosis: (ex) => `¿Qué tipo de articulación móvil es: ${ex}?`,
    whatMove: '¿Qué movimiento hace la figura?',
    whichMuscleMove: '¿Qué músculo hace este movimiento?',
    planeOf: '¿En qué plano se hace este movimiento?',
    exercise: (e) => `¿Qué músculo trabaja más en «${e}»?`,
    antagonist: (k) => `¿Cuál es el músculo antagonista ${k.startsWith('el ') ? `del ${k.slice(3)}` : `de ${k}`}?`,
    lever: (ex) => `¿De qué género es la palanca al ${ex.toLowerCase()}?`,
    leverDef: (n) => `¿Cómo es una palanca de ${n.toLowerCase()}?`,
    contraction: (ex) => `¿Qué tipo de contracción hay al ${ex.toLowerCase()}?`,
    moveDef: (k) => `¿Qué es una ${k.toLowerCase()}?`,
    bones206: '¿Cuántos huesos tiene el esqueleto de un adulto?',
    bones206Why: 'Un bebé nace con unos 300, pero muchos se sueldan al crecer.',
  },
  en: {
    boneType: (k) => `What type of bone is ${withArt(k, 'en')}?`,
    whichType: (t) => `Which of these is a ${t.toLowerCase()}?`,
    jointType: (ex) => `What type of joint is this: ${ex}?`,
    diarthrosis: (ex) => `What type of movable joint is this: ${ex}?`,
    whatMove: 'Which movement is the figure doing?',
    whichMuscleMove: 'Which muscle does this movement?',
    planeOf: 'In which plane does this movement happen?',
    exercise: (e) => `Which muscle works hardest in “${e}”?`,
    antagonist: (k) => `Which muscle is the antagonist of ${k}?`,
    lever: (ex) => `What class of lever is used when ${ex.toLowerCase()}?`,
    leverDef: (n) => `What is a ${n.toLowerCase()} lever like?`,
    contraction: (ex) => `What type of contraction happens when ${ex.toLowerCase()}?`,
    moveDef: (k) => `What is ${k.toLowerCase()}?`,
    bones206: 'How many bones does an adult skeleton have?',
    bones206Why: 'Babies are born with about 300, but many fuse together as they grow.',
  },
  va: {
    boneType: (k) => `Quin tipus d'os és ${withArt(k, 'va')}?`,
    whichType: (t) => `Quin d'aquests és un ${t.toLowerCase()}?`,
    jointType: (ex) => `Quin tipus d'articulació hi ha en: ${ex}?`,
    diarthrosis: (ex) => `Quin tipus d'articulació mòbil és: ${ex}?`,
    whatMove: 'Quin moviment fa la figura?',
    whichMuscleMove: 'Quin múscul fa aquest moviment?',
    planeOf: 'En quin pla es fa aquest moviment?',
    exercise: (e) => `Quin múscul treballa més en «${e}»?`,
    antagonist: (k) => `Quin és el múscul antagonista ${k.startsWith('el ') ? `del ${k.slice(3)}` : `de ${k}`}?`,
    lever: (ex) => `De quin gènere és la palanca en ${ex.toLowerCase()}?`,
    leverDef: (n) => `Com és una palanca de ${n.toLowerCase()}?`,
    contraction: (ex) => `Quin tipus de contracció hi ha en ${ex.toLowerCase()}?`,
    moveDef: (k) => `Què és una ${k.toLowerCase()}?`,
    bones206: "Quants ossos té l'esquelet d'un adult?",
    bones206Why: 'Un nadó naix amb uns 300, però molts se solden en créixer.',
  },
};
const T = (ctx) => TXT[ctx.lang] || TXT.es;

/* ───────── minijuegos ───────── */

function genBodyPlate(ctx, plates, type, game) {
  const avail = plates.filter((p) => ctx.world.has(p));
  const pools = avail.map((p) => [p, plateKeys(ctx, p, (s) => s.t === type || (type === 'mus' && s.k === 'tendon-aquiles')).filter((k) => inZone(k, ctx.region))]).filter(([, ks]) => ks.length);
  if (!pools.length) return null;
  const [plate, keys] = pickOne(pools, ctx.rng);
  const k = chooseFresh(keys, ctx);
  if (!k) return null;
  const all = plateKeys(ctx, plate, (s) => s.t === type);
  return ctx.rng() < 0.6 ? locateQ(ctx, plate, k, { game }) : identifyQ(ctx, plate, k, all, { game });
}

const genHuesos = (ctx) => genBodyPlate(ctx, ['esq-a', 'esq-p'], 'hue', 'huesos');
const genMusculos = (ctx) => genBodyPlate(ctx, ['mus-a', 'mus-p'], 'mus', 'musculos');

function genDetalle(ctx) {
  const plates = ['craneo-a', 'craneo-l', 'columna-l', 'torax-a', 'mano', 'pie'].filter((p) => ctx.world.has(p) && plateKeys(ctx, p).length >= 2);
  if (!plates.length) return null;
  const plate = pickOne(plates, ctx.rng);
  const keys = plateKeys(ctx, plate);
  const k = chooseFresh(keys, ctx);
  if (!k) return null;
  return ctx.rng() < 0.6 ? locateQ(ctx, plate, k, { game: 'detalle' }) : identifyQ(ctx, plate, k, keys, { game: 'detalle' });
}

function genHueso(ctx) {
  const r = ctx.rng();
  const plates = ['hueso-largo', 'musculos-tipo'].filter((p) => ctx.world.has(p) && plateKeys(ctx, p).length);
  if (plates.length && r < 0.5) {
    const plate = pickOne(plates, ctx.rng);
    const keys = plateKeys(ctx, plate);
    const k = chooseFresh(keys, ctx);
    if (k) return ctx.rng() < 0.6 ? locateQ(ctx, plate, k, { game: 'hueso' }) : whichDoesQ(ctx, k, keys, { game: 'hueso' });
  }
  if (r < 0.62 && !ctx.used.has('206')) {
    ctx.used.add('206');
    return textChoiceQ(ctx, {
      game: 'hueso',
      prompt: T(ctx).bones206,
      right: { key: '206', label: '206' },
      wrong: ['33', '112', '300', '150', '640'].map((n) => ({ key: n, label: n })),
      explain: T(ctx).bones206Why,
    });
  }
  const bones = STRUCTURES.filter((s) => s.t === 'hue' && s.bt && s.l <= ctx.lv && ZONE[s.k]);
  const b = chooseFresh(bones, ctx, (s) => s.k);
  if (!b) return null;
  const types = Object.keys(BONE_TYPES);
  if (ctx.rng() < 0.6) {
    return textChoiceQ(ctx, {
      game: 'hueso',
      prompt: T(ctx).boneType(b.k),
      right: { key: b.bt, label: tx(BONE_TYPES[b.bt].n, ctx.lang) },
      wrong: types.map((t) => ({ key: t, label: tx(BONE_TYPES[t].n, ctx.lang) })),
      explain: upperFirst(tx(BONE_TYPES[b.bt].d, ctx.lang)) + '.',
    });
  }
  const others = shuffle(bones.filter((s) => s.bt !== b.bt), ctx.rng);
  return textChoiceQ(ctx, {
    game: 'hueso',
    prompt: T(ctx).whichType(tx(BONE_TYPES[b.bt].n, ctx.lang)),
    right: { key: b.k, label: nameOf(b.k, ctx.lang) },
    wrong: others.map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) })),
    explain: upperFirst(tx(BONE_TYPES[b.bt].d, ctx.lang)) + '.',
  });
}

function genArticulaciones(ctx) {
  const r = ctx.rng();
  if (ctx.world.has('articulacion') && r < 0.4) {
    const keys = plateKeys(ctx, 'articulacion');
    const k = chooseFresh(keys, ctx);
    if (k) return ctx.rng() < 0.6 ? locateQ(ctx, 'articulacion', k, { game: 'articulaciones' }) : whichDoesQ(ctx, k, keys, { game: 'articulaciones' });
  }
  if (ctx.lv >= 6 && r < 0.75) {
    const d = pickOne(DIARTHROSES, ctx.rng);
    const ex = pickOne(d.ex, ctx.rng);
    return textChoiceQ(ctx, {
      game: 'articulaciones',
      prompt: T(ctx).diarthrosis(tx(ex, ctx.lang)),
      right: { key: d.id, label: tx(d.n, ctx.lang) },
      wrong: DIARTHROSES.map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
      explain: upperFirst(tx(d.d, ctx.lang)) + '.',
    });
  }
  const j = pickOne(JOINT_TYPES, ctx.rng);
  const ex = chooseFresh(j.ex, ctx, (e) => `ex:${e[0]}`);
  return textChoiceQ(ctx, {
    game: 'articulaciones',
    prompt: T(ctx).jointType(tx(ex, ctx.lang)),
    right: { key: j.id, label: tx(ctx.lv >= 4 ? j.n : j.short, ctx.lang) },
    wrong: JOINT_TYPES.map((x) => ({ key: x.id, label: tx(ctx.lv >= 4 ? x.n : x.short, ctx.lang) })),
  });
}

function genAccion(ctx) {
  const r = ctx.rng();
  const muscles = STRUCTURES.filter((s) => s.t === 'mus' && s.act && s.l <= ctx.lv && actOf(s.k, ctx.lang) && inZone(s.k, ctx.region)).map((s) => s.k);
  if (r < 0.5 && muscles.length) {
    const k = chooseFresh(muscles, ctx);
    const pool = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= ctx.lv).map((s) => s.k);
    return whichDoesQ(ctx, k, pool, { game: 'accion', field: 'act' });
  }
  if (r < 0.82 || ctx.lv < 5) {
    const list = EXERCISES.filter((e) => e.mus.every((m) => BY_KEY[m] && BY_KEY[m].l <= Math.max(ctx.lv, 3)));
    const e = chooseFresh(list, ctx, (x) => `ex:${x.id}`);
    const main = e.mus[0];
    const wrong = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= Math.max(ctx.lv, 3) && !e.mus.includes(s.k)).map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) }));
    return textChoiceQ(ctx, {
      game: 'accion',
      prompt: T(ctx).exercise(tx(e.n, ctx.lang)),
      right: { key: main, label: nameOf(main, ctx.lang) },
      wrong,
      explain: e.mus.map((m) => nameOf(m, ctx.lang)).join(', ') + '.',
    });
  }
  const pair = pickOne(ANTAGONISTS.filter(([a, b]) => BY_KEY[a]?.l <= ctx.lv + 1 && BY_KEY[b]?.l <= ctx.lv + 1), ctx.rng);
  const [a, b] = ctx.rng() < 0.5 ? pair : [pair[1], pair[0]];
  const wrong = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= ctx.lv && s.k !== a && s.k !== b).map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) }));
  return textChoiceQ(ctx, {
    game: 'accion',
    prompt: T(ctx).antagonist(withArt(a, ctx.lang)),
    right: { key: b, label: nameOf(b, ctx.lang) },
    wrong,
    explain: `${upperFirst(actOf(a, ctx.lang) || '')} ↔ ${actOf(b, ctx.lang) || ''}`.trim(),
  });
}

function moveSubject(m) {
  return { type: 'move', fig: m.fig };
}

function genMovimientos(ctx) {
  const list = MOVES.filter((m) => (m.lv || 4) <= ctx.lv);
  const m = chooseFresh(list, ctx, (x) => `mv:${x.id}`);
  const r = ctx.rng();
  if (r < 0.55) {
    // Opciones del mismo tipo general primero (flexión vs extensión…).
    const wrong = shuffle(list.filter((x) => x.id !== m.id), ctx.rng).sort((x, y) => (y.kind === m.kind || y.fig.split('-')[1] === m.fig.split('-')[1] ? 1 : 0) - (x.kind === m.kind || x.fig.split('-')[1] === m.fig.split('-')[1] ? 1 : 0));
    return textChoiceQ(ctx, {
      game: 'movimientos',
      prompt: T(ctx).whatMove,
      subject: moveSubject(m),
      right: { key: m.id, label: tx(m.n, ctx.lang) },
      wrong: wrong.map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
      explain: MOVE_DEF[m.kind] ? upperFirst(tx(MOVE_DEF[m.kind], ctx.lang)) + '.' : undefined,
    });
  }
  if (r < 0.85 || ctx.lv < 6 || !m.plane) {
    const wrong = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= Math.max(ctx.lv, 4) && s.k !== m.mus).map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) }));
    return textChoiceQ(ctx, {
      game: 'movimientos',
      prompt: T(ctx).whichMuscleMove,
      subject: moveSubject(m),
      right: { key: m.mus, label: nameOf(m.mus, ctx.lang) },
      wrong,
      explain: tx(m.n, ctx.lang) + '.',
    });
  }
  return textChoiceQ(ctx, {
    game: 'movimientos',
    prompt: T(ctx).planeOf,
    subject: moveSubject(m),
    right: { key: m.plane, label: tx(PLANE_NAMES[m.plane], ctx.lang) },
    wrong: Object.keys(PLANE_NAMES).map((p) => ({ key: p, label: tx(PLANE_NAMES[p], ctx.lang) })),
    explain: tx(m.n, ctx.lang) + '.',
  });
}

function genBiomecanica(ctx) {
  const r = ctx.rng();
  if (r < 0.4) {
    const l = pickOne(LEVERS, ctx.rng);
    if (ctx.rng() < 0.6) {
      const ex = pickOne(l.ex, ctx.rng);
      return textChoiceQ(ctx, {
        game: 'biomecanica',
        prompt: T(ctx).lever(tx(ex, ctx.lang)),
        right: { key: String(l.id), label: tx(l.n, ctx.lang) },
        wrong: LEVERS.map((x) => ({ key: String(x.id), label: tx(x.n, ctx.lang) })),
        explain: upperFirst(tx(l.d, ctx.lang)) + '.',
      });
    }
    return textChoiceQ(ctx, {
      game: 'biomecanica',
      prompt: T(ctx).leverDef(tx(l.n, ctx.lang)),
      right: { key: String(l.id), label: upperFirst(tx(l.d, ctx.lang)) },
      wrong: LEVERS.map((x) => ({ key: String(x.id), label: upperFirst(tx(x.d, ctx.lang)) })),
    });
  }
  if (r < 0.75) {
    const c = pickOne(CONTRACTIONS, ctx.rng);
    const ex = pickOne(c.ex, ctx.rng);
    return textChoiceQ(ctx, {
      game: 'biomecanica',
      prompt: T(ctx).contraction(tx(ex, ctx.lang)),
      right: { key: c.id, label: tx(c.n, ctx.lang) },
      wrong: CONTRACTIONS.map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
      explain: upperFirst(tx(c.d, ctx.lang)) + '.',
    });
  }
  const kinds = Object.keys(MOVE_DEF);
  const k = pickOne(kinds, ctx.rng);
  return textChoiceQ(ctx, {
    game: 'biomecanica',
    prompt: T(ctx).moveDef(tx(MOVE_KINDS[k], ctx.lang)),
    right: { key: k, label: upperFirst(tx(MOVE_DEF[k], ctx.lang)) },
    wrong: kinds.map((x) => ({ key: x, label: upperFirst(tx(MOVE_DEF[x], ctx.lang)) })),
  });
}

const GEN = {
  huesos: genHuesos,
  musculos: genMusculos,
  detalle: genDetalle,
  hueso: genHueso,
  articulaciones: genArticulaciones,
  accion: genAccion,
  movimientos: genMovimientos,
  biomecanica: genBiomecanica,
};
export const GAME_GENERATORS = GEN;

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
      if (q) out.push({ ...q, game: g });
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
