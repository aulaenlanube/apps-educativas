// src/apps/laboratorio-funciones-2d/LaboratorioFunciones2D.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Settings,
    HelpCircle,
    Info,
    Maximize2,
    RotateCcw,
    Zap,
    Variable,
    Activity,
    ChevronRight,
    ChevronDown,
    Calculator,
    Layers
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

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

const LaboratorioFunciones2D = () => {
    const [selectedType, setSelectedType] = useState('LINEAR');
    const [composerBase, setComposerBase] = useState('x2');
    const [params, setParams] = useState({ a: 1, b: 0, c: 0, d: 0 });
    const [showGrid, setShowGrid] = useState(true);
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
    }, [currentFunc, params, zoom, composerBase, selectedType]);

    // Generate grid lines
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
            lines.push(<line key={`v-${i}`} x1={x} y1={0} x2={x} y2={height} stroke={i === 0 ? "#4f46e5" : "#e2e8f0"} strokeWidth={i === 0 ? 2 : 1} />);
            if (i !== 0 && i % 2 === 0) {
                lines.push(<text key={`tx-${i}`} x={x + 2} y={centerY + 15} fontSize="10" fill="#94a3b8">{i}</text>);
            }
        }

        for (let i = -unitsY; i <= unitsY; i++) {
            const y = centerY - i * zoom;
            lines.push(<line key={`h-${i}`} x1={0} y1={y} x2={width} y2={y} stroke={i === 0 ? "#4f46e5" : "#e2e8f0"} strokeWidth={i === 0 ? 2 : 1} />);
            if (i !== 0 && i % 2 === 0) {
                lines.push(<text key={`ty-${i}`} x={centerX + 5} y={y - 2} fontSize="10" fill="#94a3b8">{i}</text>);
            }
        }

        return lines;
    }, [zoom]);

    const [activeTab, setActiveTab] = useState('graph'); // 'config' | 'graph'

    return (
        <div className="flex flex-col h-[82vh] w-full p-2 box-border gap-4">

            {/* Mobile Tabs Navigation */}
            <div className="lg:hidden flex bg-white/80 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                <button
                    onClick={() => setActiveTab('graph')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'graph' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <LineChart className="w-4 h-4" />
                        Gráfico
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" />
                        Configuración
                    </div>
                </button>
            </div>

            <div className="flex flex-1 lg:flex-row gap-6 overflow-hidden relative">

                {/* Sidebar de Controles */}
                <aside className={`
                    w-full lg:w-80 h-full flex flex-col gap-4 overflow-hidden transition-all duration-300 absolute lg:relative z-10 bg-[#f0f9ff]/90 lg:bg-transparent p-1 lg:p-0
                    ${activeTab === 'config' ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0 lg:translate-x-0 lg:opacity-100'}
                `}>

                    {/* Selector de Tipo */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white shrink-0 flex flex-col overflow-hidden transition-all">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 transition-colors"
                            onClick={() => setFunctionsOpen(!functionsOpen)}
                        >
                            <div className="flex items-center gap-2 text-indigo-600">
                                <LineChart className="w-5 h-5" />
                                <h2 className="font-bold text-lg uppercase tracking-wider">Funciones</h2>
                            </div>
                            {functionsOpen ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5 text-indigo-400" />}
                        </div>

                        <AnimatePresence>
                            {functionsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar p-4 pt-0 max-h-[30vh]">
                                        {Object.keys(FUNCTIONS_TYPES).map(type => (
                                            <button
                                                key={type}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedType(type);
                                                }}
                                                className={`flex items-center justify-between p-3 rounded-2xl transition-all shrink-0 ${selectedType === type
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${selectedType === type ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                                        {FUNCTIONS_TYPES[type].isComposer ? <Layers className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                    </div>
                                                    <span className="font-semibold text-sm text-left">{FUNCTIONS_TYPES[type].name}</span>
                                                </div>
                                                {selectedType === type && <ChevronRight className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Parámetros */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white shrink-0 flex flex-col overflow-hidden transition-all">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 transition-colors"
                            onClick={() => setParamsOpen(!paramsOpen)}
                        >
                            <div className="flex items-center gap-2 text-slate-700">
                                <Settings className="w-5 h-5" />
                                <h2 className="font-bold text-sm uppercase tracking-widest">
                                    {currentFunc.isComposer ? 'Constructor' : `Ajustes: ${currentFunc.name}`}
                                </h2>
                            </div>
                            {paramsOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </div>

                        <AnimatePresence>
                            {paramsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="overflow-y-auto custom-scrollbar p-5 pt-0 max-h-[50vh]">
                                        {/* Selector de Base para Composer */}
                                        {currentFunc.isComposer && (
                                            <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Función Base (f)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.keys(COMPOSER_BASES).map(baseKey => (
                                                        <button
                                                            key={baseKey}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setComposerBase(baseKey);
                                                            }}
                                                            className={`text-xs p-2 rounded-lg font-bold transition-all ${composerBase === baseKey
                                                                ? 'bg-indigo-500 text-white shadow-md'
                                                                : 'bg-white text-slate-500 hover:bg-white/80'
                                                                }`}
                                                        >
                                                            {COMPOSER_BASES[baseKey].name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            {currentFunc.params.map(p => (
                                                <div key={p.id} className="space-y-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{p.label}</label>
                                                        <span className="bg-slate-100 text-slate-700 w-12 text-center py-1 rounded-md text-xs font-mono font-bold border border-slate-200">
                                                            {params[p.id]?.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <Slider
                                                        value={[params[p.id] || p.default]}
                                                        min={p.min}
                                                        max={p.max}
                                                        step={p.step}
                                                        onValueChange={([val]) => handleParamChange(p.id, val)}
                                                        className="py-2"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                                <Info className="w-5 h-5 text-slate-400 mt-0.5" />
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                    {currentFunc.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>

                {/* Área de Gráfico */}
                <main className="flex-1 h-full flex flex-col gap-4 overflow-hidden w-full absolute lg:relative z-0">

                    {/* Panel Superior Datos */}
                    <div className="bg-white/90 backdrop-blur-xl p-4 sm:px-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start overflow-hidden">
                                <Variable className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                <span className="font-mono text-lg sm:text-xl font-bold tracking-wider truncate max-w-[250px] sm:max-w-md">
                                    {getFormulaDisplay()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl hover:bg-slate-100"
                                onClick={() => setZoom(prev => Math.min(prev + 10, 150))}
                                title="Acercar Zoom"
                            >
                                <Maximize2 className="w-5 h-5 text-slate-500" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl hover:bg-slate-100"
                                onClick={() => setZoom(prev => Math.max(prev - 10, 10))}
                                title="Alejar Zoom"
                            >
                                <div className="w-4 h-0.5 bg-slate-500 rounded-full"></div>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl hover:bg-slate-100"
                                onClick={() => {
                                    const def = {};
                                    currentFunc.params.forEach(p => def[p.id] = p.default);
                                    setParams(def);
                                    setZoom(40);
                                }}
                                title="Restablecer vista"
                            >
                                <RotateCcw className="w-5 h-5 text-slate-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Canvas del Gráfico */}
                    <div className="relative flex-1 bg-slate-50 rounded-[2.5rem] border border-white shadow-inner overflow-hidden min-h-0">

                        {/* SVG Principal */}
                        <svg
                            viewBox="0 0 800 600"
                            className="w-full h-full cursor-crosshair select-none"
                            preserveAspectRatio="xMidYMid slice"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) * (800 / rect.width);
                                const y = (e.clientY - rect.top) * (600 / rect.height);
                                const mathX = (x - 400) / zoom;
                                const mathY = calculateY(mathX);
                                setHoveredPoint({ x: mathX, y: mathY });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                        >
                            {/* Grid */}
                            {showGrid && gridLines}

                            {/* Path de la Función */}
                            <motion.path
                                initial={false}
                                animate={{ d: pathData }}
                                transition={{ type: "tween", duration: 0.2 }}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ filter: 'drop-shadow(0px 4px 6px rgba(99, 102, 241, 0.4))' }}
                            />

                            {/* Hover Indicator */}
                            {hoveredPoint && !isNaN(hoveredPoint.y) && Math.abs(hoveredPoint.y) < 100 && (
                                <g>
                                    <circle
                                        cx={400 + hoveredPoint.x * zoom}
                                        cy={300 - hoveredPoint.y * zoom}
                                        r="6"
                                        fill="#f43f5e"
                                        className="animate-pulse"
                                    />
                                    <rect
                                        x={400 + hoveredPoint.x * zoom + 10}
                                        y={300 - hoveredPoint.y * zoom - 35}
                                        width="100"
                                        height="30"
                                        rx="8"
                                        fill="rgba(15, 23, 42, 0.9)"
                                    />
                                    <text
                                        x={400 + hoveredPoint.x * zoom + 60}
                                        y={300 - hoveredPoint.y * zoom - 15}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="12"
                                        fontFamily="monospace"
                                        fontWeight="bold"
                                    >
                                        ({hoveredPoint.x.toFixed(2)}, {hoveredPoint.y.toFixed(2)})
                                    </text>
                                </g>
                            )}
                        </svg>

                        {/* Marca de agua / Leyenda */}
                        <div className="absolute bottom-6 right-8 flex flex-col items-end opacity-40 pointer-events-none">
                            <div className="flex items-center gap-2 mb-1">
                                <Calculator className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">MathLab 2D</span>
                            </div>
                            <p className="text-[10px] font-medium italic">Laboratorio de Representación Gráfica</p>
                        </div>

                        {/* Floating Info */}
                        <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-none">
                            <div className="bg-white/70 backdrop-blur-sm p-3 rounded-2xl border border-white/50 text-[10px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                Zoom: {zoom}px/unidad
                            </div>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
};

export default LaboratorioFunciones2D;
