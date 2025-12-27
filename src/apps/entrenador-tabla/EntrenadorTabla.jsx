// src/apps/entrenador-tabla/EntrenadorTabla.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './EntrenadorTabla.css';

const FAMILIES = {
    'alkali-metal': { label: 'Alcalinos', color: '#f87171' },
    'alkaline-earth': { label: 'Alcalinotérreos', color: '#fb923c' },
    'transition': { label: 'Metales de Transición', color: '#f472b6' },
    'transition-metal': { label: 'Metales de Transición', color: '#f472b6' },
    'post-transition': { label: 'Metales del bloque p', color: '#94a3b8' },
    'metalloid': { label: 'Metaloides', color: '#2dd4bf' },
    'non-metal': { label: 'No Metales', color: '#4ade80' },
    'halogen': { label: 'Halógenos', color: '#facc15' },
    'noble-gas': { label: 'Gases Nobles', color: '#60a5fa' },
    'lanthanide': { label: 'Lantánidos', color: '#a78bfa' },
    'actinide': { label: 'Actínidos', color: '#c084fc' },
    'unknown': { label: 'Desconocido', color: '#cbd5e1' }
};

const EntrenadorTabla = () => {
    // Game State
    const [gameState, setGameState] = useState('setup'); // setup, playing, result
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Settings
    const [config, setConfig] = useState({
        gameMode: 'practice', // practice, exam, exam-pro
        scope: 'all', // all, category, range
        clueType: 'symbolToName', // symbolToName, nameToSymbol
        selectedCategories: [],
        range: [1, 118]
    });
    // Session State
    const [session, setSession] = useState({
        targets: [],
        currentIndex: 0,
        score: 0,
        streak: 0,
        startTime: null,
        answers: []
    });

    const [currentOptions, setCurrentOptions] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);

    // Initial load
    useEffect(() => {
        fetch('/data/quimica/elementos_info.json')
            .then(res => res.json())
            .then(data => {
                setElements(data.elements);
                setLoading(false);
            })
            .catch(err => console.error("Error cargando elementos:", err));
    }, []);

    // Filtered elements pool BASED ON CONFIG
    const pool = useMemo(() => {
        if (!elements.length) return [];
        let filtered = [...elements];

        if (config.scope === 'category' && config.selectedCategories.length > 0) {
            filtered = filtered.filter(e => config.selectedCategories.includes(e.category));
        } else if (config.scope === 'range') {
            filtered = filtered.filter(e => e.atomicNumber >= config.range[0] && e.atomicNumber <= config.range[1]);
        }

        return filtered;
    }, [elements, config.scope, config.selectedCategories, config.range]);

    const startSession = () => {
        if (!pool.length) return;

        // Shuffle and pick session targets
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const count = config.gameMode === 'practice' ? 20 : 10;
        const targets = shuffled.slice(0, Math.min(count, shuffled.length));

        setSession({
            targets,
            currentIndex: 0,
            score: 0,
            streak: 0,
            startTime: Date.now(),
            answers: []
        });
        setGameState('playing');
        setUserInput('');
        generateNewQuestion(targets[0], targets);
    };

    const normalizeString = (str) => {
        return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    };

    const handleTextSubmit = (e) => {
        if (e) e.preventDefault();
        if (selectedAnswer || !userInput.trim()) return;

        const target = session.targets[session.currentIndex];
        const expected = config.clueType === 'symbolToName' ? target.name : target.symbol;

        const correct = normalizeString(userInput) === normalizeString(expected);

        // Simular el objeto de respuesta para la lógica existente
        handleAnswer(correct ? target : { symbol: 'WRONG' });
    };

    const generateNewQuestion = (target, allTargets) => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setUserInput('');

        // Generate 3 random wrong options from ALL elements
        const others = elements
            .filter(e => e.symbol !== target.symbol)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [...others, target].sort(() => Math.random() - 0.5);
        setCurrentOptions(options);
    };

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent double clicking

        const correct = answer.symbol === session.targets[session.currentIndex].symbol;
        setSelectedAnswer(answer);
        setIsCorrect(correct);

        if (correct) {
            setSession(s => ({ ...s, score: s.score + 1, streak: s.streak + 1 }));
            if (session.streak + 1 === 5) {
                confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
            }
        } else {
            setSession(s => ({ ...s, streak: 0 }));
        }

        setTimeout(() => {
            const nextIdx = session.currentIndex + 1;
            if (nextIdx < session.targets.length) {
                setSession(s => ({ ...s, currentIndex: nextIdx }));
                generateNewQuestion(session.targets[nextIdx], session.targets);
            } else {
                setGameState('result');
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
        }, 1200);
    };

    const toggleCategory = (cat) => {
        setConfig(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(cat)
                ? prev.selectedCategories.filter(c => c !== cat)
                : [...prev.selectedCategories, cat]
        }));
    };

    if (loading) return <div className="trainer-loading">Preparando Laboratorio...</div>;

    const currentTarget = session.targets[session.currentIndex];

    // Helper for clue display
    const renderClue = () => {
        if (!currentTarget) return null;
        switch (config.clueType) {
            case 'symbolToName': return <div className="question-main">{currentTarget.symbol}</div>;
            case 'nameToSymbol': return <div className="question-main" style={{ fontSize: '3rem' }}>{currentTarget.name}</div>;
            case 'atomicToName': return <div className="question-main">{currentTarget.atomicNumber}</div>;
            case 'protonsToName': return <div className="question-main">{currentTarget.atomicNumber} <span style={{ fontSize: '2rem' }}>Protones</span></div>;
            case 'electronsToName': return <div className="question-main">{currentTarget.atomicNumber} <span style={{ fontSize: '2rem' }}>Electrones</span></div>;
            default: return null;
        }
    };

    const getClueHint = () => {
        switch (config.clueType) {
            case 'symbolToName': return "¿Cómo se llama este elemento?";
            case 'nameToSymbol': return "¿Cuál es su símbolo químico?";
            case 'atomicToName': return "¿Qué elemento tiene este número atómico?";
            case 'protonsToName': return "¿Qué elemento tiene esta cantidad de protones?";
            case 'electronsToName': return "¿Cuántos electrones tiene un átomo neutro de este elemento?";
            default: return "";
        }
    };

    const getOptionLabel = (opt) => {
        if (config.clueType === 'nameToSymbol') return opt.symbol;
        return opt.name;
    };

    return (
        <div className="trainer-container">
            <AnimatePresence mode="wait">
                {gameState === 'setup' && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="setup-screen"
                    >
                        <h1 className="setup-title">ENTRENADOR QUÍMICO</h1>

                        <div className="setup-grid">
                            <div className="setup-card">
                                <h3>🎮 MODO DE JUEGO</h3>
                                <div className="mode-selector">
                                    <button
                                        className={`option-btn ${config.gameMode === 'practice' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, gameMode: 'practice' })}
                                    >
                                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🚀</span>
                                        Práctica Libre
                                    </button>
                                    <button
                                        className={`option-btn ${config.gameMode === 'exam' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, gameMode: 'exam' })}
                                    >
                                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>⏱️</span>
                                        Modo Examen (10 Q)
                                    </button>
                                    <button
                                        className={`option-btn ${config.gameMode === 'exam-pro' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, gameMode: 'exam-pro' })}
                                    >
                                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔥</span>
                                        Modo Examen PRO (10 Q)
                                    </button>
                                </div>
                            </div>

                            <div className="setup-card">
                                <h3>💡 TIPO DE PREGUNTA</h3>
                                <div className="mode-selector">
                                    <button
                                        className={`option-btn ${config.clueType === 'symbolToName' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, clueType: 'symbolToName' })}
                                    >
                                        Símbolo ➔ Nombre
                                    </button>
                                    <button
                                        className={`option-btn ${config.clueType === 'nameToSymbol' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, clueType: 'nameToSymbol' })}
                                    >
                                        Nombre ➔ Símbolo
                                    </button>
                                </div>
                            </div>

                            <div className="setup-card" style={{ gridColumn: 'span 2' }}>
                                <h3>🔬 RANGO DE ESTUDIO</h3>
                                <div className="scope-options" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <button
                                        className={`option-btn ${config.scope === 'all' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, scope: 'all' })}
                                    >
                                        Toda la Tabla (1-118)
                                    </button>
                                    <button
                                        className={`option-btn ${config.scope === 'category' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, scope: 'category' })}
                                    >
                                        Por Familias
                                    </button>
                                    <button
                                        className="option-btn"
                                        style={{ marginLeft: 'auto', background: 'rgba(56, 189, 248, 0.1)', borderColor: 'var(--accent-blue)' }}
                                        onClick={() => setGameState('study')}
                                    >
                                        📊 VER TABLA PERIÓDICA
                                    </button>
                                </div>

                                {config.scope === 'category' && (
                                    <div className="category-tags">
                                        {Object.entries(FAMILIES).slice(0, 11).map(([key, data]) => (
                                            <button
                                                key={key}
                                                className={`tag-btn ${config.selectedCategories.includes(key) ? 'active' : ''}`}
                                                onClick={() => toggleCategory(key)}
                                                style={{ borderLeftColor: data.color, borderLeftWidth: '4px' }}
                                            >
                                                {data.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="start-btn" onClick={startSession}>
                            ¡EMPEZAR ENTRENAMIENTO!
                        </button>
                    </motion.div>
                )}

                {gameState === 'study' && (
                    <motion.div
                        key="study"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="study-screen"
                    >
                        <header className="game-header">
                            <h2 style={{ margin: 0 }}>TABLA PERIÓDICA DE ESTUDIO</h2>
                            <button className="option-btn" onClick={() => setGameState('setup')}>VOLVER AL MENÚ</button>
                        </header>

                        <div className="periodic-table-study-container">
                            <div className="periodic-grid-full">
                                {Array.from({ length: 7 }, (_, r) => r + 1).map(r =>
                                    Array.from({ length: 18 }, (_, c) => c + 1).map(c => {
                                        const el = elements.find(e => e.pos[0] === r && e.pos[1] === c);
                                        return (
                                            <div
                                                key={`grid-${r}-${c}`}
                                                className={`table-cell-study ${el ? 'active' : 'empty'}`}
                                                style={{
                                                    backgroundColor: el ? FAMILIES[el.category]?.color || '#8b8b8b' : 'transparent',
                                                    gridRow: r,
                                                    gridColumn: c
                                                }}
                                                onClick={() => el && setSelectedAnswer(el)} // Reutilizamos setSelectedAnswer para ver detalles
                                            >
                                                {el && (
                                                    <>
                                                        <span className="cell-num">{el.atomicNumber}</span>
                                                        <span className="cell-sym">{el.symbol}</span>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="extra-rows-study">
                                <div className="extra-label">LANTÁNIDOS Y ACTÍNIDOS</div>
                                <div className="periodic-grid-full extra-grid">
                                    {[8, 9].map(r =>
                                        Array.from({ length: 18 }, (_, c) => c + 1).map(c => {
                                            const el = elements.find(e => e.pos[0] === r && e.pos[1] === c);
                                            return (
                                                <div
                                                    key={`grid-extra-${r}-${c}`}
                                                    className={`table-cell-study ${el ? 'active' : 'empty'}`}
                                                    style={{
                                                        backgroundColor: el ? FAMILIES[el.category]?.color || '#8b8b8b' : 'transparent',
                                                        gridRow: r === 8 ? 1 : 2,
                                                        gridColumn: c
                                                    }}
                                                    onClick={() => el && setSelectedAnswer(el)}
                                                >
                                                    {el && (
                                                        <>
                                                            <span className="cell-num">{el.atomicNumber}</span>
                                                            <span className="cell-sym">{el.symbol}</span>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DETALLE DEL ELEMENTO (IGUAL QUE EN MESA DE CRAFTEO) */}
                        <AnimatePresence>
                            {selectedAnswer && (
                                <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setSelectedAnswer(null)}>
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="molecule-reveal-card element-detail-card-study"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="detail-header-study">
                                            <span className="cat-label-study">{FAMILIES[selectedAnswer.category]?.label || 'Elemento'}</span>
                                            <button className="btn-close-study" onClick={() => setSelectedAnswer(null)}>X</button>
                                        </div>

                                        <div className="element-scientific-box" style={{ '--element-color': FAMILIES[selectedAnswer.category]?.color || '#8b8b8b' }}>
                                            <div className="element-main-content-study">
                                                <div className="scientific-top-left-study">
                                                    <div className="ev-stat-item-study" data-label="Masa Atómica">{selectedAnswer.atomicMass}</div>
                                                    <div className="scientific-sub-stats-study">
                                                        <div className="ev-stat-item-study" data-label="Energía Ionización (eV)">{selectedAnswer.ionizationEnergy}</div>
                                                        <div className="ev-stat-item-study" data-label="Electronegatividad">{selectedAnswer.electronegativity}</div>
                                                    </div>
                                                </div>
                                                <div className="scientific-top-right-study">
                                                    <div className="ev-stat-number-study" data-label="Número Atómico">{selectedAnswer.atomicNumber}</div>
                                                </div>
                                                <div className="scientific-center-study">
                                                    <div className="ev-symbol-study" data-label="Símbolo Químico">{selectedAnswer.symbol}</div>
                                                    <div className="ev-name-study" data-label="Nombre">{selectedAnswer.name}</div>
                                                </div>
                                                <div className="scientific-bottom-study">
                                                    <div className="ev-config-study" data-label="Configuración Electrónica">{selectedAnswer.config}</div>
                                                </div>
                                            </div>
                                            <div className="scientific-side-bar-study" data-label="Estados de Oxidación">
                                                {(selectedAnswer.oxidationStates || "").split(',').map(s => (
                                                    <div key={s} className="ev-oxidation-study">{s.trim()}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="scientific-description-card-study">
                                            <div className="desc-header-study" style={{ color: FAMILIES[selectedAnswer.category]?.color || 'var(--primary-color)' }}>
                                                🔬 INFORMACIÓN CIENTÍFICA
                                            </div>
                                            <div className="desc-content-study">
                                                {selectedAnswer.description}
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="game-screen"
                    >
                        <header className="game-header">
                            <div className="stat-item">
                                <span className="stat-value">{session.currentIndex + 1} / {session.targets.length}</span>
                                <span className="stat-label">Pregunta</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#4ade80' }}>{session.score}</span>
                                <span className="stat-label">Aciertos</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value" style={{ color: '#fbbf24' }}>x{session.streak}</span>
                                <span className="stat-label">Racha</span>
                            </div>
                            <button className="option-btn" onClick={() => setGameState('setup')} style={{ fontSize: '0.8rem' }}>SALIR</button>
                        </header>

                        <div className="question-card">
                            <div className="question-hint">{getClueHint()}</div>
                            {renderClue()}

                            {config.gameMode !== 'exam-pro' && (
                                <div className="question-desc">
                                    {currentTarget.description.slice(0, 100)}...
                                </div>
                            )}

                            {config.gameMode === 'exam-pro' ? (
                                <form onSubmit={handleTextSubmit} className="text-answer-container">
                                    <input
                                        type="text"
                                        className={`pro-input ${selectedAnswer ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder={config.clueType === 'symbolToName' ? "Nombre del elemento..." : "Símbolo..."}
                                        autoFocus
                                        disabled={!!selectedAnswer}
                                    />
                                    {!selectedAnswer && (
                                        <button type="submit" className="pro-submit-btn">ENVIAR</button>
                                    )}
                                    {selectedAnswer && !isCorrect && (
                                        <div className="correct-revealer">
                                            La respuesta era: <strong>{config.clueType === 'symbolToName' ? currentTarget.name : currentTarget.symbol}</strong>
                                        </div>
                                    )}
                                </form>
                            ) : (
                                <div className="answers-grid">
                                    {currentOptions.map((opt, i) => (
                                        <button
                                            key={opt.symbol + i}
                                            className={`answer-btn ${selectedAnswer === opt
                                                ? (isCorrect ? 'correct' : 'wrong')
                                                : (selectedAnswer && opt.symbol === currentTarget.symbol ? 'correct disabled' : selectedAnswer ? 'disabled' : '')
                                                }`}
                                            onClick={() => handleAnswer(opt)}
                                        >
                                            {getOptionLabel(opt)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <div className="result-screen">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="result-card"
                        >
                            <div className="result-icon">🏆</div>
                            <h2 className="setup-title">SESIÓN COMPLETADA</h2>
                            <div className="result-score">{session.score} / {session.targets.length}</div>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                                Has identificado correctamente el {Math.round((session.score / session.targets.length) * 100)}% de los elementos.
                            </p>
                            <button className="start-btn" onClick={() => setGameState('setup')}>
                                VOLVER A ENTRENAR
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EntrenadorTabla;
