// src/apps/porcentajes/Porcentajes.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Percent, Calculator, Check, X, Lightbulb, RefreshCw,
  Sparkles, ChevronRight, LogOut, Eye, EyeOff,
} from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import { generateProblem, formatNumber, checkAnswer } from './problemGenerator';
import './Porcentajes.css';

const TOTAL_EXAM_QUESTIONS = 10;
const POINTS_PER_CORRECT = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 30; // por pregunta

const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Fácil',
    icon: '🟢',
    desc: '% de un número, encontrar total, proporciones, aumento y descuento básicos. Resultados enteros.',
    helps: 'con ayudas',
  },
  {
    id: 'medium',
    label: 'Medio',
    icon: '🟡',
    desc: 'Añade qué % es, IVA y repartos. Hasta 1 decimal.',
    helps: 'con ayudas',
  },
  {
    id: 'exam',
    label: 'Examen',
    icon: '🔴',
    desc: '10 preguntas con todos los tipos (incluye variación y escalas). Hasta 2 decimales. Sin ayudas.',
    helps: 'sin ayudas',
  },
];

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

// --- Fracción visible con barra colorada ---
const Fraction = ({ num, den, color = '#EC4899', size = 'md' }) => (
  <div className={`pp-frac pp-frac-${size}`}>
    <div className="pp-frac-num">{num}</div>
    <div className="pp-frac-bar" style={{ background: color }} />
    <div className="pp-frac-den">{den}</div>
  </div>
);

// --- Cuadrícula 10×10 mostrando P de cada 100 ---
const PercentGrid100 = ({ pct, color = '#EC4899' }) => {
  const filled = Math.min(100, Math.max(0, Math.round(pct)));
  const cells = [];
  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;
    cells.push(
      <rect
        key={i}
        x={col * 14 + 1}
        y={row * 14 + 1}
        width={12}
        height={12}
        rx={2.5}
        fill={i < filled ? color : '#fff'}
        stroke={i < filled ? color : '#E2E8F0'}
        strokeWidth="0.8"
      />
    );
  }
  return (
    <svg viewBox="0 0 142 142" width="120" height="120" className="pp-grid100">
      {cells}
    </svg>
  );
};

// --- Tarta con sector destacado ---
const PieChart = ({ pct, color = '#EC4899', size = 110 }) => {
  const safe = clamp(pct, 0, 100);
  const angle = (safe / 100) * 360;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="pp-pie">
      <circle cx={cx} cy={cy} r={r} fill="#FCE7F3" stroke="#fff" strokeWidth="2" />
      {path && <path d={path} fill={color} stroke="#fff" strokeWidth="2" />}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">
        {safe}%
      </text>
    </svg>
  );
};

// --- Barras apiladas mostrando precio inicial y resultado (aumento o descuento) ---
const StackBars = ({ V, P, mode }) => {
  // mode: 'increase' | 'decrease' | 'iva'
  const isUp = mode !== 'decrease';
  const baseColor = '#94A3B8';
  const deltaColor = mode === 'iva' ? '#A855F7' : (isUp ? '#10B981' : '#EF4444');
  // Para visualizar, normalizamos las longitudes
  const baseLen = 100; // % horizontal del original
  const deltaLen = clamp(P, 0, 100); // visualmente proporcional al porcentaje
  return (
    <svg viewBox="0 0 280 100" width="100%" height="92" className="pp-stackbars">
      <defs>
        <linearGradient id={`pp-base-${mode}`} x1="0" y1="0" x2="0" y2="40">
          <stop offset="0" stopColor="#CBD5E1" />
          <stop offset="1" stopColor={baseColor} />
        </linearGradient>
        <linearGradient id={`pp-delta-${mode}`} x1="0" y1="0" x2="0" y2="40">
          <stop offset="0" stopColor={deltaColor} stopOpacity="0.85" />
          <stop offset="1" stopColor={deltaColor} />
        </linearGradient>
      </defs>
      {/* Fila 1: original */}
      <text x="6" y="20" fontSize="11" fontWeight="700" fill="#64748B">Original</text>
      <rect x="60" y="8" width={baseLen} height="20" rx="6" fill={`url(#pp-base-${mode})`} />
      <text x={60 + baseLen / 2} y="22" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">{formatNumber(V)}</text>

      {/* Fila 2: resultado */}
      <text x="6" y="62" fontSize="11" fontWeight="700" fill="#64748B">Resultado</text>
      {isUp ? (
        <>
          <rect x="60" y="50" width={baseLen} height="20" rx="6" fill={`url(#pp-base-${mode})`} />
          <text x={60 + baseLen / 2} y="64" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">{formatNumber(V)}</text>
          <rect x={60 + baseLen + 4} y="50" width={Math.max(deltaLen, 18)} height="20" rx="6"
                fill={`url(#pp-delta-${mode})`} stroke={deltaColor} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={60 + baseLen + 4 + Math.max(deltaLen, 18) / 2} y="64" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">+{P}%</text>
        </>
      ) : (
        <>
          <rect x="60" y="50" width={baseLen - deltaLen} height="20" rx="6" fill={`url(#pp-base-${mode})`} />
          <text x={60 + (baseLen - deltaLen) / 2} y="64" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">?</text>
          <rect x={60 + baseLen - deltaLen} y="50" width={deltaLen} height="20" rx="6"
                fill={`url(#pp-delta-${mode})`} opacity="0.45" stroke={deltaColor} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={60 + baseLen - deltaLen / 2} y="64" textAnchor="middle" fontSize="11" fontWeight="800" fill={deltaColor}>−{P}%</text>
        </>
      )}
    </svg>
  );
};

