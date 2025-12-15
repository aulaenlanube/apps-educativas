import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './ParejasDeCartas.css';

const ParejasDeCartas = ({ tema }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const nivel = level || 'primaria';
  const curso = gradeParam || '1';
  const asignatura = tema || (typeof subjectId === 'string' && subjectId.trim() ? subjectId.trim() : 'general');

  // Estados del juego
  const [fase, setFase] = useState('menu'); // 'menu', 'juego', 'resumen'
  const [config, setConfig] = useState({ filas: 4, columnas: 3, parejas: 6 });
  
  // Datos y lógica
  const [datosCrudos, setDatosCrudos] = useState([]);
  const [cartas, setCartas] = useState([]);
  const [eleccionUno, setEleccionUno] = useState(null);
  const [eleccionDos, setEleccionDos] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [turnos, setTurnos] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Helper: Detecta si un string contiene letras
  const contieneLetras = (str) => {
    if (!str) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ]/.test(String(str));
  };

  // Cargar datos al montar el componente (solo una vez)
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const base = import.meta.env.BASE_URL || '/';
      const url = `${base}data/${nivel}/${curso}/${asignatura}-parejas.json`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('No se encontraron datos');
        const datos = await resp.json();
        setDatosCrudos(datos);
      } catch (error) {
        console.error("Error cargando cartas:", error);
        // Fallback
        setDatosCrudos([
          { id: 1, a: "☀️", b: "Sol" },
          { id: 2, a: "🌙", b: "Luna" },
          { id: 3, a: "⭐", b: "Estrella" },
          { id: 4, a: "☁️", b: "Nube" },
          { id: 5, a: "🌧️", b: "Lluvia" },
          { id: 6, a: "❄️", b: "Nieve" }
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [nivel, curso, asignatura]);

  // Opciones de dificultad disponibles
  const opcionesDificultad = [
    { nombre: 'Fácil', filas: 2, columnas: 4, parejas: 4 }, // 8 cartas
    { nombre: 'Normal', filas: 3, columnas: 4, parejas: 6 }, // 12 cartas
    { nombre: 'Difícil', filas: 4, columnas: 5, parejas: 10 }, // 20 cartas
    { nombre: 'Experto', filas: 4, columnas: 6, parejas: 12 }  // 24 cartas
  ];

  const iniciarJuego = (opcion) => {
    const parejasDisponibles = datosCrudos.length;
    const parejasReales = Math.min(opcion.parejas, parejasDisponibles);
    
    setConfig({ ...opcion, parejas: parejasReales });
    
    mezclarCartas(parejasReales);
    setFase('juego');
  };

  const mezclarCartas = (cantidadParejas) => {
    const datosSeleccionados = [...datosCrudos]
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidadParejas);

    const cartasBarajadas = [
      ...datosSeleccionados.map(item => ({ ...item, contenido: item.a, pairId: item.id, uniqueId: Math.random() })),
      ...datosSeleccionados.map(item => ({ ...item, contenido: item.b, pairId: item.id, uniqueId: Math.random() }))
    ]
    .sort(() => Math.random() - 0.5)
    .map(carta => ({ ...carta, matched: false }));

    setEleccionUno(null);
    setEleccionDos(null);
    setCartas(cartasBarajadas);
    setTurnos(0);
    setBloqueado(false);
  };

  const handleEleccion = (carta) => {
    if (eleccionUno) {
      setEleccionDos(carta);
    } else {
      setEleccionUno(carta);
    }
  };

  useEffect(() => {
    if (eleccionUno && eleccionDos) {
      setBloqueado(true);
      
      if (eleccionUno.pairId === eleccionDos.pairId) {
        setCartas(prevCartas => {
          return prevCartas.map(carta => {
            if (carta.pairId === eleccionUno.pairId) {
              return { ...carta, matched: true };
            }
            return carta;
          });
        });
        resetearTurno();
      } else {
        setTimeout(() => resetearTurno(), 1000);
      }
    }
  }, [eleccionUno, eleccionDos]);

  useEffect(() => {
    if (fase === 'juego' && cartas.length > 0 && cartas.every(carta => carta.matched)) {
      setFase('resumen');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cartas, fase]);

  const resetearTurno = () => {
    setEleccionUno(null);
    setEleccionDos(null);
    setTurnos(prevTurnos => prevTurnos + 1);
    setBloqueado(false);
  };

  const volverAlMenu = () => {
    setFase('menu');
    setCartas([]);
  };

  const reiniciarNivel = () => {
    iniciarJuego(config);
  };

  if (cargando) return <div className="contenedor-parejas text-2xl font-bold text-slate-500">Cargando cartas... 🃏</div>;

  return (
    <div className="contenedor-parejas">
      
      {/* --- FASE 1: MENÚ DE SELECCIÓN --- */}
      {fase === 'menu' && (
        <div className="menu-dificultad text-center z-10 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-indigo-900 drop-shadow-sm">
            Elige la dificultad
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto px-4">
            {opcionesDificultad.map((opcion, idx) => (
              <button
                key={idx}
                className="btn-dificultad"
                onClick={() => iniciarJuego(opcion)}
              >
                <div className="text-3xl font-bold mb-2">{opcion.nombre}</div>
                <div className="text-lg opacity-90">{opcion.filas} x {opcion.columnas} ({opcion.parejas} parejas)</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- FASE 2: JUEGO --- */}
      {(fase === 'juego' || fase === 'resumen') && (
        <div className="juego-area relative w-full flex justify-center items-center animate-fade-in">
          <div 
            className="tablero-parejas"
            style={{ 
              gridTemplateColumns: `repeat(${config.columnas}, 1fr)` 
            }}
          >
            {cartas.map(carta => {
              const esImagen = typeof carta.contenido === 'string' && (carta.contenido.includes('.png') || carta.contenido.includes('.webp') || carta.contenido.includes('.jpg'));
              const esTexto = typeof carta.contenido === 'string' && contieneLetras(carta.contenido);
              
              // --- AJUSTE DE TAMAÑO DE ICONOS ---
              // Valores base mucho más grandes
              const baseSizeRem = config.columnas >= 6 ? 4.5 : config.columnas >= 5 ? 5.5 : 7;
              // Factor de viewport más agresivo
              const vwFactor = 25 / config.columnas; 
              
              const estiloContenido = !esImagen && !esTexto 
                ? { fontSize: `clamp(3.5rem, ${vwFactor}vw, ${baseSizeRem}rem)`, lineHeight: '1' } 
                : {};
              // ----------------------------------

              return (
                <div 
                  key={carta.uniqueId} 
                  className={`carta ${carta === eleccionUno || carta === eleccionDos || carta.matched ? 'flipped' : ''} ${carta.matched ? 'matched' : ''}`}
                  onClick={() => !bloqueado && !carta.matched && carta !== eleccionUno && handleEleccion(carta)}
                >
                  <div className="carta-cara carta-frente">
                    {esImagen ? (
                      <img src={carta.contenido} alt="carta" className="w-3/4 h-3/4 object-contain"/>
                    ) : (
                      <span style={estiloContenido}>{carta.contenido}</span>
                    )}
                  </div>
                  <div className="carta-cara carta-dorso">
                    <span className="opacity-50 select-none">?</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- FASE 3: RESUMEN (Overlay) --- */}
          {fase === 'resumen' && (
            <div className="overlay-resumen">
              <div className="resumen-parejas">
                <h2 className="text-4xl font-bold mb-4 text-indigo-900">¡Fantástico! 🎉</h2>
                <p className="text-lg text-gray-700 mb-6">Juego completado en <span className="font-bold text-indigo-600 text-2xl">{turnos}</span> turnos.</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={reiniciarNivel}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-lg"
                  >
                    Jugar otra vez
                  </button>
                  <button 
                    onClick={volverAlMenu}
                    className="px-8 py-3 bg-transparent border-2 border-indigo-600 text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 transition"
                  >
                    Cambiar dificultad
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParejasDeCartas;