// src/apps/mesa-crafteo/MesaCrafteo.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { families } from './periodicTable';
import { molecules } from './craftingRecipes';
import './MesaCrafteo.css';

const STORAGE_KEY = 'mesa_crafteo_discoveries';

const MesaCrafteo = ({ grade = 1, corso: corsoProp }) => {
    // Usar 'grade' como fuente principal (que es lo que pasa AppRunnerPage)
    // Pero mantener soporte para 'corso' por si acaso
    const cursoActual = corsoProp || grade;
    const [grid, setGrid] = useState(Array(9).fill(null));
    const [selectedElement, setSelectedElement] = useState(null);
    const [hoverElementInfo, setHoverElementInfo] = useState(null);
    const [discoveries, setDiscoveries] = useState(new Set());
    const [result, setResult] = useState(null);
    const [isFusing, setIsFusing] = useState(false);
    const [showFormula, setShowFormula] = useState(false);
    const [showPeriodicTable, setShowPeriodicTable] = useState(false);
    const [showRecipes, setShowRecipes] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [elementsData, setElementsData] = useState([]);
    const [currentTarget, setCurrentTarget] = useState(null);
    const [showDynamicInfo, setShowDynamicInfo] = useState(false);
    const [hoveredInventoryItem, setHoveredInventoryItem] = useState(null);
    const [isShuffling, setIsShuffling] = useState(false);

    // Filtrar moléculas según el curso (ej: en 4º están todas las de 1º, 2º, 3º y 4º)
    const availableMolecules = useMemo(() => {
        const gradeLevel = parseInt(cursoActual);
        return molecules.filter(m => m.grade <= gradeLevel);
    }, [cursoActual]);

    const currentGradeMolecules = useMemo(() => {
        const gradeLevel = parseInt(cursoActual);
        return molecules.filter(m => m.grade === gradeLevel);
    }, [cursoActual]);

    // Cargar datos de elementos y descubrimientos
    useEffect(() => {
        fetch('/data/quimica/elementos_info.json')
            .then(res => res.json())
            .then(data => {
                setElementsData(data.elements);
            })
            .catch(err => console.error("Error cargando elementos:", err));

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setDiscoveries(new Set(JSON.parse(saved)));
    }, []);

    useEffect(() => {
        if (availableMolecules.length > 0 && !currentTarget) {
            setCurrentTarget(availableMolecules[Math.floor(Math.random() * availableMolecules.length)]);
        }
    }, [currentTarget, availableMolecules]);

    // Bloquear scroll del body al abrir modales
    useEffect(() => {
        const isAnyModalOpen = showRecipes || showPeriodicTable || !!result || !!errorModal || !!hoverElementInfo;
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showRecipes, showPeriodicTable, result, errorModal, hoverElementInfo]);

    const selectNextTarget = () => {
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 600);

        let next;
        do {
            next = availableMolecules[Math.floor(Math.random() * availableMolecules.length)];
        } while (next === currentTarget && availableMolecules.length > 1);
        setCurrentTarget(next);
        setGrid(Array(9).fill(null));
        setShowFormula(false);
    };

    const handleShowSolution = () => {
        const newGrid = Array(9).fill(null);
        currentTarget.pattern.forEach((row, r) => {
            row.forEach((symbol, c) => {
                if (symbol) {
                    const elData = elementsData.find(e => e.symbol === symbol);
                    if (elData) {
                        newGrid[r * 3 + c] = elData;
                    }
                }
            });
        });
        setGrid(newGrid);
    };

    const handleCellClick = (index) => {
        const newGrid = [...grid];
        if (grid[index]) {
            newGrid[index] = null;
        } else {
            if (!selectedElement) return;
            newGrid[index] = selectedElement;
        }
        setGrid(newGrid);
    };

    const normalizePattern = (pattern2D) => {
        let minRow = 3, maxRow = -1, minCol = 3, maxCol = -1;
        let empty = true;

        pattern2D.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell !== null) {
                    empty = false;
                    minRow = Math.min(minRow, r);
                    maxRow = Math.max(maxRow, r);
                    minCol = Math.min(minCol, c);
                    maxCol = Math.max(maxCol, c);
                }
            });
        });

        if (empty) return [[]];

        const normalized = [];
        for (let r = minRow; r <= maxRow; r++) {
            const newRow = [];
            for (let c = minCol; c <= maxCol; c++) {
                newRow.push(pattern2D[r][c]);
            }
            normalized.push(newRow);
        }
        return normalized;
    };

    const checkRecipe = () => {
        setIsFusing(true);
        setTimeout(() => {
            const currentGrid2D = [
                grid.slice(0, 3).map(e => e?.symbol || null),
                grid.slice(3, 6).map(e => e?.symbol || null),
                grid.slice(6, 9).map(e => e?.symbol || null)
            ];

            const normalizedCurrent = JSON.stringify(normalizePattern(currentGrid2D));
            const normalizedTarget = JSON.stringify(normalizePattern(currentTarget.pattern));

            if (normalizedCurrent === normalizedTarget) {
                setResult(currentTarget);
                setDiscoveries(prev => {
                    const next = new Set(prev).add(currentTarget.name);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
                    return next;
                });
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#59b33a', '#ffffff', '#3c8527']
                });
            } else {
                setErrorModal(`ESTRUCTURA INCORRECTA: El patrón no coincide con ${currentTarget.name}. Revisa el orden y la posición de los átomos.`);
            }
            setIsFusing(false);
        }, 800);
    };

    // Estructura para renderizar la tabla periódica completa (7 filas x 18 columnas)
    const renderTable = () => {
        const rows = [];
        for (let r = 1; r <= 7; r++) {
            for (let c = 1; c <= 18; c++) {
                const el = elementsData.find(e => e.pos[0] === r && e.pos[1] === c);
                const familyColor = el ? families[el.category]?.color || '#8b8b8b' : 'transparent';

                rows.push(
                    <div
                        key={`${r}-${c}`}
                        className={`table-cell-full ${el ? 'active' : 'empty'}`}
                        style={{ backgroundColor: familyColor }}
                        onClick={() => el && setHoverElementInfo(el)}
                    >
                        {el && (
                            <>
                                <span className="atomic-num-full">{el.atomicNumber}</span>
                                <span className="cell-symbol-full">{el.symbol}</span>
                            </>
                        )}
                    </div>
                );
            }
        }
        return rows;
    };

    // Lanthanides and Actinides (simplificado abajo)
    const renderExtraRows = () => {
        const rows = [];
        // Lantanidos r=8, Actinidos r=9 (en el JSON están así)
        [8, 9].forEach(r => {
            for (let c = 1; c <= 18; c++) {
                const el = elementsData.find(e => e.pos[0] === r && e.pos[1] === c);
                const familyColor = el ? families[el.category]?.color || '#8b8b8b' : 'transparent';
                rows.push(
                    <div
                        key={`${r}-${c}`}
                        className={`table-cell-full ${el ? 'active' : 'empty'}`}
                        style={{ backgroundColor: familyColor }}
                        onClick={() => el && setHoverElementInfo(el)}
                    >
                        {el && (
                            <>
                                <span className="atomic-num-full">{el.atomicNumber}</span>
                                <span className="cell-symbol-full">{el.symbol}</span>
                            </>
                        )}
                    </div>
                );
            }
        });
        return rows;
    };

    const gradeLabel = `${cursoActual}º ESO`;

    return (
        <div className="alchemy-container">
            <header className="alchemy-header">
                <motion.h1 initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    MESA DE CRAFTEO
                </motion.h1>
                <div className="header-actions">
                    <button className="btn-tab secondary" onClick={() => setShowRecipes(true)}>📔 VER RECETARIO</button>
                    <button className="btn-tab" onClick={() => setShowPeriodicTable(true)}>📊 TABLA PERIÓDICA</button>
                </div>
            </header>

            <main className="alchemy-main-grid">
                <section className="crafting-section">
                    {currentTarget && (
                        <div className="mission-card">
                            <div className="mission-header-flex">
                                <span className="mission-label">MISIÓN ACTUAL</span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-skip"
                                    onClick={selectNextTarget}
                                    title="Cambiar a otra molécula"
                                >
                                    <motion.span
                                        style={{ display: 'inline-block', marginRight: '6px' }}
                                        animate={{ rotate: isShuffling ? 360 : 0 }}
                                        transition={{ duration: 0.5, ease: "anticipate" }}
                                    >
                                        🎲
                                    </motion.span>
                                    OTRA MOLÉCULA
                                </motion.button>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTarget.name}
                                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    <h2 className="mission-target">{currentTarget.name}</h2>
                                    {showFormula && (
                                        <div className="formula-hint">
                                            FÓRMULA: <span>{currentTarget.formula}</span>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                    <div className="molecular-grid">
                        {grid.map((cell, idx) => (
                            <div
                                key={idx}
                                className="grid-cell"
                                onClick={() => handleCellClick(idx)}
                            >
                                <AnimatePresence>
                                    {cell && (
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="element-orb"
                                            style={{ backgroundColor: families[cell.category]?.color || '#fff' }}
                                        >
                                            <span className="element-atomic">{cell.atomicNumber}</span>
                                            <span className="element-symbol" style={{ color: '#000' }}>
                                                {cell.symbol}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    <div className="action-area">
                        <button className="btn-clear" onClick={() => setGrid(Array(9).fill(null))}>LIMPIAR</button>
                        <div className="help-buttons">
                            <button
                                className="btn-help hint"
                                onClick={() => setShowFormula(true)}
                                disabled={showFormula}
                            >
                                VER FÓRMULA
                            </button>
                            <button
                                className="btn-help solution"
                                onClick={handleShowSolution}
                                disabled={elementsData.length === 0}
                            >
                                SOLUCIÓN
                            </button>
                        </div>
                        <button
                            className="btn-alchemy"
                            disabled={grid.every(c => c === null) || isFusing}
                            onClick={checkRecipe}
                        >
                            {isFusing ? 'FUSIONANDO...' : 'CRAFTEAR'}
                        </button>
                    </div>
                </section>

                <section className="inventory-section">
                    <div className="inventory-header">
                        <div className="title-flex">
                            <h2>ELEMENTOS</h2>
                            <div className="toggle-help" onClick={() => setShowDynamicInfo(!showDynamicInfo)} title="Activar/Desactivar info al pasar el ratón">
                                <span className="toggle-label">{showDynamicInfo ? 'INFO ON' : 'INFO OFF'}</span>
                                <div className={`toggle-track ${showDynamicInfo ? 'active' : ''}`}>
                                    <div className="toggle-thumb"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="inventory-info-panel-container">
                        <AnimatePresence mode="wait">
                            {showDynamicInfo && hoveredInventoryItem ? (
                                <motion.div
                                    key={hoveredInventoryItem.symbol}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="dynamic-inventory-info"
                                    style={{ borderLeftColor: families[hoveredInventoryItem.category]?.color }}
                                >
                                    <span className="dynamic-sym" style={{ color: families[hoveredInventoryItem.category]?.color }}>{hoveredInventoryItem.symbol}</span>
                                    <div className="dynamic-text">
                                        <h4>{hoveredInventoryItem.name} <span className="dynamic-num">({hoveredInventoryItem.atomicNumber})</span></h4>
                                        <p><strong>Familia:</strong> {families[hoveredInventoryItem.category].label}</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="dynamic-placeholder">
                                    {showDynamicInfo ? 'Pasa el ratón sobre un elemento' : 'Selecciona un átomo para la mesa'}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="element-list custom-scrollbar">
                        {elementsData.filter(e => e.atomicNumber <= 36 || [47, 53, 79, 82].includes(e.atomicNumber)).map(el => (
                            <div
                                key={el.symbol}
                                className={`inventory-item ${selectedElement?.symbol === el.symbol ? 'selected' : ''}`}
                                onClick={() => setSelectedElement(el)}
                                onMouseEnter={() => setHoveredInventoryItem(el)}
                                onMouseLeave={() => setHoveredInventoryItem(null)}
                                style={{ backgroundColor: families[el.category]?.color }}
                            >
                                <span style={{ color: '#000', fontWeight: 'bold' }}>{el.symbol}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* RECETARIO MODAL */}
            <AnimatePresence>
                {showRecipes && (
                    <div className="modal-overlay" onClick={() => setShowRecipes(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="periodic-table-modal recipe-book-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>📔 TODAS LAS RECETAS ({gradeLabel})</h2>
                                <button className="btn-close" onClick={() => setShowRecipes(false)}>X</button>
                            </div>

                            <div className="recipes-grid-modern custom-scrollbar">
                                {availableMolecules.map((m, idx) => (
                                    <div key={idx} className="recipe-card-modern">
                                        <div className="recipe-card-header">
                                            <h3>{m.name}</h3>
                                            <span className="recipe-formula">{m.formula}</span>
                                        </div>
                                        <div className="recipe-mini-grid">
                                            {m.pattern.flat().map((symbol, sIdx) => (
                                                <div key={sIdx} className={`mini-cell ${symbol ? 'active' : ''}`} style={{ backgroundColor: symbol ? families[elementsData.find(e => e.symbol === symbol)?.category]?.color : 'transparent' }}>
                                                    {symbol}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="recipe-desc">{m.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TABLA PERIÓDICA MODAL */}
            <AnimatePresence>
                {showPeriodicTable && (
                    <div className="modal-overlay" onClick={() => setShowPeriodicTable(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="periodic-table-modal full-table custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>TABLA PERIÓDICA COMPLETA</h2>
                                <button className="btn-close" onClick={() => setShowPeriodicTable(false)}>X</button>
                            </div>

                            <div className="periodic-grid-full">
                                {renderTable()}
                            </div>

                            <div className="extra-rows-label">LANTÁNIDOS / ACTÍNIDOS</div>
                            <div className="periodic-grid-full extra-rows">
                                {renderExtraRows()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE INFO DE ELEMENTO (DETALLE) */}
            <AnimatePresence>
                {hoverElementInfo && (
                    <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setHoverElementInfo(null)}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="molecule-reveal-card element-detail-card"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="detail-header">
                                <span className="cat-label">{families[hoverElementInfo.category]?.label || 'Elemento'}</span>
                                <button className="btn-close" onClick={() => setHoverElementInfo(null)}>X</button>
                            </div>

                            <div className="element-scientific-box" style={{ '--element-color': families[hoverElementInfo.category]?.color || '#8b8b8b' }}>
                                <div className="element-main-content">
                                    {/* Top Left: Mass & Secondary Stats */}
                                    <div className="scientific-top-left">
                                        <div className="ev-stat-item" data-label="Masa Atómica">
                                            {hoverElementInfo.atomicMass}
                                        </div>
                                        <div className="scientific-sub-stats">
                                            <div className="ev-stat-item" data-label="Energía Ionización (eV)">{hoverElementInfo.ionizationEnergy}</div>
                                            <div className="ev-stat-item" data-label="Electronegatividad">{hoverElementInfo.electronegativity}</div>
                                        </div>
                                    </div>

                                    {/* Top Right: Atomic Number */}
                                    <div className="scientific-top-right">
                                        <div className="ev-stat-number" data-label="Número Atómico">
                                            {hoverElementInfo.atomicNumber}
                                        </div>
                                    </div>

                                    {/* Center: Symbol & Name */}
                                    <div className="scientific-center">
                                        <div className="ev-symbol" data-label="Símbolo Químico">{hoverElementInfo.symbol}</div>
                                        <div className="ev-name" data-label="Nombre">{hoverElementInfo.name}</div>
                                    </div>

                                    {/* Bottom: Configuration */}
                                    <div className="scientific-bottom">
                                        <div className="ev-config" data-label="Configuración Electrónica">{hoverElementInfo.config}</div>
                                    </div>
                                </div>

                                {/* Right Side: Oxidation States */}
                                <div className="scientific-side-bar" data-label="Estados de Oxidación">
                                    {(hoverElementInfo.oxidationStates || "").split(',').map(s => (
                                        <div key={s} className="ev-oxidation">{s.trim()}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="scientific-description-card">
                                <div className="desc-header" style={{ color: families[hoverElementInfo.category]?.color || 'var(--primary-color)' }}>
                                    🔬 INFORMACIÓN CIENTÍFICA
                                </div>
                                <div className="desc-content">
                                    {hoverElementInfo.description}
                                </div>
                            </div>


                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* MODALES DE RESULTADO Y ERROR */}
            <AnimatePresence>
                {result && (
                    <div className="result-overlay">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="molecule-reveal-card">
                            <h2 className="molecule-title">¡SÍNTESIS EXITOSA!</h2>
                            <h3 className="molecule-subtitle">{result.name} ({result.formula})</h3>
                            <div className="result-main-icon">🧪</div>
                            <p className="molecule-description">{result.description}</p>
                            <div className="fun-fact-box">
                                <strong>DATO CIENTÍFICO:</strong> {result.funFact}
                            </div>
                            <button className="btn-alchemy" onClick={() => {
                                setResult(null);
                                selectNextTarget();
                            }}>SIGUIENTE MOLÉCULA</button>
                        </motion.div>
                    </div>
                )}

                {errorModal && (
                    <div className="result-overlay">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="molecule-reveal-card error-card">
                            <h2 className="molecule-title" style={{ color: '#ff0000' }}>FALLO DE FUSIÓN</h2>
                            <div className="result-main-icon">💥</div>
                            <p className="molecule-description">{errorModal}</p>
                            <button className="btn-alchemy" style={{ backgroundColor: '#8b0000' }} onClick={() => setErrorModal(null)}>REPETIR</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default MesaCrafteo;
