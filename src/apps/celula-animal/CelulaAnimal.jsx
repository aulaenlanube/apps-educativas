import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, Lightbulb, Activity, Box, Target, CheckCircle2, XCircle, ZoomOut } from 'lucide-react';
import confetti from 'canvas-confetti';
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
const SVG_W = 600;
const SVG_H = 500;

const CellDiagram = ({ selectedId, visitedIds, onSelect, isQuizMode, quizTargetId, feedbackState, viewBox }) => {
    const getRegionClass = (id) => {
        if (!isQuizMode) return selectedId === id ? 'active' : '';
        if (feedbackState && feedbackState.id === id) {
            return feedbackState.isCorrect ? 'correct' : 'incorrect';
        }
        return '';
    };

    return (
        <svg viewBox={viewBox || `0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
                {/* ===== ADVANCED GRADIENTS ===== */}
                <radialGradient id="cytoplasmGrad" cx="45%" cy="40%">
                    <stop offset="0%" stopColor="#1f4d38" />
                    <stop offset="40%" stopColor="#163a28" />
                    <stop offset="80%" stopColor="#0f2a1c" />
                    <stop offset="100%" stopColor="#0a1f14" />
                </radialGradient>
                <radialGradient id="cytoHighlight" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(34,197,94,0.08)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Nucleus - deep purple sphere */}
                <radialGradient id="nucleusGrad" cx="38%" cy="35%">
                    <stop offset="0%" stopColor="#4c2a8c" />
                    <stop offset="35%" stopColor="#351e6b" />
                    <stop offset="70%" stopColor="#1f1248" />
                    <stop offset="100%" stopColor="#120a30" />
                </radialGradient>
                <radialGradient id="nucleusHighlight" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(167,139,250,0.35)" />
                    <stop offset="60%" stopColor="rgba(167,139,250,0.05)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Nucleolus - deeper purple */}
                <radialGradient id="nucleolusGrad" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#6d3cc0" />
                    <stop offset="40%" stopColor="#4a2080" />
                    <stop offset="100%" stopColor="#2a1050" />
                </radialGradient>
                <radialGradient id="nucleolusHighlight" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(196,167,255,0.5)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Mitochondria - warm 3D */}
                <radialGradient id="mitoGrad1" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#e68a1e" />
                    <stop offset="40%" stopColor="#c76b10" />
                    <stop offset="80%" stopColor="#92400e" />
                    <stop offset="100%" stopColor="#6b2f0a" />
                </radialGradient>
                <radialGradient id="mitoHighlight1" cx="25%" cy="20%">
                    <stop offset="0%" stopColor="rgba(252,211,77,0.4)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="mitoGrad2" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#d97c18" />
                    <stop offset="50%" stopColor="#a85d0e" />
                    <stop offset="100%" stopColor="#6b380a" />
                </radialGradient>

                {/* Golgi - teal stacks */}
                <linearGradient id="golgiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="50%" stopColor="#0e9384" />
                    <stop offset="100%" stopColor="#0a7b6e" />
                </linearGradient>
                <radialGradient id="golgiVesicle" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#0d9488" />
                </radialGradient>

                {/* RER - rich blue */}
                <linearGradient id="rerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4fd8" />
                </linearGradient>

                {/* REL - smooth teal */}
                <linearGradient id="relGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14ceb5" />
                    <stop offset="50%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0a7f6e" />
                </linearGradient>

                {/* Lysosomes - hot red sphere */}
                <radialGradient id="lysoGrad1" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="40%" stopColor="#ef4444" />
                    <stop offset="80%" stopColor="#b91c1c" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                </radialGradient>
                <radialGradient id="lysoGrad2" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="40%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#991b1b" />
                </radialGradient>

                {/* Centrosome */}
                <radialGradient id="centroGrad" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#f0abfc" />
                    <stop offset="50%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#a21caf" />
                </radialGradient>

                {/* Ribosomes */}
                <radialGradient id="riboGrad" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </radialGradient>

                {/* Membrane gradient */}
                <linearGradient id="membraneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="50%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#15803d" />
                </linearGradient>

                {/* ===== FILTERS ===== */}
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="innerShadow">
                    <feOffset dx="0" dy="2" />
                    <feGaussianBlur stdDeviation="3" result="offset-blur" />
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="shadow" />
                    <feFlood floodColor="#000" floodOpacity="0.25" result="color" />
                    <feComposite operator="in" in="color" in2="shadow" />
                    <feComposite operator="over" in2="SourceGraphic" />
                </filter>
                <filter id="dropShadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* === 1. CELL MEMBRANE – phospholipid bilayer === */}
            <g className={`organelle-region ${getRegionClass('membrana')}`}
                onClick={() => onSelect('membrana')} pointerEvents="visiblePainted">
                {/* Outer glow */}
                <ellipse cx="300" cy="250" rx="280" ry="223"
                    fill="none" stroke="rgba(34,197,94,0.06)" strokeWidth="18" />
                {/* Outer layer */}
                <ellipse cx="300" cy="250" rx="275" ry="220"
                    fill="none" stroke="url(#membraneGrad)" strokeWidth="3.5" opacity="0.7" />
                {/* Bilayer detail */}
                <ellipse cx="300" cy="250" rx="270" ry="215"
                    fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.3" strokeDasharray="2,6" />
                {/* Inner layer */}
                <ellipse cx="300" cy="250" rx="266" ry="211"
                    fill="none" stroke="#15803d" strokeWidth="2.5" opacity="0.5" />
                {/* Phospholipid dot markers */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                    const rad = (deg * Math.PI) / 180;
                    const x = 300 + 272 * Math.cos(rad);
                    const y = 250 + 218 * Math.sin(rad);
                    return <circle key={deg} cx={x} cy={y} r="2.5" fill="#4ade80" opacity="0.4" />;
                })}
            </g>

            {/* === 2. CYTOPLASM === */}
            <g className={`organelle-region ${getRegionClass('citoplasma')}`}
                onClick={() => onSelect('citoplasma')}>
                <ellipse cx="300" cy="250" rx="264" ry="209" fill="url(#cytoplasmGrad)" />
                {/* Light highlight top-left */}
                <ellipse cx="300" cy="250" rx="264" ry="209" fill="url(#cytoHighlight)" />
                {/* Subtle texture particles */}
                {[[120, 180], [200, 400], [450, 180], [500, 300], [150, 320], [380, 420], [280, 120]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="1" fill="rgba(134,239,172,0.1)" />
                ))}
            </g>

            {/* === 3. CITOESQUELETO – filament network === */}
            <g className={`organelle-region ${getRegionClass('citoesqueleto')}`}
                onClick={() => onSelect('citoesqueleto')} opacity="0.3">
                <line x1="80" y1="200" x2="200" y2="300" stroke="transparent" strokeWidth="15" />
                {/* Microtubules */}
                <line x1="80" y1="200" x2="200" y2="300" stroke="#86efac" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="100" y1="350" x2="250" y2="180" stroke="#86efac" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="400" y1="150" x2="500" y2="350" stroke="#86efac" strokeWidth="1.2" strokeDasharray="5,4" />
                <line x1="150" y1="150" x2="450" y2="400" stroke="#86efac" strokeWidth="0.8" strokeDasharray="8,6" />
                {/* Intermediate filaments */}
                <line x1="200" y1="120" x2="350" y2="430" stroke="#6ee7b7" strokeWidth="0.6" strokeDasharray="3,8" />
                <line x1="480" y1="200" x2="320" y2="420" stroke="#6ee7b7" strokeWidth="0.6" strokeDasharray="3,8" />
                {/* Junction nodes */}
                {[[200, 300], [250, 180], [400, 150], [350, 430]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2" fill="#86efac" opacity="0.4" />
                ))}
            </g>

            {/* === 4. NUCLEUS – 3D sphere with pores === */}
            <g className={`organelle-region ${getRegionClass('nucleo')}`}
                onClick={() => onSelect('nucleo')} filter="url(#dropShadow)">
                {/* Main body */}
                <ellipse cx="310" cy="220" rx="95" ry="80"
                    fill="url(#nucleusGrad)" stroke="#7c3aed" strokeWidth="3" />
                {/* 3D specular highlight */}
                <ellipse cx="310" cy="220" rx="95" ry="80" fill="url(#nucleusHighlight)" />
                {/* Chromatin threads */}
                <path d="M255,195 Q270,185 285,200 Q300,218 315,205 Q330,192 345,210 Q358,225 365,215"
                    fill="none" stroke="#a78bfa" strokeWidth="1.8" opacity="0.25" strokeDasharray="4,3" />
                <path d="M270,240 Q290,232 305,245 Q320,255 335,238 Q350,225 360,240"
                    fill="none" stroke="#c4b5fd" strokeWidth="1.2" opacity="0.15" strokeDasharray="3,5" />
                {/* Nuclear pores (dots on envelope) */}
                {[20, 55, 100, 145, 200, 250, 290, 330].map(deg => {
                    const rad = (deg * Math.PI) / 180;
                    const x = 310 + 93 * Math.cos(rad);
                    const y = 220 + 78 * Math.sin(rad);
                    return <circle key={deg} cx={x} cy={y} r="2.5" fill="#8b5cf6" opacity="0.4" />;
                })}
                {/* Bottom rim shadow */}
                <ellipse cx="310" cy="260" rx="70" ry="15" fill="rgba(0,0,0,0.15)" />
            </g>

            {/* === 5. NUCLEOLUS – dense sphere === */}
            <g className={`organelle-region ${getRegionClass('nucleolo')}`}
                onClick={() => onSelect('nucleolo')}>
                {/* Shadow */}
                <ellipse cx="306" cy="215" rx="20" ry="10" fill="rgba(0,0,0,0.2)" />
                {/* Main body */}
                <circle cx="305" cy="210" r="22" fill="url(#nucleolusGrad)" stroke="#8b5cf6" strokeWidth="1.5" />
                {/* 3D highlight */}
                <circle cx="305" cy="210" r="22" fill="url(#nucleolusHighlight)" />
                {/* Dense granular texture */}
                <circle cx="298" cy="204" r="5" fill="#9333ea" opacity="0.2" />
                <circle cx="312" cy="215" r="4" fill="#7e22ce" opacity="0.15" />
                <circle cx="303" cy="218" r="3" fill="#9333ea" opacity="0.1" />
                {/* Top specular dot */}
                <circle cx="298" cy="200" r="3.5" fill="rgba(255,255,255,0.15)" />
            </g>

            {/* === 6. RETÍCULO ENDOPLASMÁTICO LISO – smooth tubules === */}
            <g className={`organelle-region ${getRegionClass('reticulo-liso')}`}
                onClick={() => onSelect('reticulo-liso')}>
                <path d="M100,310 Q120,290 140,310 Q160,330 180,310 Q200,290 220,310"
                    fill="none" stroke="transparent" strokeWidth="22" />
                {/* Shadow layer */}
                <path d="M102,314 Q122,294 142,314 Q162,334 182,314 Q202,294 222,314"
                    fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="7" strokeLinecap="round" />
                {/* Main tubes */}
                <path d="M100,310 Q120,290 140,310 Q160,330 180,310 Q200,290 220,310"
                    fill="none" stroke="url(#relGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                {/* Highlight */}
                <path d="M100,308 Q120,288 140,308 Q160,328 180,308 Q200,288 220,308"
                    fill="none" stroke="rgba(94,234,212,0.3)" strokeWidth="2" strokeLinecap="round" />
                {/* Second row */}
                <path d="M112,338 Q132,318 152,338 Q172,358 192,338"
                    fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="6" strokeLinecap="round" />
                <path d="M110,335 Q130,315 150,335 Q170,355 190,335"
                    fill="none" stroke="url(#relGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
                <path d="M110,333 Q130,313 150,333 Q170,353 190,333"
                    fill="none" stroke="rgba(94,234,212,0.25)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Third row */}
                <path d="M125,358 Q145,340 165,358 Q175,370 185,355"
                    fill="none" stroke="url(#relGrad)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
            </g>

            {/* === 7. RETÍCULO ENDOPLASMÁTICO RUGOSO – with ribosomes === */}
            <g className={`organelle-region ${getRegionClass('reticulo-rugoso')}`}
                onClick={() => onSelect('reticulo-rugoso')}>
                <path d="M170,150 Q190,130 210,150 Q230,170 250,155"
                    fill="none" stroke="transparent" strokeWidth="22" />
                {/* Shadow */}
                <path d="M172,154 Q192,134 212,154 Q232,174 252,159"
                    fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="8" strokeLinecap="round" />
                {/* First tube */}
                <path d="M170,150 Q190,130 210,150 Q230,170 250,155"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
                <path d="M170,148 Q190,128 210,148 Q230,168 250,153"
                    fill="none" stroke="rgba(147,197,253,0.3)" strokeWidth="2" strokeLinecap="round" />
                {/* Ribosomes on first tube */}
                {[[175, 152], [188, 140], [202, 148], [218, 160], [235, 162], [248, 156]].map(([x, y], i) => (
                    <circle key={`r1-${i}`} cx={x} cy={y + 7} r="2.5" fill="#60a5fa" opacity="0.7" />
                ))}
                {/* Shadow */}
                <path d="M162,179 Q187,159 212,179 Q237,199 262,179"
                    fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="7" strokeLinecap="round" />
                {/* Second tube */}
                <path d="M160,175 Q185,155 210,175 Q235,195 260,175"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                <path d="M160,173 Q185,153 210,173 Q235,193 260,173"
                    fill="none" stroke="rgba(147,197,253,0.25)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Ribosomes on second tube */}
                {[[168, 178], [182, 166], [198, 174], [215, 185], [230, 188], [248, 178]].map(([x, y], i) => (
                    <circle key={`r2-${i}`} cx={x} cy={y + 6} r="2.2" fill="#60a5fa" opacity="0.6" />
                ))}
                {/* Third tube */}
                <path d="M155,198 Q180,180 205,198 Q225,212 245,200"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
            </g>

            {/* === 8. APARATO DE GOLGI – stacked cisternae with vesicles === */}
            <g className={`organelle-region ${getRegionClass('golgi')}`}
                onClick={() => onSelect('golgi')} filter="url(#dropShadow)">
                <path d="M395,145 Q420,135 445,145 Q465,155 480,148"
                    fill="none" stroke="transparent" strokeWidth="60" />
                {/* Cisternae with 3D thickness */}
                {[0, 14, 28, 42, 56].map((offset, i) => (
                    <g key={i}>
                        {/* Shadow */}
                        <path d={`M393,${149 + offset} Q418,${139 + offset} 443,${149 + offset} Q463,${159 + offset} 478,${152 + offset}`}
                            fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="8" strokeLinecap="round" />
                        {/* Main cisterna */}
                        <path d={`M395,${145 + offset} Q420,${135 + offset} 445,${145 + offset} Q465,${155 + offset} 480,${148 + offset}`}
                            fill="none" stroke="url(#golgiGrad)" strokeWidth={7 - i * 0.6} strokeLinecap="round"
                            opacity={0.9 - i * 0.1} />
                        {/* Highlight on top */}
                        <path d={`M397,${143 + offset} Q420,${133 + offset} 443,${143 + offset} Q463,${153 + offset} 478,${146 + offset}`}
                            fill="none" stroke="rgba(94,234,212,0.2)" strokeWidth="2" strokeLinecap="round" />
                    </g>
                ))}
                {/* Transport vesicles budding off */}
                <circle cx="485" cy="160" r="6" fill="url(#golgiVesicle)" stroke="#14b8a6" strokeWidth="1" opacity="0.7" />
                <circle cx="492" cy="180" r="5" fill="url(#golgiVesicle)" stroke="#14b8a6" strokeWidth="0.8" opacity="0.6" />
                <circle cx="388" cy="210" r="5.5" fill="url(#golgiVesicle)" stroke="#14b8a6" strokeWidth="0.8" opacity="0.55" />
                {/* Vesicle highlights */}
                <circle cx="483" cy="158" r="2" fill="rgba(255,255,255,0.2)" />
                <circle cx="490" cy="178" r="1.5" fill="rgba(255,255,255,0.15)" />
            </g>

            {/* === 9. MITOCONDRIAS – with cristae === */}
            <g className={`organelle-region ${getRegionClass('mitocondria')}`}
                onClick={() => onSelect('mitocondria')}>
                {/* MITO 1 - large */}
                <g transform="rotate(-20, 430, 350)">
                    {/* Drop shadow */}
                    <ellipse cx="432" cy="356" rx="50" ry="22" fill="rgba(0,0,0,0.2)" />
                    {/* Outer membrane */}
                    <ellipse cx="430" cy="350" rx="52" ry="24"
                        fill="none" stroke="#d97706" strokeWidth="2" opacity="0.4" />
                    {/* Main body */}
                    <ellipse cx="430" cy="350" rx="48" ry="21"
                        fill="url(#mitoGrad1)" stroke="#d97706" strokeWidth="2.5" />
                    {/* 3D highlight */}
                    <ellipse cx="430" cy="350" rx="48" ry="21" fill="url(#mitoHighlight1)" />
                    {/* Inner membrane cristae */}
                    <path d="M400,345 Q405,335 400,350 Q395,360 400,355" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3" />
                    <path d="M415,342 Q418,332 415,347 Q412,357 415,352" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3" />
                    <path d="M430,340 Q433,330 430,348 Q427,358 430,350" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3" />
                    <path d="M445,342 Q448,333 445,349 Q442,358 445,352" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.3" />
                    <path d="M458,345 Q460,337 458,352 Q456,358 458,354" fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.25" />
                    {/* Matrix dots */}
                    <circle cx="410" cy="348" r="1.5" fill="#fcd34d" opacity="0.2" />
                    <circle cx="440" cy="353" r="1.2" fill="#fcd34d" opacity="0.15" />
                    <circle cx="455" cy="347" r="1" fill="#fcd34d" opacity="0.2" />
                    {/* Specular */}
                    <ellipse cx="420" cy="342" rx="15" ry="5" fill="rgba(255,255,255,0.08)" />
                </g>

                {/* MITO 2 - smaller */}
                <g transform="rotate(15, 180, 410)">
                    <ellipse cx="181" cy="415" rx="35" ry="16" fill="rgba(0,0,0,0.15)" />
                    <ellipse cx="180" cy="410" rx="38" ry="18"
                        fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.35" />
                    <ellipse cx="180" cy="410" rx="35" ry="16"
                        fill="url(#mitoGrad2)" stroke="#d97706" strokeWidth="2" />
                    {/* Cristae */}
                    <path d="M160,407 Q163,399 160,412 Q158,418 160,414" fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.25" />
                    <path d="M172,405 Q175,397 172,410 Q170,417 172,412" fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.25" />
                    <path d="M184,404 Q187,396 184,411 Q182,418 184,413" fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.25" />
                    <path d="M195,406 Q198,399 195,412 Q193,417 195,414" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.2" />
                    {/* Highlight */}
                    <ellipse cx="172" cy="405" rx="12" ry="4" fill="rgba(255,255,255,0.06)" />
                </g>
            </g>

            {/* === 10. LISOSOMAS – 3D spheres === */}
            <g className={`organelle-region ${getRegionClass('lisosoma')}`}
                onClick={() => onSelect('lisosoma')}>
                {/* Lysosome 1 */}
                <circle cx="475" cy="230" r="22" fill="transparent" />
                <circle cx="476" cy="234" r="14" fill="rgba(0,0,0,0.15)" />
                <circle cx="475" cy="230" r="15" fill="url(#lysoGrad1)" stroke="#ef4444" strokeWidth="1.5" />
                <circle cx="470" cy="224" r="4" fill="rgba(255,255,255,0.2)" />
                {/* Enzymes inside */}
                <circle cx="478" cy="233" r="2" fill="#fca5a5" opacity="0.3" />
                <circle cx="472" cy="228" r="1.5" fill="#fca5a5" opacity="0.2" />

                {/* Lysosome 2 */}
                <circle cx="510" cy="270" r="18" fill="transparent" />
                <circle cx="511" cy="274" r="11" fill="rgba(0,0,0,0.12)" />
                <circle cx="510" cy="270" r="11" fill="url(#lysoGrad2)" stroke="#ef4444" strokeWidth="1" />
                <circle cx="507" cy="266" r="2.5" fill="rgba(255,255,255,0.18)" />
            </g>

            {/* === 11. CENTROSOMA – paired centrioles === */}
            <g className={`organelle-region ${getRegionClass('centrosoma')}`}
                onClick={() => onSelect('centrosoma')}>
                <circle cx="352" cy="294" r="35" fill="transparent" />
                {/* Radiating lines (aster) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 352 + 12 * Math.cos(rad);
                    const y1 = 294 + 12 * Math.sin(rad);
                    const x2 = 352 + 28 * Math.cos(rad);
                    const y2 = 294 + 28 * Math.sin(rad);
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d946ef" strokeWidth="0.6" opacity="0.25" />;
                })}
                {/* Centriole 1 (horizontal) */}
                <rect x="338" y="289" width="24" height="10" rx="3"
                    fill="url(#centroGrad)" stroke="#c026d3" strokeWidth="1.2" />
                {/* Internal structure */}
                {[342, 347, 352, 357].map(x => (
                    <line key={x} x1={x} y1="290" x2={x} y2="298" stroke="#e9d5ff" strokeWidth="0.5" opacity="0.3" />
                ))}
                {/* Centriole 2 (vertical) */}
                <rect x="347" y="279" width="10" height="24" rx="3"
                    fill="url(#centroGrad)" stroke="#c026d3" strokeWidth="1.2" />
                {[283, 288, 293, 298].map(y => (
                    <line key={y} x1="348" y1={y} x2="356" y2={y} stroke="#e9d5ff" strokeWidth="0.5" opacity="0.3" />
                ))}
                {/* Center glow */}
                <circle cx="352" cy="294" r="4" fill="#d946ef" opacity="0.2" filter="url(#softGlow)" />
            </g>

            {/* === 12. RIBOSOMAS – two-part structures === */}
            <g className={`organelle-region ${getRegionClass('ribosoma')}`}
                onClick={() => onSelect('ribosoma')}>
                {[[140, 250], [160, 270], [350, 320], [370, 300], [320, 380], [290, 370], [250, 330], [130, 380], [450, 290], [380, 400], [330, 410], [500, 310]].map(([x, y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r="12" fill="transparent" />
                        {/* Large subunit */}
                        <ellipse cx={x} cy={y + 1} rx="3.5" ry="2.5" fill="url(#riboGrad)" opacity="0.8" />
                        {/* Small subunit */}
                        <ellipse cx={x} cy={y - 2} rx="2.5" ry="1.8" fill="#93c5fd" opacity="0.65" />
                        {/* Highlight dot */}
                        <circle cx={x - 1} cy={y - 2.5} r="0.8" fill="rgba(255,255,255,0.3)" />
                    </g>
                ))}
            </g>

            {/* ===== AMBIENT ANIMATIONS ===== */}
            {/* Vesicle transport Golgi → membrane */}
            <circle r="3.5" fill="url(#golgiVesicle)" opacity="0.45" pointerEvents="none">
                <animateMotion dur="7s" repeatCount="indefinite"
                    path="M485,160 Q500,130 520,200 Q540,250 530,280" />
            </circle>
            <circle r="2.5" fill="#22d3ee" opacity="0.35" pointerEvents="none">
                <animateMotion dur="5s" repeatCount="indefinite" begin="1.5s"
                    path="M400,175 Q420,200 475,230" />
            </circle>
            {/* ATP particle from mitochondria */}
            <circle r="2" fill="#fbbf24" opacity="0.35" pointerEvents="none">
                <animateMotion dur="8s" repeatCount="indefinite"
                    path="M430,350 Q400,320 350,300 Q310,280 300,260" />
            </circle>
        </svg>
    );
};

// ===== MAIN COMPONENT =====
const CelulaAnimal = () => {
    const navigate = useNavigate();
    const [selectedOrganelle, setSelectedOrganelle] = useState(null);
    const [visitedIds, setVisitedIds] = useState(new Set());

    // Quiz State
    // Mode: 'explore' | 'quiz' | 'match'
    const [mode, setMode] = useState('explore');
    const isQuizMode = mode === 'quiz';
    const isMatchMode = mode === 'match';

    const [quizTarget, setQuizTarget] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFeedback, setQuizFeedback] = useState(null);

    // Reto (match) mode state
    const [matchDifficulty, setMatchDifficulty] = useState(null); // 6 | 9 | 12, null = show picker
    const [matchPairs, setMatchPairs] = useState([]);
    const [matchFunctions, setMatchFunctions] = useState([]);
    const [matchSelected, setMatchSelected] = useState(null); // organelle id being assigned
    const [matchAnswers, setMatchAnswers] = useState({}); // {orgId: funcId} — student's answers
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [testGrade, setTestGrade] = useState(null); // 0-10
    const [lastAssignedPair, setLastAssignedPair] = useState(null); // {orgId, funcId}

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
    }, [isQuizMode, isMatchMode, quizTarget]);

    const handleClose = useCallback(() => {
        setSelectedOrganelle(null);
    }, []);

    const selectedData = useMemo(() => {
        return organelleData.find(o => o.id === selectedOrganelle);
    }, [selectedOrganelle]);

    // ===== MODE SWITCHING =====
    const switchMode = (newMode) => {
        setMode(newMode);
        setSelectedOrganelle(null);
        setQuizTarget(null);
        setQuizFeedback(null);
        setMatchSelected(null);
        setMatchAnswers({});
        setTestSubmitted(false);
        setTestGrade(null);
        setMatchDifficulty(null);
        if (newMode === 'quiz') {
            setQuizScore(0);
            pickNextQuizTarget();
        }
        // match mode: don't auto-start, show difficulty picker (matchDifficulty === null)
    };

    // ===== QUIZ ("RETO") LOGIC =====
    const pickNextQuizTarget = () => {
        const random = organelleData[Math.floor(Math.random() * organelleData.length)];
        setQuizTarget(random);
        setQuizFeedback(null);
    };

    const handleQuizInteraction = (clickedId) => {
        if (!quizTarget || quizFeedback) return;
        const isCorrect = clickedId === quizTarget.id;
        setQuizFeedback({ isCorrect, id: clickedId });
        if (isCorrect) {
            setQuizScore(prev => prev + 1);
            setTimeout(() => pickNextQuizTarget(), 1500);
        } else {
            setTimeout(() => setQuizFeedback(null), 1000);
        }
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

    const submitTest = () => {
        let correct = 0;
        matchPairs.forEach(org => {
            if (matchAnswers[org.id] === org.id) correct++;
        });
        const grade = Math.round((correct / matchPairs.length) * 10 * 10) / 10;
        setTestGrade(grade);
        setTestSubmitted(true);
        if (grade >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899']
            });
        }
    };

    const getGradeEmoji = (grade) => {
        if (grade >= 9) return '🌟';
        if (grade >= 7) return '😊';
        if (grade >= 5) return '😐';
        return '😕';
    };

    const progressPercent = (visitedIds.size / organelleData.length) * 100;

    return (
        <div className={`celula-app ${isQuizMode ? 'quiz-mode' : ''} ${isMatchMode ? 'match-mode' : ''}`}>
            {/* HEADER */}
            <header className="celula-header">
                <div className="celula-header-left">
                    {/* Managed by AppRunnerPage */}
                </div>

                {/* Mode Switcher */}
                <div className="mode-switcher">
                    {zoom > 1.1 && (
                        <button className="mode-btn reset-zoom-btn" onClick={resetView} title="Restaurar zoom">
                            <ZoomOut size={14} /> <span>1:1</span>
                        </button>
                    )}
                    <button
                        className={`mode-btn ${mode === 'explore' ? 'active' : ''}`}
                        onClick={() => switchMode('explore')}
                    >
                        Explorar
                    </button>
                    <button
                        className={`mode-btn ${mode === 'quiz' ? 'active quiz-mode-active' : ''}`}
                        onClick={() => switchMode('quiz')}
                    >
                        Test
                    </button>
                    <button
                        className={`mode-btn ${mode === 'match' ? 'active match-mode-active' : ''}`}
                        onClick={() => switchMode('match')}
                    >
                        Reto
                    </button>
                </div>

                {mode === 'explore' && (
                    <div className="celula-progress">
                        <span className="progress-text">
                            {visitedIds.size}/{organelleData.length} explorados
                        </span>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                )}
                {mode === 'quiz' && (
                    <div className="quiz-hud">
                        <div className="quiz-score">Puntos: {quizScore}</div>
                    </div>
                )}
                {mode === 'match' && matchDifficulty !== null && !testSubmitted && (
                    <div className="quiz-hud">
                        <div className="quiz-score">{Object.keys(matchAnswers).length}/{matchPairs.length} asignados</div>
                    </div>
                )}
            </header>

            {/* FULL-SCREEN DIAGRAM */}
            <div className="celula-fullscreen">
                <div
                    ref={containerRef}
                    className={`celula-svg-container ${selectedOrganelle ? 'has-selection' : ''}`}
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

                    {/* Overlay label markers – stay at native text size */}
                    {organelleData.map(org => {
                        if (!isLabelVisible(org.labelPos)) return null;
                        const pos = getLabelStyle(org.labelPos);
                        return (
                            <div
                                key={org.id}
                                className={`organelle-label-marker ${selectedOrganelle === org.id ? 'active-marker' : ''}`}
                                style={pos}
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
                        );
                    })}

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
            {mode === 'explore' && !selectedOrganelle && (
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

            {/* ===== RETO MODE UI ===== */}
            {isMatchMode && (
                <div className="match-game-overlay">
                    <div className="match-game-panel">
                        {/* Difficulty Picker */}
                        {matchDifficulty === null ? (
                            <>
                                <div className="match-panel-header">
                                    <div>
                                        <h3 className="match-title">
                                            🎯 Reto: Relaciona orgánulo y función
                                        </h3>
                                        <p className="match-instruction">
                                            Elige la dificultad del reto. Cuantos más orgánulos, mayor dificultad.
                                        </p>
                                    </div>
                                    <button
                                        className="match-exit-btn"
                                        onClick={() => switchMode('explore')}
                                        title="Volver a explorar"
                                    >
                                        ✕ Salir
                                    </button>
                                </div>
                                <div className="difficulty-picker">
                                    <button className="difficulty-btn difficulty-easy" onClick={() => startMatchWithDifficulty(6)}>
                                        <span className="difficulty-count">6</span>
                                        <span className="difficulty-label">Fácil</span>
                                        <span className="difficulty-desc">6 orgánulos</span>
                                    </button>
                                    <button className="difficulty-btn difficulty-medium" onClick={() => startMatchWithDifficulty(9)}>
                                        <span className="difficulty-count">9</span>
                                        <span className="difficulty-label">Normal</span>
                                        <span className="difficulty-desc">9 orgánulos</span>
                                    </button>
                                    <button className="difficulty-btn difficulty-hard" onClick={() => startMatchWithDifficulty(12)}>
                                        <span className="difficulty-count">12</span>
                                        <span className="difficulty-label">Difícil</span>
                                        <span className="difficulty-desc">12 orgánulos</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="match-panel-header">
                                    <div>
                                        <h3 className="match-title">
                                            🎯 Reto: Relaciona orgánulo y función
                                        </h3>
                                        <p className="match-instruction">
                                            {!testSubmitted
                                                ? 'Selecciona un orgánulo y asigna su función. Cuando hayas asignado todos, pulsa Corregir.'
                                                : 'Revisa tus resultados abajo.'}
                                        </p>
                                    </div>
                                    <button
                                        className="match-exit-btn"
                                        onClick={() => switchMode('explore')}
                                        title="Volver a explorar"
                                    >
                                        ✕ Salir
                                    </button>
                                </div>

                                <div className="match-columns">
                                    {/* Left: Organelles */}
                                    <div className="match-col match-col-left">
                                        <div className="match-col-header">Orgánulo</div>
                                        {matchPairs.map(org => {
                                            const answered = matchAnswers[org.id] !== undefined;
                                            const isCorrect = testSubmitted && matchAnswers[org.id] === org.id;
                                            const isWrong = testSubmitted && answered && matchAnswers[org.id] !== org.id;
                                            const justMatched = lastAssignedPair?.orgId === org.id && !testSubmitted;
                                            // Use funcId in key to replay animation on reassign
                                            const animKey = `${org.id}-${matchAnswers[org.id] || 'none'}`;
                                            return (
                                                <button
                                                    key={animKey}
                                                    className={`match-item match-organelle
                                                ${matchSelected === org.id ? 'selected' : ''}
                                                ${answered && !testSubmitted ? 'answered' : ''}
                                                ${justMatched ? 'just-matched' : ''}
                                                ${isCorrect ? 'result-correct' : ''}
                                                ${isWrong ? 'result-wrong' : ''}
                                            `}
                                                    onClick={() => handleMatchOrganelleClick(org.id)}
                                                    disabled={testSubmitted}
                                                >
                                                    <span className="match-item-icon">{org.icon}</span>
                                                    <span className="match-item-name">{org.name}</span>
                                                    {answered && !testSubmitted && <span className="match-remove-btn" onClick={(e) => { e.stopPropagation(); removeMatch(org.id); }} title="Descartar pareja"><X size={14} /></span>}
                                                    {testSubmitted && isCorrect && <CheckCircle2 size={16} className="match-check" />}
                                                    {testSubmitted && isWrong && <XCircle size={16} className="match-wrong-icon" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Right: Functions */}
                                    <div className="match-col match-col-right">
                                        <div className="match-col-header">Función</div>
                                        {matchFunctions.map((func, idx) => {
                                            // Check if this function has been assigned to any organelle
                                            const assignedOrg = Object.entries(matchAnswers).find(([, fId]) => fId === func.id)?.[0];
                                            const isAssigned = assignedOrg !== undefined;
                                            const isCorrect = testSubmitted && assignedOrg === func.id;
                                            const isWrong = testSubmitted && isAssigned && assignedOrg !== func.id;
                                            const assignedOrgData = isAssigned ? matchPairs.find(o => o.id === assignedOrg) : null;
                                            const justMatched = lastAssignedPair?.funcId === func.id && !testSubmitted;
                                            const animKey = `${func.id}-${idx}-${assignedOrg || 'none'}`;
                                            return (
                                                <button
                                                    key={animKey}
                                                    className={`match-item match-function
                                                ${isAssigned && !testSubmitted ? 'answered' : ''}
                                                ${justMatched ? 'just-matched' : ''}
                                                ${isCorrect ? 'result-correct' : ''}
                                                ${isWrong ? 'result-wrong' : ''}
                                            `}
                                                    onClick={() => handleMatchFunctionClick(func)}
                                                    disabled={testSubmitted}
                                                >
                                                    <span className="match-func-text">{func.label}</span>
                                                    {isAssigned && !testSubmitted && (
                                                        <span className="match-assigned-tag">{assignedOrgData?.icon}</span>
                                                    )}
                                                    {testSubmitted && isCorrect && <CheckCircle2 size={16} className="match-check" />}
                                                    {testSubmitted && isWrong && <XCircle size={16} className="match-wrong-icon" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                {!testSubmitted && (
                                    <div className="match-actions">
                                        <button
                                            className={`match-submit-btn ${allAnswered ? 'ready' : ''}`}
                                            onClick={submitTest}
                                            disabled={!allAnswered}
                                        >
                                            ✅ Corregir ({Object.keys(matchAnswers).length}/{matchPairs.length})
                                        </button>
                                    </div>
                                )}

                                {/* Results */}
                                {testSubmitted && testGrade !== null && (
                                    <div className={`match-results ${testGrade >= 5 ? 'pass' : 'fail'}`}>
                                        <div className="match-grade-display">
                                            <span className="match-grade-emoji">{getGradeEmoji(testGrade)}</span>
                                            <span className="match-grade-number">{testGrade}</span>
                                            <span className="match-grade-max">/ 10</span>
                                        </div>
                                        <div className="match-grade-label">
                                            {testGrade >= 9 ? '¡Sobresaliente!' :
                                                testGrade >= 7 ? '¡Notable!' :
                                                    testGrade >= 5 ? 'Aprobado' : 'Necesitas repasar'}
                                        </div>
                                        <div className="match-results-actions">
                                            <button className="match-replay-btn" onClick={() => initMatchGame(matchDifficulty)}>
                                                🔄 Repetir reto
                                            </button>
                                            <button className="match-exit-btn-bottom" onClick={() => switchMode('explore')}>
                                                ← Volver a explorar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* BOTTOM SELECTOR DOCK (Only in Explore Mode) */}
            {mode === 'explore' && (
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
