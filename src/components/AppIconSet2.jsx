// Set 2: Apps de matemáticas, ciencias y herramientas
// Animaciones CSS definidas en src/styles/icon-animations.css

const icons2 = {
  'comprension-oral': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-comp" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-comp)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Auriculares */}
      <path d="M16 28v-4a8 8 0 0 1 16 0v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="12" y="26" width="4" height="7" rx="2" fill="#fff" opacity="0.9" />
      <rect x="32" y="26" width="4" height="7" rx="2" fill="#fff" opacity="0.9" />
      {/* Ondas de sonido */}
      <path d="M26 20c1.5-1 2.5-1 4 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" style={{ animation: 'ai-pulse 2.5s ease-in-out infinite', transformOrigin: '28px 20px' }} />
      <path d="M27 17c2-1.5 4-1.5 6 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" style={{ animation: 'ai-pulse 2.5s ease-in-out 0.4s infinite', transformOrigin: '30px 17px' }} />
      {/* Check */}
      <circle cx="35" cy="35" r="5" fill="#fff" opacity="0.9" style={{ animation: 'ai-glow 3s ease-in-out infinite', transformOrigin: '35px 35px' }} />
      <path d="M32.5 35l1.8 1.8 3.2-3.6" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sombra */}
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'sumas-primaria': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-sum" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-sum)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Signo + grande */}
      <line x1="24" y1="14" x2="24" y2="34" stroke="#fff" strokeWidth="4" strokeLinecap="round" style={{ animation: 'ai-breathe 3s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      <line x1="14" y1="24" x2="34" y2="24" stroke="#fff" strokeWidth="4" strokeLinecap="round" style={{ animation: 'ai-breathe 3s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      {/* Números apilados */}
      <text x="10" y="18" fill="#fff" opacity="0.5" fontSize="7" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-bob 3s ease-in-out infinite' }}>3</text>
      <text x="35" y="18" fill="#fff" opacity="0.5" fontSize="7" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-bob 3s ease-in-out 0.5s infinite' }}>7</text>
      <text x="10" y="38" fill="#fff" opacity="0.5" fontSize="7" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-bob 3s ease-in-out 1s infinite' }}>5</text>
      <text x="35" y="38" fill="#fff" opacity="0.5" fontSize="7" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-bob 3s ease-in-out 1.5s infinite' }}>2</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'restas-primaria': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-res" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-res)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Signo - grande */}
      <line x1="14" y1="24" x2="34" y2="24" stroke="#fff" strokeWidth="4" strokeLinecap="round" style={{ animation: 'ai-swing 3s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      {/* Números sustrayéndose */}
      <text x="15" y="17" fill="#fff" opacity="0.7" fontSize="9" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-bob 3.5s ease-in-out infinite' }}>9</text>
      <text x="28" y="17" fill="#fff" opacity="0.4" fontSize="9" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-bob 3.5s ease-in-out 0.6s infinite' }}>4</text>
      {/* Resultado */}
      <text x="20" y="38" fill="#fff" opacity="0.6" fontSize="10" fontWeight="bold" fontFamily="system-ui">= 5</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'multiplicaciones-primaria': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-mul" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-mul)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Signo x grande */}
      <line x1="17" y1="17" x2="31" y2="31" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" style={{ animation: 'ai-spin 12s linear infinite', transformOrigin: '24px 24px' }} />
      <line x1="31" y1="17" x2="17" y2="31" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" style={{ animation: 'ai-spin 12s linear infinite', transformOrigin: '24px 24px' }} />
      {/* Mini tabla */}
      <rect x="8" y="8" width="8" height="6" rx="1.5" fill="#fff" opacity="0.2" style={{ animation: 'ai-shimmer 3s ease-in-out infinite' }} />
      <text x="10" y="13" fill="#fff" opacity="0.6" fontSize="5" fontFamily="system-ui">2x3</text>
      <rect x="32" y="8" width="8" height="6" rx="1.5" fill="#fff" opacity="0.2" style={{ animation: 'ai-shimmer 3s ease-in-out 0.75s infinite' }} />
      <text x="33.5" y="13" fill="#fff" opacity="0.6" fontSize="5" fontFamily="system-ui">4x5</text>
      <rect x="8" y="36" width="8" height="6" rx="1.5" fill="#fff" opacity="0.2" style={{ animation: 'ai-shimmer 3s ease-in-out 1.5s infinite' }} />
      <text x="9.5" y="41" fill="#fff" opacity="0.6" fontSize="5" fontFamily="system-ui">7x8</text>
      <rect x="32" y="36" width="8" height="6" rx="1.5" fill="#fff" opacity="0.2" style={{ animation: 'ai-shimmer 3s ease-in-out 2.25s infinite' }} />
      <text x="33.5" y="41" fill="#fff" opacity="0.6" fontSize="5" fontFamily="system-ui">9x6</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'divisiones-primaria': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-div" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-div)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Signo ÷ */}
      <circle cx="24" cy="17" r="2.5" fill="#fff" style={{ animation: 'ai-float 3s ease-in-out infinite', transformOrigin: '24px 17px' }} />
      <line x1="15" y1="24" x2="33" y2="24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" style={{ animation: 'ai-float 3s ease-in-out 0.3s infinite' }} />
      <circle cx="24" cy="31" r="2.5" fill="#fff" style={{ animation: 'ai-float 3s ease-in-out 0.6s infinite', transformOrigin: '24px 31px' }} />
      {/* División visual - bloques */}
      <rect x="8" y="33" width="4" height="4" rx="1" fill="#fff" opacity="0.3" style={{ animation: 'ai-swing 4s ease-in-out infinite', transformOrigin: '10px 35px' }} />
      <rect x="8" y="37" width="4" height="4" rx="1" fill="#fff" opacity="0.3" style={{ animation: 'ai-swing 4s ease-in-out 0.5s infinite', transformOrigin: '10px 39px' }} />
      <rect x="36" y="33" width="4" height="4" rx="1" fill="#fff" opacity="0.3" style={{ animation: 'ai-swing 4s ease-in-out 1s infinite', transformOrigin: '38px 35px' }} />
      <rect x="36" y="37" width="4" height="4" rx="1" fill="#fff" opacity="0.3" style={{ animation: 'ai-swing 4s ease-in-out 1.5s infinite', transformOrigin: '38px 39px' }} />
      <line x1="8" y1="10" x2="12" y2="10" stroke="#fff" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <line x1="36" y1="10" x2="40" y2="10" stroke="#fff" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'supermercado-matematico': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-sup" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-sup)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Carrito */}
      <path d="M12 18h2l3 12h14l3-9H17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'ai-wiggle 3s ease-in-out infinite' }} />
      <circle cx="19" cy="34" r="2" fill="#fff" />
      <circle cx="29" cy="34" r="2" fill="#fff" />
      {/* Monedas */}
      <circle cx="35" cy="13" r="4" fill="#fbbf24" stroke="#fff" strokeWidth="1" style={{ animation: 'ai-bounce 2.5s ease-in-out infinite', transformOrigin: '35px 13px' }} />
      <text x="33.5" y="15" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="system-ui">€</text>
      <circle cx="38" cy="19" r="3" fill="#fbbf24" stroke="#fff" strokeWidth="0.8" opacity="0.7" style={{ animation: 'ai-bounce 2.5s ease-in-out 0.5s infinite', transformOrigin: '38px 19px' }} />
      {/* Etiqueta precio */}
      <rect x="8" y="9" width="10" height="6" rx="2" fill="#fff" opacity="0.85" />
      <text x="10" y="14" fill="#22c55e" fontSize="5" fontWeight="bold" fontFamily="system-ui">2.5€</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'numeros-romanos': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-rom" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-rom)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Columna romana */}
      <rect x="20" y="10" width="8" height="3" rx="1" fill="#fff" opacity="0.8" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      <rect x="21" y="13" width="6" height="22" rx="1" fill="#fff" opacity="0.6" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      <rect x="20" y="35" width="8" height="3" rx="1" fill="#fff" opacity="0.8" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      {/* Numerales */}
      <text x="9" y="20" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="serif" opacity="0.9" style={{ animation: 'ai-shimmer 3s ease-in-out infinite' }}>I</text>
      <text x="7" y="32" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="serif" opacity="0.7" style={{ animation: 'ai-shimmer 3s ease-in-out 0.6s infinite' }}>V</text>
      <text x="33" y="20" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="serif" opacity="0.9" style={{ animation: 'ai-shimmer 3s ease-in-out 1.2s infinite' }}>X</text>
      <text x="32" y="32" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="serif" opacity="0.7" style={{ animation: 'ai-shimmer 3s ease-in-out 1.8s infinite' }}>L</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'mayor-menor': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-mym" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-mym)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Balanza base */}
      <line x1="24" y1="36" x2="24" y2="20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="20" y="36" width="8" height="3" rx="1.5" fill="#fff" opacity="0.8" />
      {/* Brazos de balanza inclinados */}
      <line x1="12" y1="22" x2="36" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ animation: 'ai-swing 4s ease-in-out infinite', transformOrigin: '24px 20px' }} />
      {/* Platos */}
      <path d="M8 22 h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'ai-swing 4s ease-in-out infinite', transformOrigin: '24px 20px' }} />
      <path d="M32 18 h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'ai-swing 4s ease-in-out infinite', transformOrigin: '24px 20px' }} />
      {/* Símbolos */}
      <text x="9" y="16" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="system-ui" opacity="0.8" style={{ animation: 'ai-pulse 3s ease-in-out infinite', transformOrigin: '13px 13px' }}>&lt;</text>
      <text x="33" y="14" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="system-ui" opacity="0.8" style={{ animation: 'ai-pulse 3s ease-in-out 1s infinite', transformOrigin: '37px 11px' }}>&gt;</text>
      <text x="20" y="14" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="system-ui" opacity="0.5">=</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'medidas': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-med" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-med)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Regla */}
      <rect x="8" y="12" width="18" height="5" rx="1.5" fill="#fff" opacity="0.85" style={{ animation: 'ai-swing 4s ease-in-out infinite', transformOrigin: '17px 14px' }} />
      <line x1="11" y1="12" x2="11" y2="15" stroke="#f97316" strokeWidth="0.8" />
      <line x1="14" y1="12" x2="14" y2="14" stroke="#f97316" strokeWidth="0.6" />
      <line x1="17" y1="12" x2="17" y2="15" stroke="#f97316" strokeWidth="0.8" />
      <line x1="20" y1="12" x2="20" y2="14" stroke="#f97316" strokeWidth="0.6" />
      <line x1="23" y1="12" x2="23" y2="15" stroke="#f97316" strokeWidth="0.8" />
      {/* Báscula */}
      <ellipse cx="14" cy="35" rx="6" ry="3" fill="#fff" opacity="0.7" />
      <ellipse cx="14" cy="33" rx="5" ry="2.5" fill="#fff" opacity="0.85" />
      <text x="12" y="34.5" fill="#f97316" fontSize="4" fontWeight="bold" fontFamily="system-ui" style={{ animation: 'ai-swing 3s ease-in-out infinite', transformOrigin: '14px 34px' }}>kg</text>
      {/* Jarra medidora */}
      <path d="M30 22v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V22z" fill="#fff" opacity="0.7" />
      <rect x="30" y="30" width="12" height="8" rx="0" fill="#06b6d4" opacity="0.3" style={{ animation: 'ai-shimmer 3.5s ease-in-out infinite' }} />
      <line x1="31" y1="28" x2="35" y2="28" stroke="#f97316" strokeWidth="0.7" opacity="0.8" />
      <line x1="31" y1="32" x2="35" y2="32" stroke="#f97316" strokeWidth="0.7" opacity="0.8" />
      <path d="M42 26h3v4h-3" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'fracciones-eso': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-fra" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-fra)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Círculo de fracciones */}
      <circle cx="20" cy="24" r="10" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.8" />
      <path d="M20 14 L20 34" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
      <path d="M10 24 L30 24" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
      {/* Porción coloreada */}
      <path d="M20 14 A10 10 0 0 1 30 24 L20 24 Z" fill="#fff" opacity="0.5" style={{ animation: 'ai-shimmer 3s ease-in-out infinite' }} />
      <path d="M20 24 A10 10 0 0 1 20 34 L20 24 Z" fill="#fff" opacity="0.3" style={{ animation: 'ai-shimmer 3s ease-in-out 1s infinite' }} />
      {/* Números de fracción */}
      <text x="34" y="20" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="system-ui" opacity="0.9">3</text>
      <line x1="34" y1="22" x2="41" y2="22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <text x="34" y="30" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="system-ui" opacity="0.9">4</text>
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'laboratorio-funciones-2d': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-fun" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-fun)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Ejes cartesianos */}
      <line x1="12" y1="36" x2="12" y2="10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="12" y1="36" x2="40" y2="36" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      {/* Flechas */}
      <path d="M12 10 l-2 3 4 0z" fill="#fff" opacity="0.8" />
      <path d="M40 36 l-3-2 0 4z" fill="#fff" opacity="0.8" />
      {/* Grid sutil */}
      <line x1="19" y1="36" x2="19" y2="12" stroke="#fff" strokeWidth="0.3" opacity="0.3" />
      <line x1="26" y1="36" x2="26" y2="12" stroke="#fff" strokeWidth="0.3" opacity="0.3" />
      <line x1="33" y1="36" x2="33" y2="12" stroke="#fff" strokeWidth="0.3" opacity="0.3" />
      <line x1="12" y1="29" x2="38" y2="29" stroke="#fff" strokeWidth="0.3" opacity="0.3" />
      <line x1="12" y1="22" x2="38" y2="22" stroke="#fff" strokeWidth="0.3" opacity="0.3" />
      {/* Curva (parábola) */}
      <path d="M14 34 Q19 12 26 22 T38 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" style={{ strokeDasharray: 50, animation: 'ai-draw 4s linear infinite' }} />
      {/* Punto resaltado */}
      <circle cx="26" cy="22" r="2.5" fill="#fff" opacity="0.9" style={{ animation: 'ai-pulse 2.5s ease-in-out infinite', transformOrigin: '26px 22px' }} />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'visualizador-3d': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-3d" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-3d)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Cubo 3D - cara frontal */}
      <path d="M16 20 L30 20 L30 34 L16 34 Z" stroke="#fff" strokeWidth="1.5" fill="#fff" opacity="0.15" style={{ animation: 'ai-float 4s ease-in-out infinite' }} />
      {/* Cara superior */}
      <path d="M16 20 L24 13 L38 13 L30 20 Z" stroke="#fff" strokeWidth="1.5" fill="#fff" opacity="0.25" style={{ animation: 'ai-float 4s ease-in-out infinite' }} />
      {/* Cara lateral */}
      <path d="M30 20 L38 13 L38 27 L30 34 Z" stroke="#fff" strokeWidth="1.5" fill="#fff" opacity="0.1" style={{ animation: 'ai-float 4s ease-in-out infinite' }} />
      {/* Aristas traseras (ocultas) */}
      <line x1="16" y1="20" x2="24" y2="13" stroke="#fff" strokeWidth="1.5" opacity="0.9" />
      <line x1="16" y1="34" x2="24" y2="27" stroke="#fff" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
      <line x1="24" y1="27" x2="38" y2="27" stroke="#fff" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
      <line x1="24" y1="27" x2="24" y2="13" stroke="#fff" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
      {/* Vértices resaltados */}
      <circle cx="16" cy="20" r="2" fill="#fff" opacity="0.9" style={{ animation: 'ai-shimmer 3s ease-in-out infinite' }} />
      <circle cx="30" cy="20" r="2" fill="#fff" opacity="0.9" style={{ animation: 'ai-shimmer 3s ease-in-out 0.5s infinite' }} />
      <circle cx="30" cy="34" r="2" fill="#fff" opacity="0.9" style={{ animation: 'ai-shimmer 3s ease-in-out 1s infinite' }} />
      <circle cx="38" cy="13" r="2" fill="#fff" opacity="0.9" style={{ animation: 'ai-shimmer 3s ease-in-out 1.5s infinite' }} />
      <circle cx="24" cy="13" r="2" fill="#fff" opacity="0.7" style={{ animation: 'ai-shimmer 3s ease-in-out 2s infinite' }} />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'rotaciones-grid': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-rot" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-rot)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Grid */}
      <line x1="10" y1="14" x2="10" y2="38" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="18" y1="14" x2="18" y2="38" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="26" y1="14" x2="26" y2="38" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="34" y1="14" x2="34" y2="38" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="14" x2="38" y2="14" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="22" x2="38" y2="22" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="30" x2="38" y2="30" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="38" x2="38" y2="38" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      {/* Figura en L */}
      <rect x="10" y="22" width="8" height="8" rx="1" fill="#fff" opacity="0.6" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '14px 30px' }} />
      <rect x="10" y="30" width="8" height="8" rx="1" fill="#fff" opacity="0.6" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '14px 30px' }} />
      <rect x="18" y="30" width="8" height="8" rx="1" fill="#fff" opacity="0.6" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '14px 30px' }} />
      {/* Figura rotada (fantasma) */}
      <rect x="26" y="14" width="8" height="8" rx="1" fill="#fff" opacity="0.2" />
      <rect x="26" y="22" width="8" height="8" rx="1" fill="#fff" opacity="0.2" />
      <rect x="34" y="22" width="8" height="8" rx="1" fill="#fff" opacity="0.2" />
      {/* Flecha circular */}
      <path d="M22 10 A6 6 0 1 1 16 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" style={{ animation: 'ai-spin 6s linear infinite', transformOrigin: '19px 10px' }} />
      <path d="M22 10 l-2-2.5 3 0z" fill="#fff" opacity="0.9" style={{ animation: 'ai-spin 6s linear infinite', transformOrigin: '19px 10px' }} />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'ordena-bolas': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-bol" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="ai2-bol-b1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="ai2-bol-b2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="ai2-bol-b3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-bol)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Línea base */}
      <line x1="8" y1="36" x2="40" y2="36" stroke="#fff" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      {/* Bola pequeña */}
      <circle cx="12" cy="33" r="3" fill="url(#ai2-bol-b1)" style={{ animation: 'ai-bounce 2.5s ease-in-out infinite', transformOrigin: '12px 33px' }} />
      <ellipse cx="11" cy="32" rx="1" ry="0.8" fill="#fff" opacity="0.3" style={{ animation: 'ai-bounce 2.5s ease-in-out infinite', transformOrigin: '12px 33px' }} />
      {/* Bola mediana */}
      <circle cx="22" cy="31" r="5" fill="url(#ai2-bol-b2)" style={{ animation: 'ai-bounce 2.5s ease-in-out 0.4s infinite', transformOrigin: '22px 31px' }} />
      <ellipse cx="20.5" cy="29.5" rx="1.5" ry="1" fill="#fff" opacity="0.3" style={{ animation: 'ai-bounce 2.5s ease-in-out 0.4s infinite', transformOrigin: '22px 31px' }} />
      {/* Bola grande */}
      <circle cx="34" cy="28" r="8" fill="url(#ai2-bol-b3)" style={{ animation: 'ai-bounce 2.5s ease-in-out 0.8s infinite', transformOrigin: '34px 28px' }} />
      <ellipse cx="31.5" cy="25.5" rx="2.5" ry="1.5" fill="#fff" opacity="0.3" style={{ animation: 'ai-bounce 2.5s ease-in-out 0.8s infinite', transformOrigin: '34px 28px' }} />
      {/* Números */}
      <text x="11" y="20" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="system-ui" opacity="0.7">1</text>
      <text x="21" y="20" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="system-ui" opacity="0.7">2</text>
      <text x="33" y="16" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="system-ui" opacity="0.7">3</text>
      {/* Flechas de orden */}
      <path d="M15 17 L19 17" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M19 17 l-1.5-1.2 0 2.4z" fill="#fff" opacity="0.5" />
      <path d="M25 14 L31 14" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M31 14 l-1.5-1.2 0 2.4z" fill="#fff" opacity="0.5" />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'ordena-numeros': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-ord" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="ai2-ord-c1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="ai2-ord-c2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="ai2-ord-c3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
      {/* Fondo */}
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-ord)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />

      {/* Flecha ascendente izquierda */}
      <path d="M10 36 L10 14" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />
      <path d="M10 13 l-2 2.5 4 0 z" fill="#fff" opacity="0.85" />

      {/* Tarjeta 1 — pequeña (valor menor) */}
      <rect x="16" y="30" width="22" height="7" rx="3.5" fill="url(#ai2-ord-c1)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4"
        style={{ animation: 'ai-bounce 3s ease-in-out infinite', transformOrigin: '27px 33.5px' }} />
      <text x="19" y="35.3" fill="#9a3412" fontSize="5.5" fontWeight="700" fontFamily="system-ui">1,25</text>

      {/* Tarjeta 2 — media */}
      <rect x="16" y="21" width="22" height="7" rx="3.5" fill="url(#ai2-ord-c2)" stroke="rgba(0,0,0,0.12)" strokeWidth="0.4"
        style={{ animation: 'ai-bounce 3s ease-in-out 0.4s infinite', transformOrigin: '27px 24.5px' }} />
      <text x="19" y="26.3" fill="#7c2d12" fontSize="5.5" fontWeight="700" fontFamily="system-ui">3,50</text>

      {/* Tarjeta 3 — grande (valor mayor) */}
      <rect x="16" y="12" width="22" height="7" rx="3.5" fill="url(#ai2-ord-c3)" stroke="rgba(0,0,0,0.12)" strokeWidth="0.4"
        style={{ animation: 'ai-bounce 3s ease-in-out 0.8s infinite', transformOrigin: '27px 15.5px' }} />
      <text x="19" y="17.3" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="system-ui">7,80</text>

      {/* Brillitos */}
      <circle cx="40" cy="11" r="0.9" fill="#fff" opacity="0.7" style={{ animation: 'ai-pulse 2s ease-in-out infinite' }} />
      <circle cx="42" cy="28" r="0.7" fill="#fff" opacity="0.5" style={{ animation: 'ai-pulse 2s ease-in-out 0.7s infinite' }} />

      {/* Sombra inferior */}
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'mesa-crafteo': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-mes" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-mes)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Mesa */}
      <rect x="8" y="28" width="32" height="3" rx="1" fill="#fff" opacity="0.8" />
      <line x1="12" y1="31" x2="12" y2="40" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="36" y1="31" x2="36" y2="40" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Matraz Erlenmeyer */}
      <path d="M14 16 L14 22 L10 28 L18 28 Z" fill="#fff" opacity="0.3" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="13" y="14" width="2" height="3" rx="0.5" fill="#fff" opacity="0.7" />
      <rect x="10" y="24" width="8" height="4" rx="0" fill="#06b6d4" opacity="0.4" style={{ animation: 'ai-glow 3s ease-in-out infinite' }} />
      {/* Tubo de ensayo 1 */}
      <rect x="23" y="12" width="3" height="14" rx="1.5" fill="#fff" opacity="0.3" stroke="#fff" strokeWidth="1" />
      <rect x="23" y="19" width="3" height="7" rx="1.5" fill="#a855f7" opacity="0.4" />
      <rect x="22" y="11" width="5" height="2" rx="1" fill="#fff" opacity="0.6" />
      {/* Tubo de ensayo 2 */}
      <rect x="30" y="14" width="3" height="12" rx="1.5" fill="#fff" opacity="0.3" stroke="#fff" strokeWidth="1" />
      <rect x="30" y="20" width="3" height="6" rx="1.5" fill="#f59e0b" opacity="0.4" />
      <rect x="29" y="13" width="5" height="2" rx="1" fill="#fff" opacity="0.6" />
      {/* Burbujas */}
      <circle cx="14" cy="20" r="1" fill="#fff" opacity="0.5" style={{ animation: 'ai-float 2.5s ease-in-out infinite' }} />
      <circle cx="15" cy="22" r="0.7" fill="#fff" opacity="0.4" style={{ animation: 'ai-float 2.5s ease-in-out 0.5s infinite' }} />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'entrenador-tabla': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-tab" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-tab)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Grid de tabla periódica */}
      <rect x="8" y="10" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="15" y="10" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="22" y="10" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="29" y="10" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="36" y="10" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="8" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="15" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      {/* Elemento resaltado */}
      <rect x="22" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.85" style={{ animation: 'ai-pulse 2.5s ease-in-out infinite', transformOrigin: '25px 21px' }} />
      <text x="23" y="22.5" fill="#06b6d4" fontSize="4" fontWeight="bold" fontFamily="system-ui">Fe</text>
      <rect x="29" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="36" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.2" />
      <rect x="8" y="26" width="6" height="6" rx="1" fill="#fff" opacity="0.15" />
      <rect x="15" y="26" width="6" height="6" rx="1" fill="#fff" opacity="0.15" />
      <rect x="22" y="26" width="6" height="6" rx="1" fill="#fff" opacity="0.15" />
      <rect x="29" y="26" width="6" height="6" rx="1" fill="#fff" opacity="0.15" />
      <rect x="36" y="26" width="6" height="6" rx="1" fill="#fff" opacity="0.15" />
      {/* Fila inferior parcial */}
      <rect x="8" y="34" width="6" height="6" rx="1" fill="#fff" opacity="0.1" />
      <rect x="15" y="34" width="6" height="6" rx="1" fill="#fff" opacity="0.1" />
      <rect x="22" y="34" width="6" height="6" rx="1" fill="#fff" opacity="0.1" />
      {/* Glow en elemento resaltado */}
      <rect x="21" y="17" width="8" height="8" rx="2" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" style={{ animation: 'ai-shimmer 2.5s ease-in-out infinite', transformOrigin: '25px 21px' }} />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'sistema-solar': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-sol" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
        <radialGradient id="ai2-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-sol)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.08)" />
      {/* Sol */}
      <circle cx="16" cy="24" r="7" fill="url(#ai2-sun)" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '16px 24px' }} />
      <circle cx="14.5" cy="22.5" r="2" fill="#fff" opacity="0.2" />
      {/* Órbitas */}
      <ellipse cx="16" cy="24" rx="12" ry="8" stroke="#fff" strokeWidth="0.5" opacity="0.25" />
      <ellipse cx="16" cy="24" rx="18" ry="12" stroke="#fff" strokeWidth="0.5" opacity="0.2" />
      <ellipse cx="16" cy="24" rx="24" ry="16" stroke="#fff" strokeWidth="0.5" opacity="0.15" />
      {/* Planeta 1 - Tierra */}
      <circle cx="27" cy="20" r="2.5" fill="#3b82f6" style={{ animation: 'ai-orbit 10s linear infinite', transformOrigin: '16px 24px' }} />
      <circle cx="26.5" cy="19.5" r="0.8" fill="#22c55e" opacity="0.6" style={{ animation: 'ai-orbit 10s linear infinite', transformOrigin: '16px 24px' }} />
      <ellipse cx="26" cy="19" rx="0.6" ry="0.4" fill="#fff" opacity="0.25" style={{ animation: 'ai-orbit 10s linear infinite', transformOrigin: '16px 24px' }} />
      {/* Planeta 2 */}
      <circle cx="34" cy="15" r="1.8" fill="#ef4444" opacity="0.8" style={{ animation: 'ai-orbit 16s linear infinite', transformOrigin: '16px 24px' }} />
      <ellipse cx="33.5" cy="14.5" rx="0.5" ry="0.3" fill="#fff" opacity="0.2" style={{ animation: 'ai-orbit 16s linear infinite', transformOrigin: '16px 24px' }} />
      {/* Planeta 3 - con anillo */}
      <circle cx="38" cy="28" r="3" fill="#d97706" opacity="0.8" style={{ animation: 'ai-orbit 22s linear infinite', transformOrigin: '16px 24px' }} />
      <ellipse cx="38" cy="28" rx="5" ry="1.2" stroke="#fff" strokeWidth="0.7" opacity="0.5" fill="none" />
      {/* Estrellas */}
      <circle cx="40" cy="10" r="0.6" fill="#fff" opacity="0.6" style={{ animation: 'ai-glow 3s ease-in-out infinite' }} />
      <circle cx="8" cy="12" r="0.5" fill="#fff" opacity="0.4" style={{ animation: 'ai-glow 3s ease-in-out 0.8s infinite' }} />
      <circle cx="42" cy="38" r="0.5" fill="#fff" opacity="0.5" style={{ animation: 'ai-glow 3s ease-in-out 1.6s infinite' }} />
      <circle cx="6" cy="36" r="0.4" fill="#fff" opacity="0.3" style={{ animation: 'ai-glow 3s ease-in-out 2.4s infinite' }} />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'celula': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai2-cel" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
        <radialGradient id="ai2-nuc" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ai2-cel)" />
      <rect x="4" y="4" width="40" height="20" rx="12" fill="rgba(255,255,255,0.15)" />
      {/* Membrana celular */}
      <ellipse cx="24" cy="24" rx="16" ry="14" fill="#fff" opacity="0.15" stroke="#fff" strokeWidth="2" opacity="0.7" />
      {/* Citoplasma - textura sutil */}
      <ellipse cx="24" cy="24" rx="14" ry="12" fill="#fff" opacity="0.05" />
      {/* Núcleo */}
      <ellipse cx="22" cy="23" rx="6" ry="5.5" fill="url(#ai2-nuc)" opacity="0.8" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '22px 23px' }} />
      <ellipse cx="22" cy="23" rx="6" ry="5.5" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '22px 23px' }} />
      {/* Nucleolo */}
      <circle cx="21" cy="22" r="2" fill="#fff" opacity="0.3" style={{ animation: 'ai-breathe 4s ease-in-out 0.5s infinite', transformOrigin: '21px 22px' }} />
      {/* Mitocondrias */}
      <ellipse cx="33" cy="20" rx="3" ry="1.5" fill="#f97316" opacity="0.5" transform="rotate(-30 33 20)" style={{ animation: 'ai-bob 3.5s ease-in-out infinite' }} />
      <path d="M31 20 Q33 19 35 20" stroke="#fff" strokeWidth="0.5" opacity="0.4" style={{ animation: 'ai-bob 3.5s ease-in-out infinite' }} />
      <ellipse cx="14" cy="30" rx="2.5" ry="1.3" fill="#f97316" opacity="0.4" transform="rotate(20 14 30)" style={{ animation: 'ai-bob 3.5s ease-in-out 0.8s infinite' }} />
      {/* Retículo endoplasmático */}
      <path d="M28 28 Q31 30 30 33 Q29 35 32 34" stroke="#fff" strokeWidth="0.8" opacity="0.3" fill="none" strokeLinecap="round" />
      <path d="M16 16 Q18 14 20 16" stroke="#fff" strokeWidth="0.8" opacity="0.3" fill="none" strokeLinecap="round" />
      {/* Ribosomas */}
      <circle cx="30" cy="16" r="0.8" fill="#fff" opacity="0.4" style={{ animation: 'ai-bob 3s ease-in-out infinite' }} />
      <circle cx="32" cy="27" r="0.8" fill="#fff" opacity="0.4" style={{ animation: 'ai-bob 3s ease-in-out 0.5s infinite' }} />
      <circle cx="15" cy="22" r="0.8" fill="#fff" opacity="0.4" style={{ animation: 'ai-bob 3s ease-in-out 1s infinite' }} />
      <circle cx="28" cy="32" r="0.8" fill="#fff" opacity="0.35" style={{ animation: 'ai-bob 3s ease-in-out 1.5s infinite' }} />
      {/* Vesículas */}
      <circle cx="35" cy="30" r="1.5" fill="#fff" opacity="0.2" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <circle cx="13" cy="26" r="1.2" fill="#fff" opacity="0.2" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),
};

export default icons2;