// --- Ecuación de proporciones con flechas en cruz ---
const ProportionEq = ({ a, b, c, d }) => (
  <svg viewBox="0 0 280 110" width="100%" height="110" className="pp-propeq-svg">
    <defs>
      <marker id="pp-eq-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="#9333EA" />
      </marker>
    </defs>
    {/* Fracción izquierda */}
    <text x="50" y="40" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{a}</text>
    <line x1="20" y1="50" x2="80" y2="50" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
    <text x="50" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{b}</text>

    <text x="140" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">=</text>

    {/* Fracción derecha */}
    <text x="230" y="40" textAnchor="middle" fontSize="22" fontWeight="800" fill="#9333EA">{c}</text>
    <line x1="200" y1="50" x2="260" y2="50" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
    <text x="230" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{d}</text>

    {/* Flechas en cruz */}
    <path d="M 60 38 Q 145 0 230 65" fill="none" stroke="#9333EA" strokeWidth="1.6"
          strokeDasharray="4 3" markerEnd="url(#pp-eq-arr)" />
    <path d="M 60 75 Q 145 110 230 47" fill="none" stroke="#9333EA" strokeWidth="1.6"
          strokeDasharray="4 3" markerEnd="url(#pp-eq-arr)" />
    <text x="145" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9333EA">cruzar</text>
    <text x="145" y="106" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9333EA">cruzar</text>
  </svg>
);

// --- Escala visual: regla pequeña vs regla grande con un objeto ---
const ScaleVisual = ({ N, X }) => (
  <svg viewBox="0 0 280 120" width="100%" height="110" className="pp-scale-svg">
    <defs>
      <linearGradient id="pp-scale-plano" x1="0" y1="0" x2="0" y2="20">
        <stop offset="0" stopColor="#818CF8" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="pp-scale-real" x1="0" y1="0" x2="0" y2="20">
        <stop offset="0" stopColor="#F472B6" />
        <stop offset="1" stopColor="#BE185D" />
      </linearGradient>
    </defs>

    {/* Plano (pequeño) */}
    <text x="6" y="20" fontSize="11" fontWeight="700" fill="#64748B">PLANO</text>
    <rect x="60" y="8" width="60" height="22" rx="6" fill="url(#pp-scale-plano)" />
    <text x="90" y="24" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{X} cm</text>
    {/* Marcas regla */}
    <line x1="60" y1="34" x2="120" y2="34" stroke="#94A3B8" strokeWidth="1" />
    {[0, 1, 2, 3, 4, 5].map(i => (
      <line key={i} x1={60 + i * 12} y1="32" x2={60 + i * 12} y2="38" stroke="#94A3B8" strokeWidth="1" />
    ))}

    {/* Multiplicador */}
    <text x="180" y="50" textAnchor="middle" fontSize="14" fontWeight="800" fill="#9333EA">×{N}</text>
    <path d="M 130 50 L 230 50" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" markerEnd="url(#pp-eq-arr)" />

    {/* Real (grande) */}
    <text x="6" y="80" fontSize="11" fontWeight="700" fill="#64748B">REAL</text>
    <rect x="60" y="68" width="200" height="22" rx="6" fill="url(#pp-scale-real)" stroke="#9333EA" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="160" y="84" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">?</text>
    {/* Marcas regla */}
    <line x1="60" y1="94" x2="260" y2="94" stroke="#94A3B8" strokeWidth="1" />
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={i} x1={60 + i * 20} y1="92" x2={60 + i * 20} y2="98" stroke="#94A3B8" strokeWidth="1" />
    ))}
  </svg>
);

