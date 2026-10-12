// src/apps/mesa-crafteo/MesaCrafteo.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FAMILIES } from '../_shared/QuimicaHelpers';
import { getAppContent } from '../../services/gameDataService';
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
import {
    FlaskConical, BookOpen, Grid3x3, GraduationCap, Dices, ScanSearch, Lightbulb, Undo2, Trash2,
    Atom, Send, X, LogOut, Clock, Target, RefreshCw, HelpCircle, Zap, Lock, Link2, Beaker, Gauge,
    ArrowRight, Sparkles,
} from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import {
    GameShell, GameButton, ModeSelect, ModeChip, ResultsScreen, FeedbackItem, ProgressDots,
    Hud, HudStat, useAppMeta, cleanAppName,
} from '../_shared/kit';
import { FlaskArt } from './CrafteoArt';
import './MesaCrafteo.css';

// --- Presentación (rediseño 2026) ---
const SHELL = { accent: '#818cf8', accent2: '#22d3ee' };
const DIFF_NAME = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
const DIFF_TONE = { easy: 'easy', medium: 'medium', hard: 'exam' };
const DIFF_ICON = { easy: Beaker, medium: FlaskConical, hard: Atom };
const fmtMult = (m) => `×${String(m).replace('.', ',')} puntos`;
const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };

const STORAGE_KEY = 'mesa_crafteo_discoveries';

// Configuracion del examen por dificultad.
// La nota del modo Medio es la base (/10). Facil resta 1 pt (max 9), Dificil
// suma hasta 1 pt (max 11). Los puntos, ademas, escalan con la dificultad.
const EXAM_DIFFICULTY = {
    easy:   { questions: 4,  gradeMax: 9,  scoreMult: 0.85, label: 'FÁCIL',   note: 'Nota máx 9 (–1 pt)' },
    medium: { questions: 6,  gradeMax: 10, scoreMult: 1.0,  label: 'MEDIO',   note: 'Nota sobre 10 (base)' },
    hard:   { questions: 10, gradeMax: 11, scoreMult: 1.25, label: 'DIFÍCIL', note: 'Nota hasta 11 (+1 pt)' },
};

// Puntuacion del examen: base por aciertos + bonus decreciente por tiempo,
// escalado por la proporcion de aciertos y por el multiplicador de dificultad.
// Dos alumnos con la misma nota pueden obtener puntuaciones distintas segun
// lo rapido que respondan y el nivel elegido.
const computeCrafteoScore = (correct, total, timeSec, difficulty) => {
    if (!correct || !total) return 0;
    const basePoints = correct * 100;                                 // 0..total*100
    const fastBonus  = Math.max(0, 400 - timeSec * 2);                // 0..400
    const longBonus  = Math.max(0, 300 - Math.floor(timeSec / 3));    // 0..300
    const perCorrect = correct / total;
    const timeBonus  = Math.round((fastBonus + longBonus) * perCorrect);
    const mult       = EXAM_DIFFICULTY[difficulty]?.scoreMult ?? 1.0;
    return Math.round((basePoints + timeBonus) * mult);
};

function getElementCounts(atoms) {
    const counts = {};
    atoms.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
}

