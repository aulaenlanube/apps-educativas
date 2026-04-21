import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Layout común para páginas legales. Usa tipografía explícita con espaciado
 * generoso y epígrafes marcados para que el texto sea fácil de leer.
 */
export default function LegalLayout({ title, updatedAt, children }) {
  return (
    <div className="min-h-[calc(100vh-300px)] bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 py-12 px-4">
      <article className="mx-auto max-w-3xl bg-white shadow-lg border border-slate-200 rounded-2xl p-6 sm:p-10 text-slate-800">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <header className="mb-8 pb-6 border-b-2 border-indigo-100">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {updatedAt && (
            <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mt-3">
              Última actualización · {updatedAt}
            </p>
          )}
        </header>

        {/* Contenido con estilos en cascada (sin depender del plugin typography). */}
        <div className={[
          // Spacing base
          'space-y-5 text-[15px] leading-relaxed text-slate-700',
          // H2 destacado como epígrafe con barra de color
          '[&_h2]:relative [&_h2]:pl-4 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-black [&_h2]:text-slate-900',
          "[&_h2]:before:content-[''] [&_h2]:before:absolute [&_h2]:before:left-0 [&_h2]:before:top-1 [&_h2]:before:bottom-1 [&_h2]:before:w-1.5 [&_h2]:before:rounded [&_h2]:before:bg-gradient-to-b [&_h2]:before:from-indigo-500 [&_h2]:before:to-purple-500",
          // H3 subepígrafe
          '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-indigo-700',
          // Párrafos
          '[&_p]:my-3 [&_p]:leading-relaxed',
          // Listas
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_ul]:marker:text-indigo-400',
          '[&_li]:leading-relaxed',
          // Enlaces
          '[&_a]:text-indigo-600 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2',
          '[&_a:hover]:text-indigo-800',
          // Texto destacado
          '[&_strong]:text-slate-900 [&_strong]:font-semibold',
          // Tabla
          '[&_table]:w-full [&_table]:my-6 [&_table]:text-sm [&_table]:border [&_table]:border-slate-200 [&_table]:rounded-lg [&_table]:overflow-hidden',
          '[&_thead]:bg-gradient-to-r [&_thead]:from-indigo-50 [&_thead]:to-purple-50',
          '[&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:font-bold [&_th]:text-slate-700 [&_th]:border-b [&_th]:border-slate-200',
          '[&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:border-t [&_td]:border-slate-100',
          '[&_tbody_tr:hover]:bg-slate-50/70',
        ].join(' ')}>
          {children}
        </div>
      </article>
    </div>
  );
}
