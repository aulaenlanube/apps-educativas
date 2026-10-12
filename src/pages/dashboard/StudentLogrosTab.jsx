// Pestaña "Logros" del alumno — Sala de trofeos (rediseño 2026).
// Vitrina con la última insignia bajo el foco, contadores por rareza (que
// filtran), y vitrinas por categoría con medallas BadgeIcon. Solo presentación:
// los datos vienen de useGamification() (prop `gamification`).
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Lock, Star, Zap, Clock, Target, Flame, BookOpen, Compass, Medal, Swords, Users,
  GraduationCap, ClipboardList, MessageSquare, CalendarDays, ThumbsUp, Crown, Sparkles, Award, Gem,
  CheckCircle2, LayoutGrid, Eye, X, Code2,
} from 'lucide-react';
import BadgeIcon from '../../components/ui/BadgeIcon';
import BadgeModal from '../../components/ui/BadgeModal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';
import BrandLoader from '@/components/ui/BrandLoader';
import { DashEmpty, DashButton } from '@/components/dashboard/kit';
import './StudentLogrosTab.css';

// Rareza → etiqueta (singular para la medalla, plural para el contador) e icono.
const RARITY_CONFIG = {
  common:    { label: 'Común',      plural: 'Comunes',     icon: Award },
  rare:      { label: 'Rara',       plural: 'Raras',       icon: Star },
  epic:      { label: 'Épica',      plural: 'Épicas',      icon: Gem },
  legendary: { label: 'Legendaria', plural: 'Legendarias', icon: Crown },
  mythic:    { label: 'Mítica',     plural: 'Míticas',     icon: Flame },
};

const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

const CATEGORY_CONFIG = {
  mythic:           { label: 'Míticas',       icon: Crown },
  general:          { label: 'General',       icon: Target },
  exams:            { label: 'Exámenes',      icon: Star },
  mastery:          { label: 'Maestría',      icon: Zap },
  exploration:      { label: 'Exploración',   icon: Compass },
  speed:            { label: 'Velocidad',     icon: Clock },
  streaks:          { label: 'Rachas',        icon: Flame },
  dedication:       { label: 'Dedicación',    icon: CalendarDays },
  subjects:         { label: 'Asignaturas',   icon: BookOpen },
  ranking:          { label: 'Ranking',       icon: Medal },
  battle_rank:      { label: 'Batallas',      icon: Swords },
  programacion:     { label: 'Programación',  icon: Code2 },
  teacher_groups:   { label: 'Grupos',        icon: Users },
  teacher_students: { label: 'Alumnos',       icon: GraduationCap },
  teacher_tasks:    { label: 'Tareas',        icon: ClipboardList },
  teacher_battles:  { label: 'Batallas Quiz', icon: Swords },
  teacher_messages: { label: 'Mensajes',      icon: MessageSquare },
  teacher_platform: { label: 'Plataforma',    icon: CalendarDays },
  teacher_ratings:  { label: 'Valoraciones',  icon: ThumbsUp },
};

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas', icon: LayoutGrid },
  { id: 'earned', label: 'Conseguidas', icon: CheckCircle2 },
  { id: 'locked', label: 'Por conseguir', icon: Lock },
];

