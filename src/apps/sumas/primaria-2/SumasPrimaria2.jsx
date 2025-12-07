// src/apps/sumas/primaria-2/SumasPrimaria2.jsx
import React, { useCallback, useEffect, useState } from 'react';
import SumasLayout from '/src/apps/_shared/SumasLayout';
import UniversalSumBoard, { buildColumnPlan } from '/src/apps/_shared/UniversalSumBoard';

const TOTAL_TEST_QUESTIONS = 5;

const SumasPrimaria2 = () => {
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

  const generateOperands = useCallback(() => {
    const n1 = Math.floor(Math.random() * 90) + 10;
    const n2 = Math.floor(Math.random() * 90) + 10;
    return [n1.toString(), n2.toString()];
  }, []);

  const prepareExercise = useCallback((ops) => {
    setCurrentOperands(ops);
    const plan = buildColumnPlan(ops, 2); 
    setResultSlots(Array(plan.digitIndices.length).fill(''));
    setCarrySlots(Array(Math.max(0, plan.digitIndices.length - 1)).fill(''));
    setFeedback({ text: '', cls: '' });
    setCheckInfo({ show: false });
    // MEJORA: Selección automática
    setActiveSlot({ type: 'result', index: plan.digitIndices.length - 1 });
  }, []);

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();
    if (activeSlot.type === 'result') {
      const n = [...resultSlots];
      n[activeSlot.index] = strVal;
      setResultSlots(n);
      // MEJORA: Auto-avance izquierda
      const nextIndex = activeSlot.index - 1;
      if (nextIndex >= 0) setActiveSlot({ type: 'result', index: nextIndex });
      else setActiveSlot(null);
    } else {
      const n = [...carrySlots];
      n[activeSlot.index] = strVal;
      setCarrySlots(n);
    }
  };

  const calculateSolution = (ops) => {
    const plan = buildColumnPlan(ops, 2);
    const sum = ops.reduce((a, b) => a + parseInt(b), 0);
    const expectedStr = sum.toString().padStart(plan.digitIndices.length, '0');
    const expectedResult = expectedStr.split('');
    const padded = ops.map(n => n.padStart(plan.digitIndices.length, '0'));
    const expectedCarries = Array(plan.digitIndices.length - 1).fill(0);
    let carry = 0;
    for (let i = plan.digitIndices.length - 1; i > 0; i--) {
        let colSum = carry;
        padded.forEach(n => colSum += parseInt(n[i]));
        carry = Math.floor(colSum / 10);
        expectedCarries[i-1] = carry;
    }
    return { expectedResult, expectedCarries, solutionStr: sum.toString() };
  };

  const startPractice = () => prepareExercise(generateOperands());
  const checkPractice = () => {
    const { expectedResult, expectedCarries } = calculateSolution(currentOperands);
    const firstNonZeroIdx = expectedResult.findIndex(d => d !== '0');
    setCheckInfo({ show: true, expectedResult, expectedCarries, firstNonZeroIdx });
    const userStr = resultSlots.join('');
    const correctStr = expectedResult.join('');
    if (parseInt(userStr || '0') === parseInt(correctStr)) {
        setFeedback({ text: '¡Correcto! 🎉', cls: 'feedback-correct' });
        setActiveSlot(null);
    } else {
        setFeedback({ text: 'Revisa los números rojos', cls: 'feedback-incorrect' });
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
      title="Suma como en el cole"
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

export default SumasPrimaria2;