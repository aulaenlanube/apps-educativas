import React, { useEffect, useMemo, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";

export default function MultiplicacionesPrimaria3() {
  // --- Estados ---
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [filaEsperada, setFilaEsperada] = useState({ digitos: [], llevadas: [] }); 
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  // Estados de entrada
  const [entradas, setEntradas] = useState({ producto: [], llevada: [] });
  const [clases, setClases] = useState({ producto: [], llevada: [] });
  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });
  
  // Estado para el foco activo (escritura rápida)
  const [activeSlot, setActiveSlot] = useState(null); // { type: 'producto'|'llevada', index: number }

  // --- Lógica de Generación ---
  const generarNumero = (longitud) => {
    if (longitud === 1) return Math.floor(Math.random() * 9) + 1;
    const min = Math.pow(10, longitud - 1);
    const max = Math.pow(10, longitud) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const calcularFilaProducto = useCallback((mulcdo, mulcdr) => {
    const tMulcdo = mulcdo.toString();
    const tMulcdr = mulcdr.toString(); 
    const ancho = tMulcdo.length + 1;

    const mulcdoRelleno = new Array(ancho).fill(0);
    for (let i = 0; i < tMulcdo.length; i++) {
      mulcdoRelleno[ancho - tMulcdo.length + i] = parseInt(tMulcdo[i], 10);
    }

    const digMult = parseInt(tMulcdr, 10);
    const digitos = new Array(ancho).fill("");
    const llevadasCrudas = new Array(ancho).fill(0);

    let acarreo = 0;
    // Calculamos de derecha a izquierda
    for (let c = ancho - 1; c >= 0; c--) {
      const prod = mulcdoRelleno[c] * digMult + acarreo;
      const d = prod % 10;
      const nuevaLlevada = Math.floor(prod / 10);
      digitos[c] = d.toString();
      llevadasCrudas[c] = nuevaLlevada;
      acarreo = nuevaLlevada;
    }

    // Alinear llevadas: La llevada generada en 'c' se muestra en 'c-1'
    const llevadas = new Array(ancho).fill("");
    for (let c = 0; c < ancho; c++) {
      const origen = c + 1; 
      const valor = origen < ancho ? llevadasCrudas[origen] : 0;
      // Guardamos la llevada si es > 0 (o si queremos ser explícitos 0)
      if (valor > 0) llevadas[c] = valor.toString();
    }

    // Limpiar ceros a la izquierda en producto
    let encontrado = false;
    for (let c = 0; c < ancho; c++) {
      if (!encontrado) {
        if (digitos[c] === "0") digitos[c] = "";
        else if (digitos[c] !== "") encontrado = true;
      }
    }

    return { digitos, llevadas };
  }, []);

  const generarNueva = useCallback(() => {
    const longitudMultiplicando = 2 + Math.floor(Math.random() * 2); // 2 o 3 cifras
    const nuevoMultiplicando = generarNumero(longitudMultiplicando);
    const nuevoMultiplicador = 2 + Math.floor(Math.random() * 8); // 2 a 9

    const nuevaFila = calcularFilaProducto(nuevoMultiplicando, nuevoMultiplicador);

    setMultiplicando(nuevoMultiplicando);
    setMultiplicador(nuevoMultiplicador);
    setFilaEsperada(nuevaFila);
    
    const ancho = nuevaFila.digitos.length;
    setEntradas({ producto: new Array(ancho).fill(""), llevada: new Array(ancho).fill("") });
    setClases({ producto: new Array(ancho).fill(""), llevada: new Array(ancho).fill("") });
    setFeedback({ texto: "", tipo: "" });
    
    // Auto-foco en la última cifra del producto
    setActiveSlot({ type: 'producto', index: ancho - 1 });
  }, [calcularFilaProducto]);

  useEffect(() => {
    generarNueva();
  }, [generarNueva]);

  // --- Handlers de Interacción ---

  const handleSlotClick = (type, index) => {
    setActiveSlot({ type, index });
  };

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();
    const { type, index } = activeSlot;

    setEntradas((prev) => {
      const nuevo = { ...prev };
      nuevo[type] = [...prev[type]];
      nuevo[type][index] = strVal;
      return nuevo;
    });

    // Limpiar clase de error si existía
    setClases((prev) => {
      const nuevo = { ...prev };
      nuevo[type] = [...prev[type]];
      nuevo[type][index] = "";
      return nuevo;
    });

    // --- LÓGICA AUTO-LLEVADA ---
    // Si estamos en producto y el valor es correcto, rellenamos la llevada de la siguiente columna (izquierda)
    if (type === 'producto' && ayudaLlevadas) {
        if (strVal === filaEsperada.digitos[index]) {
            const leftIndex = index - 1;
            if (leftIndex >= 0) {
                // Comprobar si esa columna espera llevada
                const expectedCarry = filaEsperada.llevadas[leftIndex];
                if (expectedCarry) {
                    setEntradas(prev => {
                        const n = { ...prev, llevada: [...prev.llevada] };
                        n.llevada[leftIndex] = expectedCarry;
                        return n;
                    });
                } else {
                    // Opcional: Poner '0' si no hay llevada para confirmar que no lleva nada
                    // setEntradas(prev => { ... n.llevada[leftIndex] = '0'; ... });
                }
            }
        }
    }

    // --- AUTO-AVANCE ---
    // Avanzar hacia la izquierda
    const nextIndex = index - 1;
    if (nextIndex >= 0) {
        setActiveSlot({ type, index: nextIndex });
    } else {
        setActiveSlot(null);
    }
  };

  const comprobarRespuesta = () => {
    let todoCorrecto = true;
    let llevadasCorrectas = true;
    const ancho = filaEsperada.digitos.length;

    const nuevasClases = { producto: [...clases.producto], llevada: [...clases.llevada] };

    // Validar Producto
    for (let c = 0; c < ancho; c++) {
      const esperado = filaEsperada.digitos[c];
      if (esperado === "") continue; // Casilla vacía (ceros izq)
      
      const escrito = (entradas.producto[c] || "").trim();
      if (escrito === esperado) {
        nuevasClases.producto[c] = "correct";
      } else {
        nuevasClases.producto[c] = "incorrect";
        todoCorrecto = false;
      }
    }

    // Validar Llevadas (si están activas)
    for (let c = 0; c < ancho; c++) {
      const esperado = filaEsperada.llevadas[c];
      if (!ayudaLlevadas || esperado === "") continue;

      const escrito = (entradas.llevada[c] || "").trim();
      // Si no escribe nada y se esperaba algo, mal (o ignorar según preferencia, aquí estricto si ayuda activada)
      if (escrito === esperado) {
        nuevasClases.llevada[c] = "correct";
      } else if (escrito !== "") {
        nuevasClases.llevada[c] = "incorrect";
        llevadasCorrectas = false;
      } else {
         // Si se esperaba y está vacío, contamos como mal si queremos ser estrictos, 
         // o lo dejamos pasar. En Sumas solíamos pedir revisarlo.
         // Aquí si el usuario no pone la llevada pero saca el producto bien, a veces se perdona.
         // Pero para "comportamiento igual", validamos.
         nuevasClases.llevada[c] = "incorrect"; 
         llevadasCorrectas = false;
      }
    }

    setClases(nuevasClases);

    if (todoCorrecto) {
      if (!ayudaLlevadas || llevadasCorrectas) {
        setFeedback({ texto: "¡Multiplicación correcta! 🎉", tipo: "feedback-correct" });
        setActiveSlot(null);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setFeedback({ texto: "El producto es correcto, pero revisa las llevadas", tipo: "feedback-incorrect" });
      }
    } else {
      setFeedback({ texto: "Revisa las casillas en rojo", tipo: "feedback-incorrect" });
    }
  };

  // --- Renderizado ---
  const ancho = filaEsperada.digitos.length;
  
  // Arrays para pintar operandos alineados
  const mulcdoStr = multiplicando.toString().padStart(ancho, ' '); // Rellenar con espacios para alinear
  const mulcdrStr = multiplicador.toString().padStart(ancho, ' ');

  // Construcción de columnas
  const columnas = [];
  let operadorPintado = false;

  for (let c = 0; c < ancho; c++) {
    const tieneLlevada = filaEsperada.llevadas[c] !== "";
    const tieneProducto = filaEsperada.digitos[c] !== "";
    const digitoMult = mulcdrStr[c]; // Caracter del multiplicador en esta posición

    // Detectar si hay que pintar el 'x' (en el primer dígito no vacío del multiplicador)
    let contenidoMultiplicador = digitoMult;
    if (digitoMult !== ' ' && !operadorPintado) {
        contenidoMultiplicador = (
            <>
                <span className="cross-inline">×</span>
                <span>{digitoMult}</span>
            </>
        );
        operadorPintado = true;
    }

    columnas.push(
      <div className="column" key={c}>
        {/* Llevada */}
        <div
          className={`box carry-box ${!tieneLlevada ? 'disabled' : ''} ${ayudaLlevadas ? '' : 'hidden-by-toggle'} ${clases.llevada[c] || ''} ${activeSlot?.type === 'llevada' && activeSlot?.index === c ? 'selected' : ''}`}
          onClick={() => tieneLlevada && handleSlotClick('llevada', c)}
        >
          {entradas.llevada[c]}
        </div>

        {/* Multiplicando */}
        <div className="digit-display">{mulcdoStr[c]}</div>

        {/* Multiplicador */}
        <div className="digit-display">{contenidoMultiplicador}</div>

        <hr className="operation-line" />

        {/* Producto */}
        <div
          className={`box result-box ${!tieneProducto ? 'disabled' : ''} ${clases.producto[c] || ''} ${activeSlot?.type === 'producto' && activeSlot?.index === c ? 'selected' : ''}`}
          onClick={() => tieneProducto && handleSlotClick('producto', c)}
        >
          {entradas.producto[c]}
        </div>
      </div>
    );
  }

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Multiplicar">✖️</span>{' '}
        <span className="gradient-text">Multiplica por 1 cifra</span>
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