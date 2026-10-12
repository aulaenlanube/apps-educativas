// Parejas de Cartas — rediseño 2026 sobre el kit de interfaz (_shared/kit).
// Cartas con giro 3D de verdad (dorso esmaltado con celosía y medallón de
// estrella, cara de cartulina con marco), destello dorado en las ayudas y
// sello verde al formar pareja. Lógica, ayudas, vidas y tracking sin cambios.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Eye, EyeOff, Flame, GraduationCap, Heart, LayoutGrid,
  Link2, Minus, Plus, RefreshCw, Repeat, Sprout, Target, Clock, Zap, Trophy,
} from 'lucide-react';
import { getParejasData } from '../../services/gameDataService';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Lives, GameButton, Chip, ModeSelect,
  RoundBanner, ResultsScreen, GameLoading,
} from '../_shared/kit';
import './ParejasDeCartas.css';

// Tamaño de letra de la carta según la longitud del texto (equivale a la
// escala de antes, ahora relativa al ancho de la carta con unidades cqi).
const tamTexto = (text) => {
  const count = text.length;
  const longest = Math.max(1, ...text.split(/\s+/).map((w) => w.length));
  const max = count > 25 ? 15 : count > 15 ? 19 : count > 8 ? 26 : count > 5 ? 34 : count > 2 ? 46 : 64;
  return { '--pc-len': longest, '--pc-max': `${max}px` };
};

