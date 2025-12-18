import React from 'react';
import ComprensionJuego from '../_shared/ComprensionJuego';

const LenguaComprensionEscrita1 = () => {
    // Ruta al archivo JSON de datos
    const dataUrl = "/data/primaria/1/lengua-comprension.json";

    return (
        <div className="w-full min-h-screen bg-blue-50 py-8">
            <div className="container mx-auto px-4">
                {/* HEMOS ELIMINADO EL TÍTULO H1 DE AQUÍ.
                   Ahora el título se gestiona dentro de ComprensionJuego 
                */}
                <ComprensionJuego 
                    dataUrl={dataUrl} 
                    tipo="escrita" 
                />
            </div>
        </div>
    );
};

export default LenguaComprensionEscrita1;