// src/components/ui/RankingModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Star, Timer, Medal, Globe, Users, BookOpen,
  GraduationCap, Gamepad2, Calendar, Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import './RankingModal.css';

const formatDuration = (s) => {
  if (!s && s !== 0) return '--';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const getMedalIcon = (rank) => {
  if (rank === 1) return <span className="rk-medal gold">🥇</span>;
  if (rank === 2) return <span className="rk-medal silver">🥈</span>;
  if (rank === 3) return <span className="rk-medal bronze">🥉</span>;
  return <span className="rk-medal normal">{rank}</span>;
};

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

const RankingRow = ({ r, highlight }) => (
  <motion.li
    className={`rk-item ${r.rank <= 3 ? `top-${r.rank}` : ''} ${highlight ? 'rk-highlight' : ''}`}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: r.rank * 0.03 }}
  >
    <div className="rk-item-rank">{getMedalIcon(r.rank)}</div>
    <div className="rk-item-avatar">{r.avatar || '🎮'}</div>
    <div className="rk-item-body">
      <div className="rk-item-name">{r.display_name}</div>
      <div className="rk-item-meta">
        {r.level && r.grade && (
          <span className="rk-meta-item rk-meta-course">
            {r.level === 'primaria' ? `${r.grade}º Pri` : r.level === 'eso' ? `${r.grade}º ESO` : r.level === 'bachillerato' ? `${r.grade}º Bach` : r.level === 'ad' ? 'A.D.' : r.level}
          </span>
        )}
        {r.duration_seconds != null && (
          <span className="rk-meta-item">
            <Timer size={10} /> {formatDuration(r.duration_seconds)}
          </span>
        )}
        {r.mode && (
          <span className={`rk-meta-item rk-meta-mode ${r.mode}`}>
            {r.mode === 'test' ? '📝' : '🎮'}
          </span>
        )}
      </div>
    </div>
    <div className="rk-item-score">
      <div className="rk-item-score-value">
        <Star size={12} />
        {Number(r.score || 0).toLocaleString('es-ES')}
      </div>
      {r.nota != null && (
        <div className="rk-item-nota">
          {Number(r.nota).toFixed(1)}/10
        </div>
      )}
    </div>
  </motion.li>
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
          >
            <button className="rk-modal-close" onClick={onClose} aria-label="Cerrar ranking">
              <X size={18} />
            </button>

            <div className="rk-modal-header">
              <div className="rk-modal-title">
                <Trophy size={24} />
                <div>
                  <h2>Mejores Puntuaciones</h2>
                  <p>{appName || 'Ranking'}</p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="rk-filters">
              {/* Alcance */}
              <div className="rk-filter-group">
                <div className="rk-filter-label"><Filter size={12} /> Alcance</div>
                <div className="rk-filter-pills">
                  {SCOPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={`rk-pill ${scope === opt.id ? 'active' : ''}`}
                      onClick={() => setScope(opt.id)}
                    >
                      <opt.icon size={12} /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Periodo */}
              <div className="rk-filter-group">
                <div className="rk-filter-label"><Calendar size={12} /> Periodo</div>
                <div className="rk-filter-pills">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={`rk-pill ${timeRange === opt.id ? 'active' : ''}`}
                      onClick={() => setTimeRange(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo */}
              <div className="rk-filter-group">
                <div className="rk-filter-label"><GraduationCap size={12} /> Modo</div>
                <div className="rk-filter-pills">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id || 'all'}
                      className={`rk-pill ${mode === opt.id ? 'active' : ''}`}
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
                {/* Ranking de clase */}
                {hasClass && (
                  <div className="rk-section">
                    <div className="rk-section-header">
                      <Users size={16} />
                      <h3>Tu Clase</h3>
                    </div>
                    <div className="rk-section-list">
                      {loadingClass && <div className="rk-empty-small">Cargando...</div>}
                      {!loadingClass && classRankings.length === 0 && (
                        <div className="rk-empty-small"><Medal size={24} /><p>Nadie de tu clase ha jugado aún</p></div>
                      )}
                      {!loadingClass && classRankings.length > 0 && (
                        <ul className="rk-list">
                          {classRankings.map((r) => (
                            <RankingRow key={`c-${r.rank}-${r.display_name}`} r={r} highlight={student?.id && r.student_id === student.id} />
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Ranking global */}
                <div className="rk-section">
                  <div className="rk-section-header">
                    <Globe size={16} />
                    <h3>{scope === 'subject' ? 'Ranking de esta asignatura' : 'Ranking global de la app'}</h3>
                  </div>
                  <div className="rk-section-list">
                    {loading && <div className="rk-empty-small">Cargando...</div>}
                    {!loading && rankings.length === 0 && (
                      <div className="rk-empty-small"><Medal size={24} /><p>Sé el primero en aparecer</p></div>
                    )}
                    {!loading && rankings.length > 0 && (
                      <ul className="rk-list">
                        {rankings.map((r) => (
                          <RankingRow key={`g-${r.rank}-${r.display_name}`} r={r} highlight={student?.id && r.student_id === student.id} />
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankingModal;
