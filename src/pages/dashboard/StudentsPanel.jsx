import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Users, RotateCcw, History, CheckCircle2, AlertTriangle, BarChart3, ChevronDown, ChevronUp, Search, MoreVertical, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { USERNAME_RE, sanitizePlainText } from '@/lib/sanitize';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar from '@/components/ui/UserAvatar';
import { DashCard, DashButton, DashEmpty } from '@/components/dashboard/kit';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const AVATAR_EMOJIS = ['🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐲', '🦋', '🌟', '🚀', '⚽', '🎨', '🎵', '📚', '💀', '👻', '👽', '🤡', '💩', '🧛', '🧟', '🫠', '🤪', '😈', '🥸', '🤮', '🫣', '🤯', '👾', '🦠'];

export default function StudentsPanel({ students, groupId, groupName, groupCode, onStudentsChanged, onViewStats }) {
  const { toast } = useToast();
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showResetProgressDialog, setShowResetProgressDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // Filtro local del listado (solo presentación)
  const [query, setQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState('all'); // 'all' | 'pending'

  // Form state
  const [bulkUsernames, setBulkUsernames] = useState('');
  const [bulkResult, setBulkResult] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🎓');

  const handleBulkCreate = async () => {
    const rawLines = bulkUsernames
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (rawLines.length === 0) return;

    // Validacion client-side: letras/digitos/._- , 3-30 chars. Duplicados eliminados.
    const invalid = [];
    const seen = new Set();
    const usernames = [];
    for (const line of rawLines) {
      if (!USERNAME_RE.test(line)) {
        invalid.push(line);
        continue;
      }
      const lower = line.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      usernames.push(line);
    }

    if (invalid.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Nombres de usuario invalidos',
        description: `Solo letras, digitos, "_", "-", "." (3-30 chars). Rechazados: ${invalid.slice(0, 5).join(', ')}${invalid.length > 5 ? '...' : ''}`,
      });
      return;
    }
    if (usernames.length === 0) return;
    if (usernames.length > 200) {
      toast({ variant: 'destructive', title: 'Error', description: 'Maximo 200 alumnos por lote' });
      return;
    }

    setLoading(true);
    setBulkResult(null);

    const { data, error } = await supabase.rpc('create_students_bulk', {
      p_group_id: groupId,
      p_usernames: usernames,
    });

    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else if (data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: data.error });
    } else {
      const result = { ...data, requested: usernames.length };
      // If the RPC didn't report errors but some usernames weren't created, flag them
      const createdCount = result.created || 0;
      const reportedErrors = result.errors || [];
      if (createdCount < usernames.length && reportedErrors.length === 0) {
        const failedCount = usernames.length - createdCount;
        result.errors = [`${failedCount} nombre${failedCount !== 1 ? 's' : ''} de usuario ya estaban en uso`];
      }
      setBulkResult(result);
      if (createdCount > 0) {
        onStudentsChanged();
      }
    }
  };

  const closeBulkDialog = () => {
    setShowBulkDialog(false);
    setBulkUsernames('');
    setBulkResult(null);
  };

  const handleEdit = async () => {
    const cleanName = sanitizePlainText(displayName, 80);
    if (!cleanName || !editingStudent) return;
    setLoading(true);

    const { error } = await supabase
      .from('students')
      .update({
        display_name: cleanName,
        avatar_emoji: avatarEmoji,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingStudent.id);

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Alumno actualizado' });
      setShowEditDialog(false);
      setEditingStudent(null);
      onStudentsChanged();
    }
  };

  const handleResetPassword = async () => {
    if (!editingStudent) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('reset_student_password', {
      p_student_id: editingStudent.id,
    });

    setLoading(false);
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      toast({ title: 'Contrasena restablecida', description: `${editingStudent.display_name} debera crear una nueva contrasena en su proximo inicio de sesion` });
      setShowResetDialog(false);
      setEditingStudent(null);
      onStudentsChanged();
    }
  };

  const handleResetCourseProgress = async () => {
    if (!editingStudent || !groupId) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('teacher_reset_student_course_progress', {
      p_student_id: editingStudent.id,
      p_group_id: groupId,
    });

    setLoading(false);
    if (error || data?.error || data?.success === false) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || data?.error || 'No se pudo reiniciar el progreso',
      });
    } else {
      const total = data?.total_resets;
      toast({
        title: 'Progreso del curso reiniciado',
        description: `${editingStudent.display_name} mantiene XP, nivel, avatares e insignias.${total > 1 ? ` (Reset n.º ${total} en este grupo)` : ''}`,
      });
      setShowResetProgressDialog(false);
      setEditingStudent(null);
      onStudentsChanged();
    }
  };

  const handleDelete = async () => {
    if (!editingStudent) return;
    setLoading(true);

    const { error } = await supabase.from('students').delete().eq('id', editingStudent.id);

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Alumno eliminado' });
      setShowDeleteDialog(false);
      setEditingStudent(null);
      onStudentsChanged();
    }
  };

  // Alumnos sin contraseña (password_hash null) y listado filtrado para el roster
  const needsPasswordStudents = students.filter(s => s.password_hash === null);
  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (rosterFilter === 'pending' && s.password_hash !== null) return false;
      if (!q) return true;
      return `${s.display_name || ''} ${s.username || ''}`.toLowerCase().includes(q);
    });
  }, [students, query, rosterFilter]);

  if (!groupId) {
    return (
      <DashEmpty title="Selecciona un grupo">
        Elige una de tus tarjetas de grupo para ver y gestionar su alumnado, sus tareas, el chat y los duelos.
      </DashEmpty>
    );
  }

  const openEdit = (student) => {
    setEditingStudent(student);
    setDisplayName(student.display_name);
    setAvatarEmoji(student.avatar_emoji);
    setShowEditDialog(true);
  };

  return (
    <DashCard
      icon={Users}
      title={`Alumnos de ${groupName}`}
      subtitle={`${students.length}/30 alumno${students.length !== 1 ? 's' : ''}`}
      tone="blue"
      actions={(
        <>
          <DashButton
            variant="emerald"
            size="sm"
            icon={Plus}
            onClick={() => { setBulkUsernames(''); setBulkResult(null); setShowBulkDialog(true); }}
            disabled={students.length >= 30}
            title={students.length >= 30 ? 'Has alcanzado el máximo de 30 alumnos' : ''}
          >
            Añadir alumnos
          </DashButton>
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="tdb-iconbtn"
            title={collapsed ? 'Mostrar alumnos' : 'Plegar alumnos'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </>
      )}
    >
      <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.div
          key="students-body"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
      {students.length === 0 ? (
        <DashEmpty title="No hay alumnos en este grupo">
          Añade alumnos escribiendo un nombre de usuario por línea. Después entrarán con el código de grupo.
        </DashEmpty>
      ) : (
        <>
          <div className="tdb-toolbar">
            <label className="tdb-search">
              <Search size={16} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o usuario"
                aria-label="Buscar alumno"
              />
            </label>
            <div className="tdb-seg" role="group" aria-label="Filtrar alumnos">
              <button type="button" className={rosterFilter === 'all' ? 'is-on' : ''} onClick={() => setRosterFilter('all')}>
                Todos <span className="tdb-seg__n">{students.length}</span>
              </button>
              <button type="button" className={rosterFilter === 'pending' ? 'is-on' : ''} onClick={() => setRosterFilter('pending')}>
                <KeyRound size={13} /> Sin contraseña <span className="tdb-seg__n">{needsPasswordStudents.length}</span>
              </button>
            </div>
          </div>

          {visibleStudents.length === 0 ? (
            <p className="tdb-muted" style={{ textAlign: 'center', fontWeight: 700, padding: '18px 0' }}>
              {rosterFilter === 'pending' && !query ? 'Todo el grupo ha creado su contraseña.' : 'Ningún alumno coincide con la búsqueda.'}
            </p>
          ) : (
            <div className="tdb-roster">
              {visibleStudents.map((student) => {
                const pending = student.password_hash === null;
                return (
                  <div key={student.id} className={`tdb-stu ${pending ? 'is-pending' : ''}`}>
                    <button
                      type="button"
                      className="tdb-stu__main"
                      onClick={() => (onViewStats ? onViewStats(student.id) : openEdit(student))}
                      aria-label={onViewStats ? `Ver informe de ${student.display_name}` : `Editar a ${student.display_name}`}
                    >
                      <span className="tdb-stu__ava">
                        <UserAvatar
                          selectedAvatarCode={student.selected_avatar_code}
                          avatarEmoji={student.avatar_emoji}
                          avatarColor={student.avatar_color}
                          size="md"
                          shape="rounded"
                          showRarityBorder
                        />
                        <span
                          className={`tdb-stu__dot ${pending ? 'tdb-stu__dot--pending' : ''}`}
                          title={pending ? 'Sin contraseña' : 'Cuenta activada'}
                        />
                      </span>
                      <span className="tdb-stu__text">
                        <span className="tdb-stu__name">{student.display_name}</span>
                        <span className="tdb-stu__user">@{student.username}</span>
                        {pending && <span className="tdb-chip tdb-chip--warn tdb-stu__flag">Sin contraseña</span>}
                      </span>
                    </button>
                    <div className="tdb-stu__acts">
                      {onViewStats && (
                        <button
                          type="button"
                          onClick={() => onViewStats(student.id)}
                          className="tdb-iconbtn tdb-iconbtn--accent tdb-iconbtn--sm"
                          title="Ver estadisticas"
                        >
                          <BarChart3 size={16} />
                        </button>
                      )}
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="tdb-iconbtn tdb-iconbtn--sm" title="Más acciones" aria-label={`Más acciones para ${student.display_name}`}>
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="tdb-menu">
                          <DropdownMenuLabel className="tdb-menu__label">{student.display_name}</DropdownMenuLabel>
                          <DropdownMenuItem className="tdb-menu__item" onSelect={() => openEdit(student)}>
                            <Pencil /> Editar alumno
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="tdb-menu__item"
                            onSelect={() => { setEditingStudent(student); setShowResetDialog(true); }}
                          >
                            <RotateCcw /> Restablecer contraseña
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="tdb-menu__item tdb-menu__item--warn"
                            onSelect={() => { setEditingStudent(student); setShowResetProgressDialog(true); }}
                          >
                            <History /> Reiniciar progreso del curso
                          </DropdownMenuItem>
                          <div className="tdb-menu__sep" role="separator" />
                          <DropdownMenuItem
                            className="tdb-menu__item tdb-menu__item--danger"
                            onSelect={() => { setEditingStudent(student); setShowDeleteDialog(true); }}
                          >
                            <Trash2 /> Eliminar alumno
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Dialogo anadir alumnos en lote */}
      <Dialog open={showBulkDialog} onOpenChange={(open) => { if (!open) closeBulkDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Añadir alumnos a {groupName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombres de usuario (uno por línea)</Label>
              <textarea
                className="w-full min-h-[200px] rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-y font-mono"
                placeholder={"maria.garcia\npedro.lopez\nana.martinez\ncarlos.ruiz"}
                value={bulkUsernames}
                onChange={(e) => setBulkUsernames(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-400">
                Los alumnos deberán crear su contraseña en su primer inicio de sesión usando el código de grupo <span className="font-mono font-bold text-purple-600">{groupCode}</span>
              </p>
            </div>

            {bulkResult && (
              <div className="rounded-lg border p-3 space-y-2">
                {bulkResult.created > 0 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{bulkResult.created} alumno{bulkResult.created !== 1 ? 's' : ''} creado{bulkResult.created !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {bulkResult.created === 0 && (!bulkResult.errors || bulkResult.errors.length === 0) && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">No se pudo crear ningún alumno. Los nombres de usuario ya están en uso.</span>
                  </div>
                )}
                {bulkResult.errors?.length > 0 && (
                  <div className="flex items-start gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">No se pudieron crear:</p>
                      <ul className="list-disc list-inside text-xs mt-1">
                        {bulkResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeBulkDialog}>
              {bulkResult ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!bulkResult && (
              <Button
                onClick={handleBulkCreate}
                disabled={loading || !bulkUsernames.trim()}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
              >
                {loading ? 'Creando...' : 'Crear alumnos'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo editar alumno */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar alumno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del alumno</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`text-2xl p-1.5 rounded-lg transition-all ${
                      avatarEmoji === emoji
                        ? 'bg-purple-100 ring-2 ring-purple-400 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={loading || !displayName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo restablecer contrasena */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restablecer contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la contraseña de <strong>{editingStudent?.display_name}</strong>.
              El alumno deberá crear una nueva contraseña en su próximo inicio de sesión
              usando su nombre de usuario y el código de grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogo reiniciar progreso del curso */}
      <AlertDialog open={showResetProgressDialog} onOpenChange={setShowResetProgressDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar progreso del curso</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Vas a reiniciar el progreso de <strong>{editingStudent?.display_name}</strong> en el grupo <strong>{groupName}</strong>.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="font-semibold text-green-800 mb-1">Se preserva</p>
                    <ul className="list-disc list-inside text-xs text-green-900 space-y-0.5">
                      <li>XP y nivel</li>
                      <li>Avatares desbloqueados</li>
                      <li>Insignias</li>
                      <li>Historial de partidas</li>
                      <li>Tiempo total de juego</li>
                      <li>Contraseña</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="font-semibold text-amber-800 mb-1">Se reinicia</p>
                    <ul className="list-disc list-inside text-xs text-amber-900 space-y-0.5">
                      <li>Notas de tareas del grupo</li>
                      <li>Duelos del grupo</li>
                      <li>Batallas del periodo</li>
                      <li>Bonus de duelos y batallas</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Las tareas asignadas se mantienen activas. El alumno tendrá que volver a hacer los exámenes para que cuenten en la nota del curso.
                  {' '}Solo afecta a este grupo; sus datos en otros grupos no cambian.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetCourseProgress}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? 'Reiniciando...' : 'Reiniciar progreso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogo confirmar eliminacion */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar alumno</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a "{editingStudent?.display_name}"?
              Se eliminarán todos sus datos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashCard>
  );
}
