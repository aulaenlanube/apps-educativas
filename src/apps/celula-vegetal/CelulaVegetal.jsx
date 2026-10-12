import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Puzzle, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import AppOrientationWarning from '../_shared/AppOrientationWarning';
import InstructionsModal from '../_shared/InstructionsModal';
// Interfaz compartida con La Célula Animal (rediseño 2026 sobre el kit)
import {
    CelShell, CelTopBar, CelMeter, CelScore, CelPin, CelHint, CelDrawer, CelDock,
    CelQuest, CelToast, CelMatch, CelQuizResults, CelHelpContent, lensViewBox,
} from '../celula-animal/CelulaUI';
import { puntosTest, puntosReto, shuffle } from '../celula-animal/celulaScoring';
import PlantCellDiagram from '../celula-animal/cellArt/PlantCellDiagram';

// ===== ORGANELLE DATA =====
const organelleData = [
    {
        id: 'pared-celular',
        name: 'Pared Celular',
        icon: '🧱',
        subtitle: 'PROTECCIÓN Y SOPORTE',
        labelPos: { x: 8, y: 57 },
        description: 'La pared celular es una capa rígida y resistente que recubre la membrana plasmática. Está compuesta principalmente por celulosa y proporciona soporte estructural y protección a la célula vegetal.',
        functions: [
            'Dar forma y rigidez a la célula',
            'Proteger contra daños mecánicos',
            'Evitar que la célula estalle por exceso de agua',
            'Permitir el crecimiento de la planta',
        ],
        structure: 'Estructura rígida formada por fibras de celulosa entrelazadas, hemicelulosa y pectina.',
        funFact: 'La madera de los árboles es básicamente paredes celulares muertas acumuladas. ¡Es lo que hace que los árboles sean tan duros!',
    },
    {
        id: 'membrana',
        name: 'Membrana Plasmática',
        icon: '🛡️',
        subtitle: 'BARRERA SELECTIVA',
        labelPos: { x: 12.5, y: 15 },
        description: 'Situada justo debajo de la pared celular, controla el intercambio de sustancias entre el interior y el exterior de la célula.',
        functions: [
            'Regular el paso de sustancias',
            'Recibir señales del entorno',
            'Mantener el equilibrio interno (homeostasis)',
        ],
        structure: 'Bicapa de fosfolípidos con proteínas incrustadas. En células vegetales está presionada contra la pared celular debido a la vacuola.',
        funFact: 'Aunque la pared celular es rígida, la membrana sigue siendo fluida y dinámica en su interior.',
    },
    {
        id: 'vacuola',
        name: 'Vacuola Central',
        icon: '💧',
        subtitle: 'ALMACÉN Y TURGENCIA',
        labelPos: { x: 57, y: 50 },
        description: 'Una gran bolsa llena de líquido que puede ocupar hasta el 90% del volumen de la célula. Mantiene la presión interna (turgencia) que hace que las plantas se mantengan erguidas.',
        functions: [
            'Almacenar agua, nutrientes y desechos',
            'Mantener la presión de turgencia (rigidez)',
            'Degradar sustancias (función similar a los lisosomas)',
            'Contener pigmentos que dan color a las flores',
        ],
        structure: 'Saco rodeado por una membrana llamada tonoplasto. Contiene jugo celular (agua y solutos).',
        funFact: 'Cuando riegas una planta marchita y se recupera, es porque sus vacuolas se han vuelto a llenar de agua, recuperando la turgencia.',
    },
    {
        id: 'cloroplasto',
        name: 'Cloroplastos',
        icon: '🍃',
        subtitle: 'FOTOSÍNTESIS',
        labelPos: { x: 51, y: 19 },
        description: 'Orgánulos exclusivos de las células vegetales donde ocurre la fotosíntesis. Utilizan la luz solar para convertir agua y dióxido de carbono en azúcares (alimento).',
        functions: [
            'Realizar la fotosíntesis',
            'Producir glucosa y oxígeno a partir de luz solar',
            'Dar el color verde a las plantas (clorofila)',
        ],
        structure: 'Doble membrana. En su interior hay pilas de sacos aplanados llamados tilacoides que contienen clorofila.',
        funFact: 'Los cloroplastos se mueven dentro de la célula para captar mejor la luz del sol, como si fueran pequeños paneles solares inteligentes.',
    },
    {
        id: 'nucleo',
        name: 'Núcleo',
        icon: '🧬',
        subtitle: 'CENTRO DE CONTROL',
        labelPos: { x: 22, y: 32 },
        description: 'Contiene la información genética (ADN) y dirige todas las actividades celulares. En células vegetales adultas, suele estar desplazado hacia un lado por la gran vacuola central.',
        functions: [
            'Almacenar y proteger el ADN',
            'Controlar el funcionamiento celular',
            'Regular la división celular',
        ],
        structure: 'Rodeado por envoltura nuclear con poros. Contiene cromatina y el nucléolo.',
        funFact: 'A diferencia de la célula animal donde suele ser central, aquí el núcleo es el "copiloto" desplazado por la vacuola gigante.',
    },
    {
        id: 'nucleolo',
        name: 'Nucléolo',
        icon: '⚫',
        subtitle: 'FÁBRICA DE RIBOSOMAS',
        labelPos: { x: 26, y: 38.4 },
        description: 'Región densa dentro del núcleo encargada de producir ribosomas.',
        functions: [
            'Sintetizar ARN ribosómico',
            'Ensamblar subunidades de ribosomas',
        ],
        structure: 'Estructura esférica y densa sin membrana dentro del núcleo.',
        funFact: 'Es visible al microscopio como un punto oscuro dentro del núcleo.',
    },
    {
        id: 'mitocondria',
        name: 'Mitocondria',
        icon: '⚡',
        subtitle: 'RESPIRACIÓN CELULAR',
        labelPos: { x: 64.7, y: 18 },
        description: 'Generan la energía necesaria (ATP) para la célula a través de la respiración celular, utilizando los azúcares producidos en los cloroplastos.',
        functions: [
            'Producir energía (ATP)',
            'Realizar la respiración celular',
        ],
        structure: 'Doble membrana, con la interna plegada en crestas. Tienen su propio ADN.',
        funFact: 'Las plantas respiran también de noche gracias a las mitocondrias, consumiendo parte del oxígeno que produjeron de día.',
    },
    {
        id: 'reticulo-rugoso',
        name: 'RER',
        icon: '🏭',
        subtitle: 'SÍNTESIS DE PROTEÍNAS',
        labelPos: { x: 19, y: 48.5 },
        description: 'Red de membranas con ribosomas adheridos, encargada de fabricar y modificar proteínas.',
        functions: [
            'Sintetizar proteínas',
            'Transportar proteínas al aparato de Golgi',
        ],
        structure: 'Sacos aplanados continuos a la envoltura nuclear, cubiertos de ribosomas.',
        funFact: 'Es rugoso porque está "tachonado" de ribosomas, como si tuviera granitos.',
    },
    {
        id: 'reticulo-liso',
        name: 'REL',
        icon: '🧴',
        subtitle: 'SÍNTESIS DE LÍPIDOS',
        labelPos: { x: 23, y: 61 },
        description: 'Red de túbulos sin ribosomas. Fabrica lípidos (grasas) y elimina toxinas.',
        functions: [
            'Sintetizar lípidos para membranas',
            'Detoxificar sustancias',
        ],
        structure: 'Red de túbulos membranosos lisos.',
        funFact: 'Esencial para fabricar los aceites vegetales que almacenan algunas semillas.',
    },
    {
        id: 'golgi',
        name: 'Aparato de Golgi',
        icon: '📦',
        subtitle: 'EMPAQUETADO',
        labelPos: { x: 56, y: 81 },
        description: 'Modifica, empaqueta y distribuye proteínas y lípidos a otros lugares de la célula o para secretarlos al exterior. También fabrica componentes de la pared celular.',
        functions: [
            'Empaquetar moléculas en vesículas',
            'Transportar sustancias a la pared celular',
            'Sintetizar polisacáridos para la pared',
        ],
        structure: 'Pilas de sacos aplanados (dictiosomas).',
        funFact: 'En células vegetales, el Golgi es clave para construir la pared celular durante la división.',
    },
    {
        id: 'ribosoma',
        name: 'Ribosomas',
        icon: '🔵',
        subtitle: 'SÍNTESIS PROTEICA',
        labelPos: { x: 37.5, y: 70 },
        description: 'Pequeñas fábricas de proteínas dispersas por el citoplasma o pegadas al RER.',
        functions: [
            'Leer el ARN mensajero',
            'Unir aminoácidos para formar proteínas',
        ],
        structure: 'Dos subunidades de ARN y proteínas.',
        funFact: 'Son los orgánulos más pequeños y numerosos.',
    },
    {
        id: 'citoplasma',
        name: 'Citoplasma',
        icon: '🌫️',
        subtitle: 'MEDIO INTERNO',
        labelPos: { x: 14, y: 82 },
        description: 'Fluido gelatinoso (citosol) que llena el interior celular. En él flotan los orgánulos y ocurren muchas reacciones químicas.',
        functions: [
            'Albergar los orgánulos',
            'Medio para reacciones metabólicas',
        ],
        structure: 'Solución acuosa con sales, proteínas y nutrientes.',
        funFact: 'En células vegetales, el citoplasma a menudo fluye en corrientes (ciclosis) para mover los cloroplastos hacia la luz.',
    }
];

