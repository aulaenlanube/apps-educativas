import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, Lightbulb, Activity, Box, Target, CheckCircle2, XCircle, ZoomOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import './CelulaVegetal.css';

// ===== ORGANELLE DATA =====
const organelleData = [
    {
        id: 'pared-celular',
        name: 'Pared Celular',
        icon: '🧱',
        subtitle: 'PROTECCIÓN Y SOPORTE',
        labelPos: { x: 8, y: 50 },
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
        labelPos: { x: 15, y: 20 },
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
        labelPos: { x: 62, y: 25 },
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
        labelPos: { x: 22, y: 38 },
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
        labelPos: { x: 70, y: 23 },
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
        labelPos: { x: 18, y: 55 },
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
        labelPos: { x: 23, y: 69 },
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
        labelPos: { x: 60, y: 80 },
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
        labelPos: { x: 42, y: 68 },
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
        labelPos: { x: 80, y: 45 },
        description: 'Fluido gelatinoso (citosol) que llena el interior celular. En él flotan los orgánulos y ocurren muchas reacciones químicas.',
        functions: [
            'Albergar los orgánulos',
            'Medio para reacciones metabólicas',
        ],
        structure: 'Solución acuosa con sales, proteínas y nutrientes.',
        funFact: 'En células vegetales, el citoplasma a menudo fluye en corrientes (ciclosis) para mover los cloroplastos hacia la luz.',
    }
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

                {/* Cell Wall - woody green with depth */}
                <linearGradient id="wallGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4d7c0f" />
                    <stop offset="50%" stopColor="#3f6212" />
                    <stop offset="100%" stopColor="#1a2e05" />
                </linearGradient>
                <linearGradient id="wallGradInner" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#65a30d" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4d7c0f" stopOpacity="0.1" />
                </linearGradient>

                {/* Membrane - golden bilayer */}
                <linearGradient id="membraneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Cytoplasm - deep botanical green */}
                <radialGradient id="cytoplasmGrad" cx="40%" cy="45%">
                    <stop offset="0%" stopColor="#1a3a20" />
                    <stop offset="40%" stopColor="#14301a" />
                    <stop offset="80%" stopColor="#0f2415" />
                    <stop offset="100%" stopColor="#0a1a0f" />
                </radialGradient>
                <radialGradient id="cytoHighlight" cx="25%" cy="20%">
                    <stop offset="0%" stopColor="rgba(34,197,94,0.06)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Vacuole - watery blue with depth */}
                <radialGradient id="vacuoleGrad" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#cffafe" stopOpacity="0.85" />
                    <stop offset="30%" stopColor="#a5f3fc" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#67e8f9" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
                </radialGradient>
                <radialGradient id="vacuoleHighlight" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="vacuoleDepth" cx="70%" cy="70%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0.15)" />
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

                {/* Nucleolus */}
                <radialGradient id="nucleolusGrad" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#6d3cc0" />
                    <stop offset="40%" stopColor="#4a2080" />
                    <stop offset="100%" stopColor="#2a1050" />
                </radialGradient>
                <radialGradient id="nucleolusHighlight" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(196,167,255,0.5)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Chloroplast - rich green 3D */}
                <radialGradient id="chloroGrad" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="40%" stopColor="#22c55e" />
                    <stop offset="80%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#15803d" />
                </radialGradient>
                <radialGradient id="chloroHighlight" cx="25%" cy="20%">
                    <stop offset="0%" stopColor="rgba(187,247,208,0.35)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Mitochondria - warm orange 3D */}
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

                {/* Ribosomes */}
                <radialGradient id="riboGrad" cx="35%" cy="30%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </radialGradient>

                {/* ===== FILTERS ===== */}
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="dropShadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
                </filter>

                {/* Cell wall fiber pattern */}
                <pattern id="fiberPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                    <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </pattern>
            </defs>

            {/* === 1. PARED CELULAR (Cell Wall) - 3D with fiber texture === */}
            <g className={`organelle-region ${getRegionClass('pared-celular')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('pared-celular'); }}>
                {/* Outer shadow */}
                <rect x="53" y="53" width="500" height="400" rx="40" ry="40" fill="rgba(0,0,0,0.25)" />
                {/* Main wall */}
                <rect x="50" y="50" width="500" height="400" rx="40" ry="40"
                    fill="url(#wallGradOuter)" stroke="#2d4a0a" strokeWidth="2" />
                {/* Fiber texture */}
                <rect x="50" y="50" width="500" height="400" rx="40" ry="40" fill="url(#fiberPattern)" />
                {/* Inner highlight layer */}
                <rect x="50" y="50" width="500" height="400" rx="40" ry="40" fill="url(#wallGradInner)" />
                {/* Cellulose fiber lines */}
                <path d="M95,58 L510,58" stroke="rgba(101,163,13,0.15)" strokeWidth="1" strokeDasharray="8,12" />
                <path d="M95,442 L510,442" stroke="rgba(101,163,13,0.12)" strokeWidth="1" strokeDasharray="8,12" />
                <path d="M58,95 L58,405" stroke="rgba(101,163,13,0.12)" strokeWidth="1" strokeDasharray="6,10" />
                <path d="M542,95 L542,405" stroke="rgba(101,163,13,0.12)" strokeWidth="1" strokeDasharray="6,10" />
                {/* Inner edge highlight */}
                <rect x="58" y="58" width="484" height="384" rx="36" ry="36"
                    fill="none" stroke="rgba(163,230,53,0.08)" strokeWidth="1" />
            </g>

            {/* === 2. MEMBRANA PLASMÁTICA - bilayer with phospholipids === */}
            <g className={`organelle-region ${getRegionClass('membrana')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('membrana'); }}>
                {/* Outer glow */}
                <rect x="62" y="62" width="476" height="376" rx="32" ry="32"
                    fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="12" />
                {/* Outer leaflet */}
                <rect x="65" y="65" width="470" height="370" rx="30" ry="30"
                    fill="none" stroke="url(#membraneGrad)" strokeWidth="3" opacity="0.7" />
                {/* Bilayer detail */}
                <rect x="68" y="68" width="464" height="364" rx="28" ry="28"
                    fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.25" strokeDasharray="2,6" />
                {/* Inner leaflet */}
                <rect x="71" y="71" width="458" height="358" rx="26" ry="26"
                    fill="none" stroke="#d97706" strokeWidth="2" opacity="0.4" />
                {/* Phospholipid markers */}
                {[[150,66],[250,66],[350,66],[450,66],[536,150],[536,250],[536,350],
                  [450,434],[350,434],[250,434],[150,434],[64,350],[64,250],[64,150]].map(([x,y], i) => (
                    <circle key={i} cx={x} cy={y} r="2" fill="#fbbf24" opacity="0.3" />
                ))}
            </g>

            {/* === 3. CITOPLASMA - deep green with texture === */}
            <g className={`organelle-region ${getRegionClass('citoplasma')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('citoplasma'); }}>
                <rect x="73" y="73" width="454" height="354" rx="24" ry="24" fill="url(#cytoplasmGrad)" />
                <rect x="73" y="73" width="454" height="354" rx="24" ry="24" fill="url(#cytoHighlight)" />
                {/* Texture particles */}
                {[[100,120],[180,100],[480,180],[500,320],[130,380],[420,400],[250,95]].map(([x,y], i) => (
                    <circle key={i} cx={x} cy={y} r="1" fill="rgba(134,239,172,0.08)" />
                ))}
            </g>

            {/* === 4. VACUOLA CENTRAL - watery with animated ripples === */}
            <g className={`organelle-region ${getRegionClass('vacuola')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('vacuola'); }} filter="url(#dropShadow)">
                {/* Tonoplast membrane glow */}
                <path d="M200,105 Q475,80 475,250 Q475,395 300,400 Q185,400 183,250 Q183,125 200,105"
                    fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="5" />
                {/* Main vacuole body */}
                <path d="M200,105 Q475,80 475,250 Q475,395 300,400 Q185,400 183,250 Q183,125 200,105"
                    fill="url(#vacuoleGrad)" />
                {/* Depth overlay */}
                <path d="M200,105 Q475,80 475,250 Q475,395 300,400 Q185,400 183,250 Q183,125 200,105"
                    fill="url(#vacuoleDepth)" />
                {/* Specular highlight */}
                <path d="M200,105 Q475,80 475,250 Q475,395 300,400 Q185,400 183,250 Q183,125 200,105"
                    fill="url(#vacuoleHighlight)" />
                {/* Light reflection arcs */}
                <path d="M220,130 Q340,115 400,170" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.18" />
                <path d="M230,148 Q310,138 360,178" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.1" />
                {/* Animated water ripples */}
                <path fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1">
                    <animate attributeName="d" dur="5s" repeatCount="indefinite"
                        values="M250,200 Q320,195 390,200;M250,200 Q320,208 390,200;M250,200 Q320,195 390,200" />
                </path>
                <path fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                    <animate attributeName="d" dur="6s" repeatCount="indefinite" begin="1s"
                        values="M230,280 Q330,275 430,280;M230,280 Q330,288 430,280;M230,280 Q330,275 430,280" />
                </path>
                <path fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                    <animate attributeName="d" dur="7s" repeatCount="indefinite" begin="2s"
                        values="M260,350 Q340,345 420,350;M260,350 Q340,358 420,350;M260,350 Q340,345 420,350" />
                </path>
                {/* Tonoplast inner glow */}
                <path d="M200,105 Q475,80 475,250 Q475,395 300,400 Q185,400 183,250 Q183,125 200,105"
                    fill="none" stroke="rgba(165,243,252,0.12)" strokeWidth="2" />
            </g>

            {/* === 5. NÚCLEO - 3D sphere with chromatin and pores === */}
            <g className={`organelle-region ${getRegionClass('nucleo')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('nucleo'); }} filter="url(#dropShadow)">
                {/* Bottom rim shadow */}
                <ellipse cx="132" cy="218" rx="45" ry="12" fill="rgba(0,0,0,0.2)" />
                {/* Main body */}
                <circle cx="130" cy="200" r="50" fill="url(#nucleusGrad)" stroke="#7c3aed" strokeWidth="2.5" />
                {/* 3D specular highlight */}
                <circle cx="130" cy="200" r="50" fill="url(#nucleusHighlight)" />
                {/* Chromatin threads */}
                <path d="M100,185 Q110,175 120,190 Q130,205 145,192 Q155,182 160,195"
                    fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.25" strokeDasharray="4,3" />
                <path d="M108,210 Q120,202 135,215 Q148,225 155,210"
                    fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.15" strokeDasharray="3,5" />
                {/* Nuclear pores */}
                {[20, 65, 110, 160, 210, 250, 295, 340].map(deg => {
                    const rad = (deg * Math.PI) / 180;
                    const x = 130 + 48 * Math.cos(rad);
                    const y = 200 + 48 * Math.sin(rad);
                    return <circle key={deg} cx={x} cy={y} r="2" fill="#8b5cf6" opacity="0.4" />;
                })}
            </g>

            {/* === 6. NUCLÉOLO - dense granular sphere === */}
            <g className={`organelle-region ${getRegionClass('nucleolo')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('nucleolo'); }}>
                {/* Shadow */}
                <ellipse cx="131" cy="205" rx="14" ry="6" fill="rgba(0,0,0,0.2)" />
                {/* Main body */}
                <circle cx="130" cy="200" r="15" fill="url(#nucleolusGrad)" stroke="#8b5cf6" strokeWidth="1" />
                {/* 3D highlight */}
                <circle cx="130" cy="200" r="15" fill="url(#nucleolusHighlight)" />
                {/* Dense granular texture */}
                <circle cx="125" cy="195" r="4" fill="#9333ea" opacity="0.2" />
                <circle cx="135" cy="203" r="3" fill="#7e22ce" opacity="0.15" />
                <circle cx="128" cy="207" r="2.5" fill="#9333ea" opacity="0.1" />
                {/* Top specular dot */}
                <circle cx="125" cy="193" r="2.5" fill="rgba(255,255,255,0.15)" />
            </g>

            {/* === 7. RER - tubes with ribosomes === */}
            <g className={`organelle-region ${getRegionClass('reticulo-rugoso')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('reticulo-rugoso'); }}>
                {/* Hit area */}
                <path d="M100,255 Q120,235 150,255 Q175,275 160,255" fill="none" stroke="transparent" strokeWidth="20" />
                {/* Shadow */}
                <path d="M102,262 Q122,242 152,262 Q177,282 162,262"
                    fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="8" strokeLinecap="round" />
                {/* First tube */}
                <path d="M100,258 Q120,238 150,258 Q175,278 160,258"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
                <path d="M100,256 Q120,236 150,256 Q175,276 160,256"
                    fill="none" stroke="rgba(147,197,253,0.3)" strokeWidth="2" strokeLinecap="round" />
                {/* Ribosomes on first tube */}
                {[[105,262],[118,248],[132,256],[145,268],[158,270],[168,260]].map(([x,y], i) => (
                    <circle key={`r1-${i}`} cx={x} cy={y+5} r="2.2" fill="#60a5fa" opacity="0.7" />
                ))}
                {/* Shadow second */}
                <path d="M92,284 Q117,264 142,284 Q167,304 162,284"
                    fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="7" strokeLinecap="round" />
                {/* Second tube */}
                <path d="M90,280 Q115,260 140,280 Q165,300 160,280"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                <path d="M90,278 Q115,258 140,278 Q165,298 160,278"
                    fill="none" stroke="rgba(147,197,253,0.25)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Ribosomes on second tube */}
                {[[98,285],[110,272],[125,280],[138,292],[155,292]].map(([x,y], i) => (
                    <circle key={`r2-${i}`} cx={x} cy={y+4} r="2" fill="#60a5fa" opacity="0.6" />
                ))}
                {/* Third tube */}
                <path d="M105,300 Q125,285 145,300 Q160,312 170,305"
                    fill="none" stroke="url(#rerGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
            </g>

            {/* === 8. REL - smooth tubes === */}
            <g className={`organelle-region ${getRegionClass('reticulo-liso')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('reticulo-liso'); }}>
                <path d="M100,330 Q120,310 140,330 Q160,350 180,330" fill="none" stroke="transparent" strokeWidth="20" />
                {/* Shadow */}
                <path d="M102,334 Q122,314 142,334 Q162,354 182,334"
                    fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="7" strokeLinecap="round" />
                {/* Main tubes */}
                <path d="M100,330 Q120,310 140,330 Q160,350 180,330"
                    fill="none" stroke="url(#relGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                {/* Highlight */}
                <path d="M100,328 Q120,308 140,328 Q160,348 180,328"
                    fill="none" stroke="rgba(94,234,212,0.3)" strokeWidth="2" strokeLinecap="round" />
                {/* Second row */}
                <path d="M112,358 Q132,338 152,358 Q162,368 172,355"
                    fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" strokeLinecap="round" />
                <path d="M110,355 Q130,335 150,355 Q160,365 170,352"
                    fill="none" stroke="url(#relGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
                <path d="M110,353 Q130,333 150,353 Q160,363 170,350"
                    fill="none" stroke="rgba(94,234,212,0.25)" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* === 9. CLOROPLASTOS - 3D with thylakoid stacks === */}
            <g className={`organelle-region ${getRegionClass('cloroplasto')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('cloroplasto'); }}>
                {/* Chloroplast 1 - upper right */}
                <g transform="translate(370, 125) rotate(15)">
                    <ellipse cx="2" cy="4" rx="42" ry="26" fill="rgba(0,0,0,0.2)" />
                    <ellipse cx="0" cy="0" rx="44" ry="28" fill="none" stroke="#15803d" strokeWidth="1.5" opacity="0.4" />
                    <ellipse cx="0" cy="0" rx="42" ry="26" fill="url(#chloroGrad)" stroke="#14532d" strokeWidth="2" />
                    <ellipse cx="0" cy="0" rx="42" ry="26" fill="url(#chloroHighlight)" />
                    {/* Thylakoid stacks (grana) */}
                    <rect x="-22" y="-16" width="44" height="4" rx="2" fill="#166534" opacity="0.65" />
                    <rect x="-22" y="-9" width="44" height="4" rx="2" fill="#166534" opacity="0.55" />
                    <rect x="-22" y="-2" width="44" height="4" rx="2" fill="#166534" opacity="0.5" />
                    <rect x="-22" y="5" width="44" height="4" rx="2" fill="#166534" opacity="0.55" />
                    <rect x="-22" y="12" width="44" height="4" rx="2" fill="#166534" opacity="0.65" />
                    {/* Stroma dots */}
                    <circle cx="-30" cy="-5" r="1.5" fill="#bbf7d0" opacity="0.15" />
                    <circle cx="32" cy="8" r="1.2" fill="#bbf7d0" opacity="0.12" />
                    {/* Specular */}
                    <ellipse cx="-10" cy="-14" rx="18" ry="6" fill="rgba(255,255,255,0.08)" />
                </g>
                {/* Chloroplast 2 - lower left */}
                <g transform="translate(140, 365) rotate(-20)">
                    <ellipse cx="2" cy="4" rx="38" ry="23" fill="rgba(0,0,0,0.15)" />
                    <ellipse cx="0" cy="0" rx="40" ry="25" fill="none" stroke="#15803d" strokeWidth="1.5" opacity="0.35" />
                    <ellipse cx="0" cy="0" rx="38" ry="23" fill="url(#chloroGrad)" stroke="#14532d" strokeWidth="2" />
                    <ellipse cx="0" cy="0" rx="38" ry="23" fill="url(#chloroHighlight)" />
                    <rect x="-18" y="-12" width="36" height="3.5" rx="1.5" fill="#166534" opacity="0.6" />
                    <rect x="-18" y="-6" width="36" height="3.5" rx="1.5" fill="#166534" opacity="0.5" />
                    <rect x="-18" y="0" width="36" height="3.5" rx="1.5" fill="#166534" opacity="0.5" />
                    <rect x="-18" y="6" width="36" height="3.5" rx="1.5" fill="#166534" opacity="0.6" />
                    <ellipse cx="-10" cy="-11" rx="14" ry="5" fill="rgba(255,255,255,0.06)" />
                </g>
                {/* Chloroplast 3 - lower right */}
                <g transform="translate(450, 350) rotate(40)">
                    <ellipse cx="2" cy="3" rx="33" ry="19" fill="rgba(0,0,0,0.15)" />
                    <ellipse cx="0" cy="0" rx="35" ry="20" fill="none" stroke="#15803d" strokeWidth="1.2" opacity="0.3" />
                    <ellipse cx="0" cy="0" rx="33" ry="19" fill="url(#chloroGrad)" stroke="#14532d" strokeWidth="1.5" />
                    <ellipse cx="0" cy="0" rx="33" ry="19" fill="url(#chloroHighlight)" />
                    <rect x="-15" y="-9" width="30" height="3" rx="1.5" fill="#166534" opacity="0.6" />
                    <rect x="-15" y="-3" width="30" height="3" rx="1.5" fill="#166534" opacity="0.5" />
                    <rect x="-15" y="3" width="30" height="3" rx="1.5" fill="#166534" opacity="0.5" />
                    <rect x="-15" y="9" width="30" height="3" rx="1.5" fill="#166534" opacity="0.6" />
                    <ellipse cx="-8" cy="-9" rx="12" ry="4" fill="rgba(255,255,255,0.06)" />
                </g>
            </g>

            {/* === 10. MITOCONDRIAS - with cristae === */}
            <g className={`organelle-region ${getRegionClass('mitocondria')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('mitocondria'); }}>
                {/* Mito 1 - upper right */}
                <g transform="rotate(-30, 420, 115)">
                    <ellipse cx="422" cy="121" rx="32" ry="16" fill="rgba(0,0,0,0.2)" />
                    <ellipse cx="420" cy="115" rx="35" ry="18" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.35" />
                    <ellipse cx="420" cy="115" rx="32" ry="16" fill="url(#mitoGrad1)" stroke="#c2410c" strokeWidth="2" />
                    <ellipse cx="420" cy="115" rx="32" ry="16" fill="url(#mitoHighlight1)" />
                    {/* Cristae */}
                    <path d="M400,111 Q403,103 400,116 Q398,123 400,118" fill="none" stroke="#fbbf24" strokeWidth="1.3" opacity="0.3" />
                    <path d="M410,109 Q413,101 410,115 Q408,122 410,117" fill="none" stroke="#fbbf24" strokeWidth="1.3" opacity="0.3" />
                    <path d="M420,108 Q423,100 420,115 Q418,123 420,117" fill="none" stroke="#fbbf24" strokeWidth="1.3" opacity="0.3" />
                    <path d="M430,109 Q433,102 430,116 Q428,122 430,117" fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.25" />
                    <path d="M438,111 Q440,105 438,117 Q437,121 438,118" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.2" />
                    {/* Matrix dots */}
                    <circle cx="406" cy="113" r="1.2" fill="#fcd34d" opacity="0.2" />
                    <circle cx="435" cy="117" r="1" fill="#fcd34d" opacity="0.15" />
                    {/* Specular */}
                    <ellipse cx="412" cy="109" rx="12" ry="4" fill="rgba(255,255,255,0.08)" />
                </g>
                {/* Mito 2 - lower center */}
                <g transform="rotate(10, 250, 400)">
                    <ellipse cx="251" cy="405" rx="27" ry="13" fill="rgba(0,0,0,0.15)" />
                    <ellipse cx="250" cy="400" rx="30" ry="15" fill="none" stroke="#d97706" strokeWidth="1.2" opacity="0.3" />
                    <ellipse cx="250" cy="400" rx="27" ry="13" fill="url(#mitoGrad2)" stroke="#c2410c" strokeWidth="1.5" />
                    {/* Cristae */}
                    <path d="M235,397 Q237,391 235,402 Q234,407 235,403" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.25" />
                    <path d="M245,396 Q247,390 245,401 Q244,406 245,402" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.25" />
                    <path d="M255,395 Q257,389 255,401 Q254,406 255,402" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.25" />
                    <path d="M264,397 Q266,392 264,402 Q263,406 264,403" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.2" />
                    <ellipse cx="243" cy="396" rx="10" ry="3.5" fill="rgba(255,255,255,0.06)" />
                </g>
            </g>

            {/* === 11. APARATO DE GOLGI - stacked cisternae with vesicles === */}
            <g className={`organelle-region ${getRegionClass('golgi')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('golgi'); }} filter="url(#dropShadow)">
                <g transform="translate(350, 390)">
                    {/* Cisternae with 3D thickness */}
                    {[0, 12, 24, 36].map((offset, i) => (
                        <g key={i}>
                            <path d={`M-35,${-10+offset} Q0,${-18+offset} 35,${-10+offset}`}
                                fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="7" strokeLinecap="round" />
                            <path d={`M-33,${-12+offset} Q0,${-20+offset} 33,${-12+offset}`}
                                fill="none" stroke="url(#golgiGrad)" strokeWidth={6 - i * 0.5} strokeLinecap="round"
                                opacity={0.9 - i * 0.1} />
                            <path d={`M-31,${-14+offset} Q0,${-22+offset} 31,${-14+offset}`}
                                fill="none" stroke="rgba(94,234,212,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                        </g>
                    ))}
                    {/* Budding vesicles */}
                    <circle cx="40" cy="-15" r="5" fill="url(#golgiVesicle)" stroke="#14b8a6" strokeWidth="0.8" opacity="0.7" />
                    <circle cx="45" cy="0" r="4" fill="url(#golgiVesicle)" stroke="#14b8a6" strokeWidth="0.6" opacity="0.6" />
                    <circle cx="-40" cy="28" r="4.5" fill="url(#golgiVesicle)" stroke="#14b8a6" strokeWidth="0.6" opacity="0.55" />
                    {/* Vesicle highlights */}
                    <circle cx="38" cy="-17" r="1.8" fill="rgba(255,255,255,0.2)" />
                    <circle cx="43" cy="-2" r="1.3" fill="rgba(255,255,255,0.15)" />
                </g>
            </g>

            {/* === 12. RIBOSOMAS - two-part structures === */}
            <g className={`organelle-region ${getRegionClass('ribosoma')}`}
                onClick={(e) => { e.stopPropagation(); onSelect('ribosoma'); }}>
                {[[200,350],[220,340],[250,360],[400,300],[420,310],[450,280],[100,150],[120,125]].map(([x,y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r="10" fill="transparent" />
                        <ellipse cx={x} cy={y+1} rx="3.2" ry="2.3" fill="url(#riboGrad)" opacity="0.8" />
                        <ellipse cx={x} cy={y-2} rx="2.3" ry="1.6" fill="#93c5fd" opacity="0.65" />
                        <circle cx={x-0.8} cy={y-2.5} r="0.7" fill="rgba(255,255,255,0.3)" />
                    </g>
                ))}
            </g>

            {/* ===== AMBIENT ANIMATIONS ===== */}
            {/* Vesicle from Golgi to cell wall */}
            <circle r="3" fill="url(#golgiVesicle)" opacity="0.4" pointerEvents="none">
                <animateMotion dur="8s" repeatCount="indefinite"
                    path="M385,375 Q400,360 450,330 Q490,310 500,380" />
            </circle>
            {/* ATP from mitochondria 1 */}
            <circle r="1.8" fill="#fbbf24" opacity="0.35" pointerEvents="none">
                <animateMotion dur="9s" repeatCount="indefinite"
                    path="M420,115 Q380,150 350,200 Q320,250 300,260" />
            </circle>
            {/* ATP from mitochondria 2 */}
            <circle r="1.5" fill="#fbbf24" opacity="0.3" pointerEvents="none">
                <animateMotion dur="7s" repeatCount="indefinite" begin="3s"
                    path="M250,400 Q230,350 200,300 Q180,270 160,260" />
            </circle>
            {/* Cytoplasmic streaming (ciclosis) */}
            <circle r="1.2" fill="rgba(134,239,172,0.2)" pointerEvents="none">
                <animateMotion dur="12s" repeatCount="indefinite"
                    path="M110,140 Q90,250 110,370 Q160,410 300,400 Q470,380 490,250 Q480,130 370,100 Q210,90 110,140" />
            </circle>
            <circle r="1" fill="rgba(134,239,172,0.15)" pointerEvents="none">
                <animateMotion dur="12s" repeatCount="indefinite" begin="4s"
                    path="M110,140 Q90,250 110,370 Q160,410 300,400 Q470,380 490,250 Q480,130 370,100 Q210,90 110,140" />
            </circle>
            {/* Photosynthesis particle from chloroplast */}
            <circle r="1.5" fill="#4ade80" opacity="0.3" pointerEvents="none" filter="url(#softGlow)">
                <animateMotion dur="6s" repeatCount="indefinite"
                    path="M370,125 Q350,170 320,220 Q300,250 310,270" />
            </circle>
        </svg>
    );
};

// ===== MAIN COMPONENT =====
const CelulaVegetal = () => {
    const navigate = useNavigate();
    const [selectedOrganelle, setSelectedOrganelle] = useState(null);
    const [visitedIds, setVisitedIds] = useState(new Set());

    const [mode, setMode] = useState('explore');
    const isQuizMode = mode === 'quiz';
    const isMatchMode = mode === 'match';

    const [quizTarget, setQuizTarget] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFeedback, setQuizFeedback] = useState(null);

    const [matchDifficulty, setMatchDifficulty] = useState(null);
    const [matchPairs, setMatchPairs] = useState([]);
    const [matchFunctions, setMatchFunctions] = useState([]);
    const [matchSelected, setMatchSelected] = useState(null);
    const [matchAnswers, setMatchAnswers] = useState({});
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [testGrade, setTestGrade] = useState(null);
    const [lastAssignedPair, setLastAssignedPair] = useState(null);

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

    const pickNextQuizTarget = useCallback(() => {
        const unvisited = organelleData.filter(o => !visitedIds.has(o.id));
        const pool = unvisited.length > 0 ? unvisited : organelleData;
        const random = pool[Math.floor(Math.random() * pool.length)];
        setQuizTarget(random);
        setQuizFeedback(null);
    }, [visitedIds]);

    const handleQuizInteraction = useCallback((id) => {
        if (!quizTarget || quizFeedback) return;
        const isCorrect = id === quizTarget.id;
        setQuizFeedback({ id, isCorrect });
        if (isCorrect) {
            setVisitedIds(prev => new Set(prev).add(id));
            setQuizScore(s => s + 10);
            setTimeout(() => pickNextQuizTarget(), 1500);
        } else {
            setTimeout(() => setQuizFeedback(null), 1000);
        }
    }, [quizTarget, quizFeedback, pickNextQuizTarget]);

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
        setMode(newMode);
        setSelectedOrganelle(null);
        setQuizTarget(null);
        setQuizFeedback(null);
        setMatchSelected(null);
        setMatchAnswers({});
        setTestSubmitted(false);
        setTestGrade(null);
        setMatchDifficulty(null);
        setLastAssignedPair(null);
        if (newMode === 'quiz') {
            setQuizScore(0);
            pickNextQuizTarget();
        }
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
        setLastAssignedPair(null);
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

    const submitTest = () => {
        let correct = 0;
        matchPairs.forEach(org => {
            if (matchAnswers[org.id] === org.id) correct++;
        });
        const grade = (correct / matchPairs.length) * 10;
        setTestGrade(grade);
        setTestSubmitted(true);
        setMatchSelected(null);
        if (grade >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899']
            });
        }
    };

    const getGradeEmoji = (g) => {
        if (g >= 9) return '🏆';
        if (g >= 7) return '🌟';
        if (g >= 5) return '👍';
        return '💪';
    };

    const getGradeLabel = (g) => {
        if (g >= 9) return 'Excelente';
        if (g >= 7) return 'Muy bien';
        if (g >= 5) return 'Aprobado';
        return 'Sigue practicando';
    };

    const progressPercent = (visitedIds.size / organelleData.length) * 100;

    return (
        <div className={`celula-app ${isQuizMode ? 'quiz-mode' : ''} ${isMatchMode ? 'match-mode' : ''}`}>
            <header className="celula-header">
                <div className="celula-header-left"></div>
                <div className="mode-switcher">
                    {zoom > 1.1 && (
                        <button className="mode-btn reset-zoom-btn" onClick={resetView} title="Restaurar zoom">
                            <ZoomOut size={14} /> <span>1:1</span>
                        </button>
                    )}
                    <button className={`mode-btn ${mode === 'explore' ? 'active' : ''}`} onClick={() => switchMode('explore')}>Explorar</button>
                    <button className={`mode-btn ${mode === 'quiz' ? 'active quiz-mode-active' : ''}`} onClick={() => switchMode('quiz')}>Test</button>
                    <button className={`mode-btn ${mode === 'match' ? 'active match-mode-active' : ''}`} onClick={() => switchMode('match')}>Reto</button>
                </div>
                {mode === 'explore' && (
                    <div className="celula-progress">
                        <span className="progress-text">{visitedIds.size}/{organelleData.length} explorados</span>
                        <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} /></div>
                    </div>
                )}
                {mode === 'quiz' && (
                    <div className="quiz-hud"><div className="quiz-score">Puntos: {quizScore}</div></div>
                )}
                {mode === 'match' && matchDifficulty !== null && !testSubmitted && (
                    <div className="quiz-hud">
                        <div className="quiz-score">{Object.keys(matchAnswers).length}/{matchPairs.length} asignados</div>
                    </div>
                )}
            </header>

            <div className="celula-fullscreen">
                <div ref={containerRef} className={`celula-svg-container ${selectedOrganelle ? 'has-selection' : ''}`}
                    style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
                    <CellDiagram
                        selectedId={mode === 'explore' ? selectedOrganelle : (quizFeedback?.id || null)}
                        visitedIds={visitedIds} onSelect={handleSelect}
                        isQuizMode={isQuizMode} quizTargetId={quizTarget?.id}
                        feedbackState={quizFeedback} viewBox={svgViewBox}
                    />

                    {/* Overlay labels */}
                    {mode === 'explore' && organelleData.map(org => {
                        if (!isLabelVisible(org.labelPos)) return null;
                        const style = getLabelStyle(org.labelPos);
                        return (
                            <div key={org.id} className={`organelle-label-marker ${selectedOrganelle === org.id ? 'active-marker' : ''}`} style={style}>
                                <div className={`organelle-dot ${visitedIds.has(org.id) ? 'visited' : ''} ${selectedOrganelle === org.id ? 'active' : ''}`}
                                    onClick={() => handleSelect(org.id)} />
                                <span className="organelle-name-tag" onClick={() => handleSelect(org.id)}>{org.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

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
            <div className={`celula-info-overlay ${selectedOrganelle ? 'open' : ''}`}>
                {organelleData.map(org => {
                    if (org.id !== selectedOrganelle) return null;
                    return (
                        <div className="celula-info-card" key={org.id}>
                            <button className="floating-close-btn" onClick={() => setSelectedOrganelle(null)} title="Cerrar panel">
                                <X size={18} />
                            </button>
                            <div className="organelle-detail">
                                <div className="detail-header">
                                    <div className="detail-header-top">
                                        <div className="detail-title-group">
                                            <div className="detail-icon-wrapper"><span className="detail-icon">{org.icon}</span></div>
                                            <div className="detail-title-stack">
                                                <h2 className="detail-title">{org.name}</h2>
                                                <div className="detail-subtitle">{org.subtitle}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-body">
                                    <div className="detail-description-card">
                                        <Info className="description-icon" size={16} />
                                        <p className="detail-description">{org.description}</p>
                                    </div>
                                    <div className="detail-grid">
                                        <div className="detail-section">
                                            <h3 className="detail-section-title"><Activity size={14} className="section-icon" /><span>Funciones</span></h3>
                                            <ul className="detail-list">{org.functions.map((f, i) => <li key={i}>{f}</li>)}</ul>
                                        </div>
                                        <div className="detail-section">
                                            <h3 className="detail-section-title"><Box size={14} className="section-icon" /><span>Estructura</span></h3>
                                            <p className="detail-text">{org.structure}</p>
                                        </div>
                                    </div>
                                    <div className="fun-fact-card">
                                        <div className="fun-fact-header"><Lightbulb size={16} className="fun-fact-icon" /><h4>¿Sabías que...?</h4></div>
                                        <p className="fun-fact-text">{org.funFact}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* QUIZ UI OVERLAYS */}
            {isQuizMode && quizTarget && (
                <div className="quiz-target-box">
                    <div className="quiz-target-icon"><Target size={20} /></div>
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

            {/* ===== RETO MODE UI ===== */}
            {isMatchMode && (
                <div className="match-game-overlay">
                    <div className="match-game-panel">
                        {matchDifficulty === null ? (
                            <>
                                <div className="match-panel-header">
                                    <div><h3 className="match-title">🎯 Reto: Relaciona orgánulo y función</h3><p className="match-instruction">Elige la dificultad del reto.</p></div>
                                    <button className="match-exit-btn" onClick={() => switchMode('explore')}>✕ Salir</button>
                                </div>
                                <div className="difficulty-picker">
                                    <button className="difficulty-btn difficulty-easy" onClick={() => startMatchWithDifficulty(6)}><span className="difficulty-count">6</span><span className="difficulty-label">Fácil</span></button>
                                    <button className="difficulty-btn difficulty-medium" onClick={() => startMatchWithDifficulty(9)}><span className="difficulty-count">9</span><span className="difficulty-label">Normal</span></button>
                                    <button className="difficulty-btn difficulty-hard" onClick={() => startMatchWithDifficulty(12)}><span className="difficulty-count">12</span><span className="difficulty-label">Difícil</span></button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="match-panel-header">
                                    <div><h3 className="match-title">🎯 Reto: Relaciona orgánulo y función</h3><p className="match-instruction">{!testSubmitted ? 'Asigna las funciones.' : 'Resultados.'}</p></div>
                                    <button className="match-exit-btn" onClick={() => switchMode('explore')}>✕ Salir</button>
                                </div>
                                <div className="match-columns">
                                    <div className="match-col match-col-left">
                                        <div className="match-col-header">Orgánulo</div>
                                        {matchPairs.map(org => {
                                            const answered = matchAnswers[org.id] !== undefined;
                                            const isCorrect = testSubmitted && matchAnswers[org.id] === org.id;
                                            const isWrong = testSubmitted && answered && matchAnswers[org.id] !== org.id;
                                            const animKey = `${org.id}-${matchAnswers[org.id] || 'none'}`;
                                            return (
                                                <button key={animKey} className={`match-item match-organelle ${matchSelected === org.id ? 'selected' : ''} ${answered && !testSubmitted ? 'answered' : ''} ${isCorrect ? 'result-correct' : ''} ${isWrong ? 'result-wrong' : ''}`}
                                                    onClick={() => handleMatchOrganelleClick(org.id)} disabled={testSubmitted}>
                                                    <span className="match-item-icon">{org.icon}</span><span className="match-item-name">{org.name}</span>
                                                    {answered && !testSubmitted && <span className="match-remove-btn" onClick={(e) => { e.stopPropagation(); removeMatch(org.id); }} title="Descartar pareja"><X size={14} /></span>}
                                                    {testSubmitted && isCorrect && <CheckCircle2 size={16} className="match-check" />}
                                                    {testSubmitted && isWrong && <XCircle size={16} className="match-wrong-icon" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="match-col match-col-right">
                                        <div className="match-col-header">Función</div>
                                        {matchFunctions.map((func, idx) => {
                                            const assignedOrg = Object.entries(matchAnswers).find(([, fId]) => fId === func.id)?.[0];
                                            const isAssigned = assignedOrg !== undefined;
                                            const isCorrect = testSubmitted && assignedOrg === func.id;
                                            const isWrong = testSubmitted && isAssigned && assignedOrg !== func.id;
                                            const assignedOrgData = isAssigned ? matchPairs.find(o => o.id === assignedOrg) : null;
                                            const animKey = `${func.id}-${idx}-${assignedOrg || 'none'}`;
                                            return (
                                                <button key={animKey} className={`match-item match-function ${isAssigned && !testSubmitted ? 'answered' : ''} ${isCorrect ? 'result-correct' : ''} ${isWrong ? 'result-wrong' : ''}`}
                                                    onClick={() => handleMatchFunctionClick(func)} disabled={testSubmitted}>
                                                    <span className="match-func-text">{func.label}</span>
                                                    {isAssigned && !testSubmitted && <span className="match-assigned-tag">{assignedOrgData?.icon}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {!testSubmitted && <div className="match-actions"><button className={`match-submit-btn ${Object.keys(matchAnswers).length >= matchPairs.length ? 'ready' : ''}`} onClick={submitTest} disabled={Object.keys(matchAnswers).length < matchPairs.length}>Corregir</button></div>}
                                {testSubmitted && (
                                    <div className={`match-results ${testGrade >= 5 ? 'pass' : 'fail'}`}>
                                        <div className="match-grade-display">
                                            <span className="match-grade-emoji">{getGradeEmoji(testGrade)}</span>
                                            <span className="match-grade-number">{testGrade.toFixed(1)}</span>
                                            <span className="match-grade-max">/10</span>
                                        </div>
                                        <div className="match-grade-label">{getGradeLabel(testGrade)}</div>
                                        <div className="match-results-actions">
                                            <button className="match-replay-btn" onClick={() => initMatchGame(matchDifficulty)}>Repetir</button>
                                            <button className="match-exit-btn-bottom" onClick={() => switchMode('explore')}>Volver</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {mode === 'explore' && (
                <div className="organelle-selector-dock">
                    <div className="dock-container">
                        {organelleData.map(org => (
                            <button key={org.id} className={`dock-item ${selectedOrganelle === org.id ? 'active' : ''} ${visitedIds.has(org.id) ? 'visited' : ''}`}
                                onClick={() => handleSelect(org.id)}>
                                <span className="dock-icon">{org.icon}</span><div className="dock-tooltip">{org.name}</div>
                                {visitedIds.has(org.id) && <div className="visited-indicator" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CelulaVegetal;
