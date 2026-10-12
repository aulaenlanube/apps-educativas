// Kit de los paneles (dashboard) de alumno, docente y usuario libre (rediseño 2026).
// Lenguaje visual común: fondo temático por rol, cabecera-héroe con avatar,
// nivel y XP, dock de pestañas, tarjetas, indicadores, anillos, minigráficas,
// tarjetas de misión y estados vacíos con la mascota. Ver README.md.
//
// Solo presentación: los datos y acciones los ponen las páginas.
import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import RobotMascot from '@/components/RobotMascot';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import './dk.css';

const cx = (...c) => c.filter(Boolean).join(' ');

/* ───────────────────────── Página ───────────────────────── */

// role: 'student' (vibrante, juego) | 'teacher' (sereno, profesional) | 'free' (cálido)
export function DashPage({ role = 'student', children, className = '' }) {
  return (
    <div className={cx('dk-page', `dk-role-${role}`, className)}>
      <div className="dk-page__bg" aria-hidden="true">
        <span className="dk-page__blob dk-page__blob--a" />
        <span className="dk-page__blob dk-page__blob--b" />
        <span className="dk-page__blob dk-page__blob--c" />
        <span className="dk-page__dots" />
      </div>
      <div className="dk-page__inner">{children}</div>
    </div>
  );
}

/* ───────────────────────── Héroe ───────────────────────── */

// Cabecera grande del panel.
//   avatar: nodo (p. ej. <UserAvatar size="xl" />); title; subtitle; chips: nodos
//   level / xp / xpNext: muestra escudo de nivel y barra de XP
//   stats: [{ icon, value, label, tone }] (racha, monedas, puesto…)
//   actions: nodos (botones); mascot: true → robot saludando con su repertorio
export function DashHero({ avatar, title, subtitle, chips, level, xp, xpNext, xpLabel, stats = [], actions, mascot = false, mascotContext = 'home', children }) {
  return (
    <section className="dk-hero">
      <div className="dk-hero__art" aria-hidden="true">
        <span className="dk-hero__ring dk-hero__ring--1" />
        <span className="dk-hero__ring dk-hero__ring--2" />
        <span className="dk-hero__shine" />
      </div>
      <div className="dk-hero__main">
        {avatar && (
          <div className="dk-hero__avatar">
            {avatar}
            {level != null && <LevelShield level={level} />}
          </div>
        )}
        <div className="dk-hero__text">
          <h1 className="dk-hero__title">{title}</h1>
          {subtitle && <p className="dk-hero__subtitle">{subtitle}</p>}
          {chips && <div className="dk-hero__chips">{chips}</div>}
          {xp != null && xpNext != null && <XPBar value={xp} max={xpNext} label={xpLabel} level={level} />}
        </div>
        {stats.length > 0 && (
          <div className="dk-hero__stats">
            {stats.map((s) => <HeroStat key={s.label} {...s} />)}
          </div>
        )}
        {mascot && (
          <div className="dk-hero__mascot">
            <RobotMascot context={mascotContext} />
          </div>
        )}
      </div>
      {actions && <div className="dk-hero__actions">{actions}</div>}
      {children}
    </section>
  );
}

function HeroStat({ icon: Icon, value, label, tone = 'accent' }) {
  return (
    <div className={`dk-herostat dk-tone-${tone}`}>
      {Icon && <span className="dk-herostat__icon"><Icon size={18} /></span>}
      <span className="dk-herostat__value">{value}</span>
      <span className="dk-herostat__label">{label}</span>
    </div>
  );
}

