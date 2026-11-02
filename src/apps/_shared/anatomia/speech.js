// Pronunciación de los nombres con la síntesis de voz del navegador
// (speechSynthesis), en el idioma activo: castellano de España, inglés
// británico y valenciano (voz catalana; si hay una valenciana, esa). Si el
// navegador no tiene síntesis o no hay voz del idioma, no se ofrece el botón.
import { useEffect, useState } from 'react';

// Idioma de la app → etiqueta BCP 47 y lengua de la voz.
export const SPEECH_LANG = {
  es: { tag: 'es-ES', base: 'es', region: 'es' },
  en: { tag: 'en-GB', base: 'en', region: 'gb' },
  va: { tag: 'ca-ES', base: 'ca', region: 'es' },
};

const NICE = /natural|neural|premium|enhanced|online|wavenet|studio/i;
const POOR = /compact|eloquence|espeak|robot/i;

// Puntuación de una voz para un idioma (-1 = no sirve).
export function voiceScore(voice, lang) {
  const want = SPEECH_LANG[lang] || SPEECH_LANG.es;
  const tag = String(voice?.lang || '').replace(/_/g, '-').toLowerCase();
  const name = String(voice?.name || '');
  const [base, region = ''] = tag.split('-');
  if (base !== want.base) return -1;
  let s = 10;
  if (lang === 'va' && (/valenci/i.test(tag) || /valenci/i.test(name))) s += 60;
  if (region === want.region) s += 40;
  else if (lang === 'en' && ['ie', 'au', 'nz'].includes(region)) s += 12;
  if (NICE.test(name)) s += 15;
  if (/google/i.test(name)) s += 8;
  if (voice?.localService) s += 3;
  if (POOR.test(name)) s -= 8;
  return s;
}

// La mejor voz disponible para el idioma, o null.
export function pickVoice(voices, lang) {
  let best = null;
  let bestScore = -1;
  for (const v of voices || []) {
    const s = voiceScore(v, lang);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return bestScore >= 0 ? best : null;
}

/* ───────── voces del navegador (se cargan tarde en algunos) ───────── */

const synth = () => (typeof window !== 'undefined' && window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function' ? window.speechSynthesis : null);
let voices = [];
let watching = false;
const subs = new Set();

function watchVoices() {
  const s = synth();
  if (!s || watching) return;
  watching = true;
  const load = () => {
    try { voices = s.getVoices() || []; } catch { voices = []; }
    subs.forEach((f) => f());
  };
  load();
  if (s.addEventListener) s.addEventListener('voiceschanged', load);
  else s.onvoiceschanged = load;
}

// Voz elegida para el idioma (null si no hay síntesis o no hay voz).
export function useSpeechVoice(lang) {
  const [voice, setVoice] = useState(() => {
    watchVoices();
    return pickVoice(voices, lang);
  });
  useEffect(() => {
    watchVoices();
    const update = () => setVoice(pickVoice(voices, lang));
    update();
    subs.add(update);
    return () => { subs.delete(update); };
  }, [lang]);
  return voice;
}

// Lee un texto con la voz dada. Devuelve la locución (o null si no se pudo).
export function speak(text, lang, voice, { onEnd } = {}) {
  const s = synth();
  if (!s || !text) return null;
  try {
    s.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || (SPEECH_LANG[lang] || SPEECH_LANG.es).tag;
    try { if (voice) u.voice = voice; } catch { /* voz no válida: basta con el idioma */ }
    u.rate = 0.9;
    u.pitch = 1;
    if (onEnd) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    s.speak(u);
    return u;
  } catch {
    return null;
  }
}
