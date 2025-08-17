import React, { useEffect, useMemo, useState } from "react";
import "/src/apps/_shared/Multiplicaciones.css";

/* Componente: MultiplicacionesPrimaria4
   - Multiplicaciones en papel con multiplicador de 2 cifras (según lógica original adjunta)
   - Genera productos parciales (una fila por cada dígito del multiplicador) y una fila de suma final
   - Arrastrar y soltar dígitos, ayuda opcional con llevadas, tolerancia de ceros a la izquierda en el resultado final
   - Lógica portadísima del index.html/script.js/style.css adjuntos
*/
export default function MultiplicacionesPrimaria4() {
  // Estado principal
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [parcialesEsperados, setParcialesEsperados] = useState([]); // [{digitos:[], llevadas:[]}]
  const [resultadoFinalEsperado, setResultadoFinalEsperado] = useState([]);
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  // Entradas del usuario
  const [entradasParciales, setEntradasParciales] = useState([]); // matriz [fila][col]
  const [entradasLlevadas, setEntradasLlevadas] = useState([]);   // matriz [fila][col]
  const [entradasFinal, setEntradasFinal] = useState([]);         // array [col]

  // Clases de corrección
  const [clasesParciales, setClasesParciales] = useState([]);
  const [clasesLlevadas, setClasesLlevadas] = useState([]);
  const [clasesFinal, setClasesFinal] = useState([]);

  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });

  // === Utilidades (idénticas en resultado a tu JS) ===
  const generarNumeroAleatorio = (longitud) => {
    if (longitud === 1) return Math.floor(Math.random() * 9) + 1;
    const min = Math.pow(10, longitud - 1);
    const max = Math.pow(10, longitud) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Calcula productos parciales y llevadas por fila (como en el JS adjunto)
  const calcularParciales = (m1, m2) => {
    const textoMultiplicando = m1.toString();
    const textoMultiplicador = m2.toString();
    const ancho = textoMultiplicando.length + textoMultiplicador.length;

    const multiplicandoRellenado = new Array(ancho).fill(0);
    for (let i = 0; i < textoMultiplicando.length; i++) {
      multiplicandoRellenado[ancho - textoMultiplicando.length + i] = parseInt(textoMultiplicando[i], 10);
    }

    const digitosMultiplicador = textoMultiplicador.split("").map(d => parseInt(d, 10)).reverse();
    const parciales = [];

    for (let r = 0; r < digitosMultiplicador.length; r++) {
      const digMult = digitosMultiplicador[r];
      const digitosFila = new Array(ancho).fill("");
      const llevadasCrudas = new Array(ancho).fill(0);
      let acarreo = 0;

      for (let c = ancho - 1; c >= 0; c--) {
        const indiceMultiplicando = c + r;
        const digMultiplicando = indiceMultiplicando < ancho ? multiplicandoRellenado[indiceMultiplicando] : 0;
        const producto = digMultiplicando * digMult + acarreo;
        const resultadoDigito = producto % 10;
        const nuevaLlevada = Math.floor(producto / 10);
        digitosFila[c] = resultadoDigito.toString();
        llevadasCrudas[c] = nuevaLlevada;
        acarreo = nuevaLlevada;
      }

      const llevadasFinales = new Array(ancho).fill("");
      for (let c = 0; c < ancho; c++) {
        const origen = c + 1;
        const valor = origen < ancho ? llevadasCrudas[origen] : 0;
        llevadasFinales[c] = valor > 0 ? valor.toString() : "";
      }

      // Desplazamiento de r columnas a la derecha (vacías)
      for (let c = ancho - r; c < ancho; c++) {
        if (c >= 0 && c < ancho) {
          digitosFila[c] = "";
          llevadasFinales[c] = "";
        }
      }

      // Limpiar ceros a la izquierda en la fila parcial
      let encontradoNoCero = false;
      for (let c = 0; c < ancho; c++) {
        const val = digitosFila[c];
        if (!encontradoNoCero) {
          if (val === "0" || val === "") {
            digitosFila[c] = "";
          } else {
            encontradoNoCero = true;
          }
        }
      }

      parciales.push({ digitos: digitosFila, llevadas: llevadasFinales });
    }
    return parciales;
  };

  const sumarParciales = (parciales) => {
    if (!parciales || parciales.length === 0) return [];
    const ancho = parciales[0].digitos.length;
    const resultado = new Array(ancho).fill("0");
    let acarreo = 0;
    for (let c = ancho - 1; c >= 0; c--) {
      let sumaColumna = acarreo;
      parciales.forEach((fila) => {
        const digStr = fila.digitos[c];
        const dig = digStr === "" ? 0 : parseInt(digStr, 10);
        sumaColumna += dig;
      });
      const digFinal = sumaColumna % 10;
      acarreo = Math.floor(sumaColumna / 10);
      resultado[c] = digFinal.toString();
    }
    return resultado;
  };

  // Genera una nueva multiplicación (con la lógica de longitudes del JS adjunto)
  const generarNueva = () => {
    const longitudMultiplicando = Math.floor(Math.random() * 2) + 2; // 2..3
    const minMul = 2;
    const maxMul = longitudMultiplicando;
    const longitudMultiplicador = minMul + Math.floor(Math.random() * (maxMul - minMul + 1));

    const m1 = generarNumeroAleatorio(longitudMultiplicando);
    const m2 = generarNumeroAleatorio(longitudMultiplicador);

    const parciales = calcularParciales(m1, m2);
    const resultado = sumarParciales(parciales);

    setMultiplicando(m1);
    setMultiplicador(m2);
    setParcialesEsperados(parciales);
    setResultadoFinalEsperado(resultado);

    // Inicializa entradas y clases
    const filas = parciales.length;
    const cols = parciales[0]?.digitos.length || 0;
    setEntradasParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setEntradasFinal(new Array(cols).fill(""));
    setClasesParciales(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesLlevadas(Array.from({ length: filas }, () => new Array(cols).fill("")));
    setClasesFinal(new Array(cols).fill(""));
    setFeedback({ texto: "", tipo: "" });
  };

  useEffect(() => {
    generarNueva();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ancho = useMemo(() => resultadoFinalEsperado.length || 0, [resultadoFinalEsperado]);

  // Preparar render de operandos alineados a la derecha
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

  // Drag & Drop
  const onDragStartNumero = (e, valor) => {
    e.dataTransfer.setData("text/plain", valor);
  };
  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, tipo, fila, col) => {
    e.preventDefault();
    const valor = e.dataTransfer.getData("text/plain");

    if (tipo === "parcial") {
      setEntradasParciales((prev) => {
        const nuevo = prev.map((filaArr) => [...filaArr]);
        nuevo[fila][col] = valor;
        return nuevo;
      });
      setClasesParciales((prev) => {
        const nuevo = prev.map((filaArr) => [...filaArr]);
        nuevo[fila][col] = "";
        return nuevo;
      });
    } else if (tipo === "llevada") {
      setEntradasLlevadas((prev) => {
        const nuevo = prev.map((filaArr) => [...filaArr]);
        nuevo[fila][col] = valor;
        return nuevo;
      });
      setClasesLlevadas((prev) => {
        const nuevo = prev.map((filaArr) => [...filaArr]);
        nuevo[fila][col] = "";
        return nuevo;
      });
    } else if (tipo === "final") {
      setEntradasFinal((prev) => {
        const nuevo = [...prev];
        nuevo[col] = valor;
        return nuevo;
      });
      setClasesFinal((prev) => {
        const nuevo = [...prev];
        nuevo[col] = "";
        return nuevo;
      });
    }
  };

  // Comprobación (idéntica en criterios a tu JS)
  const comprobarRespuesta = () => {
    let todasCorrectas = true;
    let todasLlevadasCorrectas = true;

    const clasesPar = parcialesEsperados.map((fila, r) => fila.digitos.map((_d, c) => ""));
    const clasesLev = parcialesEsperados.map((fila, r) => fila.llevadas.map((_d, c) => ""));
    const clasesFin = resultadoFinalEsperado.map(() => "");

    // Índice primera columna no-cero del resultado final
    const indicePrimeraNoCeroFinal = resultadoFinalEsperado.findIndex((d) => d !== "0");

    // Llevadas (solo si ayuda activada)
    for (let r = 0; r < parcialesEsperados.length; r++) {
      for (let c = 0; c < ancho; c++) {
        const esperado = parcialesEsperados[r].llevadas[c];
        if (esperado === "") continue; // casilla no objetivo
        if (!ayudaLlevadas) continue;  // no se evalúa
        const escrito = (entradasLlevadas[r][c] || "").trim();
        if (escrito === "") continue;  // si no escribe nada, no penaliza
        if (escrito === esperado) {
          clasesLev[r][c] = "correct";
        } else {
          clasesLev[r][c] = "incorrect";
          todasLlevadasCorrectas = false;
        }
      }
    }

    // Parciales
    for (let r = 0; r < parcialesEsperados.length; r++) {
      for (let c = 0; c < ancho; c++) {
        const esperado = parcialesEsperados[r].digitos[c];
        if (esperado === "") continue; // no es objetivo
        const escrito = (entradasParciales[r][c] || "").trim();
        if (escrito === esperado) {
          clasesPar[r][c] = "correct";
        } else {
          clasesPar[r][c] = "incorrect";
          todasCorrectas = false;
        }
      }
    }

    // Final (tolerando ceros a la izquierda)
    for (let c = 0; c < ancho; c++) {
      const esperado = resultadoFinalEsperado[c];
      const escrito = (entradasFinal[c] || "").trim();
      const esZonaIzquierda = indicePrimeraNoCeroFinal === -1 || c < indicePrimeraNoCeroFinal;
      if (esZonaIzquierda) {
        if (escrito === "" || escrito === esperado) {
          clasesFin[c] = "correct";
        } else {
          clasesFin[c] = "incorrect";
          todasCorrectas = false;
        }
      } else {
        if (escrito === esperado) {
          clasesFin[c] = "correct";
        } else {
          clasesFin[c] = "incorrect";
          todasCorrectas = false;
        }
      }
    }

    setClasesParciales(clasesPar);
    setClasesLlevadas(clasesLev);
    setClasesFinal(clasesFin);

    if (todasCorrectas) {
      if (!ayudaLlevadas || todasLlevadasCorrectas) {
        setFeedback({ texto: "¡Multiplicación correcta! 🎉", tipo: "feedback-correct" });
      } else {
        setFeedback({ texto: "El resultado es correcto, pero revisa las llevadas", tipo: "feedback-incorrect" });
      }
    } else {
      setFeedback({ texto: "Revisa las casillas en rojo", tipo: "feedback-incorrect" });
    }
  };

  // Render
  let operadorColocado = false;
  const filasParciales = parcialesEsperados.length;
  const columnas = [];
  for (let c = 0; c < ancho; c++) {
    const col = c;
    const dMulcdr = mulcdrRelleno[c];

    columnas.push(
      <div className="column" key={`col-${c}`}>
        {/* Filas de llevadas (una por fila parcial) */}
        {parcialesEsperados.map((fila, r) => {
          const target = fila.llevadas[col] !== "";
          return (
            <div
              key={`carry-${r}-${col}`}
              className={[
                "box",
                "carry-box",
                !target ? "disabled" : "",
                ayudaLlevadas ? "" : "hidden-by-toggle",
                clasesLlevadas[r]?.[col] || "",
              ].join(" ")}
              onDragOver={onDragOver}
              onDrop={(e) => target && onDrop(e, "llevada", r, col)}
            >
              {entradasLlevadas[r]?.[col] || ""}
            </div>
          );
        })}

        {/* Multiplicando */}
        <div className="digit-display">{mulcdoRelleno[col] || ""}</div>

        {/* Multiplicador con × en su primer dígito visible */}
        <div className="digit-display">
          {dMulcdr ? (
            !operadorColocado ? (
              <>
                <span className="cross-inline">×</span>
                <span>{dMulcdr}</span>
              </>
            ) : (
              dMulcdr
            )
          ) : (
            ""
          )}
        </div>
        {dMulcdr && !operadorColocado ? (operadorColocado = true) : null}

        {/* Línea antes de parciales */}
        <hr className="operation-line" />

        {/* Filas de parciales */}
        {parcialesEsperados.map((fila, r) => {
          const target = fila.digitos[col] !== "";
          return (
            <div
              key={`parcial-${r}-${col}`}
              className={[
                "box",
                "result-box",
                "parcial-box",
                !target ? "disabled" : "",
                clasesParciales[r]?.[col] || "",
              ].join(" ")}
              onDragOver={onDragOver}
              onDrop={(e) => target && onDrop(e, "parcial", r, col)}
            >
              {entradasParciales[r]?.[col] || ""}
            </div>
          );
        })}

        {/* Línea antes del resultado final */}
        <hr className="operation-line" />

        {/* Resultado final */}
        <div
          className={["box", "result-box", "final-box", clasesFinal[col] || ""].join(" ")}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, "final", 0, col)}
        >
          {entradasFinal[col] || ""}
        </div>
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