import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Swords, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getGradeWithDuelBonus } from '@/services/duelService';

function fmt(n, digits = 1) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(digits).replace('.', ',');
}

function signed(n) {
  const v = Number(n);
  if (!v) return '+0,0';
  const sign = v > 0 ? '+' : '-';
  return `${sign}${Math.abs(v).toFixed(1).replace('.', ',')}`;
}

export default function DuelGradePanel({ refreshKey = 0 }) {
  const { student } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    let alive = true;
    setLoading(true);
    getGradeWithDuelBonus({ studentId: student.id, sessionToken: student.session_token })
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [student, refreshKey]);

  if (loading || !data) return null;

  const bonus = Number(data.bonus) || 0;
  const hasBonus = bonus !== 0;
  const debts = data.debts || [];

  const bonusColor = bonus > 0
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : bonus < 0
      ? 'bg-rose-50 border-rose-200 text-rose-700'
      : 'bg-slate-50 border-slate-200 text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Swords className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Nota con duelos</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 uppercase font-semibold">Nota base</p>
          <p className="text-2xl font-black text-slate-700 mt-1">{fmt(data.nota_base)}</p>
          <p className="text-[10px] text-slate-400">de tus tareas</p>
        </div>

        <div className={`p-3 rounded-xl border text-center ${bonusColor}`}>
          <p className="text-[11px] uppercase font-semibold flex items-center justify-center gap-1">
            {bonus > 0 ? <TrendingUp className="w-3 h-3" /> : bonus < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            Duelos
          </p>
          <p className="text-2xl font-black mt-1">{signed(bonus)}</p>
          <p className="text-[10px] opacity-70">
            {bonus > 0 ? 'bonificación' : bonus < 0 ? 'penalización' : 'sin duelos aún'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-center shadow">
          <p className="text-[11px] uppercase font-semibold text-white/80">Final</p>
          <p className="text-2xl font-black mt-1">{fmt(data.nota_final)}</p>
          <p className="text-[10px] text-white/70">tu nota real</p>
        </div>
      </div>

      {hasBonus && debts.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-bold text-amber-800">
              Tienes {debts.length} deuda{debts.length !== 1 ? 's' : ''} por saldar
            </p>
          </div>
          <ul className="space-y-1 text-xs text-amber-800">
            {debts.slice(0, 4).map(d => (
              <li key={d.duel_id} className="flex justify-between gap-2">
                <span className="truncate">{d.app_name}</span>
                <span className="font-bold shrink-0">
                  -{fmt(d.remaining, 2)} / -{fmt(d.original_stake, 2)}
                </span>
              </li>
            ))}
            {debts.length > 4 && <li className="text-amber-700/70">…y {debts.length - 4} más</li>}
          </ul>
          <p className="text-[11px] text-amber-700/80 mt-2">
            Juega en solitario a esas apps en modo examen para recuperar puntos.
          </p>
        </div>
      )}
    </motion.div>
  );
}
