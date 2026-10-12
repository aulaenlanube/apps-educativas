// src/apps/porcentajes/Porcentajes.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit). La lógica de
// partida (generador, comprobación, puntos, nota y onGameComplete) no cambia.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Percent, Calculator, Check, X, Lightbulb, RefreshCw, Sparkles, LogOut, Eye, EyeOff,
  LayoutGrid, TrendingUp, TrendingDown, Receipt, Activity, Scale, Ruler, PieChart as PieIcon,
  Target, Clock, GraduationCap, Flame, Pin, Sprout, Trophy,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, GameButton, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem,
} from '../_shared/kit';
import { generateProblem, formatNumber, checkAnswer } from './problemGenerator';
import './Porcentajes.css';

const TOTAL_EXAM_QUESTIONS = 10;
const POINTS_PER_CORRECT = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 30; // por pregunta

// Tarjetas de la pantalla previa (los ids son los valores internos de siempre)
const MODES = [
  {
    id: 'easy', tone: 'easy', icon: Sprout, title: 'Fácil',
    desc: '% de un número, encontrar el total, proporciones, aumentos y descuentos básicos.',
    features: ['Resultados enteros', 'Ayuda visual siempre a mano'],
  },
  {
    id: 'medium', tone: 'medium', icon: Flame, title: 'Medio',
    desc: 'Añade qué % es, IVA y repartos proporcionales.',
    features: ['Hasta 1 decimal', 'Ayuda visual opcional'],
  },
  {
    id: 'exam', tone: 'exam', icon: GraduationCap, title: 'Examen',
    desc: `${TOTAL_EXAM_QUESTIONS} preguntas con todos los tipos (incluye variación y escalas).`,
    features: ['Hasta 2 decimales · sin ayudas', 'Nota /10 y puntos por rapidez'],
  },
];

// Ficha visual de cada tipo de problema (por su etiqueta)
const TYPE_META = {
  '% de un número': { icon: Percent, color: '#ec4899' },
  'qué % es': { icon: PieIcon, color: '#8b5cf6' },
  'encontrar total': { icon: Target, color: '#f59e0b' },
  'aumento %': { icon: TrendingUp, color: '#10b981' },
  'IVA': { icon: Receipt, color: '#a855f7' },
  'descuento %': { icon: TrendingDown, color: '#ef4444' },
  'variación %': { icon: Activity, color: '#f97316' },
  'proporción': { icon: Scale, color: '#6366f1' },
  'escala': { icon: Ruler, color: '#0ea5e9' },
  'reparto': { icon: PieIcon, color: '#db2777' },
};
const typeMeta = (label) => TYPE_META[label] || { icon: Calculator, color: '#fb923c' };

const explainProblem = (p) => {
  // Devuelve texto explicativo del cálculo para feedback en práctica
  switch (p.label) {
    case '% de un número': {
      // No tenemos parámetros expuestos, pero el enunciado los contiene; mostramos solo el resultado.
      return `El cálculo es: (porcentaje × cantidad) / 100 = ${formatNumber(p.answer)}.`;
    }
    case 'qué % es':
      return `El cálculo es: (parte / total) × 100 = ${formatNumber(p.answer)} %.`;
    case 'encontrar total':
      return `El cálculo es: (cantidad × 100) / porcentaje = ${formatNumber(p.answer)}.`;
    case 'aumento %':
    case 'IVA':
      return `El cálculo es: precio × (1 + porcentaje/100) = ${formatNumber(p.answer)}.`;
    case 'descuento %':
      return `El cálculo es: precio × (1 − porcentaje/100) = ${formatNumber(p.answer)}.`;
    case 'variación %':
      return `El cálculo es: |valor_final − valor_inicial| / valor_inicial × 100 = ${formatNumber(p.answer)} %.`;
    case 'proporción':
      return `Se cruzan productos: a/b = x/d → x = (a × d) / b = ${formatNumber(p.answer)}.`;
    case 'escala':
      return `Multiplica la medida del plano por la escala (y conviértela a la unidad pedida): ${formatNumber(p.answer)} ${p.unit}.`;
    case 'reparto':
      return `Suma las partes y aplica la fracción que toca: total × parte / (suma de partes) = ${formatNumber(p.answer)}.`;
    default:
      return `Resultado: ${formatNumber(p.answer)} ${p.unit || ''}`.trim();
  }
};

// =============================================================
//   COMPONENTES DE AYUDA VISUAL
// =============================================================

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Materiales (claro → base → oscuro) para las piezas de las ilustraciones
const TONES = {
  pink: { light: '#fbcfe8', base: '#ec4899', dark: '#9d174d' },
  violet: { light: '#ddd6fe', base: '#8b5cf6', dark: '#5b21b6' },
  amber: { light: '#fde68a', base: '#f59e0b', dark: '#b45309' },
  green: { light: '#a7f3d0', base: '#10b981', dark: '#047857' },
  red: { light: '#fecdd3', base: '#f43f5e', dark: '#9f1239' },
  indigo: { light: '#c7d2fe', base: '#6366f1', dark: '#3730a3' },
};

