import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Clock, Target, Trophy, BarChart3, TrendingUp, Star, Rocket, Play,
  Zap, Award, MessageSquare, BookOpen, CheckCircle2, ChevronRight, Sparkles, LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import Header from '@/components/layout/Header';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import BadgeIcon from '@/components/ui/BadgeIcon';
import RobotMascot from '@/components/RobotMascot';
import MyFeedbacksSection from '@/components/ui/MyFeedbacksSection';
import TeacherLogrosSection from './TeacherLogrosSection';
import BrandLoader from '@/components/ui/BrandLoader';
import {
  DashPage, DashHero, DashDock, DashCard, StatTile, ProgressRing, Pill, DashButton, DashEmpty, SectionGrid,
} from '@/components/dashboard/kit';
import materiasData from '../../../public/data/materias.json';
import './FreeUserDashboard.css';

// ─── Ayudas de presentación ────────────────────────────────────────────────

// Los nombres de app guardados en game_sessions llevan un emoji delante
// ("🛒 Supermercado Matemático"): lo separamos para usarlo como icono de reserva.
const EMOJI_PREFIX = /^[\p{Extended_Pictographic}\p{Emoji_Presentation}️‍\s]+/u;
const cleanAppName = (name = '') => String(name).replace(EMOJI_PREFIX, '').trim();
const appEmoji = (name = '') => (String(name).match(EMOJI_PREFIX)?.[0] || '').trim() || '🎮';

const LEVEL_SHORT = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bach.', ad: 'A. Diversidad' };
const courseLabel = (level, grade) => {
  if (!level) return null;
  if (level === 'ad') return LEVEL_SHORT.ad;
  return grade ? `${grade}º ${LEVEL_SHORT[level] || level}` : (LEVEL_SHORT[level] || level);
};

const subjectName = (level, grade, subjectId) => {
  if (!subjectId) return null;
  const list = materiasData?.[level]?.[String(grade)] || [];
  const found = list.find((m) => m.id === subjectId);
  if (found) return found.nombre;
  const s = String(subjectId).replace(/[-_]/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const MODE_LABEL = {
  test: 'Examen', exam: 'Examen', practice: 'Práctica', easy: 'Práctica', medium: 'Práctica', duel: 'Duelo',
};

const dayLabel = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const fmt1 = (v) => Number(v).toLocaleString('es-ES', { maximumFractionDigits: 1 });

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'logros', label: 'Mis logros', icon: Award },
  { id: 'comentarios', label: 'Comentarios', icon: MessageSquare },
];

