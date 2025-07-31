// src/apps/ordena-la-frase-eso-1-musica/OrdenaLaFraseEso1Musica.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "Las notas musicales son do, re, mi, fa, sol, la y si.",
    "El pentagrama es el lugar donde se escriben las notas musicales.",
    "La clave de sol se coloca al principio del pentagrama.",
    "Una redonda es la figura musical de mayor duración.",
    "El pulso es el latido regular de la música.",
    "La orquesta sinfónica agrupa instrumentos de cuerda, viento y percusión.",
    "El piano es un instrumento de cuerda percutida.",
    "La flauta dulce es un instrumento de viento madera.",
    "El ritmo es la combinación de sonidos y silencios en el tiempo.",
    "La melodía es una sucesión de sonidos con sentido musical.",
    "La intensidad en música se refiere al volumen del sonido.",
    "Forte significa que se debe tocar con un sonido fuerte.",
    "Piano significa que se debe interpretar con un sonido suave.",
    "El compás organiza la música en partes de igual duración.",
    "Una corchea dura la mitad que una negra.",
    "El director de orquesta guía a los músicos con sus gestos.",
    "La guitarra es un instrumento muy popular de cuerda pulsada.",
    "Los instrumentos de percusión se tocan golpeándolos o agitándolos.",
    "El violín es el instrumento más agudo de la familia de la cuerda frotada.",
    "Un coro es un grupo de personas que cantan juntas.",
    "La escala musical es una sucesión ordenada de notas.",
    "El silencio es una parte fundamental de la música.",
    "Mozart fue un compositor muy famoso del Clasicismo.",
    "Beethoven compuso sinfonías muy importantes.",
    "El timbre es la cualidad que nos permite diferenciar los instrumentos.",
    "La altura del sonido nos indica si es grave o agudo.",
    "Una canción suele tener estrofas y un estribillo.",
    "La música puede expresar diferentes emociones y sentimientos.",
    "El pentagrama tiene cinco líneas y cuatro espacios.",
    "La trompeta es un instrumento de viento metal.",
    "El arpa tiene muchas cuerdas que se pulsan con los dedos.",
    "El xilófono está formado por láminas de madera.",
    "La música folclórica es la música tradicional de un pueblo.",
    "El rock and roll es un estilo de música muy enérgico.",
    "La ópera es una obra de teatro cantada con acompañamiento de orquesta.",
    "Una partitura es el texto completo de una obra musical.",
    "El tempo indica la velocidad a la que se debe interpretar una pieza.",
    "Adagio es un tempo lento y allegro es un tempo rápido.",
    "La armonía es la combinación de diferentes sonidos que suenan a la vez.",
    "La clave de fa se usa para escribir los sonidos más graves."
];

const OrdenaLaFraseEso1Musica = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso1Musica;
