import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ReactDOM from "react-dom";
import ReactConfetti from "react-confetti";

const ConfettiCtx = createContext({ confeti: () => { } });

export function ConfettiProvider({ children }) {
  const [portalEl, setPortalEl] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRecycling, setIsRecycling] = useState(true);
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

  // La función `confeti` activa el confeti y resetea el reciclaje
  const confeti = useCallback(() => {
    setShowConfetti(true);
    setIsRecycling(true); // Aseguramos que siempre empiece reciclando
  }, []);



  // Este efecto maneja el ciclo de vida de la animación
  useEffect(() => {
    if (showConfetti) {
      // Después de un timer, detenemos el reciclaje de partículas.
      // Esto hace que dejen de generarse nuevas y las existentes caigan hasta desaparecer.
      const timer = setTimeout(() => {
        setIsRecycling(false);
      }, 2500); // 2500 ms = 2.5 segundos

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Esta función se llama automáticamente cuando todas las partículas han desaparecido
  const onConfettiComplete = () => {
    setShowConfetti(false);
  };

  const canvas = showConfetti ? (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={300}
      recycle={isRecycling}
      gravity={0.3}
      onConfettiComplete={onConfettiComplete}
    />


  ) : null;

  const value = { confeti };

  return (
    <ConfettiCtx.Provider value={value}>
      {children}
      {portalEl && ReactDOM.createPortal(canvas, portalEl)}
    </ConfettiCtx.Provider>
  );
}

export const useConfetti = () => useContext(ConfettiCtx);