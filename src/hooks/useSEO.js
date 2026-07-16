import { useEffect } from 'react';

/**
 * Pone <title>, <meta name="description"> y <link rel="canonical"> en función
 * de la ruta actual. Útil en SPA para que Googlebot (que ejecuta JS) indexe
 * cada página con su propia identidad.
 *
 * Retira sus tags al desmontar, y esto NO es opcional: en la plataforma
 * conviven dos mecanismos de SEO, este hook y <Helmet> (react-helmet-async).
 * Helmet solo gestiona los tags que crea él (los marca con data-rh) y no toca
 * los ajenos, así que un canonical dejado aquí sobrevivía a la navegación y la
 * página siguiente acababa con DOS canonical en conflicto — y con más de uno,
 * Google los ignora todos. Al limpiar, la página que entra parte de un head
 * sin canonical ni description previos.
 *
 * Si una página no fija canonical, no pasa nada: Google canonicaliza a la URL
 * de la propia página, que es justo lo que queremos. Lo dañino es heredar el
 * de otra.
 */
export default function useSEO({ title, description, canonical }) {
  useEffect(() => {
    const cleanups = [];

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
      cleanups.push(() => tag.remove());
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
      cleanups.push(() => link.remove());
    }

    return () => cleanups.forEach((fn) => fn());
  }, [title, description, canonical]);
}
