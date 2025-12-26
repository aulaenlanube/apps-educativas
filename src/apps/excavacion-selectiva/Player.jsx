import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const WALK_SPEED = 5.0;
const RUN_SPEED = 12.0;

const MinecraftArms = ({ isMoving, isRunning, isMining }) => {
  const groupRef = useRef();
  const rightArmRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Animación de minado (Right Arm Priority)
    if (isMining && rightArmRef.current) {
      // Movimiento rápido de vaivén 
      const swingSpeed = 25;
      rightArmRef.current.rotation.x = -0.5 + Math.sin(time * swingSpeed) * 0.8;
    } else if (rightArmRef.current) {
      // Volver a posición normal suavemente
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.1, 0.2);
    }

    if (isMoving) {
      // Balanceo tipo Minecraft
      const bobSpeed = isRunning ? 12 : 8;
      const bobAmount = isRunning ? 0.08 : 0.04;

      // Movimiento vertical y lateral
      groupRef.current.position.y = -0.25 + Math.sin(time * bobSpeed) * bobAmount;
      groupRef.current.position.x = Math.cos(time * bobSpeed * 0.5) * bobAmount * 0.5;

      // Rotación de balanceo
      groupRef.current.rotation.z = Math.sin(time * bobSpeed * 0.5) * 0.1;
      groupRef.current.rotation.x = Math.sin(time * bobSpeed) * 0.05;
    } else {
      // Respiración suave en reposo
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.25 + Math.sin(time * 2) * 0.01, 0.1);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.25, -0.3]}>
      {/* BRAZO DERECHO */}
      <mesh ref={rightArmRef} position={[0.3, -0.1, -0.2]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.6]} />
        <meshStandardMaterial color="#ffdbac" depthTest={false} transparent={true} />
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.16, 0.16, 0.4]} />
          <meshStandardMaterial color="#00acc1" depthTest={false} transparent={true} />
        </mesh>
      </mesh>

      {/* BRAZO IZQUIERDO */}
      <mesh position={[-0.3, -0.1, -0.2]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.6]} />
        <meshStandardMaterial color="#ffdbac" depthTest={false} transparent={true} />
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.16, 0.16, 0.4]} />
          <meshStandardMaterial color="#00acc1" depthTest={false} transparent={true} />
        </mesh>
      </mesh>
    </group>
  );
};

export const Player = ({ isLocked, joystickMove, isMining }) => {
  const { camera } = useThree();
  const armsRef = useRef();
  const [movementState, setMovementState] = useState({ isMoving: false, isRunning: false });

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
    // 1. SIEMPRE sincronizar brazos con la cámara (IMPORTANTE: Antes del early return)
    if (armsRef.current) {
      armsRef.current.position.copy(camera.position);
      armsRef.current.rotation.copy(camera.rotation);
    }

    if (!isLocked && !joystickMove) {
      if (movementState.isMoving) setMovementState({ isMoving: false, isRunning: false });
      return;
    }

    const { forward, backward, left, right, sprint } = keys.current;
    let currentSpeed = sprint ? RUN_SPEED : WALK_SPEED;

    let moveZ = Number(backward) - Number(forward);
    if (joystickMove?.y) moveZ -= joystickMove.y;

    let moveX = Number(right) - Number(left);
    if (joystickMove?.x) moveX += joystickMove.x;

    const isMovingNow = (Math.abs(moveZ) > 0.05 || Math.abs(moveX) > 0.05);
    const isRunningNow = isMovingNow && sprint;

    if (isMovingNow !== movementState.isMoving || isRunningNow !== movementState.isRunning) {
      setMovementState({ isMoving: isMovingNow, isRunning: isRunningNow });
    }

    if (Math.abs(moveZ) > 0) {
      camera.translateZ(moveZ * currentSpeed * delta);
    }
    if (Math.abs(moveX) > 0) {
      camera.translateX(moveX * currentSpeed * delta);
    }

    camera.position.y = 1.7;
  });

  return (
    <group ref={armsRef} renderOrder={999}>
      <MinecraftArms isMoving={movementState.isMoving} isRunning={movementState.isRunning} isMining={isMining} />
    </group>
  );
};