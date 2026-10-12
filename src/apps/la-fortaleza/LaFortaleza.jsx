// src/apps/la-fortaleza/LaFortaleza.jsx
// Contenedor de La Fortaleza: carga de datos (rosco + runner), selección de
// modo (práctica/examen), preparación determinista del contenido por seed,
// pantalla de resumen y onGameComplete. El juego en sí vive en FortalezaGame.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Castle, Swords, Trophy, Skull, Target, Crown, ScrollText, Shield,
  RefreshCw, LayoutGrid, Waves, BookOpen, Library,
} from 'lucide-react';
import { getRoscoData, getRunnerData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, ModeSelect, ResultsScreen, GameLoading, GameEmpty, GameButton, Segmented,
} from '../_shared/kit';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import FortalezaGame from './FortalezaGame';
import { createSounds } from './sound';
import { mulberry32, seededShuffle, CATEGORY_COLORS, EXAM_VICTORY_LEVEL } from './engine';
import './LaFortaleza.css';

// Colores de la app (icono: torres doradas y tejados sobre cielo violeta)
const SHELL = { accent: '#a855f7', accent2: '#f59e0b', theme: 'dark', className: 'fort-shell' };
const SCOPE_STYLE = { '--gk-accent': '#a855f7', '--gk-accent-2': '#f59e0b' };

const OUTCOME = {
  victory: { title: '¡Fortaleza defendida!', icon: Trophy, tone: 'gold' },
  defeat: { title: 'La Biblioteca ha caído…', icon: Skull, tone: 'red' },
  finished: { title: '¡Buena defensa!', icon: Castle, tone: 'violet' },
};

const MIN_WORDS_PER_CAT = 4;
const MIN_QUESTIONS = 8;
// Categorías "activas" por partida: las que tienen color, generan enemigos y se
// clasifican/cubren con torres (la mecánica visual quiere pocas a la vez). El
// pool COMPLETO del curso sí alimenta las preguntas (ver buildQuestionDeck), así
// que una misma partida puede preguntar por cualquier categoría aunque solo se
// "muestren" estas. El subconjunto activo lo baraja el seed (varía entre partidas).
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

/**
 * Construye el mazo de preguntas con 5 formatos generados a partir del
 * contenido real (sin IA): definición→palabra, palabra→definición,
 * verdadero/falso, categoría de una palabra y busca el intruso.
 */
