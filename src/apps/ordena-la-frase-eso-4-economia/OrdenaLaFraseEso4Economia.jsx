// src/apps/ordena-la-frase-eso-4-economia/OrdenaLaFraseEso4Economia.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La economía estudia cómo las sociedades gestionan sus recursos escasos.",
    "El coste de oportunidad es el valor de la mejor alternativa a la que renunciamos.",
    "Los factores de producción son tierra, trabajo, capital y capacidad empresarial.",
    "La ley de la oferta y la demanda determina el precio de los bienes en un mercado.",
    "Un mercado de competencia perfecta tiene muchos compradores y vendedores.",
    "El monopolio es un mercado con un único vendedor para un bien o servicio.",
    "El Producto Interior Bruto (PIB) mide el valor de la producción de un país.",
    "La inflación es el aumento generalizado y sostenido de los precios.",
    "El desempleo es la situación de la población activa que no tiene trabajo.",
    "La política fiscal utiliza los impuestos y el gasto público para influir en la economía.",
    "El Banco Central Europeo es responsable de la política monetaria en la eurozona.",
    "La empresa es la unidad básica de producción en una economía.",
    "El emprendedor es la persona que identifica una oportunidad y crea una empresa.",
    "Un plan de empresa es un documento que describe un proyecto empresarial.",
    "El marketing es el conjunto de técnicas para mejorar la comercialización de un producto.",
    "Los recursos humanos se encargan de la gestión de los trabajadores de una empresa.",
    "La contabilidad registra y resume la información económica de la empresa.",
    "Un presupuesto personal ayuda a controlar los ingresos y los gastos.",
    "El ahorro es la parte de la renta que no se destina al consumo.",
    "La inversión consiste en utilizar los ahorros para obtener una rentabilidad futura.",
    "Los agentes económicos son las familias, las empresas y el sector público.",
    "El flujo circular de la renta representa las corrientes económicas entre los agentes.",
    "La ley de la demanda establece que la cantidad demandada disminuye si el precio sube.",
    "El punto de equilibrio del mercado se alcanza cuando la oferta iguala a la demanda.",
    "El dinero es un medio de cambio generalmente aceptado por la sociedad.",
    "Los bancos son intermediarios financieros que captan depósitos y conceden préstamos.",
    "El tipo de interés es el precio del dinero.",
    "La balanza de pagos registra todas las transacciones de un país con el exterior.",
    "El comercio internacional permite a los países especializarse y ser más eficientes.",
    "La responsabilidad social corporativa implica un compromiso de la empresa con la sociedad.",
    "Los impuestos directos gravan la renta o la riqueza de las personas.",
    "El Impuesto sobre el Valor Añadido (IVA) es un impuesto indirecto sobre el consumo.",
    "El sector público proporciona bienes y servicios como la sanidad o la educación.",
    "La segmentación de mercado consiste en dividir el mercado en grupos de consumidores.",
    "La publicidad es una forma de comunicación que busca persuadir a los consumidores.",
    "La financiación de una empresa puede ser propia o ajena.",
    "Las acciones representan una parte del capital social de una empresa.",
    "La bolsa de valores es el mercado donde se compran y venden acciones.",
    "El riesgo en una inversión es la posibilidad de que la rentabilidad sea menor de la esperada.",
    "La diversificación consiste en repartir la inversión para reducir el riesgo."
];

const OrdenaLaFraseEso4Economia = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso4Economia;
