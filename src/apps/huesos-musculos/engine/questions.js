// Generadores de preguntas de Huesos y Músculos. Funciones puras: reciben
// { lv, region, difficulty, rng, lang, world, duel } y devuelven preguntas del
// motor de mapas.
import { BY_KEY, STRUCTURES, related } from '../../_shared/anatomia/data/structures';
import {
  nameOf, actOf, oriOf, insOf, upperFirst, withArt, ofArt, isPlural, whichKind, ui,
} from '../../_shared/anatomia/text';
import {
  shuffle, pickOne, chooseFresh, plateKeys, locateQ, identifyQ, whichDoesQ, textChoiceQ, groupQ, nameLabel,
} from '../../_shared/anatomia/qkit';
import {
  ZONE, BONE_TYPES, JOINT_TYPES, DIARTHROSES, MOVES, MOVE_KINDS, MOVE_DEF, EXERCISES, ANTAGONISTS,
  LEVERS, CONTRACTIONS, PLANE_NAMES,
} from './data';
import {
  LESIONS, CARE, careWrong, INJURY_TYPES, SPRAIN_GRADES, SPRAIN_WRONG, PRICE_LETTERS, PRICE_X,
  PAS_LETTERS, PAS_X, PAS_WRONG, AID, STRETCHES, STRETCH_RULES,
} from './salud';
import { gamesFor, GAME_BY_ID } from './config';

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
    insWhere: (k) => `¿Dónde se ${isPlural(k, 'es') ? 'insertan' : 'inserta'} ${withArt(k, 'es')}?`,
    oriWhere: (k) => `¿Dónde se ${isPlural(k, 'es') ? 'originan' : 'origina'} ${withArt(k, 'es')}?`,
    whichIns: (k, t) => `${whichKind(k, 'es')} se ${isPlural(k, 'es') ? 'insertan' : 'inserta'} en ${t}?`,
    whichOri: (k, t) => `${whichKind(k, 'es')} se ${isPlural(k, 'es') ? 'originan' : 'origina'} en ${t}?`,
    fromTo: (k, a, b) => `${whichKind(k, 'es')} ${isPlural(k, 'es') ? 'van' : 'va'} desde ${a} hasta ${b}?`,
    tapIns: (t) => `Toca el músculo que se inserta en ${t}`,
    oiExplain: (a, b) => `Origen: ${a}. Inserción: ${b}.`,
    whichLesion: (d) => `¿Qué lesión es? «${d}»`,
    care: '¿Qué hay que hacer ante esta lesión?',
    injuryDef: (a) => `¿Qué es ${a}?`,
    injuryName: (d) => `¿Qué nombre recibe esta lesión? «${d}»`,
    priceLetter: (l) => `¿Qué significa la «${l}» del método PRICE?`,
    pasLetter: (l) => `¿Qué significa la «${l}» de la conducta PAS?`,
    grade: (g) => `¿Qué es un esguince de grado ${g}?`,
    stretchMus: '¿Qué músculo estira este ejercicio?',
    stretchFor: (k) => `¿Qué ejercicio estira ${withArt(k, 'es')}?`,
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
    insWhere: (k) => `Where ${isPlural(k, 'en') ? 'do' : 'does'} ${withArt(k, 'en')} insert?`,
    oriWhere: (k) => `Where ${isPlural(k, 'en') ? 'do' : 'does'} ${withArt(k, 'en')} originate?`,
    whichIns: (k, t) => `${whichKind(k, 'en')} ${isPlural(k, 'en') ? 'insert' : 'inserts'} into ${t}?`,
    whichOri: (k, t) => `${whichKind(k, 'en')} ${isPlural(k, 'en') ? 'originate' : 'originates'} from ${t}?`,
    fromTo: (k, a, b) => `${whichKind(k, 'en')} ${isPlural(k, 'en') ? 'run' : 'runs'} from ${a} to ${b}?`,
    tapIns: (t) => `Tap the muscle that inserts into ${t}`,
    oiExplain: (a, b) => `Origin: ${a}. Insertion: ${b}.`,
    whichLesion: (d) => `Which injury is this? “${d}”`,
    care: 'What should you do for this injury?',
    injuryDef: (a) => `What is ${a}?`,
    injuryName: (d) => `What is this injury called? “${d}”`,
    priceLetter: (l) => `What does the “${l}” in PRICE stand for?`,
    pasLetter: (l) => `What does the “${l}” in PAS stand for?`,
    grade: (g) => `What is a grade ${g} sprain?`,
    stretchMus: 'Which muscle does this exercise stretch?',
    stretchFor: (k) => `Which exercise stretches ${withArt(k, 'en')}?`,
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
    insWhere: (k) => `On s'${isPlural(k, 'va') ? 'inserixen' : 'inserix'} ${withArt(k, 'va')}?`,
    oriWhere: (k) => `On s'${isPlural(k, 'va') ? 'originen' : 'origina'} ${withArt(k, 'va')}?`,
    whichIns: (k, t) => `${whichKind(k, 'va')} s'${isPlural(k, 'va') ? 'inserixen' : 'inserix'} en ${t}?`,
    whichOri: (k, t) => `${whichKind(k, 'va')} s'${isPlural(k, 'va') ? 'originen' : 'origina'} en ${t}?`,
    // des de + el = des del · fins a + el = fins al
    fromTo: (k, a, b) => `${whichKind(k, 'va')} ${isPlural(k, 'va') ? 'van' : 'va'} des ${a.replace(/^(els?) /, (_, x) => `d${x} `).replace(/^(?!dels? )/, 'de ')} fins ${b.replace(/^(els?) /, (_, x) => `a${x.slice(1)} `).replace(/^(?!als? )/, 'a ')}?`,
    tapIns: (t) => `Toca el múscul que s'inserix en ${t}`,
    oiExplain: (a, b) => `Origen: ${a}. Inserció: ${b}.`,
    whichLesion: (d) => `Quina lesió és? «${d}»`,
    care: "Què cal fer davant d'aquesta lesió?",
    injuryDef: (a) => `Què és ${a}?`,
    injuryName: (d) => `Quin nom rep aquesta lesió? «${d}»`,
    priceLetter: (l) => `Què significa la «${l}» del mètode PRICE?`,
    pasLetter: (l) => `Què significa la «${l}» de la conducta PAS?`,
    grade: (g) => `Què és un esquinç de grau ${g}?`,
    stretchMus: 'Quin múscul estira aquest exercici?',
    stretchFor: (k) => `Quin exercici estira ${withArt(k, 'va')}?`,
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

