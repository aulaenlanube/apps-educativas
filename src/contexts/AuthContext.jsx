import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTeacher = !!user && !!teacher;
  const isStudent = !!student;
  const isAdmin = teacher?.role === 'admin';
  const isAuthenticated = isTeacher || isStudent;
  const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : isStudent ? 'student' : null;
  const displayName = isTeacher ? teacher?.display_name : isStudent ? student?.display_name : null;

  const fetchTeacherProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setTeacher(data);
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

        const savedStudent = localStorage.getItem('student_session');
        if (savedStudent) {
          try {
            setStudent(JSON.parse(savedStudent));
          } catch {
            localStorage.removeItem('student_session');
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
          await fetchTeacherProfile(session.user.id);
        } else {
          setUser(null);
          setTeacher(null);
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

  async function signInTeacher(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { data, error };
  }

  async function signInStudent(groupCode, username, password) {
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
    localStorage.setItem('student_session', JSON.stringify(studentData));
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
    localStorage.setItem('student_session', JSON.stringify(studentData));
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
    if (isTeacher) {
      await supabase.auth.signOut();
      setUser(null);
      setTeacher(null);
    }
    if (isStudent) {
      setStudent(null);
      localStorage.removeItem('student_session');
    }
  }

  const value = {
    user, teacher, student,
    isTeacher, isStudent, isAdmin, isAuthenticated, role, displayName,
    loading,
    signUpTeacher, signInTeacher, signInWithGoogle,
    signInStudent, studentSetPassword, signOut,
    fetchTeacherProfile, updateTeacherProfile,
  };

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
