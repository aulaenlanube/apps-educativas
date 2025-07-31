// src/apps/ordena-la-historia/eso-2-musica/OrdenaLaHistoriaEso2Musica.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La música del Barroco se caracteriza por su gran ornamentación y contraste.", "Compositores como Bach y Vivaldi crearon obras de gran complejidad.", "Nació la orquesta y se desarrollaron formas musicales como el concierto.", "Buscaba emocionar y asombrar al oyente con su dramatismo."],
    ["El Clasicismo musical, en el siglo XVIII, buscaba la belleza y la perfección formal.", "La música se volvió más elegante, equilibrada y clara.", "Mozart y Haydn son los compositores más representativos de este período.", "La sinfonía y la sonata se convirtieron en las formas más importantes."],
    ["El Romanticismo musical del siglo XIX dio prioridad a la expresión de los sentimientos.", "Los compositores buscaban la libertad creativa y la originalidad.", "Beethoven fue una figura fundamental en la transición hacia este nuevo estilo.", "La música se hizo más personal, dramática y grandiosa."],
    ["El jazz es un género musical que nació a finales del siglo XIX en Estados Unidos.", "Surgió de la fusión de la música africana y la música europea.", "Una de sus características más importantes es la improvisación.", "Artistas como Louis Armstrong o Duke Ellington lo hicieron famoso en todo el mundo."],
    ["Una orquesta sinfónica agrupa los instrumentos en tres familias principales.", "La familia de cuerda, con violines y violonchelos, es la más numerosa.", "La familia de viento incluye instrumentos de madera y de metal.", "La familia de percusión se encarga de la base rítmica.", "El director es el encargado de coordinar a todos los músicos."],
    ["La textura musical describe cómo se combinan las diferentes líneas melódicas.", "La monofonía consiste en una sola línea melódica sin acompañamiento.", "La polifonía combina varias líneas melódicas independientes a la vez.", "La melodía acompañada presenta una melodía principal con un soporte de acordes."],
    ["La voz humana es el instrumento más natural y expresivo.", "Se clasifica según su tesitura, de la más aguda a la más grave.", "Las voces femeninas son soprano, mezzosoprano y contralto.", "Las voces masculinas son tenor, barítono y bajo.", "Un coro es un grupo de cantantes que interpretan una obra juntos."],
    ["La forma sonata es una estructura musical muy importante en el Clasicismo.", "Consta de tres partes principales: exposición, desarrollo y reexposición.", "En la exposición se presentan los dos temas musicales principales.", "El desarrollo explora y transforma creativamente esos temas.", "La reexposición vuelve a presentar los temas para concluir la obra."],
    ["La música de cine es fundamental para crear la atmósfera de una película.", "Puede generar tensión en una escena de suspense.", "Puede evocar alegría en un momento feliz o tristeza en un drama.", "Compositores como John Williams han creado bandas sonoras inolvidables."],
    ["El flamenco es un arte tradicional de Andalucía que combina cante, toque y baile.", "El cante es el elemento fundamental y expresa profundos sentimientos.", "El toque se refiere a la guitarra flamenca que acompaña al cante.", "El baile es una expresión corporal llena de fuerza y pasión."]
];

const OrdenaLaHistoriaEso2Musica = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso2Musica;
