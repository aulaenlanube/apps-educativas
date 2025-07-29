// src/apps/ordena-la-historia-primaria-1/OrdenaLaHistoria1.jsx (CORREGIDO)
import React from 'react';
import { useOrdenaLaHistoriaGame } from '../../hooks/useOrdenaLaHistoriaGame';
// --- RUTAS DE IMPORTACIÓN CORREGIDAS ---
import OrdenaLaHistoriaUI from '../_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '../_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El perro juega.", "Corre en el parque.", "Luego, bebe agua."],
    ["La niña pinta.", "Usa el color rojo.", "Dibuja una casa."],
    ["El sol sale.", "El gallo canta.", "Es un nuevo día."],
    ["Mi gato es mimoso.", "Le gusta dormir.", "Duerme en el sofá."],
    ["Veo un pájaro.", "Está en el árbol.", "Canta una canción."],
    ["La rana salta.", "Salta en el charco.", "El charco tiene agua."],
    ["Tengo una pelota.", "La pelota es azul.", "Juego con la pelota."],
    ["El pez nada.", "Nada en el río.", "El río es largo."],
    ["Es de noche.", "La luna brilla.", "Las estrellas se ven."],
    ["Papá lee un cuento.", "El cuento es de un león.", "El león es valiente."]
];

const OrdenaLaHistoria1 = () => {
    // El 'false' indica que no hay temporizador para este nivel
    const game = useOrdenaLaHistoriaGame(historias, false); 

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoria1;