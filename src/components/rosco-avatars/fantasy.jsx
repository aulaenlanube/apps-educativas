import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { MaterialGradient, GlowGradient, Sparkle } from '@/components/art/primitives';
import { Portrait, Eyes, Smile, Blush, Shine, Rim, BODY, MIRROR } from './kit';

/* ───────────── Unicornio ───────────── */
export const Unicorn = () => {
    const [id, url] = useArtIds();
    const head = 'M50 26 C64 26 74 35 75 47 C76 56 73 62 69 66 C64 72 57 75 50 75 C43 75 36 72 31 66 C27 62 24 56 25 47 C26 35 36 26 50 26 Z';
    const ear = 'M30 37 C27 30 27 22 29.5 15 C35 18 39 23 41 29 Z';
    return (
        <Portrait id={id} url={url} disc={['#fbcfe8', '#ec4899', '#831843']}>
            <defs>
                <MaterialGradient id={id('pearl')} light="#ffffff" base="#f5f3ff" dark="#c4b5fd" />
                <MaterialGradient id={id('snout')} light="#fff1f7" base="#fce7f3" dark="#f9a8d4" />
                <MaterialGradient id={id('horn')} light="#fef9c3" base="#fcd34d" dark="#d97706" />
                <MaterialGradient id={id('m1')} light="#fbcfe8" base="#f472b6" dark="#be185d" />
                <MaterialGradient id={id('m2')} light="#ddd6fe" base="#a78bfa" dark="#6d28d9" />
                <MaterialGradient id={id('m3')} light="#cffafe" base="#22d3ee" dark="#0e7490" />
            </defs>
            {/* Crin por detrás (lado derecho) */}
            <path d="M62 28 C78 30 87 42 86 56 C85.5 66 88 74 92 80 C80 80 73 72 72 60 C71 50 68 40 62 28 Z" fill={url('m2')} stroke="#5b21b6" strokeWidth="0.9" />
            <path d="M58 26 C72 25 80 36 79 50 C78.5 60 80 68 84 74 C74 72 69 64 69 54 C69 44 66 34 58 26 Z" fill={url('m3')} stroke="#0e7490" strokeWidth="0.9" />
            <path d={BODY} fill={url('pearl')} stroke="#a78bfa" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <ellipse cx="50" cy="75" rx="21" ry="5.4" fill={url('drop')} />
            {/* Orejas */}
            <path d={ear} fill={url('pearl')} stroke="#a78bfa" strokeWidth="1" strokeLinejoin="round" />
            <path d="M32 33 C30.5 28 30.5 23 32 18.5 C35 21 37 24 38 28 Z" fill="#f9a8d4" />
            <g transform={MIRROR}>
                <path d={ear} fill={url('pearl')} stroke="#a78bfa" strokeWidth="1" strokeLinejoin="round" />
                <path d="M32 33 C30.5 28 30.5 23 32 18.5 C35 21 37 24 38 28 Z" fill="#f9a8d4" />
            </g>
            {/* Cabeza */}
            <path d={head} fill={url('pearl')} stroke="#a78bfa" strokeWidth="1.1" />
            <path d={head} fill={url('shade')} opacity="0.7" />
            <ellipse cx="50" cy="64" rx="13.5" ry="9.2" fill={url('snout')} />
            <Shine url={url} cx={38} cy={36} rx={8} ry={3.2} opacity={0.9} />
            <Rim d="M27 47 C27 37 34 29.5 44 27.5" opacity={0.7} />
            {/* Cuerno */}
            <path d="M44.5 29.5 L50 3 L55.5 29.5 C52 31 48 31 44.5 29.5 Z" fill={url('horn')} stroke="#b45309" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M45.6 25 L54.6 21.6 M46.6 18.6 L53.4 15.6 M47.8 12.4 L52.2 10.4" stroke="#b45309" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
            <path d="M47 27 L50 6.5" stroke="#fff" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
            {/* Flequillo arcoíris */}
            <path d="M50 28 C42 25 33 28 31 37 C36 33 42 33 47 37 C46 33 47.5 30 50 28 Z" fill={url('m1')} stroke="#be185d" strokeWidth="0.8" />
            <path d="M51 28 C58 26 65 29 67 36 C62 33 57 33.5 53.5 36.5 C54 33 53 30 51 28 Z" fill={url('m2')} stroke="#5b21b6" strokeWidth="0.8" />
            <Eyes id={id} url={url} at={[39, 61]} y={48} rx={5.6} ry={6.6} iris={['#3b0764', '#c084fc']} ring="#4c1d95" lashes />
            <Blush at={[30, 70]} y={58} rx={4.2} />
            <ellipse cx="45" cy="63" rx="1.3" ry="0.9" fill="#db2777" opacity="0.7" />
            <ellipse cx="55" cy="63" rx="1.3" ry="0.9" fill="#db2777" opacity="0.7" />
            <Smile id={id} url={url} y={67} w={4} open={false} color="#9d174d" />
            <Sparkle x={60} y={9} r={3.2} idle delay={0.3} />
            <Sparkle x={38} y={14} r={1.8} opacity={0.85} />
        </Portrait>
    );
};

