import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Puzzle, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import AppOrientationWarning from '../_shared/AppOrientationWarning';
import InstructionsModal from '../_shared/InstructionsModal';
import {
    CelShell, CelTopBar, CelMeter, CelScore, CelPin, CelHint, CelDrawer, CelDock,
    CelQuest, CelToast, CelMatch, CelQuizResults, CelHelpContent, lensViewBox,
} from './CelulaUI';
import { puntosTest, puntosReto, shuffle } from './celulaScoring';
import AnimalCellDiagram from './cellArt/AnimalCellDiagram';

// ===== ORGANELLE DATA =====
const organelleData = [
    {
        id: 'membrana',
        name: 'Membrana Plasmática',
        icon: '🛡️',
        subtitle: 'BARRERA SELECTIVA',
        labelPos: { x: 93, y: 62 },
        description: 'La membrana plasmática es una fina bicapa de fosfolípidos que envuelve toda la célula. Actúa como una barrera selectiva que controla qué sustancias entran y salen de la célula.',
        functions: [
            'Proteger el interior de la célula',
            'Regular el paso de sustancias (permeabilidad selectiva)',
            'Recibir señales del exterior mediante receptores',
            'Mantener la forma celular',
        ],
        structure: 'Está formada por una doble capa de fosfolípidos con proteínas incrustadas que actúan como canales y receptores. También contiene colesterol, que le da flexibilidad.',
        funFact: '¡Si pudieras extender todas las membranas de tus células, cubrirían más de 100 campos de fútbol!',
    },
    {
        id: 'nucleo',
        name: 'Núcleo',
        icon: '🧬',
        subtitle: 'CENTRO DE CONTROL',
        labelPos: { x: 40, y: 48 },
        description: 'El núcleo es el orgánulo más grande de la célula y su centro de control. Contiene el ADN, que es el material genético con las instrucciones para fabricar todas las proteínas que la célula necesita.',
        functions: [
            'Almacenar y proteger el ADN (material genético)',
            'Controlar las actividades de la célula',
            'Regular la expresión de los genes',
            'Coordinar la división celular',
        ],
        structure: 'Rodeado por una doble membrana llamada envoltura nuclear, con poros que permiten el intercambio de sustancias con el citoplasma. En su interior contiene el nucléolo, donde se fabrican los ribosomas.',
        funFact: 'Si estiraras todo el ADN que hay en una sola célula, mediría unos 2 metros de largo. ¡Y tienes billones de células!',
    },
    {
        id: 'nucleolo',
        name: 'Nucléolo',
        icon: '⚫',
        subtitle: 'FÁBRICA DE RIBOSOMAS',
        labelPos: { x: 55, y: 39.2 },
        description: 'El nucléolo es una estructura densa y esférica situada dentro del núcleo. Su función principal es fabricar los componentes de los ribosomas, las "máquinas" que construyen las proteínas.',
        functions: [
            'Producir ARN ribosómico (ARNr)',
            'Ensamblar las subunidades de los ribosomas',
            'Regular el ciclo celular',
        ],
        structure: 'No tiene membrana propia. Es una región densa del núcleo formada por ADN, ARN y proteínas. Puede haber uno o varios nucléolos en un mismo núcleo.',
        funFact: 'Las células que necesitan muchas proteínas, como las del hígado, tienen nucléolos especialmente grandes y activos.',
    },
    {
        id: 'reticulo-rugoso',
        name: 'Retículo Endoplasmático Rugoso',
        icon: '🏭',
        subtitle: 'FÁBRICA DE PROTEÍNAS',
        labelPos: { x: 33, y: 30 },
        description: 'El retículo endoplasmático rugoso (RER) es un sistema de membranas plegadas conectadas al núcleo. Se llama "rugoso" porque tiene ribosomas pegados a su superficie, que le dan un aspecto granulado.',
        functions: [
            'Sintetizar (fabricar) proteínas',
            'Plegar y modificar proteínas recién creadas',
            'Transportar proteínas en vesículas al aparato de Golgi',
            'Fabricar las membranas de la célula',
        ],
        structure: 'Sistema de sacos aplanados (cisternas) con ribosomas adheridos a su cara externa. Está conectado directamente con la envoltura nuclear.',
        funFact: 'Las células del páncreas tienen un RER enorme porque fabrican grandes cantidades de enzimas digestivas que envían al intestino.',
    },
    {
        id: 'reticulo-liso',
        name: 'Retículo Endoplasmático Liso',
        icon: '🧴',
        subtitle: 'FÁBRICA DE LÍPIDOS',
        labelPos: { x: 30.3, y: 59.6 },
        description: 'El retículo endoplasmático liso (REL) es similar al rugoso pero sin ribosomas en su superficie. Se especializa en la síntesis de lípidos y en la detoxificación de sustancias.',
        functions: [
            'Sintetizar lípidos (grasas) y hormonas esteroideas',
            'Detoxificar sustancias nocivas',
            'Almacenar y liberar calcio',
            'Metabolizar los carbohidratos',
        ],
        structure: 'Red de túbulos y sacos membranosos sin ribosomas. Tiene un aspecto más tubular que el RER.',
        funFact: 'En las células del hígado, el REL es muy abundante porque se encarga de eliminar toxinas del cuerpo, incluyendo medicamentos.',
    },
    {
        id: 'mitocondria',
        name: 'Mitocondria',
        icon: '⚡',
        subtitle: 'CENTRAL ENERGÉTICA',
        labelPos: { x: 72, y: 70 },
        description: 'Las mitocondrias son las "centrales energéticas" de la célula. Mediante la respiración celular, convierten los nutrientes (glucosa) en energía utilizable en forma de ATP.',
        functions: [
            'Producir ATP (la moneda energética de la célula)',
            'Realizar la respiración celular aeróbica',
            'Regular la muerte celular programada (apoptosis)',
            'Generar calor corporal',
        ],
        structure: 'Tiene doble membrana: la externa es lisa y la interna forma pliegues llamados crestas mitocondriales, que aumentan la superficie para producir más energía. Contiene su propio ADN circular.',
        funFact: '¡Las mitocondrias tienen su propio ADN! Se cree que hace millones de años fueron bacterias independientes que se incorporaron a las células. El ADN mitocondrial siempre se hereda de la madre.',
    },
    {
        id: 'golgi',
        name: 'Aparato de Golgi',
        icon: '📦',
        subtitle: 'EMPAQUETADO Y DISTRIBUCIÓN',
        labelPos: { x: 74.7, y: 33.6 },
        description: 'El aparato de Golgi es la "oficina de correos" de la célula. Recibe proteínas y lípidos, los modifica, empaqueta y envía a su destino correcto dentro o fuera de la célula.',
        functions: [
            'Modificar y madurar proteínas (glicosilación)',
            'Clasificar y empaquetar moléculas en vesículas',
            'Distribuir sustancias a su destino final',
            'Fabricar lisosomas',
        ],
        structure: 'Formado por pilas de sacos aplanados llamados dictiosomas. Tiene una cara cis (de entrada, cercana al RER) y una cara trans (de salida, hacia la membrana).',
        funFact: 'Fue descubierto en 1898 por el científico italiano Camillo Golgi. Sin él, tus células no podrían "enviar paquetes" a donde se necesitan.',
    },
    {
        id: 'lisosoma',
        name: 'Lisosoma',
        icon: '🧹',
        subtitle: 'SISTEMA DIGESTIVO CELULAR',
        labelPos: { x: 81.7, y: 49.4 },
        description: 'Los lisosomas son vesículas esféricas que contienen enzimas digestivas muy potentes. Son el "sistema digestivo" de la célula, capaces de descomponer todo tipo de moléculas.',
        functions: [
            'Digerir sustancias que la célula incorpora del exterior',
            'Reciclar orgánulos viejos o dañados (autofagia)',
            'Eliminar bacterias y virus que invaden la célula',
            'Participar en la muerte celular programada',
        ],
        structure: 'Vesículas esféricas rodeadas de una membrana simple que contiene unas 50 enzimas hidrolíticas diferentes. Mantienen un pH ácido (alrededor de 5) en su interior.',
        funFact: 'Si un lisosoma se rompe, sus enzimas pueden digerir a la propia célula. Por eso se les conoce como "bolsas suicidas".',
    },
    {
        id: 'ribosoma',
        name: 'Ribosomas',
        icon: '🔵',
        subtitle: 'CONSTRUCTORES DE PROTEÍNAS',
        labelPos: { x: 45, y: 66 },
        description: 'Los ribosomas son pequeñas estructuras que leen las instrucciones del ARN mensajero para ensamblar aminoácidos y construir proteínas. Son las "impresoras 3D" de la célula.',
        functions: [
            'Traducir el ARN mensajero en proteínas',
            'Ensamblar cadenas de aminoácidos',
            'Trabajar tanto libres en el citoplasma como unidos al RER',
        ],
        structure: 'Compuestos por dos subunidades (mayor y menor) formadas por ARN ribosómico y proteínas. Son muy pequeños (20-30 nm) y no están rodeados de membrana.',
        funFact: 'Una célula humana puede contener entre 1 y 10 millones de ribosomas. ¡Son las estructuras más numerosas después de las moléculas!',
    },
    {
        id: 'centrosoma',
        name: 'Centrosoma',
        icon: '✳️',
        subtitle: 'ORGANIZADOR DE DIVISIÓN',
        labelPos: { x: 62, y: 63.6 },
        description: 'El centrosoma es una estructura formada por dos centriolos perpendiculares entre sí. Es esencial durante la división celular, ya que organiza el huso mitótico que separa los cromosomas.',
        functions: [
            'Organizar los microtúbulos del citoesqueleto',
            'Formar el huso mitótico durante la división celular',
            'Participar en la formación de cilios y flagelos',
        ],
        structure: 'Formado por dos centriolos cilíndricos perpendiculares, cada uno compuesto por 9 tripletes de microtúbulos. Rodeado por material pericentriolar.',
        funFact: 'Los centrosomas son exclusivos de las células animales. Las células vegetales se dividen sin ellos, usando otro mecanismo.',
    },
    {
        id: 'citoesqueleto',
        name: 'Citoesqueleto',
        icon: '🦴',
        subtitle: 'ESQUELETO INTERNO',
        labelPos: { x: 18.3, y: 45.2 },
        description: 'El citoesqueleto es una red de filamentos proteicos que recorre todo el citoplasma. Le da forma a la célula, permite el movimiento y actúa como un sistema de "carreteras" internas.',
        functions: [
            'Mantener la forma de la célula',
            'Permitir el movimiento celular y la contracción',
            'Transportar orgánulos y vesículas por el interior',
            'Anclar los orgánulos en su posición correcta',
        ],
        structure: 'Formado por tres tipos de filamentos: microfilamentos de actina (los más finos), filamentos intermedios y microtúbulos (los más gruesos, formados por tubulina).',
        funFact: 'Los microtúbulos del citoesqueleto actúan como "autopistas" por las que las proteínas motoras (kinesina y dineína) transportan carga como pequeños camiones.',
    },
    {
        id: 'citoplasma',
        name: 'Citoplasma',
        icon: '💧',
        subtitle: 'MEDIO INTERNO',
        labelPos: { x: 55, y: 87 },
        description: 'El citoplasma es todo el contenido celular que se encuentra entre la membrana plasmática y el núcleo. Es un medio acuoso y gelatinoso donde flotan todos los orgánulos y se realizan muchas reacciones químicas.',
        functions: [
            'Albergar y sostener todos los orgánulos',
            'Servir como medio para reacciones metabólicas',
            'Almacenar sustancias como glucógeno y lípidos',
            'Facilitar el transporte de moléculas entre orgánulos',
        ],
        structure: 'Compuesto principalmente por citosol (agua con sales, proteínas y otras moléculas disueltas), orgánulos e inclusiones citoplasmáticas.',
        funFact: 'El citoplasma representa más del 50% del volumen de la célula. Es como una "sopa" muy organizada donde todo sucede.',
    },
];

