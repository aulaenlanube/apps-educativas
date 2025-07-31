// src/pages/AppRunnerPage.jsx
import React from 'react';
// Añade 'useLocation' a los imports
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';

const AppRunnerPage = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    // Obtén la ubicación para acceder al 'state'
    const location = useLocation();

    const result = findAppById(appId);

    if (!result) {
        return <div>App no encontrada</div>;
    }

    const { app, level, grade, subjectId } = result;
    const AppToRender = app.component;

    // --- LÓGICA MEJORADA ---
    // 1. Intenta obtener la ruta de origen desde el estado de la navegación.
    // 2. Si no existe (por ejemplo, si se accede a la URL directamente), construye una ruta de fallback.
    const fromPath = location.state?.from;
    const fallbackPath = level === 'eso' 
        ? `/curso/${level}/${grade}/${subjectId}` 
        : `/curso/${level}/${grade}`;
        
    const backPath = fromPath || fallbackPath;
    
    // El texto del botón sigue la misma lógica
    const backButtonText = (fromPath && fromPath.includes('/eso/')) || level === 'eso' 
        ? 'Volver a Asignaturas' 
        : 'Volver a la lista';
    
    const backgroundClass = appId === 'isla-de-la-calma'
        ? 'bg-[#f0f7f8]'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${backgroundClass}`}>
                <div className="w-full max-w-4xl flex justify-start mb-4">
                    {/* El botón ahora usa la ruta calculada */}
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