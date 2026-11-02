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
// Opcional (cuerpo humano):
//   levelFor(level, grade, subjectId)   el nivel también puede depender de la asignatura
//   languages: [{ id, label }]          idiomas del contenido (selector en la pantalla previa)
//   defaultLang(level, subjectId)       idioma inicial
//   localize(lang) → config             la configuración en ese idioma (textos, preguntas…)
//   ui                                  textos del motor (ver ./ui.js)
//   Atlas                               componente de atlas propio (mismas props que ./Atlas)
//   renderSubject(q, done)              visual de tipos de pregunta propios
//   mapHud(q, { done })                 controles propios sobre el mapa de la pregunta
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, ArrowRight, Clock, Compass, Flame, Globe2, GraduationCap, Languages, LayoutGrid, RefreshCw, Target,
} from 'lucide-react';
import InstructionsModal from '../InstructionsModal';
import {
  ConfirmDialog, FeedbackItem, GameButton, GameEmpty, GameHeader, GameLoading, GameShell, ModeSelect,
  ResultsScreen, Segmented,
} from '../kit';
import { maxRoundPoints, notaFrom } from './scoring';
import QuizPlay from './QuizPlay';
import Atlas from './Atlas';
import { mergeUi } from './ui';
import './geo.css';

export const ROUND_SIZE = 10;

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

