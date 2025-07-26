// src/components/layout/Footer.jsx (MODIFICADO)

import React from 'react';
import { motion } from 'framer-motion';
// 1. IMPORTAMOS LOS ICONOS QUE NECESITAMOS
import { GraduationCap, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <motion.footer 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-12 px-6"
        >
            <div className="container mx-auto text-center">
                <div className="flex items-center justify-center space-x-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold">EduApps</span>
                </div>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                    Transformando la educación a través de la tecnología.
                </p>

                {/* --- 2. AÑADIMOS LOS ICONOS DE REDES SOCIALES --- */}
                <div className="flex justify-center space-x-6 mb-8">
                    
                    <a href="https://www.instagram.com/edutorregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Instagram size={24} />
                    </a>
                    <a href="https://www.youtube.com/@ia-para-docentes" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Youtube size={24} />
                    </a>
                    <a href="https://www.linkedin.com/in/edu-torregrosa-llacer/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin size={24} />
                    </a>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    {/* --- 3. ACTUALIZAMOS EL TEXTO Y AÑADIMOS EL ENLACE --- */}
                    <p className="text-gray-400">
                        © 2025 EduApps. Hecho con ❤️ por <a href="https://edutorregrosa.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:underline">Edu Torregrosa</a> con la ayuda de la IA.
                    </p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;