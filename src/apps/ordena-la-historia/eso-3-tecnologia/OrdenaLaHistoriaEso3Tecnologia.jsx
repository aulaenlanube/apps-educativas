// src/apps/ordena-la-historia/eso-3-tecnologia/OrdenaLaHistoriaEso3Tecnologia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Un motor de combustión interna, como el de un coche, funciona en cuatro tiempos.", "Primero, en la admisión, la mezcla de aire y combustible entra en el cilindro.", "En la compresión, el pistón sube y comprime la mezcla.", "Una chispa de la bujía provoca la explosión, que empuja el pistón hacia abajo.", "Finalmente, en el escape, el pistón sube de nuevo para expulsar los gases quemados.", "Este ciclo se repite continuamente para generar el movimiento."],
    ["La electricidad que llega a nuestras casas se genera en las centrales eléctricas.", "Desde allí, viaja a través de cables de alta tensión a grandes distancias.", "Antes de llegar a las ciudades, los transformadores reducen su voltaje.", "Finalmente, una red de distribución local la lleva hasta cada vivienda.", "Gracias a este sistema, podemos usar nuestros electrodomésticos."],
    ["La electrónica digital se basa en el sistema binario, que solo utiliza dos dígitos: 0 y 1.", "Estos dígitos se conocen como bits y son la unidad mínima de información.", "Los circuitos electrónicos, como los microprocesadores, trabajan con estos ceros y unos.", "Las puertas lógicas son componentes que realizan operaciones básicas con estos bits.", "Toda la información que maneja un ordenador se codifica en este sistema."],
    ["Un robot industrial está diseñado para realizar tareas repetitivas de forma automática.", "Está formado por un brazo robótico con varios ejes de movimiento.", "En el extremo del brazo se coloca una herramienta específica para la tarea.", "Un programa informático controla todos sus movimientos con gran precisión.", "Se utilizan en las cadenas de montaje para soldar, pintar o ensamblar piezas."],
    ["Para crear una página web, se utiliza principalmente el lenguaje HTML.", "HTML se encarga de definir la estructura y el contenido de la página, como los títulos y párrafos.", "Para darle estilo y un aspecto visual atractivo, se utiliza el lenguaje CSS.", "Con CSS podemos definir los colores, las fuentes y la disposición de los elementos.", "Finalmente, con JavaScript se puede añadir interactividad y efectos dinámicos a la página."],
    ["La comunicación por fibra óptica ha revolucionado las telecomunicaciones.", "Utiliza un hilo muy fino de vidrio o plástico para transmitir información.", "La información viaja en forma de pulsos de luz a través de este hilo.", "Permite transmitir una cantidad enorme de datos a una velocidad muy alta.", "Es la tecnología que se utiliza en las conexiones a internet de alta velocidad."],
    ["Un sistema de control de lazo cerrado, o realimentado, es muy eficaz.", "Mide constantemente la variable de salida que quiere controlar.", "Compara este valor medido con el valor deseado o de referencia.", "Si hay una diferencia o error, el sistema actúa para corregirlo.", "El termostato de una calefacción es un ejemplo: enciende o apaga la caldera para mantener la temperatura."],
    ["La neumática es la tecnología que utiliza el aire comprimido para producir trabajo.", "Un compresor se encarga de tomar aire de la atmósfera y comprimirlo.", "Este aire a presión se almacena en un depósito.", "A través de válvulas y tuberías, el aire se dirige a los actuadores, como los cilindros.", "Se utiliza en muchas aplicaciones industriales, como abrir las puertas de un autobús."],
    ["El diseño asistido por ordenador (CAD) ha sustituido al dibujo técnico tradicional.", "Permite a los ingenieros y diseñadores crear modelos precisos en 2D y 3D.", "Es mucho más rápido y fácil modificar un diseño en el ordenador que en el papel.", "Estos modelos se pueden usar para realizar simulaciones y pruebas virtuales.", "También sirven como base para la fabricación de prototipos y productos finales."],
    ["Un microcontrolador es como un pequeño ordenador dentro de un solo chip.", "Contiene un procesador, memoria y periféricos de entrada y salida.", "Se puede programar para realizar tareas específicas de control de forma autónoma.", "Plataformas como Arduino han hecho que su uso sea accesible para aficionados.", "Se encuentran en infinidad de aparatos, desde electrodomésticos hasta juguetes."]
];

const OrdenaLaHistoriaEso3Tecnologia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3Tecnologia;
