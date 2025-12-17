import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Configuración del tablero
const GRID_SIZE = 20;
const SPEED_INITIAL = 300;
const SPEED_MIN = 150;

const SnakeDePalabras = (props) => {
  const { toast } = useToast();
  
  // Obtenemos parámetros de la URL o de las props (prioridad a las props si se pasan desde el padre)
  const params = useParams();
  const level = props.level || params.level;
  const grade = props.grade || params.grade;
  const subjectId = props.subjectId || params.subjectId;
  
  // Estados del juego
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [food, setFood] = useState([]); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Estados de datos
  const [data, setData] = useState(null);       // El objeto JSON completo
  const [categories, setCategories] = useState([]); // Las claves: ["monosilabas", "bisilabas"...]
  const [currentCatIndex, setCurrentCatIndex] = useState(0); // Índice de la categoría actual
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false); // Nuevo estado para errores

  // Referencias
  const savedCallback = useRef();
  const gameBoardRef = useRef(null);

  // Helper para formatear nombres (ej: "nombres_propios" -> "Nombres Propios")
  const formatName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // 1. Cargar Datos (Dinámico)
  useEffect(() => {
    // Esperamos a tener todos los datos necesarios
    if (!level || !grade || !subjectId) return;

    setLoading(true);
    const dataPath = `/data/${level}/${grade}/${subjectId}-runner.json`;

    fetch(dataPath)
      .then(res => {
        if (!res.ok) throw new Error("Archivo no encontrado");
        return res.json();
      })
      .then(jsonData => {
        setData(jsonData);
        // Extraemos las claves del objeto para saber qué categorías existen
        const newCategories = Object.keys(jsonData);
        setCategories(newCategories);
        setCurrentCatIndex(0); // Reiniciamos la categoría al cargar nuevos datos
        setLoadingError(false);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando runner data:", err);
        setLoadingError(true);
        setLoading(false);
        toast({
            variant: "destructive",
            title: "Error de carga",
            description: "No se pudieron cargar los datos del juego para esta asignatura.",
        });
      });
  }, [level, grade, subjectId, toast]);

  // 2. Generar Comida/Palabras
  const generateFoodItem = useCallback((currentSnake, currentFood, catIndex) => {
    if (!data || categories.length === 0) return null;
    
    let newItem;
    let isColliding;
    
    // Categoría objetivo actual (ej: "monosilabas")
    const targetKey = categories[catIndex];
    // Otras categorías para sacar palabras trampa
    const otherKeys = categories.filter((_, i) => i !== catIndex);
    
    const rand = Math.random();
    let type = 'valid';
    let wordText = '';

    // LÓGICA DE GENERACIÓN
    if (rand > 0.9) {
      type = 'bonus'; // Estrella para cambiar de nivel/tema
    } else if (rand > 0.6) {
      type = 'invalid';
      // Coger una categoría aleatoria que NO sea la actual
      if (otherKeys.length > 0) {
        const randomKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];
        const wordsList = data[randomKey];
        wordText = wordsList[Math.floor(Math.random() * wordsList.length)];
      } else {
        wordText = "X";
      }
    } else {
      type = 'valid';
      // Palabra de la categoría actual
      const wordsList = data[targetKey];
      wordText = wordsList[Math.floor(Math.random() * wordsList.length)];
    }

    // Buscar posición libre
    let attempts = 0;
    do {
      isColliding = false;
      newItem = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type,
        word: wordText,
        id: Date.now() + Math.random()
      };

      for (let segment of currentSnake) {
        if (segment.x === newItem.x && segment.y === newItem.y) isColliding = true;
      }
      for (let f of currentFood) {
        if (f.x === newItem.x && f.y === newItem.y) isColliding = true;
      }
      attempts++;
    } while (isColliding && attempts < 50);

    return isColliding ? null : newItem;
  }, [data, categories]);

  // Mantener items en pantalla
  useEffect(() => {
    if (!isPlaying || !data || gameOver) return;
    
    if (food.length < 3) {
      const newItem = generateFoodItem(snake, food, currentCatIndex);
      if (newItem) setFood(prev => [...prev, newItem]);
    }
  }, [food.length, isPlaying, data, gameOver, snake, currentCatIndex, generateFoodItem]);

  // 3. Loop del Juego
  useEffect(() => {
    savedCallback.current = () => {
      if (!isPlaying || gameOver) return;

      setSnake(prevSnake => {
        const newHead = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };

        // Paredes
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          endGame();
          return prevSnake;
        }

        // Choque consigo misma
        for (let segment of prevSnake) {
          if (newHead.x === segment.x && newHead.y === segment.y) {
            endGame();
            return prevSnake;
          }
        }

        const newSnake = [newHead, ...prevSnake];
        
        // Comer
        const eatenFoodIndex = food.findIndex(f => f.x === newHead.x && f.y === newHead.y);
        
        if (eatenFoodIndex !== -1) {
          const eatenItem = food[eatenFoodIndex];
          handleEat(eatenItem);
          const newFoodList = [...food];
          newFoodList.splice(eatenFoodIndex, 1);
          setFood(newFoodList);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };
  }, [isPlaying, gameOver, direction, food]);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const tickTime = Math.max(SPEED_MIN, SPEED_INITIAL - (score * 5));
    const id = setInterval(() => savedCallback.current(), tickTime);
    return () => clearInterval(id);
  }, [isPlaying, score]);

  // 4. Manejar Comer
  const handleEat = (item) => {
    const currentCatName = formatName(categories[currentCatIndex]);

    if (item.type === 'bonus') {
      // Cambiar categoría
      const nextIndex = (currentCatIndex + 1) % categories.length;
      setCurrentCatIndex(nextIndex);
      setScore(s => s + 5);
      
      const nextName = formatName(categories[nextIndex]);
      
      toast({
        title: "¡Cambio de Regla!",
        description: `Ahora busca: ${nextName}`,
        className: "bg-blue-600 text-white border-none"
      });
      setFood([]); // Limpiar tablero para nuevas palabras
    } else if (item.type === 'valid') {
      setScore(s => s + 10);
    } else {
      // Palabra incorrecta
      setScore(s => Math.max(0, s - 5));
      toast({
        variant: "destructive",
        title: "¡Error!",
        description: `"${item.word}" no es ${currentCatName}`,
        duration: 1000,
      });
    }
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    toast({
      title: "Fin del juego",
      description: `Puntuación final: ${score}`,
    });
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setFood([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    setCurrentCatIndex(0);
  };

  const startGame = () => {
    if (gameOver) resetGame();
    setDirection({ x: 1, y: 0 });
    setIsPlaying(true);
  };

  // Controles Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, direction]);

  const changeDir = (x, y) => {
    if ((x !== 0 && direction.x !== 0) || (y !== 0 && direction.y !== 0)) return;
    setDirection({ x, y });
  };

  if (loading) return <div className="p-10 text-center">Cargando juego...</div>;
  if (loadingError) return <div className="p-10 text-center text-red-500">Error cargando los datos. Comprueba la URL o el archivo JSON.</div>;

  const currentCategoryName = categories.length > 0 ? formatName(categories[currentCatIndex]) : '';

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 gap-4">
      
      {/* Header Info */}
      <Card className="w-full p-4 flex justify-between items-center bg-white shadow-sm border-2 border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Snake de Palabras</h2>
          <p className="text-sm text-slate-500">
            Busca: <span className="font-bold text-blue-600 text-lg uppercase">{currentCategoryName}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-green-600 font-mono">{score}</p>
        </div>
      </Card>

      {/* Tablero */}
      <div 
        className="relative bg-slate-50 border-4 border-slate-300 rounded-xl overflow-hidden shadow-lg"
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          aspectRatio: '1/1',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
        ref={gameBoardRef}
      >
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white p-6 text-center">
             <div className="bg-white/10 p-6 rounded-2xl mb-4">
                <p className="text-lg font-medium mb-2">Instrucciones:</p>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>🟢 Come palabras de: <b>{currentCategoryName}</b></li>
                  <li>❌ Evita palabras de otros grupos</li>
                  <li>⭐ Coge la estrella para cambiar de tema</li>
                </ul>
             </div>
             <Button size="lg" onClick={startGame} className="gap-2 text-xl px-8 py-6 bg-green-600 hover:bg-green-700 border-none">
                <Play fill="currentColor" /> Jugar
             </Button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-600/90 text-white backdrop-blur-md">
             <h2 className="text-5xl font-black mb-2 tracking-tighter">GAME OVER</h2>
             <p className="mb-8 text-2xl font-mono">Puntos: {score}</p>
             <Button variant="secondary" size="lg" onClick={resetGame} className="gap-2 px-8">
                <RefreshCcw /> Intentar de nuevo
             </Button>
          </div>
        )}

        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`rounded-sm transition-all duration-100 ${i === 0 ? 'bg-green-600 z-20 rounded-md scale-110' : 'bg-green-400 z-10'}`}
            style={{ 
              gridColumnStart: segment.x + 1, 
              gridRowStart: segment.y + 1,
            }}
          >
            {i === 0 && (
                <div className="w-full h-full flex items-center justify-center gap-[2px]">
                    <div className="bg-white w-1.5 h-1.5 rounded-full shadow-sm"></div>
                    <div className="bg-white w-1.5 h-1.5 rounded-full shadow-sm"></div>
                </div>
            )}
          </div>
        ))}

        {/* Food */}
        {food.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-center relative animate-in zoom-in duration-300"
            style={{ 
              gridColumnStart: item.x + 1, 
              gridRowStart: item.y + 1,
            }}
          >
             {item.type === 'bonus' ? (
                 <Star className="text-yellow-400 w-full h-full drop-shadow-md animate-spin-slow" fill="currentColor" />
             ) : (
                 <div className={`w-4 h-4 rounded-full shadow-sm border-2 ${item.type === 'valid' ? 'bg-blue-100 border-blue-500' : 'bg-red-100 border-red-500'}`}></div>
             )}
             
             {item.word && (
                 <span className={`absolute -top-6 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md border pointer-events-none z-30
                   ${item.type === 'valid' ? 'bg-white text-blue-700 border-blue-200' : 'bg-white text-red-700 border-red-200'}
                 `}>
                     {item.word}
                 </span>
             )}
          </div>
        ))}

      </div>

      {/* Controles Móvil */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-56 sm:hidden">
        <div></div>
        <Button variant="outline" className="h-16 active:bg-slate-100" onPointerDown={() => changeDir(0, -1)}><ArrowUp /></Button>
        <div></div>
        <Button variant="outline" className="h-16 active:bg-slate-100" onPointerDown={() => changeDir(-1, 0)}><ArrowLeft /></Button>
        <Button variant="outline" className="h-16 active:bg-slate-100" onPointerDown={() => changeDir(0, 1)}><ArrowDown /></Button>
        <Button variant="outline" className="h-16 active:bg-slate-100" onPointerDown={() => changeDir(1, 0)}><ArrowRight /></Button>
      </div>

    </div>
  );
};

export default SnakeDePalabras;