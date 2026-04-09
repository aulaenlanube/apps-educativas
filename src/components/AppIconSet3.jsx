// Set 3: Apps de herramientas, tutoría y extras
let ai3Injected = false;
const injectAi3Styles = () => {
  if (ai3Injected) return;
  ai3Injected = true;
  const css = `
    @keyframes ai-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes ai-pulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.1);opacity:1}}
    @keyframes ai-glow{0%,100%{opacity:0.3}50%{opacity:1}}
    @keyframes ai-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes ai-swing{0%,100%{transform:rotate(0deg)}25%{transform:rotate(8deg)}75%{transform:rotate(-8deg)}}
    @keyframes ai-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes ai-shimmer{0%,100%{opacity:0.1}50%{opacity:0.6}}
    @keyframes ai-bounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}60%{transform:translateY(-1px)}}
    @keyframes ai-wiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
    @keyframes ai-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes ai-blink{0%,45%{opacity:1}50%,90%{opacity:0}95%,100%{opacity:1}}
    @keyframes ai-flicker{0%,100%{opacity:1}10%{opacity:0.4}20%{opacity:1}40%{opacity:0.6}50%{opacity:1}}
    @keyframes ai-scan{0%{transform:translateY(-100%);opacity:0}20%{opacity:0.5}80%{opacity:0.5}100%{transform:translateY(100%);opacity:0}}
    @keyframes ai-wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.15)}}
  `;
  const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el);
};
if (typeof document !== 'undefined') injectAi3Styles();

