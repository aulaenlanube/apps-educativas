// src/apps/ordena-la-historia/eso-2-fisica/OrdenaLaHistoriaEso2Fisica.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Una reacción de combustión necesita un combustible, un comburente y calor.", "El combustible, como la madera, es la sustancia que arde.", "El comburente, generalmente el oxígeno del aire, permite que arda.", "Se necesita una energía de activación, como una cerilla, para iniciarla.", "Como resultado, se desprende una gran cantidad de luz y calor."],
    ["La luz del sol parece blanca, pero en realidad está compuesta por muchos colores.", "Cuando la luz atraviesa un prisma de cristal, se descompone.", "Podemos ver todos los colores del arcoíris, desde el rojo hasta el violeta.", "Este fenómeno se conoce como dispersión de la luz."],
    ["Una fuerza es capaz de cambiar la forma o el movimiento de un objeto.", "Si aplicamos una fuerza a un objeto en reposo, este puede empezar a moverse.", "Si el objeto ya se está moviendo, una fuerza puede hacer que acelere, frene o cambie de dirección.", "Las fuerzas son interacciones entre dos cuerpos."],
    ["Para medir la temperatura de un líquido, utilizamos un termómetro.", "Introducimos el bulbo del termómetro en el líquido sin que toque el fondo.", "Esperamos un momento a que el líquido del termómetro se estabilice.", "Leemos la temperatura en la escala graduada.", "La unidad de temperatura en el Sistema Internacional es el Kelvin, pero usamos más el grado Celsius."],
    ["El sonido se produce cuando un objeto vibra y transmite esa vibración al aire.", "Estas vibraciones viajan por el aire en forma de ondas sonoras.", "Cuando las ondas llegan a nuestro oído, hacen vibrar el tímpano.", "El cerebro interpreta estas vibraciones como los sonidos que escuchamos."],
    ["En un circuito en serie, los componentes se conectan uno detrás de otro.", "Si uno de los componentes se estropea o se desconecta, el circuito se abre.", "Como resultado, la corriente deja de fluir por todo el circuito.", "Por eso, si se funde una bombilla de una guirnalda antigua, se apagan todas."],
    ["La flotación de un barco se explica por el principio de Arquímedes.", "El barco, a pesar de ser de hierro, desaloja un gran volumen de agua.", "El agua ejerce una fuerza hacia arriba llamada empuje, que es igual al peso del agua desalojada.", "Si el empuje es mayor que el peso del barco, este flota."],
    ["El calor se puede transferir de un cuerpo a otro de tres formas.", "La conducción ocurre en los sólidos, cuando el calor pasa de partícula a partícula.", "La convección se da en fluidos, donde las masas calientes ascienden y las frías descienden.", "La radiación es la transferencia de calor a través de ondas, como la del Sol."],
    ["Un elemento químico está formado por átomos que tienen el mismo número de protones.", "Los elementos se organizan en la tabla periódica según su número atómico.", "Por ejemplo, todos los átomos del elemento oxígeno tienen 8 protones.", "Las propiedades de un elemento dependen de su estructura atómica."],
    ["Para separar la sal del agua en una disolución, podemos usar la cristalización.", "Calentamos la disolución para que el agua se evapore.", "A medida que el agua se evapora, la sal empieza a formar cristales sólidos.", "Finalmente, toda el agua se ha evaporado y solo nos queda la sal en el recipiente."]
];

const OrdenaLaHistoriaEso2Fisica = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso2Fisica;
