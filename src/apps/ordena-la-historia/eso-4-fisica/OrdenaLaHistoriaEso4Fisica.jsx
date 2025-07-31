// src/apps/ordena-la-historia/eso-4-fisica/OrdenaLaHistoriaEso4Fisica.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El movimiento de un proyectil, como una pelota lanzada, es un tiro parabólico.", "Podemos descomponer este movimiento en dos más sencillos: uno horizontal y otro vertical.", "El movimiento horizontal es rectilíneo y uniforme, ya que no hay aceleración en esa dirección.", "El movimiento vertical es rectilíneo y uniformemente acelerado, debido a la fuerza de la gravedad.", "La combinación de ambos movimientos da como resultado la trayectoria parabólica.", "La cinemática nos permite calcular el alcance máximo o la altura máxima del proyectil."],
    ["La ley de la gravitación universal de Newton describe la fuerza de atracción entre dos masas.", "Establece que esta fuerza es directamente proporcional al producto de sus masas.", "Y es inversamente proporcional al cuadrado de la distancia que las separa.", "Esta ley explica tanto la caída de una manzana como el movimiento de los planetas alrededor del Sol.", "Fue uno de los mayores logros de la historia de la ciencia."],
    ["El principio de conservación de la energía mecánica es una herramienta muy útil.", "Afirma que si sobre un cuerpo solo actúan fuerzas conservativas, su energía mecánica total permanece constante.", "La energía mecánica es la suma de la energía cinética y la energía potencial.", "Por ejemplo, en una montaña rusa sin rozamiento, la energía se transforma de potencial a cinética y viceversa.", "La energía total en cualquier punto del recorrido es siempre la misma."],
    ["El trabajo y la energía están íntimamente relacionados.", "El teorema de la energía cinética establece que el trabajo total realizado sobre un cuerpo es igual a la variación de su energía cinética.", "Si el trabajo es positivo, la energía cinética del cuerpo aumenta, es decir, acelera.", "Si el trabajo es negativo, como el del rozamiento, la energía cinética disminuye y el cuerpo frena.", "El trabajo es, por tanto, una medida de la transferencia de energía."],
    ["La inducción electromagnética fue descubierta por Faraday.", "Demostró que un campo magnético variable puede generar una corriente eléctrica en un circuito cercano.", "Este fenómeno es el principio de funcionamiento de los generadores eléctricos.", "En una central eléctrica, se hace girar una bobina dentro de un campo magnético para producir electricidad.", "Es la base de casi toda la energía eléctrica que consumimos.", "También es el principio de los transformadores que cambian el voltaje."],
    ["La química orgánica es la química de los compuestos del carbono.", "El átomo de carbono tiene la capacidad única de formar largas cadenas y enlaces estables consigo mismo.", "Esto permite la existencia de una enorme variedad de moléculas orgánicas.", "Los hidrocarburos, formados solo por carbono e hidrógeno, son los compuestos más sencillos.", "Las moléculas orgánicas son la base de la vida en la Tierra.", "El petróleo es la principal fuente de compuestos orgánicos industriales."],
    ["Para ajustar una reacción química, debemos aplicar la ley de conservación de la masa.", "La ley de Lavoisier dice que la masa de los reactivos debe ser igual a la de los productos.", "Esto implica que el número de átomos de cada elemento debe ser el mismo a ambos lados de la ecuación.", "Para lograrlo, colocamos unos números llamados coeficientes estequiométricos delante de cada fórmula.", "El ajuste se realiza por tanteo o utilizando métodos algebraicos."],
    ["El concepto de mol es fundamental en estequiometría.", "Un mol es una cantidad de sustancia que contiene un número de partículas igual al número de Avogadro.", "Este número es aproximadamente 6,022 por 10 elevado a 23.", "La masa de un mol de una sustancia, expresada en gramos, es su masa molar.", "El mol nos permite relacionar el mundo macroscópico (gramos) con el mundo microscópico (átomos y moléculas)."],
    ["Las ondas son perturbaciones que se propagan transportando energía, pero no materia.", "Las ondas mecánicas, como el sonido, necesitan un medio material para viajar.", "Las ondas electromagnéticas, como la luz, pueden propagarse en el vacío.", "Se caracterizan por su frecuencia, longitud de onda y amplitud.", "La frecuencia es el número de oscilaciones por segundo y se mide en hercios."],
    ["El movimiento circular uniforme (MCU) describe un cuerpo que gira a velocidad constante.", "Aunque la rapidez es constante, la velocidad no lo es, porque su dirección cambia continuamente.", "Este cambio de dirección implica que existe una aceleración, llamada aceleración normal o centrípeta.", "Esta aceleración está siempre dirigida hacia el centro de la trayectoria.", "Para que exista, es necesaria una fuerza centrípeta que obligue al cuerpo a girar."]
];

const OrdenaLaHistoriaEso4Fisica = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso4Fisica;
