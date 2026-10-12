// Kit de interfaz de juego de EduApps (rediseño 2026).
// Lenguaje visual común para TODAS las apps: escenario, cabecera con marcador,
// pantalla previa de modos, botones y teclas táctiles, paneles, avisos de ronda
// y pantalla de resultados con la nota /10. Contrato y ejemplos: README.md.
//
// Reglas (CLAUDE.md): el kit es SOLO presentación. Nunca decide puntuación,
// tracking ni modos; la app le pasa datos y callbacks.
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, BookOpen, HelpCircle, Clock, Flame, GraduationCap, RefreshCw,
  Sprout, Star, Target, Trophy, Gamepad2, Check, X, AlertTriangle,
} from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { useAppMeta } from './AppMetaContext';
import './gk.css';

export { useAppMeta } from './AppMetaContext';

const cx = (...c) => c.filter(Boolean).join(' ');

const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };

// Los nombres de la configuración llevan a veces un emoji delante ("🎯 Ahorcado"):
// con el título en degradado saldría como una mancha de color.
export const cleanAppName = (name = '') =>
  String(name).replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D\s]+/u, '').trim();

/* ───────────────────────── Escenario ───────────────────────── */

// Contenedor de la app. Sustituye a la "tarjeta blanca" de cada app.
//   accent / accent2: color propio de la app (por defecto violeta / rosa)
//   theme: 'auto' (sigue el tema claro/oscuro) | 'light' | 'dark' (siempre noche)
//   wide: ocupa todo el ancho del contenedor de AppRunnerPage
//   scene: decorado propio de la app (plató, cielo, mar…). Se pinta en la capa
//          de fondo del escenario, por detrás del contenido y sin z-index negativos.
export function GameShell({ children, accent, accent2, theme = 'auto', wide = false, scene = null, className = '', style }) {
  const s = { ...style };
  if (accent) s['--gk-accent'] = accent;
  if (accent2) s['--gk-accent-2'] = accent2;
  return (
    <div className={cx('gk-shell', `gk-theme-${theme}`, wide && 'gk-shell--wide', className)} style={s}>
      <div className="gk-shell__bg" aria-hidden="true">
        <span className="gk-shell__glow gk-shell__glow--a" />
        <span className="gk-shell__glow gk-shell__glow--b" />
        <span className="gk-shell__grid" />
        {scene}
      </div>
      <div className="gk-shell__body">{children}</div>
    </div>
  );
}

