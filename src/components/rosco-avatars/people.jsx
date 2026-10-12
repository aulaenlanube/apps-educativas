import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { MaterialGradient, GlowGradient, Sparkle } from '@/components/art/primitives';
import { Portrait, Eyes, Smile, Blush, Shine, Rim, BODY, MIRROR, scallop } from './kit';

const FACE = 'M50 32 C62 32 70.5 40 70.5 51 C70.5 62 62 70.5 50 70.5 C38 70.5 29.5 62 29.5 51 C29.5 40 38 32 50 32 Z';

// Cara humana común: orejas, cuello, cara con volumen, nariz y mejillas.
const Face = ({ url, skin = 'skin', line = '#9a5b3a', d = FACE, ears = true, neck = true }) => (
    <>
        {neck && <path d="M43.5 64 L43.5 77 C47 79 53 79 56.5 77 L56.5 64 Z" fill={url(skin)} />}
        {neck && <path d="M43.5 68 C47 71 53 71 56.5 68 L56.5 72 C53 74.5 47 74.5 43.5 72 Z" fill="#1e1b4b" opacity="0.18" />}
        {ears && (
            <>
                <ellipse cx="30" cy="53" rx="3.6" ry="4.8" fill={url(skin)} stroke={line} strokeWidth="0.9" />
                <ellipse cx="70" cy="53" rx="3.6" ry="4.8" fill={url(skin)} stroke={line} strokeWidth="0.9" />
            </>
        )}
        <path d={d} fill={url(skin)} stroke={line} strokeWidth="1" />
        <path d={d} fill={url('shade')} opacity="0.7" />
    </>
);

/* ───────────── Astronauta ───────────── */
export const Astronaut = () => {
    const [id, url] = useArtIds();
    const back = (
        <>
            <Sparkle x={19} y={38} r={2.4} opacity={0.9} />
            <Sparkle x={84} y={66} r={1.8} opacity={0.75} />
            <circle cx="15" cy="62" r="1" fill="#fff" opacity="0.7" />
            <circle cx="86" cy="44" r="0.9" fill="#fff" opacity="0.7" />
            <circle cx="80" cy="84" r="9" fill="#f97316" opacity="0.9" />
            <circle cx="77" cy="81" r="3" fill="#fdba74" opacity="0.8" />
        </>
    );
    return (
        <Portrait id={id} url={url} disc={['#3b5bdb', '#1e2a78', '#0a0f33']} back={back}>
            <defs>
                <MaterialGradient id={id('skin')} light="#e6b48c" base="#b9764c" dark="#7a4526" />
                <MaterialGradient id={id('hair')} light="#5a3a2c" base="#2d1a14" dark="#140a07" />
                <MaterialGradient id={id('suit')} light="#ffffff" base="#e2e8f0" dark="#8b98ad" />
                <radialGradient id={id('glass')} cx="0.38" cy="0.32" r="0.72">
                    <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.05" />
                    <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.55" />
                </radialGradient>
                <GlowGradient id={id('led')} color="#fb7185" opacity={0.95} />
            </defs>
            <path d={BODY} fill={url('suit')} stroke="#475569" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <rect x="26" y="84" width="10" height="7" rx="2" fill="#f97316" stroke="#9a3412" strokeWidth="0.7" />
            <rect x="60" y="84" width="14" height="9" rx="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.7" />
            <circle cx="64" cy="88.5" r="1.4" fill="#22d3ee" /><circle cx="69.5" cy="88.5" r="1.4" fill="#f43f5e" />
            {/* Cabeza dentro del casco */}
            <circle cx="35" cy="32" r="6.2" fill={url('hair')} />
            <circle cx="65" cy="32" r="6.2" fill={url('hair')} />
            <Face url={url} neck={false} line="#6b3a20" />
            <path d="M30 49 C29 38 38 31.5 50 31.5 C62 31.5 71 38 70 49 C66 42 60 39 54 39.5 C51 41.5 46 42.5 41 42 C36 42.5 32 45 30 49 Z" fill={url('hair')} />
            <path d="M36 36 C40 33.5 45 32.6 50 32.6" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
            <Eyes id={id} url={url} at={[41, 59]} y={52} rx={4.8} ry={5.6} iris={['#2b1608', '#b45309']} ring="#2d1a14" lashes />
            <path d="M36.5 45.4 Q41 43.6 45 45.4 M55 45.4 Q59 43.6 63.5 45.4" stroke="#2d1a14" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M49 57.8 Q50 59 51 57.8" stroke="#6b3a20" strokeWidth="1" strokeLinecap="round" />
            <Blush at={[35, 65]} y={60} rx={3.6} ry={2.1} color="#f43f5e" opacity={0.4} />
            <Smile id={id} url={url} y={62} w={4.2} teeth />
            {/* Cuello del traje */}
            <path d="M23 69 C30 78 70 78 77 69 L79 76 C71 86 29 86 21 76 Z" fill={url('suit')} stroke="#475569" strokeWidth="1" />
            <path d="M22.5 73.5 C30 81.5 70 81.5 77.5 73.5" stroke="#f97316" strokeWidth="1.8" />
            {/* Casco de cristal */}
            <circle cx="50" cy="48" r="29" fill={url('glass')} />
            <circle cx="50" cy="48" r="29" stroke="#f8fafc" strokeWidth="2.6" />
            <circle cx="50" cy="48" r="30.6" stroke="#64748b" strokeWidth="0.8" />
            <path d="M26 39 A25.5 25.5 0 0 1 43 22.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round" />
            <circle cx="47.5" cy="21.6" r="1.5" fill="#fff" opacity="0.85" />
            <path d="M70 62 A23 23 0 0 1 62 69" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.8" strokeLinecap="round" />
            {/* Luz de la antena del casco */}
            <path d="M73 27.5 L79 19" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
            <g className="art-i-glow" style={{ '--lo': '0.25', '--hi': '1', '--dur': '1.8s' }}>
                <circle cx="79.6" cy="18" r="6" fill={url('led')} />
            </g>
            <circle cx="79.6" cy="18" r="2.4" fill="#fecdd3" stroke="#e11d48" strokeWidth="0.8" />
        </Portrait>
    );
};

