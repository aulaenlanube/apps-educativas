import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import SumasLayout from '/src/apps/_shared/SumasLayout';
import UniversalSumBoard, { buildColumnPlan } from '/src/apps/_shared/UniversalSumBoard';

const TOTAL_TEST_QUESTIONS = 5;
const toFloat = (s) => parseFloat(s.replace(',', '.'));

const SumasPrimaria6 = () => {
  // --- Estados ---
  const [currentOperands, setCurrentOperands] = useState(['0', '0', '0']);
  const [showCarries, setShowCarries] = useState(true);
  
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);

  const [isTestMode, setIsTestMode] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show: false, expectedResult: [], expectedCarries: [], firstNonZeroIdx: -1 });
  
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // --- Generación 6º Primaria: 3 sumandos con decimales variables ---
  const generarNumero = (cifrasEnteras, decimales) => {
    const min = cifrasEnteras === 2 ? 10 : 100;
    const max = cifrasEnteras === 2 ? 99 : 999;
    const entero = Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (decimales === 0) return entero.toString();
    
    const parteDecimal = Math.floor(Math.random() * Math.pow(10, decimales))
      .toString().padStart(decimales, '0');
    return `${entero},${parteDecimal}`;
  };

  const generateExercise = useCallback(() => {
    const cifras = Math.random() < 0.5 ? 2 : 3;
    // Generamos 3 números con 0 a 3 decimales aleatorios
    const d1 = Math.floor(Math.random() * 4);
    const d2 = Math.floor(Math.random() * 4);
    const d3 = Math.floor(Math.random() * 4);
    return [generarNumero(cifras, d1), generarNumero(cifras, d2), generarNumero(cifras, d3)];
  }, []);

  const prepareExercise = useCallback((ops) => {
    setCurrentOperands(ops);
    const plan = buildColumnPlan(ops, 2);
    setResultSlots(Array(plan.digitIndices.length).fill(''));
    setCarrySlots(Array(plan.digitIndices.length).fill(''));
    setFeedback({ text: '', cls: '' });
    setCheckInfo({ show: false });
    
    // Activar automáticamente la casilla de más a la derecha
    setActiveSlot({ type: 'result', index: plan.digitIndices.length - 1 });
  }, []);

  // --- Cálculo de Solución y Llevadas (Soporta 3 sumandos) ---
  const calculateSolution = (ops) => {
    const plan = buildColumnPlan(ops, 2);
    const maxDec = plan.maxDec;

    // 1. Calcular Resultado
    const sumVal = ops.reduce((acc, val) => acc + toFloat(val), 0);
    const sumStr = sumVal.toFixed(maxDec).replace('.', ',');
    // Rellenamos ceros a la izquierda para que coincida con el tablero
    const digitsStr = sumStr.replace(',', '').padStart(plan.digitIndices.length, '0');

    // 2. Calcular Llevadas
    // Alineamos todos los números respecto a la coma y rellenamos ceros a la derecha en los decimales
    const planos = ops.map(num => {
        const [e, d = ''] = num.replace(',', '.').split('.');
        // Parte entera + decimales (rellenos hasta maxDec)
        return e + d.padEnd(maxDec, '0');
    });

    // Ahora paddeamos a la izquierda (enteros) para que todos tengan la misma longitud total
    // Esta longitud debe coincidir con plan.digitIndices.length
    const totalCols = plan.digitIndices.length;
    const paddedOps = planos.map(s => s.padStart(totalCols, '0'));

    const expectedCarries = Array(totalCols).fill(0);
    let carry = 0;
    
    // Sumamos columna a columna desde la derecha
    for (let i = totalCols - 1; i >= 0; i--) {
        let colSum = carry;
        paddedOps.forEach(op => {
            colSum += parseInt(op[i]);
        });
        
        carry = Math.floor(colSum / 10);
        
        // Guardamos la llevada para la columna siguiente (izquierda)
        if (i > 0) {
            expectedCarries[i - 1] = carry;
        }
    }

    return { expectedResult: digitsStr.split(''), expectedCarries, solutionStr: sumStr };
  };

  // --- Manejo Teclado + Auto-Llevada ---
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
          
          if (strVal === expectedResult[activeSlot.index]) {
              const leftIndex = activeSlot.index - 1;
              if (leftIndex >= 0) {
                  const newCarries = [...carrySlots];
                  // En sumas de 3 números, la llevada puede ser 0, 1 o 2.
                  const carryVal = expectedCarries[leftIndex];
                  newCarries[leftIndex] = carryVal.toString();
                  setCarrySlots(newCarries);
              }
          }
      }

      // Auto-avance
      const nextIndex = activeSlot.index - 1;
      if (nextIndex >= 0) {
        setActiveSlot({ type: 'result', index: nextIndex });
      } else {
        setActiveSlot(null);
      }

    } else if (activeSlot.type === 'carry') {
        const n = [...carrySlots];
        n[activeSlot.index] = strVal;
        setCarrySlots(n);
        setActiveSlot(null);
    }
  };

  const startPractice = () => prepareExercise(generateExercise());
  
  const checkPractice = () => {
    const { expectedResult, expectedCarries } = calculateSolution(currentOperands);
    const firstNonZeroIdx = expectedResult.findIndex(d => d !== '0');
    setCheckInfo({ show: true, expectedResult, expectedCarries, firstNonZeroIdx });
    
    const userStr = resultSlots.join('');
    const correctStr = expectedResult.join('');
    
    // Usamos parseInt para ignorar ceros a la izquierda (ej: "0123" == "123")
    if (parseInt(userStr || '0') === parseInt(correctStr)) {
        
        let allCarriesCorrect = true;
        if (showCarries) {
            allCarriesCorrect = expectedCarries.every((val, idx) => {
                if (idx === expectedCarries.length - 1) return true;
                const userVal = parseInt(carrySlots[idx] || '0');
                return userVal === val;
            });
        }

        if (!showCarries || allCarriesCorrect) {
            setFeedback({ text: '¡Excelente! ¡Suma correcta! 🎉', cls: 'feedback-correct' });
            setActiveSlot(null);
            
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
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, generateExercise);
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setShowResults(false);
    setIsTestMode(true);
    prepareExercise(qs[0]);
  };

  const nextQuestion = () => {
    const plan = buildColumnPlan(currentOperands, 2);
    const userDigits = resultSlots.join('');
    
    // Reconstruir string con coma para guardar respuesta
    let userFormatted = userDigits;
    if (plan.maxDec > 0) {
        const cut = userDigits.length - plan.maxDec;
        userFormatted = userDigits.slice(0, cut) + ',' + userDigits.slice(cut);
    }
    
    const newAnswers = [...userAnswers, userFormatted];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        prepareExercise(testQuestions[nextIdx]);
    } else {
        let hits = 0;
        testQuestions.forEach((q, i) => {
            const { solutionStr } = calculateSolution(q);
            if (toFloat(newAnswers[i]) === toFloat(solutionStr)) hits++;
        });
        setScore(hits * 200);
        setShowResults(true);
    }
  };

  useEffect(() => { startPractice(); }, []);

  return (
    <SumasLayout
      title="Suma con decimales (6º)"
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

export default SumasPrimaria6;