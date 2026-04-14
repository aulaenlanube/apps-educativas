import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, UserCircle, Users, RotateCcw, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';
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

const AVATAR_EMOJIS = ['🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐲', '🦋', '🌟', '🚀', '⚽', '🎨', '🎵', '📚'];

export default function StudentsPanel({ students, groupId, groupName, groupCode, onStudentsChanged, onViewStats }) {
  const { toast } = useToast();
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [bulkUsernames, setBulkUsernames] = useState('');
  const [bulkResult, setBulkResult] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🎓');

  const handleBulkCreate = async () => {
    const usernames = bulkUsernames
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (usernames.length === 0) return;
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
    if (!displayName.trim() || !editingStudent) return;
    setLoading(true);

    const { error } = await supabase
      .from('students')
      .update({
        display_name: displayName.trim(),
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

  if (!groupId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <UserCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Selecciona un grupo</p>
          <p className="text-sm">para ver y gestionar sus alumnos</p>
        </div>
      </div>
    );
  }

  // Check which students have no password set
  const needsPasswordStudents = students.filter(s => s.password_hash === null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Alumnos de {groupName}</h2>
          <p className="text-sm text-gray-500">{students.length} alumno{students.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          size="sm"
          onClick={() => { setBulkUsernames(''); setBulkResult(null); setShowBulkDialog(true); }}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Anadir alumnos
        </Button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay alumnos en este grupo</p>
          <p className="text-sm">Anade alumnos escribiendo un nombre de usuario por linea</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {students.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{student.avatar_emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800">{student.display_name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">@{student.username}</p>
                      {student.password_hash === null && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                          Sin contrasena
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {onViewStats && (
                    <button
                      onClick={() => onViewStats(student.id)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver estadisticas"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingStudent(student);
                      setDisplayName(student.display_name);
                      setAvatarEmoji(student.avatar_emoji);
                      setShowEditDialog(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Editar alumno"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingStudent(student);
                      setShowResetDialog(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Restablecer contrasena"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingStudent(student);
                      setShowDeleteDialog(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar alumno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogo anadir alumnos en lote */}
      <Dialog open={showBulkDialog} onOpenChange={(open) => { if (!open) closeBulkDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Anadir alumnos a {groupName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombres de usuario (uno por linea)</Label>
              <textarea
                className="w-full min-h-[200px] rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-y font-mono"
                placeholder={"maria.garcia\npedro.lopez\nana.martinez\ncarlos.ruiz"}
                value={bulkUsernames}
                onChange={(e) => setBulkUsernames(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-400">
                Los alumnos deberan crear su contrasena en su primer inicio de sesion usando el codigo de grupo <span className="font-mono font-bold text-purple-600">{groupCode}</span>
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
                    <span className="text-sm font-medium">No se pudo crear ningun alumno. Los nombres de usuario ya estan en uso.</span>
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
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
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
            <AlertDialogTitle>Restablecer contrasena</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara la contrasena de <strong>{editingStudent?.display_name}</strong>.
              El alumno debera crear una nueva contrasena en su proximo inicio de sesion
              usando su nombre de usuario y el codigo de grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? 'Restableciendo...' : 'Restablecer contrasena'}
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
              Estas seguro de que quieres eliminar a "{editingStudent?.display_name}"?
              Se eliminaran todos sus datos. Esta accion no se puede deshacer.
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
    </div>
  );
}
