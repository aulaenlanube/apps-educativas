// src/apps/ordena-la-historia/eso-4-economia/OrdenaLaHistoriaEso4Economia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El mercado es el lugar físico o virtual donde se encuentran la oferta y la demanda.", "La demanda está formada por los compradores que desean adquirir un bien.", "La oferta está formada por los vendedores que desean vender ese bien.", "La interacción entre ambos determina el precio de equilibrio del producto.", "A ese precio, la cantidad que se quiere comprar coincide con la que se quiere vender.", "Este mecanismo es la base de la economía de mercado."],
    ["El Producto Interior Bruto (PIB) es el principal indicador para medir la riqueza de un país.", "Mide el valor monetario de todos los bienes y servicios finales producidos en un país durante un año.", "Si el PIB crece, significa que la economía del país está en expansión.", "Si decrece durante dos trimestres consecutivos, se considera que el país está en recesión.", "Se suele utilizar el PIB per cápita para comparar el nivel de vida entre países."],
    ["La inflación es el aumento generalizado y continuo de los precios de una economía.", "Cuando hay inflación, el dinero pierde valor y nuestro poder adquisitivo disminuye.", "Es decir, con la misma cantidad de dinero podemos comprar menos cosas que antes.", "Una inflación moderada se considera normal, pero una inflación muy alta es perjudicial.", "Los bancos centrales, como el BCE, utilizan la política monetaria para intentar controlarla."],
    ["Para crear una empresa, un emprendedor debe elaborar un plan de negocio.", "En este plan, primero se describe la idea de negocio y el producto o servicio que se ofrecerá.", "Luego, se realiza un estudio de mercado para analizar a los clientes y a la competencia.", "También se detalla un plan de marketing para dar a conocer la empresa.", "Finalmente, se elabora un plan financiero para estudiar la viabilidad económica del proyecto.", "Este documento es fundamental para buscar financiación."],
    ["El sector público interviene en la economía para corregir los fallos del mercado.", "Proporciona bienes y servicios públicos que las empresas privadas no ofrecerían, como la defensa o la justicia.", "También se encarga de redistribuir la renta para reducir las desigualdades.", "Esto lo hace a través de los impuestos y las ayudas sociales, como las pensiones o el subsidio de desempleo.", "Además, intenta suavizar los ciclos económicos mediante la política fiscal."],
    ["El comercio internacional permite a los países especializarse en aquello que producen mejor.", "Un país exporta los bienes en los que tiene una ventaja comparativa.", "E importa aquellos bienes que otros países producen de forma más eficiente.", "Esto aumenta la eficiencia de la economía mundial y la variedad de productos disponibles.", "Sin embargo, también puede generar problemas a los sectores nacionales que compiten con las importaciones."],
    ["El mercado de trabajo es donde se encuentran la oferta y la demanda de empleo.", "La oferta de trabajo está formada por los trabajadores que desean trabajar.", "La demanda de trabajo la realizan las empresas que necesitan contratar personal.", "El salario es el precio de equilibrio en este mercado.", "El desempleo o paro se produce cuando hay más personas dispuestas a trabajar que puestos de trabajo disponibles."],
    ["El dinero es un medio de cambio que facilita las transacciones económicas.", "Antiguamente se utilizaba el trueque, pero era muy ineficiente.", "El dinero cumple tres funciones: medio de pago, depósito de valor y unidad de cuenta.", "Permite que el valor de todos los bienes se exprese en una misma unidad.", "La cantidad de dinero que circula en una economía está controlada por el banco central."],
    ["A la hora de invertir nuestros ahorros, existe una relación directa entre riesgo y rentabilidad.", "Las inversiones más seguras, como los depósitos bancarios, suelen ofrecer una rentabilidad baja.", "Las inversiones con mayor riesgo, como las acciones en bolsa, tienen el potencial de generar una mayor rentabilidad.", "Sin embargo, con las acciones también podemos perder parte o todo nuestro dinero.", "La diversificación, es decir, no invertir todo en un solo producto, es una estrategia clave para reducir el riesgo."],
    ["La empresa combina los factores de producción para crear bienes y servicios.", "Los factores son los recursos naturales, el trabajo de los empleados y el capital (maquinaria, instalaciones).", "El objetivo de la mayoría de las empresas es maximizar sus beneficios.", "El beneficio es la diferencia entre los ingresos que obtiene por sus ventas y los costes de producción.", "Las empresas se clasifican según su tamaño, su sector o su forma jurídica."]
];

const OrdenaLaHistoriaEso4Economia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso4Economia;
