// src/apps/ordena-la-historia/eso-1-matematicas/OrdenaLaHistoriaEso1Mates.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Para resolver el problema, primero leemos el enunciado con atención.", "Identificamos los datos que nos proporciona y lo que nos pide calcular.", "Elegimos la operación matemática adecuada para la situación.", "Realizamos los cálculos de forma ordenada y sin errores.", "Finalmente, escribimos la solución de forma clara y completa."],
    ["Los números naturales surgieron de la necesidad de contar objetos.", "Más tarde, los números enteros se introdujeron para representar deudas o temperaturas bajo cero.", "Las fracciones aparecieron para poder expresar partes de una unidad.", "El conjunto de todos ellos forma los números racionales."],
    ["Pitágoras fue un matemático de la antigua Grecia.", "Fundó una escuela donde se estudiaban las matemáticas y la filosofía.", "A él y a sus discípulos se les atribuye el famoso teorema sobre los triángulos rectángulos.", "Este teorema establece una relación entre los catetos y la hipotenusa."],
    ["Para construir un pentágono regular, empezamos dibujando una circunferencia.", "Dividimos los 360 grados de la circunferencia entre cinco lados.", "Con un transportador, marcamos los ángulos de 72 grados.", "Unimos los puntos marcados en la circunferencia para formar el polígono.", "Comprobamos que todos sus lados y ángulos son iguales."],
    ["Un comerciante compró manzanas a 1 euro el kilo.", "Las vendió en su frutería a 2 euros el kilo.", "Si compró 50 kilos, primero calculó el coste total.", "Luego, calculó el ingreso total por la venta.", "La diferencia entre ingresos y costes fue su beneficio."],
    ["El sistema de numeración decimal utiliza diez cifras, del 0 al 9.", "La posición de cada cifra determina su valor en el número.", "Es un sistema posicional que usamos en nuestra vida diaria.", "Facilita la realización de operaciones aritméticas como sumar o restar."],
    ["Para calcular el área de una habitación rectangular, medimos su largo y su ancho.", "Multiplicamos la medida del largo por la del ancho.", "El resultado se expresa en metros cuadrados.", "Este cálculo es útil para saber cuántas baldosas se necesitan para el suelo."],
    ["La estadística nos ayuda a organizar y analizar datos.", "Primero, recogemos la información mediante encuestas o mediciones.", "Luego, organizamos los datos en tablas de frecuencias.", "Finalmente, representamos los datos en gráficos para visualizarlos mejor.", "Así, podemos sacar conclusiones a partir de la información."],
    ["Una ecuación es como una balanza en equilibrio.", "Lo que hacemos en un lado de la igualdad, debemos hacerlo en el otro.", "Nuestro objetivo es despejar la incógnita para encontrar su valor.", "Para ello, pasamos los términos de un lado a otro cambiando su operación."],
    ["La probabilidad mide la posibilidad de que ocurra un suceso.", "Se calcula dividiendo el número de casos favorables entre el número de casos posibles.", "Por ejemplo, la probabilidad de sacar un 5 al lanzar un dado es de un sexto.", "Su valor es siempre un número entre 0 y 1."]
];

const OrdenaLaHistoriaEso1Mates = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1Mates;
