import React, { useState, useEffect, useCallback } from 'react';
import './MayorMenor.css';

const TOTAL_TEST_QUESTIONS = 10;

// --- UTILIDADES ---

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatDec = (num) => parseFloat(num.toFixed(2)); // Máximo 2 decimales para evitar errores de JS

// Genera una operación simple que dé como resultado 'target'
// Intenta hacer sumas o restas para ajustar fácilmente al valor exacto
const makeExpressionForValue = (target, allowDecimals = false) => {
    // A veces devolvemos simplemente el número (60% probabilidad)
    if (Math.random() > 0.4) return { text: target.toString().replace('.', ','), value: target };

    // Si no, generamos operación
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    if (operation === '+') {
        let a;
        if (allowDecimals) {
            a = formatDec(randomInt(1, Math.floor(target)) + Math.random());
        } else {
            a = randomInt(1, Math.floor(target - 1) || 1);
        }
        const b = formatDec(target - a);
        return { text: `${a.toString().replace('.', ',')} + ${b.toString().replace('.', ',')}`, value: target };
    } else {
        // Resta: target = a - b  => a = target + b
        const b = allowDecimals ? formatDec(randomInt(1, 10) + Math.random()) : randomInt(1, 10);
        const a = formatDec(target + b);
        return { text: `${a.toString().replace('.', ',')} - ${b.toString().replace('.', ',')}`, value: target };
    }
};

// --- GENERADOR PRINCIPAL ---

const generateLevelProblem = (level) => {
    let left = { text: '0', value: 0 };
    let rightVal = 0;
    let right = { text: '0', value: 0 };

    // --- NIVEL 1: 1º Primaria (1-20, Números cercanos) ---
    if (level === 1) {
        const val = randomInt(1, 20);
        left = { text: val.toString(), value: val };
        
        // El derecho varía entre -2 y +2
        rightVal = val + randomInt(-2, 2);
        if (rightVal < 0) rightVal = 0; // Evitar negativos
        right = { text: rightVal.toString(), value: rightVal };
    }

    // --- NIVEL 2: 2º Primaria (1-100, Sumas sencillas) ---
    else if (level === 2) {
        // Izquierda: Operación o Número
        if (Math.random() > 0.5) {
            const a = randomInt(1, 40);
            const b = randomInt(1, 40);
            left = { text: `${a} + ${b}`, value: a + b };
        } else {
            const val = randomInt(10, 90);
            left = { text: val.toString(), value: val };
        }

        // Derecha: Valor cercano +/- 3
        rightVal = left.value + randomInt(-3, 3);
        if (rightVal < 0) rightVal = 0;
        
        // A veces mostramos operación a la derecha también
        right = makeExpressionForValue(rightVal, false);
    }

    // --- NIVEL 3: 3º Primaria (Tablas de multiplicar) ---
    else if (level === 3) {
        // Izquierda: Multiplicación básica (tablas 2-9)
        const a = randomInt(2, 9);
        const b = randomInt(2, 10);
        const val = a * b;
        left = { text: `${a} x ${b}`, value: val };

        // Derecha: Resultado muy cercano (+/- 1 a 5)
        rightVal = val + randomInt(-5, 5);
        if (rightVal < 0) rightVal = 0;
        
        // En 3º mayormente comparan Resultado vs Operación
        right = { text: rightVal.toString(), value: rightVal };
    }

    // --- NIVEL 4: 4º Primaria (Operaciones combinadas, resultados cercanos) ---
    else if (level === 4) {
        // Generar a x b +/- c
        const op = Math.random() > 0.5 ? '+' : '-';
        const a = randomInt(2, 9);
        const b = randomInt(2, 9); // Multiplicación
        const c = randomInt(1, 20); // Suma/Resta
        
        let val = 0;
        let text = "";
        
        if (op === '+') {
            val = (a * b) + c;
            text = `${a} x ${b} + ${c}`;
        } else {
            val = (a * b) - c; // Puede ser negativo si c es grande, pero aquí controlamos rangos
            if (val < 0) val = 0; // Corrección simple
            text = `${a} x ${b} - ${c}`;
        }
        
        left = { text, value: val };

        // Derecha: Muy cerca
        rightVal = val + randomInt(-3, 3);
        
        // A veces generamos otra operación simple a la derecha
        right = makeExpressionForValue(rightVal, false);
    }

    // --- NIVEL 5: 5º Primaria (Decimales trampa) ---
    else if (level === 5) {
        // Generar casos como 5.12 vs 5.2
        const base = randomInt(1, 20);
        const decimalPart = randomInt(1, 9); // .1 a .9
        
        // Caso A: Mismo entero, decimales confusos (ej: 5.2 vs 5.20 vs 5.02)
        const type = randomInt(1, 3);
        let valL, valR;

        if (type === 1) { 
            // 5.2 vs 5.12
            valL = base + (decimalPart / 10); // 5.2
            valR = base + (decimalPart / 100) + 0.1; // 5.1X aprox
        } else if (type === 2) {
            // Cercanos normales: 7.85 vs 7.90
            valL = base + Math.random();
            valR = valL + (Math.random() * 0.1 - 0.05); // +/- 0.05
        } else {
            // Iguales visualmente distintos? No, iguales numéricos
            valL = base + (decimalPart / 10);
            valR = valL;
        }

        left = { text: formatDec(valL).toString().replace('.', ','), value: formatDec(valL) };
        right = { text: formatDec(valR).toString().replace('.', ','), value: formatDec(valR) };
    }

    // --- NIVEL 6: 6º Primaria (Decimales + Operaciones) ---
    else if (level === 6) {
        // Ej: 2.5 x 4 (10) vs 9.8
        const isMult = Math.random() > 0.5;
        
        if (isMult) {
            // Multiplicación con decimal sencillo (.5)
            const a = randomInt(2, 8); // entero
            const b = randomInt(1, 10) + 0.5; // decimal (e.g. 4.5)
            const val = a * b;
            left = { text: `${a} x ${b.toString().replace('.', ',')}`, value: val };
            
            // Derecha: Valor muy cercano
            rightVal = val + (Math.random() * 2 - 1); // +/- 1.0
        } else {
            // Suma/Resta decimal
            const a = formatDec(randomInt(1, 20) + Math.random());
            const b = formatDec(randomInt(1, 10) + Math.random());
            const val = a + b;
            left = { text: `${a.toString().replace('.', ',')} + ${b.toString().replace('.', ',')}`, value: val };
            
            rightVal = val + (Math.random() * 0.5 - 0.25); // +/- 0.25
        }

        // Decidimos si derecha es número o operación
        right = makeExpressionForValue(formatDec(rightVal), true);
    }

    // Forzar igualdad el 20% de las veces en todos los niveles para practicar '='
    if (Math.random() < 0.2) {
        right.value = left.value;
        // Si no son decimales, podemos mostrar la misma expresión o el resultado
        if (level < 5) {
            right.text = left.value.toString(); 
        } else {
            right.text = left.value.toString().replace('.', ',');
        }
    }

    return { left, right };
};


