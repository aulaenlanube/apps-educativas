// src/pages/AppRunnerPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';

const AppRunnerPage = () => {
    // Solo necesitamos el appId de la URL
    const { appId } = useParams();
    const navigate = useNavigate();

    // Buscamos la app y toda su información de contexto
    const result = findAppById(appId);

    if (!result) {
        return <div>App no encontrada</div>;
    }

    // Desestructuramos el resultado para obtener todo lo que necesitamos
    const { app, level, grade, subjectId } = result;
    const AppToRender = app.component;

    // Construimos la ruta de "vuelta" según si es de Primaria o de ESO
    const backPath = level === 'eso' 
        ? `/curso/${level}/${grade}/${subjectId}` 
        : `/curso/${level}/${grade}`;
    
    const backButtonText = level === 'eso' ? 'Volver a Asignaturas' : 'Volver a la lista';
    
    // CORRECCIÓN: Se define la clase del fondo dinámicamente
    const backgroundClass = appId === 'isla-de-la-calma'
        ? 'bg-[#f0f7f8]' // Color de fondo específico para la app
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'; // Gradiente por defecto

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>
            {/* CORRECCIÓN: Se aplica la clase de fondo dinámica al div principal */}
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