// Color de cada orgánulo en la interfaz (marcadores, ficha, bandeja). Solo presentación.
const ORG_COLORS = {
    'pared-celular': '#a3e635',
    membrana: '#facc15',
    vacuola: '#22d3ee',
    cloroplasto: '#22c55e',
    nucleo: '#8b5cf6',
    nucleolo: '#c084fc',
    mitocondria: '#f97316',
    'reticulo-rugoso': '#3b82f6',
    'reticulo-liso': '#2dd4bf',
    golgi: '#14b8a6',
    ribosoma: '#60a5fa',
    citoplasma: '#94a3b8',
};

// Encuadre de la lente de la ficha (coordenadas del dibujo 600×500).
const LENS = {
    'pared-celular': { x: 58, y: 250, size: 100 },
    membrana: { x: 82, y: 92, size: 80 },
    vacuola: { x: 338, y: 250, size: 290 },
    cloroplasto: { x: 305, y: 96, size: 96 },
    nucleo: { x: 150, y: 186, size: 135 },
    nucleolo: { x: 157, y: 193, size: 46 },
    mitocondria: { x: 389, y: 92, size: 74 },
    'reticulo-rugoso': { x: 140, y: 232, size: 116 },
    'reticulo-liso': { x: 142, y: 296, size: 100 },
    golgi: { x: 336, y: 402, size: 92 },
    ribosoma: { x: 226, y: 352, size: 60 },
    citoplasma: { x: 110, y: 330, size: 170 },
};

