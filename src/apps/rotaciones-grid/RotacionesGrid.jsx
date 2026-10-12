// Giros y Rotaciones — rediseño 2026 sobre el kit de interfaz de juego
// (_shared/kit). La lógica (figuras, giro, comprobación por forma, examen de 5
// preguntas, puntos × dificultad y onGameComplete) no cambia: solo la
// presentación y la pantalla previa para elegir modo y nivel.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Check, RefreshCw, Eraser, Shapes, Palette, RotateCw, RotateCcw, Wand2, LayoutGrid,
    GraduationCap, Gamepad2, Star, Target, Gauge, Lock, LogOut, Sprout, Puzzle, Rocket,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, Panel, GameButton, Segmented, ModeSelect, RoundBanner,
    ResultsScreen, FeedbackItem, Chip,
} from '../_shared/kit';
import './RotacionesGrid.css';

const GRID_SIZE = 9;
const CENTER = 4; // Mid point of 0-8 is 4
const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
    '#9575CD', '#FF8A65', '#A1887F', '#90A4AE'
];

const DIFFICULTY_MULT = [1.0, 1.5, 2.5];
const DIFFICULTY_NAMES = ['Simple', 'Compuesto', 'Complejo'];
const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 30;

// Solo presentación: ficha de cada nivel
const LEVELS = [
    { icon: Sprout, cells: '3-4 casillas', max: '1.000' },
    { icon: Puzzle, cells: '5-6 casillas', max: '1.500' },
    { icon: Rocket, cells: '7-10 casillas', max: '2.500' },
];
const multLabel = (d) => `×${String(DIFFICULTY_MULT[d]).replace('.', ',')}`;

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
const CATEGORY_INFO = {
    simples: { label: 'Simples', icon: Sprout },
    compuestas: { label: 'Compuestas', icon: Puzzle },
    complejas: { label: 'Complejas', icon: Rocket },
};

// Esfera con el giro pedido: arco desde las 12 en el sentido indicado.
const RotationDial = ({ angle, clockwise }) => {
    const r = 30;
    const c = 42;
    const end = ((clockwise ? angle : -angle) - 90) * (Math.PI / 180);
    const x = c + r * Math.cos(end);
    const y = c + r * Math.sin(end);
    const large = angle > 180 ? 1 : 0;
    const sweep = clockwise ? 1 : 0;
    const d = `M ${c} ${c - r} A ${r} ${r} 0 ${large} ${sweep} ${x} ${y}`;
    return (
        <svg viewBox="0 0 84 84" className="rg-dial" aria-hidden="true">
            <defs>
                <marker id="rg-dial-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto">
                    <path d="M0 0 L10 5 L0 10 Z" fill="#fbbf24" />
                </marker>
            </defs>
            <circle cx={c} cy={c} r={r} className="rg-dial__track" />
            {[0, 90, 180, 270].map((a) => {
                const rad = (a - 90) * (Math.PI / 180);
                return <circle key={a} cx={c + r * Math.cos(rad)} cy={c + r * Math.sin(rad)} r="2.6" className="rg-dial__tick" />;
            })}
            <path key={`${angle}-${clockwise}`} d={d} className="rg-dial__arc" markerEnd="url(#rg-dial-head)" />
            <circle cx={c} cy={c} r="5" className="rg-dial__pin" />
        </svg>
    );
};

