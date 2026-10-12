// src/apps/_shared/ComprensionJuego.jsx
// Comprensión Escrita / Oral (solo examen, CLAUDE.md §3). Rediseño 2026 sobre el
// kit de juego (_shared/kit): hoja de lectura con tipografía cuidada (o
// reproductor para la oral), preguntas con AnswerOption y resumen con la nota.
// SOLO presentación: carga de datos, tiempos, puntos, nota y onGameComplete son
// los de siempre.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    BookOpen, Headphones, ListChecks, Award, ArrowRight, RefreshCw, Play, Pause, RotateCcw,
    Type, PenLine, CaseUpper, Ruler, Minus, Plus, Target, Timer, X, ChevronDown,
    Turtle, Rabbit, Gauge, FileText,
} from 'lucide-react';
import { getComprensionData } from '../../services/gameDataService';
import { calcularPuntosComprension } from '../comprension/comprensionScoring';
import InstructionsModal from './InstructionsModal';
import {
    GameShell, GameHeader, Hud, HudStat, Panel, GameButton, Segmented, AnswerOption,
    ResultsScreen, FeedbackItem, GameLoading, GameEmpty, ProgressBar,
} from './kit';
import './ComprensionShared.css';

const cx = (...c) => c.filter(Boolean).join(' ');
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SHELL = {
    escrita: { accent: '#4f46e5', accent2: '#06b6d4' },
    oral: { accent: '#db2777', accent2: '#6366f1' },
};

