// src/components/ui/BackgroundSceneSelector.jsx
// Selector del ENTORNO del fondo 3D (Ciudad / Naturaleza / Espacio), con el mismo estilo
// que GraphicsQualitySelector (fila compacta). Lo usa el pie para quien no
// tiene cuenta; con sesión también está en el menú de usuario y en la barra
// lateral móvil. Ver src/services/backgroundScene.js.
import React from 'react';
import { Wallpaper } from 'lucide-react';
import useBackgroundScene from '@/hooks/useBackgroundScene';
import { BG_SCENES } from '@/services/backgroundScene';
import './GraphicsQualitySelector.css';

export default function BackgroundSceneSelector({ className = '' }) {
  const { scene, setScene } = useBackgroundScene();
  return (
    <div className={`gfxsel-row ${className}`} role="group" aria-label="Fondo de la plataforma">
      <span className="gfxsel-label"><Wallpaper size={14} /> Fondo</span>
      <div className="gfxsel-buttons">
        {BG_SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={scene === s.id ? 'active' : ''}
            aria-pressed={scene === s.id}
            onClick={() => setScene(s.id)}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
