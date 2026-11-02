// Piezas visuales compartidas por las apps del cuerpo humano.
import React, { useState } from 'react';
import {
  Activity, Anchor, Bone, Brain, Dumbbell, Ear, Eye, HeartPulse, Info, Lightbulb, MapPin, Microscope, ScanLine, Sparkles, Volume2, Wind,
} from 'lucide-react';
import { BY_KEY } from './data/structures';
import { SYSTEM_BY_ID } from './data/systems';
import { PLATE_BY_ID } from './data/plates';
import { APP_UI } from './uiStrings';
import {
  nameOf, sciOf, funcOf, factOf, actOf, oriOf, insOf, systemName, upperFirst, getLang,
} from './text';
import { speak, useSpeechVoice } from './speech';

const IMG = (id) => `/images/anatomia/${id}.webp`;
const GHOST = { a: '/images/anatomia/ghost-a.webp', p: '/images/anatomia/ghost-p.webp' };
const LI = { es: 0, en: 1, va: 2 };

/* ───────── arte de cada minijuego: una lámina real ampliada ───────── */

// art: { plate, x, y (punto de interés en %), zoom, ghost: 'a'|'p', icon }
export function AnatomyArt({ art }) {
  if (!art) return null;
  const Icon = art.icon;
  const style = { objectPosition: `${art.x ?? 50}% ${art.y ?? 50}%`, transform: `scale(${art.zoom || 1})`, transformOrigin: `${art.x ?? 50}% ${art.y ?? 50}%` };
  return (
    <span className="ana-art" style={{ aspectRatio: art.ratio || '16 / 10' }}>
      {art.ghost && <img src={GHOST[art.ghost]} alt="" className="ana-art__ghost" style={style} loading="lazy" decoding="async" />}
      <img src={IMG(art.plate)} alt="" style={{ ...style, objectFit: art.fit || 'cover' }} loading="lazy" decoding="async" />
      {Icon && <span className="ana-art__icon"><Icon size={16} /></span>}
    </span>
  );
}

export const makeGameArt = (arts) => function GameArt({ game }) {
  return <AnatomyArt art={arts[game] || arts.atlas} />;
};

export const ICONS = { Activity, Bone, Brain, Dumbbell, Ear, Eye, HeartPulse, Microscope, ScanLine, Sparkles, Wind };

/* ───────── escena de fondo (escáner) ───────── */

export function AnatomyScene() {
  return (
    <div className="ana-scene" aria-hidden="true">
      <div className="ana-scene__glow" />
      <div className="ana-scene__grid" />
      <div className="ana-scene__scan" />
    </div>
  );
}

/* ───────── visual de las preguntas de texto ───────── */

function ScannerCard({ sys }) {
  const s = SYSTEM_BY_ID[sys];
  return (
    <div className="gq-stage gq-stage--card ana-qcard" style={{ '--c': s?.color || '#67e8f9' }}>
      <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <defs>
          <radialGradient id="ana-q-g" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#ecfeff" stopOpacity=".95" />
            <stop offset=".45" stopColor="#22d3ee" stopOpacity=".55" />
            <stop offset="1" stopColor="#0e7490" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="url(#ana-q-g)" opacity=".5" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="6 5" opacity=".8" />
        <circle cx="60" cy="60" r="26" fill="#0b1626" stroke="#a5f3fc" strokeWidth="2.5" />
        <text x="60" y="71" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="34" fill="#cffafe">?</text>
      </svg>
    </div>
  );
}

// Visual de tipos de pregunta propios (el motor no los conoce).
export const makeRenderSubject = (extra = {}) => (q, done) => {
  const s = q.subject;
  if (s?.type === 'ana-q') return <ScannerCard sys={s.sys} />;
  return extra[s?.type]?.(q, done) ?? null;
};

/* ───────── pronunciación ───────── */

// Altavoz que lee `text` en el idioma `lang`. No se pinta si el navegador no
// tiene síntesis de voz o no tiene ninguna voz de ese idioma.
export function SpeakButton({ text, lang = getLang(), className = '' }) {
  const voice = useSpeechVoice(lang);
  const [talking, setTalking] = useState(false);
  if (!voice || !text) return null;
  const label = (APP_UI[lang] || APP_UI.es).listen;
  const say = (e) => {
    e.stopPropagation();
    const u = speak(text, lang, voice, { onEnd: () => setTalking(false) });
    setTalking(Boolean(u));
  };
  return (
    <button type="button" className={`ana-speak${talking ? ' is-talking' : ''} ${className}`} onClick={say} aria-label={`${label}: ${text}`} title={label}>
      <Volume2 size={17} aria-hidden="true" />
    </button>
  );
}

/* ───────── ficha de una estructura ───────── */

export function StructureFacts({ k, lv = 6, lang = getLang(), platesWith = [], onPlate }) {
  const s = BY_KEY[k];
  const t = APP_UI[lang] || APP_UI.es;
  if (!s) return null;
  const sys = SYSTEM_BY_ID[s.s];
  const sci = lv >= 4 ? sciOf(k, lang) : null;
  const fn = funcOf(k, lang);
  const act = actOf(k, lang);
  // origen e inserción: desde 3.º de ESO (en Bachillerato es contenido de examen)
  const ori = lv >= 5 ? oriOf(k, lang) : null;
  const ins = lv >= 5 ? insOf(k, lang) : null;
  const fact = factOf(k, lang);
  return (
    <div className="ana-facts">
      <div className="ana-facts__head">
        <span className="ana-facts__swatch" style={{ '--c': sys?.color, '--cd': sys?.deep }} />
        <div className="ana-facts__title">
          <strong>{nameOf(k, lang)}</strong>
          {sci && <small>{t.sci}: {sci}</small>}
        </div>
        <SpeakButton text={nameOf(k, lang)} lang={lang} className="ana-facts__speak" />
      </div>
      <div className="ana-facts__chips">
        <span className="ana-chip" style={{ '--c': sys?.color }}>{systemName(s.s, lang)}</span>
        <span className="ana-chip">{t.type[s.t] || s.t}</span>
        {s.bt && <span className="ana-chip">{t.boneType}: {t.bt[s.bt]}</span>}
      </div>
      {fn && <p className="ana-facts__block"><Info size={16} /><span><b>{t.function}:</b> {upperFirst(fn)}.</span></p>}
      {act && <p className="ana-facts__block"><Dumbbell size={16} /><span><b>{t.action}:</b> {upperFirst(act)}.</span></p>}
      {ori && <p className="ana-facts__block"><MapPin size={16} /><span><b>{t.origin}:</b> {upperFirst(ori)}.</span></p>}
      {ins && <p className="ana-facts__block"><Anchor size={16} /><span><b>{t.insertion}:</b> {upperFirst(ins)}.</span></p>}
      {fact && <p className="ana-facts__block"><Lightbulb size={16} /><span><b>{t.fact}</b> {fact}</span></p>}
      {platesWith.length > 1 && onPlate && (
        <div>
          <small style={{ color: 'var(--gk-ink-3)', fontWeight: 700 }}>{t.also}</small>
          <div className="ana-facts__plates">
            {platesWith.map((id) => (
              <button key={id} type="button" onClick={() => onPlate(id)}>{PLATE_BY_ID[id]?.t[LI[lang] ?? 0] || id}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { Bone, Brain, Eye, Ear, HeartPulse, Microscope, ScanLine, Sparkles, Wind, Activity, Dumbbell };
