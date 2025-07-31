// src/apps/ordena-la-frase-eso-2-ef/OrdenaLaFraseEso2EF.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "Las cualidades físicas básicas son fuerza, resistencia, velocidad y flexibilidad.",
    "La resistencia aeróbica permite realizar esfuerzos de larga duración.",
    "La velocidad de reacción es el tiempo que tardamos en responder a un estímulo.",
    "El calentamiento prepara al cuerpo para la actividad física intensa.",
    "La vuelta a la calma ayuda al cuerpo a recuperarse tras el ejercicio.",
    "Una alimentación saludable es fundamental para el rendimiento deportivo.",
    "La hidratación es crucial antes, durante y después del ejercicio.",
    "En baloncesto, el objetivo es encestar el balón en la canasta contraria.",
    "El voleibol se juega con seis jugadores por equipo en la pista.",
    "El atletismo es un deporte que agrupa diversas disciplinas de carrera, saltos y lanzamientos.",
    "La técnica correcta en un deporte ayuda a prevenir lesiones.",
    "El trabajo en equipo y la cooperación son esenciales en los deportes colectivos.",
    "La frecuencia cardíaca aumenta durante la práctica de ejercicio físico.",
    "Los estiramientos mejoran la flexibilidad y reducen la tensión muscular.",
    "El acrosport es una disciplina que combina acrobacia y coreografía.",
    "La orientación deportiva requiere el uso de un mapa y una brújula.",
    "El bádminton es un deporte de raqueta que se juega con un volante.",
    "El sistema cardiovascular está formado por el corazón, la sangre y los vasos sanguíneos.",
    "La respiración correcta es importante para oxigenar los músculos.",
    "El juego limpio implica respetar las reglas, a los compañeros y a los adversarios.",
    "La fuerza muscular se puede entrenar con ejercicios de autocarga.",
    "El equilibrio es la capacidad de mantener el control del cuerpo.",
    "La coordinación es necesaria para realizar movimientos complejos de forma precisa.",
    "Los deportes alternativos utilizan materiales no convencionales.",
    "El hockey se juega con un stick para golpear una pelota o disco.",
    "Una buena condición física mejora nuestra calidad de vida.",
    "El descanso adecuado es una parte vital del entrenamiento.",
    "El dopaje es el uso de sustancias prohibidas para mejorar el rendimiento.",
    "La expresión corporal nos permite comunicar emociones a través del movimiento.",
    "Los juegos tradicionales forman parte del patrimonio cultural.",
    "El balonmano se juega con las manos y el objetivo es marcar gol.",
    "La agilidad es la capacidad de cambiar de dirección de forma rápida y eficaz.",
    "El sistema respiratorio se encarga de captar oxígeno y eliminar dióxido de carbono.",
    "La nutrición deportiva adapta la alimentación a las necesidades del atleta.",
    "Las lesiones deportivas se pueden prevenir con un buen calentamiento.",
    "El ritmo y la música son elementos clave en actividades como la danza.",
    "El senderismo es una actividad física que se realiza en la naturaleza.",
    "Los valores del deporte incluyen el esfuerzo, la superación y el compañerismo.",
    "El índice de masa corporal relaciona el peso con la altura.",
    "La actividad física regular ayuda a reducir el estrés y la ansiedad."
];

const OrdenaLaFraseEso2EF = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso2EF;
