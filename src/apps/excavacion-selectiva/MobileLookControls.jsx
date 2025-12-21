import { useFrame, useThree } from '@react-three/fiber';

export const MobileLookControls = ({ isEnabled, joystickData }) => {
  const { camera } = useThree();

  // Velocidad de giro (ajusta según prefieras)
  const ROTATION_SPEED = 0.03;

  useFrame(() => {
    if (!isEnabled || !joystickData) return;

    // joystickData trae { x, y } con valores entre -1 y 1 aproximadamente
    
    // 1. ROTACIÓN HORIZONTAL (EJE Y)
    // joystickData.x: Derecha (+), Izquierda (-)
    // Restamos para que girar a la derecha sea rotación negativa en Y (estándar three.js)
    if (joystickData.x) {
        camera.rotation.y -= joystickData.x * ROTATION_SPEED;
    }

    // 2. ROTACIÓN VERTICAL (EJE X)
    // joystickData.y: Arriba (+), Abajo (-)
    // Invertimos el signo según prefieras (Natural vs Invertido)
    // Aquí: Arriba sube la mirada (Natural) -> Restar en X
    if (joystickData.y) {
        camera.rotation.x -= joystickData.y * ROTATION_SPEED;
    }

    // 3. LIMITAR ÁNGULO VERTICAL (Clamp)
    // Evitar dar la vuelta completa con la cabeza
    const LIMIT = Math.PI / 2 - 0.1; // Casi 90 grados
    camera.rotation.x = Math.max(-LIMIT, Math.min(LIMIT, camera.rotation.x));

    // Asegurar orden de rotación
    camera.rotation.order = 'YXZ';
  });

  return null;
};