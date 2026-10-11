// src/hooks/useFxTier.js
// Nivel de efectos de la interfaz (high|medium|low) como estado React.
// Ver src/services/uiFx.js.
import { useEffect, useState } from 'react';
import { getFxTier, FX_EVENT } from '@/services/uiFx';

export default function useFxTier() {
  const [tier, setTier] = useState(getFxTier);
  useEffect(() => {
    const on = (e) => setTier(e.detail);
    window.addEventListener(FX_EVENT, on);
    setTier(getFxTier());
    return () => window.removeEventListener(FX_EVENT, on);
  }, []);
  return tier;
}
