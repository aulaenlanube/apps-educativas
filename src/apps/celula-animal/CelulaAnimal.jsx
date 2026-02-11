import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, Lightbulb, Activity, Box, Target } from 'lucide-react';
import './CelulaAnimal.css';

// ===== ORGANELLE DATA =====
const organelleData = [
    {
        id: 'membrana',
        name: 'Membrana Plasmática',
        icon: '🛡️',
        subtitle: 'BARRERA SELECTIVA',
        labelPos: { x: 92, y: 50 },
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
        labelPos: { x: 50, y: 42 },
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
        labelPos: { x: 50, y: 36 },
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
        labelPos: { x: 28, y: 60 },
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
        labelPos: { x: 65, y: 30 },
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
        labelPos: { x: 78, y: 38 },
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
        labelPos: { x: 40, y: 48 },
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
        labelPos: { x: 55, y: 55 },
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
        labelPos: { x: 18, y: 45 },
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
        labelPos: { x: 40, y: 72 },
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

// ===== SVG CELL DIAGRAM COMPONENT =====
const CellDiagram = ({ selectedId, visitedIds, onSelect, isQuizMode, quizTargetId, feedbackState }) => {
    // Utility for quiz highlighting
    const getRegionClass = (id) => {
        if (!isQuizMode) return selectedId === id ? 'active' : '';
        // In quiz mode, only highlight on feedback
        if (feedbackState && feedbackState.id === id) {
            return feedbackState.isCorrect ? 'correct' : 'incorrect';
        }
        return '';
    };

    return (
        <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="cytoplasmGrad" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#1a3a2a" />
                    <stop offset="60%" stopColor="#122a1e" />
                    <stop offset="100%" stopColor="#0d1f15" />
                </radialGradient>
                <radialGradient id="nucleusGrad" cx="45%" cy="45%">
                    <stop offset="0%" stopColor="#2d1b5e" />
                    <stop offset="70%" stopColor="#1a0f3d" />
                    <stop offset="100%" stopColor="#120b2a" />
                </radialGradient>
                <radialGradient id="nucleolusGrad" cx="40%" cy="40%">
                    <stop offset="0%" stopColor="#4a2080" />
                    <stop offset="100%" stopColor="#2a1050" />
                </radialGradient>
                <linearGradient id="mitoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="golgiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0e7490" />
                    <stop offset="100%" stopColor="#155e75" />
                </linearGradient>
                <linearGradient id="rerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#1e3a5f" />
                </linearGradient>
                <linearGradient id="relGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* === 1. CELL MEMBRANE (Bottom-most, stroke only) === */}
            <g className={`organelle-region ${getRegionClass('membrana')}`}
                onClick={() => onSelect('membrana')}
                pointerEvents="visiblePainted">
                <ellipse cx="300" cy="250" rx="275" ry="220"
                    fill="transparent" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="12" />
                <ellipse cx="300" cy="250" rx="272" ry="217"
                    fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.6" />
                <ellipse cx="300" cy="250" rx="267" ry="212"
                    fill="none" stroke="#15803d" strokeWidth="2" opacity="0.4" />
            </g>

            {/* === 2. CYTOPLASM === */}
            <g className={`organelle-region ${getRegionClass('citoplasma')}`}
                onClick={() => onSelect('citoplasma')}>
                <ellipse cx="300" cy="250" rx="264" ry="209" fill="url(#cytoplasmGrad)" />
            </g>

            {/* === 3. CITOESQUELETO === */}
            <g className={`organelle-region ${getRegionClass('citoesqueleto')}`}
                onClick={() => onSelect('citoesqueleto')} opacity="0.25">
                {/* Increase click area with invisible lines */}
                <line x1="80" y1="200" x2="200" y2="300" stroke="transparent" strokeWidth="15" />
                <line x1="80" y1="200" x2="200" y2="300" stroke="#86efac" strokeWidth="1" strokeDasharray="5,4" />
                <line x1="100" y1="350" x2="250" y2="180" stroke="#86efac" strokeWidth="1" strokeDasharray="5,4" />
                <line x1="400" y1="150" x2="500" y2="350" stroke="#86efac" strokeWidth="1" strokeDasharray="5,4" />
                <line x1="150" y1="150" x2="450" y2="400" stroke="#86efac" strokeWidth="0.7" strokeDasharray="8,6" />
            </g>

            {/* === 4. NUCLEUS === */}
            <g className={`organelle-region ${getRegionClass('nucleo')}`}
                onClick={() => onSelect('nucleo')}>
                <ellipse cx="310" cy="220" rx="95" ry="80"
                    fill="url(#nucleusGrad)" stroke="#7c3aed" strokeWidth="3" opacity="0.9" />
                <path d="M260,200 Q280,190 290,210 Q300,230 320,215 Q340,200 350,220"
                    fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.3" strokeDasharray="4,3" />
            </g>

            {/* === 5. NUCLEOLUS (Inside/On top of Nucleus) === */}
            <g className={`organelle-region ${getRegionClass('nucleolo')}`}
                onClick={() => onSelect('nucleolo')}>
                <circle cx="305" cy="210" r="22" fill="url(#nucleolusGrad)" stroke="#7c3aed" strokeWidth="1.5" opacity="0.9" />
                <circle cx="300" cy="205" r="6" fill="#a855f7" opacity="0.3" />
            </g>

            {/* === 6. RET. ENDOPLASMÁTICO LISO === */}
            <g className={`organelle-region ${getRegionClass('reticulo-liso')}`}
                onClick={() => onSelect('reticulo-liso')}>
                {/* Invisible wide hit area */}
                <path d="M100,310 Q120,290 140,310 Q160,330 180,310 Q200,290 220,310"
                    fill="none" stroke="transparent" strokeWidth="20" />
                <path d="M100,310 Q120,290 140,310 Q160,330 180,310 Q200,290 220,310"
                    fill="none" stroke="url(#relGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
                <path d="M110,335 Q130,315 150,335 Q170,355 190,335"
                    fill="none" stroke="url(#relGrad)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
            </g>

            {/* === 7. RET. ENDOPLASMÁTICO RUGOSO === */}
            <g className={`organelle-region ${getRegionClass('reticulo-rugoso')}`}
                onClick={() => onSelect('reticulo-rugoso')}>
                {/* Invisible wide hit area */}
                <path d="M170,150 Q190,130 210,150 Q230,170 250,155"
                    fill="none" stroke="transparent" strokeWidth="20" />
                <path d="M170,150 Q190,130 210,150 Q230,170 250,155"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                <path d="M160,175 Q185,155 210,175 Q235,195 260,175"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
            </g>

            {/* === 8. APARATO DE GOLGI === */}
            <g className={`organelle-region ${getRegionClass('golgi')}`}
                onClick={() => onSelect('golgi')}>
                <path d="M395,145 Q420,135 445,145 Q465,155 480,148"
                    fill="none" stroke="transparent" strokeWidth="30" />
                {[0, 12, 24, 36].map((offset, i) => (
                    <path key={i}
                        d={`M395,${145 + offset} Q420,${135 + offset} 445,${145 + offset} Q465,${155 + offset} 480,${148 + offset}`}
                        fill="none" stroke="url(#golgiGrad)" strokeWidth="6" strokeLinecap="round"
                        opacity={0.8 - i * 0.12} />
                ))}
            </g>

            {/* === 9. MITOCONDRIAS === */}
            <g className={`organelle-region ${getRegionClass('mitocondria')}`}
                onClick={() => onSelect('mitocondria')}>
                {/* Mito 1 */}
                <ellipse cx="430" cy="350" rx="55" ry="25" fill="transparent" transform="rotate(-20, 430, 350)" />
                <ellipse cx="430" cy="350" rx="50" ry="22"
                    fill="url(#mitoGrad)" stroke="#d97706" strokeWidth="2" opacity="0.85"
                    transform="rotate(-20, 430, 350)" />
                {/* Mito 2 */}
                <ellipse cx="180" cy="410" rx="40" ry="20" fill="transparent" transform="rotate(15, 180, 410)" />
                <ellipse cx="180" cy="410" rx="35" ry="16"
                    fill="url(#mitoGrad)" stroke="#d97706" strokeWidth="1.5" opacity="0.7"
                    transform="rotate(15, 180, 410)" />
            </g>

            {/* === 10. LISOSOMAS (Small) === */}
            <g className={`organelle-region ${getRegionClass('lisosoma')}`}
                onClick={() => onSelect('lisosoma')}>
                {/* Larger invisible hit area */}
                <circle cx="475" cy="230" r="22" fill="transparent" />
                <circle cx="475" cy="230" r="14" fill="#dc2626" opacity="0.6" stroke="#ef4444" strokeWidth="1.5" />
                <circle cx="510" cy="270" r="18" fill="transparent" />
                <circle cx="510" cy="270" r="10" fill="#dc2626" opacity="0.5" stroke="#ef4444" strokeWidth="1" />
            </g>

            {/* === 11. CENTROSOMA (Small) === */}
            <g className={`organelle-region ${getRegionClass('centrosoma')}`}
                onClick={() => onSelect('centrosoma')}>
                <circle cx="352" cy="294" r="30" fill="transparent" />
                <rect x="340" y="290" width="20" height="8" rx="2"
                    fill="#e879f9" opacity="0.7" stroke="#a855f7" strokeWidth="1" />
                <rect x="348" y="282" width="8" height="20" rx="2"
                    fill="#e879f9" opacity="0.6" stroke="#a855f7" strokeWidth="1" />
            </g>

            {/* === 12. RIBOSOMAS (Smallest - On Top) === */}
            <g className={`organelle-region ${getRegionClass('ribosoma')}`}
                onClick={() => onSelect('ribosoma')}>
                {[[140, 250], [160, 270], [350, 320], [370, 300], [320, 380], [290, 370], [250, 330], [130, 380], [450, 290], [380, 400], [330, 410], [500, 310]].map(([x, y], i) => (
                    <g key={i}>
                        {/* Much larger hit area for small dots */}
                        <circle cx={x} cy={y} r="12" fill="transparent" />
                        <circle cx={x} cy={y} r="3" fill="#60a5fa" opacity="0.8" filter="url(#softGlow)" />
                    </g>
                ))}
            </g>

            {/* Extra: Vesicle animation dots */}
            <circle r="3" fill="#22d3ee" opacity="0.5" pointerEvents="none">
                <animateMotion dur="6s" repeatCount="indefinite"
                    path="M400,175 Q420,200 475,230" />
            </circle>
            {/* Additional animations */}
        </svg>
    );
};

// ===== MAIN COMPONENT =====
const CelulaAnimal = () => {
    const navigate = useNavigate();
    const [selectedOrganelle, setSelectedOrganelle] = useState(null);
    const [visitedIds, setVisitedIds] = useState(new Set());

    // Quiz State
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [quizTarget, setQuizTarget] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFeedback, setQuizFeedback] = useState(null); // { isCorrect: boolean, id: string }

    const handleSelect = useCallback((id) => {
        if (isQuizMode) {
            handleQuizInteraction(id);
        } else {
            setSelectedOrganelle(prev => prev === id ? null : id);
            setVisitedIds(prev => {
                const next = new Set(prev);
                next.add(id);
                return next;
            });
        }
    }, [isQuizMode, quizTarget]); // Added quizTarget dependency

    const handleClose = useCallback(() => {
        setSelectedOrganelle(null);
    }, []);

    const selectedData = useMemo(() => {
        return organelleData.find(o => o.id === selectedOrganelle);
    }, [selectedOrganelle]);

    // Quiz Logic
    const startQuiz = () => {
        setIsQuizMode(true);
        setSelectedOrganelle(null);
        setQuizScore(0);
        pickNextQuizTarget();
    };

    const stopQuiz = () => {
        setIsQuizMode(false);
        setQuizTarget(null);
        setQuizFeedback(null);
    };

    const pickNextQuizTarget = () => {
        const random = organelleData[Math.floor(Math.random() * organelleData.length)];
        setQuizTarget(random);
        setQuizFeedback(null);
    };

    const handleQuizInteraction = (clickedId) => {
        if (!quizTarget || quizFeedback) return; // Prevent double clicks during feedback

        const isCorrect = clickedId === quizTarget.id;

        setQuizFeedback({ isCorrect, id: clickedId });

        if (isCorrect) {
            setQuizScore(prev => prev + 1);
            // Wait then next question
            setTimeout(() => {
                pickNextQuizTarget();
            }, 1500);
        } else {
            // Wait then clear feedback for retry
            setTimeout(() => {
                setQuizFeedback(null);
            }, 1000);
        }
    };

    const progressPercent = (visitedIds.size / organelleData.length) * 100;

    return (
        <div className={`celula-app ${isQuizMode ? 'quiz-mode' : ''}`}>
            {/* HEADER */}
            <header className="celula-header">
                <div className="celula-header-left">
                    {/* El botón de volver lo proporciona AppRunnerPage en el nivel superior */}
                </div>

                {/* Mode Switcher */}
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${!isQuizMode ? 'active' : ''}`}
                        onClick={stopQuiz}
                    >
                        Explorar
                    </button>
                    <button
                        className={`mode-btn ${isQuizMode ? 'active quiz-mode-active' : ''}`}
                        onClick={startQuiz}
                    >
                        Reto
                    </button>
                </div>

                {!isQuizMode ? (
                    <div className="celula-progress">
                        <span className="progress-text">
                            {visitedIds.size}/{organelleData.length} explorados
                        </span>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                ) : (
                    <div className="quiz-hud">
                        <div className="quiz-score">Puntos: {quizScore}</div>
                    </div>
                )}
            </header>

            {/* FULL-SCREEN DIAGRAM */}
            <div className="celula-fullscreen">
                <div className={`celula-svg-container ${selectedOrganelle ? 'has-selection' : ''}`}>
                    <CellDiagram
                        selectedId={selectedOrganelle}
                        visitedIds={visitedIds}
                        onSelect={handleSelect}
                        isQuizMode={isQuizMode}
                        quizTargetId={quizTarget?.id}
                        feedbackState={quizFeedback}
                    />

                    {/* Overlay label markers (Hidden in Quiz Mode via CSS) */}
                    {organelleData.map(org => (
                        <div
                            key={org.id}
                            className={`organelle-label-marker ${selectedOrganelle === org.id ? 'active-marker' : ''}`}
                            style={{ left: `${org.labelPos.x}%`, top: `${org.labelPos.y}%` }}
                        >
                            <div
                                className={`organelle-dot ${visitedIds.has(org.id) ? 'visited' : ''} ${selectedOrganelle === org.id ? 'active' : ''}`}
                                onClick={() => handleSelect(org.id)}
                            />
                            <span
                                className="organelle-name-tag"
                                onClick={() => handleSelect(org.id)}
                            >
                                {org.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* QUIZ UI OVERLAYS */}
            {isQuizMode && quizTarget && (
                <div className="quiz-target-box">
                    <div className="quiz-target-icon">
                        <Target size={20} />
                    </div>
                    <div className="quiz-target-content">
                        <span className="quiz-instruction">ENCUENTRA:</span>
                        <span className="quiz-target-name">{quizTarget.name}</span>
                    </div>
                </div>
            )}

            {isQuizMode && quizFeedback && (
                <div className="quiz-feedback-overlay">
                    <div className={`feedback-message ${quizFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                        {quizFeedback.isCorrect ? '¡CORRECTO!' : '¡INTÉNTALO DE NUEVO!'}
                    </div>
                </div>
            )}

            {/* EXPLORE MODE: EMPTY STATE HINT */}
            {!isQuizMode && !selectedOrganelle && (
                <div className="panel-empty-state">
                    <div className="pulse-dot"></div>
                    <span className="panel-empty-hint">
                        Selecciona un orgánulo para ver sus detalles
                    </span>
                </div>
            )}

            {/* INFO PANEL OVERLAY (Only in Explore Mode) */}
            <div className={`celula-info-overlay ${selectedData ? 'open' : ''}`}>
                {selectedData && (
                    <div className="celula-info-card" key={selectedData.id}>
                        {/* Improved Close Button */}
                        <button className="floating-close-btn" onClick={handleClose} title="Cerrar panel">
                            <X size={18} />
                        </button>

                        <div className="organelle-detail">
                            <div className="detail-header">
                                <div className="detail-header-top">
                                    <div className="detail-title-group">
                                        <div className="detail-icon-wrapper">
                                            <span className="detail-icon">{selectedData.icon}</span>
                                        </div>
                                        <div className="detail-title-stack">
                                            <h2 className="detail-title">{selectedData.name}</h2>
                                            <div className="detail-subtitle">{selectedData.subtitle}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-body">
                                <div className="detail-description-card">
                                    <Info className="description-icon" size={16} />
                                    <p className="detail-description">{selectedData.description}</p>
                                </div>

                                <div className="detail-grid">
                                    <div className="detail-section">
                                        <h3 className="detail-section-title">
                                            <Activity size={14} className="section-icon" />
                                            <span>Funciones</span>
                                        </h3>
                                        <ul className="detail-list">
                                            {selectedData.functions.map((f, i) => (
                                                <li key={i}>{f}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="detail-section">
                                        <h3 className="detail-section-title">
                                            <Box size={14} className="section-icon" />
                                            <span>Estructura</span>
                                        </h3>
                                        <p className="detail-text">{selectedData.structure}</p>
                                    </div>
                                </div>

                                <div className="fun-fact-card">
                                    <div className="fun-fact-header">
                                        <Lightbulb size={16} className="fun-fact-icon" />
                                        <h4>¿Sabías que...?</h4>
                                    </div>
                                    <p className="fun-fact-text">{selectedData.funFact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW: BOTTOM SELECTOR DOCK (Only in Explore Mode) */}
            {!isQuizMode && (
                <div className="organelle-selector-dock">
                    <div className="dock-container">
                        {organelleData.map(org => (
                            <button
                                key={org.id}
                                className={`dock-item ${selectedOrganelle === org.id ? 'active' : ''} ${visitedIds.has(org.id) ? 'visited' : ''}`}
                                onClick={() => handleSelect(org.id)}
                            >
                                <span className="dock-icon">{org.icon}</span>
                                <div className="dock-tooltip">{org.name}</div>
                                {visitedIds.has(org.id) && <div className="visited-indicator" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CelulaAnimal;