export default function GeoQuizApp({ config, onGameComplete }) {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const lv = useMemo(() => config.levelFor(level, grade, subjectId), [config, level, grade, subjectId]);
  const [lang, setLang] = useState(() => config.defaultLang?.(level, subjectId) ?? null);
  const c = useMemo(() => (config.localize ? config.localize(lang) : config), [config, lang]);
  const ui = useMemo(() => mergeUi(c.ui), [c]);
  const shell = { ...c.shell, wide: true };

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

  const games = useMemo(() => c.games(lv), [c, lv]);
  const regions = useMemo(() => c.regions(lv), [c, lv]);
  const regionText = region !== 'all' ? c.regionLabel(region) : null;
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
    const questions = c.buildRound({ lv, region, difficulty: diff, world, lang }, gameId, ROUND_SIZE);
    trackedRef.current = false;
    liveRef.current = { exam: gameId === 'exam', startedAt: Date.now(), results: [], points: 0 };
    setRound({ id: Date.now(), gameId, questions, difficulty: diff });
    setSummary(null);
    setScreen('play');
  }, [world, config, c, lv, region, lang]);

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
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title={c.helpTitle || `Cómo se juega: ${c.title}`}>
      {c.instructions}
    </InstructionsModal>
  );

  const atlasConfig = useMemo(() => (world ? c.atlas(world, lv) : null), [world, c, lv]);
  const AtlasView = c.Atlas || Atlas;
  const atlas = atlasConfig && <AtlasView open={atlasOpen} onClose={() => setAtlasOpen(false)} world={world} atlas={atlasConfig} />;
  const openHelp = () => setShowHelp(true);
  const openAtlas = world ? () => setAtlasOpen(true) : undefined;
  const { GameArt } = c;

  if (loadError) {
    return (
      <GameShell {...shell}>
        <GameHeader onHelp={openHelp} />
        <GameEmpty title={ui.loadErrorTitle} action={<GameButton icon={RefreshCw} onClick={() => { setLoadError(false); setScreen('modes'); setReloadKey((n) => n + 1); }}>{ui.retry}</GameButton>}>
          {ui.loadErrorText}
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
      title: ui.modes[id],
      desc: typeof c.modes[id].desc === 'function' ? c.modes[id].desc(games.length) : c.modes[id].desc,
      features: c.modes[id].features,
      cta: ui.play,
    }));
    const langPicker = c.languages ? (
      <div className="gq-region gq-lang">
        <span className="gq-region__label"><Languages size={15} /> {ui.language}</span>
        <Segmented size="sm" value={lang} onChange={setLang} options={c.languages.map((l) => ({ value: l.id, label: l.label }))} />
      </div>
    ) : null;
    const regionPicker = regions ? (
      <div className="gq-region">
        <span className="gq-region__label"><Compass size={15} /> {c.regionQuestion}</span>
        <Segmented size="sm" value={region} onChange={setRegion} options={[{ value: 'all', label: c.allRegionsLabel }, ...regions.map((r) => ({ value: r.id, label: r.label }))]} />
      </div>
    ) : null;
    return (
      <GameShell {...shell}>
        <ModeSelect
          modes={modes}
          onSelect={chooseMode}
          onHelp={openHelp}
          onStudy={openAtlas}
          filters={langPicker || regionPicker ? <>{langPicker}{regionPicker}</> : null}
          extra={(
            <div className="gq-modes-extra">
              <button type="button" className="gq-atlas-cta" onClick={openAtlas} disabled={!world}>
                <span className="gq-atlas-cta__art"><GameArt game="atlas" /></span>
                <span className="gq-atlas-cta__text">
                  <strong>{c.atlasCta.title}</strong>
                  <span>{c.atlasCta.text}</span>
                </span>
                <ArrowRight size={18} />
              </button>
              <p className="gq-modes-extra__info">
                {world ? (
                  <><Globe2 size={14} /> {c.poolText(lv, region)} · {ui.gamesFor(games.length, ui.course(level, grade))}</>
                ) : ui.loadingShort}
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
        <GameLoading label={ui.loadingMap} />
      </GameShell>
    );
  }

  /* ───────── elegir minijuego ───────── */
  if (screen === 'hub') {
    return (
      <GameShell {...shell}>
        <GameHeader mode={difficulty} modeLabel={ui.modes[difficulty]} topic={regionText || undefined} onHelp={openHelp} onStudy={openAtlas} />
        <div className="gq-hub">
          <div className="gq-hub__intro">
            <h2>{ui.chooseGame}</h2>
            <p>{ui.roundInfo(ROUND_SIZE)} {regionText ? c.regionScope(region) : c.allRegionsScope}</p>
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
                {!g.usesRegion && regionText && <span className="gq-game__note">{c.ignoresRegionNote}</span>}
                <span className="gq-game__cta">{ui.play} <ArrowRight size={15} /></span>
              </motion.button>
            ))}
          </div>
          <div className="gq-hub__footer">
            <GameButton variant="soft" size="sm" icon={ArrowLeft} onClick={backToModes}>{c.changeModeLabel || ui.changeModeRegion}</GameButton>
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
          title={isExam ? ui.examDone : ui.roundDone}
          subtitle={isExam ? `${c.title}${where}` : `${gameTitle(summary.gameId)} · ${ui.modes[difficulty]}${where}`}
          nota={summary.nota}
          points={summary.points}
          stats={[
            { icon: Target, tone: 'good', label: ui.hits, value: `${summary.correct}/${ROUND_SIZE}` },
            { icon: Flame, tone: 'streak', label: ui.bestStreakLabel, value: summary.best },
            { icon: Clock, tone: 'time', label: ui.time, value: ui.fmtTime(summary.seconds) },
          ]}
          actions={isExam ? [
            { label: ui.anotherExam, onClick: again, icon: RefreshCw },
            { label: ui.changeMode, onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ] : [
            { label: ui.anotherRound, onClick: again, icon: RefreshCw },
            { label: ui.otherGame, onClick: () => setScreen('hub'), icon: LayoutGrid, variant: 'soft' },
            { label: ui.changeMode, onClick: backToModes, icon: GraduationCap, variant: 'ghost' },
          ]}
        >
          {summary.results.map((r, i) => (
            <FeedbackItem key={i} index={i + 1} ok={r.correct} title={r.q.prompt}>
              {r.correct
                ? <>{r.q.answerLabel}{r.attempt > 1 ? ui.atTry(r.attempt) : ''}</>
                : <>{ui.correctAnswer} <strong>{r.q.answerLabel}</strong> · {ui.yourAnswer} {pickedLabel(r, world)}</>}
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
          ui={ui}
          renderSubject={c.renderSubject}
          mapHud={c.mapHud}
        />
      )}
      <ConfirmDialog
        open={confirmExit}
        title={ui.abandonTitle}
        confirmLabel={ui.abandonYes}
        cancelLabel={ui.abandonNo}
        tone="danger"
        onConfirm={confirmAbandon}
        onCancel={() => setConfirmExit(false)}
      >
        {ui.abandonText}
      </ConfirmDialog>
      {instructions}
      {atlas}
    </GameShell>
  );
}
