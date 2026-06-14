import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Estado de validación de los posts del blog, cacheado en memoria igual que
// useAvatarCatalog. Solo se consulta cuando el usuario es admin (la RPC rechaza
// a cualquier otro rol). El cache guarda un Map slug -> { validated, validated_at,
// validated_by_name } con SOLO los posts validados; cualquier slug ausente del
// Map se interpreta como "pendiente de validar".

let _cache = null;          // Map<slug, entry> | null
let _cachePromise = null;
const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn(_cache));
}

async function fetchValidations() {
  if (_cache) return _cache;
  if (_cachePromise) return _cachePromise;
  _cachePromise = (async () => {
    const { data, error } = await supabase.rpc('blog_admin_list_post_validations');
    if (error || data?.error) {
      // No-admin o fallo de red: cache vacío, sin romper la UI pública.
      _cachePromise = null;
      _cache = new Map();
      return _cache;
    }
    const map = new Map();
    (data?.validations || []).forEach((v) => map.set(v.slug, v));
    _cache = map;
    notify();
    return _cache;
  })();
  return _cachePromise;
}

export function invalidateBlogValidations() {
  _cache = null;
  _cachePromise = null;
}

// Actualización optimista del cache tras alternar la validación de un post,
// sin necesidad de re-consultar toda la lista.
export function setLocalValidation(slug, entry) {
  const next = new Map(_cache || []);
  if (entry && entry.validated) next.set(slug, entry);
  else next.delete(slug);
  _cache = next;
  notify();
}

export function useBlogValidations() {
  const { isAdmin } = useAuth();
  const [map, setMap] = useState(_cache || new Map());
  const [loading, setLoading] = useState(isAdmin && !_cache);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return undefined;
    }
    let mounted = true;
    if (_cache) {
      setMap(_cache);
      setLoading(false);
    } else {
      setLoading(true);
      fetchValidations().then((m) => {
        if (!mounted) return;
        setMap(m);
        setLoading(false);
      });
    }
    const listener = (m) => { if (mounted) setMap(new Map(m || [])); };
    _listeners.add(listener);
    return () => { mounted = false; _listeners.delete(listener); };
  }, [isAdmin]);

  const getValidation = useCallback((slug) => map.get(slug) || null, [map]);
  const isValidated = useCallback((slug) => !!map.get(slug)?.validated, [map]);

  return { isAdmin, loading, getValidation, isValidated };
}
