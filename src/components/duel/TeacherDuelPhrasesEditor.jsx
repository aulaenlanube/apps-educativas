import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, X, Check, Lock, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { teacherGetMyPhrases, teacherSetPhraseSlot } from '@/services/phraseService';
import { toastError } from '@/lib/supabaseErrors';
import { DashCard, DashButton, Pill } from '@/components/dashboard/kit';
import '@/pages/dashboard/teacherPanels.css';
import './teacherDuel.css';

// Espejo del DuelPhrasesEditor del alumno, pero usando las RPCs `teacher_*`.
// El docente equipa hasta 4 frases que enviará durante un duelo amistoso a su
// rival (siempre un alumno). Las frases bloqueadas se desbloquean usando los
// mismos criterios que las del alumno (`_teacher_avatar_progress`).

const CATEGORY_META = {
  cheer:   { label: 'Animar',  cls: 'tp-chip--emerald' },
  tease:   { label: 'Picar',   cls: 'tp-chip--rose' },
  funny:   { label: 'Diver',   cls: 'tp-chip--amber' },
  neutral: { label: 'Neutra',  cls: 'tp-chip--slate' },
};

const RARITY_COLOR = {
  common:    { from: '#94a3b8', to: '#cbd5e1', label: 'Común' },
  rare:      { from: '#3b82f6', to: '#60a5fa', label: 'Rara' },
  epic:      { from: '#a855f7', to: '#c084fc', label: 'Épica' },
  legendary: { from: '#f59e0b', to: '#fbbf24', label: 'Legendaria' },
  mythic:    { from: '#ef4444', to: '#f472b6', label: 'Mítica' },
};

const FILTERS = [
  ['all', 'Todas'],
  ['cheer', 'Animar'],
  ['tease', 'Picar'],
  ['funny', 'Diver'],
  ['neutral', 'Neutra'],
];

export default function TeacherDuelPhrasesEditor() {
  const { toast } = useToast();
  const [data, setData] = useState({ slots: [], available: [], locked: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [pickerSlot, setPickerSlot] = useState(null);
  const [filter, setFilter] = useState('all');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await teacherGetMyPhrases();
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
  }, [toast]);

  useEffect(() => { reload(); }, [reload]);

  const slotByIndex = (i) => data.slots.find(s => s.slot === i) || null;
  const usedPhraseIds = new Set(data.slots.map(s => s.phrase_id));

  async function assign(slot, phraseId) {
    setSaving(slot);
    try {
      await teacherSetPhraseSlot({ slot, phraseId });
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

  const picker = pickerSlot != null && typeof document !== 'undefined' && createPortal(
    <div className="tp-root tp-modal" onClick={() => setPickerSlot(null)}>
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="tp-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-phrase-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-dhead tp-dhead--duel">
          <div className="tp-dhead__row">
            <span className="tp-dhead__icon"><Sparkles size={24} /></span>
            <div className="tp-dhead__text">
              <h2 id="tp-phrase-picker-title" className="tp-dhead__title">Elige una frase para el slot {pickerSlot + 1}</h2>
              <p className="tp-dhead__sub">Tu rival la verá en un bocadillo durante el duelo</p>
            </div>
          </div>
          <div className="tp-dhead__tools">
            <button type="button" onClick={() => setPickerSlot(null)} className="tp-iconbtn tp-iconbtn--glass" title="Cerrar" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="tp-dbody">
          <div className="tp-filters" style={{ marginBottom: 14 }}>
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`tp-filter ${filter === id ? 'is-on' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="tp-phrases">
            {filtered.map(p => {
              const used = usedPhraseIds.has(p.phrase_id);
              const meta = CATEGORY_META[p.category] || CATEGORY_META.neutral;
              return (
                <button
                  key={p.phrase_id}
                  type="button"
                  onClick={() => assign(pickerSlot, p.phrase_id)}
                  disabled={saving != null}
                  className={`tp-choice tp-phrase ${used ? 'is-on' : ''}`}
                >
                  {used && <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>}
                  <span className="tp-phrase__emoji">{p.emoji}</span>
                  <span className="tp-choice__text">
                    <span className="tp-choice__title">{p.text}</span>
                    <span className={`tp-chip tp-cat ${meta.cls}`}>{meta.label}</span>
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="tp-arena__empty" style={{ gridColumn: '1 / -1' }}>
                No hay frases en esta categoría.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );

  return (
    <DashCard
      as={motion.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="tp-root"
      icon={MessageSquare}
      tone="rose"
      title="Frases para duelos"
      subtitle="Elige hasta 4 frases para picar (con cariño) a tu alumno en un duelo amistoso 1 vs 1. Jugando a las apps desbloquearás frases más raras."
      actions={!loading && <Pill tone="soft">{data.slots.length}/4 equipadas</Pill>}
    >
      {loading ? (
        <div className="tp-center"><span className="tp-spin" /></div>
      ) : (
        <>
          <div className="tp-slots">
            {[0, 1, 2, 3].map(i => {
              const s = slotByIndex(i);
              return (
                <div key={i} className={`tp-slot ${s ? '' : 'is-empty'}`}>
                  <div className="tp-slot__top">
                    <span className="tp-slot__num">Slot {i + 1}</span>
                    {s && (
                      <button
                        type="button"
                        onClick={() => clearSlot(i)}
                        disabled={saving === i}
                        className="tp-iconbtn tp-iconbtn--ghost"
                        title="Vaciar slot"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {s ? (
                    <div className="tp-speech">
                      <span className="tp-speech__emoji">{s.emoji}</span>
                      <p className="tp-speech__text">{s.text}</p>
                    </div>
                  ) : (
                    <div className="tp-speech tp-speech--empty"><MessageSquarePlus size={18} /> Vacío</div>
                  )}
                  <DashButton
                    variant={s ? 'soft' : 'rose'}
                    size="sm"
                    onClick={() => setPickerSlot(i)}
                  >
                    {s ? 'Cambiar' : 'Elegir frase'}
                  </DashButton>
                </div>
              );
            })}
          </div>

          {data.locked.length > 0 && (
            <div>
              <div className="tp-locked__head">
                <Lock size={16} style={{ color: 'var(--dk-ink-3)' }} />
                <h4 className="tp-locked__title">Frases por desbloquear</h4>
                <Pill tone="soft">{data.locked.length} disponibles</Pill>
              </div>
              <p className="tp-help">
                Frases más picantes y nerd. Se desbloquean automáticamente al cumplir cada reto.
              </p>
              <div className="tp-locked__grid">
                {data.locked.map(p => {
                  const rc = RARITY_COLOR[p.rarity] || RARITY_COLOR.common;
                  const pct = p.progress?.pct ?? 0;
                  const cur = p.progress?.progress ?? 0;
                  const tgt = p.progress?.target ?? 1;
                  return (
                    <div key={p.phrase_id} className="tp-lockph">
                      <span className="tp-lockph__rar" style={{ background: `linear-gradient(135deg, ${rc.from}, ${rc.to})` }}>
                        {rc.label}
                      </span>
                      <div className="tp-lockph__row">
                        <span className="tp-lockph__emoji">{p.emoji}</span>
                        <p className="tp-lockph__text">{p.text}</p>
                      </div>
                      <div className="tp-lockph__track">
                        <i style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${rc.from}, ${rc.to})` }} />
                      </div>
                      <p className="tp-lockph__nums"><Lock size={11} /> {cur} / {tgt}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {picker}
    </DashCard>
  );
}
