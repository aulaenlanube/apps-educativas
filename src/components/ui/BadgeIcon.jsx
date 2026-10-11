import React from 'react';
import './BadgeIcon.css';
import BADGE_OVERRIDES from '@/components/icons/badge';

// ─────────────────────────────────────────────────────────────────────────────
// Insignias (viewBox 64×64) dentro de un medallón por rareza (CSS).
//   · Ilustraciones libres (common/rare/epic): src/components/icons/badge/*
//     (BADGE_OVERRIDES, rediseño 2026, ver su README).
//   · Legendarias y míticas: aquí abajo, con su marco propio (legFrame/mythBadge).
// La capa <g className="ba-anim anim-X"> solo se anima con `animated` (modal).
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MEDALLÓN LEGENDARIO
// Marco común dorado y opulento (halo + rayos giratorios + aro con filigrana
// + sparkles). Cada legendaria solo define su icono central.
// ─────────────────────────────────────────────────────────────────────────────

const LEG_ACCENT = {
  battle_rank:      { accent: '#f97316', dark: '#7c2d12', gem: '#dc2626' },
  dedication:       { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
  exams:            { accent: '#34d399', dark: '#065f46', gem: '#10b981' },
  exploration:      { accent: '#22d3ee', dark: '#155e75', gem: '#06b6d4' },
  general:          { accent: '#fbbf24', dark: '#78350f', gem: '#dc2626' },
  mastery:          { accent: '#c084fc', dark: '#581c87', gem: '#a855f7' },
  programacion:     { accent: '#22d3ee', dark: '#0f172a', gem: '#06b6d4' },
  ranking:          { accent: '#fde047', dark: '#14532d', gem: '#10b981' },
  speed:            { accent: '#fbbf24', dark: '#9a3412', gem: '#f97316' },
  streaks:          { accent: '#fb923c', dark: '#7f1d1d', gem: '#ef4444' },
  subjects:         { accent: '#fde047', dark: '#451a03', gem: '#92400e' },
  teacher_battles:  { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
  teacher_groups:   { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
  teacher_messages: { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
  teacher_platform: { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
  teacher_students: { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
  teacher_tasks:    { accent: '#60a5fa', dark: '#1e3a8a', gem: '#2563eb' },
};

const LEG_CAT = {
  battle_win_10: 'battle_rank',
  battle_played_50: 'battle_rank',
  time_100h: 'dedication',
  exams_200: 'exams',
  apps_30: 'exploration',
  games_1000: 'general',
  perfect_50: 'mastery',
  perfect_10_apps: 'mastery',
  perfect_15_apps: 'mastery',
  robot_retos_eso4: 'programacion',
  rank_top3_10: 'ranking',
  rank_first_10: 'ranking',
  rank_class1_10: 'ranking',
  speed_perfect: 'speed',
  speed_5s: 'speed',
  speed_perf_10: 'speed',
  streak_100: 'streaks',
  subjects_10: 'subjects',
  teacher_battles_30: 'teacher_battles',
  teacher_groups_10: 'teacher_groups',
  teacher_messages_100: 'teacher_messages',
  teacher_days_365: 'teacher_platform',
  teacher_students_100: 'teacher_students',
  teacher_tasks_50: 'teacher_tasks',
};

const legFrame = (id, accent, dark, gem, children) => (
  <>
    <defs>
      <radialGradient id={`${id}lhalo`} cx="0.5" cy="0.5">
        <stop offset="0" stopColor={accent} stopOpacity="0.75" />
        <stop offset="0.5" stopColor={accent} stopOpacity="0.25" />
        <stop offset="1" stopColor={accent} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}lring`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffbeb" />
        <stop offset="0.25" stopColor="#fde047" />
        <stop offset="0.55" stopColor="#d97706" />
        <stop offset="1" stopColor="#451a03" />
      </linearGradient>
      <radialGradient id={`${id}lcenter`} cx="0.5" cy="0.4">
        <stop offset="0" stopColor={accent} stopOpacity="0.95" />
        <stop offset="0.55" stopColor={dark} />
        <stop offset="1" stopColor="#0f0a06" />
      </radialGradient>
    </defs>

    {/* Halo radial pulsante */}
    <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
      <circle cx="32" cy="32" r="32" fill={`url(#${id}lhalo)`} />
    </g>

    {/* Rayos giratorios detrás */}
    <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30) * Math.PI / 180;
        const r1 = 24, r2 = 31;
        const x1 = 32 + Math.cos(a) * r1, y1 = 32 + Math.sin(a) * r1;
        const x2 = 32 + Math.cos(a) * r2, y2 = 32 + Math.sin(a) * r2;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#fde047" strokeWidth={i % 2 ? 1 : 1.8}
                strokeLinecap="round" opacity="0.65" />
        );
      })}
    </g>

    {/* Aro dorado con sombras concéntricas */}
    <circle cx="32" cy="32" r="26" fill="#451a03" />
    <circle cx="32" cy="32" r="25" fill="none" stroke={`url(#${id}lring)`} strokeWidth="4" />
    <circle cx="32" cy="32" r="23" fill="none" stroke="#7c2d12" strokeWidth="0.8" />

    {/* Disco central */}
    <circle cx="32" cy="32" r="21" fill={`url(#${id}lcenter)`} stroke="#1f0a02" strokeWidth="1" />
    <circle cx="32" cy="32" r="20" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.55" />

    {/* Filigrana: 6 joyas en el aro cada 60° */}
    {Array.from({ length: 6 }).map((_, i) => {
      const a = (i * 60 - 90) * Math.PI / 180;
      const x = 32 + Math.cos(a) * 25;
      const y = 32 + Math.sin(a) * 25;
      return (
        <g key={`gem${i}`}>
          <circle cx={x} cy={y} r="2.4" fill="#7c2d12" />
          <circle cx={x} cy={y} r="2" fill={gem} stroke="#1c1410" strokeWidth="0.5" />
          <circle cx={x - 0.55} cy={y - 0.55} r="0.55" fill="#fef3c7" opacity="0.85" />
        </g>
      );
    })}

    {/* Icono central */}
    {children}

    {/* Sparkles parpadeantes */}
    <g className="ba-anim anim-twinkle">
      <path d="M50 12 L51 14 L53 15 L51 16 L50 18 L49 16 L47 15 L49 14 Z" fill="#fef3c7" />
    </g>
    <g className="ba-anim anim-twinkle-2">
      <path d="M14 50 L15 51.4 L16.6 52 L15 52.6 L14 54 L13 52.6 L11.4 52 L13 51.4 Z" fill="#fde047" />
    </g>
    <g className="ba-anim anim-twinkle-3">
      <circle cx="13" cy="14" r="1" fill="#fde047" />
      <circle cx="51" cy="51" r="1" fill="#fef3c7" />
    </g>
  </>
);

// Iconos centrales: ocupan aprox la zona (22, 22)–(42, 42) sobre el disco oscuro.
const LEG_CENTER = {
  battle_win_10: () => (
    <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
      <path d="M27 19 Q27 16 32 16 Q37 16 37 19 V21 H27 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.7" />
      <path d="M27 21 H37 V22 H27 Z" fill="#7f1d1d" />
      <path d="M24 25 Q24 22 32 22 Q40 22 40 25 V36 Q40 42 32 44 Q24 42 24 36 Z" fill="#e2e8f0" stroke="#1f2937" strokeWidth="1" />
      <path d="M25 25 Q25 23 32 23 Q39 23 39 25 V28 H25 Z" fill="#f8fafc" opacity="0.7" />
      <rect x="25" y="29" width="14" height="5" fill="#1f2937" />
      <rect x="27" y="30.5" width="3" height="2" fill="#fbbf24" />
      <rect x="34" y="30.5" width="3" height="2" fill="#fbbf24" />
      <line x1="25" y1="35" x2="39" y2="35" stroke="#fde047" strokeWidth="0.5" />
      <path d="M28 38 Q32 41 36 38" stroke="#1f2937" strokeWidth="0.6" fill="none" />
    </g>
  ),
  battle_played_50: () => (
    <g>
      <path d="M22 23 H42 L40 26 H24 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      <rect x="23" y="26" width="18" height="14" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M${24.5 + i * 5.5} 28 Q${27 + i * 5.5} 27 ${29.5 + i * 5.5} 28 V31 H${24.5 + i * 5.5} Z`} fill="#1f2937" />
          <path d={`M${24.5 + i * 5.5} 33 Q${27 + i * 5.5} 32 ${29.5 + i * 5.5} 33 V36 H${24.5 + i * 5.5} Z`} fill="#1f2937" />
        </g>
      ))}
      <rect x="22" y="40" width="20" height="3" fill="#92400e" stroke="#451a03" strokeWidth="0.5" />
      <line x1="22" y1="41.5" x2="42" y2="41.5" stroke="#fde047" strokeWidth="0.4" opacity="0.8" />
    </g>
  ),
  time_100h: () => (
    <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 32px' }}>
      <rect x="20" y="21" width="24" height="2" rx="0.5" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      <rect x="20" y="41" width="24" height="2" rx="0.5" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      <path d="M22 23 H42 L34 32 L42 41 H22 L30 32 Z" fill="#fef3c7" stroke="#92400e" strokeWidth="1" opacity="0.95" />
      <path d="M24 24 H40 L33 30 L31 30 Z" fill="#fde047" />
      <path d="M24 40 H40 L37 35 L27 35 Z" fill="#d97706" />
      <line x1="32" y1="30" x2="32" y2="34" stroke="#fde047" strokeWidth="0.8" className="ba-anim anim-fall" />
    </g>
  ),
  exams_200: () => (
    <g>
      <rect x="22" y="22" width="20" height="16" rx="1" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      <rect x="22" y="22" width="20" height="3" fill="#fde047" />
      <line x1="25" y1="28" x2="36" y2="28" stroke="#92400e" strokeWidth="0.5" />
      <line x1="25" y1="30" x2="38" y2="30" stroke="#92400e" strokeWidth="0.5" />
      <line x1="25" y1="32" x2="36" y2="32" stroke="#92400e" strokeWidth="0.5" />
      <line x1="25" y1="34" x2="33" y2="34" stroke="#92400e" strokeWidth="0.5" />
      <circle cx="38" cy="40" r="3.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
      <path d="M36.5 40 L37.5 41 L39.5 38.8" stroke="#fef3c7" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M34 41 L36 45 L37.5 43 L39 45 L41 41 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
    </g>
  ),
  apps_30: () => (
    <g>
      <path d="M19 32 Q32 21 45 32 Q32 43 19 32 Z" fill="#fef3c7" stroke="#1f2937" strokeWidth="1" />
      <circle cx="32" cy="32" r="6" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.6" />
      <circle cx="32" cy="32" r="5" fill="#1d4ed8" />
      <circle cx="32" cy="32" r="3" fill="#1f2937" />
      <circle cx="33.5" cy="30.5" r="1.1" fill="#fef3c7" />
      <g className="ba-anim anim-twinkle-3">
        <circle cx="34" cy="34" r="0.5" fill="#bfdbfe" />
      </g>
    </g>
  ),
  games_1000: () => (
    <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
      <path d="M22 26 L24 22 L27 26 L30 21 L34 21 L37 26 L40 22 L42 26 V36 H22 Z" fill="#fde047" stroke="#92400e" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="24" cy="22" r="1" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.3" />
      <circle cx="32" cy="20" r="1.2" fill="#10b981" stroke="#065f46" strokeWidth="0.3" />
      <circle cx="40" cy="22" r="1" fill="#2563eb" stroke="#1e3a8a" strokeWidth="0.3" />
      <circle cx="27" cy="32" r="1.6" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
      <circle cx="32" cy="32" r="1.6" fill="#2563eb" stroke="#1e3a8a" strokeWidth="0.4" />
      <circle cx="37" cy="32" r="1.6" fill="#10b981" stroke="#065f46" strokeWidth="0.4" />
      <rect x="22" y="36" width="20" height="3" fill="#b45309" stroke="#451a03" strokeWidth="0.6" />
      <line x1="22" y1="37.5" x2="42" y2="37.5" stroke="#fde047" strokeWidth="0.4" />
    </g>
  ),
  perfect_50: () => (
    <g className="ba-anim anim-twinkle" style={{ transformOrigin: '32px 32px' }}>
      <path d="M22 28 L26 22 L38 22 L42 28 L32 44 Z" fill="#c084fc" stroke="#3b0764" strokeWidth="1" />
      <path d="M22 28 H42" stroke="#3b0764" strokeWidth="0.6" />
      <path d="M26 22 L32 28 L38 22" stroke="#3b0764" strokeWidth="0.6" fill="none" />
      <path d="M22 28 L32 44" stroke="#7c3aed" strokeWidth="0.4" />
      <path d="M42 28 L32 44" stroke="#7c3aed" strokeWidth="0.4" />
      <path d="M27 23 L25 27" stroke="#fef3c7" strokeWidth="1.2" fill="none" opacity="0.85" strokeLinecap="round" />
    </g>
  ),
  perfect_10_apps: () => (
    <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
      <path d="M32 19 L35 27 L43.5 27.5 L37 33 L39 41.5 L32 36.5 L25 41.5 L27 33 L20.5 27.5 L29 27 Z"
            fill="#fde047" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
      <path d="M32 22 L34 28 L40 28.4 L36 31.5" stroke="#fef3c7" strokeWidth="0.8" fill="none" opacity="0.9" />
      <circle cx="32" cy="31" r="1.6" fill="#fef3c7" opacity="0.85" />
    </g>
  ),
  perfect_15_apps: () => (
    <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
      <path d="M32 17 L33 20 L36 20.5 L34 22.5 L34.5 25 L32 23.5 L29.5 25 L30 22.5 L28 20.5 L31 20 Z"
            fill="#fef3c7" stroke="#92400e" strokeWidth="0.5" />
      <path d="M22 30 L26 26 L29 30 L32 24 L35 30 L38 26 L42 30 V38 H22 Z"
            fill="#fde047" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="32" cy="34" r="2.5" fill="#2563eb" stroke="#1e3a8a" strokeWidth="0.6" />
      <circle cx="31" cy="33" r="0.8" fill="#bfdbfe" />
      <rect x="22" y="38" width="20" height="3" fill="#b45309" stroke="#451a03" strokeWidth="0.5" />
    </g>
  ),
  // La mascota de la plataforma (RobotMascot) en miniatura: cabeza-monitor
  // índigo, visor oscuro, ojo derecho mayor, antena con orbe rosa y núcleo cian.
  robot_retos_eso4: () => (
    <g>
      <line x1="32" y1="17.5" x2="32" y2="21.5" stroke="#4f46e5" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="32" cy="17" r="2" fill="#f0abfc" stroke="#a21caf" strokeWidth="0.5" className="ba-anim anim-twinkle" style={{ transformOrigin: '32px 17px' }} />
      <circle cx="31.3" cy="16.3" r="0.6" fill="#fff" opacity="0.85" />
      <rect x="21.6" y="24.6" width="2.6" height="6" rx="1.3" fill="#818cf8" />
      <rect x="39.8" y="24.6" width="2.6" height="6" rx="1.3" fill="#4338ca" />
      <rect x="23" y="21" width="18" height="14.5" rx="5" fill="#6366f1" stroke="#312e81" strokeWidth="0.8" />
      <path d="M25.5 22.6 Q29 21.6 33.5 21.8" stroke="#c7d2fe" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.8" />
      <rect x="24.6" y="23.6" width="14.8" height="8.4" rx="4" fill="#0b0a24" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="0.5" />
      <circle cx="29.2" cy="27.8" r="2.2" fill="#fff" />
      <circle cx="29.4" cy="28" r="1.2" fill="#6366f1" />
      <circle cx="29" cy="27.5" r="0.45" fill="#fff" />
      <circle cx="34.6" cy="27.6" r="2.8" fill="#fff" />
      <circle cx="34.8" cy="27.8" r="1.5" fill="#6366f1" />
      <circle cx="34.3" cy="27.2" r="0.55" fill="#fff" />
      <path d="M30 33.4 Q32 34.6 34 33.4" stroke="#67e8f9" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M26.5 37 Q32 35.6 37.5 37 L38.2 43 Q32 45 25.8 43 Z" fill="#5b4ff0" stroke="#312e81" strokeWidth="0.8" />
      <circle cx="32" cy="40.2" r="2.3" fill="#0e7490" stroke="#a5f3fc" strokeWidth="0.5" />
      <circle cx="32" cy="40.2" r="1" fill="#ecfeff" className="ba-anim anim-pulse" style={{ transformOrigin: '32px 40.2px' }} />
    </g>
  ),
  rank_top3_10: () => (
    <g>
      <path d="M32 21 L33 24 L36 24.5 L34 26.5 L34.5 29 L32 27.5 L29.5 29 L30 26.5 L28 24.5 L31 24 Z"
            fill="#fde047" stroke="#92400e" strokeWidth="0.5" />
      <rect x="22" y="34" width="6" height="9" fill="#cbd5e1" stroke="#1f2937" strokeWidth="0.7" />
      <text x="25" y="40.5" fontSize="6" fontWeight="900" textAnchor="middle" fill="#1f2937" fontFamily="system-ui">2</text>
      <rect x="28" y="30" width="8" height="13" fill="#fde047" stroke="#92400e" strokeWidth="0.7" />
      <text x="32" y="39" fontSize="7" fontWeight="900" textAnchor="middle" fill="#7c2d12" fontFamily="system-ui">1</text>
      <rect x="36" y="36" width="6" height="7" fill="#d97706" stroke="#7c2d12" strokeWidth="0.7" />
      <text x="39" y="41.5" fontSize="6" fontWeight="900" textAnchor="middle" fill="#fef3c7" fontFamily="system-ui">3</text>
    </g>
  ),
  rank_first_10: () => (
    <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
      <path d="M22 26 Q18 26 18 30 V32" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M42 26 Q46 26 46 30 V32" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 24 H42 V32 Q42 39 32 40 Q22 39 22 32 Z" fill="#fde047" stroke="#92400e" strokeWidth="1" />
      <line x1="22" y1="26" x2="42" y2="26" stroke="#fef3c7" strokeWidth="0.6" />
      <line x1="22" y1="32" x2="42" y2="32" stroke="#92400e" strokeWidth="0.4" />
      <path d="M32 28 L33 30.5 L36 30.7 L33.7 32.4 L34.5 35 L32 33.6 L29.5 35 L30.3 32.4 L28 30.7 L31 30.5 Z"
            fill="#fef3c7" stroke="#92400e" strokeWidth="0.4" />
      <rect x="29" y="40" width="6" height="3" fill="#fde047" stroke="#92400e" strokeWidth="0.5" />
      <rect x="25" y="43" width="14" height="3" rx="0.5" fill="#92400e" stroke="#451a03" strokeWidth="0.5" />
    </g>
  ),
  rank_class1_10: () => (
    <g>
      <path d="M22 22 H42 V32 Q42 40 32 44 Q22 40 22 32 Z" fill="#fde047" stroke="#92400e" strokeWidth="1" />
      <path d="M24 24 H40 V32 Q40 38 32 41 Q24 38 24 32 Z" fill="none" stroke="#92400e" strokeWidth="0.5" />
      <path d="M22 22 H42 V25 H22 Z" fill="#fef3c7" opacity="0.55" />
      <text x="32" y="36.5" fontSize="14" fontWeight="900" textAnchor="middle" fill="#7c2d12" fontFamily="system-ui">1</text>
    </g>
  ),
  speed_perfect: () => (
    <g>
      <g className="ba-anim anim-flicker" style={{ transformOrigin: '32px 32px' }}>
        <path d="M30 21 L23 33 L29 33 L25 43 L38 30 L32 30 L36 21 Z"
              fill="#fde047" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
        <path d="M30 24 L26 31 L29 31" stroke="#fef3c7" strokeWidth="0.5" fill="none" opacity="0.7" />
      </g>
      <circle cx="42" cy="40" r="4.2" fill="#10b981" stroke="#065f46" strokeWidth="0.7" />
      <path d="M40 40.2 L41.5 41.7 L44 38.8" stroke="#fef3c7" strokeWidth="1.3" fill="none"
            strokeLinecap="round" strokeLinejoin="round" className="ba-anim anim-checkdraw" />
    </g>
  ),
  speed_5s: () => (
    <g className="ba-anim anim-flicker" style={{ transformOrigin: '32px 32px' }}>
      <path d="M30 19 L21 35 L29 35 L25 45 L41 27 L33 27 L37 19 Z"
            fill="#fde047" stroke="#92400e" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M30 22 L25 33 L28 33" stroke="#fef3c7" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M37 28 L34 32" stroke="#fef3c7" strokeWidth="0.5" fill="none" opacity="0.5" />
    </g>
  ),
  speed_perf_10: () => (
    <g>
      <rect x="30" y="19" width="4" height="2" fill="#92400e" stroke="#451a03" strokeWidth="0.4" />
      <line x1="32" y1="21" x2="32" y2="23" stroke="#92400e" strokeWidth="1.2" />
      <circle cx="32" cy="34" r="9.5" fill="#fef3c7" stroke="#1f2937" strokeWidth="1" />
      <circle cx="32" cy="34" r="9" fill="none" stroke="#92400e" strokeWidth="0.5" />
      {[0, 90, 180, 270].map(deg => {
        const a = deg * Math.PI / 180;
        const x = 32 + Math.cos(a) * 8, y = 34 + Math.sin(a) * 8;
        return <circle key={deg} cx={x} cy={y} r="0.6" fill="#92400e" />;
      })}
      <path d="M33 27 L29 33 L31 33 L30 41 L35 33 L33 33 L34 27 Z"
            fill="#fde047" stroke="#92400e" strokeWidth="0.6" strokeLinejoin="round" />
    </g>
  ),
  streak_100: () => (
    <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 38px' }}>
      <path d="M32 18 Q26 22 24 28 Q22 34 24 38 Q26 44 32 44 Q38 44 40 38 Q42 34 40 28 Q38 22 32 18 Z"
            fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
      <path d="M32 22 Q28 25 27 30 Q26 35 28 39 Q30 42 32 42 Q34 42 36 39 Q38 35 37 30 Q36 25 32 22 Z"
            fill="#f97316" />
      <path d="M32 27 Q30 30 30 34 Q30 38 32 39 Q34 38 34 34 Q34 30 32 27 Z" fill="#fde047" />
      <ellipse cx="32" cy="35" rx="0.9" ry="2" fill="#ffffff" opacity="0.7" />
    </g>
  ),
  subjects_10: () => (
    <g>
      <path d="M22 24 Q24 22 32 24 Q40 22 42 24 V40 Q40 38 32 40 Q24 38 22 40 Z"
            fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
      <line x1="32" y1="24" x2="32" y2="40" stroke="#92400e" strokeWidth="0.8" />
      {[28, 30, 32, 34].map((y, i) => (
        <React.Fragment key={i}>
          <line x1="25" y1={y} x2={i === 3 ? 29 : 30} y2={y} stroke="#92400e" strokeWidth="0.5" />
          <line x1="34" y1={y} x2={i === 3 ? 38 : 39} y2={y} stroke="#92400e" strokeWidth="0.5" />
        </React.Fragment>
      ))}
      <rect x="31.5" y="22" width="1" height="20" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.3" />
      <path d="M31 42 L32 44 L33 42" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.3" />
    </g>
  ),
  teacher_battles_30: () => (
    <g>
      <line x1="22" y1="22" x2="42" y2="42" stroke="#1f2937" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="22" y1="22" x2="42" y2="42" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="22" x2="22" y2="42" stroke="#1f2937" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="42" y1="22" x2="22" y2="42" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="42" r="2.4" fill="#92400e" stroke="#1f2937" strokeWidth="0.6" />
      <circle cx="42" cy="42" r="2.4" fill="#92400e" stroke="#1f2937" strokeWidth="0.6" />
      <line x1="20" y1="40" x2="24" y2="44" stroke="#fde047" strokeWidth="1" strokeLinecap="round" />
      <line x1="44" y1="40" x2="40" y2="44" stroke="#fde047" strokeWidth="1" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.2" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      <circle cx="32" cy="32" r="0.7" fill="#dc2626" />
    </g>
  ),
  teacher_groups_10: () => (
    <g>
      <path d="M22 26 L32 21 L42 26 L32 30 Z" fill="#1f2937" stroke="#000" strokeWidth="0.5" />
      <line x1="32" y1="21" x2="36" y2="18" stroke="#fde047" strokeWidth="0.8" />
      <circle cx="36" cy="18" r="1" fill="#fde047" />
      <circle cx="32" cy="34" r="4" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      <circle cx="30" cy="33" r="0.5" fill="#1f2937" />
      <circle cx="34" cy="33" r="0.5" fill="#1f2937" />
      <path d="M30 35.5 Q32 37 34 35.5" stroke="#92400e" strokeWidth="0.6" fill="none" />
      <path d="M22 44 Q22 38 32 38 Q42 38 42 44 Z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.8" />
      <path d="M30 38 L32 42 L34 38" stroke="#fef3c7" strokeWidth="0.5" fill="none" />
    </g>
  ),
  teacher_messages_100: () => (
    <g>
      <rect x="22" y="26" width="20" height="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
      <path d="M22 26 L32 35 L42 26" stroke="#92400e" strokeWidth="0.8" fill="none" />
      <path d="M22 26 L32 35 L42 26 L42 28 L32 37 L22 28 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.5" />
      <path d="M42 28 L42 40 L34 32 Z" fill="#fef3c7" opacity="0.6" />
      <path d="M22 28 L22 40 L30 32 Z" fill="#fef3c7" opacity="0.6" />
      <circle cx="38" cy="42" r="3" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
      <path d="M36.5 42 L37.5 43 L39.5 41" stroke="#fef3c7" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </g>
  ),
  teacher_days_365: () => (
    <g>
      <line x1="27" y1="19" x2="27" y2="23" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="37" y1="19" x2="37" y2="23" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="22" y="22" width="20" height="20" rx="1" fill="#fef3c7" stroke="#1f2937" strokeWidth="1" />
      <rect x="22" y="22" width="20" height="5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
      <text x="32" y="26.2" fontSize="3.5" fontWeight="700" textAnchor="middle" fill="#fef3c7" fontFamily="system-ui">365</text>
      {[0, 1, 2, 3].map(c =>
        [0, 1, 2].map(r => (
          <rect key={`${c}-${r}`} x={24 + c * 4} y={29 + r * 4} width="3" height="3"
                fill={c === 2 && r === 1 ? "#fde047" : "#fef3c7"}
                stroke="#92400e" strokeWidth="0.3" />
        ))
      )}
      <path d="M32.5 33.5 L33.2 34.4 L34.4 33" stroke="#7c2d12" strokeWidth="0.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  teacher_students_100: () => (
    <g>
      <path d="M19 24 L32 19 L45 24 L32 29 Z" fill="#1f2937" />
      <line x1="32" y1="19" x2="36" y2="17" stroke="#fde047" strokeWidth="0.8" />
      <circle cx="36" cy="17" r="0.9" fill="#fde047" />
      <circle cx="24" cy="34" r="3" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      <circle cx="32" cy="34" r="3" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      <circle cx="40" cy="34" r="3" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      <path d="M20 44 Q20 39 24 39 Q28 39 28 44 Z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="0.6" />
      <path d="M28 44 Q28 39 32 39 Q36 39 36 44 Z" fill="#10b981" stroke="#065f46" strokeWidth="0.6" />
      <path d="M36 44 Q36 39 40 39 Q44 39 44 44 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
    </g>
  ),
  teacher_tasks_50: () => (
    <g>
      <rect x="29" y="20" width="6" height="3" rx="0.5" fill="#92400e" stroke="#451a03" strokeWidth="0.4" />
      <rect x="23" y="22" width="18" height="20" rx="1" fill="#fef3c7" stroke="#92400e" strokeWidth="0.8" />
      <rect x="29" y="22" width="6" height="2" fill="#fde047" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="25.5" y={26.5 + i * 4.5} width="2.5" height="2.5" rx="0.3" fill="#10b981" stroke="#065f46" strokeWidth="0.3" />
          <path d={`M${26} ${27.5 + i * 4.5} L${27} ${28.4 + i * 4.5} L${28} ${26.7 + i * 4.5}`}
                stroke="#fef3c7" strokeWidth="0.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="29.5" y1={27.7 + i * 4.5} x2="38.5" y2={27.7 + i * 4.5} stroke="#92400e" strokeWidth="0.5" />
        </g>
      ))}
    </g>
  ),
};

