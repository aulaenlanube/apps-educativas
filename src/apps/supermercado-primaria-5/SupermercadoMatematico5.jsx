// src/apps/supermercado-primaria-5/SupermercadoMatematico5.jsx (ACTUALIZADO)

import React from 'react';
import '../_shared/SupermercadoShared.css';
import { useSupermercadoGame } from '../../hooks/useSupermercadoGame';
import TestScreen from '../_shared/TestScreen';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 1.20 }, { nombre: "Pan", emoji: "🍞", precio: 0.80 },
    { nombre: "Manzana", emoji: "🍎", precio: 0.50 }, { nombre: "Huevo", emoji: "🥚", precio: 0.30 },
    { nombre: "Zumo", emoji: "🧃", precio: 1.50 }, { nombre: "Queso", emoji: "🧀", precio: 2.50 },
    { nombre: "Galletas", emoji: "🍪", precio: 1.80 }, { nombre: "Tomate", emoji: "🍅", precio: 0.40 },
    { nombre: "Cereales", emoji: "🥣", precio: 3.00 }, { nombre: "Yogur", emoji: "🍦", precio: 0.70 }
];

const generarNuevaMision = () => {
    const tipoProblema = Math.random(); // 0 a 1

    // 40% de probabilidad: Suma de productos
    if (tipoProblema < 0.4) {
        const numProductos = Math.floor(Math.random() * 2) + 2;
        const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
        let listaDeCompra = [], totalCompra = 0;
        for (let i = 0; i < numProductos; i++) {
            const p = productosMezclados[i];
            const q = Math.floor(Math.random() * 2) + 1;
            listaDeCompra.push({ ...p, cantidad: q });
            totalCompra += p.precio * q;
        }
        const solucion = parseFloat(totalCompra.toFixed(2));
        const texto = `Compras ${listaDeCompra.map(item => `${item.cantidad} ${item.nombre} ${item.emoji}`).join(' y ')}. ¿Cuánto tienes que pagar en total?`;
        return { texto, solucion };
    } 
    // 40% de probabilidad: Calcular el cambio
    else if (tipoProblema < 0.8) {
        let totalCompra = 0;
        while (totalCompra === 0 || totalCompra > 18) { // Asegurar una compra válida
            const p1 = productos[Math.floor(Math.random() * productos.length)];
            const p2 = productos[Math.floor(Math.random() * productos.length)];
            totalCompra = p1.precio + p2.precio;
        }
        totalCompra = parseFloat(totalCompra.toFixed(2));
        const billetes = [5, 10, 20];
        const billeteUsado = billetes.find(b => b > totalCompra) || 20;
        const solucion = parseFloat((billeteUsado - totalCompra).toFixed(2));
        const texto = `Compras productos por valor de ${totalCompra.toFixed(2).replace('.', ',')}€ y pagas con un billete de ${billeteUsado}€. ¿Cuánto dinero te devuelven?`;
        return { texto, solucion };
    }
    // 20% de probabilidad: Descuento simple
    else {
        const producto = productos.find(p => p.precio >= 2); // Un producto con precio suficiente para descuento
        const descuentos = [10, 50];
        const descuento = descuentos[Math.floor(Math.random() * descuentos.length)];
        const cantidadDescontada = (producto.precio * descuento) / 100;
        const solucion = parseFloat((producto.precio - cantidadDescontada).toFixed(2));
        const texto = `Un ${producto.nombre} ${producto.emoji} cuesta ${producto.precio.toFixed(2).replace('.', ',')}€, pero tiene un descuento del ${descuento}%. ¿Cuál es el precio final?`;
        return { texto, solucion };
    }
};

const SupermercadoMatematico5 = () => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: true });

    if (game.isTestMode) {
        return <TestScreen game={game} productos={productos} />;
    }
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio.toFixed(2).replace('.', ',')}€</div>)}</div>
            
            <div className="mode-selection">
                <button onClick={game.startPracticeMission} className="btn-mode active">Práctica Libre</button>
                <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
            </div>

            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{game.mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Cuál es el resultado? (€)</label>
                <input type="text" value={game.respuesta} onChange={(e) => game.setRespuesta(e.target.value)} placeholder="Escribe el resultado"/>
                <button onClick={game.checkPracticeAnswer}>Comprobar</button>
            </div>
            <div id="feedback" className={game.feedback.clase}>{game.feedback.texto}</div>
            <button id="btnNuevaMision" onClick={game.startPracticeMission}>¡Otra Misión!</button>
        </div>
    );
};

export default SupermercadoMatematico5;