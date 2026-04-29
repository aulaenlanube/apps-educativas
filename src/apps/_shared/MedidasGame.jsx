import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import InstructionsModal, { InstructionsButton } from './InstructionsModal';
import './Medidas.css';

const TOTAL_TEST_QUESTIONS = 10;
const MAX_DIGITS_LIMIT = 99999;
const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 20;

// --- CONFIGURACIÓN DE SISTEMAS DE UNIDADES ---
const MEASURE_TYPES = {
    longitud: {
        id: 'longitud',
        label: 'Longitud',
        icon: '📏',
        baseUnit: 'mm',
        displayBase: 'm',
        units: { mm: 1, cm: 10, dm: 100, m: 1000, dam: 10000, hm: 100000, km: 1000000 },
        order: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']
    },
    masa: {
        id: 'masa',
        label: 'Masa',
        icon: '⚖️',
        baseUnit: 'mg',
        displayBase: 'g',
        units: { mg: 1, cg: 10, dg: 100, g: 1000, dag: 10000, hg: 100000, kg: 1000000 },
        order: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']
    },
    capacidad: {
        id: 'capacidad',
        label: 'Capacidad',
        icon: '💧',
        baseUnit: 'ml',
        displayBase: 'l',
        units: { ml: 1, cl: 10, dl: 100, l: 1000, dal: 10000, hl: 100000, kl: 1000000 },
        order: ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml']
    }
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickUnit = (list) => list[randomInt(0, list.length - 1)];

// --- GENERADORES ---

const generateMeasurement = (typeConfig, allowedUnits, maxValBase) => {
    const unitStr = pickUnit(allowedUnits);
    const factor = typeConfig.units[unitStr];

    const maxAllowedByBase = Math.floor(maxValBase / factor) || 1;
    const maxVal = Math.min(maxAllowedByBase, MAX_DIGITS_LIMIT);

    const val = randomInt(1, maxVal);

    return {
        text: `${val} ${unitStr}`,
        valueBase: val * factor,
        unit: unitStr,
        num: val
    };
};

const generateProblemData = (level, typeId) => {
    const config = MEASURE_TYPES[typeId];
    const { units } = config;

    let allowedUnits = [];
    let maxBase = 1000;

    const uSmall = typeId === 'longitud' ? 'cm' : (typeId === 'masa' ? 'g' : 'cl');
    const uMed = typeId === 'longitud' ? 'm' : (typeId === 'masa' ? 'kg' : 'l');
    const uTiny = typeId === 'longitud' ? 'mm' : (typeId === 'masa' ? 'mg' : 'ml');
    const uLarge = typeId === 'longitud' ? 'km' : (typeId === 'masa' ? 'kg' : 'kl');

    switch (level) {
        case 1:
            allowedUnits = [uSmall, uMed];
            maxBase = 20 * units[uMed];
            break;
        case 2:
            allowedUnits = [uSmall, uMed];
            maxBase = 100 * units[uMed];
            break;
        case 3:
            allowedUnits = [uTiny, uSmall, uMed, uLarge];
            maxBase = 5000 * units[uMed];
            break;
        case 4:
            allowedUnits = config.order;
            maxBase = 10 * units[uLarge];
            break;
        case 5:
            allowedUnits = [uMed, uLarge, uSmall];
            maxBase = 100 * units[uLarge];
            break;
        case 6:
            allowedUnits = config.order;
            maxBase = 1000 * units[uLarge];
            break;
        default:
            allowedUnits = [uMed];
    }

    allowedUnits = allowedUnits.filter(u => units[u]);

    // --- Generar Izquierda ---
    let left;
    if (level >= 5 && Math.random() > 0.6) {
        const possibleBigs = allowedUnits.filter(u => units[u] >= units[uMed]);
        const uBig = possibleBigs.length > 0 ? pickUnit(possibleBigs) : uMed;

        const possibleSmalls = allowedUnits.filter(u => units[u] < units[uBig]);
        const uSmallChoice = possibleSmalls.length > 0 ? pickUnit(possibleSmalls) : uTiny;

        const valBig = randomInt(1, 10);
        const valSmall = randomInt(10, 900);

        const totalBase = (valBig * units[uBig]) + (valSmall * units[uSmallChoice]);
        left = {
            text: `${valBig} ${uBig} ${valSmall} ${uSmallChoice}`,
            valueBase: totalBase,
            isComplex: true,
            unit: null
        };
    } else {
        left = generateMeasurement(config, allowedUnits, maxBase);
    }

    // --- Generar Derecha ---
    let right;
    let targetBase = left.valueBase;
    const relation = Math.random();

    if (relation < 0.3) {
        const validEquivalents = allowedUnits.filter(u => {
            const val = targetBase / units[u];
            return (targetBase % units[u] === 0) && (val <= MAX_DIGITS_LIMIT);
        });

        let candidates = validEquivalents;
        if (left.unit && !left.isComplex) {
            candidates = validEquivalents.filter(u => u !== left.unit);
        }

        if (candidates.length > 0) {
            const unitR = pickUnit(candidates);
            const valR = targetBase / units[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: targetBase };
        } else {
            const uRef = left.unit || uMed;
            const valRef = Math.floor(targetBase / units[uRef]) || targetBase;

            let finalUnit = uRef;
            let finalVal = valRef;

            if (valRef > MAX_DIGITS_LIMIT) {
                const biggerUnits = allowedUnits.filter(u => (targetBase / units[u]) <= MAX_DIGITS_LIMIT);
                if (biggerUnits.length > 0) {
                    finalUnit = pickUnit(biggerUnits);
                    finalVal = Math.floor(targetBase / units[finalUnit]);
                }
            }

            const part1 = Math.floor(finalVal / 2);
            const part2 = finalVal - part1;
            right = {
                text: `${part1} + ${part2} ${finalUnit}`,
                valueBase: targetBase
            };
        }
    } else {
        const variation = (Math.random() > 0.5 ? 1 : -1) * randomInt(1, Math.max(1, Math.floor(left.valueBase * 0.2)));
        let newBase = targetBase + variation;
        if (newBase <= 0) newBase = targetBase + Math.abs(variation);

        const validUnits = allowedUnits.filter(u => {
            const val = newBase / units[u];
            return (newBase % units[u] === 0) && (val <= MAX_DIGITS_LIMIT);
        });

        if (validUnits.length > 0) {
            const unitR = pickUnit(validUnits);
            const valR = newBase / units[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: newBase };
        } else {
            let bestUnit = allowedUnits[0];
            for (const u of allowedUnits) {
                if (newBase / units[u] <= MAX_DIGITS_LIMIT) {
                    bestUnit = u;
                    break;
                }
            }
            const safeBase = Math.round(newBase / units[bestUnit]) * units[bestUnit];
            const displayVal = safeBase / units[bestUnit];

            right = { text: `${displayVal} ${bestUnit}`, valueBase: safeBase };
        }
    }

    return { left, right };
};

const generateOrderProblemManual = (level, typeId, count = 3) => {
    const config = MEASURE_TYPES[typeId];
    const { units } = config;
    const allowedUnits = config.order;
    const items = [];

    for (let i = 0; i < count; i++) {
        const unit = pickUnit(allowedUnits);
        const factor = units[unit];
        let val;
        if (level === 1) val = randomInt(1, 20);
        else if (level <= 3) val = randomInt(1, 100);
        else val = randomInt(1, 500);

        items.push({
            id: Math.random(),
            text: `${val} ${unit}`,
            valueBase: val * factor
        });
    }
    return items;
};

const resolveLevelFromGrade = (gradeParam) => {
    const n = parseInt(gradeParam, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 6) return n;
    return 6;
};

const orderCountForLevel = (level) => {
    if (level <= 2) return 3;
    if (level <= 4) return 4;
    return 5;
};

const MedidasGame = ({ level: levelProp, title, onGameComplete, forcedType, forcedMode }) => {
    const { grade: gradeParam } = useParams();
    const level = useMemo(() => {
        if (Number.isFinite(levelProp)) return levelProp;
        return resolveLevelFromGrade(gradeParam);
    }, [levelProp, gradeParam]);

    const initialPhase = forcedType && forcedMode ? 'play' : 'setup';
    const [phase, setPhase] = useState(initialPhase);
    const [measureType, setMeasureType] = useState(forcedType || 'longitud');
    const [gameMode, setGameMode] = useState(forcedMode || 'comparar');
    const [orderCount, setOrderCount] = useState(() => orderCountForLevel(typeof levelProp === 'number' ? levelProp : resolveLevelFromGrade(gradeParam)));
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', valueBase: 0 });
    const [rightItem, setRightItem] = useState({ text: '', valueBase: 0 });
    const [orderItems, setOrderItems] = useState([]);
    const [selectedSign, setSelectedSign] = useState(null);
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [showHelper, setShowHelper] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const questionStartRef = useRef(null);

    const [testStats, setTestStats] = useState({
        questions: [],
        currentIndex: 0,
        score: 0,
        points: 0,
        answers: [],
        finished: false
    });

    // Si cambia el grade en la URL, reajusta orderCount cuando estamos en una app forzada
    useEffect(() => {
        if (forcedType && forcedMode) {
            setOrderCount(orderCountForLevel(level));
        }
    }, [level, forcedType, forcedMode]);

    const generateProblem = useCallback(() => {
        return generateProblemData(level, measureType);
    }, [level, measureType]);

    const startPractice = useCallback(() => {
        if (gameMode === 'comparar') {
            const { left, right } = generateProblem();
            setLeftItem(left);
            setRightItem(right);
            setSelectedSign(null);
        } else {
            const items = generateOrderProblemManual(level, measureType, orderCount);
            setOrderItems(items);
        }
        setFeedback({ text: '', type: '' });
        questionStartRef.current = Date.now();
    }, [generateProblem, gameMode, level, measureType, orderCount]);

    useEffect(() => {
        if (phase === 'play' && !isTestMode) startPractice();
    }, [measureType, startPractice, isTestMode, phase]);

    const startTest = useCallback(() => {
        const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => {
            if (gameMode === 'comparar') return generateProblem();
            return { items: generateOrderProblemManual(level, measureType, orderCount) };
        });

        setTestStats({
            questions: qs,
            currentIndex: 0,
            score: 0,
            points: 0,
            answers: [],
            finished: false
        });
        setIsTestMode(true);

        if (gameMode === 'comparar') {
            setLeftItem(qs[0].left);
            setRightItem(qs[0].right);
            setSelectedSign(null);
        } else {
            setOrderItems(qs[0].items);
        }
        setShowHelper(false);
        setFeedback({ text: '', type: '' });
        questionStartRef.current = Date.now();
    }, [generateProblem, gameMode, level, measureType, orderCount]);

    // --- Efecto Confetti al terminar Test con éxito ---
    useEffect(() => {
        if (isTestMode && testStats.finished && testStats.score >= 5) {
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isTestMode, testStats.finished, testStats.score]);


    const handleSignSelect = (sign) => {
        setSelectedSign(sign);
        if (!isTestMode) setFeedback({ text: '', type: '' });
    };

    const checkAnswer = () => {
        if (gameMode === 'comparar') {
            if (!selectedSign) return;
            const diff = leftItem.valueBase - rightItem.valueBase;
            let correct = '=';
            if (diff > 0) correct = '>';
            if (diff < 0) correct = '<';
            const isCorrect = selectedSign === correct;

            if (isTestMode) {
                handleTestNext(isCorrect, correct);
            } else {
                if (isCorrect) {
                    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#22c55e', '#86efac', '#166534'] });
                    setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
                    setTimeout(startPractice, 1500);
                } else {
                    setFeedback({
                        text: `Incorrecto. ${leftItem.text} es ${correct === '>' ? 'MAYOR' : correct === '<' ? 'MENOR' : 'IGUAL'} que ${rightItem.text}`,
                        type: 'feedback-incorrect'
                    });
                }
            }
        } else {
            // Modo Ordenar
            let isCorrect = true;
            for (let i = 0; i < orderItems.length - 1; i++) {
                if (orderItems[i].valueBase > orderItems[i + 1].valueBase) {
                    isCorrect = false;
                    break;
                }
            }

            if (isTestMode) {
                handleTestNext(isCorrect, "Orden Correcto");
            } else {
                if (isCorrect) {
                    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#22c55e', '#86efac', '#166534'] });
                    setFeedback({ text: '¡Excelente! El orden es correcto. 🎉', type: 'feedback-correct' });
                    setTimeout(startPractice, 1500);
                } else {
                    setFeedback({ text: 'Aún no están en orden. ¡Prueba de nuevo!', type: 'feedback-incorrect' });
                }
            }
        }
    };

    const swapItems = (idx1, idx2) => {
        if (idx2 < 0 || idx2 >= orderItems.length) return;
        const newItems = [...orderItems];
        [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
        setOrderItems(newItems);
        setFeedback({ text: '', type: '' });
    };

    const handleTestNext = (isCorrect, correctSign) => {
        const elapsedSec = questionStartRef.current
            ? (Date.now() - questionStartRef.current) / 1000
            : SPEED_BONUS_WINDOW_SEC;
        const speedBonus = Math.max(
            0,
            Math.round((1 - Math.min(elapsedSec, SPEED_BONUS_WINDOW_SEC) / SPEED_BONUS_WINDOW_SEC) * MAX_SPEED_BONUS)
        );
        const questionPoints = isCorrect ? BASE_POINTS + speedBonus : 0;

        const nextStats = {
            ...testStats,
            score: isCorrect ? testStats.score + 1 : testStats.score,
            points: testStats.points + questionPoints,
            answers: [...testStats.answers, {
                left: gameMode === 'comparar' ? leftItem.text : orderItems.map(i => i.text).join(' | '),
                right: gameMode === 'comparar' ? rightItem.text : '',
                user: gameMode === 'comparar' ? selectedSign : isCorrect ? 'OK' : 'FAIL',
                correct: correctSign,
                isCorrect,
                elapsedSec: Math.round(elapsedSec * 10) / 10,
                points: questionPoints
            }]
        };

        if (testStats.currentIndex < TOTAL_TEST_QUESTIONS - 1) {
            nextStats.currentIndex += 1;
            setTestStats(nextStats);
            const nextQ = testStats.questions[nextStats.currentIndex];
            if (gameMode === 'comparar') {
                setLeftItem(nextQ.left);
                setRightItem(nextQ.right);
                setSelectedSign(null);
            } else {
                setOrderItems(nextQ.items);
            }
            questionStartRef.current = Date.now();
        } else {
            nextStats.finished = true;
            setTestStats(nextStats);
        }
    };

    const currentConfig = MEASURE_TYPES[measureType];

    const trackedRef = useRef(false);
    useEffect(() => {
        if (isTestMode && testStats.finished && !trackedRef.current) {
            trackedRef.current = true;
            const maxPoints = TOTAL_TEST_QUESTIONS * (BASE_POINTS + MAX_SPEED_BONUS);
            onGameComplete?.({
                mode: 'test',
                score: testStats.points,
                maxScore: maxPoints,
                correctAnswers: testStats.score,
                totalQuestions: TOTAL_TEST_QUESTIONS,
            });
        }
        if (!testStats.finished) trackedRef.current = false;
    }, [isTestMode, testStats.finished, testStats.score, testStats.points, onGameComplete]);

    if (isTestMode && testStats.finished) {
        const nota = Math.round((testStats.score / TOTAL_TEST_QUESTIONS) * 100) / 10;
        const notaColor = nota >= 8 ? '#10b981' : nota >= 5 ? '#3b82f6' : '#ef4444';
        const notaMsg = nota >= 9 ? 'Excelente'
            : nota >= 7 ? 'Muy bien'
                : nota >= 5 ? 'Aprobado'
                    : 'Necesitas repasar';

        return (
            <div className={`medidas-container theme-${measureType}`}>
                <h1><span className="gradient-text">Resultados</span></h1>

                <div className="med-result-hero">
                    <div className="med-nota-block" style={{ borderColor: notaColor }}>
                        <div className="med-nota-label">Tu nota</div>
                        <div className="med-nota-value" style={{ color: notaColor }}>
                            {nota.toFixed(1)}<span className="med-nota-max">/10</span>
                        </div>
                        <div className="med-nota-msg" style={{ color: notaColor }}>{notaMsg}</div>
                    </div>
                    <div className="med-stats-block">
                        <div className="med-stat">
                            <span className="med-stat-label">Aciertos</span>
                            <span className="med-stat-value">{testStats.score} / {TOTAL_TEST_QUESTIONS}</span>
                        </div>
                        <div className="med-stat">
                            <span className="med-stat-label">Puntos</span>
                            <span className="med-stat-value">{testStats.points}</span>
                        </div>
                    </div>
                </div>

                <div className="text-left overflow-y-auto mb-6" style={{ maxHeight: '300px' }}>
                    {testStats.answers.map((ans, idx) => (
                        <div key={idx} className={`p-3 mb-2 rounded border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex justify-between items-center text-lg">
                                <span>{ans.left} {ans.right && <strong>{ans.user}</strong>} {ans.right}</span>
                                {ans.isCorrect
                                    ? <span className="text-green-700 font-bold text-sm">✅ +{ans.points} pts ({ans.elapsedSec}s)</span>
                                    : <span className="text-red-600 font-bold text-sm">{gameMode === 'comparar' ? `Era ${ans.correct}` : 'Incorrecto'}</span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="controles">
                    <button onClick={startTest}>Repetir Examen</button>
                    <button onClick={() => { setIsTestMode(false); startPractice(); }} className="btn-saltar">Salir</button>
                </div>
            </div>
        );
    }

    // VISTAS DE CONFIGURACIÓN (solo si no vienen forzadas type+mode)
    if (phase === 'setup' && !(forcedType && forcedMode)) {
        return (
            <div className={`medidas-container medidas-setup-screen theme-${measureType}`}>
                <h1><span className="gradient-text">{title}</span></h1>

                {!forcedType && (
                    <div className="flex justify-center mb-6">
                        <div className="type-selector-container">
                            {Object.values(MEASURE_TYPES).map(type => (
                                <button
                                    key={type.id}
                                    className={`type-btn t-${type.id} ${measureType === type.id ? 'active' : ''}`}
                                    onClick={() => setMeasureType(type.id)}
                                >
                                    <span>{type.icon}</span> {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {forcedMode ? (
                    <>
                        <p className="instrucciones">Pulsa para empezar.</p>
                        <div className="mode-options">
                            <button className="btn-setup-mode" onClick={() => {
                                if (forcedMode === 'ordenar') {
                                    setOrderCount(orderCountForLevel(level));
                                }
                                setPhase('play');
                            }}>
                                <div className="mode-icon">{forcedMode === 'comparar' ? '⚖️' : '🔢'}</div>
                                <div className="mode-name">{forcedMode === 'comparar' ? 'Comparar' : 'Ordenar'}</div>
                                <div className="mode-desc">{forcedMode === 'comparar' ? '¿Mayor, Menor o Igual?' : 'De menor a mayor'}</div>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="instrucciones">¿Qué quieres practicar hoy?</p>
                        <div className="mode-options">
                            <button className="btn-setup-mode" onClick={() => { setGameMode('comparar'); setPhase('play'); }}>
                                <div className="mode-icon">⚖️</div>
                                <div className="mode-name">Comparar</div>
                                <div className="mode-desc">¿Mayor, Menor o Igual?</div>
                            </button>
                            <button className="btn-setup-mode" onClick={() => { setGameMode('ordenar'); setPhase('quantity'); }}>
                                <div className="mode-icon">🔢</div>
                                <div className="mode-name">Ordenar</div>
                                <div className="mode-desc">De menor a mayor</div>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (phase === 'quantity') {
        return (
            <div className={`medidas-container medidas-setup-screen theme-${measureType}`}>
                <h1><span className="gradient-text">¿Cuántos valores?</span></h1>
                <p className="instrucciones">Selecciona la cantidad de elementos para ordenar:</p>
                <div className="quantity-options">
                    {[3, 4, 5].map(n => (
                        <button key={n} className="btn-quantity" onClick={() => { setOrderCount(n); setPhase('play'); }}>
                            {n}
                        </button>
                    ))}
                </div>
                <button className="btn-back" onClick={() => setPhase('setup')}>← Volver</button>
            </div>
        );
    }

    return (
        <div className={`medidas-container theme-${measureType}`}>
            <div className="medidas-game-header">
                {!(forcedType && forcedMode) && (
                    <button className="btn-change-mode" onClick={() => { setPhase('setup'); setIsTestMode(false); }}>
                        🏠 Cambiar Modo
                    </button>
                )}
                <h1><span className="gradient-text">{title}</span></h1>
                <InstructionsButton onClick={() => setShowInstructions(true)} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-4">
                <div className="mode-selection test-toggle mb-0">
                    <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => { setIsTestMode(false); startPractice(); }}>Práctica</button>
                    <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Examen</button>
                </div>

                {!isTestMode && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className="text-sm font-bold text-gray-600">Ayuda</span>
                        <label className="switch">
                            <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                )}
            </div>

            {/* --- VISUALIZADOR DE ESCALA MEJORADO (solo en práctica) --- */}
            {showHelper && !isTestMode && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-100 fade-in">
                    <div className="flex justify-between items-center px-4 mb-2">
                        <span className="scale-label">MAYOR</span>
                        <span className="scale-label">MENOR</span>
                    </div>

                    <div className="scale-container">
                        {currentConfig.order.map((u, index) => {
                            const isBase = u === currentConfig.displayBase;
                            return (
                                <React.Fragment key={u}>
                                    <div className="scale-step">
                                        <div className={`scale-circle ${isBase ? 'is-base' : ''}`}>
                                            {u}
                                        </div>
                                    </div>

                                    {index < currentConfig.order.length - 1 && (
                                        <div className="scale-connector">
                                            <span className="scale-multiplier">x10</span>
                                            <span className="scale-arrow">→</span>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {isTestMode && <div className="text-right text-sm text-gray-500 font-bold mb-2">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}

            {/* ZONA DE JUEGO */}
            {gameMode === 'comparar' ? (
                <>
                    <p className="instrucciones">Selecciona el signo correcto.</p>
                    <div className="comparison-area">
                        <div className="measure-card">{leftItem.text}</div>

                        <div className={`sign-drop-zone ${selectedSign ? 'filled' : ''} ${!isTestMode && feedback.type.includes('correct') ? (feedback.type.includes('incorrect') ? 'incorrect' : 'correct') : ''}`}>
                            {selectedSign || '?'}
                        </div>

                        <div className="measure-card">{rightItem.text}</div>
                    </div>
                </>
            ) : (
                <>
                    <p className="instrucciones">Ordena de MENOR a MAYOR.</p>
                    <div className={`order-area ${feedback.type === 'feedback-incorrect' ? 'shake-animation' : ''}`}>
                        {orderItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                className="order-item-wrapper"
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="order-card">
                                    <div className="order-value">{item.text}</div>
                                </div>
                                {idx < orderItems.length - 1 && (
                                    <div className="order-separator">
                                        <div className="less-than-sign">&lt;</div>
                                        <button
                                            className="btn-swap-items"
                                            onClick={() => swapItems(idx, idx + 1)}
                                        >
                                            ⇄
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {!isTestMode && feedback.text && (
                <div className={`feedback-message ${feedback.type}`}>{feedback.text}</div>
            )}

            {gameMode === 'comparar' ? (
                <div className="signs-palette">
                    <button className="sign-btn" onClick={() => handleSignSelect('<')}>&lt;</button>
                    <button className="sign-btn" onClick={() => handleSignSelect('=')}>=</button>
                    <button className="sign-btn" onClick={() => handleSignSelect('>')}>&gt;</button>
                </div>
            ) : (
                <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                    Usa los botones ⇄ para intercambiar posiciones
                </div>
            )}

            <div className="controles">
                {isTestMode ? (
                    <button onClick={checkAnswer}>
                        {testStats.currentIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
                    </button>
                ) : (
                    <>
                        <button onClick={checkAnswer}>Comprobar</button>
                        <button onClick={startPractice} className="btn-saltar">Siguiente</button>
                    </>
                )}
            </div>

            <InstructionsModal
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title={title}
            >
                <h3>🎯 Objetivo</h3>
                <p>
                    {gameMode === 'comparar'
                        ? <>Comparar dos medidas de <strong>{currentConfig.label.toLowerCase()}</strong> y decidir si la primera es mayor (&gt;), menor (&lt;) o igual (=) que la segunda.</>
                        : <>Ordenar varias medidas de <strong>{currentConfig.label.toLowerCase()}</strong> de menor a mayor.</>}
                </p>

                <h3>🕹️ Cómo se juega</h3>
                {gameMode === 'comparar' ? (
                    <ul>
                        <li>Lee las dos medidas y pulsa el signo correcto: <strong>&lt;</strong>, <strong>=</strong> o <strong>&gt;</strong>.</li>
                        <li>En <strong>práctica</strong> puedes activar la <strong>escalera de unidades</strong> como ayuda visual.</li>
                        <li>En <strong>examen</strong> no hay ayudas y se mide el tiempo.</li>
                    </ul>
                ) : (
                    <ul>
                        <li>Usa los botones <strong>⇄</strong> entre tarjetas para intercambiar posiciones hasta que queden de menor a mayor.</li>
                        <li>En <strong>práctica</strong> puedes activar la <strong>escalera de unidades</strong> como ayuda visual.</li>
                        <li>En <strong>examen</strong> no hay ayudas y se mide el tiempo.</li>
                    </ul>
                )}

                <h3>📊 Nota y puntos en el examen</h3>
                <p>El examen tiene <strong>{TOTAL_TEST_QUESTIONS} preguntas</strong>. Tu nota va de <strong>0 a 10</strong>:</p>
                <p className="instr-formula">
                    <strong>Nota</strong> = aciertos / {TOTAL_TEST_QUESTIONS} × 10
                </p>
                <p>
                    Además ganas <strong>puntos para el ranking</strong> en cada acierto. Cuanto más rápido respondas, más puntos:
                </p>
                <p className="instr-formula">
                    <strong>Puntos</strong> = {BASE_POINTS} + bonus de velocidad (hasta {MAX_SPEED_BONUS})
                </p>
                <p className="instr-note">
                    Dos partidas con un 10 pueden tener distinta puntuación: gana el ranking quien lo termine antes.
                </p>

                <div className="instr-tips">
                    <strong>💡 Consejo:</strong> en práctica, activa la ayuda de la escalera y observa
                    cómo se multiplica por 10 cada peldaño. Al pasar al examen ya no la verás.
                </div>
            </InstructionsModal>
        </div>
    );
};

// {...props} primero: así el level numérico del wrapper no lo sobrescribe el level string ("primaria") que AppRunnerPage pasa por la URL.
export const LongitudComparar = (props) => <MedidasGame {...props} forcedType="longitud" forcedMode="comparar" title="Longitud: Comparar" />;
export const LongitudOrdenar = (props) => <MedidasGame {...props} forcedType="longitud" forcedMode="ordenar" title="Longitud: Ordenar" />;
export const MasaComparar = (props) => <MedidasGame {...props} forcedType="masa" forcedMode="comparar" title="Masa: Comparar" />;
export const MasaOrdenar = (props) => <MedidasGame {...props} forcedType="masa" forcedMode="ordenar" title="Masa: Ordenar" />;
export const CapacidadComparar = (props) => <MedidasGame {...props} forcedType="capacidad" forcedMode="comparar" title="Capacidad: Comparar" />;
export const CapacidadOrdenar = (props) => <MedidasGame {...props} forcedType="capacidad" forcedMode="ordenar" title="Capacidad: Ordenar" />;

export { generateProblemData, generateOrderProblemManual };
export default MedidasGame;