import React, { Suspense } from 'react';
import { getCourseBackground } from '@/services/courseBackgrounds';
import { isWebGLAvailable } from '@/services/graphicsQuality';
import WebGLBoundary from '@/components/ui/WebGLBoundary';
import Scene3DFallbackBackground from '@/components/ui/Scene3DFallbackBackground';

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
// Si el navegador no puede crear un contexto WebGL (Brave con el bloqueo de
// huella digital en "estricto", aceleración por hardware desactivada, GPU en
// lista negra) ni siquiera se importa la escena: se pinta un fondo plano
// equivalente. La WebGLBoundary cubre el caso en que la sonda pasa pero la
// creación del renderer falla igualmente — sin ella, el error de three sube
// hasta react-router y tumba TODA la plataforma con "Unexpected Application
// Error" (este fondo se monta en App, o sea en todas las rutas).
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
    default: {
      const flat = (
        <Scene3DFallbackBackground scrim={scrim ?? cfg.scrim} className={className} style={style} />
      );
      if (!isWebGLAvailable()) return flat;
      return (
        <WebGLBoundary fallback={flat}>
          <Suspense fallback={null}>
            <Scene3DBackground
              ambienceId={ambienceId ?? cfg.ambienceId}
              scrim={scrim ?? cfg.scrim}
              className={className}
              style={style}
            />
          </Suspense>
        </WebGLBoundary>
      );
    }
  }
}
