import { getRoscoData, getRoscoDataGlobal } from '@/services/gameDataService';
import materiasData from '../../../public/data/materias.json';

export const GLOBAL_SUBJECT_ID = '__global__';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GRADE_PROGRESSION = [];
for (let g = 1; g <= 6; g++) GRADE_PROGRESSION.push({ level: 'primaria', grade: g });
for (let g = 1; g <= 4; g++) GRADE_PROGRESSION.push({ level: 'eso', grade: g });
for (let g = 1; g <= 2; g++) GRADE_PROGRESSION.push({ level: 'bachillerato', grade: g });

const getProgressionIndex = (level, grade) =>
  GRADE_PROGRESSION.findIndex(p => p.level === level && p.grade === Number(grade));

const GENERAL_SUBJECTS = ['lengua', 'matematicas', 'historia', 'ciencias-naturales', 'ciencias-sociales', 'biologia', 'fisica', 'geografia'];

// Mapeo retrocompat: los strings antiguos siguen llegando desde plantillas
// guardadas antes de la nueva curva. principiante≈3, intermedio≈5, avanzado≈7,
// experto≈9 — coherente con el comportamiento previo.
const LEGACY_DIFFICULTY = {
  principiante: 3,
  intermedio: 5,
  avanzado: 7,
  experto: 9,
};

export function normalizeDifficulty(d) {
  if (typeof d === 'number') return Math.max(1, Math.min(10, Math.round(d)));
  if (typeof d === 'string') {
    if (LEGACY_DIFFICULTY[d]) return LEGACY_DIFFICULTY[d];
    const n = parseInt(d, 10);
    if (!Number.isNaN(n)) return Math.max(1, Math.min(10, n));
  }
  return 7;
}

/**
 * Etiqueta humana para un nivel 1-10. Solo para UI/tooltips.
 */
export function difficultyLabel(d) {
  const n = normalizeDifficulty(d);
  if (n <= 2) return { emoji: '🟢', label: 'Muy fácil', desc: 'Repaso de cursos anteriores y cultura general.' };
  if (n <= 4) return { emoji: '🟢', label: 'Fácil',     desc: 'Mezcla de cursos anteriores con introducción al curso actual.' };
  if (n <= 6) return { emoji: '🟡', label: 'Medio',     desc: 'Asignatura del curso, dificultad moderada.' };
  if (n <= 8) return { emoji: '🟠', label: 'Difícil',   desc: 'Todo el temario del curso, dificultad alta.' };
  if (n === 9) return { emoji: '🔴', label: 'Experto',  desc: 'Curso completo + algún reto de cursos superiores.' };
  return         { emoji: '🔥', label: 'Pesadilla', desc: 'Curso al máximo y preguntas de cursos superiores.' };
}

function toValidItems(pool) {
  return (pool || [])
    .filter((it) => it && it.solucion && it.definicion)
    .map((it) => ({
      answer: String(it.solucion).trim(),
      question: String(it.definicion).trim(),
      difficulty: it.difficulty || 2,
    }))
    .filter((it) => it.answer.length > 0);
}

function buildFromPool(validItems, count) {
  if (validItems.length < 4) return [];

  const sorted = [...validItems].sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return Math.random() - 0.5;
  });

  const selected = sorted.slice(0, Math.min(count, sorted.length));
  const questions = [];

  for (const q of selected) {
    const distractors = shuffle(
      validItems.filter((x) => x.answer !== q.answer)
    ).slice(0, 3);
    if (distractors.length < 3) continue;

    const options = shuffle([q.answer, ...distractors.map((d) => d.answer)]);
    const correctIndex = options.indexOf(q.answer);

    questions.push({
      question: q.question,
      correct: q.answer,
      options,
      correctIndex,
      difficulty: q.difficulty,
    });
  }

  return questions;
}

/**
 * Devuelve los parámetros de mezcla para una dificultad 1-10.
 *
 *   prevRatio    fracción del pool venida de cursos anteriores
 *   nextRatio    fracción del pool venida de cursos superiores (solo 9-10)
 *   currentMax   tope de difficulty (1-3) en el curso actual
 *   prevMax      tope de difficulty en cursos anteriores
 *   nextMax      tope de difficulty en cursos siguientes
 *   prevWindow   cuántos cursos atrás miramos
 *   includeGeneral  si true, también añadimos cultura general (otras asigns)
 */
