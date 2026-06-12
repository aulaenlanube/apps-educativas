// src/hooks/useGraphicsQuality.js
// Preferencia global de calidad gráfica como estado React sincronizado:
// cualquier componente que la cambie (perfil, selector in-app) actualiza al
// resto vía QUALITY_EVENT, y otras pestañas vía el evento 'storage'.
import { useCallback, useEffect, useState } from 'react';
import {
  loadQualityPref, saveQualityPref, resolveQuality, PREF_KEY, QUALITY_EVENT,
} from '@/services/graphicsQuality';

export default function useGraphicsQuality() {
  const [pref, setPrefState] = useState(loadQualityPref);
  const [tier, setTier] = useState(() => resolveQuality(loadQualityPref()));

  const setPref = useCallback((v) => {
    saveQualityPref(v); // dispara QUALITY_EVENT → sincroniza este hook y el resto
  }, []);

  useEffect(() => {
    const apply = (v) => {
      setPrefState(v);
      setTier(resolveQuality(v));
    };
    const onCustom = (e) => apply(e.detail);
    const onStorage = (e) => {
      if (e.key === PREF_KEY && e.newValue) apply(e.newValue);
    };
    window.addEventListener(QUALITY_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(QUALITY_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return { pref, tier, setPref };
}
