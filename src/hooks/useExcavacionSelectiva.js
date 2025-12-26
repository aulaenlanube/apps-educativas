import { useState, useCallback, useEffect, useRef } from 'react';

export const useExcavacionSelectiva = (initialData) => {
  const [blocks, setBlocks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [mission, setMission] = useState('');

  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const suddenDeathCapRef = useRef(5.0);
  const streakRef = useRef(0);

  const currentCategoryRef = useRef(null);
  const allCategoriesRef = useRef([]);
  const isCategorizedRef = useRef(false);

  // Generador de bloques único
  const createBlock = (type, data) => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = (Math.random() * 60) - 30;
    const z = (Math.random() * 60) - 30;

    if (type === 'star') {
      return { id, x, y: 3.5, z, text: "★", isTarget: true, isStar: true, visible: true };
    }

    let text = "";
    let isTarget = false;

    if (isCategorizedRef.current) {
      // Lógica para datos tipo RUNNER (Categorizados)
      const targetCategory = currentCategoryRef.current;
      if (type === 'target') {
        const list = data[targetCategory] || [];
        text = String(list[Math.floor(Math.random() * list.length)] || "???");
        isTarget = true;
      } else {
        const otherCategories = allCategoriesRef.current.filter(c => c !== targetCategory);
        const cat = otherCategories.length > 0 ? otherCategories[Math.floor(Math.random() * otherCategories.length)] : targetCategory;
        const list = data[cat] || [];
        text = String(list[Math.floor(Math.random() * list.length)] || "...");
        isTarget = false;
      }
    } else {
      // Lógica para datos tipo EXCAVACION (Lista wallData)
      const list = data.wallData || [];
      const entry = list[Math.floor(Math.random() * list.length)];
      text = String(entry?.text || "?");
      isTarget = entry?.isTarget ?? false;

      // Si pedimos específicamente un tipo pero la lista no nos lo da, forzamos reintento simple
      if (type === 'target' && !isTarget) return createBlock('target', data);
      if (type === 'distractor' && isTarget) return createBlock('distractor', data);
    }

    return { id, x, y: 0.5, z, text, isTarget, isStar: false, visible: true };
  };

  const regenerateMap = (data) => {
    if (!data) return;

    // Detectar formato
    if (data.wallData && Array.isArray(data.wallData)) {
      isCategorizedRef.current = false;
      setMission(data.mission || "¡Excava con cuidado!");
    } else {
      isCategorizedRef.current = true;
      const categories = Object.keys(data).filter(k => Array.isArray(data[k]));
      allCategoriesRef.current = categories;
      const targetCategory = categories[Math.floor(Math.random() * categories.length)];
      currentCategoryRef.current = targetCategory;
      setMission(`¡Busca: ${targetCategory.replace(/_/g, ' ').toUpperCase()}!`);
    }

    streakRef.current = 0;
    const newBlocks = [];
    // Mantenemos 30 bloques constantes
    for (let i = 0; i < 15; i++) newBlocks.push(createBlock('target', data));
    for (let i = 0; i < 15; i++) newBlocks.push(createBlock('distractor', data));

    setBlocks(newBlocks);
  };

  useEffect(() => {
    if (!initialData) return;
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    setIsSuddenDeath(false);
    suddenDeathCapRef.current = 5.0;
    regenerateMap(initialData);
  }, [initialData]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newVal = prev - 0.1;
        if (newVal <= 0) {
          if (!isSuddenDeath) {
            setIsSuddenDeath(true);
            return 5.0;
          } else {
            setGameState('lost');
            return 0;
          }
        }
        return newVal;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameState, isSuddenDeath]);

  const mineBlock = useCallback((id) => {
    if (gameState !== 'playing') return;

    setBlocks((prev) => {
      const blockIndex = prev.findIndex((b) => b.id === id);
      if (blockIndex === -1) return prev;

      const block = prev[blockIndex];

      // Caso Estrella: Limpia y regenera
      if (block.isStar) {
        setScore(s => s + 50);
        if (isSuddenDeath) setTimeLeft(suddenDeathCapRef.current);
        // Usamos un timeout para no interferir con el render actual
        setTimeout(() => regenerateMap(initialData), 10);
        return [];
      }

      // Caso Objetivo: Reemplazamos 1 por 1
      if (block.isTarget) {
        setScore(s => s + 10);
        streakRef.current += 1;

        const newBlocks = [...prev];
        // Reemplazamos el bloque destruido por uno nuevo del mismo tipo (target)
        newBlocks[blockIndex] = createBlock('target', initialData);

        // Si hay racha, añadimos una estrella temporal
        if (streakRef.current >= 3) {
          newBlocks.push(createBlock('star', initialData));
          streakRef.current = 0;
        }

        if (isSuddenDeath) {
          suddenDeathCapRef.current = Math.max(0.5, suddenDeathCapRef.current - 0.1);
          setTimeLeft(suddenDeathCapRef.current);
        }

        return newBlocks;
      } else {
        // Error: No desaparece, solo penaliza score y tiempo en Sudden Death
        setScore(s => Math.max(0, s - 5));
        if (isSuddenDeath) setTimeLeft(t => Math.max(0, t - 1.0));
        return prev;
      }
    });
  }, [gameState, isSuddenDeath, initialData]);

  return { blocks, timeLeft, score, gameState, mission, mineBlock, isSuddenDeath };
};