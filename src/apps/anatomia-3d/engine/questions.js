// Generadores de preguntas de Anatomía 3D (puros; los prueba src/__tests__/cuerpo-humano.test.js).
// Necesitan el mundo de láminas con el modelo 3D enganchado (world.index3d, world.scope('3d:…')).
//
// Minijuegos:
//   donde   localizar en 3D (en medio y examen la cámara no ayuda: hay que girar y acercar)
//   quees   una pieza iluminada en 3D → su nombre
//   monta   una pieza suelta → arrastrarla a su sitio (kind 'custom', type 'place')
//   debajo  un punto en la piel → qué órgano hay debajo (sujeto 'under3d')
//   tac     un corte del cuerpo → qué estructura atraviesa o qué plano es (sujeto 'cut3d')
import { BY_KEY } from '../../_shared/anatomia/data/structures';
import { nameOf, withArt, upperFirst } from '../../_shared/anatomia/text';
import {
  shuffle, pickOne, chooseFresh, locateQ, identifyQ, textChoiceQ, distractorsFilled,
  OPTION_COUNT, LOCATE_ATTEMPTS, cardOf, explainOf, nameLabel,
} from '../../_shared/anatomia/qkit';
import { sceneIdOf } from '../../_shared/anatomia3d/scenes';
import { cameraFor } from '../../_shared/anatomia3d/world3d';
import { gamesFor, PLATE_SYSTEM, BODY_OF } from './config';

export const ROUND_SIZE = 10;

export const TXT = {
  es: {
    rotate: 'Gira el cuerpo (arrastra), acerca con la rueda o con dos dedos y toca la estructura.',
    place: (k) => `Coloca ${withArt(k, 'es')} en su sitio`,
    placeHelp: 'Arrastra la pieza que brilla hasta su sitio. Puedes girar el cuerpo arrastrando fuera de la pieza.',
    under: '¿Qué órgano hay justo debajo del punto marcado?',
    cutWhich: '¿Qué estructura iluminada atraviesa este corte?',
    cutPlane: '¿Qué plano de corte es este?',
    planes: { x: 'Plano sagital', z: 'Plano frontal (coronal)', y: 'Plano transversal (axial)' },
    planeExplain: {
      x: 'El plano sagital divide el cuerpo en una parte derecha y otra izquierda.',
      z: 'El plano frontal o coronal divide el cuerpo en una parte anterior y otra posterior.',
      y: 'El plano transversal o axial divide el cuerpo en una parte superior y otra inferior.',
    },
    planeCard: 'Planos anatómicos',
  },
  en: {
    rotate: 'Turn the body (drag), zoom in with the wheel or two fingers and tap the structure.',
    place: (k) => `Put ${withArt(k, 'en')} back in place`,
    placeHelp: 'Drag the glowing part to where it belongs. You can turn the body by dragging away from the part.',
    under: 'Which organ lies right under the marked point?',
    cutWhich: 'Which highlighted structure does this section cut through?',
    cutPlane: 'Which plane is this section?',
    planes: { x: 'Sagittal plane', z: 'Frontal (coronal) plane', y: 'Transverse (axial) plane' },
    planeExplain: {
      x: 'The sagittal plane divides the body into right and left parts.',
      z: 'The frontal or coronal plane divides the body into front and back parts.',
      y: 'The transverse or axial plane divides the body into upper and lower parts.',
    },
    planeCard: 'Anatomical planes',
  },
  va: {
    rotate: 'Gira el cos (arrossega), acosta amb la roda o amb dos dits i toca l’estructura.',
    place: (k) => `Col·loca ${withArt(k, 'va')} al seu lloc`,
    placeHelp: 'Arrossega la peça que brilla fins al seu lloc. Pots girar el cos arrossegant fora de la peça.',
    under: 'Quin òrgan hi ha just davall del punt marcat?',
    cutWhich: 'Quina estructura il·luminada travessa aquest tall?',
    cutPlane: 'Quin pla de tall és aquest?',
    planes: { x: 'Pla sagital', z: 'Pla frontal (coronal)', y: 'Pla transversal (axial)' },
    planeExplain: {
      x: 'El pla sagital dividix el cos en una part dreta i una altra esquerra.',
      z: 'El pla frontal o coronal dividix el cos en una part anterior i una altra posterior.',
      y: 'El pla transversal o axial dividix el cos en una part superior i una altra inferior.',
    },
    planeCard: 'Plans anatòmics',
  },
};
const T = (ctx) => TXT[ctx.lang] || TXT.es;

const inRegion = (s, region) => !region || region === 'all' || s.s === region || (s.s2 || []).includes(region);

