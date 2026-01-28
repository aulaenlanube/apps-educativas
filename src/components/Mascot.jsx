import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useLocation } from 'react-router-dom';
import { getFrases } from './../../public/data/api';
import MascotOriginal from './MascotOriginal';
import MascotTeal from './MascotTeal';

const Mascot = () => {
    const { level, grade, subjectId } = useParams();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [isTalking, setIsTalking] = useState(false);
    const [voices, setVoices] = useState([]);

    // Logic to determine if we are in a subject page
    const isSubjectPage = !!(level && grade && subjectId && location.pathname.includes('/curso/'));

    const [monsterType] = useState(() => Math.random() > 0.5 ? 'original' : 'teal');

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
                try {
                    const frasesData = await getFrases(level, grade, subjectId);
                    setMessages(frasesData || []);
                } catch (err) {
                    console.error("Error loading educational phrases:", err);
                    setMessages([]);
                }
            } else {
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
            utterance.pitch = monsterType === 'teal' ? 1.4 : 1.6; // Slightly deeper voice for teal
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

            {monsterType === 'original' ? (
                <MascotOriginal isTalking={isTalking} onClick={handleMascotClick} />
            ) : (
                <MascotTeal isTalking={isTalking} onClick={handleMascotClick} />
            )}
        </div>
    );
};

export default Mascot;
