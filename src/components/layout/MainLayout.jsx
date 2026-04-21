import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import AboutModal from '../ui/AboutModal';
import CookieBanner from '../CookieBanner';

const MainLayout = () => {
    // Elevamos el estado del modal aquí para que esté disponible en toda la app
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Renderizamos el modal aquí para que cubra toda la pantalla */}
            <AboutModal open={isModalOpen} onOpenChange={setIsModalOpen} />

            <main className="flex-grow">
                {/* Pasamos la función para abrir el modal a través del contexto */}
                <Outlet context={{ setIsModalOpen }} />
            </main>

            <Footer />
            <CookieBanner />
        </div>
    );
};

export default MainLayout;