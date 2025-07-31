// src/apps/ordena-la-historia/eso-4-ef/OrdenaLaHistoriaEso4EF.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La planificación del entrenamiento deportivo se organiza en diferentes ciclos.", "El macrociclo es el plan completo para una temporada o un año.", "Se divide en mesociclos, que son bloques de varias semanas con objetivos concretos.", "Cada mesociclo se compone de microciclos, que son las semanas de entrenamiento.", "Finalmente, el microciclo se desglosa en las sesiones diarias de trabajo.", "Esta organización permite una progresión lógica y evita el sobreentrenamiento."],
    ["El dopaje es el uso de sustancias o métodos prohibidos para aumentar artificialmente el rendimiento.", "Supone una grave violación de la ética deportiva y del juego limpio.", "Pone en riesgo la salud de los deportistas que lo practican.", "Existen agencias antidopaje, como la WADA, que realizan controles para detectarlo.", "Los deportistas que dan positivo se enfrentan a duras sanciones.", "Luchar contra el dopaje es fundamental para proteger la integridad del deporte."],
    ["La biomecánica es la ciencia que estudia el movimiento del cuerpo humano desde una perspectiva mecánica.", "Analiza las fuerzas que actúan sobre el cuerpo y los efectos que producen.", "Ayuda a los deportistas a mejorar su técnica para ser más eficientes.", "Por ejemplo, estudia la mejor postura para correr más rápido o lanzar más lejos.", "También es fundamental para diseñar material deportivo más seguro y eficaz.", "Su aplicación permite optimizar el rendimiento y prevenir lesiones."],
    ["En un partido de voleibol, la recepción del saque es la primera acción de ataque.", "El objetivo es pasar el balón al colocador en las mejores condiciones posibles.", "El colocador es el 'cerebro' del equipo y decide a quién pasar el balón para el remate.", "El rematador salta y golpea el balón con fuerza para enviarlo al campo contrario.", "Mientras tanto, los otros jugadores preparan el bloqueo defensivo.", "Una buena recepción es la clave para poder construir un buen ataque."],
    ["La psicología deportiva ayuda a los atletas a afrontar los aspectos mentales de la competición.", "Enseña técnicas para controlar la ansiedad y el estrés antes de una prueba.", "Trabaja para mejorar la concentración y la atención durante el rendimiento.", "Ayuda a establecer metas realistas y a mantener la motivación a largo plazo.", "También es importante para gestionar la frustración después de una derrota.", "Un deportista fuerte mentalmente tiene una gran ventaja competitiva."],
    ["El entrenamiento en circuito o 'circuit training' es un método muy completo.", "Consiste en realizar una serie de ejercicios diferentes de forma consecutiva.", "Cada ejercicio se realiza en una 'estación' durante un tiempo o número de repeticiones.", "Se pasa de una estación a otra con un descanso muy corto o sin él.", "Permite trabajar diferentes cualidades físicas, como la fuerza y la resistencia, en una misma sesión.", "Es una forma de entrenamiento muy eficiente y variada."],
    ["La táctica en los deportes de equipo es el plan de acción para superar al adversario.", "La táctica ofensiva busca crear y aprovechar los espacios para marcar.", "La táctica defensiva intenta cerrar los espacios y recuperar la posesión del balón.", "La estrategia es el plan general para todo el partido, mientras que la táctica son las acciones concretas.", "Un buen equipo debe ser capaz de adaptarse y cambiar de táctica durante el partido."],
    ["El umbral anaeróbico es un indicador clave del rendimiento en deportes de resistencia.", "Es la intensidad de ejercicio a partir de la cual el cuerpo empieza a acumular ácido láctico.", "El ácido láctico es un producto de desecho que causa fatiga muscular.", "Entrenar justo por debajo o en este umbral ayuda a que el cuerpo se adapte.", "Un atleta bien entrenado puede mantener una intensidad más alta sin superar su umbral.", "Mejorar este parámetro es un objetivo fundamental para corredores o ciclistas."],
    ["El 'Ultimate Frisbee' es un deporte de equipo que se juega con un disco volador.", "Se juega en un campo rectangular con dos zonas de marca en los extremos.", "Se anota un punto cuando un jugador recibe un pase dentro de la zona de marca del equipo contrario.", "El jugador que tiene el disco no puede correr, solo puede pivotar.", "Una de sus características más especiales es que es autoarbitrado, basándose en el 'espíritu de juego'."],
    ["La nutrición deportiva es fundamental para optimizar el rendimiento y la recuperación.", "Los hidratos de carbono son el principal combustible para los músculos durante el ejercicio.", "Las proteínas son esenciales para reparar las fibras musculares dañadas tras el entrenamiento.", "Una correcta hidratación antes, durante y después es crucial para evitar la deshidratación.", "La planificación de las comidas en torno a los entrenamientos se conoce como 'timing' nutricional.", "Una buena nutrición es el entrenamiento invisible del deportista."]
];

const OrdenaLaHistoriaEso4EF = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso4EF;