const legBadge = (code, id) => {
  const cat = LEG_CAT[code] || 'general';
  const acc = LEG_ACCENT[cat] || LEG_ACCENT.general;
  const center = LEG_CENTER[code];
  return legFrame(id, acc.accent, acc.dark, acc.gem, center && center());
};

const SVGS = {
  // ═══════════════════════ GENERAL ═══════════════════════
  games_1000: (id) => legBadge('games_1000', id),

  // ═══════════════════════ EXAMENES ═══════════════════════
  exams_200: (id) => legBadge('exams_200', id),

  // ═══════════════════════ MAESTRIA: notas perfectas ═══════════════════════
  perfect_50: (id) => legBadge('perfect_50', id),

  // ═══════════════════════ MAESTRIA: 10 en apps distintas ═══════════════════════
  perfect_10_apps: (id) => legBadge('perfect_10_apps', id),
  perfect_15_apps: (id) => legBadge('perfect_15_apps', id),

  // ═══════════════════════ EXPLORACION ═══════════════════════
  apps_30: (id) => legBadge('apps_30', id),

  // ═══════════════════════ VELOCIDAD ═══════════════════════
  speed_5s: (id) => legBadge('speed_5s', id),
  speed_perf_10: (id) => legBadge('speed_perf_10', id),

  // ═══════════════════════ RACHAS ═══════════════════════
  streak_100: (id) => legBadge('streak_100', id),

  // ═══════════════════════ DEDICACION ═══════════════════════
  time_100h: (id) => legBadge('time_100h', id),

  // ═══════════════════════ ASIGNATURAS ═══════════════════════
  subjects_10: (id) => legBadge('subjects_10', id),

  // ═══════════════════════ RANKING ═══════════════════════

  // ─── TOP 10 GLOBAL ───
  // ─── TOP 3 GLOBAL (PODIO) ───
  rank_top3_10: (id) => legBadge('rank_top3_10', id),

  // ─── PRIMERO GLOBAL (CORONA) ───
  rank_first_10: (id) => legBadge('rank_first_10', id),

  // ─── TOP 3 CLASE ───
  // ─── PRIMERO DE CLASE ───
  rank_class1_10: (id) => legBadge('rank_class1_10', id),

  // ═══════════════════════ QUIZ BATTLE: VICTORIAS (1º) ═══════════════════════
  battle_win_10: (id) => legBadge('battle_win_10', id),

  // ═══════════════════════ QUIZ BATTLE: PODIO (1º/2º/3º) ═══════════════════════
  // ═══════════════════════ QUIZ BATTLE: PARTICIPACIÓN ═══════════════════════
  battle_played_50: (id) => legBadge('battle_played_50', id),

  // ═══════════════════════ TEACHER: GRUPOS ═══════════════════════
  teacher_groups_10: (id) => legBadge('teacher_groups_10', id),

  // ═══════════════════════ TEACHER: ALUMNOS ═══════════════════════
  teacher_students_100: (id) => legBadge('teacher_students_100', id),

  // ═══════════════════════ TEACHER: TAREAS ═══════════════════════
  teacher_tasks_50: (id) => legBadge('teacher_tasks_50', id),

  // ═══════════════════════ TEACHER: BATALLAS ═══════════════════════
  teacher_battles_30: (id) => legBadge('teacher_battles_30', id),

  // ═══════════════════════ TEACHER: MENSAJES ═══════════════════════
  teacher_messages_100: (id) => legBadge('teacher_messages_100', id),

  // ═══════════════════════ TEACHER: PLATAFORMA (DIAS) ═══════════════════════
  teacher_days_365: (id) => legBadge('teacher_days_365', id),

  // ═══════════════════════ TEACHER: RATINGS ═══════════════════════
  speed_perfect: (id) => legBadge('speed_perfect', id),
  robot_retos_eso4: (id) => legBadge('robot_retos_eso4', id),

  // ═══════════════════════════════════════════════════════════════
  // MÍTICAS (rareza única, 1000 XP)
  // Marco iridiscente con halo arcoíris, rayos giratorios y sparkles
  // multicolor. Cada una con su icono central distintivo.
  // ═══════════════════════════════════════════════════════════════
  mythic_max_level:               (id) => mythBadge(id, mythCenter_max_level),
  mythic_duels_500:               (id) => mythBadge(id, mythCenter_duels_500),
  mythic_battles_100:             (id) => mythBadge(id, mythCenter_battles_100),
  mythic_exams_1000:              (id) => mythBadge(id, mythCenter_exams_1000),
  mythic_games_10000:             (id) => mythBadge(id, mythCenter_games_10000),
  mythic_top_global_100_apps:     (id) => mythBadge(id, mythCenter_top_global),
  mythic_streak_365:              (id) => mythBadge(id, mythCenter_streak_365),
  mythic_perfect_100_primaria:    (id) => mythBadge(id, mythCenter_primaria),
  mythic_perfect_100_eso:         (id) => mythBadge(id, mythCenter_eso),
  mythic_perfect_100_bachillerato:(id) => mythBadge(id, mythCenter_bachi),
};

