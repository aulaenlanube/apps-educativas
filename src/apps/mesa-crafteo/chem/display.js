// src/apps/mesa-crafteo/chem/display.js
// Modelo + geometría "de exposición" de una molécula del catálogo, cacheados
// (el álbum pinta decenas de planos a la vez).
import { modelFromMolecule } from './graph';
import { computeLayout } from './layout';

const cache = new Map();

export function displayOf(mol) {
  if (!cache.has(mol.id)) {
    const model = modelFromMolecule(mol);
    cache.set(mol.id, { model, layout: computeLayout(model, null, { fresh: true, display: true }) });
  }
  return cache.get(mol.id);
}
