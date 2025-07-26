// src/components/ui/AboutModal.jsx (MODIFICADO)

import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
// 1. Importamos el icono de la "X" para el botón de cerrar
import { Instagram, Youtube, Linkedin, X } from 'lucide-react';

const Dialog = DialogPrimitive.Root;
const DialogContent = DialogPrimitive.Content;
const DialogHeader = ({ className, ...props }) => <div className={`text-center ${className}`} {...props} />;
const DialogTitle = ({ className, ...props }) => <h2 className={`text-2xl font-bold text-gray-800 ${className}`} {...props} />;
const DialogFooter = ({ className, ...props }) => <div className={` ${className}`} {...props} />;

const AboutModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* --- 2. FONDO OSCURO (OVERLAY) --- */}
        {/* Esta capa se pondrá por encima de la web y por debajo de la ventana */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
        
        <DialogContent 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[425px] bg-white rounded-2xl p-6 shadow-lg"
        >
          <DialogHeader>
            
          </DialogHeader>
          <div className="py-4 text-center">
            <img
              src="/images/edu.webp"
              alt="Edu Torregrosa"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-200"
            />
            <p className="text-gray-600 leading-relaxed">
              Soy Edu Torregrosa, profesor de Informática con más de 15 años de experiencia. Tengo varios canales de YouTube orientados a la educación. 
            </p>
            <p className="text-gray-600 leading-relaxed">
              Mi proposito en la vida lo tengo claro: aportar mi granito de arena para mejorar la educación.
            </p>
            <div className="flex justify-center space-x-6 my-6">
              {/* Reemplaza '#' con los enlaces a tus perfiles */}
              <a href="https://instagram.com/edutorregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors">
                <Instagram size={28} />
              </a>
              <a href="https://www.youtube.com/@ia-para-docentes" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600 transition-colors">
                <Youtube size={28} />
              </a>
              <a href="https://www.linkedin.com/in/edu-torregrosa-llacer/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors">
                <Linkedin size={28} />
              </a>
            </div>
          </div>
          <DialogFooter>
            <a href="https://edutorregrosa.com/" target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Ver web personal
              </Button>
            </a>
          </DialogFooter>

          {/* --- 3. BOTÓN DE CERRAR (X) --- */}
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogContent>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default AboutModal;