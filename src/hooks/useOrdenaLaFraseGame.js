import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConfetti } from "/src/apps/_shared/ConfettiProvider";

const TOTAL_TEST_QUESTIONS = 5;
const FONT_STYLES = ['default', 'cursive', 'uppercase'];

export const useOrdenaLaFraseGame = (frases, withTimer = false) => {
  const [mision, setMision] = useState({ texto: '', solucion: '' });
  const [palabrasOrigen, setPalabrasOrigen] = useState([]);
  const [palabrasDestino, setPalabrasDestino] = useState([]);
  const [feedback, setFeedback] = useState({ texto: '', clase: '' });
  
  const [showSolution, setShowSolution] = useState(false);
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);

  // Refs para gestión de arrastre
  const draggedItem = useRef(null);
  const dropZoneRef = useRef(null);
  const originZoneRef = useRef(null);
  const draggedCloneRef = useRef(null);
  const { confeti } = useConfetti();

  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const frasesKey = useMemo(() => {
    if (!Array.isArray(frases)) return '';
    return frases.join('§');
  }, [frases]);

  const handleFontStyleChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    setFontStyle(FONT_STYLES[newIndex]);
  };

  const toggleSolution = () => setShowSolution(prev => !prev);

  const startPracticeMission = useCallback(() => {
    setFeedback({ texto: '', clase: '' });
    setShowSolution(false);

    if (!frases || frases.length === 0) {
      setPalabrasOrigen([]);
      setPalabrasDestino([]);
      setMision({ texto: '', solucion: '' });
      return;
    }

    setMision(prev => {
      const prevSig = prev.solucion ? prev.solucion.toLowerCase() : '';
      let candidatas = frases.filter(f => (f || '').toLowerCase() !== prevSig);
      if (candidatas.length === 0) candidatas = frases;

      const nueva = candidatas[Math.floor(Math.random() * candidatas.length)];
      const solucion = nueva; 

      const palabras = solucion.split(' ').sort(() => Math.random() - 0.5);
      const ahora = Date.now();
      setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${ahora}-${i}`, texto: p })));
      setPalabrasDestino([]);

      return { texto: 'Forma la frase:', solucion };
    });
  }, [frasesKey]); 

  useEffect(() => {
    if (!isTestMode) startPracticeMission();
  }, [isTestMode, frasesKey, startPracticeMission]);

  const startTest = () => {
    if (!frases || frases.length === 0) return;

    const unicas = [...new Set(frases.map(f => (f || '').trim()))];
    const seleccion = unicas.sort(() => 0.5 - Math.random()).slice(0, TOTAL_TEST_QUESTIONS);
    const questions = seleccion.map(sol => ({ texto: 'Forma la frase:', solucion: sol }));

    setTestQuestions(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);

    const { solucion } = questions[0];
    const palabras = solucion.split(' ').sort(() => Math.random() - 0.5);
    const ahora = Date.now();
    setMision(questions[0]);
    setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${ahora}-${i}`, texto: p })));
    setPalabrasDestino([]);
    setFeedback({ texto: '', clase: '' });
    setShowSolution(false);
    setShowResults(false);
    setScore(0);
    setIsTestMode(true);

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
      const timeBonus = Math.max(0, 100 - (time * 2));
      base += timeBonus;
    }
    return Math.floor(base);
  };

  const handleNextQuestion = () => {
    const fraseUsuario = palabrasDestino.map(p => p.texto).join(' ');
    const newAnswers = [...userAnswers, fraseUsuario];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const { solucion } = testQuestions[nextIndex];
      const palabras = solucion.split(' ').sort(() => Math.random() - 0.5);
      const ahora = Date.now();
      setMision(testQuestions[nextIndex]);
      setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${ahora}-${i}`, texto: p })));
      setPalabrasDestino([]);
    } else {
      const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
      setElapsedTime(finalTime);

      let correctCount = 0;
      testQuestions.forEach((q, index) => {
        if (newAnswers[index] === q.solucion) correctCount++;
      });

      setScore(calculateScore(correctCount, finalTime));
      setShowResults(true);
    }
  };

  const exitTestMode = () => setIsTestMode(false);

  const checkPracticeAnswer = () => {
    const fraseUsuario = palabrasDestino.map(p => p.texto).join(' ');
    if (fraseUsuario === mision.solucion) {
      setFeedback({ texto: "¡Correcto! ¡Muy bien!", clase: 'correcta' });
      // confeti()
    } else {
      setFeedback({ texto: "Casi... Revisa el orden de las palabras", clase: 'incorrecta' });
    }
  };

  const handleOriginWordClick = (palabra) => {
    setPalabrasOrigen(prev => prev.filter(p => p.id !== palabra.id));
    setPalabrasDestino(prev => [...prev, palabra]);
  };

  const handleRemoveWord = (palabra) => {
    setPalabrasDestino(prev => prev.filter(p => p.id !== palabra.id));
    setPalabrasOrigen(prev => {
        const nuevos = [...prev, palabra];
        return nuevos.sort((a, b) => {
            const idA = parseInt(a.id.split('-')[2] || '0', 10);
            const idB = parseInt(b.id.split('-')[2] || '0', 10);
            return idA - idB;
        });
    });
  };

  // --- LÓGICA ARRASTRE ---

  const cleanupDrag = () => {
    // 1. Eliminar clon visual
    if (draggedCloneRef.current) {
        if (draggedCloneRef.current.parentNode) {
            document.body.removeChild(draggedCloneRef.current);
        }
        draggedCloneRef.current = null;
    }
    // 2. Restaurar scroll
    document.body.classList.remove('no-scroll');
    // 3. Quitar clase dragging de cualquier elemento
    document.querySelectorAll('.palabra.dragging').forEach(el => el.classList.remove('dragging'));
    // 4. Limpiar referencia del item
    draggedItem.current = null;
  };

  // Limpieza al desmontar componente
  useEffect(() => {
    return () => cleanupDrag();
  }, []);

  const getDropTarget = (container, x, y) => {
    const els = [...container.querySelectorAll('.palabra:not(.dragging)')];
    for (const el of els) {
      const box = el.getBoundingClientRect();
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return el;
    }
    return null;
  };

  // --- DRAG (RATÓN) ---
  const handleDragStart = (e, palabra) => {
    draggedItem.current = palabra;
    e.target.classList.add('dragging');
  };
  const handleDragEnd = () => {
    cleanupDrag();
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetZoneId) => {
    e.preventDefault();
    if (!draggedItem.current) return;

    const item = draggedItem.current;
    let nuevasOrigen = palabrasOrigen.filter(p => p.id !== item.id);
    let nuevasDestino = palabrasDestino.filter(p => p.id !== item.id);

    if (targetZoneId === 'origen') {
      nuevasOrigen.push(item);
      nuevasOrigen.sort((a, b) => parseInt(a.id.split('-')[2]) - parseInt(b.id.split('-')[2]));
    } else {
      const dropTarget = getDropTarget(e.currentTarget, e.clientX, e.clientY);
      if (dropTarget) {
        const index = nuevasDestino.findIndex(p => p.id === dropTarget.dataset.id);
        nuevasDestino.splice(index, 0, item);
      } else {
        nuevasDestino.push(item);
      }
    }

    setPalabrasOrigen(nuevasOrigen);
    setPalabrasDestino(nuevasDestino);
  };

  // --- TOUCH (MÓVIL) ---
  const handleTouchStart = (e, palabra) => {
    // Seguridad: Limpiar cualquier residuo anterior antes de empezar uno nuevo
    cleanupDrag();

    draggedItem.current = palabra;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    // Crear clon
    const clone = el.cloneNode(true);
    // Ocultar botón X en el clon para que no se vea raro
    const btn = clone.querySelector('.btn-remove-word');
    if(btn) btn.style.display = 'none';

    clone.classList.add('palabra-clone');
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
    // Si no había item, limpiamos cualquier residuo visual por si acaso y salimos
    if (!draggedItem.current) {
        cleanupDrag();
        return;
    }

    const touch = e.changedTouches[0];
    const dropZone = dropZoneRef.current;
    const item = draggedItem.current;

    // Solo procesamos lógica si soltamos dentro de la zona destino
    if (dropZone) {
        const rect = dropZone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            
            let nuevasOrigen = palabrasOrigen.filter(p => p.id !== item.id);
            let nuevasDestino = palabrasDestino.filter(p => p.id !== item.id);
            
            const dropTarget = getDropTarget(dropZone, touch.clientX, touch.clientY);
            if (dropTarget) {
                const index = nuevasDestino.findIndex(p => p.id === dropTarget.dataset.id);
                nuevasDestino.splice(index, 0, item);
            } else {
                nuevasDestino.push(item);
            }
            setPalabrasOrigen(nuevasOrigen);
            setPalabrasDestino(nuevasDestino);
        }
    }
    // IMPORTANTE: Limpiar todo al final
    cleanupDrag();
  };

  const handleTouchCancel = (e) => {
    cleanupDrag();
  };

  const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);

  return {
    isTestMode, startTest, exitTestMode,
    mision, palabrasOrigen, palabrasDestino, feedback,
    checkPracticeAnswer, startPracticeMission,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel,
    handleOriginWordClick, handleRemoveWord,
    dropZoneRef, originZoneRef,
    currentQuestionIndex, TOTAL_TEST_QUESTIONS, elapsedTime,
    showResults, score, testQuestions, userAnswers,
    handleNextQuestion,
    fontStyle, fontStyleIndex, handleFontStyleChange,
    showSolution, toggleSolution
  };
};