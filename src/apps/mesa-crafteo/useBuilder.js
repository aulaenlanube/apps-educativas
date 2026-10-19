// src/apps/mesa-crafteo/useBuilder.js
// Estado de la mesa de construcción: modelo + geometría + selección + deshacer.
// Reglas de interacción (pensadas para un solo dedo):
//  · Tocar un elemento de la paleta lo une al átomo seleccionado (anillo ámbar),
//    que sigue seleccionado mientras tenga huecos; si se llena, la selección
//    pasa al último colocado que tenga huecos. Mesa vacía → primer átomo.
//  · Tocar un átomo o uno de sus huecos lo selecciona (el siguiente irá ahí).
//  · Tocar un enlace sube su orden 1 → 2 → 3 (si los dos átomos tienen hueco) y vuelve a 1.
//  · Modo Enlazar: tocar dos átomos con hueco los une (cerrar anillos).
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  emptyModel, addAtom, linkAtoms, cycleBond, removeAtom, attachTarget, atomStatus, findBond, neighborsOf,
} from './chem/graph';
import { computeLayout, bestSlot } from './chem/layout';
import { tokenInfo } from './chem/elements';

const HISTORY_MAX = 60;

const initial = (model = emptyModel(), fresh = true) => ({
  model,
  layout: computeLayout(model, null, { fresh, display: fresh && model.atoms.length > 0 }),
  selected: model.atoms.length ? attachTarget(model, null) : null,
  nextSlot: null,
  link: false,
  linkFrom: null,
  history: [],
  placed: model.atoms.length,
  lastAdded: null,
  rev: 0,
});

export default function useBuilder() {
  const [st, setState] = useState(() => initial());
  // Estado vigente fuera del ciclo de render: las acciones lo leen y escriben
  // al momento (toques rápidos seguidos y mensajes de vuelta síncronos).
  const cur = useRef(st);
  const setSt = useCallback((fn) => {
    const next = fn(cur.current);
    if (next !== cur.current) { cur.current = next; setState(next); }
  }, []);

  const commit = useCallback((prev, patch) => ({
    ...prev,
    ...patch,
    history: [...prev.history.slice(-HISTORY_MAX + 1), { model: prev.model, layout: prev.layout, selected: prev.selected }],
    rev: prev.rev + 1,
  }), []);

  // Cada acción devuelve un mensaje (o null) para el "entrenador" de la interfaz.
  const addToken = useCallback((tok, where = null) => {
    let msg = null;
    setSt((prev) => {
      const { model, layout } = prev;
      if (!model.atoms.length) {
        const r = addAtom(model, tok, null);
        const lay = computeLayout(r.model, layout);
        return commit(prev, { model: r.model, layout: lay, selected: r.id, nextSlot: null, placed: prev.placed + 1, lastAdded: r.id, link: false, linkFrom: null });
      }
      const target = where?.atomId ?? attachTarget(model, prev.selected);
      if (target == null) { msg = 'Todos los átomos tienen sus enlaces completos. Quita alguno o toca un enlace para cambiarlo.'; return prev; }
      const tst = atomStatus(model, target);
      if (!tst || tst.room < 1) {
        msg = `El ${tokenInfo(tst?.tok || 'H').label} ya tiene todos sus enlaces. Elige un átomo con huecos brillantes.`;
        return prev;
      }
      const r = addAtom(model, tok, target);
      if (!r) return prev;
      let slotIdx = where?.slotIdx;
      if (slotIdx == null && prev.nextSlot?.atomId === target) slotIdx = prev.nextSlot.idx;
      if (slotIdx == null) slotIdx = bestSlot(layout, target);
      const dir = slotIdx != null ? layout.dom[target]?.slots[slotIdx] : null;
      const lay = computeLayout(r.model, layout, { hint: dir ? { id: r.id, dir } : null });
      // la selección se queda en el átomo de destino mientras le queden huecos
      // (CO₂: C, O, O → los dos O al C); si se llena, pasa al último con huecos.
      const sel = attachTarget(r.model, target) ?? target;
      return commit(prev, { model: r.model, layout: lay, selected: sel, nextSlot: null, placed: prev.placed + 1, lastAdded: r.id, link: false, linkFrom: null });
    });
    return msg;
  }, [commit, setSt]);

  const tapAtom = useCallback((id) => {
    let msg = null;
    setSt((prev) => {
      if (prev.link) {
        if (prev.linkFrom == null || prev.linkFrom === id) {
          const s = atomStatus(prev.model, id);
          if (!s || s.room < 1) { msg = 'Ese átomo no tiene huecos libres para otro enlace.'; return prev; }
          return { ...prev, linkFrom: id };
        }
        if (findBond(prev.model, prev.linkFrom, id)) { msg = 'Esos dos átomos ya están unidos: toca el enlace para hacerlo doble.'; return { ...prev, linkFrom: id }; }
        const m = linkAtoms(prev.model, prev.linkFrom, id);
        if (!m) { msg = 'Los dos átomos necesitan un hueco libre para unirse.'; return prev; }
        const lay = computeLayout(m, null, { fresh: true });
        msg = '¡Enlace creado!';
        return commit(prev, { model: m, layout: lay, link: false, linkFrom: null, selected: attachTarget(m, id) ?? id });
      }
      return { ...prev, selected: id, nextSlot: null };
    });
    return msg;
  }, [commit, setSt]);

  const tapSlot = useCallback((id, k) => {
    setSt((prev) => {
      if (prev.link) return prev;
      return { ...prev, selected: id, nextSlot: { atomId: id, idx: k } };
    });
  }, [setSt]);

  const tapBond = useCallback((a, b) => {
    let msg = null;
    setSt((prev) => {
      const m = cycleBond(prev.model, a, b);
      if (!m) { msg = 'Para hacer un enlace doble o triple, los dos átomos necesitan huecos libres.'; return prev; }
      const order = findBond(m, a, b).order;
      msg = order === 1 ? 'Enlace sencillo' : order === 2 ? 'Enlace doble' : 'Enlace triple';
      const lay = computeLayout(m, prev.layout);
      return commit(prev, { model: m, layout: lay, selected: attachTarget(m, prev.selected) ?? prev.selected });
    });
    return msg;
  }, [commit, setSt]);

  const removeSelected = useCallback(() => {
    setSt((prev) => {
      const id = prev.selected ?? prev.lastAdded;
      if (id == null || !prev.model.atoms.some((x) => x.id === id)) return prev;
      const m = removeAtom(prev.model, id);
      const lay = computeLayout(m, prev.layout);
      const nbs = neighborsOf(prev.model, id).filter((n) => m.atoms.some((x) => x.id === n));
      return commit(prev, { model: m, layout: lay, selected: attachTarget(m, nbs[0] ?? null), nextSlot: null, link: false, linkFrom: null });
    });
  }, [commit, setSt]);

  const undo = useCallback(() => {
    setSt((prev) => {
      const h = prev.history[prev.history.length - 1];
      if (!h) return prev;
      return {
        ...prev, model: h.model, layout: h.layout, selected: h.selected, nextSlot: null, link: false, linkFrom: null,
        history: prev.history.slice(0, -1), rev: prev.rev + 1,
      };
    });
  }, [setSt]);

  const clear = useCallback(() => {
    setSt((prev) => (prev.model.atoms.length ? commit(prev, { ...initial(), history: prev.history, placed: prev.placed }) : prev));
  }, [commit, setSt]);

  const toggleLink = useCallback(() => {
    setSt((prev) => ({ ...prev, link: !prev.link, linkFrom: !prev.link ? (prev.selected ?? null) : null }));
  }, [setSt]);

  // Sustituye la mesa (nuevo nivel, solución, exposición).
  const load = useCallback((model, { fresh = true, keepPlaced = false } = {}) => {
    setSt((prev) => ({ ...initial(model, fresh), placed: keepPlaced ? prev.placed : model.atoms.length, rev: prev.rev + 1 }));
  }, [setSt]);

  const attachId = useMemo(() => (st.link ? null : attachTarget(st.model, st.selected)), [st.model, st.selected, st.link]);

  // Átomo del que "nace" cada átomo nuevo (para la animación de aparición).
  const spawnFrom = useCallback((id) => {
    const b = st.model.bonds.find((x) => x.b === id || x.a === id);
    if (!b) return null;
    return b.a === id ? b.b : b.a;
  }, [st.model]);

  return {
    ...st, attachId, spawnFrom,
    addToken, tapAtom, tapSlot, tapBond, removeSelected, undo, clear, toggleLink, load,
    canUndo: st.history.length > 0,
  };
}
