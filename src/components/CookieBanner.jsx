import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== 'accepted' && v !== 'rejected') setShow(true);
    } catch {
      setShow(true);
    }
    const open = () => setShow(true);
    window.addEventListener('open-cookie-banner', open);
    return () => window.removeEventListener('open-cookie-banner', open);
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    }
    setShow(false);
  };

  const reject = () => {
    try { localStorage.setItem(STORAGE_KEY, 'rejected'); } catch {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white shadow-2xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="text-sm text-slate-700 leading-snug flex-1">
            <p className="font-bold text-slate-900">Cookies</p>
            <p className="mt-1">
              Usamos cookies propias técnicas (imprescindibles) y de terceros (Google Analytics)
              para entender cómo se usa la plataforma y mejorarla. Puedes aceptarlas, rechazarlas o
              leer más en la{' '}
              <Link to="/politica-cookies" className="font-semibold text-indigo-600 hover:underline">
                política de cookies
              </Link>{' '}
              y la{' '}
              <Link to="/politica-privacidad" className="font-semibold text-indigo-600 hover:underline">
                política de privacidad
              </Link>.
            </p>
          </div>
          <button
            onClick={reject}
            aria-label="Cerrar sin aceptar"
            className="shrink-0 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Rechazar todas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={reject}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
