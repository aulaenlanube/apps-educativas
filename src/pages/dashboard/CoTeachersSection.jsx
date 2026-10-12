import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, GraduationCap, Crown } from 'lucide-react';
import { DashCard, DashButton } from '@/components/dashboard/kit';
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
    <DashCard
      icon={GraduationCap}
      title="Profesorado"
      subtitle={`${1 + teachers.length} docente${teachers.length > 0 ? 's' : ''} con acceso`}
      tone="indigo"
      actions={isOwner && (
        <DashButton
          variant="soft"
          size="sm"
          icon={UserPlus}
          onClick={() => { setTeacherCode(''); setShowAddDialog(true); }}
          title="Añadir profesor"
        >
          Añadir
        </DashButton>
      )}
    >
      <div className="tdb-teachers">
        {/* Owner */}
        <div className="tdb-teacher tdb-teacher--owner">
          <span className="tdb-teacher__badge"><Crown size={18} /></span>
          <div className="tdb-teacher__text">
            <p className="tdb-teacher__name">
              {teacher?.id === undefined ? ownerName : (ownerName || teacher?.display_name)}
              {isOwner && <em> (tú)</em>}
            </p>
            <p className="tdb-teacher__role">Propietario del grupo</p>
          </div>
        </div>

        {/* Co-teachers */}
        <AnimatePresence>
          {teachers.map(ct => (
            <motion.div
              key={ct.teacher_id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="tdb-teacher"
            >
              <span className="tdb-teacher__badge">{(ct.display_name || '?').trim().charAt(0).toUpperCase()}</span>
              <div className="tdb-teacher__text">
                <p className="tdb-teacher__name">
                  {ct.display_name}
                  {ct.teacher_id === teacher?.id && <em> (tú)</em>}
                </p>
                <p className="tdb-teacher__code">{ct.teacher_code}</p>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => { setRemovingTeacher(ct); setShowRemoveDialog(true); }}
                  className="tdb-iconbtn tdb-iconbtn--sm tdb-iconbtn--danger"
                  title="Quitar co-docente"
                  aria-label={`Quitar a ${ct.display_name}`}
                >
                  <X size={15} />
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
            <DialogTitle>Añadir profesor a {groupName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Introduce el código de profesor (PROF-XXXX) del docente que quieres añadir.
                Tendrá acceso a ver alumnos, estadísticas, tareas y chat del grupo.
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
              {loading ? 'Buscando...' : 'Añadir profesor'}
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
              ¿Estás seguro de que quieres eliminar a "{removingTeacher?.display_name}" del grupo "{groupName}"?
              Perderá acceso a los alumnos, estadísticas y chat del grupo.
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
    </DashCard>
  );
}
