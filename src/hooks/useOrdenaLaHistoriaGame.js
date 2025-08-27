import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConfetti } from "/src/apps/_shared/ConfettiProvider";

const TOTAL_TEST_STORIES = 5;
const FONT_STYLES = ['default', 'cursive', 'uppercase'];

export const useOrdenaLaHistoriaGame = (historias, withTimer = false) => {
  const [historiaCorrecta, setHistoriaCorrecta] = useState([]);
  const [frasesDesordenadas, setFrasesDesordenadas] = useState([]);
  const [feedback, setFeedback] = useState({ texto: '', clase: '' });
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);

  const draggedItem = useRef(null);
  const dropZoneRef = useRef(null);
  const draggedCloneRef = useRef(null);

  const { confeti } = useConfetti();

  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Firma estable del contenido para evitar depender de la referencia del array
  const historiasKey = useMemo(() => {
    if (!Array.isArray(historias)) return '';
    return JSON.stringify(historias);
  }, [historias]);

  const mapToUniqueItems = (frasesArray) =>
    frasesArray.map((frase, index) => ({
      id: `frase-${Date.now()}-${index}`,
      texto: frase // El estilo se aplica por CSS, no mutamos el texto
    }));

  const handleFontStyleChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    setFontStyle(FONT_STYLES[newIndex]);
  };

  const cargarSiguienteHistoria = useCallback(() => {
    setFeedback({ texto: '', clase: '' });

    if (!historias || historias.length === 0) {
      setHistoriaCorrecta([]);
      setFrasesDesordenadas([]);
      return;
    }

    setHistoriaCorrecta((prevHistoria) => {
      // Firma (contenido) de la historia previa
      const prevSig = JSON.stringify(prevHistoria.map(f => f.texto.toLowerCase()));

      // Pool de candidatas con contenido distinto a la previa
      let candidatas = historias.filter(
        h => JSON.stringify(h.map(f => f.toLowerCase())) !== prevSig
      );

      // Si todas son iguales a la previa, permitimos repetir para evitar bucle infinito
      if (candidatas.length === 0) candidatas = historias;

      // Elegir aleatoria de las candidatas
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
      setFeedback({ texto: "¡Correcto! La historia tiene sentido", clase: 'correcta' });
      // confeti()
    } else {
      setFeedback({ texto: "Casi... Intenta ordenar las frases de otra manera", clase: 'incorrecta' });
    }
  };

  const handleDragStart = (e, frase) => {
    draggedItem.current = frase;
    setTimeout(() => { if (e.target) e.target.classList.add('dragging'); }, 0);
  };
  const handleDragEnd = (e) => {
    if (e.target && e.target.classList) e.target.classList.remove('dragging');
    draggedItem.current = null;
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
    const after = getDragAfterElement(container, e.clientY);
    let nueva = frasesDesordenadas.filter(f => f.id !== draggedItem.current.id);
    if (after == null) nueva.push(draggedItem.current);
    else {
      const afterId = after.getAttribute('data-id');
      const idx = nueva.findIndex(f => f.id === afterId);
      nueva.splice(idx, 0, draggedItem.current);
    }
    setFrasesDesordenadas(nueva);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleTouchStart = (e, frase) => {
    draggedItem.current = frase;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const clone = el.cloneNode(true);
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
    clone.style.transform = `translate(${t.clientX - parseFloat(clonestyle.left) - clone.offsetWidth / 2}px, ${t.clientY - parseFloat(clonestyle.top) - clone.offsetHeight / 2}px)`;
  };
  const handleTouchEnd = (e) => {
    if (!draggedItem.current) return;
    if (draggedCloneRef.current) {
      draggedCloneRef.current.remove();
      draggedCloneRef.current = null;
    }
    document.body.classList.remove('no-scroll');
    document.querySelectorAll('.frase.dragging').forEach(el => el.classList.remove('dragging'));
    const touch = e.changedTouches[0];
    const dropZone = dropZoneRef.current;
    if (!dropZone || !touch) { draggedItem.current = null; return; }
    const r = dropZone.getBoundingClientRect();
    if (touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom) {
      const fake = { preventDefault: () => {}, currentTarget: dropZone, clientY: touch.clientY };
      handleDrop(fake);
    }
    draggedItem.current = null;
  };

  const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);

  return {
    isTestMode, startTest, exitTestMode,
    frasesDesordenadas, feedback, historiaCorrecta,
    checkStory, cargarSiguienteHistoria,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd, dropZoneRef,
    currentStoryIndex, TOTAL_TEST_STORIES, elapsedTime,
    showResults, score, testQuestions, userAnswers,
    handleNextStory,
    fontStyle, fontStyleIndex, handleFontStyleChange
  };
};
