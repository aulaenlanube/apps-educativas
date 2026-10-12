import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { MaterialGradient, Sparkle } from '@/components/art/primitives';
import { Portrait, Eyes, Smile, Blush, Shine, Rim, BODY, MIRROR, scallop } from './kit';

/* ───────────── Zorro ───────────── */
export const Fox = () => {
    const [id, url] = useArtIds();
    const ear = 'M24 40 C20 28 19 16 21 6 C31 9 41 18 46 29 Z';
    const earIn = 'M27.5 34 C25 26 24.5 19 25.5 12.5 C32 15.5 37.5 21 40.5 27.5 Z';
    const earTip = 'M21 6 C24.5 7 28 9 31 11.5 C28 13.5 25 15.5 22.3 17.5 C21.3 13.5 20.8 9.8 21 6 Z';
    const head = 'M50 25 C63 25 73 32 75.5 43 C76.5 48 79 53 84 58 C78 60.5 74 62 70 66 C64 72 57 74 50 74 C43 74 36 72 30 66 C26 62 22 60.5 16 58 C21 53 23.5 48 24.5 43 C27 32 37 25 50 25 Z';
    const Ear = () => (
        <g>
            <path d={ear} fill={url('fur')} stroke="#9a3412" strokeWidth="1.2" strokeLinejoin="round" />
            <path d={earIn} fill={url('earin')} />
            <path d={earTip} fill="#431407" />
        </g>
    );
    return (
        <Portrait id={id} url={url} disc={['#bfdbfe', '#3b82f6', '#1e3a8a']}>
            <defs>
                <MaterialGradient id={id('fur')} light="#fdba74" base="#f97316" dark="#c2410c" />
                <MaterialGradient id={id('cream')} light="#ffffff" base="#fff7ed" dark="#fed7aa" />
                <MaterialGradient id={id('earin')} light="#fff7ed" base="#fed7aa" dark="#fb923c" />
                <MaterialGradient id={id('scarf')} light="#99f6e4" base="#2dd4bf" dark="#0f766e" />
            </defs>
            <path d={BODY} fill={url('fur')} stroke="#9a3412" strokeWidth="1.2" />
            <path d="M36 77 C40 86 46 94 50 100 C54 94 60 86 64 77 C58 75 42 75 36 77 Z" fill={url('cream')} />
            <path d={BODY} fill={url('shade')} />
            {/* Pañuelo */}
            <path d="M30 75 C40 81.5 60 81.5 70 75 L71 80.5 C60 88 40 88 29 80.5 Z" fill={url('scarf')} stroke="#115e59" strokeWidth="0.9" />
            <path d="M57 82 L67 95 L59 93.5 L54 85 Z" fill={url('scarf')} stroke="#115e59" strokeWidth="0.9" strokeLinejoin="round" />
            <Rim d="M33 78 C42 82 58 82 67 78" opacity={0.5} w={1.1} />
            <ellipse cx="50" cy="74.5" rx="21" ry="5.4" fill={url('drop')} />
            {/* Orejas: la derecha se mueve */}
            <Ear />
            <g className="art-i-sway art-o-bottom" style={{ '--amp': '5deg', '--dur': '4.6s' }}>
                <g transform={MIRROR}><Ear /></g>
            </g>
            <path d="M79 6 C75.5 7 72 9 69 11.5 L75 15 Z" fill="#1e1b4b" opacity="0.18" />
            {/* Cabeza */}
            <path d={head} fill={url('fur')} stroke="#9a3412" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M50 53 C54 53 57.5 55.5 61 58.5 C65 61.5 71 61.5 78 59.5 C73 63 69 66 66 68.5 C61 72.5 56 74 50 74 C44 74 39 72.5 34 68.5 C31 66 27 63 22 59.5 C29 61.5 35 61.5 39 58.5 C42.5 55.5 46 53 50 53 Z" fill={url('cream')} />
            <path d={head} fill={url('shade')} />
            <path d="M44 27 C46 33 48 37 50 40 C52 37 54 33 56 27 C52 26 48 26 44 27 Z" fill="#fdba74" opacity="0.65" />
            <Shine url={url} cx={38} cy={32} rx={9} ry={3.6} />
            <Rim d="M26.5 43 C28 34 36 27.5 47 26.5" />
            <path d="M33.5 39.5 Q38.5 37 43 39.5" stroke="#7c2d12" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M56.5 39.5 Q61.5 37 66.5 39.5" stroke="#7c2d12" strokeWidth="1.6" strokeLinecap="round" />
            <Eyes id={id} url={url} at={[38.5, 61.5]} y={48} rx={5.7} ry={6.6} iris={['#431407', '#f59e0b']} ring="#431407" />
            <Blush at={[29, 71]} y={60} />
            <path d="M45.5 57 Q50 54.8 54.5 57 Q53.5 61 50 62 Q46.5 61 45.5 57 Z" fill="#2e1027" />
            <ellipse cx="48.6" cy="56.8" rx="1.6" ry="0.75" fill="#fff" opacity="0.7" />
            <path d="M50 62 V63.4" stroke="#2e1027" strokeWidth="1.2" strokeLinecap="round" />
            <Smile id={id} url={url} y={63.6} w={4.6} />
        </Portrait>
    );
};

