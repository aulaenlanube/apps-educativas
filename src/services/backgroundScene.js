// src/services/backgroundScene.js
// Preferencia del ENTORNO del fondo 3D de la plataforma (home, catálogo, cursos,
// asignaturas y apps 'standard'). Es independiente de la calidad gráfica:
//   'ciudad'     → metrópolis futurista (src/components/ui/city/) — POR DEFECTO
//   'naturaleza' → isla low-poly del Laboratorio de Física (Scene3DBackground)
//
// Se guarda por dispositivo en localStorage y se aplica en vivo (sin recargar) a
// todos los consumidores con un CustomEvent; otras pestañas se enteran por el
// evento 'storage'. Todo acceso a storage va en try/catch (modo privado, iframes
// con storage bloqueado…): si falla, se usa el valor por defecto.
//
// OJO: Laboratorio de Física y Cazapalabras 3D montan Scene3DBackground
// directamente en sus menús y NO dependen de esta preferencia (siempre isla).

export const BG_SCENE_KEY = 'eduapps-bg-scene';
export const BG_SCENE_EVENT = 'eduapps:bg-scene-change';
export const DEFAULT_BG_SCENE = 'ciudad';

export const BG_SCENES = [
  { id: 'ciudad', name: 'Ciudad', emoji: '🌆' },
  { id: 'naturaleza', name: 'Naturaleza', emoji: '🏝️' },
];

const VALID = BG_SCENES.map((s) => s.id);

export const isValidBgScene = (v) => VALID.includes(v);

export function loadBgScene() {
  try {
    const v = localStorage.getItem(BG_SCENE_KEY);
    return isValidBgScene(v) ? v : DEFAULT_BG_SCENE;
  } catch {
    return DEFAULT_BG_SCENE;
  }
}

export function saveBgScene(v) {
  if (!isValidBgScene(v)) return;
  try { localStorage.setItem(BG_SCENE_KEY, v); } catch { /* modo privado */ }
  try { window.dispatchEvent(new CustomEvent(BG_SCENE_EVENT, { detail: v })); } catch { /* tests sin DOM */ }
}

export const bgSceneName = (id) => BG_SCENES.find((s) => s.id === id)?.name || BG_SCENES[0].name;
