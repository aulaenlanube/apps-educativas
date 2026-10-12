// Modal "Crear duelo 1 vs 1" del alumno — rediseño 2026.
// Tres pasos (rival con avatar, juego con su icono, apuesta en fichas) y una
// vista previa "Tú VS rival". Solo presentación: la carga de rivales, la
// validación y createDuel son los de siempre.
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, EyeOff, Users, Gamepad2, Target, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDuelOpponents, createDuel } from '@/services/duelService';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashButton } from '@/components/dashboard/kit';
import './DuelCreateModal.css';

const STAKES = [
  { value: 0,   label: 'Amistoso',   color: 'from-slate-400 to-slate-500', display: 'Sin nota' },
  { value: 0.1, label: '0,1 puntos', color: 'from-emerald-400 to-emerald-600' },
  { value: 0.2, label: '0,2 puntos', color: 'from-amber-400 to-amber-600' },
  { value: 0.3, label: '0,3 puntos', color: 'from-rose-400 to-rose-600' },
];

export default function DuelCreateModal({ open, onClose }) {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [opponents, setOpponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [appId, setAppId] = useState(null);
  const [stake, setStake] = useState(0.1);
  const [isHidden, setIsHidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // stake puede ser 0 (amistoso); la validación pide que sea uno de los valores permitidos.
  const isStakeValid = STAKES.some(s => s.value === stake);

  useEffect(() => {
    if (!open || !student) return;
    setLoading(true); setErr(null);
    getDuelOpponents({ studentId: student.id, sessionToken: student.session_token })
      .then(list => setOpponents(list))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [open, student]);

  useEffect(() => {
    if (!open) {
      setOpponentId(null); setAppId(null); setStake(0.1);
      setIsHidden(false); setErr(null);
    }
  }, [open]);

  const canSubmit = opponentId && appId && isStakeValid && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    const app = DUELABLE_APPS.find(a => a.id === appId);
    setSubmitting(true); setErr(null);
    try {
      const res = await createDuel({
        studentId: student.id,
        sessionToken: student.session_token,
        opponentId,
        appId,
        appName: app.name,
        level: student.group_level,
        grade: student.group_grade,
        subjectId: student.group_subject_id || null,
        stake,
        bestOf: app.duel?.bestOf || 1,
        isHidden,
      });
      onClose?.();
      navigate(`/duelo/${res.duel_id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Solo para la vista previa (no cambia lo que se envía).
  const rival = opponents.find(o => o.id === opponentId) || null;
  const pickedApp = DUELABLE_APPS.find(a => a.id === appId) || null;
  const stakeText = stake === 0 ? 'Amistoso' : `±${String(stake).replace('.', ',')}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="dcm-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="dcm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dcm-title"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera con vista previa Tú VS rival */}
            <header className="dcm-head">
              <span className="dcm-head__art" aria-hidden="true" />
              <div className="dcm-head__title">
                <span className="dcm-head__icon"><Swords size={22} /></span>
                <div>
                  <h2 id="dcm-title">Crear duelo 1 vs 1</h2>
                  <p>Reta a un compañero y juega tu nota</p>
                </div>
              </div>
              <div className="dcm-preview" aria-hidden="true">
                <span className="dcm-preview__ava is-me">
                  <UserAvatar
                    selectedAvatarCode={student?.selected_avatar_code}
                    avatarEmoji={student?.avatar_emoji}
                    avatarColor={student?.avatar_color}
                    size="md"
                    shape="rounded"
                    showRarityBorder={false}
                  />
                </span>
                <span className="dcm-preview__vs">VS</span>
                <span className={`dcm-preview__ava is-rival ${rival ? '' : 'is-empty'}`}>
                  {rival ? (
                    <UserAvatar
                      selectedAvatarCode={rival.selected_avatar_code}
                      avatarEmoji={rival.emoji}
                      avatarColor={rival.color}
                      size="md"
                      shape="rounded"
                      showRarityBorder={false}
                    />
                  ) : <span>?</span>}
                </span>
              </div>
              <button type="button" onClick={onClose} className="dcm-close" aria-label="Cerrar">
                <X size={20} />
              </button>
            </header>

            <div className="dcm-body">
              {/* Oponente */}
              <section className="dcm-step">
                <div className="dcm-step__head">
                  <span className="dcm-step__num">1</span>
                  <Users size={16} />
                  <h3>Elige a tu rival</h3>
                  {!loading && opponents.length > 0 && <span className="dcm-step__count">{opponents.length} compañeros</span>}
                </div>
                {loading ? (
                  <div className="dcm-muted"><Loader2 size={16} className="dcm-spin" /> Cargando compañeros…</div>
                ) : opponents.length === 0 ? (
                  <div className="dcm-muted">
                    No hay compañeros disponibles en tu grupo.
                  </div>
                ) : (
                  <div className="dcm-rivals">
                    {opponents.map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setOpponentId(o.id)}
                        className={`dcm-rival ${opponentId === o.id ? 'is-active' : ''}`}
                        aria-pressed={opponentId === o.id}
                      >
                        <UserAvatar
                          selectedAvatarCode={o.selected_avatar_code}
                          avatarEmoji={o.emoji}
                          avatarColor={o.color}
                          size="md"
                          shape="rounded"
                          showRarityBorder={false}
                        />
                        <span className="dcm-rival__text">
                          <strong>{o.name}</strong>
                          <small>{o.group_name}</small>
                        </span>
                        {opponentId === o.id && <span className="dcm-check"><Check size={13} /></span>}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* App */}
              <section className="dcm-step">
                <div className="dcm-step__head">
                  <span className="dcm-step__num">2</span>
                  <Gamepad2 size={16} />
                  <h3>Elige el juego</h3>
                </div>
                <div className="dcm-apps">
                  {DUELABLE_APPS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAppId(a.id)}
                      className={`dcm-app art-host ${appId === a.id ? 'is-active' : ''}`}
                      aria-pressed={appId === a.id}
                    >
                      {hasAppIcon(a.id)
                        ? <AppIcon appId={a.id} size={52} />
                        : <span className="dcm-app__fallback"><Gamepad2 size={24} /></span>}
                      <span className="dcm-app__text">
                        <strong>{a.name}</strong>
                        <small>{a.description}</small>
                        {a.duel?.bestOf > 1 && (
                          <span className="dcm-app__bo">Al mejor de {a.duel.bestOf}</span>
                        )}
                      </span>
                      {appId === a.id && <span className="dcm-check"><Check size={13} /></span>}
                    </button>
                  ))}
                </div>
              </section>

              {/* Stake */}
              <section className="dcm-step">
                <div className="dcm-step__head">
                  <span className="dcm-step__num">3</span>
                  <Target size={16} />
                  <h3>¿Qué os jugáis?</h3>
                </div>
                <div className="dcm-stakes">
                  {STAKES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStake(s.value)}
                      className={`dcm-stake ${stake === s.value ? 'is-active' : ''}`}
                      aria-pressed={stake === s.value}
                    >
                      <span className={`dcm-stake__coin bg-gradient-to-br ${s.color}`}>
                        {s.value === 0 ? '🤝' : `±${s.value.toString().replace('.', ',')}`}
                      </span>
                      <strong>{s.value === 0 ? s.display : `+/- ${s.value.toString().replace('.', ',')}`}</strong>
                      <small>{s.label}</small>
                    </button>
                  ))}
                </div>
                {stake === 0 && (
                  <p className="dcm-note">
                    Duelo amistoso: el resultado no afecta a la nota de ninguno.
                  </p>
                )}
              </section>

              {/* Oculto */}
              <section>
                <label className={`dcm-toggle ${isHidden ? 'is-on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={e => setIsHidden(e.target.checked)}
                    className="dcm-toggle__input"
                  />
                  <span className="dcm-toggle__switch" aria-hidden="true"><i /></span>
                  <span className="dcm-toggle__text">
                    <strong><EyeOff size={15} /> Duelo oculto</strong>
                    <small>
                      Tu rival no sabrá quién le ha retado hasta el final de la partida.
                    </small>
                  </span>
                </label>
              </section>

              {err && (
                <div className="dcm-error" role="alert">
                  {err}
                </div>
              )}
            </div>

            <footer className="dcm-foot">
              <p className="dcm-summary">
                {rival && pickedApp ? (
                  <><strong>Tú vs {rival.name}</strong> · {pickedApp.name} · {stakeText}</>
                ) : (
                  <>Elige rival y juego para lanzar el reto</>
                )}
              </p>
              <div className="dcm-foot__btns">
                <DashButton variant="soft" onClick={onClose}>
                  Cancelar
                </DashButton>
                <DashButton variant="rose" icon={submitting ? undefined : Swords} onClick={onSubmit} disabled={!canSubmit}>
                  {submitting ? 'Enviando reto…' : 'Retar'}
                </DashButton>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
