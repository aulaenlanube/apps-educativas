// Barras de energía (Ep / Ec / E total). Recibe valores ya throttled por el
// shell (~10 Hz), así que puede ser un componente React normal.
import React from 'react';
import { fmt } from '../engine/integrator';

export default function EnergyBars({ items, max }) {
  const top = Math.max(max || 0, ...items.map((i) => Math.abs(i.value)), 1);
  return (
    <div className="fislab-energy">
      {items.map((i) => (
        <div className="fislab-energy-row" key={i.label}>
          <span className="fislab-energy-label">{i.label}</span>
          <div className="fislab-energy-track">
            <div
              className="fislab-energy-fill"
              style={{ width: `${Math.min(100, (Math.abs(i.value) / top) * 100)}%`, background: i.color }}
            />
          </div>
          <span className="fislab-energy-value">{fmt(i.value, 0)} J</span>
        </div>
      ))}
    </div>
  );
}
