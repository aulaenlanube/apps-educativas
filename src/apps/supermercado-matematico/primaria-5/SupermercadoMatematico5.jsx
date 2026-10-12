// src/apps/supermercado-matematico/primaria-5/SupermercadoMatematico5.jsx
import React from 'react';
import { useSupermercadoGame } from '@/hooks/useSupermercadoGame';
import SupermercadoTienda from '../SupermercadoTienda';

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

const SupermercadoMatematico5 = ({ onGameComplete } = {}) => {
    const game = useSupermercadoGame({ generarNuevaMision, withTimer: true });

    // Interfaz común (tienda, ticket, caja y examen): ../SupermercadoTienda.jsx
    return (
        <SupermercadoTienda
            game={game}
            productos={productos}
            onGameComplete={onGameComplete}
            pregunta="¿Cuál es el resultado? (€)"
            placeholder="Escribe el resultado"
            decimals
        />
    );
};

export default SupermercadoMatematico5;