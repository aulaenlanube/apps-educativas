// src/apps/entrenador-tabla/EntrenadorTabla.jsx
// Entrenador de la tabla periódica (rediseño 2026 sobre _shared/kit).
// Lo propio del juego: ficha de elemento estilo tabla periódica «premium» (la
// casilla que se pregunta brilla con «?» y al responder se revela entera con el
// color de su familia), opciones A-D o respuesta escrita (PRO) y repaso final
// con las fichas. Carga de datos, sesiones, reglas, puntos y tracking: sin cambios.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Atom, BookOpen, Clock, FlaskConical, Flame, LayoutGrid, ListChecks, PenLine, RefreshCw, Send, Target, Trophy, Zap,
} from 'lucide-react';
import { getAppContent } from '../../services/gameDataService';
import InstructionsModal from '../_shared/InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, ProgressBar, AnswerOption, GameButton, Segmented, ModeSelect,
    ResultsScreen, GameLoading, GameEmpty, Chip,
} from '../_shared/kit';
import './EntrenadorTabla.css';

import { FAMILIES, normalizeString } from '../_shared/QuimicaHelpers';
import PeriodicTableModal from '../_shared/PeriodicTableModal';

const LETTERS = ['A', 'B', 'C', 'D'];

// Ficha de elemento. `ask`: casilla que se pregunta ('name' | 'symbol');
// `revealed`: tras responder se ve entera con el color de su familia.
const ElementTile = ({ el, ask, revealed, state = '', size = 'lg' }) => {
    if (!el) return null;
    const fam = FAMILIES[el.category];
    const showSymbol = revealed || ask !== 'symbol';
    const showName = revealed || ask !== 'name';
    return (
        <div
            className={`etp-tile etp-tile--${size} ${revealed ? 'is-revealed' : 'is-hidden'} ${state ? `is-${state}` : ''}`}
            style={{ '--fam': fam?.color || '#a855f7' }}
        >
            <span className="etp-tile__gloss" aria-hidden="true" />
            <div className="etp-tile__top">
                <span className="etp-tile__z">{revealed ? el.atomicNumber : '··'}</span>
                {revealed && el.atomicMass && <span className="etp-tile__mass">{String(el.atomicMass).replace('.', ',')}</span>}
            </div>
            <div className="etp-tile__symbol">
                {showSymbol ? <span className={el.symbol.length > 2 ? 'is-long' : ''}>{el.symbol}</span> : <span className="etp-q">?</span>}
            </div>
            <div className="etp-tile__name">
                {showName ? <span className={el.name.length > 11 ? 'is-long' : ''}>{el.name}</span> : <span className="etp-q etp-q--sm">???</span>}
            </div>
            {revealed && fam && size === 'lg' && <div className="etp-tile__fam">{fam.label}</div>}
        </div>
    );
};

