import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, ChevronRight, Swords, Users, User, Check, Home, Info, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashButton, ProgressRing } from '@/components/dashboard/kit';
import { getLevels, getGrades, getSubjects, getApps } from '@/apps/appCatalog';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';
import { teacherCreateDuelAssignment } from '@/services/duelService';
import './teacherPanels.css';

// ── Piezas de presentación (también las usa EditAssignmentDialog) ───────────

const WEIGHTS = [
  { v: 1, label: 'x1', hint: 'Normal' },
  { v: 2, label: 'x2', hint: 'Cuenta doble' },
  { v: 3, label: 'x3', hint: 'Cuenta triple' },
];
const TERMS = [
  { v: 1, label: '1ª Evaluación' },
  { v: 2, label: '2ª Evaluación' },
  { v: 3, label: '3ª Evaluación' },
];
const LEVEL_EMOJI = { primaria: '🎒', eso: '🧪', bachillerato: '🎓' };
const QUICK_SCORES = [0, 3, 5, 7, 8, 9, 10];

const bandColor = (v) => (v >= 8 ? '#10b981' : v >= 5 ? '#3b82f6' : '#ef4444');
const fmtScore = (v) => Number(v).toLocaleString('es-ES', { maximumFractionDigits: 1 });

// Paso numerado del formulario (el número pasa a ✓ cuando está completo).
export function Step({ n, title, hint, done = false, children }) {
  return (
    <section className={`tp-step ${done ? 'is-done' : ''}`}>
      <div className="tp-step__head">
        <span className="tp-step__num">{done ? <Check size={16} strokeWidth={3} /> : n}</span>
        <h3 className="tp-step__title">{title}</h3>
        {hint && <span className="tp-step__hint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

// Peso en la nota final (x1 · x2 · x3) como monedas.
export function WeightPicker({ value, onChange }) {
  return (
    <div className="tp-weights">
      {WEIGHTS.map(opt => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className={`tp-choice tp-weight ${value === opt.v ? 'is-on' : ''}`}
          aria-pressed={value === opt.v}
        >
          <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>
          <span className="tp-weight__coins" aria-hidden="true">
            {Array.from({ length: opt.v }).map((_, i) => <i key={i} />)}
          </span>
          <span className="tp-weight__x">{opt.label}</span>
          <span className="tp-weight__hint">{opt.hint}</span>
        </button>
      ))}
    </div>
  );
}

// Evaluación (1ª · 2ª · 3ª) como control segmentado.
export function TermPicker({ value, onChange }) {
  return (
    <div className="tp-seg tp-seg--rose" role="radiogroup" aria-label="Evaluación">
      {TERMS.map(opt => (
        <button
          key={opt.v}
          type="button"
          role="radio"
          aria-checked={value === opt.v}
          onClick={() => onChange(opt.v)}
          className={`tp-seg__btn ${value === opt.v ? 'is-on' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function AppGlyph({ appId, size = 48 }) {
  return hasAppIcon(appId)
    ? <AppIcon appId={appId} size={size} />
    : <span className="tp-apptile__fallback" style={{ width: size, height: size }}>🎮</span>;
}

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

  const showTarget = !isDuel && !studentId && students && students.length > 0;
  const submitDisabled = loading || (isDuel ? !duelApp : (!selectedApp || (targetType === 'student' && !targetStudentId)));
  let stepN = 1;
  const nextStep = () => { stepN += 1; return stepN; };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="tp-root tp-dialog tp-dialog--lg">
        {/* Cabecera */}
        <header className={`tp-dhead ${isDuel ? 'tp-dhead--duel' : ''}`}>
          <div className="tp-dhead__row">
            <span className="tp-dhead__icon">{isDuel ? <Swords size={26} /> : <ClipboardList size={26} />}</span>
            <div className="tp-dhead__text">
              <DialogTitle className="tp-dhead__title">Asignar tarea a {groupName}</DialogTitle>
              <DialogDescription className="tp-dhead__sub">
                {isDuel
                  ? 'Duelos 1 vs 1 entre alumnos de nota parecida'
                  : 'Elige la app, cómo se evalúa y para quién es'}
              </DialogDescription>
            </div>
          </div>
        </header>

        <div className="tp-dbody">
          <div className="tp-steps">
            {/* Tipo de tarea */}
            <Step n={1} title="Tipo de tarea" done>
              <div className="tp-choices">
                <button
                  type="button"
                  onClick={() => setTaskType('standard')}
                  className={`tp-choice dk-tone-indigo ${taskType === 'standard' ? 'is-on' : ''}`}
                  aria-pressed={taskType === 'standard'}
                >
                  <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>
                  <span className="tp-choice__icon"><ClipboardList size={22} /></span>
                  <span className="tp-choice__text">
                    <span className="tp-choice__title">Estándar</span>
                    <span className="tp-choice__desc">Una app con nota mínima, peso y evaluación</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('duel')}
                  className={`tp-choice dk-tone-pink ${taskType === 'duel' ? 'is-on' : ''}`}
                  aria-pressed={taskType === 'duel'}
                >
                  <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>
                  <span className="tp-choice__icon"><Swords size={22} /></span>
                  <span className="tp-choice__text">
                    <span className="tp-choice__title">Duelo 1 vs 1</span>
                    <span className="tp-choice__desc">Parejas por nota · +0,10 al ganador</span>
                  </span>
                </button>
              </div>
              {isDuel && (
                <p className="tp-help" style={{ marginTop: 10 }}>
                  Los alumnos del grupo se emparejarán automáticamente por nota similar. Cada pareja juega un duelo oculto.
                </p>
              )}
            </Step>

            {/* Duelo */}
            {isDuel && (
              <>
                <Step n={2} title="App del duelo" hint="Juegos con modo 1 vs 1" done={!!duelApp}>
                  <div className="tp-apps tp-apps--wide">
                    {DUELABLE_APPS.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setDuelAppId(a.id)}
                        className={`tp-choice tp-choice--col tp-apptile dk-tone-pink ${duelAppId === a.id ? 'is-on' : ''}`}
                        aria-pressed={duelAppId === a.id}
                      >
                        <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>
                        <span className="tp-apptile__icon"><AppGlyph appId={a.id} size={48} /></span>
                        <span className="tp-choice__text">
                          <span className="tp-choice__title">{a.name}</span>
                          <span className="tp-choice__desc">{a.description}</span>
                        </span>
                        {a.duel?.bestOf > 1 && (
                          <span className="tp-chip tp-chip--amber">Al mejor de {a.duel.bestOf}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="tp-note tp-note--rose" style={{ marginTop: 12 }}>
                    <Trophy size={18} />
                    <span>
                      <strong>+0,10</strong> al ganador de cada pareja (suma al bonus de duelos, tope +0,5).
                      El perdedor <strong>no tiene penalización</strong>.
                    </span>
                  </div>
                </Step>

                <Step n={3} title="Detalles" hint="Opcional">
                  <div className="tp-fields">
                    <div className="tp-field">
                      <label className="tp-label" htmlFor="asg-duel-title">Título</label>
                      <input
                        id="asg-duel-title"
                        className="tp-input"
                        placeholder="Ej: Duelo de vocabulario"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="tp-field">
                      <label className="tp-label" htmlFor="asg-duel-due">Fecha límite (opcional)</label>
                      <input id="asg-duel-due" className="tp-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                  </div>
                </Step>
              </>
            )}

            {/* Destino */}
            {showTarget && (
              <Step n={nextStep()} title="Asignar a" done={targetType === 'group' || !!targetStudentId}>
                <div className="tp-seg">
                  <button
                    type="button"
                    onClick={() => { setTargetType('group'); setTargetStudentId(null); }}
                    className={`tp-seg__btn ${targetType === 'group' ? 'is-on' : ''}`}
                  >
                    <Users size={16} /> Todo el grupo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('student')}
                    className={`tp-seg__btn ${targetType === 'student' ? 'is-on' : ''}`}
                  >
                    <User size={16} /> Un alumno
                  </button>
                </div>
                {targetType === 'student' && (
                  <select
                    className="tp-select"
                    style={{ marginTop: 10 }}
                    value={targetStudentId || ''}
                    onChange={(e) => setTargetStudentId(e.target.value || null)}
                  >
                    <option value="">Selecciona un alumno...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.avatar_emoji} {s.display_name}</option>
                    ))}
                  </select>
                )}
              </Step>
            )}

            {/* Cascading app selection */}
            {!isDuel && <>
            <Step n={nextStep()} title="Seleccionar app" hint={selectedApp ? null : 'Etapa → curso → asignatura → app'} done={!!selectedApp}>
              {/* Show selected app or the cascading picker */}
              {selectedApp ? (
                <div className="tp-picked">
                  <span className="tp-picked__icon"><AppGlyph appId={selectedApp.id} size={60} /></span>
                  <div className="tp-picked__body">
                    <p className="tp-picked__name">{selectedApp.name}</p>
                    {selectionSummary.length > 0 && (
                      <p className="tp-picked__path">
                        {selectionSummary.map((s, i) => (
                          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            {i > 0 && <ChevronRight size={13} />}
                            {s}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  <DashButton
                    variant="soft"
                    size="sm"
                    onClick={() => {
                      setSelectedLevel(null);
                      setSelectedGrade(null);
                      setSelectedSubject(null);
                      setSelectedApp(null);
                    }}
                  >
                    Cambiar
                  </DashButton>
                </div>
              ) : (
                <div className="tp-picker">
                  {/* Breadcrumb */}
                  <nav className="tp-crumbs" aria-label="Selección">
                    <button
                      type="button"
                      onClick={() => { setSelectedLevel(null); setSelectedGrade(null); setSelectedSubject(null); }}
                      className={`tp-crumb ${selectionSummary.length === 0 ? 'is-current' : ''}`}
                    >
                      <Home size={13} /> Inicio
                    </button>
                    {selectedLevel && (
                      <>
                        <ChevronRight size={14} className="tp-crumbs__sep" />
                        <button
                          type="button"
                          onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }}
                          className={`tp-crumb ${selectedGrade ? '' : 'is-current'}`}
                        >
                          {levels.find(l => l.id === selectedLevel)?.label}
                        </button>
                      </>
                    )}
                    {selectedGrade && (
                      <>
                        <ChevronRight size={14} className="tp-crumbs__sep" />
                        <button
                          type="button"
                          onClick={() => { setSelectedSubject(null); }}
                          className={`tp-crumb ${selectedSubject ? '' : 'is-current'}`}
                        >
                          {grades.find(g => g.id === selectedGrade)?.label}
                        </button>
                      </>
                    )}
                    {selectedSubject && (
                      <>
                        <ChevronRight size={14} className="tp-crumbs__sep" />
                        <span className="tp-crumb is-current">
                          {subjects.find(s => s.id === selectedSubject)?.nombre}
                        </span>
                      </>
                    )}
                  </nav>

                  <div className="tp-picker__grid">
                    {/* Step 1: Level */}
                    {!selectedLevel && levels.map(level => (
                      <button key={level.id} type="button" onClick={() => setSelectedLevel(level.id)} className="tp-pick">
                        <span className="tp-pick__emoji">{LEVEL_EMOJI[level.id] || '📚'}</span>
                        <span className="tp-pick__label">{level.label}</span>
                        <ChevronRight size={16} className="tp-pick__chev" />
                      </button>
                    ))}

                    {/* Step 2: Grade */}
                    {selectedLevel && !selectedGrade && grades.map(grade => (
                      <button key={grade.id} type="button" onClick={() => setSelectedGrade(grade.id)} className="tp-pick">
                        <span className="tp-pick__num">{grade.id}º</span>
                        <span className="tp-pick__label">{grade.label}</span>
                        <ChevronRight size={16} className="tp-pick__chev" />
                      </button>
                    ))}

                    {/* Step 3: Subject */}
                    {selectedLevel && selectedGrade && !selectedSubject && subjects.map(subj => (
                      <button key={subj.id} type="button" onClick={() => setSelectedSubject(subj.id)} className="tp-pick">
                        <span className="tp-pick__emoji">{subj.icon}</span>
                        <span className="tp-pick__label">{subj.nombre}</span>
                        <ChevronRight size={16} className="tp-pick__chev" />
                      </button>
                    ))}

                    {/* Step 4: App */}
                    {selectedLevel && selectedGrade && selectedSubject && apps.map(app => (
                      <button key={app.id} type="button" onClick={() => setSelectedApp(app)} className="tp-pick tp-pick--app">
                        <AppGlyph appId={app.id} size={46} />
                        <span className="tp-pick__label">{app.name}</span>
                      </button>
                    ))}

                    {selectedLevel && selectedGrade && selectedSubject && apps.length === 0 && (
                      <p className="tp-picker__empty">No hay apps disponibles</p>
                    )}
                  </div>
                </div>
              )}
            </Step>

            {/* Cómo se evalúa: nota mínima, peso y evaluación */}
            <Step n={nextStep()} title="Cómo se evalúa">
              <div className="tp-field">
                <span className="tp-label">Nota mínima para aprobar (0-10)</span>
                <div className="tp-score" style={{ '--rc': bandColor(minScore) }}>
                  <ProgressRing value={minScore} max={10} size={84} stroke={9} label={`Nota mínima ${minScore}`}>
                    <span>
                      <span className="tp-score__ring-num">{fmtScore(minScore)}</span>
                      <span className="tp-score__ring-sub">/10</span>
                    </span>
                  </ProgressRing>
                  <div className="tp-score__ctrl">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={minScore}
                      onChange={(e) => setMinScore(parseFloat(e.target.value))}
                      className="tp-range"
                      style={{ '--p': `${minScore * 10}%` }}
                      aria-label="Nota mínima para aprobar"
                    />
                    <div className="tp-quick">
                      {QUICK_SCORES.map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setMinScore(v)}
                          className={`tp-quick__btn ${minScore === v ? 'is-on' : ''}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <span className="tp-score__hint">Sobre 10 en modo examen</span>
                  </div>
                </div>
              </div>

              <div className="tp-field" style={{ marginTop: 16 }}>
                <span className="tp-label">Peso en la nota final</span>
                <WeightPicker value={weight} onChange={setWeight} />
              </div>

              <div className="tp-field" style={{ marginTop: 16 }}>
                <span className="tp-label">Evaluación</span>
                <TermPicker value={term} onChange={setTerm} />
              </div>
            </Step>

            {/* Detalles opcionales */}
            <Step n={nextStep()} title="Detalles" hint="Opcional">
              <div className="tp-fields">
                <div className="tp-field">
                  <label className="tp-label" htmlFor="asg-title">Título (opcional)</label>
                  <input
                    id="asg-title"
                    className="tp-input"
                    placeholder="Ej: Practica de sumas"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="tp-field">
                  <label className="tp-label" htmlFor="asg-due">Fecha límite (opcional)</label>
                  <input
                    id="asg-due"
                    className="tp-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="tp-field tp-field--full">
                  <label className="tp-label" htmlFor="asg-desc">Instrucciones (opcional)</label>
                  <textarea
                    id="asg-desc"
                    className="tp-textarea"
                    placeholder="Instrucciones para los alumnos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </Step>
            </>}
          </div>
        </div>

        {/* Pie: resumen + acciones */}
        <footer className="tp-dfoot">
          <div className="tp-dfoot__info">
            {isDuel ? (
              duelApp
                ? <><AppGlyph appId={duelApp.id} size={34} /><span>Duelo · {duelApp.name}</span></>
                : <><Info size={18} /><span>Elige el juego del duelo</span></>
            ) : (
              selectedApp
                ? <><AppGlyph appId={selectedApp.id} size={34} /><span>{selectedApp.name} · mín. {fmtScore(minScore)} · x{weight} · {term}ª ev.</span></>
                : <><Info size={18} /><span>Elige una app para continuar</span></>
            )}
          </div>
          <div className="tp-dfoot__actions">
            <DashButton variant="soft" onClick={() => onOpenChange(false)}>Cancelar</DashButton>
            <DashButton
              variant={isDuel ? 'rose' : 'primary'}
              onClick={handleCreate}
              disabled={submitDisabled}
              icon={isDuel ? Swords : Check}
            >
              {loading ? 'Asignando...' : isDuel ? 'Crear duelos' : 'Asignar tarea'}
            </DashButton>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