// Láminas (equivalentes 3D) que entran según el aparato elegido.
function platesForRegion(region) {
  const all = Object.keys(PLATE_SYSTEM);
  if (!region || region === 'all') return all;
  if (region === 'oseo' || region === 'muscular') return all.filter((p) => PLATE_SYSTEM[p] === region);
  if (region === 'circulatorio') return ['vas-a', 'corazon-ext', 'org-prof-a'];
  if (region === 'nervioso') return ['nerv-a', 'nerv-p', 'encefalo-l', 'areas', 'org-a'];
  return all.filter((p) => PLATE_SYSTEM[p] === 'organos');
}

// Claves de una lámina que existen en su escena 3D, del nivel y del aparato.
export function poolOf(ctx, plate) {
  const s3 = ctx.world.scope(sceneIdOf(plate));
  if (!s3?.entries) return [];
  const keys = ctx.world.index?.plates?.[plate]?.keys || [];
  return [...new Set(keys)].filter((k) => s3.entries.has(k) && BY_KEY[k] && BY_KEY[k].l <= ctx.lv && inRegion(BY_KEY[k], ctx.region));
}

function choosePlate(ctx) {
  const plates = platesForRegion(ctx.region).filter((p) => ctx.world.index?.plates?.[p] && poolOf(ctx, p).length);
  return plates.length ? pickOne(plates, ctx.rng) : null;
}

/* ───────── ¿Dónde está? ───────── */

function genDonde(ctx) {
  const plate = choosePlate(ctx);
  if (!plate) return null;
  const k = chooseFresh(poolOf(ctx, plate), ctx);
  if (!k) return null;
  // En medio y examen muchas veces se busca en el cuerpo entero y mirando de frente.
  const body = BODY_OF[plate];
  const where = ctx.difficulty !== 'easy' && body && ctx.rng() < 0.6 && ctx.world.scope(sceneIdOf(body)).entries?.has(k) ? body : plate;
  return { ...locateQ(ctx, sceneIdOf(where), k, { game: 'donde' }), helpText: T(ctx).rotate };
}

/* ───────── ¿Qué es? ───────── */

function genQuees(ctx) {
  const plate = choosePlate(ctx);
  if (!plate) return null;
  const pool = poolOf(ctx, plate);
  const k = chooseFresh(pool, ctx);
  if (!k) return null;
  return identifyQ(ctx, sceneIdOf(plate), k, pool, { game: 'quees' });
}

/* ───────── Monta el cuerpo ───────── */

const sizeOf = (b) => Math.hypot(b[3] - b[0], b[4] - b[1], b[5] - b[2]);

// Piezas que no se ven desde fuera (quedan dentro de otras): no se montan.
const HIDDEN = new Set(['valvula-mitral', 'valvula-tricuspide', 'valvula-aortica', 'valvula-pulmonar', 'talamo', 'hipotalamo', 'cuerpo-calloso', 'pineal', 'hipofisis', 'mesencefalo', 'bulbo', 'bronquios', 'coronarias', 'corazon', 'cerebro', 'discos', 'cartilagos-costales', 'timo', 'craneo', 'intestino-grueso', 'tarso']);

// Piezas sueltas posibles: una pieza = clave + lado, única en su capa y visible desde fuera.
export function pieceCandidates(ctx) {
  const idx = ctx.world.index3d;
  if (!idx) return [];
  const layers = ctx.region === 'oseo' ? ['esqueleto']
    : ctx.region === 'muscular' ? ['musculos']
      : ctx.region && ctx.region !== 'all' ? ['organos']
        : ['esqueleto', 'organos'];
  const out = [];
  for (const lid of layers) {
    const layer = idx.layers[lid];
    if (!layer) continue;
    const count = new Map();
    for (const p of layer.parts) count.set(`${p.k}|${p.side}`, (count.get(`${p.k}|${p.side}`) || 0) + 1);
    for (const p of layer.parts) {
      const s = BY_KEY[p.k];
      if (!s || s.l > ctx.lv || HIDDEN.has(p.k) || count.get(`${p.k}|${p.side}`) !== 1) continue;
      if (lid === 'organos' && ctx.region && ctx.region !== 'all' && !inRegion(s, ctx.region)) continue;
      const size = sizeOf(p.b);
      const min = ctx.lv <= 3 ? 0.07 : ctx.lv <= 4 ? 0.045 : 0.032;
      if (size < min) continue;
      out.push({ layer: lid, n: p.n, k: p.k, side: p.side, size, part: p });
    }
  }
  return out;
}

