import React, { useState, useRef, useEffect } from 'react';
import { FaCheck, FaForward, FaTimes, FaVideo, FaVideoSlash, FaMicrophone, FaHeadset, FaBook } from 'react-icons/fa';
import '../_shared/RoscoShared.css';
import RoscoAvatar, { AVATAR_IDS } from '@/components/RoscoAvatars';

const ICONS = AVATAR_IDS;

const RoscoUI = ({
    gameState, players, activePlayer, activePlayerIndex, currentQuestion,
    checkAnswer, pasapalabra, restartGame, feedback,
    startGame, config, setConfig, maxQuestions,
    animState,
    showExitConfirm, requestExit, cancelExit, confirmExit,
    loadStudyMaterial,
    onGameComplete,
    onBackToDifficulty
}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    const [showStudyMaterial, setShowStudyMaterial] = useState(false);
    const [materialData, setMaterialData] = useState(null);
    const [selectedStudyLetter, setSelectedStudyLetter] = useState(null);
    const [avatarModalPlayer, setAvatarModalPlayer] = useState(null); // 'player1' | 'player2' | null

    // --- ESTADO WEBCAM ---
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // --- ESTADO VOZ ---
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [autoRecord, setAutoRecord] = useState(false);
    const [hasAutoRecorded, setHasAutoRecorded] = useState(false);
    const recognitionRef = useRef(null);

    // Referencias
    const autoRecordRef = useRef(autoRecord);
    const checkAnswerRef = useRef(checkAnswer);
    const pasapalabraRef = useRef(pasapalabra);
    const trackedRef = useRef(false);

    useEffect(() => {
        autoRecordRef.current = autoRecord;
        checkAnswerRef.current = checkAnswer;
        pasapalabraRef.current = pasapalabra;
    }, [autoRecord, checkAnswer, pasapalabra]);

    useEffect(() => {
        if (gameState === 'finished' && !trackedRef.current) {
            trackedRef.current = true;
            const best = [...players].sort((a, b) => b.score - a.score)[0];
            onGameComplete?.({
                mode: 'test',
                score: best?.score || 0,
                maxScore: config.questionCount,
                correctAnswers: best?.score || 0,
                totalQuestions: config.questionCount,
            });
        }
        if (gameState !== 'finished') trackedRef.current = false;
    }, [gameState, players, config.questionCount, onGameComplete]);

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
                const cleanTranscript = transcript.replace(/\.$/, "").trim();

                if (cleanTranscript.toLowerCase() === 'pasapalabra') {
                    setInputValue('');
                    setIsListening(false);
                    pasapalabraRef.current();
                    return;
                }

                setInputValue(cleanTranscript);
                setIsListening(false);

                if (autoRecordRef.current) {
                    checkAnswerRef.current(cleanTranscript);
                    setInputValue(''); // Limpiar también en modo automático
                }
            };

            recognition.onerror = (event) => {
                console.error("Error reconocimiento voz:", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Control del micro
    const startListening = () => {
        if (!recognitionRef.current || isListening) return;
        try {
            setInputValue('');
            recognitionRef.current.start();
            if (inputRef.current) inputRef.current.focus();
        } catch (e) {
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

    const toggleAutoRecord = () => {
        setAutoRecord(prev => !prev);
        if (autoRecord && isListening) stopListening();
    };

    // Lógica Auto-Record
    useEffect(() => {
        setHasAutoRecorded(false);
    }, [currentQuestion]);

    useEffect(() => {
        if (
            autoRecord &&
            voiceSupported &&
            !isListening &&
            !hasAutoRecorded &&
            gameState === 'playing' &&
            animState === 'none' &&
            !feedback &&
            !showExitConfirm
        ) {
            const timer = setTimeout(() => {
                startListening();
                setHasAutoRecorded(true);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [autoRecord, voiceSupported, isListening, hasAutoRecorded, gameState, animState, feedback, showExitConfirm]);


    // Auto-focus y limpieza
    useEffect(() => {
        if (gameState === 'playing' && inputRef.current && !feedback && animState !== 'pasapalabra-out' && !showExitConfirm && !isListening) {
            inputRef.current.focus();
            if (!isListening && !inputValue) setInputValue('');
        }
    }, [currentQuestion, feedback, gameState, activePlayerIndex, animState, showExitConfirm, isListening]);

    // Webcam
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

    // --- CORRECCIÓN AQUÍ: Limpiar input al enviar ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !!feedback || animState !== 'none' || showExitConfirm) return;
        checkAnswer(inputValue);
        setInputValue(''); // ¡Esto faltaba!
    };

    const handleOpenStudyMaterial = async () => {
        const material = await loadStudyMaterial();
        if (material) {
            setMaterialData(material);
            if (material.secciones && material.secciones.length > 0) {
                setSelectedStudyLetter(material.secciones[0].letra);
            }
            setShowStudyMaterial(true);
        }
    };

    // --- UI ---
    if (gameState === 'config') {
        const handleConfigChange = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
        const handlePlayerChange = (key, field, value) => setConfig(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

        return (
            <div className="rosco-container pt-4">
                <h1 className="text-5xl font-extrabold mb-4 text-blue-600 font-fredoka">El Rosco del Saber</h1>
                <div className="bg-white p-6 rounded-3xl shadow-xl max-w-lg mx-auto text-left">
                    <div className="mb-6 flex justify-center bg-gray-100 p-2 rounded-xl">
                        <button onClick={() => handleConfigChange('numPlayers', 1)} className={`flex-1 py-2 rounded-lg font-bold transition-all ${config.numPlayers === 1 ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>1 Jugador</button>
                        <button onClick={() => handleConfigChange('numPlayers', 2)} className={`flex-1 py-2 rounded-lg font-bold transition-all ${config.numPlayers === 2 ? 'bg-white shadow-md text-orange-500' : 'text-gray-400'}`}>2 Jugadores</button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-1 text-sm">Jugador 1</label>
                        <div className="flex gap-2 items-center">
                            <input type="text" value={config.player1.name} onChange={(e) => handlePlayerChange('player1', 'name', e.target.value)} className="border-2 border-gray-200 rounded-lg px-3 py-2 w-full font-bold" />
                            <button type="button" onClick={() => setAvatarModalPlayer('player1')}
                                className="shrink-0 rounded-xl border-2 border-gray-200 hover:border-blue-400 p-1 transition-colors hover:shadow-md">
                                <RoscoAvatar id={config.player1.icon} size={40} />
                            </button>
                        </div>
                    </div>
                    {config.numPlayers === 2 && (
                        <div className="mb-6 animate-fadeIn">
                            <label className="block text-gray-700 font-bold mb-1 text-sm">Jugador 2</label>
                            <div className="flex gap-2 items-center">
                                <input type="text" value={config.player2.name} onChange={(e) => handlePlayerChange('player2', 'name', e.target.value)} className="border-2 border-orange-200 rounded-lg px-3 py-2 w-full font-bold text-orange-600" />
                                <button type="button" onClick={() => setAvatarModalPlayer('player2')}
                                    className="shrink-0 rounded-xl border-2 border-orange-200 hover:border-orange-400 p-1 transition-colors hover:shadow-md">
                                    <RoscoAvatar id={config.player2.icon} size={40} />
                                </button>
                            </div>
                        </div>
                    )}
                    <hr className="my-4 border-gray-100" />
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

                    <button onClick={handleOpenStudyMaterial} className="w-full mb-3 flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-600 text-lg font-bold py-2 px-6 rounded-2xl transition-all border-2 border-orange-200">
                        <FaBook /> Ver Material de Estudio
                    </button>

                    <button onClick={() => startGame(config)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-3 px-6 rounded-2xl transition-transform transform hover:scale-105 shadow-lg">
                        ¡Empezar Partida!
                    </button>

                    {onBackToDifficulty && (
                        <button onClick={onBackToDifficulty} className="w-full mt-2 text-sm text-gray-400 hover:text-blue-500 transition-colors py-2">
                            Cambiar dificultad
                        </button>
                    )}

                    {showStudyMaterial && materialData && (
                        <div className="study-material-overlay">
                            <div className="study-material-box">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-blue-600">{materialData.titulo}</h2>
                                    <button onClick={() => setShowStudyMaterial(false)} className="text-gray-400 hover:text-red-500 text-2xl"><FaTimes /></button>
                                </div>
                                <p className="text-gray-600 mb-4 italic">{materialData.introduccion}</p>

                                <div className="study-letter-selector custom-scrollbar mb-6">
                                    {materialData.secciones.map((sec) => (
                                        <button
                                            key={sec.letra}
                                            onClick={() => setSelectedStudyLetter(sec.letra)}
                                            className={`study-letter-btn ${selectedStudyLetter === sec.letra ? 'active' : ''}`}
                                        >
                                            {sec.letra}
                                        </button>
                                    ))}
                                </div>

                                <div className="study-material-content custom-scrollbar">
                                    {materialData.secciones
                                        .filter(sec => sec.letra === selectedStudyLetter)
                                        .map((sec, idx) => (
                                            <div key={idx} className="animate-fadeIn">
                                                <div className="grid gap-4">
                                                    {sec.conceptos.map((con, cidx) => (
                                                        <div key={cidx} className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-100 transition-all shadow-sm">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h3 className="font-fredoka text-xl text-blue-800">{con.termino}</h3>
                                                                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase tracking-tighter">{con.pista}</span>
                                                            </div>
                                                            <p className="text-gray-700 text-base leading-relaxed">{con.definicion}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <button onClick={() => setShowStudyMaterial(false)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-fredoka text-xl py-4 rounded-2xl shadow-lg ring-4 ring-blue-50">¡Entendido, a jugar!</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal de selección de avatar */}
                {avatarModalPlayer && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setAvatarModalPlayer(null)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-center">
                                <h3 className="text-lg font-bold text-white">Elige tu personaje</h3>
                                <p className="text-sm text-white/70">{avatarModalPlayer === 'player1' ? config.player1.name : config.player2.name}</p>
                            </div>
                            <div className="p-5">
                                {/* Avatar seleccionado grande */}
                                <div className="flex justify-center mb-4">
                                    <div className="rounded-2xl border-4 border-blue-200 bg-blue-50 p-2">
                                        <RoscoAvatar id={config[avatarModalPlayer].icon} size={80} />
                                    </div>
                                </div>
                                {/* Grid de avatares */}
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    {ICONS.map(i => {
                                        const isSelected = config[avatarModalPlayer].icon === i;
                                        return (
                                            <button key={i} type="button"
                                                onClick={() => handlePlayerChange(avatarModalPlayer, 'icon', i)}
                                                className={`rounded-2xl p-2 transition-all duration-200 ${
                                                    isSelected
                                                        ? 'ring-3 ring-blue-500 bg-blue-50 scale-105 shadow-lg'
                                                        : 'bg-gray-50 hover:bg-gray-100 hover:scale-105 hover:shadow-md'
                                                }`}>
                                                <RoscoAvatar id={i} size={56} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => setAvatarModalPlayer(null)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
                            <span className="block mb-2"><RoscoAvatar id={winner.icon} size={64} /></span>
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">Resultados</h2>
                            <div className="text-5xl font-extrabold text-green-500">{winner.score} <span className="text-2xl text-gray-400">aciertos</span></div>
                            <div className="mt-4 p-3 bg-blue-50 rounded-2xl border-2 border-blue-100">
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Nota Final</p>
                                <div className="text-4xl font-black text-blue-600">
                                    {((winner.score / config.questionCount) * 10).toFixed(1)}
                                    <span className="text-xl text-blue-300 ml-1">/ 10</span>
                                </div>
                            </div>
                            {config.useTimer && winner.timeLeft > 0 && (<p className="text-sm text-gray-400 mt-2 font-bold">¡Te sobraron {winner.timeLeft}s!</p>)}
                        </div>
                    ) : (
                        isTie ? (<div className="text-4xl mb-6">🤝 ¡Empate!</div>) : (
                            <div className="mb-8">
                                <span className="block mb-2"><RoscoAvatar id={winner.icon} size={64} /></span>
                                <h2 className="text-2xl font-bold text-gray-700">¡Ha ganado {winner.name}!</h2>
                            </div>
                        )
                    )}
                    {!isSinglePlayer && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-8">
                            {players.map(p => (
                                <div key={p.id} className="flex justify-between items-center mb-2 last:mb-0 text-lg border-b last:border-0 border-gray-200 pb-2 last:pb-0">
                                    <div className="text-left">
                                        <div className="font-bold flex items-center gap-2"><RoscoAvatar id={p.icon} size={24} /> {p.name}</div>
                                        <div className="text-xs font-bold text-blue-500">Nota: {((p.score / config.questionCount) * 10).toFixed(1)}/10</div>
                                    </div>
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

    const radius = 135;
    const letters = Object.keys(activePlayer.letterStatus);

    let animationClass = '';
    if (animState === 'pasapalabra-out') animationClass = 'animate-pasapalabra-out animating';
    else if (animState === 'pasapalabra-in') animationClass = 'animate-pasapalabra-in animating';
    else if (animState === 'turn-change') animationClass = 'animate-turn-change animating';

    const borderColorClass = activePlayerIndex === 0 ? 'border-blue-100' : 'border-orange-100';

    return (
        <div className="rosco-container">
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

            {feedback && (
                <div className={`feedback-overlay feedback-${feedback.type}`}>
                    <div className="feedback-content">{feedback.text}</div>
                </div>
            )}

            {/* Barra de jugadores: solo en multijugador */}
            {players.length > 1 && (
                <div className="flex justify-center gap-4 mb-3 max-w-3xl mx-auto px-2">
                    {players.map((p, idx) => {
                        const isActive = activePlayerIndex === idx;
                        const correct = Object.values(p.letterStatus).filter(s => s === 'correct').length;
                        const wrong = Object.values(p.letterStatus).filter(s => s === 'wrong').length;
                        return (
                            <div key={p.id}
                                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 border-2
                                 ${isActive ? 'bg-white/95 shadow-xl scale-105 border-blue-500 z-10 ring-4 ring-blue-100 backdrop-blur-sm' : 'bg-gray-50/80 opacity-50 scale-95 border-transparent'}`}>
                                <RoscoAvatar id={p.icon} size={isActive ? 40 : 28} />
                                <div className="text-left">
                                    <p className="font-bold text-sm leading-tight">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-bold text-green-600">{correct}✓</span>
                                        <span className="text-xs font-bold text-red-500">{wrong}✗</span>
                                    </div>
                                </div>
                                {config.useTimer && (
                                    <div className={`ml-1 text-lg font-mono font-bold tabular-nums ${p.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                        {p.timeLeft}s
                                    </div>
                                )}
                                {isActive && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-md whitespace-nowrap">
                                        TU TURNO
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="rosco-circle">
                {isWebcamOn ? (
                    <div className="rosco-webcam-container">
                        <video ref={videoRef} autoPlay playsInline muted className="rosco-webcam-video" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none select-none">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 flex flex-col items-center shadow-sm">
                            <div className="mb-1">
                                <RoscoAvatar id={activePlayer.icon} size={players.length === 1 ? 90 : 64} />
                            </div>
                            <p className="font-bold text-sm text-gray-800 drop-shadow-sm">{activePlayer.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-green-600">{activePlayer.score}</span>
                                    <span className="text-[8px] font-bold text-green-700 uppercase tracking-wider">Bien</span>
                                </div>
                                <div className="w-px h-5 bg-gray-300" />
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-red-500">{Object.values(activePlayer.letterStatus).filter(s => s === 'wrong').length}</span>
                                    <span className="text-[8px] font-bold text-red-600 uppercase tracking-wider">Mal</span>
                                </div>
                                <div className="w-px h-5 bg-gray-300" />
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-blue-500">{Object.values(activePlayer.letterStatus).filter(s => s === 'pending').length}</span>
                                    <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider">Quedan</span>
                                </div>
                            </div>
                            {config.useTimer && (
                                <div className={`mt-1 text-xl font-mono font-black tabular-nums ${activePlayer.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                    {Math.floor(activePlayer.timeLeft / 60)}:{String(activePlayer.timeLeft % 60).padStart(2, '0')}
                                </div>
                            )}
                        </div>
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

            <div className={`rosco-center-box relative transition-all duration-300 ${borderColorClass} ${animationClass}`}>

                {/* Toolbar superior: webcam/voz a la izquierda, salir a la derecha */}
                <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-3 pt-3 z-20">
                    <div className="flex gap-1.5">
                        <button onClick={toggleWebcam} className={`btn-webcam-toggle ${isWebcamOn ? 'active' : ''}`} title={isWebcamOn ? "Apagar cámara" : "Encender cámara"}>
                            {isWebcamOn ? <FaVideo /> : <FaVideoSlash />}
                        </button>
                        {voiceSupported && (
                            <button onClick={toggleAutoRecord} className={`btn-auto-mic ${autoRecord ? 'active' : ''}`} title={autoRecord ? "Desactivar auto-voz" : "Activar auto-voz"}>
                                <FaHeadset />
                            </button>
                        )}
                    </div>
                    <button onClick={requestExit} className="btn-exit-corner" title="Salir">
                        <FaTimes />
                    </button>
                </div>

                {/* Letra + tipo de pista */}
                <div className="mt-10 mb-3 flex items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-3xl font-black text-white font-fredoka">{currentQuestion.letra}</span>
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            {currentQuestion.tipo === 'empieza' ? 'Empieza por' : 'Contiene la'} {currentQuestion.letra}
                        </p>
                        <p className="text-xs text-gray-300">
                            Letra {letters.indexOf(currentQuestion.letra) + 1} de {letters.length}
                        </p>
                    </div>
                </div>

                {/* Definición */}
                <div className="px-4 mb-4 flex-1 flex items-center">
                    <p className="text-base md:text-lg text-gray-800 leading-relaxed text-center font-medium">{currentQuestion.definicion}</p>
                </div>

                {/* Input + controles */}
                <div className="rosco-input-group w-full px-3 pb-2">
                    <form onSubmit={handleSubmit} className="rosco-form-inner">
                        {voiceSupported && (
                            <button type="button" onClick={toggleMic} className={`btn-mic-inline ${isListening ? 'listening' : ''}`} title="Dictar respuesta" disabled={!!feedback || animState !== 'none' || showExitConfirm}>
                                <FaMicrophone />
                            </button>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="rosco-input"
                            placeholder={isListening ? "Escuchando..." : "Escribe tu respuesta..."}
                            autoComplete="off"
                            disabled={!!feedback || animState !== 'none' || showExitConfirm}
                        />
                        <button type="submit" className="btn-check-inline" disabled={!!feedback || animState !== 'none' || !inputValue.trim() || showExitConfirm}>
                            <FaCheck />
                        </button>
                    </form>

                    <button type="button" onClick={pasapalabra} className="btn-pasapalabra-text" disabled={!!feedback || animState !== 'none' || showExitConfirm} title="Pasar palabra">
                        PASAPALABRA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoscoUI;