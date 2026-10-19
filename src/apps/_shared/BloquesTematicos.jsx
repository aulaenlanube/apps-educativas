// src/apps/_shared/BloquesTematicos.jsx
// Selector de bloque temático para Ordena la Frase / Ordena la Historia.
// Los datos llegan como [{ s, t }] (s = frase o historia, t = bloque o null).
// Solo se ofrecen los bloques con contenido suficiente para no repetir enseguida
// (el examen usa 5 elementos); los demás elementos siguen saliendo en "Todos".
import React, { useMemo, useState } from 'react';
import { Layers, Shuffle } from 'lucide-react';
import './BloquesTematicos.css';

const keyOf = (s) => (typeof s === 'string' ? s : JSON.stringify(s)).trim().toLowerCase();

export function useBloquesTematicos(items, minPorBloque) {
  const [bloque, setBloque] = useState(null);

  const bloques = useMemo(() => {
    const porBloque = new Map();
    for (const it of items || []) {
      if (!it?.t) continue;
      if (!porBloque.has(it.t)) porBloque.set(it.t, new Set());
      porBloque.get(it.t).add(keyOf(it.s));
    }
    return [...porBloque.entries()]
      .filter(([, set]) => set.size >= minPorBloque)
      .map(([nombre, set]) => ({ nombre, total: set.size }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [items, minPorBloque]);

  // Si el bloque elegido deja de existir (cambio de curso), volvemos a "Todos".
  const activo = bloques.some((b) => b.nombre === bloque) ? bloque : null;

  const elementos = useMemo(
    () => (items || []).filter((it) => !activo || it.t === activo).map((it) => it.s),
    [items, activo],
  );

  return { bloques, bloque: activo, setBloque, elementos };
}

export function BloquePicker({ bloques, value, onChange, total, unidad = 'frases' }) {
  // Con un solo bloque no hay nada que elegir.
  if (!bloques || bloques.length < 2) return null;
  return (
    <div className="bqt" role="group" aria-label="Bloque temático">
      <span className="bqt__label"><Layers size={15} /> Bloque temático</span>
      <div className="bqt__list">
        <button
          type="button"
          className={`bqt__opt ${value == null ? 'is-active' : ''}`}
          aria-pressed={value == null}
          onClick={() => onChange(null)}
          title={`Todas las ${unidad} mezcladas`}
        >
          <Shuffle size={14} /> Todos
          {total > 0 && <span className="bqt__count">{total}</span>}
        </button>
        {bloques.map((b) => (
          <button
            key={b.nombre}
            type="button"
            className={`bqt__opt ${value === b.nombre ? 'is-active' : ''}`}
            aria-pressed={value === b.nombre}
            onClick={() => onChange(b.nombre)}
            title={`${b.total} ${unidad}`}
          >
            {b.nombre}
            <span className="bqt__count">{b.total}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
