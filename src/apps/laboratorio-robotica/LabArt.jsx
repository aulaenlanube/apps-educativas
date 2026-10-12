import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { GlowGradient, MaterialGradient } from '@/components/art/primitives';

// Ilustraciones de los componentes del Laboratorio de Robótica (rediseño 2026).
// Cada dibujo ocupa la CAJA COMPLETA del componente (viewBox = w × h de su
// plantilla), así las patillas y cables dibujados llegan exactamente a los
// pines reales (que siguen siendo botones HTML encima). Sin filtros SVG:
// volumen con degradados y brillos con formas. Solo presentación.

const lead = (d, color = '#cbd5e1', w = 2.6) => (
  <path d={d} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
);
const leadShade = (d, w = 2.6) => (
  <path d={d} stroke="#0f172a" strokeOpacity="0.45" strokeWidth={w + 1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
);
const Lead = ({ d, color, w }) => (<>{leadShade(d, w)}{lead(d, color, w)}</>);

/* ── Pila 9V ── */
function Battery({ url, id }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('bat')} light="#475569" base="#1f2937" dark="#0b1220" />
        <MaterialGradient id={id('lbl')} light="#fde68a" base="#fbbf24" dark="#d97706" />
      </defs>
      <Lead d="M88 22H110" color="#ef4444" />
      <Lead d="M88 48H110" color="#1f2937" />
      <rect x="4" y="9" width="82" height="52" rx="9" fill={url('bat')} />
      <rect x="4" y="9" width="46" height="52" rx="9" fill={url('lbl')} />
      <rect x="40" y="9" width="10" height="52" fill={url('lbl')} />
      <path d="M8 15Q30 11 80 13" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" fill="none" />
      <text x="27" y="44" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#78350f">9V</text>
      <rect x="84" y="15" width="8" height="14" rx="2" fill="#94a3b8" />
      <circle cx="90" cy="48" r="5" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
      <text x="72" y="27" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="11" fill="#fca5a5">+</text>
      <text x="72" y="53" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="12" fill="#cbd5e1">−</text>
    </>
  );
}