function difficultyMix(d) {
  const n = normalizeDifficulty(d);
  switch (n) {
    case 1:  return { prevRatio: 0.85, nextRatio: 0, currentMax: 1, prevMax: 1, nextMax: 1, prevWindow: 4, includeGeneral: true };
    case 2:  return { prevRatio: 0.70, nextRatio: 0, currentMax: 1, prevMax: 1, nextMax: 1, prevWindow: 4, includeGeneral: true };
    case 3:  return { prevRatio: 0.55, nextRatio: 0, currentMax: 1, prevMax: 2, nextMax: 1, prevWindow: 3, includeGeneral: false };
    case 4:  return { prevRatio: 0.40, nextRatio: 0, currentMax: 2, prevMax: 2, nextMax: 1, prevWindow: 3, includeGeneral: false };
    case 5:  return { prevRatio: 0.20, nextRatio: 0, currentMax: 2, prevMax: 2, nextMax: 1, prevWindow: 2, includeGeneral: false };
    case 6:  return { prevRatio: 0.00, nextRatio: 0, currentMax: 2, prevMax: 2, nextMax: 1, prevWindow: 0, includeGeneral: false };
    case 7:  return { prevRatio: 0.00, nextRatio: 0, currentMax: 3, prevMax: 2, nextMax: 1, prevWindow: 0, includeGeneral: false, currentMin: 2 };
    case 8:  return { prevRatio: 0.00, nextRatio: 0, currentMax: 3, prevMax: 2, nextMax: 2, prevWindow: 0, includeGeneral: false };
    case 9:  return { prevRatio: 0.00, nextRatio: 0.20, currentMax: 3, prevMax: 2, nextMax: 1, prevWindow: 0, includeGeneral: false, currentMin: 2 };
    case 10: return { prevRatio: 0.00, nextRatio: 0.35, currentMax: 3, prevMax: 2, nextMax: 2, prevWindow: 0, includeGeneral: false, currentMin: 2 };
    default: return { prevRatio: 0.00, nextRatio: 0, currentMax: 3, prevMax: 2, nextMax: 1, prevWindow: 0, includeGeneral: false };
  }
}

async function loadCurrentItems(level, grade, subject, maxDifficulty) {
  if (subject === GLOBAL_SUBJECT_ID) {
    return toValidItems(await getRoscoDataGlobal(level, grade, maxDifficulty));
  }
  return toValidItems(await getRoscoData(level, grade, subject, maxDifficulty));
}

async function loadAdjacentItems(level, grade, subject, courses, maxDifficulty, includeGeneral) {
  const items = [];
  for (const pc of courses) {
    if (subject === GLOBAL_SUBJECT_ID) {
      items.push(...toValidItems(await getRoscoDataGlobal(pc.level, pc.grade, maxDifficulty)));
      continue;
    }
    const subjects = materiasData[pc.level]?.[String(pc.grade)] || [];
    if (subjects.some(s => s.id === subject)) {
      items.push(...toValidItems(await getRoscoData(pc.level, pc.grade, subject, maxDifficulty)));
    }
    if (includeGeneral) {
      const toLoad = subjects
        .filter(s => GENERAL_SUBJECTS.includes(s.id) && s.id !== subject)
        .slice(0, 2);
      for (const s of toLoad) {
        items.push(...toValidItems(await getRoscoData(pc.level, pc.grade, s.id, maxDifficulty)));
      }
    }
  }
  return items;
}

/**
 * Build quiz questions con dificultad continua 1-10 y soporte para
 * asignatura global ("__global__").
 *
 * @param {string} level
 * @param {number} grade
 * @param {string} subject  ID de asignatura, o '__global__' para todas
 * @param {number} count
 * @param {number|string} battleDifficulty 1-10 (o string legacy)
 */
export async function buildQuizQuestions(level, grade, subject, count = 10, battleDifficulty = 7) {
  const mix = difficultyMix(battleDifficulty);
  const idx = getProgressionIndex(level, grade);

  let current = await loadCurrentItems(level, grade, subject, mix.currentMax);
  if (mix.currentMin) {
    const filtered = current.filter(q => q.difficulty >= mix.currentMin);
    if (filtered.length >= 4) {
      current = filtered.length >= count
        ? filtered
        : [...filtered, ...current.filter(q => !filtered.includes(q))];
    }
  }

  let prevItems = [];
  if (mix.prevWindow > 0 && idx > 0) {
    const prevCourses = GRADE_PROGRESSION.slice(Math.max(0, idx - mix.prevWindow), idx);
    prevItems = await loadAdjacentItems(level, grade, subject, prevCourses, mix.prevMax, mix.includeGeneral);
  }

  let nextItems = [];
  if (mix.nextRatio > 0 && idx >= 0 && idx + 1 < GRADE_PROGRESSION.length) {
    const nextCourses = GRADE_PROGRESSION.slice(idx + 1, Math.min(GRADE_PROGRESSION.length, idx + 3));
    nextItems = await loadAdjacentItems(level, grade, subject, nextCourses, mix.nextMax, false);
  }

  const prevCount = Math.round(count * mix.prevRatio);
  const nextCount = Math.round(count * mix.nextRatio);
  const currentCount = Math.max(0, count - prevCount - nextCount);

  const mixed = [
    ...shuffle(current).slice(0, currentCount),
    ...shuffle(prevItems).slice(0, prevCount),
    ...shuffle(nextItems).slice(0, nextCount),
  ];

  // Si alguna parte se queda corta, rellenar con cualquier pool que tenga sobra
  const allPools = [current, prevItems, nextItems];
  let cursor = 0;
  while (mixed.length < count && cursor < allPools.length * 3) {
    const pool = allPools[cursor % allPools.length];
    const extra = pool.find(c => !mixed.some(m => m.answer === c.answer));
    if (extra) mixed.push(extra);
    cursor += 1;
  }

  if (mixed.length >= 4) return buildFromPool(mixed, count);

  // Fallback: si nada cuajó, intenta el pool del curso actual a tope
  const fallback = await loadCurrentItems(level, grade, subject, 3);
  return buildFromPool(fallback, count);
}
