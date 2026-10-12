// src/apps/laboratorio-funciones-2d/LaboratorioFunciones2D.jsx
// Rediseño 2026 del "chrome" sobre el kit de interfaz (_shared/kit): panel de
// funciones, deslizadores, pantalla de fórmula y herramientas. El cálculo de
// la función, el trazado y la rejilla (geometría) no cambian.
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Settings,
    Info,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    ChevronDown,
    Calculator,
    Layers,
    SlidersHorizontal,
    Crosshair,
} from 'lucide-react';
import { GameShell, GameHeader, Hud, HudStat, Panel, GameButton, Segmented } from '../_shared/kit';
import './LaboratorioFunciones2D.css';

const COMPOSER_BASES = {
    'x': { name: 'Lineal (x)', func: (x) => x, latex: (val) => val },
    'x2': { name: 'Cuadrática (x²)', func: (x) => x * x, latex: (val) => `(${val})²` },
    'x3': { name: 'Cúbica (x³)', func: (x) => x * x * x, latex: (val) => `(${val})³` },
    'sin': { name: 'Seno (sin)', func: (x) => Math.sin(x), latex: (val) => `sin(${val})` },
    'cos': { name: 'Coseno (cos)', func: (x) => Math.cos(x), latex: (val) => `cos(${val})` },
    'abs': { name: 'Absoluto (|x|)', func: (x) => Math.abs(x), latex: (val) => `|${val}|` },
    'sqrt': { name: 'Raíz (√x)', func: (x) => x >= 0 ? Math.sqrt(x) : NaN, latex: (val) => `√(${val})` },
    'inv': { name: 'Inversa (1/x)', func: (x) => Math.abs(x) < 0.01 ? NaN : 1 / x, latex: (val) => `1/(${val})` }
};

const FUNCTIONS_TYPES = {
    LINEAR: {
        id: 'linear',
        name: 'Función Lineal',
        formula: 'y = ax + b',
        params: [
            { id: 'a', label: 'Pendiente (a)', min: -10, max: 10, step: 0.1, default: 1 },
            { id: 'b', label: 'Ordenada (b)', min: -10, max: 10, step: 0.5, default: 0 }
        ],
        calculate: (x, p) => p.a * x + p.b,
        desc: 'Representa una línea recta. "a" determina la inclinación y "b" el punto de corte con el eje Y.'
    },
    QUADRATIC: {
        id: 'quadratic',
        name: 'Función Cuadrática',
        formula: 'y = ax² + bx + c',
        params: [
            { id: 'a', label: 'Curvatura (a)', min: -5, max: 5, step: 0.1, default: 1 },
            { id: 'b', label: 'Desplazamiento (b)', min: -10, max: 10, step: 0.1, default: 0 },
            { id: 'c', label: 'Ordenada (c)', min: -10, max: 10, step: 0.5, default: 0 }
        ],
        calculate: (x, p) => p.a * Math.pow(x, 2) + p.b * x + p.c,
        desc: 'Representa una parábola. Si "a" es positivo abre hacia arriba, si es negativo hacia abajo.'
    },
    SINUSOIDAL: {
        id: 'sinusoidal',
        name: 'Función Seno',
        formula: 'y = a · sen(bx + c)',
        params: [
            { id: 'a', label: 'Amplitud (a)', min: 0.1, max: 10, step: 0.1, default: 2 },
            { id: 'b', label: 'Frecuencia (b)', min: 0.1, max: 5, step: 0.1, default: 1 },
            { id: 'c', label: 'Fase (c)', min: -Math.PI, max: Math.PI, step: 0.1, default: 0 }
        ],
        calculate: (x, p) => p.a * Math.sin(p.b * x + p.c),
        desc: 'Una función periódica que oscila. Muy común en física para representar ondas.'
    },
    EXPONENTIAL: {
        id: 'exponential',
        name: 'Función Exponencial',
        formula: 'y = a · bˣ',
        params: [
            { id: 'a', label: 'Escala (a)', min: 0.1, max: 5, step: 0.1, default: 1 },
            { id: 'b', label: 'Base (b)', min: 0.1, max: 5, step: 0.1, default: 2 }
        ],
        calculate: (x, p) => p.a * Math.pow(p.b, x),
        desc: 'Muestra un crecimiento o decrecimiento muy rápido. La base "b" determina el ritmo.'
    },
    LOGARITHMIC: {
        id: 'logarithmic',
        name: 'Logarítmica',
        formula: 'y = a · ln(bx + c)',
        params: [
            { id: 'a', label: 'Escala (a)', min: -5, max: 5, step: 0.1, default: 1 },
            { id: 'b', label: 'Interior (b)', min: 0.1, max: 5, step: 0.1, default: 1 },
            { id: 'c', label: 'Desplazamiento (c)', min: -5, max: 5, step: 0.1, default: 0 }
        ],
        calculate: (x, p) => (p.b * x + p.c) > 0 ? p.a * Math.log(p.b * x + p.c) : NaN,
        desc: 'Crece lentamente. Solo existe cuando el argumento es positivo.'
    },
    SQRT: {
        id: 'sqrt',
        name: 'Raíz Cuadrada',
        formula: 'y = a · √(x + b) + c',
        params: [
            { id: 'a', label: 'Escala (a)', min: -5, max: 5, step: 0.1, default: 1 },
            { id: 'b', label: 'Horizontal (b)', min: -10, max: 10, step: 0.5, default: 0 },
            { id: 'c', label: 'Vertical (c)', min: -10, max: 10, step: 0.5, default: 0 }
        ],
        calculate: (x, p) => (x + p.b) >= 0 ? p.a * Math.sqrt(x + p.b) + p.c : NaN,
        desc: 'La inversa de la cuadrática (media parábola tumbada).'
    },
    RATIONAL: {
        id: 'rational',
        name: 'Racional / Hipérbola',
        formula: 'y = a / (x + b) + c',
        params: [
            { id: 'a', label: 'Curvatura (a)', min: -5, max: 5, step: 0.1, default: 1 },
            { id: 'b', label: 'Asíntota V (b)', min: -10, max: 10, step: 0.5, default: 0 },
            { id: 'c', label: 'Asíntota H (c)', min: -10, max: 10, step: 0.5, default: 0 }
        ],
        calculate: (x, p) => {
            if (Math.abs(x + p.b) < 0.05) return NaN;
            return p.a / (x + p.b) + p.c;
        },
        desc: 'Hipérbola. Tiene asíntotas donde la función se rompe (1/x).'
    },
    ABSOLUTE: {
        id: 'absolute',
        name: 'Valor Absoluto',
        formula: 'y = a |x - b| + c',
        params: [
            { id: 'a', label: 'Apertura (a)', min: -5, max: 5, step: 0.1, default: 1 },
            { id: 'b', label: 'H. Shift (b)', min: -10, max: 10, step: 0.5, default: 0 },
            { id: 'c', label: 'V. Shift (c)', min: -10, max: 10, step: 0.5, default: 0 }
        ],
        calculate: (x, p) => p.a * Math.abs(x - p.b) + p.c,
        desc: 'Tiene forma de "V". Transforma cualquier valor negativo en positivo.'
    },
    COMPOSER: {
        id: 'composer',
        name: 'Transformaciones (Composer)',
        formula: 'y = a · f(b · (x + c)) + d',
        params: [
            { id: 'a', label: 'Estiramiento Vert. (a)', min: -3, max: 3, step: 0.1, default: 1 },
            { id: 'b', label: 'Frecuencia (b)', min: 0.1, max: 3, step: 0.1, default: 1 },
            { id: 'c', label: 'Desplazamiento H. (c)', min: -5, max: 5, step: 0.2, default: 0 },
            { id: 'd', label: 'Desplazamiento V. (d)', min: -5, max: 5, step: 0.2, default: 0 }
        ],
        isComposer: true,
        desc: 'Modo avanzado. Elige una función base y aplica transformaciones geométricas (traslaciones y escalados).'
    }
};

// Solo presentación: silueta de cada familia de funciones (32×24)
const FN_GLYPHS = {
    LINEAR: 'M4 21 L28 3',
    QUADRATIC: 'M5 3 Q16 39 27 3',
    SINUSOIDAL: 'M2 12 C6 0 10 0 13 12 S20 24 24 12 S29 2 31 6',
    EXPONENTIAL: 'M3 21 C14 21 20 19 29 2',
    LOGARITHMIC: 'M4 23 C5 10 10 7 29 5',
    SQRT: 'M4 21 C5 12 12 9 29 7',
    RATIONAL: 'M3 13 C10 12 13 10 14 2 M18 22 C19 14 22 12 29 11',
    ABSOLUTE: 'M4 3 L16 21 L28 3',
    COMPOSER: 'M3 18 C9 18 9 6 16 6 S23 18 29 18 M3 12 L29 12',
};
const FN_COLORS = {
    LINEAR: '#3b82f6', QUADRATIC: '#8b5cf6', SINUSOIDAL: '#06b6d4', EXPONENTIAL: '#f59e0b', LOGARITHMIC: '#10b981',
    SQRT: '#14b8a6', RATIONAL: '#ef4444', ABSOLUTE: '#ec4899', COMPOSER: '#6366f1',
};

const FnGlyph = ({ type }) => (
    <svg viewBox="0 0 32 24" className="lf2-glyph" aria-hidden="true">
        <path d="M1 12 H31 M16 1 V23" className="lf2-glyph__axes" />
        <path d={FN_GLYPHS[type]} className="lf2-glyph__curve" />
    </svg>
);

const LaboratorioFunciones2D = () => {
    const [selectedType, setSelectedType] = useState('LINEAR');
    const [composerBase, setComposerBase] = useState('x2');
    const [params, setParams] = useState({ a: 1, b: 0, c: 0, d: 0 });
    const [showGrid] = useState(true);
    const [functionsOpen, setFunctionsOpen] = useState(true);
    const [paramsOpen, setParamsOpen] = useState(true);
    const [zoom, setZoom] = useState(40); // Pixels per unit
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const currentFunc = FUNCTIONS_TYPES[selectedType];

    useEffect(() => {
        // Reset params when type changes
        const newParams = {};
        currentFunc.params.forEach(p => {
            newParams[p.id] = p.default;
        });
        setParams(newParams);
        if (currentFunc.isComposer && !COMPOSER_BASES[composerBase]) {
            setComposerBase('x2'); // Default composer base if current one is invalid
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType, currentFunc]);

    const handleParamChange = (id, val) => {
        setParams(prev => ({ ...prev, [id]: val }));
    };

    // Calculate generic or composer function
    const calculateY = (x) => {
        if (currentFunc.isComposer) {
            // y = a * f( b * (x + c) ) + d
            const baseF = COMPOSER_BASES[composerBase].func;
            const pA = params.a ?? 1;
            const pB = params.b ?? 1;
            const pC = params.c ?? 0;
            const pD = params.d ?? 0;

            const inner = pB * (x + pC);
            const val = baseF(inner);
            if (isNaN(val)) return NaN;
            return pA * val + pD;
        } else {
            return currentFunc.calculate(x, params);
        }
    };

    // Display formula logic
    const getFormulaDisplay = () => {
        if (currentFunc.isComposer) {
            const baseTex = COMPOSER_BASES[composerBase].latex;
            // a · f( b ( x + c )) + d
            const aVal = params.a ?? 1;
            const bVal = params.b ?? 1;
            const cVal = params.c ?? 0;
            const dVal = params.d ?? 0;

            const aStr = aVal.toFixed(1);
            const bStr = bVal.toFixed(1);
            const cStr = cVal >= 0 ? `+${cVal.toFixed(1)}` : cVal.toFixed(1);
            const dStr = dVal >= 0 ? `+${dVal.toFixed(1)}` : dVal.toFixed(1);

            const inner = `${bStr}(x ${cStr})`;
            return `y = ${aStr} · ${baseTex(inner)} ${dStr}`;
        }
        return currentFunc.formula
            .replace('a', params.a?.toFixed(1) || '1')
            .replace('b', params.b?.toFixed(1) || '0')
            .replace('c', params.c?.toFixed(1) || '0')
            .replace('d', params.d?.toFixed(1) || '0');
    };

    // Generate SVG path for the function
    const pathData = useMemo(() => {
        const width = 800;
        const height = 600;
        const centerX = width / 2;
        const centerY = height / 2;

        let path = "";
        const step = 0.05; // Higher resolution
        const rangeX = width / zoom / 2 + 2;

        let isPenDown = false;

        for (let x = -rangeX; x <= rangeX; x += step) {
            const y = calculateY(x);

            // Check validity
            if (isNaN(y) || Math.abs(y) > 500) { // 500 units is huge, implies asymptote
                isPenDown = false;
                continue;
            }

            // Convert to SVG coordinates
            const svgX = centerX + x * zoom;
            const svgY = centerY - y * zoom;

            // Clip drawing to avoid extreme drawing issues
            if (svgY < -5000 || svgY > 5000) {
                isPenDown = false;
                continue;
            }

            if (!isPenDown) {
                path += ` M ${svgX} ${svgY}`;
                isPenDown = true;
            } else {
                path += ` L ${svgX} ${svgY}`;
            }
        }
        return path;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFunc, params, zoom, composerBase, selectedType]);

    // Generate grid lines (los colores van por CSS para seguir el tema)
    const gridLines = useMemo(() => {
        const lines = [];
        const width = 800;
        const height = 600;
        const centerX = width / 2;
        const centerY = height / 2;

        const unitsX = Math.ceil(width / zoom / 2);
        const unitsY = Math.ceil(height / zoom / 2);

        for (let i = -unitsX; i <= unitsX; i++) {
            const x = centerX + i * zoom;
            lines.push(<line key={`v-${i}`} x1={x} y1={0} x2={x} y2={height} className={i === 0 ? 'lf2-axis' : 'lf2-gridline'} strokeWidth={i === 0 ? 2 : 1} />);
            if (i !== 0 && i % 2 === 0) {
                lines.push(<text key={`tx-${i}`} x={x + 2} y={centerY + 15} fontSize="10" className="lf2-tick">{i}</text>);
            }
        }

        for (let i = -unitsY; i <= unitsY; i++) {
            const y = centerY - i * zoom;
            lines.push(<line key={`h-${i}`} x1={0} y1={y} x2={width} y2={y} className={i === 0 ? 'lf2-axis' : 'lf2-gridline'} strokeWidth={i === 0 ? 2 : 1} />);
            if (i !== 0 && i % 2 === 0) {
                lines.push(<text key={`ty-${i}`} x={centerX + 5} y={y - 2} fontSize="10" className="lf2-tick">{i}</text>);
            }
        }

        return lines;
    }, [zoom]);

    const [activeTab, setActiveTab] = useState('graph'); // 'config' | 'graph'

    const resetView = () => {
        const def = {};
        currentFunc.params.forEach(p => def[p.id] = p.default);
        setParams(def);
        setZoom(40);
    };

    return (
        <GameShell accent="#3b82f6" accent2="#8b5cf6" wide className="lf2">
            <GameHeader
                right={(
                    <Hud>
                        <HudStat icon={ZoomIn} tone="time" value={zoom} label="px/unidad" />
                        <HudStat icon={LineChart} tone="accent" value={Object.keys(FUNCTIONS_TYPES).length} label="Familias" />
                    </Hud>
                )}
            />

            {/* Pestañas en móvil y tablet */}
            <div className="lf2-tabs">
                <Segmented
                    options={[
                        { value: 'graph', label: 'Gráfico', icon: LineChart },
                        { value: 'config', label: 'Configuración', icon: Settings },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <div className="lf2-layout" data-tab={activeTab}>
                {/* Panel de controles */}
                <aside className="lf2-side">
                    <Panel variant="surface" className="lf2-card">
                        <button type="button" className="lf2-card__head" onClick={() => setFunctionsOpen(!functionsOpen)} aria-expanded={functionsOpen}>
                            <span className="lf2-card__icon"><LineChart size={18} /></span>
                            <span className="lf2-card__title">Funciones</span>
                            <ChevronDown size={18} className={`lf2-card__chev ${functionsOpen ? 'is-open' : ''}`} />
                        </button>

                        <AnimatePresence initial={false}>
                            {functionsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="lf2-fns"
                                >
                                    {Object.keys(FUNCTIONS_TYPES).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedType(type);
                                            }}
                                            className={`lf2-fn ${selectedType === type ? 'is-active' : ''}`}
                                            style={{ '--fc': FN_COLORS[type] }}
                                        >
                                            <span className="lf2-fn__badge">
                                                {FUNCTIONS_TYPES[type].isComposer ? <Layers size={16} /> : <FnGlyph type={type} />}
                                            </span>
                                            <span className="lf2-fn__text">
                                                <span className="lf2-fn__name">{FUNCTIONS_TYPES[type].name}</span>
                                                <span className="lf2-fn__formula">{FUNCTIONS_TYPES[type].formula}</span>
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Panel>

                    <Panel variant="surface" className="lf2-card">
                        <button type="button" className="lf2-card__head" onClick={() => setParamsOpen(!paramsOpen)} aria-expanded={paramsOpen}>
                            <span className="lf2-card__icon"><SlidersHorizontal size={18} /></span>
                            <span className="lf2-card__title">
                                {currentFunc.isComposer ? 'Constructor' : `Ajustes: ${currentFunc.name}`}
                            </span>
                            <ChevronDown size={18} className={`lf2-card__chev ${paramsOpen ? 'is-open' : ''}`} />
                        </button>

                        <AnimatePresence initial={false}>
                            {paramsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="lf2-params"
                                >
                                    {/* Selector de Base para Composer */}
                                    {currentFunc.isComposer && (
                                        <div className="lf2-bases">
                                            <span className="lf2-label">Función base (f)</span>
                                            <div className="lf2-bases__grid">
                                                {Object.keys(COMPOSER_BASES).map(baseKey => (
                                                    <button
                                                        key={baseKey}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setComposerBase(baseKey);
                                                        }}
                                                        className={`lf2-base ${composerBase === baseKey ? 'is-active' : ''}`}
                                                    >
                                                        {COMPOSER_BASES[baseKey].name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentFunc.params.map(p => {
                                        const v = params[p.id] ?? p.default;
                                        const pct = ((v - p.min) / (p.max - p.min)) * 100;
                                        return (
                                            <div key={p.id} className="lf2-param">
                                                <div className="lf2-param__head">
                                                    <label className="lf2-label" htmlFor={`lf2-${p.id}`}>{p.label}</label>
                                                    <span key={v} className="lf2-param__value">{params[p.id]?.toFixed(2)}</span>
                                                </div>
                                                <input
                                                    id={`lf2-${p.id}`}
                                                    type="range"
                                                    className="lf2-range"
                                                    min={p.min}
                                                    max={p.max}
                                                    step={p.step}
                                                    value={v}
                                                    style={{ '--p': `${pct}%` }}
                                                    onChange={(e) => handleParamChange(p.id, parseFloat(e.target.value))}
                                                />
                                                <div className="lf2-param__scale"><span>{Number(p.min.toFixed(2))}</span><span>{Number(p.max.toFixed(2))}</span></div>
                                            </div>
                                        );
                                    })}

                                    <div key={selectedType} className="lf2-desc">
                                        <Info size={18} />
                                        <p>{currentFunc.desc}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Panel>
                </aside>

                {/* Área de gráfico */}
                <main className="lf2-main">
                    <div className="lf2-topbar">
                        <Panel variant="screen" className="lf2-formula">
                            <span className="lf2-formula__tag">f(x)</span>
                            <span key={selectedType} className="lf2-formula__expr">{getFormulaDisplay()}</span>
                        </Panel>
                    </div>

                    {/* Lienzo del gráfico */}
                    <div className="lf2-stage">
                        <svg
                            viewBox="0 0 800 600"
                            className="lf2-plot"
                            preserveAspectRatio="xMidYMid slice"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) * (800 / rect.width);
                                const mathX = (x - 400) / zoom;
                                const mathY = calculateY(mathX);
                                setHoveredPoint({ x: mathX, y: mathY });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                        >
                            {/* Degradado del trazo (en coordenadas del lienzo: válido también para rectas horizontales) */}
                            <defs>
                                <linearGradient id="lf2d-stroke" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="800" y2="0">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="55%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>

                            {/* Grid */}
                            {showGrid && gridLines}

                            {/* Halo suave bajo la curva (solo decorativo) */}
                            <motion.path
                                initial={false}
                                animate={{ d: pathData }}
                                transition={{ type: "tween", duration: 0.2 }}
                                fill="none"
                                className="lf2-curve-halo"
                                strokeWidth="11"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            />

                            {/* Path de la Función */}
                            <motion.path
                                initial={false}
                                animate={{ d: pathData }}
                                transition={{ type: "tween", duration: 0.2 }}
                                fill="none"
                                stroke="url(#lf2d-stroke)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Hover Indicator */}
                            {hoveredPoint && !isNaN(hoveredPoint.y) && Math.abs(hoveredPoint.y) < 100 && (
                                <g className="lf2-probe">
                                    <line
                                        x1={400 + hoveredPoint.x * zoom}
                                        y1={300}
                                        x2={400 + hoveredPoint.x * zoom}
                                        y2={300 - hoveredPoint.y * zoom}
                                        className="lf2-probe__guide"
                                    />
                                    <line
                                        x1={400}
                                        y1={300 - hoveredPoint.y * zoom}
                                        x2={400 + hoveredPoint.x * zoom}
                                        y2={300 - hoveredPoint.y * zoom}
                                        className="lf2-probe__guide"
                                    />
                                    <circle
                                        cx={400 + hoveredPoint.x * zoom}
                                        cy={300 - hoveredPoint.y * zoom}
                                        r="14"
                                        className="lf2-probe__halo"
                                    />
                                    <circle
                                        cx={400 + hoveredPoint.x * zoom}
                                        cy={300 - hoveredPoint.y * zoom}
                                        r="6"
                                        className="lf2-probe__dot"
                                    />
                                    <rect
                                        x={400 + hoveredPoint.x * zoom + 10}
                                        y={300 - hoveredPoint.y * zoom - 35}
                                        width="112"
                                        height="28"
                                        rx="10"
                                        className="lf2-probe__chip"
                                    />
                                    <text
                                        x={400 + hoveredPoint.x * zoom + 66}
                                        y={300 - hoveredPoint.y * zoom - 16}
                                        textAnchor="middle"
                                        fontSize="12"
                                        className="lf2-probe__text"
                                    >
                                        ({hoveredPoint.x.toFixed(2)}, {hoveredPoint.y.toFixed(2)})
                                    </text>
                                </g>
                            )}
                        </svg>

                        {/* Marca de agua / Leyenda */}
                        <div className="lf2-watermark" aria-hidden="true">
                            <span><Calculator size={14} /> MathLab 2D</span>
                            <small>Laboratorio de Representación Gráfica</small>
                        </div>

                        <div className="lf2-hint" aria-hidden="true">
                            <Crosshair size={13} /> Pasa el ratón por la curva para leer sus puntos
                        </div>

                        <div className="lf2-tools">
                            <GameButton variant="soft" size="sm" icon={ZoomIn} onClick={() => setZoom(prev => Math.min(prev + 10, 150))} title="Acercar zoom" aria-label="Acercar zoom" />
                            <GameButton variant="soft" size="sm" icon={ZoomOut} onClick={() => setZoom(prev => Math.max(prev - 10, 10))} title="Alejar zoom" aria-label="Alejar zoom" />
                            <GameButton variant="soft" size="sm" icon={RotateCcw} onClick={resetView} title="Restablecer vista">Restablecer</GameButton>
                        </div>
                    </div>
                </main>
            </div>
        </GameShell>
    );
};

export default LaboratorioFunciones2D;
