import React from 'react';
import './OrdenaLaHistoriaShared.css';

const OrdenaLaHistoriaUI = ({
    frasesDesordenadas, feedback, checkStory, cargarSiguienteHistoria, startTest,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop
}) => {
    return (
        <div className="ordena-historia-container">
            <h1 className="main-title gradient-text text-5xl mb-4">📚 Ordena la Historia</h1>
            <p className="instrucciones">Arrastra las frases para ordenarlas y que la historia tenga sentido.</p>

            <div className="mode-selection">
                <button className="btn-mode active">Práctica Libre</button>
                <button onClick={startTest} className="btn-mode">Iniciar Test</button>
            </div>

            <div className="zona-frases" onDrop={handleDrop} onDragOver={handleDragOver}>
                {frasesDesordenadas.map((frase) => (
                    <div
                        key={frase.id}
                        data-id={frase.id}
                        className="frase"
                        draggable
                        onDragStart={(e) => handleDragStart(e, frase)}
                        onDragEnd={handleDragEnd}
                    >
                        {frase.texto}
                    </div>
                ))}
            </div>

            <div className="controles">
                <button onClick={checkStory}>Comprobar</button>
                <button onClick={cargarSiguienteHistoria} className="btn-saltar">Otra Historia</button>
            </div>
            <p id="feedback" className={feedback.clase}>{feedback.texto}</p>
        </div>
    );
};

export default OrdenaLaHistoriaUI;