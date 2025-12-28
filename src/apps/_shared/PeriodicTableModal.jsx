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

    // Limpiar campos que dicen "No data" o "unknown" (insensible a mayúsculas/minúsculas)
    const cleanData = (val) => {
        if (!val) return "";
        const s = String(val).toLowerCase().trim();
        // Regex para detectar "no data", "unknown" y otros placeholders
        if (/^no\s*data(\/null)?$/.test(s) || s === "unknown" || s === "null" || s === "undefined") return "";
        return val;
    };

    const renderStat = (val, label, className = "ev-stat-item") => {
        const cleaned = cleanData(val);
        if (!cleaned) return null;
        return <div className={className} data-label={label}>{cleaned}</div>;
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
                                            {renderStat(hoverElementInfo.atomicMass, "Masa Atómica")}
                                            <div className="scientific-sub-stats">
                                                {renderStat(hoverElementInfo.ionizationEnergy, "Energía Ionización (eV)")}
                                                {renderStat(hoverElementInfo.electronegativity, "Electronegatividad")}
                                            </div>
                                        </div>
                                        <div className="scientific-top-right">
                                            {renderStat(hoverElementInfo.atomicNumber, "Número Atómico", "ev-stat-number")}
                                        </div>
                                        <div className="scientific-center">
                                            {renderStat(hoverElementInfo.symbol, "Símbolo Químico", "ev-symbol")}
                                            {renderStat(hoverElementInfo.name, "Nombre", "ev-name")}
                                        </div>
                                        <div className="scientific-bottom">
                                            {renderStat(hoverElementInfo.config, "Configuración Electrónica", "ev-config")}
                                        </div>
                                    </div>
                                    <div className="scientific-side-bar" data-label="Estados de Oxidación">
                                        {cleanData(hoverElementInfo.oxidationStates).split(',').map(s => (
                                            s.trim() && <div key={s} className="ev-oxidation">{s.trim()}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="scientific-description-card">
                                    <div className="desc-header" style={{ color: FAMILIES[hoverElementInfo.category]?.color || 'var(--primary-color)' }}>
                                        🔬 INFORMACIÓN CIENTÍFICA
                                    </div>
                                    <div className="desc-content">
                                        {cleanData(hoverElementInfo.description)}
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
