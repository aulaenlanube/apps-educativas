// src/apps/ordena-la-historia/eso-3-ef/OrdenaLaHistoriaEso3EF.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La planificación de un entrenamiento es esencial para lograr una mejora progresiva.", "Primero, se debe establecer un objetivo claro y realista.", "Luego, se diseña un programa que trabaje las cualidades físicas necesarias.", "Es importante aplicar los principios de sobrecarga, progresión y especificidad.", "Finalmente, se deben incluir periodos de descanso para permitir la recuperación.", "Evaluar los resultados periódicamente nos permite ajustar el plan."],
    ["En un ataque de balonmano, el equipo busca crear una situación clara de gol.", "Los jugadores mueven el balón rápidamente de un lado a otro para descolocar a la defensa.", "Realizan cruces y fintas para generar espacios libres.", "El pivote juega un papel clave fijando a los defensores centrales.", "La jugada suele culminar con un lanzamiento a portería desde una posición favorable."],
    ["La resistencia anaeróbica permite realizar esfuerzos de muy alta intensidad durante un corto periodo de tiempo.", "En este tipo de esfuerzos, el cuerpo no tiene suficiente oxígeno para producir energía.", "Un ejemplo claro es una carrera de velocidad de 100 metros lisos.", "Este esfuerzo genera una 'deuda de oxígeno' que debe ser recuperada tras la prueba.", "El entrenamiento de series cortas y rápidas ayuda a mejorarla."],
    ["El bádminton es un deporte de raqueta que requiere una gran condición física y técnica.", "Se juega con un volante o pluma, que tiene una trayectoria de vuelo muy particular.", "El objetivo es que el volante caiga en el campo del contrario pasando por encima de la red.", "Combina movimientos rápidos, saltos y golpeos precisos.", "Un partido se disputa al mejor de tres sets de 21 puntos."],
    ["La reanimación cardiopulmonar (RCP) es una técnica de primeros auxilios que puede salvar vidas.", "Se aplica cuando una persona no respira y su corazón ha dejado de latir.", "Primero, debemos asegurar la zona y comprobar la consciencia de la víctima.", "Luego, colocamos nuestras manos en el centro de su pecho y realizamos compresiones torácicas.", "Es crucial llamar a los servicios de emergencia lo antes posible.", "La RCP mantiene el flujo de sangre oxigenada al cerebro hasta que llegue la ayuda."],
    ["La defensa en zona en baloncesto implica que cada jugador defiende un área específica de la cancha.", "No se persigue a un atacante concreto por todo el campo.", "Los jugadores se mueven de forma coordinada para cerrar los espacios al equipo rival.", "Es una defensa muy efectiva contra equipos que no tienen buenos tiradores exteriores.", "Requiere una gran comunicación y trabajo en equipo entre los defensores."],
    ["La expresión corporal nos permite comunicar ideas y emociones sin usar palabras.", "Utilizamos nuestro cuerpo, nuestros gestos y nuestros movimientos como lenguaje.", "Actividades como el mimo o la danza son formas de expresión corporal.", "Nos ayuda a desarrollar la creatividad y a desinhibirnos.", "También mejora nuestro conocimiento y control sobre nuestro propio cuerpo."],
    ["El judo es un arte marcial y deporte de combate de origen japonés.", "Su objetivo principal es derribar al oponente utilizando su propia fuerza.", "Una vez en el suelo, se busca inmovilizarlo o forzar su rendición.", "El respeto hacia el rival y el autocontrol son valores fundamentales en el judo.", "Los judokas se clasifican por cinturones de colores según su nivel técnico."],
    ["Una dieta equilibrada es la que nos aporta todos los nutrientes en la proporción adecuada.", "Los hidratos de carbono deben ser la principal fuente de energía.", "Las proteínas son necesarias para el crecimiento y la reparación de tejidos.", "Las grasas nos aportan energía y son esenciales para algunas funciones vitales.", "Las vitaminas y minerales, presentes en frutas y verduras, regulan el funcionamiento del cuerpo."],
    ["Las actividades en el medio natural, como el senderismo, nos ofrecen múltiples beneficios.", "Mejoran nuestra condición física al caminar por terrenos variados.", "Nos permiten disfrutar de la naturaleza y aprender a respetarla.", "Reducen el estrés y mejoran nuestro bienestar mental.", "Es importante planificar bien la ruta y llevar el equipamiento adecuado."]
];

const OrdenaLaHistoriaEso3EF = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3EF;
