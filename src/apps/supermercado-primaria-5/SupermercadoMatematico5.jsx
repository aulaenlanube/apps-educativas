// src/apps/supermercado-primaria-5/SupermercadoMatematico5.jsx

import React, { useState, useEffect } from 'react';
import './Supermercado.css';

// Base de datos de productos con precios con decimales
const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 1.20 }, { nombre: "Pan", emoji: "🍞", precio: 0.80 },
    { nombre: "Manzana", emoji: "🍎", precio: 0.50 }, { nombre: "Huevo", emoji: "🥚", precio: 0.30 },
    { nombre: "Zumo", emoji: "🧃", precio: 1.50 }, { nombre: "Queso", emoji: "🧀", precio: 2.50 },
    { nombre: "Galletas", emoji: "🍪", precio: 1.80 }, { nombre: "Tomate", emoji: "🍅", precio: 0.40 },
];

const SupermercadoMatematico5 = () => {
    const [mision, setMision] = useState({ texto: '', solucion: 0, tipo: 'suma' });
    const [respuesta, setRespuesta] = useState('');
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });

    const generarNuevaMision = () => {
        setFeedback({ texto: '', clase: '' });
        setRespuesta('');

        const esProblemaDeSuma = Math.random() > 0.5;

        const numProductos = Math.floor(Math.random() * 2) + 2;
        const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
        let listaDeCompra = [];
        let totalCompra = 0;

        for (let i = 0; i < numProductos; i++) {
            const producto = productosMezclados[i];
            const cantidad = Math.floor(Math.random() * 2) + 1;
            listaDeCompra.push({ ...producto, cantidad });
            totalCompra += producto.precio * cantidad;
        }
        
        totalCompra = parseFloat(totalCompra.toFixed(2));
        const textoCompra = listaDeCompra.map(item => `${item.cantidad} ${item.nombre} ${item.emoji}`).join(' y ');

        if (esProblemaDeSuma) {
            setMision({
                texto: `Compras ${textoCompra}. ¿Cuánto tienes que pagar en total?`,
                solucion: totalCompra,
                tipo: 'suma'
            });
        } else {
            const billetes = [5, 10, 20];
            const billeteUsado = billetes.find(b => b > totalCompra) || 20;
            const cambio = parseFloat((billeteUsado - totalCompra).toFixed(2));

            setMision({
                texto: `Compras ${textoCompra} y pagas con un billete de ${billeteUsado}€. ¿Cuánto dinero te devuelven?`,
                solucion: cambio,
                tipo: 'resta'
            });
        }
    };

    useEffect(generarNuevaMision, []);

    const comprobarRespuesta = () => {
        const respuestaUsuario = parseFloat(respuesta.replace(',', '.'));
        if (isNaN(respuestaUsuario)) {
            setFeedback({ texto: "Por favor, escribe un número.", clase: 'incorrecta' });
            return;
        }
        if (Math.abs(respuestaUsuario - mision.solucion) < 0.001) {
            setFeedback({ texto: "¡Correcto! ¡Muy bien!", clase: 'correcta' });
        } else {
            setFeedback({ texto: `Casi... La respuesta correcta era ${mision.solucion.toFixed(2)}€. ¡Inténtalo de nuevo!`, clase: 'incorrecta' });
        }
    };
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio.toFixed(2)}€</div>)}</div>
            <div className="mision">
                <h2>¡Tu Misión!</h2>
                <p id="textoMision">{mision.texto}</p>
            </div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Cuál es el resultado? (€)</label>
                <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Escribe el resultado"/>
                <button onClick={comprobarRespuesta}>Comprobar</button>
            </div>
            <div id="feedback" className={feedback.clase}>{feedback.texto}</div>
            <button id="btnNuevaMision" onClick={generarNuevaMision}>¡Otra Misión!</button>
        </div>
    );
};
export default SupermercadoMatematico5;