import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, useAnimationControls } from 'framer-motion';
import {
  ArrowRight, Award, Check, Clock, GraduationCap, Hand, LayoutGrid, PencilLine,
  RefreshCw, Target, Timer, Zap,
} from 'lucide-react';
import { hasAppIcon } from '@/components/AppIcon';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ModeSelect, RoundBanner, ResultsScreen, FeedbackItem,
  GameButton, useAppMeta,
} from './kit';
import '/src/apps/_shared/MathBoxShared.css';

/**
 * Layout unificado para TODAS las apps de operaciones matemáticas
 * (sumas, restas, multiplicaciones, divisiones). Rediseño 2026 sobre el kit
 * de interfaz (_shared/kit): escenario, cabecera con marcador, pantalla previa
 * de modos, hoja de cuaderno para el tablero, teclado numérico táctil y
 * resumen de examen con la nota /10.
 *
 * Gestiona: modos (pantalla previa), cabecera, interruptor de ayuda, teclado,
 * controles, avisos de corrección, resultados del examen e instrucciones.
 * La puntuación, la nota y el onGameComplete del examen viven AQUÍ (no tocar).
 *
 * Props (API estable, compartida con multiplicaciones y divisiones):
 * - title          : texto del ejercicio (ej: "Suma como en el cole (1º)")
 * - emoji          : solo se usa si la app no tiene icono propio
 *
 * MODO EXAMEN (opcional — si no se pasan, no hay pantalla previa de modos):
 * - isTestMode     : bool
 * - setTestMode    : fn
 * - testState      : { currentQuestionIndex, totalQuestions, showResults, score, testQuestions, userAnswers }
 * - actions.startPractice, actions.startTest, actions.nextQuestion, actions.exitTest
 *
 * PRÁCTICA:
 * - feedback       : { text, cls } | { text, className } | { texto, tipo }
 * - onCheck        : fn — botón Comprobar
 * - onNew          : fn — botón Nueva
 * - newLabel       : string (default: "Nueva")
 *
 * INTERRUPTOR (opcional):
 * - toggleLabel, toggleValue, onToggleChange(newValue)
 *
 * TECLADO:
 * - onPaletteClick : fn(number)
 * - paletteLabel   : string
 *
 * TRACKING:
 * - onGameComplete : fn
 * - calculateExpected : fn(pregunta) → string (por defecto, suma de operandos, con decimales)
 *   La respuesta se compara como número (coma o punto, ceros a la izquierda): sameNumber().
 *
 * PRESENTACIÓN (opcionales, nuevas en 2026):
 * - padLayout      : 'bottom' (por defecto: teclado en fila bajo el tablero) | 'side' (teclado tipo calculadora a la derecha)
 * - operator       : símbolo para el resumen del examen (por defecto se deduce de la app: + − × ÷)
 * - accent, accent2: colores del escenario (por defecto, los del icono de la familia)
 *
 * - instructions   : JSX del modal de instrucciones
 * - children       : el tablero; se pinta sobre una hoja de cuaderno (.mol-sheet)
 */

const cx = (...c) => c.filter(Boolean).join(' ');

// Colores y símbolo de cada familia (mismos tonos que sus iconos, icons/app/set2.jsx).
const FAMILIES = {
  sumas: { accent: '#10b981', accent2: '#14b8a6', symbol: '+', noun: 'sumas' },
  restas: { accent: '#f43f5e', accent2: '#ec4899', symbol: '−', noun: 'restas' },
  multiplicaciones: { accent: '#8b5cf6', accent2: '#6366f1', symbol: '×', noun: 'multiplicaciones' },
  divisiones: { accent: '#3b82f6', accent2: '#06b6d4', symbol: '÷', noun: 'divisiones' },
};
const DEFAULT_FAMILY = { accent: '#8b5cf6', accent2: '#ec4899', symbol: '+', noun: 'operaciones' };

