// src/hooks/useOrdenaLaHistoriaGame.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti'; // IMPORTANTE: Importamos la librería

const TOTAL_TEST_STORIES = 5;
const FONT_STYLES = ['default', 'cursive', 'uppercase'];

export const useOrdenaLaHistoriaGame = (historias, withTimer = false) => {
  const [historiaCorrecta, setHistoriaCorrecta] = useState([]);
  const [frasesDesordenadas, setFrasesDesordenadas] = useState([]);
  const [feedback, setFeedback] = useState({ texto: '', clase: '' });
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);
  const [showSolution, setShowSolution] = useState(false);

  const draggedItem = useRef(null);
  const dropZoneRef = useRef(null);
  const draggedCloneRef = useRef(null);

  // Eliminamos useConfetti
  // const { confeti } = useConfetti();

  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Firma estable del contenido
  const historiasKey = useMemo(() => {
    if (!Array.isArray(historias)) return '';
    return JSON.stringify(historias);
  }, [historias]);

  const mapToUniqueItems = (frasesArray) =>
    frasesArray.map((frase, index) => ({
      id: `frase-${Date.now()}-${index}`,
      texto: frase 
    }));

  const handleFontStyleChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    setFontStyle(FONT_STYLES[newIndex]);
  };

  const toggleSolution = () => setShowSolution(prev => !prev);

  const cargarSiguienteHistoria = useCallback(() => {
    setFeedback({ texto: '', clase: '' });
    setShowSolution(false);

    if (!historias || historias.length === 0) {
      setHistoriaCorrecta([]);
      setFrasesDesordenadas([]);
      return;
    }

    setHistoriaCorrecta((prevHistoria) => {
      const prevSig = JSON.stringify(prevHistoria.map(f => f.texto.toLowerCase()));
      let candidatas = historias.filter(
        h => JSON.stringify(h.map(f => f.toLowerCase())) !== prevSig
      );
      if (candidatas.length === 0) candidatas = historias;

      const nuevaHistoria = candidatas[Math.floor(Math.random() * candidatas.length)];
      const items = mapToUniqueItems(nuevaHistoria);
      
      setFrasesDesordenadas([...items].sort(() => Math.random() - 0.5));
      return items;
    });
  }, [historiasKey]);

  useEffect(() => {
    if (!isTestMode) cargarSiguienteHistoria();
  }, [isTestMode, historiasKey, cargarSiguienteHistoria]);

  const startTest = () => {
    if (!historias || historias.length === 0) return;

    const unicas = [...new Set(historias.map(h => JSON.stringify(h)))].map(s => JSON.parse(s));
    const questions = unicas.sort(() => 0.5 - Math.random()).slice(0, TOTAL_TEST_STORIES);

    setTestQuestions(questions.map(q => mapToUniqueItems(q)));
    setCurrentStoryIndex(0);
    setUserAnswers([]);

    const primera = questions[0] || [];
    const items = mapToUniqueItems(primera);
    setHistoriaCorrecta(items);
    setFrasesDesordenadas([...items].sort(() => Math.random() - 0.5));

    setShowResults(false);
    setScore(0);
    setIsTestMode(true);
    setShowSolution(false);
    if (withTimer) {
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  };

  useEffect(() => {
    let timer;
    if (isTestMode && withTimer && !showResults) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestMode, withTimer, showResults, startTime]);

  const calculateScore = (correctCount, time) => {
    let base = correctCount * 200;
    if (withTimer && correctCount > 0) {
      const bonus = Math.max(0, 100 - (time / correctCount) * 2);
      base += bonus;
    }
    return Math.floor(base);
  };

  const handleNextStory = () => {
    const respuesta = [...frasesDesordenadas];
    const actuales = [...userAnswers, respuesta];
    setUserAnswers(actuales);

    if (currentStoryIndex < TOTAL_TEST_STORIES - 1 && currentStoryIndex < testQuestions.length - 1) {
      const next = currentStoryIndex + 1;
      setCurrentStoryIndex(next);
      const siguiente = testQuestions[next];
      setHistoriaCorrecta(siguiente);
      setFrasesDesordenadas([...siguiente].sort(() => Math.random() - 0.5));
    } else {
      const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
      setElapsedTime(finalTime);
      let correctCount = 0;
      testQuestions.forEach((story, i) => {
        const u = actuales[i].map(f => f.texto).join();
        const c = story.map(f => f.texto).join();
        if (u === c) correctCount++;
      });
      setScore(calculateScore(correctCount, finalTime));
      setShowResults(true);
    }
  };

  const exitTestMode = () => setIsTestMode(false);

  const checkStory = () => {
    const u = frasesDesordenadas.map(f => f.texto).join();
    const c = historiaCorrecta.map(f => f.texto).join();
    if (u === c) {
      setFeedback({ 
        texto: "¡Correcto! La historia tiene sentido", 
        clase: 'correcta',
        timestamp: Date.now() 
      });
      
      // --- LÓGICA DE CONFETTI AÑADIDA ---
      if (dropZoneRef.current) {
        const rect = dropZoneRef.current.getBoundingClientRect();
        // Calculamos el centro relativo a la ventana (valores entre 0 y 1)
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            origin: { x, y },
            particleCount: 150,
            spread: 70,
            startVelocity: 30,
            zIndex: 1000 
        });
      }

    } else {
      setFeedback({ 
        texto: "Casi... Intenta ordenar las frases de otra manera", 
        clase: 'incorrecta',
        timestamp: Date.now() 
      });
    }
  };

  // --- REORDENACIÓN PASO A PASO ---
  const moveFrase = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= frasesDesordenadas.length) return;

    const newFrases = [...frasesDesordenadas];
    const temp = newFrases[index];
    newFrases[index] = newFrases[newIndex];
    newFrases[newIndex] = temp;
    
    setFrasesDesordenadas(newFrases);
  };

  // --- REORDENACIÓN EXTREMA (NUEVO) ---
  const moveFraseToExtreme = (index, position) => {
    // position: 'top' (principio) | 'bottom' (final)
    if (index < 0 || index >= frasesDesordenadas.length) return;

    const newFrases = [...frasesDesordenadas];
    // Sacamos el elemento
    const [item] = newFrases.splice(index, 1);
    
    if (position === 'top') {
        newFrases.unshift(item); // Insertar al principio
    } else {
        newFrases.push(item); // Insertar al final
    }
    setFrasesDesordenadas(newFrases);
  };

  // --- LÓGICA ARRASTRE (DND) ---
  const cleanupDrag = () => {
    if (draggedCloneRef.current) {
        if(draggedCloneRef.current.parentNode) draggedCloneRef.current.remove();
        draggedCloneRef.current = null;
    }
    document.body.classList.remove('no-scroll');
    document.querySelectorAll('.frase.dragging').forEach(el => el.classList.remove('dragging'));
    draggedItem.current = null;
  };

  useEffect(() => {
    return () => cleanupDrag();
  }, []);

  const handleDragStart = (e, frase) => {
    draggedItem.current = frase;
    setTimeout(() => { 
        if (e.target) e.target.classList.add('dragging'); 
    }, 0);
  };

  const handleDragEnd = (e) => {
    cleanupDrag();
  };

  const getDragAfterElement = (container, y) => {
    const elements = [...container.querySelectorAll('.frase:not(.dragging)')];
    return elements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem.current) return;

    const container = e.currentTarget;
    const afterElement = getDragAfterElement(container, e.clientY);
    
    const nuevaLista = frasesDesordenadas.filter(f => f.id !== draggedItem.current.id);
    
    if (afterElement == null) {
      nuevaLista.push(draggedItem.current);
    } else {
      const afterId = afterElement.getAttribute('data-id');
      const index = nuevaLista.findIndex(f => f.id === afterId);
      nuevaLista.splice(index, 0, draggedItem.current);
    }
    
    setFrasesDesordenadas(nuevaLista);
    cleanupDrag();
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleTouchStart = (e, frase) => {
    if (e.cancelable && !e.defaultPrevented) {}
    cleanupDrag(); 

    draggedItem.current = frase;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    
    const clone = el.cloneNode(true);
    const controls = clone.querySelector('.frase-controls');
    if (controls) controls.remove();

    clone.classList.add('frase-clone');
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    
    document.body.appendChild(clone);
    draggedCloneRef.current = clone;
    
    el.classList.add('dragging');
    document.body.classList.add('no-scroll');
  };

  const handleTouchMove = (e) => {
    if (!draggedCloneRef.current || !e.touches[0]) return;
    const t = e.touches[0];
    const clone = draggedCloneRef.current;
    
    const x = t.clientX - parseFloat(clone.style.left) - clone.offsetWidth / 2;
    const y = t.clientY - parseFloat(clone.style.top) - clone.offsetHeight / 2;
    clone.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleTouchEnd = (e) => {
    if (!draggedItem.current) {
        cleanupDrag();
        return;
    }

    const touch = e.changedTouches[0];
    const dropZone = dropZoneRef.current;
    
    if (dropZone && touch) {
        const rect = dropZone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right && 
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            
            const fakeEvent = { 
                preventDefault: () => {}, 
                currentTarget: dropZone, 
                clientY: touch.clientY 
            };
            handleDrop(fakeEvent);
            return;
        }
    }
    cleanupDrag();
  };

  const handleTouchCancel = (e) => {
    cleanupDrag();
  };

  const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);

  return {
    isTestMode, startTest, exitTestMode,
    frasesDesordenadas, feedback, historiaCorrecta,
    checkStory, cargarSiguienteHistoria, 
    moveFrase, moveFraseToExtreme, 
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel,
    dropZoneRef,
    currentStoryIndex, TOTAL_TEST_STORIES, elapsedTime,
    showResults, score, testQuestions, userAnswers,
    handleNextStory,
    fontStyle, fontStyleIndex, handleFontStyleChange,
    showSolution, toggleSolution
  };
};