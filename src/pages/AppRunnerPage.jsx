// src/pages/AppRunnerPage.jsx (CORREGIDO)
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';

const AppRunnerPage = () => {
    // CAMBIO: Ahora obtenemos level, grade y appId de la URL
    const { level, grade, appId } = useParams();
    const navigate = useNavigate();

    // CAMBIO: Le pasamos toda la información a la función de búsqueda
    const result = findAppById(appId, level, grade);

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-red-700">
                <h1 className="text-2xl font-bold mb-4">App no encontrada</h1>
                <p>No hemos podido encontrar la aplicación que buscas. Revisa la configuración en appList.js</p>
                <Button onClick={() => navigate('/')} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                </Button>
            </div>
        );
    }

    const { app, subjectId } = result;
    const AppToRender = app.component;

    const backPath = level === 'eso' 
        ? `/curso/${level}/${grade}/${subjectId}` 
        : `/curso/${level}/${grade}`;
    
    const backButtonText = level === 'eso' ? 'Volver a la Asignatura' : 'Volver al Curso';
    
    const backgroundClass = app.id.startsWith('isla-de-la-calma')
        ? 'bg-[#f0f7f8]'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${backgroundClass}`}>
                <div className="w-full max-w-4xl flex justify-start mb-4">
                    <Button onClick={() => navigate(backPath)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {backButtonText}
                    </Button>
                </div>
                <div className="w-full max-w-4xl">
                    <AppToRender />
                </div>
            </div>
        </>
    );
};

export default AppRunnerPage;