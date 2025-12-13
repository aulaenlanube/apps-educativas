import React, { useEffect, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";

export default function MultiplicacionesPrimaria5() {
  // --- Estados del Juego ---
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  
  // Soluciones esperadas
  const [solucion, setSolucion] = useState({
    fila1: [], llevadas1: [],
    fila2: [], llevadas2: [],
    fila3: [], llevadas3: [],
    suma: [],  llevadasSuma: []
  });

  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  // Entradas del usuario
  const [entradas, setEntradas] = useState({
    fila1: [], fila2: [], fila3: [], filaSuma: [],
    llevadasMul: [], // Array visual de llevadas (se recicla y limpia)
    llevadasSuma: [] 
  });

  const [clases, setClases] = useState({
    fila1: [], fila2: [], fila3: [], filaSuma: [],
    llevadasMul: [], llevadasSuma: []
  });

  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Lógica de Negocio ---

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
        const val = parseInt(tMulcdo[i]);
        const prod = val * digito + acarreo;
        const res = prod % 10;
        acarreo = Math.floor(prod / 10);
        
        const pos = i + 1; 
        digitos[pos] = res.toString();
        
        if (i >= 0) llevadas[i] = acarreo;
    }
    if (acarreo > 0) digitos[0] = acarreo.toString();

    return { digitos, llevadas };
  };

  const generarNueva = useCallback(() => {
    // 5º Primaria: 4 cifras x 3 cifras
    const n1 = generarNumero(4); 
    const n2 = generarNumero(3);
    
    const dUnit = n2 % 10;
    const dTens = Math.floor((n2 / 10) % 10);
    const dCent = Math.floor(n2 / 100);

    const prod1 = calcularFilaProducto(n1, dUnit); 
    const prod2 = calcularFilaProducto(n1, dTens);
    const prod3 = calcularFilaProducto(n1, dCent);

    const total = n1 * n2;
    const totalStr = total.toString();
    
    const anchoTotal = 7; 
    
    const alinear = (arr, shiftRight) => {
        const res = new Array(anchoTotal).fill("");
        for(let i = 0; i < arr.length; i++) {
            const val = arr[arr.length - 1 - i];
            if (val !== undefined && val !== "") {
                res[anchoTotal - 1 - shiftRight - i] = val;
            }
        }
        return res;
    };

    const f1 = alinear(prod1.digitos, 0);
    const f2 = alinear(prod2.digitos, 1);
    const f3 = alinear(prod3.digitos, 2);
    const sumaAl = alinear(totalStr.split(''), 0);

    const llevadasSuma = new Array(anchoTotal).fill("");
    let acSuma = 0;
    for (let i = anchoTotal - 1; i > 0; i--) {
        const v1 = parseInt(f1[i] || "0");
        const v2 = parseInt(f2[i] || "0");
        const v3 = parseInt(f3[i] || "0");
        const s = v1 + v2 + v3 + acSuma;
        acSuma = Math.floor(s / 10);
        if (acSuma > 0) llevadasSuma[i - 1] = acSuma.toString();
    }

    setMultiplicando(n1);
    setMultiplicador(n2);
    setSolucion({
        fila1: f1, llevadas1: prod1.llevadas,
        fila2: f2, llevadas2: prod2.llevadas,
        fila3: f3, llevadas3: prod3.llevadas,
        suma: sumaAl, llevadasSuma: llevadasSuma
    });

    const vacio = () => new Array(anchoTotal).fill("");
    setEntradas({ 
        fila1: vacio(), fila2: vacio(), fila3: vacio(), filaSuma: vacio(),
        llevadasMul: vacio(), llevadasSuma: vacio() 
    });
    setClases({ 
        fila1: vacio(), fila2: vacio(), fila3: vacio(), filaSuma: vacio(),
        llevadasMul: vacio(), llevadasSuma: vacio() 
    });
    setFeedback({ texto: "", tipo: "" });
    
    setActiveSlot({ type: 'fila1', index: anchoTotal - 1 });

  }, []);

  useEffect(() => { generarNueva(); }, [generarNueva]);

  // --- Manejadores ---

  const handleSlotClick = (type, index) => {
    setActiveSlot({ type, index });
  };

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();
    const { type, index } = activeSlot;

    // Actualizar valor
    setEntradas(prev => {
        const n = { ...prev };
        n[type] = [...prev[type]];
        n[type][index] = strVal;
        return n;
    });
    // Limpiar error
    setClases(prev => {
        const n = { ...prev };
        n[type] = [...prev[type]];
        n[type][index] = "";
        return n;
    });

    // --- AUTO-LLEVADA ---
    if (ayudaLlevadas) {
        // Filas de multiplicación
        if (type.startsWith('fila') && type !== 'filaSuma') {
            const rowKey = type;
            const llevadasKey = rowKey.replace('fila', 'llevadas');
            const offset = (rowKey === 'fila1' ? 0 : (rowKey === 'fila2' ? 1 : 2));
            
            const anchoTotal = 7;
            const posDesdeDerecha = (anchoTotal - 1 - index) - offset;
            
            // Verificamos contra la solución correcta
            if (strVal === solucion[rowKey][index] && posDesdeDerecha >= 0) {
                const llevadasSource = solucion[llevadasKey];
                const rawIndex = (llevadasSource.length - 2) - posDesdeDerecha;
                const carrySlotIndex = index - 1;

                if (rawIndex >= 0 && carrySlotIndex >= 0) {
                    const carryVal = llevadasSource[rawIndex] || 0; 
                    setEntradas(prev => {
                        const n = [...prev.llevadasMul];
                        n[carrySlotIndex] = carryVal.toString(); 
                        return { ...prev, llevadasMul: n };
                    });
                }
            }
        }
        
        // Fila Suma
        else if (type === 'filaSuma' && strVal === solucion.suma[index]) {
            const prevIndex = index - 1;
            if (prevIndex >= 0) {
                const carryVal = solucion.llevadasSuma[prevIndex] || "0";
                setEntradas(prev => {
                    const n = [...prev.llevadasSuma];
                    n[prevIndex] = carryVal;
                    return { ...prev, llevadasSuma: n };
                });
            }
        }
    }

    // --- AUTO-AVANCE ---
    const avanzar = () => {
        const prevIndex = index - 1;
        let hasMoreInRow = false;
        
        // CORRECCIÓN: Mapear 'filaSuma' a 'suma' para buscar en solucion
        const solKey = type === 'filaSuma' ? 'suma' : type;

        if (solucion[solKey] && solucion[solKey][prevIndex] !== undefined && solucion[solKey][prevIndex] !== "") {
            hasMoreInRow = true;
        }

        if (hasMoreInRow) {
            setActiveSlot({ type, index: prevIndex });
        } else {
            // Salto de fila + Limpieza
            const clearCarries = () => setEntradas(prev => ({ ...prev, llevadasMul: new Array(7).fill("") }));
            
            if (type === 'fila1') {
                clearCarries();
                setActiveSlot({ type: 'fila2', index: 5 }); // 7-1-1
            } else if (type === 'fila2') {
                clearCarries();
                setActiveSlot({ type: 'fila3', index: 4 }); // 7-1-2
            } else if (type === 'fila3') {
                clearCarries();
                setActiveSlot({ type: 'filaSuma', index: 6 }); // Unidades suma
            } else {
                setActiveSlot(null);
            }
        }
    };
    avanzar();
  };

  const comprobarRespuesta = () => {
    let correcto = true;
    const nuevasClases = { ...clases };

    // CORRECCIÓN: Mapear inputs a soluciones correctamente
    const mappings = [
        { input: 'fila1', sol: 'fila1' },
        { input: 'fila2', sol: 'fila2' },
        { input: 'fila3', sol: 'fila3' },
        { input: 'filaSuma', sol: 'suma' }
    ];

    mappings.forEach(({ input, sol }) => {
        solucion[sol].forEach((val, i) => {
            if (!val) return;
            if (entradas[input][i] === val) nuevasClases[input][i] = 'correct';
            else { nuevasClases[input][i] = 'incorrect'; correcto = false; }
        });
    });

    setClases(nuevasClases);

    if (correcto) {
        setFeedback({ texto: "¡Genial! Has dominado las multiplicaciones grandes 🧠🎉", tipo: "feedback-correct" });
        setActiveSlot(null);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    } else {
        setFeedback({ texto: "Revisa los números en rojo.", tipo: "feedback-incorrect" });
    }
  };

  // --- UI Highlight ---
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
        // Multiplicador: Col 6 (U), 5 (D), 4 (C)
        if (section === 'n2' && c === (ancho - 1 - activeRowOffset)) return style;
    }

    if (activeSlot.type === 'filaSuma') {
        if ((section === 'fila1' || section === 'fila2' || section === 'fila3') && c === activeSlot.index) {
             // Usamos los keys de solución para saber si hay número en esa posición
             const solKey = section; 
             if (solucion[solKey][c] !== "") return style;
        }
    }
    return {};
  };

  // --- Renderizado Grid ---
  const colStyle = { 
    display: 'grid', 
    gridTemplateColumns: `repeat(${ancho}, 1fr)`, 
    gap: '5px', 
    maxWidth: '450px', 
    margin: '0 auto' 
  };

  const renderCells = () => {
    const cells = [];
    
    // Fila 1: Llevadas Multiplicación
    for(let c=0; c<ancho; c++) {
        const showInput = ayudaLlevadas;
        cells.push(
            <div key={`carryMul-${c}`} className={`box carry-box ${!showInput ? 'invisible' : ''}`}
                 style={{ gridRow: 1, gridColumn: c+1 }}>
                 {showInput ? entradas.llevadasMul[c] : ''}
            </div>
        );
    }

    // Fila 2: Multiplicando
    for(let c=0; c<ancho; c++) {
        cells.push(
            <div key={`n1-${c}`} className="digit-display" style={{ gridRow: 2, gridColumn: c+1, ...getHighlightStyle('n1', c) }}>
                {n1Str[c]}
            </div>
        );
    }

    // Fila 3: Multiplicador
    let xPuesto = false;
    for(let c=0; c<ancho; c++) {
        let content = n2Str[c];
        if (content !== ' ' && !xPuesto) {
            content = <><span className="cross-inline" style={{position:'absolute', left:'-15px'}}>×</span>{n2Str[c]}</>;
            xPuesto = true;
        }
        cells.push(
            <div key={`n2-${c}`} className="digit-display" style={{ gridRow: 3, gridColumn: c+1, position: 'relative', ...getHighlightStyle('n2', c) }}>
                {content}
            </div>
        );
    }

    cells.push(<hr key="hr1" className="operation-line" style={{ gridRow: 4, gridColumn: `1 / -1` }} />);

    // Filas Productos Parciales
    ['fila1', 'fila2', 'fila3'].forEach((fila, idx) => {
        const rowNum = 5 + idx; 
        for(let c=0; c<ancho; c++) {
            const enabled = solucion[fila][c] !== "";
            cells.push(
                <div key={`${fila}-${c}`} 
                     className={`box result-box ${!enabled ? 'disabled' : ''} ${clases[fila][c] || ''} ${activeSlot?.type === fila && activeSlot?.index === c ? 'selected' : ''}`}
                     onClick={() => enabled && handleSlotClick(fila, c)}
                     style={{ gridRow: rowNum, gridColumn: c+1, ...getHighlightStyle(fila, c) }}>
                     {entradas[fila][c]}
                </div>
            );
        }
    });

    cells.push(<hr key="hr2" className="operation-line" style={{ gridRow: 8, gridColumn: `1 / -1` }} />);

    // Fila 9: Llevadas Suma
    for(let c=0; c<ancho; c++) {
        const visible = c < 6;
        cells.push(
            <div key={`carrySum-${c}`} className={`box carry-box ${!visible ? 'invisible' : ''} ${ayudaLlevadas ? '' : 'hidden-by-toggle'}`}
                 style={{ gridRow: 9, gridColumn: c+1 }}>
                 {entradas.llevadasSuma[c]}
            </div>
        );
    }

    // Fila 10: Suma Final
    for(let c=0; c<ancho; c++) {
        const enabled = solucion.suma[c] !== "";
        cells.push(
            <div key={`sum-${c}`} 
                 className={`box result-box ${!enabled ? 'disabled' : ''} ${clases.filaSuma[c] || ''} ${activeSlot?.type === 'filaSuma' && activeSlot?.index === c ? 'selected' : ''}`}
                 onClick={() => enabled && handleSlotClick('filaSuma', c)}
                 style={{ gridRow: 10, gridColumn: c+1 }}>
                 {entradas.filaSuma[c]}
            </div>
        );
    }

    return cells;
  };

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Multiplicar">✖️</span>{' '}
        <span className="gradient-text">Multiplicaciones de 3 cifras</span>
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

      <div id="problem-area" style={{ ...colStyle, gridTemplateRows: 'repeat(10, auto)' }}>
        {renderCells()}
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