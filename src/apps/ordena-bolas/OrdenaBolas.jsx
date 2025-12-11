// src/apps/ordena-bolas/OrdenaBolas.jsx
import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy } from 'lucide-react';

const OrdenaBolas = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const [gameOver, setGameOver] = useState(false);
    const [victory, setVictory] = useState(false);
    
    // Mantenemos el estado interno para la lógica, pero no lo mostraremos en la UI
    const [nextNumber, setNextNumber] = useState(1); 
    const [key, setKey] = useState(0);

    // Configuración del juego
    const BALL_COUNT = 10;
    const MIN_VAL = 1;
    const MAX_VAL = 20;

    const restartGame = () => {
        setKey(prev => prev + 1);
        setNextNumber(1);
        setGameOver(false);
        setVictory(false);
    };

    useEffect(() => {
        // --- CONFIGURACIÓN DE MATTER.JS ---
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Events = Matter.Events,
            Query = Matter.Query;

        const engine = Engine.create();
        engineRef.current = engine;

        const container = sceneRef.current;
        const width = container.clientWidth;
        const height = 600;

        const render = Render.create({
            element: container,
            engine: engine,
            options: {
                width,
                height,
                wireframes: false,
                background: 'transparent',
                // Quitamos pixelRatio para asegurar correlación 1:1 entre clic y física
                pixelRatio: 1 
            }
        });

        // --- CAJA GIRATORIA ---
        const boxSize = 450; 
        const wallThickness = 40;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const wallOptions = { 
            isStatic: true, 
            render: { fillStyle: '#334155' },
            friction: 1,
            restitution: 0.2
        };

        const floor = Bodies.rectangle(centerX, centerY + boxSize/2, boxSize, wallThickness, wallOptions);
        const ceiling = Bodies.rectangle(centerX, centerY - boxSize/2, boxSize, wallThickness, wallOptions);
        const leftWall = Bodies.rectangle(centerX - boxSize/2, centerY, wallThickness, boxSize, wallOptions);
        const rightWall = Bodies.rectangle(centerX + boxSize/2, centerY, wallThickness, boxSize, wallOptions);

        const boxContainer = Composite.create();
        Composite.add(boxContainer, [floor, ceiling, leftWall, rightWall]);
        Composite.add(engine.world, boxContainer);

        // --- BOLAS (AZULES) ---
        const numbers = [];
        while(numbers.length < BALL_COUNT){
            const r = Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
            if(numbers.indexOf(r) === -1) numbers.push(r);
        }
        
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        
        // Usamos referencias mutables para la lógica dentro del evento de clic
        // para evitar problemas de cierres (closures) antiguos.
        const gameState = {
            targetIndex: 0,
            isGameOver: false,
            isVictory: false
        };

        const balls = numbers.map(num => {
            const size = 20 + (num * 1.5);
            return Bodies.circle(
                centerX + (Math.random() * 100 - 50),
                centerY + (Math.random() * 100 - 50),
                size,
                {
                    restitution: 0.9,
                    friction: 0.01,
                    frictionAir: 0.01,
                    density: 0.04,
                    label: 'ball',
                    plugin: {
                        value: num,
                        isCorrect: false // Estado para saber si ya se acertó
                    },
                    render: {
                        fillStyle: '#3b82f6', // Azul inicial
                        strokeStyle: '#1d4ed8',
                        lineWidth: 3
                    }
                }
            );
        });

        Composite.add(engine.world, balls);

        // --- DETECCIÓN DE CLIC NATIVA ---
        // Usamos un listener directo al canvas para máxima fiabilidad
        const handleCanvasClick = (event) => {
            if (gameState.isGameOver || gameState.isVictory) return;

            const rect = render.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // Buscamos colisiones en el punto exacto del clic
            const bodiesUnderMouse = Query.point(balls, { x: clickX, y: clickY });
            const clickedBall = bodiesUnderMouse.find(b => b.label === 'ball');

            if (clickedBall) {
                // Si la bola ya está roja (acertada), la ignoramos
                if (clickedBall.plugin.isCorrect) return;

                const clickedValue = clickedBall.plugin.value;
                const correctValue = sortedNumbers[gameState.targetIndex];

                if (clickedValue === correctValue) {
                    // ¡ACIERTO!
                    clickedBall.plugin.isCorrect = true;
                    clickedBall.render.fillStyle = '#ef4444'; // ROJO
                    clickedBall.render.strokeStyle = '#b91c1c';
                    
                    gameState.targetIndex++;
                    // Actualizamos estado React para UI (si fuera necesario)
                    setNextNumber(sortedNumbers[gameState.targetIndex]);

                    if (gameState.targetIndex >= sortedNumbers.length) {
                        gameState.isVictory = true;
                        setVictory(true);
                        lanzarConfetti(centerX, centerY - 200);
                    }
                } else {
                    // ¡FALLO!
                    gameState.isGameOver = true;
                    setGameOver(true);
                }
            }
        };

        render.canvas.addEventListener('pointerdown', handleCanvasClick);

        // --- ROTACIÓN ---
        Events.on(engine, 'beforeUpdate', () => {
            Composite.rotate(boxContainer, 0.005, { x: centerX, y: centerY });
        });

        // --- RENDERIZADO DE NÚMEROS ---
        Events.on(render, 'afterRender', () => {
            const context = render.context;
            if (!context) return;
            
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            balls.forEach(ball => {
                const { x, y } = ball.position;
                context.fillStyle = 'white';
                context.fillText(ball.plugin.value, x, y);
            });
        });

        // --- FUNCIÓN DE CONFETTI FÍSICO ---
        const lanzarConfetti = (x, y) => {
            const confettiParticles = [];
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            
            for (let i = 0; i < 150; i++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const particle = Bodies.rectangle(
                    x + (Math.random() * 100 - 50), 
                    y + (Math.random() * 100 - 50), 
                    10, 
                    10, 
                    {
                        render: { fillStyle: color },
                        restitution: 0.5,
                        friction: 0.1,
                        frictionAir: 0.05,
                        collisionFilter: { group: -1 }
                    }
                );
                Matter.Body.setVelocity(particle, { 
                    x: Math.random() * 10 - 5, 
                    y: Math.random() * -10 - 5 
                });
                confettiParticles.push(particle);
            }
            Composite.add(engine.world, confettiParticles);
        };

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            // Limpieza
            if (render.canvas) {
                render.canvas.removeEventListener('pointerdown', handleCanvasClick);
                render.canvas.remove();
            }
            Render.stop(render);
            Runner.stop(runner);
            if (engineRef.current) {
                 Composite.clear(engineRef.current.world);
                 Engine.clear(engineRef.current);
            }
        };
    }, [key]);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-purple-700">Ordena las Bolas</h2>
                <p className="text-gray-600">
                    Haz clic en las bolas azules de menor a mayor valor.<br/>
                    ¡Se pondrán rojas si aciertas!
                </p>
                <div className="flex items-center justify-center space-x-4">
                    {/* Marcador eliminado según instrucciones */}
                    <Button onClick={restartGame} variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="relative w-full max-w-4xl overflow-hidden">
                <div ref={sceneRef} className="w-full h-[600px] cursor-pointer" />

                {gameOver && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                        <div className="bg-white p-8 rounded-xl shadow-2xl text-center space-y-4 animate-in zoom-in max-w-sm mx-4">
                            <h3 className="text-2xl font-bold text-red-500">¡Fallaste!</h3>
                            <p>Has pulsado el número incorrecto.</p>
                            <Button onClick={restartGame} className="w-full">Intentar de nuevo</Button>
                        </div>
                    </div>
                )}
                
                {victory && (
                    <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl pointer-events-none">
                        <div className="bg-white/90 p-8 rounded-xl shadow-2xl border-2 border-green-500 text-center space-y-4 animate-in zoom-in max-w-sm mx-4 pointer-events-auto">
                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                            <h3 className="text-2xl font-bold text-green-700">¡Victoria!</h3>
                            <p>¡Todas las bolas son rojas!</p>
                            <Button onClick={restartGame} className="w-full bg-green-600 hover:bg-green-700">Jugar otra vez</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdenaBolas;