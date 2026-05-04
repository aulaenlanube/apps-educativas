import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Edit3, RefreshCw, Search, Plus, Trash2, EyeOff, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RarityBadge } from '@/components/ui/UserAvatar';

const RARITY_OPTIONS = [
  { value: 'common',    label: 'Común' },
  { value: 'rare',      label: 'Raro' },
  { value: 'epic',      label: 'Épico' },
  { value: 'legendary', label: 'Legendario' },
  { value: 'mythic',    label: 'Mítico' },
];

const CATEGORY_OPTIONS = [
  { value: 'cheer',   label: 'Ánimo',     icon: '🎉' },
  { value: 'tease',   label: 'Pique',     icon: '😏' },
  { value: 'funny',   label: 'Gracia',    icon: '😂' },
  { value: 'neutral', label: 'Neutral',   icon: '💬' },
];

// Plantillas de unlock_requirement para autocompletar al editar.
const UNLOCK_TEMPLATES = [
  { label: 'Por defecto (sin requisito)', value: '' },
  { label: 'Duelos ganados',              value: '{"type":"duels_won","count":5}' },
  { label: 'Batallas ganadas',            value: '{"type":"battles_won","count":3}' },
  { label: 'Sesiones totales',            value: '{"type":"total_sessions","count":20}' },
  { label: 'Apps únicas jugadas',         value: '{"type":"unique_apps","count":5}' },
  { label: 'Exámenes perfectos',          value: '{"type":"perfect_exams","count":5}' },
  { label: 'Exámenes ≥ nota',             value: '{"type":"high_score_exams","count":5,"min_nota":8}' },
  { label: 'Insignias',                   value: '{"type":"badges_count","count":15}' },
  { label: 'Nivel',                       value: '{"type":"level","value":10}' },
  { label: 'Racha de días',               value: '{"type":"streak_days","count":5}' },
  { label: 'Apps valoradas',              value: '{"type":"apps_rated","count":3}' },
  { label: 'Mensajes de feedback',        value: '{"type":"feedback_messages","count":3}' },
  { label: 'Top de clase',                value: '{"type":"top_class","count":3}' },
];