// Quita los emojis del final de los textos de la app ("¡Suma correcta! 🎉" → "¡Suma correcta!").
const stripEmoji = (s = '') =>
  String(s).replace(/[\s\p{Extended_Pictographic}️‍]+$/u, '').trim();

const formatElapsed = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const PAD_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

/* ───────────── Corrección y puntuación del examen (funciones puras, con tests) ───────────── */

// Puntuación del examen: 200 puntos por acierto + bonus de velocidad (5 puntos
// por cada segundo ahorrado bajo un presupuesto de 30 s/pregunta). Así dos
// exámenes con un 10 pueden tener puntuaciones distintas en el ranking.
export const EXAM_POINTS_PER_HIT = 200;
export const EXAM_TIME_BUDGET_PER_Q = 30;
export const EXAM_SPEED_COEF = 5;

// "145,75" | "145.75" | "0145,750" → 145.75 · texto vacío o no numérico → NaN
const toNumber = (v) => {
  const s = String(v ?? '').replace(/\s+/g, '').replace(',', '.');
  return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(s) ? Number(s) : NaN;
};

/**
 * ¿La respuesta del alumno es la solución? Compara como NÚMEROS (coma o punto
 * decimal, ceros a la izquierda o a la derecha de los decimales). Si alguna de
 * las dos no es un número, compara el texto tal cual.
 */
export function sameNumber(answer, expected) {
  const a = toNumber(answer);
  const b = toNumber(expected);
  if (Number.isNaN(a) || Number.isNaN(b)) return String(answer ?? '') === String(expected ?? '');
  return Math.abs(a - b) < 1e-9;
}

/**
 * Suma exacta de los operandos, con decimales (coma o punto) y con tantos
 * decimales como el operando que más tenga: ['254,6', '727,65'] → '982,25'.
 * Con enteros devuelve lo mismo que antes ('12' + '30' → '42').
 */
export function sumOperands(q) {
  const nums = (Array.isArray(q) ? q : [q]).map((n) => String(n).trim().replace('.', ','));
  const maxDec = Math.max(0, ...nums.map((n) => (n.split(',')[1] || '').length));
  // Suma en enteros escalados (sin errores de coma flotante)
  const total = nums.reduce((acc, n) => {
    const [int, dec = ''] = n.split(',');
    return acc + Number(`${int}${dec.padEnd(maxDec, '0')}`);
  }, 0);
  if (maxDec === 0) return String(total);
  const digits = String(total).padStart(maxDec + 1, '0');
  return `${digits.slice(0, -maxDec)},${digits.slice(-maxDec)}`;
}

/**
 * Nota y puntos del examen. El bonus de velocidad se gana en proporción a los
 * aciertos (sin aciertos no hay bonus: terminar rápido sin acertar no puntúa).
 * score ≤ maxScore siempre.
 */
export function operationExamScore({ hits = 0, total = 0, elapsedSec = 0 }) {
  const nota = total > 0 ? Math.min(10, Math.round((hits / total) * 100) / 10) : 0;
  const timeBudget = EXAM_TIME_BUDGET_PER_Q * total;
  const rawBonus = Math.max(0, (timeBudget - elapsedSec) * EXAM_SPEED_COEF);
  const timeBonus = total > 0 ? Math.round(rawBonus * (hits / total)) : 0;
  const basePoints = hits * EXAM_POINTS_PER_HIT;
  return {
    nota,
    timeBonus,
    basePoints,
    score: basePoints + timeBonus,
    maxScore: total * EXAM_POINTS_PER_HIT + timeBudget * EXAM_SPEED_COEF,
  };
}

const MathOperationLayout = ({
  title,
  emoji = '🧮',

  // Test mode (todo opcional)
  isTestMode,
  setTestMode,
  testState,
  actions,          // { startPractice, startTest, nextQuestion, exitTest } — solo para test mode

  // Practica
  feedback: feedbackRaw,
  onCheck,
  onNew,
  newLabel = 'Nueva',

  // Toggle
  toggleLabel,
  toggleValue,
  onToggleChange,

  // Paleta
  onPaletteClick,
  paletteLabel = 'Arrastra o pulsa los números 👇',

  // Tracking
  onGameComplete,
  // Funcion opcional para calcular la respuesta correcta a partir de una pregunta.
  // Por defecto suma los numeros (compat con sumas/restas). Las multiplicaciones
  // pasan su propio calculo (q[0] * q[1]).
  calculateExpected,

  // Presentación
  padLayout = 'bottom',
  operator,
  accent,
  accent2,

  // Instrucciones
  instructions,

  children
}) => {
  const meta = useAppMeta();
  const familyKey = Object.keys(FAMILIES).find((k) => String(meta.appId || '').startsWith(k));
  const family = FAMILIES[familyKey] || DEFAULT_FAMILY;
  const opSymbol = operator || family.symbol;

  const [showHelp, setShowHelp] = useState(false);
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [stage, setStage] = useState(null); // null | 'practice' | 'exam'
  const [solved, setSolved] = useState(0);  // aciertos de la sesión de práctica (solo marcador)
  const [round, setRound] = useState(0);    // nº de ejercicio (para animar el cambio)

  // --- Normalizar feedback (acepta 3 formatos) ---
  const feedback = feedbackRaw
    ? {
        text: feedbackRaw.text ?? feedbackRaw.texto ?? '',
        cls: feedbackRaw.cls ?? feedbackRaw.className ?? feedbackRaw.tipo ?? ''
      }
    : { text: '', cls: '' };
  const feedbackOk = /correct/i.test(feedback.cls) && !/incorrect/i.test(feedback.cls);

  // --- Test mode state ---
  const hasTestMode = isTestMode !== undefined && setTestMode !== undefined && testState;
  const { currentQuestionIndex, totalQuestions, showResults, testQuestions, userAnswers } = testState || {};

  // --- Puntuacion con bonus de velocidad (ver operationExamScore) ---
  const startTimeRef = useRef(null);
  const [finalElapsed, setFinalElapsed] = useState(0);

  // Reset del cronometro cada vez que se arranca un nuevo test (nueva array de preguntas)
  useEffect(() => {
    if (testQuestions && testQuestions.length > 0) {
      startTimeRef.current = Date.now();
      setFinalElapsed(0);
    }
  }, [testQuestions]);

  // Captura del tiempo final al mostrar resultados
  useEffect(() => {
    if (hasTestMode && showResults && startTimeRef.current) {
      setFinalElapsed(Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)));
    }
  }, [hasTestMode, showResults]);

  // Por defecto, suma de los operandos (con decimales si los hay).
  const calcExpected = calculateExpected || sumOperands;
  const testHits = (testQuestions && userAnswers)
    ? testQuestions.filter((q, i) => sameNumber(userAnswers[i], calcExpected(q))).length
    : 0;
  const testTotal = totalQuestions || 0;
  const {
    nota: testNota, timeBonus, score: testScore, maxScore: testMaxScore,
  } = operationExamScore({ hits: testHits, total: testTotal, elapsedSec: finalElapsed });

  // Tracking: reportar cuando se muestran resultados del test (con score que incluye bonus de velocidad)
  const trackedRef = useRef(false);
  useEffect(() => {
    if (!hasTestMode) return;
    if (showResults && !trackedRef.current && finalElapsed > 0) {
      trackedRef.current = true;
      onGameComplete?.({
        mode: 'test',
        score: testScore,
        maxScore: testMaxScore,
        correctAnswers: testHits,
        totalQuestions: testTotal,
        durationSeconds: finalElapsed,
      });
    }
    if (!showResults) trackedRef.current = false;
  }, [hasTestMode, showResults, finalElapsed, testScore, testMaxScore, testTotal, testHits, onGameComplete]);

  // Determinar si estamos viendo resultados del test
  const showingTestResults = hasTestMode && isTestMode && showResults;
  const examActive = hasTestMode && isTestMode && !showResults;
  const showModeSelect = hasTestMode && !stage && !isTestMode;

  // --- Solo presentación a partir de aquí ---

  // Marcador de práctica: cuenta las comprobaciones correctas de la sesión.
  useEffect(() => {
    if (feedback.text && feedbackOk) setSolved((n) => n + 1);
  }, [feedback.text, feedbackOk]);

  // Confeti al terminar un examen con nota alta.
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (!showingTestResults) { celebratedRef.current = false; return; }
    if (celebratedRef.current || testNota < 8) return;
    celebratedRef.current = true;
    confetti({ particleCount: 180, spread: 100, origin: { y: 0.5 }, colors: [family.accent, family.accent2, '#fbbf24', '#8b5cf6'] });
  }, [showingTestResults, testNota, family.accent, family.accent2]);

  // Animación de entrada de cada ejercicio nuevo sobre la hoja.
  const sheetAnim = useAnimationControls();
  useEffect(() => {
    sheetAnim.start({ opacity: [0.25, 1], y: [10, 0], transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } });
  }, [round, currentQuestionIndex, isTestMode, sheetAnim]);

  // Teclado físico: los dígitos funcionan como el teclado de la pantalla.
  const inGame = !showModeSelect && !showingTestResults;
  const paletteRef = useRef(onPaletteClick);
  useEffect(() => { paletteRef.current = onPaletteClick; }, [onPaletteClick]);
  useEffect(() => {
    if (!inGame || showHelp) return undefined;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        paletteRef.current?.(Number(e.key));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inGame, showHelp]);

  const shellProps = {
    accent: accent || family.accent,
    accent2: accent2 || family.accent2,
    className: 'mol',
  };
  const fallbackIcon = meta.appId && hasAppIcon(meta.appId)
    ? undefined
    : <span className="mol-emoji" aria-hidden="true">{emoji}</span>;

  const handleNew = () => { setRound((r) => r + 1); onNew?.(); };

  const instructionsModal = (
    <InstructionsModal
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      title={`Cómo jugar: ${title}`}
    >
      {instructions || (
        <>
          <h3>Objetivo</h3>
          <p>Completa la operación colocando el número correcto en cada casilla vacía.</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla para seleccionarla (se ilumina).</li>
            <li>Después toca un número del teclado para colocarlo. También puedes escribirlo con el teclado del ordenador.</li>
            <li>Si te equivocas, vuelve a tocar la casilla y pon otro número.</li>
            <li>Pulsa <strong>Comprobar</strong>: las casillas se pondrán en verde o en rojo.</li>
          </ul>
        </>
      )}
    </InstructionsModal>
  );

  // ─── Pantalla previa: elegir modo ───
  if (showModeSelect) {
    const modes = [
      {
        id: 'practice', tone: 'easy', icon: PencilLine, title: 'Práctica libre',
        desc: `Resuelve ${family.noun} sin límite y compruébalas cuando quieras.`,
        features: ['Corrección casilla a casilla', toggleLabel ? `${stripEmoji(toggleLabel)} (opcional)` : 'Ejercicios infinitos'],
        cta: 'Practicar',
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: `${testTotal || 5} ${family.noun} seguidas. La corrección llega al final.`,
        features: ['Nota sobre 10', 'Puntos extra por rapidez'],
        cta: 'Empezar',
      },
    ];
    const selectMode = (id) => {
      if (id === 'exam') {
        setStage('exam');
        actions.startTest();
        return;
      }
      setStage('practice');
      setTestMode(false);
      actions.startPractice();
    };
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          icon={fallbackIcon}
          description={meta.description || title}
          modes={modes}
          onSelect={selectMode}
          onHelp={() => setShowHelp(true)}
        />
        {instructionsModal}
      </GameShell>
    );
  }

  // ─── Resultados del examen ───
  if (showingTestResults) {
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          subtitle={title}
          nota={testNota}
          points={testScore}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${testHits}/${testTotal}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: formatElapsed(finalElapsed) },
            { icon: Zap, tone: 'streak', label: 'Bonus rapidez', value: `+${timeBonus}` },
          ]}
          actions={[
            { label: 'Otro examen', onClick: actions.startTest, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => { actions.exitTest(); setStage(null); }, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {testQuestions.map((q, i) => {
            const userAnswer = userAnswers[i] || '—';
            const expected = calcExpected(q);
            const ok = sameNumber(userAnswers[i], expected);
            return (
              <FeedbackItem key={i} index={i + 1} ok={ok} title={Array.isArray(q) ? q.join(` ${opSymbol} `) : String(q)}>
                Tu respuesta: <strong className="mol-fb-num">{userAnswer}</strong>
                {!ok && <> · Solución: <strong className="mol-fb-num is-good">{expected}</strong></>}
              </FeedbackItem>
            );
          })}
        </ResultsScreen>
        {instructionsModal}
      </GameShell>
    );
  }

  // ─── Partida (práctica o examen) ───
  const side = padLayout === 'side';
  const qNum = Math.min((currentQuestionIndex || 0) + 1, testTotal);
  const isLastQ = currentQuestionIndex === totalQuestions - 1;
  const padLabel = stripEmoji(paletteLabel);

  const toggle = toggleLabel && onToggleChange ? (
    <button
      type="button"
      role="switch"
      aria-checked={!!toggleValue}
      className={cx('mol-switch', toggleValue && 'is-on')}
      onClick={() => onToggleChange(!toggleValue)}
    >
      <span className="mol-switch__track" aria-hidden="true"><span className="mol-switch__knob" /></span>
      <span className="mol-switch__label">{toggleLabel}</span>
    </button>
  ) : null;

  const buttons = examActive ? (
    <div className="mol-buttons">
      <GameButton
        variant={isLastQ ? 'success' : 'primary'}
        size="lg"
        icon={isLastQ ? Award : undefined}
        iconRight={isLastQ ? undefined : ArrowRight}
        onClick={actions.nextQuestion}
      >
        {isLastQ ? 'Finalizar' : 'Siguiente'}
      </GameButton>
    </div>
  ) : (
    <div className="mol-buttons">
      <GameButton variant="success" size="lg" icon={Check} onClick={onCheck}>Comprobar</GameButton>
      <GameButton variant="soft" size="lg" icon={RefreshCw} onClick={handleNew}>{newLabel}</GameButton>
    </div>
  );

  const pad = (
    <NumberPad onPick={(n) => onPaletteClick?.(n)} label={padLabel} />
  );

  return (
    <GameShell {...shellProps}>
      <GameHeader
        icon={fallbackIcon}
        mode={examActive ? 'exam' : 'practice'}
        modeLabel={examActive ? 'Examen' : 'Práctica'}
        onHelp={() => setShowHelp(true)}
        right={
          <Hud>
            {examActive ? (
              <>
                <HudStat icon={GraduationCap} tone="progress" value={`${qNum}/${testTotal}`} label="Pregunta" />
                <ExamClock />
              </>
            ) : (
              <HudStat icon={Check} tone="good" value={solved} label="Aciertos" />
            )}
          </Hud>
        }
      />

      {examActive && <ExamSteps total={testTotal} current={currentQuestionIndex || 0} />}

      <div className={cx('mol-main', side && 'mol-main--side')}>
        <div className="mol-board-col">
          <div className={cx('mol-sheet', feedback.text && !examActive && (feedbackOk ? 'is-good' : 'is-bad'))}>
            <span className="mol-sheet__rings" aria-hidden="true" />
            <div className="mol-sheet__head">
              <span className="mol-sheet__title">{stripEmoji(title)}</span>
            </div>
            <motion.div className="mol-sheet__body" animate={sheetAnim}>
              {children}
            </motion.div>
          </div>

          {!examActive && (
            <RoundBanner
              key={feedback.text}
              show={!!feedback.text}
              status={feedbackOk ? 'won' : 'lost'}
              title={stripEmoji(feedback.text)}
              subtitle={feedbackOk ? '¡Sigue así!' : 'Toca una casilla para cambiar su número y vuelve a comprobar.'}
              action={feedbackOk ? handleNew : undefined}
              actionLabel={newLabel}
              actionIcon={RefreshCw}
            />
          )}

          {!side && (
            <div className="mol-toolbar">
              {toggle}
              {buttons}
            </div>
          )}
          {!side && pad}
        </div>

        {side && (
          <aside className="mol-aside">
            {toggle}
            {pad}
            {buttons}
          </aside>
        )}
      </div>

      <div className="mol-footer">
        {!examActive ? (
          <>
            {hasTestMode && (
              <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setStage(null)}>
                Cambiar modo
              </GameButton>
            )}
            <span className="mol-footer__info">
              <Hand size={14} /> Toca una casilla y después un número
            </span>
          </>
        ) : (
          <span className="mol-footer__info">
            <GraduationCap size={14} /> Modo examen · la corrección llega al final
          </span>
        )}
      </div>

      {instructionsModal}
    </GameShell>
  );
};

