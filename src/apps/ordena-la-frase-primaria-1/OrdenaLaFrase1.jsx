import React from 'react';
import { useOrdenaLaFraseGame } from '../../hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '../_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '../_shared/OrdenaLaFraseTestScreen';

const frases = [
    "Mi mamá me mima.", "El perro es grande.", "La niña salta alto.", "El sol brilla mucho.", "Yo leo un libro.",
    "El gato duerme.", "La casa es azul.", "El coche corre.", "La flor huele bien.", "Papá me lee.",
    "El pez nada.", "La pelota bota.", "Mi oso es suave.", "La sopa quema.", "El bebé ríe.",
    "El pájaro canta.", "La abeja vuela.", "El árbol da sombra.", "La mesa es marrón.", "Tengo una manzana.",
    "El niño juega.", "La rana salta.", "El agua está fría.", "Mi amigo se llama Leo.", "El león es fiero.",
    "La gallina pone huevos.", "El pan está rico.", "Me gusta el zumo.", "El cielo es azul.", "La nube es blanca.",
    "El perro ladra.", "El gato maúlla.", "La vaca da leche.", "El cerdo se revuelca.", "El pato nada.",
    "Tengo dos manos.", "Veo con los ojos.", "Como con la boca.", "Huelo con la nariz.", "Oigo con las orejas.",
    "El lápiz pinta.", "La goma borra.", "El libro enseña.", "La silla es para sentarse.", "La cama es para dormir.",
    "El día es claro.", "La noche es oscura.", "La estrella parpadea.", "La luna es redonda.", "El fuego da calor.",
    "El hielo es frío.", "El azúcar es dulce.", "El limón es ácido.", "La piedra es dura.", "El algodón es blando.",
    "El gigante es alto.", "El enano es bajo.", "El caracol va lento.", "El conejo corre rápido.", "El elefante es pesado.",
    "La pluma es ligera.", "El payaso es gracioso.", "La bruja es mala.", "El hada es buena.", "El rey tiene corona.",
    "La reina vive en palacio.", "El barco navega.", "El avión vuela alto.", "El tren hace chu-chú.", "La bici tiene dos ruedas.",
    "Mi abuela me quiere.", "Mi abuelo es sabio.", "Mi hermano juega conmigo.", "Mi hermana es mi amiga.", "Mi familia me cuida.",
    "Voy al colegio.", "Aprendo a leer.", "Escribo mi nombre.", "Dibujo un sol.", "Pinto con colores.",
    "Juego en el patio.", "Como en el comedor.", "Bebo agua fresca.", "Me lavo las manos.", "Me pongo el pijama.",
    "Doy un abrazo.", "Digo gracias.", "Pido por favor.", "Comparto mis juguetes.", "Ayudo en casa.",
    "El cuento es corto.", "La película es larga.", "La música suena bien.", "El silencio es tranquilo.", "La playa tiene arena.",
    "El mar tiene olas.", "El campo es verde.", "La montaña es alta.", "El río lleva agua.", "En el bosque hay árboles."
];

const OrdenaLaFrase1 = () => {
    const game = useOrdenaLaFraseGame(frases, false); // false = sin temporizador
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFrase1;