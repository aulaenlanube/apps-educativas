// Texto 3D del laboratorio con FUENTE LOCAL empaquetada.
// El <Text> de drei (troika) descarga por defecto su fuente desde
// fonts.gstatic.com vía fetch — gobernado por connect-src, que la CSP de la
// plataforma no permite: la promesa nunca resolvía, el suspense burbujeaba
// fuera del Canvas y la app entera se quedaba en el spinner global.
// Con la Roboto completa local (latín + griego + subíndices) la carga es
// same-origin ('self'), instantánea y sin dependencia de red externa.
import React from 'react';
import { Text } from '@react-three/drei';
import fuente from '../assets/roboto-regular.ttf';

export default function Texto3D(props) {
  return <Text font={fuente} {...props} />;
}
