// Mirilla de primera persona (DOM, fija en el centro). Sin arma ni manos.
import React from 'react';

export default function Crosshair({ cooling = false }) {
  return (
    <div className={`cz3d-crosshair ${cooling ? 'cooling' : ''}`} aria-hidden="true">
      <span className="cz3d-ch-ring" />
      <span className="cz3d-ch-dot" />
      <span className="cz3d-ch arm t" />
      <span className="cz3d-ch arm b" />
      <span className="cz3d-ch arm l" />
      <span className="cz3d-ch arm r" />
    </div>
  );
}
