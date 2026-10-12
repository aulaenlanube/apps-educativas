// ─────────────────────────────────────────────────────────────────────────────
// Entrada del modo mock (SOLO desarrollo). main.jsx la importa dinámicamente
// dentro de `if (import.meta.env.DEV)` y espera a `bootstrapDevMock()` antes del
// primer render, así que el cliente de Supabase ya está parcheado cuando
// AuthProvider se suscribe a `onAuthStateChange`.
//
// Con el mock apagado este módulo es mínimo: solo lee la bandera y limpia una
// posible sesión de alumno falsa. Los fixtures (pesados) se cargan bajo demanda.
// ─────────────────────────────────────────────────────────────────────────────
import { applyMockParamFromUrl, restoreRealStudentSession } from './flag.js';

export async function bootstrapDevMock() {
  const role = applyMockParamFromUrl();
  if (!role) {
    // Mock apagado: no dejar rastro de la sesión de alumno falsa.
    restoreRealStudentSession();
    return null;
  }
  const { installDevMock } = await import('./install.js');
  await installDevMock(role);
  return role;
}
