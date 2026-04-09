import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoscoData } from '../../services/gameDataService';
import { useRoscoGame } from '@/hooks/useRoscoGame';
import RoscoUI from '../_shared/RoscoUI.jsx';
import materiasData from '../../../public/data/materias.json';

/**
 * Mapa de progresión: cada level+grade tiene un índice ordinal.
 * Se usa para determinar qué cursos son "anteriores" al actual.
 */
const GRADE_PROGRESSION = [];
for (let g = 1; g <= 6; g++) GRADE_PROGRESSION.push({ level: 'primaria', grade: g });
for (let g = 1; g <= 4; g++) GRADE_PROGRESSION.push({ level: 'eso', grade: g });
for (let g = 1; g <= 2; g++) GRADE_PROGRESSION.push({ level: 'bachillerato', grade: g });

const getProgressionIndex = (level, grade) =>
  GRADE_PROGRESSION.findIndex(p => p.level === level && p.grade === Number(grade));

/** Asignaturas "genéricas" cuyos datos son útiles como cultura general */
const GENERAL_SUBJECTS = ['lengua', 'matematicas', 'historia', 'ciencias-naturales', 'ciencias-sociales', 'biologia', 'fisica', 'geografia'];

/** Shuffle array (Fisher-Yates) */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Selecciona 1 pregunta por letra de un pool, priorizando variedad.
 * Si hay múltiples preguntas por letra, elige una al azar.
 */
const pickOnePerLetter = (questions) => {
  const byLetter = {};
  for (const q of questions) {
    if (!byLetter[q.letra]) byLetter[q.letra] = [];
    byLetter[q.letra].push(q);
  }
  return Object.values(byLetter).map(qs => qs[Math.floor(Math.random() * qs.length)]);
};

/**
 * Mezcla preguntas de diferentes fuentes según proporciones.
 * Devuelve un pool con 1 pregunta por letra, mezclando fuentes.
 * @param {Array} sources - [{questions: [...], weight: 0.5}, ...]
 */
const mixQuestions = (sources) => {
  // Agrupar todas las preguntas por letra y fuente
  const allByLetter = {};
  for (const src of sources) {
    for (const q of (src.questions || [])) {
      if (!allByLetter[q.letra]) allByLetter[q.letra] = [];
      allByLetter[q.letra].push({ ...q, _weight: src.weight });
    }
  }

  const result = [];
  for (const [letra, candidates] of Object.entries(allByLetter)) {
    // Ponderar: crear un pool expandido según weights
    const weighted = [];
    for (const c of candidates) {
      const copies = Math.max(1, Math.round(c._weight * 10));
      for (let i = 0; i < copies; i++) weighted.push(c);
    }
    const chosen = weighted[Math.floor(Math.random() * weighted.length)];
    const { _weight, ...clean } = chosen;
    result.push(clean);
  }
  return result;
};

const DIFFICULTY_LEVELS = [
  {
    id: 'principiante',
    label: 'Principiante',
    emoji: '🟢',
    color: 'from-emerald-400 to-green-500',
    border: 'border-emerald-300',
    description: 'Conceptos básicos de cursos anteriores y cultura general. Ideal para calentar.',
    detail: 'Las preguntas provienen principalmente de cursos anteriores y de asignaturas de cultura general. La dificultad es baja.',
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    emoji: '🟡',
    color: 'from-amber-400 to-yellow-500',
    border: 'border-amber-300',
    description: 'Mezcla de tu asignatura actual con repasos de cursos anteriores.',
    detail: 'Combina preguntas fáciles de tu asignatura y curso con algunas de cursos anteriores de la misma materia.',
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    emoji: '🟠',
    color: 'from-orange-400 to-red-500',
    border: 'border-orange-300',
    description: 'Preguntas de tu asignatura y curso con dificultad media-alta.',
    detail: 'Todas las preguntas son de tu asignatura y curso actual, con dificultad media y alta.',
  },
  {
    id: 'experto',
    label: 'Experto',
    emoji: '🔴',
    color: 'from-red-500 to-rose-600',
    border: 'border-red-400',
    description: 'Solo conceptos de tu asignatura y nivel. Sin ayuda. El verdadero reto.',
    detail: '⚠️ TODOS los conceptos del rosco están relacionados exclusivamente con tu asignatura y nivel actual. Incluye preguntas de máxima dificultad.',
  },
];

