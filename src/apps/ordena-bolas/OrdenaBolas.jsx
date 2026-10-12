// src/apps/ordena-bolas/OrdenaBolas.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Matter from 'matter-js';
import {
    RefreshCw, Timer, Play, Settings, Check, Circle, Gauge, RotateCw, Shapes, EyeOff, Trophy,
} from 'lucide-react';
import { drawBall3D, drawBallLabel, drawWalls } from './ballFx';
import InstructionsModal from '../_shared/InstructionsModal';
import { GameShell, GameHeader, Hud, GameButton, ResultsScreen, Chip } from '../_shared/kit';
import './OrdenaBolas.css';

// Bolas de muestra de la ilustración de la pantalla de ajustes (solo estética)
const DEMO_BALLS = [
    { n: '3', s: 46, x: 14, y: 58, t: 'done' },
    { n: '7', s: 58, x: 34, y: 34, t: 'done' },
    { n: '12', s: 70, x: 58, y: 58, t: 'idle' },
    { n: '4 + 9', s: 64, x: 80, y: 30, t: 'idle' },
    { n: '20', s: 82, x: 40, y: 78, t: 'idle' },
];

// Ancho mínimo del mundo físico. El recipiente mide 450 px y gira: con un mundo
// de 600 x 600 se ve entero igual que en escritorio. En pantallas más estrechas
// el mundo NO encoge (misma física, mismos tamaños): se dibuja escalado.
const MIN_WORLD_WIDTH = 600;

const OrdenaBolas = ({ onGameComplete }) => {
    const { level, grade } = useParams();

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
            div: false,
            pow: false,
            sqrt: false,
            eq: false
        }
    });

    // --- LÓGICA DE FILTRADO POR CURSO ---
    const getAllowedOperations = () => {
        if (level === 'eso' || level === 'bachillerato') {
            return ['numbers', 'add', 'sub', 'mul', 'div', 'pow', 'sqrt', 'eq'];
        }

        if (level === 'primaria') {
            const gradeNum = parseInt(grade);

            // 1º, 2º y 3º de Primaria
            if (gradeNum >= 1 && gradeNum <= 3) {
                return ['numbers', 'add', 'sub'];
            }

            // 4º, 5º y 6º de Primaria
            return ['numbers', 'add', 'sub', 'mul', 'div'];
        }

        return ['numbers'];
    };

    const allowedOps = getAllowedOperations();
    const trackedRef = useRef(false);

    // Tracking al terminar partida
    useEffect(() => {
        if ((gameState === 'won' || gameState === 'lost') && !trackedRef.current) {
            trackedRef.current = true;
            const won = gameState === 'won';
            const elapsedSec = Math.max(1, Math.round(timeElapsed / 1000));
            // Bonus por rapidez (solo si gana): 5s/bola de presupuesto, 10pt por seg ahorrado
            const TIME_BUDGET = config.ballCount * 5;
            const SPEED_COEF = 10;
            const timeBonus = won
                ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
                : 0;
            const basePoints = won ? config.ballCount * 100 : 0;
            onGameComplete?.({
                mode: 'test',
                score: basePoints + timeBonus,
                maxScore: config.ballCount * 100 + TIME_BUDGET * SPEED_COEF,
                correctAnswers: won ? config.ballCount : 0,
                totalQuestions: config.ballCount,
                durationSeconds: elapsedSec,
            });
        }
        if (gameState === 'config' || gameState === 'playing') trackedRef.current = false;
    }, [gameState, config.ballCount, timeElapsed, onGameComplete]);

    // Cronómetro CORREGIDO: Añadida 'key' a las dependencias
    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            const startTime = Date.now() - timeElapsed;
            interval = setInterval(() => {
                setTimeElapsed(Date.now() - startTime);
            }, 10);
        }
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, key]); // <--- 'key' asegura que el timer se reinicie al pulsar reiniciar

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
    };

    const toggleOp = (op) => {
        const newOps = { ...config.ops, [op]: !config.ops[op] };
        const hasActiveAllowedOp = allowedOps.some(allowed => newOps[allowed]);

        if (!hasActiveAllowedOp) return;
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
        setKey(prev => prev + 1);
    };

    const restartGame = () => {
        setGameState('playing');
        setTimeElapsed(0);
        setKey(prev => prev + 1);
    };

    // --- GENERADOR ---
    const generateBallData = (count, options) => {
        const activeTypes = Object.keys(options).filter(k => options[k] && allowedOps.includes(k));

        if (activeTypes.length === 0) activeTypes.push('numbers');

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
                    val = Math.floor(Math.random() * 40) + 1;
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
                    val = Math.floor(Math.random() * 9) + 2;
                    const b4 = Math.floor(Math.random() * 9) + 2;
                    const a4 = val * b4;
                    label = `${a4} ÷ ${b4}`;
                    break;
                case 'pow':
                    const base = Math.floor(Math.random() * 5) + 2;
                    const exp = Math.floor(Math.random() * 2) + 2;
                    val = Math.pow(base, exp);
                    label = exp === 2 ? `${base}²` : (exp === 3 ? `${base}³` : `${base}^${exp}`);
                    break;
                case 'sqrt':
                    val = Math.floor(Math.random() * 10) + 2;
                    const sq = val * val;
                    label = `√${sq}`;
                    break;
                case 'eq':
                    const eqType = Math.floor(Math.random() * 3);
                    if (eqType === 0) {
                        const x = Math.floor(Math.random() * 15) + 1;
                        const a = Math.floor(Math.random() * 10) + 1;
                        val = x;
                        label = `x + ${a} = ${x + a}`;
                    } else if (eqType === 1) {
                        const x = Math.floor(Math.random() * 15) + 5;
                        const a = Math.floor(Math.random() * 5) + 1;
                        val = x;
                        label = `x - ${a} = ${x - a}`;
                    } else {
                        const x = Math.floor(Math.random() * 10) + 2;
                        const a = Math.floor(Math.random() * 4) + 2;
                        val = x;
                        label = `${a}x = ${x * a}`;
                    }
                    break;
                default:
                    val = 0; label = "?";
            }

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

        const availableWidth = container.clientWidth;
        const width = Math.max(availableWidth, MIN_WORLD_WIDTH);
        const height = 600;
        // Escala solo de dibujo (1 en escritorio): el canvas se pinta al ancho
        // disponible y los toques se pasan a coordenadas del mundo.
        const viewScale = availableWidth > 0 ? availableWidth / width : 1;

        const render = Render.create({
            element: container,
            engine: engine,
            options: {
                width,
                height,
                wireframes: false,
                background: 'transparent',
                // Nitidez en pantallas de alta densidad (solo dibujo: las
                // coordenadas del mundo siguen siendo px CSS).
                pixelRatio: Math.min(2, window.devicePixelRatio || 1)
            }
        });

        if (viewScale < 1) {
            render.canvas.style.width = `${availableWidth}px`;
            render.canvas.style.height = `${height * viewScale}px`;
            container.style.height = `${height * viewScale}px`;
        }

        // Caja
        const boxSize = 450;
        const wallThickness = 40;
        const centerX = width / 2;
        const centerY = height / 2;
        const wallStyle = { fillStyle: '#4f46e5', strokeStyle: '#c7d2fe', lineWidth: 1 };
        const wallOptions = { isStatic: true, render: wallStyle, friction: 1, restitution: 0.2 };

        const offset = (boxSize - wallThickness) / 2;
        const floor = Bodies.rectangle(centerX, centerY + offset, boxSize, wallThickness, wallOptions);
        const ceiling = Bodies.rectangle(centerX, centerY - offset, boxSize, wallThickness, wallOptions);
        const sideHeight = boxSize - (2 * wallThickness);
        const leftWall = Bodies.rectangle(centerX - offset, centerY, wallThickness, sideHeight, wallOptions);
        const rightWall = Bodies.rectangle(centerX + offset, centerY, wallThickness, sideHeight, wallOptions);

        const boxContainer = Composite.create();
        Composite.add(boxContainer, [floor, ceiling, leftWall, rightWall]);
        Composite.add(engine.world, boxContainer);

        // Bolas
        const ballsData = generateBallData(config.ballCount, config.ops);
        const sortedValues = [...ballsData].map(b => b.value).sort((a, b) => a - b);

        const gameLogic = {
            targetIndex: 0,
            isGameOver: false,
            isVictory: false
        };

        const balls = ballsData.map(data => {
            let size;
            if (config.randomSize) {
                size = 25 + Math.random() * 30;
            } else {
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
                        value: data.value,
                        text: data.label,
                        isCorrect: false
                    },
                    render: {
                        fillStyle: '#3b82f6',
                        strokeStyle: '#1d4ed8',
                        lineWidth: 0 // el contorno lo pinta drawBall3D (solo dibujo)
                    }
                }
            );
        });

        Composite.add(engine.world, balls);

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

        const handleCanvasClick = (event) => {
            if (gameLogic.isGameOver || gameLogic.isVictory) return;

            const rect = render.canvas.getBoundingClientRect();
            // Píxeles en pantalla → coordenadas del mundo (factor 1 si no hay escala)
            const clickX = (event.clientX - rect.left) * (rect.width ? width / rect.width : 1);
            const clickY = (event.clientY - rect.top) * (rect.height ? height / rect.height : 1);

            const bodiesUnderMouse = Query.point(balls, { x: clickX, y: clickY });
            const clickedBall = bodiesUnderMouse.find(b => b.label === 'ball');

            if (clickedBall) {
                if (clickedBall.plugin.isCorrect) return;

                const clickedValue = clickedBall.plugin.value;
                const correctValue = sortedValues[gameLogic.targetIndex];

                if (clickedValue === correctValue) {
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
                    gameLogic.isGameOver = true;
                    setGameState('lost');
                }
            }
        };

        render.canvas.addEventListener('pointerdown', handleCanvasClick);

        Events.on(engine, 'beforeUpdate', () => {
            const rotation = config.rotationSpeed * 0.001;
            if (rotation > 0) Composite.rotate(boxContainer, rotation, { x: centerX, y: centerY });
        });

        Events.on(render, 'afterRender', () => {
            const context = render.context;
            if (!context) return;

            // Solo dibujo: recipiente con volumen, esferas y etiquetas ajustadas
            drawWalls(context, [floor, ceiling, leftWall, rightWall]);
            balls.forEach(ball => {
                const { x, y } = ball.position;
                drawBall3D(context, ball, { tone: ball.plugin.isCorrect ? 'done' : 'idle', pixelRatio: render.options.pixelRatio });
                drawBallLabel(context, ball.plugin.text, x, y, 'white', ball.circleRadius * 1.7);
            });
        });

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            container.style.height = '';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // --- PRESENTACIÓN (rediseño 2026 con el kit) ---
    // El cronómetro re-renderiza cada 10 ms (como siempre): las partes estáticas
    // van memorizadas para que React no las vuelva a pintar en cada tic.
    const [showInstructions, setShowInstructions] = useState(false);
    const shellProps = { accent: '#f43f5e', accent2: '#6366f1', className: 'ob' };

    const instructions = useMemo(() => (
        <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Cómo jugar a Ordena las Bolas">
            <h3>🎯 Objetivo</h3>
            <p>
                Dentro del recipiente que gira hay bolas con números u operaciones. Tócalas <strong>de menor a mayor valor</strong>.
                Si te equivocas una sola vez, se acaba el reto.
            </p>
            <h3>🕹️ Cómo se juega</h3>
            <ul>
                <li>Resuelve mentalmente cada operación para saber su valor.</li>
                <li>Normalmente las bolas más grandes valen más… salvo que actives el <strong>tamaño engañoso</strong>.</li>
                <li>Las bolas ya marcadas se vuelven verdes.</li>
                <li>Cuanto antes termines, más puntos extra consigues.</li>
            </ul>
            <div className="instr-tips"><strong>💡 Consejo:</strong> busca primero la bola más pequeña y ve subiendo poco a poco; no hace falta ordenar todas de golpe.</div>
        </InstructionsModal>
    ), [showInstructions]);

    const header = useMemo(() => (
        <GameHeader mode="exam" onHelp={() => setShowInstructions(true)} />
    ), []);

    if (gameState === 'config') {
        const allOperations = [
            { id: 'numbers', label: 'Números' },
            { id: 'add', label: 'Sumas' },
            { id: 'sub', label: 'Restas' },
            { id: 'mul', label: 'Multiplicación' },
            { id: 'div', label: 'División' },
            { id: 'pow', label: 'Potencias' },
            { id: 'sqrt', label: 'Raíces' },
            { id: 'eq', label: 'Ecuaciones' }
        ];

        const visibleOperations = allOperations.filter(op => allowedOps.includes(op.id));

        const getLevelTitle = () => {
            if (level === 'eso') return 'Nivel Secundaria (ESO)';
            if (level === 'primaria') {
                const g = parseInt(grade);
                if (g >= 1 && g <= 3) return `Primaria (${grade}º) - Básico`;
                return `Primaria (${grade}º) - Avanzado`;
            }
            return 'Configuración';
        };

        return (
            <GameShell {...shellProps}>
                <GameHeader
                    onHelp={() => setShowInstructions(true)}
                    right={<Chip tone="accent" icon={Trophy}>Cada reto cuenta como examen</Chip>}
                />
                <div className="ob-setup">
                    <div className="ob-demo" aria-hidden="true">
                        <div className="ob-demo__box">
                            {DEMO_BALLS.map((b) => (
                                <span
                                    key={b.n}
                                    className={`ob-demo__ball is-${b.t}`}
                                    style={{ width: b.s, height: b.s, left: `${b.x}%`, top: `${b.y}%` }}
                                >
                                    {b.n}
                                </span>
                            ))}
                        </div>
                        <p className="ob-demo__caption">Toca las bolas de <b>menor</b> a <b>mayor</b> valor</p>
                    </div>

                    <div className="ob-config">
                        <div className="ob-config__head">
                            <strong>Prepara tu reto</strong>
                            <span>{getLevelTitle()}</span>
                        </div>

                        <label className="ob-slider">
                            <span className="ob-slider__label"><Circle size={15} /> Cantidad de bolas <b>{config.ballCount}</b></span>
                            <input type="range" min="3" max="20" value={config.ballCount} onChange={(e) => setConfig({ ...config, ballCount: parseInt(e.target.value) })} />
                        </label>
                        <label className="ob-slider">
                            <span className="ob-slider__label"><RotateCw size={15} /> Velocidad de giro <b>{config.rotationSpeed}</b></span>
                            <input type="range" min="0" max="10" value={config.rotationSpeed} onChange={(e) => setConfig({ ...config, rotationSpeed: parseInt(e.target.value) })} />
                        </label>

                        <div className="ob-ops">
                            <span className="ob-slider__label"><Shapes size={15} /> Tipos de contenido</span>
                            {visibleOperations.length > 0 ? (
                                <div className="ob-ops__grid">
                                    {visibleOperations.map(op => (
                                        <button
                                            key={op.id}
                                            type="button"
                                            onClick={() => toggleOp(op.id)}
                                            className={`ob-op ${config.ops[op.id] ? 'is-on' : ''}`}
                                            aria-pressed={!!config.ops[op.id]}
                                        >
                                            <span className="ob-op__check">{config.ops[op.id] && <Check size={13} strokeWidth={3} />}</span>
                                            {op.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="ob-error">Error: No hay operaciones disponibles para este nivel.</p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={`ob-switchrow ${config.randomSize ? 'is-on' : ''}`}
                            onClick={() => setConfig({ ...config, randomSize: !config.randomSize })}
                            aria-pressed={config.randomSize}
                        >
                            <span className="ob-switchrow__icon"><EyeOff size={16} /></span>
                            <span className="ob-switchrow__text">
                                <b>Tamaño engañoso</b>
                                <small>El tamaño no indica el valor</small>
                            </span>
                            <i className="ob-switchrow__track"><i /></i>
                        </button>

                        <GameButton size="lg" icon={Play} onClick={startGame} className="ob-play">¡Jugar!</GameButton>
                    </div>
                </div>
                {instructions}
            </GameShell>
        );
    }

    // Solo presentación: mismos números que se envían en onGameComplete
    const secs = Math.max(1, Math.round(timeElapsed / 1000));
    const bonusVis = Math.max(0, Math.round((config.ballCount * 5 - secs) * 10));

    return (
        <GameShell {...shellProps}>
            {header}
            <div className="ob-bar">
                <span className={`ob-timer ${gameState !== 'playing' ? 'is-stopped' : ''}`}>
                    <span className="ob-timer__icon"><Timer size={16} /></span>
                    <span className="ob-timer__digits">{formatTime(timeElapsed)}</span>
                </span>
                <Hud>
                    <span className="ob-info"><Circle size={14} /> {config.ballCount} bolas</span>
                    <span className="ob-info"><Gauge size={14} /> Giro {config.rotationSpeed}</span>
                </Hud>
                <div className="ob-bar__tools">
                    <GameButton variant="soft" size="sm" icon={Settings} onClick={backToConfig}>Ajustes</GameButton>
                    <GameButton variant="soft" size="sm" icon={RefreshCw} onClick={restartGame}>Reiniciar</GameButton>
                </div>
            </div>

            <div className={`ob-stage ${gameState === 'lost' || gameState === 'won' ? 'has-result' : ''}`}>
                <div ref={sceneRef} className="ob-scene" />

                {(gameState === 'lost' || gameState === 'won') && (
                    <div className={`ob-result ${gameState === 'won' ? 'is-won' : 'is-lost'}`}>
                        <div className="ob-result__card">
                            <ResultsScreen
                                title={gameState === 'won' ? '¡Victoria!' : '¡Fallaste!'}
                                subtitle={gameState === 'won' ? '¡Has ordenado todo correctamente!' : 'Debes marcar las bolas de menor a mayor valor.'}
                                nota={gameState === 'won' ? 10 : 0}
                                points={gameState === 'won' ? config.ballCount * 100 + bonusVis : 0}
                                stats={[
                                    { icon: Timer, tone: 'time', label: 'Tiempo', value: formatTime(timeElapsed) },
                                    { icon: Circle, tone: 'accent', label: 'Bolas', value: config.ballCount },
                                ]}
                                actions={[
                                    { label: gameState === 'won' ? 'Jugar otra vez' : 'Reintentar', onClick: restartGame, icon: RefreshCw },
                                    { label: 'Ajustes', onClick: backToConfig, icon: Settings, variant: 'soft' },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </div>
            {instructions}
        </GameShell>
    );
};

export default OrdenaBolas;