// Color de cada orgánulo en la interfaz (marcadores, ficha, bandeja). Solo presentación.
const ORG_COLORS = {
    membrana: '#4ade80',
    nucleo: '#8b5cf6',
    nucleolo: '#c084fc',
    'reticulo-rugoso': '#3b82f6',
    'reticulo-liso': '#2dd4bf',
    mitocondria: '#f59e0b',
    golgi: '#14b8a6',
    lisosoma: '#f43f5e',
    ribosoma: '#60a5fa',
    centrosoma: '#d946ef',
    citoesqueleto: '#86efac',
    citoplasma: '#34d399',
};

// Encuadre de la lente de la ficha (coordenadas del dibujo 600×500).
const LENS = {
    membrana: { x: 560, y: 292, size: 120 },
    nucleo: { x: 300, y: 215, size: 220 },
    nucleolo: { x: 330, y: 196, size: 64 },
    'reticulo-rugoso': { x: 200, y: 178, size: 140 },
    'reticulo-liso': { x: 168, y: 336, size: 140 },
    mitocondria: { x: 434, y: 352, size: 125 },
    golgi: { x: 450, y: 168, size: 120 },
    lisosoma: { x: 496, y: 262, size: 86 },
    ribosoma: { x: 274, y: 334, size: 64 },
    centrosoma: { x: 372, y: 316, size: 70 },
    citoesqueleto: { x: 140, y: 245, size: 170 },
    citoplasma: { x: 290, y: 400, size: 200 },
};

