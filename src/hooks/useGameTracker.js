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
  const { user, student, isTeacher, isStudent, isFreeUser } = useAuth();
  const sessionIdRef = useRef(null);
  const completedRef = useRef(false);
  const startTimeRef = useRef(null);

  const getUserInfo = useCallback(() => {
    if (isTeacher && user) return { type: 'teacher', id: user.id };
    if (isFreeUser && user) return { type: 'free', id: user.id };
    if (isStudent && student) return { type: 'student', id: student.id };
    return { type: 'anonymous', id: null };
  }, [user, student, isTeacher, isStudent, isFreeUser]);

  // Identidad capturada al INICIAR la sesión. En partidas largas el estado de
  // auth puede perderse a mitad (token caducado, carrera de refresh): el dueño
  // de la partida es quien la empezó, no "anonymous". Pasó con La Fortaleza:
  // un asedio de 9 min acabó con el récord guardado como anónimo.
  const userInfoRef = useRef(null);
  const resolveUserInfo = useCallback(() => {
    const live = getUserInfo();
    if (live.id) return live;
    if (userInfoRef.current?.id) return userInfoRef.current;
    return live;
  }, [getUserInfo]);

  // RPC con la anon key "a pelo": las RPC de tracking son SECURITY DEFINER,
  // así que funcionan aunque el token de auth del cliente esté caducado.
  const rpcAnonFetch = useCallback(async (fnName, payload) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`rpc ${fnName}: HTTP ${res.status}`);
    return res.json().catch(() => null);
  }, []);

  /**
   * Inicia una sesion de tracking. Llamar al montar la app.
   */
  const startSession = useCallback(async ({ appId, appName, level, grade, subjectId }) => {
    startTimeRef.current = Date.now();
    completedRef.current = false;
    sessionIdRef.current = null;

    try {
      const userInfo = getUserInfo();
      userInfoRef.current = userInfo; // dueño de la sesión (ver resolveUserInfo)
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
    nota: notaOverride,
  }) => {
    completedRef.current = true;
    const duration = durationSeconds ?? (startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : null);
    // Cuando la app envía una nota explícita (p. ej. con bonus/penalizacion), respétala
    // sin aplicar el tope 10 — así permitimos notas fuera del rango por modificadores.
    const nota = notaOverride != null
      ? Math.round(Number(notaOverride) * 10) / 10
      : calculateNota(correctAnswers, totalQuestions, score, maxScore);

    // Ruta 1: Si tenemos session_id de track_session_start, actualizar esa sesion.
    // Solo UNA vez por sesion inicial: si el alumno juega varias rondas (ej. practica
    // y luego examen), la segunda llamada debe crear una fila nueva via fallback —
    // de lo contrario track_session_finish sobrescribe la anterior y se pierde.
    let trackingOk = false;
    if (sessionIdRef.current) {
      const finishPayload = {
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
      };
      try {
        const { error } = await supabase.rpc('track_session_finish', finishPayload);
        if (error) throw error;
        trackingOk = true;
        // Consumimos el session_id: la siguiente ronda debe crear fila nueva.
        sessionIdRef.current = null;
      } catch (err) {
        // El cliente puede llevar un token caducado (partidas largas): la RPC
        // es SECURITY DEFINER, reintentar con la anon key antes de rendirse.
        try {
          await rpcAnonFetch('track_session_finish', finishPayload);
          trackingOk = true;
          sessionIdRef.current = null;
        } catch (err2) {
          // Fallo definitivo: intentar fallback (ruta 2)
        }
      }
    }

    // Ruta 2 (fallback): insertar directamente si ruta 1 fallo
    if (!trackingOk) {
    const userInfo = resolveUserInfo();
    try {
      if ((userInfo.type === 'teacher' || userInfo.type === 'free') && userInfo.id) {
        // Teacher/Free: insert directo (tiene auth de Supabase)
        const { error: insErr } = await supabase.from('game_sessions').insert({
          user_type: userInfo.type,
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
        if (insErr) {
          // Sin auth válida el insert directo choca con RLS: RPC definer
          await rpcAnonFetch('track_session_start_and_finish', {
            p_user_type: userInfo.type,
            p_user_id: userInfo.id,
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
    } // fin if (!trackingOk)

    // Gamificación: procesar XP e insignias (students, teachers, free - solo sesiones completadas)
    // Paralelizamos lo que es independiente para reducir latencia en ~60 %.
    const userInfo2 = resolveUserInfo();
    if (userInfo2.id && completed) {
      try {
        const groupId = student?.group_id || null;
        const isStudent = userInfo2.type === 'student';
        const isTeacherOrFree = userInfo2.type === 'teacher' || userInfo2.type === 'free';

        // Ola 1 (en paralelo): gamification + upsert_high_score son independientes.
        const gamifPromise = isStudent
          ? supabase.rpc('gamification_process_session', {
              p_student_id: userInfo2.id,
              p_session_mode: mode,
              p_session_nota: nota,
              p_session_duration: duration,
              p_session_app_id: appId,
            })
          : isTeacherOrFree
            ? supabase.rpc('gamification_process_teacher_session', {
                p_teacher_id: userInfo2.id,
                p_session_mode: mode,
                p_session_nota: nota,
                p_session_duration: duration,
                p_session_app_id: appId,
              })
            : Promise.resolve({ data: null });

        const hsPromise = supabase.rpc('upsert_high_score', {
          p_user_id: userInfo2.id,
          p_user_type: userInfo2.type,
          p_app_id: appId,
          p_level: level || null,
          p_grade: grade ? String(grade) : null,
          p_subject_id: subjectId || null,
          p_score: score,
          p_nota: nota,
          p_correct_answers: correctAnswers,
          p_total_questions: totalQuestions,
          p_duration_seconds: duration,
          p_mode: mode,
          p_group_id: groupId,
        });

        const [gamifRes, hsRes] = await Promise.all([gamifPromise, hsPromise]);
        const gamifResult = gamifRes?.data || null;

        if (gamifResult?.success) {
          // Ola 2 (en paralelo cuando aplique): rankingBadges (solo si nuevo récord)
          // y mythicBadges (solo students) — son independientes entre sí.
          const tasks = [];

          if (hsRes?.data?.is_new_record) {
            tasks.push(supabase.rpc('process_ranking_badges', {
              p_user_id: userInfo2.id,
              p_user_type: userInfo2.type,
              p_app_id: appId,
              p_level: level || null,
              p_grade: grade ? String(grade) : null,
              p_subject_id: subjectId || null,
              p_score: score,
              p_group_id: groupId,
            }).then(r => ({ kind: 'rank', data: r?.data })).catch(() => null));
          }

          if (isStudent && student?.session_token) {
            tasks.push(supabase.rpc('mythic_badges_check', {
              p_student_id: userInfo2.id,
              p_session_token: student.session_token,
            }).then(r => ({ kind: 'mythic', data: r?.data })).catch(() => null));
          }

          const results = tasks.length > 0 ? await Promise.all(tasks) : [];

          for (const r of results) {
            if (!r?.data) continue;
            if (r.kind === 'rank') {
              if (r.data.new_badges?.length > 0) {
                gamifResult.new_badges = [
                  ...(gamifResult.new_badges || []),
                  ...r.data.new_badges,
                ];
                gamifResult.total_xp_gained = (gamifResult.total_xp_gained || 0) + (r.data.badge_xp || 0);
                gamifResult.new_xp = (gamifResult.new_xp || 0) + (r.data.badge_xp || 0);
              }
              gamifResult.high_score = {
                is_new_record: true,
                old_score: hsRes.data.old_score,
                new_score: hsRes.data.new_score,
                global_rank: r.data.global_rank || hsRes.data.global_rank,
                class_rank: r.data.class_rank || null,
              };
            } else if (r.kind === 'mythic') {
              const newMythic = r.data.new_badges || [];
              if (newMythic.length > 0) {
                gamifResult.new_badges = [
                  ...(gamifResult.new_badges || []),
                  ...newMythic,
                ];
                const mxp = r.data.badge_xp || 0;
                gamifResult.total_xp_gained = (gamifResult.total_xp_gained || 0) + mxp;
                gamifResult.new_xp = (gamifResult.new_xp || 0) + mxp;
              }
            }
          }

          return gamifResult;
        }
      } catch (err) {
        console.warn('[GameTracker] Gamification error (non-blocking):', err);
      }
    }

    // Para usuarios sin gamificacion (anonimos) o si la ola anterior falló,
    // aun asi registrar high score (con reintento via anon key)
    if (completed && score > 0) {
      const userInfo3 = resolveUserInfo();
      const hsPayload = {
        p_user_id: userInfo3.id,
        p_user_type: userInfo3.type,
        p_app_id: appId,
        p_level: level || null,
        p_grade: grade ? String(grade) : null,
        p_subject_id: subjectId || null,
        p_score: score,
        p_nota: nota,
        p_correct_answers: correctAnswers,
        p_total_questions: totalQuestions,
        p_duration_seconds: duration,
        p_mode: mode,
        p_group_id: null,
      };
      try {
        const { error } = await supabase.rpc('upsert_high_score', hsPayload);
        if (error) throw error;
      } catch (err) {
        try { await rpcAnonFetch('upsert_high_score', hsPayload); } catch { /* best-effort */ }
      }
    }

    return null;
  }, [resolveUserInfo, rpcAnonFetch, student]);

  /**
   * Marca la sesion actual como abandonada. Se llama automaticamente al desmontar.
   * Usa el access_token de la sesion activa cuando esta disponible, de modo que
   * auth.uid() siga resolviendo server-side para teachers/free. Students y
   * anonimos caen al anon key (la RPC localiza la sesion por p_session_id).
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

      let accessToken = supabaseKey;
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) accessToken = data.session.access_token;
      } catch {
        // Sin sesion Supabase (student/anonymous) — usar anon key.
      }

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
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
