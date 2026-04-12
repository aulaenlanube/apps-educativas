import React, { useEffect, useState, useCallback } from "react";
import confetti from 'canvas-confetti';
import "/src/apps/_shared/Multiplicaciones.css";
import MathOperationLayout from '../../_shared/MathOperationLayout';

export default function MultiplicacionesPrimaria3() {
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [filaEsperada, setFilaEsperada] = useState({ digitos: [], llevadas: [] });
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);
  const [entradas, setEntradas] = useState({ producto: [], llevada: [] });
  const [clases, setClases] = useState({ producto: [], llevada: [] });
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

  const generarNumero = (longitud) => {
    if (longitud === 1) return Math.floor(Math.random() * 9) + 1;
    const min = Math.pow(10, longitud - 1);
    const max = Math.pow(10, longitud) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const calcularFilaProducto = useCallback((mulcdo, mulcdr) => {
    const tMulcdo = mulcdo.toString();
    const ancho = tMulcdo.length + 1;
    const mulcdoRelleno = new Array(ancho).fill(0);
    for (let i = 0; i < tMulcdo.length; i++) {
      mulcdoRelleno[ancho - tMulcdo.length + i] = parseInt(tMulcdo[i], 10);
    }
    const digMult = parseInt(mulcdr.toString(), 10);
    const digitos = new Array(ancho).fill("");
    const llevadasCrudas = new Array(ancho).fill(0);
    let acarreo = 0;
    for (let c = ancho - 1; c >= 0; c--) {
      const prod = mulcdoRelleno[c] * digMult + acarreo;
      digitos[c] = (prod % 10).toString();
      llevadasCrudas[c] = Math.floor(prod / 10);
      acarreo = Math.floor(prod / 10);
    }
    const llevadas = new Array(ancho).fill("");
    for (let c = 0; c < ancho; c++) {
      const origen = c + 1;
      const valor = origen < ancho ? llevadasCrudas[origen] : 0;
      if (valor > 0) llevadas[c] = valor.toString();
    }
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
    const longitudMultiplicando = 2 + Math.floor(Math.random() * 2);
    const nuevoMultiplicando = generarNumero(longitudMultiplicando);
    const nuevoMultiplicador = 2 + Math.floor(Math.random() * 8);
    const nuevaFila = calcularFilaProducto(nuevoMultiplicando, nuevoMultiplicador);
    setMultiplicando(nuevoMultiplicando);
    setMultiplicador(nuevoMultiplicador);
    setFilaEsperada(nuevaFila);
    const ancho = nuevaFila.digitos.length;
    setEntradas({ producto: new Array(ancho).fill(""), llevada: new Array(ancho).fill("") });
    setClases({ producto: new Array(ancho).fill(""), llevada: new Array(ancho).fill("") });
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'producto', index: ancho - 1 });
  }, [calcularFilaProducto]);

  useEffect(() => { generarNueva(); }, [generarNueva]);

  const handleSlotClick = (type, index) => setActiveSlot({ type, index });

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();
    const { type, index } = activeSlot;

    setEntradas((prev) => {
      const nuevo = { ...prev, [type]: [...prev[type]] };
      nuevo[type][index] = strVal;
      return nuevo;
    });
    setClases((prev) => {
      const nuevo = { ...prev, [type]: [...prev[type]] };
      nuevo[type][index] = "";
      return nuevo;
    });

    if (type === 'producto' && ayudaLlevadas) {
      if (strVal === filaEsperada.digitos[index]) {
        const leftIndex = index - 1;
        if (leftIndex >= 0) {
          const expectedCarry = filaEsperada.llevadas[leftIndex];
          if (expectedCarry) {
            setEntradas(prev => {
              const n = { ...prev, llevada: [...prev.llevada] };
              n.llevada[leftIndex] = expectedCarry;
              return n;
            });
          }
        }
      }
    }

    const nextIndex = index - 1;
    if (nextIndex >= 0) setActiveSlot({ type, index: nextIndex });
    else setActiveSlot(null);
  };

  const comprobarRespuesta = () => {
    let todoCorrecto = true;
    let llevadasCorrectas = true;
    const ancho = filaEsperada.digitos.length;
    const nuevasClases = { producto: [...clases.producto], llevada: [...clases.llevada] };

    for (let c = 0; c < ancho; c++) {
      const esperado = filaEsperada.digitos[c];
      if (esperado === "") continue;
      if ((entradas.producto[c] || "").trim() === esperado) nuevasClases.producto[c] = "correct";
      else { nuevasClases.producto[c] = "incorrect"; todoCorrecto = false; }
    }

    for (let c = 0; c < ancho; c++) {
      const esperado = filaEsperada.llevadas[c];
      if (!ayudaLlevadas || esperado === "") continue;
      const escrito = (entradas.llevada[c] || "").trim();
      if (escrito === esperado) nuevasClases.llevada[c] = "correct";
      else if (escrito !== "") { nuevasClases.llevada[c] = "incorrect"; llevadasCorrectas = false; }
      else { nuevasClases.llevada[c] = "incorrect"; llevadasCorrectas = false; }
    }
    setClases(nuevasClases);

    if (todoCorrecto) {
      if (!ayudaLlevadas || llevadasCorrectas) {
        setFeedback({ text: '¡Multiplicación correcta! 🎉', cls: 'feedback-correct' });
        setActiveSlot(null);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setFeedback({ text: 'El producto es correcto, pero revisa las llevadas', cls: 'feedback-incorrect' });
      }
    } else {
      setFeedback({ text: 'Revisa las casillas en rojo', cls: 'feedback-incorrect' });
    }
  };

  // --- Board rendering ---
  const ancho = filaEsperada.digitos.length;
  const mulcdoStr = multiplicando.toString().padStart(ancho, ' ');
  const mulcdrStr = multiplicador.toString().padStart(ancho, ' ');

  const columnas = [];
  let operadorPintado = false;
  for (let c = 0; c < ancho; c++) {
    const tieneLlevada = filaEsperada.llevadas[c] !== "";
    const tieneProducto = filaEsperada.digitos[c] !== "";
    const digitoMult = mulcdrStr[c];
    let contenidoMultiplicador = digitoMult;
    if (digitoMult !== ' ' && !operadorPintado) {
      contenidoMultiplicador = (<><span className="cross-inline">×</span><span>{digitoMult}</span></>);
      operadorPintado = true;
    }
    columnas.push(
      <div className="column" key={c}>
        <div className={`box carry-box ${!tieneLlevada ? 'disabled' : ''} ${ayudaLlevadas ? '' : 'hidden-by-toggle'} ${clases.llevada[c] || ''} ${activeSlot?.type === 'llevada' && activeSlot?.index === c ? 'selected' : ''}`}
          onClick={() => tieneLlevada && handleSlotClick('llevada', c)}>
          {entradas.llevada[c]}
        </div>
        <div className="digit-display">{mulcdoStr[c]}</div>
        <div className="digit-display">{contenidoMultiplicador}</div>
        <hr className="operation-line" />
        <div className={`box result-box ${!tieneProducto ? 'disabled' : ''} ${clases.producto[c] || ''} ${activeSlot?.type === 'producto' && activeSlot?.index === c ? 'selected' : ''}`}
          onClick={() => tieneProducto && handleSlotClick('producto', c)}>
          {entradas.producto[c]}
        </div>
      </div>
    );
  }

  return (
    <MathOperationLayout
      title="Multiplica por 1 cifra"
      emoji="✖️"
      feedback={feedback}
      onCheck={comprobarRespuesta}
      onNew={generarNueva}
      newLabel="Nueva"
      toggleLabel="Ayuda con llevadas"
      toggleValue={ayudaLlevadas}
      onToggleChange={setAyudaLlevadas}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Toca los números 👇"
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Completa la multiplicacion colocando cada digito en su casilla correcta.</p>
          <h3>Como se juega</h3>
          <ul>
            <li>Pulsa en una casilla vacia para seleccionarla.</li>
            <li>Coloca el digito correcto desde la paleta numerica.</li>
            <li>Recuerda completar tambien las llevadas si estan visibles.</li>
          </ul>
        </>
      }
    >
      <div id="problem-area" className={ayudaLlevadas ? "" : "carries-hidden"}>
        {columnas}
      </div>
    </MathOperationLayout>
  );
}
