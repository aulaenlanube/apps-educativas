// Medidas: longitud, masa y capacidad · comparar y ordenar (rediseño 2026 sobre _shared/kit).
// Lo propio del juego: cinta métrica, balanza de latón con pesas de hierro y
// jarras medidoras de cristal dibujadas en SVG (sin filtros), y la escalera de
// unidades como ayuda. Generadores, reglas, puntuación y tracking: sin cambios.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    ArrowLeftRight, Check, Footprints, Flame, LayoutGrid, ListOrdered, Ruler, Scale, SkipForward,
    Target, Trophy, Droplets, Weight as WeightIcon, Zap, RefreshCw,
} from 'lucide-react';
import useArtIds from '@/components/art/useArtIds';
import InstructionsModal from './InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, ProgressBar, Panel, KeyTile, GameButton, Segmented,
    ModeSelect, RoundBanner, ResultsScreen, FeedbackItem, useAppMeta,
} from './kit';
import './Medidas.css';

const TOTAL_TEST_QUESTIONS = 10;
const MAX_DIGITS_LIMIT = 99999;
const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 20;

// --- CONFIGURACIÓN DE SISTEMAS DE UNIDADES ---
const MEASURE_TYPES = {
    longitud: {
        id: 'longitud',
        label: 'Longitud',
        icon: '📏',
        baseUnit: 'mm',
        displayBase: 'm',
        units: { mm: 1, cm: 10, dm: 100, m: 1000, dam: 10000, hm: 100000, km: 1000000 },
        order: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']
    },
    masa: {
        id: 'masa',
        label: 'Masa',
        icon: '⚖️',
        baseUnit: 'mg',
        displayBase: 'g',
        units: { mg: 1, cg: 10, dg: 100, g: 1000, dag: 10000, hg: 100000, kg: 1000000 },
        order: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']
    },
    capacidad: {
        id: 'capacidad',
        label: 'Capacidad',
        icon: '💧',
        baseUnit: 'ml',
        displayBase: 'l',
        units: { ml: 1, cl: 10, dl: 100, l: 1000, dal: 10000, hl: 100000, kl: 1000000 },
        order: ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml']
    }
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickUnit = (list) => list[randomInt(0, list.length - 1)];

// --- GENERADORES ---

const generateMeasurement = (typeConfig, allowedUnits, maxValBase) => {
    const unitStr = pickUnit(allowedUnits);
    const factor = typeConfig.units[unitStr];

    const maxAllowedByBase = Math.floor(maxValBase / factor) || 1;
    const maxVal = Math.min(maxAllowedByBase, MAX_DIGITS_LIMIT);

    const val = randomInt(1, maxVal);

    return {
        text: `${val} ${unitStr}`,
        valueBase: val * factor,
        unit: unitStr,
        num: val
    };
};

const generateProblemData = (level, typeId) => {
    const config = MEASURE_TYPES[typeId];
    const { units } = config;

    let allowedUnits = [];
    let maxBase = 1000;

    const uSmall = typeId === 'longitud' ? 'cm' : (typeId === 'masa' ? 'g' : 'cl');
    const uMed = typeId === 'longitud' ? 'm' : (typeId === 'masa' ? 'kg' : 'l');
    const uTiny = typeId === 'longitud' ? 'mm' : (typeId === 'masa' ? 'mg' : 'ml');
    const uLarge = typeId === 'longitud' ? 'km' : (typeId === 'masa' ? 'kg' : 'kl');

    switch (level) {
        case 1:
            allowedUnits = [uSmall, uMed];
            maxBase = 20 * units[uMed];
            break;
        case 2:
            allowedUnits = [uSmall, uMed];
            maxBase = 100 * units[uMed];
            break;
        case 3:
            allowedUnits = [uTiny, uSmall, uMed, uLarge];
            maxBase = 5000 * units[uMed];
            break;
        case 4:
            allowedUnits = config.order;
            maxBase = 10 * units[uLarge];
            break;
        case 5:
            allowedUnits = [uMed, uLarge, uSmall];
            maxBase = 100 * units[uLarge];
            break;
        case 6:
            allowedUnits = config.order;
            maxBase = 1000 * units[uLarge];
            break;
        default:
            allowedUnits = [uMed];
    }

    allowedUnits = allowedUnits.filter(u => units[u]);

    // --- Generar Izquierda ---
    let left;
    if (level >= 5 && Math.random() > 0.6) {
        const possibleBigs = allowedUnits.filter(u => units[u] >= units[uMed]);
        const uBig = possibleBigs.length > 0 ? pickUnit(possibleBigs) : uMed;

        const possibleSmalls = allowedUnits.filter(u => units[u] < units[uBig]);
        const uSmallChoice = possibleSmalls.length > 0 ? pickUnit(possibleSmalls) : uTiny;

        const valBig = randomInt(1, 10);
        const valSmall = randomInt(10, 900);

        const totalBase = (valBig * units[uBig]) + (valSmall * units[uSmallChoice]);
        left = {
            text: `${valBig} ${uBig} ${valSmall} ${uSmallChoice}`,
            valueBase: totalBase,
            isComplex: true,
            unit: null
        };
    } else {
        left = generateMeasurement(config, allowedUnits, maxBase);
    }

    // --- Generar Derecha ---
    let right;
    let targetBase = left.valueBase;
    const relation = Math.random();

    if (relation < 0.3) {
        const validEquivalents = allowedUnits.filter(u => {
            const val = targetBase / units[u];
            return (targetBase % units[u] === 0) && (val <= MAX_DIGITS_LIMIT);
        });

        let candidates = validEquivalents;
        if (left.unit && !left.isComplex) {
            candidates = validEquivalents.filter(u => u !== left.unit);
        }

        if (candidates.length > 0) {
            const unitR = pickUnit(candidates);
            const valR = targetBase / units[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: targetBase };
        } else {
            const uRef = left.unit || uMed;
            const valRef = Math.floor(targetBase / units[uRef]) || targetBase;

            let finalUnit = uRef;
            let finalVal = valRef;

            if (valRef > MAX_DIGITS_LIMIT) {
                const biggerUnits = allowedUnits.filter(u => (targetBase / units[u]) <= MAX_DIGITS_LIMIT);
                if (biggerUnits.length > 0) {
                    finalUnit = pickUnit(biggerUnits);
                    finalVal = Math.floor(targetBase / units[finalUnit]);
                }
            }

            const part1 = Math.floor(finalVal / 2);
            const part2 = finalVal - part1;
            right = {
                text: `${part1} + ${part2} ${finalUnit}`,
                valueBase: targetBase
            };
        }
    } else {
        const variation = (Math.random() > 0.5 ? 1 : -1) * randomInt(1, Math.max(1, Math.floor(left.valueBase * 0.2)));
        let newBase = targetBase + variation;
        if (newBase <= 0) newBase = targetBase + Math.abs(variation);

        const validUnits = allowedUnits.filter(u => {
            const val = newBase / units[u];
            return (newBase % units[u] === 0) && (val <= MAX_DIGITS_LIMIT);
        });

        if (validUnits.length > 0) {
            const unitR = pickUnit(validUnits);
            const valR = newBase / units[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: newBase };
        } else {
            let bestUnit = allowedUnits[0];
            for (const u of allowedUnits) {
                if (newBase / units[u] <= MAX_DIGITS_LIMIT) {
                    bestUnit = u;
                    break;
                }
            }
            const safeBase = Math.round(newBase / units[bestUnit]) * units[bestUnit];
            const displayVal = safeBase / units[bestUnit];

            right = { text: `${displayVal} ${bestUnit}`, valueBase: safeBase };
        }
    }

    return { left, right };
};

const generateOrderProblemManual = (level, typeId, count = 3) => {
    const config = MEASURE_TYPES[typeId];
    const { units } = config;
    const allowedUnits = config.order;
    const items = [];

    for (let i = 0; i < count; i++) {
        const unit = pickUnit(allowedUnits);
        const factor = units[unit];
        let val;
        if (level === 1) val = randomInt(1, 20);
        else if (level <= 3) val = randomInt(1, 100);
        else val = randomInt(1, 500);

        items.push({
            id: Math.random(),
            text: `${val} ${unit}`,
            valueBase: val * factor
        });
    }
    return items;
};

const resolveLevelFromGrade = (gradeParam) => {
    const n = parseInt(gradeParam, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 6) return n;
    return 6;
};

const orderCountForLevel = (level) => {
    if (level <= 2) return 3;
    if (level <= 4) return 4;
    return 5;
};


/* ───────────────────────── Presentación ───────────────────────── */

// Ancho aproximado de un texto en «em» (cifras anchas; espacios, comas y
// paréntesis estrechos) para que el valor llene su hueco sin salirse.
const CHAR_EM = { ' ': 0.2, ',': 0.2, '.': 0.2, '(': 0.28, ')': 0.28, '+': 0.46, l: 0.24, i: 0.26 };
const textEm = (text) => Math.max(1.6, [...String(text || '')].reduce((acc, ch) => acc + (CHAR_EM[ch] ?? 0.52), 0) * 1.06);
const fitFont = (text, width, max) => Math.min(max, width / textEm(text));
// Etiquetas HTML: los valores largos («4672 + 4672 m») pueden ir en dos líneas.
const isLongText = (text) => String(text || '').length > 11;
const labelEm = (text) => (isLongText(text) ? textEm(text) / 1.7 : textEm(text)).toFixed(2);

const SIGN_STATE = { '<': 'lt', '>': 'gt', '=': 'eq' };
const SIGN_KEYS = [
    { sign: '<', cap: 'menor que' },
    { sign: '=', cap: 'igual a' },
    { sign: '>', cap: 'mayor que' },
];

// Pesa de hierro pintado con asa (viewBox 0 0 200 160). Si se pasa `text`,
// el valor va grabado en relieve sobre el cuerpo.
const WeightArt = ({ url, text }) => {
    const fs = text ? fitFont(text, 128, 40) : 0;
    return (
        <g>
            <ellipse cx="100" cy="153" rx="84" ry="6" fill={url('shadow')} />
            <path d="M76 50 C76 8 124 8 124 50" stroke={url('ring')} strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M81 38 C83 20 95 15 104 16" stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M50 44 H150 Q158 44 160 52 L182 140 Q184 150 174 150 H26 Q16 150 18 140 L40 52 Q42 44 50 44 Z" fill={url('iron')} />
            <path d="M50 44 H150 Q158 44 160 52 L162 60 H38 L40 52 Q42 44 50 44 Z" fill="#fff" opacity=".3" />
            <path d="M160 56 L182 140 Q184 150 174 150 H166 Z" fill="#1e1b4b" opacity=".25" />
            <path d="M44 68 L29 134" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
            {text && (
                <>
                    <text x="101" y={112 + fs * 0.36 + 1.6} textAnchor="middle" fontSize={fs} fontWeight="800" fontFamily="Fredoka, Nunito, system-ui, sans-serif" fill="#1e1b4b" opacity=".5">{text}</text>
                    <text x="100" y={112 + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="800" fontFamily="Fredoka, Nunito, system-ui, sans-serif" fill="#fff">{text}</text>
                </>
            )}
        </g>
    );
};

const WeightDefs = ({ id }) => (
    <>
        <linearGradient id={id('iron')} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#a5b4fc" />
            <stop offset=".45" stopColor="#6366f1" />
            <stop offset="1" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id={id('ring')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#94a3b8" />
            <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <radialGradient id={id('shadow')} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#1e1b4b" stopOpacity=".35" />
            <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
    </>
);

// Pesa suelta (ordenar).
const WeightSvg = () => {
    const [id, url] = useArtIds();
    return (
        <svg viewBox="0 0 200 160" className="md-weight" aria-hidden="true">
            <defs><WeightDefs id={id} /></defs>
            <WeightArt url={url} />
        </svg>
    );
};

// Balanza de latón: la cruz se inclina hacia el lado que el alumno dice que
// pesa más (refleja SU respuesta, no la solución).
const Balance = ({ left, right, sign, mood }) => {
    const [id, url] = useArtIds();
    const st = SIGN_STATE[sign] || 'idle';
    const S = 0.74;
    const weightAt = (x) => `translate(${x - 100 * S} ${206 - 150 * S}) scale(${S})`;
    return (
        <div className={`md-balance is-${st} ${mood ? `is-${mood}` : ''}`}>
            <svg viewBox="0 0 640 340" className="md-balance__svg" role="img" aria-label={`Balanza: ${left} ${sign || '?'} ${right}`}>
                <defs>
                    <WeightDefs id={id} />
                    <linearGradient id={id('brass')} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#fef3c7" />
                        <stop offset=".45" stopColor="#fbbf24" />
                        <stop offset="1" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id={id('brassV')} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#fde68a" />
                        <stop offset=".4" stopColor="#f59e0b" />
                        <stop offset="1" stopColor="#92400e" />
                    </linearGradient>
                    <radialGradient id={id('floor')} cx=".5" cy=".5" r=".5">
                        <stop offset="0" stopColor="#1e1b4b" stopOpacity=".3" />
                        <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <ellipse cx="320" cy="326" rx="270" ry="11" fill={url('floor')} />
                {/* peana y columna */}
                <path d="M250 296 H390 Q402 296 404 306 L408 318 Q410 326 400 326 H240 Q230 326 232 318 L236 306 Q238 296 250 296 Z" fill={url('brass')} />
                <path d="M244 300 H396" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
                <rect x="310" y="92" width="20" height="208" rx="7" fill={url('brassV')} />
                <path d="M315 100 V292" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" />

                {/* platillo izquierdo */}
                <g className="md-bal__pan md-bal__pan--l">
                    <path d="M80 92 L20 206 M80 92 L140 206" stroke="#92400e" strokeWidth="2.6" strokeLinecap="round" />
                    <g transform={weightAt(80)}><WeightArt url={url} text={left} /></g>
                    <path d="M6 205 H154 Q148 234 80 236 Q12 234 6 205 Z" fill={url('brass')} />
                    <ellipse cx="80" cy="205" rx="74" ry="5" fill="#fde68a" />
                </g>
                {/* platillo derecho */}
                <g className="md-bal__pan md-bal__pan--r">
                    <path d="M560 92 L500 206 M560 92 L620 206" stroke="#92400e" strokeWidth="2.6" strokeLinecap="round" />
                    <g transform={weightAt(560)}><WeightArt url={url} text={right} /></g>
                    <path d="M486 205 H634 Q628 234 560 236 Q492 234 486 205 Z" fill={url('brass')} />
                    <ellipse cx="560" cy="205" rx="74" ry="5" fill="#fde68a" />
                </g>

                {/* cruz con fiel */}
                <g className="md-bal__beam">
                    <path d="M316 88 L320 30 L324 88 Z" fill="#b45309" />
                    <path d="M319 84 L320 34" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
                    <rect x="70" y="80" width="500" height="13" rx="6.5" fill={url('brass')} />
                    <path d="M84 83 H556" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="80" cy="86" r="9" fill={url('brass')} />
                    <circle cx="560" cy="86" r="9" fill={url('brass')} />
                    <circle cx="320" cy="86" r="17" fill={url('brassV')} />
                    <circle cx="320" cy="86" r="6" fill="#92400e" />
                    <circle cx="316" cy="81" r="3" fill="#fff" opacity=".7" />
                </g>
            </svg>
            <span key={st} className="md-sign md-sign--plate gk-anim-pop" aria-hidden="true">{sign || '?'}</span>
        </div>
    );
};

// Jarra medidora de cristal con agua (viewBox 0 0 180 200). El nivel del agua
// es decorativo e igual en todas (no da pistas).
const JugSvg = () => {
    const [id, url] = useArtIds();
    const body = 'M30 32 L21 21 Q18 15 27 15 H141 Q149 15 146 23 L140 36 Q146 110 142 172 Q141 188 124 188 H48 Q31 188 30 172 Q26 110 30 32 Z';
    return (
        <svg viewBox="0 0 180 200" className="md-jug" aria-hidden="true">
            <defs>
                <clipPath id={id('clip')}><path d={body} /></clipPath>
                <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#67e8f9" />
                    <stop offset="1" stopColor="#0891b2" />
                </linearGradient>
                <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#e0f2fe" stopOpacity=".85" />
                    <stop offset=".5" stopColor="#f0f9ff" stopOpacity=".35" />
                    <stop offset="1" stopColor="#bae6fd" stopOpacity=".75" />
                </linearGradient>
                <radialGradient id={id('shadow')} cx=".5" cy=".5" r=".5">
                    <stop offset="0" stopColor="#0c4a6e" stopOpacity=".35" />
                    <stop offset="1" stopColor="#0c4a6e" stopOpacity="0" />
                </radialGradient>
            </defs>
            <ellipse cx="88" cy="191" rx="70" ry="7" fill={url('shadow')} />
            {/* asa */}
            <path d="M138 56 C178 58 180 142 134 148" stroke="#7dd3fc" strokeWidth="15" fill="none" strokeLinecap="round" />
            <path d="M138 56 C178 58 180 142 134 148" stroke="#e0f2fe" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".9" />
            {/* cristal */}
            <path d={body} fill={url('glass')} />
            <g clipPath={url('clip')}>
                <g className="md-jug__water">
                    <path d="M0 100 Q24 92 48 100 T96 100 T144 100 T192 100 V200 H0 Z" fill={url('water')} />
                    <path d="M0 100 Q24 92 48 100 T96 100 T144 100 T192 100" stroke="#cffafe" strokeWidth="3" fill="none" />
                </g>
                <ellipse cx="62" cy="150" rx="5" ry="5" fill="#fff" opacity=".35" />
                <ellipse cx="96" cy="128" rx="3" ry="3" fill="#fff" opacity=".35" />
            </g>
            {[56, 76, 96, 116, 136, 156].map((y, i) => (
                <path key={y} d={`M${i % 2 ? 120 : 112} ${y} H132`} stroke="#0369a1" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
            ))}
            <path d={body} stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinejoin="round" />
            <path d="M42 44 Q37 110 42 168" stroke="#fff" strokeOpacity=".85" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M25 18 H143" stroke="#fff" strokeOpacity=".9" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
};

// Cinta métrica amarilla con el valor en una etiqueta (HTML + CSS).
const RulerCard = ({ text, withCase = false }) => (
    <div className={`md-ruler ${withCase ? 'has-case' : ''}`}>
        {withCase && <span className="md-ruler__case" aria-hidden="true" />}
        <span className="md-ruler__tape">
            <span className="md-ruler__ticks" aria-hidden="true" />
            <span className={`md-ruler__label ${isLongText(text) ? 'is-long' : ''}`} style={{ '--em': labelEm(text) }}>{text}</span>
            <span className="md-ruler__ticks is-bottom" aria-hidden="true" />
        </span>
        <span className="md-ruler__hook" aria-hidden="true" />
    </div>
);

// Valor en una etiqueta (jarras y pesas sueltas).
const ValueTag = ({ text, className = '' }) => (
    <span className={`md-tag ${isLongText(text) ? 'is-long' : ''} ${className}`} style={{ '--em': labelEm(text) }}>{text}</span>
);

// Objeto de medida según la magnitud (ordenar y comparar sin balanza).
const MeasureObject = ({ type, text, variant = 'compare' }) => {
    if (type === 'longitud') return <RulerCard text={text} withCase={variant === 'compare'} />;
    if (type === 'masa') {
        return (
            <div className="md-obj">
                <WeightSvg />
                <ValueTag text={text} className="is-on-weight" />
            </div>
        );
    }
    return (
        <div className="md-obj">
            <JugSvg />
            <ValueTag text={text} />
        </div>
    );
};

// Escalera de unidades (ayuda de práctica): cada peldaño ×10 respecto al siguiente.
const UnitStairs = ({ config }) => (
    <motion.div
        className="md-stairs"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
    >
        <div className="md-stairs__labels"><span>← Mayor</span><span>Menor →</span></div>
        <div className="md-stairs__row">
            {config.order.map((u, i) => (
                <React.Fragment key={u}>
                    <div className={`md-step ${u === config.displayBase ? 'is-base' : ''}`} style={{ '--h': config.order.length - i }}>
                        <span className="md-step__unit">{u}</span>
                    </div>
                    {i < config.order.length - 1 && <span className="md-stairs__x" aria-hidden="true">×10</span>}
                </React.Fragment>
            ))}
        </div>
        <p className="md-stairs__hint">Al bajar un peldaño (hacia la derecha) se multiplica por 10.</p>
    </motion.div>
);

const TYPE_UI = {
    longitud: { icon: Ruler, noun: 'longitud', obj: 'la cinta métrica' },
    masa: { icon: WeightIcon, noun: 'masa', obj: 'la balanza' },
    capacidad: { icon: Droplets, noun: 'capacidad', obj: 'las jarras' },
};

const MedidasGame = ({ level: levelProp, title, onGameComplete, forcedType, forcedMode }) => {
    const { grade: gradeParam } = useParams();
    const meta = useAppMeta();
    const level = useMemo(() => {
        if (Number.isFinite(levelProp)) return levelProp;
        return resolveLevelFromGrade(gradeParam);
    }, [levelProp, gradeParam]);

    const forced = !!(forcedType && forcedMode);
    // Pantalla previa de modos (CLAUDE.md §3): 'menu' → elegir; 'play' → partida.
    const [screen, setScreen] = useState('menu');
    const [measureType, setMeasureType] = useState(forcedType || 'longitud');
    const [gameMode, setGameMode] = useState(forcedMode || 'comparar');
    const [orderCount, setOrderCount] = useState(() => orderCountForLevel(typeof levelProp === 'number' ? levelProp : resolveLevelFromGrade(gradeParam)));
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', valueBase: 0 });
    const [rightItem, setRightItem] = useState({ text: '', valueBase: 0 });
    const [orderItems, setOrderItems] = useState([]);
    const [selectedSign, setSelectedSign] = useState(null);
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [showHelper, setShowHelper] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const questionStartRef = useRef(null);
    // Marcador de práctica (solo presentación).
    const [practiceHits, setPracticeHits] = useState(0);
    const [practiceStreak, setPracticeStreak] = useState(0);

    const [testStats, setTestStats] = useState({
        questions: [],
        currentIndex: 0,
        score: 0,
        points: 0,
        answers: [],
        finished: false
    });

    // Si cambia el grade en la URL, reajusta orderCount cuando estamos en una app forzada
    useEffect(() => {
        if (forcedType && forcedMode) {
            setOrderCount(orderCountForLevel(level));
        }
    }, [level, forcedType, forcedMode]);

    const generateProblem = useCallback(() => {
        return generateProblemData(level, measureType);
    }, [level, measureType]);

    const startPractice = useCallback(() => {
        if (gameMode === 'comparar') {
            const { left, right } = generateProblem();
            setLeftItem(left);
            setRightItem(right);
            setSelectedSign(null);
        } else {
            const items = generateOrderProblemManual(level, measureType, orderCount);
            setOrderItems(items);
        }
        setFeedback({ text: '', type: '' });
        questionStartRef.current = Date.now();
    }, [generateProblem, gameMode, level, measureType, orderCount]);

    useEffect(() => {
        if (screen === 'play' && !isTestMode) startPractice();
    }, [measureType, startPractice, isTestMode, screen]);

    const startTest = useCallback(() => {
        const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => {
            if (gameMode === 'comparar') return generateProblem();
            return { items: generateOrderProblemManual(level, measureType, orderCount) };
        });

        setTestStats({
            questions: qs,
            currentIndex: 0,
            score: 0,
            points: 0,
            answers: [],
            finished: false
        });
        setIsTestMode(true);

        if (gameMode === 'comparar') {
            setLeftItem(qs[0].left);
            setRightItem(qs[0].right);
            setSelectedSign(null);
        } else {
            setOrderItems(qs[0].items);
        }
        setShowHelper(false);
        setFeedback({ text: '', type: '' });
        questionStartRef.current = Date.now();
    }, [generateProblem, gameMode, level, measureType, orderCount]);

    // --- Efecto Confetti al terminar Test con éxito ---
    useEffect(() => {
        if (isTestMode && testStats.finished && testStats.score >= 5) {
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isTestMode, testStats.finished, testStats.score]);


    const handleSignSelect = (sign) => {
        setSelectedSign(sign);
        if (!isTestMode) setFeedback({ text: '', type: '' });
    };

    const checkAnswer = () => {
        if (gameMode === 'comparar') {
            if (!selectedSign) return;
            const diff = leftItem.valueBase - rightItem.valueBase;
            let correct = '=';
            if (diff > 0) correct = '>';
            if (diff < 0) correct = '<';
            const isCorrect = selectedSign === correct;

            if (isTestMode) {
                handleTestNext(isCorrect, correct);
            } else {
                if (isCorrect) {
                    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#22c55e', '#86efac', '#166534'] });
                    setFeedback({ text: 'Preparando la siguiente medida…', type: 'feedback-correct' });
                    setPracticeHits((h) => h + 1);
                    setPracticeStreak((s) => s + 1);
                    setTimeout(startPractice, 1500);
                } else {
                    setPracticeStreak(0);
                    setFeedback({
                        text: `${leftItem.text} es ${correct === '>' ? 'MAYOR' : correct === '<' ? 'MENOR' : 'IGUAL'} que ${rightItem.text}`,
                        type: 'feedback-incorrect'
                    });
                }
            }
        } else {
            // Modo Ordenar
            let isCorrect = true;
            for (let i = 0; i < orderItems.length - 1; i++) {
                if (orderItems[i].valueBase > orderItems[i + 1].valueBase) {
                    isCorrect = false;
                    break;
                }
            }

            if (isTestMode) {
                handleTestNext(isCorrect, "Orden Correcto");
            } else {
                if (isCorrect) {
                    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#22c55e', '#86efac', '#166534'] });
                    setFeedback({ text: 'El orden es correcto. Preparando el siguiente reto…', type: 'feedback-correct' });
                    setPracticeHits((h) => h + 1);
                    setPracticeStreak((s) => s + 1);
                    setTimeout(startPractice, 1500);
                } else {
                    setPracticeStreak(0);
                    setFeedback({ text: 'Aún no están en orden. ¡Prueba de nuevo!', type: 'feedback-incorrect' });
                }
            }
        }
    };

    const swapItems = (idx1, idx2) => {
        if (idx2 < 0 || idx2 >= orderItems.length) return;
        const newItems = [...orderItems];
        [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
        setOrderItems(newItems);
        setFeedback({ text: '', type: '' });
    };

    const handleTestNext = (isCorrect, correctSign) => {
        const elapsedSec = questionStartRef.current
            ? (Date.now() - questionStartRef.current) / 1000
            : SPEED_BONUS_WINDOW_SEC;
        const speedBonus = Math.max(
            0,
            Math.round((1 - Math.min(elapsedSec, SPEED_BONUS_WINDOW_SEC) / SPEED_BONUS_WINDOW_SEC) * MAX_SPEED_BONUS)
        );
        const questionPoints = isCorrect ? BASE_POINTS + speedBonus : 0;

        const nextStats = {
            ...testStats,
            score: isCorrect ? testStats.score + 1 : testStats.score,
            points: testStats.points + questionPoints,
            answers: [...testStats.answers, {
                left: gameMode === 'comparar' ? leftItem.text : orderItems.map(i => i.text).join(' | '),
                right: gameMode === 'comparar' ? rightItem.text : '',
                user: gameMode === 'comparar' ? selectedSign : isCorrect ? 'OK' : 'FAIL',
                correct: correctSign,
                isCorrect,
                elapsedSec: Math.round(elapsedSec * 10) / 10,
                points: questionPoints
            }]
        };

        if (testStats.currentIndex < TOTAL_TEST_QUESTIONS - 1) {
            nextStats.currentIndex += 1;
            setTestStats(nextStats);
            const nextQ = testStats.questions[nextStats.currentIndex];
            if (gameMode === 'comparar') {
                setLeftItem(nextQ.left);
                setRightItem(nextQ.right);
                setSelectedSign(null);
            } else {
                setOrderItems(nextQ.items);
            }
            questionStartRef.current = Date.now();
        } else {
            nextStats.finished = true;
            setTestStats(nextStats);
        }
    };

    const currentConfig = MEASURE_TYPES[measureType];

    const trackedRef = useRef(false);
    useEffect(() => {
        if (isTestMode && testStats.finished && !trackedRef.current) {
            trackedRef.current = true;
            const maxPoints = TOTAL_TEST_QUESTIONS * (BASE_POINTS + MAX_SPEED_BONUS);
            onGameComplete?.({
                mode: 'test',
                score: testStats.points,
                maxScore: maxPoints,
                correctAnswers: testStats.score,
                totalQuestions: TOTAL_TEST_QUESTIONS,
            });
        }
        if (!testStats.finished) trackedRef.current = false;
    }, [isTestMode, testStats.finished, testStats.score, testStats.points, onGameComplete]);

    // Teclado físico: «<», «=» y «>» eligen signo (solo presentación).
    const locked = !isTestMode && feedback.type === 'feedback-correct';
    const signSelectRef = useRef(handleSignSelect);
    signSelectRef.current = handleSignSelect;
    useEffect(() => {
        if (screen !== 'play' || gameMode !== 'comparar' || locked) return undefined;
        const onKey = (e) => {
            if (e.key === '<' || e.key === '>' || e.key === '=') signSelectRef.current(e.key);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [screen, gameMode, locked]);

    const isOrder = gameMode === 'ordenar';
    const typeUi = TYPE_UI[measureType] || TYPE_UI.longitud;
    const shellProps = { accent: '#0284c7', accent2: '#6366f1' };
    const headerTitle = meta.name ? undefined : title;
    const backToMenu = () => { setIsTestMode(false); setScreen('menu'); };

    const instructions = (
        <InstructionsModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            title={title}
        >
            <h3>🎯 Objetivo</h3>
            <p>
                {gameMode === 'comparar'
                    ? <>Comparar dos medidas de <strong>{currentConfig.label.toLowerCase()}</strong> y decidir si la primera es mayor (&gt;), menor (&lt;) o igual (=) que la segunda.</>
                    : <>Ordenar varias medidas de <strong>{currentConfig.label.toLowerCase()}</strong> de menor a mayor.</>}
            </p>

            <h3>🕹️ Cómo se juega</h3>
            {gameMode === 'comparar' ? (
                <ul>
                    <li>Lee las dos medidas y pulsa el signo correcto: <strong>&lt;</strong>, <strong>=</strong> o <strong>&gt;</strong> (también con el teclado).</li>
                    {measureType === 'masa' && <li>La balanza se inclina hacia el lado que tú digas que pesa más.</li>}
                    <li>En <strong>práctica</strong> puedes activar la <strong>escalera de unidades</strong> como ayuda visual.</li>
                    <li>En <strong>examen</strong> no hay ayudas y se mide el tiempo.</li>
                </ul>
            ) : (
                <ul>
                    <li>Usa los botones <strong>⇄</strong> entre objetos para intercambiar posiciones hasta que queden de menor a mayor.</li>
                    <li>En <strong>práctica</strong> puedes activar la <strong>escalera de unidades</strong> como ayuda visual.</li>
                    <li>En <strong>examen</strong> no hay ayudas y se mide el tiempo.</li>
                </ul>
            )}

            <h3>📊 Nota y puntos en el examen</h3>
            <p>El examen tiene <strong>{TOTAL_TEST_QUESTIONS} preguntas</strong>. Tu nota va de <strong>0 a 10</strong>:</p>
            <p className="instr-formula">
                <strong>Nota</strong> = aciertos / {TOTAL_TEST_QUESTIONS} × 10
            </p>
            <p>
                Además ganas <strong>puntos para el ranking</strong> en cada acierto. Cuanto más rápido respondas, más puntos:
            </p>
            <p className="instr-formula">
                <strong>Puntos</strong> = {BASE_POINTS} + bonus de velocidad (hasta {MAX_SPEED_BONUS})
            </p>
            <p className="instr-note">
                Dos partidas con un 10 pueden tener distinta puntuación: gana el ranking quien lo termine antes.
            </p>

            <div className="instr-tips">
                <strong>💡 Consejo:</strong> en práctica, activa la ayuda de la escalera y observa
                cómo se multiplica por 10 cada peldaño. Al pasar al examen ya no la verás.
            </div>
        </InstructionsModal>
    );

    if (isTestMode && testStats.finished) {
        const nota = Math.round((testStats.score / TOTAL_TEST_QUESTIONS) * 100) / 10;
        const speedTotal = testStats.points - testStats.score * BASE_POINTS;
        return (
            <GameShell {...shellProps}>
                <ResultsScreen
                    nota={nota}
                    points={testStats.points}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${testStats.score}/${TOTAL_TEST_QUESTIONS}` },
                        { icon: Zap, tone: 'streak', label: 'Bonus rapidez', value: `+${speedTotal}` },
                    ]}
                    actions={[
                        { label: 'Repetir examen', onClick: startTest, icon: RefreshCw },
                        { label: 'Cambiar de modo', onClick: backToMenu, icon: LayoutGrid, variant: 'soft' },
                    ]}
                >
                    {testStats.answers.map((ans, idx) => (
                        <FeedbackItem
                            key={idx}
                            index={idx + 1}
                            ok={ans.isCorrect}
                            title={ans.right
                                ? <span className="md-fb-eq">{ans.left} <b>{ans.user || '?'}</b> {ans.right}</span>
                                : <span className="md-fb-eq">{ans.left.split(' | ').join('  ·  ')}</span>}
                        >
                            {ans.isCorrect
                                ? <>+{ans.points} puntos · {String(ans.elapsedSec).replace('.', ',')} s</>
                                : gameMode === 'comparar'
                                    ? <>El signo correcto era <strong>{ans.correct}</strong>.</>
                                    : 'Ese orden no iba de menor a mayor.'}
                        </FeedbackItem>
                    ))}
                </ResultsScreen>
            </GameShell>
        );
    }

    // Pantalla previa: elegir modo (y, si la app no viene fijada, magnitud y juego)
    if (screen === 'menu') {
        const modes = [
            {
                id: 'practice', tone: 'easy', title: 'Práctica',
                desc: isOrder ? `Ordena medidas de ${typeUi.noun} con la escalera de unidades a mano.` : `Compara medidas de ${typeUi.noun} con ayuda y corrección al momento.`,
                features: ['Escalera de unidades', 'Retos sin fin'],
            },
            {
                id: 'exam', tone: 'exam', title: 'Examen',
                desc: `${TOTAL_TEST_QUESTIONS} preguntas sin ayudas. Al final verás tu nota.`,
                features: ['Nota sobre 10', 'Puntos extra por rapidez'],
            },
        ];
        const selectMode = (id) => {
            // La práctica la arranca el efecto de arriba al pasar a 'play'.
            if (id === 'exam') startTest();
            else setIsTestMode(false);
            setScreen('play');
        };
        const extra = forced ? null : (
            <>
                {!forcedType && (
                    <div className="md-setting">
                        <span className="md-setting__label">Magnitud</span>
                        <Segmented
                            value={measureType}
                            onChange={setMeasureType}
                            options={Object.values(MEASURE_TYPES).map((t) => ({ value: t.id, label: t.label, icon: TYPE_UI[t.id].icon }))}
                        />
                    </div>
                )}
                {!forcedMode && (
                    <div className="md-setting">
                        <span className="md-setting__label">Juego</span>
                        <Segmented
                            value={gameMode}
                            onChange={setGameMode}
                            options={[
                                { value: 'comparar', label: 'Comparar', icon: Scale },
                                { value: 'ordenar', label: 'Ordenar', icon: ListOrdered },
                            ]}
                        />
                    </div>
                )}
                {!forcedMode && isOrder && (
                    <div className="md-setting">
                        <span className="md-setting__label">Medidas por reto</span>
                        <Segmented value={orderCount} onChange={setOrderCount} options={[3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
                    </div>
                )}
            </>
        );
        return (
            <GameShell {...shellProps}>
                <ModeSelect
                    title={headerTitle}
                    modes={modes}
                    onSelect={selectMode}
                    onHelp={() => setShowInstructions(true)}
                    extra={extra}
                />
                {instructions}
            </GameShell>
        );
    }

    const isLast = testStats.currentIndex === TOTAL_TEST_QUESTIONS - 1;
    const boardState = isTestMode ? 'playing'
        : feedback.type === 'feedback-correct' ? 'won'
            : feedback.type === 'feedback-incorrect' ? 'lost' : 'playing';
    const qKey = isTestMode ? `t${testStats.currentIndex}` : `p${leftItem.text}|${rightItem.text}`;
    const signState = SIGN_STATE[selectedSign] || 'idle';

    return (
        <GameShell {...shellProps}>
            <GameHeader
                title={headerTitle}
                mode={isTestMode ? 'exam' : 'easy'}
                modeLabel={isTestMode ? 'Examen' : 'Práctica'}
                onHelp={() => setShowInstructions(true)}
                right={
                    <Hud>
                        {isTestMode ? (
                            <HudStat icon={Target} tone="progress" value={`${testStats.currentIndex + 1}/${TOTAL_TEST_QUESTIONS}`} label="Pregunta" />
                        ) : (
                            <>
                                <HudStat icon={Trophy} tone="good" value={practiceHits} label="Aciertos" />
                                <HudStat icon={Flame} tone="streak" value={practiceStreak} label="Racha" />
                            </>
                        )}
                    </Hud>
                }
            />

            {isTestMode && (
                <div className="md-progress">
                    <ProgressBar value={testStats.currentIndex} max={TOTAL_TEST_QUESTIONS} label="Progreso del examen" />
                </div>
            )}

            {!isTestMode && (
                <div className="md-toolbar">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={showHelper}
                        className={`md-toggle ${showHelper ? 'is-on' : ''}`}
                        onClick={() => setShowHelper(!showHelper)}
                    >
                        <Footprints size={16} /> Escalera de unidades
                        <span className="md-toggle__track" aria-hidden="true"><span className="md-toggle__thumb" /></span>
                    </button>
                </div>
            )}

            {/* --- Escalera de unidades (solo en práctica) --- */}
            {showHelper && !isTestMode && <UnitStairs config={currentConfig} />}

            {/* ZONA DE JUEGO */}
            {gameMode === 'comparar' ? (
                <Panel variant="inset" className={`md-bench is-${boardState}`}>
                    <p className="md-prompt">¿Qué signo va en medio?</p>
                    {measureType === 'masa' ? (
                        <motion.div
                            key={qKey}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                        >
                            <Balance left={leftItem.text} right={rightItem.text} sign={selectedSign} mood={boardState === 'playing' ? '' : boardState} />
                        </motion.div>
                    ) : (
                        <div className="md-duel">
                            <motion.div
                                key={`L-${qKey}`}
                                className="md-duel__side"
                                initial={{ opacity: 0, x: -24, scale: 0.92 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                <MeasureObject type={measureType} text={leftItem.text} />
                            </motion.div>
                            <span key={signState} className={`md-sign is-${signState} gk-anim-pop`} aria-label={selectedSign ? `Signo ${selectedSign}` : 'Sin signo'}>
                                {selectedSign || '?'}
                            </span>
                            <motion.div
                                key={`R-${qKey}`}
                                className="md-duel__side"
                                initial={{ opacity: 0, x: 24, scale: 0.92 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
                            >
                                <MeasureObject type={measureType} text={rightItem.text} />
                            </motion.div>
                        </div>
                    )}
                </Panel>
            ) : (
                <Panel variant="inset" className={`md-bench is-${boardState}`}>
                    <p className="md-prompt">Ordena de <strong>menor</strong> a <strong>mayor</strong></p>
                    <div className={`md-shelf md-shelf--${measureType} ${feedback.type === 'feedback-incorrect' ? 'gk-anim-shake' : ''}`}>
                        {orderItems.map((item, idx) => (
                            <React.Fragment key={item.id}>
                                <motion.div
                                    className="md-slot"
                                    layout
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <span className="md-slot__pos" aria-hidden="true">{idx + 1}º</span>
                                    <MeasureObject type={measureType} text={item.text} variant="order" />
                                </motion.div>
                                {idx < orderItems.length - 1 && (
                                    <div className="md-sep">
                                        <span className="md-sep__lt" aria-hidden="true">&lt;</span>
                                        <button
                                            type="button"
                                            className="md-swap"
                                            onClick={() => swapItems(idx, idx + 1)}
                                            title="Intercambiar"
                                            aria-label={`Intercambiar ${idx + 1}º y ${idx + 2}º`}
                                            disabled={locked}
                                        >
                                            <ArrowLeftRight size={18} strokeWidth={2.6} />
                                        </button>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        <span className="md-shelf__board" aria-hidden="true" />
                    </div>
                </Panel>
            )}

            {gameMode === 'comparar' && (
                <div className="md-signs" role="group" aria-label="Elige el signo">
                    {SIGN_KEYS.map((s) => (
                        <KeyTile
                            key={s.sign}
                            className="md-signkey"
                            state={selectedSign === s.sign ? 'selected' : 'idle'}
                            onClick={() => handleSignSelect(s.sign)}
                            disabled={locked}
                            aria-label={`Signo ${s.cap}`}
                            aria-pressed={selectedSign === s.sign}
                        >
                            <span className="md-signkey__glyph">{s.sign}</span>
                            <span className="md-signkey__cap">{s.cap}</span>
                        </KeyTile>
                    ))}
                </div>
            )}

            <RoundBanner
                show={!isTestMode && !!feedback.text}
                status={feedback.type === 'feedback-correct' ? 'won' : 'lost'}
                title={feedback.type === 'feedback-correct' ? '¡Correcto!' : 'Incorrecto'}
                subtitle={feedback.text}
            />

            <div className="md-actions">
                {isTestMode ? (
                    <GameButton
                        size="lg"
                        iconRight={SkipForward}
                        onClick={checkAnswer}
                        disabled={gameMode === 'comparar' && !selectedSign}
                    >
                        {isLast ? 'Finalizar' : 'Siguiente'}
                    </GameButton>
                ) : (
                    <>
                        <GameButton
                            size="lg"
                            variant="success"
                            icon={Check}
                            onClick={checkAnswer}
                            disabled={locked || (gameMode === 'comparar' && !selectedSign)}
                        >
                            Comprobar
                        </GameButton>
                        <GameButton variant="soft" icon={SkipForward} onClick={startPractice} disabled={locked}>Siguiente</GameButton>
                    </>
                )}
            </div>

            <div className="md-footer">
                {!isTestMode ? (
                    <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToMenu}>Cambiar modo</GameButton>
                ) : (
                    <span className="md-footer__info">Modo examen · sin ayudas · cuenta la rapidez</span>
                )}
                <span className="md-footer__info md-footer__tip">
                    {gameMode === 'comparar' ? 'También puedes escribir < = >' : 'Usa ⇄ para intercambiar dos medidas vecinas'}
                </span>
            </div>

            {instructions}
        </GameShell>
    );
};

// {...props} primero: así el level numérico del wrapper no lo sobrescribe el level string ("primaria") que AppRunnerPage pasa por la URL.
export const LongitudComparar = (props) => <MedidasGame {...props} forcedType="longitud" forcedMode="comparar" title="Longitud: Comparar" />;
export const LongitudOrdenar = (props) => <MedidasGame {...props} forcedType="longitud" forcedMode="ordenar" title="Longitud: Ordenar" />;
export const MasaComparar = (props) => <MedidasGame {...props} forcedType="masa" forcedMode="comparar" title="Masa: Comparar" />;
export const MasaOrdenar = (props) => <MedidasGame {...props} forcedType="masa" forcedMode="ordenar" title="Masa: Ordenar" />;
export const CapacidadComparar = (props) => <MedidasGame {...props} forcedType="capacidad" forcedMode="comparar" title="Capacidad: Comparar" />;
export const CapacidadOrdenar = (props) => <MedidasGame {...props} forcedType="capacidad" forcedMode="ordenar" title="Capacidad: Ordenar" />;

export { generateProblemData, generateOrderProblemManual };
export default MedidasGame;
