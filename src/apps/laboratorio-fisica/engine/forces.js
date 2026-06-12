// Fuerzas elementales como funciones puras. Las escenas componen con esto su
// paso de integración (Euler semi-implícito: primero v, después x).

// Peso (módulo): P = m·g
export const peso = (m, g) => m * g;

// Rozamiento dinámico (módulo): Fr = μk·N
export const rozamientoDinamico = (muK, N) => muK * N;

// ¿Vence la fuerza aplicada al rozamiento estático máximo (μs·N)?
export const venceEstatico = (fAplicada, muS, N) => Math.abs(fAplicada) > muS * N;

// Muelle (ley de Hooke, con signo): F = −k·x
export const fuerzaMuelle = (k, x) => -k * x;

// Resistencia del aire cuadrática (módulo): Fd = ½·ρ·Cd·A·v²
export const dragCuadratico = (rho, cd, area, v) => 0.5 * rho * cd * area * v * v;

// Empuje de Arquímedes (módulo): E = ρf·g·Vsumergido
export const empuje = (rhoFluido, g, volSumergido) => rhoFluido * g * volSumergido;

// Arrastre viscoso de Stokes (módulo): F = 6π·η·r·v
export const stokesDrag = (eta, radio, v) => 6 * Math.PI * eta * radio * v;

// Paso de Euler semi-implícito para 1 grado de libertad.
// state = { x, v }; aDe(state) devuelve la aceleración con el estado actual.
export function stepEuler1D(state, aDe, dt) {
  const a = aDe(state);
  state.v += a * dt;
  state.x += state.v * dt;
  return a;
}
