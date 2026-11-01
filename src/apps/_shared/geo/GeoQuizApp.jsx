// App de mapas configurable (Explorador del Mundo, Explorador de España).
// Pantalla previa de modos (Fácil / Medio / Examen) con filtro de región,
// elección de minijuego, partida (QuizPlay), resultados y atlas. Fácil y Medio
// = práctica por minijuego; Examen = 10 preguntas mezcladas con nota /10.
//
// `config` (lo define cada app):
//   title, shell: { accent, accent2 }
//   load() → Promise<world>            mapa base (se cachea en la app)
//   prepare?(gameId, world) → Promise   datos extra de un minijuego (relieve)
//   levelFor(level, grade) → nivel      nivel de contenido del curso
//   games(lv) → [{ id, title, desc, usesRegion }]
//   regions(lv) → [{ id, label }] | null; regionLabel(id); regionQuestion
//   poolText(lv, region) → texto        "51 países en juego"
//   buildRound({ lv, region, difficulty, world }, gameId, n) → preguntas
//   modes: { easy, medium, exam: { desc, features } }
//   instructions: ReactNode; atlas(world) → config del Atlas; atlasCta: { title, text }
//   GameArt({ game })                   ilustración de cada minijuego
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, ArrowRight, Clock, Compass, Flame, Globe2, GraduationCap, LayoutGrid, RefreshCw, Target,
} from 'lucide-react';
import InstructionsModal from '../InstructionsModal';
import {
  ConfirmDialog, FeedbackItem, GameButton, GameEmpty, GameHeader, GameLoading, GameShell, ModeSelect,
  ResultsScreen, Segmented,
} from '../kit';
import { maxRoundPoints, notaFrom } from './scoring';
import QuizPlay from './QuizPlay';
import Atlas from './Atlas';
import './geo.css';

export const ROUND_SIZE = 10;
const MODE_TITLE = { easy: 'Fácil', medium: 'Medio', exam: 'Examen' };

// Texto de la respuesta del alumno para el resumen.
export function pickedLabel(r, world) {
  if (r.picked == null) return '—';
  if (r.q.kind === 'choice') return r.q.options.find((o) => o.key === r.picked)?.label ?? r.picked;
  if (r.q.kind === 'locate-group') {
    const e = world?.layer(r.q.layer).get(r.picked);
    return e ? world.groupName(e.cont) : '—';
  }
  return world?.nameOf(r.picked) || '—';
}

const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${Math.round(s)} s`);

const courseText = (level, grade) => (level === 'primaria' ? `${grade}.º de Primaria` : level === 'eso' ? `${grade}.º de ESO` : level === 'bachillerato' ? `${grade}.º de Bachillerato` : 'tu curso');

export default function GeoQuizApp({ config, onGameComplete }) {
  const { level, grade: gradeParam } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const lv = useMemo(() => config.levelFor(level, grade), [config, level, grade]);
  const shell = { ...config.shell, wide: true };

  const [world, setWorld] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [difficulty, setDifficulty] = useState(null); // null = pantalla previa de modos
  const [region, setRegion] = useState('all');
  const [screen, setScreen] = useState('modes'); // modes | hub | pending | play | results
  const [pendingGame, setPendingGame] = useState(null);
  const [round, setRound] = useState(null); // { id, gameId, questions }
  const [summary, setSummary] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  // Tracking: una llamada por partida (CLAUDE.md §5).
  const trackedRef = useRef(true);
  const liveRef = useRef(null); // { exam, startedAt, results, points }
  const onGameCompleteRef = useRef(onGameComplete);
  useEffect(() => { onGameCompleteRef.current = onGameComplete; }, [onGameComplete]);

  useEffect(() => {
    let alive = true;
    setLoadError(false);
    config.load()
      .then((w) => { if (alive) setWorld(w); })
      .catch((err) => {
        console.error(`${config.title}: no se pudo cargar el mapa`, err);
        if (alive) setLoadError(true);
      });
    return () => { alive = false; };
  }, [config, reloadKey]);

  const games = useMemo(() => config.games(lv), [config, lv]);
  const regions = useMemo(() => config.regions(lv), [config, lv]);
  const regionText = region !== 'all' ? config.regionLabel(region) : null;
  const gameTitle = useCallback((id) => games.find((g) => g.id === id)?.title || '', [games]);

  const report = useCallback((live, total) => {
    if (trackedRef.current || !live) return;
    trackedRef.current = true;
    const correct = live.results.filter((r) => r.correct).length;
    const durationSeconds = Math.round((Date.now() - live.startedAt) / 1000);
    if (live.exam) {
      onGameCompleteRef.current?.({
        mode: 'test',
        score: live.points,
        maxScore: maxRoundPoints(total),
        correctAnswers: correct,
        totalQuestions: total,
        durationSeconds,
        nota: notaFrom(correct, total),
      });
    } else {
      onGameCompleteRef.current?.({
        mode: 'practice',
        score: 0,
        maxScore: 0,
        correctAnswers: correct,
        totalQuestions: total,
        durationSeconds,
      });
    }
  }, []);

  // Si el alumno se va a mitad de examen, cuenta lo que lleva (lo no
  // contestado, como fallo), igual que Ahorcado.
  useEffect(() => () => {
    const live = liveRef.current;
    if (live?.exam && live.results.length > 0) report(live, ROUND_SIZE);
  }, [report]);

  const startRound = useCallback(async (gameId, diff) => {
    if (!world) {
      setPendingGame({ gameId, diff });
      setScreen('pending');
      return;
    }
    try {
      if (config.prepare) {
        setScreen('pending');
        await config.prepare(gameId, world, lv);
      }
    } catch (err) {
      console.error(`${config.title}: no se pudieron cargar los datos del minijuego`, err);
      setLoadError(true);
      return;
    }
    const questions = config.buildRound({ lv, region, difficulty: diff, world }, gameId, ROUND_SIZE);
    trackedRef.current = false;
    liveRef.current = { exam: gameId === 'exam', startedAt: Date.now(), results: [], points: 0 };
    setRound({ id: Date.now(), gameId, questions, difficulty: diff });
    setSummary(null);
    setScreen('play');
  }, [world, config, lv, region]);

  // Un minijuego pedido antes de que el mapa terminara de cargar.
  useEffect(() => {
    if (screen === 'pending' && pendingGame && world) {
      const { gameId, diff } = pendingGame;
      setPendingGame(null);
      startRound(gameId, diff);
    }
  }, [screen, pendingGame, world, startRound]);

  const onProgress = useCallback((live) => {
    if (!liveRef.current) return;
    liveRef.current = { ...liveRef.current, results: live.results, points: live.points };
  }, []);

  const onFinish = useCallback((live) => {
    const base = liveRef.current;
    const merged = { ...base, results: live.results, points: live.points };
    liveRef.current = null;
    report(merged, ROUND_SIZE);
    const correct = live.results.filter((r) => r.correct).length;
    const nota = notaFrom(correct, ROUND_SIZE);
    setSummary({
      exam: base?.exam,
      gameId: round?.gameId,
      results: live.results,
      points: live.points,
      best: live.best,
      correct,
      nota,
      seconds: (Date.now() - (base?.startedAt || Date.now())) / 1000,
    });
    setScreen('results');
    if (nota >= 8) {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.55 }, colors: ['#0ea5e9', '#10b981', '#fbbf24', '#8b5cf6', '#ec4899'] });
    }
  }, [report, round]);

  const chooseMode = (id) => {
    setDifficulty(id);
    if (id === 'exam') startRound('exam', 'exam');
    else setScreen('hub');
  };

  const backToModes = () => {
    liveRef.current = null;
    setScreen('modes');
    setDifficulty(null);
    setRound(null);
  };

  const exitPlay = () => {
    if (round?.gameId === 'exam') {
      setConfirmExit(true);
      return;
    }
    liveRef.current = null;
    setScreen('hub');
  };

  const confirmAbandon = () => {
    const live = liveRef.current;
    if (live?.results.length) report(live, ROUND_SIZE);
    liveRef.current = null;
    setConfirmExit(false);
    backToModes();
  };

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={`Cómo se juega: ${config.title}`}>
      {config.instructions}
    </InstructionsModal>
  );

  const atlasConfig = useMemo(() => (world ? config.atlas(world) : null), [world, config]);
  const atlas = atlasConfig && <Atlas open={atlasOpen} onClose={() => setAtlasOpen(false)} world={world} atlas={atlasConfig} />;
  const openHelp = () => setShowHelp(true);
  const openAtlas = world ? () => setAtlasOpen(true) : undefined;
  const { GameArt } = config;

  if (loadError) {
    return (
      <GameShell {...shell}>
        <GameHeader onHelp={openHelp} />
        <GameEmpty title="No se ha podido cargar el mapa" action={<GameButton icon={RefreshCw} onClick={() => { setLoadError(false); setScreen('modes'); setReloadKey((n) => n + 1); }}>Reintentar</GameButton>}>
          Revisa la conexión a internet y vuelve a intentarlo.
        </GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  /* ───────── pantalla previa: modos ───────── */
  if (screen === 'modes') {
    const modes = ['easy', 'medium', 'exam'].map((id) => ({
      id,
      tone: id,
      title: MODE_TITLE[id],
      desc: typeof config.modes[id].desc === 'function' ? config.modes[id].desc(games.length) : config.modes[id].desc,
      features: config.modes[id].features,
    }));
    return (
      <GameShell {...shell}>
        <ModeSelect
          modes={modes}
          onSelect={chooseMode}
          onHelp={openHelp}
          onStudy={openAtlas}
          filters={regions ? (
            <div className="gq-region">
              <span className="gq-region__label"><Compass size={15} /> {config.regionQuestion}</span>
              <Segmented size="sm" value={region} onChange={setRegion} options={[{ value: 'all', label: config.allRegionsLabel }, ...regions.map((r) => ({ value: r.id, label: r.label }))]} />
            </div>
          ) : null}
          extra={(
            <div className="gq-modes-extra">
              <button type="button" className="gq-atlas-cta" onClick={openAtlas} disabled={!world}>
                <span className="gq-atlas-cta__art"><GameArt game="atlas" /></span>
                <span className="gq-atlas-cta__text">
                  <strong>{config.atlasCta.title}</strong>
                  <span>{config.atlasCta.text}</span>
                </span>
                <ArrowRight size={18} />
              </button>
              <p className="gq-modes-extra__info">
                {world ? (
                  <><Globe2 size={14} /> {config.poolText(lv, region)} · {games.length} minijuegos para {courseText(level, grade)}</>
                ) : 'Cargando el mapa…'}
              </p>
            </div>
          )}
        />
        {instructions}
        {atlas}
      </GameShell>
    );
  }

  if (!world || screen === 'pending') {
    return (
      <GameShell {...shell}>
        <GameLoading label="Desplegando el mapa…" />
      </GameShell>
    );
  }

  /* ───────── elegir minijuego ───────── */
  if (screen === 'hub') {
    return (
      <GameShell {...shell}>
        <GameHeader mode={difficulty} modeLabel={MODE_TITLE[difficulty]} topic={regionText || undefined} onHelp={openHelp} onStudy={openAtlas} />
        <div className="gq-hub">
          <div className="gq-hub__intro">
            <h2>Elige un minijuego</h2>
            <p>Cada ronda tiene {ROUND_SIZE} preguntas. {regionText ? `Jugarás con ${config.regionScope(region)}.` : config.allRegionsScope}</p>
          </div>
          <div className="gq-hub__grid">
            {games.map((g, i) => (
              <motion.button
                key={g.id}
                type="button"
                className={`gq-game gq-game--${g.tint || g.id}`}
                onClick={() => startRound(g.id, difficulty)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="gq-game__art"><GameArt game={g.id} /></span>
                <span className="gq-game__title">{g.title}</span>
                <span className="gq-game__desc">{g.desc}</span>
                {!g.usesRegion && regionText && <span className="gq-game__note">{config.ignoresRegionNote}</span>}
                <span className="gq-game__cta">Jugar <ArrowRight size={15} /></span>
              </motion.button>
            ))}
          </div>
          <div className="gq-hub__footer">
            <GameButton variant="soft" size="sm" icon={ArrowLeft} onClick={backToModes}>Cambiar modo o región</GameButton>
          </div>
        </div>
        {instructions}
        {atlas}
      </GameShell>
    );
  }

  /* ───────── resultados ───────── */
  if (screen === 'results' && summary) {
    const isExam = summary.exam;
    const again = () => startRound(isExam ? 'exam' : summary.gameId, isExam ? 'exam' : difficulty);
    const where = regionText ? ` · ${regionText}` : '';
    return (
      <GameShell {...shell}>
        <ResultsScreen
          mode={isExam ? 'exam' : difficulty}
          title={isExam ? 'Examen terminado' : '¡Ronda terminada!'}
          subtitle={isExam ? `${config.title}${where}` : `${gameTitle(summary.gameId)} · ${MODE_TITLE[difficulty]}${where}`}
          nota={summary.nota}
          points={summary.points}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${summary.correct}/${ROUND_SIZE}` },
            { icon: Flame, tone: 'streak', label: 'Mejor racha', value: summary.best },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: fmtTime(summary.seconds) },
          ]}
          actions={isExam ? [
            { label: 'Otro examen', onClick: again, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ] : [
            { label: 'Otra ronda', onClick: again, icon: RefreshCw },
            { label: 'Otro minijuego', onClick: () => setScreen('hub'), icon: LayoutGrid, variant: 'soft' },
            { label: 'Cambiar de modo', onClick: backToModes, icon: GraduationCap, variant: 'ghost' },
          ]}
        >
          {summary.results.map((r, i) => (
            <FeedbackItem key={i} index={i + 1} ok={r.correct} title={r.q.prompt}>
              {r.correct
                ? <>{r.q.answerLabel}{r.attempt > 1 ? ` · al ${r.attempt}.º intento` : ''}</>
                : <>Respuesta correcta: <strong>{r.q.answerLabel}</strong> · Tu respuesta: {pickedLabel(r, world)}</>}
              {r.q.explain ? <span className="gq-fb-note"> · {r.q.explain}</span> : null}
            </FeedbackItem>
          ))}
        </ResultsScreen>
        {instructions}
        {atlas}
      </GameShell>
    );
  }

  /* ───────── partida ───────── */
  return (
    <GameShell {...shell}>
      {round && (
        <QuizPlay
          key={round.id}
          world={world}
          questions={round.questions}
          difficulty={round.difficulty}
          gameTitle={gameTitle(round.gameId)}
          gameTitleOf={gameTitle}
          regionLabel={regionText}
          paused={atlasOpen || showHelp || confirmExit}
          onProgress={onProgress}
          onFinish={onFinish}
          onExit={exitPlay}
          onHelp={openHelp}
          onStudy={openAtlas}
        />
      )}
      <ConfirmDialog
        open={confirmExit}
        title="¿Abandonar el examen?"
        confirmLabel="Sí, abandonar"
        cancelLabel="Seguir con el examen"
        tone="danger"
        onConfirm={confirmAbandon}
        onCancel={() => setConfirmExit(false)}
      >
        Se guardará la nota con lo que llevas: las preguntas sin contestar cuentan como fallo.
      </ConfirmDialog>
      {instructions}
      {atlas}
    </GameShell>
  );
}
