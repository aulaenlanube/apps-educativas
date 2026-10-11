import React from 'react';
import MascotLogo from '@/components/ui/MascotLogo';
import './BrandLoader.css';

// Indicador de carga de la plataforma: la cara del robot mascota dentro de un
// anillo de luz que gira. Sustituye al spinner genérico de Tailwind.
// CSS puro (transform/opacity) → lo compone la GPU, no repinta la página.
//   variant="page"   → bloque de 50vh (fallback de rutas perezosas)
//   variant="screen" → pantalla completa con el fondo suave de los paneles
//   variant="inline" → solo el indicador
const BrandLoader = ({ variant = 'page', label = 'Cargando…', className = '' }) => (
  <div className={`brand-loader brand-loader--${variant} ${className}`} role="status" aria-live="polite">
    <div className="brand-loader__orb" aria-hidden="true">
      <span className="brand-loader__ring" />
      <span className="brand-loader__ring brand-loader__ring--inner" />
      <span className="brand-loader__face">
        <MascotLogo className="w-full h-full" />
      </span>
    </div>
    <span className="brand-loader__label">{label}</span>
  </div>
);

export default BrandLoader;
