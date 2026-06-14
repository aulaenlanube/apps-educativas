import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BadgeCheck, RotateCcw, History, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Modal con el historial de validaciones y cancelaciones de un post.
// Solo se monta desde el toggle de admin (la RPC vuelve a comprobar el rol).
function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function PostValidationLog({ slug, onClose }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('blog_admin_get_post_validation_log', { p_slug: slug })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return;
        if (rpcError || data?.error) {
          setError(rpcError?.message || data?.error || 'No se pudo cargar el historial.');
          setEntries([]);
          return;
        }
        setEntries(data?.log || []);
      });
    return () => { cancelled = true; };
  }, [slug]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="flex w-full max-w-md max-h-[80vh] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-5 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-50">Historial de validación</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">/blog/{slug}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-5">
            {entries === null && (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando…
              </div>
            )}
            {error && (
              <p className="py-4 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}
            {entries && entries.length === 0 && !error && (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Todavía no hay registros de validación para este post.
              </p>
            )}
            {entries && entries.length > 0 && (
              <ol className="space-y-3">
                {entries.map((e, idx) => {
                  const isValidate = e.action === 'validate';
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isValidate
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                        }`}
                      >
                        {isValidate ? <BadgeCheck className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {isValidate ? 'Validado' : 'Validación retirada'}
                          {e.actor_name ? <span className="font-medium text-slate-600 dark:text-slate-300"> · {e.actor_name}</span> : null}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(e.created_at)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