const genHuesos = (ctx) => genBodyPlate(ctx, GAME_BY_ID.huesos.plates(ctx.lv), 'hue', 'huesos');

// Grupos musculares con dos o más miembros a la vista en una lámina
// (cuádriceps, isquiotibiales, manguito rotador…): el `cont` de sus zonas.
function muscleGroups(ctx, plate) {
  const counts = {};
  for (const e of ctx.world.layer(plate).values()) {
    const g = BY_KEY[e.key]?.grp;
    if (BY_KEY[e.key]?.t === 'mus' && BY_KEY[g]?.t === 'mus' && e.cont === g && BY_KEY[g].l <= ctx.lv && inZone(g, ctx.region)) counts[g] = (counts[g] || 0) + 1;
  }
  return Object.keys(counts).filter((g) => counts[g] >= 2);
}

function genMusculos(ctx) {
  const plates = GAME_BY_ID.musculos.plates(ctx.lv).filter((p) => ctx.world.has(p));
  if (ctx.lv >= 6 && ctx.rng() < 0.14) {
    const withGroups = plates.map((p) => [p, muscleGroups(ctx, p)]).filter(([, gs]) => gs.length);
    if (withGroups.length) {
      const [plate, gs] = pickOne(withGroups, ctx.rng);
      const g = chooseFresh(gs, ctx, (x) => `grp:${x}`);
      return groupQ(ctx, plate, g, { game: 'musculos', prompt: ui(ctx.lang).tapAny(ofArt(g, ctx.lang)), label: nameOf(g, ctx.lang) });
    }
  }
  return genBodyPlate(ctx, plates, 'mus', 'musculos');
}

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
  const plates = GAME_BY_ID.articulaciones.plates(ctx.lv).filter((p) => ctx.world.has(p) && plateKeys(ctx, p).length >= 2);
  if (plates.length && r < 0.5) {
    const plate = pickOne(plates, ctx.rng);
    const keys = plateKeys(ctx, plate);
    const k = chooseFresh(keys, ctx);
    const r2 = ctx.rng();
    if (k && r2 < 0.5) return locateQ(ctx, plate, k, { game: 'articulaciones' });
    if (k && r2 < 0.75) return identifyQ(ctx, plate, k, keys, { game: 'articulaciones' });
    if (k) return whichDoesQ(ctx, k, keys, { game: 'articulaciones', field: BY_KEY[k].t === 'mus' ? 'act' : 'p' });
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
    const wrong = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= Math.max(ctx.lv, 3) && !e.mus.some((m) => m === s.k || related(m, s.k))).map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) }));
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
  const wrong = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= ctx.lv && s.k !== a && s.k !== b && !related(s.k, a) && !related(s.k, b)).map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) }));
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
    const wrong = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= Math.max(ctx.lv, 4) && s.k !== m.mus && !related(s.k, m.mus)).map((s) => ({ key: s.k, label: nameOf(s.k, ctx.lang) }));
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

