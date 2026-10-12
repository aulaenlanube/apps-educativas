import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { GlowGradient, GlossGradient, MaterialGradient, ShadowGradient } from '@/components/art/primitives';

// Robot del tablero de "Programa al Robot" (rediseño 2026).
// Es la MISMA familia que la mascota de la plataforma (RobotMascot / MiniBot):
// cabeza-monitor índigo, visor oscuro con ojos blancos (el derecho mayor),
// sonrisa cian, mejillas rosas, antena con orbe rosa, núcleo IA cian en el
// pecho y propulsor con llama en vez de piernas. Cuatro vistas según la
// dirección (frente, espalda y perfil; el oeste es el perfil reflejado).
//
// Props (API sin cambios):
//   dir    -> 'N' | 'E' | 'S' | 'W'  (orientación del robot)
//   moving -> boolean (llama del propulsor encendida e inclinación al avanzar)
//
// Sin filtros SVG: brillos con degradados radiales y sombras con formas.
// Las animaciones en reposo (parpadeo, orbe) usan las clases art-i-* de
// src/styles/art.css, que solo se mueven con nivel de efectos alto.

function Defs({ id }) {
  return (
    <defs>
      <MaterialGradient id={id('head')} light="#c7d2fe" base="#6366f1" dark="#312e81" />
      <MaterialGradient id={id('limb')} light="#c4b5fd" base="#5b4ff0" dark="#312e81" />
      <linearGradient id={id('visor')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="55%" stopColor="#0b0a24" />
        <stop offset="100%" stopColor="#1a1450" />
      </linearGradient>
      <radialGradient id={id('iris')} cx="0.4" cy="0.35" r="0.65">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
      <radialGradient id={id('orb')} cx="0.35" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#fdf4ff" />
        <stop offset="40%" stopColor="#f0abfc" />
        <stop offset="100%" stopColor="#a21caf" />
      </radialGradient>
      <linearGradient id={id('metal')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f1f0ff" />
        <stop offset="100%" stopColor="#7c7aa8" />
      </linearGradient>
      <linearGradient id={id('flame')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ecfeff" />
        <stop offset="35%" stopColor="#67e8f9" />
        <stop offset="75%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
      </linearGradient>
      <GlowGradient id={id('orbGlow')} color="#f0abfc" opacity={0.85} />
      <GlowGradient id={id('core')} color="#67e8f9" opacity={0.95} />
      <GlossGradient id={id('gloss')} opacity={0.6} />
      <ShadowGradient id={id('shadow')} color="#0f0a32" opacity={0.45} />
    </defs>
  );
}

// Piezas comunes -----------------------------------------------------------

const Shadow = ({ url }) => <ellipse cx="28" cy="61.2" rx="12.5" ry="2.6" fill={url('shadow')} />;

// Propulsor con llama (la llama crece y vibra al avanzar).
const Thruster = ({ url }) => (
  <g>
    <g className="pbx-rb-flame">
      <path d="M24.6 52.4Q28 62 31.4 52.4Z" fill={url('flame')} />
      <path d="M26.6 52.6Q28 57.4 29.4 52.6Z" fill="#ecfeff" opacity="0.9" />
    </g>
    <path d="M22.4 50.2Q28 56.6 33.6 50.2Z" fill={url('limb')} />
    <path d="M24.4 51.2Q28 53.4 31.6 51.2" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.7" strokeLinecap="round" fill="none" />
  </g>
);

const Antenna = ({ url, x = 28 }) => (
  <g>
    <path d={`M${x} 10.6V6.8L${x - 2.4} 4.8`} stroke="#4338ca" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle className="art-i-glow" style={{ '--lo': '0.35' }} cx={x - 2.6} cy="3.9" r="6" fill={url('orbGlow')} />
    <circle cx={x - 2.6} cy="3.9" r="3.1" fill={url('orb')} />
    <circle cx={x - 3.5} cy="2.9" r="0.95" fill="#fff" opacity="0.9" />
  </g>
);

// Vista frontal (sur) ------------------------------------------------------
function Front({ url }) {
  return (
    <>
      <Shadow url={url} />
      <Thruster url={url} />
      {/* brazos */}
      <rect x="11.4" y="39.4" width="5.2" height="10.4" rx="2.6" fill={url('limb')} />
      <rect x="39.4" y="39.4" width="5.2" height="10.4" rx="2.6" fill={url('limb')} />
      <circle cx="14" cy="49.6" r="2.1" fill={url('metal')} />
      <circle cx="42" cy="49.6" r="2.1" fill={url('metal')} />
      {/* torso con núcleo IA */}
      <rect x="16.6" y="37.6" width="22.8" height="14" rx="6.4" fill={url('limb')} />
      <path d="M20 40.2Q28 38.2 36 40.2" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle className="art-i-glow" style={{ '--lo': '0.55' }} cx="28" cy="44.8" r="5.6" fill={url('core')} />
      <circle cx="28" cy="44.8" r="2.5" fill="#0e7490" stroke="#a5f3fc" strokeWidth="0.8" />
      <circle cx="28" cy="44.8" r="0.9" fill="#ecfeff" />
      {/* cuello */}
      <rect x="24.2" y="34.6" width="7.6" height="3.6" rx="1.2" fill={url('metal')} />
      <Antenna url={url} />
      {/* orejeras */}
      <rect x="4.2" y="16.4" width="5.4" height="13.6" rx="2.7" fill={url('limb')} />
      <rect x="46.4" y="16.4" width="5.4" height="13.6" rx="2.7" fill={url('limb')} />
      {/* carcasa de la cabeza */}
      <rect x="7.6" y="10" width="40.8" height="26.4" rx="11" fill={url('head')} />
      <rect x="8.2" y="10.6" width="39.6" height="25.2" rx="10.4" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" fill="none" />
      <path d="M14.4 12.6Q22 10.4 31 11.2" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* visor */}
      <rect x="11.2" y="13.4" width="33.6" height="17.4" rx="8" fill={url('visor')} stroke="#67e8f9" strokeOpacity="0.5" strokeWidth="0.8" />
      <path d="M14.6 15.4Q22 14 30 14.6" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* ojos (el derecho, mayor) */}
      <g className="art-i-blink" style={{ '--dur': '4.6s' }}>
        <circle cx="21.4" cy="22.4" r="4.1" fill="#fff" />
        <circle cx="34" cy="22" r="5.2" fill="#fff" />
        <circle cx="21.9" cy="22.8" r="2.35" fill={url('iris')} />
        <circle cx="34.6" cy="22.4" r="3" fill={url('iris')} />
        <circle cx="21" cy="21.7" r="0.95" fill="#fff" />
        <circle cx="33.6" cy="21" r="1.15" fill="#fff" />
      </g>
      {/* sonrisa y mejillas */}
      <path d="M24.2 33Q28 35.4 31.8 33" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="14.6" cy="32.4" rx="2.8" ry="1.5" fill="#f472b6" opacity="0.6" />
      <ellipse cx="41.4" cy="32.4" rx="2.8" ry="1.5" fill="#f472b6" opacity="0.6" />
    </>
  );
}

// Vista trasera (norte) ----------------------------------------------------
function Back({ url }) {
  return (
    <>
      <Shadow url={url} />
      <Thruster url={url} />
      <rect x="11.4" y="39.4" width="5.2" height="10.4" rx="2.6" fill={url('limb')} />
      <rect x="39.4" y="39.4" width="5.2" height="10.4" rx="2.6" fill={url('limb')} />
      <circle cx="14" cy="49.6" r="2.1" fill={url('metal')} />
      <circle cx="42" cy="49.6" r="2.1" fill={url('metal')} />
      {/* torso con mochila de batería */}
      <rect x="16.6" y="37.6" width="22.8" height="14" rx="6.4" fill={url('limb')} />
      <rect x="21" y="40" width="14" height="9" rx="3" fill="#312e81" />
      <path d="M23.4 42.6H32.6M23.4 44.6H32.6M23.4 46.6H32.6" stroke="#818cf8" strokeWidth="0.9" strokeLinecap="round" />
      <rect x="24.2" y="34.6" width="7.6" height="3.6" rx="1.2" fill={url('metal')} />
      <rect x="4.2" y="16.4" width="5.4" height="13.6" rx="2.7" fill={url('limb')} />
      <rect x="46.4" y="16.4" width="5.4" height="13.6" rx="2.7" fill={url('limb')} />
      <Antenna url={url} />
      <rect x="7.6" y="10" width="40.8" height="26.4" rx="11" fill={url('head')} />
      <rect x="8.2" y="10.6" width="39.6" height="25.2" rx="10.4" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" fill="none" />
      <path d="M14.4 12.6Q22 10.4 31 11.2" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* panel trasero con rejilla y luz de estado */}
      <rect x="16" y="17" width="24" height="12.4" rx="5" fill="#3730a3" />
      <path d="M20 21H36M20 24H36M20 27H31" stroke="#6366f1" strokeWidth="1.1" strokeLinecap="round" />
      <circle className="art-i-glow" style={{ '--lo': '0.4' }} cx="35.2" cy="26.8" r="2.6" fill={url('core')} />
      <circle cx="35.2" cy="26.8" r="1.1" fill="#a5f3fc" />
    </>
  );
}

