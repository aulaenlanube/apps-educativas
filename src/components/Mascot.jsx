import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Mascot = () => {
    const [jokes, setJokes] = useState([]);
    const [joke, setJoke] = useState(null);
    const [isTalking, setIsTalking] = useState(false);

    useEffect(() => {
        fetch('/jokes.json')
            .then(res => res.json())
            .then(data => setJokes(data))
            .catch(err => console.error("Error loading jokes:", err));
    }, []);

    const handleMascotClick = () => {
        if (isTalking || jokes.length === 0) return;

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        setJoke(randomJoke);
        setIsTalking(true);

        // Hide joke after 3 seconds
        setTimeout(() => {
            setJoke(null);
            setIsTalking(false);
        }, 3000);
    };

    // Orbiting elements with layer info (behind/front)
    const orbitingElements = [
        { char: 'A', color: '#6366f1', rx: 100, ry: 30, duration: 6, delay: 0, layer: 'back' },
        { char: '5', color: '#8b5cf6', rx: 120, ry: 35, duration: 8, delay: 1, layer: 'front' },
        { char: 'π', color: '#f43f5e', rx: 90, ry: 25, duration: 7, delay: 2, layer: 'back' },
        { char: 'x', color: '#10b981', rx: 110, ry: 32, duration: 9, delay: 0.5, layer: 'front' },
        { char: '+', color: '#f59e0b', rx: 95, ry: 28, duration: 5, delay: 1.5, layer: 'front' },
        { char: 'H₂O', color: '#3b82f6', rx: 130, ry: 40, duration: 10, delay: 3, layer: 'back' },
        { char: 'E=mc²', color: '#ef4444', rx: 140, ry: 45, duration: 12, delay: 4, layer: 'front' },
        { char: '{ }', color: '#ec4899', rx: 80, ry: 20, duration: 6.5, delay: 0.7, layer: 'back' },
        { char: '√', color: '#8b5cf6', rx: 105, ry: 38, duration: 7.5, delay: 2.2, layer: 'front' },
        { char: '?', color: '#06b6d4', rx: 125, ry: 35, duration: 9.5, delay: 1.8, layer: 'back' },
    ];

    const renderPlanet = (el, i) => (
        <motion.g
            key={i}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                rotate: 360
            }}
            transition={{
                rotate: { duration: el.duration, repeat: Infinity, ease: "linear", delay: el.delay },
                opacity: { duration: 1 }
            }}
            style={{ originX: '205px', originY: '105px' }}
        >
            <motion.text
                x={205 + el.rx}
                y={105}
                fill={el.color}
                fontSize="22"
                fontWeight="bold"
                animate={{
                    rotate: -360,
                    scale: [1, 1.2, 1, 0.8, 1], // Perspective scale
                    opacity: el.layer === 'back' ? [0.4, 0.2, 0.4, 0.6, 0.4] : [0.6, 0.8, 1, 0.8, 0.6]
                }}
                transition={{ duration: el.duration, repeat: Infinity, ease: "linear", delay: el.delay }}
                style={{ originX: `${205 + el.rx}px`, originY: '105px' }}
            >
                {el.char}
            </motion.text>
        </motion.g>
    );

    return (
        <div className="mascot-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            {/* SPEECH BUBBLE */}
            <AnimatePresence>
                {joke && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -20, y: 30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0, rotate: 20 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        style={{
                            position: 'absolute',
                            top: '-70px',
                            background: 'white',
                            padding: '1.2rem',
                            borderRadius: '24px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                            border: '2px solid #6366f1',
                            zIndex: 25,
                            minWidth: '200px',
                            maxWidth: '280px',
                            textAlign: 'center',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1e1b4b',
                            pointerEvents: 'none'
                        }}
                    >
                        {joke}
                        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid #6366f1' }} />
                        <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid white' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MASCOT SVG */}
            <div
                className="mascot-container"
                onClick={handleMascotClick}
                style={{ height: '380px', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
                <svg width="600" height="380" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: '100%' }}>
                    <defs>
                        <linearGradient id="mascot_body_gradient" x1="150" y1="50" x2="250" y2="150" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>

                        <mask id="mascot_mouth_mask">
                            <rect x="0" y="0" width="400" height="200" fill="white" />
                            <motion.path
                                animate={isTalking ? {
                                    d: [
                                        "M 185 115 Q 205 125 225 115 Q 225 115 205 115 Q 185 115 185 115",
                                        "M 185 115 Q 205 105 225 115 Q 225 135 205 135 Q 185 135 185 115",
                                        "M 185 115 Q 205 115 225 115 Q 225 125 205 125 Q 185 125 185 115",
                                        "M 185 115 Q 205 105 225 115 Q 225 135 205 135 Q 185 135 185 115"
                                    ]
                                } : {
                                    d: "M 185 115 Q 205 125 225 115 Q 225 115 205 115 Q 185 115 185 115"
                                }}
                                transition={isTalking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                                fill="black"
                            />
                        </mask>
                    </defs>

                    {/* --- SOLAR SYSTEM GROUP --- */}
                    <motion.g animate={{ y: [-15, 15, -15] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>

                        {/* 1. PLANETS BEHIND (Layer 1) */}
                        {orbitingElements.filter(e => e.layer === 'back').map(renderPlanet)}

                        {/* 2. THE MASCOT (The Sun) */}
                        {/* Legs */}
                        <path d="M185 135 L185 165 A 5 5 0 0 0 195 165 L195 135" fill="#8b5cf6" />
                        <path d="M215 135 L215 165 A 5 5 0 0 0 225 165 L225 135" fill="#8b5cf6" />

                        {/* Mouth Background */}
                        <motion.g
                            animate={isTalking ? { opacity: 1, scaleY: [0.8, 1.1, 0.9, 1.1] } : { opacity: 0, scaleY: 0.1 }}
                            transition={isTalking ? { duration: 0.4, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
                            style={{ originX: "205px", originY: "115px" }}
                        >
                            <path d="M 185 115 Q 205 105 225 115 Q 225 135 205 135 Q 185 135 185 115" fill="#1e1b4b" />
                            <path d="M 195 130 Q 205 125 215 130" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
                            <rect x="187" y="108" width="7" height="10" rx="3" fill="white" />
                            <rect x="196" y="106" width="8" height="12" rx="4" fill="white" />
                            <rect x="206" y="107" width="8" height="11" rx="4" fill="white" />
                            <rect x="216" y="106" width="8" height="12" rx="4" fill="white" />
                            <rect x="189" y="125" width="6" height="9" rx="3" fill="white" />
                            <rect x="197" y="127" width="8" height="10" rx="4" fill="white" />
                            <rect x="207" y="125" width="8" height="11" rx="4" fill="white" />
                            <rect x="216" y="127" width="7" height="10" rx="3" fill="white" />
                        </motion.g>

                        {/* Body Shell */}
                        <motion.rect x="160" y="60" width="90" height="90" rx="35" fill="url(#mascot_body_gradient)" mask="url(#mascot_mouth_mask)" />
                        <rect x="175" y="100" width="60" height="40" rx="15" fill="#ffffff" fillOpacity="0.2" />

                        {/* Face Features */}
                        <motion.g style={{ originX: "205px", originY: "60px" }} animate={{ rotate: [0, 3, -3, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
                            <path d="M180 75 L180 60 L175 45 L185 35" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="185" cy="35" r="5" fill="#a78bfa" />
                            <path d="M230 75 L230 60 L235 45 L225 35" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="225" cy="35" r="5" fill="#a78bfa" />
                        </motion.g>
                        <g>
                            <circle cx="185" cy="90" r="12" fill="white" />
                            <motion.circle cx="185" cy="90" r="5" fill="#1e1b4b" animate={{ cx: [185, 187, 185] }} transition={{ repeat: Infinity, duration: 4 }} />
                            <circle cx="225" cy="90" r="10" fill="white" />
                            <motion.circle cx="225" cy="90" r="4" fill="#1e1b4b" animate={{ cx: [225, 227, 225] }} transition={{ repeat: Infinity, duration: 4 }} />
                        </g>

                        {/* Hands */}
                        <motion.g animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}>
                            <circle cx="150" cy="110" r="12" fill="#6366f1" />
                            <circle cx="260" cy="110" r="12" fill="#8b5cf6" />
                        </motion.g>

                        {/* 3. PLANETS IN FRONT (Layer 3) */}
                        {orbitingElements.filter(e => e.layer === 'front').map(renderPlanet)}

                    </motion.g>
                </svg>
            </div>
        </div>
    );
};

export default Mascot;