function genMonta(ctx) {
  const cands = pieceCandidates(ctx);
  if (!cands.length) return null;
  const pc = chooseFresh(cands, ctx, (c) => c.k);
  const idx = ctx.world.index3d;
  const layer = idx.layers[pc.layer];
  const p = pc.part;
  // encuadre: las piezas grandes, con el cuerpo (o el tronco); las demás, su zona
  // (la pieza ampliada y, si tiene grupo, el grupo: cráneo, carpo…)
  let box = pc.layer === 'organos' ? [-0.2, 0.85, -0.16, 0.2, 1.75, 0.16] : [-0.4, 0, -0.2, 0.4, 1.76, 0.2];
  const near = pc.size < 0.26;
  if (near) {
    const c0 = [0, 1, 2].map((i) => (p.b[i] + p.b[i + 3]) / 2);
    const half = Math.max(pc.size * 1.6, 0.16);
    const bs = [[c0[0] - half, c0[1] - half, c0[2] - half, c0[0] + half, c0[1] + half, c0[2] + half]];
    const group = (p.up || []).find((g) => (layer.byKey.get(g)?.length || 0) >= 3);
    if (group) {
      for (const n of layer.byKey.get(group)) {
        const q = layer.parts[n - 1];
        if (!p.side || !q.side || q.side === p.side) bs.push(q.b);
      }
    }
    box = [0, 1, 2].map((i) => Math.min(...bs.map((b) => b[i]))).concat([3, 4, 5].map((i) => Math.max(...bs.map((b) => b[i]))));
  }
  // lo de detrás (escápula, riñones…) se mira desde detrás
  const cam = cameraFor(box, p.c[2] < -0.045 ? 'back' : 'front', near ? 1.35 : 1.15);
  // sale por el lado más cercano, fuera de lo encuadrado
  const half = (box[3] - box[0]) / 2;
  const fcx = (box[0] + box[3]) / 2;
  const cx = (p.b[0] + p.b[3]) / 2;
  const dir = Math.sign(cx - fcx) || 1;
  const dx = dir * (half - Math.abs(cx - fcx) + pc.size * 0.75 + 0.02);
  const dy = Math.min(0.06, pc.size * 0.3);
  return {
    game: 'monta',
    kind: 'custom',
    type: 'place',
    layer: pc.layer,
    n: pc.n,
    key: pc.k,
    side: pc.side,
    camera: cam,
    start: [dx, dy, 0.04],
    slot: p.c,
    attempts: LOCATE_ATTEMPTS[ctx.difficulty] || 1,
    hintSlot: ctx.difficulty === 'easy',
    prompt: T(ctx).place(pc.k),
    helpText: T(ctx).placeHelp,
    answerLabel: nameLabel(pc.k, ctx),
    explain: explainOf(pc.k, ctx.lang),
    card: cardOf(pc.k, ctx.lang),
  };
}

/* ───────── ¿Qué hay debajo? ───────── */

const UNDER = ['higado', 'estomago', 'corazon', 'bazo', 'vesicula', 'pancreas', 'rinones', 'vejiga', 'apendice', 'intestino-delgado', 'intestino-grueso', 'tiroides', 'pulmones', 'cerebro', 'traquea', 'timo', 'colon-ascendente', 'colon-descendente', 'colon-transverso', 'ciego', 'cerebelo', 'esofago', 'diafragma'];
const BACK = new Set(['rinones', 'cerebelo']);

export function underCandidates(ctx) {
  const idx = ctx.world.index3d;
  const layer = idx?.layers.organos;
  if (!layer) return [];
  return UNDER.filter((k) => BY_KEY[k] && BY_KEY[k].l <= ctx.lv && layer.byKey.has(k));
}

function genDebajo(ctx) {
  const pool = underCandidates(ctx);
  if (pool.length < 3) return null;
  const k = chooseFresh(pool, ctx);
  const layer = ctx.world.index3d.layers.organos;
  const parts = layer.byKey.get(k).map((n) => layer.parts[n - 1]);
  // una sola pieza (un riñón, un lóbulo): el punto cae encima de ella
  const sided = parts.filter((p) => p.side === 'R');
  const p = pickOne(sided.length ? sided : parts, ctx.rng);
  const back = BACK.has(k);
  const b = p.b;
  const at = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, back ? b[2] - 0.004 : b[5] + 0.004];
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const opts = shuffle([k, ...distractorsFilled(ctx, k, pool, n).filter((x) => pool.includes(x)).slice(0, n)], ctx.rng);
  const fill = shuffle(pool.filter((x) => !opts.includes(x)), ctx.rng);
  while (opts.length < n + 1 && fill.length) opts.push(fill.pop());
  return {
    game: 'debajo',
    kind: 'choice',
    subject: { type: 'under3d', key: k, at, dir: back ? 'back' : 'front', wide: true },
    options: shuffle(opts, ctx.rng).map((x) => ({ key: x, label: nameLabel(x, ctx) })),
    answer: [k],
    prompt: T(ctx).under,
    answerLabel: nameLabel(k, ctx),
    explain: explainOf(k, ctx.lang),
    card: cardOf(k, ctx.lang),
  };
}