const EntrenadorTabla = ({ onGameComplete }) => {
    // Game State
    const [gameState, setGameState] = useState('setup'); // setup, playing, result
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Settings
    const [config, setConfig] = useState({
        gameMode: 'practice', // practice, exam, exam-pro
        scope: 'all', // all, category, range
        clueType: 'symbolToName', // symbolToName, nameToSymbol
        selectedCategories: [],
        range: [1, 118]
    });
    // Session State
    const [session, setSession] = useState({
        targets: [],
        currentIndex: 0,
        score: 0,
        streak: 0,
        startTime: null,
        answers: []
    });

    const [currentOptions, setCurrentOptions] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    // Solo presentación: repaso de la sesión y puntos mostrados en el resumen.
    const [review, setReview] = useState([]);
    const [finalStats, setFinalStats] = useState(null);
    // onGameComplete una sola vez por partida (se rearma al empezar otra)
    const reportedRef = useRef(false);

    // Initial load
    useEffect(() => {
        getAppContent('elementos-quimica')
            .then(data => {
                if (data && data.elements) {
                    setElements(data.elements);
                }
                setLoading(false);
            })
            .catch(err => console.error("Error cargando elementos:", err));
    }, []);

    // Filtered elements pool BASED ON CONFIG
    const pool = useMemo(() => {
        if (!elements.length) return [];
        let filtered = [...elements];

        if (config.scope === 'category' && config.selectedCategories.length > 0) {
            filtered = filtered.filter(e => config.selectedCategories.includes(e.category));
        } else if (config.scope === 'range') {
            filtered = filtered.filter(e => e.atomicNumber >= config.range[0] && e.atomicNumber <= config.range[1]);
        }

        return filtered;
    }, [elements, config.scope, config.selectedCategories, config.range]);

    // gameMode llega desde la pantalla de modos (antes se leía de config tras pulsarlo).
    const startSession = (gameMode = config.gameMode) => {
        if (!pool.length) return;

        // Shuffle and pick session targets
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const count = gameMode === 'practice' ? 20 : 10;
        const targets = shuffled.slice(0, Math.min(count, shuffled.length));

        setSession({
            targets,
            currentIndex: 0,
            score: 0,
            streak: 0,
            startTime: Date.now(),
            answers: []
        });
        setReview([]);
        setFinalStats(null);
        reportedRef.current = false;
        setGameState('playing');
        setUserInput('');
        generateNewQuestion(targets[0], targets);
    };


    const handleTextSubmit = (e) => {
        if (e) e.preventDefault();
        if (selectedAnswer || !userInput.trim()) return;

        const target = session.targets[session.currentIndex];
        const expected = config.clueType === 'symbolToName' ? target.name : target.symbol;

        const correct = normalizeString(userInput) === normalizeString(expected);

        // Simular el objeto de respuesta para la lógica existente
        handleAnswer(correct ? target : { symbol: 'WRONG' });
    };

    const generateNewQuestion = (target, allTargets) => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setUserInput('');

        // Generate 3 random wrong options from ALL elements
        const others = elements
            .filter(e => e.symbol !== target.symbol)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [...others, target].sort(() => Math.random() - 0.5);
        setCurrentOptions(options);
    };

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent double clicking

        const correct = answer.symbol === session.targets[session.currentIndex].symbol;
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        setReview((r) => [...r, { el: session.targets[session.currentIndex], ok: correct }]);

        if (correct) {
            setSession(s => ({ ...s, score: s.score + 1, streak: s.streak + 1 }));
            if (session.streak + 1 === 5) {
                confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
            }
        } else {
            setSession(s => ({ ...s, streak: 0 }));
        }

        setTimeout(() => {
            const nextIdx = session.currentIndex + 1;
            if (nextIdx < session.targets.length) {
                setSession(s => ({ ...s, currentIndex: nextIdx }));
                generateNewQuestion(session.targets[nextIdx], session.targets);
            } else {
                if (reportedRef.current) return;
                reportedRef.current = true;
                setGameState('result');
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                const finalScore = session.score + (correct ? 1 : 0);
                const total = session.targets.length;
                // Bonus por rapidez: 10s/pregunta de presupuesto
                const elapsedSec = session.startTime
                    ? Math.max(1, Math.round((Date.now() - session.startTime) / 1000))
                    : 0;
                const TIME_BUDGET = total * 10;
                const SPEED_COEF = 5;
                // El bonus se gana en proporción a los aciertos: sin aciertos no hay bonus.
                const timeBonus = elapsedSec > 0 && total > 0
                    ? Math.round(Math.max(0, (TIME_BUDGET - elapsedSec) * SPEED_COEF) * (finalScore / total))
                    : 0;
                setFinalStats({ points: finalScore * 100 + timeBonus, elapsedSec, timeBonus });
                onGameComplete?.({
                    // La práctica no cuenta como intento de examen en las tareas
                    mode: config.gameMode === 'practice' ? 'practice' : 'test',
                    score: finalScore * 100 + timeBonus,
                    maxScore: total * 100 + TIME_BUDGET * SPEED_COEF,
                    correctAnswers: finalScore,
                    totalQuestions: total,
                    durationSeconds: elapsedSec,
                });
            }
        }, 1200);
    };

    const toggleCategory = (cat) => {
        setConfig(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(cat)
                ? prev.selectedCategories.filter(c => c !== cat)
                : [...prev.selectedCategories, cat]
        }));
    };

    const currentTarget = session.targets[session.currentIndex];
    const isPro = config.gameMode === 'exam-pro';

    // PRO: el campo se desactiva al responder y pierde el foco; al llegar la
    // siguiente pregunta lo recuperamos para poder seguir escribiendo.
    const proInputRef = useRef(null);
    useEffect(() => {
        if (gameState === 'playing' && isPro && !selectedAnswer) proInputRef.current?.focus({ preventScroll: true });
    }, [gameState, isPro, selectedAnswer, session.currentIndex]);

    // Teclado físico: A-D o 1-4 eligen opción (no en PRO, que se escribe).
    useEffect(() => {
        if (gameState !== 'playing' || isPro || selectedAnswer) return undefined;
        const onKey = (e) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const k = String(e.key || '').toUpperCase();
            const idx = LETTERS.indexOf(k) >= 0 ? LETTERS.indexOf(k) : ['1', '2', '3', '4'].indexOf(k);
            if (idx >= 0 && currentOptions[idx]) handleAnswer(currentOptions[idx]);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }); // sin deps: usa siempre el handleAnswer del render actual

    // Familias con elementos en los datos (algunas claves de FAMILIES no se usan).
    const familyCounts = useMemo(() => elements.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
    }, {}), [elements]);

    const shellProps = { accent: '#a855f7', accent2: '#0891b2' };
    const modeTone = { practice: 'easy', exam: 'medium', 'exam-pro': 'exam' };
    const modeLabel = { practice: 'Práctica', exam: 'Examen', 'exam-pro': 'Examen PRO' };

    const getClueHint = () => {
        switch (config.clueType) {
            case 'symbolToName': return "¿Cómo se llama este elemento?";
            case 'nameToSymbol': return "¿Cuál es su símbolo químico?";
            case 'atomicToName': return "¿Qué elemento tiene este número atómico?";
            case 'protonsToName': return "¿Qué elemento tiene esta cantidad de protones?";
            case 'electronsToName': return "¿Cuántos electrones tiene un átomo neutro de este elemento?";
            default: return "";
        }
    };

    const getOptionLabel = (opt) => {
        if (config.clueType === 'nameToSymbol') return opt.symbol;
        return opt.name;
    };

    const instructions = (
        <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo se entrena">
            <h3>🎯 Objetivo</h3>
            <p>Reconoce los elementos químicos: di su <strong>nombre</strong> a partir del símbolo o su <strong>símbolo</strong> a partir del nombre.</p>
            <h3>🕹️ Cómo se juega</h3>
            <ul>
                <li>Elige antes el tipo de pregunta y si quieres toda la tabla o solo algunas familias.</li>
                <li>La casilla con <strong>?</strong> de la ficha es lo que tienes que responder.</li>
                <li>Pulsa una opción (o las teclas <kbd>A</kbd>–<kbd>D</kbd>). En el modo PRO escribe la respuesta (no importan las tildes).</li>
                <li>Encadena aciertos para subir la racha.</li>
            </ul>
            <div className="instr-modes">
                <div className="instr-mode easy"><strong>Práctica</strong>20 elementos con pista de descripción.</div>
                <div className="instr-mode medium"><strong>Examen</strong>10 elementos con cuatro opciones.</div>
                <div className="instr-mode exam"><strong>Examen PRO</strong>10 elementos sin opciones ni pistas: hay que escribir la respuesta.</div>
            </div>
            <div className="instr-tips"><strong>💡 Consejo:</strong> abre la <strong>tabla periódica</strong> desde la pantalla de inicio para repasar antes de empezar.</div>
        </InstructionsModal>
    );

    if (loading) {
        return (
            <GameShell {...shellProps}>
                <GameLoading label="Preparando el laboratorio…" />
            </GameShell>
        );
    }

    if (!elements.length) {
        return (
            <GameShell {...shellProps}>
                <GameHeader onHelp={() => setShowHelp(true)} />
                <GameEmpty title="No se han podido cargar los elementos">Vuelve a intentarlo dentro de un momento.</GameEmpty>
                {instructions}
            </GameShell>
        );
    }

    // --- Pantalla previa: modo + ajustes ---
    if (gameState === 'setup') {
        const modes = [
            {
                id: 'practice', tone: 'easy', title: 'Práctica', icon: FlaskConical,
                desc: '20 elementos con cuatro opciones y una pista con su descripción.',
                features: ['Pista de descripción', 'Racha de aciertos'],
            },
            {
                id: 'exam', tone: 'medium', title: 'Examen', icon: ListChecks,
                desc: '10 elementos con cuatro opciones. Al final verás tu nota.',
                features: ['Nota sobre 10', 'Puntos extra por rapidez'],
            },
            {
                id: 'exam-pro', tone: 'exam', title: 'Examen PRO', icon: PenLine,
                desc: '10 elementos sin opciones ni pistas: escribe tú la respuesta.',
                features: ['Respuesta escrita', 'Sin pistas'],
            },
        ];
        const selectMode = (id) => {
            setConfig((c) => ({ ...c, gameMode: id }));
            startSession(id);
        };
        const families = Object.entries(FAMILIES).slice(0, 11).filter(([key]) => familyCounts[key]);
        const extra = (
            <div className="etp-settings">
                <div className="etp-setting">
                    <span className="etp-setting__label">Pregunta</span>
                    <Segmented
                        value={config.clueType}
                        onChange={(v) => setConfig({ ...config, clueType: v })}
                        options={[
                            { value: 'symbolToName', label: 'Símbolo → Nombre' },
                            { value: 'nameToSymbol', label: 'Nombre → Símbolo' },
                        ]}
                    />
                </div>
                <div className="etp-setting">
                    <span className="etp-setting__label">Elementos</span>
                    <Segmented
                        value={config.scope}
                        onChange={(v) => setConfig({ ...config, scope: v })}
                        options={[
                            { value: 'all', label: `Toda la tabla (${elements.length})` },
                            { value: 'category', label: 'Por familias' },
                        ]}
                    />
                </div>
                {config.scope === 'category' && (
                    <motion.div className="etp-families" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                        {families.map(([key, data]) => {
                            const on = config.selectedCategories.includes(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`etp-fam ${on ? 'is-on' : ''}`}
                                    style={{ '--fam': data.color }}
                                    onClick={() => toggleCategory(key)}
                                    aria-pressed={on}
                                >
                                    <span className="etp-fam__dot" aria-hidden="true" />
                                    {data.label}
                                    <small>{familyCounts[key]}</small>
                                </button>
                            );
                        })}
                        <span className="etp-families__hint">
                            {config.selectedCategories.length === 0
                                ? 'Sin familias marcadas se usa toda la tabla.'
                                : `${pool.length} elementos seleccionados.`}
                        </span>
                    </motion.div>
                )}
            </div>
        );
        return (
            <GameShell {...shellProps}>
                <ModeSelect
                    modes={modes}
                    onSelect={selectMode}
                    onHelp={() => setShowHelp(true)}
                    onStudy={() => setShowTable(true)}
                    extra={extra}
                />
                <AnimatePresence>
                    {showTable && (
                        <PeriodicTableModal
                            elementsData={elements}
                            onClose={() => setShowTable(false)}
                        />
                    )}
                </AnimatePresence>
                {instructions}
            </GameShell>
        );
    }

    // --- Resultado ---
    if (gameState === 'result') {
        // Solo presentación: nota /10 (mismo cálculo que el tracker)
        const total = Math.max(1, session.targets.length);
        const nota = Math.round((session.score / total) * 100) / 10;
        return (
            <GameShell {...shellProps}>
                <ResultsScreen
                    title={config.gameMode === 'practice' ? 'Entrenamiento completado' : 'Examen terminado'}
                    subtitle={`${modeLabel[config.gameMode]} · ${config.clueType === 'symbolToName' ? 'Símbolo → Nombre' : 'Nombre → Símbolo'}`}
                    nota={nota}
                    points={finalStats?.points}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${session.score}/${session.targets.length}` },
                        ...(finalStats ? [
                            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${finalStats.elapsedSec}s` },
                            { icon: Zap, tone: 'streak', label: 'Bonus rapidez', value: `+${finalStats.timeBonus}` },
                        ] : []),
                    ]}
                    actions={[
                        { label: 'Volver a entrenar', onClick: () => startSession(), icon: RefreshCw },
                        { label: 'Cambiar de modo', onClick: () => setGameState('setup'), icon: LayoutGrid, variant: 'soft' },
                    ]}
                >
                    {review.length > 0 && (
                        <div className="etp-review">
                            <span className="etp-review__title"><Atom size={16} /> Tus elementos</span>
                            <div className="etp-review__grid">
                                {review.map((r, i) => (
                                    <ElementTile key={`${r.el.symbol}-${i}`} el={r.el} revealed size="sm" state={r.ok ? 'ok' : 'ko'} />
                                ))}
                            </div>
                        </div>
                    )}
                </ResultsScreen>
            </GameShell>
        );
    }

    // --- Partida ---
    const answered = !!selectedAnswer;
    const ask = config.clueType === 'nameToSymbol' ? 'symbol' : 'name';
    const progressValue = session.currentIndex + (answered ? 1 : 0);

    return (
        <GameShell {...shellProps}>
            <GameHeader
                mode={modeTone[config.gameMode]}
                modeLabel={modeLabel[config.gameMode]}
                onHelp={() => setShowHelp(true)}
                right={
                    <Hud className="etp-hud">
                        <HudStat icon={Target} tone="progress" value={`${session.currentIndex + 1}/${session.targets.length}`} label="Pregunta" />
                        <HudStat icon={Trophy} tone="good" value={session.score} label="Aciertos" />
                        <HudStat icon={Flame} tone="streak" value={`x${session.streak}`} label="Racha" />
                    </Hud>
                }
            />

            <div className="etp-progress">
                <ProgressBar value={progressValue} max={Math.max(1, session.targets.length)} label="Progreso" />
            </div>

            <div className={`etp-stage ${answered ? (isCorrect ? 'is-ok' : 'is-ko') : ''}`}>
                <div className="etp-card-col">
                    <motion.div
                        key={`q-${session.currentIndex}`}
                        className="etp-card-wrap"
                        initial={{ opacity: 0, scale: 0.85, y: 14, rotate: -3 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <ElementTile el={currentTarget} ask={ask} revealed={answered} state={answered ? (isCorrect ? 'ok' : 'ko') : ''} />
                    </motion.div>
                    {session.streak >= 3 && (
                        <span key={session.streak} className="etp-streak gk-anim-pop"><Flame size={15} /> ¡Racha de {session.streak}!</span>
                    )}
                </div>

                <div className="etp-play">
                    <p className="etp-hint">{getClueHint()}</p>

                    {config.gameMode !== 'exam-pro' && currentTarget?.description && (
                        <div className="etp-desc">
                            <BookOpen size={16} />
                            <span>{currentTarget.description.slice(0, 100)}...</span>
                        </div>
                    )}

                    {isPro ? (
                        <form onSubmit={handleTextSubmit} className="etp-pro">
                            <div className={`etp-pro__field ${answered ? (isCorrect ? 'is-ok' : 'is-ko') : ''}`}>
                                <PenLine size={20} className="etp-pro__icon" />
                                <input
                                    ref={proInputRef}
                                    type="text"
                                    className="etp-pro__input"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={config.clueType === 'symbolToName' ? "Nombre del elemento..." : "Símbolo..."}
                                    autoFocus
                                    autoComplete="off"
                                    spellCheck={false}
                                    disabled={answered}
                                    aria-label={getClueHint()}
                                />
                            </div>
                            {!answered && (
                                <GameButton type="submit" size="lg" iconRight={Send} disabled={!userInput.trim()}>Enviar</GameButton>
                            )}
                            {answered && !isCorrect && (
                                <div className="etp-reveal gk-anim-pop">
                                    La respuesta era: <strong>{config.clueType === 'symbolToName' ? currentTarget.name : currentTarget.symbol}</strong>
                                </div>
                            )}
                            {answered && isCorrect && (
                                <div className="etp-reveal is-ok gk-anim-pop">¡Correcto!</div>
                            )}
                        </form>
                    ) : (
                        <div className="etp-answers">
                            {currentOptions.map((opt, i) => {
                                const isTarget = opt.symbol === currentTarget.symbol;
                                const state = selectedAnswer === opt
                                    ? (isCorrect ? 'correct' : 'wrong')
                                    : (answered && isTarget ? 'correct' : 'idle');
                                return (
                                    <AnswerOption
                                        key={opt.symbol + i}
                                        letter={LETTERS[i]}
                                        state={state}
                                        className={`etp-answer ${answered && state === 'idle' ? 'is-dim' : ''}`}
                                        onClick={() => handleAnswer(opt)}
                                        disabled={answered}
                                    >
                                        {getOptionLabel(opt)}
                                    </AnswerOption>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="etp-footer">
                {config.gameMode === 'practice' ? (
                    <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setGameState('setup')}>Cambiar modo</GameButton>
                ) : (
                    <Chip icon={Atom}>{config.scope === 'category' && config.selectedCategories.length ? `${pool.length} elementos en juego` : 'Toda la tabla'}</Chip>
                )}
                <span className="etp-footer__info">
                    {isPro ? 'Escribe y pulsa Intro · no importan las tildes' : 'Teclas A–D para responder'}
                </span>
            </div>

            {instructions}
        </GameShell>
    );
};

export default EntrenadorTabla;
