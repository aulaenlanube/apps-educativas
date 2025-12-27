// src/apps/_shared/QuimicaHelpers.js

export const FAMILIES = {
    'alkali-metal': { label: 'Metales Alcalinos', color: '#f87171' },
    'alkaline-earth': { label: 'Alcalinotérreos', color: '#fb923c' },
    'transition-metal': { label: 'Metales de Transición', color: '#f472b6' },
    'transition': { label: 'Metales de Transición', color: '#f472b6' },
    'post-transition': { label: 'Metales del bloque p', color: '#94a3b8' },
    'metalloid': { label: 'Metaloides', color: '#2dd4bf' },
    'non-metal': { label: 'No Metales', color: '#4ade80' },
    'halogen': { label: 'Halógenos', color: '#facc15' },
    'noble-gas': { label: 'Gases Nobles', color: '#60a5fa' },
    'lanthanide': { label: 'Lantánidos', color: '#a78bfa' },
    'actinide': { label: 'Actínidos', color: '#c084fc' },
    'unknown': { label: 'Desconocido', color: '#cbd5e1' }
};

export const normalizeString = (str) => {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};
