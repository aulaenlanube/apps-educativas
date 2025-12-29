import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti'; // Asegúrate de tenerlo instalado
import './MayorMenor.css';

const TOTAL_TEST_QUESTIONS = 10;

// --- UTILIDADES ---

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatDec = (num) => parseFloat(num.toFixed(2));


const makeExpressionForValue = (target, allowDecimals = false) => {
    if (Math.random() > 0.4) return { text: target.toString().replace('.', ','), value: target };

    const operation = Math.random() > 0.5 ? '+' : '-';

    if (operation === '+') {
        let a;
        if (allowDecimals) {
            a = formatDec(randomInt(1, Math.max(1, Math.floor(target))) + Math.random());
        } else {
            a = randomInt(1, Math.max(1, Math.floor(target - 1)));
        }
        const b = formatDec(target - a);
        return { text: `${a.toString().replace('.', ',')} + ${b.toString().replace('.', ',')}`, value: target };
    } else {
        const b = allowDecimals ? formatDec(randomInt(1, 10) + Math.random()) : randomInt(1, 10);
        const a = formatDec(target + b);
        return { text: `${a.toString().replace('.', ',')} - ${b.toString().replace('.', ',')}`, value: target };
    }
};

const generateOrderProblem = (level, count = 3) => {
    const items = [];

    for (let i = 0; i < count; i++) {
        let val;
        let text;
        const allowDecimals = level >= 5;

        // Generar un valor base y luego convertirlo en expresión si el nivel lo permite
        if (level === 1) {
            val = randomInt(1, 20);
            if (Math.random() > 0.5) {
                const expr = makeExpressionForValue(val, false);
                text = expr.text;
            } else {
                text = val.toString();
            }
        } else if (level === 2) {
            val = randomInt(10, 100);
            const expr = makeExpressionForValue(val, false);
            text = expr.text;
        } else if (level === 3) {
            const a = randomInt(2, 9);
            const b = randomInt(2, 10);
            val = a * b;
            text = Math.random() > 0.4 ? `${a} x ${b}` : val.toString();
        } else if (level === 4) {
            const a = randomInt(2, 9);
            const b = randomInt(2, 6);
            const c = randomInt(1, 15);
            const op = Math.random() > 0.5 ? '+' : '-';
            val = op === '+' ? (a * b) + c : Math.max(0, (a * b) - c);
            text = Math.random() > 0.3 ? `${a} x ${b} ${op} ${c}` : `${a * b} ${op} ${c}`;
        } else if (level === 5) {
            val = formatDec(randomInt(1, 50) + Math.random());
            text = val.toString().replace('.', ',');
        } else {
            // Nivel 6: Combinación agresiva
            const type = randomInt(1, 3);
            if (type === 1) { // Operación con decimales
                const a = formatDec(randomInt(1, 20) + Math.random());
                const b = formatDec(randomInt(1, 20) + Math.random());
                val = formatDec(a + b);
                text = `${a.toString().replace('.', ',')} + ${b.toString().replace('.', ',')}`;
            } else if (type === 2) { // Multiplicación decimal
                const a = randomInt(2, 5);
                const b = formatDec(randomInt(1, 10) + 0.5);
                val = formatDec(a * b);
                text = `${a} x ${b.toString().replace('.', ',')}`;
            } else {
                val = formatDec(randomInt(1, 100) + Math.random());
                text = val.toString().replace('.', ',');
            }
        }

        items.push({
            id: Math.random(),
            text: text,
            value: val
        });
    }
    // Evitar que salgan valores idénticos de forma seguida para que el orden sea único y claro
    return items.sort((a, b) => a.id - b.id);
};

