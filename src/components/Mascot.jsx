import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useLocation } from 'react-router-dom';
import { getOrdenaFrasesData, getJokes } from '../services/gameDataService';
import RobotMascot from './RobotMascot';

const Mascot = ({ className = '' }) => {
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
                try {
                    const frasesData = await getOrdenaFrasesData(level, grade, subjectId);
                    setMessages(frasesData || []);
                } catch (err) {
                    console.error("Error loading educational phrases:", err);
                    setMessages([]);
                }
            } else {
                try {
                    const jokes = await getJokes();
                    setMessages(jokes || []);
                } catch (err) {
                    console.error("Error loading jokes:", err);
                    setMessages([]);
                }
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
        <div className={`mascot-wrapper ${className}`} style={{ position: 'relative', display: 'flex', justifyContent: 'center', zIndex: 30 }}>
            <AnimatePresence>
                {currentMessage && (
                    <motion.div
                        key={currentMessage}
                        className="mascot-bubble"
                        initial={{ opacity: 0, scale: 0.4, y: 24, rotate: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: -10, rotate: 4 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    >
                        <span className="mascot-bubble__text">{currentMessage}</span>
                        <span className="mascot-bubble__tail" aria-hidden="true" />
                    </motion.div>
                )}
            </AnimatePresence>

            <RobotMascot isTalking={isTalking} onClick={handleMascotClick} />
        </div>
    );
};

export default Mascot;
