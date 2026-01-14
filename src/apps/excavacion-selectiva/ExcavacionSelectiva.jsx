import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Joystick } from 'react-joystick-component';
import * as THREE from 'three';
import { useExcavacionSelectiva } from '../../hooks/useExcavacionSelectiva';
import { Bloque3D } from './Bloque3D';
import { Arbol3D } from './Arbol3D';
import { Player } from './Player';
import { MobileLookControls } from './MobileLookControls';
import { Button } from '@/components/ui/button';
import { Tablet, MousePointer2, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ExcavacionSelectiva.css';

// === ICONO DE CRUZ (SVG Inline) ===
const CrosshairIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" className="drop-shadow-md filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
    <path d="M16 8v16M8 16h16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="square" />
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

const ExcavacionSelectiva = ({ level, grade, subjectId }) => {
  const subjectPrefix = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const dataPath = `/data/${level}/${grade}/${subjectPrefix}-runner.json`;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Extraemos la lógica del juego
  const {
    blocks, timeLeft, score, gameState, mission, mineBlock,
    isSuddenDeath, combo, isFrozen, lastEvent
  } = useExcavacionSelectiva(data);

  // Estados de control y visuales
  const [isLocked, setIsLocked] = useState(false);
  const [cursorType, setCursorType] = useState('crosshair'); // 'crosshair' | 'pickaxe'
  const [isSwinging, setIsSwinging] = useState(false);
  const [showSuddenDeathMsg, setShowSuddenDeathMsg] = useState(false);

  // Estados para control Móvil vs PC
  const [controlMode, setControlMode] = useState(null); // 'pc' | 'mobile' | null
  const [joystickMove, setJoystickMove] = useState(null);
  const [joystickLook, setJoystickLook] = useState(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

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

  // Carga de datos
  useEffect(() => {
    setData(null);
    setError(null);
    fetch(dataPath)
      .then(res => res.ok ? res.json() : Promise.reject("Archivo no encontrado"))
      .then(setData)
      .catch(e => setError(e));
  }, [dataPath]);

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

  if (error) return <div className="p-10 text-red-500 font-pixel">Error: No encuentro el mapa</div>;
  if (!data) return <div className="p-10 text-center text-white font-pixel">Cargando chunks...</div>;

  return (
    // Agregamos la clase 'sudden-death-mode' si estamos en esa fase (necesita el CSS)
    <div className={`excavacion-container relative w-full h-[80vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 
        ${isSuddenDeath ? 'sudden-death-mode' : ''} 
        ${isFrozen ? 'time-frozen' : ''} 
        ${lastEvent?.type === 'tnt' ? 'shake-effect' : ''}`}>

      {/* === 1. SELECCIÓN DE DISPOSITIVO === */}
      {!controlMode && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 text-white pixel-text backdrop-blur-md p-4">
          <h1 className="text-2xl md:text-3xl text-yellow-400 mb-8 text-center animate-pulse">
            SELECCIONA TU MODO
          </h1>
          <div className="flex flex-col md:flex-row gap-6">
            <Button
              onClick={() => setControlMode('mobile')}
              className="flex flex-col h-40 w-40 gap-4 bg-slate-800 hover:bg-slate-700 border-4 border-slate-600 hover:border-green-500 transition-all"
            >
              <Tablet size={48} className="text-green-400" />
              <span>TÁCTIL</span>
            </Button>

            <Button
              onClick={() => setControlMode('pc')}
              className="flex flex-col h-40 w-40 gap-4 bg-slate-800 hover:bg-slate-700 border-4 border-slate-600 hover:border-blue-500 transition-all"
            >
              <MousePointer2 size={48} className="text-blue-400" />
              <span>ORDENADOR</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowCheatSheet(true)}
            className="mt-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-white/5 border border-cyan-400/30 rounded-lg px-6 py-2 transition-all transition-colors font-bold tracking-wider"
          >
            <BookOpen size={20} />
            GUÍA DE PALABRAS
          </Button>
        </div>
      )}

      {/* === INDICADOR DE CONGELACIÓN === */}
      {isFrozen && (
        <div className="absolute inset-0 z-40 bg-blue-400/20 pointer-events-none flex items-center justify-center">
          <h2 className="text-3xl md:text-5xl text-blue-200 pixel-text animate-pulse drop-shadow-lg">❄️ TIEMPO DETENIDO ❄️</h2>
        </div>
      )}

      {/* === MENSAJE FLASH DE MUERTE SÚBITA === */}
      {showSuddenDeathMsg && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-4xl md:text-6xl text-red-600 font-bold animate-ping pixel-text text-center drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
            ¡MUERTE SÚBITA!
          </h1>
          <p className="text-xl md:text-2xl text-yellow-400 mt-8 animate-bounce pixel-text bg-black/50 p-2 rounded">
            ¡CORRE!
          </p>
        </div>
      )}

      {/* === HUD SUPERIOR === */}
      <div className="absolute top-4 left-4 z-10 text-white bg-black/60 p-4 rounded border-2 border-white/20 pixel-text pointer-events-none select-none w-[95%] flex justify-between items-center">
        <div>
          {/* Si es muerte súbita, cambiamos el color a rojo */}
          <h2 className={`text-sm md:text-base mb-1 tracking-widest uppercase shadow-black drop-shadow-md ${isSuddenDeath ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
            {isSuddenDeath ? "¡SOBREVIVE!" : mission}
          </h2>
          <p className="text-xs text-gray-300">
            {controlMode === 'pc' ? "WASD mover | SHIFT correr" : "Usa los Joysticks"}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm md:text-lg font-bold">
          {/* COMBO INDICATOR */}
          {combo > 1 && (
            <div className="flex flex-col items-center">
              <span className="text-yellow-400 text-xs md:text-sm animate-bounce">COMBO</span>
              <span className="text-orange-500 text-xl">x{combo}</span>
            </div>
          )}

          <span className="text-green-400 drop-shadow-sm">XP: {score}</span>

          {/* TEMPORIZADOR DINÁMICO */}
          <div className={`flex items-center drop-shadow-sm transition-all duration-200 
            ${isSuddenDeath ? 'text-red-600 scale-110' : (isFrozen ? 'text-blue-400' : (timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'))
            }`}>
            <span className="mr-2">{isFrozen ? "❄️" : "⏰"}</span>
            <span className="min-w-[4ch] text-right">{Math.max(0, timeLeft).toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* === CURSOR VIRTUAL (CENTRO) === */}
      {((controlMode === 'pc' && isLocked) || controlMode === 'mobile') && gameState === 'playing' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {cursorType === 'pickaxe' ? (
            // Animación swing
            <span className={`text-6xl select-none ${isSwinging ? 'swing-animation' : ''}`}>
              ⛏️
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
          <div className="absolute bottom-8 left-8 z-40 opacity-80">
            <Joystick
              size={100}
              sticky={false}
              baseColor="rgba(255, 255, 255, 0.2)"
              stickColor="rgba(255, 255, 255, 0.5)"
              move={handleMoveStart}
              stop={handleMoveStop}
            />
          </div>

          {/* DERECHA: CÁMARA (MIRAR) */}
          <div className="absolute bottom-8 right-8 z-40 opacity-80">
            <Joystick
              size={100}
              sticky={false}
              baseColor="rgba(255, 255, 255, 0.2)"
              stickColor="rgba(200, 50, 50, 0.5)"
              move={handleLookStart}
              stop={handleLookStop}
            />
          </div>
        </>
      )}

      {/* === MENÚ INICIO (PC) === */}
      {controlMode === 'pc' && !isLocked && gameState === 'playing' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 text-white pixel-text backdrop-blur-sm cursor-pointer"
          onClick={() => { }}
        >
          <h1 className="text-4xl text-yellow-400 mb-4 animate-bounce">HAZ CLICK PARA JUGAR</h1>
          <p className="text-lg">Capturaremos tu ratón. Pulsa ESC para salir.</p>
        </div>
      )}

      {/* === PANTALLA FINAL === */}
      {gameState !== 'playing' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 text-white pixel-text text-center p-4">
          <h1 className="text-3xl md:text-5xl text-yellow-500 mb-6 drop-shadow-md animate-bounce">
            ¡FIN DE LA PARTIDA!
          </h1>
          <p className="text-xl mb-8 text-gray-200">Puntuación Final: <span className="text-green-400">{score}</span></p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gray-700 hover:bg-gray-600 border-b-4 border-black text-white font-bold py-4 px-8 rounded-none font-[inherit] active:border-b-0 active:mt-1 pointer-events-auto"
          >
            JUGAR OTRA VEZ
          </Button>
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
                  onDestructionComplete={() => mineBlock(block.id)}
                />
              )
            ))}
            {trees.map(tree => (
              <Arbol3D key={tree.id} position={[tree.x, 0, tree.z]} />
            ))}
          </group>
        </Suspense>

      </Canvas>

      {/* === 6. MODAL GUÍA DE PALABRAS === */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col p-6 overflow-hidden select-none"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 pixel-text">
                <BookOpen className="w-6 h-6 text-yellow-400" /> GUÍA DE PALABRAS
              </h2>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors border-2 border-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid gap-4 md:grid-cols-2">
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
                      <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-xs mb-3 px-2 border-l-4 border-yellow-500">
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
                onClick={() => setShowCheatSheet(false)}
                className="w-full h-14 text-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 pixel-text"
              >
                ¡ENTENDIDO!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExcavacionSelectiva;