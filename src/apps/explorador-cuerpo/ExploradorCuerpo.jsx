// src/apps/explorador-cuerpo/ExploradorCuerpo.jsx
// Explorador del Cuerpo Humano: partes del cuerpo, órganos, sentidos, aparatos
// y sistemas, siluetas, láminas por dentro, reproducción, células y tejidos,
// hormonas, salud y lenguaje médico sobre láminas hechas con un modelo 3D real
// (BodyParts3D) y láminas dibujadas. Una sola app para todos los cursos y en
// tres idiomas: el curso decide qué entra (engine/config.js). La interfaz y el
// tracking los pone el motor de mapas (src/apps/_shared/geo/GeoQuizApp.jsx).
import React from 'react';
import GeoQuizApp from '../_shared/geo/GeoQuizApp';
import { cuerpoConfig } from './cuerpoConfig';

const ExploradorCuerpo = ({ onGameComplete }) => <GeoQuizApp config={cuerpoConfig} onGameComplete={onGameComplete} />;

export default ExploradorCuerpo;
