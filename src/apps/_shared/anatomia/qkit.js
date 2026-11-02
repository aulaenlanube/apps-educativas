// Piezas comunes de las preguntas de las apps del cuerpo humano. Funciones
// puras: reciben el contexto { lv, difficulty, rng, lang, world, used } y
// devuelven preguntas en el formato del motor de mapas (geo/QuizPlay.jsx).
import { BY_KEY, STRUCTURES, related } from './data/structures';
import { SYSTEMS, SYSTEM_BY_ID } from './data/systems';
import { PLATE_BY_ID } from './data/plates';
import {
  nameOf, funcOf, factOf, actOf, systemName, ui, upperFirst, sciOf,
} from './text';

export const OPTION_COUNT = { easy: 3, medium: 4, exam: 4 };
export const LOCATE_ATTEMPTS = { easy: 3, medium: 2, exam: 1 };
export const SEQUENCE_ATTEMPTS = { easy: 4, medium: 3, exam: 2 };

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pickOne = (list, rng) => list[Math.floor(rng() * list.length)];
export const plateTitle = (id, lang) => {
  const p = PLATE_BY_ID[id];
  return p ? p.t[{ es: 0, en: 1, va: 2 }[lang] ?? 0] : id;
};

// Elige un objetivo que no haya salido en la ronda (si quedan).
export function chooseFresh(list, ctx, keyFn = (x) => x) {
  if (!list.length) return null;
  const fresh = list.filter((x) => !ctx.used.has(keyFn(x)));
  const t = pickOne(fresh.length ? fresh : list, ctx.rng);
  ctx.used.add(keyFn(t));
  return t;
}

// Estructuras tocables de una lámina (cargada) hasta el nivel del curso.
export function plateKeys(ctx, plateId, filter) {
  const entries = ctx.world.layer(plateId);
  return [...entries.keys()].filter((k) => {
    const s = BY_KEY[k];
    return s && s.l <= ctx.lv && (!filter || filter(s));
  });
}

// Distractores: en Medio/Examen, primero del mismo sistema y tipo; en Fácil, de otros.
// Distractores con relleno: si la lámina se queda corta, del mismo sistema del catálogo.
export function distractorsFilled(ctx, target, pool, n) {
  const ds = distractors(ctx, target, pool, n);
  if (ds.length >= n) return ds;
  const sys = BY_KEY[target]?.s;
  const extra = STRUCTURES.filter((s) => s.s === sys && s.l <= Math.max(ctx.lv, 3)).map((s) => s.k);
  return [...ds, ...distractors(ctx, target, extra, n - ds.length, { exclude: ds })];
}

export function distractors(ctx, target, pool, n, { exclude = [] } = {}) {
  const t = BY_KEY[target];
  const banned = new Set([target, ...exclude]);
  // (sin el grupo de la respuesta ni sus miembros, ni músculos de acción parecida)
  const cand = [...new Set(pool)].filter((k) => !banned.has(k) && BY_KEY[k] && nameOf(k, ctx.lang) !== nameOf(target, ctx.lang) && !related(k, target));
  const out = [];
  const take = (list) => {
    for (const k of shuffle(list, ctx.rng)) {
      if (out.length >= n) return;
      if (!out.includes(k)) out.push(k);
    }
  };
  if (ctx.difficulty === 'easy') {
    take(cand.filter((k) => BY_KEY[k].s !== t?.s));
  } else {
    take(cand.filter((k) => BY_KEY[k].s === t?.s && BY_KEY[k].t === t?.t));
    take(cand.filter((k) => BY_KEY[k].s === t?.s));
    take(cand.filter((k) => BY_KEY[k].t === t?.t));
  }
  take(cand);
  return out.slice(0, n);
}

