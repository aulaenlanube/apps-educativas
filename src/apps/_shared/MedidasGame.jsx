import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Medidas.css';

const TOTAL_TEST_QUESTIONS = 10;

// --- CONFIGURACIÓN DE SISTEMAS DE UNIDADES ---
// Base: 1 = unidad más pequeña del sistema (mm, mg, ml)
const MEASURE_TYPES = {
    longitud: {
        id: 'longitud',
        label: 'Longitud',
        icon: '📏',
        baseUnit: 'mm',
        units: { mm: 1, cm: 10, dm: 100, m: 1000, dam: 10000, hm: 100000, km: 1000000 },
        order: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']
    },
    masa: {
        id: 'masa',
        label: 'Masa',
        icon: '⚖️',
        baseUnit: 'mg',
        units: { mg: 1, cg: 10, dg: 100, g: 1000, dag: 10000, hg: 100000, kg: 1000000 },
        order: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']
    },
    capacidad: {
        id: 'capacidad',
        label: 'Capacidad',
        icon: '💧',
        baseUnit: 'ml',
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
    const val = randomInt(1, Math.floor(maxValBase / factor) || 1);

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
    
    // Mapeo genérico de niveles a unidades permitidas según el sistema
    let allowedUnits = [];
    let maxBase = 1000;

    // Definimos las unidades "clave" por nivel para cada sistema
    // Nivel 1: Unidades muy básicas
    const uSmall = typeId === 'longitud' ? 'cm' : (typeId === 'masa' ? 'g' : 'cl');
    const uMed = typeId === 'longitud' ? 'm' : (typeId === 'masa' ? 'kg' : 'l');
    const uTiny = typeId === 'longitud' ? 'mm' : (typeId === 'masa' ? 'mg' : 'ml');
    const uLarge = typeId === 'longitud' ? 'km' : (typeId === 'masa' ? 'kg' : 'kl'); // kg suele ser tope en primaria vs ton

    switch (level) {
        case 1: 
            allowedUnits = [uSmall, uMed]; 
            maxBase = 20 * units[uMed]; // Ej: 20m, 20kg
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
            // Todas
            allowedUnits = config.order; 
            maxBase = 10 * units[uLarge]; 
            break;
        case 5: 
            // Enfocado en las comunes
            allowedUnits = [uMed, uLarge, uSmall]; 
            maxBase = 100 * units[uLarge]; 
            break;
        case 6: 
            // Todas y grandes
            allowedUnits = config.order; 
            maxBase = 1000 * units[uLarge]; 
            break;
        default: 
            allowedUnits = [uMed];
    }

    // Filtramos para asegurar que solo usamos unidades que existen en la config (por seguridad)
    allowedUnits = allowedUnits.filter(u => units[u]);

    // --- Generar Izquierda ---
    let left;
    // Expresiones compuestas en niveles altos (5 y 6)
    if (level >= 5 && Math.random() > 0.6) {
        // Ej: 2 kg 500 g
        const possibleBigs = allowedUnits.filter(u => units[u] >= units[uMed]);
        const uBig = possibleBigs.length > 0 ? pickUnit(possibleBigs) : uMed;
        
        // Buscar una unidad más pequeña que uBig
        const possibleSmalls = allowedUnits.filter(u => units[u] < units[uBig]);
        const uSmallChoice = possibleSmalls.length > 0 ? pickUnit(possibleSmalls) : uTiny;

        const valBig = randomInt(1, 10);
        const valSmall = randomInt(10, 900); // Ej: 500 g
        
        const totalBase = (valBig * units[uBig]) + (valSmall * units[uSmallChoice]);
        left = {
            text: `${valBig} ${uBig} ${valSmall} ${uSmallChoice}`,
            valueBase: totalBase,
            isComplex: true,
            unit: null // No tiene unidad única
        };
    } else {
        left = generateMeasurement(config, allowedUnits, maxBase);
    }

    // --- Generar Derecha ---
    let right;
    let targetBase = left.valueBase;
    const relation = Math.random();

    if (relation < 0.3) {
        // IGUALES (=)
        // Buscar unidad equivalente distinta
        const validEquivalents = allowedUnits.filter(u => targetBase % units[u] === 0);
        let candidates = validEquivalents;
        
        // Si izquierda es simple, evitar repetir la misma unidad
        if (left.unit && !left.isComplex) {
            candidates = validEquivalents.filter(u => u !== left.unit);
        }

        if (candidates.length > 0) {
            const unitR = pickUnit(candidates);
            const valR = targetBase / units[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: targetBase };
        } else {
            // Si no hay conversión limpia, usar Suma
            // Ej: 500g + 500g
            const uRef = left.unit || uMed;
            const valRef = Math.floor(targetBase / units[uRef]) || targetBase;
            const finalUnit = (targetBase % units[uRef] === 0) ? uRef : config.baseUnit;
            const finalVal = (targetBase % units[uRef] === 0) ? valRef : targetBase;

            const part1 = Math.floor(finalVal / 2);
            const part2 = finalVal - part1;
            right = { 
                text: `${part1} + ${part2} ${finalUnit}`, 
                valueBase: targetBase 
            };
        }
    } else {
        // DIFERENTES
        const variation = (Math.random() > 0.5 ? 1 : -1) * randomInt(1, Math.max(1, Math.floor(left.valueBase * 0.2)));
        let newBase = targetBase + variation;
        if (newBase <= 0) newBase = targetBase + Math.abs(variation);

        // Intentar representar en una unidad limpia
        const validUnits = allowedUnits.filter(u => newBase % units[u] === 0);
        if (validUnits.length > 0) {
            const unitR = pickUnit(validUnits);
            const valR = newBase / units[unitR];
            right = { text: `${valR} ${unitR}`, valueBase: newBase };
        } else {
            // Fallback a unidad pequeña disponible
            const smallestAvailable = allowedUnits.reduce((prev, curr) => units[curr] < units[prev] ? curr : prev, allowedUnits[0]);
            const safeBase = Math.round(newBase / units[smallestAvailable]) * units[smallestAvailable];
            right = { text: `${safeBase / units[smallestAvailable]} ${smallestAvailable}`, valueBase: safeBase };
        }
    }

    return { left, right };
};

const MedidasGame = ({ level, title }) => {
    const [measureType, setMeasureType] = useState('longitud'); // 'longitud', 'masa', 'capacidad'
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', valueBase: 0 });
    const [rightItem, setRightItem] = useState({ text: '', valueBase: 0 });
    const [selectedSign, setSelectedSign] = useState(null); 
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [showHelper, setShowHelper] = useState(false);

    const [testStats, setTestStats] = useState({
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        finished: false
    });

    const generateProblem = useCallback(() => {
        return generateProblemData(level, measureType);
    }, [level, measureType]);

    const startPractice = useCallback(() => {
        const { left, right } = generateProblem();
        setLeftItem(left);
        setRightItem(right);
        setSelectedSign(null);
        setFeedback({ text: '', type: '' });
    }, [generateProblem]);

    // Reiniciar práctica si cambiamos de tipo
    useEffect(() => {
        if (!isTestMode) startPractice();
    }, [measureType]); // Dependencia clave

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
        setShowHelper(false);
        setFeedback({ text: '', type: '' });
    }, [generateProblem]);

    useEffect(() => {
        // Carga inicial
        startPractice();
    }, []);

    const handleSignSelect = (sign) => {
        setSelectedSign(sign);
        if (!isTestMode) setFeedback({ text: '', type: '' });
    };

    const checkAnswer = () => {
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

    const currentConfig = MEASURE_TYPES[measureType];

    if (isTestMode && testStats.finished) {
        return (
            <div className={`medidas-container theme-${measureType}`}>
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
        <div className={`medidas-container theme-${measureType}`}>
            <h1><span className="gradient-text">{title}</span></h1>
            
            <div className="flex justify-center">
                <div className="type-selector-container">
                    {Object.values(MEASURE_TYPES).map(type => (
                        <button
                            key={type.id}
                            className={`type-btn t-${type.id} ${measureType === type.id ? 'active' : ''}`}
                            onClick={() => { setMeasureType(type.id); setIsTestMode(false); }}
                        >
                            <span>{type.icon}</span> {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-4">
                <div className="mode-selection mb-0">
                    <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => {setIsTestMode(false); startPractice();}}>Práctica</button>
                    <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Test</button>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <span className="text-sm font-bold text-gray-600">Escala</span>
                    <label className="switch">
                        <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* --- VISUALIZADOR DE ESCALA (AYUDA) --- */}
            {showHelper && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-100 fade-in">
                    <div className="flex justify-center items-center gap-1 md:gap-3 overflow-x-auto py-2">
                        {currentConfig.order.map((u, index) => (
                            <React.Fragment key={u}>
                                <div className="scale-step">
                                    <div className="scale-circle shadow-sm text-sm md:text-base">
                                        {u}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 text-center font-bold">
                                        {currentConfig.units[u] === 1000 ? 'BASE' : (index === 0 ? 'x10' : '')}
                                    </span>
                                </div>
                                {index < currentConfig.order.length - 1 && (
                                    <div className="text-gray-300 font-bold text-lg">→</div>
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

export const Medidas1 = () => <MedidasGame level={1} title="Medidas: Iniciación (1º)" />;
export const Medidas2 = () => <MedidasGame level={2} title="Medidas: Unidades Básicas (2º)" />;
export const Medidas3 = () => <MedidasGame level={3} title="Medidas: Conversión Simple (3º)" />;
export const Medidas4 = () => <MedidasGame level={4} title="Medidas: Sistema Completo (4º)" />;
export const Medidas5 = () => <MedidasGame level={5} title="Medidas: Expresiones Complejas (5º)" />;
export const Medidas6 = () => <MedidasGame level={6} title="Medidas: Reto Experto (6º)" />;

export default MedidasGame;