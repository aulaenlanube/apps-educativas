import React from 'react';
import './OrdenaLaFraseShared.css';

const OrdenaLaFraseUI = ({
    palabrasOrigen, palabrasDestino, feedback,
    checkPracticeAnswer, startPracticeMission, startTest,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    // --- IMPORTAMOS LOS NUEVOS PROPS ---
    handleTouchStart, handleTouchMove, handleTouchEnd,
    dropZoneRef, originZoneRef
}) => {
    return (
        <div className="ordena-frase-container" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <h1 className="ordena-frase-main-title gradient-text text-5xl mb-4">📝 Ordena la Frase</h1>
            <p className="instrucciones">Arrastra las palabras para formar una frase con sentido.</p>

            <div className="mode-selection">
                <button className="btn-mode active">Práctica Libre</button>
                <button onClick={startTest} className="btn-mode">Iniciar Test</button>
            </div>

            {/* --- AÑADIMOS EL REF A LA ZONA DE DESTINO --- */}
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
            {/* --- AÑADIMOS EL REF A LA ZONA DE ORIGEN --- */}
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