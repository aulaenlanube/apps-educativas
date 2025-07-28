// src/apps/isla-de-la-calma/IslaDeLaCalma.jsx (CORREGIDO)
import React, { useState, useEffect, useRef } from 'react';
import './IslaDeLaCalma.css';

const IslaDeLaCalma = () => {
    const [pantalla, setPantalla] = useState('inicio');
    const [numeroCiclos, setNumeroCiclos] = useState(5);
    const [instruccion, setInstruccion] = useState('Prepárate...');
    const [escalaCirculo, setEscalaCirculo] = useState(1);
    const [cicloActual, setCicloActual] = useState(0);
    const [audioActivado, setAudioActivado] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (pantalla !== 'respiracion') return;

        if (cicloActual > numeroCiclos) {
            setPantalla('final');
            return;
        }

        if (cicloActual === 0) {
            const timer = setTimeout(() => setCicloActual(1), 2000);
            return () => clearTimeout(timer);
        }

        const secuencia = [
            { texto: 'Inhala...', escala: 1.5 },
            { texto: 'Sostén...', escala: 1.5 },
            { texto: 'Exhala...', escala: 1 },
            { texto: 'Mantén...', escala: 1 }
        ];
        
        let step = 0;
        const nextStep = () => {
            if (step < secuencia.length) {
                setInstruccion(secuencia[step].texto);
                setEscalaCirculo(secuencia[step].escala);
                step++;
            } else {
                setCicloActual(current => current + 1);
            }
        };

        nextStep();
        const intervalo = setInterval(nextStep, 4000);

        return () => clearInterval(intervalo);

    }, [pantalla, cicloActual, numeroCiclos]);

    const handleEmpezar = () => {
        setInstruccion('Prepárate...');
        setCicloActual(0);
        setPantalla('respiracion');
    };

    const handleReiniciar = () => {
        setPantalla('inicio');
    };
    
    const toggleAudio = () => {
        if (audioActivado) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Error al reproducir audio:", e));
        }
        setAudioActivado(!audioActivado);
    };

    const renderContent = () => {
        switch (pantalla) {
            case 'respiracion':
                return (
                    <div className="calma-container">
                        <div className="visualizador">
                            <div className="circulo" style={{ transform: `scale(${escalaCirculo})` }}></div>
                            <p id="instruccion">{instruccion}</p>
                        </div>
                        <p id="contadorCiclos">
                            {cicloActual > 0 ? `Ciclo ${cicloActual} de ${numeroCiclos}` : ''}
                        </p>
                    </div>
                );
            case 'final':
                return (
                    <div className="calma-container">
                        <h1>¡Muy bien hecho!</h1>
                        <p>Has completado tu ejercicio de relajación. Esperamos que te sientas más tranquilo y enfocado.</p>
                        <button onClick={handleReiniciar}>Hacer otra vez</button>
                    </div>
                );
            case 'inicio':
            default:
                return (
                    <div className="calma-container">
                        <h1>🏝️ Isla de la Calma</h1>
                        <p>Una pausa para encontrar la calma a través de la respiración. Sigue la animación y las instrucciones para relajar tu cuerpo y tu mente.</p>
                        <div className="configuracion-ciclos">
                            <label htmlFor="numeroCiclos">Número de respiraciones:</label>
                            <input type="number" id="numeroCiclos" value={numeroCiclos} onChange={(e) => setNumeroCiclos(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" max="15" />
                        </div>
                        <button onClick={handleEmpezar}>Comenzar</button>
                    </div>
                );
        }
    };

    return (
        <div className="calma-app-wrapper">
            {renderContent()}
            <audio ref={audioRef} src="/audio/calm-sound.mp3" loop />
            <button onClick={toggleAudio} className="control-audio">
                {audioActivado ? '🔊' : '🔇'}
            </button>
        </div>
    );
};

export default IslaDeLaCalma;