const noop = () => {};

// ===== SVG CELL DIAGRAM (ilustración en celula-animal/cellArt/PlantCellDiagram.jsx) =====
const SVG_W = 600;
const SVG_H = 500;
const CellDiagram = PlantCellDiagram;

// ===== MAIN COMPONENT =====
const CelulaVegetal = ({ onGameComplete }) => {
    const [selectedOrganelle, setSelectedOrganelle] = useState(null);
    const [visitedIds, setVisitedIds] = useState(new Set());
    const [showHelp, setShowHelp] = useState(false);

    const [mode, setMode] = useState('explore');
    const isQuizMode = mode === 'quiz';
    const isMatchMode = mode === 'match';

    // Test: se piden los 12 orgánulos, uno a uno (acierto = encontrarlo a la primera)
    const [quizQueue, setQuizQueue] = useState([]);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizResults, setQuizResults] = useState([]); // [{ id, name, icon, firstTry, misses, seconds }]
    const [quizFeedback, setQuizFeedback] = useState(null);
    const [quizDone, setQuizDone] = useState(null); // { nota, points, seconds } al terminar
    const quizTarget = quizDone ? null : (quizQueue[quizIndex] || null);
    const quizResultsRef = useRef([]);
    const quizBusyRef = useRef(false); // bloquea clics mientras se muestra el aviso
    const quizMissesRef = useRef(0);   // fallos en el orgánulo actual
    const quizStartRef = useRef(0);
    const targetStartRef = useRef(0);
    const quizTimerRef = useRef(null);
    const quizTrackedRef = useRef(false);

    const [matchDifficulty, setMatchDifficulty] = useState(null);
    const [matchPairs, setMatchPairs] = useState([]);
    const [matchFunctions, setMatchFunctions] = useState([]);
    const [matchSelected, setMatchSelected] = useState(null);
    const [matchAnswers, setMatchAnswers] = useState({});
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [testGrade, setTestGrade] = useState(null);
    const [matchOutcome, setMatchOutcome] = useState(null); // { points, seconds } al corregir
    const [lastAssignedPair, setLastAssignedPair] = useState(null);
    const matchStartRef = useRef(0);
    const matchTrackedRef = useRef(false);

    // onGameComplete siempre actual sin rehacer callbacks
    const onGameCompleteRef = useRef(onGameComplete);
    useEffect(() => { onGameCompleteRef.current = onGameComplete; }, [onGameComplete]);
    useEffect(() => () => clearTimeout(quizTimerRef.current), []);

    const [zoom, setZoom] = useState(1);
    const [viewOrigin, setViewOrigin] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const originStart = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ w: 1, h: 1 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) setContainerSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const viewW = SVG_W / zoom;
    const viewH = SVG_H / zoom;
    const svgViewBox = `${viewOrigin.x} ${viewOrigin.y} ${viewW} ${viewH}`;

    const clampOrigin = useCallback((ox, oy, z) => {
        const w = SVG_W / z;
        const h = SVG_H / z;
        const maxX = SVG_W - w;
        const maxY = SVG_H - h;
        return {
            x: Math.max(0, Math.min(maxX, ox)),
            y: Math.max(0, Math.min(maxY, oy)),
        };
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const step = e.deltaY > 0 ? -0.15 : 0.15;
        setZoom(prev => {
            const next = Math.min(4, Math.max(1, prev + step));
            if (next <= 1) {
                setViewOrigin({ x: 0, y: 0 });
                return 1;
            }
            const oldW = SVG_W / prev;
            const oldH = SVG_H / prev;
            const newW = SVG_W / next;
            const newH = SVG_H / next;
            setViewOrigin(o => clampOrigin(
                o.x + (oldW - newW) / 2,
                o.y + (oldH - newH) / 2,
                next
            ));
            return next;
        });
    }, [clampOrigin]);

    const didDrag = useRef(false);

    const handlePointerDown = useCallback((e) => {
        if (zoom <= 1) return;
        if (e.button !== 0) return;
        didDrag.current = false;
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
        originStart.current = { ...viewOrigin };
    }, [zoom, viewOrigin]);

    const handlePointerMove = useCallback((e) => {
        if (!isPanning || !containerRef.current) return;
        const movedX = Math.abs(e.clientX - panStart.current.x);
        const movedY = Math.abs(e.clientY - panStart.current.y);
        if (movedX > 5 || movedY > 5) didDrag.current = true;
        const cw = containerSize.w;
        const ch = containerSize.h;
        const svgAR = viewW / viewH;
        const containerAR = cw / ch;
        const renderW = containerAR > svgAR ? ch * svgAR : cw;
        const renderH = containerAR > svgAR ? ch : cw / svgAR;
        const scaleX = viewW / renderW;
        const scaleY = viewH / renderH;
        const dx = (e.clientX - panStart.current.x) * scaleX;
        const dy = (e.clientY - panStart.current.y) * scaleY;
        setViewOrigin(clampOrigin(
            originStart.current.x - dx,
            originStart.current.y - dy,
            zoom
        ));
    }, [isPanning, zoom, clampOrigin, containerSize, viewW, viewH]);

    const handlePointerUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const resetView = useCallback(() => {
        setZoom(1);
        setViewOrigin({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        const onGlobalUp = () => setIsPanning(false);
        window.addEventListener('pointerup', onGlobalUp);
        return () => {
            el.removeEventListener('wheel', handleWheel);
            window.removeEventListener('pointerup', onGlobalUp);
        };
    }, [handleWheel]);

    // ===== TEST: ENCUENTRA CADA ORGÁNULO =====
    // Fin de la actividad = los 12 orgánulos encontrados. Se registra UNA vez
    // (single_mode: cuenta para la tarea) con nota = aciertos a la primera / 12.
    const completeQuiz = useCallback((results) => {
        const seconds = Math.max(1, Math.round((Date.now() - quizStartRef.current) / 1000));
        const total = results.length;
        const { points, maxScore, firstTry, nota } = puntosTest(results, total);
        if (!quizTrackedRef.current) {
            quizTrackedRef.current = true;
            onGameCompleteRef.current?.({
                mode: 'practice',
                score: points,
                maxScore,
                correctAnswers: firstTry,
                totalQuestions: total,
                durationSeconds: seconds,
                nota,
            });
        }
        quizTimerRef.current = setTimeout(() => {
            setQuizDone({ nota, points, seconds });
            setQuizFeedback(null);
            if (nota >= 5) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899'] });
            }
        }, 1200);
    }, []);

    const handleQuizInteraction = useCallback((id) => {
        if (!quizTarget || quizBusyRef.current) return;
        quizBusyRef.current = true;
        const isCorrect = id === quizTarget.id;
        setQuizFeedback({ id, isCorrect });
        if (!isCorrect) {
            quizMissesRef.current += 1;
            quizTimerRef.current = setTimeout(() => {
                setQuizFeedback(null);
                quizBusyRef.current = false;
            }, 1000);
            return;
        }
        setVisitedIds(prev => new Set(prev).add(id));
        const results = [...quizResultsRef.current, {
            id: quizTarget.id,
            name: quizTarget.name,
            icon: quizTarget.icon,
            firstTry: quizMissesRef.current === 0,
            misses: quizMissesRef.current,
            seconds: (Date.now() - targetStartRef.current) / 1000,
        }];
        quizResultsRef.current = results;
        setQuizResults(results);
        if (results.length >= quizQueue.length) {
            completeQuiz(results);
            return;
        }
        quizTimerRef.current = setTimeout(() => {
            quizMissesRef.current = 0;
            targetStartRef.current = Date.now();
            setQuizIndex(i => i + 1);
            setQuizFeedback(null);
            quizBusyRef.current = false;
        }, 1500);
    }, [quizTarget, quizQueue.length, completeQuiz]);

    const startQuiz = () => {
        clearTimeout(quizTimerRef.current);
        setQuizQueue(shuffle(organelleData));
        setQuizIndex(0);
        setQuizResults([]);
        setQuizDone(null);
        setQuizFeedback(null);
        quizResultsRef.current = [];
        quizBusyRef.current = false;
        quizMissesRef.current = 0;
        quizStartRef.current = Date.now();
        targetStartRef.current = Date.now();
        quizTrackedRef.current = false;
    };

    const handleSelect = useCallback((id) => {
        if (didDrag.current) return;
        if (isQuizMode) {
            handleQuizInteraction(id);
        } else if (isMatchMode) {
            if (!testSubmitted) return;
        } else {
            setSelectedOrganelle(prev => prev === id ? null : id);
            setVisitedIds(prev => new Set(prev).add(id));
        }
    }, [isQuizMode, isMatchMode, testSubmitted, handleQuizInteraction]);

    // Calculate the actual rendered SVG rect inside the container
    // SVG uses preserveAspectRatio="xMidYMid meet" (default), so it letterboxes
    const getSvgContentRect = useCallback(() => {
        const cw = containerSize.w;
        const ch = containerSize.h;
        const svgAR = viewW / viewH;
        const containerAR = cw / ch;
        let renderW, renderH, offsetX, offsetY;
        if (containerAR > svgAR) {
            renderH = ch;
            renderW = ch * svgAR;
            offsetX = (cw - renderW) / 2;
            offsetY = 0;
        } else {
            renderW = cw;
            renderH = cw / svgAR;
            offsetX = 0;
            offsetY = (ch - renderH) / 2;
        }
        return { renderW, renderH, offsetX, offsetY };
    }, [containerSize, viewW, viewH]);

    const isLabelVisible = useCallback((labelPos) => {
        const svgX = (labelPos.x / 100) * SVG_W;
        const svgY = (labelPos.y / 100) * SVG_H;
        const margin = 30;
        return (
            svgX >= viewOrigin.x - margin && svgX <= viewOrigin.x + viewW + margin &&
            svgY >= viewOrigin.y - margin && svgY <= viewOrigin.y + viewH + margin
        );
    }, [viewOrigin, viewW, viewH]);

    // Convert organelle labelPos (%) to pixel position accounting for SVG letterboxing
    const getLabelStyle = useCallback((labelPos) => {
        const svgX = (labelPos.x / 100) * SVG_W;
        const svgY = (labelPos.y / 100) * SVG_H;
        const { renderW, renderH, offsetX, offsetY } = getSvgContentRect();
        const px = offsetX + ((svgX - viewOrigin.x) / viewW) * renderW;
        const py = offsetY + ((svgY - viewOrigin.y) / viewH) * renderH;
        return { left: `${px}px`, top: `${py}px` };
    }, [viewOrigin, viewW, viewH, getSvgContentRect]);

    const switchMode = (newMode) => {
        clearTimeout(quizTimerRef.current);
        setMode(newMode);
        setSelectedOrganelle(null);
        setQuizQueue([]);
        setQuizDone(null);
        setQuizFeedback(null);
        quizBusyRef.current = false;
        setMatchSelected(null);
        setMatchAnswers({});
        setTestSubmitted(false);
        setTestGrade(null);
        setMatchOutcome(null);
        setMatchDifficulty(null);
        setLastAssignedPair(null);
        if (newMode === 'quiz') startQuiz();
    };

    const initMatchGame = (count) => {
        const numPairs = count || matchDifficulty || 6;
        const shuffled = [...organelleData].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, numPairs);
        setMatchPairs(picked);
        const functions = picked.map(org => ({
            id: org.id,
            label: org.functions[0]
        })).sort(() => Math.random() - 0.5);
        setMatchFunctions(functions);
        setMatchAnswers({});
        setTestSubmitted(false);
        setTestGrade(null);
        setMatchOutcome(null);
        setLastAssignedPair(null);
        matchStartRef.current = Date.now();
        matchTrackedRef.current = false;
    };

    const startMatchWithDifficulty = (difficulty) => {
        setMatchDifficulty(difficulty);
        initMatchGame(difficulty);
    };

    const handleMatchOrganelleClick = (orgId) => {
        if (testSubmitted) return;
        setMatchSelected(orgId);
    };

    const handleMatchFunctionClick = (funcItem) => {
        if (!matchSelected || testSubmitted) return;
        setMatchAnswers(prev => ({ ...prev, [matchSelected]: funcItem.id }));
        setLastAssignedPair({ orgId: matchSelected, funcId: funcItem.id });
        setMatchSelected(null);
    };

    const removeMatch = (orgId) => {
        setMatchAnswers(prev => {
            const next = { ...prev };
            delete next[orgId];
            return next;
        });
        setMatchSelected(null);
    };

    // Fin del Reto = corregir. Se registra UNA vez por reto (single_mode: cuenta
    // para la tarea) con nota = parejas correctas / parejas · 10 y puntos paralelos.
    const submitTest = () => {
        if (testSubmitted) return;
        let correct = 0;
        matchPairs.forEach(org => {
            if (matchAnswers[org.id] === org.id) correct++;
        });
        const total = matchPairs.length;
        const seconds = Math.max(1, Math.round((Date.now() - matchStartRef.current) / 1000));
        const { points, maxScore, nota: grade } = puntosReto({ correct, total, durationSeconds: seconds });
        setTestGrade(grade);
        setMatchOutcome({ points, seconds });
        setTestSubmitted(true);
        setMatchSelected(null);
        if (!matchTrackedRef.current) {
            matchTrackedRef.current = true;
            onGameCompleteRef.current?.({
                mode: 'practice',
                score: points,
                maxScore,
                correctAnswers: correct,
                totalQuestions: total,
                durationSeconds: seconds,
                nota: grade,
            });
        }
        if (grade >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899']
            });
        }
    };

    const selectedData = organelleData.find(o => o.id === selectedOrganelle);
    const clickedName = quizFeedback ? organelleData.find(o => o.id === quizFeedback.id)?.name : null;

    return (
        <CelShell variant="vegetal" mode={mode} drawerOpen={!!selectedData}>
            <AppOrientationWarning />

            <CelTopBar
                mode={mode}
                onMode={switchMode}
                onHelp={() => setShowHelp(true)}
                zoomed={zoom > 1.1}
                onResetZoom={resetView}
                stat={
                    mode === 'explore' ? (
                        <CelMeter value={visitedIds.size} max={organelleData.length} label="Explorados" />
                    ) : mode === 'quiz' ? (
                        <>
                            <CelMeter value={quizResults.length} max={quizQueue.length || organelleData.length} label="Encontrados" icon={Crosshair} tone="progress" />
                            <CelScore value={puntosTest(quizResults, quizQueue.length).points} />
                        </>
                    ) : matchDifficulty !== null && !testSubmitted ? (
                        <CelMeter value={Object.keys(matchAnswers).length} max={matchPairs.length} label="Asignadas" icon={Puzzle} tone="progress" />
                    ) : null
                }
            />

            {/* VISOR DE LA CÉLULA (dibujo + marcadores) */}
            <div className="cel-stage">
                <div
                    ref={containerRef}
                    className={`cel-viewport ${selectedOrganelle ? 'has-selection' : ''}`}
                    style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    <CellDiagram
                        selectedId={mode === 'explore' ? selectedOrganelle : (quizFeedback?.id || null)}
                        visitedIds={visitedIds} onSelect={handleSelect}
                        isQuizMode={isQuizMode} quizTargetId={quizTarget?.id}
                        feedbackState={quizFeedback} viewBox={svgViewBox}
                    />

                    {/* Marcadores con nombre (solo en Explorar) */}
                    {mode === 'explore' && organelleData.map(org => {
                        if (!isLabelVisible(org.labelPos)) return null;
                        return (
                            <CelPin
                                key={org.id}
                                style={getLabelStyle(org.labelPos)}
                                name={org.name}
                                color={ORG_COLORS[org.id]}
                                visited={visitedIds.has(org.id)}
                                active={selectedOrganelle === org.id}
                                onClick={() => handleSelect(org.id)}
                            />
                        );
                    })}
                </div>
            </div>

            <CelHint show={mode === 'explore' && !selectedOrganelle}>
                {visitedIds.size >= organelleData.length
                    ? '¡Has explorado todos los orgánulos! Ponte a prueba en Test o Reto para conseguir tu nota'
                    : 'Toca un orgánulo de la célula o de la bandeja para abrir su ficha'}
            </CelHint>

            {/* TEST: orgánulo a encontrar + aviso de acierto/fallo */}
            {isQuizMode && quizTarget && <CelQuest target={quizTarget} index={quizIndex + 1} total={quizQueue.length} />}
            {isQuizMode && <CelToast feedback={quizFeedback} clickedName={clickedName} />}
            {isQuizMode && quizDone && (
                <CelQuizResults
                    nota={quizDone.nota}
                    points={quizDone.points}
                    seconds={quizDone.seconds}
                    results={quizResults}
                    onReplay={startQuiz}
                    onExit={() => switchMode('explore')}
                />
            )}

            {/* FICHA DEL ORGÁNULO (solo en Explorar) */}
            <CelDrawer
                org={selectedData}
                color={selectedData ? ORG_COLORS[selectedData.id] : undefined}
                onClose={() => setSelectedOrganelle(null)}
                lens={selectedData && (
                    <CellDiagram
                        selectedId={null}
                        visitedIds={visitedIds}
                        onSelect={noop}
                        isQuizMode={false}
                        feedbackState={null}
                        viewBox={lensViewBox(selectedData, LENS, SVG_W, SVG_H)}
                    />
                )}
            />

            {/* RETO: relaciona orgánulo y función */}
            {isMatchMode && (
                <CelMatch
                    difficulty={matchDifficulty}
                    onPickDifficulty={startMatchWithDifficulty}
                    pairs={matchPairs}
                    functions={matchFunctions}
                    selected={matchSelected}
                    answers={matchAnswers}
                    submitted={testSubmitted}
                    grade={testGrade}
                    points={matchOutcome?.points}
                    seconds={matchOutcome?.seconds}
                    lastAssigned={lastAssignedPair}
                    canSubmit={Object.keys(matchAnswers).length >= matchPairs.length}
                    onPickOrg={handleMatchOrganelleClick}
                    onPickFunc={handleMatchFunctionClick}
                    onRemove={removeMatch}
                    onSubmit={submitTest}
                    onReplay={() => initMatchGame(matchDifficulty)}
                    onExit={() => switchMode('explore')}
                    colors={ORG_COLORS}
                    onHelp={() => setShowHelp(true)}
                />
            )}

            {/* BANDEJA DE ORGÁNULOS (solo en Explorar) */}
            {mode === 'explore' && (
                <CelDock
                    items={organelleData}
                    colors={ORG_COLORS}
                    selectedId={selectedOrganelle}
                    visitedIds={visitedIds}
                    onSelect={handleSelect}
                />
            )}

            <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo explorar la célula vegetal">
                <CelHelpContent kind="vegetal" />
            </InstructionsModal>
        </CelShell>
    );
};

export default CelulaVegetal;
