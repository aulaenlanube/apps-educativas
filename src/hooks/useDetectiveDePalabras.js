// src/hooks/useDetectiveDePalabras.js
import { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti'; // IMPORTANTE: Importamos la librería

const TOTAL_TEST_QUESTIONS = 5;
const FONT_STYLES = ['default', 'cursive', 'uppercase'];

const getTexto = (frase) =>
  typeof frase === 'string'
    ? frase
    : (frase && typeof frase.solucion === 'string' ? frase.solucion : '');

export const useDetectiveDePalabras = (frasesJuego = [], withTimer = false) => {
  // Estado base
  const [indiceFraseActual, setIndiceFraseActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [feedback, setFeedback] = useState({ texto: '', clase: '' });
  // Añadimos un key para forzar la re-renderización de la animación
  const [feedbackKey, setFeedbackKey] = useState(0); 
  const [letras, setLetras] = useState([]);
  const [fraseResuelta, setFraseResuelta] = useState(false);
  
  // Referencia para saber dónde está la frase y lanzar el confetti desde ahí
  const containerRef = useRef(null);

  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);
  const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);
  const handleFontStyleChange = (e) => {
    const newIndex = parseInt(e?.target?.value ?? 0, 10);
    if (!Number.isFinite(newIndex)) return;
    const next = FONT_STYLES[newIndex] || FONT_STYLES[0];
    setFontStyle(next);
  };

  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const getTransformedSolution = useCallback(
    (solucion) => (fontStyle === 'uppercase' ? solucion.toUpperCase() : solucion),
    [fontStyle]
  );

  const prepararFrase = useCallback(
    (frase) => {
      const texto = getTexto(frase);
      if (!texto) return;
      const solucionTransformada = getTransformedSolution(texto);
      const fraseSinEspacios = solucionTransformada.replace(/ /g, '');
      const letrasIniciales = fraseSinEspacios
        .split('')
        .map((char) => ({ char, separador: false, status: '' }));
      setLetras(letrasIniciales);
      setFeedback({ texto: '', clase: '' });
      setFraseResuelta(false);
    },
    [getTransformedSolution]
  );

  useEffect(() => {
    if (!isTestMode && frasesJuego.length > 0) {
      prepararFrase(frasesJuego[indiceFraseActual]);
    }
  }, [isTestMode, indiceFraseActual, frasesJuego, prepararFrase, fontStyle]);

  const toggleSeparador = (index) => {
    if (fraseResuelta && !isTestMode) return;
    setLetras((letrasActuales) => {
      const nuevas = letrasActuales.map((l) => ({ ...l, status: '' }));
      if (nuevas[index]) nuevas[index].separador = !nuevas[index].separador;
      return nuevas;
    });
    // Limpiamos feedback al interactuar
    setFeedback({ texto: '', clase: '' });
  };

  const getUserAttempt = () =>
    letras.reduce(
      (acc, letra, idx) => acc + letra.char + (letra.separador && idx < letras.length - 1 ? ' ' : ''),
      ''
    ).trim();

  const comprobarFrase = () => {
    const actual = frasesJuego[indiceFraseActual];
    const solucionOriginal = getTexto(actual);
    const solucionTransformada = getTransformedSolution(solucionOriginal);

    const posicionesEspaciosSolucion = [];
    let acumulado = 0;
    const palabras = solucionTransformada.split(' ');
    palabras.forEach((palabra, idx) => {
      if (idx < palabras.length - 1) {
        acumulado += palabra.length;
        posicionesEspaciosSolucion.push(acumulado - 1);
      }
    });

    let aciertos = 0;
    let totalSeparadoresUsuario = 0;
    const nuevas = letras.map((letra, index) => {
      if (letra.separador) {
        totalSeparadoresUsuario++;
        if (posicionesEspaciosSolucion.includes(index)) {
          aciertos++;
          return { ...letra, status: 'correcto' };
        }
        return { ...letra, status: 'incorrecto' };
      }
      return { ...letra, status: '' };
    });
    setLetras(nuevas);

    const esTotalmenteCorrecto =
      aciertos === posicionesEspaciosSolucion.length &&
      aciertos === totalSeparadoresUsuario;

    if (esTotalmenteCorrecto) {
      setFeedback({ texto: '¡Correcto! ¡Caso resuelto!', clase: 'correcto' });
      
      // --- CONFETTI ---
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Coordenadas relativas al viewport (0 a 1)
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

      setPuntuacion((p) => p + 10);
      setFraseResuelta(true);
      // Actualizamos key también en acierto para consistencia (opcional)
      setFeedbackKey(prev => prev + 1);
    } else {
      // AQUÍ: Añadimos la clase shake y actualizamos la key para reiniciar animación
      setFeedback({ texto: '¡Casi! Revisa las marcas rojas.', clase: 'incorrecto shake' });
      setFeedbackKey(prev => prev + 1);
    }
  };

  const siguienteFrase = () => {
    setIndiceFraseActual((prev) => (prev + 1) % Math.max(1, frasesJuego.length));
  };

  const startTest = () => {
    const seleccion = [...frasesJuego].sort(() => 0.5 - Math.random()).slice(0, TOTAL_TEST_QUESTIONS);
    setTestQuestions(seleccion);
    setIndiceFraseActual(0);
    setUserAnswers([]);
    prepararFrase(seleccion[0]);
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
      timer = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(timer);
  }, [isTestMode, withTimer, showResults, startTime]);

  const calculateScore = (correctCount, time) => {
    let baseScore = correctCount * 200;
    if (withTimer && correctCount > 0) {
      const timeBonus = Math.max(0, 100 - time * 2);
      baseScore += timeBonus;
    }
    return Math.floor(baseScore);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers, getUserAttempt()];
    setUserAnswers(newAnswers);

    if (indiceFraseActual < TOTAL_TEST_QUESTIONS - 1) {
      const nextIndex = indiceFraseActual + 1;
      setIndiceFraseActual(nextIndex);
      prepararFrase(testQuestions[nextIndex]);
    } else {
      const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
      setElapsedTime(finalTime);
      let correctCount = 0;
      testQuestions.forEach((q, i) => {
        const solucion = getTransformedSolution(getTexto(q));
        if (newAnswers[i] === solucion) correctCount++;
      });
      setScore(calculateScore(correctCount, finalTime));
      setShowResults(true);
    }
  };

  const exitTestMode = () => {
    setIsTestMode(false);
    setIndiceFraseActual(0);
    if (frasesJuego.length > 0) prepararFrase(frasesJuego[0]);
  };

  return {
    letras,
    puntuacion,
    feedback,
    feedbackKey,
    fraseActual: isTestMode ? testQuestions[indiceFraseActual] : frasesJuego[indiceFraseActual],
    indiceFraseActual,
    totalFrases: isTestMode ? TOTAL_TEST_QUESTIONS : frasesJuego.length,
    fraseResuelta,
    toggleSeparador,
    comprobarFrase,
    siguienteFrase,
    isTestMode,
    startTest,
    exitTestMode,
    handleNextQuestion,
    showResults,
    score,
    elapsedTime,
    userAnswers,
    testQuestions,
    withTimer,
    fontStyle,
    fontStyleIndex,
    handleFontStyleChange,
    getTransformedSolution,
    containerRef // IMPORTANTE: Devolvemos la referencia para usarla en la UI
  };
};