// src/apps/detective-de-palabras/DetectiveDePalabras.jsx
import React from 'react';
import { useDetectiveDePalabras } from '../../hooks/useDetectiveDePalabras';
import { frasesDetective } from './frasesDetective';
import DetectiveDePalabrasUI from '../_shared/DetectiveDePalabrasUI';
import DetectiveDePalabrasTestScreen from '../_shared/DetectiveDePalabrasTestScreen';
import { useParams } from 'react-router-dom';

const DetectiveDePalabras = () => {
    // Obtenemos el grado directamente de los parámetros de la URL
    const { grade } = useParams();

    // Seleccionamos las frases basadas en el grado, con un fallback al nivel 1
    const frasesDelNivel = frasesDetective[grade] || frasesDetective['1'];
    
    // Determinamos si el nivel debe tener temporizador
    const conTemporizador = parseInt(grade, 10) >= 3;

    const game = useDetectiveDePalabras(frasesDelNivel, conTemporizador);

    if (game.isTestMode) {
        return <DetectiveDePalabrasTestScreen game={game} />;
    }
    return <DetectiveDePalabrasUI game={game} />;
};

export default DetectiveDePalabras;