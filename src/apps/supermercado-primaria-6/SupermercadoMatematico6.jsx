// src/apps/supermercado-primaria-6/SupermercadoMatematico6.jsx

import React, { useState, useEffect } from 'react';
import './Supermercado.css';

const productos = [
    { nombre: "Caja de Leche", emoji: "🥛", precio: 8.00 }, { nombre: "Bandeja de Pan", emoji: "🍞", precio: 5.00 },
    { nombre: "Caja de Manzanas", emoji: "🍎", precio: 10.00 }, { nombre: "Docena de Huevos", emoji: "🥚", precio: 4.00 },
    { nombre: "Pack de Zumos", emoji: "🧃", precio: 6.00 }, { nombre: "Pieza de Queso", emoji: "🧀", precio: 12.00 },
];

const descuentos = [10, 20, 25, 50];

const SupermercadoMatematico6 = () => {
    const [mision, setMision] = useState({ texto: '', solucion: 0 });
    const [respuesta, setRespuesta] = useState('');
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });

    const generarNuevaMision = () => {
        setFeedback({ texto: '', clase: '' });
        setRespuesta('');

        const producto = productos[Math.floor(Math.random() * productos.length)];
        const descuento = descuentos[Math.floor(Math.random() * descuentos.length)];
        
        const cantidadDescontada = (producto.precio * descuento) / 100;
        const solucionCorrecta = parseFloat((producto.precio - cantidadDescontada).toFixed(2));

        const textoMision = `El producto ${producto.nombre} ${producto.emoji} cuesta ${producto.precio.toFixed(2)}€, pero hoy tiene un ${descuento}% de descuento. ¿Cuál es el precio final?`;
        
        setMision({ texto: textoMision, solucion: solucionCorrecta });
    };

    useEffect(generarNuevaMision, []);

    const comprobarRespuesta = () => {
        const respuestaUsuario = parseFloat(respuesta.replace(',', '.'));
        if (isNaN(respuestaUsuario)) {
            setFeedback({ texto: "Escribe un número.", clase: 'incorrecta' });
            return;
        }
        if (Math.abs(respuestaUsuario - mision.solucion) < 0.001) {
            setFeedback({ texto: "¡Cálculo de descuento perfecto!", clase: 'correcta' });
        } else {
            setFeedback({ texto: `¡Cuidado con los porcentajes! La respuesta era ${mision.solucion.toFixed(2)}€.`, clase: 'incorrecta' });
        }
    };
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio.toFixed(2)}€</div>)}</div>
            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Precio final? (€)</label>
                <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Precio con descuento"/>
                <button onClick={comprobarRespuesta}>Comprobar</button>
            </div>
            <div id="feedback" className={feedback.clase}>{feedback.texto}</div>
            <button id="btnNuevaMision" onClick={generarNuevaMision}>¡Otra Misión!</button>
        </div>
    );
};
export default SupermercadoMatematico6;