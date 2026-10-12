import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Joystick } from 'react-joystick-component';
import * as THREE from 'three';
import { useExcavacionSelectiva } from '../../hooks/useExcavacionSelectiva';
import { getRunnerData } from '../../services/gameDataService';
import { Bloque3D } from './Bloque3D';
import { Arbol3D } from './Arbol3D';
import { Player } from './Player';
import { MobileLookControls } from './MobileLookControls';
import {
  Tablet, MousePointer2, BookOpen, Star, Flame, Clock, Snowflake, Shovel, RefreshCw,
  HelpCircle, Target, Keyboard, Skull,
} from 'lucide-react';
import { motion } from 'framer-motion';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, GameButton, GradeRing, notaMessage, notaTone, Chip,
} from '../_shared/kit';
import './ExcavacionSelectiva.css';
import { XP_FOR_10, notaExcavacion, blockOutcome } from './excavacionScoring';

// === MIRA (SVG inline, sin filtros: el contorno oscuro da el contraste) ===
const CrosshairIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
    <path d="M17 7v20M7 17h20" stroke="#0f172a" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
    <path d="M17 7v20M7 17h20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="17" cy="17" r="2.2" fill="#fde047" stroke="#0f172a" strokeOpacity=".6" />
  </svg>
);

// === PICO (SVG con volumen, en lugar del emoji) ===
const PickaxeIcon = () => (
  <svg width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
    <defs>
      <linearGradient id="exs-pick-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d6a35c" />
        <stop offset="1" stopColor="#7c4a1e" />
      </linearGradient>
      <linearGradient id="exs-pick-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f1f5f9" />
        <stop offset=".5" stopColor="#94a3b8" />
        <stop offset="1" stopColor="#475569" />
      </linearGradient>
    </defs>
    <path d="M20 58 L44 26" stroke="#3b2410" strokeWidth="9" strokeLinecap="round" />
    <path d="M20 58 L44 26" stroke="url(#exs-pick-wood)" strokeWidth="6" strokeLinecap="round" />
    <path d="M22 18 C36 8 54 12 62 24 C52 20 42 20 34 26 Z" fill="url(#exs-pick-metal)" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
    <path d="M27 17 C37 12 49 13 56 19" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// === TEXTURA DE CÉSPED ===
const generateGrassTexture = () => {
  const width = 16;
  const height = 16;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    const variation = Math.random() * 20 - 10;
    data[stride] = Math.max(0, Math.min(255, 86 + variation));
    data[stride + 1] = Math.max(0, Math.min(255, 176 + variation));
    data[stride + 2] = Math.max(0, Math.min(255, 76 + variation));
    data[stride + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

// === PARTIDA ===
// Se monta SOLO cuando el alumno ya ha elegido dispositivo: el hook de juego
// arranca su cronómetro al montarse, así que montar la partida antes hacía que
// el tiempo corriera (y la partida acabara con 0) mientras el alumno aún estaba
// en la pantalla de "¿Con qué vas a jugar?". Cada partida nueva es un montaje
// nuevo (key), con su propio cronómetro y su propio onGameComplete.
const ExcavacionPartida = ({ data, controlMode, onGameComplete, onRestart }) => {
  // Extraemos la lógica del juego
  const {
    blocks, timeLeft, score, gameState, mission, mineBlock,
    isSuddenDeath, combo, isFrozen, lastEvent
  } = useExcavacionSelectiva(data);

  // Inicio real de la partida (tras elegir dispositivo) → durationSeconds.
  const startedAtRef = useRef(Date.now());

  // Aciertos y fallos reales (para correctAnswers / totalQuestions): se cuentan
  // al picar cada bloque (una vez por bloque, como el hook) y en cada intento de
  // picar un distractor (Bloque3D lo rechaza sin llegar al hook).
  const statsRef = useRef({ hits: 0, misses: 0 });
  const countedIdsRef = useRef(new Set());
  const countOutcome = (outcome) => {
    if (outcome === 'hit') statsRef.current.hits += 1;
    else if (outcome === 'miss') statsRef.current.misses += 1;
  };
  const handleMined = (block) => {
    if (gameState === 'playing' && !countedIdsRef.current.has(block.id)) {
      countedIdsRef.current.add(block.id);
      countOutcome(blockOutcome(block));
    }
    mineBlock(block.id);
  };
  const handleWrong = () => {
    if (gameState === 'playing') countOutcome('miss');
  };

  // Nota /10: la misma que se muestra al final (2.000 XP = un 10).
  const notaFinal = notaExcavacion(score);

  // Tracking al terminar (una vez por partida)
  const trackedRef = useRef(false);
  useEffect(() => {
    if (gameState !== 'lost' || trackedRef.current) return;
    trackedRef.current = true;
    const { hits, misses } = statsRef.current;
    onGameComplete?.({
      mode: 'practice',
      score,
      maxScore: Math.max(score, XP_FOR_10),
      correctAnswers: hits,
      totalQuestions: hits + misses,
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
      nota: notaExcavacion(score),
    });
  }, [gameState, score, onGameComplete]);

  // Al acabar, soltamos el ratón para poder pulsar "Nueva partida".
  useEffect(() => {
    if (gameState === 'lost' && document.pointerLockElement) document.exitPointerLock?.();
  }, [gameState]);

  // Estados de control y visuales
  const [isLocked, setIsLocked] = useState(false);
  const [cursorType, setCursorType] = useState('crosshair'); // 'crosshair' | 'pickaxe'
  const [isSwinging, setIsSwinging] = useState(false);
  const [showSuddenDeathMsg, setShowSuddenDeathMsg] = useState(false);

  // Joysticks (control táctil)
  const [joystickMove, setJoystickMove] = useState(null);
  const [joystickLook, setJoystickLook] = useState(null);

  // Recursos memoizados
  const grassTexture = useMemo(() => generateGrassTexture(), []);
  const trees = useMemo(() => {
    const tempTrees = [];
    for (let i = 0; i < 40; i++) {
      tempTrees.push({
        id: i,
        x: (Math.random() * 100) - 50,
        z: (Math.random() * 100) - 50,
      });
    }
    return tempTrees;
  }, []);

  // Efecto para mostrar el mensaje de Muerte Súbita
  useEffect(() => {
    if (isSuddenDeath) {
      setShowSuddenDeathMsg(true);
      setTimeout(() => setShowSuddenDeathMsg(false), 2000);
    }
  }, [isSuddenDeath]);

  // Animación del pico en UI
  const triggerSwing = () => {
    if (isSwinging) return;
    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 300);
  };

  // Handlers del Joystick
  const handleMoveStart = (evt) => setJoystickMove(evt);
  const handleMoveStop = () => setJoystickMove(null);
  const handleLookStart = (evt) => setJoystickLook(evt);
  const handleLookStop = () => setJoystickLook(null);

  const timeVal = Math.max(0, timeLeft).toFixed(1);
  const timeState = isSuddenDeath ? 'is-danger' : isFrozen ? 'is-frozen' : timeLeft < 10 ? 'is-low' : '';

  return (
    <div className={`exs-viewport
        ${isSuddenDeath ? 'sudden-death-mode' : ''}
        ${isFrozen ? 'time-frozen' : ''}
        ${lastEvent?.type === 'tnt' ? 'shake-effect' : ''}`}>
        {/* === INDICADOR DE CONGELACIÓN === */}
        {isFrozen && (
          <div className="exs-frozen" aria-live="polite">
            <span className="exs-banner exs-banner--ice"><Snowflake size={22} /> Tiempo detenido</span>
          </div>
        )}

        {/* === MENSAJE FLASH DE MUERTE SÚBITA === */}
        {showSuddenDeathMsg && (
          <div className="exs-sudden" aria-live="assertive">
            <motion.span
              className="exs-banner exs-banner--danger"
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            >
              <Skull size={30} /> ¡Muerte súbita!
            </motion.span>
            <motion.span className="exs-sudden__run" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
              ¡Corre!
            </motion.span>
          </div>
        )}

        {/* === HUD SUPERIOR === */}
        <div className="exs-hud">
          <div className={`exs-mission ${isSuddenDeath ? 'is-danger' : ''}`}>
            <span className="exs-mission__icon">{isSuddenDeath ? <Skull size={18} /> : <Target size={18} />}</span>
            <span className="exs-mission__text">
              <small>{isSuddenDeath ? 'Muerte súbita' : 'Misión'}</small>
              <strong>{isSuddenDeath ? '¡Sobrevive!' : mission}</strong>
            </span>
            <span className="exs-mission__hint">
              <Keyboard size={13} /> {controlMode === 'pc' ? 'WASD mover · SHIFT correr' : 'Usa los joysticks'}
            </span>
          </div>
          <Hud className="exs-hud__stats">
            {combo > 1 && <HudStat icon={Flame} tone="streak" value={`x${combo}`} label="Combo" />}
            <HudStat icon={Star} tone="good" value={score} label="XP" />
            <span className={`exs-time ${timeState}`}>
              <span className="exs-time__icon">{isFrozen ? <Snowflake size={15} /> : <Clock size={15} />}</span>
              <span className="exs-time__value">{timeVal}s</span>
            </span>
          </Hud>
        </div>

        {/* === CURSOR VIRTUAL (CENTRO) === */}
        {((controlMode === 'pc' && isLocked) || controlMode === 'mobile') && gameState === 'playing' && (
          <div className="exs-cursor">
            {cursorType === 'pickaxe' ? (
              // Animación swing
              <span className={`exs-pick ${isSwinging ? 'swing-animation' : ''}`}>
                <PickaxeIcon />
              </span>
            ) : (
              <CrosshairIcon />
            )}
          </div>
        )}

        {/* === CONTROLES TÁCTILES DOBLE JOYSTICK (MÓVIL) === */}
        {controlMode === 'mobile' && gameState === 'playing' && (
          <>
            {/* IZQUIERDA: MOVIMIENTO */}
            <div className="exs-stick exs-stick--move">
              <Joystick
                size={100}
                sticky={false}
                baseColor="rgba(15, 23, 42, 0.45)"
                stickColor="rgba(253, 230, 138, 0.85)"
                move={handleMoveStart}
                stop={handleMoveStop}
              />
              <span className="exs-stick__label">Mover</span>
            </div>

            {/* DERECHA: CÁMARA (MIRAR) */}
            <div className="exs-stick exs-stick--look">
              <Joystick
                size={100}
                sticky={false}
                baseColor="rgba(15, 23, 42, 0.45)"
                stickColor="rgba(134, 239, 172, 0.85)"
                move={handleLookStart}
                stop={handleLookStop}
              />
              <span className="exs-stick__label">Mirar</span>
            </div>
          </>
        )}

        {/* === MENÚ INICIO (PC) === */}
        {controlMode === 'pc' && !isLocked && gameState === 'playing' && (
          <div className="exs-overlay exs-overlay--click" onClick={() => { }}>
            <div className="exs-clickcard">
              <span className="exs-clickcard__icon"><MousePointer2 size={30} /></span>
              <strong>Haz clic para jugar</strong>
              <span>Capturaremos tu ratón. Pulsa <kbd>Esc</kbd> para salir.</span>
              <span className="exs-clickcard__keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> mover · <kbd>Shift</kbd> correr · clic para picar</span>
            </div>
          </div>
        )}

        {/* === PANTALLA FINAL === */}
        {gameState !== 'playing' && (
          <div className="exs-overlay exs-overlay--end">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className={`exs-end exs-end--${notaTone(notaFinal)}`}
            >
              <span className="exs-end__kicker"><Shovel size={15} /> ¡Misión finalizada!</span>
              <div className="exs-end__hero">
                <GradeRing nota={notaFinal} size={168} />
                <div className="exs-end__verdict">
                  <strong>{notaMessage(notaFinal)}</strong>
                  <span className="exs-end__xp"><Star size={16} /> {score} <small>XP</small></span>
                </div>
              </div>
              <GameButton size="lg" icon={RefreshCw} onClick={onRestart}>Nueva partida</GameButton>
            </motion.div>
          </div>
        )}

        {/* === ESCENA 3D === */}
        <Canvas shadows camera={{ position: [0, 1.7, 0], fov: 70 }}>

          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#87CEEB', 10, 50]} />

          <ambientLight intensity={1.5} />
          <directionalLight position={[20, 50, 10]} intensity={1.5} castShadow />

          {/* Controles PC: PointerLock */}
          {controlMode === 'pc' && (
            <PointerLockControls
              onLock={() => setIsLocked(true)}
              onUnlock={() => setIsLocked(false)}
            />
          )}

          {/* Controles Móvil: Lógica de cámara con Joystick */}
          {controlMode === 'mobile' && (
            <MobileLookControls isEnabled={gameState === 'playing'} joystickData={joystickLook} />
          )}

          {/* Jugador: Movimiento (Teclado + Joystick Izq) */}
          <Player
            isLocked={isLocked || controlMode === 'mobile'}
            joystickMove={joystickMove}
            isMining={isSwinging}
          />

          {/* Suelo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial map={grassTexture} />
          </mesh>

          {/* Objetos del Juego */}
          <Suspense fallback={null}>
            <group>
              {blocks.map(block => (
                block.visible && (
                  <Bloque3D
                    key={block.id}
                    position={[block.x, block.y, block.z]}
                    text={block.text}
                    isTarget={block.isTarget}
                    isStar={block.isStar}
                    isTNT={block.isTNT}
                    isFreeze={block.isFreeze}
                    isGold={block.isGold}
                    setHoverState={setCursorType}
                    onMine={() => triggerSwing()}
                    onDestructionComplete={() => handleMined(block)}
                    onWrong={handleWrong}
                  />
                )
              ))}
              {trees.map(tree => (
                <Arbol3D key={tree.id} position={[tree.x, 0, tree.z]} />
              ))}
            </group>
          </Suspense>

        </Canvas>
    </div>
  );
};

const ExcavacionSelectiva = ({ level, grade, subjectId, onGameComplete }) => {
  const subjectPrefix = subjectId || (level === 'primaria' ? 'lengua' : 'general');

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Dispositivo elegido ('pc' | 'mobile' | null). Hasta elegirlo no hay partida
  // (ni cronómetro): ver ExcavacionPartida.
  const [controlMode, setControlMode] = useState(null);
  // Número de partida: cambiarlo monta una partida nueva (sin recargar la página).
  const [runId, setRunId] = useState(0);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Carga de datos
  useEffect(() => {
    setData(null);
    setError(null);
    getRunnerData(level, grade, subjectPrefix)
      .then(d => {
        if (!d || Object.keys(d).length === 0) throw new Error("Datos no encontrados");
        setData(d);
      })
      .catch(e => setError(e));
  }, [level, grade, subjectPrefix]);

  // --- PRESENTACIÓN (rediseño 2026: solo el "chrome" alrededor de la escena 3D) ---
  const [showInstructions, setShowInstructions] = useState(false);
  const shellProps = { theme: 'dark', wide: true, accent: '#f59e0b', accent2: '#84cc16', className: 'exs' };

  if (error) {
    return (
      <GameShell {...shellProps}>
        <GameHeader />
        <div className="exs-msg">No encuentro el mapa de esta asignatura.</div>
      </GameShell>
    );
  }
  if (!data) {
    return (
      <GameShell {...shellProps}>
        <div className="exs-msg"><span className="exs-msg__blocks" aria-hidden="true"><i /><i /><i /></span>Cargando el terreno…</div>
      </GameShell>
    );
  }

  return (
    <GameShell {...shellProps}>
      <GameHeader
        compact
        onHelp={() => setShowInstructions(true)}
        onStudy={() => setShowCheatSheet(true)}
        right={<Chip tone="accent" icon={Shovel}>Cada partida cuenta</Chip>}
      />

      {controlMode ? (
        <ExcavacionPartida
          key={runId}
          data={data}
          controlMode={controlMode}
          onGameComplete={onGameComplete}
          onRestart={() => setRunId((n) => n + 1)}
        />
      ) : (
        <div className="exs-viewport">
          {/* === 1. SELECCIÓN DE DISPOSITIVO === */}
          <div className="exs-overlay exs-overlay--menu">
            <div className="exs-device">
              <span className="exs-device__kicker"><Shovel size={15} /> Antes de excavar</span>
              <h2 className="exs-device__title">¿Con qué vas a jugar?</h2>
              <div className="exs-device__cards">
                <motion.button
                  type="button"
                  className="exs-device-card exs-device-card--touch"
                  onClick={() => setControlMode('mobile')}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <span className="exs-device-card__icon"><Tablet size={34} /></span>
                  <strong>Táctil</strong>
                  <small>Dos joysticks: uno para moverte y otro para mirar.</small>
                </motion.button>
                <motion.button
                  type="button"
                  className="exs-device-card exs-device-card--pc"
                  onClick={() => setControlMode('pc')}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="exs-device-card__icon"><MousePointer2 size={34} /></span>
                  <strong>Ordenador</strong>
                  <small>Teclado WASD para moverte y ratón para mirar y picar.</small>
                </motion.button>
              </div>
              <div className="exs-device__links">
                <GameButton variant="soft" size="sm" icon={BookOpen} onClick={() => setShowCheatSheet(true)}>Guía de palabras</GameButton>
                <GameButton variant="soft" size="sm" icon={HelpCircle} onClick={() => setShowInstructions(true)}>Cómo se juega</GameButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === INSTRUCCIONES Y GUÍA DE PALABRAS === */}
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Cómo jugar a Excavación Selectiva">
        <h3>🎯 Objetivo</h3>
        <p>
          Recorre el terreno y <strong>pica solo los bloques de la misión</strong>. Cada bloque correcto da XP y
          alarga tu racha; los incorrectos te penalizan. Cuando se acaba el tiempo llega la <strong>muerte súbita</strong>.
        </p>
        <h3>🕹️ Controles</h3>
        <ul>
          <li><strong>Ordenador:</strong> <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> para moverte, <kbd>Shift</kbd> para correr, ratón para mirar y clic para picar.</li>
          <li><strong>Táctil:</strong> joystick izquierdo para moverte, derecho para mirar; toca un bloque para picarlo.</li>
          <li>Hay bloques especiales: <strong>estrella</strong>, <strong>oro</strong>, <strong>TNT</strong> y <strong>hielo</strong> (congela el tiempo).</li>
        </ul>
        <div className="instr-tips"><strong>💡 Consejo:</strong> cada partida cuenta para tus tareas; tu nota sale de los XP conseguidos (2.000 XP = un 10).</div>
      </InstructionsModal>
      <InstructionsModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} title="Guía de palabras">
        <div className="exs-guide">
          {data && Object.entries(data)
            .filter(([key, words]) => key !== 'title' && key !== 'instructions' && Array.isArray(words))
            .map(([category, words]) => (
              <section key={category} className="exs-guide__cat">
                <h4 className="exs-guide__title">{category.replace(/_/g, ' ')}</h4>
                <div className="exs-guide__words">
                  {words.map((word, wIdx) => <span key={wIdx} className="exs-guide__chip">{word}</span>)}
                </div>
              </section>
            ))}
        </div>
      </InstructionsModal>
    </GameShell>
  );
};

export default ExcavacionSelectiva;
