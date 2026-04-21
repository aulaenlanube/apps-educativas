import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Envía un evento page_view a Google Analytics 4 cada vez que cambia la ruta.
 * Necesario porque esta app es una SPA: sin esto, GA solo vería la visita
 * inicial y no las navegaciones internas.
 *
 * El script de gtag se carga desde index.html con send_page_view:false para
 * que este hook tenga el control total (incluida la 1ª vista).
 */
export default function useGAPageView() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const path = location.pathname + location.search;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title || undefined,
    });
  }, [location.pathname, location.search]);
}
