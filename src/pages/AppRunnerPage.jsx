// src/pages/AppRunnerPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';
import DonationModal from '@/components/ui/DonationModal';

const AppRunnerPage = () => {
    // FUSIÓN: Extraemos subjectId directamente de la URL para asegurar el retorno correcto
    const { level, grade, subjectId, appId } = useParams();
    const navigate = useNavigate();

    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

    // Buscamos la app. Nota: Aunque pasemos 4 argumentos, si tu función solo acepta 3, ignorará el último.
    // Lo importante es que tenemos 'subjectId' de la URL para el botón de volver.
    const result = findAppById(appId, level, grade, subjectId);

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

    // Extraemos datos del resultado. 
    // Usamos alias para evitar conflictos con las variables de useParams si fuera necesario.
    const { app } = result;
    const AppToRender = app.component;

    // FUSIÓN: Lógica de botón "Volver" usando el subjectId de la URL (más robusto)
    const backPath = subjectId 
        ? `/curso/${level}/${grade}/${subjectId}` 
        : `/curso/${level}/${grade}`;
    
    const backButtonText = subjectId ? 'Volver a la Asignatura' : 'Volver al Curso';
    
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

            {/* ESTILO: Se mantiene el estilo ajustado (pt-2, px-4) del segundo código */}
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
                    {/* FUSIÓN: Pasamos tanto isPaused como los datos de contexto (level, grade, subjectId) */}
                    <AppToRender 
                        isPaused={isDonationModalOpen} 
                        level={level} 
                        grade={grade} 
                        subjectId={subjectId} 
                    />
                </div>
            </div>
        </>
    );
};

export default AppRunnerPage;