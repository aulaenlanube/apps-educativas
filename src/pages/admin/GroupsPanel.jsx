import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Hash, GraduationCap, BookOpen, Calendar,
  ChevronRight, X, Copy, Mail, AtSign, Trophy, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import materiasData from '/public/data/materias.json';

const LEVEL_LABELS = {
  primaria: 'Primaria',
  eso: 'ESO',
  bachillerato: 'Bachillerato',
};

function formatDate(dateStr, withTime = false) {
  if (!dateStr) return '-';
  const opts = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('es-ES', opts);
}

function getSubjectName(level, grade, subjectId) {
  if (!subjectId) return null;
  const list = materiasData?.[level]?.[grade];
  if (!Array.isArray(list)) return subjectId;
  const match = list.find((s) => s.id === subjectId);
  return match ? `${match.icon} ${match.nombre}` : subjectId;
}

function copyToClipboard(text) {
  if (!text) return;
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* ignore */
  }
}

function GroupDetailModal({ groupId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      const { data: res, error: err } = await supabase.rpc('admin_get_group_detail', {
        p_group_id: groupId,
      });
      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else if (res?.error) {
        setError(res.error);
      } else {
        setData(res);
      }
      setLoading(false);
    }
    if (groupId) run();
    return () => { cancelled = true; };
  }, [groupId]);

  const group = data?.group;
  const students = data?.students || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate">
                {loading ? 'Cargando grupo...' : group?.name || 'Grupo'}
              </h3>
              {group?.group_code && (
                <button
                  onClick={() => copyToClipboard(group.group_code)}
                  title="Copiar codigo de grupo"
                  className="inline-flex items-center gap-1 mt-1 text-xs font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors"
                >
                  <Hash className="w-3 h-3" />
                  {group.group_code}
                  <Copy className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          ) : (
            <>
              {/* Grupo info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard icon={GraduationCap} label="Nivel / Curso" value={formatLevelGrade(group)} />
                <InfoCard
                  icon={BookOpen}
                  label="Asignatura"
                  value={getSubjectName(group?.level, group?.grade, group?.subject_id) || 'Sin asignatura'}
                />
                <InfoCard
                  icon={Users}
                  label="Docente propietario"
                  value={group?.teacher_name || '(sin propietario)'}
                  sub={group?.teacher_email}
                  badge={group?.teacher_role === 'admin' ? 'ADMIN' : null}
                />
                <InfoCard
                  icon={Calendar}
                  label="Creado"
                  value={formatDate(group?.created_at)}
                  sub={group?.updated_at ? `Actualizado ${formatDate(group?.updated_at)}` : null}
                />
              </div>

              {group?.description && (
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                  {group.description}
                </div>
              )}

              {/* Co-docentes */}
              {group?.co_teachers?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Co-docentes ({group.co_teachers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.co_teachers.map((ct) => (
                      <div
                        key={ct.id}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="font-medium">{ct.display_name}</span>
                        {ct.email && <span className="text-blue-500">· {ct.email}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alumnos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Alumnos ({students.length})
                  </h4>
                </div>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Este grupo no tiene alumnos</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                          <th className="text-left px-3 py-2">Alumno</th>
                          <th className="text-left px-3 py-2 hidden md:table-cell">Usuario</th>
                          <th className="text-left px-3 py-2 hidden lg:table-cell">Email</th>
                          <th className="text-right px-3 py-2">Nivel</th>
                          <th className="text-right px-3 py-2 hidden sm:table-cell">Partidas</th>
                          <th className="text-right px-3 py-2 hidden md:table-cell">Ultima act.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{s.avatar_emoji || '🎓'}</span>
                                <div className="min-w-0">
                                  <div className="font-medium text-slate-800 truncate">
                                    {s.display_name || s.username}
                                  </div>
                                  {!s.has_password && !s.has_auth_user && (
                                    <div className="text-[10px] font-bold text-amber-600">
                                      Sin contrasena
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 hidden md:table-cell text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <AtSign className="w-3 h-3" /> {s.username}
                              </span>
                            </td>
                            <td className="px-3 py-2 hidden lg:table-cell text-slate-500 truncate max-w-[200px]">
                              {s.email ? (
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {s.email}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                {s.level}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right hidden sm:table-cell text-slate-500">
                              {s.total_sessions}
                            </td>
                            <td className="px-3 py-2 text-right hidden md:table-cell text-slate-500">
                              {formatDate(s.last_activity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, sub, badge }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800 flex items-center gap-2 flex-wrap">
        <span className="truncate">{value}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700">
            {badge}
          </span>
        )}
      </div>
      {sub && <div className="text-xs text-slate-400 truncate">{sub}</div>}
    </div>
  );
}

function formatLevelGrade(group) {
  if (!group) return '-';
  const levelLabel = LEVEL_LABELS[group.level] || group.level || '';
  const grade = group.grade ? ` · ${group.grade}º` : '';
  return `${levelLabel}${grade}` || 'Sin asignar';
}

const GroupsPanel = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await supabase.rpc('admin_get_groups', {
      p_search: debouncedSearch || null,
    });
    if (err) {
      setError(err.message);
    } else if (res?.error) {
      setError(res.error);
    } else {
      setData(res);
    }
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const groups = data?.groups || [];

  const summary = useMemo(() => {
    if (!groups.length) return null;
    const students = groups.reduce((acc, g) => acc + (g.student_count || 0), 0);
    const sessions = groups.reduce((acc, g) => acc + (g.total_sessions || 0), 0);
    const empty = groups.filter((g) => !g.student_count).length;
    return { total: groups.length, students, sessions, empty };
  }, [groups]);

  return (
    <div className="space-y-4">
      {/* Busqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre del grupo, codigo o docente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon="👥" label="Grupos" value={summary.total} />
          <SummaryCard icon="🎓" label="Alumnos totales" value={summary.students} />
          <SummaryCard icon="🎮" label="Partidas totales" value={summary.sessions} />
          <SummaryCard icon="⚠️" label="Grupos vacios" value={summary.empty} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Listado */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-700">
              {loading
                ? 'Cargando grupos...'
                : `${groups.length} grupo${groups.length !== 1 ? 's' : ''}`}
            </span>
            {debouncedSearch && !loading && (
              <span className="text-xs text-slate-400">filtrado por "{debouncedSearch}"</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No se encontraron grupos</p>
            {debouncedSearch && <p className="text-sm mt-1">Prueba con otro termino de busqueda</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {groups.map((g, i) => (
              <GroupRow
                key={g.id}
                group={g}
                delay={i}
                onOpen={() => setSelectedGroupId(g.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedGroupId && (
          <GroupDetailModal
            groupId={selectedGroupId}
            onClose={() => setSelectedGroupId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

function GroupRow({ group, delay, onOpen }) {
  const isEmpty = !group.student_count;
  const levelGrade = formatLevelGrade(group);
  const subject = getSubjectName(group.level, group.grade, group.subject_id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(delay, 20) * 0.015 }}
      onClick={onOpen}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0">
        <Users className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800 truncate">{group.name}</span>
          {group.group_code && (
            <span className="text-[10px] font-mono bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
              {group.group_code}
            </span>
          )}
          {isEmpty && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              VACIO
            </span>
          )}
          {group.teacher_role === 'admin' && (
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 truncate">
          {group.teacher_name || '(sin docente)'}
          {group.teacher_email && ` · ${group.teacher_email}`}
        </div>
        <div className="text-xs text-slate-400 truncate">
          {levelGrade}
          {subject && ` · ${subject}`}
          {group.co_teachers?.length > 0 && ` · +${group.co_teachers.length} co-docente${group.co_teachers.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      <div className="text-right hidden sm:block shrink-0">
        <div className="text-sm font-medium text-slate-700">
          {group.student_count || 0} alumno{group.student_count !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-slate-400">
          {group.total_sessions || 0} partidas
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
    </motion.div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}

export default GroupsPanel;
