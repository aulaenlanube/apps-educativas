// src/apps/infografias-interactivas/InfografiasInteractivas.jsx
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Eye, BookOpen, CheckCircle2, ArrowRight, ArrowLeft, Clock, FileSearch, RotateCcw, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Target, ListChecks, GraduationCap, Image as ImageIcon, Zap, Sparkles,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressBar, Panel, Chip, AnswerOption, GameButton,
  ResultsScreen, FeedbackItem, GameEmpty,
} from '../_shared/kit';
import { getInfografiasFor } from './data/infografiasData';
import { calcularPuntosInfografia } from './infografiasScoring';
import './InfografiasInteractivas.css';

const SHELL = { accent: '#8b5cf6', accent2: '#f472b6' };

// Fases del recorrido (solo visual): estudiar → responder → nota
const STEPS = [
  { id: 'study', label: 'Estudia', Icon: Eye },
  { id: 'quiz', label: 'Responde', Icon: ListChecks },
  { id: 'summary', label: 'Tu nota', Icon: GraduationCap },
];
const Stepper = ({ current }) => {
  const idx = STEPS.findIndex((st) => st.id === current);
  return (
    <ol className="igx-steps" aria-label="Progreso">
      {STEPS.map((st, i) => (
        <li key={st.id} className={`igx-step ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`}>
          <span className="igx-step__dot">{i < idx ? <CheckCircle2 size={15} /> : <st.Icon size={15} />}</span>
          <span className="igx-step__label">{st.label}</span>
        </li>
      ))}
    </ol>
  );
};

const PHASE = {
  SELECTOR: 'selector',
  STUDY: 'study',
  QUIZ: 'quiz',
  SUMMARY: 'summary',
};

