// src/apps/_shared/OrdenaLaHistoriaJuego.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';
import { getHistorias } from '@/data/api';

const OrdenaLaHistoriaJuego = () => {
    const { level, grade } = useParams();
    const [historias, setHistorias] = useState(null);

    useEffect(() => {
        const cargarContenido = async () => {
            const historiasData = await getHistorias(level, grade, 'general');
            setHistorias(historiasData);
        };
        cargarContenido();
    }, [level, grade]);

    const conTemporizador = grade >= 3;

    if (!historias) {
        return <div className="text-center p-10">Cargando juego...</div>;
    }

    const game = useOrdenaLaHistoriaGame(historias, conTemporizador);

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaJuego;