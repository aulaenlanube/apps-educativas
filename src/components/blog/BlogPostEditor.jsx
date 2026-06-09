import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, Eye, Pencil, Heading2, Heading3, Bold, List, Table2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BlogProse from '@/components/blog/BlogProse';

// Editor de un post del blog para administradores. Edita SOLO el cuerpo
// markdown (texto, títulos ##, subtítulos ###, listas, negrita y tablas).
// No inserta imágenes a propósito. Guarda en Supabase (blog_post_overrides)
// vía RPC con guard de admin; la página carga ese override en runtime.

const TABLE_SNIPPET = `

| Columna 1 | Columna 2 |
|---|---|
| Celda | Celda |
| Celda | Celda |

`;

export default function BlogPostEditor({ slug, initialBody, onClose, onSaved, onReset }) {
  const [body, setBody] = useState(initialBody || '');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState('edit'); // 'edit' | 'preview'
  const [confirmReset, setConfirmReset] = useState(false);
  const taRef = useRef(null);

  const dirty = body !== (initialBody || '');

  // Inserta/envuelve texto en la posición del cursor del textarea.
  function applySnippet({ before = '', after = '', placeholder = '', block = false }) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end) || placeholder;
    const insert = `${before}${selected}${after}`;
    const next = body.slice(0, start) + insert + body.slice(end);
    setBody(next);
    // Recolocar el cursor tras el render.
    requestAnimationFrame(() => {
      ta.focus();
      const caret = start + before.length + selected.length + (block ? after.length : 0);
      ta.setSelectionRange(block ? start + insert.length : start + before.length, block ? start + insert.length : start + before.length + selected.length);
    });
  }

  const tools = [
    { icon: Heading2, label: 'Título', onClick: () => applySnippet({ before: '\n## ', placeholder: 'Título de sección', block: true }) },
    { icon: Heading3, label: 'Subtítulo', onClick: () => applySnippet({ before: '\n### ', placeholder: 'Subtítulo', block: true }) },
    { icon: Bold, label: 'Negrita', onClick: () => applySnippet({ before: '**', after: '**', placeholder: 'texto' }) },
    { icon: List, label: 'Lista', onClick: () => applySnippet({ before: '\n- ', placeholder: 'elemento', block: true }) },
    { icon: Table2, label: 'Tabla', onClick: () => applySnippet({ before: TABLE_SNIPPET, block: true }) },
  ];

  async function handleSave() {
    setError('');
    if (!body.trim()) { setError('El cuerpo no puede estar vacío.'); return; }
    setSaving(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('blog_admin_save_post', {
        p_slug: slug,
        p_body: body,
      });
      if (rpcError) { setError(rpcError.message); return; }
      if (data?.error) { setError(data.error); return; }
      onSaved?.(body, data?.updated_at || new Date().toISOString());
    } catch (err) {
      setError(err?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setError('');
    setResetting(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('blog_admin_reset_post', {
        p_slug: slug,
      });
      if (rpcError) { setError(rpcError.message); return; }
      if (data?.error) { setError(data.error); return; }
      onReset?.();
    } catch (err) {
      setError(err?.message || 'Error al restablecer.');
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose?.(); }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="flex w-full max-w-6xl h-[92vh] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-5 py-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 truncate">Editar post</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">/blog/{slug}</p>
            </div>
            <button
              type="button"
              onClick={() => !saving && onClose?.()}
              className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de herramientas + toggle móvil */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-5 py-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {tools.map(({ icon: Icon, label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  title={label}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileView('edit')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${mobileView === 'edit' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500'}`}
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${mobileView === 'preview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Vista
              </button>
            </div>
          </div>

          {/* Cuerpo: editor + preview */}
          <div className="flex min-h-0 flex-1 divide-x divide-slate-200 dark:divide-slate-700">
            <div className={`${mobileView === 'edit' ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 flex-col`}>
              <textarea
                ref={taRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck
                className="h-full w-full resize-none bg-slate-50 dark:bg-slate-950/40 p-4 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-100 outline-none focus:ring-0"
                placeholder="Escribe el contenido del post en Markdown..."
              />
            </div>
            <div className={`${mobileView === 'preview' ? 'block' : 'hidden'} lg:block w-full lg:w-1/2 overflow-y-auto p-5 bg-white dark:bg-slate-900`}>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Vista previa</p>
              <BlogProse markdown={body} />
            </div>
          </div>

          {/* Pie: errores + acciones */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-5 py-3">
            {error && (
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">¿Volver al texto original?</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetting}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {resetting ? 'Restableciendo…' : 'Sí, restablecer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Descartar las ediciones guardadas y volver al texto original del repositorio"
                >
                  <RotateCcw className="w-4 h-4" /> Restablecer original
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => !saving && onClose?.()}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