// --- Reparto: tarta dividida en p:q ---
const ShareVisual = ({ T, p, q }) => {
  const total = p + q;
  const pPct = (p / total) * 100;
  const angle = (pPct / 100) * 360;
  const size = 120;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const radians = (angle - 90) * (Math.PI / 180);
  const x = cx + r * Math.cos(radians);
  const y = cy + r * Math.sin(radians);
  const largeArc = angle > 180 ? 1 : 0;
  const path = `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
  return (
    <div className="pp-share-vis">
      <svg viewBox={`0 0 ${size} ${size}`} width="120" height="120" className="pp-share-pie">
        <circle cx={cx} cy={cy} r={r} fill="#6366F1" stroke="#fff" strokeWidth="2" />
        <path d={path} fill="#EC4899" stroke="#fff" strokeWidth="2" />
        <text x={cx - 18} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">{p}</text>
        <text x={cx + 18} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">{q}</text>
      </svg>
      <div className="pp-share-legend">
        <div className="pp-share-leg-item">
          <span className="pp-share-leg-color first" /> {p} partes (esto te piden)
        </div>
        <div className="pp-share-leg-item">
          <span className="pp-share-leg-color second" /> {q} partes (la otra)
        </div>
        <div className="pp-share-leg-total">Total a repartir: {T}</div>
      </div>
    </div>
  );
};

// --- Caja de fórmula con varias líneas (matemáticamente bonita) ---
const FormulaBox = ({ children }) => (
  <div className="pp-formula-box">{children}</div>
);

// --- Bloque de ejemplo resuelto ---
const Example = ({ children }) => (
  <div className="pp-example">
    <div className="pp-example-label">📌 Ejemplo</div>
    <div className="pp-example-content">{children}</div>
  </div>
);

// =============================================================
//   HELPER POR TIPO DE PROBLEMA
// =============================================================
const ProblemHelper = ({ problem }) => {
  if (!problem) return null;
  const { label, params, unit } = problem;

  const wrapper = (visual, formula, example) => (
    <div className="pp-help-panel">
      <div className="pp-help-title">
        <Lightbulb size={16} />
        <span>Cómo se calcula</span>
      </div>
      <div className="pp-help-grid">
        <div className="pp-help-visual">{visual}</div>
        <div className="pp-help-side">
          {formula}
          {example}
        </div>
      </div>
    </div>
  );

  switch (label) {
    case '% de un número': {
      const { P, V } = params;
      return wrapper(
        <div className="pp-vis-stack">
          <PercentGrid100 pct={P} />
          <p className="pp-vis-caption">{P} de cada 100 cuadritos</p>
        </div>,
        <FormulaBox>
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <Fraction num={`${V} × ${P}`} den="100" />
          </div>
          <p className="pp-formula-tip">"% de" = multiplicar y dividir entre 100</p>
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
        <div className="pp-vis-stack">
          <PieChart pct={pct} color="#A855F7" />
          <p className="pp-vis-caption">{formatNumber(X)} es esa porción de {V}</p>
        </div>,
        <FormulaBox>
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <Fraction num={formatNumber(X)} den={V} color="#A855F7" />
            <span className="pp-formula-times">× 100</span>
          </div>
          <p className="pp-formula-tip">divides parte / total y multiplicas por 100</p>
        </FormulaBox>,
        <Example>
          ¿Qué % es 20 de 80? <Fraction num="20" den="80" size="sm" /> × 100 = 25%
        </Example>
      );
    }
    case 'encontrar total': {
      const { P, X } = params;
      return wrapper(
        <div className="pp-vis-stack">
          <PercentGrid100 pct={P} color="#F59E0B" />
          <p className="pp-vis-caption">{P} cuadritos = {formatNumber(X)} → 100 cuadritos = ?</p>
        </div>,
        <FormulaBox>
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <Fraction num={`${formatNumber(X)} × 100`} den={P} color="#F59E0B" />
          </div>
          <p className="pp-formula-tip">si conoces el % y su valor, "subes" al 100%</p>
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
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <span className="pp-formula-paren">{V} ×</span>
            <Fraction num={`100 + ${P}`} den="100" color="#10B981" />
          </div>
          <p className="pp-formula-tip">
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
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <span className="pp-formula-paren">{V} ×</span>
            <Fraction num={`100 − ${P}`} den="100" color="#EF4444" />
          </div>
          <p className="pp-formula-tip">descontar P% = quedarte con el (100 − P)% del precio</p>
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
        <StackBars V={formatNumber(A)} P={Math.abs(Math.round(((B - A) / A) * 100))} mode={isUp ? 'increase' : 'decrease'} />,
        <FormulaBox>
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <Fraction num={`|${formatNumber(B)} − ${formatNumber(A)}|`} den={formatNumber(A)} color="#F59E0B" />
            <span className="pp-formula-times">× 100</span>
          </div>
          <p className="pp-formula-tip">la variación = diferencia / valor inicial × 100</p>
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
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <Fraction num={`${a} × ${d}`} den={b} color="#9333EA" />
          </div>
          <p className="pp-formula-tip">
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
          <div className="pp-formula-row">
            <span className="pp-formula-x">real =</span>
            <span className="pp-formula-times">{X} × {N} cm</span>
          </div>
          <p className="pp-formula-tip">
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
          <div className="pp-formula-row">
            <span className="pp-formula-x">x =</span>
            <Fraction num={`${T} × ${p}`} den={total} color="#EC4899" />
          </div>
          <p className="pp-formula-tip">
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

// =============================================================

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

  // ---------- SETUP ----------
  if (phase === 'setup') {
    return (
      <div className="pp-root">
        <motion.div
          className="pp-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="pp-header">
            <div className="pp-title">
              <span className="pp-emoji">📊</span>
              <span>Porcentajes y Proporciones</span>
              <InstructionsButton onClick={() => setShowInstructions(true)} />
            </div>
          </div>

          <p className="pp-intro">
            Aprende a manejar <strong>porcentajes</strong> (calcular un %, descuentos, IVA,
            variaciones) y <strong>proporciones</strong> (razones equivalentes, escalas,
            repartos). Elige la dificultad para empezar.
          </p>

          <div className="pp-difficulty-grid">
            {DIFFICULTIES.map((d) => (
              <motion.button
                key={d.id}
                className={`pp-difficulty-card pp-diff-${d.id}`}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(d.id)}
              >
                <div className="pp-diff-icon">{d.icon}</div>
                <div className="pp-diff-label">{d.label}</div>
                <div className="pp-diff-desc">{d.desc}</div>
                <div className="pp-diff-helps">{d.helps}</div>
                <ChevronRight size={18} className="pp-diff-arrow" />
              </motion.button>
            ))}
          </div>
        </motion.div>

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
      </div>
    );
  }

  // ---------- FINISHED ----------
  if (phase === 'finished') {
    const nota = Math.round((examCorrect / TOTAL_EXAM_QUESTIONS) * 100) / 10;
    const notaColor = nota >= 8 ? '#10b981' : nota >= 5 ? '#3b82f6' : '#ef4444';
    const notaMsg = nota >= 9 ? '¡Excelente! 🌟'
      : nota >= 7 ? '¡Muy bien!'
        : nota >= 5 ? 'Aprobado'
          : 'Necesitas repasar';
    const elapsed = examStartRef.current
      ? Math.round((Date.now() - examStartRef.current) / 1000)
      : 0;

    return (
      <div className="pp-root">
        <motion.div
          className="pp-card pp-result-card"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="pp-header">
            <div className="pp-title">
              <span className="pp-emoji">🏁</span>
              <span>Examen finalizado</span>
            </div>
          </div>

          <div className="pp-result-hero">
            <div className="pp-nota-block" style={{ borderColor: notaColor }}>
              <div className="pp-nota-label">Tu nota</div>
              <div className="pp-nota-value" style={{ color: notaColor }}>
                {nota.toFixed(1)}<span className="pp-nota-max">/10</span>
              </div>
              <div className="pp-nota-msg" style={{ color: notaColor }}>{notaMsg}</div>
            </div>
            <div className="pp-stats-block">
              <div className="pp-stat">
                <span className="pp-stat-label">Aciertos</span>
                <span className="pp-stat-value">{examCorrect} / {TOTAL_EXAM_QUESTIONS}</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-label">Puntos</span>
                <span className="pp-stat-value">{examPoints}</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-label">Tiempo</span>
                <span className="pp-stat-value">{elapsed}s</span>
              </div>
            </div>
          </div>

          <div className="pp-history">
            {examHistory.map((it, idx) => (
              <div key={idx} className={`pp-history-item ${it.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="pp-history-head">
                  <span className="pp-history-num">P{idx + 1}</span>
                  <span className={`pp-history-label pp-tag-${it.type}`}>{it.label}</span>
                  {it.isCorrect ? (
                    <span className="pp-history-result correct">
                      <Check size={14} /> +{it.points} pts ({it.elapsedSec}s)
                    </span>
                  ) : (
                    <span className="pp-history-result incorrect">
                      <X size={14} /> Era {formatNumber(it.correctAnswer)} {it.unit}
                    </span>
                  )}
                </div>
                <div className="pp-history-text">{it.text}</div>
                {!it.isCorrect && (
                  <div className="pp-history-user">
                    Tu respuesta: <strong>{it.userAnswer || '—'}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pp-result-actions">
            <button className="pp-btn primary" onClick={() => startGame('exam')}>
              <RefreshCw size={16} /> Repetir examen
            </button>
            <button className="pp-btn ghost" onClick={() => setPhase('setup')}>
              Cambiar dificultad
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------- PLAY ----------
  const diffMeta = DIFFICULTIES.find((d) => d.id === difficulty);

  return (
    <div className="pp-root">
      <motion.div
        className="pp-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pp-header">
          <div className="pp-title">
            <span className="pp-emoji">📊</span>
            <span>Porcentajes y Proporciones</span>
            <InstructionsButton onClick={() => setShowInstructions(true)} />
          </div>
          <div className="pp-stats">
            <span className={`pp-badge pp-badge-${difficulty}`}>
              {diffMeta?.icon} {diffMeta?.label}
            </span>
            {isExam && (
              <span className="pp-badge pp-badge-progress">
                {examIndex + 1} / {TOTAL_EXAM_QUESTIONS}
              </span>
            )}
            {problem?.label && (
              <span className={`pp-badge pp-tag-${problem.type}`}>{problem.label}</span>
            )}
            {difficulty === 'medium' && (
              <button
                type="button"
                className={`pp-help-toggle ${showHelp ? 'on' : ''}`}
                onClick={() => setShowHelp((s) => !s)}
                title={showHelp ? 'Ocultar ayuda' : 'Mostrar ayuda'}
                aria-pressed={showHelp}
              >
                {showHelp ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{showHelp ? 'Ayuda activa' : 'Ayuda'}</span>
              </button>
            )}
          </div>
        </div>

        {isExam && (
          <div className="pp-progress-bar">
            <div
              className="pp-progress-fill"
              style={{ width: `${((examIndex) / TOTAL_EXAM_QUESTIONS) * 100}%` }}
            />
          </div>
        )}

        {problem && (
          <>
            <div className="pp-problem-text">
              <Calculator size={20} className="pp-problem-icon" />
              <p>{problem.text}</p>
            </div>

            {showHelp && !isExam && (
              <ProblemHelper problem={problem} />
            )}

            <div className="pp-input-row">
              <label className="pp-input-label">Tu respuesta:</label>
              <div className="pp-input-wrap">
                <input
                  type="text"
                  inputMode="decimal"
                  className={`pp-input ${feedback === 'correct' ? 'correct' : feedback === 'incorrect' ? 'incorrect' : ''}`}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="?"
                  autoFocus
                  disabled={feedback !== null && !isExam}
                />
                <span className="pp-input-unit">{problem.unit || ''}</span>
              </div>
            </div>

            {feedback && !isExam && (
              <motion.div
                className={`pp-feedback ${feedback}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {feedback === 'correct' ? (
                  <>
                    <Check size={20} /> ¡Correcto! La respuesta es <strong>{formatNumber(problem.answer)} {problem.unit}</strong>.
                  </>
                ) : (
                  <>
                    <X size={20} /> No es correcto. La respuesta era <strong>{formatNumber(problem.answer)} {problem.unit}</strong>.
                  </>
                )}
              </motion.div>
            )}

            {showHelps && feedback === 'incorrect' && (
              <motion.div className="pp-explanation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Lightbulb size={16} className="pp-explanation-icon" />
                <div>
                  <p><strong>Cómo se resuelve ({problem.label}):</strong></p>
                  <p>{explainProblem(problem)}</p>
                </div>
              </motion.div>
            )}

            <div className="pp-actions">
              {feedback === null || isExam ? (
                <button
                  className="pp-btn primary"
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                >
                  <Check size={16} /> {isExam ? (examIndex + 1 >= TOTAL_EXAM_QUESTIONS ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
                </button>
              ) : (
                <button className="pp-btn primary" onClick={nextProblem}>
                  <Sparkles size={16} /> Otro problema
                </button>
              )}

              {!isExam && feedback === null && (
                <button className="pp-btn ghost" onClick={nextProblem} title="Generar otro problema">
                  <RefreshCw size={16} /> Otro problema
                </button>
              )}

              {!isExam && (
                <button className="pp-btn ghost" onClick={() => setPhase('setup')}>
                  Cambiar dificultad
                </button>
              )}

              {isExam && (
                <button
                  className="pp-btn danger"
                  onClick={() => setShowExitModal(true)}
                  title="Entregar el examen con tu nota actual"
                >
                  <LogOut size={16} /> Salir del examen
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Cómo jugar a Porcentajes y Proporciones"
      >
        <h3>🎯 Tipos de problema</h3>
        <ul>
          <li><strong>% de un número</strong>: <Percent size={12} /> P% × cantidad / 100.</li>
          <li><strong>Qué % es</strong>: parte / total × 100.</li>
          <li><strong>Encontrar total</strong>: parte × 100 / porcentaje.</li>
          <li><strong>Aumento / Descuento / IVA</strong>: precio × (1 ± P/100).</li>
          <li><strong>Variación</strong>: |B − A| / A × 100 (sin signo).</li>
          <li><strong>Proporción</strong>: a/b = x/d → x = a × d / b.</li>
          <li><strong>Escala</strong>: plano × escala (cuidado con las unidades).</li>
          <li><strong>Reparto</strong>: total × parte / (suma de partes).</li>
        </ul>

        <h3>📊 Nota y puntos</h3>
        <p className="instr-formula"><strong>Nota</strong> = aciertos / {TOTAL_EXAM_QUESTIONS} × 10</p>
        <p className="instr-formula"><strong>Puntos</strong> = {POINTS_PER_CORRECT} + bonus de velocidad (hasta {MAX_SPEED_BONUS}) por acierto</p>
      </InstructionsModal>

      <AnimatePresence>
        {showExitModal && (
          <motion.div
            className="pp-exit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExitModal(false)}
          >
            <motion.div
              className="pp-exit-modal"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pp-exit-icon"><LogOut size={32} /></div>
              <h3 className="pp-exit-title">¿Salir del examen?</h3>
              <p className="pp-exit-text">
                Llevas <strong>{examCorrect} de {examIndex}</strong> respuestas correctas.<br />
                Si sales ahora, tu nota será <strong>{((examCorrect / TOTAL_EXAM_QUESTIONS) * 10).toFixed(1)}/10</strong>
                {' '}y se guardará el intento.
              </p>
              <div className="pp-exit-actions">
                <button className="pp-btn ghost" onClick={() => setShowExitModal(false)}>
                  Cancelar
                </button>
                <button className="pp-btn danger" onClick={handleExitExam}>
                  <LogOut size={16} /> Salir y guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Porcentajes;
