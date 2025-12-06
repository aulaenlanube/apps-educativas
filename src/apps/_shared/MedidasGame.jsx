import React, { useState, useEffect, useCallback } from 'react';
import './Medidas.css';

const TOTAL_TEST_QUESTIONS = 10;

// Factores de conversión a mm
const UNITS = {
    mm: 1,
    cm: 10,
    dm: 100,
    m: 1000,
    dam: 10000,
    hm: 100000,
    km: 1000000
};

// Orden para la escalera visual
const UNIT_ORDER = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickUnit = (list) => list[randomInt(0, list.length - 1)];

/**
 * Genera una cantidad válida que sea ENTERA en la unidad elegida.
 */
const generateMeasurement = (allowedUnits, maxValBase) => {
    const unitStr = pickUnit(allowedUnits);
    const factor = UNITS[unitStr];
    // Evitar 0, mínimo 1
    const val = randomInt(1, Math.floor(maxValBase / factor) || 1);

    return {
        text: `${val} ${unitStr}`,
        valueBase: val * factor,
        unit: unitStr,
        num: val
    };
};

/**
 * Genera el problema asegurando que si son iguales, la representación sea distinta.
 */
const generateProblemData = (level) => {
    let allowedUnits = [];
    let maxBase = 1000;

    switch (level) {
        case 1: allowedUnits = ['cm', 'm']; maxBase = 20000; break;
        case 2: allowedUnits = ['cm', 'm']; maxBase = 5000; break;
        case 3: allowedUnits = ['mm', 'cm', 'm', 'km']; maxBase = 5000000; break;
        case 4: allowedUnits = ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km']; maxBase = 10000000; break;
        case 5: allowedUnits = ['m', 'km', 'cm']; maxBase = 10000000; break;
        case 6: allowedUnits = ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km']; maxBase = 100000000; break;
        default: allowedUnits = ['m'];
    }

    // --- GENERAR LADO IZQUIERDO ---
    let left;
    // Expresiones compuestas (ej: 1 m 50 cm) para niveles altos
    if (level >= 5 && Math.random() > 0.6) {
        const uBig = level === 5 ? 'km' : pickUnit(['km', 'm', 'dm']);
        const uSmall = level === 5 ? 'm' : (uBig === 'km' ? 'm' : (uBig === 'm' ? 'cm' : 'mm'));
        const valBig = randomInt(1, 10);
        const valSmall = randomInt(10, 900);
        const totalBase = (valBig * UNITS[uBig]) + (valSmall * UNITS[uSmall]);
        left = {
            text: `${valBig} ${uBig} ${valSmall} ${uSmall}`,
            valueBase: totalBase,
            isComplex: true
        };
    } else {
        left = generateMeasurement(allowedUnits, maxBase);
    }

    // --- GENERAR LADO DERECHO ---
    let right;
    let targetBase = left.valueBase;
    const relation = Math.random();
    
    if (relation < 0.3) {
        // --- CASO IGUALES (=) ---
        // Estrategia: Buscar una unidad diferente para representar el mismo valor.
        // Si left es "3000 m", buscamos si es divisible por km, hm, etc.
        
        // Unidades que pueden representar este valor sin decimales
        const validEquivalents = allowedUnits.filter(u => targetBase % UNITS[u] === 0);
        
        // Filtramos para que NO sea la misma unidad que la izquierda (si es simple)
        let candidates = validEquivalents;
        if (left.unit && !left.isComplex) {
            candidates = validEquivalents.filter(u => u !== left.unit);
        }

        if (candidates.length > 0) {
            // Conversión de unidad (Ej: 3000 m -> 3 km)
            const unitR = pickUnit(candidates);
            const valR = targetBase / UNITS[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: targetBase };
        } else {
            // Si no hay conversión limpia posible (o misma unidad obligatoria), usamos Suma
            // Ej: "15 m" -> "10 m + 5 m"
            // Usamos la unidad base del target o la de left
            const uRef = left.unit || allowedUnits[0]; 
            const valRef = targetBase / UNITS[uRef]; // valor numérico en esa unidad
            
            // Partición simple
            const part1 = Math.floor(valRef / 2);
            const part2 = valRef - part1;
            right = { 
                text: `${part1} + ${part2} ${uRef}`, 
                valueBase: targetBase 
            };
        }

    } else {
        // --- CASO DIFERENTES (> o <) ---
        const variation = (Math.random() > 0.5 ? 1 : -1) * randomInt(1, Math.max(1, Math.floor(left.valueBase * 0.2)));
        let newBase = targetBase + variation;
        if (newBase <= 0) newBase = targetBase + Math.abs(variation);

        // Intentar buscar unidad limpia
        const validUnits = allowedUnits.filter(u => newBase % UNITS[u] === 0);
        if (validUnits.length > 0) {
            const unitR = pickUnit(validUnits);
            const valR = newBase / UNITS[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: newBase };
        } else {
            // Fallback a unidad pequeña
            const smallestU = allowedUnits.includes('mm') ? 'mm' : allowedUnits[0];
            const safeBase = Math.round(newBase / UNITS[smallestU]) * UNITS[smallestU];
            right = { text: `${safeBase / UNITS[smallestU]} ${smallestU}`, valueBase: safeBase };
        }
    }

    return { left, right };
};

const MedidasGame = ({ level, title }) => {
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', valueBase: 0 });
    const [rightItem, setRightItem] = useState({ text: '', valueBase: 0 });
    const [selectedSign, setSelectedSign] = useState(null); 
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    
    // Estado para la Ayuda Visual (Escalera)
    const [showHelper, setShowHelper] = useState(false);

    const [testStats, setTestStats] = useState({
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        finished: false
    });

    const generateProblem = useCallback(() => {
        return generateProblemData(level);
    }, [level]);

    const startPractice = useCallback(() => {
        const { left, right } = generateProblem();
        setLeftItem(left);
        setRightItem(right);
        setSelectedSign(null);
        setFeedback({ text: '', type: '' });
    }, [generateProblem]);

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
        setShowHelper(false); // Ocultar ayuda en test por defecto
        setFeedback({ text: '', type: '' });
    }, [generateProblem]);

    useEffect(() => {
        startPractice();
    }, [startPractice]);

    const handleSignSelect = (sign) => {
        setSelectedSign(sign);
        if (!isTestMode) setFeedback({ text: '', type: '' });
    };

    const checkAnswer = () => {
        if (!selectedSign) return;

        const diff = leftItem.valueBase - rightItem.valueBase;
        // Pequeña tolerancia por seguridad, aunque usamos enteros base
        let correct = '=';
        if (diff > 0) correct = '>';
        if (diff < 0) correct = '<';

        const isCorrect = selectedSign === correct;

        if (isTestMode) {
            handleTestNext(isCorrect, correct);
        } else {
            if (isCorrect) {
                setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
                setTimeout(startPractice, 1500);
            } else {
                setFeedback({ 
                    text: `Incorrecto. ${leftItem.text} es ${correct === '>' ? 'MAYOR' : correct === '<' ? 'MENOR' : 'IGUAL'} que ${rightItem.text}`, 
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

    if (isTestMode && testStats.finished) {
        return (
            <div className="medidas-container">
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
        <div className="medidas-container">
            <h1><span className="gradient-text">{title}</span></h1>
            
            {/* Controles Superiores: Modo y Ayuda */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="mode-selection mb-0">
                    <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => {setIsTestMode(false); startPractice();}}>Práctica</button>
                    <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Test</button>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <span className="text-sm font-bold text-gray-600">Ver Escala</span>
                    <label className="switch">
                        <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* --- VISUALIZADOR DE ESCALA (AYUDA) --- */}
            {showHelper && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-100 fade-in">
                    <p className="text-sm text-indigo-600 mb-2 font-semibold">Escalera de Unidades: ¡Multiplica o divide por 10!</p>
                    <div className="flex justify-center items-center gap-1 md:gap-3 overflow-x-auto py-2">
                        {UNIT_ORDER.map((u, index) => (
                            <React.Fragment key={u}>
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-indigo-400 flex items-center justify-center font-bold text-indigo-700 shadow-sm text-sm md:text-base">
                                        {u}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">{UNITS[u] === 1000 ? 'BASE' : ''}</span>
                                </div>
                                {index < UNIT_ORDER.length - 1 && (
                                    <div className="text-gray-300 font-bold text-xl">→</div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {isTestMode && <div className="text-right text-sm text-gray-500 font-bold mb-2">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}

            <div className="comparison-area">
                <div className="measure-card">{leftItem.text}</div>
                
                <div className={`sign-drop-zone ${selectedSign ? 'filled' : ''} ${!isTestMode && feedback.type.includes('correct') ? (feedback.type.includes('incorrect') ? 'incorrect' : 'correct') : ''}`}>
                    {selectedSign || '?'}
                </div>

                <div className="measure-card">{rightItem.text}</div>
            </div>

            {!isTestMode && feedback.text && (
                <div className={`feedback-message ${feedback.type}`}>{feedback.text}</div>
            )}

            <div className="signs-palette">
                <button className="sign-btn" onClick={() => handleSignSelect('<')}>&lt;</button>
                <button className="sign-btn" onClick={() => handleSignSelect('=')}>=</button>
                <button className="sign-btn" onClick={() => handleSignSelect('>')}>&gt;</button>
            </div>

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

export const Medidas1 = () => <MedidasGame level={1} title="Comparar Longitudes (1º)" />;
export const Medidas2 = () => <MedidasGame level={2} title="Metros y Centímetros (2º)" />;
export const Medidas3 = () => <MedidasGame level={3} title="Km, m, cm y mm (3º)" />;
export const Medidas4 = () => <MedidasGame level={4} title="Conversión de Unidades (4º)" />;
export const Medidas5 = () => <MedidasGame level={5} title="Medidas Complejas (5º)" />;
export const Medidas6 = () => <MedidasGame level={6} title="Experto en Medidas (6º)" />;

export default MedidasGame;