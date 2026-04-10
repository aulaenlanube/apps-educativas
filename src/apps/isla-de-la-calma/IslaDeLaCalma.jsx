// src/apps/isla-de-la-calma/IslaDeLaCalma.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, RotateCcw, Play, Minus, Plus, Volume2, VolumeX, Waves } from 'lucide-react';
import './IslaDeLaCalma.css';

/* ── Partículas flotantes ────────────────────────────────────── */
const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 12,
      duration: 14 + Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.2,
    })), []);

  return (
    <div className="calma-particles">
      {particles.map(p => (
        <span
          key={p.id}
          className="calma-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

/* ── Olas suaves de fondo ────────────────────────────────────── */
const WavesBackground = () => (
  <div className="calma-waves-bg">
    <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="calma-wave calma-wave-1">
      <path d="M0,80 C360,150 1080,10 1440,80 L1440,180 L0,180 Z" fill="rgba(255,255,255,0.04)" />
    </svg>
    <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="calma-wave calma-wave-2">
      <path d="M0,100 C480,30 960,160 1440,100 L1440,180 L0,180 Z" fill="rgba(255,255,255,0.03)" />
    </svg>
    <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="calma-wave calma-wave-3">
      <path d="M0,120 C300,70 600,150 900,100 C1200,50 1350,130 1440,120 L1440,180 L0,180 Z" fill="rgba(255,255,255,0.025)" />
    </svg>
  </div>
);

/* ── Círculo de respiración ──────────────────────────────────── */
const BreathCircle = ({ scale, phase }) => {
  const phaseColors = {
    'Inhala...': 'calma-phase-inhale',
    'Sostén...': 'calma-phase-hold',
    'Exhala...': 'calma-phase-exhale',
    'Mantén...': 'calma-phase-rest',
    'Prepárate...': 'calma-phase-rest',
  };

  return (
    <div className="calma-breath-wrapper">
      {/* Anillos pulsantes */}
      <div className={`calma-breath-ring calma-ring-3 ${phaseColors[phase]}`}
        style={{ transform: `scale(${0.7 + scale * 0.5})` }} />
      <div className={`calma-breath-ring calma-ring-2 ${phaseColors[phase]}`}
        style={{ transform: `scale(${0.8 + scale * 0.4})` }} />
      <div className={`calma-breath-ring calma-ring-1 ${phaseColors[phase]}`}
        style={{ transform: `scale(${0.9 + scale * 0.3})` }} />
      {/* Círculo central */}
      <div className={`calma-breath-core ${phaseColors[phase]}`}
        style={{ transform: `scale(${scale})` }}>
        <Wind size={32} strokeWidth={1.5} className="calma-breath-icon" />
      </div>
    </div>
  );
};

/* ── Componente principal ────────────────────────────────────── */
const IslaDeLaCalma = () => {
  const [pantalla, setPantalla] = useState('inicio');
  const [numeroCiclos, setNumeroCiclos] = useState(5);
  const [instruccion, setInstruccion] = useState('Prepárate...');
  const [escalaCirculo, setEscalaCirculo] = useState(1);
  const [cicloActual, setCicloActual] = useState(0);
  const [audioActivado, setAudioActivado] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (pantalla !== 'respiracion') return;

    if (cicloActual > numeroCiclos) {
      setPantalla('final');
      return;
    }

    if (cicloActual === 0) {
      const timer = setTimeout(() => setCicloActual(1), 2500);
      return () => clearTimeout(timer);
    }

    const secuencia = [
      { texto: 'Inhala...', escala: 1.5 },
      { texto: 'Sostén...', escala: 1.5 },
      { texto: 'Exhala...', escala: 1 },
      { texto: 'Mantén...', escala: 1 },
    ];

    let step = 0;
    const nextStep = () => {
      if (step < secuencia.length) {
        setInstruccion(secuencia[step].texto);
        setEscalaCirculo(secuencia[step].escala);
        step++;
      } else {
        setCicloActual(c => c + 1);
      }
    };

    nextStep();
    const intervalo = setInterval(nextStep, 4000);
    return () => clearInterval(intervalo);
  }, [pantalla, cicloActual, numeroCiclos]);

  const handleEmpezar = () => {
    setInstruccion('Prepárate...');
    setCicloActual(0);
    setPantalla('respiracion');
  };

  const handleReiniciar = () => {
    setPantalla('inicio');
    setEscalaCirculo(1);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioActivado) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setAudioActivado(!audioActivado);
  };

  const adjustCycles = (delta) => {
    setNumeroCiclos(n => Math.max(1, Math.min(15, n + delta)));
  };

  return (
    <div className="calma-app">
      <FloatingParticles />
      <WavesBackground />

      <audio ref={audioRef} src="/audio/calm-sound.mp3" loop />

      <AnimatePresence mode="wait">
        {/* ── Pantalla inicio ──────────────────────────── */}
        {pantalla === 'inicio' && (
          <motion.div
            key="inicio"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="calma-card"
          >
            <div className="calma-card-inner">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="calma-hero-icon"
              >
                <Waves size={48} strokeWidth={1.2} />
              </motion.div>

              <h1 className="calma-title">Isla de la Calma</h1>
              <p className="calma-subtitle">
                Una pausa para encontrar la calma a través de la respiración.
                Sigue la animación y las instrucciones para relajar tu cuerpo y tu mente.
              </p>

              <div className="calma-cycles-config">
                <span className="calma-cycles-label">Respiraciones</span>
                <div className="calma-cycles-control">
                  <button onClick={() => adjustCycles(-1)} className="calma-cycle-btn" aria-label="Menos">
                    <Minus size={18} />
                  </button>
                  <span className="calma-cycle-value">{numeroCiclos}</span>
                  <button onClick={() => adjustCycles(1)} className="calma-cycle-btn" aria-label="Más">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEmpezar}
                className="calma-start-btn"
              >
                <Play size={20} />
                <span>Comenzar</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Pantalla respiración ─────────────────────── */}
        {pantalla === 'respiracion' && (
          <motion.div
            key="respiracion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="calma-breathing-screen"
          >
            <BreathCircle scale={escalaCirculo} phase={instruccion} />

            <AnimatePresence mode="wait">
              <motion.p
                key={instruccion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="calma-instruction"
              >
                {instruccion}
              </motion.p>
            </AnimatePresence>

            {cicloActual > 0 && (
              <div className="calma-progress">
                <div className="calma-progress-bar">
                  <motion.div
                    className="calma-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(cicloActual / numeroCiclos) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="calma-progress-text">
                  {cicloActual} de {numeroCiclos}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Pantalla final ───────────────────────────── */}
        {pantalla === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="calma-card"
          >
            <div className="calma-card-inner calma-final">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                className="calma-final-glow"
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
                className="calma-final-icon"
              >
                <span>🌊</span>
              </motion.div>

              <h1 className="calma-title">Muy bien hecho</h1>
              <p className="calma-subtitle">
                Has completado tu ejercicio de relajación.
                Esperamos que te sientas más tranquilo y enfocado.
              </p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReiniciar}
                className="calma-start-btn calma-restart-btn"
              >
                <RotateCcw size={18} />
                <span>Hacer otra vez</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón audio */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleAudio}
        className="calma-audio-btn"
        aria-label={audioActivado ? 'Silenciar' : 'Activar sonido'}
      >
        {audioActivado ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </motion.button>
    </div>
  );
};

export default IslaDeLaCalma;
