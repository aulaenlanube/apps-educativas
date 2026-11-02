// Duelo 1 vs 1 de Anatomía 3D (motor común: src/apps/_shared/geo/GeoDuel.jsx).
// Sin «Monta el cuerpo»: en duelo cada pregunta se resuelve con un toque o una opción.
import React from 'react';
import GeoDuel from '../_shared/geo/GeoDuel';
import { anatomia3dConfig } from './anatomia3dConfig';

const Anatomia3DDuel = (props) => <GeoDuel config={anatomia3dConfig} {...props} />;

export default Anatomia3DDuel;
