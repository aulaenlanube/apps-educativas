import React from 'react';
import '@/apps/_shared/SupermercadoShared.css';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import TestScreen from '@/apps/_shared/TestScreen';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 1.25 }, { nombre: "Pan", emoji: "🍞", precio: 0.75 },
    { nombre: "Manzana", emoji: "🍎", precio: 0.50 }, { nombre: "Plátano", emoji: "🍌", precio: 0.60 },
    { nombre: "Zumo", emoji: "🧃", precio: 1.50 }, { nombre: "Queso", emoji: "🧀", precio: 2.80 },
    { nombre: "Galletas", emoji: "🍪", precio: 1.90 }, { nombre: "Tomate", emoji: "🍅", precio: 0.45 },
];

const generarNuevaMision = () => {
    const numProductos = 2;
    const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
    const listaDeCompra = productosMezclados.slice(0, numProductos);
    const totalCompra = listaDeCompra.reduce((acc, p) => acc + p.precio, 0);
    const solucionCorrecta = parseFloat(totalCompra.toFixed(2));
    const textoMision = `Compras 1 ${listaDeCompra[0].nombre} ${listaDeCompra[0].emoji} y 1 ${listaDeCompra[1].nombre} ${listaDeCompra[1].emoji}. ¿Cuánto es el total?`;
    return { texto: textoMision, solucion: solucionCorrecta };
};

const SupermercadoMatematico4 = () => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: true });

    if (game.isTestMode) {
        return <TestScreen game={game} productos={productos} />;
    }
    
    return (
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-5xl font-bold mb-6">🛒 Supermercado Matemático</h1>
            <div id="panel-productos">{productos.map(p => <div key={p.nombre} className="producto">{p.emoji} {p.nombre} - {p.precio.toFixed(2)}€</div>)}</div>
            
            <div className="mode-selection">
                <button onClick={game.startPracticeMission} className="btn-mode active">Práctica Libre</button>
                <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
            </div>

            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{game.mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Total a pagar? (€)</label>
                <input type="text" value={game.respuesta} onChange={(e) => game.setRespuesta(e.target.value)} placeholder="Ej: 4,75"/>
                <button onClick={game.checkPracticeAnswer}>Comprobar</button>
            </div>
            <div id="feedback" className={game.feedback.clase}>{game.feedback.texto}</div>
            <button id="btnNuevaMision" onClick={game.startPracticeMission}>¡Otra Misión!</button>
        </div>
    );
};

export default SupermercadoMatematico4;