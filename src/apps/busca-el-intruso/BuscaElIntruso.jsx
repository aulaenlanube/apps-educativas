import React, { useState, useEffect, useRef } from 'react'
import './BuscaElIntruso.css'

const EMOJIS = [
  '🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍',
  '🌶️', '🥕', '🌽', '🥦', '🍄', '🥑', '🥥', '🥔', '🧄', '🧅',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🥊',
  '🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚚', '🚲',
  '⭐', '🌙', '☀️', '🌈', '🔥', '❄️', '⚡', '💧', '🪐', '🌍',
  '🎵', '🎧', '🎸', '🎷', '🎺', '🎻', '🥁', '🎹', '📯', '🎤',
  '📱', '💻', '🖥️', '⌚', '🎮', '🕹️', '📷', '🎥', '🔦', '🧭',
  '🧩', '🧸', '🪁', '🪀', '🎲', '♟️', '🧃', '🍪', '🍰', '🧁'
]

const BuscaElIntruso = () => {
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
    mensajeClase: 'feedback',
    feedbackCellIndex: -1, // New
    feedbackCellStatus: '' // New
  })

  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
  const temporizadorRef = useRef(null)
  const [mostrarResumen, setMostrarResumen] = useState(false)

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
      cancelAnimationFrame(temporizadorRef.current)
      temporizadorRef.current = null
    }
  }

  const generarYRenderizarColeccion = () => {
    const rows = 4
    const cols = 8
    const total = rows * cols
    const { base, intruso } = elegirParEmojis()
    const indiceIntruso = Math.floor(Math.random() * total)

    const lista = Array.from({ length: total }, (_, i) => (i === indiceIntruso ? intruso : base))

    setEstado(prev => ({
      ...prev,
      rows,
      cols,
      tablero: lista,
      indiceIntruso,
      bloqueoClicks: false,
      mensaje: 'Pulsa el emoji distinto',
      mensajeClase: 'feedback'
    }))
  }

  const elegirParEmojis = () => {
    const a = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    let b
    do {
      b = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    } while (b === a)
    return { base: a, intruso: b }
  }

  const siguienteRonda = () => {
    if (estado.ronda + 1 > estado.rondasTotales) {
      finalizarTest()
    } else {
      setEstado(prev => ({ ...prev, ronda: prev.ronda + 1 }))
      generarYRenderizarColeccion(estado.modo, estado.ronda + 1)
    }
  }

  const finalizarTest = () => {
    detenerCronometro()
    setMostrarResumen(true)
  }

  const activarModoLibre = () => {
    detenerCronometro()
    setTiempoTranscurrido(0)
    setMostrarResumen(false)
    setEstado(prev => ({
      ...prev,
      modo: 'libre',
      ronda: 0,
      aciertos: 0,
      errores: 0
    }))
    generarYRenderizarColeccion('libre', 0)
  }

  const iniciarTest = () => {
    detenerCronometro()
    setTiempoTranscurrido(0)
    setMostrarResumen(false)
    setEstado(prev => ({
      ...prev,
      modo: 'test',
      ronda: 1,
      aciertos: 0,
      errores: 0
    }))
    iniciarCronometro()
    generarYRenderizarColeccion('test', 1)
  }

  useEffect(() => {
    activarModoLibre()
    return () => detenerCronometro()
  }, [])

  const gestionarClick = (indice) => {
    if (estado.bloqueoClicks) return

    setEstado(prev => ({ ...prev, bloqueoClicks: true }))

    const esCorrecto = indice === estado.indiceIntruso

    if (esCorrecto) {
      setEstado(prev => ({
        ...prev,
        aciertos: prev.aciertos + 1,
        mensaje: '¡Correcto!',
        mensajeClase: 'feedback ok',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ok'
      }))
    } else {
      setEstado(prev => ({
        ...prev,
        errores: prev.errores + 1,
        mensaje: 'Incorrecto',
        mensajeClase: 'feedback ko',
        feedbackCellIndex: indice,
        feedbackCellStatus: 'ko'
      }))
    }

    setTimeout(() => {
      setEstado(prev => ({
        ...prev,
        feedbackCellIndex: -1,
        feedbackCellStatus: ''
      }));
      if (estado.modo === 'test') {
        siguienteRonda()
      } else {
        generarYRenderizarColeccion()
      }
    }, 400)
  }

  const precision = estado.rondasTotales > 0 ? Math.round((estado.aciertos / estado.rondasTotales) * 100) : 0

  return (
        <main className="contenedor-intruso">
            <section className="encabezado-intruso">
              <h1 className="text-5xl font-bold mb-4 text-center">
          <span role="img" aria-label="Personas">🔎</span> 
          <span className="gradient-text">Busca el intruso</span>
        </h1>
                
                <div className="controles-intruso">
                    <button onClick={activarModoLibre} className="btn-intruso">Modo libre</button>
                    <button onClick={iniciarTest} className="btn-intruso">Modo test</button>
                    <button onClick={estado.modo === 'test' ? iniciarTest : activarModoLibre} className="btn-intruso sec-intruso" title="Reiniciar vista">Reiniciar</button>
                </div>
            </section>

            <section className="panel-intruso barra-info-intruso" aria-live="polite">
                <div className="chips-intruso">
                    <div className="chip-intruso">Modo: <strong>{estado.modo === 'test' ? 'Test' : 'Libre'}</strong></div>
                    <div className="chip-intruso">Ronda: <strong>{estado.modo === 'test' ? `${Math.min(estado.ronda, estado.rondasTotales)} / ${estado.rondasTotales}` : '—'}</strong></div>
                    <div className="chip-intruso">Aciertos: <strong>{estado.aciertos}</strong></div>
                    <div className="chip-intruso">Errores: <strong>{estado.errores}</strong></div>
                    <div className="chip-intruso">Tiempo: <strong>{tiempoTranscurrido.toFixed(1)} s</strong></div>
                </div>
                <div className="progreso-intruso" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow={estado.ronda}>
                    <div style={{ width: `${estado.modo === 'test' ? (estado.ronda / estado.rondasTotales) * 100 : 0}%` }}></div>
                </div>
            </section>

            {!mostrarResumen
              ? (
                <section className="panel-intruso">
                    <div className={estado.mensajeClase}>{estado.mensaje}</div>
                    <div className="tablero-intruso" style={{ gridTemplateColumns: `repeat(${estado.cols}, 1fr)` }}>
                        {estado.tablero.map((emoji, idx) => (
                            <button
                                key={idx}
                                className={`celda-intruso ${estado.feedbackCellIndex === idx ? (estado.feedbackCellStatus === 'ok' ? 'ok' : 'ko') : ''}`}
                                type="button"
                                aria-label="Emoji"
                                onClick={() => gestionarClick(idx)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </section>
                )
              : (
                <section className="panel-intruso">
                    <div className="resumen-intruso">
                        <div className="punt-intruso">Puntuación: {estado.aciertos}/{estado.rondasTotales}</div>
                        <div>Tiempo total: {tiempoTranscurrido.toFixed(1)} s</div>
                        <div>Precisión: {precision}%</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', justifyContent: 'center' }}>
                            <button onClick={iniciarTest} className="btn-intruso">Repetir test</button>
                            <button onClick={activarModoLibre} className="btn-intruso sec-intruso">Volver a modo libre</button>
                        </div>
                    </div>
                </section>
                )}
        </main>
  )
}

export default BuscaElIntruso