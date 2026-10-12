// src/apps/fracciones-eso/FraccionesESO.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit). La lógica
// (ejercicios, comprobación, examen de 12 preguntas, puntos y onGameComplete)
// no cambia: solo la presentación.
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Minus, X, Check, RefreshCw, Award, BookOpen, Layers, ClipboardCheck,
    Scissors, ArrowRight, Lightbulb, LayoutGrid, GraduationCap, LogOut, Star, Target, Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import InstructionsModal from '../_shared/InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, Panel, GameButton, ModeSelect, RoundBanner,
    ResultsScreen, FeedbackItem,
} from '../_shared/kit';
import FractionMascot from './FractionMascot';
import './FraccionesESO.css';

const SECTIONS = [
    { id: 'sumas', name: 'Sumas', Icon: Plus, description: 'Suma fracciones con distinto denominador usando el m.c.m.', features: ['Paso intermedio con el m.c.m.', 'Pista: tabla de múltiplos'], helpTitle: '¿Cómo sumar fracciones?' },
    { id: 'restas', name: 'Restas', Icon: Minus, description: 'Resta fracciones paso a paso igualando sus denominadores.', features: ['Paso intermedio con el m.c.m.', 'Pista: tabla de múltiplos'], helpTitle: '¿Cómo restar fracciones?' },
    { id: 'multiplicaciones', name: 'Multiplicaciones', Icon: X, description: 'Multiplica numeradores y denominadores en línea recta.', features: ['Numerador × numerador', 'Vale una fracción equivalente'], helpTitle: '¿Cómo multiplicar fracciones?' },
    { id: 'simplificar', name: 'Simplificar', Icon: Scissors, description: 'Reduce fracciones dividiendo numerador y denominador.', features: ['Hasta la fracción irreducible', 'Pista: tabla de divisores'], helpTitle: '¿Cómo simplificar fracciones?' },
    { id: 'mcm', name: 'Mínimo Común Múltiplo', Icon: Layers, description: 'Halla el múltiplo común más pequeño de dos números.', features: ['Dos números pares', 'Pista: tabla de múltiplos'], helpTitle: '¿Cómo calcular el M.C.M.?' },
    { id: 'mcd', name: 'Máximo Común Divisor', Icon: Award, description: 'Encuentra el divisor más grande común a ambos números.', features: ['Dos números pares', 'Pista: tabla de divisores'], helpTitle: '¿Cómo calcular el M.C.D.?' }
];
const sectionOf = (id) => SECTIONS.find(s => s.id === id);
const OP_ICON = { sumas: Plus, restas: Minus, multiplicaciones: X };
const OP_SIGN = { sumas: '+', restas: '−', multiplicaciones: '×' };

