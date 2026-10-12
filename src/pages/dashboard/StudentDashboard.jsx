// Panel del alumno (/mi-panel) — rediseño 2026 con el kit de paneles
// (src/components/dashboard/kit, ver su README). Es un "hub de juego": héroe con
// avatar, nivel y XP; dock de pestañas; Resumen con la medalla de la nota, la
// arena de duelos, misiones, insignias, actividad, asignaturas, apps favoritas,
// batallas y últimas partidas; Tareas como diario de misiones; Historial como
// línea de tiempo.
//
// Solo presentación: las RPC, los estados, los efectos y los cálculos (nota
// base de tareas, filtros por evaluación/estado) son los de siempre.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Gamepad2, Clock, Target, Trophy, Flame, BarChart3, BookOpen, CalendarDays, Star, Zap,
  MessageSquare, MessagesSquare, Award, ClipboardList, CheckCircle2, AlertTriangle, Compass, Swords,
  ChevronRight, Medal, Timer, Sparkles, ListChecks, User, Users, Crown, History, PartyPopper,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import StudentProfileEditor from './StudentProfileEditor';
import StudentChatTab from './StudentChatTab';
import StudentLogrosTab from './StudentLogrosTab';
import MyFeedbacksSection from '@/components/ui/MyFeedbacksSection';
import { useGamification } from '@/hooks/useGamification';
import DuelCreateModal from '@/components/duel/DuelCreateModal';
import DuelInbox from '@/components/duel/DuelInbox';
import DuelGradePanel from '@/components/duel/DuelGradePanel';
import useIncomingDuels from '@/hooks/useIncomingDuels';
import { getGradeWithDuelBonus } from '@/services/duelService';
import UserAvatar from '@/components/ui/UserAvatar';
import BrandLoader from '@/components/ui/BrandLoader';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import SubjectIcon, { getSubjectAccent } from '@/components/SubjectIcon';
import BadgeIcon from '@/components/ui/BadgeIcon';
import {
  DashPage, DashHero, DashDock, DashCard, StatTile, ProgressRing, MiniBars, MeterRow, QuestCard,
  Pill, DashButton, DashEmpty, SectionGrid,
} from '@/components/dashboard/kit';
import './StudentDashboard.css';

const SUBJECT_LABELS = {
  matematicas: 'Matemáticas',
  lengua: 'Lengua',
  ingles: 'Inglés',
  'ciencias-naturales': 'Ciencias Naturales',
  'ciencias-sociales': 'Ciencias Sociales',
  historia: 'Historia',
  'historia-espana': 'Historia de España',
  'historia-mundo': 'Historia del Mundo',
  biologia: 'Biología',
  fisica: 'Física',
  quimica: 'Química',
  musica: 'Música',
  plastica: 'Plástica',
  tecnologia: 'Tecnología',
  'ed-fisica': 'Ed. Física',
  tutoria: 'Tutoría',
  valenciano: 'Valenciano',
  frances: 'Francés',
  programacion: 'Programación',
  robotica: 'Robótica',
  ia: 'Inteligencia Artificial',
  latin: 'Latín',
  economia: 'Economía',
  filosofia: 'Filosofía',
  geografia: 'Geografía',
};

const LEVEL_LABELS = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bach.' };

// Tonos del kit que se reparten entre asignaturas (barras de "Por asignatura").
const SUBJECT_TONES = ['violet', 'emerald', 'blue', 'amber', 'pink', 'cyan', 'orange', 'indigo'];

function subjectLabel(id) {
  if (!id) return 'Sin asignatura';
  if (SUBJECT_LABELS[id]) return SUBJECT_LABELS[id];
  const s = String(id).replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function courseLabel(level, grade) {
  if (!level) return '';
  return `${grade ? `${grade}º ` : ''}${LEVEL_LABELS[level] || level}`;
}

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatHour(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Número con coma decimal (estilo es-ES) y n decimales.
function fmtNum(n, digits = 1) {
  return Number(n).toFixed(digits).replace('.', ',');
}

// Nota en formato corto: 10 → "10", 8.25 → "8,3".
function fmtNota(n) {
  const v = Number(n);
  return Number.isInteger(v) ? String(v) : fmtNum(v, 1);
}

// Una nota es mostrable solo si llega del servidor y es un número en rango.
function isShowableNota(v) {
  if (v === null || v === undefined || v === '') return false;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 11;
}

function notaTone(n) {
  return n >= 8 ? 'good' : n >= 5 ? 'ok' : 'bad';
}

function notaMessage(n) {
  return n >= 9 ? '¡Excelente!' : n >= 7 ? '¡Muy bien!' : n >= 5 ? 'Aprobado' : 'Necesitas repasar';
}

const pad2 = (n) => String(n).padStart(2, '0');
const localKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Serie de actividad de los últimos 30 días + hoy, con los días sin partidas a
// 0 (la RPC solo devuelve los días con actividad, por eso la gráfica antigua
// salía "a trozos").
function buildActivity(daily) {
  const byDay = new Map();
  for (const d of daily || []) {
    const k = String(d?.day || '').slice(0, 10);
    if (!k) continue;
    const e = byDay.get(k) || { sessions: 0, seconds: 0 };
    e.sessions += Number(d.sessions) || 0;
    e.seconds += Number(d.total_seconds) || 0;
    byDay.set(k, e);
  }
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const out = [];
  for (let i = 30; i >= 0; i -= 1) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const k = localKey(dt);
    const e = byDay.get(k);
    out.push({ label: k, date: dt, value: e?.sessions || 0, seconds: e?.seconds || 0 });
  }
  return out;
}

// Días seguidos con partidas terminando hoy (o ayer, si hoy aún no has jugado).
function streakFrom(series) {
  let i = series.length - 1;
  if (i >= 0 && !series[i].value) i -= 1;
  let n = 0;
  while (i >= 0 && series[i].value > 0) { n += 1; i -= 1; }
  return n;
}

function dueText(dueDate, completed) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const days = Math.round((startOfDay(due) - startOfDay(now)) / 86400000);
  const date = due.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  if (completed) return `Fecha límite: ${date}`;
  if (due < now) {
    if (days >= 0) return 'Venció hoy';
    return `Venció hace ${-days} día${days === -1 ? '' : 's'} · ${date}`;
  }
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  if (days <= 7) return `Vence en ${days} días · ${date}`;
  return `Fecha límite: ${date}`;
}

