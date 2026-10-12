import React, { useEffect, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";
import MathOperationLayout from '../../_shared/MathOperationLayout';
import MultiplicacionTestBoard from '../../_shared/MultiplicacionTestBoard';
import { OpBoard, OpNum, OpCell, OpCarry, OpSign, OpRule } from '../OpTablero';

const TOTAL_TEST_QUESTIONS = 5;

export default function MultiplicacionesPrimaria4({ onGameComplete } = {}) {
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [solucion, setSolucion] = useState({ fila1: [], llevadas1: [], fila2: [], llevadas2: [], suma: [], llevadasSuma: [] });
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);
  const [entradas, setEntradas] = useState({ fila1: [], fila2: [], filaSuma: [], llevadasMul: [], llevadasSuma: [] });
  const [clases, setClases] = useState({ fila1: [], fila2: [], filaSuma: [], llevadasMul: [], llevadasSuma: [] });
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
    return { digitos, llevadas: llevadas.map(l => l > 0 ? l.toString() : "") };
  };

  const generarNueva = useCallback(() => {
    const n1 = generarNumero(3);
    const n2 = generarNumero(2);
    const digitoUnidades = n2 % 10;
    const digitoDecenas = Math.floor(n2 / 10);
    const prod1 = calcularFilaProducto(n1, digitoUnidades);
    const prod2 = calcularFilaProducto(n1, digitoDecenas);
    const total = n1 * n2;
    const totalStr = total.toString();
    const anchoTotal = 6;

    const alinear = (arr, shiftRight) => {
      const res = new Array(anchoTotal).fill("");
      for (let i = 0; i < arr.length; i++) {
        const val = arr[arr.length - 1 - i];
        if (val !== undefined && val !== "") res[anchoTotal - 1 - shiftRight - i] = val;
      }
      return res;
    };

    const fila1Alineada = alinear(prod1.digitos, 0);
    const fila2Alineada = alinear(prod2.digitos, 1);
    const sumaAlineada = alinear(totalStr.split(''), 0);
    const llevadasSuma = new Array(anchoTotal).fill("");
    let acarreoSuma = 0;
    for (let i = anchoTotal - 1; i > 0; i--) {
      const s = parseInt(fila1Alineada[i] || "0") + parseInt(fila2Alineada[i] || "0") + acarreoSuma;
      acarreoSuma = Math.floor(s / 10);
      if (acarreoSuma > 0) llevadasSuma[i - 1] = acarreoSuma.toString();
    }

    setMultiplicando(n1);
    setMultiplicador(n2);
    setSolucion({ fila1: fila1Alineada, llevadas1: prod1.llevadas, fila2: fila2Alineada, llevadas2: prod2.llevadas, suma: sumaAlineada, llevadasSuma });
    const vacio = () => new Array(anchoTotal).fill("");
    const vacioMul = () => new Array(4).fill("");
    setEntradas({ fila1: vacio(), fila2: vacio(), filaSuma: vacio(), llevadasMul: vacioMul(), llevadasSuma: vacio() });
    setClases({ fila1: vacio(), fila2: vacio(), filaSuma: vacio(), llevadasMul: vacioMul(), llevadasSuma: vacio() });
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'fila1', index: anchoTotal - 1 });
  }, []);

  useEffect(() => { generarNueva(); }, [generarNueva]);

  // --- Test mode helpers ---
  const generarParTest = useCallback(() => {
    const n1 = generarNumero(3);
    const n2 = generarNumero(2);
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
      if (type === 'fila1') {
        const targetValue = solucion.fila1[index];
        const posDesdeDerecha = 5 - index;
        const idxLlevada = 3 - posDesdeDerecha;
        if (strVal === targetValue && idxLlevada > 0) {
          const llevadaReal = solucion.llevadas1[idxLlevada - 1] || "0";
          setEntradas(prev => ({ ...prev, llevadasMul: prev.llevadasMul.map((v, i) => i === idxLlevada - 1 ? llevadaReal : v) }));
        }
      } else if (type === 'fila2') {
        const targetValue = solucion.fila2[index];
        const posDesdeDerecha = (5 - index) - 1;
        const idxLlevada = 3 - posDesdeDerecha;
        if (strVal === targetValue && idxLlevada > 0) {
          const llevadaReal = solucion.llevadas2[idxLlevada - 1] || "0";
          setEntradas(prev => ({ ...prev, llevadasMul: prev.llevadasMul.map((v, i) => i === idxLlevada - 1 ? llevadaReal : v) }));
        }
      } else if (type === 'filaSuma') {
        if (strVal === solucion.suma[index] && index - 1 >= 0) {
          const llevadaSuma = solucion.llevadasSuma[index - 1] || "0";
          setEntradas(prev => ({ ...prev, llevadasSuma: prev.llevadasSuma.map((v, i) => i === index - 1 ? llevadaSuma : v) }));
        }
      }
    }

    // Auto-advance
    const prevIndex = index - 1;
    let hasMoreInRow = false;
    if (type === 'fila1' && solucion.fila1[prevIndex]) hasMoreInRow = true;
    if (type === 'fila2' && solucion.fila2[prevIndex]) hasMoreInRow = true;
    if (type === 'filaSuma' && solucion.suma[prevIndex]) hasMoreInRow = true;

    if (hasMoreInRow) {
      setActiveSlot({ type, index: prevIndex });
    } else {
      if (type === 'fila1') { setEntradas(prev => ({ ...prev, llevadasMul: new Array(4).fill("") })); setActiveSlot({ type: 'fila2', index: 4 }); }
      else if (type === 'fila2') { setEntradas(prev => ({ ...prev, llevadasMul: new Array(4).fill("") })); setActiveSlot({ type: 'filaSuma', index: 5 }); }
      else setActiveSlot(null);
    }
  };

  const comprobarRespuesta = () => {
    let correcto = true;
    const nuevasClases = { ...clases };
    solucion.fila1.forEach((val, i) => { if (!val) return; if (entradas.fila1[i] === val) nuevasClases.fila1[i] = 'correct'; else { nuevasClases.fila1[i] = 'incorrect'; correcto = false; } });
    solucion.fila2.forEach((val, i) => { if (!val) return; if (entradas.fila2[i] === val) nuevasClases.fila2[i] = 'correct'; else { nuevasClases.fila2[i] = 'incorrect'; correcto = false; } });
    solucion.suma.forEach((val, i) => { if (!val) return; if (entradas.filaSuma[i] === val) nuevasClases.filaSuma[i] = 'correct'; else { nuevasClases.filaSuma[i] = 'incorrect'; correcto = false; } });
    setClases(nuevasClases);

    if (correcto) {
      setFeedback({ text: '¡Excelente! Operación completa y correcta 🎉', cls: 'feedback-correct' });
      setActiveSlot(null);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } else {
      setFeedback({ text: 'Hay errores en las casillas rojas. Revisa paso a paso.', cls: 'feedback-incorrect' });
    }
  };

  // --- UI ---
  // Rejilla: columna 1 = signos (× y +); columnas 2..7 = cifras.
  const ancho = 6;
  const n1Str = multiplicando.toString().padStart(ancho, ' ');
  const n2Str = multiplicador.toString().padStart(ancho, ' ');

  // Ayuda visual: cifras que intervienen en la casilla activa (mismas reglas de antes).
  const isFocus = (section, c) => {
    if (!ayudaLlevadas || !activeSlot) return false;
    if (activeSlot.type === 'fila1') {
      if (section === 'n1' && c === activeSlot.index && n1Str[c] !== ' ') return true;
      if (section === 'n2' && c === 5) return true;
    }
    if (activeSlot.type === 'fila2') {
      if (section === 'n1' && c === activeSlot.index + 1 && n1Str[c] !== ' ') return true;
      if (section === 'n2' && c === 4) return true;
    }
    if (activeSlot.type === 'filaSuma') {
      if ((section === 'fila1' || section === 'fila2') && c === activeSlot.index) {
        if (section === 'fila1' && solucion.fila1[c] !== "") return true;
        if (section === 'fila2' && solucion.fila2[c] !== "") return true;
      }
    }
    return false;
  };

  const at = (row, c) => ({ gridRow: row, gridColumn: c + 2 });
  const cols = Array.from({ length: ancho }, (_, c) => c);

  // Llevadas: solo se muestran (se escriben solas al acertar con la ayuda activada).
  const renderCells = () => (
    <>
      {cols.map((c) => {
        const idxArr = c - 2;
        const visible = idxArr >= 0 && idxArr < 4;
        return (
          <OpCarry
            key={`carryMul-${c}`}
            at={at(1, c)}
            ghost
            off={!visible || !ayudaLlevadas}
            value={visible ? entradas.llevadasMul[idxArr] : ''}
          />
        );
      })}
      {cols.map((c) => <OpNum key={`n1-${c}`} at={at(2, c)} focus={isFocus('n1', c)}>{n1Str[c].trim()}</OpNum>)}
      <OpSign op="mul" at={{ gridRow: 3, gridColumn: 1 }} />
      {cols.map((c) => (
        <OpNum key={`n2-${c}`} at={at(3, c)} focus={isFocus('n2', c)} row={n2Str[c] !== ' ' ? String(ancho - c) : undefined}>
          {n2Str[c].trim()}
        </OpNum>
      ))}
      <OpRule at={{ gridRow: 4, gridColumn: '1 / -1' }} />
      {cols.map((c) => {
        const enabled = solucion.fila1[c] !== "";
        return (
          <OpCell
            key={`p1-${c}`}
            at={at(5, c)}
            i={c}
            row="1"
            value={entradas.fila1[c]}
            state={clases.fila1[c]}
            off={!enabled}
            focus={isFocus('fila1', c)}
            active={activeSlot?.type === 'fila1' && activeSlot?.index === c}
            onClick={() => enabled && handleSlotClick('fila1', c)}
          />
        );
      })}
      <OpSign op="add" at={{ gridRow: 6, gridColumn: 1 }} />
      {cols.map((c) => {
        const enabled = solucion.fila2[c] !== "";
        return (
          <OpCell
            key={`p2-${c}`}
            at={at(6, c)}
            i={c}
            row="2"
            value={entradas.fila2[c]}
            state={clases.fila2[c]}
            off={!enabled}
            focus={isFocus('fila2', c)}
            active={activeSlot?.type === 'fila2' && activeSlot?.index === c}
            onClick={() => enabled && handleSlotClick('fila2', c)}
          />
        );
      })}
      <OpRule at={{ gridRow: 7, gridColumn: '1 / -1' }} />
      {cols.map((c) => (
        <OpCarry
          key={`carrySum-${c}`}
          at={at(8, c)}
          ghost
          off={c >= 5 || !ayudaLlevadas}
          value={entradas.llevadasSuma[c]}
        />
      ))}
      {cols.map((c) => {
        const enabled = solucion.suma[c] !== "";
        return (
          <OpCell
            key={`sum-${c}`}
            at={at(9, c)}
            i={c}
            stamp
            value={entradas.filaSuma[c]}
            state={clases.filaSuma[c]}
            off={!enabled}
            active={activeSlot?.type === 'filaSuma' && activeSlot?.index === c}
            onClick={() => enabled && handleSlotClick('filaSuma', c)}
          />
        );
      })}
    </>
  );

  return (
    <MathOperationLayout
      title="Multiplica por 2 cifras"
      emoji="✖️"
      feedback={feedback}
      onCheck={comprobarRespuesta}
      onNew={generarNueva}
      newLabel="Nueva"
      toggleLabel={!isTestMode ? "Ayuda con llevadas" : undefined}
      toggleValue={ayudaLlevadas}
      onToggleChange={setAyudaLlevadas}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Toca un número"
      padLayout="side"
      operator="×"
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
          <p>Completa la multiplicación: los dos productos parciales y su suma, que es el resultado final.</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla para elegirla (se ilumina) y escribe la cifra con el teclado de la pantalla o con el del ordenador.</li>
            <li>La primera fila (azul) es el multiplicando por las unidades; la segunda (rosa), por las decenas, corrida un lugar a la izquierda.</li>
            <li>Con <strong>Ayuda con llevadas</strong> se iluminan las cifras que estás multiplicando y las llevadas aparecen solas en monedas doradas.</li>
            <li>Pulsa <strong>Comprobar</strong>: cada casilla se pone en verde o en rojo.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 multiplicaciones de 3 × 2 cifras. Escribe directamente el resultado final.</p>
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
        <OpBoard>
          <div
            className="op-grid mx-grid"
            style={{ '--units': 1.6 + ancho * 1.14, gridTemplateColumns: `calc(var(--cell) * .8) repeat(${ancho}, var(--cell))` }}
          >
            {renderCells()}
          </div>
        </OpBoard>
      )}
    </MathOperationLayout>
  );
}
