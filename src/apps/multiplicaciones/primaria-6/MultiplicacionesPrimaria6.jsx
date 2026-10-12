import React, { useEffect, useMemo, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";
import MathOperationLayout from '../../_shared/MathOperationLayout';
import MultiplicacionTestBoard from '../../_shared/MultiplicacionTestBoard';
import { OpBoard, OpNum, OpCell, OpCarry, OpSign, OpRule, OpComma } from '../OpTablero';

const TOTAL_TEST_QUESTIONS = 5;

/* 6º Primaria: Multiplicación con decimales + UI Mejorada (Fuentes Grandes) */

export default function MultiplicacionesPrimaria6({ onGameComplete } = {}) {
  // --- Estados Principales ---
  const [multiplicando, setMultiplicando] = useState("");
  const [multiplicador, setMultiplicador] = useState("");
  const [d1, setD1] = useState(0); 
  const [d2, setD2] = useState(0); 
  const [decimalesTotal, setDecimalesTotal] = useState(0); 

  // Datos Esperados
  const [parcialesEsperados, setParcialesEsperados] = useState([]); 
  const [resultadoFinalEsperado, setResultadoFinalEsperado] = useState([]); 
  const [llevadasSumaEsperadas, setLlevadasSumaEsperadas] = useState([]); 

  // Entradas del Alumno
  const [entradasParciales, setEntradasParciales] = useState([]); 
  const [entradasLlevadas, setEntradasLlevadas] = useState([]);   
  const [entradasFinal, setEntradasFinal] = useState([]);         
  const [entradasLlevadasSuma, setEntradasLlevadasSuma] = useState([]); 

  // Estados Visuales
  const [clasesParciales, setClasesParciales] = useState([]);
  const [clasesLlevadas, setClasesLlevadas] = useState([]);
  const [clasesFinal, setClasesFinal] = useState([]);
  const [clasesLlevadasSuma, setClasesLlevadasSuma] = useState([]);

  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);
  
  // Control de foco y Coma
  const [activeSlot, setActiveSlot] = useState(null);
  const [commaSlot, setCommaSlot] = useState(null);

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

  // ---------- Generación y Cálculo ----------
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generarPorTotalYDec = (totalDigits, decLen) => {
    const intLen = totalDigits - decLen;
    let intStr = String(randInt(1, 9));
    for (let i = 1; i < intLen; i++) intStr += String(randInt(0, 9));
    if (decLen === 0) return { texto: intStr, dec: 0 };
    let decStr = "";
    for (let i = 0; i < decLen; i++) decStr += String(randInt(0, 9));
    return { texto: `${intStr}.${decStr}`, dec: decLen };
  };

  const prepararMultiplicacion = (m1, m2) => {
    const d1 = (m1.split(".")[1] || "").length;
    const d2 = (m2.split(".")[1] || "").length;
    const n1 = parseInt(m1.replace(".", ""), 10);
    const n2 = parseInt(m2.replace(".", ""), 10);
    return { n1, n2, d1, d2, decimales: d1 + d2 };
  };

  const calcularParciales = (n1, n2) => {
    const t1 = n1.toString();
    const t2 = n2.toString();
    const ancho = t1.length + t2.length;

    const m1 = new Array(ancho).fill(0);
    for (let i = 0; i < t1.length; i++) m1[ancho - t1.length + i] = parseInt(t1[i], 10);

    const digM2 = t2.split("").map((d) => parseInt(d, 10)).reverse(); 
    const parciales = [];

    for (let r = 0; r < digM2.length; r++) {
      const dMult = digM2[r];
      const fila = new Array(ancho).fill("");
      const llevadasCrudas = new Array(ancho).fill(0);
      let acarreo = 0;
      
      for (let c = ancho - 1; c >= 0; c--) {
        const idx = c + r; 
        const dMulcdo = idx < ancho ? m1[idx] : 0;
        const prod = dMulcdo * dMult + acarreo;
        fila[c] = (prod % 10).toString();
        llevadasCrudas[c] = Math.floor(prod / 10);
        acarreo = llevadasCrudas[c];
      }
      
      const llevadas = new Array(ancho).fill("");
      for (let c = 0; c < ancho; c++) {
        const origen = c + 1;
        const val = origen < ancho ? llevadasCrudas[origen] : 0;
        llevadas[c] = val.toString(); 
      }

      for (let k = 0; k < r; k++) {
        fila[ancho - 1 - k] = "";
        llevadas[ancho - 1 - k] = ""; 
      }
      
      let started = false;
      for (let c = 0; c < ancho; c++) {
        if (!started) {
          if (fila[c] === "0" || fila[c] === "") fila[c] = "";
          else started = true;
        }
      }
      parciales.push({ digitos: fila, llevadas });
    }
    return parciales;
  };

  const sumarParciales = (parciales) => {
    if (parciales.length === 0) return { resultado: [], llevadas: [] };
    const ancho = parciales[0].digitos.length;
    const res = new Array(ancho).fill("0");
    const llevadas = new Array(ancho).fill(""); 
    let acarreo = 0;
    
    for (let c = ancho - 1; c >= 0; c--) {
      let suma = acarreo;
      for (let r = 0; r < parciales.length; r++) {
        const d = parciales[r].digitos[c];
        suma += d === "" ? 0 : parseInt(d, 10);
      }
      res[c] = (suma % 10).toString();
      acarreo = Math.floor(suma / 10);
      
      if (c > 0 && acarreo > 0) {
          llevadas[c - 1] = acarreo.toString();
      }
    }
    return { resultado: res, llevadas };
  };

  const generarNueva = useCallback(() => {
    const totalB = randInt(2, 3);
    let decB = randInt(0, totalB - 1);
    const totalA = randInt(3, 5);
    let decA = randInt(0, totalA - 1);
    
    if (decA === 0 && decB === 0) {
      if (totalB >= 2) decB = 1; else decA = 1;
    }

    const A = generarPorTotalYDec(totalA, decA);
    const B = generarPorTotalYDec(totalB, decB);

    const { n1, n2, d1, d2, decimales } = prepararMultiplicacion(A.texto, B.texto);
    const parciales = calcularParciales(n1, n2);
    const { resultado, llevadas: llevadasSuma } = sumarParciales(parciales);

    setMultiplicando(A.texto);
    setMultiplicador(B.texto);
    setD1(d1);
    setD2(d2);
    setDecimalesTotal(decimales);
    setParcialesEsperados(parciales);
    setResultadoFinalEsperado(resultado);
    setLlevadasSumaEsperadas(llevadasSuma);

    const filas = parciales.length;
    const cols = parciales[0].digitos.length;
    
    setEntradasParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasFinal(new Array(cols).fill(""));
    setEntradasLlevadasSuma(new Array(cols).fill(""));

    setClasesParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesFinal(new Array(cols).fill(""));
    setClasesLlevadasSuma(new Array(cols).fill(""));

    setCommaSlot(null);
    setFeedback({ texto: "", tipo: "" });
    
    let lastCol = cols - 1;
    setActiveSlot({ type: 'parcial', row: 0, col: lastCol });

  }, []);

  useEffect(() => { generarNueva(); }, [generarNueva]);

  // --- Test mode helpers (enteros 3x3 para 6º, sin decimales para simplificar) ---
  const generarParTest = useCallback(() => {
    const n1 = randInt(100, 999);
    const n2 = randInt(100, 999);
    return [n1.toString(), n2.toString()];
  }, []);

  const prepareTestQuestion = (pair) => {
    const [a, b] = pair;
    const producto = parseInt(a) * parseInt(b);
    const len = producto.toString().length;
    setTestN1(parseInt(a));
    setTestN2(parseInt(b));
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

  // ---------- UI Helpers ----------
  const ancho = resultadoFinalEsperado.length || 0;

  const mulcdoRelleno = useMemo(() => {
    if (!multiplicando) return [];
    const n1 = multiplicando.replace(".", "");
    const arr = new Array(ancho).fill("");
    for (let i = 0; i < n1.length; i++) arr[ancho - n1.length + i] = n1[i];
    return arr;
  }, [multiplicando, ancho]);

  const mulcdrRelleno = useMemo(() => {
    if (!multiplicador) return [];
    const n2 = multiplicador.replace(".", "");
    const arr = new Array(ancho).fill("");
    for (let i = 0; i < n2.length; i++) arr[ancho - n2.length + i] = n2[i];
    return arr;
  }, [multiplicador, ancho]);

  // Ayuda visual: cifras que intervienen en la casilla activa (mismas reglas de antes).
  const isFocus = (section, idx, r_idx) => {
    if (!ayudaLlevadas || !activeSlot) return false;

    // Fases de Multiplicación
    if (activeSlot.type === 'parcial') {
        const activeRow = activeSlot.row;
        const digitosMultReales = multiplicador.replace('.','').length;
        const offsetMult = (ancho - digitosMultReales) + (digitosMultReales - 1 - activeRow);

        if (section === 'mulcdr' && idx === offsetMult) return true;
        if (section === 'mulcdo' && idx === (activeSlot.col + activeRow)) {
             if (mulcdoRelleno[idx]) return true;
        }
    }

    // Fase Suma Final
    if (activeSlot.type === 'final') {
        if (section === 'parcial' && idx === activeSlot.col) {
             if (parcialesEsperados[r_idx].digitos[idx] !== "") return true;
        }
    }

    return false;
  };

  // ---------- Manejadores ----------
  
  const handleSlotClick = (type, row, col) => {
    setActiveSlot({ type, row, col });
  };

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
    const { type, row, col } = activeSlot;

    // 1. Actualizar Valor
    if (type === 'parcial') {
        setEntradasParciales(prev => { const n = prev.map(r => [...r]); n[row][col] = strVal; return n; });
        setClasesParciales(prev => { const n = prev.map(r => [...r]); n[row][col] = ""; return n; });
    } else if (type === 'llevada') {
        setEntradasLlevadas(prev => { const n = prev.map(r => [...r]); n[row][col] = strVal; return n; });
        setClasesLlevadas(prev => { const n = prev.map(r => [...r]); n[row][col] = ""; return n; });
    } else if (type === 'final') {
        setEntradasFinal(prev => { const n = [...prev]; n[col] = strVal; return n; });
        setClasesFinal(prev => { const n = [...prev]; n[col] = ""; return n; });
    } else if (type === 'llevadaSuma') {
        setEntradasLlevadasSuma(prev => { const n = [...prev]; n[col] = strVal; return n; });
        setClasesLlevadasSuma(prev => { const n = [...prev]; n[col] = ""; return n; });
    }

    // 2. Auto-Llevadas
    if (ayudaLlevadas) {
        if (type === 'parcial') {
            const esperado = parcialesEsperados[row].digitos[col];
            if (strVal === esperado) {
                const colLlevada = col - 1;
                if (colLlevada >= 0) {
                    const llevadaVal = parcialesEsperados[row].llevadas[colLlevada] || "0";
                    setEntradasLlevadas(prev => {
                        const n = prev.map(r => [...r]);
                        n[row][colLlevada] = llevadaVal;
                        return n;
                    });
                }
            }
        }
        if (type === 'final') {
            const esperado = resultadoFinalEsperado[col];
            if (strVal === esperado) {
                const colLlevada = col - 1;
                if (colLlevada >= 0) {
                    const llevadaVal = llevadasSumaEsperadas[colLlevada] || "0";
                    setEntradasLlevadasSuma(prev => {
                        const n = [...prev];
                        n[colLlevada] = llevadaVal;
                        return n;
                    });
                }
            }
        }
    }

    // 3. Auto-Avance
    const avanzar = () => {
        const prevCol = col - 1;
        
        const limpiarLlevadas = (rIndex) => {
             setEntradasLlevadas(prev => {
                 const n = prev.map(row => [...row]);
                 n[rIndex] = new Array(ancho).fill(""); 
                 return n;
             });
        };

        if (type === 'parcial') {
            const moreInRow = parcialesEsperados[row].digitos[prevCol] !== undefined && parcialesEsperados[row].digitos[prevCol] !== "";
            if (moreInRow) {
                setActiveSlot({ type, row, col: prevCol });
            } else {
                const nextRow = row + 1;
                if (nextRow < parcialesEsperados.length) {
                    limpiarLlevadas(row);
                    setActiveSlot({ type: 'parcial', row: nextRow, col: ancho - 1 - nextRow });
                } else {
                    limpiarLlevadas(row);
                    setActiveSlot({ type: 'final', row: 0, col: ancho - 1 }); 
                }
            }
        } else if (type === 'final') {
            if (prevCol >= 0) setActiveSlot({ type: 'final', row: 0, col: prevCol });
            else setActiveSlot(null);
        } else if (type === 'llevadaSuma') {
             setActiveSlot({ type: 'final', row: 0, col: col }); 
        } else {
            setActiveSlot(null);
        }
    };
    avanzar();
  };

  const comprobarRespuesta = () => {
    let ok = true, okLlevadas = true;

    // Validar Parciales
    const nuevasClasesPar = parcialesEsperados.map((fila, r) => 
        fila.digitos.map((esp, c) => {
            if (esp === "") return "";
            const val = entradasParciales[r][c];
            if (val === esp) return "correct";
            ok = false; return "incorrect";
        })
    );

    // Validar Final
    const primeraNoCero = resultadoFinalEsperado.findIndex(d => d !== "0");
    const nuevasClasesFin = resultadoFinalEsperado.map((esp, c) => {
        const val = entradasFinal[c];
        const esRelleno = primeraNoCero === -1 || c < primeraNoCero;
        if (esRelleno) {
            return (val === "" || val === "0") ? "correct" : "incorrect";
        }
        if (val === esp) return "correct";
        ok = false; return "incorrect";
    });

    // Validar Llevadas Suma
    const nuevasClasesLevSuma = llevadasSumaEsperadas.map((esp, c) => {
        if (!ayudaLlevadas) return "";
        const val = entradasLlevadasSuma[c];
        const expected = esp || "0";
        const written = val || "0"; 
        if (written === expected) return "correct";
        if (expected === "0" && val === "") return "correct";
        okLlevadas = false; return "incorrect";
    });

    // Validar Coma
    const expectedCommaSlot = decimalesTotal > 0 ? (ancho - decimalesTotal) : null;
    let okComma = true;
    if (decimalesTotal > 0) {
      if (commaSlot !== expectedCommaSlot) { ok = false; okComma = false; }
    } else {
      if (commaSlot !== null) { ok = false; okComma = false; }
    }

    setClasesParciales(nuevasClasesPar);
    setClasesFinal(nuevasClasesFin);
    setClasesLlevadasSuma(nuevasClasesLevSuma);

    if (ok) {
      if (!ayudaLlevadas || okLlevadas) {
          setFeedback({ texto: "¡Multiplicación con decimales correcta! 🧠🎉", tipo: "feedback-correct" });
          setActiveSlot(null);
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      } else {
          setFeedback({ texto: "Resultado correcto, revisa las llevadas de la suma.", tipo: "feedback-incorrect" });
      }
    } else {
      let msg = "Revisa los números en rojo.";
      if (!okComma) msg += " La coma no está en su sitio.";
      setFeedback({ texto: msg, tipo: "feedback-incorrect" });
    }
  };

  // ---------- Renderizado ----------
  // Una sola rejilla para todo: columna 1 = signos; después, para cada cifra,
  // una ranura estrecha (coma) y la columna de la cifra; al final, la última
  // ranura. Así las comas de los factores, los productos parciales y el
  // resultado quedan alineados.
  const nParciales = parcialesEsperados.length;
  const slotCol = (s) => 2 + 2 * s;          // ranura de coma s (0..ancho)
  const digitCol = (c) => 3 + 2 * c;         // cifra c (0..ancho-1)
  const cols = Array.from({ length: ancho }, (_, c) => c);

  // Fila de llevadas de la multiplicación (la de la fila parcial activa)
  let currentRowIdx = -1;
  if (activeSlot && (activeSlot.type === 'parcial' || activeSlot.type === 'llevada')) {
      currentRowIdx = activeSlot.row;
  }
  const showCarryBox = ayudaLlevadas && (currentRowIdx !== -1);

  // Fila de cada cifra del multiplicador (unidades = 1, decenas = 2…), para el color.
  const filaDeCifra = (c) => (mulcdrRelleno[c] ? String(ancho - c) : undefined);

  // Tras comprobar, la coma elegida se pinta verde o roja (solo visual).
  const comprobado = clasesFinal.some(Boolean);
  const comaEsperada = decimalesTotal > 0 ? (ancho - decimalesTotal) : null;

  const rFinal = 7 + nParciales;
  const resultGridColumns = `calc(var(--cell) * .8) repeat(${ancho}, var(--slot) var(--cell)) var(--slot)`;

  return (
    <MathOperationLayout
      title="Multiplica con decimales"
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
          <p>Multiplica como si no hubiera comas y coloca la coma en el resultado: lleva tantas cifras decimales como los dos factores juntos.</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla para elegirla (se ilumina) y escribe la cifra con el teclado de la pantalla o con el del ordenador.</li>
            <li>Cada fila de color es el multiplicando por una cifra del multiplicador (la del mismo color).</li>
            <li>En el resultado, toca el punto que hay entre dos casillas para poner (o quitar) la coma.</li>
            <li>Con <strong>Ayuda con llevadas</strong> se iluminan las cifras que intervienen y las llevadas aparecen solas en monedas doradas.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 multiplicaciones de 3 × 3 cifras (números enteros). Escribe directamente el resultado final.</p>
        </>
      }
    >
      {isTestMode ? (
        <MultiplicacionTestBoard
          multiplicando={testN1}
          multiplicador={testN2}
          resultSlots={testResultSlots}
          activeSlotIndex={testActiveIdx}
          onSlotClick={(i) => setTestActiveIdx(i)}
        />
      ) : (
      <OpBoard>
        <div
          className="op-grid mx-grid mx-grid--dec"
          style={{ '--n': ancho, gridTemplateColumns: resultGridColumns }}
        >
          {/* Llevadas de la multiplicación (fila parcial activa) */}
          {cols.map((c) => (
            <OpCarry
              key={`carry-${c}`}
              at={{ gridRow: 1, gridColumn: digitCol(c) }}
              off={!showCarryBox}
              value={showCarryBox ? (entradasLlevadas[currentRowIdx]?.[c] || "") : ""}
              state={showCarryBox ? (clasesLlevadas[currentRowIdx]?.[c] || "") : ""}
              active={activeSlot?.type === 'llevada' && activeSlot?.col === c}
              onClick={() => showCarryBox && handleSlotClick('llevada', currentRowIdx, c)}
            />
          ))}

          {/* Multiplicando (con su coma) */}
          {cols.map((c) => (
            <OpNum key={`mulcdo-${c}`} at={{ gridRow: 2, gridColumn: digitCol(c) }} focus={isFocus('mulcdo', c)}>
              {mulcdoRelleno[c] || ""}
            </OpNum>
          ))}
          {d1 > 0 && <OpComma at={{ gridRow: 2, gridColumn: slotCol(ancho - d1) }} />}

          {/* Multiplicador (con su coma) */}
          <OpSign op="mul" at={{ gridRow: 3, gridColumn: 1 }} />
          {cols.map((c) => (
            <OpNum key={`mulcdr-${c}`} at={{ gridRow: 3, gridColumn: digitCol(c) }} focus={isFocus('mulcdr', c)} row={filaDeCifra(c)}>
              {mulcdrRelleno[c] || ""}
            </OpNum>
          ))}
          {d2 > 0 && <OpComma at={{ gridRow: 3, gridColumn: slotCol(ancho - d2) }} />}

          <OpRule at={{ gridRow: 4, gridColumn: '1 / -1' }} />

          {/* Productos parciales */}
          {parcialesEsperados.map((fila, r) => cols.map((c) => {
            const enabled = fila.digitos[c] !== "";
            return (
              <OpCell
                key={`parcial-${r}-${c}`}
                at={{ gridRow: 5 + r, gridColumn: digitCol(c) }}
                i={c}
                row={String(Math.min(r + 1, 3))}
                value={entradasParciales[r]?.[c] || ""}
                state={clasesParciales[r]?.[c] || ""}
                off={!enabled}
                focus={isFocus('parcial', c, r)}
                active={activeSlot?.type === 'parcial' && activeSlot.row === r && activeSlot.col === c}
                onClick={() => enabled && handleSlotClick('parcial', r, c)}
              />
            );
          }))}
          {/* Producto parcial por 0: la fila queda sin cifras */}
          {parcialesEsperados.map((fila, r) => (fila.digitos.every((d) => d === "") ? (
            <span
              key={`cero-${r}`}
              className="mx-zero"
              data-row={String(Math.min(r + 1, 3))}
              style={{ gridRow: 5 + r, gridColumn: `2 / ${digitCol(Math.max(1, ancho - 3))}` }}
            >
              × 0 = 0 · esta fila se deja en blanco
            </span>
          ) : null))}
          {nParciales > 1 && <OpSign op="add" at={{ gridRow: 4 + nParciales, gridColumn: 1 }} />}

          <OpRule at={{ gridRow: 5 + nParciales, gridColumn: '1 / -1' }} />

          {/* Llevadas de la suma */}
          {cols.map((c) => (
            <OpCarry
              key={`carrySuma-${c}`}
              at={{ gridRow: 6 + nParciales, gridColumn: digitCol(c) }}
              off={!ayudaLlevadas}
              value={entradasLlevadasSuma[c] || ""}
              state={clasesLlevadasSuma[c] || ""}
              active={activeSlot?.type === 'llevadaSuma' && activeSlot?.col === c}
              onClick={() => ayudaLlevadas && handleSlotClick('llevadaSuma', 0, c)}
            />
          ))}

          {/* Resultado final + ranuras para la coma */}
          {Array.from({ length: ancho + 1 }, (_, s) => (
            <OpComma
              key={`slot-${s}`}
              at={{ gridRow: rFinal, gridColumn: slotCol(s) }}
              on={commaSlot === s}
              state={comprobado && commaSlot === s ? (s === comaEsperada ? 'correct' : 'incorrect') : ''}
              onClick={() => {
                  if (decimalesTotal === 0) { setCommaSlot(null); return; }
                  setCommaSlot(prev => (prev === s ? null : s));
              }}
            />
          ))}
          {cols.map((c) => (
            <OpCell
              key={`final-${c}`}
              at={{ gridRow: rFinal, gridColumn: digitCol(c) }}
              i={c}
              stamp
              value={entradasFinal[c] || ""}
              state={clasesFinal[c] || ""}
              focus={isFocus('final', c)}
              active={activeSlot?.type === 'final' && activeSlot?.col === c}
              onClick={() => handleSlotClick('final', 0, c)}
            />
          ))}
        </div>
      </OpBoard>
      )}
    </MathOperationLayout>
  );
}
