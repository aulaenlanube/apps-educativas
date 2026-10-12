import React, { useState, useEffect } from 'react';
import { Atom, MousePointerClick, Link2, FlaskConical, X, Check } from 'lucide-react';
import { GameButton } from '../_shared/kit';
import { FlaskArt } from './CrafteoArt';
import './MesaCrafteo.css'; // Reusing the main CSS for consistency

const STEPS = [
    { Icon: Atom, title: 'Selecciona elementos', text: 'Elige los átomos que necesitas en el panel de la derecha.' },
    { Icon: MousePointerClick, title: 'Construye en 3D', text: 'Haz clic en el espacio para colocar el primer átomo. Arrastra para girar la cámara y usa la rueda para el zoom.' },
    { Icon: Link2, title: 'Crea enlaces', text: 'Haz clic en los puertos verdes de un átomo para conectar ahí el elemento seleccionado.' },
    { Icon: FlaskConical, title: 'Craftea', text: 'Cuando tengas la estructura correcta, pulsa Craftear (o Enviar respuesta en el examen).' },
];

const TutorialModal = ({ onClose }) => {
    const [dontShowAgain] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animation delay
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('mesa_crafteo_tutorial_seen', 'true');
        }
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <div className={`mc-tutorial ${isVisible ? 'is-visible' : ''}`} onClick={handleClose}>
            <div className="mc-tutorial__card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Cómo se juega">
                <button type="button" className="gk-iconbtn mc-tutorial__close" onClick={handleClose} aria-label="Cerrar">
                    <X size={18} />
                </button>
                <div className="mc-tutorial__hero">
                    <FlaskArt status="ok" className="mc-tutorial__art" />
                    <div>
                        <span className="mc-kicker">Laboratorio de química</span>
                        <h2>Bienvenido al laboratorio</h2>
                        <p>Experimenta y crea moléculas reales conectando átomos en un entorno 3D.</p>
                    </div>
                </div>

                <ol className="mc-tutorial__steps">
                    {STEPS.map(({ Icon, title, text }, i) => (
                        <li key={title} className="mc-tutorial__step" style={{ '--i': i }}>
                            <span className="mc-tutorial__num"><Icon size={18} /><b>{i + 1}</b></span>
                            <div>
                                <strong>{title}</strong>
                                <p>{text}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                <div className="mc-tutorial__foot">
                    <GameButton variant="success" size="lg" icon={Check} onClick={handleClose}>
                        ¡Entendido, vamos allá!
                    </GameButton>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
