
// Mapa extendido de colores específicos por elemento (CPK y variaciones para contraste en fondo oscuro)
export const ELEMENT_COLORS = {
    // Hidrógeno (Blanco/Gris muy claro)
    'H': '#FFFFFF',

    // Carbono (Verde Vivo) - Cambiado de gris oscuro a petición del usuario
    'C': '#22C55E',

    // Nitrógeno (Azul)
    'N': '#3050F8',

    // Oxígeno (Rojo)
    'O': '#FF0D0D',

    // Flúor (Verde)
    'F': '#90E050',

    // Cloro (Verde)
    'Cl': '#1FF01F',

    // Bromo (Rojo oscuro/Marrón)
    'Br': '#A62929',

    // Yodo (Violeta oscuro)
    'I': '#940094',

    // Gases Nobles (Cian/Azul claro)
    'He': '#40FFFF',
    'Ne': '#B3E2F5',
    'Ar': '#80D1E3',
    'Kr': '#5CB8D1',
    'Xe': '#429EB0',

    // Fósforo (Naranja)
    'P': '#FF8000',

    // Azufre (Amarillo)
    'S': '#FFFF30',

    // Boro (Rosa/Beige)
    'B': '#FFB5B5',

    // Metales Alcalinos (Violeta/Lila)
    'Li': '#CC80FF',
    'Na': '#AB5CF2',
    'K': '#8F40D4',
    'Rb': '#702EB0',
    'Cs': '#57178F',

    // Alcalinotérreos (Verde oscuro)
    'Be': '#C2FF00',
    'Mg': '#8AFF00',
    'Ca': '#3DFF00',
    'Sr': '#00FF00',
    'Ba': '#00C900',

    // Metales de transición (Gris/Plata/Varios)
    'Fe': '#E06633', // Hierro (Naranja óxido)
    'Cu': '#C88033', // Cobre (Bronce)
    'Ag': '#C0C0C0', // Plata
    'Au': '#FFD123', // Oro
    'Zn': '#7D80B0', // Zinc (Azulado)
    'Hg': '#B8B8D0', // Mercurio

    // Otros comunes
    'Al': '#BFA6A6', // Aluminio
    'Si': '#F0C8A0', // Silicio
    'Pb': '#575961', // Plomo
    'Sn': '#668080', // Estaño
};

export const getElementColor = (symbol, category) => {
    // 1. Check specific element color first
    if (ELEMENT_COLORS[symbol]) {
        return ELEMENT_COLORS[symbol];
    }

    // 2. Fallback to family color
    if (category && FAMILIES[category]) {
        return FAMILIES[category].color;
    }

    // 3. Default fallback
    return '#CCCCCC';
};
