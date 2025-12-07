// src/apps/sumas/primaria-6/SumasPrimaria6.jsx
import React, { useCallback, useEffect, useState } from 'react';
import SumasLayout from '/src/apps/_shared/SumasLayout';
import UniversalSumBoard, { buildColumnPlan } from '/src/apps/_shared/UniversalSumBoard';

const TOTAL_TEST_QUESTIONS = 5;
const toFloat = (s) => parseFloat(s.replace(',', '.'));
const countDecimals = (s) => (s.includes(',') ? s.split(',')[1].length : 0);

const SumasPrimaria6 = () => {
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

  const generarNumero = (cifrasEnteras, decimales) => {
    const min = cifrasEnteras === 2 ? 10 : 100;
    const max = cifrasEnteras === 2 ? 99 : 999;
    const entero = Math.floor(Math.random() * (max - min + 1)) + min;
    if (decimales === 0) return entero.toString();
    const parteDecimal = Math.floor(Math.random() * Math.pow(10, decimales)).toString().padStart(decimales, '0');
    return `${entero},${parteDecimal}`;
  };

  const generateExercise = useCallback(() => {
    const cifras = Math.random() < 0.5 ? 2 : 3;
    const d1 = Math.floor(Math.random() * 4);
    const d2 = Math.floor(Math.random() * 4);
    const d3 = Math.floor(Math.random() * 4);
    return [generarNumero(cifras, d1), generarNumero(cifras, d2), generarNumero(cifras, d3)];
  }, []);

  const prepareExercise = useCallback((ops) => {
    setCurrentOperands(ops);
    const plan = buildColumnPlan(ops, 2);
    setResultSlots(Array(plan.digitIndices.length).fill(''));
    setCarrySlots(Array(Math.max(0, plan.digitIndices.length - 1)).fill(''));
    setFeedback({ text: '', cls: '' });
    setCheckInfo({ show: false });
    // Selección automática casilla derecha
    setActiveSlot({ type: 'result', index: plan.digitIndices.length - 1 });
  }, []);

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();
    if (activeSlot.type === 'result') {
        const n = [...resultSlots]; n[activeSlot.index] = strVal; setResultSlots(n);
        // Auto-avance izquierda
        const nextIndex = activeSlot.index - 1;
        if (nextIndex >= 0) setActiveSlot({ type: 'result', index: nextIndex });
        else setActiveSlot(null);
    } else {
        const n = [...carrySlots]; n[activeSlot.index] = strVal; setCarrySlots(n);
    }
  };

  const calculateSolution = (ops) => {
    const plan = buildColumnPlan(ops, 2);
    const maxDec = plan.maxDec;

    // 1. Calcular Resultado
    const sumVal = ops.reduce((acc, val) => acc + toFloat(val), 0);
    const sumStr = sumVal.toFixed(maxDec).replace('.', ',');
    const digitsStr = sumStr.replace(',', '').padStart(plan.digitIndices.length, '0');

    // 2. Calcular Llevadas (Corrección: lógica completa para N sumandos decimales)
    // Alineamos todos los números como cadenas de dígitos (sin coma)
    const planos = ops.map(num => {
        const [e, d = ''] = num.replace(',', '.').split('.');
        // Unir entero + decimal alineado a la derecha, y luego pad al total de columnas
        return (e + d.padEnd(maxDec, '0')).padStart(plan.digitIndices.length, '0');
    });

    const expectedCarries = Array(plan.digitIndices.length - 1).fill(0);
    let carry = 0;
    // Iteramos de derecha a izquierda (desde la última columna de dígitos hasta la 1)
    // Nota: plan.digitIndices.length coincide con la longitud de las cadenas 'plano'
    for (let i = plan.digitIndices.length - 1; i > 0; i--) {
        const colSum = planos.reduce((acc, p) => acc + parseInt(p[i]), 0) + carry;
        carry = Math.floor(colSum / 10);
        expectedCarries[i - 1] = carry;
    }

    return { expectedResult: digitsStr.split(''), expectedCarries, solutionStr: sumStr };
  };

  const startPractice = () => prepareExercise(generateExercise());
  
  const checkPractice = () => {
    const { expectedResult, expectedCarries } = calculateSolution(currentOperands);
    const firstNonZeroIdx = expectedResult.findIndex(d => d !== '0');
    // Pasamos expectedCarries para que el tablero valide correctamente las llevadas
    setCheckInfo({ show: true, expectedResult, expectedCarries, firstNonZeroIdx }); 
    
    const userStr = resultSlots.join('');
    const correctStr = expectedResult.join('');
    if (userStr === correctStr) {
        setFeedback({ text: '¡Correcto! 🎉', cls: 'feedback-correct' });
        setActiveSlot(null);
    } else {
        setFeedback({ text: 'Revisa los números rojos', cls: 'feedback-incorrect' });
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
    const cut = userDigits.length - plan.maxDec;
    const userFormatted = plan.maxDec > 0 ? userDigits.slice(0, cut) + ',' + userDigits.slice(cut) : userDigits;
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
      actions={{ startPractice, startTest: () => { setIsTestMode(true); startTest(); }, checkPractice, nextQuestion, exitTest: () => { setIsTestMode(false); setShowResults(false); startPractice(); }, onPaletteClick: handlePaletteClick }}
      options={{ showCarries, setShowCarries }}
    >
      <UniversalSumBoard
        nums={currentOperands}
        minIntegerDigits={2}
        showCarries={showCarries}
        resultSlots={resultSlots}
        carrySlots={carrySlots}
        activeSlot={activeSlot}
        actions={{ updateResult: (i, v) => { const n=[...resultSlots]; n[i]=v; setResultSlots(n); }, updateCarry: (i, v) => { const n=[...carrySlots]; n[i]=v; setCarrySlots(n); }, setActiveSlot }}
        validation={checkInfo}
      />
    </SumasLayout>
  );
};

export default SumasPrimaria6;