import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Linkedin, Cookie } from 'lucide-react';
import IconXSocial from '../icons/IconXSocial';
import { Link, useNavigate } from 'react-router-dom';
import MascotLogo from '../ui/MascotLogo';
import OposicionesIAPromo from '../ads/OposicionesIAPromo';
import '@/pages/NavPages.css';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';

// Redes sociales: cada una con su color de glow al hover (--np-social).
const SOCIALS = [
    { href: 'https://www.instagram.com/edutorregrosa', label: 'Instagram', color: '#ec4899', icon: <Instagram size={22} /> },
    { href: 'https://www.youtube.com/@ia-para-docentes', label: 'YouTube', color: '#ef4444', icon: <Youtube size={24} /> },
    { href: 'https://x.com/_edu_torregrosa', label: 'X', color: '#a5b4fc', icon: <IconXSocial size={18} /> },
    { href: 'https://www.linkedin.com/in/edutorregrosa/', label: 'LinkedIn', color: '#38bdf8', icon: <Linkedin size={22} /> },
];

const Footer = () => {
    const navigate = useNavigate();

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="np-footer relative z-10 text-white py-14 px-6"
        >
            <div className="np-footer__grid fx-grid-bg" aria-hidden="true" />
            <div className="container mx-auto text-center">
                <div className="flex items-center justify-center space-x-3 mb-5 cursor-pointer group" onClick={() => navigate('/')}>
                    <MascotLogo className="w-12 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-[0_0_14px_rgba(139,92,246,0.6)]" />
                    <span className="text-2xl font-black fx-text-grad">EduApps</span>
                </div>
                <p className="text-indigo-100/75 mb-7 max-w-2xl mx-auto">
                    Transformando la educación a través de la tecnología.
                </p>

                <div className="flex justify-center items-center gap-3 mb-9">
                    {SOCIALS.map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={s.label}
                            className="np-social"
                            style={{ '--np-social': s.color }}
                        >
                            {s.icon}
                        </a>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-8 space-y-6">
                    <div className="flex justify-center">
                        <OposicionesIAPromo variant="inline" source="footer" className="text-sm" />
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                        <Link to="/catalogo" className="np-footer-link">
                            Catálogo de apps
                        </Link>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <Link to="/blog" className="np-footer-link">
                            Blog
                        </Link>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <Link to="/aviso-legal" className="np-footer-link">
                            Aviso legal
                        </Link>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <Link to="/politica-privacidad" className="np-footer-link">
                            Política de privacidad
                        </Link>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <Link to="/politica-cookies" className="np-footer-link">
                            Política de cookies
                        </Link>
                        <span className="text-white/20" aria-hidden="true">·</span>
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new Event('open-cookie-banner'))}
                            className="np-footer-link inline-flex items-center gap-1.5"
                        >
                            <Cookie className="w-3.5 h-3.5" /> Gestionar cookies
                        </button>
                    </nav>
                    {/* Calidad gráfica de este dispositivo: también gobierna los efectos
                        de la interfaz (fondo 3D, cristal, animaciones). Útil en equipos
                        modestos para forzar "Bajo". */}
                    <div className="flex justify-center">
                        <GraphicsQualitySelector className="gfxsel-on-dark np-footer-gfx" />
                    </div>
                    <p className="text-indigo-100/60">
                        Hecho con ❤️ por <a href="https://edutorregrosa.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:underline">Edu Torregrosa</a> con la ayuda de la IA.
                    </p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
