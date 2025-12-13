import React, { useEffect, useMemo, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";

/* 6º Primaria: Multiplicación con decimales + UI Mejorada (Fuentes Grandes) */

export default function MultiplicacionesPrimaria6() {
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

  const getHighlightStyle = (section, idx, r_idx) => {
    if (!ayudaLlevadas || !activeSlot) return {};
    const style = { backgroundColor: '#e0f2fe', transition: 'background-color 0.2s', borderRadius: '4px' };

    // Fases de Multiplicación
    if (activeSlot.type === 'parcial') {
        const activeRow = activeSlot.row;
        const digitosMultReales = multiplicador.replace('.','').length;
        const offsetMult = (ancho - digitosMultReales) + (digitosMultReales - 1 - activeRow);
        
        if (section === 'mulcdr' && idx === offsetMult) return style;
        if (section === 'mulcdo' && idx === (activeSlot.col + activeRow)) {
             if (mulcdoRelleno[idx]) return style;
        }
    }

    // Fase Suma Final
    if (activeSlot.type === 'final') {
        if (section === 'parcial' && idx === activeSlot.col) {
             if (parcialesEsperados[r_idx].digitos[idx] !== "") return style;
        }
    }

    return {};
  };

  // ---------- Manejadores ----------
  
  const handleSlotClick = (type, row, col) => {
    setActiveSlot({ type, row, col });
  };

  const handlePaletteClick = (val) => {
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
  let operadorColocado = false;
  const columnas = [];
  
  for (let c = 0; c < ancho; c++) {
    const dMulcdr = mulcdrRelleno[c];
    const comaA = d1 > 0 && c === (ancho - d1 - 1);
    const comaB = d2 > 0 && c === (ancho - d2 - 1);

    // Llevada Multiplicación (Única fila visual)
    let activeCarryVal = "";
    let activeCarryClass = "";
    let currentRowIdx = -1;

    if (activeSlot && (activeSlot.type === 'parcial' || activeSlot.type === 'llevada')) {
        currentRowIdx = activeSlot.row;
        activeCarryVal = entradasLlevadas[currentRowIdx]?.[c] || "";
        activeCarryClass = clasesLlevadas[currentRowIdx]?.[c] || "";
    }
    const showCarryBox = ayudaLlevadas && (currentRowIdx !== -1);

    columnas.push(
      <div className="column" key={`col-${c}`}>
        {/* Llevada Multiplicación */}
        <div
            className={`box carry-box ${!showCarryBox ? 'invisible' : ''} ${activeCarryClass} ${activeSlot?.type==='llevada' && activeSlot?.col===c ? 'selected' : ''}`}
            onClick={() => showCarryBox && handleSlotClick('llevada', currentRowIdx, c)}
        >
            {showCarryBox ? activeCarryVal : ""}
        </div>

        {/* Multiplicando */}
        <div className="digit-display with-decimal" style={getHighlightStyle('mulcdo', c)}>
          {mulcdoRelleno[c] || ""}
          {comaA ? <span className="decimal-mark">,</span> : null}
        </div>

        {/* Multiplicador */}
        <div className="digit-display with-decimal" style={getHighlightStyle('mulcdr', c)}>
          {dMulcdr ? (
            !operadorColocado ? (<><span className="cross-inline">×</span><span>{dMulcdr}</span></>)
                               : dMulcdr
          ) : ""}
          {comaB ? <span className="decimal-mark">,</span> : null}
        </div>
        {dMulcdr && !operadorColocado ? (operadorColocado = true) : null}

        <hr className="operation-line" />

        {/* Parciales */}
        {parcialesEsperados.map((fila, r) => {
          const enabled = fila.digitos[c] !== "";
          return (
            <div
              key={`parcial-${r}-${c}`}
              className={`box result-box parcial-box ${!enabled ? "disabled" : ""} ${clasesParciales[r]?.[c] || ""} ${activeSlot?.type==='parcial' && activeSlot.row===r && activeSlot.col===c ? 'selected' : ''}`}
              onClick={() => enabled && handleSlotClick('parcial', r, c)}
              style={getHighlightStyle('parcial', c, r)}
            >
              {entradasParciales[r]?.[c] || ""}
            </div>
          );
        })}

        <hr className="operation-line" />
      </div>
    );
  }

  // Configuración del Grid Final
  const resultGridColumns = Array.from({ length: 2 * ancho + 1 }, (_, k) => 
      k % 2 === 0 ? "var(--slot-w)" : "var(--box-w)"
  ).join(" ");

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Multiplica con decimales</span>
      </h1>

      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            id="help-toggle"
            type="checkbox"
            checked={ayudaLlevadas}
            onChange={(e) => setAyudaLlevadas(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div id="problem-area" className={ayudaLlevadas ? "" : "carries-hidden"}>
        {columnas}
      </div>

      {/* Grid Resultado Final + Llevadas Suma */}
      <div
        className="result-grid"
        style={{
          display: 'grid',
          justifyContent: 'center',
          marginTop: '10px',
          gridTemplateColumns: resultGridColumns,
          gridTemplateRows: '35px 55px' // Altura aumentada para números grandes
        }}
      >
        {Array.from({ length: 2 * ancho + 1 }, (_, k) => {
            const gridCol = k + 1; // 1-based index
            
            if (k % 2 === 0) {
                // --- Ranura Coma (Fila 2) ---
                const s = Math.floor(k / 2);
                const activo = commaSlot === s;
                return (
                <div
                    key={`slot-${s}`}
                    className={["comma-slot", activo ? "active" : ""].join(" ")}
                    style={{ gridColumn: gridCol, gridRow: 2 }}
                    onClick={() => {
                        if (decimalesTotal === 0) { setCommaSlot(null); return; }
                        setCommaSlot(prev => (prev === s ? null : s));
                    }}
                >
                    ,
                </div>
                );
            } else {
                // --- Columna Dígito ---
                const c = (k - 1) / 2;
                const style = getHighlightStyle('final', c);
                const isSelected = activeSlot?.type === 'final' && activeSlot?.col === c;
                const showCarry = ayudaLlevadas; 
                
                return [
                    // Elemento 1: Llevada (Fila 1) - Fuente aumentada
                    <div 
                        key={`carrySuma-${c}`}
                        className={`box carry-box ${!showCarry ? 'invisible' : ''} ${clasesLlevadasSuma[c] || ""} ${activeSlot?.type==='llevadaSuma' && activeSlot?.col===c ? 'selected' : ''}`}
                        style={{ gridColumn: gridCol, gridRow: 1, width: 'var(--box-w)', margin: '0 auto', fontSize: '1.3rem', fontWeight: 'bold' }}
                        onClick={() => showCarry && handleSlotClick('llevadaSuma', 0, c)}
                    >
                        {entradasLlevadasSuma[c] || ""}
                    </div>,
                    
                    // Elemento 2: Resultado (Fila 2) - Fuente Aumentada y Negrita
                    <div
                        key={`final-${c}`}
                        className={`box result-box final-box ${clasesFinal[c] || ""} ${isSelected ? "selected" : ""}`}
                        style={{ ...style, gridColumn: gridCol, gridRow: 2, fontSize: '1.6rem', fontWeight: 'bold' }}
                        onClick={() => handleSlotClick('final', 0, c)}
                    >
                        {entradasFinal[c] || ""}
                    </div>
                ];
            }
        })}
      </div>

      <div id="feedback-message" className={feedback.tipo}>{feedback.texto}</div>

      <div id="controls">
        <button id="check-button" onClick={comprobarRespuesta}>Comprobar</button>
        <button id="new-problem-button" onClick={generarNueva}>Nueva</button>
      </div>

      <div id="number-palette">
        <h2>Toca los números 👇</h2>
        <div className="number-tiles-container">
          {Array.from({ length: 10 }, (_, d) => (
            <div
              key={d}
              className="number-tile"
              onClick={() => handlePaletteClick(d)}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", d)}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}