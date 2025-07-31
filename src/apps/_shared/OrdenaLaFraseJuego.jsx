// src/apps/_shared/OrdenaLaFraseJuego.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';
import { getFrases } from '@/data/api';

const OrdenaLaFraseJuego = () => {
    const { level, grade, subjectId } = useParams();
    const [frases, setFrases] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cargarContenido = async () => {
            setIsLoading(true);
            const asignatura = level === 'primaria' ? 'general' : subjectId;
            const frasesData = await getFrases(level, grade, asignatura);
            setFrases(frasesData);
            setIsLoading(false);
        };
        cargarContenido();
    }, [level, grade, subjectId]);

    const conTemporizador = (level === 'primaria' && grade >= 3) || level === 'eso';

    if (isLoading) {
        return <div className="text-center p-10 font-bold">Cargando juego...</div>;
    }

    if (!frases || frases.length === 0) {
        return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía.</div>;
    }

    const game = useOrdenaLaFraseGame(frases, conTemporizador);

    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseJuego;