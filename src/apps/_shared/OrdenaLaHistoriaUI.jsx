// src/apps/_shared/OrdenaLaHistoriaUI.jsx
import React from 'react';
import './OrdenaLaHistoriaShared.css';

const OrdenaLaHistoriaUI = ({
    frasesDesordenadas, feedback, checkStory, cargarSiguienteHistoria, startTest,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd, dropZoneRef,
    fontStyle, fontStyleIndex, handleFontStyleChange
}) => {
    return (
        <div className={`ordena-historia-container font-${fontStyle}`} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <h1 className="main-title text-5xl mb-4">
                <span role="img" aria-label="Icono de libros">📚</span> <span className="gradient-text">Ordena la Historia</span>
            </h1>
            <p className="instrucciones">Arrastra las frases para ordenarlas y que la historia tenga sentido.</p>

            <div className="mode-selection">
                <button className="btn-mode active">Práctica Libre</button>
                <button onClick={startTest} className="btn-mode">Iniciar Test</button>
            </div>

            {/* --- SLIDER DE TIPOGRAFÍA --- */}
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

            <div className="zona-frases" ref={dropZoneRef} onDrop={handleDrop} onDragOver={handleDragOver}>
                {frasesDesordenadas.map((frase) => (
                    <div
                        key={frase.id}
                        data-id={frase.id}
                        className="frase"
                        draggable
                        onDragStart={(e) => handleDragStart(e, frase)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, frase)}
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