// Cabecera: icono + título + curso, chip del modo activo, marcador y ayuda.
//   mode: 'easy' | 'medium' | 'exam' | 'practice' | null → chip de color (modeLabel cambia el texto)
//   onHelp: abre las instrucciones; onStudy: material de estudio
//   right: contenido extra (p. ej. <Hud>)
export function GameHeader({ title, subtitle, icon, mode, modeLabel, onHelp, onStudy, right, compact = false }) {
  const meta = useAppMeta();
  const name = title || cleanAppName(meta.name);
  const course = subtitle ?? courseLabel(meta);
  const iconNode = icon !== undefined ? icon : (meta.appId && hasAppIcon(meta.appId)
    ? <AppIcon appId={meta.appId} size={compact ? 40 : 52} />
    : null);
  return (
    <header className={cx('gk-header', compact && 'gk-header--compact')}>
      <div className="gk-header__id">
        {iconNode && <span className="gk-header__icon">{iconNode}</span>}
        <div className="gk-header__text">
          <h1 className="gk-title">{name}</h1>
          <div className="gk-header__meta">
            {course && <span className="gk-chip gk-chip--soft">{course}</span>}
            {mode && <ModeChip mode={mode} label={modeLabel} />}
          </div>
        </div>
      </div>
      <div className="gk-header__right">
        {right}
        {onStudy && (
          <button type="button" className="gk-iconbtn" onClick={onStudy} title="Material de estudio" aria-label="Material de estudio">
            <BookOpen size={18} />
          </button>
        )}
        {onHelp && (
          <button type="button" className="gk-iconbtn" onClick={onHelp} title="Cómo se juega" aria-label="Cómo se juega">
            <HelpCircle size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

function courseLabel(meta) {
  if (!meta.level) return '';
  const lvl = LEVEL_LABEL[meta.level] || meta.level;
  return meta.grade && meta.level !== 'ad' ? `${meta.grade}º ${lvl}` : lvl;
}

const MODE_INFO = {
  easy: { label: 'Fácil', Icon: Sprout },
  practice: { label: 'Práctica', Icon: Gamepad2 },
  medium: { label: 'Medio', Icon: Flame },
  exam: { label: 'Examen', Icon: GraduationCap },
  test: { label: 'Examen', Icon: GraduationCap },
};

export function ModeChip({ mode, label }) {
  const info = MODE_INFO[mode] || { label: label || mode, Icon: Target };
  const tone = mode === 'exam' || mode === 'test' ? 'exam' : mode === 'medium' ? 'medium' : 'easy';
  return (
    <span className={`gk-chip gk-chip--mode gk-tone-${tone}`}>
      <info.Icon size={13} /> {label || info.label}
    </span>
  );
}

/* ───────────────────────── Marcador ───────────────────────── */

export function Hud({ children, className = '' }) {
  return <div className={cx('gk-hud', className)}>{children}</div>;
}

// Indicador del marcador. El valor "salta" cuando cambia.
//   tone: 'score' | 'streak' | 'lives' | 'time' | 'progress' | 'good' | 'bad' | 'accent'
export function HudStat({ icon: Icon = Star, value, label, tone = 'accent', title }) {
  return (
    <div className={`gk-stat gk-stat--${tone}`} title={title || label}>
      <span className="gk-stat__icon"><Icon size={15} /></span>
      <span className="gk-stat__text">
        <span key={String(value)} className="gk-stat__value">{value}</span>
        {label && <span className="gk-stat__label">{label}</span>}
      </span>
    </div>
  );
}

// Vidas como corazones/iconos.
export function Lives({ total, left, icon: Icon }) {
  return (
    <div className="gk-lives" aria-label={`${left} de ${total} vidas`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cx('gk-life', i < left ? 'is-on' : 'is-off')}>
          {Icon ? <Icon size={16} /> : <HeartGlyph />}
        </span>
      ))}
    </div>
  );
}

const HeartGlyph = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-9.6-9.4C.9 8.1 3 4.5 6.6 4.5c2.1 0 3.5 1.2 4.4 2.6.9-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.6 4.2 7.1C19.5 16.4 12 21 12 21z" fill="currentColor" />
    <path d="M7 7.6c-1.2.2-2.1 1.2-2.2 2.4" stroke="#fff" strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

// Progreso de examen: un punto por pregunta (ok / ko / actual / pendiente).
export function ProgressDots({ total, current, results = [] }) {
  return (
    <div className="gk-dots" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(current + 1, total)}>
      {Array.from({ length: total }).map((_, i) => {
        const r = results[i];
        const state = r === true ? 'ok' : r === false ? 'ko' : i === current ? 'current' : 'pending';
        return (
          <span key={i} className={`gk-dot is-${state}`}>
            {state === 'ok' ? <Check size={12} strokeWidth={3} /> : state === 'ko' ? <X size={12} strokeWidth={3} /> : i + 1}
          </span>
        );
      })}
    </div>
  );
}

// Barra de progreso / temporizador.
export function ProgressBar({ value, max = 1, tone = 'accent', label }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return (
    <div className={`gk-bar gk-bar--${tone}`} aria-label={label}>
      <span className="gk-bar__fill" style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}

/* ───────────────────────── Botones y piezas ───────────────────────── */

// Botón táctil con canto 3D.
//   variant: 'primary' | 'success' | 'danger' | 'warning' | 'soft' | 'ghost'
//   size: 'sm' | 'md' | 'lg'
export const GameButton = React.forwardRef(function GameButton(
  { variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, children, className = '', ...rest },
  ref,
) {
  return (
    <button ref={ref} type="button" className={cx('gk-btn', `gk-btn--${variant}`, `gk-btn--${size}`, className)} {...rest}>
      {Icon && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 17} />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={size === 'lg' ? 20 : size === 'sm' ? 14 : 17} />}
    </button>
  );
});

