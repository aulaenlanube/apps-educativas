import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Preferir URL publica configurada por entorno para evitar OAuth open-redirect
// si el host es manipulado (Host header / proxy). Fallback al origin actual.
const PUBLIC_URL = (import.meta.env.VITE_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [freeUser, setFreeUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileFetchedForId = useRef(null);

  const isTeacher = !!user && !!teacher && teacher?.role !== 'free';
  const isFreeUser = !!user && !!freeUser;
  const isStudent = !!student;
  const isAdmin = teacher?.role === 'admin';
  const isAuthenticated = isTeacher || isStudent || isFreeUser;
  const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : isFreeUser ? 'free' : isStudent ? 'student' : null;
  const displayName = isTeacher ? teacher?.display_name : isFreeUser ? freeUser?.display_name : isStudent ? student?.display_name : null;

  const fetchTeacherProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, role, display_name, email, teacher_code, avatar_emoji, avatar_color, bio, website, specialty, center_name, education_levels, created_at, updated_at')
        .eq('id', userId)
        .single();
      if (error) {
        if (import.meta.env.DEV) console.warn('[Auth] fetchTeacherProfile error:', error.message);
        return false;
      }
      if (data) {
        if (data.role === 'free') {
          setFreeUser(data);
          setTeacher(null);
        } else {
          setTeacher(data);
          setFreeUser(null);
        }
        return true;
      }
      return false;
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[Auth] fetchTeacherProfile exception:', err);
      return false;
    }
  }, []);

  // Efecto 1: Listener de auth — SOLO actualiza user (sincrono, sin queries)
  useEffect(() => {
    // Restaurar sesion de alumno
    const savedStudent = sessionStorage.getItem('student_session');
    if (savedStudent) {
      try { setStudent(JSON.parse(savedStudent)); }
      catch { sessionStorage.removeItem('student_session'); }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Solo operaciones sincronas — NO hacer await/fetch aqui
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setTeacher(null);
          setFreeUser(null);
          profileFetchedForId.current = null;
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);

          // Google "Soy Libre" — marcar para procesar en el efecto de perfil
          if (event === 'SIGNED_IN') {
            const pendingFree = sessionStorage.getItem('pending_free_google_auth');
            if (pendingFree) {
              sessionStorage.removeItem('pending_free_google_auth');
              // Se procesa en el efecto de perfil
              sessionStorage.setItem('pending_free_update', session.user.id);
            }
          }
        } else {
          // Sin sesion (primera carga sin login)
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Safety timeout
    const safetyTimeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Efecto 2: Cuando user cambia, cargar perfil (ya con headers de auth listos)
  useEffect(() => {
    if (!user) return;
    if (profileFetchedForId.current === user.id) {
      // Ya cargamos este perfil, no repetir
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      // Procesar pending free update si existe.
      // El cambio de rol se delega a una RPC server-side con guard (SECURITY DEFINER)
      // para evitar que el cliente pueda establecer cualquier rol via .update() directo.
      const pendingFreeUserId = sessionStorage.getItem('pending_free_update');
      if (pendingFreeUserId === user.id) {
        sessionStorage.removeItem('pending_free_update');
        const { error: roleError } = await supabase.rpc('set_self_role_free');
        if (roleError && import.meta.env.DEV) {
          console.warn('[Auth] set_self_role_free failed:', roleError.message);
        }
      }

      const success = await fetchTeacherProfile(user.id);
      if (cancelled) return;

      if (!success) {
        // Reintentar una vez tras 500ms (headers de auth pueden no estar listos)
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return;
        await fetchTeacherProfile(user.id);
      }

      if (!cancelled) {
        profileFetchedForId.current = user.id;
        setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [user, fetchTeacherProfile]);

  async function signUpTeacher(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } }
    });
    return { data, error };
  }

  async function signUpFreeUser(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName, role: 'free' } }
    });
    return { data, error };
  }

  async function signInFreeUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signInTeacher(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signInWithGoogle() {
    sessionStorage.removeItem('pending_free_google_auth');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: PUBLIC_URL }
    });
    return { data, error };
  }

  async function signInWithGoogleAsFree() {
    sessionStorage.setItem('pending_free_google_auth', 'true');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: PUBLIC_URL }
    });
    return { data, error };
  }

  async function signInStudent(groupCode, username, password) {
    // Input validation
    if (!groupCode || typeof groupCode !== 'string' || groupCode.trim().length === 0) {
      return { error: { message: 'Código de grupo requerido' } };
    }
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return { error: { message: 'Nombre de usuario requerido' } };
    }
    if (groupCode.length > 20 || username.length > 100) {
      return { error: { message: 'Datos de entrada demasiado largos' } };
    }
    const { data, error } = await supabase.rpc('student_login', {
      p_teacher_code: groupCode,
      p_username: username,
      p_password: password || ''
    });
    if (error) return { error };
    if (data.error) return { error: { message: data.error } };

    // Si necesita crear contrasena (primer login o tras reset)
    if (data.needs_password) {
      return { needsPassword: true, studentId: data.student_id, displayName: data.display_name };
    }

    const studentData = { ...data.student, group_code: groupCode.toUpperCase(), session_token: data.session_token };
    setStudent(studentData);
    sessionStorage.setItem('student_session', JSON.stringify(studentData));
    return { data: studentData };
  }

  async function studentSetPassword(studentId, groupCode, username, newPassword) {
    const { data, error } = await supabase.rpc('student_set_password', {
      p_student_id: studentId,
      p_group_code: groupCode,
      p_username: username,
      p_new_password: newPassword
    });
    if (error) return { error };
    if (data.error) return { error: { message: data.error } };

    const studentData = { ...data.student, group_code: groupCode.toUpperCase(), session_token: data.session_token };
    setStudent(studentData);
    sessionStorage.setItem('student_session', JSON.stringify(studentData));
    return { data: studentData };
  }

  async function updateTeacherProfile(updates) {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const id = currentUser?.id;
    if (!id) return { error: { message: 'Sesion expirada. Vuelve a iniciar sesion.' } };
    const { error } = await supabase
      .from('teachers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setTeacher(prev => prev ? { ...prev, ...updates } : prev);
      setFreeUser(prev => prev ? { ...prev, ...updates } : prev);
    }
    return { error };
  }

  async function signOut() {
    // Invalidar token de alumno server-side (si existe)
    const studentToken = student?.session_token;
    if (studentToken) {
      try { await supabase.rpc('student_logout', { p_session_token: studentToken }); }
      catch { /* best-effort */ }
    }
    // Limpiar estado local siempre
    profileFetchedForId.current = null;
    setUser(null);
    setTeacher(null);
    setFreeUser(null);
    setStudent(null);
    sessionStorage.removeItem('student_session');
    // Cerrar sesion de Supabase Auth (dispara SIGNED_OUT en el listener)
    await supabase.auth.signOut();
  }

  function updateStudentLocal(updates) {
    setStudent(prev => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem('student_session', JSON.stringify(updated));
      return updated;
    });
  }

  async function signInStudentEmail(email, password) {
    // Login via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email, password,
    });

    if (authError) return { error: authError };

    const authUserId = authData?.user?.id;
    if (!authUserId) return { error: { message: 'Error de autenticacion' } };

    // Comprobar si el email está verificado
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { error: { message: 'Debes verificar tu email antes de iniciar sesion. Revisa tu bandeja de entrada.' } };
    }

    // Marcar email como verificado en students (por si no lo estaba)
    await supabase.rpc('student_confirm_email', { p_auth_user_id: authUserId });

    // Buscar datos del alumno
    const { data, error } = await supabase.rpc('student_login_by_auth', {
      p_auth_user_id: authUserId,
    });

    // Cerrar sesion de Supabase Auth (el alumno usa sesion custom)
    await supabase.auth.signOut();

    if (error) return { error };
    if (data?.error) {
      // Puede ser que el auth.users exista pero no sea un alumno vinculado
      return { error: { message: data.error } };
    }

    const groups = data.groups || [];
    const studentData = { ...data.student, auth_user_id: authUserId, groups, session_token: data.session_token };

    if (groups.length === 1) {
      studentData.group_id = groups[0].group_id;
      studentData.group_name = groups[0].group_name;
      studentData.group_code = groups[0].group_code;
    }

    setStudent(studentData);
    sessionStorage.setItem('student_session', JSON.stringify(studentData));
    return { data: studentData, groups };
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${PUBLIC_URL}/login`,
    });
    return { error };
  }

  // Alias for backwards compatibility
  const resetStudentPassword = resetPassword;

  function switchStudentGroup(group) {
    setStudent(prev => {
      const updated = {
        ...prev,
        group_id: group ? group.group_id : null,
        group_name: group ? group.group_name : null,
        group_code: group ? group.group_code : null,
      };
      sessionStorage.setItem('student_session', JSON.stringify(updated));
      return updated;
    });
  }

  // Las funciones no cambian entre renders (no dependen de estado mutable en su closure
  // excepto via refs o setters), asi que el useMemo solo necesita depender de los valores reactivos.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFns = useMemo(() => ({
    signUpTeacher, signUpFreeUser, signInTeacher, signInFreeUser, signInWithGoogle, signInWithGoogleAsFree,
    signInStudent, signInStudentEmail, resetPassword, resetStudentPassword, studentSetPassword, switchStudentGroup, signOut,
    fetchTeacherProfile, updateTeacherProfile, updateStudentLocal,
  }), [fetchTeacherProfile]);

  const value = useMemo(() => ({
    user, teacher, student, freeUser,
    isTeacher, isStudent, isFreeUser, isAdmin, isAuthenticated, role, displayName,
    loading,
    ...stableFns,
  }), [
    user, teacher, student, freeUser,
    isTeacher, isStudent, isFreeUser, isAdmin, isAuthenticated, role, displayName,
    loading, stableFns,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
