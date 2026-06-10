// src/apps/la-fortaleza/LaFortaleza.jsx
// Contenedor de La Fortaleza: carga de datos (rosco + runner), selección de
// modo (práctica/examen), preparación determinista del contenido por seed,
// pantalla de resumen y onGameComplete. El juego en sí vive en FortalezaGame.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Castle, GraduationCap, Swords, Trophy, Star, BookOpen, Skull,
  Target, Crown, ScrollText, RotateCcw,
} from 'lucide-react';
import { getRoscoData, getRunnerData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import FortalezaGame from './FortalezaGame';
import { createSounds } from './sound';
import { mulberry32, seededShuffle, CATEGORY_COLORS, EXAM_WAVES } from './engine';
import './LaFortaleza.css';

const MIN_WORDS_PER_CAT = 4;
const MIN_QUESTIONS = 8;
const MAX_ACTIVE_CATEGORIES = 3;

const formatCategoryName = (name) => {
  const clean = String(name || '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const getSubjectInfo = (level, grade, subjectId) => {
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

/** Prepara el contenido de una partida de forma determinista a partir del seed. */
function prepareRun(seed, allCategories, allQuestions) {
  const rng = mulberry32(seed ^ 0x51ab3f);

  // 1) Categorías activas (2-3, las baraja el seed)
  const picked = seededShuffle(Object.entries(allCategories), rng)
    .slice(0, MAX_ACTIVE_CATEGORIES)
    .map(([name, words]) => ({ name: formatCategoryName(name), words }));

  // 2) Preguntas ordenadas por dificultad creciente (barajadas dentro de cada nivel)
  const byDiff = { 1: [], 2: [], 3: [] };
  allQuestions.forEach((q) => {
    const d = Math.min(Math.max(parseInt(q.difficulty, 10) || 1, 1), 3);
    byDiff[d].push(q);
  });

  const allSolutions = [...new Set(allQuestions.map((q) => q.solucion))];
  // En examen se alternan preguntas de escribir y tipo test (~50/50, por seed)
  const withOptions = (q) => {
    const distractors = seededShuffle(allSolutions.filter((s) => s !== q.solucion), rng).slice(0, 3);
    return {
      ...q,
      options: seededShuffle([q.solucion, ...distractors], rng),
      qtype: rng() < 0.5 ? 'write' : 'choice',
    };
  };

  const questions = [
    ...seededShuffle(byDiff[1], rng),
    ...seededShuffle(byDiff[2], rng),
    ...seededShuffle(byDiff[3], rng),
  ].map(withOptions);

  // 3) Preguntas de jefe: del nivel más difícil disponible
  const bossPool = byDiff[3].length ? byDiff[3] : byDiff[2].length ? byDiff[2] : byDiff[1];
  const bossQuestions = seededShuffle(bossPool, rng).map(withOptions);

  // 4) Pools por dificultad para el Desafío Relámpago (siempre tipo test)
  const pools = {
    1: seededShuffle(byDiff[1], rng).map(withOptions),
    2: seededShuffle(byDiff[2], rng).map(withOptions),
    3: seededShuffle(byDiff[3], rng).map(withOptions),
  };

  return { categories: picked, questions, bossQuestions, pools };
}

const LaFortaleza = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState({});
  const [allQuestions, setAllQuestions] = useState([]);
  const [screen, setScreen] = useState('select'); // select | playing | summary
  const [mode, setMode] = useState('practice');
  const [run, setRun] = useState(null); // {seed, categories, questions, bossQuestions}
  const [result, setResult] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [studyTab, setStudyTab] = useState('categorias');

  const sounds = useMemo(() => createSounds(), []);
  const trackedRef = useRef(false);

  // --- carga de datos: rosco (preguntas) + runner (categorías) en paralelo ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const [rosco, runner] = await Promise.all([
          getRoscoData(level, grade, asignatura),
          getRunnerData(level, grade, asignatura),
        ]);
        if (cancelled) return;
        const questions = (Array.isArray(rosco) ? rosco : [])
          .filter((q) => q?.definicion && q?.solucion)
          .map((q) => ({ definicion: String(q.definicion).trim(), solucion: String(q.solucion).trim(), difficulty: q.difficulty }));
        const cats = {};
        if (runner && typeof runner === 'object') {
          Object.entries(runner).forEach(([cat, words]) => {
            const clean = (Array.isArray(words) ? words : []).map((w) => String(w).trim()).filter(Boolean);
            if (clean.length >= MIN_WORDS_PER_CAT) cats[cat] = clean;
          });
        }
        setAllQuestions(questions);
        setAllCategories(cats);
      } catch (err) {
        console.error('LaFortaleza: error cargando datos', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- iniciar partida ---
  const startGame = useCallback((selectedMode) => {
    const seed = Math.floor(Math.random() * 2 ** 31);
    setMode(selectedMode);
    setRun({ seed, ...prepareRun(seed, allCategories, allQuestions) });
    setResult(null);
    trackedRef.current = false;
    setScreen('playing');
  }, [allCategories, allQuestions]);

  // --- fin de partida (también dispara con el parcial si se abandona el examen) ---
  const handleEnd = useCallback((data) => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    const isExam = mode === 'exam';
    onGameComplete?.({
      mode: isExam ? 'test' : 'practice',
      score: data.score,
      maxScore: isExam ? 3000 : data.score,
      correctAnswers: data.academic.correct,
      totalQuestions: Math.max(data.academic.total, 1),
      durationSeconds: data.durationSeconds || undefined,
    });
    if (data.outcome === 'abandoned') return; // desmontaje: sin setState
    if (data.outcome === 'victory') {
      confetti({ particleCount: 220, spread: 110, origin: { y: 0.5 }, colors: [...CATEGORY_COLORS, '#a855f7'] });
    }
    setResult(data);
    setScreen('summary');
  }, [mode, onGameComplete]);

  // --- derivados del resumen ---
  const nota = result ? Math.round((result.academic.correct / Math.max(result.academic.total, 1)) * 100) / 10 : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';

  // --- material de estudio ---
  const glossary = useMemo(() => {
    const groups = {};
    [...allQuestions]
      .sort((x, y) => x.solucion.localeCompare(y.solucion, 'es'))
      .forEach((q) => {
        const letter = q.solucion.charAt(0).toUpperCase();
        (groups[letter] = groups[letter] || []).push(q);
      });
    return groups;
  }, [allQuestions]);

  if (loading) {
    return <div className="fort-root"><div className="fort-card"><div className="fort-loading">🏰 Levantando murallas...</div></div></div>;
  }

  const enoughData = Object.keys(allCategories).length >= 2 && allQuestions.length >= MIN_QUESTIONS;
  if (!enoughData) {
    return (
      <div className="fort-root"><div className="fort-card">
        <div className="fort-title"><Castle size={26} /> La Fortaleza</div>
        <p className="fort-empty">Todavía no hay contenido suficiente para esta asignatura. Se necesitan al menos 2 categorías de palabras y {MIN_QUESTIONS} preguntas. ¡Vuelve pronto!</p>
      </div></div>
    );
  }

  return (
    <div className="fort-root">
      {/* ============ SELECCIÓN DE MODO ============ */}
      {screen === 'select' && (
        <motion.div className="fort-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="fort-title-row">
            <div className="fort-title"><Castle size={26} /> La Fortaleza</div>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <p className="fort-subject">{subjectInfo.icon} {subjectInfo.nombre}</p>
          <p className="fort-tagline">Defiende la Biblioteca: tus aciertos construyen torres, tu conocimiento las dispara.</p>

          <div className="fort-modes">
            <motion.button className="fort-mode practice" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startGame('practice')}>
              <span className="fort-mode-icon"><Swords size={30} /></span>
              <span className="fort-mode-name">🟢 Práctica</span>
              <span className="fort-mode-desc">Supervivencia infinita · preguntas tipo test · colores de pista · ¿hasta qué oleada llegas?</span>
            </motion.button>
            <motion.button className="fort-mode exam" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startGame('exam')}>
              <span className="fort-mode-icon"><GraduationCap size={30} /></span>
              <span className="fort-mode-name">🔴 Examen</span>
              <span className="fort-mode-desc">{EXAM_WAVES} oleadas + 2 jefes · escribir y tipo test · sin pistas · nota /10</span>
            </motion.button>
          </div>

          <button className="fort-study-btn" onClick={() => setShowStudy(true)}>
            <BookOpen size={16} /> Ver material de estudio
          </button>
        </motion.div>
      )}

      {/* ============ PARTIDA ============ */}
      {screen === 'playing' && run && (
        <FortalezaGame
          key={run.seed}
          seed={run.seed}
          mode={mode}
          categories={run.categories}
          questions={run.questions}
          bossQuestions={run.bossQuestions}
          pools={run.pools}
          sounds={sounds}
          onEnd={handleEnd}
        />
      )}

      {/* ============ RESUMEN ============ */}
      {screen === 'summary' && result && (
        <motion.div className="fort-card" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={`fort-result-banner ${result.outcome}`}>
            {result.outcome === 'victory' && <><Trophy size={40} /><h2>¡Fortaleza defendida! 🎉</h2></>}
            {result.outcome === 'defeat' && <><Skull size={40} /><h2>La Biblioteca ha caído...</h2></>}
            {result.outcome === 'finished' && <><Castle size={40} /><h2>¡Buena defensa!</h2></>}
          </div>

          {mode === 'exam' ? (
            <div className={`fort-nota ${notaColor}`}>
              <div className="fort-nota-big">{nota.toFixed(1)}<span className="fort-nota-small">/10</span></div>
              <div className="fort-nota-msg">{notaMsg}</div>
            </div>
          ) : (
            <div className="fort-wave-reached">🌊 Has llegado a la oleada <strong>{result.wave}</strong></div>
          )}

          <div className="fort-result-score"><Star size={18} /> {result.score.toLocaleString('es-ES')} puntos</div>

          <div className="fort-breakdown">
            <div className="fort-breakdown-item">
              <ScrollText size={16} />
              <span>Preguntas</span>
              <strong>{result.academic.questions.c}/{result.academic.questions.t}</strong>
            </div>
            <div className="fort-breakdown-item">
              <Target size={16} />
              <span>Clasificaciones</span>
              <strong>{result.academic.classify.c}/{result.academic.classify.t}</strong>
            </div>
            <div className="fort-breakdown-item">
              <Crown size={16} />
              <span>Jefes</span>
              <strong>{result.academic.boss.c}/{result.academic.boss.t}</strong>
            </div>
            <div className="fort-breakdown-item">
              <Swords size={16} />
              <span>Enemigos abatidos</span>
              <strong>{result.stats.kills}</strong>
            </div>
          </div>

          <div className="fort-summary-actions">
            <button className="fort-btn-launch" onClick={() => setScreen('select')}><RotateCcw size={16} /> Jugar otra vez</button>
          </div>
        </motion.div>
      )}

      {/* ============ INSTRUCCIONES ============ */}
      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="La Fortaleza">
        <h3>🏰 Objetivo</h3>
        <p>Los enemigos avanzan por el camino hacia tu <strong>Biblioteca</strong>. Si llegan, pierdes vidas. ¡Defiéndela construyendo torres!</p>

        <h3>📜 Gana monedas con lo que sabes</h3>
        <p>Antes de cada oleada respondes <strong>preguntas</strong>: cada acierto te da monedas (con bonus por racha) para construir y mejorar torres.</p>

        <h3>🗼 Torres de categoría</h3>
        <p>Cada enemigo lleva una <strong>palabra</strong> de una categoría. Las torres 🏹 ⚡ 💣 solo disparan a los enemigos de SU categoría: lee las palabras y coloca bien tus defensas. ❄️ ralentiza a cualquiera y 🔮 daña a todos.</p>
        <p>Toca una construcción para <strong>mejorarla</strong>, <strong>moverla</strong> de sitio (30 🪙) o <strong>venderla</strong> (recuperas el 75%).</p>

        <h3>🧿 El Oráculo</h3>
        <p>Construye el Oráculo y te lanzará preguntas exprés <strong>en plena oleada</strong>: acierta rápido y gana monedas y energía extra sin esperar a la siguiente fase de construcción. Solo puede haber uno.</p>

        <h3>🗡️ Caballeros aliados</h3>
        <p>La fortaleza envía <strong>caballeros</strong> que avanzan por el camino y traban combate con los enemigos, frenándolos mientras tus torres disparan. ¡Cúbrelos bien!</p>

        <h3>⛏️ ¡Cuidado con los demoledores!</h3>
        <p>Los enemigos con <strong>casco de obra</strong> se paran a destruir tus estructuras a martillazos. Las estructuras tienen vida (mejorar las repara) — si una cae, la pierdes. Puedes moverlas lejos del peligro.</p>

        <h3>⚡ Desafío Relámpago</h3>
        <p>Cada 3 oleadas puedes aceptar el desafío: <strong>encadena aciertos</strong> y cada respuesta vale más que la anterior... pero sube la dificultad y baja el tiempo. La cadena dura hasta que falles, y te llevas todos los puntos acumulados.</p>

        <h3>🎯 Disparo de precisión</h3>
        <p>Toca un enemigo y di a qué categoría pertenece su palabra. Si aciertas: <strong>golpe crítico</strong>. Si fallas: las torres de esa categoría se atascan 3 segundos.</p>

        <h3>👑 Jefes</h3>
        <p>Cada 5 oleadas llega un jefe con una pregunta difícil. Acierta a tiempo y perderá el 70% de su vida.</p>

        <h3>⚡ Energía y habilidades</h3>
        <p>Cada acierto te da <strong>energía</strong>. Gástala durante la oleada en habilidades que tú mismo apuntas sobre el campo: ☄️ <strong>Meteoro</strong> (daño en área a cualquier categoría), 🌨️ <strong>Ventisca</strong> (congela la zona) y ⚡ <strong>Rayo</strong> (fulmina al enemigo más avanzado).</p>

        <h3>🎥 Cámara</h3>
        <p>Arrastra para girar la cámara y usa la rueda o el pellizco para acercarte. Un toque corto selecciona; un arrastre orbita.</p>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Práctica</strong>oleadas infinitas · tipo test · el color del enemigo insinúa su categoría</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>{EXAM_WAVES} oleadas + 2 jefes · mezcla de escribir y tipo test · nota /10 con preguntas, clasificaciones y jefes</div>
        </div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> tu puntería no afecta a la nota — solo tus aciertos. Pero defender bien la Biblioteca multiplica tus puntos para el ranking.</div>
      </InstructionsModal>

      {/* ============ MATERIAL DE ESTUDIO ============ */}
      <InstructionsModal isOpen={showStudy} onClose={() => setShowStudy(false)} title="Material de estudio">
        <div className="fort-study-tabs">
          <button className={studyTab === 'categorias' ? 'active' : ''} onClick={() => setStudyTab('categorias')}>📦 Categorías</button>
          <button className={studyTab === 'glosario' ? 'active' : ''} onClick={() => setStudyTab('glosario')}>📖 Glosario</button>
        </div>
        {studyTab === 'categorias' ? (
          Object.entries(allCategories).map(([cat, words], i) => (
            <div key={cat} className="fort-study-cat">
              <h3 style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>{formatCategoryName(cat)}</h3>
              <div className="fort-study-words">
                {words.map((w) => <span key={w} className="fort-study-chip">{w}</span>)}
              </div>
            </div>
          ))
        ) : (
          Object.entries(glossary).map(([letter, qs]) => (
            <div key={letter} className="fort-study-letter">
              <h3>{letter}</h3>
              {qs.map((q, i) => (
                <p key={i} className="fort-study-def"><strong>{q.solucion}</strong>: {q.definicion}</p>
              ))}
            </div>
          ))
        )}
      </InstructionsModal>
    </div>
  );
};

export default LaFortaleza;
