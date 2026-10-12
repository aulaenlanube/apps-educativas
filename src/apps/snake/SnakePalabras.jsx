import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Play, Pause, Lightbulb, LightbulbOff, AlertTriangle, Star,
  Target, Flame, LayoutGrid, Ruler, Trophy, Sprout, GraduationCap, Type,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRunnerData } from '../../services/gameDataService';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, KeyTile, GameButton, Segmented,
  ModeSelect, ResultsScreen, GameLoading, GameEmpty,
} from '../_shared/kit';
import { SnakeStar, SnakeWordGuide } from './SnakeParts';
import './Snake.css';

// Configuración del tablero y tiempos
const GRID_SIZE = 25;
const SPEED_INITIAL = 250;
const SPEED_MIN = 100;
const ITEM_LIFESPAN = 15000;
const ITEM_BLINK_TIME = 5000;

// Tamaños de letra de las palabras (solo presentación)
const TEXT_SIZES = [
  { value: 10, label: 'S' },
  { value: 12, label: 'M' },
  { value: 15, label: 'L' },
  { value: 19, label: 'XL' },
];

// Grados de giro de la cabeza según la dirección (solo dibujo)
const headAngle = (d) => (d.x === 1 ? 0 : d.x === -1 ? 180 : d.y === 1 ? 90 : d.y === -1 ? -90 : 0);

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
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Datos
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // Refs
  const savedCallback = useRef();
  const gameBoardRef = useRef(null);
  const gameStartRef = useRef(0);

  const formatName = (name) => name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  // 1. CARGA DE DATOS
  useEffect(() => {
    if (!level || !grade || !subjectId) return;

    setLoading(true);
    getRunnerData(level, grade, subjectId)
      .then(jsonData => {
        if (!jsonData || Object.keys(jsonData).length === 0) throw new Error("Datos no encontrados");
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
    // eslint-disable-next-line no-self-assign
    savedCallback.current = savedCallback.current;
  }, [gameState, isPaused, direction, food, difficulty, currentCatIndex, pendingGrowth, combo, starCombo]);

  // Timer del Loop
  useEffect(() => {
    // El timer solo corre si estamos en 'playing'
    if (gameState !== 'playing' || isPaused) return;
    const tickTime = Math.max(SPEED_MIN, SPEED_INITIAL - Math.floor(score / 50));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    gameStartRef.current = Date.now();
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

  // Salir de la partida en curso a la pantalla de modos (antes: cambiar de
  // dificultad desde la pausa). Pide confirmación con un modal propio.
  const requestExit = () => {
    setIsPaused(true);
    setShowConfirmRestart(true);
  };

  const confirmExit = () => {
    setShowConfirmRestart(false);
    setIsPaused(false);
    setGameState('menu');
  };

  const cancelRestart = () => {
    setShowConfirmRestart(false);
  };

  // Guía de palabras: como antes, abrirla en plena partida la pausa (y lo
  // mismo con las instrucciones, para que la serpiente no choque detrás)
  const openGuide = () => {
    if (gameState === 'playing') setIsPaused(true);
    setShowCheatSheet(true);
  };
  const openInstructions = () => {
    if (gameState === 'playing') setIsPaused(true);
    setShowInstructions(true);
  };

  const shellProps = { theme: 'dark', accent: '#84cc16', accent2: '#22d3ee', className: 'snk' };
  // Tracking: mismo componente y mismas props que antes. Va SIEMPRE como primer
  // hijo del escenario para que sea la misma instancia en todas las pantallas.
  const tracker = (
    <SnakeTracker gameState={gameState} score={score} difficulty={difficulty} gameStartRef={gameStartRef} onGameComplete={props.onGameComplete} />
  );
  const isExam = difficulty === 'hard';
  const currentCategoryName = categories.length > 0 ? formatName(categories[currentCatIndex]) : '';

  const instructions = (
    <>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Cómo jugar a Snake">
        <h3>🎯 Objetivo</h3>
        <p>
          Guía a la serpiente para que se coma solo las palabras de la <strong>temática objetivo</strong>.
          Cada acierto seguido multiplica tus puntos; una palabra equivocada te quita puntos y corta la racha.
        </p>
        <h3>🕹️ Controles</h3>
        <ul>
          <li><strong>Flechas</strong> del teclado o la <strong>cruceta</strong> táctil para girar.</li>
          <li><strong>P</strong> o <strong>Esc</strong> para pausar.</li>
          <li>La <strong>estrella</strong> da muchos puntos, hace crecer la serpiente y cambia de temática.</li>
          <li>Las palabras que parpadean están a punto de desaparecer.</li>
        </ul>
        <h3>🎓 Modos de juego</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fácil</strong> Atraviesas las paredes y ves los colores de ayuda.</div>
          <div className="instr-mode medium"><strong>Medio</strong> Las paredes son letales. Ayuda de colores activable.</div>
          <div className="instr-mode exam"><strong>Examen</strong> Sin ayudas. Al terminar recibes tu nota sobre 10.</div>
        </div>
      </InstructionsModal>
      <InstructionsModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} title="Guía de palabras">
        <SnakeWordGuide data={data} current={categories[currentCatIndex]} />
      </InstructionsModal>
    </>
  );

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Preparando el tablero…" />
      </GameShell>
    );
  }
  if (loadingError) {
    return (
      <GameShell {...shellProps}>
        <GameHeader />
        <GameEmpty title="No hay palabras">No se han podido cargar las palabras de esta asignatura.</GameEmpty>
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo ---
  if (gameState === 'menu') {
    return (
      <GameShell {...shellProps}>
        {tracker}
        <ModeSelect
          modes={[
            { id: 'easy', tone: 'easy', icon: Sprout, title: 'Fácil', desc: 'Atraviesa las paredes y aparece por el lado contrario.', features: ['Paredes sin peligro', 'Colores de ayuda'] },
            { id: 'medium', tone: 'medium', icon: Flame, title: 'Medio', desc: 'Las paredes ya no perdonan: ¡cuidado con chocar!', features: ['Paredes letales', 'Ayuda de colores activable'] },
            { id: 'hard', tone: 'exam', icon: GraduationCap, title: 'Examen', desc: 'Sin ayudas: tú decides qué palabras son de la temática.', features: ['Nota sobre 10', 'Puntos por rapidez'] },
          ]}
          onSelect={(id) => startGame(id)}
          onHelp={() => setShowInstructions(true)}
          onStudy={() => setShowCheatSheet(true)}
          extra={(
            <div className="snk-option">
              <span className="snk-option__label"><Type size={15} /> Tamaño de las palabras</span>
              <Segmented size="sm" options={TEXT_SIZES} value={textSize} onChange={setTextSize} />
            </div>
          )}
          footer="Flechas o cruceta para girar · P para pausar"
        />
        {instructions}
      </GameShell>
    );
  }

  // --- Examen terminado: resumen con la nota (misma fórmula que ya se mostraba: 10.000 pts = 10) ---
  if (gameState === 'gameover' && isExam) {
    const notaVis = Math.min(score / 1000, 10);
    return (
      <GameShell {...shellProps}>
        {tracker}
        <ResultsScreen
          title="¡Fin del examen!"
          nota={notaVis}
          points={score}
          stats={[
            { icon: Ruler, tone: 'good', label: 'Longitud', value: snake.length },
            { icon: Target, tone: 'accent', label: 'Temática', value: currentCategoryName || '—' },
          ]}
          actions={[
            { label: 'Otro examen', onClick: () => startGame('hard'), icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => setGameState('menu'), icon: LayoutGrid, variant: 'soft' },
          ]}
        />
        {instructions}
      </GameShell>
    );
  }

  const modeTone = difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'exam';
  const angle = headAngle(direction);
  const len = snake.length;

  return (
    <GameShell {...shellProps}>
      {tracker}
      <GameHeader
        mode={modeTone}
        onHelp={openInstructions}
        onStudy={openGuide}
        right={(
          <Hud>
            <HudStat icon={Star} tone="score" value={score.toString().padStart(4, '0')} label="Puntos" />
            <HudStat icon={Flame} tone="streak" value={`x${combo}`} label="Racha" />
          </Hud>
        )}
      />

      <div className="snk-topbar">
        <div className={`snk-target ${gameState === 'levelup' ? 'is-changing' : ''}`}>
          <span className="snk-target__icon"><Target size={18} /></span>
          <span className="snk-target__text">
            <small>Come solo</small>
            <strong key={currentCategoryName}>{currentCategoryName}</strong>
          </span>
        </div>
        <div className="snk-topbar__tools">
          {!isExam && (
            <button
              type="button"
              className={`gk-iconbtn snk-tool ${showHelp ? 'is-on' : ''}`}
              onClick={toggleHelp}
              title={showHelp ? 'Ocultar colores de ayuda' : 'Mostrar colores de ayuda'}
              aria-pressed={showHelp}
            >
              {showHelp ? <Lightbulb size={18} /> : <LightbulbOff size={18} />}
            </button>
          )}
          <button
            type="button"
            className="gk-iconbtn snk-tool"
            onClick={togglePause}
            disabled={gameState !== 'playing'}
            title={isPaused ? 'Continuar' : 'Pausa'}
            aria-label={isPaused ? 'Continuar' : 'Pausa'}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {/* TABLERO */}
      <div className={`snk-board snk-board--${modeTone} ${gameState === 'gameover' ? 'is-over' : ''}`}>
        <div className="snk-board__grid" style={{ backgroundSize: `${200 / GRID_SIZE}% ${200 / GRID_SIZE}%` }} aria-hidden="true" />
        <div className="snk-board__glow" aria-hidden="true" />

        <div
          className="snk-cells"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
          ref={gameBoardRef}
        >
          {/* Comida */}
          {food.map((item) => {
            const tone = item.type === 'bonus' ? 'bonus' : showHelp ? item.type : 'neutral';
            const isExpiring = item.expiresAt - Date.now() < ITEM_BLINK_TIME;
            return (
              <div
                key={item.id}
                className={`snk-food is-${tone} ${isExpiring ? 'is-expiring' : ''}`}
                style={{ gridColumnStart: item.x + 1, gridRowStart: item.y + 1 }}
              >
                {item.type === 'bonus' ? <SnakeStar /> : <span className="snk-food__orb" />}
                {item.word && (
                  <span
                    className={`snk-word ${item.y < 2 ? 'is-below' : ''} ${item.x < 3 ? 'is-left' : item.x > GRID_SIZE - 4 ? 'is-right' : ''}`}
                    style={{ fontSize: `${textSize}px` }}
                  >
                    {item.word}
                  </span>
                )}
              </div>
            );
          })}

          {/* Serpiente */}
          {snake.map((segment, i) => {
            const isHead = i === 0;
            const isTail = i === len - 1 && len > 1;
            const t = len > 1 ? i / (len - 1) : 0;
            return (
              <div
                key={i}
                className={`snk-seg ${isHead ? 'snk-seg--head' : ''} ${isTail ? 'snk-seg--tail' : ''} ${i % 2 ? 'is-alt' : ''}`}
                style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1, '--t': t }}
              >
                {isHead && (
                  <span className={`snk-head ${headAnim ? `is-${headAnim}` : ''}`}>
                    <span className="snk-head__face" style={{ transform: `rotate(${angle}deg)` }}>
                      <i className="snk-eye snk-eye--a" />
                      <i className="snk-eye snk-eye--b" />
                      <i className="snk-tongue" />
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Nueva temática */}
        <AnimatePresence>
          {gameState === 'levelup' && (
            <motion.div className="snk-overlay snk-overlay--soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="snk-card snk-card--gold"
                initial={{ scale: 0.6, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <span className="snk-card__rays" aria-hidden="true" />
                <span className="snk-card__star"><SnakeStar /></span>
                <span className="snk-card__kicker">¡Nueva temática!</span>
                <strong className="snk-card__topic">{nextTopic}</strong>
                <span className="snk-card__hint">+10 de longitud · prepara la siguiente racha</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pausa */}
        <AnimatePresence>
          {isPaused && !showConfirmRestart && gameState === 'playing' && (
            <motion.div className="snk-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="snk-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <span className="snk-card__badge"><Pause size={26} /></span>
                <strong className="snk-card__title">Pausa</strong>
                <GameButton size="lg" icon={Play} onClick={togglePause} autoFocus>Continuar</GameButton>
                <div className="snk-option snk-option--stack">
                  <span className="snk-option__label"><Type size={15} /> Tamaño de las palabras</span>
                  <Segmented size="sm" options={TEXT_SIZES} value={textSize} onChange={setTextSize} />
                </div>
                {!isExam && (
                  <GameButton variant="soft" icon={LayoutGrid} onClick={requestExit}>Cambiar de modo</GameButton>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmación de salida */}
        <AnimatePresence>
          {showConfirmRestart && (
            <motion.div className="snk-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="snk-card snk-card--warn" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <span className="snk-card__badge"><AlertTriangle size={26} /></span>
                <strong className="snk-card__title">¿Salir de la partida?</strong>
                <p className="snk-card__text">Perderás el progreso de esta partida.</p>
                <div className="snk-card__row">
                  <GameButton variant="soft" onClick={cancelRestart}>Cancelar</GameButton>
                  <GameButton variant="warning" icon={LayoutGrid} onClick={confirmExit}>Sí, salir</GameButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fin de partida (práctica) */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div className="snk-overlay snk-overlay--over" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                className="snk-card snk-card--over"
                initial={{ scale: 0.7, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
              >
                <span className="snk-card__kicker">Game over</span>
                <strong className="snk-card__score">{score}</strong>
                <span className="snk-card__hint">puntos</span>
                <div className="snk-card__stats">
                  <span><Ruler size={14} /> Longitud {len}</span>
                  <span><Target size={14} /> {currentCategoryName}</span>
                </div>
                <div className="snk-card__row">
                  <GameButton size="lg" icon={RefreshCw} onClick={() => startGame()} autoFocus>Reintentar</GameButton>
                  <GameButton variant="soft" icon={LayoutGrid} onClick={() => setGameState('menu')}>Modos</GameButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cruceta táctil */}
      <div className="snk-pad" aria-label="Controles de dirección">
        <span />
        <KeyTile className="snk-pad__key" onPointerDown={() => changeDir(0, -1)} aria-label="Arriba"><ArrowUp size={24} /></KeyTile>
        <span />
        <KeyTile className="snk-pad__key" onPointerDown={() => changeDir(-1, 0)} aria-label="Izquierda"><ArrowLeft size={24} /></KeyTile>
        <KeyTile className="snk-pad__key" onPointerDown={() => changeDir(0, 1)} aria-label="Abajo"><ArrowDown size={24} /></KeyTile>
        <KeyTile className="snk-pad__key" onPointerDown={() => changeDir(1, 0)} aria-label="Derecha"><ArrowRight size={24} /></KeyTile>
      </div>

      <div className="snk-legend">
        {showHelp && <span><i className="snk-legend__dot is-valid" /> Temática objetivo</span>}
        {showHelp && <span><i className="snk-legend__dot is-invalid" /> Otra temática</span>}
        <span><Trophy size={13} /> La estrella da puntos extra y cambia la temática</span>
      </div>

      {instructions}
    </GameShell>
  );
};

function SnakeTracker({ gameState, score, difficulty, gameStartRef, onGameComplete }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (gameState === 'gameover' && !tracked.current) {
      tracked.current = true;
      const wordsCollected = Math.floor(score / 10);
      const TARGET_WORDS = 30; // 30 palabras = nota 10
      const isExam = difficulty === 'hard';
      // Bonus por rapidez en examen: presupuesto 4s/palabra (120s objetivo)
      const elapsedSec = gameStartRef?.current
        ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
        : 0;
      const TIME_BUDGET = TARGET_WORDS * 4;
      const SPEED_COEF = 5;
      const timeBonus = isExam && elapsedSec > 0
        ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
        : 0;
      onGameComplete?.({
        mode: isExam ? 'test' : 'practice',
        score: score + timeBonus,
        maxScore: TARGET_WORDS * 10 + (isExam ? TIME_BUDGET * SPEED_COEF : 0),
        correctAnswers: wordsCollected,
        totalQuestions: TARGET_WORDS,
        durationSeconds: elapsedSec || undefined,
      });
    }
    if (gameState !== 'gameover') tracked.current = false;
  }, [gameState, score, difficulty, gameStartRef, onGameComplete]);
  return null;
}

export default SnakeDePalabras;
