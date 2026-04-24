import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, ChevronRight, Swords } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { getLevels, getGrades, getSubjects, getApps } from '@/apps/appCatalog';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';
import { teacherCreateDuelAssignment } from '@/services/duelService';

export default function AssignTaskDialog({ open, onOpenChange, groupId, groupName, groupLevel, groupGrade, groupSubject, students, studentId, onCreated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultLevel = groupLevel || null;
  const defaultGrade = groupLevel && groupGrade != null ? String(groupGrade) : null;
  const defaultSubject = defaultLevel && defaultGrade ? (groupSubject || null) : null;

  // Cascading selection state — preselected from group context when available
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);
  const [selectedGrade, setSelectedGrade] = useState(defaultGrade);
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject);
  const [selectedApp, setSelectedApp] = useState(null);

  // When the dialog opens or the group context changes, sync cascading defaults
  useEffect(() => {
    if (open) {
      setSelectedLevel(defaultLevel);
      setSelectedGrade(defaultGrade);
      setSelectedSubject(defaultSubject);
      setSelectedApp(null);
    }
  }, [open, defaultLevel, defaultGrade, defaultSubject]);

  // Other fields
  const [minScore, setMinScore] = useState(5);
  const [weight, setWeight] = useState(1);
  const [term, setTerm] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState(studentId ? 'student' : 'group');
  const [targetStudentId, setTargetStudentId] = useState(studentId || null);
  const [dueDate, setDueDate] = useState('');

  // Duelo (tarea tipo duel). El stake del profesor ya no se usa: el ganador
  // siempre suma +0,10 fijo y el perdedor no tiene penalizacion. Se deja un
  // valor constante por compatibilidad con el RPC.
  const [taskType, setTaskType] = useState('standard'); // 'standard' | 'duel'
  const [duelAppId, setDuelAppId] = useState(null);
  const isDuel = taskType === 'duel';
  const duelApp = useMemo(() => DUELABLE_APPS.find(a => a.id === duelAppId), [duelAppId]);

  const levels = useMemo(() => getLevels(), []);
  const grades = useMemo(() => selectedLevel ? getGrades(selectedLevel) : [], [selectedLevel]);
  const subjects = useMemo(() => (selectedLevel && selectedGrade) ? getSubjects(selectedLevel, selectedGrade) : [], [selectedLevel, selectedGrade]);
  const apps = useMemo(() => (selectedLevel && selectedGrade && selectedSubject) ? getApps(selectedLevel, selectedGrade, selectedSubject) : [], [selectedLevel, selectedGrade, selectedSubject]);

  const handleCreate = async () => {
    if (isDuel) {
      if (!duelApp || !groupId) return;
      setLoading(true);
      try {
        const userRes = await supabase.auth.getUser();
        const teacherId = userRes.data.user.id;
        const res = await teacherCreateDuelAssignment({
          teacherId, groupId,
          appId: duelApp.id, appName: duelApp.name,
          level: defaultLevel || selectedLevel,
          grade: defaultGrade || selectedGrade || '',
          subjectId: defaultSubject || selectedSubject || null,
          stake: 0.10,
          bestOf: duelApp.duel?.bestOf || 1,
          title: title.trim() || `Duelo · ${duelApp.name}`,
          dueDate: dueDate || null,
        });
        const pairsCount = res?.pairs?.length || 0;
        const hasBye = !!(res?.bye && res.bye.student_id);
        toast({
          title: 'Duelo asignado',
          description: `Se han creado ${pairsCount} duelo${pairsCount !== 1 ? 's' : ''} emparejados por nota` +
            (hasBye ? ' · 1 alumno con victoria automática (grupo impar)' : ''),
        });
        resetForm();
        onOpenChange(false);
        onCreated?.();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!selectedApp || !groupId) return;
    setLoading(true);

    const { error } = await supabase.from('assignments').insert({
      teacher_id: (await supabase.auth.getUser()).data.user.id,
      group_id: groupId,
      student_id: targetType === 'student' ? targetStudentId : null,
      app_id: selectedApp.id,
      app_name: selectedApp.name,
      level: selectedLevel,
      grade: selectedGrade,
      subject_id: selectedSubject,
      min_score: minScore,
      weight,
      term,
      title: title.trim() || null,
      description: description.trim() || null,
      due_date: dueDate || null,
    });

    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Tarea asignada' });
      resetForm();
      onOpenChange(false);
      onCreated?.();
    }
  };

  const resetForm = () => {
    setSelectedLevel(defaultLevel);
    setSelectedGrade(defaultGrade);
    setSelectedSubject(defaultSubject);
    setSelectedApp(null);
    setMinScore(5);
    setWeight(1);
    setTerm(1);
    setTitle('');
    setDescription('');
    setDueDate('');
    setTargetType(studentId ? 'student' : 'group');
    setTargetStudentId(studentId || null);
    setTaskType('standard');
    setDuelAppId(null);
  };

  // Breadcrumb for current selection
  const selectionSummary = [
    selectedLevel && levels.find(l => l.id === selectedLevel)?.label,
    selectedGrade && grades.find(g => g.id === selectedGrade)?.label,
    selectedSubject && subjects.find(s => s.id === selectedSubject)?.nombre,
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            Asignar tarea a {groupName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de tarea */}
          <div className="space-y-2">
            <Label>Tipo de tarea</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTaskType('standard')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  taskType === 'standard'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" /> Estándar
              </button>
              <button
                type="button"
                onClick={() => setTaskType('duel')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  taskType === 'duel'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Swords className="w-4 h-4" /> Duelo 1 vs 1
              </button>
            </div>
            {isDuel && (
              <p className="text-[11px] text-violet-700">
                Los alumnos del grupo se emparejarán automáticamente por nota similar. Cada pareja juega un duelo oculto.
              </p>
            )}
          </div>

          {/* Duelo */}
          {isDuel && (
            <>
              <div className="space-y-2">
                <Label>App del duelo</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DUELABLE_APPS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setDuelAppId(a.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        duelAppId === a.id
                          ? 'border-violet-500 bg-violet-50 shadow-sm'
                          : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-bold text-slate-800">{a.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{a.description}</p>
                      {a.duel?.bestOf > 1 && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                          Al mejor de {a.duel.bestOf}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs text-violet-700 leading-snug">
                <strong>+0,10</strong> al ganador de cada pareja (suma al bonus de duelos, tope +0,5).
                El perdedor <strong>no tiene penalización</strong>.
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Ej: Duelo de vocabulario"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha límite (opcional)</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </>
          )}

          {/* Destino */}
          {!isDuel && !studentId && students && students.length > 0 && (
            <div className="space-y-2">
              <Label>Asignar a</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setTargetType('group'); setTargetStudentId(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    targetType === 'group'
                      ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todo el grupo
                </button>
                <button
                  onClick={() => setTargetType('student')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    targetType === 'student'
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Un alumno
                </button>
              </div>
              {targetType === 'student' && (
                <select
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  value={targetStudentId || ''}
                  onChange={(e) => setTargetStudentId(e.target.value || null)}
                >
                  <option value="">Selecciona un alumno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.avatar_emoji} {s.display_name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Cascading app selection */}
          {!isDuel && <>
          <div className="space-y-2">
            <Label>Seleccionar app</Label>

            {/* Show selected app or the cascading picker */}
            {selectedApp ? (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-700">{selectedApp.name}</span>
                  <button
                    onClick={() => {
                      setSelectedLevel(null);
                      setSelectedGrade(null);
                      setSelectedSubject(null);
                      setSelectedApp(null);
                    }}
                    className="text-xs text-purple-500 hover:text-purple-700 font-medium"
                  >
                    Cambiar
                  </button>
                </div>
                {selectionSummary.length > 0 && (
                  <p className="text-xs text-purple-500 flex items-center gap-1">
                    {selectionSummary.map((s, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="w-3 h-3" />}
                        {s}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Breadcrumb */}
                {selectionSummary.length > 0 && (
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => { setSelectedLevel(null); setSelectedGrade(null); setSelectedSubject(null); }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Inicio
                    </button>
                    {selectedLevel && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <button
                          onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }}
                          className={`text-xs font-medium ${selectedGrade ? 'text-purple-600 hover:text-purple-800' : 'text-slate-700'}`}
                        >
                          {levels.find(l => l.id === selectedLevel)?.label}
                        </button>
                      </>
                    )}
                    {selectedGrade && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <button
                          onClick={() => { setSelectedSubject(null); }}
                          className={`text-xs font-medium ${selectedSubject ? 'text-purple-600 hover:text-purple-800' : 'text-slate-700'}`}
                        >
                          {grades.find(g => g.id === selectedGrade)?.label}
                        </button>
                      </>
                    )}
                    {selectedSubject && (
                      <>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-700">
                          {subjects.find(s => s.id === selectedSubject)?.nombre}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="relative">
                <div className="max-h-64 overflow-y-auto scrollbar-hide divide-y divide-slate-50">
                  {/* Step 1: Level */}
                  {!selectedLevel && levels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-700">{level.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}

                  {/* Step 2: Grade */}
                  {selectedLevel && !selectedGrade && grades.map(grade => (
                    <button
                      key={grade.id}
                      onClick={() => setSelectedGrade(grade.id)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-700">{grade.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}

                  {/* Step 3: Subject */}
                  {selectedLevel && selectedGrade && !selectedSubject && subjects.map(subj => (
                    <button
                      key={subj.id}
                      onClick={() => setSelectedSubject(subj.id)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span>{subj.icon}</span>
                        <span className="font-medium text-slate-700">{subj.nombre}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}

                  {/* Step 4: App */}
                  {selectedLevel && selectedGrade && selectedSubject && apps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 transition-colors"
                    >
                      <span className="font-medium text-slate-700">{app.name}</span>
                    </button>
                  ))}

                  {selectedLevel && selectedGrade && selectedSubject && apps.length === 0 && (
                    <p className="text-center py-4 text-sm text-slate-400">No hay apps disponibles</p>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            )}
          </div>

          {/* Nota minima */}
          <div className="space-y-2">
            <Label>Nota minima para aprobar (0-10)</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={minScore}
                  onChange={(e) => setMinScore(parseFloat(e.target.value))}
                  className="w-40 accent-purple-600"
                />
                <span className="text-lg font-bold text-purple-700 min-w-[3ch] text-center">{minScore}</span>
              </div>
              <span className="text-sm text-slate-500">sobre 10 en modo examen</span>
            </div>
            <div className="flex gap-1.5 mt-1">
              {[0, 3, 5, 7, 8, 9, 10].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMinScore(v)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                    minScore === v
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Peso / multiplicador */}
          <div className="space-y-2">
            <Label>Peso en la nota final</Label>
            <div className="flex gap-2">
              {[
                { v: 1, label: 'x1', hint: 'Normal' },
                { v: 2, label: 'x2', hint: 'Cuenta doble' },
                { v: 3, label: 'x3', hint: 'Cuenta triple' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setWeight(opt.v)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl border transition-all ${
                    weight === opt.v
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white border-transparent shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-lg font-bold leading-tight">{opt.label}</span>
                  <span className={`text-[11px] ${weight === opt.v ? 'text-white/80' : 'text-slate-400'}`}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Evaluacion */}
          <div className="space-y-2">
            <Label>Evaluación</Label>
            <div className="flex gap-2">
              {[
                { v: 1, label: '1ª Evaluación' },
                { v: 2, label: '2ª Evaluación' },
                { v: 3, label: '3ª Evaluación' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setTerm(opt.v)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    term === opt.v
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-transparent shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titulo (opcional) */}
          <div className="space-y-2">
            <Label>Titulo (opcional)</Label>
            <Input
              placeholder="Ej: Practica de sumas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Descripcion (opcional) */}
          <div className="space-y-2">
            <Label>Instrucciones (opcional)</Label>
            <textarea
              className="w-full min-h-[60px] rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-y"
              placeholder="Instrucciones para los alumnos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Fecha limite (opcional) */}
          <div className="space-y-2">
            <Label>Fecha limite (opcional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          </>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            disabled={loading || (isDuel ? !duelApp : (!selectedApp || (targetType === 'student' && !targetStudentId)))}
            className={isDuel
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'}
          >
            {loading ? 'Asignando...' : isDuel ? 'Crear duelos' : 'Asignar tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
