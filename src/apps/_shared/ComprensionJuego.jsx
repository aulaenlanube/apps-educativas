import React, { useState, useEffect } from 'react';
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

    // --- Audio States ---
    const [speechRate, setSpeechRate] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // --- Font States ---
    const fontStyles = ['print', 'cursive', 'uppercase'];
    const [fontStyleIndex, setFontStyleIndex] = useState(0);

    const handleFontStyleChange = (e) => setFontStyleIndex(parseInt(e.target.value));

    const handleSpeedChange = (e) => {
        const newRate = parseFloat(e.target.value);
        setSpeechRate(newRate);
        if (isSpeaking || isPaused) detenerAudio();
    };

    // --- CARGA DINÁMICA DE DATOS ---
    useEffect(() => {
        let finalPath = dataUrl;

        // Si no hay URL fija, la construimos dinámicamente
        if (!finalPath) {
            if (level && grade && subjectId) {
                finalPath = `/data/${level}/${grade}/${subjectId}-comprension.json`;
            } else {
                return; // Faltan datos para construir la ruta
            }
        }

        console.log("Cargando datos desde:", finalPath); // Para depuración

        setLoading(true);
        setError(false);

        fetch(finalPath)
            .then(res => {
                if (!res.ok) throw new Error("Archivo no encontrado");
                return res.json();
            })
            .then(jsonData => {
                if (!jsonData || jsonData.length === 0) throw new Error("JSON vacío");
                // Mezclamos las historias
                const shuffled = jsonData.sort(() => 0.5 - Math.random());
                setData(shuffled);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando comprensión:", err);
                setError(true);
                setLoading(false);
            });
        
        return () => detenerAudio();
    }, [level, grade, subjectId, dataUrl]); // Se actualiza si cambian estos valores

    // ... (RESTO DE FUNCIONES IGUAL: leerTexto, toggleAudio, etc.) ...
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
            utterance.lang = 'es-ES'; // Ojo: Si fuera inglés, deberías pasar una prop "lang"
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
    
    const cambiarFase = (nuevaFase) => {
        setAnimacionFase('fade-out');
        setTimeout(() => {
            setMode(nuevaFase);
            setAnimacionFase('fade-in-up');
        }, 300);
    };

    // --- RENDER ---
    if (loading) return <div className="loading-spinner">Cargando historias... ⏳</div>;
    if (error) return (
        <div className="error-message p-8 text-center text-red-500">
            <h3 className="text-xl font-bold">⚠️ Error al cargar</h3>
            <p>No se ha encontrado el archivo de historias.</p>
        </div>
    );
    if (!data.length) return <div>No hay historias disponibles.</div>;

    const ejercicioActual = data[currentIndex];
    const currentFontStyle = fontStyles[fontStyleIndex]; 

    // Clases dinámicas botones
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

                <div className="config-grid">
                    {tipo === "escrita" && (
                        <div className="config-item">
                            <label className="config-label">✍️ Letra</label>
                            <div className="slider-container">
                                <div className="slider-labels"><span>Imprenta</span><span>Ligada</span><span>Mayús.</span></div>
                                <input type="range" min="0" max="2" step="1" value={fontStyleIndex} onChange={handleFontStyleChange} className="custom-slider font-slider"/>
                            </div>
                        </div>
                    )}
                    {tipo === "oral" && (
                        <div className="config-item">
                            <label className="config-label">🐢 Velocidad 🐇</label>
                            <div className="slider-container">
                                <div className="slider-labels"><span>Lento</span><span>Normal</span><span>Rápido</span></div>
                                <input type="range" min="0.5" max="1.5" step="0.5" value={speechRate} onChange={handleSpeedChange} className="custom-slider speed-slider"/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className={`game-content ${animacionFase}`}>
                {mode === 'lectura' && (
                    <div className="card-principal">
                        <div className="card-header">
                            <h3 className="titulo-historia">{ejercicioActual.titulo}</h3>
                        </div>
                        <div className="card-body">
                            {tipo === "escrita" && <p className="texto-lectura">{ejercicioActual.texto}</p>}
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

                {mode === 'resultado' && (
                    <div className="resultado-card pop-in-bouncy">
                        <h3>Resultado</h3>
                        <div className="score-circle"><span className="score-number">{score}</span><span className="score-total">/ {ejercicioActual.preguntas.length}</span></div>
                        <p className="mensaje-motivacional">{score === 5 ? "¡INCREÍBLE! 🏆" : "¡Bien hecho! 👍"}</p>
                        <div className="revision-panel">
                            {ejercicioActual.preguntas.map((p, idx) => (
                                <div key={idx} className={`review-row ${respuestas[idx] === p.correcta ? 'row-correct' : 'row-incorrect'}`}>
                                    <span className="icon-status">{respuestas[idx] === p.correcta ? '✅' : '❌'}</span>
                                    <span className="review-text">Pregunta {idx + 1}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={siguienteEjercicio} className="btn-restart">Siguiente 🚀</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComprensionJuego;