import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ACTS, CONTEXT_ACTS, pick } from '@/components/mascot/acts';
import { getFxTier } from '@/services/uiFx';
import './RobotMascot.css';

// Robot mascota de EduApps (rediseño 2026).
// Mantiene la identidad del robot original — cabeza-monitor índigo, visor oscuro
// con ojos blancos asimétricos (el derecho más grande), antena con orbe y wifi,
// núcleo IA cian en el pecho y brazos articulados — pero con mucho más detalle
// y una animación por capas:
//   - Los ojos y la cabeza siguen al puntero (springs de framer, sin re-render).
//   - Parpadeo natural a intervalos aleatorios (a veces doble).
//   - Flota sobre un propulsor con llama, sombra sincronizada y partículas.
//   - Al pasar el ratón saluda; al hacer clic da un salto feliz con chispas.
//   - Mientras habla: boca-ecualizador, ondas de sonido y núcleo más brillante.
//   - Director de escena: con `context` ('home' | 'subjects' | 'apps') el robot
//     alterna solo "números" graciosos (baile, voltereta, estornudo, siesta,
//     malabares, leer, pizarra, consola…; ver src/components/mascot/acts.js)
//     cada 7-13 s mientras nadie interactúa con él y está en pantalla.
//   - `act` + `actKey` fuerzan un número concreto (la tragaperras pide 'press',
//     'watch' y 'cheer'); `onActEnd(id)` avisa al terminar.
// Las animaciones en bucle son CSS (RobotMascot.css) para no cargar el hilo de React.
// API: <RobotMascot isTalking onClick expression="default|confused" context act actKey onActEnd quips stage />.
// `stage` (por defecto true): elipse oscurecida detrás del robot para que destaque sobre
// fondos con mucho detalle; su intensidad la ajusta cada contexto con --robo-stage (CSS).

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const SPARK_COLORS = ['#a78bfa', '#f472b6', '#fbbf24', '#22d3ee', '#818cf8'];

