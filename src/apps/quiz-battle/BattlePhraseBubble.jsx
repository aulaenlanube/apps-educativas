import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bocadillo flotante que sale del avatar de un jugador. Se posiciona
// `absolute` con respecto al avatar (el contenedor padre debe ser
// `position: relative`). Se queda anclado encima del avatar.
//
// Props:
//   - phrase: { text, emoji, sentAt } | null
//   - placement: 'top' (default) | 'right'
export default function BattlePhraseBubble({ phrase, placement = 'top' }) {
  return (
    <AnimatePresence>
      {phrase && (
        <motion.div
          key={phrase.sentAt}
          initial={{ opacity: 0, scale: 0.6, y: placement === 'top' ? 8 : 0, x: placement === 'right' ? -8 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className={
            placement === 'right'
              ? 'absolute left-full ml-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none'
              : 'absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-30 pointer-events-none'
          }
        >
          <div className="relative px-3 py-1.5 rounded-2xl bg-white border-2 border-violet-300 shadow-2xl whitespace-nowrap max-w-[260px]">
            {placement === 'top' && (
              <>
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0"
                  style={{
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '10px solid #c4b5fd',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-0 h-0"
                  style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '8px solid white',
                  }}
                />
              </>
            )}
            {placement === 'right' && (
              <>
                <span
                  aria-hidden
                  className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '10px solid #c4b5fd',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '8px solid white',
                  }}
                />
              </>
            )}
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
