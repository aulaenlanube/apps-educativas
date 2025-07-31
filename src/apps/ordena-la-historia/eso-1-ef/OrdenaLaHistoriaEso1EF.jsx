// src/apps/ordena-la-historia/eso-1-ef/OrdenaLaHistoriaEso1EF.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Antes de empezar cualquier actividad física, es fundamental realizar un buen calentamiento.", "Comenzamos con movilidad articular para preparar las articulaciones.", "Luego, hacemos ejercicios suaves para aumentar la temperatura corporal.", "Terminamos con estiramientos de los principales grupos musculares.", "Así, preparamos el cuerpo para el esfuerzo y evitamos lesiones."],
    ["El baloncesto es un deporte de equipo que se juega con las manos.", "El objetivo es introducir el balón en la canasta del equipo contrario.", "No se puede correr con el balón en las manos sin botarlo.", "Cada canasta normal vale dos puntos, y si es desde lejos, tres.", "Gana el equipo que consigue más puntos al final del partido."],
    ["Una dieta equilibrada es clave para la salud de un deportista.", "Debe incluir hidratos de carbono para tener energía.", "Las proteínas son necesarias para construir y reparar los músculos.", "Las frutas y verduras aportan vitaminas y minerales esenciales.", "Además, es muy importante beber mucha agua para estar bien hidratado."],
    ["El juego limpio, o 'fair play', es un valor esencial en el deporte.", "Significa respetar las reglas del juego en todo momento.", "También implica respetar a los compañeros, a los adversarios y al árbitro.", "Es más importante participar y esforzarse que ganar a cualquier precio."],
    ["La resistencia es la capacidad de aguantar un esfuerzo durante un tiempo prolongado.", "Para mejorarla, podemos practicar actividades como correr o nadar.", "Es importante mantener un ritmo constante y controlar la respiración.", "Con el entrenamiento, nuestro corazón y pulmones se hacen más fuertes.", "Esto nos permite cansarnos menos en nuestra vida diaria."],
    ["En una carrera de relevos, varios corredores de un mismo equipo se pasan un testigo.", "El primer corredor sale lo más rápido posible.", "Debe entregar el testigo al siguiente compañero dentro de una zona marcada.", "La coordinación en la entrega es crucial para no perder tiempo.", "El último corredor corre hasta la meta para finalizar la prueba."],
    ["La flexibilidad es la capacidad de mover nuestras articulaciones en su máxima amplitud.", "Se mejora realizando ejercicios de estiramiento de forma regular.", "Los estiramientos deben ser suaves y mantenidos, sin sentir dolor.", "Una buena flexibilidad ayuda a prevenir lesiones y mejora la postura corporal."],
    ["Después de una sesión de ejercicio intenso, es importante realizar la vuelta a la calma.", "Consiste en hacer ejercicios de baja intensidad, como caminar o trotar suavemente.", "Su objetivo es que la frecuencia cardíaca vuelva poco a poco a la normalidad.", "Terminamos con estiramientos suaves para relajar la musculatura."],
    ["El voleibol se juega pasando un balón por encima de una red.", "Cada equipo tiene tres toques para devolver el balón al campo contrario.", "El balón no puede botar en el suelo de nuestro campo.", "Los jugadores van rotando sus posiciones en el sentido de las agujas del reloj."],
    ["El atletismo incluye diferentes pruebas de saltos.", "En el salto de longitud, el atleta corre y salta para alcanzar la máxima distancia horizontal.", "En el salto de altura, el objetivo es superar un listón sin derribarlo.", "Ambas pruebas requieren una combinación de velocidad, fuerza y técnica."]
];

const OrdenaLaHistoriaEso1EF = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1EF;
