// src/apps/_shared/OrdenaLaHistoriaUI.jsx (MODIFICADO)
import React from 'react';
import './OrdenaLaHistoriaShared.css';

const OrdenaLaHistoriaUI = ({
    frasesDesordenadas, feedback, checkStory, cargarSiguienteHistoria, startTest,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    // --- Nuevos props para eventos táctiles y refs ---
    handleTouchStart, handleTouchMove, handleTouchEnd, dropZoneRef
}) => {
    return (
        // --- Añadimos los manejadores de eventos táctiles al contenedor principal ---
        <div className="ordena-historia-container" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <h1 className="main-title gradient-text text-5xl mb-4">📚 Ordena la Historia</h1>
            <p className="instrucciones">Arrastra las frases para ordenarlas y que la historia tenga sentido.</p>

            <div className="mode-selection">
                <button className="btn-mode active">Práctica Libre</button>
                <button onClick={startTest} className="btn-mode">Iniciar Test</button>
            </div>

            {/* --- Asignamos el ref a la zona donde se sueltan las frases --- */}
            <div className="zona-frases" ref={dropZoneRef} onDrop={handleDrop} onDragOver={handleDragOver}>
                {frasesDesordenadas.map((frase) => (
                    <div
                        key={frase.id}
                        data-id={frase.id}
                        className="frase"
                        draggable
                        onDragStart={(e) => handleDragStart(e, frase)}
                        onDragEnd={handleDragEnd}
                        // --- Añadimos el evento onTouchStart a cada frase ---
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