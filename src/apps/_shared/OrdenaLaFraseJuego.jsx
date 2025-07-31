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

    // Este efecto se encarga de cargar las frases necesarias desde la API
    useEffect(() => {
        const cargarContenido = async () => {
            // Para primaria, el subjectId no está en la URL, así que lo ponemos a 'general'
            const asignatura = level === 'primaria' ? 'general' : subjectId;
            const frasesData = await getFrases(level, grade, asignatura);
            setFrases(frasesData);
        };
        cargarContenido();
    }, [level, grade, subjectId]);

    // Lógica para determinar si el juego lleva temporizador
    const conTemporizador = (level === 'primaria' && grade >= 3) || level === 'eso';

    // Mientras las frases no se hayan cargado, mostramos un mensaje
    if (!frases) {
        return <div className="text-center p-10">Cargando juego...</div>;
    }

    const game = useOrdenaLaFraseGame(frases, conTemporizador);

    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseJuego;