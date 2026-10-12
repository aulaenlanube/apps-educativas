import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Search, Sparkles, Check, AlertTriangle, Info } from 'lucide-react';
import { teacherGetDuelOpponents, teacherCreateDuel } from '@/services/duelService';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashButton } from '@/components/dashboard/kit';
import { Step } from '@/pages/dashboard/AssignTaskDialog';
import '@/pages/dashboard/teacherPanels.css';
import './teacherDuel.css';

// Modal de "retar a un alumno" para el docente. Siempre crea un duelo
// amistoso (stake=0), sin oculto. El alumno verá el reto en su inbox y
// debe aceptarlo desde su panel para que el duelo arranque.

export default function TeacherDuelCreateModal({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const [opponents, setOpponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [appId, setAppId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true); setErr(null);
    teacherGetDuelOpponents()
      .then(list => setOpponents(Array.isArray(list) ? list : []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setOpponentId(null); setAppId(null); setErr(null); setSearch('');
    }
  }, [open]);

  const filteredOpponents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return opponents;
    return opponents.filter(o =>
      (o.name || '').toLowerCase().includes(q) ||
      (o.group_name || '').toLowerCase().includes(q)
    );
  }, [opponents, search]);

  // Agrupa por grupo para pintar cabeceras (solo presentación)
  const opponentGroups = useMemo(() => {
    const map = new Map();
    filteredOpponents.forEach(o => {
      const key = o.group_name || 'Sin grupo';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    });
    return [...map.entries()];
  }, [filteredOpponents]);

  const opponent = opponents.find(o => o.id === opponentId);
  const canSubmit = opponentId && appId && !submitting;
  const pickedApp = DUELABLE_APPS.find(a => a.id === appId);

  async function onSubmit() {
    if (!canSubmit) return;
    const app = DUELABLE_APPS.find(a => a.id === appId);
    if (!app || !opponent) return;
    setSubmitting(true); setErr(null);
    try {
      const res = await teacherCreateDuel({
        opponentId,
        appId,
        appName: app.name,
        // duels.level/grade/subject_id son referenciales: la propia app
        // duel los recoge de duelInfo cuando arranca. Pasamos vacíos:
        // useDuel + las apps caen al fallback de level/grade del path.
        level: '', grade: '', subjectId: null,
        bestOf: app.duel?.bestOf || 1,
      });
      onCreated?.(res?.duel_id);
      onClose?.();
      // Entra el profesor en la sala de duelo: el alumno verá el reto en
      // su inbox, lo aceptará y se reunirá aquí.
      if (res?.duel_id) navigate(`/duelo/${res.duel_id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="tp-root tp-modal"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="tp-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tp-duel-create-title"
            onClick={e => e.stopPropagation()}
          >
            <header className="tp-dhead tp-dhead--duel">
              <div className="tp-dhead__row">
                <span className="tp-dhead__icon"><Swords size={26} /></span>
                <div className="tp-dhead__text">
                  <h2 id="tp-duel-create-title" className="tp-dhead__title">Retar a un alumno</h2>
                  <p className="tp-dhead__sub">Duelo amistoso (no se juega nota)</p>
                </div>
              </div>
              <div className="tp-dhead__tools">
                <button type="button" onClick={onClose} className="tp-iconbtn tp-iconbtn--glass" title="Cerrar" aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="tp-dbody">
              <div className="tp-steps">
                <Step n={1} title="Elige a tu alumno rival" done={!!opponentId}>
                  <div className="tp-search" style={{ marginBottom: 10 }}>
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar por nombre o grupo…"
                      className="tp-input"
                    />
                  </div>
                  {loading ? (
                    <div className="tp-center"><span className="tp-spin" /></div>
                  ) : opponents.length === 0 ? (
                    <div className="tp-arena__empty">
                      No tienes alumnos en ningún grupo todavía.
                    </div>
                  ) : (
                    <div className="tp-opps">
                      {opponentGroups.map(([groupName, list]) => (
                        <React.Fragment key={groupName}>
                          <div className="tp-opps__group">{groupName}</div>
                          {list.map(o => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => setOpponentId(o.id)}
                              className={`tp-choice tp-opp ${opponentId === o.id ? 'is-on' : ''}`}
                              aria-pressed={opponentId === o.id}
                            >
                              <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>
                              <UserAvatar
                                selectedAvatarCode={o.selected_avatar_code}
                                avatarEmoji={o.emoji}
                                avatarColor={o.color}
                                size="md"
                                showRarityBorder={false}
                              />
                              <span className="tp-choice__text" style={{ paddingRight: 22 }}>
                                <span className="tp-choice__title">{o.name}</span>
                                <span className="tp-choice__desc">{o.group_name}</span>
                              </span>
                            </button>
                          ))}
                        </React.Fragment>
                      ))}
                      {filteredOpponents.length === 0 && (
                        <p className="tp-picker__empty">Sin coincidencias.</p>
                      )}
                    </div>
                  )}
                </Step>

                <Step n={2} title="Elige el juego" done={!!appId}>
                  <div className="tp-apps tp-apps--wide">
                    {DUELABLE_APPS.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAppId(a.id)}
                        className={`tp-choice tp-choice--col tp-apptile ${appId === a.id ? 'is-on' : ''}`}
                        aria-pressed={appId === a.id}
                      >
                        <span className="tp-choice__check"><Check size={13} strokeWidth={3} /></span>
                        <span className="tp-apptile__icon">
                          {hasAppIcon(a.id) ? <AppIcon appId={a.id} size={48} /> : <span className="tp-apptile__fallback">🎮</span>}
                        </span>
                        <span className="tp-choice__text">
                          <span className="tp-choice__title">{a.name}</span>
                          <span className="tp-choice__desc">{a.description}</span>
                        </span>
                        {a.duel?.bestOf > 1 && (
                          <span className="tp-chip tp-chip--amber">Al mejor de {a.duel.bestOf}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </Step>
              </div>

              <div className="tp-note" style={{ marginTop: 20 }}>
                <Sparkles size={18} />
                <p style={{ margin: 0 }}>
                  Es un duelo <strong>amistoso</strong>: ni tú ni el alumno os jugáis puntos en la nota.
                  El alumno recibirá el reto en su bandeja de duelos y deberá aceptarlo para empezar.
                </p>
              </div>

              {err && (
                <div className="tp-note tp-note--rose" style={{ marginTop: 12 }}>
                  <AlertTriangle size={18} />
                  <p style={{ margin: 0 }}>{err}</p>
                </div>
              )}
            </div>

            <footer className="tp-dfoot">
              <div className="tp-dfoot__info">
                {opponent ? (
                  <>
                    <span className="tp-vsmini">
                      <span className="tp-vsmini__me">TÚ</span>
                      <Swords size={15} className="tp-vsmini__x" />
                      <UserAvatar
                        selectedAvatarCode={opponent.selected_avatar_code}
                        avatarEmoji={opponent.emoji}
                        avatarColor={opponent.color}
                        size="sm"
                        showRarityBorder={false}
                      />
                    </span>
                    <span>{opponent.name}{pickedApp ? ` · ${pickedApp.name}` : ''}</span>
                  </>
                ) : (
                  <><Info size={18} /><span>Elige rival y juego</span></>
                )}
              </div>
              <div className="tp-dfoot__actions">
                <DashButton variant="soft" onClick={onClose}>Cancelar</DashButton>
                <DashButton variant="rose" icon={Swords} onClick={onSubmit} disabled={!canSubmit}>
                  {submitting ? 'Enviando reto…' : 'Retar'}
                </DashButton>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
