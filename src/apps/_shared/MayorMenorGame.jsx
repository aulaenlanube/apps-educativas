// Mayor, menor o igual · Ordena los números (rediseño 2026 sobre _shared/kit).
// Lo propio del juego: bloques numéricos con volumen, el cocodrilo comparador
// (sus mandíbulas SON el signo: «<», «>» o «=») y la escalera de ordenar.
// Reglas, generadores, puntuación y tracking: sin cambios.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    ArrowLeftRight, Check, Clock, LayoutGrid, RefreshCw, SkipForward, Target, Trophy, Flame, Zap, ListOrdered, Scale,
} from 'lucide-react';
import useArtIds from '@/components/art/useArtIds';
import InstructionsModal from './InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, ProgressBar, Panel, KeyTile, GameButton, Segmented,
    ModeSelect, RoundBanner, ResultsScreen, FeedbackItem, useAppMeta,
} from './kit';
import './MayorMenor.css';


const TOTAL_TEST_QUESTIONS = 10;
const BASE_POINTS_PER_HIT = 200;
const TIME_BUDGET_PER_Q = 8;
const SPEED_COEF = 5;

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
            // Nivel 6: Combinación agresiva con posibles negativos
            const type = randomInt(1, 4);
            if (type === 1) { // Operación con decimales
                const a = formatDec(randomInt(-20, 20) + Math.random());
                const b = formatDec(randomInt(-10, 20) + Math.random());
                val = formatDec(a + b);
                text = `${a >= 0 ? a.toString().replace('.', ',') : '(' + a.toString().replace('.', ',') + ')'} + ${b >= 0 ? b.toString().replace('.', ',') : '(' + b.toString().replace('.', ',') + ')'}`;
            } else if (type === 2) { // Multiplicación decimal
                const a = randomInt(-5, 5);
                const b = formatDec(randomInt(1, 10) + 0.5);
                val = formatDec(a * b);
                text = `${a >= 0 ? a : '(' + a + ')'} x ${b.toString().replace('.', ',')}`;
            } else if (type === 3) { // Restas puras
                const a = randomInt(-10, 50);
                const b = randomInt(1, 50);
                val = a - b;
                text = `${a >= 0 ? a : '(' + a + ')'} - ${b}`;
            } else {
                val = formatDec(randomInt(-50, 100) + Math.random());
                text = val.toString().replace('.', ',');
            }
        }

        if (level < 6 && val < 0) val = 0;

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
        if (level < 6 && rightVal < 0) rightVal = 0;
        right = makeExpressionForValue(rightVal, false);
    }
    else if (level === 5) {
        // Comparar decimales con 2 cifras (padeadas) para evitar la confusión 5,5 vs 5,15
        const formatDisplay = (n) => n.toFixed(2).replace('.', ',');
        const base = randomInt(1, 99);
        const type = randomInt(1, 4);
        let valL, valR;

        if (type === 1) {
            // mismo entero, decimales distintos (trampa típica: 5,5 vs 5,15)
            valL = base + randomInt(10, 99) / 100;
            let rDec = randomInt(10, 99);
            while (rDec === Math.round((valL - base) * 100)) rDec = randomInt(10, 99);
            valR = base + rDec / 100;
        } else if (type === 2) {
            // Enteros distintos
            valL = base + randomInt(10, 99) / 100;
            let base2 = randomInt(1, 99);
            if (base2 === base) base2 = base + 1;
            valR = base2 + randomInt(10, 99) / 100;
        } else if (type === 3) {
            // Iguales (para el caso =)
            valL = base + randomInt(10, 99) / 100;
            valR = valL;
        } else {
            // Misma parte decimal, enteros distintos
            const dec = randomInt(10, 99);
            valL = base + dec / 100;
            valR = Math.max(1, base + randomInt(-3, 3)) + dec / 100;
            if (valR === valL) valR = valL + 1;
        }

        valL = formatDec(valL);
        valR = formatDec(valR);
        left = { text: formatDisplay(valL), value: valL };
        right = { text: formatDisplay(valR), value: valR };
    }
    else if (level === 6) {
        const isMult = Math.random() > 0.5;

        if (isMult) {
            const a = randomInt(-8, 8);
            const b = randomInt(1, 10) + 0.5;
            const val = formatDec(a * b);
            left = { text: `${a >= 0 ? a : '(' + a + ')'} x ${b.toString().replace('.', ',')}`, value: val };
            rightVal = val + (Math.random() * 2 - 1);
        } else {
            const a = formatDec(randomInt(-20, 20) + Math.random());
            const b = formatDec(randomInt(-10, 20) + Math.random());
            const val = formatDec(a + b);
            left = { text: `${a >= 0 ? a.toString().replace('.', ',') : '(' + a.toString().replace('.', ',') + ')'} + ${b >= 0 ? b.toString().replace('.', ',') : '(' + b.toString().replace('.', ',') + ')'}`, value: val };
            rightVal = val + (Math.random() * 0.5 - 0.25);
        }
        right = makeExpressionForValue(formatDec(rightVal), true);
    }

    if (Math.random() < 0.2) {
        right.value = left.value;
        if (level === 5) {
            right.text = Number(left.value).toFixed(2).replace('.', ',');
        } else if (level > 5) {
            right.text = left.value.toString().replace('.', ',');
        } else {
            right.text = left.value.toString();
        }
    }

    return { left, right };
};


