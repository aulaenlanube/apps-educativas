// src/apps/juego-memoria/JuegoMemoria.jsx
// Rediseño 2026 sobre el kit de interfaz (_shared/kit). Pantalla previa con
// el tamaño del tablero y los ajustes (antes en un modal de configuración),
// fase de memorización con cuenta atrás, cartas con giro 3D (dorso rosa con
// lunares y número de tecla) y resumen con la nota. Reglas y tracking intactos.
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Check, Clock, Grid3x3, LayoutGrid, RefreshCw, Search, Settings2, Shuffle,
  Sparkles, Target, Timer, Hourglass, GraduationCap,
} from 'lucide-react';
import { getRunnerData } from '../../services/gameDataService';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressBar, Panel, Chip, GameButton,
  ModeSelect, Segmented, ResultsScreen, GameLoading, GameEmpty,
} from '../_shared/kit';
import './JuegoMemoria.css';

const GAME_TIME = 60; // 1 minute
const MEMORIZE_TIME = 5; // 5 seconds
// eslint-disable-next-line no-unused-vars
const FIXED_SEQUENCE = [4, 0, 8, 2, 6, 1, 7, 3, 5]; // Predefined non-sequential order for "Fixed" mode (LEGACY - NOT USED)

const JuegoMemoria = ({ level = 'eso', grade = 1, subjectId = 'biologia', onGameComplete }) => {
    const [words, setWords] = useState([]);
    const [targetOrder, setTargetOrder] = useState([]); // Random order to ask
    const [currentIndex, setCurrentIndex] = useState(0); // Index in targetOrder
    const [gameState, setGameState] = useState('loading'); // loading, memorize, playing, won, lost
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(MEMORIZE_TIME);
    const [revealedIndex, setRevealedIndex] = useState(null); // Temporarily revealed card index
    const [correctIndices, setCorrectIndices] = useState(new Set()); // Permanently revealed correct cards
    const [errorMsg, setErrorMsg] = useState(null);
    const [category, setCategory] = useState('');
    const [errorIndex, setErrorIndex] = useState(null);
    const [errorCountdown, setErrorCountdown] = useState(null); // Visual countdown for error state
    const [showHelp, setShowHelp] = useState(false);
    // State for Config
    const [gridSize, setGridSize] = useState(9); // 6, 9, 12
    const [gameTime, setGameTime] = useState(60); // 40, 60, 80
    const [errorWaitTime, setErrorWaitTime] = useState(2); // 1, 2, 3
    // Pantalla previa (CLAUDE.md §3): la partida no arranca hasta pulsar un tablero.
    const [started, setStarted] = useState(false);
    const [pendingStart, setPendingStart] = useState(false);

    // Config Options
    const TIME_OPTIONS = [40, 60, 80];
    const WAIT_OPTIONS = [1, 2, 3];

    const [isRandomOrder, setIsRandomOrder] = useState(false); // false = Sequential (Position 1), true = Random (Position 2)

    const timerRef = useRef(null);
    const trackedRef = useRef(false);

    // Tracking al terminar
    useEffect(() => {
        if ((gameState === 'won' || gameState === 'lost') && !trackedRef.current) {
            trackedRef.current = true;
            const won = gameState === 'won';
            const basePoints = correctIndices.size * 100;
            const timeBonus = won ? Math.max(0, Math.round(300 * (timeLeft / GAME_TIME))) : 0;
            const totalPoints = basePoints + timeBonus;
            onGameComplete?.({
                mode: 'test',
                score: totalPoints,
                maxScore: gridSize * 100 + 300,
                correctAnswers: correctIndices.size,
                totalQuestions: gridSize,
                durationSeconds: GAME_TIME - timeLeft,
            });
        }
        if (gameState === 'memorize' || gameState === 'playing') trackedRef.current = false;
    }, [gameState, correctIndices, gridSize, timeLeft, onGameComplete]);

    // Helper for robust shuffling
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Function to load words - Extracted to be reusable
    const fetchWords = async () => {
        try {
            setErrorMsg(null);
            const data = await getRunnerData(level, grade, subjectId);
            if (!data || Object.keys(data).length === 0) throw new Error("No se pudo cargar los datos");

            const categories = Object.keys(data);
            if (categories.length === 0) {
                setErrorMsg(`No hay categorías en ${subjectId}.`);
                return;
            }

            // Using dynamic gridSize here
            const validCategories = categories.filter(c => Array.isArray(data[c]) && data[c].length >= gridSize);

            let selectedWords = [];
            let selectedCategory = '';

            if (validCategories.length > 0) {
                selectedCategory = validCategories[Math.floor(Math.random() * validCategories.length)];
                selectedWords = data[selectedCategory];
            } else {
                selectedCategory = 'General';
                let allWords = [];
                Object.values(data).forEach(arr => {
                    if (Array.isArray(arr)) allWords = [...allWords, ...arr];
                });
                selectedWords = allWords;
            }

            selectedWords = [...new Set(selectedWords)];

            if (selectedWords.length < gridSize) {
                setErrorMsg(`No hay suficientes palabras para ${gridSize} cartas.`);
                return;
            }

            setCategory(selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace(/-/g, ' ').replace(/_/g, ' '));

            // Re-shuffle the selection
            const shuffled = shuffleArray(selectedWords);
            const selected = shuffled.slice(0, gridSize);
            setWords(selected);

            // ALWAYS START WITH A RANDOM SEQUENCE for this specific game
            const order = shuffleArray(Array.from({ length: gridSize }, (_, i) => i));
            setTargetOrder(order);

            // Reset Game Logic
            setCorrectIndices(new Set());
            setRevealedIndex(null);
            setCurrentIndex(0);
            setMemorizeTimeLeft(MEMORIZE_TIME);
            setTimeLeft(gameTime); // Use dynamic gameTime

            // Start Memorize
            setGameState('memorize');
        } catch (err) {
            console.error(err);
            setErrorMsg("Error cargando palabras.");
        }
    };

    // Initial Load (tras elegir tablero en la pantalla previa)
    useEffect(() => {
        if (!started) return;
        fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grade, subjectId]);

    // Arranque desde la pantalla previa: se lanza en el render siguiente a fijar
    // el tamaño del tablero para que fetchWords use la configuración elegida.
    useEffect(() => {
        if (!pendingStart) return;
        setPendingStart(false);
        fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingStart]);

    const handleNewGame = async () => {
        // 1. Hide everything immediately to avoid showcasing old words
        setCorrectIndices(new Set());
        setRevealedIndex(null);

        // 2. Vibrate/Shake to indicate change (while hidden)
        setGameState('shaking');
        await new Promise(r => setTimeout(r, 1000));

        // 3. Load new words immediately (this sets gameState to 'memorize')
        await fetchWords();
    };

    // Memorize Timer
    useEffect(() => {
        if (gameState === 'memorize') {
            const interval = setInterval(() => {
                setMemorizeTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setGameState('playing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);


    // Game Timer
    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 0.1;
                    if (next <= 0) {
                        clearInterval(timerRef.current);
                        setGameState('lost');
                        return 0;
                    }
                    return parseFloat(next.toFixed(1));
                });
            }, 100);
            return () => clearInterval(timerRef.current);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [gameState]);

    const handleBoxClick = (index) => {
        if (gameState !== 'playing') return;
        if (correctIndices.has(index)) return; // Already solved
        if (revealedIndex !== null) return; // Wait for animation

        // Always reveal the clicked box temporarily
        setRevealedIndex(index);

        const currentTargetIndex = targetOrder[currentIndex]; // The index we want


        // Check if correct
        if (index === currentTargetIndex) {
            // Correct!
            setTimeout(() => {
                // Add to correct set
                const newCorrect = new Set(correctIndices);
                newCorrect.add(index);
                setCorrectIndices(newCorrect);

                setRevealedIndex(null);

                if (newCorrect.size >= gridSize) {
                    setGameState('won');
                    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 }, zIndex: 3000 });
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 800);
        } else {
            // Incorrect
            setErrorIndex(index);
            setErrorCountdown(errorWaitTime); // Start countdown using Config

            // Update countdown every 100ms
            const interval = setInterval(() => {
                setErrorCountdown(prev => {
                    const next = prev - 0.1;
                    return next < 0 ? 0 : parseFloat(next.toFixed(1));
                });
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                setRevealedIndex(null);
                setErrorIndex(null);
                setErrorCountdown(null);

                // Reset progress (penalty)
                setCorrectIndices(new Set());
                setCurrentIndex(0);

                // Additional Difficulty: Reshuffle target order on failure if in Random Mode
                if (isRandomOrder) {
                    // Create a new shuffled array of indices 0..gridSize-1
                    const neOrder = shuffleArray(Array.from({ length: gridSize }, (_, i) => i));
                    setTargetOrder(neOrder);
                }
            }, errorWaitTime * 1000); // Use Config Wait Time (ms)
        }
    };

    // Keypad Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            const key = e.key.toLowerCase();

            // Numeric keys 1-9
            const numKey = parseInt(key);
            if (!isNaN(numKey) && numKey >= 1 && numKey <= 9 && numKey <= gridSize) {
                handleBoxClick(numKey - 1);
                return;
            }

            // Alpha keys for 10, 11, 12
            // 10 -> 'a', 11 -> 'b', 12 -> 'c'
            if (gridSize >= 10) {
                if (key === 'a') handleBoxClick(9); // Index 9 is box 10
                if (key === 'b' && gridSize >= 11) handleBoxClick(10); // Index 10 is box 11
                if (key === 'c' && gridSize >= 12) handleBoxClick(11); // Index 11 is box 12
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, revealedIndex, correctIndices, targetOrder, currentIndex, gridSize]);

    // --- Pantalla previa ---
    const empezar = (size) => {
        setGridSize(size);
        setStarted(true);
        setPendingStart(true);
    };

    // Volver a los ajustes: se para la partida (estado inicial 'loading', sin
    // relojes) y se ocultan las palabras.
    const volverAAjustes = () => {
        setStarted(false);
        setGameState('loading');
        setWords([]);
        setCorrectIndices(new Set());
        setRevealedIndex(null);
        setErrorIndex(null);
        setErrorCountdown(null);
        setErrorMsg(null);
    };

    const targetWord = words.length > 0 && targetOrder.length > 0 ? words[targetOrder[currentIndex]] : '';
    const shellProps = { accent: '#ec4899', accent2: '#8b5cf6', className: 'jm-shell' };

    const instrucciones = (
        <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Juego de Memoria">
            <h3>🎯 Objetivo</h3>
            <p>Encuentra las palabras ocultas, en el orden que se te piden, antes de que se agote el tiempo.</p>
            <h3>🕹️ Cómo se juega</h3>
            <ul>
                <li>Tienes <strong>{MEMORIZE_TIME} segundos</strong> al inicio para memorizar la ubicación de las palabras.</li>
                <li>Haz clic en una carta (o usa los números 1-9 y las letras A-C) para revelarla.</li>
                <li>Si aciertas, la carta se queda visible.</li>
                <li>Si fallas, la carta se marca en <strong>rojo</strong>, esperas {errorWaitTime} s y el progreso vuelve a empezar.</li>
            </ul>
            <h3>⚙️ Ajustes</h3>
            <ul>
                <li><strong>Orden fijo:</strong> se genera un orden al inicio y se mantiene toda la partida. Si fallas, sigues buscando la misma palabra.</li>
                <li><strong>Orden aleatorio:</strong> el orden se reorganiza cada vez que cometes un error.</li>
            </ul>
            <div className="instr-tips"><strong>🎓 Examen:</strong> todas las partidas cuentan para la nota (sobre 10).</div>
        </InstructionsModal>
    );

    // --- Pantalla previa: tablero y ajustes ---
    if (!started) {
        const modes = [
            { id: 6, tone: 'easy', icon: Grid3x3, title: '6 cartas', desc: 'Un tablero corto para entrar en calor.', features: ['Tablero 3 × 2', `${MEMORIZE_TIME} s para memorizar`] },
            { id: 9, tone: 'medium', icon: Grid3x3, title: '9 cartas', desc: 'El clásico: nueve posiciones que recordar.', features: ['Tablero 3 × 3', `${MEMORIZE_TIME} s para memorizar`] },
            { id: 12, tone: 'hard', icon: Brain, title: '12 cartas', desc: 'Para memorias de élite.', features: ['Tablero 4 × 3', `${MEMORIZE_TIME} s para memorizar`] },
        ];
        return (
            <GameShell {...shellProps}>
                <ModeSelect
                    modes={modes}
                    onSelect={empezar}
                    onHelp={() => setShowHelp(true)}
                    extra={(
                        <Panel variant="surface" className="jm-settings">
                            <div className="jm-settings__title"><Settings2 size={16} /> Ajustes de la partida</div>
                            <div className="jm-settings__row">
                                <span className="jm-settings__label"><Timer size={15} /> Tiempo de juego</span>
                                <Segmented size="sm" value={gameTime} onChange={setGameTime} options={TIME_OPTIONS.map((t) => ({ value: t, label: `${t} s` }))} />
                            </div>
                            <div className="jm-settings__row">
                                <span className="jm-settings__label"><Hourglass size={15} /> Espera tras fallo</span>
                                <Segmented size="sm" value={errorWaitTime} onChange={setErrorWaitTime} options={WAIT_OPTIONS.map((w) => ({ value: w, label: `${w} s` }))} />
                            </div>
                            <div className="jm-settings__row">
                                <span className="jm-settings__label"><Shuffle size={15} /> Orden</span>
                                <Segmented size="sm" value={isRandomOrder} onChange={setIsRandomOrder} options={[{ value: false, label: 'Fijo' }, { value: true, label: 'Aleatorio' }]} />
                            </div>
                        </Panel>
                    )}
                    footer={<span className="jm-foot"><GraduationCap size={15} /> Todas las partidas cuentan como examen · nota sobre 10</span>}
                />
                {instrucciones}
            </GameShell>
        );
    }

    // --- Resumen ---
    if (gameState === 'won' || gameState === 'lost') {
        const won = gameState === 'won';
        const nota = won ? 10 : Math.round((correctIndices.size / gridSize) * 100) / 10;
        const pts = correctIndices.size * 100 + (won ? Math.max(0, Math.round(300 * (timeLeft / GAME_TIME))) : 0);
        return (
            <GameShell {...shellProps}>
                <ResultsScreen
                    title={won ? '¡Enhorabuena!' : '¡Tiempo agotado!'}
                    subtitle={won ? '¡Has encontrado todas las palabras!' : 'Se acabó el tiempo.'}
                    nota={nota}
                    points={pts}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Encontradas', value: `${correctIndices.size}/${gridSize}` },
                        { icon: Clock, tone: 'time', label: 'Tiempo restante', value: `${Number(timeLeft).toFixed(1)}s` },
                        { icon: Sparkles, tone: 'accent', label: 'Categoría', value: category || '—' },
                    ]}
                    actions={[
                        { label: 'Jugar de nuevo', onClick: handleNewGame, icon: RefreshCw },
                        { label: 'Cambiar ajustes', onClick: volverAAjustes, icon: LayoutGrid, variant: 'soft' },
                    ]}
                />
                {instrucciones}
            </GameShell>
        );
    }

    const cols = gridSize === 12 ? 4 : 3;

    return (
        <GameShell {...shellProps}>
            <GameHeader
                mode="exam"
                modeLabel={`Examen · ${gridSize} cartas`}
                onHelp={() => setShowHelp(true)}
                right={(
                    <Hud>
                        <HudStat icon={Target} tone="good" value={`${correctIndices.size}/${gridSize}`} label="Encontradas" />
                        <HudStat
                            icon={Timer}
                            tone={gameState === 'playing' && timeLeft <= 10 ? 'bad' : 'time'}
                            value={gameState === 'memorize' ? `${memorizeTimeLeft}s` : `${Math.ceil(Number(timeLeft))}s`}
                            label={gameState === 'memorize' ? 'Memoriza' : 'Tiempo'}
                        />
                    </Hud>
                )}
            />

            {errorMsg ? (
                <GameEmpty title="No se puede empezar" action={<GameButton icon={LayoutGrid} onClick={volverAAjustes}>Cambiar ajustes</GameButton>}>
                    {errorMsg}
                </GameEmpty>
            ) : words.length === 0 ? (
                <GameLoading label="Repartiendo cartas…" />
            ) : (
                <>
                    <Panel variant="screen" className={`jm-target is-${gameState}`}>
                        {category && (
                            <span className={`jm-target__cat ${gameState === 'shaking' ? 'gk-anim-shake' : ''}`}>
                                <Sparkles size={13} /> {category.replace(/_/g, ' ')}
                            </span>
                        )}
                        <AnimatePresence mode="wait">
                            {gameState === 'memorize' ? (
                                <motion.div key="memo" className="jm-target__body" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                    <MemoRing left={memorizeTimeLeft} total={MEMORIZE_TIME} />
                                    <div className="jm-target__text">
                                        <span className="jm-target__label"><Brain size={14} /> Fase de memorización</span>
                                        <strong className="jm-target__word is-memo">¡Memoriza las posiciones!</strong>
                                    </div>
                                </motion.div>
                            ) : gameState === 'playing' ? (
                                <motion.div key="play" className="jm-target__body" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                    <span className="jm-target__scope" aria-hidden="true"><Search size={24} /></span>
                                    <div className="jm-target__text">
                                        <span className="jm-target__label">Encuentra</span>
                                        <motion.strong
                                            key={targetWord}
                                            className="jm-target__word"
                                            initial={{ opacity: 0, y: 10, scale: 0.92 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                                        >
                                            {targetWord}
                                        </motion.strong>
                                    </div>
                                    <span className="jm-target__step">{Math.min(currentIndex + 1, gridSize)}/{gridSize}</span>
                                </motion.div>
                            ) : (
                                <motion.div key="wait" className="jm-target__body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="jm-target__text">
                                        <span className="jm-target__label"><Shuffle size={14} /> Barajando</span>
                                        <strong className="jm-target__word is-memo">Nuevas cartas…</strong>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Panel>

                    {gameState === 'playing' && (
                        <ProgressBar value={timeLeft} max={gameTime} tone={timeLeft <= 10 ? 'bad' : timeLeft <= gameTime / 2 ? 'warn' : 'good'} label="Tiempo restante" />
                    )}

                    <div className={`jm-grid ${gameState === 'memorize' ? 'is-memorizing' : ''}`} style={{ '--jm-cols': cols }}>
                        {words.map((word, idx) => {
                            const isRevealed = gameState === 'memorize' ||
                                revealedIndex === idx ||
                                correctIndices.has(idx) ||
                                gameState === 'lost' ||
                                gameState === 'won';
                            const isCorrect = correctIndices.has(idx);
                            const isError = errorIndex === idx;
                            const isHit = revealedIndex === idx && !isError && gameState === 'playing';
                            return (
                                <button
                                    type="button"
                                    key={idx}
                                    className={[
                                        'jm-card',
                                        isRevealed && 'is-flipped',
                                        isCorrect && 'is-correct',
                                        isHit && 'is-hit',
                                        isError && 'is-error',
                                        gameState === 'shaking' && 'is-shaking',
                                    ].filter(Boolean).join(' ')}
                                    style={{ animationDelay: gameState === 'shaking' ? `${(idx % 4) * 0.05}s` : undefined }}
                                    onClick={() => handleBoxClick(idx)}
                                    aria-label={isRevealed ? String(word) : `Carta ${idx + 1}`}
                                >
                                    <span className="jm-card__inner">
                                        <span className="jm-card__back" aria-hidden="true">
                                            <span className="jm-card__num">{idx < 9 ? idx + 1 : String.fromCharCode(65 + (idx - 9))}</span>
                                        </span>
                                        <span className="jm-card__face">
                                            <span className="jm-card__word">{word}</span>
                                            {isCorrect && <span className="jm-card__check" aria-hidden="true"><Check size={13} strokeWidth={3.5} /></span>}
                                            {isError && (
                                                <span className="jm-card__penalty">
                                                    <Hourglass size={13} /> {Number(errorCountdown).toFixed(1)}
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            <div className="jm-footer">
                <GameButton variant="soft" size="sm" icon={Settings2} onClick={volverAAjustes}>Ajustes</GameButton>
                <GameButton variant="ghost" size="sm" icon={RefreshCw} onClick={handleNewGame} disabled={gameState === 'shaking'}>Nueva partida</GameButton>
                <span className="jm-footer__info">
                    <Chip tone="soft" icon={Timer}>{gameTime} s</Chip>
                    <Chip tone="soft" icon={Hourglass}>Espera {errorWaitTime} s</Chip>
                    <Chip tone="soft" icon={Shuffle}>{isRandomOrder ? 'Aleatorio' : 'Fijo'}</Chip>
                </span>
            </div>

            {instrucciones}
        </GameShell>
    );
};

// Cuenta atrás de la memorización: aro que se vacía cada segundo.
const MemoRing = ({ left, total }) => {
    const r = 22;
    const c = 2 * Math.PI * r;
    return (
        <span className="jm-memo-ring" role="timer" aria-label={`${left} segundos para memorizar`}>
            <svg viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r={r} className="jm-memo-ring__track" />
                <circle cx="28" cy="28" r={r} className="jm-memo-ring__arc" strokeDasharray={c} strokeDashoffset={c * (1 - left / total)} transform="rotate(-90 28 28)" />
            </svg>
            <span key={left} className="jm-memo-ring__num">{left}</span>
        </span>
    );
};

export default JuegoMemoria;
