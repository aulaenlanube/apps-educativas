import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Dices, Sparkles } from 'lucide-react';
import Mascot from '@/components/Mascot';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import './MascotSlotMachine.css';

// "Máquina del azar" del selector de apps: la mascota pulsa el botón de una
// tragaperras, el rodillo de apps gira y frena poco a poco, cae el premio, el
// robot lo celebra y se abre la app elegida (onAppSelected, como antes).
//
// Fases: idle → press (el robot pulsa) → spin (rodillo) → win (premio) → abrir.
const splitEmoji = (title = '') => {
  const m = String(title).match(/^([\p{Extended_Pictographic}\p{Emoji_Presentation}️‍]+)\s*(.*)$/u);
  return m ? { emoji: m[1], text: m[2] } : { emoji: '', text: title };
};

const BULBS = 16;

function ReelItem({ app, featured }) {
  const { emoji, text } = splitEmoji(app?.name);
  return (
    <div className={`slot-item ${featured ? 'is-featured' : ''}`}>
      <span className="slot-item__icon">
        {app && hasAppIcon(app.id) ? <AppIcon appId={app.id} size={featured ? 52 : 34} /> : <span className="slot-item__emoji">{emoji || '🎲'}</span>}
      </span>
      <span className="slot-item__name">{text}</span>
    </div>
  );
}

export default function MascotSlotMachine({ apps, onAppSelected }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndexState] = useState(0);
  const indexRef = useRef(0);
  const setIndex = useCallback((v) => {
    const next = typeof v === 'function' ? v(indexRef.current) : v;
    indexRef.current = next;
    setIndexState(next);
  }, []);
  const [phase, setPhase] = useState('idle'); // idle | press | spin | win
  const [robotAct, setRobotAct] = useState(null);
  const [actKey, setActKey] = useState(0);
  const timers = useRef([]);
  const rootRef = useRef(null);
  const visibleRef = useRef(true);
  const n = apps.length;

  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const act = useCallback((id) => { setRobotAct(id); setActKey((k) => k + 1); }, []);

  // Rodillo en reposo: avanza despacio para que se vean las apps (solo visible).
  useEffect(() => {
    const el = rootRef.current;
    let io;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; });
      io.observe(el);
    }
    if (phase !== 'idle' || n < 2) return () => io?.disconnect();
    const id = setInterval(() => {
      if (visibleRef.current && !document.hidden) setIndex((i) => (i + 1) % n);
    }, 1800);
    return () => { clearInterval(id); io?.disconnect(); };
  }, [phase, n, setIndex]);

  const spin = useCallback(() => {
    if (phase !== 'idle' || n === 0) return;
    const winner = Math.floor(Math.random() * n);
    setPhase('press');
    act('press');

    const startReel = () => {
      setPhase('spin');
      act('watch');
      // Número exacto de pasos para caer en la ganadora y reparto de una duración
      // fija (~2,6 s) con frenado progresivo: cada paso dura un poco más.
      const start = indexRef.current;
      const base = reduceMotion ? 1 : Math.max(18, n * 2);
      const total = base + ((winner - (start + base)) % n + n) % n;
      const duration = reduceMotion ? 200 : 2600;
      const weights = Array.from({ length: total }, (_, k) => 1 + 7 * (k / total) ** 2.2);
      const wsum = weights.reduce((a, b) => a + b, 0);
      let k = 0;
      const tick = () => {
        const next = (indexRef.current + 1) % n;
        setIndex(next);
        k += 1;
        if (k >= total) {
          later(() => {
            setPhase('win');
            act('cheer');
            try {
              const r = rootRef.current?.querySelector('.slot__window')?.getBoundingClientRect();
              confetti({
                particleCount: 110,
                spread: 80,
                startVelocity: 38,
                origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : { y: 0.5 },
                colors: ['#a855f7', '#ec4899', '#fbbf24', '#22d3ee', '#10b981'],
              });
            } catch { /* sin canvas */ }
            later(() => onAppSelected(apps[winner]), 1700);
          }, 120);
        } else {
          later(tick, (duration * weights[k]) / wsum);
        }
      };
      later(tick, 30);
    };
    later(startReel, reduceMotion ? 50 : 520);
  }, [phase, n, apps, onAppSelected, act, reduceMotion, setIndex]);

  const rows = useMemo(() => (n ? [apps[(index - 1 + n) % n], apps[index], apps[(index + 1) % n]] : []), [apps, index, n]);
  if (n < 2) return null;
  const winnerName = splitEmoji(apps[index]?.name).text;

  return (
    <motion.section
      ref={rootRef}
      className={`slot-stage is-${phase}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Máquina del azar"
    >
      <div className="slot-stage__robot">
        <Mascot context="apps" act={robotAct} actKey={actKey} onActEnd={(id) => { if (id !== 'watch') setRobotAct(null); }} />
      </div>

      <div className="slot">
        <div className="slot__marquee">
          <div className="slot__bulbs" aria-hidden="true">
            {Array.from({ length: BULBS }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
          </div>
          <span className="slot__title"><Sparkles size={16} /> Máquina del azar <Sparkles size={16} /></span>
        </div>

        <div className="slot__body">
          <button
            type="button"
            className="slot__button"
            onClick={spin}
            disabled={phase !== 'idle'}
            aria-label="Pulsar el botón: elegir una app al azar"
          >
            <span className="slot__button-cap" />
          </button>

          <div className="slot__window" aria-live="polite">
            <span className="slot__payline slot__payline--l" aria-hidden="true" />
            <span className="slot__payline slot__payline--r" aria-hidden="true" />
            <div className="slot__reel">
              <div className="slot__row slot__row--0"><ReelItem app={rows[0]} /></div>
              <motion.div
                key={index}
                className="slot__row slot__row--1"
                initial={{ y: phase === 'spin' ? -18 : -10, opacity: phase === 'spin' ? 0.6 : 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: phase === 'spin' ? 0.06 : 0.3, ease: 'easeOut' }}
              >
                <ReelItem app={rows[1]} featured />
              </motion.div>
              <div className="slot__row slot__row--2"><ReelItem app={rows[2]} /></div>
            </div>
            {phase === 'win' && <span className="slot__win-glow" aria-hidden="true" />}
          </div>

          <div className={`slot__lever ${phase === 'press' || phase === 'spin' ? 'is-pulled' : ''}`} aria-hidden="true">
            <span className="slot__lever-stick" />
            <span className="slot__lever-ball" />
          </div>
        </div>

        <div className="slot__tray">
          {phase === 'win' ? (
            <strong className="slot__result">¡Te toca: {winnerName}!</strong>
          ) : (
            <button type="button" className="slot__cta" onClick={spin} disabled={phase !== 'idle'}>
              <Dices size={18} /> {phase === 'idle' ? '¡Que elija el azar!' : 'Girando…'}
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
