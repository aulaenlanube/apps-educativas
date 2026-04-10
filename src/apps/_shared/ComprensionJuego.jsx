import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { getComprensionData } from '../../services/gameDataService';
import './ComprensionShared.css';

const ComprensionJuego = ({ level, grade, subjectId, dataUrl, tipo = "escrita", onGameComplete }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState('lectura');
    const [respuestas, setRespuestas] = useState({});
    const [score, setScore] = useState(0);
    const [animacionFase, setAnimacionFase] = useState('fade-in-up');

    // --- NUEVO ESTADO PARA EL DESPLEGABLE DE RESULTADOS ---
    const [showReview, setShowReview] = useState(false);

    // --- NUEVO ESTADO PARA MATERIAL DE ESTUDIO ---
    const [showMaterial, setShowMaterial] = useState(false);
    const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(0);

    // --- Timers para puntuación ---
    const [readingStart, setReadingStart] = useState(null);
    const [readingTime, setReadingTime] = useState(0); // segundos leyendo
    const [answersStart, setAnswersStart] = useState(null);
    const [answersTime, setAnswersTime] = useState(0); // segundos respondiendo
    const trackedRef = useRef(false);

    // --- Audio States ---
    const [speechRate, setSpeechRate] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // --- Visual Settings ---
    const fontStyles = ['print', 'cursive', 'uppercase'];
    const [fontStyleIndex, setFontStyleIndex] = useState(0);
    const [fontSizeIndex, setFontSizeIndex] = useState(1);
    const sizeClasses = ['size-xs', 'size-md', 'size-lg', 'size-xl', 'size-xxl'];

    // --- Guía de Lectura ---
    const [showRuler, setShowRuler] = useState(false);
    const [rulerY, setRulerY] = useState(0);
    const textRef = useRef(null);

    const handleFontStyleChange = (e) => setFontStyleIndex(parseInt(e.target.value));
    const handleFontSizeChange = (e) => setFontSizeIndex(parseInt(e.target.value));

    const handleSpeedChange = (e) => {
        const newRate = parseFloat(e.target.value);
        setSpeechRate(newRate);
        if (isSpeaking || isPaused) detenerAudio();
    };

    const handleMouseMove = (e) => {
        if (showRuler && textRef.current) {
            const rect = textRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top;
            setRulerY(y);
        }
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        if (!level || !grade || !subjectId) return;

        setLoading(true);
        setError(false);

        getComprensionData(level, grade, subjectId)
            .then(jsonData => {
                if (!jsonData || jsonData.length === 0) throw new Error("Datos vacíos");
                const shuffled = jsonData.sort(() => 0.5 - Math.random());
                setData(shuffled);
                setReadingStart(Date.now());
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando:", err);
                setError(true);
                setLoading(false);
            });

        return () => detenerAudio();
    }, [level, grade, subjectId]);

    const detenerAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    };

    const leerTexto = () => {
        window.speechSynthesis.cancel();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data[currentIndex].texto);
            utterance.lang = 'es-ES';
            utterance.rate = speechRate;
            utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
            utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
            utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleAudio = () => {
        if (!isSpeaking) leerTexto();
        else if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
        else { window.speechSynthesis.pause(); setIsPaused(true); }
    };

    const iniciarTest = () => {
        detenerAudio();
        const elapsed = readingStart ? Math.round((Date.now() - readingStart) / 1000) : 0;
        setReadingTime(elapsed);
        setAnswersStart(Date.now());
        cambiarFase('preguntas');
    };

    const responder = (preguntaIndex, opcionIndex) => {
        setRespuestas({ ...respuestas, [preguntaIndex]: opcionIndex });
    };

    const finalizar = () => {
        let aciertos = 0;
        const total = data[currentIndex].preguntas.length;
        data[currentIndex].preguntas.forEach((p, idx) => {
            if (respuestas[idx] === p.correcta) aciertos++;
        });
        setScore(aciertos);

        const respTime = answersStart ? Math.round((Date.now() - answersStart) / 1000) : 0;
        setAnswersTime(respTime);
        const totalTime = readingTime + respTime;

        // Puntos paralelos: base + bonus tiempo lectura + bonus tiempo respuesta
        const basePoints = aciertos * 100;
        const readBonus = Math.max(0, Math.round(150 * (1 - readingTime / 180)));
        const answerBonus = Math.max(0, Math.round(150 * (1 - respTime / 120)));
        const totalPoints = basePoints + readBonus + answerBonus;

        const notaCalculada = Math.round((aciertos / total) * 100) / 10;
        if (notaCalculada >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899']
            });
        }
        cambiarFase('resultado');
        if (!trackedRef.current) {
            trackedRef.current = true;
            onGameComplete?.({
                mode: 'test',
                score: totalPoints,
                maxScore: total * 100 + 300,
                correctAnswers: aciertos,
                totalQuestions: total,
                durationSeconds: totalTime,
            });
        }
    };

    const siguienteEjercicio = () => {
        detenerAudio();
        setAnimacionFase('shake-exit');

        setTimeout(() => {
            setRespuestas({});
            setScore(0);
            setShowReview(false);
            setReadingStart(Date.now());
            setReadingTime(0);
            setAnswersStart(null);
            setAnswersTime(0);
            trackedRef.current = false;
            setCurrentIndex((prev) => (prev + 1) % data.length);
            setMode('lectura');
            setAnimacionFase('bounce-in');
        }, 600);
    };

    const cambiarFase = (nuevaFase) => {
        setAnimacionFase('fade-out');
        setTimeout(() => {
            setMode(nuevaFase);
            setAnimacionFase('fade-in-up');
        }, 300);
    };

    if (loading) return <div className="loading-spinner">Cargando historias... ⏳</div>;
    if (error) return <div className="error-message">⚠️ Error al cargar historia.</div>;
    if (!data.length) return <div>No hay historias disponibles.</div>;

    const ejercicioActual = data[currentIndex];
    const currentFontStyle = fontStyles[fontStyleIndex];
    const currentSizeClass = sizeClasses[fontSizeIndex];

    const totalPreguntas = ejercicioActual.preguntas.length;
    const nota = Math.round((score / totalPreguntas) * 100) / 10;
    let estrellas = 0;
    if (nota >= 9) estrellas = 3;
    else if (nota >= 5) estrellas = 2;
    else if (nota >= 3) estrellas = 1;
    const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
    const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';
    const totalPoints = score * 100 + Math.max(0, (180 - readingTime) * 2) + Math.max(0, (120 - answersTime) * 3);
    const formatTime = (s) => s >= 60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;

    const getButtonClass = () => isSpeaking ? (isPaused ? "btn-big-audio paused" : "btn-big-audio playing") : "btn-big-audio";
    const getButtonText = () => isSpeaking ? (isPaused ? "▶️ Continuar" : "⏸️ Pausar") : "🔊 Escuchar Historia";



    return (
        <div className={`comprension-container font-${currentFontStyle}`}>
            <div className="header-zone">
                <button
                    className="btn-material-estudio"
                    onClick={() => setShowMaterial(true)}
                >
                    📚 Material de Estudio
                </button>
                <h1 className="main-title text-4xl mb-6 text-center">
                    <span role="img" aria-label="icono" style={{ marginRight: '10px' }}>
                        {tipo === "oral" ? "🎧" : "📖"}
                    </span>
                    <span className="gradient-text">
                        {tipo === "oral" ? "Comprensión Oral" : "Comprensión Escrita"}
                    </span>
                </h1>

                {mode === 'lectura' && (
                    <div className="config-grid">
                        {tipo === "escrita" && (
                            <>
                                <div className="config-item item-wide item-grouped">
                                    <div className="group-left">
                                        <label className="config-label">✍️ Letra</label>
                                        <div className="slider-container">
                                            <div className="slider-labels"><span>Imp.</span><span>Lig.</span><span>May.</span></div>
                                            <input type="range" min="0" max="2" step="1" value={fontStyleIndex} onChange={handleFontStyleChange} className="custom-slider font-slider" />
                                        </div>
                                    </div>
                                    <div className="group-divider"></div>
                                    <div className="group-right">
                                        <label className="config-label">📏 Guía</label>
                                        <div className="toggle-container">
                                            <label className="switch">
                                                <input type="checkbox" checked={showRuler} onChange={(e) => setShowRuler(e.target.checked)} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="config-item item-wide">
                                    <label className="config-label">🔍 Tamaño</label>
                                    <div className="slider-container">
                                        <div className="slider-labels">
                                            <span style={{ fontSize: '0.8rem' }}>Aa</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Aa</span>
                                        </div>
                                        <input type="range" min="0" max="4" step="1" value={fontSizeIndex} onChange={handleFontSizeChange} className="custom-slider size-slider" />
                                    </div>
                                </div>
                            </>
                        )}
                        {tipo === "oral" && (
                            <div className="config-item item-full">
                                <label className="config-label">🐢 Velocidad 🐇</label>
                                <div className="slider-container">
                                    <div className="slider-labels"><span>Lento</span><span>Normal</span><span>Rápido</span></div>
                                    <input type="range" min="0.5" max="1.5" step="0.5" value={speechRate} onChange={handleSpeedChange} className="custom-slider speed-slider" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={`game-content ${animacionFase}`}>
                {mode === 'lectura' && (
                    <div className="card-principal">
                        <div className="card-header">
                            <h3 className="titulo-historia">{ejercicioActual.titulo}</h3>
                        </div>
                        <div className="card-body">
                            {tipo === "escrita" && (
                                <div className="text-container-relative" ref={textRef} onMouseMove={handleMouseMove} onMouseLeave={() => setRulerY(-1000)}>
                                    {showRuler && <div className={`reading-ruler ${currentSizeClass}`} style={{ top: rulerY }} />}
                                    <p className={`texto-lectura ${currentSizeClass}`}>
                                        {ejercicioActual.texto}
                                    </p>
                                </div>
                            )}
                            {tipo === "oral" && (
                                <div className="zona-audio-vibrante">
                                    <p className="instruccion-oral">Escucha atentamente:</p>
                                    <button onClick={toggleAudio} className={getButtonClass()}>{getButtonText()}</button>
                                </div>
                            )}
                        </div>
                        <div className="card-footer actions-group">
                            <button onClick={siguienteEjercicio} className="btn-secondary-action">🔄 Otra</button>
                            <button onClick={iniciarTest} className="btn-primary-action bounce-on-hover">Preguntas ➡️</button>
                        </div>
                    </div>
                )}

                {mode === 'preguntas' && (
                    <div className="zona-preguntas">
                        {ejercicioActual.preguntas.map((item, idx) => (
                            <div key={idx} className="pregunta-card pop-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="pregunta-badge">Pregunta {idx + 1}</div>
                                <p className="enunciado">{item.pregunta}</p>
                                <div className={`opciones-grid cols-${item.opciones.length}`}>
                                    {item.opciones.map((opcion, optIdx) => (
                                        <button key={optIdx} className={`btn-opcion ${respuestas[idx] === optIdx ? 'seleccionada' : ''}`} onClick={() => responder(idx, optIdx)}>
                                            {opcion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="actions-center" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            {Object.keys(respuestas).length === ejercicioActual.preguntas.length ?
                                <button onClick={finalizar} className="btn-finalizar pulse-animation">✅ Corregir</button> :
                                <p className="aviso-responder" style={{ color: '#e11d48', fontWeight: 'bold' }}>Responde todo para terminar 👆</p>
                            }
                        </div>
                    </div>
                )}

                {/* --- PANTALLA DE RESULTADOS --- */}
                {mode === 'resultado' && (
                    <div className="card-principal pop-in-bouncy results-container">
                        <div className="card-header">
                            <h3 className="titulo-historia">¡Completado!</h3>
                        </div>

                        <div className="card-body text-center">
                            {/* Premios visuales inmediatos */}
                            <div className="stars-container-integrated">
                                {[...Array(3)].map((_, i) => (
                                    <span key={i} className={`star ${i < estrellas ? 'filled' : 'empty'}`} style={{ animationDelay: `${i * 0.2}s` }}>★</span>
                                ))}
                            </div>

                            <div className="nota-display-simple">
                                <span className={`nota-value-simple ${nota >= 5 ? 'text-ok' : 'text-bad'}`}>{nota.toFixed(1)}</span>
                                <span className="nota-total">/ 10</span>
                            </div>

                            <p className="mensaje-motivacional-simple">{notaMsg}</p>

                            <div className="comprension-points-row">
                                <span className="comprension-points-icon">⭐</span>
                                <span className="comprension-points-value">{totalPoints.toLocaleString('es-ES')}</span>
                                <span className="comprension-points-label">puntos</span>
                            </div>

                            {(readingTime > 0 || answersTime > 0) && (
                                <div className="comprension-time-stats">
                                    {readingTime > 0 && <span>📖 Lectura: {formatTime(readingTime)}</span>}
                                    {answersTime > 0 && <span>✏️ Respuestas: {formatTime(answersTime)}</span>}
                                </div>
                            )}

                            {/* Botón para Desplegar Revisión */}
                            <button
                                className={`btn-toggle-review ${showReview ? 'active' : ''}`}
                                onClick={() => setShowReview(!showReview)}
                            >
                                {showReview ? 'Ocultar Corrección 🔼' : 'Ver Corrección 🔽'}
                            </button>

                            {/* SECCIÓN DE REVISIÓN (Desplegable) */}
                            {showReview && (
                                <div className="review-section pop-in">
                                    <h4 className="review-title">Revisión de Respuestas</h4>
                                    <div className="review-list">
                                        {ejercicioActual.preguntas.map((pregunta, idx) => {
                                            const esCorrecta = respuestas[idx] === pregunta.correcta;
                                            return (
                                                <div key={idx} className={`review-item ${esCorrecta ? 'correct-item' : 'incorrect-item'}`}>
                                                    <div className="review-question">
                                                        <span className="review-icon">{esCorrecta ? '✅' : '❌'}</span>
                                                        <span className="review-text-q">{pregunta.pregunta}</span>
                                                    </div>

                                                    {!esCorrecta && (
                                                        <div className="correction-box">
                                                            <div className="correction-row user-bad">
                                                                <span className="correction-label">Tú:</span>
                                                                <span>{pregunta.opciones[respuestas[idx]]}</span>
                                                            </div>
                                                            <div className="correction-row correct-good">
                                                                <span className="correction-label">Correcta:</span>
                                                                <span>{pregunta.opciones[pregunta.correcta]}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card-footer actions-group">
                            <button onClick={siguienteEjercicio} className="btn-primary-action bounce-on-hover">
                                Siguiente Historia 🚀
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL MATERIAL DE ESTUDIO (REDISEÑO TOTAL) --- */}
            {showMaterial && (
                <div className="modal-overlay" onClick={() => setShowMaterial(false)}>
                    <div className="material-modal-container" onClick={e => e.stopPropagation()}>
                        <aside className="material-sidebar">
                            <div className="sidebar-header">
                                <h3>Menú de Historias</h3>
                                <p>{data.length} ejercicios disponibles</p>
                            </div>
                            <nav className="sidebar-nav">
                                {data.map((historia, index) => (
                                    <button
                                        key={index}
                                        className={`sidebar-link ${selectedMaterialIndex === index ? 'active' : ''}`}
                                        onClick={() => setSelectedMaterialIndex(index)}
                                    >
                                        <span className="link-num">{index + 1}</span>
                                        <span className="link-text">{historia.titulo}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        <main className="material-view">
                            <header className="view-header">
                                <div className="header-info">
                                    <span className="badge">Material Didáctico</span>
                                    <h2>{data[selectedMaterialIndex].titulo}</h2>
                                </div>
                                <button className="close-material" onClick={() => setShowMaterial(false)}>✖</button>
                            </header>

                            <div className="view-body">
                                <section className="material-text-section">
                                    <div className="section-title">
                                        <span className="icon">📖</span>
                                        <h4>Texto Completo</h4>
                                    </div>
                                    <div className="text-content">
                                        {data[selectedMaterialIndex].texto}
                                    </div>
                                </section>

                                <section className="material-questions-section">
                                    <div className="section-title">
                                        <span className="icon">🎯</span>
                                        <h4>Objetivos de Comprensión</h4>
                                    </div>
                                    <div className="questions-grid">
                                        {data[selectedMaterialIndex].preguntas.map((q, idx) => (
                                            <div key={idx} className="material-q-item">
                                                <span className="q-num">{idx + 1}</span>
                                                <p>{q.pregunta}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </main>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComprensionJuego;