import { appRosco, appSnake, appAhorcado } from './commonApps';

// Lista canonica de apps con modo duelo 1v1.
// Cada entrada expone lo minimo que necesita el modal de creacion.
export const DUELABLE_APPS = [appRosco, appSnake, appAhorcado].map(a => ({
  id: a.id,
  name: a.name,
  description: a.description,
  duel: a.duel,
}));

export function isDuelableApp(appId) {
  return DUELABLE_APPS.some(a => a.id === appId);
}

export function getDuelConfig(appId) {
  return DUELABLE_APPS.find(a => a.id === appId)?.duel || null;
}
