// Nuevo componente unificado para el juego "Busca el Intruso".
// Este componente carga la colección de emojis desde ficheros JSON
// ubicados en ``public/data/primaria/1`` según la asignatura de primero
// de primaria. El objetivo es disponer de un único fichero JSX que
// implemente toda la lógica del juego; las asignaturas específicas se
// definen mediante la prop ``tema`` que se pasa desde los componentes
// envoltorios o rutas del sistema. El juego ofrece un modo libre y un
// modo test con cronómetro y resumen de resultados.

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import './BuscaElIntruso.css';

/**
 * BuscaElIntruso
 *
 * @param {Object} props
 * @param {string} [props.tema] - identificador de la asignatura; si no se
 *   proporciona se intentará deducir desde los parámetros de ruta
 *   (`subjectId`). Si no existe asignatura se cargará el conjunto
 *   "general".
 */
const BuscaElIntruso = ({ tema }) => {
  // Extraer parámetros de la URL cuando el componente se utiliza a través
  // de las rutas definidas en React Router. Esto permite que, en ausencia
  // de la prop `tema`, se utilice el parámetro de ruta `subjectId` para
  // determinar qué JSON cargar. Si tampoco existe, se emplea 'general'.
  const { level, grade: gradeParam, subjectId } = useParams();
  // Normalizar el nivel a 'primaria' o 'eso'; esta app sólo utiliza
  // recursos de primero de primaria pero se deja la lógica preparada.
  const nivel = level || 'primaria';
  // Normalizar el curso; en caso de no estar definido se utiliza '1'.
  const curso = gradeParam || '1';

  // Estado de los emojis que se cargan desde el JSON
  const [emojis, setEmojis] = useState(null);
  // Estados para el juego
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
    mensaje: 'Pulsa el emoji distinto',
    mensajeClase: 'feedback-intruso',
    feedbackCellIndex: -1,
    feedbackCellStatus: ''
  });
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const temporizadorRef = useRef(null);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  // Determinar la asignatura a cargar. Tiene prioridad la prop `tema`,
  // después el parámetro de ruta `subjectId`, y finalmente 'general'.
  const asignatura = tema || (typeof subjectId === 'string' && subjectId.trim() ? subjectId.trim() : 'general');

  // Cargar los emojis desde el fichero JSON correspondiente. Se intenta
  // primero la variante específica de la asignatura, luego una genérica
  // para el curso, y finalmente una genérica de primero si fallan las
  // anteriores. El nombre de los ficheros sigue el patrón
  // `${asignatura}-busca-el-intruso.json` para específicos y
  // `busca-el-intruso.json` para la versión genérica.
  useEffect(() => {
    let vivo = true;
    setEmojis(null);
    const base = import.meta.env.BASE_URL || '/';
    // Construir URLs posibles en orden de preferencia
    const urls = [];
    if (asignatura && asignatura !== 'general') {
      urls.push(`${base}data/${nivel}/${curso}/${asignatura}-busca-el-intruso.json`);
    }
    // URL genérica del curso
    urls.push(`${base}data/${nivel}/${curso}/busca-el-intruso.json`);
    // Fallback: primero de primaria genérico
    urls.push(`${base}data/${nivel}/1/busca-el-intruso.json`);

    const cargar = async (url) => {
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      // Validar que el contenido es un array de strings
      if (Array.isArray(data) && data.every(it => typeof it === 'string')) {
        return data;
      }
      throw new Error('Formato JSON inválido');
    };

    (async () => {
      for (const url of urls) {
        try {
          const datos = await cargar(url);
          if (vivo) {
            setEmojis(datos);
            return;
          }
        } catch {
          // Continuar con la siguiente URL
        }
      }
      // Si ninguna carga ha funcionado
      if (vivo) setEmojis([]);
    })();

    return () => { vivo = false; };
  }, [asignatura, nivel, curso]);

  // Control del cronómetro
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

  // Genera un tablero nuevo: selecciona un emoji base y otro intruso,
  // coloca uno distinto en una celda aleatoria y actualiza el estado.
  const generarYRenderizarColeccion = () => {
    if (!emojis || emojis.length < 2) return;
    const rows = 4;
    const cols = 8;
    const total = rows * cols;
    const { base, intruso } = elegirParEmojis();
    const indiceIntruso = Math.floor(Math.random() * total);
    const lista = Array.from({ length: total }, (_, i) => (i === indiceIntruso ? intruso : base));
    setEstado(prev => ({
      ...prev,
      rows,
      cols,
      tablero: lista,
      indiceIntruso,
      bloqueoClicks: false,
      mensaje: 'Pulsa el emoji distinto',
      mensajeClase: 'feedback-intruso'
    }));
  };

  // Escoge dos emojis distintos del conjunto cargado
  const elegirParEmojis = () => {
    const a = emojis[Math.floor(Math.random() * emojis.length)];
    let b;
    do {
      b = emojis[Math.floor(Math.random() * emojis.length)];
    } while (b === a);
    return { base: a, intruso: b };
  };

  // Avanza a la siguiente ronda en modo test; finaliza cuando se
  // completan todas las rondas
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
    generarYRenderizarColeccion();
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
    generarYRenderizarColeccion();
  };

  // Reiniciar el tablero cuando cambie el conjunto de emojis o el tema
  useEffect(() => {
    if (emojis && emojis.length >= 2) {
      activarModoLibre();
    }
    // limpiar temporizador al desmontar
    return () => detenerCronometro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emojis]);

  // Gestiona el clic en una celda del tablero
  const gestionarClick = (indice) => {
    if (estado.bloqueoClicks) return;
    setEstado(prev => ({ ...prev, bloqueoClicks: true }));
    const esCorrecto = indice === estado.indiceIntruso;
    if (esCorrecto) {
      setEstado(prev => ({
        ...prev,
        aciertos: prev.aciertos + 1,
        mensaje: '¡Correcto!',
        mensajeClase: 'feedback-intruso ok-intruso',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ok'
      }));
    } else {
      setEstado(prev => ({
        ...prev,
        errores: prev.errores + 1,
        mensaje: 'Incorrecto',
        mensajeClase: 'feedback-intruso ko-intruso',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ko'
      }));
    }
    // Breve retraso para mostrar feedback y luego pasar a la siguiente ronda o
    // regenerar el tablero en modo libre
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
    }, 400);
  };

  // Precisión calculada como porcentaje
  const precision = estado.rondasTotales > 0 ? Math.round((estado.aciertos / estado.rondasTotales) * 100) : 0;

  // Renderizado del componente
  if (emojis === null) {
    // Todavía cargando
    return <div className="contenedor-intruso">Cargando…</div>;
  }
  if (!emojis || emojis.length < 2) {
    return <div className="contenedor-intruso">No hay suficiente contenido disponible para este juego todavía.</div>;
  }
  return (
    <div className="contenedor-intruso">

      <div className="encabezado-intruso">
        <h1 className="text-5xl font-bold mb-4 text-center">
          <span role="img" aria-label="Lupa">🔎</span> 
          <span className="gradient-text">Busca el intruso</span>
        </h1>
        <div className="controles-intruso">
          <button className="btn-intruso" onClick={activarModoLibre}>Modo libre</button>
          <button className="btn-intruso" onClick={iniciarTest}>Modo test</button>
          <button className="btn-intruso sec-intruso" onClick={generarYRenderizarColeccion}>Reiniciar</button>
        </div>
      </div>
      <div className="panel-intruso">
        <div className="barra-info-intruso">
          <div className="chips-intruso">
            <span className="chip-intruso"><strong>Modo:</strong> {estado.modo === 'test' ? 'Test' : 'Libre'}</span>
            <span className="chip-intruso"><strong>Ronda:</strong> {estado.modo === 'test' ? `${Math.min(estado.ronda, estado.rondasTotales)} / ${estado.rondasTotales}` : '—'}</span>
            <span className="chip-intruso"><strong>Aciertos:</strong> {estado.aciertos}</span>
            <span className="chip-intruso"><strong>Errores:</strong> {estado.errores}</span>
            {estado.modo === 'test' && (
              <span className="chip-intruso"><strong>Tiempo:</strong> {tiempoTranscurrido.toFixed(1)} s</span>
            )}
          </div>
        </div>
        {!mostrarResumen ? (
          <>
            <div className={estado.mensajeClase}>{estado.mensaje}</div>
            <div
              className="tablero-intruso"
              style={{ gridTemplateColumns: `repeat(${estado.cols}, 1fr)` }}
            >
              {estado.tablero.map((emoji, idx) => (
                <div
                  key={idx}
                  className={`celda-intruso ${idx === estado.feedbackCellIndex ? estado.feedbackCellStatus : ''}`}
                  onClick={() => gestionarClick(idx)}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="resumen-intruso">
            <div className="punt-intruso">Puntuación: {estado.aciertos}/{estado.rondasTotales}</div>
            <div className="chip-intruso">Tiempo total: {tiempoTranscurrido.toFixed(1)} s</div>
            <div className="chip-intruso">Precisión: {precision}%</div>
            <button className="btn-intruso" onClick={iniciarTest}>Repetir test</button>
            <button className="btn-intruso sec-intruso" onClick={activarModoLibre}>Volver a modo libre</button>
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