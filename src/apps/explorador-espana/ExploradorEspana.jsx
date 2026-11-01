// src/apps/explorador-espana/ExploradorEspana.jsx
// Explorador de España: comunidades autónomas, provincias, capitales, banderas,
// relieve (ríos, montañas, mares e islas) y fronteras con un mapa interactivo.
// Una sola app para todos los cursos (engine/config.js); la interfaz y el
// tracking los pone el motor de mapas (src/apps/_shared/geo/GeoQuizApp.jsx).
import React from 'react';
import GeoQuizApp from '../_shared/geo/GeoQuizApp';
import { espanaConfig } from './espanaConfig';

const ExploradorEspana = ({ onGameComplete }) => <GeoQuizApp config={espanaConfig} onGameComplete={onGameComplete} />;

export default ExploradorEspana;
