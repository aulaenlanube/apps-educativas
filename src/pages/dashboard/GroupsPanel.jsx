import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Pencil, Trash2, Copy, Hash, GraduationCap, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import materiasData from '/public/data/materias.json';

const LEVEL_OPTIONS = [
  { id: 'primaria', label: 'Primaria', grades: ['1', '2', '3', '4', '5', '6'] },
  { id: 'eso', label: 'ESO', grades: ['1', '2', '3', '4'] },
  { id: 'bachillerato', label: 'Bachillerato', grades: ['1', '2'] },
];
const NO_SUBJECT = '__none__';

const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function GroupLevelFields({ level, grade, subjectId, availableGrades, availableSubjects, onLevelChange, onGradeChange, onSubjectChange }) {
  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nivel</Label>
          <select className={selectClass} value={level} onChange={(e) => onLevelChange(e.target.value)}>
            {LEVEL_OPTIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Curso</Label>
          <select className={selectClass} value={grade} onChange={(e) => onGradeChange(e.target.value)}>
            {availableGrades.map((g) => (
              <option key={g} value={g}>{g}º</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Asignatura
        </Label>
        <select className={selectClass} value={subjectId} onChange={(e) => onSubjectChange(e.target.value)}>
          <option value={NO_SUBJECT}>Sin asignatura</option>
          {availableSubjects.map((s) => (
            <option key={s.id} value={s.id}>{s.icon} {s.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const groupColors = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-green-400 to-green-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
  'from-red-400 to-red-600',
];

export default function GroupsPanel({ groups, selectedGroupId, onSelectGroup, onGroupsChanged }) {
  const { toast } = useToast();

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast({ title: 'Codigo de grupo copiado', description: code });
  };
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupLevel, setGroupLevel] = useState('primaria');
  const [groupGrade, setGroupGrade] = useState('1');
  const [groupSubjectId, setGroupSubjectId] = useState(NO_SUBJECT);
  const [loading, setLoading] = useState(false);

  const availableGrades = useMemo(
    () => LEVEL_OPTIONS.find((l) => l.id === groupLevel)?.grades || [],
    [groupLevel]
  );

  const availableSubjects = useMemo(() => {
    if (!groupLevel || !groupGrade) return [];
    const list = materiasData?.[groupLevel]?.[groupGrade];
    return Array.isArray(list) ? list : [];
  }, [groupLevel, groupGrade]);

  const resetForm = () => {
    setGroupName('');
    setGroupDescription('');
    setGroupLevel('primaria');
    setGroupGrade('1');
    setGroupSubjectId(NO_SUBJECT);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('groups').insert({
      teacher_id: (await supabase.auth.getUser()).data.user.id,
      name: groupName.trim(),
      description: groupDescription.trim() || null,
      level: groupLevel || null,
      grade: groupGrade || null,
      subject_id: groupSubjectId === NO_SUBJECT ? null : groupSubjectId,
    });

    setLoading(false);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message.includes('unique') ? 'Ya existe un grupo con ese nombre' : error.message,
      });
    } else {
      toast({ title: 'Grupo creado' });
      setShowCreateDialog(false);
      resetForm();
      onGroupsChanged();
    }
  };

  const handleEdit = async () => {
    if (!groupName.trim() || !editingGroup) return;
    setLoading(true);

    const { error } = await supabase
      .from('groups')
      .update({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        level: groupLevel || null,
        grade: groupGrade || null,
        subject_id: groupSubjectId === NO_SUBJECT ? null : groupSubjectId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingGroup.id);

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Grupo actualizado' });
      setShowEditDialog(false);
      setEditingGroup(null);
      onGroupsChanged();
    }
  };

  const handleDelete = async () => {
    if (!editingGroup) return;
    setLoading(true);

    const { error } = await supabase.from('groups').delete().eq('id', editingGroup.id);

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Grupo eliminado' });
      setShowDeleteDialog(false);
      setEditingGroup(null);
      if (selectedGroupId === editingGroup.id) onSelectGroup(null);
      onGroupsChanged();
    }
  };

  const openEdit = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupLevel(group.level || 'primaria');
    setGroupGrade(group.grade || '1');
    setGroupSubjectId(group.subject_id || NO_SUBJECT);
    setShowEditDialog(true);
  };

  const openDelete = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    setShowDeleteDialog(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Mis Grupos</h2>
        <Button
          size="sm"
          onClick={() => { resetForm(); setShowCreateDialog(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nuevo grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No tienes grupos todavia</p>
          <p className="text-sm">Crea tu primer grupo para empezar</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {groups.map((group, idx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectGroup(group.id)}
                className={`relative rounded-xl p-4 cursor-pointer transition-all ${
                  selectedGroupId === group.id
                    ? 'ring-2 ring-purple-400 shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${groupColors[idx % groupColors.length]} opacity-10`} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{group.name}</h3>
                        {group.is_owner === false && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            CO-DOCENTE
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-500">{group.description}</p>
                      )}
                      {group.is_owner === false && group.owner_name && (
                        <p className="text-xs text-gray-400">Propietario: {group.owner_name}</p>
                      )}
                      {(group.level || group.grade || group.subject_id) && (
                        <p className="text-[11px] text-purple-500 mt-0.5 font-medium">
                          {group.level === 'eso' ? 'ESO' : group.level === 'primaria' ? 'Primaria' : ''}
                          {group.grade ? ` · ${group.grade}º` : ''}
                          {group.subject_id ? ` · ${materiasData?.[group.level]?.[group.grade]?.find((s) => s.id === group.subject_id)?.nombre || group.subject_id}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {group.is_owner !== false && (
                        <>
                          <button
                            onClick={(e) => openEdit(group, e)}
                            className="p-1.5 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => openDelete(group, e)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">
                        {group.student_count || 0} alumno{group.student_count !== 1 ? 's' : ''}
                      </p>
                      {group.co_teachers && group.co_teachers.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-blue-500">
                          <GraduationCap className="w-3 h-3" />
                          +{group.co_teachers.length} prof
                        </span>
                      )}
                    </div>
                    {group.group_code && (
                      <button
                        onClick={(e) => handleCopyCode(group.group_code, e)}
                        className="flex items-center gap-1 text-xs font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors"
                        title="Copiar codigo de grupo"
                      >
                        <Hash className="w-3 h-3" />
                        {group.group_code}
                        <Copy className="w-3 h-3 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogo crear grupo */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del grupo</Label>
              <Input
                placeholder="Ej: 3A Primaria"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Input
                placeholder="Ej: Grupo de la manana"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>

            <GroupLevelFields
              level={groupLevel}
              grade={groupGrade}
              subjectId={groupSubjectId}
              availableGrades={availableGrades}
              availableSubjects={availableSubjects}
              onLevelChange={(v) => { setGroupLevel(v); setGroupGrade('1'); setGroupSubjectId(NO_SUBJECT); }}
              onGradeChange={(v) => { setGroupGrade(v); setGroupSubjectId(NO_SUBJECT); }}
              onSubjectChange={setGroupSubjectId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !groupName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {loading ? 'Creando...' : 'Crear grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo editar grupo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del grupo</Label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Input value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} />
            </div>

            <GroupLevelFields
              level={groupLevel}
              grade={groupGrade}
              subjectId={groupSubjectId}
              availableGrades={availableGrades}
              availableSubjects={availableSubjects}
              onLevelChange={(v) => { setGroupLevel(v); setGroupGrade('1'); setGroupSubjectId(NO_SUBJECT); }}
              onGradeChange={(v) => { setGroupGrade(v); setGroupSubjectId(NO_SUBJECT); }}
              onSubjectChange={setGroupSubjectId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !groupName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo confirmar eliminacion */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que quieres eliminar el grupo "{editingGroup?.name}"?
              Se eliminaran todos los alumnos del grupo. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
