import React, { useEffect, useMemo, useState } from "react";
import "/src/apps/_shared/Multiplicaciones.css";

/* 6º Primaria con decimales (coma manual por clic en huecos)
   - Multiplicador: total de cifras (enteras+decimales) ∈ [2,3]
   - Multiplicando: total de cifras (enteras+decimales) ∈ [3,5]
   - Al menos uno con decimales
   - Se multiplica como enteros; la coma del resultado = d1 + d2
   - La coma del resultado se coloca pulsando una mini-caja entre dígitos
*/

export default function MultiplicacionesPrimaria6() {
  const [multiplicando, setMultiplicando] = useState("");
  const [multiplicador, setMultiplicador] = useState("");
  const [d1, setD1] = useState(0);
  const [d2, setD2] = useState(0);
  const [decimalesTotal, setDecimalesTotal] = useState(0);

  const [parcialesEsperados, setParcialesEsperados] = useState([]); // [{digitos:[], llevadas:[]}]
  const [resultadoFinalEsperado, setResultadoFinalEsperado] = useState([]); // ["1","2","3",...]
  const [commaSlot, setCommaSlot] = useState(null); // hueco seleccionado en el resultado (0..ancho)

  const [entradasParciales, setEntradasParciales] = useState([]); // [fila][col]
  const [entradasLlevadas, setEntradasLlevadas] = useState([]);   // [fila][col]
  const [entradasFinal, setEntradasFinal] = useState([]);         // [col] solo dígitos (sin coma)

  const [clasesParciales, setClasesParciales] = useState([]);     // [fila][col]
  const [clasesLlevadas, setClasesLlevadas] = useState([]);       // [fila][col]
  const [clasesFinal, setClasesFinal] = useState([]);             // [col]

  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  // ---------- Utilidades ----------
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
        if (val > 0) llevadas[c] = val.toString();
      }
      // Desplazamiento r (×10^r)
      for (let k = 0; k < r; k++) {
        fila[ancho - 1 - k] = "";
        llevadas[ancho - 1 - k] = "";
      }
      // Limpiar ceros a la izquierda (solo visual)
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
    const ancho = parciales[0].digitos.length;
    const res = new Array(ancho).fill("0");
    let acarreo = 0;
    for (let c = ancho - 1; c >= 0; c--) {
      let suma = acarreo;
      for (let r = 0; r < parciales.length; r++) {
        const d = parciales[r].digitos[c];
        suma += d === "" ? 0 : parseInt(d, 10);
      }
      res[c] = (suma % 10).toString();
      acarreo = Math.floor(suma / 10);
    }
    return res;
  };

  // ---------- Nueva operación ----------
  const generarNueva = () => {
    const totalB = randInt(2, 3); // multiplicador 2..3 dígitos totales
    let decB = randInt(0, totalB - 1);
    const totalA = randInt(3, 5); // multiplicando 3..5 dígitos totales
    let decA = randInt(0, totalA - 1);

    if (decA === 0 && decB === 0) {
      if (totalB >= 2) decB = 1;
      else decA = 1;
    }

    const A = generarPorTotalYDec(totalA, decA);
    const B = generarPorTotalYDec(totalB, decB);

    const { n1, n2, d1, d2, decimales } = prepararMultiplicacion(A.texto, B.texto);
    const parciales = calcularParciales(n1, n2);
    const resultado = sumarParciales(parciales);

    setMultiplicando(A.texto);
    setMultiplicador(B.texto);
    setD1(d1);
    setD2(d2);
    setDecimalesTotal(decimales);
    setParcialesEsperados(parciales);
    setResultadoFinalEsperado(resultado);

    const filas = parciales.length;
    const cols = parciales[0].digitos.length;
    setEntradasParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasFinal(new Array(cols).fill("")); // solo dígitos
    setClasesParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesFinal(new Array(cols).fill(""));
    setCommaSlot(null); // sin coma seleccionada
    setFeedback({ texto: "", tipo: "" });
  };

  useEffect(() => { generarNueva(); }, []);

  // ---------- Preparación render ----------
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

  const idxComaMultiplicando = d1 > 0 ? ancho - d1 - 1 : null;
  const idxComaMultiplicador = d2 > 0 ? ancho - d2 - 1 : null;

  // Hueco correcto para la coma del resultado (0..ancho)
  // Slot s está entre columnas s-1 y s (contando desde la izquierda)
  const expectedCommaSlot = decimalesTotal > 0 ? (ancho - decimalesTotal) : null;

  // ---------- Drag & Drop (solo dígitos) ----------
  const onDragStartNumero = (e, valor) => e.dataTransfer.setData("text/plain", valor);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, tipo, fila, col) => {
    e.preventDefault();
    const valor = e.dataTransfer.getData("text/plain"); // "0".."9"
    if (!/^\d$/.test(valor)) return; // no permitir comas ni otros
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

  // ---------- Comprobación ----------
  const comprobarRespuesta = () => {
    let ok = true, okLlevadas = true;

    const clasesPar = parcialesEsperados.map(f => f.digitos.map(() => ""));
    const clasesLev = parcialesEsperados.map(f => f.llevadas.map(() => ""));
    const clasesFin = resultadoFinalEsperado.map(() => "");

    const primeraNoCero = resultadoFinalEsperado.findIndex(d => d !== "0");

    // Llevadas
    for (let r = 0; r < parcialesEsperados.length; r++) {
      for (let c = 0; c < ancho; c++) {
        const esperado = parcialesEsperados[r].llevadas[c];
        if (esperado === "" || !ayudaLlevadas) continue;
        const escrito = (entradasLlevadas[r][c] || "").trim();
        if (escrito === "") continue;
        if (escrito === esperado) clasesLev[r][c] = "correct";
        else { clasesLev[r][c] = "incorrect"; okLlevadas = false; }
      }
    }

    // Parciales
    for (let r = 0; r < parcialesEsperados.length; r++) {
      for (let c = 0; c < ancho; c++) {
        const esperado = parcialesEsperados[r].digitos[c];
        if (esperado === "") continue;
        const escrito = (entradasParciales[r][c] || "").trim();
        if (escrito === esperado) clasesPar[r][c] = "correct";
        else { clasesPar[r][c] = "incorrect"; ok = false; }
      }
    }

    // Final (dígitos con tolerancia de ceros a la izquierda)
    for (let c = 0; c < ancho; c++) {
      const esperado = resultadoFinalEsperado[c];
      const escrito = (entradasFinal[c] || "").trim();
      const izquierda = primeraNoCero === -1 || c < primeraNoCero;
      if (izquierda) {
        if (escrito === "" || escrito === esperado) clasesFin[c] = "correct";
        else { clasesFin[c] = "incorrect"; ok = false; }
      } else {
        if (escrito === esperado) clasesFin[c] = "correct";
        else { clasesFin[c] = "incorrect"; ok = false; }
      }
    }

    // Coma manual: debe existir y estar en el hueco exacto
    if (decimalesTotal > 0) {
      if (commaSlot === expectedCommaSlot) {
        // correcto
      } else {
        ok = false;
      }
    } else {
      // No se espera coma: si el usuario marcó un hueco, lo consideramos incorrecto
      if (commaSlot !== null) ok = false;
    }

    setClasesParciales(clasesPar);
    setClasesLlevadas(clasesLev);
    setClasesFinal(clasesFin);

    if (ok) {
      if (!ayudaLlevadas || okLlevadas) setFeedback({ texto: "¡Multiplicación correcta! 🎉", tipo: "feedback-correct" });
      else setFeedback({ texto: "El resultado es correcto, revisa las llevadas", tipo: "feedback-incorrect" });
    } else {
      setFeedback({ texto: "Revisa las casillas en rojo o la posición de la coma", tipo: "feedback-incorrect" });
    }
  };

  // ---------- Render ----------
  let operadorColocado = false;
  const columnas = [];
  for (let c = 0; c < ancho; c++) {
    const dMulcdr = mulcdrRelleno[c];
    const comaA = d1 > 0 && c === (ancho - d1 - 1);
    const comaB = d2 > 0 && c === (ancho - d2 - 1);

    columnas.push(
      <div className="column" key={`col-${c}`}>
        {/* Llevadas */}
        {parcialesEsperados.map((fila, r) => {
          const target = fila.llevadas[c] !== "";
          return (
            <div
              key={`carry-${r}-${c}`}
              className={[
                "box","carry-box",
                !target ? "disabled" : "",
                ayudaLlevadas ? "" : "hidden-by-toggle",
                clasesLlevadas[r]?.[c] || "",
              ].join(" ")}
              onDragOver={onDragOver}
              onDrop={(e) => target && onDrop(e, "llevada", r, c)}
            >
              {entradasLlevadas[r]?.[c] || ""}
            </div>
          );
        })}

        {/* Operandos */}
        <div className="digit-display with-decimal">
          {mulcdoRelleno[c] || ""}
          {comaA ? <span className="decimal-mark">,</span> : null}
        </div>
        <div className="digit-display with-decimal">
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
          const target = fila.digitos[c] !== "";
          return (
            <div
              key={`parcial-${r}-${c}`}
              className={[
                "box","result-box","parcial-box",
                !target ? "disabled" : "",
                clasesParciales[r]?.[c] || "",
              ].join(" ")}
              onDragOver={onDragOver}
              onDrop={(e) => target && onDrop(e, "parcial", r, c)}
            >
              {entradasParciales[r]?.[c] || ""}
            </div>
          );
        })}

        <hr className="operation-line" />

        {/* Resultado: solo dígitos (la coma va en los huecos) */}
        <div
          className={["box","result-box","final-box",clasesFinal[c] || ""].join(" ")}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "final", 0, c)}
        >
          {entradasFinal[c] || ""}
        </div>
      </div>
    );
  }

  // Fila de "huecos" para marcar la coma (ancho+1 huecos entre/bordes)
  const commaSlots = [];
  for (let s = 0; s <= ancho; s++) {
    const activo = commaSlot === s;
    const esCorrecto = expectedCommaSlot === s;
    commaSlots.push(
      <div
        key={`slot-${s}`}
        className={[
          "comma-slot",
          activo ? "active" : "",
          decimalesTotal > 0 && esCorrecto ? "guide" : ""
        ].join(" ")}
        onClick={() => {
          if (decimalesTotal === 0) {
            // Si no debe haber coma, permitir sólo desactivar
            setCommaSlot(null);
            return;
          }
          setCommaSlot(prev => (prev === s ? null : s));
        }}
        title={decimalesTotal > 0 ? "Marca aquí la coma" : "Esta operación no lleva coma"}
      />
    );
  }

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

      {/* Fila de huecos para la coma bajo el resultado */}
      <div className="comma-row">
        {commaSlots}
      </div>

      <div id="feedback-message" className={feedback.tipo}>
        {feedback.texto}
      </div>

      <div id="controls">
        <button id="check-button" onClick={comprobarRespuesta}>Comprobar</button>
        <button id="new-problem-button" onClick={generarNueva}>Nueva multiplicación</button>
      </div>

      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {Array.from({ length: 10 }, (_, d) => (
            <div
              key={`tile-${d}`}
              className="number-tile"
              draggable
              onDragStart={(e) => onDragStartNumero(e, String(d))}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
