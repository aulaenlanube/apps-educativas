// src/apps/ordena-la-frase-eso-3-lengua/OrdenaLaFraseEso3Lengua.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "Las oraciones subordinadas sustantivas equivalen a un sustantivo.",
    "El Romanticismo valora los sentimientos y la libertad individual.",
    "Gustavo Adolfo Bécquer es un autor clave del posromanticismo español.",
    "El Realismo literario busca reflejar la sociedad de su época fielmente.",
    "Benito Pérez Galdós escribió los 'Episodios Nacionales'.",
    "La Generación del 98 reflexionó sobre la situación de España.",
    "Antonio Machado es un poeta representativo de la Generación del 98.",
    "Las vanguardias artísticas rompieron con el arte tradicional a principios del siglo XX.",
    "La Generación del 27 combinó la tradición poética con la modernidad.",
    "Federico García Lorca fue un miembro destacado de la Generación del 27.",
    "El complemento predicativo concuerda con el sujeto o con el complemento directo.",
    "Las proposiciones subordinadas adjetivas funcionan como un adjetivo.",
    "El pronombre 'que' es el nexo más común en las subordinadas adjetivas.",
    "Las proposiciones subordinadas adverbiales indican circunstancias como tiempo, lugar o modo.",
    "Un texto periodístico de opinión expresa el punto de vista del autor.",
    "La crónica es un género que mezcla la noticia con la interpretación personal.",
    "La cohesión textual se consigue mediante conectores y referencias.",
    "El Barroco es un movimiento cultural caracterizado por el contraste y la ornamentación.",
    "Luis de Góngora y Francisco de Quevedo fueron poetas barrocos rivales.",
    "El 'Cantar de mio Cid' es un ejemplo de mester de juglaría.",
    "La oración compuesta contiene más de un verbo en forma personal.",
    "Las proposiciones coordinadas se unen mediante conjunciones como 'y', 'o', 'pero'.",
    "El complemento agente realiza la acción en las oraciones en voz pasiva.",
    "La literatura neoclásica del siglo XVIII buscaba la razón y el orden.",
    "José de Espronceda es un importante poeta del Romanticismo español.",
    "Leopoldo Alas 'Clarín' escribió 'La Regenta', una obra cumbre del Realismo.",
    "El Modernismo, con Rubén Darío, renovó el lenguaje poético en español.",
    "Miguel de Unamuno fue un autor central de la Generación del 98.",
    "El surrealismo es una vanguardia que explora el mundo de los sueños.",
    "El 'Romancero Gitano' es una de las obras más conocidas de Lorca.",
    "El atributo es el complemento que nombra una cualidad del sujeto con verbos copulativos.",
    "Las oraciones subordinadas se clasifican en sustantivas, adjetivas y adverbiales.",
    "El artículo de opinión es un texto periodístico firmado por su autor.",
    "La coherencia es la propiedad que da unidad y sentido a un texto.",
    "La lírica expresa los sentimientos y emociones del poeta.",
    "El soneto es una composición poética de catorce versos endecasílabos.",
    "La tragedia es un subgénero teatral con un desenlace funesto.",
    "La comedia busca provocar la risa del espectador con situaciones divertidas.",
    "El texto expositivo tiene como finalidad informar sobre un tema de forma objetiva.",
    "La deixis es la función de algunos elementos que señalan a un referente."
];

const OrdenaLaFraseEso3Lengua = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso3Lengua;
