import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Users, Shuffle, Crown, Check, X, RefreshCw, ArrowRight, UserCheck, UserX } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import './TeamSetupPanel.css';

const TEAM_NAMES = [
  'Águilas', 'Lobos', 'Tigres', 'Dragones', 'Cóndores',
  'Halcones', 'Panteras', 'Búhos', 'Lince', 'Pumas',
  'Tiburones', 'Orcas', 'Cobras', 'Águilas Reales', 'Centauros',
];

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Panel para preparar una batalla por equipos:
 *   1. Marca alumnos ausentes (no entran en los equipos).
 *   2. Genera equipos aleatorios (tamaño N) o construye manualmente.
 *   3. Cada equipo tiene un representante elegido al azar (re-rolleable).
 *   4. Al confirmar, devuelve el array de equipos al padre.
 *
 * Props:
 *   groupId          uuid del grupo seleccionado
 *   groupName        string para mostrar
 *   onConfirm(teams) callback con [{name, rep_student_id, member_ids[]}]
 *   onCancel         callback para cerrar el panel
 */
export default function TeamSetupPanel({ groupId, groupName, onConfirm, onCancel }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [absentIds, setAbsentIds] = useState(new Set());
  const [teamSize, setTeamSize] = useState(3);
  const [teams, setTeams] = useState([]); // [{ name, repId, memberIds: [] }]
  const [movingId, setMovingId] = useState(null); // id alumno que el profe quiere mover
  const [showAbsent, setShowAbsent] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!groupId) return;
    setLoading(true);
    supabase.rpc('get_group_students', { p_group_id: groupId }).then(({ data }) => {
      if (cancelled) return;
      const list = Array.isArray(data) ? data : [];
      // Ordenar por nombre alfabéticamente
      list.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''));
      setStudents(list);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [groupId]);

  const presentStudents = useMemo(
    () => students.filter(s => !absentIds.has(s.id)),
    [students, absentIds]
  );

  const studentsById = useMemo(() => {
    const m = new Map();
    students.forEach(s => m.set(s.id, s));
    return m;
  }, [students]);

  const toggleAbsent = (id) => {
    setAbsentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Si el alumno ya estaba en algún equipo, quitarlo
    setTeams(prev => prev
      .map(t => ({
        ...t,
        memberIds: t.memberIds.filter(mid => mid !== id),
        repId: t.repId === id ? null : t.repId,
      }))
      .filter(t => t.memberIds.length > 0)
      .map(t => t.repId ? t : { ...t, repId: t.memberIds[Math.floor(Math.random() * t.memberIds.length)] })
    );
  };

  const generateRandom = useCallback(() => {
    const ids = shuffleArr(presentStudents.map(s => s.id));
    if (ids.length < 2) {
      setTeams([]);
      return;
    }
    const size = Math.max(2, Math.min(6, teamSize));
    const numTeams = Math.max(2, Math.ceil(ids.length / size));
    const buckets = Array.from({ length: numTeams }, () => []);
    ids.forEach((id, i) => {
      buckets[i % numTeams].push(id);
    });
    const usedNames = new Set();
    const newTeams = buckets
      .filter(b => b.length > 0)
      .map((memberIds, i) => {
        let name;
        const pool = TEAM_NAMES.filter(n => !usedNames.has(n));
        if (pool.length > 0) {
          name = pickRandom(pool);
          usedNames.add(name);
        } else {
          name = `Equipo ${i + 1}`;
        }
        const repId = pickRandom(memberIds);
        return { name, repId, memberIds };
      });
    setTeams(newTeams);
  }, [presentStudents, teamSize]);

  // Auto-generar al cambiar tamaño/ausentes (si ya había equipos)
  useEffect(() => {
    if (teams.length > 0 && presentStudents.length >= 2) {
      // No regenerar automáticamente al cambiar ausencias para no
      // pisar la edición manual del profe; solo forzamos al pulsar el botón.
    }
  }, [presentStudents.length, teamSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const rerollRep = (teamIdx) => {
    setTeams(prev => prev.map((t, i) => {
      if (i !== teamIdx) return t;
      if (t.memberIds.length === 0) return t;
      const others = t.memberIds.filter(id => id !== t.repId);
      const newRep = others.length > 0 ? pickRandom(others) : t.memberIds[0];
      return { ...t, repId: newRep };
    }));
  };

  const setRep = (teamIdx, studentId) => {
    setTeams(prev => prev.map((t, i) => i === teamIdx ? { ...t, repId: studentId } : t));
  };

  const moveStudent = (studentId, fromTeamIdx, toTeamIdx) => {
    if (fromTeamIdx === toTeamIdx) {
      setMovingId(null);
      return;
    }
    setTeams(prev => prev.map((t, i) => {
      if (i === fromTeamIdx) {
        const newMembers = t.memberIds.filter(id => id !== studentId);
        const newRep = t.repId === studentId
          ? (newMembers[Math.floor(Math.random() * newMembers.length)] || null)
          : t.repId;
        return { ...t, memberIds: newMembers, repId: newRep };
      }
      if (i === toTeamIdx) {
        return { ...t, memberIds: [...t.memberIds, studentId] };
      }
      return t;
    }).filter(t => t.memberIds.length > 0));
    setMovingId(null);
  };

  const renameTeam = (teamIdx, newName) => {
    setTeams(prev => prev.map((t, i) => i === teamIdx ? { ...t, name: newName } : t));
  };

  const removeTeam = (teamIdx) => {
    setTeams(prev => prev.filter((_, i) => i !== teamIdx));
  };

  const addEmptyTeam = () => {
    const usedNames = new Set(teams.map(t => t.name));
    const pool = TEAM_NAMES.filter(n => !usedNames.has(n));
    const name = pool.length > 0 ? pickRandom(pool) : `Equipo ${teams.length + 1}`;
    setTeams(prev => [...prev, { name, repId: null, memberIds: [] }]);
  };

  const handleConfirm = () => {
    const valid = teams
      .filter(t => t.memberIds.length > 0 && t.repId)
      .map(t => ({
        name: t.name,
        rep_student_id: t.repId,
        member_ids: t.memberIds,
      }));
    if (valid.length < 2) return;
    onConfirm(valid);
  };

  const totalAssigned = teams.reduce((s, t) => s + t.memberIds.length, 0);
  const allPresentAssigned = totalAssigned === presentStudents.length;

  if (loading) {
    return (
      <div className="qb-team-setup">
        <p className="qb-faint-text" style={{ textAlign: 'center' }}>Cargando alumnos...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="qb-team-setup">
        <p className="qb-faint-text" style={{ textAlign: 'center' }}>
          No hay alumnos en este grupo.
        </p>
        <button className="qb-btn-back" onClick={onCancel} style={{ width: '100%', justifyContent: 'center' }}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="qb-team-setup">
      <div className="qb-team-setup-header">
        <h2>
          <Users className="w-5 h-5" /> Batalla por equipos
        </h2>
        <p className="qb-faint-text">
          {groupName} · {students.length} alumnos · {presentStudents.length} presentes · {absentIds.size} ausentes
        </p>
      </div>

      {/* Sección 1: alumnos presentes/ausentes */}
      <div className="qb-team-section">
        <div className="qb-team-section-title">
          <span>1. ¿Quién falta hoy?</span>
          <button className="qb-mini-btn" onClick={() => setShowAbsent(v => !v)}>
            {showAbsent ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {showAbsent && (
          <p className="qb-team-help">
            Marca a los ausentes para que no entren en ningún equipo.
          </p>
        )}
        {showAbsent && (
          <div className="qb-team-students-grid">
            {students.map(s => {
              const absent = absentIds.has(s.id);
              return (
                <button key={s.id}
                  type="button"
                  className={`qb-team-student-chip ${absent ? 'is-absent' : 'is-present'}`}
                  onClick={() => toggleAbsent(s.id)}
                  title={absent ? 'Marcar presente' : 'Marcar ausente'}>
                  <UserAvatar
                    selectedAvatarCode={s.selected_avatar_code}
                    avatarEmoji={s.avatar_emoji}
                    avatarColor={s.avatar_color}
                    size="sm"
                    shape="rounded"
                  />
                  <span className="qb-team-student-name">{s.display_name}</span>
                  {absent
                    ? <UserX className="w-3.5 h-3.5" style={{ color: '#fca5a5' }} />
                    : <UserCheck className="w-3.5 h-3.5" style={{ color: '#6ee7b7' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sección 2: tamaño + generador */}
      <div className="qb-team-section">
        <div className="qb-team-section-title">2. Forma los equipos</div>
        <div className="qb-team-size-row">
          <label>Tamaño de equipo:</label>
          <div className="qb-team-size-buttons">
            {[2, 3, 4, 5, 6].map(n => (
              <button key={n} type="button"
                className={`qb-team-size-btn ${teamSize === n ? 'is-active' : ''}`}
                onClick={() => setTeamSize(n)}>
                {n}
              </button>
            ))}
          </div>
          <span className="qb-faint-text">
            ≈ {presentStudents.length > 0 ? Math.max(2, Math.ceil(presentStudents.length / teamSize)) : 0} equipos
          </span>
        </div>
        <button type="button" onClick={generateRandom}
          className="qb-team-generate-btn"
          disabled={presentStudents.length < 2}>
          <Shuffle className="w-4 h-4" /> Generar equipos al azar
        </button>
      </div>

      {/* Sección 3: equipos */}
      {teams.length > 0 && (
        <div className="qb-team-section">
          <div className="qb-team-section-title">
            <span>3. Equipos ({teams.length})</span>
            <span className="qb-faint-text" style={{ fontSize: '0.7rem' }}>
              {totalAssigned}/{presentStudents.length} alumnos asignados
            </span>
          </div>
          <p className="qb-team-help">
            <Crown className="w-3 h-3" style={{ display: 'inline', verticalAlign: 'middle' }} /> El representante (corona) es quien se conectará al PC. Re-roll con el botón.
          </p>

          <div className="qb-teams-list">
            <AnimatePresence>
              {teams.map((team, ti) => (
                <motion.div key={`${team.name}-${ti}`} className="qb-team-card"
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="qb-team-card-header">
                    <input type="text" className="qb-team-name-input"
                      value={team.name}
                      onChange={(e) => renameTeam(ti, e.target.value.slice(0, 30))} />
                    <span className="qb-team-card-count">
                      {team.memberIds.length} {team.memberIds.length === 1 ? 'jugador' : 'jugadores'}
                    </span>
                    <button className="qb-mini-btn" onClick={() => rerollRep(ti)}
                      title="Cambiar al azar el representante">
                      <RefreshCw className="w-3.5 h-3.5" /> Rep
                    </button>
                    <button className="qb-mini-btn qb-mini-danger" onClick={() => removeTeam(ti)}
                      title="Borrar equipo">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="qb-team-members">
                    {team.memberIds.map(id => {
                      const s = studentsById.get(id);
                      if (!s) return null;
                      const isRep = team.repId === id;
                      const isMoving = movingId === id;
                      return (
                        <div key={id}
                          className={`qb-team-member ${isRep ? 'is-rep' : ''} ${isMoving ? 'is-moving' : ''}`}
                          onClick={() => setRep(ti, id)}
                          title={isRep ? 'Representante' : 'Click para hacerlo representante'}>
                          {isRep && <Crown className="w-3.5 h-3.5 qb-rep-crown" />}
                          <UserAvatar
                            selectedAvatarCode={s.selected_avatar_code}
                            avatarEmoji={s.avatar_emoji}
                            avatarColor={s.avatar_color}
                            size="sm"
                            shape="rounded"
                            showRarityBorder
                          />
                          <span className="qb-team-member-name">{s.display_name}</span>
                          <button className="qb-mini-btn" onClick={(e) => {
                            e.stopPropagation();
                            setMovingId(isMoving ? null : id);
                          }}>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          {isMoving && (
                            <div className="qb-move-popover">
                              {teams.map((dst, di) => di !== ti && (
                                <button key={di} className="qb-mini-btn"
                                  onClick={(e) => { e.stopPropagation(); moveStudent(id, ti, di); }}>
                                  → {dst.name}
                                </button>
                              ))}
                              <button className="qb-mini-btn qb-mini-danger"
                                onClick={(e) => { e.stopPropagation(); setMovingId(null); }}>
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button className="qb-team-add-btn" onClick={addEmptyTeam}>
              + Añadir equipo vacío
            </button>
          </div>
        </div>
      )}

      <div className="qb-team-actions">
        <button className="qb-btn-back" onClick={onCancel}>
          Cancelar
        </button>
        <button className="qb-btn-primary" onClick={handleConfirm}
          disabled={teams.filter(t => t.memberIds.length > 0 && t.repId).length < 2}>
          <Check className="w-4 h-4" />
          Confirmar y crear sala ({teams.length} equipos)
        </button>
      </div>
      {teams.length > 0 && !allPresentAssigned && (
        <p className="qb-faint-text" style={{ textAlign: 'center', marginTop: 8, fontSize: '0.75rem', color: '#fbbf24' }}>
          ⚠ Hay {presentStudents.length - totalAssigned} alumnos presentes sin equipo.
        </p>
      )}
    </div>
  );
}
