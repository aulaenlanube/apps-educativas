import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Clock, AlertTriangle, Trophy, Users, Zap,
  BarChart3, Target, Eye, BookOpen, Layers, Play, Gauge,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashCard, StatTile, MiniBars, DashButton, DashEmpty, SectionGrid } from '@/components/dashboard/kit';
import BrandLoader from '@/components/ui/BrandLoader';
import SubjectIcon from '@/components/SubjectIcon';
import QuizTemplateEditor from './QuizTemplateEditor';
import QuizBattleDetailModal from './QuizBattleDetailModal';
import { QBEmblem, QBShape } from './QBArt';
import materiasData from '../../../public/data/materias.json';
import './QuizTemplatesPanel.css';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ───────────── Helpers de presentación ───────────── */

const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bach.', ad: 'Diversidad' };

function courseLabel(level, grade) {
  if (!level || !grade) return null;
  return `${grade}º ${LEVEL_LABEL[level] || level}`;
}

function subjectName(level, grade, subjectId) {
  if (!subjectId) return null;
  const list = materiasData?.[level]?.[String(grade)];
  const hit = Array.isArray(list) ? list.find((s) => s.id === subjectId) : null;
  return hit?.nombre || subjectId;
}

function shortDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function relativeDate(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) {
    const h = Math.floor(diff / 3600000);
    return h < 1 ? 'hace un momento' : `hace ${h} h`;
  }
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 30) { const w = Math.floor(days / 7); return w === 1 ? 'hace 1 semana' : `hace ${w} semanas`; }
  if (days < 365) { const m = Math.floor(days / 30); return m === 1 ? 'hace 1 mes' : `hace ${m} meses`; }
  const y = Math.floor(days / 365);
  return y === 1 ? 'hace 1 año' : `hace ${y} años`;
}

const fmtNum = (v) => Number(v).toLocaleString('es-ES', { maximumFractionDigits: 1 });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Acentos que se van turnando en las tarjetas de batalla
const CARD_ACCENTS = ['#7c3aed', '#2563eb', '#db2777', '#0d9488', '#ea580c'];

/* ───────────── Escenario (cabecera de la pestaña) ───────────── */

function BattleStage({ quota, loading, onNew, onLaunch }) {
  return (
    <section className="qtp-stage">
      <div className="qtp-stage__art" aria-hidden="true">
        <span className="qtp-stage__spot qtp-stage__spot--a" />
        <span className="qtp-stage__spot qtp-stage__spot--b" />
        <span className="qtp-stage__floor" />
      </div>

      <div className="qtp-stage__main">
        <div className="qtp-stage__emblem">
          <QBEmblem size={104} />
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className={`qtp-stage__shape qtp-stage__shape--${k}`} aria-hidden="true"><QBShape kind={k} size={16} /></span>
          ))}
        </div>
        <div className="qtp-stage__text">
          <span className="qtp-stage__kicker"><Zap size={13} /> Quiz Battle · en directo</span>
          <h2 className="qtp-stage__title">Tus batallas</h2>
          <p className="qtp-stage__lead">
            Prepara batallas con tus propias preguntas y lánzalas en el aula: el alumnado se une con el código de sala y compite por el podio.
          </p>
          <div className="qtp-stage__actions">
            <DashButton variant="amber" size="lg" icon={Plus} onClick={onNew}>Nueva batalla</DashButton>
            <DashButton variant="glass" icon={Play} onClick={onLaunch}>Iniciar batalla</DashButton>
          </div>
        </div>
        <QuotaMeter quota={quota} loading={loading} />
      </div>
    </section>
  );
}

// Cuota mensual: una casilla por batalla (si la cuota es razonable) + texto claro.
function QuotaMeter({ quota, loading }) {
  if (!quota) {
    return (
      <div className="qtp-quota is-empty">
        <span className="qtp-quota__label"><Gauge size={14} /> Cuota mensual</span>
        <span className="qtp-quota__big">—</span>
        <span className="qtp-quota__hint">{loading ? 'Cargando…' : 'No disponible'}</span>
      </div>
    );
  }
  const total = Math.max(0, Number(quota.quota) || 0);
  const used = Math.max(0, Number(quota.used) || 0);
  const remaining = Math.max(0, Number(quota.remaining) || 0);
  const state = quota.remaining > 2 ? 'good' : quota.remaining > 0 ? 'warn' : 'bad';
  const pips = total > 0 && total <= 20;
  return (
    <div className={`qtp-quota is-${state}`}>
      <span className="qtp-quota__label"><Gauge size={14} /> Cuota mensual</span>
      <div className="qtp-quota__nums">
        <span className="qtp-quota__big">{used}</span>
        <span className="qtp-quota__of">/ {total} usadas</span>
      </div>
      {pips ? (
        <div className="qtp-quota__pips" role="img" aria-label={`${used} de ${total} batallas usadas este mes`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < used ? 'is-used' : ''} />
          ))}
        </div>
      ) : (
        <span className="qtp-quota__bar"><i style={{ transform: `scaleX(${Math.min(1, used / Math.max(total, 1))})` }} /></span>
      )}
      <span className="qtp-quota__hint">
        {quota.remaining > 0
          ? `${remaining} batalla${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''} este mes`
          : 'Límite mensual alcanzado'}
      </span>
    </div>
  );
}