/* ───────── origen e inserción (Bachillerato) ───────── */

// Dos puntos de fijación "se parecen" si comparten un accidente o un hueso
// (fémur, troquíter, tuberosidad isquiática…): uno no puede ser la opción falsa
// del otro. Se compara el texto en castellano del catálogo.
const OI_STOP = new Set(['parte', 'sobre', 'desde', 'hasta', 'entre', 'debajo', 'encima', 'delante', 'detras', 'traves', 'propio', 'central',
  'borde', 'tercio', 'mitad', 'medial', 'lateral', 'superior', 'inferior', 'anterior', 'posterior', 'interna', 'externa', 'cuerpo', 'cuerpos',
  'tendon', 'primera', 'primer', 'segunda', 'tercera', 'cuarta', 'quinta', 'quinto', 'ultima', 'mayor', 'menor', 'apofisi', 'labio', 'cabeza', 'otros', 'huesos']);
const oiWords = (s) => new Set(String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/)
  .map((w) => w.replace(/s$/, '')).filter((w) => w.length >= 5 && !OI_STOP.has(w)));
export function oiOverlap(a, b) {
  const A = oiWords(a);
  for (const w of oiWords(b)) if (A.has(w)) return true;
  return false;
}
const sameGroup = (a, b) => Boolean(BY_KEY[a]?.grp && BY_KEY[a].grp === BY_KEY[b]?.grp);
const oiReady = (k, lang) => Boolean(BY_KEY[k]?.ori && oriOf(k, lang) && insOf(k, lang));
const oiText = { ori: oriOf, ins: insOf };

// Músculos que pueden ser la opción falsa de k (fields: puntos que no deben parecerse).
function oiOthers(ctx, k, fields) {
  const zone = ZONE[k];
  const list = STRUCTURES.filter((s) => s.t === 'mus' && s.k !== k && s.l <= 6 && oiReady(s.k, ctx.lang) && !related(s.k, k) && !sameGroup(s.k, k)
    && fields.every((f) => !oiOverlap(s[f], BY_KEY[k][f])));
  // primero los de la misma zona del cuerpo (más difícil)
  return shuffle(list, ctx.rng).sort((a, b) => (ZONE[b.k] === zone ? 1 : 0) - (ZONE[a.k] === zone ? 1 : 0)).map((s) => s.k);
}
const uniqueLabels = (opts) => opts.filter((o, i) => opts.findIndex((x) => x.label === o.label) === i);

