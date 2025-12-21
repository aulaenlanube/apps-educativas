import { useState, useCallback, useEffect, useRef } from 'react';

export const useExcavacionSelectiva = (initialData) => {
  const [blocks, setBlocks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); 
  const [mission, setMission] = useState('');

  const poolRef = useRef({ targets: [], distractors: [] });

  const generateRandomBlock = (isTarget) => {
    const pool = isTarget ? poolRef.current.targets : poolRef.current.distractors;
    if (pool.length === 0) return null;

    const randomText = pool[Math.floor(Math.random() * pool.length)];
    
    return {
      id: Date.now() + Math.random(), 
      x: (Math.random() * 60) - 30,   
      y: 0.5,
      z: (Math.random() * 60) - 30,
      text: randomText,
      isTarget: isTarget,
      visible: true
    };
  };

  // Inicializar nivel
  useEffect(() => {
    if (initialData) {
      setMission(initialData.mission);
      setScore(0);
      setTimeLeft(60); // SIEMPRE 1 minuto al empezar
      setGameState('playing');

      const targets = [];
      const distractors = [];
      
      initialData.wallData.forEach(item => {
        if (item.isTarget) targets.push(item.text);
        else distractors.push(item.text);
      });

      poolRef.current = { targets, distractors };

      const newBlocks = initialData.wallData.map((item, index) => ({
        id: index,
        x: (Math.random() * 40) - 20, 
        y: 0.5,
        z: (Math.random() * 40) - 20,
        text: item.text,
        isTarget: item.isTarget,
        visible: true
      }));

      setBlocks(newBlocks);
    }
  }, [initialData]);

  // Cronómetro (Cuenta atrás simple)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('lost'); // Fin del tiempo
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const mineBlock = useCallback((id) => {
    if (gameState !== 'playing') return;

    setBlocks((prev) => {
      const blockIndex = prev.findIndex((b) => b.id === id);
      const block = prev[blockIndex];

      if (!block || !block.visible) return prev;

      if (block.isTarget) {
        // === ACIERTO ===
        const remainingBlocks = prev.filter(b => b.id !== id);

        // Generamos bloques infinitos para reponer
        const newTarget = generateRandomBlock(true);      
        const newDistractor = generateRandomBlock(false); 

        // CAMBIO: Solo sumamos puntos, NO tiempo.
        setScore(s => s + 10);

        return [
            ...remainingBlocks, 
            newTarget, 
            newDistractor
        ].filter(Boolean);

      } else {
        // === ERROR ===
        // CAMBIO: Restamos PUNTOS en lugar de tiempo para mantener la duración de 1 minuto exacta.
        setScore(s => Math.max(0, s - 5)); 
        return prev;
      }
    });
  }, [gameState]);

  return { blocks, timeLeft, score, gameState, mission, mineBlock };
};