const Material = ({ id, tone }) => {
  const t = TONES[tone] || TONES.pink;
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor={t.light} />
      <stop offset="0.45" stopColor={t.base} />
      <stop offset="1" stopColor={t.dark} />
    </linearGradient>
  );
};

// --- Fracción con barra del color del tipo ---
const Fraction = ({ num, den, tone = 'pink', size = 'md' }) => (
  <span className={`pct-frac pct-frac--${size} pct-tone-${tone}`}>
    <span className="pct-frac__num">{num}</span>
    <span className="pct-frac__bar" />
    <span className="pct-frac__den">{den}</span>
  </span>
);

// --- Cuadrícula 10×10: P fichas de cada 100 ---
const PercentGrid100 = ({ pct, tone = 'pink' }) => {
  const filled = Math.min(100, Math.max(0, Math.round(pct)));
  const t = TONES[tone];
  const cells = [];
  for (let i = 0; i < 100; i++) {
    const x = 5 + (i % 10) * 14;
    const y = 5 + Math.floor(i / 10) * 14;
    if (i < filled) {
      cells.push(
        <g key={i}>
          <rect x={x} y={y + 1.4} width="12" height="11.6" rx="3" fill={t.dark} />
          <rect x={x} y={y} width="12" height="11" rx="3" fill={`url(#pct-g100-${tone})`} />
          <rect x={x + 2} y={y + 1.6} width="5" height="2" rx="1" fill="#fff" opacity=".55" />
        </g>
      );
    } else {
      cells.push(<rect key={i} x={x} y={y} width="12" height="12" rx="3" className="pct-svg-cell" />);
    }
  }
  return (
    <svg viewBox="0 0 150 150" className="pct-grid100" role="img" aria-label={`${filled} de cada 100`}>
      <defs><Material id={`pct-g100-${tone}`} tone={tone} /></defs>
      <rect x="0" y="0" width="150" height="150" rx="16" className="pct-svg-tray" />
      {cells}
    </svg>
  );
};

// --- Tarta en relieve con el sector destacado ---
const PieChart = ({ pct, tone = 'violet' }) => {
  const safe = clamp(pct, 0, 100);
  const angle = (safe / 100) * 360;
  const r = 50;
  const cx = 60;
  const cy = 56;
  const radians = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(radians);
  const y = cy + r * Math.sin(radians);
  const largeArc = angle > 180 ? 1 : 0;
  const path = safe >= 100
    ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
    : safe <= 0
      ? ''
      : `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
  return (
    <svg viewBox="0 0 120 124" className="pct-pie" role="img" aria-label={`${formatNumber(safe)} %`}>
      <defs>
        <Material id={`pct-pie-${tone}`} tone={tone} />
        <radialGradient id="pct-pie-gloss" cx="0.32" cy="0.22" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="114" rx="40" ry="6" className="pct-svg-shadow" />
      <circle cx={cx} cy={cy + 3} r={r} fill={TONES[tone].dark} opacity=".35" />
      <circle cx={cx} cy={cy} r={r} className="pct-svg-disc" />
      {path && <path d={path} fill={`url(#pct-pie-${tone})`} className="pct-svg-slice" />}
      <circle cx={cx} cy={cy} r={r} fill="url(#pct-pie-gloss)" />
      <circle cx={cx} cy={cy} r="25" className="pct-svg-hole" />
      <text x={cx} y={cy + 6} textAnchor="middle" className="pct-svg-big">
        {formatNumber(safe)}%
      </text>
    </svg>
  );
};