// Helper functions
const gcd = (a, b) => (!b ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

const FraccionesESO = ({ onGameComplete }) => {
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
    const [isVibrating, setIsVibrating] = useState(false);
    const examStartRef = React.useRef(0);
    // Solo presentación: puntos y tiempo del examen para el resumen, instrucciones y salida
    const [examSummary, setExamSummary] = useState({ points: 0, elapsed: 0 });
    const [showInstructions, setShowInstructions] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const renderDivisors = (num1, num2) => {
        const divs1 = [];
        for (let i = 1; i <= num1; i++) if (num1 % i === 0) divs1.push(i);
        const divs2 = [];
        for (let i = 1; i <= num2; i++) if (num2 % i === 0) divs2.push(i);
        const maxRows = Math.max(divs1.length, divs2.length);

        return (
            <div className="fr-table-wrap">
                <table className="fr-table">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>{num1}</th>
                            <th>{num2}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxRows }).map((_, i) => (
                            <tr key={i}>
                                <td className="fr-table__idx">{i + 1}</td>
                                <td>{divs1[i] ? <span className="fr-ball">{divs1[i]}</span> : <span className="fr-table__dash">-</span>}</td>
                                <td>{divs2[i] ? <span className="fr-ball fr-ball--alt">{divs2[i]}</span> : <span className="fr-table__dash">-</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderMultiples = (num1, num2) => {
        const common = lcm(num1, num2);
        const limit1 = Math.max(10, Math.ceil(common / num1));
        const limit2 = Math.max(10, Math.ceil(common / num2));
        const maxRows = Math.max(limit1, limit2);

        return (
            <div className="fr-table-wrap">
                <table className="fr-table">
                    <thead>
                        <tr>
                            <th>×</th>
                            <th>{num1}</th>
                            <th>{num2}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxRows }).map((_, i) => {
                            const m1 = (i + 1) * num1;
                            const m2 = (i + 1) * num2;
                            return (
                                <tr key={i}>
                                    <td className="fr-table__idx">{i + 1}</td>
                                    <td>
                                        {i < limit1 && (
                                            <span className="fr-ball">
                                                {m1}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {i < limit2 && (
                                            <span className="fr-ball fr-ball--alt">
                                                {m2}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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

        // Vibración
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 400);
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
        setSection({ id: 'examen', name: 'Examen de Fracciones' });
        setExercise(shuffled[0]);
        setUserAnswer({ num: '', den: '', single: '' });
        setIntermediate({ n1: '', n2: '', den: '' });
        examStartRef.current = Date.now();
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
        // Bonus por rapidez: 30s/pregunta de presupuesto
        const elapsedSec = examStartRef.current
            ? Math.max(1, Math.round((Date.now() - examStartRef.current) / 1000))
            : 0;
        const TIME_BUDGET = 12 * 30;
        const SPEED_COEF = 5;
        const timeBonus = elapsedSec > 0
            ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
            : 0;
        // Solo presentación: los mismos puntos que se envían, para el resumen
        setExamSummary({ points: correctCount * 100 + timeBonus, elapsed: elapsedSec });
        onGameComplete?.({
            mode: 'test',
            score: correctCount * 100 + timeBonus,
            maxScore: 1200 + TIME_BUDGET * SPEED_COEF,
            correctAnswers: correctCount,
            totalQuestions: 12,
            durationSeconds: elapsedSec,
        });
    };

    const renderHelpContent = () => {
        if (!section) return null;
        switch (section.id) {
            case 'sumas':
            case 'restas':
                return (
                    <div className="fr-help">
                        <div className="fr-help__steps">
                            <section className="fr-help__step">
                                <span className="fr-help__num">1</span>
                                <div>
                                    <strong>Igualar denominadores</strong> Calcula el <strong>m.c.m.</strong> de los denominadores.
                                    <em>Ej: Para 4 y 6, el m.c.m. es 12.</em>
                                </div>
                            </section>
                            <section className="fr-help__step">
                                <span className="fr-help__num">2</span>
                                <div>
                                    <strong>Ajustar numeradores</strong> Divide el m.c.m. entre el antiguo y multiplica por el numerador.
                                    <span className="fr-help__formula">(m.c.m. ÷ Denom) × Num</span>
                                </div>
                            </section>
                            <section className="fr-help__step">
                                <span className="fr-help__num">3</span>
                                <div>
                                    <strong>Operar</strong> Suma o resta los numeradores. El denominador <strong>NO cambia</strong>.
                                </div>
                            </section>
                        </div>
                        <div className="fr-help__example">
                            <Fraction n="1" d="4" /> <span className="fr-help__op">{section.id === 'sumas' ? '+' : '−'}</span> <Fraction n="1" d="6" />
                            <ArrowRight className="fr-help__arrow" size={22} />
                            <Fraction n="3" d="12" /> <span className="fr-help__op">{section.id === 'sumas' ? '+' : '−'}</span> <Fraction n="2" d="12" />
                            <ArrowRight className="fr-help__arrow" size={22} />
                            <Fraction n={section.id === 'sumas' ? '5' : '1'} d="12" />
                        </div>
                    </div>
                );
            case 'multiplicaciones':
                return (
                    <div className="fr-help">
                        <p>¡Es la operación más sencilla! Se hace en <strong>línea recta</strong>:</p>
                        <div className="fr-help__lines">
                            <div className="fr-help__line"><span>Numeradores</span><strong>A × C</strong></div>
                            <span className="fr-help__bar" />
                            <div className="fr-help__line"><span>Denominadores</span><strong>B × D</strong></div>
                        </div>
                        <div className="fr-help__tip">
                            <Lightbulb size={18} /> <span><strong>REGLA DE ORO:</strong> Numerador por Numerador y Denominador por Denominador.</span>
                        </div>
                    </div>
                );
            case 'simplificar':
                return (
                    <div className="fr-help">
                        <p>Simplificar es "hacer la fracción más pequeña" sin que cambie su valor.</p>
                        <div className="fr-help__chain">
                            <span className="fr-help__node"><Fraction n="10" d="20" /></span>
                            <span className="fr-help__div">÷ 2</span>
                            <span className="fr-help__node"><Fraction n="5" d="10" /></span>
                            <span className="fr-help__div">÷ 5</span>
                            <span className="fr-help__node is-goal"><Fraction n="1" d="2" /></span>
                        </div>
                        <p className="fr-help__note">Divide arriba y abajo siempre por el <strong>mismo número</strong>.</p>
                    </div>
                );
            case 'mcm':
                return (
                    <div className="fr-help fr-help__theory">
                        <h3>Mínimo Común Múltiplo</h3>
                        <p>Es el número más pequeño que es múltiplo de ambos.</p>
                        <div className="fr-help__rule">
                            <strong>Factores:</strong> Comunes y no comunes al <strong>mayor exponente</strong>.
                        </div>
                        <div className="fr-help__code">
                            mcm(4, 6):<br />
                            4 = 2²<br />
                            6 = 2 × 3<br />
                            <strong>mcm = 2² × 3 = 12</strong>
                        </div>
                    </div>
                );
            case 'mcd':
                return (
                    <div className="fr-help fr-help__theory">
                        <h3>Máximo Común Divisor</h3>
                        <p>Es el número más grande que divide a ambos a la vez.</p>
                        <div className="fr-help__rule">
                            <strong>Factores:</strong> Solo comunes al <strong>menor exponente</strong>.
                        </div>
                        <div className="fr-help__code">
                            MCD(12, 18):<br />
                            12 = 2² × 3<br />
                            18 = 2 × 3²<br />
                            <strong>MCD = 2 × 3 = 6</strong>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    // Solo presentación: nota del examen para el resumen
    const examCorrectCount = examAnswers.filter(a => a.isCorrect).length;
    const examGrade = Math.round((examCorrectCount / 12) * 100) / 10;

    const shellProps = { accent: '#ec4899', accent2: '#8b5cf6', className: 'fr', style: { maxWidth: 1120 } };

    const sectionHelp = (
        <InstructionsModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            title={section?.helpTitle || 'Ayuda'}
        >
            {renderHelpContent()}
        </InstructionsModal>
    );

    const instructions = (
        <InstructionsModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            title="Cómo jugar a Fracciones PRO"
        >
            <h3>🎯 Objetivo</h3>
            <p>
                Practica las operaciones con fracciones y el cálculo del <strong>m.c.m.</strong> y
                el <strong>M.C.D.</strong>. Cada ejercicio es nuevo.
            </p>
            <h3>🕹️ Cómo se juega</h3>
            <ul>
                <li>Elige un tema para practicar sin límite o lanza el <strong>examen</strong>.</li>
                <li>Escribe el <strong>numerador</strong> arriba y el <strong>denominador</strong> abajo.</li>
                <li>En sumas y restas, primero rellena el <strong>paso intermedio</strong> con el m.c.m. de los denominadores.</li>
                <li>En práctica tienes <strong>Ayuda</strong> con la teoría y una tabla de <strong>múltiplos o divisores</strong>.</li>
            </ul>
            <h3>📊 Examen</h3>
            <p>12 preguntas (dos de cada tema), sin ayudas.</p>
            <p className="instr-formula"><strong>Nota</strong> = aciertos / 12 × 10</p>
            <p className="instr-formula"><strong>Puntos</strong> = 100 por acierto + bonus por rapidez</p>
        </InstructionsModal>
    );

    // ---------- Pantalla previa: temas y examen ----------
    if (!section) {
        const modes = [
            ...SECTIONS.map(s => ({
                id: s.id, tone: `fr-${s.id}`, icon: s.Icon, title: s.name,
                desc: s.description, features: s.features, cta: 'Practicar',
            })),
            {
                id: 'examen', tone: 'exam', icon: ClipboardCheck, title: 'Examen final',
                desc: 'Un examen aleatorio de 12 preguntas para evaluar todo lo que sabes.',
                features: ['Dos preguntas de cada tema', 'Nota /10 y puntos por rapidez'], cta: 'Empezar examen',
            },
        ];
        const selectMode = (id) => {
            if (id === 'examen') { startExam(); return; }
            const s = sectionOf(id);
            setSection(s);
            generateExercise(s.id);
        };
        return (
            <GameShell {...shellProps}>
                <ModeSelect modes={modes} onSelect={selectMode} onHelp={() => setShowInstructions(true)} />
                {instructions}
            </GameShell>
        );
    }

    // ---------- Resultados del examen ----------
    if (showResults) {
        return (
            <GameShell {...shellProps}>
                <ResultsScreen
                    nota={examGrade}
                    points={examSummary.points}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${examCorrectCount}/12` },
                        { icon: Clock, tone: 'time', label: 'Tiempo', value: `${examSummary.elapsed}s` },
                    ]}
                    actions={[
                        { label: 'Otro examen', onClick: startExam, icon: RefreshCw },
                        {
                            label: 'Volver al inicio', icon: LayoutGrid, variant: 'soft', onClick: () => {
                                setIsExamMode(false);
                                setShowResults(false);
                                setSection(null);
                            },
                        },
                    ]}
                >
                    <div className="fr-review">
                        {examAnswers.map((ans, idx) => (
                            <FeedbackItem
                                key={idx}
                                index={idx + 1}
                                ok={ans.isCorrect}
                                title={sectionOf(ans.question.type)?.name}
                            >
                                <span className="fr-review__row">
                                    <span className="fr-review__op">
                                        <QuestionExpr q={ans.question} />
                                    </span>
                                    <span className="fr-review__vals">
                                        <span className={`fr-review__pill ${ans.isCorrect ? 'is-ok' : 'is-ko'}`}>Tu respuesta: {!ans.userAnswer || ans.userAnswer === 'Vacio' ? 'Vacío' : ans.userAnswer}</span>
                                        <span className="fr-review__pill is-sol">Correcta: {ans.correctAnswer}</span>
                                    </span>
                                </span>
                            </FeedbackItem>
                        ))}
                    </div>
                </ResultsScreen>
            </GameShell>
        );
    }

    // ---------- Ejercicio (práctica o examen) ----------
    const exSection = sectionOf(exercise?.type);
    const boardLabel = isExamMode
        ? (exercise?.type === 'simplificar' ? 'Simplifica la fracción' : exSection?.name)
        : section.name;
    const BoardIcon = exSection?.Icon || Star;
    const mood = feedback?.type === 'success' ? 'happy' : feedback?.type === 'error' ? 'sad' : 'idle';
    const hintLabel = exercise?.type === 'simplificar' || exercise?.type === 'mcd' ? 'divisores'
        : exercise?.type === 'mcm' || exercise?.type === 'sumas' || exercise?.type === 'restas' ? 'múltiplos' : null;
    const sumLike = exercise?.type === 'sumas' || exercise?.type === 'restas';
    const OpIcon = OP_ICON[exercise?.type];

    return (
        <GameShell {...shellProps}>
            <GameHeader
                mode={isExamMode ? 'exam' : 'practice'}
                modeLabel={isExamMode ? 'Examen' : section.name}
                onHelp={!isExamMode ? () => setShowHelp(true) : undefined}
                right={(
                    <Hud>
                        {isExamMode ? (
                            <HudStat icon={GraduationCap} tone="progress" value={`${examStep + 1}/12`} label="Pregunta" />
                        ) : (
                            <HudStat icon={Star} tone="score" value={score} label="Puntos" />
                        )}
                    </Hud>
                )}
            />

            {isExamMode && (
                <div className="fr-steps" role="progressbar" aria-valuemin={0} aria-valuemax={12} aria-valuenow={examStep + 1}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <span key={i} className={`fr-steps__seg ${i < examStep ? 'is-done' : i === examStep ? 'is-current' : ''}`} />
                    ))}
                </div>
            )}

            <div className="fr-stage">
                <div className="fr-main">
                    <Panel
                        variant="screen"
                        className={`fr-board fr-t-${exercise?.type || 'none'} ${isVibrating ? 'fr-anim-new' : ''} ${feedback?.type === 'success' ? 'is-success' : feedback?.type === 'error' ? 'is-error gk-anim-shake' : ''}`}
                    >
                        <div className="fr-board__head">
                            <span className="fr-board__label"><BoardIcon size={14} /> {boardLabel}</span>
                            {sumLike && <span className="fr-board__note">Paso 1: iguala denominadores · Paso 2: opera</span>}
                        </div>

                        {sumLike && (
                            <div className="fr-eq">
                                <div className="fr-eq__group">
                                    <Fraction n={exercise.n1} d={exercise.d1} big />
                                    <OpBadge Icon={OpIcon} />
                                    <Fraction n={exercise.n2} d={exercise.d2} big />
                                </div>
                                <span className="fr-eq__equal">=</span>
                                <div className="fr-eq__group fr-eq__group--step">
                                    <FractionInputSmall
                                        value={{ num: intermediate.n1, den: intermediate.den }}
                                        onChange={(val) => setIntermediate({ ...intermediate, n1: val.num, den: val.den })}
                                    />
                                    <OpBadge Icon={OpIcon} />
                                    <FractionInputSmall
                                        value={{ num: intermediate.n2, den: intermediate.den }}
                                        onChange={(val) => setIntermediate({ ...intermediate, n2: val.num, den: val.den })}
                                    />
                                </div>
                                <span className="fr-eq__equal">=</span>
                                <FractionInput
                                    value={userAnswer}
                                    onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                />
                            </div>
                        )}
                        {exercise?.type === 'multiplicaciones' && (
                            <div className="fr-eq">
                                <Fraction n={exercise.n1} d={exercise.d1} big />
                                <OpBadge Icon={X} />
                                <Fraction n={exercise.n2} d={exercise.d2} big />
                                <span className="fr-eq__equal">=</span>
                                <FractionInput
                                    value={userAnswer}
                                    onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                />
                            </div>
                        )}
                        {exercise?.type === 'simplificar' && (
                            <div className="fr-eq">
                                <Fraction n={exercise.n} d={exercise.d} big />
                                <span className="fr-eq__arrow"><Scissors size={20} /><ArrowRight size={22} /></span>
                                <FractionInput
                                    value={userAnswer}
                                    onChange={(val) => setUserAnswer({ ...userAnswer, ...val })}
                                />
                            </div>
                        )}
                        {(exercise?.type === 'mcm' || exercise?.type === 'mcd') && (
                            <div className="fr-eq">
                                <span className="fr-eq__fn">
                                    {exercise.type === 'mcm' ? 'm.c.m.' : 'M.C.D.'}
                                    <span className="fr-eq__args">(<b>{exercise.a}</b>, <b>{exercise.b}</b>)</span>
                                </span>
                                <span className="fr-eq__equal">=</span>
                                <input
                                    type="number"
                                    className="fr-slot fr-slot--single"
                                    value={userAnswer.single}
                                    onChange={(e) => setUserAnswer({ ...userAnswer, single: e.target.value })}
                                    placeholder="?"
                                    aria-label="Resultado"
                                />
                            </div>
                        )}

                        {/* Ayuda visual de la práctica: las fracciones dibujadas */}
                        {!isExamMode && exercise && (OP_ICON[exercise.type] || exercise.type === 'simplificar') && (
                            <div className="fr-visual" aria-hidden="true">
                                {exercise.type === 'simplificar' ? (
                                    <FractionPies n={exercise.n} d={exercise.d} tone="pink" />
                                ) : (
                                    <>
                                        <FractionPies n={exercise.n1} d={exercise.d1} tone="indigo" />
                                        <span className="fr-visual__op">{OP_SIGN[exercise.type]}</span>
                                        <FractionPies n={exercise.n2} d={exercise.d2} tone="amber" />
                                    </>
                                )}
                            </div>
                        )}
                    </Panel>

                    {!isExamMode && hintLabel && (
                        <div className="fr-hint">
                            <GameButton
                                variant={showHint ? 'soft' : 'warning'}
                                size="sm"
                                icon={Lightbulb}
                                onClick={() => setShowHint(!showHint)}
                            >
                                {showHint ? `Ocultar ${hintLabel}` : `Ver ${hintLabel}`}
                            </GameButton>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div
                                        className="fr-hint__box"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                    >
                                        {exercise.type === 'mcm' || sumLike ? (
                                            renderMultiples(sumLike ? exercise.d1 : exercise.a, sumLike ? exercise.d2 : exercise.b)
                                        ) : exercise.type === 'simplificar' ? (
                                            renderDivisors(exercise.n, exercise.d)
                                        ) : (
                                            renderDivisors(exercise.a, exercise.b)
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="fr-actions">
                        {!isExamMode && (
                            <GameButton variant="soft" icon={BookOpen} onClick={() => setShowHelp(true)}>
                                Ayuda
                            </GameButton>
                        )}
                        <GameButton
                            size="lg"
                            icon={isExamMode && examStep === 11 ? GraduationCap : Check}
                            onClick={checkAnswer}
                            disabled={!isExamMode && feedback?.type === 'success'}
                        >
                            {isExamMode ? (examStep === 11 ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
                        </GameButton>
                        {!isExamMode && (
                            <GameButton
                                variant="soft"
                                icon={RefreshCw}
                                className={isVibrating ? 'fr-anim-spin' : ''}
                                onClick={() => generateExercise(section.id)}
                            >
                                Nueva
                            </GameButton>
                        )}
                    </div>

                    <RoundBanner
                        show={!!feedback}
                        status={feedback?.type === 'success' ? 'won' : 'lost'}
                        title={feedback?.type === 'success' ? '¡Correcto!' : 'Revisa tu respuesta'}
                        subtitle={feedback?.type === 'success' ? 'Respuesta correcta · siguiente ejercicio en un momento…' : feedback?.text}
                    />
                </div>

                <aside className="fr-coach">
                    <FractionMascot
                        mood={isExamMode ? 'idle' : mood}
                        hint={isExamMode ? '¡Concéntrate, tú puedes!' : null}
                    />
                </aside>
            </div>

            <div className="fr-footer">
                {isExamMode ? (
                    <>
                        <span className="fr-footer__info"><GraduationCap size={14} /> Modo examen · sin ayudas</span>
                        <GameButton variant="ghost" size="sm" icon={LogOut} className="fr-footer__exit" onClick={() => setShowExitModal(true)}>
                            Abandonar examen
                        </GameButton>
                    </>
                ) : (
                    <>
                        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => { setSection(null); setIsExamMode(false); }}>
                            Cambiar de tema
                        </GameButton>
                        <span className="fr-footer__info fr-footer__info--right"><Star size={14} /> +10 por acierto · −5 por fallo</span>
                    </>
                )}
            </div>

            {sectionHelp}

            <AnimatePresence>
                {showExitModal && (
                    <motion.div
                        className="fr-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowExitModal(false)}
                    >
                        <motion.div
                            className="fr-modal__card"
                            role="dialog"
                            aria-modal="true"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="fr-modal__icon"><LogOut size={28} /></span>
                            <h3>¿Abandonar el examen?</h3>
                            <p>Si sales ahora, este intento <strong>no se guardará</strong> y volverás al menú de temas.</p>
                            <div className="fr-modal__actions">
                                <GameButton variant="soft" onClick={() => setShowExitModal(false)}>Seguir con el examen</GameButton>
                                <GameButton
                                    variant="danger"
                                    icon={LogOut}
                                    onClick={() => { setShowExitModal(false); setSection(null); setIsExamMode(false); }}
                                >
                                    Abandonar
                                </GameButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GameShell>
    );
};

// Fracción "de tiza" (pantalla oscura) o de tinta (fondos claros).
const Fraction = ({ n, d, big = false }) => (
    <span className={`fr-frac ${big ? 'fr-frac--big' : ''}`}>
        <span className="fr-frac__num">{n}</span>
        <span className="fr-frac__bar" />
        <span className="fr-frac__den">{d}</span>
    </span>
);

const OpBadge = ({ Icon }) => (
    <span className="fr-op" aria-hidden="true">{Icon ? <Icon size={20} strokeWidth={3} /> : null}</span>
);

// Operación de una pregunta (resumen del examen).
const QuestionExpr = ({ q }) => {
    if (q.type === 'mcm' || q.type === 'mcd') {
        return <span className="fr-review__fn">{q.type === 'mcm' ? 'm.c.m.' : 'M.C.D.'}({q.a}, {q.b})</span>;
    }
    if (q.type === 'simplificar') return <Fraction n={q.n} d={q.d} />;
    return (
        <>
            <Fraction n={q.n1} d={q.d1} />
            <span className="fr-review__sign">{OP_SIGN[q.type]}</span>
            <Fraction n={q.n2} d={q.d2} />
        </>
    );
};

// Tartas en relieve que dibujan n/d (varias si la fracción es impropia).
const PIE_TONES = {
    indigo: { light: '#c7d2fe', base: '#6366f1', dark: '#3730a3' },
    amber: { light: '#fef3c7', base: '#fbbf24', dark: '#b45309' },
    pink: { light: '#fbcfe8', base: '#ec4899', dark: '#9d174d' },
};
const MAX_PIES = 5;
const FractionPies = ({ n, d, tone }) => {
    const total = Math.max(1, Math.ceil(n / d));
    const pies = Math.min(total, MAX_PIES);
    const t = PIE_TONES[tone];
    const gid = `fr-pie-${tone}`;
    return (
        <span className="fr-pies">
            {Array.from({ length: pies }).map((_, i) => {
                const filled = Math.max(0, Math.min(d, n - i * d));
                return <PieSvg key={i} d={d} filled={filled} gid={gid} t={t} />;
            })}
            {total > MAX_PIES && <span className="fr-pies__more">+{total - MAX_PIES}</span>}
            <svg width="0" height="0" className="fr-pies__defs" aria-hidden="true">
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={t.light} />
                        <stop offset=".5" stopColor={t.base} />
                        <stop offset="1" stopColor={t.dark} />
                    </linearGradient>
                </defs>
            </svg>
        </span>
    );
};

const PieSvg = ({ d, filled, gid, t }) => {
    const cx = 30;
    const cy = 28;
    const r = 25;
    const pt = (k) => {
        const a = (k / d) * Math.PI * 2 - Math.PI / 2;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const sector = (k0, k1) => {
        const [x0, y0] = pt(k0);
        const [x1, y1] = pt(k1);
        const large = (k1 - k0) / d > 0.5 ? 1 : 0;
        return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    };
    return (
        <svg viewBox="0 0 60 62" className="fr-pie">
            <ellipse cx="30" cy="57" rx="20" ry="3.5" className="fr-pie__shadow" />
            <circle cx={cx} cy={cy + 2.5} r={r} fill={t.dark} opacity=".55" />
            <circle cx={cx} cy={cy} r={r} className="fr-pie__plate" />
            {filled >= d
                ? <circle cx={cx} cy={cy} r={r} fill={`url(#${gid})`} />
                : filled > 0 && <path d={sector(0, filled)} fill={`url(#${gid})`} />}
            {d <= 24 && Array.from({ length: d }).map((_, k) => {
                const [x, y] = pt(k);
                return <line key={k} x1={cx} y1={cy} x2={x} y2={y} className="fr-pie__cut" />;
            })}
            <ellipse cx="22" cy="17" rx="11" ry="6" fill="#fff" opacity=".28" transform="rotate(-30 22 17)" />
        </svg>
    );
};

const FractionInputSmall = ({ value, onChange }) => (
    <span className="fr-slots fr-slots--small">
        <input
            type="number"
            className="fr-slot"
            value={value.num}
            onChange={(e) => onChange({ num: e.target.value, den: value.den })}
            placeholder="n"
            aria-label="Numerador del paso intermedio"
        />
        <span className="fr-slots__bar" />
        <input
            type="number"
            className="fr-slot"
            value={value.den}
            onChange={(e) => onChange({ den: e.target.value, num: value.num })}
            placeholder="den"
            aria-label="Denominador común"
        />
    </span>
);

const FractionInput = ({ value, onChange }) => (
    <span className="fr-slots fr-slots--answer">
        <input
            type="number"
            className="fr-slot"
            value={value.num}
            onChange={(e) => onChange({ num: e.target.value })}
            placeholder="N"
            aria-label="Numerador del resultado"
        />
        <span className="fr-slots__bar" />
        <input
            type="number"
            className="fr-slot"
            value={value.den}
            onChange={(e) => onChange({ den: e.target.value })}
            placeholder="D"
            aria-label="Denominador del resultado"
        />
    </span>
);

export default FraccionesESO;
