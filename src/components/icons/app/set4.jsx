// Iconos de app — set 4 (cuerpo humano).
// IDS de este set: explorador-cuerpo, huesos-musculos, viaje-cuerpo, anatomia-3d
// Contrato y guía: src/components/art/README.md (sin filtros ni SMIL, ids con
// useArtIds, animación solo con clases art-i-* / art-h-*).
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

const TileBg = ({ c, vig = c[2], gloss = 0.32 }) => {
  const [id, url] = useArtIds();
  return (
    <>
      <defs>
        <linearGradient id={id('bg')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={c[0]} />
          <stop offset="52%" stopColor={c[1]} />
          <stop offset="100%" stopColor={c[2]} />
        </linearGradient>
        <radialGradient id={id('hi')} cx="0.26" cy="0.14" r="0.72">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('vig')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor={vig} stopOpacity="0" />
          <stop offset="100%" stopColor={vig} stopOpacity="0.42" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={gloss} />
      </defs>
      <rect width="48" height="48" rx="12" fill={url('bg')} />
      <rect width="48" height="48" rx="12" fill={url('hi')} />
      <rect width="48" height="48" rx="12" fill={url('vig')} />
      <path d="M2 14C2 7 7 2 14 2H34C41 2 46 7 46 14V16C34 13 14 13 2 17Z" fill={url('gloss')} />
    </>
  );
};

const TileRim = ({ shade = '#000' }) => (
  <>
    <rect x="0.4" y="0.4" width="47.2" height="47.2" rx="11.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
    <path d="M4.6 41.6C6.6 45 9.2 46.5 12.6 46.5H35.4C38.8 46.5 41.4 45 43.4 41.6" stroke={shade} strokeOpacity="0.16" strokeWidth="0.8" strokeLinecap="round" />
  </>
);

/* ======================================================================
   1. Explorador del Cuerpo Humano — torso holográfico sobre la peana del
   escáner con los pulmones y el corazón dentro, y la chincheta de la familia
   "Explorador". Reposo: el corazón late. Hover: la chincheta salta y el
   corazón da un latido fuerte.
   ====================================================================== */
const ExploradorCuerpo = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id('holo')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CFFAFE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0E7490" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id={id('holoIn')} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#164E63" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#083344" stopOpacity="0.85" />
        </radialGradient>
        <MaterialGradient id={id('lung')} light="#FFE4E6" base="#F9A8D4" dark="#BE185D" />
        <MaterialGradient id={id('heart')} light="#FECACA" base="#EF4444" dark="#7F1D1D" />
        <MaterialGradient id={id('pin')} light="#FEF3C7" base="#F59E0B" dark="#92400E" />
        <MaterialGradient id={id('base')} light="#A5F3FC" base="#0891B2" dark="#164E63" />
        <ShadowGradient id={id('ground')} color="#0C4A6E" opacity={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.55} />
      </defs>
      <TileBg c={['#A5F3FC', '#22D3EE', '#DB2777']} vig="#831843" />

      {/* peana del escáner */}
      <ellipse cx="22" cy="43.6" rx="13" ry="2" fill={url('ground')} />
      <ellipse cx="22" cy="40.6" rx="12" ry="3" fill={url('base')} />
      <ellipse cx="22" cy="39.8" rx="9.6" ry="1.9" stroke="#CFFAFE" strokeOpacity="0.8" strokeWidth="0.7" />

      {/* torso holográfico */}
      <path d="M22 5.6C25.3 5.6 27.4 8 27.4 11C27.4 13.3 26.3 15 25 15.8C29.6 16.6 33.4 18.6 33.6 22.6L32.8 39H11.2L10.4 22.6C10.6 18.6 14.4 16.6 19 15.8C17.7 15 16.6 13.3 16.6 11C16.6 8 18.7 5.6 22 5.6Z" fill={url('holoIn')} stroke={url('holo')} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12.6 21.8C13 19.6 15.4 18 18.6 17.2" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M14 27.8H30M13.6 32.6H30.4" stroke="#67E8F9" strokeOpacity="0.35" strokeWidth="0.5" strokeDasharray="1.2 1.4" />

      {/* pulmones */}
      <path d="M20.6 19.4C17.2 19 14.6 22.4 14.4 27C14.3 29.6 15.4 31 17.4 30.4C19.4 29.8 20.8 27.6 20.8 24.6Z" fill={url('lung')} />
      <path d="M23.4 19.4C26.8 19 29.4 22.4 29.6 27C29.7 29.6 28.6 31 26.6 30.4C24.6 29.8 23.2 27.6 23.2 24.6Z" fill={url('lung')} />
      <path d="M22 15.6V20.6M22 20.6L20.4 22.4M22 20.6L23.6 22.4" stroke="#FCE7F3" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="16.6" cy="22.6" rx="1.2" ry="2" fill="#fff" opacity="0.5" transform="rotate(18 16.6 22.6)" />

      {/* corazón */}
      <g className="art-i-pulse" style={{ '--amp': '1.12', '--dur': '1.1s' }}>
        <g className="art-h-pop" style={{ '--pop': '1.22' }}>
          <path d="M22.9 23.6C23.9 22.2 26.4 22.5 26.4 24.8C26.4 27 24.2 28.6 22.6 30C21 28.6 18.8 27 18.8 24.8C18.8 22.5 21.3 22.2 22.3 23.6Z" fill={url('heart')} stroke="#7F1D1D" strokeOpacity="0.4" strokeWidth="0.5" />
          <ellipse cx="20.6" cy="24.4" rx="0.9" ry="0.6" fill="#fff" opacity="0.7" />
        </g>
      </g>

      {/* chincheta "Explorador" */}
      <g className="art-h-jump art-o-bottom" style={{ '--jump': '-5px' }}>
        <ellipse cx="35.4" cy="16.6" rx="1.5" ry="0.6" fill="#083344" opacity="0.4" />
        <path d="M38 12.4L35.4 16.4" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
        <circle cx="38.9" cy="9.6" r="3.5" fill={url('pin')} />
        <circle cx="37.8" cy="8.5" r="1.1" fill="#fff" opacity="0.85" />
      </g>
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={38.9} y={9.6} r={4} fill="#FEF3C7" /></g>
      <TileRim shade="#831843" />
    </svg>
  );
};

/* ======================================================================
   2. Huesos y Músculos — un fémur de marfil cruzado con un brazo que hace
   fuerza (bíceps rojo con fibras). Reposo: destello. Hover: el antebrazo se
   flexiona y el bíceps se hincha.
   ====================================================================== */
const HuesosMusculos = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <MaterialGradient id={id('bone')} light="#FFFBEB" base="#F5E6C8" dark="#A8875A" />
        <MaterialGradient id={id('muscle')} light="#FCA5A5" base="#DC2626" dark="#7F1D1D" />
        <MaterialGradient id={id('skin')} light="#FED7AA" base="#F59E0B" dark="#9A3412" />
        <ShadowGradient id={id('ground')} color="#7C2D12" opacity={0.45} />
        <GlossGradient id={id('gloss')} opacity={0.6} />
      </defs>
      <TileBg c={['#FEF3C7', '#FBBF24', '#EA580C']} vig="#7C2D12" />
      <ellipse cx="25" cy="43.6" rx="15" ry="2" fill={url('ground')} />

      {/* fémur en diagonal, detrás */}
      <g transform="rotate(42 21 19)">
        <rect x="8" y="16.9" width="26" height="4.2" rx="2.1" fill={url('bone')} />
        <circle cx="7.6" cy="16.8" r="3.1" fill={url('bone')} />
        <circle cx="7.6" cy="21.2" r="3.1" fill={url('bone')} />
        <circle cx="34.4" cy="16.8" r="3.1" fill={url('bone')} />
        <circle cx="34.4" cy="21.2" r="3.1" fill={url('bone')} />
        <path d="M9 17.6H33" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M9 20.4H33" stroke="#8A6F4E" strokeOpacity="0.35" strokeWidth="0.7" strokeLinecap="round" />
      </g>

      {/* brazo flexionado haciendo fuerza, delante */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-6deg' }}>
        <path d="M10.4 41C10.6 37.4 13 34.8 16.6 34.4L31.4 33.4C33 33.3 34.2 34.7 33.8 36.2L33.2 38.6C32.8 40.2 31.4 41.2 29.8 41.2Z" fill={url('skin')} />
        <path d="M30.6 35C31.6 30.6 32.6 26.6 33.4 22.6L38.2 23.6C37.6 27.8 36.4 32 35 36.4Z" fill={url('skin')} />
        <rect x="32.2" y="15.2" width="7.6" height="8.8" rx="3.2" fill={url('skin')} />
        <path d="M33.4 17.8H38.6M33.4 20.2H38.6" stroke="#9A3412" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M13.4 37.4C14 37 15 36.8 16 36.8" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
        <g className="art-h-pop art-o-bottom" style={{ '--pop': '1.14' }}>
          <path d="M15.4 34.8C16.2 29.6 20.4 26.6 25 27.4C28.6 28 30.6 30.8 30.2 33.6C26 35.2 19.6 35.4 15.4 34.8Z" fill={url('muscle')} />
          <path d="M18 32.8C20.2 31.2 23.8 30.8 27.6 31.4M19.4 30.4C21.4 29.4 24.2 29.2 26.6 29.8" stroke="#7F1D1D" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
          <ellipse cx="21.8" cy="29.4" rx="3" ry="1" fill="#fff" opacity="0.5" transform="rotate(-10 21.8 29.4)" />
        </g>
      </g>

      <Sparkle x={41} y={9.4} r={2} idle delay={0.4} />
      <TileRim shade="#7C2D12" />
    </svg>
  );
};

