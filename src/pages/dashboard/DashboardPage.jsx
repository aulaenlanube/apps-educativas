import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import GroupsPanel from './GroupsPanel';
import StudentsPanel from './StudentsPanel';
import StudentStatsView from './StudentStatsView';
import AssignmentsPanel from './AssignmentsPanel';

const DashboardPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    const { data } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      const { data: studentCounts } = await supabase
        .from('students')
        .select('group_id');

      const counts = {};
      studentCounts?.forEach(s => {
        counts[s.group_id] = (counts[s.group_id] || 0) + 1;
      });

      setGroups(data.map(g => ({ ...g, student_count: counts[g.id] || 0 })));
    }
    setLoadingGroups(false);
  }, []);

  const fetchStudents = useCallback(async (groupId) => {
    if (!groupId) { setStudents([]); return; }
    setLoadingStudents(true);
    const { data } = await supabase
      .from('students')
      .select('id, username, display_name, avatar_emoji, password_hash, created_at')
      .eq('group_id', groupId)
      .order('display_name', { ascending: true });
    setStudents(data || []);
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    Hola, {teacher?.display_name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {groups.length} grupo{groups.length !== 1 ? 's' : ''} creado{groups.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

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
          </motion.div>

          {/* Grid principal: grupos + contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de grupos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-purple-100 p-4"
            >
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
                students={students}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
