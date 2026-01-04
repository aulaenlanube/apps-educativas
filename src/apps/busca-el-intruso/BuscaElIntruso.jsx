import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import './BuscaElIntruso.css';

/**
 * BuscaElIntruso - Edición "Spectacular UI"
 * Juego de discriminación visual y semántica con estética gamificada.
 */
const BuscaElIntruso = ({ tema }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const nivel = level || 'primaria';
  const curso = gradeParam || '1';

  const [datosJuego, setDatosJuego] = useState(null);
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
    feedbackCellIndex: -1,
    feedbackCellStatus: '', // 'ok' | 'ko'
    combo: 0 // Para racha de aciertos
  });

  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const temporizadorRef = useRef(null);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const asignatura = tema || (typeof subjectId === 'string' && subjectId.trim() ? subjectId.trim() : 'general');

  // --- Funciones Auxiliares ---
  const contieneLetras = (str) => {
    if (!str) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ]/.test(String(str));
  };

  // Generar partículas de fondo una sola vez (Hooks must be at top level)
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 40 + 10,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 20,
      left: Math.random() * 100,
      opacity: Math.random() * 0.3 + 0.1
    }));
  }, []);

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
      mensaje = '¡Encuentra el diferente!';
    } else {
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

      mensaje = '¡Toca el intruso!';
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
      feedbackCellIndex: -1,
      feedbackCellStatus: ''
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
    if (restarting) return;
    detenerCronometro();
    setTiempoTranscurrido(0);
    setMostrarResumen(false);
    setEstado(prev => ({
      ...prev,
      modo: 'libre',
      ronda: 0,
      aciertos: 0,
      errores: 0,
      combo: 0
    }));

    setRestarting(true);
    setTimeout(() => {
      generarYRenderizarColeccion();
      setRestarting(false);
    }, 600);
  };

  const iniciarTest = () => {
    if (restarting) return;
    detenerCronometro();
    setTiempoTranscurrido(0);
    setMostrarResumen(false);
    setEstado(prev => ({
      ...prev,
      modo: 'test',
      ronda: 1,
      aciertos: 0,
      errores: 0,
      combo: 0
    }));
    iniciarCronometro();

    setRestarting(true);
    setTimeout(() => {
      generarYRenderizarColeccion();
      setRestarting(false);
    }, 600);
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
      // Lógica de acierto
      setEstado(prev => ({
        ...prev,
        aciertos: prev.aciertos + 1,
        combo: prev.combo + 1,
        mensaje: '¡GENIAL!',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ok'
      }));
    } else {
      // Lógica de error
      setEstado(prev => ({
        ...prev,
        errores: prev.errores + 1,
        combo: 0,
        mensaje: '¡UPS! ESE NO ES',
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
    }, 1200);
  };

  const precision = estado.rondasTotales > 0 ? Math.round((estado.aciertos / estado.rondasTotales) * 100) : 0;

  if (!datosJuego) return <div className="loading-screen">Cargando Examen...</div>;
  if (datosJuego.length === 0) return <div className="loading-screen">No hay datos del examen.</div>;

  return (
    <div className="intruso-wrapper">
      {/* Fondo Animado con partículas generadas dinámicamente */}
      <div className="intruso-particles">
        {particles.map((p) => (
          <span key={p.id} style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
            opacity: p.opacity
          }}></span>
        ))}
      </div>

      <div className="intruso-container">

        {/* CABECERA / HUD */}
        <div className="intruso-hud">
          <div className="intruso-hud-left">
            {/* LÓGICA DE BOTONES: Cambia según si es modo TEST o LIBRE */}
            {estado.modo === 'test' ? (
              <>
                <button className="intruso-btn" onClick={iniciarTest} style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                  ↻ Reiniciar Examen
                </button>
                <button className="intruso-btn" onClick={activarModoLibre} style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                  ↩ Volver al Juego
                </button>
              </>
            ) : (
              <>
                <button className={`intruso-btn ${estado.modo === 'libre' ? 'active' : ''}`} onClick={activarModoLibre}>OTRO INTRUSO</button>
                <button className={`intruso-btn ${estado.modo === 'test' ? 'active' : ''}`} onClick={iniciarTest}>EXAMEN</button>
              </>
            )}
          </div>

          <div className="intruso-hud-center">
            <h1 className="intruso-title">BUSCA EL INTRUSO</h1>

            {/* INDICADOR DE PROGRESO DEL EXAMEN */}
            {estado.modo === 'test' && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Pregunta {estado.ronda} de {estado.rondasTotales}
              </div>
            )}

            {estado.categoria && <div className="category-badge">{estado.categoria}</div>}
          </div>

          <div className="intruso-hud-right">
            <div className="stat-pill">
              <span className="icon">🏆</span>
              <span className="value">{estado.aciertos}</span>
            </div>
            {estado.modo === 'test' && (
              <div className="stat-pill">
                <span className="icon">⏱️</span>
                <span className="value">{tiempoTranscurrido.toFixed(0)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* ÁREA DE JUEGO */}
        <div className="intruso-board-area">
          {!mostrarResumen ? (
            <>
              <div className={`message-banner ${estado.feedbackCellStatus}`}>
                {estado.mensaje}
                {estado.combo > 1 && <span className="combo-counter">x{estado.combo} COMBO!</span>}
              </div>

              <div
                className={`intruso-grid ${modoLogico}`}
                style={{
                  gridTemplateColumns: `repeat(${estado.cols}, minmax(0, 1fr))`
                }}
              >
                {estado.tablero.map((item, idx) => {
                  const esTexto = contieneLetras(item);
                  const isFeedbackTarget = idx === estado.feedbackCellIndex;
                  const status = isFeedbackTarget ? estado.feedbackCellStatus : '';

                  // Retraso escalonado para la animación de entrada
                  const delayStyle = { animationDelay: `${idx * 0.03}s` };

                  return (
                    <div
                      key={`${estado.ronda}-${idx}`} // Key cambiante para forzar re-render y animación
                      className={`intruso-cell ${esTexto ? 'text-mode' : 'icon-mode'} ${status} ${restarting ? 'shaking' : ''}`}
                      style={delayStyle}
                      onClick={() => gestionarClick(idx)}
                    >
                      <div className="cell-content">
                        {item}
                      </div>
                      {/* Efecto visual de clic */}
                      {status === 'ok' && <div className="sparkle-effect">✨</div>}
                      {status === 'ko' && <div className="cross-effect">❌</div>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // PANTALLA DE RESULTADOS
            <div className="results-card">
              <h2>EXAMEN COMPLETADO!</h2>
              <div className="score-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${precision}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="score-text">{precision}%</div>
              </div>

              <div className="stats-row">
                <div className="stat-box">
                  <span className="label">Aciertos</span>
                  <span className="val">{estado.aciertos}/{estado.rondasTotales}</span>
                </div>
                <div className="stat-box">
                  <span className="label">Tiempo</span>
                  <span className="val">{tiempoTranscurrido.toFixed(1)}s</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="primary-action" onClick={iniciarTest}>REPETIR EXAMEN</button>
                <button className="secondary-action" onClick={activarModoLibre}>JUGAR: OTRO INTRUSO</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

BuscaElIntruso.propTypes = {
  tema: PropTypes.string
};

export default BuscaElIntruso;