// ─── MARCO MÍTICO (iridiscente + rainbow halo + extra sparkles) ───
const mythBadge = (id, center) => (
  <>
    <defs>
      <radialGradient id={`${id}mhalo`} cx="0.5" cy="0.5">
        <stop offset="0" stopColor="#f0abfc" stopOpacity="0.85" />
        <stop offset="0.4" stopColor="#fbbf24" stopOpacity="0.45" />
        <stop offset="0.75" stopColor="#a5f3fc" stopOpacity="0.25" />
        <stop offset="1" stopColor="#a5f3fc" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}mring`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbcfe8" />
        <stop offset="0.2" stopColor="#f9a8d4" />
        <stop offset="0.4" stopColor="#c084fc" />
        <stop offset="0.6" stopColor="#60a5fa" />
        <stop offset="0.8" stopColor="#34d399" />
        <stop offset="1" stopColor="#fde047" />
      </linearGradient>
      <radialGradient id={`${id}mcenter`} cx="0.5" cy="0.4">
        <stop offset="0" stopColor="#1e1b4b" />
        <stop offset="0.6" stopColor="#0f0a2e" />
        <stop offset="1" stopColor="#000000" />
      </radialGradient>
    </defs>

    {/* Halo radial pulsante arcoíris */}
    <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
      <circle cx="32" cy="32" r="32" fill={`url(#${id}mhalo)`} />
    </g>

    {/* Rayos giratorios multicolor */}
    <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * 22.5) * Math.PI / 180;
        const r1 = 24, r2 = 31;
        const x1 = 32 + Math.cos(a) * r1, y1 = 32 + Math.sin(a) * r1;
        const x2 = 32 + Math.cos(a) * r2, y2 = 32 + Math.sin(a) * r2;
        const colors = ['#f0abfc', '#fde047', '#34d399', '#60a5fa'];
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={colors[i % 4]} strokeWidth={i % 2 ? 0.8 : 1.6}
                strokeLinecap="round" opacity="0.75" />
        );
      })}
    </g>

    {/* Aro iridiscente con doble borde */}
    <circle cx="32" cy="32" r="26" fill="#1e1b4b" />
    <circle cx="32" cy="32" r="25.2" fill="none" stroke={`url(#${id}mring)`} strokeWidth="4" />
    <circle cx="32" cy="32" r="22.8" fill="none" stroke="#fef3c7" strokeWidth="0.5" opacity="0.7" />

    {/* Disco central oscuro */}
    <circle cx="32" cy="32" r="21" fill={`url(#${id}mcenter)`} stroke="#0f0a2e" strokeWidth="1" />
    <circle cx="32" cy="32" r="20.2" fill="none" stroke="#f0abfc" strokeWidth="0.4" opacity="0.6" />

    {/* 8 gemas de colores en el aro cada 45° */}
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * 45 - 90) * Math.PI / 180;
      const x = 32 + Math.cos(a) * 25;
      const y = 32 + Math.sin(a) * 25;
      const gems = ['#f9a8d4', '#fde047', '#86efac', '#7dd3fc', '#f9a8d4', '#fde047', '#86efac', '#7dd3fc'];
      return (
        <g key={`mgem${i}`}>
          <circle cx={x} cy={y} r="2.4" fill="#1e1b4b" />
          <circle cx={x} cy={y} r="2" fill={gems[i]} stroke="#0f0a2e" strokeWidth="0.4" />
          <circle cx={x - 0.55} cy={y - 0.55} r="0.55" fill="#fef3c7" opacity="0.95" />
        </g>
      );
    })}

    {/* Icono central */}
    {center(id)}

    {/* Sparkles multicolor parpadeantes */}
    <g className="ba-anim anim-twinkle">
      <path d="M52 11 L53 13 L55 14 L53 15 L52 17 L51 15 L49 14 L51 13 Z" fill="#fef3c7" />
    </g>
    <g className="ba-anim anim-twinkle-2">
      <path d="M11 51 L12 52.4 L13.6 53 L12 53.6 L11 55 L10 53.6 L8.4 53 L10 52.4 Z" fill="#f0abfc" />
    </g>
    <g className="ba-anim anim-twinkle-3">
      <circle cx="52" cy="51" r="1.2" fill="#86efac" />
      <circle cx="11" cy="13" r="1.2" fill="#7dd3fc" />
      <circle cx="32" cy="6" r="0.9" fill="#fde047" />
      <circle cx="32" cy="58" r="0.9" fill="#f9a8d4" />
    </g>
  </>
);

