import React from 'react';
import { useOrdenaLaFraseGame } from '../../hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '../_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '../_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La energía solar se obtiene a través de paneles que captan la luz del sol.", "El ciclo del agua describe la evaporación, condensación y precipitación.",
    "Los ecosistemas están formados por seres vivos y el medio en el que habitan.", "La Constitución es la ley más importante que organiza un país.",
    "Durante la Edad Media, se construyeron grandes castillos para la defensa.", "El sistema circulatorio transporta nutrientes y oxígeno por todo el cuerpo.",
    "La biodiversidad es la gran variedad de seres vivos que existen en la Tierra.", "Las células son las unidades más pequeñas que forman a los seres vivos.",
    "El relieve de una zona incluye sus montañas, valles, llanuras y costas.", "La atmósfera terrestre tiene varias capas, como la troposfera y la estratosfera.",
    "Los continentes se han movido a lo largo de millones de años.", "El Renacimiento fue una época de grandes avances en el arte y la ciencia.",
    "La gravedad es la fuerza que atrae los objetos hacia el centro de la Tierra.", "Los derechos humanos son universales y deben ser respetados en todo el mundo.",
    "El reciclaje ayuda a reducir la contaminación y a conservar los recursos naturales.", "La comunicación es esencial para resolver conflictos de forma pacífica.",
    "Los animales vertebrados, como los mamíferos, tienen columna vertebral.", "El telescopio permitió a Galileo Galilei observar los planetas y las estrellas.",
    "La Revolución Francesa cambió la historia de Europa a finales del siglo XVIII.", "Una alimentación equilibrada incluye frutas, verduras, proteínas y cereales.",
    "Los minerales son sustancias naturales con una composición química definida.", "El poder legislativo, el ejecutivo y el judicial son los tres poderes del Estado.",
    "Las placas tectónicas son grandes fragmentos de la corteza terrestre.", "El sistema nervioso coordina todas las funciones de nuestro cuerpo.",
    "Los antiguos egipcios desarrollaron un sistema de escritura llamado jeroglíficos.", "La polinización es necesaria para que muchas plantas puedan reproducirse.",
    "Los océanos cubren la mayor parte de la superficie de nuestro planeta.", "La democracia es un sistema de gobierno donde los ciudadanos eligen a sus representantes.",
    "La migración es el desplazamiento de animales de una región a otra.", "Los adjetivos calificativos describen cómo son las personas, animales o cosas.",
    "El perímetro de una figura es la suma de la longitud de todos sus lados.", "Los verbos en infinitivo terminan en -ar, -er o -ir.",
    "Una biografía narra los acontecimientos más importantes en la vida de una persona.", "Las fracciones se utilizan para representar partes de una unidad.",
    "Los sinónimos son palabras que tienen un significado similar o parecido.", "Los antónimos son palabras que tienen significados opuestos entre sí.",
    "La leyenda es una narración popular que mezcla hechos reales con imaginarios.", "Para calcular el área de un rectángulo, se multiplica la base por la altura.",
    "Las palabras agudas llevan tilde cuando terminan en vocal, 'n' o 's'.", "El sujeto de una oración es quien realiza la acción del verbo.",
    "Los números decimales se utilizan para expresar cantidades no enteras.", "La poesía utiliza el lenguaje de una manera artística para expresar emociones.",
    "Un ángulo recto es aquel que mide exactamente noventa grados.", "Las palabras esdrújulas siempre llevan tilde en la antepenúltima sílaba.",
    "El predicado es la parte de la oración que dice algo sobre el sujeto.", "La escala de un mapa indica la relación entre una distancia en el mapa y la realidad.",
    "Los pronombres personales sustituyen a los nombres para evitar repeticiones.", "Una división es exacta cuando el resto es igual a cero.",
    "Las metáforas son figuras literarias que establecen una relación de semejanza.", "Las unidades de medida nos sirven para expresar longitudes, masas o capacidades.",
    "La Gran Muralla China fue construida para proteger el imperio de los ataques.", "El Imperio Romano fue una de las civilizaciones más influyentes de la antigüedad.",
    "La imprenta, inventada por Gutenberg, permitió difundir el conocimiento masivamente.", "El efecto invernadero es un fenómeno natural que calienta el planeta.",
    "La cadena alimentaria muestra cómo se transfiere la energía entre los seres vivos.", "Los anfibios, como las ranas, pueden vivir tanto en el agua como en la tierra.",
    "Los mamíferos se caracterizan por tener pelo y alimentar a sus crías con leche.", "La fotosíntesis convierte la luz solar en energía química para la planta.",
    "La erosión es el desgaste del suelo y las rocas por el viento o el agua.", "Los eclipses ocurren cuando un astro oculta a otro total o parcialmente.",
    "La población de una ciudad es el número total de personas que viven en ella.", "Los ríos transportan sedimentos que pueden formar deltas en su desembocadura.",
    "El clima de una región depende de factores como la temperatura y las precipitaciones.", "Las vacunas preparan al cuerpo para defenderse de futuras infecciones.",
    "Los cinco sentidos nos permiten percibir el mundo que nos rodea.", "El esqueleto protege órganos vitales como el cerebro, el corazón y los pulmones.",
    "La digestión descompone los alimentos en nutrientes más pequeños.", "Los músculos nos permiten movernos y realizar diferentes acciones.",
    "Las neuronas son las células que forman nuestro sistema nervioso.", "El ADN contiene la información genética de todos los seres vivos.",
    "Los fósiles nos dan pistas sobre cómo era la vida en el pasado.", "La energía renovable proviene de fuentes naturales que no se agotan.",
    "El viento se produce por diferencias de presión en la atmósfera.", "Los terremotos son vibraciones de la corteza terrestre.",
    "Los glaciares son grandes masas de hielo que se mueven lentamente.", "La deforestación es la pérdida de bosques y selvas.",
    "Los animales en peligro de extinción necesitan nuestra protección.", "Un ciudadano tiene tanto derechos como responsabilidades.",
    "Las normas de convivencia nos ayudan a vivir en armonía.", "El ayuntamiento es el gobierno local de un municipio.",
    "Los impuestos sirven para pagar los servicios públicos como hospitales o colegios.", "El patrimonio cultural incluye monumentos, tradiciones y obras de arte.",
    "La Unión Europea es una asociación de países que colaboran entre sí.", "El comercio justo busca mejorar las condiciones de los productores.",
    "La solidaridad significa ayudar a quienes más lo necesitan.", "El diálogo es la mejor herramienta para solucionar los problemas.",
    "Leer nos permite viajar a otros mundos y aprender cosas nuevas.", "La creatividad es la capacidad de generar ideas originales y útiles.",
    "El esfuerzo constante es la clave para alcanzar nuestras metas.", "Trabajar en equipo nos permite lograr objetivos más grandes.",
    "Es importante respetar las opiniones de los demás aunque sean diferentes.", "Cuidar el medio ambiente es una responsabilidad de todos.",
    "La amistad verdadera se basa en la confianza y el respeto mutuo.", "Cada persona es única y valiosa por sus propias cualidades.",
    "Aprender de los errores nos ayuda a crecer y a mejorar.", "La curiosidad es el motor del descubrimiento y del aprendizaje."
];

const OrdenaLaFrase5 = () => {
    const game = useOrdenaLaFraseGame(frases, true); // true = con temporizador
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFrase5;