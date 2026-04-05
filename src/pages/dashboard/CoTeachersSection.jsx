import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, GraduationCap, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export default function CoTeachersSection({ groupId, groupName, isOwner, ownerName, coTeachers, onChanged }) {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removingTeacher, setRemovingTeacher] = useState(null);
  const [teacherCode, setTeacherCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!teacherCode.trim()) return;
    setLoading(true);

    const { data } = await supabase.rpc('add_co_teacher', {
      p_group_id: groupId,
      p_teacher_code: teacherCode.trim(),
    });

    setLoading(false);

    if (data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: data.error });
    } else if (data?.success) {
      toast({
        title: 'Co-docente anadido',
        description: `${data.teacher.display_name} ahora tiene acceso al grupo`,
      });
      setShowAddDialog(false);
      setTeacherCode('');
      onChanged();
    }
  };

  const handleRemove = async () => {
    if (!removingTeacher) return;
    setLoading(true);

    const { data } = await supabase.rpc('remove_co_teacher', {
      p_group_id: groupId,
      p_teacher_id: removingTeacher.teacher_id,
    });

    setLoading(false);

    if (data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: data.error });
    } else {
      toast({ title: 'Co-docente eliminado' });
      setShowRemoveDialog(false);
      setRemovingTeacher(null);
      onChanged();
    }
  };

  const teachers = coTeachers || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          Profesores del grupo
        </h3>
        {isOwner && (
          <button
            onClick={() => { setTeacherCode(''); setShowAddDialog(true); }}
            className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Anadir profesor
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {/* Owner */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-50/50 border border-amber-100">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {teacher?.id === undefined ? ownerName : (ownerName || teacher?.display_name)}
              {isOwner && <span className="text-xs text-amber-600 ml-1">(tu)</span>}
            </p>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">PROPIETARIO</span>
        </div>

        {/* Co-teachers */}
        <AnimatePresence>
          {teachers.map(ct => (
            <motion.div
              key={ct.teacher_id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-slate-100"
            >
              <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {ct.display_name}
                  {ct.teacher_id === teacher?.id && <span className="text-xs text-blue-600 ml-1">(tu)</span>}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">{ct.teacher_code}</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => { setRemovingTeacher(ct); setShowRemoveDialog(true); }}
                  className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anadir profesor a {groupName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Introduce el codigo de profesor (PROF-XXXX) del docente que quieres anadir.
                Tendra acceso a ver alumnos, estadisticas, tareas y chat del grupo.
              </p>
              <Input
                placeholder="PROF-XXXX"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                className="font-mono text-center text-lg tracking-wider"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleAdd}
              disabled={loading || !teacherCode.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {loading ? 'Buscando...' : 'Anadir profesor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar co-docente</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que quieres eliminar a "{removingTeacher?.display_name}" del grupo "{groupName}"?
              Perdera acceso a los alumnos, estadisticas y chat del grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
