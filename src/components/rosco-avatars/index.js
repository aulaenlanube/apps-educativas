import { Fox, Panda, Cat, Dog, Lion, Penguin, Owl } from './animals';
import { Unicorn, Dragon, Robot, Alien, Ghost } from './fantasy';
import { Astronaut, Scientist, Ninja, Wizard, Superhero, Gamer } from './people';

// Personajes del Rosco del Saber. La clave es un emoji (es lo que se guarda en la
// configuración del jugador y lo que llega como emoji de perfil en los duelos).
// name/tagline se muestran en el selector; color/tint tiñen su tarjeta.
export const AVATARS = [
    { id: '🦊', C: Fox, name: 'Zorro', tagline: 'Astuto y veloz', color: '#3b82f6', tint: '#dbeafe' },
    { id: '🐼', C: Panda, name: 'Panda', tagline: 'Calma total, cero fallos', color: '#22c55e', tint: '#dcfce7' },
    { id: '🐱', C: Cat, name: 'Gata', tagline: 'Curiosidad sin límites', color: '#fb923c', tint: '#ffedd5' },
    { id: '🐶', C: Dog, name: 'Perro', tagline: 'Leal y entusiasta', color: '#14b8a6', tint: '#ccfbf1' },
    { id: '🦁', C: Lion, name: 'León', tagline: 'El rey del rosco', color: '#8b5cf6', tint: '#ede9fe' },
    { id: '🐧', C: Penguin, name: 'Pingüino', tagline: 'Frío ante la presión', color: '#38bdf8', tint: '#e0f2fe' },
    { id: '🦉', C: Owl, name: 'Búho', tagline: 'Se sabe todas las palabras', color: '#059669', tint: '#d1fae5' },
    { id: '🦄', C: Unicorn, name: 'Unicornio', tagline: 'Magia en cada letra', color: '#ec4899', tint: '#fce7f3' },
    { id: '🐉', C: Dragon, name: 'Dragón', tagline: 'Respuestas que echan fuego', color: '#dc2626', tint: '#fee2e2' },
    { id: '🤖', C: Robot, name: 'Robot', tagline: 'Procesando la respuesta…', color: '#06b6d4', tint: '#cffafe' },
    { id: '👽', C: Alien, name: 'Alien', tagline: 'Llegado de otra galaxia', color: '#9333ea', tint: '#f3e8ff' },
    { id: '👻', C: Ghost, name: 'Fantasma', tagline: 'Aparece cuando menos lo esperas', color: '#4f46e5', tint: '#e0e7ff' },
    { id: '🧑‍🚀', C: Astronaut, name: 'Astronauta', tagline: 'Rumbo a las estrellas', color: '#4361ee', tint: '#dbeafe' },
    { id: '🧑‍🔬', C: Scientist, name: 'Científica', tagline: 'Experimenta, falla y acierta', color: '#65a30d', tint: '#ecfccb' },
    { id: '🥷', C: Ninja, name: 'Ninja', tagline: 'Rápida y silenciosa', color: '#c026d3', tint: '#fae8ff' },
    { id: '🧙', C: Wizard, name: 'Mago', tagline: 'Hechizos de sabiduría', color: '#f59e0b', tint: '#fef3c7' },
    { id: '🦸', C: Superhero, name: 'Superhéroe', tagline: 'Al rescate de cada letra', color: '#eab308', tint: '#fef9c3' },
    { id: '🎮', C: Gamer, name: 'Gamer', tagline: 'Siempre a por el nivel máximo', color: '#0891b2', tint: '#cffafe' },
];
