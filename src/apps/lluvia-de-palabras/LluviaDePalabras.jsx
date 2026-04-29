import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Play, RotateCcw, Lightbulb, Pause, Home, Menu, CloudRain, BookOpen, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRunnerData } from '../../services/gameDataService';

const SPAWN_RATE_START = 2000;
const INITIAL_SPEED = 0.15;
const SPEED_INCREMENT_PER_LEVEL = 0.001;
const SPAWN_DECREMENT_PER_LEVEL = 25;

// Modificador de nota segun la velocidad elegida en el examen
const EXAM_SUBMODE_MODIFIER = { slow: -1, normal: 0, fast: 1 };

// Colores fijos para las categorías (Gradientes vibrantes)
const CATEGORY_COLORS = [
    'bg-gradient-to-b from-red-500 to-red-700 shadow-red-900/20',
    'bg-gradient-to-b from-green-500 to-green-700 shadow-green-900/20',
    'bg-gradient-to-b from-blue-500 to-blue-700 shadow-blue-900/20',
    'bg-gradient-to-b from-purple-500 to-purple-700 shadow-purple-900/20',
    'bg-gradient-to-b from-orange-500 to-orange-700 shadow-orange-900/20'
];

const gridStyles = `
  @keyframes moveGrid {
    0% { background-position: 0 0; }
    100% { background-position: 0 -80px; } 
  }
  .scrolling-grid {
    width: 100%;
    height: 100%;
    background-size: 80px 80px; 
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    animation: moveGrid 0.8s linear infinite;
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  }
`;

