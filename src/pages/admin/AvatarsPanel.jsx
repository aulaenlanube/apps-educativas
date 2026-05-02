import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Edit3, RefreshCw, Search, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar, { RarityBadge, rarityMeta } from '@/components/ui/UserAvatar';
import { invalidateAvatarCatalog } from '@/hooks/useAvatarCatalog';

const RARITY_BONUS = { common: 0.1, rare: 0.2, epic: 0.3, legendary: 0.4, mythic: 0.5 };
const RARITY_OPTIONS = [
  { value: 'common',    label: 'Común (0,1)' },
  { value: 'rare',      label: 'Raro (0,2)' },
  { value: 'epic',      label: 'Épico (0,3)' },
  { value: 'legendary', label: 'Legendario (0,4)' },
  { value: 'mythic',    label: 'Mítico (0,5)' },
];

export default function AvatarsPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('avatar_admin_list');
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
    if (rarityFilter !== 'all') list = list.filter((i) => i.rarity === rarityFilter);
    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter((i) =>
        i.code.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, rarityFilter]);

  const handleSave = async (form) => {
    const { error, data } = await supabase.rpc('avatar_admin_upsert', {
      p_code: form.code,
      p_title: form.title,
      p_description: form.description,
      p_rarity: form.rarity,
      p_points_bonus: Number(form.points_bonus),
      p_image_lg: form.image_lg,
      p_image_md: form.image_md,
      p_image_sm: form.image_sm,
      p_unlock_label: form.unlock_label,
      p_unlock_requirement: form.unlock_requirement,
      p_sort_order: Number(form.sort_order || 0),
      p_active: form.active,
    });
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      return false;
    }
    toast({ title: 'Avatar guardado' });
    invalidateAvatarCatalog();
    setEditing(null);
    fetchAll();
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por título, código o descripción"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
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
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <p className="text-xs text-slate-500 ml-auto">
            {filtered.length} de {items.length} avatares
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((item) => (
          <AvatarAdminCard key={item.code} item={item} onEdit={() => setEditing(item)} />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">Sin resultados.</div>
        )}
      </div>

      {editing && (
        <EditDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function AvatarAdminCard({ item, onEdit }) {
  const meta = rarityMeta(item.rarity);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square bg-slate-100">
        <img src={item.image_md} alt={item.title} className={`w-full h-full object-cover ${!item.active ? 'grayscale opacity-60' : ''}`} loading="lazy" />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 0 4px ${meta.ring}` }} />
        <div className="absolute top-1.5 left-1.5">
          <RarityBadge rarity={item.rarity} />
        </div>
        <div className="absolute bottom-1.5 left-1.5 text-[10px] font-black rounded-full px-2 py-0.5 text-white shadow"
             style={{ background: `linear-gradient(135deg, ${meta.ring}, ${meta.glow})` }}>
          +{Number(item.points_bonus).toFixed(1)}
        </div>
        {!item.active && (
          <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> Inactivo
          </div>
        )}
      </div>
      <div className="p-3 space-y-1 flex-1 flex flex-col">
        <p className="text-[10px] text-slate-400 font-mono">{item.code}</p>
        <p className="text-[11px] text-slate-600 line-clamp-3 italic leading-snug">{item.description}</p>
        <div className="text-[11px] text-slate-500 mt-auto pt-2 border-t border-slate-100 flex justify-between">
          <span>{item.unlock_label || '—'}</span>
          <span className="font-bold tabular-nums">{Number(item.owners_count) || 0} 🧑‍🎓</span>
        </div>
        <Button
          size="sm"
          onClick={onEdit}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Edit3 className="w-3 h-3 mr-1" /> Editar
        </Button>
      </div>
    </motion.div>
  );
}

function EditDialog({ item, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    code: item.code,
    title: item.title,
    description: item.description || '',
    rarity: item.rarity,
    points_bonus: item.points_bonus,
    image_lg: item.image_lg,
    image_md: item.image_md,
    image_sm: item.image_sm,
    unlock_label: item.unlock_label || '',
    unlock_requirement_text: JSON.stringify(item.unlock_requirement || {}, null, 2),
    sort_order: item.sort_order,
    active: item.active,
  }));
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRarityChange = (r) => {
    setForm((f) => ({ ...f, rarity: r, points_bonus: RARITY_BONUS[r] ?? f.points_bonus }));
  };

  const handleSubmit = async () => {
    let parsed;
    try {
      parsed = JSON.parse(form.unlock_requirement_text || '{}');
    } catch (err) {
      setJsonError('JSON inválido: ' + err.message);
      return;
    }
    setJsonError('');
    setSaving(true);
    const ok = await onSave({ ...form, unlock_requirement: parsed });
    setSaving(false);
    if (!ok) return; // toast lo gestiona el padre
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Editar avatar</h3>
            <p className="text-xs text-slate-500 font-mono">{item.code}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-4 items-start">
            <UserAvatar
              selectedAvatarCode={null}
              size="hero"
              shape="rounded"
              showRarityBorder
            />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Rareza</Label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm"
                  value={form.rarity}
                  onChange={(e) => handleRarityChange(e.target.value)}
                >
                  {RARITY_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Bonus a la nota</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.5"
                  value={form.points_bonus}
                  onChange={(e) => update('points_bonus', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Descripción</Label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm min-h-[80px]"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Imagen 512</Label>
              <Input value={form.image_lg} onChange={(e) => update('image_lg', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Imagen 256</Label>
              <Input value={form.image_md} onChange={(e) => update('image_md', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Imagen 128</Label>
              <Input value={form.image_sm} onChange={(e) => update('image_sm', e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs">Etiqueta del desbloqueo (qué ve el alumno)</Label>
            <Input value={form.unlock_label} onChange={(e) => update('unlock_label', e.target.value)} />
          </div>

          <div>
            <Label className="text-xs">Requisito (JSON)</Label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-mono min-h-[120px]"
              value={form.unlock_requirement_text}
              onChange={(e) => update('unlock_requirement_text', e.target.value)}
            />
            {jsonError && <p className="text-xs text-rose-600 mt-1">{jsonError}</p>}
            <details className="mt-1 text-[11px] text-slate-500">
              <summary className="cursor-pointer">Tipos disponibles</summary>
              <pre className="text-[10px] bg-slate-50 p-2 rounded mt-1 overflow-x-auto">
{`{"type":"first_session"}
{"type":"total_sessions","count":5,"mode":"test"}
{"type":"unique_apps","count":8}
{"type":"app_sessions","app_id":"rosco-del-saber","mode":"test","count":3,"min_nota":7}
{"type":"subject_exams","subject_id":"lengua","count":10,"min_nota":8}
{"type":"perfect_exams","count":15}
{"type":"high_score_exams","count":10,"min_nota":8.5}
{"type":"badges_count","count":30}
{"type":"level","value":15}
{"type":"xp","amount":1000}
{"type":"duels_won","count":10}
{"type":"battles_won","count":5,"position":3}
{"type":"top_class","position":1}
{"type":"top_global","position":1}
{"type":"streak_days","count":7}`}
              </pre>
            </details>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Orden</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => update('sort_order', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Estado</Label>
              <button
                type="button"
                onClick={() => update('active', !form.active)}
                className={`w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium border ${
                  form.active
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {form.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {form.active ? 'Activo (visible)' : 'Inactivo (oculto)'}
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
