import React, { Suspense } from 'react';
import { getCourseBackground } from '@/services/courseBackgrounds';

// Fondo 3D ambiental del CURSO. Reutilizable en la página de asignaturas, la de
// apps y dentro de las apps individuales. Resuelve la configuración del curso
// (getCourseBackground) y monta el componente de fondo adecuado según su `kind`.
//
// Para AÑADIR un tipo de fondo nuevo en el futuro (p. ej. una escena propia por
// curso), basta con: (1) registrar el `kind` en COURSE_BACKGROUNDS y (2) añadir
// aquí su `case`. Las páginas que lo usan no cambian.
//
// Se carga en LAZY para no arrastrar three.js al bundle de quien no lo necesita.
//
// Uso: colócalo como primer hijo de un contenedor con `isolation: 'isolate'` y
// asegúrate de que el contenido va por encima (position: relative; z-index ≥ 1).
//
// Props opcionales ambienceId/scrim: si se pasan, tienen prioridad sobre la
// config del curso (override puntual, p. ej. por app).
const Scene3DBackground = React.lazy(() => import('@/components/ui/Scene3DBackground'));

export default function CourseBackground({ level, grade, ambienceId, scrim, className, style }) {
  const cfg = getCourseBackground(level, grade);
  if (!cfg || cfg.kind === 'none') return null;

  switch (cfg.kind) {
    case 'scene3d':
    default:
      return (
        <Suspense fallback={null}>
          <Scene3DBackground
            ambienceId={ambienceId ?? cfg.ambienceId}
            scrim={scrim ?? cfg.scrim}
            className={className}
            style={style}
          />
        </Suspense>
      );
  }
}
