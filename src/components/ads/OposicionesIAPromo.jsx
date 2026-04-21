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
        className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-pink-500/15 border border-amber-400/40 text-amber-200 hover:text-white hover:border-amber-300 hover:from-amber-500/25 hover:via-orange-500/25 hover:to-pink-500/25 transition-all shadow-sm hover:shadow-amber-500/20 ${className}`}
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
        <span className="font-semibold">¿Preparas oposiciones de educación? Te ayudo con IA</span>
        <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
