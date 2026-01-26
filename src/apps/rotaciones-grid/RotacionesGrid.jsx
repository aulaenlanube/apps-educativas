import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import './RotacionesGrid.css';

const GRID_SIZE = 9;
const CENTER = 4; // Mid point of 0-8 is 4
const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
    '#9575CD', '#FF8A65', '#A1887F', '#90A4AE'
];

const FIGURES = {
    simples: [
        { name: 'I-Corta', cells: [[0, 0], [0, 1], [0, 2]] },
        { name: 'Angulo', cells: [[1, 0], [0, 0], [0, 1]] },
        { name: 'Cuadrado', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
        { name: 'Barra', cells: [[-1, 0], [0, 0], [1, 0]] },
        { name: 'L-Derecha', cells: [[0, -1], [0, 0], [0, 1], [1, 1]] },
        { name: 'L-Izquierda', cells: [[0, -1], [0, 0], [0, 1], [-1, 1]] },
        { name: 'T-Normal', cells: [[-1, 0], [0, 0], [1, 0], [0, 1]] },
        { name: 'Z-Horizontal', cells: [[-1, 0], [0, 0], [0, 1], [1, 1]] },
        { name: 'S-Horizontal', cells: [[1, 0], [0, 0], [0, 1], [-1, 1]] },
        { name: 'I-Larga', cells: [[0, -1], [0, 0], [0, 1], [0, 2]] },
        { name: 'Podio', cells: [[-1, 1], [0, 1], [1, 1], [0, 0]] },
    ],
    compuestas: [
        { name: 'Cruz', cells: [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]] },
        { name: 'U-Simétrica', cells: [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]] },
        { name: 'Escalera', cells: [[-1, -1], [0, -1], [0, 0], [1, 0], [1, 1]] },
        { name: 'Martillo', cells: [[-1, 0], [0, 0], [1, 0], [2, 0], [0, 1]] },
        { name: 'Serpiente', cells: [[-1, 1], [0, 1], [0, 0], [1, 0], [1, -1]] },
        { name: 'Avión', cells: [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1], [0, 2]] },
        { name: 'Letra-P', cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
        { name: 'Letra-F', cells: [[0, 0], [1, 0], [0, 1], [-1, 1], [0, 2]] },
        { name: 'Corona', cells: [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [0, -1]] },
        { name: 'Robot', cells: [[0, 0], [-1, 1], [0, 1], [1, 1], [-1, 2], [1, 2]] },
    ],
    complejas: [
        { name: 'H-Muda', cells: [[-1, 0], [-1, 1], [-1, 2], [0, 1], [1, 0], [1, 1], [1, 2]] },
        { name: 'Garfio', cells: [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1]] },
        { name: 'Castillo', cells: [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]] },
        { name: 'Gigante-L', cells: [[0, -2], [0, -1], [0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
        { name: 'Letra-E', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [0, -1], [1, -1], [2, -1], [0, 2]] },
        { name: 'Invasor', cells: [[-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [-2, 2], [2, 2], [0, 2]] },
        { name: 'Mariposa', cells: [[-1, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [1, 1], [-2, 0], [2, 0]] },
        { name: 'Dragon', cells: [[0, -1], [1, -1], [1, 0], [0, 0], [-1, 0], [-1, 1], [-1, 2], [0, 2], [1, 2], [2, 2]] },
        { name: 'Escorpion', cells: [[0, 0], [-1, 1], [0, 1], [1, 1], [-1, 2], [1, 2], [0, -1], [0, -2], [1, -2]] },
        { name: 'Nave-Espacial', cells: [[0, -2], [-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-2, 1], [2, 1], [0, 1]] },
        { name: 'Ancla', cells: [[0, -2], [0, -1], [0, 0], [-1, 1], [1, 1], [-2, 0], [2, 0], [-2, -1], [2, -1]] },
        { name: 'Serpiente-G', cells: [[-2, 0], [-1, 0], [-1, 1], [0, 1], [0, 0], [1, 0], [1, -1], [2, -1]] },
        { name: 'Cangrejo', cells: [[-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [-1, 0], [1, 0], [-2, -1], [2, -1]] },
    ]
};

const RotacionesGrid = () => {
    const [mode, setMode] = useState('practice');
    const [currentFigure, setCurrentFigure] = useState([]);
    const [targetRotation, setTargetRotation] = useState(90);
    const [isClockwise, setIsClockwise] = useState(true);
    const [userCells, setUserCells] = useState([]);
    const [showHelp, setShowHelp] = useState(false);
    const [showIndex, setShowIndex] = useState(false);
    const [helpAngle, setHelpAngle] = useState(0);
    const [colorMode, setColorMode] = useState(false);
    const [difficulty, setDifficulty] = useState(0); // 0: Simples, 1: Compuestas, 2: Complejas
    const [feedback, setFeedback] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);

    const [examStep, setExamStep] = useState(0);
    const [examScore, setExamScore] = useState(0);
    const [examFinished, setExamFinished] = useState(false);
    const [examHistory, setExamHistory] = useState([]);
    const TOTAL_EXAM_STEPS = 5;

    const getDifficultyKey = (val) => {
        if (val === 0) return 'simples';
        if (val === 1) return 'compuestas';
        return 'complejas';
    };

    const generateExercise = useCallback((forcedDiff = null) => {
        const diffVal = forcedDiff !== null ? forcedDiff : difficulty;
        const key = getDifficultyKey(parseInt(diffVal));
        const list = FIGURES[key];
        const fig = list[Math.floor(Math.random() * list.length)];
        const placedCells = fig.cells.map(([dx, dy]) => [CENTER + dx, CENTER + dy]);

        const angles = [90, 180, 270];
        const angle = angles[Math.floor(Math.random() * angles.length)];
        const clockwise = Math.random() > 0.5;

        setCurrentFigure(placedCells);
        setTargetRotation(angle);
        setIsClockwise(clockwise);
        setUserCells([]);
        setFeedback(null);
        setIsCorrect(false);
        setShowHelp(false);
        setHelpAngle(0);
    }, [difficulty]);

    useEffect(() => {
        generateExercise();
    }, [generateExercise]);

    const rotatePoint = (x, y, angleDeg, clockwise) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const finalAngle = clockwise ? angleRad : -angleRad;
        const s = Math.sin(finalAngle);
        const c = Math.cos(finalAngle);
        const px = x - CENTER;
        const py = y - CENTER;
        const xnew = px * c - py * s;
        const ynew = px * s + py * c;
        return [Math.round(xnew + CENTER), Math.round(ynew + CENTER)];
    };

    const getRotatedCells = (figure, angle, clockwise) => {
        if (!figure) return [];
        return figure.map(([x, y], idx) => {
            const [nx, ny] = rotatePoint(x, y, angle, clockwise);
            return { pos: [nx, ny], originalIdx: idx };
        });
    };

    const normalizeShape = (cells) => {
        if (cells.length === 0) return '';
        const minX = Math.min(...cells.map(c => c[0]));
        const minY = Math.min(...cells.map(c => c[1]));
        return cells
            .map(([x, y]) => `${x - minX},${y - minY}`)
            .sort()
            .join('|');
    };

    const toggleCell = (x, y) => {
        if (feedback && feedback.type === 'success') return;
        const exists = userCells.some(([cx, cy]) => cx === x && cy === y);
        if (exists) {
            setUserCells(userCells.filter(([cx, cy]) => cx !== x || cy !== y));
        } else {
            setUserCells([...userCells, [x, y]]);
        }
    };

    const nextExamStep = (wasCorrect) => {
        const historyItem = {
            step: examStep,
            targetRotation,
            isClockwise,
            userCells: [...userCells],
            isCorrect: wasCorrect,
            targetCells: getRotatedCells(currentFigure, targetRotation, isClockwise).map(c => c.pos)
        };
        setExamHistory(prev => [...prev, historyItem]);

        setTimeout(() => {
            if (examStep < TOTAL_EXAM_STEPS - 1) {
                setExamStep(prev => prev + 1);
                generateExercise();
            } else {
                setExamFinished(true);
            }
        }, 2000);
    };

    const checkAnswer = () => {
        const target = getRotatedCells(currentFigure, targetRotation, isClockwise);
        const userShape = normalizeShape(userCells);
        const targetShape = normalizeShape(target.map(c => c.pos));
        const isWinner = userShape !== '' && userShape === targetShape;

        if (isWinner) {
            if (mode === 'exam') {
                setFeedback({ type: 'info', text: 'Respuesta guardada. Siguiente...' });
                setExamScore(prev => prev + 1);
                nextExamStep(true);
            } else {
                setFeedback({ type: 'success', text: '¡Excelente! La forma es correcta.' });
                setIsCorrect(true);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } else {
            if (mode === 'exam') {
                setFeedback({ type: 'info', text: 'Respuesta guardada. Siguiente...' });
                setIsCorrect(false);
                nextExamStep(false);
            } else {
                setFeedback({ type: 'error', text: 'Vaya, parece que hay algo mal. ¡Sigue intentándolo!' });
                setIsCorrect(false);
            }
        }
    };

    const startExam = () => {
        setMode('exam');
        setExamStep(0);
        setExamScore(0);
        setExamFinished(false);
        setExamHistory([]);
        generateExercise();
    };

    const exitExam = () => {
        setMode('practice');
        setExamFinished(false);
        generateExercise();
    };

    const renderGrid = (cellData, isInteractive = false) => {
        const grid = [];
        const cellMap = new Map();
        cellData.forEach((item, idx) => {
            const pos = Array.isArray(item) ? item : item.pos;
            const colorIdx = Array.isArray(item) ? idx : item.originalIdx;
            cellMap.set(`${pos[0]},${pos[1]}`, colorIdx);
        });

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const key = `${x},${y}`;
                const colorIdx = cellMap.get(key);
                let className = 'grid-cell';
                if (colorIdx !== undefined) className += ' filled';
                if (isCorrect && colorIdx !== undefined && isInteractive) className += ' correct';

                grid.push(
                    <div key={key} className={className} onClick={isInteractive ? () => toggleCell(x, y) : undefined}>
                        {colorIdx !== undefined && (
                            <div
                                className="dot"
                                style={{
                                    backgroundColor: colorMode ? COLORS[colorIdx % COLORS.length] : '#4A90E2'
                                }}
                            />
                        )}
                        {x === CENTER && y === CENTER && <div style={{ position: 'absolute', width: 4, height: 4, background: 'rgba(0,0,0,0.2)', borderRadius: '50%' }} />}
                    </div>
                );
            }
        }
        return (
            <div className="rotation-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {grid}
            </div>
        );
    };

    const renderMiniGrid = (cells) => {
        const SIZE = 5;
        const grid = [];
        const minX = Math.min(...cells.map(c => c[0]));
        const minY = Math.min(...cells.map(c => c[1]));
        const maxX = Math.max(...cells.map(c => c[0]));
        const maxY = Math.max(...cells.map(c => c[1]));
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const offX = Math.floor((SIZE - w) / 2);
        const offY = Math.floor((SIZE - h) / 2);
        const cellMap = new Set(cells.map(([x, y]) => `${x - minX + offX},${y - minY + offY}`));
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                const key = `${x},${y}`;
                grid.push(
                    <div key={key} className={`mini-cell ${cellMap.has(key) ? 'filled' : ''}`}>
                        {cellMap.has(key) && <div className="mini-dot" />}
                    </div>
                );
            }
        }
        return <div className="mini-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>{grid}</div>;
    };

    if (examFinished) {
        return (
            <div className="rotaciones-container">
                <div className="grid-card wide">
                    <div className="rotaciones-header"><h1>¡Examen Finalizado!</h1></div>
                    <p className="feedback-msg">Tu puntuación: <span className="score-badge">{examScore} / {TOTAL_EXAM_STEPS}</span></p>

                    <div className="exam-history-summary">
                        {examHistory.map((item, idx) => (
                            <div key={idx} className={`summary-card ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="summary-header">
                                    <span className="question-number">Pregunta {idx + 1}</span>
                                    <span className="status-badge">{item.isCorrect ? '✅ Logrado' : '❌ Fallido'}</span>
                                </div>
                                <div className="summary-details">
                                    <p>Giro de <strong>{item.targetRotation}º</strong> a la <strong>{item.isClockwise ? 'derecha' : 'izquierda'}</strong></p>
                                    {!item.isCorrect && (
                                        <div className="comparison-area">
                                            <div className="comparison-box">
                                                <span>Tu dibujo:</span>
                                                {renderMiniGrid(item.userCells)}
                                            </div>
                                            <div className="comparison-box">
                                                <span>Solución:</span>
                                                {renderMiniGrid(item.targetCells)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="controls-panel">
                        <div className="button-group">
                            <button className="btn-primary" onClick={() => { setMode('practice'); setExamFinished(false); generateExercise(); }}>Volver a Práctica</button>
                            <button className="btn-secondary" onClick={startExam}>Repetir Examen</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rotaciones-container">
            <div className="rotaciones-header">
                <h1>Giros y Rotaciones</h1>
            </div>

            <div className="top-actions-panel">
                <div className="difficulty-selector">
                    <div className="difficulty-label">
                        {difficulty === 0 && '🌱 Nivel: Simple'}
                        {difficulty === 1 && '🧩 Nivel: Compuesto'}
                        {difficulty === 2 && '🚀 Nivel: Complejo'}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        value={difficulty}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setDifficulty(val);
                            generateExercise(val);
                        }}
                        className="range-slider"
                    />
                </div>

                {mode === 'practice' && (
                    <div className="button-group">
                        <button className="btn-secondary" onClick={() => { setShowHelp(true); setHelpAngle(0); }}>💡 Ayuda</button>
                        <button className="btn-secondary" onClick={() => setShowIndex(true)}>📚 Catálogo</button>
                        <button className="btn-accent" onClick={startExam}>🏆 Examen</button>
                    </div>
                )}
            </div>

            <div className="instruction-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="instruction-text" style={{ flex: 1, textAlign: 'center', fontSize: '1.4rem' }}>
                    Gira la figura <span className="angle-badge">{targetRotation}º</span> hacia la <strong>{isClockwise ? 'derecha ➡️' : 'izquierda ⬅️'}</strong>.
                </p>
                <div className="switch-container has-tooltip">
                    <span>Colores</span>
                    <label className="switch">
                        <input type="checkbox" checked={colorMode} onChange={(e) => setColorMode(e.target.checked)} />
                        <span className="slider"></span>
                    </label>
                    <div className="tooltip-box">
                        💡 Ayuda visual: Se evalúa la forma, no los colores ni su orden.
                    </div>
                </div>
            </div>

            {mode === 'exam' && (
                <div className="exam-stats">
                    <span>Pregunta: {examStep + 1} / {TOTAL_EXAM_STEPS}</span>
                </div>
            )}

            <div className="rotaciones-game-area">
                <div className="grid-card"><h3 className="grid-title">Original</h3>{renderGrid(currentFigure)}</div>
                <div className="grid-card"><h3 className="grid-title">Tu Dibujo</h3>{renderGrid(userCells, true)}</div>
            </div>

            {feedback && <p className={`feedback-msg ${feedback.type}`}>{feedback.text}</p>}

            <div className="controls-panel">
                <div className="button-group">
                    <button className="btn-primary btn-large" onClick={checkAnswer}>✅ Validar</button>
                </div>
                <div className="button-group">
                    {mode === 'practice' ? (
                        <button className="btn-secondary" onClick={() => generateExercise()}>🔄 Nueva</button>
                    ) : (
                        <button className="btn-secondary danger" onClick={exitExam}>🛑 Abandonar</button>
                    )}
                    <button className="btn-secondary danger" onClick={() => setUserCells([])}>🗑️ Borrar</button>
                </div>
            </div>

            {showHelp && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={() => setShowHelp(false)}>×</button>
                        <div className="rotaciones-header"><h1>Área de Entrenamiento</h1></div>
                        <div className="help-grid-container">
                            <div className="help-grid-animated" style={{ transform: `rotate(${helpAngle}deg)` }}>
                                {renderGrid(currentFigure)}
                            </div>
                        </div>
                        <div className="rotation-controls">
                            <button className="btn-rotation-circle" onClick={() => setHelpAngle(prev => prev - 90)} title="Girar 90º a la izquierda">
                                <span className="icon">↺</span>
                                <span className="label">-90º</span>
                            </button>
                            <div className="angle-display-glow">{helpAngle}º</div>
                            <button className="btn-rotation-circle primary" onClick={() => setHelpAngle(prev => prev + 90)} title="Girar 90º a la derecha">
                                <span className="icon">↻</span>
                                <span className="label">+90º</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showIndex && (
                <div className="modal-overlay">
                    <div className="modal-content wide">
                        <button className="close-modal" onClick={() => setShowIndex(false)}>×</button>
                        <div className="rotaciones-header"><h1>Catálogo de Figuras</h1></div>
                        {Object.entries(FIGURES).map(([category, items]) => (
                            <div key={category} className="figures-category-section">
                                <h3 className="category-title">
                                    {category === 'simples' && '🌱 Simples'}
                                    {category === 'compuestas' && '🧩 Compuestas'}
                                    {category === 'complejas' && '🚀 Complejas'}
                                </h3>
                                <div className="figures-index-grid">
                                    {items.map((fig, idx) => (
                                        <div key={idx} className="figure-index-item">{renderMiniGrid(fig.cells)}<span className="figure-name">{fig.name}</span></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RotacionesGrid;
