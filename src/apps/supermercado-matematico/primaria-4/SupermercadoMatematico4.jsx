// src/apps/supermercado-matematico/primaria-4/SupermercadoMatematico4.jsx
import React from 'react';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import SupermercadoTienda from '../SupermercadoTienda';

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

const SupermercadoMatematico4 = ({ onGameComplete } = {}) => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: true });

    // Interfaz común (tienda, ticket, caja y examen): ../SupermercadoTienda.jsx
    return (
        <SupermercadoTienda
            game={game}
            productos={productos}
            onGameComplete={onGameComplete}
            pregunta="¿Total a pagar? (€)"
            placeholder="Ej: 4,75"
            decimals
        />
    );
};

export default SupermercadoMatematico4;