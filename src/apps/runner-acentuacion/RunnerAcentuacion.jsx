import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { ConfettiProvider } from "../_shared/ConfettiProvider";
import { ArrowUp, RotateCcw, Settings2, Eye, EyeOff } from 'lucide-react';

// Constantes de límites
const MAX_SPEED_CAP = 15;
const SPEED_INCREMENT = 0.1;
const SPAWN_RATE_BASE = 110;

const RunnerAcentuacion = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState('start'); 
  const [score, setScore] = useState(0);
  const [targetType, setTargetType] = useState(null); 
  const [wordData, setWordData] = useState(null);
  
  // --- CONFIGURACIÓN DE USUARIO ---
  const [configSpeed, setConfigSpeed] = useState([3]); 
  const [configGravity, setConfigGravity] = useState([0.5]); 
  const [withColors, setWithColors] = useState(true); // Nuevo estado para colores
  
  // Estado para refresco visual
  const [tick, setTick] = useState(0);
  
  // REFERENCIAS
  const isPlayingRef = useRef(false);
  const playerRef = useRef({ x: 50, y: 0, velocityY: 0, isJumping: false });
  const obstaclesRef = useRef([]);
  const bgOffsetRef = useRef(0);
  const frameRef = useRef(0);
  const reqRef = useRef(null);
  const gameContainerRef = useRef(null);
  const targetTypeRef = useRef(null);
  const currentSpeedRef = useRef(3);
  
  // Referencias de configuración activa
  const activeGravityRef = useRef(0.5);
  const activeColorsRef = useRef(true);

  // Cargar datos
  useEffect(() => {
    fetch('/data/primaria/4/lengua-runner-acentuacion.json')
      .then(res => res.json())
      .then(data => setWordData(data))
      .catch(err => {
        console.error("Error cargando palabras:", err);
        toast({ title: "Error", description: "No se encontraron las palabras.", variant: "destructive" });
      });
  }, []);

  const startGame = (type) => {
    setTargetType(type);
    targetTypeRef.current = type;
    setScore(0);
    setGameState('playing');
    isPlayingRef.current = true;
    
    // Aplicar configuración elegida
    currentSpeedRef.current = configSpeed[0];
    activeGravityRef.current = configGravity[0];
    activeColorsRef.current = withColors; // Guardar preferencia de color
    
    // Resetear
    playerRef.current = { x: 50, y: 0, velocityY: 0, isJumping: false };
    obstaclesRef.current = [];
    frameRef.current = 0;
    bgOffsetRef.current = 0;
    
    spawnObstacle(600); 

    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    gameLoop();
  };

  const jump = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    if (playerRef.current.y <= 10) {
      playerRef.current.velocityY = 18; 
      playerRef.current.isJumping = true;
    }
  }, []);

  // Teclado
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

  const spawnObstacle = (startX = 900) => {
    if (!wordData) return;
    
    const types = ['agudas', 'llanas', 'esdrujulas'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const words = wordData[randomType];
    const word = words[Math.floor(Math.random() * words.length)];
    
    const isAir = Math.random() > 0.6; 
    
    obstaclesRef.current.push({
      id: Date.now() + Math.random(),
      x: startX, 
      y: isAir ? 130 : 0, 
      width: 120, 
      height: 45,
      word: word,
      type: randomType,
      broken: false
    });
  };

  const gameOver = () => {
    isPlayingRef.current = false;
    setGameState('gameover');
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    toast({
      title: "¡Ups!",
      description: `Esa palabra no era ${targetTypeRef.current}.`,
      variant: "destructive",
    });
  };

  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // --- LOOP PRINCIPAL ---
  const gameLoop = () => {
    if (!isPlayingRef.current) return;

    const speed = currentSpeedRef.current;
    const gravity = activeGravityRef.current;

    // 1. Fondo
    bgOffsetRef.current -= (speed / 3);
    if (bgOffsetRef.current <= -50) bgOffsetRef.current = 0;

    // 2. Físicas Jugador
    playerRef.current.velocityY -= gravity;
    playerRef.current.y += playerRef.current.velocityY;

    if (playerRef.current.y < 0) {
       playerRef.current.y = 0;
       playerRef.current.velocityY = 0;
       playerRef.current.isJumping = false;
    }

    // 3. Generar Obstáculos
    frameRef.current++;
    const dynamicSpawnRate = Math.max(50, Math.floor(SPAWN_RATE_BASE * (3 / speed)));
    
    if (frameRef.current % dynamicSpawnRate === 0) {
      spawnObstacle();
    }

    // Mover y limpiar
    obstaclesRef.current.forEach(obs => {
      obs.x -= speed;
    });
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -200);

    // 4. Colisiones
    const playerRect = { 
        x: 50, 
        y: playerRef.current.y, 
        width: 40, 
        height: 40 
    };

    for (let obs of obstaclesRef.current) {
      if (obs.broken) continue;

      const obsRect = {
        x: obs.x + 20,
        y: obs.y,
        width: obs.width - 40, 
        height: obs.height - 10 
      };

      if (checkCollision(playerRect, obsRect)) {
        if (obs.type === targetTypeRef.current) {
          // ACIERTO
          obs.broken = true;
          setScore(prev => prev + 1);
          if (currentSpeedRef.current < MAX_SPEED_CAP) {
              currentSpeedRef.current += SPEED_INCREMENT;
          }
        } else {
          // FALLO
          gameOver();
          return;
        }
      }
    }

    setTick(prev => prev + 1);
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => {
        isPlayingRef.current = false;
        cancelAnimationFrame(reqRef.current);
    };
  }, []);


  // --- INTERFAZ ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50 p-4 select-none touch-none">
      {gameState === 'gameover' && <ConfettiProvider />} 
      
      <h1 className="text-3xl font-bold mb-4 text-slate-800">Runner Ortográfico</h1>
      
      <Card className="w-full max-w-4xl h-[450px] relative overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 border-4 border-slate-700 shadow-xl rounded-xl" ref={gameContainerRef}>
        
        {/* HUD */}
        <div className="absolute top-4 right-4 z-30 bg-white/90 px-4 py-2 rounded-xl font-bold text-xl shadow-sm border-2 border-slate-200">
          Pts: {score}
        </div>
        
        {targetType && (
          <div className="absolute top-4 left-4 z-30 bg-yellow-300 px-4 py-2 rounded-xl font-bold border-2 border-black animate-pulse shadow-md">
            OBJETIVO: {targetType.toUpperCase()}
          </div>
        )}

        {/* --- MENÚ DE INICIO / CONFIGURACIÓN --- */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6">
            <h2 className="text-4xl font-black mb-4 drop-shadow-md text-center">Configura tu partida</h2>
            
            {/* Controles de Configuración */}
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-full max-w-md mb-8 space-y-6">
                
                {/* Sliders */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="font-bold flex items-center gap-2"><Settings2 className="w-4 h-4"/> Velocidad Inicial</label>
                        <span className="bg-blue-600 px-2 rounded text-sm font-bold">{configSpeed[0]}</span>
                    </div>
                    <Slider 
                        defaultValue={[3]} max={10} min={2} step={1} 
                        value={configSpeed} onValueChange={setConfigSpeed}
                        className="cursor-pointer"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="font-bold flex items-center gap-2"><ArrowUp className="w-4 h-4"/> Gravedad (Peso)</label>
                        <span className="bg-purple-600 px-2 rounded text-sm font-bold">{configGravity[0]}</span>
                    </div>
                    <Slider 
                        defaultValue={[0.5]} max={1.0} min={0.2} step={0.1} 
                        value={configGravity} onValueChange={setConfigGravity}
                        className="cursor-pointer"
                    />
                </div>

                {/* Toggle de Colores */}
                <div className="pt-2 border-t border-white/10">
                    <label className="font-bold block mb-3 text-sm text-white/80">Dificultad Visual</label>
                    <Button 
                        onClick={() => setWithColors(!withColors)}
                        className={`w-full flex justify-between items-center border transition-all ${
                            withColors 
                            ? "bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-500/50" 
                            : "bg-red-600/30 hover:bg-red-600/50 border-red-500/50"
                        }`}
                    >
                        <span className="flex items-center gap-2 font-bold">
                            {withColors ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                            {withColors ? "Ayuda de Colores ACTIVADA" : "Ayuda de Colores DESACTIVADA"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${withColors ? "bg-emerald-500 text-black" : "bg-red-500 text-white"}`}>
                            {withColors ? "Fácil" : "Difícil"}
                        </span>
                    </Button>
                </div>
            </div>
            
            {/* Selección de Modo */}
            {!wordData ? (
                <p className="animate-pulse">Cargando...</p>
            ) : (
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={() => startGame('agudas')} className="bg-red-500 hover:bg-red-600 text-lg py-6 px-8 rounded-xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1">
                        AGUDAS
                    </Button>
                    <Button onClick={() => startGame('llanas')} className="bg-green-500 hover:bg-green-600 text-lg py-6 px-8 rounded-xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1">
                        LLANAS
                    </Button>
                    <Button onClick={() => startGame('esdrujulas')} className="bg-blue-500 hover:bg-blue-600 text-lg py-6 px-8 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
                        ESDRÚJULAS
                    </Button>
                </div>
            )}
          </div>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
            <h2 className="text-6xl font-black mb-4 text-red-500 drop-shadow-lg transform -rotate-3">¡FIN!</h2>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md mb-8 border border-white/20">
                <p className="text-3xl font-bold text-center">Puntuación: <span className="text-yellow-400">{score}</span></p>
            </div>
            <Button onClick={() => setGameState('start')} className="gap-2 text-xl px-8 py-6 rounded-full hover:scale-105 transition-transform bg-white text-black hover:bg-slate-200 shadow-xl">
              <RotateCcw className="w-6 h-6" /> Volver al Menú
            </Button>
          </div>
        )}

        {/* ELEMENTOS DEL JUEGO */}
        {gameState !== 'start' && (
            <>  
                {/* Nubes Parallax */}
                <div className="absolute top-10 w-full h-20 opacity-60" 
                    style={{ backgroundPositionX: `${bgOffsetRef.current / 4}px`, backgroundImage: 'radial-gradient(circle, white 20%, transparent 20%)', backgroundSize: '120px 60px' }}>
                </div>

                {/* Suelo */}
                <div className="absolute bottom-0 w-full h-[40px] bg-emerald-500 border-t-4 border-emerald-700 z-10"
                    style={{ 
                        backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
                        backgroundSize: '60px 100%',
                        backgroundPositionX: `${bgOffsetRef.current}px` 
                    }}
                ></div>
                
                {/* Jugador */}
                <div 
                    className="absolute left-[50px] w-[40px] h-[40px] z-20"
                    style={{ 
                        bottom: `${40 + playerRef.current.y}px`, 
                        transition: 'none'
                    }}
                >
                    <div className="w-full h-full bg-orange-500 rounded-lg shadow-sm border-2 border-orange-700 relative overflow-hidden group">
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full">
                            <div className="absolute top-1 right-0 w-1 h-1 bg-black rounded-full"></div>
                        </div>
                        <div className="absolute top-3 -left-1 w-2 h-4 bg-blue-600 rounded-r-sm"></div>
                        {currentSpeedRef.current > 8 && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        )}
                    </div>
                </div>

                {/* Obstáculos */}
                {obstaclesRef.current.map(obs => {
                    if (obs.broken) return null;
                    
                    let bgClass = "bg-slate-600 border-slate-800 text-white/90"; // Estilo por defecto (Difícil)
                    
                    // Si la ayuda de colores está activa, aplicamos los colores específicos
                    if (activeColorsRef.current) {
                        if (obs.type === 'agudas') bgClass = "bg-red-500 border-red-700";
                        else if (obs.type === 'llanas') bgClass = "bg-green-500 border-green-700";
                        else if (obs.type === 'esdrujulas') bgClass = "bg-blue-500 border-blue-700";
                    }

                    return (
                        <div
                            key={obs.id}
                            className={`absolute flex items-center justify-center font-bold text-white text-lg px-2 rounded-md border-b-4 shadow-lg z-10 ${bgClass}`}
                            style={{
                                left: `${obs.x}px`,
                                bottom: `${40 + obs.y}px`,
                                width: `${obs.width}px`,
                                height: `${obs.height}px`,
                                transition: 'none'
                            }}
                        >
                            {obs.word}
                        </div>
                    );
                })}
            </>
        )}
      </Card>
      
      {/* Botón Salto Móvil */}
      <div className="mt-6 md:hidden w-full px-4">
         <Button 
            className="w-full h-24 text-3xl font-black rounded-3xl bg-slate-800 active:bg-slate-900 shadow-xl active:scale-95 transition-transform border-b-8 border-slate-950 active:border-b-0 active:translate-y-2" 
            onTouchStart={(e) => { e.preventDefault(); jump(); }} 
            onMouseDown={(e) => { e.preventDefault(); jump(); }}
         >
            SALTAR
         </Button>
      </div>
    </div>
  );
};

export default RunnerAcentuacion;