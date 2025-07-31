// src/pages/AppRunnerPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';
import { esoSubjects } from '@/apps/appList'; // Importamos las asignaturas para obtener el nombre

const AppRunnerPage = () => {
    const { level, grade, subjectId, appId } = useParams();
    const navigate = useNavigate();

    // Llamamos a la nueva función con todos los parámetros de la URL
    const result = findAppById(level, grade, subjectId, appId);

    if (!result) {
        return <div>App no encontrada</div>;
    }

    const { app } = result;
    const AppToRender = app.component;

    // Lógica mejorada para el botón "Volver"
    const getBackPath = () => {
        if (level === 'eso') {
            return `/curso/eso/${grade}/${subjectId}`;
        }
        return `/curso/primaria/${grade}`;
    };
    
    // Lógica para obtener el texto del botón y el título
    const getBreadcrumbText = () => {
        if (level === 'primaria') {
            return `Volver a ${grade}º Primaria`;
        }
        const subjectInfo = esoSubjects[grade]?.find(s => s.id === subjectId);
        return `Volver a ${subjectInfo?.nombre || 'la asignatura'}`;
    }

    // El fondo para la Isla de la Calma
    const backgroundClass = app.id === 'isla-de-la-calma'
        ? 'bg-[#f0f7f8]'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${backgroundClass}`}>
                <div className="w-full max-w-4xl flex justify-start mb-4">
                    <Button onClick={() => navigate(getBackPath())}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {getBreadcrumbText()}
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