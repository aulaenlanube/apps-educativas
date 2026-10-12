// src/apps/supermercado-matematico/primaria-2/SupermercadoMatematico2.jsx
import React from 'react';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import SupermercadoTienda from '../SupermercadoTienda';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 1 }, { nombre: "Pan", emoji: "🍞", precio: 1 },
    { nombre: "Manzana", emoji: "🍎", precio: 2 }, { nombre: "Huevo", emoji: "🥚", precio: 2 },
    { nombre: "Zumo", emoji: "🧃", precio: 3 }, { nombre: "Queso", emoji: "🧀", precio: 4 },
    { nombre: "Galletas", emoji: "🍪", precio: 5 }, { nombre: "Tomate", emoji: "🍅", precio: 3 },
];

const generarNuevaMision = () => {
    const numProductos = Math.floor(Math.random() * 2) + 2;
    const productosMezclados = [...productos].sort(() => 0.5 - Math.random());
    let listaDeCompra = [];
    let solucionCorrecta = 0;
    for (let i = 0; i < numProductos; i++) {
        const producto = productosMezclados[i];
        const cantidad = Math.floor(Math.random() * 2) + 1;
        if (solucionCorrecta + (producto.precio * cantidad) > 20) continue;
        listaDeCompra.push({ ...producto, cantidad });
        solucionCorrecta += producto.precio * cantidad;
    }
    const textoMision = `Compra: ${listaDeCompra.map(item => `${item.cantidad} de ${item.nombre} ${item.emoji}`).join(' y ')}.`;
    return { texto: textoMision, solucion: solucionCorrecta };
};

const SupermercadoMatematico2 = ({ onGameComplete } = {}) => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: false });

    // Interfaz común (tienda, ticket, caja y examen): ../SupermercadoTienda.jsx
    return (
        <SupermercadoTienda
            game={game}
            productos={productos}
            onGameComplete={onGameComplete}
            pregunta="¿Cuánto cuesta en total? (€)"
        />
    );
};

export default SupermercadoMatematico2;