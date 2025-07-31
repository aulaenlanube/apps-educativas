// src/apps/ordena-la-historia/eso-4-lengua/OrdenaLaHistoriaEso4Lengua.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La literatura de posguerra en España estuvo marcada por la censura y el pesimismo.", "En los años 40, surgió una novela existencialista con obras como 'Nada' de Carmen Laforet.", "En los 50, el realismo social se centró en denunciar las duras condiciones de vida.", "Autores como Camilo José Cela o Miguel Delibes retrataron la sociedad de la época.", "El teatro también reflejó estas inquietudes, con dramaturgos como Buero Vallejo.", "Esta literatura es un testimonio fundamental de un período oscuro de la historia de España."],
    ["El 'boom' latinoamericano fue un fenómeno literario de los años 60 y 70.", "Un grupo de novelistas de Latinoamérica alcanzó un éxito internacional sin precedentes.", "Autores como Gabriel García Márquez, Mario Vargas Llosa o Julio Cortázar renovaron la narrativa.", "Introdujeron técnicas innovadoras como el realismo mágico.", "Sus obras exploraban la compleja realidad social y política de sus países.", "Cien años de soledad' es quizás la novela más emblemática de este movimiento."],
    ["Una oración subordinada adverbial impropia no se puede sustituir por un adverbio.", "Expresan relaciones lógicas complejas como la causa, la consecuencia o la condición.", "Las condicionales, introducidas por 'si', plantean una hipótesis para que se cumpla la principal.", "Las concesivas, con nexos como 'aunque', expresan un obstáculo que no impide la acción.", "Las consecutivas, con nexos como 'así que', indican la consecuencia de la acción principal."],
    ["Para analizar un texto periodístico de opinión, como un editorial, debemos seguir unos pasos.", "Primero, identificamos la tesis o idea principal que defiende el autor.", "Luego, localizamos los argumentos que utiliza para apoyar su postura.", "Es importante valorar si los argumentos son sólidos y están bien fundamentados.", "También debemos analizar el lenguaje utilizado, que suele ser subjetivo y persuasivo.", "Finalmente, redactamos nuestra propia opinión crítica sobre el texto."],
    ["La poesía de la Generación del 27 evolucionó a lo largo de varias etapas.", "En su juventud, sintieron la influencia de la poesía pura y las vanguardias.", "Durante la República, muchos de ellos cultivaron una poesía de compromiso social y político.", "Tras la Guerra Civil, el exilio y la muerte marcaron la obra de muchos de sus miembros.", "Poetas como Lorca, Cernuda o Aleixandre dejaron una huella imborrable en la literatura.", "Su trayectoria refleja las convulsiones de la historia de España en el siglo XX."],
    ["El español es una lengua rica y diversa hablada por millones de personas.", "Presenta diferentes variedades dialectales dentro de la Península Ibérica, como el andaluz o el extremeño.", "El español de América también tiene sus propias características fonéticas y léxicas.", "Además, en España coexisten otras lenguas oficiales como el catalán, el gallego y el euskera.", "Esta diversidad lingüística es un patrimonio cultural que debemos valorar y proteger."],
    ["La novela desde 1975 hasta la actualidad ha seguido caminos muy diversos.", "Con la llegada de la democracia, los escritores gozaron de total libertad creativa.", "Se recuperaron obras y autores que habían sido censurados durante el franquismo.", "Surgieron nuevas tendencias como la novela histórica, la novela negra o la autoficción.", "La literatura actual refleja la complejidad y pluralidad de la sociedad contemporánea."],
    ["Una oración subordinada es aquella que depende sintácticamente de una oración principal.", "No tiene autonomía y desempeña una función dentro de la oración principal.", "Las sustantivas equivalen a un sustantivo, como en 'Dijo que vendría'.", "Las adjetivas complementan a un nombre, como en 'La casa que compré es grande'.", "Las adverbiales expresan circunstancias, como en 'Iré cuando pueda'."]
];

const OrdenaLaHistoriaEso4Lengua = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso4Lengua;