const MesaCrafteo = ({ grade = 1, corso: corsoProp, onGameComplete }) => {
    const cursoActual = corsoProp || grade;

    const [placedAtoms, setPlacedAtoms] = useState([]);
    const [builtBonds, setBuiltBonds] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [, setDiscoveries] = useState(new Set());
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
    // Solo presentación: pantalla previa de modos (laboratorio libre / examen)
    const [started, setStarted] = useState(false);
    const meta = useAppMeta();

    // Exam State
    const [isExamMode, setIsExamMode] = useState(false);
    const [examQuestions, setExamQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [examScore, setExamScore] = useState(0);
    const [examResultsData, setExamResultsData] = useState([]); // Stores { question, correct }
    const [showExamResults, setShowExamResults] = useState(false);
    const [showDifficultySelector, setShowDifficultySelector] = useState(false);
    const [examDifficulty, setExamDifficulty] = useState('medium');
    const examStartTimeRef = useRef(0);
    const [examElapsedTime, setExamElapsedTime] = useState(0);
    const [examFinalTime, setExamFinalTime] = useState(0);
    const examTrackedRef = useRef(false);



    const availableMolecules = useMemo(() => {
        const gradeLevel = parseInt(cursoActual);
        return molecules.filter(m => m.grade <= gradeLevel);
    }, [cursoActual]);

    useEffect(() => {
        getAppContent('elementos-quimica')
            .then(data => {
                if (data && data.elements) setElementsData(data.elements);
            })
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
                // Finish exam: congelar tiempo total para puntuacion.
                const finalT = examStartTimeRef.current
                    ? Math.floor((Date.now() - examStartTimeRef.current) / 1000)
                    : 0;
                setExamFinalTime(finalT);
                setExamElapsedTime(finalT);
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

    const startExam = useCallback((difficulty = 'medium') => {
        const config = EXAM_DIFFICULTY[difficulty] || EXAM_DIFFICULTY.medium;
        // Shuffle and pick N unique questions
        const shuffled = [...availableMolecules].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(config.questions, shuffled.length));

        setExamDifficulty(difficulty);
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
        setShowDifficultySelector(false);
        setResult(null);
        examStartTimeRef.current = Date.now();
        setExamElapsedTime(0);
        setExamFinalTime(0);
        examTrackedRef.current = false;
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

    // Cronometro del examen: corre mientras el examen esta activo y no hay resultados.
    useEffect(() => {
        if (!isExamMode || showExamResults || !examStartTimeRef.current) return;
        const interval = setInterval(() => {
            setExamElapsedTime(Math.floor((Date.now() - examStartTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [isExamMode, showExamResults]);

    // Tracking hacia el sistema de ranking cuando el examen acaba (una sola vez).
    useEffect(() => {
        if (!showExamResults || examTrackedRef.current) return;
        examTrackedRef.current = true;
        const total = examQuestions.length;
        const points = computeCrafteoScore(examScore, total, examFinalTime, examDifficulty);
        onGameComplete?.({
            mode: 'test',
            score: points,
            maxScore: Math.round((total * 100 + 700) * (EXAM_DIFFICULTY[examDifficulty]?.scoreMult ?? 1.0)),
            correctAnswers: examScore,
            totalQuestions: total,
            durationSeconds: examFinalTime || undefined,
        });
    }, [showExamResults, examScore, examQuestions.length, examFinalTime, examDifficulty, onGameComplete]);

    const familyColor = (sym) => FAMILIES[elementsData.find(e => e.symbol === sym)?.category]?.color || '#94a3b8';
    const courseText = meta.level ? (meta.grade && meta.level !== 'ad' ? `${meta.grade}º ${LEVEL_LABEL[meta.level] || meta.level}` : (LEVEL_LABEL[meta.level] || meta.level)) : '';
    const inventory = elementsData
        .filter(e => e.atomicNumber <= 36 || [47, 53, 79, 82].includes(e.atomicNumber))
        .slice(0, 40); // máx. 8×5 = 40 elementos

    const overlayAnim = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
    };
    const panelAnim = {
        initial: { opacity: 0, y: 24, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: 'spring', stiffness: 260, damping: 24 },
    };

    return (
        <GameShell theme="dark" wide {...SHELL} className={`mc-shell ${isExamMode ? 'is-exam' : ''}`}>
            <AppOrientationWarning />

            {/* ===== LABORATORIO 3D (fondo) ===== */}
            <section className="mc-viewport-full">
                <MoleculeBuilder3D
                    placedAtoms={placedAtoms}
                    bonds={builtBonds}
                    selectedElement={selectedElement}
                    onPortClick={handlePortClick}
                    onEmptyClick={handleEmptyClick}
                />
            </section>

            {/* Capa decorativa sobre el 3D (no captura eventos) */}
            <div className="mc-fx-layer" aria-hidden="true">
                <span className="mc-fx-vignette" />
                <span className="mc-fx-grid" />
            </div>

            {started && (
                <>
                    {/* ===== BARRA SUPERIOR ===== */}
                    <header className="mc-topbar">
                        <div className="mc-topbar__id">
                            {meta.appId && hasAppIcon(meta.appId) && (
                                <span className="mc-topbar__icon"><AppIcon appId={meta.appId} size={38} /></span>
                            )}
                            <span className="mc-topbar__text">
                                <strong>{cleanAppName(meta.name) || 'Mesa de Crafteo'}</strong>
                                {courseText && <span>{courseText}</span>}
                            </span>
                        </div>
                        {isExamMode
                            ? <ModeChip mode="exam" label={`Examen · ${DIFF_NAME[examDifficulty] || ''}`} />
                            : <ModeChip mode="practice" label="Laboratorio" />}
                        {isExamMode && (
                            <Hud>
                                <HudStat icon={Target} tone="progress" value={`${currentQuestionIndex + 1}/${examQuestions.length}`} label="Pregunta" />
                                <HudStat icon={Clock} tone="time" value={`${examElapsedTime}s`} label="Tiempo" />
                            </Hud>
                        )}
                        <button type="button" className="gk-iconbtn" onClick={() => setShowTutorial(true)} title="Cómo se juega" aria-label="Cómo se juega">
                            <HelpCircle size={18} />
                        </button>
                    </header>

                    {/* ===== PANEL DERECHO: misión + inventario ===== */}
                    <aside className="mc-side">
                        {currentTarget && (
                            <div className="mc-card mc-mission">
                                <div className="mc-tools">
                                    <button type="button" className="mc-tool" onClick={() => setShowRecipes(true)} disabled={isExamMode}>
                                        <BookOpen size={18} /> <span>Recetario</span>
                                    </button>
                                    <button type="button" className="mc-tool" onClick={() => setShowPeriodicTable(true)} disabled={isExamMode}>
                                        <Grid3x3 size={18} /> <span>Tabla</span>
                                    </button>
                                    {!isExamMode ? (
                                        <button type="button" className="mc-tool mc-tool--exam" onClick={() => setShowDifficultySelector(true)}>
                                            <GraduationCap size={18} /> <span>Examen</span>
                                        </button>
                                    ) : (
                                        <button type="button" className="mc-tool mc-tool--exit" onClick={exitExamMode}>
                                            <LogOut size={18} /> <span>Salir</span>
                                        </button>
                                    )}
                                </div>

                                {isExamMode && (
                                    <div className="mc-mission__dots">
                                        <ProgressDots total={examQuestions.length} current={currentQuestionIndex} />
                                    </div>
                                )}

                                <span className="mc-kicker"><Target size={13} /> {isExamMode ? 'Construye la molécula' : 'Objetivo actual'}</span>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTarget.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="mc-mission__body"
                                    >
                                        <h2 className="mc-target">{currentTarget.name}</h2>
                                        <AnimatePresence>
                                            {showFormula && (
                                                <motion.div
                                                    className="mc-formula"
                                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.97 }}
                                                >
                                                    <span className="mc-formula__label"><ScanSearch size={13} /> Fórmula revelada</span>
                                                    <strong className="mc-formula__text">{currentTarget.formula}</strong>
                                                    <span className="mc-chips">
                                                        {targetCounts.map(([sym, count]) => (
                                                            <span key={sym} className="mc-atomchip" style={{ '--el': familyColor(sym) }}>
                                                                {sym}{count > 1 && <small>×{count}</small>}
                                                            </span>
                                                        ))}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {!isExamMode && (
                                            <button type="button" className="mc-next" onClick={selectNextTarget}>
                                                <motion.span className="mc-next__icon" animate={{ rotate: isShuffling ? 360 : 0 }}>
                                                    <Dices size={18} />
                                                </motion.span>
                                                Siguiente molécula
                                            </button>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="mc-card mc-inventory">
                            <div className="mc-inventory__head">
                                <span className="mc-kicker"><Atom size={13} /> Elementos</span>
                                {(hoveredInventoryItem || selectedElement) && (
                                    <span
                                        className="mc-inventory__name"
                                        style={{ '--el': FAMILIES[(hoveredInventoryItem || selectedElement).category]?.color || '#94a3b8' }}
                                    >
                                        {(hoveredInventoryItem || selectedElement).name}
                                    </span>
                                )}
                            </div>
                            <div className="mc-elements">
                                {inventory.map(el => (
                                    <button
                                        type="button"
                                        key={el.symbol}
                                        className={`mc-el ${selectedElement?.symbol === el.symbol ? 'is-active' : ''}`}
                                        onClick={() => setSelectedElement(el)}
                                        onMouseEnter={() => setHoveredInventoryItem(el)}
                                        onMouseLeave={() => setHoveredInventoryItem(null)}
                                        style={{ '--el': FAMILIES[el.category]?.color || '#94a3b8' }}
                                        aria-label={`${el.name} (${el.symbol})`}
                                        aria-pressed={selectedElement?.symbol === el.symbol}
                                    >
                                        <span className="mc-el__num">{el.atomicNumber}</span>
                                        <span className="mc-el__sym">{el.symbol}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ===== ACCIONES (abajo) ===== */}
                    <div className="mc-dock">
                        <div className="mc-dock__group">
                            {!isExamMode ? (
                                <>
                                    <button type="button" className="mc-action" onClick={() => setShowFormula(true)} disabled={showFormula} title="Revelar fórmula" aria-label="Revelar fórmula">
                                        <ScanSearch size={17} /> <span>Revelar fórmula</span>
                                    </button>
                                    <button type="button" className="mc-action" onClick={handleShowSolution} disabled={elementsData.length === 0} title="Ver solución" aria-label="Ver solución">
                                        <Lightbulb size={17} /> <span>Ver solución</span>
                                    </button>
                                </>
                            ) : (
                                <span className="mc-locked"><Lock size={15} /> Sin ayudas</span>
                            )}
                        </div>

                        <button
                            type="button"
                            className={`mc-craft ${isFusing ? 'is-fusing' : ''}`}
                            disabled={placedAtoms.length === 0 || isFusing}
                            onClick={checkRecipe}
                        >
                            <span className="mc-craft__shine" aria-hidden="true" />
                            <span className="mc-craft__icon">{isFusing ? <Zap size={22} /> : (isExamMode ? <Send size={21} /> : <FlaskConical size={22} />)}</span>
                            <span className="mc-craft__text">{isFusing ? 'Procesando…' : (isExamMode ? 'Enviar respuesta' : 'Craftear')}</span>
                        </button>

                        <div className="mc-dock__group">
                            <button type="button" className="mc-action" onClick={handleUndo} disabled={placedAtoms.length === 0} title="Deshacer" aria-label="Deshacer">
                                <Undo2 size={17} /> <span>Deshacer</span>
                            </button>
                            <button type="button" className="mc-action mc-action--danger" onClick={handleClear} disabled={placedAtoms.length === 0} title="Limpiar" aria-label="Limpiar">
                                <Trash2 size={17} /> <span>Limpiar</span>
                            </button>
                        </div>
                    </div>

                    {/* Composición de lo construido */}
                    <AnimatePresence>
                        {placedAtoms.length > 0 && (
                            <motion.div
                                className="mc-compo"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                            >
                                <span className="mc-kicker">Composición</span>
                                <div className="mc-compo__list">
                                    {placedCounts.map(([sym, count]) => (
                                        <span key={sym} className="mc-compo__item" style={{ '--el': familyColor(sym) }}>
                                            <b>{sym}</b><small>×{count}</small>
                                        </span>
                                    ))}
                                </div>
                                <span className="mc-compo__bonds"><Link2 size={13} /> {builtBonds.length} {builtBonds.length === 1 ? 'enlace' : 'enlaces'}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* ===== PANTALLA PREVIA: modo ===== */}
            {!started && !showDifficultySelector && (
                <div className="mc-overlay mc-overlay--start">
                    <motion.div className="mc-panel mc-panel--wide" {...panelAnim}>
                        <ModeSelect
                            modes={[
                                {
                                    id: 'lab', tone: 'easy', icon: FlaskConical, title: 'Laboratorio libre',
                                    desc: 'Construye moléculas conectando átomos en 3D, a tu ritmo.',
                                    features: ['Recetario y tabla periódica', 'Revelar fórmula y ver solución'],
                                    cta: 'Entrar al laboratorio',
                                },
                                {
                                    id: 'exam', tone: 'exam', title: 'Examen',
                                    desc: 'Construye las moléculas que te pidan, sin ayudas.',
                                    features: ['Nota sobre 10 (Fácil 9 · Difícil 11)', 'Puntos por rapidez'],
                                    cta: 'Elegir dificultad',
                                },
                            ]}
                            onSelect={(id) => (id === 'lab' ? setStarted(true) : setShowDifficultySelector(true))}
                            onHelp={() => setShowTutorial(true)}
                        />
                    </motion.div>
                </div>
            )}

            {/* ===== MODALES ===== */}
            <AnimatePresence>
                {showRecipes && (
                    <motion.div className="mc-overlay" {...overlayAnim} onClick={() => setShowRecipes(false)}>
                        <motion.div className="mc-panel mc-panel--wide" {...panelAnim} onClick={e => e.stopPropagation()}>
                            <div className="mc-panel__head">
                                <span className="mc-panel__badge"><BookOpen size={22} /></span>
                                <div>
                                    <h2>Recetario</h2>
                                    <p>{availableMolecules.length} moléculas · {gradeLabel}</p>
                                </div>
                                <button type="button" className="gk-iconbtn" onClick={() => setShowRecipes(false)} aria-label="Cerrar recetario"><X size={18} /></button>
                            </div>
                            <div className="mc-recipes">
                                {availableMolecules.map((m, idx) => (
                                    <article key={idx} className="mc-recipe">
                                        <header className="mc-recipe__head">
                                            <h3>{m.name}</h3>
                                            <span className="mc-formula-chip">{m.formula}</span>
                                        </header>
                                        <div className="mc-chips">
                                            {getElementCounts(m.atoms).map(([symbol, count]) => (
                                                <span key={symbol} className="mc-atomchip" style={{ '--el': familyColor(symbol) }}>
                                                    {symbol}{count > 1 && <small>×{count}</small>}
                                                </span>
                                            ))}
                                            <span className="mc-recipe__bonds"><Link2 size={12} /> {m.bonds.length} enlace{m.bonds.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <p>{m.description}</p>
                                    </article>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPeriodicTable && (
                    <PeriodicTableModal elementsData={elementsData} onClose={() => setShowPeriodicTable(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {result && (
                    <motion.div className="mc-overlay" {...overlayAnim}>
                        <motion.div className="mc-panel mc-result is-ok" {...panelAnim}>
                            <span className="mc-result__rays" aria-hidden="true" />
                            <FlaskArt status="ok" className="mc-result__art" />
                            {result.isExamFeedback ? (
                                <>
                                    <span className="mc-result__tag"><Sparkles size={13} /> ¡Correcto!</span>
                                    <p className="mc-result__desc">{result.feedbackMessage}</p>
                                    <GameButton variant="success" size="lg" iconRight={ArrowRight} onClick={() => { setResult(null); selectNextTarget(); }}>
                                        {currentQuestionIndex < examQuestions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
                                    </GameButton>
                                </>
                            ) : (
                                <>
                                    <span className="mc-result__tag"><Sparkles size={13} /> Síntesis exitosa</span>
                                    <h2 className="mc-result__title">{result.name}</h2>
                                    <span className="mc-formula-chip mc-formula-chip--lg">{result.formula}</span>
                                    <p className="mc-result__desc">{result.description}</p>
                                    <div className="mc-fact">
                                        <span className="mc-fact__icon"><Lightbulb size={18} /></span>
                                        <div>
                                            <strong>Dato científico</strong>
                                            <p>{result.funFact}</p>
                                        </div>
                                    </div>
                                    <GameButton variant="success" size="lg" iconRight={ArrowRight} onClick={() => { setResult(null); selectNextTarget(); }}>
                                        Siguiente molécula
                                    </GameButton>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {errorModal && (
                    <motion.div className="mc-overlay" {...overlayAnim}>
                        <motion.div className="mc-panel mc-result is-ko gk-anim-shake" {...panelAnim}>
                            <FlaskArt status="ko" className="mc-result__art" />
                            <span className="mc-result__tag">Fallo de fusión</span>
                            <p className="mc-result__desc">{errorModal}</p>
                            <GameButton variant="danger" size="lg" icon={RefreshCw} onClick={() => setErrorModal(null)}>
                                Repetir
                            </GameButton>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDifficultySelector && (
                    <motion.div className="mc-overlay" {...overlayAnim}>
                        <motion.div className="mc-panel mc-panel--wide" {...panelAnim}>
                            <ModeSelect
                                title="Configura el examen"
                                description="Elige el nivel: la nota base está en Medio. Además, la puntuación depende del tiempo: dos alumnos con la misma nota pueden obtener puntos distintos."
                                modes={['easy', 'medium', 'hard'].map((d) => ({
                                    id: d,
                                    tone: DIFF_TONE[d],
                                    icon: DIFF_ICON[d],
                                    title: DIFF_NAME[d],
                                    desc: `${EXAM_DIFFICULTY[d].questions} moléculas para construir.`,
                                    features: [EXAM_DIFFICULTY[d].note, fmtMult(EXAM_DIFFICULTY[d].scoreMult)],
                                    cta: 'Empezar',
                                }))}
                                onSelect={(d) => { setStarted(true); startExam(d); }}
                                footer={(
                                    <GameButton variant="ghost" size="sm" icon={X} onClick={() => setShowDifficultySelector(false)}>
                                        Cancelar
                                    </GameButton>
                                )}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showExamResults && (() => {
                    const total = examQuestions.length || 1;
                    const diffConfig = EXAM_DIFFICULTY[examDifficulty] || EXAM_DIFFICULTY.medium;
                    const ratio = examScore / total;
                    const nota = Math.round(ratio * diffConfig.gradeMax * 10) / 10;
                    const points = computeCrafteoScore(examScore, total, examFinalTime, examDifficulty);
                    return (
                        <motion.div className="mc-overlay" {...overlayAnim}>
                            <div className="mc-panel mc-panel--wide">
                                <ResultsScreen
                                    subtitle={`Mesa de Crafteo · ${DIFF_NAME[examDifficulty] || ''} · ${diffConfig.note}`}
                                    nota={nota}
                                    points={points}
                                    stats={[
                                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${examScore}/${total}` },
                                        { icon: Clock, tone: 'time', label: 'Tiempo', value: `${examFinalTime}s` },
                                        { icon: Gauge, tone: 'progress', label: 'Dificultad', value: DIFF_NAME[examDifficulty] || '' },
                                    ]}
                                    actions={[
                                        { label: 'Nuevo examen', onClick: () => { setShowExamResults(false); setShowDifficultySelector(true); }, icon: RefreshCw },
                                        { label: 'Volver al laboratorio', onClick: exitExamMode, icon: LogOut, variant: 'soft' },
                                    ]}
                                >
                                    {examResultsData.map((res, idx) => (
                                        <FeedbackItem key={idx} index={idx + 1} ok={res.correct} title={res.question.name}>
                                            {res.correct
                                                ? <>Fórmula: <strong>{res.question.formula}</strong></>
                                                : <>Solución: <strong>{res.question.formula}</strong> ({getElementCounts(res.question.atoms).map(([sym, c]) => `${sym}${c > 1 ? c : ''}`).join(' ')})</>}
                                        </FeedbackItem>
                                    ))}
                                </ResultsScreen>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            <AnimatePresence>
                {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            </AnimatePresence>
        </GameShell>
    );
};

export default MesaCrafteo;
