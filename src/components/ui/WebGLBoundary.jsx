import React from 'react';
import { markWebGLUnavailable } from '@/services/graphicsQuality';

// Barrera de errores para CUALQUIER escena 3D (react-three-fiber / three.js).
//
// Motivo: si el navegador no puede crear el contexto WebGL, three lanza
// "Error creating WebGL context" en pleno render. React no tiene forma de
// recuperarse de un error de render sin un error boundary, así que el fallo
// burbujea hasta react-router y el usuario ve la pantalla "Unexpected
// Application Error" en lugar de la plataforma. Pasa de serie en Brave con el
// bloqueo de huella digital en "estricto" y en cualquier equipo con la
// aceleración por hardware desactivada.
//
// Uso: envuelve el <Canvas> y pasa un `fallback` visual equivalente.
//   <WebGLBoundary fallback={<MiFondoPlano />}> <MiEscena3D /> </WebGLBoundary>
class WebGLBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // El resto de la sesión ya no intenta montar escenas 3D.
    markWebGLUnavailable();
    console.warn('[webgl] escena 3D desactivada:', error?.message || error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default WebGLBoundary;
