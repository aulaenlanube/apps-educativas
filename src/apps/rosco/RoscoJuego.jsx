import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sprout, Flame, Target, Crown, LayoutGrid } from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import { useRoscoGame } from '@/hooks/useRoscoGame';
import RoscoUI, { RoscoShell, RoscoInstructions, RoscoStudyModal } from '../_shared/RoscoUI.jsx';
import { ModeSelect, GameLoading, GameEmpty, GameButton } from '../_shared/kit';
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
  for (const [, candidates] of Object.entries(allByLetter)) {
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

// Niveles de dificultad (solo ESO y Bachillerato). tone/icon/features: presentación
// de la pantalla previa (ModeSelect del kit); 'hard' es un tono propio (naranja).
const DIFFICULTY_LEVELS = [
  {
    id: 'principiante',
    label: 'Principiante',
    tone: 'easy',
    icon: Sprout,
    description: 'Conceptos básicos de cursos anteriores y cultura general. Ideal para calentar.',
    features: ['Preguntas de cursos anteriores', 'Cultura general', 'Dificultad baja'],
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    tone: 'medium',
    icon: Flame,
    description: 'Mezcla de tu asignatura actual con repasos de cursos anteriores.',
    features: ['Tu asignatura y curso', 'Repaso de cursos anteriores'],
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    tone: 'hard',
    icon: Target,
    description: 'Preguntas de tu asignatura y curso con dificultad media-alta.',
    features: ['Solo tu asignatura y curso', 'Dificultad media y alta'],
  },
  {
    id: 'experto',
    label: 'Experto',
    tone: 'exam',
    icon: Crown,
    description: 'Solo conceptos de tu asignatura y nivel. Sin ayuda. El verdadero reto.',
    features: ['Todo el temario de tu nivel', 'Incluye la máxima dificultad'],
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
  // Presentación: instrucciones y material de estudio en la pantalla de dificultad
  const [showHelp, setShowHelp] = useState(false);
  const [studyOpen, setStudyOpen] = useState(null); // material abierto (o null)

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

  const openStudy = useCallback(async () => {
    const material = await loadStudyMaterial();
    if (material) setStudyOpen(material);
  }, [loadStudyMaterial]);

  // Pantalla de selección de dificultad (solo ESO y Bach)
  if (showDifficultySelector && !selectedDifficulty && !loading) {
    const modes = DIFFICULTY_LEVELS.map((d) => ({
      id: d.id,
      tone: d.tone,
      icon: d.icon,
      title: d.label,
      desc: d.description,
      features: d.features,
      cta: 'Elegir',
    }));
    return (
      <RoscoShell className="rsc-diffsel">
        <ModeSelect
          description="Elige tu nivel de dificultad: decide de dónde salen las preguntas del rosco."
          modes={modes}
          onSelect={(id) => setSelectedDifficulty(id)}
          onHelp={() => setShowHelp(true)}
          onStudy={openStudy}
          footer={(
            <button type="button" className="rsc-skip" onClick={() => setSelectedDifficulty('experto')}>
              Saltar selección (modo experto)
            </button>
          )}
        />
        <AnimatePresence>
          {studyOpen && <RoscoStudyModal key="study" material={studyOpen} onClose={() => setStudyOpen(null)} />}
        </AnimatePresence>
        <RoscoInstructions isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </RoscoShell>
    );
  }

  // Loading
  if (loading || !data) {
    return (
      <RoscoShell>
        <GameLoading label="Preparando el rosco…" />
      </RoscoShell>
    );
  }

  // Sin preguntas para este curso/asignatura (o dificultad)
  if (Array.isArray(data) && data.length === 0) {
    return (
      <RoscoShell>
        <GameEmpty
          title="Aún no hay preguntas"
          action={showDifficultySelector ? (
            <GameButton variant="soft" icon={LayoutGrid} onClick={handleBackToDifficulty}>Cambiar dificultad</GameButton>
          ) : null}
        >
          No hay definiciones disponibles para este rosco todavía.
        </GameEmpty>
      </RoscoShell>
    );
  }

  const diff = showDifficultySelector ? DIFFICULTY_LEVELS.find((d) => d.id === selectedDifficulty) : null;
  const chip = diff ? { id: diff.id, label: diff.label, tone: diff.tone } : null;

  return <RoscoUI {...game} loadStudyMaterial={loadStudyMaterial} onGameComplete={onGameComplete} onBackToDifficulty={showDifficultySelector ? handleBackToDifficulty : null} chip={chip} />;
};

export default RoscoJuego;
