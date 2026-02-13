// src/apps/mesa-crafteo/atomConfig.js
import * as THREE from 'three';

// --- CONSTANTES VISUALES ---
export const ATOM_RADIUS = 0.5;
export const PORT_RADIUS = 0.13;
export const BOND_RADIUS = 0.06;
export const BOND_LENGTH = 1.2; // distancia entre centros de átomos conectados

// --- MAPA DE VALENCIAS (valencia principal por elemento) ---
export const ELEMENT_VALENCES = {
    H: 1, O: 2, C: 4, N: 3, S: 2, Cl: 1,
    Na: 1, K: 1, Ca: 2, Mg: 2, Fe: 2, Zn: 2,
    Al: 3, F: 1, Br: 1, I: 1, Ag: 1, P: 3,
    Si: 4, Cu: 2, Mn: 4, Cr: 3, Pb: 2
};

// --- GEOMETRÍA DE PUERTOS (VSEPR) ---
// Devuelve vectores unitarios [x, y, z] en la superficie de la esfera
export function getPortPositions(numPorts) {
    const PI = Math.PI;
    switch (numPorts) {
        case 1:
            return [[0, 0, 1]];
        case 2: // Lineal
            return [[0, 0, 1], [0, 0, -1]];
        case 3: { // Trigonal plana (plano XZ)
            const a120 = (2 * PI) / 3;
            return [
                [0, 0, 1],
                [Math.sin(a120), 0, Math.cos(a120)],
                [Math.sin(2 * a120), 0, Math.cos(2 * a120)]
            ];
        }
        case 4: { // Tetraédrica
            // Vértices de un tetraedro regular inscrito en esfera unitaria
            const t = Math.acos(-1 / 3); // ~109.47°
            return [
                [0, 1, 0],
                [Math.sqrt(8 / 9), -1 / 3, 0],
                [-Math.sqrt(2 / 9), -1 / 3, Math.sqrt(2 / 3)],
                [-Math.sqrt(2 / 9), -1 / 3, -Math.sqrt(2 / 3)]
            ];
        }
        case 5: { // Bipiramidal trigonal
            const a120 = (2 * PI) / 3;
            return [
                [0, 1, 0],  // axial arriba
                [0, -1, 0], // axial abajo
                [1, 0, 0],  // ecuatorial
                [Math.cos(a120), 0, Math.sin(a120)],
                [Math.cos(2 * a120), 0, Math.sin(2 * a120)]
            ];
        }
        case 6: // Octaédrica
            return [
                [1, 0, 0], [-1, 0, 0],
                [0, 1, 0], [0, -1, 0],
                [0, 0, 1], [0, 0, -1]
            ];
        default: {
            // Distribución uniforme en esfera (Fibonacci)
            const points = [];
            const goldenAngle = PI * (3 - Math.sqrt(5));
            for (let i = 0; i < numPorts; i++) {
                const y = 1 - (2 * i) / (numPorts - 1);
                const radius = Math.sqrt(1 - y * y);
                const theta = goldenAngle * i;
                points.push([radius * Math.cos(theta), y, radius * Math.sin(theta)]);
            }
            return points;
        }
    }
}

// --- ORIENTACIÓN DE PUERTOS ---
// Calcula quaternion para orientar un disco (normal [0,0,1]) hacia la dirección dada
export function quaternionFromDirection(dir) {
    const from = new THREE.Vector3(0, 0, 1);
    const to = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const quat = new THREE.Quaternion();
    // Manejar caso donde from y to son opuestos
    if (from.dot(to) < -0.9999) {
        const axis = new THREE.Vector3(1, 0, 0);
        quat.setFromAxisAngle(axis, Math.PI);
    } else {
        quat.setFromUnitVectors(from, to);
    }
    return [quat.x, quat.y, quat.z, quat.w];
}

// --- ORIENTACIÓN DE PUERTOS PARA NUEVO ÁTOMO ---
// Rota los puertos por defecto para que uno apunte hacia el átomo padre
export function orientPortsToIncoming(defaultPortDirs, incomingDir, parentAtomIndex) {
    const incoming = new THREE.Vector3(incomingDir[0], incomingDir[1], incomingDir[2]).normalize();

    // Encontrar el puerto por defecto más cercano a [0, 0, -1] (puerto "trasero")
    const backRef = new THREE.Vector3(0, 0, -1);
    let bestIdx = 0;
    let bestDot = -Infinity;
    defaultPortDirs.forEach((p, i) => {
        const dot = new THREE.Vector3(p[0], p[1], p[2]).dot(backRef);
        if (dot > bestDot) { bestDot = dot; bestIdx = i; }
    });

    // Calcular rotación de defaultPorts[bestIdx] → incomingDir
    const from = new THREE.Vector3(
        defaultPortDirs[bestIdx][0],
        defaultPortDirs[bestIdx][1],
        defaultPortDirs[bestIdx][2]
    ).normalize();
    const quat = new THREE.Quaternion();
    if (from.dot(incoming) < -0.9999) {
        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    } else {
        quat.setFromUnitVectors(from, incoming);
    }

    // Aplicar rotación a todos los puertos
    return defaultPortDirs.map((p, i) => {
        const v = new THREE.Vector3(p[0], p[1], p[2]).applyQuaternion(quat);
        return {
            direction: [v.x, v.y, v.z],
            occupied: i === bestIdx,
            connectedTo: i === bestIdx ? parentAtomIndex : null
        };
    });
}

