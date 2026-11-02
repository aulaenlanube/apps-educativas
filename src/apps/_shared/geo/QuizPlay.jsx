// Partida del motor de mapas: una ronda de preguntas (de un minijuego o
// mezcladas en el examen). Gestiona respuestas, intentos en el mapa, pistas,
// puntos y racha, y avisa al padre con el resultado de cada pregunta.
//
// Las preguntas llevan todo lo que hay que pintar (no dependen de los datos de
// cada app):
//   kind 'choice'         subject + options[{ key, label, flag?, glyph?, shape?, color? }] + answer[keys]
//   kind 'locate'         tocar una región de la capa `layer` (target = key)
//   kind 'locate-group'   tocar cualquier región de un grupo (target = continente/comunidad)
//   kind 'locate-feature' tocar un accidente geográfico (target = key de world.features)
//   kind 'sequence'       tocar en orden las paradas `stops` de la capa `layer` (recorridos)
//   card                  ficha que se muestra al responder { flag, title, sub }
//
// Cada pregunta se pinta sobre `world.scope(layer)` si el mundo tiene varias
// láminas con coordenadas propias (cuerpo humano); si no, sobre `world`.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Award, Building2, Check, Flame, GraduationCap, Hash, Landmark, LayoutGrid, Lightbulb, LogOut, MapPin, Mountain, Trophy, Waves, X,
} from 'lucide-react';
import {
  AnswerOption, GameButton, GameHeader, Hud, HudStat, Lives, ProgressDots,
} from '../kit';
import { padView } from './paths';
import { questionPoints } from './scoring';
import MapView, { MapLabel, PulseRing } from './MapView';
import { Flag, Glyph, Shape } from './Visuals';
import { UI_ES } from './ui';

export const AUTO_NEXT_MS = 1700;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TEXT_ICONS = { capital: Landmark, city: Building2, river: Waves, mountain: Mountain };

// Lámina (o mundo) sobre la que se pinta una capa.
export const scopeOf = (world, layer) => (world?.scope ? world.scope(layer) : world);

/* ───────── visual de la pregunta ───────── */

