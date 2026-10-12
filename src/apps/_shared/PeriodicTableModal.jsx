// src/apps/_shared/PeriodicTableModal.jsx
// Tabla periódica completa en modal (Mesa de Crafteo, Entrenador de Tabla).
// Rediseño 2026: rejilla de baldosas por familia con leyenda interactiva y
// ficha científica del elemento. Mismo contrato: { elementsData, onClose }.
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid3x3, FlaskConical, Atom, Zap, Magnet, Layers, Microscope } from 'lucide-react';
import { FAMILIES } from './QuimicaHelpers';
import './PeriodicTableModal.css';

const famColor = (el) => (el ? FAMILIES[el.category]?.color || '#8b8b8b' : 'transparent');

// Limpiar campos que dicen "No data" o "unknown" (insensible a mayúsculas/minúsculas)
const cleanData = (val) => {
    if (!val) return "";
    const s = String(val).toLowerCase().trim();
    // Regex para detectar "no data", "unknown" y otros placeholders
    if (/^no\s*data(\/null)?$/.test(s) || s === "unknown" || s === "null" || s === "undefined") return "";
    return val;
};

// Leyenda: una entrada por etiqueta (transition y transition-metal comparten nombre)
const LEGEND = Object.entries(FAMILIES).reduce((acc, [key, fam]) => {
    const found = acc.find((f) => f.label === fam.label);
    if (found) found.keys.push(key);
    else acc.push({ label: fam.label, color: fam.color, keys: [key] });
    return acc;
}, []);

