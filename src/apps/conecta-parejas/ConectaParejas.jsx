// src/apps/conecta-parejas/ConectaParejas.jsx
// Rediseño 2026 sobre el kit de interfaz (_shared/kit): panel de conexiones
// con fichas-enchufe (palabra) y tarjetas-toma (definición) unidas por cables
// de luz del color de cada pareja. Lógica, vidas, ayudas y tracking intactos.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Link2, RefreshCw, Eye, CheckCircle2, Timer, Trophy, Star, Check, X, Flame,
  LayoutGrid, GraduationCap, Plug,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Lives, ProgressBar, GameButton, Chip,
  ModeSelect, ResultsScreen, GameLoading, GameEmpty,
} from '../_shared/kit';
import './ConectaParejas.css';

const PAIR_COLORS = [
  '#a855f7', '#ec4899', '#10b981', '#3b82f6', '#f59e0b',
  '#06b6d4', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444',
  '#6366f1', '#84cc16',
];

const MODE_CONFIG = {
  easy:   { label: 'Fácil',   icon: '🟢', pairs: 5,  lives: Infinity, helps: { reveal: 2, check: 3 }, timer: null },
  medium: { label: 'Medio',   icon: '🟡', pairs: 8,  lives: 3,        helps: { reveal: 1, check: 1 }, timer: null },
  exam:   { label: 'Examen',  icon: '🔴', pairs: 12, lives: 2,        helps: { reveal: 1, check: 0 }, timer: 180 },
};

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

const ConectaParejas = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null);

  // Puzzle
  const [leftItems, setLeftItems] = useState([]);   // [{id, text, pairId}]
  const [rightItems, setRightItems] = useState([]);  // [{id, text, pairId}]
  const [selected, setSelected] = useState(null);    // {side:'left'|'right', id, pairId}
  const [matched, setMatched] = useState({});        // pairId → colorIndex
  const [wrongFlash, setWrongFlash] = useState(null); // {leftId, rightId}
  const [completed, setCompleted] = useState(false);

  // Stats
  const [lives, setLives] = useState(Infinity);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  const timerRef = useRef(null);
  const trackedRef = useRef(false);
  const containerRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});
  const [lines, setLines] = useState([]);

  // --- Cargar datos ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        setAllWords(
          Array.isArray(data)
            ? data.filter((it) => it?.solucion && it?.definicion && !/\s/.test(String(it.solucion).trim()))
            : []
        );
      } catch (err) {
        console.error('ConectaParejas: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Generar puzzle ---
  const generatePuzzle = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (allWords.length < cfg.pairs) return;

    const picked = shuffle(allWords).slice(0, cfg.pairs);
    const left = shuffle(picked.map((w, i) => ({
      id: `l-${i}`,
      text: String(w.solucion).trim(),
      pairId: i,
    })));
    const right = shuffle(picked.map((w, i) => ({
      id: `r-${i}`,
      text: String(w.definicion).trim(),
      pairId: i,
    })));

    setLeftItems(left);
    setRightItems(right);
    setSelected(null);
    setMatched({});
    setWrongFlash(null);
    setCompleted(false);
    setLives(cfg.lives);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimer(0);
    setHelpsRemaining({ ...cfg.helps });
    setLines([]);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [allWords, gameMode]);

  useEffect(() => {
    if (!gameMode) return; // pantalla previa: aún no hay partida
    if (!loading && allWords.length >= 5) generatePuzzle();
  }, [loading, gameMode, generatePuzzle, allWords.length]);

  // --- Timer ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!leftItems.length || completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
      if (cfg.timer) {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setCompleted(true);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [leftItems.length, completed, gameMode]);

  // --- Calcular líneas SVG entre items emparejados ---
  const recalcLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    Object.entries(matched).forEach(([pairIdStr, colorIdx]) => {
      const pairId = Number(pairIdStr);
      const leftItem = leftItems.find((it) => it.pairId === pairId);
      const rightItem = rightItems.find((it) => it.pairId === pairId);
      if (!leftItem || !rightItem) return;

      const leftEl = leftRefs.current[leftItem.id];
      const rightEl = rightRefs.current[rightItem.id];
      if (!leftEl || !rightEl) return;

      const lr = leftEl.getBoundingClientRect();
      const rr = rightEl.getBoundingClientRect();

      newLines.push({
        x1: lr.right - containerRect.left,
        y1: lr.top + lr.height / 2 - containerRect.top,
        x2: rr.left - containerRect.left,
        y2: rr.top + rr.height / 2 - containerRect.top,
        color: PAIR_COLORS[colorIdx % PAIR_COLORS.length],
      });
    });
    setLines(newLines);
  }, [matched, leftItems, rightItems]);

  useEffect(() => { recalcLines(); }, [recalcLines]);
  useEffect(() => {
    window.addEventListener('resize', recalcLines);
    return () => window.removeEventListener('resize', recalcLines);
  }, [recalcLines]);

  // --- Click en un item ---
  const handleClick = useCallback((side, item) => {
    if (completed || matched[item.pairId] !== undefined) return;

    if (!selected) {
      setSelected({ side, ...item });
      return;
    }

    // Click en el mismo lado → cambiar selección
    if (selected.side === side) {
      setSelected(selected.id === item.id ? null : { side, ...item });
      return;
    }

    // Click en lado opuesto → verificar par
    const leftPairId = side === 'left' ? item.pairId : selected.pairId;
    const rightPairId = side === 'right' ? item.pairId : selected.pairId;

    if (leftPairId === rightPairId) {
      // ¡Correcto!
      const colorIdx = Object.keys(matched).length;
      setMatched((prev) => ({ ...prev, [leftPairId]: colorIdx }));
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      const streakMultiplier = 1 + streak * 0.1;
      const refTime = MODE_CONFIG[gameMode].timer || 120;
      const timeBonus = Math.max(0, Math.round(20 * (1 - timer / refTime)));
      const gained = Math.round(100 * streakMultiplier + timeBonus);
      setScore((s) => s + gained);
      setSelected(null);
    } else {
      // ¡Incorrecto!
      const leftId = side === 'left' ? item.id : selected.id;
      const rightId = side === 'right' ? item.id : selected.id;
      setWrongFlash({ leftId, rightId });
      setWrongCount((w) => w + 1);
      setStreak(0);
      setLives((l) => l - 1);
      setSelected(null);
      setTimeout(() => setWrongFlash(null), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, matched, completed, streak, timer, timeLeft, gameMode]);

  // --- Victoria / derrota ---
  const totalPairs = leftItems.length;
  useEffect(() => {
    if (totalPairs > 0 && correctCount >= totalPairs && !completed) {
      setCompleted(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'] });
    }
  }, [correctCount, totalPairs, completed]);

  useEffect(() => {
    if (lives <= 0 && !completed) setCompleted(true);
  }, [lives, completed]);

  // --- XP tracking ---
  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? score : 0,
      maxScore: isExamMode ? totalPairs * 170 : 0,
      correctAnswers: correctCount,
      totalQuestions: totalPairs,
      durationSeconds: timer,
    });
  }, [completed, score, correctCount, totalPairs, timer, gameMode, onGameComplete]);

  // --- Ayudas ---
  const revealPair = useCallback(() => {
    if (helpsRemaining.reveal <= 0) return;
    const pending = leftItems.filter((it) => matched[it.pairId] === undefined);
    if (pending.length === 0) return;
    const pick = pending[Math.floor(Math.random() * pending.length)];
    const colorIdx = Object.keys(matched).length;
    setMatched((prev) => ({ ...prev, [pick.pairId]: colorIdx }));
    setCorrectCount((c) => c + 1);
    setHelpsRemaining((h) => ({ ...h, reveal: h.reveal - 1 }));
    setSelected(null);
  }, [helpsRemaining, leftItems, matched]);

  const checkAnswers = useCallback(() => {
    if (helpsRemaining.check <= 0) return;
    // No hay "wrong connections" en este juego — las conexiones son inmediatas
    // En su lugar, iluminamos brevemente un par no resuelto
    revealPair();
    setHelpsRemaining((h) => ({ ...h, check: h.check - 1 }));
  }, [helpsRemaining, revealPair]);

  // Volver a la pantalla de modos dejando el tablero como al montar: así, al
  // elegir otro modo, ni el cronómetro ni el tracking ven la partida anterior.
  const backToModes = () => {
    setGameMode(null);
    setLeftItems([]);
    setRightItems([]);
    setSelected(null);
    setMatched({});
    setLines([]);
    setCompleted(false);
    setLives(Infinity);
    setCorrectCount(0);
  };

  // --- Derivados ---
  // En la pantalla previa (gameMode null) se usa la config fácil solo para pintar.
  const cfg = MODE_CONFIG[gameMode] || MODE_CONFIG.easy;
  const isExam = gameMode === 'exam';
  const isWon = completed && correctCount >= totalPairs;
  const nota = totalPairs > 0 ? Math.round((correctCount / totalPairs) * 100) / 10 : 0;
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Conecta Parejas">
      <h3>🎯 Objetivo</h3>
      <p>Une cada <strong>palabra</strong> de la columna izquierda con su <strong>definición</strong> correcta de la columna derecha.</p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Haz click en un elemento de cualquier columna para seleccionarlo.</li>
        <li>Luego click en el elemento de la otra columna que creas que es su pareja.</li>
        <li>Si aciertas: se unen con una <strong>línea de color</strong> y ambos se bloquean.</li>
        <li>Si fallas: flash rojo y pierdes una vida (si aplica).</li>
        <li>Puedes cambiar de selección haciendo click en otro elemento del mismo lado.</li>
      </ul>

      <h3>🎓 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>🟢 Fácil</strong>5 pares · Sin límite de vidas · 2 reveals + 3 pistas</div>
        <div className="instr-mode medium"><strong>🟡 Medio</strong>8 pares · 3 vidas · 1 reveal + 1 pista</div>
        <div className="instr-mode exam"><strong>🔴 Examen</strong>12 pares · 2 vidas · 3 min · 1 reveal · Nota /10</div>
      </div>

      <div className="instr-tips"><strong>💡 Consejo:</strong> empieza por las parejas que tengas más claras. Cada acierto consecutivo aumenta tu multiplicador de puntos.</div>
    </InstructionsModal>
  );

  const shellProps = { accent: '#d946ef', accent2: '#8b5cf6', className: 'cp-shell' };

  // --- Render ---
  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Tendiendo los cables…" />
      </GameShell>
    );
  }

  if (allWords.length < 5) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Faltan palabras">No hay suficientes palabras para esta asignatura.</GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo ---
  if (!gameMode) {
    const modes = [
      {
        id: 'easy', tone: 'easy', title: 'Fácil',
        desc: 'Cinco parejas sin límite de vidas para empezar.',
        features: ['5 parejas · vidas sin límite', '2 revelados + 3 pistas'],
      },
      {
        id: 'medium', tone: 'medium', title: 'Medio',
        desc: 'Ocho parejas y tres vidas: piensa antes de unir.',
        features: ['8 parejas · 3 vidas', '1 revelado + 1 pista'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Doce parejas, dos vidas y tres minutos.',
        features: ['Nota sobre 10', '12 parejas · 3 min', '1 revelado'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect modes={modes} onSelect={(id) => setGameMode(id)} onHelp={() => setShowHelp(true)} />
        {instructions}
      </GameShell>
    );
  }

  // --- Examen terminado ---
  if (completed && isExam) {
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title={isWon ? '¡Todas conectadas!' : 'Examen terminado'}
          subtitle={`Conecta Parejas · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={score}
          stats={[
            { icon: Link2, tone: 'good', label: 'Parejas', value: `${correctCount}/${totalPairs}` },
            { icon: X, tone: 'bad', label: 'Fallos', value: wrongCount },
            { icon: Timer, tone: 'time', label: 'Tiempo', value: formatTime(timer) },
            { icon: Flame, tone: 'streak', label: 'Mejor racha', value: maxStreak },
          ]}
          actions={[
            { label: 'Jugar otra vez', onClick: generatePuzzle, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        />
        {instructions}
      </GameShell>
    );
  }

  const renderItem = (side, item) => {
    const isMatched = matched[item.pairId] !== undefined;
    const isSelected = selected?.id === item.id;
    const isWrongItem = side === 'left' ? wrongFlash?.leftId === item.id : wrongFlash?.rightId === item.id;
    const color = isMatched ? PAIR_COLORS[matched[item.pairId] % PAIR_COLORS.length] : null;
    const refs = side === 'left' ? leftRefs : rightRefs;
    return (
      <motion.button
        key={item.id}
        type="button"
        ref={(el) => { refs.current[item.id] = el; }}
        className={[
          'cp-item',
          side === 'left' ? 'is-word' : 'is-def',
          isMatched && 'is-matched',
          isSelected && 'is-selected',
          isWrongItem && 'is-wrong',
        ].filter(Boolean).join(' ')}
        style={isMatched ? { '--pair': color } : undefined}
        onClick={() => handleClick(side, item)}
        disabled={isMatched}
        whileTap={{ scale: 0.97 }}
        layout
      >
        <span className="cp-item__text">{item.text}</span>
        <span className="cp-item__socket" aria-hidden="true" />
        {isMatched && <span className="cp-item__ok" aria-hidden="true"><Check size={12} strokeWidth={3.5} /></span>}
      </motion.button>
    );
  };

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={gameMode}
        modeLabel={cfg.label}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {cfg.timer && !completed && (
              <HudStat icon={Timer} tone={timeLeft <= 30 ? 'bad' : 'time'} value={formatTime(timeLeft)} label="Tiempo" />
            )}
            {cfg.lives !== Infinity && (
              <span className="cp-lives"><Lives total={Math.min(cfg.lives, 5)} left={Math.max(0, lives)} /></span>
            )}
            <HudStat icon={Link2} tone="good" value={`${correctCount}/${totalPairs}`} label="Parejas" />
            <HudStat icon={Star} tone="score" value={score.toLocaleString('es-ES')} label="Puntos" />
          </Hud>
        )}
      />

      {cfg.timer && !completed && (
        <div className={`cp-timebar ${timeLeft <= 30 ? 'is-danger' : ''}`}>
          <ProgressBar value={timeLeft} max={cfg.timer} tone={timeLeft <= 30 ? 'bad' : timeLeft <= 90 ? 'warn' : 'good'} label="Tiempo restante" />
        </div>
      )}

      {/* --- Partida de práctica terminada --- */}
      {completed && (
        <motion.div
          className={`cp-finish ${isWon ? 'is-won' : 'is-lost'}`}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <span className="cp-finish__badge" aria-hidden="true">{isWon ? <Trophy size={40} /> : <Plug size={38} />}</span>
          <h2 className="cp-finish__title">{isWon ? '¡Todas conectadas!' : '¡Se acabó!'}</h2>
          <div className="cp-finish__score">
            <strong>{score.toLocaleString('es-ES')}</strong>
            <span>puntos</span>
          </div>
          <div className="cp-finish__stats">
            <Chip tone="good" icon={Check}>{correctCount}/{totalPairs} pares</Chip>
            <Chip tone="bad" icon={X}>{wrongCount} fallos</Chip>
            <Chip tone="soft" icon={Timer}>{formatTime(timer)}</Chip>
            {maxStreak > 1 && <Chip tone="soft" icon={Flame}>Racha: {maxStreak}</Chip>}
          </div>
          <div className="cp-finish__actions">
            <GameButton size="lg" icon={RefreshCw} onClick={generatePuzzle}>Jugar otra vez</GameButton>
            <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={backToModes}>Cambiar de modo</GameButton>
          </div>
        </motion.div>
      )}

      {/* --- Panel de conexiones --- */}
      {!completed && leftItems.length > 0 && (
        <>
          <div className={`cp-board ${selected ? `has-selection from-${selected.side}` : ''}`} ref={containerRef}>
            <svg className="cp-wires" aria-hidden="true">
              {lines.map((line, i) => {
                const mx = (line.x1 + line.x2) / 2;
                const d = `M ${line.x1} ${line.y1} C ${mx} ${line.y1}, ${mx} ${line.y2}, ${line.x2} ${line.y2}`;
                return (
                  <g key={i} className="cp-wire" style={{ '--pair': line.color }}>
                    <path d={d} className="cp-wire__glow" />
                    <path d={d} className="cp-wire__core" />
                    <path d={d} className="cp-wire__shine" />
                    <circle cx={line.x1} cy={line.y1} r="5" className="cp-wire__end" />
                    <circle cx={line.x2} cy={line.y2} r="5" className="cp-wire__end" />
                  </g>
                );
              })}
            </svg>

            <div className="cp-col is-left">
              <div className="cp-col__title">Palabra</div>
              {leftItems.map((item) => renderItem('left', item))}
            </div>

            <div className="cp-col is-right">
              <div className="cp-col__title">Definición</div>
              {rightItems.map((item) => renderItem('right', item))}
            </div>
          </div>

          <div className="cp-tools">
            <GameButton variant="soft" size="sm" icon={Eye} onClick={revealPair} disabled={helpsRemaining.reveal <= 0}>
              Revelar par
              {helpsRemaining.reveal > 0 && <span className="cp-count">{helpsRemaining.reveal}</span>}
            </GameButton>
            {helpsRemaining.check > 0 && (
              <GameButton variant="soft" size="sm" icon={CheckCircle2} onClick={checkAnswers} disabled={helpsRemaining.check <= 0}>
                Pista extra
                <span className="cp-count">{helpsRemaining.check}</span>
              </GameButton>
            )}
            <GameButton variant="ghost" size="sm" icon={RefreshCw} onClick={generatePuzzle}>Nuevo</GameButton>
            {!isExam ? (
              <GameButton variant="ghost" size="sm" icon={LayoutGrid} onClick={backToModes}>Cambiar modo</GameButton>
            ) : (
              <span className="cp-tools__info"><GraduationCap size={14} /> Examen · {cfg.pairs} parejas · 2 vidas</span>
            )}
          </div>
        </>
      )}

      {instructions}
    </GameShell>
  );
};

export default ConectaParejas;