const RoscoJuego = ({ onGameComplete } = {}) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyMaterial, setStudyMaterial] = useState(null);

  const currentIndex = useMemo(() => getProgressionIndex(level, grade), [level, grade]);

  // Solo mostrar selector de dificultad a partir de 1º ESO (índice 6+)
  const showDifficultySelector = currentIndex >= 6;

  // Para primaria, cargar datos directamente como antes
  useEffect(() => {
    if (showDifficultySelector) return; // esperar selección de dificultad
    let cancelled = false;
    setLoading(true);
    (async () => {
      const roscoData = await getRoscoData(level, grade, asignatura);
      if (!cancelled) {
        setData(roscoData);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [level, grade, asignatura, showDifficultySelector]);

  // Cargar datos según dificultad seleccionada
  useEffect(() => {
    if (!selectedDifficulty) return;
    let cancelled = false;
    setLoading(true);
    setStudyMaterial(null);

    (async () => {
      try {
        const diffId = selectedDifficulty;
        let finalData = [];

        if (diffId === 'experto') {
          // Solo asignatura + curso actual, todas las dificultades
          finalData = await getRoscoData(level, grade, asignatura, 3);

        } else if (diffId === 'avanzado') {
          // Asignatura actual, dificultad media-alta (2-3)
          const all = await getRoscoData(level, grade, asignatura, 3);
          // Filtrar: priorizar difficulty 2 y 3, pero incluir 1 si faltan letras
          const hard = all.filter(q => q.difficulty >= 2);
          const easy = all.filter(q => q.difficulty === 1);
          // Cubrir letras que faltan con fáciles
          const hardLetters = new Set(hard.map(q => q.letra));
          const filler = easy.filter(q => !hardLetters.has(q.letra));
          finalData = [...hard, ...filler];

        } else if (diffId === 'intermedio') {
          // 60% asignatura actual (fácil-medio) + 40% cursos anteriores misma asignatura
          const current = await getRoscoData(level, grade, asignatura, 2);

          // Buscar cursos anteriores de la misma asignatura
          const prevQuestions = [];
          const prevCourses = GRADE_PROGRESSION.slice(Math.max(0, currentIndex - 3), currentIndex);
          for (const pc of prevCourses) {
            // Comprobar si la asignatura existe en ese curso
            const subjects = materiasData[pc.level]?.[String(pc.grade)] || [];
            const hasSubject = subjects.some(s => s.id === asignatura);
            if (hasSubject) {
              const d = await getRoscoData(pc.level, pc.grade, asignatura, 2);
              prevQuestions.push(...d);
            }
          }

          finalData = mixQuestions([
            { questions: current, weight: 0.6 },
            { questions: prevQuestions, weight: 0.4 },
          ]);

        } else if (diffId === 'principiante') {
          // 30% asignatura actual (solo fácil) + 70% cursos anteriores y cultura general
          const currentEasy = await getRoscoData(level, grade, asignatura, 1);

          // Cursos anteriores: buscar en los 4 cursos previos, asignaturas genéricas
          const prevQuestions = [];
          const prevCourses = GRADE_PROGRESSION.slice(Math.max(0, currentIndex - 4), currentIndex);
          for (const pc of prevCourses) {
            const subjects = materiasData[pc.level]?.[String(pc.grade)] || [];
            // Cargar de asignaturas genéricas que existan en ese curso
            const subjectsToLoad = subjects
              .filter(s => GENERAL_SUBJECTS.includes(s.id) && s.id !== asignatura)
              .slice(0, 2); // max 2 por curso para no sobrecargar
            for (const s of subjectsToLoad) {
              const d = await getRoscoData(pc.level, pc.grade, s.id, 1);
              prevQuestions.push(...d);
            }
            // También de la misma asignatura en cursos anteriores
            const hasSubject = subjects.some(s => s.id === asignatura);
            if (hasSubject) {
              const d = await getRoscoData(pc.level, pc.grade, asignatura, 1);
              prevQuestions.push(...d);
            }
          }

          finalData = mixQuestions([
            { questions: currentEasy, weight: 0.3 },
            { questions: shuffle(prevQuestions), weight: 0.7 },
          ]);
        }

        if (!cancelled) {
          setData(finalData.length > 0 ? finalData : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('RoscoJuego: error cargando datos', err);
        if (!cancelled) {
          setData([]);
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [selectedDifficulty, level, grade, asignatura, currentIndex]);

  const generateStudyMaterialFromData = useCallback((roscoData) => {
    if (!roscoData || !Array.isArray(roscoData)) return null;
    const seccionesMap = {};
    roscoData.forEach(item => {
      if (!seccionesMap[item.letra]) {
        seccionesMap[item.letra] = { letra: item.letra, conceptos: [] };
      }
      seccionesMap[item.letra].conceptos.push({
        termino: item.solucion,
        definicion: item.definicion,
        pista: item.tipo === 'empieza' ? `Empieza por ${item.letra}` : `Contiene la ${item.letra}`
      });
    });
    const secciones = Object.values(seccionesMap).sort((a, b) => a.letra.localeCompare(b.letra, 'es'));
    return {
      titulo: `Material de Estudio - ${asignatura.charAt(0).toUpperCase() + asignatura.slice(1)}`,
      introduccion: `Repasa este vocabulario para ganar en el Rosco del Saber.`,
      secciones
    };
  }, [asignatura]);

  const loadStudyMaterial = useCallback(async () => {
    if (studyMaterial) return studyMaterial;
    try {
      // 1. Todas las preguntas de la asignatura+curso actual
      const allData = await getRoscoData(level, grade, asignatura, 3);

      // 2. Añadir preguntas extra de cursos anteriores y asignaturas afines para marear
      const extraData = [];
      const prevCourses = GRADE_PROGRESSION.slice(Math.max(0, currentIndex - 2), currentIndex);
      for (const pc of prevCourses) {
        const subjects = materiasData[pc.level]?.[String(pc.grade)] || [];
        // Misma asignatura en cursos anteriores
        if (subjects.some(s => s.id === asignatura)) {
          const d = await getRoscoData(pc.level, pc.grade, asignatura, 2);
          extraData.push(...d);
        }
        // Una asignatura afín aleatoria de ese curso
        const afines = subjects.filter(s => GENERAL_SUBJECTS.includes(s.id) && s.id !== asignatura);
        if (afines.length > 0) {
          const pick = afines[Math.floor(Math.random() * afines.length)];
          const d = await getRoscoData(pc.level, pc.grade, pick.id, 1);
          extraData.push(...d);
        }
      }

      // 3. Combinar y deduplicar por solución
      const seen = new Set();
      const combined = [];
      for (const item of [...allData, ...shuffle(extraData)]) {
        const key = item.solucion?.toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }

      if (combined.length > 0) {
        const material = generateStudyMaterialFromData(combined);
        setStudyMaterial(material);
        return material;
      }
    } catch (error) {
      console.warn("No se pudo generar material de estudio.");
    }
    return null;
  }, [studyMaterial, level, grade, asignatura, currentIndex, generateStudyMaterialFromData]);

  const handleBackToDifficulty = useCallback(() => {
    setSelectedDifficulty(null);
    setData(null);
    setStudyMaterial(null);
  }, []);

  const game = useRoscoGame(data);

  // Pantalla de selección de dificultad (solo ESO y Bach)
  if (showDifficultySelector && !selectedDifficulty && !loading) {
    return (
      <div className="rosco-container pt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-blue-600 font-fredoka text-center">El Rosco del Saber</h1>
        <p className="text-gray-500 text-center mb-6">Elige tu nivel de dificultad</p>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {DIFFICULTY_LEVELS.map((diff, i) => (
            <motion.button
              key={diff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`relative bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl border-2 ${diff.border} transition-all hover:scale-[1.03] active:scale-[0.98] group overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${diff.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{diff.emoji}</span>
                  <span className="text-lg font-bold text-gray-800">{diff.label}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{diff.description}</p>
                {diff.id === 'experto' && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-red-600 font-medium">{diff.detail}</p>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info panel */}
        <div className="max-w-2xl mx-auto mt-6 px-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-700 font-medium mb-2">¿Cómo funcionan los niveles?</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li><strong>🟢 Principiante:</strong> Preguntas fáciles de cursos anteriores y cultura general.</li>
              <li><strong>🟡 Intermedio:</strong> Mezcla de tu asignatura con repasos de cursos anteriores.</li>
              <li><strong>🟠 Avanzado:</strong> Solo tu asignatura, dificultad media-alta.</li>
              <li><strong>🔴 Experto:</strong> Todo del temario de tu asignatura y nivel. El máximo reto.</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => setSelectedDifficulty('experto')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Saltar selección (modo experto)
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || !data) {
    return (
      <div className="rosco-container pt-4 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando el rosco...</p>
      </div>
    );
  }

  return <RoscoUI {...game} loadStudyMaterial={loadStudyMaterial} onGameComplete={onGameComplete} onBackToDifficulty={showDifficultySelector ? handleBackToDifficulty : null} />;
};

export default RoscoJuego;
