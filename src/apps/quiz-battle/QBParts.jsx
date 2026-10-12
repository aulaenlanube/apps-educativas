// Piezas de presentación de Quiz Battle (rediseño 2026), compartidas por el
// host (proyector) y el jugador (móvil). SOLO pintan: no tocan el canal
// Realtime, los tiempos ni la puntuación; reciben datos ya calculados.
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { Check, X, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { QBShape, QBCrown } from './QBArt';
import { makeQrMatrix } from './qrCode';

const cx = (...c) => c.filter(Boolean).join(' ');
const LETTERS = ['A', 'B', 'C', 'D'];

/* ───────────── Número que cuenta hasta su valor (formato ES) ───────────── */

export function QBNumber({ value, from = 0, duration = 0.9, delay = 0, className, suffix = '' }) {
  const mv = useMotionValue(from);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString('es-ES') + suffix);
  useEffect(() => {
    const controls = animate(mv, value, { duration, delay, ease: 'easeOut' });
    return () => controls.stop();
  }, [mv, value, duration, delay]);
  return <motion.span className={className}>{text}</motion.span>;
}

/* ───────────── Avatar (imagen por rareza o emoji+color) ───────────── */

export function QBAvatar({ p, size = 'md', glow = false, className }) {
  return (
    <UserAvatar
      selectedAvatarCode={p?.selected_avatar_code}
      avatarEmoji={p?.emoji}
      avatarColor={p?.color || undefined}
      size={size}
      shape="rounded"
      showRarityBorder
      showRarityGlow={glow}
      className={className}
    />
  );
}

/* ───────────── Temporizador en anillo ───────────── */