/* ───────────── Tarjeta de batalla (plantilla) ───────────── */

function TemplateCard({ t, index, onEdit, onDelete }) {
  const course = courseLabel(t.level, t.grade);
  const subject = subjectName(t.level, t.grade, t.subject_id);
  const count = Number(t.question_count);
  return (
    <article className="qtp-tcard" style={{ '--acc': CARD_ACCENTS[index % CARD_ACCENTS.length] }}>
      <div className="qtp-tcard__band">
        <span className="qtp-tcard__dots" aria-hidden="true">
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className={`qtp-dot qtp-dot--c${k}`}><QBShape kind={k} size={13} /></span>
          ))}
        </span>
        <span className="qtp-tcard__emblem" aria-hidden="true"><QBEmblem size={58} /></span>
        <span className="qtp-tcard__count">
          <b>{Number.isFinite(count) ? count : '—'}</b>
          <small>{count === 1 ? 'pregunta' : 'preguntas'}</small>
        </span>
      </div>
      <div className="qtp-tcard__body">
        <h3 className="qtp-tcard__title" title={t.name}>{t.name}</h3>
        {t.description
          ? <p className="qtp-tcard__desc">{t.description}</p>
          : <p className="qtp-tcard__desc is-empty">Sin descripción</p>}
        <div className="qtp-tcard__chips">
          {course && <span className="qtp-chip qtp-chip--blue">{course}</span>}
          {subject && <span className="qtp-chip qtp-chip--violet"><BookOpen size={12} /> {subject}</span>}
          {t.updated_at && (
            <span className="qtp-chip" title={formatDate(t.updated_at)}>
              <Clock size={12} /> Editada {relativeDate(t.updated_at)}
            </span>
          )}
        </div>
      </div>
      <footer className="qtp-tcard__foot">
        <DashButton variant="soft" size="sm" icon={Edit3} onClick={onEdit}>Editar preguntas</DashButton>
        <button
          type="button"
          onClick={onDelete}
          className="qtp-iconbtn qtp-iconbtn--danger"
          title="Eliminar"
          aria-label={`Eliminar ${t.name}`}
        >
          <Trash2 size={16} />
        </button>
      </footer>
    </article>
  );
}

/* ───────────── Historial ───────────── */

function CodeKeys({ code, size = 'md' }) {
  return (
    <span className={`qtp-keys qtp-keys--${size}`} aria-label={`Código de sala ${code}`}>
      {String(code || '—').split('').map((ch, i) => (
        <kbd key={`${ch}${i}`} className="qtp-key">{ch}</kbd>
      ))}
    </span>
  );
}

