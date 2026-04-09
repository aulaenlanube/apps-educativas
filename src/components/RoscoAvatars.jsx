import React from 'react';

let raStylesInjected = false;
const injectRaStyles = () => {
  if (raStylesInjected) return;
  raStylesInjected = true;
  const css = `
    @keyframes ra-blink{0%,42%{transform:scaleY(1)}45%{transform:scaleY(0.1)}48%,100%{transform:scaleY(1)}}
    @keyframes ra-wag{0%,100%{transform:rotate(0deg)}25%{transform:rotate(8deg)}75%{transform:rotate(-8deg)}}
    @keyframes ra-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
    @keyframes ra-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
    @keyframes ra-glow{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes ra-twitch{0%,90%{transform:rotate(0)}93%{transform:rotate(3deg)}96%{transform:rotate(-3deg)}100%{transform:rotate(0)}}
    @keyframes ra-wiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-1px)}75%{transform:translateX(1px)}}
  `;
  const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el);
};
if (typeof document !== 'undefined') injectRaStyles();

const avatars = {
  '🐶': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-dog-fur" cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <radialGradient id="ra-dog-ear" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
        <radialGradient id="ra-dog-muzzle" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>
        <radialGradient id="ra-dog-nose" cx="0.4" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>
        <radialGradient id="ra-dog-eye" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="70%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#1C0A00" />
        </radialGradient>
        <radialGradient id="ra-dog-tongue" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#E11D48" />
        </radialGradient>
      </defs>
      {/* Ears - large droopy */}
      <ellipse cx="8" cy="22" rx="7.5" ry="13" fill="url(#ra-dog-ear)" transform="rotate(-12 8 22)" />
      <ellipse cx="40" cy="22" rx="7.5" ry="13" fill="url(#ra-dog-ear)" transform="rotate(12 40 22)" />
      {/* Ear inner shadow */}
      <ellipse cx="9" cy="24" rx="5" ry="9" fill="#92400E" opacity="0.5" transform="rotate(-12 9 24)" />
      <ellipse cx="39" cy="24" rx="5" ry="9" fill="#92400E" opacity="0.5" transform="rotate(12 39 24)" />
      {/* Ear highlight */}
      <ellipse cx="7.5" cy="19" rx="3" ry="5" fill="#D97706" opacity="0.4" transform="rotate(-12 7.5 19)" />
      <ellipse cx="40.5" cy="19" rx="3" ry="5" fill="#D97706" opacity="0.4" transform="rotate(12 40.5 19)" />
      {/* Head base */}
      <ellipse cx="24" cy="25" rx="16.5" ry="17.5" fill="url(#ra-dog-fur)" />
      {/* Head shadow bottom */}
      <ellipse cx="24" cy="33" rx="14" ry="8" fill="rgba(0,0,0,0.06)" />
      {/* Head highlight top-left */}
      <ellipse cx="19" cy="16" rx="8" ry="6" fill="rgba(255,255,255,0.18)" />
      {/* Muzzle */}
      <ellipse cx="24" cy="31" rx="10.5" ry="8.5" fill="url(#ra-dog-muzzle)" />
      {/* Muzzle shadow */}
      <ellipse cx="24" cy="35" rx="8" ry="4" fill="rgba(0,0,0,0.05)" />
      {/* Muzzle highlight */}
      <ellipse cx="22" cy="28" rx="4" ry="3" fill="rgba(255,255,255,0.15)" />
      {/* Eyebrows */}
      <path d="M12 16.5 Q16.5 13 21 16.5" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M27 16.5 Q31.5 13 36 16.5" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyes - outer (with blink) */}
      <g style={{ animation: 'ra-blink 5s ease-in-out infinite', transformOrigin: '17px 22px' }}>
        <ellipse cx="17" cy="22" rx="4" ry="4.5" fill="#FFFFFF" />
        <ellipse cx="17.3" cy="22.2" rx="3" ry="3.3" fill="url(#ra-dog-eye)" />
        <ellipse cx="17.5" cy="22.5" rx="1.8" ry="2.2" fill="#0A0A0A" />
        <circle cx="18.8" cy="20.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
        <circle cx="16" cy="23.5" r="0.9" fill="#FFFFFF" opacity="0.5" />
      </g>
      <g style={{ animation: 'ra-blink 5s ease-in-out infinite', transformOrigin: '31px 22px' }}>
        <ellipse cx="31" cy="22" rx="4" ry="4.5" fill="#FFFFFF" />
        <ellipse cx="31.3" cy="22.2" rx="3" ry="3.3" fill="url(#ra-dog-eye)" />
        <ellipse cx="31.5" cy="22.5" rx="1.8" ry="2.2" fill="#0A0A0A" />
        <circle cx="32.8" cy="20.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
        <circle cx="30" cy="23.5" r="0.9" fill="#FFFFFF" opacity="0.5" />
      </g>
      {/* Nose */}
      <ellipse cx="24" cy="28" rx="4" ry="3" fill="url(#ra-dog-nose)" />
      {/* Nose highlight */}
      <ellipse cx="23" cy="27" rx="2" ry="1" fill="rgba(255,255,255,0.3)" />
      {/* Nose nostrils */}
      <ellipse cx="22.5" cy="28.5" rx="1" ry="0.7" fill="#000000" opacity="0.3" />
      <ellipse cx="25.5" cy="28.5" rx="1" ry="0.7" fill="#000000" opacity="0.3" />
      {/* Mouth line */}
      <path d="M24 31 Q24 33 20.5 34.5" stroke="#78350F" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M24 31 Q24 33 27.5 34.5" stroke="#78350F" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Tongue (with bob) */}
      <g style={{ animation: 'ra-bob 3s ease-in-out infinite', transformOrigin: '24px 33px' }}>
        <ellipse cx="24" cy="36" rx="3.5" ry="5" fill="url(#ra-dog-tongue)" />
        <ellipse cx="23" cy="34.5" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.25)" />
        <line x1="24" y1="33" x2="24" y2="38.5" stroke="#BE123C" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
      </g>
      {/* Cheek blush */}
      <ellipse cx="11" cy="28" rx="3.5" ry="2" fill="#FECDD3" opacity="0.35" />
      <ellipse cx="37" cy="28" rx="3.5" ry="2" fill="#FECDD3" opacity="0.35" />
    </svg>
  ),

  '🐱': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-cat-fur" cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
        <radialGradient id="ra-cat-earInner" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#E11D48" />
        </radialGradient>
        <radialGradient id="ra-cat-eye" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
      </defs>
      {/* Ears outer (with twitch) */}
      <g style={{ animation: 'ra-twitch 4s ease-in-out infinite', transformOrigin: '9px 20px' }}>
        <polygon points="7,2 1,22 17,19" fill="#EA580C" />
        <polygon points="7,2 3,18 12,17" fill="#9A3412" opacity="0.3" />
        <polygon points="8.5,7 4,18 15,17" fill="url(#ra-cat-earInner)" opacity="0.7" />
      </g>
      <g style={{ animation: 'ra-twitch 4.5s ease-in-out infinite 0.5s', transformOrigin: '39px 20px' }}>
        <polygon points="41,2 47,22 31,19" fill="#EA580C" />
        <polygon points="41,2 45,18 36,17" fill="#9A3412" opacity="0.3" />
        <polygon points="39.5,7 44,18 33,17" fill="url(#ra-cat-earInner)" opacity="0.7" />
      </g>
      {/* Head */}
      <ellipse cx="24" cy="27" rx="17.5" ry="16.5" fill="url(#ra-cat-fur)" />
      {/* Head highlight */}
      <ellipse cx="19" cy="19" rx="8" ry="6" fill="rgba(255,255,255,0.12)" />
      {/* Forehead tabby stripes - V pattern */}
      <path d="M18 15 Q20 12 24 14.5" stroke="#9A3412" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
      <path d="M30 15 Q28 12 24 14.5" stroke="#9A3412" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
      <line x1="24" y1="11.5" x2="24" y2="16" stroke="#9A3412" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      {/* Side stripes */}
      <path d="M9 22 Q12 23 11 26" stroke="#9A3412" strokeWidth="1" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M39 22 Q36 23 37 26" stroke="#9A3412" strokeWidth="1" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* Cheek fluff */}
      <ellipse cx="11" cy="32" rx="5.5" ry="4.5" fill="#FED7AA" />
      <ellipse cx="37" cy="32" rx="5.5" ry="4.5" fill="#FED7AA" />
      {/* Cheek fluff highlight */}
      <ellipse cx="10" cy="31" rx="3" ry="2.5" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="36" cy="31" rx="3" ry="2.5" fill="rgba(255,255,255,0.15)" />
      {/* Muzzle */}
      <ellipse cx="24" cy="32" rx="7.5" ry="5.5" fill="#FEF3C7" />
      {/* Eye whites */}
      <ellipse cx="17" cy="24" rx="4.2" ry="4" fill="#FFFFFF" />
      <ellipse cx="31" cy="24" rx="4.2" ry="4" fill="#FFFFFF" />
      {/* Green iris */}
      <ellipse cx="17" cy="24" rx="3.5" ry="3.8" fill="url(#ra-cat-eye)" />
      <ellipse cx="31" cy="24" rx="3.5" ry="3.8" fill="url(#ra-cat-eye)" />
      {/* Vertical slit pupils */}
      <ellipse cx="17" cy="24" rx="1.3" ry="3.6" fill="#0A0A0A" />
      <ellipse cx="31" cy="24" rx="1.3" ry="3.6" fill="#0A0A0A" />
      {/* Eye main shine */}
      <circle cx="18.5" cy="22.5" r="1.5" fill="#FFFFFF" opacity="0.95" />
      <circle cx="32.5" cy="22.5" r="1.5" fill="#FFFFFF" opacity="0.95" />
      {/* Eye secondary shine */}
      <circle cx="15.8" cy="25.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      <circle cx="29.8" cy="25.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      {/* Eye top lids hint */}
      <path d="M12.5 22.5 Q17 19 21.5 22.5" stroke="#7C2D12" strokeWidth="0.8" fill="none" />
      <path d="M26.5 22.5 Q31 19 35.5 22.5" stroke="#7C2D12" strokeWidth="0.8" fill="none" />
      {/* Nose - pink inverted triangle */}
      <path d="M22.2 29.5 L24 32 L25.8 29.5 Z" fill="#F472B6" />
      <path d="M23 30 L24 31 L25 30 Z" fill="rgba(255,255,255,0.2)" />
      {/* W-shaped mouth */}
      <path d="M20.5 33 Q22 34.5 24 33 Q26 34.5 27.5 33" stroke="#92400E" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Whiskers - 3 each side (with wiggle) */}
      <g style={{ animation: 'ra-wiggle 3s ease-in-out infinite', transformOrigin: '14.5px 31px' }}>
        <line x1="2" y1="27" x2="14.5" y2="29.5" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
        <line x1="1" y1="31" x2="14.5" y2="31.5" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
        <line x1="2.5" y1="35" x2="14.5" y2="33.5" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
      </g>
      <g style={{ animation: 'ra-wiggle 3s ease-in-out infinite 0.3s', transformOrigin: '33.5px 31px' }}>
        <line x1="46" y1="27" x2="33.5" y2="29.5" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
        <line x1="47" y1="31" x2="33.5" y2="31.5" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
        <line x1="45.5" y1="35" x2="33.5" y2="33.5" stroke="#78350F" strokeWidth="0.6" opacity="0.45" />
      </g>
      {/* Whisker dots */}
      <circle cx="18.5" cy="30.5" r="0.6" fill="#78350F" opacity="0.35" />
      <circle cx="17" cy="32" r="0.6" fill="#78350F" opacity="0.35" />
      <circle cx="29.5" cy="30.5" r="0.6" fill="#78350F" opacity="0.35" />
      <circle cx="31" cy="32" r="0.6" fill="#78350F" opacity="0.35" />
    </svg>
  ),

  '🐼': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-panda-face" cx="0.4" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F3F4F6" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </radialGradient>
        <radialGradient id="ra-panda-patch" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>
        <radialGradient id="ra-panda-ear" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
      </defs>
      {/* Ears */}
      <circle cx="8" cy="10" r="6.5" fill="url(#ra-panda-ear)" />
      <circle cx="40" cy="10" r="6.5" fill="url(#ra-panda-ear)" />
      {/* Ear highlight */}
      <circle cx="7" cy="8.5" r="2.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="39" cy="8.5" r="2.5" fill="rgba(255,255,255,0.1)" />
      {/* Head (with breathe) */}
      <g style={{ animation: 'ra-breathe 5s ease-in-out infinite', transformOrigin: '24px 26px' }}>
        <ellipse cx="24" cy="26" rx="18.5" ry="17.5" fill="url(#ra-panda-face)" />
        {/* Head shadow bottom */}
        <ellipse cx="24" cy="38" rx="14" ry="5" fill="rgba(0,0,0,0.04)" />
        {/* Head highlight top-left */}
        <ellipse cx="18" cy="16" rx="9" ry="6" fill="rgba(255,255,255,0.35)" />
      </g>
      {/* Eye patches - teardrop shape inverted */}
      <path d="M10 19 Q12 14 18 16 Q22 18 22 24 Q22 30 16 30 Q10 28 10 19Z" fill="url(#ra-panda-patch)" />
      <path d="M38 19 Q36 14 30 16 Q26 18 26 24 Q26 30 32 30 Q38 28 38 19Z" fill="url(#ra-panda-patch)" />
      {/* Patch inner shadow */}
      <path d="M11 20 Q13 16 17 17 Q21 19 21 24 Q21 28 16 28 Q11 27 11 20Z" fill="rgba(0,0,0,0.15)" />
      <path d="M37 20 Q35 16 31 17 Q27 19 27 24 Q27 28 32 28 Q37 27 37 20Z" fill="rgba(0,0,0,0.15)" />
      {/* Eyes - whites visible within patches (with blink) */}
      <g style={{ animation: 'ra-blink 6s ease-in-out infinite', transformOrigin: '16px 23px' }}>
        <ellipse cx="16" cy="23" rx="3.5" ry="3.8" fill="#1C1917" />
        <circle cx="17.5" cy="21.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
        <circle cx="14.8" cy="24.5" r="0.9" fill="#FFFFFF" opacity="0.45" />
      </g>
      <g style={{ animation: 'ra-blink 6s ease-in-out infinite', transformOrigin: '32px 23px' }}>
        <ellipse cx="32" cy="23" rx="3.5" ry="3.8" fill="#1C1917" />
        <circle cx="33.5" cy="21.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
        <circle cx="30.8" cy="24.5" r="0.9" fill="#FFFFFF" opacity="0.45" />
      </g>
      {/* Nose */}
      <ellipse cx="24" cy="30" rx="3" ry="2.2" fill="#1C1917" />
      <ellipse cx="23.5" cy="29.3" rx="1.5" ry="0.7" fill="rgba(255,255,255,0.25)" />
      {/* Mouth */}
      <path d="M24 32.2 Q22 35 19.5 33.5" stroke="#4B5563" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M24 32.2 Q26 35 28.5 33.5" stroke="#4B5563" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="12" cy="30" rx="3.5" ry="2" fill="#FECDD3" opacity="0.45" />
      <ellipse cx="36" cy="30" rx="3.5" ry="2" fill="#FECDD3" opacity="0.45" />
      {/* Subtle body shadow */}
      <ellipse cx="24" cy="43.5" rx="15" ry="2.5" fill="rgba(0,0,0,0.04)" />
    </svg>
  ),

  '🦊': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-fox-fur" cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#9A3412" />
        </radialGradient>
        <radialGradient id="ra-fox-earInner" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#57534E" />
          <stop offset="100%" stopColor="#292524" />
        </radialGradient>
        <radialGradient id="ra-fox-eye" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
      </defs>
      {/* Ears (with twitch) */}
      <g style={{ animation: 'ra-twitch 4s ease-in-out infinite', transformOrigin: '8px 19px' }}>
        <polygon points="6,1 0,21 16,17" fill="#EA580C" />
        <polygon points="6,1 2,17 10,15" fill="#7C2D12" opacity="0.35" />
        <polygon points="7,5 3,17 13,15" fill="url(#ra-fox-earInner)" opacity="0.8" />
      </g>
      <g style={{ animation: 'ra-twitch 4.5s ease-in-out infinite 0.7s', transformOrigin: '40px 19px' }}>
        <polygon points="42,1 48,21 32,17" fill="#EA580C" />
        <polygon points="42,1 46,17 38,15" fill="#7C2D12" opacity="0.35" />
        <polygon points="41,5 45,17 35,15" fill="url(#ra-fox-earInner)" opacity="0.8" />
      </g>
      {/* Head */}
      <ellipse cx="24" cy="26" rx="17.5" ry="16.5" fill="url(#ra-fox-fur)" />
      {/* Head highlight top-left */}
      <ellipse cx="18" cy="17" rx="7" ry="5" fill="rgba(255,255,255,0.12)" />
      {/* White face mask */}
      <path d="M24 15 Q11 22 13 35 Q17 41 24 39 Q31 41 35 35 Q37 22 24 15Z" fill="#FFFFFF" />
      {/* Face mask inner shadow */}
      <path d="M24 17 Q14 23 15 33 Q18 38 24 37 Q30 38 33 33 Q35 23 24 17Z" fill="rgba(255,255,255,0.5)" />
      {/* White stripe from nose to forehead */}
      <path d="M22 15 Q24 12 26 15 L25.5 28 Q24 29 22.5 28Z" fill="#FFFFFF" opacity="0.5" />
      {/* Eyebrows - sly angle */}
      <path d="M13 19 Q17 16.5 21 18.5" stroke="#78350F" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M35 19 Q31 16.5 27 18.5" stroke="#78350F" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Eye whites */}
      <ellipse cx="17" cy="23" rx="3.8" ry="3.5" fill="#FFFFFF" />
      <ellipse cx="31" cy="23" rx="3.8" ry="3.5" fill="#FFFFFF" />
      {/* Amber iris */}
      <ellipse cx="17.3" cy="23.2" rx="2.8" ry="3" fill="url(#ra-fox-eye)" />
      <ellipse cx="31.3" cy="23.2" rx="2.8" ry="3" fill="url(#ra-fox-eye)" />
      {/* Pupils */}
      <ellipse cx="17.5" cy="23.3" rx="1.5" ry="2.2" fill="#0A0A0A" />
      <ellipse cx="31.5" cy="23.3" rx="1.5" ry="2.2" fill="#0A0A0A" />
      {/* Eye main shine (with glow) */}
      <circle cx="18.7" cy="21.5" r="1.5" fill="#FFFFFF" style={{ animation: 'ra-glow 3s ease-in-out infinite' }} />
      <circle cx="32.7" cy="21.5" r="1.5" fill="#FFFFFF" style={{ animation: 'ra-glow 3s ease-in-out infinite 0.5s' }} />
      {/* Eye secondary shine */}
      <circle cx="16" cy="24.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      <circle cx="30" cy="24.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      {/* Nose */}
      <ellipse cx="24" cy="29" rx="2.8" ry="2.2" fill="#1C1917" />
      <ellipse cx="23.5" cy="28.3" rx="1.3" ry="0.6" fill="rgba(255,255,255,0.3)" />
      {/* Mouth - smirk */}
      <path d="M24 31.2 Q21.5 34 19 32.5" stroke="#78350F" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M24 31.2 Q26.5 34 29 32.5" stroke="#78350F" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Cheek fur tufts */}
      <ellipse cx="10" cy="30" rx="3" ry="2" fill="#FDBA74" opacity="0.3" />
      <ellipse cx="38" cy="30" rx="3" ry="2" fill="#FDBA74" opacity="0.3" />
    </svg>
  ),

  '🦁': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-lion-mane-r" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
        <radialGradient id="ra-lion-face" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <radialGradient id="ra-lion-eye" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
        <radialGradient id="ra-lion-muzzle" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>
      </defs>
      {/* Mane (with breathe) */}
      <g style={{ animation: 'ra-breathe 5s ease-in-out infinite', transformOrigin: '24px 24px' }}>
        <circle cx="24" cy="24" r="23" fill="url(#ra-lion-mane-r)" />
        <ellipse cx="24" cy="1.5" rx="4" ry="4.5" fill="#FDE68A" />
        <ellipse cx="15" cy="3" rx="3.8" ry="4.2" fill="#F59E0B" transform="rotate(-25 15 3)" />
        <ellipse cx="33" cy="3" rx="3.8" ry="4.2" fill="#F59E0B" transform="rotate(25 33 3)" />
        <ellipse cx="7" cy="8" rx="3.5" ry="4.5" fill="#FDE68A" transform="rotate(-50 7 8)" />
        <ellipse cx="41" cy="8" rx="3.5" ry="4.5" fill="#FDE68A" transform="rotate(50 41 8)" />
        <ellipse cx="2.5" cy="16" rx="3.5" ry="4.5" fill="#F59E0B" transform="rotate(-70 2.5 16)" />
        <ellipse cx="45.5" cy="16" rx="3.5" ry="4.5" fill="#F59E0B" transform="rotate(70 45.5 16)" />
        <ellipse cx="1" cy="25" rx="3.5" ry="4.5" fill="#FDE68A" transform="rotate(-85 1 25)" />
        <ellipse cx="47" cy="25" rx="3.5" ry="4.5" fill="#FDE68A" transform="rotate(85 47 25)" />
        <ellipse cx="3" cy="34" rx="3.5" ry="4.5" fill="#F59E0B" transform="rotate(70 3 34)" />
        <ellipse cx="45" cy="34" rx="3.5" ry="4.5" fill="#F59E0B" transform="rotate(-70 45 34)" />
        <ellipse cx="8" cy="41" rx="3.5" ry="4" fill="#FDE68A" transform="rotate(50 8 41)" />
        <ellipse cx="40" cy="41" rx="3.5" ry="4" fill="#FDE68A" transform="rotate(-50 40 41)" />
        <ellipse cx="16" cy="45" rx="3.8" ry="4" fill="#F59E0B" transform="rotate(25 16 45)" />
        <ellipse cx="32" cy="45" rx="3.8" ry="4" fill="#F59E0B" transform="rotate(-25 32 45)" />
        <ellipse cx="24" cy="47" rx="4" ry="3.5" fill="#FDE68A" />
        <circle cx="24" cy="24" r="18" fill="rgba(253,230,138,0.2)" />
      </g>
      {/* Face */}
      <ellipse cx="24" cy="25" rx="14.5" ry="15" fill="url(#ra-lion-face)" />
      {/* Face highlight */}
      <ellipse cx="20" cy="18" rx="7" ry="5" fill="rgba(255,255,255,0.15)" />
      {/* Forehead fur tufts */}
      <path d="M19 13 Q21 10 24 12 Q27 10 29 13" fill="#D97706" opacity="0.4" />
      {/* Muzzle */}
      <ellipse cx="24" cy="31" rx="8.5" ry="6.5" fill="url(#ra-lion-muzzle)" />
      {/* Muzzle shadow */}
      <ellipse cx="24" cy="34" rx="6" ry="3" fill="rgba(0,0,0,0.05)" />
      {/* Eyebrows - proud */}
      <path d="M14 17.5 Q18 14.5 22 17.5" stroke="#78350F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M26 17.5 Q30 14.5 34 17.5" stroke="#78350F" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Eyes (with blink) */}
      <g style={{ animation: 'ra-blink 5.5s ease-in-out infinite', transformOrigin: '18px 22px' }}>
        <ellipse cx="18" cy="22" rx="3.5" ry="3.8" fill="#FFFFFF" />
        <ellipse cx="18.2" cy="22.2" rx="2.5" ry="2.8" fill="url(#ra-lion-eye)" />
        <ellipse cx="18.4" cy="22.4" rx="1.5" ry="2" fill="#0A0A0A" />
        <circle cx="19.5" cy="20.5" r="1.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="17" cy="23.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      </g>
      <g style={{ animation: 'ra-blink 5.5s ease-in-out infinite', transformOrigin: '30px 22px' }}>
        <ellipse cx="30" cy="22" rx="3.5" ry="3.8" fill="#FFFFFF" />
        <ellipse cx="30.2" cy="22.2" rx="2.5" ry="2.8" fill="url(#ra-lion-eye)" />
        <ellipse cx="30.4" cy="22.4" rx="1.5" ry="2" fill="#0A0A0A" />
        <circle cx="31.5" cy="20.5" r="1.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="29" cy="23.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      </g>
      {/* Nose */}
      <ellipse cx="24" cy="28.5" rx="3" ry="2.3" fill="#78350F" />
      <ellipse cx="23.5" cy="27.8" rx="1.5" ry="0.7" fill="rgba(255,255,255,0.2)" />
      {/* Mouth */}
      <path d="M24 30.8 Q22 33.5 19.5 32" stroke="#78350F" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M24 30.8 Q26 33.5 28.5 32" stroke="#78350F" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="13" cy="29" rx="3" ry="1.8" fill="#FECDD3" opacity="0.3" />
      <ellipse cx="35" cy="29" rx="3" ry="1.8" fill="#FECDD3" opacity="0.3" />
    </svg>
  ),

  '🐯': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-tiger-fur" cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
        <radialGradient id="ra-tiger-earInner" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </radialGradient>
        <radialGradient id="ra-tiger-eye" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
      </defs>
      {/* Ears (with twitch) */}
      <g style={{ animation: 'ra-twitch 4s ease-in-out infinite', transformOrigin: '8px 17px' }}>
        <circle cx="8" cy="10" r="7" fill="#EA580C" />
        <circle cx="8" cy="10" r="4.5" fill="url(#ra-tiger-earInner)" />
        <circle cx="8.5" cy="11" r="3" fill="rgba(0,0,0,0.06)" />
      </g>
      <g style={{ animation: 'ra-twitch 4.5s ease-in-out infinite 0.6s', transformOrigin: '40px 17px' }}>
        <circle cx="40" cy="10" r="7" fill="#EA580C" />
        <circle cx="40" cy="10" r="4.5" fill="url(#ra-tiger-earInner)" />
        <circle cx="40.5" cy="11" r="3" fill="rgba(0,0,0,0.06)" />
      </g>
      {/* Head (with breathe) */}
      <g style={{ animation: 'ra-breathe 5s ease-in-out infinite', transformOrigin: '24px 26px' }}>
        <ellipse cx="24" cy="26" rx="18.5" ry="17.5" fill="url(#ra-tiger-fur)" />
        {/* Head highlight */}
        <ellipse cx="18" cy="17" rx="8" ry="6" fill="rgba(255,255,255,0.12)" />
      </g>
      {/* White jaw/chin */}
      <ellipse cx="24" cy="34" rx="11.5" ry="8.5" fill="#FFFFFF" />
      {/* Jaw shadow */}
      <ellipse cx="24" cy="37" rx="9" ry="4" fill="rgba(0,0,0,0.04)" />
      {/* Forehead stripes - V pattern curved */}
      <path d="M18 11 Q19 17 16 21" stroke="#1C1917" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M30 11 Q29 17 32 21" stroke="#1C1917" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M24 9 L24 17" stroke="#1C1917" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Side stripes - curved C shapes */}
      <path d="M7 19 Q11 21 10 26" stroke="#1C1917" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M6 25 Q10 27 9 32" stroke="#1C1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M41 19 Q37 21 38 26" stroke="#1C1917" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M42 25 Q38 27 39 32" stroke="#1C1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Upper side stripes */}
      <path d="M10 14 Q13 16 12 19" stroke="#1C1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M38 14 Q35 16 36 19" stroke="#1C1917" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Cheek white tufts */}
      <ellipse cx="12" cy="30" rx="4" ry="3" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="36" cy="30" rx="4" ry="3" fill="rgba(255,255,255,0.6)" />
      {/* Eye whites */}
      <ellipse cx="17" cy="23" rx="4" ry="3.8" fill="#FFFFFF" />
      <ellipse cx="31" cy="23" rx="4" ry="3.8" fill="#FFFFFF" />
      {/* Iris - amber */}
      <ellipse cx="17.2" cy="23.1" rx="3.2" ry="3.5" fill="url(#ra-tiger-eye)" />
      <ellipse cx="31.2" cy="23.1" rx="3.2" ry="3.5" fill="url(#ra-tiger-eye)" />
      {/* Pupils */}
      <ellipse cx="17.4" cy="23.2" rx="1.8" ry="2.8" fill="#0A0A0A" />
      <ellipse cx="31.4" cy="23.2" rx="1.8" ry="2.8" fill="#0A0A0A" />
      {/* Eye main shine */}
      <circle cx="18.7" cy="21.5" r="1.5" fill="#FFFFFF" opacity="0.95" />
      <circle cx="32.7" cy="21.5" r="1.5" fill="#FFFFFF" opacity="0.95" />
      {/* Eye secondary shine */}
      <circle cx="16" cy="24.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      <circle cx="30" cy="24.5" r="0.7" fill="#FFFFFF" opacity="0.45" />
      {/* Nose */}
      <path d="M21.5 29 L24 31.5 L26.5 29 Z" fill="#F472B6" />
      <path d="M22.5 29.5 L24 30.5 L25.5 29.5 Z" fill="rgba(255,255,255,0.2)" />
      {/* Mouth */}
      <path d="M24 31.5 Q22 34.5 19 33" stroke="#57534E" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M24 31.5 Q26 34.5 29 33" stroke="#57534E" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Whisker dots */}
      <circle cx="18" cy="30.5" r="0.7" fill="#9CA3AF" opacity="0.4" />
      <circle cx="16" cy="32" r="0.7" fill="#9CA3AF" opacity="0.4" />
      <circle cx="30" cy="30.5" r="0.7" fill="#9CA3AF" opacity="0.4" />
      <circle cx="32" cy="32" r="0.7" fill="#9CA3AF" opacity="0.4" />
      {/* Cheek blush */}
      <ellipse cx="12" cy="31" rx="3.5" ry="2" fill="#FECDD3" opacity="0.35" />
      <ellipse cx="36" cy="31" rx="3.5" ry="2" fill="#FECDD3" opacity="0.35" />
    </svg>
  ),

  '🦄': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-uni-face" cx="0.4" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </radialGradient>
        <linearGradient id="ra-uni-horn" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="30%" stopColor="#FCD34D" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ra-uni-mane1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="ra-uni-mane2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="ra-uni-mane3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="ra-uni-mane4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <radialGradient id="ra-uni-eye" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
      {/* Mane behind head - flowing strands (with bob) */}
      <g style={{ animation: 'ra-bob 4s ease-in-out infinite', transformOrigin: '7px 25px' }}>
        <path d="M5 14 Q3 20 5 28 Q7 35 11 39 Q9 30 11 22 Q13 16 9 12Z" fill="url(#ra-uni-mane1)" opacity="0.85" />
      </g>
      <g style={{ animation: 'ra-bob 4s ease-in-out infinite 0.5s', transformOrigin: '11px 23px' }}>
        <path d="M9 11 Q7 17 9 25 Q11 32 14 37 Q12 28 13 20 Q14 13 11 10Z" fill="url(#ra-uni-mane2)" opacity="0.85" />
      </g>
      <g style={{ animation: 'ra-bob 4s ease-in-out infinite 1s', transformOrigin: '13px 21px' }}>
        <path d="M12 9 Q10 15 12 23 Q14 30 16 35 Q14 26 15 18 Q16 12 13 8Z" fill="url(#ra-uni-mane3)" opacity="0.8" />
      </g>
      <g style={{ animation: 'ra-bob 4s ease-in-out infinite 1.5s', transformOrigin: '16px 20px' }}>
        <path d="M14.5 8 Q12.5 14 14.5 21 Q16 28 18 33 Q16 24 17 16 Q18 10 15.5 7Z" fill="url(#ra-uni-mane4)" opacity="0.8" />
      </g>
      {/* Mane highlight streaks */}
      <path d="M6 16 Q5 22 7 30" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M10 13 Q9 19 11 27" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      {/* Ears */}
      <polygon points="12,9 7,22 19,18" fill="#F5F3FF" />
      <polygon points="36,9 41,22 29,18" fill="#F5F3FF" />
      {/* Ear inner */}
      <polygon points="13,12 9,20 18,17" fill="#FECDD3" opacity="0.5" />
      <polygon points="35,12 39,20 30,17" fill="#FECDD3" opacity="0.5" />
      {/* Horn */}
      <polygon points="24,-1 20.5,14 27.5,14" fill="url(#ra-uni-horn)" />
      {/* Horn shadow */}
      <polygon points="24,-1 22,14 24.5,14" fill="rgba(0,0,0,0.08)" />
      {/* Horn spiral lines */}
      <line x1="21.8" y1="11" x2="26.2" y2="9.5" stroke="#D97706" strokeWidth="0.7" opacity="0.5" />
      <line x1="22.2" y1="8.5" x2="25.8" y2="7" stroke="#D97706" strokeWidth="0.7" opacity="0.5" />
      <line x1="22.8" y1="6" x2="25.2" y2="4.5" stroke="#D97706" strokeWidth="0.7" opacity="0.5" />
      <line x1="23.3" y1="3.5" x2="24.7" y2="2.5" stroke="#D97706" strokeWidth="0.6" opacity="0.4" />
      {/* Horn tip sparkle */}
      <circle cx="24" cy="0" r="1.5" fill="#FEF3C7" opacity="0.7" />
      <path d="M24 -2.5 L24.4 -0.5 L24 0.5 L23.6 -0.5Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M22 0 L23.5 0.3 L26 0 L23.5 -0.3Z" fill="#FFFFFF" opacity="0.6" />
      {/* Head */}
      <ellipse cx="24" cy="27" rx="16.5" ry="16.5" fill="url(#ra-uni-face)" />
      {/* Head highlight */}
      <ellipse cx="19" cy="19" rx="8" ry="6" fill="rgba(255,255,255,0.3)" />
      {/* Forelock on top - rainbow */}
      <path d="M18 14 Q16 9 20 11 Q18 7 22 10 Q21 6 24 9 Q25 6 27 10" fill="url(#ra-uni-mane1)" opacity="0.5" />
      <path d="M20 13 Q19 9 22 11 Q21 7 24 10 Q25 8 26 11" fill="url(#ra-uni-mane2)" opacity="0.4" />
      {/* Eye whites */}
      <ellipse cx="18" cy="25" rx="4.2" ry="4.8" fill="#FFFFFF" />
      <ellipse cx="30" cy="25" rx="4.2" ry="4.8" fill="#FFFFFF" />
      {/* Iris - violet gradient */}
      <ellipse cx="18" cy="25.2" rx="3.2" ry="3.8" fill="url(#ra-uni-eye)" />
      <ellipse cx="30" cy="25.2" rx="3.2" ry="3.8" fill="url(#ra-uni-eye)" />
      {/* Pupils */}
      <ellipse cx="18.2" cy="25.5" rx="1.8" ry="2.5" fill="#1E1B4B" />
      <ellipse cx="30.2" cy="25.5" rx="1.8" ry="2.5" fill="#1E1B4B" />
      {/* Eye main shine */}
      <circle cx="19.5" cy="23.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
      <circle cx="31.5" cy="23.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
      {/* Eye secondary shine */}
      <circle cx="16.8" cy="27" r="0.9" fill="#FFFFFF" opacity="0.45" />
      <circle cx="28.8" cy="27" r="0.9" fill="#FFFFFF" opacity="0.45" />
      {/* Eyelashes - 4 lines each */}
      <path d="M13 21.5 L14.5 23.5" stroke="#6D28D9" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      <path d="M13.5 20 L15.5 22" stroke="#6D28D9" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      <path d="M14.5 19 L16.5 21" stroke="#6D28D9" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      <path d="M16" y1="18.5" d="M16 18.5 L17.5 20.5" stroke="#6D28D9" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      <path d="M35 21.5 L33.5 23.5" stroke="#6D28D9" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      <path d="M34.5 20 L32.5 22" stroke="#6D28D9" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      <path d="M33.5 19 L31.5 21" stroke="#6D28D9" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      <path d="M32 18.5 L30.5 20.5" stroke="#6D28D9" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      {/* Nose */}
      <ellipse cx="24" cy="31.5" rx="2" ry="1.3" fill="#D8B4FE" />
      <ellipse cx="23.5" cy="31" rx="1" ry="0.5" fill="rgba(255,255,255,0.3)" />
      {/* Mouth */}
      <path d="M21 34 Q24 36.5 27 34" stroke="#C084FC" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="13" cy="30.5" rx="3.5" ry="2" fill="#FECDD3" opacity="0.5" />
      <ellipse cx="35" cy="30.5" rx="3.5" ry="2" fill="#FECDD3" opacity="0.5" />
      {/* Floating stars (with glow) */}
      <path d="M34 7 L35 5 L36 7 L38 8 L36 9 L35 11 L34 9 L32 8Z" fill="#FCD34D" style={{ animation: 'ra-glow 3s ease-in-out infinite' }} />
      <path d="M38 14 L38.6 12.8 L39.2 14 L40.4 14.5 L39.2 15 L38.6 16.2 L38 15 L36.8 14.5Z" fill="#FCD34D" style={{ animation: 'ra-glow 3.5s ease-in-out infinite 1s' }} />
      <path d="M8 6 L8.5 5 L9 6 L10 6.4 L9 6.8 L8.5 7.8 L8 6.8 L7 6.4Z" fill="#E9D5FF" style={{ animation: 'ra-glow 4s ease-in-out infinite 0.5s' }} />
    </svg>
  ),

  '🐸': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra-frog-body" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="50%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>
        <radialGradient id="ra-frog-belly" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </radialGradient>
        <radialGradient id="ra-frog-eyeball" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </radialGradient>
        <radialGradient id="ra-frog-iris" cx="0.45" cy="0.45" r="0.5">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
        <radialGradient id="ra-frog-bulge" cx="0.45" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#22C55E" />
        </radialGradient>
      </defs>
      {/* Eye bulge left (with bob) */}
      <g style={{ animation: 'ra-bob 3.5s ease-in-out infinite', transformOrigin: '14px 19px' }}>
        <circle cx="14" cy="10" r="9" fill="url(#ra-frog-bulge)" />
        <circle cx="14.5" cy="12" r="7" fill="rgba(0,0,0,0.06)" />
        <ellipse cx="12" cy="7" rx="4" ry="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="14" cy="10" r="6.5" fill="url(#ra-frog-eyeball)" />
        <circle cx="14" cy="10.2" r="4" fill="url(#ra-frog-iris)" />
        <ellipse cx="14" cy="10.3" rx="3.5" ry="1.8" fill="#0A0A0A" />
        <circle cx="16" cy="8" r="2" fill="#FFFFFF" opacity="0.95" />
        <circle cx="12" cy="12.5" r="0.9" fill="#FFFFFF" opacity="0.45" />
      </g>
      {/* Eye bulge right (with bob, delayed) */}
      <g style={{ animation: 'ra-bob 3.5s ease-in-out infinite 1s', transformOrigin: '34px 19px' }}>
        <circle cx="34" cy="10" r="9" fill="url(#ra-frog-bulge)" />
        <circle cx="34.5" cy="12" r="7" fill="rgba(0,0,0,0.06)" />
        <ellipse cx="32" cy="7" rx="4" ry="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="34" cy="10" r="6.5" fill="url(#ra-frog-eyeball)" />
        <circle cx="34" cy="10.2" r="4" fill="url(#ra-frog-iris)" />
        <ellipse cx="34" cy="10.3" rx="3.5" ry="1.8" fill="#0A0A0A" />
        <circle cx="36" cy="8" r="2" fill="#FFFFFF" opacity="0.95" />
        <circle cx="32" cy="12.5" r="0.9" fill="#FFFFFF" opacity="0.45" />
      </g>
      {/* Head / body */}
      <ellipse cx="24" cy="28" rx="21" ry="16" fill="url(#ra-frog-body)" />
      {/* Head highlight */}
      <ellipse cx="18" cy="21" rx="9" ry="5" fill="rgba(255,255,255,0.12)" />
      {/* Belly */}
      <ellipse cx="24" cy="33" rx="14.5" ry="9.5" fill="url(#ra-frog-belly)" />
      {/* Darker spots */}
      <circle cx="17" cy="20" r="2" fill="#16A34A" opacity="0.25" />
      <circle cx="31" cy="20" r="2" fill="#16A34A" opacity="0.25" />
      <circle cx="24" cy="17.5" r="1.5" fill="#16A34A" opacity="0.2" />
      <circle cx="12" cy="24" r="1.3" fill="#16A34A" opacity="0.18" />
      <circle cx="36" cy="24" r="1.3" fill="#16A34A" opacity="0.18" />
      {/* Nostrils */}
      <circle cx="20" cy="24.5" r="1.3" fill="#15803D" />
      <circle cx="28" cy="24.5" r="1.3" fill="#15803D" />
      {/* Nostril highlight */}
      <circle cx="19.6" cy="24.2" r="0.4" fill="rgba(255,255,255,0.2)" />
      <circle cx="27.6" cy="24.2" r="0.4" fill="rgba(255,255,255,0.2)" />
      {/* Wide smile */}
      <path d="M8 31 Q14 39 24 39 Q34 39 40 31" stroke="#15803D" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Inner mouth */}
      <path d="M12 33 Q18 37 24 37 Q30 37 36 33" fill="#15803D" opacity="0.15" />
      {/* Smile line highlight */}
      <path d="M10 30.5 Q16 37.5 24 37.5 Q32 37.5 38 30.5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none" />
      {/* Cheek blush */}
      <ellipse cx="9" cy="30" rx="4" ry="2.5" fill="#F472B6" opacity="0.2" />
      <ellipse cx="39" cy="30" rx="4" ry="2.5" fill="#F472B6" opacity="0.2" />
      {/* Shadow under face */}
      <ellipse cx="24" cy="43.5" rx="17" ry="2.5" fill="rgba(0,0,0,0.04)" />
    </svg>
  ),
};

// Importar set 2 (humanos/fantasía)
import avatars2 from './RoscoAvatarsSet2';

const allAvatars = { ...avatars, ...avatars2 };

// Lista ordenada de IDs para el selector
export const AVATAR_IDS = Object.keys(allAvatars);

// Componente que renderiza un avatar por su emoji ID
const RoscoAvatar = ({ id, size = 48, className = '' }) => {
  const Avatar = allAvatars[id];
  if (!Avatar) return <span style={{ fontSize: size * 0.7 }}>{id}</span>;
  return (
    <div className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Avatar />
    </div>
  );
};

export default RoscoAvatar;