/* ======================================================================
   3. Viaje por el Cuerpo — el robot de la plataforma, diminuto, viaja dentro
   de un vaso sanguíneo entre glóbulos rojos. Reposo: el robot flota.
   Hover: el robot avanza y los glóbulos se desplazan.
   ====================================================================== */
const ViajeCuerpo = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id('vessel')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="45%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id={id('lumen')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#450A0A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0.9" />
        </linearGradient>
        <MaterialGradient id={id('rbc')} light="#FECACA" base="#EF4444" dark="#991B1B" />
        <MaterialGradient id={id('head')} light="#C7D2FE" base="#6366F1" dark="#312E81" />
        <linearGradient id={id('visor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <ShadowGradient id={id('ground')} color="#2E1065" opacity={0.4} />
      </defs>
      <TileBg c={['#DDD6FE', '#A78BFA', '#0891B2']} vig="#2E1065" />

      {/* vaso sanguíneo curvo */}
      <path d="M-2 33C8 26 16 36 26 30C34 25.4 40 18 50 20V31C40 29 35 35 27 39.6C16 46 8 37 -2 44Z" fill={url('vessel')} />
      <path d="M-2 35.6C8 29 16 39 26 33C34 28.4 40 21 50 23V28.6C40 26.6 35 32.4 27 36.8C16 43 8 34.4 -2 41Z" fill={url('lumen')} />
      <path d="M-2 33C8 26 16 36 26 30C34 25.4 40 18 50 20" stroke="#FEE2E2" strokeOpacity="0.6" strokeWidth="0.8" />

      {/* glóbulos rojos */}
      <g className="art-h-slide" style={{ '--slide': '-3px' }}>
        <ellipse cx="9" cy="37.6" rx="3" ry="1.9" fill={url('rbc')} />
        <ellipse cx="9" cy="37.6" rx="1.3" ry="0.7" fill="#991B1B" opacity="0.55" />
        <ellipse cx="38" cy="27.4" rx="2.8" ry="1.8" fill={url('rbc')} transform="rotate(-20 38 27.4)" />
        <ellipse cx="38" cy="27.4" rx="1.2" ry="0.6" fill="#991B1B" opacity="0.55" transform="rotate(-20 38 27.4)" />
      </g>

      {/* el robot (ver RobotMascot.jsx) */}
      <g className="art-i-bob" style={{ '--amp': '1.2px', '--dur': '2.8s' }}>
        <g className="art-h-slide" style={{ '--slide': '4px' }}>
          <ellipse cx="22.6" cy="35.2" rx="6" ry="1.2" fill={url('ground')} />
          <line x1="22.6" y1="12.6" x2="22.6" y2="16" stroke="#A5B4FC" strokeWidth="1" strokeLinecap="round" />
          <circle cx="22.6" cy="11.6" r="1.7" fill="#F472B6" stroke="#FDF2F8" strokeWidth="0.5" />
          <rect x="14.6" y="15.6" width="16" height="12.8" rx="4.4" fill={url('head')} stroke="#C7D2FE" strokeWidth="0.7" />
          <rect x="16.6" y="18" width="12" height="7.4" rx="3" fill={url('visor')} />
          <circle cx="20.2" cy="21.7" r="1.4" fill="#fff" />
          <circle cx="25.6" cy="21.6" r="1.9" fill="#fff" />
          <circle cx="20.4" cy="21.8" r="0.7" fill="#22D3EE" />
          <circle cx="25.8" cy="21.7" r="0.95" fill="#22D3EE" />
          <path d="M16 18.4C16.6 17 17.8 16.4 19.4 16.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M18.2 28.4H27L25.8 31.6H19.4Z" fill="#4F46E5" />
          <path d="M20.4 31.8L22.6 34.6L24.8 31.8Z" fill="#22D3EE" opacity="0.85" />
        </g>
      </g>
      <Sparkle x={38.6} y={10.4} r={2} idle delay={0.8} />
      <TileRim shade="#2E1065" />
    </svg>
  );
};

/* ======================================================================
   4. Anatomía 3D — un cráneo de marfil sobre la peana giratoria del escáner,
   rodeado por la órbita de giro (flecha) y la pegatina «3D». Reposo: el
   cráneo se balancea como si girara. Hover: la órbita da la vuelta y el
   cráneo se inclina.
   ====================================================================== */
