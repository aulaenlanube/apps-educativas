import React, { useCallback, useRef } from 'react';
import '@/styles/art.css';

// Contenedor de una ilustración SVG de la plataforma (ver README.md).
//   · Pausa las animaciones en reposo cuando sale de pantalla (.art-off) con
//     UN IntersectionObserver compartido por todos los iconos de la página:
//     el catálogo pinta >100 iconos y no queremos 100 observers ni re-renders.
//   · `float` hace flotar el icono entero desde el contenedor HTML (GPU),
//     no desde dentro del SVG.
//   · `lift` añade el pequeño realce al pasar el ratón.
let io = null;
const getObserver = () => {
  if (io || typeof IntersectionObserver === 'undefined') return io;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('art-off', !e.isIntersecting);
  }, { rootMargin: '120px' });
  return io;
};

const ArtFrame = ({ className = '', style, float = false, floatDelay, lift = true, children, ...rest }) => {
  const prev = useRef(null);
  const ref = useCallback((node) => {
    const obs = getObserver();
    if (prev.current && obs) obs.unobserve(prev.current);
    prev.current = node;
    if (node && obs) obs.observe(node);
  }, []);
  const s = floatDelay != null ? { ...style, '--float-d': `${floatDelay}s` } : style;
  return (
    <div ref={ref} className={`art-frame ${className}`} style={s} {...rest}>
      <div className={`art-lift-wrap ${float ? 'art-float' : ''}`} style={lift ? undefined : { transform: 'none' }}>
        {children}
      </div>
    </div>
  );
};

export default ArtFrame;