/* ───────────── Científica ───────────── */
const AFRO = scallop(50, 42, 27, 13, 1.16, -Math.PI / 2);
export const Scientist = () => {
    const [id, url] = useArtIds();
    return (
        <Portrait id={id} url={url} disc={['#d9f99d', '#84cc16', '#365314']}>
            <defs>
                <MaterialGradient id={id('skin')} light="#b47a55" base="#7f4c2f" dark="#4a2814" />
                <MaterialGradient id={id('hair')} light="#5b4034" base="#2e1f19" dark="#120a07" />
                <MaterialGradient id={id('coat')} light="#ffffff" base="#f1f5f9" dark="#a7b3c7" />
                <MaterialGradient id={id('shirt')} light="#c4b5fd" base="#8b5cf6" dark="#5b21b6" />
                <MaterialGradient id={id('lens')} light="#cffafe" base="#22d3ee" dark="#0e7490" />
                <MaterialGradient id={id('gold')} light="#fef9c3" base="#facc15" dark="#a16207" />
            </defs>
            {/* Pelo afro por detrás */}
            <path d={AFRO} fill={url('hair')} stroke="#0b0604" strokeWidth="1" strokeLinejoin="round" />
            <path d={AFRO} fill={url('shade')} />
            <Rim d="M24 36 C27 26 34 19 43 16.5" opacity={0.35} w={1.6} />
            <path d={BODY} fill={url('coat')} stroke="#64748b" strokeWidth="1.2" />
            <path d="M40 76 L50 92 L60 76 C57 75 43 75 40 76 Z" fill={url('shirt')} />
            <path d="M39 76 L50 93 L41 100 L33 79 Z M61 76 L50 93 L59 100 L67 79 Z" fill={url('coat')} stroke="#94a3b8" strokeWidth="0.8" strokeLinejoin="round" />
            <path d={BODY} fill={url('shade')} />
            <rect x="65" y="86" width="9" height="8" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.7" />
            <path d="M67.5 86.5 V82.5 M71 86.5 V83.5" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M71 83.5 V82" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
            <Face url={url} line="#3b2010" />
            <path d="M31 46 C33 37 40 33 50 33 C60 33 67 37 69 46 C64 41 58 39.5 50 40 C43 39.5 36 41 31 46 Z" fill={url('hair')} />
            {/* Pendientes */}
            <circle cx="30" cy="60" r="2" stroke={url('gold')} strokeWidth="1.1" />
            <circle cx="70" cy="60" r="2" stroke={url('gold')} strokeWidth="1.1" />
            <Eyes id={id} url={url} at={[41.5, 58.5]} y={52} rx={4.9} ry={5.8} iris={['#1c0d05', '#a16207']} ring="#1c0d05" lashes />
            <path d="M37 45.5 Q41.5 43.6 46 45.6 M54 45.6 Q58.5 43.6 63 45.5" stroke="#120a07" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M48.8 58 Q50 59.2 51.2 58" stroke="#3b2010" strokeWidth="1" strokeLinecap="round" />
            <Blush at={[35.5, 64.5]} y={60} rx={3.6} ry={2.1} color="#f472b6" opacity={0.35} />
            <Smile id={id} url={url} y={62} w={4.4} teeth color="#3f0a1c" />
            {/* Gafas de laboratorio en la frente */}
            <path d="M24 36 C34 31 66 31 76 36" stroke="#f97316" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="41" cy="34" r="6.4" fill={url('lens')} stroke="#c2410c" strokeWidth="1.6" />
            <circle cx="59" cy="34" r="6.4" fill={url('lens')} stroke="#c2410c" strokeWidth="1.6" />
            <path d="M47.4 34 H52.6" stroke="#c2410c" strokeWidth="1.6" />
            <path d="M37.5 32 Q39 29.8 41.5 29.6 M55.5 32 Q57 29.8 59.5 29.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" />
            <Sparkle x={62.5} y={31} r={3} idle delay={0.8} />
        </Portrait>
    );
};

