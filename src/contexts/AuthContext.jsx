import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [freeUser, setFreeUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTeacher = !!user && !!teacher && teacher?.role !== 'free';
  const isFreeUser = !!user && !!freeUser;
  const isStudent = !!student;
  const isAdmin = teacher?.role === 'admin';
  const isAuthenticated = isTeacher || isStudent || isFreeUser;
  const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : isFreeUser ? 'free' : isStudent ? 'student' : null;
  const displayName = isTeacher ? teacher?.display_name : isFreeUser ? freeUser?.display_name : isStudent ? student?.display_name : null;

  const fetchTeacherProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) {
        if (data.role === 'free') {
          setFreeUser(data);
          setTeacher(null);
        } else {
          setTeacher(data);
          setFreeUser(null);
        }
      }
    } catch {
      // Si falla (ej: columna no existe aún), no bloquear la app
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchTeacherProfile(session.user.id);
        }

        const savedStudent = sessionStorage.getItem('student_session');
        if (savedStudent) {
          try {
            setStudent(JSON.parse(savedStudent));
          } catch {
            sessionStorage.removeItem('student_session');
          }
        }
      } catch (err) {
        console.error('AuthContext init error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);

          // If user just signed in via Google from the "Soy Libre" tab,
          // update their role from default 'teacher' to 'free'
          const pendingFree = localStorage.getItem('pending_free_google_auth');
          if (pendingFree) {
            localStorage.removeItem('pending_free_google_auth');
            await supabase
              .from('teachers')
              .update({ role: 'free' })
              .eq('id', session.user.id)
              .eq('role', 'teacher'); // only update if still default
          }

          await fetchTeacherProfile(session.user.id);
        } else {
          setUser(null);
          setTeacher(null);
          setFreeUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchTeacherProfile]);

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
    localStorage.removeItem('pending_free_google_auth');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { data, error };
  }

  async function signInWithGoogleAsFree() {
    localStorage.setItem('pending_free_google_auth', 'true');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
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

    const studentData = { ...data.student, group_code: groupCode.toUpperCase() };
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

    const studentData = { ...data.student, group_code: groupCode.toUpperCase() };
    setStudent(studentData);
    sessionStorage.setItem('student_session', JSON.stringify(studentData));
    return { data: studentData };
  }

  async function updateTeacherProfile(updates) {
    const { error } = await supabase
      .from('teachers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (!error) {
      setTeacher(prev => ({ ...prev, ...updates }));
    }
    return { error };
  }

  async function signOut() {
    if (isTeacher || isFreeUser) {
      await supabase.auth.signOut();
      setUser(null);
      setTeacher(null);
      setFreeUser(null);
    }
    if (isStudent) {
      setStudent(null);
      sessionStorage.removeItem('student_session');
    }
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
    const studentData = { ...data.student, auth_user_id: authUserId, groups };

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
      redirectTo: window.location.origin + '/login',
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

  const value = useMemo(() => ({
    user, teacher, student, freeUser,
    isTeacher, isStudent, isFreeUser, isAdmin, isAuthenticated, role, displayName,
    loading,
    signUpTeacher, signUpFreeUser, signInTeacher, signInFreeUser, signInWithGoogle, signInWithGoogleAsFree,
    signInStudent, signInStudentEmail, resetPassword, resetStudentPassword, studentSetPassword, switchStudentGroup, signOut,
    fetchTeacherProfile, updateTeacherProfile, updateStudentLocal,
  }), [
    user, teacher, student, freeUser,
    isTeacher, isStudent, isFreeUser, isAdmin, isAuthenticated, role, displayName,
    loading, fetchTeacherProfile,
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
