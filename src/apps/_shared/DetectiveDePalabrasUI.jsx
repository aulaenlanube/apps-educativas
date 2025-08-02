// src/apps/_shared/DetectiveDePalabrasUI.jsx (CORREGIDO)
import React from 'react';
import './DetectiveDePalabrasShared.css';

const DetectiveDePalabrasUI = ({ game }) => {
    const {
        letras,
        feedback,
        fraseResuelta,
        toggleSeparador,
        comprobarFrase,
        siguienteFrase,
        startTest,
        fontStyle,
        fontStyleIndex,
        handleFontStyleChange
    } = game;

    return (
        // CORRECCIÓN: Se utiliza la sintaxis de template literal (` `) para que la clase sea dinámica
        <div className={`detective-container font-${fontStyle}`}>
            <h1 className="detective-title gradient-text text-5xl mb-4">🕵️‍♂️ Detective de Palabras</h1>
            <p className="instrucciones">Haz clic entre las letras para separar las palabras. ¡Luego comprueba tu respuesta!</p>

            <div className="mode-selection">
                <button className="btn-mode active">Práctica Libre</button>
                <button onClick={startTest} className="btn-mode">Iniciar Test</button>
            </div>

            <div className="font-slider-container">
                <div className="font-slider-labels">
                    <span>Imprenta</span>
                    <span>Ligada</span>
                    <span>Mayúsculas</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={fontStyleIndex}
                    onChange={handleFontStyleChange}
                    className="font-slider"
                    aria-label="Selector de tipografía"
                />
            </div>

            <div className="detective-frase-container">
                {letras.map((letra, index) => (
                    <React.Fragment key={index}>
                        <span className="detective-letra" onClick={() => toggleSeparador(index)}>
                            {letra.char}
                        </span>
                        {letra.separador && index < letras.length - 1 && (
                            <span 
                                className={`detective-separador ${letra.status}`} 
                                onClick={() => toggleSeparador(index)}
                            ></span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="controles">
                {!fraseResuelta ? (
                    <>
                        <button onClick={comprobarFrase}>¡Comprobar!</button>
                        <button onClick={siguienteFrase} className="btn-otra-frase">Otra Frase</button>
                    </>
                ) : (
                    <button onClick={siguienteFrase} className="btn-siguiente">
                        Siguiente Frase
                    </button>
                )}
            </div>

            <p className={`detective-feedback ${feedback.clase}`}>{feedback.texto}</p>
        </div>
    );
};

export default DetectiveDePalabrasUI;