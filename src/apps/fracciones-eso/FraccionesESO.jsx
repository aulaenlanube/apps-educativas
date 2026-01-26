import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X, Check, HelpCircle, ArrowLeft, RefreshCw, Award, Calculator, BookOpen, Layers, ClipboardCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import './FraccionesESO.css';

const SECTIONS = [
    { id: 'sumas', name: 'Sumas', icon: <Plus size={48} />, color: 'var(--accent-blue)', description: 'Suma fracciones con distinto denominador usando el m.c.m.', helpTitle: '¿Cómo sumar fracciones?' },
    { id: 'restas', name: 'Restas', icon: <Minus size={48} />, color: 'var(--accent-red)', description: 'Resta fracciones paso a paso igualando sus denominadores.', helpTitle: '¿Cómo restar fracciones?' },
    { id: 'multiplicaciones', name: 'Multiplicaciones', icon: <X size={48} />, color: 'var(--accent-purple)', description: 'Multiplica numeradores y denominadores en línea recta.', helpTitle: '¿Cómo multiplicar fracciones?' },
    { id: 'simplificar', name: 'Simplificar', icon: <Calculator size={48} />, color: 'var(--accent-green)', description: 'Reduce fracciones dividiendo numerador y denominador.', helpTitle: '¿Cómo simplificar fracciones?' },
    { id: 'mcm', name: 'Mínimo Común Múltiplo', icon: <Layers size={48} />, color: 'var(--accent-orange)', description: 'Halla el múltiplo común más pequeño de dos números.', helpTitle: '¿Cómo calcular el M.C.M.?' },
    { id: 'mcd', name: 'Máximo Común Divisor', icon: <Award size={48} />, color: 'var(--accent-pink)', description: 'Encuentra el divisor más grande común a ambos números.', helpTitle: '¿Cómo calcular el M.C.D.?' }
];

