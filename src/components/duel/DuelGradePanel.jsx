// "Mi nota actual" del alumno (Resumen de /mi-panel) — rediseño 2026.
// Medalla con la nota final de la evaluación en curso + desglose visual de sus
// 5 partes (tareas · 0,9 + duelos + batallas + nivel + avatares, ver CLAUDE.md
// "Sistema de nota y bonus") en barra apilada y fichas, y las deudas de duelo.
// Solo presentación: los datos salen tal cual de getGradeWithDuelBonus.
import React, { useEffect, useState } from 'react';
import { Swords, AlertCircle, Zap, Sparkles, Users, ClipboardList, Medal, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getGradeWithDuelBonus } from '@/services/duelService';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashCard, ProgressRing, Pill } from '@/components/dashboard/kit';
import './DuelGradePanel.css';

function fmt(n, digits = 1) {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(digits).replace('.', ',');
}

function signed(n, digits = 2) {
  const v = Number(n) || 0;
  const sign = v > 0 ? '+' : v < 0 ? '−' : '+';
  return `${sign}${Math.abs(v).toFixed(digits).replace('.', ',')}`;
}

function gradeMessage(n) {
  return n >= 9 ? '¡Excelente!' : n >= 7 ? '¡Muy bien!' : n >= 5 ? 'Aprobado' : 'Necesitas repasar';
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
  const avatarBonus = Number(d.avatar_bonus ?? ct.avatar_bonus) || 0;
  const avatarCount = Number(d.avatar_count) || 0;
  const level = Number(d.level) || 1;
  const finalGrade = ct.final_grade == null ? null : Number(ct.final_grade);
  const debts = d.debts || [];
  const bc = ct.battle_counts || {};
  const podium = [bc.first || 0, bc.second || 0, bc.third || 0];

  const taskWins = Number(duelCounts.task_wins) || 0;
  const taskLosses = Number(duelCounts.task_losses) || 0;
  const firstCount = podium[0];
  const secondCount = podium[1];
  const thirdCount = podium[2];

  // Progresos 0..1 para las barras
  const progressPct = Math.min(1, Math.max(0, (level - 1) / 49));
  const battlePct = Math.min(1, battleScore / 10);
  // +0,10 por duelo-tarea ganado, tope +0,5 (5 victorias; el perdedor no resta).
  const duelTaskPct = Math.min(1, Math.max(0, taskWins) / 5);
  const avatarPct = Math.min(1, avatarBonus / 0.5);

  const state = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero');

  // Las 5 partes de la nota (mismo texto/valores que antes, nueva forma).
  const parts = [
    {
      key: 'tasks',
      icon: ClipboardList,
      label: 'Tareas',
      value: base == null ? '—' : fmt(base),
      sub: base == null
        ? (currentTerm ? `${currentTerm}ª eval · sin nota aún` : 'media ponderada')
        : `${currentTerm ? `${currentTerm}ª eval · ` : ''}aporta ${fmt(base * 0.9, 2)} (× 0,9)`,
      state: base == null ? 'zero' : 'pos',
    },
    {
      key: 'duels',
      icon: Swords,
      label: 'Duelos',
      value: signed(duelBonus),
      sub: taskWins + taskLosses === 0 && duelPersonalBonus === 0
        ? 'sin duelos aún'
        : `tarea: ${signed(duelTaskBonus)} · retos: ${signed(duelPersonalBonus)}`,
      progress: duelTaskPct,
      state: state(duelBonus),
    },
    {
      key: 'battles',
      icon: Zap,
      label: 'Batallas',
      value: signed(battleBonus),
      sub: firstCount + secondCount + thirdCount > 0
        ? `🥇${firstCount} · 🥈${secondCount} · 🥉${thirdCount}`
        : 'sin podios aún',
      progress: battlePct,
      state: state(battleBonus),
    },
    {
      key: 'level',
      icon: Sparkles,
      label: 'Nivel',
      value: signed(progressBonus),
      sub: `nivel ${level}/50`,
      progress: progressPct,
      state: state(progressBonus),
    },
    {
      key: 'avatars',
      icon: Users,
      label: 'Avatares',
      value: signed(avatarBonus),
      sub: avatarCount === 0 ? 'sin avatares' : `${avatarCount} desbloqueados`,
      progress: avatarPct,
      state: state(avatarBonus),
    },
  ];

  // Barra apilada sobre la escala 0..10: tareas·0,9 + bonus positivos; si el
  // bonus de duelos es negativo se "come" el final de la barra (rayado rojo).
  const segs = [
    { key: 'tasks', v: base == null ? 0 : base * 0.9 },
    { key: 'duels', v: Math.max(0, duelBonus) },
    { key: 'battles', v: Math.max(0, battleBonus) },
    { key: 'level', v: Math.max(0, progressBonus) },
    { key: 'avatars', v: Math.max(0, avatarBonus) },
  ];
  const positive = segs.reduce((a, s) => a + s.v, 0);
  const negative = Math.min(positive, Math.max(0, -duelBonus));
  const scale = Math.max(10, positive);
  const pct = (v) => `${(v / scale) * 100}%`;

  const medalTone = finalGrade == null ? 'none' : finalGrade >= 8 ? 'good' : finalGrade >= 5 ? 'ok' : 'bad';

  return (
    <DashCard
      icon={Medal}
      tone="violet"
      className="dgp"
      title={`Mi nota actual${currentTerm ? ` · ${currentTerm}ª evaluación` : ''}`}
      subtitle="Tareas + bonus de duelos, batallas, nivel y avatares"
      actions={<Pill>Cada bonus: máx ±0,5</Pill>}
    >
      <div className="dgp__layout">
        {/* Medalla con la nota final */}
        <div className={`dgp-medal is-${medalTone}`}>
          <svg className="dgp-medal__ribbons" viewBox="0 0 120 120" aria-hidden="true">
            <path d="M30 0 L57 0 L47 116 L35 102 L20 110 Z" className="dgp-medal__ribbon dgp-medal__ribbon--l" />
            <path d="M63 0 L90 0 L100 110 L85 102 L73 116 Z" className="dgp-medal__ribbon dgp-medal__ribbon--r" />
            <path d="M33 4 L54 4 L45 104" className="dgp-medal__ribbon-shine" />
            <path d="M66 4 L87 4 L96 100" className="dgp-medal__ribbon-shine" />
          </svg>
          <span className="dgp-medal__spark dgp-medal__spark--a" aria-hidden="true">✦</span>
          <span className="dgp-medal__spark dgp-medal__spark--b" aria-hidden="true">✦</span>
          <span className="dgp-medal__spark dgp-medal__spark--c" aria-hidden="true">✦</span>
          <div className="dgp-medal__disc">
            <ProgressRing
              value={finalGrade ?? 0}
              size={168}
              stroke={8}
              tone={finalGrade == null ? 'slate' : undefined}
              label={`Nota final ${fmt(finalGrade, 2)}`}
            >
              <span className="dgp-medal__kicker">Nota final</span>
              <span className="dgp-medal__num">{fmt(finalGrade, 2)}</span>
              <span className="dgp-medal__of">{currentTerm ? `${currentTerm}ª evaluación` : 'tu nota real'}</span>
            </ProgressRing>
          </div>
          <span className="dgp-medal__msg">{finalGrade == null ? 'Sin nota todavía' : gradeMessage(finalGrade)}</span>
        </div>

        {/* Desglose */}
        <div className="dgp__parts">
          <div className="dgp-stack">
            <div className="dgp-stack__track" role="img" aria-label="Reparto de la nota final entre tareas y bonus">
              <div className="dgp-stack__fill">
                {segs.filter((s) => s.v > 0).map((s) => (
                  <span key={s.key} className={`dgp-seg is-${s.key}`} style={{ width: pct(s.v) }} />
                ))}
                {negative > 0 && (
                  <span
                    className="dgp-seg is-debt"
                    style={{ left: pct(positive - negative), width: pct(negative) }}
                    title={`Duelos ${signed(duelBonus)}`}
                  />
                )}
              </div>
              <span className="dgp-stack__mark" style={{ left: pct(5) }} aria-hidden="true" />
              {scale > 10 && <span className="dgp-stack__mark is-cap" style={{ left: pct(10) }} aria-hidden="true" />}
            </div>
            <div className="dgp-stack__ticks" aria-hidden="true">
              <span style={{ left: '0%' }}>0</span>
              <span style={{ left: pct(5) }}>5</span>
              <span style={{ left: pct(10) }}>10</span>
            </div>
          </div>

          <div className="dgp-chips">
            {parts.map((p) => (
              <div key={p.key} className={`dgp-chip is-${p.key} is-${p.state}`}>
                <span className="dgp-chip__head">
                  <span className="dgp-chip__icon"><p.icon size={14} /></span>
                  {p.label}
                </span>
                <strong className="dgp-chip__value">{p.value}</strong>
                <span className="dgp-chip__sub" title={p.sub}>{p.sub}</span>
                {p.progress != null && (
                  <span className="dgp-chip__bar"><i style={{ transform: `scaleX(${Math.round(p.progress * 100) / 100})` }} /></span>
                )}
              </div>
            ))}
          </div>

          {/* Leyenda: como se calcula */}
          <p className="dgp__formula">
            Tareas {base == null ? '—' : fmt(base, 2)} × 0,9
            {' '}<b className="is-duels">{signed(duelBonus)}</b> duelos
            {' '}<b className="is-battles">{signed(battleBonus)}</b> batallas
            {' '}<b className="is-level">{signed(progressBonus)}</b> nivel
            {' '}<b className="is-avatars">{signed(avatarBonus)}</b> avatares
            {' '}= <strong>{fmt(finalGrade, 2)}</strong>
          </p>
          <p className="dgp__note">
            <span className="dgp__cap-m">Cada bonus: máx ±0,5. </span>
            Progresión rápida al inicio y cada vez más lenta. Tope +0,5 en nivel 50, 10 batallas ganadas y 5 duelos-tarea ganados.
          </p>
        </div>
      </div>

      {debts.length > 0 && (
        <div className="dgp-debts">
          <div className="dgp-debts__head">
            <span className="dgp-debts__icon"><AlertCircle size={18} /></span>
            <strong>Tienes {debts.length} deuda{debts.length !== 1 ? 's' : ''} por saldar</strong>
          </div>
          <ul className="dgp-debts__list">
            {debts.slice(0, 4).map(debt => {
              const orig = Number(debt.original_stake) || 0;
              const rem = Number(debt.remaining) || 0;
              const paid = orig > 0 ? Math.min(1, Math.max(0, (orig - rem) / orig)) : 0;
              return (
                <li key={debt.duel_id}>
                  {debt.app_id && hasAppIcon(debt.app_id)
                    ? <AppIcon appId={debt.app_id} size={34} />
                    : <span className="dgp-debts__fallback"><Gamepad2 size={16} /></span>}
                  <span className="dgp-debts__name">{debt.app_name}</span>
                  <span className="dgp-debts__track" title="Recuperado"><i style={{ transform: `scaleX(${paid})` }} /></span>
                  <span className="dgp-debts__amount">-{fmt(debt.remaining, 2)} / -{fmt(debt.original_stake, 2)}</span>
                </li>
              );
            })}
            {debts.length > 4 && <li className="dgp-debts__more">…y {debts.length - 4} más</li>}
          </ul>
          <p className="dgp-debts__hint">
            Juega en solitario a esas apps en modo examen para recuperar puntos.
          </p>
        </div>
      )}
    </DashCard>
  );
}
