import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConfettiProvider } from "./ConfettiProvider";
import {
  RefreshCw, Shuffle, ListChecks, Star, Target, Clock, LayoutGrid,
  SlidersHorizontal, Gamepad2, GraduationCap, ArrowUp, Gauge, ArrowDownToLine, Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRunnerData } from '../../services/gameDataService';
import { createWordPicker, runnerCategories } from './runnerWords';
import { createWorld, step as stepWorld, jump as jumpWorld, CUBE } from './runnerEngine';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Lives, GameButton, ModeSelect, ResultsScreen,
  GameLoading, GameEmpty,
} from './kit';
import './Runner.css';

// --- CONFIGURACIÓN BASE ---
// La física, los bloques de la pista y las colisiones viven en runnerEngine.js
// (sin React, probado con simulaciones); el reparto de palabras en runnerWords.js.
const DEFAULT_GRAVITY = 1;
// Suelo de la pista (px). Las entidades se colocan con left:0 / bottom:GROUND y
// se mueven con transform (ver placeAll): sin maquetar ni repintar la pista.
const GROUND = 60;
const tf = (x, y) => `translate3d(${x}px, ${-y}px, 0)`;
// Vidas: en práctica se aprende del fallo y se sigue; en examen, como siempre,
// el primer fallo termina la carrera (la nota es palabras/10).
const PRACTICE_LIVES = 3;
const GRACE_MS = 1500;       // tras perder una vida: parpadeo sin choques
const STAR_MS = 10000;       // invencibilidad de la estrella
const MISSED_SHOWN = 10;

// --- PERSONAJES --- (el aspecto de cada cubo está en Runner.css: rn-char--0/1/2)
const CHARACTERS = [
  { id: 0, name: "Clásico" },
  { id: 1, name: "Neón" },
  { id: 2, name: "Sombra" }
];

const formatCat = (name) => (name ? name.replace(/_/g, ' ').toUpperCase() : '');

// Tamaño de letra de la ficha según lo larga que sea la palabra
const itemFont = (text) => {
  if (text.length > 25) return '9px';
  if (text.length > 18) return '11px';
  if (text.length > 12) return '12.5px';
  return '14px';
};