const InfografiasInteractivas = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const asignatura = subjectId || 'general';

  const [phase, setPhase] = useState(PHASE.SELECTOR);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [testStartedAt, setTestStartedAt] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const completedRef = useRef(false);
  const imageContainerRef = useRef(null);
  const scrollRef = useRef(null);

  // Sincroniza el estado fullscreen con el navegador (ej. cuando el usuario
  // pulsa Escape).
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;

  const zoomIn = useCallback(() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  const toggleFullscreen = useCallback(async () => {
    const el = imageContainerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (_) {
      // ignorar — algunos navegadores rechazan si no es un gesto directo
    }
  }, []);

  // Arrastrar con clic izquierdo para desplazar la imagen cuando hay zoom.
  // Sólo se activa si el contenedor desborda (hay algo que desplazar).
  useEffect(() => {
    if (phase !== PHASE.STUDY) return undefined;
    const el = scrollRef.current;
    if (!el) return undefined;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      const overflowsX = el.scrollWidth > el.clientWidth;
      const overflowsY = el.scrollHeight > el.clientHeight;
      if (!overflowsX && !overflowsY) return;
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = el.scrollLeft;
      startTop = el.scrollTop;
      el.classList.add('is-grabbing');
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
      el.scrollTop = startTop - (e.clientY - startY);
    };

    const stop = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-grabbing');
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('blur', stop);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('blur', stop);
    };
  }, [phase, selectedInfo, zoom, isFullscreen]);

  const available = useMemo(
    () => getInfografiasFor(level, gradeParam, asignatura),
    [level, gradeParam, asignatura]
  );

  const startInfografia = useCallback((info) => {
    setSelectedInfo(info);
    setQuizAnswers({});
    setResults(null);
    completedRef.current = false;
    setTestStartedAt(null);
    setZoom(1);
    setPhase(PHASE.STUDY);
  }, []);

  const backToSelector = useCallback(() => {
    setSelectedInfo(null);
    setPhase(PHASE.SELECTOR);
  }, []);

  const startTest = useCallback(() => {
    setTestStartedAt(Date.now());
    setPhase(PHASE.QUIZ);
  }, []);

  const submitQuiz = useCallback(() => {
    let questionsCorrect = 0;
    const quizResults = selectedInfo.questions.map((q, i) => {
      const ok = quizAnswers[i] === q.correct;
      if (ok) questionsCorrect++;
      return { ...q, given: quizAnswers[i], isCorrect: ok };
    });

    const total = selectedInfo.questions.length;
    const correct = questionsCorrect;
    const nota = Math.round((correct / total) * 100) / 10;

    const durationSeconds = testStartedAt
      ? Math.max(1, Math.round((Date.now() - testStartedAt) / 1000))
      : 0;
    // Puntos paralelos (CLAUDE.md §3.2): no cambian la nota.
    const points = calcularPuntosInfografia({ correct, total, durationSeconds });

    setResults({
      questionsCorrect,
      total,
      correct,
      nota,
      quizResults,
      durationSeconds,
      points,
    });
    setPhase(PHASE.SUMMARY);

    if (!completedRef.current) {
      completedRef.current = true;
      if (nota >= 7) {
        setTimeout(() => {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 } });
        }, 200);
      }
      onGameComplete?.({
        mode: 'test',
        score: points.total,
        maxScore: points.maxScore,
        correctAnswers: correct,
        totalQuestions: total,
        durationSeconds,
        nota,
      });
    }
  }, [selectedInfo, quizAnswers, onGameComplete, testStartedAt]);

  const helpModal = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Infografías interactivas">
      <h3>¿Cómo funciona?</h3>
      <ol>
        <li><strong>Elige una infografía</strong> de tu asignatura.</li>
        <li><strong>Estudia la imagen</strong> todo el tiempo que necesites.</li>
        <li><strong>Responde a las preguntas</strong> sobre los datos de la infografía.</li>
        <li><strong>Obtén tu nota /10</strong> según los aciertos, y <strong>puntos</strong> extra por responder con soltura y hacer pleno (el tiempo de estudio no cuenta).</li>
      </ol>
      <p><em>Modo único: cada infografía completada cuenta como tarea.</em></p>
    </InstructionsModal>
  );

  // ─────────────────────────────────────────────────────────────────
  // Render: SELECTOR
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.SELECTOR) {
    return (
      <GameShell {...SHELL}>
        {helpModal}
        <GameHeader onHelp={() => setShowHelp(true)} />

        {available.length === 0 ? (
          <GameEmpty title="Aún no hay infografías">
            Todavía no hay infografías disponibles para este curso y asignatura. ¡Pronto añadiremos más!
          </GameEmpty>
        ) : (
          <>
            <div className="igx-intro">
              <span className="igx-intro__icon"><FileSearch size={20} /></span>
              <p>
                Elige una infografía, <strong>estúdiala</strong> con calma y demuestra lo que has aprendido
                en un <strong>examen</strong> con nota sobre 10.
              </p>
            </div>
            <div className="igx-grid">
              {available.map((info, idx) => (
                <motion.button
                  key={info.id}
                  type="button"
                  className="igx-card"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
                  onClick={() => startInfografia(info)}
                >
                  <span className="igx-card__stage">
                    <span className="igx-card__poster">
                      <img src={info.image} alt={info.title} loading="lazy" />
                    </span>
                    <span className="igx-card__badge" aria-hidden="true">{info.icon}</span>
                  </span>
                  <span className="igx-card__body">
                    <span className="igx-card__title">{info.title}</span>
                    <span className="igx-card__sub">{info.subtitle}</span>
                    <span className="igx-card__meta">
                      <span className="gk-chip gk-chip--soft"><BookOpen size={13} /> {info.questions.length} preguntas</span>
                      <span className="igx-card__go">Estudiar <ArrowRight size={15} /></span>
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </GameShell>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render: STUDY
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.STUDY) {
    return (
      <GameShell {...SHELL}>
        {helpModal}
        <GameHeader
          onHelp={() => setShowHelp(true)}
          right={
            <GameButton variant="primary" iconRight={ArrowRight} onClick={startTest}>
              Empezar examen
            </GameButton>
          }
        />

        <div className="igx-topline">
          <GameButton variant="ghost" size="sm" icon={ArrowLeft} onClick={backToSelector}>
            Cambiar de infografía
          </GameButton>
          <Stepper current="study" />
        </div>

        <div className="igx-subject">
          <span className="igx-subject__icon" aria-hidden="true">{selectedInfo.icon}</span>
          <div>
            <h2>{selectedInfo.title}</h2>
            <p>{selectedInfo.subtitle}</p>
          </div>
          <Chip tone="accent" icon={Eye}>Fase de estudio</Chip>
        </div>

        <Panel variant="inset" className="igx-banner">
          <span className="igx-banner__icon" aria-hidden="true"><Eye size={18} /></span>
          <span>
            Observa la infografía todo el tiempo que necesites. Después tendrás que responder a{' '}
            <strong>{selectedInfo.questions.length} preguntas</strong> sin poder verla.
          </span>
        </Panel>

        <div
          ref={imageContainerRef}
          className={`igx-viewer ${isFullscreen ? 'is-fullscreen' : ''}`}
        >
          <div className="igx-toolbar">
            <span className="igx-toolbar__label"><ImageIcon size={15} /> Infografía</span>
            <div className="igx-toolbar__group">
              <button type="button" className="igx-tool" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} title="Reducir zoom" aria-label="Reducir zoom">
                <ZoomOut size={17} />
              </button>
              <span className="igx-toolbar__zoom">{Math.round(zoom * 100)}%</span>
              <button type="button" className="igx-tool" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} title="Aumentar zoom" aria-label="Aumentar zoom">
                <ZoomIn size={17} />
              </button>
              <button type="button" className="igx-tool" onClick={resetZoom} disabled={zoom === 1} title="Restablecer zoom" aria-label="Restablecer zoom">
                <RotateCcw size={15} />
              </button>
              <span className="igx-toolbar__sep" />
              <button
                type="button"
                className="igx-tool"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
              >
                {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className={`igx-scroll ${zoom > 1 ? 'pannable' : ''}`}
          >
            <img
              src={selectedInfo.image}
              alt={selectedInfo.title}
              style={{ width: `${zoom * 100}%` }}
              draggable={false}
            />
          </div>
        </div>

        <div className="igx-foot">
          <GameButton variant="success" size="lg" iconRight={ArrowRight} onClick={startTest}>
            Estoy listo · Empezar examen
          </GameButton>
        </div>
      </GameShell>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render: QUIZ
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.QUIZ) {
    const allAnswered = selectedInfo.questions.every((_, i) => quizAnswers[i] !== undefined);
    // Solo visual: progreso de preguntas respondidas
    const answeredCount = Object.keys(quizAnswers).length;
    const total = selectedInfo.questions.length;
    return (
      <GameShell {...SHELL}>
        {helpModal}
        <GameHeader
          mode="exam"
          onHelp={() => setShowHelp(true)}
          right={
            <Hud>
              <HudStat icon={Target} tone="progress" value={`${answeredCount}/${total}`} label="Respondidas" />
            </Hud>
          }
        />

        <div className="igx-topline">
          <div className="igx-subject igx-subject--sm">
            <span className="igx-subject__icon" aria-hidden="true">{selectedInfo.icon}</span>
            <div>
              <h2>{selectedInfo.title}</h2>
              <p>Responde basándote en lo que has estudiado.</p>
            </div>
          </div>
          <Stepper current="quiz" />
        </div>

        <ProgressBar value={answeredCount} max={total} tone={allAnswered ? 'good' : 'accent'} label="Preguntas respondidas" />

        <div className="igx-quiz">
          {selectedInfo.questions.map((q, i) => {
            const answered = quizAnswers[i] !== undefined;
            return (
              <Panel
                key={i}
                variant="surface"
                className={`igx-q ${answered ? 'is-answered' : ''}`}
                style={{ '--i': i }}
              >
                <div className="igx-q__head">
                  <span className="igx-q__num">{answered ? <CheckCircle2 size={17} /> : i + 1}</span>
                  <p>{q.q}</p>
                </div>
                <div className="igx-q__opts">
                  {q.options.map((opt, k) => (
                    <AnswerOption
                      key={k}
                      letter={String.fromCharCode(65 + k)}
                      state={quizAnswers[i] === k ? 'selected' : 'idle'}
                      className={answered && quizAnswers[i] !== k ? 'is-dim' : ''}
                      aria-pressed={quizAnswers[i] === k}
                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: k }))}
                    >
                      {opt}
                    </AnswerOption>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>

        <div className="igx-foot igx-foot--sticky">
          <span className="igx-foot__info">
            {allAnswered ? '¡Todo listo! Puedes enviar tus respuestas.' : `Te faltan ${total - answeredCount} por responder`}
          </span>
          <GameButton
            variant="success"
            size="lg"
            icon={CheckCircle2}
            onClick={submitQuiz}
            disabled={!allAnswered}
            title={!allAnswered ? 'Responde a todas las preguntas para continuar' : ''}
          >
            Enviar respuestas
          </GameButton>
        </div>
      </GameShell>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render: SUMMARY
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.SUMMARY && results) {
    return (
      <GameShell {...SHELL}>
        {helpModal}
        <ResultsScreen
          subtitle={`${selectedInfo.icon} ${selectedInfo.title}`}
          nota={results.nota}
          points={results.points.total}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${results.correct}/${results.total}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: formatTime(results.durationSeconds) },
            { icon: Zap, tone: 'streak', label: 'Bonus rapidez', value: `+${results.points.speedBonus}` },
            ...(results.points.perfectBonus > 0
              ? [{ icon: Sparkles, tone: 'score', label: 'Pleno', value: `+${results.points.perfectBonus}` }]
              : []),
          ]}
          actions={[
            { label: 'Repetir esta infografía', onClick: () => startInfografia(selectedInfo), icon: RotateCcw },
            { label: 'Elegir otra infografía', onClick: backToSelector, icon: FileSearch, variant: 'soft' },
          ]}
        >
          {results.quizResults.map((r, i) => (
            <FeedbackItem key={i} index={i + 1} ok={r.isCorrect} title={r.q}>
              Tu respuesta: <em>{r.given !== undefined ? r.options[r.given] : '—'}</em>
              {!r.isCorrect && <> · Solución: <strong>{r.options[r.correct]}</strong></>}
            </FeedbackItem>
          ))}
        </ResultsScreen>
      </GameShell>
    );
  }

  return null;
};

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default InfografiasInteractivas;
