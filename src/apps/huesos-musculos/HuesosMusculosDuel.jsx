// Duelo 1 vs 1 de Huesos y Músculos (motor común: src/apps/_shared/geo/GeoDuel.jsx).
import React from 'react';
import GeoDuel from '../_shared/geo/GeoDuel';
import { hmConfig } from './hmConfig';

const HuesosMusculosDuel = (props) => <GeoDuel config={hmConfig} {...props} />;

export default HuesosMusculosDuel;
