// src/components/ui/RankingModal.jsx
// Ranking de una app (rediseño 2026): podio con los 3 primeros (medallas y
// avatares), lista con el resto y la fila del alumno resaltada. Los datos
// (get_app_ranking / get_class_high_score_ranking) y filtros no cambian.
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Timer, Medal, Globe, Users, BookOpen,
  GraduationCap, Gamepad2, Calendar, Filter, Crown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import './RankingModal.css';

const formatDuration = (s) => {
  if (!s && s !== 0) return '--';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const courseLabel = (r) => (r.level === 'primaria' ? `${r.grade}º Pri` : r.level === 'eso' ? `${r.grade}º ESO` : r.level === 'bachillerato' ? `${r.grade}º Bach` : r.level === 'ad' ? 'A.D.' : r.level);
const fmtScore = (v) => Number(v || 0).toLocaleString('es-ES');
const fmtNota = (v) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const cleanAppName = (name = '') =>
  String(name).replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}️‍\s]+/u, '').trim();

const SCOPE_OPTIONS = [
  { id: 'subject', label: 'Esta asignatura', icon: BookOpen },
  { id: 'app', label: 'Toda la app', icon: Globe },
];

const TIME_OPTIONS = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'all', label: 'Siempre' },
];

const MODE_OPTIONS = [
  { id: null, label: 'Todos', icon: null },
  { id: 'test', label: 'Examen', icon: GraduationCap },
  { id: 'practice', label: 'Práctica', icon: Gamepad2 },
];

// ─── Piezas de presentación ────────────────────────────────────────────────

const RankAvatar = ({ r, size = 'sm' }) => (
  <UserAvatar
    selectedAvatarCode={r.selected_avatar_code}
    avatarEmoji={r.avatar || '🎮'}
    avatarColor={r.avatar_color}
    size={size}
    shape="rounded"
    showRarityBorder
  />
);

// Medalla (oro/plata/bronce) o número de puesto.
const MedalBadge = ({ rank, size = 30 }) => (
  rank <= 3
    ? <span className={`rk-medal rk-medal--${rank}`} style={{ width: size, height: size }} aria-label={`Puesto ${rank}`}>{rank}</span>
    : <span className="rk-rank" aria-label={`Puesto ${rank}`}>{rank}</span>
);

const TrophyArt = () => (
  <svg className="rk-trophy" viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="rk-trophy-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fef3c7" />
        <stop offset=".45" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path d="M18 15H11c0 8 4 12 9 12" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <path d="M46 15h7c0 8-4 12-9 12" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <path d="M17 9h30v11c0 9-7 16-15 16s-15-7-15-16z" fill="url(#rk-trophy-gold)" stroke="#92400e" strokeWidth="2" />
    <path d="M22 13v7c0 4 1.6 7.5 4 9.5" stroke="#fff" strokeOpacity=".65" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M32 14l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" fill="#fff" fillOpacity=".92" />
    <rect x="28" y="36" width="8" height="8" rx="1" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
    <path d="M21 50h22l-2-6H23z" fill="url(#rk-trophy-gold)" stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
    <rect x="16" y="50" width="32" height="7" rx="2.5" fill="#7c2d12" />
  </svg>
);

const RankingRow = ({ r, highlight, index = 0 }) => (
  <motion.li
    className={`rk-row${r.rank <= 3 ? ` is-top is-top-${r.rank}` : ''}${highlight ? ' is-me' : ''}`}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index, 12) * 0.03, duration: 0.25 }}
  >
    <span className="rk-row__rank"><MedalBadge rank={r.rank} size={28} /></span>
    <span className="rk-row__avatar"><RankAvatar r={r} size="sm" /></span>
    <div className="rk-row__body">
      <p className="rk-row__name">
        <span>{r.display_name}</span>
        {highlight && <span className="rk-you">Tú</span>}
      </p>
      <p className="rk-row__meta">
        {r.level && r.grade && <span className="rk-tag">{courseLabel(r)}</span>}
        {r.duration_seconds != null && (
          <span className="rk-row__time"><Timer size={11} /> {formatDuration(r.duration_seconds)}</span>
        )}
        {r.mode && (
          <span className={`rk-mode rk-mode--${r.mode === 'test' ? 'test' : 'practice'}`} title={r.mode === 'test' ? 'Examen' : 'Práctica'}>
            {r.mode === 'test' ? <GraduationCap size={11} /> : <Gamepad2 size={11} />}
            {r.mode === 'test' ? 'Examen' : 'Práctica'}
          </span>
        )}
      </p>
    </div>
    <div className="rk-row__score">
      <strong><Star size={12} /> {fmtScore(r.score)}</strong>
      {r.nota != null && <span>{fmtNota(r.nota)}/10</span>}
    </div>
  </motion.li>
);