const RobotMascot = ({
    isTalking = false, onClick, expression = 'default', className = '', style,
    context = null, act: forcedAct = null, actKey = 0, onActEnd, quips = true, stage = true,
}) => {
    const reduceMotion = useReducedMotion();
    const rootRef = useRef(null);
    const [blink, setBlink] = useState(false);
    const [hover, setHover] = useState(false);
    const [jumpKey, setJumpKey] = useState(0);
    const [sparks, setSparks] = useState([]);

    // ---------- Director de escena ----------
    const [act, setAct] = useState(null); // { id, key }
    const [quip, setQuip] = useState(null);
    const actTimers = useRef([]);
    const lastActRef = useRef(null);
    const busyRef = useRef(false);
    const visibleRef = useRef(true);
    const onActEndRef = useRef(onActEnd);
    useEffect(() => { onActEndRef.current = onActEnd; }, [onActEnd]);

    const clearActTimers = () => { actTimers.current.forEach(clearTimeout); actTimers.current = []; };

    const startAct = useCallback((id) => {
        const def = ACTS[id];
        if (!def) return;
        clearActTimers();
        lastActRef.current = id;
        setAct({ id, key: Date.now() });
        if (quips && def.lines?.length) {
            if (Array.isArray(def.lines[0])) {
                for (const [at, text] of def.lines) {
                    actTimers.current.push(setTimeout(() => setQuip({ text, key: `${id}-${at}` }), at * def.dur));
                }
            } else {
                setQuip({ text: pick(def.lines), key: `${id}-${Date.now()}` });
            }
        } else {
            setQuip(null);
        }
        actTimers.current.push(setTimeout(() => {
            setAct(null);
            setQuip(null);
            onActEndRef.current?.(id);
        }, def.dur));
    }, [quips]);

    useEffect(() => () => clearActTimers(), []);

    // Número pedido por la página (controlado). actKey permite repetirlo.
    useEffect(() => {
        if (!forcedAct) return;
        startAct(forcedAct);
    }, [forcedAct, actKey, startAct]);

    useEffect(() => { busyRef.current = hover || isTalking || !!act || !!forcedAct; }, [hover, isTalking, act, forcedAct]);

    // Solo actúa en pantalla
    useEffect(() => {
        const el = rootRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Números automáticos: cada 7-13 s si no está ocupado y está visible (en
    // equipos con nivel de efectos bajo, la mitad de a menudo: son cortos).
    useEffect(() => {
        const list = context && CONTEXT_ACTS[context];
        if (!list || reduceMotion) return undefined;
        let timer;
        const schedule = (delay) => {
            timer = setTimeout(() => {
                const canAct = !document.hidden && visibleRef.current && !busyRef.current;
                if (canAct) {
                    const options = list.filter((a) => a !== lastActRef.current);
                    startAct(pick(options.length ? options : list));
                }
                schedule((7000 + Math.random() * 6000) * (getFxTier() === 'low' ? 2 : 1));
            }, delay);
        };
        schedule(2600 + Math.random() * 2000);
        return () => clearTimeout(timer);
    }, [context, reduceMotion, startAct]);

    // Puntero normalizado (-1..1) respecto al centro de la cabeza
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const sx = useSpring(px, { stiffness: 120, damping: 14, mass: 0.6 });
    const sy = useSpring(py, { stiffness: 120, damping: 14, mass: 0.6 });

    const irisX = useTransform(sx, [-1, 1], [-5.5, 5.5]);
    const irisY = useTransform(sy, [-1, 1], [-4, 4.5]);
    const headRot = useTransform(sx, [-1, 1], [-7, 7]);
    const headX = useTransform(sx, [-1, 1], [-3, 3]);
    const faceX = useTransform(sx, [-1, 1], [-4, 4]);
    const faceY = useTransform(sy, [-1, 1], [-2.5, 2.5]);
    const bodyRot = useTransform(sx, [-1, 1], [-2.5, 2.5]);
    const shineX = useTransform(sx, [-1, 1], [6, -6]);

    useEffect(() => {
        if (reduceMotion) return undefined;
        let raf = 0;
        let last = null;
        const update = () => {
            raf = 0;
            const el = rootRef.current;
            if (!el || !last) return;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height * 0.36;
            px.set(clamp((last.x - cx) / (window.innerWidth * 0.4), -1, 1));
            py.set(clamp((last.y - cy) / (window.innerHeight * 0.45), -1, 1));
        };
        const onMove = (e) => {
            last = { x: e.clientX, y: e.clientY };
            if (!raf) raf = requestAnimationFrame(update);
        };
        const onLeave = () => { px.set(0); py.set(0); };
        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        return () => {
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [px, py, reduceMotion]);

    // Parpadeo natural: 2,5–6 s entre parpadeos, 25 % de las veces doble.
    useEffect(() => {
        if (reduceMotion) return undefined;
        let t1; let t2; let t3;
        const schedule = () => {
            t1 = setTimeout(() => {
                setBlink(true);
                t2 = setTimeout(() => {
                    setBlink(false);
                    if (Math.random() < 0.25) {
                        t3 = setTimeout(() => {
                            setBlink(true);
                            setTimeout(() => setBlink(false), 110);
                        }, 160);
                    }
                    schedule();
                }, 120);
            }, 2500 + Math.random() * 3500);
        };
        schedule();
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [reduceMotion]);

    const handleClick = useCallback((e) => {
        setJumpKey((k) => k + 1);
        const now = Date.now();
        const burst = Array.from({ length: 10 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
            const d = 60 + Math.random() * 50;
            return {
                id: `${now}-${i}`,
                x: Math.cos(a) * d,
                y: Math.sin(a) * d - 30,
                c: SPARK_COLORS[i % SPARK_COLORS.length],
                s: 6 + Math.random() * 6,
                star: i % 3 === 0,
            };
        });
        setSparks(burst);
        setTimeout(() => setSparks((cur) => (cur[0]?.id === burst[0].id ? [] : cur)), 900);
        onClick?.(e);
    }, [onClick]);

    const def = act ? ACTS[act.id] : null;
    const actEyes = def?.eyes || null;
    const actMouth = def?.mouth || null;
    const happy = hover || (jumpKey > 0 && sparks.length > 0) || actEyes === 'happy';
    const confused = expression === 'confused' && !happy && !isTalking && !act;
    const mood = isTalking ? 'talking' : happy ? 'happy' : 'idle';
    // Ojos de "dibujo" que sustituyen a los normales durante algunos números
    const drawnEyes = ['stars', 'closed', 'squint', 'hearts', 'dizzy'].includes(actEyes) ? actEyes : null;
    const smileD = actMouth === 'grin' ? 'M144 156 Q160 172 176 156'
        : actMouth === 'flat' ? 'M150 160 L170 160'
        : actMouth === 'wavy' || confused ? 'M147 161 Q150.5 157 154 161 T161 161 T168 161 T173 160'
        : mood === 'happy' ? 'M146 157 Q160 170 174 157' : 'M148 159 Q160 166 172 159';
    const prop = def?.prop || null;

    return (
        <div
            ref={rootRef}
            className={`robo ${confused ? 'robo--confused' : ''} ${isTalking ? 'robo--talking' : ''} ${hover && !act ? 'robo--hover' : ''} ${act ? `robo--acting robo--act-${act.id}` : ''} ${reduceMotion ? 'robo--still' : ''} ${className}`}
            style={def ? { ...style, '--act-dur': `${def.dur}ms` } : style}
            onClick={handleClick}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            role="button"
            tabIndex={0}
            aria-label="Robot de EduApps: pulsa para que te diga algo"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } }}
        >
            {/* Escenario: elipse oscurecida que separa al robot del fondo (ciudad, espacio…) */}
            {stage && <div className="robo__stage" aria-hidden="true" />}
            {/* Halo y anillos holográficos del pedestal (HTML para poder usar blur barato) */}
            <div className="robo__halo" aria-hidden="true" />
            <div className="robo__pedestal" aria-hidden="true">
                <span className="robo__ring robo__ring--1" />
                <span className="robo__ring robo__ring--2" />
                <span className="robo__ring robo__ring--3" />
                <span className="robo__beam" />
                {[...Array(8)].map((_, i) => (
                    <span key={i} className="robo__mote" style={{ '--i': i }} />
                ))}
            </div>

            {confused && <span className="robo__puzzled" aria-hidden="true">?</span>}

            {/* Bocadillo corto del número en curso */}
            <AnimatePresence>
                {quip && (
                    <motion.span
                        key={quip.key}
                        className="robo__quip"
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -6 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                        aria-hidden="true"
                    >
                        {quip.text}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Partículas HTML de algunos números (notas, Zzz, corazones, confeti…) */}
            {act && ['notes', 'zzz', 'hearts', 'confetti', 'sparkles', 'guitar'].includes(prop) && (
                <div key={act.key} className={`robo__fx robo__fx--${prop}`} aria-hidden="true">
                    {Array.from({ length: prop === 'confetti' ? 18 : prop === 'sparkles' ? 8 : 6 }).map((_, i) => (
                        <i key={i} style={{ '--i': i }}>
                            {prop === 'notes' || prop === 'guitar' ? (i % 2 ? '♫' : '♪') : prop === 'zzz' ? 'Z' : prop === 'hearts' ? '♥' : prop === 'sparkles' ? '✦' : ''}
                        </i>
                    ))}
                </div>
            )}

            {/* Chispas del clic */}
            <div className="robo__sparks" aria-hidden="true">
                <AnimatePresence>
                    {sparks.map((s) => (
                        <motion.span
                            key={s.id}
                            className={`robo__spark ${s.star ? 'robo__spark--star' : ''}`}
                            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
                            animate={{ x: s.x, y: s.y, scale: 1, opacity: 0, rotate: 180 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                            style={{ width: s.s, height: s.s, background: s.c, boxShadow: `0 0 12px ${s.c}` }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Sombra en el suelo (HTML): se encoge cuando el robot sube. Va
                sincronizada con .robo__float por duración; ambas en la GPU. */}
            <div className="robo__shadow" aria-hidden="true" />

            <motion.div
                key={jumpKey}
                className="robo__jump"
                initial={false}
                animate={jumpKey && !reduceMotion ? { y: [0, -34, 0, -8, 0], scaleY: [1, 1.04, 0.94, 1.02, 1], scaleX: [1, 0.97, 1.05, 0.99, 1] } : {}}
                transition={{ duration: 0.75, ease: 'easeOut' }}
            >
                <div className="robo__float">
                <div className="robo__act">
                <svg className="robo__svg" viewBox="0 0 320 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                        <linearGradient id="robo-head" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#a5b4fc" />
                            <stop offset="35%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#3730a3" />
                        </linearGradient>
                        <linearGradient id="robo-body" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="55%" stopColor="#5b4ff0" />
                            <stop offset="100%" stopColor="#312e81" />
                        </linearGradient>
                        <linearGradient id="robo-limb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c4b5fd" />
                            <stop offset="100%" stopColor="#4338ca" />
                        </linearGradient>
                        <radialGradient id="robo-metal" cx="0.35" cy="0.3" r="0.75">
                            <stop offset="0%" stopColor="#f1f0ff" />
                            <stop offset="45%" stopColor="#a5a3c9" />
                            <stop offset="100%" stopColor="#47456b" />
                        </radialGradient>
                        <linearGradient id="robo-visor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e1b4b" />
                            <stop offset="55%" stopColor="#0b0a24" />
                            <stop offset="100%" stopColor="#1a1450" />
                        </linearGradient>
                        <radialGradient id="robo-sclera" cx="0.4" cy="0.35" r="0.7">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="80%" stopColor="#eef0ff" />
                            <stop offset="100%" stopColor="#c7cbf2" />
                        </radialGradient>
                        <radialGradient id="robo-iris" cx="0.4" cy="0.35" r="0.65">
                            <stop offset="0%" stopColor="#67e8f9" />
                            <stop offset="45%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#1e1b4b" />
                        </radialGradient>
                        <radialGradient id="robo-core" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#ecfeff" />
                            <stop offset="35%" stopColor="#67e8f9" />
                            <stop offset="75%" stopColor="#0891b2" />
                            <stop offset="100%" stopColor="rgba(8,145,178,0)" />
                        </radialGradient>
                        <radialGradient id="robo-orb" cx="0.35" cy="0.3" r="0.7">
                            <stop offset="0%" stopColor="#fdf4ff" />
                            <stop offset="40%" stopColor="#f0abfc" />
                            <stop offset="100%" stopColor="#a21caf" />
                        </radialGradient>
                        <linearGradient id="robo-flame" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ecfeff" />
                            <stop offset="30%" stopColor="#67e8f9" />
                            <stop offset="70%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="rgba(236,72,153,0)" />
                        </linearGradient>
                        <linearGradient id="robo-gloss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                        {/* Sin <filter>: el robot se anima sin parar, y cada filtro (antes 12
                            sombras feDropShadow + brillos feGaussianBlur) se recalculaba en
                            cada frame. Los brillos son halos radiales y las sombras, formas. */}
                        <radialGradient id="robo-halo-cyan" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.85" />
                            <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="robo-halo-pink" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#e879f9" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#e879f9" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="robo-floor" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#0f0a32" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#0f0a32" stopOpacity="0" />
                        </radialGradient>
                        <clipPath id="robo-visor-clip">
                            <rect x="103" y="84" width="114" height="64" rx="30" />
                        </clipPath>
                    </defs>

                    {/* Accesorios que van DETRÁS del robot */}
                    {prop === 'chalkboard' && <PropChalkboard />}
                    {prop === 'radar' && (
                        <g className="robo-prop-radar" fill="none" stroke="#67e8f9" strokeWidth="2">
                            <circle cx="154" cy="24" r="16" /><circle cx="154" cy="24" r="16" /><circle cx="154" cy="24" r="16" />
                        </g>
                    )}

                    <g>
                        {/* ===== PROPULSOR ===== */}
                        <g className="robo-thruster">
                            <ellipse cx="160" cy="304" rx="20" ry="22" fill="url(#robo-halo-cyan)" opacity="0.8" />
                            <path className="robo-flame robo-flame--outer" d="M144 290 Q160 340 176 290 Z" fill="url(#robo-flame)" />
                            <path className="robo-flame robo-flame--inner" d="M151 290 Q160 322 169 290 Z" fill="#ecfeff" opacity="0.9" />
                        </g>
                        <path d="M130 266 Q160 300 190 266 Z" fill="url(#robo-body)" />
                        <rect x="143" y="280" width="34" height="12" rx="6" fill="url(#robo-metal)" />
                        <rect x="147" y="288" width="26" height="5" rx="2.5" fill="#1e1b4b" />

                        <motion.g style={{ rotate: bodyRot, originX: '160px', originY: '270px' }}>
                            {/* ===== BRAZO IZQUIERDO ===== */}
                            <g className="robo-arm robo-arm--left">
                                <circle cx="104" cy="202" r="12" fill="url(#robo-metal)" />
                                <rect x="90" y="204" width="20" height="38" rx="10" fill="url(#robo-limb)" />
                                <rect x="93" y="207" width="6" height="28" rx="3" fill="rgba(255,255,255,0.25)" />
                                <circle cx="100" cy="244" r="8" fill="url(#robo-metal)" />
                                <g className="robo-hand">
                                    <circle cx="100" cy="254" r="10" fill="url(#robo-limb)" />
                                    <path d="M92 258 q-4 8 2 12 M108 258 q4 8 -2 12" stroke="#c7d2fe" strokeWidth="4" strokeLinecap="round" fill="none" />
                                    <circle cx="97" cy="250" r="3" fill="rgba(255,255,255,0.45)" />
                                </g>
                            </g>
                            {/* ===== BRAZO DERECHO (saluda) ===== */}
                            <g className="robo-arm robo-arm--right">
                                <circle cx="216" cy="202" r="12" fill="url(#robo-metal)" />
                                <rect x="210" y="204" width="20" height="38" rx="10" fill="url(#robo-limb)" />
                                <rect x="213" y="207" width="6" height="28" rx="3" fill="rgba(255,255,255,0.25)" />
                                <circle cx="220" cy="244" r="8" fill="url(#robo-metal)" />
                                <g className="robo-hand">
                                    <circle cx="220" cy="254" r="10" fill="url(#robo-limb)" />
                                    <path d="M212 258 q-4 8 2 12 M228 258 q4 8 -2 12" stroke="#c7d2fe" strokeWidth="4" strokeLinecap="round" fill="none" />
                                    <circle cx="217" cy="250" r="3" fill="rgba(255,255,255,0.45)" />
                                </g>
                            </g>

                            {/* ===== TORSO ===== */}
                            <rect x="110" y="188" width="100" height="88" rx="36" fill="#1e1b4b" opacity="0.3" />
                            <rect x="110" y="184" width="100" height="88" rx="36" fill="url(#robo-body)" />
                            <path d="M122 196 Q160 182 198 196" stroke="url(#robo-gloss)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
                            <rect x="126" y="200" width="68" height="56" rx="24" fill="rgba(15,12,60,0.35)" stroke="rgba(199,210,254,0.35)" strokeWidth="1.2" />
                            {/* Núcleo IA */}
                            <circle className="robo-core-glow" cx="160" cy="226" r="24" fill="url(#robo-core)" />
                            <circle cx="160" cy="226" r="13" fill="#0e7490" stroke="#a5f3fc" strokeWidth="1.5" />
                            <g className="robo-core-ring">
                                <circle cx="160" cy="226" r="18" fill="none" stroke="#67e8f9" strokeWidth="1.6" strokeDasharray="6 5" opacity="0.85" />
                            </g>
                            <g className="robo-core-ring robo-core-ring--rev">
                                <circle cx="160" cy="226" r="9" fill="none" stroke="#ecfeff" strokeWidth="1.4" strokeDasharray="3 4" />
                            </g>
                            <circle cx="160" cy="226" r="10" fill="url(#robo-halo-cyan)" />
                            <circle className="robo-core-heart" cx="160" cy="226" r="5" fill="#ecfeff" />
                            {/* LEDs del pecho */}
                            {[0, 1, 2].map((i) => (
                                <rect key={i} className="robo-led" style={{ '--d': `${i * 0.25}s` }} x={145 + i * 11} y="248" width="8" height="3.5" rx="1.75" fill="#a5f3fc" />
                            ))}
                            {/* Tornillos */}
                            <circle cx="122" cy="262" r="2.2" fill="url(#robo-metal)" />
                            <circle cx="198" cy="262" r="2.2" fill="url(#robo-metal)" />

                            {/* Accesorios que sujeta delante del pecho */}
                            {prop === 'book' && <PropBook />}
                            {prop === 'gamepad' && <PropGamepad />}
                            {prop === 'guitar' && <PropGuitar />}

                            {/* ===== CUELLO ===== */}
                            <rect x="146" y="168" width="28" height="20" rx="6" fill="url(#robo-metal)" />
                            <rect x="142" y="172" width="36" height="5" rx="2.5" fill="#4338ca" />
                            <rect x="142" y="180" width="36" height="5" rx="2.5" fill="#4338ca" />
                            <line className="robo-neck-energy" x1="160" y1="168" x2="160" y2="188" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />

                            {/* ===== CABEZA ===== */}
                            <motion.g style={{ rotate: headRot, x: headX, originX: '160px', originY: '176px' }}>
                                <g className="robo-head-bob">
                                    {/* Antena */}
                                    <g className="robo-antenna">
                                        <path d="M160 64 L160 40 L154 28" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M161.5 62 L161.5 41 L156 30" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                                        <circle cx="160" cy="42" r="4" fill="url(#robo-metal)" />
                                        <circle cx="154" cy="24" r="20" fill="url(#robo-halo-pink)" />
                                        <circle className="robo-orb-pulse" cx="154" cy="24" r="11" fill="none" stroke="#f0abfc" strokeWidth="2" />
                                        <circle className="robo-orb" cx="154" cy="24" r="10" fill="url(#robo-orb)" />
                                        <circle cx="150.5" cy="20.5" r="3.5" fill="rgba(255,255,255,0.75)" />
                                        <path className="robo-wifi robo-wifi--1" d="M170 14 q7 10 0 20" stroke="#c4b5fd" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                                        <path className="robo-wifi robo-wifi--2" d="M176 8 q11 16 0 32" stroke="#c4b5fd" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                                        <path className="robo-wifi robo-wifi--3" d="M182 2 q15 22 0 44" stroke="#c4b5fd" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                                    </g>

                                    {/* Orejeras */}
                                    <g>
                                        <rect x="76" y="100" width="20" height="44" rx="10" fill="url(#robo-limb)" />
                                        <rect x="224" y="100" width="20" height="44" rx="10" fill="url(#robo-limb)" />
                                        <circle className="robo-ear-led" cx="86" cy="122" r="4" fill="#67e8f9" />
                                        <circle className="robo-ear-led" cx="234" cy="122" r="4" fill="#67e8f9" />
                                    </g>

                                    {/* Carcasa */}
                                    <rect x="88" y="64" width="144" height="116" rx="42" fill="#1e1b4b" opacity="0.32" />
                                    <rect x="88" y="60" width="144" height="116" rx="42" fill="url(#robo-head)" />
                                    <rect x="88" y="60" width="144" height="116" rx="42" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                                    {/* Brillo especular que se desplaza con la mirada */}
                                    <motion.path style={{ x: shineX }} d="M108 82 Q130 66 168 68" stroke="url(#robo-gloss)" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.7" />
                                    <path d="M98 150 Q104 166 122 172" stroke="rgba(30,27,75,0.35)" strokeWidth="4" strokeLinecap="round" fill="none" />

                                    {/* Visor */}
                                    <rect x="100" y="81" width="120" height="70" rx="33" fill="#1e1b4b" opacity="0.55" />
                                    <rect x="103" y="84" width="114" height="64" rx="30" fill="url(#robo-visor)" />
                                    <g clipPath="url(#robo-visor-clip)">
                                        {/* Rejilla tenue y barrido de escaneo */}
                                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                            <line key={i} x1="103" x2="217" y1={88 + i * 9} y2={88 + i * 9} stroke="rgba(129,140,248,0.10)" strokeWidth="1" />
                                        ))}
                                        <rect className="robo-scan" x="103" y="84" width="114" height="14" fill="rgba(103,232,249,0.16)" />
                                        {/* Ojos */}
                                        <motion.g style={{ x: faceX, y: faceY }}>
                                        <g className={`robo-gaze ${drawnEyes ? 'robo-gaze--hidden' : ''}`}>
                                            <g className={`robo-eye ${blink ? 'robo-eye--blink' : ''} robo-eye--${mood}`}>
                                                <circle cx="138" cy="116" r="15" fill="url(#robo-sclera)" />
                                                <motion.g style={{ x: irisX, y: irisY }}>
                                                    <circle cx="138" cy="116" r="8.5" fill="url(#robo-iris)" />
                                                    <circle cx="138" cy="116" r="4" fill="#0b0a24" />
                                                    <circle cx="135" cy="112.5" r="2.6" fill="#fff" />
                                                    <circle cx="141" cy="119" r="1.1" fill="rgba(255,255,255,0.8)" />
                                                </motion.g>
                                                <path className="robo-eye-happy" d="M125 120 Q138 104 151 120" stroke="#e0e7ff" strokeWidth="5" strokeLinecap="round" fill="none" />
                                            </g>
                                            <g className={`robo-eye robo-eye--big ${blink ? 'robo-eye--blink' : ''} robo-eye--${mood}`}>
                                                <circle cx="182" cy="114" r="19" fill="url(#robo-sclera)" />
                                                <motion.g style={{ x: irisX, y: irisY }}>
                                                    <circle cx="182" cy="114" r="10.5" fill="url(#robo-iris)" />
                                                    <circle cx="182" cy="114" r="5" fill="#0b0a24" />
                                                    <circle cx="178" cy="109.5" r="3.2" fill="#fff" />
                                                    <circle cx="186" cy="118" r="1.4" fill="rgba(255,255,255,0.8)" />
                                                </motion.g>
                                                <path className="robo-eye-happy" d="M166 119 Q182 99 198 119" stroke="#e0e7ff" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                                            </g>
                                        </g>
                                        </motion.g>
                                        {drawnEyes && <DrawnEyes kind={drawnEyes} />}
                                        {/* Reflejo del cristal */}
                                        <path d="M112 92 Q150 84 200 90 L196 96 Q150 90 114 98 Z" fill="rgba(255,255,255,0.10)" />
                                    </g>
                                    <rect x="103" y="84" width="114" height="64" rx="30" fill="none" stroke="rgba(103,232,249,0.35)" strokeWidth="1.2" />

                                    {/* Mejillas */}
                                    <ellipse className="robo-blush" cx="112" cy="158" rx="9" ry="5" fill="#f472b6" />
                                    <ellipse className="robo-blush" cx="208" cy="158" rx="9" ry="5" fill="#f472b6" />

                                    {/* Boca-pantalla */}
                                    <motion.g style={{ x: faceX }}>
                                        <rect x="138" y="152" width="44" height="16" rx="8" fill="#0b0a24" stroke="rgba(103,232,249,0.35)" strokeWidth="1" />
                                        {isTalking ? (
                                            <g>
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <rect
                                                        key={i}
                                                        className="robo-eq"
                                                        style={{ '--d': `${(i % 3) * 0.12 + i * 0.05}s` }}
                                                        x={143 + i * 6} y="154" width="3.6" height="12" rx="1.8"
                                                        fill={i % 2 ? '#f0abfc' : '#67e8f9'}
                                                    />
                                                ))}
                                            </g>
                                        ) : actMouth === 'open' ? (
                                            <g className="robo-mouth-open">
                                                <ellipse cx="160" cy="160" rx="7" ry="5.5" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
                                                <ellipse cx="160" cy="161.5" rx="3.6" ry="2.2" fill="#f472b6" opacity=".8" />
                                            </g>
                                        ) : (
                                            <>
                                                {/* brillo: trazo ancho y tenue debajo (sustituye al filtro) */}
                                                <path
                                                    className="robo-smile"
                                                    d={smileD}
                                                    stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.22"
                                                />
                                                <path
                                                    className="robo-smile"
                                                    d={smileD}
                                                    stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" fill="none"
                                                />
                                            </>
                                        )}
                                    </motion.g>

                                    {/* Tornillos de la carcasa */}
                                    <circle cx="100" cy="72" r="2.6" fill="url(#robo-metal)" />
                                    <circle cx="220" cy="72" r="2.6" fill="url(#robo-metal)" />
                                    <circle className="robo-power" cx="214" cy="164" r="2.6" fill="#4ade80" />

                                    {/* Accesorios de la cabeza */}
                                    {prop === 'glasses' && <PropGlasses />}
                                    {prop === 'bulb' && <PropBulb />}
                                    {prop === 'puff' && <PropPuff />}
                                </g>
                            </motion.g>
                        </motion.g>
                    </g>

                    {/* Accesorios por delante de todo */}
                    {prop === 'balls' && <PropBalls />}
                    {prop === 'dice' && <PropDice />}
                    {prop === 'trophy' && <PropTrophy />}
                    {prop === 'phone' && <PropPhone />}
                    {prop === 'boost' && (
                        <g className="robo-prop-boost" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" opacity=".8">
                            <path d="M120 300 v26" /><path d="M200 300 v26" /><path d="M136 312 v22" /><path d="M184 312 v22" />
                        </g>
                    )}

                    {/* Ondas de voz */}
                    {isTalking && (
                        <g className="robo-voice" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round">
                            <path className="robo-voice-arc" style={{ '--d': '0s' }} d="M248 104 q12 14 0 28" />
                            <path className="robo-voice-arc" style={{ '--d': '.2s' }} d="M258 96 q18 22 0 44" />
                            <path className="robo-voice-arc" style={{ '--d': '0s' }} d="M72 104 q-12 14 0 28" />
                            <path className="robo-voice-arc" style={{ '--d': '.2s' }} d="M62 96 q-18 22 0 44" />
                        </g>
                    )}
                </svg>
                </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ───────────── Ojos dibujados (sustituyen a los normales en algunos números) ───────────── */
const DrawnEyes = ({ kind }) => {
    const L = { x: 138, y: 116, r: 13 };
    const R = { x: 182, y: 114, r: 16 };
    const star = (c, r) => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + (i * Math.PI) / 5;
            const rr = i % 2 ? r * 0.45 : r;
            pts.push(`${(c.x + Math.cos(a) * rr).toFixed(1)},${(c.y + Math.sin(a) * rr).toFixed(1)}`);
        }
        return pts.join(' ');
    };
    const heart = (c, r) => `M${c.x} ${c.y + r * 0.8} C${c.x - r * 1.4} ${c.y - r * 0.1} ${c.x - r * 0.7} ${c.y - r * 1.1} ${c.x} ${c.y - r * 0.35} C${c.x + r * 0.7} ${c.y - r * 1.1} ${c.x + r * 1.4} ${c.y - r * 0.1} ${c.x} ${c.y + r * 0.8} Z`;
    return (
        <g className={`robo-drawn-eyes robo-drawn-eyes--${kind}`}>
            {[L, R].map((c, i) => (
                <g key={i} className="robo-drawn-eye" style={{ transformOrigin: `${c.x}px ${c.y}px` }}>
                    {kind === 'stars' && <polygon points={star(c, c.r)} fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />}
                    {kind === 'hearts' && <path d={heart(c, c.r * 0.9)} fill="#f472b6" stroke="#fbcfe8" strokeWidth="1.5" />}
                    {kind === 'closed' && <path d={`M${c.x - c.r * 0.8} ${c.y} Q${c.x} ${c.y + c.r * 0.7} ${c.x + c.r * 0.8} ${c.y}`} stroke="#e0e7ff" strokeWidth="4.5" strokeLinecap="round" fill="none" />}
                    {kind === 'squint' && <path d={i === 0 ? `M${c.x - 8} ${c.y - 7} L${c.x + 6} ${c.y} L${c.x - 8} ${c.y + 7}` : `M${c.x + 9} ${c.y - 8} L${c.x - 7} ${c.y} L${c.x + 9} ${c.y + 8}`} stroke="#e0e7ff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
                    {kind === 'dizzy' && <path d={`M${c.x} ${c.y} m-2 0 a2 2 0 1 1 4 0 a4.5 4.5 0 1 1 -9 0 a7 7 0 1 1 14 0 a9.5 9.5 0 1 1 -19 0`} stroke="#c4b5fd" strokeWidth="2.6" strokeLinecap="round" fill="none" />}
                </g>
            ))}
        </g>
    );
};

/* ───────────── Accesorios ───────────── */
const Mitt = ({ x, y }) => (
    <g>
        <circle cx={x} cy={y} r="10" fill="url(#robo-limb)" />
        <circle cx={x - 3} cy={y - 3} r="3" fill="rgba(255,255,255,0.45)" />
    </g>
);

const PropBook = () => (
    <g className="robo-prop-book">
        <path d="M112 226 Q136 216 160 228 Q184 216 208 226 L206 262 Q184 252 160 264 Q136 252 114 262 Z" fill="#4338ca" />
        <path d="M116 224 Q138 214 160 226 L160 258 Q138 248 117 256 Z" fill="#fffbeb" />
        <path d="M204 224 Q182 214 160 226 L160 258 Q182 248 203 256 Z" fill="#fef3c7" />
        <g className="robo-prop-book__page"><path d="M160 226 Q182 214 204 224 L203 256 Q182 248 160 258 Z" fill="#fff7ed" /></g>
        {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${122 + (i % 2) * 2} ${232 + i * 6} q16 -4 32 2`} stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" fill="none" />
        ))}
        {[0, 1, 2].map((i) => (
            <path key={`r${i}`} d={`M${168} ${234 + i * 6} q14 -5 30 -2`} stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" fill="none" />
        ))}
        <path d="M160 226 L160 260" stroke="#312e81" strokeWidth="2" />
        <Mitt x={112} y={246} /><Mitt x={208} y={246} />
    </g>
);

const PropGamepad = () => (
    <g className="robo-prop-gamepad">
        <path d="M118 232 Q118 220 132 220 L188 220 Q202 220 202 232 L206 252 Q208 266 194 266 Q184 266 178 254 L142 254 Q136 266 126 266 Q112 266 114 252 Z" fill="#1e1b4b" />
        <path d="M122 230 Q124 224 134 224 L186 224 Q196 224 198 230" stroke="#6366f1" strokeWidth="2" fill="none" />
        <rect x="128" y="234" width="16" height="5" rx="2" fill="#a5b4fc" /><rect x="133.5" y="228.5" width="5" height="16" rx="2" fill="#a5b4fc" />
        <circle className="robo-prop-gamepad__btn" cx="182" cy="232" r="3.6" fill="#f472b6" />
        <circle className="robo-prop-gamepad__btn" cx="190" cy="239" r="3.6" fill="#fbbf24" style={{ animationDelay: '.15s' }} />
        <circle className="robo-prop-gamepad__btn" cx="174" cy="239" r="3.6" fill="#34d399" style={{ animationDelay: '.3s' }} />
        <circle className="robo-prop-gamepad__btn" cx="182" cy="246" r="3.6" fill="#60a5fa" style={{ animationDelay: '.45s' }} />
        <Mitt x={120} y={252} /><Mitt x={200} y={252} />
    </g>
);

const PropGlasses = () => (
    <g className="robo-prop-glasses">
        <circle cx="138" cy="116" r="19" fill="rgba(165,243,252,0.12)" stroke="#fbbf24" strokeWidth="4.5" />
        <circle cx="182" cy="114" r="22" fill="rgba(165,243,252,0.12)" stroke="#fbbf24" strokeWidth="4.5" />
        <path d="M157 113 Q160 108 162 112" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M119 112 L100 106 M204 110 L220 104" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        <path d="M128 104 q8 -5 16 -2 M172 101 q9 -5 19 -2" stroke="#fff" strokeOpacity=".75" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
);

const PropBulb = () => (
    <g className="robo-prop-bulb">
        <g className="robo-prop-bulb__rays" stroke="#fde68a" strokeWidth="3.5" strokeLinecap="round">
            <path d="M200 -36 v-12" /><path d="M222 -26 l9 -8" /><path d="M178 -26 l-9 -8" /><path d="M230 -6 h12" /><path d="M170 -6 h-12" />
        </g>
        <circle cx="200" cy="-8" r="22" fill="#fde68a" opacity=".35" />
        <path d="M200 -30 C186 -30 178 -20 178 -9 C178 0 184 5 188 10 L212 10 C216 5 222 0 222 -9 C222 -20 214 -30 200 -30 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
        <path d="M192 -2 Q200 -12 208 -2" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
        <rect x="189" y="10" width="22" height="6" rx="2" fill="#a5b4fc" /><rect x="191" y="16" width="18" height="5" rx="2" fill="#6366f1" />
        <path d="M188 -22 q-4 6 -2 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
    </g>
);

const PropPuff = () => (
    <g className="robo-prop-puff">
        {[[196, 160, 8], [212, 150, 11], [228, 166, 9], [240, 148, 13], [256, 162, 8]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#e0f2fe" opacity=".9" style={{ animationDelay: `${i * 0.04}s` }} />
        ))}
    </g>
);

const PropChalkboard = () => (
    <g className="robo-prop-chalk">
        <path d="M24 296 L40 230 M84 296 L68 230" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
        <rect x="6" y="170" width="96" height="70" rx="8" fill="#92400e" />
        <rect x="11" y="175" width="86" height="60" rx="5" fill="#14532d" />
        <rect x="11" y="175" width="86" height="60" rx="5" fill="url(#robo-gloss)" opacity=".12" />
        {/* "2 + 2 = 4" escrito trazo a trazo */}
        {[
            'M18 197 q6 -7 10 0 q2 6 -10 11 h11',
            'M37 202 h10 M42 197 v10',
            'M55 197 q6 -7 10 0 q2 6 -10 11 h11',
            'M74 200 h10 M74 205 h10',
            'M96 195 l-6 9 h11 M98 199 v10',
        ].map((d, k) => (
            <path key={k} className="robo-prop-chalk__stroke" style={{ '--k': k }} d={d} stroke="#f8fafc" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        <path className="robo-prop-chalk__check" d="M30 222 l6 6 l12 -12" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="70" y="236" width="14" height="4" rx="2" fill="#f8fafc" />
    </g>
);

const PropBalls = () => (
    <g className="robo-prop-balls">
        {['#f472b6', '#fbbf24', '#22d3ee'].map((c, i) => (
            <g key={c} className="robo-prop-ball" style={{ animationDelay: `${-i * 0.42}s` }}>
                <circle cx="160" cy="40" r="11" fill={c} />
                <circle cx="156" cy="36" r="3.5" fill="#fff" opacity=".7" />
            </g>
        ))}
    </g>
);

const PropDice = () => (
    <g className="robo-prop-dice">
        {[0, 1].map((i) => (
            <g key={i} className="robo-prop-die" style={{ animationDelay: `${i * 0.12}s` }}>
                <rect x={232 + i * 30} y="262" width="26" height="26" rx="6" fill="#fff" stroke="#c7d2fe" strokeWidth="2" />
                {[[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]].map(([cx, cy]) => (
                    <circle key={`${cx}${cy}`} cx={239 + i * 30 + cx * 12} cy={268 + cy * 7} r="2.4" fill="#4338ca" />
                ))}
            </g>
        ))}
    </g>
);

const PropTrophy = () => (
    <g className="robo-prop-trophy">
        <path d="M134 -40 h52 v10 q0 30 -26 34 q-26 -4 -26 -34 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2.5" />
        <path d="M134 -34 q-16 0 -14 12 q2 10 16 10 M186 -34 q16 0 14 12 q-2 10 -16 10" stroke="#f59e0b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="153" y="-6" width="14" height="14" fill="#f59e0b" />
        <rect x="142" y="8" width="36" height="9" rx="3" fill="#6366f1" />
        <path d="M144 -34 q4 18 12 26" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".7" />
        <path d="M160 -30 l3 6 l6 1 l-4.5 4 l1 6 l-5.5 -3 l-5.5 3 l1 -6 l-4.5 -4 l6 -1 Z" fill="#fff7ed" />
        <Mitt x={128} y={10} /><Mitt x={192} y={10} />
    </g>
);

const PropGuitar = () => (
    <g className="robo-prop-guitar">
        <g transform="rotate(-28 160 238)">
            <rect x="166" y="232" width="78" height="8" rx="3" fill="#92400e" />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={176 + i * 11} y="232" width="1.6" height="8" fill="#fde68a" opacity=".8" />)}
            <rect x="240" y="227" width="16" height="18" rx="4" fill="#1e1b4b" />
            <path d="M120 236 C120 218 140 214 152 222 C160 214 178 216 178 236 C178 256 160 260 152 252 C140 262 120 256 120 236 Z" fill="#ec4899" />
            <path d="M126 232 C128 222 140 220 150 226" stroke="#fbcfe8" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="150" cy="237" r="7" fill="#1e1b4b" />
            <rect x="132" y="230" width="6" height="14" rx="2" fill="#f8fafc" />
            {[0, 1, 2].map((i) => <line key={i} x1="140" y1={234 + i * 2.2} x2="244" y2={234 + i * 2.2} stroke="#e2e8f0" strokeWidth=".8" />)}
        </g>
        <g className="robo-prop-guitar__pick"><Mitt x={146} y={250} /></g>
    </g>
);

const PropPhone = () => (
    <g className="robo-prop-phone">
        <g transform="rotate(-12 70 120)">
            <rect x="48" y="86" width="40" height="70" rx="9" fill="#1e1b4b" />
            <rect x="52" y="92" width="32" height="56" rx="5" fill="#312e81" />
            <circle cx="68" cy="98" r="3" fill="#a5b4fc" />
            <circle className="robo-prop-phone__flash" cx="68" cy="98" r="30" fill="#fff" />
        </g>
        <Mitt x={78} y={150} />
    </g>
);

export default RobotMascot;
