import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, AlertCircle, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getGradeWithDuelBonus } from '@/services/duelService';

function fmt(n, digits = 1) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(digits).replace('.', ',');
}

function signed(n, digits = 2) {
  const v = Number(n) || 0;
  const sign = v > 0 ? '+' : v < 0 ? '−' : '+';
  return `${sign}${Math.abs(v).toFixed(digits).replace('.', ',')}`;
}

export default function DuelGradePanel({ refreshKey = 0 }) {
  const { student } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!student) return;
    let alive = true;
    getGradeWithDuelBonus({ studentId: student.id, sessionToken: student.session_token })
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData(null); });
    return () => { alive = false; };
  }, [student, refreshKey]);

  // Mostrada SIEMPRE, incluso sin datos: se ve el esqueleto con 0s/— para que el
  // alumno sepa que existe el bloque de nota con las 3 bonificaciones.
  const d = data || {};
  const currentTerm = Number(d.current_term) || null;
  const ct = d.current_term_data || {};
  // La nota actual se basa en la evaluacion en curso (override del docente o
  // inferido por fecha). El nivel es global (no depende de evaluacion).
  const base = ct.base_grade == null ? null : Number(ct.base_grade);
  const duelBonus = Number(ct.duel_bonus) || 0;
  const duelTaskBonus = Number(ct.duel_task_bonus) || 0;
  const duelPersonalBonus = Number(ct.duel_personal_bonus) || 0;
  const duelCounts = ct.duel_counts || {};
  const battleBonus = Number(ct.battle_bonus) || 0;
  const battleScore = Number(ct.battle_score) || 0;
  const progressBonus = Number(d.progress_bonus) || 0;
  const level = Number(d.level) || 1;
  const finalGrade = ct.final_grade == null ? null : Number(ct.final_grade);
  const debts = d.debts || [];
  const bc = ct.battle_counts || {};
  const podium = [bc.first || 0, bc.second || 0, bc.third || 0];

  const taskWins = Number(duelCounts.task_wins) || 0;
  const taskLosses = Number(duelCounts.task_losses) || 0;
  const taskNet = taskWins - taskLosses;
  const firstCount = podium[0];
  const secondCount = podium[1];
  const thirdCount = podium[2];

  // Progresos 0..1 para las barras
  const progressPct = Math.min(1, Math.max(0, (level - 1) / 49));
  const battlePct = Math.min(1, battleScore / 10);
  const duelTaskPct = Math.min(1, Math.abs(taskNet) / 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Swords className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Mi nota actual {currentTerm ? `· ${currentTerm}ª evaluación` : ''}
        </h3>
        <span className="ml-auto text-[11px] text-slate-400">Cada bonus: máx ±0,5</span>
      </div>
      <p className="text-[11px] text-slate-400 mb-4">
        Progresión rápida al inicio y cada vez más lenta. Tope +0,5 en nivel 50, 10 batallas ganadas y 10 duelos-tarea ganados.
      </p>

      {/* Fila principal: base + 3 bonus = final */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <BonusCard
          label="Tareas"
          value={base == null ? '—' : fmt(base)}
          sub={currentTerm ? `${currentTerm}ª eval · media pond.` : 'media ponderada'}
          color="bg-slate-50 border-slate-200 text-slate-700"
        />
        <BonusCard
          icon={<Swords className="w-3 h-3" />}
          label="Duelos"
          value={signed(duelBonus)}
          sub={
            taskWins + taskLosses === 0 && duelPersonalBonus === 0
              ? 'sin duelos aún'
              : `tarea: ${signed(duelTaskBonus)} · retos: ${signed(duelPersonalBonus)}`
          }
          progress={duelTaskPct}
          color={
            duelBonus > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : duelBonus < 0 ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-slate-50 border-slate-200 text-slate-500'
          }
        />
        <BonusCard
          icon={<Zap className="w-3 h-3" />}
          label="Batallas"
          value={signed(battleBonus)}
          sub={
            firstCount + secondCount + thirdCount > 0
              ? `🥇${firstCount} · 🥈${secondCount} · 🥉${thirdCount}`
              : 'sin podios aún'
          }
          progress={battlePct}
          color={battleBonus > 0 ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-slate-50 border-slate-200 text-slate-500'}
        />
        <BonusCard
          icon={<Sparkles className="w-3 h-3" />}
          label="Nivel"
          value={signed(progressBonus)}
          sub={`nivel ${level}/50`}
          progress={progressPct}
          color={progressBonus > 0 ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-slate-50 border-slate-200 text-slate-500'}
        />

        <div className="col-span-2 md:col-span-1 p-3 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-center shadow">
          <p className="text-[11px] uppercase font-semibold text-white/80 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> Nota final
          </p>
          <p className="text-2xl font-black mt-1">{fmt(finalGrade, 2)}</p>
          <p className="text-[10px] text-white/70">
            {currentTerm ? `${currentTerm}ª evaluación` : 'tu nota real'}
          </p>
        </div>
      </div>

      {/* Leyenda: como se calcula */}
      <div className="mt-3 text-[11px] text-slate-400 text-center">
        Tareas {base == null ? '—' : fmt(base, 2)}
        {' '}{signed(duelBonus)} duelos
        {' '}{signed(battleBonus)} batallas
        {' '}{signed(progressBonus)} nivel
        {' '}= <span className="font-semibold text-slate-600">{fmt(finalGrade, 2)}</span>
      </div>

      {debts.length > 0 && (
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

function BonusCard({ icon, label, value, sub, color, progress }) {
  return (
    <div className={`p-3 rounded-xl border text-center ${color}`}>
      <p className="text-[11px] uppercase font-semibold flex items-center justify-center gap-1">
        {icon}{label}
      </p>
      <p className="text-2xl font-black mt-1">{value}</p>
      <p className="text-[10px] opacity-70 truncate">{sub}</p>
      {progress != null && (
        <div className="mt-1.5 h-1 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-current opacity-70 rounded-full transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
