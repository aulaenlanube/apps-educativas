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
  const [config, setConfig] = useState({ filas: 4, columnas: 3, parejas: 6, ayudas: false });
  
  // Datos
  const [datosCrudos, setDatosCrudos] = useState([]);
  const [cartas, setCartas] = useState([]);
  
  // Lógica de selección
  const [eleccionUno, setEleccionUno] = useState(null); // Guardará uniqueId
  const [eleccionDos, setEleccionDos] = useState(null); // Guardará uniqueId
  
  const [bloqueado, setBloqueado] = useState(false);
  const [turnos, setTurnos] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Referencias para la lógica de ayudas
  const peekTimeoutRef = useRef(null);
  const peekIntervalRef = useRef(null);
  const colaAyudasRef = useRef([]); 

  // Helper: Detecta letras
  const contieneLetras = (str) => {
    if (!str) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ]/.test(String(str));
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

  const opcionesDificultad = [
    { nombre: 'Fácil', filas: 2, columnas: 4, parejas: 4 },
    { nombre: 'Normal', filas: 3, columnas: 4, parejas: 6 },
    { nombre: 'Difícil', filas: 4, columnas: 5, parejas: 10 },
    { nombre: 'Experto', filas: 4, columnas: 6, parejas: 12 }
  ];

  const iniciarJuego = (opcion) => {
    const parejasDisponibles = datosCrudos.length;
    const parejasReales = Math.min(opcion.parejas, parejasDisponibles);
    setConfig(prev => ({ ...opcion, parejas: parejasReales, ayudas: prev.ayudas }));
    mezclarCartas(parejasReales);
    setFase('juego');
    colaAyudasRef.current = []; 
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
          }, 1000);

          return nuevas;
        });
      };

      peekIntervalRef.current = setInterval(cicloAyuda, 2000);
    }

    return () => {
      if (peekIntervalRef.current) clearInterval(peekIntervalRef.current);
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, [fase, config.ayudas, eleccionUno, bloqueado]); 

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
          setCartas(prev => prev.map(c => {
            if (c.pairId === carta1.pairId) {
              return { ...c, matched: true, peeking: false };
            }
            return c;
          }));
          resetearTurno();
        } else {
          setTimeout(() => resetearTurno(), 1000);
        }
      } else {
        resetearTurno();
      }
    }
  }, [eleccionUno, eleccionDos]);

  useEffect(() => {
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
  };

  const reiniciarNivel = () => iniciarJuego(config);
  const toggleAyudas = () => setConfig(prev => ({ ...prev, ayudas: !prev.ayudas }));

  if (cargando) return <div className="contenedor-parejas text-2xl font-bold text-slate-500">Cargando... 🃏</div>;

  return (
    <div className="contenedor-parejas">
      {fase === 'menu' && (
        <div className="menu-dificultad text-center z-10 animate-fade-in flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-indigo-900 drop-shadow-sm">Elige la dificultad</h1>
          <button 
            onClick={toggleAyudas}
            className={`mb-8 px-6 py-3 rounded-full font-bold text-lg transition-all shadow-md border-2 
              ${config.ayudas ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/50 border-slate-300 text-slate-600 hover:bg-white/80'}`}
          >
            {config.ayudas ? '✨ Ayudas Visuales: ACTIVADAS' : 'Ayudas Visuales: Desactivadas'}
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full px-4">
            {opcionesDificultad.map((op, idx) => (
              <button key={idx} className="btn-dificultad" onClick={() => iniciarJuego(op)}>
                <div className="text-3xl font-bold mb-2">{op.nombre}</div>
                <div className="text-lg opacity-90">{op.filas} x {op.columnas} ({op.parejas} parejas)</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {(fase === 'juego' || fase === 'resumen') && (
        <div className="juego-area relative w-full flex flex-col justify-center items-center animate-fade-in gap-4">
          
          {/* --- BARRA DE CONTROLES SUPERIOR (MODIFICADA) --- */}
          <div className="w-full max-w-[1000px] flex justify-center items-center px-2 z-20 gap-6">
            <button 
              onClick={volverAlMenu}
              className="px-6 py-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-lg font-bold rounded-2xl shadow-md border-2 border-indigo-200 hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
            >
              ⬅️ Configurar partida
            </button>
            
            <button 
              onClick={reiniciarNivel}
              className="px-6 py-3 bg-indigo-600 text-white text-lg font-bold rounded-2xl shadow-md border-2 border-indigo-400 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
            >
              🔄 Reiniciar
            </button>
          </div>
          
          <div className="tablero-parejas" style={{ gridTemplateColumns: `repeat(${config.columnas}, 1fr)` }}>
            {cartas.map(carta => {
              const esImagen = typeof carta.contenido === 'string' && (carta.contenido.includes('.png') || carta.contenido.includes('.webp') || carta.contenido.includes('.jpg'));
              const esTexto = typeof carta.contenido === 'string' && contieneLetras(carta.contenido);
              
              const baseSizeRem = config.columnas >= 6 ? 4.5 : config.columnas >= 5 ? 5.5 : 7;
              const vwFactor = 25 / config.columnas; 
              
              let estiloContenido = {};
              if (!esImagen) {
                if (esTexto) {
                   if (String(carta.contenido).length > 5) {
                      estiloContenido = { fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', lineHeight: '1.1' };
                   }
                } else {
                   estiloContenido = { fontSize: `clamp(3.5rem, ${vwFactor}vw, ${baseSizeRem}rem)`, lineHeight: '1' };
                }
              }

              const estaSeleccionada = carta.uniqueId === eleccionUno || carta.uniqueId === eleccionDos;
              const estaGirada = estaSeleccionada || carta.matched;
              const clasePeek = carta.peeking && !estaGirada ? 'peeking' : '';
              const claseFlip = estaGirada ? 'flipped' : '';
              const claseMatch = carta.matched ? 'matched' : '';

              return (
                <div 
                  key={carta.uniqueId} 
                  className={`carta ${claseFlip} ${claseMatch} ${clasePeek}`}
                  onClick={() => !bloqueado && !carta.matched && carta.uniqueId !== eleccionUno && handleEleccion(carta)}
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

          {fase === 'resumen' && (
            <div className="overlay-resumen">
              <div className="resumen-parejas">
                <h2 className="text-4xl font-bold mb-4 text-indigo-900">¡Fantástico! 🎉</h2>
                <p className="text-lg text-gray-700 mb-6">Completado en <span className="font-bold text-indigo-600 text-2xl">{turnos}</span> turnos.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={reiniciarNivel} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg">Jugar otra vez</button>
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