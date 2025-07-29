// src/pages/AppRunnerPage.jsx (MODIFICADO)

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findAppById } from '@/apps/appList';

const AppRunnerPage = () => {
    const { level, grade, appId } = useParams();
    const navigate = useNavigate();

    const app = findAppById(appId);

    if (!app) {
        return <div>App no encontrada</div>;
    }

    const AppToRender = app.component;

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>
            {/* --- CAMBIOS AQUÍ --- */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl flex justify-start mb-4">
                    <Button onClick={() => navigate(`/curso/${level}/${grade}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
                    </Button>
                </div>
                <div className="w-full max-w-2xl">
                    <AppToRender />
                </div>
            </div>
        </>
    );
};

export default AppRunnerPage;