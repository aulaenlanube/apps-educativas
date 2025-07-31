// src/apps/ordena-la-frase-eso-3-biologia/OrdenaLaFraseEso3Biologia.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "El aparato digestivo transforma los alimentos en nutrientes absorbibles.",
    "La respiración celular es el proceso que libera energía de los nutrientes.",
    "El sistema circulatorio transporta oxígeno, nutrientes y desechos por el cuerpo.",
    "El sistema excretor elimina las sustancias de desecho de la sangre.",
    "El sistema nervioso coordina y controla todas las funciones del organismo.",
    "Las neuronas son las células especializadas en transmitir el impulso nervioso.",
    "Los sentidos nos permiten captar información del entorno que nos rodea.",
    "El sistema endocrino regula funciones corporales mediante hormonas.",
    "El aparato locomotor, formado por huesos y músculos, permite el movimiento.",
    "La reproducción humana es sexual e implica la unión de dos gametos.",
    "Un estilo de vida saludable incluye una dieta equilibrada y ejercicio físico.",
    "Las enfermedades infecciosas son causadas por microorganismos patógenos.",
    "El sistema inmunitario es la defensa natural del cuerpo contra las infecciones.",
    "Las vacunas preparan al sistema inmunitario para combatir patógenos específicos.",
    "Los trasplantes consisten en sustituir un órgano o tejido enfermo por uno sano.",
    "La donación de órganos es un acto altruista que puede salvar vidas.",
    "La geodinámica interna de la Tierra origina volcanes y terremotos.",
    "Las placas tectónicas se desplazan lentamente sobre el manto terrestre.",
    "La erosión, el transporte y la sedimentación modelan el relieve terrestre.",
    "Las rocas se clasifican en ígneas, sedimentarias y metamórficas.",
    "Las enzimas digestivas aceleran la descomposición química de los alimentos.",
    "La sangre está compuesta por plasma, glóbulos rojos, glóbulos blancos y plaquetas.",
    "La nefrona es la unidad funcional del riñón encargada de filtrar la sangre.",
    "El sistema nervioso central está formado por el encéfalo y la médula espinal.",
    "Un acto reflejo es una respuesta rápida e involuntaria a un estímulo.",
    "Las hormonas son mensajeros químicos que viajan por la sangre.",
    "Las articulaciones son las uniones entre los huesos que facilitan el movimiento.",
    "El ciclo menstrual prepara el cuerpo de la mujer para un posible embarazo.",
    "Las drogas son sustancias que alteran el funcionamiento del sistema nervioso.",
    "Los antibióticos son eficaces contra las bacterias, pero no contra los virus.",
    "La litosfera es la capa sólida y más externa de la Tierra.",
    "Los terremotos se producen por la liberación brusca de energía en la corteza.",
    "Un tsunami es una ola gigante generada por un terremoto submarino.",
    "Los minerales son sólidos inorgánicos con una estructura cristalina definida.",
    "Las rocas sedimentarias se forman por la compactación de sedimentos.",
    "El metamorfismo transforma las rocas por la acción de la presión y la temperatura.",
    "Un fósil es un resto de un ser vivo del pasado que se ha petrificado.",
    "La escala de Mohs mide la dureza de los minerales.",
    "La salud es un estado de completo bienestar físico, mental y social.",
    "La prevención es la medida más eficaz para evitar enfermedades."
];

const OrdenaLaFraseEso3Biologia = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso3Biologia;