/* ───────────── Dragón ───────────── */
export const Dragon = () => {
    const [id, url] = useArtIds();
    const head = 'M50 25 C64 25 74 32.5 76 44 C77 50 76 55 74 59 C71 68 62 74 50 74 C38 74 29 68 26 59 C24 55 23 50 24 44 C26 32.5 36 25 50 25 Z';
    const horn = 'M34 31 C28 25 24 17 25.5 7 C30 13 36 19 41 27 Z';
    const fin = 'M25 44 L11 37 L15.5 45 L9 50 L23 53 Z';
    return (
        <Portrait id={id} url={url} disc={['#fecaca', '#dc2626', '#7f1d1d']}>
            <defs>
                <MaterialGradient id={id('scale')} light="#86efac" base="#22c55e" dark="#166534" />
                <MaterialGradient id={id('belly')} light="#fef9c3" base="#fde047" dark="#ca8a04" />
                <MaterialGradient id={id('horn')} light="#fffbeb" base="#fde68a" dark="#b45309" />
                <MaterialGradient id={id('fin')} light="#5eead4" base="#0d9488" dark="#134e4a" />
                <MaterialGradient id={id('snout')} light="#dcfce7" base="#bbf7d0" dark="#4ade80" />
            </defs>
            {/* Alas */}
            <path d="M24 86 L8 63 L15 66 L13 55 L24 66 L28 78 Z" fill={url('fin')} stroke="#134e4a" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M76 86 L92 63 L85 66 L87 55 L76 66 L72 78 Z" fill="#0f766e" stroke="#134e4a" strokeWidth="0.9" strokeLinejoin="round" />
            <path d={BODY} fill={url('scale')} stroke="#14532d" strokeWidth="1.2" />
            <path d="M38 77 C42 76 58 76 62 77 C63 87 58 96 50 100 C42 96 37 87 38 77 Z" fill={url('belly')} />
            <path d="M39 82 Q50 85 61 82 M40 88 Q50 91 60 88 M43 94 Q50 96.5 57 94" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round" />
            <path d={BODY} fill={url('shade')} />
            <ellipse cx="50" cy="74" rx="21" ry="5.4" fill={url('drop')} />
            {/* Aletas y cuernos */}
            <path d={fin} fill={url('fin')} stroke="#134e4a" strokeWidth="0.9" strokeLinejoin="round" />
            <g transform={MIRROR}><path d={fin} fill="#0f766e" stroke="#134e4a" strokeWidth="0.9" strokeLinejoin="round" /></g>
            <path d={horn} fill={url('horn')} stroke="#92400e" strokeWidth="0.9" strokeLinejoin="round" />
            <g transform={MIRROR}><path d={horn} fill={url('horn')} stroke="#92400e" strokeWidth="0.9" strokeLinejoin="round" /></g>
            <path d="M27.5 10.5 C28.5 16 32 21 35.5 25" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
            {/* Púas de la cresta */}
            <path d="M43.5 26.5 L46.5 18.5 L50 25 L53.5 18.5 L56.5 26.5 Z" fill="#f97316" stroke="#9a3412" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Cabeza */}
            <path d={head} fill={url('scale')} stroke="#14532d" strokeWidth="1.2" />
            <path d={head} fill={url('shade')} />
            <path d="M36 31 q2.5 2 5 0 M59 31 q2.5 2 5 0 M47.5 31 q2.5 2 5 0" stroke="#15803d" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
            <Shine url={url} cx={38} cy={33} rx={9} ry={3.4} />
            <Rim d="M25.5 45 C27 34.5 35 27.5 46 26.4" />
            <ellipse cx="50" cy="62.5" rx="14.5" ry="9.6" fill={url('snout')} />
            <path d="M33 40 Q39 36.5 45 40.5 M55 40.5 Q61 36.5 67 40" stroke="#14532d" strokeWidth="2" strokeLinecap="round" />
            <Eyes id={id} url={url} at={[39, 61]} y={48} rx={5.6} ry={6.4} iris={['#713f12', '#facc15']} ring="#14532d" pupil={0.24} />
            <ellipse cx="45" cy="58.6" rx="1.7" ry="1.1" fill="#166534" />
            <ellipse cx="55" cy="58.6" rx="1.7" ry="1.1" fill="#166534" />
            <path d="M41 64 Q50 70.5 59 64" stroke="#14532d" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M54.2 66.4 L55.6 69.8 L57 65.6 Z" fill="#fff" stroke="#14532d" strokeWidth="0.5" strokeLinejoin="round" />
            <Blush at={[31, 69]} y={58} rx={3.6} ry={2.2} color="#f97316" opacity={0.4} />
            {/* Bocanadas de humo */}
            <g className="art-i-glow" style={{ '--lo': '0.15', '--hi': '0.9', '--dur': '3.2s' }}>
                <circle cx="66" cy="61.5" r="2.2" fill="#f1f5f9" />
                <circle cx="71" cy="59" r="2.8" fill="#f1f5f9" />
                <circle cx="76.5" cy="57.8" r="1.9" fill="#f1f5f9" />
            </g>
        </Portrait>
    );
};