// Helper functions
const gcd = (a, b) => (!b ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

const FraccionesESO = () => {
    const [section, setSection] = useState(null);
    const [exercise, setExercise] = useState(null);
    const [userAnswer, setUserAnswer] = useState({ num: '', den: '', single: '' });
    const [intermediate, setIntermediate] = useState({ n1: '', n2: '', den: '' });
    const [feedback, setFeedback] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isExamMode, setIsExamMode] = useState(false);
    const [examStep, setExamStep] = useState(0);
    const [examQuestions, setExamQuestions] = useState([]);
    const [examAnswers, setExamAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const renderMultiples = (num1, num2) => {
        const common = lcm(num1, num2);
        const multiples1 = [];
        const multiples2 = [];
        for (let i = 1; num1 * i <= common; i++) multiples1.push(num1 * i);
        for (let i = 1; num2 * i <= common; i++) multiples2.push(num2 * i);

        return (
            <div className="hint-scroll">
                <div className="hint-row">
                    <span className="hint-num">{num1}:</span>
                    {multiples1.map(m => <span key={m} className={`hint-ball ${m === common ? 'divisor' : ''}`}>{m}</span>)}
                    <span className="hint-dots">...</span>
                </div>
                <div className="hint-row">
                    <span className="hint-num">{num2}:</span>
                    {multiples2.map(m => <span key={m} className={`hint-ball ${m === common ? 'divisor' : ''}`}>{m}</span>)}
                    <span className="hint-dots">...</span>
                </div>
            </div>
        );
    };

    const createExerciseData = (type) => {
        let newExercise = { type };
        switch (type) {
            case 'sumas':
            case 'restas': {
                const d1 = Math.floor(Math.random() * 8) + 2;
                const d2 = Math.floor(Math.random() * 8) + 2;
                const n1 = Math.floor(Math.random() * 10) + 1;
                const n2 = Math.floor(Math.random() * 10) + 1;
                return { ...newExercise, n1, d1, n2, d2 };
            }
            case 'multiplicaciones': {
                const d1 = Math.floor(Math.random() * 8) + 2;
                const d2 = Math.floor(Math.random() * 8) + 2;
                const n1 = Math.floor(Math.random() * 8) + 1;
                const n2 = Math.floor(Math.random() * 8) + 1;
                return { ...newExercise, n1, d1, n2, d2 };
            }
            case 'simplificar': {
                const common = Math.floor(Math.random() * 5) + 2;
                const nBase = Math.floor(Math.random() * 8) + 1;
                const dBase = Math.floor(Math.random() * 8) + 2;
                return { ...newExercise, n: nBase * common, d: dBase * common };
            }
            case 'mcm':
            case 'mcd': {
                const a = (Math.floor(Math.random() * 15) + 2) * 2;
                const b = (Math.floor(Math.random() * 15) + 2) * 2;
                return { ...newExercise, a, b };
            }
            default: return newExercise;
        }
    };

    const generateExercise = useCallback((type) => {
        setFeedback(null);
        setUserAnswer({ num: '', den: '', single: '' });
        setIntermediate({ n1: '', n2: '', den: '' });
        setShowHint(false);
        setExercise(createExerciseData(type));
    }, []);

    const startExam = () => {
        const questions = [];
        SECTIONS.forEach(s => {
            questions.push(createExerciseData(s.id));
            questions.push(createExerciseData(s.id));
        });
        // Shuffle questions
        const shuffled = questions.sort(() => Math.random() - 0.5);
        setExamQuestions(shuffled);
        setExamAnswers([]);
        setExamStep(0);
        setIsExamMode(true);
        setShowResults(false);
        setSection({ id: 'examen', name: 'Examen de Fracciones', color: 'var(--text-main)' });
        setExercise(shuffled[0]);
        setUserAnswer({ num: '', den: '', single: '' });
        setIntermediate({ n1: '', n2: '', den: '' });
    };

    const checkAnswer = () => {
        if (!exercise) return;

        let isCorrect = false;
        let correctAnswer = '';

        // Check intermediate step first for sum/rest
        if (exercise.type === 'sumas' || exercise.type === 'restas') {
            const targetDen = lcm(exercise.d1, exercise.d2);
            const targetN1 = exercise.n1 * (targetDen / exercise.d1);
            const targetN2 = exercise.n2 * (targetDen / exercise.d2);

            const userDen = parseInt(intermediate.den);
            const userN1 = parseInt(intermediate.n1);
            const userN2 = parseInt(intermediate.n2);

            if (userDen !== targetDen || userN1 !== targetN1 || userN2 !== targetN2) {
                if (!isExamMode) {
                    setFeedback({
                        type: 'error',
                        text: `El paso intermedio es incorrecto. Los denominadores deben ser ${targetDen} y los numeradores ${targetN1} y ${targetN2}.`
                    });
                    return;
                }
                // In exam mode, we don't show the error, but it will naturally result in isCorrect=false later
            }
        }

        switch (exercise.type) {
            case 'sumas': {
                const targetDen = lcm(exercise.d1, exercise.d2);
                const targetNum = (exercise.n1 * (targetDen / exercise.d1)) + (exercise.n2 * (targetDen / exercise.d2));
                const common = gcd(targetNum, targetDen);
                const finalNum = targetNum / common;
                const finalDen = targetDen / common;

                const userNum = parseInt(userAnswer.num);
                const userDen = parseInt(userAnswer.den);

                const uGcd = gcd(userNum, userDen);
                isCorrect = (userNum / uGcd === finalNum) && (userDen / uGcd === finalDen);
                correctAnswer = `${finalNum}/${finalDen}`;
                break;
            }
            case 'restas': {
                const targetDen = lcm(exercise.d1, exercise.d2);
                const targetNum = (exercise.n1 * (targetDen / exercise.d1)) - (exercise.n2 * (targetDen / exercise.d2));
                const common = Math.abs(gcd(targetNum, targetDen));
                const finalNum = targetNum / common;
                const finalDen = targetDen / common;

                const userNum = parseInt(userAnswer.num);
                const userDen = parseInt(userAnswer.den);

                const uGcd = Math.abs(gcd(userNum, userDen));
                isCorrect = (userNum / uGcd === finalNum) && (userDen / uGcd === finalDen);
                correctAnswer = `${finalNum}/${finalDen}`;
                break;
            }
            case 'multiplicaciones': {
                const targetNum = exercise.n1 * exercise.n2;
                const targetDen = exercise.d1 * exercise.d2;
                const common = gcd(targetNum, targetDen);
                const finalNum = targetNum / common;
                const finalDen = targetDen / common;

                const userNum = parseInt(userAnswer.num);
                const userDen = parseInt(userAnswer.den);

                const uGcd = gcd(userNum, userDen);
                isCorrect = (userNum / uGcd === finalNum) && (userDen / uGcd === finalDen);
                correctAnswer = `${finalNum}/${finalDen}`;
                break;
            }
            case 'simplificar': {
                const common = gcd(exercise.n, exercise.d);
                const finalNum = exercise.n / common;
                const finalDen = exercise.d / common;

                const userNum = parseInt(userAnswer.num);
                const userDen = parseInt(userAnswer.den);

                isCorrect = (userNum === finalNum) && (userDen === finalDen);
                correctAnswer = `${finalNum}/${finalDen}`;
                break;
            }
            case 'mcm': {
                const result = lcm(exercise.a, exercise.b);
                isCorrect = parseInt(userAnswer.single) === result;
                correctAnswer = result.toString();
                break;
            }
            case 'mcd': {
                const result = gcd(exercise.a, exercise.b);
                isCorrect = parseInt(userAnswer.single) === result;
                correctAnswer = result.toString();
                break;
            }
            default: break;
        }

        if (isCorrect) {
            if (isExamMode) {
                const newAnswers = [...examAnswers, {
                    question: { ...exercise },
                    userAnswer: exercise.type === 'mcm' || exercise.type === 'mcd' ? userAnswer.single : `${userAnswer.num}/${userAnswer.den}`,
                    isCorrect: true,
                    correctAnswer: correctAnswer
                }];
                setExamAnswers(newAnswers);
                if (examStep < 11) {
                    const nextStep = examStep + 1;
                    setExamStep(nextStep);
                    setExercise(examQuestions[nextStep]);
                    setUserAnswer({ num: '', den: '', single: '' });
                    setIntermediate({ n1: '', n2: '', den: '' });
                } else {
                    finishExam(newAnswers);
                }
            } else {
                setFeedback({ type: 'success', text: '¡Excelente! Respuesta correcta.' });
                setScore(s => s + 10);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                setTimeout(() => generateExercise(exercise.type), 2000);
            }
        } else {
            if (isExamMode) {
                const newAnswers = [...examAnswers, {
                    question: { ...exercise },
                    userAnswer: exercise.type === 'mcm' || exercise.type === 'mcd' ? (userAnswer.single || 'Vacio') : (userAnswer.num || userAnswer.den ? `${userAnswer.num}/${userAnswer.den}` : 'Vacio'),
                    isCorrect: false,
                    correctAnswer: correctAnswer
                }];
                setExamAnswers(newAnswers);
                if (examStep < 11) {
                    const nextStep = examStep + 1;
                    setExamStep(nextStep);
                    setExercise(examQuestions[nextStep]);
                    setUserAnswer({ num: '', den: '', single: '' });
                    setIntermediate({ n1: '', n2: '', den: '' });
                } else {
                    finishExam(newAnswers);
                }
            } else {
                setFeedback({ type: 'error', text: `Vaya, intenta de nuevo. La respuesta era ${correctAnswer}` });
                setScore(s => Math.max(0, s - 5));
            }
        }
    };

    const finishExam = (finalAnswers) => {
        setIsExamMode(false);
        setShowResults(true);
        const correctCount = finalAnswers.filter(a => a.isCorrect).length;
        const finalGrade = (correctCount / 12) * 10;
        if (finalGrade >= 5) {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        }
    };

    const renderHelpContent = () => {
        if (!section) return null;
        switch (section.id) {
            case 'sumas':
            case 'restas':
                return (
                    <div className="help-visual-content">
                        <div className="help-steps-grid">
                            <section className="help-step">
                                <div className="step-number">1</div>
                                <div className="step-desc">
                                    <strong>Igualar denominadores</strong> Calcula el <strong>m.c.m.</strong> de los denominadores.
                                    <em className="db-text">Ej: Para 4 y 6, el m.c.m. es 12.</em>
                                </div>
                            </section>
                            <section className="help-step">
                                <div className="step-number">2</div>
                                <div className="step-desc">
                                    <strong>Ajustar numeradores</strong> Divide el m.c.m. entre el antiguo y multiplica por el numerador.
                                    <div className="visual-formula">
                                        (m.c.m. ÷ Denom) × Num
                                    </div>
                                </div>
                            </section>
                            <section className="help-step">
                                <div className="step-number">3</div>
                                <div className="step-desc">
                                    <strong>Operar</strong> Suma o resta los numeradores. El denominador <strong>NO cambia</strong>.
                                </div>
                            </section>
                        </div>
                        <div className="visual-example">
                            <div className="frac-row">
                                <Fraction n="1" d="4" /> <span className="op">{section.id === 'sumas' ? '+' : '-'}</span> <Fraction n="1" d="6" />
                                <span className="arrow">➡️</span>
                                <Fraction n="3" d="12" /> <span className="op">{section.id === 'sumas' ? '+' : '-'}</span> <Fraction n="2" d="12" />
                                <span className="arrow">➡️</span>
                                <Fraction n={section.id === 'sumas' ? '5' : '1'} d="12" />
                            </div>
                        </div>
                    </div>
                );
            case 'multiplicaciones':
                return (
                    <div className="help-visual-content">
                        <p className="intro-text">¡Es la operación más sencilla! Se hace en <strong>línea recta</strong>:</p>
                        <div className="visual-diagram horizontal">
                            <div className="diagram-box">
                                <span className="label">Numeradores</span>
                                <div className="flow-line">A × C</div>
                            </div>
                            <div className="diagram-separator">────────</div>
                            <div className="diagram-box">
                                <span className="label">Denominadores</span>
                                <div className="flow-line">B × D</div>
                            </div>
                        </div>
                        <div className="tip-box">
                            💡 <strong>REGLA DE ORO:</strong> Numerador por Numerador y Denominador por Denominador.
                        </div>
                    </div>
                );
            case 'simplificar':
                return (
                    <div className="help-visual-content">
                        <p>Simplificar es "hacer la fracción más pequeña" sin que cambie su valor.</p>
                        <div className="simplification-visual">
                            <div className="node"><Fraction n="10" d="20" /></div>
                            <div className="divide-arrow"><span>÷ 2</span></div>
                            <div className="node"><Fraction n="5" d="10" /></div>
                            <div className="divide-arrow"><span>÷ 5</span></div>
                            <div className="node highlight"><Fraction n="1" d="2" /></div>
                        </div>
                        <p className="note">Divide arriba y abajo siempre por el <strong>mismo número</strong>.</p>
                    </div>
                );
            case 'mcm':
                return (
                    <div className="help-visual-content">
                        <div className="theory-card">
                            <h3>Mínimo Común Múltiplo</h3>
                            <p>Es el número más pequeño que es múltiplo de ambos.</p>
                            <div className="rule-box">
                                <strong>Factores:</strong> Comunes y no comunes al <strong>mayor exponente</strong>.
                            </div>
                            <div className="help-example">
                                mcm(4, 6):<br />
                                4 = 2²<br />
                                6 = 2 × 3<br />
                                <strong>mcm = 2² × 3 = 12</strong>
                            </div>
                        </div>
                    </div>
                );
            case 'mcd':
                return (
                    <div className="help-visual-content">
                        <div className="theory-card">
                            <h3>Máximo Común Divisor</h3>
                            <p>Es el número más grande que divide a ambos a la vez.</p>
                            <div className="rule-box">
                                <strong>Factores:</strong> Solo comunes al <strong>menor exponente</strong>.
                            </div>
                            <div className="help-example">
                                MCD(12, 18):<br />
                                12 = 2² × 3<br />
                                18 = 2 × 3²<br />
                                <strong>MCD = 2 × 3 = 6</strong>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fracciones-eso-container">
            <header className={`app-header ${!section ? 'main-view' : ''} ${showResults ? 'results-view' : ''}`}>
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="gradient-text centered"
                >
                    Fracciones PRO
                </motion.h1>
            </header>

            {!section ? (
                <>
                    <motion.div
                        className="exam-promo-banner"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="exam-promo-header">
                            <ClipboardCheck size={32} className="text-purple-600" />
                            <h2>¿Estás listo para el reto final?</h2>
                        </div>
                        <p>Realiza un examen aleatorio de 12 preguntas para evaluar tus conocimientos.</p>
                        <button className="btn-exam-start" onClick={startExam}>
                            <ClipboardCheck size={20} /> Iniciar Modo EXAMEN
                        </button>
                    </motion.div>

                    <div className="menu-grid">
                        {SECTIONS.map((s) => (
                            <motion.div
                                key={s.id}
                                className="menu-card"
                                whileHover={{ y: -10, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSection(s);
                                    generateExercise(s.id);
                                }}
                                style={{ '--card-color': s.color }}
                            >
                                <div className="card-icon">{s.icon}</div>
                                <h3>{s.name}</h3>
                                <p>{s.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </>
            ) : showResults ? (
                <motion.div
                    className="examen-dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="dashboard-header">
                        <div className="stat-card note">
                            <Award size={48} />
                            <div className="stat-content">
                                <span className="stat-label">Nota Final</span>
                                <span className={`stat-value ${((examAnswers.filter(a => a.isCorrect).length / 12) * 10) >= 5 ? 'pass' : 'fail'}`}>
                                    {((examAnswers.filter(a => a.isCorrect).length / 12) * 10).toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <div className="stat-card score">
                            <ClipboardCheck size={48} />
                            <div className="stat-content">
                                <span className="stat-label">Aciertos</span>
                                <span className="stat-value">
                                    {examAnswers.filter(a => a.isCorrect).length} de 12
                                </span>
                            </div>
                        </div>
                        <div className="dashboard-actions">
                            <button className="btn-finish-exam" onClick={() => {
                                setIsExamMode(false);
                                setShowResults(false);
                                setSection(null);
                            }}>
                                <ArrowLeft size={20} /> Volver al Inicio
                            </button>
                        </div>
                    </div>

                    <div className="review-grid">
                        {examAnswers.map((ans, idx) => (
                            <motion.div
                                key={idx}
                                className={`review-box ${ans.isCorrect ? 'correct' : 'incorrect'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="box-header">
                                    <span className="q-idx">#{idx + 1}</span>
                                    <span className="q-cat">{SECTIONS.find(s => s.id === ans.question.type)?.name}</span>
                                    {ans.isCorrect ? <Check className="icon-c" /> : <X className="icon-i" />}
                                </div>
                                <div className="box-body">
                                    <div className="op-side">
                                        <span className="l">OPERACIÓN:</span>
                                        <div className="o-disp">
                                            {ans.question.type === 'mcm' || ans.question.type === 'mcd' ? (
                                                <span className="t">{ans.question.type.toUpperCase()}({ans.question.a}, {ans.question.b})</span>
                                            ) : (
                                                <div className="f-g">
                                                    {ans.question.type === 'simplificar' ? (
                                                        <Fraction n={ans.question.n} d={ans.question.d} />
                                                    ) : (
                                                        <>
                                                            <Fraction n={ans.question.n1} d={ans.question.d1} />
                                                            <span className="s">{ans.question.type === 'sumas' ? '+' : ans.question.type === 'restas' ? '-' : '×'}</span>
                                                            <Fraction n={ans.question.n2} d={ans.question.d2} />
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ans-side">
                                        <div className="val-row u">
                                            <span className="l">Tu respuesta:</span>
                                            <span className="v">{ans.userAnswer || 'Vacío'}</span>
                                        </div>
                                        <div className="val-row s">
                                            <span className="l">Correcta:</span>
                                            <span className="v">{ans.correctAnswer}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    className="exercise-area"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="exercise-header">
                        <button className="btn-back" onClick={() => { setSection(null); setIsExamMode(false); }}>
                            <ArrowLeft size={20} /> Salir
                        </button>
                        {isExamMode ? (
                            <div className="exam-progress">
                                Pregunta {examStep + 1} de 12
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${((examStep + 1) / 12) * 100}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="section-badge" style={{ background: section.color }}>
                                {section.name}
                            </div>
                        )}
                    </div>

                    <div className="exercise-card">
                        <div className="exercise-content">
                            {exercise?.type === 'sumas' && (
                                <div className="simple-calc-container">
                                    <div className="fraction-calc complex">
                                        <div className="op-group">
                                            <Fraction n={exercise.n1} d={exercise.d1} />
                                            <Plus size={24} className="op-icon" />
                                            <Fraction n={exercise.n2} d={exercise.d2} />
                                        </div>
                                        <span className="equal-sign">=</span>
                                        <div className="op-group">
                                            <FractionInputSmall
                                                value={{ num: intermediate.n1, den: intermediate.den }}
                                                onChange={(val) => setIntermediate({ ...intermediate, n1: val.num, den: val.den })}
                                            />
                                            <Plus size={24} className="op-icon" />
                                            <FractionInputSmall
                                                value={{ num: intermediate.n2, den: intermediate.den }}
                                                onChange={(val) => setIntermediate({ ...intermediate, n2: val.num, den: val.den })}
                                            />
                                        </div>
                                        <span className="equal-sign">=</span>
                                        <FractionInput
                                            value={userAnswer}
                                            onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                        />
                                    </div>
                                    {!isExamMode && (
                                        <button
                                            className={`btn-toggle-hint ${showHint ? 'active' : ''}`}
                                            onClick={() => setShowHint(!showHint)}
                                        >
                                            {showHint ? 'Ocultar Múltiplos' : '💡 Ver Múltiplos'}
                                        </button>
                                    )}
                                    <AnimatePresence>
                                        {showHint && !isExamMode && (
                                            <motion.div
                                                className="dynamic-aid-inline"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                {renderMultiples(exercise.d1, exercise.d2)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                            {exercise?.type === 'restas' && (
                                <div className="simple-calc-container">
                                    <div className="fraction-calc complex">
                                        <div className="op-group">
                                            <Fraction n={exercise.n1} d={exercise.d1} />
                                            <Minus size={24} className="op-icon" />
                                            <Fraction n={exercise.n2} d={exercise.d2} />
                                        </div>
                                        <span className="equal-sign">=</span>
                                        <div className="op-group">
                                            <FractionInputSmall
                                                value={{ num: intermediate.n1, den: intermediate.den }}
                                                onChange={(val) => setIntermediate({ ...intermediate, n1: val.num, den: val.den })}
                                            />
                                            <Minus size={24} className="op-icon" />
                                            <FractionInputSmall
                                                value={{ num: intermediate.n2, den: intermediate.den }}
                                                onChange={(val) => setIntermediate({ ...intermediate, n2: val.num, den: val.den })}
                                            />
                                        </div>
                                        <span className="equal-sign">=</span>
                                        <FractionInput
                                            value={userAnswer}
                                            onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                        />
                                    </div>
                                    {!isExamMode && (
                                        <button
                                            className={`btn-toggle-hint ${showHint ? 'active' : ''}`}
                                            onClick={() => setShowHint(!showHint)}
                                        >
                                            {showHint ? 'Ocultar Múltiplos' : '💡 Ver Múltiplos'}
                                        </button>
                                    )}
                                    <AnimatePresence>
                                        {showHint && !isExamMode && (
                                            <motion.div
                                                className="dynamic-aid-inline"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                {renderMultiples(exercise.d1, exercise.d2)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                            {exercise?.type === 'multiplicaciones' && (
                                <div className="fraction-calc">
                                    <Fraction n={exercise.n1} d={exercise.d1} />
                                    <X size={24} className="op-icon" />
                                    <Fraction n={exercise.n2} d={exercise.d2} />
                                    <span className="equal-sign">=</span>
                                    <FractionInput
                                        value={userAnswer}
                                        onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                    />
                                </div>
                            )}
                            {exercise?.type === 'simplificar' && (
                                <div className="simple-calc-container">
                                    <div className="fraction-calc">
                                        <Fraction n={exercise.n} d={exercise.d} />
                                        <span className="equal-sign">➡️</span>
                                        <FractionInput
                                            value={userAnswer}
                                            onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                        />
                                    </div>
                                    {!isExamMode && (
                                        <button
                                            className={`btn-toggle-hint ${showHint ? 'active' : ''}`}
                                            onClick={() => setShowHint(!showHint)}
                                        >
                                            {showHint ? 'Ocultar Divisores' : '💡 Ver Divisores'}
                                        </button>
                                    )}
                                    <AnimatePresence>
                                        {showHint && !isExamMode && (
                                            <motion.div
                                                className="dynamic-aid-inline"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="hint-scroll">
                                                    <div className="hint-row">
                                                        <span className="hint-num">{exercise.n}:</span>
                                                        {(() => {
                                                            const divs = [];
                                                            for (let i = 1; i <= exercise.n; i++) if (exercise.n % i === 0) divs.push(i);
                                                            return divs.map(d => <span key={d} className="hint-ball divisor">{d}</span>);
                                                        })()}
                                                    </div>
                                                    <div className="hint-row">
                                                        <span className="hint-num">{exercise.d}:</span>
                                                        {(() => {
                                                            const divs = [];
                                                            for (let i = 1; i <= exercise.d; i++) if (exercise.d % i === 0) divs.push(i);
                                                            return divs.map(d => <span key={d} className="hint-ball divisor">{d}</span>);
                                                        })()}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                            {(exercise?.type === 'mcm' || exercise?.type === 'mcd') && (
                                <div className="simple-calc-container">
                                    <div className="simple-calc">
                                        <div className="numbers-display">
                                            {exercise.type.toUpperCase()}({exercise.a}, {exercise.b})
                                        </div>
                                        <span className="equal-sign">=</span>
                                        <input
                                            type="number"
                                            className="single-input"
                                            value={userAnswer.single}
                                            onChange={(e) => setUserAnswer({ ...userAnswer, single: e.target.value })}
                                            placeholder="?"
                                        />
                                    </div>

                                    {!isExamMode && (
                                        <button
                                            className={`btn-toggle-hint ${showHint ? 'active' : ''}`}
                                            onClick={() => setShowHint(!showHint)}
                                        >
                                            {showHint ? 'Ocultar Pistas' : `💡 Ver ${exercise.type === 'mcm' ? 'múltiplos' : 'divisores'}`}
                                        </button>
                                    )}

                                    <AnimatePresence>
                                        {showHint && !isExamMode && (
                                            <motion.div
                                                className="dynamic-aid-inline"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="hint-scroll">
                                                    {exercise.type === 'mcm' ? (
                                                        <>
                                                            {renderMultiples(exercise.a, exercise.b)}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="hint-row">
                                                                <span className="hint-num">{exercise.a}:</span>
                                                                {(() => {
                                                                    const divs = [];
                                                                    for (let i = 1; i <= exercise.a; i++) if (exercise.a % i === 0) divs.push(i);
                                                                    return divs.map(d => <span key={d} className="hint-ball divisor">{d}</span>);
                                                                })()}
                                                            </div>
                                                            <div className="hint-row">
                                                                <span className="hint-num">{exercise.b}:</span>
                                                                {(() => {
                                                                    const divs = [];
                                                                    for (let i = 1; i <= exercise.b; i++) if (exercise.b % i === 0) divs.push(i);
                                                                    return divs.map(d => <span key={d} className="hint-ball divisor">{d}</span>);
                                                                })()}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        <div className="exercise-actions">
                            {!isExamMode && (
                                <button className="btn-help" onClick={() => setShowHelp(true)}>
                                    <HelpCircle size={20} /> Ayuda
                                </button>
                            )}
                            <button className="btn-check" onClick={checkAnswer}>
                                <Check size={20} /> {isExamMode ? (examStep === 11 ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
                            </button>
                            {!isExamMode && (
                                <button className="btn-refresh" onClick={() => generateExercise(section.id)}>
                                    <RefreshCw size={20} /> Nueva
                                </button>
                            )}
                        </div>

                        {feedback && (
                            <motion.div
                                className={`feedback ${feedback.type}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                {feedback.text}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        className="fractions-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div
                            className="fractions-modal-content"
                            initial={{ y: 50, scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 50, scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="fractions-modal-header">
                                <BookOpen className="fractions-modal-icon" />
                                <h2>{section?.helpTitle}</h2>
                                <button className="fractions-close-btn" onClick={() => setShowHelp(false)}><X /></button>
                            </div>
                            <div className="fractions-modal-body">
                                {renderHelpContent()}
                            </div>
                            <div className="fractions-modal-footer">
                                <button className="btn-primary" onClick={() => setShowHelp(false)}>¡Entendido!</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Fraction = ({ n, d }) => (
    <div className="fraction">
        <span className="num">{n}</span>
        <span className="den">{d}</span>
    </div>
);

const FractionInputSmall = ({ value, onChange }) => (
    <div className="fraction-input small">
        <input
            type="number"
            className="num-input"
            value={value.num}
            onChange={(e) => onChange({ num: e.target.value, den: value.den })}
            placeholder="n"
        />
        <input
            type="number"
            className="den-input"
            value={value.den}
            onChange={(e) => onChange({ den: e.target.value, num: value.num })}
            placeholder="den"
        />
    </div>
);

const FractionInput = ({ value, onChange }) => (
    <div className="fraction-input">
        <input
            type="number"
            className="num-input"
            value={value.num}
            onChange={(e) => onChange({ num: e.target.value })}
            placeholder="N"
        />
        <input
            type="number"
            className="den-input"
            value={value.den}
            onChange={(e) => onChange({ den: e.target.value })}
            placeholder="D"
        />
    </div>
);

export default FraccionesESO;
