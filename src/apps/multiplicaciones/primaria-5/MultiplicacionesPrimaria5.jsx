import React, { useEffect, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";
import MathOperationLayout from '../../_shared/MathOperationLayout';
import MultiplicacionTestBoard from '../../_shared/MultiplicacionTestBoard';

const TOTAL_TEST_QUESTIONS = 5;

export default function MultiplicacionesPrimaria5({ onGameComplete } = {}) {
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [solucion, setSolucion] = useState({ fila1: [], llevadas1: [], fila2: [], llevadas2: [], fila3: [], llevadas3: [], suma: [], llevadasSuma: [] });
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);
  const [entradas, setEntradas] = useState({ fila1: [], fila2: [], fila3: [], filaSuma: [], llevadasMul: [], llevadasSuma: [] });
  const [clases, setClases] = useState({ fila1: [], fila2: [], fila3: [], filaSuma: [], llevadasMul: [], llevadasSuma: [] });
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Test mode ---
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testResultSlots, setTestResultSlots] = useState([]);
  const [testActiveIdx, setTestActiveIdx] = useState(null);

  const generarNumero = (cifras) => {
    const min = Math.pow(10, cifras - 1);
    const max = Math.pow(10, cifras) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const calcularFilaProducto = (mulcdo, digito) => {
    const tMulcdo = mulcdo.toString();
    const ancho = tMulcdo.length + 1;
    const digitos = new Array(ancho).fill("");
    const llevadas = new Array(ancho).fill(0);
    let acarreo = 0;
    for (let i = tMulcdo.length - 1; i >= 0; i--) {
      const prod = parseInt(tMulcdo[i]) * digito + acarreo;
      digitos[i + 1] = (prod % 10).toString();
      acarreo = Math.floor(prod / 10);
      if (i >= 0) llevadas[i] = acarreo;
    }
    if (acarreo > 0) digitos[0] = acarreo.toString();
    return { digitos, llevadas };
  };

  const generarNueva = useCallback(() => {
    const n1 = generarNumero(4);
    const n2 = generarNumero(3);
    const dUnit = n2 % 10;
    const dTens = Math.floor((n2 / 10) % 10);
    const dCent = Math.floor(n2 / 100);
    const prod1 = calcularFilaProducto(n1, dUnit);
    const prod2 = calcularFilaProducto(n1, dTens);
    const prod3 = calcularFilaProducto(n1, dCent);
    const total = n1 * n2;
    const anchoTotal = 7;

    const alinear = (arr, shiftRight) => {
      const res = new Array(anchoTotal).fill("");
      for (let i = 0; i < arr.length; i++) {
        const val = arr[arr.length - 1 - i];
        if (val !== undefined && val !== "") res[anchoTotal - 1 - shiftRight - i] = val;
      }
      return res;
    };

    const f1 = alinear(prod1.digitos, 0);
    const f2 = alinear(prod2.digitos, 1);
    const f3 = alinear(prod3.digitos, 2);
    const sumaAl = alinear(total.toString().split(''), 0);

    const llevadasSuma = new Array(anchoTotal).fill("");
    let acSuma = 0;
    for (let i = anchoTotal - 1; i > 0; i--) {
      const s = parseInt(f1[i] || "0") + parseInt(f2[i] || "0") + parseInt(f3[i] || "0") + acSuma;
      acSuma = Math.floor(s / 10);
      if (acSuma > 0) llevadasSuma[i - 1] = acSuma.toString();
    }

    setMultiplicando(n1);
    setMultiplicador(n2);
    setSolucion({ fila1: f1, llevadas1: prod1.llevadas, fila2: f2, llevadas2: prod2.llevadas, fila3: f3, llevadas3: prod3.llevadas, suma: sumaAl, llevadasSuma });

    const vacio = () => new Array(anchoTotal).fill("");
    setEntradas({ fila1: vacio(), fila2: vacio(), fila3: vacio(), filaSuma: vacio(), llevadasMul: vacio(), llevadasSuma: vacio() });
    setClases({ fila1: vacio(), fila2: vacio(), fila3: vacio(), filaSuma: vacio(), llevadasMul: vacio(), llevadasSuma: vacio() });
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'fila1', index: anchoTotal - 1 });
  }, []);

  useEffect(() => { generarNueva(); }, [generarNueva]);

  // --- Test mode helpers ---
  const generarParTest = useCallback(() => {
    const n1 = generarNumero(4);
    const n2 = generarNumero(3);
    return [n1.toString(), n2.toString()];
  }, []);

  const prepareTestQuestion = (pair) => {
    const [a, b] = pair;
    const producto = parseInt(a) * parseInt(b);
    const len = producto.toString().length;
    setMultiplicando(parseInt(a));
    setMultiplicador(parseInt(b));
    setTestResultSlots(new Array(len).fill(''));
    setTestActiveIdx(len - 1);
  };

  const startTest = () => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, generarParTest);
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setShowResults(false);
    setIsTestMode(true);
    prepareTestQuestion(qs[0]);
  };

  const nextTestQuestion = () => {
    const userVal = parseInt((testResultSlots.join('') || '0'), 10).toString();
    const newAnswers = [...userAnswers, userVal];
    setUserAnswers(newAnswers);
    if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      prepareTestQuestion(testQuestions[nextIdx]);
    } else {
      let hits = 0;
      testQuestions.forEach((q, i) => {
        const expected = (parseInt(q[0]) * parseInt(q[1])).toString();
        if (newAnswers[i] === expected) hits++;
      });
      setScore(hits * 200);
      setShowResults(true);
    }
  };

  const exitTest = () => { setIsTestMode(false); setShowResults(false); generarNueva(); };

  const handleSlotClick = (type, index) => setActiveSlot({ type, index });

  const handlePaletteClick = (val) => {
    if (isTestMode) {
      if (testActiveIdx == null) return;
      const strVal = val.toString();
      const next = [...testResultSlots];
      next[testActiveIdx] = strVal;
      setTestResultSlots(next);
      const nextIdx = testActiveIdx - 1;
      setTestActiveIdx(nextIdx >= 0 ? nextIdx : null);
      return;
    }
    if (!activeSlot) return;
    const strVal = val.toString();
    const { type, index } = activeSlot;

    setEntradas(prev => { const n = { ...prev, [type]: [...prev[type]] }; n[type][index] = strVal; return n; });
    setClases(prev => { const n = { ...prev, [type]: [...prev[type]] }; n[type][index] = ""; return n; });

    if (ayudaLlevadas) {
      if (type.startsWith('fila') && type !== 'filaSuma') {
        const llevadasKey = type.replace('fila', 'llevadas');
        const offset = type === 'fila1' ? 0 : type === 'fila2' ? 1 : 2;
        const anchoTotal = 7;
        const posDesdeDerecha = (anchoTotal - 1 - index) - offset;
        if (strVal === solucion[type][index] && posDesdeDerecha >= 0) {
          const llevadasSource = solucion[llevadasKey];
          const rawIndex = (llevadasSource.length - 2) - posDesdeDerecha;
          const carrySlotIndex = index - 1;
          if (rawIndex >= 0 && carrySlotIndex >= 0) {
            const carryVal = llevadasSource[rawIndex] || 0;
            setEntradas(prev => ({ ...prev, llevadasMul: prev.llevadasMul.map((v, i) => i === carrySlotIndex ? carryVal.toString() : v) }));
          }
        }
      } else if (type === 'filaSuma' && strVal === solucion.suma[index] && index - 1 >= 0) {
        setEntradas(prev => ({ ...prev, llevadasSuma: prev.llevadasSuma.map((v, i) => i === index - 1 ? (solucion.llevadasSuma[index - 1] || "0") : v) }));
      }
    }

    // Auto-advance
    const prevIndex = index - 1;
    const solKey = type === 'filaSuma' ? 'suma' : type;
    const hasMoreInRow = solucion[solKey] && solucion[solKey][prevIndex] !== undefined && solucion[solKey][prevIndex] !== "";

    if (hasMoreInRow) {
      setActiveSlot({ type, index: prevIndex });
    } else {
      const clearCarries = () => setEntradas(prev => ({ ...prev, llevadasMul: new Array(7).fill("") }));
      if (type === 'fila1') { clearCarries(); setActiveSlot({ type: 'fila2', index: 5 }); }
      else if (type === 'fila2') { clearCarries(); setActiveSlot({ type: 'fila3', index: 4 }); }
      else if (type === 'fila3') { clearCarries(); setActiveSlot({ type: 'filaSuma', index: 6 }); }
      else setActiveSlot(null);
    }
  };

  const comprobarRespuesta = () => {
    let correcto = true;
    const nuevasClases = { ...clases };
    [{ input: 'fila1', sol: 'fila1' }, { input: 'fila2', sol: 'fila2' }, { input: 'fila3', sol: 'fila3' }, { input: 'filaSuma', sol: 'suma' }].forEach(({ input, sol }) => {
      solucion[sol].forEach((val, i) => { if (!val) return; if (entradas[input][i] === val) nuevasClases[input][i] = 'correct'; else { nuevasClases[input][i] = 'incorrect'; correcto = false; } });
    });
    setClases(nuevasClases);

    if (correcto) {
      setFeedback({ text: '¡Genial! Has dominado las multiplicaciones grandes 🧠🎉', cls: 'feedback-correct' });
      setActiveSlot(null);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    } else {
      setFeedback({ text: 'Revisa los números en rojo.', cls: 'feedback-incorrect' });
    }
  };

  // --- UI ---
  const ancho = 7;
  const n1Str = multiplicando.toString().padStart(ancho, ' ');
  const n2Str = multiplicador.toString().padStart(ancho, ' ');

  const getHighlightStyle = (section, c) => {
    if (!ayudaLlevadas || !activeSlot) return {};
    const style = { backgroundColor: '#e0f2fe', transition: 'background-color 0.2s', borderRadius: '4px' };
    let activeRowOffset = -1;
    if (activeSlot.type === 'fila1') activeRowOffset = 0;
    if (activeSlot.type === 'fila2') activeRowOffset = 1;
    if (activeSlot.type === 'fila3') activeRowOffset = 2;

    if (activeRowOffset !== -1) {
      if (section === 'n1' && c === activeSlot.index + activeRowOffset && n1Str[c] !== ' ') return style;
      if (section === 'n2' && c === (ancho - 1 - activeRowOffset)) return style;
    }
    if (activeSlot.type === 'filaSuma' && (section === 'fila1' || section === 'fila2' || section === 'fila3') && c === activeSlot.index && solucion[section][c] !== "") return style;
    return {};
  };

  const colStyle = { display: 'grid', gridTemplateColumns: `repeat(${ancho}, 1fr)`, gap: '5px', maxWidth: '450px', margin: '0 auto' };

  const renderCells = () => {
    const cells = [];
    for (let c = 0; c < ancho; c++) {
      cells.push(<div key={`carryMul-${c}`} className={`box carry-box ${!ayudaLlevadas ? 'invisible' : ''}`} style={{ gridRow: 1, gridColumn: c + 1 }}>{ayudaLlevadas ? entradas.llevadasMul[c] : ''}</div>);
    }
    for (let c = 0; c < ancho; c++) {
      cells.push(<div key={`n1-${c}`} className="digit-display" style={{ gridRow: 2, gridColumn: c + 1, ...getHighlightStyle('n1', c) }}>{n1Str[c]}</div>);
    }
    let xPuesto = false;
    for (let c = 0; c < ancho; c++) {
      let content = n2Str[c];
      if (content !== ' ' && !xPuesto) { content = <><span className="cross-inline" style={{ position: 'absolute', left: '-15px' }}>×</span>{n2Str[c]}</>; xPuesto = true; }
      cells.push(<div key={`n2-${c}`} className="digit-display" style={{ gridRow: 3, gridColumn: c + 1, position: 'relative', ...getHighlightStyle('n2', c) }}>{content}</div>);
    }
    cells.push(<hr key="hr1" className="operation-line" style={{ gridRow: 4, gridColumn: '1 / -1' }} />);

    ['fila1', 'fila2', 'fila3'].forEach((fila, idx) => {
      const rowNum = 5 + idx;
      for (let c = 0; c < ancho; c++) {
        const enabled = solucion[fila][c] !== "";
        cells.push(
          <div key={`${fila}-${c}`} className={`box result-box ${!enabled ? 'disabled' : ''} ${clases[fila][c] || ''} ${activeSlot?.type === fila && activeSlot?.index === c ? 'selected' : ''}`}
            onClick={() => enabled && handleSlotClick(fila, c)} style={{ gridRow: rowNum, gridColumn: c + 1, ...getHighlightStyle(fila, c) }}>
            {entradas[fila][c]}
          </div>
        );
      }
    });

    cells.push(<hr key="hr2" className="operation-line" style={{ gridRow: 8, gridColumn: '1 / -1' }} />);
    for (let c = 0; c < ancho; c++) {
      cells.push(<div key={`carrySum-${c}`} className={`box carry-box ${c >= 6 ? 'invisible' : ''} ${!ayudaLlevadas ? 'hidden-by-toggle' : ''}`} style={{ gridRow: 9, gridColumn: c + 1 }}>{entradas.llevadasSuma[c]}</div>);
    }
    for (let c = 0; c < ancho; c++) {
      const enabled = solucion.suma[c] !== "";
      cells.push(
        <div key={`sum-${c}`} className={`box result-box ${!enabled ? 'disabled' : ''} ${clases.filaSuma[c] || ''} ${activeSlot?.type === 'filaSuma' && activeSlot?.index === c ? 'selected' : ''}`}
          onClick={() => enabled && handleSlotClick('filaSuma', c)} style={{ gridRow: 10, gridColumn: c + 1 }}>
          {entradas.filaSuma[c]}
        </div>
      );
    }
    return cells;
  };

  return (
    <MathOperationLayout
      title="Multiplicaciones de 3 cifras"
      emoji="✖️"
      feedback={feedback}
      onCheck={comprobarRespuesta}
      onNew={generarNueva}
      newLabel="Nueva"
      toggleLabel={!isTestMode ? "Ayuda con llevadas" : undefined}
      toggleValue={ayudaLlevadas}
      onToggleChange={setAyudaLlevadas}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Toca los números 👇"
      onGameComplete={onGameComplete}
      isTestMode={isTestMode}
      setTestMode={setIsTestMode}
      testState={{
        currentQuestionIndex,
        totalQuestions: TOTAL_TEST_QUESTIONS,
        showResults,
        score,
        testQuestions,
        userAnswers,
      }}
      actions={{
        startPractice: () => { setIsTestMode(false); setShowResults(false); generarNueva(); },
        startTest,
        nextQuestion: nextTestQuestion,
        exitTest,
      }}
      calculateExpected={(q) => (parseInt(q[0]) * parseInt(q[1])).toString()}
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Completa la multiplicacion colocando cada digito en su casilla correcta, incluyendo los resultados parciales y el resultado final.</p>
          <h3>Como se juega</h3>
          <ul>
            <li>Pulsa en una casilla vacia para seleccionarla.</li>
            <li>Coloca el digito correcto desde la paleta numerica.</li>
            <li>Recuerda completar tambien las llevadas si estan visibles.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 multiplicaciones de 4 × 3 cifras. Escribe directamente el resultado final.</p>
        </>
      }
    >
      {isTestMode ? (
        <MultiplicacionTestBoard
          multiplicando={multiplicando}
          multiplicador={multiplicador}
          resultSlots={testResultSlots}
          activeSlotIndex={testActiveIdx}
          onSlotClick={(i) => setTestActiveIdx(i)}
        />
      ) : (
        <div id="problem-area" style={{ ...colStyle, gridTemplateRows: 'repeat(10, auto)' }}>
          {renderCells()}
        </div>
      )}
    </MathOperationLayout>
  );
}
