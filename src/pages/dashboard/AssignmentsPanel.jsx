import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Trash2, CheckCircle2, Clock, Users, User, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import AssignTaskDialog from './AssignTaskDialog';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AssignmentsPanel({ groupId, groupName, students }) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

    const { error } = await supabase.from('assignments').delete().eq('id', deletingId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
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
          <AnimatePresence>
            {assignments.map((asg, idx) => {
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
                  className={`bg-white rounded-xl p-4 border shadow-sm transition-all ${
                    allCompleted ? 'border-green-200' : isOverdue ? 'border-amber-200' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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
                      </div>

                      {asg.title && (
                        <p className="text-xs text-slate-500 mb-1">{asg.app_name}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Min: <strong className="text-slate-600">{asg.min_score} pts</strong> en examen</span>
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

                    <button
                      onClick={() => { setDeletingId(asg.id); setShowDeleteDialog(true); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        students={students}
        onCreated={fetchAssignments}
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
