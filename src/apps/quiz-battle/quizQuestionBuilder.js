import { getRoscoData } from '@/services/gameDataService';
import materiasData from '../../../public/data/materias.json';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Progresión ordinal de cursos */
const GRADE_PROGRESSION = [];
for (let g = 1; g <= 6; g++) GRADE_PROGRESSION.push({ level: 'primaria', grade: g });
for (let g = 1; g <= 4; g++) GRADE_PROGRESSION.push({ level: 'eso', grade: g });
for (let g = 1; g <= 2; g++) GRADE_PROGRESSION.push({ level: 'bachillerato', grade: g });

const getProgressionIndex = (level, grade) =>
  GRADE_PROGRESSION.findIndex(p => p.level === level && p.grade === Number(grade));

const GENERAL_SUBJECTS = ['lengua', 'matematicas', 'historia', 'ciencias-naturales', 'ciencias-sociales', 'biologia', 'fisica', 'geografia'];

/**
 * Convierte items crudos del rosco en formato de pregunta válida.
 */
function toValidItems(pool) {
  return pool
    .filter((it) => it && it.solucion && it.definicion)
    .map((it) => ({
      answer: String(it.solucion).trim(),
      question: String(it.definicion).trim(),
      difficulty: it.difficulty || 2,
    }))
    .filter((it) => it.answer.length > 0);
}

/**
 * Genera preguntas tipo test a partir de un pool de items válidos.
 */
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
 * Build quiz questions with difficulty-based mixing.
 *
 * @param {string} level
 * @param {number} grade
 * @param {string} subject
 * @param {number} count
 * @param {'principiante'|'intermedio'|'avanzado'|'experto'} battleDifficulty
 */
export async function buildQuizQuestions(level, grade, subject, count = 10, battleDifficulty = 'experto') {
  const currentIndex = getProgressionIndex(level, grade);

  if (battleDifficulty === 'experto') {
    // Solo asignatura + curso actual, todas las dificultades
    const pool = await getRoscoData(level, grade, subject, 3);
    return buildFromPool(toValidItems(pool), count);
  }

  if (battleDifficulty === 'avanzado') {
    // Asignatura actual, prioriza dificultad media-alta
    const pool = await getRoscoData(level, grade, subject, 3);
    const items = toValidItems(pool);
    const hard = items.filter(q => q.difficulty >= 2);
    const easy = items.filter(q => q.difficulty === 1);
    // Si no hay suficientes hard, rellenar con easy
    const combined = hard.length >= count ? hard : [...hard, ...easy];
    return buildFromPool(combined, count);
  }

  if (battleDifficulty === 'intermedio') {
    // 60% asignatura actual (fácil-medio) + 40% cursos anteriores misma asignatura
    const current = toValidItems(await getRoscoData(level, grade, subject, 2));

    const prevItems = [];
    const prevCourses = GRADE_PROGRESSION.slice(Math.max(0, currentIndex - 3), currentIndex);
    for (const pc of prevCourses) {
      const subjects = materiasData[pc.level]?.[String(pc.grade)] || [];
      if (subjects.some(s => s.id === subject)) {
        const d = await getRoscoData(pc.level, pc.grade, subject, 2);
        prevItems.push(...toValidItems(d));
      }
    }

    // Mezclar: 60% current, 40% prev
    const currentCount = Math.ceil(count * 0.6);
    const prevCount = count - currentCount;
    const mixed = [
      ...shuffle(current).slice(0, currentCount),
      ...shuffle(prevItems).slice(0, prevCount),
    ];
    // Si no hay suficientes prev, rellenar con current
    while (mixed.length < count && current.length > mixed.length) {
      const extra = current.find(c => !mixed.some(m => m.answer === c.answer));
      if (extra) mixed.push(extra); else break;
    }
    return buildFromPool(mixed.length >= 4 ? mixed : current, count);
  }

  if (battleDifficulty === 'principiante') {
    // 30% asignatura actual (fácil) + 70% cursos anteriores y cultura general
    const currentEasy = toValidItems(await getRoscoData(level, grade, subject, 1));

    const prevItems = [];
    const prevCourses = GRADE_PROGRESSION.slice(Math.max(0, currentIndex - 4), currentIndex);
    for (const pc of prevCourses) {
      const subjects = materiasData[pc.level]?.[String(pc.grade)] || [];
      // Cultura general de otras asignaturas
      const toLoad = subjects
        .filter(s => GENERAL_SUBJECTS.includes(s.id) && s.id !== subject)
        .slice(0, 2);
      for (const s of toLoad) {
        prevItems.push(...toValidItems(await getRoscoData(pc.level, pc.grade, s.id, 1)));
      }
      // Misma asignatura en cursos anteriores
      if (subjects.some(s => s.id === subject)) {
        prevItems.push(...toValidItems(await getRoscoData(pc.level, pc.grade, subject, 1)));
      }
    }

    const currentCount = Math.ceil(count * 0.3);
    const prevCount = count - currentCount;
    const mixed = [
      ...shuffle(currentEasy).slice(0, currentCount),
      ...shuffle(prevItems).slice(0, prevCount),
    ];
    while (mixed.length < count && prevItems.length > mixed.length) {
      const extra = prevItems.find(c => !mixed.some(m => m.answer === c.answer));
      if (extra) mixed.push(extra); else break;
    }
    const allPool = [...currentEasy, ...prevItems];
    return buildFromPool(mixed.length >= 4 ? mixed : allPool, count);
  }

  // Fallback
  const pool = await getRoscoData(level, grade, subject, 3);
  return buildFromPool(toValidItems(pool), count);
}