export default function PhrasesPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // ítem en edición o "__new"
  const [filter, setFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [defaultFilter, setDefaultFilter] = useState('all'); // all | default | unlock

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('phrase_admin_list');
    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }
    setItems(Array.isArray(data) ? data : []);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = items;
    if (rarityFilter !== 'all')   list = list.filter((i) => i.rarity === rarityFilter);
    if (categoryFilter !== 'all') list = list.filter((i) => i.category === categoryFilter);
    if (defaultFilter === 'default') list = list.filter((i) => i.is_default);
    if (defaultFilter === 'unlock')  list = list.filter((i) => !i.is_default);
    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter((i) =>
        i.code.toLowerCase().includes(q) ||
        (i.text || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, rarityFilter, categoryFilter, defaultFilter]);

  const handleSave = async (form) => {
    const { error, data } = await supabase.rpc('phrase_admin_upsert', {
      p_code: form.code.trim(),
      p_text: form.text.trim(),
      p_emoji: (form.emoji || '').trim(),
      p_category: form.category,
      p_rarity: form.rarity,
      p_is_default: form.is_default,
      p_unlock_requirement: form.unlock_requirement,
      p_sort_order: Number(form.sort_order || 999),
      p_active: form.active,
    });
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      return false;
    }
    toast({ title: 'Frase guardada' });
    setEditing(null);
    fetchAll();
    return true;
  };

  const handleDelete = async (item) => {
    const equipped = Number(item.equipped_count) || 0;
    const msg = equipped > 0
      ? `Eliminar "${item.code}" (${item.text})? Hay ${equipped} usuario${equipped !== 1 ? 's' : ''} que la tienen equipada — su slot quedará vacío.`
      : `Eliminar "${item.code}" (${item.text})?`;
    // Modal de confirmación inline (window.confirm está prohibido por CLAUDE.md)
    setEditing({ __confirm_delete: true, item, message: msg });
  };

  const confirmDelete = async (code) => {
    const { error, data } = await supabase.rpc('phrase_admin_delete', { p_code: code });
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      return;
    }
    toast({ title: 'Frase eliminada' });
    setEditing(null);
    fetchAll();
  };

  const totals = useMemo(() => ({
    total: items.length,
    defaults: items.filter((i) => i.is_default).length,
    unlock: items.filter((i) => !i.is_default).length,
    inactive: items.filter((i) => !i.active).length,
  }), [items]);

  return (
    <div className="space-y-4">
      {/* Cabecera con totales y nuevo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por código o texto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todas las categorías</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todas las rarezas</option>
            {RARITY_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            value={defaultFilter}
            onChange={(e) => setDefaultFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todas</option>
            <option value="default">Por defecto</option>
            <option value="unlock">Desbloqueables</option>
          </select>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            onClick={() => setEditing('__new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Nueva frase
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
          <span><strong>{filtered.length}</strong> de {totals.total} frases</span>
          <span>·</span>
          <span>{totals.defaults} por defecto</span>
          <span>·</span>
          <span>{totals.unlock} desbloqueables</span>
          {totals.inactive > 0 && (
            <>
              <span>·</span>
              <span className="text-rose-600">{totals.inactive} inactivas</span>
            </>
          )}
        </div>
      </div>

      {/* Tabla de frases */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase">
                <th className="px-3 py-2.5">Código</th>
                <th className="px-3 py-2.5">Frase</th>
                <th className="px-3 py-2.5">Categoría</th>
                <th className="px-3 py-2.5">Rareza</th>
                <th className="px-3 py-2.5">Tipo</th>
                <th className="px-3 py-2.5">Requisito</th>
                <th className="px-3 py-2.5 text-center">Usuarios</th>
                <th className="px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const cat = CATEGORY_OPTIONS.find((c) => c.value === item.category);
                return (
                  <tr key={item.code} className={`hover:bg-slate-50 ${!item.active ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{item.code}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-base mr-1.5">{item.emoji}</span>
                      <span className="font-medium text-slate-800">{item.text}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">
                      {cat ? `${cat.icon} ${cat.label}` : item.category}
                    </td>
                    <td className="px-3 py-2.5">
                      <RarityBadge rarity={item.rarity} />
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {item.is_default ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">Default</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">Desbloqueable</span>
                      )}
                      {!item.active && (
                        <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">
                          <EyeOff className="w-3 h-3" /> Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-slate-500 max-w-[260px] truncate">
                      {item.unlock_requirement ? JSON.stringify(item.unlock_requirement) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {Number(item.equipped_count) || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditing(item)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">Sin resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing === '__new' && (
          <EditDialog
            mode="create"
            item={null}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}
        {editing && typeof editing === 'object' && !editing.__confirm_delete && (
          <EditDialog
            mode="edit"
            item={editing}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}
        {editing && typeof editing === 'object' && editing.__confirm_delete && (
          <ConfirmDeleteDialog
            message={editing.message}
            onCancel={() => setEditing(null)}
            onConfirm={() => confirmDelete(editing.item.code)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Modal de edición / creación
// ─────────────────────────────────────────────────────────────────────────
function EditDialog({ mode, item, onClose, onSave }) {
  const isCreate = mode === 'create';
  const [form, setForm] = useState(() => ({
    code: item?.code || '',
    text: item?.text || '',
    emoji: item?.emoji || '',
    category: item?.category || 'cheer',
    rarity: item?.rarity || 'common',
    is_default: item?.is_default ?? true,
    unlock_requirement_text: item?.unlock_requirement
      ? JSON.stringify(item.unlock_requirement, null, 2)
      : '',
    sort_order: item?.sort_order ?? 999,
    active: item?.active ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    let parsed = null;
    if (!form.is_default) {
      const txt = (form.unlock_requirement_text || '').trim();
      if (txt) {
        try {
          parsed = JSON.parse(txt);
        } catch (err) {
          setJsonError('JSON inválido: ' + err.message);
          return;
        }
      }
    }
    setJsonError('');
    setSaving(true);
    const ok = await onSave({ ...form, unlock_requirement: parsed });
    setSaving(false);
    if (!ok) return;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {isCreate ? 'Nueva frase' : 'Editar frase'}
            </h3>
            {!isCreate && (
              <p className="text-xs text-slate-500 font-mono">
                {item.code} · {Number(item.equipped_count) || 0} usuarios la tienen equipada
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vista previa</p>
            <p className="text-base font-semibold text-slate-800">
              <span className="text-xl mr-2 align-middle">{form.emoji || '💬'}</span>
              {form.text || <span className="italic text-slate-400">(sin texto)</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Código *</Label>
              <Input
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                disabled={!isCreate}
                className="font-mono text-xs"
                placeholder="default_30 / spicy_32 …"
              />
              {!isCreate && (
                <p className="text-[10px] text-slate-400 mt-0.5">Inmutable</p>
              )}
            </div>
            <div>
              <Label className="text-xs">Emoji</Label>
              <Input
                value={form.emoji}
                onChange={(e) => update('emoji', e.target.value)}
                placeholder="🎉"
                className="text-lg"
                maxLength={4}
              />
            </div>
            <div>
              <Label className="text-xs">Orden</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => update('sort_order', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Texto * (máx. 80)</Label>
            <Input
              value={form.text}
              onChange={(e) => update('text', e.target.value.slice(0, 80))}
              placeholder="¡Buena suerte!"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Categoría</Label>
              <select
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Rareza</Label>
              <select
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm"
                value={form.rarity}
                onChange={(e) => update('rarity', e.target.value)}
              >
                {RARITY_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="is_default"
                checked={form.is_default}
                onChange={(e) => update('is_default', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="is_default" className="text-sm font-semibold cursor-pointer m-0">
                Frase por defecto (todos los usuarios la tienen sin desbloquear)
              </Label>
            </div>

            {!form.is_default && (
              <>
                <Label className="text-xs">Requisito de desbloqueo (JSON)</Label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs mb-2"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) update('unlock_requirement_text', e.target.value);
                  }}
                >
                  <option value="">— Plantilla —</option>
                  {UNLOCK_TEMPLATES.filter((t) => t.value).map((t) => (
                    <option key={t.label} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono min-h-[100px]"
                  value={form.unlock_requirement_text}
                  onChange={(e) => update('unlock_requirement_text', e.target.value)}
                  placeholder='{"type":"duels_won","count":5}'
                />
                {jsonError && <p className="text-xs text-rose-600 mt-1">{jsonError}</p>}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => update('active', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="active" className="text-sm cursor-pointer m-0">
              Activa (visible para los usuarios)
            </Label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !form.code || !form.text}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Guardando…' : (isCreate ? 'Crear' : 'Guardar')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Modal de confirmación de eliminado
// ─────────────────────────────────────────────────────────────────────────
function ConfirmDeleteDialog({ message, onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" /> Eliminar frase
        </h3>
        <p className="text-sm text-slate-600 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
            <Trash2 className="w-4 h-4 mr-1" /> Eliminar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
