import React from 'react';
import { motion } from 'framer-motion';

const MascotLogo = ({ className = "w-7 h-7" }) => {
    return (
        <svg
            viewBox="0 0 100 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradient" x1="5" y1="5" x2="95" y2="75" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
            </defs>

            {/* Head */}
            <rect x="5" y="5" width="90" height="70" rx="20" fill="url(#logoGradient)" />

            {/* Visor area (minimalist) */}
            <rect x="12" y="20" width="76" height="36" rx="12" fill="rgba(0,0,0,0.15)" />

            {/* Eyes - Left */}
            <motion.circle
                cx="38" cy="38" r="10" fill="white"
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, times: [0, 0.45, 0.5, 0.55, 1] }}
                style={{ originX: "38px", originY: "38px" }}
            />
            <motion.circle
                cx="38" cy="38" r="5" fill="#1e1b4b"
                animate={{
                    x: [0, 2, -2, 0, 0],
                    scaleY: [1, 1, 0.1, 1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, times: [0, 0.45, 0.5, 0.55, 1] }}
                style={{ originX: "38px", originY: "38px" }}
            />

            {/* Eyes - Right */}
            <motion.circle
                cx="65" cy="38" r="13" fill="white"
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, times: [0, 0.45, 0.5, 0.55, 1] }}
                style={{ originX: "65px", originY: "38px" }}
            />
            <motion.circle
                cx="65" cy="38" r="6.5" fill="#1e1b4b"
                animate={{
                    x: [0, 2, -2, 0, 0],
                    scaleY: [1, 1, 0.1, 1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, times: [0, 0.45, 0.5, 0.55, 1] }}
                style={{ originX: "65px", originY: "38px" }}
            />

            {/* Smile */}
            <motion.path
                d="M 42 60 Q 51.5 66 61 60"
                stroke="#67e8f9"
                strokeWidth="4"
                strokeLinecap="round"
                animate={{
                    d: [
                        "M 42 60 Q 51.5 66 61 60",
                        "M 40 58 Q 51.5 68 63 58",
                        "M 42 60 Q 51.5 66 61 60"
                    ]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
            />
        </svg>
    );
};

export default MascotLogo;
