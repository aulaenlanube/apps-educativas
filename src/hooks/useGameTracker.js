import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useGameTracker() {
  const { user, student, isTeacher, isStudent } = useAuth();
  const startTimeRef = useRef(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const getElapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return null;
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

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
  }) => {
    const duration = durationSeconds ?? getElapsedSeconds();

    if (isTeacher && user) {
      await supabase.from('game_sessions').insert({
        user_type: 'teacher',
        user_id: user.id,
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
      });
    } else if (isStudent && student) {
      await supabase.rpc('track_student_session', {
        p_student_id: student.id,
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
      });
    }
    // Si no hay usuario logueado, no hace nada
  }, [user, student, isTeacher, isStudent, getElapsedSeconds]);

  return { trackGameSession, startTimer, getElapsedSeconds };
}
