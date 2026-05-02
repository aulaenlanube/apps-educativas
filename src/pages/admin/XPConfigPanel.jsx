import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Star, Target, Clock, Flame, Compass, BookOpen, ChevronDown, ChevronRight, GraduationCap, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BadgeIcon from '@/components/ui/BadgeIcon';

// Curva por tramos (mismo cálculo que xp_for_level / calculate_level en BD).
function deltaXp(L) {
  if (L < 50) return 200 + (L - 1) * 34;
  if (L < 80) return 1832 + 200 * (L - 49);
  if (L < 90) return Math.floor(7832 * Math.pow(1.05, L - 79));
  if (L < 100) return Math.floor(7832 * Math.pow(1.05, 10) * Math.pow(1.25, L - 89));
  return null; // L === 100 se trata aparte (duplica el total)
}

function xpForLevel(targetLevel) {
  if (targetLevel <= 1) return 0;
  const target = Math.min(targetLevel, 101);
  let xp = 0;
  for (let L = 1; L < Math.min(target, 100); L++) xp += deltaXp(L);
  if (target === 101) xp = xp * 2;
  return xp;
}

const MAX_LEVEL = 101;

function LevelCurveChart() {
  const data = useMemo(() => {
    const points = [];
    // Saltamos el nivel 1 (xp = 0) porque rompe la escala log; el path arranca en nivel 2.
    for (let lvl = 2; lvl <= MAX_LEVEL; lvl++) {
      points.push({ lvl, xp: xpForLevel(lvl) });
    }
    return points;
  }, []);

  // Escala logarítmica (la curva crece varios órdenes de magnitud).
  const maxXp = data[data.length - 1].xp;
  const minLog = Math.log10(200);          // floor visual al primer escalón (nivel 2 = 200 XP)
  const maxLog = Math.log10(maxXp);
  const yFor = (xp) => (Math.log10(Math.max(xp, 200)) - minLog) / (maxLog - minLog);

  const W = 700, H = 280, PL = 65, PR = 55, PT = 40, PB = 40;
  const cw = W - PL - PR, ch = H - PT - PB;

  const xpPath = data.map((p, i) => {
    const x = PL + ((p.lvl - 1) / (MAX_LEVEL - 1)) * cw;
    const y = PT + ch - yFor(p.xp) * ch;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const startX = PL + ((data[0].lvl - 1) / (MAX_LEVEL - 1)) * cw;
  const xpFill = xpPath + ` L${(PL + cw).toFixed(1)},${(PT + ch).toFixed(1)} L${startX.toFixed(1)},${(PT + ch).toFixed(1)} Z`;

  const gridLevels = [1, 25, 50, 75, 90, 101];
  const gridXp = [200, 1000, 10000, 100000, 1000000];
  const fmtXp = (xp) => xp >= 1_000_000 ? `${(xp/1_000_000).toFixed(1)}M` : xp >= 1_000 ? `${(xp/1_000).toFixed(0)}k` : `${xp}`;

  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Hitos a destacar como puntos
  const milestones = [2, 10, 25, 50, 65, 75, 80, 85, 90, 95, 99, 100, 101];

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="text-[11px] text-slate-500 font-medium">XP total acumulada por nivel (escala logarítmica)</span>
        </div>
        <span className="text-[10px] text-slate-400 italic">Tramos: 1-49 lineal · 50-79 acelera · 80-89 +5%/lvl · 90-99 +25%/lvl · 100→101 duplica</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 300 }}>
        <defs>
          <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Grid horizontal */}
        {gridXp.map(xp => {
          const y = PT + ch - yFor(xp) * ch;
          return (
            <g key={`gx-${xp}`}>
              <line x1={PL} y1={y} x2={PL + cw} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
              <text x={PL - 6} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                {fmtXp(xp)}
              </text>
            </g>
          );
        })}

        {/* Grid vertical */}
        {gridLevels.map(lvl => {
          const x = PL + ((lvl - 1) / (MAX_LEVEL - 1)) * cw;
          return (
            <g key={`gl-${lvl}`}>
              <line x1={x} y1={PT} x2={x} y2={PT + ch} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
              <text x={x} y={H - PB + 16} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                Nv.{lvl}
              </text>
            </g>
          );
        })}

        {/* Área rellena */}
        <motion.path
          d={xpFill}
          fill="url(#xpGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Curva */}
        <motion.path
          d={xpPath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Puntos interactivos en hitos */}
        {data.filter((p) => milestones.includes(p.lvl)).map((p) => {
          const x = PL + ((p.lvl - 1) / (MAX_LEVEL - 1)) * cw;
          const y = PT + ch - yFor(p.xp) * ch;
          const isHovered = hoveredPoint === p.lvl;
          const isLast = p.lvl === MAX_LEVEL;
          const isFirst = p.lvl === 1;
          const tooltipW = 130;
          const tx = isLast ? x - tooltipW + 10 : isFirst ? x - 8 : x - tooltipW / 2;
          const anchor = isLast ? 'end' : isFirst ? 'start' : 'middle';
          const textX = isLast ? x + 4 : isFirst ? x + 4 : x;
          return (
            <g key={`pt-${p.lvl}`}
              onMouseEnter={() => setHoveredPoint(p.lvl)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r={isHovered ? 6 : 4}
                fill="white" stroke="#a855f7" strokeWidth="2"
                className="transition-all duration-200" />
              {isHovered && (
                <>
                  <rect x={tx} y={y - 38} width={tooltipW} height="28" rx="6"
                    fill="#1e293b" fillOpacity="0.92" />
                  <text x={textX} y={y - 20} textAnchor={anchor} fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                    Nv.{p.lvl}: {p.xp.toLocaleString()} XP
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Eje labels */}
        <text x={PL - 6} y={PT - 6} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">XP</text>
        <text x={PL + cw} y={H - PB + 16} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Nivel</text>
      </svg>
    </div>
  );
}

const RARITY_STYLE = {
  common:    { label: 'Comun',      bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  rare:      { label: 'Rara',       bg: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  epic:      { label: 'Epica',      bg: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  legendary: { label: 'Legendaria', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  mythic:    { label: 'Mitica',     bg: 'bg-gradient-to-r from-fuchsia-100 via-pink-100 to-amber-100 text-fuchsia-800', dot: 'bg-fuchsia-500' },
};

const CATEGORY_META = {
  general:     { label: 'Partidas Completadas', icon: Target, color: 'text-blue-500' },
  exams:       { label: 'Examenes Aprobados',   icon: Star,   color: 'text-green-500' },
  mastery:     { label: 'Notas Perfectas',       icon: Trophy, color: 'text-yellow-500' },
  exploration: { label: 'Exploracion de Apps',   icon: Compass, color: 'text-cyan-500' },
  speed:       { label: 'Velocidad',             icon: Zap,    color: 'text-orange-500' },
  streaks:     { label: 'Rachas Diarias',        icon: Flame,  color: 'text-red-500' },
  dedication:  { label: 'Tiempo de Juego',       icon: Clock,  color: 'text-indigo-500' },
  subjects:    { label: 'Asignaturas',           icon: BookOpen, color: 'text-pink-500' },
  mythic:      { label: 'Míticas',                icon: Crown,    color: 'text-fuchsia-500' },
  docencia:    { label: '🍎 Docencia (exclusivas para profesores)', icon: GraduationCap, color: 'text-emerald-600' },
};

export default function XPConfigPanel() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      setBadges(data || []);
      setLoading(false);
    })();
  }, []);

  const grouped = badges.reduce((acc, b) => {
    // Agrupar todas las categorías teacher_* bajo una única "docencia"
    const key = b.category.startsWith('teacher_') ? 'docencia' : b.category;
    (acc[key] ??= []).push(b);
    return acc;
  }, {});

  const toggleCat = (cat) => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* XP por sesión */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          XP por sesion completada
        </h3>
        <p className="text-sm text-slate-500 mb-4">Cada vez que un usuario completa una partida, gana XP segun estos criterios acumulables:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { xp: 10, label: 'Completar una partida', desc: 'Base por cada partida terminada (practica o examen)', color: 'from-blue-500 to-blue-600' },
            { xp: '+5', label: 'Modo examen', desc: 'Bonus adicional si la partida es en modo examen', color: 'from-green-500 to-green-600' },
            { xp: '+5', label: 'Nota >= 5 (Aprobado)', desc: 'Bonus por aprobar la partida', color: 'from-emerald-500 to-emerald-600' },
            { xp: '+5', label: 'Nota >= 7 (Notable)', desc: 'Bonus adicional por notable', color: 'from-yellow-500 to-yellow-600' },
            { xp: '+5', label: 'Nota >= 9 (Sobresaliente)', desc: 'Bonus adicional por sobresaliente', color: 'from-orange-500 to-orange-600' },
            { xp: '+10', label: 'Nota = 10 (Perfecto)', desc: 'Bonus especial por nota perfecta', color: 'from-red-500 to-pink-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-xs font-black text-white">{item.xp}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium">Maximo por sesion: <span className="font-bold">40 XP</span> (10 base + 5 examen + 5+5+5 notas + 10 perfecto)</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">Limite diario: <span className="font-bold">5 partidas por app y dia</span></p>
            <p className="text-xs text-amber-600 mt-1">A partir de la 6a partida en la misma app el mismo dia, no se obtiene XP de sesion. Las insignias si siguen contando normalmente.</p>
          </div>
        </div>
      </motion.div>

      {/* XP por insignias */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          XP por insignias
        </h3>
        <p className="text-sm text-slate-500 mb-4">Todas las insignias otorgan XP al desbloquearlas. Cada insignia solo se puede conseguir una vez. La cantidad de XP depende de la rareza:</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {[
            { rarity: 'common', xp: 25 },
            { rarity: 'rare', xp: 75 },
            { rarity: 'epic', xp: 200 },
            { rarity: 'legendary', xp: 500 },
            { rarity: 'mythic', xp: 1000 },
          ].map(r => {
            const style = RARITY_STYLE[r.rarity];
            return (
              <div key={r.rarity} className={`p-3 rounded-xl ${style.bg} text-center`}>
                <p className="text-2xl font-black">+{r.xp}</p>
                <p className="text-xs font-bold">{style.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Niveles */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-500" />
          Sistema de niveles
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          <strong>101 niveles</strong> con curva por tramos. La dificultad sube suave hasta el 49, acelera entre 50 y 79, se vuelve dura del 80 al 89 (+5% por nivel), crece fuerte entre 90 y 99 (+25% por nivel), y el último escalón <strong>100 → 101 cuesta tanto como llegar a 100 entero</strong>. Pensado para que llegar a 100 sea ambicioso (años de uso intenso) y a 101 una proeza casi simbólica. El bonus de nota tope a +0,5 ya en nivel 50; del 50 al 101 es prestigio puro (avatares legendarios/míticos + insignia <em>Cima del Saber</em>).
        </p>

        {/* Gráfico de curva */}
        <LevelCurveChart />

        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-5">
          {[1,5,10,25,50,65,75,80,85,90,95,99,100,101].map(lvl => {
            const xp = xpForLevel(lvl);
            const highlight = lvl === 50 || lvl === 80 || lvl === 90 || lvl === 100 || lvl === 101;
            return (
              <div key={lvl} className={`text-center p-2 rounded-lg border ${highlight ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-sm font-bold ${highlight ? 'text-purple-700' : 'text-slate-700'}`}>{lvl}</p>
                <p className={`text-[10px] ${highlight ? 'text-purple-500' : 'text-slate-400'}`}>{xp.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">XP total necesario para alcanzar cada nivel. Los hitos en violeta marcan los cambios de tramo y el escalón final.</p>
      </motion.div>

      {/* Catálogo completo de insignias */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-500" />
          Catalogo de insignias ({badges.length} total)
        </h3>
        <p className="text-sm text-slate-500 mb-4">Todas las insignias disponibles, agrupadas por categoria. Los usuarios las descubren al jugar.</p>

        <div className="space-y-2">
          {Object.entries(grouped).map(([cat, catBadges]) => {
            const meta = CATEGORY_META[cat] || { label: cat, icon: Target, color: 'text-slate-500' };
            const Icon = meta.icon;
            const isOpen = expandedCats[cat];

            return (
              <div key={cat}>
                <button onClick={() => toggleCat(cat)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                  <span className="font-semibold text-slate-700 flex-1">{meta.label}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{catBadges.length}</span>
                </button>

                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {catBadges.map(badge => {
                      const rStyle = RARITY_STYLE[badge.rarity] || RARITY_STYLE.common;
                      return (
                        <div key={badge.code} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-100">
                          <BadgeIcon code={badge.code} rarity={badge.rarity} size={36} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700">{badge.name_es}</p>
                            <p className="text-xs text-slate-400 truncate">{badge.description_es}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${rStyle.bg}`}>{rStyle.label}</span>
                          <span className="text-xs text-slate-500 font-medium w-12 text-right">+{badge.xp_reward}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Nota informativa */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          <span className="font-bold">Nota:</span> Los usuarios no ven esta informacion. Las insignias y las acciones que dan XP se descubren jugando.
          Docentes, administradores y usuarios libres tambien ganan XP y suben de nivel al jugar.
        </p>
      </div>
    </div>
  );
}
