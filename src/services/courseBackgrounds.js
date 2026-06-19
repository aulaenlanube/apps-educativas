// =============================================================================
// Fondos 3D por curso — punto ÚNICO de configuración
// =============================================================================
// Hoy TODOS los cursos comparten el mismo fondo por defecto (la isla low-poly de
// Scene3DBackground, el entorno del Laboratorio de Física). El objetivo de este
// módulo es dejar el sistema CABLEADO para que, en el futuro, dar a un curso su
// propio fondo 3D sea trivial: basta con añadir una entrada a COURSE_BACKGROUNDS.
// Ninguna página necesita cambios para eso.

// Configuración por defecto que reciben todos los cursos sin override.
export const DEFAULT_COURSE_BACKGROUND = {
  kind: 'scene3d',        // tipo de fondo (hoy solo 'scene3d'; ver CourseBackground.jsx)
  ambienceId: undefined,  // ambiente concreto ('dia'|'atardecer'|'niebla'|'lluvia'|'noche'); undefined → cielo al azar
  scrim: 0.3,             // velo oscuro para legibilidad del contenido (0..1)
};

// Overrides por curso. Clave admitida (de más específica a más general):
//   `${level}/${grade}`   ej. 'primaria/3'
//   `${level}`            ej. 'eso'
// Ejemplos para el futuro (descomentar/añadir cuando haya fondos nuevos):
//   'primaria':    { kind: 'scene3d', ambienceId: 'dia',       scrim: 0.28 },
//   'eso':         { kind: 'scene3d', ambienceId: 'atardecer', scrim: 0.32 },
//   'bachillerato':{ kind: 'scene3d', ambienceId: 'noche',     scrim: 0.36 },
//   'eso/4':       { kind: 'scene3d', ambienceId: 'niebla' },
export const COURSE_BACKGROUNDS = {};

// ¿La ruta dada se renderiza SOBRE el fondo 3D? (home + páginas de selección de
// asignatura y de app, que vuelven su contenedor transparente). Misma regla que
// resolveFromPath de PersistentCourseBackground para esas rutas:
//   /                               (home)         → 0 segmentos
//   /curso/:level/:grade            (asignaturas)  → 3 segmentos
//   /curso/:level/:grade/:subjectId (apps)         → 4 segmentos
// NO incluye la ruta de app individual (/app/:appId): esa monta su propio header
// (AppRunnerPage) con su preset, no el Header compartido. Fuente única de verdad
// para que el chrome sobre el 3D (p.ej. la campana de notificaciones) use su
// variante de cristal en AMBOS temas, en vez de depender de light/dark.
export function isOver3DRoute(pathname = '') {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 0 || (parts[0] === 'curso' && (parts.length === 3 || parts.length === 4));
}

// Devuelve la config de fondo para un curso (level + grade), aplicando overrides.
export function getCourseBackground(level, grade) {
  if (!level) return DEFAULT_COURSE_BACKGROUND;
  return (
    COURSE_BACKGROUNDS[`${level}/${grade}`] ||
    COURSE_BACKGROUNDS[level] ||
    DEFAULT_COURSE_BACKGROUND
  );
}

// -----------------------------------------------------------------------------
// Política del fondo de curso en las APPS individuales
// -----------------------------------------------------------------------------
// El fondo de curso se monta por DEFECTO en las apps con preset 'standard' (las
// de tarjetas claras). Quedan fuera:
//   · Las apps con preset NO 'standard' (terminal-retro, isla-de-la-calma,
//     laboratorio-fisica, sistema-solar, célula animal/vegetal, mesa-crafteo,
//     cazapalabras-3d): ya traen su propio fondo inmersivo (esto lo resuelve el
//     preset, no hace falta listarlas aquí).
//   · runner: preset 'reduced' (chrome retro) PERO usa el fondo 3D de curso
//     (excepción explícita en courseBackgroundEnabledForApp).
//   · Las dos listas de abajo (se comparan por id EXACTO de app).

// (1) Apps 'standard' que pintan su PROPIO lienzo a pantalla completa (3D u otro):
//     el fondo de curso no aportaría nada y solo gastaría GPU.
export const APPS_WITH_OWN_SCENE = [
  'la-fortaleza',
  'visualizador-3d',
  'laboratorio-funciones-2d',
  'excavacion-selectiva',
  'misiones-roboticas',
  'laboratorio-robotica',
  'programacion-bloques',
];

// (2) Apps 'standard' cuyo diseño NO permite (todavía) el fondo 3D: colocan texto
//     o controles oscuros DIRECTAMENTE sobre el fondo de página, que perderían
//     legibilidad sobre la escena 3D con velo. Conservan su fondo claro clásico.
//     Esta lista se puede ir REDUCIENDO según se adapten esas apps (mover su texto
//     a tarjetas o aclarar sus colores).
//     Banco de Recursos Tutoriales y Generador de Personajes Históricos ya se han
//     adaptado (su UI va en tarjetas/paneles blancos legibles y sus títulos se
//     aclararon con sombra), así que ahora muestran el fondo 3D de curso como el
//     resto de apps 'standard'.
export const APPS_KEEP_LIGHT_BG = [];

const _appsWithoutCourseBg = new Set([...APPS_WITH_OWN_SCENE, ...APPS_KEEP_LIGHT_BG]);

export function appHasOwnBackground(appId = '') {
  return _appsWithoutCourseBg.has(appId);
}

// ¿Debe montarse el fondo de curso para esta app?
//   appFlag === true  → forzar SIEMPRE (override por app vía `fondo3D: true`)
//   appFlag === false → desactivar SIEMPRE (override por app vía `fondo3D: false`)
//   undefined         → por defecto: solo apps 'standard' sin fondo propio
export function courseBackgroundEnabledForApp(appId, presetName, appFlag) {
  if (appFlag === true) return true;
  if (appFlag === false) return false;
  // runner conserva su preset 'reduced' (chrome retro verde sobre el juego) pero
  // SÍ muestra el fondo 3D de curso: excepción explícita al guard de preset.
  if (appId === 'runner') return !appHasOwnBackground(appId);
  if (presetName && presetName !== 'standard') return false;
  return !appHasOwnBackground(appId);
}

// Nombre del preset de cabecera de una app a partir SOLO de su id (reglas de
// string). Fuente única compartida por AppRunnerPage (estilo del header) y por
// el fondo persistente (PersistentCourseBackground) para decidir, a partir de la
// URL, si una app individual debe mostrar el fondo de curso.
export function getHeaderPresetName(appId = '') {
  if (appId === 'terminal-retro') return 'dark-green';
  if (appId.startsWith('isla-de-la-calma')) return 'calma';
  if (appId === 'laboratorio-fisica') return 'inmersivo';
  if (['sistema-solar', 'celula-animal', 'celula-vegetal', 'mesa-crafteo', 'cazapalabras-3d'].some((id) => appId.includes(id))) return 'dark-glass';
  if (appId === 'runner') return 'reduced';
  return 'standard';
}

// Versión que solo necesita el id (deriva el preset). La usa el fondo persistente
// para decidir desde la URL. No considera el override `fondo3D` por app (que vive
// en la config y hoy no usa ninguna): AppRunnerPage sí lo respeta vía la función
// de arriba para el estilo del propio contenedor.
export function courseBackgroundEnabledForAppId(appId) {
  return courseBackgroundEnabledForApp(appId, getHeaderPresetName(appId), undefined);
}
