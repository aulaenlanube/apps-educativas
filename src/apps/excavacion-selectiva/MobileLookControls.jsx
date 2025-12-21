import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export const MobileLookControls = ({ isEnabled }) => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    if (!isEnabled) return;

    let previousTouchX = 0;
    let previousTouchY = 0;
    const SENSITIVITY = 0.005;

    const handleTouchStart = (e) => {
      // Solo nos interesa si toca en la mitad derecha de la pantalla (para no interferir con el joystick)
      if (e.touches[0].clientX > window.innerWidth / 2) {
        previousTouchX = e.touches[0].clientX;
        previousTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches[0].clientX > window.innerWidth / 2) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        const deltaX = touchX - previousTouchX;
        const deltaY = touchY - previousTouchY;

        // Rotar cámara (Y es horizontal, X es vertical)
        // Restamos para invertir el eje y que se sienta natural
        camera.rotation.y -= deltaX * SENSITIVITY;
        camera.rotation.x -= deltaY * SENSITIVITY;
        
        // Limitar ángulo vertical para no dar la vuelta completa (opcional)
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

        previousTouchX = touchX;
        previousTouchY = touchY;
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [camera, gl, isEnabled]);

  return null;
};