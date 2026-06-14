import React, { useState } from 'react';
import { BadgeCheck, Loader2, History } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useBlogValidations, setLocalValidation } from '@/blog/validationStore';
import { formatDateLong } from '@/blog/utils';
import PostValidationLog from './PostValidationLog';

// Check "Post validado" para administradores, junto al botón "Editar post".
// Al alternar llama a la RPC (que registra el cambio en el historial), actualiza
// el cache local de forma optimista y avisa con un toast. El icono de reloj
// abre el historial completo de validaciones/cancelaciones.
export default function PostValidationToggle({ slug }) {
  const { isAdmin, getValidation } = useBlogValidations();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showLog, setShowLog] = useState(false);

  if (!isAdmin) return null;

  const v = getValidation(slug);
  const validated = !!v?.validated;

  async function toggle() {
    if (saving) return;
    const next = !validated;
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('blog_admin_set_post_validation', {
        p_slug: slug,
        p_validated: next,
      });
      if (error || data?.error) {
        toast({ variant: 'destructive', title: 'No se pudo guardar', description: error?.message || data?.error });
        return;
      }
      setLocalValidation(
        slug,
        next
          ? { slug, validated: true, validated_at: data.validated_at, validated_by_name: data.validated_by_name }
          : null
      );
      toast({ title: next ? 'Post validado' : 'Validación retirada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  const validatedTitle = validated
    ? `Validado${v?.validated_by_name ? ` por ${v.validated_by_name}` : ''}${
        v?.validated_at ? ` · ${formatDateLong(v.validated_at)}` : ''
      }. Pulsa para retirar la validación.`
    : 'Marcar este post como validado';

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        title={validatedTitle}
        aria-pressed={validated}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors disabled:opacity-60 ${
          validated
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
        {validated ? 'Post validado' : 'Validar post'}
      </button>
      <button
        type="button"
        onClick={() => setShowLog(true)}
        title="Ver historial de validaciones"
        aria-label="Ver historial de validaciones"
        className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <History className="w-4 h-4" />
      </button>
      {showLog && <PostValidationLog slug={slug} onClose={() => setShowLog(false)} />}
    </>
  );
}