const RotacionesGrid = ({ onGameComplete }) => {
    // null = pantalla previa (modo y nivel se eligen antes de jugar)
    const [mode, setMode] = useState(null);
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
    const [examPoints, setExamPoints] = useState(0);
    const [examFinished, setExamFinished] = useState(false);
    const [examHistory, setExamHistory] = useState([]);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const questionStartRef = useRef(null);
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
        questionStartRef.current = Date.now();
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
        const elapsedSec = questionStartRef.current
            ? (Date.now() - questionStartRef.current) / 1000
            : SPEED_BONUS_WINDOW_SEC;
        const speedBonus = Math.max(
            0,
            Math.round((1 - Math.min(elapsedSec, SPEED_BONUS_WINDOW_SEC) / SPEED_BONUS_WINDOW_SEC) * MAX_SPEED_BONUS)
        );
        const mult = DIFFICULTY_MULT[difficulty];
        const questionPoints = wasCorrect ? Math.round((BASE_POINTS + speedBonus) * mult) : 0;
        const newPoints = examPoints + questionPoints;
        const newScoreCount = examScore + (wasCorrect ? 1 : 0);

        const historyItem = {
            step: examStep,
            targetRotation,
            isClockwise,
            userCells: [...userCells],
            isCorrect: wasCorrect,
            elapsedSec: Math.round(elapsedSec * 10) / 10,
            points: questionPoints,
            targetCells: getRotatedCells(currentFigure, targetRotation, isClockwise).map(c => c.pos)
        };
        setExamHistory(prev => [...prev, historyItem]);
        setExamPoints(newPoints);

        setTimeout(() => {
            if (examStep < TOTAL_EXAM_STEPS - 1) {
                setExamStep(prev => prev + 1);
                generateExercise();
            } else {
                setExamFinished(true);
                const maxPointsPerQuestion = Math.round((BASE_POINTS + MAX_SPEED_BONUS) * mult);
                onGameComplete?.({
                    mode: 'test',
                    score: newPoints,
                    maxScore: TOTAL_EXAM_STEPS * maxPointsPerQuestion,
                    correctAnswers: newScoreCount,
                    totalQuestions: TOTAL_EXAM_STEPS,
                });
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
        setExamPoints(0);
        setExamFinished(false);
        setExamHistory([]);
        generateExercise();
    };

    const exitExam = () => {
        setMode('practice');
        setExamFinished(false);
        generateExercise();
    };

    // Cuadrícula 9×9: casillas hundidas y bloques en relieve.
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
                const filled = colorIdx !== undefined;
                const isPivot = x === CENTER && y === CENTER;
                const className = `rg-cell ${filled ? 'is-filled' : ''} ${isCorrect && filled && isInteractive ? 'is-correct' : ''} ${isPivot ? 'is-pivot' : ''}`;
                const content = (
                    <>
                        {filled && (
                            <span
                                className={`rg-block ${colorMode ? 'is-colored' : ''}`}
                                style={colorMode ? { '--bc': COLORS[colorIdx % COLORS.length] } : undefined}
                            />
                        )}
                        {isPivot && <span className="rg-pivot" />}
                    </>
                );
                grid.push(isInteractive ? (
                    <button
                        key={key}
                        type="button"
                        className={className}
                        onClick={() => toggleCell(x, y)}
                        aria-label={`Casilla ${x + 1}, ${y + 1}${filled ? ' (pintada)' : ''}`}
                        aria-pressed={filled}
                    >
                        {content}
                    </button>
                ) : (
                    <div key={key} className={className}>{content}</div>
                ));
            }
        }
        return (
            <div className={`rg-grid ${isInteractive ? 'is-interactive' : ''}`} style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
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
                    <div key={key} className={`rg-mini__cell ${cellMap.has(key) ? 'is-filled' : ''}`}>
                        {cellMap.has(key) && <span className="rg-mini__block" />}
                    </div>
                );
            }
        }
        return <div className="rg-mini" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>{grid}</div>;
    };

    const shellProps = { accent: '#d946ef', accent2: '#8b5cf6', className: 'rg' };
    const difficultyOptions = DIFFICULTY_NAMES.map((name, i) => ({ value: i, label: `${name} ${multLabel(i)}`, icon: LEVELS[i].icon }));

    const instructions = (
        <InstructionsModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            title="Cómo jugar a Giros y Rotaciones"
        >
            <h3>🎯 Objetivo</h3>
            <p>
                Observa la figura <strong>original</strong> y dibújala en la cuadrícula
                de la derecha tras girarla los grados indicados, hacia la derecha o
                hacia la izquierda.
            </p>

            <h3>🕹️ Cómo se juega</h3>
            <ul>
                <li>Haz <strong>click en una casilla</strong> para pintarla. Click otra vez para borrarla.</li>
                <li>Pulsa <strong>Validar</strong> cuando creas que tu dibujo coincide con la rotación pedida.</li>
                <li>Se evalúa la <strong>forma</strong>: no importa el color ni en qué casillas la coloques siempre que sea la misma figura girada.</li>
            </ul>

            <h3>🛠️ Herramientas en práctica</h3>
            <ul>
                <li><strong>Entrenar</strong> — gira la figura paso a paso para visualizar el resultado antes de dibujar.</li>
                <li><strong>Catálogo</strong> — muestra todas las figuras agrupadas por dificultad.</li>
                <li><strong>Colores</strong> — cada punto de la figura recibe un color, ayuda a seguir cómo se mueve cada uno (sólo visual).</li>
            </ul>

            <h3>📊 Nota y puntos en el examen</h3>
            <p>
                El examen tiene <strong>5 preguntas</strong>. Tu nota va de <strong>0 a 10</strong> según los aciertos:
            </p>
            <p className="instr-formula">
                <strong>Nota</strong> = aciertos / 5 × 10
            </p>
            <p>
                Además ganas <strong>puntos</strong> por cada acierto. Cuanto más rápido
                respondas, más puntos. Y cuanto más alta sea la dificultad, mayor es el
                multiplicador final:
            </p>
            <p className="instr-formula">
                <strong>Puntos</strong> = (100 + bonus de velocidad) × multiplicador de dificultad
            </p>

            <h3>🎓 Niveles de dificultad</h3>
            <p className="instr-note">
                El nivel se elige <strong>antes</strong> de empezar el examen y queda
                <strong> bloqueado</strong> hasta terminarlo.
            </p>
            <div className="instr-modes">
                <div className="instr-mode easy">
                    <strong>🌱 Simple ×1.0</strong>
                    Figuras de 3-4 casillas. Puntuación máxima: 1.000 pts.
                </div>
                <div className="instr-mode medium">
                    <strong>🧩 Compuesto ×1.5</strong>
                    Figuras de 5-6 casillas. Puntuación máxima: 1.500 pts.
                </div>
                <div className="instr-mode exam">
                    <strong>🚀 Complejo ×2.5</strong>
                    Figuras de 7-10 casillas. Puntuación máxima: 2.500 pts.
                </div>
            </div>

            <div className="instr-tips">
                <strong>💡 Consejo:</strong> usa <kbd>Entrenar</kbd> en práctica para
                coger soltura visualizando los giros antes de saltar al examen.
            </div>
        </InstructionsModal>
    );

    // ---------- Pantalla previa ----------
    if (!mode) {
        const level = LEVELS[difficulty];
        return (
            <GameShell {...shellProps}>
                <ModeSelect
                    modes={[
                        {
                            id: 'practice', tone: 'easy', icon: Gamepad2, title: 'Práctica',
                            desc: 'Gira figuras sin límite y comprueba tu dibujo cuantas veces quieras.',
                            features: ['Entrenar girando la figura', 'Catálogo y ayuda de colores'],
                        },
                        {
                            id: 'exam', tone: 'exam', title: 'Examen',
                            desc: '5 giros seguidos con el nivel elegido, sin herramientas.',
                            features: ['Nota /10', `Puntos ${multLabel(difficulty)} por rapidez`],
                        },
                    ]}
                    onSelect={(id) => {
                        if (id === 'exam') { startExam(); return; }
                        setMode('practice');
                        generateExercise();
                    }}
                    onHelp={() => setShowInstructions(true)}
                    extra={(
                        <div className="rg-level">
                            <span className="rg-level__title"><Gauge size={16} /> Nivel de las figuras</span>
                            <Segmented options={difficultyOptions} value={difficulty} onChange={setDifficulty} />
                            <span className="rg-level__info">
                                <level.icon size={14} /> {level.cells} · máximo {level.max} pts en el examen
                            </span>
                        </div>
                    )}
                />
                {instructions}
            </GameShell>
        );
    }

    // ---------- Resultados del examen ----------
    if (examFinished) {
        const nota = Math.round((examScore / TOTAL_EXAM_STEPS) * 100) / 10;

        return (
            <GameShell {...shellProps}>
                <ResultsScreen
                    nota={nota}
                    points={examPoints}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${examScore}/${TOTAL_EXAM_STEPS}` },
                        { icon: Gauge, tone: 'accent', label: 'Dificultad', value: `${DIFFICULTY_NAMES[difficulty]} ${multLabel(difficulty)}` },
                    ]}
                    actions={[
                        { label: 'Repetir examen', onClick: startExam, icon: RefreshCw },
                        { label: 'Practicar', onClick: () => { setMode('practice'); setExamFinished(false); generateExercise(); }, icon: Gamepad2, variant: 'soft' },
                        { label: 'Cambiar modo', onClick: () => { setMode(null); setExamFinished(false); }, icon: LayoutGrid, variant: 'ghost' },
                    ]}
                >
                    {examHistory.map((item, idx) => (
                        <FeedbackItem
                            key={idx}
                            index={idx + 1}
                            ok={item.isCorrect}
                            title={`Giro de ${item.targetRotation}º a la ${item.isClockwise ? 'derecha' : 'izquierda'}`}
                        >
                            {item.isCorrect ? (
                                <span className="rg-fb__pill"><Star size={12} /> +{item.points} pts · {item.elapsedSec}s</span>
                            ) : (
                                <div className="rg-compare">
                                    <div className="rg-compare__box">
                                        <span>Tu dibujo</span>
                                        {item.userCells.length > 0 ? renderMiniGrid(item.userCells) : <span className="rg-compare__empty">Vacío</span>}
                                    </div>
                                    <div className="rg-compare__box is-solution">
                                        <span>Solución</span>
                                        {renderMiniGrid(item.targetCells)}
                                    </div>
                                </div>
                            )}
                        </FeedbackItem>
                    ))}
                </ResultsScreen>
            </GameShell>
        );
    }

    // ---------- Partida ----------
    const isExam = mode === 'exam';
    const DirIcon = isClockwise ? RotateCw : RotateCcw;
    const waiting = isExam && feedback?.type === 'info';

    return (
        <GameShell {...shellProps}>
            <GameHeader
                mode={isExam ? 'exam' : 'practice'}
                onHelp={() => setShowInstructions(true)}
                right={(
                    <Hud>
                        {isExam && <HudStat icon={GraduationCap} tone="progress" value={`${examStep + 1}/${TOTAL_EXAM_STEPS}`} label="Pregunta" />}
                        {isExam && <HudStat icon={Star} tone="score" value={examPoints} label="Puntos" />}
                        <HudStat icon={Gauge} tone="accent" value={multLabel(difficulty)} label={DIFFICULTY_NAMES[difficulty]} />
                    </Hud>
                )}
            />

            {isExam && (
                <div className="rg-steps" aria-hidden="true">
                    {Array.from({ length: TOTAL_EXAM_STEPS }).map((_, i) => (
                        <span key={i} className={`rg-steps__seg ${i < examStep ? 'is-done' : i === examStep ? 'is-current' : ''}`} />
                    ))}
                </div>
            )}

            <div className="rg-toolbar">
                {isExam ? (
                    <Chip icon={Lock}>Nivel {DIFFICULTY_NAMES[difficulty]} bloqueado durante el examen</Chip>
                ) : (
                    <Segmented
                        size="sm"
                        options={difficultyOptions}
                        value={difficulty}
                        onChange={(val) => {
                            setDifficulty(val);
                            generateExercise(val);
                        }}
                    />
                )}
                {!isExam && (
                    <div className="rg-toolbar__tools">
                        <GameButton variant="soft" size="sm" icon={Wand2} onClick={() => { setShowHelp(true); setHelpAngle(0); }}>Entrenar</GameButton>
                        <GameButton variant="soft" size="sm" icon={Shapes} onClick={() => setShowIndex(true)}>Catálogo</GameButton>
                    </div>
                )}
            </div>

            <Panel variant="screen" className="rg-order">
                <RotationDial angle={targetRotation} clockwise={isClockwise} />
                <p className="rg-order__text">
                    Gira la figura{' '}
                    <span key={`${targetRotation}-${isClockwise}`} className="rg-order__angle">{targetRotation}º</span>{' '}
                    hacia la <strong className="rg-order__dir"><DirIcon size={20} /> {isClockwise ? 'derecha' : 'izquierda'}</strong>
                </p>
                <label className={`rg-switch ${colorMode ? 'is-on' : ''}`} title="Ayuda visual: se evalúa la forma, no los colores ni su orden.">
                    <input type="checkbox" checked={colorMode} onChange={(e) => setColorMode(e.target.checked)} />
                    <span className="rg-switch__track"><span className="rg-switch__knob" /></span>
                    <span className="rg-switch__label"><Palette size={14} /> Colores</span>
                </label>
            </Panel>

            <div className={`rg-boards ${feedback?.type === 'success' ? 'is-success' : feedback?.type === 'error' ? 'is-error' : ''}`}>
                <Panel variant="surface" className="rg-board">
                    <div className="rg-board__head">
                        <span className="rg-board__title">Original</span>
                        <span className="rg-board__hint">{currentFigure.length} casillas</span>
                    </div>
                    {renderGrid(currentFigure)}
                </Panel>

                <div className="rg-boards__arrow" aria-hidden="true">
                    <span className="rg-boards__badge"><DirIcon size={22} /></span>
                    <span className="rg-boards__deg">{targetRotation}º</span>
                </div>

                <Panel variant="surface" className={`rg-board rg-board--draw ${feedback?.type === 'error' ? 'gk-anim-shake' : ''}`}>
                    <div className="rg-board__head">
                        <span className="rg-board__title">Tu dibujo</span>
                        <span className="rg-board__hint">{userCells.length} pintadas</span>
                    </div>
                    {renderGrid(userCells, true)}
                </Panel>
            </div>

            <RoundBanner
                show={!!feedback}
                status={feedback?.type === 'success' ? 'won' : feedback?.type === 'error' ? 'lost' : 'info'}
                title={feedback?.type === 'success' ? '¡Excelente!' : feedback?.type === 'error' ? 'Aún no es la forma' : 'Respuesta guardada'}
                subtitle={feedback?.type === 'success' ? 'La forma es correcta.' : feedback?.type === 'error' ? feedback.text : 'Siguiente…'}
                action={feedback?.type === 'success' ? () => generateExercise() : undefined}
                actionLabel="Nueva figura"
                actionIcon={RefreshCw}
            />

            <div className="rg-controls">
                <GameButton size="lg" icon={Check} onClick={checkAnswer} disabled={waiting}>Validar</GameButton>
                <GameButton variant="soft" icon={Eraser} onClick={() => setUserCells([])} disabled={waiting}>Borrar</GameButton>
                {!isExam && (
                    <GameButton variant="soft" icon={RefreshCw} onClick={() => generateExercise()}>Nueva</GameButton>
                )}
            </div>

            <div className="rg-footer">
                {isExam ? (
                    <>
                        <span className="rg-footer__info"><GraduationCap size={14} /> Modo examen · sin herramientas</span>
                        <GameButton variant="ghost" size="sm" icon={LogOut} className="rg-footer__exit" onClick={() => setShowExitModal(true)} disabled={waiting}>
                            Abandonar
                        </GameButton>
                    </>
                ) : (
                    <>
                        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setMode(null)}>Cambiar modo</GameButton>
                        <span className="rg-footer__info rg-footer__info--right"><Target size={14} /> Se evalúa la forma, no la posición</span>
                    </>
                )}
            </div>

            {/* Área de entrenamiento */}
            <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Área de entrenamiento">
                <p className="rg-train__lead">Gira la figura original de 90º en 90º y observa dónde acaba cada casilla.</p>
                <div className="rg-train">
                    <div className="rg-train__stage">
                        <div className="rg-train__grid" style={{ transform: `rotate(${helpAngle}deg)` }}>
                            {renderGrid(currentFigure)}
                        </div>
                    </div>
                    <div className="rg-train__controls">
                        <GameButton variant="soft" icon={RotateCcw} onClick={() => setHelpAngle(prev => prev - 90)} title="Girar 90º a la izquierda">−90º</GameButton>
                        <span className="rg-train__angle">{helpAngle}º</span>
                        <GameButton icon={RotateCw} onClick={() => setHelpAngle(prev => prev + 90)} title="Girar 90º a la derecha">+90º</GameButton>
                    </div>
                </div>
            </InstructionsModal>

            {/* Catálogo de figuras */}
            <InstructionsModal isOpen={showIndex} onClose={() => setShowIndex(false)} title="Catálogo de figuras">
                {Object.entries(FIGURES).map(([category, items]) => {
                    const info = CATEGORY_INFO[category];
                    return (
                        <div key={category} className="rg-cat">
                            <h3 className="rg-cat__title"><info.icon size={16} /> {info.label}</h3>
                            <div className="rg-cat__grid">
                                {items.map((fig, idx) => (
                                    <div key={idx} className="rg-cat__item">{renderMiniGrid(fig.cells)}<span>{fig.name}</span></div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </InstructionsModal>

            {instructions}

            <AnimatePresence>
                {showExitModal && (
                    <motion.div
                        className="rg-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowExitModal(false)}
                    >
                        <motion.div
                            className="rg-modal__card"
                            role="dialog"
                            aria-modal="true"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="rg-modal__icon"><LogOut size={28} /></span>
                            <h3>¿Abandonar el examen?</h3>
                            <p>Si sales ahora, este intento <strong>no se guardará</strong> y volverás a la práctica.</p>
                            <div className="rg-modal__actions">
                                <GameButton variant="soft" onClick={() => setShowExitModal(false)}>Seguir</GameButton>
                                <GameButton variant="danger" icon={LogOut} onClick={() => { setShowExitModal(false); exitExam(); }}>Abandonar</GameButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GameShell>
    );
};

export default RotacionesGrid;
