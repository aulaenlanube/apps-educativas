// src/apps/infografias-interactivas/InfografiasInteractivas.jsx
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Eye, BookOpen, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Clock, Award, FileSearch, RotateCcw, Sparkles, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import { INFOGRAFIAS, getInfografiasFor } from './data/infografiasData';
import './InfografiasInteractivas.css';

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

    setResults({
      questionsCorrect,
      total,
      correct,
      nota,
      quizResults,
      durationSeconds,
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
        score: correct,
        maxScore: total,
        correctAnswers: correct,
        totalQuestions: total,
        durationSeconds,
        nota,
      });
    }
  }, [selectedInfo, quizAnswers, onGameComplete, testStartedAt]);

  // ─────────────────────────────────────────────────────────────────
  // Render: SELECTOR
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.SELECTOR) {
    return (
      <div className="infografias-app">
        <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Infografías interactivas">
          <h3>¿Cómo funciona?</h3>
          <ol>
            <li><strong>Elige una infografía</strong> de tu asignatura.</li>
            <li><strong>Estudia la imagen</strong> todo el tiempo que necesites.</li>
            <li><strong>Responde a las preguntas</strong> sobre los datos de la infografía.</li>
            <li><strong>Obtén tu nota /10</strong> según los aciertos.</li>
          </ol>
          <p><em>Modo único: cada infografía completada cuenta como tarea.</em></p>
        </InstructionsModal>

        <div className="infografias-header">
          <div>
            <h1 className="infografias-title">
              <FileSearch size={28} /> Infografías interactivas
            </h1>
            <p className="infografias-subtitle">
              Estudia la imagen y demuestra lo que has aprendido
            </p>
          </div>
          <InstructionsButton onClick={() => setShowHelp(true)} />
        </div>

        {available.length === 0 ? (
          <div className="infografias-empty">
            <Sparkles size={40} />
            <p>Todavía no hay infografías disponibles para este curso y asignatura.</p>
            <p className="hint">¡Pronto añadiremos más!</p>
          </div>
        ) : (
          <div className="infografias-grid">
            {available.map((info) => (
              <motion.button
                key={info.id}
                className="info-card"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startInfografia(info)}
              >
                <div className="info-card-img">
                  <img src={info.image} alt={info.title} loading="lazy" />
                  <div className="info-card-icon">{info.icon}</div>
                </div>
                <div className="info-card-body">
                  <h3>{info.title}</h3>
                  <p>{info.subtitle}</p>
                  <div className="info-card-meta">
                    <span><BookOpen size={14} /> {info.questions.length} preguntas</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render: STUDY
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.STUDY) {
    return (
      <div className="infografias-app">
        <div className="study-header">
          <button className="btn-ghost" onClick={backToSelector}>
            <ArrowLeft size={18} /> Cambiar de infografía
          </button>
          <div className="study-title">
            <span className="icon">{selectedInfo.icon}</span>
            <div>
              <h2>{selectedInfo.title}</h2>
              <p>{selectedInfo.subtitle}</p>
            </div>
          </div>
          <button className="btn-primary" onClick={startTest}>
            Empezar examen <ArrowRight size={18} />
          </button>
        </div>

        <div className="study-banner">
          <Eye size={20} />
          <span>
            Observa la infografía todo el tiempo que necesites. Después tendrás que responder a <strong>{selectedInfo.questions.length} preguntas</strong>.
          </span>
        </div>

        <div
          ref={imageContainerRef}
          className={`study-image-wrap ${isFullscreen ? 'is-fullscreen' : ''}`}
        >
          <div className="image-toolbar">
            <button
              type="button"
              className="image-toolbar-btn"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              title="Reducir zoom"
              aria-label="Reducir zoom"
            >
              <ZoomOut size={18} />
            </button>
            <span className="image-toolbar-zoom">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="image-toolbar-btn"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="image-toolbar-btn"
              onClick={resetZoom}
              disabled={zoom === 1}
              title="Restablecer zoom"
              aria-label="Restablecer zoom"
            >
              <RotateCcw size={16} />
            </button>
            <div className="image-toolbar-sep" />
            <button
              type="button"
              className="image-toolbar-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
          <div
            ref={scrollRef}
            className={`image-scroll ${zoom > 1 ? 'pannable' : ''}`}
          >
            <img
              src={selectedInfo.image}
              alt={selectedInfo.title}
              style={{ width: `${zoom * 100}%` }}
              draggable={false}
            />
          </div>
        </div>

        <div className="study-footer">
          <button className="btn-primary big" onClick={startTest}>
            Estoy listo · Empezar examen <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render: QUIZ
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.QUIZ) {
    const allAnswered = selectedInfo.questions.every((_, i) => quizAnswers[i] !== undefined);
    return (
      <div className="infografias-app">
        <div className="phase-header">
          <div className="phase-badge">Examen</div>
          <h2>Preguntas sobre la infografía</h2>
          <p>Responde a las {selectedInfo.questions.length} preguntas basándote en lo que has estudiado.</p>
        </div>

        <div className="quiz-list">
          {selectedInfo.questions.map((q, i) => (
            <div key={i} className="quiz-item">
              <div className="quiz-q">
                <span className="quiz-num">{i + 1}</span>
                <p>{q.q}</p>
              </div>
              <div className="quiz-options">
                {q.options.map((opt, k) => (
                  <button
                    key={k}
                    type="button"
                    className={`quiz-opt ${quizAnswers[i] === k ? 'selected' : ''}`}
                    onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: k }))}
                  >
                    <span className="quiz-opt-letter">{String.fromCharCode(65 + k)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="phase-footer">
          <button
            className="btn-primary big"
            onClick={submitQuiz}
            disabled={!allAnswered}
            title={!allAnswered ? 'Responde a todas las preguntas para continuar' : ''}
          >
            Enviar respuestas <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render: SUMMARY
  // ─────────────────────────────────────────────────────────────────
  if (phase === PHASE.SUMMARY && results) {
    const notaColor = results.nota >= 8 ? '#10b981' : results.nota >= 5 ? '#3b82f6' : '#ef4444';
    const notaMsg =
      results.nota >= 9 ? '¡Excelente!' :
      results.nota >= 7 ? '¡Muy bien!' :
      results.nota >= 5 ? 'Aprobado' :
      'Necesitas repasar';

    return (
      <div className="infografias-app">
        <div className="summary-header">
          <h2><Award size={28} /> Resultados · {selectedInfo.title}</h2>
        </div>

        <motion.div
          className="summary-nota"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <div className="nota-circle" style={{ borderColor: notaColor, color: notaColor }}>
            <span className="nota-number">{results.nota.toFixed(1)}</span>
            <span className="nota-of">/10</span>
          </div>
          <div className="nota-msg" style={{ color: notaColor }}>{notaMsg}</div>
        </motion.div>

        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-label">Aciertos</div>
            <div className="stat-value">{results.correct} / {results.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tiempo</div>
            <div className="stat-value"><Clock size={16} /> {formatTime(results.durationSeconds)}</div>
          </div>
        </div>

        <div className="summary-sections">
          <section>
            <h3><BookOpen size={20} /> Preguntas</h3>
            <ul className="result-list">
              {results.quizResults.map((r, i) => (
                <li key={i} className={r.isCorrect ? 'ok' : 'wrong'}>
                  <span className="r-icon">
                    {r.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </span>
                  <div className="r-body">
                    <strong>{i + 1}.</strong> {r.q}
                    <div className="r-detail">
                      Tu respuesta: <em>{r.given !== undefined ? r.options[r.given] : '—'}</em>
                      {!r.isCorrect && <span className="r-correct"> · Solución: <strong>{r.options[r.correct]}</strong></span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="summary-actions">
          <button className="btn-ghost" onClick={() => startInfografia(selectedInfo)}>
            <RotateCcw size={18} /> Repetir esta infografía
          </button>
          <button className="btn-primary" onClick={backToSelector}>
            <FileSearch size={18} /> Elegir otra infografía
          </button>
        </div>
      </div>
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
