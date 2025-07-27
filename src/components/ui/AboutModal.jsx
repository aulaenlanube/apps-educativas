// src/components/ui/AboutModal.jsx (ACTUALIZADO)

import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
// 1. Importamos el icono de Twitter
import { Instagram, Youtube, Linkedin, X, Twitter } from 'lucide-react';
import IconXSocial from '../icons/IconXSocial';

const Dialog = DialogPrimitive.Root;
const DialogContent = DialogPrimitive.Content;
const DialogHeader = ({ className, ...props }) => <div className={`text-center ${className}`} {...props} />;
const DialogTitle = ({ className, ...props }) => <h2 className={`text-2xl font-bold text-gray-800 ${className}`} {...props} />;
const DialogFooter = ({ className, ...props }) => <div className={` ${className}`} {...props} />;

const AboutModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
        
        <DialogContent 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[425px] bg-white rounded-2xl p-6 shadow-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold gradient-text">Soy Edu Torregrosa</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <img
              src="/images/edu.webp"
              alt="Edu Torregrosa"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-200"
            />
            <p className="text-gray-600 leading-relaxed">
              Profesor de Informática con más de 15 años de experiencia. Tengo varios canales de YouTube, uno de videotutoriales y cursos gratuitos (Aula en la nube), y otro donde enseño a docentes a usar la IA en el aula (IA para docentes).
            </p>
            <p className="text-gray-600 leading-relaxed">
              Mi propósito: mejorar la educación.
            </p>
            <div className="flex justify-center space-x-6 my-6">
              {/* 2. Añadimos el nuevo enlace a X.com */}
              <a href="https://x.com/_edu_torregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                <IconXSocial size={24} />
              </a>
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

          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogContent>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default AboutModal;