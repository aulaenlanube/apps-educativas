import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Copy, GraduationCap, MessageSquare, Users, Trophy, MessageCircle, Zap, FileText, Compass } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import GroupsPanel from './GroupsPanel';
import StudentsPanel from './StudentsPanel';
import StudentStatsView from './StudentStatsView';
import AssignmentsPanel from './AssignmentsPanel';
import GroupChatPanel from './GroupChatPanel';
import CoTeachersSection from './CoTeachersSection';
import MyFeedbacksSection from '@/components/ui/MyFeedbacksSection';
import TeacherLogrosSection from './TeacherLogrosSection';
import QuizTemplatesPanel from '@/apps/quiz-battle/QuizTemplatesPanel';

const DashboardPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState(null);

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

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const isOwner = selectedGroup?.is_owner !== false;

  return (
    <div>
      <Header subtitle="Panel del Docente" />

      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Info del docente */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-6xl leading-none flex-shrink-0">{teacher?.avatar_emoji || '🎓'}</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    Hola, {teacher?.display_name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {groups.length} grupo{groups.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (selectedGroup?.level && selectedGroup?.grade) {
                      const path = selectedGroup.subject_id
                        ? `/curso/${selectedGroup.level}/${selectedGroup.grade}/${selectedGroup.subject_id}`
                        : `/curso/${selectedGroup.level}/${selectedGroup.grade}`;
                      navigate(path);
                    } else {
                      navigate('/');
                    }
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl px-4 py-2.5 hover:shadow-lg transition-all text-white group"
                  title={selectedGroup ? `Apps de ${selectedGroup.name || 'tu grupo'}` : 'Elegir curso'}
                >
                  <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs text-blue-100 text-left">
                      {selectedGroup ? 'Del grupo seleccionado' : 'Elige curso'}
                    </p>
                    <p className="text-lg font-bold tracking-wide">Explorar Apps</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/quiz-battle/host')}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl px-4 py-2.5 hover:shadow-lg transition-all text-white group"
                >
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs text-amber-100 text-left">En directo</p>
                    <p className="text-lg font-bold tracking-wide">Iniciar Batalla</p>
                  </div>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 hover:shadow-md transition-all group"
                >
                  <div>
                    <p className="text-xs text-gray-500 text-left">Tu codigo de profesor</p>
                    <p className="text-lg font-bold tracking-wider text-purple-700">{teacher?.teacher_code}</p>
                  </div>
                  <Copy className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="grupos" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto bg-white border border-purple-100 shadow-sm rounded-2xl p-1.5 mb-6">
              <TabsTrigger
                value="grupos"
                className="flex items-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Users className="w-4 h-4" />
                <span className="font-semibold">Grupos</span>
              </TabsTrigger>
              <TabsTrigger
                value="logros"
                className="flex items-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">Mis logros</span>
              </TabsTrigger>
              <TabsTrigger
                value="plantillas"
                className="flex items-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span className="font-semibold">Batallas</span>
              </TabsTrigger>
              <TabsTrigger
                value="comentarios"
                className="flex items-center gap-2 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">Comentarios</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grupos" className="mt-0">
          {/* Grid principal: grupos + contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de grupos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-4"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
                {loadingGroups ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  </div>
                ) : (
                  <GroupsPanel
                    groups={groups}
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={setSelectedGroupId}
                    onGroupsChanged={fetchGroups}
                  />
                )}
              </div>

              {/* Co-teachers section */}
              {selectedGroupId && !viewingStudentId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4"
                >
                  <CoTeachersSection
                    groupId={selectedGroupId}
                    groupName={selectedGroup?.name}
                    isOwner={isOwner}
                    ownerName={selectedGroup?.owner_name}
                    coTeachers={selectedGroup?.co_teachers}
                    onChanged={fetchGroups}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Panel derecho: alumnos o stats de un alumno */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-purple-100 p-4 min-h-[400px]"
            >
              {viewingStudentId ? (
                <StudentStatsView
                  studentId={viewingStudentId}
                  onBack={() => setViewingStudentId(null)}
                />
              ) : loadingStudents ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
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
            </motion.div>
          </div>

          {/* Panel de tareas asignadas */}
          {selectedGroupId && !viewingStudentId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-white rounded-2xl shadow-sm border border-purple-100 p-4"
            >
              <AssignmentsPanel
                groupId={selectedGroupId}
                groupName={selectedGroup?.name}
                groupLevel={selectedGroup?.level}
                groupGrade={selectedGroup?.grade}
                groupSubject={selectedGroup?.subject_id}
                students={students}
              />
            </motion.div>
          )}

          {/* Chat del grupo */}
          {selectedGroupId && !viewingStudentId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 bg-white rounded-2xl shadow-sm border border-purple-100 p-4"
            >
              <GroupChatPanel
                groupId={selectedGroupId}
                groupName={selectedGroup?.name}
              />
            </motion.div>
          )}

            </TabsContent>

            <TabsContent value="logros" className="mt-0">
              <TeacherLogrosSection />
            </TabsContent>

            <TabsContent value="plantillas" className="mt-0">
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
                <QuizTemplatesPanel />
              </div>
            </TabsContent>

            <TabsContent value="comentarios" className="mt-0">
              <MyFeedbacksSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
