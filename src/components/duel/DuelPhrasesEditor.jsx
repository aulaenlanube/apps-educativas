import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, X, Check, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { getMyPhrases, setPhraseSlot } from '@/services/phraseService';
import { toastError } from '@/lib/supabaseErrors';

const CATEGORY_META = {
  cheer:   { label: 'Animar',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  tease:   { label: 'Picar',   cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  funny:   { label: 'Diver',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  neutral: { label: 'Neutra',  cls: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const RARITY_COLOR = {
  common:    { from: '#94a3b8', to: '#cbd5e1', label: 'Común' },
  rare:      { from: '#3b82f6', to: '#60a5fa', label: 'Rara' },
  epic:      { from: '#a855f7', to: '#c084fc', label: 'Épica' },
  legendary: { from: '#f59e0b', to: '#fbbf24', label: 'Legendaria' },
  mythic:    { from: '#ef4444', to: '#f472b6', label: 'Mítica' },
};

export default function DuelPhrasesEditor() {
  const { student } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState({ slots: [], available: [], locked: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // slot que se está guardando
  const [pickerSlot, setPickerSlot] = useState(null); // slot abierto en el modal
  const [filter, setFilter] = useState('all');

  const reload = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    try {
      const d = await getMyPhrases({ studentId: student.id, sessionToken: student.session_token });
      setData({
        slots: d?.slots || [],
        available: d?.available || [],
        locked: d?.locked || [],
      });
    } catch (e) {
      toast(toastError(e));
    } finally {
      setLoading(false);
    }
  }, [student, toast]);

  useEffect(() => { reload(); }, [reload]);

  const slotByIndex = (i) => data.slots.find(s => s.slot === i) || null;
  const usedPhraseIds = new Set(data.slots.map(s => s.phrase_id));

  async function assign(slot, phraseId) {
    if (!student) return;
    setSaving(slot);
    try {
      await setPhraseSlot({ studentId: student.id, sessionToken: student.session_token, slot, phraseId });
      await reload();
      toast({ title: 'Frase guardada', description: 'Ya la podrás usar en duelos.' });
      setPickerSlot(null);
    } catch (e) {
      toast(toastError(e));
    } finally {
      setSaving(null);
    }
  }

  async function clearSlot(slot) {
    await assign(slot, null);
  }

  const available = Array.isArray(data.available) ? data.available : [];
  const filtered = filter === 'all'
    ? available
    : available.filter(p => p.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-5 h-5 text-violet-600" />
        <h3 className="text-base font-bold text-slate-800">Frases para duelos</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Configura hasta <strong>4 frases</strong> que podrás enviar a tu rival durante un duelo 1 vs 1. Úsalas para animarle, chincharle o reírte. Pronto se desbloquearán frases nuevas más raras.
      </p>

      {loading ? (
        <div className="text-sm text-slate-400 py-6 text-center">Cargando…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(i => {
              const s = slotByIndex(i);
              return (
                <div
                  key={i}
                  className={`relative rounded-xl border-2 p-3 transition-all ${
                    s
                      ? 'border-violet-300 bg-violet-50/40'
                      : 'border-dashed border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wide">
                      Slot {i + 1}
                    </span>
                    {s && (
                      <button
                        type="button"
                        onClick={() => clearSlot(i)}
                        disabled={saving === i}
                        className="ml-auto text-slate-400 hover:text-rose-500"
                        title="Vaciar slot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {s ? (
                    <div className="flex items-start gap-2">
                      <span className="text-2xl shrink-0">{s.emoji}</span>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{s.text}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Vacío</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerSlot(i)}
                    className="mt-3 w-full border-violet-200 hover:bg-violet-100"
                  >
                    {s ? 'Cambiar' : 'Elegir frase'}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Frases bloqueadas con progreso */}
          {data.locked.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-bold text-slate-700">Frases por desbloquear</h4>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{data.locked.length} disponibles</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Frases más picantes y arrogantes. Se desbloquean automáticamente cuando completas el reto. Una vez desbloqueada, podrás equiparla en cualquier slot.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.locked.map(p => {
                  const rc = RARITY_COLOR[p.rarity] || RARITY_COLOR.common;
                  const pct = p.progress?.pct ?? 0;
                  const cur = p.progress?.progress ?? 0;
                  const tgt = p.progress?.target ?? 1;
                  return (
                    <div
                      key={p.phrase_id}
                      className="relative rounded-xl border-2 border-slate-200 bg-slate-50/60 p-3 overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 inline-flex items-center gap-1 text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full text-white shadow"
                           style={{ background: `linear-gradient(135deg, ${rc.from}, ${rc.to})` }}>
                        {rc.label}
                      </div>
                      <div className="flex items-start gap-2 opacity-70">
                        <span className="text-2xl shrink-0 grayscale">{p.emoji}</span>
                        <p className="text-sm font-semibold text-slate-700 leading-tight pr-14">{p.text}</p>
                      </div>
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${rc.from}, ${rc.to})`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 tabular-nums mt-1">{cur} / {tgt}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal selector */}
      {pickerSlot != null && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPickerSlot(null)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold">Elige una frase para el slot {pickerSlot + 1}</h4>
              </div>
              <button onClick={() => setPickerSlot(null)} className="p-1 hover:bg-white/15 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pt-3 flex flex-wrap gap-1.5">
              {[
                ['all', 'Todas'],
                ['cheer', 'Animar'],
                ['tease', 'Picar'],
                ['funny', 'Diver'],
                ['neutral', 'Neutra'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                    filter === id
                      ? 'bg-violet-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map(p => {
                const used = usedPhraseIds.has(p.phrase_id);
                const meta = CATEGORY_META[p.category] || CATEGORY_META.neutral;
                return (
                  <button
                    key={p.phrase_id}
                    type="button"
                    onClick={() => assign(pickerSlot, p.phrase_id)}
                    disabled={saving != null}
                    className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                      used
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="text-2xl shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{p.text}</p>
                      <span className={`mt-1 inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    {used && <Check className="w-4 h-4 text-violet-600 shrink-0 mt-1" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-sm text-slate-400 italic col-span-full text-center py-6">
                  No hay frases en esta categoría.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
