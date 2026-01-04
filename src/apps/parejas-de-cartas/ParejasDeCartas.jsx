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
  const [fase, setFase] = useState('menu');
  // Añadimos isExam a la config inicial
  const [config, setConfig] = useState({ filas: 4, columnas: 3, parejas: 6, ayudas: false, isExam: false });
  const [restarting, setRestarting] = useState(false);
  const [revealing, setRevealing] = useState(false);

  // Nuevo estado para vidas
  const [vidas, setVidas] = useState(3);

  // Datos
  const [datosCrudos, setDatosCrudos] = useState([]);
  const [cartas, setCartas] = useState([]);

  // Lógica de selección
  const [eleccionUno, setEleccionUno] = useState(null);
  const [eleccionDos, setEleccionDos] = useState(null);

  const [bloqueado, setBloqueado] = useState(false);
  const [turnos, setTurnos] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Referencias
  const peekTimeoutRef = useRef(null);
  const peekIntervalRef = useRef(null);
  const colaAyudasRef = useRef([]);
  const randomDelaysRef = useRef({});

  // Helper: Detecta letras o números (para saber si es texto largo)
  const contieneLetras = (str) => {
    if (!str) return false;
    // Ahora consideramos "texto" cualquier cosa que tenga letras, números o símbolos matemáticos complejos
    // Esto fuerza a usar el renderizado de texto flexible en lugar del emoji gigante
    return /[a-zA-Z0-9+\-=()%²³⁰¹⁴⁵⁶⁷⁸⁹√π]/.test(String(str));
  };

  // Cargar datos
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
        setDatosCrudos([
          { id: 1, a: "☀️", b: "Sol" }, { id: 2, a: "🌙", b: "Luna" },
          { id: 3, a: "⭐", b: "Estrella" }, { id: 4, a: "☁️", b: "Nube" }
        ]);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [nivel, curso, asignatura]);

  // MODIFICADO: Definimos 3 niveles de entrenamiento y 3 de examen
  const opcionesEntrenamiento = [
    { nombre: 'Fácil', filas: 2, columnas: 4, parejas: 4, isExam: false },
    { nombre: 'Normal', filas: 3, columnas: 4, parejas: 6, isExam: false },
    { nombre: 'Difícil', filas: 4, columnas: 5, parejas: 10, isExam: false }
  ];

  const opcionesExamen = [
    { nombre: 'Básico', filas: 4, columnas: 4, parejas: 8, isExam: true, icono: '📝' },
    { nombre: 'Medio', filas: 4, columnas: 6, parejas: 12, isExam: true, icono: '🎓' },
    { nombre: 'Avanzado', filas: 5, columnas: 8, parejas: 20, isExam: true, icono: '🏆' }
  ];

  const iniciarJuego = (opcion) => {
    const parejasDisponibles = datosCrudos.length;
    const parejasReales = Math.min(opcion.parejas, parejasDisponibles);

    // Si es examen, forzamos ayudas a true, si no, mantenemos lo que hubiera o false
    const ayudasActivas = opcion.isExam ? true : (opcion.ayudas || false);

    setConfig({ ...opcion, parejas: parejasReales, ayudas: ayudasActivas });

    // Reiniciar vidas si es examen
    if (opcion.isExam) {
      setVidas(3);
    }

    mezclarCartas(parejasReales);
    setFase('juego');
    colaAyudasRef.current = [];
    randomDelaysRef.current = {};
  };

  const mezclarCartas = (cantidadParejas) => {
    const datosSeleccionados = [...datosCrudos].sort(() => Math.random() - 0.5).slice(0, cantidadParejas);

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

  // --- LÓGICA DE AYUDAS VISUALES ---
  useEffect(() => {
    if (peekIntervalRef.current) clearInterval(peekIntervalRef.current);
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);

    if (eleccionUno || bloqueado) {
      setCartas(prev => prev.map(c => c.peeking ? { ...c, peeking: false } : c));
      return;
    }

    if (fase === 'juego' && config.ayudas) {
      const cicloAyuda = () => {
        setCartas(prev => {
          const indicesValidos = prev
            .map((c, i) => (!c.matched ? i : -1))
            .filter(i => i !== -1);

          if (indicesValidos.length < 2) return prev;

          colaAyudasRef.current = colaAyudasRef.current.filter(idx => indicesValidos.includes(idx));

          if (colaAyudasRef.current.length < 2) {
            const nuevaCola = [...indicesValidos].sort(() => Math.random() - 0.5);
            colaAyudasRef.current = nuevaCola;
          }

          const idx1 = colaAyudasRef.current.shift();
          const idx2 = colaAyudasRef.current.shift();

          if (idx1 === undefined) return prev;

          const nuevas = prev.map((c, i) => {
            if (i === idx1 || i === idx2) return { ...c, peeking: true };
            return c;
          });

          peekTimeoutRef.current = setTimeout(() => {
            setCartas(curr => curr.map(c => c.peeking ? { ...c, peeking: false } : c));
          }, 1000); // Duración del 'peek'

          return nuevas;
        });
      };

      // En modo examen quizás queramos que las ayudas salgan un poco más rápido o igual
      const intervaloAyudas = config.isExam ? 1500 : 2000;
      peekIntervalRef.current = setInterval(cicloAyuda, intervaloAyudas);
    }

    return () => {
      if (peekIntervalRef.current) clearInterval(peekIntervalRef.current);
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, [fase, config.ayudas, config.isExam, eleccionUno, bloqueado]);

  // --- LÓGICA DEL JUEGO ---
  const handleEleccion = (carta) => {
    if (bloqueado) return;
    if (eleccionUno) {
      setEleccionDos(carta.uniqueId);
    } else {
      setEleccionUno(carta.uniqueId);
    }
  };

  useEffect(() => {
    if (eleccionUno && eleccionDos) {
      setBloqueado(true);

      const carta1 = cartas.find(c => c.uniqueId === eleccionUno);
      const carta2 = cartas.find(c => c.uniqueId === eleccionDos);

      if (carta1 && carta2) {
        if (carta1.pairId === carta2.pairId) {
          // Acierto
          setCartas(prev => prev.map(c => {
            if (c.pairId === carta1.pairId) {
              return { ...c, matched: true, peeking: false };
            }
            return c;
          }));
          resetearTurno();
        } else {
          // Fallo
          if (config.isExam) {
            // Restar vida y comprobar muerte
            if (vidas > 1) {
              setVidas(v => v - 1);
              setTimeout(() => resetearTurno(), 1000);
            } else {
              setVidas(0);
              // Game Over por vidas
              setTimeout(() => {
                setFase('resumen');
                // No tiramos confeti si suspende
              }, 1000);
            }
          } else {
            // Modo normal
            setTimeout(() => resetearTurno(), 1000);
          }
        }
      } else {
        resetearTurno();
      }
    }
  }, [eleccionUno, eleccionDos]);

  useEffect(() => {
    // Victoria completa
    if (fase === 'juego' && cartas.length > 0 && cartas.every(carta => carta.matched)) {
      setFase('resumen');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [cartas, fase]);

  const resetearTurno = () => {
    setEleccionUno(null);
    setEleccionDos(null);
    setTurnos(p => p + 1);
    setBloqueado(false);
  };

  const volverAlMenu = () => {
    setFase('menu');
    setCartas([]);
    setRestarting(false);
    setRevealing(false);
  };

  const reiniciarNivel = () => {
    if (restarting || revealing) return;
    setRevealing(true);
    setTimeout(() => {
      setRestarting(true);
      setTimeout(() => {
        iniciarJuego(config);
        setRestarting(false);
        setRevealing(false);
      }, 700);
    }, 400);
  };

  // Toggle ayudas bloqueado en modo examen
  const toggleAyudas = () => {
    if (!config.isExam) {
      setConfig(prev => ({ ...prev, ayudas: !prev.ayudas }));
    }
  };

  const getRandomDelay = (id) => {
    if (!randomDelaysRef.current[id]) {
      randomDelaysRef.current[id] = Math.random() * 0.2;
    }
    return randomDelaysRef.current[id];
  };

  // CALCULO DE NOTA PARA EXAMEN
  const calcularNota = () => {
    const totalParejas = config.parejas;
    const parejasEncontradas = cartas.filter(c => c.matched).length / 2;
    const nota = (parejasEncontradas / totalParejas) * 10;
    return nota.toFixed(1); // Un decimal
  };

  if (cargando) return <div className="contenedor-parejas text-2xl font-bold text-slate-500">Cargando... 🃏</div>;

  return (
    <div className="contenedor-parejas">
      {fase === 'menu' && (
        <div className="menu-dificultad text-center z-10 animate-fade-in flex flex-col items-center w-full max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-black mb-10 text-indigo-900 drop-shadow-sm tracking-tight">PAREJAS DE CARTAS</h1>

          <div className="w-full space-y-12">
            {/* SECCIÓN ENTRENAMIENTO */}
            <section>
              <h2 className="text-xl font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-indigo-200" />
                Entrenamiento
                <div className="h-px w-12 bg-indigo-200" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
                {opcionesEntrenamiento.map((op, idx) => (
                  <button
                    key={idx}
                    className="btn-dificultad"
                    onClick={() => iniciarJuego(op)}
                  >
                    <div className="text-2xl font-bold mb-1">{op.nombre}</div>
                    <div className="text-sm opacity-80 font-medium">
                      {op.filas}x{op.columnas} • {op.parejas} parejas
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* SECCIÓN EXAMEN */}
            <section>
              <h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-amber-200" />
                Modo Examen (3 Vidas)
                <div className="h-px w-12 bg-amber-200" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
                {opcionesExamen.map((op, idx) => (
                  <button
                    key={idx}
                    className="btn-dificultad btn-examen"
                    onClick={() => iniciarJuego(op)}
                  >
                    <div className="text-2xl font-bold mb-1 flex items-center gap-2">
                      <span>{op.icono}</span>
                      {op.nombre}
                    </div>
                    <div className="text-sm opacity-90 font-medium">
                      {op.filas}x{op.columnas} • {op.parejas} parejas
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {(fase === 'juego' || fase === 'resumen') && (
        <div className="juego-area relative w-full flex flex-col justify-center items-center animate-fade-in gap-4">

          {/* --- BARRA DE CONTROLES SUPERIOR --- */}
          <div className="w-full max-w-[1000px] flex flex-wrap justify-center items-center px-2 z-20 gap-4 md:gap-6 mb-2">
            <button
              onClick={volverAlMenu}
              disabled={restarting || revealing}
              className="px-4 py-2 md:px-6 md:py-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-base md:text-lg font-bold rounded-2xl shadow-md border-2 border-indigo-200 hover:bg-white hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              ⬅️ <span className="hidden sm:inline">Dificultad</span>
            </button>

            {/* Si es examen mostramos VIDAS, si no, botón de ayudas */}
            {config.isExam ? (
              <div className="px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold text-base md:text-lg shadow-md border-2 bg-red-100 border-red-300 text-red-600 flex items-center gap-2">
                Vidas: {Array(3).fill(0).map((_, i) => (
                  <span key={i} className={i < vidas ? 'opacity-100' : 'opacity-30 grayscale'}>❤️</span>
                ))}
              </div>
            ) : (
              <button
                onClick={toggleAyudas}
                disabled={restarting || revealing}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold text-base md:text-lg transition-all shadow-md border-2 flex items-center gap-2 hover:scale-105 disabled:opacity-50
                    ${config.ayudas ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/90 backdrop-blur-sm border-slate-300 text-slate-600 hover:bg-white'}`}
              >
                {config.ayudas ? '✨ Ayudas: ON' : '👁️ Ayudas: OFF'}
              </button>
            )}

            <button
              onClick={reiniciarNivel}
              disabled={restarting || revealing}
              className="px-4 py-2 md:px-6 md:py-3 bg-indigo-600 text-white text-base md:text-lg font-bold rounded-2xl shadow-md border-2 border-indigo-400 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {restarting || revealing ? '🔄 ...' : <>🔄 <span className="hidden sm:inline">Reiniciar</span></>}
            </button>
          </div>

          <div className="tablero-parejas" style={{ gridTemplateColumns: `repeat(${config.columnas}, 1fr)` }}>
            {cartas.map(carta => {
              const esImagen = typeof carta.contenido === 'string' && (carta.contenido.includes('.png') || carta.contenido.includes('.webp') || carta.contenido.includes('.jpg'));
              const esTexto = typeof carta.contenido === 'string' && contieneLetras(carta.contenido);

              const baseSizeRem = config.columnas >= 6 ? 4.5 : config.columnas >= 5 ? 5.5 : 7;
              const vwFactor = 25 / config.columnas;

              let estiloContenido = {};
              let extraClasses = "";

              if (!esImagen) {
                const text = String(carta.contenido);
                if (esTexto) {
                  // Sistema de escalado DINÁMICO según DENSIDAD de tablero y LONGITUD de texto
                  const cols = config.columnas;
                  const count = text.length;
                  const hasSpaces = text.includes(' ');

                  // Lógica matricial de tamaños (Grid ralo vs Grid denso)
                  if (count > 25) {
                    extraClasses = cols > 5 ? "text-[9px] md:text-[11px]" : "text-xs md:text-base";
                  } else if (count > 15) {
                    extraClasses = cols > 5 ? "text-[11px] md:text-sm" : "text-sm md:text-xl";
                  } else if (count > 8) {
                    extraClasses = cols > 5 ? "text-sm md:text-base" : "text-xl md:text-3xl";
                  } else if (count > 5) { // 6, 7, 8 letras
                    extraClasses = cols > 5 ? "text-base md:text-lg" : "text-3xl md:text-5xl";
                  } else if (count > 2) { // 3, 4, 5 letras
                    extraClasses = cols > 5 ? "text-lg md:text-2xl" : "text-4xl md:text-6xl";
                  } else { // 1, 2 letras
                    extraClasses = cols > 5 ? "text-2xl md:text-4xl" : "text-6xl md:text-8xl";
                  }

                  extraClasses += " leading-tight px-1 transition-all duration-300";

                  // Protección lateral: Si es una sola palabra y el grid es denso, bajamos el tamaño
                  if (!hasSpaces && count > 7 && cols > 4) {
                    extraClasses = extraClasses
                      .replace("text-lg", "text-base")
                      .replace("text-2xl", "text-xl")
                      .replace("md:text-lg", "md:text-base")
                      .replace("md:text-3xl", "md:text-2xl")
                      .replace("md:text-5xl", "md:text-4xl");
                  }
                } else {
                  // Símbolos cortos o números
                  const vwFactor = 25 / config.columnas;
                  const baseSizeRem = config.columnas >= 6 ? 4 : config.columnas >= 5 ? 5 : 6;
                  estiloContenido = { fontSize: `clamp(2.5rem, ${vwFactor}vw, ${baseSizeRem}rem)`, lineHeight: '1' };
                }
              }

              const estaSeleccionada = carta.uniqueId === eleccionUno || carta.uniqueId === eleccionDos;
              const estaGirada = estaSeleccionada || carta.matched || revealing;

              const clasePeek = carta.peeking && !estaGirada ? 'peeking' : '';
              const claseFlip = estaGirada ? 'flipped' : '';
              const claseMatch = carta.matched ? 'matched' : '';
              const claseShake = restarting ? 'shaking' : '';

              const estiloAnimacion = restarting
                ? { animationDelay: `${getRandomDelay(carta.uniqueId)}s` }
                : {};

              return (
                <div
                  key={carta.uniqueId}
                  className={`carta ${claseFlip} ${claseMatch} ${clasePeek} ${claseShake}`}
                  style={estiloAnimacion}
                  onClick={() => !bloqueado && !restarting && !revealing && !carta.matched && carta.uniqueId !== eleccionUno && handleEleccion(carta)}
                >
                  <div className="carta-cara carta-frente">
                    {esImagen ? (
                      <img src={carta.contenido} alt="carta" className="w-3/4 h-3/4 object-contain" />
                    ) : (
                      <span className={`carta-texto ${extraClasses}`} style={estiloContenido}>
                        {carta.contenido}
                      </span>
                    )}
                  </div>
                  <div className="carta-cara carta-dorso">
                    <span className="opacity-50 select-none">?</span>
                  </div>
                </div>
              );
            })}
          </div>

          {fase === 'resumen' && !restarting && !revealing && (
            <div className="overlay-resumen">
              <div className="resumen-parejas">
                {config.isExam ? (
                  // RESUMEN MODO EXAMEN
                  <>
                    <h2 className="text-4xl font-bold mb-2 text-indigo-900">
                      {vidas > 0 ? '¡Examen Aprobado! 🎓' : 'Examen Finalizado 🔔'}
                    </h2>
                    <div className="my-6 py-4 bg-slate-50 rounded-xl border-2 border-indigo-100">
                      <p className="text-lg text-gray-600 mb-1">Tu nota es</p>
                      <span className={`text-6xl font-black ${vidas > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {calcularNota()}
                      </span>
                      {vidas === 0 && <p className="text-sm text-red-400 mt-2 font-bold">(Te quedaste sin vidas)</p>}
                    </div>
                  </>
                ) : (
                  // RESUMEN MODO NORMAL
                  <>
                    <h2 className="text-4xl font-bold mb-4 text-indigo-900">¡Fantástico! 🎉</h2>
                    <p className="text-lg text-gray-700 mb-6">Completado en <span className="font-bold text-indigo-600 text-2xl">{turnos}</span> turnos.</p>
                  </>
                )}

                <div className="flex flex-col gap-3">
                  <button onClick={reiniciarNivel} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg">Intentar de nuevo</button>
                  <button onClick={volverAlMenu} className="px-8 py-3 bg-transparent border-2 border-indigo-600 text-indigo-600 rounded-full font-bold hover:bg-indigo-50">Cambiar dificultad</button>
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