import React from 'react';
import { BadgeCheck, Clock3 } from 'lucide-react';
import { useBlogValidations } from '@/blog/validationStore';
import { formatDateLong } from '@/blog/utils';

// Indicador de validación visible SOLO para administradores. Verde si el post
// está validado, ámbar si está pendiente. Se usa en los listados (PostCard,
// FeaturedCarousel) para localizar de un vistazo lo que falta por revisar.
export default function PostValidationBadge({ slug, className = '' }) {
  const { isAdmin, getValidation } = useBlogValidations();
  if (!isAdmin) return null;

  const v = getValidation(slug);
  const validated = !!v?.validated;
  const title = validated
    ? `Validado${v?.validated_by_name ? ` por ${v.validated_by_name}` : ''}${
        v?.validated_at ? ` · ${formatDateLong(v.validated_at)}` : ''
      }`
    : 'Pendiente de validar';

  return (
    <span
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center rounded-full shadow-lg ring-1 ring-white/40 backdrop-blur-sm ${
        validated ? 'bg-emerald-500/90 text-white' : 'bg-amber-400/95 text-amber-950'
      } ${className}`}
    >
      {validated ? <BadgeCheck className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
    </span>
  );
}
