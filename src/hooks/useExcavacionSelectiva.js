import { useState, useCallback, useEffect, useRef } from 'react';

export const useExcavacionSelectiva = (initialData) => {
  const [blocks, setBlocks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [mission, setMission] = useState('');
  const [combo, setCombo] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [lastEvent, setLastEvent] = useState(null); // { type, id }
  const processedIdsRef = useRef(new Set());

  const [isSuddenDeath, setIsSuddenDeath] = useState(false);
  const suddenDeathCapRef = useRef(5.0);
  const streakRef = useRef(0);

  const currentCategoryRef = useRef(null);
  const allCategoriesRef = useRef([]);
  const isCategorizedRef = useRef(false);

  const triggerEvent = (type) => setLastEvent({ type, id: Date.now() });

  // Generador de bloques único
  const createBlock = (type, data) => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = (Math.random() * 60) - 30;
    const z = (Math.random() * 60) - 30;

    if (type === 'star') {
      return { id, x, y: 3.5, z, text: "★", isTarget: true, isStar: true, visible: true };
    }

    // Probabilidad de bloques especiales
    const randSpecial = Math.random();
    if (randSpecial < 0.05) {
      return { id, x, y: 0.5, z, text: "TNT", isTarget: false, isTNT: true, visible: true };
    }
    if (randSpecial < 0.08) {
      return { id, x, y: 0.5, z, text: "❄️", isTarget: true, isFreeze: true, visible: true };
    }

    // Si viene forzado como gold o por azar (mantenemos el azar bajo para otros)
    if (type === 'gold') {
      return { id, x, y: 0.5, z, text: "", isTarget: true, isGold: true, visible: true };
    }
    if (randSpecial < 0.13) {
      return { id, x, y: 0.5, z, text: "", isTarget: true, isGold: true, visible: true };
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

    return { id, x, y: 0.5, z, text, isTarget, isStar: false, isGold: false, visible: true };
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
    // Mantenemos bloques constantes
    for (let i = 0; i < 15; i++) newBlocks.push(createBlock('target', data));
    for (let i = 0; i < 12; i++) newBlocks.push(createBlock('distractor', data));
    for (let i = 0; i < 3; i++) newBlocks.push(createBlock('special', data));
    for (let i = 0; i < 2; i++) newBlocks.push(createBlock('gold', data));

    setBlocks(newBlocks);
  };

  useEffect(() => {
    if (!initialData) return;
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setGameState('playing');
    setIsSuddenDeath(false);
    suddenDeathCapRef.current = 5.0;
    processedIdsRef.current.clear();
    regenerateMap(initialData);
  }, [initialData]);

  useEffect(() => {
    if (gameState !== 'playing' || isFrozen) return;
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
  }, [gameState, isSuddenDeath, isFrozen]);

  // Respawn de oro cada 10 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setBlocks(prev => {
        // Encontramos los índices de los bloques de oro actuales
        const goldIndices = [];
        prev.forEach((b, idx) => { if (b.isGold) goldIndices.push(idx); });

        if (goldIndices.length === 0) return prev;

        const newBlocks = [...prev];
        goldIndices.forEach(idx => {
          newBlocks[idx] = createBlock('gold', initialData);
        });
        return newBlocks;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [gameState, initialData]);

  const mineBlock = useCallback((id) => {
    if (gameState !== 'playing' || processedIdsRef.current.has(id)) return;

    // Encontrar el bloque en el estado actual para determinar acción
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    processedIdsRef.current.add(id);

    if (block.isTNT) {
      triggerEvent('tnt');
      setScore(s => Math.max(0, s - 20));
      setCombo(0);
      setTimeLeft(t => Math.max(0, t - 10));
      setBlocks(prev => prev.map(b => b.id === id ? createBlock('distractor', initialData) : b));
      return;
    }

    if (block.isFreeze) {
      triggerEvent('freeze');
      setIsFrozen(true);
      setTimeout(() => setIsFrozen(false), 5000);
      setBlocks(prev => prev.map(b => b.id === id ? createBlock('target', initialData) : b));
      return;
    }

    if (block.isStar) {
      triggerEvent('mine');
      setScore(s => s + 50);
      if (isSuddenDeath) setTimeLeft(suddenDeathCapRef.current);
      setTimeout(() => regenerateMap(initialData), 10);
      return;
    }

    if (block.isGold) {
      triggerEvent('mine');
      setCombo(c => {
        const nextC = c + 1;
        const multiplier = Math.floor(c / 5) + 1;
        setScore(s => s + (25 * multiplier));
        return nextC;
      });
      // Reemplazo inmediato por otro bloque de oro
      setBlocks(prev => prev.map(b => b.id === id ? createBlock('gold', initialData) : b));
      return;
    }

    if (block.isTarget) {
      triggerEvent('mine');
      setCombo(c => {
        const nextC = c + 1;
        const multiplier = Math.floor(c / 5) + 1;
        setScore(s => s + (10 * multiplier));
        return nextC;
      });
      streakRef.current += 1;

      setBlocks(prev => {
        const newBlocks = prev.map(b => b.id === id ? createBlock('target', initialData) : b);
        if (streakRef.current >= 3) {
          newBlocks.push(createBlock('star', initialData));
          streakRef.current = 0;
        }
        return newBlocks;
      });

      if (isSuddenDeath) {
        suddenDeathCapRef.current = Math.max(0.5, suddenDeathCapRef.current - 0.1);
        setTimeLeft(suddenDeathCapRef.current);
      }
    } else {
      triggerEvent('error');
      setScore(s => Math.max(0, s - 5));
      setCombo(0);
      if (isSuddenDeath) setTimeLeft(t => Math.max(0, t - 1.0));
      // No eliminamos el bloque si es error (distractor), solo penalizamos
      processedIdsRef.current.delete(id); // Permitimos volver a intentarlo (aunque sea error)
    }
  }, [gameState, isSuddenDeath, initialData, blocks]);

  return { blocks, timeLeft, score, gameState, mission, mineBlock, isSuddenDeath, combo, isFrozen, lastEvent };
};