const ComprensionJuego = ({ level, grade, subjectId, dataUrl, tipo = "escrita", onGameComplete }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState('lectura');
    const [respuestas, setRespuestas] = useState({});
    const [score, setScore] = useState(0);
    const [animacionFase, setAnimacionFase] = useState('fade-in-up');

    // --- NUEVO ESTADO PARA EL DESPLEGABLE DE RESULTADOS ---
    const [showReview, setShowReview] = useState(false);

    // --- NUEVO ESTADO PARA MATERIAL DE ESTUDIO ---
    const [showMaterial, setShowMaterial] = useState(false);
    const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(0);

    // --- Instrucciones (presentación) ---
    const [showHelp, setShowHelp] = useState(false);

    // --- Timers para puntuación ---
    const [readingStart, setReadingStart] = useState(null);
    const [readingTime, setReadingTime] = useState(0); // segundos leyendo
    const [answersStart, setAnswersStart] = useState(null);
    const [answersTime, setAnswersTime] = useState(0); // segundos respondiendo
    const trackedRef = useRef(false);

    // --- Audio States ---
    const [speechRate, setSpeechRate] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // --- Visual Settings ---
    const fontStyles = ['print', 'cursive', 'uppercase'];
    const [fontStyleIndex, setFontStyleIndex] = useState(0);
    const [fontSizeIndex, setFontSizeIndex] = useState(1);
    const sizeClasses = ['size-xs', 'size-md', 'size-lg', 'size-xl', 'size-xxl'];

    // --- Guía de Lectura ---
    const [showRuler, setShowRuler] = useState(false);
    const [rulerY, setRulerY] = useState(0);
    const textRef = useRef(null);

    const handleSpeedChange = (newRate) => {
        setSpeechRate(newRate);
        if (isSpeaking || isPaused) detenerAudio();
    };

    const handleMouseMove = (e) => {
        if (showRuler && textRef.current) {
            const rect = textRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top;
            setRulerY(y);
        }
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        if (!level || !grade || !subjectId) return;

        setLoading(true);
        setError(false);

        getComprensionData(level, grade, subjectId)
            .then(jsonData => {
                if (!jsonData || jsonData.length === 0) throw new Error("Datos vacíos");
                const shuffled = jsonData.sort(() => 0.5 - Math.random());
                setData(shuffled);
                setReadingStart(Date.now());
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando:", err);
                setError(true);
                setLoading(false);
            });

        return () => detenerAudio();
    }, [level, grade, subjectId]);

    const detenerAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    };

    const leerTexto = () => {
        window.speechSynthesis.cancel();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data[currentIndex].texto);
            utterance.lang = 'es-ES';
            utterance.rate = speechRate;
            utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
            utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
            utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleAudio = () => {
        if (!isSpeaking) leerTexto();
        else if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
        else { window.speechSynthesis.pause(); setIsPaused(true); }
    };

    const iniciarTest = () => {
        detenerAudio();
        const elapsed = readingStart ? Math.round((Date.now() - readingStart) / 1000) : 0;
        setReadingTime(elapsed);
        setAnswersStart(Date.now());
        cambiarFase('preguntas');
    };

    const responder = (preguntaIndex, opcionIndex) => {
        // Actualización funcional: dos toques seguidos no se pisan la respuesta.
        setRespuestas((prev) => ({ ...prev, [preguntaIndex]: opcionIndex }));
    };

    const finalizar = () => {
        let aciertos = 0;
        const total = data[currentIndex].preguntas.length;
        data[currentIndex].preguntas.forEach((p, idx) => {
            if (respuestas[idx] === p.correcta) aciertos++;
        });
        setScore(aciertos);

        const respTime = answersStart ? Math.round((Date.now() - answersStart) / 1000) : 0;
        setAnswersTime(respTime);
        const totalTime = readingTime + respTime;

        // Puntos paralelos: base + bonus tiempo lectura + bonus tiempo respuesta
        // (misma función que el resumen: lo mostrado = lo registrado).
        const puntos = calcularPuntosComprension({
            aciertos, totalPreguntas: total, readingSeconds: readingTime, answerSeconds: respTime,
        });

        const notaCalculada = Math.round((aciertos / total) * 100) / 10;
        if (notaCalculada >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899']
            });
        }
        cambiarFase('resultado');
        if (!trackedRef.current) {
            trackedRef.current = true;
            onGameComplete?.({
                mode: 'test',
                score: puntos.total,
                maxScore: puntos.maxScore,
                correctAnswers: aciertos,
                totalQuestions: total,
                durationSeconds: totalTime,
            });
        }
    };

    const siguienteEjercicio = () => {
        detenerAudio();
        setAnimacionFase('shake-exit');

        setTimeout(() => {
            setRespuestas({});
            setScore(0);
            setShowReview(false);
            setReadingStart(Date.now());
            setReadingTime(0);
            setAnswersStart(null);
            setAnswersTime(0);
            trackedRef.current = false;
            setCurrentIndex((prev) => (prev + 1) % data.length);
            setMode('lectura');
            setAnimacionFase('bounce-in');
        }, 600);
    };

    const cambiarFase = (nuevaFase) => {
        setAnimacionFase('fade-out');
        setTimeout(() => {
            setMode(nuevaFase);
            setAnimacionFase('fade-in-up');
        }, 300);
    };

    // Escape cierra el material de estudio
    useEffect(() => {
        if (!showMaterial) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') setShowMaterial(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showMaterial]);

    const isOral = tipo === 'oral';
    const shell = isOral ? SHELL.oral : SHELL.escrita;
    const instructions = (
        <InstructionsModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            title={isOral ? 'Cómo funciona la Comprensión Oral' : 'Cómo funciona la Comprensión Escrita'}
        >
            <h3>🎯 Objetivo</h3>
            <p>
                {isOral
                    ? <>Escucha con atención una historia y demuestra que la has entendido respondiendo a sus preguntas.</>
                    : <>Lee con calma un texto y demuestra que lo has entendido respondiendo a sus preguntas.</>}
            </p>
            <h3>🕹️ Paso a paso</h3>
            <ol>
                <li>{isOral ? <><strong>Escucha</strong> la historia (puedes pausarla y cambiar la velocidad).</> : <><strong>Lee</strong> el texto. Puedes ajustar la letra, el tamaño y activar la guía de lectura.</>}</li>
                <li>Cuando estés listo, pulsa <strong>Ir a las preguntas</strong>. Ya no podrás volver {isOral ? 'a escucharla' : 'al texto'}.</li>
                <li>Responde <strong>todas</strong> las preguntas y pulsa <strong>Corregir</strong>.</li>
                <li>Verás tu nota y podrás revisar la corrección de cada pregunta.</li>
            </ol>
            <h3>🎓 Siempre es examen</h3>
            <p>Cada historia que corriges cuenta como intento de examen.</p>
            <p className="instr-formula"><strong>Nota</strong> = aciertos / preguntas × 10</p>
            <p className="instr-formula"><strong>Puntos</strong> = 100 por acierto + bonus por {isOral ? 'escuchar' : 'leer'} y responder con agilidad</p>
            <div className="instr-tips">
                <strong>💡 Consejo:</strong> {isOral
                    ? 'si te cuesta seguir la historia, ponla en velocidad lenta y escúchala dos veces antes de ir a las preguntas.'
                    : 'lee primero el título y piensa de qué tratará. Si te pierdes, activa la guía de lectura.'}
            </div>
        </InstructionsModal>
    );

    if (loading) {
        return (
            <GameShell {...shell} className="cmp">
                <GameLoading label={isOral ? 'Preparando la historia…' : 'Preparando la lectura…'} />
            </GameShell>
        );
    }
    if (error || !data.length) {
        return (
            <GameShell {...shell} className="cmp">
                <GameHeader mode="exam" onHelp={() => setShowHelp(true)} />
                <GameEmpty title={error ? 'No se pudo cargar la historia' : 'No hay historias disponibles'}>
                    {error ? 'Ha habido un problema al cargar los textos. Inténtalo de nuevo más tarde.' : 'Todavía no hay textos para este curso y asignatura.'}
                </GameEmpty>
                {instructions}
            </GameShell>
        );
    }

    const ejercicioActual = data[currentIndex];
    const currentFontStyle = fontStyles[fontStyleIndex];
    const currentSizeClass = sizeClasses[fontSizeIndex];

    const totalPreguntas = ejercicioActual.preguntas.length;
    const nota = Math.round((score / totalPreguntas) * 100) / 10;
    const totalPoints = calcularPuntosComprension({
        aciertos: score, totalPreguntas, readingSeconds: readingTime, answerSeconds: answersTime,
    }).total;
    const formatTime = (s) => s >= 60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;
    const answeredCount = Object.keys(respuestas).length;
    const allAnswered = answeredCount === ejercicioActual.preguntas.length;

    // Presentación: párrafos del texto y estimación de lectura
    const parrafos = String(ejercicioActual.texto || '').split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const palabras = String(ejercicioActual.texto || '').trim().split(/\s+/).filter(Boolean).length;
    const minutos = Math.max(1, Math.round(palabras / 130));

    const step = mode === 'lectura' ? 0 : mode === 'preguntas' ? 1 : 2;
    const steps = [
        { icon: isOral ? Headphones : BookOpen, label: isOral ? 'Escucha' : 'Lee' },
        { icon: ListChecks, label: 'Responde' },
        { icon: Award, label: 'Tu nota' },
    ];

    const audioState = isSpeaking ? (isPaused ? 'paused' : 'playing') : 'idle';

    return (
        <GameShell {...shell} className={cx('cmp', `cmp--${tipo}`)}>
            <GameHeader
                mode="exam"
                onHelp={() => setShowHelp(true)}
                onStudy={() => setShowMaterial(true)}
                right={
                    <Hud>
                        <HudStat icon={FileText} tone="progress" value={`${currentIndex + 1}/${data.length}`} label="Historia" />
                        {mode === 'preguntas' && (
                            <HudStat icon={ListChecks} tone="accent" value={`${answeredCount}/${totalPreguntas}`} label="Respondidas" />
                        )}
                    </Hud>
                }
            />

            {/* Pasos: leer/escuchar → responder → nota */}
            <ol className="cmp-steps" aria-label="Progreso">
                {steps.map((s, i) => (
                    <li key={s.label} className={cx('cmp-step', i === step && 'is-current', i < step && 'is-done')}>
                        <span className="cmp-step__dot"><s.icon size={16} /></span>
                        <span className="cmp-step__label">{s.label}</span>
                    </li>
                ))}
            </ol>

            <div className={cx('cmp-stage', `cmp-anim--${animacionFase}`, `cmp-font--${currentFontStyle}`)}>
                {/* ───────── Lectura / escucha ───────── */}
                {mode === 'lectura' && (
                    <>
                        {!isOral && (
                            <div className="cmp-tools" role="group" aria-label="Opciones de lectura">
                                <div className="cmp-tool">
                                    <span className="cmp-tool__label">Letra</span>
                                    <Segmented
                                        size="sm"
                                        value={fontStyleIndex}
                                        onChange={setFontStyleIndex}
                                        options={[
                                            { value: 0, label: 'Imprenta', icon: Type },
                                            { value: 1, label: 'Ligada', icon: PenLine },
                                            { value: 2, label: 'Mayúsculas', icon: CaseUpper },
                                        ]}
                                    />
                                </div>
                                <div className="cmp-tool">
                                    <span className="cmp-tool__label">Tamaño</span>
                                    <div className="cmp-size">
                                        <button type="button" className="cmp-size__btn" onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))} disabled={fontSizeIndex === 0} aria-label="Letra más pequeña">
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <span className="cmp-size__dots" aria-label={`Tamaño ${fontSizeIndex + 1} de ${sizeClasses.length}`}>
                                            {sizeClasses.map((c, i) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    className={cx('cmp-size__dot', i <= fontSizeIndex && 'is-on')}
                                                    style={{ '--h': `${8 + i * 4}px` }}
                                                    onClick={() => setFontSizeIndex(i)}
                                                    aria-label={`Tamaño ${i + 1}`}
                                                />
                                            ))}
                                        </span>
                                        <button type="button" className="cmp-size__btn" onClick={() => setFontSizeIndex((i) => Math.min(sizeClasses.length - 1, i + 1))} disabled={fontSizeIndex === sizeClasses.length - 1} aria-label="Letra más grande">
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                                <label className="cmp-tool cmp-switch">
                                    <input type="checkbox" checked={showRuler} onChange={(e) => setShowRuler(e.target.checked)} />
                                    <span className="cmp-switch__track" aria-hidden="true"><span className="cmp-switch__thumb" /></span>
                                    <span className="cmp-switch__text"><Ruler size={15} /> Guía de lectura</span>
                                </label>
                            </div>
                        )}

                        {!isOral ? (
                            <article className="cmp-paper">
                                <span className="cmp-paper__ribbon" aria-hidden="true" />
                                <div className="cmp-paper__inner">
                                <header className="cmp-paper__head">
                                    <span className="cmp-paper__kicker"><BookOpen size={14} /> Lectura · {palabras} palabras · ~{minutos} min</span>
                                    <h2 className="cmp-paper__title">{ejercicioActual.titulo}</h2>
                                </header>
                                <div
                                    className={cx('cmp-reading', showRuler && 'has-ruler')}
                                    ref={textRef}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={() => setRulerY(-1000)}
                                >
                                    {showRuler && (
                                        <div
                                            className={cx('cmp-ruler', `cmp-${currentSizeClass}`)}
                                            style={{ transform: `translateY(${rulerY}px) translateY(-50%)` }}
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div className={cx('cmp-reading__text', `cmp-${currentSizeClass}`)}>
                                        {parrafos.map((p, i) => <p key={i}>{p}</p>)}
                                    </div>
                                </div>
                                </div>
                            </article>
                        ) : (
                            <Panel variant="screen" className={cx('cmp-player', `is-${audioState}`)}>
                                <div className="cmp-player__top">
                                    <span className="cmp-player__kicker"><Headphones size={14} /> Escucha atentamente</span>
                                    <h2 className="cmp-player__title">{ejercicioActual.titulo}</h2>
                                </div>

                                <div className="cmp-player__deck">
                                    <span className="cmp-player__wave cmp-player__wave--l" aria-hidden="true">
                                        {Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleAudio}
                                        className="cmp-player__play"
                                        aria-label={audioState === 'playing' ? 'Pausar' : audioState === 'paused' ? 'Continuar' : 'Escuchar historia'}
                                    >
                                        <span className="cmp-player__ring" aria-hidden="true" />
                                        {audioState === 'playing' ? <Pause size={46} fill="currentColor" /> : <Play size={46} fill="currentColor" className="cmp-player__playicon" />}
                                    </button>
                                    <span className="cmp-player__wave cmp-player__wave--r" aria-hidden="true">
                                        {Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
                                    </span>
                                </div>

                                <p className="cmp-player__status" aria-live="polite">
                                    {audioState === 'playing' ? 'Escuchando la historia…' : audioState === 'paused' ? 'En pausa · pulsa para continuar' : 'Pulsa para escuchar la historia'}
                                </p>

                                <div className="cmp-player__controls">
                                    <div className="cmp-player__speed">
                                        <span className="cmp-player__speedlabel"><Gauge size={15} /> Velocidad</span>
                                        <Segmented
                                            size="sm"
                                            value={speechRate}
                                            onChange={handleSpeedChange}
                                            options={[
                                                { value: 0.5, label: 'Lenta', icon: Turtle },
                                                { value: 1, label: 'Normal' },
                                                { value: 1.5, label: 'Rápida', icon: Rabbit },
                                            ]}
                                        />
                                    </div>
                                    {isSpeaking && (
                                        <GameButton variant="ghost" size="sm" icon={RotateCcw} onClick={leerTexto} className="cmp-player__restart">
                                            Desde el principio
                                        </GameButton>
                                    )}
                                </div>
                            </Panel>
                        )}

                        <div className="cmp-actions">
                            <GameButton variant="soft" icon={RefreshCw} onClick={siguienteEjercicio}>Otra historia</GameButton>
                            <GameButton size="lg" iconRight={ArrowRight} onClick={iniciarTest}>Ir a las preguntas</GameButton>
                        </div>
                    </>
                )}

                {/* ───────── Preguntas ───────── */}
                {mode === 'preguntas' && (
                    <div className="cmp-questions">
                        <div className="cmp-questions__intro">
                            <span className="cmp-questions__story"><FileText size={15} /> {ejercicioActual.titulo}</span>
                        </div>
                        {ejercicioActual.preguntas.map((item, idx) => {
                            const shortOpts = item.opciones.every((o) => String(o).length <= 38);
                            return (
                                <Panel
                                    key={idx}
                                    variant="surface"
                                    className={cx('cmp-q', respuestas[idx] !== undefined && 'is-answered')}
                                    style={{ animationDelay: `${idx * 0.07}s` }}
                                >
                                    <div className="cmp-q__head">
                                        <span className="cmp-q__num">{idx + 1}</span>
                                        <span className="cmp-q__count">Pregunta {idx + 1} de {totalPreguntas}</span>
                                    </div>
                                    <p className="cmp-q__text">{item.pregunta}</p>
                                    <div className={cx('cmp-q__opts', shortOpts && item.opciones.length > 1 && 'is-grid')}>
                                        {item.opciones.map((opcion, optIdx) => (
                                            <AnswerOption
                                                key={optIdx}
                                                letter={LETTERS[optIdx]}
                                                state={respuestas[idx] === optIdx ? 'selected' : 'idle'}
                                                className="cmp-q__opt"
                                                aria-pressed={respuestas[idx] === optIdx}
                                                onClick={() => responder(idx, optIdx)}
                                            >
                                                {opcion}
                                            </AnswerOption>
                                        ))}
                                    </div>
                                </Panel>
                            );
                        })}

                        <div className="cmp-submit">
                            <div className="cmp-submit__progress">
                                <span className="cmp-submit__label">
                                    {allAnswered ? '¡Todo respondido! Ya puedes corregir.' : `Respondidas ${answeredCount} de ${totalPreguntas}`}
                                </span>
                                <ProgressBar value={answeredCount} max={totalPreguntas} tone={allAnswered ? 'good' : 'accent'} />
                            </div>
                            <GameButton
                                size="lg"
                                variant={allAnswered ? 'success' : 'primary'}
                                icon={Award}
                                onClick={finalizar}
                                disabled={!allAnswered}
                                className={allAnswered ? 'gk-anim-pop' : ''}
                            >
                                Corregir
                            </GameButton>
                        </div>
                    </div>
                )}

                {/* ───────── Resultado ───────── */}
                {mode === 'resultado' && (
                    <ResultsScreen
                        title="¡Historia completada!"
                        subtitle={ejercicioActual.titulo}
                        nota={nota}
                        points={totalPoints}
                        stats={[
                            { icon: Target, tone: 'good', label: 'Aciertos', value: `${score}/${totalPreguntas}` },
                            readingTime > 0 && { icon: isOral ? Headphones : BookOpen, tone: 'time', label: isOral ? 'Escucha' : 'Lectura', value: formatTime(readingTime) },
                            answersTime > 0 && { icon: Timer, tone: 'accent', label: 'Respuestas', value: formatTime(answersTime) },
                        ].filter(Boolean)}
                        actions={[{ label: 'Siguiente historia', onClick: siguienteEjercicio, icon: ArrowRight }]}
                    >
                        <button
                            type="button"
                            className={cx('cmp-review-toggle', showReview && 'is-open')}
                            onClick={() => setShowReview(!showReview)}
                            aria-expanded={showReview}
                        >
                            <ListChecks size={16} />
                            {showReview ? 'Ocultar corrección' : 'Ver corrección'}
                            <ChevronDown size={16} className="cmp-review-toggle__chev" />
                        </button>
                        {showReview && ejercicioActual.preguntas.map((pregunta, idx) => {
                            const esCorrecta = respuestas[idx] === pregunta.correcta;
                            return (
                                <FeedbackItem key={idx} index={idx + 1} ok={esCorrecta} title={pregunta.pregunta}>
                                    <span className="cmp-fb">
                                        <span className={cx('cmp-fb__ans', esCorrecta ? 'is-ok' : 'is-ko')}>
                                            <small>Tú</small> {pregunta.opciones[respuestas[idx]]}
                                        </span>
                                        {!esCorrecta && (
                                            <span className="cmp-fb__ans is-right">
                                                <small>Correcta</small> {pregunta.opciones[pregunta.correcta]}
                                            </span>
                                        )}
                                    </span>
                                </FeedbackItem>
                            );
                        })}
                    </ResultsScreen>
                )}
            </div>

            {/* ───────── Material de estudio ───────── */}
            <AnimatePresence>
                {showMaterial && (
                    <motion.div
                        key="material"
                        className="cmp-overlay"
                        onClick={() => setShowMaterial(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="cmp-library"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Material de estudio"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 26, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        >
                            <aside className="cmp-library__side">
                                <div className="cmp-library__sidehead">
                                    <span className="cmp-library__icon"><BookOpen size={20} /></span>
                                    <div>
                                        <strong>Historias</strong>
                                        <span>{data.length} ejercicios disponibles</span>
                                    </div>
                                </div>
                                <nav className="cmp-library__nav">
                                    {data.map((historia, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={cx('cmp-library__link', selectedMaterialIndex === index && 'is-active')}
                                            onClick={() => setSelectedMaterialIndex(index)}
                                        >
                                            <span className="cmp-library__num">{index + 1}</span>
                                            <span className="cmp-library__name">{historia.titulo}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            <main className="cmp-library__view">
                                <header className="cmp-library__head">
                                    <div>
                                        <span className="cmp-library__eyebrow">Material de estudio</span>
                                        <h2>{data[selectedMaterialIndex].titulo}</h2>
                                    </div>
                                    <button type="button" className="cmp-close" onClick={() => setShowMaterial(false)} aria-label="Cerrar material de estudio">
                                        <X size={18} />
                                    </button>
                                </header>

                                <div className="cmp-library__body">
                                    <section className="cmp-library__section">
                                        <h3><BookOpen size={16} /> Texto completo</h3>
                                        <div className="cmp-library__text">
                                            {String(data[selectedMaterialIndex].texto || '').split(/\n\s*\n/).filter((p) => p.trim()).map((p, i) => <p key={i}>{p}</p>)}
                                        </div>
                                    </section>

                                    <section className="cmp-library__section">
                                        <h3><Target size={16} /> Objetivos de comprensión</h3>
                                        <div className="cmp-library__qs">
                                            {data[selectedMaterialIndex].preguntas.map((q, idx) => (
                                                <div key={idx} className="cmp-library__q">
                                                    <span className="cmp-library__qnum">{idx + 1}</span>
                                                    <p>{q.pregunta}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </main>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {instructions}
        </GameShell>
    );
};

export default ComprensionJuego;
