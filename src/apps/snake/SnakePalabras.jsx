import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Play, Pause, Star, Settings, Lightbulb, LightbulbOff, Skull, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // Mantenemos toast por si quieres usarlo para errores de carga, pero no para juego
import { cn } from "@/lib/utils";

// Configuración del tablero y tiempos
const GRID_SIZE = 25; 
const SPEED_INITIAL = 250;
const SPEED_MIN = 100;
const ITEM_LIFESPAN = 15000; 
const ITEM_BLINK_TIME = 5000; 

const SnakeDePalabras = (props) => {
  // const { toast } = useToast(); // Ya no usamos toasts para gameplay
  const params = useParams();
  const level = props.level || params.level;
  const grade = props.grade || params.grade;
  const subjectId = props.subjectId || params.subjectId;
  
  // --- ESTADOS DEL JUEGO ---
  const [snake, setSnake] = useState([{ x: 12, y: 12 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [food, setFood] = useState([]); 
  const [score, setScore] = useState(0);
  
  // Estados visuales (Feedback)
  // null | 'error' | 'success' | 'bonus'
  const [headAnim, setHeadAnim] = useState(null); 

  // Estados de flujo
  const [gameState, setGameState] = useState('menu'); 
  const [isPaused, setIsPaused] = useState(false);
  
  // Configuración
  const [difficulty, setDifficulty] = useState('medium'); 
  const [pendingDifficulty, setPendingDifficulty] = useState(null); 
  const [showConfirmRestart, setShowConfirmRestart] = useState(false); 
  const [showHelp, setShowHelp] = useState(true); 
  
  // Datos
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // Refs
  const savedCallback = useRef();
  const gameBoardRef = useRef(null);

  const formatName = (name) => name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  // 1. CARGA DE DATOS
  useEffect(() => {
    if (!level || !grade || !subjectId) return;

    setLoading(true);
    const dataPath = `/data/${level}/${grade}/${subjectId}-runner.json`;

    fetch(dataPath)
      .then(res => {
        if (!res.ok) throw new Error("Archivo no encontrado");
        return res.json();
      })
      .then(jsonData => {
        setData(jsonData);
        setCategories(Object.keys(jsonData));
        setCurrentCatIndex(0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando runner data:", err);
        setLoadingError(true);
        setLoading(false);
      });
  }, [level, grade, subjectId]);

  // 2. CONFIGURACIÓN
  useEffect(() => {
    if (difficulty === 'hard') {
        setShowHelp(false);
    } else {
        setShowHelp(true);
    }
  }, [difficulty]);

  // 3. LOGICA DEL JUEGO (Tick)
  useEffect(() => {
    savedCallback.current = () => {
      if (gameState !== 'playing' || isPaused) return;

      const now = Date.now();

      // --- GESTIÓN DE CADUCIDAD ---
      setFood(prevFood => prevFood.filter(item => item.expiresAt > now));

      setSnake(prevSnake => {
        const head = prevSnake[0];
        let newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // --- PAREDES ---
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            if (difficulty === 'easy') {
                if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
                if (newHead.x >= GRID_SIZE) newHead.x = 0;
                if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
                if (newHead.y >= GRID_SIZE) newHead.y = 0;
            } else {
                endGame();
                return prevSnake;
            }
        }

        // --- COLISIÓN PROPIA ---
        for (let segment of prevSnake) {
          if (newHead.x === segment.x && newHead.y === segment.y) {
            endGame();
            return prevSnake;
          }
        }

        const newSnake = [newHead, ...prevSnake];
        
        // --- COMER ---
        const eatenFoodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
        
        if (eatenFoodIndex !== -1) {
          const eatenItem = food[eatenFoodIndex];
          handleEat(eatenItem);
          const newFoodList = [...food];
          newFoodList.splice(eatenFoodIndex, 1);
          setFood(newFoodList);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };
  }, [gameState, isPaused, direction, food, difficulty]);

  // Timer del Loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;
    const tickTime = Math.max(SPEED_MIN, SPEED_INITIAL - (score * 2));
    const id = setInterval(() => savedCallback.current(), tickTime);
    return () => clearInterval(id);
  }, [gameState, isPaused, score]);

  // Generador de Comida
  const generateFoodItem = useCallback((currentSnake, currentFood, catIndex) => {
    if (!data || categories.length === 0) return null;
    
    const targetKey = categories[catIndex];
    const otherKeys = categories.filter((_, i) => i !== catIndex);
    
    const rand = Math.random();
    let type = 'valid';
    let wordText = '';

    if (rand > 0.92) {
      type = 'bonus'; 
    } else if (rand > 0.6) {
      type = 'invalid';
      if (otherKeys.length > 0) {
        const randomKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];
        const wordsList = data[randomKey];
        wordText = wordsList[Math.floor(Math.random() * wordsList.length)];
      } else {
        wordText = "Error";
      }
    } else {
      type = 'valid';
      const wordsList = data[targetKey];
      wordText = wordsList[Math.floor(Math.random() * wordsList.length)];
    }

    let newItem;
    let isColliding;
    let attempts = 0;
    
    do {
      isColliding = false;
      newItem = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type,
        word: wordText,
        id: Date.now() + Math.random(),
        expiresAt: Date.now() + ITEM_LIFESPAN 
      };

      if (Math.abs(newItem.x - currentSnake[0].x) + Math.abs(newItem.y - currentSnake[0].y) < 2) isColliding = true;

      for (let segment of currentSnake) {
        if (segment.x === newItem.x && segment.y === newItem.y) isColliding = true;
      }
      for (let f of currentFood) {
        if (f.x === newItem.x && f.y === newItem.y) isColliding = true;
      }
      attempts++;
    } while (isColliding && attempts < 50);

    return isColliding ? null : newItem;
  }, [data, categories]);

  // Reponer comida
  useEffect(() => {
    if (gameState !== 'playing' || isPaused || !data) return;
    if (food.length < 4) { 
      const newItem = generateFoodItem(snake, food, currentCatIndex);
      if (newItem) setFood(prev => [...prev, newItem]);
    }
  }, [food.length, gameState, isPaused, data, snake, currentCatIndex, generateFoodItem]);

  // TRIGGER DE ANIMACIONES
  const triggerAnim = (type) => {
    setHeadAnim(type);
    setTimeout(() => setHeadAnim(null), 500);
  };

  // Controles
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          if (gameState === 'playing') togglePause();
          return;
      }

      if (gameState !== 'playing' || isPaused) return;
      
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
          e.preventDefault();
      }
      
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isPaused, direction]);

  const changeDir = (x, y) => {
    if (isPaused) return;
    if ((x !== 0 && direction.x !== 0) || (y !== 0 && direction.y !== 0)) return;
    setDirection({ x, y });
  };

  const handleEat = (item) => {
    if (item.type === 'bonus') {
      const nextIndex = (currentCatIndex + 1) % categories.length;
      setCurrentCatIndex(nextIndex);
      setScore(s => s + 50);
      setFood([]); 
      triggerAnim('bonus'); // Animación Amarilla
    } else if (item.type === 'valid') {
      setScore(s => s + 10);
      triggerAnim('success'); // Animación Verde
    } else {
      setScore(s => Math.max(0, s - 15));
      triggerAnim('error'); // Animación Roja
    }
  };

  const endGame = () => {
    setGameState('gameover');
    setIsPaused(false);
  };

  const startGame = (targetDifficulty = null) => {
    if (targetDifficulty) setDifficulty(targetDifficulty);
    
    setSnake([{ x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2) }]);
    setDirection({ x: 1, y: 0 }); 
    setFood([]);
    setScore(0);
    setGameState('playing');
    setIsPaused(false);
    setShowConfirmRestart(false);
    setHeadAnim(null);
  };

  const togglePause = () => {
    if (gameState === 'playing') {
        setIsPaused(!isPaused);
    }
  };

  const toggleHelp = () => {
    if (difficulty === 'hard') return; 
    setShowHelp(!showHelp);
  };

  const handleDifficultyRequest = (newDiff) => {
      if (gameState === 'menu' || gameState === 'gameover') {
          startGame(newDiff);
      } else {
          setIsPaused(true);
          setPendingDifficulty(newDiff);
          setShowConfirmRestart(true);
      }
  };

  const confirmRestart = () => {
      startGame(pendingDifficulty);
  };

  const cancelRestart = () => {
      setShowConfirmRestart(false);
      setPendingDifficulty(null);
  };

  // --- RENDER ---

  if (loading) return <div className="text-white text-center p-10 animate-pulse">Cargando base de datos...</div>;
  if (loadingError) return <div className="text-red-400 text-center p-10">Error cargando datos.</div>;

  const currentCategoryName = categories.length > 0 ? formatName(categories[currentCatIndex]) : '';

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 gap-6 font-sans relative">
      
      {/* Estilos para animaciones de la cabeza */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        @keyframes popGreen {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
          50% { transform: scale(1.3); box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
          100% { transform: scale(1); box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes popGold {
           0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
           50% { transform: scale(1.4) rotate(180deg); filter: brightness(1.5); box-shadow: 0 0 30px rgba(250, 204, 21, 0.9); }
           100% { transform: scale(1) rotate(360deg); filter: brightness(1); }
        }
        .animate-head-error { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-head-success { animation: popGreen 0.4s ease-out both; }
        .animate-head-bonus { animation: popGold 0.5s ease-out both; }
      `}</style>

      {/* Header HUD */}
      <div className="w-full flex justify-between items-end px-4">
        <div>
           <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" style={{ textShadow: '0px 0px 10px rgba(100,100,255,0.5)' }}>
             NEON SNAKE
           </h1>
           {gameState === 'playing' && (
             <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-400 text-sm">Objetivo:</span>
                <span className="text-yellow-400 font-bold text-lg uppercase tracking-wider animate-pulse">
                    {currentCategoryName}
                </span>
             </div>
           )}
        </div>

        <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Puntuación</div>
                <div className="text-4xl font-mono font-black text-green-400 drop-shadow-lg">
                    {score.toString().padStart(4, '0')}
                </div>
             </div>
             
             {gameState === 'playing' && (
                 <Button 
                    variant="outline"
                    className="h-12 w-12 rounded-full border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 text-white ml-4"
                    onClick={togglePause}
                 >
                     {isPaused ? <Play className="fill-current" /> : <Pause className="fill-current" />}
                 </Button>
             )}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-[600px] aspect-square bg-slate-900 border-4 border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-4 ring-black/20">
        
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                 backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
                 backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
             }}>
        </div>

        {/* --- PANTALLA: MENU --- */}
        {gameState === 'menu' && (
            <div className="absolute inset-0 z-40 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <h2 className="text-4xl font-bold text-white mb-8">Elige Dificultad</h2>
                <div className="grid gap-4 w-full max-w-xs">
                    <DifficultyButtons onSelect={handleDifficultyRequest} currentDifficulty={difficulty} />
                </div>
            </div>
        )}

        {/* --- PANTALLA: PAUSA --- */}
        {isPaused && !showConfirmRestart && gameState === 'playing' && (
             <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
                <h2 className="text-3xl font-black text-white mb-6 tracking-widest">PAUSA</h2>
                
                <Button onClick={togglePause} className="w-full max-w-xs h-14 text-xl bg-blue-600 hover:bg-blue-500 mb-8 font-bold shadow-lg shadow-blue-900/50">
                    <Play className="mr-2 h-5 w-5 fill-current" /> CONTINUAR
                </Button>

                <div className="w-full max-w-xs border-t border-slate-700 pt-6">
                    <p className="text-slate-400 text-sm mb-4 uppercase tracking-wider">Cambiar Dificultad (Reiniciará)</p>
                    <div className="grid gap-3">
                         <DifficultyButtons onSelect={handleDifficultyRequest} currentDifficulty={difficulty} />
                    </div>
                </div>
             </div>
        )}

        {/* --- MODAL: CONFIRMACIÓN --- */}
        {showConfirmRestart && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                 <div className="bg-slate-800 border-2 border-yellow-600 p-6 rounded-xl max-w-sm w-full shadow-2xl">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">¿Reiniciar Partida?</h3>
                    <p className="text-slate-300 mb-6 text-sm">
                        Cambiar la dificultad iniciará una nueva partida.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={cancelRestart} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            Cancelar
                        </Button>
                        <Button onClick={confirmRestart} className="bg-yellow-600 hover:bg-yellow-500 text-white">
                            Sí, Reiniciar
                        </Button>
                    </div>
                 </div>
            </div>
        )}

        {/* --- PANTALLA: GAME OVER --- */}
        {gameState === 'gameover' && (
             <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-sm text-white animate-in zoom-in duration-300">
                <h2 className="text-6xl font-black mb-2 tracking-tighter drop-shadow-xl text-red-200">GAME OVER</h2>
                <div className="bg-black/30 p-6 rounded-xl mb-8 border border-white/10">
                    <p className="text-xl font-mono text-center">Puntuación Final</p>
                    <p className="text-5xl font-bold text-center text-yellow-400">{score}</p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        size="lg" 
                        onClick={() => setGameState('menu')} 
                        className="gap-2 px-6 py-6 text-lg bg-slate-800 text-white hover:bg-slate-700 border border-slate-600"
                    >
                        <Settings className="w-5 h-5"/> Menú
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={() => startGame()} 
                        className="gap-2 px-6 py-6 text-lg bg-white text-red-900 hover:bg-gray-200 font-bold shadow-xl"
                    >
                        <RefreshCcw className="w-5 h-5" /> Reintentar
                    </Button>
                </div>
             </div>
        )}

        {/* --- TABLERO --- */}
        <div 
            className="w-full h-full relative"
            style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
            ref={gameBoardRef}
        >
            {/* Snake */}
            {snake.map((segment, i) => {
                const isHead = i === 0;
                
                // Determinamos clases para la cabeza según el estado de la animación
                let headClasses = "bg-cyan-400 z-20 shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-110";
                
                if (isHead) {
                    if (headAnim === 'error') headClasses = "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-head-error";
                    else if (headAnim === 'success') headClasses = "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.9)] animate-head-success";
                    else if (headAnim === 'bonus') headClasses = "bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)] animate-head-bonus";
                }

                return (
                    <div
                        key={i}
                        className={cn(
                            "relative rounded-sm transition-all duration-75",
                            isHead ? headClasses : "bg-cyan-600/80 z-10"
                        )}
                        style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
                    >
                        {isHead && (
                            <div className="w-full h-full flex items-center justify-center gap-[1px]">
                                <div className="bg-black w-[20%] h-[20%] rounded-full"></div>
                                <div className="bg-black w-[20%] h-[20%] rounded-full"></div>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Comida / Palabras */}
            {food.map((item) => {
                let colorClass = "bg-slate-700 border-slate-500 text-slate-200"; 
                
                if (showHelp || item.type === 'bonus') {
                    if (item.type === 'valid') colorClass = "bg-green-900/80 border-green-500 text-green-200 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
                    else if (item.type === 'invalid') colorClass = "bg-red-900/80 border-red-500 text-red-200";
                    else if (item.type === 'bonus') colorClass = "bg-yellow-500/20 border-yellow-400 text-yellow-200 animate-pulse";
                }

                const timeLeft = item.expiresAt - Date.now();
                const isExpiring = timeLeft < ITEM_BLINK_TIME;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "flex items-center justify-center relative z-0 transition-opacity",
                            isExpiring && "animate-pulse" 
                        )}
                        style={{ gridColumnStart: item.x + 1, gridRowStart: item.y + 1 }}
                    >
                        {item.type === 'bonus' ? (
                            <Star className="w-full h-full text-yellow-400 animate-spin-slow p-1" fill="currentColor" />
                        ) : (
                            <div className={`w-3/4 h-3/4 rounded-full border-2 ${colorClass.split(" ")[0]} ${colorClass.split(" ")[1]}`}></div>
                        )}

                        {item.word && (
                            <span className={cn(
                                "absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold border pointer-events-none z-30 transition-colors duration-300",
                                colorClass
                            )}>
                                {item.word}
                            </span>
                        )}
                    </div>
                )
            })}
        </div>

        {/* Botón Ayuda */}
        {gameState === 'playing' && !isPaused && difficulty !== 'hard' && (
            <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                    "absolute top-4 right-4 z-30 bg-slate-800 border-slate-600 hover:bg-slate-700 transition-colors",
                    showHelp ? "text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]" : "text-slate-500"
                )}
                onClick={toggleHelp}
                title="Activar/Desactivar pistas de color"
            >
                {showHelp ? <Lightbulb className="h-5 w-5" /> : <LightbulbOff className="h-5 w-5" />}
            </Button>
        )}
      </div>

      {/* Controles Móvil */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs sm:hidden mt-2">
        <div />
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-xl active:scale-95 transition-transform" onPointerDown={() => changeDir(0, -1)}><ArrowUp /></Button>
        <div />
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-xl active:scale-95 transition-transform" onPointerDown={() => changeDir(-1, 0)}><ArrowLeft /></Button>
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-xl active:scale-95 transition-transform" onPointerDown={() => changeDir(0, 1)}><ArrowDown /></Button>
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-xl active:scale-95 transition-transform" onPointerDown={() => changeDir(1, 0)}><ArrowRight /></Button>
      </div>
    </div>
  );
};

const DifficultyButtons = ({ onSelect, currentDifficulty }) => (
    <>
        <Button 
            onClick={() => onSelect('easy')}
            className={cn(
                "h-14 text-lg bg-green-600 hover:bg-green-500 border-b-4 border-green-800 hover:border-green-700 active:border-b-0 active:mt-1 transition-all",
                currentDifficulty === 'easy' && "ring-2 ring-white"
            )}
        >
            <ShieldCheck className="mr-2 h-5 w-5" /> FÁCIL
        </Button>
        <Button 
            onClick={() => onSelect('medium')}
            className={cn(
                "h-14 text-lg bg-yellow-600 hover:bg-yellow-500 border-b-4 border-yellow-800 hover:border-yellow-700 active:border-b-0 active:mt-1 transition-all text-white",
                currentDifficulty === 'medium' && "ring-2 ring-white"
            )}
        >
            <Settings className="mr-2 h-5 w-5" /> MEDIO
        </Button>
        <Button 
            onClick={() => onSelect('hard')}
            className={cn(
                "h-14 text-lg bg-red-600 hover:bg-red-500 border-b-4 border-red-800 hover:border-red-700 active:border-b-0 active:mt-1 transition-all",
                currentDifficulty === 'hard' && "ring-2 ring-white"
            )}
        >
            <Skull className="mr-2 h-5 w-5" /> DIFÍCIL
        </Button>
    </>
);

export default SnakeDePalabras;