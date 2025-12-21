import { useFrame, useThree } from '@react-three/fiber';

export const MobileLookControls = ({ isEnabled, joystickData }) => {
  const { camera } = useThree();

  // Velocidad de giro
  const ROTATION_SPEED = 0.03;

  useFrame(() => {
    if (!isEnabled || !joystickData) return;

    // joystickData trae { x, y }
    
    // 1. ROTACIÓN HORIZONTAL (EJE Y - Mirar a los lados)
    // Joystick Derecha (+x) -> Queremos rotar a la derecha (Y negativo en Three.js)
    // Por tanto: RESTAMOS x
    if (joystickData.x) {
        camera.rotation.y -= joystickData.x * ROTATION_SPEED;
    }

    // 2. ROTACIÓN VERTICAL (EJE X - Mirar arriba/abajo)
    // === CORRECCIÓN AQUÍ ===
    // Joystick Arriba (+y) -> Queremos mirar arriba (X negativo en Three.js)
    // Si antes iba al revés, probablemente necesitábamos SUMAR en lugar de restar (o viceversa según la librería).
    // Probamos invirtiendo el signo a '+' para corregir "el revés".
    if (joystickData.y) {
        camera.rotation.x += joystickData.y * ROTATION_SPEED; 
    }

    // 3. LIMITAR ÁNGULO VERTICAL (Clamp)
    // Evitar desnucarse (limitar a casi 90 grados arriba/abajo)
    const LIMIT = Math.PI / 2 - 0.1; 
    camera.rotation.x = Math.max(-LIMIT, Math.min(LIMIT, camera.rotation.x));

    // Asegurar orden de rotación para evitar bloqueos
    camera.rotation.order = 'YXZ';
  });

  return null;
};