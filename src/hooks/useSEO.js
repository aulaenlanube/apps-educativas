import { useEffect } from 'react';

/**
 * Pone <title>, <meta name="description"> y <link rel="canonical"> en función
 * de la ruta actual. Útil en SPA para que Googlebot (que ejecuta JS) indexe
 * cada página con su propia identidad.
 */
export default function useSEO({ title, description, canonical }) {
  useEffect(() => {
    if (title) {
      const full = title.includes('Apps Educativas') ? title : `${title} · Apps Educativas`;
      document.title = full;
    }
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, canonical]);
}
