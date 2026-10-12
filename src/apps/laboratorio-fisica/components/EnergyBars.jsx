// Barras de energía (Ep / Ec / E total). Recibe valores ya throttled por el
// shell (~10 Hz), así que puede ser un componente React normal. La barra se
// escala con transform (sin reflow).
import React from 'react';
import { Zap } from 'lucide-react';
import { fmt } from '../engine/integrator';

export default function EnergyBars({ items, max }) {
  const top = Math.max(max || 0, ...items.map((i) => Math.abs(i.value)), 1);
  return (
    <section className="fislab-section">
      <h5 className="fislab-section__title"><Zap size={13} /> Energía</h5>
      <div className="fislab-energy">
        {items.map((i) => (
          <div className="fislab-energy__row" key={i.label} style={{ '--bar': i.color }}>
            <span className="fislab-energy__label">{i.label}</span>
            <span className="fislab-energy__track">
              <i style={{ transform: `scaleX(${Math.min(1, Math.abs(i.value) / top)})` }} />
            </span>
            <span className="fislab-energy__value">{fmt(i.value, 0)} J</span>
          </div>
        ))}
      </div>
    </section>
  );
}
