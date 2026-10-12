import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Trash2, Pencil, CheckCircle2, Clock, Users, User, AlertTriangle, Filter, GraduationCap, CalendarDays, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashCard, DashButton, DashEmpty, ProgressRing } from '@/components/dashboard/kit';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import AssignTaskDialog from './AssignTaskDialog';
import AssignmentScoresDialog from './AssignmentScoresDialog';
import EditAssignmentDialog from './EditAssignmentDialog';
import BrandLoader from '@/components/ui/BrandLoader';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Quita el emoji inicial del nombre de la app cuando ya se pinta su icono
const cleanName = (appId, name) => (
  appId && hasAppIcon(appId) ? String(name || '').replace(/^[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\s]+/u, '') || name : name
);

// Texto relativo de la fecha límite ("Vence en 3 días", "Venció ayer"…)
function dueLabel(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const now = new Date();
  const day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(due) - day(now)) / 86400000);
  if (due < now) {
    if (days >= 0) return 'Venció hoy';
    if (days === -1) return 'Venció ayer';
    return `Venció hace ${-days} días`;
  }
  if (days <= 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  return `Vence en ${days} días`;
}

export default function AssignmentsPanel({ groupId, groupName, groupLevel, groupGrade, groupSubject, students, onSummary }) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  // Filtro local por estado (solo presentación)
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'overdue'

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

  // Resumen para los indicadores del grupo (derivado de lo ya cargado)
  const summary = useMemo(() => {
    const now = new Date();
    let active = 0; let overdue = 0; let done = 0; let completedSum = 0; let targetSum = 0;
    for (const a of assignments) {
      if (a.due_date && new Date(a.due_date) < now) overdue += 1; else active += 1;
      if (a.completed_count >= a.total_students) done += 1;
      completedSum += Number(a.completed_count) || 0;
      targetSum += Number(a.total_students) || 0;
    }
    return { total: assignments.length, active, overdue, done, completedSum, targetSum };
  }, [assignments]);

  useEffect(() => {
    if (onSummary) onSummary(loading ? null : summary);
  }, [summary, loading, onSummary]);

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

  const teacherIds = [...new Set(assignments.map(a => a.teacher_id).filter(Boolean))];
  const teacherNames = {};
  assignments.forEach(a => { if (a.teacher_id && a.teacher_name) teacherNames[a.teacher_id] = a.teacher_name; });
  const now = new Date();
  const visible = assignments
    .filter(asg => teacherFilter === 'all' || asg.teacher_id === teacherFilter)
    .filter((asg) => {
      if (statusFilter === 'all') return true;
      const overdue = asg.due_date && new Date(asg.due_date) < now;
      return statusFilter === 'overdue' ? overdue : !overdue;
    });

  return (
    <DashCard
      icon={ClipboardList}
      title={`Tareas de ${groupName}`}
      subtitle={assignments.length > 0
        ? `${summary.total} tarea${summary.total !== 1 ? 's' : ''} · ${summary.active} activa${summary.active !== 1 ? 's' : ''} · ${summary.done} completada${summary.done !== 1 ? 's' : ''} por todos`
        : 'Asigna apps en modo examen con nota mínima, peso y evaluación'}
      tone="amber"
      actions={(
        <DashButton size="sm" icon={Plus} onClick={() => setShowCreateDialog(true)}>
          Asignar tarea
        </DashButton>
      )}
    >
      {loading ? (
        <div className="tdb-loading">
          <BrandLoader variant="inline" />
        </div>
      ) : assignments.length === 0 ? (
        <DashEmpty
          title="No hay tareas asignadas a este grupo"
          action={<DashButton variant="amber" icon={Plus} onClick={() => setShowCreateDialog(true)}>Asignar la primera</DashButton>}
        >
          Las tareas cuentan para la nota de la evaluación en curso del alumnado.
        </DashEmpty>
      ) : (
        <>
          <div className="tdb-toolbar">
            <div className="tdb-seg" role="group" aria-label="Filtrar por estado">
              <button type="button" className={statusFilter === 'all' ? 'is-on' : ''} onClick={() => setStatusFilter('all')}>
                Todas <span className="tdb-seg__n">{summary.total}</span>
              </button>
              <button type="button" className={statusFilter === 'active' ? 'is-on' : ''} onClick={() => setStatusFilter('active')}>
                <Clock size={13} /> Activas <span className="tdb-seg__n">{summary.active}</span>
              </button>
              <button type="button" className={statusFilter === 'overdue' ? 'is-on' : ''} onClick={() => setStatusFilter('overdue')}>
                <AlertTriangle size={13} /> Vencidas <span className="tdb-seg__n">{summary.overdue}</span>
              </button>
            </div>

            {/* Filtro por docente: solo si hay tareas de varios profesores */}
            {teacherIds.length > 1 && (
              <div className="tdb-seg" role="group" aria-label="Filtrar por docente">
                <span style={{ display: 'inline-grid', placeItems: 'center', padding: '0 4px', color: 'var(--dk-ink-3)' }}>
                  <Filter size={14} />
                </span>
                <button type="button" className={teacherFilter === 'all' ? 'is-on' : ''} onClick={() => setTeacherFilter('all')}>
                  Todos
                </button>
                {teacherIds.map(tid => (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => setTeacherFilter(tid)}
                    className={teacherFilter === tid ? 'is-on' : ''}
                  >
                    <GraduationCap size={13} />
                    {teacherNames[tid] || 'Profesor'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="tdb-muted" style={{ textAlign: 'center', fontWeight: 700, padding: '18px 0' }}>
              No hay tareas con este filtro.
            </p>
          ) : (
            <div className="tdb-asg-grid">
              <AnimatePresence>
                {visible.map((asg, idx) => {
                  const isOverdue = asg.due_date && new Date(asg.due_date) < new Date();
                  const allCompleted = asg.completed_count >= asg.total_students;
                  const progress = asg.total_students > 0
                    ? Math.round((asg.completed_count / asg.total_students) * 100)
                    : 0;
                  const status = allCompleted ? 'is-done' : isOverdue ? 'is-overdue' : '';

                  return (
                    <motion.div
                      key={asg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: Math.min(idx, 10) * 0.03 }}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAssignment(asg)}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAssignment(asg); }
                      }}
                      className={`tdb-asg group ${status}`}
                      title="Ver notas de la tarea"
                    >
                      <div className="tdb-asg__top">
                        <span className="tdb-asg__icon">
                          {hasAppIcon(asg.app_id)
                            ? <AppIcon appId={asg.app_id} size={52} />
                            : <span className="tdb-asg__icon-fallback"><ClipboardList size={24} /></span>}
                        </span>
                        <div className="tdb-asg__titles">
                          <h3 className="tdb-asg__title">{asg.title || cleanName(asg.app_id, asg.app_name)}</h3>
                          {asg.title && <span className="tdb-asg__app">{cleanName(asg.app_id, asg.app_name)}</span>}
                        </div>
                        <div className="tdb-asg__tools">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingAssignment(asg); }}
                            className="tdb-iconbtn tdb-iconbtn--sm"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDeletingId(asg.id); setShowDeleteDialog(true); }}
                            className="tdb-iconbtn tdb-iconbtn--sm tdb-iconbtn--danger"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="tdb-asg__chips">
                        {asg.student_id ? (
                          <span className="tdb-chip tdb-chip--blue"><User size={12} /> {asg.student_name}</span>
                        ) : (
                          <span className="tdb-chip tdb-chip--violet"><Users size={12} /> Grupo</span>
                        )}
                        {asg.teacher_name && (
                          <span className="tdb-chip"><GraduationCap size={12} /> {asg.teacher_name}</span>
                        )}
                        {asg.weight > 1 && <span className="tdb-chip tdb-chip--weight">×{asg.weight}</span>}
                        {asg.term && <span className="tdb-chip tdb-chip--term">{asg.term}ª Eval</span>}
                        <span className="tdb-chip" title="Nota mínima en modo examen">
                          <Target size={12} /> Mín. {asg.min_score}/10
                        </span>
                        {asg.due_date && (
                          <span className={`tdb-chip ${isOverdue ? 'tdb-chip--warn' : ''}`} title={formatDate(asg.due_date)}>
                            {isOverdue ? <AlertTriangle size={12} /> : <CalendarDays size={12} />}
                            {dueLabel(asg.due_date)} · {formatDate(asg.due_date)}
                          </span>
                        )}
                      </div>

                      {asg.description && <p className="tdb-asg__desc">{asg.description}</p>}

                      <div className="tdb-asg__foot">
                        <div className="tdb-asg__bar">
                          <div className="tdb-asg__barmeta">
                            {allCompleted ? (
                              <span className="tdb-asg__done"><CheckCircle2 size={14} /> Completada</span>
                            ) : (
                              <span>Superada por</span>
                            )}
                            <strong>{asg.completed_count}/{asg.total_students}</strong>
                          </div>
                          <span className="tdb-track"><i style={{ transform: `scaleX(${progress / 100})` }} /></span>
                        </div>
                        <ProgressRing
                          value={progress}
                          max={100}
                          size={50}
                          stroke={10}
                          tone={allCompleted ? 'good' : isOverdue ? 'amber' : 'violet'}
                          label={`${progress}% completada`}
                        >
                          <span className="tdb-asg__pct">{progress}%</span>
                        </ProgressRing>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
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
              ¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.
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
    </DashCard>
  );
}