/* ───────────── Ninja ───────────── */
export const Ninja = () => {
    const [id, url] = useArtIds();
    const hood = 'M50 21 C66 21 77.5 33 77.5 49 C77.5 64 66 74.5 50 74.5 C34 74.5 22.5 64 22.5 49 C22.5 33 34 21 50 21 Z';
    return (
        <Portrait id={id} url={url} disc={['#f5d0fe', '#d946ef', '#701a75']}>
            <defs>
                <MaterialGradient id={id('suit')} light="#5b6488" base="#283152" dark="#0f1429" />
                <MaterialGradient id={id('skin')} light="#ffe4cc" base="#f1b98a" dark="#c47f50" />
                <MaterialGradient id={id('band')} light="#fca5a5" base="#ef4444" dark="#991b1b" />
                <MaterialGradient id={id('plate')} light="#ffffff" base="#cbd5e1" dark="#64748b" />
                <MaterialGradient id={id('hair')} light="#a78bdc" base="#5b3a8f" dark="#241440" />
            </defs>
            <path d={BODY} fill={url('suit')} stroke="#0b0f20" strokeWidth="1.2" />
            <path d="M36 77 L60 100 M64 77 L48 92" stroke="#47507a" strokeWidth="2.2" strokeLinecap="round" />
            <path d={BODY} fill={url('shade')} />
            {/* Coleta alta que cae por detrás */}
            <path d="M62 27 C68 18 79 16 85.5 23 C90 28.5 89.5 39 85 48.5 C84 40.5 80.5 34 75 31.5 C71.5 30 68 30.5 65 32 Z" fill={url('hair')} stroke="#120a20" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M70 21.6 C76 19.4 81.6 21 84.6 25.6 M77 27.6 C80.6 29.6 83.6 33.6 85 38" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
            <ellipse cx="66" cy="27.4" rx="4.4" ry="2.4" transform="rotate(-50 66 27.4)" fill={url('band')} stroke="#7f1d1d" strokeWidth="0.7" />
            {/* Capucha */}
            <path d={hood} fill={url('suit')} stroke="#0b0f20" strokeWidth="1.2" />
            <path d={hood} fill={url('shade')} />
            <Shine url={url} cx={37} cy={29} rx={9} ry={3.4} opacity={0.45} />
            <Rim d="M25 48 C25 36 32 26.5 43 23" opacity={0.4} />
            {/* Abertura de los ojos */}
            <path d="M27.5 43 C36 39.5 64 39.5 72.5 43 C73.5 49 72.5 55 70.5 58.5 C62 55.5 38 55.5 29.5 58.5 C27.5 55 26.5 49 27.5 43 Z" fill={url('skin')} stroke="#0b0f20" strokeWidth="1" />
            <path d="M27.5 43 C36 39.5 64 39.5 72.5 43 C73.5 49 72.5 55 70.5 58.5 C62 55.5 38 55.5 29.5 58.5 C27.5 55 26.5 49 27.5 43 Z" fill={url('shade')} opacity="0.6" />
            <Eyes id={id} url={url} at={[40, 60]} y={49.4} rx={5.2} ry={5.6} iris={['#3b0764', '#c084fc']} ring="#1e1036" lashes />
            <path d="M34 43.2 L45 44.8 M55 44.8 L66 43.2" stroke="#1e1036" strokeWidth="1.8" strokeLinecap="round" />
            <Blush at={[32.5, 67.5]} y={55} rx={2.8} ry={1.5} color="#f43f5e" opacity={0.4} />
            {/* Pliegues de la máscara */}
            <path d="M38 64 Q50 67.5 62 64 M42 69 Q50 71.5 58 69" stroke="#47507a" strokeWidth="1.1" strokeLinecap="round" />
            {/* Cinta y sus colas (se mueven) */}
            <g className="art-i-sway art-o-left" style={{ '--amp': '7deg', '--dur': '3.2s' }}>
                <path d="M75 37 C83 35 89 30 94 23 C92.5 32 88 38.5 81 41.5 Z" fill={url('band')} stroke="#7f1d1d" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M75.5 40 C83 42 89 43 95 40.5 C91 47.5 84 48.5 77.5 44.5 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" strokeLinejoin="round" />
            </g>
            <path d="M23.4 39 C35 31.5 65 31.5 76.6 39 L77 44 C65 36.5 35 36.5 23 44 Z" fill={url('band')} stroke="#7f1d1d" strokeWidth="0.9" />
            <rect x="43" y="32.6" width="14" height="7" rx="2" fill={url('plate')} stroke="#475569" strokeWidth="0.8" />
            <path d="M50 34 L51.4 36.1 L50 38.2 L48.6 36.1 Z" fill="#ef4444" />
            <path d="M44.5 34 H50" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" strokeLinecap="round" />
        </Portrait>
    );
};

