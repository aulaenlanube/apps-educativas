// Pérdida de contexto WebGL en un <Canvas> de react-three-fiber: avisa para
// remontar la escena. Se monta DENTRO del Canvas.
//
// Por qué no basta con un addEventListener en onCreated: react-three-fiber
// fuerza la pérdida del contexto viejo (forceContextLoss) al desmontar un
// <Canvas>, y los Canvas de las apps llevan key={tier-ctxKey}. Al cambiar de
// calidad (o al bajarla el governor de fps en Auto) se remonta, el contexto
// viejo «se pierde» a propósito, el escuchador antiguo lo toma por una pérdida
// real, sube ctxKey… y vuelta a empezar: un lienzo nuevo cada segundo, en bucle
// (en la Mesa de Crafteo la molécula «nacía» sin parar y la mesa se bloqueaba).
// Aquí el escuchador se quita al desmontar, antes de esa pérdida forzada.
//
//   <Canvas key={`${tier}-${ctxKey}`}>
//     <ContextLossGuard onLost={() => setCtxKey((k) => k + 1)} />
//   </Canvas>
//
// onLostNow (opcional) se llama al momento (p. ej. para congelar el bucle de
// render); onLost, tras `delay` ms, solo si la escena sigue montada.
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

export default function ContextLossGuard({ onLost, onLostNow, delay = 350 }) {
  const gl = useThree((s) => s.gl);
  const cb = useRef({ onLost, onLostNow });
  cb.current = { onLost, onLostNow };
  useEffect(() => {
    const el = gl.domElement;
    let alive = true;
    let timer = 0;
    const lost = (e) => {
      e.preventDefault();
      if (!alive) return;
      cb.current.onLostNow?.();
      timer = setTimeout(() => { if (alive) cb.current.onLost?.(); }, delay);
    };
    el.addEventListener('webglcontextlost', lost, false);
    return () => {
      alive = false;
      clearTimeout(timer);
      el.removeEventListener('webglcontextlost', lost, false);
    };
  }, [gl, delay]);
  return null;
}
