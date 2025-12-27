// src/apps/mesa-crafteo/periodicTable.js

export const elements = [
    // Period 1
    { symbol: 'H', name: 'Hidrógeno', atomicNumber: 1, color: '#FFFFFF', category: 'non-metal', icon: '☁️', pos: [1, 1] },
    { symbol: 'He', name: 'Helio', atomicNumber: 2, color: '#FFB6C1', category: 'noble-gas', icon: '🎈', pos: [1, 18] },

    // Period 2
    { symbol: 'Li', name: 'Litio', atomicNumber: 3, color: '#E6E6FA', category: 'alkali-metal', icon: '🔋', pos: [2, 1] },
    { symbol: 'Be', name: 'Berilio', atomicNumber: 4, color: '#C2FF00', category: 'alkaline-earth', icon: '💎', pos: [2, 2] },
    { symbol: 'B', name: 'Boro', atomicNumber: 5, color: '#FFDAB9', category: 'metalloid', icon: '🧪', pos: [2, 13] },
    { symbol: 'C', name: 'Carbono', atomicNumber: 6, color: '#333333', category: 'non-metal', icon: '⬛', pos: [2, 14] },
    { symbol: 'N', name: 'Nitrógeno', atomicNumber: 7, color: '#3050F8', category: 'non-metal', icon: '🌬️', pos: [2, 15] },
    { symbol: 'O', name: 'Oxígeno', atomicNumber: 8, color: '#FF0D0D', category: 'non-metal', icon: '🔥', pos: [2, 16] },
    { symbol: 'F', name: 'Flúor', atomicNumber: 9, color: '#90E050', category: 'halogen', icon: '🦷', pos: [2, 17] },
    { symbol: 'Ne', name: 'Neón', atomicNumber: 10, color: '#B3E3F5', category: 'noble-gas', icon: '🚨', pos: [2, 18] },

    // Period 3
    { symbol: 'Na', name: 'Sodio', atomicNumber: 11, color: '#AB5CF2', category: 'alkali-metal', icon: '🧂', pos: [3, 1] },
    { symbol: 'Mg', name: 'Magnesio', atomicNumber: 12, color: '#8AFF00', category: 'alkaline-earth', icon: '💥', pos: [3, 2] },
    { symbol: 'Al', name: 'Aluminio', atomicNumber: 13, color: '#BFA6A6', category: 'post-transition', icon: '🥫', pos: [3, 13] },
    { symbol: 'Si', name: 'Silicio', atomicNumber: 14, color: '#F0C8A0', category: 'metalloid', icon: '💻', pos: [3, 14] },
    { symbol: 'P', name: 'Fósforo', atomicNumber: 15, color: '#FF8000', category: 'non-metal', icon: '🎇', pos: [3, 15] },
    { symbol: 'S', name: 'Azufre', atomicNumber: 16, color: '#FFFF30', category: 'non-metal', icon: '🌋', pos: [3, 16] },
    { symbol: 'Cl', name: 'Cloro', atomicNumber: 17, color: '#1FF01F', category: 'halogen', icon: '🧼', pos: [3, 17] },
    { symbol: 'Ar', name: 'Argón', atomicNumber: 18, color: '#C3E3F5', category: 'noble-gas', icon: '💡', pos: [3, 18] },

    // Period 4 (Partial - Main ones)
    { symbol: 'K', name: 'Potasio', atomicNumber: 19, color: '#8F40D4', category: 'alkali-metal', icon: '🍌', pos: [4, 1] },
    { symbol: 'Ca', name: 'Calcio', atomicNumber: 20, color: '#3DFF00', category: 'alkaline-earth', icon: '🥛', pos: [4, 2] },
    { symbol: 'Fe', name: 'Hierro', atomicNumber: 26, color: '#FFA500', category: 'transition-metal', icon: '⛓️', pos: [4, 8] },
    { symbol: 'Cu', name: 'Cobre', atomicNumber: 29, color: '#C88033', category: 'transition-metal', icon: '🥉', pos: [4, 11] },
    { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, color: '#7D80B0', category: 'transition-metal', icon: '🔩', pos: [4, 12] },
    { symbol: 'Br', name: 'Bromo', atomicNumber: 35, color: '#A62929', category: 'halogen', icon: '🧪', pos: [4, 17] },

    // Others
    { symbol: 'Ag', name: 'Plata', atomicNumber: 47, color: '#C0C0C0', category: 'transition-metal', icon: '🥈', pos: [5, 11] },
    { symbol: 'I', name: 'Yodo', atomicNumber: 53, color: '#9400D3', category: 'halogen', icon: '🟣', pos: [5, 17] },
    { symbol: 'Au', name: 'Oro', atomicNumber: 79, color: '#FFD700', category: 'transition-metal', icon: '🥇', pos: [6, 11] },
    { symbol: 'Hg', name: 'Mercurio', atomicNumber: 80, color: '#B8B8B8', category: 'transition-metal', icon: '🌡️', pos: [6, 12] },
    { symbol: 'Pb', name: 'Plomo', atomicNumber: 82, color: '#575961', category: 'post-transition', icon: '⚖️', pos: [6, 14] },
];

export const families = {
    'alkali-metal': { label: 'Metales Alcalinos', color: '#f87171' },
    'alkaline-earth': { label: 'Alcalinotérreos', color: '#fb923c' },
    'transition-metal': { label: 'Metales de Transición', color: '#f472b6' },
    'post-transition': { label: 'Metales del bloque p', color: '#94a3b8' },
    'metalloid': { label: 'Metaloides', color: '#2dd4bf' },
    'non-metal': { label: 'No Metales', color: '#4ade80' },
    'halogen': { label: 'Halógenos', color: '#facc15' },
    'noble-gas': { label: 'Gases Nobles', color: '#60a5fa' },
    'lanthanide': { label: 'Lantánidos', color: '#a78bfa' },
    'actinide': { label: 'Actínidos', color: '#c084fc' },
    'unknown': { label: 'Desconocido', color: '#cbd5e1' }
};
