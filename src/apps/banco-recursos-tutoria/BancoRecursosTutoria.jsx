import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BancoRecursosTutoria.css';

const BancoRecursosTutoria = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBlock, setActiveBlock] = useState('block1');
    const [activeSessionIdx, setActiveSessionIdx] = useState(0);
    const [expandedRubrics, setExpandedRubrics] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/data/bancoRecursosTutoriaBlocks.json');
                const data = await response.json();
                setBlocks(data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error loading tutoring data:", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleRubric = (id) => {
        setExpandedRubrics(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleBlockChange = (blockId) => {
        setActiveBlock(blockId);
        setActiveSessionIdx(0);
        setExpandedRubrics({});
    };

    if (loading) {
        return (
            <div className="tutoria-app loading-screen">
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Cargando recursos...</p>
                </div>
            </div>
        );
    }

    if (!blocks || blocks.length === 0) {
        return (
            <div className="tutoria-app error-screen">
                <p>No se pudieron cargar los datos de tutoría.</p>
            </div>
        );
    }

    const currentBlock = blocks.find(b => b.id === activeBlock) || blocks[0];
    const currentSession = currentBlock.sessions[activeSessionIdx] || currentBlock.sessions[0];

    return (
        <div className="tutoria-app">
            <header className="tutoria-app-header">
                <div className="tutoria-app-title-group">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        🎓 <span className="title-text">Banco de Recursos Tutoriales</span> ✨
                    </motion.h1>
                </div>
            </header>

            {/* Always visible category navigation / bubbles */}
            <nav className="tutoria-block-nav">
                {blocks.map((block, idx) => (
                    <motion.div
                        key={block.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 200 }}
                        className={`block-nav-item ${activeBlock === block.id ? 'active' : ''}`}
                        onClick={() => handleBlockChange(block.id)}
                    >
                        <i className={block.icon}></i>
                        <span>{block.title}</span>
                    </motion.div>
                ))}
            </nav>

            <AnimatePresence mode="wait">
                <motion.main
                    key={activeBlock}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="tutoria-main-content"
                >
                    <section className="block-intro-card">
                        <div className="block-intro-content">
                            <h2 style={{ color: currentBlock.color }}>{currentBlock.title}</h2>
                            <p>{currentBlock.desc}</p>

                            {/* Minimalist session selection buttons */}
                            <div className="session-nav-container">
                                {currentBlock.sessions.map((_, sIdx) => (
                                    <button
                                        key={sIdx}
                                        className={`session-nav-btn ${activeSessionIdx === sIdx ? 'active' : ''}`}
                                        onClick={() => setActiveSessionIdx(sIdx)}
                                        style={activeSessionIdx === sIdx ? { borderColor: currentBlock.color, color: currentBlock.color } : {}}
                                    >
                                        Sesión {sIdx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <i className={`${currentBlock.icon} block-decor-icon`} style={{ color: currentBlock.color }}></i>
                    </section>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeBlock}-${activeSessionIdx}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="session-card"
                        >
                            <div className="session-card-header">
                                <h3>{currentSession.title}</h3>
                                <div className="session-meta">
                                    <div className="meta-pill">
                                        <i className="fa-regular fa-clock"></i> {currentSession.duration}
                                    </div>
                                </div>
                            </div>

                            <div className="session-body">
                                <div className="resource-section">
                                    <span className="section-title-label">Recurso Didáctico</span>
                                    <div className="resource-card">
                                        <h4><i className={currentSession.resource.icon}></i> {currentSession.resource.title}</h4>
                                        <p>{currentSession.resource.text}</p>
                                    </div>
                                </div>

                                <div className="activity-individual">
                                    <span className="section-title-label">Actividad Individual</span>
                                    <div className="activity-item">
                                        <h4><i className={currentSession.individual.icon} style={{ color: currentBlock.color, marginRight: '10px' }}></i> {currentSession.individual.title}</h4>
                                        <p>{currentSession.individual.text}</p>

                                        <button
                                            className="eval-trigger"
                                            onClick={() => toggleRubric(`${activeBlock}-${activeSessionIdx}-ind`)}
                                        >
                                            <i className="fa-solid fa-clipboard-check"></i>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-ind`] ? 'Ocultar rúbrica' : 'Ver rúbrica'}
                                        </button>

                                        <AnimatePresence>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-ind`] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rubric-wrapper"
                                                >
                                                    <div className="rubric-header">
                                                        <span>Criterio</span>
                                                        <span>Excelente</span>
                                                        <span>Mejorable</span>
                                                    </div>
                                                    {currentSession.individual.rubric?.map((r, rIdx) => (
                                                        <div key={rIdx} className="rubric-row">
                                                            <span className="rubric-cell"><b>{r.criterion}</b></span>
                                                            <span className="rubric-cell cel-excellent">{r.excellent}</span>
                                                            <span className="rubric-cell cel-improvable">{r.improvable}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="activity-group">
                                    <span className="section-title-label">Actividad Grupal</span>
                                    <div className="activity-item">
                                        <h4><i className={currentSession.group.icon} style={{ color: currentBlock.color, marginRight: '10px' }}></i> {currentSession.group.title}</h4>
                                        <p>{currentSession.group.text}</p>

                                        <button
                                            className="eval-trigger"
                                            onClick={() => toggleRubric(`${activeBlock}-${activeSessionIdx}-grp`)}
                                        >
                                            <i className="fa-solid fa-users-gear"></i>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-grp`] ? 'Ocultar rúbrica' : 'Ver rúbrica'}
                                        </button>

                                        <AnimatePresence>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-grp`] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rubric-wrapper"
                                                >
                                                    <div className="rubric-header">
                                                        <span>Criterio</span>
                                                        <span>Excelente</span>
                                                        <span>Mejorable</span>
                                                    </div>
                                                    {currentSession.group.rubric?.map((r, rIdx) => (
                                                        <div key={rIdx} className="rubric-row">
                                                            <span className="rubric-cell"><b>{r.criterion}</b></span>
                                                            <span className="rubric-cell cel-excellent">{r.excellent}</span>
                                                            <span className="rubric-cell cel-improvable">{r.improvable}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.main>
            </AnimatePresence>
        </div>
    );
};

export default BancoRecursosTutoria;