// Escudo con el nivel (esquina del avatar).
export function LevelShield({ level }) {
  return (
    <span className="dk-shield" title={`Nivel ${level}`}>
      <svg viewBox="0 0 40 46" aria-hidden="true">
        <defs>
          <linearGradient id="dk-shield-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset=".5" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <path d="M20 2 L37 8 V22 C37 33 29 41 20 44 C11 41 3 33 3 22 V8 Z" fill="url(#dk-shield-g)" stroke="#78350f" strokeWidth="2" />
        <path d="M20 6 L33 10.5 V22 C33 30.5 27 36.5 20 39.5 C13 36.5 7 30.5 7 22 V10.5 Z" fill="#6d28d9" />
        <path d="M9 12 L20 8 L31 12" stroke="#fff" strokeOpacity=".45" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span className="dk-shield__num">{level}</span>
    </span>
  );
}

// Barra de experiencia con brillo.
export function XPBar({ value, max, label, level }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div className="dk-xp">
      <div className="dk-xp__track">
        <span className="dk-xp__fill" style={{ transform: `scaleX(${pct})` }} />
        <span className="dk-xp__shine" style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="dk-xp__meta">
        <span>{label || (level != null ? `Nivel ${level}` : 'Experiencia')}</span>
        <span className="dk-xp__nums">{Number(value).toLocaleString('es-ES')} / {Number(max).toLocaleString('es-ES')} XP</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Dock de pestañas ───────────────────────── */

// tabs: [{ id, label, icon, badge }]; value; onChange(id)
export function DashDock({ tabs, value, onChange, sticky = true }) {
  return (
    <nav className={cx('dk-dock', sticky && 'dk-dock--sticky')} role="tablist">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cx('dk-dock__tab', active && 'is-active')}
            onClick={() => onChange(t.id)}
          >
            {active && <motion.span layoutId="dk-dock-pill" className="dk-dock__pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            {t.icon && <t.icon size={17} className="dk-dock__icon" />}
            <span className="dk-dock__label">{t.label}</span>
            {t.badge ? <span className="dk-dock__badge">{t.badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

/* ───────────────────────── Tarjetas ───────────────────────── */

// Tarjeta de sección. tone colorea el icono y el filo superior.
export function DashCard({ icon: Icon, title, subtitle, tone = 'violet', actions, children, className = '', padded = true, as: Comp = 'section', ...rest }) {
  return (
    <Comp className={cx('dk-card', `dk-tone-${tone}`, className)} {...rest}>
      {(title || actions) && (
        <header className="dk-card__head">
          {Icon && <span className="dk-card__icon"><Icon size={18} /></span>}
          <div className="dk-card__titles">
            {title && <h2 className="dk-card__title">{title}</h2>}
            {subtitle && <p className="dk-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="dk-card__actions">{actions}</div>}
        </header>
      )}
      <div className={cx('dk-card__body', !padded && 'dk-card__body--flush')}>{children}</div>
    </Comp>
  );
}

function useCountUp(target, duration = 900) {
  const reduce = useReducedMotion();
  const numeric = typeof target === 'number' && Number.isFinite(target);
  const [v, setV] = useState(numeric && !reduce ? 0 : target);
  const raf = useRef(0);
  useEffect(() => {
    if (!numeric || reduce) { setV(target); return undefined; }
    const start = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      setV(target * (1 - (1 - k) ** 3));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, numeric, reduce]);
  return v;
}

// Indicador con número que cuenta. value numérico (format opcional) o texto.
export function StatTile({ icon: Icon, value, label, sub, tone = 'violet', format, progress, onClick }) {
  const shown = useCountUp(value);
  const text = typeof value === 'number' ? (format ? format(shown) : Math.round(shown).toLocaleString('es-ES')) : value;
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp type={onClick ? 'button' : undefined} className={cx('dk-stat', `dk-tone-${tone}`, onClick && 'is-clickable')} onClick={onClick}>
      {Icon && <span className="dk-stat__icon"><Icon size={20} /></span>}
      <span className="dk-stat__value">{text}</span>
      <span className="dk-stat__label">{label}</span>
      {sub && <span className="dk-stat__sub">{sub}</span>}
      {progress != null && <span className="dk-stat__bar"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }} /></span>}
    </Comp>
  );
}

// Anillo de progreso genérico (nota, % de tareas…).
export function ProgressRing({ value, max = 10, size = 76, stroke = 8, tone, children, label }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const r = 50 - stroke / 2 - 2;
  const c = 2 * Math.PI * r;
  const auto = max === 10 ? (value >= 8 ? 'good' : value >= 5 ? 'ok' : 'bad') : 'violet';
  return (
    <div className={`dk-ring dk-tone-${tone || auto}`} style={{ width: size, height: size }} aria-label={label}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="dk-ring__track" strokeWidth={stroke} />
        <circle cx="50" cy="50" r={r} className="dk-ring__arc" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 50 50)" />
      </svg>
      <div className="dk-ring__center">{children}</div>
    </div>
  );
}

// Minigráfica de barras (actividad diaria…). data: [{ label, value }]
export function MiniBars({ data, height = 120, tone = 'violet', formatTip }) {
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  return (
    <div className={`dk-bars dk-tone-${tone}`} style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label ?? i} className="dk-bars__col" title={formatTip ? formatTip(d) : `${d.label}: ${d.value}`}>
          <span className="dk-bars__bar" style={{ height: `${Math.max(d.value ? 6 : 2, (d.value / max) * 100)}%`, '--i': i }} />
        </div>
      ))}
    </div>
  );
}

