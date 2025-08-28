// 1. Añade 'useState', 'Suspense' y 'lazy' a la importación de React
import React, { useState, Suspense, lazy } from 'react';
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";

// --- INICIO DE LOS CAMBIOS ---

// 2. Importa tu modal usando React.lazy
const AboutModal = lazy(() => import('../ui/AboutModal'));

// Asumo que el botón para abrir el modal también está aquí. Si no, ignora esta parte.
import { Button } from '@/components/ui/button';

// --- FIN DE LOS CAMBIOS ---


const MainLayout = () => {
  // 3. La gestión del estado se queda EXACTAMENTE IGUAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Outlet context={{ setIsModalOpen }} />
      </main>
      <Toaster />
      <Footer />
      
      {/* 4. El botón que abre el modal se queda EXACTAMENTE IGUAL */}
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="default"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full p-0 shadow-lg z-40"
        aria-label="Sobre mí"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Button>

      {/* 5. Envuelve el modal en un componente <Suspense> */}
      <Suspense fallback={null}>
        <AboutModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </Suspense>
    </div>
  );
};

export default MainLayout;