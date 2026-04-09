import React, { memo } from 'react';

// Cada icono es un SVG de 48x48, estilo flat con colores vivos, con animaciones sutiles.
// Estilo: lineas limpias, formas geometricas redondeadas, gradientes sutiles, sombras suaves.
// Animaciones CSS definidas en src/styles/icon-animations.css

const icons = {
  'ahorcado': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-aho-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7ED" />
          <stop offset="1" stopColor="#FFEDD5" />
        </linearGradient>
        <linearGradient id="ai-aho-wood" x1="10" y1="8" x2="10" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EA580C" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-aho-bg)" />
      {/* Shadow */}
      <rect x="9" y="39" width="22" height="2" rx="1" fill="rgba(0,0,0,0.05)" />
      {/* Base */}
      <rect x="8" y="38" width="22" height="2.5" rx="1.25" fill="url(#ai-aho-wood)" />
      {/* Vertical post */}
      <rect x="14" y="8" width="2.5" height="30" rx="1" fill="url(#ai-aho-wood)" />
      {/* Top beam */}
      <rect x="14" y="8" width="16" height="2.5" rx="1" fill="url(#ai-aho-wood)" />
      {/* Rope */}
      <line x1="28" y1="10.5" x2="28" y2="16" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" style={{ transformOrigin: '28px 10.5px', animation: 'ai-swing 3.5s ease-in-out infinite' }} />
      {/* Head */}
      <circle cx="28" cy="19" r="3" stroke="#F97316" strokeWidth="1.5" fill="rgba(251,146,60,0.15)" />
      {/* Body */}
      <line x1="28" y1="22" x2="28" y2="30" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
      {/* Left arm */}
      <line x1="28" y1="24" x2="24" y2="27" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="28" y1="24" x2="32" y2="27" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
      {/* Floating letters */}
      <text x="36" y="18" fontSize="6" fontWeight="bold" fill="#EF4444" fontFamily="system-ui" style={{ animation: 'ai-float 3s ease-in-out infinite' }}>A</text>
      <text x="36" y="28" fontSize="5" fontWeight="bold" fill="#FB923C" opacity="0.6" fontFamily="system-ui" style={{ animation: 'ai-float 3s ease-in-out 0.4s infinite' }}>Z</text>
      <text x="38" y="36" fontSize="5" fontWeight="bold" fill="#F97316" opacity="0.4" fontFamily="system-ui" style={{ animation: 'ai-float 3s ease-in-out 0.8s infinite' }}>M</text>
      {/* Highlight */}
      <rect x="14" y="8" width="16" height="1" rx="0.5" fill="white" opacity="0.25" />
    </svg>
  ),

  'anagramas': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-ana-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAF5FF" />
          <stop offset="1" stopColor="#F3E8FF" />
        </linearGradient>
        <linearGradient id="ai-ana-tile" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="ai-ana-tile2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-ana-bg)" />
      {/* Shadow under tiles */}
      <rect x="6" y="21" width="10" height="10" rx="2.5" fill="rgba(0,0,0,0.05)" />
      <rect x="19" y="21" width="10" height="10" rx="2.5" fill="rgba(0,0,0,0.05)" />
      <rect x="32" y="21" width="10" height="10" rx="2.5" fill="rgba(0,0,0,0.05)" />
      {/* Letter tiles */}
      <g style={{ animation: 'ai-wiggle 1.8s ease-in-out infinite' }}>
      <rect x="5" y="19" width="10" height="10" rx="2.5" fill="url(#ai-ana-tile)" />
      <text x="10" y="26.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">R</text>
      <rect x="5" y="19" width="10" height="1.5" rx="1" fill="white" opacity="0.2" />
      </g>

      <g style={{ animation: 'ai-wiggle 1.8s ease-in-out 0.3s infinite' }}>
      <rect x="18" y="19" width="10" height="10" rx="2.5" fill="url(#ai-ana-tile2)" />
      <text x="23" y="26.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">A</text>
      <rect x="18" y="19" width="10" height="1.5" rx="1" fill="white" opacity="0.2" />
      </g>

      <g style={{ animation: 'ai-wiggle 1.8s ease-in-out 0.6s infinite' }}>
      <rect x="31" y="19" width="10" height="10" rx="2.5" fill="url(#ai-ana-tile)" />
      <text x="36" y="26.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">M</text>
      <rect x="31" y="19" width="10" height="1.5" rx="1" fill="white" opacity="0.2" />
      </g>
      {/* Curved arrows showing reorder */}
      <g style={{ transformOrigin: '17px 14px', animation: 'ai-pulse 2.5s ease-in-out infinite' }}>
      <path d="M12 16 C14 12, 20 12, 22 16" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M21 15 L22 16.5 L20.5 16.5" fill="#C084FC" />
      </g>
      <g style={{ transformOrigin: '31px 34px', animation: 'ai-pulse 2.5s ease-in-out 0.5s infinite' }}>
      <path d="M26 33 C28 37, 34 37, 36 33" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M35 34 L36 32.5 L37.5 34" fill="#F472B6" />
      </g>
    </svg>
  ),

  'rosco-del-saber': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-ros-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id="ai-ros-ring" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-ros-bg)" />
      {/* Shadow */}
      <circle cx="24" cy="25" r="15" fill="rgba(0,0,0,0.04)" />
      {/* Outer ring */}
      <circle cx="24" cy="24" r="15" stroke="url(#ai-ros-ring)" strokeWidth="3" fill="rgba(59,130,246,0.06)" />
      {/* Letter circles around the rosco */}
      {['A','B','C','D','E','F','G','H','I','J','K','L'].map((letter, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = 24 + 15 * Math.cos(angle);
        const y = 24 + 15 * Math.sin(angle);
        const isActive = i === 0;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={isActive ? 4.5 : 3.5} fill={isActive ? '#3B82F6' : 'white'} stroke={isActive ? '#1D4ED8' : '#93C5FD'} strokeWidth="1" style={isActive ? { transformOrigin: `${x}px ${y}px`, animation: 'ai-pulse 2.5s ease-in-out infinite' } : undefined} />
            <text x={x} y={y + 1.5} fontSize={isActive ? '5' : '4'} fontWeight="bold" fill={isActive ? 'white' : '#3B82F6'} textAnchor="middle" fontFamily="system-ui" style={isActive ? { transformOrigin: `${x}px ${y}px`, animation: 'ai-pulse 2.5s ease-in-out infinite' } : undefined}>{letter}</text>
          </g>
        );
      })}
      {/* Center highlight */}
      <circle cx="24" cy="24" r="5" fill="white" opacity="0.5" />
      <text x="24" y="26" fontSize="6" fontWeight="bold" fill="#1D4ED8" textAnchor="middle" fontFamily="system-ui" style={{ transformOrigin: '24px 24px', animation: 'ai-breathe 4s ease-in-out infinite' }}>?</text>
    </svg>
  ),

  'crucigrama': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-cru-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="ai-cru-fill" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-cru-bg)" />
      {/* Shadow */}
      <rect x="8" y="10" width="32" height="32" rx="3" fill="rgba(0,0,0,0.04)" />
      {/* Grid background */}
      <rect x="7" y="8" width="32" height="32" rx="3" fill="white" stroke="#C7D2FE" strokeWidth="1" />
      {/* Grid lines - horizontal */}
      {[0,1,2,3].map(i => (
        <line key={`h${i}`} x1="7" y1={8 + (i+1)*8} x2="39" y2={8 + (i+1)*8} stroke="#E0E7FF" strokeWidth="0.5" />
      ))}
      {/* Grid lines - vertical */}
      {[0,1,2,3].map(i => (
        <line key={`v${i}`} x1={7 + (i+1)*8} y1="8" x2={7 + (i+1)*8} y2="40" stroke="#E0E7FF" strokeWidth="0.5" />
      ))}
      {/* Black cells */}
      <rect x="7" y="8" width="8" height="8" rx="0.5" fill="#1E1B4B" />
      <rect x="31" y="8" width="8" height="8" rx="0.5" fill="#1E1B4B" />
      <rect x="15" y="24" width="8" height="8" rx="0.5" fill="#1E1B4B" />
      <rect x="7" y="32" width="8" height="8" rx="0.5" fill="#1E1B4B" />
      {/* Filled cells with letters */}
      <rect x="15" y="8" width="8" height="8" fill="url(#ai-cru-fill)" opacity="0.15" style={{ animation: 'ai-shimmer 2.5s ease-in-out infinite' }} />
      <text x="19" y="14.5" fontSize="6" fontWeight="bold" fill="#4F46E5" textAnchor="middle" fontFamily="system-ui">H</text>
      <rect x="23" y="8" width="8" height="8" fill="url(#ai-cru-fill)" opacity="0.15" style={{ animation: 'ai-shimmer 2.5s ease-in-out 0.4s infinite' }} />
      <text x="27" y="14.5" fontSize="6" fontWeight="bold" fill="#4F46E5" textAnchor="middle" fontFamily="system-ui">O</text>
      <rect x="15" y="16" width="8" height="8" fill="url(#ai-cru-fill)" opacity="0.15" style={{ animation: 'ai-shimmer 2.5s ease-in-out 0.8s infinite' }} />
      <text x="19" y="22.5" fontSize="6" fontWeight="bold" fill="#4F46E5" textAnchor="middle" fontFamily="system-ui">A</text>
      {/* Highlight top row */}
      <rect x="15" y="8" width="16" height="1" rx="0.5" fill="white" opacity="0.3" />
    </svg>
  ),

  'sopa-de-letras': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-sop-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" />
          <stop offset="1" stopColor="#D1FAE5" />
        </linearGradient>
        <linearGradient id="ai-sop-hl" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-sop-bg)" />
      {/* Shadow */}
      <rect x="7" y="9" width="34" height="34" rx="3" fill="rgba(0,0,0,0.04)" />
      {/* Grid bg */}
      <rect x="6" y="7" width="34" height="34" rx="3" fill="white" stroke="#A7F3D0" strokeWidth="1" />
      {/* Letter grid 5x5 */}
      {[
        ['S','O','L','A','R'],
        ['T','P','E','M','K'],
        ['A','G','U','A','N'],
        ['B','R','I','L','O'],
        ['C','D','F','H','J']
      ].map((row, ri) => row.map((letter, ci) => (
        <text key={`${ri}${ci}`} x={10 + ci * 7} y={14 + ri * 7} fontSize="5" fill="#6B7280" textAnchor="middle" fontFamily="system-ui" fontWeight="500">{letter}</text>
      )))}
      {/* Highlighted word diagonal */}
      <rect x="6.5" y="8.5" width="29" height="6" rx="3" fill="url(#ai-sop-hl)" opacity="0.2" transform="rotate(0)" />
      <line x1="7" y1="11.5" x2="36" y2="11.5" stroke="#14B8A6" strokeWidth="5" strokeLinecap="round" opacity="0.18" style={{ animation: 'ai-glow 3s ease-in-out infinite' }} />
      {/* Re-render highlighted letters on top */}
      {['S','O','L','A','R'].map((l, i) => (
        <text key={`hl${i}`} x={10 + i * 7} y="14" fontSize="5" fill="#059669" textAnchor="middle" fontFamily="system-ui" fontWeight="bold" style={{ animation: `ai-glow 3s ease-in-out ${i * 0.2}s infinite` }}>{l}</text>
      ))}
      {/* Highlight shine */}
      <rect x="6" y="7" width="34" height="2" rx="1" fill="white" opacity="0.2" />
    </svg>
  ),

  'millonario': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-mil-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E1B4B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="ai-mil-gold" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="ai-mil-spot" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-mil-bg)" />
      {/* Spotlight beams */}
      <path d="M24 4 L14 20 L34 20 Z" fill="url(#ai-mil-spot)" opacity="0.08" style={{ animation: 'ai-glow 2.5s ease-in-out infinite' }} />
      <path d="M8 6 L4 22 L16 18 Z" fill="url(#ai-mil-spot)" opacity="0.05" style={{ animation: 'ai-glow 2.5s ease-in-out 0.8s infinite' }} />
      <path d="M40 6 L44 22 L32 18 Z" fill="url(#ai-mil-spot)" opacity="0.05" style={{ animation: 'ai-glow 2.5s ease-in-out 1.6s infinite' }} />
      {/* Central coin/money */}
      <circle cx="24" cy="22" r="10" fill="url(#ai-mil-gold)" style={{ transformOrigin: '24px 22px', animation: 'ai-bounce 2.5s ease-in-out infinite' }} />
      <circle cx="24" cy="22" r="10" fill="white" opacity="0.15" />
      <circle cx="24" cy="22" r="8" stroke="#B45309" strokeWidth="1" fill="none" />
      <text x="24" y="26" fontSize="12" fontWeight="bold" fill="#92400E" textAnchor="middle" fontFamily="system-ui">$</text>
      {/* Highlight on coin */}
      <path d="M17 17 Q24 12 31 17" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round" fill="none" />
      {/* Answer bars at bottom */}
      <rect x="6" y="35" width="16" height="4" rx="2" fill="#312E81" stroke="#6366F1" strokeWidth="0.5" />
      <rect x="26" y="35" width="16" height="4" rx="2" fill="#312E81" stroke="#6366F1" strokeWidth="0.5" />
      <rect x="6" y="41" width="16" height="4" rx="2" fill="#312E81" stroke="#6366F1" strokeWidth="0.5" />
      <rect x="26" y="41" width="16" height="4" rx="2" fill="url(#ai-mil-gold)" opacity="0.3" stroke="#F59E0B" strokeWidth="0.5" />
      {/* Stars */}
      <circle cx="8" cy="8" r="1" fill="#FDE68A" opacity="0.6" />
      <circle cx="40" cy="10" r="0.8" fill="#FDE68A" opacity="0.5" />
      <circle cx="12" cy="30" r="0.6" fill="#FDE68A" opacity="0.4" />
    </svg>
  ),

  'busca-el-intruso': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-int-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7ED" />
          <stop offset="1" stopColor="#FEE2E2" />
        </linearGradient>
        <linearGradient id="ai-int-norm" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="ai-int-diff" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-int-bg)" />
      {/* Normal circles (3) */}
      <circle cx="14" cy="16" r="6" fill="url(#ai-int-norm)" />
      <circle cx="14" cy="16" r="6" fill="white" opacity="0.15" />
      <circle cx="34" cy="16" r="6" fill="url(#ai-int-norm)" />
      <circle cx="34" cy="16" r="6" fill="white" opacity="0.15" />
      <circle cx="14" cy="32" r="6" fill="url(#ai-int-norm)" />
      <circle cx="14" cy="32" r="6" fill="white" opacity="0.15" />
      {/* Different one - star shape */}
      <polygon points="34,26 36,30 40,30.5 37,33.5 37.8,37.5 34,35.5 30.2,37.5 31,33.5 28,30.5 32,30" fill="url(#ai-int-diff)" style={{ transformOrigin: '34px 32px', animation: 'ai-swing 3s ease-in-out infinite' }} />
      {/* Target circle around the intruder */}
      <circle cx="34" cy="32" r="9" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" fill="none" style={{ transformOrigin: '34px 32px', animation: 'ai-pulse 2.5s ease-in-out infinite' }} />
      {/* Question marks on normal ones */}
      <text x="14" y="18.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">●</text>
      <text x="34" y="18.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">●</text>
      <text x="14" y="34.5" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">●</text>
      {/* Highlight */}
      <path d="M14 10.5 Q14 10 17 11.5" stroke="white" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" fill="none" />
    </svg>
  ),

  'runner': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-run-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" />
        </linearGradient>
        <linearGradient id="ai-run-char" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ai-run-ground" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-run-bg)" />
      {/* Ground */}
      <rect x="0" y="38" width="48" height="10" rx="0" fill="url(#ai-run-ground)" opacity="0.3" />
      <line x1="4" y1="38" x2="44" y2="38" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
      {/* Obstacle */}
      <rect x="32" y="30" width="5" height="8" rx="1" fill="#DC2626" opacity="0.7" />
      <rect x="32" y="30" width="5" height="1" rx="0.5" fill="white" opacity="0.2" />
      {/* Running character - head */}
      <g style={{ animation: 'ai-bounce 2s ease-in-out infinite' }}>
      <circle cx="16" cy="16" r="4" fill="url(#ai-run-char)" />
      <circle cx="16" cy="16" r="4" fill="white" opacity="0.15" />
      {/* Body */}
      <line x1="16" y1="20" x2="16" y2="28" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      {/* Arms - running pose */}
      <line x1="16" y1="23" x2="12" y2="20" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="23" x2="20" y2="26" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      {/* Legs - running pose, jumping */}
      <line x1="16" y1="28" x2="12" y2="33" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="28" x2="20" y2="33" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Motion lines */}
      <line x1="6" y1="18" x2="9" y2="18" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" opacity="0.6" style={{ animation: 'ai-float 3s ease-in-out infinite' }} />
      <line x1="5" y1="22" x2="8" y2="22" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" opacity="0.4" style={{ animation: 'ai-float 3s ease-in-out 0.3s infinite' }} />
      <line x1="7" y1="26" x2="9" y2="26" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" opacity="0.3" style={{ animation: 'ai-float 3s ease-in-out 0.6s infinite' }} />
      {/* Jump arc */}
      <path d="M18 34 Q24 24 30 34" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" fill="none" />
    </svg>
  ),

  'snake': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-sna-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0FDF4" />
          <stop offset="1" stopColor="#DCFCE7" />
        </linearGradient>
        <linearGradient id="ai-sna-body" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-sna-bg)" />
      {/* Grid lines (subtle) */}
      {[0,1,2,3,4,5,6].map(i => (
        <g key={i}>
          <line x1={6 + i * 6} y1="6" x2={6 + i * 6} y2="42" stroke="#BBF7D0" strokeWidth="0.5" />
          <line x1="6" y1={6 + i * 6} x2="42" y2={6 + i * 6} stroke="#BBF7D0" strokeWidth="0.5" />
        </g>
      ))}
      {/* Snake body segments - pixelated */}
      <rect x="6" y="24" width="6" height="6" rx="1" fill="url(#ai-sna-body)" opacity="0.5" />
      <rect x="12" y="24" width="6" height="6" rx="1" fill="url(#ai-sna-body)" opacity="0.65" />
      <rect x="12" y="18" width="6" height="6" rx="1" fill="url(#ai-sna-body)" opacity="0.75" />
      <rect x="18" y="18" width="6" height="6" rx="1" fill="url(#ai-sna-body)" opacity="0.85" />
      <rect x="24" y="18" width="6" height="6" rx="1" fill="url(#ai-sna-body)" />
      {/* Snake head */}
      <g style={{ animation: 'ai-wiggle 1.5s ease-in-out infinite' }}>
      <rect x="30" y="18" width="6" height="6" rx="1.5" fill="#15803D" />
      <rect x="30" y="18" width="6" height="1.5" rx="0.5" fill="white" opacity="0.2" />
      {/* Eyes */}
      <circle cx="33" cy="20" r="1" fill="white" />
      <circle cx="33.3" cy="20" r="0.5" fill="#1E3A2F" />
      </g>
      {/* Food item (apple) */}
      <circle cx="39" cy="21" r="2.5" fill="#EF4444" style={{ transformOrigin: '39px 21px', animation: 'ai-pulse 2s ease-in-out infinite' }} />
      <path d="M39 18.5 L40 17" stroke="#16A34A" strokeWidth="0.8" strokeLinecap="round" />
      {/* Highlight on food */}
      <circle cx="38" cy="20" r="0.6" fill="white" opacity="0.3" />
    </svg>
  ),

  'lluvia-de-palabras': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-llu-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0F9FF" />
          <stop offset="1" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="ai-llu-drop" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ai-llu-umb" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#64748B" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-llu-bg)" />
      {/* Falling word blocks */}
      <g style={{ animation: 'ai-float 3s ease-in-out infinite' }}>
      <rect x="5" y="5" width="14" height="5" rx="2" fill="url(#ai-llu-drop)" opacity="0.7" />
      <text x="12" y="9" fontSize="3.5" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">CASA</text>
      </g>
      <g style={{ animation: 'ai-float 3.5s ease-in-out 0.5s infinite' }}>
      <rect x="22" y="10" width="14" height="5" rx="2" fill="url(#ai-llu-drop)" opacity="0.55" />
      <text x="29" y="14" fontSize="3.5" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">SOL</text>
      </g>
      <g style={{ animation: 'ai-float 4s ease-in-out 1s infinite' }}>
      <rect x="10" y="17" width="12" height="5" rx="2" fill="url(#ai-llu-drop)" opacity="0.4" />
      <text x="16" y="21" fontSize="3.5" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">RIO</text>
      </g>
      {/* Rain drops */}
      <circle cx="38" cy="7" r="1" fill="#7DD3FC" opacity="0.5" style={{ animation: 'ai-float 2.5s ease-in-out infinite' }} />
      <circle cx="42" cy="14" r="0.8" fill="#7DD3FC" opacity="0.4" style={{ animation: 'ai-float 2.5s ease-in-out 0.4s infinite' }} />
      <circle cx="36" cy="20" r="1.2" fill="#7DD3FC" opacity="0.3" style={{ animation: 'ai-float 2.5s ease-in-out 0.8s infinite' }} />
      {/* Umbrella */}
      <path d="M14 30 Q14 24 24 24 Q34 24 34 30 Z" fill="url(#ai-llu-umb)" />
      <path d="M14 30 Q14 25 24 25 Q34 25 34 30" fill="white" opacity="0.15" />
      {/* Umbrella handle */}
      <line x1="24" y1="24" x2="24" y2="39" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 39 Q24 42 21 42" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),

  'parejas': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-par-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAF5FF" />
          <stop offset="1" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="ai-par-card" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="ai-par-face" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F5F3FF" />
          <stop offset="1" stopColor="#EDE9FE" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-par-bg)" />
      {/* Card 1 - face up */}
      <rect x="5" y="10" width="16" height="20" rx="3" fill="url(#ai-par-face)" stroke="#C4B5FD" strokeWidth="1" />
      <rect x="5" y="10" width="16" height="3" rx="1.5" fill="white" opacity="0.3" />
      <text x="13" y="24" fontSize="14" textAnchor="middle" fontFamily="system-ui">★</text>
      {/* Card 2 - face up (matching!) */}
      <rect x="27" y="10" width="16" height="20" rx="3" fill="url(#ai-par-face)" stroke="#C4B5FD" strokeWidth="1" />
      <rect x="27" y="10" width="16" height="3" rx="1.5" fill="white" opacity="0.3" />
      <text x="35" y="24" fontSize="14" textAnchor="middle" fontFamily="system-ui">★</text>
      {/* Match indicator - sparkles */}
      <circle cx="24" cy="14" r="1.5" fill="#A78BFA" opacity="0.6" style={{ animation: 'ai-glow 2s ease-in-out infinite' }} />
      <circle cx="22" cy="8" r="1" fill="#C4B5FD" opacity="0.5" style={{ animation: 'ai-glow 2s ease-in-out 0.3s infinite' }} />
      <circle cx="26" cy="10" r="0.8" fill="#DDD6FE" opacity="0.7" style={{ animation: 'ai-glow 2s ease-in-out 0.6s infinite' }} />
      {/* Face-down cards at bottom */}
      <g style={{ animation: 'ai-bob 2.5s ease-in-out infinite' }}>
      <rect x="8" y="34" width="8" height="10" rx="2" fill="url(#ai-par-card)" />
      <rect x="8" y="34" width="8" height="2" rx="1" fill="white" opacity="0.15" />
      <text x="12" y="41.5" fontSize="5" fill="white" textAnchor="middle" fontFamily="system-ui" opacity="0.5">?</text>
      </g>
      <g style={{ animation: 'ai-bob 2.5s ease-in-out 0.3s infinite' }}>
      <rect x="20" y="34" width="8" height="10" rx="2" fill="url(#ai-par-card)" />
      <rect x="20" y="34" width="8" height="2" rx="1" fill="white" opacity="0.15" />
      <text x="24" y="41.5" fontSize="5" fill="white" textAnchor="middle" fontFamily="system-ui" opacity="0.5">?</text>
      </g>
      <g style={{ animation: 'ai-bob 2.5s ease-in-out 0.6s infinite' }}>
      <rect x="32" y="34" width="8" height="10" rx="2" fill="url(#ai-par-card)" />
      <rect x="32" y="34" width="8" height="2" rx="1" fill="white" opacity="0.15" />
      <text x="36" y="41.5" fontSize="5" fill="white" textAnchor="middle" fontFamily="system-ui" opacity="0.5">?</text>
      </g>
    </svg>
  ),

  'clasificador': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-cla-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0FDFA" />
          <stop offset="1" stopColor="#CCFBF1" />
        </linearGradient>
        <linearGradient id="ai-cla-box1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#0891B2" />
          <stop offset="1" stopColor="#0E7490" />
        </linearGradient>
        <linearGradient id="ai-cla-box2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-cla-bg)" />
      {/* Box 1 */}
      <rect x="4" y="28" width="18" height="14" rx="2.5" fill="url(#ai-cla-box1)" />
      <rect x="4" y="28" width="18" height="2.5" rx="1" fill="white" opacity="0.2" />
      <text x="13" y="38" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">A</text>
      {/* Box 2 */}
      <rect x="26" y="28" width="18" height="14" rx="2.5" fill="url(#ai-cla-box2)" />
      <rect x="26" y="28" width="18" height="2.5" rx="1" fill="white" opacity="0.2" />
      <text x="35" y="38" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">B</text>
      {/* Floating items being sorted */}
      <g style={{ animation: 'ai-float 3s ease-in-out infinite' }}>
      <circle cx="12" cy="12" r="4" fill="#06B6D4" opacity="0.8" />
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.15" />
      </g>
      <g style={{ animation: 'ai-float 3s ease-in-out 0.4s infinite' }}>
      <rect x="22" y="8" width="8" height="8" rx="2" fill="#2DD4BF" opacity="0.8" />
      <rect x="22" y="8" width="8" height="1.5" rx="0.5" fill="white" opacity="0.15" />
      </g>
      <polygon points="38,8 41,14 35,14" fill="#14B8A6" opacity="0.8" style={{ animation: 'ai-float 3s ease-in-out 0.8s infinite' }} />
      {/* Arrows going into boxes */}
      <path d="M12 16 L12 26" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1.5" />
      <path d="M11 24 L12 27 L13 24" fill="#0891B2" />
      <path d="M38 14 L36 26" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1.5" />
      <path d="M35 24 L36 27 L37 24" fill="#14B8A6" />
    </svg>
  ),

  'ordena-la-frase': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-ord-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" />
          <stop offset="1" stopColor="#D1FAE5" />
        </linearGradient>
        <linearGradient id="ai-ord-block" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-ord-bg)" />
      {/* Word blocks scattered */}
      <g style={{ transformOrigin: '12px 11.5px', animation: 'ai-swing 3.5s ease-in-out infinite' }}>
      <rect x="4" y="8" width="16" height="7" rx="3" fill="url(#ai-ord-block)" />
      <rect x="4" y="8" width="16" height="2" rx="1" fill="white" opacity="0.2" />
      <text x="12" y="13.5" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">El gato</text>
      </g>

      <g style={{ transformOrigin: '35px 15.5px', animation: 'ai-swing 3.5s ease-in-out 0.3s infinite' }}>
      <rect x="26" y="12" width="18" height="7" rx="3" fill="url(#ai-ord-block)" opacity="0.75" />
      <text x="35" y="17.5" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">duerme</text>
      </g>

      <g style={{ transformOrigin: '15px 25.5px', animation: 'ai-swing 3.5s ease-in-out 0.6s infinite' }}>
      <rect x="8" y="22" width="14" height="7" rx="3" fill="url(#ai-ord-block)" opacity="0.6" />
      <text x="15" y="27.5" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">en la</text>
      </g>

      <g style={{ transformOrigin: '36px 27.5px', animation: 'ai-swing 3.5s ease-in-out 0.9s infinite' }}>
      <rect x="28" y="24" width="16" height="7" rx="3" fill="url(#ai-ord-block)" opacity="0.85" />
      <text x="36" y="29.5" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="system-ui">cama</text>
      </g>

      {/* Drag handle dots */}
      <g opacity="0.5">
        <circle cx="7" cy="11.5" r="0.6" fill="white" />
        <circle cx="9" cy="11.5" r="0.6" fill="white" />
      </g>
      {/* Arrow indicating drag direction */}
      <path d="M22 11 L24 11" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23 10 L25 11 L23 12" fill="#6EE7B7" />
      {/* Numbered slots at bottom */}
      <rect x="4" y="36" width="40" height="7" rx="3" fill="white" stroke="#A7F3D0" strokeWidth="1" strokeDasharray="4 2" />
      <text x="10" y="41" fontSize="4" fill="#10B981" textAnchor="middle" fontFamily="system-ui">1</text>
      <text x="20" y="41" fontSize="4" fill="#10B981" textAnchor="middle" fontFamily="system-ui">2</text>
      <text x="30" y="41" fontSize="4" fill="#10B981" textAnchor="middle" fontFamily="system-ui">3</text>
      <text x="40" y="41" fontSize="4" fill="#10B981" textAnchor="middle" fontFamily="system-ui">4</text>
    </svg>
  ),

  'ordena-la-historia': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-his-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" />
        </linearGradient>
        <linearGradient id="ai-his-node" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-his-bg)" />
      {/* Timeline line */}
      <line x1="10" y1="10" x2="10" y2="40" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
      {/* Event nodes */}
      <g style={{ transformOrigin: '10px 12px', animation: 'ai-pulse 2.5s ease-in-out infinite' }}>
      <circle cx="10" cy="12" r="4" fill="url(#ai-his-node)" />
      <text x="10" y="14" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">1</text>
      </g>
      <g style={{ transformOrigin: '10px 24px', animation: 'ai-pulse 2.5s ease-in-out 0.5s infinite' }}>
      <circle cx="10" cy="24" r="4" fill="url(#ai-his-node)" />
      <text x="10" y="26" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">2</text>
      </g>
      <g style={{ transformOrigin: '10px 36px', animation: 'ai-pulse 2.5s ease-in-out 1s infinite' }}>
      <circle cx="10" cy="36" r="4" fill="url(#ai-his-node)" />
      <text x="10" y="38" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="system-ui">3</text>
      </g>
      {/* Event cards */}
      <rect x="18" y="7" width="24" height="9" rx="3" fill="white" stroke="#FCD34D" strokeWidth="1" />
      <line x1="20" y1="10" x2="38" y2="10" stroke="#D4D4D8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="20" y1="13" x2="32" y2="13" stroke="#E5E7EB" strokeWidth="0.8" strokeLinecap="round" />
      <rect x="18" y="19" width="24" height="9" rx="3" fill="white" stroke="#FCD34D" strokeWidth="1" />
      <line x1="20" y1="22" x2="36" y2="22" stroke="#D4D4D8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="20" y1="25" x2="30" y2="25" stroke="#E5E7EB" strokeWidth="0.8" strokeLinecap="round" />
      <rect x="18" y="31" width="24" height="9" rx="3" fill="white" stroke="#FCD34D" strokeWidth="1" />
      <line x1="20" y1="34" x2="34" y2="34" stroke="#D4D4D8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="20" y1="37" x2="28" y2="37" stroke="#E5E7EB" strokeWidth="0.8" strokeLinecap="round" />
      {/* Connector lines */}
      <line x1="14" y1="12" x2="18" y2="12" stroke="#FBBF24" strokeWidth="1" />
      <line x1="14" y1="24" x2="18" y2="24" stroke="#FBBF24" strokeWidth="1" />
      <line x1="14" y1="36" x2="18" y2="36" stroke="#FBBF24" strokeWidth="1" />
      {/* Highlights on nodes */}
      <path d="M7 10 Q10 8 13 10" stroke="white" strokeWidth="0.6" opacity="0.3" fill="none" />
    </svg>
  ),

  'detective-de-palabras': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-det-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id="ai-det-lens" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="ai-det-glass" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#BFDBFE" />
          <stop offset="1" stopColor="#93C5FD" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-det-bg)" />
      {/* Text lines */}
      <line x1="6" y1="12" x2="28" y2="12" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="18" x2="24" y2="18" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="24" x2="30" y2="24" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="30" x2="20" y2="30" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      {/* Hidden word gaps (blanks) */}
      <rect x="14" y="10.5" width="8" height="3.5" rx="1" fill="#1E40AF" opacity="0.12" strokeDasharray="2 1" stroke="#3B82F6" strokeWidth="0.5" />
      <rect x="10" y="22.5" width="10" height="3.5" rx="1" fill="#1E40AF" opacity="0.12" strokeDasharray="2 1" stroke="#3B82F6" strokeWidth="0.5" />
      {/* Magnifying glass */}
      <g style={{ transformOrigin: '34px 30px', animation: 'ai-swing 4s ease-in-out infinite' }}>
      <circle cx="34" cy="30" r="8" fill="url(#ai-det-glass)" opacity="0.3" />
      <circle cx="34" cy="30" r="8" stroke="url(#ai-det-lens)" strokeWidth="2.5" fill="none" />
      {/* Glass highlight */}
      <path d="M29 26 Q32 24 36 26" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" fill="none" />
      {/* Handle */}
      <line x1="40" y1="36" x2="44" y2="42" stroke="url(#ai-det-lens)" strokeWidth="3" strokeLinecap="round" />
      {/* Revealed word inside glass */}
      <text x="34" y="32" fontSize="5" fontWeight="bold" fill="#1E40AF" textAnchor="middle" fontFamily="system-ui" style={{ animation: 'ai-shimmer 2.5s ease-in-out infinite' }}>PISTA</text>
      </g>
    </svg>
  ),

  'juego-memoria': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-mem-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDF2F8" />
          <stop offset="1" stopColor="#FCE7F3" />
        </linearGradient>
        <linearGradient id="ai-mem-brain" x1="14" y1="10" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient id="ai-mem-gear" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F9A8D4" />
          <stop offset="1" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-mem-bg)" />
      {/* Brain shape */}
      <path d="M24 36 C16 36 10 30 10 24 C10 18 14 14 18 13 C18 9 22 7 26 8 C30 7 34 10 34 14 C37 15 40 19 40 24 C40 30 34 36 24 36Z" fill="url(#ai-mem-brain)" />
      {/* Brain highlight */}
      <path d="M18 13 C18 9 22 7 26 8 C30 7 34 10 34 14" stroke="white" strokeWidth="1" opacity="0.25" fill="none" strokeLinecap="round" />
      {/* Brain fold line */}
      <path d="M24 12 C22 18 26 22 24 28 C23 32 24 36 24 36" stroke="#BE185D" strokeWidth="1.2" opacity="0.4" fill="none" strokeLinecap="round" />
      {/* Gear 1 */}
      <g style={{ transformOrigin: '36px 10px', animation: 'ai-spin 12s linear infinite' }}>
      <circle cx="36" cy="10" r="4" fill="url(#ai-mem-gear)" />
      <circle cx="36" cy="10" r="2" fill="none" stroke="white" strokeWidth="0.8" opacity="0.5" />
      <rect x="35.2" y="5.5" width="1.6" height="2" rx="0.5" fill="url(#ai-mem-gear)" />
      <rect x="35.2" y="12.5" width="1.6" height="2" rx="0.5" fill="url(#ai-mem-gear)" />
      <rect x="31.5" y="9.2" width="2" height="1.6" rx="0.5" fill="url(#ai-mem-gear)" />
      <rect x="38.5" y="9.2" width="2" height="1.6" rx="0.5" fill="url(#ai-mem-gear)" />
      </g>
      {/* Gear 2 (smaller) */}
      <g style={{ transformOrigin: '40px 18px', animation: 'ai-spin 8s linear reverse infinite' }}>
      <circle cx="40" cy="18" r="2.5" fill="#F9A8D4" />
      <circle cx="40" cy="18" r="1.2" fill="none" stroke="white" strokeWidth="0.6" opacity="0.4" />
      </g>
      {/* Sparkles */}
      <g opacity="0.7">
        <path d="M8 10 L9 8 L10 10 L9 12 Z" fill="#F9A8D4" style={{ animation: 'ai-glow 2.5s ease-in-out infinite' }} />
        <path d="M6 20 L7 18.5 L8 20 L7 21.5 Z" fill="#FBCFE8" style={{ animation: 'ai-glow 2.5s ease-in-out 0.5s infinite' }} />
        <path d="M40 34 L41 32.5 L42 34 L41 35.5 Z" fill="#F9A8D4" style={{ animation: 'ai-glow 2.5s ease-in-out 1s infinite' }} />
      </g>
    </svg>
  ),

  'excavacion-selectiva': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-exc-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF3C7" />
          <stop offset="1" stopColor="#FDE68A" />
        </linearGradient>
        <linearGradient id="ai-exc-rock" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#A8A29E" />
          <stop offset="1" stopColor="#78716C" />
        </linearGradient>
        <linearGradient id="ai-exc-pick" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#92400E" />
          <stop offset="1" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="ai-exc-gem1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="ai-exc-gem2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-exc-bg)" />
      {/* Rock/ground */}
      <path d="M4 28 Q8 24 16 26 Q24 22 32 25 Q40 23 44 28 L44 44 Q44 48 40 48 L8 48 Q4 48 4 44 Z" fill="url(#ai-exc-rock)" />
      <path d="M4 28 Q8 24 16 26 Q24 22 32 25 Q40 23 44 28" fill="white" opacity="0.12" />
      {/* Gems embedded in rock */}
      <g style={{ animation: 'ai-glow 2.5s ease-in-out infinite' }}>
      <polygon points="14,32 16,30 18,32 17,35 15,35" fill="url(#ai-exc-gem1)" />
      <path d="M15 30.5 L16 30 L17 30.5" stroke="white" strokeWidth="0.5" opacity="0.4" fill="none" />
      </g>
      <g style={{ animation: 'ai-glow 2.5s ease-in-out 0.5s infinite' }}>
      <polygon points="32,34 34,31 36,34 35,37 33,37" fill="url(#ai-exc-gem2)" />
      <path d="M33 31.5 L34 31 L35 31.5" stroke="white" strokeWidth="0.5" opacity="0.4" fill="none" />
      </g>
      <polygon points="24,36 25.5,33 27,36 26,38 25,38" fill="#FBBF24" style={{ animation: 'ai-glow 2.5s ease-in-out 1s infinite' }} />
      {/* Pickaxe */}
      <g style={{ transformOrigin: '10px 8px', animation: 'ai-swing 3s ease-in-out infinite' }}>
      {/* Handle */}
      <line x1="10" y1="8" x2="28" y2="22" stroke="url(#ai-exc-pick)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="8" x2="28" y2="22" stroke="white" strokeWidth="0.5" opacity="0.2" strokeLinecap="round" />
      {/* Pick head */}
      <path d="M26 18 L34 14 L30 22 Z" fill="#57534E" />
      <path d="M26 18 L34 14" stroke="white" strokeWidth="0.5" opacity="0.2" />
      </g>
      {/* Impact sparkles */}
      <g opacity="0.6">
        <line x1="30" y1="20" x2="33" y2="18" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" />
        <line x1="32" y1="22" x2="35" y2="22" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" />
        <line x1="28" y1="24" x2="30" y2="26" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'comprension-escrita': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-com-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" />
          <stop offset="1" stopColor="#D1FAE5" />
        </linearGradient>
        <linearGradient id="ai-com-book" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="ai-com-check" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ai-com-bg)" />
      {/* Book shadow */}
      <rect x="8" y="10" width="32" height="32" rx="3" fill="rgba(0,0,0,0.04)" />
      {/* Book - left page */}
      <path d="M7 8 L24 10 L24 40 L7 38 Q5 38 5 36 L5 10 Q5 8 7 8Z" fill="white" stroke="#A7F3D0" strokeWidth="0.5" style={{ transformOrigin: '14px 24px', animation: 'ai-breathe 4.5s ease-in-out infinite' }} />
      {/* Book - right page */}
      <path d="M24 10 L41 8 Q43 8 43 10 L43 36 Q43 38 41 38 L24 40 Z" fill="white" stroke="#A7F3D0" strokeWidth="0.5" style={{ transformOrigin: '34px 24px', animation: 'ai-breathe 4.5s ease-in-out 0.3s infinite' }} />
      {/* Book spine */}
      <line x1="24" y1="10" x2="24" y2="40" stroke="#A7F3D0" strokeWidth="1" />
      {/* Text lines - left page */}
      <line x1="9" y1="16" x2="21" y2="17" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="20" x2="20" y2="21" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="24" x2="21" y2="25" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="28" x2="18" y2="29" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="32" x2="20" y2="33" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      {/* Text lines - right page */}
      <line x1="27" y1="17" x2="40" y2="16" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="21" x2="39" y2="20" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="25" x2="40" y2="24" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="29" x2="36" y2="28" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      {/* Check marks over paragraphs */}
      <g style={{ animation: 'ai-shimmer 2.5s ease-in-out infinite' }}>
      <circle cx="16" cy="17" r="3" fill="url(#ai-com-check)" opacity="0.9" />
      <path d="M14.5 17 L15.5 18 L17.5 16" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g style={{ animation: 'ai-shimmer 2.5s ease-in-out 0.4s infinite' }}>
      <circle cx="34" cy="20" r="3" fill="url(#ai-com-check)" opacity="0.9" />
      <path d="M32.5 20 L33.5 21 L35.5 19" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g style={{ animation: 'ai-shimmer 2.5s ease-in-out 0.8s infinite' }}>
      <circle cx="16" cy="25" r="3" fill="url(#ai-com-check)" opacity="0.9" />
      <path d="M14.5 25 L15.5 26 L17.5 24" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Book cover edge */}
      <path d="M5 10 Q5 8 7 8" stroke="url(#ai-com-book)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M43 10 Q43 8 41 8" stroke="url(#ai-com-book)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