const PeriodicTableModal = ({ elementsData, onClose }) => {
    const [hoverElementInfo, setHoverElementInfo] = useState(null);
    const [focusFamily, setFocusFamily] = useState(null); // solo visual: resalta una familia

    const byPos = useMemo(() => {
        const m = new Map();
        (elementsData || []).forEach((e) => { if (e.pos) m.set(`${e.pos[0]}-${e.pos[1]}`, e); });
        return m;
    }, [elementsData]);

    const presentFamilies = useMemo(
        () => LEGEND.filter((f) => (elementsData || []).some((e) => f.keys.includes(e.category))),
        [elementsData]
    );

    const renderCell = (r, c) => {
        const el = byPos.get(`${r}-${c}`);
        if (!el) return <div key={`${r}-${c}`} className="ptm-cell is-empty" aria-hidden="true" />;
        const dim = focusFamily && !focusFamily.includes(el.category);
        return (
            <button
                type="button"
                key={`${r}-${c}`}
                className={`ptm-cell ${dim ? 'is-dim' : ''}`}
                style={{ '--el': famColor(el) }}
                onClick={() => setHoverElementInfo(el)}
                title={el.name}
                aria-label={`${el.name} (${el.symbol}), número atómico ${el.atomicNumber}`}
            >
                <span className="ptm-cell__num">{el.atomicNumber}</span>
                <span className="ptm-cell__sym">{el.symbol}</span>
                <span className="ptm-cell__name">{el.name}</span>
            </button>
        );
    };

    const rows = (from, to) => {
        const cells = [];
        for (let r = from; r <= to; r++) {
            for (let c = 1; c <= 18; c++) cells.push(renderCell(r, c));
        }
        return cells;
    };

    const info = hoverElementInfo;
    const oxidation = info ? String(cleanData(info.oxidationStates) || '').split(',').map((s) => s.trim()).filter(Boolean) : [];
    const stats = info ? [
        { Icon: Atom, label: 'Masa atómica', value: cleanData(info.atomicMass) },
        { Icon: Magnet, label: 'Electronegatividad', value: cleanData(info.electronegativity) },
        { Icon: Zap, label: 'Energía de ionización (eV)', value: cleanData(info.ionizationEnergy) },
        { Icon: Layers, label: 'Configuración electrónica', value: cleanData(info.config), wide: true },
    ].filter((s) => s.value) : [];

    return (
        <motion.div
            className="ptm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="ptm-modal"
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Tabla periódica completa"
            >
                <div className="ptm-head">
                    <span className="ptm-head__badge"><Grid3x3 size={22} /></span>
                    <div className="ptm-head__text">
                        <h2>Tabla periódica</h2>
                        <p>{(elementsData || []).length} elementos · toca uno para ver su ficha</p>
                    </div>
                    <button type="button" className="ptm-close" onClick={onClose} aria-label="Cerrar tabla periódica">
                        <X size={18} />
                    </button>
                </div>

                <div className="ptm-legend" onMouseLeave={() => setFocusFamily(null)}>
                    {presentFamilies.map((f) => (
                        <button
                            type="button"
                            key={f.label}
                            className={`ptm-legend__item ${focusFamily === f.keys ? 'is-on' : ''}`}
                            style={{ '--el': f.color }}
                            onMouseEnter={() => setFocusFamily(f.keys)}
                            onFocus={() => setFocusFamily(f.keys)}
                            onClick={() => setFocusFamily(focusFamily === f.keys ? null : f.keys)}
                        >
                            <span className="ptm-legend__dot" />{f.label}
                        </button>
                    ))}
                </div>

                <div className="ptm-scroll">
                    <div className="ptm-grid">{rows(1, 7)}</div>
                    <div className="ptm-sep"><span>Lantánidos y actínidos</span></div>
                    <div className="ptm-grid ptm-grid--f">{rows(8, 9)}</div>
                </div>

                {/* FICHA DEL ELEMENTO */}
                <AnimatePresence>
                    {info && (
                        <motion.div
                            className="ptm-detail-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setHoverElementInfo(null)}
                        >
                            <motion.div
                                className="ptm-detail"
                                style={{ '--el': famColor(info) }}
                                initial={{ scale: 0.9, opacity: 0, y: 14 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.94, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                                onClick={e => e.stopPropagation()}
                                role="dialog"
                                aria-label={`Ficha de ${info.name}`}
                            >
                                <button type="button" className="ptm-close ptm-detail__close" onClick={() => setHoverElementInfo(null)} aria-label="Cerrar ficha">
                                    <X size={18} />
                                </button>

                                <div className="ptm-detail__hero">
                                    <div className="ptm-bigtile">
                                        <span className="ptm-bigtile__num">{info.atomicNumber}</span>
                                        <span className="ptm-bigtile__sym">{info.symbol}</span>
                                        <span className="ptm-bigtile__name">{info.name}</span>
                                        {cleanData(info.atomicMass) && <span className="ptm-bigtile__mass">{cleanData(info.atomicMass)}</span>}
                                    </div>
                                    <div className="ptm-detail__title">
                                        <span className="ptm-detail__family">
                                            <span className="ptm-legend__dot" />
                                            {FAMILIES[info.category]?.label || 'Elemento'}
                                        </span>
                                        <h3>{info.name}</h3>
                                        <p>Número atómico {info.atomicNumber} · símbolo <strong>{info.symbol}</strong></p>
                                    </div>
                                </div>

                                {stats.length > 0 && (
                                    <div className="ptm-stats">
                                        {stats.map(({ Icon, label, value, wide }) => (
                                            <div key={label} className={`ptm-stat ${wide ? 'is-wide' : ''}`}>
                                                <span className="ptm-stat__icon"><Icon size={15} /></span>
                                                <span className="ptm-stat__text">
                                                    <span className="ptm-stat__label">{label}</span>
                                                    <span className="ptm-stat__value">{value}</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {oxidation.length > 0 && (
                                    <div className="ptm-ox">
                                        <span className="ptm-ox__label"><FlaskConical size={14} /> Estados de oxidación</span>
                                        <div className="ptm-ox__list">
                                            {oxidation.map((s) => <span key={s} className="ptm-ox__chip">{s}</span>)}
                                        </div>
                                    </div>
                                )}

                                {cleanData(info.description) && (
                                    <div className="ptm-desc">
                                        <span className="ptm-desc__label"><Microscope size={14} /> Información científica</span>
                                        <p>{cleanData(info.description)}</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default PeriodicTableModal;
