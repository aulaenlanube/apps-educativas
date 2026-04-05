import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Hook de tracking universal de partidas.
 * Registra TODAS las sesiones: teacher, student y anonymous.
 * - Al montar: crea una sesion con completed=false (track_session_start)
 * - Al completar: actualiza con resultados (track_session_finish)
 * - Al desmontar sin completar: marca como abandonada (track_session_abandon)
 *
 * Si las funciones nuevas no existen aun en Supabase, usa fallback al metodo antiguo.
 */
export function useGameTracker() {
  const { user, student, isTeacher, isStudent } = useAuth();
  const sessionIdRef = useRef(null);
  const completedRef = useRef(false);
  const startTimeRef = useRef(null);

  const getUserInfo = useCallback(() => {
    if (isTeacher && user) return { type: 'teacher', id: user.id };
    if (isStudent && student) return { type: 'student', id: student.id };
    return { type: 'anonymous', id: null };
  }, [user, student, isTeacher, isStudent]);

  /**
   * Inicia una sesion de tracking. Llamar al montar la app.
   */
  const startSession = useCallback(async ({ appId, appName, level, grade, subjectId }) => {
    startTimeRef.current = Date.now();
    completedRef.current = false;
    sessionIdRef.current = null;

    try {
      const userInfo = getUserInfo();
      const { data, error } = await supabase.rpc('track_session_start', {
        p_user_type: userInfo.type,
        p_user_id: userInfo.id,
        p_app_id: appId,
        p_app_name: appName,
        p_level: level || null,
        p_grade: grade || null,
        p_subject_id: subjectId || null,
      });

      if (!error && data?.session_id) {
        sessionIdRef.current = data.session_id;
      }
    } catch (err) {
      // Las funciones nuevas aun no existen - no pasa nada, se usara fallback
    }
  }, [getUserInfo]);

  /**
   * Finaliza la sesion con resultados. Llamar desde onGameComplete.
   */
  /**
   * Calcula la nota (0-10) a partir de los resultados.
   * Prioriza correctAnswers/totalQuestions, fallback a score/maxScore.
   */
  const calculateNota = (correctAnswers, totalQuestions, score, maxScore) => {
    let ratio = 0;
    if (totalQuestions > 0) {
      ratio = correctAnswers / totalQuestions;
    } else if (maxScore > 0) {
      ratio = score / maxScore;
    }
    // Nota 0-10, maximo 10, redondeada a 1 decimal
    return Math.min(10, Math.round(ratio * 100) / 10);
  };

  /**
   * Finaliza la sesion con resultados. Llamar desde onGameComplete.
   */
  const trackGameSession = useCallback(async ({
    appId,
    appName,
    level,
    grade,
    subjectId,
    mode = 'practice',
    score = 0,
    maxScore = 0,
    correctAnswers = 0,
    totalQuestions = 0,
    durationSeconds,
    completed = true,
    difficulty,
  }) => {
    completedRef.current = true;
    const duration = durationSeconds ?? (startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : null);
    const nota = calculateNota(correctAnswers, totalQuestions, score, maxScore);

    // Ruta 1: Si tenemos session_id de track_session_start, actualizar esa sesion
    if (sessionIdRef.current) {
      try {
        const { error } = await supabase.rpc('track_session_finish', {
          p_session_id: sessionIdRef.current,
          p_mode: mode,
          p_score: score,
          p_max_score: maxScore,
          p_correct_answers: correctAnswers,
          p_total_questions: totalQuestions,
          p_duration_seconds: duration,
          p_completed: completed,
          p_difficulty: difficulty || null,
          p_nota: nota,
        });
        if (!error) return; // Exito
      } catch (err) {
        // Fallo track_session_finish, intentar fallback
      }
    }

    // Ruta 2 (fallback): insertar directamente como antes
    const userInfo = getUserInfo();
    try {
      if (userInfo.type === 'teacher' && userInfo.id) {
        // Teacher: insert directo (tiene auth de Supabase)
        await supabase.from('game_sessions').insert({
          user_type: 'teacher',
          user_id: userInfo.id,
          app_id: appId,
          app_name: appName,
          level,
          grade,
          subject_id: subjectId,
          mode,
          score,
          max_score: maxScore,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          duration_seconds: duration,
          completed,
          nota,
        });
      } else if (userInfo.type === 'student' && userInfo.id) {
        // Student: via RPC (no tiene auth de Supabase)
        await supabase.rpc('track_student_session', {
          p_student_id: userInfo.id,
          p_app_id: appId,
          p_app_name: appName,
          p_level: level,
          p_grade: grade,
          p_subject_id: subjectId,
          p_mode: mode,
          p_score: score,
          p_max_score: maxScore,
          p_correct_answers: correctAnswers,
          p_total_questions: totalQuestions,
          p_duration_seconds: duration,
          p_completed: completed,
          p_nota: nota,
        });
      } else {
        // Anonymous: intentar start_and_finish, si no existe, no se registra
        await supabase.rpc('track_session_start_and_finish', {
          p_user_type: 'anonymous',
          p_user_id: null,
          p_app_id: appId,
          p_app_name: appName,
          p_level: level || null,
          p_grade: grade || null,
          p_subject_id: subjectId || null,
          p_mode: mode,
          p_score: score,
          p_max_score: maxScore,
          p_correct_answers: correctAnswers,
          p_total_questions: totalQuestions,
          p_duration_seconds: duration,
          p_completed: completed,
          p_difficulty: difficulty || null,
          p_nota: nota,
        });
      }
    } catch (err) {
      console.error('[GameTracker] Error tracking session:', err);
    }
  }, [getUserInfo]);

  /**
   * Marca la sesion actual como abandonada. Se llama automaticamente al desmontar.
   */
  const abandonSession = useCallback(async () => {
    if (!sessionIdRef.current || completedRef.current) return;
    const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : null;
    const sid = sessionIdRef.current;
    sessionIdRef.current = null;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const url = `${supabaseUrl}/rest/v1/rpc/track_session_abandon`;
      const payload = JSON.stringify({
        p_session_id: sid,
        p_duration_seconds: duration,
      });

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: payload,
        keepalive: true,
      });
    } catch (err) {
      // Best-effort: si falla al cerrar pestana, la sesion queda como no completada
    }
  }, []);

  // Legacy compatibility
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const getElapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return null;
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  return { startSession, trackGameSession, abandonSession, startTimer, getElapsedSeconds };
}
