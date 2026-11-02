// Preguntas de Viaje por el Cuerpo. Cada ruta es un minijuego que se recorre en
// orden: primera parada, "¿cuál es la siguiente parada?" (con la estela y el
// robot sobre la lámina), "¿qué ocurre aquí?", "¿dónde ocurre esto?" y, al
// final, ordenar el recorrido completo tocando las paradas.
import { nameOf, withArt } from '../../_shared/anatomia/text';
import { shuffle, sequenceQ, textChoiceQ, LOCATE_ATTEMPTS } from '../../_shared/anatomia/qkit';
import {
  ROUTES, ROUTE_BY_ID, eventOf, trackFor, isNear,
} from './routes';

export const ROUND_SIZE = 10;
const LI = { es: 0, en: 1, va: 2 };
const tx = (arr, lang) => (arr ? arr[LI[lang] ?? 0] : '');

const TXT = {
  es: {
    first: (k) => `Primera parada del viaje: toca ${withArt(k, 'es')}`,
    next: (k) => `El robot sale de ${withArt(k, 'es')}. ¿Cuál es la siguiente parada? Tócala`,
    what: (k) => `¿Qué ocurre en ${withArt(k, 'es')}?`,
    where: (ev) => `¿Dónde ocurre esto? «${ev}»`,
    order: (k) => `Ordena el viaje: toca las paradas en orden, empezando por ${withArt(k, 'es')}`,
    help: 'Toca la siguiente parada · arrastra y haz zoom para verla mejor',
  },
  en: {
    first: (k) => `First stop on the journey: tap ${withArt(k, 'en')}`,
    next: (k) => `The robot leaves ${withArt(k, 'en')}. What is the next stop? Tap it`,
    what: (k) => `What happens in ${withArt(k, 'en')}?`,
    where: (ev) => `Where does this happen? “${ev}”`,
    order: (k) => `Put the journey in order: tap the stops one by one, starting with ${withArt(k, 'en')}`,
    help: 'Tap the next stop · drag and zoom to see it better',
  },
  va: {
    first: (k) => `Primera parada del viatge: toca ${withArt(k, 'va')}`,
    next: (k) => `El robot ix ${withArt(k, 'va').startsWith('el ') ? `del ${withArt(k, 'va').slice(3)}` : withArt(k, 'va').startsWith('els ') ? `dels ${withArt(k, 'va').slice(4)}` : `de ${withArt(k, 'va')}`}. Quina és la parada següent? Toca-la`,
    what: (k) => `Què passa en ${withArt(k, 'va')}?`,
    where: (ev) => `On passa això? «${ev}»`,
    order: (k) => `Ordena el viatge: toca les parades en ordre, començant per ${withArt(k, 'va')}`,
    help: 'Toca la parada següent · arrossega i fes zoom per a veure-la millor',
  },
};
const T = (ctx) => TXT[ctx.lang] || TXT.es;

// Desde 3.º de Primaria (nivel 2); por debajo se usan los viajes de ese nivel.
export const gamesFor = (lv) => ROUTES.filter((r) => r.from <= Math.max(lv, 2));

export function platesFor(gameId, lv) {
  const routes = gameId === 'exam' || gameId === 'duel' ? gamesFor(lv) : [ROUTE_BY_ID[gameId]].filter(Boolean);
  const out = new Set();
  for (const r of routes) {
    const tr = trackFor(r, lv);
    out.add(tr.main);
    tr.stops.forEach((s) => out.add(s.plate));
  }
  return [...out];
}

// Estela: paradas anteriores (incluida la actual) que están en la misma lámina.
function trailFor(stops, i) {
  const plate = stops[i].plate;
  const out = [];
  for (let j = i; j >= 0 && stops[j].plate === plate; j -= 1) out.unshift(stops[j].k);
  return out;
}

const card = (route, k, lang) => ({ title: nameOf(k, lang), sub: tx(route.t, lang) });

function firstQ(ctx, route, stops) {
  const s = stops[0];
  return {
    kind: 'locate', layer: s.plate, target: s.k, attempts: LOCATE_ATTEMPTS[ctx.difficulty] || 1,
    prompt: T(ctx).first(s.k), answerLabel: nameOf(s.k, ctx.lang), explain: tx(eventOf(route.id, s.k), ctx.lang), card: card(route, s.k, ctx.lang),
  };
}

// "¿Cuál es la siguiente parada?": solo si la anterior está en la misma lámina.
function nextQ(ctx, route, stops, i) {
  const prev = stops[i - 1]; const s = stops[i];
  if (!prev || prev.plate !== s.plate || !ctx.world.layer(s.plate).has(prev.k)) return null;
  const trail = trailFor(stops, i - 1);
  return {
    kind: 'locate', layer: s.plate, target: s.k, attempts: LOCATE_ATTEMPTS[ctx.difficulty] || 1,
    prompt: T(ctx).next(prev.k), answerLabel: nameOf(s.k, ctx.lang), explain: tx(eventOf(route.id, s.k), ctx.lang), card: card(route, s.k, ctx.lang),
    trail, robotFrom: trail.length > 1 ? trail[trail.length - 2] : null, helpText: T(ctx).help,
  };
}