/* ───────────────────────── Piezas del layout ───────────────────────── */

// Teclado numérico: teclas del kit (gk-key) en <div role="button"> para que el
// arrastre funcione también en Firefox (un <button> no se puede arrastrar).
function NumberPad({ onPick, label }) {
  return (
    <div className="mol-pad">
      {label && <div className="mol-pad__label"><Hand size={14} /> {label}</div>}
      <div className="mol-pad__keys" role="group" aria-label="Teclado numérico">
        {PAD_DIGITS.map((n) => (
          <div
            key={n}
            role="button"
            tabIndex={0}
            draggable="true"
            aria-label={`Número ${n}`}
            className={`gk-key is-idle mol-key mol-key--${n}`}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', n)}
            onClick={() => onPick(n)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onPick(n); }
            }}
          >
            <span className="gk-key__face">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progreso del examen: respondidas / actual / pendientes (sin desvelar aciertos).
function ExamSteps({ total, current }) {
  return (
    <div className="mol-steps" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cx('mol-step', i < current && 'is-done', i === current && 'is-current')}>
          {i + 1}
        </span>
      ))}
    </div>
  );
}

// Reloj del examen (solo informativo; el tiempo que puntúa lo mide el layout).
function ExamClock() {
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(t0);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <HudStat icon={Timer} tone="time" value={formatElapsed(Math.floor((now - t0) / 1000))} label="Tiempo" />;
}

