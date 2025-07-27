// src/apps/supermercado-primaria-4/SupermercadoMatematico4.jsx

import React, { useState, useEffect } from 'react';
import './Supermercado.css';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 1.25 }, { nombre: "Pan", emoji: "🍞", precio: 0.75 },
    { nombre: "Manzana", emoji: "🍎", precio: 0.50 }, { nombre: "Plátano", emoji: "🍌", precio: 0.60 },
    { nombre: "Zumo", emoji: "🧃", precio: 1.50 }, { nombre: "Queso", emoji: "🧀", precio: 2.80 },
    { nombre: "Galletas", emoji: "🍪", precio: 1.90 }, { nombre: "Tomate", emoji: "🍅", precio: 0.45 },
];

const SupermercadoMatematico4 = () => {
    const [mision, setMision] = useState({ texto: '', solucion: 0 });
    const [respuesta, setRespuesta] = useState('');
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });

    const generarNuevaMision = () => {
        setFeedback({ texto: '', clase: '' });
        setRespuesta('');

        const numProductos = 2;
        const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
        const listaDeCompra = productosMezclados.slice(0, numProductos);
        
        const totalCompra = listaDeCompra.reduce((acc, p) => acc + p.precio, 0);
        const solucionCorrecta = parseFloat(totalCompra.toFixed(2));

        const textoMision = `Compras 1 ${listaDeCompra[0].nombre} ${listaDeCompra[0].emoji} y 1 ${listaDeCompra[1].nombre} ${listaDeCompra[1].emoji}. ¿Cuánto es el total?`;
        
        setMision({ texto: textoMision, solucion: solucionCorrecta });
    };

    useEffect(generarNuevaMision, []);

    const comprobarRespuesta = () => {
        const respuestaUsuario = parseFloat(respuesta.replace(',', '.'));
        if (isNaN(respuestaUsuario)) {
            setFeedback({ texto: "Escribe un número con decimales, por ejemplo: 3.50", clase: 'incorrecta' });
            return;
        }
        if (Math.abs(respuestaUsuario - mision.solucion) < 0.001) {
            setFeedback({ texto: "¡Perfecto! Suma con decimales dominada.", clase: 'correcta' });
        } else {
            setFeedback({ texto: `¡Revisa los céntimos! La respuesta era ${mision.solucion.toFixed(2)}€.`, clase: 'incorrecta' });
        }
    };
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio.toFixed(2)}€</div>)}</div>
            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Total a pagar? (€)</label>
                <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Ej: 4,75"/>
                <button onClick={comprobarRespuesta}>Comprobar</button>
            </div>
            <div id="feedback" className={feedback.clase}>{feedback.texto}</div>
            <button id="btnNuevaMision" onClick={generarNuevaMision}>¡Otra Misión!</button>
        </div>
    );
};
export default SupermercadoMatematico4;