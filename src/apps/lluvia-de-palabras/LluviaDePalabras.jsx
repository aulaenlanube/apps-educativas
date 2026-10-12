import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeftRight, Play, RefreshCw, Lightbulb, LightbulbOff, Pause, LayoutGrid, ArrowLeft,
    Sprout, Flame, GraduationCap, Droplets, Gauge, Rabbit, Turtle, Zap, Star, Inbox,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRunnerData } from '../../services/gameDataService';
import InstructionsModal from '../_shared/InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, Lives, GameButton, ModeSelect, ResultsScreen,
    GameLoading, GameEmpty,
} from '../_shared/kit';
import './LluviaDePalabras.css';

const SPAWN_RATE_START = 2000;
const INITIAL_SPEED = 0.15;
const SPEED_INCREMENT_PER_LEVEL = 0.001;
const SPAWN_DECREMENT_PER_LEVEL = 25;

// Modificador de nota segun la velocidad elegida en el examen
const EXAM_SUBMODE_MODIFIER = { slow: -1, normal: 0, fast: 1 };

// Colores fijos para las categorías (clases de LluviaDePalabras.css; solo aspecto)
const CATEGORY_COLORS = ['llv-c0', 'llv-c1', 'llv-c2', 'llv-c3', 'llv-c4'];

