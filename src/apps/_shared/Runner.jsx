import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ConfettiProvider } from "./ConfettiProvider";
import {
  RefreshCw, Shuffle, ListChecks, Star, Target, Clock, LayoutGrid,
  SlidersHorizontal, Gamepad2, GraduationCap, ArrowUp, Gauge, ArrowDownToLine,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getRunnerData } from '../../services/gameDataService';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, GameButton, ModeSelect, ResultsScreen,
  GameLoading, GameEmpty,
} from './kit';
import './Runner.css';

// --- CONFIGURACIÓN BASE ---
const DEFAULT_GRAVITY = 1;
const DEFAULT_JUMP_FORCE = 18;
const CUBE_SIZE = 40;
const BASE_SPAWN_DISTANCE = 600;

// --- PERSONAJES --- (el aspecto de cada cubo está en Runner.css: rn-char--0/1/2)
const CHARACTERS = [
  { id: 0, name: "Clásico" },
  { id: 1, name: "Neón" },
  { id: 2, name: "Sombra" }
];

const Runner = ({ level, grade, subjectId, onGameComplete }) => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [targetType, setTargetType] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [loadingError, setLoadingError] = useState(false);

  // Configuración de usuario
  const [configSpeed, setConfigSpeed] = useState([8]);
  const [configGravity, setConfigGravity] = useState([DEFAULT_GRAVITY]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChar, setSelectedChar] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Estado visual para la invencibilidad
  const [isInvincible, setIsInvincible] = useState(false);

  // Tick para forzar renderizado en React
  const [, setTick] = useState(0);

  // Refs para el bucle de juego
  const isPlayingRef = useRef(false);
  const playerRef = useRef({ x: 100, y: 0, velocityY: 0, isJumping: false, onPlatform: false });
  const rotationRef = useRef(0);
  const collectedWordsRef = useRef([]);
  const entitiesRef = useRef([]);
  const explosionsRef = useRef([]);
  const bgOffsetRef = useRef(0);
  const reqRef = useRef(null);
  const gameContainerRef = useRef(null);

  // Ref para el contenedor del jugador (posición, no rotación)
  const playerWrapperRef = useRef(null);

  // --- REFS PARA CONTROL DE TIEMPO (DELTA TIME) ---
  const lastTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const invincibleUntilRef = useRef(0);

  // Refs de acceso rápido
  const targetTypeRef = useRef(null);
  const gameStartRef = useRef(0);
  const gameDataRef = useRef(null);
  const speedRef = useRef(8);
  const jumpForceRef = useRef(DEFAULT_JUMP_FORCE);
  const gravityRef = useRef(DEFAULT_GRAVITY);
  const showHintsRef = useRef(true);

  // 1. CARGA DE DATOS DINÁMICA
  useEffect(() => {
    if (!level || !grade || !subjectId) return;

    getRunnerData(level, grade, subjectId)
      .then(data => {
        if (!data || Object.keys(data).length === 0) throw new Error("Datos no encontrados");
        setGameData(data);
        gameDataRef.current = data;
        randomizeMission(data);
        setLoadingError(false);
      })
      .catch(err => {
        console.error("Error cargando runner data:", err);
        setLoadingError(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, grade, subjectId]);

  const randomizeMission = useCallback((data = gameData) => {
    if (!data) return;
    const types = Object.keys(data);
    const random = types[Math.floor(Math.random() * types.length)];
    setTargetType(random);
  }, [gameData]);

  const changeMission = () => {
    if (!gameData) return;
    const types = Object.keys(gameData);
    if (types.length === 0) return;

    const currentIndex = types.indexOf(targetType);
    const nextIndex = (currentIndex + 1) % types.length;
    setTargetType(types[nextIndex]);
  };

  const formatMissionName = (name) => {
    if (!name) return "";
    return name.replace(/_/g, " ").toUpperCase();
  };

  useEffect(() => {
    if (gameState === 'start' && gameData) {
      randomizeMission();
    }
  }, [gameState, gameData, randomizeMission]);

  // 2. INICIO DEL JUEGO
  // `hints` llega desde la pantalla de modos (Práctica = con pistas, Examen =
  // sin pistas): es el mismo interruptor showHints de siempre.
  const startGame = (hints = showHints) => {
    if (!targetType) return;
    setShowHints(hints);

    targetTypeRef.current = targetType;
    setScore(0);
    gameStartRef.current = Date.now();
    setGameState('playing');
    isPlayingRef.current = true;

    speedRef.current = configSpeed[0];
    gravityRef.current = configGravity[0];
    jumpForceRef.current = DEFAULT_JUMP_FORCE;
    showHintsRef.current = hints;

    playerRef.current = { x: 100, y: 0, velocityY: 0, isJumping: false, onPlatform: false };
    rotationRef.current = 0;
    entitiesRef.current = [];
    collectedWordsRef.current = [];
    explosionsRef.current = [];
    invincibleUntilRef.current = 0;
    setIsInvincible(false);
    bgOffsetRef.current = 0;

    lastTimeRef.current = 0;
    distanceTraveledRef.current = 0;

    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (playerRef.current.y <= 0.5 || playerRef.current.onPlatform) {
      playerRef.current.velocityY = jumpForceRef.current;
      playerRef.current.isJumping = true;
      playerRef.current.onPlatform = false;
      rotationRef.current += 90;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // 3. GENERADOR DE OBSTÁCULOS
  const spawnEntities = () => {
    const data = gameDataRef.current;
    if (!data) return;

    const startX = 1000;
    // Patrones: 0: Pinchos, 1: Plataforma baja, 2: Alta+pincho, 3: Item flotante, 4: Encadenadas, 5: ESTRELLA
    const rand = Math.random();
    let pattern = 0;

    if (rand < 0.25) pattern = 0;
    else if (rand < 0.45) pattern = 1;
    else if (rand < 0.65) pattern = 2;
    else if (rand < 0.80) pattern = 3;
    else if (rand < 0.95) pattern = 4;
    else pattern = 5;

    const types = Object.keys(data);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const list = data[randomType];
    const itemText = list[Math.floor(Math.random() * list.length)];

    const itemEntity = {
      id: Date.now() + Math.random(),
      type: 'item',
      text: itemText,
      x: startX, y: 0, width: 120, height: 40
    };

    if (pattern === 0) {
      const spikeRandom = Math.random();
      const getSpikeDims = () => {
        const r = Math.random();
        if (r < 0.20) return { w: 30, h: 30 };
        if (r > 0.85) return { w: 50, h: 60 };
        return { w: 40, h: 40 };
      };

      const s1 = getSpikeDims();
      entitiesRef.current.push({ id: Date.now(), type: 'spike', x: startX, y: 0, width: s1.w, height: s1.h });

      if (spikeRandom > 0.5) {
        const s2 = getSpikeDims();
        entitiesRef.current.push({ id: Date.now() + 1, type: 'spike', x: startX + 40, y: 0, width: s2.w, height: s2.h });
      }
      if (spikeRandom > 0.75) {
        const s3 = getSpikeDims();
        entitiesRef.current.push({ id: Date.now() + 2, type: 'spike', x: startX + 80, y: 0, width: s3.w, height: s3.h });
      }

    } else if (pattern === 1) {
      entitiesRef.current.push({ id: Date.now(), type: 'platform', x: startX, y: 50, width: 160, height: 40 });
      itemEntity.x += 20; itemEntity.y = 130;
      entitiesRef.current.push(itemEntity);

    } else if (pattern === 2) {
      entitiesRef.current.push({ id: Date.now(), type: 'platform', x: startX, y: 100, width: 160, height: 40 });
      entitiesRef.current.push({ id: Date.now() + 2, type: 'spike', x: startX + 60, y: 0, width: 40, height: 40 });
      itemEntity.x += 20; itemEntity.y = 180;
      entitiesRef.current.push(itemEntity);

    } else if (pattern === 3) {
      itemEntity.y = 60;
      entitiesRef.current.push(itemEntity);

    } else if (pattern === 4) {
      entitiesRef.current.push({ id: Date.now() + 'p1', type: 'platform', x: startX, y: 50, width: 120, height: 40 });
      entitiesRef.current.push({ id: Date.now() + 'p2', type: 'platform', x: startX + 160, y: 170, width: 140, height: 40 });
      itemEntity.x = startX + 180; itemEntity.y = 250;
      entitiesRef.current.push(itemEntity);

    } else if (pattern === 5) {
      entitiesRef.current.push({ id: Date.now() + 'pstar1', type: 'platform', x: startX, y: 50, width: 120, height: 40 });
      entitiesRef.current.push({ id: Date.now() + 'pstar2', type: 'platform', x: startX + 160, y: 200, width: 140, height: 40 });

      entitiesRef.current.push({
        id: Date.now() + 'star',
        type: 'star',
        x: startX + 210,
        y: 280,
        width: 40, height: 40
      });
    }
  };

  const spawnExplosion = (x, y) => {
    explosionsRef.current.push({
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      timestamp: Date.now()
    });
  };

  const gameOver = () => {
    isPlayingRef.current = false;
    setGameState('gameover');
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    const wordsCollected = collectedWordsRef.current?.length || 0;
    // Objetivo fijo = 10 palabras para nota 10. Ambos modos usan el mismo objetivo;
    // la diferencia es que 'test' cuenta para tareas (modo examen). El score sigue
    // creciendo sin tope para el ranking (no paras hasta morir).
    const EXAM_TARGET = 10;
    const isExam = !showHintsRef.current;
    // Bonus por rapidez en examen: presupuesto 5s/palabra
    const elapsedSec = gameStartRef.current
      ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
      : 0;
    const TIME_BUDGET = EXAM_TARGET * 5;
    const SPEED_COEF = 5;
    const timeBonus = isExam && elapsedSec > 0 && wordsCollected >= EXAM_TARGET
      ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
      : 0;
    const finalScore = score + timeBonus;
    onGameComplete?.({
      mode: isExam ? 'test' : 'practice',
      score: finalScore,
      maxScore: Math.max(finalScore, 1000),
      correctAnswers: wordsCollected,
      totalQuestions: EXAM_TARGET,
      durationSeconds: elapsedSec || undefined,
    });
  };

  const checkAABB = (r1, r2) => {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  };

  // 4. BUCLE DE JUEGO OPTIMIZADO
  const gameLoop = (timestamp) => {
    if (!isPlayingRef.current) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (deltaTime > 100) {
      reqRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const timeScale = deltaTime / 16.67;
    const currentSpeed = speedRef.current * timeScale;

    // Actualizar fondo
    bgOffsetRef.current -= currentSpeed * 0.5;
    if (bgOffsetRef.current <= -100) bgOffsetRef.current = 0;

    // Actualizar jugador (gravedad)
    playerRef.current.velocityY -= gravityRef.current * timeScale;
    playerRef.current.y += playerRef.current.velocityY * timeScale;

    // Colisión con suelo
    if (playerRef.current.y < 0) {
      playerRef.current.y = 0;
      playerRef.current.velocityY = 0;
      playerRef.current.isJumping = false;
      playerRef.current.onPlatform = false;
    }

    // Spawn de entidades
    distanceTraveledRef.current += currentSpeed;
    if (distanceTraveledRef.current >= BASE_SPAWN_DISTANCE) {
      spawnEntities();
      distanceTraveledRef.current = 0;
    }

    // Limpiar explosiones viejas (duran 500ms)
    explosionsRef.current = explosionsRef.current.filter(exp => Date.now() - exp.timestamp < 500);

    // Revisar fin de invencibilidad visual
    if (invincibleUntilRef.current > 0 && Date.now() > invincibleUntilRef.current) {
      invincibleUntilRef.current = 0;
      setIsInvincible(false);
    }

    const pRect = {
      x: playerRef.current.x + 8, y: playerRef.current.y,
      width: CUBE_SIZE - 16, height: CUBE_SIZE - 4
    };

    let landedOnPlatform = false;

    entitiesRef.current.forEach(ent => {
      ent.x -= currentSpeed;

      if (ent.x > -200 && ent.x < 200 && !ent.collected) {
        const eRect = { x: ent.x, y: ent.y, width: ent.width, height: ent.height };

        if (ent.type === 'star') {
          if (checkAABB(pRect, eRect)) {
            ent.collected = true;
            invincibleUntilRef.current = Date.now() + 10000; // 10 segundos
            setIsInvincible(true);
          }
        }

        if (ent.type === 'spike') {
          const spikeRect = {
            x: ent.x + (ent.width * 0.25),
            y: ent.y,
            width: ent.width * 0.5,
            height: ent.height * 0.6
          };
          if (checkAABB(pRect, spikeRect)) {
            if (invincibleUntilRef.current > 0) { // Check ref
              spawnExplosion(ent.x, ent.y);
              ent.collected = true;
            } else {
              gameOver(); return;
            }
          }
        }

        if (ent.type === 'platform') {
          if (
            playerRef.current.velocityY <= 0 &&
            pRect.y >= ent.y + ent.height - 15 &&
            pRect.y <= ent.y + ent.height + 25 &&
            pRect.x + pRect.width > ent.x &&
            pRect.x < ent.x + ent.width
          ) {
            playerRef.current.y = ent.y + ent.height;
            playerRef.current.velocityY = 0;
            playerRef.current.isJumping = false;
            playerRef.current.onPlatform = true;
            landedOnPlatform = true;
          }
        }

        if (ent.type === 'item') {
          if (checkAABB(pRect, eRect)) {
            const targetList = gameDataRef.current[targetTypeRef.current];
            const isValid = targetList.includes(ent.text);

            if (isValid) {
              ent.collected = true;
              collectedWordsRef.current.push(ent.text);
              setScore(prev => prev + 1);
            } else {
              if (invincibleUntilRef.current > 0) { // Check ref
                spawnExplosion(ent.x, ent.y);
                ent.collected = true;
              } else {
                gameOver(); return;
              }
            }
          }
        }
      }
    });

    if (!landedOnPlatform && playerRef.current.y > 0) {
      playerRef.current.onPlatform = false;
    }

    // --- ANIMACIÓN DE DERRAPE (SKID) ---
    // Si el jugador está en el suelo o en una plataforma, activamos la clase CSS
    // Usamos playerWrapperRef para que el efecto no rote
    const isGrounded = playerRef.current.y <= 0.1 || playerRef.current.onPlatform;
    if (playerWrapperRef.current) {
      if (isGrounded) {
        playerWrapperRef.current.classList.add('on-ground');
      } else {
        playerWrapperRef.current.classList.remove('on-ground');
      }
    }

    entitiesRef.current = entitiesRef.current.filter(ent => ent.x > -200);
    setTick(prev => prev + 1);
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; cancelAnimationFrame(reqRef.current); };
  }, []);

  // --- PRESENTACIÓN (rediseño 2026 con el kit, estética arcade retro) ---
  const [showInstructions, setShowInstructions] = useState(false);

  // Segundos de la partida (solo para el resumen; misma fórmula que el tracking)
  const elapsedAtEnd = useMemo(() => {
    if (gameState !== 'gameover' || !gameStartRef.current) return 0;
    return Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000));
  }, [gameState]);

  const renderCharacter = (charIndex, isPreview = false) => (
    <div
      className={`rn-char rn-char--${charIndex} ${isInvincible && !isPreview ? 'is-invincible' : ''}`}
      style={!isPreview ? { transform: `rotate(${rotationRef.current}deg)`, transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' } : {}}
    >
      <span className="rn-char__eye rn-char__eye--l" />
      <span className="rn-char__eye rn-char__eye--r" />
      <span className="rn-char__mouth" />
    </div>
  );

  // Cálculo del tiempo restante de invencibilidad para el HUD
  const now = Date.now();
  const timeLeft = isInvincible ? Math.max(0, Math.ceil((invincibleUntilRef.current - now) / 1000)) : 0;

  const shellProps = { theme: 'dark', accent: '#a855f7', accent2: '#fb923c', className: 'rn' };
  const isExam = !showHints;
  const missionName = formatMissionName(targetType);

  const modals = (
    <>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Cómo jugar a Education Dash">
        <h3>🎯 Objetivo</h3>
        <p>
          Corre sin parar y <strong>atrapa solo las palabras de tu misión</strong>. Si chocas con un pincho
          o tocas una palabra que no es de la misión, se acaba la partida.
        </p>
        <h3>🕹️ Controles</h3>
        <ul>
          <li><kbd>Espacio</kbd> o <kbd>↑</kbd> para saltar. También puedes hacer clic o tocar la pantalla.</li>
          <li>Puedes aterrizar sobre las plataformas para llegar a las palabras altas.</li>
          <li>La <strong>estrella</strong> te hace invencible 10 segundos: rompes pinchos y palabras incorrectas.</li>
        </ul>
        <h3>🎓 Modos de juego</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Práctica</strong> Las palabras de la misión se ven en verde y las demás en rojo.</div>
          <div className="instr-mode exam"><strong>Examen</strong> Sin colores. 10 palabras = un 10, y bonus si eres rápido.</div>
        </div>
      </InstructionsModal>
      <InstructionsModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} title="Guía de misiones">
        <div className="rn-guide">
          {gameData && Object.entries(gameData)
            .filter(([key, words]) => key !== 'title' && key !== 'instructions' && Array.isArray(words))
            .map(([category, words]) => (
              <section key={category} className={`rn-guide__cat ${category === targetType ? 'is-current' : ''}`}>
                <h4 className="rn-guide__title">
                  {category.replace(/_/g, ' ')}
                  {category === targetType && <span className="rn-guide__now"><Target size={12} /> Tu misión</span>}
                </h4>
                <div className="rn-guide__words">
                  {words.map((word, wIdx) => <span key={wIdx} className="rn-guide__chip">{word}</span>)}
                </div>
              </section>
            ))}
        </div>
      </InstructionsModal>
    </>
  );

  if (loadingError) {
    return (
      <GameShell {...shellProps}>
        <GameHeader />
        <GameEmpty title="Error de datos">No se encontraron palabras para {subjectId}.</GameEmpty>
      </GameShell>
    );
  }
  if (!gameData) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Calentando motores…" />
      </GameShell>
    );
  }

  // --- PANTALLA PREVIA: modos + misión + personaje ---
  if (gameState === 'start') {
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={[
            { id: 'practice', tone: 'easy', icon: Gamepad2, title: 'Práctica', desc: 'Las palabras de tu misión brillan en verde; las demás, en rojo.', features: ['Pistas de color', 'Para entrenar'] },
            { id: 'exam', tone: 'exam', icon: GraduationCap, title: 'Examen', desc: 'Sin colores: lee cada palabra antes de saltar a por ella.', features: ['Nota sobre 10', 'Bonus por rapidez'] },
          ]}
          onSelect={(id) => startGame(id === 'practice')}
          onHelp={() => setShowInstructions(true)}
          onStudy={() => setShowCheatSheet(true)}
          extra={(
            <div className="rn-loadout">
              <section className="rn-loadout__box rn-loadout__box--mission">
                <span className="rn-loadout__label"><Target size={15} /> Tu misión</span>
                <div className="rn-mission-pick">
                  <span className="rn-mission-pick__name">{missionName || 'Cargando…'}</span>
                  <GameButton variant="soft" size="sm" icon={Shuffle} onClick={changeMission} aria-label="Cambiar misión" title="Cambiar misión" />
                </div>
              </section>
              <section className="rn-loadout__box">
                <span className="rn-loadout__label"><Star size={15} /> Personaje · <b>{CHARACTERS[selectedChar].name}</b></span>
                <div className="rn-chars" role="radiogroup" aria-label="Elige personaje">
                  {CHARACTERS.map((char) => (
                    <button
                      key={char.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedChar === char.id}
                      onClick={() => setSelectedChar(char.id)}
                      className={`rn-charpick ${selectedChar === char.id ? 'is-active' : ''}`}
                      title={char.name}
                    >
                      {renderCharacter(char.id, true)}
                    </button>
                  ))}
                </div>
              </section>
              <section className="rn-loadout__box rn-loadout__box--wide">
                <button type="button" className={`rn-adv-toggle ${showSettings ? 'is-open' : ''}`} onClick={() => setShowSettings(!showSettings)} aria-expanded={showSettings}>
                  <SlidersHorizontal size={15} /> Ajustes avanzados
                </button>
                {showSettings && (
                  <div className="rn-adv">
                    <label className="rn-range">
                      <span><Gauge size={14} /> Velocidad <b>{configSpeed[0]}</b></span>
                      <input type="range" min={2} max={16} step={1} value={configSpeed[0]} onChange={(e) => setConfigSpeed([Number(e.target.value)])} />
                    </label>
                    <label className="rn-range">
                      <span><ArrowDownToLine size={14} /> Gravedad <b>{configGravity[0]}</b></span>
                      <input type="range" min={0.5} max={2} step={0.1} value={configGravity[0]} onChange={(e) => setConfigGravity([Number(e.target.value)])} />
                    </label>
                  </div>
                )}
              </section>
            </div>
          )}
          footer="Espacio, ↑, clic o toque para saltar"
        />
        {modals}
      </GameShell>
    );
  }

  // --- EXAMEN TERMINADO: resumen con la nota ---
  if (gameState === 'gameover' && isExam) {
    const words = collectedWordsRef.current?.length || 0;
    const EXAM_TARGET = 10;
    const nota = Math.min(10, Math.round((words / EXAM_TARGET) * 100) / 10);
    const timeBonus = words >= EXAM_TARGET ? Math.max(0, Math.round((EXAM_TARGET * 5 - elapsedAtEnd) * 5)) : 0;
    return (
      <GameShell {...shellProps}>
        <ConfettiProvider />
        <ResultsScreen
          title="¡Carrera terminada!"
          nota={nota}
          points={score + timeBonus}
          stats={[
            { icon: ListChecks, tone: 'good', label: 'Palabras', value: `${words}/${EXAM_TARGET}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${elapsedAtEnd}s` },
            { icon: Target, tone: 'accent', label: 'Misión', value: missionName },
          ]}
          actions={[
            { label: 'Otra carrera', onClick: () => startGame(false), icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => setGameState('start'), icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {words > 0 && (
            <div className="rn-collected">
              {collectedWordsRef.current.map((w, i) => <span key={i} className="rn-collected__chip">{w}</span>)}
            </div>
          )}
        </ResultsScreen>
        {modals}
      </GameShell>
    );
  }

  return (
    <GameShell {...shellProps}>
      {gameState === 'gameover' && <ConfettiProvider />}
      <GameHeader
        mode={isExam ? 'exam' : 'practice'}
        compact
        right={(
          <Hud>
            {isInvincible && <HudStat icon={Star} tone="streak" value={`${timeLeft}s`} label="Invencible" />}
            <HudStat icon={ListChecks} tone="good" value={score.toString().padStart(3, '0')} label="Palabras" />
          </Hud>
        )}
      />

      <div className="rn-mission">
        <span className="rn-mission__icon"><Target size={18} /></span>
        <span className="rn-mission__text"><small>Misión</small><strong>{missionName}</strong></span>
        {!isExam && (
          <span className="rn-mission__legend">
            <i className="is-good" /> Atrapa <i className="is-bad" /> Esquiva
          </span>
        )}
      </div>

      <div
        className={`rn-screen ${isInvincible ? 'is-invincible' : ''}`}
        ref={gameContainerRef}
        onMouseDown={(e) => {
          if (gameState === 'playing') {
            e.preventDefault();
            jump();
          }
        }}
        onTouchStart={(e) => {
          if (gameState === 'playing') {
            e.preventDefault();
            jump();
          }
        }}
      >
        {/* Decorado: cielo synthwave con sol y montañas (estático) */}
        <div className="rn-sky" aria-hidden="true">
          <span className="rn-sky__sun" />
          <span className="rn-sky__hills" />
        </div>
        <div className="rn-grid" style={{ transform: `translateX(${bgOffsetRef.current}px)` }} aria-hidden="true" />
        <div className="rn-ground" aria-hidden="true" />

        {/* JUGADOR */}
        <div
          ref={playerWrapperRef}
          className="rn-player"
          style={{ left: `${playerRef.current.x}px`, bottom: `${60 + playerRef.current.y}px`, width: `${CUBE_SIZE}px`, height: `${CUBE_SIZE}px` }}
        >
          {/* Partículas fuera del personaje para que no roten */}
          <div className="skid-particles">
            <div className="p1"></div>
            <div className="p2"></div>
            <div className="p3"></div>
          </div>
          {renderCharacter(selectedChar)}
        </div>

        {/* EXPLOSIONES */}
        {explosionsRef.current.map(exp => (
          <div key={exp.id} className="rn-boom" style={{ left: exp.x, bottom: 60 + exp.y }} />
        ))}

        {entitiesRef.current.map(ent => {
          if (ent.collected) return null; // No renderizar si ya se ha recogido/destruido

          if (ent.type === 'star') {
            return (
              <div key={ent.id} className="rn-star" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px` }}>
                <RunnerStar />
              </div>
            );
          }
          if (ent.type === 'spike') {
            return <div key={ent.id} className="rn-spike" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: `${ent.width}px`, height: `${ent.height}px` }} />;
          }
          if (ent.type === 'platform') {
            return <div key={ent.id} className="rn-platform" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: `${ent.width}px`, height: `${ent.height}px` }} />;
          }
          if (ent.type === 'item') {
            const isTarget = gameDataRef.current && targetTypeRef.current && gameDataRef.current[targetTypeRef.current]
              ? gameDataRef.current[targetTypeRef.current].includes(ent.text)
              : false;
            const tone = showHintsRef.current ? (isTarget ? 'is-good' : 'is-bad') : 'is-neutral';
            // Ajuste dinámico de tamaño de fuente para evitar desbordamiento
            const getFontSize = (text) => {
              if (text.length > 25) return '8px';
              if (text.length > 18) return '10px';
              if (text.length > 12) return '12px';
              return '14px';
            };
            return (
              <div key={ent.id} className={`rn-item ${tone}`} style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: `${ent.width}px`, height: `${ent.height}px`, fontSize: getFontSize(ent.text) }}>
                {ent.text}
              </div>
            );
          }
          return null;
        })}

        {/* GAME OVER (práctica) */}
        {gameState === 'gameover' && (
          <motion.div
            className="rn-over"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <motion.div
              className="rn-over__card"
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              <span className="rn-over__kicker">Game over</span>
              <strong className="rn-over__title">
                {score > 0 ? <>¡{score} {score === 1 ? 'palabra' : 'palabras'}!</> : '¡Inténtalo de nuevo!'}
              </strong>
              {collectedWordsRef.current.length > 0 && (
                <div className="rn-collected">
                  {collectedWordsRef.current.map((w, i) => <span key={i} className="rn-collected__chip" style={{ animationDelay: `${i * 50}ms` }}>{w}</span>)}
                </div>
              )}
              <div className="rn-over__actions">
                <GameButton size="lg" icon={RefreshCw} onClick={() => startGame(true)} autoFocus>Otra carrera</GameButton>
                <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={() => setGameState('start')}>Menú</GameButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="rn-jump">
        <GameButton
          variant="warning"
          size="lg"
          icon={ArrowUp}
          className="rn-jump__btn"
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
          onMouseDown={(e) => { e.preventDefault(); jump(); }}
        >
          Saltar
        </GameButton>
      </div>
      {modals}
    </GameShell>
  );
};

// Estrella de invencibilidad (SVG con degradado, sin filtros).
const RunnerStar = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <defs>
      <radialGradient id="rn-star-g" cx=".38" cy=".3" r=".8">
        <stop offset="0" stopColor="#fffbe0" />
        <stop offset=".45" stopColor="#fde047" />
        <stop offset="1" stopColor="#f59e0b" />
      </radialGradient>
    </defs>
    <circle cx="20" cy="21" r="17" fill="#fde047" opacity=".22" />
    <path d="M20 3.5l4.9 10 11 1.6-8 7.8 1.9 11L20 28.7l-9.8 5.2 1.9-11-8-7.8 11-1.6z" fill="url(#rn-star-g)" stroke="#b45309" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M14 13.5c1.6-.6 3-.6 4.2.2" stroke="#fff" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export default Runner;