// Podio: 2º · 1º · 3º. Los huecos sin jugador se pintan vacíos.
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_DELAY = [0.12, 0.28, 0.42];
const Podium = ({ rows, isMe }) => (
  <div className="rk-podium">
    {PODIUM_ORDER.map((idx) => {
      const r = rows[idx];
      const place = idx + 1;
      const me = !!(r && isMe(r));
      return (
        <motion.div
          key={place}
          className={`rk-spot rk-spot--${place}${me ? ' is-me' : ''}${r ? '' : ' is-empty'}`}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: PODIUM_DELAY[idx], type: 'spring', stiffness: 220, damping: 20 }}
        >
          {r ? (
            <div className="rk-spot__who">
              {place === 1 && <Crown className="rk-spot__crown" size={26} aria-hidden="true" />}
              <div className="rk-spot__avatar">
                <RankAvatar r={r} size="lg" />
                <MedalBadge rank={place} size={place === 1 ? 34 : 28} />
              </div>
              <strong className="rk-spot__name" title={r.display_name}>{r.display_name}</strong>
              {me && <span className="rk-you">Tú</span>}
              <span className="rk-spot__score"><Star size={12} /> {fmtScore(r.score)}</span>
              {r.nota != null && <span className="rk-spot__nota">{fmtNota(r.nota)}/10</span>}
            </div>
          ) : (
            <div className="rk-spot__who rk-spot__who--ghost"><span className="rk-spot__ghost">?</span><small>Libre</small></div>
          )}
          <div className="rk-spot__plinth"><span>{place}</span></div>
        </motion.div>
      );
    })}
  </div>
);

const SkeletonRows = ({ n = 3 }) => (
  <ul className="rk-list rk-list--skeleton" aria-label="Cargando">
    {Array.from({ length: n }, (_, i) => (
      <li key={i} className="rk-row rk-row--skeleton"><i /><i /><i /></li>
    ))}
  </ul>
);