// Tecla de juego (letras, números, opciones cortas).
//   state: 'idle' | 'correct' | 'wrong' | 'selected' | 'hint'
export function KeyTile({ state = 'idle', className = '', children, ...rest }) {
  return (
    <button type="button" className={cx('gk-key', `is-${state}`, className)} {...rest}>
      <span className="gk-key__face">{children}</span>
    </button>
  );
}

// Opción de respuesta grande (test, millonario, intruso…).
//   letter: A/B/C/D opcional; state como KeyTile
export function AnswerOption({ letter, state = 'idle', children, className = '', ...rest }) {
  return (
    <button type="button" className={cx('gk-answer', `is-${state}`, className)} {...rest}>
      {letter && <span className="gk-answer__letter">{letter}</span>}
      <span className="gk-answer__text">{children}</span>
      {state === 'correct' && <span className="gk-answer__mark"><Check size={18} strokeWidth={3} /></span>}
      {state === 'wrong' && <span className="gk-answer__mark"><X size={18} strokeWidth={3} /></span>}
    </button>
  );
}

// Superficie interior del escenario.
//   variant: 'surface' (cristal claro) | 'screen' (pantalla oscura con brillo) | 'inset' (hundida)
export function Panel({ variant = 'surface', className = '', children, ...rest }) {
  return <div className={cx('gk-panel', `gk-panel--${variant}`, className)} {...rest}>{children}</div>;
}

export function Chip({ tone = 'soft', icon: Icon, children, className = '' }) {
  return (
    <span className={cx('gk-chip', `gk-chip--${tone}`, className)}>
      {Icon && <Icon size={13} />}{children}
    </span>
  );
}