const MayorMenorGame = ({ level, title }) => {
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', value: 0 });
    const [rightItem, setRightItem] = useState({ text: '', value: 0 });
    const [selectedSign, setSelectedSign] = useState(null); 
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    
    // Estado del Test
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
        const { left, right } = generateProblem();
        setLeftItem(left);
        setRightItem(right);
        setSelectedSign(null);
        setFeedback({ text: '', type: '' });
    }, [generateProblem]);

    // Iniciar Test
    const startTest = useCallback(() => {
        const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => generateProblem());
        setTestStats({
            questions: qs,
            currentIndex: 0,
            score: 0,
            answers: [],
            finished: false
        });
        setIsTestMode(true);
        setLeftItem(qs[0].left);
        setRightItem(qs[0].right);
        setSelectedSign(null);
        setFeedback({ text: '', type: '' });
    }, [generateProblem]);

    useEffect(() => {
        startPractice();
    }, [startPractice]);

    const handleSignSelect = (sign) => {
        setSelectedSign(sign);
        if (!isTestMode) setFeedback({ text: '', type: '' });
    };

    const getCorrectSign = (lVal, rVal) => {
        // Tolerancia pequeña para decimales flotantes
        if (Math.abs(lVal - rVal) < 0.001) return '='; 
        return lVal > rVal ? '>' : '<';
    };

    const checkAnswer = () => {
        if (!selectedSign) return;

        const correct = getCorrectSign(leftItem.value, rightItem.value);
        const isCorrect = selectedSign === correct;

        if (isTestMode) {
            handleTestNext(isCorrect, correct);
        } else {
            // Modo Práctica
            if (isCorrect) {
                setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
                setTimeout(startPractice, 1500);
            } else {
                setFeedback({ 
                    text: `Incorrecto. ${leftItem.value.toString().replace('.',',')} es ${correct === '>' ? 'MAYOR' : correct === '<' ? 'MENOR' : 'IGUAL'} que ${rightItem.value.toString().replace('.',',')}`, 
                    type: 'feedback-incorrect' 
                });
            }
        }
    };

    const handleTestNext = (isCorrect, correctSign) => {
        const nextStats = {
            ...testStats,
            score: isCorrect ? testStats.score + 1 : testStats.score,
            answers: [...testStats.answers, { 
                left: leftItem.text, 
                right: rightItem.text, 
                user: selectedSign, 
                correct: correctSign, 
                isCorrect 
            }]
        };

        if (testStats.currentIndex < TOTAL_TEST_QUESTIONS - 1) {
            nextStats.currentIndex += 1;
            setTestStats(nextStats);
            const nextQ = testStats.questions[nextStats.currentIndex];
            setLeftItem(nextQ.left);
            setRightItem(nextQ.right);
            setSelectedSign(null);
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
                <div className="text-left overflow-y-auto mb-6" style={{maxHeight: '300px'}}>
                    {testStats.answers.map((ans, idx) => (
                        <div key={idx} className={`p-3 mb-2 rounded border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex justify-between items-center text-lg">
                                <span>{ans.left} <strong>{ans.user}</strong> {ans.right}</span>
                                {ans.isCorrect ? <span>✅</span> : <span className="text-red-600 font-bold text-sm">Era {ans.correct}</span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="controles">
                    <button onClick={startTest}>Repetir Test</button>
                    <button onClick={() => { setIsTestMode(false); startPractice(); }} className="btn-saltar">Salir</button>
                </div>
            </div>
        );
    }

    return (
        <div className="mayor-menor-container">
            <h1><span className="gradient-text">{title}</span></h1>
            <p className="instrucciones">Selecciona el signo correcto: Mayor (&gt;), Menor (&lt;) o Igual (=).</p>

            <div className="mode-selection">
                <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => {setIsTestMode(false); startPractice();}}>Práctica</button>
                <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Test</button>
            </div>

            {isTestMode && <div className="text-right text-sm text-gray-500 font-bold">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}

            {/* ZONA DE JUEGO */}
            <div className="comparison-area">
                <div className="number-card">{leftItem.text}</div>
                
                <div className={`sign-drop-zone ${selectedSign ? 'filled' : ''} ${!isTestMode && feedback.type.includes('correct') ? (feedback.type.includes('incorrect') ? 'incorrect' : 'correct') : ''}`}>
                    {selectedSign || '?'}
                </div>

                <div className="number-card">{rightItem.text}</div>
            </div>

            {/* FEEDBACK */}
            {!isTestMode && feedback.text && (
                <div className={`feedback-message ${feedback.type}`}>{feedback.text}</div>
            )}

            {/* BOTONES DE RESPUESTA */}
            <div className="signs-palette">
                <button className="sign-btn" onClick={() => handleSignSelect('<')}>&lt;</button>
                <button className="sign-btn" onClick={() => handleSignSelect('=')}>=</button>
                <button className="sign-btn" onClick={() => handleSignSelect('>')}>&gt;</button>
            </div>

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

// Wrappers para cada nivel (Actualizados nombres para reflejar contenido)
export const MayorMenor1 = () => <MayorMenorGame level={1} title="Mayor, Menor o Igual (1º)" />;
export const MayorMenor2 = () => <MayorMenorGame level={2} title="Comparar hasta 100 (2º)" />;
export const MayorMenor3 = () => <MayorMenorGame level={3} title="Comparar Multiplicaciones (3º)" />;
export const MayorMenor4 = () => <MayorMenorGame level={4} title="Operaciones Combinadas (4º)" />;
export const MayorMenor5 = () => <MayorMenorGame level={5} title="Comparar Decimales (5º)" />;
export const MayorMenor6 = () => <MayorMenorGame level={6} title="Reto Matemático (6º)" />;

export default MayorMenorGame;