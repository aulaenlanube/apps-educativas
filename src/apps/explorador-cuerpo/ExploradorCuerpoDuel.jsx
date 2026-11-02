// Duelo 1 vs 1 del Explorador del Cuerpo Humano (motor común: src/apps/_shared/geo/GeoDuel.jsx).
import React from 'react';
import GeoDuel from '../_shared/geo/GeoDuel';
import { cuerpoConfig } from './cuerpoConfig';

const ExploradorCuerpoDuel = (props) => <GeoDuel config={cuerpoConfig} {...props} />;

export default ExploradorCuerpoDuel;