/* ───────────── Panda ───────────── */
export const Panda = () => {
    const [id, url] = useArtIds();
    const head = 'M50 24 C66 24 77.5 34 77.5 48 C77.5 62 66 73 50 73 C34 73 22.5 62 22.5 48 C22.5 34 34 24 50 24 Z';
    return (
        <Portrait id={id} url={url} disc={['#bbf7d0', '#22c55e', '#14532d']}>
            <defs>
                <MaterialGradient id={id('black')} light="#57536f" base="#2a2640" dark="#110e1c" />
                <MaterialGradient id={id('white')} light="#ffffff" base="#f5f3ff" dark="#c7cde0" />
                <MaterialGradient id={id('bamboo')} light="#bef264" base="#65a30d" dark="#3f6212" />
                <MaterialGradient id={id('leaf')} light="#86efac" base="#22c55e" dark="#15803d" />
            </defs>
            <path d={BODY} fill={url('black')} stroke="#0b0914" strokeWidth="1.2" />
            <path d="M33 76 C40 79.5 60 79.5 67 76 C67 87 60 96 50 100 C40 96 33 87 33 76 Z" fill={url('white')} />
            <path d={BODY} fill={url('shade')} />
            <Rim d="M18 92 C20 84 26 79 34 77" opacity={0.3} />
            <ellipse cx="50" cy="73.5" rx="21" ry="5.4" fill={url('drop')} />
            {/* Orejas */}
            {[27, 73].map((x) => (
                <g key={x}>
                    <circle cx={x} cy="28" r="9.6" fill={url('black')} stroke="#0b0914" strokeWidth="1" />
                    <circle cx={x + 0.4} cy="28.6" r="4.6" fill="#4a4562" />
                </g>
            ))}
            <path d="M21 25 A8 8 0 0 1 28 19.6" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
            {/* Cabeza */}
            <path d={head} fill={url('white')} stroke="#94a3b8" strokeWidth="1.1" />
            <path d={head} fill={url('shade')} opacity="0.75" />
            <Shine url={url} cx={39} cy={31.5} rx={10} ry={3.8} opacity={0.9} />
            <Rim d="M25 46 C26 35 34 27 45 25.5" opacity={0.7} />
            {/* Antifaz */}
            <ellipse cx="38" cy="49.5" rx="8.6" ry="10.6" transform="rotate(28 38 49.5)" fill={url('black')} />
            <ellipse cx="62" cy="49.5" rx="8.6" ry="10.6" transform="rotate(-28 62 49.5)" fill={url('black')} />
            <Eyes id={id} url={url} at={[38.8, 61.2]} y={48.5} rx={4.7} ry={5.5} iris={['#1c0d05', '#b45309']} ring="#110e1c" />
            <ellipse cx="50" cy="61" rx="10.5" ry="7.4" fill="#fff" />
            <Blush at={[29, 71]} y={60.5} rx={4} />
            <path d="M46 56.2 Q50 54.4 54 56.2 Q53 59.6 50 60.2 Q47 59.6 46 56.2 Z" fill="#1d1a2b" />
            <ellipse cx="48.6" cy="56.1" rx="1.4" ry="0.65" fill="#fff" opacity="0.7" />
            <path d="M50 60.2 V61.6 M45.5 61.8 Q47.8 64.6 50 61.8 Q52.2 64.6 54.5 61.8" stroke="#1d1a2b" strokeWidth="1.3" strokeLinecap="round" />
            {/* Rama de bambú en la boca */}
            <path d="M53.5 63.4 L77 54" stroke={url('bamboo')} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M63 59.6 l0.8 2 M70 56.8 l0.8 2" stroke="#3f6212" strokeWidth="0.9" strokeLinecap="round" />
            <g className="art-i-sway art-o-left" style={{ '--amp': '7deg', '--dur': '3.8s' }}>
                <path d="M76 54.4 C78 47 83 43.5 90 43 C88 50 83 54 76 54.4 Z" fill={url('leaf')} stroke="#15803d" strokeWidth="0.7" />
                <path d="M76.5 54 C80.5 50 84 47.5 88 45" stroke="#bbf7d0" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
            </g>
        </Portrait>
    );
};

/* ───────────── Gata ───────────── */
export const Cat = () => {
    const [id, url] = useArtIds();
    const ear = 'M23 42 C20 30 20 18 24 8.5 C32 11.5 40 18 45 27 Z';
    const earIn = 'M26.5 36 C24.5 28 24.5 20 26.5 14.5 C32 17 36.5 21.5 40 27 Z';
    const head = 'M50 25 C65 25 76 33 78.5 45 C80 52 80 58 77 63 C72 70 62 74 50 74 C38 74 28 70 23 63 C20 58 20 52 21.5 45 C24 33 35 25 50 25 Z';
    const Ear = () => (
        <g>
            <path d={ear} fill={url('fur')} stroke="#334155" strokeWidth="1.2" strokeLinejoin="round" />
            <path d={earIn} fill={url('pink')} />
        </g>
    );
    return (
        <Portrait id={id} url={url} disc={['#fed7aa', '#fb923c', '#9a3412']}>
            <defs>
                <MaterialGradient id={id('fur')} light="#e2e8f0" base="#94a3b8" dark="#475569" />
                <MaterialGradient id={id('pink')} light="#fce7f3" base="#f9a8d4" dark="#db2777" />
                <MaterialGradient id={id('collar')} light="#c4b5fd" base="#7c3aed" dark="#4c1d95" />
                <MaterialGradient id={id('gold')} light="#fef9c3" base="#facc15" dark="#a16207" />
            </defs>
            <path d={BODY} fill={url('fur')} stroke="#334155" strokeWidth="1.2" />
            <path d="M38 78 C42 86 46 93 50 100 C54 93 58 86 62 78 Z" fill="#f1f5f9" />
            <path d={BODY} fill={url('shade')} />
            <ellipse cx="50" cy="74" rx="21" ry="5.4" fill={url('drop')} />
            {/* Collar con cascabel */}
            <path d="M31 75.5 C41 81 59 81 69 75.5 L69.5 80.5 C59 86.5 41 86.5 30.5 80.5 Z" fill={url('collar')} stroke="#3b0764" strokeWidth="0.8" />
            <Rim d="M33 78 C42 82 58 82 67 78" opacity={0.45} w={1} />
            <circle cx="50" cy="86" r="5" fill={url('gold')} stroke="#a16207" strokeWidth="0.8" />
            <path d="M46 86 H54 M50 87.5 V90" stroke="#854d0e" strokeWidth="1" strokeLinecap="round" />
            <circle cx="48.3" cy="84.2" r="1.3" fill="#fff" opacity="0.85" />
            {/* Orejas */}
            <Ear />
            <g className="art-i-sway art-o-bottom" style={{ '--amp': '6deg', '--dur': '5.2s', '--d': '1.2s' }}>
                <g transform={MIRROR}><Ear /></g>
            </g>
            {/* Mechones de mejilla */}
            <path d="M22.5 55 L15 59 L22 61.5 L16.5 66 L25 65 Z" fill={url('fur')} stroke="#334155" strokeWidth="1" strokeLinejoin="round" />
            <path d="M77.5 55 L85 59 L78 61.5 L83.5 66 L75 65 Z" fill="#64748b" stroke="#334155" strokeWidth="1" strokeLinejoin="round" />
            {/* Cabeza */}
            <path d={head} fill={url('fur')} stroke="#334155" strokeWidth="1.2" />
            <path d={head} fill={url('shade')} />
            <path d="M50 27.5 V35.5 M43.5 28.6 L45.4 34.4 M56.5 28.6 L54.6 34.4" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M22.5 50 L29.5 51.4 M23 54.6 L29.5 55 M77.5 50 L70.5 51.4 M77 54.6 L70.5 55" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
            <Shine url={url} cx={37} cy={32} rx={8.6} ry={3.4} />
            <Rim d="M24 45 C26 34 35 27 46 26" />
            <ellipse cx="45" cy="61" rx="6.2" ry="4.9" fill="#f8fafc" />
            <ellipse cx="55" cy="61" rx="6.2" ry="4.9" fill="#f8fafc" />
            <Eyes id={id} url={url} at={[38.5, 61.5]} y={47.5} rx={6} ry={6.8} iris={['#14532d', '#a3e635']} ring="#1e293b" pupil={0.28} />
            <Blush at={[29.5, 70.5]} y={58.5} rx={4} />
            <path d="M47 56.2 Q50 55.2 53 56.2 Q51.5 59 50 59.4 Q48.5 59 47 56.2 Z" fill="#ec4899" />
            <path d="M50 59.4 V61 M45.5 61.2 Q47.8 64.2 50 61.3 Q52.2 64.2 54.5 61.2" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M39 60 L27 58 M39 62 L27.5 63.5 M61 60 L73 58 M61 62 L72.5 63.5" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.8" strokeLinecap="round" />
        </Portrait>
    );
};

