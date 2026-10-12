import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Pencil, Trash2, Copy, Hash, GraduationCap, BookOpen, Clock, School, Check, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
import SubjectIcon, { getSubjectAccent } from '@/components/SubjectIcon';
import { DashCard, DashButton, DashEmpty } from '@/components/dashboard/kit';
import materiasData from '/public/data/materias.json';
import ClassHoursEditor, { normalizeHoursFromRpc, MIN_CLASS_HOURS, MAX_WEEKLY_MINUTES, totalMinutes } from './ClassHoursEditor';

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

// Color de respaldo de cada grupo cuando no tiene asignatura con acento propio
const LEVEL_ACCENT = { primaria: '#f59e0b', eso: '#6366f1', bachillerato: '#0ea5e9' };
const FALLBACK_ACCENTS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#ef4444'];
const LEVEL_SHORT = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato' };

// ── Helpers de presentación (también los usa DashboardPage) ──
export function groupAccent(group, idx = 0) {
  return getSubjectAccent(group?.subject_id) || LEVEL_ACCENT[group?.level] || FALLBACK_ACCENTS[idx % FALLBACK_ACCENTS.length];
}

export function groupSubjectName(group) {
  if (!group?.subject_id) return '';
  return materiasData?.[group.level]?.[group.grade]?.find((s) => s.id === group.subject_id)?.nombre || group.subject_id;
}

// El catálogo de acentos de SubjectIcon coincide con el de dibujos de asignatura
const hasSubjectArt = (subjectId) => Boolean(subjectId && getSubjectAccent(subjectId));

function groupSubjectEmoji(group) {
  if (!group?.subject_id) return null;
  return materiasData?.[group.level]?.[group.grade]?.find((s) => s.id === group.subject_id)?.icon || null;
}

export function groupCourseLabel(group) {
  const lvl = LEVEL_SHORT[group?.level] || '';
  if (group?.grade && lvl) return `${group.grade}º ${lvl}`;
  return lvl || (group?.grade ? `${group.grade}º` : '');
}

// Evaluación en curso tal y como la verá el alumno: la fijada por el docente o,
// en "Automática", la que corresponde por fecha (sep-dic 1ª, ene-mar 2ª, abr-ago 3ª).
export function groupTermLabel(group) {
  if (group?.current_term) return `${group.current_term}ª Evaluación`;
  const m = new Date().getMonth();
  const t = m >= 8 ? 1 : m <= 2 ? 2 : 3;
  return `${t}ª Eval · auto`;
}

