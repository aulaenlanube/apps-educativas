// src/apps/_shared/RoscoUI.jsx
// Interfaz del Rosco del Saber (partida local y duelo). Rediseño 2026 sobre el
// kit de juego (_shared/kit): plató de concurso con el rosco de bolas brillantes,
// pantalla oscura con la definición, marcador y resumen con la nota /10.
// SOLO presentación: la lógica vive en useRoscoGame y el tracking (onGameComplete)
// es el mismo de siempre.
import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Check, X, Video, VideoOff, Mic, Headphones, BookOpen, HelpCircle, Play, LayoutGrid,
    FastForward, Clock, Target, CircleDashed, User, Users, LogOut, Crown, RefreshCw,
    ChevronDown, ListChecks, Timer, Sparkles, Pencil,
} from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import RoscoAvatar, { AVATAR_IDS } from '@/components/RoscoAvatars';
import InstructionsModal from './InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, Panel, Chip, GameButton, Segmented,
    ResultsScreen, FeedbackItem, GameLoading, useAppMeta, cleanAppName,
} from './kit';
import './RoscoShared.css';

const ICONS = AVATAR_IDS;
const cx = (...c) => c.filter(Boolean).join(' ');
const fmtTime = (s) => `${Math.floor((s || 0) / 60)}:${String((s || 0) % 60).padStart(2, '0')}`;
const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };
const courseOf = (meta) => (meta.level
    ? (meta.grade && meta.level !== 'ad' ? `${meta.grade}º ${LEVEL_LABEL[meta.level] || meta.level}` : (LEVEL_LABEL[meta.level] || meta.level))
    : '');
// Tono del chip de dificultad (ESO/Bach). 'hard' es un tono propio (naranja) definido en RoscoShared.css.
const CHIP_ICON = { easy: Sparkles, medium: Target, hard: Target, exam: Crown };

/* ───────────────────────── Piezas compartidas con RoscoJuego/RoscoDuel ───────────────────────── */

// Escenario del Rosco (azul de plató + violeta, colores del icono de la app).
export const RoscoShell = ({ children, className = '', ...rest }) => (
    <GameShell accent="#3b82f6" accent2="#8b5cf6" className={cx('rsc', className)} {...rest}>
        {children}
    </GameShell>
);

// Chip de dificultad (Principiante… Experto) o de duelo.
export const RoscoChip = ({ chip }) => {
    if (!chip) return null;
    const Icon = chip.icon || CHIP_ICON[chip.tone] || Target;
    return <span className={`gk-chip gk-chip--mode gk-tone-${chip.tone || 'easy'}`}><Icon size={13} /> {chip.label}</span>;
};

// Instrucciones del Rosco (pantalla previa, configuración y partida).
export const RoscoInstructions = ({ isOpen, onClose }) => (
    <InstructionsModal isOpen={isOpen} onClose={onClose} title="Cómo jugar al Rosco del Saber">
        <h3>🎯 Objetivo</h3>
        <p>
            Completa el rosco acertando el mayor número de palabras. Cada letra esconde una
            definición: la palabra <strong>empieza por</strong> esa letra o la <strong>contiene</strong>.
        </p>
        <h3>🕹️ Cómo se juega</h3>
        <ul>
            <li>Lee la definición, escribe la respuesta y pulsa <kbd>Intro</kbd> o el botón ✓.</li>
            <li>¿No la sabes? Pulsa <strong>Pasapalabra</strong>: la letra vuelve a salir en la siguiente vuelta.</li>
            <li>Las tildes y las mayúsculas no cuentan como fallo.</li>
            <li>Puedes dictar la respuesta con el micrófono (y decir «pasapalabra» en voz alta).</li>
            <li>A dos jugadores, el turno pasa al rival cuando fallas o pasas palabra.</li>
        </ul>
        <h3>🎨 Colores del rosco</h3>
        <RoscoLegend />
        <h3>🏆 Nota y puntos</h3>
        <p className="instr-formula"><strong>Nota</strong> = aciertos / preguntas × 10</p>
        <p className="instr-formula"><strong>Puntos</strong> = 100 por acierto + hasta 300 por el tiempo que te sobre</p>
        <p className="instr-note">El bonus de tiempo solo existe si juegas a contrarreloj.</p>
        <div className="instr-tips">
            <strong>💡 Consejo:</strong> antes de jugar repasa el <strong>material de estudio</strong>:
            tiene todas las palabras ordenadas por letra.
        </div>
    </InstructionsModal>
);

export const RoscoLegend = () => (
    <div className="rsc-legend" aria-label="Leyenda de colores">
        <span><i className="rsc-dot is-pending" /> Pendiente</span>
        <span><i className="rsc-dot is-current" /> En juego</span>
        <span><i className="rsc-dot is-pending is-passed" /> Pasapalabra</span>
        <span><i className="rsc-dot is-correct" /> Acierto</span>
        <span><i className="rsc-dot is-wrong" /> Fallo</span>
    </div>
);