const FreeUserDashboard = () => {
  const { user, freeUser, displayName } = useAuth();
  const navigate = useNavigate();
  const {
    totalXp, level, xpForCurrentLevel, xpForNextLevel, earnedBadges, totalEarned, totalAvailable,
    loading: gamifLoading,
  } = useGamification();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resumen');

  useEffect(() => {
    if (!user?.id) return;

    const loadStats = async () => {
      setLoading(true);

      // Obtener sesiones del usuario
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (sessions) {
        const completed = sessions.filter(s => s.completed);
        const totalTime = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        const avgScore = completed.length > 0
          ? completed.reduce((acc, s) => acc + (s.score || 0), 0) / completed.length
          : 0;

        const subjects = new Set(sessions.map(s => s.subject_id).filter(Boolean));
        const apps = new Set(sessions.map(s => s.app_id).filter(Boolean));

        setStats({
          totalSessions: sessions.length,
          completedSessions: completed.length,
          totalMinutes: Math.round(totalTime / 60),
          avgScore: avgScore.toFixed(1),
          uniqueSubjects: subjects.size,
          uniqueApps: apps.size,
        });

        setRecentSessions(sessions.slice(0, 10));
      }

      setLoading(false);
    };

    loadStats();
  }, [user?.id]);

  // ─── Derivados de presentación ───────────────────────────────────────────
  const firstName = (displayName || '').trim().split(/\s+/)[0] || '';
  // Sin datos de gamificación (cargando o error) no pintamos un "Nivel 1" engañoso.
  const gamifReady = !gamifLoading && totalAvailable > 0;
  const xpInLevel = Math.max(0, totalXp - xpForCurrentLevel);
  const xpSpan = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const xpLeft = Math.max(0, xpForNextLevel - totalXp);

  // Apps recientes (sin repetir app + curso + asignatura) para "Sigue jugando".
  const continueApps = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const s of recentSessions) {
      if (!s.app_id) continue;
      const key = [s.app_id, s.level, s.grade, s.subject_id].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        key,
        appId: s.app_id,
        name: cleanAppName(s.app_name || s.app_id),
        emoji: appEmoji(s.app_name),
        course: courseLabel(s.level, s.grade),
        subject: subjectName(s.level, s.grade, s.subject_id),
        href: s.level && s.grade && s.subject_id
          ? `/curso/${s.level}/${s.grade}/${s.subject_id}/app/${s.app_id}`
          : null,
      });
      if (out.length >= 6) break;
    }
    return out;
  }, [recentSessions]);

  const lastApp = continueApps.find((a) => a.href) || null;
  const latestBadges = (earnedBadges || []).slice(0, 6);
  const completedPct = stats && stats.totalSessions > 0 ? stats.completedSessions / stats.totalSessions : 0;

  const heroStats = [
    { icon: Zap, value: gamifReady ? Number(totalXp).toLocaleString('es-ES') : '—', label: 'XP total', tone: 'amber' },
    { icon: Trophy, value: gamifReady ? `${totalEarned}/${totalAvailable}` : '—', label: 'Insignias', tone: 'pink' },
    { icon: Gamepad2, value: stats ? stats.totalSessions : '—', label: 'Partidas', tone: 'violet' },
  ];

  return (
    <div className="fz-shell">
      <Header subtitle="Mi Zona" />
      <DashPage role="free" className="fz-page">
        <DashHero
          avatar={(
            <UserAvatar
              selectedAvatarCode={freeUser?.selected_avatar_code}
              avatarEmoji={freeUser?.avatar_emoji || '🚀'}
              avatarColor={freeUser?.avatar_color || 'from-orange-400 to-pink-500'}
              size="xl"
              shape="rounded"
            />
          )}
          title={firstName ? `¡Hola, ${firstName}!` : '¡Hola!'}
          subtitle="Tu zona de práctica libre · todo tu progreso se guarda solo"
          chips={(
            <>
              <Pill icon={Sparkles}>Cuenta libre</Pill>
              {gamifReady && <Pill icon={Rocket}>{xpLeft.toLocaleString('es-ES')} XP para el nivel {level + 1}</Pill>}
            </>
          )}
          level={gamifReady ? level : null}
          xp={gamifReady ? xpInLevel : null}
          xpNext={gamifReady ? xpSpan : null}
          xpLabel={gamifReady ? `Nivel ${level} → ${level + 1}` : undefined}
          stats={heroStats}
          actions={(
            <>
              <DashButton variant="amber" size="lg" icon={Play} onClick={() => navigate('/')}>Ir a jugar</DashButton>
              {lastApp && (
                <DashButton variant="glass" icon={Rocket} onClick={() => navigate(lastApp.href)} title={`${lastApp.name} · ${lastApp.course || ''}`}>
                  Continuar: {lastApp.name}
                </DashButton>
              )}
              <DashButton variant="glass" icon={Award} onClick={() => setTab('logros')}>Mis logros</DashButton>
            </>
          )}
        />

        <DashDock tabs={TABS} value={tab} onChange={setTab} sticky={false} />

        {tab === 'resumen' && (
          loading ? (
            <div className="fz-loading"><BrandLoader variant="inline" /></div>
          ) : (
            <motion.div
              key="resumen"
              className="fz-stack"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {stats && (
                <SectionGrid cols={3} className="fz-stats">
                  <StatTile
                    icon={Gamepad2}
                    value={stats.totalSessions}
                    label="Partidas"
                    sub={stats.totalSessions >= 50 ? 'Tus 50 más recientes' : 'Desde que empezaste'}
                    tone="blue"
                  />
                  <StatTile
                    icon={CheckCircle2}
                    value={stats.completedSessions}
                    label="Completadas"
                    sub={`${Math.round(completedPct * 100)} % de tus partidas`}
                    tone="emerald"
                    progress={completedPct}
                  />
                  <StatTile
                    icon={Clock}
                    value={stats.totalMinutes}
                    format={(v) => `${Math.round(v).toLocaleString('es-ES')} min`}
                    label="Tiempo jugando"
                    sub={stats.totalMinutes >= 60 ? `Más de ${Math.floor(stats.totalMinutes / 60)} h practicando` : 'Cada minuto cuenta'}
                    tone="violet"
                  />
                  <StatTile
                    icon={Star}
                    value={Number(stats.avgScore)}
                    format={fmt1}
                    label="Puntos de media"
                    sub="Por partida completada"
                    tone="amber"
                  />
                  <StatTile icon={BookOpen} value={stats.uniqueSubjects} label="Materias" sub="Asignaturas tocadas" tone="pink" />
                  <StatTile icon={Target} value={stats.uniqueApps} label="Apps distintas" sub="Juegos que has probado" tone="cyan" />
                </SectionGrid>
              )}

              <DashCard
                icon={Rocket}
                title="Sigue jugando"
                subtitle="Vuelve a tus últimas apps con un toque"
                tone="orange"
                actions={<DashButton variant="soft" size="sm" icon={Gamepad2} onClick={() => navigate('/')}>Explorar apps</DashButton>}
              >
                {continueApps.length === 0 ? (
                  <DashEmpty
                    title="Aún no has jugado"
                    action={<DashButton variant="amber" icon={Play} onClick={() => navigate('/')}>Elegir mi primera app</DashButton>}
                  >
                    Elige un curso y una asignatura para empezar. Tu progreso se guardará automáticamente.
                  </DashEmpty>
                ) : (
                  <div className="fz-apps">
                    {continueApps.map((a, i) => (
                      <motion.button
                        key={a.key}
                        type="button"
                        className="fz-app group"
                        disabled={!a.href}
                        onClick={() => a.href && navigate(a.href)}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.3 }}
                      >
                        <span className="fz-app__icon">
                          {hasAppIcon(a.appId)
                            ? <AppIcon appId={a.appId} size={64} />
                            : <span className="fz-app__emoji" aria-hidden="true">{a.emoji}</span>}
                        </span>
                        <span className="fz-app__name">{a.name}</span>
                        <span className="fz-app__meta">{[a.course, a.subject].filter(Boolean).join(' · ') || '—'}</span>
                        {a.href && <span className="fz-app__play"><Play size={13} fill="currentColor" /> Jugar</span>}
                      </motion.button>
                    ))}
                  </div>
                )}
              </DashCard>

              <div className="fz-split">
                <DashCard
                  icon={TrendingUp}
                  title="Actividad reciente"
                  subtitle={recentSessions.length ? `Tus últimas ${recentSessions.length} partidas` : 'Tus partidas aparecerán aquí'}
                  tone="pink"
                  padded={false}
                >
                  {recentSessions.length === 0 ? (
                    <DashEmpty title="Sin partidas todavía">Cuando juegues, verás aquí tus resultados.</DashEmpty>
                  ) : (
                    <ol className="fz-feed">
                      {recentSessions.map((s) => {
                        const mode = MODE_LABEL[s.mode];
                        const course = courseLabel(s.level, s.grade);
                        const subject = subjectName(s.level, s.grade, s.subject_id);
                        return (
                          <li key={s.id} className={`fz-feed__row${s.completed ? '' : ' is-dropped'}`}>
                            <span className="fz-feed__icon">
                              {hasAppIcon(s.app_id)
                                ? <AppIcon appId={s.app_id} size={44} />
                                : <span className="fz-feed__emoji" aria-hidden="true">{appEmoji(s.app_name)}</span>}
                            </span>
                            <span className="fz-feed__body">
                              <span className="fz-feed__title">
                                {cleanAppName(s.app_name || s.app_id)}
                                {mode && <span className={`fz-mode fz-mode--${s.mode === 'test' || s.mode === 'exam' ? 'exam' : s.mode === 'duel' ? 'duel' : 'practice'}`}>{mode}</span>}
                              </span>
                              <span className="fz-feed__meta">
                                {[subject, course, dayLabel(s.created_at)].filter(Boolean).join(' · ')}
                              </span>
                            </span>
                            <span className="fz-feed__side">
                              {s.nota != null ? (
                                <ProgressRing value={Number(s.nota)} size={46} stroke={10} label={`Nota ${fmt1(s.nota)}`}>
                                  <span className="fz-feed__nota">{fmt1(s.nota)}</span>
                                </ProgressRing>
                              ) : (
                                <span className="fz-feed__nonota" title="Sin nota">—</span>
                              )}
                              <span className="fz-feed__score">
                                <strong>{s.score != null ? Number(s.score).toLocaleString('es-ES') : '—'}</strong>
                                <small>{s.completed ? 'pts' : 'Abandonada'}</small>
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </DashCard>

                <div className="fz-side">
                  <DashCard
                    icon={Award}
                    title="Tus logros"
                    subtitle={gamifReady ? `${totalEarned} de ${totalAvailable} insignias` : 'Colección de insignias'}
                    tone="amber"
                    actions={<DashButton variant="soft" size="sm" onClick={() => setTab('logros')}>Ver todo <ChevronRight size={14} /></DashButton>}
                  >
                    <div className="fz-trophy">
                      <ProgressRing value={gamifReady ? totalEarned : 0} max={Math.max(1, totalAvailable)} size={96} stroke={10} tone="amber" label="Insignias conseguidas">
                        <span className="fz-trophy__num">{gamifReady ? `${Math.round((totalEarned / Math.max(1, totalAvailable)) * 100)}%` : '—'}</span>
                      </ProgressRing>
                      <div className="fz-trophy__text">
                        <strong>{gamifReady ? `Nivel ${level}` : 'Tu nivel'}</strong>
                        <span>{gamifReady ? `Te faltan ${xpLeft.toLocaleString('es-ES')} XP para subir` : 'Juega para ganar experiencia'}</span>
                      </div>
                    </div>
                    {latestBadges.length > 0 ? (
                      <ul className="fz-badges">
                        {latestBadges.map((b, i) => (
                          <motion.li
                            key={b.code}
                            className={`fz-badge fz-badge--${b.rarity || 'common'}`}
                            title={b.description_es || b.name_es}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 18 }}
                          >
                            <BadgeIcon code={b.code} rarity={b.rarity} size={48} earned />
                            <span>{b.name_es}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p className="fz-muted">Tus primeras insignias aparecerán aquí en cuanto completes partidas.</p>
                    )}
                  </DashCard>

                  <section className="fz-cta">
                    <div className="fz-cta__robot" aria-hidden="true"><RobotMascot quips={false} /></div>
                    <div className="fz-cta__text">
                      <h2>Sigue practicando</h2>
                      <p>Elige un curso y una asignatura para empezar a jugar. Todo tu progreso se guarda automáticamente.</p>
                      <DashButton variant="primary" icon={Play} onClick={() => navigate('/')}>Ir a jugar</DashButton>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )
        )}

        {tab === 'logros' && (
          <motion.div key="logros" className="fz-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TeacherLogrosSection />
          </motion.div>
        )}

        {tab === 'comentarios' && (
          <motion.div key="comentarios" className="fz-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <MyFeedbacksSection />
          </motion.div>
        )}

        {tab === 'resumen' && !loading && (
          <p className="fz-foot"><BarChart3 size={14} /> Las estadísticas se calculan con tus 50 partidas más recientes.</p>
        )}
      </DashPage>
    </div>
  );
};

export default FreeUserDashboard;