// ─── Iconos centrales para insignias míticas ───
// Cada uno se renderiza dentro del disco oscuro central (radio ~21).
// Área aproximada de dibujo: (20, 20) a (44, 44).

// 1. Cima del Saber — montaña con estrella
const mythCenter_max_level = () => (
  <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
    {/* Montaña */}
    <path d="M22 42 L29 26 L33 32 L37 24 L42 42 Z" fill="#c084fc" stroke="#1e1b4b" strokeWidth="0.8" />
    <path d="M27 31 L29 26 L31 31 Z" fill="#fef3c7" />
    <path d="M35 30 L37 24 L39 30 Z" fill="#fef3c7" />
    {/* Estrella en la cima */}
    <path d="M37 22 L38.2 24.4 L40.8 24.6 L38.9 26.4 L39.5 28.9 L37 27.5 L34.5 28.9 L35.1 26.4 L33.2 24.6 L35.8 24.4 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.4" />
    {/* "50" */}
    <text x="32" y="40.5" textAnchor="middle" fill="#fef3c7" fontSize="6" fontWeight="900" fontFamily="sans-serif">50</text>
  </g>
);

// 2. Maestro de los Duelos — corona sobre espadas cruzadas
const mythCenter_duels_500 = () => (
  <g>
    {/* Espadas cruzadas */}
    <g transform="rotate(-45 32 32)">
      <rect x="31" y="22" width="2" height="20" fill="#e2e8f0" stroke="#1e1b4b" strokeWidth="0.5" />
      <rect x="29" y="40" width="6" height="2" fill="#92400e" />
    </g>
    <g transform="rotate(45 32 32)">
      <rect x="31" y="22" width="2" height="20" fill="#e2e8f0" stroke="#1e1b4b" strokeWidth="0.5" />
      <rect x="29" y="40" width="6" height="2" fill="#92400e" />
    </g>
    {/* Corona dorada */}
    <path d="M24 26 L26 22 L28 25 L32 21 L36 25 L38 22 L40 26 L40 30 L24 30 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
    <circle cx="32" cy="20" r="1.4" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
    <rect x="24" y="29" width="16" height="2" fill="#d97706" />
  </g>
);

