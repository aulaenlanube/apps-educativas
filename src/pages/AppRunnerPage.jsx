import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';
import Header from '@/components/layout/Header';

const AppRunnerPage = () => {
  const { level, grade, subjectId, appId } = useParams();
  const navigate = useNavigate();
  const result = findAppById(appId, level, grade, subjectId);

  if (!result) {
    return (
      <div className="container mx-auto my-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">App no encontrada</h1>
        <p className="text-gray-600 mb-6">No hemos podido encontrar la aplicación que buscas.</p>
        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <ArrowLeft className="mr-2 w-4 h-4" /> Inicio
        </Button>
      </div>
    );
  }

  // IMPORTANTE: Extraemos también el subjectId del resultado por si no venía en la URL (caso Primaria)
  const { app, level: contextLevel, grade: contextGrade, subjectId: contextSubjectId } = result;
  const AppToRender = app.component;

  const backPath = subjectId ? `/curso/${level}/${grade}/${subjectId}` : `/curso/${level}/${grade}`;
  const backButtonText = subjectId ? 'Volver a la Asignatura' : 'Volver al Curso';
  
  const backgroundClass = app.id.startsWith('isla-de-la-calma')
    ? 'bg-[#f0f7f8]'
    : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

  return (
    <>
      <Helmet>
        <title>{`${app.name} - EduApps`}</title>
      </Helmet>
      <div className={`${backgroundClass} min-h-screen flex flex-col`}> 
        <Header isSticky={false}>
          <Button onClick={() => navigate(backPath)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> {backButtonText}
          </Button>
        </Header>
        <div className="container mx-auto p-4 flex-grow">
          {/* Pasamos el contexto completo al componente */}
          <AppToRender level={contextLevel} grade={contextGrade} subjectId={contextSubjectId} />
        </div>
      </div>
    </>
  );
};

export default AppRunnerPage;