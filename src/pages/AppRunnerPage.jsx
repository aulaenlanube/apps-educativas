// src/pages/AppRunnerPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById, esoSubjects } from '@/apps/appList';

const AppRunnerPage = () => {
    const { level, grade, subjectId, appId } = useParams();
    const navigate = useNavigate();

    // --- CORRECCIÓN FINAL Y DEFINITIVA ---
    // Se corrige el orden de los parámetros 'appId' y 'subjectId'
    const result = findAppById(level, grade, appId, subjectId);

    if (!result) {
        return <div className="p-10 text-center font-bold text-red-600">App no encontrada. Revisa la configuración.</div>;
    }

    const { app } = result;
    const AppToRender = app.component;

    const getBackPath = () => {
        if (level === 'eso') {
            return `/curso/eso/${grade}/${subjectId}`;
        }
        return `/curso/primaria/${grade}`;
    };
    
    const getBreadcrumbText = () => {
        if (level === 'primaria') {
            return `Volver a ${grade}º Primaria`;
        }
        const subjectInfo = esoSubjects[grade]?.find(s => s.id === subjectId);
        return `Volver a ${subjectInfo?.nombre || 'la asignatura'}`;
    }

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