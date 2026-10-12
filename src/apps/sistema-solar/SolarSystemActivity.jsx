import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ListOrdered, Link2, Trophy, Check, Sun, CheckCheck } from 'lucide-react';
import { GameButton } from '../_shared/kit';
import { solarSystemData } from './model/solarSystemData';
import './SolarSystemActivity.css';

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

const SolarSystemActivity = ({ onClose }) => {
    const [phase, setPhase] = useState(1); // 1: Ordering, 2: Matching, 3: Success
    const [orderedPlanets, setOrderedPlanets] = useState([]);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [selectedConcept, setSelectedConcept] = useState(null);
    const [matches, setMatches] = useState({});
    const [isWrong, setIsWrong] = useState(false);

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
        }
    }, [matches, planetsOnly]);

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
                                        onClick={() => !matches[planet.id] && setSelectedPlanet(planet.id)}
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
                                        onClick={() => !matches[concept.id] && setSelectedConcept(concept.id)}
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

                    {phase === 3 && (
                        <div className="ssa-success">
                            <div className="ssa-trophy" aria-hidden="true">
                                <span className="ssa-rays" />
                                <span className="ssa-orbit" />
                                <span className="ssa-sparks">
                                    {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--ssa-n': i }} />)}
                                </span>
                                <TrophyArt />
                            </div>
                            <h3 className="ssa-success__title">¡Excelente astrónomo!</h3>
                            <p className="ssa-success__desc">
                                Has demostrado un conocimiento profundo del Sistema Solar.
                                Todos los planetas están en su lugar y sus secretos han sido revelados.
                            </p>
                            <div className="ssa-success__planets">
                                {planetsOnly.map((p) => <PlanetOrb key={p.id} id={p.id} color={p.color} size={26} />)}
                            </div>
                        </div>
                    )}
                </div>

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
                    {phase < 3 && (
                        <GameButton variant="soft" onClick={onClose}>Cancelar</GameButton>
                    )}
                    {phase === 1 && (
                        <GameButton variant="primary" icon={CheckCheck} onClick={checkOrder}>Verificar orden</GameButton>
                    )}
                    {phase === 3 && (
                        <GameButton variant="success" size="lg" onClick={onClose}>Volver al simulador</GameButton>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Trofeo con volumen (sin filtros SVG)
const TrophyArt = () => (
    <svg className="ssa-trophy__art" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
            <linearGradient id="ssa-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fef3c7" />
                <stop offset=".45" stopColor="#fbbf24" />
                <stop offset="1" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="ssa-base" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="1" stopColor="#312e81" />
            </linearGradient>
        </defs>
        <ellipse cx="50" cy="92" rx="26" ry="4" fill="#020617" opacity=".45" />
        <path d="M30 18 h40 v14 c0 14 -9 24 -20 24 s-20 -10 -20 -24 z" fill="url(#ssa-gold)" />
        <path d="M30 24 h-8 c0 10 5 16 12 18 M70 24 h8 c0 10 -5 16 -12 18" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <rect x="45" y="55" width="10" height="14" rx="3" fill="#d97706" />
        <rect x="34" y="68" width="32" height="8" rx="4" fill="url(#ssa-gold)" />
        <rect x="28" y="76" width="44" height="13" rx="4" fill="url(#ssa-base)" />
        <rect x="31" y="78" width="38" height="3" rx="1.5" fill="#fff" opacity=".25" />
        <path d="M36 22 v10 c0 6 3 11 7 14" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 28 l3 6 l6.5 1 l-4.7 4.6 l1.1 6.4 l-5.9 -3.1 l-5.9 3.1 l1.1 -6.4 l-4.7 -4.6 l6.5 -1 z" fill="#fff" opacity=".9" />
    </svg>
);

export default SolarSystemActivity;
