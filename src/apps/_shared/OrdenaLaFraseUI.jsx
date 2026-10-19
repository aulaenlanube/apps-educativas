// src/apps/_shared/OrdenaLaFraseUI.jsx
// Ordena la Frase — rediseño 2026 sobre el kit de interfaz (_shared/kit).
// Toda la lógica (frases, arrastre, puntuación) vive en useOrdenaLaFraseGame;
// aquí solo hay presentación. OJO, el hook depende de estas clases del DOM:
//   .palabra (+ data-id)  → fichas; getDropTarget las busca dentro de cada zona
//   .dragging             → ficha que se está arrastrando
//   .palabra-clone        → clon táctil que se cuelga de <body> (fuera del kit)
//   .btn-remove-word      → botón de quitar (se oculta en el clon)
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Check, X, Shuffle, Lightbulb, EyeOff, LayoutGrid, ArrowRight, ArrowUp, Flag, Clock,
  Target, Puzzle, Trophy, RefreshCw, AlignLeft, Type, GraduationCap, Layers,
} from 'lucide-react';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, Chip, GameButton, Segmented,
  ModeSelect, RoundBanner, ResultsScreen, FeedbackItem,
} from './kit';
import './OrdenaLaFraseShared.css';

const SHELL = { accent: '#f43f5e', accent2: '#8b5cf6' };

const FONT_OPTIONS = [
  { value: 0, label: 'Imprenta' },
  { value: 1, label: 'Ligada' },
  { value: 2, label: 'Mayúsculas' },
];

// Inclinación estable de cada ficha suelta (de su id, que no delata el orden).
const tiltFor = (id = '') => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 7) - 3) * 1.2;
};