// 3. Emperador de las Batallas — trofeo grande con laureles
const mythCenter_battles_100 = () => (
  <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
    {/* Asas */}
    <path d="M22 26 Q19 26 19 30 Q19 34 24 34" fill="none" stroke="#fde047" strokeWidth="1.6" />
    <path d="M42 26 Q45 26 45 30 Q45 34 40 34" fill="none" stroke="#fde047" strokeWidth="1.6" />
    {/* Copa */}
    <path d="M24 22 H40 V32 Q40 38 32 39 Q24 38 24 32 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.8" />
    <path d="M25 23 H39 V25 H25 Z" fill="#fef3c7" />
    {/* Estrella en el centro */}
    <path d="M32 26 L33 28 L35.2 28.2 L33.5 29.5 L34 31.5 L32 30.4 L30 31.5 L30.5 29.5 L28.8 28.2 L31 28 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.3" />
    {/* Pie */}
    <rect x="29" y="39" width="6" height="2" fill="#92400e" />
    <rect x="27" y="41" width="10" height="2.5" fill="#92400e" stroke="#451a03" strokeWidth="0.4" />
    {/* "100" */}
    <text x="32" y="36" textAnchor="middle" fill="#92400e" fontSize="3.5" fontWeight="900" fontFamily="sans-serif">100</text>
  </g>
);

