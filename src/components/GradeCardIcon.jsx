import React from 'react';
import ArtFrame from '@/components/art/ArtFrame';
import PRIMARIA from '@/components/icons/grade/primaria';
import SECUNDARIA from '@/components/icons/grade/secundaria';

// Ilustración de las tarjetas de curso de la home (rediseño 2026).
// Los dibujos viven en src/components/icons/grade/* y siguen el contrato de
// rendimiento de src/components/art/README.md: sin filtros, sin animaciones
// inline; en reposo solo flota el icono entero (GPU, nivel de efectos alto) y
// lo vistoso ocurre al pasar el ratón por la tarjeta (.group).
const ICONS = { ...PRIMARIA, ...SECUNDARIA };

// Desfase de la flotación para que las tarjetas no se muevan al unísono
const FLOAT_DELAY = {
  'primaria-1': 0, 'primaria-2': -1.2, 'primaria-3': -2.4, 'primaria-4': -0.6, 'primaria-5': -1.8, 'primaria-6': -3,
  'eso-1': -0.4, 'eso-2': -1.6, 'eso-3': -2.8, 'eso-4': -1, 'bachillerato-1': -2, 'bachillerato-2': -0.8, 'ad-1': -1.4,
};

const GradeCardIcon = ({ type, grade, className = '' }) => {
  const key = `${type}-${grade}`;
  const Icon = ICONS[key];
  if (!Icon) return null;
  const size = type === 'primaria' ? 160 : type === 'bachillerato' ? 150 : 155;
  return (
    // lift={false}: la tarjeta (.home-grade__icon) ya realza el icono al pasar el ratón
    <ArtFrame
      float
      lift={false}
      floatDelay={FLOAT_DELAY[key] ?? 0}
      className={`relative ${className}`}
      style={{ width: size, height: size, margin: '-10px auto' }}
    >
      <Icon />
    </ArtFrame>
  );
};

export default GradeCardIcon;
