// src/apps/explorador-mundo/ExploradorMundo.jsx
// Explorador del Mundo: países, continentes, océanos, banderas, capitales,
// relieve, grandes ciudades y fronteras con un mapa interactivo y ocho
// minijuegos. Una sola app para todos los cursos: el curso decide qué países
// entran y qué minijuegos se desbloquean (engine/config.js). La interfaz y el
// tracking los pone el motor de mapas (src/apps/_shared/geo/GeoQuizApp.jsx).
import React from 'react';
import GeoQuizApp from '../_shared/geo/GeoQuizApp';
import { mundoConfig } from './mundoConfig';

const ExploradorMundo = ({ onGameComplete }) => <GeoQuizApp config={mundoConfig} onGameComplete={onGameComplete} />;

export default ExploradorMundo;
