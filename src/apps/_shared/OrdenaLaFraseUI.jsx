// src/apps/_shared/OrdenaLaFraseUI.jsx
import React from 'react';
import './OrdenaLaFraseShared.css';

const OrdenaLaFraseUI = ({
    palabrasOrigen, palabrasDestino, feedback,
    checkPracticeAnswer, startPracticeMission, startTest,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    dropZoneRef, originZoneRef,
    fontStyle, fontStyleIndex, handleFontStyleChange
}) => {

    return (
        <div className={`ordena-frase-container font-${fontStyle}`} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            
            <h1 className="ordena-frase-main-title gradient-text text-5xl mb-4">📝 Ordena la Frase</h1>
            <p className="instrucciones">Arrastra las palabras para formar una frase con sentido.</p>

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

            <div id="zona-frase" className="zona-destino" 
                 ref={dropZoneRef}
                 onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'destino')}>
                {palabrasDestino.map(p => (
                    <div key={p.id} data-id={p.id} className="palabra" draggable
                         onDragStart={(e) => handleDragStart(e, p)} onDragEnd={handleDragEnd}
                         onTouchStart={(e) => handleTouchStart(e, p)}>
                        {p.texto}
                    </div>
                ))}
            </div>
            
            <div id="zona-palabras" className="zona-origen"
                 ref={originZoneRef}
                 onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'origen')}>
                {palabrasOrigen.map(p => (
                    <div key={p.id} data-id={p.id} className="palabra" draggable
                         onDragStart={(e) => handleDragStart(e, p)} onDragEnd={handleDragEnd}
                         onTouchStart={(e) => handleTouchStart(e, p)}>
                        {p.texto}
                    </div>
                ))}
            </div>
            <div className="controles">
                <button onClick={checkPracticeAnswer}>Comprobar</button>
                <button onClick={startPracticeMission} className="btn-saltar">Otra Frase</button>
            </div>
            <p id="feedback" className={feedback.clase}>{feedback.texto}</p>
        </div>
    );
};

export default OrdenaLaFraseUI;