function whatQ(ctx, route, stops, i) {
  const s = stops[i];
  const ev = eventOf(route.id, s.k);
  if (!ev) return null;
  const trail = trailFor(stops, i);
  const wrong = shuffle(stops.filter((x) => x.k !== s.k && eventOf(route.id, x.k) && !isNear(route.id, x.k, s.k)), ctx.rng).map((x) => ({ key: x.k, label: tx(eventOf(route.id, x.k), ctx.lang) }));
  // Con pocas paradas, completa con otras rutas.
  const extra = ROUTES.filter((r) => r.id !== route.id).flatMap((r) => trackFor(r, ctx.lv).stops.map((x) => ({ key: `${r.id}:${x.k}`, label: tx(eventOf(r.id, x.k), ctx.lang) }))).filter((o) => o.label);
  const q = textChoiceQ(ctx, {
    prompt: T(ctx).what(s.k),
    subject: { type: 'map', layer: s.plate, key: s.k },
    right: { key: s.k, label: tx(ev, ctx.lang) },
    wrong: wrong.length >= 3 ? wrong : [...wrong, ...shuffle(extra, ctx.rng)],
    card: card(route, s.k, ctx.lang),
  });
  return { ...q, trail, robotFrom: null };
}

function whereQ(ctx, route, stops, i) {
  const s = stops[i];
  const ev = eventOf(route.id, s.k);
  if (!ev) return null;
  return textChoiceQ(ctx, {
    prompt: T(ctx).where(tx(ev, ctx.lang)),
    right: { key: s.k, label: nameOf(s.k, ctx.lang) },
    wrong: stops.filter((x) => x.k !== s.k && !isNear(route.id, x.k, s.k)).map((x) => ({ key: x.k, label: nameOf(x.k, ctx.lang) })),
    card: card(route, s.k, ctx.lang),
  });
}

// Paradas que se preguntan en la primera pasada: todas si caben; si no, las
// claves (must) y otras repartidas por el recorrido, siempre con la última.
export function firstPassStops(stops, room) {
  const all = Array.from({ length: Math.max(0, stops.length - 1) }, (_, j) => j + 1);
  if (all.length <= room) return all;
  const must = all.filter((i) => stops[i].must);
  const rest = all.filter((i) => !stops[i].must);
  const k = Math.max(0, room - must.length);
  const pick = k === 0 ? [] : k === 1 ? [rest[rest.length - 1]] : Array.from({ length: k }, (_, j) => rest[Math.round((j * (rest.length - 1)) / (k - 1))]);
  return [...new Set([...must, ...pick])].sort((a, b) => a - b).slice(0, Math.max(0, room));
}

function orderQ(ctx, route, main, stops) {
  const seq = [...new Set(stops.filter((s) => s.plate === main && ctx.world.layer(main).has(s.k)).map((s) => s.k))];
  if (seq.length < 3) return null;
  return sequenceQ(ctx, main, seq, { prompt: T(ctx).order(seq[0]) });
}

// Una pregunta suelta de una ruta (examen y duelo).
function singleQ(ctx, route) {
  const { stops } = trackFor(route, ctx.lv);
  const ok = stops.filter((s) => ctx.world.has(s.plate));
  if (ok.length < 2) return null;
  const i = 1 + Math.floor(ctx.rng() * (ok.length - 1));
  const r = ctx.rng();
  const q = (r < 0.4 && nextQ(ctx, route, ok, i)) || (r < 0.7 && whatQ(ctx, route, ok, i)) || whereQ(ctx, route, ok, i);
  return q ? { ...q, game: route.id } : null;
}

export function buildRound(ctx0, gameId, n = ROUND_SIZE) {
  const ctx = { rng: Math.random, used: new Set(), lang: 'es', ...ctx0 };
  ctx.lv = Math.max(ctx.lv || 2, 2);
  if (gameId === 'exam' || gameId === 'duel') {
    const routes = shuffle(gamesFor(ctx.lv), ctx.rng);
    const out = [];
    let i = 0; let guard = 0;
    while (out.length < n && guard < n * 10) {
      guard += 1;
      const q = singleQ(ctx, routes[i % routes.length]);
      i += 1;
      if (q) out.push(q);
    }
    return out;
  }
  const route = ROUTE_BY_ID[gameId];
  if (!route) return [];
  const { main, stops: all } = trackFor(route, ctx.lv);
  const stops = all.filter((s) => ctx.world.has(s.plate) && ctx.world.layer(s.plate).has(s.k));
  const out = stops.length ? [firstQ(ctx, route, stops)] : [];
  const order = stops.length ? orderQ(ctx, route, main, stops) : null;
  const room = n - 1 - (order ? 1 : 0);
  // Recorre las paradas en orden (si hay más paradas que preguntas, salta algunas:
  // ver firstPassStops); si sobran preguntas, vuelve a pasar por ellas.
  const L = stops.length;
  for (const i of firstPassStops(stops, room)) {
    if (out.length >= 1 + room) break;
    const r = ctx.rng();
    const q = (r < 0.5 && nextQ(ctx, route, stops, i)) || (r < 0.78 ? whatQ(ctx, route, stops, i) : whereQ(ctx, route, stops, i));
    if (q) out.push(q);
  }
  let i = 1; let guard = 0;
  while (out.length < 1 + room && guard < n * 8 && L >= 2) {
    guard += 1;
    if (i >= L) { i = 1; continue; }
    const r = ctx.rng();
    const q = r < 0.5 ? whereQ(ctx, route, stops, i) : whatQ(ctx, route, stops, i);
    if (q) out.push(q);
    i += 1 + Math.floor(ctx.rng() * 2);
  }
  if (order) out.push(order);
  // Ruta con muy pocas paradas disponibles: se completa con preguntas de otros viajes.
  const others = gamesFor(ctx.lv).filter((r) => r.id !== route.id);
  let k = 0;
  while (out.length < n && k < n * 10 && others.length) {
    const q = singleQ(ctx, others[k % others.length]);
    k += 1;
    if (q) out.splice(Math.max(1, out.length - (order ? 1 : 0)), 0, q);
  }
  return out.slice(0, n).map((q) => ({ ...q, game: q.game || gameId }));
}