/* ── LED (rojo / verde) ── */
function Led({ url, id, color, active }) {
  return (
    <>
      <defs>
        <radialGradient id={id('dome')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#fff" stopOpacity={active ? 1 : 0.7} />
          <stop offset="35%" stopColor={color} stopOpacity={active ? 1 : 0.75} />
          <stop offset="100%" stopColor={color} stopOpacity={active ? 0.95 : 0.55} />
        </radialGradient>
        <GlowGradient id={id('glow')} color={color} opacity={0.85} />
      </defs>
      {active && <circle className="rob-art-glow" cx="40" cy="30" r="38" fill={url('glow')} />}
      <Lead d="M34 48V64L24 72V80" />
      <Lead d="M46 48V68L56 74V80" />
      <path d="M25 47V30A15 15 0 0 1 55 30V47Z" fill={url('dome')} />
      <path d="M25 47V30A15 15 0 0 1 55 30V47Z" fill="none" stroke={color} strokeOpacity="0.9" strokeWidth="1.2" />
      <rect x="22" y="44" width="36" height="6" rx="2.5" fill={color} opacity={active ? 1 : 0.8} />
      <path d="M33 34V22M47 34V24" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="33" cy="25" rx="4" ry="6" fill="#fff" opacity="0.55" />
      {active && <circle cx="40" cy="30" r="7" fill="#fff" opacity="0.8" />}
    </>
  );
}

/* ── LED RGB ── */
function Rgb({ url, id, active }) {
  const r = active?.R ? 255 : 0;
  const g = active?.G ? 255 : 0;
  const b = active?.B ? 255 : 0;
  const on = !!(r || g || b);
  const mix = on ? `rgb(${r},${g},${b})` : '#e2e8f0';
  return (
    <>
      <defs>
        <radialGradient id={id('dome')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="45%" stopColor={mix} stopOpacity={on ? 1 : 0.85} />
          <stop offset="100%" stopColor={on ? mix : '#94a3b8'} stopOpacity={on ? 0.95 : 0.8} />
        </radialGradient>
        <GlowGradient id={id('glow')} color={on ? mix : '#fff'} opacity={0.9} />
      </defs>
      {on && <circle className="rob-art-glow" cx="56" cy="44" r="44" fill={url('glow')} />}
      <Lead d="M0 25H30L44 76" color="#f87171" />
      <Lead d="M0 50H32L50 76" color="#4ade80" />
      <Lead d="M0 75H34L56 82" color="#60a5fa" />
      <Lead d="M100 55H80L64 78" color="#cbd5e1" />
      <path d="M38 78V46A18 18 0 0 1 74 46V78Z" fill={url('dome')} stroke="#94a3b8" strokeOpacity="0.7" strokeWidth="1.2" />
      <rect x="35" y="74" width="42" height="7" rx="3" fill="#cbd5e1" />
      <ellipse cx="48" cy="40" rx="4.5" ry="7" fill="#fff" opacity="0.6" />
    </>
  );
}

/* ── Zumbador ── */
function Buzzer({ url, id, active }) {
  return (
    <>
      <defs>
        <radialGradient id={id('body')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="60%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#0b1220" />
        </radialGradient>
      </defs>
      <Lead d="M32 52V66L24 74V80" color="#ef4444" />
      <Lead d="M48 52V66L56 74V80" color="#1f2937" />
      <circle cx="40" cy="30" r="25" fill={url('body')} />
      <circle cx="40" cy="30" r="17" fill="none" stroke="#475569" strokeWidth="1.5" />
      <circle cx="40" cy="30" r="5" fill="#020617" stroke="#334155" strokeWidth="1.2" />
      <path d="M24 17Q32 9 44 9" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <text x="55" y="16" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="9" fill="#fca5a5">+</text>
      {active && (
        <g className="rob-art-waves" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M66 18Q72 30 66 42" />
          <path d="M72 12Q81 30 72 48" />
          <path d="M14 18Q8 30 14 42" />
          <path d="M8 12Q-1 30 8 48" />
        </g>
      )}
    </>
  );
}

/* ── Motor DC ── */
function Motor({ url, id, active }) {
  return (
    <>
      <defs>
        <linearGradient id={id('can')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="35%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <MaterialGradient id={id('gear')} light="#fde68a" base="#f59e0b" dark="#b45309" />
      </defs>
      <Lead d="M36 74V82L28 86V90" color="#ef4444" />
      <Lead d="M54 74V82L62 86V90" color="#1f2937" />
      <rect x="18" y="28" width="54" height="46" rx="10" fill={url('can')} />
      <rect x="18" y="62" width="54" height="12" rx="5" fill="#16a34a" />
      <path d="M24 34V66" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="41" y="18" width="8" height="12" rx="2" fill="#94a3b8" />
      <g className={`rob-art-gear ${active ? 'is-on' : ''}`}>
        <path d="M45 3l3 4 5-1 1 5 5 2-2 5 3 4-4 3 1 5-5 1-2 5-5-2-4 3-3-4-5 1-1-5-5-2 2-5-3-4 4-3-1-5 5-1 2-5 5 2z" fill={url('gear')} transform="translate(0 0)" />
        <circle cx="45" cy="17" r="4" fill="#78350f" />
      </g>
    </>
  );
}

/* ── Servomotor ── */
function Servo({ url, id, active }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('box')} light="#93c5fd" base="#2563eb" dark="#1e3a8a" />
      </defs>
      <Lead d="M0 25H14Q20 25 20 34V44" color="#ef4444" w={2.2} />
      <Lead d="M0 55H20" color="#f97316" w={2.2} />
      <Lead d="M0 85H14Q20 85 20 76V66" color="#78350f" w={2.2} />
      <rect x="14" y="40" width="80" height="8" rx="3" fill="#1e3a8a" />
      <rect x="20" y="30" width="68" height="60" rx="7" fill={url('box')} />
      <path d="M26 36H62" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <text x="44" y="76" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="11" fill="#dbeafe">SG90</text>
      <circle cx="68" cy="36" r="9" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
      <g className={`rob-art-horn ${active ? 'is-on' : ''}`}>
        <path d="M68 33L90 30Q94 33 90 36L68 39Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="68" cy="36" r="4" fill="#cbd5e1" />
      </g>
    </>
  );
}

/* ── Interruptor (base; la palanca es el botón HTML) ── */
function SwitchBase({ url, id }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('base')} light="#475569" base="#1e293b" dark="#0b1220" />
      </defs>
      <Lead d="M0 40H30" />
      <Lead d="M90 40H120" />
      <rect x="26" y="20" width="68" height="40" rx="12" fill={url('base')} />
      <circle cx="32" cy="40" r="2" fill="#94a3b8" />
      <circle cx="88" cy="40" r="2" fill="#94a3b8" />
    </>
  );
}

/* ── Pulsador (base; el capuchón es el botón HTML) ── */
function ButtonBase({ url, id }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('base')} light="#475569" base="#1e293b" dark="#0b1220" />
      </defs>
      <Lead d="M0 45H26" />
      <Lead d="M74 45H100" />
      <rect x="22" y="19" width="56" height="54" rx="9" fill={url('base')} />
      {[[28, 25], [72, 25], [28, 67], [72, 67]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#94a3b8" />
      ))}
    </>
  );
}

/* ── Resistencia con sus bandas de color ── */
function Resistor({ url, id, bands }) {
  return (
    <>
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#e7c9a0" />
          <stop offset="100%" stopColor="#b08a5a" />
        </linearGradient>
      </defs>
      <Lead d="M0 25H30" />
      <Lead d="M80 25H110" />
      <path d="M28 25Q28 14 38 14H72Q82 14 82 25Q82 36 72 36H38Q28 36 28 25Z" fill={url('body')} />
      {bands.map((c, i) => (
        <rect key={i} x={[37, 46, 55, 69][i]} y="14" width="5" height="22" fill={c} />
      ))}
      <path d="M36 17.5H74" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

/* ── Potenciómetro (base; el mando es el botón HTML) ── */
function PotBase({ url, id }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('base')} light="#60a5fa" base="#1d4ed8" dark="#1e3a8a" />
      </defs>
      <Lead d="M0 45H24" />
      <Lead d="M76 45H100" />
      <Lead d="M50 72V90" />
      <rect x="20" y="16" width="60" height="58" rx="9" fill={url('base')} />
      <path d="M26 22H60" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

/* ── LDR (fotorresistencia) ── */
function Ldr({ url, id }) {
  return (
    <>
      <defs>
        <radialGradient id={id('disc')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="55%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <Lead d="M32 44V58L24 64V70" />
      <Lead d="M48 44V58L56 64V70" />
      <circle cx="40" cy="26" r="20" fill={url('disc')} stroke="#fed7aa" strokeWidth="2" />
      <path d="M27 18H51V23H29V28H51V33H29" stroke="#7c2d12" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
      <ellipse cx="32" cy="15" rx="5" ry="3" fill="#fff" opacity="0.6" />
    </>
  );
}

/* ── NTC (termistor) ── */
function Ntc({ url, id }) {
  return (
    <>
      <defs>
        <radialGradient id={id('bead')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="50%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
      </defs>
      <Lead d="M34 40V58L24 64V70" />
      <Lead d="M46 40V58L56 64V70" />
      <path d="M40 8C54 8 58 22 54 32C51 40 46 44 40 44C34 44 29 40 26 32C22 22 26 8 40 8Z" fill={url('bead')} />
      <text x="40" y="33" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="13" fill="#dbeafe">T°</text>
      <ellipse cx="34" cy="15" rx="4" ry="5" fill="#fff" opacity="0.5" />
    </>
  );
}

/* ── Placa de sensor (PIR / IR) ── */
function SensorBoard({ url, id, kind, w, h }) {
  const ys = kind === 'pir' ? [25, 55, 85] : [22, 50, 78];
  return (
    <>
      <defs>
        <MaterialGradient id={id('pcb')} light={kind === 'pir' ? '#4ade80' : '#60a5fa'} base={kind === 'pir' ? '#15803d' : '#1d4ed8'} dark={kind === 'pir' ? '#14532d' : '#1e3a8a'} />
        <radialGradient id={id('dome')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
      {ys.map((y, i) => <Lead key={y} d={`M0 ${y}H18`} color={['#ef4444', '#fbbf24', '#1f2937'][i]} w={2.2} />)}
      <rect x="16" y="6" width={w - 22} height={h - 12} rx="8" fill={url('pcb')} />
      {ys.map((y) => <rect key={`h${y}`} x="16" y={y - 3} width="8" height="6" rx="1.5" fill="#fbbf24" />)}
      {kind === 'pir' ? (
        <g>
          <circle cx="60" cy="38" r="24" fill={url('dome')} />
          <path d="M42 30H78M40 40H80M42 50H78M52 16V60M60 14V62M68 16V60" stroke="#94a3b8" strokeOpacity="0.55" strokeWidth="1" />
          <ellipse cx="52" cy="27" rx="7" ry="4.5" fill="#fff" opacity="0.8" />
        </g>
      ) : (
        <g>
          <rect x="66" y="16" width="16" height="14" rx="7" fill="#1e293b" />
          <rect x="66" y="36" width="16" height="14" rx="7" fill="#93c5fd" opacity="0.9" />
          <circle cx="44" cy="30" r="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
          <path d="M40 30H48" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
    </>
  );
}

/* ── Ultrasonidos HC-SR04 ── */
function Ultrasonic({ url, id }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('pcb')} light="#60a5fa" base="#1d4ed8" dark="#1e3a8a" />
        <radialGradient id={id('can')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
      </defs>
      {[22, 45, 68, 90].map((y, i) => <Lead key={y} d={`M0 ${y}H14`} color={['#ef4444', '#a855f7', '#22d3ee', '#1f2937'][i]} w={2.2} />)}
      <rect x="12" y="6" width="114" height="88" rx="8" fill={url('pcb')} />
      {[46, 94].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="40" r="20" fill={url('can')} />
          <circle cx={cx} cy="40" r="13" fill="#334155" />
          <path d={`M${cx - 10} 35H${cx + 10}M${cx - 11} 40H${cx + 11}M${cx - 10} 45H${cx + 10}`} stroke="#64748b" strokeWidth="1.2" />
        </g>
      ))}
      <rect x="62" y="68" width="14" height="8" rx="2" fill="#e2e8f0" />
    </>
  );
}

/* ── Arduino UNO ── */
function Arduino({ url, id, active }) {
  const right = [30, 55, 80, 105, 130, 155, 180, 205, 230];
  const left = [30, 55, 80, 105, 130, 215];
  return (
    <>
      <defs>
        <MaterialGradient id={id('pcb')} light="#22d3ee" base="#0e7490" dark="#164e63" />
        <linearGradient id={id('usb')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <GlowGradient id={id('led')} color="#4ade80" opacity={0.9} />
      </defs>
      <rect x="4" y="4" width="162" height="232" rx="12" fill={url('pcb')} />
      <rect x="4.8" y="4.8" width="160.4" height="230.4" rx="11.2" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
      {/* tiras de pines */}
      <rect x="6" y="18" width="12" height="126" rx="3" fill="#0f172a" />
      <rect x="6" y="203" width="12" height="24" rx="3" fill="#0f172a" />
      <rect x="152" y="18" width="12" height="222" rx="3" fill="#0f172a" />
      {left.map((y) => <rect key={`l${y}`} x="9" y={y - 3} width="6" height="6" rx="1" fill="#fbbf24" />)}
      {right.map((y) => <rect key={`r${y}`} x="155" y={y - 3} width="6" height="6" rx="1" fill="#fbbf24" />)}
      {/* USB, jack, chip */}
      <rect x="34" y="10" width="34" height="24" rx="3" fill={url('usb')} />
      <rect x="104" y="10" width="26" height="22" rx="4" fill="#0f172a" />
      <rect x="62" y="104" width="46" height="86" rx="4" fill="#111827" />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i}>
          <rect x="57" y={110 + i * 11.5} width="5" height="3" fill="#cbd5e1" />
          <rect x="108" y={110 + i * 11.5} width="5" height="3" fill="#cbd5e1" />
        </g>
      ))}
      <circle cx="70" cy="112" r="2.4" fill="#374151" />
      <text x="85" y="72" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="22" fill="#ecfeff">UNO</text>
      <path d="M58 82H112" stroke="#a5f3fc" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      {/* LED de alimentación */}
      {active && <circle cx="40" cy="58" r="12" fill={url('led')} />}
      <circle cx="40" cy="58" r="4" fill={active ? '#4ade80' : '#166534'} stroke="#052e16" strokeWidth="1" />
      <text x="40" y="74" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="8" fill="#cffafe">ON</text>
      <circle cx="40" cy="214" r="6" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
    </>
  );
}

/* ── Puente H (módulo L298N) ── */
function DriverH({ url, id }) {
  return (
    <>
      <defs>
        <MaterialGradient id={id('pcb')} light="#f87171" base="#b91c1c" dark="#7f1d1d" />
        <linearGradient id={id('sink')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="50%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map((y, i) => <Lead key={y} d={`M0 ${y}H16`} color={['#ef4444', '#1f2937', '#a855f7', '#22d3ee'][i]} w={2.2} />)}
      <Lead d="M118 40H140" color="#ef4444" />
      <Lead d="M118 80H140" color="#1f2937" />
      <rect x="12" y="6" width="116" height="108" rx="8" fill={url('pcb')} />
      <rect x="40" y="18" width="52" height="58" rx="3" fill={url('sink')} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={44 + i * 8} y="22" width="4" height="50" rx="1" fill="#4b5563" />)}
      <rect x="104" y="30" width="18" height="60" rx="3" fill="#2563eb" />
      <circle cx="113" cy="40" r="4" fill="#cbd5e1" />
      <circle cx="113" cy="80" r="4" fill="#cbd5e1" />
      <text x="66" y="98" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="12" fill="#fee2e2">L298N</text>
    </>
  );
}

