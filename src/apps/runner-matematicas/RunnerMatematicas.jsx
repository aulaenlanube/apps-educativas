import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ConfettiProvider } from "../_shared/ConfettiProvider";
import { RotateCcw, Settings2, ArrowUpFromLine, Shuffle, User, ListChecks, Eye, EyeOff } from 'lucide-react';

// --- CONFIGURACIÓN BASE ---
const DEFAULT_GRAVITY = 1.0;           
const DEFAULT_JUMP_FORCE = 18;        
const CUBE_SIZE = 40;          
const BASE_SPAWN_DISTANCE = 600; 

// --- PERSONAJES ---
const CHARACTERS = [
  { id: 0, name: "Clásico", mainColor: "bg-yellow-400", borderColor: "border-black", eyeColor: "bg-black", eyeBorder: "border-white", glow: "shadow-[0_0_20px_rgba(250,204,21,0.6)]" },
  { id: 1, name: "Neon", mainColor: "bg-cyan-400", borderColor: "border-white", eyeColor: "bg-pink-500", eyeBorder: "border-white", glow: "shadow-[0_0_20px_rgba(34,211,238,0.9)]" },
  { id: 2, name: "Dark", mainColor: "bg-purple-700", borderColor: "border-emerald-400", eyeColor: "bg-emerald-400", eyeBorder: "border-black", glow: "shadow-[0_0_20px_rgba(16,185,129,0.8)]" }
];