/* ───────────────────── Piezas del tablero (hoja de cuaderno) ─────────────────────
   Rejilla CSS con columnas por cifra, guías de columna con su valor posicional
   (U, D, C… d, c, m), cifras escritas, casillas-ficha, burbujas de llevada,
   signo y raya. Cada tablero coloca las piezas con r (fila) y c (columna),
   índices 1-based de la rejilla. Tamaño fluido: la celda se ajusta al ancho de
   la hoja (container query) entre 30 y 58 px. */

const COL_UNITS = { op: 0.95, cell: 1, comma: 0.42, gap: 0.5 };
const COL_VAR = { op: 'var(--opb-op)', cell: 'var(--opb-cell)', comma: 'var(--opb-comma)', gap: 'var(--opb-gap)' };
const ROW_VAR = { label: 'var(--opb-label)', carry: 'var(--opb-carry)', num: 'var(--opb-row)', rule: 'var(--opb-rule)', result: 'var(--opb-row)' };

const PLACE_INT = [
  ['U', 'Unidades'], ['D', 'Decenas'], ['C', 'Centenas'], ['UM', 'Unidades de millar'],
  ['DM', 'Decenas de millar'], ['CM', 'Centenas de millar'], ['U.Mi', 'Unidades de millón'],
];
const PLACE_DEC = [['d', 'Décimas'], ['c', 'Centésimas'], ['m', 'Milésimas'], ['dm', 'Diezmilésimas']];

// pos >= 0: cifra entera contando desde las unidades (0 = U). pos < 0: decimal (-1 = décimas).
export const placeOf = (pos) => (pos >= 0 ? PLACE_INT[pos] : PLACE_DEC[-pos - 1]) || ['', ''];

// Contenedor en rejilla. columns/rows: listas de tipos ('op' | 'cell' | 'comma' | 'gap'; 'label' | 'carry' | 'num' | 'rule' | 'result').
export function OpGrid({ columns, rows, label, className, children }) {
  const units = columns.reduce((a, k) => a + (COL_UNITS[k] || 1), 0);
  return (
    <div
      className={cx('opb-grid', className)}
      role="group"
      aria-label={label}
      style={{
        '--opb-units': units,
        gridTemplateColumns: columns.map((k) => COL_VAR[k] || k).join(' '),
        gridTemplateRows: rows.map((k) => ROW_VAR[k] || k).join(' '),
      }}
    >
      {children}
    </div>
  );
}

const at = (r, c, extra) => ({ gridRow: r, gridColumn: c, ...extra });

// Banda de color detrás de una columna de cifras + etiqueta de valor posicional arriba.
export function OpGuide({ c, pos, alt, labelRow = 1 }) {
  const [abbr, full] = placeOf(pos);
  return (
    <>
      <span className={cx('opb-guide', alt && 'is-alt', pos === 0 && 'is-units')} style={at('1 / -1', c)} aria-hidden="true" />
      {abbr && <span className={cx('opb-place', pos < 0 && 'is-dec')} style={at(labelRow, c)} title={full}>{abbr}</span>}
    </>
  );
}

