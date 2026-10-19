// src/apps/_shared/OrdenaLaHistoriaUI.jsx
// Ordena la Historia — rediseño 2026 sobre el kit de interfaz (_shared/kit).
// Toda la lógica (historias, arrastre, flechas, puntuación) vive en
// useOrdenaLaHistoriaGame; aquí solo hay presentación. OJO, el hook depende de:
//   .frase (+ data-id)  → tarjetas; getDragAfterElement las busca en la zona
//   .dragging           → tarjeta que se arrastra
//   .frase-controls     → se quita del clon táctil
//   .frase-clone        → clon táctil colgado de <body> (fuera del kit)
// Las tarjetas se animan con FLIP (transform inline): ninguna animación CSS
// toca el transform de .frase; los efectos van en sus hijos.
import React, { useLayoutEffect, useRef, useEffect, useState, useMemo } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Check, X, Shuffle, Lightbulb, EyeOff, LayoutGrid, ArrowRight, Flag, Clock, Target,
  Trophy, RefreshCw, Type, GraduationCap, GripVertical, ChevronUp, ChevronDown,
  ChevronsUp, ChevronsDown, Sunrise, Moon, ListOrdered, BookOpen,
} from 'lucide-react';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, Chip, GameButton, Segmented,
  ModeSelect, RoundBanner, ResultsScreen, FeedbackItem,
} from './kit';
import './OrdenaLaHistoriaShared.css';

const SHELL = { accent: '#f97316', accent2: '#6366f1' };

const FONT_OPTIONS = [
  { value: 0, label: 'Imprenta' },
  { value: 1, label: 'Ligada' },
  { value: 2, label: 'Mayúsculas' },
];

