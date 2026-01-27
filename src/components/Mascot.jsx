import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useLocation } from 'react-router-dom';
import { getFrases } from './../../public/data/api';

const Mascot = () => {
    const { level, grade, subjectId } = useParams();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [isTalking, setIsTalking] = useState(false);
    const [voices, setVoices] = useState([]);

    // Logic to determine if we are in a subject page
    const isSubjectPage = !!(level && grade && subjectId && location.pathname.includes('/curso/'));

    useEffect(() => {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    useEffect(() => {
        const loadContent = async () => {
            if (isSubjectPage) {
                // Fetch educational phrases for the specific subject and grade
                try {
                    const frasesData = await getFrases(level, grade, subjectId);
                    setMessages(frasesData || []);
                } catch (err) {
                    console.error("Error loading educational phrases:", err);
                    setMessages([]);
                }
            } else {
                // Fetch general jokes
                fetch('/jokes.json')
                    .then(res => res.json())
                    .then(data => setMessages(data))
                    .catch(err => {
                        console.error("Error loading jokes:", err);
                        setMessages([]);
                    });
            }
        };

        loadContent();
    }, [isSubjectPage, level, grade, subjectId]);

    const handleMascotClick = () => {
        if (isTalking || messages.length === 0) return;

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setCurrentMessage(randomMsg);
        setIsTalking(true);

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(randomMsg);
            const spanishVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Premium'))) ||
                voices.find(v => v.lang.startsWith('es')) || null;
            if (spanishVoice) utterance.voice = spanishVoice;
            utterance.lang = 'es-ES';
            utterance.rate = 0.95;
            utterance.pitch = 1.6;
            utterance.onend = () => {
                setCurrentMessage(null);
                setIsTalking(false);
            };
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => {
                setCurrentMessage(null);
                setIsTalking(false);
            }, 3000);
        }
    };

    return (
        <div className="mascot-wrapper" style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '0.5rem 0', zIndex: 30 }}>
            <AnimatePresence>
                {currentMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -20, y: 30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0, rotate: 20 }}
                        transition={{ duration: 0.3 }}
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
                        {currentMessage}
                        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid #6366f1' }} />
                        <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid white' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="mascot-container"
                onClick={handleMascotClick}
                style={{ height: '260px', width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
                <svg width="450" height="260" viewBox="100 0 210 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="mascot_body_gradient" x1="150" y1="50" x2="250" y2="150" gradientUnits="userSpaceOnUse">
                            <motion.stop
                                offset="0%"
                                animate={{ stopColor: ["#6366f1", "#ef4444", "#6366f1"] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />
                            <motion.stop
                                offset="100%"
                                animate={{ stopColor: ["#8b5cf6", "#b91c1c", "#8b5cf6"] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />
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
                                    d: [
                                        "M 185 115 Q 205 125 225 115 Q 225 115 205 115 Q 185 115 185 115",
                                        "M 185 115 Q 205 105 225 115 Q 225 135 205 135 Q 185 135 185 115",
                                        "M 185 115 Q 205 105 225 115 Q 225 135 205 135 Q 185 135 185 115",
                                        "M 185 115 Q 205 125 225 115 Q 225 115 205 115 Q 185 115 185 115"
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

                    <motion.g
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        style={{ willChange: 'transform' }}
                    >
                        {/* Legs: Turn red during Rage Mode */}
                        <motion.path
                            d="M185 135 L185 165 A 5 5 0 0 0 195 165 L195 135"
                            animate={{ fill: ["#8b5cf6", "#b91c1c", "#8b5cf6"] }}
                            transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                        />
                        <motion.path
                            d="M215 135 L215 165 A 5 5 0 0 0 225 165 L225 135"
                            animate={{ fill: ["#8b5cf6", "#b91c1c", "#8b5cf6"] }}
                            transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                        />

                        <motion.g
                            animate={isTalking ? {
                                opacity: 1,
                                scaleY: [0.9, 1.1, 0.9]
                            } : {
                                opacity: [0, 1, 1, 0],
                                scaleY: [0.1, 1, 1, 0.1]
                            }}
                            transition={isTalking ? { duration: 0.4, repeat: Infinity, ease: "linear" } : {
                                duration: 1,
                                repeat: Infinity,
                                repeatDelay: 14,
                                times: [0, 0.2, 0.8, 1]
                            }}
                            style={{ originX: "205px", originY: "115px", willChange: 'transform' }}
                        >
                            <path d="M 185 115 Q 205 105 225 115 Q 225 135 205 135 Q 185 135 185 115" fill="#1e1b4b" />
                            <motion.path
                                d="M 195 130 Q 205 125 215 130"
                                animate={isTalking ? {} : {
                                    d: [
                                        "M 195 130 Q 205 125 215 130",
                                        "M 195 130 Q 205 145 215 130",
                                        "M 195 130 Q 205 145 215 130",
                                        "M 195 130 Q 205 125 215 130"
                                    ]
                                }}
                                transition={isTalking ? {} : {
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 14,
                                    times: [0, 0.2, 0.8, 1]
                                }}
                                stroke="#f43f5e"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <rect x="187" y="108" width="7" height="10" rx="3" fill="white" />
                            <rect x="196" y="106" width="8" height="12" rx="4" fill="white" />
                            <rect x="206" y="107" width="8" height="11" rx="4" fill="white" />
                            <rect x="216" y="106" width="8" height="12" rx="4" fill="white" />
                            <rect x="189" y="125" width="6" height="9" rx="3" fill="white" />
                            <rect x="197" y="127" width="8" height="10" rx="4" fill="white" />
                            <rect x="207" y="125" width="8" height="11" rx="4" fill="white" />
                            <rect x="216" y="127" width="7" height="10" rx="3" fill="white" />
                        </motion.g>

                        <motion.rect x="160" y="60" width="90" height="90" rx="35" fill="url(#mascot_body_gradient)" mask="url(#mascot_mouth_mask)" style={{ willChange: 'transform' }} />
                        <rect x="180" y="105" width="50" height="30" rx="12" fill="#ffffff" fillOpacity="0.2" />

                        <motion.g style={{ originX: "205px", originY: "60px", willChange: 'transform' }} animate={{ rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
                            {/* Antennas */}
                            {/* Antennas: Turn red during Rage Mode */}
                            <motion.path
                                d="M180 75 L180 60 L175 45 L185 35"
                                strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                animate={{ stroke: ["#6366f1", "#ef4444", "#6366f1"] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />
                            <motion.circle
                                cx="185" cy="35" r="5"
                                animate={{ fill: ["#a78bfa", "#ff8888", "#a78bfa"] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />
                            <motion.path
                                d="M230 75 L230 60 L235 45 L225 35"
                                strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                animate={{ stroke: ["#6366f1", "#ef4444", "#6366f1"] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />
                            <motion.circle
                                cx="225" cy="35" r="5"
                                animate={{ fill: ["#a78bfa", "#ff8888", "#a78bfa"] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }}
                            />

                            {/* RAGE Spark Animation (Every 30s) */}
                            <motion.path
                                d="M 185 35 L 205 10 L 195 40 L 215 10 L 205 40 L 225 35"
                                stroke="#f87171"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: [0, 1, 0, 1, 0, 1, 0],
                                    scale: [0.8, 1.2, 0.8, 1.2, 0.8, 1.2, 0.8]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 28,
                                    times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1]
                                }}
                                style={{ filter: 'drop-shadow(0 0 10px #ef4444)' }}
                            />

                            {/* Normal Electric Spark Animation (Every 10s) */}
                            <motion.path
                                d="M 185 35 L 195 25 L 205 45 L 215 25 L 225 35"
                                stroke="#7dd3fc"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: [0, 1, 0.5, 1, 0.5, 1, 0],
                                    scale: [0.8, 1.1, 0.9, 1.1, 0.9, 1, 0.8],
                                    pathLength: [0, 1, 0.8, 1, 0.9, 1, 0]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    repeatDelay: 9.4,
                                    times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
                                }}
                                style={{
                                    filter: 'drop-shadow(0 0 8px #7dd3fc)',
                                    willChange: 'opacity, transform'
                                }}
                            />
                        </motion.g>

                        <g>
                            {/* Left Eye (Starts Big: r=12) -> Shrinks to r=8 */}
                            <motion.circle
                                cx="185" cy="90"
                                animate={{
                                    r: [12, 8, 12],
                                    fill: ["#ffffff", "#000000", "#ffffff"]
                                }}
                                transition={{
                                    r: { duration: 1, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" },
                                    fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }
                                }}
                            />
                            <motion.circle
                                cx="185" cy="90"
                                animate={{
                                    cx: [185, 186, 185],
                                    r: [5, 3, 5],
                                    fill: ["#1e1b4b", "#ff0000", "#1e1b4b"]
                                }}
                                transition={{
                                    cx: { repeat: Infinity, duration: 5 },
                                    r: { duration: 1, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" },
                                    fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }
                                }}
                                style={{ willChange: 'transform' }}
                            />

                            {/* Right Eye (Starts Small: r=10) -> Grows to r=14 */}
                            <motion.circle
                                cx="225" cy="90"
                                animate={{
                                    r: [10, 14, 10],
                                    fill: ["#ffffff", "#000000", "#ffffff"]
                                }}
                                transition={{
                                    r: { duration: 1, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" },
                                    fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }
                                }}
                            />
                            <motion.circle
                                cx="225" cy="90"
                                animate={{
                                    cx: [225, 226, 225],
                                    r: [4, 6, 4],
                                    fill: ["#1e1b4b", "#ff0000", "#1e1b4b"]
                                }}
                                transition={{
                                    cx: { repeat: Infinity, duration: 5 },
                                    r: { duration: 1, repeat: Infinity, repeatDelay: 11, ease: "easeInOut" },
                                    fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] }
                                }}
                                style={{ willChange: 'transform' }}
                            />
                        </g>

                        <motion.g style={{ willChange: 'transform' }}>
                            {/* Left Arm: Styled like the legs, waves when talking */}
                            <motion.path
                                d="M170 105 L135 105 A 5 5 0 0 0 135 115 L170 115"
                                animate={{
                                    fill: ["#6366f1", "#ef4444", "#6366f1"],
                                    rotate: isTalking ? [-25, 25, -25] : [-2, 2, -2]
                                }}
                                transition={{
                                    fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] },
                                    rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                }}
                                style={{ originX: "160px", originY: "110px" }}
                            />
                            {/* Right Arm: Styled like the legs, waves when talking */}
                            <motion.path
                                d="M240 105 L275 105 A 5 5 0 0 1 275 115 L240 115"
                                animate={{
                                    fill: ["#8b5cf6", "#b91c1c", "#8b5cf6"],
                                    rotate: isTalking ? [25, -25, 25] : [2, -2, 2]
                                }}
                                transition={{
                                    fill: { duration: 4, repeat: Infinity, repeatDelay: 26, times: [0, 0.5, 1] },
                                    rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                }}
                                style={{ originX: "250px", originY: "110px" }}
                            />
                        </motion.g>
                    </motion.g>
                </svg>
            </div>
        </div>
    );
};

export default Mascot;
