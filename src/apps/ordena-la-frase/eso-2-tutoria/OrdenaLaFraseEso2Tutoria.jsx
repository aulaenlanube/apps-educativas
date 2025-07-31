// src/apps/ordena-la-frase-eso-2-tutoria/OrdenaLaFraseEso2Tutoria.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La adolescencia es una etapa de importantes cambios físicos y emocionales.",
    "La asertividad nos permite defender nuestros derechos sin agredir a los demás.",
    "La empatía es fundamental para comprender los sentimientos de otras personas.",
    "Una buena organización del tiempo mejora el rendimiento académico.",
    "El trabajo cooperativo fomenta la responsabilidad y la solidaridad.",
    "La mediación es una herramienta útil para resolver conflictos de forma pacífica.",
    "La autoestima es la valoración que hacemos de nosotros mismos.",
    "Es importante aprender a tomar decisiones de forma responsable.",
    "Las emociones, como la alegría o la tristeza, son parte natural de la vida.",
    "El ciberacoso es una forma de violencia que se produce a través de internet.",
    "Debemos proteger nuestra privacidad en las redes sociales.",
    "El pensamiento crítico nos ayuda a analizar la información y a no creer todo.",
    "Establecer metas realistas nos ayuda a avanzar y a sentirnos competentes.",
    "La resiliencia es la capacidad de superar las situaciones difíciles.",
    "El respeto a la diversidad enriquece al grupo y a la sociedad.",
    "La comunicación eficaz requiere saber escuchar y expresar nuestras ideas claramente.",
    "La presión de grupo puede influir en nuestras decisiones.",
    "Es importante desarrollar hábitos de vida saludables.",
    "La igualdad entre hombres y mujeres es un principio fundamental.",
    "La participación activa en clase mejora el ambiente y el aprendizaje.",
    "La solidaridad implica ayudar a los demás de forma desinteresada.",
    "Conocer diferentes profesiones puede ayudarte a orientar tu futuro.",
    "La prevención de adicciones es clave para una vida sana.",
    "Debemos ser conscientes de los estereotipos y prejuicios para evitarlos.",
    "La gestión del estrés es una habilidad importante para nuestro bienestar.",
    "La amistad se construye con confianza, lealtad y apoyo mutuo.",
    "El voluntariado es una forma de contribuir a mejorar la comunidad.",
    "Aprender a decir 'no' es una parte importante de la asertividad.",
    "La curiosidad y las ganas de aprender son el motor del conocimiento.",
    "La responsabilidad de nuestros actos es un signo de madurez.",
    "El autoconocimiento nos permite entender nuestras fortalezas y debilidades.",
    "La inteligencia emocional es la capacidad de reconocer y gestionar las emociones.",
    "Los valores son los principios que guían nuestro comportamiento.",
    "La creatividad nos permite encontrar soluciones originales a los problemas.",
    "El ocio y el tiempo libre son necesarios para nuestro desarrollo personal.",
    "La lectura nos abre la mente a nuevas ideas y mundos.",
    "El esfuerzo y la constancia son claves para alcanzar el éxito.",
    "Debemos tratar a los demás como nos gustaría que nos trataran a nosotros.",
    "La participación en las actividades del centro educativo nos enriquece.",
    "El cuidado del entorno y del material común es responsabilidad de todos."
];

const OrdenaLaFraseEso2Tutoria = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso2Tutoria;