function genOrigen(ctx) {
  const pool = STRUCTURES.filter((s) => s.t === 'mus' && s.l <= ctx.lv && oiReady(s.k, ctx.lang) && inZone(s.k, ctx.region)).map((s) => s.k);
  const k = chooseFresh(pool, ctx);
  if (!k) return null;
  const t = T(ctx);
  const ori = oriOf(k, ctx.lang); const ins = insOf(k, ctx.lang);
  const base = { game: 'origen', explain: t.oiExplain(ori, ins) };
  const r = ctx.rng();
  // Toca en la lámina el músculo que se inserta en… (si ningún otro de la lámina se inserta en un sitio parecido)
  if (r < 0.2) {
    const plates = GAME_BY_ID.origen.plates(ctx.lv).filter((p) => ctx.world.has(p) && ctx.world.layer(p).has(k)
      && ![...ctx.world.layer(p).keys()].some((o) => o !== k && BY_KEY[o]?.ins && (related(o, k) || sameGroup(o, k) || oiOverlap(BY_KEY[o].ins, BY_KEY[k].ins))));
    if (plates.length) return { ...locateQ(ctx, pickOne(plates, ctx.rng), k, { game: 'origen', prompt: t.tapIns(ins) }), explain: base.explain };
  }
  // ¿Dónde se origina / se inserta…? (opciones: puntos de fijación)
  if (r < 0.6) {
    const f = r < 0.4 ? 'ins' : 'ori';
    const right = { key: k, label: upperFirst(oiText[f](k, ctx.lang)) };
    const wrong = uniqueLabels(oiOthers(ctx, k, [f]).map((o) => ({ key: o, label: upperFirst(oiText[f](o, ctx.lang)) })));
    // el músculo, iluminado en una lámina (si está en alguna de las cargadas; mejor la profunda)
    const plate = ['mus-prof-p', 'mus-prof-a', 'mus-p', 'mus-a'].find((p) => ctx.world.has(p) && ctx.world.layer(p).has(k));
    const scope = plate ? ctx.world.scope(plate) : null;
    const subject = plate ? { type: 'map', layer: plate, key: k, ...(scope.around ? { viewBox: scope.around(k, 3) } : {}) } : { type: 'ana-q', sys: 'muscular' };
    return textChoiceQ(ctx, { ...base, prompt: f === 'ins' ? t.insWhere(k) : t.oriWhere(k), subject, right, wrong });
  }
  // ¿Qué músculo se origina en… / se inserta en… / va desde… hasta…? (opciones: músculos)
  const mode = r < 0.75 ? 'ins' : r < 0.88 ? 'ori' : 'both';
  const fields = mode === 'both' ? ['ori', 'ins'] : [mode];
  const prompt = mode === 'ins' ? t.whichIns(k, ins) : mode === 'ori' ? t.whichOri(k, ori) : t.fromTo(k, ori, ins);
  const wrong = oiOthers(ctx, k, fields).map((o) => ({ key: o, label: nameOf(o, ctx.lang) }));
  return textChoiceQ(ctx, { ...base, prompt, subject: { type: 'ana-q', sys: 'muscular' }, right: { key: k, label: nameOf(k, ctx.lang) }, wrong });
}

/* ───────── lesiones y primeros auxilios (Educación Física, desde 1.º de ESO) ───────── */

const atLv = (x, lv) => (x.lv || 0) <= lv;
const lesionsAt = (lv) => LESIONS.filter((l) => atLv(l, lv));
const aidSubject = (topic, title) => ({ type: 'aid', topic, ...(title ? { title } : {}) });
const isNear = (a, b) => Boolean(a.near?.includes(b.id) || b.near?.includes(a.id));

// "Toca el ligamento que se rompe en…" (en la lámina de la rodilla, del hombro…)
function lesionTapQ(ctx) {
  const opts = lesionsAt(ctx.lv).flatMap((l) => l.taps
    .filter((t) => atLv(t, ctx.lv) && ctx.world.has(t.plate) && ctx.world.layer(t.plate).has(t.k))
    .map((t) => ({ l, t })));
  const o = chooseFresh(opts, ctx, (x) => `les:${x.l.id}`);
  if (!o) return null;
  const q = locateQ(ctx, o.t.plate, o.t.k, { game: 'lesiones', prompt: tx(o.t.t, ctx.lang) });
  return { ...q, explain: tx(o.l.info, ctx.lang), card: { title: nameOf(o.t.k, ctx.lang), sub: tx(o.l.n, ctx.lang) } };
}

// "¿Qué se lesiona en…?" (opciones falsas escogidas a mano para cada lesión)
function lesionPartQ(ctx) {
  const opts = lesionsAt(ctx.lv).flatMap((l) => (l.qs || []).filter((q) => atLv(q, ctx.lv)).map((q) => ({ l, q })));
  const o = chooseFresh(opts, ctx, (x) => `les:${x.l.id}`);
  if (!o) return null;
  const { l, q } = o;
  return textChoiceQ(ctx, {
    game: 'lesiones',
    prompt: tx(q.t, ctx.lang),
    subject: aidSubject('injury'),
    right: { key: q.k, label: nameLabel(q.k, ctx) },
    wrong: q.wk.filter((k) => BY_KEY[k] && k !== q.k && !related(k, q.k)).map((k) => ({ key: k, label: nameLabel(k, ctx) })),
    explain: tx(l.info, ctx.lang),
    card: { title: nameOf(q.k, ctx.lang), sub: tx(l.n, ctx.lang) },
  });
}

