import React from 'react';
import { motion } from 'framer-motion';

const MascotOriginal = ({ isTalking, onClick }) => {
    return (
        <div
            className="mascot-container"
            onClick={onClick}
            style={{ height: '260px', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
            <svg width="450" height="260" viewBox="70 0 270 195" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                    {/* Head gradient */}
                    <linearGradient id="hg" x1="155" y1="10" x2="260" y2="100" gradientUnits="userSpaceOnUse">
                        <motion.stop offset="0%" animate={{ stopColor: ["#6366f1", "#ef4444", "#6366f1"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#4f46e5", "#b91c1c", "#4f46e5"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </linearGradient>
                    <radialGradient id="hhl" cx="0.3" cy="0.22" r="0.72" fx="0.25" fy="0.18">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                        <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                    </radialGradient>
                    {/* Torso gradient */}
                    <linearGradient id="tg" x1="178" y1="92" x2="232" y2="142" gradientUnits="userSpaceOnUse">
                        <motion.stop offset="0%" animate={{ stopColor: ["#818cf8", "#f87171", "#818cf8"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#4338ca", "#991b1b", "#4338ca"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </linearGradient>
                    <radialGradient id="thl" cx="0.33" cy="0.22" r="0.75">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
                    </radialGradient>
                    {/* Arm gradients */}
                    <linearGradient id="al" x1="0" y1="0" x2="0" y2="1">
                        <motion.stop offset="0%" animate={{ stopColor: ["#a5b4fc", "#fca5a5", "#a5b4fc"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#3730a3", "#7f1d1d", "#3730a3"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </linearGradient>
                    <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
                        <motion.stop offset="0%" animate={{ stopColor: ["#c4b5fd", "#fca5a5", "#c4b5fd"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#5b21b6", "#7f1d1d", "#5b21b6"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </linearGradient>
                    {/* Leg gradient */}
                    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                        <motion.stop offset="0%" animate={{ stopColor: ["#818cf8", "#f87171", "#818cf8"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#3730a3", "#7f1d1d", "#3730a3"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </linearGradient>
                    {/* Joint metallic */}
                    <radialGradient id="jg" cx="0.33" cy="0.28" r="0.72">
                        <stop offset="0%" stopColor="#d4d4e8" />
                        <stop offset="50%" stopColor="#9191b0" />
                        <stop offset="100%" stopColor="#4a4a68" />
                    </radialGradient>
                    {/* Claw/hand */}
                    <radialGradient id="cg" cx="0.36" cy="0.3" r="0.68">
                        <stop offset="0%" stopColor="#b8b8d0" />
                        <stop offset="60%" stopColor="#7a7a98" />
                        <stop offset="100%" stopColor="#3e3e5a" />
                    </radialGradient>
                    {/* Foot */}
                    <radialGradient id="fg" cx="0.4" cy="0.28" r="0.72">
                        <stop offset="0%" stopColor="#a8a8c0" />
                        <stop offset="100%" stopColor="#4a4a68" />
                    </radialGradient>
                    {/* Sclera */}
                    <radialGradient id="sc" cx="0.38" cy="0.3" r="0.68">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="80%" stopColor="#ededf5" />
                        <stop offset="100%" stopColor="#d5d5e5" />
                    </radialGradient>
                    {/* Iris */}
                    <radialGradient id="il" cx="0.4" cy="0.36" r="0.6">
                        <motion.stop offset="0%" animate={{ stopColor: ["#4338ca", "#991b1b", "#4338ca"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#1e1b4b", "#450a0a", "#1e1b4b"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </radialGradient>
                    <radialGradient id="ir" cx="0.4" cy="0.36" r="0.6">
                        <motion.stop offset="0%" animate={{ stopColor: ["#4338ca", "#991b1b", "#4338ca"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#1e1b4b", "#450a0a", "#1e1b4b"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </radialGradient>
                    {/* Antenna orb */}
                    <radialGradient id="og" cx="0.36" cy="0.28" r="0.68">
                        <motion.stop offset="0%" animate={{ stopColor: ["#e0e7ff", "#fee2e2", "#e0e7ff"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["#6366f1", "#dc2626", "#6366f1"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </radialGradient>
                    {/* Core glow */}
                    <radialGradient id="crg" cx="0.5" cy="0.5" r="0.5">
                        <motion.stop offset="0%" animate={{ stopColor: ["#a5f3fc", "#fca5a5", "#a5f3fc"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="50%" animate={{ stopColor: ["#22d3ee", "#f87171", "#22d3ee"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                        <motion.stop offset="100%" animate={{ stopColor: ["rgba(34,211,238,0)", "rgba(248,113,113,0)", "rgba(34,211,238,0)"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }} />
                    </radialGradient>
                    {/* Visor */}
                    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                        <stop offset="50%" stopColor="rgba(0,0,0,0.48)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
                    </linearGradient>

                    {/* Filters */}
                    <filter id="gl" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="bv" x="-5%" y="-5%" width="110%" height="115%">
                        <feDropShadow dx="0" dy="1.5" stdDeviation="0.8" floodColor="rgba(0,0,0,0.35)" />
                    </filter>
                    <filter id="eg" x="-25%" y="-25%" width="150%" height="150%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
                        <feFlood floodColor="rgba(99,102,241,0.35)" result="c" />
                        <feComposite in="c" in2="b" operator="in" result="s" />
                        <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="cf" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>

                    {/* Mouth glow filter */}
                    <filter id="mg" x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <clipPath id="hc"><rect x="155" y="8" width="100" height="84" rx="22" /></clipPath>
                </defs>

                {/* ===== ROOT GROUP - grounded, dance animation ===== */}
                <motion.g
                    animate={isTalking ? {
                        rotate: [0, -1, 1, -0.5, 0]
                    } : {
                        /* Subtle idle sway - gentle, not a dance */
                        rotate: [0, 0, 0, 0, -1.5, 1.5, -2, 1.5, 0, 0, 0, 0, -1, 1.5, -2, 1, -0.8, 1, 0, 0],
                        x: [0, 0, 0, 0, -1.5, 1.5, -2, 2, 0, 0, 0, 0, 1.5, -2, 2, -2, 1, -1, 0, 0],
                        scaleY: [1, 1, 1, 1, 0.985, 1.01, 0.98, 1.01, 1, 1, 1, 1, 1.01, 0.985, 1.01, 0.985, 1.005, 0.995, 1, 1]
                    }}
                    transition={isTalking ? {
                        duration: 1.2, repeat: Infinity, ease: "easeInOut"
                    } : {
                        duration: 18, repeat: Infinity, ease: "easeInOut",
                        times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                    }}
                    style={{ originX: "205px", originY: "175px", willChange: 'transform' }}
                >
                    {/* ===== LEGS (short, thick, grounded) ===== */}
                    {/* Left Leg */}
                    <motion.g
                        animate={isTalking ? { rotate: [0, 0, 0] } : {
                            rotate: [0, 0, 0, 0, -2, 1, -2.5, 1.5, -0.5, 0, 0, 0, 1, -1.5, 1, -1, 0.5, -0.5, 0, 0]
                        }}
                        transition={{
                            duration: 18, repeat: Infinity, ease: "easeInOut",
                            times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                        }}
                        style={{ originX: "192px", originY: "140px" }}
                    >
                        {/* Hip joint */}
                        <circle cx="192" cy="140" r="9" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="190" cy="138" r="3" fill="rgba(255,255,255,0.28)" />
                        <circle cx="192" cy="140" r="3.5" fill="#4a4a68" />
                        <path d="M190 140 L194 140 M192 138 L192 142" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

                        {/* Thigh - very thick and short */}
                        <rect x="181" y="147" width="22" height="14" rx="7" fill="url(#lg)" filter="url(#bv)" />
                        <rect x="183" y="148" width="9" height="12" rx="4" fill="rgba(255,255,255,0.12)" />
                        <rect x="202" y="149" width="3" height="10" rx="1.5" fill="#6b7280" />

                        {/* Knee joint */}
                        <circle cx="192" cy="163" r="8" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="190" cy="161" r="2.5" fill="rgba(255,255,255,0.3)" />
                        <circle cx="192" cy="163" r="3" fill="#4a4a68" />

                        {/* Shin - very short */}
                        <rect x="183" y="169" width="18" height="8" rx="5" fill="url(#lg)" filter="url(#bv)" />

                        {/* Foot - wide flat plate on the ground */}
                        <path d="M176 176 L208 176 L210 179 Q210 184 206 184 L178 184 Q174 184 174 179 Z" fill="url(#fg)" filter="url(#bv)" />
                        <path d="M178 177 L206 177 L207 179 Q207 180 205 180 L179 180 Q177 180 177 179 Z" fill="rgba(255,255,255,0.14)" />
                        <line x1="182" y1="181.5" x2="202" y2="181.5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
                        <line x1="180" y1="183" x2="204" y2="183" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
                    </motion.g>

                    {/* Right Leg */}
                    <motion.g
                        animate={isTalking ? { rotate: [0, 0, 0] } : {
                            rotate: [0, 0, 0, 0, 1.5, -2, 2, -2.5, 0.5, 0, 0, 0, -1, 1.5, -1, 1, -0.5, 0.5, 0, 0]
                        }}
                        transition={{
                            duration: 18, repeat: Infinity, ease: "easeInOut",
                            times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                        }}
                        style={{ originX: "218px", originY: "140px" }}
                    >
                        <circle cx="218" cy="140" r="9" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="216" cy="138" r="3" fill="rgba(255,255,255,0.28)" />
                        <circle cx="218" cy="140" r="3.5" fill="#4a4a68" />
                        <path d="M216 140 L220 140 M218 138 L218 142" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

                        <rect x="207" y="147" width="22" height="14" rx="7" fill="url(#lg)" filter="url(#bv)" />
                        <rect x="209" y="148" width="9" height="12" rx="4" fill="rgba(255,255,255,0.12)" />
                        <rect x="205" y="149" width="3" height="10" rx="1.5" fill="#6b7280" />

                        <circle cx="218" cy="163" r="8" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="216" cy="161" r="2.5" fill="rgba(255,255,255,0.3)" />
                        <circle cx="218" cy="163" r="3" fill="#4a4a68" />

                        <rect x="209" y="169" width="18" height="8" rx="5" fill="url(#lg)" filter="url(#bv)" />

                        <path d="M202 176 L234 176 L236 179 Q236 184 232 184 L204 184 Q200 184 200 179 Z" fill="url(#fg)" filter="url(#bv)" />
                        <path d="M204 177 L232 177 L233 179 Q233 180 231 180 L205 180 Q203 180 203 179 Z" fill="rgba(255,255,255,0.14)" />
                        <line x1="208" y1="181.5" x2="228" y2="181.5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
                        <line x1="206" y1="183" x2="230" y2="183" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
                    </motion.g>

                    {/* ===== TORSO (compact barrel) ===== */}
                    <motion.g
                        animate={{ scaleY: [1, 1.012, 1, 0.992, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ originX: "205px", originY: "118px" }}
                    >
                        {/* Shadow */}
                        <rect x="178" y="96" width="54" height="46" rx="14" fill="rgba(0,0,0,0.18)" transform="translate(2,2)" />
                        {/* Base */}
                        <rect x="178" y="96" width="54" height="46" rx="14" fill="url(#tg)" />
                        <rect x="178" y="96" width="54" height="46" rx="14" fill="url(#thl)" style={{ pointerEvents: 'none' }} />

                        {/* Chest plate */}
                        <rect x="185" y="100" width="40" height="36" rx="8" fill="rgba(0,0,0,0.12)" />
                        <rect x="186" y="101" width="38" height="34" rx="7" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                        <line x1="205" y1="102" x2="205" y2="134" stroke="rgba(0,0,0,0.06)" strokeWidth="0.4" />
                        <line x1="187" y1="118" x2="223" y2="118" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />

                        {/* AI Core */}
                        <motion.circle cx="205" cy="118" r="10" fill="url(#crg)" filter="url(#cf)"
                            animate={{ r: [9, 11, 9], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.circle cx="205" cy="118" r="6" fill="none" strokeWidth="1"
                            animate={{ r: [6, 9, 6], opacity: [0.4, 0, 0.4], stroke: ["#67e8f9", "#fca5a5", "#67e8f9"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.circle cx="205" cy="118" r="4"
                            animate={{ fill: ["#22d3ee", "#f87171", "#22d3ee"] }}
                            transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                        />
                        <circle cx="203.5" cy="116.5" r="1.5" fill="rgba(255,255,255,0.5)" />
                        <circle cx="205" cy="118" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />

                        {/* Circuit traces */}
                        <motion.path d="M217 118 L224 118 L224 112 L230 112" stroke="rgba(103,232,249,0.3)" strokeWidth="0.6" strokeLinecap="round" fill="none"
                            animate={{ opacity: [0.12, 0.4, 0.12], pathLength: [0.3, 1, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.path d="M193 118 L186 118 L186 124 L180 124" stroke="rgba(103,232,249,0.3)" strokeWidth="0.6" strokeLinecap="round" fill="none"
                            animate={{ opacity: [0.12, 0.4, 0.12], pathLength: [0.3, 1, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />

                        {/* Side vents */}
                        {[0, 1, 2].map(i => (
                            <g key={`v${i}`}>
                                <rect x="179" y={103 + i * 10} width="5" height="3" rx="1.5" fill="rgba(0,0,0,0.22)" />
                                <rect x="226" y={103 + i * 10} width="5" height="3" rx="1.5" fill="rgba(0,0,0,0.22)" />
                            </g>
                        ))}

                        {/* Corner bolts */}
                        {[[181, 99], [228, 99], [181, 138], [228, 138]].map(([bx, by], i) => (
                            <g key={`tb${i}`}>
                                <circle cx={bx} cy={by} r="2.5" fill="url(#jg)" />
                                <circle cx={bx} cy={by} r="1.2" fill="#3e3e56" />
                                <circle cx={bx - 0.5} cy={by - 0.5} r="0.6" fill="rgba(255,255,255,0.2)" />
                            </g>
                        ))}
                    </motion.g>

                    {/* ===== NECK (mechanical accordion) ===== */}
                    <g>
                        {/* Central pipe */}
                        <rect x="198" y="87" width="14" height="14" rx="3" fill="url(#jg)" filter="url(#bv)" />
                        <rect x="200" y="88" width="10" height="12" rx="2" fill="#6b7280" />
                        <rect x="201" y="88" width="4" height="12" rx="1" fill="rgba(255,255,255,0.12)" />
                        {/* Accordion rings */}
                        <ellipse cx="205" cy="88" rx="12" ry="3.5" fill="url(#jg)" />
                        <ellipse cx="205" cy="88" rx="10" ry="2.2" fill="#6b7280" />
                        <ellipse cx="205" cy="88" rx="7" ry="1.2" fill="rgba(255,255,255,0.08)" />
                        <ellipse cx="205" cy="93" rx="10" ry="2.8" fill="url(#jg)" />
                        <ellipse cx="205" cy="93" rx="8" ry="1.6" fill="#6b7280" />
                        <ellipse cx="205" cy="98" rx="12" ry="3.5" fill="url(#jg)" />
                        <ellipse cx="205" cy="98" rx="10" ry="2.2" fill="#6b7280" />
                        <ellipse cx="205" cy="98" rx="7" ry="1.2" fill="rgba(255,255,255,0.08)" />
                        {/* Side cables */}
                        <path d="M193 88 Q189 93 193 98" stroke="#4a4a68" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        <path d="M217 88 Q221 93 217 98" stroke="#4a4a68" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        <path d="M193 88 Q188 93 193 98" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" strokeLinecap="round" />
                        <path d="M217 88 Q222 93 217 98" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" strokeLinecap="round" />
                        {/* Small bolts on rings */}
                        <circle cx="194" cy="88" r="1.3" fill="url(#jg)" />
                        <circle cx="216" cy="88" r="1.3" fill="url(#jg)" />
                        <circle cx="194" cy="98" r="1.3" fill="url(#jg)" />
                        <circle cx="216" cy="98" r="1.3" fill="url(#jg)" />
                        {/* Pulsing energy line through neck */}
                        <motion.line x1="205" y1="88" x2="205" y2="98" strokeWidth="1.5" strokeLinecap="round"
                            animate={{ stroke: ["rgba(103,232,249,0.3)", "rgba(167,139,250,0.5)", "rgba(103,232,249,0.3)"], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </g>

                    {/* ===== HEAD (big monitor screen) ===== */}
                    <motion.g
                        animate={isTalking ? {
                            rotate: [0, -2, 2, -1.5, 1, 0]
                        } : {
                            /* Gentle head tilt and sway */
                            rotate: [0, 0, 0, 0, -3, 3, -3.5, 3.5, 0, 0, 0, 0, -1.5, 2, -2, 1.5, -1, 1.5, 0, 0],
                            scaleX: [1, 1, 1, 1, 0.99, 1.01, 0.985, 1.01, 1, 1, 1, 1, 1.01, 0.99, 1.01, 0.99, 1.005, 0.995, 1, 1]
                        }}
                        transition={isTalking ? {
                            duration: 1, repeat: Infinity, ease: "easeInOut"
                        } : {
                            duration: 18, repeat: Infinity, ease: "easeInOut",
                            times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                        }}
                        style={{ originX: "205px", originY: "55px", willChange: 'transform' }}
                    >
                        {/* Head shadow */}
                        <rect x="157" y="10" width="100" height="84" rx="22" fill="rgba(0,0,0,0.2)" transform="translate(3,3)" />
                        {/* Head base */}
                        <rect x="155" y="8" width="100" height="84" rx="22" fill="url(#hg)" />
                        {/* 3D highlight */}
                        <rect x="155" y="8" width="100" height="84" rx="22" fill="url(#hhl)" style={{ pointerEvents: 'none' }} />

                        {/* Screen bezel */}
                        <rect x="158" y="11" width="94" height="78" rx="19" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />

                        {/* Visor band - dark eye housing */}
                        <rect x="163" y="26" width="84" height="35" rx="12" fill="url(#vg)" />
                        <rect x="164" y="27" width="82" height="33" rx="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />

                        {/* CRT scan lines */}
                        <g clipPath="url(#hc)" style={{ pointerEvents: 'none' }}>
                            <motion.rect x="155" y="0" width="100" height="2" fill="rgba(255,255,255,0.04)"
                                animate={{ y: [0, 92, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            />
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => (
                                <line key={`s${i}`} x1="155" y1={12 + i * 6} x2="255" y2={12 + i * 6} stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
                            ))}
                            {/* Rim light */}
                            <motion.path d="M158 28 Q154 50 158 78" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" fill="none"
                                animate={{ opacity: [0.12, 0.28, 0.12] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </g>

                        {/* Head bolts */}
                        {[[159, 14], [249, 14], [159, 84], [249, 84]].map(([bx, by], i) => (
                            <g key={`hb${i}`}>
                                <circle cx={bx} cy={by} r="3" fill="url(#jg)" filter="url(#bv)" />
                                <circle cx={bx} cy={by} r="1.5" fill="#3e3e56" />
                                <circle cx={bx - 0.5} cy={by - 0.5} r="0.8" fill="rgba(255,255,255,0.2)" />
                            </g>
                        ))}

                        {/* Power LED */}
                        <motion.circle cx="247" cy="80" r="1.8"
                            animate={{ fill: ["#4ade80", "#4ade80", "#86efac", "#4ade80"], opacity: [0.7, 0.7, 1, 0.7] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />

                        {/* Visor screws */}
                        <circle cx="168" cy="43" r="1.8" fill="url(#jg)" />
                        <circle cx="168" cy="43" r="0.7" fill="rgba(0,0,0,0.3)" />
                        <circle cx="242" cy="43" r="1.8" fill="url(#jg)" />
                        <circle cx="242" cy="43" r="0.7" fill="rgba(0,0,0,0.3)" />

                        {/* ===== DIGITAL MOUTH (screen display) ===== */}
                        {/* Mouth display panel - animates size with expressions */}
                        <motion.rect
                            rx="8"
                            fill="rgba(0,0,0,0.25)"
                            animate={isTalking ? {
                                x: [183, 181, 183, 180, 183],
                                y: [64, 62, 64, 61, 64],
                                width: [44, 48, 44, 50, 44],
                                height: [22, 26, 22, 28, 22]
                            } : {
                                x: [185, 185, 185, 182, 185, 185, 184, 185, 183, 185],
                                y: [66, 66, 66, 63, 66, 66, 65, 66, 64, 66],
                                width: [40, 40, 40, 46, 40, 40, 42, 40, 44, 40],
                                height: [20, 20, 20, 26, 20, 20, 22, 20, 24, 20]
                            }}
                            transition={isTalking ? {
                                duration: 0.6, repeat: Infinity, ease: "easeInOut"
                            } : {
                                duration: 20, repeat: Infinity, ease: "easeInOut",
                                times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1]
                            }}
                        />
                        <motion.rect
                            rx="7" fill="none" strokeWidth="0.4"
                            stroke="rgba(255,255,255,0.06)"
                            animate={isTalking ? {
                                x: [184, 182, 184, 181, 184],
                                y: [65, 63, 65, 62, 65],
                                width: [42, 46, 42, 48, 42],
                                height: [20, 24, 20, 26, 20]
                            } : {
                                x: [186, 186, 186, 183, 186, 186, 185, 186, 184, 186],
                                y: [67, 67, 67, 64, 67, 67, 66, 67, 65, 67],
                                width: [38, 38, 38, 44, 38, 38, 40, 38, 42, 38],
                                height: [18, 18, 18, 24, 18, 18, 20, 18, 22, 18]
                            }}
                            transition={isTalking ? {
                                duration: 0.6, repeat: Infinity, ease: "easeInOut"
                            } : {
                                duration: 20, repeat: Infinity, ease: "easeInOut",
                                times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1]
                            }}
                        />

                        {isTalking ? (
                            /* === TALKING: Audio equalizer + waveform === */
                            <g filter="url(#mg)">
                                {/* Expanding glow ring behind bars */}
                                <motion.ellipse cx="205" cy="76" fill="none" strokeWidth="1"
                                    animate={{
                                        rx: [12, 22, 12], ry: [6, 12, 6],
                                        opacity: [0.2, 0, 0.2],
                                        stroke: ["#67e8f9", "#a78bfa", "#67e8f9"]
                                    }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
                                />
                                {/* Equalizer bars */}
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                    <motion.rect
                                        key={`eq${i}`}
                                        x={189 + i * 3.2}
                                        rx="1"
                                        width="2.2"
                                        fill={i <= 2 ? "#67e8f9" : i <= 4 ? "#818cf8" : i <= 6 ? "#a78bfa" : i <= 8 ? "#818cf8" : "#67e8f9"}
                                        animate={{
                                            height: [2, 5 + (i % 3) * 5, 1.5, 7 + (i % 4) * 4, 3, 9 + (i % 2) * 3, 2.5, 6 + (i % 3) * 3, 2],
                                            y: [76 - 1, 76 - (5 + (i % 3) * 5) / 2, 76 - 0.75, 76 - (7 + (i % 4) * 4) / 2, 76 - 1.5, 76 - (9 + (i % 2) * 3) / 2, 76 - 1.25, 76 - (6 + (i % 3) * 3) / 2, 76 - 1],
                                            opacity: [0.6, 1, 0.5, 1, 0.55, 1, 0.6, 0.9, 0.6]
                                        }}
                                        transition={{
                                            duration: 0.28 + (i % 4) * 0.06,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.03
                                        }}
                                    />
                                ))}
                                {/* Waveform overlay line */}
                                <motion.path
                                    fill="none" strokeWidth="1" strokeLinecap="round"
                                    animate={{
                                        d: [
                                            "M 188 76 Q 193 70 198 76 Q 203 82 205 76 Q 207 70 212 76 Q 217 82 222 76",
                                            "M 188 76 Q 193 82 198 76 Q 203 70 205 76 Q 207 82 212 76 Q 217 70 222 76",
                                            "M 188 76 Q 193 68 198 76 Q 203 84 205 76 Q 207 68 212 76 Q 217 84 222 76",
                                            "M 188 76 Q 193 82 198 76 Q 203 70 205 76 Q 207 82 212 76 Q 217 70 222 76"
                                        ],
                                        stroke: ["rgba(103,232,249,0.4)", "rgba(167,139,250,0.5)", "rgba(103,232,249,0.5)", "rgba(167,139,250,0.4)"],
                                        opacity: [0.3, 0.5, 0.4, 0.3]
                                    }}
                                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </g>
                        ) : (
                            /* === IDLE: Expressive digital mouth === */
                            <g filter="url(#mg)">
                                {/* Glow aura behind smile */}
                                <motion.ellipse cx="205" cy="76"
                                    fill="rgba(103,232,249,0.06)"
                                    animate={{
                                        rx: [14, 14, 14, 18, 14, 14, 16, 14, 20, 14],
                                        ry: [5, 5, 5, 10, 5, 5, 6, 5, 8, 5],
                                        fill: [
                                            "rgba(103,232,249,0.06)", "rgba(103,232,249,0.06)", "rgba(103,232,249,0.06)",
                                            "rgba(167,139,250,0.1)", "rgba(103,232,249,0.06)",
                                            "rgba(103,232,249,0.06)", "rgba(52,211,153,0.1)", "rgba(103,232,249,0.06)",
                                            "rgba(244,114,182,0.1)", "rgba(103,232,249,0.06)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 20, repeat: Infinity, ease: "easeInOut",
                                        times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1]
                                    }}
                                />

                                {/* Main expressive mouth shape - 10 states */}
                                <motion.path
                                    animate={{
                                        d: [
                                            /* 0: Normal wavy smile */
                                            "M 192 74 Q 196 71 200 74 Q 205 77 210 74 Q 214 71 218 74",
                                            /* 1: Hold smile */
                                            "M 192 74 Q 196 71 200 74 Q 205 77 210 74 Q 214 71 218 74",
                                            /* 2: Small smirk - asymmetric */
                                            "M 192 76 Q 196 74 200 75 Q 205 76 210 73 Q 214 70 218 72",
                                            /* 3: Big happy grin */
                                            "M 188 76 Q 196 70 205 76 Q 214 70 222 76",
                                            /* 4: Return */
                                            "M 192 74 Q 196 71 200 74 Q 205 77 210 74 Q 214 71 218 74",
                                            /* 5: Back to smile */
                                            "M 192 74 Q 196 71 200 74 Q 205 77 210 74 Q 214 71 218 74",
                                            /* 6: ZIGZAG glitch */
                                            "M 189 76 L 193 70 L 197 80 L 201 70 L 205 80 L 209 70 L 213 80 L 217 70 L 221 76",
                                            /* 7: Return */
                                            "M 192 74 Q 196 71 200 74 Q 205 77 210 74 Q 214 71 218 74",
                                            /* 8: Wobbly confused - wiggly wave */
                                            "M 190 75 Q 194 78 198 72 Q 202 78 205 72 Q 208 78 212 72 Q 216 78 220 75",
                                            /* 9: Back to normal */
                                            "M 192 74 Q 196 71 200 74 Q 205 77 210 74 Q 214 71 218 74"
                                        ],
                                        stroke: [
                                            "#67e8f9", "#67e8f9", "#818cf8",
                                            "#a78bfa",
                                            "#67e8f9",
                                            "#67e8f9",
                                            "#34d399",
                                            "#67e8f9",
                                            "#f0abfc",
                                            "#67e8f9"
                                        ],
                                        strokeWidth: [
                                            2.2, 2.2, 2.2,
                                            2.8,
                                            2.2,
                                            2.2,
                                            2.5,
                                            2.2,
                                            2.4,
                                            2.2
                                        ]
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1],
                                        ease: "easeInOut"
                                    }}
                                    strokeLinecap="round"
                                    fill="none"
                                />

                                {/* Filled shape for grin */}
                                <motion.path
                                    animate={{
                                        d: [
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 188 76 Q 196 68 205 72 Q 214 68 222 76 Q 214 80 205 78 Q 196 80 188 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76",
                                            "M 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76 Q 205 76 205 76"
                                        ],
                                        fill: [
                                            "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)",
                                            "rgba(167,139,250,0.12)",
                                            "rgba(0,0,0,0)",
                                            "rgba(0,0,0,0)", "rgba(0,0,0,0)",
                                            "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 20, repeat: Infinity,
                                        times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1],
                                        ease: "easeInOut"
                                    }}
                                    stroke="none"
                                />

                                {/* Corner expression marks */}
                                <motion.circle r="1.2"
                                    animate={{
                                        cx: [191, 191, 191, 187, 191, 191, 188, 191, 189, 191],
                                        cy: [74, 74, 74, 76, 74, 74, 76, 74, 75, 74],
                                        fill: ["#67e8f9", "#67e8f9", "#818cf8", "#a78bfa", "#67e8f9", "#67e8f9", "#34d399", "#67e8f9", "#f0abfc", "#67e8f9"],
                                        opacity: [0.6, 0.6, 0.7, 0.9, 0.6, 0.6, 0.7, 0.6, 0.8, 0.6],
                                        r: [1.2, 1.2, 1.3, 1.6, 1.2, 1.2, 1, 1.2, 1.4, 1.2]
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1], ease: "easeInOut" }}
                                />
                                <motion.circle r="1.2"
                                    animate={{
                                        cx: [219, 219, 219, 223, 219, 219, 222, 219, 221, 219],
                                        cy: [74, 74, 72, 76, 74, 74, 76, 74, 75, 74],
                                        fill: ["#67e8f9", "#67e8f9", "#818cf8", "#a78bfa", "#67e8f9", "#67e8f9", "#34d399", "#67e8f9", "#f0abfc", "#67e8f9"],
                                        opacity: [0.6, 0.6, 0.7, 0.9, 0.6, 0.6, 0.7, 0.6, 0.8, 0.6],
                                        r: [1.2, 1.2, 1.3, 1.6, 1.2, 1.2, 1, 1.2, 1.4, 1.2]
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1], ease: "easeInOut" }}
                                />

                                {/* Zigzag sparkle dots */}
                                {[0, 1, 2, 3].map(i => (
                                    <motion.circle key={`zd${i}`} r="1"
                                        cx={192 + i * 8} cy={i % 2 === 0 ? 68 : 82}
                                        animate={{
                                            opacity: [0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0],
                                            r: [0, 0, 0, 0, 0, 0, 1.5, 0, 0, 0],
                                            fill: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "#34d399", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"]
                                        }}
                                        transition={{ duration: 20, repeat: Infinity, times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1], ease: "easeInOut" }}
                                    />
                                ))}

                                {/* Confused question marks during wobbly expression */}
                                <motion.text x="224" y="70" fontSize="6" fontFamily="monospace" fill="#f0abfc"
                                    animate={{
                                        opacity: [0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0],
                                        y: [70, 70, 70, 70, 70, 70, 70, 70, 66, 70]
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, times: [0, 0.10, 0.22, 0.30, 0.40, 0.50, 0.62, 0.74, 0.86, 1], ease: "easeInOut" }}
                                >?</motion.text>
                            </g>
                        )}

                        {/* ===== EYES ===== */}
                        <g filter="url(#eg)">
                            {/* Left eye (smaller) */}
                            <g>
                                <motion.ellipse cx="190" cy="44" fill="rgba(0,0,0,0.18)"
                                    animate={{ rx: [12, 12, 12], ry: [11, 6, 11] }}
                                    transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" }}
                                />
                                <motion.circle cx="190" cy="43"
                                    animate={{ r: [11, 6, 11], fill: ["url(#sc)", "#0a0a12", "url(#sc)"] }}
                                    transition={{ r: { duration: 0.7, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" }, fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] } }}
                                />
                                <motion.circle cy="43"
                                    animate={{ cx: [190, 192, 188, 190], cy: [43, 42, 44, 43], r: [5, 3, 5] }}
                                    transition={{ cx: { duration: 5, repeat: Infinity, ease: "easeInOut" }, cy: { duration: 5, repeat: Infinity, ease: "easeInOut" }, r: { duration: 0.7, repeat: Infinity, repeatDelay: 11 } }}
                                    fill="url(#il)"
                                />
                                <motion.circle cy="43"
                                    animate={{ cx: [190, 192, 188, 190], r: [2.2, 1, 2.2] }}
                                    transition={{ cx: { duration: 5, repeat: Infinity, ease: "easeInOut" }, r: { duration: 0.7, repeat: Infinity, repeatDelay: 11 } }}
                                    fill="#000"
                                />
                                <motion.circle cx="187" cy="39" r="2.8" fill="rgba(255,255,255,0.65)"
                                    animate={{ opacity: [0.65, 0, 0.65] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 11 }}
                                />
                                <motion.circle cx="192" cy="46" r="1.3" fill="rgba(255,255,255,0.3)"
                                    animate={{ opacity: [0.3, 0, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 11 }}
                                />
                            </g>
                            {/* Right eye (bigger) */}
                            <g>
                                <motion.ellipse cx="222" cy="44" fill="rgba(0,0,0,0.18)"
                                    animate={{ rx: [15, 15, 15], ry: [14, 7, 14] }}
                                    transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" }}
                                />
                                <motion.circle cx="222" cy="43"
                                    animate={{ r: [14, 7, 14], fill: ["url(#sc)", "#0a0a12", "url(#sc)"] }}
                                    transition={{ r: { duration: 0.7, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" }, fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] } }}
                                />
                                <motion.circle cy="43"
                                    animate={{ cx: [222, 224, 220, 222], cy: [43, 42, 44, 43], r: [6, 3.5, 6] }}
                                    transition={{ cx: { duration: 5, repeat: Infinity, ease: "easeInOut" }, cy: { duration: 5, repeat: Infinity, ease: "easeInOut" }, r: { duration: 0.7, repeat: Infinity, repeatDelay: 11 } }}
                                    fill="url(#ir)"
                                />
                                <motion.circle cy="43"
                                    animate={{ cx: [222, 224, 220, 222], r: [2.8, 1.4, 2.8] }}
                                    transition={{ cx: { duration: 5, repeat: Infinity, ease: "easeInOut" }, r: { duration: 0.7, repeat: Infinity, repeatDelay: 11 } }}
                                    fill="#000"
                                />
                                <motion.circle cx="219" cy="38" r="3.5" fill="rgba(255,255,255,0.65)"
                                    animate={{ opacity: [0.65, 0, 0.65] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 11 }}
                                />
                                <motion.circle cx="225" cy="47" r="1.8" fill="rgba(255,255,255,0.3)"
                                    animate={{ opacity: [0.3, 0, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 11 }}
                                />
                            </g>
                        </g>

                        {/* ===== ANTENNA (single, with wifi) ===== */}
                        <motion.g
                            animate={{ rotate: [0, 3, -2, 1, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            style={{ originX: "205px", originY: "8px" }}
                        >
                            <motion.path d="M205 8 L205 -5 L201 -14" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                animate={{ stroke: ["#6366f1", "#ef4444", "#6366f1"] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />
                            <path d="M206 7 L206 -4 L202 -13" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="rgba(255,255,255,0.22)" />
                            <circle cx="205" cy="-5" r="2.8" fill="url(#jg)" />
                            <circle cx="201" cy="-14" r="8" fill="url(#og)" filter="url(#gl)" />
                            <circle cx="199" cy="-16" r="3" fill="rgba(255,255,255,0.4)" />
                            <motion.circle cx="201" cy="-14" r="8" fill="none" strokeWidth="1.5"
                                animate={{ r: [8, 14, 8], opacity: [0.4, 0, 0.4], stroke: ["#a78bfa", "#f87171", "#a78bfa"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                            />
                            {/* Wifi arcs */}
                            <motion.path d="M194 -18 Q191 -24 194 -30" fill="none" strokeWidth="2" strokeLinecap="round"
                                animate={{ opacity: [0, 0.5, 0], stroke: ["#818cf8", "#f87171", "#818cf8"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            />
                            <motion.path d="M191 -16 Q187 -24 191 -34" fill="none" strokeWidth="2" strokeLinecap="round"
                                animate={{ opacity: [0, 0.4, 0], stroke: ["#818cf8", "#f87171", "#818cf8"] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
                            />
                            <motion.path d="M188 -14 Q183 -24 188 -38" fill="none" strokeWidth="2" strokeLinecap="round"
                                animate={{ opacity: [0, 0.3, 0], stroke: ["#818cf8", "#f87171", "#818cf8"] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
                            />
                            {/* Sparks */}
                            <motion.path d="M195 -14 L208 -30 L199 -10 L212 -26 L206 -10" stroke="#f87171" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0, 1, 0, 1, 0], scale: [0.8, 1.2, 0.8, 1.2, 0.8, 1.2, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 28, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1] }}
                                filter="url(#gl)"
                            />
                            <motion.path d="M195 -14 L203 -24 L209 -8 L215 -22 L211 -10" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0.4, 1, 0], scale: [0.8, 1.1, 0.9, 1.1, 0.8], pathLength: [0, 1, 0.8, 1, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 9.4, times: [0, 0.2, 0.4, 0.6, 1] }}
                                filter="url(#gl)"
                            />
                        </motion.g>
                    </motion.g>

                    {/* ===== ARMS (short, very thick) ===== */}
                    {/* Left Arm */}
                    <motion.g
                        animate={isTalking ? {
                            rotate: [-65, -85, -60, -80, -65]
                        } : {
                            /* Gentle arm sway */
                            rotate: [-68, -68, -68, -68, -74, -62, -76, -60, -68, -68, -68, -68, -63, -73, -61, -75, -65, -70, -68, -68]
                        }}
                        transition={isTalking ? {
                            duration: 2.5, repeat: Infinity, ease: "easeInOut"
                        } : {
                            duration: 18, repeat: Infinity, ease: "easeInOut",
                            times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                        }}
                        style={{ originX: "172px", originY: "108px" }}
                    >
                        {/* Shoulder */}
                        <circle cx="172" cy="108" r="12" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="172" cy="108" r="8.5" fill="url(#jg)" />
                        <circle cx="169.5" cy="105" r="3.2" fill="rgba(255,255,255,0.25)" />
                        <circle cx="172" cy="108" r="3.5" fill="#4a4a68" />
                        <path d="M169.5 108 L174.5 108 M172 105.5 L172 110.5" stroke="rgba(255,255,255,0.16)" strokeWidth="0.7" />

                        {/* Upper arm - VERY thick and short */}
                        <rect x="149" y="97" width="22" height="22" rx="8" fill="url(#al)" filter="url(#bv)" />
                        <rect x="151" y="98.5" width="18" height="8" rx="4" fill="rgba(255,255,255,0.13)" />
                        <line x1="152" y1="113" x2="168" y2="113" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                        {/* Piston */}
                        <rect x="153" y="118" width="12" height="2.8" rx="1.4" fill="#6b7280" />
                        <rect x="153.5" y="118.4" width="5" height="1.2" rx="0.6" fill="rgba(255,255,255,0.2)" />
                        {/* LED */}
                        <motion.circle cx="160" cy="102" r="1.2"
                            animate={{ fill: ["#818cf8", "#c4b5fd", "#818cf8"], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Elbow */}
                        <circle cx="149" cy="108" r="10" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="149" cy="108" r="7" fill="#6b7280" />
                        <circle cx="147" cy="105.5" r="2.5" fill="rgba(255,255,255,0.28)" />
                        <circle cx="149" cy="108" r="3" fill="#3e3e56" />
                        <circle cx="149" cy="108" r="8.5" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />

                        {/* Forearm - also very thick and short */}
                        <motion.g
                            animate={isTalking ? {
                                rotate: [0, -15, 5, -10, 0]
                            } : {
                                rotate: [-8, -8, -8, -8, -4, -12, -3, -13, -8, -8, -8, -8, -12, -4, -13, -3, -10, -6, -8, -8]
                            }}
                            transition={isTalking ? {
                                duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2
                            } : {
                                duration: 18, repeat: Infinity, ease: "easeInOut",
                                times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                            }}
                            style={{ originX: "149px", originY: "108px" }}
                        >
                            <rect x="130" y="98" width="20" height="20" rx="7" fill="url(#al)" filter="url(#bv)" />
                            <rect x="132" y="99.5" width="16" height="7" rx="3.5" fill="rgba(255,255,255,0.11)" />

                            {/* Wrist */}
                            <circle cx="130" cy="108" r="7.5" fill="url(#jg)" filter="url(#bv)" />
                            <circle cx="130" cy="108" r="5" fill="#6b7280" />
                            <circle cx="128.5" cy="106" r="1.8" fill="rgba(255,255,255,0.25)" />
                            <circle cx="130" cy="108" r="2" fill="#3e3e56" />

                            {/* HAND with attached fingers */}
                            <circle cx="121" cy="108" r="9" fill="url(#cg)" filter="url(#bv)" />
                            <circle cx="119" cy="105" r="3" fill="rgba(255,255,255,0.14)" />
                            {/* Top finger - nub attached to palm */}
                            <ellipse cx="113" cy="99" rx="4.5" ry="3.5" fill="url(#cg)" transform="rotate(-25,113,99)" filter="url(#bv)" />
                            <circle cx="112" cy="98" r="1" fill="rgba(255,255,255,0.15)" />
                            {/* Middle finger */}
                            <ellipse cx="111" cy="108" rx="5" ry="3.8" fill="url(#cg)" filter="url(#bv)" />
                            <circle cx="109.5" cy="107" r="1.2" fill="rgba(255,255,255,0.15)" />
                            {/* Bottom finger */}
                            <ellipse cx="113" cy="117" rx="4.5" ry="3.5" fill="url(#cg)" transform="rotate(25,113,117)" filter="url(#bv)" />
                            <circle cx="112" cy="118" r="1" fill="rgba(255,255,255,0.15)" />
                            {/* Finger joints (small circles connecting to palm) */}
                            <circle cx="116" cy="101" r="1.8" fill="url(#jg)" />
                            <circle cx="115" cy="108" r="2" fill="url(#jg)" />
                            <circle cx="116" cy="115" r="1.8" fill="url(#jg)" />
                        </motion.g>
                    </motion.g>

                    {/* Right Arm */}
                    <motion.g
                        animate={isTalking ? {
                            rotate: [65, 85, 60, 80, 65]
                        } : {
                            /* Gentle arm sway (mirror) */
                            rotate: [68, 68, 68, 68, 62, 74, 60, 76, 68, 68, 68, 68, 73, 63, 75, 61, 65, 70, 68, 68]
                        }}
                        transition={isTalking ? {
                            duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.1
                        } : {
                            duration: 18, repeat: Infinity, ease: "easeInOut",
                            times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                        }}
                        style={{ originX: "238px", originY: "108px" }}
                    >
                        {/* Shoulder */}
                        <circle cx="238" cy="108" r="12" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="238" cy="108" r="8.5" fill="url(#jg)" />
                        <circle cx="240.5" cy="105" r="3.2" fill="rgba(255,255,255,0.25)" />
                        <circle cx="238" cy="108" r="3.5" fill="#4a4a68" />
                        <path d="M235.5 108 L240.5 108 M238 105.5 L238 110.5" stroke="rgba(255,255,255,0.16)" strokeWidth="0.7" />

                        {/* Upper arm */}
                        <rect x="239" y="97" width="22" height="22" rx="8" fill="url(#ar)" filter="url(#bv)" />
                        <rect x="241" y="98.5" width="18" height="8" rx="4" fill="rgba(255,255,255,0.13)" />
                        <line x1="242" y1="113" x2="258" y2="113" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                        <rect x="245" y="118" width="12" height="2.8" rx="1.4" fill="#6b7280" />
                        <rect x="251.5" y="118.4" width="5" height="1.2" rx="0.6" fill="rgba(255,255,255,0.2)" />
                        <motion.circle cx="250" cy="102" r="1.2"
                            animate={{ fill: ["#818cf8", "#c4b5fd", "#818cf8"], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        />

                        {/* Elbow */}
                        <circle cx="261" cy="108" r="10" fill="url(#jg)" filter="url(#bv)" />
                        <circle cx="261" cy="108" r="7" fill="#6b7280" />
                        <circle cx="263" cy="105.5" r="2.5" fill="rgba(255,255,255,0.28)" />
                        <circle cx="261" cy="108" r="3" fill="#3e3e56" />
                        <circle cx="261" cy="108" r="8.5" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />

                        {/* Forearm */}
                        <motion.g
                            animate={isTalking ? {
                                rotate: [0, 15, -5, 10, 0]
                            } : {
                                rotate: [8, 8, 8, 8, -25, 35, -30, 30, 8, 8, 8, 8, 20, -25, 25, -20, 15, -10, 8, 8]
                            }}
                            transition={isTalking ? {
                                duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3
                            } : {
                                duration: 18, repeat: Infinity, ease: "easeInOut",
                                times: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.92, 1]
                            }}
                            style={{ originX: "261px", originY: "108px" }}
                        >
                            <rect x="260" y="98" width="20" height="20" rx="7" fill="url(#ar)" filter="url(#bv)" />
                            <rect x="262" y="99.5" width="16" height="7" rx="3.5" fill="rgba(255,255,255,0.11)" />

                            {/* Wrist */}
                            <circle cx="280" cy="108" r="7.5" fill="url(#jg)" filter="url(#bv)" />
                            <circle cx="280" cy="108" r="5" fill="#6b7280" />
                            <circle cx="281.5" cy="106" r="1.8" fill="rgba(255,255,255,0.25)" />
                            <circle cx="280" cy="108" r="2" fill="#3e3e56" />

                            {/* HAND with attached fingers */}
                            <circle cx="289" cy="108" r="9" fill="url(#cg)" filter="url(#bv)" />
                            <circle cx="291" cy="105" r="3" fill="rgba(255,255,255,0.14)" />
                            {/* Top finger */}
                            <ellipse cx="297" cy="99" rx="4.5" ry="3.5" fill="url(#cg)" transform="rotate(25,297,99)" filter="url(#bv)" />
                            <circle cx="298" cy="98" r="1" fill="rgba(255,255,255,0.15)" />
                            {/* Middle finger */}
                            <ellipse cx="299" cy="108" rx="5" ry="3.8" fill="url(#cg)" filter="url(#bv)" />
                            <circle cx="300.5" cy="107" r="1.2" fill="rgba(255,255,255,0.15)" />
                            {/* Bottom finger */}
                            <ellipse cx="297" cy="117" rx="4.5" ry="3.5" fill="url(#cg)" transform="rotate(-25,297,117)" filter="url(#bv)" />
                            <circle cx="298" cy="118" r="1" fill="rgba(255,255,255,0.15)" />
                            {/* Finger joints */}
                            <circle cx="294" cy="101" r="1.8" fill="url(#jg)" />
                            <circle cx="295" cy="108" r="2" fill="url(#jg)" />
                            <circle cx="294" cy="115" r="1.8" fill="url(#jg)" />
                        </motion.g>
                    </motion.g>

                    {/* ===== DATA PARTICLES ===== */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <motion.g key={`dp${i}`}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 0.5, 0],
                                y: [0, -18 - i * 3, -30 - i * 2],
                                x: [0, (i % 2 === 0 ? 4 : -4), 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
                        >
                            {i % 3 === 0 ? (
                                <text x={166 + i * 16} y={5} fill="rgba(129,140,248,0.5)" fontSize="5" fontFamily="monospace">{i % 2 === 0 ? '01' : '10'}</text>
                            ) : i % 3 === 1 ? (
                                <rect x={166 + i * 16} y={3} width="4" height="4" rx="0.5" fill="rgba(129,140,248,0.3)" />
                            ) : (
                                <circle cx={168 + i * 16} cy={5} r="1.5" fill="rgba(167,139,250,0.4)" />
                            )}
                        </motion.g>
                    ))}
                </motion.g>
            </svg>
        </div>
    );
};

export default MascotOriginal;