const Anatomia3D = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <MaterialGradient id={id('bone')} light="#FFFBEB" base="#E9DCC0" dark="#A8875C" />
        <MaterialGradient id={id('base')} light="#A5F3FC" base="#0891B2" dark="#164E63" />
        <MaterialGradient id={id('tag')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <linearGradient id={id('orbit')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#CFFAFE" stopOpacity="0.15" />
          <stop offset="55%" stopColor="#67E8F9" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <ShadowGradient id={id('ground')} color="#1E1B4B" opacity={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.6} />
      </defs>
      <TileBg c={['#C4B5FD', '#6366F1', '#0E7490']} vig="#1E1B4B" />

      {/* peana giratoria */}
      <ellipse cx="23" cy="43.4" rx="13" ry="2" fill={url('ground')} />
      <ellipse cx="23" cy="40.4" rx="12" ry="3" fill={url('base')} />
      <ellipse cx="23" cy="39.6" rx="9.4" ry="1.8" stroke="#CFFAFE" strokeOpacity="0.8" strokeWidth="0.7" />

      {/* órbita de giro (detrás) */}
      <g className="art-h-spin" style={{ '--spin': '200deg' }}>
        <path d="M8.4 26.6C7 23.4 13.8 20 23 20C32.2 20 39 23.4 37.6 26.6" stroke="#67E8F9" strokeOpacity="0.45" strokeWidth="1.1" strokeLinecap="round" />
      </g>

      {/* cráneo */}
      <g className="art-i-sway" style={{ '--amp': '4deg', '--dur': '3.4s' }}>
        <g className="art-h-tilt" style={{ '--tilt': '-9deg' }}>
          <path d="M23 9C29.6 9 33.8 13.6 33.8 19.4C33.8 22.6 32.6 24.8 30.8 26.2V30.2C30.8 31.4 29.8 32.4 28.6 32.4H17.4C16.2 32.4 15.2 31.4 15.2 30.2V26.2C13.4 24.8 12.2 22.6 12.2 19.4C12.2 13.6 16.4 9 23 9Z" fill={url('bone')} stroke="#7C5E3A" strokeOpacity="0.45" strokeWidth="0.6" />
          <path d="M30.2 13.4C32.4 15.4 33.4 18.2 33 21.6C32.6 23.8 31.6 25.2 30.8 26.2V30.2C30.8 31.4 29.8 32.4 28.6 32.4H26.2C28.4 29.6 31 23.4 30.2 13.4Z" fill="#7C5E3A" opacity="0.28" />
          <ellipse cx="18.8" cy="20.8" rx="3" ry="2.7" fill="#3B2A1A" />
          <ellipse cx="27.2" cy="20.8" rx="3" ry="2.7" fill="#3B2A1A" />
          <path d="M23 23.6L21.6 26.6H24.4Z" fill="#3B2A1A" />
          <path d="M18 29.4H28M19.6 28.2V30.8M21.6 28.2V30.8M23.6 28.2V30.8M25.6 28.2V30.8" stroke="#7C5E3A" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M15.4 15.8C16.6 12.2 19.4 10.4 22.4 10.2" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.9" strokeLinecap="round" />
          <ellipse cx="18.4" cy="13.6" rx="2.6" ry="1.2" fill={url('gloss')} transform="rotate(-24 18.4 13.6)" />
        </g>
      </g>

      {/* órbita de giro (delante) con flecha */}
      <g className="art-h-spin" style={{ '--spin': '200deg' }}>
        <path d="M37.6 26.6C36 30.4 30 32.8 23 32.8C16 32.8 10 30.4 8.4 26.6" stroke={url('orbit')} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10.6 24.6L8.2 26.9L11.4 27.8" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* pegatina 3D */}
      <g className="art-h-pop" style={{ '--pop': '1.15' }}>
        <rect x="31.4" y="5.2" width="12" height="8.6" rx="3" fill={url('tag')} stroke="#FDF2F8" strokeWidth="0.7" />
        <path d="M34.3 7.6H36.3C37 7.6 37.4 8 37.4 8.6C37.4 9.1 37 9.5 36.4 9.5C37 9.5 37.5 9.9 37.5 10.5C37.5 11.2 37 11.6 36.3 11.6H34.3M35.6 9.5H36.4" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38.8 7.6V11.6H39.9C41.1 11.6 41.7 10.8 41.7 9.6C41.7 8.4 41.1 7.6 39.9 7.6Z" stroke="#fff" strokeWidth="0.9" strokeLinejoin="round" />
      </g>
      <Sparkle x={9.4} y={11.2} r={2} idle delay={0.6} />
      <TileRim shade="#1E1B4B" />
    </svg>
  );
};

const ICONS = {
  'explorador-cuerpo': ExploradorCuerpo,
  'huesos-musculos': HuesosMusculos,
  'viaje-cuerpo': ViajeCuerpo,
  'anatomia-3d': Anatomia3D,
};

export default ICONS;