const noop = () => {};

// ===== SVG CELL DIAGRAM (ilustración en cellArt/AnimalCellDiagram.jsx) =====
const SVG_W = 600;
const SVG_H = 500;
const CellDiagram = AnimalCellDiagram;

// ===== MAIN COMPONENT =====
const CelulaAnimal = ({ onGameComplete }) => {
    const [selectedOrganelle, setSelectedOrganelle] = useState(null);
    const [visitedIds, setVisitedIds] = useState(new Set());
    const [showHelp, setShowHelp] = useState(false);

    // Quiz State
    // Mode: 'explore' | 'quiz' | 'match'
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

    // Reto (match) mode state
    const [matchDifficulty, setMatchDifficulty] = useState(null); // 6 | 9 | 12, null = show picker
    const [matchPairs, setMatchPairs] = useState([]);
    const [matchFunctions, setMatchFunctions] = useState([]);
    const [matchSelected, setMatchSelected] = useState(null); // organelle id being assigned
    const [matchAnswers, setMatchAnswers] = useState({}); // {orgId: funcId} — student's answers
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [testGrade, setTestGrade] = useState(null); // 0-10
    const [matchOutcome, setMatchOutcome] = useState(null); // { points, seconds } al corregir
    const [lastAssignedPair, setLastAssignedPair] = useState(null); // {orgId, funcId}
    const matchStartRef = useRef(0);
    const matchTrackedRef = useRef(false);

    // onGameComplete siempre actual sin rehacer callbacks
    const onGameCompleteRef = useRef(onGameComplete);
    useEffect(() => { onGameCompleteRef.current = onGameComplete; }, [onGameComplete]);
    useEffect(() => () => clearTimeout(quizTimerRef.current), []);

    // ViewBox-based Zoom & Pan
    const [zoom, setZoom] = useState(1);
    const [viewOrigin, setViewOrigin] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const originStart = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ w: 1, h: 1 });

    // Track container dimensions for proper label positioning
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

    // Compute SVG viewBox from zoom & origin
    const viewW = SVG_W / zoom;
    const viewH = SVG_H / zoom;
    const svgViewBox = `${viewOrigin.x} ${viewOrigin.y} ${viewW} ${viewH}`;

    // Clamp the origin so we don't pan outside the cell
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
            // Zoom towards center of current view
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
        // Use rendered SVG area (not raw container) for accurate pan scaling
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

    // Attach non-passive wheel listener + global pointerup for pan safety
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

    // Calculate the actual rendered SVG rect inside the container
    // SVG uses preserveAspectRatio="xMidYMid meet" (default), so it letterboxes
    const getSvgContentRect = useCallback(() => {
        const cw = containerSize.w;
        const ch = containerSize.h;
        const svgAR = viewW / viewH;
        const containerAR = cw / ch;
        let renderW, renderH, offsetX, offsetY;
        if (containerAR > svgAR) {
            // Container is wider → SVG fills height, centered horizontally
            renderH = ch;
            renderW = ch * svgAR;
            offsetX = (cw - renderW) / 2;
            offsetY = 0;
        } else {
            // Container is taller → SVG fills width, centered vertically
            renderW = cw;
            renderH = cw / svgAR;
            offsetX = 0;
            offsetY = (ch - renderH) / 2;
        }
        return { renderW, renderH, offsetX, offsetY };
    }, [containerSize, viewW, viewH]);

    // Convert organelle labelPos (%) to pixel position accounting for SVG letterboxing
    const getLabelStyle = useCallback((labelPos) => {
        const svgX = (labelPos.x / 100) * SVG_W;
        const svgY = (labelPos.y / 100) * SVG_H;
        const { renderW, renderH, offsetX, offsetY } = getSvgContentRect();
        // Map SVG coordinate to pixel within the rendered SVG area
        const px = offsetX + ((svgX - viewOrigin.x) / viewW) * renderW;
        const py = offsetY + ((svgY - viewOrigin.y) / viewH) * renderH;
        return { left: `${px}px`, top: `${py}px` };
    }, [viewOrigin, viewW, viewH, getSvgContentRect]);

    // Check if a label is within the visible viewBox
    const isLabelVisible = useCallback((labelPos) => {
        const svgX = (labelPos.x / 100) * SVG_W;
        const svgY = (labelPos.y / 100) * SVG_H;
        const margin = 30;
        return (
            svgX >= viewOrigin.x - margin && svgX <= viewOrigin.x + viewW + margin &&
            svgY >= viewOrigin.y - margin && svgY <= viewOrigin.y + viewH + margin
        );
    }, [viewOrigin, viewW, viewH]);


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

    const handleQuizInteraction = useCallback((clickedId) => {
        if (!quizTarget || quizBusyRef.current) return;
        quizBusyRef.current = true;
        const isCorrect = clickedId === quizTarget.id;
        setQuizFeedback({ isCorrect, id: clickedId });
        if (!isCorrect) {
            quizMissesRef.current += 1;
            quizTimerRef.current = setTimeout(() => {
                setQuizFeedback(null);
                quizBusyRef.current = false;
            }, 1000);
            return;
        }
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
        // If we were dragging (panning), don't select
        if (didDrag.current) return;
        if (isQuizMode) {
            handleQuizInteraction(id);
        } else if (!isMatchMode) {
            setSelectedOrganelle(prev => prev === id ? null : id);
            setVisitedIds(prev => {
                const next = new Set(prev);
                next.add(id);
                return next;
            });
        }
    }, [isQuizMode, isMatchMode, handleQuizInteraction]);

    const handleClose = useCallback(() => {
        setSelectedOrganelle(null);
    }, []);

    const selectedData = useMemo(() => {
        return organelleData.find(o => o.id === selectedOrganelle);
    }, [selectedOrganelle]);

    // ===== MODE SWITCHING =====
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
        if (newMode === 'quiz') startQuiz();
        // match mode: don't auto-start, show difficulty picker (matchDifficulty === null)
    };

    // ===== RETO (MATCH) LOGIC =====
    const startMatchWithDifficulty = (count) => {
        setMatchDifficulty(count);
        initMatchGame(count);
    };

    const initMatchGame = (count) => {
        const numPairs = count || matchDifficulty || 6;
        const shuffled = [...organelleData].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, numPairs);
        setMatchPairs(picked);
        const funcs = picked.map(org => ({
            id: org.id,
            label: org.subtitle,
        })).sort(() => Math.random() - 0.5);
        setMatchFunctions(funcs);
        setMatchSelected(null);
        setMatchAnswers({});
        setTestSubmitted(false);
        setTestGrade(null);
        setMatchOutcome(null);
        matchStartRef.current = Date.now();
        matchTrackedRef.current = false;
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

    const allAnswered = matchPairs.length > 0 && Object.keys(matchAnswers).length === matchPairs.length;

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

    const clickedName = quizFeedback ? organelleData.find(o => o.id === quizFeedback.id)?.name : null;

    return (
        <CelShell variant="animal" mode={mode} drawerOpen={!!selectedData}>
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
                    style={{
                        cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <CellDiagram
                        selectedId={selectedOrganelle}
                        visitedIds={visitedIds}
                        onSelect={handleSelect}
                        isQuizMode={isQuizMode}
                        quizTargetId={quizTarget?.id}
                        feedbackState={quizFeedback}
                        viewBox={svgViewBox}
                    />

                    {/* Marcadores con nombre: mantienen su tamaño al hacer zoom */}
                    {organelleData.map(org => {
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
                onClose={handleClose}
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
                    canSubmit={allAnswered}
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

            <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo explorar la célula animal">
                <CelHelpContent kind="animal" />
            </InstructionsModal>
        </CelShell>
    );
};

export default CelulaAnimal;
