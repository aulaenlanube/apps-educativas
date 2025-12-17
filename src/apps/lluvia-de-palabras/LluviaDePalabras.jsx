import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Play, RotateCcw, Lightbulb, Pause, Home, Menu, CloudRain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SPAWN_RATE_START = 2000;
const INITIAL_SPEED = 0.15;
const SPEED_INCREMENT_PER_LEVEL = 0.001; 
const SPAWN_DECREMENT_PER_LEVEL = 25;    

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

const LluviaDePalabras = () => {
    const { toast } = useToast();
    const { level, grade, subjectId } = useParams();
    const navigate = useNavigate();
    
    // --- ESTADOS ---
    const [gamePhase, setGamePhase] = useState('loading'); 
    const [difficulty, setDifficulty] = useState('medium'); 
    const [configData, setConfigData] = useState(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [showHelp, setShowHelp] = useState(false);
    const [boxAnimation, setBoxAnimation] = useState({ col: null, type: null });

    const [categories, setCategories] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [fallingWords, setFallingWords] = useState([]); 
    
    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    const difficultyRef = useRef(0);
    const speedRef = useRef(INITIAL_SPEED);

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
                const fileName = `${subjectId}-runner.json`;
                const response = await fetch(`/data/${level}/${grade}/${fileName}`);
                if (!response.ok) throw new Error(`Error loading ${fileName}`);
                const json = await response.json();
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
    const startGame = (selectedDifficulty) => {
        if (!configData) return;

        setDifficulty(selectedDifficulty);
        setScore(0);
        setLives(3);
        setFallingWords([]);
        setShowHelp(false);
        difficultyRef.current = 0;
        speedRef.current = INITIAL_SPEED;
        lastSpawnTime.current = performance.now();
        setBoxAnimation({ col: null, type: null });

        const allCategoriesKeys = Object.keys(configData).filter(k => k !== 'title' && k !== 'instructions');
        const shuffledKeys = [...allCategoriesKeys].sort(() => 0.5 - Math.random());
        
        const numCategories = selectedDifficulty === 'easy' ? 2 : Math.min(3, shuffledKeys.length);
        const selectedKeys = shuffledKeys.slice(0, numCategories);
        
        const processedCategories = selectedKeys.map((key, index) => ({
            id: `cat-${index}-${Date.now()}`, 
            originalId: index,
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
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
            SPAWN_RATE_START - (difficultyRef.current * SPAWN_DECREMENT_PER_LEVEL)
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
                        setScore(s => s + 10);
                        difficultyRef.current += 1;
                        speedRef.current = INITIAL_SPEED + (difficultyRef.current * SPEED_INCREMENT_PER_LEVEL);
                        eventHappened = { col: word.colIndex, type: 'success' };
                    } else if (targetCategory) {
                        livesLost++;
                        difficultyRef.current = Math.max(0, difficultyRef.current - 10); 
                        speedRef.current = INITIAL_SPEED + (difficultyRef.current * SPEED_INCREMENT_PER_LEVEL);
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
                    <h2 className="text-5xl md:text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pb-2">
                        {configData.title || "Lluvia de Palabras"}
                    </h2>
                    <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
                        {configData.instructions || "Atrapa las palabras en la caja correcta. ¡Usa los botones mágicos para mover las cajas!"}
                    </p>
                </div>
                
                {/* TARJETAS DE NIVEL MODERNAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                    {[
                        { id: 'easy', emoji: '🌱', label: 'Fácil', sub: '2 Cajas', accent: 'bg-green-500', shadow: 'shadow-green-200' },
                        { id: 'medium', emoji: '🚀', label: 'Medio', sub: '3 Cajas + Ayuda', accent: 'bg-blue-500', shadow: 'shadow-blue-200' },
                        { id: 'hard', emoji: '🔥', label: 'PRO', sub: '3 Cajas sin Ayudas', accent: 'bg-red-500', shadow: 'shadow-red-200' }
                    ].map((mode) => (
                        <motion.button 
                            key={mode.id} 
                            whileHover={{ scale: 1.05, y: -5 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => startGame(mode.id)}
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
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 transition-colors">
                                    {mode.label}
                                </h3>
                                <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide group-hover:bg-slate-200 transition-colors">
                                    {mode.sub}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // 2. GAME OVER
    if (gamePhase === 'gameOver') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center px-4">
                <h2 className="text-4xl font-bold text-slate-800">¡Juego Terminado!</h2>
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-xs transform rotate-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Puntuación</p>
                    <p className="text-6xl font-black text-slate-800">{score}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
                    <Button variant="outline" size="lg" onClick={returnToMenu} className="gap-2 rounded-xl border-2 h-12">
                        <Menu className="w-4 h-4" /> Elegir Nivel
                    </Button>
                    <Button size="lg" onClick={() => startGame(difficulty)} className="gap-2 rounded-xl h-12 bg-slate-800 hover:bg-slate-700">
                        <RotateCcw className="w-4 h-4" /> Reintentar
                    </Button>
                </div>
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

                <div className="flex justify-center">
                    {difficulty !== 'hard' && (
                         <button 
                            className="bg-slate-800/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 shadow-lg flex items-center gap-3 transition-colors hover:bg-slate-700"
                            onClick={() => setShowHelp(!showHelp)}
                        >
                            <Lightbulb className={`w-5 h-5 ${showHelp ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                            <div className={`w-10 h-5 rounded-full p-1 transition-colors relative ${showHelp ? 'bg-green-500' : 'bg-slate-600'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${showHelp ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>
                    )}
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
                {gamePhase === 'paused' && (
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