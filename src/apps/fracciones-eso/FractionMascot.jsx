// Mascota de Fracciones PRO: "Quesito", una tarta índigo a la que le falta su
// porción ámbar (como en el icono de la app). Reacciona a los aciertos y fallos
// de la práctica (mood) y cuenta un chiste si la pulsas. Solo presentación.
// Animación: transform/opacity; el balanceo continuo solo con html[data-fx="high"].
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JOKES = [
    '¿Qué le dice el 0 al 8?\n¡Bonito cinturón!',
    '¿Por qué estaba triste el libro de mates?\n¡Porque tenía muchos problemas!',
    '¿Qué le dice una curva a una tangente?\n¡No me toques!',
    '¿Cómo estornuda un matemático?\n¡Piiiii... piiiiiii!',
    '¿Tienes frío?\n¡Ponte en la esquina, está a 90 grados!',
    '¿Qué es un oso polar rectangular?\n¡Un oso cartesiano!',
    '¡No seas irracional!',
    '¡Me partís el corazón en fracciones!',
    '¿Qué hace una abeja en el gimnasio?\n¡Zum-ba!',
];

const REACTIONS = {
    happy: ['¡Toma ya!', '¡Fracción perfecta!', '¡Eso es!', '¡Qué crack!'],
    sad: ['¡Casi! Revisa el paso', 'Respira y vuelve a probar', '¡Tú puedes!', 'Mira la pista 💡'],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FractionMascot = ({ mood = 'idle', hint, className = '' }) => {
    const [joke, setJoke] = useState(null);
    const timerRef = useRef(null);
    useEffect(() => () => clearTimeout(timerRef.current), []);

    // Una frase nueva cada vez que cambia el ánimo
    const reaction = useMemo(() => (REACTIONS[mood] ? pick(REACTIONS[mood]) : null), [mood]);

    const handleClick = () => {
        if (joke) return;
        setJoke(pick(JOKES));
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setJoke(null), 4000);
    };

    const bubble = joke || reaction || hint;

    return (
        <div className={`fr-mascot is-${mood} ${className}`}>
            <AnimatePresence mode="wait">
                {bubble && (
                    <motion.div
                        key={bubble}
                        className={`fr-mascot__bubble ${joke ? 'is-joke' : ''}`}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        role="status"
                    >
                        {bubble}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="button"
                className="fr-mascot__btn"
                onClick={handleClick}
                title="¡Púlsame para un chiste!"
                aria-label="Mascota: pulsa para escuchar un chiste"
            >
                <svg viewBox="0 0 160 150" className="fr-mascot__svg" aria-hidden="true">
                    <defs>
                        <linearGradient id="fr-m-body" x1="0.15" y1="0.1" x2="0.85" y2="1">
                            <stop offset="0" stopColor="#c7d2fe" />
                            <stop offset=".45" stopColor="#6366f1" />
                            <stop offset="1" stopColor="#3730a3" />
                        </linearGradient>
                        <linearGradient id="fr-m-slice" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#fef3c7" />
                            <stop offset=".5" stopColor="#fbbf24" />
                            <stop offset="1" stopColor="#d97706" />
                        </linearGradient>
                        <radialGradient id="fr-m-gloss" cx="0.3" cy="0.25" r="0.6">
                            <stop offset="0" stopColor="#fff" stopOpacity=".6" />
                            <stop offset="1" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="fr-m-shadow" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#1e1b4b" stopOpacity=".35" />
                            <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* sombra de contacto */}
                    <ellipse cx="78" cy="139" rx="46" ry="8" fill="url(#fr-m-shadow)" />

                    <g className="fr-mascot__body">
                        {/* pies */}
                        <rect x="52" y="118" width="16" height="18" rx="8" fill="#312e81" />
                        <rect x="82" y="118" width="16" height="18" rx="8" fill="#312e81" />
                        {/* brazos */}
                        <path d="M33 92 q-12 4 -14 16" stroke="#4338ca" strokeWidth="7" strokeLinecap="round" fill="none" />
                        <path className="fr-mascot__arm" d="M118 96 q14 2 18 -10" stroke="#4338ca" strokeWidth="7" strokeLinecap="round" fill="none" />
                        {/* tarta sin su porción (cuarto superior derecho) */}
                        <path d="M78 80 L78 32 A48 48 0 1 0 126 80 Z" fill="url(#fr-m-body)" />
                        <path d="M78 80 L78 32 A48 48 0 1 0 126 80 Z" fill="url(#fr-m-gloss)" />
                        <path d="M78 80 L78 40 M78 80 L118 80" stroke="#312e81" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round" />
                        {/* borde de luz */}
                        <path d="M38 62 A44 44 0 0 1 70 37" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" fill="none" />

                        {/* cara */}
                        <g transform="translate(-3 5)">
                        {mood === 'happy' ? (
                            <g stroke="#1e1b4b" strokeWidth="3.4" strokeLinecap="round" fill="none">
                                <path d="M50 88 q6 -7 12 0" />
                                <path d="M74 88 q7 -8 14 0" />
                            </g>
                        ) : (
                            <g>
                                <circle cx="56" cy="88" r="8.5" fill="#fff" />
                                <circle cx="81" cy="87" r="10" fill="#fff" />
                                <circle cx={mood === 'sad' ? 55 : 58} cy={mood === 'sad' ? 91 : 89} r="4" fill="#1e1b4b" />
                                <circle cx={mood === 'sad' ? 80 : 84} cy={mood === 'sad' ? 90 : 88} r="4.8" fill="#1e1b4b" />
                                <circle cx="59.4" cy="87.4" r="1.4" fill="#fff" />
                                <circle cx="85.6" cy="86.2" r="1.6" fill="#fff" />
                            </g>
                        )}
                        {mood === 'sad' && (
                            <g stroke="#1e1b4b" strokeWidth="2.6" strokeLinecap="round">
                                <path d="M48 76 l12 4" />
                                <path d="M90 75 l-12 4" />
                            </g>
                        )}
                        <ellipse cx="46" cy="102" rx="6" ry="3.6" fill="#f472b6" opacity=".55" />
                        <ellipse cx="96" cy="101" rx="6" ry="3.6" fill="#f472b6" opacity=".55" />
                        {mood === 'happy' && (
                            <path d="M58 100 q12 16 26 0 Z" fill="#1e1b4b" />
                        )}
                        {mood === 'happy' && <path d="M64 106 q7 5 14 0" fill="#fb7185" />}
                        {mood === 'idle' && <path d="M60 103 q10 9 20 0" stroke="#1e1b4b" strokeWidth="3.2" strokeLinecap="round" fill="none" />}
                        {mood === 'sad' && <path d="M61 108 q9 -8 18 0" stroke="#1e1b4b" strokeWidth="3.2" strokeLinecap="round" fill="none" />}
                        {mood === 'sad' && <path d="M30 70 q5 7 0 10 q-5 -3 0 -10 Z" fill="#7dd3fc" />}
                        </g>
                    </g>

                    {/* la porción que se ha escapado */}
                    <g className="fr-mascot__slice">
                        <path d="M88 70 L88 22 A48 48 0 0 1 136 70 Z" fill="#b45309" transform="translate(0 3)" />
                        <path d="M88 70 L88 22 A48 48 0 0 1 136 70 Z" fill="url(#fr-m-slice)" />
                        <path d="M94 28 A42 42 0 0 1 128 58" stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <circle cx="104" cy="52" r="2.6" fill="#78350f" />
                        <circle cx="116" cy="52" r="2.6" fill="#78350f" />
                        <path d="M105 59 q5 4 10 0" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    </g>
                </svg>
            </button>
        </div>
    );
};

export default FractionMascot;
