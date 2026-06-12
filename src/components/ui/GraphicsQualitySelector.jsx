// src/components/ui/GraphicsQualitySelector.jsx
// Selector del ajuste GLOBAL de calidad gráfica (compartido por las apps 3D).
// variant 'row'  → fila compacta para pantallas de selección de modo o ajustes.
// variant 'card' → bloque con título y descripción para páginas de perfil.
// Añade la clase 'gfxsel-on-dark' cuando se muestre sobre fondo oscuro de app.
import React from 'react';
import { Settings2 } from 'lucide-react';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { QUALITY_LEVELS, QUALITY_LABELS } from '@/services/graphicsQuality';
import './GraphicsQualitySelector.css';

export default function GraphicsQualitySelector({ variant = 'row', className = '' }) {
  const { pref, tier, setPref } = useGraphicsQuality();

  const buttons = (
    <div className="gfxsel-buttons">
      <button type="button" className={pref === 'auto' ? 'active' : ''} onClick={() => setPref('auto')}>
        🪄 Auto
      </button>
      {QUALITY_LEVELS.map((l) => (
        <button key={l.id} type="button" className={pref === l.id ? 'active' : ''} onClick={() => setPref(l.id)}>
          {l.icon} {l.name}
        </button>
      ))}
    </div>
  );

  if (variant === 'card') {
    return (
      <div className={`gfxsel-card ${className}`}>
        <div className="gfxsel-card-title"><Settings2 size={15} /> Calidad gráfica</div>
        {buttons}
        <p className="gfxsel-note">
          Se aplica en este dispositivo a las apps con gráficos 3D (La Fortaleza, Laboratorio de Física…).
          Nivel activo: <strong>{QUALITY_LABELS[tier]}</strong>.
          {pref === 'auto' && ' En Auto se ajusta solo a la potencia del equipo.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`gfxsel-row ${className}`}>
      <span className="gfxsel-label"><Settings2 size={14} /> Gráficos</span>
      {buttons}
    </div>
  );
}
