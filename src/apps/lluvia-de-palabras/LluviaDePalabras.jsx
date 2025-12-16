import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Play, RotateCcw, Lightbulb, Pause, Home, Menu } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SPAWN_RATE_START = 2000;
const INITIAL_SPEED = 0.15;
const SPEED_INCREMENT_PER_LEVEL = 0.001; 
const SPAWN_DECREMENT_PER_LEVEL = 25;    

// Colores fijos
const CATEGORY_COLORS = ['bg-red-500', 'bg-green-500', 'bg-blue-500'];

const LluviaDePalabras = () => {
    const { toast } = useToast();
    const { level, grade, subjectId } = useParams();
    const navigate = useNavigate();
    
    // --- ESTADOS DE CONTROL DE FLUJO ---
    const [gamePhase, setGamePhase] = useState('loading'); 
    const [difficulty, setDifficulty] = useState('medium'); 

    // Datos crudos del JSON
    const [configData, setConfigData] = useState(null);
    
    // Estados del juego
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [showHelp, setShowHelp] = useState(false);
    
    const [boxAnimation, setBoxAnimation] = useState({ col: null, type: null });

    // Datos procesados
    const [categories, setCategories] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [fallingWords, setFallingWords] = useState([]); 
    
    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    
    // Gestión de dificultad
    const difficultyRef = useRef(0);
    const speedRef = useRef(INITIAL_SPEED);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadGameData = async () => {
            setGamePhase('loading');
            try {
                if (!subjectId) throw new Error("No asignatura");
                // CAMBIO: Ahora usamos el fichero runner para obtener los datos
                const fileName = `${subjectId}-runner.json`;
                const response = await fetch(`/data/${level}/${grade}/${fileName}`);
                if (!response.ok) throw new Error(`Error loading ${fileName}`);
                const json = await response.json();
                setConfigData(json);
                setGamePhase('menu'); 
            } catch (error) {
                console.error("Error:", error);
            }
        };
        loadGameData();
    }, [level, grade, subjectId]);

    // --- INICIAR PARTIDA ---
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

        // CAMBIO: Adaptación para leer el formato runner (Clave -> Array de palabras)
        const allCategoriesKeys = Object.keys(configData);
        
        // Mezclamos las categorías disponibles para que sea variado
        const shuffledKeys = [...allCategoriesKeys].sort(() => 0.5 - Math.random());

        const numCategories = selectedDifficulty === 'easy' ? 2 : 3;
        // Nos aseguramos de no pedir más categorías de las que existen
        const selectedKeys = shuffledKeys.slice(0, Math.min(numCategories, shuffledKeys.length));
        
        const processedCategories = selectedKeys.map((key, index) => ({
            id: `cat-${index}`, 
            originalId: index,
            // Formateamos el nombre: primera mayúscula y guiones bajos por espacios
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        }));

        const processedWords = [];
        selectedKeys.forEach((key, index) => {
            const catId = `cat-${index}`;
            const wordsList = configData[key];
            
            if (wordsList && Array.isArray(wordsList)) {
                wordsList.forEach(wordText => {
                    processedWords.push({
                        text: wordText,
                        categoryId: catId
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
                const numCols = categories.length;
                const randomCol = Math.floor(Math.random() * numCols);
                
                const newWord = {
                    id: Date.now() + Math.random(),
                    text: randomWord.text,
                    categoryId: randomWord.categoryId,
                    colIndex: randomCol,
                    y: -10 
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
                
                if (newY >= 82) {
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
                scale: [1, 1.15, 1],
                borderColor: ["#ffffff", "#fbbf24", "#ffffff"],
                boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 25px rgba(251, 191, 36, 0.8)", "0 0 0px rgba(0,0,0,0)"],
                transition: { duration: 0.3 }
            };
        }
        if (boxAnimation.type === 'error') {
            return {
                rotate: [0, -15, 15, -10, 10, 0], 
                scale: [1, 0.85, 1],
                opacity: [1, 0.5, 1],
                transition: { duration: 0.4 }
            };
        }
    };

    if (gamePhase === 'loading') return <div className="p-10 text-center text-slate-500 animate-pulse">Cargando recursos...</div>;
    if (!configData) return <div className="p-10 text-center text-red-500">Error: No hay datos.</div>;

    // 1. MENÚ
    if (gamePhase === 'menu') {
        return (
            <div className="flex flex-col items-center justify-center h-[65vh] gap-8 text-center px-4 max-w-2xl mx-auto">
                <div>
                    {/* CAMBIO: Usamos textos por defecto porque el runner.json no tiene title/instructions */}
                    <h2 className="text-4xl font-bold text-slate-800 mb-2">
                        {configData.title || "Lluvia de Palabras"}
                    </h2>
                    <p className="text-lg text-slate-600">
                        {configData.instructions || "Usa los botones amarillos para cambiar el orden de las cajas y clasificar las palabras que caen."}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                            onClick={() => startGame('easy')}
                            className="w-full h-32 flex flex-col gap-2 bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300 rounded-xl"
                            variant="ghost"
                        >
                            <span className="text-3xl">😊</span>
                            <span className="text-xl font-bold">Fácil</span>
                            <span className="text-xs opacity-75">2 Cajas</span>
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                            onClick={() => startGame('medium')}
                            className="w-full h-32 flex flex-col gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 border-2 border-blue-300 rounded-xl"
                            variant="ghost"
                        >
                            <span className="text-3xl">😎</span>
                            <span className="text-xl font-bold">Medio</span>
                            <span className="text-xs opacity-75">3 Cajas + Ayuda</span>
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                            onClick={() => startGame('hard')}
                            className="w-full h-32 flex flex-col gap-2 bg-red-100 hover:bg-red-200 text-red-800 border-2 border-red-300 rounded-xl"
                            variant="ghost"
                        >
                            <span className="text-3xl">🔥</span>
                            <span className="text-xl font-bold">Difícil</span>
                            <span className="text-xs opacity-75">3 Cajas + Sin Ayuda</span>
                        </Button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // 2. GAME OVER
    if (gamePhase === 'gameOver') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
                <h2 className="text-4xl font-bold text-slate-800">¡Fin de la partida!</h2>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <p className="text-lg text-slate-500 mb-2">Puntuación Final</p>
                    <p className="text-5xl font-bold text-primary">{score}</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={returnToMenu} className="gap-2">
                        <Menu className="w-4 h-4" /> Menú
                    </Button>
                    <Button size="lg" onClick={() => startGame(difficulty)} className="gap-2">
                        <RotateCcw className="w-4 h-4" /> Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    // 3. JUEGO
    const numCols = categories.length;
    const colWidthPercent = 100 / numCols; 

    return (
        <div className="relative w-full max-w-lg mx-auto h-[75vh] bg-slate-50 overflow-hidden rounded-xl border-2 border-slate-200 shadow-inner select-none touch-none">
            
            {/* HUD SUPERIOR */}
            <div className="absolute top-4 w-full px-4 grid grid-cols-3 items-start z-10">
                <div className="flex justify-start">
                    <div 
                        className="bg-white/90 w-10 h-10 rounded-full border shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-600 transition-transform active:scale-95"
                        onClick={togglePause}
                    >
                        {gamePhase === 'paused' ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
                    </div>
                </div>

                <div className="flex justify-center">
                    {difficulty !== 'hard' && (
                         <div 
                            className="bg-white/90 px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-50"
                            onClick={() => setShowHelp(!showHelp)}
                        >
                            <Lightbulb className={`w-4 h-4 ${showHelp ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${showHelp ? 'bg-green-500' : 'bg-slate-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${showHelp ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="bg-white/90 px-4 py-1 rounded-full border shadow-sm font-bold text-slate-700">
                        {score} pts
                    </div>
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <span key={i} className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* PAUSA */}
            {gamePhase === 'paused' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                    <h2 className="text-3xl font-bold text-slate-800">Juego Pausado</h2>
                    <Button size="lg" onClick={togglePause} className="gap-2 w-48 shadow-lg">
                        <Play className="w-5 h-5" /> Continuar
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={returnToMenu} 
                        className="gap-2 w-48 bg-white border border-slate-200 shadow-md text-slate-700 font-bold"
                    >
                        <Home className="w-5 h-5" /> Elegir dificultad
                    </Button>
                </div>
            )}

            {/* GRID */}
            <div className={`absolute inset-0 grid w-full h-full pointer-events-none`} style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)`}}>
                {[...Array(numCols - 1)].map((_, i) => (
                    <div key={i} className="border-r border-slate-200 dashed opacity-50 h-full w-full"></div>
                ))}
            </div>

            {/* PALABRAS */}
            {fallingWords.map(word => {
                const targetCategory = categories.find(c => c.id === word.categoryId);
                const canShowHelp = showHelp && difficulty !== 'hard';
                const helperColor = (canShowHelp && targetCategory) ? targetCategory.color : '';

                return (
                    <div
                        key={word.id}
                        className={`absolute transform -translate-x-1/2 px-3 py-1 rounded-md shadow-md border-2 
                            ${helperColor ? helperColor + ' border-white text-white' : 'bg-white border-slate-300 text-slate-800'}
                            font-bold text-sm md:text-base whitespace-nowrap z-0 transition-colors duration-300`}
                        style={{
                            left: `${(word.colIndex * colWidthPercent) + (colWidthPercent / 2)}%`,
                            top: `${word.y}%`
                        }}
                    >
                        {word.text}
                    </div>
                );
            })}

            {/* CAJAS Y BOTONES DE INTERCAMBIO MEJORADOS */}
            <div className="absolute bottom-0 w-full h-[18%] bg-slate-100 border-t-2 border-slate-300 flex items-center justify-around px-2 pb-2 z-20">
                {categories.map((cat, index) => (
                    <React.Fragment key={cat.id}>
                        {/* Caja */}
                        <motion.div 
                            animate={getBoxAnimation(index)}
                            className={`h-[85%] ${cat.color} rounded-xl shadow-lg flex items-center justify-center text-white transition-colors p-2 text-center relative border-2 border-transparent`}
                            style={{ width: `${90 / numCols}%` }} 
                        >
                            <span className="font-bold text-sm md:text-lg leading-tight drop-shadow-md">{cat.name}</span>
                        </motion.div>

                        {/* Botón Swap: Más grande, centrado y superpuesto */}
                        {index < numCols - 1 && (
                            <Button 
                                variant="outline" size="icon" 
                                className="rounded-full w-12 h-12 md:w-16 md:h-16 bg-yellow-400 hover:bg-yellow-500 border-4 border-white shadow-xl shrink-0 z-50 -mx-6"
                                onClick={() => swapCategories(index, index + 1)}
                            >
                                <ArrowLeftRight className="h-6 w-6 md:h-8 md:w-8 text-yellow-950" />
                            </Button>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default LluviaDePalabras;