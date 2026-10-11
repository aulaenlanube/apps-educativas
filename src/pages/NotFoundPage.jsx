import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import RobotMascot from '@/components/RobotMascot';
import './NavPages.css';

const funFacts = [
  { title: 'Parece que esta pagina se ha ido de excursion...', sub: 'y no ha dejado nota al tutor.' },
  { title: 'Error 404: Pagina no encontrada', sub: 'Como cuando un alumno dice que el perro se comio los deberes.' },
  { title: 'Aqui no hay nada que corregir...', sub: 'porque esta pagina no existe. Ni siquiera en el examen de recuperacion.' },
  { title: 'Esta pagina ha faltado a clase', sub: 'y no ha traido justificante.' },
  { title: 'Suspenso en navegacion', sub: 'Esta URL no aparece en el temario.' },
  { title: 'El conserje ha cerrado esta aula', sub: 'Prueba a volver al pasillo principal.' },
];

const pick = funFacts[Math.floor(Math.random() * funFacts.length)];

// Estrellas decorativas (posiciones fijas: nada de Math.random en render)
const STARS = [
  [8, 14, 0], [18, 72, 1.2], [27, 30, .6], [36, 85, 2], [44, 10, 1.6], [58, 64, .3],
  [66, 22, 2.4], [74, 90, .9], [83, 40, 1.8], [91, 12, .4], [12, 48, 2.8], [52, 92, 1.1],
  [88, 76, 2.2], [4, 88, .7], [62, 44, 3],
];

const NotFoundPage = () => (
  <div>
    <Header />
    <div className="np-lost min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      {/* Fondo: rejilla + orbes + estrellas (decorativo) */}
      <div className="fx-grid-bg" aria-hidden="true" />
      <div className="fx-app-backdrop" aria-hidden="true" />
      {STARS.map(([x, y, d], i) => (
        <span key={i} className="np-star" aria-hidden="true" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative text-center max-w-xl"
      >
        {/* 404 grande */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-2"
        >
          {/* El robot mascota hace de "0", con cara de despiste */}
          <span className="np-404 fx-float-slow select-none" role="img" aria-label="404">
            <span className="np-404__digit fx-text-grad" aria-hidden="true">4</span>
            <span className="np-404__robot" aria-hidden="true"><RobotMascot expression="confused" /></span>
            <span className="np-404__digit fx-text-grad" aria-hidden="true">4</span>
          </span>
        </motion.div>

        {/* Mensaje divertido */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fx-glass-dark rounded-3xl px-6 py-7 md:px-10 md:py-8 mb-8"
        >
          <h1 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight">{pick.title}</h1>
          <p className="text-indigo-100/75 text-lg md:text-xl">{pick.sub}</p>
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/" className="fx-btn fx-shine">
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
          <button type="button" onClick={() => window.history.back()} className="np-btn-ghost">
            <ArrowLeft className="w-5 h-5" />
            Pagina anterior
          </button>
        </motion.div>

        {/* Nota al pie */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-xs text-indigo-100/50"
        >
          Si crees que esto es un error, contacta con tu profesor o administrador.
        </motion.p>
      </motion.div>
    </div>
  </div>
);

export default NotFoundPage;
