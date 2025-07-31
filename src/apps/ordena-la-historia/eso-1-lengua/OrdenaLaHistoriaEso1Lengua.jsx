// src/apps/ordena-la-historia/eso-1-lengua/OrdenaLaHistoriaEso1Lengua.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El autor comenzó a escribir el primer capítulo de su novela.", "Desarrolló a los personajes principales, dándoles vida y personalidad.", "Creó un conflicto emocionante que mantendría al lector enganchado.", "Finalmente, escribió un desenlace sorprendente e inesperado.", "La novela se convirtió en un gran éxito de ventas."],
    ["El juglar llegó a la plaza del castillo para entretener a la corte.", "Recitó de memoria los versos del Cantar de mio Cid.", "Narró las hazañas del héroe castellano y sus batallas.", "El público escuchaba con gran atención y emoción.", "Al terminar, todos aplaudieron su magnífica actuación."],
    ["Para analizar una oración, primero localizamos el verbo principal.", "Luego, identificamos el sujeto preguntando al verbo '¿quién o quiénes?'.", "Todo lo que no es sujeto forma parte del predicado.", "Dentro del predicado, buscamos los diferentes complementos.", "Así, completamos el análisis sintáctico de la oración."],
    ["Un cuento es una narración breve de hechos imaginarios.", "Suele tener pocos personajes para centrar la acción.", "Su estructura se divide en planteamiento, nudo y desenlace.", "El objetivo principal del cuento es entretener al lector."],
    ["La comunicación requiere un emisor que envía un mensaje.", "El receptor es quien recibe e interpreta dicho mensaje.", "El mensaje se transmite a través de un canal específico.", "Todo ello ocurre dentro de un contexto o situación comunicativa."],
    ["El sustantivo es la palabra que nombra a personas, animales, cosas o ideas.", "Puede ir acompañado de un determinante que lo presenta.", "Un adjetivo puede añadirle una cualidad o característica.", "El sustantivo funciona como el núcleo del grupo nominal."],
    ["El poeta buscaba inspiración para escribir un soneto.", "Observó la belleza de una puesta de sol en el mar.", "Escribió catorce versos endecasílabos con rima consonante.", "En el poema, expresó sus sentimientos de melancolía y admiración.", "Logró crear una obra de gran belleza formal."],
    ["En el teatro, los actores representan una historia sobre un escenario.", "Utilizan el diálogo para comunicarse y hacer avanzar la trama.", "Las acotaciones del texto indican sus movimientos y gestos.", "El público observa la representación en directo."],
    ["Una leyenda es un relato que mezcla realidad y fantasía.", "Se transmite de generación en generación de forma oral.", "Explica el origen de un lugar, una costumbre o un fenómeno natural.", "A menudo, sus protagonistas son héroes o seres sobrenaturales."],
    ["Para escribir una buena redacción, primero hay que organizar las ideas.", "Se debe crear un borrador con una estructura clara.", "Es importante utilizar un vocabulario rico y evitar repeticiones.", "Finalmente, hay que revisar la ortografía y la gramática cuidadosamente."]
];

const OrdenaLaHistoriaEso1Lengua = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1Lengua;
