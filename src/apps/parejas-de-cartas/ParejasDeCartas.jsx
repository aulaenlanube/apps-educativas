import React, { useState, useEffect, useRef } from 'react';
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
  const [config, setConfig] = useState({ filas: 4, columnas: 3, parejas: 6, ayudas: false });
  
  // Datos y lógica
  const [datosCrudos, setDatosCrudos] = useState([]);
  const [cartas, setCartas] = useState([]);
  const [eleccionUno, setEleccionUno] = useState(null);
  const [eleccionDos, setEleccionDos] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [turnos, setTurnos] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Referencias para limpiar timeouts/intervals
  const peekTimeoutRef = useRef(null);
  const peekIntervalRef = useRef(null);

  // Helper: Detecta si un string contiene letras
  const contieneLetras = (str) => {
    if (!str) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ]/.test(String(str));
  };

  // Cargar datos al montar
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

  // Opciones de dificultad
  const opcionesDificultad = [
    { nombre: 'Fácil', filas: 2, columnas: 4, parejas: 4 }, // 8 cartas
    { nombre: 'Normal', filas: 3, columnas: 4, parejas: 6 }, // 12 cartas
    { nombre: 'Difícil', filas: 4, columnas: 5, parejas: 10 }, // 20 cartas
    { nombre: 'Experto', filas: 4, columnas: 6, parejas: 12 }  // 24 cartas
  ];

  const iniciarJuego = (opcion) => {
    const parejasDisponibles = datosCrudos.length;
    const parejasReales = Math.min(opcion.parejas, parejasDisponibles);
    
    // Mantenemos la configuración de ayudas seleccionada en el menú
    setConfig(prev => ({ ...opcion, parejas: parejasReales, ayudas: prev.ayudas }));
    
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
    .map(carta => ({ ...carta, matched: false, peeking: false }));

    setEleccionUno(null);
    setEleccionDos(null);
    setCartas(cartasBarajadas);
    setTurnos(0);
    setBloqueado(false);
  };

  // --- LÓGICA DE AYUDAS (GHOST PEEK) ---
  useEffect(() => {
    if (peekIntervalRef.current) clearInterval(peekIntervalRef.current);
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);

    if (fase === 'juego' && config.ayudas) {
      const activarPeek = () => {
        setCartas(currentCartas => {
          const disponibles = currentCartas.map((c, i) => ({ ...c, index: i }))
            .filter(c => !c.matched && c !== eleccionUno && c !== eleccionDos);
          
          if (disponibles.length < 2) return currentCartas;

          const numPeeks = Math.random() > 0.7 ? 2 : 1;
          const elegidas = [];
          for (let i = 0; i < numPeeks; i++) {
            if (disponibles.length > 0) {
              const r = Math.floor(Math.random() * disponibles.length);
              elegidas.push(disponibles[r].index);
              disponibles.splice(r, 1);
            }
          }

          return currentCartas.map((c, i) => 
            elegidas.includes(i) ? { ...c, peeking: true } : c
          );
        });

        peekTimeoutRef.current = setTimeout(() => {
          setCartas(prev => prev.map(c => ({ ...c, peeking: false })));
        }, 1500);
      };

      peekIntervalRef.current = setInterval(activarPeek, 5000);
    }

    return () => {
      if (peekIntervalRef.current) clearInterval(peekIntervalRef.current);
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, [fase, config.ayudas, eleccionUno, eleccionDos]);

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
              return { ...carta, matched: true, peeking: false };
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

  const toggleAyudas = () => {
    setConfig(prev => ({ ...prev, ayudas: !prev.ayudas }));
  };

  if (cargando) return <div className="contenedor-parejas text-2xl font-bold text-slate-500">Cargando cartas... 🃏</div>;

  return (
    <div className="contenedor-parejas">
      
      {/* --- FASE 1: MENÚ DE SELECCIÓN --- */}
      {fase === 'menu' && (
        <div className="menu-dificultad text-center z-10 animate-fade-in flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-indigo-900 drop-shadow-sm">
            Elige la dificultad
          </h1>
          
          <button 
            onClick={toggleAyudas}
            className={`mb-8 px-6 py-3 rounded-full font-bold text-lg transition-all shadow-md border-2 
              ${config.ayudas 
                ? 'bg-emerald-500 border-emerald-400 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-600 hover:bg-white/80'
              }`}
          >
            {config.ayudas ? '✨ Ayudas Visuales: ACTIVADAS' : 'Ayudas Visuales: Desactivadas'}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full px-4">
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
              
              // Variables base para Emojis/Iconos
              const baseSizeRem = config.columnas >= 6 ? 4.5 : config.columnas >= 5 ? 5.5 : 7;
              const vwFactor = 25 / config.columnas; 
              
              let estiloContenido = {};

              if (!esImagen) {
                if (esTexto) {
                   // LOGICA NUEVA: Si es texto largo (> 5 caracteres), reducimos el tamaño
                   if (String(carta.contenido).length > 5) {
                      estiloContenido = { fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', lineHeight: '1.1' };
                   }
                   // Si es texto corto (<= 5), usará el tamaño por defecto de CSS (text-3xl md:text-5xl)
                } else {
                   // Si es Emoji/Número
                   estiloContenido = { fontSize: `clamp(3.5rem, ${vwFactor}vw, ${baseSizeRem}rem)`, lineHeight: '1' };
                }
              }

              const claseEstado = carta.matched ? 'matched' : (carta === eleccionUno || carta === eleccionDos ? 'flipped' : '');
              const clasePeek = carta.peeking && !carta.matched && !claseEstado ? 'peeking' : '';

              return (
                <div 
                  key={carta.uniqueId} 
                  className={`carta ${claseEstado} ${clasePeek}`}
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