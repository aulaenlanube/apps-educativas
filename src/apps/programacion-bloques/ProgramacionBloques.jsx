import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProgramacionBloques = () => {
    const { grade } = useParams();
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [userBlocks, setUserBlocks] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [output, setOutput] = useState([]);

    // Modals & Windows States
    const [showHelp, setShowHelp] = useState(false);
    const [showExamples, setShowExamples] = useState(false);
    const [showMission, setShowMission] = useState(true);

    // Help & Examples Data
    const HELP_DOCS = {
        'SET': 'SET [var] [val] - Asigna valor.',
        'PRINT': 'PRINT [val] - Escribe en pantalla.',
        'ADD': 'ADD [var] [val] - Suma a variable.',
        'SUB': 'SUB [var] [val] - Resta a variable.',
        'MUL': 'MUL [var] [val] - Multiplica.',
        'DIV': 'DIV [var] [val] - Divide.',
        'IF': 'IF [cond] GOTO [lbl] - Salto condicional.',
        'GOTO': 'GOTO [lbl] - Salto incondicional.',
        'LABEL': 'LABEL [nombre] - Marca destino salto.'
    };

    const EXAMPLES = {
        'BASIC': [
            { title: 'Suma', code: 'SET A 5\nADD A 3\nPRINT A' },
            { title: 'Bucle', code: 'SET I 0\nLABEL L\nADD I 1\nIF I < 5 GOTO L' }
        ],
        'ADVANCED': [
            { title: 'Mayor', code: 'SET A 10\nIF A > 5 GOTO SI\nPRINT "NO"\nGOTO FIN\nLABEL SI\nPRINT "SI"\nLABEL FIN' }
        ]
    };

    useEffect(() => {
        const loadLevels = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/eso/${grade}/programacion-bloques.json`);
                if (!response.ok) throw new Error('Failed to load levels');
                const data = await response.json();

                // Process variants if they exist
                const processedData = data.map(level => {
                    if (level.variants && Array.isArray(level.variants)) {
                        const randomIndex = Math.floor(Math.random() * level.variants.length);
                        return { ...level, ...level.variants[randomIndex] };
                    }
                    return level;
                });

                setLevels(processedData);
            } catch (error) {
                console.error('Error loading levels:', error);
                setFeedback('Error loading system data...');
            }
        };
        loadLevels();
    }, [grade]);

    useEffect(() => {
        if (levels.length > 0) {
            const level = levels[currentLevelIndex];
            const shuffled = [...level.blocks].sort(() => Math.random() - 0.5);
            setUserBlocks(shuffled);
            setFeedback('');
            setIsSuccess(false);
            setOutput([]);
            setShowMission(true); // Re-open mission on new level
        }
    }, [levels, currentLevelIndex]);

    const moveBlock = (index, direction) => {
        if (isSuccess) return;
        const newBlocks = [...userBlocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
        }
        setUserBlocks(newBlocks);
    };

    const checkOrder = () => {
        const currentLevel = levels[currentLevelIndex];
        const correct = currentLevel.blocks;
        let allCorrect = true;
        if (userBlocks.length !== correct.length) allCorrect = false;
        else {
            for (let i = 0; i < correct.length; i++) {
                if (userBlocks[i] !== correct[i]) {
                    allCorrect = false;
                    break;
                }
            }
        }

        if (allCorrect) {
            setIsSuccess(true);
            setFeedback('Compilation Successful. Executing...');
            setOutput(['Compilando... OK', 'Linkando... OK', 'Ejecutando...', '----------------', 'PROGRAM ENDED (Code 0)']);
        } else {
            setFeedback('Runtime Error: Bad Logic.');
            setOutput(['Error en secuencia de instrucciones.', 'Revise el orden del código.']);
        }
    };

    const nextLevel = () => {
        if (currentLevelIndex < levels.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
        }
    };

    if (levels.length === 0) return <div className="bg-[#008080] min-h-screen flex items-center justify-center text-white font-bold animate-pulse">Iniciando Windows...</div>;

    const currentLevel = levels[currentLevelIndex];

    // --- SUB-COMPONENTS ---

    const Win31Window = ({ title, x, y, width, height, children, onClose, isActive = true, className = '' }) => (
        <div
            className={`absolute flex flex-col bg-white border-2 border-[#dfdfdf] shadow-[4px_4px_0px_rgba(0,0,0,0.5)] ${className}`}
            style={{ left: x, top: y, width, height: height || 'auto', zIndex: isActive ? 10 : 1 }}
        >
            {/* Window Frame Borders (Outer Gray) */}
            <div className="absolute inset-0 border-t border-l border-white border-b border-r border-black pointer-events-none"></div>
            <div className="absolute inset-[2px] border-t border-l border-[#dfdfdf] border-b border-r border-[#808080] pointer-events-none"></div>

            {/* Title Bar */}
            <div className="m-[3px] bg-[#000080] text-white p-1 flex justify-between items-center select-none h-6">
                <div className="flex items-center gap-2 w-full">
                    {/* System Menu */}
                    <button
                        onClick={onClose}
                        className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center font-bold text-black text-[10px] active:border-t-black"
                    >
                        -
                    </button>
                    <span className="font-bold text-xs font-sans truncate w-full text-center tracking-wider">{title}</span>
                    {/* Maximize/Minimize (Fake) */}
                    <div className="flex gap-0.5">
                        <button className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center font-bold text-black text-[8px]">▲</button>
                        <button className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center font-bold text-black text-[8px]">▼</button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 mx-[3px] mb-[3px] bg-white border border-black overflow-hidden relative">
                {children}
            </div>
        </div>
    );

    const Win31Icon = ({ icon, label, onClick }) => (
        <div
            onClick={onClick}
            className="flex flex-col items-center gap-1 cursor-pointer w-20 group"
        >
            <div className="w-8 h-8 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-black text-[10px] font-sans text-center px-1 group-hover:bg-[#000080] group-hover:text-white leading-tight">
                {label}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#008080] font-sans select-none overflow-hidden relative p-4">

            {/* MAIN PROGRAM MANAGER WINDOW */}
            <div className="w-full max-w-6xl h-[85vh] mx-auto bg-[#c0c0c0] border-2 border-white shadow-2xl flex flex-col relative">
                {/* Main Title Bar */}
                <div className="bg-[#000080] p-1 flex justify-between items-center text-white h-8">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="w-6 h-6 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center font-bold text-black shadow-sm">-</button>
                        <span className="font-bold tracking-wide text-sm">Program Manager</span>
                    </div>
                    <div className="flex gap-1">
                        <button className="w-6 h-6 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center text-black text-xs">▼</button>
                        <button className="w-6 h-6 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center text-black text-xs">▲</button>
                    </div>
                </div>

                {/* Main Menu */}
                <div className="bg-[#c0c0c0] px-2 py-0.5 flex gap-4 text-black text-sm border-b border-gray-500">
                    <span className="underline">F</span>ile
                    <span className="underline">O</span>ptions
                    <span className="underline">W</span>indow
                    <span className="underline">H</span>elp
                </div>

                {/* MDI Workspace (White Background behind windows) */}
                <div className="flex-1 bg-white relative overflow-hidden p-4 border-t border-gray-800">

                    {/* 1. TOOLS WINDOW (Top Left) */}
                    <Win31Window
                        title="Herramientas"
                        x="2%" y="2%" width="200px" height="auto"
                        onClose={() => { }}
                    >
                        <div className="p-4 grid grid-cols-2 gap-4 bg-white/50">
                            <Win31Icon
                                icon="📝" label="Misión.txt"
                                onClick={() => setShowMission(true)}
                            />
                            <Win31Icon
                                icon="📚" label="Sintaxis.hlp"
                                onClick={() => setShowHelp(true)}
                            />
                            <Win31Icon
                                icon="💡" label="Ejemplos.exe"
                                onClick={() => setShowExamples(true)}
                            />
                            <Win31Icon
                                icon="💾" label="Guardar"
                                onClick={() => { }}
                            />
                        </div>
                    </Win31Window>

                    {/* 2. EDITOR WINDOW (Center Right) */}
                    <Win31Window
                        title={`Editor - ${currentLevel.title}`}
                        x="240px" y="2%" width="calc(100% - 260px)" height="60%"
                        isActive={true}
                        onClose={() => navigate(-1)}
                    >
                        <div className="flex flex-col h-full bg-white">
                            {/* Toolbar */}
                            <div className="bg-[#c0c0c0] p-1 border-b border-black flex gap-2">
                                <button
                                    onClick={checkOrder} disabled={isSuccess}
                                    className="px-2 py-0.5 text-xs font-bold border-2 border-white border-b-black border-r-black bg-[#c0c0c0] active:border-t-black"
                                >
                                    ▶ RUN
                                </button>
                                {isSuccess && (
                                    <button
                                        onClick={nextLevel}
                                        className="px-2 py-0.5 text-xs font-bold border-2 border-white border-b-black border-r-black bg-[#c0c0c0] active:border-t-black text-blue-800"
                                    >
                                        NEXT »
                                    </button>
                                )}
                            </div>
                            {/* Code Area */}
                            <div className="flex-1 p-2 overflow-auto font-mono text-sm bg-white">
                                {userBlocks.map((block, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center mb-1 p-1 border ${isSuccess ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-300'} cursor-pointer hover:bg-blue-100`}
                                    >
                                        <span className="w-6 text-gray-400 select-none text-right mr-2">{index + 1}</span>
                                        <span className={`flex-1 ${isSuccess ? 'text-green-800' : 'text-blue-900'}`}>{block}</span>
                                        {!isSuccess && (
                                            <div className="flex flex-col gap-0.5 ml-2">
                                                <button onClick={() => moveBlock(index, 'up')} className="w-4 h-3 flex items-center justify-center bg-[#c0c0c0] border border-black text-[8px] leading-none">▲</button>
                                                <button onClick={() => moveBlock(index, 'down')} className="w-4 h-3 flex items-center justify-center bg-[#c0c0c0] border border-black text-[8px] leading-none">▼</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Win31Window>

                    {/* 3. CONSOLE WINDOW (Bottom) */}
                    <Win31Window
                        title="MS-DOS System"
                        x="240px" y="64%" width="calc(100% - 260px)" height="30%"
                        className="bg-black"
                        onClose={() => { }}
                    >
                        <div className="bg-black text-gray-300 font-mono text-xs p-2 h-full overflow-auto">
                            <div className="mb-2">Microsoft(R) MS-DOS(R) Version 6.0<br />(C)Copyright Microsoft Corp 1981-1993.</div>
                            <div className="text-white">C:\PROJECTS\SOURCE\{currentLevel.id}</div>
                            {output.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                            <div className="animate-pulse">_</div>
                        </div>
                    </Win31Window>

                    {/* 4. NOTEPAD MISSION (Floating Modal style) */}
                    {showMission && (
                        <Win31Window
                            title="Notepad - Mision.txt"
                            x="50px" y="100px" width="300px" height="auto"
                            className="shadow-2xl z-50"
                            onClose={() => setShowMission(false)}
                        >
                            <div className="bg-white p-2 font-mono text-sm h-full flex flex-col">
                                <div className="mb-2 border-b border-gray-300 pb-2">
                                    <span className="font-bold">OBJETIVO:</span>
                                </div>
                                <div className="flex-1 whitespace-pre-wrap">
                                    {currentLevel.goal}
                                </div>
                                <div className="mt-4 text-center">
                                    <button onClick={() => setShowMission(false)} className="px-4 py-1 border border-black text-xs font-bold hover:bg-black hover:text-white transition-colors">ENTENDIDO</button>
                                </div>
                            </div>
                        </Win31Window>
                    )}

                    {/* HELP MODAL */}
                    {showHelp && (
                        <Win31Window title="Ayuda" x="100px" y="50px" width="320px" onClose={() => setShowHelp(false)}>
                            <div className="p-2 font-mono text-xs h-64 overflow-auto">
                                {Object.entries(HELP_DOCS).map(([cmd, desc]) => (
                                    <div key={cmd} className="mb-2 pb-1 border-b border-dashed border-gray-300">
                                        <b className="text-blue-800">{cmd}</b><br />{desc}
                                    </div>
                                ))}
                            </div>
                        </Win31Window>
                    )}

                    {/* EXAMPLES MODAL */}
                    {showExamples && (
                        <Win31Window title="Ejemplos" x="150px" y="80px" width="400px" onClose={() => setShowExamples(false)}>
                            <div className="p-2 font-mono text-xs h-64 overflow-auto bg-gray-50">
                                {Object.entries(EXAMPLES).map(([cat, list]) => (
                                    <div key={cat} className="mb-4">
                                        <u className="font-bold text-sm block mb-1">{cat}</u>
                                        {list.map((ex, i) => (
                                            <div key={i} className="mb-2 bg-white border border-gray-300 p-1">
                                                <div className="font-bold text-blue-700">{ex.title}</div>
                                                <pre className="text-gray-600 pl-2 border-l-2 border-gray-300">{ex.code}</pre>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </Win31Window>
                    )}

                </div>
                {/* Status Bar */}
                <div className="bg-[#c0c0c0] border-t border-white px-2 py-0.5 text-xs font-sans text-gray-800 flex justify-between">
                    <span>Selected: {userBlocks.length} lines</span>
                    <span>Level {currentLevelIndex + 1}/{levels.length}</span>
                </div>
            </div>
        </div>
    );
};

export default ProgramacionBloques;
