import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// 64 SVGs minimalistas, line-art, trazo grueso. Cada uno usa viewBox 0 0 64 64
// y `currentColor` (el color lo define la rareza desde el contenedor).
// ─────────────────────────────────────────────────────────────────────────────

const SVGS = {
  // ═══ GENERAL ═══
  first_game: (
    <>
      <rect x="6" y="20" width="52" height="28" rx="10" />
      <path d="M16 30v8M12 34h8" />
      <circle cx="44" cy="30" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="44" cy="38" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="40" cy="34" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="48" cy="34" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  games_5: (
    <>
      <rect x="12" y="12" width="40" height="40" rx="8" />
      <circle cx="20" cy="20" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="44" cy="20" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="32" cy="32" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="44" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="44" cy="44" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  games_10: (
    <>
      <circle cx="32" cy="18" r="6" />
      <line x1="32" y1="24" x2="32" y2="44" />
      <ellipse cx="32" cy="50" rx="14" ry="4" />
      <line x1="28" y1="14" x2="36" y2="14" />
      <line x1="32" y1="10" x2="32" y2="18" />
    </>
  ),
  games_25: (
    <>
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="13" />
      <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
    </>
  ),
  games_50: (
    <>
      <path d="M14 10 Q6 32 14 54" />
      <path d="M14 10 L14 54" strokeDasharray="2 4" />
      <line x1="14" y1="32" x2="50" y2="32" />
      <path d="M44 24 L52 32 L44 40" />
    </>
  ),
  games_100: (
    <>
      <line x1="12" y1="20" x2="12" y2="44" />
      <line x1="8" y1="22" x2="12" y2="20" />
      <circle cx="28" cy="32" r="8" />
      <circle cx="46" cy="32" r="8" />
    </>
  ),
  games_250: (
    <>
      <path d="M32 6 L54 14 V32 Q54 48 32 58 Q10 48 10 32 V14 Z" />
      <path d="M32 22 L34.5 28 L41 28 L36 32 L38 38 L32 34 L26 38 L28 32 L23 28 L29.5 28 Z" />
    </>
  ),
  games_500: (
    <>
      <path d="M8 44 L16 18 L24 36 L32 14 L40 36 L48 18 L56 44 Z" />
      <line x1="8" y1="50" x2="56" y2="50" />
      <circle cx="32" cy="14" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  games_1000: (
    <>
      <path d="M20 10 H44 V24 Q44 36 32 36 Q20 36 20 24 Z" />
      <path d="M20 14 Q10 14 10 22 Q10 30 18 32" />
      <path d="M44 14 Q54 14 54 22 Q54 30 46 32" />
      <line x1="32" y1="36" x2="32" y2="46" />
      <line x1="22" y1="50" x2="42" y2="50" />
      <line x1="26" y1="46" x2="38" y2="46" />
    </>
  ),

  // ═══ EXAMENES ═══
  first_exam: (
    <>
      <path d="M16 8 H40 L48 16 V56 H16 Z" />
      <path d="M40 8 V16 H48" />
      <path d="M22 36 L28 42 L40 28" />
    </>
  ),
  exams_3: (
    <>
      <path d="M14 18 H38 L44 24 V52 H14 Z" />
      <path d="M20 14 H42 L48 20 V48" />
      <path d="M26 10 H46" />
    </>
  ),
  exams_5: (
    <>
      <rect x="14" y="12" width="36" height="44" rx="3" />
      <rect x="22" y="8" width="20" height="8" rx="2" />
      <line x1="22" y1="28" x2="42" y2="28" />
      <line x1="22" y1="36" x2="42" y2="36" />
      <line x1="22" y1="44" x2="36" y2="44" />
    </>
  ),
  exams_10: (
    <>
      <path d="M4 26 L32 14 L60 26 L32 38 Z" />
      <path d="M16 32 V44 Q32 52 48 44 V32" />
      <line x1="58" y1="26" x2="58" y2="42" />
    </>
  ),
  exams_25: (
    <>
      <path d="M10 14 H26 Q32 14 32 20 V52 Q32 46 26 46 H10 Z" />
      <path d="M54 14 H38 Q32 14 32 20 V52 Q32 46 38 46 H54 Z" />
      <line x1="14" y1="22" x2="22" y2="22" />
      <line x1="14" y1="30" x2="22" y2="30" />
    </>
  ),
  exams_50: (
    <>
      <path d="M22 14 Q14 14 14 22 Q6 24 10 32 Q6 40 16 42 Q18 50 28 48 Q32 54 36 48 Q46 50 48 42 Q58 40 54 32 Q58 24 50 22 Q50 14 42 14 Q38 6 32 12 Q26 6 22 14 Z" />
      <path d="M24 28 Q28 24 32 28 M32 28 Q36 24 40 28" />
      <line x1="32" y1="32" x2="32" y2="40" />
    </>
  ),
  exams_100: (
    <path d="M36 6 L14 36 H30 L26 58 L50 26 H32 Z" />
  ),
  exams_200: (
    <>
      <path d="M6 14 H58 L48 24 H16 Z" />
      <path d="M14 26 H50 L42 36 H22 Z" />
      <path d="M22 38 L42 38 L34 50 H30 Z" />
      <line x1="32" y1="52" x2="32" y2="60" />
    </>
  ),

  // ═══ MAESTRIA: notas perfectas ═══
  perfect_1: (
    <path d="M32 6 L40 24 L60 26 L44 38 L50 58 L32 48 L14 58 L20 38 L4 26 L24 24 Z" />
  ),
  perfect_3: (
    <>
      <path d="M16 12 L19 19 L27 20 L21 25 L23 33 L16 29 L9 33 L11 25 L5 20 L13 19 Z" />
      <path d="M48 12 L51 19 L59 20 L53 25 L55 33 L48 29 L41 33 L43 25 L37 20 L45 19 Z" />
      <path d="M32 30 L35 38 L43 39 L37 45 L39 53 L32 49 L25 53 L27 45 L21 39 L29 38 Z" />
    </>
  ),
  perfect_5: (
    <>
      <circle cx="32" cy="32" r="6" />
      <line x1="32" y1="6" x2="32" y2="14" />
      <line x1="32" y1="50" x2="32" y2="58" />
      <line x1="6" y1="32" x2="14" y2="32" />
      <line x1="50" y1="32" x2="58" y2="32" />
      <line x1="13" y1="13" x2="19" y2="19" />
      <line x1="45" y1="45" x2="51" y2="51" />
      <line x1="51" y1="13" x2="45" y2="19" />
      <line x1="19" y1="45" x2="13" y2="51" />
    </>
  ),
  perfect_10: (
    <>
      <path d="M50 6 L34 28 L42 32 L24 58 L32 36 L22 32 Z" />
      <line x1="8" y1="14" x2="14" y2="20" />
      <line x1="6" y1="30" x2="14" y2="30" />
      <line x1="10" y1="46" x2="16" y2="42" />
    </>
  ),
  perfect_25: (
    <>
      <line x1="32" y1="6" x2="32" y2="58" />
      <path d="M22 12 Q32 20 42 12" />
      <line x1="22" y1="12" x2="22" y2="22" />
      <line x1="42" y1="12" x2="42" y2="22" />
      <path d="M14 50 H50" />
      <path d="M22 50 V40 Q32 34 42 40 V50" />
    </>
  ),
  perfect_50: (
    <>
      <path d="M14 22 L24 8 H40 L50 22 L32 58 Z" />
      <line x1="14" y1="22" x2="50" y2="22" />
      <line x1="24" y1="8" x2="32" y2="22" />
      <line x1="40" y1="8" x2="32" y2="22" />
    </>
  ),

  // ═══ MAESTRIA: 10 en apps distintas ═══
  perfect_1_app: (
    <>
      <path d="M22 6 L18 22 M42 6 L46 22" />
      <circle cx="32" cy="38" r="14" />
      <circle cx="32" cy="38" r="6" />
    </>
  ),
  perfect_3_apps: (
    <>
      <path d="M22 6 L28 22 M42 6 L36 22" />
      <circle cx="32" cy="38" r="16" />
      <text x="32" y="44" textAnchor="middle" fontSize="16" fontWeight="900" fill="currentColor" stroke="none">3</text>
    </>
  ),
  perfect_5_apps: (
    <>
      <path d="M22 6 L28 22 M42 6 L36 22" />
      <circle cx="32" cy="38" r="16" />
      <text x="32" y="44" textAnchor="middle" fontSize="16" fontWeight="900" fill="currentColor" stroke="none">5</text>
    </>
  ),
  perfect_10_apps: (
    <>
      <path d="M22 6 L28 22 M42 6 L36 22" />
      <circle cx="32" cy="38" r="16" />
      <text x="32" y="44" textAnchor="middle" fontSize="14" fontWeight="900" fill="currentColor" stroke="none">10</text>
    </>
  ),
  perfect_15_apps: (
    <>
      <path d="M4 32 Q32 10 60 32 Q32 54 4 32 Z" />
      <circle cx="32" cy="32" r="9" />
      <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
    </>
  ),

  // ═══ EXPLORACION ═══
  apps_1: (
    <>
      <circle cx="26" cy="26" r="14" />
      <line x1="36" y1="36" x2="54" y2="54" />
    </>
  ),
  apps_3: (
    <>
      <path d="M6 14 L24 10 L40 14 L58 10 V50 L40 54 L24 50 L6 54 Z" />
      <line x1="24" y1="10" x2="24" y2="50" />
      <line x1="40" y1="14" x2="40" y2="54" />
    </>
  ),
  apps_5: (
    <>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 14 L38 32 L32 50 L26 32 Z" />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  apps_10: (
    <>
      <circle cx="32" cy="32" r="22" />
      <ellipse cx="32" cy="32" rx="10" ry="22" />
      <line x1="10" y1="32" x2="54" y2="32" />
    </>
  ),
  apps_15: (
    <>
      <path d="M6 32 L58 8 L40 56 L34 36 Z" />
      <line x1="34" y1="36" x2="58" y2="8" />
    </>
  ),
  apps_20: (
    <>
      <path d="M32 6 Q44 18 44 34 V46 H20 V34 Q20 18 32 6 Z" />
      <circle cx="32" cy="26" r="4" />
      <path d="M20 46 L14 58 H22 M44 46 L50 58 H42" />
    </>
  ),
  apps_30: (
    <>
      <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
      <path d="M14 32 Q14 14 32 14 Q50 14 50 32 Q50 50 32 50" />
      <path d="M50 32 Q50 50 32 50 Q14 50 14 32" />
      <circle cx="48" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="44" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),

  // ═══ VELOCIDAD ═══
  speed_60s: (
    <>
      <circle cx="36" cy="12" r="4" />
      <path d="M36 16 L28 28 L18 30" />
      <path d="M28 28 L36 36 L34 50" />
      <path d="M36 36 L46 38" />
      <path d="M40 22 L48 18" />
    </>
  ),
  speed_30s: (
    <>
      <circle cx="32" cy="36" r="18" />
      <line x1="26" y1="6" x2="38" y2="6" />
      <line x1="32" y1="6" x2="32" y2="14" />
      <line x1="32" y1="36" x2="32" y2="22" />
      <line x1="32" y1="36" x2="42" y2="36" />
    </>
  ),
  speed_10s: (
    <>
      <path d="M40 6 L20 34 H32 L26 58 L48 28 H34 Z" />
      <line x1="6" y1="14" x2="14" y2="14" />
      <line x1="4" y1="24" x2="12" y2="24" />
      <line x1="6" y1="34" x2="14" y2="34" />
    </>
  ),
  speed_5s: (
    <>
      <circle cx="46" cy="18" r="8" />
      <path d="M40 24 L8 56" />
      <path d="M16 50 L8 56 L14 56" />
      <path d="M22 44 L10 56" strokeOpacity="0.6" />
      <path d="M28 38 L12 54" strokeOpacity="0.4" />
    </>
  ),
  speed_perf_60: (
    <>
      <circle cx="28" cy="36" r="20" />
      <circle cx="28" cy="36" r="11" />
      <circle cx="28" cy="36" r="3" fill="currentColor" stroke="none" />
      <line x1="28" y1="36" x2="56" y2="8" />
      <path d="M50 8 L56 8 L56 14" />
    </>
  ),
  speed_perf_30: (
    <path d="M32 4 L38 22 L56 18 L44 32 L58 44 L40 42 L36 60 L28 44 L10 50 L20 34 L6 22 L24 24 Z" />
  ),
  speed_perf_10: (
    <>
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="14" />
      <circle cx="32" cy="32" r="6" fill="currentColor" stroke="none" />
    </>
  ),

  // ═══ RACHAS ═══
  streak_2: (
    <path d="M32 56 Q18 50 22 36 Q26 40 26 32 Q32 36 32 24 Q40 32 38 40 Q42 36 42 30 Q48 42 42 50 Q38 56 32 56 Z" />
  ),
  streak_3: (
    <>
      <path d="M32 56 Q18 50 22 36 Q26 40 26 32 Q32 36 32 24 Q40 32 38 40 Q42 36 42 30 Q48 42 42 50 Q38 56 32 56 Z" />
      <path d="M28 44 Q32 38 36 44" />
    </>
  ),
  streak_5: (
    <>
      <path d="M20 56 Q10 50 14 38 Q16 42 18 36 Q22 42 22 32 Q28 38 26 46 Q22 56 20 56 Z" />
      <path d="M44 56 Q34 50 38 38 Q40 42 42 36 Q46 42 46 32 Q52 38 50 46 Q46 56 44 56 Z" />
    </>
  ),
  streak_7: (
    <>
      <rect x="10" y="14" width="44" height="42" rx="4" />
      <line x1="10" y1="24" x2="54" y2="24" />
      <line x1="20" y1="10" x2="20" y2="18" />
      <line x1="44" y1="10" x2="44" y2="18" />
      <path d="M22 38 L30 46 L44 30" />
    </>
  ),
  streak_10: (
    <>
      <path d="M32 56 Q12 48 18 30 Q22 36 24 26 Q32 32 30 14 Q42 26 40 38 Q46 32 46 24 Q56 40 48 52 Q42 60 32 56 Z" />
      <line x1="22" y1="40" x2="42" y2="40" />
    </>
  ),
  streak_15: (
    <>
      <path d="M14 56 L50 56 L32 14 Z" />
      <path d="M32 28 L26 44 L32 38 L38 44 Z" />
    </>
  ),
  streak_30: (
    <>
      <path d="M32 56 Q10 48 16 28 Q20 34 22 22 Q30 28 28 6 Q44 22 42 36 Q48 30 48 18 Q60 36 50 52 Q42 60 32 56 Z" />
      <path d="M28 46 Q32 40 36 46" />
    </>
  ),
  streak_50: (
    <>
      <path d="M32 56 Q10 48 16 28 Q20 34 22 22 Q30 28 28 6 Q44 22 42 36 Q48 30 48 18 Q60 36 50 52 Q42 60 32 56 Z" />
      <path d="M22 16 L26 12 L30 16 L34 10 L38 16 L42 12 L46 16" />
    </>
  ),
  streak_100: (
    <>
      <path d="M32 6 Q40 18 38 28 Q48 22 50 12 Q60 30 52 44 Q60 40 58 30 Q64 50 50 58 H14 Q0 50 6 30 Q4 40 12 44 Q4 30 14 12 Q16 22 26 28 Q24 18 32 6 Z" />
    </>
  ),

  // ═══ DEDICACION ═══
  time_30m: (
    <>
      <circle cx="32" cy="32" r="22" />
      <line x1="32" y1="32" x2="32" y2="14" />
      <line x1="32" y1="32" x2="46" y2="32" />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  time_1h: (
    <>
      <circle cx="32" cy="32" r="22" />
      <line x1="32" y1="32" x2="32" y2="16" />
      <line x1="32" y1="32" x2="40" y2="40" />
      <line x1="32" y1="6" x2="32" y2="10" />
      <line x1="32" y1="54" x2="32" y2="58" />
      <line x1="6" y1="32" x2="10" y2="32" />
      <line x1="54" y1="32" x2="58" y2="32" />
    </>
  ),
  time_3h: (
    <>
      <circle cx="32" cy="32" r="22" />
      <line x1="32" y1="32" x2="32" y2="18" />
      <line x1="32" y1="32" x2="44" y2="32" />
      <text x="32" y="14" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor" stroke="none">III</text>
    </>
  ),
  time_5h: (
    <>
      <line x1="14" y1="8" x2="50" y2="8" />
      <line x1="14" y1="56" x2="50" y2="56" />
      <path d="M16 8 H48 L32 28 L48 56 H16 L32 36 Z" />
    </>
  ),
  time_10h: (
    <>
      <path d="M4 50 L20 28 L30 38 L42 18 L60 50 Z" />
      <circle cx="44" cy="14" r="3" />
      <path d="M30 38 L34 32" />
    </>
  ),
  time_20h: (
    <>
      <circle cx="32" cy="32" r="22" />
      <line x1="32" y1="32" x2="32" y2="14" />
      <line x1="32" y1="32" x2="44" y2="38" />
      <text x="32" y="50" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor" stroke="none">XII</text>
    </>
  ),
  time_50h: (
    <path d="M16 32 Q16 18 24 18 Q32 18 32 32 Q32 46 40 46 Q48 46 48 32 Q48 18 40 18 Q32 18 32 32 Q32 46 24 46 Q16 46 16 32 Z" />
  ),
  time_100h: (
    <>
      <path d="M4 50 H60" />
      <circle cx="32" cy="36" r="14" />
      <line x1="32" y1="14" x2="32" y2="20" />
      <line x1="14" y1="22" x2="18" y2="26" />
      <line x1="50" y1="22" x2="46" y2="26" />
      <line x1="6" y1="36" x2="12" y2="36" />
      <line x1="52" y1="36" x2="58" y2="36" />
    </>
  ),

  // ═══ ASIGNATURAS ═══
  subjects_1: (
    <>
      <path d="M8 14 Q20 10 32 16 Q44 10 56 14 V50 Q44 46 32 52 Q20 46 8 50 Z" />
      <line x1="32" y1="16" x2="32" y2="52" />
    </>
  ),
  subjects_3: (
    <>
      <rect x="10" y="14" width="9" height="40" />
      <rect x="21" y="20" width="9" height="34" />
      <rect x="32" y="10" width="9" height="44" />
      <rect x="43" y="24" width="9" height="30" />
      <line x1="6" y1="56" x2="58" y2="56" />
    </>
  ),
  subjects_5: (
    <>
      <rect x="10" y="12" width="14" height="42" rx="2" />
      <rect x="26" y="16" width="14" height="38" rx="2" />
      <rect x="42" y="10" width="14" height="44" rx="2" />
      <line x1="13" y1="22" x2="21" y2="22" />
      <line x1="29" y1="26" x2="37" y2="26" />
      <line x1="45" y1="20" x2="53" y2="20" />
    </>
  ),
  subjects_8: (
    <>
      <path d="M4 26 L32 14 L60 26 L32 38 Z" />
      <path d="M16 32 V44 Q32 52 48 44 V32" />
      <line x1="58" y1="26" x2="58" y2="48" />
      <circle cx="58" cy="50" r="3" />
    </>
  ),
  subjects_10: (
    <>
      <path d="M8 14 H56 L52 20 H12 Z" />
      <line x1="14" y1="20" x2="14" y2="50" />
      <line x1="26" y1="20" x2="26" y2="50" />
      <line x1="38" y1="20" x2="38" y2="50" />
      <line x1="50" y1="20" x2="50" y2="50" />
      <path d="M8 50 H56 V56 H8 Z" />
    </>
  ),
};

const RARITY = {
  common:    { stroke: '#475569', from: '#f1f5f9', to: '#e2e8f0', ring: 'rgba(100,116,139,0.35)' },
  rare:      { stroke: '#1d4ed8', from: '#dbeafe', to: '#bfdbfe', ring: 'rgba(59,130,246,0.45)' },
  epic:      { stroke: '#6d28d9', from: '#ede9fe', to: '#ddd6fe', ring: 'rgba(139,92,246,0.5)' },
  legendary: { stroke: '#b45309', from: '#fef3c7', to: '#fde68a', ring: 'rgba(245,158,11,0.55)' },
};

/**
 * BadgeIcon — render a minimalist line-art badge by code.
 *
 * Props:
 *  - code:   badge code (e.g. 'first_game')
 *  - rarity: 'common' | 'rare' | 'epic' | 'legendary'
 *  - size:   px (default 56)
 *  - earned: bool (default true) — false aplica grayscale
 */
export default function BadgeIcon({ code, rarity = 'common', size = 56, earned = true }) {
  const svg = SVGS[code];
  const palette = RARITY[rarity] || RARITY.common;

  if (!svg) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-slate-100 text-slate-300 text-xs font-bold"
      >?</div>
    );
  }

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${palette.from}, ${palette.to})`,
        boxShadow: `inset 0 0 0 2px ${palette.ring}, 0 1px 2px rgba(0,0,0,0.06)`,
        filter: earned ? 'none' : 'grayscale(1)',
        opacity: earned ? 1 : 0.45,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        fill="none"
        stroke={palette.stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible' }}
      >
        {svg}
      </svg>
    </div>
  );
}

export { SVGS as BADGE_SVGS };
