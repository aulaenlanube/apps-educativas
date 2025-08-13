import React, { useState, useEffect, useRef, useCallback } from 'react'
// reutiliza la misma hoja de estilos
import '/src/apps/_shared/Sumas.css'

const SumasPrimaria3 = () => {
  const areaProblemaRef = useRef(null)
  const mensajeRetroRef = useRef(null)

  const [operandosActuales, setOperandosActuales] = useState({ num1: 0, num2: 0, cifras: 3 })
  const [mostrarLlevadas, setMostrarLlevadas] = useState(true)

  // --- generación del problema (3 o 4 cifras, con posibles llevadas) ---
  const generarNuevoProblema = useCallback(() => {
    // decide aleatoriamente si el ejercicio será de 3 o de 4 cifras
    const cifras = Math.random() < 0.5 ? 3 : 4

    // genera dos números del tamaño elegido
    const min = cifras === 3 ? 100 : 1000
    const max = cifras === 3 ? 999 : 9999
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min

    setOperandosActuales({ num1, num2, cifras })

    const areaProblema = areaProblemaRef.current
    const mensajeRetro = mensajeRetroRef.current
    if (!areaProblema || !mensajeRetro) return

    // columnas visibles = cifras + 1 para la posible llevada final a la izquierda
    const columnasTotales = cifras + 1
    const num1Str = num1.toString().padStart(columnasTotales, ' ')
    const num2Str = num2.toString().padStart(columnasTotales, ' ')

    areaProblema.innerHTML = ''
    mensajeRetro.textContent = ''
    mensajeRetro.className = ''

    const operador = document.createElement('div')
    operador.className = 'operator'
    operador.textContent = '+'
    areaProblema.appendChild(operador)

    for (let i = 0; i < columnasTotales; i++) {
      const columna = document.createElement('div')
      columna.className = 'column'

      // la última columna de la izquierda no tiene caja de llevada
      const llevada = document.createElement('div')
      if (i < columnasTotales - 1) {
        llevada.className = 'box carry-box'
        llevada.dataset.target = 'true'
      } else {
        llevada.className = 'carry-placeholder'
      }
      columna.appendChild(llevada)

      columna.innerHTML += `
        <div class="digit-display">${num1Str[i]}</div>
        <div class="digit-display">${num2Str[i]}</div>
        <hr class="operation-line">
      `

      const cajaResultado = document.createElement('div')
      cajaResultado.className = 'box result-box'
      cajaResultado.dataset.target = 'true'
      columna.appendChild(cajaResultado)

      areaProblema.appendChild(columna)
    }

    const separador = document.createElement('div')
    separador.className = 'operator-spacer'
    areaProblema.appendChild(separador)

    // aplica el estado del toggle de ayuda
    areaProblema.classList.toggle('carries-hidden', !mostrarLlevadas)

    agregarListenersDragDrop()
  }, [mostrarLlevadas])

  // --- lógica de drag & drop ---
  const agregarListenersDragDrop = () => {
    const cajasObjetivo = areaProblemaRef.current.querySelectorAll('[data-target="true"]')
    const fichasNumero = document.querySelectorAll('.number-tile')

    fichasNumero.forEach(ficha => {
      ficha.addEventListener('dragstart', e =>
        e.dataTransfer.setData('text/plain', ficha.textContent)
      )
    })

    cajasObjetivo.forEach(caja => {
      caja.addEventListener('dragover', e => {
        e.preventDefault()
        caja.classList.add('drag-over')
      })
      caja.addEventListener('dragleave', () => caja.classList.remove('drag-over'))
      caja.addEventListener('drop', e => {
        e.preventDefault()
        caja.classList.remove('drag-over', 'correct', 'incorrect')
        caja.textContent = e.dataTransfer.getData('text/plain')
      })
    })
  }

  // --- comprobación de respuesta (con tolerancia a ceros en blanco) ---
  const comprobarRespuesta = () => {
    const cajasResultado = areaProblemaRef.current.querySelectorAll('.result-box')
    const cajasLlevada = areaProblemaRef.current.querySelectorAll('.carry-box')
    const mensajeRetro = mensajeRetroRef.current

    const solucion = operandosActuales.num1 + operandosActuales.num2
    const digitosSolucion = solucion
      .toString()
      .padStart(cajasResultado.length, '0')
      .split('')

    // compone la respuesta del usuario, tratando vacío como '0' solo para el cálculo numérico
    const respuestaUsuarioStrCruda = Array.from(cajasResultado).map(b => b.textContent.trim())
    const respuestaUsuarioStrParaNum = respuestaUsuarioStrCruda.map(t => (t === '' ? '0' : t)).join('')
    const respuestaUsuarioNum = parseInt(respuestaUsuarioStrParaNum) || 0
    const esResultadoCorrecto = respuestaUsuarioNum === solucion

    // colorea casillas del resultado con tolerancia: si el dígito correcto es '0', permitir vacío como correcto
    cajasResultado.forEach((caja, i) => {
      caja.classList.remove('correct', 'incorrect')
      const texto = caja.textContent.trim()
      const correcto = digitosSolucion[i]
      const coincide =
        texto === correcto || (texto === '' && correcto === '0') // tolera cero en blanco
      caja.classList.add(coincide ? 'correct' : 'incorrect')
    })

    // comprueba las llevadas con la misma tolerancia para ceros
    let llevadaIncorrecta = false
    if (mostrarLlevadas) {
      let llevada = 0
      const num1Padded = operandosActuales.num1
        .toString()
        .padStart(cajasResultado.length, '0')
      const num2Padded = operandosActuales.num2
        .toString()
        .padStart(cajasResultado.length, '0')

      cajasLlevada.forEach(c => c.classList.remove('correct', 'incorrect'))

      // recorre de derecha a izquierda, comprobando la llevada que queda encima de la columna i
      for (let i = cajasResultado.length - 1; i >= 1; i--) {
        const d1 = parseInt(num1Padded[i])
        const d2 = parseInt(num2Padded[i])
        const llevadaCorrecta = Math.floor((d1 + d2 + llevada) / 10)

        const cajaLlevada = cajasLlevada[i - 1]
        const textoUsuario = cajaLlevada.textContent.trim()

        // tolera vacío cuando la llevada correcta es 0
        const coincide =
          (textoUsuario === '' && llevadaCorrecta === 0) ||
          (textoUsuario !== '' && parseInt(textoUsuario) === llevadaCorrecta)

        if (coincide) {
          cajaLlevada.classList.add('correct')
        } else {
          cajaLlevada.classList.add('incorrect')
          // solo marcamos como incorrecta la llevada si el usuario escribió algo incorrecto
          // o si la llevada correcta era > 0 y la dejó vacía
          if (textoUsuario !== '' || llevadaCorrecta > 0) {
            llevadaIncorrecta = true
          }
        }
        llevada = llevadaCorrecta
      }
    }

    // feedback final
    if (esResultadoCorrecto) {
      if (!mostrarLlevadas || !llevadaIncorrecta) {
        mensajeRetro.textContent = '¡Excelente! ¡Suma correcta! 🎉'
        mensajeRetro.className = 'feedback-correct'
        cajasLlevada.forEach(c => c.classList.remove('incorrect'))
      } else {
        mensajeRetro.textContent = 'el resultado es correcto, pero revisa las llevadas'
        mensajeRetro.className = 'feedback-incorrect'
      }
    } else {
      mensajeRetro.textContent = 'casi... revisa las casillas en rojo'
      mensajeRetro.className = 'feedback-incorrect'
    }
  }

  const alternarAyudaLlevadas = () => {
    setMostrarLlevadas(prev => !prev)
  }

  useEffect(() => {
    generarNuevoProblema()
  }, [generarNuevoProblema])

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">📝</span>{' '}
        <span className="gradient-text">Suma como en el cole</span>
      </h1>

      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            type="checkbox"
            id="help-toggle"
            checked={mostrarLlevadas}
            onChange={alternarAyudaLlevadas}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div id="problem-area" ref={areaProblemaRef}></div>

      <div id="feedback-message" ref={mensajeRetroRef}></div>

      <div id="controls">
        <button id="check-button" onClick={comprobarRespuesta}>Comprobar</button>
        <button id="new-problem-button" onClick={generarNuevoProblema}>Nueva Suma</button>
      </div>

      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map(n => (
            <div
              key={n}
              className="number-tile"
              draggable="true"
              onDragStart={e => e.dataTransfer.setData('text/plain', n)}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SumasPrimaria3
