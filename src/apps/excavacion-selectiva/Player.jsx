import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WALK_SPEED = 5.0;
const RUN_SPEED = 12.0;

export const Player = ({ isLocked, joystickMove }) => { // <--- Nueva prop joystickMove
  const { camera } = useThree();
  
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.forward = true; break;
        case 'KeyS': keys.current.backward = true; break;
        case 'KeyA': keys.current.left = true; break;
        case 'KeyD': keys.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.sprint = true; break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.forward = false; break;
        case 'KeyS': keys.current.backward = false; break;
        case 'KeyA': keys.current.left = false; break;
        case 'KeyD': keys.current.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.sprint = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    // Si no está bloqueado (PC) y no hay input de joystick (Móvil), no mover
    if (!isLocked && !joystickMove) return;

    const { forward, backward, left, right, sprint } = keys.current;
    
    // Velocidad base
    let currentSpeed = sprint ? RUN_SPEED : WALK_SPEED;

    // === LÓGICA DE MOVIMIENTO COMBINADA (TECLADO + JOYSTICK) ===
    
    // Input Z (Adelante/Atrás)
    // Teclado: 1 o -1
    // Joystick: viene en joystickMove.y (de -1 a 1)
    let moveZ = Number(backward) - Number(forward);
    if (joystickMove?.y) moveZ -= joystickMove.y; // Invertimos porque Y+ es adelante en joystick pero -Z en 3D

    // Input X (Izquierda/Derecha)
    let moveX = Number(right) - Number(left);
    if (joystickMove?.x) moveX += joystickMove.x;

    // Aplicar movimiento
    if (Math.abs(moveZ) > 0) {
        camera.translateZ(moveZ * currentSpeed * delta);
    }
    if (Math.abs(moveX) > 0) {
        camera.translateX(moveX * currentSpeed * delta);
    }

    // Gravedad simple
    camera.position.y = 1.7; 
  });

  return null;
};