import React, { useState, useEffect } from 'react';
import './MesaCrafteo.css'; // Reusing the main CSS for consistency

const TutorialModal = ({ onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);
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
        <div className={`mc-tutorial-overlay ${isVisible ? 'visible' : ''}`}>
            <div className="mc-tutorial-card">
                <div className="mc-tutorial-icon">🧪</div>
                <h2>Bienvenido al Laboratorio</h2>
                <p className="mc-tutorial-intro">
                    Aquí podrás experimentar y crear moléculas reales conectando átomos en un entorno 3D.
                </p>

                <div className="mc-tutorial-steps">
                    <div className="mc-step">
                        <span className="mc-step-num">1</span>
                        <p><strong>Selecciona Elementos:</strong> Elige los átomos que necesitas del panel derecho.</p>
                    </div>
                    <div className="mc-step">
                        <span className="mc-step-num">2</span>
                        <p><strong>Construye en 3D:</strong> Haz clic en el espacio para colocar átomos. Usa el click derecho para rotar la cámara.</p>
                    </div>
                    <div className="mc-step">
                        <span className="mc-step-num">3</span>
                        <p><strong>Crea Enlaces:</strong> Haz clic en los puertos verdes de los átomos para conectarlos entre sí.</p>
                    </div>
                    <div className="mc-step">
                        <span className="mc-step-num">4</span>
                        <p><strong>Craftea:</strong> Cuando tengas la estructura correcta, pulsa el botón de Craftear.</p>
                    </div>
                </div>

                <div className="mc-tutorial-footer" style={{ justifyContent: 'center' }}>
                    <button className="mc-tutorial-btn" onClick={handleClose}>
                        ¡Entendido, vamos allá!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
