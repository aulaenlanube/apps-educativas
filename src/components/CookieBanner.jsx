import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import MascotLogo from '@/components/ui/MascotLogo';
import './CookieBanner.css';

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
      <div className="cookie-card pointer-events-auto mx-auto max-w-3xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          {/* La mascota con su galleta */}
          <span className="cookie-card__mascot" aria-hidden="true">
            <MascotLogo className="w-full h-full" />
            <span className="cookie-card__cookie"><Cookie className="w-3.5 h-3.5" /></span>
          </span>
          <div className="text-sm leading-snug flex-1 cookie-card__text">
            <p className="font-bold cookie-card__title">Cookies</p>
            <p className="mt-1">
              Usamos cookies propias técnicas (imprescindibles) y de terceros (Google Analytics)
              para entender cómo se usa la plataforma y mejorarla. Puedes aceptarlas, rechazarlas o
              leer más en la{' '}
              <Link to="/politica-cookies" className="cookie-card__link">
                política de cookies
              </Link>{' '}
              y la{' '}
              <Link to="/politica-privacidad" className="cookie-card__link">
                política de privacidad
              </Link>.
            </p>
          </div>
          <button
            onClick={reject}
            aria-label="Cerrar sin aceptar"
            className="cookie-card__close shrink-0 p-1 rounded-md transition-colors"
            title="Rechazar todas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button onClick={reject} className="cookie-card__btn cookie-card__btn--reject">
            Rechazar
          </button>
          <button onClick={accept} className="cookie-card__btn cookie-card__btn--accept">
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
