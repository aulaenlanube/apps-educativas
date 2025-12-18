import React, { useState, useEffect } from 'react';
import './ComprensionShared.css';

const ComprensionJuego = ({ dataUrl, tipo = "escrita" }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState('lectura'); 
    const [respuestas, setRespuestas] = useState({});
    const [score, setScore] = useState(0);
    const [animacionFase, setAnimacionFase] = useState('fade-in-up');

    // --- Estados para Audio ---
    const [speechRate, setSpeechRate] = useState(1); // 1 = Normal por defecto
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // --- Tipografías ---
    const fontStyles = ['print', 'cursive', 'uppercase'];
    const [fontStyleIndex, setFontStyleIndex] = useState(0);
    
    const handleFontStyleChange = (e) => {
        setFontStyleIndex(parseInt(e.target.value));
    };

    // Control de velocidad simplificado (3 niveles)
    const handleSpeedChange = (e) => {
        const newRate = parseFloat(e.target.value);
        setSpeechRate(newRate);
        // Si cambiamos la configuración mientras suena, reiniciamos para aplicar el cambio
        if (isSpeaking || isPaused) {
             detenerAudio();
        }
    };

    useEffect(() => {
        fetch(dataUrl)
            .then(res => res.json())
            .then(jsonData => {
                const shuffled = jsonData.sort(() => 0.5 - Math.random());
                setData(shuffled);
                setLoading(false);
            })
            .catch(err => console.error("Error cargando datos:", err));
        
        return () => detenerAudio();
    }, [dataUrl]);

    const cambiarFase = (nuevaFase) => {
        setAnimacionFase('fade-out');
        setTimeout(() => {
            setMode(nuevaFase);
            setAnimacionFase('fade-in-up');
        }, 300);
    };

    const detenerAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    };

    const leerTexto = () => {
        // Aseguramos que no haya nada reproduciéndose antes
        window.speechSynthesis.cancel();

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data[currentIndex].texto);
            utterance.lang = 'es-ES';
            utterance.rate = speechRate; // Usamos la velocidad configurada al inicio

            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };
            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleAudio = () => {
        if (!isSpeaking) {
            leerTexto();
        } else {
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
        }
    };

    const iniciarTest = () => {
        detenerAudio();
        cambiarFase('preguntas');
    };

    const responder = (preguntaIndex, opcionIndex) => {
        setRespuestas({
            ...respuestas,
            [preguntaIndex]: opcionIndex
        });
    };

    const finalizar = () => {
        let aciertos = 0;
        data[currentIndex].preguntas.forEach((p, idx) => {
            if (respuestas[idx] === p.correcta) aciertos++;
        });
        setScore(aciertos);
        cambiarFase('resultado');
    };

    const siguienteEjercicio = () => {
        detenerAudio();
        setRespuestas({});
        setScore(0);
        
        setAnimacionFase('fade-out');
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % data.length);
            setMode('lectura');
            setAnimacionFase('fade-in-up');
        }, 300);
    };

    if (loading) return <div className="loading-spinner">Cargando... ⏳</div>;
    if (data.length === 0) return <div>No hay datos disponibles.</div>;

    const ejercicioActual = data[currentIndex];
    const currentFontStyle = fontStyles[fontStyleIndex]; 

    // Helper para textos y estilos del botón
    const getButtonText = () => {
        if (!isSpeaking) return "🔊 Escuchar Historia";
        if (isPaused) return "▶️ Continuar";
        return "⏸️ Pausar";
    };
    
    const getButtonClass = () => {
        if (!isSpeaking) return "btn-big-audio"; 
        if (isPaused) return "btn-big-audio paused"; 
        return "btn-big-audio playing";
    };

    return (
        <div className={`comprension-container font-${currentFontStyle}`}>
            
            {/* HEADER: TÍTULO Y CONFIGURACIÓN INICIAL */}
            <div className="header-zone fade-in">
                <h1 className="main-title text-4xl mb-6 text-center">
                    <span role="img" aria-label="icono" style={{marginRight: '10px'}}>
                        {tipo === "oral" ? "🎧" : "📖"}
                    </span> 
                    <span className="gradient-text">
                        {tipo === "oral" ? "Comprensión Oral" : "Comprensión Escrita"}
                    </span>
                </h1>

                {/* ZONA DE CONFIGURACIÓN (GRID) */}
                <div className="config-grid">
                    
                    {/* 1. Selector de Tipografía (SOLO SI ES ESCRITA) */}
                    {tipo === "escrita" && (
                        <div className="config-item">
                            <label className="config-label">✍️ Letra</label>
                            <div className="slider-container">
                                <div className="slider-labels">
                                    <span>Imprenta</span>
                                    <span>Ligada</span>
                                    <span>Mayús.</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="1"
                                    value={fontStyleIndex}
                                    onChange={handleFontStyleChange}
                                    className="custom-slider font-slider"
                                />
                            </div>
                        </div>
                    )}

                    {/* 2. Selector de Velocidad (SOLO SI ES ORAL) */}
                    {tipo === "oral" && (
                        <div className="config-item">
                            <label className="config-label">🐢 Velocidad 🐇</label>
                            <div className="slider-container">
                                <div className="slider-labels">
                                    <span>Tranquilo</span>
                                    <span>Normal</span>
                                    <span>Rápido</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="1.5" 
                                    step="0.5" 
                                    value={speechRate} 
                                    onChange={handleSpeedChange} 
                                    className="custom-slider speed-slider"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className={`game-content ${animacionFase}`}>
                
                {/* --- FASE 1: LECTURA / ESCUCHA --- */}
                {mode === 'lectura' && (
                    <div className="card-principal">
                        <div className="card-header">
                            <h3 className="titulo-historia">{ejercicioActual.titulo}</h3>
                        </div>
                        
                        <div className="card-body">
                            {tipo === "escrita" && (
                                <p className="texto-lectura">{ejercicioActual.texto}</p>
                            )}

                            {tipo === "oral" && (
                                <div className="zona-audio-vibrante">
                                    <p className="instruccion-oral">
                                        Pulsa el botón y escucha atentamente:
                                    </p>
                                    
                                    {/* SOLO BOTÓN DE ACCIÓN (PLAY/PAUSE) */}
                                    <button onClick={toggleAudio} className={getButtonClass()}>
                                        {getButtonText()}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="card-footer actions-group">
                            <button onClick={siguienteEjercicio} className="btn-secondary-action">
                                🔄 Otra historia
                            </button>
                            <button onClick={iniciarTest} className="btn-primary-action bounce-on-hover">
                                ¡Listo! A las preguntas ➡️
                            </button>
                        </div>
                    </div>
                )}

                {/* --- FASE 2: PREGUNTAS --- */}
                {mode === 'preguntas' && (
                    <div className="zona-preguntas">
                        {ejercicioActual.preguntas.map((item, idx) => (
                            <div key={idx} className="pregunta-card pop-in" style={{animationDelay: `${idx * 0.1}s`}}>
                                <div className="pregunta-badge">Pregunta {idx + 1}</div>
                                <p className="enunciado">{item.pregunta}</p>
                                <div className={`opciones-grid cols-${item.opciones.length}`}>
                                    {item.opciones.map((opcion, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className={`btn-opcion ${respuestas[idx] === optIdx ? 'seleccionada' : ''}`}
                                            onClick={() => responder(idx, optIdx)}
                                        >
                                            {opcion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <div className="actions-center" style={{display:'flex', justifyContent:'center', marginTop: '2rem'}}>
                            {Object.keys(respuestas).length === ejercicioActual.preguntas.length ? (
                                <button onClick={finalizar} className="btn-finalizar pulse-animation">
                                    ✅ Corregir Examen
                                </button>
                            ) : (
                                <p className="aviso-responder" style={{fontWeight:'bold', color:'#e11d48'}}>Responde todas las preguntas para terminar 👆</p>
                            )}
                        </div>
                    </div>
                )}

                {/* --- FASE 3: RESULTADOS --- */}
                {mode === 'resultado' && (
                    <div className="resultado-card pop-in-bouncy">
                        <h3>Resultado Final</h3>
                        
                        <div className="score-circle">
                            <span className="score-number">{score}</span>
                            <span className="score-total">/ {ejercicioActual.preguntas.length}</span>
                        </div>

                        <p className="mensaje-motivacional">
                            {score === ejercicioActual.preguntas.length ? "¡INCREÍBLE! 🏆" : 
                             score >= ejercicioActual.preguntas.length / 2 ? "¡Buen trabajo! 👍" : "¡Sigue practicando! 💪"}
                        </p>
                        
                        <div className="revision-panel">
                            {ejercicioActual.preguntas.map((p, idx) => (
                                <div key={idx} className={`review-row ${respuestas[idx] === p.correcta ? 'row-correct' : 'row-incorrect'}`}>
                                    <span className="icon-status">{respuestas[idx] === p.correcta ? '✅' : '❌'}</span>
                                    <span className="review-text">Pregunta {idx + 1}</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={siguienteEjercicio} className="btn-restart">
                            Siguiente Historia 🚀
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComprensionJuego;