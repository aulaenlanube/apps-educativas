import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import SumasLayout from '/src/apps/_shared/SumasLayout';
import UniversalSumBoard, { buildColumnPlan } from '/src/apps/_shared/UniversalSumBoard';

const TOTAL_TEST_QUESTIONS = 5;
const toFloat = (s) => parseFloat(s.replace(',', '.'));

const SumasPrimaria5 = () => {
  // --- Estados ---
  const [currentOperands, setCurrentOperands] = useState(['0', '0']);
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

  // --- Lógica 5º Primaria: Sumas con decimales variables ---
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
    const cifras = Math.random() < 0.5 ? 2 : 3; // 2 o 3 cifras enteras
    const mismaCantidad = Math.random() > 0.5;
    let d1, d2;
    
    if (mismaCantidad) {
        d1 = Math.floor(Math.random() * 2) + 1; // 1-2 decimales
        d2 = d1;
    } else {
        d1 = Math.floor(Math.random() * 3); // 0-2 decimales
        do { d2 = Math.floor(Math.random() * 3); } while (d2 === d1);
    }
    return [generarNumero(cifras, d1), generarNumero(cifras, d2)];
  }, []);

  const prepareExercise = useCallback((ops) => {
    setCurrentOperands(ops);
    const plan = buildColumnPlan(ops, 2);
    setResultSlots(Array(plan.digitIndices.length).fill(''));
    setCarrySlots(Array(plan.digitIndices.length).fill('')); // Mismo tamaño
    setFeedback({ text: '', cls: '' });
    setCheckInfo({ show: false });
    
    // Activar la última casilla (la más a la derecha, sea decimal o no)
    setActiveSlot({ type: 'result', index: plan.digitIndices.length - 1 });
  }, []);

  // --- Cálculo de Solución y Llevadas (Alineando por la coma) ---
  const calculateSolution = (ops) => {
    const plan = buildColumnPlan(ops, 2);
    
    // Solución numérica
    const sumVal = ops.reduce((acc, val) => acc + toFloat(val), 0);
    // Formatear solución asegurando todos los decimales necesarios
    const sumStr = sumVal.toFixed(plan.maxDec).replace('.', ',');
    
    // CORRECCIÓN IMPORTANTE: Rellenar con ceros a la izquierda para coincidir con el tablero
    const rawDigits = sumStr.replace(',', '');
    const digitsPadded = rawDigits.padStart(plan.digitIndices.length, '0');
    const expectedResult = digitsPadded.split('');
    
    // Cálculo de llevadas simulando la operación alineada
    const expectedCarries = Array(plan.digitIndices.length).fill(0);
    
    // Normalizamos los operandos para que tengan la misma longitud decimal (rellenando con 0)
    const normalizedOps = ops.map(op => {
        const [ent, dec = ''] = op.split(',');
        const decPadded = dec.padEnd(plan.maxDec, '0');
        return ent + decPadded; // String "plano" de dígitos
    });
    
    // Paddeamos por la izquierda (enteros) para alinear longitud total
    const maxLength = plan.digitIndices.length; 
    const paddedOps = normalizedOps.map(op => op.padStart(maxLength, '0'));

    let currentCarry = 0;
    for (let i = maxLength - 1; i >= 0; i--) {
        let colSum = currentCarry;
        paddedOps.forEach(op => {
            colSum += parseInt(op[i]);
        });
        
        currentCarry = Math.floor(colSum / 10);
        
        if (i > 0) {
            expectedCarries[i - 1] = currentCarry;
        }
    }

    return { expectedResult, expectedCarries, solutionStr: sumStr };
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
                  newCarries[leftIndex] = expectedCarries[leftIndex] > 0 ? '1' : '0';
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
    
    // CORRECCIÓN: Usar parseInt para ignorar ceros a la izquierda vacíos
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
            setFeedback({ text: 'Resultado correcto, pero revisa las llevadas.', cls: 'feedback-incorrect' });
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
    
    // Insertar coma en la posición correcta
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
      title="Suma con decimales (5º)"
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

export default SumasPrimaria5;