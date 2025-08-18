import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useConfetti } from "/src/apps/_shared/ConfettiProvider";
import '/src/apps/_shared/Sumas.css'

const SumasPrimaria6 = () => {
  const areaProblemaRef = useRef(null)
  const mensajeRetroRef = useRef(null)
  const { confeti } = useConfetti();

  const [operandosActuales, setOperandosActuales] = useState({ nums: [] })
  const [mostrarLlevadas, setMostrarLlevadas] = useState(true)

  // genera número aleatorio con n enteros y m decimales usando coma española
  const generarNumero = (cifrasEnteras, decimales) => {
    const min = cifrasEnteras === 2 ? 10 : 100
    const max = cifrasEnteras === 2 ? 99 : 999
    const entero = Math.floor(Math.random() * (max - min + 1)) + min
    if (decimales === 0) return entero.toString()
    const parteDecimal = Math.floor(Math.random() * Math.pow(10, decimales))
      .toString()
      .padStart(decimales, '0')
    return `${entero},${parteDecimal}`
  }

  // crea un nuevo ejercicio con tres números de 2 o 3 cifras y hasta 3 decimales
  // siempre al menos uno con decimales y 30% de casos con distinta cantidad de decimales
  const generarNuevoProblema = useCallback(() => {
    const cifrasEnteras = Math.random() < 0.5 ? 2 : 3

    // 70% misma cantidad de decimales, 30% distinta entre los tres
    const mismaCantidad = Math.random() > 0.3

    let decs = []
    if (mismaCantidad) {
      const d = [1, 2, 3][Math.floor(Math.random() * 3)] // evitamos 0 para asegurar al menos un decimal
      decs = [d, d, d]
    } else {
      // asignación libre 0..3, garantizando que no todos sean iguales y que exista al menos uno > 0
      const randDec = () => [0, 1, 2, 3][Math.floor(Math.random() * 4)]
      do {
        decs = [randDec(), randDec(), randDec()]
      } while ((decs[0] === decs[1] && decs[1] === decs[2]) || Math.max(...decs) === 0)
    }

    const nums = decs.map(d => generarNumero(cifrasEnteras, d))
    setOperandosActuales({ nums })

    const areaProblema = areaProblemaRef.current
    const mensajeRetro = mensajeRetroRef.current
    if (!areaProblema || !mensajeRetro) return

    areaProblema.innerHTML = ''
    mensajeRetro.textContent = ''
    mensajeRetro.className = ''

    // normalización de columnas con columna guardia a la izquierda
    const maxDec = Math.max(
      ...nums.map(n => (n.split(',')[1] || '').length)
    )
    const maxEnteros = cifrasEnteras
    // estructura: [guardia] [enteros...] [,] [decimales...]
    const totalCols = 1 + maxEnteros + (maxDec > 0 ? (1 + maxDec) : 0)

    const padNumero = (num) => {
      if (!num.includes(',')) num += ','
      const [ent, dec = ''] = num.split(',')
      const entPad = ent.padStart(maxEnteros + 1, ' ') // +1 por la guardia
      if (maxDec > 0) {
        const decPad = dec.padEnd(maxDec, ' ')
        return `${entPad},${decPad}`
      } else {
        return entPad
      }
    }

    const numsStr = nums.map(padNumero)

    // símbolo operador
    const operador = document.createElement('div')
    operador.className = 'operator'
    operador.textContent = '+'
    areaProblema.appendChild(operador)

    // pinta columnas
    for (let i = 0; i < totalCols; i++) {
      const columna = document.createElement('div')
      columna.className = 'column'

      const esComa = maxDec > 0 && numsStr[0][i] === ','

      // casilla de llevada salvo en la columna de coma o última columna
      const llevada = document.createElement('div')
      if (!esComa && i < totalCols - 1) {
        llevada.className = 'box carry-box'
        llevada.dataset.target = 'true'
      } else {
        llevada.className = 'carry-placeholder'
      }
      columna.appendChild(llevada)

      // tres filas de dígitos de los sumandos
      numsStr.forEach(numStr => {
        const d = document.createElement('div')
        d.className = 'digit-display'
        d.textContent = numStr[i] ?? ' '
        columna.appendChild(d)
      })

      const linea = document.createElement('hr')
      linea.className = 'operation-line'
      columna.appendChild(linea)

      // caja de resultado
      if (esComa) {
        const cajaComa = document.createElement('div')
        cajaComa.className = 'box comma-box'
        const marca = document.createElement('span')
        marca.textContent = ','
        cajaComa.appendChild(marca)
        columna.appendChild(cajaComa)
      } else {
        const cajaResultado = document.createElement('div')
        cajaResultado.className = 'box result-box'
        cajaResultado.dataset.target = 'true'
        columna.appendChild(cajaResultado)
      }

      areaProblema.appendChild(columna)
    }

    areaProblema.classList.toggle('carries-hidden', !mostrarLlevadas)
    agregarListenersDragDrop()
  }, [mostrarLlevadas])

  // listeners de drag & drop
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

  // comprobación del resultado y de las llevadas
  // reglas resultado:
  // - dígito correcto → verde
  // - ceros por la izquierda en blanco → neutral
  // - cero en medio o a la derecha en blanco → rojo
  // - casilla vacía donde el dígito correcto no es 0 → rojo
  // reglas llevadas:
  // - vacías no penalizan; solo marcan error si están escritas y son incorrectas
  const comprobarRespuesta = () => {
    const cajasResultado = areaProblemaRef.current.querySelectorAll('.result-box')
    const cajasLlevada = areaProblemaRef.current.querySelectorAll('.carry-box')
    const mensajeRetro = mensajeRetroRef.current

    // solución con precisión de decimales máximos
    const valores = operandosActuales.nums.map(s => parseFloat(s.replace(',', '.')))
    const decimalesMax = Math.max(...operandosActuales.nums.map(s => (s.split(',')[1] || '').length))
    const solucion = +valores.reduce((a, b) => a + b, 0).toFixed(decimalesMax)
    const solucionStrConComa = solucion.toFixed(decimalesMax).replace('.', ',')

    // dígitos esperados alineados a todas las cajas de resultado
    const digitosSolucion = solucionStrConComa
      .replace(',', '')
      .padStart(cajasResultado.length, '0')
      .split('')

    // índice del primer dígito no-cero para distinguir ceros por la izquierda
    const indicePrimerNoCero = digitosSolucion.findIndex(d => d !== '0')

    // coloreado de casillas según reglas
    cajasResultado.forEach((caja, i) => {
      caja.classList.remove('correct', 'incorrect')
      const texto = caja.textContent.trim()
      const correcto = digitosSolucion[i]

      if (texto === '') {
        if (correcto === '0' && (indicePrimerNoCero === -1 || i < indicePrimerNoCero)) {
          // neutral: sin clases
        } else {
          caja.classList.add('incorrect')
        }
      } else if (texto === correcto) {
        caja.classList.add('correct')
      } else {
        caja.classList.add('incorrect')
      }
    })

    const hayIncorrectasResultado = Array.from(cajasResultado).some(c => c.classList.contains('incorrect'))

    // comprobación de llevadas con 3 sumandos y mapeo correcto a i-1
    let huboLlevadaErroneaEscrita = false
    if (mostrarLlevadas) {
      const partes = operandosActuales.nums.map(n => n.replace(',', '.').split('.'))
      const maxDec = decimalesMax

      const numsPlanos = partes.map(([ent = '0', dec = '']) => ent + (dec || '').padEnd(maxDec, '0'))

      const ancho = cajasResultado.length
      const numsPadded = numsPlanos.map(p => p.padStart(ancho, '0'))

      cajasLlevada.forEach(c => c.classList.remove('correct', 'incorrect'))

      let llevada = 0
      for (let i = ancho - 1; i >= 1; i--) {
        const sumaColumna = numsPadded.reduce((acc, p) => acc + (parseInt(p[i], 10) || 0), llevada)
        const llevadaCorrecta = Math.floor(sumaColumna / 10)

        const cajaLlevada = cajasLlevada[i - 1] // la llevada de la columna i se escribe sobre i-1
        if (cajaLlevada) {
          const textoUsuario = cajaLlevada.textContent.trim()
          if (textoUsuario === '') {
            // vacío → neutral
          } else if (parseInt(textoUsuario, 10) === llevadaCorrecta) {
            cajaLlevada.classList.add('correct')
          } else {
            cajaLlevada.classList.add('incorrect')
            huboLlevadaErroneaEscrita = true
          }
        }

        llevada = llevadaCorrecta
      }
    }

    // feedback final
    if (!hayIncorrectasResultado) {
      if (!mostrarLlevadas || !huboLlevadaErroneaEscrita) {
        mensajeRetro.textContent = '¡Excelente! ¡Suma correcta! 🎉'
        mensajeRetro.className = 'feedback-correct'
        confeti()
      } else {
        mensajeRetro.textContent = 'El resultado es correcto, pero revisa las llevadas que has escrito'
        mensajeRetro.className = 'feedback-incorrect'
      }
    } else {
      mensajeRetro.textContent = 'Casi... revisa las casillas en rojo'
      mensajeRetro.className = 'feedback-incorrect'
    }
  }

  const alternarAyudaLlevadas = () => setMostrarLlevadas(prev => !prev)

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

export default SumasPrimaria6
