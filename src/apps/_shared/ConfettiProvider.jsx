import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import ReactCanvasConfetti from "react-canvas-confetti";
import ReactConfetti from "react-confetti";

const ConfettiCtx = createContext({ fire: () => {} });

export function ConfettiProvider({ children }) {
  const [portalEl, setPortalEl] = useState(null);
  const [fallbackOn, setFallbackOn] = useState(false);
  const refInstance = useRef(null);

  // Crear contenedor en <body> para evitar stacking contexts
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "confetti-root";
    Object.assign(el.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "2147483647",
    });
    document.body.appendChild(el);
    setPortalEl(el);
    return () => document.body.removeChild(el);
  }, []);

  const getInstance = useCallback((instance) => {
    // instance(opts) dispara partículas
    refInstance.current = instance;
  }, []);

  // ¡Más denso y duradero!
  const fire = useCallback((type = "success") => {
    const make = refInstance.current;
    console.log("[confetti] fire:", type, "instance?", !!make);

    if (!make) {
      // fallback por si se dispara muy pronto
      setFallbackOn(true);
      setTimeout(() => setFallbackOn(false), 2200);
      return;
    }

    const base = {
      gravity: 0.45,   // caen más lento
      decay: 0.975,    // viven más
      ticks: 2420,      // animación más larga
      spread: 80,
      scalar: 1.25,
      colors: ["#ff595e","#ffca3a","#8ac926","#1982c4","#6a4c93"],
      shapes: ["square","circle"],
    };

    const sideBursts = (opts = {}) => {
      make({ ...base, particleCount: 220, startVelocity: 58, angle: 60,  origin: { x: 0.0, y: 0.45 }, ...opts });
      make({ ...base, particleCount: 220, startVelocity: 58, angle: 120, origin: { x: 1.0, y: 0.45 }, ...opts });
    };

    if (type === "success") {
      sideBursts();
      setTimeout(() => sideBursts({ spread: 90,  scalar: 1.35 }), 1250);
      setTimeout(() => sideBursts({ spread: 95,  scalar: 1.45 }), 1550);
      setTimeout(() => sideBursts({ spread: 100, scalar: 1.55 }), 1900);
      return;
    }

    if (type === "burst") {
      make({
        ...base,
        particleCount: 600,
        startVelocity: 62,
        spread: 140,
        origin: { x: 0.5, y: 0.35 },
        gravity: 0.4,
        decay: 0.978,
        ticks: 2480,
        scalar: 1.35,
      });
      setTimeout(() => {
        make({
          ...base,
          particleCount: 450,
          startVelocity: 50,
          spread: 160,
          origin: { x: 0.5, y: 0.25 },
          gravity: 0.42,
          decay: 0.98,
          ticks: 2520,
          scalar: 1.3,
        });
      }, 350);
      return;
    }

    if (type === "celebration") {
      const end = Date.now() + 1600; // chorros ~1.6s
      (function frame() {
        make({ ...base, particleCount: 10, startVelocity: 60, angle: 60,  origin: { x: 0.0, y: Math.random()*0.4+0.2 } });
        make({ ...base, particleCount: 10, startVelocity: 60, angle: 120, origin: { x: 1.0, y: Math.random()*0.4+0.2 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, []);

  function useViewport() {
    const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
      const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);
    return size;
  }
  const { w, h } = useViewport();

  const canvas = (
    <>
      <ReactCanvasConfetti
        refConfetti={getInstance}
        resize={true}
        style={{
          position: "fixed",
          pointerEvents: "none",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      />
      {fallbackOn && (
        <ReactConfetti width={w} height={h} numberOfPieces={350} recycle={false} />
      )}
    </>
  );

  return (
    <ConfettiCtx.Provider value={{ fire }}>
      {portalEl ? ReactDOM.createPortal(canvas, portalEl) : null}
      {children}
    </ConfettiCtx.Provider>
  );
}

// ⬇️ ESTE EXPORT ES EL QUE FALTABA (named export)
export function useConfetti() {
  return useContext(ConfettiCtx);
}