const RankingModal = ({
  isOpen,
  onClose,
  appId,
  appName,
  level,
  grade,
  subjectId,
}) => {
  const { student, isStudent } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [classRankings, setClassRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [scope, setScope] = useState('subject');
  const [timeRange, setTimeRange] = useState('all');
  const [mode, setMode] = useState(null);

  const groupId = student?.group_id || null;
  const hasClass = isStudent && !!groupId;

  const fetchRankings = useCallback(async () => {
    if (!appId) return;
    setError(null);
    setLoading(true);

    try {
      const { data, error: err } = await supabase.rpc('get_app_ranking', {
        p_app_id: appId,
        p_level: scope === 'subject' ? (level || null) : null,
        p_grade: scope === 'subject' ? (grade ? String(grade) : null) : null,
        p_subject_id: scope === 'subject' ? (subjectId || null) : null,
        p_mode: mode,
        p_time_range: timeRange,
        p_scope: scope,
        p_limit: 15,
      });
      if (err) throw err;
      setRankings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('RankingModal error:', err);
      setError('No se pudo cargar el ranking.');
    } finally {
      setLoading(false);
    }

    // Class ranking
    if (hasClass) {
      setLoadingClass(true);
      try {
        const { data, error: err } = await supabase.rpc('get_class_high_score_ranking', {
          p_app_id: appId,
          p_group_id: groupId,
          p_level: level || null,
          p_grade: grade ? String(grade) : null,
          p_subject_id: subjectId || null,
          p_limit: 5,
        });
        if (!err) setClassRankings(Array.isArray(data) ? data : []);
      } catch {
        // Non-blocking
      } finally {
        setLoadingClass(false);
      }
    }
  }, [appId, level, grade, subjectId, scope, timeRange, mode, hasClass, groupId]);

  useEffect(() => {
    if (isOpen) fetchRankings();
  }, [isOpen, fetchRankings]);

  const isMe = (r) => !!(student?.id && r.student_id === student.id);
  const podiumRows = rankings.slice(0, 3);
  const restRows = rankings.slice(3);
  const title = cleanAppName(appName) || appName || 'Ranking';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="rk-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="rk-modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rk-title"
          >
            <header className="rk-hero">
              <span className="rk-hero__rays" aria-hidden="true" />
              <span className="rk-hero__dots" aria-hidden="true" />
              <TrophyArt />
              <div className="rk-hero__text">
                <p className="rk-hero__kicker">Ranking</p>
                <h2 id="rk-title">Mejores puntuaciones</h2>
                <div className="rk-hero__app">
                  {appId && hasAppIcon(appId) && <AppIcon appId={appId} size={22} />}
                  <span>{title}</span>
                </div>
              </div>
              <button className="rk-modal-close" onClick={onClose} aria-label="Cerrar ranking">
                <X size={18} />
              </button>
            </header>

            {/* Filtros */}
            <div className="rk-filters">
              <div className="rk-filter-group">
                <div className="rk-filter-label"><Filter size={12} /> Alcance</div>
                <div className="rk-seg">
                  {SCOPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`rk-pill ${scope === opt.id ? 'active' : ''}`}
                      aria-pressed={scope === opt.id}
                      onClick={() => setScope(opt.id)}
                    >
                      <opt.icon size={12} /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rk-filter-group">
                <div className="rk-filter-label"><Calendar size={12} /> Periodo</div>
                <div className="rk-seg">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`rk-pill ${timeRange === opt.id ? 'active' : ''}`}
                      aria-pressed={timeRange === opt.id}
                      onClick={() => setTimeRange(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rk-filter-group">
                <div className="rk-filter-label"><GraduationCap size={12} /> Modo</div>
                <div className="rk-seg">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id || 'all'}
                      type="button"
                      className={`rk-pill ${mode === opt.id ? 'active' : ''}`}
                      aria-pressed={mode === opt.id}
                      onClick={() => setMode(opt.id)}
                    >
                      {opt.icon && <opt.icon size={12} />} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="rk-error">
                <p>{error}</p>
              </div>
            )}

            {!error && (
              <div className="rk-list-wrap">
                {/* Ranking global: podio + resto */}
                <section className="rk-section">
                  <div className="rk-section-header">
                    <Globe size={16} />
                    <h3>{scope === 'subject' ? 'Ranking de esta asignatura' : 'Ranking global de la app'}</h3>
                  </div>
                  {loading && (
                    <div className="rk-podium rk-podium--skeleton" aria-label="Cargando">
                      {[2, 1, 3].map((p) => <div key={p} className={`rk-spot rk-spot--${p}`}><div className="rk-spot__plinth" /></div>)}
                    </div>
                  )}
                  {!loading && rankings.length === 0 && (
                    <div className="rk-empty">
                      <span className="rk-empty__art"><Medal size={30} /></span>
                      <p className="rk-empty__title">Sé el primero en aparecer</p>
                      <p className="rk-empty__text">Juega una partida y tu puntuación encabezará el podio.</p>
                    </div>
                  )}
                  {!loading && rankings.length > 0 && (
                    <>
                      <Podium rows={podiumRows} isMe={isMe} />
                      {restRows.length > 0 && (
                        <ol className="rk-list">
                          {restRows.map((r, i) => (
                            <RankingRow key={`g-${r.rank}-${r.display_name}`} r={r} index={i} highlight={student?.id && r.student_id === student.id} />
                          ))}
                        </ol>
                      )}
                    </>
                  )}
                </section>

                {/* Ranking de clase */}
                {hasClass && (
                  <section className="rk-section rk-section--class">
                    <div className="rk-section-header">
                      <Users size={16} />
                      <h3>Tu clase</h3>
                      <span className="rk-section-hint">Top 5</span>
                    </div>
                    {loadingClass && <SkeletonRows n={3} />}
                    {!loadingClass && classRankings.length === 0 && (
                      <div className="rk-empty rk-empty--small"><Medal size={22} /><p>Nadie de tu clase ha jugado aún</p></div>
                    )}
                    {!loadingClass && classRankings.length > 0 && (
                      <ol className="rk-list">
                        {classRankings.map((r, i) => (
                          <RankingRow key={`c-${r.rank}-${r.display_name}`} r={r} index={i} highlight={student?.id && r.student_id === student.id} />
                        ))}
                      </ol>
                    )}
                  </section>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankingModal;
