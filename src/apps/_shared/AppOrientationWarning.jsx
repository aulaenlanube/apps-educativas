import React, { useId } from 'react';
import { Monitor, RotateCw } from 'lucide-react';
import './AppOrientationWarning.css';

// Aviso a pantalla completa para apps que necesitan la pantalla en horizontal
// (se muestra solo en orientación vertical, por CSS). Rediseño 2026: escenario
// nocturno del kit con un móvil dibujado que gira (sin emojis como ilustración).
const AppOrientationWarning = () => {
    const uid = useId().replace(/:/g, '');
    const id = (k) => `aow-${uid}-${k}`;
    return (
        <div className="app-orientation-warning" role="status" aria-live="polite">
            <span className="orientation-orb orientation-orb--a" aria-hidden="true" />
            <span className="orientation-orb orientation-orb--b" aria-hidden="true" />
            <span className="orientation-grid" aria-hidden="true" />
            <div className="orientation-content">
                <span className="aow-art" aria-hidden="true">
                    <svg viewBox="12 10 136 142" className="aow-svg">
                        <defs>
                            <radialGradient id={id('halo')} cx="50%" cy="50%" r="50%">
                                <stop offset="0" stopColor="#8b5cf6" stopOpacity=".45" />
                                <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id={id('body')} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#818cf8" />
                                <stop offset=".55" stopColor="#4f46e5" />
                                <stop offset="1" stopColor="#312e81" />
                            </linearGradient>
                            <linearGradient id={id('screen')} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#22d3ee" />
                                <stop offset=".55" stopColor="#8b5cf6" />
                                <stop offset="1" stopColor="#ec4899" />
                            </linearGradient>
                            <linearGradient id={id('gloss')} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stopColor="#fff" stopOpacity=".55" />
                                <stop offset="1" stopColor="#fff" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id={id('arrow')} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0" stopColor="#fbbf24" stopOpacity="0" />
                                <stop offset="1" stopColor="#fbbf24" />
                            </linearGradient>
                        </defs>
                        <circle cx="80" cy="80" r="76" fill={`url(#${id('halo')})`} />
                        {/* flecha de giro */}
                        <path d="M30 62 A54 54 0 0 1 116 34" fill="none" stroke={`url(#${id('arrow')})`} strokeWidth="6" strokeLinecap="round" />
                        <path d="M108 24 L122 36 L104 42 Z" fill="#fbbf24" />
                        {/* móvil (gira) */}
                        <ellipse cx="80" cy="146" rx="34" ry="4.5" fill="#020617" opacity=".35" />
                        <g className="aow-phone">
                            <rect x="55" y="34" width="50" height="94" rx="11" fill={`url(#${id('body')})`} />
                            <rect x="55.8" y="34.8" width="48.4" height="92.4" rx="10.4" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" />
                            <rect x="60" y="41" width="40" height="78" rx="6" fill={`url(#${id('screen')})`} />
                            {/* contenido de la pantalla: mini app con tarjetas */}
                            <rect x="65" y="50" width="30" height="6" rx="3" fill="#fff" opacity=".85" />
                            <rect x="65" y="61" width="13" height="13" rx="3.5" fill="#fff" opacity=".6" />
                            <rect x="82" y="61" width="13" height="13" rx="3.5" fill="#fff" opacity=".45" />
                            <rect x="65" y="78" width="13" height="13" rx="3.5" fill="#fff" opacity=".45" />
                            <rect x="82" y="78" width="13" height="13" rx="3.5" fill="#fff" opacity=".6" />
                            <circle cx="80" cy="104" r="6" fill="#fff" opacity=".9" />
                            <path d="M78 101 L84 104 L78 107 Z" fill="#8b5cf6" />
                            <rect x="72" y="37" width="16" height="2.4" rx="1.2" fill="#1e1b4b" opacity=".6" />
                            <rect x="74" y="122.5" width="12" height="2" rx="1" fill="#fff" opacity=".5" />
                            <path d="M58 44 Q58 37 65 37 L70 37 L58 70 Z" fill={`url(#${id('gloss')})`} opacity=".7" />
                        </g>
                    </svg>
                </span>
                <h2>Gira la pantalla</h2>
                <p>
                    Esta es una aplicación compleja que está diseñada para ser ejecutada desde un equipo de escritorio, si aun así quieres utilizarla desde el dispositivo actual, gira la pantalla para poder visualizar mejor la app
                </p>
                <div className="orientation-hints">
                    <span className="orientation-hint"><RotateCw size={15} /> Pon el móvil en horizontal</span>
                    <span className="orientation-hint"><Monitor size={15} /> Mejor en ordenador</span>
                </div>
            </div>
        </div>
    );
};

export default AppOrientationWarning;
