// Texto 3D del laboratorio con FUENTE LOCAL y typesetting en el hilo principal.
//
// drei <Text> usa troika-three-text, que por defecto hace el typesetting en un
// Web Worker. Ese worker se crea bien (la CSP permite worker-src blob:), pero
// dentro carga sus submódulos con importScripts('blob:...') — y eso lo gobierna
// `script-src`, que NO incluye blob: (ni en el meta de index.html ni en el
// .htaccess). El importScripts falla, el worker de typesetting muere, la
// promesa de preloadFont nunca resuelve, drei <Text> (que suspende sobre esa
// promesa) se queda suspendido para siempre y el Canvas entero sale en negro.
//
// Solución sin tocar la CSP (no metemos blob: en script-src): forzamos el
// typesetting en el hilo principal con useWorker:false — no hay worker, no hay
// importScripts. El texto del laboratorio es escaso, así que el coste es nulo.
// Debe configurarse ANTES de la primera petición de fuente; por eso va en el
// scope del módulo, que se ejecuta al importar (antes de renderizar ningún Text).
//
// Además la fuente Roboto va empaquetada LOCAL (latín + griego + subíndices):
// same-origin, sin depender de fonts.gstatic.com (bloqueado por connect-src).
import React from 'react';
import { Text } from '@react-three/drei';
import { configureTextBuilder } from 'troika-three-text';
import fuente from '../assets/roboto-regular.ttf';

configureTextBuilder({ useWorker: false });

export default function Texto3D(props) {
  return <Text font={fuente} {...props} />;
}
