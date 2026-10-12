import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ListOrdered, Link2, Trophy, Check, Sun, CheckCheck, Clock, RefreshCw, Orbit } from 'lucide-react';
import { GameButton, ResultsScreen, FeedbackItem } from '../_shared/kit';
import { solarSystemData } from './model/solarSystemData';
import { aciertosOrden, resultadoDesafio } from './desafioScoring';
import './SolarSystemActivity.css';

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Planeta dibujado con CSS (esfera con luz, bandas o anillos según el cuerpo).
// Lo comparten el desafío y la interfaz del simulador (barra inferior, ficha).
export const PlanetOrb = ({ id, color, size = 24 }) => (
    <span className={`ss-orb ss-orb--${id}`} style={{ '--pc': color, '--s': `${size}px` }} aria-hidden="true">
        {(id === 'saturn' || id === 'uranus') && <span className="ss-orb__ring" />}
    </span>
);

const PHASES = [
    { n: 1, label: 'Ordena', Icon: ListOrdered },
    { n: 2, label: 'Relaciona', Icon: Link2 },
    { n: 3, label: '¡Misión!', Icon: Trophy },
];

// Fin de la actividad = las dos fases resueltas. Se registra UNA vez por desafío
// (onComplete → onGameComplete; single_mode: cuenta para la tarea) con la nota de
// lo acertado a la primera (ver desafioScoring.js). "Repetir desafío" vuelve a
// montar el componente (key en SistemaSolar): desafío nuevo = registro nuevo.
const SolarSystemActivity = ({ onClose, onComplete, onRestart }) => {
    const [phase, setPhase] = useState(1); // 1: Ordering, 2: Matching, 3: Success
    const [orderedPlanets, setOrderedPlanets] = useState([]);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [selectedConcept, setSelectedConcept] = useState(null);
    const [matches, setMatches] = useState({});
    const [isWrong, setIsWrong] = useState(false);
    const [summary, setSummary] = useState(null);

    // Puntuación: lo que se hace a la primera
    const startedAtRef = useRef(Date.now());
    const firstOrderRef = useRef(null);         // ids en la 1ª comprobación del orden
    const failedMatchRef = useRef(new Set());   // planetas con algún emparejamiento fallido
    const completedRef = useRef(false);

    // Filter planets (exclude sun for ordering if needed, but user said "order planets", usually 8)
    const planetsOnly = useMemo(() => solarSystemData.filter(p => p.type === 'planet'), []);

    // Correct order by distance
    const correctOrderIds = useMemo(() => planetsOnly.map(p => p.id), [planetsOnly]);

    // Characteristic associations - Pick a random hotspot for each planet
    const concepts = useMemo(() => {
        return planetsOnly.map(planet => {
            const hotspots = planet.advanced?.hotspots || [];
            const randomHotspot = hotspots.length > 0
                ? hotspots[Math.floor(Math.random() * hotspots.length)]
                : { title: planet.name, desc: "Característica de este cuerpo celeste." };
            return {
                id: planet.id,
                title: randomHotspot.title,
                desc: randomHotspot.desc
            };
        });
    }, [planetsOnly]);

    // Shuffle initially
    useEffect(() => {
        const shuffled = [...planetsOnly].sort(() => Math.random() - 0.5);
        setOrderedPlanets(shuffled);
    }, [planetsOnly]);

    const shuffledConcepts = useMemo(() => [...concepts].sort(() => Math.random() - 0.5), [concepts]);

    // Phase 1 Logic: Drag and Drop (Simple version using buttons to move)
    const movePlanet = (index, direction) => {
        const newOrder = [...orderedPlanets];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newOrder.length) return;

        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setOrderedPlanets(newOrder);
    };

    const checkOrder = () => {
        const currentIds = orderedPlanets.map(p => p.id);
        const isCorrect = JSON.stringify(currentIds) === JSON.stringify(correctOrderIds);
        if (firstOrderRef.current === null) firstOrderRef.current = currentIds;

        if (isCorrect) {
            setPhase(2);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 1000);
        }
    };

    // Phase 2 Logic: Matching
    useEffect(() => {
        if (selectedPlanet && selectedConcept) {
            if (selectedPlanet === selectedConcept) {
                setMatches(prev => ({ ...prev, [selectedPlanet]: true }));
                setSelectedPlanet(null);
                setSelectedConcept(null);
            } else {
                failedMatchRef.current.add(selectedPlanet);
                setIsWrong(true);
                setTimeout(() => {
                    setIsWrong(false);
                    setSelectedPlanet(null);
                    setSelectedConcept(null);
                }, 1000);
            }
        }
    }, [selectedPlanet, selectedConcept]);

    useEffect(() => {
        if (Object.keys(matches).length === planetsOnly.length && planetsOnly.length > 0) {
            setPhase(3);
            if (completedRef.current) return;
            completedRef.current = true;
            const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
            const firstOrder = firstOrderRef.current || [];
            const orderHits = aciertosOrden(firstOrder, correctOrderIds);
            const matchHits = planetsOnly.filter(p => !failedMatchRef.current.has(p.id)).length;
            const r = resultadoDesafio({ orderHits, matchHits, planets: planetsOnly.length, durationSeconds });
            setSummary({
                ...r,
                orderHits,
                matchHits,
                durationSeconds,
                orderOk: new Set(correctOrderIds.filter((id, i) => firstOrder[i] === id)),
                matchFailed: new Set(failedMatchRef.current),
            });
            onComplete?.({
                mode: 'practice',
                score: r.points,
                maxScore: r.maxScore,
                correctAnswers: r.correct,
                totalQuestions: r.total,
                durationSeconds,
                nota: r.nota,
            });
        }
    }, [matches, planetsOnly, correctOrderIds, onComplete]);

    return (
        <div className="ssa-overlay">
            {/* Campo de estrellas decorativo detrás del panel */}
            <div className="ssa-starfield" aria-hidden="true">
                {Array.from({ length: 18 }, (_, i) => (
                    <span key={i} style={{ left: `${(i * 47) % 96 + 2}%`, top: `${(i * 29) % 92 + 4}%`, animationDelay: `${(i % 6) * -0.7}s` }} />
                ))}
            </div>
            <motion.div
                className={`ssa-panel ${isWrong ? 'is-wrong gk-anim-shake' : ''}`}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            >
                <div className="ssa-head">
                    <span className="ssa-head__badge"><Trophy size={22} /></span>
                    <div className="ssa-head__text">
                        <h2>Desafío del Sistema Solar</h2>
                        <p>Fase {phase}: {phase === 1 ? 'Ordena los planetas por distancia al Sol' : phase === 2 ? 'Asocia cada planeta con su característica' : '¡Misión completada!'}</p>
                    </div>
                    <button type="button" className="gk-iconbtn" onClick={onClose} aria-label="Cerrar desafío" title="Cerrar">
                        <X size={18} />
                    </button>
                </div>

                <ol className="ssa-steps" aria-label="Fases">
                    {PHASES.map(({ n, label, Icon }) => (
                        <li key={n} className={`ssa-step ${phase > n ? 'is-done' : ''} ${phase === n ? 'is-current' : ''}`}>
                            <span className="ssa-step__dot">{phase > n ? <Check size={15} strokeWidth={3} /> : <Icon size={15} />}</span>
                            <span className="ssa-step__label">{label}</span>
                        </li>
                    ))}
                </ol>

                <div className="ssa-body">
                    {phase === 1 && (
                        <div className="ssa-order">
                            <div className="ssa-order__sun" aria-hidden="true">
                                <span className="ssa-order__sunball" />
                                <span className="ssa-order__sunlabel"><Sun size={13} /> Sol</span>
                            </div>
                            <div className="ssa-order__track">
                                {orderedPlanets.map((planet, index) => (
                                    <motion.div
                                        layout
                                        key={planet.id}
                                        className="ssa-card"
                                        style={{ '--pc': planet.color }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                    >
                                        <span className="ssa-card__pos">{index + 1}</span>
                                        <PlanetOrb id={planet.id} color={planet.color} size={46} />
                                        <span className="ssa-card__name">{planet.name}</span>
                                        <div className="ssa-card__ctrl">
                                            <button type="button" onClick={() => movePlanet(index, -1)} disabled={index === 0} aria-label={`Acercar ${planet.name} al Sol`}>
                                                <ChevronLeft size={16} strokeWidth={3} />
                                            </button>
                                            <button type="button" onClick={() => movePlanet(index, 1)} disabled={index === orderedPlanets.length - 1} aria-label={`Alejar ${planet.name} del Sol`}>
                                                <ChevronRight size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <p className="ssa-hint">Usa las flechas para mover cada planeta: el más cercano al Sol va a la izquierda.</p>
                        </div>
                    )}

                    {phase === 2 && (
                        <div className="ssa-match">
                            <div className="ssa-col">
                                <h3 className="ssa-col__head">Planetas</h3>
                                {planetsOnly.map(planet => (
                                    <button
                                        type="button"
                                        key={planet.id}
                                        className={`ssa-planet ${selectedPlanet === planet.id ? 'is-selected' : ''} ${matches[planet.id] ? 'is-matched' : ''}`}
                                        style={{ '--pc': planet.color }}
                                        onClick={() => !isWrong && !matches[planet.id] && setSelectedPlanet(planet.id)}
                                    >
                                        <PlanetOrb id={planet.id} color={planet.color} size={30} />
                                        <span>{planet.name}</span>
                                        {matches[planet.id] && <span className="ssa-tick"><Check size={13} strokeWidth={3.5} /></span>}
                                    </button>
                                ))}
                            </div>
                            <div className={`ssa-col ssa-col--concepts ${selectedPlanet ? 'is-ready' : ''}`}>
                                <h3 className="ssa-col__head">Características</h3>
                                {shuffledConcepts.map(concept => (
                                    <button
                                        type="button"
                                        key={concept.id}
                                        className={`gk-answer ssa-concept ${selectedConcept === concept.id ? 'is-selected' : ''} ${matches[concept.id] ? 'is-correct' : ''}`}
                                        onClick={() => !isWrong && !matches[concept.id] && setSelectedConcept(concept.id)}
                                    >
                                        <span className="gk-answer__text">
                                            <strong>{concept.title}</strong>
                                            <small>{concept.desc}</small>
                                        </span>
                                        {matches[concept.id] && <span className="gk-answer__mark"><Check size={18} strokeWidth={3} /></span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {phase === 3 && summary && (
                        <ResultsScreen
                            title="¡Desafío completado!"
                            subtitle="Cuenta lo que aciertas a la primera"
                            nota={summary.nota}
                            points={summary.points}
                            stats={[
                                { icon: ListOrdered, tone: 'good', label: 'Orden a la primera', value: `${summary.orderHits}/${planetsOnly.length}` },
                                { icon: Link2, tone: 'good', label: 'Parejas a la primera', value: `${summary.matchHits}/${planetsOnly.length}` },
                                { icon: Clock, tone: 'time', label: 'Tiempo', value: fmtTime(summary.durationSeconds) },
                            ]}
                            actions={[
                                { label: 'Repetir desafío', onClick: onRestart, icon: RefreshCw },
                                { label: 'Volver al simulador', onClick: onClose, icon: Orbit, variant: 'soft' },
                            ]}
                        >
                            {planetsOnly.map((planet, i) => {
                                const orderOk = summary.orderOk.has(planet.id);
                                const matchOk = !summary.matchFailed.has(planet.id);
                                const concept = concepts.find(c => c.id === planet.id);
                                return (
                                    <FeedbackItem key={planet.id} index={i + 1} ok={orderOk && matchOk} title={planet.name}>
                                        Orden: {orderOk ? 'en su sitio' : `iba en la posición ${i + 1}`} · Característica:{' '}
                                        <strong>{concept?.title}</strong> {matchOk ? '(a la primera)' : '(tras fallar)'}
                                    </FeedbackItem>
                                );
                            })}
                        </ResultsScreen>
                    )}
                </div>

                {phase < 3 && (
                    <div className="ssa-foot">
                        <AnimatePresence>
                            {isWrong && (
                                <motion.span
                                    className="ssa-wrong"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <X size={15} strokeWidth={3} /> {phase === 1 ? 'Aún no es el orden correcto' : 'Esa pareja no coincide'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <GameButton variant="soft" onClick={onClose}>Cancelar</GameButton>
                        {phase === 1 && (
                            <GameButton variant="primary" icon={CheckCheck} onClick={checkOrder}>Verificar orden</GameButton>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SolarSystemActivity;
