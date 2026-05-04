import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Identidad unificada para los flujos de duelos. Devuelve la información
// del usuario actual con la forma exacta que necesitan los hooks/components
// de duelo (DuelLobby, useDuel, DuelChatBar). Funciona tanto para alumnos
// (autenticados con session_token) como para docentes/admin (auth.uid).
//
// Devuelve `null` si no hay usuario válido para participar en un duelo
// (por ejemplo, free user o anonymous).
export default function useDuelActor() {
  const { student, teacher, isStudent, isTeacher } = useAuth();
  return useMemo(() => {
    if (isTeacher && teacher) {
      return {
        id: teacher.id,
        type: 'teacher',
        name: teacher.display_name || 'Docente',
        emoji: teacher.avatar_emoji || '🎓',
        color: teacher.avatar_color || 'from-blue-500 to-purple-500',
        selectedAvatarCode: teacher.selected_avatar_code || null,
        sessionToken: null,
      };
    }
    if (isStudent && student) {
      return {
        id: student.id,
        type: 'student',
        name: student.display_name || student.username,
        emoji: student.avatar_emoji || '🎓',
        color: student.avatar_color || null,
        selectedAvatarCode: student.selected_avatar_code || null,
        sessionToken: student.session_token,
      };
    }
    return null;
  }, [student, teacher, isStudent, isTeacher]);
}
