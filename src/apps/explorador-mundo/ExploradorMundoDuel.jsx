// Duelo 1 vs 1 del Explorador del Mundo (motor común: src/apps/_shared/geo/GeoDuel.jsx).
import React from 'react';
import GeoDuel from '../_shared/geo/GeoDuel';
import { mundoConfig } from './mundoConfig';

const ExploradorMundoDuel = (props) => <GeoDuel config={mundoConfig} {...props} />;

export default ExploradorMundoDuel;
