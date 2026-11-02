// src/apps/anatomia-3d/Anatomia3D.jsx
// Anatomía 3D: un cuerpo humano completo en 3D (modelo BodyParts3D, CC BY 4.0)
// que se gira, se pela por capas, se corta como en un escáner y se monta pieza a
// pieza. Minijuegos: ¿Dónde está?, ¿Qué es?, Monta el cuerpo, ¿Qué hay debajo? y
// Cortes y TAC, más el Laboratorio 3D para estudiar. En castellano, valenciano e
// inglés; de 5.º de Primaria a Bachillerato. La interfaz y el tracking los pone el
// motor de mapas (src/apps/_shared/geo/GeoQuizApp.jsx); el visor, _shared/anatomia3d.
import React from 'react';
import GeoQuizApp from '../_shared/geo/GeoQuizApp';
import { anatomia3dConfig } from './anatomia3dConfig';

const Anatomia3D = ({ onGameComplete }) => <GeoQuizApp config={anatomia3dConfig} onGameComplete={onGameComplete} />;

export default Anatomia3D;
