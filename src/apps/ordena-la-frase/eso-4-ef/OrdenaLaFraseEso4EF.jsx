// src/apps/ordena-la-frase-eso-4-ef/OrdenaLaFraseEso4EF.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "El entrenamiento de la fuerza-resistencia mejora la capacidad de soportar la fatiga.",
    "La planificación del entrenamiento se divide en macrociclos, mesociclos y microciclos.",
    "El método Fartlek consiste en realizar cambios de ritmo durante la carrera.",
    "Los sistemas tácticos en deportes de equipo buscan la superioridad sobre el rival.",
    "La defensa en zona implica que cada jugador es responsable de un área del campo.",
    "El voleibol moderno fue creado por William G. Morgan en 1895.",
    "El dopaje genético es una amenaza potencial para la integridad del deporte.",
    "La biomecánica estudia las fuerzas y los movimientos del cuerpo humano.",
    "El umbral anaeróbico es la intensidad a partir de la cual se acumula ácido láctico.",
    "La agilidad es la capacidad de ejecutar movimientos rápidos y precisos.",
    "El ultimate frisbee es un deporte de equipo autoarbitrado que promueve el espíritu de juego.",
    "La propiocepción es el sentido que informa al organismo de la posición de los músculos.",
    "Una dieta equilibrada debe adaptarse a la intensidad y tipo de entrenamiento.",
    "La psicología deportiva ayuda a los atletas a manejar la presión y la motivación.",
    "La técnica del crol es la más rápida en el estilo de natación.",
    "La halterofilia es un deporte que consiste en el levantamiento de peso.",
    "Las actividades en el medio natural deben realizarse con seguridad y respeto al entorno.",
    "La frecuencia cardíaca máxima es un parámetro para controlar la intensidad del ejercicio.",
    "El COI es el organismo encargado de promover el olimpismo en el mundo.",
    "La flexibilidad estática consiste en mantener una posición de estiramiento.",
    "El principio de especificidad indica que el entrenamiento debe ser específico para el deporte.",
    "El ataque posicional en balonmano busca crear espacios en la defensa rival.",
    "El 'pick and roll' es una jugada ofensiva muy común en baloncesto.",
    "El CO2 máximo es la máxima cantidad de oxígeno que el organismo puede consumir.",
    "La danza contemporánea se caracteriza por la libertad de movimiento y expresión.",
    "La nutrición es un factor clave en la recuperación después del entrenamiento.",
    "La maniobra de Heimlich se utiliza en casos de atragantamiento.",
    "El arbitraje desempeña un papel fundamental para garantizar el juego limpio.",
    "El entrenamiento funcional busca mejorar las capacidades para las actividades cotidianas.",
    "El triatlón es un deporte que combina natación, ciclismo y carrera a pie.",
    "El principio de individualización adapta el entrenamiento a cada persona.",
    "La táctica deportiva es el conjunto de acciones para sorprender al adversario.",
    "El saque en suspensión en voleibol es una técnica de ataque muy potente.",
    "La capacidad aeróbica es la base para los deportes de resistencia.",
    "El yoga es una disciplina que conecta el cuerpo, la respiración y la mente.",
    "Los suplementos nutricionales deben ser supervisados por un profesional.",
    "La prevención de lesiones es un aspecto prioritario en cualquier programa de entrenamiento.",
    "El 'fair play' o juego limpio es un pilar ético del deporte.",
    "El pádel es un deporte con gran crecimiento en los últimos años.",
    "La periodización del entrenamiento organiza las cargas de trabajo a lo largo del tiempo."
];

const OrdenaLaFraseEso4EF = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso4EF;