// Selector segmentado (Palabra/Frase, operación, nivel…).
export function Segmented({ options, value, onChange, size = 'md' }) {
  return (
    <div className={`gk-seg gk-seg--${size}`} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          disabled={o.disabled}
          className={cx('gk-seg__opt', value === o.value && 'is-active')}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <o.icon size={15} />} {o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Pantalla previa de modos ───────────────────────── */

const DEFAULT_MODE_ICON = { easy: Sprout, practice: Gamepad2, medium: Flame, exam: GraduationCap };

// Pantalla de inicio de la app: héroe con icono y descripción + tarjetas de modo.
//   modes: [{ id, tone: 'easy'|'medium'|'exam', title, desc, features?: [], icon?, cta? }]
//   onSelect(id); extra: controles opcionales (p. ej. <Segmented>) bajo las tarjetas
export function ModeSelect({ title, description, modes, onSelect, onHelp, onStudy, extra, footer, icon }) {
  const meta = useAppMeta();
  const name = title || cleanAppName(meta.name);
  const desc = description ?? meta.description;
  const iconNode = icon !== undefined ? icon : (meta.appId && hasAppIcon(meta.appId) ? <AppIcon appId={meta.appId} size={112} /> : null);
  return (
    <div className="gk-modes">
      <div className="gk-modes__hero">
        {iconNode && (
          <div className="gk-modes__icon">
            <span className="gk-modes__halo" aria-hidden="true" />
            {iconNode}
          </div>
        )}
        <div className="gk-modes__intro">
          <span className="gk-chip gk-chip--soft">{courseLabel(meta) || 'EduApps'}</span>
          <h1 className="gk-modes__title">{name}</h1>
          {desc && <p className="gk-modes__desc">{desc}</p>}
          {(onHelp || onStudy) && (
            <div className="gk-modes__links">
              {onHelp && <GameButton variant="soft" size="sm" icon={HelpCircle} onClick={onHelp}>Cómo se juega</GameButton>}
              {onStudy && <GameButton variant="soft" size="sm" icon={BookOpen} onClick={onStudy}>Material de estudio</GameButton>}
            </div>
          )}
        </div>
      </div>

      <div className={cx('gk-modes__grid', modes.length === 2 && 'gk-modes__grid--two')}>
        {modes.map((m, i) => {
          const Icon = m.icon || DEFAULT_MODE_ICON[m.tone] || Star;
          return (
            <motion.button
              key={m.id}
              type="button"
              className={`gk-mode gk-tone-${m.tone || 'easy'}`}
              onClick={() => onSelect(m.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="gk-mode__band" aria-hidden="true" />
              <span className="gk-mode__medal"><Icon size={26} /></span>
              <span className="gk-mode__title">{m.title}</span>
              {m.desc && <span className="gk-mode__desc">{m.desc}</span>}
              {m.features?.length > 0 && (
                <span className="gk-mode__features">
                  {m.features.map((f) => <span key={f} className="gk-mode__feat"><Check size={13} strokeWidth={3} /> {f}</span>)}
                </span>
              )}
              <span className="gk-mode__cta">{m.cta || 'Jugar'} <ArrowRight size={16} /></span>
            </motion.button>
          );
        })}
      </div>

      {extra && <div className="gk-modes__extra">{extra}</div>}
      {footer && <div className="gk-modes__footer">{footer}</div>}
    </div>
  );
}

/* ───────────────────────── Aviso de ronda ───────────────────────── */

// Banda que aparece al terminar una ronda (acierto / fallo / info).
export function RoundBanner({ show, status = 'won', title, subtitle, action, actionLabel, actionIcon = ArrowRight }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`gk-round gk-round--${status}`}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          role="status"
        >
          <span className="gk-round__badge" aria-hidden="true">
            {status === 'won' ? <Check size={22} strokeWidth={3} /> : status === 'lost' ? <X size={22} strokeWidth={3} /> : <Star size={20} />}
          </span>
          <div className="gk-round__text">
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </div>
          {action && (
            <GameButton variant={status === 'lost' ? 'soft' : 'primary'} iconRight={actionIcon} onClick={action} autoFocus>
              {actionLabel}
            </GameButton>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────── Resultados ───────────────────────── */

export const notaTone = (n) => (n >= 8 ? 'good' : n >= 5 ? 'ok' : 'bad');
export const notaMessage = (n) => (n >= 9 ? 'Excelente' : n >= 7 ? 'Muy bien' : n >= 5 ? 'Aprobado' : 'Necesitas repasar');

function useCountUp(target, duration = 1100) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? target : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (reduce) { setV(target); return undefined; }
    const start = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - (1 - k) ** 3;
      setV(target * e);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, reduce]);
  return v;
}

// Anillo de nota /10 (el elemento más prominente del resumen, CLAUDE.md §3.1).
export function GradeRing({ nota, size = 188 }) {
  const shown = useCountUp(nota);
  const tone = notaTone(nota);
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className={`gk-ring gk-ring--${tone}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="gk-ring__track" />
        <circle
          cx="50" cy="50" r={r}
          className="gk-ring__arc"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(10, shown)) / 10)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="gk-ring__center">
        <span className="gk-ring__value">{shown.toFixed(1).replace('.', ',')}</span>
        <span className="gk-ring__max">/10</span>
      </div>
    </div>
  );
}

// Pantalla de resultados del examen.
//   nota: 0-10 (ya calculada por la app); points: puntos paralelos (sin tope)
//   stats: [{ icon, label, value, tone }]; children: retroalimentación por pregunta
//   actions: [{ label, onClick, variant, icon }]
// mode: 'exam' (por defecto) | 'practice' | 'easy' | 'medium' → chip y título por defecto.
export function ResultsScreen({ mode = 'exam', title, subtitle, nota, points, pointsLabel = 'puntos', stats = [], actions = [], children }) {
  const isExam = mode === 'exam' || mode === 'test';
  const heading = title || (isExam ? 'Examen terminado' : '¡Partida terminada!');
  const meta = useAppMeta();
  const pts = useCountUp(points || 0, 1300);
  const tone = notaTone(nota);
  return (
    <motion.div
      className={`gk-results gk-results--${tone}`}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 170, damping: 20 }}
    >
      <div className="gk-results__top">
        <ModeChip mode={isExam ? 'exam' : mode} />
        <h2 className="gk-results__title">{heading}</h2>
        {(subtitle || meta.name) && <p className="gk-results__subtitle">{subtitle || cleanAppName(meta.name)}</p>}
      </div>

      <div className="gk-results__hero">
        <span className="gk-results__burst" aria-hidden="true" />
        <GradeRing nota={nota} />
        <div className="gk-results__verdict">
          <strong>{notaMessage(nota)}</strong>
          {points != null && (
            <span className="gk-results__points">
              <Trophy size={16} /> {Math.round(pts).toLocaleString('es-ES')} <small>{pointsLabel}</small>
            </span>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <div className="gk-results__stats">
          {stats.map((s) => {
            const Icon = s.icon || (s.tone === 'time' ? Clock : Star);
            return (
              <div key={s.label} className={`gk-results__stat gk-stat--${s.tone || 'accent'}`}>
                <span className="gk-stat__icon"><Icon size={15} /></span>
                <span className="gk-results__stat-value">{s.value}</span>
                <span className="gk-results__stat-label">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {children && <div className="gk-results__detail">{children}</div>}

      {actions.length > 0 && (
        <div className="gk-results__actions">
          {actions.map((a, i) => (
            <GameButton key={a.label} variant={a.variant || (i === 0 ? 'primary' : 'soft')} size="lg" icon={a.icon || (i === 0 ? RefreshCw : undefined)} onClick={a.onClick}>
              {a.label}
            </GameButton>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Fila de retroalimentación de una pregunta dentro de ResultsScreen.
export function FeedbackItem({ index, ok, title, children }) {
  return (
    <div className={cx('gk-fb', ok ? 'is-ok' : 'is-ko')}>
      <span className="gk-fb__num">{index}</span>
      <div className="gk-fb__body">
        <div className="gk-fb__head">
          <strong>{title}</strong>
          <span className="gk-fb__state">{ok ? <><Check size={13} strokeWidth={3} /> Correcta</> : <><X size={13} strokeWidth={3} /> Incorrecta</>}</span>
        </div>
        {children && <div className="gk-fb__text">{children}</div>}
      </div>
    </div>
  );
}

/* ───────────────────────── Diálogo de confirmación ───────────────────────── */

// Modal propio (CLAUDE.md: nunca window.confirm). tone: 'warning' | 'danger'
export function ConfirmDialog({ open, title, children, confirmLabel = 'Sí, continuar', cancelLabel = 'Cancelar', onConfirm, onCancel, tone = 'warning', icon: Icon = AlertTriangle }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="gk-dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            className={`gk-dialog gk-dialog--${tone}`}
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="gk-dialog__icon"><Icon size={26} /></span>
            <h3>{title}</h3>
            {children && <p>{children}</p>}
            <div className="gk-dialog__actions">
              <GameButton variant="soft" onClick={onCancel}>{cancelLabel}</GameButton>
              <GameButton variant={tone === 'danger' ? 'danger' : 'warning'} onClick={onConfirm} autoFocus>{confirmLabel}</GameButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────── Estados vacíos / carga ───────────────────────── */

export function GameLoading({ label = 'Preparando el juego…' }) {
  return (
    <div className="gk-loading" role="status">
      <span className="gk-loading__dots"><i /><i /><i /></span>
      <span>{label}</span>
    </div>
  );
}

export function GameEmpty({ title = 'Sin contenido', children, action }) {
  return (
    <div className="gk-empty">
      <span className="gk-empty__icon"><BookOpen size={28} /></span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