/* ───────────── Perro ───────────── */
export const Dog = () => {
    const [id, url] = useArtIds();
    const head = 'M50 24 C65 24 76 34 76.5 47 C77 61 66 72 50 72 C34 72 23 61 23.5 47 C24 34 35 24 50 24 Z';
    const ear = 'M32 26 C22 24 12.5 31 11 43.5 C10 53.5 12.5 61.5 18.5 63 C25 64 28 57.5 29.5 49.5 C30.5 42 34 33 32 26 Z';
    return (
        <Portrait id={id} url={url} disc={['#99f6e4', '#14b8a6', '#134e4a']}>
            <defs>
                <MaterialGradient id={id('fur')} light="#fef3c7" base="#fbbf5a" dark="#c2761b" />
                <MaterialGradient id={id('ear')} light="#c26a2a" base="#8a4218" dark="#4a210a" />
                <MaterialGradient id={id('cream')} light="#ffffff" base="#fffbeb" dark="#fde68a" />
                <MaterialGradient id={id('collar')} light="#fca5a5" base="#ef4444" dark="#991b1b" />
                <MaterialGradient id={id('tag')} light="#fef9c3" base="#facc15" dark="#a16207" />
            </defs>
            <path d={BODY} fill={url('fur')} stroke="#92400e" strokeWidth="1.2" />
            <path d="M37 78 C41 87 46 94 50 100 C54 94 59 87 63 78 Z" fill={url('cream')} />
            <path d={BODY} fill={url('shade')} />
            <ellipse cx="50" cy="72.5" rx="21" ry="5.4" fill={url('drop')} />
            <path d="M31 74 C41 79.5 59 79.5 69 74 L69.5 79 C59 85 41 85 30.5 79 Z" fill={url('collar')} stroke="#7f1d1d" strokeWidth="0.8" />
            <Rim d="M33 76.5 C42 80.5 58 80.5 67 76.5" opacity={0.45} w={1} />
            {/* Chapa con forma de hueso */}
            <path d="M45.5 84.2 a1.9 1.9 0 1 1 1.9 -2.4 h5.2 a1.9 1.9 0 1 1 1.9 2.4 a1.9 1.9 0 1 1 -1.9 2.4 h-5.2 a1.9 1.9 0 1 1 -1.9 -2.4 Z" fill={url('tag')} stroke="#a16207" strokeWidth="0.7" />
            {/* Cabeza */}
            <path d={head} fill={url('fur')} stroke="#92400e" strokeWidth="1.2" />
            <path d={head} fill={url('shade')} />
            <ellipse cx="61.5" cy="46" rx="9.2" ry="8.6" fill="#b4632a" opacity="0.85" />
            <Shine url={url} cx={39} cy={31} rx={9} ry={3.6} />
            <Rim d="M25.5 46 C26 35 34 27 45 25.5" />
            <path d="M34 37.5 Q38 35.2 42 37" stroke="#8a4218" strokeWidth="2" strokeLinecap="round" />
            <path d="M58 37 Q62 35.2 66 37.5" stroke="#4a210a" strokeWidth="2" strokeLinecap="round" />
            {/* Orejas caídas (la izquierda se balancea) */}
            <g className="art-i-sway art-o-top" style={{ '--amp': '4deg', '--dur': '4.2s' }}>
                <path d={ear} fill={url('ear')} stroke="#3b1a07" strokeWidth="1" />
                <path d="M27 30 C20 31 15 37 14.5 45" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <g transform={MIRROR}>
                <path d={ear} fill={url('ear')} stroke="#3b1a07" strokeWidth="1" />
                <path d={ear} fill="#1e1b4b" opacity="0.18" />
            </g>
            <ellipse cx="50" cy="60.5" rx="12.5" ry="9.4" fill={url('cream')} />
            <Eyes id={id} url={url} at={[39, 61]} y={47} rx={5.4} ry={6.3} iris={['#2b1608', '#a16207']} ring="#3b1a07" />
            <Blush at={[32, 68]} y={58} rx={3.6} ry={2.2} />
            <path d="M44.5 54.6 Q50 51.4 55.5 54.6 Q54.5 59 50 60 Q45.5 59 44.5 54.6 Z" fill="#2a1a2e" />
            <ellipse cx="48" cy="54.3" rx="2" ry="0.9" fill="#fff" opacity="0.7" />
            <path d="M50 60 V61.5" stroke="#2a1a2e" strokeWidth="1.2" strokeLinecap="round" />
            <Smile id={id} url={url} y={61.8} w={6} color="#5b0f24" />
        </Portrait>
    );
};

