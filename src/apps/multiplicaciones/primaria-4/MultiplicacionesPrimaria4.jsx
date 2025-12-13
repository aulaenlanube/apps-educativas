import React, { useEffect, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";

export default function MultiplicacionesPrimaria4() {
  // --- Estados del Juego ---
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  
  // Soluciones esperadas
  const [solucion, setSolucion] = useState({
    fila1: [], // Producto unidades
    llevadas1: [],
    fila2: [], // Producto decenas
    llevadas2: [],
    suma: [],  // Resultado final
    llevadasSuma: []
  });

  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  // Entradas del usuario
  const [entradas, setEntradas] = useState({
    fila1: [],
    fila2: [],
    filaSuma: [],
    llevadasMul: [], // Llevadas compartidas para la multiplicación
    llevadasSuma: [] // Llevadas de la suma final
  });

  const [clases, setClases] = useState({
    fila1: [],
    fila2: [],
    filaSuma: [],
    llevadasMul: [],
    llevadasSuma: []
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

    const llevadasStr = llevadas.map(l => l > 0 ? l.toString() : ""); 
    return { digitos, llevadas: llevadasStr };
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
        for(let i = 0; i < arr.length; i++) {
            const val = arr[arr.length - 1 - i];
            if (val !== undefined && val !== "") {
                res[anchoTotal - 1 - shiftRight - i] = val;
            }
        }
        return res;
    };

    const fila1Alineada = alinear(prod1.digitos, 0);
    const fila2Alineada = alinear(prod2.digitos, 1); 
    const sumaAlineada = alinear(totalStr.split(''), 0);

    const llevadasSuma = new Array(anchoTotal).fill("");
    let acarreoSuma = 0;
    for (let i = anchoTotal - 1; i > 0; i--) {
        const v1 = parseInt(fila1Alineada[i] || "0");
        const v2 = parseInt(fila2Alineada[i] || "0");
        const s = v1 + v2 + acarreoSuma;
        acarreoSuma = Math.floor(s / 10);
        if (acarreoSuma > 0) llevadasSuma[i - 1] = acarreoSuma.toString();
    }

    setMultiplicando(n1);
    setMultiplicador(n2);
    setSolucion({
        fila1: fila1Alineada,
        llevadas1: prod1.llevadas, 
        fila2: fila2Alineada,
        llevadas2: prod2.llevadas,
        suma: sumaAlineada,
        llevadasSuma: llevadasSuma
    });

    const vacio = () => new Array(anchoTotal).fill("");
    const vacioMul = () => new Array(4).fill(""); 

    setEntradas({ fila1: vacio(), fila2: vacio(), filaSuma: vacio(), llevadasMul: vacioMul(), llevadasSuma: vacio() });
    setClases({ fila1: vacio(), fila2: vacio(), filaSuma: vacio(), llevadasMul: vacioMul(), llevadasSuma: vacio() });
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
        if (type === 'fila1') {
            const targetValue = solucion.fila1[index];
            const posDesdeDerecha = 5 - index; 
            const idxLlevada = 3 - posDesdeDerecha; 
            
            if (strVal === targetValue && idxLlevada > 0) {
                const llevadaReal = solucion.llevadas1[idxLlevada - 1] || "0"; 
                setEntradas(prev => {
                    const n = [...prev.llevadasMul];
                    n[idxLlevada - 1] = llevadaReal;
                    return { ...prev, llevadasMul: n };
                });
            }
        }
        else if (type === 'fila2') {
            const targetValue = solucion.fila2[index];
            const posDesdeDerecha = (5 - index) - 1; 
            const idxLlevada = 3 - posDesdeDerecha; 

            if (strVal === targetValue && idxLlevada > 0) {
                const llevadaReal = solucion.llevadas2[idxLlevada - 1] || "0";
                setEntradas(prev => {
                    const n = [...prev.llevadasMul]; 
                    n[idxLlevada - 1] = llevadaReal;
                    return { ...prev, llevadasMul: n };
                });
            }
        }
        else if (type === 'filaSuma') {
            const targetValue = solucion.suma[index];
            if (strVal === targetValue) {
                const prevIndex = index - 1;
                if (prevIndex >= 0) {
                    const llevadaSuma = solucion.llevadasSuma[prevIndex] || "0";
                    setEntradas(prev => {
                        const n = [...prev.llevadasSuma];
                        n[prevIndex] = llevadaSuma;
                        return { ...prev, llevadasSuma: n };
                    });
                }
            }
        }
    }

    // --- AUTO-AVANCE ---
    const avanzar = () => {
        const jumpToNextRow = (nextType, startIdx) => {
             setActiveSlot({ type: nextType, index: startIdx });
        };

        const prevIndex = index - 1;
        let hasMoreInRow = false;
        if (type === 'fila1' && solucion.fila1[prevIndex]) hasMoreInRow = true;
        if (type === 'fila2' && solucion.fila2[prevIndex]) hasMoreInRow = true;
        if (type === 'filaSuma' && solucion.suma[prevIndex]) hasMoreInRow = true;

        if (hasMoreInRow) {
            setActiveSlot({ type, index: prevIndex });
        } else {
            // Salto de fila con limpieza
            if (type === 'fila1') {
                setEntradas(prev => ({ ...prev, llevadasMul: new Array(4).fill("") }));
                jumpToNextRow('fila2', 4);
            }
            else if (type === 'fila2') {
                setEntradas(prev => ({ ...prev, llevadasMul: new Array(4).fill("") }));
                jumpToNextRow('filaSuma', 5); 
            }
            else setActiveSlot(null); 
        }
    };
    avanzar();
  };

  const comprobarRespuesta = () => {
    let correcto = true;
    const nuevasClases = { ...clases };

    solucion.fila1.forEach((val, i) => {
        if (!val) return;
        if (entradas.fila1[i] === val) nuevasClases.fila1[i] = 'correct';
        else { nuevasClases.fila1[i] = 'incorrect'; correcto = false; }
    });

    solucion.fila2.forEach((val, i) => {
        if (!val) return;
        if (entradas.fila2[i] === val) nuevasClases.fila2[i] = 'correct';
        else { nuevasClases.fila2[i] = 'incorrect'; correcto = false; }
    });

    solucion.suma.forEach((val, i) => {
        if (!val) return;
        if (entradas.filaSuma[i] === val) nuevasClases.filaSuma[i] = 'correct';
        else { nuevasClases.filaSuma[i] = 'incorrect'; correcto = false; }
    });

    setClases(nuevasClases);

    if (correcto) {
        setFeedback({ texto: "¡Excelente! Operación completa y correcta 🎉", tipo: "feedback-correct" });
        setActiveSlot(null);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } else {
        setFeedback({ texto: "Hay errores en las casillas rojas. Revisa paso a paso.", tipo: "feedback-incorrect" });
    }
  };

  // --- UI Highlight Logic ---
  const ancho = 6;
  const n1Str = multiplicando.toString().padStart(ancho, ' ');
  const n2Str = multiplicador.toString().padStart(ancho, ' ');

  const getHighlightStyle = (section, c) => {
    if (!ayudaLlevadas || !activeSlot) return {};
    
    // Color de resaltado (Azul claro suave)
    const style = { backgroundColor: '#e0f2fe', transition: 'background-color 0.2s', borderRadius: '4px' };
    
    // 1. Fase Multiplicación - Fila 1 (Unidades)
    if (activeSlot.type === 'fila1') {
        // Multiplicando (digit correspondiente a la columna activa)
        if (section === 'n1' && c === activeSlot.index && n1Str[c] !== ' ') return style;
        // Multiplicador (siempre las unidades: col 5)
        if (section === 'n2' && c === 5) return style;
    }
    
    // 2. Fase Multiplicación - Fila 2 (Decenas)
    if (activeSlot.type === 'fila2') {
        // Multiplicando (digit desplazado 1 a la derecha respecto al input)
        // Como la fila2 está desplazada 1 a la izquierda, el índice input I corresponde al multiplicando I+1
        if (section === 'n1' && c === activeSlot.index + 1 && n1Str[c] !== ' ') return style;
        // Multiplicador (siempre las decenas: col 4)
        if (section === 'n2' && c === 4) return style;
    }

    // 3. Fase Suma
    if (activeSlot.type === 'filaSuma') {
        // Resaltar las celdas de las filas parciales que se están sumando
        if ((section === 'fila1' || section === 'fila2') && c === activeSlot.index) {
             // Solo si esa casilla tiene contenido (es parte del número)
             if (section === 'fila1' && solucion.fila1[c] !== "") return style;
             if (section === 'fila2' && solucion.fila2[c] !== "") return style;
        }
    }

    return {};
  };

  // --- Renderizado Grid ---
  const colStyle = { display: 'grid', gridTemplateColumns: `repeat(${ancho}, 1fr)`, gap: '5px', maxWidth: '300px', margin: '0 auto' };

  const renderCells = () => {
    const cells = [];
    
    // Fila 1: Llevadas Multiplicación
    for(let c=0; c<ancho; c++) {
        const idxArr = c - 2; 
        const visible = idxArr >= 0 && idxArr < 4; 
        
        cells.push(
            <div key={`carryMul-${c}`} className={`box carry-box ${!visible ? 'invisible' : ''} ${ayudaLlevadas ? '' : 'hidden-by-toggle'} ${activeSlot?.type === 'llevadaMul' && activeSlot?.index === idxArr ? 'selected' : ''}`}
                 onClick={() => visible && handleSlotClick('llevadaMul', idxArr)}
                 style={{ gridRow: 1, gridColumn: c+1 }}>
                 {visible ? entradas.llevadasMul[idxArr] : ''}
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

    // Fila 3: Multiplicador (con X)
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

    // Fila 4: HR
    cells.push(<hr key="hr1" className="operation-line" style={{ gridRow: 4, gridColumn: `1 / -1` }} />);

    // Fila 5: Producto 1
    for(let c=0; c<ancho; c++) {
        const enabled = solucion.fila1[c] !== "";
        cells.push(
            <div key={`p1-${c}`} 
                 className={`box result-box ${!enabled ? 'disabled' : ''} ${clases.fila1[c] || ''} ${activeSlot?.type === 'fila1' && activeSlot?.index === c ? 'selected' : ''}`}
                 onClick={() => enabled && handleSlotClick('fila1', c)}
                 style={{ gridRow: 5, gridColumn: c+1, ...getHighlightStyle('fila1', c) }}>
                 {entradas.fila1[c]}
            </div>
        );
    }

    // Fila 6: Producto 2
    for(let c=0; c<ancho; c++) {
        const enabled = solucion.fila2[c] !== "";
        cells.push(
            <div key={`p2-${c}`} 
                 className={`box result-box ${!enabled ? 'disabled' : ''} ${clases.fila2[c] || ''} ${activeSlot?.type === 'fila2' && activeSlot?.index === c ? 'selected' : ''}`}
                 onClick={() => enabled && handleSlotClick('fila2', c)}
                 style={{ gridRow: 6, gridColumn: c+1, ...getHighlightStyle('fila2', c) }}>
                 {entradas.fila2[c]}
            </div>
        );
    }

    // Fila 7: HR
    cells.push(<hr key="hr2" className="operation-line" style={{ gridRow: 7, gridColumn: `1 / -1` }} />);

    // Fila 8: Llevadas Suma
    for(let c=0; c<ancho; c++) {
        const visible = c < 5; 
        cells.push(
            <div key={`carrySum-${c}`} 
                 className={`box carry-box ${!visible ? 'invisible' : ''} ${ayudaLlevadas ? '' : 'hidden-by-toggle'} ${activeSlot?.type === 'llevadaSuma' && activeSlot?.index === c ? 'selected' : ''}`}
                 onClick={() => visible && handleSlotClick('llevadaSuma', c)}
                 style={{ gridRow: 8, gridColumn: c+1 }}>
                 {entradas.llevadasSuma[c]}
            </div>
        );
    }

    // Fila 9: Suma Final
    for(let c=0; c<ancho; c++) {
        const enabled = solucion.suma[c] !== "";
        cells.push(
            <div key={`sum-${c}`} 
                 className={`box result-box ${!enabled ? 'disabled' : ''} ${clases.filaSuma[c] || ''} ${activeSlot?.type === 'filaSuma' && activeSlot?.index === c ? 'selected' : ''}`}
                 onClick={() => enabled && handleSlotClick('filaSuma', c)}
                 style={{ gridRow: 9, gridColumn: c+1 }}>
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
        <span className="gradient-text">Multiplicaciones de 2 cifras</span>
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

      <div id="problem-area" style={{ ...colStyle, gridTemplateRows: 'repeat(9, auto)' }}>
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