let ra2StylesInjected = false;
const injectRa2Styles = () => {
  if (ra2StylesInjected) return;
  ra2StylesInjected = true;
  const css = `
    @keyframes ra-blink{0%,42%{transform:scaleY(1)}45%{transform:scaleY(0.1)}48%,100%{transform:scaleY(1)}}
    @keyframes ra-wag{0%,100%{transform:rotate(0deg)}25%{transform:rotate(8deg)}75%{transform:rotate(-8deg)}}
    @keyframes ra-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
    @keyframes ra-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
    @keyframes ra-glow{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes ra-twitch{0%,90%{transform:rotate(0)}93%{transform:rotate(3deg)}96%{transform:rotate(-3deg)}100%{transform:rotate(0)}}
    @keyframes ra-wiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-1px)}75%{transform:translateX(1px)}}
    @keyframes ra-flicker{0%,100%{opacity:1}50%{opacity:0.7}}
    @keyframes ra-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    @keyframes ra-sway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(3deg)}}
  `;
  const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el);
};
if (typeof document !== 'undefined') injectRa2Styles();

const avatars2 = {
  '🤖': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra2-bot-head" cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="60%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
        <radialGradient id="ra2-bot-eyeGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
        <radialGradient id="ra2-bot-eyeOuter" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ra2-bot-antenna" cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <linearGradient id="ra2-bot-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Antenna rod + sphere (animated bob) */}
      <g style={{animation:'ra-bob 4s ease-in-out infinite',transformOrigin:'24px 9px'}}>
        <rect x="23" y="2" width="2" height="7" rx="1" fill="#94A3B8" />
        <rect x="23.2" y="2" width="0.8" height="7" rx="0.4" fill="#fff" opacity="0.2" />
        <circle cx="24" cy="2.5" r="3" fill="url(#ra2-bot-antenna)" />
        <circle cx="22.8" cy="1.5" r="1" fill="#fff" opacity="0.6" />
        <circle cx="23.5" cy="2.8" r="0.4" fill="#fff" opacity="0.3" />
      </g>
      {/* Ear receivers */}
      <rect x="3" y="18" width="4" height="10" rx="2" fill="#94A3B8" />
      <rect x="3.3" y="18.3" width="1.5" height="9.4" rx="0.75" fill="#fff" opacity="0.12" />
      <rect x="41" y="18" width="4" height="10" rx="2" fill="#94A3B8" />
      <rect x="42.8" y="18.3" width="1.2" height="9.4" rx="0.6" fill="#fff" opacity="0.12" />
      {/* Head shadow */}
      <rect x="9" y="10" width="32" height="30" rx="8" fill="#64748B" opacity="0.15" transform="translate(0.8, 1)" />
      {/* Head base */}
      <rect x="8" y="9" width="32" height="30" rx="8" fill="url(#ra2-bot-head)" />
      {/* Head highlight top-left */}
      <rect x="8" y="9" width="32" height="15" rx="8" fill="url(#ra2-bot-panel)" />
      {/* Forehead panel line */}
      <line x1="14" y1="14" x2="34" y2="14" stroke="#94A3B8" strokeWidth="0.6" opacity="0.5" />
      {/* Bolts - hexagonal style */}
      <circle cx="6.5" cy="23" r="2.8" fill="#A1A1AA" />
      <circle cx="6.5" cy="23" r="2" fill="#94A3B8" stroke="#71717A" strokeWidth="0.5" />
      <line x1="5" y1="23" x2="8" y2="23" stroke="#71717A" strokeWidth="0.7" />
      <line x1="5.7" y1="21.8" x2="7.3" y2="24.2" stroke="#71717A" strokeWidth="0.5" />
      <line x1="7.3" y1="21.8" x2="5.7" y2="24.2" stroke="#71717A" strokeWidth="0.5" />
      <circle cx="41.5" cy="23" r="2.8" fill="#A1A1AA" />
      <circle cx="41.5" cy="23" r="2" fill="#94A3B8" stroke="#71717A" strokeWidth="0.5" />
      <line x1="40" y1="23" x2="43" y2="23" stroke="#71717A" strokeWidth="0.7" />
      <line x1="40.7" y1="21.8" x2="42.3" y2="24.2" stroke="#71717A" strokeWidth="0.5" />
      <line x1="42.3" y1="21.8" x2="40.7" y2="24.2" stroke="#71717A" strokeWidth="0.5" />
      {/* Eye glow outer left (animated flicker) */}
      <g style={{animation:'ra-flicker 3s ease-in-out infinite'}}>
        <circle cx="17" cy="22" r="7" fill="url(#ra2-bot-eyeOuter)" />
        <circle cx="17" cy="22" r="5.2" fill="#1E3A5F" />
        <circle cx="17" cy="22" r="4.5" fill="url(#ra2-bot-eyeGlow)" />
        <circle cx="17" cy="22" r="2.5" fill="#93C5FD" opacity="0.4" />
        <circle cx="15.3" cy="20.3" r="1.8" fill="#fff" opacity="0.7" />
        <circle cx="18.2" cy="23.2" r="0.7" fill="#fff" opacity="0.3" />
      </g>
      {/* Eye glow outer right (animated flicker staggered) */}
      <g style={{animation:'ra-flicker 3s ease-in-out 1.5s infinite'}}>
        <circle cx="31" cy="22" r="7" fill="url(#ra2-bot-eyeOuter)" />
        <circle cx="31" cy="22" r="5.2" fill="#1E3A5F" />
        <circle cx="31" cy="22" r="4.5" fill="url(#ra2-bot-eyeGlow)" />
        <circle cx="31" cy="22" r="2.5" fill="#93C5FD" opacity="0.4" />
        <circle cx="29.3" cy="20.3" r="1.8" fill="#fff" opacity="0.7" />
        <circle cx="32.2" cy="23.2" r="0.7" fill="#fff" opacity="0.3" />
      </g>
      {/* Mouth - LED segment smile */}
      <rect x="15" y="31" width="18" height="5" rx="2.5" fill="#1E293B" />
      <rect x="16" y="32" width="2.5" height="3" rx="0.8" fill="#4ADE80" opacity="0.9" />
      <rect x="19.5" y="31.5" width="2.5" height="3" rx="0.8" fill="#4ADE80" opacity="0.9" transform="rotate(-8 20.75 33)" />
      <rect x="23" y="31.3" width="2.5" height="3" rx="0.8" fill="#4ADE80" opacity="0.9" />
      <rect x="26.5" y="31.5" width="2.5" height="3" rx="0.8" fill="#4ADE80" opacity="0.9" transform="rotate(8 27.75 33)" />
      <rect x="30" y="32" width="2.5" height="3" rx="0.8" fill="#4ADE80" opacity="0.9" />
      {/* Mouth glow */}
      <rect x="15" y="31" width="18" height="5" rx="2.5" fill="#4ADE80" opacity="0.1" />
      {/* Forehead indicator light */}
      <circle cx="24" cy="17" r="1.8" fill="#3B82F6" opacity="0.3" />
      <circle cx="24" cy="17" r="1.2" fill="#60A5FA" opacity="0.6" />
      <circle cx="24" cy="17" r="0.5" fill="#fff" opacity="0.8" />
    </svg>
  ),

  '👽': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra2-ali-head" cx="0.45" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#BBF7D0" />
          <stop offset="40%" stopColor="#86EFAC" />
          <stop offset="75%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#22C55E" />
        </radialGradient>
        <radialGradient id="ra2-ali-eye" cx="0.45" cy="0.4" r="0.55">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="70%" stopColor="#111827" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
        <radialGradient id="ra2-ali-highlight" cx="0.4" cy="0.25" r="0.5">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ra2-ali-spots" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Head shadow */}
      <ellipse cx="24.5" cy="26" rx="18" ry="21" fill="#16A34A" opacity="0.15" />
      {/* Head base */}
      <ellipse cx="24" cy="25" rx="18" ry="21" fill="url(#ra2-ali-head)" />
      {/* Cranium top highlight */}
      <ellipse cx="22" cy="12" rx="13" ry="9" fill="url(#ra2-ali-highlight)" />
      {/* Skin texture spots */}
      <circle cx="14" cy="16" r="3" fill="url(#ra2-ali-spots)" />
      <circle cx="32" cy="14" r="2.5" fill="url(#ra2-ali-spots)" />
      <circle cx="18" cy="38" r="2" fill="url(#ra2-ali-spots)" />
      <circle cx="30" cy="36" r="2.5" fill="url(#ra2-ali-spots)" />
      <circle cx="10" cy="28" r="2" fill="url(#ra2-ali-spots)" />
      <circle cx="37" cy="26" r="1.8" fill="url(#ra2-ali-spots)" />
      {/* Head inner shadow bottom */}
      <ellipse cx="24" cy="38" rx="14" ry="6" fill="#16A34A" opacity="0.12" />
      {/* Left eye */}
      <ellipse cx="16" cy="25" rx="7.5" ry="5" fill="url(#ra2-ali-eye)" transform="rotate(-10 16 25)" />
      <ellipse cx="16" cy="25" rx="7.5" ry="5" stroke="#111827" strokeWidth="0.3" transform="rotate(-10 16 25)" />
      {/* Left eye curved reflection (animated bob) */}
      <g style={{animation:'ra-bob 5s ease-in-out infinite'}}>
        <path d="M10.5 22.5 Q14 20 20 22" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35" />
        <ellipse cx="13" cy="23.5" rx="1.8" ry="1" fill="#fff" opacity="0.15" transform="rotate(-10 13 23.5)" />
      </g>
      {/* Right eye */}
      <ellipse cx="32" cy="25" rx="7.5" ry="5" fill="url(#ra2-ali-eye)" transform="rotate(10 32 25)" />
      <ellipse cx="32" cy="25" rx="7.5" ry="5" stroke="#111827" strokeWidth="0.3" transform="rotate(10 32 25)" />
      {/* Right eye curved reflection (animated bob staggered) */}
      <g style={{animation:'ra-bob 5s ease-in-out 2.5s infinite'}}>
        <path d="M28 22 Q34 20 37.5 22.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35" />
        <ellipse cx="35" cy="23.5" rx="1.8" ry="1" fill="#fff" opacity="0.15" transform="rotate(10 35 23.5)" />
      </g>
      {/* Nostrils */}
      <ellipse cx="22" cy="33" rx="0.9" ry="1.2" fill="#15803D" opacity="0.7" />
      <ellipse cx="26" cy="33" rx="0.9" ry="1.2" fill="#15803D" opacity="0.7" />
      {/* Mouth tiny */}
      <ellipse cx="24" cy="37" rx="2.5" ry="1.2" fill="#15803D" opacity="0.6" />
      <ellipse cx="24" cy="36.6" rx="1.5" ry="0.6" fill="#166534" opacity="0.3" />
      {/* Cranium rim highlight (animated breathe) */}
      <g style={{animation:'ra-breathe 6s ease-in-out infinite',transformOrigin:'24px 25px'}}>
        <path d="M10 18 Q24 3 38 18" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.15" />
      </g>
    </svg>
  ),

  '👻': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" style={{animation:'ra-float 4s ease-in-out infinite'}}>
      <defs>
        <radialGradient id="ra2-gho-body" cx="0.45" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="80%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>
        <radialGradient id="ra2-gho-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="70%" stopColor="#E0E7FF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id="ra2-gho-cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer glow aura */}
      <path
        d="M8 24C8 12 14 2 24 2C34 2 40 12 40 24L40 38
           C40 39 39 41 37 40C36 39 34 38 33 40C32 42 30 43 29 41
           C28 39 26 38 24 40C22 38 20 39 19 41C18 43 16 42 15 40
           C14 38 12 39 11 40C9 41 8 39 8 38Z"
        fill="url(#ra2-gho-glow)"
        transform="scale(1.06) translate(-1.4, -0.5)"
      />
      {/* Body shadow */}
      <path
        d="M10 24C10 12.5 15.5 3.5 24 3.5C32.5 3.5 38 12.5 38 24L38 38
           C38 39 37 40.5 36 39.5C35 38.5 33.5 38 32.5 40C31.5 42 29.5 42 28.5 40
           C27.5 38 25.5 38 24 40C22.5 38 20.5 38 19.5 40C18.5 42 16.5 42 15.5 40
           C14.5 38 13 38.5 12 39.5C11 40.5 10 39 10 38Z"
        fill="#CBD5E1" opacity="0.15"
        transform="translate(0.5, 0.8)"
      />
      {/* Main body */}
      <path
        d="M10 24C10 12.5 15.5 3.5 24 3.5C32.5 3.5 38 12.5 38 24L38 38
           C38 39 37 40.5 36 39.5C35 38.5 33.5 38 32.5 40C31.5 42 29.5 42 28.5 40
           C27.5 38 25.5 38 24 40C22.5 38 20.5 38 19.5 40C18.5 42 16.5 42 15.5 40
           C14.5 38 13 38.5 12 39.5C11 40.5 10 39 10 38Z"
        fill="url(#ra2-gho-body)"
      />
      {/* Body edge tint blue */}
      <path
        d="M10 24C10 12.5 15.5 3.5 24 3.5C32.5 3.5 38 12.5 38 24L38 38
           C38 39 37 40.5 36 39.5C35 38.5 33.5 38 32.5 40C31.5 42 29.5 42 28.5 40
           C27.5 38 25.5 38 24 40C22.5 38 20.5 38 19.5 40C18.5 42 16.5 42 15.5 40
           C14.5 38 13 38.5 12 39.5C11 40.5 10 39 10 38Z"
        stroke="#C7D2FE" strokeWidth="0.8" fill="none" opacity="0.5"
      />
      {/* Top highlight */}
      <ellipse cx="21" cy="10" rx="8" ry="5" fill="#fff" opacity="0.35" />
      {/* Side shadow right */}
      <path d="M34 16C36 20 37 26 37 32" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.06" />
      {/* Little hands (animated wiggle) */}
      <g style={{animation:'ra-wiggle 3s ease-in-out infinite'}}>
        <ellipse cx="9" cy="26" rx="3" ry="2.5" fill="#F1F5F9" transform="rotate(-20 9 26)" />
        <ellipse cx="8.5" cy="25.5" rx="1.5" ry="1" fill="#fff" opacity="0.3" transform="rotate(-20 8.5 25.5)" />
      </g>
      <g style={{animation:'ra-wiggle 3s ease-in-out 1.5s infinite'}}>
        <ellipse cx="39" cy="26" rx="3" ry="2.5" fill="#F1F5F9" transform="rotate(20 39 26)" />
        <ellipse cx="39.5" cy="25.5" rx="1.5" ry="1" fill="#fff" opacity="0.3" transform="rotate(20 39.5 25.5)" />
      </g>
      {/* Left eye */}
      <ellipse cx="18" cy="19" rx="4.5" ry="5.5" fill="#111827" />
      <ellipse cx="18" cy="19" rx="4.2" ry="5.2" fill="#1F2937" />
      <circle cx="16.5" cy="17" r="1.8" fill="#fff" opacity="0.8" />
      <circle cx="19.2" cy="20.5" r="0.8" fill="#fff" opacity="0.35" />
      {/* Right eye */}
      <ellipse cx="30" cy="19" rx="4.5" ry="5.5" fill="#111827" />
      <ellipse cx="30" cy="19" rx="4.2" ry="5.2" fill="#1F2937" />
      <circle cx="28.5" cy="17" r="1.8" fill="#fff" opacity="0.8" />
      <circle cx="31.2" cy="20.5" r="0.8" fill="#fff" opacity="0.35" />
      {/* Cheeks */}
      <ellipse cx="12" cy="26" rx="3.5" ry="2.2" fill="url(#ra2-gho-cheek)" />
      <ellipse cx="36" cy="26" rx="3.5" ry="2.2" fill="url(#ra2-gho-cheek)" />
      {/* Mouth "O" surprise */}
      <ellipse cx="24" cy="29" rx="3.5" ry="3.8" fill="#1F2937" opacity="0.8" />
      <ellipse cx="24" cy="28" rx="2.2" ry="1.5" fill="#374151" opacity="0.3" />
      <ellipse cx="24" cy="30.5" rx="1.5" ry="0.8" fill="#111827" opacity="0.3" />
    </svg>
  ),

  '🤡': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="ra2-clo-face" cx="0.45" cy="0.38" r="0.6">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </radialGradient>
        <radialGradient id="ra2-clo-nose" cx="0.35" cy="0.3" r="0.55">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="40%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <radialGradient id="ra2-clo-cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ra2-clo-hairL" cx="0.6" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
        <radialGradient id="ra2-clo-hairR" cx="0.4" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
      </defs>
      {/* Hair left cluster (animated wiggle) */}
      <g style={{animation:'ra-wiggle 4s ease-in-out infinite'}}>
        <circle cx="5" cy="14" r="4.5" fill="url(#ra2-clo-hairL)" />
        <circle cx="3.5" cy="20" r="5" fill="#F97316" />
        <circle cx="5" cy="26" r="4.8" fill="url(#ra2-clo-hairL)" />
        <circle cx="7" cy="10" r="3.5" fill="#FB923C" />
        <circle cx="8" cy="30" r="3.5" fill="#F97316" />
        <circle cx="3" cy="17" r="3" fill="#FDBA74" opacity="0.6" />
        {/* Hair left highlights */}
        <circle cx="4" cy="13" r="1.5" fill="#fff" opacity="0.15" />
        <circle cx="3" cy="19" r="1.2" fill="#fff" opacity="0.12" />
      </g>
      {/* Hair right cluster (animated wiggle staggered) */}
      <g style={{animation:'ra-wiggle 4s ease-in-out 2s infinite'}}>
        <circle cx="43" cy="14" r="4.5" fill="url(#ra2-clo-hairR)" />
        <circle cx="44.5" cy="20" r="5" fill="#F97316" />
        <circle cx="43" cy="26" r="4.8" fill="url(#ra2-clo-hairR)" />
        <circle cx="41" cy="10" r="3.5" fill="#FB923C" />
        <circle cx="40" cy="30" r="3.5" fill="#F97316" />
        <circle cx="45" cy="17" r="3" fill="#FDBA74" opacity="0.6" />
        {/* Hair right highlights */}
        <circle cx="44" cy="13" r="1.5" fill="#fff" opacity="0.15" />
        <circle cx="45" cy="19" r="1.2" fill="#fff" opacity="0.12" />
      </g>
      {/* Face shadow */}
      <circle cx="24.5" cy="25" r="16" fill="#CBD5E1" opacity="0.12" />
      {/* Face */}
      <circle cx="24" cy="24" r="16" fill="url(#ra2-clo-face)" />
      {/* Face edge */}
      <circle cx="24" cy="24" r="16" stroke="#E2E8F0" strokeWidth="0.6" fill="none" />
      {/* Face highlight */}
      <ellipse cx="20" cy="16" rx="8" ry="5" fill="#fff" opacity="0.25" />
      {/* Eye shadow/makeup left - purple */}
      <ellipse cx="17" cy="18" rx="5" ry="3.5" fill="#A78BFA" opacity="0.2" />
      <path d="M12 17L22 15L22 21L12 21Z" fill="#8B5CF6" opacity="0.08" />
      {/* Eye shadow/makeup right - purple */}
      <ellipse cx="31" cy="18" rx="5" ry="3.5" fill="#A78BFA" opacity="0.2" />
      <path d="M26 15L36 17L36 21L26 21Z" fill="#8B5CF6" opacity="0.08" />
      {/* Eyebrows - painted arches */}
      <path d="M12 13 Q14.5 8.5 20 12" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M28 12 Q33.5 8.5 36 13" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes - iris gradient */}
      <circle cx="17" cy="19" r="3.2" fill="#1E293B" />
      <circle cx="17" cy="19" r="2.5" fill="#334155" />
      <circle cx="17" cy="19" r="1.5" fill="#1E293B" />
      <circle cx="15.8" cy="17.8" r="1.2" fill="#fff" opacity="0.85" />
      <circle cx="18" cy="19.8" r="0.5" fill="#fff" opacity="0.35" />
      <circle cx="31" cy="19" r="3.2" fill="#1E293B" />
      <circle cx="31" cy="19" r="2.5" fill="#334155" />
      <circle cx="31" cy="19" r="1.5" fill="#1E293B" />
      <circle cx="29.8" cy="17.8" r="1.2" fill="#fff" opacity="0.85" />
      <circle cx="32" cy="19.8" r="0.5" fill="#fff" opacity="0.35" />
      {/* Nose (animated glow) */}
      <g style={{animation:'ra-glow 3s ease-in-out infinite'}}>
        <circle cx="24" cy="25" r="4.5" fill="url(#ra2-clo-nose)" />
        <circle cx="22.3" cy="23.3" r="1.5" fill="#fff" opacity="0.4" />
        <circle cx="23" cy="24.2" r="0.5" fill="#fff" opacity="0.2" />
      </g>
      {/* Cheeks */}
      <circle cx="11" cy="27" r="3.5" fill="url(#ra2-clo-cheek)" />
      <circle cx="37" cy="27" r="3.5" fill="url(#ra2-clo-cheek)" />
      {/* Mouth - big painted smile */}
      <path
        d="M13 31 Q16 39 24 39 Q32 39 35 31"
        fill="#EF4444" opacity="0.85"
      />
      <path
        d="M13 31 Q16 39 24 39 Q32 39 35 31"
        stroke="#DC2626" strokeWidth="0.8" fill="none"
      />
      {/* Mouth highlight */}
      <path
        d="M15 32 Q19 34 24 34 Q29 34 33 32"
        fill="#FCA5A5" opacity="0.35"
      />
      {/* Teeth hint */}
      <path d="M18 33L18 35" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <path d="M22 33.5L22 36" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <path d="M26 33.5L26 36" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      <path d="M30 33L30 35" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
      {/* Bow tie at chin */}
      <path d="M20 40L24 42L28 40L24 44Z" fill="#FBBF24" />
      <path d="M20 40L24 42L28 40L24 44Z" fill="#F59E0B" opacity="0.4" />
      <circle cx="24" cy="42" r="1.2" fill="#EAB308" />
      <circle cx="23.5" cy="41.5" r="0.4" fill="#fff" opacity="0.3" />
    </svg>
  ),

  '🤠': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ra2-cow-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="ra2-cow-face" cx="0.45" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#FEFCE8" />
          <stop offset="40%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D4A574" />
        </radialGradient>
        <linearGradient id="ra2-cow-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="ra2-cow-hatTop" cx="0.45" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
        <linearGradient id="ra2-cow-scarf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      {/* Hat (animated sway) */}
      <g style={{animation:'ra-sway 6s ease-in-out infinite',transformOrigin:'24px 17px'}}>
        {/* Hat brim shadow */}
        <ellipse cx="24.5" cy="18.5" rx="22" ry="5.5" fill="#78350F" opacity="0.2" />
        {/* Hat brim */}
        <ellipse cx="24" cy="17.5" rx="22" ry="5" fill="url(#ra2-cow-hat)" />
        {/* Hat brim edge highlight */}
        <ellipse cx="24" cy="16" rx="20" ry="2.5" fill="#D97706" opacity="0.3" />
        {/* Hat brim underside shadow */}
        <ellipse cx="24" cy="19" rx="18" ry="3" fill="#78350F" opacity="0.15" />
        {/* Hat crown */}
        <path
          d="M14 17.5C14 17.5 13 7 24 5C35 7 34 17.5 34 17.5"
          fill="url(#ra2-cow-hatTop)"
        />
        {/* Hat crease/pinch */}
        <path d="M16 10 Q24 7.5 32 10" stroke="#78350F" strokeWidth="0.6" fill="none" opacity="0.4" />
        {/* Hat top highlight */}
        <path d="M17 9 Q20 7 24 7.5" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
        {/* Hat crown shadow right */}
        <path d="M28 8C30 10 32 14 33 17" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.1" />
        {/* Hat band */}
        <rect x="14" y="14.5" width="20" height="3.5" rx="1" fill="url(#ra2-cow-band)" />
        {/* Band buckle */}
        <rect x="22" y="14.8" width="4" height="3" rx="0.8" fill="#D97706" stroke="#92400E" strokeWidth="0.4" />
        <rect x="23" y="15.3" width="2" height="2" rx="0.4" fill="#FBBF24" />
        <circle cx="24" cy="16.3" r="0.4" fill="#fff" opacity="0.3" />
      </g>
      {/* Face */}
      <circle cx="24" cy="31" r="14" fill="url(#ra2-cow-face)" />
      {/* Face shadow */}
      <ellipse cx="24" cy="21" rx="13" ry="3" fill="#92400E" opacity="0.08" />
      {/* Face side shadow */}
      <path d="M12 28C11 32 12 36 14 38" stroke="#C68B59" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.1" />
      <path d="M36 28C37 32 36 36 34 38" stroke="#C68B59" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.1" />
      {/* Eyes - happy squints (animated blink) */}
      <g style={{animation:'ra-blink 5s ease-in-out infinite',transformOrigin:'24px 27px'}}>
        <path d="M16 28 Q18 25.5 21 28" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M27 28 Q29 25.5 32 28" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Eye crinkle lines */}
        <path d="M14.5 27L15.5 26" stroke="#92400E" strokeWidth="0.5" strokeLinecap="round" opacity="0.3" />
        <path d="M33.5 27L32.5 26" stroke="#92400E" strokeWidth="0.5" strokeLinecap="round" opacity="0.3" />
      </g>
      {/* Cheeks warm */}
      <ellipse cx="14" cy="33" rx="3" ry="2" fill="#F59E0B" opacity="0.2" />
      <ellipse cx="34" cy="33" rx="3" ry="2" fill="#F59E0B" opacity="0.2" />
      {/* Mustache - thick and full */}
      <path
        d="M16 35C16 33 19 31.5 24 34C29 31.5 32 33 32 35C32 36.5 29 36.5 26 35C25 34.5 23 34.5 22 35C19 36.5 16 36.5 16 35Z"
        fill="#5C2D0E"
      />
      {/* Mustache highlight */}
      <path d="M18 34 Q21 33 24 34" stroke="#78350F" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M24 34 Q27 33 30 34" stroke="#78350F" strokeWidth="0.5" fill="none" opacity="0.4" />
      {/* Smile under mustache */}
      <path d="M20 37.5 Q24 40 28 37.5" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Bandana/scarf at neck */}
      <path d="M14 43 Q18 41 24 42 Q30 41 34 43 L32 46 L24 44.5 L16 46 Z" fill="url(#ra2-cow-scarf)" />
      <path d="M16 43.5 Q24 42 32 43.5" stroke="#FCA5A5" strokeWidth="0.4" fill="none" opacity="0.3" />
      {/* Bandana knot */}
      <circle cx="24" cy="43.5" r="1.5" fill="#DC2626" />
      <circle cx="23.5" cy="43" r="0.5" fill="#fff" opacity="0.2" />
    </svg>
  ),

  '👸': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ra2-pri-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <radialGradient id="ra2-pri-hair" cx="0.45" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
        <radialGradient id="ra2-pri-face" cx="0.45" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="50%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#FECDD3" />
        </radialGradient>
        <radialGradient id="ra2-pri-ruby" cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <radialGradient id="ra2-pri-sapphire" cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </radialGradient>
        <radialGradient id="ra2-pri-emerald" cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#16A34A" />
        </radialGradient>
        <radialGradient id="ra2-pri-eyeL" cx="0.4" cy="0.35" r="0.5">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0E7490" />
        </radialGradient>
        <radialGradient id="ra2-pri-cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Hair behind - long flowing */}
      <path d="M7 22C7 22 5 42 10 46L16 47L24 47L32 47L38 46C43 42 41 22 41 22" fill="url(#ra2-pri-hair)" />
      {/* Hair behind wave details */}
      <path d="M9 30 Q10 35 12 40" stroke="#6B2F0A" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M11 28 Q12 34 13 42" stroke="#6B2F0A" strokeWidth="0.6" fill="none" opacity="0.2" />
      <path d="M39 30 Q38 35 36 40" stroke="#6B2F0A" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M37 28 Q36 34 35 42" stroke="#6B2F0A" strokeWidth="0.6" fill="none" opacity="0.2" />
      {/* Earring left (animated bob) */}
      <g style={{animation:'ra-bob 3s ease-in-out infinite'}}>
        <circle cx="10.5" cy="32" r="1.8" fill="#F1F5F9" />
        <circle cx="10.5" cy="32" r="1.3" fill="#E2E8F0" />
        <circle cx="10" cy="31.5" r="0.5" fill="#fff" opacity="0.6" />
      </g>
      {/* Earring right (animated bob staggered) */}
      <g style={{animation:'ra-bob 3s ease-in-out 1.5s infinite'}}>
        <circle cx="37.5" cy="32" r="1.8" fill="#F1F5F9" />
        <circle cx="37.5" cy="32" r="1.3" fill="#E2E8F0" />
        <circle cx="37" cy="31.5" r="0.5" fill="#fff" opacity="0.6" />
      </g>
      {/* Face shadow */}
      <circle cx="24.5" cy="29.5" r="13" fill="#D4A574" opacity="0.1" />
      {/* Face */}
      <circle cx="24" cy="29" r="13" fill="url(#ra2-pri-face)" />
      {/* Face highlight */}
      <ellipse cx="21" cy="23" rx="6" ry="4" fill="#fff" opacity="0.2" />
      {/* Hair on sides - curving strands */}
      <path d="M11 21C11 21 9.5 30 11 37C12 34 11.5 26 13 22Z" fill="#78350F" />
      <path d="M12 20C12 20 10.5 28 11.5 34" stroke="#92400E" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M37 21C37 21 38.5 30 37 37C36 34 36.5 26 35 22Z" fill="#78350F" />
      <path d="M36 20C36 20 37.5 28 36.5 34" stroke="#92400E" strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Hair top */}
      <path d="M12 22C12 14 17 10 24 10C31 10 36 14 36 22C34 17 29 15 24 15C19 15 14 17 12 22Z" fill="url(#ra2-pri-hair)" />
      {/* Hair top strands */}
      <path d="M15 18 Q17 14 20 15" stroke="#92400E" strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M22 14 Q24 12 26 14" stroke="#92400E" strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M28 15 Q31 14 33 18" stroke="#92400E" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Crown shadow */}
      <path d="M13 13.5L15 4.5L19 10.5L24 2.5L29 10.5L33 4.5L35 13.5Z" fill="#A16207" opacity="0.2" transform="translate(0.3, 0.3)" />
      {/* Crown */}
      <path
        d="M13 13L15 4L19 10L24 2L29 10L33 4L35 13Z"
        fill="url(#ra2-pri-crown)"
        stroke="#A16207" strokeWidth="0.5"
      />
      {/* Crown base band */}
      <rect x="13" y="12" width="22" height="2" rx="0.5" fill="#EAB308" stroke="#A16207" strokeWidth="0.3" />
      {/* Crown highlight */}
      <path d="M15 5 L17 8" stroke="#FEF9C3" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      <path d="M24 3 L24 6" stroke="#FEF9C3" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      <path d="M33 5 L31 8" stroke="#FEF9C3" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
      {/* Crown gems (animated glow staggered) */}
      <g style={{animation:'ra-glow 4s ease-in-out infinite'}}>
        <circle cx="19" cy="9" r="1.8" fill="url(#ra2-pri-ruby)" />
        <circle cx="18.4" cy="8.3" r="0.6" fill="#fff" opacity="0.55" />
      </g>
      <g style={{animation:'ra-glow 4s ease-in-out 1.3s infinite'}}>
        <circle cx="24" cy="5.5" r="2" fill="url(#ra2-pri-sapphire)" />
        <circle cx="23.3" cy="4.8" r="0.7" fill="#fff" opacity="0.55" />
      </g>
      <g style={{animation:'ra-glow 4s ease-in-out 2.6s infinite'}}>
        <circle cx="29" cy="9" r="1.8" fill="url(#ra2-pri-emerald)" />
        <circle cx="28.4" cy="8.3" r="0.6" fill="#fff" opacity="0.55" />
      </g>
      {/* Eyes - large kawaii with iris gradient */}
      <ellipse cx="19" cy="28" rx="3" ry="3.5" fill="#0E7490" />
      <ellipse cx="19" cy="28" rx="2.8" ry="3.3" fill="url(#ra2-pri-eyeL)" />
      <circle cx="19" cy="28" r="1.5" fill="#0E7490" />
      <circle cx="17.8" cy="26.8" r="1.3" fill="#fff" opacity="0.85" />
      <circle cx="20" cy="29" r="0.5" fill="#fff" opacity="0.35" />
      <ellipse cx="29" cy="28" rx="3" ry="3.5" fill="#0E7490" />
      <ellipse cx="29" cy="28" rx="2.8" ry="3.3" fill="url(#ra2-pri-eyeL)" />
      <circle cx="29" cy="28" r="1.5" fill="#0E7490" />
      <circle cx="27.8" cy="26.8" r="1.3" fill="#fff" opacity="0.85" />
      <circle cx="30" cy="29" r="0.5" fill="#fff" opacity="0.35" />
      {/* Eyelashes - curved lines */}
      <path d="M15.5 25L14.5 23.5" stroke="#1F2937" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M16.5 24.5L15.8 22.8" stroke="#1F2937" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M17.5 24.2L17.2 22.5" stroke="#1F2937" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M18.5 24L18.5 22.3" stroke="#1F2937" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M29.5 24L29.5 22.3" stroke="#1F2937" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M30.5 24.2L30.8 22.5" stroke="#1F2937" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M31.5 24.5L32.2 22.8" stroke="#1F2937" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M32.5 25L33.5 23.5" stroke="#1F2937" strokeWidth="0.7" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="14" cy="32" rx="3" ry="2" fill="url(#ra2-pri-cheek)" />
      <ellipse cx="34" cy="32" rx="3" ry="2" fill="url(#ra2-pri-cheek)" />
      {/* Nose subtle */}
      <path d="M23 32 L24 33.5 L25 32" stroke="#E8B4A0" strokeWidth="0.7" strokeLinecap="round" fill="none" />
      {/* Lips */}
      <path d="M21 35.5 Q22.5 36.5 24 36 Q25.5 36.5 27 35.5" stroke="#F43F5E" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M21.5 35.8 Q24 38 26.5 35.8" fill="#FDA4AF" opacity="0.5" />
      {/* Lip gloss highlight */}
      <ellipse cx="23.5" cy="36.2" rx="1" ry="0.4" fill="#fff" opacity="0.25" />
    </svg>
  ),

  '🤴': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ra2-prn-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <radialGradient id="ra2-prn-hair" cx="0.45" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#5C2D0E" />
        </radialGradient>
        <radialGradient id="ra2-prn-face" cx="0.45" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="50%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#FED7AA" />
        </radialGradient>
        <radialGradient id="ra2-prn-eyeL" cx="0.4" cy="0.35" r="0.5">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
        <linearGradient id="ra2-prn-collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <radialGradient id="ra2-prn-gem" cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
      </defs>
      {/* Collar/high neck */}
      <path d="M14 42L17 38L24 39.5L31 38L34 42L35 47L13 47Z" fill="url(#ra2-prn-collar)" />
      <path d="M14.5 42L17.5 38.5L24 40L30.5 38.5L33.5 42" stroke="#1E40AF" strokeWidth="0.5" fill="none" />
      {/* Collar gold trim */}
      <path d="M15 42 Q24 40.5 33 42" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M15.5 43 Q24 41.5 32.5 43" stroke="#EAB308" strokeWidth="0.5" strokeLinecap="round" fill="none" />
      {/* Face shadow */}
      <circle cx="24.4" cy="29.4" r="13" fill="#C68B59" opacity="0.1" />
      {/* Face */}
      <circle cx="24" cy="29" r="13" fill="url(#ra2-prn-face)" />
      {/* Face highlight */}
      <ellipse cx="21" cy="23" rx="5" ry="3.5" fill="#fff" opacity="0.18" />
      {/* Jaw definition subtle */}
      <path d="M14 34 Q24 42 34 34" stroke="#D4A574" strokeWidth="0.5" fill="none" opacity="0.2" />
      {/* Hair base */}
      <path
        d="M11 24C11 15 16 11 24 11C32 11 37 15 37 24C37 21 33 14 24 14C15 14 11 21 11 24Z"
        fill="url(#ra2-prn-hair)"
      />
      {/* Hair strands/bangs swept to one side */}
      <path d="M14 22C14 18 16 15 20 14L17 13C14 14 12 17 12 22Z" fill="#78350F" />
      <path d="M16 20C16 17 18 14.5 22 14L19 13C16 14 14 16 14 20Z" fill="#6B2F0A" opacity="0.5" />
      <path d="M36 23C36 19 34 16 30 15L33 14C36 15 37 18 37 23Z" fill="#78350F" />
      {/* Hair highlight */}
      <path d="M16 16 Q19 13 24 13" stroke="#A16207" strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Crown shadow */}
      <path d="M16.3 14L18.3 7.5L21.3 11.5L24.3 5.5L27.3 11.5L30.3 7.5L32.3 14Z" fill="#A16207" opacity="0.15" />
      {/* Crown */}
      <path
        d="M16 13.5L18 7L21 11L24 5L27 11L30 7L32 13.5Z"
        fill="url(#ra2-prn-crown)"
        stroke="#A16207" strokeWidth="0.5"
      />
      {/* Crown base band */}
      <rect x="16" y="12.5" width="16" height="2" rx="0.5" fill="#EAB308" stroke="#A16207" strokeWidth="0.3" />
      {/* Crown highlight */}
      <path d="M18 8 L19.5 10" stroke="#FEF9C3" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
      <path d="M24 6 L24 8" stroke="#FEF9C3" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
      {/* Crown central gem (animated glow) */}
      <g style={{animation:'ra-glow 4s ease-in-out infinite'}}>
        <circle cx="24" cy="8.5" r="2" fill="url(#ra2-prn-gem)" />
        <circle cx="23.3" cy="7.8" r="0.7" fill="#fff" opacity="0.5" />
        <circle cx="24.3" cy="9" r="0.3" fill="#fff" opacity="0.25" />
      </g>
      {/* Eyes - determined, blue iris (animated subtle blink) */}
      <g style={{animation:'ra-blink 6s ease-in-out infinite',transformOrigin:'24px 28px'}}>
        <ellipse cx="19" cy="28" rx="2.5" ry="2.8" fill="#1D4ED8" />
        <ellipse cx="19" cy="28" rx="2.3" ry="2.6" fill="url(#ra2-prn-eyeL)" />
        <circle cx="19" cy="28" r="1.3" fill="#1D4ED8" />
        <circle cx="18" cy="27" r="1" fill="#fff" opacity="0.8" />
        <circle cx="19.8" cy="28.8" r="0.4" fill="#fff" opacity="0.3" />
        <ellipse cx="29" cy="28" rx="2.5" ry="2.8" fill="#1D4ED8" />
        <ellipse cx="29" cy="28" rx="2.3" ry="2.6" fill="url(#ra2-prn-eyeL)" />
        <circle cx="29" cy="28" r="1.3" fill="#1D4ED8" />
        <circle cx="28" cy="27" r="1" fill="#fff" opacity="0.8" />
        <circle cx="29.8" cy="28.8" r="0.4" fill="#fff" opacity="0.3" />
      </g>
      {/* Eyebrows - straight and firm */}
      <path d="M15.5 24.5L21 24" stroke="#5C2D0E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 24L32.5 24.5" stroke="#5C2D0E" strokeWidth="1.5" strokeLinecap="round" />
      {/* Nose */}
      <path d="M23 31L24 33L25 31" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Smile - subtle and confident */}
      <path d="M20 35.5 Q24 38 28 35.5" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Smile highlight */}
      <path d="M21 36 Q24 37 27 36" fill="#fff" opacity="0.15" />
    </svg>
  ),

  '🦸': () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="ra2-her-cape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="ra2-her-mask" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <radialGradient id="ra2-her-hair" cx="0.4" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
        <radialGradient id="ra2-her-face" cx="0.45" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="50%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#FECDD3" />
        </radialGradient>
        <radialGradient id="ra2-her-eyeGlow" cx="0.45" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </radialGradient>
        <radialGradient id="ra2-her-star" cx="0.4" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
      </defs>
      {/* Cape behind - left (animated sway) */}
      <g style={{animation:'ra-sway 5s ease-in-out infinite',transformOrigin:'9px 22px'}}>
        <path d="M4 36L9 22L10 42L5 47Z" fill="url(#ra2-her-cape)" />
        <path d="M5 36L9 24L9.5 38" stroke="#1D4ED8" strokeWidth="0.8" fill="none" opacity="0.3" />
        <path d="M7 30L9 25L9 35" fill="#93C5FD" opacity="0.15" />
      </g>
      {/* Cape behind - right (animated sway staggered) */}
      <g style={{animation:'ra-sway 5s ease-in-out 2.5s infinite',transformOrigin:'39px 22px'}}>
        <path d="M44 36L39 22L38 42L43 47Z" fill="url(#ra2-her-cape)" />
        <path d="M43 36L39 24L38.5 38" stroke="#1D4ED8" strokeWidth="0.8" fill="none" opacity="0.3" />
        <path d="M41 30L39 25L39 35" fill="#93C5FD" opacity="0.15" />
      </g>
      {/* Chest/suit area at bottom */}
      <rect x="15" y="40" width="18" height="8" rx="2" fill="#2563EB" />
      <rect x="15" y="40" width="18" height="3" rx="1" fill="#3B82F6" opacity="0.4" />
      {/* Star emblem on chest */}
      <polygon points="24,41 25.2,43.5 28,43.8 26,45.5 26.5,48 24,46.8 21.5,48 22,45.5 20,43.8 22.8,43.5" fill="url(#ra2-her-star)" />
      <polygon points="24,42 24.8,43.5 26.5,43.7 25.2,44.8 25.5,46.5 24,45.7 22.5,46.5 22.8,44.8 21.5,43.7 23.2,43.5" fill="#FEF9C3" opacity="0.3" />
      {/* Face shadow */}
      <circle cx="24.4" cy="26.4" r="14" fill="#D4A574" opacity="0.08" />
      {/* Face */}
      <circle cx="24" cy="26" r="14" fill="url(#ra2-her-face)" />
      {/* Jaw - strong, square-ish */}
      <path d="M12 31 Q14 40 24 42 Q34 40 36 31" fill="url(#ra2-her-face)" />
      {/* Jaw shadow */}
      <path d="M14 34 Q24 42 34 34" stroke="#D4A574" strokeWidth="0.5" fill="none" opacity="0.15" />
      {/* Face highlight */}
      <ellipse cx="20" cy="20" rx="6" ry="4" fill="#fff" opacity="0.15" />
      {/* Hair base - windswept */}
      <path
        d="M10 20C10 12 16 6 24 6C32 6 38 12 38 20C36 15 30 12 24 12C18 12 12 15 10 20Z"
        fill="url(#ra2-her-hair)"
      />
      {/* Hair wind strands left */}
      <path d="M10 20C8 14 5 10 3 7" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M11 18C8 13 6 10 4 6" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M12 16C10 12 8 9 6 5" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Hair wind strands right */}
      <path d="M38 20C40 15 42 11 44 8" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Hair highlight */}
      <path d="M14 12 Q20 9 28 10" stroke="#FEF9C3" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* Mask */}
      <path
        d="M10 22L13 19L18 22L24 20L30 22L35 19L38 22L36 27L33 25L29 27L24 25L19 27L15 25L12 27Z"
        fill="url(#ra2-her-mask)"
      />
      {/* Mask highlight top */}
      <path d="M12 21L18 22L24 20.5L30 22L36 21" stroke="#FCA5A5" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Mask edges sharp */}
      <path d="M10 22L12 27" stroke="#B91C1C" strokeWidth="0.5" />
      <path d="M38 22L36 27" stroke="#B91C1C" strokeWidth="0.5" />
      {/* Eye holes in mask */}
      <ellipse cx="18" cy="24" rx="3.8" ry="3.2" fill="url(#ra2-her-face)" />
      <ellipse cx="30" cy="24" rx="3.8" ry="3.2" fill="url(#ra2-her-face)" />
      {/* Eyes - glowing through mask (animated glow) */}
      <g style={{animation:'ra-glow 3s ease-in-out infinite'}}>
        <ellipse cx="18" cy="24" rx="2.2" ry="2.5" fill="#0C4A6E" />
        <ellipse cx="18" cy="24" rx="2" ry="2.3" fill="url(#ra2-her-eyeGlow)" />
        <circle cx="18" cy="24" r="1.2" fill="#0EA5E9" opacity="0.6" />
        <circle cx="17" cy="23" r="0.9" fill="#fff" opacity="0.85" />
        <circle cx="18.8" cy="24.8" r="0.4" fill="#fff" opacity="0.3" />
      </g>
      <g style={{animation:'ra-glow 3s ease-in-out 1.5s infinite'}}>
        <ellipse cx="30" cy="24" rx="2.2" ry="2.5" fill="#0C4A6E" />
        <ellipse cx="30" cy="24" rx="2" ry="2.3" fill="url(#ra2-her-eyeGlow)" />
        <circle cx="30" cy="24" r="1.2" fill="#0EA5E9" opacity="0.6" />
        <circle cx="29" cy="23" r="0.9" fill="#fff" opacity="0.85" />
        <circle cx="30.8" cy="24.8" r="0.4" fill="#fff" opacity="0.3" />
      </g>
      {/* Determined eyebrows over mask */}
      <path d="M13.5 19L19 18" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M29 18L34.5 19" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" />
      {/* Nose */}
      <path d="M23 29L24 31.5L25 29" stroke="#E8B89D" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Heroic grin with teeth */}
      <path d="M19 35 Q24 39 29 35" stroke="#92400E" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M20 35.5 Q24 37.5 28 35.5" fill="#fff" opacity="0.55" />
      {/* Chin definition */}
      <path d="M22 39L24 40.5L26 39" stroke="#D4A574" strokeWidth="0.4" fill="none" opacity="0.2" />
    </svg>
  ),
};

export default avatars2;
