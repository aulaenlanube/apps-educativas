import { getRoscoData } from '@/services/gameDataService';

/**
 * Shuffle array in place (Fisher-Yates).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build quiz questions from rosco data.
 * Same pattern as Millonario but exported for Quiz Battle.
 *
 * @param {string} level  — 'primaria' | 'eso'
 * @param {number} grade  — 1-6 or 1-4
 * @param {string} subject — subject id
 * @param {number} count  — how many questions
 * @returns {Promise<Array<{ question, correct, options, correctIndex, difficulty }>>}
 */
export async function buildQuizQuestions(level, grade, subject, count = 10) {
  const pool = await getRoscoData(level, grade, subject);

  const valid = pool
    .filter((it) => it && it.solucion && it.definicion)
    .map((it) => ({
      answer: String(it.solucion).trim(),
      question: String(it.definicion).trim(),
      difficulty: it.difficulty || 2,
    }))
    .filter((it) => it.answer.length > 0);

  if (valid.length < 4) return [];

  // Sort by difficulty (easy → hard) with random tiebreak
  const sorted = [...valid].sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return Math.random() - 0.5;
  });

  const selected = sorted.slice(0, Math.min(count, sorted.length));
  const questions = [];

  for (const q of selected) {
    const distractors = shuffle(
      valid.filter((x) => x.answer !== q.answer)
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