/* ───────────────────────── Presentación ───────────────────────── */

// Solo para mostrar: «x» → «×» y «-» → «−» (el texto guardado no cambia).
const pretty = (text) => String(text ?? '')
    .replace(/ x /g, ' × ')
    .replace(/ - /g, ' − ')
    .replace(/\(-/g, '(−');

// Las expresiones muy largas pueden partirse en dos líneas.
const sizeClass = (text) => (String(text || '').length > 13 ? 'is-xlong' : '');

// Ancho aproximado del texto en «em» (cifras anchas, espacios y comas
// estrechos) para que la letra llene el bloque sin salirse (--em en el CSS).
const CHAR_EM = { ' ': 0.2, ',': 0.2, '.': 0.2, '(': 0.28, ')': 0.28, '-': 0.3, '×': 0.46, '+': 0.46, '−': 0.46 };
const textEm = (text) => {
    const em = [...String(text || '')].reduce((acc, ch) => acc + (CHAR_EM[ch] ?? 0.5), 0) * 1.08;
    return Math.max(1.4, String(text || '').length > 13 ? em / 1.8 : em);
};

const BLOCK_TONES = ['amber', 'sky', 'pink', 'mint', 'violet'];
// Color estable por ficha (sigue a la ficha cuando se intercambia).
const toneFor = (item) => BLOCK_TONES[Math.floor((item?.id || 0) * 1000) % BLOCK_TONES.length];

// Bloque numérico con volumen: cara con luz arriba-izquierda, brillo y canto.
const NumberBlock = ({ text, tone = 'amber', className = '' }) => {
    const shown = pretty(text);
    return (
        <div
            className={`mmz-block mmz-block--${tone} ${sizeClass(shown)} ${className}`}
            style={{ '--em': textEm(shown).toFixed(2) }}
        >
            <span className="mmz-block__gloss" aria-hidden="true" />
            <span className="mmz-block__text">{shown}</span>
        </div>
    );
};

const SIGN_STATE = { '<': 'lt', '>': 'gt', '=': 'eq' };
const UPPER_TEETH = [22, 32, 42, 52, 62, 72, 82, 92];
const LOWER_TEETH = [27, 37, 47, 57, 67, 77, 87];

// El cocodrilo comparador: sus mandíbulas dibujan el signo elegido.
// «>»: abre la boca hacia la izquierda (se come al número de la izquierda);
// «<»: se da la vuelta y abre hacia la derecha; «=»: mandíbulas paralelas;
// sin signo: boca cerrada y un «?». Solo transform/opacity en las transiciones.
const Croc = ({ sign, mood = '', shake = false }) => {
    const [id, url] = useArtIds();
    const st = SIGN_STATE[sign] || 'idle';
    return (
        <div className={`mmz-croc is-${st} ${mood ? `is-${mood}` : ''}`}>
            <div className={`mmz-croc__body ${shake ? 'gk-anim-shake' : ''}`}>
                <svg viewBox="0 0 140 112" className="mmz-croc__svg" aria-hidden="true">
                    <defs>
                        <linearGradient id={id('up')} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#bbf7d0" />
                            <stop offset=".35" stopColor="#4ade80" />
                            <stop offset="1" stopColor="#16a34a" />
                        </linearGradient>
                        <linearGradient id={id('low')} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#22c55e" />
                            <stop offset="1" stopColor="#15803d" />
                        </linearGradient>
                        <linearGradient id={id('head')} x1="0.1" y1="0" x2="0.9" y2="1">
                            <stop offset="0" stopColor="#86efac" />
                            <stop offset=".5" stopColor="#22c55e" />
                            <stop offset="1" stopColor="#166534" />
                        </linearGradient>
                        <linearGradient id={id('belly')} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#fef9c3" />
                            <stop offset="1" stopColor="#facc15" />
                        </linearGradient>
                        <linearGradient id={id('mouth')} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#fda4af" />
                            <stop offset="1" stopColor="#be123c" />
                        </linearGradient>
                        <radialGradient id={id('floor')} cx=".5" cy=".5" r=".5">
                            <stop offset="0" stopColor="#14532d" stopOpacity=".45" />
                            <stop offset="1" stopColor="#14532d" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    <ellipse cx="72" cy="103" rx="58" ry="7" fill={url('floor')} />

                    <g className="mmz-croc__flip">
                        {/* interior de la boca (solo se ve con la boca abierta) */}
                        <g className="mmz-croc__mouth">
                            <path d="M108 52 L24 26 Q17 56 24 86 L108 60 Z" fill={url('mouth')} />
                            <ellipse cx="84" cy="56" rx="16" ry="5" fill="#9f1239" opacity=".55" />
                        </g>

                        {/* mandíbula inferior */}
                        <g className="mmz-croc__jaw mmz-croc__jaw--low">
                            {LOWER_TEETH.map((x) => <path key={x} d={`M${x} 62.5 l3.2 -7 l3.2 7 Z`} fill="#fff" />)}
                            <path d="M110 62 L14 62 Q9 62 9 66.5 Q9.5 71 17 72 C42 75 80 78.5 110 80 Z" fill={url('low')} />
                            <path d="M18 72 C42 75 80 78.5 110 80 L110 76 C82 75 44 71.5 20 68.6 Z" fill={url('belly')} />
                            <path d="M14 63.6 H104" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
                        </g>

                        {/* mandíbula superior */}
                        <g className="mmz-croc__jaw mmz-croc__jaw--up">
                            {UPPER_TEETH.map((x) => <path key={x} d={`M${x} 49.5 l3.2 7 l3.2 -7 Z`} fill="#fff" />)}
                            <path d="M110 31 C84 31 44 34.5 20 38.8 Q8.5 41 8.5 46 Q8.8 50 13.5 50 L110 50 Z" fill={url('up')} />
                            <path d="M22 38.4 C46 34.4 82 31.6 104 31.6" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            <ellipse cx="18.5" cy="41.4" rx="2.6" ry="1.7" fill="#14532d" />
                            <ellipse cx="44" cy="40.5" rx="3.2" ry="1.6" fill="#15803d" opacity=".55" />
                            <ellipse cx="60" cy="38.6" rx="3.2" ry="1.6" fill="#15803d" opacity=".55" />
                            <ellipse cx="76" cy="37.2" rx="3.2" ry="1.6" fill="#15803d" opacity=".55" />
                        </g>

                        {/* cabeza con ojos */}
                        <g>
                            <path d="M100 30 Q100 21 111 21 H124 Q138 21 138 38 V73 Q138 89 122 89 H107 Q99 89 99 80 Z" fill={url('head')} />
                            <path d="M104 26 Q106 23.5 112 23.4" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            <ellipse cx="128" cy="78" rx="6" ry="3.4" fill="#fb7185" opacity=".45" />
                            <path d="M120 40 L126 37 L131 40" stroke="#166534" strokeOpacity=".45" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                            <path d="M118 50 L124 47 L130 50" stroke="#166534" strokeOpacity=".35" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                            {[110, 126].map((cx) => (
                                <g key={cx}>
                                    <circle cx={cx} cy="21" r="9.4" fill={url('head')} />
                                    <circle cx={cx} cy="20.4" r="6.6" fill="#fff" />
                                    <g>
                                        <circle cx={cx - 2.4} cy="21" r="3.6" fill="#1e1b4b" />
                                        <circle cx={cx - 3.4} cy="19.6" r="1.2" fill="#fff" />
                                    </g>
                                </g>
                            ))}
                        </g>
                    </g>
                </svg>
            </div>
            <span key={st} className="mmz-croc__badge gk-anim-pop" aria-label={sign ? `Signo ${sign}` : 'Sin signo'}>{sign || '?'}</span>
        </div>
    );
};

const SIGN_KEYS = [
    { sign: '<', cap: 'menor que' },
    { sign: '=', cap: 'igual a' },
    { sign: '>', cap: 'mayor que' },
];

const MayorMenorGame = ({ level, title, onGameComplete, fixedMode }) => {
    const meta = useAppMeta();
    // Pantalla previa de modos (CLAUDE.md §3): 'menu' → elegir Práctica/Examen; 'play' → partida.
    const [screen, setScreen] = useState('menu');
    const [gameMode, setGameMode] = useState(fixedMode || 'comparar'); // 'comparar' o 'ordenar'
    const [orderCount, setOrderCount] = useState(3);
    const [isTestMode, setIsTestMode] = useState(false);
    const [leftItem, setLeftItem] = useState({ text: '', value: 0 });
    const [rightItem, setRightItem] = useState({ text: '', value: 0 });
    const [orderItems, setOrderItems] = useState([]);
    const [selectedSign, setSelectedSign] = useState(null);
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [showHelp, setShowHelp] = useState(false);
    // Marcador de práctica (solo presentación; no se registra en ningún sitio).
    const [practiceHits, setPracticeHits] = useState(0);
    const [practiceStreak, setPracticeStreak] = useState(0);

    const [shakeError, setShakeError] = useState(false);

    const [testStats, setTestStats] = useState({
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        finished: false
    });
    const testStartRef = useRef(0);
    const [finalElapsed, setFinalElapsed] = useState(0);

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
        testStartRef.current = Date.now();
        setFinalElapsed(0);
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

    // --- Efecto para lanzar confeti al terminar el test con buena nota ---
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
        const l = Number(lVal);
        const r = Number(rVal);
        if (Math.abs(l - r) < 0.001) return '=';
        return l > r ? '>' : '<';
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
                    setFeedback({ text: 'Preparando el siguiente reto…', type: 'feedback-correct' });
                    setPracticeHits((h) => h + 1);
                    setPracticeStreak((s) => s + 1);
                    setTimeout(startPractice, 1500);
                } else {
                    setShakeError(true);
                    setTimeout(() => setShakeError(false), 500);
                    setPracticeStreak(0);
                    setFeedback({
                        text: `${pretty(leftItem.value.toString().replace('.', ','))} es ${correct === '>' ? 'MAYOR' : correct === '<' ? 'MENOR' : 'IGUAL'} que ${pretty(rightItem.value.toString().replace('.', ','))}`,
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
                    setFeedback({ text: 'El orden es correcto. Preparando el siguiente reto…', type: 'feedback-correct' });
                    setPracticeHits((h) => h + 1);
                    setPracticeStreak((s) => s + 1);
                    setTimeout(startPractice, 1500);
                } else {
                    setShakeError(true);
                    setTimeout(() => setShakeError(false), 500);
                    setPracticeStreak(0);
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
            const elapsed = Math.max(1, Math.round((Date.now() - testStartRef.current) / 1000));
            setFinalElapsed(elapsed);
            setTestStats(nextStats);
        }
    };

    // --- Cálculo de score con bonus por tiempo ---
    const timeBudget = TIME_BUDGET_PER_Q * TOTAL_TEST_QUESTIONS;
    const timeBonus = finalElapsed > 0
        ? Math.max(0, Math.round((timeBudget - finalElapsed) * SPEED_COEF))
        : 0;
    const basePoints = testStats.score * BASE_POINTS_PER_HIT;
    const examPoints = basePoints + timeBonus;
    const examMaxScore = TOTAL_TEST_QUESTIONS * BASE_POINTS_PER_HIT + timeBudget * SPEED_COEF;

    // Tracking de resultados
    const trackedRef = useRef(false);
    useEffect(() => {
        if (isTestMode && testStats.finished && !trackedRef.current && finalElapsed > 0) {
            trackedRef.current = true;
            onGameComplete?.({
                mode: 'test',
                score: examPoints,
                maxScore: examMaxScore,
                correctAnswers: testStats.score,
                totalQuestions: TOTAL_TEST_QUESTIONS,
                durationSeconds: finalElapsed,
            });
        }
        if (!testStats.finished) trackedRef.current = false;
    }, [isTestMode, testStats.finished, testStats.score, finalElapsed, examPoints, examMaxScore, onGameComplete]);

    // Teclado físico: «<», «=» y «>» eligen signo (solo presentación).
    const locked = !isTestMode && feedback.type === 'feedback-correct';
    const signSelectRef = useRef(handleSignSelect);
    signSelectRef.current = handleSignSelect;
    useEffect(() => {
        if (screen !== 'play' || gameMode !== 'comparar' || locked) return undefined;
        const onKey = (e) => {
            if (e.key === '<' || e.key === '>' || e.key === '=') signSelectRef.current(e.key);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [screen, gameMode, locked]);

    const isOrder = gameMode === 'ordenar';
    const shellProps = isOrder
        ? { accent: '#6366f1', accent2: '#ec4899' }
        : { accent: '#0d9488', accent2: '#0ea5e9' };
    const headerTitle = meta.name ? undefined : title;
    const backToMenu = () => { setIsTestMode(false); setScreen('menu'); };

    const instructions = (
        <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={isOrder ? 'Cómo se ordena' : 'Cómo se compara'}>
            <h3>🎯 Objetivo</h3>
            {isOrder ? (
                <p>Coloca los números (o los resultados de las operaciones) <strong>de menor a mayor</strong>, de izquierda a derecha.</p>
            ) : (
                <p>Decide si el número de la izquierda es <strong>mayor (&gt;)</strong>, <strong>menor (&lt;)</strong> o <strong>igual (=)</strong> que el de la derecha.</p>
            )}
            <h3>🕹️ Cómo se juega</h3>
            {isOrder ? (
                <ul>
                    <li>Pulsa el botón <strong>⇄</strong> que hay entre dos fichas para intercambiarlas.</li>
                    <li>Si hay operaciones, calcula primero su resultado.</li>
                    <li>Cuando creas que están en orden, pulsa <strong>Comprobar</strong>.</li>
                </ul>
            ) : (
                <ul>
                    <li>Pulsa <strong>&lt;</strong>, <strong>=</strong> o <strong>&gt;</strong> (o escríbelo con el teclado).</li>
                    <li>El cocodrilo siempre abre la boca hacia el número <strong>más grande</strong>: ¡se lo quiere comer!</li>
                    <li>Si hay operaciones, calcula primero su resultado.</li>
                </ul>
            )}
            <div className="instr-modes">
                <div className="instr-mode easy"><strong>Práctica</strong>Retos sin fin y corrección al momento.</div>
                <div className="instr-mode exam"><strong>Examen</strong>{TOTAL_TEST_QUESTIONS} retos seguidos sin corrección. Nota sobre 10 y puntos extra por rapidez.</div>
            </div>
            <div className="instr-tips"><strong>💡 Truco:</strong> en los decimales, compara primero la parte entera y después las décimas y las centésimas.</div>
        </InstructionsModal>
    );

    // Renderizado de Resultados
    if (isTestMode && testStats.finished) {
        const nota = Math.round((testStats.score / TOTAL_TEST_QUESTIONS) * 100) / 10;
        return (
            <GameShell {...shellProps}>
                <ResultsScreen
                    nota={nota}
                    points={examPoints}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${testStats.score}/${TOTAL_TEST_QUESTIONS}` },
                        { icon: Clock, tone: 'time', label: 'Tiempo', value: `${finalElapsed}s` },
                        { icon: Zap, tone: 'streak', label: 'Bonus rapidez', value: `+${timeBonus}` },
                    ]}
                    actions={[
                        { label: 'Repetir examen', onClick: startTest, icon: RefreshCw },
                        { label: 'Cambiar de modo', onClick: backToMenu, icon: LayoutGrid, variant: 'soft' },
                    ]}
                >
                    {testStats.answers.map((ans, idx) => (
                        <FeedbackItem
                            key={idx}
                            index={idx + 1}
                            ok={ans.isCorrect}
                            title={ans.right
                                ? <span className="mmz-fb-eq">{pretty(ans.left)} <b>{ans.user || '?'}</b> {pretty(ans.right)}</span>
                                : <span className="mmz-fb-eq">{pretty(ans.left).split(' | ').join('  ·  ')}</span>}
                        >
                            {gameMode === 'comparar'
                                ? (ans.isCorrect ? 'Signo correcto.' : <>El signo correcto era <strong>{ans.correct}</strong>.</>)
                                : (ans.isCorrect ? 'Orden correcto de menor a mayor.' : 'Ese orden no iba de menor a mayor.')}
                        </FeedbackItem>
                    ))}
                </ResultsScreen>
            </GameShell>
        );
    }

    // Pantalla previa: elegir modo (y cantidad de números si se ordena)
    if (screen === 'menu') {
        const modes = [
            {
                id: 'practice', tone: 'easy', title: 'Práctica',
                desc: isOrder ? 'Ordena sin prisa y comprueba cuando quieras.' : 'Elige el signo y el cocodrilo te dice al momento si aciertas.',
                features: ['Corrección al instante', 'Retos sin fin'],
            },
            {
                id: 'exam', tone: 'exam', title: 'Examen',
                desc: `${TOTAL_TEST_QUESTIONS} retos seguidos, sin ayudas. Al final verás tu nota.`,
                features: ['Nota sobre 10', 'Puntos extra por rapidez'],
            },
        ];
        const selectMode = (id) => {
            if (id === 'exam') {
                startTest();
            } else {
                setIsTestMode(false);
                startPractice();
            }
            setScreen('play');
        };
        const extra = (
            <>
                {!fixedMode && (
                    <div className="mmz-setting">
                        <span className="mmz-setting__label">Juego</span>
                        <Segmented
                            value={gameMode}
                            onChange={setGameMode}
                            options={[
                                { value: 'comparar', label: 'Comparar', icon: Scale },
                                { value: 'ordenar', label: 'Ordenar', icon: ListOrdered },
                            ]}
                        />
                    </div>
                )}
                {isOrder && (
                    <div className="mmz-setting">
                        <span className="mmz-setting__label">Números por reto</span>
                        <Segmented
                            value={orderCount}
                            onChange={setOrderCount}
                            options={[3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
                        />
                    </div>
                )}
            </>
        );
        return (
            <GameShell {...shellProps}>
                <ModeSelect
                    title={headerTitle}
                    modes={modes}
                    onSelect={selectMode}
                    onHelp={() => setShowHelp(true)}
                    extra={(isOrder || !fixedMode) ? extra : null}
                />
                {instructions}
            </GameShell>
        );
    }

    const isLast = testStats.currentIndex === TOTAL_TEST_QUESTIONS - 1;
    const boardState = isTestMode ? 'playing'
        : feedback.type === 'feedback-correct' ? 'won'
            : feedback.type === 'feedback-incorrect' ? 'lost' : 'playing';
    const qKey = isTestMode ? `t${testStats.currentIndex}` : `p${leftItem.text}|${rightItem.text}`;

    return (
        <GameShell {...shellProps}>
            <GameHeader
                title={headerTitle}
                mode={isTestMode ? 'exam' : 'easy'}
                modeLabel={isTestMode ? 'Examen' : 'Práctica'}
                onHelp={() => setShowHelp(true)}
                right={
                    <Hud>
                        {isTestMode ? (
                            <HudStat icon={Target} tone="progress" value={`${testStats.currentIndex + 1}/${TOTAL_TEST_QUESTIONS}`} label="Reto" />
                        ) : (
                            <>
                                <HudStat icon={Trophy} tone="good" value={practiceHits} label="Aciertos" />
                                <HudStat icon={Flame} tone="streak" value={practiceStreak} label="Racha" />
                            </>
                        )}
                    </Hud>
                }
            />

            {isTestMode && (
                <div className="mmz-progress">
                    <ProgressBar value={testStats.currentIndex} max={TOTAL_TEST_QUESTIONS} label="Progreso del examen" />
                </div>
            )}

            {gameMode === 'comparar' ? (
                <Panel variant="inset" className={`mmz-arena is-${boardState}`}>
                    <p className="mmz-prompt">¿Qué signo va en medio?</p>
                    <div className="mmz-duel">
                        <motion.div
                            key={`L-${qKey}`}
                            className="mmz-duel__side"
                            initial={{ opacity: 0, x: -24, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            <NumberBlock text={leftItem.text} tone="amber" />
                        </motion.div>
                        <Croc sign={selectedSign} mood={boardState === 'playing' ? '' : boardState} shake={shakeError} />
                        <motion.div
                            key={`R-${qKey}`}
                            className="mmz-duel__side"
                            initial={{ opacity: 0, x: 24, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
                        >
                            <NumberBlock text={rightItem.text} tone="sky" />
                        </motion.div>
                    </div>
                </Panel>
            ) : (
                <Panel variant="inset" className={`mmz-arena is-${boardState}`}>
                    <p className="mmz-prompt">Ordena de <strong>menor</strong> a <strong>mayor</strong></p>
                    <div className={`mmz-stairs ${shakeError ? 'gk-anim-shake' : ''}`} style={{ '--n': orderItems.length }}>
                        <span className="mmz-stairs__ramp" aria-hidden="true" />
                        {orderItems.map((item, idx) => (
                            <React.Fragment key={item.id}>
                                <motion.div
                                    className="mmz-slot"
                                    layout
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    style={{ '--i': idx }}
                                >
                                    <span className="mmz-slot__pos" aria-hidden="true">{idx + 1}º</span>
                                    <NumberBlock text={item.text} tone={toneFor(item)} />
                                </motion.div>
                                {idx < orderItems.length - 1 && (
                                    <div className="mmz-sep" style={{ '--i': idx }}>
                                        <span className="mmz-sep__lt" aria-hidden="true">&lt;</span>
                                        <button
                                            type="button"
                                            className="mmz-swap"
                                            onClick={() => swapItems(idx, idx + 1)}
                                            title="Intercambiar"
                                            aria-label={`Intercambiar las fichas ${idx + 1} y ${idx + 2}`}
                                            disabled={locked}
                                        >
                                            <ArrowLeftRight size={18} strokeWidth={2.6} />
                                        </button>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </Panel>
            )}

            {gameMode === 'comparar' && (
                <div className="mmz-signs" role="group" aria-label="Elige el signo">
                    {SIGN_KEYS.map((s) => (
                        <KeyTile
                            key={s.sign}
                            className="mmz-sign"
                            state={selectedSign === s.sign ? 'selected' : 'idle'}
                            onClick={() => handleSignSelect(s.sign)}
                            disabled={locked}
                            aria-label={`Signo ${s.cap}`}
                            aria-pressed={selectedSign === s.sign}
                        >
                            <span className="mmz-sign__glyph">{s.sign}</span>
                            <span className="mmz-sign__cap">{s.cap}</span>
                        </KeyTile>
                    ))}
                </div>
            )}

            <RoundBanner
                show={!isTestMode && !!feedback.text}
                status={feedback.type === 'feedback-correct' ? 'won' : 'lost'}
                title={feedback.type === 'feedback-correct' ? '¡Correcto!' : 'Incorrecto'}
                subtitle={feedback.text}
            />

            <div className="mmz-actions">
                {isTestMode ? (
                    <GameButton
                        size="lg"
                        iconRight={SkipForward}
                        onClick={checkAnswer}
                        disabled={gameMode === 'comparar' && !selectedSign}
                    >
                        {isLast ? 'Finalizar' : 'Siguiente'}
                    </GameButton>
                ) : (
                    <>
                        <GameButton
                            size="lg"
                            variant="success"
                            icon={Check}
                            onClick={checkAnswer}
                            disabled={locked || (gameMode === 'comparar' && !selectedSign)}
                        >
                            Comprobar
                        </GameButton>
                        <GameButton variant="soft" icon={SkipForward} onClick={startPractice} disabled={locked}>
                            Siguiente
                        </GameButton>
                    </>
                )}
            </div>

            <div className="mmz-footer">
                {!isTestMode ? (
                    <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToMenu}>Cambiar modo</GameButton>
                ) : (
                    <span className="mmz-footer__info">Modo examen · sin corrección hasta el final</span>
                )}
                <span className="mmz-footer__info mmz-footer__tip">
                    {gameMode === 'comparar' ? 'También puedes escribir < = >' : 'Usa ⇄ para intercambiar dos fichas vecinas'}
                </span>
            </div>

            {instructions}
        </GameShell>
    );
};

// Comparar (mayor/menor/igual) — fixedMode="comparar" para saltar la pantalla de seleccion.
// IMPORTANTE: {...props} va primero y "level" numerico al final para que no lo sobrescriba
// el "level" string (ej. "primaria") que pasa AppRunnerPage desde la URL.
export const MayorMenor1 = (props) => <MayorMenorGame {...props} level={1} title="Mayor, Menor o Igual (1º)" fixedMode="comparar" />;
export const MayorMenor2 = (props) => <MayorMenorGame {...props} level={2} title="Comparar hasta 100 (2º)" fixedMode="comparar" />;
export const MayorMenor3 = (props) => <MayorMenorGame {...props} level={3} title="Comparar Multiplicaciones (3º)" fixedMode="comparar" />;
export const MayorMenor4 = (props) => <MayorMenorGame {...props} level={4} title="Operaciones Combinadas (4º)" fixedMode="comparar" />;
export const MayorMenor5 = (props) => <MayorMenorGame {...props} level={5} title="Comparar Decimales (5º)" fixedMode="comparar" />;
export const MayorMenor6 = (props) => <MayorMenorGame {...props} level={6} title="Reto de Comparación (6º)" fixedMode="comparar" />;

// Ordenar (de menor a mayor) — fixedMode="ordenar"
export const OrdenaNumeros1 = (props) => <MayorMenorGame {...props} level={1} title="Ordena los Números (1º)" fixedMode="ordenar" />;
export const OrdenaNumeros2 = (props) => <MayorMenorGame {...props} level={2} title="Ordena hasta 100 (2º)" fixedMode="ordenar" />;
export const OrdenaNumeros3 = (props) => <MayorMenorGame {...props} level={3} title="Ordena Multiplicaciones (3º)" fixedMode="ordenar" />;
export const OrdenaNumeros4 = (props) => <MayorMenorGame {...props} level={4} title="Ordena Operaciones (4º)" fixedMode="ordenar" />;
export const OrdenaNumeros5 = (props) => <MayorMenorGame {...props} level={5} title="Ordena Decimales (5º)" fixedMode="ordenar" />;
export const OrdenaNumeros6 = (props) => <MayorMenorGame {...props} level={6} title="Reto de Ordenación (6º)" fixedMode="ordenar" />;

export default MayorMenorGame;