const LluviaDePalabras = ({ onGameComplete } = {}) => {
    // eslint-disable-next-line no-unused-vars
    const { toast } = useToast();
    const { level, grade, subjectId } = useParams();
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [gamePhase, setGamePhase] = useState('loading');
    const [difficulty, setDifficulty] = useState('medium');
    const [examSubMode, setExamSubMode] = useState(null); // 'slow' | 'normal' | 'fast'
    const [showExamMenu, setShowExamMenu] = useState(false);
    const [configData, setConfigData] = useState(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [showHelp, setShowHelp] = useState(false);
    const [showCheatSheet, setShowCheatSheet] = useState(false);
    const [boxAnimation, setBoxAnimation] = useState({ col: null, type: null });

    const [categories, setCategories] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [fallingWords, setFallingWords] = useState([]);

    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    const difficultyRef = useRef(0);
    const speedRef = useRef(INITIAL_SPEED);
    const baseSpeedRef = useRef(INITIAL_SPEED);
    const baseSpawnRef = useRef(SPAWN_RATE_START);
    const trackedRef = useRef(false);
    const gameStartRef = useRef(0);

    useEffect(() => {
        if (gamePhase === 'gameOver' && !trackedRef.current) {
            trackedRef.current = true;
            const wordsCollected = Math.floor(score / 10);
            const TARGET_WORDS = 30;
            const isExam = difficulty === 'hard';
            const baseNota = Math.min((wordsCollected / TARGET_WORDS) * 10, 10);
            const modifier = isExam ? (EXAM_SUBMODE_MODIFIER[examSubMode] || 0) : 0;
            // La nota final puede salir fuera del rango 0-10 por los modificadores
            const finalNota = isExam
                ? Math.max(0, Math.round((baseNota + modifier) * 10) / 10)
                : Math.round(baseNota * 10) / 10;
            // Bonus por rapidez: presupuesto 60s para 30 palabras (2s/palabra)
            const elapsedSec = gameStartRef.current
                ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
                : 0;
            const TIME_BUDGET = TARGET_WORDS * 2;
            const SPEED_COEF = 5;
            const timeBonus = isExam && elapsedSec > 0
                ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
                : 0;
            const finalScore = score + timeBonus;
            const maxScoreFinal = TARGET_WORDS * 10 + (isExam ? TIME_BUDGET * SPEED_COEF : 0);
            onGameComplete?.({
                mode: isExam ? 'test' : 'practice',
                score: finalScore,
                maxScore: maxScoreFinal,
                correctAnswers: wordsCollected,
                totalQuestions: TARGET_WORDS,
                durationSeconds: elapsedSec || undefined,
                nota: finalNota,
            });
        }
        if (gamePhase !== 'gameOver') trackedRef.current = false;
    }, [gamePhase, score, difficulty, examSubMode, onGameComplete]);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadGameData = async () => {
            setGamePhase('loading');
            try {
                if (!subjectId) {
                    const mockData = {
                        "Sustantivos": ["Casa", "Perro", "Árbol", "Mesa"],
                        "Verbos": ["Correr", "Saltar", "Comer", "Dormir"],
                        "Adjetivos": ["Rojo", "Grande", "Rápido", "Feliz"]
                    };
                    setConfigData({ title: "Prueba de Gramática", ...mockData });
                    setGamePhase('menu');
                    return;
                }
                const json = await getRunnerData(level, grade, subjectId);
                if (!json || Object.keys(json).length === 0) throw new Error("Datos no encontrados");
                setConfigData(json);
                setGamePhase('menu');
            } catch (error) {
                console.error("Error:", error);
                setConfigData({ "Cat A": ["A1"], "Cat B": ["B1"] });
                setGamePhase('menu');
            }
        };
        loadGameData();
    }, [level, grade, subjectId]);

    // --- INICIAR JUEGO ---
    const startGame = (selectedDifficulty, customSpeed = INITIAL_SPEED, customSpawn = SPAWN_RATE_START, subMode = null) => {
        if (!configData) return;

        setDifficulty(selectedDifficulty);
        setExamSubMode(selectedDifficulty === 'hard' ? subMode : null);
        setScore(0);
        setLives(3);
        setFallingWords([]);
        setShowHelp(false);
        difficultyRef.current = 0;

        baseSpeedRef.current = customSpeed;
        speedRef.current = customSpeed;
        baseSpawnRef.current = customSpawn;

        lastSpawnTime.current = performance.now();
        gameStartRef.current = Date.now();
        setBoxAnimation({ col: null, type: null });

        // Obtener claves válidas
        const allCategoriesKeys = Object.keys(configData).filter(k => k !== 'title' && k !== 'instructions');

        // SHUFFLE ROBUSTO (Fisher-Yates)
        const shuffledKeys = [...allCategoriesKeys];
        for (let i = shuffledKeys.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledKeys[i], shuffledKeys[j]] = [shuffledKeys[j], shuffledKeys[i]];
        }

        const numCategories = selectedDifficulty === 'easy' ? 2 : Math.min(3, shuffledKeys.length);
        const selectedKeys = shuffledKeys.slice(0, numCategories);

        // Mezclar también los colores para que no salgan siempre en el mismo orden
        const shuffledColors = [...CATEGORY_COLORS].sort(() => Math.random() - 0.5);

        const processedCategories = selectedKeys.map((key, index) => ({
            id: `cat-${index}-${Date.now()}`,
            originalId: index,
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            color: shuffledColors[index % shuffledColors.length]
        }));

        const processedWords = [];
        selectedKeys.forEach((key, index) => {
            const currentCat = processedCategories[index];
            const wordsList = configData[key];

            if (wordsList && Array.isArray(wordsList) && currentCat) {
                wordsList.forEach(wordText => {
                    processedWords.push({
                        text: wordText,
                        categoryId: currentCat.id
                    });
                });
            }
        });

        setCategories(processedCategories);
        setAvailableWords(processedWords);
        setGamePhase('playing');
        setShowExamMenu(false);
    };

    const togglePause = () => {
        if (gamePhase === 'playing') setGamePhase('paused');
        else if (gamePhase === 'paused') {
            lastSpawnTime.current = performance.now();
            setGamePhase('playing');
        }
    };

    const returnToMenu = () => {
        setGamePhase('menu');
        setFallingWords([]);
        setShowCheatSheet(false);
    };

    const swapCategories = (indexA, indexB) => {
        if (gamePhase !== 'playing') return;
        setCategories(prev => {
            const newCats = [...prev];
            [newCats[indexA], newCats[indexB]] = [newCats[indexB], newCats[indexA]];
            return newCats;
        });
    };

    const triggerBoxAnim = (colIndex, type) => {
        setBoxAnimation({ col: colIndex, type });
        setTimeout(() => setBoxAnimation({ col: null, type: null }), 400);
    };

    // --- LOOP DEL JUEGO ---
    const updateGame = useCallback((time) => {
        if (gamePhase !== 'playing') return;

        const currentSpawnRate = Math.max(
            800,
            baseSpawnRef.current - (difficultyRef.current * SPAWN_DECREMENT_PER_LEVEL)
        );

        if (time - lastSpawnTime.current > currentSpawnRate) {
            if (availableWords.length > 0) {
                const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
                const randomCol = Math.floor(Math.random() * categories.length);

                const newWord = {
                    id: Date.now() + Math.random(),
                    text: randomWord.text,
                    categoryId: randomWord.categoryId,
                    colIndex: randomCol,
                    y: -15
                };
                setFallingWords(prev => [...prev, newWord]);
            }
            lastSpawnTime.current = time;
        }

        setFallingWords(prevWords => {
            const nextWords = [];
            let livesLost = 0;
            let eventHappened = null;

            prevWords.forEach(word => {
                const newY = word.y + speedRef.current;

                // Colisión ajustada al nuevo diseño (84%)
                if (newY >= 84) {
                    const targetCategory = categories[word.colIndex];

                    if (targetCategory && targetCategory.id === word.categoryId) {
                        setScore(s => {
                            const nextS = s + 10;
                            if (difficulty === 'hard' && nextS >= 300) {
                                setGamePhase('gameOver');
                            }
                            return nextS;
                        });
                        difficultyRef.current += 1;
                        speedRef.current = baseSpeedRef.current + (difficultyRef.current * SPEED_INCREMENT_PER_LEVEL);
                        eventHappened = { col: word.colIndex, type: 'success' };
                    } else if (targetCategory) {
                        livesLost++;
                        difficultyRef.current = Math.max(0, difficultyRef.current - 10);
                        speedRef.current = baseSpeedRef.current + (difficultyRef.current * SPEED_INCREMENT_PER_LEVEL);
                        eventHappened = { col: word.colIndex, type: 'error' };
                    }
                } else {
                    nextWords.push({ ...word, y: newY });
                }
            });

            if (livesLost > 0) {
                setLives(prevLives => {
                    const newLives = prevLives - livesLost;
                    if (newLives <= 0) {
                        setGamePhase('gameOver');
                    }
                    return newLives;
                });
            }

            if (eventHappened) {
                triggerBoxAnim(eventHappened.col, eventHappened.type);
            }

            return nextWords;
        });
        requestRef.current = requestAnimationFrame(updateGame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gamePhase, availableWords, categories]);

    useEffect(() => {
        if (gamePhase === 'playing') {
            requestRef.current = requestAnimationFrame(updateGame);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gamePhase, updateGame]);

    const getBoxAnimation = (index) => {
        if (boxAnimation.col !== index) return {};

        if (boxAnimation.type === 'success') {
            return {
                scale: [1, 1.05, 1],
                y: [0, 5, 0],
                boxShadow: [
                    "0px 0px 0px rgba(0,0,0,0)",
                    "0px 0px 30px rgba(236, 72, 153, 0.8), 0px 0px 60px rgba(168, 85, 247, 0.8)",
                    "0px 0px 0px rgba(0,0,0,0)"
                ],
                transition: { duration: 0.4 }
            };
        }
        if (boxAnimation.type === 'error') {
            return {
                rotate: [0, -5, 5, -3, 3, 0],
                scale: [1, 0.95, 1],
                boxShadow: [
                    "0px 0px 0px rgba(0,0,0,0)",
                    "inset 0px 0px 40px rgba(0, 0, 0, 0.9)",
                    "0px 0px 0px rgba(0,0,0,0)"
                ],
                transition: { duration: 0.4 }
            };
        }
    };

    // --- PRESENTACIÓN (rediseño 2026 con el kit) ---
    const [showInstructions, setShowInstructions] = useState(false);

    // Velocidades del examen: mismos valores de siempre (se pasan a startGame)
    const EXAM_SPEEDS = {
        slow: { speed: 0.10, spawn: 2500 },
        normal: { speed: 0.15, spawn: 2000 },
        fast: { speed: 0.22, spawn: 1500 },
    };
    const shellProps = { accent: '#0ea5e9', accent2: '#8b5cf6', className: 'llv' };
    const isExamMode = difficulty === 'hard';
    const modeTone = difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'exam';
    const speedLabel = examSubMode === 'slow' ? 'Lento' : examSubMode === 'fast' ? 'Rápido' : examSubMode === 'normal' ? 'Normal' : null;

    // Como antes: abrir la guía (o las instrucciones) en plena partida la pausa
    const openGuide = () => {
        if (gamePhase === 'playing') setGamePhase('paused');
        setShowCheatSheet(true);
    };
    const openInstructions = () => {
        if (gamePhase === 'playing') setGamePhase('paused');
        setShowInstructions(true);
    };

    const modals = (
        <>
            <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Cómo jugar a Lluvia de Palabras">
                <h3>🎯 Objetivo</h3>
                <p>
                    Las palabras caen del cielo: haz que cada una caiga en la <strong>caja de su categoría</strong>.
                    Cada acierto suma 10 puntos y la lluvia se acelera poco a poco.
                </p>
                <h3>🕹️ Cómo se juega</h3>
                <ul>
                    <li>Las palabras no se mueven de columna: lo que mueves son las <strong>cajas</strong>.</li>
                    <li>Pulsa la <strong>gema</strong> que hay entre dos cajas para intercambiarlas.</li>
                    <li>Si una palabra cae en la caja equivocada pierdes una vida. Tienes 3.</li>
                    <li>En Fácil y Medio puedes activar la <strong>ayuda de colores</strong>: cada palabra toma el color de su caja.</li>
                </ul>
                <h3>🎓 Modos de juego</h3>
                <div className="instr-modes">
                    <div className="instr-mode easy"><strong>Fácil</strong> 2 cajas y ayuda de colores.</div>
                    <div className="instr-mode medium"><strong>Medio</strong> 3 cajas y ayuda de colores.</div>
                    <div className="instr-mode exam"><strong>Examen</strong> 3 cajas sin ayudas. 30 palabras = un 10. Lento −1 punto · Rápido +1 punto.</div>
                </div>
            </InstructionsModal>
            <InstructionsModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} title="Guía de palabras">
                <div className="llv-guide">
                    {configData && Object.entries(configData)
                        .filter(([key, words]) => key !== 'title' && key !== 'instructions' && Array.isArray(words))
                        .map(([category, words]) => (
                            <section key={category} className="llv-guide__cat">
                                <h4 className="llv-guide__title">{category.replace(/_/g, ' ')}</h4>
                                <div className="llv-guide__words">
                                    {words.map((word, wIdx) => <span key={wIdx} className="llv-guide__chip">{word}</span>)}
                                </div>
                            </section>
                        ))}
                </div>
            </InstructionsModal>
        </>
    );

    if (gamePhase === 'loading') {
        return (
            <GameShell {...shellProps}>
                <GameLoading label="Preparando la tormenta…" />
            </GameShell>
        );
    }
    if (!configData) {
        return (
            <GameShell {...shellProps}>
                <GameEmpty title="No hay datos">No hay palabras para esta asignatura.</GameEmpty>
            </GameShell>
        );
    }

    // 1. PANTALLA PREVIA (modos y, para el examen, velocidad)
    if (gamePhase === 'menu') {
        if (showExamMenu) {
            return (
                <GameShell {...shellProps}>
                    <ModeSelect
                        title="Examen"
                        description="Elige la velocidad de la lluvia. La velocidad modifica la nota final."
                        modes={[
                            { id: 'slow', tone: 'easy', icon: Turtle, title: 'Lento', desc: 'Más tiempo para pensar cada palabra.', features: ['Resta 1 punto a la nota'], cta: 'Empezar' },
                            { id: 'normal', tone: 'medium', icon: Gauge, title: 'Normal', desc: 'La velocidad equilibrada de siempre.', features: ['Nota sin cambios'], cta: 'Empezar' },
                            { id: 'fast', tone: 'exam', icon: Rabbit, title: 'Rápido', desc: '¡Solo para expertos!', features: ['Suma 1 punto (puede superar el 10)'], cta: 'Empezar' },
                        ]}
                        onSelect={(id) => startGame('hard', EXAM_SPEEDS[id].speed, EXAM_SPEEDS[id].spawn, id)}
                        onHelp={() => setShowInstructions(true)}
                        extra={<GameButton variant="ghost" icon={ArrowLeft} onClick={() => setShowExamMenu(false)}>Volver a los modos</GameButton>}
                    />
                    {modals}
                </GameShell>
            );
        }
        return (
            <GameShell {...shellProps}>
                <ModeSelect
                    description={configData.instructions || 'Haz que cada palabra caiga en la caja de su categoría. ¡Usa las gemas mágicas para intercambiar las cajas!'}
                    modes={[
                        { id: 'easy', tone: 'easy', icon: Sprout, title: 'Fácil', desc: 'Dos cajas y la lluvia más tranquila.', features: ['2 cajas', 'Ayuda de colores'] },
                        { id: 'medium', tone: 'medium', icon: Flame, title: 'Medio', desc: 'Tres cajas: más palabras que ordenar.', features: ['3 cajas', 'Ayuda de colores'] },
                        { id: 'hard', tone: 'exam', icon: GraduationCap, title: 'Examen', desc: 'Tres cajas sin ayudas. Tú eliges la velocidad.', features: ['Nota sobre 10', 'Velocidad: −1 / 0 / +1'] },
                    ]}
                    onSelect={(id) => (id === 'hard' ? setShowExamMenu(true) : startGame(id))}
                    onHelp={() => setShowInstructions(true)}
                    onStudy={() => setShowCheatSheet(true)}
                />
                {modals}
            </GameShell>
        );
    }

    // 2. FIN DE PARTIDA
    if (gamePhase === 'gameOver') {
        const isExam = difficulty === 'hard';
        const correctWords = score / 10;
        const baseNotaNum = Math.min((correctWords / 30) * 10, 10);
        const modifier = isExam ? (EXAM_SUBMODE_MODIFIER[examSubMode] || 0) : 0;
        const finalNotaNum = isExam
            ? Math.max(0, Math.round((baseNotaNum + modifier) * 10) / 10)
            : Math.round(baseNotaNum * 10) / 10;
        const baseGrade = baseNotaNum.toFixed(1).replace('.', ',');
        const examGrade = finalNotaNum.toFixed(1).replace('.', ',');
        const hasPassedExam = isExam && correctWords >= 30;

        if (isExam) {
            return (
                <GameShell {...shellProps}>
                    <ResultsScreen
                        title={hasPassedExam ? '¡Examen superado!' : 'Examen terminado'}
                        subtitle={hasPassedExam ? '¡Enhorabuena! Has conseguido todas las palabras.' : undefined}
                        nota={finalNotaNum}
                        points={score}
                        stats={[
                            { icon: Droplets, tone: 'good', label: 'Palabras', value: `${correctWords}/30` },
                            { icon: Gauge, tone: 'time', label: 'Velocidad', value: speedLabel || 'Normal' },
                            { icon: Zap, tone: 'streak', label: 'Modificador', value: modifier > 0 ? `+${modifier}` : String(modifier) },
                        ]}
                        actions={[
                            { label: 'Repetir examen', onClick: () => { returnToMenu(); setShowExamMenu(true); }, icon: RefreshCw },
                            { label: 'Cambiar de modo', onClick: () => { returnToMenu(); setShowExamMenu(false); }, icon: LayoutGrid, variant: 'soft' },
                        ]}
                    >
                        {modifier !== 0 && (
                            <div className={`llv-breakdown ${modifier > 0 ? 'is-up' : 'is-down'}`}>
                                <span className="llv-breakdown__item"><small>Nota base</small><b>{baseGrade}</b></span>
                                <span className="llv-breakdown__op">{modifier > 0 ? '+' : '−'}</span>
                                <span className="llv-breakdown__item is-mod"><small>Modo {speedLabel}</small><b>{Math.abs(modifier)}</b></span>
                                <span className="llv-breakdown__op">=</span>
                                <span className="llv-breakdown__item is-total"><small>Nota final</small><b>{examGrade}</b></span>
                            </div>
                        )}
                    </ResultsScreen>
                    {modals}
                </GameShell>
            );
        }

        return (
            <GameShell {...shellProps}>
                <GameHeader mode={modeTone} onHelp={() => setShowInstructions(true)} />
                <motion.div
                    className="llv-over"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 170, damping: 20 }}
                >
                    <div className="llv-over__art" aria-hidden="true"><RainCloud /></div>
                    <span className="llv-over__kicker">Partida terminada</span>
                    <strong className="llv-over__num">{correctWords}</strong>
                    <span className="llv-over__unit">palabras atrapadas</span>
                    <div className="llv-over__chips">
                        <span className="llv-over__chip"><Star size={15} /> <b>{score}</b> puntos</span>
                        <span className="llv-over__chip"><GraduationCap size={15} /> Nota orientativa <b>{examGrade}</b></span>
                    </div>
                    <div className="llv-over__actions">
                        <GameButton size="lg" icon={RefreshCw} onClick={() => startGame(difficulty)} autoFocus>Reintentar</GameButton>
                        <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={returnToMenu}>Cambiar de modo</GameButton>
                    </div>
                </motion.div>
                {modals}
            </GameShell>
        );
    }

    // 3. JUEGO ACTIVO
    const numCols = categories.length;
    const colWidthPercent = 100 / numCols;
    const canShowHelp = showHelp && difficulty !== 'hard';

    return (
        <GameShell {...shellProps}>
            <GameHeader
                mode={modeTone}
                modeLabel={isExamMode && speedLabel ? `Examen · ${speedLabel}` : undefined}
                onHelp={openInstructions}
                onStudy={openGuide}
                right={(
                    <Hud>
                        <HudStat icon={Droplets} tone="score" value={score} label="Puntos" />
                        <span className="llv-lives"><Lives total={3} left={Math.max(0, lives)} /></span>
                        {difficulty !== 'hard' && (
                            <button
                                type="button"
                                className={`llv-helpswitch ${showHelp ? 'is-on' : ''}`}
                                onClick={() => setShowHelp(!showHelp)}
                                aria-pressed={showHelp}
                                title="Ayuda de colores"
                            >
                                {showHelp ? <Lightbulb size={16} /> : <LightbulbOff size={16} />}
                                <span>Colores</span>
                                <i className="llv-helpswitch__track"><i /></i>
                            </button>
                        )}
                        <button type="button" className="gk-iconbtn" onClick={togglePause} aria-label={gamePhase === 'paused' ? 'Continuar' : 'Pausa'} title={gamePhase === 'paused' ? 'Continuar' : 'Pausa'}>
                            {gamePhase === 'paused' ? <Play size={18} /> : <Pause size={18} />}
                        </button>
                    </Hud>
                )}
            />

            <div className="llv-stage" style={{ '--llv-cols': numCols }}>
                <div className="llv-sky" aria-hidden="true">
                    <span className="llv-sky__cloud llv-sky__cloud--a" />
                    <span className="llv-sky__cloud llv-sky__cloud--b" />
                    <span className="llv-sky__cloud llv-sky__cloud--c" />
                    <span className="llv-sky__rain" />
                    <span className="llv-sky__lanes" style={{ backgroundSize: `${colWidthPercent}% 100%` }} />
                </div>

                {/* PALABRAS CAYENDO */}
                <div className="llv-words">
                    <AnimatePresence>
                        {fallingWords.map(word => {
                            const targetCategory = categories.find(c => c.id === word.categoryId);
                            const tint = canShowHelp && targetCategory ? `is-tinted ${targetCategory.color}` : '';
                            return (
                                <motion.div
                                    key={word.id}
                                    initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
                                    animate={{ opacity: 1, scale: 1, x: "-50%" }}
                                    exit={{ opacity: 0, scale: 0, x: "-50%" }}
                                    className={`llv-word ${tint}`}
                                    style={{
                                        left: `${(word.colIndex * colWidthPercent) + (colWidthPercent / 2)}%`,
                                        top: `${word.y}%`
                                    }}
                                >
                                    {word.text}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* ZONA INFERIOR (CAJAS) */}
                <div className="llv-floor" style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
                    <AnimatePresence mode='popLayout'>
                        {categories.map((cat, index) => (
                            <React.Fragment key={cat.id}>
                                <motion.div
                                    layout
                                    layoutId={cat.id}
                                    animate={getBoxAnimation(index)}
                                    className={`llv-box ${cat.color}`}
                                >
                                    <span className="llv-box__water" aria-hidden="true" />
                                    <span className="llv-box__rim" aria-hidden="true" />
                                    <span className="llv-box__name"><Inbox size={14} aria-hidden="true" /> {cat.name}</span>
                                </motion.div>

                                {/* Gema de intercambio entre cajas */}
                                {index < numCols - 1 && (
                                    <div className="llv-swap" style={{ left: `${(index + 1) * colWidthPercent}%` }}>
                                        <button
                                            type="button"
                                            className="llv-gem"
                                            onClick={() => swapCategories(index, index + 1)}
                                            aria-label={`Intercambiar ${cat.name} y ${categories[index + 1]?.name}`}
                                        >
                                            <ArrowLeftRight size={24} />
                                        </button>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </AnimatePresence>
                </div>

                {/* PAUSA */}
                <AnimatePresence>
                    {gamePhase === 'paused' && !showCheatSheet && !showInstructions && (
                        <motion.div className="llv-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.div className="llv-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <span className="llv-card__badge"><Pause size={26} /></span>
                                <strong className="llv-card__title">Pausa</strong>
                                <GameButton size="lg" icon={Play} onClick={togglePause} autoFocus>Continuar</GameButton>
                                {!isExamMode && (
                                    <GameButton variant="soft" icon={LayoutGrid} onClick={returnToMenu}>Cambiar de modo</GameButton>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {modals}
        </GameShell>
    );
};

// Nube con gotas para el resumen (SVG sin filtros).
const RainCloud = () => (
    <svg viewBox="0 0 160 110" width="160" height="110">
        <defs>
            <linearGradient id="llv-cloud-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#c7d7f5" />
            </linearGradient>
            <linearGradient id="llv-drop-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#bae6fd" />
                <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
        </defs>
        <ellipse cx="80" cy="64" rx="56" ry="8" fill="#0c4a6e" opacity=".18" />
        <path d="M38 56c-12 0-20-8-20-18s9-18 20-17c3-12 14-20 27-19 9 0 17 5 22 12 4-3 9-4 14-4 14 0 25 10 25 23 10 1 17 8 17 17 0 10-8 17-19 17H38z" fill="url(#llv-cloud-g)" />
        <path d="M30 30c4-6 10-9 16-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".9" />
        {[[52, 72], [80, 80], [108, 72], [66, 92], [94, 94]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 9}c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z`} fill="url(#llv-drop-g)" />
        ))}
    </svg>
);

export default LluviaDePalabras;
