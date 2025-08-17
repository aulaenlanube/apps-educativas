import React, { useEffect, useMemo, useState } from "react";
import "/src/apps/_shared/Multiplicaciones.css";

/* Componente: MultiplicacionesPrimaria3
   - Multiplicaciones con multiplicador de 1 cifra (2..9)
   - Multiplicando de 2 a 3 cifras (sin ceros a la izquierda)
   - Lógica y comportamiento equivalentes al HTML/JS original proporcionado
   - Drag & drop de dígitos, casillas de producto y llevadas, ayuda con llevadas opcional
*/
export default function MultiplicacionesPrimaria3() {
  // Estado principal de la app
  const [multiplicando, setMultiplicando] = useState(0);
  const [multiplicador, setMultiplicador] = useState(0);
  const [filaEsperada, setFilaEsperada] = useState({ digitos: [], llevadas: [] }); // { digitos[], llevadas[] }
  const [ayudaLlevadas, setAyudaLlevadas] = useState(true);

  // Entradas del usuario por tipo y columna
  const [entradas, setEntradas] = useState({ producto: [], llevada: [] });
  // Clases de corrección por casilla y tipo
  const [clases, setClases] = useState({ producto: [], llevada: [] });
  // Mensaje de feedback
  const [feedback, setFeedback] = useState({ texto: "", tipo: "" });

  // Genera un número con longitud dada, sin ceros a la izquierda
  const generarNumero = (longitud) => {
    if (longitud === 1) return Math.floor(Math.random() * 9) + 1;
    const min = Math.pow(10, longitud - 1);
    const max = Math.pow(10, longitud) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Calcula fila de producto y llevadas (idéntico a lógica original)
  const calcularFilaProducto = (mulcdo, mulcdr) => {
    const tMulcdo = mulcdo.toString();
    const tMulcdr = mulcdr.toString(); // 1 cifra
    const ancho = tMulcdo.length + 1;

    const mulcdoRelleno = new Array(ancho).fill(0);
    for (let i = 0; i < tMulcdo.length; i++) {
      mulcdoRelleno[ancho - tMulcdo.length + i] = parseInt(tMulcdo[i], 10);
    }

    const digMult = parseInt(tMulcdr, 10);

    const digitos = new Array(ancho).fill("");
    const llevadasCrudas = new Array(ancho).fill(0);

    let acarreo = 0;
    for (let c = ancho - 1; c >= 0; c--) {
      const prod = mulcdoRelleno[c] * digMult + acarreo;
      const d = prod % 10;
      const nuevaLlevada = Math.floor(prod / 10);
      digitos[c] = d.toString();
      llevadasCrudas[c] = nuevaLlevada;
      acarreo = nuevaLlevada;
    }

    // Llevadas visibles en la columna de la izquierda de donde se generan
    const llevadas = new Array(ancho).fill("");
    for (let c = 0; c < ancho; c++) {
      const origen = c + 1;
      const valor = origen < ancho ? llevadasCrudas[origen] : 0;
      if (valor > 0) llevadas[c] = valor.toString();
    }

    // Limpiar ceros a la izquierda en la fila de producto
    let encontrado = false;
    for (let c = 0; c < ancho; c++) {
      const val = digitos[c];
      if (!encontrado) {
        if (val === "0") {
          digitos[c] = "";
        } else if (val !== "") {
          encontrado = true;
        }
      }
    }

    return { digitos, llevadas };
  };

  // Construye y arranca una nueva multiplicación (multiplicando: 2..3 cifras, multiplicador: 2..9)
  const generarNueva = () => {
    const longitudMultiplicando = 2 + Math.floor(Math.random() * 2); // [2..3]
    const nuevoMultiplicando = generarNumero(longitudMultiplicando);
    const nuevoMultiplicador = 2 + Math.floor(Math.random() * 8); // [2..9]

    const nuevaFila = calcularFilaProducto(nuevoMultiplicando, nuevoMultiplicador);

    setMultiplicando(nuevoMultiplicando);
    setMultiplicador(nuevoMultiplicador);
    setFilaEsperada(nuevaFila);
    setEntradas({
      producto: new Array(nuevaFila.digitos.length).fill(""),
      llevada: new Array(nuevaFila.digitos.length).fill(""),
    });
    setClases({
      producto: new Array(nuevaFila.digitos.length).fill(""),
      llevada: new Array(nuevaFila.digitos.length).fill(""),
    });
    setFeedback({ texto: "", tipo: "" });
  };

  // Genera al cargar el componente
  useEffect(() => {
    generarNueva();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Alineaciones a derecha para pintar operandos en columnas
  const ancho = filaEsperada.digitos.length;
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

  // Handlers de drag & drop
  const onDragStartNumero = (e, valor) => {
    e.dataTransfer.setData("text/plain", valor);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, tipo, col) => {
    e.preventDefault();
    const valor = e.dataTransfer.getData("text/plain");
    setEntradas((prev) => {
      const nuevo = { ...prev, [tipo]: [...prev[tipo]] };
      nuevo[tipo][col] = valor;
      return nuevo;
    });
    setClases((prev) => {
      const nuevo = { ...prev, [tipo]: [...prev[tipo]] };
      // Quita marcas anteriores al soltar
      nuevo[tipo][col] = "";
      return nuevo;
    });
  };

  // Comprobación de la respuesta (idéntica a la lógica original en resultado y criterios)
  const comprobarRespuesta = () => {
    let todoCorrecto = true;
    let llevadasCorrectas = true;

    const clasesNuevo = { producto: [...clases.producto], llevada: [...clases.llevada] };

    // Recorre casillas de producto
    for (let c = 0; c < ancho; c++) {
      const esperado = filaEsperada.digitos[c];
      if (esperado === "") {
        // Casilla deshabilitada (no objetivo)
        clasesNuevo.producto[c] = "";
        continue;
      }
      const escrito = (entradas.producto[c] || "").trim();
      if (escrito === esperado) {
        clasesNuevo.producto[c] = "correct";
      } else {
        clasesNuevo.producto[c] = "incorrect";
        todoCorrecto = false;
      }
    }

    // Recorre casillas de llevadas (solo si ayuda visible)
    for (let c = 0; c < ancho; c++) {
      const esperado = filaEsperada.llevadas[c];
      if (esperado === "") {
        // Casilla deshabilitada
        clasesNuevo.llevada[c] = "";
        continue;
      }
      if (!ayudaLlevadas) {
        // Si la ayuda está desactivada, no se evalúan llevadas
        clasesNuevo.llevada[c] = "";
        continue;
      }
      const escrito = (entradas.llevada[c] || "").trim();
      if (escrito === "") {
        // No penalizar si no escribe nada
        clasesNuevo.llevada[c] = "";
        continue;
      }
      if (escrito === esperado) {
        clasesNuevo.llevada[c] = "correct";
      } else {
        clasesNuevo.llevada[c] = "incorrect";
        llevadasCorrectas = false;
      }
    }

    setClases(clasesNuevo);

    if (todoCorrecto) {
      if (!ayudaLlevadas || llevadasCorrectas) {
        setFeedback({ texto: "¡Multiplicación correcta! 🎉", tipo: "feedback-correct" });
      } else {
        setFeedback({ texto: "El producto es correcto, revisa las llevadas", tipo: "feedback-incorrect" });
      }
    } else {
      setFeedback({ texto: "Revisa las casillas en rojo", tipo: "feedback-incorrect" });
    }
  };

  // Render de una columna
  let operadorColocado = false;
  const columnas = [];
  for (let c = 0; c < ancho; c++) {
    const valorLlevada = filaEsperada.llevadas[c];
    const targetLlevada = valorLlevada !== "";
    const valorProducto = filaEsperada.digitos[c];
    const targetProducto = valorProducto !== "";
    const dMulcdr = mulcdrRelleno[c];

    columnas.push(
      <div className="column" key={`col-${c}`}>
        {/* Fila de llevadas */}
        <div
          className={[
            "box",
            "carry-box",
            !targetLlevada ? "disabled" : "",
            ayudaLlevadas ? "" : "hidden-by-toggle",
            clases.llevada[c] || "",
          ].join(" ")}
          data-tipo="llevada"
          data-col={c}
          onDragOver={onDragOver}
          onDrop={(e) => targetLlevada && onDrop(e, "llevada", c)}
        >
          {entradas.llevada[c]}
        </div>

        {/* Multiplicando */}
        <div className="digit-display">{mulcdoRelleno[c] || ""}</div>

        {/* Multiplicador con símbolo × en la primera cifra visible */}
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

        {/* Línea separadora */}
        <hr className="operation-line" />

        {/* Fila de producto */}
        <div
          className={["box", "result-box", "parcial-box", !targetProducto ? "disabled" : "", clases.producto[c] || ""].join(" ")}
          data-tipo="producto"
          data-col={c}
          onDragOver={onDragOver}
          onDrop={(e) => targetProducto && onDrop(e, "producto", c)}
        >
          {entradas.producto[c]}
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
        <button id="check-button" onClick={comprobarRespuesta}>
          Comprobar
        </button>
        <button id="new-problem-button" onClick={generarNueva}>
          Nueva multiplicación
        </button>
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