// --- GENERADOR PRINCIPAL ---
const generateLevelProblem = (level) => {
    let left = { text: '0', value: 0 };
    let rightVal = 0;
    let right = { text: '0', value: 0 };

    if (level === 1) {
        const val = randomInt(1, 20);
        left = { text: val.toString(), value: val };
        rightVal = val + randomInt(-2, 2);
        if (rightVal < 0) rightVal = 0;
        right = { text: rightVal.toString(), value: rightVal };
    }
    else if (level === 2) {
        if (Math.random() > 0.5) {
            const a = randomInt(1, 40);
            const b = randomInt(1, 40);
            left = { text: `${a} + ${b}`, value: a + b };
        } else {
            const val = randomInt(10, 90);
            left = { text: val.toString(), value: val };
        }
        rightVal = left.value + randomInt(-3, 3);
        if (rightVal < 0) rightVal = 0;
        right = makeExpressionForValue(rightVal, false);
    }
    else if (level === 3) {
        const a = randomInt(2, 9);
        const b = randomInt(2, 10);
        const val = a * b;
        left = { text: `${a} x ${b}`, value: val };
        rightVal = val + randomInt(-5, 5);
        if (rightVal < 0) rightVal = 0;
        right = { text: rightVal.toString(), value: rightVal };
    }
    else if (level === 4) {
        const op = Math.random() > 0.5 ? '+' : '-';
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const c = randomInt(1, 20);

        let val = 0;
        let text = "";

        if (op === '+') {
            val = (a * b) + c;
            text = `${a} x ${b} + ${c}`;
        } else {
            val = (a * b) - c;
            if (val < 0) val = 0;
            text = `${a} x ${b} - ${c}`;
        }

        left = { text, value: val };
        rightVal = val + randomInt(-3, 3);
        right = makeExpressionForValue(rightVal, false);
    }
    else if (level === 5) {
        const base = randomInt(1, 20);
        const decimalPart = randomInt(1, 9);

        const type = randomInt(1, 3);
        let valL, valR;

        if (type === 1) {
            valL = base + (decimalPart / 10);
            valR = base + (decimalPart / 100) + 0.1;
        } else if (type === 2) {
            valL = base + Math.random();
            valR = valL + (Math.random() * 0.1 - 0.05);
        } else {
            valL = base + (decimalPart / 10);
            valR = valL;
        }

        left = { text: formatDec(valL).toString().replace('.', ','), value: formatDec(valL) };
        right = { text: formatDec(valR).toString().replace('.', ','), value: formatDec(valR) };
    }
    else if (level === 6) {
        const isMult = Math.random() > 0.5;

        if (isMult) {
            const a = randomInt(2, 8);
            const b = randomInt(1, 10) + 0.5;
            const val = a * b;
            left = { text: `${a} x ${b.toString().replace('.', ',')}`, value: val };
            rightVal = val + (Math.random() * 2 - 1);
        } else {
            const a = formatDec(randomInt(1, 20) + Math.random());
            const b = formatDec(randomInt(1, 10) + Math.random());
            const val = a + b;
            left = { text: `${a.toString().replace('.', ',')} + ${b.toString().replace('.', ',')}`, value: val };
            rightVal = val + (Math.random() * 0.5 - 0.25);
        }
        right = makeExpressionForValue(formatDec(rightVal), true);
    }

    if (Math.random() < 0.2) {
        right.value = left.value;
        if (level < 5) {
            right.text = left.value.toString();
        } else {
            right.text = left.value.toString().replace('.', ',');
        }
    }

    return { left, right };
};


