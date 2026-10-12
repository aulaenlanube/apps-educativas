// src/hooks/useBackgroundScene.js
// Entorno del fondo 3D ('ciudad' | 'naturaleza' | 'espacio') como estado React sincronizado:
// el menú de usuario, la barra lateral móvil y el pie lo cambian y el fondo
// persistente lo aplica al momento. Ver src/services/backgroundScene.js.
import { useCallback, useEffect, useState } from 'react';
import {
  loadBgScene, saveBgScene, isValidBgScene, nextBgScene, BG_SCENE_EVENT, BG_SCENE_KEY,
} from '@/services/backgroundScene';

export default function useBackgroundScene() {
  const [scene, setSceneState] = useState(loadBgScene);

  const setScene = useCallback((v) => saveBgScene(v), []);
  const toggleScene = useCallback(() => {
    saveBgScene(nextBgScene(loadBgScene()));
  }, []);

  useEffect(() => {
    const onCustom = (e) => { if (isValidBgScene(e.detail)) setSceneState(e.detail); };
    const onStorage = (e) => { if (e.key === BG_SCENE_KEY) setSceneState(loadBgScene()); };
    window.addEventListener(BG_SCENE_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    setSceneState(loadBgScene());
    return () => {
      window.removeEventListener(BG_SCENE_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return { scene, setScene, toggleScene };
}
