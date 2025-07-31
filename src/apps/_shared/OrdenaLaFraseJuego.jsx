// src/apps/_shared/OrdenaLaFraseJuego.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';
import { getFrases } from '@/data/api';

const OrdenaLaFraseJuego = () => {
    const { level, grade, subjectId = 'general' } = useParams(); // 'general' por defecto para primaria

    // 1. Nuevo estado para guardar las frases cuando lleguen
    const [frasesDeLaMateria, setFrasesDeLaMateria] = useState(null);

    // 2. Efecto que se ejecuta solo una vez para cargar los datos
    useEffect(() => {
        async function cargarFrases() {
            const data = await getFrases(level, grade, subjectId);
            setFrasesDeLaMateria(data);
        }
        cargarFrases();
    }, [level, grade, subjectId]); // Se volverá a ejecutar si cambia la URL

    // (Aquí podrías añadir la lógica del temporizador de forma similar)
    const conTemporizador = grade >= 3; // Lógica simplificada

    // 3. Mientras los datos no hayan llegado, mostramos un mensaje de carga
    if (!frasesDeLaMateria) {
        return <div>Cargando juego...</div>;
    }

    // 4. Una vez tenemos las frases, inicializamos el juego
    const game = useOrdenaLaFraseGame(frasesDeLaMateria, conTemporizador);

    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseJuego;