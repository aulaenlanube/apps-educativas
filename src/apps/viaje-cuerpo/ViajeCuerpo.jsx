// src/apps/viaje-cuerpo/ViajeCuerpo.jsx
// Viaje por el Cuerpo: el robot de la plataforma recorre el cuerpo por dentro
// siguiendo el alimento, el aire, la sangre, la orina, el impulso nervioso, la
// luz, el sonido, una hormona, las defensas y la vida. Cada ruta se juega
// parada a parada (con la estela del recorrido) y termina ordenando el viaje.
// Tres idiomas. Motor común: src/apps/_shared/geo/GeoQuizApp.jsx.
import React from 'react';
import GeoQuizApp from '../_shared/geo/GeoQuizApp';
import { viajeConfig } from './viajeConfig';

const ViajeCuerpo = ({ onGameComplete }) => <GeoQuizApp config={viajeConfig} onGameComplete={onGameComplete} />;

export default ViajeCuerpo;