// Fila de barra horizontal (asignaturas, reparto…).
export function MeterRow({ label, value, max = 1, right, tone = 'violet', icon }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div className={`dk-meter dk-tone-${tone}`}>
      <span className="dk-meter__label">{icon}{label}</span>
      <span className="dk-meter__track"><i style={{ transform: `scaleX(${pct})` }} /></span>
      {right != null && <span className="dk-meter__right">{right}</span>}
    </div>
  );
}

/* ───────────────────────── Misiones (tareas) ───────────────────────── */

// Tarjeta de misión. status: 'pending' | 'done' | 'overdue' | 'duel'
//   appId para el icono; nota (0-10) si hay; due: texto; reward: texto; onPlay
export function QuestCard({ appId, title, subtitle, status = 'pending', nota, due, reward, meta, onPlay, playLabel = 'Jugar', children }) {
  return (
    <article className={`dk-quest is-${status}`}>
      <span className="dk-quest__icon">
        {appId && hasAppIcon(appId) ? <AppIcon appId={appId} size={54} /> : <span className="dk-quest__icon-fallback">🎯</span>}
      </span>
      <div className="dk-quest__body">
        <div className="dk-quest__top">
          <h3 className="dk-quest__title">{title}</h3>
          {status === 'done' && <span className="dk-pill dk-pill--good">Completada</span>}
          {status === 'overdue' && <span className="dk-pill dk-pill--bad">Vencida</span>}
          {status === 'duel' && <span className="dk-pill dk-pill--duel">Duelo</span>}
          {status === 'pending' && <span className="dk-pill dk-pill--warn">Pendiente</span>}
        </div>
        {subtitle && <p className="dk-quest__subtitle">{subtitle}</p>}
        <div className="dk-quest__meta">
          {due && <span className="dk-quest__due">{due}</span>}
          {reward && <span className="dk-quest__reward">{reward}</span>}
          {meta}
        </div>
        {children}
      </div>
      <div className="dk-quest__side">
        {nota != null && (
          <ProgressRing value={nota} size={58} stroke={9} label={`Nota ${nota}`}>
            <span className="dk-quest__nota">{Number(nota).toLocaleString('es-ES', { maximumFractionDigits: 1 })}</span>
          </ProgressRing>
        )}
        {onPlay && (
          <button type="button" className="dk-btn dk-btn--primary dk-btn--sm" onClick={onPlay}>
            {playLabel} <ChevronRight size={15} />
          </button>
        )}
      </div>
    </article>
  );
}

/* ───────────────────────── Varios ───────────────────────── */

export function Pill({ tone = 'soft', icon: Icon, children, className = '' }) {
  return <span className={cx('dk-pill', `dk-pill--${tone}`, className)}>{Icon && <Icon size={13} />}{children}</span>;
}

export const DashButton = React.forwardRef(function DashButton({ variant = 'primary', size = 'md', icon: Icon, children, className = '', ...rest }, ref) {
  return (
    <button ref={ref} type="button" className={cx('dk-btn', `dk-btn--${variant}`, `dk-btn--${size}`, className)} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 15 : 18} />}{children}
    </button>
  );
});

// Estado vacío con la mascota.
export function DashEmpty({ title, children, action, mascot = true }) {
  return (
    <div className="dk-empty">
      {mascot && <div className="dk-empty__robot"><RobotMascot expression="confused" /></div>}
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function SectionGrid({ cols = 2, children, className = '' }) {
  return <div className={cx('dk-grid', `dk-grid--${cols}`, className)}>{children}</div>;
}
