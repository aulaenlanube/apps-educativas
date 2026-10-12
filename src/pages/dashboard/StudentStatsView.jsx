import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Gamepad2, Clock, Target, Trophy, CalendarDays,
  ChevronDown, TrendingUp, Zap, Medal, Crown, Activity, LayoutGrid, Hash, BarChart3, Percent,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BrandLoader from '@/components/ui/BrandLoader';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import {
  DashCard, StatTile, ProgressRing, MiniBars, MeterRow, SectionGrid, DashButton, DashEmpty, Pill,
} from '@/components/dashboard/kit';
import materiasData from '/public/data/materias.json';

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

const LEVEL_SHORT = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bach.' };

// Clave estable por app: la RPC agrupa por app + curso + asignatura, así que el
// mismo app_id puede repetirse (p. ej. Rosco en Lengua y en Inglés).
const appKey = (app, idx) => [app.app_id, app.level, app.grade, app.subject_id, idx].join('|');

// "3º ESO · Lengua" (curso y asignatura en que se jugó; distingue apps repetidas)
const appCourse = (app) => {
  const lvl = LEVEL_SHORT[app.level];
  const course = (lvl || app.grade) ? [app.grade ? `${app.grade}º` : '', lvl || ''].join(' ').trim() : '';
  const subject = app.subject_id
    ? (materiasData?.[app.level]?.[app.grade]?.find((m) => m.id === app.subject_id)?.nombre || app.subject_id)
    : '';
  return [course, subject].filter(Boolean).join(' · ') || null;
};

// Quita el emoji inicial del nombre cuando ya se pinta el icono de la app
const cleanName = (appId, name) => (
  appId && hasAppIcon(appId) ? String(name || '').replace(/^[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\s]+/u, '') || name : name
);

// Color por nota /10 (verde ≥8, azul ≥5, rojo <5)
const gradeTone = (g) => (g == null ? 'slate' : g >= 8 ? 'good' : g >= 5 ? 'ok' : 'bad');
const gradeClass = (g) => (g == null ? 'is-empty' : g >= 8 ? 'tdb-g--good' : g >= 5 ? 'tdb-g--ok' : 'tdb-g--bad');
const fmtGrade = (g) => Number(g).toFixed(1).replace('.', ',');

function AppGlyph({ appId, size = 40 }) {
  if (appId && hasAppIcon(appId)) return <AppIcon appId={appId} size={size} />;
  return <span className="tdb-session__ico" style={{ width: size, height: size }}><Gamepad2 size={Math.round(size / 2)} /></span>;
}