function dayLabel(iso) {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  const s = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MODE_META = {
  test: { label: 'Examen', cls: 'is-test' },
  practice: { label: 'Práctica', cls: 'is-practice' },
  duel: { label: 'Duelo', cls: 'is-duel' },
};
const modeMeta = (mode) => MODE_META[mode] || MODE_META.practice;

// ─── Piezas de presentación ─────────────────────────────

// Icono de app (baldosa) con alternativa si la app no tiene dibujo.
function AppTile({ appId, size = 48 }) {
  if (appId && hasAppIcon(appId)) return <AppIcon appId={appId} size={size} />;
  return (
    <span className="sd-apptile-fallback" style={{ width: size, height: size }} aria-hidden="true">
      <Gamepad2 size={Math.round(size * 0.46)} />
    </span>
  );
}

// Chip de nota /10. Si el servidor no la manda, "—" (nunca puntos disfrazados de nota).
function NotaBadge({ value, size = 'md' }) {
  if (!isShowableNota(value)) {
    return <span className={`sd-nota sd-nota--${size} is-none`} title="Nota no disponible">—</span>;
  }
  const n = Number(value);
  return (
    <span className={`sd-nota sd-nota--${size} is-${notaTone(n)}`}>
      {fmtNota(n)}<small>/10</small>
    </span>
  );
}

// ─── Historial (línea de tiempo agrupada por día) ───────
function RecentSessions({ sessions, compact = false }) {
  if (!sessions || sessions.length === 0) return null;

  const groups = [];
  for (const s of sessions) {
    const k = s.created_at ? localKey(new Date(s.created_at)) : 'sin-fecha';
    let g = groups[groups.length - 1];
    if (!g || g.key !== k) {
      g = { key: k, label: s.created_at ? dayLabel(s.created_at) : 'Sin fecha', items: [] };
      groups.push(g);
    }
    g.items.push(s);
  }

  return (
    <ol className={`sd-timeline ${compact ? 'is-compact' : ''}`}>
      {groups.map((g) => (
        <li key={g.key} className="sd-timeline__day">
          <span className="sd-timeline__date">
            <CalendarDays size={14} />{g.label}
            {!compact && (
              <em>
                {g.items.length} partida{g.items.length !== 1 ? 's' : ''} · {formatTime(g.items.reduce((a, s) => a + (Number(s.duration_seconds) || 0), 0))}
              </em>
            )}
          </span>
          <ul className="sd-timeline__items">
            {g.items.map((s, i) => {
              const mm = modeMeta(s.mode);
              const course = courseLabel(s.level, s.grade);
              return (
                <li key={`${s.created_at}-${s.app_id}-${i}`} className={`sd-tl ${mm.cls}`}>
                  <span className="sd-tl__dot" aria-hidden="true" />
                  <span className="sd-tl__icon art-host"><AppTile appId={s.app_id} size={compact ? 42 : 48} /></span>
                  <div className="sd-tl__body">
                    <strong className="sd-tl__name">{s.app_name}</strong>
                    <span className="sd-tl__meta">
                      <span className={`sd-mode ${mm.cls}`}>{mm.label}</span>
                      {course && <span>{course}{s.subject_id ? ` · ${subjectLabel(s.subject_id)}` : ''}</span>}
                    </span>
                  </div>
                  <div className="sd-tl__stats">
                    {!compact && (
                      <>
                        <span className="sd-tl__stat" title="Aciertos">
                          <Target size={13} />{s.total_questions > 0 ? `${s.correct_answers}/${s.total_questions}` : '—'}
                        </span>
                        <span className="sd-tl__stat" title="Duración"><Timer size={13} />{formatTime(s.duration_seconds)}</span>
                      </>
                    )}
                    <span className="sd-tl__time">{formatHour(s.created_at)}</span>
                  </div>
                  <NotaBadge value={s.nota} size={compact ? 'sm' : 'md'} />
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

// ─── Actividad (30 días) ─────────────────────────────────
function ActivityChart({ series }) {
  if (!series || series.length === 0) return null;
  const total = series.reduce((a, d) => a + d.value, 0);
  const activeDays = series.filter((d) => d.value > 0).length;
  const best = series.reduce((m, d) => (d.value > m.value ? d : m), series[0]);
  const fmtTip = (d) => `${d.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}: ${d.value} partida${d.value !== 1 ? 's' : ''}${d.seconds ? `, ${formatTime(d.seconds)}` : ''}`;

  return (
    <div className="sd-activity">
      <div className="sd-activity__sum">
        <span><strong>{total}</strong> partidas</span>
        <span><strong>{activeDays}</strong> días activos</span>
        {best.value > 0 && (
          <span>Mejor día: <strong>{best.value}</strong> · {best.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
        )}
      </div>
      <div className="sd-activity__chart">
        <MiniBars data={series} height={140} tone="orange" formatTip={fmtTip} />
      </div>
      <div className="sd-activity__axis">
        <span>Hace 30 días</span>
        <span>Hace 15 días</span>
        <span>Hoy</span>
      </div>
    </div>
  );
}

// ─── Por asignatura ──────────────────────────────────────
function SubjectStats({ data }) {
  if (!data || data.length === 0) return null;
  const maxPlays = Math.max(1, ...data.map((d) => d.total_plays || 0));
  return (
    <div className="sd-subjects">
      {data.map((sub, i) => (
        <MeterRow
          key={sub.subject_id}
          tone={SUBJECT_TONES[i % SUBJECT_TONES.length]}
          icon={(
            <span className="sd-subj-ico" aria-hidden="true">
              {getSubjectAccent(sub.subject_id) ? <SubjectIcon subjectId={sub.subject_id} /> : <BookOpen size={18} />}
            </span>
          )}
          label={subjectLabel(sub.subject_id)}
          value={sub.total_plays || 0}
          max={maxPlays}
          right={(
            <span className="sd-subjects__right">
              <b>{sub.total_plays}</b> · {fmtNum(sub.accuracy || 0, 1)} %
              <em>{formatTime(sub.total_time_seconds)}</em>
            </span>
          )}
        />
      ))}
    </div>
  );
}

// ─── Apps más jugadas ────────────────────────────────────
function TopApps({ apps }) {
  const top = apps.slice(0, 5);
  return (
    <div className="sd-topapps">
      {top.map((app, i) => (
        <article
          // La RPC agrupa por app + curso + asignatura: app_id solo puede repetirse.
          key={`${app.app_id}|${app.level}|${app.grade}|${app.subject_id}|${i}`}
          className={`sd-topapp art-host is-rank-${i + 1}`}
          style={{ '--d': `${i * 60}ms` }}
        >
          <span className="sd-topapp__rank">{i < 3 ? <Crown size={13} /> : null}{i + 1}</span>
          <span className="sd-topapp__icon"><AppTile appId={app.app_id} size={62} /></span>
          <strong className="sd-topapp__name">{app.app_name}</strong>
          <span className="sd-topapp__sub">
            {app.total_plays} partida{app.total_plays !== 1 ? 's' : ''}
            {app.level ? ` · ${courseLabel(app.level, app.grade)}` : ''}
          </span>
          <span className="sd-topapp__acc">
            <span className="sd-topapp__acc-track"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, (app.accuracy || 0) / 100))})` }} /></span>
            <span>{fmtNum(app.accuracy || 0, 0)} %</span>
          </span>
          <span className="sd-topapp__best">
            Mejor nota <NotaBadge value={app.best_nota} size="sm" />
          </span>
        </article>
      ))}
    </div>
  );
}

// ─── Batalla (quiz en directo) ───────────────────────────
function BattleCard({ qb, onJoin }) {
  const played = Number(qb?.total_played) || 0;
  const join = (
    <DashButton size="sm" variant="amber" icon={Zap} onClick={onJoin}>Unirme</DashButton>
  );
  if (!played) {
    return (
      <DashCard icon={Zap} title="Batalla" subtitle="Quiz en directo con tu clase" tone="amber" className="sd-battle sd-fill">
        <div className="sd-battle__empty">
          <span className="sd-battle__bolt" aria-hidden="true"><Zap size={30} /></span>
          <strong>Aún no has jugado ninguna batalla</strong>
          <p>Cuando tu profe abra una, entra con el código y compite en directo contra tu clase.</p>
          <DashButton variant="amber" icon={Zap} onClick={onJoin}>Unirme a una batalla</DashButton>
        </div>
      </DashCard>
    );
  }
  const wins = Number(qb.total_wins) || 0;
  const podium = Number(qb.total_podium) || 0;
  const acc = Number(qb.avg_accuracy) || 0;
  const avgRank = qb.avg_rank;
  return (
    <DashCard icon={Zap} title="Batalla" subtitle="Quiz en directo con tu clase" tone="amber" actions={join} className="sd-battle sd-fill">
      <div className="sd-battle__top">
        <div className="sd-battle__trophy is-gold">
          <Trophy size={22} />
          <strong>{wins}</strong>
          <span>Victorias</span>
        </div>
        <div className="sd-battle__trophy is-silver">
          <Medal size={22} />
          <strong>{podium}</strong>
          <span>Podios</span>
        </div>
        <div className="sd-battle__trophy is-plain">
          <Gamepad2 size={22} />
          <strong>{played}</strong>
          <span>Partidas</span>
        </div>
      </div>
      <div className="sd-battle__bottom">
        <ProgressRing value={acc} max={100} size={92} stroke={10} tone="amber" label={`Precisión ${acc}%`}>
          <span className="sd-battle__acc">{fmtNum(acc, 0)}<small>%</small></span>
        </ProgressRing>
        <dl className="sd-battle__list">
          <div><dt>Puesto medio</dt><dd>{avgRank != null ? `#${fmtNum(avgRank, 1)}` : '—'}</dd></div>
          <div><dt>Mejor puntuación</dt><dd>{qb.best_score != null ? Number(qb.best_score).toLocaleString('es-ES') : '—'}</dd></div>
          <div><dt>Puntuación media</dt><dd>{qb.avg_score != null ? Number(qb.avg_score).toLocaleString('es-ES') : '—'}</dd></div>
        </dl>
      </div>
      <div className="sd-battle__meters">
        <MeterRow label="Victorias" value={wins} max={played} right={`${Math.round((wins / played) * 100)} %`} tone="amber" />
        <MeterRow label="Podio (top 3)" value={podium} max={played} right={`${Math.round((podium / played) * 100)} %`} tone="violet" />
      </div>
    </DashCard>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function StudentDashboard() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [qbStats, setQbStats] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // Sincronizar tab con query param cuando cambia la URL estando ya en la página
  const location = useLocation();
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [location.search]);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [termFilter, setTermFilter] = useState('all'); // 'all' | 1 | 2 | 3
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const gamification = useGamification();
  const { duels: studentDuels, refresh: refreshDuels, lastEvent: lastDuelEvent } = useIncomingDuels(student);

  const fetchDashboard = useCallback(async () => {
    if (!student) return;
    setLoading(true);

    const [dashResult, asgResult, qbResult] = await Promise.all([
      supabase.rpc('student_get_dashboard', {
        p_student_id: student.id,
        p_group_id: student.group_id,
        p_session_token: student.session_token,
      }),
      supabase.rpc('student_get_assignments', {
        p_student_id: student.id,
        p_group_id: student.group_id,
        p_session_token: student.session_token,
      }),
      supabase.rpc('get_student_quiz_battle_stats', {
        p_student_id: student.id,
      }).then(res => res, () => ({ data: null })),
    ]);

    if (dashResult.error) {
      setError(dashResult.error.message);
    } else if (dashResult.data?.error) {
      setError(dashResult.data.error);
    } else {
      setData(dashResult.data);
    }

    if (asgResult.data?.assignments) {
      setAssignments(asgResult.data.assignments);
    }

    if (qbResult?.data && !qbResult.data?.error) {
      setQbStats(qbResult.data);
    }

    setLoading(false);
  }, [student]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Nota con desglose de duelos + batallas por evaluacion (se refresca cuando
  // llega un evento de duelo o cuando cambian las tareas).
  useEffect(() => {
    if (!student) return;
    let alive = true;
    getGradeWithDuelBonus({ studentId: student.id, sessionToken: student.session_token })
      .then(d => { if (alive) setGradeData(d); })
      .catch(() => { if (alive) setGradeData(null); });
    return () => { alive = false; };
  }, [student, lastDuelEvent?.received_at, assignments]);

  const termScoped = useMemo(() => (
    termFilter === 'all' ? assignments : assignments.filter(a => Number(a.term) === Number(termFilter))
  ), [assignments, termFilter]);

  const baseGrade = useMemo(() => {
    if (!termScoped.length) return null;
    let weightSum = 0;
    let weightedNota = 0;
    for (const a of termScoped) {
      const w = Math.max(1, Number(a.weight) || 1);
      const nota = a.best_nota != null
        ? Math.min(10, Math.max(0, Number(a.best_nota)))
        : 0;
      weightSum += w;
      weightedNota += nota * w;
    }
    if (weightSum === 0) return null;
    return Math.round((weightedNota / weightSum) * 10) / 10;
  }, [termScoped]);

  // Serie de 31 días para la gráfica de actividad y la racha del héroe.
  const activity = useMemo(() => buildActivity(data?.daily_activity), [data]);

  if (loading) {
    return (
      <div>
        <Header subtitle="Mi Panel" />
        <DashPage role="student" className="sd">
          <div className="sd-state"><BrandLoader variant="inline" /></div>
        </DashPage>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header subtitle="Mi Panel" />
        <DashPage role="student" className="sd">
          <div className="sd-state">
            <DashCard tone="rose" className="sd-state__card">
              <DashEmpty title="No se pudieron cargar los datos">{error}</DashEmpty>
            </DashCard>
          </div>
        </DashPage>
      </div>
    );
  }

  const stats = data?.stats || {};
  const apps = data?.apps_detail || [];
  const recent = data?.recent_sessions || [];
  const subjects = data?.by_subject || [];
  const studentInfo = data?.student || {};

  const pendingAssignments = assignments.filter(a => !a.completed);
  const doneAssignments = assignments.length - pendingAssignments.length;

  const hasGroup = !!student?.group_id;
  const incomingDuels = studentDuels?.incoming || [];
  const outgoingDuels = studentDuels?.outgoing || [];
  const activeDuels = incomingDuels.length + outgoingDuels.length;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3, badge: incomingDuels.length || null },
    { id: 'logros', label: 'Insignias', icon: Trophy },
    ...(hasGroup ? [
      { id: 'tasks', label: 'Tareas', icon: ClipboardList, badge: pendingAssignments.length || null },
      { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    ] : []),
    { id: 'history', label: 'Historial', icon: CalendarDays },
    { id: 'feedback', label: 'Comentarios', icon: MessagesSquare },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const groupLevel = student?.group_level;
  const groupGrade = student?.group_grade;
  const groupSubjectId = student?.group_subject_id;
  const exploreAppsPath = (groupLevel && groupGrade)
    ? (groupSubjectId
        ? `/curso/${groupLevel}/${groupGrade}/${groupSubjectId}`
        : `/curso/${groupLevel}/${groupGrade}`)
    : null;

  // ── Héroe ──
  const displayName = studentInfo.display_name || student?.display_name || '';
  const firstName = displayName.split(' ')[0];
  const groupName = student?.group_id ? (student?.group_name || studentInfo.group_name) : null;

  const lvl = gamification.level;
  const curXp = gamification.xpForCurrentLevel;
  const nextXp = gamification.xpForNextLevel;
  const maxed = !(nextXp > curXp);
  const xpIn = maxed ? 1 : Math.max(0, gamification.totalXp - curXp);
  const xpSpan = maxed ? 1 : nextXp - curXp;
  const xpLabel = maxed
    ? `Nivel ${lvl} · ¡nivel máximo!`
    : `Nivel ${lvl} · faltan ${Math.max(0, nextXp - gamification.totalXp).toLocaleString('es-ES')} XP para el ${lvl + 1}`;

  const streak = streakFrom(activity);
  const ctGrade = gradeData?.current_term_data?.final_grade;
  const heroNota = isShowableNota(ctGrade) ? fmtNum(ctGrade, 2) : '—';
  const heroNotaTone = isShowableNota(ctGrade)
    ? ({ good: 'emerald', ok: 'blue', bad: 'rose' })[notaTone(Number(ctGrade))]
    : 'slate';

  const heroLine = (() => {
    const p = pendingAssignments.length;
    const dl = activeDuels;
    const duelTxt = dl ? `${dl} duelo${dl !== 1 ? 's' : ''} en la arena` : '';
    if (hasGroup && p > 0) {
      return `Tienes ${p} misión${p !== 1 ? 'es' : ''} pendiente${p !== 1 ? 's' : ''}${dl ? ` y ${duelTxt}` : ''}. ¡A por ello!`;
    }
    if (dl) return `Tienes ${duelTxt}. ¡Demuestra lo que sabes!`;
    if (hasGroup) return '¡Todo al día! Sigue sumando XP y desbloqueando avatares.';
    return 'Práctica libre: juega, sube de nivel y desbloquea avatares.';
  })();

  const heroStats = [
    { icon: Flame, value: streak >= activity.length ? `${streak}+` : streak, label: streak === 1 ? 'Día de racha' : 'Días de racha', tone: 'orange' },
    { icon: Star, value: heroNota, label: 'Nota actual', tone: heroNotaTone },
    { icon: Trophy, value: gamification.totalEarned, label: 'Insignias', tone: 'amber' },
  ];

  // ── Resumen: misiones e insignias ──
  const nextMissions = pendingAssignments
    .slice()
    .sort((a, b) => {
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return da - db;
    })
    .slice(0, 3);
  const latestBadges = (gamification.earnedBadges || [])
    .slice()
    .sort((a, b) => (String(b.earned_at || '') > String(a.earned_at || '') ? 1 : -1))
    .slice(0, 6);

  // Sin partidas con nota (best_nota / avg_test_nota nulos) se muestra "—".
  const bestNotaOk = isShowableNota(stats.best_nota);
  const avgNotaOk = isShowableNota(stats.avg_test_nota);

  const assignmentUrl = (asg) => (
    asg.app_id && asg.level && asg.grade && asg.subject_id
      ? `/curso/${asg.level}/${asg.grade}/${asg.subject_id}/app/${asg.app_id}`
      : null
  );

  const goToArena = () => {
    setActiveTab('overview');
    // Espera a que se pinte el Resumen para llevar la vista a la arena, y
    // reajusta cuando la tarjeta de la nota (que recarga sus datos) ya ha crecido.
    const toArena = (behavior) => document.getElementById('sd-arena')?.scrollIntoView({ behavior, block: 'start' });
    setTimeout(() => toArena('smooth'), 80);
    setTimeout(() => toArena('smooth'), 700);
  };

  const tabMotion = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

  return (
    <div>
      <Header subtitle="Mi Panel" />
      <DashPage role="student" className="sd">

        {/* ── Héroe del alumno ── */}
        <DashHero
          avatar={(
            <UserAvatar
              selectedAvatarCode={student?.selected_avatar_code || studentInfo.selected_avatar_code}
              avatarEmoji={studentInfo.avatar_emoji}
              avatarColor={studentInfo.avatar_color}
              size="xl"
              shape="rounded"
              showRarityBorder
            />
          )}
          title={firstName ? `¡Hola, ${firstName}!` : '¡Hola!'}
          subtitle={heroLine}
          chips={(
            <>
              {studentInfo.username && <Pill>@{studentInfo.username}</Pill>}
              <Pill icon={groupName ? Users : Sparkles}>{groupName || 'Práctica libre'}</Pill>
              {student?.email_verified && (
                <button type="button" className="sd-hero-chipbtn" onClick={() => setActiveTab('profile')} title="Cambiar de grupo">
                  Cambiar
                </button>
              )}
            </>
          )}
          level={lvl}
          xp={xpIn}
          xpNext={xpSpan}
          xpLabel={xpLabel}
          stats={heroStats}
          mascot
          actions={(
            <>
              {exploreAppsPath && (
                <DashButton size="lg" variant="sky" icon={Compass} onClick={() => navigate(exploreAppsPath)} title="Ir a las apps de tu asignatura">
                  Explorar apps
                </DashButton>
              )}
              <DashButton size="lg" variant="amber" icon={Zap} onClick={() => navigate('/quiz-battle/join')} title="Unirse a una Batalla">
                Batalla
              </DashButton>
              <DashButton size="lg" variant="rose" icon={Swords} onClick={() => setDuelModalOpen(true)} title="Crear un duelo 1 vs 1">
                Duelo
              </DashButton>
            </>
          )}
        />

        <DashDock tabs={tabs} value={activeTab} onChange={setActiveTab} />

        {/* Aviso de duelos fuera del Resumen (la arena completa vive en Resumen) */}
        {activeTab !== 'overview' && activeDuels > 0 && (
          <button type="button" className="sd-duelbanner" onClick={goToArena}>
            <span className="sd-duelbanner__icon"><Swords size={20} /></span>
            <span className="sd-duelbanner__text">
              <strong>{activeDuels} duelo{activeDuels !== 1 ? 's' : ''} activo{activeDuels !== 1 ? 's' : ''}</strong>
              {incomingDuels.length > 0 && <span> · {incomingDuels.length} te {incomingDuels.length !== 1 ? 'esperan' : 'espera'}</span>}
            </span>
            <span className="sd-duelbanner__go">Ir a la arena <ChevronRight size={16} /></span>
          </button>
        )}

        {/* ── TAB: Resumen ── */}
        {activeTab === 'overview' && (
          <motion.div {...tabMotion} className="sd-hub">
            {/* Nota con bonificacion/deuda por duelos */}
            <div className="sd-rise" style={{ '--d': '0ms' }}>
              <DuelGradePanel refreshKey={lastDuelEvent?.received_at || 0} />
            </div>

            {/* Arena de duelos (solo si hay alguno) */}
            {activeDuels > 0 && (
              <div id="sd-arena" className="sd-rise sd-anchor" style={{ '--d': '60ms' }}>
                <DuelInbox duels={studentDuels} onChange={refreshDuels} />
              </div>
            )}

            {/* Indicadores */}
            <div className="sd-rise" style={{ '--d': '120ms' }}>
              <SectionGrid cols={4}>
                <StatTile
                  icon={Gamepad2} tone="blue" label="Partidas"
                  value={stats.total_sessions || 0}
                  sub={`${stats.practice_sessions || 0} práctica · ${stats.test_sessions || 0} examen`}
                />
                <StatTile
                  icon={Clock} tone="violet" label="Tiempo total"
                  value={formatTime(stats.total_time_seconds)}
                  sub={`Sesión más larga: ${formatTime(stats.longest_session_seconds)}`}
                />
                <StatTile
                  icon={Target} tone="emerald" label="Precisión global"
                  value={Number(stats.avg_accuracy) || 0}
                  format={(v) => `${fmtNum(v, 1)} %`}
                  sub={`${stats.total_correct || 0} de ${stats.total_questions || 0} aciertos`}
                  progress={(Number(stats.avg_accuracy) || 0) / 100}
                />
                <StatTile
                  icon={Trophy} tone="amber" label="Mejor nota"
                  value={bestNotaOk ? `${fmtNum(stats.best_nota, 1)}/10` : '—/10'}
                  sub={avgNotaOk ? `Media examen: ${fmtNum(stats.avg_test_nota, 1)}/10` : 'Media examen: —/10'}
                />
              </SectionGrid>
            </div>

            {/* Misiones + insignias */}
            <div className="sd-row sd-rise" style={{ '--d': '180ms' }}>
              {hasGroup && (
                <DashCard
                  className="sd-fill"
                  icon={ListChecks} tone="amber" title="Próximas misiones"
                  subtitle={pendingAssignments.length
                    ? `${pendingAssignments.length} por completar`
                    : 'Tareas de tu profe'}
                  actions={assignments.length > 0 && (
                    <DashButton size="sm" variant="soft" onClick={() => setActiveTab('tasks')}>
                      Ver todas <ChevronRight size={15} />
                    </DashButton>
                  )}
                >
                  {nextMissions.length > 0 ? (
                    <div className="sd-missions">
                      {nextMissions.map((asg) => {
                        const url = assignmentUrl(asg);
                        const overdue = asg.due_date && new Date(asg.due_date) < new Date() && !asg.completed;
                        return (
                          <button
                            key={asg.id}
                            type="button"
                            className={`sd-mission art-host ${overdue ? 'is-overdue' : ''}`}
                            onClick={() => (url ? navigate(url) : setActiveTab('tasks'))}
                          >
                            <AppTile appId={asg.app_id} size={46} />
                            <span className="sd-mission__text">
                              <strong>{asg.title || asg.app_name}</strong>
                              <small>
                                {overdue && <AlertTriangle size={12} />}
                                {dueText(asg.due_date, asg.completed) || asg.app_name}
                              </small>
                            </span>
                            {asg.weight > 1 && <span className="sd-weight">×{asg.weight}</span>}
                            <span className="sd-mission__go"><ChevronRight size={18} /></span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="sd-allclear">
                      <span className="sd-allclear__icon"><PartyPopper size={28} /></span>
                      <strong>{assignments.length ? '¡Misiones completadas!' : 'Sin misiones por ahora'}</strong>
                      <p>{assignments.length ? 'Has superado todas tus tareas. Puedes mejorar tu nota repitiéndolas.' : 'Cuando tu profe te asigne una tarea, aparecerá aquí.'}</p>
                    </div>
                  )}
                  {assignments.length > 0 && (
                    <div className="sd-missions__foot">
                      <span className="sd-missions__foot-text">
                        <CheckCircle2 size={15} />
                        <strong>{doneAssignments}</strong> de {assignments.length} misiones superadas
                      </span>
                      <span className="sd-missions__track"><i style={{ transform: `scaleX(${doneAssignments / assignments.length})` }} /></span>
                    </div>
                  )}
                </DashCard>
              )}

              <DashCard
                icon={Award} tone="pink" title="Insignias"
                subtitle={`${gamification.totalEarned} de ${gamification.totalAvailable || '—'} conseguidas`}
                actions={(
                  <DashButton size="sm" variant="soft" onClick={() => setActiveTab('logros')}>
                    Ver todas <ChevronRight size={15} />
                  </DashButton>
                )}
              >
                <div className="sd-badges__meter">
                  <span><i style={{ transform: `scaleX(${gamification.totalAvailable ? Math.min(1, gamification.totalEarned / gamification.totalAvailable) : 0})` }} /></span>
                </div>
                {latestBadges.length > 0 ? (
                  <div className="sd-badges">
                    {latestBadges.map((b) => (
                      <div key={b.code} className="sd-badge" title={b.description_es || b.description || ''}>
                        <BadgeIcon code={b.code} rarity={b.rarity} size={54} />
                        <span>{b.name_es || b.name || b.code}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <DashEmpty title="Aún sin insignias" mascot={false}>Juega partidas y supera retos para ganar tu primera insignia.</DashEmpty>
                )}
              </DashCard>
            </div>

            {/* Actividad + asignaturas */}
            <div className="sd-row sd-rise" style={{ '--d': '240ms' }}>
              <DashCard icon={Flame} tone="orange" title="Actividad" subtitle="Partidas de los últimos 30 días">
                {activity.some((d) => d.value > 0) ? (
                  <ActivityChart series={activity} />
                ) : (
                  <DashEmpty title="Sin partidas este mes" mascot={false}>Juega a cualquier app y tu actividad aparecerá aquí.</DashEmpty>
                )}
              </DashCard>
              <DashCard
                icon={BookOpen} tone="indigo" title="Por asignatura" subtitle="Partidas · precisión · tiempo"
                actions={subjects.length > 0 && <Pill>{subjects.length} asignatura{subjects.length !== 1 ? 's' : ''}</Pill>}
              >
                {subjects.length > 0 ? (
                  <SubjectStats data={subjects} />
                ) : (
                  <DashEmpty title="Aún no hay datos" mascot={false}>Tus asignaturas aparecerán cuando juegues.</DashEmpty>
                )}
              </DashCard>
            </div>

            {/* Top 5 apps */}
            {apps.length > 0 && (
              <div className="sd-rise" style={{ '--d': '300ms' }}>
                <DashCard icon={Crown} tone="amber" title="Tus apps más jugadas" subtitle="Tu top 5 de juegos favoritos">
                  <TopApps apps={apps} />
                </DashCard>
              </div>
            )}

            {/* Batalla + últimas partidas */}
            <div className="sd-row sd-row--alt sd-rise" style={{ '--d': '360ms' }}>
              <BattleCard qb={qbStats} onJoin={() => navigate('/quiz-battle/join')} />
              <DashCard
                icon={History} tone="cyan" title="Últimas partidas"
                actions={recent.length > 0 && (
                  <DashButton size="sm" variant="soft" onClick={() => setActiveTab('history')}>
                    Historial <ChevronRight size={15} />
                  </DashButton>
                )}
              >
                {recent.length > 0 ? (
                  <RecentSessions sessions={recent.slice(0, 5)} compact />
                ) : (
                  <DashEmpty title="Aún no has jugado" mascot={false}>Tus partidas aparecerán aquí.</DashEmpty>
                )}
              </DashCard>
            </div>
          </motion.div>
        )}

        {/* ── TAB: Tareas ── */}
        {activeTab === 'tasks' && (
          <motion.div {...tabMotion} className="sd-tasks">
            {/* Filtro por evaluacion */}
            {assignments.length > 0 && (
              <div className="sd-seg sd-seg--term" role="group" aria-label="Evaluación">
                {[
                  { id: 'all', label: 'Curso completo' },
                  { id: 1, label: '1ª Eval' },
                  { id: 2, label: '2ª Eval' },
                  { id: 3, label: '3ª Eval' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTermFilter(f.id)}
                    className={`sd-seg__btn ${termFilter === f.id ? 'is-active' : ''}`}
                    aria-pressed={termFilter === f.id}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Nota base de tareas (sin bonus) — filtrada por evaluacion o curso completo */}
            {baseGrade != null && (() => {
              const msg = notaMessage(baseGrade);
              const doneCount = termScoped.filter(a => a.completed).length;
              const header = termFilter === 'all' ? 'Nota del curso · solo tareas' : `Nota de la ${termFilter}ª evaluación · solo tareas`;
              return (
                <motion.section
                  key={termFilter}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`sd-taskgrade is-${notaTone(baseGrade)}`}
                >
                  <ProgressRing value={baseGrade} size={128} stroke={9} label={`Nota ${baseGrade}`}>
                    <span className="sd-taskgrade__num">{fmtNum(baseGrade, 1)}</span>
                    <span className="sd-taskgrade__of">/10</span>
                  </ProgressRing>
                  <div className="sd-taskgrade__text">
                    <span className="sd-taskgrade__kicker">{header}</span>
                    <strong className="sd-taskgrade__msg">{msg}</strong>
                    <span className="sd-taskgrade__sub">
                      Media ponderada de {termScoped.length} {termScoped.length === 1 ? 'tarea' : 'tareas'} · {doneCount} aprobada{doneCount !== 1 ? 's' : ''}
                    </span>
                    <span className="sd-taskgrade__bar" aria-hidden="true">
                      <i style={{ transform: `scaleX(${termScoped.length ? doneCount / termScoped.length : 0})` }} />
                    </span>
                    <span className="sd-taskgrade__note">
                      Esta es la nota de tareas sin bonus. Tu nota completa con duelos, batallas, nivel y avatares está en el panel &quot;Resumen&quot;.
                    </span>
                  </div>
                </motion.section>
              );
            })()}

            {/* Filtros */}
            {termScoped.length > 0 && (
              <div className="sd-seg" role="group" aria-label="Estado de las tareas">
                {[
                  { id: 'all', label: 'Todas', n: termScoped.length, icon: ListChecks },
                  { id: 'pending', label: 'Pendientes', n: termScoped.filter(a => !a.completed).length, icon: Target },
                  { id: 'completed', label: 'Completadas', n: termScoped.filter(a => a.completed).length, icon: CheckCircle2 },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTaskFilter(f.id)}
                    className={`sd-seg__btn ${taskFilter === f.id ? 'is-active' : ''}`}
                    aria-pressed={taskFilter === f.id}
                  >
                    <f.icon size={16} />
                    {f.label}
                    <span className="sd-seg__count">{f.n}</span>
                  </button>
                ))}
              </div>
            )}

            {termScoped.length === 0 ? (
              <DashCard tone="amber">
                <DashEmpty title={termFilter === 'all' ? 'No tienes tareas asignadas' : `No hay tareas en la ${termFilter}ª evaluación`}>
                  Cuando tu profe te asigne misiones, las verás aquí.
                </DashEmpty>
              </DashCard>
            ) : (
              <div className="sd-quests">
                {termScoped
                  .filter(asg => taskFilter === 'all' ? true : taskFilter === 'completed' ? asg.completed : !asg.completed)
                  .map((asg) => {
                    const isOverdue = asg.due_date && new Date(asg.due_date) < new Date() && !asg.completed;
                    const appUrl = assignmentUrl(asg);
                    const isDuelTask = asg.assignment_type === 'duel' || !!asg.duel_id;
                    const status = asg.completed ? 'done' : isOverdue ? 'overdue' : isDuelTask ? 'duel' : 'pending';
                    // Progreso del alumno — siempre hay una nota (0 si no intentada)
                    const nota = Number(asg.best_nota ?? asg.best_score ?? 0);
                    const tried = asg.completed || asg.attempts > 0;
                    return (
                      <div
                        key={asg.id}
                        className={`sd-quest-wrap art-host ${appUrl ? 'is-link' : ''}`}
                        onClick={() => appUrl && navigate(appUrl)}
                      >
                        <QuestCard
                          appId={asg.app_id}
                          title={asg.title || asg.app_name}
                          subtitle={asg.title ? asg.app_name : null}
                          status={status}
                          nota={tried ? nota : null}
                          due={dueText(asg.due_date, asg.completed)}
                          reward={asg.weight > 1 ? `Cuenta ×${asg.weight}` : null}
                          meta={(
                            <>
                              {asg.term && <span className="sd-quest-term">{asg.term}ª Eval</span>}
                              <span>Nota mínima: {asg.min_score}/10 en examen</span>
                            </>
                          )}
                          onPlay={appUrl ? (e) => { e.stopPropagation(); navigate(appUrl); } : undefined}
                          playLabel={asg.completed ? 'Mejorar' : asg.attempts > 0 ? 'Reintentar' : 'Jugar'}
                        >
                          {asg.description && <p className="sd-quest-desc">{asg.description}</p>}
                          <p className={`sd-quest-progress is-${asg.completed ? 'done' : asg.attempts > 0 ? 'tried' : 'new'}`}>
                            {asg.completed ? (
                              <><CheckCircle2 size={15} /> Completada — Nota: <strong>{fmtNum(nota, 1)}/10</strong></>
                            ) : asg.attempts > 0 ? (
                              <>{asg.attempts} intento{asg.attempts !== 1 ? 's' : ''} — Nota actual: <strong>{fmtNum(nota, 1)}/10</strong> <span>(necesitas {asg.min_score}/10 para superarla)</span></>
                            ) : (
                              <>Aún no has intentado esta tarea — Nota actual: <strong>0,0/10</strong></>
                            )}
                          </p>
                        </QuestCard>
                      </div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: Mensajes ── */}
        {activeTab === 'messages' && (
          <motion.div {...tabMotion}>
            <StudentChatTab />
          </motion.div>
        )}

        {/* ── TAB: Historial ── */}
        {activeTab === 'history' && (
          <motion.div {...tabMotion}>
            <DashCard
              icon={CalendarDays} tone="emerald" title="Últimas partidas"
              subtitle={recent.length ? `Tus ${recent.length} partidas más recientes` : 'Tu diario de juego'}
              actions={recent.length > 0 && (
                <div className="sd-hist-legend">
                  <span className="sd-mode is-test">Examen</span>
                  <span className="sd-mode is-practice">Práctica</span>
                </div>
              )}
            >
              {recent.length > 0 ? (
                <RecentSessions sessions={recent} />
              ) : (
                <DashEmpty
                  title="No hay partidas registradas"
                  action={exploreAppsPath && (
                    <DashButton variant="sky" icon={Compass} onClick={() => navigate(exploreAppsPath)}>Explorar apps</DashButton>
                  )}
                >
                  Cuando juegues, aquí verás cada partida con su nota.
                </DashEmpty>
              )}
            </DashCard>
          </motion.div>
        )}

        {/* ── TAB: Logros ── */}
        {activeTab === 'logros' && (
          <StudentLogrosTab gamification={gamification} />
        )}

        {/* ── TAB: Comentarios ── */}
        {activeTab === 'feedback' && (
          <motion.div {...tabMotion}>
            <MyFeedbacksSection />
          </motion.div>
        )}

        {/* ── TAB: Perfil ── */}
        {activeTab === 'profile' && (
          <StudentProfileEditor
            student={student}
            studentInfo={studentInfo}
            onProfileUpdated={fetchDashboard}
          />
        )}

      </DashPage>

      <DuelCreateModal open={duelModalOpen} onClose={() => setDuelModalOpen(false)} />
    </div>
  );
}
