import React, { useState, useMemo, useEffect } from 'react';
import { solarSystemData } from './model/solarSystemData';
import './SolarSystemActivity.css';

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
        <div className="activity-modal-overlay">
            <div className={`activity-modal-content ${isWrong ? 'shake' : ''}`}>
                <div className="activity-header">
                    <div>
                        <h2>Desafío del Sistema Solar</h2>
                        <p>Fase {phase}: {phase === 1 ? 'Ordena los planetas por distancia al Sol' : phase === 2 ? 'Asocia cada planeta con su característica' : '¡Misión Completada!'}</p>
                    </div>
                    <button className="btn-close-activity" onClick={onClose}>&times;</button>
                </div>

                <div className="activity-body">
                    <div className="activity-steps">
                        <div className={`step-dot ${phase >= 1 ? 'completed' : ''} ${phase === 1 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${phase >= 2 ? 'completed' : ''} ${phase === 2 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${phase >= 3 ? 'completed' : ''} ${phase === 3 ? 'active' : ''}`}></div>
                    </div>

                    {phase === 1 && (
                        <div className="ordering-view">
                            <div className="ordering-grid">
                                {orderedPlanets.map((planet, index) => (
                                    <div key={planet.id} className="planet-item-card">
                                        <span className="planet-order-badge">#{index + 1}</span>
                                        <div
                                            className="planet-preview-dot"
                                            style={{ backgroundColor: planet.color, color: planet.color }}
                                        ></div>
                                        <span className="planet-item-name">{planet.name}</span>
                                        <div className="order-controls">
                                            <button onClick={() => movePlanet(index, -1)} disabled={index === 0}>←</button>
                                            <button onClick={() => movePlanet(index, 1)} disabled={index === orderedPlanets.length - 1}>→</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {phase === 2 && (
                        <div className="matching-view">
                            <div className="matching-container">
                                <div className="matching-column">
                                    <h3>Planetas</h3>
                                    {planetsOnly.map(planet => (
                                        <div
                                            key={planet.id}
                                            className={`matching-item ${selectedPlanet === planet.id ? 'selected' : ''} ${matches[planet.id] ? 'matched' : ''}`}
                                            onClick={() => !matches[planet.id] && setSelectedPlanet(planet.id)}
                                        >
                                            <div className="matching-circle" style={{ borderColor: planet.color }}></div>
                                            <span>{planet.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="matching-column">
                                    <h3>Características</h3>
                                    {shuffledConcepts.map(concept => (
                                        <div
                                            key={concept.id}
                                            className={`matching-item ${selectedConcept === concept.id ? 'selected' : ''} ${matches[concept.id] ? 'matched' : ''}`}
                                            onClick={() => !matches[concept.id] && setSelectedConcept(concept.id)}
                                        >
                                            <div className="matching-circle"></div>
                                            <div className="concept-text">
                                                <strong>{concept.title}</strong>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{concept.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {phase === 3 && (
                        <div className="activity-success">
                            <div className="success-icon">🏆</div>
                            <h3 className="success-title">¡Excelente Astrónomo!</h3>
                            <p className="success-desc">
                                Has demostrado un conocimiento profundo del Sistema Solar.
                                Todos los planetas están en su lugar y sus secretos han sido revelados.
                            </p>
                        </div>
                    )}
                </div>

                <div className="activity-footer">
                    {phase === 1 && (
                        <button className="btn-activity-primary" onClick={checkOrder}>Verificar Orden</button>
                    )}
                    {phase === 3 && (
                        <button className="btn-activity-primary" onClick={onClose}>Volver al Simulador</button>
                    )}
                    {phase < 3 && (
                        <button className="btn-activity-secondary" onClick={onClose}>Cancelar</button>
                    )}
                </div>
            </div>

            <style>{`
                .order-controls {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .order-controls button {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    border-radius: 4px;
                    padding: 4px 10px;
                    cursor: pointer;
                }
                .order-controls button:hover:not(:disabled) {
                    background: rgba(99, 102, 241, 0.3);
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .shake {
                    animation: shake 0.4s ease-in-out;
                    border-color: #ef4444 !important;
                }
            `}</style>
        </div>
    );
};

export default SolarSystemActivity;
