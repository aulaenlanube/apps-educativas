// src/apps/_shared/PeriodicTableModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAMILIES } from './QuimicaHelpers';
import './PeriodicTableModal.css';

const PeriodicTableModal = ({ elementsData, onClose }) => {
    const [hoverElementInfo, setHoverElementInfo] = useState(null);

    const renderTable = () => {
        const rows = [];
        for (let r = 1; r <= 7; r++) {
            for (let c = 1; c <= 18; c++) {
                const el = elementsData.find(e => e.pos[0] === r && e.pos[1] === c);
                const familyColor = el ? FAMILIES[el.category]?.color || '#8b8b8b' : 'transparent';

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

    const renderExtraRows = () => {
        const rows = [];
        [8, 9].forEach(r => {
            for (let c = 1; c <= 18; c++) {
                const el = elementsData.find(e => e.pos[0] === r && e.pos[1] === c);
                const familyColor = el ? FAMILIES[el.category]?.color || '#8b8b8b' : 'transparent';
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="periodic-table-modal full-table custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>TABLA PERIÓDICA COMPLETA</h2>
                    <button className="btn-close" onClick={onClose}>X</button>
                </div>

                <div className="periodic-grid-full">
                    {renderTable()}
                </div>

                <div className="extra-rows-label">LANTÁNIDOS / ACTÍNIDOS</div>
                <div className="periodic-grid-full extra-rows">
                    {renderExtraRows()}
                </div>

                {/* MODAL DE INFO DE ELEMENTO (DETALLE) */}
                <AnimatePresence>
                    {hoverElementInfo && (
                        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setHoverElementInfo(null)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="molecule-reveal-card element-detail-card custom-scrollbar"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="detail-header">
                                    <span className="cat-label">{FAMILIES[hoverElementInfo.category]?.label || 'Elemento'}</span>
                                    <button className="btn-close" onClick={() => setHoverElementInfo(null)}>X</button>
                                </div>

                                <div className="element-scientific-box" style={{ '--element-color': FAMILIES[hoverElementInfo.category]?.color || '#8b8b8b' }}>
                                    <div className="element-main-content">
                                        <div className="scientific-top-left">
                                            <div className="ev-stat-item" data-label="Masa Atómica">{hoverElementInfo.atomicMass}</div>
                                            <div className="scientific-sub-stats">
                                                <div className="ev-stat-item" data-label="Energía Ionización (eV)">{hoverElementInfo.ionizationEnergy}</div>
                                                <div className="ev-stat-item" data-label="Electronegatividad">{hoverElementInfo.electronegativity}</div>
                                            </div>
                                        </div>
                                        <div className="scientific-top-right">
                                            <div className="ev-stat-number" data-label="Número Atómico">{hoverElementInfo.atomicNumber}</div>
                                        </div>
                                        <div className="scientific-center">
                                            <div className="ev-symbol" data-label="Símbolo Químico">{hoverElementInfo.symbol}</div>
                                            <div className="ev-name" data-label="Nombre">{hoverElementInfo.name}</div>
                                        </div>
                                        <div className="scientific-bottom">
                                            <div className="ev-config" data-label="Configuración Electrónica">{hoverElementInfo.config}</div>
                                        </div>
                                    </div>
                                    <div className="scientific-side-bar" data-label="Estados de Oxidación">
                                        {(hoverElementInfo.oxidationStates || "").split(',').map(s => (
                                            <div key={s} className="ev-oxidation">{s.trim()}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="scientific-description-card">
                                    <div className="desc-header" style={{ color: FAMILIES[hoverElementInfo.category]?.color || 'var(--primary-color)' }}>
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
            </motion.div>
        </div>
    );
};

export default PeriodicTableModal;