const OrdenaLaFraseUI = ({ game, onGameComplete, total = 0, bloque = null, filters = null }) => {
  // null = pantalla previa de modos (CLAUDE.md §3); 'practice' = práctica libre.
  // El examen lo marca el propio hook (game.isTestMode).
  const [view, setView] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Detectar si es dispositivo táctil para adaptar el mensaje
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Tracking examen
  const trackedRef = useRef(false);
  useEffect(() => {
    if (game.isTestMode && game.showResults && !trackedRef.current) {
      trackedRef.current = true;
      const correct = game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length;
      onGameComplete?.({
        mode: 'test',
        score: game.score,
        maxScore: game.TOTAL_TEST_QUESTIONS * 100 + 300,
        correctAnswers: correct,
        totalQuestions: game.TOTAL_TEST_QUESTIONS,
        durationSeconds: game.elapsedTime || undefined,
      });
    }
    if (!game.showResults) trackedRef.current = false;
  }, [game.isTestMode, game.showResults, game.score, game.testQuestions, game.userAnswers, game.TOTAL_TEST_QUESTIONS, game.elapsedTime, onGameComplete]);

  // Tracking práctica: solo registrar tiempo de juego, sin puntuación
  const practiceTrackedRef = useRef(false);
  useEffect(() => {
    if (!game.isTestMode && game.feedback?.clase === 'correcta' && !practiceTrackedRef.current) {
      practiceTrackedRef.current = true;
      onGameComplete?.({
        mode: 'practice',
        score: 0,
        maxScore: 0,
        correctAnswers: 1,
        totalQuestions: 1,
        durationSeconds: 0,
      });
      // Reset para la siguiente frase
      setTimeout(() => { practiceTrackedRef.current = false; }, 500);
    }
  }, [game.isTestMode, game.feedback, onGameComplete]);

  // --- Solo presentación ---

  // Frases resueltas en esta sesión de práctica (marcador)
  const [solvedCount, setSolvedCount] = useState(0);
  const lastSolvedRef = useRef('');
  useEffect(() => {
    if (game.isTestMode || game.feedback?.clase !== 'correcta') return;
    if (lastSolvedRef.current === game.mision.solucion) return;
    lastSolvedRef.current = game.mision.solucion;
    setSolvedCount((n) => n + 1);
  }, [game.isTestMode, game.feedback, game.mision.solucion]);

  // Sacudida de la barra al fallar
  const railControls = useAnimationControls();
  useEffect(() => {
    if (game.feedback?.clase === 'incorrecta') {
      railControls.start({ x: [0, -10, 10, -6, 6, -2, 0], transition: { duration: 0.45 } });
    }
  }, [game.feedback, railControls]);

  // Nota del examen (misma fórmula que el resumen original)
  const examCorrect = useMemo(
    () => game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length,
    [game.testQuestions, game.userAnswers],
  );
  const examNota = Math.round((examCorrect / game.TOTAL_TEST_QUESTIONS) * 100) / 10;

  // Confeti al ver un buen resultado de examen
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (!(game.isTestMode && game.showResults)) { celebratedRef.current = false; return; }
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    if (examNota >= 8) {
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 }, colors: ['#f43f5e', '#8b5cf6', '#fbbf24', '#10b981'] });
    }
  }, [game.isTestMode, game.showResults, examNota]);

  const setFont = (v) => game.handleFontStyleChange({ target: { value: String(v) } });
  const fontPicker = (
    <div className="ofr-fontpick">
      <span className="ofr-fontpick__label"><Type size={15} /> Letra</span>
      <Segmented size="sm" options={FONT_OPTIONS} value={game.fontStyleIndex} onChange={setFont} />
    </div>
  );

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Ordena la Frase">
      <h3>🎯 Objetivo</h3>
      <p>Coloca las palabras en el orden correcto para construir una <strong>frase con sentido</strong>.</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>{isTouch ? 'Toca' : 'Haz clic en'} una palabra de la bandeja para subirla a la barra <strong>Tu frase</strong>.</li>
        <li>También puedes <strong>arrastrarla</strong> y soltarla encima de otra palabra para meterla en ese hueco.</li>
        <li>Para devolver una palabra, pulsa su <strong>✕</strong> o arrástrala de nuevo a la bandeja.</li>
        <li>Cambia el <strong>tipo de letra</strong> (imprenta, ligada o mayúsculas) cuando quieras.</li>
      </ul>
      <h3>🎓 Modos de juego</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>Práctica libre</strong>
          Frases sin fin. Comprueba cuando quieras y mira la solución si te atascas.
        </div>
        <div className="instr-mode exam">
          <strong>Examen</strong>
          {game.TOTAL_TEST_QUESTIONS} frases seguidas, sin comprobar. Nota sobre 10 y puntos extra por rapidez.
        </div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejo:</strong> busca primero la palabra que empieza con mayúscula y la que termina con punto.
      </div>
    </InstructionsModal>
  );

  // Ficha de palabra. La inclinación y el canto son solo visuales.
  const renderPalabras = (palabras, isDestino) => (
    palabras.map((p, i) => (
      <div
        key={p.id}
        data-id={p.id}
        className={`palabra ofr-chip ofr-font-${game.fontStyle} ${isDestino ? 'is-placed' : 'is-loose'}`}
        style={{ '--tilt': `${isDestino ? 0 : tiltFor(p.id)}deg`, '--i': i }}
        draggable
        onDragStart={(e) => game.handleDragStart(e, p)}
        onDragEnd={game.handleDragEnd}
        onTouchStart={(e) => game.handleTouchStart(e, p)}
        onTouchCancel={game.handleTouchCancel}
        onClick={!isDestino ? () => game.handleOriginWordClick(p) : undefined}
      >
        <span className="ofr-chip__face">
          {isDestino && <span className="ofr-chip__num" aria-hidden="true">{i + 1}</span>}
          <span className="ofr-chip__text">{p.texto}</span>
        </span>
        {isDestino && (
          <button
            type="button"
            className="btn-remove-word ofr-chip__remove"
            onClick={(e) => {
              e.stopPropagation();
              game.handleRemoveWord(p);
            }}
            aria-label="Quitar palabra"
            // Que el toque en la ✕ no arranque un arrastre de la ficha: si no,
            // el clon táctil se quedaba colgado en <body> (el touchend de abajo
            // no deja que llegue la limpieza) y la página sin scroll.
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <X size={12} strokeWidth={3.2} />
          </button>
        )}
      </div>
    ))
  );

  // Barra "Tu frase" (zona destino con huecos numerados) + bandeja (zona origen)
  const renderBoard = ({ isExam }) => {
    const placed = game.palabrasDestino.length;
    const loose = game.palabrasOrigen.length;
    const fb = game.feedback || {};
    const solved = !isExam && fb.clase === 'correcta';
    const wrong = !isExam && fb.clase === 'incorrecta';
    return (
      <div className="ofr-board">
        <motion.div animate={railControls} className="ofr-rail-wrap">
          <div
            className={`ofr-rail gk-panel gk-panel--screen${solved ? ' is-solved' : ''}`}
            ref={game.dropZoneRef}
            onDragOver={game.handleDragOver}
            onDrop={(e) => game.handleDrop(e, 'destino')}
          >
            {(solved || wrong) && <span key={fb.id} className={`ofr-rail__flash ${solved ? 'is-good' : 'is-bad'}`} aria-hidden="true" />}
            <span className="ofr-zone-tab ofr-zone-tab--rail"><AlignLeft size={14} /> Tu frase</span>
            <div className="ofr-rail__line">
              {renderPalabras(game.palabrasDestino, true)}
              {Array.from({ length: loose }).map((_, i) => (
                <span key={`slot-${i}`} className="ofr-slot" aria-hidden="true">{placed + i + 1}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {!isExam && (
          <div className="ofr-feedback-slot">
            {fb.clase === 'incorrecta' && (
              <div key={fb.id} className="ofr-feedback is-bad gk-anim-shake" role="status">
                <span className="ofr-feedback__icon"><X size={16} strokeWidth={3} /></span>
                {fb.texto}
              </div>
            )}
            {fb.clase === 'feedback-inicial' && (
              <div className="ofr-feedback is-hint">
                <span className="ofr-feedback__arrow"><ArrowUp size={16} strokeWidth={3} /></span>
                {isTouch ? 'Toca una palabra para subirla o arrástrala a su hueco' : 'Haz clic en una palabra para subirla o arrástrala a su hueco'}
              </div>
            )}
            <RoundBanner
              show={solved}
              status="won"
              title={fb.texto || '¡Correcto!'}
              subtitle="La frase está perfectamente ordenada."
              action={game.startPracticeMission}
              actionLabel="Otra frase"
              actionIcon={Shuffle}
            />
          </div>
        )}

        <div
          className="ofr-tray gk-panel gk-panel--inset"
          ref={game.originZoneRef}
          onDragOver={game.handleDragOver}
          onDrop={(e) => game.handleDrop(e, 'origen')}
        >
          <span className="ofr-zone-tab ofr-zone-tab--tray"><Layers size={14} /> Palabras</span>
          <div className="ofr-tray__pile">
            {renderPalabras(game.palabrasOrigen, false)}
            {loose === 0 && (
              <span className="ofr-tray__empty">
                <Check size={16} strokeWidth={3} />
                {isExam ? 'Todas colocadas. Revisa el orden y continúa.' : 'Todas colocadas. ¡Pulsa Comprobar!'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modo TEST: resultados
  if (game.isTestMode && game.showResults) {
    const correct = game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length;
    const nota = Math.round((correct / game.TOTAL_TEST_QUESTIONS) * 100) / 10;
    return (
      <GameShell {...SHELL}>
        <ResultsScreen
          nota={nota}
          points={game.score}
          stats={[
            { icon: Target, tone: 'good', label: 'Frases correctas', value: `${correct}/${game.TOTAL_TEST_QUESTIONS}` },
            ...(game.elapsedTime > 0 ? [{ icon: Clock, tone: 'time', label: 'Tiempo', value: `${game.elapsedTime}s` }] : []),
          ]}
          actions={[
            { label: 'Repetir examen', onClick: game.startTest, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => { game.exitTestMode(); setView(null); }, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {game.testQuestions.map((q, i) => {
            const ok = q.solucion === game.userAnswers[i];
            return (
              <FeedbackItem key={i} index={i + 1} ok={ok} title={q.solucion}>
                {ok ? 'Has ordenado la frase correctamente.' : <>Tu respuesta: <em>{game.userAnswers[i] || 'No contestada'}</em></>}
              </FeedbackItem>
            );
          })}
        </ResultsScreen>
      </GameShell>
    );
  }

  // Modo TEST: en curso
  if (game.isTestMode) {
    const isLast = game.currentQuestionIndex === game.TOTAL_TEST_QUESTIONS - 1;
    return (
      <GameShell {...SHELL}>
        <div className="ofr-screen" onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd} onTouchCancel={game.handleTouchCancel}>
          <GameHeader
            mode="exam"
            topic={bloque}
            onHelp={() => setShowHelp(true)}
            right={(
              <Hud>
                {game.elapsedTime > 0 && <HudStat icon={Clock} tone="time" value={`${game.elapsedTime}s`} label="Tiempo" />}
                <HudStat icon={GraduationCap} tone="progress" value={`${game.currentQuestionIndex + 1}/${game.TOTAL_TEST_QUESTIONS}`} label="Frase" />
              </Hud>
            )}
          />
          <ProgressDots total={game.TOTAL_TEST_QUESTIONS} current={game.currentQuestionIndex} />
          <div className="ofr-toolbar">
            <Chip tone="accent" icon={AlignLeft}>{game.mision.texto || 'Forma la frase:'}</Chip>
            {fontPicker}
          </div>

          <motion.div key={game.currentQuestionIndex} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {renderBoard({ isExam: true })}
          </motion.div>

          <div className="ofr-controls">
            <GameButton
              variant={isLast ? 'success' : 'primary'}
              size="lg"
              iconRight={isLast ? Flag : ArrowRight}
              onClick={game.handleNextQuestion}
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
            </GameButton>
          </div>
          <div className="ofr-footer">
            <span className="ofr-footer__info"><GraduationCap size={14} /> Modo examen · sin comprobar ni ver la solución</span>
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
        id: 'practice', tone: 'easy', icon: Puzzle, title: 'Práctica libre',
        desc: 'Ordena frases a tu ritmo: comprueba cuando quieras y consulta la solución si te atascas.',
        features: ['Comprobación al instante', total > 0 ? `${total} frases` : 'Solución disponible'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: `${game.TOTAL_TEST_QUESTIONS} frases seguidas, sin comprobar ni ver la solución.`,
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

  // Modo PRÁCTICA
  const placedCount = game.palabrasDestino.length;
  const totalWords = placedCount + game.palabrasOrigen.length;
  return (
    <GameShell {...SHELL}>
      <div className="ofr-screen" onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd} onTouchCancel={game.handleTouchCancel}>
        <GameHeader
          mode="easy"
          topic={bloque}
          modeLabel="Práctica"
          onHelp={() => setShowHelp(true)}
          right={(
            <Hud>
              <HudStat icon={Trophy} tone="good" value={solvedCount} label="Resueltas" />
              <HudStat icon={Puzzle} tone="progress" value={`${placedCount}/${totalWords}`} label="Colocadas" />
            </Hud>
          )}
        />
        <div className="ofr-toolbar">
          <Chip tone="accent" icon={AlignLeft}>{game.mision.texto || 'Forma la frase:'}</Chip>
          {fontPicker}
        </div>

        <motion.div key={game.mision.solucion} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {renderBoard({ isExam: false })}
        </motion.div>

        <div className="ofr-controls">
          <GameButton variant="success" size="lg" icon={Check} onClick={game.checkPracticeAnswer}>Comprobar</GameButton>
          <GameButton variant="soft" icon={Shuffle} onClick={game.startPracticeMission}>Otra frase</GameButton>
          <GameButton variant="soft" icon={game.showSolution ? EyeOff : Lightbulb} onClick={game.toggleSolution}>
            {game.showSolution ? 'Ocultar' : 'Solución'}
          </GameButton>
        </div>

        {game.showSolution && (
          <motion.div
            className={`ofr-solution ofr-font-${game.fontStyle}`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <Lightbulb size={18} />
            <span><strong>Solución:</strong> <span className="ofr-solution__text">{game.mision.solucion}</span></span>
          </motion.div>
        )}

        <div className="ofr-footer">
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setView(null)}>Cambiar modo</GameButton>
          {total > 0 && <span className="ofr-footer__info"><AlignLeft size={14} /> {total} frases disponibles</span>}
        </div>
      </div>
      {instructions}
    </GameShell>
  );
};

export default OrdenaLaFraseUI;
