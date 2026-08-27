import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white/95 dark:bg-slate-800/95 rounded-3xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">
          {webgl ? 'Tu navegador está bloqueando los gráficos 3D' : 'Algo ha salido mal'}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
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
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-4 h-4" /> Recargar
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-bold hover:scale-105 transition-transform"
          >
            <Home className="w-4 h-4" /> Ir al inicio
          </Link>
        </div>

        {error?.message && (
          <p className="mt-6 text-xs text-slate-400 break-words">{String(error.message)}</p>
        )}
      </div>
    </div>
  );
}
