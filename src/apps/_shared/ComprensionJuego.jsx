import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './ComprensionShared.css';

const ComprensionJuego = ({ level, grade, subjectId, dataUrl, tipo = "escrita" }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState('lectura'); 
    const [respuestas, setRespuestas] = useState({});
    const [score, setScore] = useState(0);
    const [animacionFase, setAnimacionFase] = useState('fade-in-up');

    // --- NUEVO ESTADO PARA EL DESPLEGABLE ---
    const [showReview, setShowReview] = useState(false);

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
        let finalPath = dataUrl;
        if (!finalPath) {
            if (level && grade && subjectId) {
                finalPath = `/data/${level}/${grade}/${subjectId}-comprension.json`;
            } else {
                return; 
            }
        }

        setLoading(true);
        setError(false);

        fetch(finalPath)
            .then(res => {
                if (!res.ok) throw new Error("Archivo no encontrado");
                return res.json();
            })
            .then(jsonData => {
                if (!jsonData || jsonData.length === 0) throw new Error("JSON vacío");
                const shuffled = jsonData.sort(() => 0.5 - Math.random());
                setData(shuffled);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando:", err);
                setError(true);
                setLoading(false);
            });
        
        return () => detenerAudio();
    }, [level, grade, subjectId, dataUrl]);

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
        
        const notaCalculada = Math.round((aciertos / total) * 10);
        if (notaCalculada >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899']
            });
        }
        cambiarFase('resultado');
    };

    const siguienteEjercicio = () => {
        detenerAudio();
        setAnimacionFase('shake-exit');
        
        setTimeout(() => {
            setRespuestas({});
            setScore(0);
            setShowReview(false); // <--- RESETEAMOS EL DESPLEGABLE
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
    const nota = Math.round((score / totalPreguntas) * 10);
    let estrellas = 0;
    if (nota >= 9) estrellas = 3;
    else if (nota >= 5) estrellas = 2;
    else if (nota >= 3) estrellas = 1;

    const getButtonClass = () => isSpeaking ? (isPaused ? "btn-big-audio paused" : "btn-big-audio playing") : "btn-big-audio";
    const getButtonText = () => isSpeaking ? (isPaused ? "▶️ Continuar" : "⏸️ Pausar") : "🔊 Escuchar Historia";

    return (
        <div className={`comprension-container font-${currentFontStyle}`}>
            <div className="header-zone fade-in">
                <h1 className="main-title text-4xl mb-6 text-center">
                    <span role="img" aria-label="icono" style={{marginRight: '10px'}}>
                        {tipo === "oral" ? "🎧" : "📖"}
                    </span> 
                    <span className="gradient-text">
                        {tipo === "oral" ? "Comprensión Oral" : "Comprensión Escrita"}
                    </span>
                </h1>

                {mode === 'lectura' && (
                    <div className="config-grid pop-in">
                        {tipo === "escrita" && (
                            <>
                                <div className="config-item item-wide item-grouped">
                                    <div className="group-left">
                                        <label className="config-label">✍️ Letra</label>
                                        <div className="slider-container">
                                            <div className="slider-labels"><span>Imp.</span><span>Lig.</span><span>May.</span></div>
                                            <input type="range" min="0" max="2" step="1" value={fontStyleIndex} onChange={handleFontStyleChange} className="custom-slider font-slider"/>
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
                                            <span style={{fontSize:'0.8rem'}}>Aa</span>
                                            <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>Aa</span>
                                        </div>
                                        <input type="range" min="0" max="4" step="1" value={fontSizeIndex} onChange={handleFontSizeChange} className="custom-slider size-slider"/>
                                    </div>
                                </div>
                            </>
                        )}
                        {tipo === "oral" && (
                            <div className="config-item item-full">
                                <label className="config-label">🐢 Velocidad 🐇</label>
                                <div className="slider-container">
                                    <div className="slider-labels"><span>Lento</span><span>Normal</span><span>Rápido</span></div>
                                    <input type="range" min="0.5" max="1.5" step="0.5" value={speechRate} onChange={handleSpeedChange} className="custom-slider speed-slider"/>
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
                            <div key={idx} className="pregunta-card pop-in" style={{animationDelay: `${idx * 0.1}s`}}>
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
                        <div className="actions-center" style={{display:'flex', justifyContent:'center', marginTop: '2rem'}}>
                            {Object.keys(respuestas).length === ejercicioActual.preguntas.length ? 
                                <button onClick={finalizar} className="btn-finalizar pulse-animation">✅ Corregir</button> : 
                                <p className="aviso-responder" style={{color:'#e11d48', fontWeight:'bold'}}>Responde todo para terminar 👆</p>
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
                                    <span key={i} className={`star ${i < estrellas ? 'filled' : 'empty'}`} style={{animationDelay: `${i * 0.2}s`}}>★</span>
                                ))}
                            </div>

                            <div className="nota-display-simple">
                                <span className={`nota-value-simple ${nota >= 5 ? 'text-ok' : 'text-bad'}`}>{nota}</span>
                                <span className="nota-total">/ 10</span>
                            </div>

                            <p className="mensaje-motivacional-simple">
                                {nota === 10 ? "¡TRABAJO EXCELENTE! 🌟🏆" : 
                                 nota >= 7 ? "¡FANTÁSTICO! 😎" :
                                 nota >= 5 ? "¡BIEN JUGADO! 👍" : 
                                 "¡BUEN INTENTO! 💪"}
                            </p>

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
        </div>
    );
};

export default ComprensionJuego;