import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

const BASE_URL = 'https://oposicionesia.com/';

function buildUrl(source) {
  const params = new URLSearchParams({
    utm_source: 'apps-educativas',
    utm_medium: 'promo',
    utm_campaign: 'oposicionesia',
    utm_content: source,
  });
  return `${BASE_URL}?${params.toString()}`;
}

/**
 * Variantes:
 * - "card"   → tarjeta completa con icono, título y subtítulo (dashboard, login).
 * - "inline" → una línea discreta para footers.
 */
export default function OposicionesIAPromo({ variant = 'card', source = 'generic', className = '' }) {
  const href = buildUrl(source);

  if (variant === 'inline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex items-center gap-1.5 text-gray-300 hover:text-white hover:underline ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>¿Preparas oposiciones de educación? Te ayudo con IA</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`group block rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 p-3 hover:shadow-md transition-all dark:border-amber-500/30 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-pink-500/10 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Te ayudo a preparar tus oposiciones
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Herramienta de IA para oposiciones de educación · oposicionesia.com
          </p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
      </div>
    </a>
  );
}
