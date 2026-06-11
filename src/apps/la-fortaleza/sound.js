// src/apps/la-fortaleza/sound.js
// Sonido 100% procedural con WebAudio (osciladores + ruido), sin ficheros.
// El AudioContext se crea perezosamente en el primer gesto del usuario
// (política de autoplay). Toggle persistido en localStorage.

const STORAGE_KEY = 'fortaleza-sound';

export function createSounds() {
  let ctx = null;
  let master = null;
  let enabled = localStorage.getItem(STORAGE_KEY) !== 'off';

  const ensureCtx = () => {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.14;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };

  // Tono simple con envolvente exponencial
  const tone = (freq, dur, { type = 'square', vol = 1, slide = 0, delay = 0 } = {}) => {
    const c = ensureCtx();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(freq + slide, 30), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  };

  // Ráfaga de ruido filtrado (impactos, explosiones)
  const noise = (dur, { freq = 800, vol = 1, delay = 0 } = {}) => {
    const c = ensureCtx();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const len = Math.ceil(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq, t0);
    filter.frequency.exponentialRampToValueAtTime(100, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter); filter.connect(g); g.connect(master);
    src.start(t0);
  };

  const arpeggio = (freqs, step = 0.09, dur = 0.16, opts = {}) => {
    freqs.forEach((f, i) => tone(f, dur, { type: 'triangle', vol: 0.9, ...opts, delay: i * step }));
  };

  return {
    isEnabled: () => enabled,
    toggle() {
      enabled = !enabled;
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
      return enabled;
    },
    // disparos por tipo de torre
    shoot(type) {
      if (type === 'arquero') tone(520, 0.08, { type: 'square', vol: 0.35, slide: -220 });
      else if (type === 'rafaga') tone(880, 0.05, { type: 'square', vol: 0.2, slide: -300 });
      else if (type === 'canon') noise(0.18, { freq: 500, vol: 0.5 });
      else if (type === 'hielo') tone(1400, 0.12, { type: 'sine', vol: 0.3, slide: -600 });
      else if (type === 'prisma') tone(660, 0.14, { type: 'sawtooth', vol: 0.25, slide: 440 });
      else if (type === 'fort_turret') tone(760, 0.04, { type: 'square', vol: 0.16, slide: -280 });
      else if (type === 'fort_canon') { noise(0.32, { freq: 300, vol: 0.7 }); tone(85, 0.4, { type: 'sine', vol: 0.6, slide: -35 }); }
    },
    hit() { noise(0.06, { freq: 1200, vol: 0.18 }); },
    explosion() { noise(0.35, { freq: 700, vol: 0.7 }); },
    death() { tone(300, 0.18, { type: 'triangle', vol: 0.4, slide: -200 }); },
    leak() { tone(220, 0.3, { type: 'sawtooth', vol: 0.5, slide: -120 }); tone(160, 0.3, { type: 'sawtooth', vol: 0.4, slide: -90, delay: 0.12 }); },
    correct() { arpeggio([523, 659, 784]); },           // do-mi-sol
    wrong() { tone(280, 0.22, { type: 'sawtooth', vol: 0.4 }); tone(210, 0.3, { type: 'sawtooth', vol: 0.4, delay: 0.14 }); },
    coin() { tone(988, 0.07, { type: 'square', vol: 0.3 }); tone(1319, 0.12, { type: 'square', vol: 0.3, delay: 0.07 }); },
    build() { noise(0.1, { freq: 400, vol: 0.3 }); tone(392, 0.1, { type: 'triangle', vol: 0.4, delay: 0.05 }); },
    crit() { arpeggio([659, 880, 1175, 1568], 0.06, 0.14); },
    jam() { tone(140, 0.4, { type: 'sawtooth', vol: 0.5, slide: -60 }); },
    bossSpawn() { arpeggio([196, 185, 165], 0.16, 0.3, { type: 'sawtooth', vol: 0.5 }); },
    allySpawn() { arpeggio([392, 523, 659], 0.07, 0.18, { type: 'square', vol: 0.3 }); }, // trompetilla
    towerHit() { noise(0.08, { freq: 600, vol: 0.4 }); },
    shield() { tone(1250, 0.18, { type: 'triangle', vol: 0.5, slide: -420 }); noise(0.07, { freq: 2600, vol: 0.25 }); }, // clang metálico
    fortify() { noise(0.12, { freq: 380, vol: 0.35 }); arpeggio([392, 494, 587, 784], 0.07, 0.2); },
    gateOpen() { noise(0.45, { freq: 240, vol: 0.5 }); tone(165, 0.5, { type: 'sawtooth', vol: 0.4, slide: 130, delay: 0.1 }); }, // retumbo + apertura
    towerDown() { noise(0.45, { freq: 350, vol: 0.8 }); tone(110, 0.4, { type: 'sawtooth', vol: 0.5, slide: -60, delay: 0.1 }); },
    chain(step) { tone(440 * Math.pow(1.12, Math.min(step, 14)), 0.14, { type: 'triangle', vol: 0.5 }); },
    minigame() { arpeggio([659, 784, 988, 1319], 0.07, 0.18); },
    heal() { arpeggio([784, 988, 1175], 0.09, 0.25, { type: 'sine', vol: 0.5 }); },
    unlock() { arpeggio([523, 659, 784, 1047, 1319], 0.08, 0.22); },
    ability(id) {
      if (id === 'meteoro') { tone(180, 0.5, { type: 'sawtooth', vol: 0.5, slide: -120 }); noise(0.5, { freq: 900, vol: 0.8, delay: 0.25 }); }
      else if (id === 'ventisca') { tone(1600, 0.5, { type: 'sine', vol: 0.35, slide: -900 }); noise(0.4, { freq: 2400, vol: 0.25 }); }
      else if (id === 'rayo') { noise(0.12, { freq: 3000, vol: 0.6 }); tone(1100, 0.25, { type: 'sawtooth', vol: 0.4, slide: -700, delay: 0.04 }); }
    },
    waveClear() { arpeggio([523, 659, 784, 1047], 0.08, 0.2); },
    victory() { arpeggio([523, 659, 784, 1047, 1319, 1568], 0.11, 0.3); },
    defeat() { arpeggio([392, 330, 262, 196], 0.18, 0.4, { type: 'sawtooth', vol: 0.4 }); },
  };
}
