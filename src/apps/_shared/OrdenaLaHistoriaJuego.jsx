// src/apps/_shared/OrdenaLaHistoriaJuego.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';
import { getHistorias } from './../../../public/data/api';

const OrdenaLaHistoriaJuego = () => {
    const { level, grade, subjectId } = useParams();
    const [historias, setHistorias] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- CORRECCIÓN CLAVE: Mover la llamada al Hook al principio ---
    const conTemporizador = grade >= 3;
    const game = useOrdenaLaHistoriaGame(historias || [], conTemporizador);

    useEffect(() => {
        const cargarContenido = async () => {
            setIsLoading(true);
            const asignatura = level === 'primaria' ? 'general' : subjectId;
            const historiasData = await getHistorias(level, grade, asignatura);
            setHistorias(historiasData);
            setIsLoading(false);
        };
        cargarContenido();
    }, [level, grade, subjectId]);

    if (isLoading) {
        return <div className="text-center p-10 font-bold">Cargando juego...</div>;
    }

    if (!historias || historias.length === 0) {
        return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía.</div>;
    }

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaJuego;