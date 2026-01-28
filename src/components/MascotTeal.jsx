import React from 'react';
import { motion } from 'framer-motion';

const MascotTeal = ({ isTalking, onClick }) => {
    return (
        <div
            className="mascot-container"
            onClick={onClick}
            style={{ height: '260px', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
            <svg width="450" height="260" viewBox="100 0 210 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="mascot_teal_body" x1="150" y1="50" x2="250" y2="150" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>

                    <mask id="mascot_teal_mouth_mask">
                        <rect x="0" y="0" width="400" height="200" fill="white" />
                        <motion.path
                            animate={isTalking ? {
                                d: [
                                    "M 175 125 Q 205 135 235 125 Q 235 125 205 125 Q 175 125 175 125",
                                    "M 175 125 Q 205 115 235 125 Q 235 155 205 155 Q 175 155 175 125",
                                    "M 175 125 Q 205 125 235 125 Q 235 135 205 135 Q 175 135 175 125",
                                    "M 175 125 Q 205 115 235 125 Q 235 155 205 155 Q 175 155 175 125"
                                ]
                            } : {
                                d: [
                                    "M 175 125 Q 205 135 235 125 Q 235 125 205 125 Q 175 125 175 125",
                                    "M 175 125 Q 205 115 235 125 Q 235 155 205 155 Q 175 155 175 125",
                                    "M 175 125 Q 205 115 235 125 Q 235 155 205 155 Q 175 155 175 125",
                                    "M 175 125 Q 205 135 235 125 Q 235 125 205 125 Q 175 125 175 125"
                                ]
                            }}
                            transition={isTalking ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } : {
                                duration: 1,
                                repeat: Infinity,
                                repeatDelay: 14,
                                times: [0, 0.2, 0.8, 1]
                            }}
                            fill="black"
                        />
                    </mask>
                </defs>

                <g>
                    {/* Legs with Feet: Turn red during Rage Mode */}
                    {/* Left Leg */}
                    <motion.path
                        d="M185 160 Q 185 180 170 180 Q 160 180 160 170 Q 160 165 170 160 L 180 155"
                        fill="#0d9488"
                        stroke="#0d9488"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                            fill: ["#0d9488", "#b91c1c", "#0d9488"],
                            stroke: ["#0d9488", "#b91c1c", "#0d9488"]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                    />
                    {/* Right Leg */}
                    <motion.path
                        d="M225 160 Q 225 180 240 180 Q 250 180 250 170 Q 250 165 240 160 L 230 155"
                        fill="#0d9488"
                        stroke="#0d9488"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                            fill: ["#0d9488", "#b91c1c", "#0d9488"],
                            stroke: ["#0d9488", "#b91c1c", "#0d9488"]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                    />

                    {/* Horns (Behind Body) */}
                    {/* Left Horn - Curved and Pointed */}
                    <path d="M 175 65 Q 160 30 178 35 L 185 65" fill="#0f766e" />
                    {/* Right Horn - Curved and Pointed */}
                    <path d="M 235 65 Q 250 30 232 35 L 225 65" fill="#0f766e" />

                    {/* Mouth Interior (Layered BEHIND Body) */}
                    <g>
                        {/* Dark Mouth Cavity */}
                        <path d="M 170 115 Q 205 115 240 115 Q 240 155 205 155 Q 170 155 170 115" fill="#1e1b4b" />

                        {/* Tongue - Animating */}
                        <motion.path
                            d="M 190 145 Q 205 135 220 145"
                            stroke="#f43f5e"
                            strokeWidth="10"
                            strokeLinecap="round"
                            animate={isTalking ? { d: ["M 190 145 Q 205 135 220 145", "M 190 140 Q 205 150 220 140", "M 190 145 Q 205 135 220 145"] } : {}}
                            transition={{ duration: 0.3, repeat: Infinity }}
                        />

                        {/* Teeth (Static, Upper and Lower) */}
                        {/* Upper Teeth */}
                        <path d="M 180 120 L 185 130 L 190 120" fill="white" strokeLinejoin="round" />
                        <path d="M 195 120 L 200 132 L 205 120" fill="white" strokeLinejoin="round" />
                        <path d="M 210 120 L 215 130 L 220 120" fill="white" strokeLinejoin="round" />

                        {/* Lower Teeth (Optional for more monster look, or keep just upper) - Let's stick to upper distinct ones as requested 'static' */}
                        <path d="M 225 120 L 230 133 L 235 120" fill="white" strokeLinejoin="round" />
                    </g>

                    {/* Body - Organic Pear Shape with Mouth Hole */}
                    <path
                        d="M 205 45 C 245 45 265 80 265 115 C 265 155 245 175 205 175 C 165 175 145 155 145 115 C 145 80 165 45 205 45 Z"
                        fill="url(#mascot_teal_body)"
                        mask="url(#mascot_teal_mouth_mask)"
                    />

                    {/* Single Large Eye */}
                    <g>
                        <motion.circle
                            cx="205" cy="85"
                            r="22"
                            fill="white"
                            stroke="#0f766e"
                            strokeWidth="2"
                        />
                        {/* Pupil */}
                        {/* Pupil Group with Glint */}
                        <motion.g
                            animate={{
                                x: [0, 3, -3, 0],
                                y: [0, -1, 1, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {/* Black Pupil */}
                            <circle cx="205" cy="85" r="10" fill="#1e1b4b" />
                            {/* White Glint (Reflection) */}
                            <circle cx="208" cy="82" r="3" fill="white" />
                        </motion.g>
                    </g>

                    {/* Arms with Hands - Hands on hips style */}
                    <g>
                        {/* Left Arm & Hand */}
                        <motion.path
                            d="M150 110 Q 130 125 155 140"
                            stroke="#0d9488"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            animate={isTalking ? { d: "M150 110 Q 120 90 135 60" } : { d: "M150 110 Q 130 125 155 140" }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.circle
                            r="6"
                            fill="#0d9488"
                            animate={isTalking ? { cx: 135, cy: 60 } : { cx: 155, cy: 140 }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* Right Arm & Hand */}
                        <motion.path
                            d="M260 110 Q 280 125 255 140"
                            stroke="#0d9488"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            animate={isTalking ? { d: "M260 110 Q 290 90 275 60" } : { d: "M260 110 Q 280 125 255 140" }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.circle
                            r="6"
                            fill="#0d9488"
                            animate={isTalking ? { cx: 275, cy: 60 } : { cx: 255, cy: 140 }}
                            transition={{ duration: 0.5 }}
                        />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default MascotTeal;