/* ───────────── Robot (la mascota de EduApps) ───────────── */
export const Robot = () => {
    const [id, url] = useArtIds();
    return (
        <Portrait id={id} url={url} disc={['#cffafe', '#06b6d4', '#155e75']}>
            <defs>
                <MaterialGradient id={id('head')} light="#a5b4fc" base="#6366f1" dark="#312e81" />
                <MaterialGradient id={id('body')} light="#818cf8" base="#5b4ff0" dark="#312e81" />
                <MaterialGradient id={id('limb')} light="#c4b5fd" base="#818cf8" dark="#4338ca" />
                <linearGradient id={id('visor')} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="60%" stopColor="#0b0a24" />
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
                <radialGradient id={id('metal')} cx="0.35" cy="0.3" r="0.75">
                    <stop offset="0%" stopColor="#f1f0ff" />
                    <stop offset="50%" stopColor="#a5a3c9" />
                    <stop offset="100%" stopColor="#47456b" />
                </radialGradient>
                <GlowGradient id={id('pink')} color="#f0abfc" opacity={0.9} />
                <GlowGradient id={id('cyan')} color="#67e8f9" opacity={0.95} />
            </defs>
            <path d={BODY} fill={url('body')} stroke="#1e1b4b" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <Rim d="M20 90 C23 82 30 78 38 77" opacity={0.4} />
            <circle cx="50" cy="88" r="9" fill={url('cyan')} />
            <circle cx="50" cy="88" r="4.6" fill="#ecfeff" stroke="#22d3ee" strokeWidth="1.4" />
            <rect x="43" y="68" width="14" height="9" rx="2.5" fill={url('metal')} />
            <rect x="41.5" y="71.2" width="17" height="2.2" rx="1.1" fill="#4338ca" />
            {/* Antena */}
            <path d="M50 29 L50 18.5 L46.5 12.5" stroke="#4f46e5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="19" r="1.8" fill={url('metal')} />
            <g className="art-i-glow" style={{ '--lo': '0.3', '--hi': '1', '--dur': '2.4s' }}>
                <circle cx="46" cy="10.5" r="9" fill={url('pink')} />
            </g>
            <circle cx="46" cy="10.5" r="4.6" fill={url('orb')} />
            <circle cx="44.4" cy="8.9" r="1.6" fill="#fff" opacity="0.85" />
            {/* Orejeras */}
            <rect x="17.5" y="40" width="9" height="20" rx="4.5" fill={url('limb')} stroke="#312e81" strokeWidth="0.9" />
            <rect x="73.5" y="40" width="9" height="20" rx="4.5" fill={url('limb')} stroke="#312e81" strokeWidth="0.9" />
            <circle cx="22" cy="50" r="1.8" fill="#67e8f9" />
            <circle cx="78" cy="50" r="1.8" fill="#67e8f9" />
            {/* Cabeza */}
            <rect x="23" y="27.5" width="54" height="44" rx="17" fill={url('head')} stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="23" y="27.5" width="54" height="44" rx="17" fill={url('shade')} />
            <path d="M31 33 Q40 29.5 54 30" stroke={url('gloss')} strokeWidth="3.4" strokeLinecap="round" opacity="0.8" />
            <Rim d="M24.6 52 C24.2 42 26 35 32 31" opacity={0.45} />
            {/* Visor */}
            <rect x="28" y="36.5" width="44" height="27" rx="13" fill={url('visor')} stroke="#0b0a24" strokeWidth="1" />
            <path d="M32 41 Q36 38.6 42 38.6" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round" />
            <g className="art-i-blink" style={{ '--dur': '5.2s' }}>
                <circle cx="40" cy="49.5" r="6" fill="#eef0ff" />
                <circle cx="40.4" cy="50" r="3.6" fill={url('iris')} />
                <circle cx="40.4" cy="50" r="1.6" fill="#0b0a24" />
                <circle cx="38.8" cy="48.3" r="1.3" fill="#fff" />
                <circle cx="59.5" cy="48.6" r="7.6" fill="#eef0ff" />
                <circle cx="60" cy="49.2" r="4.5" fill={url('iris')} />
                <circle cx="60" cy="49.2" r="2" fill="#0b0a24" />
                <circle cx="58" cy="47" r="1.6" fill="#fff" />
            </g>
            <path d="M45.5 58 Q50 61 54.5 58" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="29.6" y="55" width="5" height="2" rx="1" fill="#f472b6" opacity="0.75" />
            <rect x="65.4" y="55" width="5" height="2" rx="1" fill="#f472b6" opacity="0.75" />
        </Portrait>
    );
};

