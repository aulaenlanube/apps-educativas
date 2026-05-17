import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Wrapper de tipografía para el cuerpo de un post.
// Mismo enfoque que LegalLayout: arbitrary variants de Tailwind sobre los hijos
// generados por react-markdown, sin depender del plugin typography.

const PROSE_CLASSES = [
  'space-y-5 text-[17px] leading-relaxed text-slate-700 dark:text-slate-200',
  // H2 con barra lateral
  '[&_h2]:relative [&_h2]:pl-4 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:dark:text-slate-50',
  "[&_h2]:before:content-[''] [&_h2]:before:absolute [&_h2]:before:left-0 [&_h2]:before:top-1 [&_h2]:before:bottom-1 [&_h2]:before:w-1.5 [&_h2]:before:rounded [&_h2]:before:bg-gradient-to-b [&_h2]:before:from-indigo-500 [&_h2]:before:to-purple-500",
  // H3
  '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-indigo-700 [&_h3]:dark:text-indigo-300',
  // Párrafos
  '[&_p]:my-4 [&_p]:leading-relaxed',
  // Listas
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-1.5 [&_ul]:marker:text-indigo-400',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-1.5 [&_ol]:marker:text-indigo-500 [&_ol]:marker:font-bold',
  '[&_li]:leading-relaxed',
  // Enlaces
  '[&_a]:text-indigo-600 [&_a]:dark:text-indigo-400 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2',
  '[&_a:hover]:text-indigo-800 [&_a:hover]:dark:text-indigo-300',
  // Negrita
  '[&_strong]:text-slate-900 [&_strong]:dark:text-white [&_strong]:font-bold',
  // Cita
  '[&_blockquote]:my-6 [&_blockquote]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:dark:text-slate-300',
  // Código inline
  '[&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:dark:bg-slate-700 [&_:not(pre)>code]:text-pink-600 [&_:not(pre)>code]:dark:text-pink-300 [&_:not(pre)>code]:text-[15px] [&_:not(pre)>code]:font-mono',
  // Bloque de código
  '[&_pre]:my-6 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:overflow-x-auto [&_pre]:text-sm',
  // Tabla
  '[&_table]:w-full [&_table]:my-6 [&_table]:text-sm [&_table]:border [&_table]:border-slate-200 [&_table]:dark:border-slate-700 [&_table]:rounded-lg [&_table]:overflow-hidden',
  '[&_thead]:bg-gradient-to-r [&_thead]:from-indigo-50 [&_thead]:to-purple-50 [&_thead]:dark:from-indigo-900/30 [&_thead]:dark:to-purple-900/30',
  '[&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:font-bold [&_th]:text-slate-700 [&_th]:dark:text-slate-200 [&_th]:border-b [&_th]:border-slate-200 [&_th]:dark:border-slate-700',
  '[&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:border-t [&_td]:border-slate-100 [&_td]:dark:border-slate-700',
  '[&_tbody_tr:hover]:bg-slate-50/70 [&_tbody_tr:hover]:dark:bg-slate-700/40',
  // Imágenes
  '[&_img]:rounded-xl [&_img]:my-6 [&_img]:shadow-md',
  // HR
  '[&_hr]:my-10 [&_hr]:border-t-2 [&_hr]:border-dashed [&_hr]:border-slate-200 [&_hr]:dark:border-slate-700',
].join(' ');

// Componentes personalizados para abrir enlaces externos en pestaña nueva.
const MD_COMPONENTS = {
  a({ href = '', children, ...props }) {
    const isExternal = /^https?:\/\//i.test(href) && !href.includes('apps-educativas.com');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
};

export default function BlogProse({ markdown }) {
  return (
    <div className={PROSE_CLASSES}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
