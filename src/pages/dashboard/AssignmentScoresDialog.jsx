import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ClipboardList, ArrowUp, ArrowDown, ArrowDownAZ, CheckCircle2, XCircle, Trophy, Users, Target, CalendarClock, MinusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import BrandLoader from '@/components/ui/BrandLoader';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { ProgressRing } from '@/components/dashboard/kit';
import './teacherPanels.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

const fmt1 = (v) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Franja de color de una nota (≥8 verde, ≥5 azul, <5 rojo; sin intentos gris).
function notaBand(nota, attempted) {
  if (!attempted) return 'none';
  if (nota >= 8) return 'good';
  if (nota >= 5) return 'ok';
  return 'bad';
}

const BANDS = [
  { id: 'good', label: '≥ 8' },
  { id: 'ok', label: '5 – 8' },
  { id: 'bad', label: '< 5' },
  { id: 'none', label: 'Sin intentos' },
];

const SORTS = [
  { id: 'desc', icon: ArrowDown, label: 'Nota', title: 'Mejor nota primero' },
  { id: 'asc', icon: ArrowUp, label: 'Nota', title: 'Peor nota primero' },
  { id: 'name', icon: ArrowDownAZ, label: 'A–Z', title: 'Por nombre' },
];

export default function AssignmentScoresDialog({ open, onOpenChange, assignment }) {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [minScore, setMinScore] = useState(assignment?.min_score ?? 5);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc' | 'name'

  const load = useCallback(async () => {
    if (!assignment?.id) return;
    setLoading(true);
    const { data } = await supabase.rpc('teacher_get_assignment_scores', {
      p_assignment_id: assignment.id,
    });
    if (data?.scores) {
      setScores(data.scores);
      if (data.min_score != null) setMinScore(Number(data.min_score));
    } else {
      setScores([]);
    }
    setLoading(false);
  }, [assignment?.id]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const sortedScores = useMemo(() => {
    const arr = [...scores];
    if (sortOrder === 'name') {
      arr.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''));
    } else {
      arr.sort((a, b) => {
        const av = a.best_nota == null ? 0 : Number(a.best_nota);
        const bv = b.best_nota == null ? 0 : Number(b.best_nota);
        return sortOrder === 'desc' ? bv - av : av - bv;
      });
    }
    return arr;
  }, [scores, sortOrder]);

  // Nota media de la clase: los que no lo han intentado cuentan como 0
  // (coherente con "siempre tienes una nota, si no lo has intentado es 0").
  const stats = useMemo(() => {
    const played = scores.filter(s => s.best_nota != null);
    const passed = played.filter(s => s.passed).length;
    const avg = scores.length
      ? scores.reduce((sum, s) => sum + Number(s.best_nota ?? 0), 0) / scores.length
      : null;
    return {
      total: scores.length,
      played: played.length,
      passed,
      avg: avg != null ? Math.round(avg * 10) / 10 : null,
    };
  }, [scores]);

  // Reparto por franjas de color (solo para la barra de distribución)
  const distribution = useMemo(() => {
    const counts = { good: 0, ok: 0, bad: 0, none: 0 };
    scores.forEach(s => { counts[notaBand(Number(s.best_nota ?? 0), s.best_nota != null)] += 1; });
    return counts;
  }, [scores]);

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tp-root tp-dialog tp-dialog--lg">
        <header className="tp-dhead">
          <div className="tp-dhead__row">
            <span className={`tp-dhead__icon ${hasAppIcon(assignment.app_id) ? 'tp-dhead__icon--app' : ''}`}>
              {hasAppIcon(assignment.app_id) ? <AppIcon appId={assignment.app_id} size={46} /> : <ClipboardList size={26} />}
            </span>
            <div className="tp-dhead__text">
              <DialogTitle className="tp-dhead__title">{assignment.title || assignment.app_name}</DialogTitle>
              <DialogDescription className="tp-dhead__sub">Mejor nota de cada alumno en modo examen</DialogDescription>
            </div>
          </div>
          <div className="tp-dhead__chips">
            {assignment.title && <span className="tp-glass">{assignment.app_name}</span>}
            <span className="tp-glass"><Target size={13} /> Nota mínima: {minScore}/10</span>
            {assignment.weight > 1 && <span className="tp-glass tp-glass--gold">x{assignment.weight} en la nota final</span>}
            {assignment.term && <span className="tp-glass">{assignment.term}ª Evaluación</span>}
            {assignment.due_date && (
              <span className="tp-glass"><CalendarClock size={13} /> Fecha límite: {formatDate(assignment.due_date)}</span>
            )}
          </div>
        </header>

        <div className="tp-dbody">
          {/* Indicadores */}
          <div className="tp-sstats">
            <div className="tp-sstat dk-tone-blue">
              <span className="tp-sstat__icon"><Users size={20} /></span>
              <span className="tp-sstat__text">
                <span className="tp-sstat__value">{stats.played}/{stats.total}</span>
                <span className="tp-sstat__label">Han jugado</span>
              </span>
            </div>
            <div className="tp-sstat dk-tone-emerald">
              <span className="tp-sstat__icon"><CheckCircle2 size={20} /></span>
              <span className="tp-sstat__text">
                <span className="tp-sstat__value">{stats.passed}</span>
                <span className="tp-sstat__label">Aprobados</span>
              </span>
            </div>
            <div className="tp-sstat dk-tone-slate">
              <span className="tp-sstat__icon"><MinusCircle size={20} /></span>
              <span className="tp-sstat__text">
                <span className="tp-sstat__value">{stats.total - stats.played}</span>
                <span className="tp-sstat__label">Sin intentar</span>
              </span>
            </div>
            <div className="tp-sstat">
              {stats.avg != null ? (
                <ProgressRing value={stats.avg} max={10} size={46} stroke={11} label={`Nota media ${stats.avg}`} />
              ) : (
                <span className="tp-sstat__icon dk-tone-amber"><Trophy size={20} /></span>
              )}
              <span className="tp-sstat__text">
                <span className="tp-sstat__value">{stats.avg != null ? fmt1(stats.avg) : '—'}</span>
                <span className="tp-sstat__label">Nota media</span>
              </span>
            </div>
          </div>

          {/* Reparto por franjas */}
          {!loading && stats.total > 0 && (
            <div className="tp-dist">
              <div className="tp-dist__bar" role="img" aria-label="Reparto de notas">
                {BANDS.map(b => (distribution[b.id] > 0 ? (
                  <span key={b.id} className={`tp-dist__seg tp-band--${b.id}`} style={{ flexGrow: distribution[b.id] }} />
                ) : null))}
              </div>
              <div className="tp-dist__legend">
                {BANDS.map(b => (
                  <span key={b.id}><i className={`tp-dot tp-band--${b.id}`} />{b.label}: <strong>{distribution[b.id]}</strong></span>
                ))}
              </div>
            </div>
          )}

          {/* Orden */}
          <div className="tp-tabletools">
            <h3 className="tp-tabletools__title">Alumnos</h3>
            <div className="tp-seg tp-seg--sm">
              {SORTS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortOrder(s.id)}
                  className={`tp-seg__btn ${sortOrder === s.id ? 'is-on' : ''}`}
                  title={s.title}
                >
                  <s.icon size={13} /> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matriz de notas */}
          {loading ? (
            <div className="tp-center"><BrandLoader variant="inline" /></div>
          ) : sortedScores.length === 0 ? (
            <div className="tp-arena__empty" style={{ marginTop: 10 }}>No hay alumnos en este grupo.</div>
          ) : (
            <div className="tp-table" role="table" aria-label="Notas de la tarea">
              <div className="tp-trow tp-trow--head" role="row">
                <span role="columnheader">#</span>
                <span role="columnheader">Alumno</span>
                <span role="columnheader" className="tp-col-state">Estado</span>
                <span role="columnheader">Nota</span>
              </div>
              {sortedScores.map((s, idx) => {
                const isTop = sortOrder === 'desc' && idx === 0 && s.best_nota != null;
                const attempted = s.best_nota != null;
                const band = notaBand(Number(s.best_nota ?? 0), attempted);
                return (
                  <div key={s.student_id} role="row" className={`tp-trow ${isTop ? 'is-top' : ''}`}>
                    <span className={`tp-rank ${isTop ? 'tp-rank--1' : ''}`}>{idx + 1}</span>
                    <div className="tp-who">
                      <UserAvatar
                        avatarEmoji={s.avatar_emoji || '🙂'}
                        avatarColor={s.avatar_color}
                        selectedAvatarCode={s.selected_avatar_code}
                        size="sm"
                      />
                      <div className="tp-who__text">
                        <div className="tp-who__name">
                          <span>{s.display_name}</span>
                          {isTop && <Trophy size={14} color="#f59e0b" />}
                        </div>
                        <div className="tp-who__sub">
                          {attempted ? (
                            <>
                              {s.attempts_count} {s.attempts_count === 1 ? 'intento' : 'intentos'}
                              {s.last_played_at && ` · ${formatDate(s.last_played_at)}`}
                            </>
                          ) : (
                            'Sin intentos'
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`tp-state tp-col-state ${attempted ? (s.passed ? 'tp-state--pass' : 'tp-state--fail') : 'tp-state--none'}`}>
                      {attempted ? (
                        s.passed
                          ? <><CheckCircle2 size={15} /> Aprobado</>
                          : <><XCircle size={15} /> Suspenso</>
                      ) : (
                        <><XCircle size={15} /> Pendiente</>
                      )}
                    </span>
                    <span className={`tp-nota tp-band--${band}`}>
                      {fmt1(Number(s.best_nota ?? 0))}<small>/10</small>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
