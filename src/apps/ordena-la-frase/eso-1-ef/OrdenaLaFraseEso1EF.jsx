// src/apps/ordena-la-frase-eso-1-ef/OrdenaLaFraseEso1EF.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "El calentamiento es fundamental antes de hacer ejercicio.",
    "Una dieta equilibrada es importante para la salud.",
    "El baloncesto se juega con las manos y una canasta.",
    "En fútbol, no se puede tocar el balón con las manos.",
    "La flexibilidad se mejora con los estiramientos.",
    "El trabajo en equipo es clave en los deportes colectivos.",
    "La resistencia nos permite aguantar un esfuerzo durante más tiempo.",
    "La hidratación es esencial cuando practicamos deporte.",
    "El atletismo incluye carreras, saltos y lanzamientos.",
    "Las pulsaciones indican la frecuencia de nuestro corazón.",
    "El voleibol se juega pasando el balón por encima de una red.",
    "Una buena postura corporal previene dolores de espalda.",
    "El juego limpio significa respetar las reglas y a los rivales.",
    "La coordinación nos ayuda a mover el cuerpo de forma eficiente.",
    "El equilibrio es la capacidad de mantener una posición estable.",
    "La velocidad es la capacidad de moverse en el menor tiempo posible.",
    "Los músculos son los responsables del movimiento de nuestro cuerpo.",
    "El descanso es tan importante como el entrenamiento.",
    "El bádminton se juega con una raqueta y un volante.",
    "La higiene personal es fundamental después de la actividad física.",
    "El acrosport combina acrobacias y figuras humanas.",
    "La orientación consiste en encontrar puntos en un mapa.",
    "El hockey se juega con un stick y una pelota o disco.",
    "La fuerza es la capacidad de vencer una resistencia.",
    "El judo es un arte marcial de origen japonés.",
    "Los estiramientos ayudan a prevenir lesiones musculares.",
    "El balonmano es un deporte de equipo con siete jugadores.",
    "La agilidad permite cambiar de dirección rápidamente.",
    "El cuerpo humano necesita moverse para estar sano.",
    "Los juegos populares son parte de nuestra cultura.",
    "El ajedrez es un deporte que ejercita la mente.",
    "La natación es uno de los deportes más completos.",
    "El ciclismo fortalece las piernas y el corazón.",
    "La expresión corporal utiliza el cuerpo para comunicar.",
    "El ritmo es importante en actividades como el baile.",
    "Una vida activa previene muchas enfermedades.",
    "Los primeros auxilios son importantes en caso de accidente.",
    "El fair play es un valor fundamental en el deporte.",
    "La alimentación debe ser variada y rica en nutrientes.",
    "Después del ejercicio, es importante volver a la calma."
];

const OrdenaLaFraseEso1EF = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso1EF;
