// Editor de las 4 frases de duelo del alumno — rediseño 2026.
// Los 4 huecos se ven como bocadillos de chat (como los verá el rival), las
// frases por desbloquear con su progreso, y el selector en un portal.
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, X, Check, Lock, Plus, RefreshCw, Swords } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashCard, Pill } from '@/components/dashboard/kit';
import { getMyPhrases, setPhraseSlot } from '@/services/phraseService';
import { toastError } from '@/lib/supabaseErrors';
import './DuelPhrasesEditor.css';

const CATEGORY_META = {
  cheer:   { label: 'Animar' },
  tease:   { label: 'Picar' },
  funny:   { label: 'Diver' },
  neutral: { label: 'Neutra' },
};

const RARITY_COLOR = {
  common:    { label: 'Común' },
  rare:      { label: 'Rara' },
  epic:      { label: 'Épica' },
  legendary: { label: 'Legendaria' },
  mythic:    { label: 'Mítica' },
};

const catOf = (c) => (CATEGORY_META[c] ? c : 'neutral');
const rarOf = (r) => (RARITY_COLOR[r] ? r : 'common');

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

  // Escape cierra el selector.
  useEffect(() => {
    if (pickerSlot == null) return undefined;
    const onKey = (e) => e.key === 'Escape' && setPickerSlot(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pickerSlot]);

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

  const filledCount = [0, 1, 2, 3].filter(i => slotByIndex(i)).length;
  const pickerCurrent = pickerSlot != null ? slotByIndex(pickerSlot) : null;

  return (
    <DashCard
      icon={MessageSquare}
      tone="pink"
      title="Frases para duelos"
      subtitle="Tu arsenal de frases para el 1 vs 1"
      className="dpe"
      actions={!loading && <Pill tone={filledCount === 4 ? 'good' : 'warn'}>{filledCount}/4 equipadas</Pill>}
    >
      <p className="dpe-intro">
        Configura hasta <strong>4 frases</strong> que podrás enviar a tu rival durante un duelo 1 vs 1. Úsalas para animarle, chincharle o reírte. Pronto se desbloquearán frases nuevas más raras.
      </p>

      {loading ? (
        <div className="dpe-loading">Cargando…</div>
      ) : (
        <>
          <div className="dpe-slots">
            {[0, 1, 2, 3].map(i => {
              const s = slotByIndex(i);
              return (
                <div
                  key={i}
                  className={`dpe-slot ${s ? `is-filled c-${catOf(s.category)}` : 'is-empty'}`}
                >
                  <div className="dpe-slot__top">
                    <span className="dpe-slot__num">{i + 1}</span>
                    <span className="dpe-slot__label">Hueco {i + 1}</span>
                    {s && (
                      <button
                        type="button"
                        onClick={() => clearSlot(i)}
                        disabled={saving === i}
                        className="dpe-slot__clear"
                        title="Vaciar hueco"
                        aria-label={`Vaciar hueco ${i + 1}`}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  {s ? (
                    <div className="dpe-bubble">
                      <span className="dpe-bubble__emoji">{s.emoji}</span>
                      <p className="dpe-bubble__text">{s.text}</p>
                    </div>
                  ) : (
                    <div className="dpe-bubble dpe-bubble--empty">
                      <span className="dpe-bubble__emoji">💬</span>
                      <p className="dpe-bubble__text">Vacío</p>
                    </div>
                  )}
                  <div className="dpe-slot__foot">
                    {s && <span className={`dpe-cat c-${catOf(s.category)}`}>{CATEGORY_META[catOf(s.category)].label}</span>}
                    <button
                      type="button"
                      onClick={() => setPickerSlot(i)}
                      className={`dpe-btn ${s ? 'dpe-btn--soft' : 'dpe-btn--primary'}`}
                    >
                      {s ? <><RefreshCw size={14} /> Cambiar</> : <><Plus size={15} /> Elegir frase</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Frases bloqueadas con progreso */}
          {data.locked.length > 0 && (
            <div className="dpe-locked">
              <div className="dpe-locked__head">
                <span className="dpe-locked__icon"><Lock size={15} /></span>
                <h4>Frases por desbloquear</h4>
                <span className="dpe-locked__count">{data.locked.length} disponibles</span>
              </div>
              <p className="dpe-locked__hint">
                Frases más picantes y arrogantes. Se desbloquean automáticamente cuando completas el reto. Una vez desbloqueada, podrás equiparla en cualquier slot.
              </p>
              <div className="dpe-locked__grid">
                {data.locked.map(p => {
                  const rk = rarOf(p.rarity);
                  const rc = RARITY_COLOR[rk];
                  const pct = p.progress?.pct ?? 0;
                  const cur = p.progress?.progress ?? 0;
                  const tgt = p.progress?.target ?? 1;
                  return (
                    <div key={p.phrase_id} className={`dpe-lock r-${rk}`}>
                      <span className="dpe-lock__emoji">{p.emoji}</span>
                      <div className="dpe-lock__body">
                        <p className="dpe-lock__text">{p.text}</p>
                        <div className="dpe-lock__progress">
                          <span className="dpe-lock__bar"><i style={{ transform: `scaleX(${Math.max(0, Math.min(100, pct)) / 100})` }} /></span>
                          <span className="dpe-lock__nums">{cur} / {tgt}</span>
                        </div>
                      </div>
                      <span className="dpe-lock__rar">{rc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal selector */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {pickerSlot != null && (
            <motion.div
              key="dpe-picker"
              className="dpe-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPickerSlot(null)}
              role="dialog"
              aria-modal="true"
              aria-label={`Elige una frase para el hueco ${pickerSlot + 1}`}
            >
              <div className="dpe-modal__backdrop" aria-hidden="true" />
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="dpe-modal__card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dpe-modal__head">
                  <span className="dpe-modal__icon"><Swords size={20} /></span>
                  <div className="dpe-modal__titles">
                    <h4>Elige una frase para el hueco {pickerSlot + 1}</h4>
                    <p>
                      {pickerCurrent ? <>Ahora: {pickerCurrent.emoji} {pickerCurrent.text}</> : 'Este hueco está vacío'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setPickerSlot(null)} className="dpe-modal__close" aria-label="Cerrar">
                    <X size={20} />
                  </button>
                </div>

                <div className="dpe-modal__filters">
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
                      className={`dpe-filter c-${id}${filter === id ? ' is-active' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="dpe-modal__grid">
                  {filtered.map(p => {
                    const used = usedPhraseIds.has(p.phrase_id);
                    const ck = catOf(p.category);
                    const rk = rarOf(p.rarity);
                    return (
                      <button
                        key={p.phrase_id}
                        type="button"
                        onClick={() => assign(pickerSlot, p.phrase_id)}
                        disabled={saving != null}
                        className={`dpe-pick c-${ck}${used ? ' is-used' : ''}`}
                      >
                        <span className="dpe-pick__emoji">{p.emoji}</span>
                        <span className="dpe-pick__body">
                          <span className="dpe-pick__text">{p.text}</span>
                          <span className="dpe-pick__tags">
                            <span className={`dpe-cat c-${ck}`}>{CATEGORY_META[ck].label}</span>
                            {rk !== 'common' && <span className={`dpe-rar r-${rk}`}><Sparkles size={10} /> {RARITY_COLOR[rk].label}</span>}
                          </span>
                        </span>
                        {used && <span className="dpe-pick__check"><Check size={14} /></span>}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="dpe-modal__empty">
                      No hay frases en esta categoría.
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </DashCard>
  );
}