/* ───────── Cortes y TAC ───────── */

const CUT_ORGANS = ['higado', 'estomago', 'corazon', 'pulmones', 'rinones', 'bazo', 'pancreas', 'vejiga', 'cerebro', 'cerebelo', 'traquea', 'esofago', 'intestino-delgado', 'intestino-grueso', 'tiroides', 'vesicula'];

function genTac(ctx) {
  const t = T(ctx);
  const axis = pickOne(['x', 'y', 'z'], ctx.rng);
  const layer = ctx.world.index3d?.layers.organos;
  if (!layer) return null;
  if (ctx.rng() < 0.42) {
    // ¿qué plano es? (corte por un sitio con mucho que ver)
    const at = axis === 'x' ? pickOne([0, 0.03, -0.04], ctx.rng) : axis === 'z' ? pickOne([0, 0.02], ctx.rng) : pickOne([1.62, 1.28, 1.05], ctx.rng);
    const right = { key: axis, label: t.planes[axis] };
    const wrong = ['x', 'y', 'z'].filter((a) => a !== axis).map((a) => ({ key: a, label: t.planes[a] }));
    return {
      ...textChoiceQ(ctx, {
        game: 'tac',
        prompt: t.cutPlane,
        subject: { type: 'cut3d', axis, at, key: null, wide: true },
        right,
        wrong,
        explain: t.planeExplain[axis],
        card: { title: t.planes[axis], sub: t.planeCard },
      }),
    };
  }
  const pool = CUT_ORGANS.filter((k) => BY_KEY[k] && BY_KEY[k].l <= ctx.lv && layer.byKey.has(k));
  if (pool.length < 3) return null;
  const k = chooseFresh(pool, ctx);
  const nums = layer.byKey.get(k);
  const parts = nums.map((n) => layer.parts[n - 1]);
  const p = parts.length > 1 ? pickOne(parts.filter((x) => x.side !== 'L'), ctx.rng) || parts[0] : parts[0];
  const c = p.c;
  const at = axis === 'x' ? c[0] : axis === 'y' ? c[1] : c[2];
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const opts = [k, ...shuffle(pool.filter((x) => x !== k), ctx.rng).slice(0, n)];
  return {
    game: 'tac',
    kind: 'choice',
    subject: { type: 'cut3d', axis, at, key: k, wide: true },
    options: shuffle(opts, ctx.rng).map((x) => ({ key: x, label: nameLabel(x, ctx) })),
    answer: [k],
    prompt: t.cutWhich,
    answerLabel: nameLabel(k, ctx),
    explain: `${upperFirst(t.planes[axis])}. ${explainOf(k, ctx.lang) || ''}`.trim(),
    card: cardOf(k, ctx.lang),
  };
}

/* ───────── rondas ───────── */

const GEN = { donde: genDonde, quees: genQuees, monta: genMonta, debajo: genDebajo, tac: genTac };
export const GAME_GENERATORS = GEN;

// Ronda de un minijuego o examen (mezcla de los minijuegos del curso). En duelo,
// sin montar piezas (necesita arrastrar y no tiene un único toque que comparar).
export function buildRound(ctx0, gameId, n = ROUND_SIZE) {
  const ctx = { rng: Math.random, used: new Set(), lang: 'es', ...ctx0 };
  const pool = gamesFor(ctx.lv).map((g) => g.id).filter((g) => !(ctx.duel && g === 'monta'));
  const out = [];
  if (gameId === 'exam' || gameId === 'duel') {
    const games = shuffle(pool, ctx.rng);
    let i = 0; let guard = 0;
    while (out.length < n && guard < n * 12) {
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
  let guard = 0;
  while (out.length < n && guard < n * 14) {
    guard += 1;
    const q = gen(ctx);
    if (q) out.push({ ...q, game: gameId });
  }
  if (out.length < n && ctx.region && ctx.region !== 'all') return buildRound({ ...ctx0, region: 'all' }, gameId, n);
  let k = 0;
  while (out.length < n && k < n * 10) {
    const g = pool[k % pool.length];
    k += 1;
    const q = GEN[g]({ ...ctx, region: 'all' });
    if (q) out.push({ ...q, game: g });
  }
  return out;
}

export { nameOf };