/* ───────────── Mago ───────────── */
export const Wizard = () => {
    const [id, url] = useArtIds();
    return (
        <Portrait id={id} url={url} disc={['#fef3c7', '#f59e0b', '#92400e']}>
            <defs>
                <MaterialGradient id={id('skin')} light="#ffeedd" base="#f8c9a0" dark="#d0915f" />
                <MaterialGradient id={id('hair')} light="#a8683a" base="#6b3f1d" dark="#3a200c" />
                <MaterialGradient id={id('hat')} light="#818cf8" base="#4338ca" dark="#1e1b4b" />
                <MaterialGradient id={id('robe')} light="#a78bfa" base="#6d28d9" dark="#3b0764" />
                <MaterialGradient id={id('gold')} light="#fef9c3" base="#facc15" dark="#a16207" />
            </defs>
            <path d={BODY} fill={url('robe')} stroke="#2e1065" strokeWidth="1.2" />
            <path d="M36 76.5 L50 90 L64 76.5" stroke={url('gold')} strokeWidth="2.6" strokeLinejoin="round" />
            <path d={BODY} fill={url('shade')} />
            <path d="M50 87 L52 91 L56.4 91.4 L53 94.2 L54.2 98.6 L50 96.2 L45.8 98.6 L47 94.2 L43.6 91.4 L48 91 Z" fill={url('gold')} stroke="#a16207" strokeWidth="0.6" strokeLinejoin="round" />
            <Face url={url} line="#a8683a" d="M50 35 C62 35 70.5 42 70.5 52.5 C70.5 63 62 71 50 71 C38 71 29.5 63 29.5 52.5 C29.5 42 38 35 50 35 Z" />
            {/* Mechones bajo el sombrero */}
            <path d="M29.5 38 C27 45 27 51 29.5 56 C31 49 33 45 37 41 Z" fill={url('hair')} />
            <path d="M70.5 38 C73 45 73 51 70.5 56 C69 49 67 45 63 41 Z" fill={url('hair')} />
            <path d="M34 39 C40 44 46 44 50 41 C54 44 61 44 66 39 Z" fill={url('hair')} />
            <Eyes id={id} url={url} at={[41.5, 58.5]} y={53.5} rx={4.6} ry={5.4} iris={['#172554', '#3b82f6']} ring="#3a200c" />
            {/* Gafas redondas */}
            <circle cx="41.5" cy="53.5" r="7.4" stroke="#b45309" strokeWidth="1.4" fill="#fff" fillOpacity="0.08" />
            <circle cx="58.5" cy="53.5" r="7.4" stroke="#b45309" strokeWidth="1.4" fill="#fff" fillOpacity="0.08" />
            <path d="M48.9 53 Q50 51.8 51.1 53 M34.1 52.5 L30 51 M65.9 52.5 L70 51" stroke="#b45309" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M37 49.5 Q38.6 47.6 41 47.2" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" strokeLinecap="round" />
            <path d="M49 61 Q50 62 51 61" stroke="#a8683a" strokeWidth="1" strokeLinecap="round" />
            <Blush at={[34, 66]} y={62.5} rx={3.4} ry={2} opacity={0.5} />
            <Smile id={id} url={url} y={64.2} w={3.8} />
            {/* Sombrero picudo */}
            <path d="M28.5 39 C35 28 40 16 45.5 7.5 C49 2 57 0.5 65 4.5 C59 5 55.5 9 56 15 C59.5 23 65 31 71.5 39 Z" fill={url('hat')} stroke="#1e1b4b" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M28.5 39 C35 28 40 16 45.5 7.5 C49 2 57 0.5 65 4.5 C59 5 55.5 9 56 15 C59.5 23 65 31 71.5 39 Z" fill={url('shade')} />
            <path d="M33 34 C38 26 42 17 46.5 9.5" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M31 34.5 C42 30.6 58 30.6 69 34.5 L70 38.5 C58 34.6 42 34.6 30 38.5 Z" fill={url('gold')} stroke="#a16207" strokeWidth="0.7" />
            <ellipse cx="50" cy="40" rx="30" ry="5.2" fill={url('hat')} stroke="#1e1b4b" strokeWidth="1.1" />
            <path d="M23 39 C32 36.4 44 35.6 55 35.8" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M53 22.5 A4.4 4.4 0 1 0 57.6 28 A3.4 3.4 0 1 1 53 22.5 Z" fill="#fde68a" />
            <Sparkle x={44} y={22} r={2.4} fill="#fde68a" />
            <Sparkle x={47.5} y={13.5} r={2.8} fill="#fef9c3" idle delay={0.4} />
        </Portrait>
    );
};

