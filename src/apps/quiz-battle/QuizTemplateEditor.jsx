import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Save, ArrowLeft, Search, BookOpen, Edit3,
  ChevronDown, ChevronUp, FileText, X, AlertTriangle, Check, ListOrdered, Info, Shuffle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getRoscoData } from '@/services/gameDataService';
import { DashCard, DashButton, DashEmpty, ProgressRing } from '@/components/dashboard/kit';
import BrandLoader from '@/components/ui/BrandLoader';
import { QBEmblem, QBShape, SHAPE_NAMES } from './QBArt';
import materiasData from '../../../public/data/materias.json';
import './QuizTemplateEditor.css';

const LEVELS = [
  { id: 'primaria', label: 'Primaria', grades: [1, 2, 3, 4, 5, 6] },
  { id: 'eso', label: 'ESO', grades: [1, 2, 3, 4] },
  { id: 'bachillerato', label: 'Bachillerato', grades: [1, 2] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ───────────── Piezas de presentación ───────────── */

const DIFFICULTY = {
  1: { label: 'Fácil', cls: 'is-easy' },
  2: { label: 'Media', cls: 'is-mid' },
  3: { label: 'Difícil', cls: 'is-hard' },
};

function DifficultyPill({ value }) {
  const d = DIFFICULTY[value];
  if (!d) return null;
  return <span className={`qte-diff ${d.cls}`} title={`Dificultad ${value}`}>{d.label}</span>;
}

// Las 4 respuestas con los colores y formas del juego; la correcta, marcada.
function AnswerTiles({ q }) {
  const opts = Array.isArray(q.options) ? q.options : [];
  if (opts.length === 0) {
    return (
      <p className="qte-q__solo">
        <Check size={14} /> {q.correct}
      </p>
    );
  }
  return (
    <div className="qte-answers">
      {opts.map((opt, k) => {
        const isCorrect = typeof q.correctIndex === 'number' ? k === q.correctIndex : opt === q.correct;
        return (
          <div
            key={k}
            className={`qte-ans qte-ans--c${k % 4} ${isCorrect ? 'is-correct' : ''}`}
            title={`${SHAPE_NAMES[k % 4]}${isCorrect ? ' · respuesta correcta' : ''}`}
          >
            <span className="qte-ans__shape"><QBShape kind={k % 4} size={18} /></span>
            <span className="qte-ans__text">{opt}</span>
            {isCorrect && <span className="qte-ans__ok" aria-label="Respuesta correcta"><Check size={13} strokeWidth={3.5} /></span>}
          </div>
        );
      })}
    </div>
  );
}

function ConfirmPortal({ children }) {
  return createPortal(children, document.body);
}

export default function QuizTemplateEditor({ templateId, onBack, onSaved }) {
  const { teacher } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!templateId);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [initialQCount, setInitialQCount] = useState(0); // to detect changes

  // Rosco browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [browseLevel, setBrowseLevel] = useState('primaria');
  const [browseGrade, setBrowseGrade] = useState('1');
  const [browseSubject, setBrowseSubject] = useState('');
  const [roscoPool, setRoscoPool] = useState([]);
  const [roscoLoading, setRoscoLoading] = useState(false);
  const [roscoSearch, setRoscoSearch] = useState('');

  // Custom question form
  const [showCustom, setShowCustom] = useState(false);
  const [customQ, setCustomQ] = useState('');
  const [customCorrect, setCustomCorrect] = useState('');
  const [customWrong1, setCustomWrong1] = useState('');
  const [customWrong2, setCustomWrong2] = useState('');
  const [customWrong3, setCustomWrong3] = useState('');

  const browseSubjects = useMemo(() => {
    const curso = materiasData?.[browseLevel]?.[browseGrade];
    return Array.isArray(curso) ? curso : [];
  }, [browseLevel, browseGrade]);

  // Auto-select first subject
  useEffect(() => {
    if (browseSubjects.length > 0 && !browseSubjects.find((s) => s.id === browseSubject)) {
      setBrowseSubject(browseSubjects[0].id);
    }
  }, [browseSubjects]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing template
  useEffect(() => {
    if (!templateId || !teacher?.id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.rpc('get_quiz_template', {
        p_template_id: templateId,
        p_teacher_id: teacher.id,
      });
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        const qs = Array.isArray(data.questions) ? data.questions : [];
        setQuestions(qs);
        setInitialQCount(qs.length);
      }
      setLoading(false);
    };
    load();
  }, [templateId, teacher?.id]);

  // Fetch rosco data for browser
  const handleLoadRosco = async () => {
    if (!browseSubject) return;
    setRoscoLoading(true);
    try {
      const data = await getRoscoData(browseLevel, parseInt(browseGrade, 10), browseSubject);
      setRoscoPool(
        data
          .filter((it) => it?.solucion && it?.definicion)
          .map((it) => ({
            question: String(it.definicion).trim(),
            answer: String(it.solucion).trim(),
            difficulty: it.difficulty || 2,
            materia: it.materia || browseSubject,
            letra: it.letra,
          }))
      );
    } catch (err) {
      console.error('Error loading rosco', err);
      setRoscoPool([]);
    }
    setRoscoLoading(false);
  };

  useEffect(() => {
    if (showBrowser && browseSubject) handleLoadRosco();
  }, [showBrowser, browseSubject, browseLevel, browseGrade]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered rosco items
  const filteredRosco = useMemo(() => {
    if (!roscoSearch.trim()) return roscoPool;
    const q = roscoSearch.toLowerCase();
    return roscoPool.filter(
      (it) => it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q)
    );
  }, [roscoPool, roscoSearch]);

  // Check if a rosco question is already added
  const isAdded = useCallback((question, answer) => {
    return questions.some((q) => q.question === question && q.correct === answer);
  }, [questions]);

  // Add a rosco question (auto-generate distractors)
  const addRoscoQuestion = (item) => {
    if (isAdded(item.question, item.answer)) return;

    const others = roscoPool.filter((x) => x.answer !== item.answer);
    const distractors = shuffle(others).slice(0, 3).map((x) => x.answer);

    if (distractors.length < 3) {
      toast({ title: 'No hay suficientes opciones para generar distractores', variant: 'destructive' });
      return;
    }

    const options = shuffle([item.answer, ...distractors]);
    const correctIndex = options.indexOf(item.answer);

    setQuestions((prev) => [
      ...prev,
      {
        question: item.question,
        correct: item.answer,
        options,
        correctIndex,
        difficulty: item.difficulty,
        source: 'rosco',
      },
    ]);
  };

  // Add custom question
  const addCustomQuestion = () => {
    if (!customQ.trim() || !customCorrect.trim() || !customWrong1.trim() || !customWrong2.trim() || !customWrong3.trim()) {
      toast({ title: 'Rellena todos los campos', variant: 'destructive' });
      return;
    }

    const options = shuffle([customCorrect.trim(), customWrong1.trim(), customWrong2.trim(), customWrong3.trim()]);
    const correctIndex = options.indexOf(customCorrect.trim());

    setQuestions((prev) => [
      ...prev,
      {
        question: customQ.trim(),
        correct: customCorrect.trim(),
        options,
        correctIndex,
        difficulty: 2,
        source: 'custom',
      },
    ]);

    setCustomQ('');
    setCustomCorrect('');
    setCustomWrong1('');
    setCustomWrong2('');
    setCustomWrong3('');
    setShowCustom(false);
  };

  // Remove question
  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Move question
  const moveQuestion = (index, dir) => {
    setQuestions((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  // Dirty check: has the user added/removed questions since load?
  const isDirty = questions.length !== initialQCount;

  // Save (skipValidation = true when saving from exit dialog)
  const handleSave = async (skipValidation = false) => {
    if (!skipValidation && questions.length < 4) {
      toast({ title: 'Anade al menos 4 preguntas', variant: 'destructive' });
      return;
    }

    const saveName = name.trim() || `Batalla ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    setSaving(true);
    try {
      const { data } = await supabase.rpc('save_quiz_template', {
        p_teacher_id: teacher.id,
        p_template_id: templateId || null,
        p_name: saveName,
        p_description: description.trim(),
        p_questions: questions,
      });

      if (data?.success) {
        toast({ title: 'Plantilla guardada' });
        onSaved?.(data.id);
      } else {
        toast({ title: 'Error al guardar', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Save template error', err);
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
    setSaving(false);
  };

  // Back with unsaved changes check
  const handleBack = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="qte-loading">
        <BrandLoader variant="inline" label="Cargando batalla…" />
      </div>
    );
  }

  // ── Presentación ──
  const saveDisabled = saving || questions.length < 4 || !name.trim();
  const missing = Math.max(0, 4 - questions.length);
  const roscoCount = questions.filter((q) => q.source === 'rosco').length;
  const customCount = questions.length - roscoCount;

  return (
    <div className="qte">
      {/* Exit confirmation modal */}
      <ConfirmPortal>
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              key="qte-exit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="qte-portal qte-overlay"
              onClick={() => setShowExitConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.94, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="qte-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="qte-exit-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="qte-dialog__head">
                  <span className="qte-dialog__icon"><AlertTriangle size={24} /></span>
                  <div>
                    <h3 id="qte-exit-title">Cambios sin guardar</h3>
                    <p className="qte-dialog__sub">Tienes {questions.length} pregunta{questions.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="qte-dialog__text">
                  Has modificado preguntas de esta plantilla. Si sales ahora sin guardar, los cambios se perderán.
                </p>
                <div className="qte-dialog__actions">
                  <button
                    type="button"
                    onClick={() => { setShowExitConfirm(false); onBack(); }}
                    className="qte-btn-ghost-danger"
                  >
                    Salir sin guardar
                  </button>
                  <DashButton
                    variant="emerald"
                    icon={Save}
                    onClick={async () => { setShowExitConfirm(false); await handleSave(true); }}
                    disabled={saving || questions.length === 0}
                  >
                    Guardar y salir
                  </DashButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ConfirmPortal>

      {/* ═══ Cabecera ═══ */}
      <header className="qte-head">
        <div className="qte-head__art" aria-hidden="true">
          <span className="qte-head__spot" />
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className={`qte-head__shape qte-head__shape--${k}`}><QBShape kind={k} size={22} /></span>
          ))}
        </div>
        <div className="qte-head__top">
          <button type="button" onClick={handleBack} className="qte-back">
            <ArrowLeft size={16} /> Volver
          </button>
          <span className="qte-head__kicker">{templateId ? 'Editar batalla' : 'Nueva batalla'}</span>
        </div>
        <div className="qte-head__main">
          <span className="qte-head__emblem"><QBEmblem size={84} /></span>
          <div className="qte-head__text">
            <h2 className="qte-head__title">{name.trim() || 'Batalla sin nombre'}</h2>
            <p className="qte-head__desc">
              {description.trim() || 'Elige preguntas del banco del Rosco o escribe las tuyas. Cada pregunta tiene 4 respuestas.'}
            </p>
          </div>
          <div className="qte-head__side">
            <div className="qte-counter">
              <ProgressRing value={Math.min(questions.length, 4)} max={4} size={66} stroke={10} tone={missing === 0 ? 'good' : 'amber'} label={`${questions.length} preguntas`}>
                <span className="qte-counter__n">{questions.length}</span>
              </ProgressRing>
              <span className="qte-counter__text">
                <strong>{questions.length === 1 ? 'pregunta' : 'preguntas'}</strong>
                <small>{missing > 0 ? `Mínimo 4 · faltan ${missing}` : 'Mínimo alcanzado'}</small>
              </span>
            </div>
            <DashButton variant="emerald" size="lg" icon={Save} onClick={handleSave} disabled={saveDisabled}>
              {saving ? 'Guardando…' : 'Guardar'}
            </DashButton>
          </div>
        </div>
      </header>

      {/* ═══ Avisos de validación ═══ */}
      {!saving && (!name.trim() || missing > 0) && (
        <div className="qte-notice" role="status">
          <Info size={18} />
          <span>
            Para guardar
            {!name.trim() && <> ponle un <b>nombre</b> a la batalla</>}
            {!name.trim() && missing > 0 && ' y'}
            {missing > 0 && <> añade <b>{missing} pregunta{missing !== 1 ? 's' : ''} más</b> (mínimo 4)</>}
            .
          </span>
        </div>
      )}

      {/* ═══ Datos ═══ */}
      <DashCard icon={FileText} tone="violet" title="Datos de la batalla" subtitle="Así la verás al elegirla en «Iniciar batalla»">
        <div className="qte-fields">
          <label className="qte-field">
            <span className="qte-field__label">
              Nombre <em>*</em>
              <span className="qte-field__count">{name.length}/80</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Repaso Tema 5 Lengua"
              maxLength={80}
              className="qte-input"
            />
          </label>
          <label className="qte-field">
            <span className="qte-field__label">
              Descripción
              <span className="qte-field__count">{description.length}/200</span>
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
              maxLength={200}
              className="qte-input"
            />
          </label>
        </div>
      </DashCard>

      {/* ═══ Añadir preguntas ═══ */}
      <div className="qte-sources" role="group" aria-label="Añadir preguntas">
        <button
          type="button"
          onClick={() => { setShowBrowser(true); setShowCustom(false); }}
          className={`qte-source qte-source--rosco ${showBrowser ? 'is-on' : ''}`}
          aria-pressed={showBrowser}
        >
          <span className="qte-source__ico"><BookOpen size={22} /></span>
          <span className="qte-source__text">
            <strong>Buscar en roscos</strong>
            <small>Definiciones del Rosco por curso y asignatura</small>
          </span>
        </button>
        <button
          type="button"
          onClick={() => { setShowCustom(true); setShowBrowser(false); }}
          className={`qte-source qte-source--custom ${showCustom ? 'is-on' : ''}`}
          aria-pressed={showCustom}
        >
          <span className="qte-source__ico"><Edit3 size={22} /></span>
          <span className="qte-source__text">
            <strong>Pregunta personalizada</strong>
            <small>Escribe la pregunta y sus 4 respuestas</small>
          </span>
        </button>
      </div>

      {/* ── Rosco Browser ── */}
      <AnimatePresence initial={false}>
        {showBrowser && (
          <motion.section
            key="qte-browser"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="qte-pane qte-pane--rosco"
          >
            <div className="qte-pane__head">
              <span className="qte-pane__ico"><BookOpen size={18} /></span>
              <h3 className="qte-pane__title">Banco de preguntas del Rosco</h3>
              <button type="button" onClick={() => setShowBrowser(false)} className="qte-iconbtn" title="Cerrar" aria-label="Cerrar banco del Rosco">
                <X size={16} />
              </button>
            </div>

            <div className="qte-filters">
              <label className="qte-filter">
                <span>Etapa</span>
                <select value={browseLevel} onChange={(e) => setBrowseLevel(e.target.value)} className="qte-select">
                  {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </label>
              <label className="qte-filter qte-filter--grade">
                <span>Curso</span>
                <select value={browseGrade} onChange={(e) => setBrowseGrade(e.target.value)} className="qte-select">
                  {(browseLevel === 'primaria' ? [1,2,3,4,5,6] : [1,2,3,4]).map((g) => (
                    <option key={g} value={g}>{g}º</option>
                  ))}
                </select>
              </label>
              <label className="qte-filter qte-filter--grow">
                <span>Asignatura</span>
                <select value={browseSubject} onChange={(e) => setBrowseSubject(e.target.value)} className="qte-select">
                  {browseSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="qte-filter qte-filter--grow">
                <span>Buscar</span>
                <span className="qte-search">
                  <Search size={15} />
                  <input
                    type="text"
                    value={roscoSearch}
                    onChange={(e) => setRoscoSearch(e.target.value)}
                    placeholder="Filtrar..."
                    className="qte-input qte-input--search"
                  />
                </span>
              </label>
            </div>

            {roscoLoading ? (
              <div className="qte-loading qte-loading--sm"><BrandLoader variant="inline" /></div>
            ) : filteredRosco.length === 0 ? (
              <p className="qte-pane__empty">No se encontraron preguntas</p>
            ) : (
              <div className="qte-rlist">
                {filteredRosco.map((item, i) => {
                  const added = isAdded(item.question, item.answer);
                  return (
                    <div
                      key={`${item.answer}-${i}`}
                      className={`qte-rrow ${added ? 'is-added' : ''}`}
                    >
                      <span className="qte-rrow__letter" aria-hidden="true">{item.letra ? String(item.letra).toUpperCase() : '·'}</span>
                      <div className="qte-rrow__text">
                        <p className="qte-rrow__q">{item.question}</p>
                        <p className="qte-rrow__a">R: <b>{item.answer}</b></p>
                      </div>
                      <DifficultyPill value={item.difficulty} />
                      <button
                        type="button"
                        onClick={() => addRoscoQuestion(item)}
                        disabled={added}
                        className={`qte-rrow__add ${added ? 'is-added' : ''}`}
                      >
                        {added ? <><Check size={14} /> Añadida</> : <><Plus size={14} /> Añadir</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="qte-pane__foot">
              {filteredRosco.length} preguntas disponibles · {questions.filter((q) => q.source === 'rosco').length} añadidas del rosco
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Custom Question Form ── */}
      <AnimatePresence initial={false}>
        {showCustom && (
          <motion.section
            key="qte-custom"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="qte-pane qte-pane--custom"
          >
            <div className="qte-pane__head">
              <span className="qte-pane__ico"><Edit3 size={18} /></span>
              <h3 className="qte-pane__title">Pregunta personalizada</h3>
              <button type="button" onClick={() => setShowCustom(false)} className="qte-iconbtn" title="Cerrar" aria-label="Cerrar pregunta personalizada">
                <X size={16} />
              </button>
            </div>

            <div className="qte-custom">
              <label className="qte-field">
                <span className="qte-field__label">
                  Pregunta
                  <span className="qte-field__count">{customQ.length}/300</span>
                </span>
                <input
                  type="text" value={customQ} onChange={(e) => setCustomQ(e.target.value)}
                  placeholder="Escribe la pregunta..."
                  maxLength={300}
                  className="qte-input qte-input--lg"
                />
              </label>
              <div className="qte-custom__answers">
                <label className="qte-opt is-correct">
                  <span className="qte-opt__badge"><Check size={14} strokeWidth={3} /></span>
                  <input
                    type="text" value={customCorrect} onChange={(e) => setCustomCorrect(e.target.value)}
                    placeholder="Respuesta CORRECTA"
                    maxLength={100}
                    className="qte-opt__input"
                  />
                </label>
                <label className="qte-opt">
                  <span className="qte-opt__badge"><X size={14} strokeWidth={3} /></span>
                  <input
                    type="text" value={customWrong1} onChange={(e) => setCustomWrong1(e.target.value)}
                    placeholder="Respuesta incorrecta 1"
                    maxLength={100}
                    className="qte-opt__input"
                  />
                </label>
                <label className="qte-opt">
                  <span className="qte-opt__badge"><X size={14} strokeWidth={3} /></span>
                  <input
                    type="text" value={customWrong2} onChange={(e) => setCustomWrong2(e.target.value)}
                    placeholder="Respuesta incorrecta 2"
                    maxLength={100}
                    className="qte-opt__input"
                  />
                </label>
                <label className="qte-opt">
                  <span className="qte-opt__badge"><X size={14} strokeWidth={3} /></span>
                  <input
                    type="text" value={customWrong3} onChange={(e) => setCustomWrong3(e.target.value)}
                    placeholder="Respuesta incorrecta 3"
                    maxLength={100}
                    className="qte-opt__input"
                  />
                </label>
              </div>
              <div className="qte-custom__foot">
                <span className="qte-custom__hint"><Shuffle size={14} /> Las respuestas se barajan al añadir la pregunta.</span>
                <DashButton variant="primary" icon={Plus} onClick={addCustomQuestion}>
                  Añadir pregunta
                </DashButton>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Question list ── */}
      <DashCard
        icon={ListOrdered}
        tone="indigo"
        title="Preguntas de la batalla"
        subtitle={questions.length > 0
          ? `${questions.length} pregunta${questions.length !== 1 ? 's' : ''} · ${roscoCount} del Rosco · ${customCount} propia${customCount !== 1 ? 's' : ''}`
          : 'Se jugarán en este orden'}
      >
        {questions.length === 0 ? (
          <DashEmpty
            title="Todavía no hay preguntas"
            action={(
              <div className="qte-empty-actions">
                <DashButton variant="sky" icon={BookOpen} onClick={() => { setShowBrowser(true); setShowCustom(false); }}>Buscar en roscos</DashButton>
                <DashButton variant="primary" icon={Edit3} onClick={() => { setShowCustom(true); setShowBrowser(false); }}>Pregunta personalizada</DashButton>
              </div>
            )}
          >
            Añade preguntas desde el banco del rosco o crea las tuyas propias.
          </DashEmpty>
        ) : (
          <div className="qte-qlist">
            {questions.map((q, i) => (
              <motion.article
                key={`${q.question}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="qte-q"
              >
                <header className="qte-q__head">
                  <span className="qte-q__num">{i + 1}</span>
                  <div className="qte-q__titles">
                    <p className="qte-q__text">{q.question}</p>
                    <div className="qte-q__meta">
                      <span className={`qte-src ${q.source === 'custom' ? 'is-custom' : 'is-rosco'}`}>
                        {q.source === 'custom' ? 'Manual' : 'Rosco'}
                      </span>
                      <DifficultyPill value={q.difficulty} />
                    </div>
                  </div>
                  <div className="qte-q__tools">
                    <button type="button" onClick={() => moveQuestion(i, -1)} disabled={i === 0}
                      className="qte-iconbtn qte-iconbtn--sm" title="Subir" aria-label={`Subir la pregunta ${i + 1}`}>
                      <ChevronUp size={16} />
                    </button>
                    <button type="button" onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1}
                      className="qte-iconbtn qte-iconbtn--sm" title="Bajar" aria-label={`Bajar la pregunta ${i + 1}`}>
                      <ChevronDown size={16} />
                    </button>
                    <button type="button" onClick={() => removeQuestion(i)}
                      className="qte-iconbtn qte-iconbtn--sm qte-iconbtn--danger" title="Quitar" aria-label={`Quitar la pregunta ${i + 1}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </header>
                <AnswerTiles q={q} />
              </motion.article>
            ))}
          </div>
        )}
      </DashCard>

      {/* ═══ Barra fija de guardado (listas largas) ═══ */}
      {questions.length > 3 && (
        <div className="qte-dock">
          <span className="qte-dock__info">
            <b>{questions.length}</b> pregunta{questions.length !== 1 ? 's' : ''}
            {!name.trim() && <em> · falta el nombre</em>}
          </span>
          <DashButton variant="emerald" icon={Save} onClick={handleSave} disabled={saveDisabled}>
            {saving ? 'Guardando…' : 'Guardar batalla'}
          </DashButton>
        </div>
      )}
    </div>
  );
}
