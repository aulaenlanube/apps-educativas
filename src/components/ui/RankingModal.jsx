// src/components/ui/RankingModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Star, Timer, Medal, Globe, Users,
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
        {r.duration_seconds != null && (
          <span className="rk-meta-item">
            <Timer size={10} /> {formatDuration(r.duration_seconds)}
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

const RankingSection = ({ title, icon: Icon, rankings, loading, emptyText, userId }) => (
  <div className="rk-section">
    <div className="rk-section-header">
      <Icon size={16} />
      <h3>{title}</h3>
    </div>
    <div className="rk-section-list">
      {loading && <div className="rk-empty-small">Cargando...</div>}
      {!loading && rankings.length === 0 && (
        <div className="rk-empty-small">
          <Medal size={24} />
          <p>{emptyText}</p>
        </div>
      )}
      {!loading && rankings.length > 0 && (
        <ul className="rk-list">
          {rankings.map((r) => (
            <RankingRow
              key={`${r.rank}-${r.display_name}`}
              r={r}
              highlight={userId && r.student_id === userId}
            />
          ))}
        </ul>
      )}
    </div>
  </div>
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
  const [globalRankings, setGlobalRankings] = useState([]);
  const [classRankings, setClassRankings] = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [error, setError] = useState(null);

  const groupId = student?.group_id || null;
  const hasClass = isStudent && !!groupId;

  const fetchRankings = useCallback(async () => {
    if (!appId) return;
    setError(null);

    // Fetch global top 10
    setLoadingGlobal(true);
    try {
      const { data, error: err } = await supabase.rpc('get_high_score_ranking', {
        p_app_id: appId,
        p_level: level || null,
        p_grade: grade ? String(grade) : null,
        p_subject_id: subjectId || null,
        p_limit: 10,
      });
      if (err) throw err;
      setGlobalRankings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('RankingModal global error:', err);
      // Fallback al ranking antiguo si la nueva funcion no existe
      try {
        const { data, error: err2 } = await supabase.rpc('get_app_ranking', {
          p_app_id: appId,
          p_level: level || null,
          p_grade: grade ? String(grade) : null,
          p_subject_id: subjectId || null,
          p_mode: null,
          p_time_range: 'all',
          p_scope: 'subject',
          p_limit: 10,
        });
        if (!err2) {
          setGlobalRankings(Array.isArray(data) ? data : []);
        } else {
          setError('No se pudo cargar el ranking.');
        }
      } catch {
        setError('No se pudo cargar el ranking.');
      }
    } finally {
      setLoadingGlobal(false);
    }

    // Fetch class top 3
    if (hasClass) {
      setLoadingClass(true);
      try {
        const { data, error: err } = await supabase.rpc('get_class_high_score_ranking', {
          p_app_id: appId,
          p_group_id: groupId,
          p_level: level || null,
          p_grade: grade ? String(grade) : null,
          p_subject_id: subjectId || null,
          p_limit: 3,
        });
        if (!err) {
          setClassRankings(Array.isArray(data) ? data : []);
        }
      } catch {
        // Non-blocking
      } finally {
        setLoadingClass(false);
      }
    }
  }, [appId, level, grade, subjectId, hasClass, groupId]);

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
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
                  <h2>Mejores Puntuaciones</h2>
                  <p>{appName || 'Ranking'}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rk-error">
                <p>{error}</p>
                <small>
                  Ejecuta <code>migration-high-scores.sql</code> y <code>migration-ranking-badges.sql</code> en Supabase.
                </small>
              </div>
            )}

            {!error && (
              <div className="rk-list-wrap">
                {/* Ranking de clase - top 3 */}
                {hasClass && (
                  <RankingSection
                    title="Tu Clase"
                    icon={Users}
                    rankings={classRankings}
                    loading={loadingClass}
                    emptyText="Nadie de tu clase ha jugado aun"
                    userId={student?.id}
                  />
                )}

                {/* Ranking global - top 10 */}
                <RankingSection
                  title="Global"
                  icon={Globe}
                  rankings={globalRankings}
                  loading={loadingGlobal}
                  emptyText="Se el primero en aparecer"
                  userId={student?.id}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankingModal;
