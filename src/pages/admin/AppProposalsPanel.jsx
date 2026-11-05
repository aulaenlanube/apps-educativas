// src/pages/admin/AppProposalsPanel.jsx
// Admin → Propuestas: lo que el público pide en «Propón una app». Para cada
// propuesta enseña las apps que YA existen y se parecen (las que vio quien la
// envió + las que encontramos ahora), y prepara la respuesta por correo.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Mail, CheckCircle2, Undo2, Ban, Trash2, ExternalLink, RefreshCw, Save, X } from 'lucide-react';
import BrandLoader from '@/components/ui/BrandLoader';
import { APP_INDEX, suggestExistingApps } from '@/data/appIndex';
import { SITE_URL } from '@/data/appStats';
import {
  adminListAppProposals, adminUpdateAppProposal, adminDeleteAppProposal,
} from '@/services/appProposalService';

const FILTERS = [
  { id: 'nueva', label: 'Nuevas' },
  { id: 'respondida', label: 'Respondidas' },
  { id: 'descartada', label: 'Descartadas' },
  { id: 'all', label: 'Todas' },
];
const STATUS_STYLE = {
  nueva: 'bg-amber-100 text-amber-800',
  respondida: 'bg-emerald-100 text-emerald-800',
  descartada: 'bg-slate-200 text-slate-600',
};
const SOURCE_LABEL = { portada: 'Portada', adaptaciones: 'Adaptaciones', catalogo: 'Catálogo' };
const BY_KEY = new Map(APP_INDEX.map((e) => [e.key, e]));
const appUrl = (key) => `${SITE_URL}/adaptaciones?app=${encodeURIComponent(key)}`;

function matchesFor(p) {
  const seen = new Map();
  for (const key of p.suggested_apps || []) if (BY_KEY.has(key)) seen.set(key, BY_KEY.get(key));
  for (const e of suggestExistingApps(`${p.idea} ${p.curso}`, 4)) seen.set(e.key, e);
  return [...seen.values()];
}

function mailtoFor(p, matches) {
  const subject = 'Tu propuesta de app en apps-educativas.com';
  const lines = [
    'Hola:',
    '',
    `Gracias por proponer una app para ${p.curso}. Nos escribiste:`,
    `«${p.idea}»`,
    '',
  ];
  if (matches.length) {
    lines.push('Puede que ya tengamos algo parecido:');
    for (const m of matches) lines.push(`- ${m.name}: ${appUrl(m.key)}`);
    lines.push('');
  }
  lines.push('Un saludo,', 'Edu');
  return `mailto:${encodeURIComponent(p.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function ConfirmDelete({ proposal, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="del-title" className="text-lg font-bold text-slate-800 mb-2">¿Borrar esta propuesta?</h3>
        <p className="text-sm text-slate-600 mb-1">Se borra del todo, también el correo de <strong>{proposal.email}</strong>.</p>
        <p className="text-sm text-slate-500 mb-5">Úsalo para spam o si te piden que borres sus datos.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Borrar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProposalCard({ p, onChanged, onAskDelete }) {
  const matches = useMemo(() => matchesFor(p), [p]);
  const [notes, setNotes] = useState(p.admin_notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = async (status) => {
    setBusy(true);
    setError('');
    const res = await adminUpdateAppProposal(p.id, status, notes);
    setBusy(false);
    if (res?.error) setError(res.error); else onChanged();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[p.status] || ''}`}>{p.status}</span>
        <span className="text-slate-500">{new Date(p.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        {p.source && <span className="text-slate-400">· desde {SOURCE_LABEL[p.source] || p.source}</span>}
      </div>
      <p className="text-slate-800 font-semibold whitespace-pre-wrap break-words">{p.idea}</p>
      <p className="text-sm text-slate-600 mt-1"><span className="font-medium">Curso / asignatura:</span> {p.curso}</p>
      <p className="text-sm mt-1">
        <a href={mailtoFor(p, matches)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium break-all">
          <Mail className="w-4 h-4 shrink-0" /> {p.email}
        </a>
      </p>

      {matches.length > 0 && (
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-xs font-bold text-emerald-800 mb-1.5">Puede que ya exista:</p>
          <div className="flex flex-wrap gap-1.5">
            {matches.map((m) => (
              <a key={m.key} href={`/adaptaciones?app=${encodeURIComponent(m.key)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100">
                {m.emoji} {m.name} <span className="text-emerald-600 font-normal">· {m.adaptations.length}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      <label className="block mt-3">
        <span className="text-xs font-medium text-slate-500">Notas internas</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={2000} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Qué le contestaste, si se hará, etc." />
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-3">
        <a href={mailtoFor(p, matches)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
          <Mail className="w-4 h-4" /> Responder
        </a>
        {p.status !== 'respondida' && (
          <button type="button" disabled={busy} onClick={() => update('respondida')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            <CheckCircle2 className="w-4 h-4" /> Marcar respondida
          </button>
        )}
        {p.status !== 'nueva' && (
          <button type="button" disabled={busy} onClick={() => update('nueva')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
            <Undo2 className="w-4 h-4" /> Volver a nueva
          </button>
        )}
        {p.status !== 'descartada' && (
          <button type="button" disabled={busy} onClick={() => update('descartada')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
            <Ban className="w-4 h-4" /> Descartar
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => update(p.status)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Save className="w-4 h-4" /> Guardar notas
        </button>
        <button type="button" disabled={busy} onClick={() => onAskDelete(p)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
          <Trash2 className="w-4 h-4" /> Borrar
        </button>
      </div>
    </div>
  );
}

export default function AppProposalsPanel() {
  const [filter, setFilter] = useState('nueva');
  const [data, setData] = useState({ proposals: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminListAppProposals(filter);
    if (res?.error) setError(res.error); else { setError(''); setData(res); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    const p = toDelete;
    setToDelete(null);
    const res = await adminDeleteAppProposal(p.id);
    if (res?.error) setError(res.error);
    load();
  };

  const counts = data.counts || {};
  const total = (counts.nueva || 0) + (counts.respondida || 0) + (counts.descartada || 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">Propuestas de apps</h2>
          <span className="text-sm text-slate-500">· se borran solas a los 12 meses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200">
            {FILTERS.map((f) => {
              const n = f.id === 'all' ? total : counts[f.id] || 0;
              return (
                <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {f.label} <span className="opacity-75">({n})</span>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={load} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Actualizar">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><BrandLoader variant="inline" /></div>
      ) : data.proposals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
          No hay propuestas {filter === 'all' ? '' : `${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} `}todavía.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.proposals.map((p) => (
            <ProposalCard key={`${p.id}-${p.status}`} p={p} onChanged={load} onAskDelete={setToDelete} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {toDelete && <ConfirmDelete proposal={toDelete} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />}
      </AnimatePresence>
    </div>
  );
}