const LluviaDePalabras = ({ onGameComplete } = {}) => {
    const { toast } = useToast();
    const { level, grade, subjectId } = useParams();
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

    if (gamePhase === 'loading') return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando...</div>;
    if (!configData) return <div className="p-10 text-center text-red-500">Error: No hay datos.</div>;

    // 1. MENÚ (UI REDISEÑADA Y MODERNA)
    if (gamePhase === 'menu') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 max-w-4xl mx-auto py-10">
                {/* ICONO FLOTANTE */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6 p-6 bg-white rounded-[2rem] shadow-2xl shadow-blue-100 rotate-3"
                >
                    <CloudRain className="w-16 h-16 text-blue-500 fill-blue-50" />
                </motion.div>

                {/* TÍTULO CON DEGRADADO */}
                <div className="mb-10 md:mb-14 relative z-10">
                    <h2 className="text-5xl md:text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pb-2 font-fredoka">
                        {configData.title || "Lluvia de Palabras"}
                    </h2>
                    <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed font-fredoka">
                        {showExamMenu
                            ? "Selecciona la velocidad del examen para ajustarla a tu nivel."
                            : (configData.instructions || "Atrapa las palabras en la caja correcta. ¡Usa los botones mágicos para mover las cajas!")}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!showExamMenu ? (
                        <motion.div
                            key="main-menu"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4"
                        >
                            {[
                                { id: 'easy', emoji: '🌱', label: 'Fácil', sub: '2 Cajas', accent: 'bg-green-500', shadow: 'shadow-green-200' },
                                { id: 'medium', emoji: '🚀', label: 'Medio', sub: '3 Cajas + Ayuda', accent: 'bg-blue-500', shadow: 'shadow-blue-200' },
                                { id: 'hard', emoji: '🔥', label: 'EXAMEN', sub: '3 Cajas sin Ayudas', accent: 'bg-red-500', shadow: 'shadow-red-200' }
                            ].map((mode) => (
                                <motion.button
                                    key={mode.id}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => mode.id === 'hard' ? setShowExamMenu(true) : startGame(mode.id)}
                                    className={`
                                        group relative w-full h-48 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-50
                                        ${mode.shadow}
                                    `}
                                >
                                    {/* Fondo acento suave */}
                                    <div className={`absolute top-0 w-full h-2 ${mode.accent}`} />
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${mode.accent}`} />

                                    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                                        <span className="text-5xl filter drop-shadow-md mb-2">{mode.emoji}</span>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 transition-colors font-fredoka">
                                            {mode.label}
                                        </h3>
                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide group-hover:bg-slate-200 transition-colors">
                                            {mode.sub}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="exam-menu"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center w-full gap-6"
                        >
                            {/* Aviso del modificador de nota */}
                            <div className="w-full max-w-3xl mx-auto bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-left text-sm text-amber-900">
                                <p className="font-bold mb-1 flex items-center gap-2">⚠️ Modificador de nota</p>
                                <ul className="list-disc list-inside space-y-0.5 text-[13px]">
                                    <li><strong>Lento</strong> — resta <strong>1 punto</strong> a la nota final.</li>
                                    <li><strong>Normal</strong> — nota sin cambios.</li>
                                    <li><strong>Rápido</strong> — suma <strong>1 punto</strong> a la nota final (puede superar el 10).</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                                {[
                                    { id: 'slow', emoji: '🕰️', label: 'Examen Lento', sub: 'Más tiempo', speed: 0.10, spawn: 2500, accent: 'bg-orange-400', shadow: 'shadow-orange-200', modLabel: '−1 pto', modClass: 'bg-red-100 text-red-700' },
                                    { id: 'normal', emoji: '⚡', label: 'Examen Normal', sub: 'Equilibrado', speed: 0.15, spawn: 2000, accent: 'bg-red-500', shadow: 'shadow-red-200', modLabel: 'Sin modificador', modClass: 'bg-slate-100 text-slate-600' },
                                    { id: 'fast', emoji: '🌪️', label: 'Examen Rápido', sub: '¡Solo expertos!', speed: 0.22, spawn: 1500, accent: 'bg-purple-600', shadow: 'shadow-purple-200', modLabel: '+1 pto', modClass: 'bg-green-100 text-green-700' }
                                ].map((subMode) => (
                                    <motion.button
                                        key={subMode.id}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => startGame('hard', subMode.speed, subMode.spawn, subMode.id)}
                                        className={`
                                            group relative w-full h-56 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-50
                                            ${subMode.shadow}
                                        `}
                                    >
                                        <div className={`absolute top-0 w-full h-2 ${subMode.accent}`} />
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${subMode.accent}`} />

                                        <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                                            <span className="text-5xl filter drop-shadow-md mb-1">{subMode.emoji}</span>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight font-fredoka">
                                                {subMode.label}
                                            </h3>
                                            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                                {subMode.sub}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${subMode.modClass}`}>
                                                {subMode.modLabel}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                            <Button variant="ghost" className="text-slate-400 hover:text-slate-600 font-bold gap-2" onClick={() => setShowExamMenu(false)}>
                                <ArrowLeftRight className="w-4 h-4 rotate-180" /> Volver al menú principal
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Tracking
    // 2. GAME OVER / RESULTS
    if (gamePhase === 'gameOver') {
        const isExam = difficulty === 'hard';
        const correctWords = score / 10;
        const baseNotaNum = Math.min((correctWords / 30) * 10, 10);
        const modifier = isExam ? (EXAM_SUBMODE_MODIFIER[examSubMode] || 0) : 0;
        const finalNotaNum = isExam
            ? Math.max(0, Math.round((baseNotaNum + modifier) * 10) / 10)
            : Math.round(baseNotaNum * 10) / 10;
        const baseGrade = baseNotaNum.toFixed(1);
        const examGrade = finalNotaNum.toFixed(1);
        const hasPassedExam = isExam && correctWords >= 30;
        const subModeLabel = examSubMode === 'slow' ? 'Lento' : examSubMode === 'fast' ? 'Rápido' : examSubMode === 'normal' ? 'Normal' : null;

        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] gap-8 text-center px-4 max-w-4xl mx-auto py-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full flex flex-col items-center"
                >
                    <h2 className={`text-4xl md:text-5xl font-black mb-10 tracking-tight font-fredoka ${hasPassedExam ? 'text-green-600' : 'text-slate-800'}`}>
                        {hasPassedExam ? "🏆 ¡EXAMEN SUPERADO!" : (isExam ? "🏁 EXAMEN FINALIZADO" : "🎮 PARTIDA TERMINADA")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                        {/* CARD PUNTUACIÓN */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50 flex flex-col items-center justify-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Palabras Correctas</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-slate-800 font-fredoka">{correctWords}</span>
                                {isExam && <span className="text-2xl text-slate-300 font-bold">/ 30</span>}
                            </div>
                        </div>

                        {/* CARD NOTA (Solo en examen o siempre para feedback) */}
                        <div className={`p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center border ${isExam ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-200' : 'bg-white border-slate-50 shadow-slate-200/60'}`}>
                            <p className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${isExam ? 'text-blue-100' : 'text-slate-400'}`}>Nota Final</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-7xl font-black font-fredoka ${!isExam && 'text-slate-800'}`}>{examGrade}</span>
                                <span className={`text-2xl font-bold ${isExam ? 'text-blue-300' : 'text-slate-300'}`}>/ 10</span>
                            </div>

                            {isExam && modifier !== 0 && (
                                <div className="mt-4 w-full text-center text-xs font-semibold text-blue-100 space-y-1">
                                    <div className="flex items-center justify-between px-2">
                                        <span>Base</span>
                                        <span>{baseGrade}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <span>Modo {subModeLabel}</span>
                                        <span className={modifier > 0 ? 'text-green-300' : 'text-red-300'}>
                                            {modifier > 0 ? `+${modifier}` : modifier}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-2 pt-1 border-t border-white/20 font-black">
                                        <span>Total</span>
                                        <span>{examGrade}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {hasPassedExam && (
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 text-xl text-green-600 font-bold font-fredoka bg-green-50 px-6 py-2 rounded-full border border-green-100"
                        >
                            ¡Enhorabuena! Has conseguido todas las palabras.
                        </motion.p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mt-12">
                        <Button variant="ghost" size="lg" onClick={returnToMenu} className="gap-2 rounded-2xl h-14 text-slate-500 hover:text-slate-800 font-bold px-8">
                            <Menu className="w-5 h-5" /> Menú Principal
                        </Button>
                        <Button size="lg" onClick={() => startGame(difficulty)} className="gap-4 rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 text-white font-black px-10 shadow-xl transition-all hover:scale-105 active:scale-95">
                            <RotateCcw className="w-5 h-5" /> REINTENTAR
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 3. JUEGO ACTIVO
    const numCols = categories.length;
    const colWidthPercent = 100 / numCols;

    return (
        <div className="relative w-full max-w-2xl mx-auto h-[80vh] bg-slate-900 overflow-hidden rounded-xl border-4 border-slate-800 shadow-2xl select-none touch-none">
            <style>{gridStyles}</style>

            {/* FONDO GRID ANIMADO */}
            <div className="absolute inset-0 scrolling-grid pointer-events-none opacity-40"></div>

            {/* HUD */}
            <div className="absolute top-0 w-full p-4 grid grid-cols-3 items-start z-20 bg-gradient-to-b from-slate-900/80 to-transparent">
                <div className="flex justify-start">
                    <button
                        className="bg-slate-800/80 backdrop-blur text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-700 transition active:scale-95 shadow-lg border border-slate-700"
                        onClick={togglePause}
                    >
                        {gamePhase === 'paused' ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex justify-center gap-2">
                    {difficulty !== 'hard' && (
                        <button
                            title="Ayuda visual"
                            className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-full border border-slate-700 shadow-lg flex items-center gap-2 transition-colors hover:bg-slate-700"
                            onClick={() => setShowHelp(!showHelp)}
                        >
                            <Lightbulb className={`w-4 h-4 ${showHelp ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                            <div className={`w-8 h-4 rounded-full p-1 transition-colors relative ${showHelp ? 'bg-green-500' : 'bg-slate-600'}`}>
                                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full shadow-sm transition-transform duration-300 ${showHelp ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </button>
                    )}
                    <button
                        title="Guía de categorías"
                        className="bg-slate-800/80 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-700 transition active:scale-95 shadow-lg border border-slate-700 text-blue-400"
                        onClick={() => {
                            if (gamePhase === 'playing') setGamePhase('paused');
                            setShowCheatSheet(true);
                        }}
                    >
                        <BookOpen className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="bg-white px-4 py-1.5 rounded-full font-black text-slate-900 shadow-lg border-2 border-slate-200 text-lg min-w-[80px] text-center">
                        {score}
                    </div>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-xl transition-all duration-500 ${i < lives ? 'scale-100 opacity-100 grayscale-0' : 'scale-75 opacity-30 grayscale'}`}>❤️</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL PAUSA */}
            <AnimatePresence>
                {gamePhase === 'paused' && !showCheatSheet && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6 p-4"
                    >
                        <h2 className="text-4xl font-bold text-white tracking-wide">PAUSA</h2>
                        <Button size="lg" onClick={togglePause} className="w-full max-w-xs h-14 text-lg bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold border-none shadow-xl rounded-2xl">
                            <Play className="w-6 h-6 mr-2" /> Continuar
                        </Button>
                        <Button variant="outline" onClick={returnToMenu} className="w-full max-w-xs h-14 text-lg bg-transparent border-2 border-slate-600 text-slate-300 hover:bg-slate-800 rounded-2xl">
                            <Home className="w-6 h-6 mr-2" /> Elegir dificultad
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL GUÍA DE CATEGORÍAS (CHEAT SHEET) */}
            <AnimatePresence>
                {showCheatSheet && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] flex flex-col p-6 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-blue-400" /> Guía de Palabras
                            </h2>
                            <button
                                onClick={() => setShowCheatSheet(false)}
                                className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid gap-4">
                                {Object.entries(configData)
                                    .filter(([key]) => key !== 'title' && key !== 'instructions')
                                    .map(([category, words], idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={category}
                                            className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
                                        >
                                            <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-3 px-1 border-l-4 border-blue-500">
                                                {category.replace(/_/g, ' ')}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(words) && words.map((word, wIdx) => (
                                                    <span
                                                        key={wIdx}
                                                        className="px-3 py-1 bg-slate-900/80 text-slate-300 rounded-lg text-xs border border-white/5"
                                                    >
                                                        {word}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                size="lg"
                                onClick={() => {
                                    setShowCheatSheet(false);
                                    if (gamePhase === 'paused') togglePause();
                                }}
                                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
                            >
                                ¡Lo tengo! Continuar
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PALABRAS CAYENDO */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <AnimatePresence>
                    {fallingWords.map(word => {
                        const targetCategory = categories.find(c => c.id === word.categoryId);
                        const canShowHelp = showHelp && difficulty !== 'hard';

                        // LÓGICA DE AYUDA
                        const bgClass = (canShowHelp && targetCategory)
                            ? targetCategory.color
                            : 'bg-white';

                        const textClass = (canShowHelp && targetCategory)
                            ? 'text-white border-white/50'
                            : 'text-slate-900 border-slate-200';

                        return (
                            <motion.div
                                key={word.id}
                                initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
                                animate={{ opacity: 1, scale: 1, x: "-50%" }}
                                exit={{ opacity: 0, scale: 0, x: "-50%" }}
                                className={`absolute px-4 py-2 rounded-xl shadow-xl border-2 font-bold text-base md:text-lg whitespace-nowrap z-10 ${bgClass} ${textClass}`}
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
            <div
                className="absolute bottom-0 w-full h-[16%] bg-slate-900 border-t border-slate-700 grid items-start z-20 pt-0"
                style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
            >
                <AnimatePresence mode='popLayout'>
                    {categories.map((cat, index) => (
                        <React.Fragment key={cat.id}>
                            <motion.div
                                layout
                                layoutId={cat.id}
                                animate={getBoxAnimation(index)}
                                className={`
                                    relative h-full w-[92%] max-w-[300px]
                                    ${cat.color} 
                                    rounded-b-[2rem] rounded-t-none
                                    shadow-2xl flex items-center justify-center 
                                    text-white text-center 
                                    border-b-4 border-x border-white/20
                                `}
                                style={{ justifySelf: 'center' }}
                            >
                                {/* Brillo interior */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none rounded-b-[2rem]"></div>
                                <span className="font-bold text-sm md:text-base uppercase tracking-wider drop-shadow-md px-1 relative z-10">
                                    {cat.name}
                                </span>
                            </motion.div>

                            {/* BOTÓN DE CAMBIO - DISEÑO "GEMA MÁGICA" */}
                            {index < numCols - 1 && (
                                <div
                                    className="absolute z-30 flex items-center justify-center pointer-events-auto"
                                    style={{
                                        left: `${(index + 1) * colWidthPercent}%`,
                                        bottom: '50%', // Centrado vertical en la zona de cajas
                                        transform: 'translate(-50%, 20%)'
                                    }}
                                >
                                    {/* Puente de luz entre cajas */}
                                    <div className="absolute w-24 h-16 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent blur-xl -z-10" />

                                    <button
                                        className="group relative w-16 h-16 flex items-center justify-center focus:outline-none"
                                        onClick={() => swapCategories(index, index + 1)}
                                    >
                                        {/* Anillo de energía exterior */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-500" />

                                        {/* Cuerpo principal (Estilo Gema/Cristal) */}
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-amber-200/50 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95">

                                            {/* Brillo Gloss superior */}
                                            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent opacity-80 pointer-events-none" />

                                            {/* Icono Blanco Brillante */}
                                            <ArrowLeftRight className="relative z-10 w-7 h-7 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] group-hover:rotate-180 transition-transform duration-500 ease-out" />
                                        </div>
                                    </button>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LluviaDePalabras;