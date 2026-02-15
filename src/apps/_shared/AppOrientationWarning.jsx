import React from 'react';
import './AppOrientationWarning.css';

const AppOrientationWarning = () => {
    return (
        <div className="app-orientation-warning">
            <div className="orientation-content">
                <span className="rotate-icon">📱</span>
                <h2>Gira la pantalla</h2>
                <p>
                    Esta es una aplicación compleja que está diseñada para ser ejecutada desde un equipo de escritorio, si aun así quieres utilizarla desde el dispositivo actual, gira la pantalla para poder visualizar mejor la app
                </p>
            </div>
        </div>
    );
};

export default AppOrientationWarning;
