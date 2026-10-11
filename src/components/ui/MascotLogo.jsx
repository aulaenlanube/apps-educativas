import React, { useId } from 'react';

// Logo de la cabecera: la cara del robot mascota (RobotMascot) en miniatura.
// Misma paleta y rasgos (visor oscuro, ojo derecho más grande, iris cian-índigo,
// boca luminosa) para que logo y mascota se lean como el mismo personaje.
// Parpadeo y mirada en CSS (.mlogo-* en src/styles/fx.css).
const MascotLogo = ({ className = "w-7 h-7" }) => {
    const uid = useId().replace(/:/g, '');
    const g = (n) => `${n}-${uid}`;
    return (
        <svg
            viewBox="0 0 100 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`mlogo ${className}`}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={g('head')} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="40%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#3730a3" />
                </linearGradient>
                <linearGradient id={g('visor')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0b0a24" />
                </linearGradient>
                <radialGradient id={g('iris')} cx="0.4" cy="0.35" r="0.65">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                </radialGradient>
                <linearGradient id={g('gloss')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
            </defs>

            {/* Cabeza */}
            <rect x="5" y="5" width="90" height="70" rx="24" fill={`url(#${g('head')})`} />
            <rect x="5.75" y="5.75" width="88.5" height="68.5" rx="23.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <path d="M18 14 Q34 8 56 9" stroke={`url(#${g('gloss')})`} strokeWidth="5" strokeLinecap="round" />

            {/* Visor */}
            <rect x="13" y="19" width="74" height="40" rx="19" fill={`url(#${g('visor')})`} />
            <rect x="13" y="19" width="74" height="40" rx="19" stroke="rgba(103,232,249,0.45)" strokeWidth="1.2" />

            {/* Ojos */}
            <g className="mlogo-eye" style={{ transformOrigin: '38px 38px' }}>
                <circle cx="38" cy="38" r="10" fill="white" />
                <g className="mlogo-look">
                    <circle cx="38" cy="38" r="5.6" fill={`url(#${g('iris')})`} />
                    <circle cx="38" cy="38" r="2.6" fill="#0b0a24" />
                    <circle cx="36" cy="35.6" r="1.7" fill="white" />
                </g>
            </g>
            <g className="mlogo-eye" style={{ transformOrigin: '64px 37px' }}>
                <circle cx="64" cy="37" r="13" fill="white" />
                <g className="mlogo-look">
                    <circle cx="64" cy="37" r="7" fill={`url(#${g('iris')})`} />
                    <circle cx="64" cy="37" r="3.3" fill="#0b0a24" />
                    <circle cx="61.4" cy="34" r="2.1" fill="white" />
                </g>
            </g>

            {/* Boca */}
            <path d="M43 66 Q51 71 59 66" stroke="#67e8f9" strokeWidth="3.6" strokeLinecap="round" />
            <ellipse cx="22" cy="65" rx="5" ry="2.6" fill="#f472b6" opacity="0.45" />
            <ellipse cx="80" cy="65" rx="5" ry="2.6" fill="#f472b6" opacity="0.45" />
        </svg>
    );
};

export default MascotLogo;
