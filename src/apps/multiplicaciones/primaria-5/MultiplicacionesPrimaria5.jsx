import React, { useEffect, useMemo, useState } from "react";
import "/src/apps/_shared/Multiplicaciones.css";

export default function MultiplicacionesPrimaria5() {
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [parcialesEsperados, setParcialesEsperados] = useState([]);
  const [resultadoFinalEsperado, setResultadoFinalEsperado] = useState([]);
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  const [entradasParciales, setEntradasParciales] = useState([]);
  const [entradasLlevadas, setEntradasLlevadas] = useState([]);
  const [entradasFinal, setEntradasFinal] = useState([]);
  const [clasesParciales, setClasesParciales] = useState([]);
  const [clasesLlevadas, setClasesLlevadas] = useState([]);
  const [clasesFinal, setClasesFinal] = useState([]);
  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });

  // Generador de número aleatorio de longitud dada
  const generarNumero = (longitud) => {
    if (longitud === 1) return Math.floor(Math.random() * 9) + 1;
    const min = Math.pow(10, longitud - 1);
    const max = Math.pow(10, longitud) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Calcula parciales
  const calcularParciales = (m1, m2) => {
    const t1 = m1.toString();
    const t2 = m2.toString();
    const ancho = t1.length + t2.length;

    const relleno1 = new Array(ancho).fill(0);
    for (let i = 0; i < t1.length; i++) {
      relleno1[ancho - t1.length + i] = parseInt(t1[i], 10);
    }

    const digMultiplicador = t2.split("").map((d) => parseInt(d, 10)).reverse();
    const parciales = [];

    for (let r = 0; r < digMultiplicador.length; r++) {
      const dMult = digMultiplicador[r];
      const digitosFila = new Array(ancho).fill("");
      const llevadasCrudas = new Array(ancho).fill(0);
      let acarreo = 0;

      for (let c = ancho - 1; c >= 0; c--) {
        const idx = c + r;
        const dMulcdo = idx < ancho ? relleno1[idx] : 0;
        const prod = dMulcdo * dMult + acarreo;
        digitosFila[c] = (prod % 10).toString();
        llevadasCrudas[c] = Math.floor(prod / 10);
        acarreo = llevadasCrudas[c];
      }

      const llevadas = new Array(ancho).fill("");
      for (let c = 0; c < ancho; c++) {
        const origen = c + 1;
        const val = origen < ancho ? llevadasCrudas[origen] : 0;
        if (val > 0) llevadas[c] = val.toString();
      }

      // Desplazar según la fila
      for (let c = ancho - r; c < ancho; c++) {
        digitosFila[c] = "";
        llevadas[c] = "";
      }

      // Limpiar ceros a la izquierda
      let encontrado = false;
      for (let c = 0; c < ancho; c++) {
        if (!encontrado) {
          if (digitosFila[c] === "0") digitosFila[c] = "";
          else if (digitosFila[c] !== "") encontrado = true;
        }
      }
      parciales.push({ digitos: digitosFila, llevadas });
    }
    return parciales;
  };

  const sumarParciales = (parciales) => {
    const ancho = parciales[0].digitos.length;
    const resultado = new Array(ancho).fill("0");
    let acarreo = 0;
    for (let c = ancho - 1; c >= 0; c--) {
      let suma = acarreo;
      parciales.forEach((fila) => {
        suma += fila.digitos[c] === "" ? 0 : parseInt(fila.digitos[c], 10);
      });
      resultado[c] = (suma % 10).toString();
      acarreo = Math.floor(suma / 10);
    }
    return resultado;
  };

  const generarNueva = () => {
    const longitudMultiplicando = Math.floor(Math.random() * 2) + 3; // 3 o 4 cifras
    const longitudMultiplicador = Math.floor(Math.random() * 2) + 2; // 2 o 3 cifras
    const m1 = generarNumero(longitudMultiplicando);
    const m2 = generarNumero(longitudMultiplicador);

    const parciales = calcularParciales(m1, m2);
    const resultado = sumarParciales(parciales);

    setMultiplicando(m1);
    setMultiplicador(m2);
    setParcialesEsperados(parciales);
    setResultadoFinalEsperado(resultado);

    const filas = parciales.length;
    const cols = parciales[0].digitos.length;
    setEntradasParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasFinal(new Array(cols).fill(""));
    setClasesParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesFinal(new Array(cols).fill(""));
    setFeedback({ texto: "", tipo: "" });
  };

  useEffect(() => { generarNueva(); }, []);

  const ancho = resultadoFinalEsperado.length || 0;
  const mulcdoRelleno = useMemo(() => {
    const t = multiplicando.toString();
    const arr = new Array(ancho).fill("");
    for (let i = 0; i < t.length; i++) arr[ancho - t.length + i] = t[i];
    return arr;
  }, [multiplicando, ancho]);

  const mulcdrRelleno = useMemo(() => {
    const t = multiplicador.toString();
    const arr = new Array(ancho).fill("");
    for (let i = 0; i < t.length; i++) arr[ancho - t.length + i] = t[i];
    return arr;
  }, [multiplicador, ancho]);

  const onDragStart = (e, valor) => e.dataTransfer.setData("text/plain", valor);
  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, tipo, fila, col) => {
    e.preventDefault();
    const valor = e.dataTransfer.getData("text/plain");
    if (tipo === "parcial") {
      setEntradasParciales((p) => { const n = p.map(f => [...f]); n[fila][col] = valor; return n; });
      setClasesParciales((p) => { const n = p.map(f => [...f]); n[fila][col] = ""; return n; });
    } else if (tipo === "llevada") {
      setEntradasLlevadas((p) => { const n = p.map(f => [...f]); n[fila][col] = valor; return n; });
      setClasesLlevadas((p) => { const n = p.map(f => [...f]); n[fila][col] = ""; return n; });
    } else {
      setEntradasFinal((p) => { const n = [...p]; n[col] = valor; return n; });
      setClasesFinal((p) => { const n = [...p]; n[col] = ""; return n; });
    }
  };

  const comprobarRespuesta = () => {
    let ok = true, okLlevadas = true;
    const clasesPar = parcialesEsperados.map(f => f.digitos.map(() => ""));
    const clasesLev = parcialesEsperados.map(f => f.llevadas.map(() => ""));
    const clasesFin = resultadoFinalEsperado.map(() => "");

    const primeraNoCero = resultadoFinalEsperado.findIndex(d => d !== "0");

    parcialesEsperados.forEach((fila, r) => {
      fila.llevadas.forEach((esperado, c) => {
        if (esperado !== "" && ayudaLlevadas) {
          const escrito = (entradasLlevadas[r][c] || "").trim();
          if (escrito === esperado) clasesLev[r][c] = "correct";
          else if (escrito !== "") { clasesLev[r][c] = "incorrect"; okLlevadas = false; }
        }
      });
      fila.digitos.forEach((esperado, c) => {
        if (esperado !== "") {
          const escrito = (entradasParciales[r][c] || "").trim();
          if (escrito === esperado) clasesPar[r][c] = "correct";
          else { clasesPar[r][c] = "incorrect"; ok = false; }
        }
      });
    });

    resultadoFinalEsperado.forEach((esperado, c) => {
      const escrito = (entradasFinal[c] || "").trim();
      const izquierda = primeraNoCero === -1 || c < primeraNoCero;
      if (izquierda) {
        if (escrito === "" || escrito === esperado) clasesFin[c] = "correct";
        else { clasesFin[c] = "incorrect"; ok = false; }
      } else {
        if (escrito === esperado) clasesFin[c] = "correct";
        else { clasesFin[c] = "incorrect"; ok = false; }
      }
    });

    setClasesParciales(clasesPar);
    setClasesLlevadas(clasesLev);
    setClasesFinal(clasesFin);

    if (ok) {
      if (!ayudaLlevadas || okLlevadas) setFeedback({ texto: "¡Multiplicación correcta! 🎉", tipo: "feedback-correct" });
      else setFeedback({ texto: "Revisa las llevadas", tipo: "feedback-incorrect" });
    } else setFeedback({ texto: "Revisa las casillas en rojo", tipo: "feedback-incorrect" });
  };

  let operadorColocado = false;
  const columnas = [];
  for (let c = 0; c < ancho; c++) {
    const dMulcdr = mulcdrRelleno[c];
    columnas.push(
      <div className="column" key={c}>
        {parcialesEsperados.map((fila, r) =>
          <div key={`carry-${r}-${c}`} className={["box","carry-box",fila.llevadas[c]===""?"disabled":"","",clasesLlevadas[r]?.[c]||"",ayudaLlevadas?"":"hidden-by-toggle"].join(" ")}
            onDragOver={onDragOver} onDrop={(e)=>fila.llevadas[c]!==""&&onDrop(e,"llevada",r,c)}>{entradasLlevadas[r]?.[c]||""}</div>
        )}
        <div className="digit-display">{mulcdoRelleno[c]||""}</div>
        <div className="digit-display">
          {dMulcdr ? !operadorColocado ? (<><span className="cross-inline">×</span><span>{dMulcdr}</span></>) : dMulcdr : ""}
        </div>
        {dMulcdr && !operadorColocado ? operadorColocado = true : null}
        <hr className="operation-line"/>
        {parcialesEsperados.map((fila, r) =>
          <div key={`parcial-${r}-${c}`} className={["box","result-box","parcial-box",fila.digitos[c]===""?"disabled":"","",clasesParciales[r]?.[c]||""].join(" ")}
            onDragOver={onDragOver} onDrop={(e)=>fila.digitos[c]!==""&&onDrop(e,"parcial",r,c)}>{entradasParciales[r]?.[c]||""}</div>
        )}
        <hr className="operation-line"/>
        <div className={["box","result-box","final-box",clasesFinal[c]||""].join(" ")}
          onDragOver={onDragOver} onDrop={(e)=>onDrop(e,"final",0,c)}>{entradasFinal[c]||""}</div>
      </div>
    );
  }

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Multiplica como en el cole</span>
      </h1>
      <div id="options-area">
        <label>Ayuda con llevadas</label>
        <label className="switch"><input type="checkbox" checked={ayudaLlevadas} onChange={(e)=>setAyudaLlevadas(e.target.checked)}/>
          <span className="slider round"></span></label>
      </div>
      <div id="problem-area" className={ayudaLlevadas?"":"carries-hidden"}>{columnas}</div>
      <div id="feedback-message" className={feedback.tipo}>{feedback.texto}</div>
      <div id="controls">
        <button id="check-button" onClick={comprobarRespuesta}>Comprobar</button>
        <button id="new-problem-button" onClick={generarNueva}>Nueva multiplicación</button>
      </div>
      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {Array.from({length:10},(_,d)=>
            <div key={d} className="number-tile" draggable onDragStart={(e)=>onDragStart(e,String(d))}>{d}</div>)}
        </div>
      </div>
    </div>
  );
}