const BANDS = {
  resistor: ['#dc2626', '#dc2626', '#78350f', '#d4a017'],   // 220 Ω: rojo rojo marrón · oro
  resistorK: ['#78350f', '#111827', '#f97316', '#d4a017'],  // 10 kΩ: marrón negro naranja · oro
};

// Dibujo completo de un componente. `active` y `state` solo cambian el aspecto.
export default function ComponentArt({ type, w, h, color, active }) {
  const [id, url] = useArtIds();
  const p = { id, url, active, color, w, h };
  let body = null;
  switch (type) {
    case 'battery': body = <Battery {...p} />; break;
    case 'led':
    case 'led2': body = <Led {...p} />; break;
    case 'rgb': body = <Rgb {...p} />; break;
    case 'buzzer': body = <Buzzer {...p} />; break;
    case 'motor': body = <Motor {...p} />; break;
    case 'servo': body = <Servo {...p} />; break;
    case 'switch': body = <SwitchBase {...p} />; break;
    case 'button': body = <ButtonBase {...p} />; break;
    case 'resistor':
    case 'resistorK': body = <Resistor {...p} bands={BANDS[type]} />; break;
    case 'pot': body = <PotBase {...p} />; break;
    case 'ldr': body = <Ldr {...p} />; break;
    case 'ntc': body = <Ntc {...p} />; break;
    case 'pir': body = <SensorBoard {...p} kind="pir" />; break;
    case 'ir': body = <SensorBoard {...p} kind="ir" />; break;
    case 'ultrasonic': body = <Ultrasonic {...p} />; break;
    case 'arduino': body = <Arduino {...p} />; break;
    case 'driverH': body = <DriverH {...p} />; break;
    default: body = <rect x="2" y="2" width={w - 4} height={h - 4} rx="10" fill="#334155" />;
  }
  return (
    <svg className="art rob-art" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {body}
    </svg>
  );
}