// --- Barras: precio inicial y resultado (aumento, descuento o IVA) ---
const StackBars = ({ V, P, mode }) => {
  // mode: 'increase' | 'decrease' | 'iva'
  const isUp = mode !== 'decrease';
  const deltaTone = mode === 'iva' ? 'violet' : (isUp ? 'green' : 'red');
  const deltaLen = clamp(P, 0, 100); // visualmente proporcional al porcentaje
  const U = 222; // unidades de ancho de la pista (100 + hueco + 100 + margen)
  const w = (n) => `${(n / U) * 100}%`;
  return (
    <div className="pct-bars">
      <div className="pct-bars__row">
        <span className="pct-bars__label">Original</span>
        <div className="pct-bars__track">
          <span className="pct-seg pct-seg--base" style={{ width: w(100) }}>{formatNumber(V)}</span>
        </div>
      </div>
      <div className="pct-bars__row">
        <span className="pct-bars__label">Resultado</span>
        <div className="pct-bars__track">
          {isUp ? (
            <>
              <span className="pct-seg pct-seg--base" style={{ width: w(100) }}>{formatNumber(V)}</span>
              <span className={`pct-seg pct-seg--delta pct-tone-${deltaTone}`} style={{ width: w(Math.max(deltaLen, 18)) }}>+{P}%</span>
            </>
          ) : (
            <>
              <span className="pct-seg pct-seg--base pct-seg--unknown" style={{ width: w(100 - deltaLen) }}>?</span>
              <span className="pct-seg pct-seg--ghost pct-tone-red" style={{ width: w(deltaLen) }}>−{P}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Proporción con productos cruzados ---
const ProportionEq = ({ a, b, c, d }) => (
  <svg viewBox="0 0 280 136" className="pct-propeq" role="img" aria-label={`${a}/${b} = ${c}/${d}`}>
    <defs>
      <marker id="pct-eq-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" className="pct-svg-accent-fill" />
      </marker>
    </defs>
    {/* Tarjetas de las dos razones */}
    <rect x="22" y="22" width="76" height="94" rx="18" className="pct-svg-card-edge" />
    <rect x="22" y="18" width="76" height="94" rx="18" className="pct-svg-card" />
    <rect x="182" y="22" width="76" height="94" rx="18" className="pct-svg-card-edge" />
    <rect x="182" y="18" width="76" height="94" rx="18" className="pct-svg-card is-goal" />

    <text x="60" y="56" textAnchor="middle" className="pct-svg-num">{a}</text>
    <line x1="38" y1="66" x2="82" y2="66" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
    <text x="60" y="98" textAnchor="middle" className="pct-svg-num">{b}</text>

    <text x="140" y="74" textAnchor="middle" className="pct-svg-num pct-svg-muted">=</text>

    <text x="220" y="56" textAnchor="middle" className="pct-svg-num pct-svg-x">{c}</text>
    <line x1="198" y1="66" x2="242" y2="66" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
    <text x="220" y="98" textAnchor="middle" className="pct-svg-num">{d}</text>

    {/* Flechas en cruz: a·d y b·x */}
    <path d="M 82 40 Q 140 4 204 86" className="pct-svg-cross" markerEnd="url(#pct-eq-arr)" />
    <path d="M 82 92 Q 140 132 204 46" className="pct-svg-cross" markerEnd="url(#pct-eq-arr)" />
    <g className="pct-svg-badge">
      <circle cx="140" cy="20" r="9" />
      <text x="140" y="24" textAnchor="middle">×</text>
    </g>
    <g className="pct-svg-badge">
      <circle cx="140" cy="116" r="9" />
      <text x="140" y="120" textAnchor="middle">×</text>
    </g>
  </svg>
);

// --- Escala: medida del plano frente a la medida real ---
const ScaleVisual = ({ N, X }) => (
  <svg viewBox="0 0 280 132" className="pct-scale" role="img" aria-label={`Escala 1:${N}`}>
    <defs>
      <Material id="pct-scale-plano" tone="indigo" />
      <Material id="pct-scale-real" tone="pink" />
      <marker id="pct-scale-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 Z" className="pct-svg-accent-fill" />
      </marker>
    </defs>

    {/* Plano (pequeño) */}
    <text x="4" y="25" className="pct-svg-label">PLANO</text>
    <rect x="62" y="12" width="66" height="24" rx="8" fill="#3730a3" />
    <rect x="62" y="10" width="66" height="23" rx="8" fill="url(#pct-scale-plano)" />
    <rect x="68" y="13" width="30" height="4" rx="2" fill="#fff" opacity=".45" />
    <text x="95" y="27" textAnchor="middle" className="pct-svg-chip-text">{X} cm</text>
    <line x1="62" y1="42" x2="128" y2="42" className="pct-svg-rule" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line key={i} x1={62 + i * 13.2} y1="39" x2={62 + i * 13.2} y2="46" className="pct-svg-rule" />
    ))}

    {/* Multiplicador */}
    <path d="M 136 30 C 168 30 188 46 214 62" className="pct-svg-cross" markerEnd="url(#pct-scale-arr)" />
    <g className="pct-svg-badge pct-svg-badge--wide">
      <rect x="150" y="34" width="56" height="22" rx="11" />
      <text x="178" y="50" textAnchor="middle">×{N}</text>
    </g>

    {/* Real (grande) */}
    <text x="4" y="91" className="pct-svg-label">REAL</text>
    <rect x="62" y="78" width="206" height="24" rx="8" fill="#9d174d" />
    <rect x="62" y="76" width="206" height="23" rx="8" fill="url(#pct-scale-real)" />
    <rect x="70" y="79" width="80" height="4" rx="2" fill="#fff" opacity=".45" />
    <text x="165" y="93" textAnchor="middle" className="pct-svg-chip-text">?</text>
    <line x1="62" y1="110" x2="268" y2="110" className="pct-svg-rule" />
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={i} x1={62 + i * 20.6} y1="107" x2={62 + i * 20.6} y2="114" className="pct-svg-rule" />
    ))}
  </svg>
);

