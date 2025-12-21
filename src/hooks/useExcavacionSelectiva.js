import { useState, useCallback, useEffect, useRef } from 'react';

// ... (GAME_MODES se mantiene igual que antes) ...
const GAME_MODES = [
  { id: 'evens', mission: '¡Busca los números PARES!', check: (n) => n % 2 === 0 },
  { id: 'odds', mission: '¡Busca los números IMPARES!', check: (n) => n % 2 !== 0 },
  { id: 'mult5', mission: '¡Busca múltiplos de 5!', check: (n) => n % 5 === 0 },
  { id: 'mult10', mission: '¡Busca múltiplos de 10!', check: (n) => n % 10 === 0 },
  { id: 'over50', mission: '¡Busca números MAYORES de 50!', check: (n) => n > 50 }
];

export const useExcavacionSelectiva = (initialData) => {
  const [blocks, setBlocks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); 
  const [mission, setMission] = useState('');
  
  // === NUEVO ESTADO: MUERTE SÚBITA ===
  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  
  // Referencia para saber cuál es el límite actual (empieza en 5s y baja)
  const suddenDeathCapRef = useRef(5.0);

  const currentModeRef = useRef(GAME_MODES[0]);
  const streakRef = useRef(0);

  // ... (createBlock y regenerateMap se mantienen IGUAL que antes) ...
  const createBlock = (type, mode) => {
    const id = Date.now() + Math.random();
    const x = (Math.random() * 60) - 30;
    const z = (Math.random() * 60) - 30;
    
    if (type === 'star') {
        return { id, x, y: 3.5, z, text: "★", isTarget: true, isStar: true, visible: true };
    }
    let number, isValid, attempts = 0;
    do {
        number = Math.floor(Math.random() * 100) + 1;
        isValid = mode.check(number);
        attempts++;
    } while ( (type === 'target' ? !isValid : isValid) && attempts < 50 );

    return { id, x, y: 0.5, z, text: number.toString(), isTarget: type === 'target', isStar: false, visible: true };
  };

  const regenerateMap = (mode) => {
      streakRef.current = 0;
      const newBlocks = [];
      for(let i=0; i<15; i++) newBlocks.push(createBlock('target', mode));
      for(let i=0; i<15; i++) newBlocks.push(createBlock('distractor', mode));
      setBlocks(newBlocks);
      setMission(mode.mission);
      currentModeRef.current = mode;
  };

  useEffect(() => {
      const startMode = GAME_MODES[Math.floor(Math.random() * GAME_MODES.length)];
      setScore(0);
      setTimeLeft(60);
      setGameState('playing');
      setIsSuddenDeath(false); // Reset al empezar
      suddenDeathCapRef.current = 5.0; // Reset cap
      regenerateMap(startMode);
  }, [initialData]);

  // === CRONÓMETRO MEJORADO (PRECISIÓN 0.1s) ===
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Reducimos 0.1s cada vez
        const newVal = prev - 0.1;

        if (newVal <= 0) {
          // Si el tiempo se acaba...
          if (!isSuddenDeath) {
              // FASE 1 -> FASE 2: Activar Muerte Súbita
              setIsSuddenDeath(true);
              return 5.0; // Empezamos con 5 segundos
          } else {
              // FASE 2 -> FIN: Game Over real
              setGameState('lost');
              return 0;
          }
        }
        return newVal;
      });
    }, 100); // Ejecutar cada 100ms para tener decimales

    return () => clearInterval(timer);
  }, [gameState, isSuddenDeath]); // Añadimos isSuddenDeath a dependencias

  const mineBlock = useCallback((id) => {
    if (gameState !== 'playing') return;

    setBlocks((prev) => {
      const block = prev.find((b) => b.id === id);
      if (!block || !block.visible) return prev;

      if (block.isStar) {
          setScore(s => s + 50);
          let newMode;
          do { newMode = GAME_MODES[Math.floor(Math.random() * GAME_MODES.length)]; } while (newMode.id === currentModeRef.current.id);
          setTimeout(() => regenerateMap(newMode), 0);
          
          // NOTA: En muerte súbita, coger una estrella también te reinicia el tiempo
          if (isSuddenDeath) {
             setTimeLeft(suddenDeathCapRef.current);
          }
          return []; 
      }

      if (block.isTarget) {
        const remainingBlocks = prev.filter(b => b.id !== id);
        streakRef.current += 1;

        const newItems = [createBlock('target', currentModeRef.current), createBlock('distractor', currentModeRef.current)];
        if (streakRef.current >= 3) {
            newItems.push(createBlock('star', currentModeRef.current));
            streakRef.current = 0; 
        }

        // === LÓGICA DE MUERTE SÚBITA ===
        if (isSuddenDeath) {
            // 1. Reducimos el tiempo máximo permitido (mínimo 0.5s)
            suddenDeathCapRef.current = Math.max(0.5, suddenDeathCapRef.current - 0.1);
            // 2. Reseteamos el reloj al nuevo límite
            setTimeLeft(suddenDeathCapRef.current);
        }

        setScore(s => s + 10);
        return [...remainingBlocks, ...newItems];
      } else {
        setScore(s => Math.max(0, s - 5)); 
        // En muerte súbita, fallar un bloque penaliza mucho: Quitamos 1 segundo
        if (isSuddenDeath) setTimeLeft(t => Math.max(0, t - 1.0));
        return prev;
      }
    });
  }, [gameState, isSuddenDeath]); // Añadimos isSuddenDeath a dependencias

  return { blocks, timeLeft, score, gameState, mission, mineBlock, isSuddenDeath };
};