const RunnerMatematicas = () => {
  // Obtener nivel y curso de la URL (ej: primaria/3)
  const { level, grade } = useParams();

  const [gameState, setGameState] = useState('start'); 
  const [score, setScore] = useState(0);
  const [targetType, setTargetType] = useState(null); 
  const [wordData, setWordData] = useState(null);
  
  // Configuración
  const [configSpeed, setConfigSpeed] = useState([4]); 
  const [configJump, setConfigJump] = useState([DEFAULT_JUMP_FORCE]);
  const [selectedChar, setSelectedChar] = useState(0); 
  const [showHints, setShowHints] = useState(true); 

  const [tick, setTick] = useState(0); 
  
  // Refs
  const isPlayingRef = useRef(false);
  const playerRef = useRef({ x: 100, y: 0, velocityY: 0, isJumping: false, onPlatform: false });
  const rotationRef = useRef(0);
  const collectedWordsRef = useRef([]); 
  const entitiesRef = useRef([]); 
  const bgOffsetRef = useRef(0);
  const frameRef = useRef(0);
  const reqRef = useRef(null);
  const gameContainerRef = useRef(null);
  
  // Refs de acceso rápido
  const targetTypeRef = useRef(null);
  const wordDataRef = useRef(null);
  const speedRef = useRef(4);
  const jumpForceRef = useRef(DEFAULT_JUMP_FORCE);
  const showHintsRef = useRef(true); 

  // Cargar datos dinámicamente según la URL
  useEffect(() => {
    // Si no hay params (por si acaso), usar un fallback o no cargar
    if (!level || !grade) return;

    const dataPath = `/data/${level}/${grade}/matematicas-runner.json`;

    fetch(dataPath)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo de datos");
        return res.json();
      })
      .then(data => {
        setWordData(data);
        wordDataRef.current = data;
        randomizeMission(data);
      })
      .catch(err => console.error("Error cargando datos:", err));
  }, [level, grade]);

  const randomizeMission = useCallback((data = wordData) => {
    if (!data) return;
    const types = Object.keys(data); 
    const random = types[Math.floor(Math.random() * types.length)];
    setTargetType(random);
  }, [wordData]);

  const formatMissionName = (name) => {
    if (!name) return "";
    return name.replace(/_/g, " ").toUpperCase();
  };

  useEffect(() => {
    if (gameState === 'start' && wordData) {
      randomizeMission();
    }
  }, [gameState, wordData, randomizeMission]);

  const startGame = () => {
    if (!targetType) return;
    
    targetTypeRef.current = targetType;
    setScore(0);
    setGameState('playing');
    isPlayingRef.current = true;
    
    speedRef.current = configSpeed[0];
    jumpForceRef.current = configJump[0];
    showHintsRef.current = showHints; 

    playerRef.current = { x: 100, y: 0, velocityY: 0, isJumping: false, onPlatform: false };
    rotationRef.current = 0; 
    entitiesRef.current = [];
    collectedWordsRef.current = []; 
    frameRef.current = 0;
    bgOffsetRef.current = 0;
    
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    gameLoop();
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

  const spawnEntities = () => {
    if (!wordData) return;
    
    const startX = 1000; 
    const pattern = Math.floor(Math.random() * 4);
    
    const types = Object.keys(wordData);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const wordList = wordData[randomType];
    const word = wordList[Math.floor(Math.random() * wordList.length)];

    const wordEntity = {
        id: Date.now() + 1, type: 'word', text: word, 
        originType: randomType, 
        x: startX, y: 0, width: 120, height: 40
    };

    if (pattern === 0) { 
        entitiesRef.current.push({ id: Date.now(), type: 'spike', x: startX, y: 0, width: 40, height: 40 });
    } else if (pattern === 1) { 
        entitiesRef.current.push({ id: Date.now(), type: 'platform', x: startX, y: 50, width: 160, height: 40 });
        wordEntity.x += 20; wordEntity.y = 130;
        entitiesRef.current.push(wordEntity);
    } else if (pattern === 2) { 
        entitiesRef.current.push({ id: Date.now(), type: 'platform', x: startX, y: 100, width: 160, height: 40 });
        entitiesRef.current.push({ id: Date.now() + 2, type: 'spike', x: startX + 60, y: 0, width: 40, height: 40 });
        wordEntity.x += 20; wordEntity.y = 180;
        entitiesRef.current.push(wordEntity);
    } else { 
        wordEntity.y = 60;
        entitiesRef.current.push(wordEntity);
    }
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

  const gameLoop = () => {
    if (!isPlayingRef.current) return;

    const currentSpeed = speedRef.current;

    bgOffsetRef.current -= currentSpeed * 0.5;
    if (bgOffsetRef.current <= -100) bgOffsetRef.current = 0;

    playerRef.current.velocityY -= DEFAULT_GRAVITY;
    playerRef.current.y += playerRef.current.velocityY;

    if (playerRef.current.y < 0) {
       playerRef.current.y = 0;
       playerRef.current.velocityY = 0;
       playerRef.current.isJumping = false;
       playerRef.current.onPlatform = false;
    }

    frameRef.current++;
    const spawnRate = Math.floor(BASE_SPAWN_DISTANCE / currentSpeed);
    
    if (frameRef.current % spawnRate === 0) {
      spawnEntities();
    }

    const pRect = {
        x: playerRef.current.x + 8, y: playerRef.current.y,
        width: CUBE_SIZE - 16, height: CUBE_SIZE - 4 
    };

    let landedOnPlatform = false;

    entitiesRef.current.forEach(ent => {
        ent.x -= currentSpeed;

        if (ent.x > -200 && ent.x < 200) {
            const eRect = { x: ent.x, y: ent.y, width: ent.width, height: ent.height };

            if (ent.type === 'spike') {
                const spikeRect = { x: ent.x + 12, y: ent.y, width: ent.width - 24, height: ent.height - 20 };
                if (checkAABB(pRect, spikeRect)) {
                    gameOver(); return;
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

            if (ent.type === 'word' && !ent.collected) {
                if (checkAABB(pRect, eRect)) {
                    // VALIDACIÓN MATEMÁTICA
                    const targetList = wordDataRef.current[targetTypeRef.current];
                    const isValid = targetList.includes(ent.text);

                    if (isValid) {
                        ent.collected = true;
                        collectedWordsRef.current.push(ent.text);
                        setScore(prev => prev + 1);
                    } else {
                        gameOver(); return;
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
    return (
        <div 
            className={`w-full h-full ${char.mainColor} border-[3px] ${char.borderColor} relative ${char.glow}`}
            style={ !isPreview ? { transform: `rotate(${rotationRef.current}deg)`, transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' } : {}}
        >
            <div className={`absolute top-[15%] left-[15%] w-[25%] h-[25%] ${char.eyeColor} border-[2px] ${char.eyeBorder} rounded-sm`}></div>
            <div className={`absolute top-[15%] right-[15%] w-[25%] h-[25%] ${char.eyeColor} border-[2px] ${char.eyeBorder} rounded-sm`}></div>
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[40%] h-[10%] bg-black/50 rounded-full"></div>
        </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-900 p-4 select-none touch-none font-mono">
      {gameState === 'gameover' && <ConfettiProvider />} 
      
      <h1 className="text-4xl font-black mb-4 text-white tracking-widest italic drop-shadow-[4px_4px_0_#000]">
        MATH <span className="text-yellow-400">DASH</span>
      </h1>
      
      <Card className="w-full max-w-4xl h-[450px] relative overflow-hidden bg-indigo-950 border-[8px] border-black shadow-2xl rounded-none" ref={gameContainerRef}>
        
        {/* HUD */}
        <div className="absolute top-4 right-4 z-30 bg-black/60 text-white px-4 py-2 font-bold text-xl border-2 border-white backdrop-blur-sm">
          SCORE: {score.toString().padStart(3, '0')}
        </div>
        {targetType && gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-30 bg-yellow-400 text-black px-4 py-2 font-black border-4 border-black animate-pulse uppercase tracking-wide shadow-[4px_4px_0_black]">
            Misión: {formatMissionName(targetType)}
          </div>
        )}

        {/* --- MENÚ INICIO --- */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center text-white p-4 overflow-y-auto">
            <div className="mb-4 text-center animate-in zoom-in duration-300">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Shuffle className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Tu misión:</span>
                </div>
                <h2 className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] uppercase">
                    {formatMissionName(targetType) || "Cargando..."}
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <div className="bg-slate-800 p-4 border-4 border-white shadow-[6px_6px_0_black]">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold border-b border-white/20 pb-2">
                        <User className="w-5 h-5"/> SELECCIONA PERSONAJE
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

                <div className="bg-slate-800 p-4 border-4 border-white shadow-[6px_6px_0_black] space-y-4">
                    <div>
                        <div className="flex justify-between mb-1 font-bold text-sm">
                            <label className="flex items-center gap-2 text-cyan-400"><Settings2 className="w-4 h-4"/> VELOCIDAD</label>
                            <span className="bg-black px-2 border border-white text-cyan-400 font-mono">{configSpeed[0]}</span>
                        </div>
                        <Slider defaultValue={[4]} max={8} min={2} step={1} value={configSpeed} onValueChange={setConfigSpeed} className="cursor-pointer" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1 font-bold text-sm">
                            <label className="flex items-center gap-2 text-green-400"><ArrowUpFromLine className="w-4 h-4"/> SALTO</label>
                            <span className="bg-black px-2 border border-white text-green-400 font-mono">{configJump[0]}</span>
                        </div>
                        <Slider defaultValue={[DEFAULT_JUMP_FORCE]} max={25} min={15} step={0.5} value={configJump} onValueChange={setConfigJump} className="cursor-pointer" />
                    </div>
                    <div className="pt-2 border-t border-white/20">
                        <Button onClick={() => setShowHints(!showHints)} className={`w-full flex justify-between items-center border-2 rounded-none h-8 transition-all font-bold text-xs uppercase ${showHints ? "bg-emerald-600/50 border-emerald-400 hover:bg-emerald-600 text-white" : "bg-red-600/50 border-red-400 hover:bg-red-600 text-white"}`}>
                            <span>{showHints ? "Pistas: SÍ" : "Pistas: NO"}</span>
                            {showHints ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
                        </Button>
                    </div>
                </div>
            </div>
            
            {!wordData ? (
                <p className="mt-8 animate-pulse font-bold text-xl">CARGANDO...</p>
            ) : (
                <Button onClick={startGame} className="mt-8 w-full max-w-xs bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black text-3xl py-8 rounded-none border-b-[8px] border-r-[8px] border-yellow-800 active:border-0 active:translate-y-2 active:translate-x-2 font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                    JUGAR
                </Button>
            )}
          </div>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-40 bg-red-900/95 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300 p-4">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white drop-shadow-[4px_4px_0_black] text-center uppercase leading-tight max-w-2xl">
                {score > 0 ? `Has conseguido ${score} ${formatMissionName(targetType)}` : "No has conseguido ninguna palabra"}
            </h2>
            <div className="w-full max-w-lg bg-black/50 border-2 border-white/30 rounded-none p-4 mb-6 backdrop-blur-sm">
                <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
                    <ListChecks className="w-5 h-5"/> RESUMEN:
                </h3>
                {collectedWordsRef.current.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {collectedWordsRef.current.map((w, i) => (
                            <span key={i} className="bg-green-600 text-white px-3 py-1 text-sm font-bold border-b-4 border-green-800 rounded-sm animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${i * 50}ms`}}>
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

        {/* --- JUEGO --- */}
        {gameState !== 'start' && (
            <>  
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: `linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)`, backgroundSize: '50px 50px', transform: `translateX(${bgOffsetRef.current}px)` }}></div>
                <div className="absolute bottom-0 w-full h-[60px] bg-black border-t-[4px] border-cyan-400 z-10 shadow-[0_-5px_20px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute z-20 flex items-center justify-center" style={{ left: `${playerRef.current.x}px`, bottom: `${60 + playerRef.current.y}px`, width: `${CUBE_SIZE}px`, height: `${CUBE_SIZE}px`, transition: 'none' }}>
                    {renderCharacter(selectedChar)}
                </div>
                {entitiesRef.current.map(ent => {
                    if (ent.type === 'spike') {
                        return <div key={ent.id} className="absolute z-10" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '40px solid #ef4444', filter: 'drop-shadow(0 0 5px red)' }} />;
                    }
                    if (ent.type === 'platform') {
                        return <div key={ent.id} className="absolute z-10 bg-slate-800 border-2 border-cyan-500 shadow-[0_0_10px_cyan]" style={{ left: `${ent.x}px`, bottom: `${60 + ent.y}px`, width: `${ent.width}px`, height: `${ent.height}px` }} />;
                    }
                    if (ent.type === 'word') {
                        if (ent.collected) return null;
                        
                        // Lógica Visual: Comprobar si la palabra es válida para la misión
                        const isTarget = wordDataRef.current[targetTypeRef.current].includes(ent.text);
                        
                        let wordStyle = "bg-indigo-600/80 border-indigo-400 shadow-[0_0_10px_indigo]"; // Estilo neutro
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

export default RunnerMatematicas;