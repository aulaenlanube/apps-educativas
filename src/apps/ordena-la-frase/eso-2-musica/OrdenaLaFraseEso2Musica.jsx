// src/apps/ordena-la-frase-eso-2-musica/OrdenaLaFraseEso2Musica.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La melodía es una sucesión de sonidos con una organización coherente.",
    "La armonía consiste en la combinación de varios sonidos simultáneos.",
    "El ritmo organiza los sonidos y silencios en el tiempo.",
    "Una escala musical es un conjunto de notas ordenadas de grave a agudo.",
    "Los acordes se forman al tocar tres o más notas a la vez.",
    "La textura musical se refiere a cómo se combinan las diferentes voces o líneas melódicas.",
    "La música medieval estaba muy ligada a la Iglesia y al canto gregoriano.",
    "El Renacimiento fue una época de desarrollo de la polifonía vocal.",
    "El Barroco se caracteriza por el contraste y la ornamentación en la música.",
    "Johann Sebastian Bach fue uno de los grandes compositores del Barroco.",
    "El Clasicismo musical busca la claridad, el equilibrio y la proporción.",
    "Mozart y Haydn son los principales representantes del Clasicismo.",
    "El Romanticismo musical expresa emociones y sentimientos de forma intensa.",
    "Beethoven es una figura clave en la transición del Clasicismo al Romanticismo.",
    "La orquesta sinfónica se organiza en familias de instrumentos.",
    "La familia de cuerda frotada incluye el violín, la viola, el violonchelo y el contrabajo.",
    "La flauta travesera y el clarinete pertenecen a la familia de viento madera.",
    "La trompeta y el trombón son instrumentos de la familia de viento metal.",
    "El jazz es un estilo musical que nació en Estados Unidos.",
    "La improvisación es una característica fundamental del jazz.",
    "El rock and roll surgió en la década de 1950 con artistas como Elvis Presley.",
    "La música pop se caracteriza por sus melodías pegadizas y estribillos.",
    "La música de cine ayuda a crear la atmósfera de una película.",
    "Un musicograma es una representación gráfica de una obra musical.",
    "La forma musical es la estructura y organización de una pieza.",
    "El rondó es una forma musical con un estribillo que se repite.",
    "Una sonata es una composición para uno o dos instrumentos.",
    "La ópera combina música, teatro, canto y escenografía.",
    "El flamenco es un género musical tradicional de Andalucía.",
    "La voz humana es el instrumento musical más antiguo.",
    "Las voces se clasifican en soprano, contralto, tenor y bajo.",
    "El blues es un género vocal e instrumental basado en la utilización de notas de blues.",
    "La síncopa es un ritmo que rompe la regularidad del compás.",
    "Un ostinato es un motivo rítmico o melódico que se repite constantemente.",
    "La música electrónica utiliza instrumentos y tecnología electrónica.",
    "Un DJ es un artista que crea y mezcla música grabada.",
    "La contaminación acústica es el exceso de sonido que altera el ambiente.",
    "El pentagrama es el conjunto de cinco líneas donde se escribe la música.",
    "La dinámica musical indica los diferentes grados de intensidad o volumen.",
    "El folclore es el conjunto de tradiciones y música de un pueblo."
];

const OrdenaLaFraseEso2Musica = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso2Musica;