// --- Reparto: tarta dividida en p:q ---
const ShareVisual = ({ T, p, q }) => {
  const total = p + q;
  const pPct = (p / total) * 100;
  const angle = (pPct / 100) * 360;
  const r = 50;
  const cx = 60;
  const cy = 56;
  const radians = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(radians);
  const y = cy + r * Math.sin(radians);
  const largeArc = angle > 180 ? 1 : 0;
  const path = `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
  // Posición de las etiquetas: en mitad de cada sector
  const mid = (deg) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return [cx + 30 * Math.cos(rad), cy + 30 * Math.sin(rad) + 5];
  };
  const [px, py] = mid(angle / 2);
  const [qx, qy] = mid(angle + (360 - angle) / 2);
  return (
    <div className="pct-share">
      <svg viewBox="0 0 120 124" className="pct-pie" role="img" aria-label={`Reparto ${p}:${q}`}>
        <defs>
          <Material id="pct-share-p" tone="pink" />
          <Material id="pct-share-q" tone="indigo" />
          <radialGradient id="pct-share-gloss" cx="0.32" cy="0.22" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity=".5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="114" rx="40" ry="6" className="pct-svg-shadow" />
        <circle cx={cx} cy={cy + 3} r={r} fill="#312e81" opacity=".4" />
        <circle cx={cx} cy={cy} r={r} fill="url(#pct-share-q)" />
        <path d={path} fill="url(#pct-share-p)" className="pct-svg-slice" />
        <circle cx={cx} cy={cy} r={r} fill="url(#pct-share-gloss)" />
        <text x={px} y={py} textAnchor="middle" className="pct-svg-chip-text pct-svg-chip-text--lg">{p}</text>
        <text x={qx} y={qy} textAnchor="middle" className="pct-svg-chip-text pct-svg-chip-text--lg">{q}</text>
      </svg>
      <div className="pct-share__legend">
        <span className="pct-share__item"><i className="pct-swatch pct-tone-pink" /> {p} partes (esto te piden)</span>
        <span className="pct-share__item"><i className="pct-swatch pct-tone-indigo" /> {q} partes (la otra)</span>
        <span className="pct-share__total">Total a repartir: <strong>{T}</strong></span>
      </div>
    </div>
  );
};

// --- Pantalla de fórmula ---
const FormulaBox = ({ children }) => (
  <Panel variant="screen" className="pct-formula">{children}</Panel>
);

// --- Bloque de ejemplo resuelto ---
const Example = ({ children }) => (
  <div className="pct-example">
    <span className="pct-example__label"><Pin size={13} /> Ejemplo</span>
    <div className="pct-example__content">{children}</div>
  </div>
);

// =============================================================
//   HELPER POR TIPO DE PROBLEMA
// =============================================================
const ProblemHelper = ({ problem }) => {
  if (!problem) return null;
  const { label, params, unit } = problem;

  const wrapper = (visual, formula, example) => (
    <motion.div
      className="pct-help"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pct-help__head">
        <span className="pct-help__badge"><Lightbulb size={15} /></span>
        <span>Cómo se calcula</span>
      </div>
      <div className="pct-help__grid">
        <div className="pct-help__visual">{visual}</div>
        <div className="pct-help__side">
          {formula}
          {example}
        </div>
      </div>
    </motion.div>
  );

  switch (label) {
    case '% de un número': {
      const { P, V } = params;
      return wrapper(
        <div className="pct-vis">
          <PercentGrid100 pct={P} />
          <p className="pct-vis__caption">{P} de cada 100 cuadritos</p>
        </div>,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <Fraction num={`${V} × ${P}`} den="100" />
          </div>
          <p className="pct-formula__tip">"% de" = multiplicar y dividir entre 100</p>
        </FormulaBox>,
        <Example>
          El 50% de 80 = <Fraction num="80 × 50" den="100" size="sm" /> = 40 (la mitad)
        </Example>
      );
    }
    case 'qué % es': {
      const { X, V } = params;
      const pct = (X / V) * 100;
      return wrapper(
        <div className="pct-vis">
          <PieChart pct={pct} tone="violet" />
          <p className="pct-vis__caption">{formatNumber(X)} es esa porción de {V}</p>
        </div>,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <Fraction num={formatNumber(X)} den={V} tone="violet" />
            <span className="pct-formula__op">× 100</span>
          </div>
          <p className="pct-formula__tip">divides parte / total y multiplicas por 100</p>
        </FormulaBox>,
        <Example>
          ¿Qué % es 20 de 80? <Fraction num="20" den="80" size="sm" /> × 100 = 25%
        </Example>
      );
    }
    case 'encontrar total': {
      const { P, X } = params;
      return wrapper(
        <div className="pct-vis">
          <PercentGrid100 pct={P} tone="amber" />
          <p className="pct-vis__caption">{P} cuadritos = {formatNumber(X)} → 100 cuadritos = ?</p>
        </div>,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <Fraction num={`${formatNumber(X)} × 100`} den={P} tone="amber" />
          </div>
          <p className="pct-formula__tip">si conoces el % y su valor, "subes" al 100%</p>
        </FormulaBox>,
        <Example>
          Si el 25% es 30, el total = <Fraction num="30 × 100" den="25" size="sm" /> = 120
        </Example>
      );
    }
    case 'aumento %':
    case 'IVA': {
      const { V, P } = params;
      const isIVA = label === 'IVA';
      return wrapper(
        <StackBars V={V} P={P} mode={isIVA ? 'iva' : 'increase'} />,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <span className="pct-formula__op">{V} ×</span>
            <Fraction num={`100 + ${P}`} den="100" tone="green" />
          </div>
          <p className="pct-formula__tip">
            {isIVA
              ? 'añadir IVA = sumar ese porcentaje al 100% inicial'
              : 'aumentar P% = multiplicar por (100 + P) entre 100'}
          </p>
        </FormulaBox>,
        <Example>
          {isIVA
            ? <>100 € + 21% IVA = 100 × <Fraction num="121" den="100" size="sm" /> = 121 €</>
            : <>100 € sube un 20% → 100 × <Fraction num="120" den="100" size="sm" /> = 120 €</>}
        </Example>
      );
    }
    case 'descuento %': {
      const { V, P } = params;
      return wrapper(
        <StackBars V={V} P={P} mode="decrease" />,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <span className="pct-formula__op">{V} ×</span>
            <Fraction num={`100 − ${P}`} den="100" tone="red" />
          </div>
          <p className="pct-formula__tip">descontar P% = quedarte con el (100 − P)% del precio</p>
        </FormulaBox>,
        <Example>
          100 € con 25% de descuento → 100 × <Fraction num="75" den="100" size="sm" /> = 75 €
        </Example>
      );
    }
    case 'variación %': {
      const { A, B } = params;
      const isUp = B >= A;
      return wrapper(
        <StackBars V={A} P={Math.abs(Math.round(((B - A) / A) * 100))} mode={isUp ? 'increase' : 'decrease'} />,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <Fraction num={`|${formatNumber(B)} − ${formatNumber(A)}|`} den={formatNumber(A)} tone="amber" />
            <span className="pct-formula__op">× 100</span>
          </div>
          <p className="pct-formula__tip">la variación = diferencia / valor inicial × 100</p>
        </FormulaBox>,
        <Example>
          De 80 a 100: <Fraction num="|100 − 80|" den="80" size="sm" /> × 100 = 25%
        </Example>
      );
    }
    case 'proporción': {
      const { a, b, d } = params;
      return wrapper(
        <ProportionEq a={a} b={b} c="x" d={d} />,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <Fraction num={`${a} × ${d}`} den={b} tone="violet" />
          </div>
          <p className="pct-formula__tip">
            si <Fraction num={a} den={b} size="xs" /> = <Fraction num="x" den={d} size="xs" />,
            entonces multiplicas en cruz: a × d = b × x
          </p>
        </FormulaBox>,
        <Example>
          <Fraction num="2" den="3" size="sm" /> = <Fraction num="x" den="12" size="sm" /> →
          x = <Fraction num="2 × 12" den="3" size="sm" /> = 8
        </Example>
      );
    }
    case 'escala': {
      const { N, X } = params;
      return wrapper(
        <ScaleVisual N={N} X={X} />,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">real =</span>
            <span className="pct-formula__op">{X} × {N} cm</span>
          </div>
          <p className="pct-formula__tip">
            convierte el resultado a {unit} ({unit === 'm' ? '÷ 100' : '÷ 100 000'})
          </p>
        </FormulaBox>,
        <Example>
          Plano 1:100, 5 cm en plano = 5 × 100 = 500 cm = 5 m
        </Example>
      );
    }
    case 'reparto': {
      const { T, p, q } = params;
      const total = p + q;
      return wrapper(
        <ShareVisual T={T} p={p} q={q} />,
        <FormulaBox>
          <div className="pct-formula__row">
            <span className="pct-formula__x">x =</span>
            <Fraction num={`${T} × ${p}`} den={total} tone="pink" />
          </div>
          <p className="pct-formula__tip">
            te toca = total × (tu parte) / (suma de partes)
          </p>
        </FormulaBox>,
        <Example>
          Reparto de 30 en 1:2 → suma = 3 → al primero le toca <Fraction num="30 × 1" den="3" size="sm" /> = 10
        </Example>
      );
    }
    default:
      return null;
  }
};

// Progreso del examen: un tramo por pregunta (sin revelar aciertos)
const ExamSteps = ({ total, current }) => (
  <div className="pct-steps" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className={`pct-steps__seg ${i < current ? 'is-done' : i === current ? 'is-current' : ''}`} />
    ))}
  </div>
);

// Confirmación propia para entregar el examen antes de tiempo
const ExitModal = ({ open, correct, answered, onCancel, onConfirm }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="pct-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="pct-modal__card"
          role="dialog"
          aria-modal="true"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="pct-modal__icon"><LogOut size={28} /></span>
          <h3>¿Salir del examen?</h3>
          <p>
            Llevas <strong>{correct} de {answered}</strong> respuestas correctas.<br />
            Si sales ahora, tu nota será <strong>{((correct / TOTAL_EXAM_QUESTIONS) * 10).toFixed(1)}/10</strong>
            {' '}y se guardará el intento.
          </p>
          <div className="pct-modal__actions">
            <GameButton variant="soft" onClick={onCancel}>Cancelar</GameButton>
            <GameButton variant="danger" icon={LogOut} onClick={onConfirm}>Salir y guardar</GameButton>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SHELL = { accent: '#fb923c', accent2: '#db2777', className: 'pct' };

const Porcentajes = ({ onGameComplete }) => {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'play' | 'finished'
  const [difficulty, setDifficulty] = useState('easy');
  const [problem, setProblem] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  // Ayuda visual: en fácil siempre on, en medio toggleable (off por defecto), en examen siempre off
  const [showHelp, setShowHelp] = useState(true);
  // Marcador de la práctica (solo visual, no se registra)
  const [practiceStats, setPracticeStats] = useState({ ok: 0, streak: 0 });
  const inputRef = useRef(null);

  // Estado del examen
  const [examIndex, setExamIndex] = useState(0);
  const [examCorrect, setExamCorrect] = useState(0);
  const [examPoints, setExamPoints] = useState(0);
  const [examHistory, setExamHistory] = useState([]);
  const examStartRef = useRef(null);
  const questionStartRef = useRef(null);
  const trackedRef = useRef(false);

  const isExam = difficulty === 'exam';
  const showHelps = !isExam;

  const startGame = useCallback((diff) => {
    setDifficulty(diff);
    setPhase('play');
    setProblem(generateProblem(diff));
    setUserInput('');
    setFeedback(null);
    setExamIndex(0);
    setExamCorrect(0);
    setExamPoints(0);
    setExamHistory([]);
    setPracticeStats({ ok: 0, streak: 0 });
    trackedRef.current = false;
    setShowHelp(diff === 'easy');
    if (diff === 'exam') {
      examStartRef.current = Date.now();
      questionStartRef.current = Date.now();
    }
  }, []);

  const nextProblem = useCallback(() => {
    setProblem(generateProblem(difficulty));
    setUserInput('');
    setFeedback(null);
  }, [difficulty]);

  const handleExitExam = useCallback(() => {
    setShowExitModal(false);
    setPhase('finished');
  }, []);

  const handleCheck = useCallback(() => {
    if (!problem || feedback) return;
    const correct = checkAnswer(userInput, problem.answer);
    if (isExam) {
      const elapsedSec = questionStartRef.current
        ? (Date.now() - questionStartRef.current) / 1000
        : SPEED_BONUS_WINDOW_SEC;
      const speedBonus = Math.max(
        0,
        Math.round((1 - Math.min(elapsedSec, SPEED_BONUS_WINDOW_SEC) / SPEED_BONUS_WINDOW_SEC) * MAX_SPEED_BONUS)
      );
      const questionPoints = correct ? POINTS_PER_CORRECT + speedBonus : 0;

      setExamHistory((prev) => [
        ...prev,
        {
          text: problem.text,
          userAnswer: userInput,
          correctAnswer: problem.answer,
          unit: problem.unit,
          isCorrect: correct,
          elapsedSec: Math.round(elapsedSec * 10) / 10,
          points: questionPoints,
          label: problem.label,
          type: problem.type,
        },
      ]);
      setExamCorrect((c) => c + (correct ? 1 : 0));
      setExamPoints((p) => p + questionPoints);

      if (examIndex + 1 >= TOTAL_EXAM_QUESTIONS) {
        setPhase('finished');
      } else {
        setExamIndex((i) => i + 1);
        setProblem(generateProblem(difficulty));
        setUserInput('');
        questionStartRef.current = Date.now();
      }
    } else {
      setFeedback(correct ? 'correct' : 'incorrect');
      setPracticeStats((s) => (correct ? { ok: s.ok + 1, streak: s.streak + 1 } : { ...s, streak: 0 }));
      if (correct) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#059669'] });
      }
    }
  }, [problem, userInput, isExam, examIndex, difficulty, feedback]);

  useEffect(() => {
    if (phase !== 'finished' || trackedRef.current) return;
    trackedRef.current = true;
    const elapsed = examStartRef.current
      ? Math.round((Date.now() - examStartRef.current) / 1000)
      : 0;
    onGameComplete?.({
      mode: 'test',
      score: examPoints,
      maxScore: TOTAL_EXAM_QUESTIONS * (POINTS_PER_CORRECT + MAX_SPEED_BONUS),
      correctAnswers: examCorrect,
      totalQuestions: TOTAL_EXAM_QUESTIONS,
      durationSeconds: elapsed,
    });
  }, [phase, examPoints, examCorrect, onGameComplete]);

  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'play') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (feedback === 'correct' || feedback === 'incorrect') {
          if (!isExam) nextProblem();
        } else {
          handleCheck();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleCheck, nextProblem, feedback, isExam]);

  // Devuelve el foco a la pantalla de respuesta con cada problema nuevo (solo UX)
  useEffect(() => {
    if (phase === 'play' && !feedback) inputRef.current?.focus();
  }, [phase, problem, feedback]);

  const instructions = (
    <InstructionsModal
      isOpen={showInstructions}
      onClose={() => setShowInstructions(false)}
      title="Cómo jugar a Porcentajes y Proporciones"
    >
      <h3>🎯 Objetivo</h3>
      <p>
        Resuelve problemas variados de porcentajes y proporciones. La aplicación
        genera <strong>combinaciones distintas</strong> en cada partida.
      </p>

      <h3>🧮 Tipos de problema</h3>
      <ul>
        <li><strong>% de un número</strong>: ¿cuánto es el 25 % de 80? → 80 × 25 / 100.</li>
        <li><strong>Qué % es</strong>: ¿qué porcentaje es 15 de 60? → 15 / 60 × 100.</li>
        <li><strong>Encontrar el total</strong>: si 30 es el 25 % de un número → 30 × 100 / 25.</li>
        <li><strong>Aumento / Descuento / IVA</strong>: precio × (1 ± P/100).</li>
        <li><strong>Variación</strong>: |B − A| / A × 100 (escribe el valor sin signo).</li>
        <li><strong>Proporción</strong>: a/b = x/d → x = a × d / b.</li>
        <li><strong>Escala</strong>: medida en plano × escala → realidad (atento a las unidades pedidas).</li>
        <li><strong>Reparto proporcional</strong>: total × parte / (suma de partes).</li>
      </ul>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Lee el enunciado y calcula la respuesta.</li>
        <li>Escribe el número (con coma o punto si es decimal). Ignora el símbolo % en la respuesta.</li>
        <li><kbd>Enter</kbd> = comprobar / siguiente.</li>
      </ul>

      <h3>🎓 Niveles de dificultad</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>🟢 Fácil</strong>
          Resultados enteros. Con ayudas (explicación al fallar).
        </div>
        <div className="instr-mode medium">
          <strong>🟡 Medio</strong>
          Hasta 1 decimal. Con ayudas.
        </div>
        <div className="instr-mode exam">
          <strong>🔴 Examen</strong>
          {' '}{TOTAL_EXAM_QUESTIONS} preguntas. Hasta 2 decimales. Sin ayudas.
        </div>
      </div>

      <h3>📊 Nota y puntos en el examen</h3>
      <p>Tu nota va de <strong>0 a 10</strong>:</p>
      <p className="instr-formula">
        <strong>Nota</strong> = aciertos / {TOTAL_EXAM_QUESTIONS} × 10
      </p>
      <p>
        Además ganas <strong>puntos para el ranking</strong> en cada acierto, según la velocidad:
      </p>
      <p className="instr-formula">
        <strong>Puntos</strong> = {POINTS_PER_CORRECT} + bonus de velocidad (hasta {MAX_SPEED_BONUS})
      </p>
      <p className="instr-note">
        Dos exámenes con un 10 pueden tener distinta puntuación: gana el ranking quien lo
        resuelva antes.
      </p>

      <div className="instr-tips">
        <strong>💡 Consejo:</strong> identifica primero qué te piden (porcentaje, total, parte,
        variación...) antes de calcular. La mayoría de errores son por aplicar la fórmula equivocada.
      </div>
    </InstructionsModal>
  );

  // ---------- SETUP ----------
  if (phase === 'setup') {
    return (
      <GameShell {...SHELL}>
        <ModeSelect
          modes={MODES}
          onSelect={startGame}
          onHelp={() => setShowInstructions(true)}
          extra={(
            <div className="pct-types" aria-label="Tipos de problema">
              {Object.entries(TYPE_META).map(([label, meta]) => (
                <span key={label} className="pct-type-chip" style={{ '--pt': meta.color }}>
                  <meta.icon size={13} /> {label}
                </span>
              ))}
            </div>
          )}
        />
        {instructions}
      </GameShell>
    );
  }

  // ---------- FINISHED ----------
  if (phase === 'finished') {
    const nota = Math.round((examCorrect / TOTAL_EXAM_QUESTIONS) * 100) / 10;
    const elapsed = examStartRef.current
      ? Math.round((Date.now() - examStartRef.current) / 1000)
      : 0;

    return (
      <GameShell {...SHELL}>
        <ResultsScreen
          nota={nota}
          points={examPoints}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${examCorrect}/${TOTAL_EXAM_QUESTIONS}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${elapsed}s` },
            { icon: Trophy, tone: 'streak', label: 'Respondidas', value: `${examHistory.length}/${TOTAL_EXAM_QUESTIONS}` },
          ]}
          actions={[
            { label: 'Repetir examen', onClick: () => startGame('exam'), icon: RefreshCw },
            { label: 'Cambiar dificultad', onClick: () => setPhase('setup'), icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {examHistory.map((it, idx) => {
            const meta = typeMeta(it.label);
            return (
              <FeedbackItem key={idx} index={idx + 1} ok={it.isCorrect} title={it.label}>
                <span className="pct-fb__text">{it.text}</span>
                <span className="pct-fb__line">
                  {it.isCorrect ? (
                    <span className="pct-fb__pill is-ok" style={{ '--pt': meta.color }}>
                      <Sparkles size={12} /> +{it.points} pts · {it.elapsedSec}s
                    </span>
                  ) : (
                    <>
                      <span className="pct-fb__pill is-ko">Tu respuesta: {it.userAnswer || '—'}</span>
                      <span className="pct-fb__pill is-sol">Era {formatNumber(it.correctAnswer)} {it.unit}</span>
                    </>
                  )}
                </span>
              </FeedbackItem>
            );
          })}
        </ResultsScreen>
      </GameShell>
    );
  }

  // ---------- PLAY ----------
  const meta = typeMeta(problem?.label);
  const helpVisible = showHelp && !isExam;
  const isLast = examIndex + 1 >= TOTAL_EXAM_QUESTIONS;

  return (
    <GameShell {...SHELL}>
      <GameHeader
        mode={difficulty}
        onHelp={() => setShowInstructions(true)}
        right={(
          <Hud>
            {isExam ? (
              <HudStat icon={GraduationCap} tone="progress" value={`${examIndex + 1}/${TOTAL_EXAM_QUESTIONS}`} label="Pregunta" />
            ) : (
              <>
                <HudStat icon={Check} tone="good" value={practiceStats.ok} label="Aciertos" />
                <HudStat icon={Flame} tone="streak" value={practiceStats.streak} label="Racha" />
              </>
            )}
          </Hud>
        )}
      />

      {isExam && <ExamSteps total={TOTAL_EXAM_QUESTIONS} current={examIndex} />}

      {problem && (
        <>
          <motion.div
            key={`${examIndex}-${problem.text}`}
            className="pct-problem"
            style={{ '--pt': meta.color }}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <span className="pct-problem__medal" aria-hidden="true"><meta.icon size={26} /></span>
            <div className="pct-problem__body">
              <span className="pct-problem__tag">{problem.label}</span>
              <p className="pct-problem__text">{problem.text}</p>
            </div>
          </motion.div>

          <div className={`pct-work ${helpVisible ? 'has-help' : ''}`}>
            {helpVisible && <ProblemHelper problem={problem} />}

            <div className="pct-answer">
              <Panel
                variant="screen"
                className={`pct-display is-${feedback || 'idle'} ${feedback === 'incorrect' ? 'gk-anim-shake' : ''}`}
              >
                <label htmlFor="pct-input" className="pct-display__label">
                  <Calculator size={14} /> Tu respuesta
                </label>
                <div className="pct-display__row">
                  <input
                    id="pct-input"
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="pct-display__input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="?"
                    autoFocus
                    disabled={feedback !== null && !isExam}
                  />
                  {problem.unit && <span className="pct-display__unit">{problem.unit}</span>}
                  {feedback && (
                    <span className={`pct-display__mark is-${feedback}`} aria-hidden="true">
                      {feedback === 'correct' ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
                    </span>
                  )}
                </div>
                <span className="pct-display__hint">Usa coma o punto para los decimales · <kbd>Enter</kbd></span>
              </Panel>

              {(feedback === null || isExam) && (
                <div className="pct-actions">
                  <GameButton
                    size="lg"
                    icon={isExam ? (isLast ? GraduationCap : Check) : Check}
                    onClick={handleCheck}
                    disabled={!userInput.trim()}
                  >
                    {isExam ? (isLast ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
                  </GameButton>
                  {!isExam && (
                    <GameButton variant="soft" icon={RefreshCw} onClick={nextProblem} title="Generar otro problema">
                      Otro problema
                    </GameButton>
                  )}
                </div>
              )}
            </div>
          </div>

          <RoundBanner
            show={!!feedback && !isExam}
            status={feedback === 'correct' ? 'won' : 'lost'}
            title={feedback === 'correct' ? '¡Correcto!' : 'No es correcto'}
            subtitle={<>La respuesta {feedback === 'correct' ? 'es' : 'era'} <strong>{formatNumber(problem.answer)}{problem.unit ? ` ${problem.unit}` : ''}</strong>.</>}
            action={nextProblem}
            actionLabel="Otro problema"
            actionIcon={Sparkles}
          />

          {showHelps && feedback === 'incorrect' && (
            <motion.div className="pct-explain" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="pct-explain__icon"><Lightbulb size={18} /></span>
              <div>
                <strong>Cómo se resuelve ({problem.label})</strong>
                <p>{explainProblem(problem)}</p>
              </div>
            </motion.div>
          )}

          <div className="pct-footer">
            {!isExam ? (
              <>
                <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setPhase('setup')}>
                  Cambiar dificultad
                </GameButton>
                {difficulty === 'medium' && (
                  <GameButton
                    variant={showHelp ? 'warning' : 'soft'}
                    size="sm"
                    icon={showHelp ? Eye : EyeOff}
                    onClick={() => setShowHelp((s) => !s)}
                    aria-pressed={showHelp}
                    title={showHelp ? 'Ocultar ayuda' : 'Mostrar ayuda'}
                  >
                    {showHelp ? 'Ayuda activa' : 'Ver ayuda'}
                  </GameButton>
                )}
                <span className="pct-footer__info"><Percent size={14} /> Problemas nuevos sin fin</span>
              </>
            ) : (
              <>
                <span className="pct-footer__info pct-footer__info--left">
                  <GraduationCap size={14} /> Modo examen · sin ayudas
                </span>
                <GameButton
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  className="pct-footer__exit"
                  onClick={() => setShowExitModal(true)}
                  title="Entregar el examen con tu nota actual"
                >
                  Salir del examen
                </GameButton>
              </>
            )}
          </div>
        </>
      )}

      {instructions}

      <ExitModal
        open={showExitModal}
        correct={examCorrect}
        answered={examIndex}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleExitExam}
      />
    </GameShell>
  );
};

export default Porcentajes;
