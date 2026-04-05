import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Users, Rocket, UserPlus, X, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function CreateFreeUserDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { data, error: err } = await supabase.rpc('admin_create_free_user', {
      p_email: email,
      p_password: password,
      p_display_name: name,
    });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    if (data?.error) {
      setError(data.error);
      return;
    }

    setSuccess(`Usuario libre "${name}" creado correctamente.`);
    setName('');
    setEmail('');
    setPassword('');
    if (onCreated) onCreated();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-800">Crear Usuario Libre</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Crea un usuario libre ficticio. No requiere verificacion de email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del usuario"
              required
              className="w-full mt-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              required
              className="w-full mt-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Contrasena</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contrasena (min 6 caracteres)"
              required
              minLength={6}
              className="w-full mt-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Usuario Libre'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

const UsersTable = ({ onSelectUser }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);
  const [showCreateFree, setShowCreateFree] = useState(false);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Reset page on filter/pageSize change
  useEffect(() => { setPage(1); }, [filter, pageSize]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: res } = await supabase.rpc('admin_get_users_paginated', {
      p_page: page,
      p_page_size: pageSize,
      p_filter: filter,
      p_search: debouncedSearch || null,
    });

    if (res && !res.error) {
      setData(res);
    }
    setLoading(false);
  }, [page, pageSize, filter, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = data ? Math.ceil(data.total_count / pageSize) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const renderRow = (user, i) => {
    const isTeacher = user.user_type === 'teacher' && user.role !== 'free';
    const isFree = user.user_type === 'teacher' && user.role === 'free';
    const isStudent = user.user_type === 'student';
    return (
      <motion.div
        key={`${user.user_type}-${user.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.015 }}
        onClick={() => onSelectUser(user)}
        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group"
      >
        {isTeacher ? (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
            {user.display_name?.[0]?.toUpperCase() || '?'}
          </div>
        ) : isFree ? (
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0">
            {user.display_name?.[0]?.toUpperCase() || '?'}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg shrink-0">
            {user.avatar_emoji || '🎓'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800 truncate">{user.display_name}</span>
            {isTeacher && (
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                user.role === 'admin'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {user.role === 'admin' ? 'ADMIN' : 'DOCENTE'}
              </span>
            )}
            {isFree && (
              <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded">LIBRE</span>
            )}
            {isStudent && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded">ALUMNO</span>
            )}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {isTeacher
              ? `${user.email} · Codigo: ${user.teacher_code}`
              : isFree
                ? user.email
                : `@${user.username} · ${user.group_name} · Prof: ${user.teacher_name}`
            }
          </div>
        </div>
        <div className="text-right hidden sm:block shrink-0">
          <div className="text-sm font-medium text-slate-700">{user.total_sessions || 0} partidas</div>
          <div className="text-xs text-slate-400">
            {user.last_activity ? `Ultima: ${formatDate(user.last_activity)}` : 'Sin actividad'}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <CreateFreeUserDialog
        open={showCreateFree}
        onClose={() => setShowCreateFree(false)}
        onCreated={() => fetchUsers()}
      />

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowCreateFree(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-xs font-medium hover:from-orange-600 hover:to-pink-600 transition-all shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Crear Libre
        </button>
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'teachers', label: 'Docentes' },
            { id: 'free', label: 'Libres' },
            { id: 'students', label: 'Alumnos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header with counts */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-700">
              {loading ? 'Cargando...' : `${data?.total_count ?? 0} usuario${(data?.total_count ?? 0) !== 1 ? 's' : ''}`}
            </span>
            {data && filter === 'all' && (
              <span className="text-xs text-slate-400">
                ({data.teachers_count} docente{data.teachers_count !== 1 ? 's' : ''}, {data.free_count || 0} libre{(data.free_count || 0) !== 1 ? 's' : ''}, {data.students_count} alumno{data.students_count !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {PAGE_SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500 hidden sm:inline">por pagina</span>
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : !data?.users || data.users.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No se encontraron usuarios</p>
            {debouncedSearch && <p className="text-sm mt-1">Prueba con otro termino de busqueda</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.users.map((user, i) => renderRow(user, i))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Pagina {page} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <PagBtn onClick={() => setPage(1)} disabled={page <= 1} title="Primera">
                <ChevronsLeft className="w-4 h-4" />
              </PagBtn>
              <PagBtn onClick={() => setPage(p => p - 1)} disabled={page <= 1} title="Anterior">
                <ChevronLeft className="w-4 h-4" />
              </PagBtn>

              {/* Page numbers */}
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      p === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <PagBtn onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} title="Siguiente">
                <ChevronRight className="w-4 h-4" />
              </PagBtn>
              <PagBtn onClick={() => setPage(totalPages)} disabled={page >= totalPages} title="Ultima">
                <ChevronsRight className="w-4 h-4" />
              </PagBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function PagBtn({ onClick, disabled, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      {children}
    </button>
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

export default UsersTable;
