import React from 'react';
import { useLocation } from 'react-router-dom';
import CourseBackground from '@/components/ui/CourseBackground';
import { courseBackgroundEnabledForAppId } from '@/services/courseBackgrounds';

// Fondo 3D PERSISTENTE de la zona de cursos. Se monta UNA sola vez (en App) y
// decide qué mostrar a partir de la URL. Como App no se desmonta al navegar,
// el mismo canvas permanece montado durante curso → asignatura → app: NO se
// reinicia ni cambia el cielo, solo cambia la UI de delante.
//
// Rutas con fondo:
//   /curso/:level/:grade                          → asignaturas
//   /curso/:level/:grade/:subjectId               → apps
//   /curso/:level/:grade/:subjectId/app/:appId    → app individual (si es 'standard')
//
// Va DETRÁS de todo (z-index -1); las páginas con fondo son transparentes.
function resolveFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'curso' || parts.length < 3) return null;
  const level = parts[1];
  const grade = parts[2];
  // asignaturas (len 3) y apps (len 4)
  if (parts.length === 3 || parts.length === 4) return { level, grade };
  // app individual: /curso/level/grade/subjectId/app/appId
  if (parts.length === 6 && parts[4] === 'app') {
    return courseBackgroundEnabledForAppId(parts[5]) ? { level, grade } : null;
  }
  return null;
}

export default function PersistentCourseBackground() {
  const { pathname } = useLocation();
  const target = resolveFromPath(pathname);
  if (!target) return null;
  return <CourseBackground level={target.level} grade={target.grade} style={{ zIndex: -1 }} />;
}
