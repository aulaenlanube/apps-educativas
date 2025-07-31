// src/apps/ordena-la-frase-eso-3-fisica/OrdenaLaFraseEso3Fisica.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La materia está compuesta por partículas muy pequeñas llamadas átomos.",
    "La ley de conservación de la masa afirma que la masa no se crea ni se destruye.",
    "Un elemento químico está formado por átomos con el mismo número de protones.",
    "La tabla periódica organiza los elementos químicos según sus propiedades.",
    "Un compuesto es una sustancia formada por la unión de dos o más elementos.",
    "Una reacción química es un proceso en el que unas sustancias se transforman en otras.",
    "La velocidad de una reacción depende de la temperatura y la concentración.",
    "El movimiento es el cambio de posición de un cuerpo respecto a un sistema de referencia.",
    "La velocidad es la relación entre el espacio recorrido y el tiempo empleado.",
    "La aceleración mide cómo cambia la velocidad de un móvil con el tiempo.",
    "Una fuerza es cualquier acción capaz de cambiar el estado de movimiento de un cuerpo.",
    "La primera ley de Newton establece el principio de inercia.",
    "El peso de un cuerpo es la fuerza con la que la Tierra lo atrae.",
    "La energía es la capacidad que tienen los cuerpos para producir cambios.",
    "La energía cinética es la que posee un cuerpo debido a su movimiento.",
    "La energía potencial es la energía almacenada en un cuerpo debido a su posición.",

    "El principio de conservación de la energía establece que esta no se destruye, solo se transforma.",
    "El calor es una forma de transferencia de energía entre cuerpos a diferente temperatura.",
    "La corriente eléctrica es un flujo de electrones a través de un conductor.",
    "La ley de Ohm relaciona la intensidad, el voltaje y la resistencia en un circuito.",
    "Los isótopos son átomos de un mismo elemento con diferente número de neutrones.",
    "El enlace iónico se produce por la atracción entre iones de carga opuesta.",
    "El enlace covalente se forma cuando los átomos comparten electrones.",
    "El pH es una medida de la acidez o basicidad de una disolución.",
    "La cinemática es la parte de la física que estudia el movimiento.",
    "La dinámica estudia las causas que originan el movimiento de los cuerpos.",
    "La fuerza de rozamiento se opone siempre al movimiento de los cuerpos.",
    "La presión es la fuerza que se ejerce por unidad de superficie.",
    "El principio de Pascal se aplica en las prensas hidráulicas.",
    "Las fuentes de energía renovables son aquellas que no se agotan.",
    "La energía térmica se debe a la agitación de las partículas de un cuerpo.",
    "La potencia eléctrica mide la cantidad de energía consumida por unidad de tiempo.",
    "Un electroimán es un imán que funciona con corriente eléctrica.",
    "Las ondas sonoras necesitan un medio material para poder propagarse.",
    "La luz se comporta a veces como una onda y a veces como una partícula.",
    "La masa atómica es la masa de un átomo expresada en unidades de masa atómica.",
    "El ajuste de una reacción química se basa en la ley de conservación de la masa.",
    "La caída libre es un ejemplo de movimiento rectilíneo uniformemente acelerado.",
    "La fuerza normal es la que ejerce una superficie sobre un cuerpo apoyado en ella.",
    "La energía se degrada en cada transformación, convirtiéndose en calor."
];

const OrdenaLaFraseEso3Fisica = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso3Fisica;
