import React, { useState, useRef, useEffect } from 'react';
import { FaCheck, FaForward, FaTimes, FaVideo, FaVideoSlash, FaMicrophone, FaHeadset } from 'react-icons/fa';
import '../_shared/RoscoShared.css';

const ICONS = ['🐶', '🐱', '🐼', '🦊', '🦁', '🐯', '🦄', '🐸', '🤖', '👽', '👻', '🤡', '🤠', '👸', '🤴', '🦸'];

const RoscoUI = ({ 
    gameState, players, activePlayer, activePlayerIndex, currentQuestion, 
    checkAnswer, pasapalabra, restartGame, feedback,
    startGame, config, setConfig, maxQuestions,
    animState,
    showExitConfirm, requestExit, cancelExit, confirmExit
}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    
    // --- ESTADO WEBCAM ---
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // --- ESTADO VOZ ---
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [autoRecord, setAutoRecord] = useState(false); // NUEVO: Modo Auto
    const [hasAutoRecorded, setHasAutoRecorded] = useState(false); // Control para no repetir en la misma palabra
    const recognitionRef = useRef(null);

    // Inicializar Reconocimiento de Voz
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            setVoiceSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';

            recognition.onstart = () => setIsListening(true);
            
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const cleanTranscript = transcript.replace(/\.$/, "");
                setInputValue(cleanTranscript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error("Error reconocimiento voz:", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Funciones de control del micro
    const startListening = () => {
        if (!recognitionRef.current || isListening) return;
        try {
            setInputValue(''); 
            recognitionRef.current.start();
            if(inputRef.current) inputRef.current.focus();
        } catch(e) {
            console.error("No se pudo iniciar el micro", e);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current || !isListening) return;
        recognitionRef.current.stop();
    };

    const toggleMic = () => {
        if (isListening) stopListening();
        else startListening();
    };

    // Toggle para el modo Auto
    const toggleAutoRecord = () => {
        setAutoRecord(prev => !prev);
        // Si lo desactivamos, paramos de escuchar por si acaso
        if (autoRecord && isListening) stopListening();
    };

    // --- LÓGICA AUTO-RECORD ---
    
    // 1. Resetear el flag cuando cambia la pregunta (nueva palabra)
    useEffect(() => {
        setHasAutoRecorded(false);
    }, [currentQuestion]);

    // 2. Activar micro automáticamente si se cumplen las condiciones
    useEffect(() => {
        if (
            autoRecord &&               // Modo activado
            voiceSupported &&           // Navegador compatible
            !isListening &&             // No está escuchando ya
            !hasAutoRecorded &&         // No hemos intentado grabar ya para esta palabra
            gameState === 'playing' &&  // Juego activo
            animState === 'none' &&     // Animaciones terminadas (turno listo)
            !feedback &&                // No hay mensajes en pantalla
            !showExitConfirm            // No hay modal abierto
        ) {
            // Pequeño delay para asegurar que la UI está lista
            const timer = setTimeout(() => {
                startListening();
                setHasAutoRecorded(true); // Marcamos como "intentado" para esta palabra
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [autoRecord, voiceSupported, isListening, hasAutoRecorded, gameState, animState, feedback, showExitConfirm]);


    // Auto-focus inteligente (input teclado)
    useEffect(() => {
        if (gameState === 'playing' && inputRef.current && !feedback && animState !== 'pasapalabra-out' && !showExitConfirm && !isListening) {
            inputRef.current.focus();
            if (!isListening && !inputValue) setInputValue('');
        }
    }, [currentQuestion, feedback, gameState, activePlayerIndex, animState, showExitConfirm, isListening]);

    // Gestión de Webcam (Igual)
    useEffect(() => {
        const startWebcam = async () => {
            if (isWebcamOn) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error("Error webcam:", err);
                    setIsWebcamOn(false);
                }
            } else {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            }
        };
        startWebcam();
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        };
    }, [isWebcamOn]);

    const toggleWebcam = () => setIsWebcamOn(prev => !prev);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !!feedback || animState !== 'none' || showExitConfirm) return;
        checkAnswer(inputValue);
    };

    // --- PANTALLAS CONFIG Y FINAL (Se mantienen igual) ---
    if (gameState === 'config') {
        const handleConfigChange = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
        const handlePlayerChange = (key, field, value) => setConfig(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

        return (
            <div className="rosco-container pt-4">
                <h1 className="text-4xl font-extrabold mb-4 text-blue-600 font-fredoka">El Rosco del Saber</h1>
                <div className="bg-white p-6 rounded-3xl shadow-xl max-w-lg mx-auto text-left">
                    <div className="mb-6 flex justify-center bg-gray-100 p-2 rounded-xl">
                        <button onClick={() => handleConfigChange('numPlayers', 1)} className={`flex-1 py-2 rounded-lg font-bold transition-all ${config.numPlayers === 1 ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>1 Jugador</button>
                        <button onClick={() => handleConfigChange('numPlayers', 2)} className={`flex-1 py-2 rounded-lg font-bold transition-all ${config.numPlayers === 2 ? 'bg-white shadow-md text-orange-500' : 'text-gray-400'}`}>2 Jugadores</button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-1 text-sm">Jugador 1</label>
                        <div className="flex gap-2">
                            <input type="text" value={config.player1.name} onChange={(e) => handlePlayerChange('player1', 'name', e.target.value)} className="border-2 border-gray-200 rounded-lg px-3 py-2 w-full font-bold" />
                            <select value={config.player1.icon} onChange={(e) => handlePlayerChange('player1', 'icon', e.target.value)} className="border-2 border-gray-200 rounded-lg px-2 text-2xl">
                                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                    </div>
                    {config.numPlayers === 2 && (
                        <div className="mb-6 animate-fadeIn">
                            <label className="block text-gray-700 font-bold mb-1 text-sm">Jugador 2</label>
                            <div className="flex gap-2">
                                <input type="text" value={config.player2.name} onChange={(e) => handlePlayerChange('player2', 'name', e.target.value)} className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full font-bold text-orange-600" />
                                <select value={config.player2.icon} onChange={(e) => handlePlayerChange('player2', 'icon', e.target.value)} className="border-2 border-orange-200 rounded-lg px-2 text-2xl">
                                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    <hr className="my-4 border-gray-100"/>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-700 font-bold text-xs mb-2">PREGUNTAS: {config.questionCount}</label>
                            <input type="range" min="5" max={maxQuestions} value={config.questionCount} onChange={(e) => handleConfigChange('questionCount', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-700 font-bold text-xs">TIEMPO</label>
                                <input type="checkbox" checked={config.useTimer} onChange={(e) => handleConfigChange('useTimer', e.target.checked)} className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
                            </div>
                            {config.useTimer && (
                                <input type="range" min="30" max="300" step="10" value={config.timeLimit} onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" />
                            )}
                            {config.useTimer && <p className="text-xs text-right text-gray-400 mt-1">{config.timeLimit} seg</p>}
                        </div>
                    </div>
                    <button onClick={() => startGame(config)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-3 px-6 rounded-2xl transition-transform transform hover:scale-105 shadow-lg">
                        ¡Empezar Partida!
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];
        const isTie = players.length === 2 && players[0].score === players[1].score;
        const isSinglePlayer = players.length === 1;

        return (
            <div className="rosco-container pt-10">
                <h1 className="text-5xl font-extrabold mb-8 text-blue-600 font-fredoka">
                    {isSinglePlayer ? '¡Partida Completada!' : '¡Juego Terminado!'}
                </h1>
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md mx-auto">
                    {isSinglePlayer ? (
                        <div className="mb-8">
                             <span className="text-6xl block mb-2">{winner.icon}</span>
                             <h2 className="text-2xl font-bold text-gray-700 mb-2">Resultados</h2>
                             <div className="text-5xl font-extrabold text-green-500">{winner.score} <span className="text-2xl text-gray-400">aciertos</span></div>
                             {config.useTimer && winner.timeLeft > 0 && (<p className="text-sm text-gray-400 mt-2 font-bold">¡Te sobraron {winner.timeLeft}s!</p>)}
                        </div>
                    ) : (
                        isTie ? (<div className="text-4xl mb-6">🤝 ¡Empate!</div>) : (
                            <div className="mb-8">
                                <span className="text-6xl block mb-2">{winner.icon}</span>
                                <h2 className="text-2xl font-bold text-gray-700">¡Ha ganado {winner.name}!</h2>
                            </div>
                        )
                    )}
                    {!isSinglePlayer && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-8">
                            {players.map(p => (
                                <div key={p.id} className="flex justify-between items-center mb-2 last:mb-0 text-lg border-b last:border-0 border-gray-200 pb-2 last:pb-0">
                                    <span className="font-bold">{p.icon} {p.name}</span>
                                    <span className="font-extrabold text-blue-600">{p.score} aciertos</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={restartGame} className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg w-full">Nueva Partida</button>
                </div>
            </div>
        );
    }

    if (gameState === 'loading' || !activePlayer || !currentQuestion) return <div className="text-center p-10 text-2xl font-bold text-gray-400">Cargando...</div>;

    // --- PANTALLA JUEGO ---
    const radius = 135; 
    const letters = Object.keys(activePlayer.letterStatus);
    
    let animationClass = '';
    if (animState === 'pasapalabra-out') animationClass = 'animate-pasapalabra-out animating';
    else if (animState === 'pasapalabra-in') animationClass = 'animate-pasapalabra-in animating';
    else if (animState === 'turn-change') animationClass = 'animate-turn-change animating';

    const borderColorClass = activePlayerIndex === 0 ? 'border-blue-100' : 'border-orange-100';

    return (
        <div className="rosco-container">
            {/* MODAL SALIDA */}
            {showExitConfirm && (
                <div className="exit-modal-overlay">
                    <div className="exit-modal-box">
                        <h2 className="text-2xl font-bold mb-2 text-gray-700">¿Abandonar partida?</h2>
                        <p className="text-gray-500 mb-6">El progreso actual se perderá.</p>
                        <div className="exit-modal-buttons">
                            <button onClick={cancelExit} className="btn-cancel-exit">Cancelar</button>
                            <button onClick={confirmExit} className="btn-confirm-exit">Sí, salir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FEEDBACK */}
            {feedback && (
                <div className={`feedback-overlay feedback-${feedback.type}`}>
                    <div className="feedback-content">{feedback.text}</div>
                </div>
            )}

            {/* Marcadores */}
            <div className="flex justify-center gap-4 mb-2 max-w-3xl mx-auto">
                {players.map((p, idx) => (
                    <div key={p.id} 
                         className={`relative flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 border-2
                         ${activePlayerIndex === idx ? 'bg-white shadow-xl scale-110 border-blue-500 z-10 ring-4 ring-blue-100' : 'bg-gray-100 opacity-60 scale-90 border-transparent grayscale'}`}>
                        <span className="text-3xl">{p.icon}</span>
                        <div className="text-left">
                            <p className="font-bold text-sm leading-tight">{p.name}</p>
                            <p className="text-xs font-bold text-green-600">{p.score}</p>
                        </div>
                        {config.useTimer && (<div className={`ml-2 text-xl font-mono font-bold ${p.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>{p.timeLeft}s</div>)}
                        {players.length > 1 && activePlayerIndex === idx && (<div className="absolute -top-3 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-bounce">TU TURNO</div>)}
                    </div>
                ))}
            </div>

            {/* CÍRCULO */}
            <div className="rosco-circle">
                {isWebcamOn && (
                    <div className="rosco-webcam-container">
                        <video ref={videoRef} autoPlay playsInline muted className="rosco-webcam-video" />
                    </div>
                )}
                {letters.map((letra, index) => {
                    const angle = (index / letters.length) * 2 * Math.PI - (Math.PI / 2);
                    const x = Math.cos(angle) * radius + 130; 
                    const y = Math.sin(angle) * radius + 130;
                    const isCurrent = currentQuestion.letra === letra;
                    const statusClass = activePlayer.letterStatus[letra]; 
                    return (<div key={letra} className={`rosco-letter ${statusClass} ${isCurrent ? 'active' : ''}`} style={{ left: `${x}px`, top: `${y}px` }}>{letra}</div>);
                })}
            </div>

            {/* UI Central */}
            <div className={`rosco-center-box relative transition-all duration-300 ${borderColorClass} ${animationClass}`}>
                
                <button onClick={requestExit} className="btn-exit-corner" title="Salir de la partida">
                    <FaTimes />
                </button>

                {/* CONTROLES MODO */}
                <div className="absolute top-2 left-2 flex gap-2 z-20">
                    <button 
                        onClick={toggleWebcam} 
                        className={`btn-webcam-toggle ${isWebcamOn ? 'active' : ''}`} 
                        title={isWebcamOn ? "Apagar cámara" : "Encender cámara"}
                    >
                        {isWebcamOn ? <FaVideo /> : <FaVideoSlash />}
                    </button>
                    
                    {/* BOTÓN AUTO-RECORD */}
                    {voiceSupported && (
                        <button 
                            onClick={toggleAutoRecord} 
                            className={`btn-auto-mic ${autoRecord ? 'active' : ''}`} 
                            title={autoRecord ? "Desactivar modo auto-voz" : "Activar modo auto-voz"}
                        >
                            <FaHeadset />
                        </button>
                    )}
                </div>
                
                <div className="rosco-type-label">
                    {currentQuestion.tipo === 'empieza' ? 'Empieza por' : 'Contiene la'} 
                    <span className="text-4xl ml-2 text-blue-600 align-middle font-fredoka">{currentQuestion.letra}</span>
                </div>
                
                <p className="rosco-definition">{currentQuestion.definicion}</p>
                
                <div className="rosco-input-group">
                    <form onSubmit={handleSubmit} className="rosco-form-inner">
                        
                        {voiceSupported && (
                            <button 
                                type="button" 
                                onClick={toggleMic} 
                                className={`btn-mic-inline ${isListening ? 'listening' : ''}`}
                                title="Dictar respuesta"
                                disabled={!!feedback || animState !== 'none' || showExitConfirm}
                            >
                                <FaMicrophone />
                            </button>
                        )}

                        <input 
                            ref={inputRef}
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="rosco-input"
                            placeholder={isListening ? "Escuchando..." : `${activePlayer.name}...`}
                            autoComplete="off"
                            disabled={!!feedback || animState !== 'none' || showExitConfirm}
                        />
                        <button type="submit" className="btn-check-inline" disabled={!!feedback || animState !== 'none' || !inputValue.trim() || showExitConfirm}>
                            <FaCheck />
                        </button>
                    </form>
                    
                    <button type="button" onClick={pasapalabra} className="btn-pasapalabra-text" disabled={!!feedback || animState !== 'none' || showExitConfirm} title="Pasapalabra">
                        PASAPALABRA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoscoUI;