import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

const funFacts = [
  { title: 'Parece que esta pagina se ha ido de excursion...', sub: 'y no ha dejado nota al tutor.' },
  { title: 'Error 404: Pagina no encontrada', sub: 'Como cuando un alumno dice que el perro se comio los deberes.' },
  { title: 'Aqui no hay nada que corregir...', sub: 'porque esta pagina no existe. Ni siquiera en el examen de recuperacion.' },
  { title: 'Esta pagina ha faltado a clase', sub: 'y no ha traido justificante.' },
  { title: 'Suspenso en navegacion', sub: 'Esta URL no aparece en el temario.' },
  { title: 'El conserje ha cerrado esta aula', sub: 'Prueba a volver al pasillo principal.' },
];

const pick = funFacts[Math.floor(Math.random() * funFacts.length)];

const NotFoundPage = () => (
  <div>
    <Header />
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-lg"
      >
        {/* 404 grande */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <span className="text-[16rem] md:text-[22rem] leading-none font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
            404
          </span>
        </motion.div>

        {/* Mensaje divertido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">{pick.title}</h1>
          <p className="text-slate-500 text-xl md:text-2xl mb-10">{pick.sub}</p>
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl shadow border border-slate-200 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Pagina anterior
          </button>
        </motion.div>

        {/* Nota al pie */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-xs text-slate-400"
        >
          Si crees que esto es un error, contacta con tu profesor o administrador.
        </motion.p>
      </motion.div>
    </div>
  </div>
);

export default NotFoundPage;
