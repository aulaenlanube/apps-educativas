// src/apps/ordena-la-historia/eso-1-plastica/OrdenaLaHistoriaEso1Plastica.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Para crear un color secundario, necesitamos los colores primarios.", "Elegimos dos colores primarios, por ejemplo, el rojo y el amarillo.", "Los mezclamos en la paleta en proporciones iguales.", "Como resultado, obtenemos el color naranja.", "De la misma forma, azul y amarillo crean el verde."],
    ["El artista quería pintar un paisaje al aire libre.", "Colocó su caballete y su lienzo frente a una montaña.", "Observó los colores de la naturaleza y cómo cambiaba la luz.", "Con pinceladas rápidas, capturó la esencia del momento.", "El cuadro transmitía una gran sensación de paz y tranquilidad."],
    ["Un punto es el elemento más simple en el lenguaje visual.", "Una sucesión de puntos muy juntos crea la sensación de una línea.", "La línea sirve para dibujar el contorno de las formas.", "Con las líneas, podemos representar objetos y figuras."],
    ["El escultor comenzó con un gran bloque de mármol.", "Con un cincel y un martillo, empezó a quitar los trozos sobrantes.", "Poco a poco, fue dando forma a una figura humana.", "Finalmente, pulió la superficie para darle un acabado suave.", "La estatua parecía tener vida propia."],
    ["Un bodegón es una pintura que representa objetos sin vida.", "El pintor colocó varias frutas y un jarrón sobre una mesa.", "Estudió cómo la luz iluminaba los objetos y creaba sombras.", "Pintó las diferentes texturas de la fruta y el brillo del jarrón.", "La obra final era una composición muy equilibrada y realista."],
    ["Para hacer un collage, reunimos diferentes materiales.", "Recortamos trozos de revistas, periódicos y telas de colores.", "Los distribuimos sobre una cartulina creando una composición interesante.", "Una vez decidida la posición, los pegamos con cuidado.", "El resultado es una obra original llena de texturas."],
    ["El círculo cromático nos ayuda a entender las relaciones entre los colores.", "En él se ordenan los colores primarios, secundarios y terciarios.", "Los colores complementarios son los que se encuentran opuestos en el círculo.", "Al ponerlos juntos, se intensifican mutuamente.", "Por ejemplo, el rojo es el complementario del verde."],
    ["La perspectiva es una técnica para crear la ilusión de profundidad.", "Los objetos que están más lejos se dibujan más pequeños.", "Las líneas paralelas parecen juntarse en un punto de fuga en el horizonte.", "Esta técnica hace que los dibujos parezcan más realistas."],
    ["Para dibujar un retrato, primero se encaja la forma general de la cabeza.", "Luego, se sitúan los ejes para colocar los ojos, la nariz y la boca.", "Se detallan los rasgos faciales intentando captar la expresión.", "Finalmente, se añaden las sombras para dar volumen al rostro."],
    ["La técnica de la acuarela utiliza colores transparentes.", "Se aplica el color diluido en agua sobre el papel.", "Se suele pintar de los colores más claros a los más oscuros.", "El blanco del papel es importante, ya que se deja ver a través del color."]
];

const OrdenaLaHistoriaEso1Plastica = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1Plastica;
