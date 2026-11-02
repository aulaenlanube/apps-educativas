// Duelo 1 vs 1 de Viaje por el Cuerpo (motor común: src/apps/_shared/geo/GeoDuel.jsx).
import React from 'react';
import GeoDuel from '../_shared/geo/GeoDuel';
import { viajeConfig } from './viajeConfig';

const ViajeCuerpoDuel = (props) => <GeoDuel config={viajeConfig} {...props} />;

export default ViajeCuerpoDuel;