export const explainOf = (key, lang) => {
  const f = factOf(key, lang);
  if (f) return f;
  const p = funcOf(key, lang) || actOf(key, lang);
  return p ? upperFirst(p) + '.' : undefined;
};
export const cardOf = (key, lang) => ({ title: nameOf(key, lang), sub: systemName(BY_KEY[key]?.s, lang) });
export const nameLabel = (key, ctx) => {
  const sci = ctx.lv >= 4 ? sciOf(key, ctx.lang) : null;
  return sci ? `${nameOf(key, ctx.lang)} (${sci})` : nameOf(key, ctx.lang);
};

/* ───────── tipos de pregunta ───────── */

export function locateQ(ctx, plateId, key, { game, prompt } = {}) {
  const scope = ctx.world.scope(plateId);
  const easyZoom = ctx.difficulty === 'easy' && scope.around && scope.height > scope.width * 1.6;
  return {
    game,
    kind: 'locate',
    layer: plateId,
    target: key,
    attempts: LOCATE_ATTEMPTS[ctx.difficulty] || 1,
    prompt: prompt || ui(ctx.lang).tap(key),
    answerLabel: nameLabel(key, ctx),
    explain: explainOf(key, ctx.lang),
    card: cardOf(key, ctx.lang),
    ...(easyZoom ? { viewBox: scope.around(key, 4) } : {}),
  };
}

export function identifyQ(ctx, plateId, key, pool, { game } = {}) {
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const opts = shuffle([key, ...distractorsFilled(ctx, key, pool, n)], ctx.rng);
  const scope = ctx.world.scope(plateId);
  const tall = scope.height > scope.width * 1.6;
  return {
    game,
    kind: 'choice',
    subject: { type: 'map', layer: plateId, key, ...(tall && scope.around ? { viewBox: scope.around(key, 3) } : {}) },
    options: opts.map((k) => ({ key: k, label: nameLabel(k, ctx) })),
    answer: [key],
    prompt: ui(ctx.lang).whatIs,
    hint: ui(ctx.lang).hint(key),
    answerLabel: nameLabel(key, ctx),
    explain: explainOf(key, ctx.lang),
    card: cardOf(key, ctx.lang),
  };
}

// "¿Qué órgano bombea la sangre…?" (opciones: nombres)
export function whichDoesQ(ctx, key, pool, { game, field = 'p' } = {}) {
  const pred = field === 'act' ? actOf(key, ctx.lang) : funcOf(key, ctx.lang);
  if (!pred) return null;
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const opts = shuffle([key, ...distractorsFilled(ctx, key, pool, n)], ctx.rng);
  return {
    game,
    kind: 'choice',
    subject: { type: 'ana-q', sys: BY_KEY[key]?.s },
    options: opts.map((k) => ({ key: k, label: nameLabel(k, ctx) })),
    answer: [key],
    prompt: ui(ctx.lang).whichDoes(key, pred),
    hint: ui(ctx.lang).hint(key),
    answerLabel: nameLabel(key, ctx),
    explain: factOf(key, ctx.lang) || undefined,
    card: cardOf(key, ctx.lang),
  };
}

// "¿Qué función tiene el hígado?" (opciones: funciones)
export function functionOfQ(ctx, key, pool, { game } = {}) {
  const pred = funcOf(key, ctx.lang);
  if (!pred) return null;
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const others = distractors(ctx, key, pool.filter((k) => funcOf(k, ctx.lang)), n);
  const opts = shuffle([key, ...others], ctx.rng);
  return {
    game,
    kind: 'choice',
    subject: { type: 'text', text: nameOf(key, ctx.lang), sub: systemName(BY_KEY[key]?.s, ctx.lang), icon: 'capital' },
    options: opts.map((k) => ({ key: k, label: upperFirst(funcOf(k, ctx.lang)) })),
    answer: [key],
    prompt: ui(ctx.lang).whatFunction(key),
    answerLabel: upperFirst(pred),
    explain: factOf(key, ctx.lang) || undefined,
    card: cardOf(key, ctx.lang),
  };
}

