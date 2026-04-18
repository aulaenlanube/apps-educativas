import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Trash2, Pencil, CheckCircle2, Clock, Users, User, AlertTriangle, Filter, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import AssignTaskDialog from './AssignTaskDialog';
import AssignmentScoresDialog from './AssignmentScoresDialog';
import EditAssignmentDialog from './EditAssignmentDialog';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AssignmentsPanel({ groupId, groupName, groupLevel, groupGrade, groupSubject, students }) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);

    const { data } = await supabase.rpc('teacher_get_assignments_progress', {
      p_group_id: groupId,
    });

    if (data?.assignments) {
      setAssignments(data.assignments);
    } else {
      setAssignments([]);
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleDelete = async () => {
    if (!deletingId) return;

    const { data, error } = await supabase.rpc('teacher_delete_assignment', {
      p_assignment_id: deletingId,
    });
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      toast({ title: 'Tarea eliminada' });
      fetchAssignments();
    }
    setShowDeleteDialog(false);
    setDeletingId(null);
  };

  if (!groupId) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-500" />
          Tareas de {groupName}
        </h3>
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Asignar tarea
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay tareas asignadas a este grupo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Teacher filter - only show if there are assignments from multiple teachers */}
          {(() => {
            const teacherIds = [...new Set(assignments.map(a => a.teacher_id).filter(Boolean))];
            if (teacherIds.length <= 1) return null;
            const teacherNames = {};
            assignments.forEach(a => { if (a.teacher_id && a.teacher_name) teacherNames[a.teacher_id] = a.teacher_name; });
            return (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setTeacherFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    teacherFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                {teacherIds.map(tid => (
                  <button
                    key={tid}
                    onClick={() => setTeacherFilter(tid)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      teacherFilter === tid ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" />
                    {teacherNames[tid] || 'Profesor'}
                  </button>
                ))}
              </div>
            );
          })()}

          <AnimatePresence>
            {assignments
              .filter(asg => teacherFilter === 'all' || asg.teacher_id === teacherFilter)
              .map((asg, idx) => {
              const isOverdue = asg.due_date && new Date(asg.due_date) < new Date();
              const allCompleted = asg.completed_count >= asg.total_students;
              const progress = asg.total_students > 0
                ? Math.round((asg.completed_count / asg.total_students) * 100)
                : 0;

              return (
                <motion.div
                  key={asg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedAssignment(asg)}
                  className={`bg-white rounded-xl p-4 border shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-purple-200 ${
                    allCompleted ? 'border-green-200' : isOverdue ? 'border-amber-200' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {asg.title || asg.app_name}
                        </span>
                        {asg.student_id ? (
                          <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            <User className="w-3 h-3" />
                            {asg.student_name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                            <Users className="w-3 h-3" />
                            Grupo
                          </span>
                        )}
                        {asg.teacher_name && (
                          <span className="flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">
                            <GraduationCap className="w-3 h-3" />
                            {asg.teacher_name}
                          </span>
                        )}
                        {asg.weight > 1 && (
                          <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                            x{asg.weight}
                          </span>
                        )}
                        {asg.term && (
                          <span className="text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                            {asg.term}ª Eval
                          </span>
                        )}
                      </div>

                      {asg.title && (
                        <p className="text-xs text-slate-500 mb-1">{asg.app_name}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Nota minima: <strong className="text-slate-600">{asg.min_score}/10</strong> en examen</span>
                        {asg.due_date && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-amber-600' : ''}`}>
                            {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {formatDate(asg.due_date)}
                          </span>
                        )}
                      </div>

                      {asg.description && (
                        <p className="text-xs text-slate-400 mt-1 italic">{asg.description}</p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              allCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                          {allCompleted ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completada
                            </span>
                          ) : (
                            `${asg.completed_count}/${asg.total_students}`
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingAssignment(asg); }}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-300 hover:text-purple-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(asg.id); setShowDeleteDialog(true); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AssignTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        groupId={groupId}
        groupName={groupName}
        groupLevel={groupLevel}
        groupGrade={groupGrade}
        groupSubject={groupSubject}
        students={students}
        onCreated={fetchAssignments}
      />

      <AssignmentScoresDialog
        open={!!selectedAssignment}
        onOpenChange={(v) => { if (!v) setSelectedAssignment(null); }}
        assignment={selectedAssignment}
      />

      <EditAssignmentDialog
        open={!!editingAssignment}
        onOpenChange={(v) => { if (!v) setEditingAssignment(null); }}
        assignment={editingAssignment}
        onUpdated={fetchAssignments}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que quieres eliminar esta tarea? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