export default function StudentStatsView({ studentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [qbStats, setQbStats] = useState(null);
  const [gradeStats, setGradeStats] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, qbRes, gradesRes] = await Promise.all([
          supabase.rpc('teacher_get_student_stats', { p_student_id: studentId }),
          supabase.rpc('get_student_quiz_battle_stats', { p_student_id: studentId }).then(
            (res) => res,
            () => ({ data: null })
          ),
          supabase.rpc('teacher_get_student_term_grades', { p_student_id: studentId }).then(
            (res) => res,
            () => ({ data: null })
          ),
        ]);
        if (statsRes.error) {
          console.error('teacher_get_student_stats error:', statsRes.error);
        } else if (statsRes.data && !statsRes.data.error) {
          setData(statsRes.data);
        }
        if (qbRes.data && !qbRes.data.error) setQbStats(qbRes.data);
        if (gradesRes.data && !gradesRes.data.error) setGradeStats(gradesRes.data);
      } catch (err) {
        console.error('Error fetching student stats:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="tdb-slot">
        <div className="tdb-loading"><BrandLoader variant="inline" /></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="tdb-slot">
        <DashEmpty
          title="No se pudieron cargar los datos"
          action={<DashButton variant="soft" icon={ArrowLeft} onClick={onBack}>Volver</DashButton>}
        />
      </div>
    );
  }

  const { student, stats, apps_detail: apps, recent_sessions: recent } = data;

  const signed = n => (n > 0 ? '+' : '−') + Math.abs(n).toFixed(2).replace('.', ',');
  const finalGrade = gradeStats && gradeStats.total_assignments > 0 ? gradeStats.final_grade : null;

  // Rendimiento de las últimas partidas (de la más antigua a la más reciente)
  const recentPerf = (recent || []).slice().reverse().map((r, i) => {
    const pct = r.total_questions > 0
      ? Math.round((r.correct_answers / r.total_questions) * 100)
      : r.max_score > 0 ? Math.round((r.score / r.max_score) * 100) : 0;
    return { label: `${i}`, value: pct, name: r.app_name, mode: r.mode, date: r.created_at };
  });
  const topApps = (apps || []).slice(0, 6);
  const maxPlays = Math.max(1, ...topApps.map(a => a.total_plays || 0));

  return (
    <div className="tdb-stack">
      {/* Cabecera del informe */}
      <section className="tdb-report-hero">
        <DashButton variant="glass" size="sm" icon={ArrowLeft} onClick={onBack} className="tdb-report-hero__back">
          Volver
        </DashButton>
        <div className="tdb-report-hero__ava">
          <UserAvatar
            selectedAvatarCode={student.selected_avatar_code}
            avatarEmoji={student.avatar_emoji || '🎓'}
            avatarColor={student.avatar_color}
            size="lg"
          />
        </div>
        <div className="tdb-report-hero__text">
          <p className="tdb-report-hero__kicker">Informe del alumno</p>
          <h2 className="tdb-report-hero__name">{student.display_name}</h2>
          <div className="tdb-report-hero__chips">
            <Pill>@{student.username}</Pill>
            {student.group_name && <Pill icon={Hash}>{student.group_name}</Pill>}
            <Pill icon={CalendarDays}>{stats.days_active || 0} días activo</Pill>
          </div>
        </div>
        {finalGrade != null && (
          <div className="tdb-report-hero__grade">
            <ProgressRing value={Number(finalGrade)} size={104} stroke={9} label={`Nota final ${fmtGrade(finalGrade)}`}>
              <span className="tdb-bignum">{fmtGrade(finalGrade)}</span>
            </ProgressRing>
            <span className="tdb-report-hero__grade-label">Nota final</span>
          </div>
        )}
      </section>

      {/* Indicadores */}
      <SectionGrid cols={4}>
        <StatTile icon={Gamepad2} label="Partidas" value={stats.total_sessions || 0}
          sub={`${stats.practice_sessions || 0} prác. · ${stats.test_sessions || 0} exam.`} tone="blue" />
        <StatTile icon={Clock} label="Tiempo" value={formatTime(stats.total_time_seconds)}
          sub={`${stats.days_active || 0} días activo`} tone="violet" />
        <StatTile icon={Target} label="Precisión" value={Number(stats.avg_accuracy) || 0}
          format={(v) => `${Math.round(v)} %`}
          sub={`${stats.total_correct || 0}/${stats.total_questions || 0} aciertos`} tone="emerald"
          progress={(Number(stats.avg_accuracy) || 0) / 100} />
        <StatTile icon={Trophy} label="Mejor puntuación" value={Number(stats.best_score) || 0}
          sub={`Media examen: ${stats.avg_test_score || 0}`} tone="amber" />
      </SectionGrid>

      {/* Notas por evaluacion */}
      {gradeStats && gradeStats.total_assignments > 0 && (
        <DashCard icon={TrendingUp} title="Notas de las tareas" subtitle="Base de tareas · 0,9 + bonus de duelos, batallas, nivel y avatares" tone="pink">
          <div className="tdb-terms">
            {[1, 2, 3].map(t => {
              const tStats = gradeStats.terms?.find(x => x.term === t);
              const grade = tStats?.final_grade;
              const battleBonus = Number(tStats?.battle_bonus) || 0;
              const duelBonus = Number(tStats?.duel_bonus) || 0;
              const progressBonus = Number(tStats?.progress_bonus ?? gradeStats.progress_bonus) || 0;
              const avatarBonus = Number(tStats?.avatar_bonus) || 0;
              return (
                <div key={t} className="tdb-term">
                  <span className="tdb-term__label">{t}ª Evaluación</span>
                  <ProgressRing value={grade != null ? Number(grade) : 0} size={76} stroke={9} tone={gradeTone(grade)}>
                    <span className={`tdb-term__num ${gradeClass(grade)}`}>
                      {grade != null ? fmtGrade(grade) : '—'}
                    </span>
                  </ProgressRing>
                  <span className="tdb-term__sub">
                    {tStats ? `${tStats.completed}/${tStats.total} aprobadas` : 'Sin tareas'}
                  </span>
                  <div className="tdb-term__bonus">
                    {duelBonus !== 0 && (
                      <span className={`tdb-chip ${duelBonus > 0 ? 'tdb-chip--good' : 'tdb-chip--bad'}`}>{signed(duelBonus)} duelos</span>
                    )}
                    {battleBonus > 0 && (
                      <span className="tdb-chip tdb-chip--warn">+{battleBonus.toFixed(2).replace('.', ',')} batallas</span>
                    )}
                    {progressBonus > 0 && (
                      <span className="tdb-chip tdb-chip--blue">+{progressBonus.toFixed(2).replace('.', ',')} nivel</span>
                    )}
                    {avatarBonus > 0 && (
                      <span className="tdb-chip tdb-chip--violet">+{avatarBonus.toFixed(2).replace('.', ',')} avatares</span>
                    )}
                  </div>
                </div>
              );
            })}
            {(() => {
              const g = gradeStats.final_grade;
              const battleTotal = Number(gradeStats.battle_bonus_total) || 0;
              const duelTotal = Number(gradeStats.duel_bonus_total) || 0;
              const progressTotal = Number(gradeStats.progress_bonus) || 0;
              const avatarTotal = Number(gradeStats.avatar_bonus) || 0;
              return (
                <div className="tdb-term tdb-term--final">
                  <span className="tdb-term__label">Nota final</span>
                  <ProgressRing value={g != null ? Number(g) : 0} size={76} stroke={9} tone={gradeTone(g)}>
                    <span className={`tdb-term__num ${gradeClass(g)}`}>
                      {g != null ? fmtGrade(g) : '—'}
                    </span>
                  </ProgressRing>
                  <span className="tdb-term__sub">
                    {gradeStats.completed_assignments}/{gradeStats.total_assignments} aprobadas
                  </span>
                  <div className="tdb-term__bonus">
                    {duelTotal !== 0 && (
                      <span className={`tdb-chip ${duelTotal > 0 ? 'tdb-chip--good' : 'tdb-chip--bad'}`}>{signed(duelTotal)} duelos</span>
                    )}
                    {battleTotal > 0 && (
                      <span className="tdb-chip tdb-chip--warn">+{battleTotal.toFixed(2).replace('.', ',')} batallas</span>
                    )}
                    {progressTotal > 0 && (
                      <span className="tdb-chip tdb-chip--blue">
                        +{progressTotal.toFixed(2).replace('.', ',')} nivel {gradeStats.level ? `(${gradeStats.level})` : ''}
                      </span>
                    )}
                    {avatarTotal > 0 && (
                      <span className="tdb-chip tdb-chip--violet">+{avatarTotal.toFixed(2).replace('.', ',')} avatares</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </DashCard>
      )}

      {/* Rendimiento reciente + reparto por app */}
      {((recent && recent.length > 0) || topApps.length > 0) && (
        <SectionGrid cols={2}>
          {recent && recent.length > 0 && (
            <DashCard icon={Activity} title="Rendimiento reciente" subtitle={`% de aciertos en las últimas ${recent.length} partidas`} tone="emerald">
              <MiniBars
                data={recentPerf}
                tone="emerald"
                height={170}
                formatTip={(d) => `${d.name} · ${d.mode === 'test' ? 'Examen' : 'Práctica'} · ${d.value} % · ${formatDateTime(d.date)}`}
              />
              <div className="tdb-perf-legend">
                <span><b>{Math.round(recentPerf.reduce((a, d) => a + d.value, 0) / Math.max(1, recentPerf.length))} %</b> media</span>
                <span><b>{Math.max(0, ...recentPerf.map(d => d.value))} %</b> mejor</span>
                <span><b>{recentPerf.filter(d => d.mode === 'test').length}</b> de examen</span>
                <span className="tdb-perf-legend__axis">← más antiguas · más recientes →</span>
              </div>
            </DashCard>
          )}
          {topApps.length > 0 && (
            <DashCard icon={BarChart3} title="Apps más jugadas" subtitle="Partidas · precisión" tone="indigo">
              {topApps.map((app, idx) => (
                <MeterRow
                  key={appKey(app, idx)}
                  icon={<AppGlyph appId={app.app_id} size={24} />}
                  label={<span className="tdb-ellipsis" title={app.app_name}>{cleanName(app.app_id, app.app_name)}</span>}
                  value={app.total_plays || 0}
                  max={maxPlays}
                  right={`${app.total_plays} · ${app.accuracy}%`}
                  tone={['violet', 'blue', 'emerald', 'amber', 'pink', 'cyan'][idx % 6]}
                />
              ))}
            </DashCard>
          )}
        </SectionGrid>
      )}

      {/* Batalla stats */}
      {qbStats && qbStats.total_played > 0 && (
        <DashCard icon={Zap} title="Batallas en directo" subtitle="Quiz Battle del grupo" tone="amber">
          <div className="tdb-qb">
            {[
              { icon: Gamepad2, label: 'Partidas', value: qbStats.total_played },
              { icon: Crown, label: 'Victorias', value: qbStats.total_wins },
              { icon: Medal, label: 'Podio (Top 3)', value: qbStats.total_podium },
              { icon: Percent, label: 'Precisión', value: `${qbStats.avg_accuracy}%` },
              { icon: Trophy, label: 'Mejor punt.', value: qbStats.best_score },
              { icon: BarChart3, label: 'Media punt.', value: qbStats.avg_score },
              { icon: Hash, label: 'Puesto medio', value: `#${qbStats.avg_rank}` },
              { icon: Target, label: 'Aciertos', value: `${qbStats.total_correct}/${qbStats.total_questions}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="tdb-qb__item">
                <span className="tdb-qb__icon"><Icon size={17} /></span>
                <span className="tdb-qb__text">
                  <span className="tdb-qb__value">{value}</span>
                  <span className="tdb-qb__label">{label}</span>
                </span>
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {/* Apps detail */}
      {apps && apps.length > 0 && (
        <DashCard icon={LayoutGrid} title={`Apps (${apps.length})`} subtitle="Pulsa una app para ver más detalle" tone="blue">
          <div className="tdb-apps">
            {apps.map((app, idx) => {
              const key = appKey(app, idx);
              const open = expandedApp === key;
              const course = appCourse(app);
              const accTone = app.accuracy >= 80 ? '#10b981' : app.accuracy >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <button
                  key={key}
                  type="button"
                  className={`tdb-app group ${open ? 'is-open' : ''}`}
                  onClick={() => setExpandedApp(open ? null : key)}
                  aria-expanded={open}
                >
                  <span className="tdb-app__top">
                    <AppGlyph appId={app.app_id} size={44} />
                    <span className="tdb-app__name">
                      <strong>{cleanName(app.app_id, app.app_name)}</strong>
                      {course && <span>{course}</span>}
                      <span>{app.total_plays} partidas ({app.test_plays} exam.)</span>
                    </span>
                    <ChevronDown size={18} className="tdb-app__chev" />
                  </span>
                  <span className="tdb-app__acc" style={{ '--st': accTone }}>
                    <span className="tdb-track"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, (Number(app.accuracy) || 0) / 100))})` }} /></span>
                    <span style={{ color: accTone }}>{app.accuracy}%</span>
                  </span>
                  <span className="tdb-app__metrics">
                    <span className="tdb-app__metric"><b>{app.best_score}</b><small>Mejor</small></span>
                    <span className="tdb-app__metric"><b>{app.avg_test_score}</b><small>Media ex.</small></span>
                    <span className="tdb-app__metric"><b>{formatTime(app.total_time_seconds)}</b><small>Tiempo</small></span>
                  </span>
                  {open && (
                    <span className="tdb-app__more">
                      <span><small>Media práctica</small><b>{app.avg_score}</b></span>
                      <span><small>Mejor exam.</small><b>{app.best_test_score}</b></span>
                      <span><small>Última partida</small><b>{formatDateTime(app.last_played)}</b></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DashCard>
      )}

      {/* Recent sessions */}
      {recent && recent.length > 0 && (
        <DashCard icon={CalendarDays} title="Últimas partidas" tone="emerald">
          <div className="tdb-sessions">
            {recent.map((s, i) => (
              <div key={i} className="tdb-session">
                <AppGlyph appId={s.app_id} size={36} />
                <span className="tdb-session__app">
                  {cleanName(s.app_id, s.app_name)}{' '}
                  <span className={`tdb-chip ${s.mode === 'test' ? 'tdb-chip--violet' : 'tdb-chip--blue'}`} style={{ marginLeft: 6 }}>
                    {s.mode === 'test' ? 'Examen' : 'Practica'}
                  </span>
                </span>
                <span className="tdb-session__score">{s.score}{s.max_score > 0 ? `/${s.max_score}` : ''}</span>
                <span className="tdb-session__hits">
                  {s.total_questions > 0 ? `${s.correct_answers}/${s.total_questions}` : '-'}
                </span>
                <span className="tdb-session__date">{formatDateTime(s.created_at)}</span>
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {(!apps || apps.length === 0) && (!recent || recent.length === 0) && (
        <div className="tdb-slot">
          <DashEmpty title="Sin actividad todavía">
            Este alumno aún no tiene actividad registrada.
          </DashEmpty>
        </div>
      )}
    </div>
  );
}
