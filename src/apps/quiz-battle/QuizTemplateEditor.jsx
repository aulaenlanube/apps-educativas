import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Save, ArrowLeft, Search, BookOpen, Edit3,
  ChevronDown, ChevronUp, GripVertical, Copy, FileText, X, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getRoscoData } from '@/services/gameDataService';
import materiasData from '../../../public/data/materias.json';

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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Cambios sin guardar</h3>
                  <p className="text-xs text-slate-500">Tienes {questions.length} pregunta{questions.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Has modificado preguntas de esta plantilla. Si sales ahora sin guardar, los cambios se perderan.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowExitConfirm(false); onBack(); }}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Salir sin guardar
                </button>
                <button
                  onClick={async () => { setShowExitConfirm(false); await handleSave(true); }}
                  disabled={saving || questions.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Guardar y salir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={handleBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h2 className="text-lg font-bold text-slate-800">
          {templateId ? 'Editar batalla' : 'Nueva Batalla'}
        </h2>
        <span className="text-xs text-slate-400 ml-auto">{questions.length} preguntas</span>
      </div>

      {/* Name & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Repaso Tema 5 Lengua"
            maxLength={80}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Descripcion</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
            maxLength={200}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setShowBrowser(true); setShowCustom(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <BookOpen className="w-4 h-4" /> Buscar en roscos
        </button>
        <button
          onClick={() => { setShowCustom(true); setShowBrowser(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors"
        >
          <Edit3 className="w-4 h-4" /> Pregunta personalizada
        </button>
        <button
          onClick={handleSave}
          disabled={saving || questions.length < 4 || !name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50 ml-auto"
        >
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* ── Rosco Browser ── */}
      <AnimatePresence>
        {showBrowser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-blue-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Banco de preguntas del Rosco
              </h3>
              <button onClick={() => setShowBrowser(false)} className="text-blue-400 hover:text-blue-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              <select value={browseLevel} onChange={(e) => setBrowseLevel(e.target.value)}
                className="px-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white">
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
              <select value={browseGrade} onChange={(e) => setBrowseGrade(e.target.value)}
                className="px-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white">
                {(browseLevel === 'primaria' ? [1,2,3,4,5,6] : [1,2,3,4]).map((g) => (
                  <option key={g} value={g}>{g}o</option>
                ))}
              </select>
              <select value={browseSubject} onChange={(e) => setBrowseSubject(e.target.value)}
                className="px-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white flex-1 min-w-[120px]">
                {browseSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.nombre}</option>
                ))}
              </select>
              <div className="relative flex-1 min-w-[140px]">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  value={roscoSearch}
                  onChange={(e) => setRoscoSearch(e.target.value)}
                  placeholder="Filtrar..."
                  className="w-full pl-7 pr-2 py-1.5 border border-blue-200 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            {roscoLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : filteredRosco.length === 0 ? (
              <p className="text-sm text-blue-400 text-center py-4">No se encontraron preguntas</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredRosco.map((item, i) => {
                  const added = isAdded(item.question, item.answer);
                  return (
                    <div
                      key={`${item.answer}-${i}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                        added ? 'bg-green-100 text-green-700' : 'bg-white hover:bg-blue-100 text-slate-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.question}</p>
                        <p className="text-slate-400">R: {item.answer}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.difficulty === 1 ? 'bg-green-100 text-green-700' :
                        item.difficulty === 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>D{item.difficulty}</span>
                      <button
                        onClick={() => addRoscoQuestion(item)}
                        disabled={added}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          added
                            ? 'bg-green-200 text-green-700 cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {added ? 'Anadida' : '+ Anadir'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-[10px] text-blue-400 mt-2 text-right">
              {filteredRosco.length} preguntas disponibles · {questions.filter((q) => q.source === 'rosco').length} anadidas del rosco
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Custom Question Form ── */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50 border border-purple-200 rounded-2xl p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-purple-800 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" /> Pregunta personalizada
              </h3>
              <button onClick={() => setShowCustom(false)} className="text-purple-400 hover:text-purple-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text" value={customQ} onChange={(e) => setCustomQ(e.target.value)}
                placeholder="Escribe la pregunta..."
                maxLength={300}
                className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" value={customCorrect} onChange={(e) => setCustomCorrect(e.target.value)}
                  placeholder="Respuesta CORRECTA"
                  maxLength={100}
                  className="px-3 py-2 border-2 border-green-300 rounded-xl text-sm bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <input
                  type="text" value={customWrong1} onChange={(e) => setCustomWrong1(e.target.value)}
                  placeholder="Respuesta incorrecta 1"
                  maxLength={100}
                  className="px-3 py-2 border border-red-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <input
                  type="text" value={customWrong2} onChange={(e) => setCustomWrong2(e.target.value)}
                  placeholder="Respuesta incorrecta 2"
                  maxLength={100}
                  className="px-3 py-2 border border-red-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <input
                  type="text" value={customWrong3} onChange={(e) => setCustomWrong3(e.target.value)}
                  placeholder="Respuesta incorrecta 3"
                  maxLength={100}
                  className="px-3 py-2 border border-red-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
              <button
                onClick={addCustomQuestion}
                className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Anadir pregunta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Question list ── */}
      {questions.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Anade preguntas desde el banco del rosco o crea las tuyas propias</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {questions.map((q, i) => (
            <motion.div
              key={`${q.question}-${i}`}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-xs font-bold text-slate-400 w-6 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{q.question}</p>
                <p className="text-xs text-slate-400">
                  R: <span className="text-green-600 font-semibold">{q.correct}</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {q.source === 'custom' ? 'Manual' : 'Rosco'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => moveQuestion(i, -1)} disabled={i === 0}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeQuestion(i)}
                  className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
