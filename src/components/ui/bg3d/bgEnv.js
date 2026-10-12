// Utilidades COMPARTIDAS por los fondos 3D procedurales de la plataforma
// (CityBackground = ciudad, SpaceBackground = espacio). Viven aparte para que
// cada fondo sea su propio chunk lazy sin arrastrar la escena del otro.
import { useEffect, useState } from 'react';

// Media query como estado React (try/catch: iframes y navegadores raros)
export function useMediaQuery(query) {
  const get = () => {
    try { return window.matchMedia(query).matches; } catch { return false; }
  };
  const [match, setMatch] = useState(get);
  useEffect(() => {
    let mq;
    try { mq = window.matchMedia(query); } catch { return undefined; }
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return match;
}

// ¿El tema oscuro está activo? Se observa la clase `dark` de <html> (la pone
// ThemeContext) para no depender del árbol de contextos.
export function readHtmlDark() {
  try { return document.documentElement.classList.contains('dark'); } catch { return false; }
}

// Clase `dark` de <html> observada con MutationObserver
export function useHtmlDark() {
  const [dark, setDark] = useState(readHtmlDark);
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    setDark(el.classList.contains('dark'));
    return () => obs.disconnect();
  }, []);
  return dark;
}

// PRNG determinista (misma semilla → mismo universo en cada carga)
export function mulberry32(a) {
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
