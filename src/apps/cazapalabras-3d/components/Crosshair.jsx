// Mirilla de primera persona (DOM, fija en el centro). Sin arma ni manos.
// `hit` ({ id, kind }) dispara un hit-marker (X) animado por CSS: cambia de key
// en cada impacto para reiniciar la animación. Coste WebGL = 0.
import React from 'react';

export default function Crosshair({ cooling = false, hit = null }) {
  return (
    <div className={`cz3d-crosshair ${cooling ? 'cooling' : ''}`} aria-hidden="true">
      <span className="cz3d-ch-ring" />
      <span className="cz3d-ch-dot" />
      <span className="cz3d-ch arm t" />
      <span className="cz3d-ch arm b" />
      <span className="cz3d-ch arm l" />
      <span className="cz3d-ch arm r" />
      {hit && <span key={hit.id} className={`cz3d-hitmark ${hit.kind || 'word'}`} />}
    </div>
  );
}
