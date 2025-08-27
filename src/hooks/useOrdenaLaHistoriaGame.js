// src/hooks/useOrdenaLaHistoriaGame.js
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

  // Clave estable por contenido para no depender de la referencia de 'historias'
  const historiasKey = useMemo(() => {
    if (!Array.isArray(historias)) return '';
    // Historias es array de arrays de strings, JSON.stringify es suficiente y estable
    return JSON.stringify(historias);
  }, [historias]);

  const mapToUniqueItems = (frasesArray) =>
    frasesArray.map((frase, index) => ({
      id: `frase-${Date.now()}-${index}`,
      texto: fontStyle === 'uppercase' ? frase.toUpperCase() : frase
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

    setHistoriaCorrecta(prevHistoriaCorrecta => {
      // Compara contra la historia anterior para no repetir exactamente la misma
      const prevText = prevHistoriaCorrecta.map(f => f.texto.toLowerCase());
      let nuevaHistoria;
      do {
        nuevaHistoria = historias[Math.floor(Math.random() * historias.length)];
      } while (
        historias.length > 1 &&
        JSON.stringify(nuevaHistoria.map(f => f.toLowerCase())) === JSON.stringify(prevText)
      );

      const historiaMapeada = mapToUniqueItems(nuevaHistoria);
      setFrasesDesordenadas([...historiaMapeada].sort(() => Math.random() - 0.5));
      return historiaMapeada;
    });
  // Depende de la clave estable y del estilo, no de la referencia del array
  }, [historiasKey, fontStyle]);

  useEffect(() => {
    if (!isTestMode) {
      cargarSiguienteHistoria();
    }
  }, [isTestMode, fontStyle, historiasKey, cargarSiguienteHistoria]);

  const startTest = () => {
    if (!historias || historias.length === 0) return;

    // Dedup por contenido y selecciona hasta TOTAL_TEST_STORIES
    const únicas = [...new Set(historias.map(h => JSON.stringify(h)))].map(s => JSON.parse(s));
    const questions = únicas.sort(() => 0.5 - Math.random()).slice(0, TOTAL_TEST_STORIES);

    setTestQuestions(questions.map(q => mapToUniqueItems(q)));
    setCurrentStoryIndex(0);
    setUserAnswers([]);

    const primeraHistoria = questions[0] || [];
    const historiaMapeada = mapToUniqueItems(primeraHistoria);
    setHistoriaCorrecta(historiaMapeada);
    setFrasesDesordenadas([...historiaMapeada].sort(() => Math.random() - 0.5));

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
    let baseScore = correctCount * 200;
    if (withTimer && correctCount > 0) {
      const timeBonus = Math.max(0, 100 - (time / correctCount) * 2);
      baseScore += timeBonus;
    }
    return Math.floor(baseScore);
  };

  const handleNextStory = () => {
    const userAnswer = [...frasesDesordenadas];
    const currentAnswers = [...userAnswers, userAnswer];
    setUserAnswers(currentAnswers);

    if (currentStoryIndex < TOTAL_TEST_STORIES - 1 && currentStoryIndex < testQuestions.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      const nextStory = testQuestions[nextIndex];
      setHistoriaCorrecta(nextStory);
      setFrasesDesordenadas([...nextStory].sort(() => Math.random() - 0.5));
    } else {
      const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
      setElapsedTime(finalTime);
      let correctCount = 0;
      testQuestions.forEach((story, index) => {
        const userOrder = currentAnswers[index].map(f => f.texto).join();
        const correctOrder = story.map(f => f.texto).join();
        if (userOrder === correctOrder) correctCount++;
      });
      setScore(calculateScore(correctCount, finalTime));
      setShowResults(true);
    }
  };

  const exitTestMode = () => {
    setIsTestMode(false);
  };

  const checkStory = () => {
    const userOrder = frasesDesordenadas.map(f => f.texto).join();
    const correctOrder = historiaCorrecta.map(f => f.texto).join();
    if (userOrder === correctOrder) {
      setFeedback({ texto: "¡Correcto! La historia tiene sentido", clase: 'correcta' });
      // confeti()
    } else {
      setFeedback({ texto: "Casi... Intenta ordenar las frases de otra manera", clase: 'incorrecta' });
    }
  };

  const handleDragStart = (e, frase) => {
    draggedItem.current = frase;
    setTimeout(() => {
      if (e.target) e.target.classList.add('dragging');
    }, 0);
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
    const afterElement = getDragAfterElement(container, e.clientY);

    let newList = frasesDesordenadas.filter(f => f.id !== draggedItem.current.id);

    if (afterElement == null) {
      newList.push(draggedItem.current);
    } else {
      const afterId = afterElement.getAttribute('data-id');
      const insertIndex = newList.findIndex(f => f.id === afterId);
      newList.splice(insertIndex, 0, draggedItem.current);
    }
    setFrasesDesordenadas(newList);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleTouchStart = (e, frase) => {
    draggedItem.current = frase;
    const touchElement = e.currentTarget;
    const rect = touchElement.getBoundingClientRect();

    const clone = touchElement.cloneNode(true);
    clone.classList.add('frase-clone');
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    document.body.appendChild(clone);
    draggedCloneRef.current = clone;

    touchElement.classList.add('dragging');
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
      draggedCloneRef.current.remove();
      draggedCloneRef.current = null;
    }
    document.body.classList.remove('no-scroll');
    document.querySelectorAll('.frase.dragging').forEach(el => el.classList.remove('dragging'));

    const touch = e.changedTouches[0];
    const dropZone = dropZoneRef.current;
    if (!dropZone || !touch) {
      draggedItem.current = null;
      return;
    }

    const dropRect = dropZone.getBoundingClientRect();
    if (
      touch.clientX >= dropRect.left && touch.clientX <= dropRect.right &&
      touch.clientY >= dropRect.top && touch.clientY <= dropRect.bottom
    ) {
      const fakeEvent = { preventDefault: () => {}, currentTarget: dropZone, clientY: touch.clientY };
      handleDrop(fakeEvent);
    }

    draggedItem.current = null;
  };

  const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);

  return {
    isTestMode, startTest, exitTestMode,
    frasesDesordenadas, feedback,
    checkStory, cargarSiguienteHistoria,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd, dropZoneRef,
    currentStoryIndex, TOTAL_TEST_STORIES, elapsedTime,
    showResults, score, testQuestions, userAnswers,
    handleNextStory, historiaCorrecta,
    fontStyle, fontStyleIndex, handleFontStyleChange
  };
};
