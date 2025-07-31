// src/apps/ordena-la-frase-eso-1-biologia/OrdenaLaFraseEso1Biologia.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La célula es la unidad básica de todos los seres vivos.",
    "Los seres vivos se clasifican en cinco reinos diferentes.",
    "Las plantas fabrican su propio alimento mediante la fotosíntesis.",
    "Los animales vertebrados tienen una columna vertebral.",
    "Los mamíferos alimentan a sus crías con leche materna.",
    "La Tierra está formada por varias capas: corteza, manto y núcleo.",
    "Las rocas están compuestas por uno o varios minerales.",
    "Los fósiles son restos de seres vivos del pasado.",
    "Un ecosistema incluye a los seres vivos y el lugar donde habitan.",
    "La atmósfera es la capa de gases que rodea nuestro planeta.",
    "Los minerales tienen propiedades como el color, el brillo y la dureza.",
    "El ciclo del agua describe su movimiento continuo en la Tierra.",
    "Los reptiles son animales vertebrados que tienen escamas.",
    "Los anfibios, como las ranas, viven en el agua y en la tierra.",
    "El reino de los hongos incluye las setas y las levaduras.",
    "La corteza terrestre está dividida en placas tectónicas.",
    "Los terremotos se producen por el movimiento de las placas tectónicas.",
    "Los volcanes expulsan magma del interior de la Tierra.",
    "La nutrición, la relación y la reproducción son las funciones vitales.",
    "Los animales invertebrados no tienen esqueleto interno.",
    "Los insectos son el grupo de animales más numeroso.",
    "Las rocas magmáticas se forman al enfriarse el magma.",
    "Las rocas sedimentarias se originan a partir de restos de otras rocas.",
    "La erosión es el desgaste del relieve por el viento o el agua.",
    "El universo está formado por miles de millones de galaxias.",
    "Nuestro sistema solar se encuentra en la galaxia Vía Láctea.",
    "Las plantas utilizan las raíces para absorber agua y sales minerales.",
    "Los peces respiran a través de branquias bajo el agua.",
    "La cadena alimentaria representa quién se come a quién en un ecosistema.",
    "Los productores, como las plantas, inician la cadena alimentaria.",
    "Los consumidores primarios son los animales herbívoros.",
    "La hidrosfera es toda el agua que hay en el planeta Tierra.",
    "Los minerales se pueden identificar por su raya y su exfoliación.",
    "Las aves son animales vertebrados que tienen el cuerpo cubierto de plumas.",
    "La polinización es el transporte del polen de una flor a otra.",
    "Los fósiles nos ayudan a entender la historia de la vida.",
    "La geología es la ciencia que estudia la Tierra.",
    "La biología es la ciencia que estudia a los seres vivos.",
    "El núcleo es la parte de la célula que contiene el material genético.",
    "Los artrópodos, como los insectos, tienen un esqueleto externo."
];

const OrdenaLaFraseEso1Biologia = () => {
    const game = useOrdenaLaFraseGame(frases, true); // true = con temporizador
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso1Biologia;
