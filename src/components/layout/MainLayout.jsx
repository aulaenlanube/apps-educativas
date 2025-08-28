import React, { useState, Suspense, lazy } from 'react';
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';

const AboutModal = lazy(() => import('../ui/AboutModal'));

const MainLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Outlet context={{ setIsModalOpen }} />
      </main>
      <Toaster />
      <Footer />
      
      {/* 4. El botón que abre el modal se queda EXACTAMENTE IGUAL 
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="default"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full p-0 shadow-lg z-40"
        aria-label="Sobre mí"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Button>*/}

      {/* 5. Envuelve el modal en un componente <Suspense> */}
      <Suspense fallback={null}>
        <AboutModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </Suspense>
    </div>
  );
};

export default MainLayout;