const icons3 = {
  'terminal-retro': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-ter-bg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f0f1a" />
        </linearGradient>
        <linearGradient id="ai3-ter-grn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#39ff14" />
          <stop offset="100%" stopColor="#00e676" />
        </linearGradient>
      </defs>
      {/* Monitor body */}
      <rect x="6" y="5" width="36" height="28" rx="4" fill="url(#ai3-ter-bg)" stroke="#555" strokeWidth="1.5" />
      {/* Screen bezel highlight */}
      <rect x="9" y="8" width="30" height="22" rx="2" fill="#0a0a12" />
      <rect x="9" y="8" width="30" height="22" rx="2" fill="rgba(255,255,255,0.05)" />
      {/* Green text lines */}
      <rect x="12" y="12" width="16" height="2" rx="1" fill="url(#ai3-ter-grn)" opacity="0.9" style={{ animation: 'ai-flicker 4s ease-in-out infinite' }} />
      <rect x="12" y="17" width="22" height="2" rx="1" fill="url(#ai3-ter-grn)" opacity="0.7" style={{ animation: 'ai-flicker 4s ease-in-out 0.5s infinite' }} />
      <rect x="12" y="22" width="10" height="2" rx="1" fill="url(#ai3-ter-grn)" opacity="0.9" />
      {/* Cursor block */}
      <rect x="23" y="22" width="3" height="2" rx="0.5" fill="#39ff14" style={{ animation: 'ai-blink 1.2s step-end infinite' }} />
      {/* Scanline effect */}
      <rect x="9" y="14" width="30" height="1" fill="rgba(57,255,20,0.06)" style={{ animation: 'ai-scan 6s linear infinite' }} />
      <rect x="9" y="20" width="30" height="1" fill="rgba(57,255,20,0.06)" style={{ animation: 'ai-scan 6s linear 2s infinite' }} />
      <rect x="9" y="26" width="30" height="1" fill="rgba(57,255,20,0.06)" style={{ animation: 'ai-scan 6s linear 4s infinite' }} />
      {/* Monitor stand */}
      <rect x="19" y="33" width="10" height="4" rx="1" fill="#333" />
      <rect x="15" y="37" width="18" height="3" rx="1.5" fill="#444" />
      {/* Screen glare */}
      <path d="M10 9 L16 9 L10 16 Z" fill="rgba(255,255,255,0.08)" />
      {/* Power LED */}
      <circle cx="24" cy="35" r="1" fill="#39ff14" opacity="0.8" />
    </svg>
  ),

  'programacion-bloques-windows': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-win-title" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000080" />
          <stop offset="100%" stopColor="#1084d0" />
        </linearGradient>
        <linearGradient id="ai3-win-blk1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a90d9" />
          <stop offset="100%" stopColor="#2e6ab0" />
        </linearGradient>
        <linearGradient id="ai3-win-blk2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8a838" />
          <stop offset="100%" stopColor="#d4891a" />
        </linearGradient>
        <linearGradient id="ai3-win-blk3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5cb85c" />
          <stop offset="100%" stopColor="#449d44" />
        </linearGradient>
      </defs>
      {/* Window shadow */}
      <rect x="7" y="7" width="36" height="36" rx="2" fill="rgba(0,0,0,0.05)" />
      {/* Window body */}
      <rect x="5" y="5" width="36" height="36" rx="1" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />
      {/* Title bar */}
      <rect x="6" y="6" width="34" height="6" rx="0.5" fill="url(#ai3-win-title)" />
      <text x="9" y="11" fontSize="4" fill="white" fontFamily="system-ui" fontWeight="bold">Bloques.exe</text>
      {/* Window buttons */}
      <rect x="33" y="7.5" width="3" height="3" rx="0.3" fill="#c0c0c0" stroke="#808080" strokeWidth="0.5" />
      <rect x="29" y="7.5" width="3" height="3" rx="0.3" fill="#c0c0c0" stroke="#808080" strokeWidth="0.5" />
      {/* Block 1 - blue */}
      <rect x="9" y="15" width="20" height="6" rx="2" fill="url(#ai3-win-blk1)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" style={{ animation: 'ai-swing 4s ease-in-out infinite', transformOrigin: '9px 18px' }} />
      <rect x="11" y="16.5" width="8" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
      {/* Block 2 - amber, indented */}
      <rect x="13" y="22.5" width="18" height="6" rx="2" fill="url(#ai3-win-blk2)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" style={{ animation: 'ai-swing 4s ease-in-out 0.6s infinite', transformOrigin: '13px 25.5px' }} />
      <rect x="15" y="24" width="6" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
      {/* Block 3 - green, indented more */}
      <rect x="13" y="30" width="16" height="6" rx="2" fill="url(#ai3-win-blk3)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" style={{ animation: 'ai-swing 4s ease-in-out 1.2s infinite', transformOrigin: '13px 33px' }} />
      <rect x="15" y="31.5" width="7" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
      {/* Notch connectors */}
      <rect x="16" y="20.5" width="4" height="2.5" rx="1" fill="url(#ai3-win-blk1)" opacity="0.7" />
      <rect x="20" y="28" width="4" height="2.5" rx="1" fill="url(#ai3-win-blk2)" opacity="0.7" />
      {/* Drag arrow hint */}
      <path d="M35 20 L35 28" stroke="#808080" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" style={{ animation: 'ai-blink 2s step-end infinite' }} />
      <path d="M33.5 26 L35 28.5 L36.5 26" stroke="#808080" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  'banco-recursos-tutoria': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-brt-fold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="ai3-brt-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Folder back */}
      <path d="M6 14 L6 40 Q6 42 8 42 L40 42 Q42 42 42 40 L42 18 Q42 16 40 16 L24 16 L20 12 L8 12 Q6 12 6 14Z" fill="url(#ai3-brt-back)" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      {/* Folder tab */}
      <path d="M8 12 Q6 12 6 14 L6 16 L22 16 L19 12 Z" fill="url(#ai3-brt-fold)" />
      {/* Highlight on folder */}
      <path d="M6 16 L42 16 L42 18 Q42 17 40 17 L6 17 Z" fill="rgba(255,255,255,0.3)" />
      {/* Document 1 - white */}
      <rect x="13" y="8" width="14" height="18" rx="2" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" style={{ animation: 'ai-bob 3s ease-in-out infinite' }} />
      <rect x="16" y="12" width="8" height="1.5" rx="0.75" fill="#e5e7eb" />
      <rect x="16" y="15" width="6" height="1.5" rx="0.75" fill="#e5e7eb" />
      <rect x="16" y="18" width="7" height="1.5" rx="0.75" fill="#e5e7eb" />
      {/* Document 2 - slightly behind */}
      <rect x="27" y="10" width="12" height="16" rx="2" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" transform="rotate(8 33 18)" style={{ animation: 'ai-bob 3s ease-in-out 0.8s infinite' }} />
      <rect x="29.5" y="14" width="7" height="1.2" rx="0.6" fill="#e5e7eb" transform="rotate(8 33 14.6)" />
      <rect x="29.5" y="17" width="5" height="1.2" rx="0.6" fill="#e5e7eb" transform="rotate(8 32 17.6)" />
      {/* Heart */}
      <path d="M34 34 C34 31 30 29 28 32 C26 29 22 31 22 34 C22 38 28 42 28 42 C28 42 34 38 34 34Z" fill="#ef4444" opacity="0.85" style={{ animation: 'ai-pulse 2.5s ease-in-out infinite', transformOrigin: '28px 36px' }} />
      <path d="M34 34 C34 31 30 29 28 32" fill="rgba(255,255,255,0.2)" />
      {/* Folder front shadow */}
      <rect x="6" y="38" width="36" height="4" rx="2" fill="rgba(0,0,0,0.05)" />
    </svg>
  ),

  'isla-de-la-calma': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-isla-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="ai3-isla-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="ai3-isla-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <linearGradient id="ai3-isla-palm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect x="0" y="0" width="48" height="30" fill="url(#ai3-isla-sky)" />
      {/* Sun */}
      <circle cx="38" cy="10" r="5" fill="#fbbf24" opacity="0.9" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '38px 10px' }} />
      <circle cx="38" cy="10" r="5" fill="rgba(255,255,255,0.3)" />
      {/* Ocean */}
      <rect x="0" y="28" width="48" height="20" fill="url(#ai3-isla-sea)" />
      {/* Waves */}
      <path d="M0 30 Q6 28 12 30 Q18 32 24 30 Q30 28 36 30 Q42 32 48 30 L48 34 Q42 32 36 34 Q30 36 24 34 Q18 32 12 34 Q6 36 0 34 Z" fill="rgba(255,255,255,0.15)" style={{ animation: 'ai-wave 3s ease-in-out infinite', transformOrigin: '24px 32px' }} />
      <path d="M0 36 Q8 34 16 36 Q24 38 32 36 Q40 34 48 36 L48 38 Q40 36 32 38 Q24 40 16 38 Q8 36 0 38 Z" fill="rgba(255,255,255,0.1)" style={{ animation: 'ai-wave 3s ease-in-out 0.8s infinite', transformOrigin: '24px 37px' }} />
      {/* Island sand mound */}
      <ellipse cx="22" cy="30" rx="14" ry="5" fill="url(#ai3-isla-sand)" />
      <ellipse cx="22" cy="29" rx="13" ry="3" fill="rgba(255,255,255,0.15)" />
      {/* Palm trunk */}
      <path d="M20 30 Q18 22 22 12" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ animation: 'ai-swing 5s ease-in-out infinite', transformOrigin: '20px 30px' }} />
      <path d="M20 30 Q18 22 22 12" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Palm leaves */}
      <path d="M22 12 Q16 8 10 10" stroke="url(#ai3-isla-palm)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 12 Q18 6 12 6" stroke="url(#ai3-isla-palm)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 12 Q26 7 32 8" stroke="url(#ai3-isla-palm)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 12 Q28 10 34 13" stroke="url(#ai3-isla-palm)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 12 Q24 6 26 4" stroke="url(#ai3-isla-palm)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Small cloud */}
      <ellipse cx="10" cy="8" rx="5" ry="2.5" fill="white" opacity="0.6" />
      <ellipse cx="8" cy="7.5" rx="3" ry="2" fill="white" opacity="0.4" />
    </svg>
  ),

  'generador-personajes-historicos': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-gph-bg" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="ai3-gph-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="24" cy="24" r="20" fill="url(#ai3-gph-bg)" opacity="0.15" />
      {/* Person silhouette - head */}
      <circle cx="24" cy="17" r="6" fill="#6b21a8" opacity="0.8" />
      {/* Person silhouette - body */}
      <path d="M14 38 Q14 28 24 26 Q34 28 34 38 Z" fill="#6b21a8" opacity="0.8" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '24px 32px' }} />
      {/* Crown */}
      <path d="M17 12 L18 8 L21 11 L24 6 L27 11 L30 8 L31 12 Z" fill="url(#ai3-gph-gold)" stroke="#d97706" strokeWidth="0.5" style={{ animation: 'ai-bob 3.5s ease-in-out infinite', transformOrigin: '24px 9px' }} />
      {/* Crown jewels */}
      <circle cx="21" cy="10.5" r="0.8" fill="#ef4444" />
      <circle cx="24" cy="8.5" r="0.8" fill="#3b82f6" />
      <circle cx="27" cy="10.5" r="0.8" fill="#10b981" />
      {/* Sparkles */}
      <path d="M8 10 L9 8 L10 10 L9 12 Z" fill="#fbbf24" opacity="0.8" style={{ animation: 'ai-shimmer 2.5s ease-in-out infinite' }} />
      <path d="M38 14 L39 12 L40 14 L39 16 Z" fill="#fbbf24" opacity="0.7" style={{ animation: 'ai-shimmer 2.5s ease-in-out 0.5s infinite' }} />
      <path d="M40 8 L40.5 6.5 L41 8 L40.5 9.5 Z" fill="#fbbf24" opacity="0.6" style={{ animation: 'ai-shimmer 2.5s ease-in-out 1s infinite' }} />
      <path d="M6 18 L6.5 16.5 L7 18 L6.5 19.5 Z" fill="#fbbf24" opacity="0.5" style={{ animation: 'ai-shimmer 2.5s ease-in-out 1.5s infinite' }} />
      <path d="M36 24 L37 22.5 L38 24 L37 25.5 Z" fill="#fbbf24" opacity="0.6" style={{ animation: 'ai-shimmer 2.5s ease-in-out 2s infinite' }} />
      {/* Magic swirl */}
      <path d="M10 30 Q8 26 12 24" stroke="#c084fc" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M36 32 Q40 28 38 24" stroke="#c084fc" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Small star dots */}
      <circle cx="12" cy="36" r="1" fill="#e9d5ff" opacity="0.6" />
      <circle cx="36" cy="36" r="1" fill="#e9d5ff" opacity="0.6" />
      <circle cx="8" cy="24" r="0.8" fill="#fde68a" opacity="0.5" />
      <circle cx="40" cy="20" r="0.8" fill="#fde68a" opacity="0.5" />
    </svg>
  ),

  'celula-vegetal': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-cv-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="ai3-cv-cyto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
        <linearGradient id="ai3-cv-nuc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Cell wall - outer rectangle */}
      <rect x="4" y="8" width="40" height="32" rx="4" fill="url(#ai3-cv-wall)" stroke="#16a34a" strokeWidth="2" />
      {/* Cell membrane */}
      <rect x="7" y="11" width="34" height="26" rx="3" fill="url(#ai3-cv-cyto)" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 1" />
      {/* Vacuole - large central */}
      <ellipse cx="24" cy="24" rx="10" ry="8" fill="#a7f3d0" stroke="#6ee7b7" strokeWidth="1" opacity="0.7" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      {/* Nucleus */}
      <circle cx="24" cy="24" r="5" fill="url(#ai3-cv-nuc)" stroke="#d97706" strokeWidth="1" opacity="0.8" />
      {/* Nucleolus */}
      <circle cx="24" cy="23.5" r="2" fill="#92400e" opacity="0.5" />
      {/* Chloroplasts - small green ovals */}
      <ellipse cx="13" cy="16" rx="3" ry="1.8" fill="#22c55e" stroke="#15803d" strokeWidth="0.6" transform="rotate(-20 13 16)" style={{ animation: 'ai-shimmer 3s ease-in-out infinite' }} />
      <line x1="11" y1="16" x2="15" y2="16" stroke="#15803d" strokeWidth="0.4" transform="rotate(-20 13 16)" />
      <ellipse cx="35" cy="18" rx="3" ry="1.8" fill="#22c55e" stroke="#15803d" strokeWidth="0.6" transform="rotate(15 35 18)" style={{ animation: 'ai-shimmer 3s ease-in-out 0.7s infinite' }} />
      <line x1="33" y1="18" x2="37" y2="18" stroke="#15803d" strokeWidth="0.4" transform="rotate(15 35 18)" />
      <ellipse cx="14" cy="30" rx="3" ry="1.8" fill="#22c55e" stroke="#15803d" strokeWidth="0.6" transform="rotate(25 14 30)" style={{ animation: 'ai-shimmer 3s ease-in-out 1.4s infinite' }} />
      <line x1="12" y1="30" x2="16" y2="30" stroke="#15803d" strokeWidth="0.4" transform="rotate(25 14 30)" />
      <ellipse cx="34" cy="31" rx="3" ry="1.8" fill="#22c55e" stroke="#15803d" strokeWidth="0.6" transform="rotate(-10 34 31)" style={{ animation: 'ai-shimmer 3s ease-in-out 2.1s infinite' }} />
      <line x1="32" y1="31" x2="36" y2="31" stroke="#15803d" strokeWidth="0.4" transform="rotate(-10 34 31)" />
      {/* ER lines */}
      <path d="M17 20 Q19 22 17 24" stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M31 20 Q33 22 31 24" stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Highlight */}
      <rect x="8" y="12" width="12" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
    </svg>
  ),

  'celula-animal': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-ca-mem" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="ai3-ca-cyto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff1f2" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>
        <linearGradient id="ai3-ca-nuc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Cell membrane - irregular rounded shape */}
      <path d="M24 5 Q38 6 42 18 Q45 30 36 40 Q28 46 18 42 Q6 38 4 26 Q3 14 14 8 Q20 4 24 5Z" fill="url(#ai3-ca-cyto)" stroke="url(#ai3-ca-mem)" strokeWidth="2" />
      {/* Nucleus */}
      <circle cx="24" cy="22" r="7" fill="url(#ai3-ca-nuc)" stroke="#2563eb" strokeWidth="1.2" style={{ animation: 'ai-breathe 4s ease-in-out infinite', transformOrigin: '24px 22px' }} />
      {/* Nucleolus */}
      <circle cx="25" cy="21" r="2.5" fill="#1d4ed8" opacity="0.6" />
      {/* Nuclear pores */}
      <circle cx="19" cy="19" r="0.6" fill="#93c5fd" />
      <circle cx="29" cy="25" r="0.6" fill="#93c5fd" />
      {/* Mitochondria */}
      <ellipse cx="13" cy="16" rx="4" ry="2.2" fill="#f87171" stroke="#dc2626" strokeWidth="0.7" transform="rotate(-30 13 16)" style={{ animation: 'ai-glow 3s ease-in-out infinite' }} />
      <path d="M11 15.5 Q13 17 11.5 16.5" stroke="#dc2626" strokeWidth="0.5" fill="none" transform="rotate(-30 13 16)" />
      <ellipse cx="34" cy="30" rx="3.5" ry="2" fill="#f87171" stroke="#dc2626" strokeWidth="0.7" transform="rotate(20 34 30)" style={{ animation: 'ai-glow 3s ease-in-out 1s infinite' }} />
      <path d="M32.5 29.5 Q34.5 31 33 30.5" stroke="#dc2626" strokeWidth="0.5" fill="none" transform="rotate(20 34 30)" />
      {/* Endoplasmic reticulum */}
      <path d="M16 26 Q18 28 16 30 Q14 32 16 34" stroke="#fda4af" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M18 27 Q20 29 18 31 Q16 33 18 35" stroke="#fda4af" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Golgi apparatus */}
      <path d="M32 12 Q36 13 35 15" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M31 14 Q35 15 34 17" stroke="#c084fc" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M30 16 Q34 17 33 19" stroke="#c084fc" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Vesicles */}
      <circle cx="36" cy="20" r="1.2" fill="#e9d5ff" stroke="#c084fc" strokeWidth="0.5" style={{ animation: 'ai-bob 3s ease-in-out infinite' }} />
      <circle cx="38" cy="17" r="0.8" fill="#e9d5ff" stroke="#c084fc" strokeWidth="0.4" style={{ animation: 'ai-bob 3s ease-in-out 0.6s infinite' }} />
      {/* Highlight */}
      <path d="M18 8 Q24 7 28 9" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  'batalla': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ai3-bat-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="ai3-bat-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="ai3-bat-sword" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
      </defs>
      {/* Crossed swords behind shields */}
      {/* Sword 1 - left to right */}
      <line x1="8" y1="8" x2="40" y2="40" stroke="url(#ai3-bat-sword)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ai-swing 3.5s ease-in-out infinite', transformOrigin: '24px 24px' }} />
      <line x1="8" y1="8" x2="40" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />
      {/* Sword 1 handle */}
      <line x1="6" y1="10" x2="12" y2="4" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="6" x2="12" y2="12" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sword 2 - right to left */}
      <line x1="40" y1="8" x2="8" y2="40" stroke="url(#ai3-bat-sword)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ai-swing 3.5s ease-in-out 0.5s infinite', transformOrigin: '24px 24px' }} />
      <line x1="40" y1="8" x2="8" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />
      {/* Sword 2 handle */}
      <line x1="36" y1="4" x2="42" y2="10" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="12" x2="42" y2="6" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
      {/* Shield left - red */}
      <path d="M10 18 L10 30 Q10 38 20 42 Q20 38 20 30 L20 18 Q15 15 10 18Z" fill="url(#ai3-bat-red)" stroke="#b91c1c" strokeWidth="1.2" strokeLinejoin="round" style={{ animation: 'ai-bounce 3s ease-in-out infinite', transformOrigin: '15px 30px' }} />
      <path d="M12 20 L18 20 L18 28 Q18 34 15 37 Q12 34 12 28 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Shield emblem left - star */}
      <path d="M15 24 L16 27 L14 27 Z" fill="#fbbf24" opacity="0.8" />
      {/* Shield right - blue */}
      <path d="M28 18 L28 30 Q28 38 38 42 Q38 38 38 30 L38 18 Q33 15 28 18Z" fill="url(#ai3-bat-blue)" stroke="#1d4ed8" strokeWidth="1.2" strokeLinejoin="round" style={{ animation: 'ai-bounce 3s ease-in-out 0.5s infinite', transformOrigin: '33px 30px' }} />
      <path d="M30 20 L36 20 L36 28 Q36 34 33 37 Q30 34 30 28 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Shield emblem right - star */}
      <path d="M33 24 L34 27 L32 27 Z" fill="#fbbf24" opacity="0.8" />
      {/* VS circle center */}
      <circle cx="24" cy="28" r="5" fill="#1f2937" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="24" y="30" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fbbf24" fontFamily="system-ui">VS</text>
      {/* Impact sparks */}
      <circle cx="24" cy="14" r="1.5" fill="#fbbf24" opacity="0.7" style={{ animation: 'ai-shimmer 2s ease-in-out infinite' }} />
      <circle cx="22" cy="12" r="0.8" fill="#fde68a" opacity="0.5" style={{ animation: 'ai-shimmer 2s ease-in-out 0.4s infinite' }} />
      <circle cx="26" cy="12" r="0.8" fill="#fde68a" opacity="0.5" style={{ animation: 'ai-shimmer 2s ease-in-out 0.8s infinite' }} />
    </svg>
  ),
};

export default icons3;
