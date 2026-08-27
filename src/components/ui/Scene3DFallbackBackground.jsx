import React from 'react';

// Fondo PLANO de repuesto para cuando no hay WebGL (Brave con bloqueo de huella
// digital en "estricto", aceleración por hardware desactivada, GPU en lista
// negra…). No es un adorno opcional: las páginas que van sobre el fondo 3D
// (home, asignaturas, apps) pintan su texto en blanco, así que sin un fondo
// oscuro detrás quedarían ilegibles sobre el degradado claro del body.
//
// Imita la escena por defecto (cielo de día + horizonte + suelo) con el mismo
// velo (`scrim`) que aplica Scene3DBackground, para que el cambio pase
// desapercibido salvo por la falta de movimiento.
export default function Scene3DFallbackBackground({ scrim = 0.3, className = '', style }) {
  return (
    <div
      className={`scene3d-bg scene3d-bg--fallback ${className}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'linear-gradient(180deg, #2f7fc9 0%, #6fa9dd 38%, #bfe3ff 56%, #2c4f6e 59%, #0a1a2e 100%)',
        ...style,
      }}
    >
      {scrim > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(180deg, rgba(7,11,28,${Math.min(1, scrim + 0.12)}) 0%, rgba(7,11,28,${scrim}) 38%, rgba(7,11,28,${Math.min(1, scrim + 0.16)}) 100%)`,
          }}
        />
      )}
    </div>
  );
}
