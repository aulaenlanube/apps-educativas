import React, { Suspense } from 'react';
import { getCourseBackground } from '@/services/courseBackgrounds';
import { isWebGLAvailable } from '@/services/graphicsQuality';
import useBackgroundScene from '@/hooks/useBackgroundScene';
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
//
// ENTORNO (preferencia del usuario, src/services/backgroundScene.js):
//   'ciudad'     → CityBackground (metrópolis futurista) — por defecto
//   'naturaleza' → Scene3DBackground (isla low-poly; ambienceId solo aplica aquí)
//   'espacio'    → SpaceBackground (viaje a las estrellas)
// Se cambia en vivo desde el menú de usuario, la barra lateral móvil o el pie.
// Cada entorno es su propio chunk lazy: quien usa uno no descarga los otros.
const Scene3DBackground = React.lazy(() => import('@/components/ui/Scene3DBackground'));
const CityBackground = React.lazy(() => import('@/components/ui/city/CityBackground'));
const SpaceBackground = React.lazy(() => import('@/components/ui/space/SpaceBackground'));

export default function CourseBackground({ level, grade, ambienceId, scrim, className, style }) {
  const { scene } = useBackgroundScene();
  const cfg = getCourseBackground(level, grade);
  if (!cfg || cfg.kind === 'none') return null;

  switch (cfg.kind) {
    case 'scene3d':
    default: {
      const isCity = scene === 'ciudad';
      const isSpace = scene === 'espacio';
      const veil = scrim ?? (isCity ? cfg.cityScrim ?? cfg.scrim : isSpace ? cfg.spaceScrim ?? cfg.scrim : cfg.scrim);
      const flat = (
        <Scene3DFallbackBackground
          variant={isCity || isSpace ? scene : 'naturaleza'}
          scrim={veil}
          className={className}
          style={style}
        />
      );
      if (!isWebGLAvailable()) return flat;
      return (
        <WebGLBoundary key={scene} fallback={flat}>
          <Suspense fallback={isCity || isSpace ? flat : null}>
            {isCity ? (
              <CityBackground scrim={veil} className={className} style={style} />
            ) : isSpace ? (
              <SpaceBackground scrim={veil} className={className} style={style} />
            ) : (
              <Scene3DBackground
                ambienceId={ambienceId ?? cfg.ambienceId}
                scrim={veil}
                className={className}
                style={style}
              />
            )}
          </Suspense>
        </WebGLBoundary>
      );
    }
  }
}