// Vista lateral (este; el oeste se refleja) --------------------------------
function Side({ url }) {
  return (
    <>
      <Shadow url={url} />
      <Thruster url={url} />
      {/* brazo trasero */}
      <rect x="20.6" y="39.6" width="5" height="9.6" rx="2.5" fill="#3730a3" />
      {/* torso de perfil */}
      <rect x="18.8" y="37.6" width="19.4" height="14" rx="6.4" fill={url('limb')} />
      <path d="M21.6 40.2Q28 38.4 34.6 40.2" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle className="art-i-glow" style={{ '--lo': '0.55' }} cx="35.6" cy="44.8" r="4" fill={url('core')} />
      <path d="M36.6 42.2Q38.8 44.8 36.6 47.4" stroke="#a5f3fc" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* brazo delantero (oscila al avanzar) */}
      <g className="pbx-rb-arm">
        <rect x="26.2" y="39.2" width="5.4" height="10.6" rx="2.7" fill={url('limb')} />
        <circle cx="28.9" cy="49.6" r="2.1" fill={url('metal')} />
      </g>
      <rect x="24.6" y="34.6" width="7.2" height="3.6" rx="1.2" fill={url('metal')} />
      <Antenna url={url} x={26} />
      {/* cabeza de perfil, mirando a la derecha */}
      <rect x="10.4" y="10" width="37.6" height="26.4" rx="11" fill={url('head')} />
      <rect x="11" y="10.6" width="36.4" height="25.2" rx="10.4" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" fill="none" />
      <path d="M15.6 12.6Q22 10.6 29 11.2" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* orejera (disco lateral) */}
      <circle cx="19.6" cy="23.2" r="5.6" fill={url('limb')} />
      <circle cx="19.6" cy="23.2" r="2.6" fill={url('metal')} />
      {/* visor en la mitad delantera */}
      <path d="M29 13.4H41.6Q48 13.4 48 21.4V22.8Q48 30.8 41.6 30.8H29Q27 30.8 27 28.8V15.4Q27 13.4 29 13.4Z" fill={url('visor')} stroke="#67e8f9" strokeOpacity="0.5" strokeWidth="0.8" />
      <g className="art-i-blink" style={{ '--dur': '4.6s' }}>
        <circle cx="39.6" cy="22.2" r="4.6" fill="#fff" />
        <circle cx="41" cy="22.6" r="2.7" fill={url('iris')} />
        <circle cx="40.2" cy="21.2" r="1" fill="#fff" />
      </g>
      <path d="M40.8 33.2Q43.6 34.4 46 32.6" stroke="#67e8f9" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <ellipse cx="34.8" cy="32.6" rx="2.4" ry="1.4" fill="#f472b6" opacity="0.55" />
    </>
  );
}

export default function Robot({ dir = 'S', moving = false }) {
  const [id, url] = useArtIds();
  const View = dir === 'N' ? Back : dir === 'S' ? Front : Side;
  const flip = dir === 'W';
  return (
    <svg
      viewBox="0 0 56 64"
      className={`art pbx-rb pbx-rb--${dir} ${moving ? 'is-moving' : 'is-idle'}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Defs id={id} />
      <g className="pbx-rb-flip" transform={flip ? 'translate(56 0) scale(-1 1)' : undefined}>
        <g className="pbx-rb-body">
          <View url={url} />
        </g>
      </g>
    </svg>
  );
}
