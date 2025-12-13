import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import SumasLayout from '/src/apps/_shared/SumasLayout';
import UniversalSumBoard, { buildColumnPlan } from '/src/apps/_shared/UniversalSumBoard';

const TOTAL_TEST_QUESTIONS = 5;

const SumasPrimaria2 = () => {
  // --- Estados ---
  const [currentOperands, setCurrentOperands] = useState(['0', '0']);
  const [showCarries, setShowCarries] = useState(true); // Toggle para mostrar/ocultar círculos de llevada
  
  // Estados del Tablero
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);

  // Estados de Juego/Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show: false, expectedResult: [], expectedCarries: [], firstNonZeroIdx: -1 });
  
  // Test Data
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // --- Lógica Específica 2º Primaria: Sumas CON llevadas (2-3 cifras) ---
  const generateOperands = useCallback(() => {
    // Generamos números que fuercen llevadas para practicar
    const digits = Math.floor(Math.random() * 2) + 2; // 2 o 3 cifras
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits);
    
    const num1 = Math.floor(Math.random() * (max - min)) + min;
    const num2 = Math.floor(Math.random() * (max - min)) + min;
    
    return [num1.toString(), num2.toString()];
  }, []);

  const prepareExercise = useCallback((ops) => {
    setCurrentOperands(ops);
    const plan = buildColumnPlan(ops, 2);
    setResultSlots(Array(plan.digitIndices.length).fill(''));
    // Inicializamos carrySlots (tamaño igual a columnas para simplificar índices)
    setCarrySlots(Array(plan.digitIndices.length).fill('')); 
    setFeedback({ text: '', cls: '' });
    setCheckInfo({ show: false });
    
    // Activar por defecto la casilla más a la derecha (unidades)
    setActiveSlot({ type: 'result', index: plan.digitIndices.length - 1 });
  }, []);

  // --- Cálculo de Solución y Llevadas Reales ---
  const calculateSolution = (ops) => {
    const plan = buildColumnPlan(ops, 2);
    const numCols = plan.digitIndices.length;
    
    // Arrays para guardar la solución dígito a dígito
    const expectedResult = new Array(numCols).fill('0');
    const expectedCarries = new Array(numCols).fill(0);
    
    // Simulamos la suma columna a columna de derecha a izquierda
    let currentCarry = 0;
    
    // Paddeamos los operandos para alinearlos
    const strOps = ops.map(n => n.toString().padStart(numCols, '0'));

    for (let i = numCols - 1; i >= 0; i--) {
        let colSum = currentCarry;
        strOps.forEach(op => {
            colSum += parseInt(op[i]);
        });

        // El dígito que queda abajo
        expectedResult[i] = (colSum % 10).toString();
        
        // La llevada que va a la SIGUIENTE columna (izquierda, i-1)
        currentCarry = Math.floor(colSum / 10);
        
        if (i > 0) {
            expectedCarries[i - 1] = currentCarry; // Guardamos la llevada en la columna destino
        }
    }

    return { expectedResult, expectedCarries };
  };

  // --- Manejo Inteligente del Teclado ---
  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();
    
    if (activeSlot.type === 'result') {
      const n = [...resultSlots]; 
      n[activeSlot.index] = strVal; 
      setResultSlots(n);

      // --- AUTO-LLEVADA ---
      if (showCarries) {
          const { expectedResult, expectedCarries } = calculateSolution(currentOperands);
          
          // Si el usuario ACERTA el número de abajo...
          if (strVal === expectedResult[activeSlot.index]) {
              // Miramos la columna de la IZQUIERDA (activeSlot.index - 1)
              const leftIndex = activeSlot.index - 1;
              
              if (leftIndex >= 0) {
                  const newCarries = [...carrySlots];
                  // Si esa columna recibe llevada (valor > 0), ponemos '1'. Si no, '0'.
                  const carryVal = expectedCarries[leftIndex] > 0 ? '1' : '0';
                  newCarries[leftIndex] = carryVal;
                  setCarrySlots(newCarries);
              }
          }
      }

      // Auto-avance hacia la izquierda
      const nextIndex = activeSlot.index - 1;
      if (nextIndex >= 0) {
        setActiveSlot({ type: 'result', index: nextIndex });
      } else {
        setActiveSlot(null); // Terminado
      }

    } else if (activeSlot.type === 'carry') {
        // En llevadas manuales permitimos 1 o 0/borrar
        const n = [...carrySlots];
        n[activeSlot.index] = strVal;
        setCarrySlots(n);
        setActiveSlot(null);
    }
  };

  const startPractice = () => prepareExercise(generateOperands());
  
  const checkPractice = () => {
    const { expectedResult, expectedCarries } = calculateSolution(currentOperands);
    const firstNonZeroIdx = expectedResult.findIndex(d => d !== '0');
    setCheckInfo({ show: true, expectedResult, expectedCarries, firstNonZeroIdx });
    
    const userStr = resultSlots.join('');
    const correctStr = expectedResult.join('');
    
    if (parseInt(userStr || '0') === parseInt(correctStr)) {
        
        // Verificar también las llevadas si están visibles
        let allCarriesCorrect = true;
        if (showCarries) {
            // Comparamos solo las columnas relevantes (ignorando la 0 que no suele tener llevada visible encima)
            allCarriesCorrect = expectedCarries.every((val, idx) => {
                if (idx === expectedCarries.length - 1) return true; 
                const userVal = parseInt(carrySlots[idx] || '0');
                return userVal === val;
            });
        }

        if (!showCarries || allCarriesCorrect) {
            setFeedback({ text: '¡Excelente! ¡Suma correcta! 🎉', cls: 'feedback-correct' });
            setActiveSlot(null);
            
            // CONFETTI
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            setFeedback({ text: 'El resultado es correcto, pero revisa las llevadas.', cls: 'feedback-incorrect' });
        }

    } else {
        setFeedback({ text: 'Casi... ¡Revisa las casillas en rojo!', cls: 'feedback-incorrect' });
    }
  };

  const startTest = () => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, generateOperands);
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setShowResults(false);
    setIsTestMode(true);
    prepareExercise(qs[0]);
  };

  const nextQuestion = () => {
    const userVal = parseInt(resultSlots.join('') || '0').toString();
    const newAnswers = [...userAnswers, userVal];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        prepareExercise(testQuestions[nextIdx]);
    } else {
        let hits = 0;
        testQuestions.forEach((q, i) => {
            const sum = q.reduce((a, b) => a + parseInt(b), 0);
            if (newAnswers[i] === sum.toString()) hits++;
        });
        setScore(hits * 200);
        setShowResults(true);
    }
  };

  useEffect(() => { startPractice(); }, []);

  return (
    <SumasLayout
      title="Sumas con llevadas (2º)"
      isTestMode={isTestMode}
      setTestMode={setIsTestMode}
      testState={{ currentQuestionIndex, totalQuestions: TOTAL_TEST_QUESTIONS, showResults, score, testQuestions, userAnswers }}
      practiceState={{ feedback }}
      actions={{ 
        startPractice, 
        startTest: () => { setIsTestMode(true); startTest(); }, 
        checkPractice, 
        nextQuestion, 
        exitTest: () => { setIsTestMode(false); setShowResults(false); startPractice(); }, 
        onPaletteClick: handlePaletteClick 
      }}
      // CORRECCIÓN: Pasar los nombres de prop correctos que espera SumasLayout
      options={{
        showCarries: showCarries,
        setShowCarries: setShowCarries
      }}
    >
      <UniversalSumBoard
        nums={currentOperands}
        minIntegerDigits={2}
        showCarries={showCarries}
        resultSlots={resultSlots}
        carrySlots={carrySlots}
        activeSlot={activeSlot}
        actions={{
            updateResult: (i, v) => { const n=[...resultSlots]; n[i]=v; setResultSlots(n); },
            updateCarry: (i, v) => { const n=[...carrySlots]; n[i]=v; setCarrySlots(n); },
            setActiveSlot
        }}
        validation={checkInfo}
      />
    </SumasLayout>
  );
};

export default SumasPrimaria2;