// src/apps/supermercado-primaria-6/SupermercadoMatematico6.jsx (ACTUALIZADO)

import React from 'react';
import '@/apps/_shared/SupermercadoShared.css';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import TestScreen from '@/apps/_shared/TestScreen';

const productos = [
    { nombre: "Caja de Leche", emoji: "🥛", precio: 8.00 }, { nombre: "Bandeja de Pan", emoji: "🍞", precio: 5.00 },
    { nombre: "Caja de Manzanas", emoji: "🍎", precio: 10.00 }, { nombre: "Docena de Huevos", emoji: "🥚", precio: 4.00 },
    { nombre: "Pack de Zumos", emoji: "🧃", precio: 6.00 }, { nombre: "Pieza de Queso", emoji: "🧀", precio: 12.00 },
    { nombre: "Paquete de Arroz", emoji: "🍚", precio: 3.50 }, { nombre: "Botella de Aceite", emoji: "🫒", precio: 7.50 },
];
const descuentos = [10, 20, 25, 50];

const generarNuevaMision = () => {
    const tipoProblema = Math.random();

    // 50% de probabilidad: Descuento sobre un producto Y calcular el cambio
    if (tipoProblema < 0.5) {
        const producto = productos.find(p => p.precio >= 5) || productos[0];
        const descuento = descuentos[Math.floor(Math.random() * descuentos.length)];
        const billetes = [10, 20, 50];
        
        const precioConDescuento = producto.precio * (1 - descuento / 100);
        const billeteUsado = billetes.find(b => b > precioConDescuento) || 50;
        const solucion = parseFloat((billeteUsado - precioConDescuento).toFixed(2));

        const texto = `Compras un/a ${producto.nombre} ${producto.emoji} de ${producto.precio.toFixed(2).replace('.', ',')}€ con un ${descuento}% de descuento. Si pagas con un billete de ${billeteUsado}€, ¿cuánto te devuelven?`;
        return { texto, solucion };
    } 
    // 50% de probabilidad: Suma de varios productos Y descuento sobre el total
    else {
        const p1 = productos[Math.floor(Math.random() * productos.length)];
        const p2 = productos[Math.floor(Math.random() * productos.length)];
        const descuento = descuentos[Math.floor(Math.random() * descuentos.length)];
        
        const totalSinDescuento = p1.precio + p2.precio;
        const cantidadDescontada = (totalSinDescuento * descuento) / 100;
        const solucion = parseFloat((totalSinDescuento - cantidadDescontada).toFixed(2));

        const texto = `Compras un/a ${p1.nombre} (${p1.precio.toFixed(2).replace('.', ',')}€) y un/a ${p2.nombre} (${p2.precio.toFixed(2).replace('.', ',')}€). Al total de la compra se le aplica un cupón del ${descuento}% de descuento. ¿Cuánto pagas al final?`;
        return { texto, solucion };
    }
};

const SupermercadoMatematico6 = () => {
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
                <label htmlFor="respuesta">¿Precio final? (€)</label>
                <input type="text" value={game.respuesta} onChange={(e) => game.setRespuesta(e.target.value)} placeholder="Precio con descuento"/>
                <button onClick={game.checkPracticeAnswer}>Comprobar</button>
            </div>
            <div id="feedback" className={game.feedback.clase}>{game.feedback.texto}</div>
            <button id="btnNuevaMision" onClick={game.startPracticeMission}>¡Otra Misión!</button>
        </div>
    );
};

export default SupermercadoMatematico6;