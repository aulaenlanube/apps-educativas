import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RISE_DURATION_S = 5;

// Overlay global de mensajes flotantes para el modo batalla. Cada mensaje
// recibido entra por la parte inferior en una posición horizontal aleatoria,
// sube poco a poco hacia arriba y se difumina hasta desaparecer a los 5s.
//
// No identifica al emisor: la sala es ruidosa y deliberadamente anónima
// (varios jugadores escribiendo a la vez). Esto sustituye al bocadillo
// anclado al avatar, que se posicionaba mal en la parrilla de jugadores.
//
// Props:
//   - messages: [{ id, text, emoji }]   — mantenido por useBattlePhrases
export default function BattleRisingMessages({ messages }) {
  return (
    <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.7, bottom: '6%' }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1, 1, 0.95],
              bottom: ['6%', '88%'],
            }}
            transition={{
              duration: RISE_DURATION_S,
              ease: 'linear',
              opacity: { duration: RISE_DURATION_S, times: [0, 0.12, 0.65, 1] },
              scale:   { duration: RISE_DURATION_S, times: [0, 0.18, 0.8, 1] },
            }}
            style={{
              left: `${m.x}%`,
              transform: 'translateX(-50%)',
              position: 'absolute',
            }}
            className="px-4 py-2 rounded-2xl bg-white/95 backdrop-blur border-2 border-violet-300 shadow-2xl whitespace-nowrap max-w-[80vw]"
          >
            <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
              <span className="text-base mr-1.5 align-middle">{m.emoji}</span>
              <span className="align-middle">{m.text}</span>
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
