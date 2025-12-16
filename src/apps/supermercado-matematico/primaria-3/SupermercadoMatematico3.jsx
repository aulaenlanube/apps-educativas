// src/apps/supermercado-matematico/primaria-3/SupermercadoMatematico3.jsx
import React from 'react';
import '@/apps/_shared/SupermercadoShared.css';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import TestScreen from '@/apps/_shared/TestScreen';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 2 }, { nombre: "Pan", emoji: "🍞", precio: 1 },
    { nombre: "Manzanas", emoji: "🍎", precio: 3 }, { nombre: "Huevos", emoji: "🥚", precio: 4 },
    { nombre: "Zumo", emoji: "🧃", precio: 2 }, { nombre: "Queso", emoji: "🧀", precio: 5 },
    { nombre: "Galletas", emoji: "🍪", precio: 3 }, { nombre: "Tomates", emoji: "🍅", precio: 2 },
];

const generarNuevaMision = () => {
    const producto = productos[Math.floor(Math.random() * productos.length)];
    const cantidad = Math.floor(Math.random() * 4) + 2;
    const solucionCorrecta = producto.precio * cantidad;
    const textoMision = `Compras ${cantidad} de ${producto.nombre} ${producto.emoji}. Si cada uno cuesta ${producto.precio}€, ¿cuánto pagarás en total?`;
    return { texto: textoMision, solucion: solucionCorrecta };
};

const SupermercadoMatematico3 = () => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: true });

    if (game.isTestMode) {
        return <TestScreen game={game} productos={productos} />;
    }

    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio}€</div>)}</div>
            
            <div className="mode-selection">
                <button onClick={game.startPracticeMission} className="btn-mode active">Práctica Libre</button>
                <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
            </div>

            {/* AÑADIDO ref={game.containerRef} AQUÍ */}
            <div className="mision" ref={game.containerRef}>
                <h2>¡Tu Misión!</h2>
                <p id="textoMision">{game.mision.texto}</p>
            </div>

            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Cuál es el total? (€)</label>
                <input type="number" value={game.respuesta} onChange={(e) => game.setRespuesta(e.target.value)} />
                <button onClick={game.checkPracticeAnswer}>Comprobar</button>
            </div>
            <div id="feedback" className={game.feedback.clase}>{game.feedback.texto}</div>
            <button id="btnNuevaMision" onClick={game.startPracticeMission}>¡Otra Misión!</button>
        </div>
    );
};

export default SupermercadoMatematico3;