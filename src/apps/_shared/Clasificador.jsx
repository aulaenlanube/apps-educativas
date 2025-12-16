import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Loader2, CheckCircle2, XCircle, Flame, Star, Trophy, RefreshCcw, ArrowRight, BookOpen, Clock, Lightbulb, SkipForward 
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

// Constantes de configuración
const TEST_QUESTION_COUNT = 10; 
const MAX_CATEGORIES = 4; // Límite de categorías por juego

// Función auxiliar para barajar
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Componente simple para simular el efecto Confetti
const ConfettiEffect = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        {[...Array(25)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ 
                    y: '100vh', 
                    x: `${Math.random() * 100}vw`, 
                    opacity: 1, 
                    scale: 0.5 + Math.random(),
                    rotate: Math.random() * 360
                }}
                animate={{ 
                    y: '0vh', 
                    opacity: [1, 0.5, 0], 
                    rotate: 720,
                    x: `calc(${Math.random() * 100}vw - 50vw)`
                }}
                transition={{ 
                    duration: 2 + Math.random() * 3, 
                    delay: Math.random() * 0.5, 
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeOut" 
                }}
                className={`absolute w-2 h-2 rounded-full shadow-lg`}
                style={{ 
                    top: `${Math.random() * 10}vh`, 
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#fde047', '#f472b6', '#818cf8', '#34d399'][i % 4] 
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
  const [gameMode, setGameMode] = useState('selection'); // 'selection' | 'practice' | 'test'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [allQuestions, setAllQuestions] = useState([]); 
  const [categories, setCategories] = useState([]); // Max 4 categorías activas
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0); // 10 puntos por acierto
  const [streak, setStreak] = useState(0);
  const [highStreak, setHighStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [correctAnswer, setCorrectAnswer] = useState(null); 
  const [skipTimeout, setSkipTimeout] = useState(null); 
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0); // Contador de aciertos reales

  // --- Selección de preguntas activas según el modo y las 4 categorías ---
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
        if (!res.ok) throw new Error(`Error ${res.status}: Archivo no encontrado`);
        return res.json();
      })
      .then(data => {
        const allCats = Object.keys(data);
        
        // 1. Seleccionar un máximo de MAX_CATEGORIES al azar
        const selectedCats = shuffleArray(allCats).slice(0, MAX_CATEGORIES);
        setCategories(selectedCats);

        // 2. Filtrar palabras para solo usar las categorías seleccionadas
        let items = [];
        selectedCats.forEach(cat => {
          if (Array.isArray(data[cat])) {
            data[cat].forEach(word => items.push({ word, category: cat }));
          }
        });

        if (items.length < MAX_CATEGORIES || items.length < TEST_QUESTION_COUNT) {
            console.warn("Pocas palabras o categorías. Usando todas las posibles.");
        }
        
        if (items.length === 0) throw new Error("JSON vacío o mal formado");
        
        setAllQuestions(items);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("No pudimos cargar la actividad. Inténtalo de nuevo.");
        setLoading(false);
      });
  }, [dataUrl]);


  // --- LÓGICA DE NAVEGACIÓN Y RESPUESTA ---

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
    if (skipTimeout) clearTimeout(skipTimeout); // Limpiar timeout anterior si existe

    const currentItem = activeQuestions[currentIndex];
    const isCorrect = currentItem.category === selectedCategory;
    
    let nextTimeout = 1200; // Tiempo de avance por defecto (acierto)

    if (isCorrect) {
      const isPractice = gameMode === 'practice';
      const streakBonus = isPractice ? 0 : Math.min(streak, 5) * 2; 
      
      setScore(s => s + 10 + streakBonus);
      setCorrectAnswersCount(c => c + 1); // Contar aciertos
      
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > highStreak) setHighStreak(newStreak);
        return newStreak;
      });
      setFeedback('correct');

    } else {
      setStreak(0); 
      setFeedback('incorrect');
      setCorrectAnswer(currentItem.category); // **Mostrar respuesta correcta en ambos modos**
      nextTimeout = 2500; // 2.5 segundos para ver la corrección
    }
    
    // Avance automático
    const timeoutId = setTimeout(handleNextWord, nextTimeout);
    setSkipTimeout(timeoutId);
  };

  // Función para el botón "Nueva Palabra" en modo Práctica
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
    // Forzar un re-shuffle y re-selección de categorías
    setAllQuestions(shuffleArray([...allQuestions])); 
  };

  const startPractice = () => {
      setGameMode('practice');
      setCurrentIndex(0);
      setFinished(false);
      setFeedback(null);
      setCorrectAnswer(null);
      setCorrectAnswersCount(0);
      setAllQuestions(shuffleArray([...allQuestions])); // Asegurar nuevo orden y categorias
  };
  
  const startTest = () => {
      setGameMode('test');
      setCurrentIndex(0);
      setFinished(false);
      setFeedback(null);
      setCorrectAnswer(null);
      setCorrectAnswersCount(0);
      setAllQuestions(shuffleArray([...allQuestions])); // Asegurar nuevo orden y categorias
  };
  
  // --- UTILS Y RENDERS ---
  const isPractice = gameMode === 'practice';
  const isTestPossible = allQuestions.length >= TEST_QUESTION_COUNT;


  // RENDERS DE ESTADO (Loading, Error)
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-indigo-500">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <p className="font-medium animate-pulse">Cargando la actividad...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto mt-10">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">¡Vaya!</h3>
      <p className="text-slate-600 mb-6">{error}</p>
      <p className="text-xs mt-4 text-slate-400">Ruta intentada: {dataUrl}</p>
      <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Recargar página</Button>
    </div>
  );

  // 0. Pantalla de Selección de Modo
  if (gameMode === 'selection') {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur rounded-3xl shadow-2xl max-w-lg mx-auto mt-8 border border-white/50"
        >
            <h2 className="text-2xl font-black text-indigo-700 mb-6 text-center">Selecciona un modo de juego</h2>
            
            <div className="flex flex-col gap-4 w-full">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                        onClick={startPractice} 
                        size="lg" 
                        className="w-full h-20 text-xl font-bold bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 gap-3"
                    >
                        <BookOpen className="h-6 w-6" />
                        Modo Práctica
                    </Button>
                    <p className="text-center text-sm text-slate-500 mt-2">
                        Aprende y repasa sin presión.
                    </p>
                </motion.div>

                <motion.div whileHover={{ scale: isTestPossible ? 1.02 : 1 }} whileTap={{ scale: isTestPossible ? 0.98 : 1 }}>
                    <Button 
                        onClick={startTest} 
                        disabled={!isTestPossible}
                        size="lg" 
                        className={`w-full h-20 text-xl font-bold gap-3
                            ${isTestPossible 
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'}
                        `}
                    >
                        <Clock className="h-6 w-6" />
                        Modo Test ({TEST_QUESTION_COUNT} Preguntas)
                    </Button>
                    {!isTestPossible && (
                        <p className="text-center text-sm text-red-500 mt-2">
                            Necesitas al menos {TEST_QUESTION_COUNT} palabras para el modo Test. Hay {allQuestions.length} disponibles de {categories.length} categorías.
                        </p>
                    )}
                    {isTestPossible && (
                        <p className="text-center text-sm text-slate-500 mt-2">
                            Ponte a prueba con {TEST_QUESTION_COUNT} preguntas aleatorias.
                        </p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
  }

  // 1. Pantalla Final (Finished)
  if (finished) {
    const isPerfectScore = gameMode === 'test' && correctAnswersCount === TEST_QUESTION_COUNT;
    const maxPossibleScore = totalQuestions * 10;
    const percentage = (score / maxPossibleScore) * 100;
    
    let stars = 0;
    if (percentage >= 50) stars = 1;
    if (percentage >= 70) stars = 2;
    if (percentage >= 90) stars = 3;

    const title = isPerfectScore ? '¡10/10! ¡PERFECTO!' : (gameMode === 'test' ? 'Test Completado' : 'Fin de la Práctica');
    const subTitle = gameMode === 'test' 
        ? `Has acertado ${correctAnswersCount}/${totalQuestions} preguntas.` 
        : `Has revisado ${totalQuestions} palabras.`;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur rounded-3xl shadow-2xl max-w-md mx-auto mt-8 border border-white/50 relative overflow-hidden"
      >
        {/* Confetti - visible solo con 10/10 */}
        {isPerfectScore && <ConfettiEffect />}

        <div className="relative mb-6">
          <Trophy className="h-24 w-24 text-yellow-400 drop-shadow-md" />
        </div>
        
        <h2 className={`text-3xl font-black mb-1 text-center ${isPerfectScore ? 'text-orange-500' : 'text-slate-800'}`}>{title}</h2>
        <p className="text-lg text-slate-600 mb-4 text-center">{subTitle}</p>
        
        {/* Estrellas */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 10, rotate: -30 }}
              animate={{ opacity: gameMode === 'test' && s <= stars ? 1 : (gameMode === 'practice' ? 1 : 0.3), y: 0, rotate: 0 }}
              transition={{ delay: s * 0.2, type: "spring", stiffness: 300 }}
            >
              <Star className={`h-10 w-10 ${gameMode === 'test' && s <= stars ? 'fill-yellow-400 text-yellow-400' : (gameMode === 'practice' ? 'fill-green-300 text-green-300' : 'text-slate-300')}`} />
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-50 px-8 py-6 rounded-2xl w-full flex justify-between items-center mb-8 border border-slate-100">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Aciertos</span>
            <span className="text-4xl font-black text-green-600">{correctAnswersCount}</span>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Puntos Totales</span>
            <span className="text-4xl font-black text-indigo-600">{score}</span>
          </div>
        </div>
        
        <Button onClick={restart} size="lg" className="w-full text-lg font-bold bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 gap-2">
          <RefreshCcw className="h-5 w-5" /> Elegir otro modo
        </Button>
      </motion.div>
    );
  }


  // 2. Pantalla de Juego Activo
  const currentItem = activeQuestions[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;


  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 flex flex-col gap-4">
      
      {/* HEADER DE NAVEGACIÓN Y PUNTUACIÓN */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-100">
        
        {isPractice ? (
            // Controles Modo Práctica (Botones persistentes)
            <div className="flex gap-2">
                <Button onClick={restart} variant="outline" size="sm" className="gap-1 text-xs">
                    <BookOpen className="h-4 w-4" /> Elegir Modo
                </Button>
                <Button onClick={skipWord} variant="secondary" size="sm" className="gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600" disabled={feedback !== null}>
                    <SkipForward className="h-4 w-4" /> Otra palabra
                </Button>
            </div>
        ) : (
            // Controles Modo Test (Progreso y Puntos)
            <div className="flex items-center gap-4 w-full">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Test</span>
                    <div className="flex items-center text-sm font-bold text-slate-800">
                        <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                        {currentIndex + 1} / {totalQuestions}
                    </div>
                </div>
                
                <div className="flex flex-col items-center flex-1">
                  {streak > 1 && (
                     <motion.div 
                       key={streak}
                       initial={{ scale: 0 }} animate={{ scale: 1 }}
                       className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold text-sm border border-orange-200"
                     >
                       <Flame className="h-4 w-4 fill-orange-500" />
                       <span>Racha x{Math.min(streak, 5)}</span>
                     </motion.div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase">Puntos</span>
                    <motion.span 
                      key={score}
                      initial={{ scale: 1.2, color: '#4f46e5' }}
                      animate={{ scale: 1, color: '#4338ca' }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="text-2xl font-black text-indigo-700"
                    >
                      {score}
                    </motion.span>
                </div>
            </div>
        )}
      </div>
      
      {/* Barra de Progreso (Solo en modo Test) */}
      {!isPractice && (
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <motion.div 
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Zona de Juego Principal */}
      <div className="relative min-h-[250px] sm:min-h-[320px] flex flex-col justify-center">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentItem?.word} 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, y: 0, scale: 1,
              x: feedback === 'incorrect' ? [0, -15, 15, -10, 10, 0] : 0 
            }}
            exit={{ opacity: 0, x: -100, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
              absolute top-0 left-0 w-full flex flex-col items-center justify-center 
              h-64 sm:h-80 rounded-[2rem] shadow-xl border-b-8 
              transition-colors duration-300 z-10
              ${feedback === 'correct' ? 'bg-green-100 border-b-green-500' : 
                feedback === 'incorrect' ? 'bg-red-50 border-b-red-400' : 
                'bg-white border-b-indigo-200'}
            `}
          >
            {/* Icono de Feedback Flotante */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1.5, rotate: 360 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-6 bg-green-500 p-3 rounded-full shadow-lg z-20"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
              )}
              {feedback === 'incorrect' && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1.2, rotate: -10 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-6 bg-red-500 p-3 rounded-full shadow-lg z-20"
                >
                  <XCircle className="h-10 w-10 text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clasifica la palabra</span>
            <h1 className={`text-5xl sm:text-7xl font-black text-center px-4 drop-shadow-sm 
              ${feedback === 'correct' ? 'text-green-700' : 
                feedback === 'incorrect' ? 'text-red-700' : 'text-slate-800'}
            `}>
              {currentItem?.word}
            </h1>
            
            {/* Mostrar respuesta correcta al fallar (AHORA EN AMBOS MODOS) */}
            {feedback === 'incorrect' && correctAnswer && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-0 right-0 text-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg m-4 shadow-inner border border-slate-100"
                >
                    <div className="flex items-center justify-center text-sm font-bold text-green-600">
                        <Lightbulb className="h-4 w-4 mr-2" /> La correcta era: 
                        <span className="ml-1 capitalize">{correctAnswer.replace(/_/g, " ")}</span>
                    </div>
                </motion.div>
            )}
            
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botones de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Button
              onClick={() => handleAnswer(cat)}
              disabled={feedback !== null}
              className={`
                w-full h-16 sm:h-20 text-lg sm:text-xl capitalize font-bold tracking-wide
                border-b-4 rounded-xl transition-all active:border-b-0 active:translate-y-1
                ${feedback === null 
                  ? 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 shadow-md hover:shadow-lg' 
                  : 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'}
              `}
              variant="ghost"
            >
              {cat.replace(/_/g, " ")}
              {feedback === null && <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Button>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
};

export default Clasificador;