import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Rocket, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Selector de grupo reutilizable.
 * - Muestra lista de grupos del alumno
 * - Opcion "Practicar libre"
 * - Opcion "Unirse a grupo" (si showJoin=true)
 *
 * Props:
 *  - groups: array [{group_id, group_name, group_code, teacher_name}]
 *  - activeGroupId: UUID | null
 *  - onSelect(group): llamado al elegir grupo o null (libre)
 *  - showJoin: boolean - mostrar opcion unirse a grupo
 *  - studentId: UUID - para unirse a grupo
 *  - onGroupJoined: callback tras unirse
 *  - compact: boolean - modo compacto (dropdown-like)
 */
export default function GroupSelector({ groups = [], activeGroupId, onSelect, showJoin = false, studentId, onGroupJoined, compact = false }) {
  const { student } = useAuth();
  const { toast } = useToast();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);

    const { data, error } = await supabase.rpc('student_join_group', {
      p_student_id: studentId,
      p_group_code: joinCode.trim(),
      p_session_token: student?.session_token,
    });

    setJoining(false);

    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      return;
    }

    toast({ title: 'Te has unido al grupo', description: data.group.group_name });
    setJoinCode('');
    setShowJoinInput(false);
    onGroupJoined?.(data.group);
  };

  const containerClass = compact ? 'space-y-1' : 'space-y-2';

  return (
    <div className={containerClass}>
      {/* Grupos */}
      {groups.map((g, i) => {
        const isActive = activeGroupId === g.group_id;
        return (
          <motion.button
            key={g.group_id}
            initial={compact ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect?.(g)}
            className={`w-full flex items-center gap-3 px-3 ${compact ? 'py-2' : 'py-3'} rounded-xl text-left transition-all ${
              isActive
                ? 'bg-indigo-100 border-2 border-indigo-400 shadow-sm'
                : 'bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-800' : 'text-slate-700'}`}>
                {g.group_name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {g.teacher_name} · {g.group_code}
              </p>
            </div>
            {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
            {!isActive && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
          </motion.button>
        );
      })}

      {/* Practicar libre */}
      <motion.button
        initial={compact ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: groups.length * 0.05 }}
        onClick={() => onSelect?.(null)}
        className={`w-full flex items-center gap-3 px-3 ${compact ? 'py-2' : 'py-3'} rounded-xl text-left transition-all ${
          activeGroupId === null
            ? 'bg-emerald-100 border-2 border-emerald-400 shadow-sm'
            : 'bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          activeGroupId === null ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          <Rocket className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${activeGroupId === null ? 'text-emerald-800' : 'text-slate-700'}`}>
            Practicar libre
          </p>
          <p className="text-[11px] text-slate-400">Juega por tu cuenta sin grupo</p>
        </div>
        {activeGroupId === null && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
      </motion.button>

      {/* Unirse a grupo */}
      {showJoin && (
        <div className="pt-2">
          {!showJoinInput ? (
            <button
              onClick={() => setShowJoinInput(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Unirse a otro grupo
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="GRP-XXXX"
                className="flex-1 font-mono text-center"
                maxLength={8}
              />
              <Button onClick={handleJoinGroup} disabled={joining || !joinCode.trim()}
                className="bg-indigo-600 text-white hover:bg-indigo-700">
                {joining ? '...' : 'Unirse'}
              </Button>
              <Button variant="outline" onClick={() => { setShowJoinInput(false); setJoinCode(''); }}>
                X
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
