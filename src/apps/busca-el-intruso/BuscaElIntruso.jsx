// Busca el Intruso — rediseño 2026 sobre el kit de interfaz (_shared/kit).
// Juego de discriminación visual y semántica: tablero de fichas con volumen,
// mira de búsqueda al pasar el ratón y sello de acierto/fallo. La lógica de
// rondas, cronómetro, puntuación y tracking es la de siempre.
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Flame, Clock, Target, RefreshCw, LayoutGrid, GraduationCap,
  Search, BookOpen, Sparkles, Eye, Crosshair,
} from 'lucide-react';
import { getIntrusoData } from '../../services/gameDataService';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, Panel, GameButton,
  ModeSelect, ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from '../_shared/kit';
import './BuscaElIntruso.css';

const BuscaElIntruso = ({ tema, onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const nivel = level || 'primaria';
  const curso = gradeParam || '1';

  const [datosJuego, setDatosJuego] = useState(null);
  const datosRef = useRef(null);
  const [modoLogico, setModoLogico] = useState('visual');
  const [showHelp, setShowHelp] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  // false = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [enJuego, setEnJuego] = useState(false);
  // Solo presentación: registro de rondas del examen para los puntos de progreso
  // y la retroalimentación del resumen. No interviene en la puntuación.
  const [registroExamen, setRegistroExamen] = useState([]);

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
  // Resultado del examen tal y como se registra (el resumen pinta ESTOS números).
  const [resultadoExamen, setResultadoExamen] = useState(null);
  // Estado vivo para finalizarTest: se llama desde el setTimeout de gestionarClick,
  // cuyo cierre es anterior a la última respuesta (aciertos/racha sin actualizar).
  const estadoRef = useRef(estado);
  useEffect(() => { estadoRef.current = estado; }, [estado]);
  // Una sola llamada a onGameComplete por examen (CLAUDE.md §5).
  const examRegistradoRef = useRef(false);
  const [restarting, setRestarting] = useState(false);

  const asignatura = tema || (typeof subjectId === 'string' && subjectId.trim() ? subjectId.trim() : 'general');

  // --- Funciones Auxiliares ---
  const contieneLetras = (str) => {
    if (!str) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ]/.test(String(str));
  };

  // --- Carga de Datos ---
  useEffect(() => {
    let vivo = true;
    setDatosJuego(null);

    const effectiveSubject = (asignatura && asignatura !== 'general') ? asignatura : 'general';

    (async () => {
      try {
        let datos = await getIntrusoData(nivel, curso, effectiveSubject);
        // Fallback a 'general' si no hay datos para la asignatura
        if ((!datos || datos.length === 0) && effectiveSubject !== 'general') {
          datos = await getIntrusoData(nivel, curso, 'general');
        }
        if (vivo) {
          if (Array.isArray(datos) && datos.length > 0 && typeof datos[0] === 'string') {
            setModoLogico('visual');
          } else {
            setModoLogico('conceptual');
          }
          setDatosJuego(datos || []);
        }
      } catch (e) {
        console.warn('Error cargando intruso data:', e);
        if (vivo) setDatosJuego([]);
      }
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

  // Mantener ref sincronizado con el estado
  useEffect(() => { datosRef.current = datosJuego; }, [datosJuego]);

  // --- Lógica del Juego ---
  const generarYRenderizarColeccion = () => {
    const datos = datosRef.current;
    if (!datos || datos.length === 0) return;

    let nuevoTablero = [];
    let indiceIntruso = -1;
    let rows, cols;
    let mensaje = '';
    let categoria = '';

    if (modoLogico === 'visual') {
      rows = 4; cols = 8;
      const total = rows * cols;
      const { base, intruso } = elegirParEmojisVisual(datos);
      indiceIntruso = Math.floor(Math.random() * total);
      nuevoTablero = Array.from({ length: total }, (_, i) => (i === indiceIntruso ? intruso : base));
      mensaje = '¡Encuentra el diferente!';
    } else {
      rows = 3; cols = 4;
      const total = rows * cols;
      const desafio = datos[Math.floor(Math.random() * datos.length)];
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
    if (examRegistradoRef.current) return;
    examRegistradoRef.current = true;
    const st = estadoRef.current; // incluye ya la última respuesta
    const elapsed = st.tiempoInicio ? Math.round((performance.now() - st.tiempoInicio) / 1000) : 0;
    const basePoints = st.aciertos * 100;
    const refTime = st.rondasTotales * 8;
    const timeBonus = Math.max(0, Math.round(300 * (1 - elapsed / refTime)));
    const comboBonus = Math.min(st.combo * 15, 200);
    const totalPoints = basePoints + timeBonus + comboBonus;
    setResultadoExamen({
      aciertos: st.aciertos,
      rondasTotales: st.rondasTotales,
      combo: st.combo,
      nota: Math.round((st.aciertos / st.rondasTotales) * 100) / 10,
      points: totalPoints,
    });
    setMostrarResumen(true);
    onGameComplete?.({
      mode: 'test',
      score: totalPoints,
      maxScore: st.rondasTotales * 100 + 500,
      correctAnswers: st.aciertos,
      totalQuestions: st.rondasTotales,
      durationSeconds: elapsed,
    });
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
    setRegistroExamen([]);
    setResultadoExamen(null);
    examRegistradoRef.current = false;
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
    // La partida no arranca hasta elegir modo en la pantalla previa.
    if (enJuego && datosJuego && datosJuego.length > 0) {
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

    if (estado.modo === 'test') {
      // Solo presentación (puntos de progreso y retroalimentación del resumen)
      setRegistroExamen(prev => [...prev, {
        ok: esCorrecto,
        categoria: estado.categoria,
        intruso: estado.tablero[estado.indiceIntruso],
        elegido: estado.tablero[indice],
      }]);
    }

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

  // --- Selección de modo (pantalla previa) ---
  const elegirModo = (id) => {
    setEnJuego(true);
    if (id === 'test') iniciarTest();
    else activarModoLibre();
  };

  const volverAModos = () => {
    detenerCronometro();
    setEnJuego(false);
  };

  const shellProps = { accent: '#f59e0b', accent2: '#ec4899', className: 'bi-shell' };

  const instrucciones = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Busca el Intruso">
      <h3>🎯 Objetivo</h3>
      <p>
        En el tablero todas las fichas comparten algo… menos una. Encuentra la ficha que
        <strong> no encaja</strong> y tócala.
      </p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Lee la <strong>categoría</strong> (si la hay) y repasa las fichas.</li>
        <li>Toca la que no pertenece al grupo: si aciertas, sumas y la racha crece.</li>
        <li>Si fallas, verás cuál era el intruso antes de pasar al siguiente tablero.</li>
      </ul>
      <h3>🎓 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Práctica</strong>Tableros sin fin y sin reloj.</div>
        <div className="instr-mode exam"><strong>Examen</strong>10 rondas cronometradas. Nota sobre 10 y puntos por rapidez y racha.</div>
      </div>
    </InstructionsModal>
  );

  const materialDeEstudio = modoLogico === 'conceptual' && (
    <InstructionsModal isOpen={showStudy} onClose={() => setShowStudy(false)} title="Material de estudio">
      <div className="bi-study">
        {datosJuego?.map((cat, idx) => (
          <section key={idx} className="bi-study__card">
            <h4 className="bi-study__title" title={cat.categoria}>{cat.categoria}</h4>
            <div className="bi-study__group is-ok">
              <span className="bi-study__label">Pertenecen</span>
              <ul>{cat.correctos.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div className="bi-study__group is-ko">
              <span className="bi-study__label">Intrusos</span>
              <ul>{cat.intrusos.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </section>
        ))}
      </div>
    </InstructionsModal>
  );

  if (!datosJuego) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Preparando el tablero…" />
      </GameShell>
    );
  }
  if (datosJuego.length === 0) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Aún no hay tableros">No hay datos de Busca el Intruso para esta asignatura todavía.</GameEmpty>
        {instrucciones}
      </GameShell>
    );
  }

  const onStudy = modoLogico === 'conceptual' ? () => setShowStudy(true) : undefined;

  // --- Pantalla previa: elegir modo ---
  if (!enJuego) {
    const modes = [
      {
        id: 'libre', tone: 'easy', title: 'Práctica',
        desc: 'Tableros sin fin para entrenar el ojo, sin reloj ni presión.',
        features: ['Sin tiempo', 'Racha de aciertos', modoLogico === 'conceptual' ? 'Material de estudio' : '32 fichas por tablero'],
      },
      {
        id: 'test', tone: 'exam', title: 'Examen',
        desc: `${estado.rondasTotales} rondas cronometradas. Cada tablero, una oportunidad.`,
        features: ['Nota sobre 10', 'Puntos por rapidez y racha', `${estado.rondasTotales} rondas`],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect modes={modes} onSelect={elegirModo} onHelp={() => setShowHelp(true)} onStudy={onStudy} />
        {instrucciones}
        {materialDeEstudio}
      </GameShell>
    );
  }

  const esExamen = estado.modo === 'test';

  // --- Resumen del examen ---
  if (mostrarResumen && resultadoExamen) {
    // Mismos números que se envían en onGameComplete (calculados en finalizarTest).
    const { nota, points: totalPoints, aciertos, rondasTotales, combo } = resultadoExamen;
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title="¡Examen completado!"
          nota={nota}
          points={totalPoints}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${aciertos}/${rondasTotales}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${tiempoTranscurrido.toFixed(1)}s` },
            { icon: Flame, tone: 'streak', label: 'Racha final', value: combo },
          ]}
          actions={[
            { label: 'Repetir examen', onClick: iniciarTest, icon: RefreshCw },
            { label: 'Practicar', onClick: activarModoLibre, icon: Eye, variant: 'soft' },
            { label: 'Cambiar de modo', onClick: volverAModos, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {registroExamen.map((r, i) => (
            <FeedbackItem key={i} index={i + 1} ok={r.ok} title={r.ok ? `Intruso: ${r.intruso}` : `Elegiste: ${r.elegido}`}>
              {!r.ok && <>El intruso era <strong>{r.intruso}</strong>. </>}
              {r.categoria && <>Categoría: {r.categoria}</>}
            </FeedbackItem>
          ))}
        </ResultsScreen>
        {instrucciones}
        {materialDeEstudio}
      </GameShell>
    );
  }

  const feedback = estado.feedbackCellStatus;
  const esVisual = modoLogico === 'visual';

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={esExamen ? 'exam' : 'easy'}
        modeLabel={esExamen ? 'Examen' : 'Práctica'}
        onHelp={() => setShowHelp(true)}
        onStudy={onStudy}
        right={(
          <Hud>
            <HudStat icon={Trophy} tone="good" value={estado.aciertos} label="Aciertos" />
            {estado.combo > 1 && <HudStat icon={Flame} tone="streak" value={`x${estado.combo}`} label="Racha" />}
            {esExamen && <HudStat icon={Clock} tone="time" value={`${tiempoTranscurrido.toFixed(0)}s`} label="Tiempo" />}
          </Hud>
        )}
      />

      {esExamen && (
        <ProgressDots
          total={estado.rondasTotales}
          current={Math.max(0, estado.ronda - 1)}
          results={registroExamen.map((r) => r.ok)}
        />
      )}

      <Panel variant="screen" className={`bi-brief ${feedback ? `is-${feedback}` : ''}`}>
        <span className="bi-brief__scope" aria-hidden="true"><Crosshair size={26} /></span>
        <div className="bi-brief__text">
          {estado.categoria ? (
            <span className="bi-brief__cat"><BookOpen size={14} /> {estado.categoria}</span>
          ) : (
            <span className="bi-brief__cat"><Search size={14} /> {esVisual ? 'Mira con atención' : 'Busca el intruso'}</span>
          )}
          <motion.strong
            key={estado.mensaje + feedback}
            className="bi-brief__msg"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          >
            {estado.mensaje}
          </motion.strong>
        </div>
        {estado.combo > 1 && (
          <motion.span
            key={estado.combo}
            className="bi-combo"
            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 460, damping: 16 }}
          >
            <Flame size={15} /> x{estado.combo} combo
          </motion.span>
        )}
      </Panel>

      <div className={`bi-board ${esVisual ? 'is-visual' : 'is-concept'} ${feedback ? 'is-locked' : ''}`}>
        {estado.tablero.length === 0 ? (
          <GameLoading label="Barajando fichas…" />
        ) : (
          <div
            className="bi-grid"
            style={{ gridTemplateColumns: `repeat(${estado.cols}, minmax(0, 1fr))` }}
            role="group"
            aria-label="Tablero"
          >
            {estado.tablero.map((item, idx) => {
              const esTexto = contieneLetras(item);
              const isFeedbackTarget = idx === estado.feedbackCellIndex;
              const status = isFeedbackTarget ? feedback : '';
              // Solo presentación: tras un fallo se señala dónde estaba el intruso
              const reveal = feedback === 'ko' && idx === estado.indiceIntruso;
              return (
                <button
                  type="button"
                  key={`${estado.ronda}-${idx}-${item}`}
                  className={[
                    'bi-tile',
                    esTexto ? 'is-text' : 'is-icon',
                    status && `is-${status}`,
                    reveal && 'is-reveal',
                    feedback && !status && !reveal && 'is-dim',
                    restarting && 'is-shaking',
                  ].filter(Boolean).join(' ')}
                  style={{ animationDelay: `${Math.min(idx * 0.025, 0.6)}s` }}
                  onClick={() => gestionarClick(idx)}
                  aria-label={String(item)}
                >
                  <span className="bi-tile__face">
                    <span className="bi-tile__content">{item}</span>
                  </span>
                  <span className="bi-tile__reticle" aria-hidden="true" />
                  {status === 'ok' && (
                    <span className="bi-stamp is-ok" aria-hidden="true"><StarStamp /></span>
                  )}
                  {status === 'ko' && <span className="bi-stamp is-ko" aria-hidden="true">✕</span>}
                  {reveal && <span className="bi-tile__tag" aria-hidden="true"><Sparkles size={12} /> Era este</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bi-footer">
        {!esExamen ? (
          <>
            <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={volverAModos}>Cambiar modo</GameButton>
            <GameButton variant="ghost" size="sm" icon={RefreshCw} onClick={activarModoLibre}>Empezar de cero</GameButton>
            <span className="bi-footer__info"><Target size={14} /> Fallos: {estado.errores}</span>
          </>
        ) : (
          <span className="bi-footer__info">
            <GraduationCap size={14} /> Modo examen · ronda {Math.max(1, estado.ronda)} de {estado.rondasTotales}
          </span>
        )}
      </div>

      {instrucciones}
      {materialDeEstudio}
    </GameShell>
  );
};

// Sello de acierto: estrella rosa con brillo (el "intruso" del icono de la app).
const StarStamp = () => (
  <svg viewBox="0 0 48 48" width="46" height="46">
    <defs>
      <linearGradient id="bi-star-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbcfe8" />
        <stop offset=".5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#9d174d" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" fill="#fff" opacity=".9" />
    <path d="M24 7l4.9 10.2 11.1 1.5-8.1 7.7 2 11-9.9-5.4-9.9 5.4 2-11-8.1-7.7 11.1-1.5z" fill="url(#bi-star-g)" />
    <path d="M18.5 19.5c1.4-3 3.2-5.3 5.5-6.6" stroke="#fff" strokeOpacity=".75" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

BuscaElIntruso.propTypes = {
  tema: PropTypes.string
};

export default BuscaElIntruso;
