import React from 'react';
import '../_shared/SupermercadoShared.css'; // <-- RUTA ACTUALIZADA
import { useSupermercadoGame } from '../../hooks/useSupermercadoGame';
import TestScreen from '../_shared/TestScreen'; // <-- RUTA ACTUALIZADA

const productos = [ { nombre: "Leche", emoji: "🥛", precio: 1 }, { nombre: "Pan", emoji: "🍞", precio: 1 }, { nombre: "Manzana", emoji: "🍎", precio: 1 }, { nombre: "Huevo", emoji: "🥚", precio: 2 }, { nombre: "Zumo", emoji: "🧃", precio: 2 }, { nombre: "Queso", emoji: "🧀", precio: 3 }];

const generarNuevaMision = () => {
    const numProductos = 2;
    const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
    let listaDeCompra = [];
    let solucionCorrecta = 0;
    for (let i = 0; i < numProductos; i++) {
        const producto = productosMezclados[i];
        if (solucionCorrecta + producto.precio > 10) continue;
        listaDeCompra.push({ ...producto, cantidad: 1 });
        solucionCorrecta += producto.precio;
    }
    const textoMision = `Compra: ${listaDeCompra.map(item => `1 ${item.nombre} ${item.emoji}`).join(' y ')}.`;
    return { texto: textoMision, solucion: solucionCorrecta };
};

const SupermercadoMatematico1 = () => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: false });

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

            <div className="mision"><h2>¡Tu Misión!</h2><p id="textoMision">{game.mision.texto}</p></div>
            <div className="respuesta-usuario">
                <label htmlFor="respuesta">¿Cuánto cuesta en total? (€)</label>
                <input type="number" value={game.respuesta} onChange={(e) => game.setRespuesta(e.target.value)} />
                <button onClick={game.checkPracticeAnswer}>Comprobar</button>
            </div>
            <div id="feedback" className={game.feedback.clase}>{game.feedback.texto}</div>
            <button id="btnNuevaMision" onClick={game.startPracticeMission}>¡Otra Misión!</button>
        </div>
    );
};

export default SupermercadoMatematico1;