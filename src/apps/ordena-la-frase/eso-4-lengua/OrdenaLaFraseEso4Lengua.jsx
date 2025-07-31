// src/apps/ordena-la-frase-eso-4-lengua/OrdenaLaFraseEso4Lengua.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La Generación del 27 supuso la cumbre de la poesía española del siglo XX.",
    "El estallido de la Guerra Civil truncó la trayectoria de muchos autores.",
    "La novela de posguerra reflejó el pesimismo y la angustia de la época.",
    "Camilo José Cela, con 'La familia de Pascual Duarte', inauguró el tremendismo.",
    "El teatro de Antonio Buero Vallejo se caracteriza por el simbolismo y la crítica social.",
    "La literatura hispanoamericana alcanzó su apogeo con el 'boom' de los años 60.",
    "Gabriel García Márquez es el autor de la aclamada novela 'Cien años de soledad'.",
    "Las oraciones subordinadas adverbiales pueden ser de tiempo, lugar, modo o causa.",
    "Las proposiciones concesivas expresan un obstáculo que no impide la acción principal.",
    "El complemento indirecto se puede sustituir por los pronombres 'le' o 'les'.",
    "Los verbos pronominales son aquellos que se conjugan con un pronombre reflexivo.",
    "El Modernismo, liderado por Rubén Darío, buscaba la belleza formal y la musicalidad.",
    "Juan Ramón Jiménez evolucionó desde el Modernismo hacia una poesía pura.",
    "El Novecentismo se caracteriza por el intelectualismo y el rechazo al sentimentalismo.",
    "Las vanguardias, como el surrealismo, exploraron nuevas formas de expresión artística.",
    "La metáfora es una figura retórica que identifica un término real con uno imaginario.",
    "El comentario de texto requiere analizar el contenido, la estructura y el estilo.",
    "La adecuación es la propiedad textual por la que el texto se adapta a la situación comunicativa.",
    "La coherencia garantiza que el texto tenga un significado global y unitario.",
    "Los mecanismos de cohesión, como los conectores, enlazan las partes de un texto.",
    "El español presenta una gran diversidad dialectal en España y América.",
    "El seseo es un fenómeno fonético característico del español meridional y de América.",
    "Las lenguas de España, como el catalán, el gallego y el euskera, son cooficiales.",
    "La literatura de los años 50 se centró en la denuncia social y el realismo.",
    "Miguel Delibes retrató la vida rural de Castilla en sus novelas.",
    "El teatro del absurdo, con autores como Ionesco, rompe con la lógica tradicional.",
    "Las proposiciones subordinadas sustantivas pueden funcionar como sujeto o complemento directo.",
    "La aposición es un complemento del nombre que se escribe entre comas.",
    "El vocativo es un elemento que sirve para llamar la atención del receptor.",
    "El lenguaje periodístico debe ser claro, conciso y objetivo.",
    "La noticia responde a las preguntas básicas sobre un acontecimiento.",
    "El reportaje profundiza en un tema de actualidad con más detalle.",
    "La entrevista es un diálogo entre un periodista y un personaje de interés.",
    "La literatura actual se caracteriza por la diversidad de temas y estilos.",
    "El epíteto es un adjetivo que resalta una cualidad inherente del sustantivo.",
    "La elipsis consiste en omitir elementos de una frase que se sobreentienden.",
    "El hipérbaton es la alteración del orden lógico de las palabras en una oración.",
    "La personificación atribuye cualidades humanas a seres inanimados o animales.",
    "El léxico de una lengua está en constante evolución y cambio.",
    "Los neologismos son palabras nuevas que se incorporan a un idioma."
];

const OrdenaLaFraseEso4Lengua = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso4Lengua;
