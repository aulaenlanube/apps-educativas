// src/apps/supermercado-primaria-1/SupermercadoMatematico1.jsx
import React, { useState, useEffect } from 'react';
import './Supermercado.css';

const productos = [ { nombre: "Leche", emoji: "🥛", precio: 1 }, { nombre: "Pan", emoji: "🍞", precio: 1 }, { nombre: "Manzana", emoji: "🍎", precio: 1 }, { nombre: "Huevo", emoji: "🥚", precio: 2 }, { nombre: "Zumo", emoji: "🧃", precio: 2 }, { nombre: "Queso", emoji: "🧀", precio: 3 }];

const SupermercadoMatematico1 = () => {
    const [mision, setMision] = useState({ texto: '', solucion: 0 });
    const [respuesta, setRespuesta] = useState('');
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });

    const generarNuevaMision = () => {
        setFeedback({ texto: '', clase: '' }); setRespuesta('');
        const numProductos = 2; // Siempre 2 productos
        const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
        let listaDeCompra = [];
        let solucionCorrecta = 0;

        for (let i = 0; i < numProductos; i++) {
            const producto = productosMezclados[i];
            if (solucionCorrecta + producto.precio > 10) continue; // Sumas hasta 10
            listaDeCompra.push({ ...producto, cantidad: 1 });
            solucionCorrecta += producto.precio;
        }
        
        const textoMision = listaDeCompra.map(item => `1 ${item.nombre} ${item.emoji}`).join(' y ');
        setMision({ texto: `Compra: ${textoMision}.`, solucion: solucionCorrecta });
    };

    useEffect(generarNuevaMision, []);

    const comprobarRespuesta = () => {
        if (parseInt(respuesta) === mision.solucion) {
            setFeedback({ texto: "¡Correcto!", clase: 'correcta' });
        } else {
            setFeedback({ texto: `Casi... La respuesta era ${mision.solucion}€.`, clase: 'incorrecta' });
        }
    };
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">
    🛒 Supermercado Matemático
</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio}€</div>)}</div>
            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Cuánto cuesta en total? (€)</label>
                <input type="number" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
                <button onClick={comprobarRespuesta}>Comprobar</button>
            </div>
            <div id="feedback" className={feedback.clase}>{feedback.texto}</div>
            <button id="btnNuevaMision" onClick={generarNuevaMision}>¡Otra Misión!</button>
        </div>
    );
};
export default SupermercadoMatematico1;