/* ───────────── Superhéroe ───────────── */
export const Superhero = () => {
    const [id, url] = useArtIds();
    return (
        <Portrait id={id} url={url} disc={['#fef9c3', '#facc15', '#a16207']}>
            <defs>
                <MaterialGradient id={id('skin')} light="#f6d0ae" base="#d9986b" dark="#9c5f36" />
                <MaterialGradient id={id('hair')} light="#4b5563" base="#1f2937" dark="#0b0f1a" />
                <MaterialGradient id={id('suit')} light="#93c5fd" base="#2563eb" dark="#1e3a8a" />
                <MaterialGradient id={id('cape')} light="#fca5a5" base="#dc2626" dark="#7f1d1d" />
                <MaterialGradient id={id('mask')} light="#f87171" base="#dc2626" dark="#991b1b" />
                <MaterialGradient id={id('emblem')} light="#fef9c3" base="#facc15" dark="#ca8a04" />
                <GlowGradient id={id('glow')} color="#fef08a" opacity={0.95} />
            </defs>
            {/* Capa (cuello alto por detrás) */}
            <path d="M17 100 L19 72 C24 66 32 67 37 72 L63 72 C68 67 76 66 81 72 L83 100 Z" fill={url('cape')} stroke="#7f1d1d" strokeWidth="1.1" strokeLinejoin="round" />
            <path d={BODY} fill={url('suit')} stroke="#172554" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <Rim d="M22 86 C25 80 31 77 38 76.5" opacity={0.45} />
            <g className="art-i-glow" style={{ '--lo': '0.2', '--hi': '0.95', '--dur': '2.6s' }}>
                <circle cx="50" cy="89" r="11" fill={url('glow')} />
            </g>
            <path d="M50 81 L58 86 L58 93 L50 98 L42 93 L42 86 Z" fill={url('emblem')} stroke="#a16207" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M51.5 82.8 L46 90.4 L50 90.4 L48.4 96 L54 88.4 L50 88.4 Z" fill="#dc2626" />
            <Face url={url} line="#7c4520" />
            {/* Pelo con rizo de héroe */}
            <path d="M29.5 48 C27 36 35 27.5 47 27 C53 26.5 59 27 64 30 C69 33.5 71.5 40 70 48.5 C68 43 64 40.5 60 40 C55 41.8 48 42 41 40.5 C35.5 41.5 31.5 44.5 29.5 48 Z" fill={url('hair')} stroke="#05070c" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M48.6 33 C44.6 35 44 39.6 47 42.4 C47.6 39.4 49.6 37.4 52.6 36.8 C50.4 36 49.2 34.8 48.6 33 Z" fill={url('hair')} stroke="#05070c" strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M33.5 35 C37 30.6 41.5 28.8 46 28.6 M52 28.4 C56 28.4 60 29.6 63 31.6" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
            {/* Antifaz */}
            <path d="M28 47.5 C34.5 43 44 43.5 50 46.4 C56 43.5 65.5 43 72 47.5 C72.4 54 68 58.5 61 57.8 C56.5 57.2 53 55 50 53.6 C47 55 43.5 57.2 39 57.8 C32 58.5 27.6 54 28 47.5 Z" fill={url('mask')} stroke="#7f1d1d" strokeWidth="0.9" />
            <path d="M31 47.5 C36 45.4 41 45.2 45 46" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
            <Eyes id={id} url={url} at={[40, 60]} y={51.4} rx={4.6} ry={4.8} iris={['#172554', '#3b82f6']} ring="#7f1d1d" />
            <path d="M33.5 43.8 Q39 41 45 43.4 M55 43.4 Q61 41 66.5 43.8" stroke="#0b0f1a" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M49 60 Q50 61.2 51 60" stroke="#7c4520" strokeWidth="1" strokeLinecap="round" />
            <Smile id={id} url={url} y={63.2} w={5.4} teeth color="#450a0a" />
        </Portrait>
    );
};

