// src/apps/celula-animal/CelulaUI.jsx
// Piezas de interfaz compartidas por La Célula Animal y La Célula Vegetal
// (rediseño 2026 sobre el kit _shared/kit). SOLO presentación: la lógica de
// exploración, test y reto (y sus datos) vive en cada app, que pasa estado y
// callbacks. Célula Vegetal importa este módulo desde aquí.
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Crosshair, Puzzle, HelpCircle, ZoomOut, X, Activity, Box, Lightbulb,
  Microscope, Target, Check, Leaf, Zap, Flame, RefreshCw, ArrowLeft, CheckCheck,
  MousePointerClick, Undo2, Trophy, Clock,
} from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import {
  GameShell, Segmented, GameButton, AnswerOption, ModeSelect, ResultsScreen, FeedbackItem,
  useAppMeta, cleanAppName,
} from '../_shared/kit';
import './CelulaUI.css';

const cx = (...c) => c.filter(Boolean).join(' ');

const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };
const courseOf = (meta) => {
  if (!meta.level) return '';
  const lvl = LEVEL_LABEL[meta.level] || meta.level;
  return meta.grade && meta.level !== 'ad' ? `${meta.grade}º ${lvl}` : lvl;
};

const ACCENTS = {
  animal: { accent: '#a78bfa', accent2: '#fb7185' },
  vegetal: { accent: '#84cc16', accent2: '#10b981' },
};

/* ───────────────────────── Escenario ───────────────────────── */

// Escenario a pantalla completa (preset dark-glass): platina de microscopio
// con luz de lente, escala micrométrica y motas en suspensión.
export function CelShell({ variant = 'animal', mode, drawerOpen = false, children }) {
  return (
    <GameShell
      theme="dark"
      wide
      {...ACCENTS[variant]}
      className={cx('cel-shell', `cel-shell--${variant}`, mode && `is-${mode}`, drawerOpen && 'has-drawer')}
    >
      <div className="cel-backdrop" aria-hidden="true">
        <span className="cel-backdrop__light" />
        <span className="cel-backdrop__scale" />
        <span className="cel-backdrop__ring" />
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className="cel-mote"
            style={{ '--i': i, left: `${(i * 53) % 92 + 4}%`, top: `${(i * 37) % 84 + 8}%` }}
          />
        ))}
      </div>
      {children}
    </GameShell>
  );
}

/* ───────────────────────── Barra superior ───────────────────────── */

const MODE_OPTS = [
  { value: 'explore', label: 'Explorar', icon: Compass },
  { value: 'quiz', label: 'Test', icon: Crosshair },
  { value: 'match', label: 'Reto', icon: Puzzle },
];

// Identidad de la app + actividades (Explorar / Test / Reto) + marcador + ayuda.
// No hay modos de dificultad: la app es single_mode (CLAUDE.md §3).
export function CelTopBar({ mode, onMode, onHelp, stat, zoomed, onResetZoom }) {
  const meta = useAppMeta();
  const name = cleanAppName(meta.name);
  return (
    <header className="cel-topbar">
      <div className="cel-topbar__id">
        {meta.appId && hasAppIcon(meta.appId) && (
          <span className="cel-topbar__icon"><AppIcon appId={meta.appId} size={38} /></span>
        )}
        <span className="cel-topbar__text">
          <strong>{name}</strong>
          {courseOf(meta) && <span>{courseOf(meta)}</span>}
        </span>
      </div>
      <Segmented options={MODE_OPTS} value={mode} onChange={onMode} size="sm" />
      <div className="cel-topbar__right">
        {zoomed && (
          <button type="button" className="cel-zoomreset" onClick={onResetZoom} title="Restaurar zoom">
            <ZoomOut size={15} /> 1:1
          </button>
        )}
        {stat}
        <button type="button" className="gk-iconbtn" onClick={onHelp} title="Cómo se juega" aria-label="Cómo se juega">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}

// Marcador compacto con anillo de progreso (explorados, asignadas…).
export function CelMeter({ value, max, label, icon: Icon = Microscope, tone = 'accent' }) {
  const pct = max ? Math.max(0, Math.min(1, value / max)) : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className={`cel-meter cel-meter--${tone}`} title={label}>
      <span className="cel-meter__ring">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r={r} className="cel-meter__track" />
          <circle
            cx="18" cy="18" r={r}
            className="cel-meter__arc"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            transform="rotate(-90 18 18)"
          />
        </svg>
        <Icon size={14} />
      </span>
      <span className="cel-meter__text">
        <span key={value} className="cel-meter__value">{value}<small>/{max}</small></span>
        <span className="cel-meter__label">{label}</span>
      </span>
    </div>
  );
}

