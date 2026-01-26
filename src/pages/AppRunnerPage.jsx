// src/pages/AppRunnerPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';
import DonationModal from '@/components/ui/DonationModal';
import MatrixBackground from '@/components/ui/MatrixBackground';
import GeometryDashBackground from '@/components/ui/GeometryDashBackground';

const AppRunnerPage = () => {
    // 1. Obtenemos parámetros de la URL.
    // 'subjectId' vendrá aquí si configuraste la ruta nueva en main.jsx
    const { level, grade, subjectId: paramSubjectId, appId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

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

    const { app, subjectId: defaultSubjectId } = result;
    const AppToRender = app.component;

    // --- LÓGICA DE RETORNO INTELIGENTE ---
    // Prioridad: 
    // 1. URL (si existe el parámetro en la ruta).
    // 2. State (si venimos de hacer clic en la tarjeta).
    // 3. Default (lo que diga la app por defecto, ej. Lengua).
    const activeSubjectId = paramSubjectId || location.state?.fromSubjectId || defaultSubjectId;

    const hasSubject = activeSubjectId && activeSubjectId !== 'general';
    const backPath = hasSubject
        ? `/curso/${level}/${grade}/${activeSubjectId}`
        : `/curso/${level}/${grade}`;

    const backButtonText = hasSubject ? 'Volver a la Asignatura' : 'Volver al Curso';

    const isTerminal = app.id.includes('terminal-retro');
    const isRunner = app.id === 'runner';
    const isRetroApp = isTerminal || isRunner;

    const backgroundClass = app.id.startsWith('isla-de-la-calma')
        ? 'bg-[#f0f7f8]'
        : isRetroApp
            ? 'bg-black'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

    const isWideApp = app.id.includes('visualizador-3d') || app.id.includes('romanos') || app.id.includes('mesa-crafteo') || app.id.includes('laboratorio-funciones-2d') || app.id.includes('fracciones-eso');
    const containerClass = isWideApp ? "max-w-[1600px] w-[85%] px-0" : "max-w-4xl";

    // Conditional Styles
    const btnBackClass = isRetroApp
        ? "bg-black border border-green-500 text-green-500 hover:bg-green-900/50 hover:text-green-400 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all font-mono tracking-widest uppercase"
        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 hover:shadow-lg transition-all duration-300 shadow-md border-0";

    const btnHeartClass = isRetroApp
        ? "bg-black border border-green-500 text-green-500 hover:bg-green-900/50 hover:text-green-400 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all group"
        : "bg-white/80 backdrop-blur-sm hover:bg-pink-50 text-pink-600 border border-pink-200 shadow-sm hover:shadow-md transition-all group";

    const iconHeartClass = isRetroApp
        ? "h-5 w-5 fill-transparent group-hover:fill-green-500 transition-all duration-300"
        : "h-5 w-5 fill-transparent group-hover:fill-pink-600 transition-all duration-300";

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>

            <DonationModal
                open={isDonationModalOpen}
                onOpenChange={setIsDonationModalOpen}
            />

            <div className={`min-h-screen flex flex-col items-center justify-start pt-2 px-4 pb-4 ${backgroundClass} relative overflow-hidden`}>

                {isTerminal && <MatrixBackground />}
                {isRunner && <GeometryDashBackground />}

                <div className={`w-full ${containerClass} flex justify-start items-center gap-3 mb-4 relative z-10`}>

                    <Button
                        onClick={() => navigate(backPath)}
                        className={btnBackClass}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> {backButtonText}
                    </Button>

                    <Button
                        onClick={() => setIsDonationModalOpen(true)}
                        className={btnHeartClass}
                        size="icon"
                        title="Apoya el proyecto"
                    >
                        <Heart className={iconHeartClass} />
                    </Button>
                </div>

                <div className={`w-full ${containerClass} relative z-10`}>
                    <AppToRender
                        isPaused={isDonationModalOpen}
                        level={level}
                        grade={grade}
                        subjectId={activeSubjectId}
                    />
                </div>
            </div>
        </>
    );
};

export default AppRunnerPage;