// Color de cada hito de la línea temporal: del amanecer (inicio) a la noche (final).
// Depende SOLO de la posición, nunca de la tarjeta (no delata el orden correcto).
const DAY_STOPS = [[245, 158, 11], [249, 115, 22], [236, 72, 153], [139, 92, 246], [79, 70, 229]];
const nodeColor = (t) => {
  const x = Math.max(0, Math.min(1, t)) * (DAY_STOPS.length - 1);
  const i = Math.min(DAY_STOPS.length - 2, Math.floor(x));
  const k = x - i;
  const [a, b] = [DAY_STOPS[i], DAY_STOPS[i + 1]];
  const c = a.map((v, j) => Math.round(v + (b[j] - v) * k));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const OrdenaLaHistoriaUI = ({ game, onGameComplete, total = 0, bloque = null, filters = null }) => {
  // null = pantalla previa de modos (CLAUDE.md §3); 'practice' = práctica libre.
  // El examen lo marca el propio hook (game.isTestMode).
  const [view, setView] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Refs para animación FLIP
  const itemsRef = useRef(new Map());
  const prevPositions = useRef(new Map());

  useLayoutEffect(() => {
    itemsRef.current.forEach((element, id) => {
      if (!element) return;
      const newRect = element.getBoundingClientRect();
      const oldRect = prevPositions.current.get(id);
      if (oldRect) {
        const deltaY = oldRect.top - newRect.top;
        if (deltaY !== 0) {
          element.style.transform = `translateY(${deltaY}px)`;
          element.style.transition = 'none';
          requestAnimationFrame(() => {
            element.style.transform = '';
            element.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)';
          });
        }
      }
      prevPositions.current.set(id, newRect);
    });
  }, [game.frasesDesordenadas]);

  // Tracking
  const trackedRef = useRef(false);
  useEffect(() => {
    if (game.isTestMode && game.showResults && !trackedRef.current) {
      trackedRef.current = true;
      const correct = game.testQuestions.filter((story, i) => {
        const u = game.userAnswers[i].map(f => f.texto).join();
        const c = story.map(f => f.texto).join();
        return u === c;
      }).length;
      onGameComplete?.({
        mode: 'test',
        score: game.score,
        maxScore: game.TOTAL_TEST_STORIES * 100 + 300,
        correctAnswers: correct,
        totalQuestions: game.TOTAL_TEST_STORIES,
        durationSeconds: game.elapsedTime || undefined,
      });
    }
    if (!game.showResults) trackedRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isTestMode, game.showResults, game.score, onGameComplete]);

  // Tracking práctica: solo registrar tiempo de juego
  const practiceTrackedRef = useRef(false);
  useEffect(() => {
    if (!game.isTestMode && game.feedback?.clase === 'correcta' && !practiceTrackedRef.current) {
      practiceTrackedRef.current = true;
      onGameComplete?.({ mode: 'practice', score: 0, maxScore: 0, correctAnswers: 1, totalQuestions: 1, durationSeconds: 0 });
      setTimeout(() => { practiceTrackedRef.current = false; }, 500);
    }
  }, [game.isTestMode, game.feedback, onGameComplete]);

  // --- Solo presentación ---

  // Historias resueltas en esta sesión de práctica (marcador)
  const [solvedCount, setSolvedCount] = useState(0);
  const lastSolvedRef = useRef('');
  const storySig = game.historiaCorrecta.map((f) => f.texto).join('|');
  useEffect(() => {
    if (game.isTestMode || game.feedback?.clase !== 'correcta') return;
    if (lastSolvedRef.current === storySig) return;
    lastSolvedRef.current = storySig;
    setSolvedCount((n) => n + 1);
  }, [game.isTestMode, game.feedback, storySig]);

  // Sacudida de la línea temporal al fallar
  const listControls = useAnimationControls();
  useEffect(() => {
    if (game.feedback?.clase === 'incorrecta') {
      listControls.start({ x: [0, -10, 10, -6, 6, -2, 0], transition: { duration: 0.45 } });
    }
  }, [game.feedback, listControls]);

  // Aciertos del examen (misma comparación que el tracking)
  const storyOk = (story, i) => {
    const answer = game.userAnswers[i];
    if (!answer) return false;
    return answer.map((f) => f.texto).join() === story.map((f) => f.texto).join();
  };
  const examCorrect = useMemo(
    () => game.testQuestions.filter((story, i) => {
      const answer = game.userAnswers[i];
      return !!answer && answer.map((f) => f.texto).join() === story.map((f) => f.texto).join();
    }).length,
    [game.testQuestions, game.userAnswers],
  );
  const examNota = Math.round((examCorrect / game.TOTAL_TEST_STORIES) * 100) / 10;

  // Confeti al ver un buen resultado de examen
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (!(game.isTestMode && game.showResults)) { celebratedRef.current = false; return; }
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    if (examNota >= 8) {
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 }, colors: ['#f97316', '#6366f1', '#ec4899', '#fbbf24'] });
    }
  }, [game.isTestMode, game.showResults, examNota]);

  const setFont = (v) => game.handleFontStyleChange({ target: { value: String(v) } });
  const fontPicker = (
    <div className="ohi-fontpick">
      <span className="ohi-fontpick__label"><Type size={15} /> Letra</span>
      <Segmented size="sm" options={FONT_OPTIONS} value={game.fontStyleIndex} onChange={setFont} />
    </div>
  );

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Ordena la Historia">
      <h3>🎯 Objetivo</h3>
      <p>Coloca las frases en orden para que la <strong>historia tenga sentido</strong>: qué pasa primero, qué pasa después y cómo termina.</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li><strong>Arrastra</strong> cada tarjeta y suéltala en su lugar de la línea temporal.</li>
        <li>O usa las <strong>flechas</strong> de la tarjeta para subirla o bajarla un puesto.</li>
        <li>En la primera tarjeta, la doble flecha la manda al <strong>final</strong>; en la última, al <strong>principio</strong>.</li>
        <li>Cambia el <strong>tipo de letra</strong> (imprenta, ligada o mayúsculas) cuando quieras.</li>
      </ul>
      <h3>🎓 Modos de juego</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>Práctica libre</strong>
          Historias sin fin. Comprueba cuando quieras y mira la solución si te atascas.
        </div>
        <div className="instr-mode exam">
          <strong>Examen</strong>
          {game.TOTAL_TEST_STORIES} historias seguidas, sin comprobar. Nota sobre 10 y puntos extra por rapidez.
        </div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejo:</strong> fíjate en palabras como «primero», «después», «luego» o «al final».
      </div>
    </InstructionsModal>
  );

  const renderFrasesList = ({ isExam }) => {
    const n = game.frasesDesordenadas.length;
    const fb = game.feedback || {};
    const solved = !isExam && fb.clase === 'correcta';
    const wrong = !isExam && fb.clase === 'incorrecta';
    return (
      <motion.div animate={listControls} className="ohi-board">
        <div
          className={`ohi-timeline gk-panel gk-panel--inset${solved ? ' is-solved' : ''}`}
          ref={game.dropZoneRef}
          onDrop={game.handleDrop}
          onDragOver={game.handleDragOver}
        >
          {(solved || wrong) && <span key={fb.timestamp} className={`ohi-flash ${solved ? 'is-good' : 'is-bad'}`} aria-hidden="true" />}
          <span className="ohi-edge ohi-edge--start"><Sunrise size={14} /> Inicio</span>
          <div className="ohi-track" style={{ '--n': n }}>
            {/* hitos numerados (fijos: marcan el puesto, no la tarjeta) */}
            {game.frasesDesordenadas.map((_, index) => (
              <span
                key={`hito-${index}`}
                className="ohi-node"
                style={{ gridRow: index + 1, '--node': nodeColor(n > 1 ? index / (n - 1) : 0), '--i': index }}
                aria-hidden="true"
              >
                <span className="ohi-node__num">{index + 1}</span>
                <span className="ohi-node__ok"><Check size={16} strokeWidth={3.4} /></span>
              </span>
            ))}
            {game.frasesDesordenadas.map((frase, index) => {
              const isFirst = index === 0;
              const isLast = index === game.frasesDesordenadas.length - 1;

              return (
                <div
                  key={frase.id}
                  data-id={frase.id}
                  ref={(el) => {
                    if (el) itemsRef.current.set(frase.id, el);
                    else itemsRef.current.delete(frase.id);
                  }}
                  className={`frase ohi-card ohi-font-${game.fontStyle}`}
                  style={{ gridRow: index + 1, '--i': index }}
                  draggable
                  onDragStart={(e) => game.handleDragStart(e, frase)}
                  onDragEnd={game.handleDragEnd}
                  onTouchStart={(e) => game.handleTouchStart(e, frase)}
                >
                  <span className="ohi-card__grip" aria-hidden="true"><GripVertical size={18} /></span>
                  <span className="frase-texto ohi-card__text">{frase.texto}</span>

                  <div className="frase-controls ohi-card__controls">
                    {/* BOTÓN SUPERIOR */}
                    {isFirst ? (
                      // Si es la primera: Botón "Ir al final" (Doble Flecha Abajo)
                      <button
                        type="button"
                        className="btn-move btn-double-down ohi-move"
                        onClick={(e) => { e.stopPropagation(); game.moveFraseToExtreme(index, 'bottom'); }}
                        onTouchStart={(e) => e.stopPropagation()}
                        title="Mover al final"
                        aria-label="Mover al final"
                      >
                        <ChevronsDown size={17} strokeWidth={2.6} />
                      </button>
                    ) : (
                      // Si NO es la primera: Botón "Subir" (Flecha Arriba)
                      <button
                        type="button"
                        className="btn-move btn-up ohi-move"
                        onClick={(e) => { e.stopPropagation(); game.moveFrase(index, -1); }}
                        onTouchStart={(e) => e.stopPropagation()}
                        title="Subir"
                        aria-label="Subir"
                      >
                        <ChevronUp size={18} strokeWidth={2.8} />
                      </button>
                    )}

                    {/* BOTÓN INFERIOR */}
                    {isLast ? (
                      // Si es la última: Botón "Ir al inicio" (Doble Flecha Arriba)
                      <button
                        type="button"
                        className="btn-move btn-double-up ohi-move"
                        onClick={(e) => { e.stopPropagation(); game.moveFraseToExtreme(index, 'top'); }}
                        onTouchStart={(e) => e.stopPropagation()}
                        title="Mover al principio"
                        aria-label="Mover al principio"
                      >
                        <ChevronsUp size={17} strokeWidth={2.6} />
                      </button>
                    ) : (
                      // Si NO es la última: Botón "Bajar" (Flecha Abajo)
                      <button
                        type="button"
                        className="btn-move btn-down ohi-move"
                        onClick={(e) => { e.stopPropagation(); game.moveFrase(index, 1); }}
                        onTouchStart={(e) => e.stopPropagation()}
                        title="Bajar"
                        aria-label="Bajar"
                      >
                        <ChevronDown size={18} strokeWidth={2.8} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <span className="ohi-edge ohi-edge--end"><Moon size={14} /> Final</span>
        </div>
      </motion.div>
    );
  };

  if (game.isTestMode) {
    if (game.showResults) {
      const correct = game.testQuestions.filter((story, i) => {
        const u = game.userAnswers[i].map(f => f.texto).join();
        const c = story.map(f => f.texto).join();
        return u === c;
      }).length;

      const nota = Math.round((correct / game.TOTAL_TEST_STORIES) * 100) / 10;

      return (
        <GameShell {...SHELL}>
          <ResultsScreen
            nota={nota}
            points={game.score}
            stats={[
              { icon: Target, tone: 'good', label: 'Historias correctas', value: `${correct}/${game.TOTAL_TEST_STORIES}` },
              ...(game.elapsedTime > 0 ? [{ icon: Clock, tone: 'time', label: 'Tiempo', value: `${game.elapsedTime}s` }] : []),
            ]}
            actions={[
              { label: 'Repetir examen', onClick: game.startTest, icon: RefreshCw },
              { label: 'Cambiar de modo', onClick: () => { game.exitTestMode(); setView(null); }, icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {game.testQuestions.map((story, i) => {
              const ok = storyOk(story, i);
              return (
                <FeedbackItem key={i} index={i + 1} ok={ok} title={`Historia ${i + 1} · orden correcto`}>
                  <ol className="ohi-fb-list">
                    {story.map((frase) => <li key={frase.id}>{frase.texto}</li>)}
                  </ol>
                </FeedbackItem>
              );
            })}
          </ResultsScreen>
        </GameShell>
      );
    }

    const isLastStory = game.currentStoryIndex === game.TOTAL_TEST_STORIES - 1;
    return (
      <GameShell {...SHELL}>
        <div
          className="ohi-screen"
          onTouchMove={game.handleTouchMove}
          onTouchEnd={game.handleTouchEnd}
          onTouchCancel={game.handleTouchCancel}
        >
          <GameHeader
            mode="exam"
            topic={bloque}
            onHelp={() => setShowHelp(true)}
            right={(
              <Hud>
                {game.elapsedTime > 0 && <HudStat icon={Clock} tone="time" value={`${game.elapsedTime}s`} label="Tiempo" />}
                <HudStat icon={GraduationCap} tone="progress" value={`${game.currentStoryIndex + 1}/${game.TOTAL_TEST_STORIES}`} label="Historia" />
              </Hud>
            )}
          />
          <ProgressDots total={game.TOTAL_TEST_STORIES} current={game.currentStoryIndex} />
          <div className="ohi-toolbar">
            <Chip tone="accent" icon={ListOrdered}>Ordena los hechos</Chip>
            {fontPicker}
          </div>

          {/* Solo opacidad: un desplazamiento falsearía las medidas del FLIP */}
          <motion.div key={game.currentStoryIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {renderFrasesList({ isExam: true })}
          </motion.div>

          <div className="ohi-controls">
            <GameButton
              variant={isLastStory ? 'success' : 'primary'}
              size="lg"
              iconRight={isLastStory ? Flag : ArrowRight}
              onClick={game.handleNextStory}
            >
              {isLastStory ? 'Finalizar' : 'Siguiente'}
            </GameButton>
          </div>
          <div className="ohi-footer">
            <span className="ohi-footer__info"><GraduationCap size={14} /> Modo examen · sin comprobar ni ver la solución</span>
          </div>
        </div>
        {instructions}
      </GameShell>
    );
  }

  // Pantalla previa: elegir modo
  if (!view) {
    const modes = [
      {
        id: 'practice', tone: 'easy', icon: BookOpen, title: 'Práctica libre',
        desc: 'Ordena historias a tu ritmo: comprueba cuando quieras y consulta la solución si te atascas.',
        features: ['Arrastra o usa las flechas', total > 0 ? `${total} historias` : 'Solución disponible'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: `${game.TOTAL_TEST_STORIES} historias seguidas, sin comprobar ni ver la solución.`,
        features: ['Nota sobre 10', 'Puntos extra por rapidez'],
      },
    ];
    const onSelect = (id) => {
      if (id === 'exam') { game.startTest(); return; }
      setView('practice');
    };
    return (
      <GameShell {...SHELL}>
        <ModeSelect modes={modes} onSelect={onSelect} onHelp={() => setShowHelp(true)} filters={filters} extra={fontPicker} />
        {instructions}
      </GameShell>
    );
  }

  // Modo práctica
  const fb = game.feedback || {};
  return (
    <GameShell {...SHELL}>
      <div
        className="ohi-screen"
        onTouchMove={game.handleTouchMove}
        onTouchEnd={game.handleTouchEnd}
        onTouchCancel={game.handleTouchCancel}
      >
        <GameHeader
          mode="easy"
          topic={bloque}
          modeLabel="Práctica"
          onHelp={() => setShowHelp(true)}
          right={(
            <Hud>
              <HudStat icon={Trophy} tone="good" value={solvedCount} label="Resueltas" />
              <HudStat icon={ListOrdered} tone="progress" value={game.frasesDesordenadas.length} label="Frases" />
            </Hud>
          )}
        />
        <div className="ohi-toolbar">
          <Chip tone="accent" icon={ListOrdered}>Ordena los hechos</Chip>
          {fontPicker}
        </div>

        {/* Solo opacidad: un desplazamiento falsearía las medidas del FLIP */}
        <motion.div key={storySig} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {renderFrasesList({ isExam: false })}
        </motion.div>

        <div className="ohi-feedback-slot">
          {fb.clase === 'incorrecta' && (
            <div key={fb.timestamp} className="ohi-feedback is-bad gk-anim-shake" role="status">
              <span className="ohi-feedback__icon"><X size={16} strokeWidth={3} /></span>
              {fb.texto}
            </div>
          )}
          {!fb.clase && (
            <div className="ohi-feedback is-hint">
              <GripVertical size={16} /> Arrastra las tarjetas o usa las flechas para ordenarlas
            </div>
          )}
          <RoundBanner
            show={fb.clase === 'correcta'}
            status="won"
            title={fb.texto || '¡Correcto!'}
            subtitle="Cada hecho está en su sitio."
            action={game.cargarSiguienteHistoria}
            actionLabel="Otra historia"
            actionIcon={Shuffle}
          />
        </div>

        <div className="ohi-controls">
          <GameButton variant="success" size="lg" icon={Check} onClick={game.checkStory}>Comprobar</GameButton>
          <GameButton variant="soft" icon={Shuffle} onClick={game.cargarSiguienteHistoria}>Otra historia</GameButton>
          <GameButton variant="soft" icon={game.showSolution ? EyeOff : Lightbulb} onClick={game.toggleSolution}>
            {game.showSolution ? 'Ocultar' : 'Solución'}
          </GameButton>
        </div>

        {game.showSolution && (
          <motion.div
            className={`ohi-solution ohi-font-${game.fontStyle}`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <p className="ohi-solution__title"><Lightbulb size={18} /> Orden correcto</p>
            <ol>
              {game.historiaCorrecta.map(frase => (
                <li key={frase.id}>{frase.texto}</li>
              ))}
            </ol>
          </motion.div>
        )}

        <div className="ohi-footer">
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setView(null)}>Cambiar modo</GameButton>
          {total > 0 && <span className="ohi-footer__info"><BookOpen size={14} /> {total} historias disponibles</span>}
        </div>
      </div>
      {instructions}
    </GameShell>
  );
};

export default OrdenaLaHistoriaUI;
