// src/apps/mesa-crafteo/Bond3D.jsx
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BOND_RADIUS } from './atomConfig';

const Bond3D = ({ start, end }) => {
    const { position, quaternion, length } = useMemo(() => {
        const s = new THREE.Vector3(start[0], start[1], start[2]);
        const e = new THREE.Vector3(end[0], end[1], end[2]);
        const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(e, s);
        const len = dir.length();
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        return {
            position: [mid.x, mid.y, mid.z],
            quaternion: [quat.x, quat.y, quat.z, quat.w],
            length: len
        };
    }, [start, end]);

    return (
        <mesh position={position} quaternion={quaternion}>
            <cylinderGeometry args={[BOND_RADIUS, BOND_RADIUS, length, 8]} />
            <meshStandardMaterial
                color="#b0b8c8"
                roughness={0.4}
                metalness={0.2}
            />
        </mesh>
    );
};

export default Bond3D;