// Marcador de puntos del test.
export function CelScore({ value }) {
  return (
    <div className="cel-meter cel-meter--score" title="Puntos">
      <span className="cel-meter__ring cel-meter__ring--solid"><Trophy size={15} /></span>
      <span className="cel-meter__text">
        <span key={value} className="cel-meter__value">{value}</span>
        <span className="cel-meter__label">Puntos</span>
      </span>
    </div>
  );
}

/* ───────────────────────── Marcadores sobre la célula ───────────────────────── */

export function CelPin({ style, name, color, visited, active, onClick }) {
  return (
    <div className={cx('cel-pin', visited && 'is-visited', active && 'is-active')} style={{ ...style, '--org': color }}>
      <button type="button" className="cel-pin__dot" onClick={onClick} aria-label={name}>
        {visited && !active && <Check size={9} strokeWidth={4} />}
      </button>
      <button type="button" className="cel-pin__tag" onClick={onClick} tabIndex={-1}>{name}</button>
    </div>
  );
}

export function CelHint({ show, children }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="cel-hint"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
        >
          <span className="cel-hint__icon"><MousePointerClick size={15} /></span>
          <span>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────── Ficha del orgánulo ───────────────────────── */

// Encuadre de la lente: centro en la etiqueta del orgánulo (o el que fije la app).
export const lensViewBox = (org, overrides = {}, svgW = 600, svgH = 500) => {
  const o = overrides[org.id] || {};
  const size = o.size || 170;
  const x = o.x ?? (org.labelPos.x / 100) * svgW;
  const y = o.y ?? (org.labelPos.y / 100) * svgH;
  return `${x - size / 2} ${y - size / 2} ${size} ${size}`;
};

export function CelDrawer({ org, color, lens, onClose, position, total }) {
  return (
    <AnimatePresence mode="wait">
      {org && (
        <motion.aside
          key={org.id}
          className="cel-drawer"
          style={{ '--org': color }}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24, transition: { duration: 0.14 } }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          aria-label={`Ficha: ${org.name}`}
        >
          <button type="button" className="gk-iconbtn cel-drawer__close" onClick={onClose} title="Cerrar ficha" aria-label="Cerrar ficha">
            <X size={18} />
          </button>

          <div className="cel-drawer__hero">
            <div className="cel-lens">
              <div className="cel-lens__view">{lens}</div>
              <span className="cel-lens__glass" aria-hidden="true" />
              <span className="cel-lens__reticle" aria-hidden="true" />
              <span className="cel-lens__mag">×400</span>
            </div>
            <div className="cel-drawer__title">
              <span className="cel-drawer__kicker">
                <span className="cel-drawer__emoji" aria-hidden="true">{org.icon}</span>
                {org.subtitle}
              </span>
              <h2>{org.name}</h2>
              {position != null && <span className="cel-drawer__count">Orgánulo {position} de {total}</span>}
            </div>
          </div>

          <div className="cel-drawer__body">
            <p className="cel-drawer__desc">{org.description}</p>

            <section className="cel-card">
              <h3><span className="cel-card__icon"><Activity size={14} /></span> Funciones</h3>
              <ul className="cel-funcs">
                {org.functions.map((f) => (
                  <li key={f}><span className="cel-funcs__tick"><Check size={11} strokeWidth={3.5} /></span>{f}</li>
                ))}
              </ul>
            </section>

            <section className="cel-card">
              <h3><span className="cel-card__icon"><Box size={14} /></span> Estructura</h3>
              <p>{org.structure}</p>
            </section>

            <section className="cel-fact">
              <span className="cel-fact__icon"><Lightbulb size={18} /></span>
              <div>
                <h4>¿Sabías que…?</h4>
                <p>{org.funFact}</p>
              </div>
            </section>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────── Bandeja de orgánulos ───────────────────────── */

export function CelDock({ items, colors, selectedId, visitedIds, onSelect }) {
  return (
    <nav className="cel-dock" aria-label="Orgánulos">
      <div className="cel-dock__tray">
        {items.map((org) => {
          const visited = visitedIds.has(org.id);
          const active = selectedId === org.id;
          return (
            <button
              key={org.id}
              type="button"
              className={cx('cel-tile', active && 'is-active', visited && 'is-visited')}
              style={{ '--org': colors[org.id] }}
              onClick={() => onSelect(org.id)}
              aria-label={org.name}
              aria-pressed={active}
            >
              <span className="cel-tile__face"><span className="cel-tile__emoji">{org.icon}</span></span>
              {visited && <span className="cel-tile__check"><Check size={9} strokeWidth={4} /></span>}
              <span className="cel-tile__tip">{org.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ───────────────────────── Test: encuentra el orgánulo ───────────────────────── */

export function CelQuest({ target, color, index, total }) {
  if (!target) return null;
  return (
    <div className="cel-quest" style={{ '--org': color }}>
      <span className="cel-quest__radar" aria-hidden="true"><Crosshair size={22} /></span>
      <div className="cel-quest__text">
        <span className="cel-quest__kicker">
          Encuentra en la célula{total ? ` · ${index} de ${total}` : ''}
        </span>
        <AnimatePresence mode="wait">
          <motion.strong
            key={target.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {target.name}
          </motion.strong>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CelToast({ feedback, clickedName }) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={`${feedback.id}-${feedback.isCorrect}`}
          className={cx('cel-toast', feedback.isCorrect ? 'is-ok' : 'is-ko')}
          initial={{ opacity: 0, y: -16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          role="status"
        >
          {feedback.isCorrect && (
            <span className="cel-burst" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--n': i }} />)}
            </span>
          )}
          <span className="cel-toast__badge">
            {feedback.isCorrect ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
          </span>
          <span className="cel-toast__text">
            <strong>{feedback.isCorrect ? '¡Correcto!' : '¡Inténtalo de nuevo!'}</strong>
            {!feedback.isCorrect && clickedName && <span>Eso es: {clickedName}</span>}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Capa con panel centrado (Reto y resultados del Test).
function CelOverlay({ children }) {
  return (
    <motion.div className="cel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <motion.div
        className="cel-panel"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

/* ───────────────────────── Test: resultados ───────────────────────── */

// results: [{ id, name, icon, firstTry, misses }] en el orden en que se pidieron.
export function CelQuizResults({ nota, points, results, seconds, onReplay, onExit }) {
  const firstTry = results.filter((r) => r.firstTry).length;
  return (
    <CelOverlay>
      <ResultsScreen
        title="Test completado"
        subtitle="Encuentra cada orgánulo en la célula"
        nota={nota}
        points={points}
        stats={[
          { icon: Target, tone: 'good', label: 'A la primera', value: `${firstTry}/${results.length}` },
          { icon: Clock, tone: 'time', label: 'Tiempo', value: fmtTime(seconds) },
        ]}
        actions={[
          { label: 'Repetir test', onClick: onReplay, icon: RefreshCw },
          { label: 'Volver a explorar', onClick: onExit, icon: Compass, variant: 'soft' },
        ]}
      >
        {results.map((r, i) => (
          <FeedbackItem key={r.id} index={i + 1} ok={r.firstTry} title={`${r.icon} ${r.name}`}>
            {r.firstTry ? 'Encontrado a la primera' : `Encontrado tras ${r.misses} ${r.misses === 1 ? 'fallo' : 'fallos'}`}
          </FeedbackItem>
        ))}
      </ResultsScreen>
    </CelOverlay>
  );
}

/* ───────────────────────── Reto: relaciona orgánulo y función ───────────────────────── */

const DIFFICULTIES = [
  { id: '6', tone: 'easy', icon: Leaf, title: 'Fácil', desc: 'Seis orgánulos para relacionar con su función.', features: ['6 parejas', 'Nota sobre 10', 'Puntos ×1'] },
  { id: '9', tone: 'medium', icon: Zap, title: 'Normal', desc: 'Nueve orgánulos: hay que afinar más.', features: ['9 parejas', 'Nota sobre 10', 'Puntos ×1,25'] },
  { id: '12', tone: 'exam', icon: Flame, title: 'Difícil', desc: 'Todos los orgánulos de la célula.', features: ['12 parejas', 'Nota sobre 10', 'Puntos ×1,5'] },
];
const DIFF_LABEL = { 6: 'Fácil', 9: 'Normal', 12: 'Difícil' };

export function CelMatch({
  difficulty, onPickDifficulty, pairs, functions, selected, answers, submitted, grade,
  points, seconds, lastAssigned, canSubmit, onPickOrg, onPickFunc, onRemove, onSubmit, onReplay, onExit,
  colors, onHelp,
}) {
  const assignedCount = Object.keys(answers).length;
  const funcLabel = (id) => functions.find((f) => f.id === id)?.label;

  let content;
  if (difficulty === null) {
    content = (
      <ModeSelect
        title="Reto de funciones"
        description="Relaciona cada orgánulo con su función. Cuantos más orgánulos, mayor dificultad."
        modes={DIFFICULTIES.map((d) => ({ ...d, cta: 'Empezar' }))}
        onSelect={(id) => onPickDifficulty(Number(id))}
        onHelp={onHelp}
        footer={<GameButton variant="ghost" size="sm" icon={ArrowLeft} onClick={onExit}>Volver a explorar</GameButton>}
      />
    );
  } else if (submitted && grade !== null) {
    const correct = pairs.filter((o) => answers[o.id] === o.id).length;
    content = (
      <ResultsScreen
        title="Reto completado"
        subtitle={`Relaciona orgánulo y función · ${DIFF_LABEL[difficulty] || ''}`}
        nota={grade}
        points={points}
        stats={[
          { icon: Target, tone: 'good', label: 'Aciertos', value: `${correct}/${pairs.length}` },
          { icon: Puzzle, tone: 'progress', label: 'Orgánulos', value: pairs.length },
          ...(seconds != null ? [{ icon: Clock, tone: 'time', label: 'Tiempo', value: fmtTime(seconds) }] : []),
        ]}
        actions={[
          { label: 'Repetir reto', onClick: onReplay, icon: RefreshCw },
          { label: 'Volver a explorar', onClick: onExit, icon: Compass, variant: 'soft' },
        ]}
      >
        {pairs.map((org, i) => {
          const ok = answers[org.id] === org.id;
          return (
            <FeedbackItem key={org.id} index={i + 1} ok={ok} title={`${org.icon} ${org.name}`}>
              {ok
                ? funcLabel(org.id)
                : <>Tu respuesta: {funcLabel(answers[org.id]) || '—'} · Correcta: <strong>{funcLabel(org.id)}</strong></>}
            </FeedbackItem>
          );
        })}
      </ResultsScreen>
    );
  } else {
    content = (
      <div className="cel-board">
        <div className="cel-board__head">
          <div className="cel-board__title">
            <span className="cel-board__badge"><Puzzle size={20} /></span>
            <div>
              <h3>Relaciona orgánulo y función</h3>
              <p>
                <span className={cx('cel-step', !selected && 'is-on')}>1 · Elige un orgánulo</span>
                <span className="cel-step__sep" aria-hidden="true">→</span>
                <span className={cx('cel-step', selected && 'is-on')}>2 · Toca su función</span>
              </p>
            </div>
          </div>
          <div className="cel-board__tools">
            <span className="cel-board__count">{assignedCount}/{pairs.length} asignadas</span>
            <GameButton variant="soft" size="sm" icon={X} onClick={onExit}>Salir</GameButton>
          </div>
        </div>

        <div className="cel-board__cols">
          <div className="cel-col">
            <div className="cel-col__head">Orgánulo</div>
            {pairs.map((org) => {
              const answered = answers[org.id] !== undefined;
              const isSel = selected === org.id;
              const just = lastAssigned?.orgId === org.id;
              return (
                <button
                  key={`${org.id}-${answers[org.id] || 'none'}`}
                  type="button"
                  className={cx('cel-org', isSel && 'is-selected', answered && 'is-answered', just && 'is-just')}
                  style={{ '--org': colors[org.id] }}
                  onClick={() => onPickOrg(org.id)}
                >
                  <span className="cel-org__chip" aria-hidden="true">{org.icon}</span>
                  <span className="cel-org__text">
                    <span className="cel-org__name">{org.name}</span>
                    {answered && <span className="cel-org__func">{funcLabel(answers[org.id])}</span>}
                  </span>
                  {answered && (
                    <span
                      role="button"
                      tabIndex={0}
                      className="cel-org__remove"
                      onClick={(e) => { e.stopPropagation(); onRemove(org.id); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove(org.id); } }}
                      title="Descartar pareja"
                      aria-label="Descartar pareja"
                    >
                      <Undo2 size={13} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={cx('cel-col', 'cel-col--funcs', selected && 'is-ready')}>
            <div className="cel-col__head">Función</div>
            {functions.map((func, idx) => {
              const assignedOrg = Object.entries(answers).find(([, fId]) => fId === func.id)?.[0];
              const orgData = assignedOrg ? pairs.find((o) => o.id === assignedOrg) : null;
              const just = lastAssigned?.funcId === func.id;
              return (
                <AnswerOption
                  key={`${func.id}-${idx}-${assignedOrg || 'none'}`}
                  letter={String.fromCharCode(65 + idx)}
                  className={cx('cel-func', orgData && 'is-assigned', just && 'is-just')}
                  style={orgData ? { '--org': colors[orgData.id] } : undefined}
                  onClick={() => onPickFunc(func)}
                >
                  <span className="cel-func__label">{func.label}</span>
                  {orgData && <span className="cel-func__tag" title={orgData.name}>{orgData.icon}</span>}
                </AnswerOption>
              );
            })}
          </div>
        </div>

        <div className="cel-board__foot">
          <GameButton variant="success" size="lg" icon={CheckCheck} disabled={!canSubmit} onClick={onSubmit}>
            Corregir ({assignedCount}/{pairs.length})
          </GameButton>
        </div>
      </div>
    );
  }

  return <CelOverlay>{content}</CelOverlay>;
}

/* ───────────────────────── Instrucciones ───────────────────────── */

// Contenido del InstructionsModal (lo monta cada app).
export function CelHelpContent({ kind = 'animal' }) {
  return (
    <>
      <h3>🔬 Objetivo</h3>
      <p>
        Explora la <strong>célula {kind}</strong> como si la miraras al microscopio: descubre sus
        orgánulos, qué hacen y cómo están construidos.
      </p>
      <h3>🕹️ Actividades</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>Explorar</strong>
          Toca un orgánulo de la célula o de la bandeja inferior para abrir su ficha. Usa la rueda del
          ratón para hacer zoom y arrastra para moverte.
        </div>
        <div className="instr-mode medium">
          <strong>Test</strong>
          Te pedimos los 12 orgánulos, uno a uno, y tienes que encontrarlos en la célula. Cada uno que
          encuentres a la primera es un acierto: al final verás tu nota sobre 10.
        </div>
        <div className="instr-mode exam">
          <strong>Reto</strong>
          Relaciona cada orgánulo con su función (6, 9 o 12 parejas) y corrige para ver tu nota sobre 10.
        </div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejo:</strong> explora primero todas las fichas (el contador de arriba te dice
        cuántos llevas) y después ponte a prueba. Cada Test o Reto terminado cuenta para tus tareas y
        suma puntos extra por rapidez y por encadenar aciertos.
      </div>
    </>
  );
}
