// src/apps/la-fortaleza/FortalezaGame.jsx
// Componente de partida: canvas + HUD + fases (quiz → construcción → oleada).
// Recibe el contenido ya preparado por LaFortaleza.jsx y devuelve el resultado
// por onEnd(). onProgress() emite eventos de progreso (preparado para el duelo).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Coins, Star, Flame, Play, Volume2, VolumeX,
  FastForward, Flag, X, ArrowUpCircle, Trash2, Waves, Timer,
} from 'lucide-react';
import {
  createGame, planNextWave, startWave, stepGame, placeTower, upgradeTower,
  sellTower, classifyEnemy, bossStrike, bossEnrage, canBuildAt, rewardCorrectAnswer,
  TOWER_TYPES, MAX_TOWER_LEVEL, upgradeCost, sellValue, GRID, WORLD, EXAM_WAVES,
} from './engine';
import { createBackground, renderGame } from './render';

const QUESTIONS_PER_WAVE = 2;
const QUIZ_SECONDS_EXAM = 30;
const BOSS_SECONDS = 25;

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const FortalezaGame = ({ seed, mode, categories, questions, bossQuestions, sounds, onEnd, onProgress }) => {
  const isExam = mode === 'exam';

  // --- motor (uno por montaje, determinista por seed) ---
  const gameRef = useRef(null);
  const bgRef = useRef(null);
  if (!gameRef.current) {
    gameRef.current = createGame({ seed, mode, categories });
    bgRef.current = createBackground(gameRef.current.map, seed);
    planNextWave(gameRef.current);
  }
  const game = gameRef.current;

  // --- estado React (HUD y UI) ---
  const [phase, setPhase] = useState('quiz'); // quiz | build | wave | ended
  const [hud, setHud] = useState({ coins: game.coins, lives: game.lives, wave: game.wave, score: game.score });
  const [streak, setStreak] = useState(0);
  const [quiz, setQuiz] = useState(null); // {question, qNum, input, feedback, reward, timeLeft}
  const [overlay, setOverlay] = useState(null); // classify | boss | catpick | quit
  const [placingType, setPlacingType] = useState(null);
  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [forecast, setForecast] = useState(game.nextWave);

  // --- refs espejo para el bucle rAF ---
  const phaseRef = useRef(phase);
  const overlayRef = useRef(overlay);
  const speedRef = useRef(speed);
  const placingRef = useRef(placingType);
  const selectedRef = useRef(selectedTowerId);
  const hoverRef = useRef(hoverCell);
  const streakRef = useRef(0);
  const endedRef = useRef(false);
  const qPointerRef = useRef(0);
  const bossPointerRef = useRef(0);
  const academicRef = useRef({
    correct: 0, total: 0,
    questions: { c: 0, t: 0 }, classify: { c: 0, t: 0 }, boss: { c: 0, t: 0 },
  });
  phaseRef.current = phase;
  overlayRef.current = overlay;
  speedRef.current = speed;
  placingRef.current = placingType;
  selectedRef.current = selectedTowerId;
  hoverRef.current = hoverCell;

  const canvasRef = useRef(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const soundsRef = useRef(sounds);

  // --- fin de partida (una sola vez) ---
  const endGame = useCallback((outcome) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const g = gameRef.current;
    setPhase('ended');
    onEndRef.current?.({
      outcome,
      score: g.score,
      wave: g.wave,
      lives: g.lives,
      academic: { ...academicRef.current },
      durationSeconds: Math.round(g.time),
      stats: { ...g.stats },
    });
  }, []);

  // Abandono a mitad de partida (cierre/navegación): registra el parcial
  useEffect(() => () => {
    if (!endedRef.current && gameRef.current.time > 2) {
      endedRef.current = true;
      const g = gameRef.current;
      onEndRef.current?.({
        outcome: 'abandoned',
        score: g.score,
        wave: g.wave,
        lives: g.lives,
        academic: { ...academicRef.current },
        durationSeconds: Math.round(g.time),
        stats: { ...g.stats },
      });
    }
  }, []);

  // --- contabilidad académica ---
  const tally = useCallback((kind, correct) => {
    const a = academicRef.current;
    a.total++; a[kind].t++;
    if (correct) { a.correct++; a[kind].c++; }
  }, []);

  // --- preguntas ---
  const nextQuestion = useCallback(() => {
    const q = questions[qPointerRef.current % questions.length];
    qPointerRef.current++;
    return q;
  }, [questions]);

  const openQuiz = useCallback(() => {
    setQuiz({
      question: nextQuestion(), qNum: 1, input: '', feedback: null, reward: 0,
      timeLeft: isExam ? QUIZ_SECONDS_EXAM : null,
    });
    setPhase('quiz');
  }, [nextQuestion, isExam]);

  // Primera fase de quiz al montar
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    openQuiz();
  }, [openQuiz]);

  const answerQuiz = useCallback((answer) => {
    setQuiz((prev) => {
      if (!prev || prev.feedback) return prev;
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('questions', correct);
      let reward = 0;
      if (correct) {
        streakRef.current++;
        reward = rewardCorrectAnswer(gameRef.current, streakRef.current);
        soundsRef.current.correct();
        setTimeout(() => soundsRef.current.coin(), 250);
      } else {
        streakRef.current = 0;
        soundsRef.current.wrong();
      }
      setStreak(streakRef.current);
      return { ...prev, feedback: correct ? 'correct' : 'wrong', reward };
    });
  }, [tally]);

  // Avance tras el feedback del quiz
  useEffect(() => {
    if (!quiz?.feedback) return;
    const t = setTimeout(() => {
      setQuiz((prev) => {
        if (!prev) return prev;
        if (prev.qNum >= QUESTIONS_PER_WAVE) {
          setPhase('build');
          return null;
        }
        return {
          question: nextQuestion(), qNum: prev.qNum + 1, input: '', feedback: null, reward: 0,
          timeLeft: isExam ? QUIZ_SECONDS_EXAM : null,
        };
      });
    }, 1100);
    return () => clearTimeout(t);
  }, [quiz?.feedback, quiz?.qNum, nextQuestion, isExam]);

  // Temporizador del quiz (solo examen)
  useEffect(() => {
    if (!isExam || !quiz || quiz.feedback || quiz.timeLeft == null) return;
    if (quiz.timeLeft <= 0) { answerQuiz(null); return; }
    const t = setTimeout(() => setQuiz((p) => (p && !p.feedback ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [quiz, isExam, answerQuiz]);

  // --- jefe ---
  const answerBoss = useCallback((answer) => {
    setOverlay((prev) => {
      if (prev?.type !== 'boss' || prev.feedback) return prev;
      const g = gameRef.current;
      const alive = g.enemies.some((e) => e.id === prev.enemyId && e.hp > 0);
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('boss', correct);
      if (alive) {
        if (correct) { bossStrike(g, prev.enemyId); soundsRef.current.crit(); }
        else { bossEnrage(g, prev.enemyId); soundsRef.current.jam(); }
      } else if (correct) {
        soundsRef.current.correct();
      } else {
        soundsRef.current.wrong();
      }
      return { ...prev, feedback: correct ? 'correct' : 'wrong' };
    });
  }, [tally]);

  // Temporizador del jefe
  useEffect(() => {
    if (overlay?.type !== 'boss' || overlay.feedback) return;
    if (overlay.timeLeft <= 0) { answerBoss(null); return; }
    const t = setTimeout(() => setOverlay((p) => (p?.type === 'boss' && !p.feedback ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [overlay, answerBoss]);

  useEffect(() => {
    if (overlay?.type !== 'boss' || !overlay.feedback) return;
    const t = setTimeout(() => setOverlay(null), 1200);
    return () => clearTimeout(t);
  }, [overlay]);

  // --- clasificación manual ---
  const answerClassify = useCallback((catIdx) => {
    const ov = overlayRef.current;
    if (ov?.type !== 'classify') return;
    const result = classifyEnemy(gameRef.current, ov.enemyId, catIdx);
    setOverlay(null);
    if (!result) return; // el enemigo ya no está
    tally('classify', result.correct);
    if (result.correct) soundsRef.current.crit();
    else soundsRef.current.jam();
  }, [tally]);

  // --- eventos del motor ---
  const handleEvents = useCallback((events) => {
    const snd = soundsRef.current;
    for (const ev of events) {
      switch (ev.t) {
        case 'shoot': snd.shoot(ev.tower); break;
        case 'hit': snd.hit(); break;
        case 'explosion': snd.explosion(); break;
        case 'death': snd.death(); break;
        case 'leak':
          snd.leak();
          onProgressRef.current?.({ type: 'hp', lives: gameRef.current.lives });
          break;
        case 'boss_spawn': {
          snd.bossSpawn();
          const q = bossQuestions[bossPointerRef.current % bossQuestions.length];
          bossPointerRef.current++;
          setOverlay({ type: 'boss', enemyId: ev.enemy.id, question: q, input: '', feedback: null, timeLeft: BOSS_SECONDS });
          break;
        }
        case 'wave_end':
          snd.waveClear();
          setForecast(planNextWave(gameRef.current));
          onProgressRef.current?.({ type: 'wave_complete', wave: ev.wave, score: gameRef.current.score });
          openQuiz();
          break;
        case 'victory':
          snd.victory();
          endGame('victory');
          break;
        case 'defeat':
          snd.defeat();
          setOverlay(null);
          endGame('defeat');
          break;
        default: break;
      }
    }
  }, [bossQuestions, openQuiz, endGame]);

  // --- bucle principal rAF ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WORLD.w * dpr;
    canvas.height = WORLD.h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let last = performance.now();
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      let dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const g = gameRef.current;

      // Escala temporal: modal abierto → pausa (práctica) o cámara lenta (examen)
      let scale = speedRef.current;
      const ov = overlayRef.current;
      if (ov && (ov.type === 'classify' || (ov.type === 'boss' && !ov.feedback))) {
        scale = isExam ? 0.25 : 0;
      }
      if (phaseRef.current === 'ended') scale = 0.3; // el campo sigue vivo de fondo

      if (scale > 0 && !endedRef.current) {
        const events = stepGame(g, dt * scale);
        if (events.length) handleEvents(events);
      } else if (scale > 0) {
        stepGame(g, dt * scale); // tras el fin, solo ambiente
      }

      // Si el jefe muere con la pregunta abierta, se cierra sola
      if (ov?.type === 'boss' && !ov.feedback && !g.enemies.some((e) => e.id === ov.enemyId && e.hp > 0)) {
        setOverlay(null);
      }

      // Sincronizar HUD solo cuando cambia algo
      setHud((prev) => {
        if (prev.coins === g.coins && prev.lives === g.lives && prev.wave === g.wave && prev.score === g.score) return prev;
        return { coins: g.coins, lives: g.lives, wave: g.wave, score: g.score };
      });

      const placing = placingRef.current;
      const hover = hoverRef.current;
      renderGame(ctx, g, {
        background: bgRef.current,
        selectedTowerId: selectedRef.current,
        placingType: placing,
        hoverCell: placing ? hover : null,
        placingValid: placing && hover
          ? canBuildAt(g, hover[0], hover[1]) && g.coins >= TOWER_TYPES[placing].cost
          : false,
        showCatColors: !isExam,
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [handleEvents, isExam]);

  // --- interacción con el canvas ---
  const toLogical = useCallback((evt) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((evt.clientX - rect.left) / rect.width) * WORLD.w,
      y: ((evt.clientY - rect.top) / rect.height) * WORLD.h,
    };
  }, []);

  const onCanvasPointerMove = useCallback((evt) => {
    if (!placingRef.current) return;
    const { x, y } = toLogical(evt);
    setHoverCell([Math.floor(x / GRID.cell), Math.floor(y / GRID.cell)]);
  }, [toLogical]);

  const onCanvasPointerDown = useCallback((evt) => {
    const g = gameRef.current;
    const { x, y } = toLogical(evt);

    // 1) Enemigo (disparo de precisión) — solo durante la oleada y sin modal
    if (phaseRef.current === 'wave' && !overlayRef.current && !placingRef.current) {
      let best = null, bestD = 36;
      for (const e of g.enemies) {
        if (e.hp <= 0 || e.classified) continue;
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < bestD) { best = e; bestD = d; }
      }
      if (best) {
        setSelectedTowerId(null);
        setOverlay({ type: 'classify', enemyId: best.id, word: best.word });
        return;
      }
    }

    // 2) Colocación de torre
    if (placingRef.current) {
      const col = Math.floor(x / GRID.cell), row = Math.floor(y / GRID.cell);
      const type = TOWER_TYPES[placingRef.current];
      if (canBuildAt(g, col, row) && g.coins >= type.cost) {
        if (type.needsCategory) {
          setOverlay({ type: 'catpick', col, row, towerType: placingRef.current });
        } else {
          placeTower(g, col, row, placingRef.current);
          soundsRef.current.build();
        }
      }
      return;
    }

    // 3) Selección de torre existente
    let tw = null;
    for (const t of g.towers) {
      if (Math.hypot(t.x - x, t.y - y) < 28) { tw = t; break; }
    }
    setSelectedTowerId(tw ? tw.id : null);
  }, [toLogical]);

  // --- acciones UI ---
  const launchWave = useCallback(() => {
    startWave(gameRef.current);
    setForecast(null);
    setPhase('wave');
  }, []);

  const pickCategoryAndPlace = useCallback((catIdx) => {
    const ov = overlayRef.current;
    if (ov?.type !== 'catpick') return;
    placeTower(gameRef.current, ov.col, ov.row, ov.towerType, catIdx);
    soundsRef.current.build();
    setOverlay(null);
  }, []);

  const doUpgrade = useCallback(() => {
    if (upgradeTower(gameRef.current, selectedRef.current)) soundsRef.current.build();
  }, []);

  const doSell = useCallback(() => {
    if (sellTower(gameRef.current, selectedRef.current)) {
      soundsRef.current.coin();
      setSelectedTowerId(null);
    }
  }, []);

  const toggleSound = useCallback(() => setSoundOn(soundsRef.current.toggle()), []);

  // --- derivados ---
  const selectedTower = selectedTowerId ? game.towers.find((t) => t.id === selectedTowerId) : null;
  const waveLabel = isExam ? `${Math.min(hud.wave + (phase === 'wave' ? 0 : 1), EXAM_WAVES)}/${EXAM_WAVES}` : `${hud.wave + (phase === 'wave' ? 0 : 1)}`;
  const a = academicRef.current;

  const forecastByCat = forecast
    ? forecast.entries.reduce((acc, e) => { acc[e.catIdx] = (acc[e.catIdx] || 0) + 1; return acc; }, {})
    : null;

  return (
    <div className="fort-game">
      {/* ---------- HUD superior ---------- */}
      <div className="fort-hud">
        <span className="fort-hud-item lives"><Heart size={16} /> {hud.lives}</span>
        <span className="fort-hud-item coins"><Coins size={16} /> {hud.coins}</span>
        <span className="fort-hud-item wave"><Waves size={16} /> {waveLabel}</span>
        <span className="fort-hud-item score"><Star size={16} /> {hud.score.toLocaleString('es-ES')}</span>
        {streak > 1 && <span className="fort-hud-item streak"><Flame size={16} /> x{streak}</span>}
        <span className="fort-hud-spacer" />
        {phase === 'wave' && (
          <button className={`fort-hud-btn ${speed === 2 ? 'active' : ''}`} onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))} title="Velocidad x2">
            <FastForward size={16} />{speed === 2 ? ' x2' : ' x1'}
          </button>
        )}
        <button className="fort-hud-btn" onClick={toggleSound} title="Sonido">
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* ---------- canvas ---------- */}
      <div className="fort-canvas-wrap">
        <canvas
          ref={canvasRef}
          className={`fort-canvas ${placingType ? 'placing' : ''}`}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerLeave={() => setHoverCell(null)}
        />

        {/* ---------- panel de quiz (overlay sobre el canvas) ---------- */}
        <AnimatePresence>
          {phase === 'quiz' && quiz && (
            <motion.div className="fort-quiz" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="fort-quiz-head">
                <span className="fort-quiz-tag">📜 Pregunta {quiz.qNum}/{QUESTIONS_PER_WAVE} · gana monedas</span>
                {quiz.timeLeft != null && (
                  <span className={`fort-quiz-timer ${quiz.timeLeft <= 10 ? 'urgent' : ''}`}><Timer size={14} /> {quiz.timeLeft}s</span>
                )}
              </div>
              <p className="fort-quiz-def">{quiz.question.definicion}</p>

              {quiz.feedback ? (
                <div className={`fort-quiz-feedback ${quiz.feedback}`}>
                  {quiz.feedback === 'correct'
                    ? <>✅ ¡Correcto! <strong>+{quiz.reward} 🪙</strong>{streak > 1 ? ` (racha x${streak})` : ''}</>
                    : <>❌ Era: <strong>{quiz.question.solucion}</strong></>}
                </div>
              ) : isExam ? (
                <form className="fort-quiz-form" onSubmit={(e) => { e.preventDefault(); if (quiz.input.trim()) answerQuiz(quiz.input); }}>
                  <input
                    autoFocus
                    value={quiz.input}
                    onChange={(e) => setQuiz((p) => ({ ...p, input: e.target.value }))}
                    placeholder="Escribe la respuesta..."
                    autoComplete="off" autoCorrect="off" spellCheck="false"
                  />
                  <button type="submit" disabled={!quiz.input.trim()}>Responder</button>
                </form>
              ) : (
                <div className="fort-quiz-options">
                  {quiz.question.options.map((opt) => (
                    <button key={opt} onClick={() => answerQuiz(opt)}>{opt}</button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal clasificación (disparo de precisión) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'classify' && (
            <motion.div className="fort-classify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button className="fort-classify-close" onClick={() => setOverlay(null)}><X size={16} /></button>
              <div className="fort-classify-word">«{overlay.word}»</div>
              <div className="fort-classify-ask">¿A qué categoría pertenece?</div>
              <div className="fort-classify-opts">
                {game.categories.map((cat, i) => (
                  <button key={cat.name} style={{ '--cat': cat.color }} onClick={() => answerClassify(i)}>
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="fort-classify-hint">✅ crítico devastador · ❌ torres atascadas 3s</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal jefe ---------- */}
        <AnimatePresence>
          {overlay?.type === 'boss' && (
            <motion.div className="fort-boss" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="fort-boss-head">
                <span>👑 ¡JEFE A LA VISTA!</span>
                <span className={`fort-quiz-timer ${overlay.timeLeft <= 8 ? 'urgent' : ''}`}><Timer size={14} /> {overlay.timeLeft}s</span>
              </div>
              <p className="fort-quiz-def">{overlay.question.definicion}</p>
              {overlay.feedback ? (
                <div className={`fort-quiz-feedback ${overlay.feedback}`}>
                  {overlay.feedback === 'correct'
                    ? '⚡ ¡Golpe de sabiduría! El jefe pierde el 70% de su vida'
                    : <>😤 El jefe se enfurece. Era: <strong>{overlay.question.solucion}</strong></>}
                </div>
              ) : isExam ? (
                <form className="fort-quiz-form" onSubmit={(e) => { e.preventDefault(); if (overlay.input.trim()) answerBoss(overlay.input); }}>
                  <input
                    autoFocus
                    value={overlay.input}
                    onChange={(e) => setOverlay((p) => ({ ...p, input: e.target.value }))}
                    placeholder="Respuesta para debilitarlo..."
                    autoComplete="off" autoCorrect="off" spellCheck="false"
                  />
                  <button type="submit" disabled={!overlay.input.trim()}>¡Atacar!</button>
                </form>
              ) : (
                <div className="fort-quiz-options">
                  {overlay.question.options.map((opt) => (
                    <button key={opt} onClick={() => answerBoss(opt)}>{opt}</button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal elegir categoría al construir ---------- */}
        <AnimatePresence>
          {overlay?.type === 'catpick' && (
            <motion.div className="fort-classify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button className="fort-classify-close" onClick={() => setOverlay(null)}><X size={16} /></button>
              <div className="fort-classify-ask">{TOWER_TYPES[overlay.towerType].emoji} ¿Qué categoría vigilará esta torre?</div>
              <div className="fort-classify-opts">
                {game.categories.map((cat, i) => (
                  <button key={cat.name} style={{ '--cat': cat.color }} onClick={() => pickCategoryAndPlace(i)}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal confirmar rendición (práctica) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'quit' && (
            <motion.div className="fort-classify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-classify-ask">🏳️ ¿Terminar la partida aquí?</div>
              <div className="fort-classify-hint">Se guardarán tus puntos y tu progreso.</div>
              <div className="fort-quit-btns">
                <button className="fort-btn-secondary" onClick={() => setOverlay(null)}>Seguir jugando</button>
                <button className="fort-btn-danger" onClick={() => endGame('finished')}>Terminar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------- pronóstico + lanzar oleada (fase de construcción) ---------- */}
      {phase === 'build' && (
        <motion.div className="fort-buildbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="fort-forecast">
            {forecast && (
              <>
                <span className="fort-forecast-label">
                  {forecast.isBossWave ? '👑 ' : '🌊 '}Oleada {forecast.wave}:
                </span>
                {isExam ? (
                  <span className="fort-forecast-cat">{forecast.entries.length} enemigos {forecast.isBossWave ? '+ JEFE' : ''} · categorías sorpresa</span>
                ) : (
                  Object.entries(forecastByCat || {}).map(([catIdx, count]) => (
                    <span key={catIdx} className="fort-forecast-cat" style={{ '--cat': game.categories[catIdx].color }}>
                      {count} × {game.categories[catIdx].name}
                    </span>
                  ))
                )}
              </>
            )}
          </div>
          <div className="fort-buildbar-actions">
            {!isExam && (
              <button className="fort-btn-secondary" onClick={() => setOverlay({ type: 'quit' })}><Flag size={15} /> Terminar</button>
            )}
            <button className="fort-btn-launch" onClick={launchWave}><Play size={17} /> ¡Lanzar oleada!</button>
          </div>
        </motion.div>
      )}

      {/* ---------- panel torre seleccionada ---------- */}
      <AnimatePresence>
        {selectedTower && (
          <motion.div className="fort-towerpanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <span className="fort-towerpanel-name">
              {TOWER_TYPES[selectedTower.type].emoji} {TOWER_TYPES[selectedTower.type].name}
              {selectedTower.catIdx != null && (
                <span className="fort-towerpanel-cat" style={{ '--cat': game.categories[selectedTower.catIdx].color }}>
                  {game.categories[selectedTower.catIdx].name}
                </span>
              )}
              <span className="fort-towerpanel-lvl">Nv. {selectedTower.level}</span>
            </span>
            {selectedTower.level < MAX_TOWER_LEVEL ? (
              <button
                className="fort-btn-upgrade"
                disabled={hud.coins < upgradeCost(selectedTower.type, selectedTower.level)}
                onClick={doUpgrade}
              >
                <ArrowUpCircle size={15} /> Mejorar ({upgradeCost(selectedTower.type, selectedTower.level)} 🪙)
              </button>
            ) : (
              <span className="fort-towerpanel-max">⭐ Nivel máximo</span>
            )}
            <button className="fort-btn-danger" onClick={doSell}><Trash2 size={15} /> Vender (+{sellValue(selectedTower)} 🪙)</button>
            <button className="fort-hud-btn" onClick={() => setSelectedTowerId(null)}><X size={15} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- paleta de torres ---------- */}
      {phase !== 'ended' && (
        <div className="fort-palette">
          {Object.values(TOWER_TYPES).map((t) => (
            <button
              key={t.id}
              className={`fort-palette-btn ${placingType === t.id ? 'selected' : ''}`}
              disabled={hud.coins < t.cost}
              onClick={() => {
                setSelectedTowerId(null);
                setPlacingType((p) => (p === t.id ? null : t.id));
              }}
              title={t.desc}
            >
              <span className="fort-palette-emoji">{t.emoji}</span>
              <span className="fort-palette-name">{t.name}</span>
              <span className="fort-palette-cost">{t.cost} 🪙</span>
            </button>
          ))}
        </div>
      )}
      {placingType && (
        <div className="fort-placing-hint">
          {TOWER_TYPES[placingType].desc} — toca una celda libre para construir (toca el botón otra vez para cancelar)
        </div>
      )}

      {/* ---------- marcador académico discreto ---------- */}
      <div className="fort-academic">
        🎓 Aciertos: {a.correct}/{a.total}
      </div>
    </div>
  );
};

export default FortalezaGame;