function HistoryChart({ history }) {
  const rows = history.slice().reverse(); // de la más antigua a la más reciente
  const values = rows.map((h) => Number(h.player_count) || 0);
  const max = Math.max(...values);
  const avg = values.reduce((a, v) => a + v, 0) / values.length;
  const data = rows.map((h, i) => ({ label: `${h.room_code}-${i}`, value: Number(h.player_count) || 0, code: h.room_code, date: h.created_at }));
  return (
    <div className="qtp-chart">
      <div className="qtp-chart__plot">
        <span className="qtp-chart__title"><BarChart3 size={14} /> Jugadores por partida</span>
        <MiniBars
          data={data}
          height={96}
          tone="indigo"
          formatTip={(d) => `${d.code} · ${shortDate(d.date) || '—'}: ${plural(d.value, 'jugador', 'jugadores')}`}
        />
        <div className="qtp-chart__axis">
          <span>{shortDate(rows[0]?.created_at) || ''}</span>
          <span>{shortDate(rows[rows.length - 1]?.created_at) || ''}</span>
        </div>
      </div>
      <div className="qtp-chart__facts">
        <div className="qtp-fact">
          <b>{fmtNum(max)}</b>
          <span>Máximo</span>
        </div>
        <div className="qtp-fact">
          <b>{fmtNum(Math.round(avg * 10) / 10)}</b>
          <span>Media</span>
        </div>
        <div className="qtp-fact">
          <b>{rows.length}</b>
          <span>Partidas</span>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ h, onOpen }) {
  const course = courseLabel(h.level, h.grade);
  const subject = subjectName(h.level, h.grade, h.subject_id);
  return (
    <div className="qtp-hrow" onClick={onOpen}>
      <CodeKeys code={h.room_code} />
      <div className="qtp-hrow__course">
        <span className="qtp-subj" aria-hidden="true">
          {h.subject_id ? <SubjectIcon subjectId={h.subject_id} /> : null}
          <span className="qtp-subj__fallback"><Zap size={18} /></span>
        </span>
        <span className="qtp-hrow__titles">
          <strong>{course || '—'}</strong>
          <small>{subject || 'Sin asignatura'}</small>
        </span>
      </div>
      <div className="qtp-hrow__stats">
        <span className="qtp-chip qtp-chip--indigo" title="Jugadores">
          <Users size={12} /> {h.player_count || 0}
        </span>
        <span className="qtp-chip" title="Preguntas">
          <Target size={12} /> {h.total_questions || 0} preg.
        </span>
        <span className="qtp-chip" title="Tiempo por pregunta">
          <Clock size={12} /> {h.time_per_question ? `${h.time_per_question} s` : '—'}
        </span>
      </div>
      <div className="qtp-hrow__date" title={formatDate(h.created_at)}>
        <strong>{relativeDate(h.created_at)}</strong>
        <small>{formatDate(h.created_at)}</small>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        className="qtp-hrow__btn"
        aria-label={`Ver detalle de la partida ${h.room_code}`}
      >
        <Eye size={15} /> <span>Ver detalle</span>
      </button>
    </div>
  );
}

