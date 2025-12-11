// src/apps/ordena-bolas/OrdenaBolas.jsx
import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, Timer, Play, Settings, CheckSquare, Square } from 'lucide-react';

const OrdenaBolas = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    
    // Estados del juego
    const [gameState, setGameState] = useState('config'); // config, playing, won, lost
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [key, setKey] = useState(0); 

    // Configuración
    const [config, setConfig] = useState({
        ballCount: 10,
        rotationSpeed: 5,
        randomSize: false,
        ops: {
            numbers: true,
            add: false,
            sub: false,
            mul: false,
            div: false
        }
    });

    // Cronómetro
    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            const startTime = Date.now() - timeElapsed;
            interval = setInterval(() => {
                setTimeElapsed(Date.now() - startTime);
            }, 10); 
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
    };

    const toggleOp = (op) => {
        const newOps = { ...config.ops, [op]: !config.ops[op] };
        // Evitar desactivar todas
        if (!Object.values(newOps).some(v => v)) return; 
        setConfig({ ...config, ops: newOps });
    };

    const startGame = () => {
        setGameState('playing');
        setTimeElapsed(0);
        setKey(prev => prev + 1);
    };

    const backToConfig = () => {
        setGameState('config');
        setTimeElapsed(0);
    };

    const restartGame = () => {
        setGameState('playing');
        setTimeElapsed(0);
        setKey(prev => prev + 1);
    };

    // --- GENERADOR DE PROBLEMAS MATEMÁTICOS ---
    const generateBallData = (count, options) => {
        const activeTypes = Object.keys(options).filter(k => options[k]);
        const ballsData = [];
        const usedValues = new Set();
        let attempts = 0;

        while (ballsData.length < count && attempts < 1000) {
            attempts++;
            const type = activeTypes[Math.floor(Math.random() * activeTypes.length)];
            let val, label;

            switch (type) {
                case 'numbers':
                    val = Math.floor(Math.random() * 50) + 1;
                    label = `${val}`;
                    break;
                case 'add':
                    const a1 = Math.floor(Math.random() * 20) + 1;
                    const b1 = Math.floor(Math.random() * 20) + 1;
                    val = a1 + b1;
                    label = `${a1} + ${b1}`;
                    break;
                case 'sub':
                    val = Math.floor(Math.random() * 40) + 1; // Resultado positivo
                    const b2 = Math.floor(Math.random() * 20) + 1;
                    const a2 = val + b2;
                    label = `${a2} - ${b2}`;
                    break;
                case 'mul':
                    const a3 = Math.floor(Math.random() * 9) + 2;
                    const b3 = Math.floor(Math.random() * 9) + 2;
                    val = a3 * b3;
                    label = `${a3} × ${b3}`;
                    break;
                case 'div':
                    val = Math.floor(Math.random() * 9) + 2; // Resultado
                    const b4 = Math.floor(Math.random() * 9) + 2;
                    const a4 = val * b4;
                    label = `${a4} ÷ ${b4}`;
                    break;
                default:
                    val = 0; label = "?";
            }

            // Evitar valores repetidos para no confundir el orden
            if (!usedValues.has(val) && val > 0) {
                usedValues.add(val);
                ballsData.push({ value: val, label });
            }
        }
        return ballsData;
    };

    // --- MOTOR FÍSICO ---
    useEffect(() => {
        if (gameState === 'config') return;

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
        if (!container) return;

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
                pixelRatio: 1
            }
        });

        // Caja
        const boxSize = 450; 
        const wallThickness = 40;
        const centerX = width / 2;
        const centerY = height / 2;
        const wallOptions = { isStatic: true, render: { fillStyle: '#334155' }, friction: 1, restitution: 0.2 };

        const boxContainer = Composite.create();
        Composite.add(boxContainer, [
            Bodies.rectangle(centerX, centerY + boxSize/2, boxSize, wallThickness, wallOptions),
            Bodies.rectangle(centerX, centerY - boxSize/2, boxSize, wallThickness, wallOptions),
            Bodies.rectangle(centerX - boxSize/2, centerY, wallThickness, boxSize, wallOptions),
            Bodies.rectangle(centerX + boxSize/2, centerY, wallThickness, boxSize, wallOptions)
        ]);
        Composite.add(engine.world, boxContainer);

        // Generar Bolas
        const ballsData = generateBallData(config.ballCount, config.ops);
        // Ordenamos por valor numérico para saber el objetivo, pero las bolas se crean desordenadas
        const sortedValues = [...ballsData].map(b => b.value).sort((a, b) => a - b);
        
        const gameLogic = {
            targetIndex: 0,
            isGameOver: false,
            isVictory: false
        };

        const balls = ballsData.map(data => {
            // Tamaño
            let size;
            if (config.randomSize) {
                size = 25 + Math.random() * 30; 
            } else {
                // Escalar tamaño relativo a los valores presentes
                const minVal = sortedValues[0];
                const maxVal = sortedValues[sortedValues.length - 1];
                const range = maxVal - minVal || 1;
                const factor = (data.value - minVal) / range;
                size = 25 + (factor * 35); 
            }

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
                        value: data.value, // Valor numérico para la lógica
                        text: data.label,  // Texto a mostrar (operación o número)
                        isCorrect: false 
                    },
                    render: {
                        fillStyle: '#3b82f6', 
                        strokeStyle: '#1d4ed8',
                        lineWidth: 3
                    }
                }
            );
        });

        Composite.add(engine.world, balls);

        // Clic
        const handleCanvasClick = (event) => {
            if (gameLogic.isGameOver || gameLogic.isVictory) return;

            const rect = render.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            const bodiesUnderMouse = Query.point(balls, { x: clickX, y: clickY });
            const clickedBall = bodiesUnderMouse.find(b => b.label === 'ball');

            if (clickedBall) {
                if (clickedBall.plugin.isCorrect) return;

                const clickedValue = clickedBall.plugin.value;
                const correctValue = sortedValues[gameLogic.targetIndex];

                if (clickedValue === correctValue) {
                    // Acierto
                    clickedBall.plugin.isCorrect = true;
                    clickedBall.render.fillStyle = '#ef4444'; 
                    clickedBall.render.strokeStyle = '#b91c1c';
                    
                    gameLogic.targetIndex++;

                    if (gameLogic.targetIndex >= sortedValues.length) {
                        gameLogic.isVictory = true;
                        setGameState('won');
                        lanzarConfetti(centerX, centerY - 200);
                    }
                } else {
                    // Fallo
                    gameLogic.isGameOver = true;
                    setGameState('lost');
                }
            }
        };

        render.canvas.addEventListener('pointerdown', handleCanvasClick);

        // Rotación
        Events.on(engine, 'beforeUpdate', () => {
            const rotation = config.rotationSpeed * 0.001; 
            if (rotation > 0) Composite.rotate(boxContainer, rotation, { x: centerX, y: centerY });
        });

        // Render Texto
        Events.on(render, 'afterRender', () => {
            const context = render.context;
            if (!context) return;
            
            context.font = 'bold 18px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            balls.forEach(ball => {
                const { x, y } = ball.position;
                context.fillStyle = 'white';
                context.fillText(ball.plugin.text, x, y);
            });
        });

        // Confetti
        const lanzarConfetti = (x, y) => {
            const confettiParticles = [];
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            for (let i = 0; i < 150; i++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const particle = Bodies.rectangle(
                    x + (Math.random() * 100 - 50), y + (Math.random() * 100 - 50), 10, 10, 
                    { render: { fillStyle: color }, restitution: 0.5, friction: 0.1, collisionFilter: { group: -1 } }
                );
                Matter.Body.setVelocity(particle, { x: Math.random() * 10 - 5, y: Math.random() * -10 - 5 });
                confettiParticles.push(particle);
            }
            Composite.add(engine.world, confettiParticles);
        };

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
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
    }, [key, gameState]); 

    // --- RENDER CONFIG ---
    if (gameState === 'config') {
        return (
            <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full border border-purple-100">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-purple-700 mb-2">Configuración</h2>
                        <p className="text-gray-500">Personaliza tu desafío matemático</p>
                    </div>

                    <div className="space-y-6">
                        {/* Sliders */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-medium text-gray-700 text-sm">Cantidad de bolas: {config.ballCount}</label>
                                <input type="range" min="3" max="20" value={config.ballCount} onChange={(e) => setConfig({...config, ballCount: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                            </div>
                            <div className="space-y-2">
                                <label className="font-medium text-gray-700 text-sm">Velocidad giro: {config.rotationSpeed}</label>
                                <input type="range" min="0" max="10" value={config.rotationSpeed} onChange={(e) => setConfig({...config, rotationSpeed: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"/>
                            </div>
                        </div>

                        {/* Operaciones */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="font-medium text-gray-700 mb-3">Tipos de Operaciones</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'numbers', label: 'Números' },
                                    { id: 'add', label: 'Sumas' },
                                    { id: 'sub', label: 'Restas' },
                                    { id: 'mul', label: 'Multiplicación' },
                                    { id: 'div', label: 'División' }
                                ].map(op => (
                                    <div 
                                        key={op.id}
                                        onClick={() => toggleOp(op.id)}
                                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${config.ops[op.id] ? 'bg-white shadow-sm border border-blue-200' : 'hover:bg-slate-100'}`}
                                    >
                                        {config.ops[op.id] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                                        <span className={`text-sm ${config.ops[op.id] ? 'font-semibold text-blue-900' : 'text-gray-600'}`}>{op.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Toggle Tamaño */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer" onClick={() => setConfig({...config, randomSize: !config.randomSize})}>
                            <div className="flex-1">
                                <span className="font-medium text-gray-700 text-sm block">Tamaño engañoso</span>
                                <span className="text-xs text-gray-500">El tamaño no indica el valor</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${config.randomSize ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${config.randomSize ? 'translate-x-6' : ''}`} />
                            </div>
                        </div>

                        <Button onClick={startGame} className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                            <Play className="mr-2 h-5 w-5" /> ¡Jugar!
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER GAME ---
    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
            <div className="w-full max-w-4xl flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Button onClick={backToConfig} variant="ghost" size="sm" className="text-gray-500">
                    <Settings className="h-4 w-4 mr-2" /> Configurar
                </Button>
                
                <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                    <Timer className="w-5 h-5 text-slate-600" />
                    <span className="font-mono text-xl font-bold text-slate-700 w-32 text-center tracking-wider">
                        {formatTime(timeElapsed)}
                    </span>
                </div>

                <Button onClick={restartGame} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="relative w-full max-w-4xl overflow-hidden">
                <div ref={sceneRef} className="w-full h-[600px] cursor-pointer" />

                {gameState === 'lost' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                        <div className="bg-white p-8 rounded-xl shadow-2xl text-center space-y-4 animate-in zoom-in max-w-sm mx-4">
                            <h3 className="text-2xl font-bold text-red-500">¡Fallaste!</h3>
                            <p>El orden era incorrecto.</p>
                            <div className="text-xl font-mono text-gray-600">Tiempo: {formatTime(timeElapsed)}</div>
                            <div className="flex space-x-2 mt-4">
                                <Button onClick={backToConfig} variant="outline" className="flex-1">Menú</Button>
                                <Button onClick={restartGame} className="flex-1">Reintentar</Button>
                            </div>
                        </div>
                    </div>
                )}
                
                {gameState === 'won' && (
                    <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl pointer-events-none">
                        <div className="bg-white/95 p-8 rounded-xl shadow-2xl border-2 border-green-500 text-center space-y-4 animate-in zoom-in max-w-sm mx-4 pointer-events-auto">
                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                            <h3 className="text-2xl font-bold text-green-700">¡Victoria!</h3>
                            <p>¡Has ordenado todo correctamente!</p>
                            <div className="text-2xl font-mono text-gray-800 font-bold py-2 bg-gray-50 rounded-lg">
                                {formatTime(timeElapsed)}
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <Button onClick={backToConfig} variant="outline" className="flex-1">Menú</Button>
                                <Button onClick={restartGame} className="flex-1 bg-green-600 hover:bg-green-700">Jugar otra vez</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdenaBolas;