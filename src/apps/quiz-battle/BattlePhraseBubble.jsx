import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bocadillo flotante anclado a un avatar/emoji. El padre debe ser
// `position: relative` para que el `absolute` se posicione respecto a él.
//
// La cola del bocadillo apunta al CENTRO del avatar (su tip queda dentro del
// círculo del avatar), independientemente del tamaño del avatar.
//
// Props:
//   - phrase: { text, emoji, sentAt } | null
export default function BattlePhraseBubble({ phrase }) {
  return (
    <AnimatePresence>
      {phrase && (
        <motion.div
          key={phrase.sentAt}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          // top:50% + translate(-50%, -100%) deja la base del bocadillo justo
          // sobre el centro del avatar; el translateY(-12px) extra reserva el
          // espacio para la cola, cuya punta cae exactamente en el centro.
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, calc(-100% - 12px))' }}
          className="absolute z-30 pointer-events-none"
        >
          <div className="relative px-3 py-1.5 rounded-2xl bg-white border-2 border-violet-300 shadow-2xl whitespace-nowrap max-w-[260px]">
            {/* Cola del bocadillo: sale desde la base centrada y la punta
                queda 12px por debajo (= centro del avatar). */}
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 -bottom-[12px] w-0 h-0"
              style={{
                borderLeft: '9px solid transparent',
                borderRight: '9px solid transparent',
                borderTop: '12px solid #c4b5fd',
              }}
            />
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 -bottom-[8px] w-0 h-0"
              style={{
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '10px solid white',
              }}
            />
            <p className="text-sm font-bold text-slate-800 leading-tight truncate">
              <span className="text-base mr-1.5 align-middle">{phrase.emoji}</span>
              {phrase.text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
