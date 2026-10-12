// Limitador de frames COMPARTIDO por los fondos 3D decorativos de la plataforma
// (Scene3DBackground = isla, CityBackground = ciudad). Vive aparte para que cada
// fondo se importe sin arrastrar la escena del otro.
//
// Con frameloop="demand" r3f solo pinta cuando se invalida: aquí pedimos frames
// al ritmo del presupuesto. fps=0 → unos pocos frames para que la escena se
// asiente y después nada (r3f repinta solo al cambiar el tamaño).
// Si aun así el equipo no llega (frames reales muy por debajo del objetivo
// durante varios segundos) avisa con onSlow para que el fondo baje el ritmo o
// se congele.
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// Tiempo en segundos de reloj real (no de frames): así las animaciones de los
// fondos no dependen de los fps del limitador.
export const nowSeconds = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

export default function FrameLimiter({ fps, onSlow }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!fps) {
      let n = 0;
      const id = setInterval(() => { invalidate(); if (++n >= 4) clearInterval(id); }, 120);
      return () => clearInterval(id);
    }
    const step = 1000 / fps;
    let raf = 0;
    let last = 0;
    let winStart = 0;
    let winFrames = 0;
    let slowWindows = 0;
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (t - last < step - 2) return;
      // tras una pausa larga (pestaña oculta) no contamos esa ventana
      if (t - last > 600) { winStart = t; winFrames = 0; }
      last = t;
      invalidate();
      winFrames++;
      if (!winStart) winStart = t;
      if (t - winStart >= 3000) {
        const real = (winFrames * 1000) / (t - winStart);
        slowWindows = real < fps * 0.6 ? slowWindows + 1 : 0;
        winStart = t;
        winFrames = 0;
        if (slowWindows >= 2) { slowWindows = 0; onSlow?.(); }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fps, invalidate, onSlow]);
  return null;
}