function buildQuestionDeck(rng, allQuestions, categories) {
  const deck = [];
  const allSolutions = [...new Set(allQuestions.map((q) => q.solucion))];
  const allDefs = [...new Set(allQuestions.map((q) => q.definicion))];
  const diffOf = (q) => Math.min(Math.max(parseInt(q.difficulty, 10) || 1, 1), 3);
  const mk4 = (correct, pool) => {
    const distractors = seededShuffle(pool.filter((x) => x !== correct), rng).slice(0, 3);
    return seededShuffle([correct, ...distractors], rng);
  };

  for (const q of allQuestions) {
    const d = diffOf(q);
    // 1) clásico: definición → palabra (la única escribible)
    deck.push({
      format: 'def', difficulty: d, writable: true,
      definicion: q.definicion,
      solucion: q.solucion,
      options: mk4(q.solucion, allSolutions),
    });
    // 2) inversa: palabra → su definición
    if (allDefs.length >= 4 && rng() < 0.45) {
      deck.push({
        format: 'rev', difficulty: d, writable: false,
        definicion: `¿Qué significa «${q.solucion}»?`,
        solucion: q.definicion,
        options: mk4(q.definicion, allDefs),
      });
    }
    // 3) verdadero o falso
    if (allDefs.length >= 2 && rng() < 0.3) {
      const lie = rng() < 0.5;
      const shown = lie
        ? seededShuffle(allDefs.filter((x) => x !== q.definicion), rng)[0]
        : q.definicion;
      deck.push({
        format: 'vf', difficulty: d, writable: false,
        definicion: `¿Verdadero o falso? «${q.solucion}» significa: ${shown}`,
        solucion: lie ? 'Falso' : 'Verdadero',
        options: ['Verdadero', 'Falso'],
      });
    }
  }

  // 4) y 5) preguntas de categoría con TODO el pool del curso (no solo las
  // activas). Generamos candidatas de todas las categorías y recortamos a un
  // presupuesto FIJO (independiente de N) para no inundar el mazo de preguntas
  // fáciles cuando el pool es grande. Con 3 categorías entran todas (= antes).
  if (categories.length >= 2) {
    const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    const TOTAL_CAT = 18;
    const TOTAL_INTRUSO = 12;
    const catNames = categories.map((c) => c.name);
    // nº de categorías del pool que contienen cada palabra (para descartar las
    // ambiguas: si una palabra está en 2 categorías, "¿a cuál pertenece?" no
    // tiene respuesta única)
    const wordCats = new Map();
    for (const c of categories) {
      for (const w of new Set(c.words.map(norm))) wordCats.set(w, (wordCats.get(w) || 0) + 1);
    }
    const catQs = [];
    const intrusoQs = [];
    for (const cat of categories) {
      const ownSet = new Set(cat.words.map(norm));
      // 'cat': solo palabras que pertenecen a UNA categoría (sin ambigüedad)
      const unique = cat.words.filter((w) => wordCats.get(norm(w)) === 1);
      for (const w of seededShuffle(unique, rng).slice(0, 6)) {
        catQs.push({
          format: 'cat', difficulty: 1, writable: false,
          definicion: `¿A qué categoría pertenece «${w}»?`,
          solucion: cat.name,
          options: mk4(cat.name, catNames), // 4 opciones aunque el pool sea grande
        });
      }
      // 'intruso': el intruso NUNCA puede pertenecer también a la categoría
      // preguntada (categorías con vocabulario solapado darían una respuesta falsa)
      const others = categories.filter((c) => c !== cat);
      for (let i = 0; i < 4 && cat.words.length >= 3 && others.length > 0; i++) {
        const own = seededShuffle(cat.words, rng).slice(0, 3);
        const other = others[Math.floor(rng() * others.length)];
        const candidates = other.words.filter((w) => !ownSet.has(norm(w)));
        if (candidates.length === 0) continue;
        const intruder = candidates[Math.floor(rng() * candidates.length)];
        intrusoQs.push({
          format: 'intruso', difficulty: 2, writable: false,
          definicion: `¿Cuál NO pertenece a la categoría «${cat.name}»?`,
          solucion: intruder,
          options: seededShuffle([...own, intruder], rng),
        });
      }
    }
    deck.push(...seededShuffle(catQs, rng).slice(0, TOTAL_CAT));
    deck.push(...seededShuffle(intrusoQs, rng).slice(0, TOTAL_INTRUSO));
  }
  return deck;
}

