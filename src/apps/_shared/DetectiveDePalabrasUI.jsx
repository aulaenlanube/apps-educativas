// src/apps/_shared/DetectiveDePalabrasUI.jsx
// Detective de Palabras — rediseño 2026 sobre el kit de interfaz (_shared/kit).
// Toda la lógica (letras, separadores, puntuación) vive en useDetectiveDePalabras;
// aquí solo hay presentación: el texto pegado sobre un expediente, letras con
// efecto lupa al pasar y "cortes" de lápiz entre letras.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Search, Shuffle, LayoutGrid, ArrowRight, Flag, Clock, Target, Trophy, RefreshCw, Type,
  GraduationCap, X, FileSearch, MousePointerClick, Scissors,
} from 'lucide-react';
import { DETECTIVE_MAX_SCORE } from '../../hooks/useDetectiveDePalabras';
import useArtIds from '@/components/art/useArtIds';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, GameButton, Segmented,
  ModeSelect, RoundBanner, ResultsScreen, FeedbackItem,
} from './kit';
import './DetectiveDePalabrasShared.css';

const TOTAL_TEST_QUESTIONS = 5;

const SHELL = { accent: '#2563eb', accent2: '#7c3aed' };

const FONT_OPTIONS = [
  { value: 0, label: 'Imprenta' },
  { value: 1, label: 'Ligada' },
  { value: 2, label: 'Mayúsculas' },
];

// Lupa decorativa del expediente (sin filtros: luz con degradados).
const MagnifierArt = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="dtv-art" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id={id('glass')} cx="0.38" cy="0.34" r="0.7">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#dbeafe" stopOpacity="0.55" />
          <stop offset="1" stopColor="#60a5fa" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={id('handle')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c2d12" />
          <stop offset="0.45" stopColor="#c2410c" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={id('shadow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1e3a5f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1e3a5f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="62" cy="108" rx="44" ry="7" fill={url('shadow')} />
      {/* mango */}
      <g transform="rotate(45 78 78)">
        <rect x="70" y="80" width="16" height="40" rx="7" fill={url('handle')} />
        <rect x="73" y="84" width="3.5" height="32" rx="1.75" fill="#fff" opacity=".28" />
        <rect x="68" y="76" width="20" height="9" rx="3" fill={url('rim')} />
      </g>
      {/* lente */}
      <circle cx="50" cy="50" r="36" fill={url('rim')} />
      <circle cx="50" cy="50" r="29" fill={url('glass')} />
      <circle cx="50" cy="50" r="29" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M30 40 A22 22 0 0 1 46 25" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".85" />
      <circle cx="62" cy="64" r="3" fill="#fff" opacity=".7" />
      {/* letras aumentadas dentro de la lente */}
      <text x="50" y="59" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="24" fill="#1e3a8a" opacity=".8">a|b</text>
    </svg>
  );
};

const DetectiveDePalabrasUI = ({ game, onGameComplete }) => {
  // null = pantalla previa de modos (CLAUDE.md §3); 'practice' = práctica libre.
  // El examen lo marca el propio hook (game.isTestMode).
  const [view, setView] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Aux: solución transformada si el hook expone transformador
  const transformed = (s) =>
    typeof game.getTransformedSolution === 'function' ? game.getTransformedSolution(s) : s;

  // Tracking
  const trackedRef = useRef(false);
  useEffect(() => {
    if (game.isTestMode && game.showResults && !trackedRef.current) {
      trackedRef.current = true;
      const correct = game.testQuestions.filter((q, i) => transformed(q.solucion) === game.userAnswers[i]).length;
      onGameComplete?.({
        mode: 'test',
        score: game.score,
        maxScore: DETECTIVE_MAX_SCORE,
        correctAnswers: correct,
        totalQuestions: TOTAL_TEST_QUESTIONS,
        durationSeconds: game.elapsedTime || undefined,
      });
    }
    if (!game.showResults) trackedRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isTestMode, game.showResults, game.score, onGameComplete]);

  // Tracking práctica
  const practiceTrackedRef = useRef(false);
  useEffect(() => {
    if (!game.isTestMode && game.feedback?.clase === 'correcto' && !practiceTrackedRef.current) {
      practiceTrackedRef.current = true;
      onGameComplete?.({ mode: 'practice', score: 0, maxScore: 0, correctAnswers: 1, totalQuestions: 1, durationSeconds: 0 });
      setTimeout(() => { practiceTrackedRef.current = false; }, 500);
    }
  }, [game.isTestMode, game.feedback, onGameComplete]);

  // --- Solo presentación ---

  // Sacudida del expediente al fallar
  const caseControls = useAnimationControls();
  const isWrong = (game.feedback?.clase || '').includes('incorrecto');
  useEffect(() => {
    if (isWrong) caseControls.start({ x: [0, -10, 10, -6, 6, -2, 0], transition: { duration: 0.45 } });
  }, [game.feedbackKey, isWrong, caseControls]);

  // Nota del examen (misma fórmula que el resumen original)
  const examCorrect = useMemo(
    () => game.testQuestions.filter((q, i) => transformed(q.solucion) === game.userAnswers[i]).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.testQuestions, game.userAnswers, game.fontStyle],
  );
  const examNota = Math.round((examCorrect / TOTAL_TEST_QUESTIONS) * 100) / 10;

  // Confeti al ver un buen resultado de examen
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (!(game.isTestMode && game.showResults)) { celebratedRef.current = false; return; }
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    if (examNota >= 8) {
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 }, colors: ['#2563eb', '#f59e0b', '#fbbf24', '#10b981'] });
    }
  }, [game.isTestMode, game.showResults, examNota]);

  // El tipo de letra se elige en la pantalla previa y en práctica. En examen no
  // se ofrece: «Mayúsculas» transforma la solución y cambiarlo a mitad
  // descuadraría las respuestas ya dadas.
  const setFont = (v) => game.handleFontStyleChange({ target: { value: String(v) } });
  const fontPicker = (
    <div className="dtv-fontpick">
      <span className="dtv-fontpick__label"><Type size={15} /> Letra</span>
      <Segmented size="sm" options={FONT_OPTIONS} value={game.fontStyleIndex} onChange={setFont} />
    </div>
  );

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Detective de Palabras">
      <h3>🎯 Objetivo</h3>
      <p>Alguien ha borrado los espacios de la frase. Tu misión: <strong>separar las palabras</strong> para que vuelva a leerse bien.</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Pulsa la <strong>última letra</strong> de una palabra: aparecerá un corte justo detrás.</li>
        <li>Si te equivocas, pulsa otra vez la letra (o el corte) para quitarlo.</li>
        <li>Pulsa <strong>Comprobar</strong>: los cortes bien puestos se ponen en verde y los que sobran, en rojo.</li>
      </ul>
      <h3>🎓 Modos de juego</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>Práctica libre</strong>
          Casos sin fin con corrección de cada corte.
        </div>
        <div className="instr-mode exam">
          <strong>Examen</strong>
          {TOTAL_TEST_QUESTIONS} frases sin comprobar. Nota sobre 10 y puntos extra por rapidez.
        </div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejo:</strong> lee la frase en voz baja; las palabras cortas (el, la, de, en…) suelen esconderse entre las largas.
      </div>
    </InstructionsModal>
  );

  // Expediente con la frase sin espacios
  const renderCase = ({ isExam }) => {
    const n = game.letras.length;
    const solved = !isExam && game.fraseResuelta;
    return (
      <motion.div animate={caseControls} className="dtv-board">
        <div
          className={`dtv-case${solved ? ' is-solved' : ''}${isExam ? ' is-exam' : ''}`}
          ref={isExam ? undefined : game.containerRef}
        >
          <span className="dtv-case__tab"><FileSearch size={14} /> Expediente</span>
          <span className="dtv-case__stamp" aria-hidden="true">
            Caso nº {(game.indiceFraseActual || 0) + 1}
          </span>
          <span className="dtv-case__art"><MagnifierArt /></span>

          <div className={`dtv-text dtv-font-${game.fontStyle}`}>
            {game.letras.map((letra, index) => {
              const showCut = letra.separador && index < n - 1;
              const status = !isExam && showCut ? letra.status : '';
              return (
                <span
                  key={index}
                  className={`dtv-unit${showCut ? ' has-cut' : ''}${index === n - 1 ? ' is-last' : ''}`}
                  style={{ '--i': index }}
                >
                  <span className="dtv-letter" onClick={() => game.toggleSeparador(index)}>
                    {letra.char}
                  </span>
                  {showCut && (
                    <span
                      className={`dtv-cut ${status ? `is-${status}` : ''}`}
                      onClick={() => game.toggleSeparador(index)}
                      role="presentation"
                    />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  if (game.isTestMode) {
    // Resultados del test
    if (game.showResults) {
      const correct = game.testQuestions.filter((q, i) => transformed(q.solucion) === game.userAnswers[i]).length;

      const nota = Math.round((correct / TOTAL_TEST_QUESTIONS) * 100) / 10;

      return (
        <GameShell {...SHELL}>
          <ResultsScreen
            title="Casos cerrados"
            nota={nota}
            points={game.score}
            stats={[
              { icon: Target, tone: 'good', label: 'Frases correctas', value: `${correct}/${TOTAL_TEST_QUESTIONS}` },
              ...(game.elapsedTime > 0 ? [{ icon: Clock, tone: 'time', label: 'Tiempo', value: `${game.elapsedTime}s` }] : []),
            ]}
            actions={[
              { label: 'Repetir examen', onClick: game.startTest, icon: RefreshCw },
              { label: 'Cambiar de modo', onClick: () => { game.exitTestMode(); setView(null); }, icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {game.testQuestions.map((q, i) => {
              const ok = transformed(q.solucion) === game.userAnswers[i];
              return (
                <FeedbackItem key={i} index={i + 1} ok={ok} title={transformed(q.solucion)}>
                  {ok ? 'Has separado bien todas las palabras.' : <>Tu respuesta: <em>{game.userAnswers[i] || 'No contestada'}</em></>}
                </FeedbackItem>
              );
            })}
          </ResultsScreen>
        </GameShell>
      );
    }

    // Test en curso
    const isLast = game.indiceFraseActual === TOTAL_TEST_QUESTIONS - 1;
    return (
      <GameShell {...SHELL}>
        <GameHeader
          mode="exam"
          onHelp={() => setShowHelp(true)}
          right={(
            <Hud>
              {game.withTimer && <HudStat icon={Clock} tone="time" value={`${game.elapsedTime}s`} label="Tiempo" />}
              <HudStat icon={GraduationCap} tone="progress" value={`${game.indiceFraseActual + 1}/${TOTAL_TEST_QUESTIONS}`} label="Frase" />
            </Hud>
          )}
        />
        <ProgressDots total={TOTAL_TEST_QUESTIONS} current={game.indiceFraseActual} />

        <motion.div key={game.indiceFraseActual} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {renderCase({ isExam: true })}
        </motion.div>

        <div className="dtv-controls">
          <GameButton
            variant={isLast ? 'success' : 'primary'}
            size="lg"
            iconRight={isLast ? Flag : ArrowRight}
            onClick={game.handleNextQuestion}
          >
            {isLast ? 'Finalizar' : 'Siguiente'}
          </GameButton>
        </div>
        <div className="dtv-footer">
          <span className="dtv-footer__info"><GraduationCap size={14} /> Modo examen · los cortes se corrigen al final</span>
        </div>
        {instructions}
      </GameShell>
    );
  }

  // Pantalla previa: elegir modo
  if (!view) {
    const modes = [
      {
        id: 'practice', tone: 'easy', icon: Search, title: 'Práctica libre',
        desc: 'Resuelve casos a tu ritmo: cada comprobación marca en verde o rojo tus cortes.',
        features: ['Corrección de cada corte', `${game.totalFrases} frases`],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: `${TOTAL_TEST_QUESTIONS} frases seguidas, sin comprobar hasta el final.`,
        features: ['Nota sobre 10', 'Puntos extra por rapidez'],
      },
    ];
    const onSelect = (id) => {
      if (id === 'exam') { game.startTest(); return; }
      setView('practice');
    };
    return (
      <GameShell {...SHELL}>
        <ModeSelect modes={modes} onSelect={onSelect} onHelp={() => setShowHelp(true)} extra={fontPicker} />
        {instructions}
      </GameShell>
    );
  }

  // Práctica
  const fb = game.feedback || {};
  return (
    <GameShell {...SHELL}>
      <GameHeader
        mode="easy"
        modeLabel="Práctica"
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            <HudStat icon={Trophy} tone="score" value={game.puntuacion} label="Puntos" />
            <HudStat icon={FileSearch} tone="progress" value={`${game.indiceFraseActual + 1}/${game.totalFrases}`} label="Caso" />
          </Hud>
        )}
      />
      <div className="dtv-toolbar">
        <span className="dtv-toolbar__hint"><Scissors size={15} /> Pulsa la última letra de cada palabra para separarla</span>
        {fontPicker}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={game.indiceFraseActual}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {renderCase({ isExam: false })}
        </motion.div>
      </AnimatePresence>

      <div className="dtv-feedback-slot">
        {isWrong && (
          <div key={game.feedbackKey} className="dtv-feedback is-bad gk-anim-shake" role="status">
            <span className="dtv-feedback__icon"><X size={16} strokeWidth={3} /></span>
            {fb.texto}
          </div>
        )}
        {!fb.clase && !game.fraseResuelta && (
          <div className="dtv-feedback is-hint">
            <MousePointerClick size={16} /> Cuando lo tengas, pulsa «¡Comprobar!»
          </div>
        )}
        <RoundBanner
          show={game.fraseResuelta}
          status="won"
          title={fb.texto || '¡Caso resuelto!'}
          subtitle="Has encontrado todas las palabras escondidas."
          action={game.siguienteFrase}
          actionLabel="Siguiente frase"
          actionIcon={ArrowRight}
        />
      </div>

      {!game.fraseResuelta && (
        <div className="dtv-controls">
          <GameButton variant="success" size="lg" icon={Search} onClick={game.comprobarFrase}>¡Comprobar!</GameButton>
          <GameButton variant="soft" icon={Shuffle} onClick={game.siguienteFrase}>Otra frase</GameButton>
        </div>
      )}

      <div className="dtv-footer">
        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setView(null)}>Cambiar modo</GameButton>
        <span className="dtv-footer__info"><FileSearch size={14} /> {game.totalFrases} frases en el archivo</span>
      </div>
      {instructions}
    </GameShell>
  );
};

export default DetectiveDePalabrasUI;
