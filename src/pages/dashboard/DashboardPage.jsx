import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Copy, Users, Trophy, MessageCircle, Zap, Compass, UserCircle, Swords, Hash, School, Award,
  KeyRound, ClipboardList, Target, BookOpen, CalendarDays, Crown, GraduationCap, CheckCircle2,
  MessageSquare, Rocket, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useGamification } from '@/hooks/useGamification';
import Header from '@/components/layout/Header';
import UserAvatar from '@/components/ui/UserAvatar';
import SubjectIcon from '@/components/SubjectIcon';
import {
  DashPage, DashHero, DashDock, DashCard, StatTile, SectionGrid, Pill, DashButton,
} from '@/components/dashboard/kit';
import GroupsPanel, { groupCourseLabel, groupSubjectName, groupTermLabel, groupAccent } from './GroupsPanel';
import StudentsPanel from './StudentsPanel';
import StudentStatsView from './StudentStatsView';
import AssignmentsPanel from './AssignmentsPanel';
import GroupChatPanel from './GroupChatPanel';
import CoTeachersSection from './CoTeachersSection';
import GroupMatchesPanel from './GroupMatchesPanel';
import MyFeedbacksSection from '@/components/ui/MyFeedbacksSection';
import TeacherLogrosSection from './TeacherLogrosSection';
import TeacherProfileSection from './TeacherProfileSection';
import TeacherDuelInbox from '@/components/duel/TeacherDuelInbox';
import TeacherDuelCreateModal from '@/components/duel/TeacherDuelCreateModal';
import QuizTemplatesPanel from '@/apps/quiz-battle/QuizTemplatesPanel';
import OposicionesIAPromo from '@/components/ads/OposicionesIAPromo';
import BrandLoader from '@/components/ui/BrandLoader';
import './TeacherDashboard.css';

const VALID_TABS = ['grupos', 'logros', 'plantillas', 'comentarios', 'perfil'];

// Pestañas del dock (mismos ids que VALID_TABS / ?tab=)
const DOCK_TABS = [
  { id: 'grupos', label: 'Grupos', icon: Users },
  { id: 'logros', label: 'Mis logros', icon: Trophy },
  { id: 'plantillas', label: 'Batallas', icon: Zap },
  { id: 'comentarios', label: 'Comentarios', icon: MessageCircle },
  { id: 'perfil', label: 'Mi perfil', icon: UserCircle },
];

const MAX_STUDENTS = 30;
const fmtPct = (v) => `${Math.round(v)} %`;

const DashboardPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  // Resumen de tareas que publica AssignmentsPanel (solo presentación: KPIs)
  const [asgSummary, setAsgSummary] = useState(null);

  const initialTab = (() => {
    const t = searchParams.get('tab');
    return VALID_TABS.includes(t) ? t : 'grupos';
  })();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [duelInboxOpen, setDuelInboxOpen] = useState(false);
  const [duelCreateOpen, setDuelCreateOpen] = useState(false);

  // Nivel / XP / insignias del docente para el héroe (misma fuente que el menú de usuario)
  const { level, totalXp, xpForCurrentLevel, xpForNextLevel, totalEarned } = useGamification();
  const hasGamification = totalXp > 0 || level > 1;

  // Si la URL cambia (p.ej. desde el menú navegando a ?tab=perfil estando ya
  // en /dashboard), sincroniza la pestaña activa.
  useEffect(() => {
    const t = new URLSearchParams(location.search).get('tab');
    if (t && VALID_TABS.includes(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (next) => {
    setActiveTab(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'grupos') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    const { data } = await supabase.rpc('get_teacher_groups');

    if (Array.isArray(data)) {
      setGroups(data);
    }
    setLoadingGroups(false);
  }, []);

  const fetchStudents = useCallback(async (groupId) => {
    if (!groupId) { setStudents([]); return; }
    setLoadingStudents(true);
    const { data } = await supabase.rpc('get_group_students', {
      p_group_id: groupId,
    });
    setStudents(Array.isArray(data) ? data : []);
    setLoadingStudents(false);
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // Al abrir el informe de un alumno, lleva la vista a la cabecera del grupo
  // (el informe sustituye al roster y si no quedaría fuera de pantalla).
  useEffect(() => {
    if (!viewingStudentId) return;
    const el = document.getElementById('tdb-ws');
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [viewingStudentId]);
  useEffect(() => {
    fetchStudents(selectedGroupId);
    setViewingStudentId(null);
  }, [selectedGroupId, fetchStudents]);

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  const handleCopyGroupCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast({ title: 'Codigo de grupo copiado', description: code });
  };

  const handleExploreApps = () => {
    if (selectedGroup?.level && selectedGroup?.grade) {
      const path = selectedGroup.subject_id
        ? `/curso/${selectedGroup.level}/${selectedGroup.grade}/${selectedGroup.subject_id}`
        : `/curso/${selectedGroup.level}/${selectedGroup.grade}`;
      navigate(path);
    } else {
      navigate('/');
    }
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const isOwner = selectedGroup?.is_owner !== false;

  // ── Datos derivados SOLO de lo ya cargado (sin RPCs nuevas) ──
  const totalStudents = groups.reduce((acc, g) => acc + (Number(g.student_count) || 0), 0);
  const pendingStudents = students.filter(s => s.password_hash === null);
  const activeAccounts = students.length - pendingStudents.length;
  const firstName = (teacher?.display_name || '').trim().split(/\s+/)[0] || 'docente';
  const xpInLevel = Math.max(0, totalXp - xpForCurrentLevel);
  const xpLevelSpan = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const participation = asgSummary && asgSummary.targetSum > 0
    ? (asgSummary.completedSum / asgSummary.targetSum) * 100
    : null;

  const heroStats = [
    { icon: School, value: groups.length, label: groups.length === 1 ? 'Grupo' : 'Grupos', tone: 'blue' },
    { icon: Users, value: totalStudents, label: 'Alumnos', tone: 'emerald' },
    ...(hasGamification ? [{ icon: Award, value: totalEarned, label: 'Insignias', tone: 'amber' }] : []),
  ];

  return (
    <div>
      <Header subtitle="Panel del Docente" />

      <DashPage role="teacher" className="tdb">
        <DashHero
          avatar={(
            <UserAvatar
              selectedAvatarCode={teacher?.selected_avatar_code}
              avatarEmoji={teacher?.avatar_emoji || '🎓'}
              avatarColor={teacher?.avatar_color}
              size="xl"
              fallbackInitial={firstName[0]}
            />
          )}
          title={`¡Hola, ${firstName}!`}
          subtitle={teacher?.center_name || 'Tu centro de mando del aula'}
          chips={(
            <>
              {teacher?.teacher_code && (
                <button type="button" className="dk-pill tdb-hero-code" onClick={handleCopyCode} title="Copiar código de docente">
                  <Hash size={13} /> <code>{teacher.teacher_code}</code> <Copy size={12} />
                </button>
              )}
              {teacher?.specialty && <Pill icon={BookOpen}>{teacher.specialty}</Pill>}
            </>
          )}
          level={hasGamification ? level : null}
          xp={hasGamification ? xpInLevel : null}
          xpNext={hasGamification ? xpLevelSpan : null}
          xpLabel={hasGamification ? `Nivel ${level} · ${Number(totalXp).toLocaleString('es-ES')} XP en total` : undefined}
          stats={heroStats}
          mascot
          mascotContext="subjects"
          actions={(
            <>
              <DashButton
                variant="sky"
                icon={Compass}
                onClick={handleExploreApps}
                title={selectedGroup ? `Apps de ${selectedGroup.name || 'tu grupo'}` : 'Elegir curso'}
              >
                <span className="tdb-hbtn"><small>{selectedGroup ? 'Del grupo seleccionado' : 'Elige curso'}</small>Explorar apps</span>
              </DashButton>
              <DashButton variant="amber" icon={Zap} onClick={() => navigate('/quiz-battle/host')}>
                <span className="tdb-hbtn"><small>En directo</small>Iniciar batalla</span>
              </DashButton>
              <DashButton variant="rose" icon={Swords} onClick={() => setDuelInboxOpen(true)} title="Retar a un alumno a un duelo amistoso">
                <span className="tdb-hbtn"><small>Reta a un alumno</small>Duelo</span>
              </DashButton>
            </>
          )}
        />

        <OposicionesIAPromo source="dashboard" />

        <DashDock tabs={DOCK_TABS} value={activeTab} onChange={handleTabChange} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="tdb-stack"
          >
            {activeTab === 'grupos' && (
              <>
                {/* Mis grupos: tarjetas */}
                {loadingGroups ? (
                  <DashCard icon={School} title="Mis grupos" tone="blue">
                    <div className="tdb-loading"><BrandLoader variant="inline" /></div>
                  </DashCard>
                ) : (
                  <GroupsPanel
                    groups={groups}
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={setSelectedGroupId}
                    onGroupsChanged={fetchGroups}
                  />
                )}

                {/* Sin grupo seleccionado: invitación a elegir uno */}
                {!selectedGroupId && !loadingGroups && groups.length > 0 && (
                  <div className="tdb-slot">
                    <StudentsPanel
                      students={students}
                      groupId={selectedGroupId}
                      groupName={selectedGroup?.name}
                      groupCode={selectedGroup?.group_code}
                      onStudentsChanged={() => { fetchStudents(selectedGroupId); fetchGroups(); }}
                      onViewStats={(studentId) => setViewingStudentId(studentId)}
                    />
                  </div>
                )}

                {selectedGroupId && (
                  <GroupWorkspaceHead
                    group={selectedGroup}
                    index={groups.findIndex(g => g.id === selectedGroupId)}
                    onCopyCode={handleCopyGroupCode}
                  />
                )}

                {/* Informe de un alumno */}
                {selectedGroupId && viewingStudentId && (
                  <StudentStatsView
                    studentId={viewingStudentId}
                    onBack={() => setViewingStudentId(null)}
                  />
                )}

                {selectedGroupId && !viewingStudentId && (
                  <>
                    {/* KPIs del grupo */}
                    <SectionGrid cols={4}>
                      <StatTile
                        icon={Users}
                        value={loadingStudents ? '—' : students.length}
                        label="Alumnos"
                        sub={`de ${MAX_STUDENTS} plazas del grupo`}
                        tone="blue"
                        progress={loadingStudents ? null : students.length / MAX_STUDENTS}
                      />
                      <StatTile
                        icon={KeyRound}
                        value={loadingStudents ? '—' : activeAccounts}
                        label="Cuentas activadas"
                        sub={loadingStudents ? '' : pendingStudents.length > 0
                          ? `${pendingStudents.length} sin contraseña todavía`
                          : students.length > 0 ? 'Todo el grupo ha entrado' : 'Aún no hay alumnos'}
                        tone="emerald"
                        progress={!loadingStudents && students.length > 0 ? activeAccounts / students.length : null}
                      />
                      <StatTile
                        icon={ClipboardList}
                        value={asgSummary ? asgSummary.active : '—'}
                        label="Tareas activas"
                        sub={asgSummary ? `${asgSummary.overdue} vencidas · ${asgSummary.total} en total` : 'Cargando tareas…'}
                        tone="amber"
                      />
                      <StatTile
                        icon={Target}
                        value={participation != null ? participation : '—'}
                        format={fmtPct}
                        label="Tareas superadas"
                        sub={asgSummary && asgSummary.targetSum > 0
                          ? `${asgSummary.completedSum} de ${asgSummary.targetSum} entregas con la nota mínima`
                          : 'Sin entregas que medir'}
                        tone="violet"
                        progress={participation != null ? participation / 100 : null}
                      />
                    </SectionGrid>

                    {/* Alumnado + profesores / acceso */}
                    <div className="tdb-ws-main">
                      {loadingStudents ? (
                        <DashCard icon={Users} title={`Alumnos de ${selectedGroup?.name || ''}`} tone="blue">
                          <div className="tdb-loading"><BrandLoader variant="inline" /></div>
                        </DashCard>
                      ) : (
                        <StudentsPanel
                          students={students}
                          groupId={selectedGroupId}
                          groupName={selectedGroup?.name}
                          groupCode={selectedGroup?.group_code}
                          onStudentsChanged={() => { fetchStudents(selectedGroupId); fetchGroups(); }}
                          onViewStats={(studentId) => setViewingStudentId(studentId)}
                        />
                      )}

                      <div className="tdb-side">
                        <CoTeachersSection
                          groupId={selectedGroupId}
                          groupName={selectedGroup?.name}
                          isOwner={isOwner}
                          ownerName={selectedGroup?.owner_name}
                          coTeachers={selectedGroup?.co_teachers}
                          onChanged={fetchGroups}
                        />
                        <AccessCard
                          groupCode={selectedGroup?.group_code}
                          pending={pendingStudents}
                          total={students.length}
                          loading={loadingStudents}
                          onCopy={handleCopyGroupCode}
                        />
                        <ShortcutsCard
                          tasks={asgSummary?.total}
                          onExplore={handleExploreApps}
                        />
                      </div>
                    </div>

                    {/* Tareas asignadas */}
                    <div id="tdb-tareas" className="tdb-anchor">
                    <AssignmentsPanel
                      groupId={selectedGroupId}
                      groupName={selectedGroup?.name}
                      groupLevel={selectedGroup?.level}
                      groupGrade={selectedGroup?.grade}
                      groupSubject={selectedGroup?.subject_id}
                      students={students}
                      onSummary={setAsgSummary}
                    />
                    </div>

                    {/* Chat del grupo */}
                    <div id="tdb-chat" className="tdb-anchor">
                      <GroupChatPanel
                        groupId={selectedGroupId}
                        groupName={selectedGroup?.name}
                      />
                    </div>

                    {/* Duelos y batallas del grupo (moderación) */}
                    <div id="tdb-arena" className="tdb-anchor">
                      <GroupMatchesPanel groupId={selectedGroupId} groupName={selectedGroup?.name} />
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'logros' && <TeacherLogrosSection />}

            {activeTab === 'plantillas' && <QuizTemplatesPanel />}

            {activeTab === 'comentarios' && <MyFeedbacksSection />}

            {activeTab === 'perfil' && (
              <div className="max-w-4xl mx-auto w-full">
                <TeacherProfileSection />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DashPage>

      <TeacherDuelInbox
        open={duelInboxOpen}
        onClose={() => setDuelInboxOpen(false)}
        onCreateClick={() => setDuelCreateOpen(true)}
      />
      <TeacherDuelCreateModal
        open={duelCreateOpen}
        onClose={() => setDuelCreateOpen(false)}
        onCreated={() => {
          toast({
            title: 'Reto enviado',
            description: 'El alumno lo verá en su bandeja de duelos.',
          });
          setDuelCreateOpen(false);
          setDuelInboxOpen(true);
        }}
      />
    </div>
  );
};

// Cabecera del espacio del grupo seleccionado (presentación).
function GroupWorkspaceHead({ group, index = 0, onCopyCode }) {
  if (!group) return null;
  const subjectName = groupSubjectName(group);
  const course = groupCourseLabel(group);
  return (
    <div id="tdb-ws" className="tdb-ws-head tdb-anchor" style={{ '--acc': groupAccent(group, Math.max(0, index)) }}>
      <span className="tdb-ws-head__mark">
        {group.subject_id ? <SubjectIcon subjectId={group.subject_id} /> : <School size={26} color="var(--acc)" />}
      </span>
      <div className="tdb-ws-head__text">
        <p className="tdb-ws-head__kicker">{[course, subjectName].filter(Boolean).join(' · ') || 'Grupo seleccionado'}</p>
        <h2 className="tdb-ws-head__title">{group.name}</h2>
      </div>
      <div className="tdb-ws-head__chips">
        <span className="tdb-chip tdb-chip--term"><CalendarDays size={12} /> {groupTermLabel(group)}</span>
        {group.is_owner === false
          ? <span className="tdb-chip tdb-chip--blue"><GraduationCap size={12} /> Co-docente</span>
          : <span className="tdb-chip tdb-chip--violet"><Crown size={12} /> Propietario</span>}
        {group.group_code && (
          <button type="button" className="tdb-code" onClick={() => onCopyCode(group.group_code)} title="Copiar código de grupo">
            <Hash size={12} /> {group.group_code} <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// Tarjeta "Acceso del alumnado": código de grupo + cuentas sin activar.
function AccessCard({ groupCode, pending, total, loading, onCopy }) {
  return (
    <DashCard icon={KeyRound} title="Acceso del alumnado" subtitle="Primer inicio de sesión" tone="emerald">
      {groupCode ? (
        <button type="button" className="tdb-access__code" onClick={() => onCopy(groupCode)} title="Copiar código de grupo">
          <span>{groupCode}</span>
          <Copy size={18} />
        </button>
      ) : (
        <p className="tdb-access__hint">Este grupo no tiene código.</p>
      )}
      <p className="tdb-access__hint">
        Tus alumnos crean su contraseña en el primer inicio de sesión con su nombre de usuario y este código de grupo.
      </p>
      {!loading && total > 0 && (
        pending.length > 0 ? (
          <div className="tdb-access__pending">
            <span className="tdb-faces">
              {pending.slice(0, 4).map(s => (
                <UserAvatar
                  key={s.id}
                  selectedAvatarCode={s.selected_avatar_code}
                  avatarEmoji={s.avatar_emoji}
                  avatarColor={s.avatar_color}
                  size="sm"
                  shape="rounded"
                />
              ))}
            </span>
            <p>
              {pending.length === 1
                ? `${pending[0].display_name} aún no ha creado su contraseña`
                : `${pending.length} alumnos aún no han creado su contraseña`}
            </p>
          </div>
        ) : (
          <div className="tdb-access__pending tdb-access__pending--ok">
            <CheckCircle2 size={22} color="#10b981" />
            <p>Todo el grupo ha activado su cuenta.</p>
          </div>
        )
      )}
    </DashCard>
  );
}

// Atajos del grupo: saltan a cada sección de la página (solo navegación visual).
function ShortcutsCard({ tasks, onExplore }) {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const items = [
    { id: 'tdb-tareas', icon: ClipboardList, label: 'Tareas', hint: tasks != null ? `${tasks} asignadas` : 'Asignar y revisar', tone: 'amber' },
    { id: 'tdb-chat', icon: MessageSquare, label: 'Chat', hint: 'Anuncios y privados', tone: 'pink' },
    { id: 'tdb-arena', icon: Swords, label: 'Duelos y batallas', hint: 'Moderar la arena', tone: 'violet' },
  ];
  return (
    <DashCard icon={Rocket} title="Atajos del grupo" tone="violet">
      <div className="tdb-shortcuts">
        {items.map(({ id, icon: Icon, label, hint, tone }) => (
          <button key={id} type="button" className={`tdb-shortcut dk-tone-${tone}`} onClick={() => go(id)}>
            <span className="tdb-shortcut__icon"><Icon size={18} /></span>
            <span className="tdb-shortcut__text"><strong>{label}</strong><small>{hint}</small></span>
            <ChevronRight size={16} className="tdb-shortcut__chev" />
          </button>
        ))}
        <button type="button" className="tdb-shortcut dk-tone-cyan" onClick={onExplore}>
          <span className="tdb-shortcut__icon"><Compass size={18} /></span>
          <span className="tdb-shortcut__text"><strong>Apps del grupo</strong><small>Explorar su curso y asignatura</small></span>
          <ChevronRight size={16} className="tdb-shortcut__chev" />
        </button>
      </div>
    </DashCard>
  );
}

export default DashboardPage;