export default function GroupsPanel({ groups, selectedGroupId, onSelectGroup, onGroupsChanged }) {
  const { toast } = useToast();
  const { isAdmin } = useAuth();

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
  const [groupHours, setGroupHours] = useState([{ weekday: 1, start_time: '09:00', end_time: '10:00' }]);
  const [groupCurrentTerm, setGroupCurrentTerm] = useState(null); // null=auto (por fecha), 1|2|3
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
    setGroupHours([{ weekday: 1, start_time: '09:00', end_time: '10:00' }]);
    setGroupCurrentTerm(null);
  };

  const validateHours = () => {
    if (groupHours.length < MIN_CLASS_HOURS) {
      toast({ variant: 'destructive', title: 'Horario obligatorio', description: `Añade al menos ${MIN_CLASS_HOURS} franja horaria.` });
      return false;
    }
    for (const h of groupHours) {
      if (h.end_time <= h.start_time) {
        toast({ variant: 'destructive', title: 'Horario inválido', description: 'La hora de fin debe ser posterior a la de inicio.' });
        return false;
      }
    }
    const mins = totalMinutes(groupHours);
    if (mins > MAX_WEEKLY_MINUTES) {
      toast({ variant: 'destructive', title: 'Máximo 4 horas semanales', description: `Tienes ${mins} min en total.` });
      return false;
    }
    return true;
  };

  const hoursOk = groupHours.length >= MIN_CLASS_HOURS &&
                  totalMinutes(groupHours) > 0 &&
                  totalMinutes(groupHours) <= MAX_WEEKLY_MINUTES &&
                  groupHours.every(h => h.end_time > h.start_time);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    if (!validateHours()) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('teacher_create_group_with_hours', {
      p_name: groupName.trim(),
      p_description: groupDescription.trim() || null,
      p_level: groupLevel || null,
      p_grade: groupGrade || null,
      p_subject_id: groupSubjectId === NO_SUBJECT ? null : groupSubjectId,
      p_hours: groupHours,
    });

    setLoading(false);
    const errMsg = error?.message || data?.error;
    if (errMsg) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errMsg.includes('unique') ? 'Ya existe un grupo con ese nombre' : errMsg,
      });
      return;
    }
    toast({ title: 'Grupo creado' });
    setShowCreateDialog(false);
    resetForm();
    onGroupsChanged();
  };

  const handleEdit = async () => {
    if (!groupName.trim() || !editingGroup) return;
    if (!validateHours()) return;
    setLoading(true);

    const { error } = await supabase
      .from('groups')
      .update({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        level: groupLevel || null,
        grade: groupGrade || null,
        subject_id: groupSubjectId === NO_SUBJECT ? null : groupSubjectId,
        current_term: groupCurrentTerm,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingGroup.id);

    if (error) {
      setLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }

    const { data: hoursRes, error: hoursErr } = await supabase.rpc('teacher_set_group_class_hours', {
      p_group_id: editingGroup.id,
      p_hours: groupHours,
    });
    setLoading(false);
    const hoursErrMsg = hoursErr?.message || hoursRes?.error;
    if (hoursErrMsg) {
      toast({ variant: 'destructive', title: 'Error guardando horario', description: hoursErrMsg });
      return;
    }
    toast({ title: 'Grupo actualizado' });
    setShowEditDialog(false);
    setEditingGroup(null);
    onGroupsChanged();
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

  const openEdit = async (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupLevel(group.level || 'primaria');
    setGroupGrade(group.grade || '1');
    setGroupSubjectId(group.subject_id || NO_SUBJECT);
    setGroupHours([]);
    setGroupCurrentTerm(group.current_term ?? null);
    setShowEditDialog(true);
    const { data } = await supabase.rpc('teacher_get_group_class_hours', { p_group_id: group.id });
    const list = normalizeHoursFromRpc(data?.hours);
    setGroupHours(list.length > 0 ? list : [{ weekday: 1, start_time: '09:00', end_time: '10:00' }]);
  };

  const openDelete = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    setShowDeleteDialog(true);
  };

  const ownedCount = groups.filter(g => g.is_owner !== false).length;
  // Los admin no tienen límite de grupos (la RPC teacher_create_group_with_hours
  // ya exime a role='admin' del tope de 3); aquí solo replicamos esa regla en la UI.
  const atGroupLimit = !isAdmin && ownedCount >= 3;

  const openCreate = () => { resetForm(); setShowCreateDialog(true); };

  return (
    <DashCard
      icon={School}
      title="Mis grupos"
      subtitle={isAdmin ? `${ownedCount} grupos creados` : `${ownedCount}/3 grupos creados · elige uno para gestionarlo`}
      tone="blue"
    >
      {groups.length === 0 ? (
        <DashEmpty
          title="No tienes grupos todavía"
          action={<DashButton icon={Plus} onClick={openCreate} disabled={atGroupLimit}>Crear mi primer grupo</DashButton>}
        >
          Crea tu primer grupo para añadir alumnos, asignar tareas y lanzar duelos y batallas.
        </DashEmpty>
      ) : (
        <div className="tdb-groups">
          <AnimatePresence>
            {groups.map((group, idx) => {
              const selected = selectedGroupId === group.id;
              const subjectName = groupSubjectName(group);
              const emoji = groupSubjectEmoji(group);
              const coCount = group.co_teachers?.length || 0;
              return (
                <motion.div
                  key={group.id}
                  layout="position"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: idx * 0.05 }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => onSelectGroup(group.id)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectGroup(group.id); }
                  }}
                  className={`tdb-gcard group ${selected ? 'is-selected' : ''}`}
                  style={{ '--acc': groupAccent(group, idx) }}
                >
                  <div className="tdb-gcard__band">
                    <span className="tdb-gcard__course">{group.grade ? `${group.grade}º` : <School size={28} />}</span>
                    <span className="tdb-gcard__level">{LEVEL_SHORT[group.level] || 'Grupo'}</span>
                    <div className="tdb-gcard__badges">
                      <span className="tdb-gcard__badge"><CalendarDays size={11} /> {groupTermLabel(group)}</span>
                      {selected && <span className="tdb-gcard__badge tdb-gcard__badge--on"><Check size={11} /> Abierto</span>}
                    </div>
                    {group.is_owner !== false && (
                      <div className="tdb-gcard__tools">
                        <button
                          type="button"
                          onClick={(e) => openEdit(group, e)}
                          className="tdb-gcard__tool"
                          title="Editar grupo"
                          aria-label={`Editar ${group.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => openDelete(group, e)}
                          className="tdb-gcard__tool tdb-gcard__tool--danger"
                          title="Eliminar grupo"
                          aria-label={`Eliminar ${group.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                    <span className="tdb-gcard__medal">
                      {hasSubjectArt(group.subject_id)
                        ? <SubjectIcon subjectId={group.subject_id} />
                        : emoji
                          ? <span className="tdb-gcard__emoji">{emoji}</span>
                          : <Users size={28} color="var(--acc)" />}
                    </span>
                  </div>

                  <div className="tdb-gcard__body">
                    <h3 className="tdb-gcard__name">
                      {group.name}
                    </h3>
                    {subjectName && <span className="tdb-gcard__subject">{subjectName}</span>}
                    {group.description && <p className="tdb-gcard__desc" title={group.description}>{group.description}</p>}
                    {group.is_owner === false && (
                      <p className="tdb-gcard__owner">
                        <span className="tdb-chip tdb-chip--blue">Co-docente</span>
                        {group.owner_name && <span>Propietario: {group.owner_name}</span>}
                      </p>
                    )}
                  </div>

                  <div className="tdb-gcard__foot">
                    <span className="tdb-gcard__stat">
                      <Users size={14} />
                      {group.student_count || 0} alumno{group.student_count !== 1 ? 's' : ''}
                    </span>
                    {coCount > 0 && (
                      <span className="tdb-gcard__stat" title={`${coCount} profesor${coCount !== 1 ? 'es' : ''} más en el grupo`}>
                        <GraduationCap size={14} />
                        +{coCount}
                      </span>
                    )}
                    {group.group_code && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(group.group_code, e)}
                        className="tdb-code"
                        title="Copiar código de grupo"
                      >
                        {group.group_code}
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <button
            type="button"
            className="tdb-gcard tdb-gcard--new"
            onClick={openCreate}
            disabled={atGroupLimit}
            title={atGroupLimit ? 'Has alcanzado el máximo de 3 grupos' : ''}
          >
            <span className="tdb-gcard__plus"><Plus size={26} /></span>
            <span className="tdb-gcard__newtext">
              <strong>Nuevo grupo</strong>
              <small>{atGroupLimit ? 'Has alcanzado el máximo de 3 grupos' : isAdmin ? 'Sin límite de grupos' : `Te quedan ${Math.max(0, 3 - ownedCount)} de 3`}</small>
            </span>
          </button>
        </div>
      )}

      {/* Dialogo crear grupo */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
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
              <Label>Descripción (opcional)</Label>
              <Input
                placeholder="Ej: Grupo de la mañana"
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

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Horario de clase
              </Label>
              <p className="text-xs text-slate-400">
                Duelos y batallas solo se podrán hacer dentro de estas franjas. Mínimo 1 franja, máximo 4 horas semanales en total.
              </p>
              <ClassHoursEditor hours={groupHours} onChange={setGroupHours} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading || !groupName.trim() || !hoursOk}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {loading ? 'Creando...' : 'Crear grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo editar grupo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Editar grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del grupo</Label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            {editingGroup?.group_code && (
              <div className="flex items-center gap-2 text-xs bg-purple-50 text-purple-700 rounded-md px-3 py-2">
                <Hash className="w-3.5 h-3.5" />
                Código del grupo: <span className="font-mono font-bold">{editingGroup.group_code}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
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

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="flex items-center gap-1.5">Evaluación actual</Label>
              <p className="text-xs text-slate-400">
                Determina qué nota ve el alumno en su panel &quot;Mi nota actual&quot;. Si eliges
                &quot;Automática&quot;, se infiere por fecha (sep-dic 1ª, ene-mar 2ª, abr-ago 3ª).
              </p>
              <div className="tdb-term-picker" role="radiogroup" aria-label="Evaluación actual">
                {[
                  { v: null, label: 'Automática' },
                  { v: 1, label: '1ª Eval' },
                  { v: 2, label: '2ª Eval' },
                  { v: 3, label: '3ª Eval' },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    role="radio"
                    aria-checked={groupCurrentTerm === opt.v}
                    onClick={() => setGroupCurrentTerm(opt.v)}
                    className={groupCurrentTerm === opt.v ? 'is-on' : ''}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Horario de clase
              </Label>
              <p className="text-xs text-slate-400">
                Duelos y batallas solo se podrán hacer dentro de estas franjas. Mínimo 1 franja, máximo 4 horas semanales en total.
              </p>
              <ClassHoursEditor hours={groupHours} onChange={setGroupHours} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !groupName.trim() || !hoursOk}
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
              ¿Estás seguro de que quieres eliminar el grupo "{editingGroup?.name}"?
              Se eliminarán todos los alumnos del grupo. Esta acción no se puede deshacer.
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
    </DashCard>
  );
}
