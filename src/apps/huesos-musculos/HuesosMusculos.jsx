// src/apps/huesos-musculos/HuesosMusculos.jsx
// Huesos y Músculos: el aparato locomotor a fondo (esqueleto, músculos, huesos
// en detalle, el hueso por dentro, articulaciones, músculos en acción,
// movimientos con un maniquí animado y biomecánica) sobre láminas hechas con un
// modelo 3D real (BodyParts3D). Una sola app para todos los cursos y en tres
// idiomas. Motor común: src/apps/_shared/geo/GeoQuizApp.jsx.
import React from 'react';
import GeoQuizApp from '../_shared/geo/GeoQuizApp';
import { hmConfig } from './hmConfig';

const HuesosMusculos = ({ onGameComplete }) => <GeoQuizApp config={hmConfig} onGameComplete={onGameComplete} />;

export default HuesosMusculos;
