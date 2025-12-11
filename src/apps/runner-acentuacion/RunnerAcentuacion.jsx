import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { ConfettiProvider } from "../_shared/ConfettiProvider";
import { RotateCcw, Settings2, ArrowUpFromLine, Shuffle } from 'lucide-react';

// --- CONFIGURACIÓN POR DEFECTO ---
const DEFAULT_GRAVITY = 1.0;           
const DEFAULT_JUMP_FORCE = 18; // Valor base ajustable         
const CUBE_SIZE = 40;          
const BASE_SPAWN_DISTANCE = 600; 

const RunnerAcentuacion = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState('start'); 
  const [score, setScore] = useState(0);
  const [targetType, setTargetType] = useState(null); 
  const [wordData, setWordData] = useState(null);
  
  // --- CONFIGURACIÓN DE USUARIO ---
  const [configSpeed, setConfigSpeed] = useState([4]); 
  const [configJump, setConfigJump] = useState([DEFAULT_JUMP_FORCE]); // Nuevo slider de salto

  const [tick, setTick] = useState(0); 
  
  // REFERENCIAS
  const isPlayingRef = useRef(false);
  const playerRef = useRef({ x: 100, y: 0, velocityY: 0, isJumping: false, onPlatform: false });
  const entitiesRef = useRef([]); 
  const bgOffsetRef = useRef(0);
  const frameRef = useRef(0);
  const reqRef = useRef(null);
  const gameContainerRef = useRef(null);
  const targetTypeRef = useRef(null);
  
  // Refs para configuración activa en el loop
  const speedRef = useRef(4);
  const jumpForceRef = useRef(DEFAULT_JUMP_FORCE);

  // Cargar datos
  useEffect(() => {
    fetch('/data/primaria/4/lengua-runner-acentuacion.json')
      .then(res => res.json())
      .then(data => {
        setWordData(data);
        // Seleccionar primera misión aleatoria al cargar
        randomizeMission();
      })
      .catch(err => {
        console.error("Error cargando palabras:", err);
      });
  }, []);

  // Función para elegir misión aleatoria
  const randomizeMission = useCallback(() => {
    const types = ['agudas', 'llanas', 'esdrujulas'];
    const random = types[Math.floor(Math.random() * types.length)];
    setTargetType(random);
  }, []);

  // Cuando volvemos al menú, nueva misión
  useEffect(() => {
    if (gameState === 'start') {
      randomizeMission();
    }
  }, [gameState, randomizeMission]);

  const startGame = () => {
    if (!targetType) return;
    
    targetTypeRef.current = targetType;
    setScore(0);
    setGameState('playing');
    isPlayingRef.current = true;
    
    // Aplicar configuraciones
    speedRef.current = configSpeed[0];
    jumpForceRef.current = configJump[0];

    playerRef.current = { x: 100, y: 0, velocityY: 0, isJumping: false, onPlatform: false };
    entitiesRef.current = [];
    frameRef.current = 0;
    bgOffsetRef.current = 0;
    
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    gameLoop();
  };

  const jump = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    // Saltar usando la fuerza configurada
    if (playerRef.current.y <= 0.5 || playerRef.current.onPlatform) {
      playerRef.current.velocityY = jumpForceRef.current; 
      playerRef.current.isJumping = true;
      playerRef.current.onPlatform = false;
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

  // --- GENERADOR DE NIVELES ---
  const spawnEntities = () => {
    if (!wordData) return;
    
    const startX = 1000; 
    
    const pattern = Math.floor(Math.random() * 4);
    const types = ['agudas', 'llanas', 'esdrujulas'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const word = wordData[randomType][Math.floor(Math.random() * wordData[randomType].length)];

    if (pattern === 0) { 
        // PINCHO SUELO
        entitiesRef.current.push({
            id: Date.now(),
            type: 'spike',
            x: startX,
            y: 0,
            width: 40,
            height: 40
        });
    } else if (pattern === 1) { 
        // PLATAFORMA MEDIA
        entitiesRef.current.push({
            id: Date.now(),
            type: 'platform',
            x: startX,
            y: 50, 
            width: 160,
            height: 40
        });
        entitiesRef.current.push({
            id: Date.now() + 1,
            type: 'word',
            text: word,
            wordType: randomType,
            x: startX + 20,
            y: 130, 
            width: 120,
            height: 40
        });

    } else if (pattern === 2) { 
        // PLATAFORMA ALTA
        entitiesRef.current.push({
            id: Date.now(),
            type: 'platform',
            x: startX,
            y: 100, 
            width: 160,
            height: 40
        });
        entitiesRef.current.push({
            id: Date.now() + 2,
            type: 'spike',
            x: startX + 60,
            y: 0,
            width: 40,
            height: 40
        });
         entitiesRef.current.push({
            id: Date.now() + 1,
            type: 'word',
            text: word,
            wordType: randomType,
            x: startX + 20,
            y: 180, 
            width: 120,
            height: 40
        });

    } else { 
        // PALABRA SUELTA BAJA
        entitiesRef.current.push({
            id: Date.now(),
            type: 'word',
            text: word,
            wordType: randomType,
            x: startX,
            y: 60, 
            width: 120,
            height: 40
        });
    }
  };

  const gameOver = (reason) => {
    isPlayingRef.current = false;
    setGameState('gameover');
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    toast({
      title: "¡Has fallado!",
      description: reason,
      variant: "destructive",
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

  // --- LOOP PRINCIPAL ---
  const gameLoop = () => {
    if (!isPlayingRef.current) return;

    const currentSpeed = speedRef.current;

    // 1. Fondo
    bgOffsetRef.current -= currentSpeed * 0.5;
    if (bgOffsetRef.current <= -100) bgOffsetRef.current = 0;

    // 2. Físicas Jugador
    playerRef.current.velocityY -= DEFAULT_GRAVITY;
    playerRef.current.y += playerRef.current.velocityY;

    if (playerRef.current.y < 0) {
       playerRef.current.y = 0;
       playerRef.current.velocityY = 0;
       playerRef.current.isJumping = false;
       playerRef.current.onPlatform = false;
    }

    // 3. Generar Entidades
    frameRef.current++;
    const spawnRate = Math.floor(BASE_SPAWN_DISTANCE / currentSpeed);
    
    if (frameRef.current % spawnRate === 0) {
      spawnEntities();
    }

    // 4. Mover y Colisiones
    const pRect = {
        x: playerRef.current.x + 8,
        y: playerRef.current.y,
        width: CUBE_SIZE - 16,
        height: CUBE_SIZE - 4 
    };

    let landedOnPlatform = false;

    entitiesRef.current.forEach(ent => {
        ent.x -= currentSpeed;

        if (ent.x > -200 && ent.x < 200) {
            
            const eRect = { x: ent.x, y: ent.y, width: ent.width, height: ent.height };

            // PINCHOS
            if (ent.type === 'spike') {
                const spikeRect = { x: ent.x + 12, y: ent.y, width: ent.width - 24, height: ent.height - 20 };
                if (checkAABB(pRect, spikeRect)) {
                    gameOver("Te has pinchado con un obstáculo.");
                    return;
                }
            }

            // PLATAFORMAS
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

            // PALABRAS
            if (ent.type === 'word' && !ent.collected) {
                if (checkAABB(pRect, eRect)) {
                    if (ent.wordType === targetTypeRef.current) {
                        ent.collected = true;
                        setScore(prev => prev + 1);
                    } else {
                        gameOver(`¡Cuidado! Esa palabra era ${ent.wordType}.`);
                        return;
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
    return () => {
        isPlayingRef.current = false;
        cancelAnimationFrame(reqRef.current);
    };
  }, []);


  // --- RENDERIZADO ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-900 p-4 select-none touch-none font-mono">
      {gameState === 'gameover' && <ConfettiProvider />} 
      
      <h1 className="text-4xl font-black mb-4 text-white tracking-widest italic drop-shadow-[4px_4px_0_#000]">
        WORD <span className="text-yellow-400">DASH</span>
      </h1>
      
      <Card className="w-full max-w-4xl h-[450px] relative overflow-hidden bg-indigo-950 border-[8px] border-black shadow-2xl rounded-none" ref={gameContainerRef}>
        
        {/* HUD */}
        <div className="absolute top-4 right-4 z-30 bg-black/60 text-white px-4 py-2 font-bold text-xl border-2 border-white backdrop-blur-sm">
          SCORE: {score.toString().padStart(3, '0')}
        </div>
        {targetType && gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-30 bg-yellow-400 text-black px-4 py-2 font-black border-4 border-black animate-pulse uppercase tracking-wide shadow-[4px_4px_0_black]">
            Misión: {targetType}
          </div>
        )}

        {/* --- MENÚ DE INICIO --- */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center text-white p-6">
            
            {/* MISIÓN ALEATORIA */}
            <div className="mb-8 text-center animate-in zoom-in duration-300">
                <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest">Tu misión es cazar:</p>
                <div className="flex items-center justify-center gap-3">
                    <Shuffle className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] uppercase">
                        {targetType || "Cargando..."}
                    </h2>
                </div>
            </div>
            
            {/* CONFIGURACIÓN (Sliders) */}
            <div className="bg-slate-800 p-6 border-4 border-white w-full max-w-md mb-8 space-y-6 shadow-[8px_8px_0_black]">
                
                {/* Velocidad */}
                <div>
                    <div className="flex justify-between mb-2 font-bold text-lg">
                        <label className="flex items-center gap-2 text-cyan-400">
                            <Settings2 className="w-5 h-5"/> VELOCIDAD
                        </label>
                        <span className="bg-black px-3 py-1 border border-white text-cyan-400 font-mono">
                            {configSpeed[0]}
                        </span>
                    </div>
                    <Slider 
                        defaultValue={[4]} max={8} min={2} step={1} 
                        value={configSpeed} onValueChange={setConfigSpeed}
                        className="cursor-pointer"
                    />
                </div>

                {/* Potencia de Salto */}
                <div>
                    <div className="flex justify-between mb-2 font-bold text-lg">
                        <label className="flex items-center gap-2 text-green-400">
                            <ArrowUpFromLine className="w-5 h-5"/> SALTO
                        </label>
                        <span className="bg-black px-3 py-1 border border-white text-green-400 font-mono">
                            {configJump[0]}
                        </span>
                    </div>
                    <Slider 
                        defaultValue={[DEFAULT_JUMP_FORCE]} max={25} min={15} step={0.5} 
                        value={configJump} onValueChange={setConfigJump}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold uppercase">
                        <span>Corto</span>
                        <span>Alto</span>
                    </div>
                </div>

            </div>
            
            {/* BOTÓN JUGAR */}
            {!wordData ? (
                <p className="animate-pulse font-bold text-xl">CARGANDO...</p>
            ) : (
                <Button onClick={startGame} 
                    className="w-full max-w-xs bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black text-3xl py-8 rounded-none border-b-[8px] border-r-[8px] border-yellow-800 active:border-0 active:translate-y-2 active:translate-x-2 font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                    JUGAR
                </Button>
            )}
          </div>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-40 bg-red-900/95 flex flex-col items-center justify-center text-white">
            <h2 className="text-8xl font-black mb-4 text-white drop-shadow-[8px_8px_0_black] tracking-widest -rotate-6">
              ¡CRASH!
            </h2>
            <div className="bg-black p-6 border-4 border-white mb-8 transform rotate-3">
                <p className="text-4xl font-bold text-center text-yellow-400 font-mono">PTS: {score}</p>
            </div>
            <Button onClick={() => setGameState('start')} className="gap-2 text-2xl px-12 py-8 rounded-none bg-white text-black border-b-[8px] border-gray-400 active:border-b-0 active:translate-y-2 font-black hover:bg-gray-100">
              <RotateCcw className="w-8 h-8" /> MENÚ
            </Button>
          </div>
        )}

        {/* --- JUEGO --- */}
        {gameState !== 'start' && (
            <>  
                {/* Fondo */}
                <div className="absolute inset-0 z-0 opacity-20" 
                    style={{ 
                        backgroundImage: `linear-gradient(to right, #4f46e5 1px, transparent 1px),
                                          linear-gradient(to bottom, #4f46e5 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        transform: `translateX(${bgOffsetRef.current}px)` 
                }}></div>

                {/* Suelo Neon */}
                <div className="absolute bottom-0 w-full h-[60px] bg-black border-t-[4px] border-cyan-400 z-10 shadow-[0_-5px_20px_rgba(34,211,238,0.4)]"></div>
                
                {/* JUGADOR */}
                <div 
                    className="absolute z-20 flex items-center justify-center"
                    style={{ 
                        left: `${playerRef.current.x}px`,
                        bottom: `${60 + playerRef.current.y}px`, 
                        width: `${CUBE_SIZE}px`,
                        height: `${CUBE_SIZE}px`,
                        transition: 'none', 
                    }}
                >
                    <div className={`w-full h-full ${playerRef.current.y > 0.5 && !playerRef.current.onPlatform ? 'cube-rotating' : ''}`}>
                        <div className="w-full h-full bg-yellow-400 border-[3px] border-black relative shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                            <div className="absolute top-2 left-2 w-3 h-3 bg-black border border-white"></div>
                            <div className="absolute top-2 right-2 w-3 h-3 bg-black border border-white"></div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-black"></div>
                        </div>
                    </div>
                </div>

                {/* ENTIDADES */}
                {entitiesRef.current.map(ent => {
                    if (ent.type === 'spike') {
                        return (
                            <div key={ent.id} className="absolute z-10"
                                style={{
                                    left: `${ent.x}px`,
                                    bottom: `${60 + ent.y}px`,
                                    width: 0, height: 0,
                                    borderLeft: '20px solid transparent',
                                    borderRight: '20px solid transparent',
                                    borderBottom: '40px solid #ef4444', 
                                    filter: 'drop-shadow(0 0 5px red)'
                                }}
                            />
                        );
                    }
                    if (ent.type === 'platform') {
                        return (
                            <div key={ent.id} className="absolute z-10 bg-slate-800 border-2 border-cyan-500 shadow-[0_0_10px_cyan]"
                                style={{
                                    left: `${ent.x}px`,
                                    bottom: `${60 + ent.y}px`,
                                    width: `${ent.width}px`,
                                    height: `${ent.height}px`
                                }}
                            />
                        );
                    }
                    if (ent.type === 'word') {
                        if (ent.collected) return null;
                        const isTarget = ent.wordType === targetTypeRef.current;
                        return (
                            <div key={ent.id} 
                                className={`absolute z-10 flex items-center justify-center font-black text-white px-2 py-1 rounded border-2 uppercase tracking-wider
                                    ${isTarget ? 'bg-green-600 border-green-400 shadow-[0_0_15px_green]' : 'bg-red-900/50 border-red-800 opacity-80'}
                                `}
                                style={{
                                    left: `${ent.x}px`,
                                    bottom: `${60 + ent.y}px`,
                                    width: `${ent.width}px`,
                                    height: `${ent.height}px`,
                                    fontSize: '14px'
                                }}
                            >
                                {ent.text}
                            </div>
                        );
                    }
                    return null;
                })}
            </>
        )}
      </Card>
      
      {/* Botón Móvil */}
      <div className="mt-6 md:hidden w-full px-4">
         <Button 
            className="w-full h-32 text-5xl font-black rounded-none bg-yellow-400 text-black border-b-[12px] border-yellow-700 active:border-b-0 active:translate-y-4 tracking-widest" 
            onTouchStart={(e) => { e.preventDefault(); jump(); }} 
            onMouseDown={(e) => { e.preventDefault(); jump(); }}
         >
            SALTAR
         </Button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        .cube-rotating {
          /* Rotación más lenta acorde al salto flotante */
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RunnerAcentuacion;