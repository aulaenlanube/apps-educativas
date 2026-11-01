import { lazy } from 'react';

const RoscoDuel         = lazy(() => import('../rosco/RoscoDuel'));
const SnakeDuel         = lazy(() => import('../snake/SnakeDuel'));
const AhorcadoDuel      = lazy(() => import('../ahorcado/AhorcadoDuel'));
const NavePalabrasDuel  = lazy(() => import('../nave-palabras/NavePalabrasDuel'));
const OrdenaBolasDuel   = lazy(() => import('../ordena-bolas/OrdenaBolasDuel'));
const ExploradorMundoDuel = lazy(() => import('../explorador-mundo/ExploradorMundoDuel'));
const ExploradorEspanaDuel = lazy(() => import('../explorador-espana/ExploradorEspanaDuel'));

// Mapa app_id -> componente duelable. Se monta desde AppRunnerPage
// cuando la URL incluye ?duel=<id>.
export const DUEL_COMPONENTS = {
  'rosco-del-saber': RoscoDuel,
  'snake': SnakeDuel,
  'ahorcado': AhorcadoDuel,
  'nave-palabras': NavePalabrasDuel,
  'ordena-bolas': OrdenaBolasDuel,
  'explorador-mundo': ExploradorMundoDuel,
  'explorador-espana': ExploradorEspanaDuel,
};

export function getDuelComponent(appId) {
  return DUEL_COMPONENTS[appId] || null;
}
