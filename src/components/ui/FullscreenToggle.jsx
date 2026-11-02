// Botón de pantalla completa del navegador (apps a pantalla completa: proyector,
// Chromebook). No se pinta si el navegador no la permite (p. ej. iPhone).
import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const canFullscreen = () => typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

export default function FullscreenToggle({ className = '' }) {
  const [on, setOn] = useState(() => typeof document !== 'undefined' && Boolean(document.fullscreenElement));
  useEffect(() => {
    const sync = () => setOn(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  if (!canFullscreen()) return null;
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const label = on ? 'Salir de pantalla completa' : 'Pantalla completa';
  const Icon = on ? Minimize2 : Maximize2;
  return (
    <button type="button" onClick={toggle} className={className} title={label} aria-label={label} aria-pressed={on}>
      <Icon className="w-[18px] h-[18px]" />
    </button>
  );
}
