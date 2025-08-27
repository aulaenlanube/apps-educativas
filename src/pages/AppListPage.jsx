import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { primariaApps, primariaSubjects, esoApps, esoSubjects } from '@/apps/appList';
import Header from '@/components/layout/Header';
import GradientTitle from '@/components/ui/GradientTitle';
import { Sparkles, Folder, ArrowLeft } from 'lucide-react'; // Importamos los iconos necesarios

/**
 * Lista de aplicaciones para una materia concreta con el nuevo diseño.
 */
const AppList = ({ apps, level, grade, subjectId }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
      {apps.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-purple-100"
          onClick={() => navigate(`/curso/${level}/${grade}/${subjectId}/app/${app.id}`)}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">{app.name}</h3>
          <p className="text-gray-600">{app.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Página que muestra todas las apps disponibles para una materia específica.
 * Soporta niveles de primaria y ESO y muestra los iconos en el título.
 */
const AppListPage = () => {
  const params = useParams();
  const levelParam = params.level ?? 'primaria';
  const { grade, subjectId } = params;
  const navigate = useNavigate();

  // Buscamos información de la materia para mostrar su nombre completo
  const subjectArray = levelParam === 'primaria'
    ? (primariaSubjects && primariaSubjects[grade])
    : (esoSubjects && esoSubjects[grade]);
  const subjectInfo = subjectArray?.find((s) => s.id === subjectId);
  const subjectName = subjectInfo ? subjectInfo.nombre : "Asignatura";

  // Obtenemos las apps correspondientes
  const appsForSubject = levelParam === 'primaria'
    ? (primariaApps[grade]?.[subjectId] || [])
    : (esoApps[grade]?.[subjectId] || []);
  const fullTitle = `${subjectName} - ${grade}º ${levelParam.toUpperCase()}`;

  return (
    <>
      <Helmet>
        <title>{`Apps de ${fullTitle} - EduApps`}</title>
      </Helmet>
      
      {/* Usamos el Header reutilizable */}
      <Header>
        <Button onClick={() => navigate(`/curso/${levelParam}/${grade}`)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Asignaturas
        </Button>
      </Header>

      <main className="container mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          
          {/* Título con los iconos (emojis) recuperados */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Folder className="w-10 h-10 text-blue-500" />
            <GradientTitle tag="h1" className="text-5xl md:text-6xl">
              {subjectName}
            </GradientTitle>
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>
          
          <p className="text-xl text-gray-600 mt-4">¡Selecciona una aplicación para empezar a jugar y aprender!</p>
        </motion.div>

        {appsForSubject.length > 0 ? (
          <AppList apps={appsForSubject} level={levelParam} grade={grade} subjectId={subjectId} />
        ) : (
          // Mensaje "Próximamente" con el nuevo diseño
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2, duration: 0.5 }} 
            className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl"
          >
            <img className="w-56 h-56 mb-8 object-cover rounded-full" alt="Un cohete despegando hacia las estrellas" src="/images/portada.webp" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Próximamente!</h2>
            <p className="text-lg text-gray-600 max-w-md">Estamos trabajando para añadir las mejores apps para esta asignatura. ¡Vuelve pronto!</p>
          </motion.div>
        )}
      </main>
    </>
  );
};

export default AppListPage;