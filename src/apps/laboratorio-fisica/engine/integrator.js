// Paso fijo con acumulador: la física avanza SIEMPRE a 1/120 s, independiente
// del framerate y del tier gráfico. El dt de frame se capa a 0,25 s para que
// una congelación de rAF (pestaña en segundo plano, GC largo) no provoque la
// espiral de la muerte al volver.
export const FIXED_DT = 1 / 120;
export const MAX_FRAME_DT = 0.25;

// Las comparaciones didácticas (examen, retos) se hacen a 3 cifras
// significativas: Math.sin/cos/pow no son bit-exactas entre motores JS.
export function round3(x) {
  if (!Number.isFinite(x) || x === 0) return 0;
  const mag = Math.pow(10, 2 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * mag) / mag;
}

// Tolerancia mixta para predicciones numéricas: 5% relativo con suelo
// absoluto (el relativo puro exige exactitud infinita cuando la respuesta ~0).
export function answerMatches(given, expected, absTol = 0.05) {
  if (!Number.isFinite(given)) return false;
  const tol = Math.max(Math.abs(expected) * 0.05, absTol);
  return Math.abs(given - expected) <= tol;
}

// Error relativo (para el bonus de precisión: clavarla a <1%)
export function relError(given, expected) {
  const base = Math.max(Math.abs(expected), 1e-9);
  return Math.abs(given - expected) / base;
}

// Parsea entrada numérica del alumno aceptando coma o punto decimal
export function parseStudentNumber(text) {
  if (typeof text !== 'string') return NaN;
  const clean = text.trim().replace(/\s/g, '').replace(',', '.');
  if (!clean || !/^[-+]?\d*\.?\d+([eE][-+]?\d+)?$/.test(clean)) return NaN;
  return parseFloat(clean);
}

// Formatea con coma decimal española
export function fmt(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
