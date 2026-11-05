// src/components/proposals/ProposeAppDialog.jsx
// «Propón una app»: formulario mínimo (qué app, para qué curso o asignatura y
// un correo) con consentimiento, aviso de privacidad, campo trampa contra bots
// y sugerencias de apps que YA existen mientras se escribe.
// Carga el registro de apps (para las sugerencias): ábrelo con React.lazy.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lightbulb, X, Send, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { suggestExistingApps } from '@/data/appIndex';
import { submitAppProposal } from '@/services/appProposalService';
import './ProposeAppDialog.css';

const LIMITS = { idea: 600, curso: 160, email: 254 };
const COOLDOWN_KEY = 'eduapps-propose-last';
const COOLDOWN_MS = 60 * 1000;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

const ERRORS = {
  rate_limited: 'Has enviado varias propuestas seguidas. Vuelve a intentarlo dentro de un rato.',
  consent: 'Marca la casilla de consentimiento para poder enviarla.',
  invalid: 'Revisa los campos: falta algo o es demasiado corto.',
  network: 'No se ha podido enviar. Comprueba la conexión e inténtalo de nuevo.',
  cooldown: 'Acabas de enviar una propuesta. Espera un minuto antes de mandar otra.',
};

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function ProposeAppDialog({ onClose, source = 'web' }) {
  const openedAt = useRef(Date.now());
  const firstField = useRef(null);
  const [idea, setIdea] = useState('');
  const [curso, setCurso] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // campo trampa
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const shownSuggestions = useRef(new Set());

  const debouncedIdea = useDebounced(idea, 220);
  const suggestions = useMemo(() => suggestExistingApps(debouncedIdea, 4), [debouncedIdea]);
  useEffect(() => { suggestions.forEach((s) => shownSuggestions.current.add(s.key)); }, [suggestions]);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const valid = idea.trim().length >= 5 && curso.trim().length >= 2 && EMAIL_RE.test(email.trim()) && consent;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || sending) return;
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (Date.now() - last < COOLDOWN_MS) { setError(ERRORS.cooldown); return; }
    setSending(true);
    setError('');
    const res = await submitAppProposal({
      idea: idea.trim(),
      curso: curso.trim(),
      email: email.trim(),
      consent,
      website,
      elapsedMs: Date.now() - openedAt.current,
      source,
      suggestedApps: [...shownSuggestions.current],
    });
    setSending(false);
    if (res.ok) {
      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* modo privado */ }
      setDone(true);
    } else {
      setError(ERRORS[res.error] || ERRORS.network);
    }
  };

  return (
    <motion.div
      className="propose-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="propose-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="propose-title"
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="propose-head">
          <span className="propose-head__icon" aria-hidden="true"><Lightbulb className="w-6 h-6" /></span>
          <div className="min-w-0">
            <h2 id="propose-title" className="propose-head__title">Propón una app</h2>
            <p className="propose-head__sub">
              {done
                ? 'Propuesta recibida.'
                : '¿Qué app te gustaría tener en la plataforma? Cuéntanoslo: si ya existe, te diremos dónde está.'}
            </p>
          </div>
          <button type="button" className="propose-close" onClick={onClose} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </header>

        {done ? (
          <div className="propose-done">
            <CheckCircle2 className="w-14 h-14 propose-done__icon" aria-hidden="true" />
            <p className="propose-done__title">¡Gracias por participar!</p>
            <p className="propose-done__text">
              La leeremos con calma y te escribiremos a <strong>{email.trim()}</strong>.
            </p>
            <button type="button" className="propose-btn propose-btn--primary" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form className="propose-form" onSubmit={onSubmit} noValidate>
            <label className="propose-field">
              <span className="propose-label">¿Qué app querrías?</span>
              <textarea
                ref={firstField}
                className="propose-input propose-input--area"
                rows={3}
                maxLength={LIMITS.idea}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Por ejemplo: un juego para practicar las tablas de multiplicar contra reloj"
                required
              />
            </label>

            {suggestions.length > 0 && (
              <div className="propose-suggest" aria-live="polite">
                <p className="propose-suggest__title">Quizá ya la tenemos:</p>
                <ul className="propose-suggest__list">
                  {suggestions.map((s) => (
                    <li key={s.key}>
                      <Link to={`/adaptaciones?app=${encodeURIComponent(s.key)}`} className="propose-suggest__item" onClick={onClose}>
                        {hasAppIcon(s.ids[0])
                          ? <AppIcon appId={s.ids[0]} size={28} />
                          : <span className="propose-suggest__emoji" aria-hidden="true">{s.emoji || '🎮'}</span>}
                        <span className="propose-suggest__name">{s.name}</span>
                        <span className="propose-suggest__meta">{s.adaptations.length} adaptaciones</span>
                        <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="propose-suggest__hint">Si no es lo que buscas, sigue: tu propuesta nos sirve igual.</p>
              </div>
            )}

            <label className="propose-field">
              <span className="propose-label">¿Para qué curso o asignatura?</span>
              <input
                className="propose-input"
                type="text"
                maxLength={LIMITS.curso}
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                placeholder="Por ejemplo: 3.º de Primaria, Matemáticas"
                required
              />
            </label>

            <label className="propose-field">
              <span className="propose-label">Tu correo, para responderte</span>
              <input
                className="propose-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={LIMITS.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.es"
                required
              />
            </label>

            {/* Campo trampa: invisible para personas, los bots lo rellenan. */}
            <div className="propose-hp" aria-hidden="true">
              <label>
                Web
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>

            <div className="propose-privacy">
              <p className="propose-privacy__title"><ShieldCheck className="w-4 h-4" aria-hidden="true" /> Aviso de privacidad</p>
              <ul className="propose-privacy__list">
                <li><strong>Responsable:</strong> Eduardo Torregrosa Llácer.</li>
                <li><strong>Para qué:</strong> estudiar tu propuesta y contestarte. Nada más.</li>
                <li><strong>Base legal:</strong> tu consentimiento; puedes retirarlo cuando quieras.</li>
                <li><strong>Dónde y cuánto:</strong> en Supabase (UE), sin cederlo a nadie; se borra como máximo a los 12 meses.</li>
                <li>
                  <strong>Tus derechos</strong> (acceso, rectificación, supresión…): <a href="mailto:edtorlla@gmail.com">edtorlla@gmail.com</a>.
                  Más en la <Link to="/politica-privacidad" onClick={onClose}>política de privacidad</Link>.
                </li>
              </ul>
              <p className="propose-privacy__minor">Si tienes menos de 14 años, pide a tu familia o a tu docente que la envíe por ti.</p>
            </div>

            <label className="propose-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
              <span>He leído el aviso y acepto que se use mi correo para responder a esta propuesta.</span>
            </label>

            {error && <p className="propose-error" role="alert">{error}</p>}

            <div className="propose-actions">
              <button type="button" className="propose-btn" onClick={onClose}>Cancelar</button>
              <button type="submit" className="propose-btn propose-btn--primary" disabled={!valid || sending}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                {sending ? 'Enviando…' : 'Enviar propuesta'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
