import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import './BuscaElIntruso.css';

/**
 * BuscaElIntruso
 * Juego que alterna entre discriminación visual (emojis) y semántica (palabras/conceptos).
 * La apariencia se adapta automáticamente celda por celda y según la densidad del tablero.
 */
const BuscaElIntruso = ({ tema }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const nivel = level || 'primaria';
  const curso = gradeParam || '1';
  
  // Datos crudos cargados del JSON
  const [datosJuego, setDatosJuego] = useState(null);
  
  // MODO LÓGICO: 
  // 'visual' = 1º Primaria (Grid denso 4x8)
  // 'conceptual' = 2º-6º Primaria (Grid amplio 3x4)
  const [modoLogico, setModoLogico] = useState('visual'); 

  const [estado, setEstado] = useState({
    modo: 'libre',
    ronda: 0,
    rondasTotales: 10,
    aciertos: 0,
    errores: 0,
    tiempoInicio: 0,
    indiceIntruso: -1,
    bloqueoClicks: false,
    tablero: [],
    rows: 4,
    cols: 8,
    mensaje: 'Cargando...',
    categoria: '', 
    mensajeClase: 'feedback-intruso',
    feedbackCellIndex: -1,
    feedbackCellStatus: ''
  });

  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const temporizadorRef = useRef(null);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const asignatura = tema || (typeof subjectId === 'string' && subjectId.trim() ? subjectId.trim() : 'general');

  // Helper: Detecta si un item debe tratarse como texto o como icono
  const contieneLetras = (str) => {
    if (!str) return false;
    // Busca cualquier letra del alfabeto (incluyendo acentos, ñ, ç)
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ]/.test(String(str));
  };

  // --- Carga de Datos ---
  useEffect(() => {
    let vivo = true;
    setDatosJuego(null);
    const base = import.meta.env.BASE_URL || '/';
    
    const urls = [];
    if (asignatura && asignatura !== 'general') {
      urls.push(`${base}data/${nivel}/${curso}/${asignatura}-busca-el-intruso.json`);
    }
    urls.push(`${base}data/${nivel}/${curso}/busca-el-intruso.json`);
    
    if (nivel === 'primaria' && curso === '1') {
       urls.push(`${base}data/primaria/1/busca-el-intruso.json`); 
    }

    const cargar = async (url) => {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    };

    (async () => {
      for (const url of urls) {
        try {
          const datos = await cargar(url);
          if (vivo) {
            // Determinar Modo Lógico (Juego)
            if (Array.isArray(datos) && typeof datos[0] === 'string') {
              setModoLogico('visual'); 
            } else {
              setModoLogico('conceptual');
            }
            setDatosJuego(datos);
            return;
          }
        } catch (e) {
          console.warn(`No se pudo cargar ${url}`, e);
        }
      }
      if (vivo) setDatosJuego([]);
    })();

    return () => { vivo = false; };
  }, [asignatura, nivel, curso]);

  // --- Cronómetro ---
  const iniciarCronometro = () => {
    detenerCronometro();
    const startTime = performance.now();
    setEstado(prev => ({ ...prev, tiempoInicio: startTime }));
    const tick = () => {
      setTiempoTranscurrido(((performance.now() - startTime) / 1000));
      temporizadorRef.current = requestAnimationFrame(tick);
    };
    temporizadorRef.current = requestAnimationFrame(tick);
  };
  
  const detenerCronometro = () => {
    if (temporizadorRef.current) {
      cancelAnimationFrame(temporizadorRef.current);
      temporizadorRef.current = null;
    }
  };

  // --- Lógica del Juego ---
  const generarYRenderizarColeccion = () => {
    if (!datosJuego || datosJuego.length === 0) return;

    let nuevoTablero = [];
    let indiceIntruso = -1;
    let rows, cols;
    let mensaje = '';
    let categoria = '';

    if (modoLogico === 'visual') {
      rows = 4; cols = 8;
      const total = rows * cols;
      const { base, intruso } = elegirParEmojisVisual(datosJuego);
      indiceIntruso = Math.floor(Math.random() * total);
      nuevoTablero = Array.from({ length: total }, (_, i) => (i === indiceIntruso ? intruso : base));
      mensaje = 'Pulsa el emoji distinto';
    
    } else {
      // Modo Conceptual
      rows = 3; cols = 4;
      const total = rows * cols;
      const desafio = datosJuego[Math.floor(Math.random() * datosJuego.length)];
      const intruso = desafio.intrusos[Math.floor(Math.random() * desafio.intrusos.length)];
      
      const correctosNecesarios = total - 1;
      let correctosElegidos = [];
      const poolCorrectos = [...desafio.correctos].sort(() => Math.random() - 0.5);
      
      let i = 0;
      while (correctosElegidos.length < correctosNecesarios) {
        correctosElegidos.push(poolCorrectos[i % poolCorrectos.length]);
        i++;
      }

      indiceIntruso = Math.floor(Math.random() * total);
      nuevoTablero = [...correctosElegidos];
      nuevoTablero.splice(indiceIntruso, 0, intruso);

      mensaje = 'Pulsa lo que no debe estar ahí';
      categoria = desafio.categoria;
    }

    setEstado(prev => ({
      ...prev,
      rows,
      cols,
      tablero: nuevoTablero,
      indiceIntruso,
      bloqueoClicks: false,
      mensaje: mensaje,
      categoria: categoria,
      mensajeClase: 'feedback-intruso'
    }));
  };

  const elegirParEmojisVisual = (lista) => {
    const a = lista[Math.floor(Math.random() * lista.length)];
    let b;
    do {
      b = lista[Math.floor(Math.random() * lista.length)];
    } while (b === a);
    return { base: a, intruso: b };
  };

  // --- Control de Flujo ---
  const siguienteRonda = () => {
    if (estado.ronda + 1 > estado.rondasTotales) {
      finalizarTest();
    } else {
      setEstado(prev => ({ ...prev, ronda: prev.ronda + 1 }));
      generarYRenderizarColeccion();
    }
  };

  const finalizarTest = () => {
    detenerCronometro();
    setMostrarResumen(true);
  };

  const activarModoLibre = () => {
    detenerCronometro();
    setTiempoTranscurrido(0);
    setMostrarResumen(false);
    setEstado(prev => ({
      ...prev,
      modo: 'libre',
      ronda: 0,
      aciertos: 0,
      errores: 0
    }));
    setTimeout(() => generarYRenderizarColeccion(), 0);
  };

  const iniciarTest = () => {
    detenerCronometro();
    setTiempoTranscurrido(0);
    setMostrarResumen(false);
    setEstado(prev => ({
      ...prev,
      modo: 'test',
      ronda: 1,
      aciertos: 0,
      errores: 0
    }));
    iniciarCronometro();
    setTimeout(() => generarYRenderizarColeccion(), 0);
  };

  useEffect(() => {
    if (datosJuego && datosJuego.length > 0) {
      activarModoLibre();
    }
    return () => detenerCronometro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datosJuego]);

  // --- Gestión de Interacción ---
  const gestionarClick = (indice) => {
    if (estado.bloqueoClicks) return;
    setEstado(prev => ({ ...prev, bloqueoClicks: true }));
    const esCorrecto = indice === estado.indiceIntruso;
    
    if (esCorrecto) {
      setEstado(prev => ({
        ...prev,
        aciertos: prev.aciertos + 1,
        mensaje: '¡Muy bien!',
        mensajeClase: 'feedback-intruso ok-intruso',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ok'
      }));
    } else {
      setEstado(prev => ({
        ...prev,
        errores: prev.errores + 1,
        mensaje: '¡Oh, vaya!',
        mensajeClase: 'feedback-intruso ko-intruso',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ko'
      }));
    }

    setTimeout(() => {
      setEstado(prev => ({
        ...prev,
        feedbackCellIndex: -1,
        feedbackCellStatus: ''
      }));
      if (estado.modo === 'test') {
        siguienteRonda();
      } else {
        generarYRenderizarColeccion();
      }
    }, 1000);
  };

  const precision = estado.rondasTotales > 0 ? Math.round((estado.aciertos / estado.rondasTotales) * 100) : 0;

  if (!datosJuego) return <div className="contenedor-intruso">Cargando recursos...</div>;
  if (datosJuego.length === 0) return <div className="contenedor-intruso">No hay datos para esta asignatura/curso.</div>;

  return (
    <div className="contenedor-intruso">
      <div className="encabezado-intruso">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
          <span role="img" aria-label="Lupa">🔎</span> 
          <span className="gradient-text">Busca el intruso</span>
        </h1>
        <div className="controles-intruso flex flex-wrap justify-center gap-2">
          <button className="btn-intruso" onClick={activarModoLibre}>Práctica</button>
          <button className="btn-intruso" onClick={iniciarTest}>Examen</button>
        </div>
      </div>

      <div className="panel-intruso mt-4">
        <div className="barra-info-intruso mb-4">
          <div className="chips-intruso flex flex-wrap justify-center gap-4">
            <span className="chip-intruso bg-white/10 px-3 py-1 rounded-full"><strong>Modo:</strong> {estado.modo === 'test' ? 'Examen' : 'Práctica'}</span>
            <span className="chip-intruso bg-white/10 px-3 py-1 rounded-full"><strong>Aciertos:</strong> {estado.aciertos}</span>
            {estado.modo === 'test' && (
              <span className="chip-intruso bg-white/10 px-3 py-1 rounded-full"><strong>Ronda:</strong> {estado.ronda}/{estado.rondasTotales}</span>
            )}
          </div>
        </div>

        {!mostrarResumen ? (
          <>
            {estado.categoria && (
              <h2 className="text-xl md:text-3xl font-bold text-center mb-2 text-indigo-600 dark:text-indigo-300 drop-shadow-sm">
                {estado.categoria}
              </h2>
            )}
            
            <div className={`${estado.mensajeClase} text-lg md:text-xl text-center mb-4 min-h-[30px]`}>
                {estado.mensaje}
            </div>
            
            <div
              className="tablero-intruso grid gap-2 md:gap-4 mx-auto max-w-4xl"
              style={{ 
                  gridTemplateColumns: `repeat(${estado.cols}, minmax(0, 1fr))` 
              }}
            >
              {estado.tablero.map((item, idx) => {
                const esTexto = contieneLetras(item);
                // Si es un juego visual (1º primaria, 8 columnas), los iconos deben ser medianos.
                // Si es un juego conceptual (2º primaria, 4 columnas), los iconos deben ser gigantes.
                const styleIcono = modoLogico === 'visual' 
                  ? { fontSize: 'clamp(1.5rem, 4vw, 2.8rem)' }  // Tamaño 1º Primaria
                  : { fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }; // Tamaño 2º-6º Primaria

                return (
                  <div
                    key={idx}
                    className={`celda-intruso aspect-square cursor-pointer bg-white/40 hover:bg-white/60 rounded-xl transition-all duration-200 select-none border-4 border-transparent shadow-sm
                      ${esTexto
                        ? 'celda-texto font-bold text-indigo-950 drop-shadow-sm'
                        : 'flex items-center justify-center' 
                      }
                      ${idx === estado.feedbackCellIndex ? (estado.feedbackCellStatus === 'ok' ? '!border-green-500 !bg-green-100 !text-black scale-105' : '!border-red-500 !bg-red-100 !text-black scale-95') : ''}
                    `}
                    // Solo forzamos tamaño inline si NO es texto
                    style={ !esTexto ? styleIcono : {} }
                    onClick={() => gestionarClick(idx)}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="resumen-intruso text-center bg-white/10 p-8 rounded-2xl max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4">¡Resultado Final!</h2>
            <div className="text-6xl font-black mb-6 text-yellow-300">{precision}%</div>
            <p className="mb-2">Has encontrado {estado.aciertos} intrusos de {estado.rondasTotales}.</p>
            <p className="mb-6">Tiempo: {tiempoTranscurrido.toFixed(1)} segundos</p>
            <div className="flex flex-col gap-3">
                <button className="btn-intruso w-full" onClick={iniciarTest}>Repetir Examen</button>
                <button className="btn-intruso sec-intruso w-full bg-transparent border border-white" onClick={activarModoLibre}>Volver a Práctica</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

BuscaElIntruso.propTypes = {
  tema: PropTypes.string
};

export default BuscaElIntruso;