// "¿Qué lesión es? «descripción»"
function whichLesionQ(ctx) {
  const pool = lesionsAt(ctx.lv);
  const l = chooseFresh(pool, ctx, (x) => `les:${x.id}`);
  return textChoiceQ(ctx, {
    game: 'lesiones',
    prompt: T(ctx).whichLesion(tx(l.desc, ctx.lang)),
    subject: aidSubject('injury'),
    right: { key: l.id, label: tx(l.n, ctx.lang) },
    wrong: pool.filter((x) => x.id !== l.id && !isNear(x, l)).map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
    explain: tx(l.info, ctx.lang),
  });
}

// "¿Qué hay que hacer ante esta lesión?" (las opciones falsas son siempre errores)
function careQ(ctx) {
  const l = chooseFresh(lesionsAt(ctx.lv), ctx, (x) => `les:${x.id}`);
  return textChoiceQ(ctx, {
    game: 'lesiones',
    prompt: T(ctx).care,
    subject: aidSubject('injury', tx(l.n, ctx.lang)),
    right: { key: l.care, label: tx(CARE[l.care].r, ctx.lang) },
    wrong: careWrong(l.care).map((w) => ({ key: w.id, label: tx(w.t, ctx.lang) })),
    explain: tx(l.info, ctx.lang),
  });
}

// "¿Qué es un esguince?" / "¿Qué nombre recibe…?"
function injuryTypeQ(ctx) {
  const ty = chooseFresh(INJURY_TYPES, ctx, (x) => `tipo:${x.id}`);
  const others = INJURY_TYPES.filter((x) => x.id !== ty.id);
  if (ctx.rng() < 0.5) {
    return textChoiceQ(ctx, {
      game: 'lesiones',
      prompt: T(ctx).injuryDef(tx(ty.a, ctx.lang)),
      subject: aidSubject('injury'),
      right: { key: ty.id, label: tx(ty.d, ctx.lang) },
      wrong: others.map((x) => ({ key: x.id, label: tx(x.d, ctx.lang) })),
    });
  }
  return textChoiceQ(ctx, {
    game: 'lesiones',
    prompt: T(ctx).injuryName(tx(ty.d, ctx.lang)),
    subject: aidSubject('injury'),
    right: { key: ty.id, label: tx(ty.n, ctx.lang) },
    wrong: others.map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
  });
}

// Primeros auxilios: PRICE, PAS, RCP, DEA y posición lateral de seguridad.
function aidQ(ctx) {
  const ids = [...AID.filter((a) => atLv(a, ctx.lv)).map((a) => a.id), 'price-letra', 'pas-letra', ...(ctx.lv >= 6 ? ['grado'] : [])];
  const id = chooseFresh(ids, ctx, (x) => `aid:${x}`);
  const lang = ctx.lang;
  const base = { game: 'lesiones' };
  if (id === 'price-letra') {
    const L = pickOne(PRICE_LETTERS, ctx.rng);
    return textChoiceQ(ctx, {
      ...base, prompt: T(ctx).priceLetter(L.l), subject: aidSubject('price'),
      right: { key: L.l, label: tx(L.m, lang) },
      wrong: PRICE_LETTERS.filter((x) => x.l !== L.l).map((x) => ({ key: x.l, label: tx(x.m, lang) })),
      explain: tx(PRICE_X, lang),
    });
  }
  if (id === 'pas-letra') {
    const L = pickOne(PAS_LETTERS, ctx.rng);
    return textChoiceQ(ctx, {
      ...base, prompt: T(ctx).pasLetter(L.l), subject: aidSubject('pas'),
      right: { key: L.l, label: tx(L.m, lang) },
      wrong: [...PAS_LETTERS.filter((x) => x.l !== L.l).map((x) => ({ key: x.l, label: tx(x.m, lang) })), ...PAS_WRONG.map((w, i) => ({ key: `pw${i}`, label: tx(w, lang) }))],
      explain: tx(PAS_X, lang),
    });
  }
  if (id === 'grado') {
    const g = pickOne(SPRAIN_GRADES, ctx.rng);
    return textChoiceQ(ctx, {
      ...base, prompt: T(ctx).grade(g.id), subject: aidSubject('injury'),
      right: { key: g.id, label: tx(g.d, lang) },
      wrong: [...SPRAIN_GRADES.filter((x) => x.id !== g.id).map((x) => ({ key: x.id, label: tx(x.d, lang) })), { key: 'hueso', label: tx(SPRAIN_WRONG, lang) }],
    });
  }
  const a = AID.find((x) => x.id === id);
  return textChoiceQ(ctx, {
    ...base, prompt: tx(a.p, lang), subject: aidSubject(a.topic),
    right: { key: 'ok', label: tx(a.r, lang) },
    wrong: a.w.map((w, i) => ({ key: `w${i}`, label: tx(w, lang) })),
    explain: a.x ? tx(a.x, lang) : undefined,
  });
}

