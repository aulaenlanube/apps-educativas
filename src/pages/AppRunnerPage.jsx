// src/pages/AppRunnerPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';
import DonationModal from '@/components/ui/DonationModal';

const AppRunnerPage = () => {
    const { level, grade, appId } = useParams();
    const navigate = useNavigate();

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

    const { app, subjectId } = result;
    const AppToRender = app.component;

    const hasSubject = subjectId && subjectId !== 'general';
    const backPath = hasSubject
        ? `/curso/${level}/${grade}/${subjectId}` 
        : `/curso/${level}/${grade}`;
    
    const backButtonText = hasSubject ? 'Volver a la Asignatura' : 'Volver al Curso';
    
    const backgroundClass = app.id.startsWith('isla-de-la-calma')
        ? 'bg-[#f0f7f8]'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>
            
            <DonationModal 
                open={isDonationModalOpen} 
                onOpenChange={setIsDonationModalOpen} 
            />

            {/* CAMBIO: 
                - 'pt-2': Muy poco espacio arriba (aprox 8px).
                - 'px-4': Espacio a los lados.
                - 'pb-4': Espacio abajo.
                Esto debería subirlo lo máximo posible manteniendo la estética.
            */}
            <div className={`min-h-screen flex flex-col items-center justify-start pt-2 px-4 pb-4 ${backgroundClass}`}>
                
                <div className="w-full max-w-4xl flex justify-start items-center gap-3 mb-4">
                    <Button 
                        onClick={() => navigate(backPath)} 
                        variant="outline" 
                        className="bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> {backButtonText}
                    </Button>

                    <Button 
                        onClick={() => setIsDonationModalOpen(true)} 
                        className="bg-white/80 backdrop-blur-sm hover:bg-pink-50 text-pink-600 border border-pink-200 shadow-sm hover:shadow-md transition-all group"
                        size="icon"
                        title="Apoya el proyecto"
                    >
                        <Heart className="h-5 w-5 fill-transparent group-hover:fill-pink-600 transition-all duration-300" />
                    </Button>
                </div>

                <div className="w-full max-w-4xl relative">
                    <AppToRender isPaused={isDonationModalOpen} />
                </div>
            </div>
        </>
    );
};

export default AppRunnerPage;