// Cifra escrita (operandos o datos). modified: cifra cambiada por una llevada (restas).
export function OpDigit({ r, c, children, modified, muted }) {
  return (
    <span className={cx('opb-digit', modified && 'is-modified', muted && 'is-muted')} style={at(r, c)}>
      {children}
    </span>
  );
}

export function OpComma({ r, c }) {
  return <span className="opb-comma" style={at(r, c)} aria-label="coma">,</span>;
}

export function OpOperator({ r, c = 1, symbol }) {
  return <span className="opb-op" style={at(r, c)} aria-label={`signo ${symbol}`}>{symbol}</span>;
}

// Raya de la operación (de la columna `from` hasta el final).
export function OpRule({ r, from = 1, to = -1 }) {
  return <span className="opb-rule" style={at(r, `${from} / ${to}`)} aria-hidden="true" />;
}

/**
 * Casilla interactiva (ficha).
 *  kind     : 'result' | 'carry' | 'borrow'
 *  state    : '' | 'correct' | 'incorrect'
 *  selected : bool · hidden: bool (ocupa sitio pero no se ve)
 *  onSelect : fn() al tocarla · onDrop: fn(event) al soltar un número (opcional)
 */
export function OpSlot({ r, c, kind = 'result', value, state, selected, hidden, onSelect, onDrop, label, className, style }) {
  const [over, setOver] = useState(false);
  const filled = value !== undefined && value !== null && value !== '';
  const dropProps = onDrop ? {
    onDragOver: (e) => e.preventDefault(),
    onDragEnter: () => setOver(true),
    onDragLeave: () => setOver(false),
    onDrop: (e) => { setOver(false); onDrop(e); },
  } : {};
  return (
    <div
      role="button"
      tabIndex={hidden ? -1 : 0}
      aria-label={label}
      aria-pressed={!!selected}
      className={cx(
        'opb-slot', `opb-slot--${kind}`,
        filled && 'is-filled', selected && 'is-selected', over && 'is-over',
        state === 'correct' && 'is-correct', state === 'incorrect' && 'is-incorrect',
        hidden && 'is-hidden', className,
      )}
      style={{ ...at(r, c), ...style }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(e); }
      }}
      {...dropProps}
    >
      {filled && <span key={value} className="opb-slot__val">{value}</span>}
    </div>
  );
}

export default MathOperationLayout;
