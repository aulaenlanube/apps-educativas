// src/components/ui/DonationModal.jsx
import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Heart, Instagram, Youtube, Linkedin, X } from 'lucide-react';
import IconXSocial from '../icons/IconXSocial';

const Dialog = DialogPrimitive.Root;
const DialogContent = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const DialogHeader = ({ className, ...props }) => <div className={`text-center ${className}`} {...props} />;
const DialogFooter = ({ className, ...props }) => <div className={` ${className}`} {...props} />;

const DonationModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        
        <DialogContent 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[425px] bg-white rounded-2xl p-6 shadow-2xl border-2 border-pink-100"
        >
          <DialogHeader>
            <div className="mx-auto bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-pink-600 fill-pink-600 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800">¿Te gusta esta App?</DialogTitle>
          </DialogHeader>

          <DialogDescription asChild>
            <div className="py-4 text-center space-y-4">
              <p className="text-gray-600 leading-relaxed text-lg">
                Todas estas apps son gratis y siempre lo serán, y sin nada de publicidad.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Puedes apoyarme con un <strong>Donativo</strong> para que todo esto pueda seguir funcionando, o apoyarme siguiéndome en redes sociales.
              </p>
              
              <div className="flex justify-center items-center space-x-6 my-6 pt-2">
                <a href="https://instagram.com/edutorregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors transform hover:scale-110">
                  <Instagram size={28} />
                </a>
                <a href="https://youtube.com/c/aulaenlanube" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors transform hover:scale-110">
                  <Youtube size={32} />
                </a>
                <a href="https://x.com/_edu_torregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors transform hover:scale-110">
                  <IconXSocial size={24} />
                </a>
                <a href="https://www.linkedin.com/in/edu-torregrosa-llacer/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors transform hover:scale-110">
                  <Linkedin size={28} />
                </a>
              </div>
            </div>
          </DialogDescription>

          <DialogFooter className="flex flex-col gap-3">
            <a href="https://www.paypal.com/paypalme/edutorregrosa" target="_blank" rel="noopener noreferrer" className="w-full">
                {/* He puesto un enlace genérico a PayPalMe, asegúrate de cambiarlo por tu enlace real de donación */}
              <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg hover:shadow-xl transition-all">
                <Heart className="mr-2 h-4 w-4 fill-white" /> Hacer un Donativo
              </Button>
            </a>
            <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
            >
                Quizás luego
            </Button>
          </DialogFooter>

          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogContent>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default DonationModal;