// --- CREAR PUERTOS INICIALES (para el primer átomo) ---
export function createInitialPorts(valence) {
    const dirs = getPortPositions(valence);
    return dirs.map(dir => ({
        direction: dir,
        occupied: false,
        connectedTo: null
    }));
}

// --- VALIDACIÓN MOLECULAR ---
// Cuenta elementos en un array de símbolos
function countElements(atoms) {
    const counts = {};
    atoms.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    return counts;
}

// Genera forma canónica de un grafo molecular
function canonicalForm(atoms, bonds) {
    const adjacency = atoms.map(() => []);
    bonds.forEach(([a, b]) => {
        adjacency[a].push(atoms[b]);
        adjacency[b].push(atoms[a]);
    });
    const labels = atoms.map((el, i) => {
        const neighbors = adjacency[i].sort().join(',');
        return `${el}[${neighbors}]`;
    });
    return labels.sort().join('|');
}

// Compara si dos moléculas son equivalentes
export function moleculesMatch(userAtoms, userBonds, recipeAtoms, recipeBonds) {
    // Verificación rápida: misma composición
    const userCounts = countElements(userAtoms);
    const recipeCounts = countElements(recipeAtoms);
    const userKeys = Object.keys(userCounts).sort();
    const recipeKeys = Object.keys(recipeCounts).sort();
    if (userKeys.length !== recipeKeys.length) return false;
    for (let i = 0; i < userKeys.length; i++) {
        if (userKeys[i] !== recipeKeys[i]) return false;
        if (userCounts[userKeys[i]] !== recipeCounts[recipeKeys[i]]) return false;
    }

    // Verificación profunda: forma canónica
    return canonicalForm(userAtoms, userBonds) === canonicalForm(recipeAtoms, recipeBonds);
}

// --- LAYOUT AUTOMÁTICO (BFS) ---
// Genera posiciones 3D para una molécula desde su definición de grafo
export function layoutMoleculeFromGraph(atoms, bonds, elementsData) {
    if (atoms.length === 0) return { placedAtoms: [], bonds: [] };

    const adjacency = atoms.map(() => []);
    bonds.forEach(([a, b]) => {
        adjacency[a].push(b);
        adjacency[b].push(a);
    });

    const positions = new Array(atoms.length).fill(null);
    const allPorts = new Array(atoms.length).fill(null);
    const visited = new Set();

    // BFS desde átomo 0
    positions[0] = [0, 0, 0];
    const valence0 = ELEMENT_VALENCES[atoms[0]] || 1;
    allPorts[0] = createInitialPorts(valence0);
    visited.add(0);

    const queue = [0];
    while (queue.length > 0) {
        const current = queue.shift();
        const currentPos = positions[current];
        let portIdx = 0;

        for (const neighbor of adjacency[current]) {
            if (visited.has(neighbor)) continue;

            // Encontrar un puerto libre en el átomo actual
            while (portIdx < allPorts[current].length && allPorts[current][portIdx].occupied) {
                portIdx++;
            }
            if (portIdx >= allPorts[current].length) break;

            // Calcular posición del vecino
            const dir = allPorts[current][portIdx].direction;
            const newPos = [
                currentPos[0] + dir[0] * BOND_LENGTH,
                currentPos[1] + dir[1] * BOND_LENGTH,
                currentPos[2] + dir[2] * BOND_LENGTH
            ];

            // Marcar puerto como ocupado
            allPorts[current][portIdx].occupied = true;
            allPorts[current][portIdx].connectedTo = neighbor;

            // Crear puertos para el vecino
            const neighborValence = ELEMENT_VALENCES[atoms[neighbor]] || 1;
            const defaultDirs = getPortPositions(neighborValence);
            const incomingDir = [-dir[0], -dir[1], -dir[2]];
            allPorts[neighbor] = orientPortsToIncoming(defaultDirs, incomingDir, current);

            positions[neighbor] = newPos;
            visited.add(neighbor);
            queue.push(neighbor);
            portIdx++;
        }
    }

    // Construir resultado
    const placedAtoms = atoms.map((symbol, i) => {
        const elData = elementsData.find(e => e.symbol === symbol);
        return {
            element: symbol,
            elementData: elData || { symbol, name: symbol, category: 'unknown', atomicNumber: 0 },
            position: positions[i] || [0, 0, 0],
            ports: allPorts[i] || createInitialPorts(ELEMENT_VALENCES[symbol] || 1)
        };
    });

    return { placedAtoms, bonds: [...bonds] };
}
