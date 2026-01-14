import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Play, Pause, Star, Lightbulb, LightbulbOff, AlertTriangle, Zap, Sparkles, BookOpen, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Configuración del tablero y tiempos
const GRID_SIZE = 25;
const SPEED_INITIAL = 250;
const SPEED_MIN = 100;
const ITEM_LIFESPAN = 15000;
const ITEM_BLINK_TIME = 5000;

const SnakeDePalabras = (props) => {
  const params = useParams();
  const level = props.level || params.level;
  const grade = props.grade || params.grade;
  const subjectId = props.subjectId || params.subjectId;

  // --- ESTADOS DEL JUEGO ---
  const [snake, setSnake] = useState([{ x: 12, y: 12 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [food, setFood] = useState([]);
  const [score, setScore] = useState(0);

  // Estados de Racha (Combos)
  const [combo, setCombo] = useState(0); // Racha de palabras correctas
  const [starCombo, setStarCombo] = useState(0); // Racha de estrellas

  // Estado para el crecimiento acumulado (Power-up)
  const [pendingGrowth, setPendingGrowth] = useState(0);

  // Estados visuales (Feedback)
  const [headAnim, setHeadAnim] = useState(null);
  const [textSize, setTextSize] = useState(12);

  // Estados de flujo
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameover', 'levelup'
  const [isPaused, setIsPaused] = useState(false);
  const [nextTopic, setNextTopic] = useState(''); // Para mostrar en el popup

  // Configuración
  const [difficulty, setDifficulty] = useState('medium');
  const [pendingDifficulty, setPendingDifficulty] = useState(null);
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

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
      // Detenemos el loop si no está jugando o está pausado (incluye estado 'levelup')
      if (gameState !== 'playing' || isPaused) return;

      const now = Date.now();
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

          // Si es bonus, handleEat se encarga de la lógica especial (pausa, cambio de nivel)
          // Si NO es bonus, eliminamos la comida aquí
          if (eatenItem.type !== 'bonus') {
            const newFoodList = [...food];
            newFoodList.splice(eatenFoodIndex, 1);
            setFood(newFoodList);
          }
        } else {
          // Si NO hemos comido
          if (pendingGrowth > 0) {
            // Crecimiento por Power-up: no borramos cola
            setPendingGrowth(prev => prev - 1);
          } else {
            // Normal: borramos cola para mantener tamaño
            newSnake.pop();
          }
        }

        return newSnake;
      });
    };
  });

  // Trigger ref updates
  useEffect(() => {
    savedCallback.current = savedCallback.current;
  }, [gameState, isPaused, direction, food, difficulty, currentCatIndex, pendingGrowth, combo, starCombo]);

  // Timer del Loop
  useEffect(() => {
    // El timer solo corre si estamos en 'playing'
    if (gameState !== 'playing' || isPaused) return;
    const tickTime = Math.max(SPEED_MIN, SPEED_INITIAL - (score * 2));
    const id = setInterval(() => {
      if (savedCallback.current) savedCallback.current();
    }, tickTime);
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

      // Bloquear controles si no estamos jugando (ej. durante levelup)
      if (gameState !== 'playing' || isPaused) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
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
    if (isPaused || gameState !== 'playing') return;
    if ((x !== 0 && direction.x !== 0) || (y !== 0 && direction.y !== 0)) return;
    setDirection({ x, y });
  };

  // --- LÓGICA DE PUNTUACIÓN Y COMBOS ---
  const handleEat = (item) => {
    if (item.type === 'bonus') {
      // BONUS (Estrella)
      const newStarCombo = starCombo + 1;
      setStarCombo(newStarCombo);

      const points = newStarCombo * 500;
      setScore(s => s + points);

      // Animación inmediata
      triggerAnim('bonus');

      // --- TRANSICIÓN DE TEMA ---
      const nextIndex = (currentCatIndex + 1) % categories.length;
      const nextCatName = categories.length > 0 ? formatName(categories[nextIndex]) : '';

      // 1. Preparamos datos para el popup
      setNextTopic(nextCatName);
      // 2. Cambiamos estado para detener el juego y mostrar popup
      setGameState('levelup');

      // 3. Temporizador de 3 segundos
      setTimeout(() => {
        // Acciones al terminar la transición
        setCurrentCatIndex(nextIndex);
        setFood([]); // Limpiar comida vieja
        setPendingGrowth(p => p + 10); // Crecer
        setGameState('playing'); // Reanudar juego
        setNextTopic(''); // Limpiar popup
      }, 3000);

    } else if (item.type === 'valid') {
      // PALABRA CORRECTA
      const newCombo = combo + 1;
      setCombo(newCombo);

      const points = newCombo * 50;
      setScore(s => s + points);
      triggerAnim('success');

    } else {
      // PALABRA INCORRECTA
      setCombo(0);
      setStarCombo(0);

      setScore(s => Math.max(0, s - 15));
      triggerAnim('error');
    }
  };

  const endGame = () => {
    setGameState('gameover');
    setIsPaused(false);
  };

  const startGame = (targetDifficulty = null) => {
    if (targetDifficulty) setDifficulty(targetDifficulty);

    setSnake([{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }]);
    setDirection({ x: 1, y: 0 });
    setFood([]);
    setScore(0);
    setPendingGrowth(0);
    setCombo(0);
    setStarCombo(0);
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

  if (loading) return <div className="text-slate-500 text-center p-10 animate-pulse font-bold">Cargando juego...</div>;
  if (loadingError) return <div className="text-red-400 text-center p-10 font-bold">Error cargando datos.</div>;

  const currentCategoryName = categories.length > 0 ? formatName(categories[currentCatIndex]) : '';

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 gap-6 relative">

      {/* Estilos Animaciones y Cola */}
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
        @keyframes zoomInUp {
            0% { opacity: 0; transform: scale(0.5) translateY(50px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .animate-head-error { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-head-success { animation: popGreen 0.4s ease-out both; }
        .animate-head-bonus { animation: popGold 0.5s ease-out both; }
        .animate-popup-in { animation: zoomInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-float { animation: float 3s ease-in-out infinite; }

        .tail-up { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
        .tail-down { clip-path: polygon(0% 0%, 100% 0%, 50% 100%); }
        .tail-left { clip-path: polygon(100% 0%, 100% 100%, 0% 50%); }
        .tail-right { clip-path: polygon(0% 0%, 0% 100%, 100% 50%); }
      `}</style>

      {/* HEADER CENTRADO */}
      <div className="w-full max-w-[600px] flex flex-col sm:flex-row justify-between items-end sm:items-end gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-4xl md:text-5xl font-black gradient-text pb-2">
            NEON SNAKE
          </h1>
          {gameState === 'playing' && (
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-slate-400 text-sm font-bold">Objetivo:</span>
              <span className="text-yellow-600 font-bold text-lg uppercase tracking-wider animate-pulse">
                {currentCategoryName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex flex-col items-end mr-2 relative">
            {/* Indicador de Combo */}
            {combo > 1 && (
              <div className="absolute -top-6 right-0 text-yellow-500 font-bold text-sm animate-bounce">
                x{combo} Racha!
              </div>
            )}

            <div className="text-slate-400 text-xs uppercase tracking-widest mb-0 font-bold">Puntuación</div>
            <div className="text-4xl font-black text-green-600 drop-shadow-sm leading-none">
              {score.toString().padStart(4, '0')}
            </div>
          </div>

          {gameState === 'playing' && difficulty !== 'hard' && (
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full border-2 transition-all shadow-sm",
                showHelp
                  ? "bg-white border-yellow-400 text-yellow-500 hover:bg-yellow-50"
                  : "bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200"
              )}
              onClick={toggleHelp}
              title="Ayuda de color"
            >
              {showHelp ? <Lightbulb className="h-6 w-6" /> : <LightbulbOff className="h-6 w-6" />}
            </Button>
          )}

          {gameState === 'playing' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
                onClick={() => {
                  setIsPaused(true);
                  setShowCheatSheet(true);
                }}
                title="Guía de palabras"
              >
                <BookOpen className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
                onClick={togglePause}
              >
                {isPaused ? <Play className="fill-current h-5 w-5" /> : <Pause className="fill-current h-5 w-5" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative w-full max-w-[600px] aspect-square bg-slate-900 border-4 border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-4 ring-black/10">

        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
          }}>
        </div>

        {/* POPUP DE NIVEL (NUEVO) */}
        {gameState === 'levelup' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="animate-popup-in flex flex-col items-center text-center p-6 rounded-3xl bg-black/40 border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <div className="relative mb-4 animate-float">
                <Star className="w-24 h-24 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                <Sparkles className="absolute -top-2 -right-4 w-10 h-10 text-yellow-200 animate-pulse" />
              </div>

              <h2 className="text-3xl font-black text-white mb-2 tracking-wide uppercase drop-shadow-md">
                ¡Nueva Temática!
              </h2>

              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-4"></div>

              <p className="text-4xl md:text-5xl font-black bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight px-4 py-2">
                {nextTopic}
              </p>

              <p className="text-yellow-200/60 font-bold mt-4 text-sm uppercase tracking-widest animate-pulse">
                Preparando tablero...
              </p>
            </div>
          </div>
        )}

        {/* MENÚ */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 z-40 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <h2 className="text-4xl font-black text-white mb-6 tracking-wide">Elige Dificultad</h2>

            {/* Selector Dificultad */}
            <div className="grid gap-4 w-full max-w-xs mb-8">
              <DifficultyButtons onSelect={handleDifficultyRequest} currentDifficulty={difficulty} />
            </div>

            {/* Slider Texto */}
            <div className="w-full max-w-xs bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between text-slate-300 text-sm font-bold mb-2">
                <span>Tamaño Texto</span>
                <span>{textSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="24"
                step="1"
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
              />
            </div>
          </div>
        )}

        {/* PAUSA */}
        {isPaused && !showConfirmRestart && gameState === 'playing' && (
          <div className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
            <h2 className="text-4xl font-black text-white mb-6 tracking-wide">PAUSA</h2>

            <Button onClick={togglePause} className="w-full max-w-xs h-14 text-xl bg-blue-600 hover:bg-blue-500 mb-6 font-bold shadow-lg shadow-blue-900/50 rounded-xl">
              <Play className="mr-2 h-6 w-6 fill-current" /> CONTINUAR
            </Button>

            <div className="w-full max-w-xs border-t border-slate-700 pt-6 space-y-6">

              {/* Slider Texto */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between text-slate-300 text-sm font-bold mb-2">
                  <span>Tamaño Texto</span>
                  <span>{textSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="1"
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-4 font-bold uppercase tracking-wider">Cambiar Dificultad</p>
                <div className="grid gap-3">
                  <DifficultyButtons onSelect={handleDifficultyRequest} currentDifficulty={difficulty} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMACIÓN REINICIO */}
        {showConfirmRestart && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="bg-slate-800 border-2 border-yellow-600 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">¿Reiniciar?</h3>
              <p className="text-slate-300 mb-6 font-medium">
                Perderás tu progreso actual.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={cancelRestart} className="border-slate-600 text-slate-300 hover:bg-slate-700 font-bold">
                  Cancelar
                </Button>
                <Button onClick={confirmRestart} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
                  Sí, Reiniciar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/95 backdrop-blur-sm text-white animate-in zoom-in duration-300">
            <h2 className="text-6xl font-black mb-2 tracking-tighter drop-shadow-xl text-red-100">GAME OVER</h2>
            <div className="bg-black/20 p-6 rounded-2xl mb-8 border border-white/10 w-64 text-center">
              <p className="text-lg font-bold text-red-200 mb-1">Puntuación Final</p>
              <p className="text-5xl font-black text-yellow-400">{score}</p>
              {difficulty === 'hard' && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-bottom-2 fade-in duration-700">
                  <p className="text-xs font-bold text-red-200 mb-1 uppercase tracking-widest">Nota Examen</p>
                  <div className="text-4xl font-black text-white flex items-center justify-center gap-1">
                    {/* Cálculo: 100,000 = 10. Máximo 10. 2 decimales. */}
                    {Math.min(score / 5000, 10).toFixed(2)}
                    <span className="text-lg text-white/50 font-bold mt-2">/10</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => setGameState('menu')}
                className="gap-2 px-6 py-6 text-lg bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 rounded-xl font-bold"
              >
                Menú
              </Button>
              <Button
                size="lg"
                onClick={() => startGame()}
                className="gap-2 px-6 py-6 text-lg bg-white text-red-900 hover:bg-red-50 font-black shadow-xl rounded-xl"
              >
                <RefreshCcw className="w-6 h-6 mr-2" /> Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* TABLERO */}
        <div
          className="w-full h-full relative"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
          ref={gameBoardRef}
        >
          {/* MODAL GUÍA DE CATEGORÍAS (CHEAT SHEET) */}
          <AnimatePresence>
            {showCheatSheet && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col p-6 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" /> Guía de Palabras
                  </h2>
                  <button
                    onClick={() => setShowCheatSheet(false)}
                    className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors border-2 border-slate-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid gap-4">
                    {data && Object.entries(data)
                      .filter(([key]) => key !== 'title' && key !== 'instructions')
                      .map(([category, words], idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={category}
                          className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 shadow-inner"
                        >
                          <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-3 px-2 border-l-4 border-blue-500">
                            {category.replace(/_/g, ' ')}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(words) && words.map((word, wIdx) => (
                              <span
                                key={wIdx}
                                className="px-2.5 py-1 bg-slate-950/60 text-slate-300 rounded-lg text-[11px] border border-white/5 font-medium"
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
                      // NO reanudamos automáticamente para que el usuario pueda prepararse
                    }}
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
                  >
                    ¡Lo tengo!
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Snake */}
          {snake.map((segment, i) => {
            const isHead = i === 0;
            const isTail = i === snake.length - 1 && snake.length > 1;

            let headClasses = "bg-cyan-400 z-20 shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-110";
            let tailClass = '';

            if (isHead) {
              if (headAnim === 'error') headClasses = "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-head-error";
              else if (headAnim === 'success') headClasses = "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.9)] animate-head-success";
              else if (headAnim === 'bonus') headClasses = "bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)] animate-head-bonus";
            } else if (isTail) {
              // Determinar dirección de la cola
              const prev = snake[i - 1];
              if (prev.y < segment.y) tailClass = 'tail-down';
              else if (prev.y > segment.y) tailClass = 'tail-up';
              else if (prev.x < segment.x) tailClass = 'tail-right';
              else if (prev.x > segment.x) tailClass = 'tail-left';
            }

            return (
              <div
                key={i}
                className={cn(
                  "relative transition-all duration-75",
                  !isTail && "rounded-sm", // La cola no es redondeada
                  isHead ? headClasses : (isTail ? `bg-cyan-600/80 z-10 ${tailClass}` : "bg-cyan-600/80 z-10")
                )}
                style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
              >
                {isHead && (
                  // Cabeza Original (Puntos)
                  <div className="w-full h-full flex items-center justify-center gap-[1px]">
                    <div className="bg-black w-[20%] h-[20%] rounded-full opacity-60"></div>
                    <div className="bg-black w-[20%] h-[20%] rounded-full opacity-60"></div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Comida */}
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
                  <span
                    className={cn(
                      "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded font-bold border pointer-events-none z-30 transition-colors duration-300 shadow-md",
                      colorClass
                    )}
                    style={{ fontSize: `${textSize}px` }}
                  >
                    {item.word}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Controles Móvil/Tablet (visible hasta 2xl) */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs 2xl:hidden mt-2">
        <div />
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => changeDir(0, -1)}><ArrowUp /></Button>
        <div />
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => changeDir(-1, 0)}><ArrowLeft /></Button>
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => changeDir(0, 1)}><ArrowDown /></Button>
        <Button variant="secondary" className="h-16 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => changeDir(1, 0)}><ArrowRight /></Button>
      </div>
    </div>
  );
};

const DifficultyButtons = ({ onSelect, currentDifficulty }) => (
  <>
    <Button
      onClick={() => onSelect('easy')}
      className={cn(
        "h-14 text-xl font-bold bg-green-600 hover:bg-green-500 border-b-4 border-green-800 hover:border-green-700 active:border-b-0 active:mt-1 transition-all rounded-xl",
        currentDifficulty === 'easy' && "ring-4 ring-white"
      )}
    >
      <span className="mr-3 text-2xl">🌱</span> FÁCIL
    </Button>
    <Button
      onClick={() => onSelect('medium')}
      className={cn(
        "h-14 text-xl font-bold bg-yellow-600 hover:bg-yellow-500 border-b-4 border-yellow-800 hover:border-yellow-700 active:border-b-0 active:mt-1 transition-all text-white rounded-xl",
        currentDifficulty === 'medium' && "ring-4 ring-white"
      )}
    >
      <span className="mr-3 text-2xl">🤖</span> MEDIO
    </Button>
    <Button
      onClick={() => onSelect('hard')}
      className={cn(
        "h-14 text-xl font-bold bg-red-600 hover:bg-red-500 border-b-4 border-red-800 hover:border-red-700 active:border-b-0 active:mt-1 transition-all rounded-xl",
        currentDifficulty === 'hard' && "ring-4 ring-white"
      )}
    >
      <span className="mr-3 text-2xl">💀</span> EXAMEN
    </Button>
  </>
);

export default SnakeDePalabras;