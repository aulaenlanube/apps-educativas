// src/apps/ordena-la-historia/eso-2-lengua/OrdenaLaHistoriaEso2Lengua.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El mester de juglaría era propio de los juglares medievales.", "Recitaban poemas épicos en las plazas para entretener al pueblo.", "El 'Cantar de mio Cid' es la obra más importante de este mester.", "Narraba las hazañas de un héroe de forma oral."],
    ["La Celestina es una obra clave de la literatura española.", "Fue escrita por Fernando de Rojas a finales del siglo XV.", "Narra los trágicos amores de Calisto y Melibea.", "Se considera una obra de transición hacia el Renacimiento.", "Sus personajes muestran una gran profundidad psicológica."],
    ["Para analizar una oración compuesta, primero identificamos los verbos.", "Localizamos el nexo que une las diferentes proposiciones.", "Determinamos si las proposiciones son coordinadas o subordinadas.", "Finalmente, analizamos cada proposición por separado."],
    ["El Renacimiento fue un movimiento cultural que valoraba la cultura clásica.", "En literatura, se buscaba la belleza y el equilibrio formal.", "Garcilaso de la Vega introdujo el soneto y otras formas poéticas italianas.", "Los temas principales eran el amor, la naturaleza y la mitología."],
    ["La novela picaresca narra la vida de un personaje de baja clase social.", "El protagonista, o pícaro, lucha por sobrevivir usando su astucia.", "El 'Lazarillo de Tormes' es la primera y más famosa novela de este género.", "Está escrita en forma de autobiografía y critica la sociedad de la época."],
    ["Una oración coordinada une dos proposiciones que son independientes.", "Pueden ser copulativas si suman ideas, como con el nexo 'y'.", "Son disyuntivas si presentan opciones, usando el nexo 'o'.", "Son adversativas si expresan oposición, con nexos como 'pero'."],
    ["El Barroco fue un movimiento artístico del siglo XVII.", "En literatura, se caracteriza por un lenguaje complejo y ornamentado.", "Dos grandes corrientes fueron el culteranismo de Góngora y el conceptismo de Quevedo.", "Buscaba sorprender y emocionar al lector con su ingenio."],
    ["Para crear un poema, el poeta elige cuidadosamente las palabras.", "Organiza las palabras en versos, que son cada línea del poema.", "Los versos se agrupan en estrofas.", "A menudo utiliza recursos literarios como la metáfora para embellecer el texto."],
    ["Los determinantes son palabras que acompañan al nombre para concretarlo.", "Los artículos, como 'el' o 'una', presentan al sustantivo.", "Los demostrativos, como 'este' o 'aquel', indican la distancia.", "Los posesivos, como 'mi' o 'suyo', señalan pertenencia."],
    ["El texto argumentativo tiene como objetivo convencer al lector.", "Presenta una idea principal o tesis que se quiere defender.", "Utiliza argumentos o razones para apoyar esa tesis.", "Finalmente, concluye reforzando la idea principal."]
];

const OrdenaLaHistoriaEso2Lengua = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso2Lengua;