/* ───────────── León ───────────── */
const MANE = scallop(50, 48, 30.5, 16, 1.2, -Math.PI / 2);
const MANE_IN = scallop(50, 49, 25.5, 14, 1.15, -Math.PI / 2 + 0.2);
export const Lion = () => {
    const [id, url] = useArtIds();
    const head = 'M50 30 C62 30 70.5 37 71 48 C71.5 59 63 69 50 69 C37 69 28.5 59 29 48 C29.5 37 38 30 50 30 Z';
    return (
        <Portrait id={id} url={url} disc={['#ddd6fe', '#8b5cf6', '#3b0764']}>
            <defs>
                <MaterialGradient id={id('mane')} light="#fdba74" base="#ea580c" dark="#9a3412" />
                <MaterialGradient id={id('mane2')} light="#fed7aa" base="#f97316" dark="#c2410c" />
                <MaterialGradient id={id('fur')} light="#fef3c7" base="#fbbf24" dark="#d97706" />
                <MaterialGradient id={id('cream')} light="#ffffff" base="#fffbeb" dark="#fde68a" />
                <MaterialGradient id={id('gold')} light="#fef9c3" base="#facc15" dark="#b45309" />
                <MaterialGradient id={id('cape')} light="#fb7185" base="#e11d48" dark="#881337" />
            </defs>
            {/* Capa real con armiño */}
            <path d={BODY} fill={url('cape')} stroke="#7f1d1d" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <path d="M16.5 90 C20 80 30 74.5 42 73.5 L44 79 C33 80 24 85 20.5 93 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="0.7" />
            <path d="M83.5 90 C80 80 70 74.5 58 73.5 L56 79 C67 80 76 85 79.5 93 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.7" />
            <path d="M24 84 v2.2 M31 79 v2.2 M76 84 v2.2 M69 79 v2.2" stroke="#1e1b4b" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="50" cy="92" r="3.6" fill={url('gold')} stroke="#92400e" strokeWidth="0.8" />
            {/* Melena */}
            <path d={MANE} fill={url('mane')} stroke="#7c2d12" strokeWidth="1.2" strokeLinejoin="round" />
            <path d={MANE} fill={url('shade')} />
            <path d={MANE_IN} fill={url('mane2')} />
            <Rim d="M23 40 C25 30 32 23 41 20" opacity={0.5} w={1.6} />
            {/* Orejas */}
            <circle cx="33" cy="32" r="5.6" fill={url('fur')} stroke="#92400e" strokeWidth="1" />
            <circle cx="33.3" cy="32.4" r="2.6" fill="#b45309" />
            <circle cx="67" cy="32" r="5.6" fill={url('fur')} stroke="#92400e" strokeWidth="1" />
            <circle cx="66.7" cy="32.4" r="2.6" fill="#b45309" />
            {/* Cara */}
            <path d={head} fill={url('fur')} stroke="#b45309" strokeWidth="1.1" />
            <path d={head} fill={url('shade')} opacity="0.8" />
            <Shine url={url} cx={41} cy={35.5} rx={7.5} ry={3} />
            <path d="M46 31 Q50 36 54 31" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M50 52 C56 52 61 56 61 61 C61 66 56 69 50 69 C44 69 39 66 39 61 C39 56 44 52 50 52 Z" fill={url('cream')} />
            <Eyes id={id} url={url} at={[41, 59]} y={47} rx={4.9} ry={5.8} iris={['#3b1d0e', '#d97706']} ring="#78350f" />
            <path d="M36.5 40 Q40.5 38 44.5 40.5 M55.5 40.5 Q59.5 38 63.5 40" stroke="#9a3412" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M46 55 Q50 53.2 54 55 Q52.8 58.4 50 59 Q47.2 58.4 46 55 Z" fill="#7c2d12" />
            <ellipse cx="48.6" cy="55" rx="1.4" ry="0.6" fill="#fff" opacity="0.6" />
            <path d="M50 59 V60.2" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" />
            <Smile id={id} url={url} y={60.6} w={4.6} teeth />
            <g fill="#b45309" opacity="0.55">
                <circle cx="43" cy="61" r="0.7" /><circle cx="41.5" cy="63" r="0.7" /><circle cx="57" cy="61" r="0.7" /><circle cx="58.5" cy="63" r="0.7" />
            </g>
            {/* Corona */}
            <g transform="rotate(-12 58 18)">
                <path d="M47 23 L45.5 12 L51 16.5 L56.5 9.5 L61.5 16.5 L67.5 12 L66.5 23 Z" fill={url('gold')} stroke="#92400e" strokeWidth="0.9" strokeLinejoin="round" />
                <rect x="46.5" y="21" width="20.5" height="3.6" rx="1.4" fill="#f59e0b" stroke="#92400e" strokeWidth="0.8" />
                <circle cx="56.6" cy="17.6" r="1.8" fill="#e11d48" />
                <circle cx="56" cy="17" r="0.6" fill="#fff" />
                <path d="M48.5 21 L47.6 14.6" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
            </g>
            <Sparkle x={47} y={10} r={3} idle delay={0.6} />
        </Portrait>
    );
};

