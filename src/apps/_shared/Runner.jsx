import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ConfettiProvider } from "./ConfettiProvider";
import { RotateCcw, Settings2, Shuffle, User, ListChecks, Eye, EyeOff, Weight, Star } from 'lucide-react';

// --- CONFIGURACIÓN BASE ---
const DEFAULT_GRAVITY = 1; 
const DEFAULT_JUMP_FORCE = 18; 
const CUBE_SIZE = 40;
const BASE_SPAWN_DISTANCE = 600; 

// --- PERSONAJES ---
const CHARACTERS = [
  { id: 0, name: "Clásico", mainColor: "bg-yellow-400", borderColor: "border-black", eyeColor: "bg-black", eyeBorder: "border-white", glow: "shadow-[0_0_20px_rgba(250,204,21,0.6)]" },
  { id: 1, name: "Neon", mainColor: "bg-cyan-400", borderColor: "border-white", eyeColor: "bg-pink-500", eyeBorder: "border-white", glow: "shadow-[0_0_20px_rgba(34,211,238,0.9)]" },
  { id: 2, name: "Dark", mainColor: "bg-purple-700", borderColor: "border-emerald-400", eyeColor: "bg-emerald-400", eyeBorder: "border-black", glow: "shadow-[0_0_20px_rgba(16,185,129,0.8)]" }
];

