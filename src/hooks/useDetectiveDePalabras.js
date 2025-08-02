// src/hooks/useDetectiveDePalabras.js (CORREGIDO)
import { useState, useCallback, useEffect } from 'react';

const TOTAL_TEST_QUESTIONS = 5;
const FONT_STYLES = ['default', 'cursive', 'uppercase'];

export const useDetectiveDePalabras = (frasesJuego, withTimer = false) => {
    const [indiceFraseActual, setIndiceFraseActual] = useState(0);
    const [puntuacion, setPuntuacion] = useState(0);
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });
    const [letras, setLetras] = useState([]);
    const [fraseResuelta, setFraseResuelta] = useState(false);
    
    // --- ESTADO PARA TIPOGRAFÍA ---
    const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);
    
    const [isTestMode, setIsTestMode] = useState(false);
    const [testQuestions, setTestQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const handleFontStyleChange = (event) => {
        const newIndex = parseInt(event.target.value, 10);
        setFontStyle(FONT_STYLES[newIndex]);
    };

    const getTransformedSolution = useCallback((solucion) => {
        return fontStyle === 'uppercase' ? solucion.toUpperCase() : solucion;
    }, [fontStyle]);

    const prepararFrase = useCallback((frase) => {
        if (!frase || !frase.solucion) return;
        
        const solucionTransformada = getTransformedSolution(frase.solucion);
        const fraseSinEspacios = solucionTransformada.replace(/ /g, '');
        
        const letrasIniciales = fraseSinEspacios.split('').map(char => ({ char, separador: false, status: '' }));
        setLetras(letrasIniciales);
        setFeedback({ texto: '', clase: '' });
        setFraseResuelta(false);
    }, [getTransformedSolution]);

    useEffect(() => {
        if (!isTestMode && frasesJuego.length > 0) {
            prepararFrase(frasesJuego[indiceFraseActual]);
        }
    }, [isTestMode, indiceFraseActual, frasesJuego, prepararFrase, fontStyle]); // Se añade fontStyle a las dependencias

    const toggleSeparador = (index) => {
        if (fraseResuelta && !isTestMode) return;
        setLetras(letrasActuales => {
            const nuevasLetras = letrasActuales.map(l => ({...l, status: ''}));
            nuevasLetras[index].separador = !nuevasLetras[index].separador;
            return nuevasLetras;
        });
        setFeedback({ texto: '', clase: '' });
    };

    const getUserAttempt = () => {
        return letras.reduce((acc, letra, index) => {
            return acc + letra.char + (letra.separador && index < letras.length - 1 ? ' ' : '');
        }, '').trim();
    };

    const comprobarFrase = () => {
        const solucionOriginal = frasesJuego[indiceFraseActual].solucion;
        const solucionTransformada = getTransformedSolution(solucionOriginal);
        
        const posicionesEspaciosSolucion = [];
        let acumulado = 0;
        solucionTransformada.split(' ').forEach((palabra, index, arr) => {
            if (index < arr.length - 1) {
                acumulado += palabra.length;
                posicionesEspaciosSolucion.push(acumulado - 1);
            }
        });

        let aciertos = 0;
        let totalSeparadoresUsuario = 0;
        const nuevasLetras = letras.map((letra, index) => {
            if (letra.separador) {
                totalSeparadoresUsuario++;
                if (posicionesEspaciosSolucion.includes(index)) {
                    aciertos++;
                    return { ...letra, status: 'correcto' };
                } else {
                    return { ...letra, status: 'incorrecto' };
                }
            }
            return { ...letra, status: '' };
        });

        setLetras(nuevasLetras);

        const esTotalmenteCorrecto = aciertos === posicionesEspaciosSolucion.length && aciertos === totalSeparadoresUsuario;

        if (esTotalmenteCorrecto) {
            setFeedback({ texto: '¡Correcto! ¡Caso resuelto!', clase: 'correcto' });
            setPuntuacion(p => p + 10);
            setFraseResuelta(true);
        } else {
            setFeedback({ texto: '¡Casi! Revisa las marcas rojas.', clase: 'incorrecto' });
        }
    };

    const siguienteFrase = () => {
        setIndiceFraseActual(prev => (prev + 1) % frasesJuego.length);
    };

    const startTest = () => {
        const selectedFrases = [...frasesJuego].sort(() => 0.5 - Math.random()).slice(0, TOTAL_TEST_QUESTIONS);
        setTestQuestions(selectedFrases);
        setIndiceFraseActual(0);
        setUserAnswers([]);
        prepararFrase(selectedFrases[0]);
        setShowResults(false);
        setScore(0);
        setIsTestMode(true);
        if (withTimer) {
            setStartTime(Date.now());
            setElapsedTime(0);
        }
    };
    
    useEffect(() => {
        let timer;
        if (isTestMode && withTimer && !showResults) {
            timer = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
        }
        return () => clearInterval(timer);
    }, [isTestMode, withTimer, showResults, startTime]);

    const calculateScore = (correctCount, time) => {
        let baseScore = correctCount * 200;
        if (withTimer && correctCount > 0) {
            const timeBonus = Math.max(0, 100 - (time * 2));
            baseScore += timeBonus;
        }
        return Math.floor(baseScore);
    };

    const handleNextQuestion = () => {
        const newAnswers = [...userAnswers, getUserAttempt()];
        setUserAnswers(newAnswers);

        if (indiceFraseActual < TOTAL_TEST_QUESTIONS - 1) {
            const nextIndex = indiceFraseActual + 1;
            setIndiceFraseActual(nextIndex);
            prepararFrase(testQuestions[nextIndex]);
        } else {
            const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
            setElapsedTime(finalTime);
            let correctCount = 0;
            testQuestions.forEach((q, index) => {
                const solucionTransformada = getTransformedSolution(q.solucion);
                if (newAnswers[index] === solucionTransformada) {
                    correctCount++;
                }
            });
            setScore(calculateScore(correctCount, finalTime));
            setShowResults(true);
        }
    };
    
    const exitTestMode = () => {
        setIsTestMode(false);
        setIndiceFraseActual(0);
    };

    const fontStyleIndex = FONT_STYLES.indexOf(fontStyle);

    return {
        letras, puntuacion, feedback, fraseActual: isTestMode ? testQuestions[indiceFraseActual] : frasesJuego[indiceFraseActual], indiceFraseActual, totalFrases: isTestMode ? TOTAL_TEST_QUESTIONS : frasesJuego.length, fraseResuelta, toggleSeparador, comprobarFrase, siguienteFrase, isTestMode, startTest, exitTestMode, handleNextQuestion, showResults, score, elapsedTime, userAnswers, testQuestions, withTimer, fontStyle, fontStyleIndex, handleFontStyleChange, getTransformedSolution
    };
};