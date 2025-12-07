import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConfetti } from "/src/apps/_shared/ConfettiProvider";

const TOTAL_TEST_QUESTIONS = 5;
const FONT_STYLES = ['default', 'cursive', 'uppercase'];

export const useOrdenaLaFraseGame = (frases, withTimer = false) => {
  const [mision, setMision] = useState({ texto: '', solucion: '' });
  const [palabrasOrigen, setPalabrasOrigen] = useState([]);
  const [palabrasDestino, setPalabrasDestino] = useState([]);
  const [feedback, setFeedback] = useState({ texto: '', clase: '' });

  // Mantengo la API de estilo para el slider, pero ya no toca los datos
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);

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

  // Clave estable por contenido para no depender de la referencia del array
  const frasesKey = useMemo(() => {
    if (!Array.isArray(frases)) return '';
    return frases.join('§');
  }, [frases]);

  const handleFontStyleChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    setFontStyle(FONT_STYLES[newIndex]);
  };

  const startPracticeMission = useCallback(() => {
    setFeedback({ texto: '', clase: '' });

    if (!frases || frases.length === 0) {
      setPalabrasOrigen([]);
      setPalabrasDestino([]);
      setMision({ texto: '', solucion: '' });
      return;
    }

    setMision(prev => {
      const prevSig = prev.solucion ? prev.solucion.toLowerCase() : '';

      // Pool de candidatas distintas a la anterior por contenido
      let candidatas = frases.filter(f => (f || '').toLowerCase() !== prevSig);
      if (candidatas.length === 0) candidatas = frases; // Si todas son iguales, permite repetir

      const nueva = candidatas[Math.floor(Math.random() * candidatas.length)];
      const solucion = nueva; // No transformamos por estilo; lo hace CSS

      const palabras = solucion.split(' ').sort(() => Math.random() - 0.5);
      const ahora = Date.now();
      setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${ahora}-${i}`, texto: p })));
      setPalabrasDestino([]);

      return { texto: 'Forma la frase:', solucion };
    });
  }, [frasesKey]); 

  // Solo recarga misión si cambia el contenido real (no al mover el slider)
  useEffect(() => {
    if (!isTestMode) startPracticeMission();
  }, [isTestMode, frasesKey, startPracticeMission]);

  const startTest = () => {
    if (!frases || frases.length === 0) return;

    // Elegimos hasta TOTAL_TEST_QUESTIONS frases (únicas por contenido)
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

  // --- NUEVA LÓGICA DE CLIC Y BOTÓN ---

  // Mover palabra de origen a destino (al hacer clic)
  const handleOriginWordClick = (palabra) => {
    setPalabrasOrigen(prev => prev.filter(p => p.id !== palabra.id));
    setPalabrasDestino(prev => [...prev, palabra]);
  };

  // Devolver palabra de destino a origen (al pulsar la X)
  const handleRemoveWord = (palabra) => {
    setPalabrasDestino(prev => prev.filter(p => p.id !== palabra.id));
    setPalabrasOrigen(prev => {
        const nuevos = [...prev, palabra];
        // Reordenar por el ID original para que no se desordenen al volver
        return nuevos.sort((a, b) => {
            const idA = parseInt(a.id.split('-')[2] || '0', 10);
            const idB = parseInt(b.id.split('-')[2] || '0', 10);
            return idA - idB;
        });
    });
  };

  // --- LÓGICA DRAG & DROP (EXISTENTE) ---
  const getDropTarget = (container, x, y) => {
    const els = [...container.querySelectorAll('.palabra:not(.dragging)')];
    for (const el of els) {
      const box = el.getBoundingClientRect();
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return el;
    }
    return null;
  };

  const handleDragStart = (e, palabra) => {
    draggedItem.current = palabra;
    e.target.classList.add('dragging');
  };
  const handleDragEnd = () => {
    document.querySelectorAll('.palabra.dragging').forEach(el => el.classList.remove('dragging'));
    draggedItem.current = null;
  };

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

  const handleDragOver = (e) => e.preventDefault();

  const handleTouchStart = (e, palabra) => {
    draggedItem.current = palabra;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    const clone = el.cloneNode(true);
    // Clon no debe tener el botón X visible o funcional, es visual
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
    clone.style.transform = `translate(${t.clientX - parseFloat(clone.style.left) - clone.offsetWidth / 2}px, ${t.clientY - parseFloat(clone.style.top) - clone.offsetHeight / 2}px)`;
  };

  const handleTouchEnd = (e) => {
    if (!draggedItem.current) return;

    if (draggedCloneRef.current) {
      document.body.removeChild(draggedCloneRef.current);
      draggedCloneRef.current = null;
    }
    document.body.classList.remove('no-scroll');
    document.querySelectorAll('.palabra.dragging').forEach(el => el.classList.remove('dragging'));

    const touch = e.changedTouches[0];
    const dropZone = dropZoneRef.current;
    const item = draggedItem.current;

    let nuevasOrigen = palabrasOrigen.filter(p => p.id !== item.id);
    let nuevasDestino = palabrasDestino.filter(p => p.id !== item.id);

    const rect = dropZone.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      const dropTarget = getDropTarget(dropZone, touch.clientX, touch.clientY);
      if (dropTarget) {
        const index = nuevasDestino.findIndex(p => p.id === dropTarget.dataset.id);
        nuevasDestino.splice(index, 0, item);
      } else {
        nuevasDestino.push(item);
      }
    } else {
      nuevasOrigen.push(item);
      nuevasOrigen.sort((a, b) => parseInt(a.id.split('-')[2]) - parseInt(b.id.split('-')[2]));
    }

    setPalabrasOrigen(nuevasOrigen);
    setPalabrasDestino(nuevasDestino);
    draggedItem.current = null;
  };

  const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);

  return {
    isTestMode, startTest, exitTestMode,
    mision, palabrasOrigen, palabrasDestino, feedback,
    checkPracticeAnswer, startPracticeMission,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    handleOriginWordClick, handleRemoveWord, // Exportamos los nuevos handlers
    dropZoneRef, originZoneRef,
    currentQuestionIndex, TOTAL_TEST_QUESTIONS, elapsedTime,
    showResults, score, testQuestions, userAnswers,
    handleNextQuestion,
    fontStyle, fontStyleIndex, handleFontStyleChange
  };
};

