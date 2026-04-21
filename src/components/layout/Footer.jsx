import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Linkedin, Cookie } from 'lucide-react';
import IconXSocial from '../icons/IconXSocial';
import { Link, useNavigate } from 'react-router-dom';
import MascotLogo from '../ui/MascotLogo';
import OposicionesIAPromo from '../ads/OposicionesIAPromo';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gray-900 text-white py-12 px-6"
        >
            <div className="container mx-auto text-center">
                <div className="flex items-center justify-center space-x-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
                    <MascotLogo className="w-12 h-10 transition-transform hover:scale-110" />
                    <span className="text-2xl font-bold">EduApps</span>
                </div>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                    Transformando la educación a través de la tecnología.
                </p>

                <div className="flex justify-center items-center space-x-6 mb-8">

                    <a href="https://www.instagram.com/edutorregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Instagram size={24} />
                    </a>
                    <a href="https://www.youtube.com/@ia-para-docentes" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Youtube size={28} />
                    </a>
                    <a href="https://x.com/_edu_torregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <IconXSocial size={20} />
                    </a>
                    <a href="https://www.linkedin.com/in/edutorregrosa/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin size={24} />
                    </a>
                </div>

                <div className="border-t border-gray-700 pt-6 space-y-3">
                    <div className="flex justify-center">
                        <OposicionesIAPromo variant="inline" source="footer" className="text-sm" />
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                        <Link to="/aviso-legal" className="text-gray-300 hover:text-white hover:underline">
                            Aviso legal
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link to="/politica-privacidad" className="text-gray-300 hover:text-white hover:underline">
                            Política de privacidad
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link to="/politica-cookies" className="text-gray-300 hover:text-white hover:underline">
                            Política de cookies
                        </Link>
                        <span className="text-gray-600">·</span>
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new Event('open-cookie-banner'))}
                            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white hover:underline"
                        >
                            <Cookie className="w-3.5 h-3.5" /> Gestionar cookies
                        </button>
                    </nav>
                    <p className="text-gray-400">
                        Hecho con ❤️ por <a href="https://edutorregrosa.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:underline">Edu Torregrosa</a> con la ayuda de la IA.
                    </p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;