/* ───────────── Pingüino ───────────── */
export const Penguin = () => {
    const [id, url] = useArtIds();
    const head = 'M50 22 C66 22 77 33 77 49 C77 63 66 74 50 74 C34 74 23 63 23 49 C23 33 34 22 50 22 Z';
    const mask = 'M50 38 C54 32 63 32 67 38 C72 46 71 58 64 66 C60 70 55 72 50 72 C45 72 40 70 36 66 C29 58 28 46 33 38 C37 32 46 32 50 38 Z';
    return (
        <Portrait id={id} url={url} disc={['#e0f2fe', '#38bdf8', '#075985']}>
            <defs>
                <MaterialGradient id={id('navy')} light="#56628f" base="#24304f" dark="#0f172a" />
                <MaterialGradient id={id('white')} light="#ffffff" base="#f8fafc" dark="#cbd5e1" />
                <MaterialGradient id={id('beak')} light="#fde68a" base="#fb923c" dark="#c2410c" />
                <MaterialGradient id={id('knit')} light="#fca5a5" base="#ef4444" dark="#991b1b" />
            </defs>
            <path d={BODY} fill={url('navy')} stroke="#0b1020" strokeWidth="1.2" />
            <path d="M34 78 C40 76 60 76 66 78 C68 88 62 97 50 100 C38 97 32 88 34 78 Z" fill={url('white')} />
            <path d={BODY} fill={url('shade')} />
            {/* Bufanda */}
            <path d="M30 74 C40 80.5 60 80.5 70 74 L71 80 C60 87.5 40 87.5 29 80 Z" fill={url('knit')} stroke="#7f1d1d" strokeWidth="0.8" />
            <path d="M36 78.5 L37 84.5 M44 80.6 L44.5 86.4 M56 80.6 L55.5 86.4 M64 78.5 L63 84.5" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M60 82 L64 97 L57.5 96 L55.5 85 Z" fill={url('knit')} stroke="#7f1d1d" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Cabeza */}
            <path d={head} fill={url('navy')} stroke="#0b1020" strokeWidth="1.2" />
            <path d={mask} fill={url('white')} />
            <path d={head} fill={url('shade')} opacity="0.7" />
            <Rim d="M25 50 C24.5 42 26 36 30 31" opacity={0.4} />
            <Eyes id={id} url={url} at={[41, 59]} y={50.5} rx={5.2} ry={6.1} iris={['#0f172a', '#3b82f6']} ring="#0f172a" />
            <Blush at={[34, 66]} y={60} rx={3.6} ry={2.2} opacity={0.55} />
            <path d="M45 57.5 Q50 54.6 55 57.5 Q52.6 62.6 50 63.2 Q47.4 62.6 45 57.5 Z" fill={url('beak')} stroke="#c2410c" strokeWidth="0.7" />
            <path d="M46.6 57.4 Q50 56 53.4 57.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M46.5 64.6 Q50 66.6 53.5 64.6" stroke="#475569" strokeWidth="1.1" strokeLinecap="round" />
            {/* Gorro de lana */}
            <path d="M23.5 42 C23.5 26 35 16.5 50 16.5 C65 16.5 76.5 26 76.5 42 C67 38 59 37 50 37 C41 37 33 38 23.5 42 Z" fill={url('knit')} stroke="#7f1d1d" strokeWidth="1" />
            <path d="M23.5 42 C23.5 26 35 16.5 50 16.5 C65 16.5 76.5 26 76.5 42 C67 38 59 37 50 37 C41 37 33 38 23.5 42 Z" fill={url('shade')} opacity="0.7" />
            <path d="M38 20.5 C35 26 34 32 34.5 38 M50 17 V37 M62 20.5 C65 26 66 32 65.5 38" stroke="#991b1b" strokeOpacity="0.55" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M22.5 44 C32 37.5 68 37.5 77.5 44 L77 38.6 C68 32 32 32 23 38.6 Z" fill={url('white')} stroke="#94a3b8" strokeWidth="0.8" />
            <Rim d="M27 33 C31 24 39 19 47 18" opacity={0.6} />
            <g className="art-i-bob" style={{ '--amp': '-1.8px', '--dur': '3.4s' }}>
                <circle cx="50" cy="14" r="6.6" fill={url('white')} stroke="#94a3b8" strokeWidth="0.8" />
                <circle cx="47.8" cy="11.8" r="2.2" fill="#fff" />
            </g>
        </Portrait>
    );
};