/** Prepara el contenido de una partida de forma determinista a partir del seed. */
function prepareRun(seed, allCategories, allQuestions) {
  const rng = mulberry32(seed ^ 0x51ab3f);

  // Pool COMPLETO del curso (de aquí salen las preguntas de categoría/intruso).
  // Fusiona categorías que colapsan al mismo nombre formateado (p.ej.
  // "los_animales" y "los-animales") para no duplicar opciones ni perder palabras.
  const pool = [];
  const byName = new Map();
  for (const [name, words] of Object.entries(allCategories)) {
    const fname = formatCategoryName(name);
    const existing = byName.get(fname);
    if (existing) {
      existing.words = [...new Set([...existing.words, ...words])];
    } else {
      const entry = { name: fname, words: [...words] };
      byName.set(fname, entry);
      pool.push(entry);
    }
  }

  // 1) Categorías ACTIVAS (2-3, las baraja el seed): color, enemigos y torres.
  // El resto del pool no se "muestra" pero sí alimenta el mazo de preguntas.
  const picked = seededShuffle(pool, rng).slice(0, MAX_ACTIVE_CATEGORIES);

  // 2) Mazo variado con 5 formatos, agrupado por dificultad. Las preguntas de
  // categoría/intruso usan el pool ENTERO; las palabras de enemigos, solo picked.
  const deck = buildQuestionDeck(rng, allQuestions, pool);
  // En examen, las escribibles alternan escribir/test (~50/50, por seed)
  const withQtype = (q) => ({ ...q, qtype: q.writable && rng() < 0.5 ? 'write' : 'choice' });
  const byDiff = { 1: [], 2: [], 3: [] };
  deck.forEach((q) => byDiff[q.difficulty].push(withQtype(q)));

  const questions = [
    ...seededShuffle(byDiff[1], rng),
    ...seededShuffle(byDiff[2], rng),
    ...seededShuffle(byDiff[3], rng),
  ];

  // 3) Preguntas de jefe: formato clásico del nivel más difícil disponible
  const defs = deck.filter((q) => q.format === 'def');
  const bossPool = [3, 2, 1].map((d) => defs.filter((q) => q.difficulty === d)).find((p) => p.length > 0) || defs;
  const bossQuestions = seededShuffle(bossPool, rng).map(withQtype);

  // 4) Pools por dificultad para el Desafío Relámpago (siempre tipo test)
  const pools = {
    1: seededShuffle(byDiff[1], rng),
    2: seededShuffle(byDiff[2], rng),
    3: seededShuffle(byDiff[3], rng),
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

  // La estrella de valoración (FAB global de AppRunnerPage) solo debe verse
  // en la selección de modo: en partida y resumen tapa el HUD a pantalla
  // completa. Se oculta vía clase en <body> + regla CSS (.app-rating-fab).
  useEffect(() => {
    document.body.classList.toggle('fort-in-game', screen !== 'select');
    return () => document.body.classList.remove('fort-in-game');
  }, [screen]);

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

  // --- salir a la selección de modo (el desmontaje registra el parcial) ---
  const handleExit = useCallback(() => {
    setRun(null);
    setScreen('select');
  }, []);

  // --- derivados del resumen ---
  const nota = result ? Math.round((result.academic.correct / Math.max(result.academic.total, 1)) * 100) / 10 : 0;

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

  // Modales de ayuda y estudio: comparten el ámbito oscuro del kit (sin caja)
  const modals = (
    <div className="gk-shell gk-theme-dark fort-portal" style={SCOPE_STYLE}>
      {/* ============ INSTRUCCIONES ============ */}
      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="La Fortaleza">
        <h3>🏰 Objetivo</h3>
        <p>Los enemigos salen <strong>sin parar y cada vez más rápido</strong> de <strong>mini-fortalezas enemigas</strong> conectadas a tu Biblioteca por caminos que se van uniendo. Empiezas con una sola a la vista; en el nivel 3 <strong>emerge la segunda</strong> y en el 5 la tercera — al final atacan por <strong>todos los frentes a la vez</strong>. Cada 30 segundos sube el <strong>nivel de amenaza</strong>: vigila las fortalezas nuevas y domina los cuellos de botella donde se juntan los caminos.</p>

        <h3>📜 Gana monedas con lo que sabes</h3>
        <p>Respondes <strong>preguntas de todo tipo</strong> (definiciones, qué significa una palabra, verdadero o falso, categorías, busca el intruso) antes de empezar y cada poco tiempo en plena acción: cada acierto da monedas (con bonus por racha) y energía.</p>

        <h3>🗼 Torres de categoría</h3>
        <p>Cada enemigo lleva una <strong>palabra</strong> de una categoría. Las torres 🏹 ⚡ 💣 solo disparan a los enemigos de SU categoría: lee las palabras y coloca bien tus defensas. ❄️ ralentiza a cualquiera y 🔮 daña a todos.</p>
        <p>Toca una construcción para <strong>mejorarla</strong>, <strong>moverla</strong> de sitio (30 🪙) o <strong>venderla</strong> (recuperas el 75%).</p>

        <h3>🧱 La Muralla</h3>
        <p>Se construye <strong>encima del camino</strong> y bloquea el paso: los enemigos se amontonan contra ella y la van derribando mientras tus torres los acribillan. Mejorarla la hace más resistente.</p>

        <h3>🧿 El Oráculo</h3>
        <p>Con el Oráculo construido, las preguntas sorpresa llegan <strong>casi el doble de rápido</strong>: más monedas y energía. Solo puede haber uno.</p>

        <h3>💖 El Santuario</h3>
        <p>Se desbloquea al acertar <strong>8 preguntas</strong> en la partida. Cura 1 vida a la Biblioteca cada 30 segundos y su aura ralentiza a los enemigos cercanos: colócalo cerca del final para proteger el último tramo.</p>

        <h3>🏰 Mejoras de la fortaleza</h3>
        <p>Toca la <strong>Biblioteca</strong> (o el botón del castillo 🏰 arriba) para comprar sus 3 mejoras, en orden y cada una más cara: <strong>🛡️ Muralla externa</strong> (absorbe los primeros enemigos que lleguen y recupera 1 escudo por nivel), <strong>🗼 Torretas gemelas</strong> (disparo rápido de corto alcance a cualquier categoría) y <strong>💥 Gran Cañón</strong> (recarga lenta pero devastadora en área). ¡Cada mejora transforma el aspecto de la fortaleza!</p>

        <h3>🗡️ Caballeros aliados</h3>
        <p>La fortaleza envía <strong>caballeros</strong> que avanzan por el camino y traban combate con los enemigos, frenándolos mientras tus torres disparan. ¡Cúbrelos bien!</p>

        <h3>⛏️ ¡Cuidado con los demoledores!</h3>
        <p>Los enemigos con <strong>casco de obra</strong> se paran a destruir tus estructuras a martillazos. Las estructuras tienen vida (mejorar las repara) — si una cae, la pierdes. Puedes moverlas lejos del peligro.</p>

        <h3>⚡ Desafío Relámpago</h3>
        <p>En los niveles 3, 6, 9... puedes aceptar el desafío: <strong>encadena aciertos</strong> y cada respuesta vale más que la anterior <strong>en puntos Y en monedas</strong>... pero sube la dificultad y baja el tiempo. La cadena dura hasta que falles, y te llevas todo lo acumulado.</p>

        <h3>⛵ El Mercader Errante</h3>
        <p>De vez en cuando un <strong>barco mercante</strong> atraca en la cala del sur. Tócalo antes de que zarpe y responde su pregunta difícil: si aciertas te llevas una <strong>bolsa de monedas</strong> que crece con el nivel de amenaza. Si fallas, zarpa sin trato — no pierdes nada.</p>

        <h3>⛲ El Pozo de los Deseos</h3>
        <p>En los niveles 5, 10, 15... brota un <strong>pozo encantado</strong> que dura un nivel. Lanza 25, 50 o 100 monedas, responde una pregunta difícil y el pozo te devuelve <strong>×2,5</strong>... o se queda tu apuesta si fallas. Tú decides cuánto arriesgar.</p>

        <h3>💎 La Geoda</h3>
        <p>A veces brilla una <strong>geoda</strong> junto al camino. ¡Golpéala a toques! Cada golpe suelta monedas y el quinto la <strong>revienta en una lluvia de cristales</strong>. Date prisa: se desvanece en segundos, y pararte a picar en plena oleada tiene su riesgo.</p>

        <h3>🎯 Disparo de precisión</h3>
        <p>Toca un enemigo y di a qué categoría pertenece su palabra. Si aciertas: <strong>golpe crítico</strong>. Si fallas: las torres de esa categoría se atascan 3 segundos.</p>

        <h3>👑 Jefes</h3>
        <p>En los niveles de amenaza 4, 8, 12... llega un jefe con una pregunta difícil. Acierta a tiempo y perderá el 70% de su vida.</p>

        <h3>⚡ Energía y habilidades</h3>
        <p>Cada acierto te da <strong>energía</strong>. Gástala durante la oleada en habilidades que tú mismo apuntas sobre el campo: ☄️ <strong>Meteoro</strong> (daño en área a cualquier categoría), 🌨️ <strong>Ventisca</strong> (congela la zona) y ⚡ <strong>Rayo</strong> (fulmina al enemigo más avanzado).</p>

        <h3>🎥 Cámara</h3>
        <p>Arrastra para girar la cámara y usa la rueda o el pellizco para acercarte. Un toque corto selecciona; un arrastre orbita.</p>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Práctica</strong>supervivencia sin fin · tipo test · el color del enemigo insinúa su categoría</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>aguanta hasta el nivel {EXAM_VICTORY_LEVEL} · mezcla de escribir y tipo test · nota /10 con preguntas, clasificaciones y jefes</div>
        </div>

        <h3>🏺 Reliquias</h3>
        <p>Cada 2 niveles de amenaza encontrarás una <strong>reliquia</strong>: elige 1 de 3 poderes permanentes (más alcance, murallas que se reparan, caballeros veteranos...). Cada partida tu arsenal será distinto.</p>

        <h3>🌦️ Clima de la isla</h3>
        <p>Cada partida amanece distinta: día radiante, atardecer, niebla, lluvia o noche de antorchas. Solo cambia el paisaje — tus torres funcionan igual.</p>

        <h3>⚔️ Asedio infinito</h3>
        <p>Si ganas el examen, tu nota queda <strong>sellada</strong> y puedes seguir luchando: enemigos cada vez más brutales y puntos multiplicados para el ranking. Caer en el asedio no cambia tu nota.</p>

        <div className="instr-tips"><strong>💡 Consejo:</strong> tu puntería no afecta a la nota — solo tus aciertos. Pero defender bien la Biblioteca multiplica tus puntos para el ranking.</div>
      </InstructionsModal>

      {/* ============ MATERIAL DE ESTUDIO ============ */}
      <InstructionsModal isOpen={showStudy} onClose={() => setShowStudy(false)} title="Material de estudio">
        <div className="fort-study-tabs">
          <Segmented
            options={[
              { value: 'categorias', label: 'Categorías', icon: Library },
              { value: 'glosario', label: 'Glosario', icon: BookOpen },
            ]}
            value={studyTab}
            onChange={setStudyTab}
          />
        </div>
        {studyTab === 'categorias' ? (
          Object.entries(allCategories).map(([cat, words], i) => (
            <div key={cat} className="fort-study-cat" style={{ '--cat': CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>
              <h3>{formatCategoryName(cat)}</h3>
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

  if (loading) {
    return (
      <div className="fort-root">
        <GameShell {...SHELL}>
          <GameLoading label="Levantando murallas…" />
        </GameShell>
      </div>
    );
  }

  const enoughData = Object.keys(allCategories).length >= 2 && allQuestions.length >= MIN_QUESTIONS;
  if (!enoughData) {
    return (
      <div className="fort-root">
        <GameShell {...SHELL}>
          <GameHeader onHelp={() => setShowHelp(true)} />
          <GameEmpty title="Aún no hay contenido suficiente">
            Para defender la Biblioteca se necesitan al menos 2 categorías de palabras y {MIN_QUESTIONS} preguntas
            en esta asignatura. ¡Vuelve pronto!
          </GameEmpty>
        </GameShell>
        {modals}
      </div>
    );
  }

  const academicStats = result ? [
    { icon: ScrollText, tone: 'progress', label: 'Preguntas', value: `${result.academic.questions.c}/${result.academic.questions.t}` },
    { icon: Target, tone: 'good', label: 'Clasificaciones', value: `${result.academic.classify.c}/${result.academic.classify.t}` },
    { icon: Crown, tone: 'streak', label: 'Jefes', value: `${result.academic.boss.c}/${result.academic.boss.t}` },
    { icon: Swords, tone: 'lives', label: 'Enemigos abatidos', value: result.stats.kills },
    ...(result.stats.shielded > 0 ? [{ icon: Shield, tone: 'time', label: 'Parados por la muralla', value: result.stats.shielded }] : []),
  ] : [];

  return (
    <div className="fort-root">
      {/* ============ SELECCIÓN DE MODO ============ */}
      {screen === 'select' && (
        <GameShell {...SHELL}>
          <ModeSelect
            description="Defiende la Biblioteca: tus aciertos construyen torres y tu conocimiento las dispara."
            modes={[
              {
                id: 'practice', tone: 'easy', icon: Swords, title: 'Práctica',
                desc: 'Supervivencia sin fin con preguntas tipo test. ¿Hasta qué nivel llegas?',
                features: ['Colores de pista en los enemigos', 'Sin límite de niveles'],
              },
              {
                id: 'exam', tone: 'exam', title: 'Examen',
                desc: `Aguanta hasta el nivel ${EXAM_VICTORY_LEVEL} respondiendo por escrito y tipo test, sin pistas.`,
                features: ['Nota sobre 10', 'Puntos por defender la Biblioteca'],
              },
            ]}
            onSelect={startGame}
            onHelp={() => setShowHelp(true)}
            onStudy={() => setShowStudy(true)}
            extra={<GraphicsQualitySelector className="gfxsel-on-dark fort-gfx" />}
            footer={subjectInfo.nombre ? <span className="fort-subject">{subjectInfo.icon} {subjectInfo.nombre}</span> : null}
          />
        </GameShell>
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
          onExit={handleExit}
        />
      )}

      {/* ============ RESUMEN: EXAMEN (nota /10) ============ */}
      {screen === 'summary' && result && mode === 'exam' && (
        <GameShell {...SHELL}>
          <ResultsScreen
            title={OUTCOME[result.outcome]?.title || 'Examen terminado'}
            subtitle={`La Fortaleza · ${subjectInfo.icon} ${subjectInfo.nombre}`}
            nota={nota}
            points={result.score}
            stats={academicStats}
            actions={[
              { label: 'Repetir examen', onClick: () => startGame('exam'), icon: RefreshCw },
              { label: 'Cambiar de modo', onClick: () => setScreen('select'), icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {result.endless && (
              <div className="fort-endless">
                <span className="fort-endless__ico"><Swords size={18} /></span>
                <span>
                  <strong>Asedio infinito:</strong> {result.lives > 0 ? 'aguantaste' : 'caíste en'} el nivel <strong>{result.level}</strong>.
                  La nota se selló al ganar.
                </span>
              </div>
            )}
          </ResultsScreen>
        </GameShell>
      )}

      {/* ============ RESUMEN: PRÁCTICA ============ */}
      {screen === 'summary' && result && mode !== 'exam' && (
        <GameShell {...SHELL}>
          <motion.div
            className={`fort-sum fort-sum--${OUTCOME[result.outcome]?.tone || 'violet'}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 170, damping: 20 }}
          >
            <div className="fort-sum__top">
              <span className="gk-chip gk-chip--mode gk-tone-easy"><Swords size={13} /> Práctica</span>
              <h2 className="fort-sum__title">{OUTCOME[result.outcome]?.title || '¡Partida terminada!'}</h2>
              <p className="fort-sum__subtitle">La Fortaleza · {subjectInfo.icon} {subjectInfo.nombre}</p>
            </div>
            <div className="fort-sum__hero">
              <span className="fort-sum__burst" aria-hidden="true" />
              <FortCrest level={result.level} tone={OUTCOME[result.outcome]?.tone || 'violet'} />
              <div className="fort-sum__verdict">
                <span className="fort-sum__kicker"><Waves size={16} /> Nivel de amenaza alcanzado</span>
                <strong>Nivel {result.level}</strong>
                <span className="fort-sum__points"><Trophy size={16} /> {result.score.toLocaleString('es-ES')} <small>puntos</small></span>
              </div>
            </div>
            <div className="fort-sum__stats">
              {academicStats.map((st) => (
                <div key={st.label} className={`fort-sum__stat gk-stat--${st.tone}`}>
                  <span className="gk-stat__icon"><st.icon size={15} /></span>
                  <span className="fort-sum__stat-value">{st.value}</span>
                  <span className="fort-sum__stat-label">{st.label}</span>
                </div>
              ))}
            </div>
            <div className="fort-sum__actions">
              <GameButton size="lg" icon={RefreshCw} onClick={() => startGame('practice')}>Otra partida</GameButton>
              <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={() => setScreen('select')}>Cambiar de modo</GameButton>
            </div>
          </motion.div>
        </GameShell>
      )}

      {modals}
    </div>
  );
};

// Escudo heráldico de la fortaleza con el nivel alcanzado (ilustración propia).
// Un solo ejemplar en pantalla: los ids de gradiente no se repiten.
const CREST_TONES = {
  gold: { light: '#fef3c7', base: '#f59e0b', dark: '#92400e', inner: '#78350f' },
  violet: { light: '#ede9fe', base: '#a855f7', dark: '#4c1d95', inner: '#3b0764' },
  red: { light: '#fee2e2', base: '#ef4444', dark: '#7f1d1d', inner: '#450a0a' },
};

function FortCrest({ level, tone = 'violet' }) {
  const c = CREST_TONES[tone] || CREST_TONES.violet;
  const big = String(level).length > 2;
  return (
    <svg className="fort-crest" viewBox="0 0 140 160" role="img" aria-label={`Nivel ${level}`}>
      <defs>
        <linearGradient id="fort-crest-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset=".35" stopColor={c.base} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <radialGradient id="fort-crest-inner" cx=".5" cy=".3" r=".8">
          <stop offset="0" stopColor={c.base} stopOpacity=".55" />
          <stop offset="1" stopColor={c.inner} />
        </radialGradient>
        <linearGradient id="fort-crest-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7ed" />
          <stop offset="1" stopColor="#d6b07a" />
        </linearGradient>
      </defs>
      {/* sombra */}
      <ellipse cx="70" cy="152" rx="40" ry="5" fill="#000" opacity=".28" />
      {/* almenas */}
      <g fill="url(#fort-crest-stone)" stroke="#a16207" strokeOpacity=".45" strokeWidth="1.2">
        <rect x="26" y="8" width="16" height="18" rx="2.5" />
        <rect x="62" y="4" width="16" height="22" rx="2.5" />
        <rect x="98" y="8" width="16" height="18" rx="2.5" />
      </g>
      {/* escudo */}
      <path d="M70 18 L122 30 V78 C122 112 98 134 70 146 C42 134 18 112 18 78 V30 Z" fill="url(#fort-crest-body)" />
      <path d="M70 18 L122 30 V78 C122 112 98 134 70 146 C42 134 18 112 18 78 V30 Z" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
      <path d="M70 30 L111 39.5 V78 C111 105 92 123 70 133 C48 123 29 105 29 78 V39.5 Z" fill="url(#fort-crest-inner)" />
      {/* brillo */}
      <path d="M34 44 C46 38 58 36 70 36" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* número del nivel */}
      <text
        x="70"
        y={big ? 98 : 102}
        textAnchor="middle"
        fontFamily="Fredoka, Nunito, system-ui, sans-serif"
        fontWeight="800"
        fontSize={big ? 40 : 52}
        fill="#fff"
        stroke={c.dark}
        strokeWidth="1.5"
        paintOrder="stroke"
      >
        {level}
      </text>
      {/* cinta */}
      <path d="M22 112 H118 L110 124 L118 136 H22 L30 124 Z" fill={c.dark} />
      <path d="M30 110 H110 V130 H30 Z" fill="url(#fort-crest-stone)" />
      <text x="70" y="125" textAnchor="middle" fontFamily="Fredoka, Nunito, system-ui, sans-serif" fontWeight="800" fontSize="12" letterSpacing="2" fill={c.inner}>NIVEL</text>
    </svg>
  );
}

export default LaFortaleza;