import icons2 from './AppIconSet2';
import icons3 from './AppIconSet3';

const allIcons = { ...icons, ...icons2, ...icons3 };

// Aliases para apps que comparten icono (variantes por curso)
const aliases = {
  'sumas-primaria-1': 'sumas-primaria',
  'sumas-primaria-2-drag': 'sumas-primaria',
  'sumas-primaria-3-drag': 'sumas-primaria',
  'sumas-primaria-4-drag': 'sumas-primaria',
  'sumas-primaria-5-drag': 'sumas-primaria',
  'sumas-primaria-6-drag': 'sumas-primaria',
  'restas-primaria-1': 'restas-primaria',
  'restas-primaria-2': 'restas-primaria',
  'restas-primaria-3': 'restas-primaria',
  'restas-primaria-4': 'restas-primaria',
  'restas-primaria-5': 'restas-primaria',
  'restas-primaria-6': 'restas-primaria',
  'multiplicaciones-primaria-3': 'multiplicaciones-primaria',
  'multiplicaciones-primaria-4': 'multiplicaciones-primaria',
  'multiplicaciones-primaria-5': 'multiplicaciones-primaria',
  'multiplicaciones-primaria-6': 'multiplicaciones-primaria',
  'divisiones-primaria-4': 'divisiones-primaria',
  'divisiones-primaria-5': 'divisiones-primaria',
  'divisiones-primaria-6': 'divisiones-primaria',
  'supermercado-matematico-1': 'supermercado-matematico',
  'supermercado-matematico-2': 'supermercado-matematico',
  'supermercado-matematico-3': 'supermercado-matematico',
  'supermercado-matematico-4': 'supermercado-matematico',
  'supermercado-matematico-5': 'supermercado-matematico',
  'supermercado-matematico-6': 'supermercado-matematico',
  'numeros-romanos-3': 'numeros-romanos',
  'numeros-romanos-4': 'numeros-romanos',
  'numeros-romanos-5': 'numeros-romanos',
  'numeros-romanos-6': 'numeros-romanos',
  'numeros-romanos-eso': 'numeros-romanos',
  'mayor-menor-1': 'mayor-menor',
  'mayor-menor-2': 'mayor-menor',
  'mayor-menor-3': 'mayor-menor',
  'mayor-menor-4': 'mayor-menor',
  'mayor-menor-5': 'mayor-menor',
  'mayor-menor-6': 'mayor-menor',
  'medidas-1': 'medidas',
  'medidas-2': 'medidas',
  'medidas-3': 'medidas',
  'medidas-4': 'medidas',
  'medidas-5': 'medidas',
  'medidas-6': 'medidas',
  'celula-animal': 'celula-animal',
  'celula-vegetal': 'celula-vegetal',
  'parejas': 'parejas',
  'snake': 'snake',
  'rosco-del-saber': 'rosco-del-saber',
  'comprension-escrita': 'comprension-escrita',
  'comprension-oral': 'comprension-oral',
};

const AppIcon = memo(({ appId, className = '', size = 48 }) => {
  const resolvedId = aliases[appId] || appId;
  const Icon = allIcons[resolvedId];
  if (!Icon) return null;
  return (
    <div className={`shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Icon />
    </div>
  );
});

AppIcon.displayName = 'AppIcon';

export default AppIcon;
export { allIcons as appIcons };
