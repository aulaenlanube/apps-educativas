import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Users, Target, Trophy, Timer, TrendingUp, CalendarDays, BookOpen,
  ListChecks, Table2, Check, Clock, AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';
import BrandLoader from '@/components/ui/BrandLoader';
import { StatTile, ProgressRing } from '@/components/dashboard/kit';
import { QBEmblem, QBCrown, QBShape } from './QBArt';
import materiasData from '../../../public/data/materias.json';
import './QuizBattleDetailModal.css';

function fmtMs(ms) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ───────────── Helpers de presentación ───────────── */

const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };
const pctTone = (p) => (p >= 0.7 ? 'good' : p >= 0.4 ? 'mid' : 'bad');
const fmtPct = (p) => `${Math.round(p * 100)} %`;

function metaCourse(meta) {
  if (!meta?.level || !meta?.grade) return null;
  return `${meta.grade}º ${LEVEL_LABEL[meta.level] || meta.level}`;
}
function metaSubject(meta) {
  if (!meta?.subject_id) return null;
  const list = materiasData?.[meta.level]?.[String(meta.grade)];
  const hit = Array.isArray(list) ? list.find((s) => s.id === meta.subject_id) : null;
  return hit?.nombre || meta.subject_id;
}

function PlayerAvatar({ info, size = 'sm' }) {
  return (
    <UserAvatar
      selectedAvatarCode={info?.selected_avatar_code}
      avatarEmoji={info?.avatar_emoji || '🙂'}
      avatarColor={info?.avatar_color || undefined}
      size={size}
      shape="rounded"
    />
  );
}

function RankBadge({ rank }) {
  const cls = rank === 1 ? 'is-gold' : rank === 2 ? 'is-silver' : rank === 3 ? 'is-bronze' : '';
  return <span className={`qbd-rank ${cls}`}>{rank && rank < 99 ? rank : '—'}</span>;
}

// Podio de los tres primeros (orden visual 2 · 1 · 3).
function Podium({ rows, totalQuestions }) {
  const byRank = new Map();
  rows.forEach((r) => {
    const rk = r.info.rank;
    if (rk >= 1 && rk <= 3 && !byRank.has(rk)) byRank.set(rk, r);
  });
  if (byRank.size === 0) return null;
  const order = [2, 1, 3].filter((rk) => byRank.has(rk));
  return (
    <div className="qbd-podium">
      {order.map((rk) => {
        const r = byRank.get(rk);
        const correct = Object.values(r.cells).filter((c) => c.is_correct).length;
        return (
          <div key={rk} className={`qbd-podium__col is-${rk}`}>
            <div className="qbd-podium__who">
              {rk === 1 && <span className="qbd-podium__crown"><QBCrown size={42} /></span>}
              <PlayerAvatar info={r.info} size={rk === 1 ? 'lg' : 'md'} />
              <strong className="qbd-podium__name" title={r.info.display_name}>{r.info.display_name}</strong>
              <span className="qbd-podium__score">{(r.info.score || 0).toLocaleString('es-ES')} pts</span>
              <span className="qbd-podium__hits">{correct}/{totalQuestions} aciertos</span>
            </div>
            <div className="qbd-podium__step"><span>{rk}</span></div>
          </div>
        );
      })}
    </div>
  );
}

// Tira de casillas por pregunta (acierto / fallo / sin respuesta).
function AnswerStrip({ row, questions }) {
  return (
    <div className="qbd-strip">
      {questions.map((q) => {
        const cell = row.cells[q.question_index];
        const label = `P${q.question_index + 1}`;
        if (!cell) return <span key={q.question_index} className="qbd-sq is-none" title={`${label} · sin datos`} />;
        if (cell.answer_index === null || cell.answer_index === undefined) {
          return <span key={q.question_index} className="qbd-sq is-timeout" title={`${label} · sin respuesta`} />;
        }
        const ok = cell.is_correct;
        return (
          <span
            key={q.question_index}
            className={`qbd-sq ${ok ? 'is-ok' : 'is-ko'}`}
            title={`${label} · ${ok ? `+${cell.score_delta || 0}` : 'fallo'} · ${fmtMs(cell.response_time_ms)}`}
          />
        );
      })}
    </div>
  );
}

