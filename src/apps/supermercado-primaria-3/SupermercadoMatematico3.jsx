// src/apps/supermercado-primaria-3/SupermercadoMatematico3.jsx

import React, { useState, useEffect } from 'react';
import './Supermercado.css';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 2 }, { nombre: "Pan", emoji: "🍞", precio: 1 },
    { nombre: "Manzanas", emoji: "🍎", precio: 3 }, { nombre: "Huevos", emoji: "🥚", precio: 4 },
    { nombre: "Zumo", emoji: "🧃", precio: 2 }, { nombre: "Queso", emoji: "🧀", precio: 5 },
    { nombre: "Galletas", emoji: "🍪", precio: 3 }, { nombre: "Tomates", emoji: "🍅", precio: 2 },
];

const SupermercadoMatematico3 = () => {
    const [mision, setMision] = useState({ texto: '', solucion: 0 });
    const [respuesta, setRespuesta] = useState('');
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });

    const generarNuevaMision = () => {
        setFeedback({ texto: '', clase: '' });
        setRespuesta('');

        const producto = productos[Math.floor(Math.random() * productos.length)];
        const cantidad = Math.floor(Math.random() * 4) + 2; // Entre 2 y 5 unidades
        
        const solucionCorrecta = producto.precio * cantidad;
        const textoMision = `Compras ${cantidad} de ${producto.nombre} ${producto.emoji}. Si cada uno cuesta ${producto.precio}€, ¿cuánto pagarás en total?`;
        
        setMision({ texto: textoMision, solucion: solucionCorrecta });
    };

    useEffect(generarNuevaMision, []);

    const comprobarRespuesta = () => {
        if (parseInt(respuesta) === mision.solucion) {
            setFeedback({ texto: "¡Multiplicación correcta!", clase: 'correcta' });
        } else {
            setFeedback({ texto: `¡Uy! La respuesta correcta era ${mision.solucion}€.`, clase: 'incorrecta' });
        }
    };
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio}€</div>)}</div>
            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Cuál es el total? (€)</label>
                <input type="number" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
                <button onClick={comprobarRespuesta}>Comprobar</button>
            </div>
            <div id="feedback" className={feedback.clase}>{feedback.texto}</div>
            <button id="btnNuevaMision" onClick={generarNuevaMision}>¡Otra Misión!</button>
        </div>
    );
};
export default SupermercadoMatematico3;