/* ───────────── Gamer ───────────── */
export const Gamer = () => {
    const [id, url] = useArtIds();
    return (
        <Portrait id={id} url={url} disc={['#64748b', '#334155', '#0b1120']}>
            <defs>
                <MaterialGradient id={id('skin')} light="#fff1e3" base="#f8cba6" dark="#d39168" />
                <MaterialGradient id={id('hair')} light="#fdba74" base="#ea580c" dark="#9a3412" />
                <MaterialGradient id={id('hoodie')} light="#c4b5fd" base="#8b5cf6" dark="#4c1d95" />
                <MaterialGradient id={id('phones')} light="#f9a8d4" base="#ec4899" dark="#9d174d" />
                <MaterialGradient id={id('cup')} light="#475569" base="#1e293b" dark="#0b1120" />
                <GlowGradient id={id('neon')} color="#22d3ee" opacity={0.9} />
            </defs>
            <circle cx="50" cy="56" r="37" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 3" />
            {/* Sudadera con capucha */}
            <path d="M24 82 C26 74 36 70 50 70 C64 70 74 74 76 82 Z" fill="#6d28d9" />
            <path d={BODY} fill={url('hoodie')} stroke="#2e1065" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <path d="M44 79 L43 91 M56 79 L57 91" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="43" cy="92" r="1.3" fill="#f8fafc" /><circle cx="57" cy="92" r="1.3" fill="#f8fafc" />
            <rect x="60" y="86" width="12" height="7" rx="3.5" fill="#1e293b" />
            <path d="M63 88.4 v2.2 M61.9 89.5 h2.2" stroke="#22d3ee" strokeWidth="0.9" strokeLinecap="round" />
            <circle cx="68.4" cy="88.6" r="0.9" fill="#f472b6" /><circle cx="70" cy="90.4" r="0.9" fill="#fde047" />
            <Face url={url} line="#b87650" />
            {/* Pelo despeinado */}
            <path d="M29.5 50 C26 38 33 27.5 46 27 C49 23.5 55 22.5 60 25 C67 27 72 34 71 45 C71 47 70.6 48.6 70 50 C68.5 44.5 65 41 61.5 40 L60 43.5 L56.5 39.5 L52 43 L49 38.5 L43.5 42.5 L42 38.5 C36 40 31.5 44.5 29.5 50 Z" fill={url('hair')} stroke="#7c2d12" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M34 34 C38 30 42 28.6 46 28.4 M50 25 C53 24 56 24.2 58.5 25.4" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
            <Eyes id={id} url={url} at={[41.5, 58.5]} y={52.6} rx={4.8} ry={5.6} iris={['#14532d', '#22c55e']} ring="#7c2d12" />
            <path d="M37 46 Q41.5 44.2 46 46 M54 46 Q58.5 44.2 63 46" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" />
            <g fill="#c2410c" opacity="0.5">
                <circle cx="35.5" cy="59.5" r="0.75" /><circle cx="38" cy="61" r="0.75" /><circle cx="35.8" cy="62.2" r="0.75" />
                <circle cx="64.5" cy="59.5" r="0.75" /><circle cx="62" cy="61" r="0.75" /><circle cx="64.2" cy="62.2" r="0.75" />
            </g>
            <path d="M49 59 Q50 60.2 51 59" stroke="#b87650" strokeWidth="1" strokeLinecap="round" />
            <Smile id={id} url={url} y={62.6} w={5} teeth />
            {/* Auriculares */}
            <path d="M24.5 52 C22 32 34 21 50 21 C66 21 78 32 75.5 52" stroke={url('phones')} strokeWidth="4.4" strokeLinecap="round" />
            <path d="M27 40 C29 30 37 24.5 46 23.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="18" y="45" width="12" height="18" rx="6" fill={url('cup')} stroke="#0b1120" strokeWidth="0.9" />
            <rect x="70" y="45" width="12" height="18" rx="6" fill={url('cup')} stroke="#0b1120" strokeWidth="0.9" />
            <rect x="16" y="47" width="5" height="14" rx="2.5" fill={url('phones')} />
            <g transform={MIRROR}><rect x="16" y="47" width="5" height="14" rx="2.5" fill={url('phones')} /></g>
            <g className="art-i-glow" style={{ '--lo': '0.25', '--hi': '1', '--dur': '2.2s' }}>
                <circle cx="76" cy="54" r="6.5" fill={url('neon')} />
            </g>
            <rect x="74.6" y="49" width="2.8" height="10" rx="1.4" fill="#a5f3fc" />
            <path d="M24 59 C26 66 32 68.5 38.5 67" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="39.6" cy="66.8" r="2" fill="#1e293b" />
        </Portrait>
    );
};
