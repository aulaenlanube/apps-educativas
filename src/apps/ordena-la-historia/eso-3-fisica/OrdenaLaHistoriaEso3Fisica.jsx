// src/apps/ordena-la-historia/eso-3-fisica/OrdenaLaHistoriaEso3Fisica.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La tabla periódica organiza todos los elementos químicos conocidos.", "Los elementos se ordenan por su número atómico, que es el número de protones.", "Están distribuidos en filas llamadas períodos y columnas llamadas grupos.", "Los elementos de un mismo grupo tienen propiedades químicas similares.", "Esta organización nos permite predecir el comportamiento de los elementos."],
    ["Una reacción química es un proceso de transformación de la materia.", "Las sustancias iniciales, llamadas reactivos, se rompen y sus átomos se reorganizan.", "Como resultado, se forman nuevas sustancias con propiedades diferentes, llamadas productos.", "La ley de conservación de la masa establece que la masa total se mantiene constante.", "Para que se cumpla, debemos ajustar la ecuación química."],
    ["El movimiento rectilíneo uniformemente acelerado (MRUA) describe muchos movimientos cotidianos.", "En este tipo de movimiento, la velocidad del objeto cambia a un ritmo constante.", "La magnitud que mide este cambio de velocidad es la aceleración.", "Si un coche arranca desde el reposo, su movimiento es un MRUA.", "La caída libre de un objeto es otro ejemplo clásico de este movimiento."],
    ["La segunda ley de Newton relaciona la fuerza, la masa y la aceleración.", "Establece que la fuerza neta aplicada sobre un cuerpo es directamente proporcional a la aceleración que adquiere.", "La constante de proporcionalidad es la masa del cuerpo (F=ma).", "Esto significa que para mover un objeto pesado se necesita más fuerza que para mover uno ligero.", "Es una de las leyes fundamentales de la dinámica."],
    ["El principio de conservación de la energía es una ley fundamental de la física.", "Afirma que la energía no se crea ni se destruye, solo se transforma de un tipo a otro.", "Por ejemplo, al dejar caer una pelota, su energía potencial se transforma en energía cinética.", "En una bombilla, la energía eléctrica se transforma en energía lumínica y térmica.", "La energía total del universo permanece siempre constante."],
    ["La corriente eléctrica es un flujo de electrones a través de un material conductor.", "Para que exista esta corriente, se necesita un circuito cerrado y un generador.", "El generador, como una pila, proporciona la energía necesaria para mover los electrones.", "La intensidad de corriente mide la cantidad de carga que pasa por segundo.", "Los materiales aislantes, como el plástico, no permiten el paso de la corriente."],
    ["La ley de Ohm es clave para el análisis de los circuitos eléctricos.", "Relaciona el voltaje (V), la intensidad (I) y la resistencia (R).", "Establece que el voltaje es igual a la intensidad multiplicada por la resistencia (V = I·R).", "La resistencia es la oposición que ofrece un material al paso de la corriente.", "Gracias a esta ley, podemos calcular cualquiera de las tres magnitudes si conocemos las otras dos."],
    ["Un enlace químico es la fuerza que mantiene unidos a los átomos para formar compuestos.", "En el enlace iónico, un átomo cede electrones y otro los gana, formando iones.", "En el enlace covalente, los átomos comparten pares de electrones para ser más estables.", "El tipo de enlace determina las propiedades de la sustancia resultante.", "Por ejemplo, la sal de mesa tiene enlace iónico y es un sólido cristalino."],
    ["La presión es la fuerza que se ejerce sobre una determinada superficie.", "Se calcula dividiendo la fuerza aplicada entre el área de la superficie.", "Por eso, un cuchillo afilado corta mejor, porque concentra la fuerza en un área muy pequeña.", "La presión en los fluidos, como el agua, aumenta con la profundidad.", "La unidad de presión en el Sistema Internacional es el Pascal."],
    ["Las fuentes de energía renovables son aquellas que se obtienen de fuentes naturales inagotables.", "La energía solar aprovecha la radiación del Sol.", "La energía eólica utiliza la fuerza del viento para mover aerogeneradores.", "La energía hidroeléctrica se basa en el movimiento del agua en los ríos.", "Son una alternativa limpia a los combustibles fósiles para combatir el cambio climático."]
];

const OrdenaLaHistoriaEso3Fisica = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3Fisica;
