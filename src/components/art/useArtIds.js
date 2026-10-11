import { useId } from 'react';

// IDs únicos por instancia para <defs> de un SVG (degradados, clipPath, máscaras).
// Evita choques cuando el mismo icono aparece varias veces en la página o
// cuando dos iconos usan el mismo nombre de degradado.
//   const [id, url] = useArtIds();
//   <linearGradient id={id('body')}> … <rect fill={url('body')} />
export default function useArtIds() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name) => `a${base}-${name}`;
  const url = (name) => `url(#a${base}-${name})`;
  return [id, url];
}
