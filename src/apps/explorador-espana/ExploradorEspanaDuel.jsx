// Duelo 1 vs 1 del Explorador de España (motor común: src/apps/_shared/geo/GeoDuel.jsx).
import React from 'react';
import GeoDuel from '../_shared/geo/GeoDuel';
import { espanaConfig } from './espanaConfig';

const ExploradorEspanaDuel = (props) => <GeoDuel config={espanaConfig} {...props} />;

export default ExploradorEspanaDuel;
