import React from 'react';
import './OrdenaLaFraseShared.css';

const OrdenaLaFraseUI = ({
    palabrasOrigen, palabrasDestino, feedback,
    checkPracticeAnswer, startPracticeMission, startTest,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop
}) => {
    return (
        <div className="ordena-frase-container">
            {/* Título con nuevo estilo */}
            <h1 className="ordena-frase-main-title gradient-text text-5xl mb-4">📝 Ordena la Frase</h1>
            <p className="instrucciones">Arrastra las palabras para formar una frase con sentido.</p>

            {/* Botones con nuevo estilo */}
            <div className="mode-selection">
                <button className="btn-mode active">Práctica Libre</button>
                <button onClick={startTest} className="btn-mode">Iniciar Test</button>
            </div>

            {/* El resto del componente no cambia */}
            <div id="zona-frase" className="zona-destino" 
                 onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'destino')}>
                {palabrasDestino.map(p => (
                    <div key={p.id} id={p.id} className="palabra" draggable
                         onDragStart={(e) => handleDragStart(e, p)} onDragEnd={handleDragEnd}>
                        {p.texto}
                    </div>
                ))}
            </div>
            <div id="zona-palabras" className="zona-origen"
                 onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'origen')}>
                {palabrasOrigen.map(p => (
                    <div key={p.id} id={p.id} className="palabra" draggable
                         onDragStart={(e) => handleDragStart(e, p)} onDragEnd={handleDragEnd}>
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