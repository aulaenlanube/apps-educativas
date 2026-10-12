import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import OperationTestBoard from '../../_shared/OperationTestBoard';
import { OpGrid, OpGuide, OpDigit, OpComma, OpOperator, OpRule, OpSlot, placeOf } from '../../_shared/MathOperationLayout';
import { hideLeadingZeros } from '../../_shared/UniversalSubtractionBoard';

const TOTAL_TEST_QUESTIONS = 5;

const RestasPrimaria6 = ({ onGameComplete } = {}) => {
  const [problemData, setProblemData] = useState({ num1: 0, num2: 0, result: 0, hiddenPart: 'subtrahend' });
  const [structure, setStructure] = useState({ maxIntDigits: 0, maxDecimalPlaces: 0, totalDigits: 0, n1Str: '', n2Str: '', resStr: '' });
  const [userSlots, setUserSlots] = useState([]);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Test mode ---
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testN1, setTestN1] = useState(0);
  const [testN2, setTestN2] = useState(0);
  const [testResultSlots, setTestResultSlots] = useState([]);
  const [testActiveIdx, setTestActiveIdx] = useState(null);

  const generateNewProblem = useCallback(() => {
    const hiddenPart = Math.random() < 0.5 ? 'minuend' : 'subtrahend';
    const num1IntDigits = Math.floor(Math.random() * 2) + 1;
    const num1DecimalPlaces = Math.floor(Math.random() * 3) + 1;
    const num1TotalDigits = num1IntDigits + num1DecimalPlaces;
    const num1Factor = Math.pow(10, num1DecimalPlaces);
    const num1Min = Math.pow(10, num1TotalDigits - 1);
    const num1Max = Math.pow(10, num1TotalDigits);
    const num1Int = Math.floor(Math.random() * (num1Max - num1Min)) + num1Min;
    const num1 = num1Int / num1Factor;

    const num2DecimalPlaces = Math.floor(Math.random() * 3) + 1;
    let num2Raw = (Math.random() * num1).toFixed(num2DecimalPlaces);
    if (parseFloat(num2Raw) >= num1) num2Raw = (num1 * 0.9).toFixed(num2DecimalPlaces);
    const num2 = parseFloat(num2Raw);
    const result = num1 - num2;

    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');
    const [resIntStr, resDecStr = ''] = result.toFixed(Math.max(n1DecStr.length, n2DecStr.length)).split('.');

    const maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length, resIntStr.length);
    const maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length, resDecStr.length);
    const totalDigits = maxIntDigits + maxDecimalPlaces;

    const formatNum = (intStr, decStr) => intStr.padStart(maxIntDigits, '0') + decStr.padEnd(maxDecimalPlaces, '0');
    const n1Str = formatNum(n1IntStr, n1DecStr);
    const n2Str = formatNum(n2IntStr, n2DecStr);
    const [rInt, rDec = ''] = result.toFixed(maxDecimalPlaces).split('.');
    const resStr = formatNum(rInt, rDec);

    setProblemData({ num1, num2, result, hiddenPart });
    setStructure({ maxIntDigits, maxDecimalPlaces, totalDigits, n1Str, n2Str, resStr });
    setUserSlots(new Array(totalDigits).fill(''));
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ index: totalDigits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Test mode helpers (enteros 4-5 cifras) ---
  const generarParTest = useCallback(() => {
    const digits = 4 + Math.floor(Math.random() * 2);
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits);
    let n1, n2;
    do {
      n1 = Math.floor(Math.random() * (max - min)) + min;
      n2 = Math.floor(Math.random() * n1);
    } while (n1 === n2);
    return [n1.toString(), n2.toString()];
  }, []);

  const prepareTestQuestion = (pair) => {
    const [a, b] = pair;
    const diff = parseInt(a) - parseInt(b);
    const len = diff.toString().length;
    setTestN1(parseInt(a)); setTestN2(parseInt(b));
    setTestResultSlots(new Array(len).fill(''));
    setTestActiveIdx(len - 1);
  };

  const startTest = () => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, generarParTest);
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]); setScore(0); setShowResults(false);
    setIsTestMode(true);
    prepareTestQuestion(qs[0]);
  };

  const nextTestQuestion = () => {
    const userVal = parseInt(testResultSlots.join('') || '0', 10).toString();
    const newAnswers = [...userAnswers, userVal];
    setUserAnswers(newAnswers);
    if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      prepareTestQuestion(testQuestions[nextIdx]);
    } else {
      let hits = 0;
      testQuestions.forEach((q, i) => {
        const expected = (parseInt(q[0]) - parseInt(q[1])).toString();
        if (newAnswers[i] === expected) hits++;
      });
      setScore(hits * 200);
      setShowResults(true);
    }
  };

  const exitTest = () => { setIsTestMode(false); setShowResults(false); generateNewProblem(); };

  // Examen: coloca un número en la casilla idx (la activa, o la de destino al
  // arrastrar). Misma lógica que antes tenía handlePaletteClick.
  const applyTestDigit = (idx, val) => {
    const strVal = val.toString();
    const next = [...testResultSlots];
    next[idx] = strVal;
    setTestResultSlots(next);
    const nextIdx = idx - 1;
    setTestActiveIdx(nextIdx >= 0 ? nextIdx : null);
  };

  // Práctica: coloca un número en la casilla index (activa o de destino).
  const applyDigit = (index, val) => {
    const newSlots = [...userSlots];
    newSlots[index] = val.toString();
    setUserSlots(newSlots);
    const nextIdx = index - 1;
    if (nextIdx >= 0) setActiveSlot({ index: nextIdx });
    else setActiveSlot(null);
  };

  const handlePaletteClick = (val) => {
    if (isTestMode) {
      if (testActiveIdx == null) return;
      applyTestDigit(testActiveIdx, val);
      return;
    }
    if (!activeSlot) return;
    applyDigit(activeSlot.index, val);
  };

  const checkAnswer = () => {
    const rawUserStr = userSlots.map(s => s || '0').join('');
    const userStrWithDot = rawUserStr.slice(0, structure.maxIntDigits) + '.' + rawUserStr.slice(structure.maxIntDigits);
    const userNum = parseFloat(userStrWithDot);
    const correctAnswer = problemData.hiddenPart === 'minuend' ? problemData.num1 : problemData.num2;
    const isCorrect = Math.abs(userNum - correctAnswer) < 0.001;

    if (isCorrect) {
      setFeedback({ text: '¡Correcto! Has encontrado el número que faltaba. ✅', cls: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: '¡Ups! Ese no es el número correcto. Inténtalo de nuevo. ❌', cls: 'feedback-incorrect' });
    }
  };

  // --- Tablero (solo presentación) ---
  // Rejilla: [signo] [cifras… (coma)]; filas: valor posicional, minuendo,
  // sustraendo, raya y resultado (siempre visible). La fila que falta son casillas.
  const renderBoard = () => {
    const R_LABEL = 1;
    const R_ROW1 = 2;
    const R_ROW2 = 3;
    const R_RULE = 4;
    const R_RESULT = 5;
    const targetStr = problemData.hiddenPart === 'minuend' ? structure.n1Str : structure.n2Str;
    const showInput = problemData.hiddenPart === 'minuend' ? 'row1' : 'row2';
    const asDigits = (str) => str.split('').map((value) => ({ value }));
    const shown1 = hideLeadingZeros(asDigits(structure.n1Str), structure.maxIntDigits);
    const shown2 = hideLeadingZeros(asDigits(structure.n2Str), structure.maxIntDigits);
    const shownRes = hideLeadingZeros(asDigits(structure.resStr), structure.maxIntDigits);

    const columns = ['op'];
    const pieces = [];
    let col = 2;
    for (let i = 0; i < structure.totalDigits; i++) {
      if (i === structure.maxIntDigits && structure.maxDecimalPlaces > 0) {
        columns.push('comma');
        pieces.push(<OpComma key="cm-1" r={R_ROW1} c={col} />);
        pieces.push(<OpComma key="cm-2" r={R_ROW2} c={col} />);
        pieces.push(<OpComma key="cm-r" r={R_RESULT} c={col} />);
        col++;
      }
      columns.push('cell');
      const pos = i < structure.maxIntDigits ? structure.maxIntDigits - 1 - i : -(i - structure.maxIntDigits + 1);
      const [, placeName] = placeOf(pos);
      pieces.push(<OpGuide key={`g-${i}`} c={col} pos={pos} alt={i % 2 === 1} labelRow={R_LABEL} />);

      const isFilled = userSlots[i] !== '';
      const isCorrectDigit = userSlots[i] === targetStr[i];
      const cellClass = feedback.text && isFilled ? (isCorrectDigit ? 'correct' : 'incorrect') : '';
      const slot = (r, c) => (
        <OpSlot
          key={`input-${i}`}
          r={r}
          c={c}
          kind="result"
          value={userSlots[i]}
          state={cellClass}
          selected={activeSlot?.index === i}
          label={`${showInput === 'row1' ? 'Minuendo' : 'Sustraendo'}: ${placeName.toLowerCase()}`}
          onSelect={() => setActiveSlot({ index: i })}
          onDrop={(e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if (/^\d$/.test(data)) applyDigit(i, Number(data));
          }}
        />
      );

      // Fila 1 (Minuendo)
      if (showInput === 'row1') pieces.push(slot(R_ROW1, col));
      else if (shown1[i]) pieces.push(<OpDigit key={`n1-${i}`} r={R_ROW1} c={col}>{structure.n1Str[i]}</OpDigit>);
      // Fila 2 (Sustraendo)
      if (showInput === 'row2') pieces.push(slot(R_ROW2, col));
      else if (shown2[i]) pieces.push(<OpDigit key={`n2-${i}`} r={R_ROW2} c={col}>{structure.n2Str[i]}</OpDigit>);
      // Fila 4 (Resultado - siempre visible)
      if (shownRes[i]) pieces.push(<OpDigit key={`res-${i}`} r={R_RESULT} c={col}>{structure.resStr[i]}</OpDigit>);
      col++;
    }
    return (
      <OpGrid columns={columns} rows={['label', 'num', 'num', 'rule', 'result']} label="Completa la resta" className="opb-grid--missing">
        {pieces}
        <OpOperator r={R_ROW2} symbol="−" />
        <OpRule r={R_RULE} />
      </OpGrid>
    );
  };

  return (
    <MathOperationLayout
      title="Completa la resta"
      emoji="📝"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nuevo problema"
      onPaletteClick={handlePaletteClick}
      padLayout="side"
      onGameComplete={onGameComplete}
      isTestMode={isTestMode}
      setTestMode={setIsTestMode}
      testState={{ currentQuestionIndex, totalQuestions: TOTAL_TEST_QUESTIONS, showResults, score, testQuestions, userAnswers }}
      actions={{
        startPractice: () => { setIsTestMode(false); setShowResults(false); generateNewProblem(); },
        startTest, nextQuestion: nextTestQuestion, exitTest,
      }}
      calculateExpected={(q) => (parseInt(q[0]) - parseInt(q[1])).toString()}
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Encuentra el número que falta en la resta: puede ser el minuendo (arriba) o el sustraendo (abajo).</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla vacía para seleccionarla.</li>
            <li>Después toca un número del teclado para colocarlo (o arrástralo hasta la casilla).</li>
            <li>Fíjate en el resultado (siempre visible) para deducir el número que falta.</li>
            <li>Pulsa <strong>Comprobar</strong> para ver qué casillas están bien (verde) o mal (rojo).</li>
          </ul>
          <h3>Examen</h3>
          <p>5 restas seguidas: escribe solo el resultado. La nota llega al final.</p>
        </>
      }
    >
      {isTestMode ? (
        <OperationTestBoard
          operator="−"
          n1={testN1}
          n2={testN2}
          resultSlots={testResultSlots}
          activeSlotIndex={testActiveIdx}
          onSlotClick={(i) => setTestActiveIdx(i)}
          onSlotDrop={applyTestDigit}
        />
      ) : (
        renderBoard()
      )}
    </MathOperationLayout>
  );
};

export default RestasPrimaria6;
