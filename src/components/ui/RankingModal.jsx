// src/components/ui/RankingModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Star, Timer, Medal, Globe, Target,
  Flame, Clock, Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './RankingModal.css';

const TIME_RANGES = [
  { key: 'today', label: 'Hoy', icon: Clock },
  { key: 'week', label: 'Semana', icon: Calendar },
  { key: 'month', label: 'Mes', icon: Calendar },
  { key: 'all', label: 'Siempre', icon: Flame },
];

const MODE_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'practice', label: '🎮 Práctica' },
  { key: 'test', label: '🎓 Examen' },
];

const SCOPE_FILTERS = [
  { key: 'subject', label: 'Esta asignatura', icon: Target },
  { key: 'app', label: 'Toda la app', icon: Globe },
];

const formatDuration = (s) => {
  if (!s && s !== 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
};

const RankingModal = ({
  isOpen,
  onClose,
  appId,
  appName,
  level,
  grade,
  subjectId,
}) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('subject');

  const fetchRankings = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('get_app_ranking', {
        p_app_id: appId,
        p_level: level || null,
        p_grade: grade ? String(grade) : null,
        p_subject_id: subjectId || null,
        p_mode: modeFilter === 'all' ? null : modeFilter,
        p_time_range: timeRange,
        p_scope: scopeFilter,
        p_limit: 25,
      });
      if (err) throw err;
      setRankings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('RankingModal: error', err);
      setError(
        'No se pudo cargar el ranking. Es posible que la función aún no esté instalada en el servidor.'
      );
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [appId, level, grade, subjectId, modeFilter, timeRange, scopeFilter]);

  useEffect(() => {
    if (isOpen) fetchRankings();
  }, [isOpen, fetchRankings]);

  const getMedalIcon = (rank) => {
    if (rank === 1) return <span className="rk-medal gold">🥇</span>;
    if (rank === 2) return <span className="rk-medal silver">🥈</span>;
    if (rank === 3) return <span className="rk-medal bronze">🥉</span>;
    return <span className="rk-medal normal">{rank}</span>;
  };

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
            <button
              className="rk-modal-close"
              onClick={onClose}
              aria-label="Cerrar ranking"
            >
              <X size={18} />
            </button>

            <div className="rk-modal-header">
              <div className="rk-modal-title">
                <Trophy size={24} />
                <div>
                  <h2>Ranking</h2>
                  <p>{appName || 'Mejores puntuaciones'}</p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="rk-filters">
              {/* Scope */}
              <div className="rk-filter-group">
                <label className="rk-filter-label">Alcance</label>
                <div className="rk-filter-buttons">
                  {SCOPE_FILTERS.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.key}
                        className={`rk-filter-btn ${scopeFilter === f.key ? 'active' : ''}`}
                        onClick={() => setScopeFilter(f.key)}
                      >
                        <Icon size={13} />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modo */}
              <div className="rk-filter-group">
                <label className="rk-filter-label">Modo</label>
                <div className="rk-filter-buttons">
                  {MODE_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      className={`rk-filter-btn ${modeFilter === f.key ? 'active' : ''}`}
                      onClick={() => setModeFilter(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Periodo */}
              <div className="rk-filter-group">
                <label className="rk-filter-label">Periodo</label>
                <div className="rk-filter-buttons">
                  {TIME_RANGES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.key}
                        className={`rk-filter-btn ${timeRange === f.key ? 'active' : ''}`}
                        onClick={() => setTimeRange(f.key)}
                      >
                        <Icon size={13} />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Lista */}
            <div className="rk-list-wrap">
              {loading && (
                <div className="rk-empty">Cargando ranking...</div>
              )}
              {error && !loading && (
                <div className="rk-error">
                  <p>{error}</p>
                  <small>
                    Pídele al administrador que ejecute <code>supabase/migration-ranking.sql</code>.
                  </small>
                </div>
              )}
              {!loading && !error && rankings.length === 0 && (
                <div className="rk-empty">
                  <Medal size={40} />
                  <p>Aún no hay puntuaciones</p>
                  <small>¡Sé el primero en aparecer en el ranking!</small>
                </div>
              )}
              {!loading && !error && rankings.length > 0 && (
                <ul className="rk-list">
                  {rankings.map((r) => (
                    <motion.li
                      key={`${r.rank}-${r.created_at}`}
                      className={`rk-item ${r.rank <= 3 ? `top-${r.rank}` : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: r.rank * 0.02 }}
                    >
                      <div className="rk-item-rank">{getMedalIcon(r.rank)}</div>
                      <div className="rk-item-avatar">{r.avatar || '🎮'}</div>
                      <div className="rk-item-body">
                        <div className="rk-item-name">{r.display_name}</div>
                        <div className="rk-item-meta">
                          {r.mode === 'test' ? (
                            <span className="rk-mode-tag test">🎓 Examen</span>
                          ) : (
                            <span className="rk-mode-tag practice">🎮 Práctica</span>
                          )}
                          {r.level && r.grade && (
                            <span className="rk-meta-item">
                              {r.level === 'primaria' ? 'P' : 'ESO'} {r.grade}º
                            </span>
                          )}
                          <span className="rk-meta-item">
                            <Timer size={10} /> {formatDuration(r.duration_seconds)}
                          </span>
                          <span className="rk-meta-item">{formatDate(r.created_at)}</span>
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
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankingModal;
