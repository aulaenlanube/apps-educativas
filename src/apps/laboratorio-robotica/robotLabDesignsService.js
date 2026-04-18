// Servicio de diseños del "Modo libre" del Laboratorio de Robótica.
// - Si el usuario está autenticado (alumno o docente), guarda en Supabase.
// - Si no, usa localStorage como respaldo (solo en ese navegador).

import { supabase } from '@/lib/supabase';

const LS_KEY = 'rob_lab_designs_v1';

// ---- Utilidades de localStorage ------------------------------------------
function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocal(designs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(designs)); } catch {}
}

// ---- API -----------------------------------------------------------------

/**
 * Lista los diseños guardados por el usuario. Si no hay sesión, usa
 * localStorage. Devuelve un array de { id, name, updated_at, components, wires }.
 * `id` puede ser número (Supabase) o string (local).
 */
export async function listDesigns({ userId, userType } = {}) {
  if (userId && userType) {
    const { data, error } = await supabase.rpc('list_robot_lab_designs', {
      p_user_id: userId,
      p_user_type: userType,
    });
    if (!error && data) return data;
    console.warn('[robotLab] list error, fallback local:', error?.message);
  }
  return readLocal();
}

/**
 * Guarda (insert si id es null, update si no) y devuelve el id resultante.
 */
export async function saveDesign({ id, userId, userType, name, components, wires }) {
  const cleanName = (name || '').trim() || 'Mi diseño';
  if (userId && userType) {
    const { data, error } = await supabase.rpc('save_robot_lab_design', {
      p_id: id ?? null,
      p_user_id: userId,
      p_user_type: userType,
      p_name: cleanName,
      p_components: components,
      p_wires: wires,
    });
    if (!error && data != null) return data;
    console.warn('[robotLab] save error, fallback local:', error?.message);
  }
  // Local fallback
  const designs = readLocal();
  const now = new Date().toISOString();
  if (id) {
    const idx = designs.findIndex((d) => String(d.id) === String(id));
    if (idx >= 0) {
      designs[idx] = { ...designs[idx], name: cleanName, components, wires, updated_at: now };
      writeLocal(designs);
      return designs[idx].id;
    }
  }
  const newId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  designs.unshift({ id: newId, name: cleanName, components, wires, updated_at: now });
  writeLocal(designs);
  return newId;
}

/** Borra un diseño propio. */
export async function deleteDesign({ id, userId, userType }) {
  if (userId && userType && typeof id === 'number') {
    const { error } = await supabase.rpc('delete_robot_lab_design', {
      p_id: id,
      p_user_id: userId,
      p_user_type: userType,
    });
    if (!error) return true;
    console.warn('[robotLab] delete error:', error?.message);
    return false;
  }
  // Local fallback
  const designs = readLocal();
  const next = designs.filter((d) => String(d.id) !== String(id));
  if (next.length !== designs.length) {
    writeLocal(next);
    return true;
  }
  return false;
}