const Runner = ({ level, grade, subjectId, onGameComplete }) => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [targetType, setTargetType] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [loadingError, setLoadingError] = useState(false);

  // Configuración de usuario
  const [configSpeed, setConfigSpeed] = useState([8]);
  const [configGravity, setConfigGravity] = useState([DEFAULT_GRAVITY]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChar, setSelectedChar] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Estado visual
  const [isInvincible, setIsInvincible] = useState(false);
  const [livesLeft, setLivesLeft] = useState(PRACTICE_LIVES);
  const [combo, setCombo] = useState(0);
  const [toast, setToast] = useState(null);           // { key, word, cat } al fallar en práctica
  const [lastMistake, setLastMistake] = useState(null); // { word, cat } o { spike: true }

  // Resultado de la última partida tal y como se registró (el resumen pinta esto).
  const [runResult, setRunResult] = useState(null);

  // Versión de la lista de entidades: React solo vuelve a pintar la pista cuando
  // aparece o desaparece algo (bloque nuevo, recogida, explosión), no en cada
  // frame. El movimiento lo aplica el bucle directamente en el DOM (transform).
  const [, setListVersion] = useState(0);
  const bumpList = useCallback(() => setListVersion((v) => v + 1), []);

  // Refs para el bucle de juego
  const isPlayingRef = useRef(false);
  const worldRef = useRef(null);
  const rotationRef = useRef(0);
  const collectedWordsRef = useRef([]);
  const missedRef = useRef([]);
  const explosionsRef = useRef([]);
  const popsRef = useRef([]);
  const bgOffsetRef = useRef(0);
  const reqRef = useRef(null);
  const gameContainerRef = useRef(null);
  const playerWrapperRef = useRef(null);
  const nodesRef = useRef(new Map());
  const gridRef = useRef(null);
  const cityRef = useRef(null);
  const charRef = useRef(null);
  const fxIdRef = useRef(1);
  const toastTimerRef = useRef(null);

  const lastTimeRef = useRef(0);
  const invincibleUntilRef = useRef(0);
  const graceUntilRef = useRef(0);
  const livesRef = useRef(PRACTICE_LIVES);
  const comboRef = useRef(0);

  // Refs de acceso rápido
  const targetTypeRef = useRef(null);
  const gameStartRef = useRef(0);
  const gameDataRef = useRef(null);
  const showHintsRef = useRef(true);

  // 1. CARGA DE DATOS DINÁMICA
  useEffect(() => {
    if (!level || !grade || !subjectId) return;

    getRunnerData(level, grade, subjectId)
      .then(data => {
        if (!data || Object.keys(data).length === 0) throw new Error("Datos no encontrados");
        setGameData(data);
        gameDataRef.current = data;
        randomizeMission(data);
        setLoadingError(false);
      })
      .catch(err => {
        console.error("Error cargando runner data:", err);
        setLoadingError(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, grade, subjectId]);

  const randomizeMission = useCallback((data = gameData) => {
    if (!data) return;
    const types = runnerCategories(data);
    if (types.length === 0) return;
    const random = types[Math.floor(Math.random() * types.length)];
    setTargetType(random);
  }, [gameData]);

  const changeMission = () => {
    if (!gameData) return;
    const types = runnerCategories(gameData);
    if (types.length === 0) return;

    const currentIndex = types.indexOf(targetType);
    const nextIndex = (currentIndex + 1) % types.length;
    setTargetType(types[nextIndex]);
  };

  useEffect(() => {
    if (gameState === 'start' && gameData) {
      randomizeMission();
    }
  }, [gameState, gameData, randomizeMission]);

  // 2. INICIO DEL JUEGO
  // `hints` llega desde la pantalla de modos (Práctica = con pistas, Examen =
  // sin pistas): es el mismo interruptor showHints de siempre.
  const startGame = (hints = showHints) => {
    if (!targetType) return;
    setShowHints(hints);

    targetTypeRef.current = targetType;
    showHintsRef.current = hints;
    setScore(0);
    gameStartRef.current = Date.now();
    setGameState('playing');
    isPlayingRef.current = true;

    worldRef.current = createWorld({
      speed: configSpeed[0],
      gravity: configGravity[0],
      // reparto de palabras de esta partida (50-60 % de la misión, ver runnerWords.js)
      picker: createWordPicker(gameDataRef.current, targetType),
      viewWidth: gameContainerRef.current?.clientWidth || 1000,
    });

    rotationRef.current = 0;
    if (charRef.current) charRef.current.style.transform = 'rotate(0deg)';
    collectedWordsRef.current = [];
    missedRef.current = [];
    explosionsRef.current = [];
    popsRef.current = [];
    invincibleUntilRef.current = 0;
    graceUntilRef.current = 0;
    livesRef.current = hints ? PRACTICE_LIVES : 1;
    comboRef.current = 0;
    setLivesLeft(livesRef.current);
    setCombo(0);
    setToast(null);
    setLastMistake(null);
    setIsInvincible(false);
    bgOffsetRef.current = 0;
    lastTimeRef.current = 0;
    bumpList();

    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = useCallback(() => {
    if (!isPlayingRef.current || !worldRef.current) return;
    if (jumpWorld(worldRef.current)) {
      rotationRef.current += 90;
      // el giro del cubo va por CSS (transition): fuera del bucle de React
      if (charRef.current) charRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // 3. EFECTOS (explosión, "+1", aviso de fallo)
  const spawnFx = (list, data, ms) => {
    const fx = { id: fxIdRef.current++, ...data };
    list.current.push(fx);
    bumpList();
    setTimeout(() => {
      list.current = list.current.filter((f) => f !== fx);
      bumpList();
    }, ms);
  };
  const spawnExplosion = (x, y) => spawnFx(explosionsRef, { x, y }, 520);
  const spawnPop = (x, y, text, tone) => spawnFx(popsRef, { x, y, text, tone }, 900);

  const showMistake = (word, cat) => {
    clearTimeout(toastTimerRef.current);
    setToast({ key: Date.now(), word, cat });
    toastTimerRef.current = setTimeout(() => setToast(null), 2600);
  };
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const gameOver = () => {
    // Una sola vez por partida: dos choques en el mismo frame llamarían dos veces.
    if (!isPlayingRef.current) return;
    isPlayingRef.current = false;
    setGameState('gameover');
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    const wordsCollected = collectedWordsRef.current?.length || 0;
    // Objetivo fijo = 10 palabras para nota 10. Ambos modos usan el mismo objetivo;
    // la diferencia es que 'test' cuenta para tareas (modo examen). El score sigue
    // creciendo sin tope para el ranking (no paras hasta morir).
    const EXAM_TARGET = 10;
    const isExam = !showHintsRef.current;
    // Bonus por rapidez en examen: presupuesto 5s/palabra
    const elapsedSec = gameStartRef.current
      ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
      : 0;
    const TIME_BUDGET = EXAM_TARGET * 5;
    const SPEED_COEF = 5;
    const timeBonus = isExam && elapsedSec > 0 && wordsCollected >= EXAM_TARGET
      ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
      : 0;
    // Puntuación viva: gameOver vive en el cierre de gameLoop capturado al llamar
    // a startGame, así que `score` (estado) sería el de la partida ANTERIOR. Las
    // palabras recogidas (ref) son exactamente la puntuación (setScore +1 a la vez).
    const finalScore = wordsCollected + timeBonus;
    setRunResult({ words: wordsCollected, elapsedSec, timeBonus, finalScore });
    onGameComplete?.({
      mode: isExam ? 'test' : 'practice',
      score: finalScore,
      maxScore: Math.max(finalScore, 1000),
      correctAnswers: wordsCollected,
      totalQuestions: EXAM_TARGET,
      durationSeconds: elapsedSec || undefined,
    });
  };

  // Choque con pincho o palabra incorrecta: con estrella o parpadeo se rompe;
  // si no, se pierde una vida (en examen solo hay una).
  const hitHazard = (ent, now) => {
    if (invincibleUntilRef.current > now) {
      ent.gone = true;
      spawnExplosion(ent.x, ent.y);
      return false;
    }
    if (graceUntilRef.current > now) return false;
    const mistake = ent.type === 'item'
      ? { word: ent.text, cat: ent.category }
      : { spike: true };
    setLastMistake(mistake);
    comboRef.current = 0;
    setCombo(0);
    livesRef.current -= 1;
    setLivesLeft(livesRef.current);
    if (livesRef.current <= 0) { gameOver(); return true; }
    graceUntilRef.current = now + GRACE_MS;
    ent.gone = true;
    spawnExplosion(ent.x, ent.y);
    if (mistake.word) showMistake(mistake.word, mistake.cat);
    gameContainerRef.current?.classList.remove('is-shake');
    void gameContainerRef.current?.offsetWidth;
    gameContainerRef.current?.classList.add('is-shake');
    return false;
  };

  // 4. BUCLE DE JUEGO
  const gameLoop = (timestamp) => {
    if (!isPlayingRef.current) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // tras una pausa (pestaña oculta) no se salta medio nivel de golpe
    if (deltaTime > 100) {
      reqRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const w = worldRef.current;
    const timeScale = deltaTime / 16.67;
    const events = stepWorld(w, timeScale);
    const now = Date.now();

    // fondo: rejilla (repite cada 50 px) y ciudad lejana en paralaje
    bgOffsetRef.current -= w.speed * timeScale * 0.5;
    if (bgOffsetRef.current <= -1200) bgOffsetRef.current += 1200;

    if (invincibleUntilRef.current > 0 && now > invincibleUntilRef.current) {
      invincibleUntilRef.current = 0;
      setIsInvincible(false);
    }

    let listChanged = false;
    for (const e of events) {
      if (e.type === 'spawn') listChanged = true;
      else if (e.type === 'despawn') {
        listChanged = true;
        for (const m of e.missed) missedRef.current.push(m.text);
      } else if (e.type === 'star') {
        e.ent.gone = true;
        invincibleUntilRef.current = now + STAR_MS;
        setIsInvincible(true);
        listChanged = true;
      } else if (e.type === 'collect') {
        e.ent.gone = true;
        collectedWordsRef.current.push(e.ent.text);
        setScore(prev => prev + 1);
        comboRef.current += 1;
        setCombo(comboRef.current);
        const c = comboRef.current;
        spawnPop(e.ent.x + e.ent.width / 2, e.ent.y + 44, c >= 3 ? `+1 · racha ${c}` : '+1', c >= 5 ? 'hot' : 'good');
        listChanged = true;
      } else if (e.type === 'spike' || e.type === 'wrong') {
        if (hitHazard(e.ent, now)) return; // fin de partida
        listChanged = true;
      }
    }

    // parpadeo mientras dura la gracia tras perder una vida
    if (playerWrapperRef.current) {
      playerWrapperRef.current.classList.toggle('is-hurt', graceUntilRef.current > now);
    }

    if (listChanged) bumpList();
    placeAll();
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  // Coloca en el DOM (transform) lo que se ha movido en este frame: jugador,
  // fondo y entidades. Sin React ni cambios de maquetación.
  const placeAll = () => {
    const w = worldRef.current;
    if (!w) return;
    const p = w.player;
    const pw = playerWrapperRef.current;
    if (pw) {
      pw.style.transform = tf(p.x, p.y);
      // derrape: partículas bajo el cubo cuando toca suelo o plataforma
      pw.classList.toggle('on-ground', p.y <= 0.1 || p.onPlatform);
    }
    const off = bgOffsetRef.current;
    if (gridRef.current) gridRef.current.style.transform = `translate3d(${off % 100}px, 0, 0)`;
    if (cityRef.current) cityRef.current.style.transform = `translate3d(${off * 0.25}px, 0, 0)`;
    const nodes = nodesRef.current;
    for (const ent of w.entities) {
      const el = nodes.get(ent.id);
      if (el) el.style.transform = tf(ent.x, ent.y);
    }
  };

  useEffect(() => {
    return () => { isPlayingRef.current = false; cancelAnimationFrame(reqRef.current); };
  }, []);

  // El marcador de invencibilidad cuenta los segundos: con el bucle fuera de
  // React hay que refrescarlo aparte (4 veces por segundo, solo mientras dura).
  useEffect(() => {
    if (!isInvincible) return undefined;
    const id = setInterval(bumpList, 250);
    return () => clearInterval(id);
  }, [isInvincible, bumpList]);

  // --- PRESENTACIÓN (rediseño 2026 con el kit, estética arcade retro) ---
  const [showInstructions, setShowInstructions] = useState(false);

  // En partida el giro lo pone jump() en charRef (style.transform); aquí solo
  // se fija el inicial, para que un re-render no lo pise.
  const renderCharacter = (charIndex, isPreview = false) => (
    <div
      ref={isPreview ? undefined : charRef}
      className={`rn-char rn-char--${charIndex} ${isInvincible && !isPreview ? 'is-invincible' : ''}`}
    >
      <span className="rn-char__eye rn-char__eye--l" />
      <span className="rn-char__eye rn-char__eye--r" />
      <span className="rn-char__mouth" />
    </div>
  );

  // Cálculo del tiempo restante de invencibilidad para el HUD
  const now = Date.now();
  const timeLeft = isInvincible ? Math.max(0, Math.ceil((invincibleUntilRef.current - now) / 1000)) : 0;

  const shellProps = { theme: 'dark', accent: '#a855f7', accent2: '#fb923c', className: 'rn' };
  const isExam = !showHints;
  const missionName = formatCat(targetType);

  const modals = (
    <>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Cómo jugar a Education Dash">
        <h3>🎯 Objetivo</h3>
        <p>
          Corre sin parar y <strong>atrapa solo las palabras de tu misión</strong>. Esquiva los pinchos y
          las palabras que no son de la misión: si tocas una, el juego te dice a qué grupo pertenece de verdad.
        </p>
        <h3>🕹️ Controles</h3>
        <ul>
          <li><kbd>Espacio</kbd> o <kbd>↑</kbd> para saltar. También puedes hacer clic o tocar la pantalla.</li>
          <li>Puedes aterrizar sobre las plataformas para llegar a las palabras altas.</li>
          <li>En los <strong>cruces</strong> hay una palabra abajo y otra arriba: decide si saltas o sigues por el suelo.</li>
          <li>Hay escalones, escaleras y plataformas que suben y bajan: mide bien el salto.</li>
          <li>La <strong>estrella</strong> te hace invencible 10 segundos: rompes pinchos y palabras incorrectas.</li>
          <li>Encadena aciertos para hacer <strong>racha</strong>. La carrera se acelera poco a poco.</li>
        </ul>
        <h3>🎓 Modos de juego</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Práctica</strong> Las palabras de la misión se ven en verde y las demás en rojo. Tienes 3 vidas.</div>
          <div className="instr-mode exam"><strong>Examen</strong> Sin colores y sin vidas extra: el primer fallo termina la carrera. 10 palabras = un 10, y bonus si eres rápido.</div>
        </div>
      </InstructionsModal>
      <InstructionsModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} title="Guía de misiones">
        <div className="rn-guide">
          {gameData && Object.entries(gameData)
            .filter(([key, words]) => key !== 'title' && key !== 'instructions' && Array.isArray(words))
            .map(([category, words]) => (
              <section key={category} className={`rn-guide__cat ${category === targetType ? 'is-current' : ''}`}>
                <h4 className="rn-guide__title">
                  {category.replace(/_/g, ' ')}
                  {category === targetType && <span className="rn-guide__now"><Target size={12} /> Tu misión</span>}
                </h4>
                <div className="rn-guide__words">
                  {words.map((word, wIdx) => <span key={wIdx} className="rn-guide__chip">{word}</span>)}
                </div>
              </section>
            ))}
        </div>
      </InstructionsModal>
    </>
  );

  if (loadingError) {
    return (
      <GameShell {...shellProps}>
        <GameHeader />
        <GameEmpty title="Error de datos">No se encontraron palabras para {subjectId}.</GameEmpty>
      </GameShell>
    );
  }
  if (!gameData) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Calentando motores…" />
      </GameShell>
    );
  }

  // --- PANTALLA PREVIA: modos + misión + personaje ---
  if (gameState === 'start') {
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={[
            { id: 'practice', tone: 'easy', icon: Gamepad2, title: 'Práctica', desc: 'Las palabras de tu misión brillan en verde; las demás, en rojo.', features: ['Pistas de color', '3 vidas', 'Te explica cada fallo'] },
            { id: 'exam', tone: 'exam', icon: GraduationCap, title: 'Examen', desc: 'Sin colores: lee cada palabra antes de saltar a por ella.', features: ['Nota sobre 10', 'Un solo fallo', 'Bonus por rapidez'] },
          ]}
          onSelect={(id) => startGame(id === 'practice')}
          onHelp={() => setShowInstructions(true)}
          onStudy={() => setShowCheatSheet(true)}
          extra={(
            <div className="rn-loadout">
              <section className="rn-loadout__box rn-loadout__box--mission">
                <span className="rn-loadout__label"><Target size={15} /> Tu misión</span>
                <div className="rn-mission-pick">
                  <span className="rn-mission-pick__name">{missionName || 'Cargando…'}</span>
                  <GameButton variant="soft" size="sm" icon={Shuffle} onClick={changeMission} aria-label="Cambiar misión" title="Cambiar misión" />
                </div>
              </section>
              <section className="rn-loadout__box">
                <span className="rn-loadout__label"><Star size={15} /> Personaje · <b>{CHARACTERS[selectedChar].name}</b></span>
                <div className="rn-chars" role="radiogroup" aria-label="Elige personaje">
                  {CHARACTERS.map((char) => (
                    <button
                      key={char.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedChar === char.id}
                      onClick={() => setSelectedChar(char.id)}
                      className={`rn-charpick ${selectedChar === char.id ? 'is-active' : ''}`}
                      title={char.name}
                    >
                      {renderCharacter(char.id, true)}
                    </button>
                  ))}
                </div>
              </section>
              <section className="rn-loadout__box rn-loadout__box--wide">
                <button type="button" className={`rn-adv-toggle ${showSettings ? 'is-open' : ''}`} onClick={() => setShowSettings(!showSettings)} aria-expanded={showSettings}>
                  <SlidersHorizontal size={15} /> Ajustes avanzados
                </button>
                {showSettings && (
                  <div className="rn-adv">
                    <label className="rn-range">
                      <span><Gauge size={14} /> Velocidad <b>{configSpeed[0]}</b></span>
                      <input type="range" min={2} max={16} step={1} value={configSpeed[0]} onChange={(e) => setConfigSpeed([Number(e.target.value)])} />
                    </label>
                    <label className="rn-range">
                      <span><ArrowDownToLine size={14} /> Gravedad <b>{configGravity[0]}</b></span>
                      <input type="range" min={0.5} max={2} step={0.1} value={configGravity[0]} onChange={(e) => setConfigGravity([Number(e.target.value)])} />
                    </label>
                  </div>
                )}
              </section>
            </div>
          )}
          footer="Espacio, ↑, clic o toque para saltar"
        />
        {modals}
      </GameShell>
    );
  }

  // --- EXAMEN TERMINADO: resumen con la nota ---
  if (gameState === 'gameover' && isExam) {
    // Mismos números que se enviaron en onGameComplete (gameOver).
    const words = runResult?.words ?? (collectedWordsRef.current?.length || 0);
    const elapsedAtEnd = runResult?.elapsedSec ?? 0;
    const EXAM_TARGET = 10;
    const nota = Math.min(10, Math.round((words / EXAM_TARGET) * 100) / 10);
    return (
      <GameShell {...shellProps}>
        <ConfettiProvider />
        <ResultsScreen
          title="¡Carrera terminada!"
          nota={nota}
          points={runResult?.finalScore ?? words}
          stats={[
            { icon: ListChecks, tone: 'good', label: 'Palabras', value: `${words}/${EXAM_TARGET}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${elapsedAtEnd}s` },
            { icon: Target, tone: 'accent', label: 'Misión', value: missionName },
          ]}
          actions={[
            { label: 'Otra carrera', onClick: () => startGame(false), icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => setGameState('start'), icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          <MistakeNote mistake={lastMistake} mission={missionName} />
          {words > 0 && (
            <div className="rn-collected">
              {collectedWordsRef.current.map((w, i) => <span key={i} className="rn-collected__chip">{w}</span>)}
            </div>
          )}
          <MissedWords words={missedRef.current} />
        </ResultsScreen>
        {modals}
      </GameShell>
    );
  }


  const w = worldRef.current;
  const entities = w ? w.entities : [];
  const player = w ? w.player : { x: 100, y: 0 };

  return (
    <GameShell {...shellProps}>
      {gameState === 'gameover' && <ConfettiProvider />}
      <GameHeader
        mode={isExam ? 'exam' : 'practice'}
        compact
        right={(
          <Hud>
            {!isExam && <Lives total={PRACTICE_LIVES} left={Math.max(0, livesLeft)} />}
            {isInvincible && <HudStat icon={Star} tone="streak" value={`${timeLeft}s`} label="Invencible" />}
            {combo >= 2 && <HudStat icon={Flame} tone="streak" value={`x${combo}`} label="Racha" />}
            <HudStat icon={ListChecks} tone="good" value={score.toString().padStart(3, '0')} label="Palabras" />
          </Hud>
        )}
      />

      <div className="rn-mission">
        <span className="rn-mission__icon"><Target size={18} /></span>
        <span className="rn-mission__text"><small>Misión · atrapa solo</small><strong>{missionName}</strong></span>
        {!isExam && (
          <span className="rn-mission__legend">
            <i className="is-good" /> Atrapa <i className="is-bad" /> Esquiva
          </span>
        )}
      </div>

      <div
        className={`rn-screen ${isInvincible ? 'is-invincible' : ''}`}
        ref={gameContainerRef}
        onAnimationEnd={(e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('is-shake'); }}
        onMouseDown={(e) => {
          if (gameState === 'playing') {
            e.preventDefault();
            jump();
          }
        }}
        onTouchStart={(e) => {
          if (gameState === 'playing') {
            e.preventDefault();
            jump();
          }
        }}
      >
        {/* Decorado: cielo synthwave con sol, montañas y ciudad lejana en paralaje */}
        <div className="rn-sky" aria-hidden="true">
          <span className="rn-sky__sun" />
          <span className="rn-sky__hills" />
          <div className="rn-city" ref={cityRef} />
        </div>
        <div className="rn-grid" ref={gridRef} aria-hidden="true" />
        <div className="rn-ground" aria-hidden="true" />

        {/* JUGADOR */}
        <div
          ref={playerWrapperRef}
          className="rn-player"
          style={{ left: 0, bottom: `${GROUND}px`, width: `${CUBE}px`, height: `${CUBE}px`, transform: tf(player.x, player.y) }}
        >
          {/* Partículas fuera del personaje para que no roten */}
          <div className="skid-particles">
            <div className="p1"></div>
            <div className="p2"></div>
            <div className="p3"></div>
          </div>
          {renderCharacter(selectedChar)}
        </div>

        {/* EXPLOSIONES y "+1" (no se mueven con la pista) */}
        {explosionsRef.current.map(exp => (
          <div key={exp.id} className="rn-boom" style={{ left: exp.x, bottom: GROUND + exp.y }} />
        ))}
        {popsRef.current.map(pop => (
          <span key={pop.id} className={`rn-pop is-${pop.tone}`} style={{ left: pop.x, bottom: GROUND + pop.y }}>{pop.text}</span>
        ))}

        {entities.map(ent => {
          if (ent.gone) return null; // recogida o rota
          // posición con transform (el bucle la actualiza en placeAll)
          const pos = { left: 0, bottom: `${GROUND}px`, transform: tf(ent.x, ent.y) };
          const reg = (el) => { if (el) nodesRef.current.set(ent.id, el); else nodesRef.current.delete(ent.id); };

          if (ent.type === 'star') {
            return (
              <div key={ent.id} ref={reg} className="rn-star" style={pos}>
                <RunnerStar />
              </div>
            );
          }
          if (ent.type === 'spike') {
            return <div key={ent.id} ref={reg} className="rn-spike" style={{ ...pos, width: `${ent.width}px`, height: `${ent.height}px` }} />;
          }
          if (ent.type === 'platform') {
            const kind = ent.lift ? 'is-lift' : ent.stair != null ? `is-stair is-stair-${ent.stair}` : '';
            return <div key={ent.id} ref={reg} className={`rn-platform ${kind}`} style={{ ...pos, width: `${ent.width}px`, height: `${ent.height}px` }} />;
          }
          if (ent.type === 'item') {
            const tone = showHintsRef.current ? (ent.valid ? 'is-good' : 'is-bad') : 'is-neutral';
            return (
              <div key={ent.id} ref={reg} className={`rn-item ${tone} ${ent.fork ? 'is-fork' : ''}`} style={{ ...pos, width: `${ent.width}px`, height: `${ent.height}px`, fontSize: itemFont(ent.text) }}>
                {ent.text}
              </div>
            );
          }
          return null;
        })}

        {/* Aviso de fallo (práctica): qué era la palabra de verdad */}
        <AnimatePresence>
          {toast && gameState === 'playing' && (
            <motion.div
              key={toast.key}
              className="rn-toast"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <strong>«{toast.word}»</strong> no es de {missionName}
              {toast.cat && <span> · es de <b>{formatCat(toast.cat)}</b></span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME OVER (práctica) */}
        {gameState === 'gameover' && (
          <motion.div
            className="rn-over"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <motion.div
              className="rn-over__card"
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              <span className="rn-over__kicker">Game over</span>
              <strong className="rn-over__title">
                {score > 0 ? <>¡{score} {score === 1 ? 'palabra' : 'palabras'}!</> : '¡Inténtalo de nuevo!'}
              </strong>
              <MistakeNote mistake={lastMistake} mission={missionName} />
              {collectedWordsRef.current.length > 0 && (
                <div className="rn-collected">
                  {collectedWordsRef.current.map((w, i) => <span key={i} className="rn-collected__chip" style={{ animationDelay: `${i * 50}ms` }}>{w}</span>)}
                </div>
              )}
              <MissedWords words={missedRef.current} />
              <div className="rn-over__actions">
                <GameButton size="lg" icon={RefreshCw} onClick={() => startGame(true)} autoFocus>Otra carrera</GameButton>
                <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={() => setGameState('start')}>Menú</GameButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="rn-jump">
        <GameButton
          variant="warning"
          size="lg"
          icon={ArrowUp}
          className="rn-jump__btn"
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
          onMouseDown={(e) => { e.preventDefault(); jump(); }}
        >
          Saltar
        </GameButton>
      </div>
      {modals}
    </GameShell>
  );
};

// Por qué terminó la carrera (para aprender del fallo)
const MistakeNote = ({ mistake, mission }) => {
  if (!mistake) return null;
  if (mistake.spike) return <p className="rn-why">Te has pinchado. ¡Salta antes de llegar a los pinchos!</p>;
  return (
    <p className="rn-why">
      <strong>«{mistake.word}»</strong> no es de {mission}
      {mistake.cat && <> · es de <b>{formatCat(mistake.cat)}</b></>}
    </p>
  );
};

// Palabras de la misión que pasaron sin recoger: repaso al terminar
const MissedWords = ({ words }) => {
  const uniq = [...new Set(words)];
  if (!uniq.length) return null;
  return (
    <div className="rn-missed">
      <span className="rn-missed__title">También eran de tu misión</span>
      <div className="rn-missed__list">
        {uniq.slice(0, MISSED_SHOWN).map((w) => <span key={w} className="rn-missed__chip">{w}</span>)}
        {uniq.length > MISSED_SHOWN && <span className="rn-missed__more">+{uniq.length - MISSED_SHOWN}</span>}
      </div>
    </div>
  );
};

// Estrella de invencibilidad (SVG con degradado, sin filtros).
const RunnerStar = () => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <defs>
      <radialGradient id="rn-star-g" cx=".38" cy=".3" r=".8">
        <stop offset="0" stopColor="#fffbe0" />
        <stop offset=".45" stopColor="#fde047" />
        <stop offset="1" stopColor="#f59e0b" />
      </radialGradient>
    </defs>
    <circle cx="20" cy="21" r="17" fill="#fde047" opacity=".22" />
    <path d="M20 3.5l4.9 10 11 1.6-8 7.8 1.9 11L20 28.7l-9.8 5.2 1.9-11-8-7.8 11-1.6z" fill="url(#rn-star-g)" stroke="#b45309" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M14 13.5c1.6-.6 3-.6 4.2.2" stroke="#fff" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export default Runner;
