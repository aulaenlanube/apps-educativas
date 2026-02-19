import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedBackButton – Un único botón SVG con un icono morphing.
 * 
 * Concepto: Un "portal" circular que cambia su contenido interior según la variante.
 *   • "home"     → Un anillo con una flecha de retorno curvada que apunta a un punto central (el origen).
 *   • "subjects" → El anillo se abre en forma de libro/carpeta, la flecha se reconfigura.
 * 
 * Ambos comparten el mismo anillo exterior, la misma base de la flecha y el mismo estilo.
 * La transición entre páginas se siente como un morph continuo.
 */
const AnimatedBackButton = ({ variant = 'home', onClick, label }) => {
    const isHome = variant === 'home';
    const defaultLabel = isHome ? 'Volver al Inicio' : 'Volver a Asignaturas';
    const displayLabel = label || defaultLabel;

    // Animación compartida para los trazos SVG
    const drawIn = (delay = 0, duration = 0.5) => ({
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { duration, delay, ease: 'easeOut' },
    });

    const fadeIn = (delay = 0) => ({
        initial: { opacity: 0, scale: 0 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4, delay, type: 'spring', stiffness: 300, damping: 20 },
    });

    return (
        <motion.button
            onClick={onClick}
            className="group relative flex items-center gap-3 pl-3 pr-5 py-2 rounded-full border-2 border-white/20 text-white font-bold text-sm shadow-lg cursor-pointer select-none"
            style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
                backgroundSize: '200% 200%',
            }}
            whileHover={{
                scale: 1.06,
                backgroundPosition: '100% 100%',
                boxShadow: '0 8px 35px rgba(139, 92, 246, 0.45)',
            }}
            whileTap={{ scale: 0.93 }}
            initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
            {/* Anillo de pulso detrás del icono */}
            <motion.div
                className="absolute left-1.5 w-[38px] h-[38px] rounded-full border-2 border-white/20"
                animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0, 0.3],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* SVG Icon */}
            <motion.svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 shrink-0"
            >
                {/* ─── BASE COMPARTIDA: Anillo circular ─── */}
                <motion.circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="white"
                    strokeWidth="2"
                    fill="rgba(255,255,255,0.06)"
                    {...drawIn(0, 0.6)}
                    style={{ strokeDasharray: '4 3' }}
                />

                {isHome ? (
                    /* ═══════════════════════════════════════════
                       VARIANTE HOME – Flecha espiral hacia el centro
                       ═══════════════════════════════════════════ */
                    <>
                        {/* Flecha curva de retorno */}
                        <motion.path
                            d="M26 14C26 14 24 9 18 9C12 9 9 14 9 18C9 22 12 26 17 26"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                            {...drawIn(0.2, 0.7)}
                        />
                        {/* Punta de la flecha */}
                        <motion.path
                            d="M14 26L17 26L17 29"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            {...drawIn(0.6, 0.3)}
                        />
                        {/* Punto central – el hogar/destino */}
                        <motion.circle
                            cx="18"
                            cy="18"
                            r="2.5"
                            fill="white"
                            {...fadeIn(0.7)}
                        />
                        {/* Pulso del punto central */}
                        <motion.circle
                            cx="18"
                            cy="18"
                            r="2.5"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            animate={{
                                r: [2.5, 5.5, 2.5],
                                opacity: [0.6, 0, 0.6],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        />
                    </>
                ) : (
                    /* ═══════════════════════════════════════════
                       VARIANTE SUBJECTS – Flecha + rejilla de asignaturas
                       ═══════════════════════════════════════════ */
                    <>
                        {/* Flecha curva de retorno (misma base, distinta curva) */}
                        <motion.path
                            d="M8 18C8 18 8 11 14 9"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                            {...drawIn(0.2, 0.5)}
                        />
                        {/* Punta de la flecha */}
                        <motion.path
                            d="M5 17L8 20L11 17"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            {...drawIn(0.4, 0.3)}
                        />
                        {/* Mini-grid 2x2 → representando asignaturas */}
                        <motion.rect
                            x="15" y="12" width="4.5" height="4.5" rx="1"
                            stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"
                            {...drawIn(0.5, 0.3)}
                        />
                        <motion.rect
                            x="21.5" y="12" width="4.5" height="4.5" rx="1"
                            stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"
                            {...drawIn(0.6, 0.3)}
                        />
                        <motion.rect
                            x="15" y="18.5" width="4.5" height="4.5" rx="1"
                            stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"
                            {...drawIn(0.7, 0.3)}
                        />
                        <motion.rect
                            x="21.5" y="18.5" width="4.5" height="4.5" rx="1"
                            stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"
                            {...drawIn(0.8, 0.3)}
                        />
                        {/* Destellos en las esquinas de la grid */}
                        <motion.circle cx="17.2" cy="14.2" r="0.8" fill="white"
                            {...fadeIn(0.9)} />
                        <motion.circle cx="23.7" cy="20.7" r="0.8" fill="white"
                            {...fadeIn(1.0)} />
                    </>
                )}
            </motion.svg>

            {/* Texto */}
            <motion.span
                className="relative z-10 whitespace-nowrap"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                {displayLabel}
            </motion.span>

            {/* Shimmer en hover */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
        </motion.button>
    );
};

export default AnimatedBackButton;
