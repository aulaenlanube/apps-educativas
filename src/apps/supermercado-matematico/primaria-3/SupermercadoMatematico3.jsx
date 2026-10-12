// src/apps/supermercado-matematico/primaria-3/SupermercadoMatematico3.jsx
import React from 'react';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import SupermercadoTienda from '../SupermercadoTienda';

const productos = [
    { nombre: "Leche", emoji: "🥛", precio: 2 }, { nombre: "Pan", emoji: "🍞", precio: 1 },
    { nombre: "Manzanas", emoji: "🍎", precio: 3 }, { nombre: "Huevos", emoji: "🥚", precio: 4 },
    { nombre: "Zumo", emoji: "🧃", precio: 2 }, { nombre: "Queso", emoji: "🧀", precio: 5 },
    { nombre: "Galletas", emoji: "🍪", precio: 3 }, { nombre: "Tomates", emoji: "🍅", precio: 2 },
];

const generarNuevaMision = () => {
    const producto = productos[Math.floor(Math.random() * productos.length)];
    const cantidad = Math.floor(Math.random() * 4) + 2;
    const solucionCorrecta = producto.precio * cantidad;
    const textoMision = `Compras ${cantidad} de ${producto.nombre} ${producto.emoji}. Si cada uno cuesta ${producto.precio}€, ¿cuánto pagarás en total?`;
    return { texto: textoMision, solucion: solucionCorrecta };
};

const SupermercadoMatematico3 = ({ onGameComplete } = {}) => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: true });

    // Interfaz común (tienda, ticket, caja y examen): ../SupermercadoTienda.jsx
    return (
        <SupermercadoTienda
            game={game}
            productos={productos}
            onGameComplete={onGameComplete}
            pregunta="¿Cuál es el total? (€)"
        />
    );
};

export default SupermercadoMatematico3;