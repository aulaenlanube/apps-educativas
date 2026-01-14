import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Loader2, CheckCircle2, XCircle, Flame, Star, Trophy, RefreshCcw, ArrowRight, BookOpen, Clock, Lightbulb, SkipForward, Sparkles, LogOut, X, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Constantes de configuración
const TEST_QUESTION_COUNT = 10;
const MAX_CATEGORIES = 4;

// --- TEMAS ACTUALIZADOS (Hover Oscuro) ---
const BUTTON_THEMES = [
  {
    id: 'violet',
    color: 'text-violet-600',
    bg: 'bg-white',
    border: 'border-violet-200',
    hover: 'hover:bg-violet-700 hover:border-violet-700 hover:shadow-violet-500/30',
    active: 'active:bg-violet-800'
  },
  {
    id: 'pink',
    color: 'text-pink-600',
    bg: 'bg-white',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-600 hover:border-pink-600 hover:shadow-pink-500/30',
    active: 'active:bg-pink-800'
  },
  {
    id: 'sky',
    color: 'text-sky-600',
    bg: 'bg-white',
    border: 'border-sky-200',
    hover: 'hover:bg-sky-600 hover:border-sky-600 hover:shadow-sky-500/30',
    active: 'active:bg-sky-800'
  },
  {
    id: 'orange',
    color: 'text-orange-600',
    bg: 'bg-white',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-600 hover:border-orange-600 hover:shadow-orange-500/30',
    active: 'active:bg-orange-800'
  }
];

// Función auxiliar para barajar
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Componente Confetti
const ConfettiEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 1, scale: 0 }}
        animate={{
          y: '-10vh',
          opacity: [0, 1, 1, 0],
          rotate: 720,
          scale: [0, 1, 0.5],
          x: `calc(${Math.random() * 100}vw - 50vw)`
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          delay: i * 0.1,
          ease: "easeOut"
        }}
        className="absolute w-3 h-3 rounded-md shadow-sm"
        style={{
          backgroundColor: ['#fde047', '#f472b6', '#818cf8', '#34d399', '#fb923c'][i % 5]
        }}
      />
    ))}
  </div>
);

const Clasificador = () => {
  const { level, grade, subjectId } = useParams();
  const jsonName = subjectId ? `${subjectId}-runner` : 'general-runner';
  const dataUrl = `/data/${level}/${grade}/${jsonName}.json`;

  // --- ESTADOS ---
  const [gameMode, setGameMode] = useState('selection');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allQuestions, setAllQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rawGameData, setRawGameData] = useState(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highStreak, setHighStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [skipTimeout, setSkipTimeout] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // --- Selección de preguntas ---
  const activeQuestions = useMemo(() => {
    if (gameMode === 'selection' || allQuestions.length === 0) return [];

    let shuffled = shuffleArray(allQuestions);

    if (gameMode === 'test' && shuffled.length > TEST_QUESTION_COUNT) {
      return shuffled.slice(0, TEST_QUESTION_COUNT);
    }
    return shuffled;
  }, [gameMode, allQuestions]);

  const totalQuestions = activeQuestions.length;

  // --- CARGA DE DATOS ---
  useEffect(() => {
    setLoading(true);
    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRawGameData(data);
        const allCats = Object.keys(data).filter(k => k !== 'title' && k !== 'instructions');
        const selectedCats = shuffleArray(allCats).slice(0, MAX_CATEGORIES);
        setCategories(selectedCats);

        let items = [];
        selectedCats.forEach(cat => {
          if (Array.isArray(data[cat])) {
            data[cat].forEach(word => items.push({ word, category: cat }));
          }
        });

        if (items.length < MAX_CATEGORIES || items.length === 0) {
          throw new Error("Datos insuficientes");
        }

        setAllQuestions(items);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error al cargar la actividad.");
        setLoading(false);
      });
  }, [dataUrl]);

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleNextWord = useCallback(() => {
    if (skipTimeout) clearTimeout(skipTimeout);
    setFeedback(null);
    setCorrectAnswer(null);

    const nextIndex = currentIndex + 1;
    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
    } else {
      setFinished(true);
    }
    setSkipTimeout(null);
  }, [currentIndex, totalQuestions, skipTimeout]);

  const handleAnswer = (selectedCategory) => {
    if (finished || feedback) return;
    if (skipTimeout) clearTimeout(skipTimeout);

    const currentItem = activeQuestions[currentIndex];
    const isCorrect = currentItem.category === selectedCategory;

    let nextTimeout = 1200;

    if (isCorrect) {
      const isPractice = gameMode === 'practice';
      const streakBonus = isPractice ? 0 : Math.min(streak, 5) * 2;

      setScore(s => s + 10 + streakBonus);
      setCorrectAnswersCount(c => c + 1);

      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > highStreak) setHighStreak(newStreak);
        return newStreak;
      });
      setFeedback('correct');

    } else {
      setStreak(0);
      setFeedback('incorrect');
      setCorrectAnswer(currentItem.category);
      nextTimeout = 2500;
    }

    const timeoutId = setTimeout(handleNextWord, nextTimeout);
    setSkipTimeout(timeoutId);
  };

  const skipWord = () => {
    setStreak(0);
    handleNextWord();
  };

  const restart = () => {
    if (skipTimeout) clearTimeout(skipTimeout);
    setScore(0);
    setStreak(0);
    setHighStreak(0);
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
    setCorrectAnswer(null);
    setCorrectAnswersCount(0);
    setGameMode('selection');
    setAllQuestions(shuffleArray([...allQuestions]));
  };

  const startPractice = () => {
    setGameMode('practice');
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
    setCorrectAnswer(null);
    setCorrectAnswersCount(0);
    setAllQuestions(shuffleArray([...allQuestions]));
  };

  const startTest = () => {
    setGameMode('test');
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
    setCorrectAnswer(null);
    setCorrectAnswersCount(0);
    setAllQuestions(shuffleArray([...allQuestions]));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
      <Loader2 className="h-16 w-16 animate-spin mb-4 opacity-80" />
      <p className="font-bold text-lg animate-pulse">Preparando materiales...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto mt-10 bg-white/90 rounded-3xl shadow-xl">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <XCircle className="h-12 w-12 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Algo salió mal</h3>
      <p className="text-slate-600 mb-6">{error}</p>
      <Button onClick={() => window.location.reload()} variant="default">Reintentar</Button>
    </div>
  );

  const currentItem = activeQuestions[currentIndex];
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const isPractice = gameMode === 'practice';
  const isTestPossible = allQuestions.length >= TEST_QUESTION_COUNT;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 relative">

      {/* ---------------------------------------------------------
          PANTALLA DE SELECCIÓN DE MODO
      --------------------------------------------------------- */}
      {gameMode === 'selection' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-lg mx-auto mt-8 border border-white/50"
        >
          <div className="bg-indigo-600 p-4 rounded-2xl mb-6 shadow-lg rotate-3">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 text-center tracking-tight">¡A JUGAR!</h2>
          <p className="text-slate-600 mb-8 text-center">Selecciona cómo quieres practicar hoy.</p>

          <div className="grid grid-cols-1 gap-4 w-full">
            <Button
              variant="outline"
              onClick={() => setShowCheatSheet(true)}
              className="w-full h-12 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 rounded-xl gap-2 font-bold transition-all"
            >
              <BookOpen className="h-5 w-5" />
              Guía de Categorías
            </Button>

            <div className="h-px bg-slate-200 w-full my-1"></div>

            <motion.button
              whileHover={{ scale: 1.03, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={startPractice}
              className="relative group overflow-hidden bg-white hover:bg-gradient-to-br hover:from-emerald-400 hover:to-teal-500 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-emerald-100 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 group-hover:bg-white/20 p-3 rounded-xl transition-colors">
                  <BookOpen className="h-8 w-8 text-emerald-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-white">Modo Práctica</h3>
                  <p className="text-sm text-slate-500 group-hover:text-emerald-50">Sin tiempo, sin presión.</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: isTestPossible ? 1.03 : 1, translateY: isTestPossible ? -2 : 0 }}
              whileTap={{ scale: isTestPossible ? 0.98 : 1 }}
              onClick={startTest}
              disabled={!isTestPossible}
              className={`relative group overflow-hidden p-6 rounded-2xl shadow-md transition-all duration-300 border-2 text-left
                        ${isTestPossible
                  ? 'bg-white hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 border-indigo-100 hover:shadow-xl cursor-pointer'
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'}
                    `}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${isTestPossible ? 'bg-indigo-100 group-hover:bg-white/20' : 'bg-slate-200'}`}>
                  <Clock className={`h-8 w-8 ${isTestPossible ? 'text-indigo-600 group-hover:text-white' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isTestPossible ? 'text-slate-800 group-hover:text-white' : 'text-slate-400'}`}>Modo Examen</h3>
                  <p className={`text-sm ${isTestPossible ? 'text-slate-500 group-hover:text-indigo-50' : 'text-slate-400'}`}>
                    {isTestPossible ? `${TEST_QUESTION_COUNT} preguntas aleatorias.` : `Necesitas ${TEST_QUESTION_COUNT} preguntas.`}
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          PANTALLA FINAL (RESULTADOS)
      --------------------------------------------------------- */}
      {finished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl max-w-md mx-auto mt-8 border border-white/60 relative overflow-hidden"
        >
          {((gameMode === 'test' && correctAnswersCount === TEST_QUESTION_COUNT) || (score / (totalQuestions * 10) >= 0.9)) && <ConfettiEffect />}

          <div className="relative mb-6">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", duration: 1.5 }}
            >
              <Trophy className="h-32 w-32 text-yellow-400 drop-shadow-lg" fill="currentColor" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-black mb-1 text-center text-slate-800 tracking-tight">
            {gameMode === 'test' && correctAnswersCount === TEST_QUESTION_COUNT ? '¡PERFECTO!' : '¡Buen trabajo!'}
          </h2>

          <div className="grid grid-cols-2 gap-4 w-full mb-8 mt-6">
            <div className="bg-indigo-50 p-4 rounded-2xl flex flex-col items-center border border-indigo-100">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Aciertos</span>
              <span className="text-3xl font-black text-indigo-700">{correctAnswersCount}<span className="text-lg text-indigo-300">/{totalQuestions}</span></span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl flex flex-col items-center border border-emerald-100">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Puntos</span>
              <span className="text-3xl font-black text-emerald-700">{score}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button onClick={restart} className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl rounded-xl gap-2 transition-all">
              <RefreshCcw className="h-5 w-5" /> Jugar de nuevo
            </Button>
            <Button onClick={() => setGameMode('selection')} variant="outline" className="w-full h-12 text-slate-600 border-slate-200 rounded-xl gap-2">
              <Home className="h-4 w-4" /> Cambiar modo / Inicio
            </Button>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------
          PANTALLA DE JUEGO ACTIVO
      --------------------------------------------------------- */}
      {(!finished && gameMode !== 'selection') && (
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-white/50">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setGameMode('selection')}
                variant="ghost"
                size="sm"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                title="Cambiar modo"
              >
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Modo</span>
              </Button>

              {isPractice ? (
                <>
                  <Button
                    onClick={skipWord}
                    disabled={feedback !== null}
                    variant="ghost"
                    size="sm"
                    className="bg-white hover:bg-slate-800 text-slate-600 hover:text-white border border-slate-200 transition-all duration-200"
                    title="Otra palabra"
                  >
                    <SkipForward className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Saltar</span>
                  </Button>

                  <Button
                    onClick={startTest}
                    disabled={!isTestPossible}
                    variant="ghost"
                    size="sm"
                    className={`border ${!isTestPossible ? 'opacity-50' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'}`}
                    title="Modo Examen"
                  >
                    <Clock className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Examen</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={startTest}
                    variant="ghost"
                    size="sm"
                    className="bg-white/50 hover:bg-white text-slate-600 border border-slate-200"
                    title="Reiniciar Examen"
                  >
                    <RefreshCcw className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Reiniciar</span>
                  </Button>

                  <Button
                    onClick={startPractice}
                    variant="ghost"
                    size="sm"
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
                    title="Volver a Práctica"
                  >
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Práctica</span>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {streak > 1 && (
                <motion.div
                  key={streak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg shadow-orange-200"
                >
                  <Flame className="h-3 w-3 fill-white" />
                  <span>x{Math.min(streak, 5)}</span>
                </motion.div>
              )}

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isPractice ? 'Práctica' : `Pregunta ${currentIndex + 1}/${totalQuestions}`}
                  </div>
                  <motion.div
                    key={score}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-black text-indigo-600 leading-none"
                  >
                    {score} pts
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {!isPractice && (
            <div className="h-3 w-full bg-white/30 rounded-full overflow-hidden shadow-inner backdrop-blur-sm -mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
          )}

          <div className="relative min-h-[300px] flex flex-col justify-center perspective-1000">
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentItem?.word}
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{
                  opacity: 1, rotateX: 0,
                  x: feedback === 'incorrect' ? [0, -20, 20, -10, 10, 0] : 0
                }}
                exit={{ opacity: 0, rotateX: -90 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`
                  relative w-full flex flex-col items-center justify-center 
                  h-72 sm:h-80 rounded-[3rem] shadow-2xl border-[6px] 
                  transition-colors duration-500 z-10 bg-white
                  ${feedback === 'correct' ? 'border-green-400 shadow-green-200' :
                    feedback === 'incorrect' ? 'border-red-400 shadow-red-200' :
                      'border-white/50 shadow-indigo-100'}
                `}
              >
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0 }}
                      className={`absolute -top-6 p-4 rounded-full shadow-xl border-4 border-white z-20 
                        ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                      {feedback === 'correct' ? <CheckCircle2 className="h-10 w-10 text-white" /> : <XCircle className="h-10 w-10 text-white" />}
                    </motion.div>
                  )}
                </AnimatePresence>

                <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6 select-none">
                  ¿A QUÉ CATEGORÍA PERTENECE?
                </span>

                <h1 className={`text-5xl sm:text-7xl font-black text-center px-6 transition-colors duration-300
                  ${feedback === 'correct' ? 'text-green-600' :
                    feedback === 'incorrect' ? 'text-red-500 line-through decoration-4 decoration-red-300' :
                      'text-slate-800'}
                `}>
                  {currentItem?.word}
                </h1>

                <AnimatePresence>
                  {feedback === 'incorrect' && correctAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-6 bg-slate-100/80 backdrop-blur px-5 py-2 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center text-sm font-bold text-slate-600">
                        <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                        Correcta: <span className="ml-1 text-slate-900 uppercase">{correctAnswer.replace(/_/g, " ")}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {categories.map((cat, idx) => {
              const theme = BUTTON_THEMES[idx % BUTTON_THEMES.length];
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(cat)}
                    disabled={feedback !== null}
                    className={`
                    w-full h-20 sm:h-24 text-lg sm:text-2xl capitalize font-bold tracking-tight
                    rounded-2xl border-2 shadow-sm transition-all duration-200 group relative overflow-hidden
                    ${feedback === null
                        ? `${theme.bg} ${theme.color} ${theme.border} ${theme.hover} ${theme.active}`
                        : 'opacity-50 grayscale cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'}
                  `}
                    variant="ghost"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500">
                      <Sparkles className="h-16 w-16 text-white" />
                    </div>
                    <span className="relative z-10 flex items-center justify-center w-full group-hover:text-white transition-colors duration-200">
                      {cat.replace(/_/g, " ")}
                      {feedback === null && (
                        <ArrowRight className="ml-3 h-6 w-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white" />
                      )}
                    </span>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL GUÍA DE CATEGORÍAS (CHEAT SHEET)
      --------------------------------------------------------- */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/50"
            >
              <div className="p-6 sm:p-8 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Guía de Repaso</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Estudia las categorías antes de empezar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheatSheet(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rawGameData && Object.entries(rawGameData)
                    .filter(([key]) => key !== 'title' && key !== 'instructions')
                    .map(([category, words], idx) => (
                      <div key={category} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 transition-colors group">
                        <h3 className="font-black text-xs text-indigo-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                          {category.replace(/_/g, ' ')}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(words) && words.map((word, wIdx) => (
                            <span key={wIdx} className="px-2 py-0.5 bg-white text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200/60 shadow-sm">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100">
                <Button
                  onClick={() => setShowCheatSheet(false)}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  ¡Entendido! Vamos allá
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Clasificador;