import React from 'react';
import { GlossGradient, ShadowGradient } from '@/components/art/primitives';
import '@/styles/art.css';

// Piezas comunes de los personajes del Rosco (retratos de busto, viewBox 100×100).
// Mismo encuadre para todos: disco de color propio (centro 50,56 · r 41), busto
// recortado por el disco y cabeza/orejas/sombreros que sobresalen por arriba.
// Luz desde arriba-izquierda; sin filtros SVG; animación solo con clases art-i-*
// (nivel de efectos alto, apagadas con prefers-reduced-motion — ver styles/art.css).

export const BODY = 'M14 100 C15 84 29 75 50 75 C71 75 85 84 86 100 Z';
// Silueta del busto: todo lo que queda por debajo del ecuador del disco se recorta
// con su círculo; por encima, la cabeza puede salirse del disco.
const CLIP = 'M0 0 H100 V56 H91 A41 41 0 0 1 9 56 H0 Z';

export const Portrait = ({ id, url, disc, back = null, children }) => (
    <svg className="art ra-art" viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
        <defs>
            <radialGradient id={id('disc')} cx="0.34" cy="0.26" r="0.86">
                <stop offset="0%" stopColor={disc[0]} />
                <stop offset="52%" stopColor={disc[1]} />
                <stop offset="100%" stopColor={disc[2]} />
            </radialGradient>
            {/* Sombra propia: transparente en la zona iluminada, oscura en el borde inferior-derecho */}
            <radialGradient id={id('shade')} cx="0.36" cy="0.3" r="0.8">
                <stop offset="58%" stopColor="#1e1b4b" stopOpacity="0" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.42" />
            </radialGradient>
            <GlossGradient id={id('gloss')} opacity={0.85} />
            {/* Sombra de la cabeza sobre el busto */}
            <ShadowGradient id={id('drop')} color="#1e1b4b" opacity={0.5} />
            <clipPath id={id('clip')}><path d={CLIP} /></clipPath>
            <clipPath id={id('discclip')}><circle cx="50" cy="56" r="40" /></clipPath>
        </defs>
        {/* Disco de fondo */}
        <circle cx="50" cy="56" r="41" fill={url('disc')} />
        <circle cx="50" cy="56" r="40.6" stroke={disc[2]} strokeWidth="0.8" strokeOpacity="0.9" />
        {back && <g clipPath={url('discclip')}>{back}</g>}
        <circle cx="50" cy="56" r="38.6" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.2" />
        <path d="M14.5 47 A36.5 36.5 0 0 1 41 20.5" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.2" strokeLinecap="round" />
        <g clipPath={url('clip')}>{children}</g>
    </svg>
);

// Ojos grandes con iris en degradado (oscuro arriba, luminoso abajo) y dos brillos.
// El grupo entero parpadea (art-i-blink): cuenta como 1 pieza animada.
export const Eyes = ({
    id, url, at = [39, 61], y = 48, rx = 5.6, ry = 6.6,
    iris = ['#2b1608', '#c2410c'], look = 0.35, ring = '#2a1636', sclera = '#fff',
    pupil = 0.4, irisScale = 0.8, lashes = false, d = 0,
}) => (
    <>
        <defs>
            <linearGradient id={id('iris')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={iris[0]} />
                <stop offset="45%" stopColor={iris[0]} />
                <stop offset="100%" stopColor={iris[1]} />
            </linearGradient>
        </defs>
        <g className="art-i-blink" style={{ '--d': `${d}s`, '--dur': '5.6s' }}>
            {at.map((x, i) => {
                const side = i === 0 ? -1 : 1;
                const ix = x + look;
                return (
                    <g key={x}>
                        {lashes && (
                            <path
                                d={`M${x + side * rx * 0.55} ${y - ry * 0.78} l${side * 2.6} -2.2 M${x + side * rx * 0.88} ${y - ry * 0.42} l${side * 2.9} -1.1`}
                                stroke={ring} strokeWidth="1.25" strokeLinecap="round"
                            />
                        )}
                        <ellipse cx={x} cy={y} rx={rx + 0.9} ry={ry + 0.9} fill={ring} />
                        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={sclera} />
                        <ellipse cx={ix} cy={y + ry * 0.1} rx={rx * irisScale} ry={ry * (irisScale + 0.04)} fill={url('iris')} />
                        <ellipse cx={ix} cy={y + ry * 0.06} rx={rx * pupil} ry={ry * (pupil + 0.06)} fill="#0c0618" />
                        <circle cx={ix - rx * 0.28} cy={y - ry * 0.32} r={rx * 0.32} fill="#fff" />
                        <circle cx={ix + rx * 0.3} cy={y + ry * 0.36} r={rx * 0.14} fill="#fff" opacity="0.85" />
                    </g>
                );
            })}
        </g>
    </>
);

// Boca abierta y sonriente (con lengua) o sonrisa cerrada.
export const Smile = ({ id, url, x = 50, y = 63, w = 5, open = true, teeth = false, color = '#4c0519', tongue = '#fb7185' }) => {
    if (!open) {
        return <path d={`M${x - w} ${y} Q${x} ${y + w * 0.8} ${x + w} ${y}`} stroke={color} strokeWidth="1.5" strokeLinecap="round" />;
    }
    const d = `M${x - w} ${y} Q${x} ${y - w * 0.18} ${x + w} ${y} Q${x + w * 0.85} ${y + w * 1.15} ${x} ${y + w * 1.15} Q${x - w * 0.85} ${y + w * 1.15} ${x - w} ${y} Z`;
    return (
        <>
            <defs><clipPath id={id('mouth')}><path d={d} /></clipPath></defs>
            <path d={d} fill={color} />
            <g clipPath={url('mouth')}>
                {teeth && <rect x={x - w} y={y - w * 0.4} width={w * 2} height={w * 0.55} rx={w * 0.2} fill="#fff" />}
                <ellipse cx={x} cy={y + w * 1.1} rx={w * 0.62} ry={w * 0.5} fill={tongue} />
            </g>
        </>
    );
};

export const Blush = ({ at = [30, 70], y = 59, rx = 4.4, ry = 2.6, color = '#fb7185', opacity = 0.45 }) => (
    <>
        {at.map((x) => <ellipse key={x} cx={x} cy={y} rx={rx} ry={ry} fill={color} opacity={opacity} />)}
    </>
);

// Brillo especular en elipse (usa el degradado 'gloss' del retrato).
export const Shine = ({ url, cx, cy, rx, ry, rot = -18, opacity = 0.7 }) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url('gloss')} opacity={opacity} transform={`rotate(${rot} ${cx} ${cy})`} />
);

// Borde de luz (trazo blanco en el lado iluminado).
export const Rim = ({ d, opacity = 0.55, w = 1.4 }) => (
    <path d={d} stroke="#fff" strokeOpacity={opacity} strokeWidth={w} strokeLinecap="round" />
);

// Espejo horizontal respecto al centro (x → 100 - x).
export const MIRROR = 'matrix(-1 0 0 1 100 0)';

// Contorno ondulado (melenas, pelo afro): n lóbulos entre r y r·k alrededor de (cx, cy).
export const scallop = (cx, cy, r, n, k = 1.22, rot = 0) => {
    const pt = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr].map((v) => v.toFixed(2)).join(' ');
    const step = (Math.PI * 2) / n;
    let d = '';
    for (let i = 0; i < n; i++) {
        const a0 = rot + i * step;
        const a1 = a0 + step;
        if (i === 0) d += `M${pt(a0, r)}`;
        d += ` Q${pt(a0 + step / 2, r * k)} ${pt(a1, r)}`;
    }
    return `${d} Z`;
};