// renderCustom(q, done): visual propio de la app para tipos que el motor no conoce.
export function Subject({ q, world, done, renderCustom }) {
  const s = q.subject;
  switch (s?.type) {
    case 'shape':
      return (
        <div className="gq-stage gq-stage--shape">
          <Shape d={world.shapePath(s.key, 300, 18, s.layer)} size={300} tone={s.tone} label="Silueta misteriosa" />
          {s.showName ? (
            <span className="gq-stage__label">{s.flag && <Flag flag={s.flag} />} {s.name}</span>
          ) : (
            <AnimatePresence>
              {done && <motion.span className="gq-stage__reveal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{s.name}</motion.span>}
            </AnimatePresence>
          )}
        </div>
      );
    case 'flag':
      return (
        <div className="gq-stage gq-stage--flag">
          <Flag flag={s.flag} className="gq-flag--hero" alt="Bandera misteriosa" />
          <AnimatePresence>
            {done && <motion.span className="gq-stage__reveal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{s.name}</motion.span>}
          </AnimatePresence>
        </div>
      );
    case 'card':
      return (
        <div className="gq-stage gq-stage--card">
          {s.flag && <Flag flag={s.flag} hidden={s.hideFlag && !done} className="gq-flag--lg" />}
          <strong className="gq-bigname">{s.title}</strong>
          {s.sub && <span className="gq-stage__hintline">{s.sub}</span>}
        </div>
      );
    case 'text': {
      const Icon = TEXT_ICONS[s.icon] || Landmark;
      return (
        <div className="gq-stage gq-stage--card">
          <span className="gq-stage__icon"><Icon size={34} /></span>
          <strong className="gq-bigname">{s.text}</strong>
          {s.sub && <span className="gq-stage__hintline">{s.sub}</span>}
        </div>
      );
    }
    case 'city':
      return (
        <div className="gq-stage gq-stage--city">
          <CitySkyline />
          <strong className="gq-bigname">{s.text}</strong>
        </div>
      );
    case 'map': {
      const w = scopeOf(world, s.layer);
      const layer = w.layer(s.layer);
      const e = layer.get(s.key);
      const extra = w.questionOverlay;
      const View = w.View || MapView;
      return (
        <div className="gq-stage gq-stage--map">
          <View
            question={q}
            world={w}
            entries={layer}
            view={s.viewBox || (s.view ? w.views[s.view] || w.views.world : w.views.world)}
            states={{ [s.key]: done ? 'correct' : 'selected' }}
            interactive={Boolean(s.interactive)}
            meshes={w.meshesFor?.(s.layer)}
            ariaLabel="Mapa con una región marcada"
            overlay={(kk) => (
              <>
                {extra?.(q, { done, k: kk, subject: true })}
                {e ? <PulseRing x={e.centroid[0]} y={e.centroid[1]} k={kk} tone="info" r={20} /> : null}
              </>
            )}
          />
        </div>
      );
    }
    case 'point': {
      const p = world.points[s.key];
      return (
        <div className="gq-stage gq-stage--map">
          <MapView
            world={world}
            view={world.views[s.view || 'full']}
            interactive={false}
            markers={false}
            ariaLabel="Mapa con un punto señalado"
            overlay={(kk) => (
              <>
                <PulseRing x={p.xy[0]} y={p.xy[1]} k={kk} tone="info" r={22} />
                <MapLabel x={p.xy[0]} y={p.xy[1]} k={kk} text={done ? p.name : '?'} tone={done ? 'good' : 'info'} pin={false} />
              </>
            )}
          />
        </div>
      );
    }
    case 'feature': {
      const f = world.features?.get(s.key);
      const feats = f ? [f] : [];
      return (
        <div className="gq-stage gq-stage--map">
          <MapView
            world={world}
            view={world.featureView(s.key)}
            features={feats}
            states={{ [s.key]: done ? 'correct' : 'selected' }}
            interactive
            markers={false}
            ariaLabel="Mapa con un accidente geográfico señalado"
            overlay={(kk) => (f && done ? <MapLabel x={f.xy[0]} y={f.xy[1]} k={kk} text={f.name} tone="good" pin={false} /> : null)}
          />
        </div>
      );
    }
    default:
      return renderCustom?.(q, done) ?? null;
  }
}

function CitySkyline() {
  return (
    <svg className="gq-skyline" viewBox="0 0 160 60" aria-hidden="true">
      {[[8, 30, 14], [24, 14, 16], [42, 24, 12], [56, 6, 16], [74, 20, 14], [90, 10, 16], [108, 26, 12], [122, 16, 14], [138, 30, 14]].map(([x, top, w]) => (
        <g key={x}>
          <rect x={x} y={top} width={w} height={60 - top} rx="1.5" className="gq-skyline__tower" />
          {Array.from({ length: Math.floor((52 - top) / 7) }).map((_, i) => (
            <rect key={i} x={x + 3} y={top + 5 + i * 7} width={w - 6} height="2.4" rx="0.6" className={i % 3 === 1 ? 'gq-skyline__win is-off' : 'gq-skyline__win'} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ───────── opciones ───────── */

export function optionState(q, key, done, picked) {
  if (!done) return 'idle';
  if (q.answer.includes(key)) return 'correct';
  if (key === picked) return 'wrong';
  return 'idle';
}

// marks: { [optionKey]: [{ label, tone }] } → chapas (duelo: quién eligió qué)
export function Options({ q, world, done, picked, onAnswer, disabled = false, marks }) {
  const lock = done || disabled;
  const chips = (key) => marks?.[key]?.map((m) => <span key={m.label} className={`gq-pick is-${m.tone}`}>{m.label}</span>);

  if (q.variant === 'flags') {
    return (
      <div className="gq-flagopts">
        {q.options.map((o, i) => {
          const st = optionState(q, o.key, done, picked);
          return (
            <button
              key={o.key}
              type="button"
              className={`gq-flagopt is-${st} ${done && st === 'idle' ? 'is-dim' : ''} ${!done && picked === o.key ? 'is-selected' : ''}`}
              onClick={() => onAnswer(o.key)}
              disabled={lock}
              aria-label={done ? o.label : `Opción ${LETTERS[i]}`}
            >
              <span className="gq-flagopt__key">{i + 1}</span>
              <Flag flag={o.flag} />
              <span className="gq-flagopt__name">{done ? o.label : ' '}</span>
              {st === 'correct' && <span className="gq-flagopt__mark"><Check size={16} strokeWidth={3} /></span>}
              {st === 'wrong' && <span className="gq-flagopt__mark is-bad"><X size={16} strokeWidth={3} /></span>}
              {chips(o.key) && <span className="gq-picks">{chips(o.key)}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  if (q.variant === 'glyphs') {
    return (
      <div className={`gq-contopts ${q.options.length > 6 ? 'gq-contopts--many' : ''}`}>
        {q.options.map((o, i) => {
          const st = optionState(q, o.key, done, picked);
          const d = o.glyph ? world.glyph(o.glyph) : world.shapePath(o.shape, 64, 3, o.layer);
          return (
            <button
              key={o.key}
              type="button"
              className={`gq-contopt is-${st} ${done && st === 'idle' ? 'is-dim' : ''} ${!done && picked === o.key ? 'is-selected' : ''}`}
              style={{ '--c': o.color || '#34d399', '--cd': o.deep || '#059669' }}
              onClick={() => onAnswer(o.key)}
              disabled={lock}
            >
              <span className="gq-contopt__key">{i + 1}</span>
              {o.glyph ? <Glyph d={d} color={o.color} deep={o.deep} /> : <Shape d={d} size={64} tone="sky" className="gq-shape--mini" />}
              <span className="gq-contopt__name">{o.label}</span>
              {chips(o.key) && <span className="gq-picks">{chips(o.key)}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`gq-options ${q.options.length > 4 ? 'gq-options--many' : ''}`}>
      {q.options.map((o, i) => {
        const st = optionState(q, o.key, done, picked);
        return (
          <AnswerOption
            key={o.key}
            letter={LETTERS[i]}
            state={!done && picked === o.key ? 'selected' : st}
            className={done && st === 'idle' ? 'is-dim' : ''}
            onClick={() => onAnswer(o.key)}
            disabled={lock}
          >
            <span className="gq-opt">
              {o.flag && done && <Flag flag={o.flag} />}
              {o.label}
              {chips(o.key) && <span className="gq-picks">{chips(o.key)}</span>}
            </span>
          </AnswerOption>
        );
      })}
    </div>
  );
}

/* ───────── mapa de las preguntas de localizar ───────── */

// Estado, vista, etiquetas y capas del mapa de una pregunta de localizar.
// `world` ya es la lámina de la pregunta (scopeOf). tries: [{ key, cont }]
// fallos; done/correct: resultado; extraLabels: etiquetas adicionales (duelo:
// dónde tocó el rival); progress: paradas ya acertadas de un recorrido.
export function useLocateMap(world, q, { tries, done, correct, difficulty, extraLabels, progress = 0 }) {
  const isSeq = q.kind === 'sequence';
  const isMapQ = q.kind === 'locate' || q.kind === 'locate-group' || q.kind === 'locate-feature' || isSeq;
  const layer = world.layer(q.layer);
  const features = useMemo(() => (q.kind === 'locate-feature'
    ? (q.featurePool || []).map((k) => world.features.get(k)).filter(Boolean)
    : undefined), [q, world]);

  const states = useMemo(() => {
    if (!isMapQ) return null;
    const s = {};
    tries.forEach((t) => { s[t.key] = 'wrong'; });
    if (isSeq) {
      q.stops.forEach((k, i) => {
        if (i < progress) s[k] = 'correct';
        else if (done) s[k] = correct ? 'correct' : 'target';
      });
      return s;
    }
    if (done) {
      if (q.kind === 'locate-group') {
        for (const e of layer.values()) if (e.cont === q.target) s[e.key] = correct ? 'correct' : 'target';
      } else {
        s[q.target] = correct ? 'correct' : 'target';
      }
    }
    return s;
  }, [isMapQ, isSeq, q, tries, done, correct, layer, progress]);

  const view = useMemo(() => {
    if (!isMapQ) return null;
    if (q.kind === 'locate-group') return done && world.views[q.target] && q.target !== 'antartida' ? world.views[q.target] : world.views[q.view || 'full'];
    if (isSeq) return q.viewBox || world.views[q.view] || world.views.world;
    if (done) {
      if (q.kind === 'locate-feature') return world.featureView(q.target);
      return padView(world.focusView(q.target, q.layer), 0.1);
    }
    return q.viewBox || world.views[q.view] || world.views.world;
  }, [isMapQ, isSeq, q, done, world]);

  const labels = useMemo(() => {
    if (!isMapQ) return [];
    const anchor = (key) => {
      const f = world.features?.get(key);
      if (f) return { xy: f.xy, name: f.name };
      const e = layer.get(key);
      return e ? { xy: e.centroid, name: e.name } : null;
    };
    // at: el ancla completa (en un visor 3D, x, y, z)
    const list = tries.map((t) => {
      const a = anchor(t.key);
      if (!a) return null;
      const where = q.kind === 'locate-group' && t.cont ? ` · ${world.groupName(t.cont)}` : '';
      return { x: a.xy[0], y: a.xy[1], at: a.xy, text: `${a.name}${where}`, tone: 'bad' };
    }).filter(Boolean);
    if (isSeq) {
      q.stops.forEach((k, i) => {
        if (i >= progress && !done) return;
        const a = anchor(k);
        if (a) list.push({ x: a.xy[0], y: a.xy[1], at: a.xy, text: `${i + 1}. ${a.name}`, tone: i < progress || correct ? 'good' : 'target' });
      });
    } else if (done && q.kind !== 'locate-group') {
      const a = anchor(q.target);
      if (a) list.push({ x: a.xy[0], y: a.xy[1], at: a.xy, text: a.name, tone: correct ? 'good' : 'target' });
    }
    return [...list, ...(extraLabels || [])];
  }, [isMapQ, isSeq, q, tries, done, correct, world, layer, extraLabels, progress]);

  // Capa propia del mundo (estela de un recorrido, robot…) + anillo del objetivo.
  const extra = world.questionOverlay;
  const overlay = useCallback((kk) => {
    const own = extra?.(q, { done, correct, k: kk, progress });
    const e = done && q.kind === 'locate' ? layer.get(q.target) : null;
    if (!own && !e) return null;
    return (
      <>
        {own}
        {e && <PulseRing x={e.centroid[0]} y={e.centroid[1]} k={kk} tone={correct ? 'good' : 'target'} />}
      </>
    );
  }, [extra, done, q, layer, correct, progress]);

  const colorBy = q.colorBy || (q.kind === 'locate' && difficulty === 'easy' ? 'continent' : 'uniform');
  return { isMapQ, layer, features, states, view, labels, overlay, colorBy };
}

// Una zona cuenta como la pedida si es ella, si queda dentro de ella o, si la
// pedida está tapada por otras (corona del diente, útero, plasma…), si el punto
// tocado cae dentro de su contorno completo.
let probe = null;
function pointInPath(d, pt) {
  if (!pt || typeof document === 'undefined' || typeof Path2D === 'undefined') return false;
  try {
    probe ||= document.createElement('canvas').getContext('2d');
    return Boolean(probe?.isPointInPath(new Path2D(d), pt[0], pt[1], 'evenodd'));
  } catch { return false; }
}
function hits(world, layer, target, key, pt) {
  if (key === target) return true;
  const e = world?.layer(layer).get(target);
  if (!e) return false;
  return Boolean(e.contains?.includes(key) || (e.covered && pointInPath(e.d, pt)));
}

// ¿Acierta este toque? (null si no cuenta: ya probado o fuera de lo jugable)
// En un recorrido, `progress` = paradas ya acertadas: acierta si es la siguiente.
export function judgeMapPick(q, key, cont, tries, world, progress = 0, pt = null) {
  if (q.kind === 'sequence') {
    if (!key || tries.some((t) => t.key === key) || q.stops.slice(0, progress).includes(key)) return null;
    if (world && !world.layer(q.layer).has(key)) return null;
    return hits(world, q.layer, q.stops[progress], key, pt);
  }
  if (q.kind === 'locate-group') {
    if (!cont || tries.some((t) => t.cont === cont)) return null;
    return cont === q.target;
  }
  if (q.kind === 'locate-feature') {
    if (!q.featurePool?.includes(key) || tries.some((t) => t.key === key)) return null;
    return key === q.target;
  }
  if (!key || tries.some((t) => t.key === key)) return null;
  if (world && !world.layer(q.layer).has(key)) return null;
  return hits(world, q.layer, q.target, key, pt);
}

/* ───────── barra de resultado de la pregunta ───────── */

function Feedback({ q, correct, gain, auto, isLast, onNext, index, ui = UI_ES, extra = null }) {
  const c = q.card;
  return (
    <motion.div
      className={`gq-fb ${correct ? 'is-good' : 'is-bad'}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      role="status"
    >
      <span className="gq-fb__badge">{correct ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}</span>
      <div className="gq-fb__text">
        <strong>
          {correct ? ui.praise[index % ui.praise.length] : ui.wrong}
          {correct && gain > 0 && <span className="gq-fb__gain">+{gain}</span>}
        </strong>
        {!correct && <span>{ui.correctWas} <b>{q.answerLabel}</b></span>}
        {q.explain && <span className="gq-fb__explain"><Lightbulb size={14} /> {q.explain}</span>}
      </div>
      {c && (
        <div className="gq-fb__card">
          {c.flag && <Flag flag={c.flag} />}
          <span>
            <strong>{c.title}</strong>
            {c.sub && <small>{c.sub}</small>}
          </span>
          {extra}
        </div>
      )}
      <GameButton
        className={`gq-fb__next ${auto ? 'is-auto' : ''}`}
        variant={correct ? 'success' : 'primary'}
        iconRight={isLast ? Award : ArrowRight}
        onClick={onNext}
        autoFocus
        style={auto ? { '--gq-auto': `${AUTO_NEXT_MS}ms` } : undefined}
      >
        {isLast ? ui.seeResults : ui.next}
      </GameButton>
    </motion.div>
  );
}

export function mapHelpText(q, ui = UI_ES) {
  if (q.helpText) return q.helpText;
  if (q.kind === 'locate-group') return ui.mapHelp.group;
  if (q.kind === 'locate-feature') return ui.mapHelp.feature;
  if (q.kind === 'sequence') return ui.mapHelp.sequence;
  return ui.mapHelp.default;
}

/* ───────── pantalla ───────── */

// feedbackExtra(q, { correct }): algo propio junto a la ficha de la respuesta,
// solo en práctica (p. ej. el botón para escuchar el nombre).
// renderQuestion(q, { done, correct, difficulty, paused, onAnswer(correct, key, attempt) }):
// preguntas propias de la app (kind 'custom', p. ej. montar piezas en 3D).
export default function QuizPlay({
  world, questions, difficulty, gameTitle, gameTitleOf, regionLabel, paused = false,
  onProgress, onFinish, onExit, onHelp, onStudy, ui = UI_ES, renderSubject, mapHud, feedbackExtra, renderQuestion,
}) {
  const isExam = difficulty === 'exam';
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('ask');
  const [tries, setTries] = useState([]);
  const [progress, setProgress] = useState(0); // paradas acertadas (recorridos)
  const [picked, setPicked] = useState(null);
  const [hintOn, setHintOn] = useState(false);
  const [lastGain, setLastGain] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [live, setLive] = useState({ points: 0, streak: 0, best: 0, results: [] });
  const liveRef = useRef(live);
  const t0 = useRef(performance.now());
  const timer = useRef(0);
  const q = questions[idx];
  const isLast = idx + 1 >= questions.length;
  const done = phase === 'done';

  useEffect(() => () => clearTimeout(timer.current), []);

  const next = useCallback(() => {
    clearTimeout(timer.current);
    if (idx + 1 >= questions.length) {
      onFinish(liveRef.current);
      return;
    }
    setIdx((i) => i + 1);
    setPhase('ask');
    setTries([]);
    setProgress(0);
    setPicked(null);
    setHintOn(false);
    t0.current = performance.now();
  }, [idx, questions.length, onFinish]);
  const nextRef = useRef(next);
  useEffect(() => { nextRef.current = next; }, [next]);

  const settle = (correct, key, attempt) => {
    const seconds = (performance.now() - t0.current) / 1000;
    const prev = liveRef.current;
    const streak = correct ? prev.streak + 1 : 0;
    const gain = questionPoints({ correct, attempt, seconds, streak, hint: hintOn });
    const results = [...prev.results, { q, correct, picked: key, attempt, seconds, points: gain, hint: hintOn }];
    const nextLive = { points: prev.points + gain, streak, best: Math.max(prev.best, streak), results };
    liveRef.current = nextLive;
    setLive(nextLive);
    setPicked(key);
    setLastGain(gain);
    setLastCorrect(correct);
    setPhase('done');
    onProgress?.(nextLive);
    if (correct) timer.current = setTimeout(() => nextRef.current(), AUTO_NEXT_MS);
  };

  const answerChoice = (key) => {
    if (phase !== 'ask' || paused) return;
    settle(q.answer.includes(key), key, 1);
  };

  const answerCustom = (correct, key = null, attempt = 1) => {
    if (phase !== 'ask' || paused) return;
    settle(Boolean(correct), key, attempt);
  };

  const pickOnMap = (key, cont, pt) => {
    if (phase !== 'ask' || paused) return;
    const ok = judgeMapPick(q, key, cont, tries, mw, progress, pt);
    if (ok === null) return;
    const attempt = tries.length + 1;
    if (q.kind === 'sequence') {
      if (ok) {
        const n = progress + 1;
        setProgress(n);
        if (n >= q.stops.length) settle(true, key, attempt);
        return;
      }
      setTries((t) => [...t, { key, cont }]);
      if (attempt >= q.attempts) settle(false, key, attempt);
      return;
    }
    if (ok) {
      settle(true, key, attempt);
      return;
    }
    setTries((t) => [...t, { key, cont }]);
    if (attempt >= q.attempts) settle(false, key, attempt);
  };

  // Teclado: 1-6 eligen opción; Intro/Espacio pasan a la siguiente.
  useEffect(() => {
    const onKey = (e) => {
      if (paused || e.target.closest?.('input, textarea, [role="dialog"]')) return;
      if (phase === 'done' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        nextRef.current();
        return;
      }
      if (phase === 'ask' && q.kind === 'choice') {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= q.options.length) answerChoice(q.options[n - 1].key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (paused) clearTimeout(timer.current);
  }, [paused]);

  const mw = scopeOf(world, q.layer);
  const MapComp = mw.View || MapView; // un ámbito puede traer su propio visor (3D)
  const m = useLocateMap(mw, q, { tries, done, correct: lastCorrect, difficulty, progress });
  const triesLeft = m.isMapQ ? q.attempts - tries.length : 0;
  const hintAvailable = !isExam && q.kind === 'choice' && q.hint;
  const wideVisual = ['map', 'point', 'feature'].includes(q.subject?.type) || Boolean(q.subject?.wide);

  return (
    <div className={`gq-play${paused ? ' is-paused' : ''}`}>
      <GameHeader
        mode={difficulty}
        modeLabel={isExam ? ui.modes.exam : `${ui.modes[difficulty]} · ${gameTitle || ''}`}
        topic={regionLabel || undefined}
        onHelp={onHelp}
        onStudy={isExam ? undefined : onStudy}
        right={(
          <Hud>
            <HudStat icon={Hash} tone="progress" value={`${idx + 1}/${questions.length}`} label={ui.question} />
            <HudStat icon={Trophy} tone="score" value={live.points.toLocaleString('es-ES')} label={ui.points} />
            {!isExam && <HudStat icon={Flame} tone="streak" value={live.streak} label={ui.streak} />}
          </Hud>
        )}
      />

      <ProgressDots total={questions.length} current={idx} results={live.results.map((r) => r.correct)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className={`gq-q ${m.isMapQ ? 'gq-q--map' : ''}${q.kind === 'custom' ? ' gq-q--custom' : ''}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="gq-q__prompt">
            {isExam && <span className="gq-q__game">{gameTitleOf?.(q.game)}</span>}
            <h2>{q.prompt}</h2>
            {m.isMapQ && !done && (
              <span className="gq-q__tries">
                {q.attempts > 1 ? <Lives total={q.attempts} left={triesLeft} icon={MapPin} /> : <span className="gq-q__one"><MapPin size={14} /> {ui.oneTry}</span>}
              </span>
            )}
          </div>

          {q.kind === 'custom' ? (
            <div className="gq-q__custom">
              {renderQuestion?.(q, { done, correct: lastCorrect, difficulty, paused, onAnswer: answerCustom })}
            </div>
          ) : m.isMapQ ? (
            <div className="gq-q__mapwrap">
              <MapComp
                question={q}
                world={mw}
                entries={m.layer}
                view={m.view}
                states={m.states}
                colorBy={m.colorBy}
                groupByContinent={q.kind === 'locate-group'}
                pickable={!done && q.kind !== 'locate-feature'}
                features={m.features}
                featuresPickable={!done && q.kind === 'locate-feature'}
                meshes={mw.meshesFor?.(q.layer)}
                markers={q.kind !== 'locate-feature'}
                onPick={pickOnMap}
                labels={m.labels}
                overlay={m.overlay}
                hud={mapHud?.(q, { done })}
                className="gq-map--game"
                ariaLabel={q.prompt}
              />
              {!done && <span className="gq-q__maphelp">{mapHelpText(q, ui)}</span>}
            </div>
          ) : (
            <div className={`gq-q__body ${wideVisual ? 'is-wide-visual' : ''}`}>
              <div className="gq-q__visual">
                <Subject q={q} world={world} done={done} renderCustom={renderSubject} />
                {hintAvailable && !done && (
                  hintOn
                    ? <motion.span className="gq-hint" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}><Lightbulb size={15} /> {q.hint}</motion.span>
                    : (
                      <GameButton variant="warning" size="sm" icon={Lightbulb} onClick={() => setHintOn(true)}>
                        {difficulty === 'medium' ? ui.hintPaid : ui.hint}
                      </GameButton>
                    )
                )}
              </div>
              <Options q={q} world={world} done={done} picked={picked} onAnswer={answerChoice} />
            </div>
          )}

          {done && (
            <Feedback
              q={q}
              correct={lastCorrect}
              gain={lastGain}
              auto={lastCorrect && !paused}
              isLast={isLast}
              onNext={next}
              index={idx}
              ui={ui}
              extra={!isExam ? feedbackExtra?.(q, { correct: lastCorrect }) : null}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="gq-play__footer">
        {isExam ? (
          <>
            <span className="gq-play__info"><GraduationCap size={14} /> {ui.examFooter}</span>
            <GameButton variant="ghost" size="sm" icon={LogOut} onClick={onExit}>{ui.abandonExam}</GameButton>
          </>
        ) : (
          <>
            <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={onExit}>{ui.otherGame}</GameButton>
            <span className="gq-play__info"><Flame size={14} /> {ui.bestStreak(live.best)}</span>
          </>
        )}
      </div>
    </div>
  );
}
