// src/components/proposals/useProposeAppDialog.jsx
// Abre «Propón una app» bajo demanda: el diálogo (y el registro de apps que
// usa para sugerir) se descarga al abrirlo o al pasar el ratón por el botón,
// nunca con la página.
//
//   const [openPropose, proposeDialog, preloadPropose] = useProposeAppDialog('portada');
//   <button onClick={openPropose} onPointerEnter={preloadPropose}>Propón una app</button>
//   {proposeDialog}
import React, { Suspense, lazy, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

const loadDialog = () => import('./ProposeAppDialog');
const ProposeAppDialog = lazy(loadDialog);

export default function useProposeAppDialog(source) {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const preload = useCallback(() => { loadDialog(); }, []);

  const element = (
    <Suspense fallback={null}>
      <AnimatePresence>
        {open && <ProposeAppDialog key="propose" source={source} onClose={close} />}
      </AnimatePresence>
    </Suspense>
  );

  return [openDialog, element, preload];
}
