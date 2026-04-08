import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Star, Target, Clock, Flame, Compass, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BadgeIcon from '@/components/ui/BadgeIcon';

function LevelCurveChart() {
  const data = useMemo(() => {
    const points = [];
    for (let lvl = 1; lvl <= 50; lvl++) {
      let xp = 0;
      for (let i = 1; i < lvl; i++) xp += 200 + (i - 1) * 34;
      points.push({ lvl, xp });
    }
    return points;
  }, []);

  const maxXp = data[data.length - 1].xp;

  const W = 700, H = 280, PL = 55, PR = 55, PT = 40, PB = 40;
  const cw = W - PL - PR, ch = H - PT - PB;

  const xpPath = data.map((p, i) => {
    const x = PL + (i / 49) * cw;
    const y = PT + ch - (p.xp / maxXp) * ch;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const xpFill = xpPath + ` L${(PL + cw).toFixed(1)},${(PT + ch).toFixed(1)} L${PL.toFixed(1)},${(PT + ch).toFixed(1)} Z`;

  const gridLevels = [1, 10, 20, 30, 40, 50];
  const gridXp = [0, 10000, 20000, 30000, 40000, 50000];

  const [hoveredPoint, setHoveredPoint] = useState(null);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
        <span className="text-[11px] text-slate-500 font-medium">XP total acumulada por nivel</span>
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
          const y = PT + ch - (xp / maxXp) * ch;
          return (
            <g key={`gx-${xp}`}>
              <line x1={PL} y1={y} x2={PL + cw} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
              <text x={PL - 6} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                {xp >= 1000 ? `${(xp/1000).toFixed(0)}k` : xp}
              </text>
            </g>
          );
        })}

        {/* Grid vertical */}
        {gridLevels.map(lvl => {
          const x = PL + ((lvl - 1) / 49) * cw;
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

        {/* Puntos interactivos */}
        {data.filter((_, i) => i % 5 === 0 || i === 49).map((p) => {
          const x = PL + ((p.lvl - 1) / 49) * cw;
          const y = PT + ch - (p.xp / maxXp) * ch;
          const isHovered = hoveredPoint === p.lvl;
          const isLast = p.lvl === 50;
          const tooltipW = 100;
          // Alinear tooltip a la izquierda si es el último punto
          const tx = isLast ? x - tooltipW + 10 : x - tooltipW / 2;
          const anchor = isLast ? 'end' : 'middle';
          const textX = isLast ? x + 4 : x;
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
    (acc[b.category] ??= []).push(b);
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { rarity: 'common', xp: 25 },
            { rarity: 'rare', xp: 75 },
            { rarity: 'epic', xp: 200 },
            { rarity: 'legendary', xp: 500 },
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
        <p className="text-sm text-slate-500 mb-4">50 niveles con curva progresiva. Cada nivel requiere mas XP que el anterior.</p>

        {/* Gráfico de curva */}
        <LevelCurveChart />

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-5">
          {[1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50].map(lvl => {
            let xp = 0;
            for (let i = 1; i < lvl; i++) xp += 200 + (i - 1) * 34;
            return (
              <div key={lvl} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-bold text-slate-700">{lvl}</p>
                <p className="text-[10px] text-slate-400">{xp.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">Los numeros muestran el XP total necesario para alcanzar cada nivel</p>
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
