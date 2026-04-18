import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Gamepad2, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { getAllAppsFlat } from '@/apps/appCatalog';

function StatusBadge({ status }) {
  if (status === 'ok-test') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Examen/Difícil
      </span>
    );
  }
  if (status === 'ok-single') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <CheckCircle2 className="w-3 h-3" /> Modo único (finalizar)
      </span>
    );
  }
  if (status === 'only-practice') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3" /> Solo práctica — revisar
      </span>
    );
  }
  if (status === 'no-data') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        <XCircle className="w-3 h-3" /> Sin sesiones aún
      </span>
    );
  }
  return null;
}

export default function AppsModeReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [report, setReport] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_apps_mode_report');
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      setReport(null);
    } else {
      setReport(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const registered = getAllAppsFlat();
    const byId = new Map();
    for (const app of registered) byId.set(app.id, {
      app_id: app.id,
      app_name: app.name,
      source: 'registered',
      level: app.level,
      grade: app.grade,
      subject_id: app.subjectId,
    });

    if (report?.apps) {
      for (const r of report.apps) {
        const existing = byId.get(r.app_id) || { app_id: r.app_id, app_name: r.app_name || r.app_id, source: 'sessions-only' };
        byId.set(r.app_id, { ...existing, ...r, app_name: existing.app_name || r.app_name });
      }
    }

    // Apply single_mode flag for configured apps even if no sessions
    const singleModeSet = new Set((report?.configured_single_mode || []).map(c => c.app_id));
    for (const [id, row] of byId.entries()) {
      if (singleModeSet.has(id) && !row.single_mode) row.single_mode = true;
    }

    return Array.from(byId.values())
      .map(r => {
        const hasTestOrHard = (r.test_count || 0) > 0 || (r.hard_count || 0) > 0 || r.has_test_mode;
        const hasSessions = (r.total_count || 0) > 0;
        let status;
        if (r.single_mode) status = 'ok-single';
        else if (hasTestOrHard) status = 'ok-test';
        else if (hasSessions) status = 'only-practice';
        else status = 'no-data';
        return { ...r, _status: status };
      })
      .sort((a, b) => a.app_name.localeCompare(b.app_name));
  }, [report]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (filter !== 'all' && r._status !== filter) return false;
      if (search && !`${r.app_name} ${r.app_id}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, filter]);

  const counts = useMemo(() => ({
    total: rows.length,
    ok: rows.filter(r => r._status === 'ok-test' || r._status === 'ok-single').length,
    review: rows.filter(r => r._status === 'only-practice').length,
    none: rows.filter(r => r._status === 'no-data').length,
  }), [rows]);

  const toggleSingleMode = async (row, next) => {
    setSaving(row.app_id);
    const { data, error } = await supabase.rpc('admin_set_app_single_mode', {
      p_app_id: row.app_id,
      p_single_mode: next,
      p_notes: next ? 'Modo único: finalizar la actividad cuenta como tarea completada' : null,
    });
    setSaving(null);
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      toast({ title: next ? 'Marcada como modo único' : 'Desmarcada como modo único' });
      load();
    }
  };

  const toggleHasTestMode = async (row, next) => {
    setSaving(row.app_id);
    const { data, error } = await supabase.rpc('admin_set_app_has_test_mode', {
      p_app_id: row.app_id,
      p_has_test_mode: next,
    });
    setSaving(null);
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      toast({ title: next ? 'Marcada con modo examen' : 'Desmarcada' });
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Informe de apps</h2>
            <p className="text-xs text-slate-500">Modos de cada app para completar tareas</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl p-3 text-left border transition-all ${filter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <div className="text-xs uppercase tracking-wide opacity-70">Total</div>
          <div className="text-2xl font-bold">{counts.total}</div>
        </button>
        <button
          onClick={() => setFilter('ok-test')}
          className={`rounded-xl p-3 text-left border transition-all ${filter === 'ok-test' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-slate-200 hover:border-green-300'}`}
        >
          <div className="text-xs uppercase tracking-wide opacity-70">OK (examen/difícil)</div>
          <div className="text-2xl font-bold">{counts.ok}</div>
        </button>
        <button
          onClick={() => setFilter('only-practice')}
          className={`rounded-xl p-3 text-left border transition-all ${filter === 'only-practice' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 hover:border-amber-300'}`}
        >
          <div className="text-xs uppercase tracking-wide opacity-70">Revisar</div>
          <div className="text-2xl font-bold">{counts.review}</div>
        </button>
        <button
          onClick={() => setFilter('no-data')}
          className={`rounded-xl p-3 text-left border transition-all ${filter === 'no-data' ? 'bg-slate-500 text-white border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <div className="text-xs uppercase tracking-wide opacity-70">Sin sesiones</div>
          <div className="text-2xl font-bold">{counts.none}</div>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
        />
      </div>

      {loading && !report ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-left">App</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-center">Test</th>
                <th className="px-3 py-2 text-center">Difícil</th>
                <th className="px-3 py-2 text-center">Práctica</th>
                <th className="px-3 py-2 text-center" title="Confirma manualmente que la app tiene modo examen/difícil">Examen</th>
                <th className="px-3 py-2 text-center">Modo único</th>
                <th className="px-3 py-2 text-center">Abrir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <motion.tr
                  key={r.app_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800">{r.app_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{r.app_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r._status} />
                  </td>
                  <td className="px-3 py-2 text-center text-slate-600 tabular-nums">{r.test_count ?? 0}</td>
                  <td className="px-3 py-2 text-center text-slate-600 tabular-nums">{r.hard_count ?? 0}</td>
                  <td className="px-3 py-2 text-center text-slate-600 tabular-nums">{r.practice_count ?? 0}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      disabled={saving === r.app_id}
                      onClick={() => toggleHasTestMode(r, !r.has_test_mode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        r.has_test_mode ? 'bg-green-600' : 'bg-slate-300'
                      } ${saving === r.app_id ? 'opacity-60' : ''}`}
                      title={r.has_test_mode ? 'Desmarcar' : 'Confirmar que la app tiene modo examen'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          r.has_test_mode ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      disabled={saving === r.app_id}
                      onClick={() => toggleSingleMode(r, !r.single_mode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        r.single_mode ? 'bg-indigo-600' : 'bg-slate-300'
                      } ${saving === r.app_id ? 'opacity-60' : ''}`}
                      title={r.single_mode ? 'Desmarcar como modo único' : 'Marcar como modo único'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          r.single_mode ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.level && r.grade && r.subject_id ? (
                      <a
                        href={`/curso/${r.level}/${r.grade}/${r.subject_id}/app/${r.app_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors"
                        title={`Abrir ${r.level} ${r.grade}º / ${r.subject_id}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Probar
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-slate-400 text-sm">
                    No hay apps que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700">
        <p className="font-semibold mb-1">Leyenda</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li><strong>Examen/Difícil</strong>: la app registra sesiones en modo <code>test</code> o <code>hard</code> — cualquiera cuenta para las tareas.</li>
          <li><strong>Modo único</strong>: al no existir modo examen, basta con finalizar la actividad para que cuente.</li>
          <li><strong>Solo práctica</strong>: la app registra sesiones únicamente en modo <code>practice</code> — marcar como modo único si corresponde.</li>
          <li><strong>Sin sesiones</strong>: nadie la ha jugado aún; no hay datos para clasificarla.</li>
        </ul>
      </div>
    </div>
  );
}