const Runner = ({ level, grade, subjectId }) => {
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

  // Estado visual para la invencibilidad
  const [isInvincible, setIsInvincible] = useState(false);

  // Tick para forzar renderizado en React
  const [tick, setTick] = useState(0);

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

  // --- REFS PARA CONTROL DE TIEMPO (DELTA TIME) ---
  const lastTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const invincibleUntilRef = useRef(0); 

  // Refs de acceso rápido
  const targetTypeRef = useRef(null);
  const gameDataRef = useRef(null); 
  const speedRef = useRef(8); 
  const jumpForceRef = useRef(DEFAULT_JUMP_FORCE);
  const gravityRef = useRef(DEFAULT_GRAVITY);
  const showHintsRef = useRef(true);

  // 1. CARGA DE DATOS DINÁMICA
  useEffect(() => {
    if (!level || !grade || !subjectId) return;

    const dataPath = `/data/${level}/${grade}/${subjectId}-runner.json`;

    fetch(dataPath)
      .then(res => {
        if (!res.ok) throw new Error("Archivo no encontrado");
        return res.json();
      })
      .then(data => {
        setGameData(data);
        gameDataRef.current = data;
        randomizeMission(data);
        setLoadingError(false);
      })
      .catch(err => {
        console.error("Error cargando runner data:", err);
        setLoadingError(true);
      });
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
  const startGame = () => {
    if (!targetType) return;

    targetTypeRef.current = targetType;
    setScore(0);
    setGameState('playing');
    isPlayingRef.current = true;

    speedRef.current = configSpeed[0];
    gravityRef.current = configGravity[0]; 
    jumpForceRef.current = DEFAULT_JUMP_FORCE; 
    showHintsRef.current = showHints;

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
    
    // Probabilidad de Estrella reducida al 5% (antes 10%)
    if (rand < 0.25) pattern = 0;
    else if (rand < 0.45) pattern = 1;
    else if (rand < 0.65) pattern = 2;
    else if (rand < 0.80) pattern = 3;
    else if (rand < 0.95) pattern = 4; // Aumentamos probabilidad de encadenadas
    else pattern = 5; // 5% Estrella

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
      // --- PINCHOS CON ALTURAS VARIABLES ---
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
      // --- PATRÓN ESTRELLA ALTA ---
      // Plataforma 1 para impulso
      entitiesRef.current.push({ id: Date.now() + 'pstar1', type: 'platform', x: startX, y: 50, width: 120, height: 40 });
      
      // Plataforma 2 MUY ALTA
      entitiesRef.current.push({ id: Date.now() + 'pstar2', type: 'platform', x: startX + 160, y: 200, width: 140, height: 40 });
      
      entitiesRef.current.push({
        id: Date.now() + 'star',
        type: 'star',
        x: startX + 210, // Centrada en la plataforma alta
        y: 280, // Encima de la plataforma alta (200 + 40 + margen)
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

    // Actualizar jugador
    playerRef.current.velocityY -= gravityRef.current * timeScale; 
    playerRef.current.y += playerRef.current.velocityY * timeScale;

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
    if (isInvincible && Date.now() > invincibleUntilRef.current) {
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
            if (Date.now() < invincibleUntilRef.current) {
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
              if (Date.now() < invincibleUntilRef.current) {
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

    entitiesRef.current = entitiesRef.current.filter(ent => ent.x > -200);
    setTick(prev => prev + 1);
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; cancelAnimationFrame(reqRef.current); };
  }, []);

  const renderCharacter = (charIndex, isPreview = false) => {
    const char = CHARACTERS[charIndex];
    const invincibleGlow = (isInvincible && !isPreview) ? "drop-shadow-[0_0_15px_rgba(255,215,0,1)] border-yellow-200" : "";
    
    return (
      <div
        className={`w-full h-full ${char.mainColor} border-[3px] ${char.borderColor} relative ${char.glow} ${invincibleGlow}`}
        style={!isPreview ? { transform: `rotate(${rotationRef.current}deg)`, transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' } : {}}
      >
        <div className={`absolute top-[15%] left-[15%] w-[25%] h-[25%] ${char.eyeColor} border-[2px] ${char.eyeBorder} rounded-sm`}></div>
        <div className={`absolute top-[15%] right-[15%] w-[25%] h-[25%] ${char.eyeColor} border-[2px] ${char.eyeBorder} rounded-sm`}></div>
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[40%] h-[10%] bg-black/50 rounded-full"></div>
      </div>
    );
  };

  // Cálculo del tiempo restante de invencibilidad para el HUD
  const now = Date.now();
  const timeLeft = isInvincible ? Math.max(0, Math.ceil((invincibleUntilRef.current - now) / 1000)) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent p-4 select-none touch-none font-mono">
      {gameState === 'gameover' && <ConfettiProvider />}

      <Card 
        className="w-full max-w-4xl h-[450px] relative overflow-hidden bg-indigo-950 border-[8px] border-black shadow-2xl rounded-none cursor-pointer"
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

        {/* HUD */}
        <div className="absolute top-4 right-4 z-30 bg-black/60 text-white px-4 py-2 font-bold text-xl border-2 border-white backdrop-blur-sm">
          SCORE: {score.toString().padStart(3, '0')}
        </div>
        {targetType && gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 items-start">
            <div className="bg-yellow-400 text-black px-4 py-2 font-black border-4 border-black animate-pulse uppercase tracking-wide shadow-[4px_4px_0_black]">
                Misión: {formatMissionName(targetType)}
            </div>
            {isInvincible && (
                <div className="flex flex-col items-center animate-pulse">
                    <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                        {timeLeft}s
                    </span>
                    <div className="bg-yellow-500 text-white px-2 py-1 font-bold border-2 border-white text-xs shadow-[0_0_10px_gold]">
                        ★ INVENCIBLE ★
                    </div>
                </div>
            )}
          </div>
        )}

        {/* MENU INICIO */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center text-white p-4 overflow-y-auto cursor-default" 
               onMouseDown={(e) => e.stopPropagation()}
               onTouchStart={(e) => e.stopPropagation()}
          >
            
            <div className="mb-4 text-center animate-in zoom-in duration-300 flex flex-col items-center">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">Tu misión:</span>
              
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] uppercase">
                  {loadingError ? "Error de datos" : (formatMissionName(targetType) || "Cargando...")}
                </h2>
                
                <Button 
                  onClick={changeMission}
                  className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 p-2 h-auto rounded-full transition-all active:scale-95"
                  title="Cambiar categoría"
                >
                  <Shuffle className="w-5 h-5" />
                </Button>
              </div>
              {loadingError && <p className="text-red-500 text-xs mt-1">No se encontró {subjectId}-runner.json</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              {/* Selección Personaje */}
              <div className="bg-slate-800 p-4 border-4 border-white shadow-[6px_6px_0_black]">
                <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold border-b border-white/20 pb-2">
                  <User className="w-5 h-5" /> SELECCIONA PERSONAJE
                </div>
                <div className="flex justify-around items-center h-24">
                  {CHARACTERS.map((char) => (
                    <div key={char.id} onClick={() => setSelectedChar(char.id)}
                      className={`w-14 h-14 cursor-pointer transition-all hover:scale-110 ${selectedChar === char.id ? 'scale-125 ring-4 ring-white z-10' : 'opacity-60 grayscale-[0.5]'}`}
                    >
                      {renderCharacter(char.id, true)}
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 font-bold uppercase">{CHARACTERS[selectedChar].name}</p>
              </div>

              {/* Configuración */}
              <div className="bg-slate-800 p-4 border-4 border-white shadow-[6px_6px_0_black]">
                
                {/* Checkbox para mostrar ajustes avanzados */}
                <div className="flex items-center gap-2 mb-2 pb-2">
                    <input 
                      type="checkbox" 
                      id="advancedSettings" 
                      checked={showSettings} 
                      onChange={(e) => setShowSettings(e.target.checked)}
                      className="w-5 h-5 cursor-pointer accent-yellow-400 bg-slate-700 border-white/50 rounded-sm"
                    />
                    <label htmlFor="advancedSettings" className="text-white font-bold text-sm cursor-pointer select-none">
                      CONFIGURAR VELOCIDAD Y GRAVEDAD
                    </label>
                </div>

                {/* Sliders Condicionales */}
                {showSettings && (
                  <div className="space-y-4 mb-4 animate-in slide-in-from-top-2 duration-300 bg-black/20 p-2 border border-white/10">
                    {/* Velocidad */}
                    <div>
                      <div className="flex justify-between mb-1 font-bold text-sm">
                        <label className="flex items-center gap-2 text-cyan-400"><Settings2 className="w-4 h-4" /> VELOCIDAD</label>
                        <span className="bg-black px-2 border border-white text-cyan-400 font-mono">{configSpeed[0]}</span>
                      </div>
                      <Slider defaultValue={[8]} max={16} min={2} step={1} value={configSpeed} onValueChange={setConfigSpeed} className="cursor-pointer" />
                    </div>

                    {/* Gravedad */}
                    <div>
                      <div className="flex justify-between mb-1 font-bold text-sm">
                        <label className="flex items-center gap-2 text-purple-400"><Weight className="w-4 h-4" /> GRAVEDAD</label>
                        <span className="bg-black px-2 border border-white text-purple-400 font-mono">{configGravity[0]}</span>
                      </div>
                      <Slider defaultValue={[DEFAULT_GRAVITY]} max={2.0} min={0.5} step={0.1} value={configGravity} onValueChange={setConfigGravity} className="cursor-pointer" />
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-white/20 mt-2">
                  <Button onClick={() => setShowHints(!showHints)} className={`w-full flex justify-between items-center border-2 rounded-none h-8 transition-all font-bold text-xs uppercase ${showHints ? "bg-emerald-600/50 border-emerald-400 hover:bg-emerald-600 text-white" : "bg-red-600/50 border-red-400 hover:bg-red-600 text-white"}`}>
                    <span>{showHints ? "Pistas: SÍ" : "Pistas: NO"}</span>
                    {showHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button disabled={!gameData} onClick={startGame} className="mt-8 w-full max-w-xs bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black text-3xl py-8 rounded-none border-b-[8px] border-r-[8px] border-yellow-800 active:border-0 active:translate-y-2 active:translate-x-2 font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50">
              JUGAR
            </Button>
          </div>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-40 bg-red-900/95 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300 p-4 cursor-default"
               onMouseDown={(e) => e.stopPropagation()}
               onTouchStart={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white drop-shadow-[4px_4px_0_black] text-center uppercase leading-tight max-w-2xl">
              {score > 0 ? `Has conseguido ${score} puntos` : "No has conseguido ninguna"}
            </h2>
            <div className="w-full max-w-lg bg-black/50 border-2 border-white/30 rounded-none p-4 mb-6 backdrop-blur-sm">
              <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
                <ListChecks className="w-5 h-5" /> RECOGIDO:
              </h3>
              {collectedWordsRef.current.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {collectedWordsRef.current.map((w, i) => (
                    <span key={i} className="bg-green-600 text-white px-3 py-1 text-sm font-bold border-b-4 border-green-800 rounded-sm animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                      {w}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 italic">¡Inténtalo de nuevo!</p>
              )}
            </div>
            <Button onClick={() => setGameState('start')} className="gap-2 text-2xl px-12 py-8 rounded-none bg-white text-black border-b-[8px] border-gray-400 active:border-b-0 active:translate-y-2 font-black hover:bg-gray-100">
              <RotateCcw className="w-8 h-8" /> MENÚ
            </Button>
          </div>
        )}

        {/* JUEGO */}
        {gameState !== 'start' && (
          <>
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: `linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)`, backgroundSize: '50px 50px', transform: `translateX(${bgOffsetRef.current}px)` }}></div>
            <div className="absolute bottom-0 w-full h-[60px] bg-black border-t-[4px] border-cyan-400 z-10 shadow-[0_-5px_20px_rgba(34,211,238,0.4)]"></div>
            
            <div className="absolute z-20 flex items-center justify-center" style={{ left: `${playerRef.current.x}px`, bottom: `${60 + playerRef.current.y}px`, width: `${CUBE_SIZE}px`, height: `${CUBE_SIZE}px`, transition: 'none' }}>
              {renderCharacter(selectedChar)}
            </div>

            {/* EXPLOSIONES */}
            {explosionsRef.current.map(exp => (
                <div key={exp.id} 
                     className="absolute z-50 flex items-center justify-center pointer-events-none animate-ping" 
                     style={{ left: exp.x, bottom: 60 + exp.y, width: 60, height: 60 }}>
                    <div className="w-full h-full bg-orange-500 rounded-full opacity-75"></div>
                </div>
            ))}

            {entitiesRef.current.map(ent => {
              if (ent.collected) return null; // No renderizar si ya se ha recogido/destruido

              if (ent.type === 'star') {
                  return (
                    <div key={ent.id} className="absolute z-10 animate-bounce" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px` }}>
                        <Star className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_gold]" />
                    </div>
                  );
              }

              if (ent.type === 'spike') {
                return <div key={ent.id} className="absolute z-10" style={{ 
                  left: `${ent.x}px`, 
                  bottom: `${60 + ent.y}px`, 
                  width: 0, 
                  height: 0, 
                  borderLeft: `${ent.width / 2}px solid transparent`,
                  borderRight: `${ent.width / 2}px solid transparent`,
                  borderBottom: `${ent.height}px solid #ef4444`, 
                  filter: 'drop-shadow(0 0 5px red)' 
                }} />;
              }
              if (ent.type === 'platform') {
                return <div key={ent.id} className="absolute z-10 bg-slate-800 border-2 border-cyan-500 shadow-[0_0_10px_cyan]" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: `${ent.width}px`, height: `${ent.height}px` }} />;
              }
              if (ent.type === 'item') {
                const isTarget = gameDataRef.current && targetTypeRef.current && gameDataRef.current[targetTypeRef.current] 
                  ? gameDataRef.current[targetTypeRef.current].includes(ent.text)
                  : false;

                let wordStyle = "bg-indigo-600/80 border-indigo-400 shadow-[0_0_10px_indigo]";
                if (showHintsRef.current) {
                  wordStyle = isTarget ? 'bg-green-600 border-green-400 shadow-[0_0_15px_green]' : 'bg-red-900/50 border-red-800 opacity-80';
                }

                return (
                  <div key={ent.id} className={`absolute z-10 flex items-center justify-center font-black text-white px-2 py-1 rounded border-2 uppercase tracking-wider ${wordStyle}`} style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: `${ent.width}px`, height: `${ent.height}px`, fontSize: '14px' }}>
                    {ent.text}
                  </div>
                );
              }
              return null;
            })}
          </>
        )}
      </Card>

      <div className="mt-6 md:hidden w-full px-4">
        <Button className="w-full h-32 text-5xl font-black rounded-none bg-yellow-400 text-black border-b-[12px] border-yellow-700 active:border-b-0 active:translate-y-4 tracking-widest" onTouchStart={(e) => { e.preventDefault(); jump(); }} onMouseDown={(e) => { e.preventDefault(); jump(); }}>SALTAR</Button>
      </div>
    </div>
  );
};

export default Runner;