// Material de estudio: palabras agrupadas por letra inicial (CLAUDE.md §4).
export const RoscoStudyModal = ({ material, onClose }) => {
    const [letter, setLetter] = useState(material?.secciones?.[0]?.letra || null);
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    if (!material) return null;
    const section = material.secciones.find((s) => s.letra === letter);
    return (
        <motion.div className="rsc-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                className="rsc-sheet rsc-study"
                role="dialog"
                aria-modal="true"
                aria-label={material.titulo}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 26, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
                <header className="rsc-sheet__head">
                    <span className="rsc-sheet__icon"><BookOpen size={24} /></span>
                    <div className="rsc-sheet__titles">
                        <span className="rsc-eyebrow">Material de estudio</span>
                        <h2>{material.titulo}</h2>
                        <p>{material.introduccion}</p>
                    </div>
                    <button type="button" className="rsc-close" onClick={onClose} aria-label="Cerrar material de estudio"><X size={18} /></button>
                </header>

                <div className="rsc-study__letters" role="tablist" aria-label="Letras">
                    {material.secciones.map((sec) => (
                        <button
                            key={sec.letra}
                            type="button"
                            role="tab"
                            aria-selected={letter === sec.letra}
                            className={cx('rsc-chipball', letter === sec.letra && 'is-active')}
                            onClick={() => setLetter(sec.letra)}
                        >
                            {sec.letra}
                            <small>{sec.conceptos.length}</small>
                        </button>
                    ))}
                </div>

                <div className="rsc-study__list">
                    {section && (
                        <div key={section.letra} className="rsc-study__group">
                            {section.conceptos.map((con, i) => (
                                <article key={`${con.termino}-${i}`} className="rsc-concept" style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}>
                                    <span className="rsc-concept__ball" aria-hidden="true">{section.letra}</span>
                                    <div className="rsc-concept__body">
                                        <div className="rsc-concept__head">
                                            <h3>{con.termino}</h3>
                                            <span className="rsc-concept__rule">{con.pista}</span>
                                        </div>
                                        <p>{con.definicion}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="rsc-sheet__foot">
                    <GameButton size="lg" icon={Play} onClick={onClose}>¡Entendido, a jugar!</GameButton>
                </footer>
            </motion.div>
        </motion.div>
    );
};

/* ───────────────────────── Componente principal ───────────────────────── */

const RoscoUI = ({
    gameState, players, activePlayer, activePlayerIndex, currentQuestion,
    checkAnswer, pasapalabra, restartGame, feedback,
    startGame, config, setConfig, maxQuestions,
    animState,
    showExitConfirm, requestExit, cancelExit, confirmExit,
    loadStudyMaterial,
    onGameComplete,
    onBackToDifficulty,
    restartLabel,
    hideExitButton,
    chip, // { label, tone } — dificultad (ESO/Bach) o duelo; solo presentación
}) => {
    const meta = useAppMeta();
    const ringUid = useId().replace(/:/g, '');
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    const [showStudyMaterial, setShowStudyMaterial] = useState(false);
    const [materialData, setMaterialData] = useState(null);
    const [avatarModalPlayer, setAvatarModalPlayer] = useState(null); // 'player1' | 'player2' | null
    const [showHelp, setShowHelp] = useState(false);
    const [showSolutions, setShowSolutions] = useState(false);
    // Letras pasadas con "pasapalabra" (solo para pintarlas distinto): { [playerId]: { [letra]: true } }
    const [passed, setPassed] = useState({});
    const celebratedRef = useRef(false);

    // --- ESTADO WEBCAM ---
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // --- ESTADO VOZ ---
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [autoRecord, setAutoRecord] = useState(false);
    const [hasAutoRecorded, setHasAutoRecorded] = useState(false);
    const recognitionRef = useRef(null);

    // Referencias
    const autoRecordRef = useRef(autoRecord);
    const checkAnswerRef = useRef(checkAnswer);
    const pasapalabraRef = useRef(pasapalabra);
    const trackedRef = useRef(false);

    useEffect(() => {
        autoRecordRef.current = autoRecord;
        checkAnswerRef.current = checkAnswer;
        pasapalabraRef.current = pasapalabra;
    }, [autoRecord, checkAnswer, pasapalabra]);

    useEffect(() => {
        if (gameState === 'finished' && !trackedRef.current) {
            trackedRef.current = true;
            const best = [...players].sort((a, b) => b.score - a.score)[0];
            const aciertos = best?.score || 0;
            const tiempoSobrante = best?.timeLeft || 0;
            const basePoints = aciertos * 100;
            const refTime = config.timeLimit || 300;
            const timeBonus = Math.max(0, Math.round(300 * (tiempoSobrante / refTime)));
            const totalPoints = basePoints + timeBonus;
            onGameComplete?.({
                mode: 'test',
                score: totalPoints,
                maxScore: config.questionCount * 100 + 300,
                correctAnswers: aciertos,
                totalQuestions: config.questionCount,
            });
        }
        if (gameState !== 'finished') trackedRef.current = false;
    }, [gameState, players, config.questionCount, config.timeLimit, onGameComplete]);

    // Inicializar Reconocimiento de Voz
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setVoiceSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';

            recognition.onstart = () => setIsListening(true);

            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const cleanTranscript = transcript.replace(/\.$/, "").trim();

                if (cleanTranscript.toLowerCase() === 'pasapalabra') {
                    setInputValue('');
                    setIsListening(false);
                    pasapalabraRef.current();
                    return;
                }

                setInputValue(cleanTranscript);
                setIsListening(false);

                if (autoRecordRef.current) {
                    checkAnswerRef.current(cleanTranscript);
                    setInputValue(''); // Limpiar también en modo automático
                }
            };

            recognition.onerror = (event) => {
                console.error("Error reconocimiento voz:", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Control del micro
    const startListening = () => {
        if (!recognitionRef.current || isListening) return;
        try {
            setInputValue('');
            recognitionRef.current.start();
            if (inputRef.current) inputRef.current.focus();
        } catch (e) {
            console.error("No se pudo iniciar el micro", e);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current || !isListening) return;
        recognitionRef.current.stop();
    };

    const toggleMic = () => {
        if (isListening) stopListening();
        else startListening();
    };

    const toggleAutoRecord = () => {
        setAutoRecord(prev => !prev);
        if (autoRecord && isListening) stopListening();
    };

    // Lógica Auto-Record
    useEffect(() => {
        setHasAutoRecorded(false);
    }, [currentQuestion]);

    useEffect(() => {
        if (
            autoRecord &&
            voiceSupported &&
            !isListening &&
            !hasAutoRecorded &&
            gameState === 'playing' &&
            animState === 'none' &&
            !feedback &&
            !showExitConfirm
        ) {
            const timer = setTimeout(() => {
                startListening();
                setHasAutoRecorded(true);
            }, 200);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRecord, voiceSupported, isListening, hasAutoRecorded, gameState, animState, feedback, showExitConfirm]);


    // Auto-focus y limpieza
    useEffect(() => {
        if (gameState === 'playing' && inputRef.current && !feedback && animState !== 'pasapalabra-out' && !showExitConfirm && !isListening) {
            inputRef.current.focus();
            if (!isListening && !inputValue) setInputValue('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion, feedback, gameState, activePlayerIndex, animState, showExitConfirm, isListening]);

    // Webcam
    useEffect(() => {
        const startWebcam = async () => {
            if (isWebcamOn) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error("Error webcam:", err);
                    setIsWebcamOn(false);
                }
            } else {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            }
        };
        startWebcam();
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        };
    }, [isWebcamOn]);

    const toggleWebcam = () => setIsWebcamOn(prev => !prev);

    // --- Presentación: marcar la letra pasada con "pasapalabra" (no toca el juego) ---
    const activeId = activePlayer?.id;
    const currentLetter = currentQuestion?.letra;
    useEffect(() => {
        if (feedback?.type !== 'info' || activeId == null || !currentLetter) return;
        setPassed((prev) => ({ ...prev, [activeId]: { ...(prev[activeId] || {}), [currentLetter]: true } }));
    }, [feedback, activeId, currentLetter]);
    useEffect(() => {
        if (gameState === 'config') { setPassed({}); setShowSolutions(false); celebratedRef.current = false; }
    }, [gameState]);

    // --- Presentación: confeti al terminar con buena nota (una vez por partida) ---
    useEffect(() => {
        if (gameState !== 'finished' || celebratedRef.current || players.length !== 1) return;
        celebratedRef.current = true;
        const nota = (players[0].score / (config.questionCount || 1)) * 10;
        if (nota >= 8) {
            confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 }, colors: ['#3b82f6', '#8b5cf6', '#fbbf24', '#10b981'] });
        }
    }, [gameState, players, config.questionCount]);

    // --- CORRECCIÓN AQUÍ: Limpiar input al enviar ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !!feedback || animState !== 'none' || showExitConfirm) return;
        checkAnswer(inputValue);
        setInputValue(''); // ¡Esto faltaba!
    };

    const handleOpenStudyMaterial = async () => {
        const material = await loadStudyMaterial();
        if (material) {
            setMaterialData(material);
            setShowStudyMaterial(true);
        }
    };

    const instructions = <RoscoInstructions isOpen={showHelp} onClose={() => setShowHelp(false)} />;
    // Clase por dificultad: el chip de "Avanzado" usa un tono propio (naranja)
    const diffClass = chip?.id ? `rsc--diff-${chip.id}` : '';
    const headerMode = chip ? (chip.tone === 'hard' ? 'medium' : chip.tone) : null;

    /* ───────────── Configuración de la partida ───────────── */
    if (gameState === 'config') {
        const handleConfigChange = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
        const handlePlayerChange = (key, field, value) => setConfig(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
        const name = cleanAppName(meta.name) || 'El Rosco del Saber';
        const course = courseOf(meta);

        const playerRow = (key, idx) => (
            <div className={`rsc-prow rsc-prow--p${idx}`}>
                <button
                    type="button"
                    className="rsc-prow__avatar"
                    onClick={() => setAvatarModalPlayer(key)}
                    aria-label={`Cambiar personaje del jugador ${idx}`}
                    title="Cambiar personaje"
                >
                    <RoscoAvatar id={config[key].icon} size="100%" />
                    <span className="rsc-prow__edit" aria-hidden="true"><Pencil size={12} /></span>
                </button>
                <label className="rsc-field">
                    <span className="rsc-field__label">Jugador {idx}</span>
                    <input
                        type="text"
                        value={config[key].name}
                        onChange={(e) => handlePlayerChange(key, 'name', e.target.value)}
                        className="rsc-field__input"
                        maxLength={24}
                    />
                </label>
            </div>
        );

        return (
            <RoscoShell className={diffClass}>
                <div className="rsc-setup">
                    <div className="rsc-hero">
                        {meta.appId && hasAppIcon(meta.appId) && (
                            <div className="rsc-hero__icon">
                                <span className="rsc-hero__halo" aria-hidden="true" />
                                <AppIcon appId={meta.appId} size={104} />
                            </div>
                        )}
                        <div className="rsc-hero__intro">
                            <div className="rsc-hero__chips">
                                {course && <Chip>{course}</Chip>}
                                <RoscoChip chip={chip} />
                            </div>
                            <h1 className="rsc-hero__title">{name}</h1>
                            <p className="rsc-hero__desc">
                                {meta.description || 'Completa el rosco de la A a la Z adivinando una palabra por letra.'}
                            </p>
                            <div className="rsc-hero__links">
                                <GameButton variant="soft" size="sm" icon={HelpCircle} onClick={() => setShowHelp(true)}>Cómo se juega</GameButton>
                                <GameButton variant="soft" size="sm" icon={BookOpen} onClick={handleOpenStudyMaterial}>Material de estudio</GameButton>
                            </div>
                        </div>
                    </div>

                    <div className="rsc-setup__grid">
                        <Panel variant="surface" className="rsc-setup__card">
                            <h2 className="rsc-setup__title"><Users size={18} /> Jugadores</h2>
                            <Segmented
                                options={[
                                    { value: 1, label: '1 jugador', icon: User },
                                    { value: 2, label: '2 jugadores', icon: Users },
                                ]}
                                value={config.numPlayers}
                                onChange={(v) => handleConfigChange('numPlayers', v)}
                            />
                            {playerRow('player1', 1)}
                            <AnimatePresence initial={false}>
                                {config.numPlayers === 2 && (
                                    <motion.div
                                        key="p2"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.22 }}
                                    >
                                        {playerRow('player2', 2)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {config.numPlayers === 2 && (
                                <p className="rsc-setup__hint">Por turnos en el mismo dispositivo: el turno cambia al fallar o pasar palabra.</p>
                            )}
                        </Panel>

                        <Panel variant="surface" className="rsc-setup__card">
                            <h2 className="rsc-setup__title"><ListChecks size={18} /> Partida</h2>
                            <div className="rsc-rule">
                                <div className="rsc-rule__head">
                                    <span>Preguntas</span>
                                    <strong className="rsc-rule__value">{config.questionCount}</strong>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max={maxQuestions}
                                    value={config.questionCount}
                                    onChange={(e) => handleConfigChange('questionCount', parseInt(e.target.value))}
                                    className="rsc-range"
                                    style={{ '--fill': `${Math.max(0, Math.min(100, ((config.questionCount - 5) / Math.max(1, maxQuestions - 5)) * 100))}%` }}
                                    aria-label="Número de preguntas"
                                />
                                <div className="rsc-rule__scale"><span>5</span><span>{maxQuestions}</span></div>
                            </div>

                            <div className="rsc-rule">
                                <div className="rsc-rule__head">
                                    <label className="rsc-switch">
                                        <input
                                            type="checkbox"
                                            checked={config.useTimer}
                                            onChange={(e) => handleConfigChange('useTimer', e.target.checked)}
                                        />
                                        <span className="rsc-switch__track" aria-hidden="true"><span className="rsc-switch__thumb" /></span>
                                        <span>Contrarreloj</span>
                                    </label>
                                    {config.useTimer && <strong className="rsc-rule__value"><Clock size={16} /> {fmtTime(config.timeLimit)}</strong>}
                                </div>
                                {config.useTimer ? (
                                    <>
                                        <input
                                            type="range"
                                            min="30"
                                            max="300"
                                            step="10"
                                            value={config.timeLimit}
                                            onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value))}
                                            className="rsc-range rsc-range--time"
                                            style={{ '--fill': `${((config.timeLimit - 30) / 270) * 100}%` }}
                                            aria-label="Tiempo por jugador"
                                        />
                                        <div className="rsc-rule__scale"><span>0:30</span><span>5:00</span></div>
                                    </>
                                ) : (
                                    <p className="rsc-setup__hint">Sin límite de tiempo. Actívalo para ganar puntos extra por rapidez.</p>
                                )}
                            </div>
                        </Panel>
                    </div>

                    <div className="rsc-setup__cta">
                        {onBackToDifficulty && (
                            <GameButton variant="ghost" icon={LayoutGrid} onClick={onBackToDifficulty}>
                                Cambiar dificultad
                            </GameButton>
                        )}
                        <GameButton size="lg" icon={Play} className="rsc-start" onClick={() => startGame(config)}>
                            ¡Empezar partida!
                        </GameButton>
                    </div>
                </div>

                <AnimatePresence>
                    {showStudyMaterial && materialData && (
                        <RoscoStudyModal key="study" material={materialData} onClose={() => setShowStudyMaterial(false)} />
                    )}
                </AnimatePresence>

                {/* Modal de selección de avatar */}
                <AnimatePresence>
                    {avatarModalPlayer && (
                        <motion.div
                            key="avatars"
                            className="rsc-overlay"
                            onClick={() => setAvatarModalPlayer(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="rsc-sheet rsc-avatars"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Elige tu personaje"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            >
                                <header className="rsc-avatars__head">
                                    <span className="rsc-eyebrow">{config[avatarModalPlayer].name}</span>
                                    <h2>Elige tu personaje</h2>
                                    <button type="button" className="rsc-close" onClick={() => setAvatarModalPlayer(null)} aria-label="Cerrar"><X size={18} /></button>
                                </header>
                                <div className="rsc-avatars__preview">
                                    <span className="rsc-avatars__spot" aria-hidden="true" />
                                    <motion.span
                                        key={config[avatarModalPlayer].icon}
                                        className="rsc-avatars__big"
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                                    >
                                        <RoscoAvatar id={config[avatarModalPlayer].icon} size="100%" />
                                    </motion.span>
                                </div>
                                <div className="rsc-avatars__grid">
                                    {ICONS.map(i => {
                                        const isSelected = config[avatarModalPlayer].icon === i;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handlePlayerChange(avatarModalPlayer, 'icon', i)}
                                                className={cx('rsc-avatars__opt', isSelected && 'is-selected')}
                                                aria-pressed={isSelected}
                                            >
                                                <RoscoAvatar id={i} size="100%" />
                                            </button>
                                        );
                                    })}
                                </div>
                                <footer className="rsc-sheet__foot">
                                    <GameButton size="lg" icon={Check} onClick={() => setAvatarModalPlayer(null)}>Confirmar</GameButton>
                                </footer>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {instructions}
            </RoscoShell>
        );
    }

    /* ───────────── Final de la partida ───────────── */
    if (gameState === 'finished') {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];
        const isTie = players.length === 2 && players[0].score === players[1].score;
        const isSinglePlayer = players.length === 1;
        const total = config.questionCount || 1;

        const actions = [
            { label: restartLabel || 'Nueva partida', onClick: restartGame, icon: restartLabel ? LogOut : RefreshCw },
            onBackToDifficulty && { label: 'Cambiar dificultad', onClick: onBackToDifficulty, icon: LayoutGrid, variant: 'soft' },
        ].filter(Boolean);

        if (isSinglePlayer) {
            const statuses = Object.values(winner.letterStatus);
            const wrong = statuses.filter(s => s === 'wrong').length;
            const pending = statuses.filter(s => s === 'pending').length;
            // Solo presentación: misma fórmula de nota y de puntos paralelos de siempre
            const nota = Math.round((winner.score / total) * 100) / 10;
            const points = winner.score * 100 + Math.max(0, Math.round(300 * ((winner.timeLeft || 0) / (config.timeLimit || 300))));
            const misses = winner.questions.filter(q => winner.letterStatus[q.letra] !== 'correct');
            return (
                <RoscoShell className={diffClass}>
                    <ResultsScreen
                        title="¡Rosco completado!"
                        subtitle={[cleanAppName(meta.name) || 'El Rosco del Saber', chip?.label].filter(Boolean).join(' · ')}
                        nota={nota}
                        points={points}
                        stats={[
                            { icon: Target, tone: 'good', label: 'Aciertos', value: `${winner.score}/${total}` },
                            { icon: X, tone: 'lives', label: 'Fallos', value: wrong },
                            { icon: CircleDashed, tone: 'bad', label: 'Sin responder', value: pending },
                            config.useTimer && { icon: Timer, tone: 'time', label: 'Te sobró', value: fmtTime(winner.timeLeft || 0) },
                        ].filter(Boolean)}
                        actions={actions}
                    >
                        <div className="rsc-recap">
                            <div className="rsc-recap__strip" aria-label="Tu rosco">
                                {winner.questions.map((q, i) => (
                                    <span
                                        key={q.letra}
                                        className={`rsc-mini is-${winner.letterStatus[q.letra]}`}
                                        style={{ animationDelay: `${0.3 + i * 0.03}s` }}
                                        title={`${q.letra}: ${q.solucion}`}
                                    >
                                        {q.letra}
                                    </span>
                                ))}
                            </div>
                            {misses.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        className={cx('rsc-recap__toggle', showSolutions && 'is-open')}
                                        onClick={() => setShowSolutions(v => !v)}
                                        aria-expanded={showSolutions}
                                    >
                                        <BookOpen size={16} />
                                        {showSolutions ? 'Ocultar soluciones' : `Ver soluciones para repasar (${misses.length})`}
                                        <ChevronDown size={16} className="rsc-recap__chev" />
                                    </button>
                                    {showSolutions && misses.map((q) => (
                                        <FeedbackItem key={q.letra} index={q.letra} ok={false} title={q.solucion}>
                                            <span className="rsc-recap__rule">
                                                {winner.letterStatus[q.letra] === 'pending' ? 'Sin responder' : 'Fallada'} · {q.tipo === 'empieza' ? 'Empieza por' : 'Contiene la'} {q.letra}
                                            </span>
                                            {q.definicion}
                                        </FeedbackItem>
                                    ))}
                                </>
                            )}
                        </div>
                    </ResultsScreen>
                </RoscoShell>
            );
        }

        // Dos jugadores (local o duelo)
        return (
            <RoscoShell className={diffClass}>
                <motion.div
                    className="rsc-versus"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                >
                    <span className="gk-chip gk-chip--accent"><Users size={13} /> Partida a dos</span>
                    <h2 className="rsc-versus__title">{isTie ? '¡Empate!' : `¡Ha ganado ${winner.name}!`}</h2>
                    <div className="rsc-versus__cards">
                        {players.map((p, idx) => {
                            const isWin = !isTie && p.id === winner.id;
                            return (
                                <React.Fragment key={p.id}>
                                    {idx === 1 && <span className="rsc-versus__vs" aria-hidden="true">VS</span>}
                                    <motion.div
                                        className={cx('rsc-vcard', `rsc-vcard--p${idx + 1}`, isWin && 'is-winner')}
                                        initial={{ opacity: 0, y: 24, scale: 0.94 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.15 + idx * 0.12, type: 'spring', stiffness: 220, damping: 18 }}
                                    >
                                        {isWin && <span className="rsc-vcard__crown"><Crown size={22} /></span>}
                                        <span className="rsc-vcard__avatar"><RoscoAvatar id={p.icon} size="100%" /></span>
                                        <strong className="rsc-vcard__name">{p.name}</strong>
                                        <span className="rsc-vcard__nota">
                                            {((p.score / total) * 10).toFixed(1).replace('.', ',')}<small>/10</small>
                                        </span>
                                        <span className="rsc-vcard__hits"><Check size={14} strokeWidth={3} /> {p.score} aciertos</span>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="rsc-versus__actions">
                        {actions.map((a, i) => (
                            <GameButton key={a.label} size="lg" variant={a.variant || (i === 0 ? 'primary' : 'soft')} icon={a.icon} onClick={a.onClick}>
                                {a.label}
                            </GameButton>
                        ))}
                    </div>
                </motion.div>
            </RoscoShell>
        );
    }

    if (gameState === 'loading' || !activePlayer || !currentQuestion) {
        return (
            <RoscoShell>
                <GameLoading label="Preparando el rosco…" />
            </RoscoShell>
        );
    }

    /* ───────────── Partida ───────────── */
    const letters = Object.keys(activePlayer.letterStatus);
    const n = letters.length;
    const statuses = Object.values(activePlayer.letterStatus);
    const correctCount = statuses.filter(s => s === 'correct').length;
    const wrongCount = statuses.filter(s => s === 'wrong').length;
    const pendingCount = statuses.filter(s => s === 'pending').length;
    const myPassed = passed[activePlayer.id] || {};
    const isMulti = players.length > 1;
    const busy = !!feedback || animState !== 'none' || showExitConfirm;

    // Tamaño de las bolas (fracción del rosco) según cuántas letras hay
    const ballFrac = Math.min(0.12, ((2 * Math.PI * 0.43) / Math.max(n, 1)) * 0.82);
    const grooveW = ballFrac * 100 * 1.22;
    // Arco del centro: tiempo restante (contrarreloj) o progreso del rosco
    const arcR = 30.5;
    const arcC = 2 * Math.PI * arcR;
    const lowTime = config.useTimer && activePlayer.timeLeft < 10;
    const arcValue = config.useTimer
        ? Math.max(0, Math.min(1, (activePlayer.timeLeft || 0) / (config.timeLimit || 1)))
        : (n ? (n - pendingCount) / n : 0);

    let animationClass = '';
    if (animState === 'pasapalabra-out') animationClass = 'is-out';
    else if (animState === 'pasapalabra-in') animationClass = 'is-in';
    else if (animState === 'turn-change') animationClass = 'is-turn';

    const fbIcon = feedback?.type === 'success' ? <Check size={34} strokeWidth={3.2} /> : feedback?.type === 'error' ? <X size={34} strokeWidth={3.2} /> : <FastForward size={32} />;

    return (
        <RoscoShell className={cx(diffClass, 'rsc--playing')}>
            <GameHeader
                mode={headerMode}
                modeLabel={chip?.label}
                onHelp={() => setShowHelp(true)}
                right={
                    <Hud>
                        <HudStat icon={Check} tone="good" value={correctCount} label="Aciertos" />
                        <HudStat icon={X} tone="lives" value={wrongCount} label="Fallos" />
                        <HudStat icon={CircleDashed} tone="progress" value={pendingCount} label="Quedan" />
                        {config.useTimer && (
                            <HudStat icon={Clock} tone={lowTime ? 'lives' : 'time'} value={fmtTime(activePlayer.timeLeft)} label="Tiempo" />
                        )}
                    </Hud>
                }
            />

            {/* Barra de jugadores: solo en multijugador */}
            {isMulti && (
                <div className="rsc-players">
                    {players.map((p, idx) => {
                        const isActive = activePlayerIndex === idx;
                        const st = Object.values(p.letterStatus);
                        return (
                            <div key={p.id} className={cx('rsc-player', `rsc-player--p${idx + 1}`, isActive && 'is-active')}>
                                <span className="rsc-player__avatar"><RoscoAvatar id={p.icon} size="100%" /></span>
                                <div className="rsc-player__info">
                                    <strong>{p.name}</strong>
                                    <span className="rsc-player__score">
                                        <b className="is-ok"><Check size={12} strokeWidth={3} /> {st.filter(s => s === 'correct').length}</b>
                                        <b className="is-ko"><X size={12} strokeWidth={3} /> {st.filter(s => s === 'wrong').length}</b>
                                        {config.useTimer && (
                                            <b className={cx('rsc-player__time', p.timeLeft < 10 && 'is-low')}><Clock size={12} strokeWidth={3} /> {fmtTime(p.timeLeft)}</b>
                                        )}
                                    </span>
                                </div>
                                {isActive && <span className="rsc-player__turn">Turno</span>}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="rsc-stage">
                {/* ── El rosco ── */}
                <div className="rsc-ringwrap">
                    <div className={cx('rsc-ring', feedback && `is-fb-${feedback.type}`)} style={{ '--bs': ballFrac }}>
                        <svg className="rsc-ring__svg" viewBox="0 0 100 100" aria-hidden="true">
                            <defs>
                                <radialGradient id={`${ringUid}-plate`} cx="50%" cy="38%" r="62%">
                                    <stop offset="0" stopColor="#2f56d6" />
                                    <stop offset=".5" stopColor="#173089" />
                                    <stop offset="1" stopColor="#0a1145" />
                                </radialGradient>
                                <radialGradient id={`${ringUid}-stage`} cx="50%" cy="30%" r="70%">
                                    <stop offset="0" stopColor="#3b5fe0" stopOpacity=".55" />
                                    <stop offset="1" stopColor="#070c33" stopOpacity=".85" />
                                </radialGradient>
                                <linearGradient id={`${ringUid}-rim`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" stopColor="#dbeafe" />
                                    <stop offset=".5" stopColor="#60a5fa" />
                                    <stop offset="1" stopColor="#1e3a8a" />
                                </linearGradient>
                                <linearGradient id={`${ringUid}-arc`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0" stopColor={lowTime ? '#fb7185' : config.useTimer ? '#67e8f9' : '#6ee7b7'} />
                                    <stop offset="1" stopColor={lowTime ? '#e11d48' : config.useTimer ? '#3b82f6' : '#10b981'} />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="49.2" fill={`url(#${ringUid}-plate)`} />
                            <circle cx="50" cy="50" r="49.2" fill="none" stroke={`url(#${ringUid}-rim)`} strokeWidth=".7" opacity=".85" />
                            {/* surco donde ruedan las bolas */}
                            <circle cx="50" cy="50" r="43" fill="none" stroke="#050a2e" strokeOpacity=".55" strokeWidth={grooveW} />
                            <circle cx="50" cy="50" r={43 + grooveW / 2} fill="none" stroke="#93c5fd" strokeOpacity=".35" strokeWidth=".45" />
                            <circle cx="50" cy="50" r={43 - grooveW / 2} fill="none" stroke="#ffffff" strokeOpacity=".12" strokeWidth=".45" />
                            {/* escenario central */}
                            <circle cx="50" cy="50" r="33.4" fill={`url(#${ringUid}-stage)`} />
                            <circle cx="50" cy="50" r={arcR} fill="none" stroke="#ffffff" strokeOpacity=".09" strokeWidth="1.6" />
                            <circle
                                className="rsc-ring__arc"
                                cx="50" cy="50" r={arcR}
                                fill="none"
                                stroke={`url(#${ringUid}-arc)`}
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeDasharray={arcC}
                                strokeDashoffset={arcC * (1 - arcValue)}
                                transform="rotate(-90 50 50)"
                            />
                            {/* brillo de cristal arriba */}
                            <path d="M14 34 C 22 14, 78 14, 86 34 C 74 22, 26 22, 14 34 Z" fill="#ffffff" opacity=".08" />
                        </svg>

                        {isWebcamOn ? (
                            <div className="rsc-ring__cam">
                                <video ref={videoRef} autoPlay playsInline muted className="rsc-ring__video" />
                            </div>
                        ) : (
                            <div className="rsc-ring__center">
                                <span className="rsc-ring__avatar">
                                    <span className="rsc-ring__pedestal" aria-hidden="true" />
                                    <RoscoAvatar id={activePlayer.icon} size="100%" />
                                </span>
                                <span className="rsc-ring__name">{activePlayer.name}</span>
                                {config.useTimer ? (
                                    <span key={lowTime ? activePlayer.timeLeft : 'ok'} className={cx('rsc-ring__time', lowTime && 'is-low')}>
                                        {fmtTime(activePlayer.timeLeft)}
                                    </span>
                                ) : (
                                    <span className="rsc-ring__progress">{n - pendingCount}<small>/{n}</small></span>
                                )}
                            </div>
                        )}

                        {letters.map((letra, index) => {
                            const angle = (index / n) * 2 * Math.PI - (Math.PI / 2);
                            const x = 50 + Math.cos(angle) * 43;
                            const y = 50 + Math.sin(angle) * 43;
                            const isCurrent = currentQuestion.letra === letra;
                            const status = activePlayer.letterStatus[letra];
                            return (
                                <span
                                    key={letra}
                                    className={cx('rsc-ball', `is-${status}`, status === 'pending' && myPassed[letra] && 'is-passed', isCurrent && 'is-current')}
                                    style={{ left: `${x}%`, top: `${y}%` }}
                                >
                                    {letra}
                                </span>
                            );
                        })}
                    </div>
                    <RoscoLegend />
                </div>

                {/* ── Pantalla de la pregunta ── */}
                <Panel variant="screen" className={cx('rsc-question', `is-p${activePlayerIndex + 1}`)}>
                    <div className="rsc-question__bar">
                        <div className="rsc-question__tools">
                            <button type="button" onClick={toggleWebcam} className={cx('rsc-tool', isWebcamOn && 'is-on')} title={isWebcamOn ? "Apagar cámara" : "Encender cámara"} aria-pressed={isWebcamOn}>
                                {isWebcamOn ? <Video size={17} /> : <VideoOff size={17} />}
                            </button>
                            {voiceSupported && (
                                <button type="button" onClick={toggleAutoRecord} className={cx('rsc-tool', autoRecord && 'is-on is-voice')} title={autoRecord ? "Desactivar auto-voz" : "Activar auto-voz"} aria-pressed={autoRecord}>
                                    <Headphones size={17} />
                                </button>
                            )}
                        </div>
                        {isMulti ? (
                            <span className="rsc-question__turn">
                                <span className="rsc-question__turnav"><RoscoAvatar id={activePlayer.icon} size="100%" /></span>
                                Turno de {activePlayer.name}
                            </span>
                        ) : (
                            <span className="rsc-question__count">{chip?.label || 'Rosco del Saber'}</span>
                        )}
                        {!hideExitButton ? (
                            <button type="button" onClick={requestExit} className="rsc-tool rsc-tool--exit" title="Salir">
                                <X size={18} />
                            </button>
                        ) : <span className="rsc-tool rsc-tool--ghost" aria-hidden="true" />}
                    </div>

                    <div className={cx('rsc-question__body', animationClass)}>
                        <div className="rsc-question__head">
                            <span key={currentQuestion.letra} className="rsc-bigball">{currentQuestion.letra}</span>
                            <div className="rsc-question__rule">
                                <span>Letra {letters.indexOf(currentQuestion.letra) + 1} de {n}</span>
                                <strong>{currentQuestion.tipo === 'empieza' ? 'Empieza por la' : 'Contiene la'} <b>{currentQuestion.letra}</b></strong>
                            </div>
                        </div>

                        <p key={`${activePlayer.id}-${currentQuestion.letra}`} className="rsc-question__def">{currentQuestion.definicion}</p>

                        <form onSubmit={handleSubmit} className={cx('rsc-answer', isListening && 'is-listening')}>
                            {voiceSupported && (
                                <button type="button" onClick={toggleMic} className={cx('rsc-answer__mic', isListening && 'is-listening')} title="Dictar respuesta" aria-label="Dictar respuesta" disabled={busy}>
                                    <Mic size={18} />
                                </button>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="rsc-answer__input"
                                placeholder={isListening ? "Escuchando..." : "Escribe tu respuesta..."}
                                autoComplete="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                aria-label="Tu respuesta"
                                disabled={busy}
                            />
                            <button type="submit" className="rsc-answer__send" disabled={busy || !inputValue.trim()} aria-label="Comprobar respuesta">
                                <Check size={20} strokeWidth={3} />
                            </button>
                        </form>

                        <GameButton variant="warning" size="lg" icon={FastForward} className="rsc-pasa" onClick={pasapalabra} disabled={busy} title="Pasar palabra">
                            Pasapalabra
                        </GameButton>
                    </div>

                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                key={`${feedback.type}-${feedback.text}`}
                                className={`rsc-fb rsc-fb--${feedback.type}`}
                                role="status"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                            >
                                <span className="rsc-fb__rays" aria-hidden="true" />
                                <motion.div
                                    className="rsc-fb__card"
                                    initial={{ scale: 0.5, rotate: -6 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                                >
                                    <span className="rsc-fb__badge">{fbIcon}</span>
                                    <span className="rsc-fb__text">{feedback.text}</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Panel>
            </div>

            <AnimatePresence>
                {showExitConfirm && (
                    <motion.div key="exit" className="rsc-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div
                            className="rsc-sheet rsc-dialog"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="rsc-exit-title"
                            initial={{ opacity: 0, y: 20, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                        >
                            <span className="rsc-dialog__icon"><LogOut size={26} /></span>
                            <h2 id="rsc-exit-title">¿Abandonar partida?</h2>
                            <p>El progreso actual se perderá.</p>
                            <div className="rsc-dialog__actions">
                                <GameButton variant="soft" onClick={cancelExit}>Cancelar</GameButton>
                                <GameButton variant="danger" icon={LogOut} onClick={confirmExit}>Sí, salir</GameButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {instructions}
        </RoscoShell>
    );
};

export default RoscoUI;