export default function QuizTemplatesPanel() {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [detailRoomCode, setDetailRoomCode] = useState(null);

  // Stats & history
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quota, setQuota] = useState(null);

  const fetchTemplates = useCallback(async () => {
    if (!teacher?.id) return;
    setLoading(true);
    const { data } = await supabase.rpc('get_teacher_quiz_templates', {
      p_teacher_id: teacher.id,
    });
    setTemplates(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [teacher?.id]);

  const fetchStats = useCallback(async () => {
    if (!teacher?.id) return;
    setHistoryLoading(true);

    const [statsRes, histRes, quotaRes] = await Promise.all([
      supabase.rpc('get_teacher_quiz_battle_stats', { p_teacher_id: teacher.id }),
      supabase
        .from('quiz_battle_sessions')
        .select('room_code, created_at, player_count, total_questions, level, grade, subject_id, time_per_question')
        .eq('user_id', teacher.id)
        .eq('user_type', 'host')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.rpc('get_teacher_quiz_battle_quota', { p_teacher_id: teacher.id }),
    ]);

    if (statsRes.data && !statsRes.data.error) setStats(statsRes.data);
    if (histRes.data) setHistory(histRes.data);
    if (quotaRes.data && !quotaRes.data.error) setQuota(quotaRes.data);
    setHistoryLoading(false);
  }, [teacher?.id]);

  useEffect(() => { fetchTemplates(); fetchStats(); }, [fetchTemplates, fetchStats]);

  const handleDelete = async (id) => {
    const { data } = await supabase.rpc('delete_quiz_template', {
      p_template_id: id,
      p_teacher_id: teacher.id,
    });
    if (data?.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Batalla eliminada' });
    }
    setDeleteConfirm(null);
  };

  const handleSaved = () => {
    setEditingId(null);
    fetchTemplates();
  };

  // ── Editor view ──
  if (editingId !== null) {
    return (
      <QuizTemplateEditor
        templateId={editingId === 'new' ? null : editingId}
        onBack={() => setEditingId(null)}
        onSaved={handleSaved}
      />
    );
  }

  // ── List view ──
  const hasStats = !historyLoading && !!stats;
  const totalQuestions = templates.reduce((a, t) => a + (Number(t.question_count) || 0), 0);
  const deletingName = deleteConfirm ? templates.find((t) => t.id === deleteConfirm)?.name : null;

  return (
    <div className="qtp">
      {/* ═══ Escenario + cuota ═══ */}
      <BattleStage
        quota={quota}
        loading={historyLoading}
        onNew={() => setEditingId('new')}
        onLaunch={() => navigate('/quiz-battle/host')}
      />

      {/* ═══ Resumen ═══ */}
      <SectionGrid cols={4}>
        <StatTile
          icon={Zap}
          tone="violet"
          value={hasStats ? (Number(stats.total_hosted) || 0) : '—'}
          label="Batallas jugadas"
          sub="Partidas en directo"
        />
        <StatTile
          icon={Users}
          tone="indigo"
          value={hasStats ? (Number(stats.total_players_served) || 0) : '—'}
          label="Jugadores totales"
          sub="Suma de participantes"
        />
        <StatTile
          icon={BarChart3}
          tone="emerald"
          value={hasStats && stats.avg_players != null ? Number(stats.avg_players) : '—'}
          format={fmtNum}
          label="Media de jugadores"
          sub="Por partida"
        />
        <StatTile
          icon={BookOpen}
          tone="amber"
          value={hasStats ? (Number(stats.subjects_used) || 0) : '—'}
          label="Asignaturas"
          sub="Usadas en tus batallas"
        />
      </SectionGrid>

      {/* ═══ Batallas disponibles ═══ */}
      <DashCard
        icon={Layers}
        tone="amber"
        title="Batallas disponibles"
        subtitle={templates.length > 0
          ? `${plural(templates.length, 'batalla', 'batallas')} · ${plural(totalQuestions, 'pregunta', 'preguntas')} en total`
          : 'Elige exactamente las preguntas que quieres usar en clase'}
        actions={(
          <DashButton size="sm" variant="amber" icon={Plus} onClick={() => setEditingId('new')}>
            Nueva batalla
          </DashButton>
        )}
      >
        {loading ? (
          <div className="qtp-loading"><BrandLoader variant="inline" /></div>
        ) : templates.length === 0 ? (
          <DashEmpty
            title="Aún no tienes batallas creadas"
            action={<DashButton variant="amber" icon={Plus} onClick={() => setEditingId('new')}>Crear la primera</DashButton>}
          >
            Crea una batalla para elegir exactamente las preguntas que quieres usar.
          </DashEmpty>
        ) : (
          <div className="qtp-tgrid">
            {templates.map((t, i) => (
              <TemplateCard
                key={t.id}
                t={t}
                index={i}
                onEdit={() => setEditingId(t.id)}
                onDelete={() => setDeleteConfirm(t.id)}
              />
            ))}
            <button type="button" className="qtp-tnew" onClick={() => setEditingId('new')}>
              <span className="qtp-tnew__plus"><Plus size={26} /></span>
              <strong>Nueva batalla</strong>
              <small>Del banco del Rosco o con tus propias preguntas</small>
            </button>
          </div>
        )}
      </DashCard>

      {/* ═══ Historial de partidas ═══ */}
      <DashCard
        icon={Trophy}
        tone="violet"
        title="Historial de partidas"
        subtitle={history.length > 0
          ? `Tus últimas ${plural(history.length, 'partida', 'partidas')} en directo`
          : 'Aquí aparecerán las batallas que lances en el aula'}
      >
        {historyLoading ? (
          <div className="qtp-loading"><BrandLoader variant="inline" /></div>
        ) : history.length === 0 ? (
          <DashEmpty
            title="Aún no has jugado ninguna batalla"
            action={<DashButton variant="amber" icon={Play} onClick={() => navigate('/quiz-battle/host')}>Iniciar batalla</DashButton>}
          >
            Pulsa «Iniciar batalla» para empezar tu primera partida.
          </DashEmpty>
        ) : (
          <>
            {history.length >= 3 && <HistoryChart history={history} />}
            <div className="qtp-hlist">
              {history.map((h, i) => (
                <HistoryRow key={`${h.room_code}-${i}`} h={h} onOpen={() => setDetailRoomCode(h.room_code)} />
              ))}
            </div>
          </>
        )}
      </DashCard>

      {/* Battle detail modal */}
      {detailRoomCode && (
        <QuizBattleDetailModal
          roomCode={detailRoomCode}
          onClose={() => setDetailRoomCode(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {createPortal(
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              key="qtp-delete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="qtp-portal qtp-overlay"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.94, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="qtp-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="qtp-delete-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qtp-dialog__head qtp-dialog__head--danger">
                  <span className="qtp-dialog__icon"><AlertTriangle size={24} /></span>
                  <div>
                    <h3 id="qtp-delete-title">Eliminar batalla</h3>
                    {deletingName && <p className="qtp-dialog__sub">{deletingName}</p>}
                  </div>
                </div>
                <p className="qtp-dialog__text">
                  Esta acción no se puede deshacer. Se eliminará la batalla y todas sus preguntas.
                </p>
                <div className="qtp-dialog__actions">
                  <DashButton variant="soft" onClick={() => setDeleteConfirm(null)}>
                    Cancelar
                  </DashButton>
                  <DashButton variant="rose" icon={Trash2} onClick={() => handleDelete(deleteConfirm)}>
                    Eliminar
                  </DashButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
