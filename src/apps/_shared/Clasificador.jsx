import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Función auxiliar para barajar (incluida aquí para no depender de externos)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Clasificador = () => {
  // 1. OBTENER DATOS DE LA URL AUTOMÁTICAMENTE
  const { level, grade, subjectId } = useParams();
  
  // 2. CONSTRUIR LA RUTA DEL JSON
  // Si estamos en una asignatura (ESO), usa: "lengua-runner.json"
  // Si no hay asignatura (Primaria), usa: "general-runner.json" (o el nombre por defecto que prefieras)
  const jsonName = subjectId ? `${subjectId}-runner` : 'general-runner';
  const dataUrl = `/data/${level}/${grade}/${jsonName}.json`;

  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

  // --- CARGA DE DATOS ---
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error(`No se encontró el archivo: ${jsonName}.json en ${dataUrl}`);
        return res.json();
      })
      .then(data => {
        const cats = Object.keys(data);
        setCategories(cats);

        // Aplanar el JSON: { word: "perro", category: "animales" }
        let allItems = [];
        cats.forEach(cat => {
          if (Array.isArray(data[cat])) {
            data[cat].forEach(word => allItems.push({ word, category: cat }));
          }
        });

        if (allItems.length === 0) throw new Error("El archivo JSON está vacío o mal formado");

        setQuestions(shuffleArray(allItems));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando app:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [dataUrl, jsonName]);

  // --- LÓGICA DEL JUEGO ---
  const handleAnswer = (selectedCategory) => {
    if (finished || feedback) return;

    const currentItem = questions[currentIndex];
    const isCorrect = currentItem.category === selectedCategory;

    if (isCorrect) {
      setScore(s => s + 10);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    // Esperar 1 segundo antes de pasar a la siguiente
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  const restart = () => {
    setQuestions(shuffleArray([...questions]));
    setScore(0);
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
  };

  // --- RENDERIZADO ---
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500">
      <Loader2 className="h-10 w-10 animate-spin mb-4" />
      <p>Cargando datos...</p>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-8 bg-red-50 rounded-xl border border-red-100">
      <p className="font-bold text-lg mb-2">Ups, algo salió mal</p>
      <p>{error}</p>
      <p className="text-xs mt-4 text-slate-400">Ruta intentada: {dataUrl}</p>
    </div>
  );

  if (finished) return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-green-600 mb-2">¡Completado!</h2>
      <div className="bg-indigo-50 px-8 py-4 rounded-2xl mb-8 mt-4 flex flex-col items-center w-full">
        <span className="text-sm uppercase tracking-wider text-indigo-400 font-bold">Puntuación</span>
        <span className="text-5xl font-black text-indigo-600">{score}</span>
      </div>
      <Button onClick={restart} size="lg" className="w-full text-lg">Volver a jugar</Button>
    </div>
  );

  const currentItem = questions[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Barra superior */}
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50">
        <div className="text-sm font-bold text-slate-500">
          PROGRESO: <span className="text-slate-800">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-1 rounded-full font-bold shadow-md min-w-[80px] text-center">
          {score} pts
        </div>
      </div>

      {/* Tarjeta de Palabra */}
      <div className={`
        relative flex items-center justify-center h-48 sm:h-64 rounded-3xl shadow-xl border-4 text-4xl sm:text-6xl font-black transition-all duration-300
        ${feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700 scale-105' : 
          feedback === 'incorrect' ? 'bg-red-100 border-red-500 text-red-700 shake' : 
          'bg-white border-white text-slate-800'}
      `}>
        <span className="drop-shadow-sm text-center px-4 pb-2 z-10">{currentItem?.word}</span>
        {feedback === 'correct' && <CheckCircle2 className="absolute top-4 right-4 h-8 w-8 text-green-600 animate-bounce" />}
        {feedback === 'incorrect' && <XCircle className="absolute top-4 right-4 h-8 w-8 text-red-600 animate-pulse" />}
      </div>

      {/* Botones de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => handleAnswer(cat)}
            disabled={feedback !== null}
            className={`
              h-20 text-xl capitalize transition-all border-b-4 rounded-xl active:border-b-0 active:translate-y-1
              ${feedback === null 
                ? 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-md' 
                : 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'}
            `}
            variant="ghost"
          >
            {cat.replace(/_/g, " ")}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Clasificador;