/* ───────────── Búho ───────────── */
export const Owl = () => {
    const [id, url] = useArtIds();
    const head = 'M25 31 L19 13 C29 16.5 36 21 40 25 C46 23.6 54 23.6 60 25 C64 21 71 16.5 81 13 L75 31 C79 38 80.5 46 79.5 54 C78.5 69 66 78 50 78 C34 78 21.5 69 20.5 54 C19.5 46 21 38 25 31 Z';
    const back = (
        <>
            <Sparkle x={22} y={36} r={2.2} opacity={0.8} />
            <Sparkle x={80} y={70} r={1.8} opacity={0.6} />
            <Sparkle x={84} y={40} r={1.4} opacity={0.7} />
            <circle cx="17" cy="66" r="0.9" fill="#fff" opacity="0.6" />
        </>
    );
    return (
        <Portrait id={id} url={url} disc={['#34d399', '#047857', '#022c22']} back={back}>
            <defs>
                <MaterialGradient id={id('fur')} light="#e0b07a" base="#a2652e" dark="#5e3313" />
                <MaterialGradient id={id('face')} light="#fffaf2" base="#fde7c8" dark="#e3b277" />
                <MaterialGradient id={id('beak')} light="#fef3c7" base="#fbbf24" dark="#b45309" />
                <MaterialGradient id={id('cap')} light="#6366f1" base="#312e81" dark="#110f33" />
                <MaterialGradient id={id('gold')} light="#fef9c3" base="#facc15" dark="#a16207" />
            </defs>
            <path d={BODY} fill={url('fur')} stroke="#4a260c" strokeWidth="1.2" />
            <path d="M35 80 C40 77 60 77 65 80 C67 90 62 98 50 100 C38 98 33 90 35 80 Z" fill={url('face')} />
            <path d="M40 84 q2.5 2.6 5 0 q2.5 2.6 5 0 q2.5 2.6 5 0 q2.5 2.6 5 0 M38 90 q3 2.6 6 0 q3 2.6 6 0 q3 2.6 6 0 q3 2.6 6 0" stroke="#c08a4f" strokeWidth="1" strokeLinecap="round" />
            <path d={BODY} fill={url('shade')} />
            {/* Cabeza con penachos */}
            <path d={head} fill={url('fur')} stroke="#4a260c" strokeWidth="1.2" strokeLinejoin="round" />
            <path d={head} fill={url('shade')} />
            <Rim d="M22 51 C21.5 43 23 37 26 31.5" opacity={0.45} />
            {/* Disco facial */}
            <path d="M50 40 C53 35 58 34 62 34 C70 34 75.5 41 75.5 49.5 C75.5 59 68.5 66 60 66 C56 66 52.5 64.5 50 62 C47.5 64.5 44 66 40 66 C31.5 66 24.5 59 24.5 49.5 C24.5 41 30 34 38 34 C42 34 47 35 50 40 Z" fill={url('face')} stroke="#c08a4f" strokeWidth="0.9" />
            <path d="M33 37 Q40 33 47 38 M53 38 Q60 33 67 37" stroke="#7a4219" strokeWidth="1.8" strokeLinecap="round" />
            <Eyes id={id} url={url} at={[39, 61]} y={50} rx={7} ry={7.2} iris={['#7c2d12', '#fb923c']} ring="#5e3313" irisScale={0.82} />
            <path d="M46.5 56.5 Q50 54.6 53.5 56.5 L50 64.5 Z" fill={url('beak')} stroke="#92400e" strokeWidth="0.8" strokeLinejoin="round" />
            <Blush at={[29, 71]} y={60} rx={3.4} ry={2} opacity={0.45} />
            {/* Birrete */}
            <path d="M37 22.5 L37 28.5 C43 31.5 57 31.5 63 28.5 L63 22.5 Z" fill={url('cap')} stroke="#0b0a24" strokeWidth="0.8" />
            <path d="M27 21.5 L50 12.5 L73 21.5 L50 30 Z" fill={url('cap')} stroke="#0b0a24" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M30.5 21.4 L50 14" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="50" cy="21" r="1.4" fill={url('gold')} />
            <g className="art-i-sway art-o-top" style={{ '--amp': '7deg', '--dur': '3.6s' }}>
                <path d="M50 21 L68.5 23 L69.5 33" stroke="#facc15" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M67.6 32.5 L71.4 32.5 L72 38 L67 38 Z" fill={url('gold')} stroke="#a16207" strokeWidth="0.6" strokeLinejoin="round" />
            </g>
        </Portrait>
    );
};