// "¿De qué aparato o sistema forma parte…?"
export function systemQ(ctx, key, systems, { game } = {}) {
  const s = BY_KEY[key];
  if (!s) return null;
  const right = [s.s, ...(s.s2 || [])];
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const others = shuffle(systems.filter((id) => !right.includes(id)), ctx.rng).slice(0, n);
  const opts = shuffle([s.s, ...others], ctx.rng);
  const sys = SYSTEM_BY_ID[s.s];
  return {
    game,
    kind: 'choice',
    subject: { type: 'text', text: nameOf(key, ctx.lang), icon: 'capital' },
    options: opts.map((id) => ({ key: id, label: systemName(id, ctx.lang) })),
    answer: right,
    prompt: ui(ctx.lang).whichSystem(key),
    answerLabel: systemName(s.s, ctx.lang),
    explain: funcOf(key, ctx.lang) ? upperFirst(funcOf(key, ctx.lang)) + '.' : undefined,
    card: { title: nameOf(key, ctx.lang), sub: systemName(sys?.id, ctx.lang) },
  };
}

export function shapeQ(ctx, plateId, key, pool, { game } = {}) {
  if (!ctx.world.hasShape(key, plateId)) return null;
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const opts = shuffle([key, ...distractors(ctx, key, pool, n)], ctx.rng);
  return {
    game,
    kind: 'choice',
    subject: { type: 'shape', key, layer: plateId, tone: 'rose', name: nameOf(key, ctx.lang) },
    options: opts.map((k) => ({ key: k, label: nameOf(k, ctx.lang) })),
    answer: [key],
    prompt: ui(ctx.lang).whatShape,
    hint: ui(ctx.lang).hint(key),
    answerLabel: nameOf(key, ctx.lang),
    explain: explainOf(key, ctx.lang),
    card: cardOf(key, ctx.lang),
  };
}

// "Toca cualquier órgano del aparato…" (grupo = cont de las zonas de la lámina)
export function groupQ(ctx, plateId, group, { game, prompt, label } = {}) {
  return {
    game,
    kind: 'locate-group',
    layer: plateId,
    target: group,
    attempts: LOCATE_ATTEMPTS[ctx.difficulty] || 1,
    prompt,
    answerLabel: label,
  };
}

// Recorrido: tocar las paradas en orden.
export function sequenceQ(ctx, plateId, stops, { game, prompt } = {}) {
  return {
    game,
    kind: 'sequence',
    layer: plateId,
    stops,
    attempts: SEQUENCE_ATTEMPTS[ctx.difficulty] || 2,
    prompt: prompt || ui(ctx.lang).order,
    answerLabel: stops.map((k) => nameOf(k, ctx.lang)).join(' → '),
  };
}

// Pregunta de opciones con textos libres (hormonas, salud, lenguaje…).
export function textChoiceQ(ctx, { game, prompt, subject, right, wrong, hint, explain, card }) {
  const n = OPTION_COUNT[ctx.difficulty] - 1;
  const opts = shuffle([right, ...shuffle(wrong.filter((w) => w.key !== right.key && w.label !== right.label), ctx.rng).slice(0, n)], ctx.rng);
  return {
    game,
    kind: 'choice',
    subject: subject || { type: 'ana-q' },
    options: opts,
    answer: [right.key],
    prompt,
    hint,
    answerLabel: right.label,
    explain,
    card,
  };
}

// Reparte n preguntas entre generadores (cada uno devuelve una pregunta o null).
export function fillRound(gens, n, ctx, { mix = false } = {}) {
  const out = [];
  let guard = 0;
  let i = 0;
  while (out.length < n && guard < n * 12) {
    guard += 1;
    const g = mix ? gens[i % gens.length] : pickOne(gens, ctx.rng);
    i += 1;
    const q = g(ctx);
    if (q) out.push(q);
  }
  return mix ? out : out;
}

export const SYSTEM_IDS = SYSTEMS.map((s) => s.id);
export const ALL = STRUCTURES;