// 4. Mil Exámenes Aprobados — pila de papeles con check
const mythCenter_exams_1000 = () => (
  <g>
    {/* Pila de papeles */}
    <rect x="22" y="40" width="20" height="3" fill="#cbd5e1" stroke="#1e1b4b" strokeWidth="0.4" />
    <rect x="23" y="36" width="18" height="4" fill="#e2e8f0" stroke="#1e1b4b" strokeWidth="0.4" />
    <rect x="22" y="22" width="20" height="14" fill="#fef3c7" stroke="#92400e" strokeWidth="0.7" />
    <line x1="24" y1="25" x2="40" y2="25" stroke="#92400e" strokeWidth="0.5" />
    <line x1="24" y1="27" x2="38" y2="27" stroke="#cbd5e1" strokeWidth="0.4" />
    <line x1="24" y1="29" x2="38" y2="29" stroke="#cbd5e1" strokeWidth="0.4" />
    {/* "1000" centrado */}
    <text x="32" y="33.5" textAnchor="middle" fill="#dc2626" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">1000</text>
    {/* Check verde */}
    <circle cx="40" cy="22" r="3.5" fill="#10b981" stroke="#065f46" strokeWidth="0.5" />
    <path d="M38 22 L39.4 23.4 L42 20.6" fill="none" stroke="#fef3c7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// 5. Diez Mil Partidas — mando de consola con estrellas
const mythCenter_games_10000 = () => (
  <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 32px' }}>
    {/* Cuerpo del mando */}
    <path d="M22 28 Q20 28 20 32 V36 Q20 42 24 42 Q26 42 27 40 H37 Q38 42 40 42 Q44 42 44 36 V32 Q44 28 42 28 Z" fill="#7c3aed" stroke="#1e1b4b" strokeWidth="0.7" />
    {/* D-pad */}
    <rect x="23" y="33" width="5" height="1.5" fill="#1e1b4b" />
    <rect x="24.75" y="31.25" width="1.5" height="5" fill="#1e1b4b" />
    {/* Botones */}
    <circle cx="38" cy="32" r="1.2" fill="#fde047" />
    <circle cx="40.5" cy="34.5" r="1.2" fill="#10b981" />
    <circle cx="35.5" cy="34.5" r="1.2" fill="#3b82f6" />
    <circle cx="38" cy="37" r="1.2" fill="#dc2626" />
    {/* Estrella encima */}
    <path d="M32 22 L33 24.4 L35.6 24.6 L33.7 26.4 L34.3 28.9 L32 27.5 L29.7 28.9 L30.3 26.4 L28.4 24.6 L31 24.4 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.4" />
  </g>
);

// 6. Cima del Mundo — globo terráqueo con #1
const mythCenter_top_global = () => (
  <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
    {/* Globo */}
    <circle cx="32" cy="32" r="9" fill="#3b82f6" stroke="#1e1b4b" strokeWidth="0.7" />
    <path d="M23 32 Q28 28 32 32 Q36 36 41 32" fill="none" stroke="#10b981" strokeWidth="1" />
    <path d="M25 28 Q28 26 32 27 Q36 26 39 28" fill="none" stroke="#10b981" strokeWidth="0.8" />
    <path d="M25 36 Q28 38 32 37 Q36 38 39 36" fill="none" stroke="#10b981" strokeWidth="0.8" />
    <ellipse cx="32" cy="32" rx="9" ry="3.5" fill="none" stroke="#fef3c7" strokeWidth="0.4" opacity="0.6" />
    <ellipse cx="32" cy="32" rx="3.5" ry="9" fill="none" stroke="#fef3c7" strokeWidth="0.4" opacity="0.6" />
    {/* Cinta #1 */}
    <path d="M28 21 L36 21 L34 25 L32 23 L30 25 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
    <text x="32" y="20.5" textAnchor="middle" fill="#fef3c7" fontSize="3.2" fontWeight="900" fontFamily="sans-serif">#1</text>
  </g>
);

// 7. Año Eterno — calendario con llama
const mythCenter_streak_365 = () => (
  <g>
    {/* Calendario */}
    <rect x="22" y="24" width="20" height="16" rx="1" fill="#fef3c7" stroke="#92400e" strokeWidth="0.7" />
    <rect x="22" y="24" width="20" height="4" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
    <rect x="25" y="22" width="2" height="4" fill="#1e1b4b" />
    <rect x="37" y="22" width="2" height="4" fill="#1e1b4b" />
    {/* Cuadrícula con muchos puntos */}
    {[0,1,2,3,4].map(r => [0,1,2,3,4,5].map(c => (
      <rect key={`${r}-${c}`} x={24 + c*3} y={29 + r*2.2} width="1.5" height="1.5" fill={r === 4 && c === 5 ? '#fb923c' : '#10b981'} />
    )))}
    {/* "365" */}
    <text x="32" y="44" textAnchor="middle" fill="#fef3c7" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">365</text>
    {/* Llama esquina */}
    <g className="ba-anim anim-twinkle" style={{ transformOrigin: '40px 23px' }}>
      <path d="M40 19 Q42 21 41 23 Q40 22 40 24 Q38 22 39 20 Z" fill="#f97316" stroke="#7f1d1d" strokeWidth="0.4" />
      <path d="M40 21 Q40.6 22 40 23" fill="none" stroke="#fde047" strokeWidth="0.5" />
    </g>
  </g>
);

// 8. Mente Maestra de Primaria — mochila + 10
const mythCenter_primaria = () => (
  <g>
    {/* Asa */}
    <path d="M27 22 Q27 19 32 19 Q37 19 37 22" fill="none" stroke="#fde047" strokeWidth="1.4" />
    {/* Mochila */}
    <path d="M24 22 H40 Q42 22 42 25 V40 Q42 42 40 42 H24 Q22 42 22 40 V25 Q22 22 24 22 Z" fill="#3b82f6" stroke="#1e1b4b" strokeWidth="0.7" />
    {/* Bolsillo */}
    <rect x="26" y="30" width="12" height="8" rx="1" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="0.5" />
    <circle cx="32" cy="34" r="1.2" fill="#fde047" stroke="#92400e" strokeWidth="0.3" />
    {/* "10" */}
    <text x="32" y="28" textAnchor="middle" fill="#fef3c7" fontSize="5" fontWeight="900" fontFamily="sans-serif">10</text>
    {/* Estrella esquina */}
    <path d="M40 24 L40.7 25.4 L42.2 25.6 L41.1 26.6 L41.4 28.1 L40 27.3 L38.6 28.1 L38.9 26.6 L37.8 25.6 L39.3 25.4 Z" fill="#fde047" />
  </g>
);

// 9. Mente Maestra de la ESO — birrete graduación
const mythCenter_eso = () => (
  <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
    {/* Tabla del birrete */}
    <path d="M20 28 L32 22 L44 28 L32 34 Z" fill="#1e1b4b" stroke="#0f0a2e" strokeWidth="0.7" />
    <path d="M20 28 L32 24 L44 28 L32 32 Z" fill="#312e81" stroke="#0f0a2e" strokeWidth="0.4" opacity="0.6" />
    {/* Caja */}
    <path d="M27 30 V36 Q27 37 32 37 Q37 37 37 36 V30" fill="#1e1b4b" stroke="#0f0a2e" strokeWidth="0.6" />
    {/* Borla */}
    <line x1="44" y1="28" x2="44" y2="33" stroke="#fde047" strokeWidth="0.7" />
    <circle cx="44" cy="34" r="1.4" fill="#fde047" stroke="#92400e" strokeWidth="0.3" />
    <line x1="44" y1="33" x2="43.5" y2="35" stroke="#d97706" strokeWidth="0.4" />
    {/* "10" */}
    <text x="32" y="44" textAnchor="middle" fill="#fef3c7" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">10</text>
  </g>
);

// 10. Mente Maestra de Bachillerato — diploma
const mythCenter_bachi = () => (
  <g>
    {/* Pergamino enrollado */}
    <rect x="23" y="22" width="18" height="18" fill="#fef3c7" stroke="#92400e" strokeWidth="0.7" />
    <rect x="23" y="22" width="18" height="2" fill="#fde047" />
    <rect x="23" y="38" width="18" height="2" fill="#fde047" />
    {/* Líneas de texto */}
    <line x1="25" y1="26" x2="39" y2="26" stroke="#92400e" strokeWidth="0.4" />
    <line x1="25" y1="28" x2="37" y2="28" stroke="#cbd5e1" strokeWidth="0.4" />
    <line x1="25" y1="30" x2="39" y2="30" stroke="#cbd5e1" strokeWidth="0.4" />
    {/* "10/10" */}
    <text x="32" y="36" textAnchor="middle" fill="#dc2626" fontSize="4" fontWeight="900" fontFamily="sans-serif">10/10</text>
    {/* Sello rojo */}
    <circle cx="40" cy="38" r="3" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.5" />
    <path d="M38.4 38 L39.6 39.2 L41.6 36.8" fill="none" stroke="#fef3c7" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    {/* Cinta colgando */}
    <path d="M40 40.5 L39 43 L40 42 L41 43 L40.5 40.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.4" />
  </g>
);

// ─── Halo de fondo por rareza ───
// Medallón por rareza (rediseño 2026): cara con degradado + aro metálico con
// bisel y brillo especular. Todo en CSS estático (BadgeIcon.css, .badge-medal--*):
// se rasteriza una vez y no cuesta nada aunque haya decenas en pantalla.
const RARITY = {
  common:    { from: '#ffffff', to: '#e2e8f0', ring: 'rgba(100,116,139,0.35)' },
  rare:      { from: '#eff6ff', to: '#bfdbfe', ring: 'rgba(59,130,246,0.5)' },
  epic:      { from: '#faf5ff', to: '#ddd6fe', ring: 'rgba(139,92,246,0.55)' },
  legendary: { from: '#fffbeb', to: '#fde68a', ring: 'rgba(245,158,11,0.6)' },
  mythic:    { from: '#fdf4ff', to: '#fbcfe8', ring: 'rgba(217,70,239,0.7)' },
};

/**
 * BadgeIcon — render una insignia multicolor animada por code.
 *
 * Props:
 *  - code:   badge code (ej: 'first_game')
 *  - rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
 *  - size:   px (default 56)
 *  - earned: bool (default true). false → grayscale + sin animaciones
 *  - animated: bool (default false). Solo el modal/celebración anima.
 *
 * Las ilustraciones rediseñadas viven en src/components/icons/badge/* y
 * tienen prioridad sobre las de este fichero (BADGE_OVERRIDES).
 */
function BadgeIcon({ code, rarity = 'common', size = 56, earned = true, animated = false }) {
  const reactId = React.useId();
  const idPrefix = `bi${reactId.replace(/[:]/g, '')}-`;
  const entry = BADGE_OVERRIDES[code] || SVGS[code];
  const svg = typeof entry === 'function' ? entry(idPrefix) : entry;
  const r = RARITY[rarity] ? rarity : 'common';
  const palette = RARITY[r];

  if (!entry) {
    return (
      <div
        style={{ width: size, height: size }}
        className="badge-icon-wrap"
      >?</div>
    );
  }

  return (
    <div
      className={`badge-icon-wrap badge-medal badge-medal--${r} ${earned ? '' : 'is-locked'} ${animated ? 'is-animated' : ''}`}
      style={{
        width: size,
        height: size,
        '--bm-from': palette.from,
        '--bm-to': palette.to,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.78)}
        height={Math.round(size * 0.78)}
      >
        {svg}
      </svg>
    </div>
  );
}

export default React.memo(BadgeIcon);
export { SVGS as BADGE_SVGS };
