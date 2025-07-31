// src/apps/ordena-la-frase-eso-2-fisica/OrdenaLaFraseEso2Fisica.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La materia se puede encontrar en estado sólido, líquido o gaseoso.",
    "Un cambio de estado físico no altera la composición de la sustancia.",
    "La densidad es la masa de una sustancia dividida por su volumen.",
    "Las mezclas homogéneas presentan un aspecto uniforme.",
    "Una disolución está formada por un soluto y un disolvente.",
    "La cristalización es un método para separar un sólido de un líquido.",
    "La energía se manifiesta de diferentes formas, como térmica o eléctrica.",
    "El calor es la energía que se transfiere entre cuerpos a distinta temperatura.",
    "La temperatura es una medida de la energía cinética de las partículas.",
    "La luz se propaga en línea recta en un medio homogéneo.",
    "La reflexión de la luz ocurre cuando esta rebota en una superficie.",
    "Una lente convergente concentra los rayos de luz en un punto.",
    "El sonido se produce por la vibración de un objeto.",
    "La velocidad del sonido es menor que la velocidad de la luz.",
    "Una fuerza es capaz de cambiar el estado de movimiento de un cuerpo.",
    "El movimiento rectilíneo uniforme tiene velocidad constante.",
    "La electricidad es el movimiento de cargas eléctricas a través de un material.",
    "Un circuito eléctrico necesita un generador para funcionar.",
    "Los materiales conductores permiten el paso de la corriente eléctrica.",
    "Los aislantes impiden el paso de la electricidad.",
    "El átomo está formado por un núcleo con protones y neutrones.",
    "Los electrones giran alrededor del núcleo del átomo.",
    "Un elemento químico está formado por átomos del mismo tipo.",
    "La tabla periódica ordena los elementos según su número atómico.",
    "Una reacción química produce nuevas sustancias con propiedades diferentes.",
    "La ley de conservación de la masa establece que la materia no se destruye.",
    "La oxidación es una reacción química en la que una sustancia se combina con oxígeno.",
    "La combustión es una oxidación rápida que desprende luz y calor.",
    "Los ácidos y las bases son tipos de compuestos químicos.",
    "La presión es la fuerza ejercida sobre una superficie.",
    "La flotabilidad de un objeto depende de su densidad y la del fluido.",
    "La dilatación es el aumento de volumen de un cuerpo por el calor.",
    "La conducción es una forma de transferencia de calor en los sólidos.",
    "La convección transfiere calor en líquidos y gases.",
    "La radiación es la transferencia de calor a través de ondas.",
    "La refracción es el cambio de dirección de la luz al pasar de un medio a otro.",
    "El imán tiene dos polos: norte y sur.",
    "El campo magnético es la zona de influencia de un imán.",
    "La energía potencial es la energía almacenada en un objeto.",
    "La energía cinética es la energía asociada al movimiento."
];

const OrdenaLaFraseEso2Fisica = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso2Fisica;
