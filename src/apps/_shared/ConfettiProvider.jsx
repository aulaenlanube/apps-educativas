import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ReactDOM from "react-dom";
import ReactConfetti from "react-confetti";

const ConfettiCtx = createContext({ fire: () => {} });

export function ConfettiProvider({ children }) {
  const [portalEl, setPortalEl] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Obtenemos y actualizamos las dimensiones de la ventana
  useEffect(() => {
    const { innerWidth: width, innerHeight: height } = window;
    setDimensions({ width, height });
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Creamos un portal para renderizar el confeti por encima de todo
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

  // La función `fire` ahora simplemente activa el confeti
  const fire = useCallback(() => {
    setShowConfetti(true);
  }, []);

  // Este efecto controla la duración de la animación
  useEffect(() => {
    if (showConfetti) {
      // Activamos un temporizador para ocultar el confeti después de 4000ms
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3500); // Duración

      // Limpiamos el temporizador si el componente se desmonta antes
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const canvas = showConfetti ? (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={500}
      recycle={true}
      gravity={0.25} // Aumenta la velocidad de caída (valor por defecto es 0.1)
    />
  ) : null;

  const value = { fire };

  return (
    <ConfettiCtx.Provider value={value}>
      {children}
      {portalEl && ReactDOM.createPortal(canvas, portalEl)}
    </ConfettiCtx.Provider>
  );
}

export const useConfetti = () => useContext(ConfettiCtx);