const ParejasDeCartas = ({ tema, onGameComplete }) => {
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
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);
  const [zoom, setZoom] = useState(1);

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
  const gameStartRef = useRef(0);

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
      try {
        const datos = await getParejasData(nivel, curso, asignatura);
        if (!datos || datos.length === 0) throw new Error('No se encontraron datos');
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
    { nombre: 'Básico', filas: 4, columnas: 4, parejas: 8, isExam: true, icono: '📝', notaModifier: -1 },
    { nombre: 'Medio', filas: 4, columnas: 6, parejas: 12, isExam: true, icono: '🎓', notaModifier: 0 },
    { nombre: 'Avanzado', filas: 5, columnas: 8, parejas: 20, isExam: true, icono: '🏆', notaModifier: 1 }
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

    setZoom(1); // Reiniciar zoom al empezar partida
    mezclarCartas(parejasReales);
    setFase('juego');
    colaAyudasRef.current = [];
    randomDelaysRef.current = {};
    gameStartRef.current = Date.now();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eleccionUno, eleccionDos]);

  const trackedRef = useRef(false);
  useEffect(() => {
    // Victoria completa
    if (fase === 'juego' && cartas.length > 0 && cartas.every(carta => carta.matched)) {
      setFase('resumen');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [cartas, fase]);

  // Tracking al entrar en resumen
  useEffect(() => {
    if (fase === 'resumen' && !trackedRef.current) {
      trackedRef.current = true;
      const parejasEncontradas = cartas.filter(c => c.matched).length / 2;
      const basePoints = parejasEncontradas * 100;
      const minTurnos = config.parejas;
      const turnosBonus = Math.max(0, Math.round(300 * (1 - (turnos - minTurnos) / (minTurnos * 2))));
      // Bonus por rapidez: presupuesto 8s/pareja
      const elapsedSec = gameStartRef.current
        ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
        : 0;
      const TIME_BUDGET = config.parejas * 8;
      const SPEED_COEF = 5;
      const timeBonus = elapsedSec > 0
        ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
        : 0;
      const totalPoints = basePoints + turnosBonus + timeBonus;
      const isExamMode = config.isExam;
      const modifier = config.notaModifier || 0;
      const notaBase = config.parejas > 0 ? (parejasEncontradas / config.parejas) * 10 : 0;
      const notaFinal = Math.max(0, Math.min(10, notaBase + modifier));
      onGameComplete?.({
        mode: isExamMode ? 'test' : 'practice',
        score: isExamMode ? totalPoints : 0,
        maxScore: isExamMode ? config.parejas * 100 + 300 + TIME_BUDGET * SPEED_COEF : 0,
        correctAnswers: parejasEncontradas,
        totalQuestions: config.parejas,
        durationSeconds: elapsedSec || undefined,
        ...(isExamMode ? { nota: Math.round(notaFinal * 10) / 10 } : {}),
      });
    }
    if (fase !== 'resumen') trackedRef.current = false;
  }, [fase, cartas, config, turnos, onGameComplete]);

  // Solo presentación: puntos paralelos y tiempo para el resumen del examen
  // (mismas fórmulas que el tracking de arriba; se calculan al entrar en resumen).
  const resumenExamen = useMemo(() => {
    if (fase !== 'resumen' || !config.isExam) return { puntos: 0, segundos: 0 };
    const parejasEncontradas = cartas.filter(c => c.matched).length / 2;
    const minTurnos = config.parejas;
    const turnosBonus = Math.max(0, Math.round(300 * (1 - (turnos - minTurnos) / (minTurnos * 2))));
    const segundos = gameStartRef.current ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000)) : 0;
    const timeBonus = segundos > 0 ? Math.max(0, Math.round((config.parejas * 8 - segundos) * 5)) : 0;
    return { puntos: parejasEncontradas * 100 + turnosBonus + timeBonus, segundos };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se congela al entrar en resumen
  }, [fase]);

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
    setMostrarAyuda(false);
    setZoom(1);
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

  // CALCULO DE NOTA PARA EXAMEN (con modificador por dificultad)
  const calcularNotaNum = () => {
    const totalParejas = config.parejas;
    const parejasEncontradas = cartas.filter(c => c.matched).length / 2;
    const base = (parejasEncontradas / totalParejas) * 10;
    const modifier = config.notaModifier || 0;
    return Math.max(0, Math.min(10, base + modifier));
  };

  // Solo presentación: detecta si las dos cartas levantadas no son pareja (para el feedback visual)
  const cartaSel1 = eleccionUno ? cartas.find(c => c.uniqueId === eleccionUno) : null;
  const cartaSel2 = eleccionDos ? cartas.find(c => c.uniqueId === eleccionDos) : null;
  const parejaFallida = !!(cartaSel1 && cartaSel2 && cartaSel1.pairId !== cartaSel2.pairId);

  const esImagenSrc = (v) => typeof v === 'string' && (v.includes('.png') || v.includes('.webp') || v.includes('.jpg'));
  const shellProps = { accent: '#8b5cf6', accent2: '#ec4899', className: 'pc-shell' };

  const instrucciones = (
    <InstructionsModal isOpen={mostrarInstrucciones} onClose={() => setMostrarInstrucciones(false)} title="Cómo jugar a Parejas de Cartas">
      <h3>🎯 Objetivo</h3>
      <p>Da la vuelta a las cartas de dos en dos y encuentra todas las <strong>parejas</strong> (cada concepto con su compañero).</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Toca una carta para girarla y después otra.</li>
        <li>Si forman pareja, se quedan boca arriba. Si no, vuelven a girarse.</li>
        <li>Con las <strong>ayudas</strong> activadas, de vez en cuando dos cartas se asoman un instante.</li>
        <li>Usa <strong>− / +</strong> para ajustar el tamaño del tablero.</li>
      </ul>
      <h3>🎓 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Entrenamiento</strong>Fácil (4), Normal (6) y Difícil (10 parejas). Sin vidas.</div>
        <div className="instr-mode exam"><strong>Examen</strong>3 vidas. Básico resta 1 a la nota, Avanzado suma 1 (de 0 a 10).</div>
      </div>
    </InstructionsModal>
  );

  const guiaParejas = (
    <InstructionsModal isOpen={mostrarAyuda} onClose={() => setMostrarAyuda(false)} title="Guía de parejas">
      <div className="pc-guide">
        {datosCrudos.map((par, i) => (
          <div key={i} className="pc-guide__pair">
            <span className="pc-guide__side">
              {esImagenSrc(par.a) ? <img src={par.a} alt="" loading="lazy" /> : par.a}
            </span>
            <Link2 size={16} className="pc-guide__link" />
            <span className="pc-guide__side">
              {esImagenSrc(par.b) ? <img src={par.b} alt="" loading="lazy" /> : par.b}
            </span>
          </div>
        ))}
      </div>
    </InstructionsModal>
  );

  if (cargando) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Barajando las cartas…" />
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir dificultad ---
  if (fase === 'menu') {
    const TONOS = ['easy', 'medium', 'hard'];
    const ICONOS = [Sprout, Zap, Flame];
    const DESC = ['Un tablero pequeño para empezar.', 'Más cartas, más memoria.', 'El reto de verdad para tu memoria.'];
    const modes = opcionesEntrenamiento.map((op, i) => ({
      id: String(i),
      tone: TONOS[i],
      icon: ICONOS[i],
      title: op.nombre,
      desc: DESC[i],
      features: [`${op.filas}×${op.columnas} · ${op.parejas} parejas`, 'Ayudas opcionales'],
    }));
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => iniciarJuego(opcionesEntrenamiento[Number(id)])}
          onHelp={() => setMostrarInstrucciones(true)}
          onStudy={() => setMostrarAyuda(true)}
          extra={(
            <section className="pc-exams">
              <h2 className="pc-exams__title"><GraduationCap size={18} /> Modo examen <span>· 3 vidas · cuenta para la nota</span></h2>
              <div className="pc-exams__grid">
                {opcionesExamen.map((op, i) => (
                  <motion.button
                    key={op.nombre}
                    type="button"
                    className="gk-mode gk-tone-exam pc-exam"
                    onClick={() => iniciarJuego(op)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="gk-mode__band" aria-hidden="true" />
                    <span className="gk-mode__medal"><GraduationCap size={24} /></span>
                    <span className="gk-mode__title">{op.nombre}</span>
                    <span className="gk-mode__features">
                      <span className="gk-mode__feat"><Check size={13} strokeWidth={3} /> {op.filas}×{op.columnas} · {op.parejas} parejas</span>
                      <span className="gk-mode__feat"><Check size={13} strokeWidth={3} /> Nota sobre 10</span>
                    </span>
                    {op.notaModifier !== 0 && (
                      <span className={`pc-mod ${op.notaModifier > 0 ? 'is-plus' : 'is-minus'}`}>
                        {op.notaModifier > 0 ? `+${op.notaModifier}` : op.notaModifier} a la nota
                      </span>
                    )}
                    <span className="gk-mode__cta">Examinarme <ArrowRight size={16} /></span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}
        />
        {instrucciones}
        {guiaParejas}
      </GameShell>
    );
  }

  const parejasEncontradas = cartas.filter(c => c.matched).length / 2;
  const enResumen = fase === 'resumen' && !restarting && !revealing;

  // --- Resumen del examen ---
  if (enResumen && config.isExam) {
    const notaNum = Math.round(calcularNotaNum() * 10) / 10;
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title={vidas > 0 ? '¡Examen superado!' : 'Examen finalizado'}
          subtitle={vidas === 0 ? 'Te quedaste sin vidas' : `Parejas de Cartas · nivel ${config.nombre}`}
          nota={notaNum}
          points={resumenExamen.puntos}
          stats={[
            { icon: Link2, tone: 'good', label: 'Parejas', value: `${parejasEncontradas}/${config.parejas}` },
            { icon: Repeat, tone: 'progress', label: 'Turnos', value: turnos },
            { icon: Heart, tone: 'lives', label: 'Vidas', value: `${vidas}/3` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${resumenExamen.segundos}s` },
          ]}
          actions={[
            { label: 'Intentar de nuevo', onClick: reiniciarNivel, icon: RefreshCw },
            { label: 'Cambiar dificultad', onClick: volverAlMenu, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {config.notaModifier !== 0 && (
            <div className="pc-note">
              <Chip tone={config.notaModifier > 0 ? 'good' : 'bad'} icon={Target}>
                {config.notaModifier > 0
                  ? `Bonus por dificultad ${config.nombre}: +${config.notaModifier} (de 0 a 10)`
                  : `Penalización por dificultad ${config.nombre}: ${config.notaModifier} (de 0 a 10)`}
              </Chip>
            </div>
          )}
        </ResultsScreen>
        {instrucciones}
        {guiaParejas}
      </GameShell>
    );
  }

  const ocupado = restarting || revealing;
  const modoHeader = config.isExam ? 'exam' : config.nombre === 'Fácil' ? 'easy' : 'medium';

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={modoHeader}
        modeLabel={config.isExam ? `Examen · ${config.nombre}` : config.nombre}
        onHelp={() => setMostrarInstrucciones(true)}
        onStudy={() => setMostrarAyuda(true)}
        right={(
          <Hud>
            <HudStat icon={Link2} tone="good" value={`${parejasEncontradas}/${config.parejas}`} label="Parejas" />
            <HudStat icon={Repeat} tone="progress" value={turnos} label="Turnos" />
            {config.isExam && <span className="pc-lives"><Lives total={3} left={vidas} /></span>}
          </Hud>
        )}
      />

      <div className="pc-toolbar">
        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={volverAlMenu} disabled={ocupado}>Dificultad</GameButton>
        {config.isExam ? (
          <Chip tone="soft" icon={Eye}>Ayudas activas en examen</Chip>
        ) : (
          <GameButton
            variant={config.ayudas ? 'success' : 'soft'}
            size="sm"
            icon={config.ayudas ? Eye : EyeOff}
            onClick={toggleAyudas}
            disabled={ocupado}
            aria-pressed={config.ayudas}
          >
            Ayudas: {config.ayudas ? 'sí' : 'no'}
          </GameButton>
        )}
        <GameButton variant="primary" size="sm" icon={RefreshCw} onClick={reiniciarNivel} disabled={ocupado}>
          {ocupado ? 'Barajando…' : 'Reiniciar'}
        </GameButton>
        <div className="pc-zoom" role="group" aria-label="Tamaño del tablero">
          <button type="button" className="pc-zoom__btn" onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))} title="Reducir tamaño" aria-label="Reducir tamaño">
            <Minus size={16} />
          </button>
          <span className="pc-zoom__label">{Math.round(zoom * 100)}%</span>
          <button type="button" className="pc-zoom__btn" onClick={() => setZoom(prev => Math.min(1.8, prev + 0.1))} title="Aumentar tamaño" aria-label="Aumentar tamaño">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <RoundBanner
        show={enResumen && !config.isExam}
        status="won"
        title="¡Fantástico!"
        subtitle={`Has encontrado las ${config.parejas} parejas en ${turnos} turnos.`}
        action={reiniciarNivel}
        actionLabel="Jugar otra vez"
        actionIcon={RefreshCw}
      />

      <div
        className="pc-board"
        style={{
          gridTemplateColumns: `repeat(${config.columnas}, minmax(0, 1fr))`,
          '--pc-cols': config.columnas,
          zoom: zoom,
        }}
      >
        {cartas.map(carta => {
          const esImagen = esImagenSrc(carta.contenido);
          const esTexto = typeof carta.contenido === 'string' && contieneLetras(carta.contenido);
          const texto = String(carta.contenido);

          const estaSeleccionada = carta.uniqueId === eleccionUno || carta.uniqueId === eleccionDos;
          const estaGirada = estaSeleccionada || carta.matched || revealing;
          const peek = carta.peeking && !estaGirada;
          const fallo = parejaFallida && estaSeleccionada;

          const estiloAnimacion = restarting
            ? { animationDelay: `${getRandomDelay(carta.uniqueId)}s` }
            : undefined;

          return (
            <button
              type="button"
              key={carta.uniqueId}
              className={[
                'pc-card',
                estaGirada && 'is-flipped',
                carta.matched && 'is-matched',
                peek && 'is-peek',
                restarting && 'is-shaking',
                fallo && 'is-fail',
              ].filter(Boolean).join(' ')}
              style={estiloAnimacion}
              onClick={() => !bloqueado && !restarting && !revealing && !carta.matched && carta.uniqueId !== eleccionUno && handleEleccion(carta)}
              aria-label={estaGirada || peek ? texto : 'Carta boca abajo'}
            >
              <span className="pc-card__inner">
                <span className="pc-card__back" aria-hidden="true">
                  <span className="pc-card__emblem" />
                </span>
                <span className="pc-card__face">
                  {esImagen ? (
                    <img src={carta.contenido} alt="" className="pc-card__img" loading="lazy" decoding="async" />
                  ) : (
                    <span className={`pc-card__text ${esTexto ? 'is-text' : 'is-symbol'}`} style={esTexto ? tamTexto(texto) : undefined}>
                      {carta.contenido}
                    </span>
                  )}
                  {carta.matched && <span className="pc-card__check" aria-hidden="true"><Check size={14} strokeWidth={3.5} /></span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="pc-footer">
        {config.isExam ? (
          <span className="pc-footer__info"><GraduationCap size={14} /> Examen · 3 vidas · {config.parejas} parejas</span>
        ) : (
          <span className="pc-footer__info"><Trophy size={14} /> Entrenamiento · {config.filas}×{config.columnas}</span>
        )}
      </div>

      {instrucciones}
      {guiaParejas}
    </GameShell>
  );
};

export default ParejasDeCartas;
