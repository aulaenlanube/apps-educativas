// src/apps/ordena-la-frase-eso-4-biologia/OrdenaLaFraseEso4Biologia.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "El ADN es una molécula de doble hélice que contiene la información genética.",
    "Un gen es un fragmento de ADN que codifica la información para una proteína.",
    "La mitosis es el proceso de división celular que produce dos células hijas idénticas.",
    "La meiosis es la división celular que da lugar a los gametos.",
    "Las leyes de Mendel explican los patrones de la herencia genética.",
    "Un alelo es cada una de las formas alternativas que puede tener un mismo gen.",
    "El genotipo es el conjunto de genes de un individuo.",
    "El fenotipo son los rasgos observables de un individuo, resultado de su genotipo y del ambiente.",
    "Una mutación es un cambio permanente en la secuencia del ADN.",
    "La ingeniería genética permite modificar el material genético de un organismo.",
    "La teoría de la evolución por selección natural fue propuesta por Charles Darwin.",
    "La selección natural favorece a los individuos mejor adaptados a su entorno.",
    "Los fósiles son una prueba fundamental de la evolución de las especies.",
    "La ecología es la ciencia que estudia las interacciones entre los seres vivos y su ambiente.",
    "Un ecosistema está formado por una comunidad de seres vivos y el medio físico.",
    "La cadena trófica representa el flujo de energía de un organismo a otro.",
    "Los productores, como las plantas, son la base de las cadenas tróficas.",
    "La biodiversidad es la variedad de vida que existe en el planeta.",
    "La contaminación es una de las principales amenazas para la biodiversidad.",
    "La tectónica de placas explica el movimiento de los continentes.",
    "La replicación del ADN es el proceso por el cual se duplica la molécula de ADN.",
    "La transcripción es el proceso de copiar la información del ADN al ARN.",
    "La traducción es la síntesis de proteínas a partir de la información del ARN.",
    "Un individuo homocigoto tiene dos alelos iguales para un carácter.",
    "Un individuo heterocigoto tiene dos alelos diferentes para un carácter.",
    "La herencia ligada al sexo se refiere a los genes localizados en los cromosomas sexuales.",
    "La biotecnología utiliza organismos vivos para obtener productos de interés.",
    "Los organismos transgénicos han recibido un gen de otra especie.",
    "La teoría sintética de la evolución integra la genética mendeliana con la selección natural.",
    "Las pruebas biogeográficas de la evolución se basan en la distribución de las especies.",
    "Una población es un conjunto de individuos de la misma especie que viven en un área.",
    "Las relaciones interespecíficas se dan entre organismos de diferentes especies.",
    "El mutualismo es una relación en la que ambas especies se benefician.",
    "El parasitismo es una relación en la que una especie se beneficia y la otra se perjudica.",
    "La sucesión ecológica es el cambio en un ecosistema a lo largo del tiempo.",
    "El desarrollo sostenible busca un equilibrio entre economía, sociedad y medio ambiente.",
    "Los bordes de placa convergentes son zonas donde las placas tectónicas chocan.",
    "Los volcanes y terremotos son manifestaciones de la energía interna de la Tierra.",
    "El ciclo de las rocas describe cómo estas se transforman unas en otras.",
    "La historia geológica de la Tierra se divide en eones, eras y períodos."
];

const OrdenaLaFraseEso4Biologia = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso4Biologia;