export default function QuizBattleDetailModal({ roomCode, onClose }) {
  const { teacher } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Solo presentación: vista del ranking (tiras o tabla completa)
  const [view, setView] = useState('strips');

  useEffect(() => {
    if (!teacher?.id || !roomCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase.rpc('get_quiz_battle_detail', {
      p_teacher_id: teacher.id,
      p_room_code: roomCode,
    }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) { setError(error.message); setLoading(false); return; }
      if (data?.error) { setError('No tienes acceso a esta batalla'); setLoading(false); return; }
      setData(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [teacher?.id, roomCode]);

  // Construir el pivot: filas = jugadores, columnas = preguntas
  const pivot = useMemo(() => {
    if (!data) return null;
    const cells = data.cells || [];
    const questions = (data.questions || []).slice().sort((a, b) => a.question_index - b.question_index);
    const players = (data.players || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99));

    // Map: player (id o nombre) → { [qIdx]: cell }
    const byPlayer = new Map();
    const playerKeys = new Map(); // key consistente para match con players
    players.forEach((p) => {
      const key = p.user_id || `guest-${p.display_name}`;
      playerKeys.set(p.display_name, key);
      byPlayer.set(key, {
        info: p,
        cells: {},
        totalMs: 0,
        answeredCount: 0,
      });
    });
    // También alumnos que estén en cells pero no en players (por si acaso)
    cells.forEach((c) => {
      const key = c.user_id || `guest-${c.display_name}`;
      if (!byPlayer.has(key)) {
        byPlayer.set(key, {
          info: { display_name: c.display_name, avatar_emoji: c.avatar_emoji, rank: 99, score: 0 },
          cells: {},
          totalMs: 0,
          answeredCount: 0,
        });
      }
      byPlayer.get(key).cells[c.question_index] = c;
      if (c.response_time_ms !== null && c.response_time_ms !== undefined) {
        byPlayer.get(key).totalMs += c.response_time_ms;
        byPlayer.get(key).answeredCount += 1;
      }
    });

    // Array final ordenado por ranking
    const rows = Array.from(byPlayer.values())
      .sort((a, b) => (a.info.rank || 99) - (b.info.rank || 99));

    return { rows, questions };
  }, [data]);

  const fastestPlayer = useMemo(() => {
    if (!pivot) return null;
    let best = null;
    pivot.rows.forEach((r) => {
      if (r.answeredCount === 0) return;
      const avg = r.totalMs / r.answeredCount;
      if (!best || avg < best.avg) best = { name: r.info.display_name, emoji: r.info.avatar_emoji, avg };
    });
    return best;
  }, [pivot]);

  // ── Presentación: aciertos por pregunta (derivado del pivot) ──
  const perQuestion = useMemo(() => {
    if (!pivot) return [];
    const n = pivot.rows.length;
    return pivot.questions.map((q) => {
      let correct = 0;
      let timeout = 0;
      pivot.rows.forEach((r) => {
        const c = r.cells[q.question_index];
        if (!c) return;
        if (c.is_correct) correct += 1;
        else if (c.answer_index === null || c.answer_index === undefined) timeout += 1;
      });
      return { q, correct, timeout, pct: n > 0 ? correct / n : 0 };
    });
  }, [pivot]);

  const accuracy = useMemo(() => {
    if (!pivot || pivot.rows.length === 0 || pivot.questions.length === 0) return null;
    const total = perQuestion.reduce((a, x) => a + x.correct, 0);
    return total / (pivot.rows.length * pivot.questions.length);
  }, [pivot, perQuestion]);

  const extremes = useMemo(() => {
    if (perQuestion.length < 2 || !pivot?.rows.length) return null;
    let easy = perQuestion[0];
    let hard = perQuestion[0];
    perQuestion.forEach((x) => {
      if (x.pct > easy.pct) easy = x;
      if (x.pct < hard.pct) hard = x;
    });
    return easy === hard ? null : { easy, hard };
  }, [perQuestion, pivot]);

  const meta = data?.meta;
  const course = metaCourse(meta);
  const subject = metaSubject(meta);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="qbd-root qbd-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="qbd-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qbd-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="qbd-head">
            <div className="qbd-head__art" aria-hidden="true">
              <span className="qbd-head__spot" />
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={`qbd-head__shape qbd-head__shape--${k}`}><QBShape kind={k} size={20} /></span>
              ))}
            </div>
            <span className="qbd-head__emblem"><QBEmblem size={66} /></span>
            <div className="qbd-head__text">
              <h3 id="qbd-title" className="qbd-head__title">Detalle de la batalla</h3>
              <span className="qbd-keys" aria-label={`Código de sala ${roomCode}`}>
                {String(roomCode || '').split('').map((ch, i) => <kbd key={`${ch}${i}`} className="qbd-key">{ch}</kbd>)}
              </span>
              <div className="qbd-head__chips">
                {data?.meta?.created_at && (
                  <span className="qbd-hchip"><CalendarDays size={13} /> {fmtDate(data.meta.created_at)}</span>
                )}
                {course && <span className="qbd-hchip">{course}</span>}
                {subject && <span className="qbd-hchip"><BookOpen size={13} /> {subject}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="qbd-close"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </header>

          {/* Body */}
          <div className="qbd-body">
            {loading && (
              <div className="qbd-loading"><BrandLoader variant="inline" label="Cargando partida…" /></div>
            )}
            {error && !loading && (
              <div className="qbd-error">
                <span className="qbd-error__icon"><AlertTriangle size={26} /></span>
                <strong>No se pudo cargar la partida</strong>
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && pivot && (
              <div className="qbd-content">
                {/* Summary cards */}
                <div className="qbd-kpis">
                  <StatTile icon={Users} tone="indigo" label="Jugadores" value={pivot.rows.length} />
                  <StatTile icon={Target} tone="violet" label="Preguntas" value={pivot.questions.length} />
                  <StatTile
                    icon={Timer}
                    tone="amber"
                    label="Tiempo medio resp."
                    value={data.avg_response_ms != null ? fmtMs(Math.round(data.avg_response_ms || 0)) : '—'}
                  />
                  <div className="qbd-fast">
                    <span className="qbd-fast__icon"><TrendingUp size={20} /></span>
                    <span className="qbd-fast__label">Más rápido</span>
                    {fastestPlayer ? (
                      <span className="qbd-fast__who">
                        <span className="qbd-fast__emoji" aria-hidden="true">{fastestPlayer.emoji || '🙂'}</span>
                        <span className="qbd-fast__name" title={fastestPlayer.name}>{fastestPlayer.name}</span>
                        <span className="qbd-fast__ms">{fmtMs(Math.round(fastestPlayer.avg))}</span>
                      </span>
                    ) : (
                      <span className="qbd-fast__who"><span className="qbd-fast__name">—</span></span>
                    )}
                  </div>
                </div>

                {pivot.rows.length === 0 ? (
                  <p className="qbd-muted">Nadie llegó a jugar esta partida.</p>
                ) : (
                  <div className="qbd-split">
                    {/* Podio */}
                    <section className="qbd-panel qbd-panel--podium">
                      <h4 className="qbd-h"><Trophy size={16} /> Podio</h4>
                      <Podium rows={pivot.rows} totalQuestions={pivot.questions.length} />
                      {accuracy != null && (
                        <div className="qbd-accuracy">
                          <ProgressRing value={Math.round(accuracy * 100)} max={100} size={58} stroke={10} tone={accuracy >= 0.7 ? 'good' : accuracy >= 0.4 ? 'amber' : 'bad'} label={`Acierto medio ${fmtPct(accuracy)}`}>
                            <span className="qbd-accuracy__n">{Math.round(accuracy * 100)}%</span>
                          </ProgressRing>
                          <span>
                            <strong>Acierto medio de la clase</strong>
                            <small>Respuestas correctas sobre el total</small>
                          </span>
                        </div>
                      )}
                    </section>

                    {/* Aciertos por pregunta */}
                    <section className="qbd-panel">
                      <h4 className="qbd-h"><ListChecks size={16} /> Aciertos por pregunta</h4>
                      {extremes && (
                        <div className="qbd-extremes">
                          <span className="qbd-xchip is-good">Más fácil: P{extremes.easy.q.question_index + 1} · {fmtPct(extremes.easy.pct)}</span>
                          <span className="qbd-xchip is-bad">Más difícil: P{extremes.hard.q.question_index + 1} · {fmtPct(extremes.hard.pct)}</span>
                        </div>
                      )}
                      <div className="qbd-qlist">
                        {perQuestion.map(({ q, correct, timeout, pct }) => (
                          <div key={q.question_index} className={`qbd-qrow is-${pctTone(pct)}`}>
                            <span className="qbd-qrow__num">P{q.question_index + 1}</span>
                            <div className="qbd-qrow__body">
                              <p className="qbd-qrow__text" title={q.question_text}>{q.question_text}</p>
                              <p className="qbd-qrow__ok"><Check size={12} strokeWidth={3} /> {q.correct_text}</p>
                              <div className="qbd-qrow__bar">
                                <span className="qbd-track"><i style={{ transform: `scaleX(${pct})` }} /></span>
                                <span className="qbd-qrow__pct">{fmtPct(pct)}</span>
                              </div>
                              <p className="qbd-qrow__meta">
                                {correct}/{pivot.rows.length} aciertos
                                {timeout > 0 && <> · <Clock size={11} /> {timeout} sin responder</>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* Ranking */}
                {pivot.rows.length > 0 && (
                  <section className="qbd-panel">
                    <div className="qbd-rankhead">
                      <h4 className="qbd-h"><Users size={16} /> Clasificación</h4>
                      <div className="qbd-seg" role="group" aria-label="Vista de la clasificación">
                        <button type="button" className={view === 'strips' ? 'is-on' : ''} onClick={() => setView('strips')} aria-pressed={view === 'strips'}>
                          <ListChecks size={14} /> Resumen
                        </button>
                        <button type="button" className={view === 'table' ? 'is-on' : ''} onClick={() => setView('table')} aria-pressed={view === 'table'}>
                          <Table2 size={14} /> Tabla completa
                        </button>
                      </div>
                    </div>

                    {view === 'strips' ? (
                      <>
                        <div className="qbd-players__head">
                          <div className="qbd-legend">
                            <span><i className="qbd-sq is-ok" /> Acierto</span>
                            <span><i className="qbd-sq is-ko" /> Fallo</span>
                            <span><i className="qbd-sq is-timeout" /> Sin respuesta</span>
                          </div>
                          <div className="qbd-player__nums qbd-player__nums--head" aria-hidden="true">
                            <span>Aciertos</span>
                            <span>T. medio</span>
                            <span>Puntos</span>
                          </div>
                        </div>
                        <div className="qbd-players">
                          {pivot.rows.map((row) => {
                            const info = row.info;
                            const avgMs = row.answeredCount > 0 ? Math.round(row.totalMs / row.answeredCount) : null;
                            const correctCount = Object.values(row.cells).filter((c) => c.is_correct).length;
                            return (
                              <div key={info.display_name + (info.user_id || '')} className="qbd-player">
                                <RankBadge rank={info.rank} />
                                <PlayerAvatar info={info} size="sm" />
                                <div className="qbd-player__main">
                                  <strong className="qbd-player__name" title={info.display_name}>{info.display_name}</strong>
                                  <AnswerStrip row={row} questions={pivot.questions} />
                                </div>
                                <div className="qbd-player__nums">
                                  <span className="qbd-player__hits" title="Aciertos">{correctCount}/{pivot.questions.length}</span>
                                  <span className="qbd-player__ms" title="Tiempo medio de respuesta">{fmtMs(avgMs)}</span>
                                  <span className="qbd-player__score" title="Puntuación">{(info.score || 0).toLocaleString('es-ES')}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* Pivot table */
                      <div className="qbd-tablewrap">
                        <table className="qbd-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th className="is-left">Jugador</th>
                              {pivot.questions.map((q) => (
                                <th key={q.question_index} title={q.question_text}>
                                  P{q.question_index + 1}
                                </th>
                              ))}
                              <th>Aciertos</th>
                              <th>T. medio</th>
                              <th className="is-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pivot.rows.map((row) => {
                              const info = row.info;
                              const avgMs = row.answeredCount > 0 ? Math.round(row.totalMs / row.answeredCount) : null;
                              const correctCount = Object.values(row.cells).filter((c) => c.is_correct).length;
                              return (
                                <tr key={info.display_name + (info.user_id || '')}>
                                  <td><RankBadge rank={info.rank} /></td>
                                  <td className="is-left">
                                    <span className="qbd-table__who">
                                      <span className="qbd-table__emoji">{info.avatar_emoji || '🙂'}</span>
                                      <span className="qbd-table__name">{info.display_name}</span>
                                    </span>
                                  </td>
                                  {pivot.questions.map((q) => {
                                    const cell = row.cells[q.question_index];
                                    return (
                                      <td key={q.question_index}>
                                        <Cell cell={cell} />
                                      </td>
                                    );
                                  })}
                                  <td className="qbd-table__hits">
                                    {correctCount}/{pivot.questions.length}
                                  </td>
                                  <td className="qbd-table__ms">
                                    {fmtMs(avgMs)}
                                  </td>
                                  <td className="qbd-table__score is-right">
                                    {(info.score || 0).toLocaleString('es-ES')}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function Cell({ cell }) {
  if (!cell) {
    return <span className="qbd-cell is-none">—</span>;
  }
  if (cell.answer_index === null || cell.answer_index === undefined) {
    return (
      <span className="qbd-cell is-timeout">
        <Clock size={13} />
        <small>sin resp.</small>
      </span>
    );
  }
  const correct = cell.is_correct;
  const delta = cell.score_delta || 0;
  const ms = cell.response_time_ms;
  return (
    <span className={`qbd-cell ${correct ? 'is-ok' : 'is-ko'}`}>
      <b>{correct ? `+${delta}` : '✗'}</b>
      <small>{fmtMs(ms)}</small>
    </span>
  );
}
