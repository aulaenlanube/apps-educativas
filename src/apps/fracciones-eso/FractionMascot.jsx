import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JOKES = [
    "¿Qué le dice el 0 al 8? \n¡Bonito cinturón!",
    "¿Por qué estaba triste el libro de mates? \n¡Porque tenía muchos problemas!",
    "¿Qué le dice una curva a una tangente? \n¡No me toques!",
    "¿Cómo estornuda un matemático? \n¡Piiiii... piiiiiii!",
    "¿Tienes frío? \n¡Ponte en la esquina, está a 90 grados!",
    "¿Qué es un oso polar rectangular? \n¡Un oso cartesiano!",
    "¡No seas irracional!",
    "¡Me partís el corazón en fracciones!",
    "¿Qué hace una abeja en el gimnasio? \n¡Zum-ba!"
];

const FractionMascot = () => {
    const [joke, setJoke] = useState(null);
    const [isTalking, setIsTalking] = useState(false);

    const handleMascotClick = () => {
        if (isTalking) return;

        const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
        setJoke(randomJoke);
        setIsTalking(true);

        // Hide joke after 4 seconds
        setTimeout(() => {
            setJoke(null);
            setIsTalking(false);
        }, 4000);
    };

    return (
        <div className="mascot-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            {/* SPEECH BUBBLE */}
            <AnimatePresence>
                {joke && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'absolute',
                            top: '-80px',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '20px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '2px solid #e2e8f0',
                            zIndex: 20,
                            maxWidth: '250px',
                            textAlign: 'center',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#475569',
                            pointerEvents: 'none'
                        }}
                    >
                        {joke}
                        {/* Bubble tail */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '10px solid white'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-13px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '11px solid transparent',
                            borderRight: '11px solid transparent',
                            borderTop: '11px solid #e2e8f0',
                            zIndex: -1
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MASCOT SVG */}
            <div
                className="mascot-container"
                onClick={handleMascotClick}
                style={{ height: '180px', cursor: 'pointer', userSelect: 'none' }}
            >
                <svg width="400" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="body_gradient" x1="150" y1="50" x2="250" y2="150" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>

                    {/* --- SNACKS ANIMATION --- */}
                    <motion.text
                        x="50" y="110" fill="#3b82f6" fontSize="24" fontWeight="bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], x: [0, 140, 150, 150], y: [0, 0, 10, 10], scale: [1, 1, 0, 0], rotate: [0, 90, 180, 180] }}
                        transition={{ duration: 8, repeat: Infinity, times: [0, 0.4, 0.45, 1], ease: "easeInOut" }}
                    >7</motion.text>
                    <motion.text
                        x="330" y="90" fill="#ef4444" fontSize="24" fontWeight="bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], x: [0, -120, -130, -130], y: [0, 20, 30, 30], scale: [1, 1, 0, 0], rotate: [0, -90, -180, -180] }}
                        transition={{ duration: 8, repeat: Infinity, times: [0.5, 0.9, 0.95, 1], ease: "easeInOut" }}
                    >x</motion.text>

                    {/* --- MASCOT BODY --- */}
                    <motion.g animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                        {/* Legs */}
                        <path d="M185 150 L185 165 A 5 5 0 0 0 195 165 L195 150" fill="#8b5cf6" />
                        <path d="M215 150 L215 165 A 5 5 0 0 0 225 165 L225 150" fill="#8b5cf6" />

                        {/* Squircle Body + Gulp Effect */}
                        <motion.rect
                            x="160" y="60" width="90" height="90" rx="35" fill="url(#body_gradient)"
                            animate={{ scaleY: [1, 1, 0.9, 1, 1, 0.9, 1] }}
                            transition={{ duration: 8, repeat: Infinity, times: [0, 0.43, 0.46, 0.5, 0.93, 0.96, 1] }}
                        />
                        <rect x="175" y="100" width="60" height="40" rx="15" fill="#ffffff" fillOpacity="0.2" />

                        {/* Antennas */}
                        <motion.g style={{ originX: "205px", originY: "60px" }} animate={{ rotate: [0, 3, -3, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
                            <path d="M180 60 L175 45 L185 35" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="185" cy="35" r="5" fill="#a78bfa" />
                            <path d="M230 60 L235 45 L225 35" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="225" cy="35" r="5" fill="#a78bfa" />
                        </motion.g>

                        {/* Eyes */}
                        <g>
                            <circle cx="185" cy="90" r="12" fill="white" />
                            <motion.circle cx="185" cy="90" r="5" fill="#1e1b4b" animate={{ cx: [185, 187, 185] }} transition={{ repeat: Infinity, duration: 4 }} />
                            <circle cx="225" cy="90" r="10" fill="white" />
                            <motion.circle cx="225" cy="90" r="4" fill="#1e1b4b" animate={{ cx: [225, 227, 225] }} transition={{ repeat: Infinity, duration: 4 }} />
                        </g>

                        {/* NEW MOUTH: Zig-Zag Teeth based on sketch */}
                        <motion.g
                            initial={{ scaleY: 0.8 }}
                            animate={{ scaleY: [0.8, 0.8, 1.2, 1.2, 0.8, 0.8, 1.2, 1.2] }} // Open wider when eating
                            transition={{ duration: 8, repeat: Infinity, times: [0, 0.35, 0.4, 0.45, 0.5, 0.85, 0.9, 0.95] }}
                            style={{ originX: "205px", originY: "120px" }}
                        >
                            {/* Mouth Outline */}
                            <path d="M185 115 C 185 105, 225 105, 225 115 C 225 135, 185 135, 185 115 Z" fill="#1e1b4b" stroke="white" strokeWidth="2" />

                            {/* ZigZag Teeth */}
                            {/* Top Teeth */}
                            <path d="M186 115 L190 122 L195 115 L200 122 L205 115 L210 122 L215 115 L220 122 L224 115" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />

                            {/* Bottom Teeth */}
                            <path d="M186 128 L190 120 L195 128 L200 120 L205 128 L210 120 L215 128 L220 120 L224 128" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
                        </motion.g>

                        {/* Hands */}
                        <motion.g animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}>
                            <circle cx="150" cy="110" r="12" fill="#6366f1" />
                            <circle cx="260" cy="110" r="12" fill="#8b5cf6" />
                        </motion.g>
                    </motion.g>
                </svg>
            </div>
        </div>
    );
};

export default FractionMascot;
