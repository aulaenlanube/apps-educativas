import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import RobotMascot from '@/components/RobotMascot';
import './NavPages.css';

// Pantalla de error del router (errorElement de la ruta raíz).
// Sin ella, cualquier error no capturado durante el render sustituye la
// plataforma por la pantalla cruda de react-router ("Unexpected Application
// Error" + stack trace), que además filtra rutas de los bundles al usuario.
//
// Caso conocido: navegadores que bloquean WebGL (Brave con el bloqueo de huella
// digital en "estricto", aceleración por hardware desactivada) hacen fallar las
// apps 3D con "Error creating WebGL context". Ahí damos instrucciones concretas.
const isWebGLError = (err) =>
  /webgl|webgl2|context lost|WebGLRenderer/i.test(String(err?.message || err || ''));

export default function ErrorPage() {
  const error = useRouteError();
  const webgl = isWebGLError(error);

  return (
    <div className="np-lost min-h-screen flex items-center justify-center p-6">
      <div className="fx-grid-bg" aria-hidden="true" />
      <div className="fx-app-backdrop" aria-hidden="true" />
      <div className="fx-glass-dark fx-enter relative max-w-lg w-full rounded-3xl p-8 text-center">
        <div className="np-error-robot" aria-hidden="true">
          <RobotMascot expression="confused" />
          <span className="np-alert-icon np-alert-icon--badge"><AlertTriangle className="w-5 h-5" /></span>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">
          {webgl ? 'Tu navegador está bloqueando los gráficos 3D' : 'Algo ha salido mal'}
        </h1>

        <p className="text-indigo-100/80 mb-6 leading-relaxed">
          {webgl ? (
            <>
              Esta parte de la plataforma necesita <strong>WebGL</strong> y el navegador no ha
              podido activarlo. Suele arreglarse bajando los escudos de Brave para este sitio
              (<em>Bloquear huella digital</em> → <em>Estándar</em>) o activando la aceleración
              por hardware en los ajustes del navegador.
            </>
          ) : (
            <>No hemos podido cargar esta página. Prueba a recargar; si vuelve a pasar, avísanos.</>
          )}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="fx-btn fx-shine"
          >
            <RotateCcw className="w-4 h-4" /> Recargar
          </button>
          <Link
            to="/"
            className="np-btn-ghost"
          >
            <Home className="w-4 h-4" /> Ir al inicio
          </Link>
        </div>

        {error?.message && (
          <p className="mt-6 text-xs text-indigo-100/45 break-words font-mono">{String(error.message)}</p>
        )}
      </div>
    </div>
  );
}