export function QBTimerRing({ timeLeft, timeLimit, size = 'lg', className }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const frac = timeLimit > 0 ? Math.max(0, Math.min(1, timeLeft / timeLimit)) : 0;
  const tone = frac > 0.5 ? 'ok' : frac > 0.25 ? 'warn' : 'danger';
  const critical = timeLeft <= 5 && timeLeft > 0;
  return (
    <div
      className={cx('qb-timer', `qb-timer--${size}`, `is-${tone}`, critical && 'is-critical', timeLeft <= 0 && 'is-over', className)}
      role="timer"
      aria-label={`${timeLeft} segundos`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="47" className="qb-timer__plate" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="50" y1="3.5" x2="50" y2="7.5" className="qb-timer__tick" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r={r} className="qb-timer__track" />
        <circle
          cx="50" cy="50" r={r}
          className="qb-timer__arc"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span key={timeLeft} className="qb-timer__value">{timeLeft}</span>
    </div>
  );
}

/* ───────────── Ficha de respuesta (color + forma) ───────────── */
//   colorIdx: 0-3 (rojo/triángulo, azul/rombo, verde/círculo, ámbar/cuadrado)
//   state: idle | selected | dim | correct | wrong | missed
//   interactive=false → <div> (pantalla del host)
export function QBTile({
  colorIdx, text, state = 'idle', interactive = false, onClick, disabled, count, delay = 0, neutral = false, letter, size = 'lg',
}) {
  const reduce = useReducedMotion();
  const Comp = interactive ? 'button' : 'div';
  const props = interactive ? { type: 'button', onClick, disabled } : {};
  // La entrada animada va en el contenedor: así los estados (atenuado, elegido…)
  // pueden usar opacity/transform en la ficha sin pelear con framer-motion.
  return (
    <motion.div
      className="qb-tile-slot"
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Comp
        {...props}
        className={cx(
          'qb-tile',
          neutral ? 'qb-tile--neutral' : `qb-tile--c${colorIdx}`,
          `qb-tile--${size}`,
          `is-${state}`,
          interactive && 'is-interactive',
        )}
      >
        <span className="qb-tile__face">
          <span className="qb-tile__shape">
            {neutral ? <span className="qb-tile__letter">{letter}</span> : <QBShape kind={colorIdx} size={size === 'sm' ? 22 : 34} />}
          </span>
          <span className="qb-tile__text">{text}</span>
          {typeof count === 'number' && <span className="qb-tile__count">{count}</span>}
        </span>
        {state === 'correct' && <span className="qb-tile__mark is-ok"><Check size={20} strokeWidth={3.5} /></span>}
        {state === 'wrong' && <span className="qb-tile__mark is-ko"><X size={20} strokeWidth={3.5} /></span>}
      </Comp>
    </motion.div>
  );
}

/* ───────────── Clasificación con animación de adelantamientos ───────────── */
// Pinta primero el orden ANTERIOR (puntos − último delta) y, tras un instante,
// recoloca las filas en el orden actual con `layout` (adelantamientos visibles).
// entries: [{ id, name, rep_name?, emoji, color, selected_avatar_code, score, lastDelta }]
export function QBLeaderboard({ entries, meId, animateRanks = true, showDelta = true, startDelay = 0, dense = false }) {
  const reduce = useReducedMotion();
  const prevOrder = useMemo(
    () => [...entries].sort((a, b) => (b.score - (b.lastDelta || 0)) - (a.score - (a.lastDelta || 0))),
    [entries],
  );
  const canAnimate = animateRanks && !reduce && entries.some((p) => p.lastDelta > 0);
  const [settled, setSettled] = useState(!canAnimate);
  useEffect(() => {
    if (settled) return undefined;
    const t = setTimeout(() => setSettled(true), 1100 + startDelay);
    return () => clearTimeout(t);
  }, [settled, startDelay]);

  const rows = settled ? entries : prevOrder;
  const prevRank = new Map(prevOrder.map((p, i) => [p.id, i]));

  return (
    <ol className={cx('qb-lb', dense && 'qb-lb--dense')}>
      {rows.map((p, i) => {
        const move = settled && canAnimate ? (prevRank.get(p.id) ?? i) - i : 0;
        return (
          <motion.li
            layout={!reduce}
            key={p.id}
            className={cx('qb-lb__row', i < 3 && `is-top${i + 1}`, p.id === meId && 'is-me')}
            initial={reduce ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              layout: { type: 'spring', stiffness: 260, damping: 28 },
              delay: startDelay / 1000 + Math.min(i, 8) * 0.06,
            }}
          >
            <span className="qb-lb__rank">{i + 1}</span>
            <span className="qb-lb__avatar"><QBAvatar p={p} size="sm" /></span>
            <span className="qb-lb__name">
              <span>{p.name}</span>
              {p.rep_name && <small>{p.rep_name}</small>}
            </span>
            {move !== 0 && (
              <span className={cx('qb-lb__move', move > 0 ? 'is-up' : 'is-down')} title={move > 0 ? `Sube ${move}` : `Baja ${-move}`}>
                {move > 0 ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                {Math.abs(move)}
              </span>
            )}
            {showDelta && p.lastDelta > 0 && <span className="qb-lb__delta">+{p.lastDelta}</span>}
            {/* El contador va montado desde el primer render: si se montase un
                motion.* nuevo mientras la fase sale (AnimatePresence mode="wait"),
                framer-motion no cerraría la salida y la siguiente fase no entraría. */}
            <span className="qb-lb__score">
              <QBNumber
                value={settled ? p.score : p.score - (canAnimate ? p.lastDelta || 0 : 0)}
                from={p.score - (canAnimate ? p.lastDelta || 0 : 0)}
                duration={0.8}
              />
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}

/* ───────────── Barras de reparto de respuestas ───────────── */
// neutral (anti-copia): los colores no identifican la opción → letras A-D y
// solo la correcta en verde.
export function QBDistribution({ options, distribution, correctIndex, neutral = false }) {
  const reduce = useReducedMotion();
  const max = Math.max(...distribution, 1);
  const total = distribution.reduce((a, b) => a + b, 0);
  return (
    <div className="qb-dist">
      {options.map((opt, i) => {
        const count = distribution[i] || 0;
        const isCorrect = i === correctIndex;
        return (
          <div key={i} className={cx('qb-dist__col', neutral ? 'qb-tile--neutral' : `qb-tile--c${i}`, isCorrect ? 'is-correct' : 'is-other')}>
            <div className="qb-dist__well">
              {isCorrect && <span className="qb-dist__ok"><Check size={18} strokeWidth={3.5} /></span>}
              <motion.span
                className="qb-dist__count"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
              >
                {count}
                {total > 0 && <small>{Math.round((count / total) * 100)}%</small>}
              </motion.span>
              <span className="qb-dist__track">
                <motion.span
                  className="qb-dist__bar"
                  style={{ height: `${Math.max(5, (count / max) * 100)}%` }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </div>
            <div className="qb-dist__label">
              <span className="qb-dist__shape">
                {neutral ? <b>{LETTERS[i]}</b> : <QBShape kind={i} size={20} />}
              </span>
              <span className="qb-dist__text">{opt}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── Podio ───────────── */

export function QBPodium({ entries, meId }) {
  const reduce = useReducedMotion();
  const order = [1, 0, 2];
  const delays = { 0: 0.9, 1: 0.45, 2: 1.3 };
  return (
    <div className="qb-podium">
      {order.map((idx) => {
        const p = entries[idx];
        if (!p) return <div key={`empty-${idx}`} className={`qb-podium__col qb-podium__col--${idx + 1} is-empty`} />;
        const d = delays[idx];
        return (
          <motion.div
            key={p.id}
            className={cx('qb-podium__col', `qb-podium__col--${idx + 1}`, p.id === meId && 'is-me')}
            initial={reduce ? false : { opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d, type: 'spring', stiffness: 120, damping: 16 }}
          >
            <div className="qb-podium__who">
              {idx === 0 && (
                <motion.span
                  className="qb-podium__crown"
                  initial={reduce ? false : { opacity: 0, y: -30, rotate: -20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  transition={{ delay: d + 0.7, type: 'spring', stiffness: 220, damping: 12 }}
                >
                  <QBCrown size={58} />
                </motion.span>
              )}
              <span className="qb-podium__avatar"><QBAvatar p={p} size={idx === 0 ? 'xl' : 'lg'} glow /></span>
              <span className="qb-podium__name">{p.name}</span>
              {p.rep_name && <span className="qb-podium__rep">{p.rep_name}</span>}
              <span className="qb-podium__score">
                <QBNumber value={p.score} duration={1.4} delay={d + 0.3} /> <small>pts</small>
              </span>
            </div>
            <motion.div
              className="qb-podium__block"
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: d + 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="qb-podium__num">{idx + 1}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────── Código QR de la sala ───────────── */

export function QBQrCode({ value, size = 188 }) {
  const qr = useMemo(() => makeQrMatrix(value), [value]);
  if (!qr) return null;
  const q = 2; // zona de silencio (el marco blanco de la tarjeta suma el resto)
  const dim = qr.size + q * 2;
  let d = '';
  qr.modules.forEach((row, y) => row.forEach((dark, x) => { if (dark) d += `M${x + q} ${y + q}h1v1h-1z`; }));
  return (
    <svg className="qb-qr" viewBox={`0 0 ${dim} ${dim}`} width={size} height={size} shapeRendering="crispEdges" role="img" aria-label={`Código QR para unirse: ${value}`}>
      <rect width={dim} height={dim} fill="#fff" />
      <path d={d} fill="#1e1b4b" />
    </svg>
  );
}

/* ───────────── Código de sala en teclas ───────────── */

export function QBCodeTiles({ code, onCopy }) {
  return (
    <button type="button" className="qb-code" onClick={onCopy} title="Pulsa para copiar el código" aria-label={`Código de sala ${code}. Pulsa para copiar`}>
      <span className="qb-code__chars">
        {String(code).split('').map((ch, i) => (
          <motion.span
            key={`${ch}${i}`}
            className="qb-code__char"
            initial={{ opacity: 0, y: -26, rotateX: -60 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
          >
            <span>{ch}</span>
          </motion.span>
        ))}
      </span>
      <span className="qb-code__copy"><Copy size={14} /> Copiar</span>
    </button>
  );
}
