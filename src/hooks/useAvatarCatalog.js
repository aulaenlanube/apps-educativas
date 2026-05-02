import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

let _cache = null;
let _cachePromise = null;
const _listeners = new Set();

async function fetchCatalog() {
  if (_cache) return _cache;
  if (_cachePromise) return _cachePromise;
  _cachePromise = (async () => {
    const { data, error } = await supabase.rpc('avatar_list_definitions');
    if (error) {
      console.warn('[avatar] catalog fetch failed:', error.message);
      _cachePromise = null;
      return [];
    }
    _cache = Array.isArray(data) ? data : [];
    _listeners.forEach((fn) => fn(_cache));
    return _cache;
  })();
  return _cachePromise;
}

export function invalidateAvatarCatalog() {
  _cache = null;
  _cachePromise = null;
  fetchCatalog();
}

export function useAvatarCatalog() {
  const [catalog, setCatalog] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    let mounted = true;
    if (_cache) {
      setCatalog(_cache);
      setLoading(false);
    } else {
      fetchCatalog().then((data) => {
        if (!mounted) return;
        setCatalog(data);
        setLoading(false);
      });
    }
    const listener = (data) => { if (mounted) setCatalog(data); };
    _listeners.add(listener);
    return () => { mounted = false; _listeners.delete(listener); };
  }, []);

  const byCode = useCallback((code) => {
    if (!code) return null;
    return (catalog || []).find((a) => a.code === code) || null;
  }, [catalog]);

  return { catalog, loading, byCode };
}
