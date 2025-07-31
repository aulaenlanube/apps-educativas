// src/apps/ordena-la-frase-eso-1-fisica/OrdenaLaFraseEso1Fisica.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La materia es todo aquello que tiene masa y ocupa un volumen.",
    "Los tres estados de la materia son sólido, líquido y gaseoso.",
    "La densidad es la relación entre la masa y el volumen de un cuerpo.",
    "Un cambio de estado físico no altera la composición de la materia.",
    "La fusión es el paso de estado sólido a líquido.",
    "La evaporación es el paso de estado líquido a gaseoso.",
    "Una mezcla está formada por varias sustancias puras.",
    "Las disoluciones son mezclas homogéneas de dos o más sustancias.",
    "El átomo es la partícula más pequeña de un elemento.",
    "La tabla periódica organiza todos los elementos químicos.",
    "Una reacción química transforma unas sustancias en otras nuevas.",
    "La energía ni se crea ni se destruye, solo se transforma.",
    "El calor es una forma de transferencia de energía.",
    "La temperatura se mide con un termómetro.",
    "La luz viaja en línea recta y a gran velocidad.",
    "El sonido necesita un medio material para propagarse.",
    "La fuerza es toda causa capaz de deformar un cuerpo o cambiar su movimiento.",
    "La gravedad es la fuerza que atrae los objetos hacia la Tierra.",
    "El laboratorio es un lugar para realizar experimentos científicos.",
    "Las probetas se utilizan para medir el volumen de los líquidos.",
    "El agua está compuesta por hidrógeno y oxígeno.",
    "El aire es una mezcla de gases como el nitrógeno y el oxígeno.",
    "La combustión es una reacción química que libera luz y calor.",
    "Los metales son buenos conductores del calor y la electricidad.",
    "El método científico incluye observación, hipótesis y experimentación.",
    "La masa se mide en kilogramos con una balanza.",
    "El volumen de un líquido se mide en litros.",
    "Los cambios químicos alteran la naturaleza de las sustancias.",
    "La oxidación es un ejemplo de cambio químico lento.",
    "Una sustancia pura tiene una composición química fija.",
    "El soluto es la sustancia que se disuelve en una disolución.",
    "El disolvente es la sustancia en mayor cantidad en una disolución.",
    "La decantación sirve para separar líquidos con distinta densidad.",
    "La filtración se usa para separar un sólido de un líquido.",
    "Los elementos químicos se representan con símbolos.",
    "El protón, el neutrón y el electrón son partículas subatómicas.",
    "La energía cinética está asociada al movimiento de los cuerpos.",
    "La energía potencial depende de la posición de un objeto.",
    "Las fuentes de energía renovables no se agotan con su uso.",
    "La reflexión de la luz ocurre cuando choca contra una superficie."
];

const OrdenaLaFraseEso1Fisica = () => {
    const game = useOrdenaLaFraseGame(frases, true); // true = con temporizador
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso1Fisica;