/* ───────────── Alienígena ───────────── */
export const Alien = () => {
    const [id, url] = useArtIds();
    const head = 'M50 22 C66 22 78 32 78 45 C78 58 66 71 50 75 C34 71 22 58 22 45 C22 32 34 22 50 22 Z';
    const back = (
        <>
            <Sparkle x={20} y={40} r={2.2} opacity={0.85} />
            <Sparkle x={82} y={68} r={1.8} opacity={0.7} />
            <circle cx="80" cy="33" r="1" fill="#fff" opacity="0.7" />
            <circle cx="17" cy="70" r="0.9" fill="#fff" opacity="0.6" />
        </>
    );
    return (
        <Portrait id={id} url={url} disc={['#a855f7', '#581c87', '#1e0838']} back={back}>
            <defs>
                <MaterialGradient id={id('skin')} light="#ecfccb" base="#84cc16" dark="#3f6212" />
                <MaterialGradient id={id('suit')} light="#f8fafc" base="#cbd5e1" dark="#64748b" />
                <radialGradient id={id('bulb')} cx="0.35" cy="0.3" r="0.7">
                    <stop offset="0%" stopColor="#fdf4ff" />
                    <stop offset="45%" stopColor="#f0abfc" />
                    <stop offset="100%" stopColor="#c026d3" />
                </radialGradient>
                <GlowGradient id={id('halo')} color="#f0abfc" opacity={0.7} />
            </defs>
            <path d={BODY} fill={url('suit')} stroke="#475569" strokeWidth="1.2" />
            <path d={BODY} fill={url('shade')} />
            <path d="M31 77 C40 82 60 82 69 77 L70 81.5 C60 88 40 88 30 81.5 Z" fill="#a855f7" stroke="#581c87" strokeWidth="0.8" />
            <circle cx="61" cy="91" r="4.2" fill="#22d3ee" stroke="#0e7490" strokeWidth="0.8" />
            <ellipse cx="61" cy="91" rx="6.6" ry="1.6" stroke="#fde047" strokeWidth="1" transform="rotate(-20 61 91)" />
            <ellipse cx="50" cy="74.5" rx="21" ry="5.4" fill={url('drop')} />
            {/* Antenas (se balancean) */}
            <g className="art-i-sway art-o-bottom" style={{ '--amp': '6deg', '--dur': '3.4s' }}>
                <path d="M41 26 C38 19 34 14 30 11" stroke="#65a30d" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M59 26 C62 19 66 14 70 11" stroke="#65a30d" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="29.5" cy="10.5" r="7" fill={url('halo')} />
                <circle cx="70.5" cy="10.5" r="7" fill={url('halo')} />
                <circle cx="29.5" cy="10.5" r="3.6" fill={url('bulb')} />
                <circle cx="70.5" cy="10.5" r="3.6" fill={url('bulb')} />
                <circle cx="28.4" cy="9.3" r="1.1" fill="#fff" />
                <circle cx="69.4" cy="9.3" r="1.1" fill="#fff" />
            </g>
            {/* Cabeza */}
            <path d={head} fill={url('skin')} stroke="#365314" strokeWidth="1.2" />
            <path d={head} fill={url('shade')} />
            <Shine url={url} cx={38} cy={30} rx={10} ry={3.8} opacity={0.85} />
            <Rim d="M24 46 C24 35 32 26 44 23.5" opacity={0.6} />
            <g fill="#bef264" opacity="0.8">
                <circle cx="58" cy="30" r="1.8" /><circle cx="63" cy="33.5" r="1.1" /><circle cx="33" cy="62" r="1.2" />
            </g>
            <Eyes id={id} url={url} at={[37.5, 62.5]} y={47} rx={8.2} ry={9.6} iris={['#0c0618', '#a855f7']} ring="#1a2e05" sclera="#0c0618" irisScale={0.86} pupil={0.3} look={0} />
            <Blush at={[31, 69]} y={60} rx={3.6} ry={2} color="#f472b6" opacity={0.5} />
            <Smile id={id} url={url} y={63} w={3.4} color="#1a2e05" />
        </Portrait>
    );
};

