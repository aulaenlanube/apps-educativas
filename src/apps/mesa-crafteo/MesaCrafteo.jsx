// src/apps/mesa-crafteo/MesaCrafteo.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FAMILIES } from '../_shared/QuimicaHelpers';
import PeriodicTableModal from '../_shared/PeriodicTableModal';
import TutorialModal from './TutorialModal';
import { molecules } from './craftingRecipes';
import MoleculeBuilder3D from './MoleculeBuilder3D';
import {
    ELEMENT_VALENCES,
    BOND_LENGTH,
    createInitialPorts,
    getPortPositions,
    orientPortsToIncoming,
    moleculesMatch,
    layoutMoleculeFromGraph
} from './atomConfig';
import AppOrientationWarning from '../_shared/AppOrientationWarning';
import './MesaCrafteo.css';

const STORAGE_KEY = 'mesa_crafteo_discoveries';

function getElementCounts(atoms) {
    const counts = {};
    atoms.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
}

const MesaCrafteo = ({ grade = 1, corso: corsoProp }) => {
    const cursoActual = corsoProp || grade;

    const [placedAtoms, setPlacedAtoms] = useState([]);
    const [builtBonds, setBuiltBonds] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [discoveries, setDiscoveries] = useState(new Set());
    const [result, setResult] = useState(null);
    const [isFusing, setIsFusing] = useState(false);
    const [showFormula, setShowFormula] = useState(false);
    const [showPeriodicTable, setShowPeriodicTable] = useState(false);
    const [showRecipes, setShowRecipes] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [elementsData, setElementsData] = useState([]);
    const [currentTarget, setCurrentTarget] = useState(null);
    const [hoveredInventoryItem, setHoveredInventoryItem] = useState(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Exam State
    // Exam State
    const [isExamMode, setIsExamMode] = useState(false);
    const [examQuestions, setExamQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [examScore, setExamScore] = useState(0);
    const [examResultsData, setExamResultsData] = useState([]); // Stores { question, correct }
    const [showExamResults, setShowExamResults] = useState(false);
    const [showDifficultySelector, setShowDifficultySelector] = useState(false);



    const availableMolecules = useMemo(() => {
        const gradeLevel = parseInt(cursoActual);
        return molecules.filter(m => m.grade <= gradeLevel);
    }, [cursoActual]);

    useEffect(() => {
        fetch('/data/quimica/elementos_info.json')
            .then(res => res.json())
            .then(data => setElementsData(data.elements))
            .catch(err => console.error("Error cargando elementos:", err));
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setDiscoveries(new Set(JSON.parse(saved)));
    }, []);


    useEffect(() => {
        // Lock body scroll for immersive full-screen experience
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    useEffect(() => {
        if (availableMolecules.length > 0 && !currentTarget) {
            setCurrentTarget(availableMolecules[Math.floor(Math.random() * availableMolecules.length)]);
        }
    }, [currentTarget, availableMolecules]);

    useEffect(() => {
        const isAnyModalOpen = showRecipes || showPeriodicTable || !!result || !!errorModal;
        document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showRecipes, showPeriodicTable, result, errorModal]);

    // --- ACCIONES ---

    const selectNextTarget = useCallback(() => {
        if (isExamMode) {
            // In exam mode, move to next question or finish
            if (currentQuestionIndex < examQuestions.length - 1) {
                const nextIdx = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIdx);
                setCurrentTarget(examQuestions[nextIdx]);
                setPlacedAtoms([]);
                setBuiltBonds([]);
                setShowFormula(false);
            } else {
                // Finish exam
                setShowExamResults(true);
            }
        } else {
            // Normal mode
            setIsShuffling(true);
            setTimeout(() => setIsShuffling(false), 600);
            let next;
            do {
                next = availableMolecules[Math.floor(Math.random() * availableMolecules.length)];
            } while (next === currentTarget && availableMolecules.length > 1);
            setCurrentTarget(next);
            setPlacedAtoms([]);
            setBuiltBonds([]);
            setShowFormula(false);
        }
    }, [availableMolecules, currentTarget, isExamMode, examQuestions, currentQuestionIndex]);

    const startExam = useCallback((numQuestions = 5) => {
        // Shuffle and pick N unique questions
        const shuffled = [...availableMolecules].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

        setExamQuestions(selected);
        setCurrentQuestionIndex(0);
        setExamScore(0);
        setExamResultsData([]);
        setIsExamMode(true);
        setCurrentTarget(selected[0]);
        setPlacedAtoms([]);
        setBuiltBonds([]);
        setShowFormula(false);
        setShowExamResults(false);
        setShowDifficultySelector(false); // Close selector
        setResult(null);
    }, [availableMolecules]);

    const exitExamMode = useCallback(() => {
        setIsExamMode(false);
        setExamQuestions([]);
        setCurrentQuestionIndex(0);
        setExamScore(0);
        setShowExamResults(false);
        selectNextTarget(); // Go back to random
    }, [selectNextTarget]);

    const handleClear = useCallback(() => {
        setPlacedAtoms([]);
        setBuiltBonds([]);
    }, []);

    const handleEmptyClick = useCallback((position) => {
        if (!selectedElement || placedAtoms.length > 0) return;
        const valence = ELEMENT_VALENCES[selectedElement.symbol] || 1;
        const ports = createInitialPorts(valence);
        setPlacedAtoms([{
            element: selectedElement.symbol,
            elementData: selectedElement,
            position,
            ports
        }]);
    }, [selectedElement, placedAtoms.length]);

    const handlePortClick = useCallback((atomIndex, portIndex) => {
        if (!selectedElement) return;
        const parentAtom = placedAtoms[atomIndex];
        const port = parentAtom.ports[portIndex];
        if (port.occupied) return;
        const dir = port.direction;
        const newPos = [
            parentAtom.position[0] + dir[0] * BOND_LENGTH,
            parentAtom.position[1] + dir[1] * BOND_LENGTH,
            parentAtom.position[2] + dir[2] * BOND_LENGTH,
        ];
        const valence = ELEMENT_VALENCES[selectedElement.symbol] || 1;
        const defaultDirs = getPortPositions(valence);
        const incomingDir = [-dir[0], -dir[1], -dir[2]];
        const newAtomIndex = placedAtoms.length;
        const orientedPorts = orientPortsToIncoming(defaultDirs, incomingDir, atomIndex);
        const newAtom = {
            element: selectedElement.symbol,
            elementData: selectedElement,
            position: newPos,
            ports: orientedPorts
        };
        const updatedAtoms = placedAtoms.map((atom, i) => {
            if (i !== atomIndex) return atom;
            return {
                ...atom,
                ports: atom.ports.map((p, pi) =>
                    pi === portIndex ? { ...p, occupied: true, connectedTo: newAtomIndex } : p
                )
            };
        });
        updatedAtoms.push(newAtom);
        setPlacedAtoms(updatedAtoms);
        setBuiltBonds(prev => [...prev, [atomIndex, newAtomIndex]]);
    }, [selectedElement, placedAtoms]);

    const handleUndo = useCallback(() => {
        if (placedAtoms.length <= 1) { handleClear(); return; }
        const lastIdx = placedAtoms.length - 1;
        const bondToRemove = builtBonds.find(([a, b]) => a === lastIdx || b === lastIdx);
        if (!bondToRemove) { handleClear(); return; }
        const parentIdx = bondToRemove[0] === lastIdx ? bondToRemove[1] : bondToRemove[0];
        const updatedAtoms = placedAtoms.slice(0, -1).map((atom, i) => {
            if (i !== parentIdx) return atom;
            return {
                ...atom,
                ports: atom.ports.map(p =>
                    p.connectedTo === lastIdx ? { ...p, occupied: false, connectedTo: null } : p
                )
            };
        });
        setPlacedAtoms(updatedAtoms);
        setBuiltBonds(prev => prev.filter(b => b !== bondToRemove));
    }, [placedAtoms, builtBonds, handleClear]);

    const handleShowSolution = useCallback(() => {
        if (!currentTarget || elementsData.length === 0) return;
        const { placedAtoms: solAtoms, bonds: solBonds } = layoutMoleculeFromGraph(
            currentTarget.atoms, currentTarget.bonds, elementsData
        );
        setPlacedAtoms(solAtoms);
        setBuiltBonds(solBonds);
    }, [currentTarget, elementsData]);

    const checkRecipe = useCallback(() => {
        setIsFusing(true);
        setTimeout(() => {
            const userAtoms = placedAtoms.map(a => a.element);
            const match = moleculesMatch(userAtoms, builtBonds, currentTarget.atoms, currentTarget.bonds);

            if (isExamMode) {
                // EXAM MODE: No immediate feedback, just record and move on
                const isCorrect = match;
                if (isCorrect) {
                    setExamScore(prev => prev + 1);
                }

                setExamResultsData(prev => [...prev, {
                    question: currentTarget,
                    correct: isCorrect
                }]);

                // Move to next or finish
                selectNextTarget();
            } else {
                // Normal mode
                if (match) {
                    setResult(currentTarget);
                    setDiscoveries(prev => {
                        const next = new Set(prev).add(currentTarget.name);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
                        return next;
                    });
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#59b33a', '#ffffff', '#3c8527'] });
                } else {
                    setErrorModal(`ESTRUCTURA INCORRECTA: La molécula construida no coincide con ${currentTarget.name}. Revisa los átomos y sus conexiones.`);
                }
            }
            setIsFusing(false);
        }, 800);
    }, [placedAtoms, builtBonds, currentTarget, isExamMode, selectNextTarget]);

    const gradeLabel = `${cursoActual}º ESO`;
    const placedCounts = useMemo(() => getElementCounts(placedAtoms.map(a => a.element)), [placedAtoms]);
    const targetCounts = useMemo(() => currentTarget ? getElementCounts(currentTarget.atoms) : [], [currentTarget]);

    return (
        <div className="mc-app full-screen">
            <AppOrientationWarning />
            {/* ===== FONDO / VIEWPORT 3D ===== */}
            <section className="mc-viewport-full">
                <MoleculeBuilder3D
                    placedAtoms={placedAtoms}
                    bonds={builtBonds}
                    selectedElement={selectedElement}
                    onPortClick={handlePortClick}
                    onEmptyClick={handleEmptyClick}
                />
            </section>

            {/* ===== UI FLOTANTE ===== */}
            <div className="mc-ui-overlay">
                {/* Botón de Ayuda Superior */}
                <motion.div
                    className={`mc-top-help-container ${showFormula ? 'is-expanded' : ''}`}
                >
                    <div className="mc-help-clickable-area" onClick={() => setShowTutorial(true)} title="Instrucciones">
                        <span className="mc-help-icon">❓</span>
                        <span className="mc-help-text">Ayuda</span>
                    </div>

                    <AnimatePresence>
                        {showFormula && currentTarget && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                                className="mc-top-formula-section"
                            >
                                <div className="mc-formula-divider"></div>
                                <div className="mc-formula-reveal-header">FÓRMULA REVELADA</div>
                                <div className="mc-formula-main-text">{currentTarget.formula}</div>
                                <div className="mc-formula-badges-row">
                                    {targetCounts.map(([sym, count]) => (
                                        <span key={sym} className="mc-mini-badge"
                                            style={{ backgroundColor: FAMILIES[elementsData.find(e => e.symbol === sym)?.category]?.color || '#666' }}>
                                            {sym}<sub>{count}</sub>
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                {/* --- Lado Izquierdo Superior: Título/Misión (Eliminado) --- */}

                {/* --- Lado Derecho: Misión e Inventario --- */}
                <aside className="mc-floating-sidebar">
                    {currentTarget && (
                        <div className="mc-panel mc-panel-mission">
                            <div className="mc-mission-top-actions">
                                <button className="mc-action-btn full-width" onClick={() => setShowRecipes(true)} disabled={isExamMode} style={{ opacity: isExamMode ? 0.5 : 1 }}>
                                    <span className="mc-btn-icon">📖</span>
                                    <span className="mc-btn-label">Recetario</span>
                                </button>
                                <button className="mc-action-btn full-width" onClick={() => setShowPeriodicTable(true)} disabled={isExamMode} style={{ opacity: isExamMode ? 0.5 : 1 }}>
                                    <span className="mc-btn-icon">📊</span>
                                    <span className="mc-btn-label">Tabla</span>
                                </button>
                                {!isExamMode ? (
                                    <button className="mc-action-btn full-width exam-mode-btn" onClick={() => setShowDifficultySelector(true)} style={{ borderColor: '#818cf8' }}>
                                        <span className="mc-btn-icon">📝</span>
                                        <span className="mc-btn-label">Examen</span>
                                    </button>
                                ) : (
                                    <button className="mc-action-btn full-width" onClick={exitExamMode} style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                        <span className="mc-btn-icon">✖️</span>
                                        <span className="mc-btn-label">Salir</span>
                                    </button>
                                )}
                            </div>

                            {isExamMode && (
                                <div className="mc-exam-progress">
                                    <span className="mc-exam-badge">MODO EXAMEN</span>
                                    <span className="mc-exam-count">Pregunta {currentQuestionIndex + 1} de {examQuestions.length}</span>
                                </div>
                            )}

                            <div className="mc-mission-divider"></div>

                            <div className="mc-mission-header-row">
                                <span className="mc-mission-tag">{isExamMode ? 'CONSTRUYE LA MOLÉCULA' : 'OBJETIVO ACTUAL'}</span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTarget.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="mc-mission-body-v2"
                                >
                                    <h2 className="mc-mission-name-v2">{currentTarget.name}</h2>
                                    {!isExamMode && (
                                        <button className="mc-next-btn highlight-btn" onClick={selectNextTarget}>
                                            <motion.span animate={{ rotate: isShuffling ? 360 : 0 }}>🎲</motion.span>
                                            Siguiente Molécula
                                        </button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="mc-panel mc-panel-elements">
                        <div className="mc-panel-header">
                            <span className="mc-panel-title">ELEMENTOS</span>
                            {hoveredInventoryItem && (
                                <motion.span
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mc-element-hover-name"
                                    style={{ color: FAMILIES[hoveredInventoryItem.category]?.color }}
                                >
                                    {hoveredInventoryItem.name}
                                </motion.span>
                            )}
                        </div>
                        <div className="mc-elements-grid-v2">
                            {elementsData
                                .filter(e => e.atomicNumber <= 36 || [47, 53, 79, 82].includes(e.atomicNumber))
                                .slice(0, 40) // Ensure max 8x5 = 40 items if more exist, or just fits naturally
                                .map(el => (
                                    <div
                                        key={el.symbol}
                                        className={`mc-element-card ${selectedElement?.symbol === el.symbol ? 'is-active' : ''}`}
                                        onClick={() => setSelectedElement(el)}
                                        onMouseEnter={() => setHoveredInventoryItem(el)}
                                        onMouseLeave={() => setHoveredInventoryItem(null)}
                                        style={{ '--accent-color': FAMILIES[el.category]?.color || '#444' }}
                                    >
                                        <span className="mc-el-symbol">{el.symbol}</span>
                                        <span className="mc-el-number">{el.atomicNumber}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </aside>

                {/* --- Centro Inferior: Acciones --- */}
                <div className="mc-bottom-controls">
                    <div className="mc-actions-glass">
                        <div className="mc-btn-group">
                            {!isExamMode && (
                                <>
                                    <button className="mc-glass-btn hint" onClick={() => setShowFormula(true)} disabled={showFormula}>
                                        🔍 Revelar Fórmula
                                    </button>
                                    <button className="mc-glass-btn solution" onClick={handleShowSolution} disabled={elementsData.length === 0}>
                                        💡 Ver Solución
                                    </button>
                                </>
                            )}
                            {isExamMode && (
                                <div className="mc-exam-locked-msg">Sin Ayudas</div>
                            )}
                        </div>

                        <div className="mc-craft-container">
                            <button
                                className={`mc-main-craft-btn ${isFusing ? 'is-fusing' : ''}`}
                                disabled={placedAtoms.length === 0 || isFusing}
                                onClick={checkRecipe}
                            >
                                <span className="mc-craft-icon">{isFusing ? '⚡' : (isExamMode ? '📨' : '⚗️')}</span>
                                <span className="mc-craft-text">{isFusing ? 'PROCESANDO' : (isExamMode ? 'ENVIAR RESPUESTA' : 'CRAFTEAR')}</span>
                            </button>
                        </div>

                        <div className="mc-btn-group">
                            <button className="mc-glass-btn undo" onClick={handleUndo} disabled={placedAtoms.length === 0}>
                                ↩️ Deshacer
                            </button>
                            <button className="mc-glass-btn clear" onClick={handleClear} disabled={placedAtoms.length === 0}>
                                🗑️ Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Indicador de átomos puestos (flotante) */}
                {placedAtoms.length > 0 && (
                    <div className="mc-atom-status-hud">
                        <div className="mc-hud-title">COMPOSICIÓN ACTUAL</div>
                        <div className="mc-hud-list">
                            {placedCounts.map(([sym, count]) => (
                                <div key={sym} className="mc-hud-item"
                                    style={{ borderLeftColor: FAMILIES[elementsData.find(e => e.symbol === sym)?.category]?.color || '#666' }}>
                                    <span className="mc-hud-sym">{sym}</span>
                                    <span className="mc-hud-count">x{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MODALES ===== */}
            <AnimatePresence>
                {showRecipes && (
                    <div className="modal-overlay" onClick={() => setShowRecipes(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="periodic-table-modal recipe-book-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>TODAS LAS RECETAS ({gradeLabel})</h2>
                                <button className="btn-close" onClick={() => setShowRecipes(false)}>X</button>
                            </div>
                            <div className="recipes-grid-modern custom-scrollbar">
                                {availableMolecules.map((m, idx) => (
                                    <div key={idx} className="recipe-card-modern">
                                        <div className="recipe-card-header">
                                            <h3>{m.name}</h3>
                                            <span className="recipe-formula">{m.formula}</span>
                                        </div>
                                        <div className="recipe-composition">
                                            {getElementCounts(m.atoms).map(([symbol, count]) => (
                                                <span key={symbol} className="recipe-atom-badge"
                                                    style={{ backgroundColor: FAMILIES[elementsData.find(e => e.symbol === symbol)?.category]?.color || '#666' }}>
                                                    {symbol}{count > 1 ? ` x${count}` : ''}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="recipe-bond-info">
                                            {m.bonds.length} enlace{m.bonds.length !== 1 ? 's' : ''}
                                        </div>
                                        <p className="recipe-desc">{m.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPeriodicTable && (
                    <PeriodicTableModal elementsData={elementsData} onClose={() => setShowPeriodicTable(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {result && (
                    <div className="result-overlay">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="molecule-reveal-card">
                            {result.isExamFeedback ? (
                                <>
                                    <h2 className="molecule-title" style={{ color: '#4ade80' }}>¡CORRECTO!</h2>
                                    <div className="result-main-icon">✅</div>
                                    <p className="molecule-description">{result.feedbackMessage}</p>
                                    <button className="btn-alchemy" onClick={() => { setResult(null); selectNextTarget(); }}>
                                        {currentQuestionIndex < examQuestions.length - 1 ? 'SIGUIENTE PREGUNTA' : 'VER RESULTADOS'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2 className="molecule-title">SÍNTESIS EXITOSA</h2>
                                    <h3 className="molecule-subtitle">{result.name} ({result.formula})</h3>
                                    <div className="result-main-icon">🧪</div>
                                    <p className="molecule-description">{result.description}</p>
                                    <div className="fun-fact-box">
                                        <strong>DATO CIENTÍFICO:</strong> {result.funFact}
                                    </div>
                                    <button className="btn-alchemy" onClick={() => { setResult(null); selectNextTarget(); }}>SIGUIENTE MOLÉCULA</button>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {errorModal && (
                    <div className="result-overlay">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="molecule-reveal-card error-card">
                            <h2 className="molecule-title" style={{ color: '#ff0000' }}>FALLO DE FUSIÓN</h2>
                            <div className="result-main-icon">💥</div>
                            <p className="molecule-description">{errorModal}</p>
                            <button className="btn-alchemy" style={{ backgroundColor: '#8b0000' }} onClick={() => setErrorModal(null)}>
                                REPETIR
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDifficultySelector && (
                    <div className="result-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="molecule-reveal-card difficulty-card">
                            <h2 className="molecule-title">CONFIGURAR EXAMEN</h2>
                            <p className="molecule-description">Selecciona el nivel de dificultad:</p>

                            <div className="difficulty-options">
                                <button className="btn-alchemy diff-easy" onClick={() => startExam(4)}>
                                    <span className="diff-name">FÁCIL</span>
                                    <span className="diff-count">4 Preguntas</span>
                                </button>
                                <button className="btn-alchemy diff-med" onClick={() => startExam(6)}>
                                    <span className="diff-name">MEDIO</span>
                                    <span className="diff-count">6 Preguntas</span>
                                </button>
                                <button className="btn-alchemy diff-hard" onClick={() => startExam(10)}>
                                    <span className="diff-name">DIFÍCIL</span>
                                    <span className="diff-count">10 Preguntas</span>
                                </button>
                            </div>

                            <button className="btn-text-only" onClick={() => setShowDifficultySelector(false)}>CANCELAR</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showExamResults && (
                    <div className="result-overlay">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="molecule-reveal-card exam-results-card">
                            <h2 className="molecule-title">RESULTADOS FINALES</h2>

                            <div className="exam-final-score-lg">
                                <span className="score-val-lg">{((examScore / examQuestions.length) * 10).toFixed(1)}</span>
                                <span className="score-total-lg">/ 10</span>
                            </div>

                            <div className="exam-details-list custom-scrollbar">
                                {examResultsData.map((res, idx) => (
                                    <div key={idx} className={`exam-result-item ${res.correct ? 'correct' : 'incorrect'}`}>
                                        <div className="res-icon">{res.correct ? '✅' : '❌'}</div>
                                        <div className="res-info">
                                            <span className="res-name">{res.question.name}</span>
                                            {!res.correct && (
                                                <span className="res-solution">Solución: {res.question.formula} ({getElementCounts(res.question.atoms).map(([s, c]) => `${s}${c > 1 ? c : ''}`).join(' ')})</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="exam-actions-row">
                                <button className="btn-alchemy secondary" onClick={exitExamMode} style={{ background: '#cbd5e1', color: '#0f172a' }}>SALIR</button>
                                <button className="btn-alchemy" onClick={() => { setShowExamResults(false); setShowDifficultySelector(true); }}>NUEVO EXAMEN</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            </AnimatePresence>
        </div >
    );
};

export default MesaCrafteo;