function genLesiones(ctx) {
  const r = ctx.rng();
  return (r < 0.2 && lesionTapQ(ctx)) || (r < 0.34 && lesionPartQ(ctx)) || (r < 0.48 && whichLesionQ(ctx))
    || (r < 0.58 && careQ(ctx)) || (r < 0.65 && injuryTypeQ(ctx)) || aidQ(ctx);
}

/* ───────── estiramientos ───────── */

// Músculos que no estira un ejercicio (para las opciones falsas).
const notStretchedBy = (s, k) => k !== s.mus && !related(k, s.mus) && !s.also.some((a) => a === k || related(a, k));

// "¿Qué músculo estira este ejercicio?" (el maniquí lo hace)
function stretchMuscleQ(ctx) {
  const s = chooseFresh(STRETCHES, ctx, (x) => `st:${x.id}`);
  const wrong = [...new Set(STRETCHES.map((x) => x.mus))].filter((k) => notStretchedBy(s, k));
  return textChoiceQ(ctx, {
    game: 'estiramientos',
    prompt: T(ctx).stretchMus,
    subject: { type: 'stretch', fig: s.fig },
    right: { key: s.mus, label: nameLabel(s.mus, ctx) },
    wrong: wrong.map((k) => ({ key: k, label: nameLabel(k, ctx) })),
    explain: tx(s.how, ctx.lang),
    card: { title: nameOf(s.mus, ctx.lang), sub: tx(s.n, ctx.lang) },
  });
}

// "¿Qué ejercicio estira el cuádriceps?" (el músculo, iluminado en la lámina)
function stretchForQ(ctx) {
  const s = chooseFresh(STRETCHES, ctx, (x) => `st:${x.id}`);
  const k = s.mus;
  let subject = aidSubject('estirar');
  if (ctx.world.has(s.plate) && ctx.world.layer(s.plate).has(k)) {
    const scope = ctx.world.scope(s.plate);
    const tall = scope.height > scope.width * 1.6;
    subject = { type: 'map', layer: s.plate, key: k, ...(tall && scope.around ? { viewBox: scope.around(k, 3) } : {}) };
  }
  return textChoiceQ(ctx, {
    game: 'estiramientos',
    prompt: T(ctx).stretchFor(k),
    subject,
    right: { key: s.id, label: tx(s.n, ctx.lang) },
    wrong: STRETCHES.filter((x) => x.id !== s.id && notStretchedBy(x, k)).map((x) => ({ key: x.id, label: tx(x.n, ctx.lang) })),
    explain: tx(s.how, ctx.lang),
    card: { title: tx(s.n, ctx.lang), sub: nameOf(k, ctx.lang) },
  });
}

// Cómo se estira bien.
function stretchRuleQ(ctx) {
  const a = chooseFresh(STRETCH_RULES.filter((x) => atLv(x, ctx.lv)), ctx, (x) => `regla:${x.id}`);
  return textChoiceQ(ctx, {
    game: 'estiramientos',
    prompt: tx(a.p, ctx.lang),
    subject: aidSubject('estirar'),
    right: { key: 'ok', label: tx(a.r, ctx.lang) },
    wrong: a.w.map((w, i) => ({ key: `w${i}`, label: tx(w, ctx.lang) })),
    explain: a.x ? tx(a.x, ctx.lang) : undefined,
  });
}

function genEstiramientos(ctx) {
  const r = ctx.rng();
  if (r < 0.55) return stretchMuscleQ(ctx);
  if (r < 0.85) return stretchForQ(ctx);
  return stretchRuleQ(ctx);
}

const GEN = {
  huesos: genHuesos,
  musculos: genMusculos,
  detalle: genDetalle,
  hueso: genHueso,
  articulaciones: genArticulaciones,
  accion: genAccion,
  movimientos: genMovimientos,
  origen: genOrigen,
  biomecanica: genBiomecanica,
  lesiones: genLesiones,
  estiramientos: genEstiramientos,
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
