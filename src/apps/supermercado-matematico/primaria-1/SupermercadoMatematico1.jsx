// src/apps/supermercado-matematico/primaria-1/SupermercadoMatematico1.jsx
import React from 'react';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import SupermercadoTienda from '../SupermercadoTienda';

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

const SupermercadoMatematico1 = ({ onGameComplete } = {}) => {
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

export default SupermercadoMatematico1;