/* ───────────── Fantasma ───────────── */
export const Ghost = () => {
    const [id, url] = useArtIds();
    const body = 'M50 17 C67 17 78 30 78 49 L78 84 C74.5 88 71 82 66.5 85.5 C62 89 58.5 83 54.5 86.5 C50.5 90 46.5 84 42.5 87 C38.5 90 34.5 84 30.5 86.5 C26.5 89 23.5 85 22 83 L22 49 C22 30 33 17 50 17 Z';
    const back = (
        <>
            <Sparkle x={19} y={34} r={2.2} opacity={0.85} />
            <Sparkle x={83} y={70} r={1.6} opacity={0.7} />
            <circle cx="82" cy="36" r="1" fill="#fff" opacity="0.7" />
        </>
    );
    return (
        <Portrait id={id} url={url} disc={['#a5b4fc', '#4f46e5', '#1e1b4b']} back={back}>
            <defs>
                <MaterialGradient id={id('ecto')} light="#ffffff" base="#eef2ff" dark="#a5b4fc" />
                <GlowGradient id={id('aura')} color="#e0e7ff" opacity={0.6} />
            </defs>
            <circle cx="50" cy="52" r="34" fill={url('aura')} />
            <g className="art-i-bob" style={{ '--amp': '-2.4px', '--dur': '3.8s' }}>
                {/* Bracitos en pose de "¡bu!" */}
                <path d="M23 58 C15 57 10.5 51 11 45.5 C16 46.5 20 50 23.5 53 Z" fill={url('ecto')} stroke="#818cf8" strokeWidth="1" strokeLinejoin="round" />
                <path d="M77 58 C85 57 89.5 51 89 45.5 C84 46.5 80 50 76.5 53 Z" fill="#c7d2fe" stroke="#818cf8" strokeWidth="1" strokeLinejoin="round" />
                <path d={body} fill={url('ecto')} stroke="#818cf8" strokeWidth="1.2" strokeLinejoin="round" />
                <path d={body} fill={url('shade')} opacity="0.8" />
                <Shine url={url} cx={37} cy={27} rx={10} ry={4} opacity={0.95} />
                <Rim d="M24.5 50 C24.5 34 32 22.5 45 19.5" opacity={0.85} w={1.6} />
                <Eyes id={id} url={url} at={[40, 60]} y={45} rx={6} ry={7.4} iris={['#1e1b4b', '#6366f1']} ring="#312e81" sclera="#1e1b4b" irisScale={0.84} pupil={0.32} look={0} />
                <Blush at={[31, 69]} y={56} rx={4.2} ry={2.4} color="#f472b6" opacity={0.55} />
                <ellipse cx="50" cy="60" rx="4.2" ry="5.2" fill="#312e81" />
                <ellipse cx="50" cy="62.6" rx="2.8" ry="2" fill="#f472b6" />
            </g>
        </Portrait>
    );
};
