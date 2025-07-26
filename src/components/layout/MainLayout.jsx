// src/components/layout/MainLayout.jsx (MODIFICADO)

import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const MainLayout = () => {
    return (
        // Este div se encargará de la maquetación principal
        <div className="flex flex-col min-h-screen">

            {/* La clase "flex-grow" hace que el contenido principal ocupe todo el espacio disponible */}
            <main className="flex-grow">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;