const MayorMenorGame = ({ level, title }) => {
    const [phase, setPhase] = useState('setup'); // 'setup', 'quantity', 'play'
    const [gameMode, setGameMode] = useState('comparar'); // 'comparar' o 'ordenar'
    const [orderCount, setOrderCount] = useState(3);
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', value: 0 });
    const [rightItem, setRightItem] = useState({ text: '', value: 0 });
    const [orderItems, setOrderItems] = useState([]);
    const [selectedSign, setSelectedSign] = useState(null);
    const [feedback, setFeedback] = useState({ text: '', type: '' });

    const [shakeError, setShakeError] = useState(false);

    const [testStats, setTestStats] = useState({
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        finished: false
    });

    const generateProblem = useCallback(() => {
        return generateLevelProblem(level);
    }, [level]);

    // Iniciar Práctica
    const startPractice = useCallback(() => {
        if (gameMode === 'comparar') {
            const { left, right } = generateProblem();
            setLeftItem(left);
            setRightItem(right);
            setSelectedSign(null);
        } else {
            const items = generateOrderProblem(level, orderCount);
            setOrderItems(items);
        }
        setFeedback({ text: '', type: '' });
        setShakeError(false);
    }, [generateProblem, gameMode, level, orderCount]);

    // Iniciar Test
    const startTest = useCallback(() => {
        const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => {
            if (gameMode === 'comparar') return generateProblem();
            return { items: generateOrderProblem(level, orderCount) };
        });

        setTestStats({
            questions: qs,
            currentIndex: 0,
            score: 0,
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
        setFeedback({ text: '', type: '' });
        setShakeError(false);
    }, [generateProblem, gameMode, level, orderCount]);

    useEffect(() => {
        if (phase === 'play') {
            startPractice();
        }
    }, [phase, startPractice]);

    // --- NUEVO: Efecto para lanzar confeti al terminar el test con buena nota ---
    useEffect(() => {
        if (isTestMode && testStats.finished && testStats.score >= 5) {
            // Lanzar confeti duración media
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isTestMode, testStats.finished, testStats.score]);


    const handleSignSelect = (sign) => {
        setSelectedSign(sign);
        if (!isTestMode) {
            setFeedback({ text: '', type: '' });
            setShakeError(false);
        }
    };

    const getCorrectSign = (lVal, rVal) => {
        if (Math.abs(lVal - rVal) < 0.001) return '=';
        return lVal > rVal ? '>' : '<';
    };

    const checkAnswer = () => {
        if (gameMode === 'comparar') {
            if (!selectedSign) return;
            const correct = getCorrectSign(leftItem.value, rightItem.value);
            const isCorrect = selectedSign === correct;

            if (isTestMode) {
                handleTestNext(isCorrect, correct);
            } else {
                if (isCorrect) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#34D399', '#6EE7B7'] });
                    setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
                    setTimeout(startPractice, 1500);
                } else {
                    setShakeError(true);
                    setTimeout(() => setShakeError(false), 500);
                    setFeedback({
                        text: `Incorrecto. ${leftItem.value.toString().replace('.', ',')} es ${correct === '>' ? 'MAYOR' : correct === '<' ? 'MENOR' : 'IGUAL'} que ${rightItem.value.toString().replace('.', ',')}`,
                        type: 'feedback-incorrect'
                    });
                }
            }
        } else {
            // Modo Ordenar
            let isCorrect = true;
            for (let i = 0; i < orderItems.length - 1; i++) {
                if (orderItems[i].value > orderItems[i + 1].value) {
                    isCorrect = false;
                    break;
                }
            }

            if (isTestMode) {
                handleTestNext(isCorrect, "Orden Correcto");
            } else {
                if (isCorrect) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10B981', '#34D399', '#6EE7B7'] });
                    setFeedback({ text: '¡Excelente! El orden es correcto. 🎉', type: 'feedback-correct' });
                    setTimeout(startPractice, 1500);
                } else {
                    setShakeError(true);
                    setTimeout(() => setShakeError(false), 500);
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
        setShakeError(false);
        setFeedback({ text: '', type: '' });
    };

    const handleTestNext = (isCorrect, correctSign) => {
        const nextStats = {
            ...testStats,
            score: isCorrect ? testStats.score + 1 : testStats.score,
            answers: [...testStats.answers, {
                left: gameMode === 'comparar' ? leftItem.text : orderItems.map(i => i.text).join(' | '),
                right: gameMode === 'comparar' ? rightItem.text : '',
                user: gameMode === 'comparar' ? selectedSign : isCorrect ? 'OK' : 'FAIL',
                correct: correctSign,
                isCorrect
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
        } else {
            nextStats.finished = true;
            setTestStats(nextStats);
        }
    };

    // Renderizado de Resultados
    if (isTestMode && testStats.finished) {
        return (
            <div className="mayor-menor-container">
                <h1><span className="gradient-text">Resultados</span></h1>
                <h2 className="text-2xl font-bold mb-4">Puntuación: {testStats.score} / {TOTAL_TEST_QUESTIONS}</h2>

                {testStats.score >= 5 ?
                    <p className="text-green-600 font-bold animate-bounce mb-2">¡Buen trabajo! 🏆</p> :
                    <p className="text-orange-500 font-bold mb-2">¡Sigue practicando! 💪</p>
                }

                <div className="text-left overflow-y-auto mb-6" style={{ maxHeight: '300px' }}>
                    {testStats.answers.map((ans, idx) => (
                        <div key={idx} className={`p-3 mb-2 rounded border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex justify-between items-center text-lg">
                                <span>{ans.left} {ans.right && <strong>{ans.user}</strong>} {ans.right}</span>
                                {ans.isCorrect ? <span>✅</span> : <span className="text-red-600 font-bold text-sm">{gameMode === 'comparar' ? `Era ${ans.correct}` : 'Incorrecto'}</span>}
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

    // VISTAS DE CONFIGURACIÓN
    if (phase === 'setup') {
        return (
            <div className="mayor-menor-container mm-setup-screen">
                <h1><span className="gradient-text">{title}</span></h1>
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
            </div>
        );
    }

    if (phase === 'quantity') {
        return (
            <div className="mayor-menor-container mm-setup-screen">
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
        <div className="mayor-menor-container">
            <div className="mm-game-header">
                <button className="btn-change-mode" onClick={() => { setPhase('setup'); setIsTestMode(false); }}>
                    🏠 Cambiar Modo
                </button>
                <h1><span className="gradient-text">{title}</span></h1>
            </div>

            <div className="mode-selection test-toggle">
                <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => { setIsTestMode(false); startPractice(); }}>Práctica</button>
                <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Examen</button>
            </div>

            {isTestMode && <div className="text-right text-sm text-gray-500 font-bold">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}

            {/* ZONA DE JUEGO */}
            {gameMode === 'comparar' ? (
                <>
                    <p className="instrucciones">Selecciona el signo correcto.</p>
                    <div className="comparison-area">
                        <div className="number-card">{leftItem.text}</div>
                        <div className={`sign-drop-zone ${selectedSign ? 'filled' : ''} ${shakeError ? 'shake-animation' : ''}`}>
                            {selectedSign || '?'}
                        </div>
                        <div className="number-card">{rightItem.text}</div>
                    </div>
                </>
            ) : (
                <>
                    <p className="instrucciones">Ordena de MENOR a MAYOR.</p>
                    <div className={`order-area ${shakeError ? 'shake-animation' : ''}`}>
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
                                            title="Intercambiar"
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

            {/* FEEDBACK */}
            {!isTestMode && feedback.text && (
                <div className={`feedback-message ${feedback.type}`}>{feedback.text}</div>
            )}

            {/* BOTONES DE RESPUESTA SOLO PARA COMPARAR */}
            {gameMode === 'comparar' ? (
                <div className="signs-palette">
                    <button className="sign-btn" onClick={() => handleSignSelect('<')}>&lt;</button>
                    <button className="sign-btn" onClick={() => handleSignSelect('=')}>=</button>
                    <button className="sign-btn" onClick={() => handleSignSelect('>')}>&gt;</button>
                </div>
            ) : (
                <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    Usa los botones ⇄ para intercambiar posiciones
                </div>
            )}

            {/* CONTROLES */}
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
        </div>
    );
};

export const MayorMenor1 = () => <MayorMenorGame level={1} title="Mayor, Menor o Igual (1º)" />;
export const MayorMenor2 = () => <MayorMenorGame level={2} title="Comparar hasta 100 (2º)" />;
export const MayorMenor3 = () => <MayorMenorGame level={3} title="Comparar Multiplicaciones (3º)" />;
export const MayorMenor4 = () => <MayorMenorGame level={4} title="Operaciones Combinadas (4º)" />;
export const MayorMenor5 = () => <MayorMenorGame level={5} title="Comparar Decimales (5º)" />;
export const MayorMenor6 = () => <MayorMenorGame level={6} title="Reto Matemático (6º)" />;

export default MayorMenorGame;