const fmtDate = (iso, long = false) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-ES', long ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function StudentLogrosTab({ gamification }) {
  const { allBadges, loading } = gamification;

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  // Filtro de estado (solo vista): todas / conseguidas / por conseguir.
  const [filterStatus, setFilterStatus] = useState('all');

  const studentBadges = useMemo(() => {
    if (!allBadges?.length) return [];
    return allBadges.filter(b => !b.category.startsWith('teacher_'));
  }, [allBadges]);

  const categories = useMemo(() => {
    if (!studentBadges.length) return [];
    return [...new Set(studentBadges.map(b => b.category))];
  }, [studentBadges]);

  // Conteo por rareza
  const rarityStats = useMemo(() => {
    const map = Object.fromEntries(RARITY_ORDER.map(r => [r, { earned: 0, total: 0 }]));
    for (const b of studentBadges) {
      if (!map[b.rarity]) map[b.rarity] = { earned: 0, total: 0 };
      map[b.rarity].total += 1;
      if (b.earned) map[b.rarity].earned += 1;
    }
    return map;
  }, [studentBadges]);

  const filteredBadges = useMemo(() => {
    if (!studentBadges.length) return [];
    return studentBadges.filter(b => {
      if (filterCategory !== 'all' && b.category !== filterCategory) return false;
      if (filterRarity !== 'all' && b.rarity !== filterRarity) return false;
      return true;
    });
  }, [studentBadges, filterCategory, filterRarity]);

  const earnedCount = filteredBadges.filter(b => b.earned).length;
  const studentEarned = studentBadges.filter(b => b.earned).length;
  const studentTotal = studentBadges.length;
  const overallPct = studentTotal > 0 ? (studentEarned / studentTotal) * 100 : 0;

  // ── Derivados solo de presentación ──
  // all_badges puede no traer earned_at: se completa con earned_badges si viene.
  const earnedAtByCode = useMemo(() => {
    const m = new Map();
    (gamification.earnedBadges || []).forEach((b) => { if (b?.code && b.earned_at) m.set(b.code, b.earned_at); });
    return m;
  }, [gamification.earnedBadges]);
  const dateOf = (b) => b.earned_at || earnedAtByCode.get(b.code) || null;

  // Insignias conseguidas, de la más reciente a la más antigua (sin fecha al final;
  // a igualdad, la más rara primero).
  const trophies = useMemo(() => {
    const list = studentBadges.filter(b => b.earned).map(b => ({ ...b, earned_at: b.earned_at || earnedAtByCode.get(b.code) || null }));
    return list.sort((a, b) => {
      if (a.earned_at && b.earned_at) return a.earned_at < b.earned_at ? 1 : -1;
      if (a.earned_at) return -1;
      if (b.earned_at) return 1;
      return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
    });
  }, [studentBadges, earnedAtByCode]);
  const spotlight = trophies[0] || null;
  const spotlightIsRecent = !!spotlight?.earned_at;
  const shelf = trophies.slice(1, 6);

  const categoryStats = useMemo(() => {
    const m = {};
    for (const b of studentBadges) {
      if (!m[b.category]) m[b.category] = { earned: 0, total: 0 };
      m[b.category].total += 1;
      if (b.earned) m[b.category].earned += 1;
    }
    return m;
  }, [studentBadges]);

  const visibleBadges = useMemo(() => {
    if (filterStatus === 'earned') return filteredBadges.filter(b => b.earned);
    if (filterStatus === 'locked') return filteredBadges.filter(b => !b.earned);
    return filteredBadges;
  }, [filteredBadges, filterStatus]);

  // Vitrinas: una por categoría, en el orden en que llegan.
  const cases = useMemo(() => {
    const map = new Map(categories.map(c => [c, []]));
    visibleBadges.forEach(b => {
      if (!map.has(b.category)) map.set(b.category, []);
      map.get(b.category).push(b);
    });
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [categories, visibleBadges]);

  const hasFilters = filterCategory !== 'all' || filterRarity !== 'all' || filterStatus !== 'all';
  const clearFilters = () => { setFilterCategory('all'); setFilterRarity('all'); setFilterStatus('all'); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <BrandLoader variant="inline" />
      </div>
    );
  }

  return (
    <div className="slt">
      {/* ── Sala de trofeos: total + foco + estante de recientes ── */}
      <motion.section
        className="slt-hall"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="slt-hall__bg" aria-hidden="true">
          <span className="slt-hall__beam slt-hall__beam--l" />
          <span className="slt-hall__beam slt-hall__beam--r" />
          <span className="slt-hall__stars" />
          <span className="slt-hall__floor" />
        </div>

        <div className="slt-hall__intro">
          <span className="slt-kicker"><Trophy size={14} /> Sala de trofeos</span>
          <h2 className="slt-hall__title">Tu vitrina de insignias</h2>
          <div className="slt-hall__count">
            <AnimatedNumber value={studentEarned} className="slt-hall__num" />
            <span className="slt-hall__of">/{studentTotal}</span>
          </div>
          <p className="slt-hall__sub">
            <Sparkles size={14} /> {Math.round(overallPct)}% completado · {studentTotal - studentEarned} por conseguir
          </p>
          <div className="slt-hall__bar" role="progressbar" aria-valuenow={Math.round(overallPct)} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ transform: `scaleX(${overallPct / 100})` }} />
          </div>
        </div>

        <div className={`slt-spot r-${spotlight?.rarity || 'common'}`}>
          <span className="slt-spot__cone" aria-hidden="true" />
          {spotlight ? (
            <>
              <button type="button" className="slt-spot__medal" onClick={() => setSelectedBadge(spotlight)} aria-label={`Ver ${spotlight.name_es}`}>
                <span className="slt-spot__halo" aria-hidden="true" />
                <BadgeIcon code={spotlight.code} rarity={spotlight.rarity} size={128} earned animated />
              </button>
              <span className="slt-spot__pedestal" aria-hidden="true" />
              <span className="slt-spot__label">{spotlightIsRecent ? 'Última conseguida' : 'Joya de tu colección'}</span>
              <strong className="slt-spot__name">{spotlight.name_es}</strong>
              <span className="slt-spot__meta">
                <span className={`slt-rar r-${spotlight.rarity}`}>{(RARITY_CONFIG[spotlight.rarity] || RARITY_CONFIG.common).label}</span>
                {spotlightIsRecent && <span>{fmtDate(spotlight.earned_at)}</span>}
              </span>
            </>
          ) : (
            <>
              <span className="slt-spot__medal slt-spot__medal--empty" aria-hidden="true">?</span>
              <span className="slt-spot__pedestal" aria-hidden="true" />
              <span className="slt-spot__label">Tu primera insignia</span>
              <strong className="slt-spot__name">¡Juega y aparecerá aquí!</strong>
            </>
          )}
        </div>

        <div className="slt-hall__shelf">
          <span className="slt-hall__shelf-title"><Medal size={14} /> {spotlightIsRecent ? 'Recientes' : 'En tu vitrina'}</span>
          {shelf.length > 0 ? (
            <div className="slt-hall__shelf-row">
              {shelf.map(b => (
                <button key={b.code} type="button" className="slt-hall__mini" onClick={() => setSelectedBadge(b)} title={b.name_es}>
                  <BadgeIcon code={b.code} rarity={b.rarity} size={52} earned />
                </button>
              ))}
            </div>
          ) : (
            <p className="slt-hall__shelf-empty">Cada insignia que ganes se colocará en este estante.</p>
          )}
          <span className="slt-hall__plank" aria-hidden="true" />
        </div>
      </motion.section>

      {/* ── Contadores por rareza (filtran al pulsar) ── */}
      <div className="slt-rarities">
        {RARITY_ORDER.map((r, i) => {
          const cfg = RARITY_CONFIG[r];
          const stats = rarityStats[r] || { earned: 0, total: 0 };
          const Icon = cfg.icon;
          const pct = stats.total > 0 ? (stats.earned / stats.total) * 100 : 0;
          const complete = stats.total > 0 && stats.earned === stats.total;
          const active = filterRarity === r;
          return (
            <motion.button
              key={r}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.35, ease: 'easeOut' }}
              onClick={() => setFilterRarity(prev => (prev === r ? 'all' : r))}
              className={`slt-rarity r-${r}${active ? ' is-active' : ''}${complete ? ' is-complete' : ''}`}
              aria-pressed={active}
            >
              <span className="slt-rarity__gem"><Icon size={18} /></span>
              <span className="slt-rarity__label">{cfg.plural}</span>
              {complete && <Sparkles size={15} className="slt-rarity__done" aria-label="¡Categoría completa!" />}
              <span className="slt-rarity__nums">
                <AnimatedNumber value={stats.earned} className="slt-rarity__num" />
                <span>/ {stats.total}</span>
                <em>{Math.round(pct)}%</em>
              </span>
              <span className="slt-rarity__bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Filtros ── */}
      <div className="slt-toolbar">
        <div className="slt-seg" role="group" aria-label="Estado">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              className={filterStatus === f.id ? 'is-active' : ''}
              aria-pressed={filterStatus === f.id}
              onClick={() => setFilterStatus(f.id)}
            >
              <f.icon size={14} /> {f.label}
            </button>
          ))}
        </div>
        <div className="slt-chips">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`slt-chip${filterCategory === 'all' ? ' is-active' : ''}`}
          >
            <LayoutGrid size={13} /> Todas
          </button>
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat] || { label: cat, icon: Target };
            const Icon = cfg.icon;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`slt-chip${filterCategory === cat ? ' is-active' : ''}`}
              >
                <Icon size={13} />
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="slt-toolbar__foot">
          <span className="slt-count">
            Mostrando <strong>{visibleBadges.length}</strong> insignias ({filterStatus === 'locked' ? 0 : earnedCount} conseguidas)
          </span>
          {filterRarity !== 'all' && (
            <button type="button" className={`slt-active-rar r-${filterRarity}`} onClick={() => setFilterRarity('all')}>
              {RARITY_CONFIG[filterRarity]?.plural} <X size={13} />
            </button>
          )}
          {hasFilters && (
            <button type="button" className="slt-clear" onClick={clearFilters}>Quitar filtros</button>
          )}
        </div>
      </div>

      {/* ── Vitrinas por categoría ── */}
      {cases.map(([cat, list]) => {
        const cfg = CATEGORY_CONFIG[cat] || { label: cat, icon: Target };
        const Icon = cfg.icon;
        const cs = categoryStats[cat] || { earned: 0, total: 0 };
        const pct = cs.total ? cs.earned / cs.total : 0;
        return (
          <section key={cat} className="slt-case">
            <header className="slt-case__head">
              <span className="slt-case__icon"><Icon size={18} /></span>
              <h3 className="slt-case__title">{cfg.label}</h3>
              <span className="slt-case__count">{cs.earned}/{cs.total}</span>
              <span className="slt-case__bar"><i style={{ transform: `scaleX(${pct})` }} /></span>
            </header>
            <div className="slt-case__grid">
              {list.map(badge => {
                const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
                const earned = badge.earned;
                const date = earned ? fmtDate(dateOf(badge)) : null;
                return (
                  <button
                    key={badge.code}
                    type="button"
                    onClick={() => setSelectedBadge(badge)}
                    className={`slt-medal r-${badge.rarity || 'common'} ${earned ? 'is-earned' : 'is-locked'}`}
                  >
                    <span className="slt-medal__stage">
                      <BadgeIcon code={badge.code} rarity={badge.rarity} size={68} earned={earned} />
                      {!earned && <span className="slt-medal__lock"><Lock size={12} /></span>}
                    </span>
                    <span className="slt-medal__name">{badge.name_es}</span>
                    <span className="slt-medal__desc">{badge.description_es}</span>
                    <span className="slt-medal__foot">
                      <span className={`slt-rar r-${badge.rarity || 'common'}`}>{rarity.label}</span>
                      <span className="slt-medal__xp">+{badge.xp_reward} XP</span>
                    </span>
                    {date && <span className="slt-medal__date">{date}</span>}
                    <span className="slt-medal__peek" aria-hidden="true"><Eye size={13} /></span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />

      {visibleBadges.length === 0 && (
        <div className="slt-empty">
          <DashEmpty
            title="No hay insignias con estos filtros"
            action={hasFilters ? <DashButton variant="soft" size="sm" onClick={clearFilters}>Ver todas</DashButton> : null}
          >
            {filterStatus === 'earned' ? 'Todavía no has conseguido ninguna de este tipo. ¡A por ella!' : 'Prueba con otra categoría o rareza.'}
          </DashEmpty>
        </div>
      )}
    </div>
  );
}
