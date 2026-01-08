import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const TerminalRetro = () => {
    const { grade } = useParams(); // Get the grade (1, 2, 3, 4) from URL
    const [levelData, setLevelData] = useState([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [code, setCode] = useState("");
    const [inputs, setInputs] = useState([]); // Console log of inputs/outputs
    const [isRunning, setIsRunning] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [userAnswer, setUserAnswer] = useState(""); // For Trace type questions
    const [showHelp, setShowHelp] = useState(false); // Help modal state
    const [hoveredCmd, setHoveredCmd] = useState(null); // { cmd, x, y }

    const [showExamples, setShowExamples] = useState(false); // Examples modal state

    // EXAMPLES Data
    const EXAMPLES = {
        'FACIL': [
            { title: 'Suma Simple', description: 'Define dos variables, las suma y muestra el resultado.', code: 'SET A 10\nSET B 20\nADD A B\nPRINT A' },
            { title: 'Saludo', description: 'Imprime mensajes de texto simples en la consola.', code: 'PRINT "Hola"\nPRINT "Mundo"' },
            { title: 'Resta Básica', description: 'Resta un valor a una variable existente.', code: 'SET PUNTOS 50\nSUB PUNTOS 10\nPRINT PUNTOS' },
            { title: 'Multiplicación', description: 'Multiplica una variable por un valor específico.', code: 'SET PRECIO 5\nMUL PRECIO 2\nPRINT PRECIO' }
        ],
        'MEDIO': [
            { title: 'Contador', description: 'Usa un bucle REPEAT para contar del 1 al 5.', code: 'SET I 0\nREPEAT 5\n  ADD I 1\n  PRINT I\nEND' },
            { title: 'Condicional', description: 'Usa IF/ELSE para tomar decisiones basadas en valores.', code: 'SET EDAD 15\nIF EDAD > 18\n  PRINT "Mayor"\nELSE\n  PRINT "Menor"\nEND' },
            { title: 'Tabla del 2', description: 'Calcula y muestra la tabla del 2 usando un bucle.', code: 'SET NUM 0\nREPEAT 5\n  ADD NUM 2\n  PRINT NUM\nEND' },
            { title: 'Acumulador', description: 'Suma valores repetidamente en una variable total.', code: 'SET TOTAL 0\nREPEAT 4\n  ADD TOTAL 10\nEND\nPRINT TOTAL' }
        ],
        'DIFICIL': [
            { title: 'Multiplicación (Sumas)', description: 'Simula una multiplicación usando sumas repetidas.', code: 'SET RES 0\nREPEAT 5\n  ADD RES 3\nEND\nPRINT RES' },
            { title: 'Cuenta Regresiva', description: 'Usa un bucle WHILE para contar hacia atrás.', code: 'SET N 5\nWHILE N > 0\n  PRINT N\n  SUB N 1\nEND\nPRINT "BOOM"' },
            { title: 'Factorial (Simulado)', description: 'Calcula el producto de números sucesivos.', code: 'SET F 1\nSET N 1\nREPEAT 4\n  MUL F N\n  ADD N 1\nEND\nPRINT F' },
            { title: 'Números Pares', description: 'Imprime solo los números pares incrementando de 2 en 2.', code: 'SET P 0\nREPEAT 5\n  ADD P 2\n  PRINT P\nEND' }
        ]
    };

    const codeAreaRef = useRef(null);

    const bottomRef = useRef(null);

    // Help documentation
    const HELP_DOCS = {
        'SET': 'SET [variable] [valor]\nAsigna un valor numérico o texto a una variable.\nEj: SET PUNTOS 100',
        'PRINT': 'PRINT [texto/variable]\nEscribe en la consola.\nEj: PRINT "Hola Mundo" o PRINT PUNTOS',
        'READ': 'READ [variable]\nLee un valor introducido por el usuario y lo guarda.\nEj: READ NOMBRE',
        'ADD': 'ADD [variable] [valor]\nSuma el valor a la variable.\nEj: ADD PUNTOS 10',
        'SUB': 'SUB [variable] [valor]\nResta el valor a la variable.\nEj: SUB VIDAS 1',
        'MUL': 'MUL [variable] [valor]\nMultiplica la variable por el valor.\nEj: MUL PRECIO 2',
        'DIV': 'DIV [variable] [valor]\nDivide la variable por el valor.\nEj: DIV TOTAL 2',
        'MOD': 'MOD [variable] [valor]\nCalcula el resto de la división.\nEj: MOD NUMERO 2',
        'REPEAT': 'REPEAT [veces] ... END\nRepite el bloque de código un número de veces.\nEj: REPEAT 5\n  PRINT "Hola"\nEND',
        'WHILE': 'WHILE [condición] ... END\nRepite mientras la condición sea verdadera.\nEj: WHILE A < 10\n  ADD A 1\nEND',
        'IF': 'IF [condición] ... ELSE ... END\nEjecuta código si se cumple la condición.\nEj: IF A > 5\n  PRINT "Mayor"\nELSE\n  PRINT "Menor"\nEND',
        'ELSE': 'ELSE\nParte alternativa de un bloque IF.\nEj: IF A > 5 ... ELSE ... END',
        'END': 'END\nMarca el final de un bloque IF, REPEAT o WHILE.',
        '>': '>\nOperador mayor que.\nEj: IF A > B',
        '<': '<\nOperador menor que.\nEj: IF A < B',
        '==': '==\nOperador de igualdad.\nEj: IF A == B'
    };

    // Load data based on grade
    useEffect(() => {
        const loadLevels = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/eso/${grade || '1'}/programacion-terminal-retro.json`);
                if (response.ok) {
                    const data = await response.json();

                    // Process data to select one variant per level initially
                    const processedData = data.map(level => {
                        if (level.variants && Array.isArray(level.variants)) {
                            // Pick random variant
                            const randomIndex = Math.floor(Math.random() * level.variants.length);
                            return { ...level, ...level.variants[randomIndex] };
                        }
                        return level;
                    });

                    setLevelData(processedData);
                    setCurrentLevelIndex(0);
                } else {
                    console.error("Failed to load levels");
                }
            } catch (error) {
                console.error("Error loading levels:", error);
            }
        };
        loadLevels();
    }, [grade]);

    const currentLevel = levelData[currentLevelIndex];

    useEffect(() => {
        if (currentLevel) {
            if (currentLevel.type === 'trace') {
                setCode(currentLevel.code || "");
            } else {
                setCode(currentLevel.initialCode || "");
            }
            setInputs([]);
            setFeedback("");
            setIsSuccess(false);
            setUserAnswer("");
        }
    }, [currentLevel]);

    const commands = ['SET', 'PRINT', 'READ', 'ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'IF', 'ELSE', 'REPEAT', 'WHILE', 'END', '>', '<', '=='];

    const addToCode = (cmd) => {
        if (currentLevel.type === 'trace') return; // Read only for trace levels
        setCode(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + cmd + " ");
        if (codeAreaRef.current) codeAreaRef.current.focus();
    };

    const handleCmdMouseEnter = (cmd, e) => {
        const rect = e.target.getBoundingClientRect();
        setHoveredCmd({
            cmd,
            x: rect.right + 10, // Show to the right
            y: rect.top
        });
    };

    const handleCmdMouseLeave = () => {
        setHoveredCmd(null);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


    const runInterpreter = async () => {
        if (currentLevel.type === 'trace') {
            if (userAnswer.trim() === currentLevel.solution.trim()) {
                setIsSuccess(true);
                setFeedback("CORRECT ACCESS CODE.");
            } else {
                setFeedback("ACCESS DENIED: INCORRECT VALUE.");
            }
            return;
        }

        setIsRunning(true);
        setInputs([]);
        setFeedback("");

        const lines = code.split('\n').map(l => l.trim()).filter(l => l);
        const outputBuffer = [];
        const variables = {};
        const inputQueue = ["HOLA", "5", "10", "20"]; // Simulated inputs

        const evaluateExpression = (val) => {
            if (!isNaN(Number(val))) return Number(val);
            if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
            return variables[val] !== undefined ? variables[val] : 0;
        };

        try {
            let i = 0;
            let limit = 0;
            while (i < lines.length && limit < 1000) {
                limit++;
                const line = lines[i];
                const parts = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                if (!parts) { i++; continue; }

                const cmd = parts[0].toUpperCase();
                await delay(30);

                if (cmd === 'SET') variables[parts[1]] = evaluateExpression(parts[2]);
                else if (['ADD', 'SUB', 'MUL', 'DIV', 'MOD'].includes(cmd)) {
                    const target = parts[1];
                    const val = evaluateExpression(parts[2]);
                    if (variables[target] !== undefined) {
                        if (cmd === 'ADD') variables[target] += val;
                        if (cmd === 'SUB') variables[target] -= val;
                        if (cmd === 'MUL') variables[target] *= val;
                        if (cmd === 'DIV') variables[target] /= val;
                        if (cmd === 'MOD') variables[target] %= val;
                    }
                }
                else if (cmd === 'PRINT') {
                    const content = line.substring(6).trim();
                    let toPrint = content;
                    if (content.startsWith('"') && content.endsWith('"')) toPrint = content.slice(1, -1);
                    else if (variables[content] !== undefined) toPrint = variables[content];
                    outputBuffer.push(String(toPrint));
                    setInputs(prev => [...prev, `> ${toPrint}`]);
                }
                else if (cmd === 'READ') {
                    const target = parts[1];
                    const val = inputQueue.shift() || "0";
                    variables[target] = isNaN(Number(val)) ? val : Number(val);
                    setInputs(prev => [...prev, `INPUT < ${val}`]);
                }
                else if (cmd === 'REPEAT') {
                    const count = evaluateExpression(parts[1]);
                    let block = [];
                    let depth = 1;
                    let j = i + 1;
                    while (j < lines.length && depth > 0) {
                        if (/^(REPEAT|WHILE|IF)/.test(lines[j].toUpperCase())) depth++;
                        if (lines[j].toUpperCase() === 'END') depth--;
                        if (depth > 0) block.push(lines[j]);
                        j++;
                    }
                    // Execute block linear repetition (Simple simulation)
                    for (let k = 0; k < count; k++) {
                        for (let line of block) {
                            await processLine(line, variables, outputBuffer);
                        }
                    }
                    i = j;
                    continue;
                }
                else if (cmd === 'IF') {
                    // Basic IF support for demo: IF VAR OP VALUE
                    const val1 = evaluateExpression(parts[1]);
                    const op = parts[2];
                    const val2 = evaluateExpression(parts[3]);
                    let condition = false;
                    if (op === '>') condition = val1 > val2;
                    else if (op === '<') condition = val1 < val2;
                    else if (op === '==') condition = val1 == val2;

                    if (!condition) {
                        // Skip to ELSE or END
                        let depth = 1;
                        let j = i + 1;
                        let elseIndex = -1;
                        while (j < lines.length && depth > 0) {
                            if (/^(REPEAT|WHILE|IF)/.test(lines[j].toUpperCase())) depth++;
                            if (lines[j].toUpperCase() === 'END') depth--;
                            if (lines[j].toUpperCase() === 'ELSE' && depth === 1) elseIndex = j;
                            if (depth === 0) break;
                            j++;
                        }

                        if (elseIndex !== -1) i = elseIndex; // Go to ELSE
                        else i = j; // Go to END
                        continue;
                    }
                }
                else if (cmd === 'ELSE') {
                    // If we hit ELSE naturally, it means the IF was true and we executed the block.
                    // So we must skip to END.
                    let depth = 1;
                    let j = i + 1;
                    while (j < lines.length && depth > 0) {
                        if (/^(REPEAT|WHILE|IF)/.test(lines[j].toUpperCase())) depth++;
                        if (lines[j].toUpperCase() === 'END') depth--;
                        j++;
                    }
                    i = j;
                    continue;
                }
                // (WHILE not implemented in this simpler version to avoid infinite loops risk in demo without proper parser)

                i++;
            }
            validateOutput(outputBuffer);
        } catch (e) {
            setFeedback("RUNTIME ERROR: " + e.message);
        }
        setIsRunning(false);
    };

    // Helper for single line execution in loops
    const processLine = async (line, variables, outputBuffer) => {
        const parts = line.match(/(?:[^\s"]+|"[^"]*")+/g);
        if (!parts) return;
        const cmd = parts[0].toUpperCase();

        const evaluate = (val) => {
            if (!isNaN(Number(val))) return Number(val);
            if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
            return variables[val] !== undefined ? variables[val] : 0;
        };

        if (cmd === 'ADD') variables[parts[1]] += evaluate(parts[2]);
        else if (cmd === 'PRINT') {
            const content = line.substring(6).trim();
            let toPrint = content;
            if (content.startsWith('"') && content.endsWith('"')) toPrint = content.slice(1, -1);
            else if (variables[content] !== undefined) toPrint = variables[content];
            outputBuffer.push(String(toPrint));
            setInputs(prev => [...prev, `> ${toPrint}`]);
        }
        // ... (truncated simplified support for loop internals)
    };

    const validateOutput = (outputBuffer) => {
        let success = false;
        const criteria = currentLevel.solutionCriteria;
        if (criteria) {
            const joined = outputBuffer.join('\n');
            if (criteria.outputContains && joined.includes(criteria.outputContains)) success = true;
            if (criteria.outputContainsAll) success = criteria.outputContainsAll.every(v => joined.includes(v));
            if (criteria.outputMatchRegex) {
                const regex = new RegExp(criteria.outputMatchRegex);
                success = regex.test(joined);
            }
        }
        if (success) {
            setIsSuccess(true);
            setFeedback("MISSION ACCOMPLISHED. SYSTEM SECURE.");
        } else {
            setFeedback("MISSION FAILED. OUTPUT MISMATCH.");
        }
    };

    const nextLevel = () => {
        if (currentLevelIndex < levelData.length - 1) setCurrentLevelIndex(prev => prev + 1);
    };

    if (!currentLevel) return <div className="bg-black text-green-500 h-screen p-10 font-mono">LOADING SYSTEM...</div>;

    return (
        <div className="h-[85vh] bg-black text-green-500 font-mono p-4 flex flex-col md:flex-row gap-4 overflow-hidden relative border-2 border-green-900 rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.1)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent pointer-events-none bg-[length:100%_3px] animate-[scanline_4s_linear_infinite]"></div>

            {/* FIXED TOOLTIP */}
            {hoveredCmd && (
                <div
                    className="fixed z-50 bg-black border border-green-500 text-green-400 text-xs p-3 rounded shadow-[0_0_20px_rgba(0,255,0,0.4)] pointer-events-none max-w-xs whitespace-pre-wrap"
                    style={{
                        left: Math.min(hoveredCmd.x, window.innerWidth - 300),
                        top: hoveredCmd.y
                    }}
                >
                    <div className="font-bold border-b border-green-800 pb-1 mb-1 text-center text-green-300">{hoveredCmd.cmd}</div>
                    {HELP_DOCS[hoveredCmd.cmd] ? HELP_DOCS[hoveredCmd.cmd].split('\n').slice(1).join('\n') : 'Insertar comando'}
                </div>
            )}

            {/* HELP MODAL */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border-2 border-green-500 p-6 rounded max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-[0_0_30px_rgba(0,255,0,0.3)] no-scrollbar">
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 text-green-500 hover:text-white font-bold"
                        >
                            [X] CERRAR
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-green-800 pb-2">MANUAL DE COMANDOS v1.0</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(HELP_DOCS).map(([cmd, doc]) => (
                                <div key={cmd} className="bg-black/50 p-3 rounded border border-green-900">
                                    <h3 className="text-green-300 font-bold mb-1">{cmd}</h3>
                                    <pre className="text-xs text-green-600 whitespace-pre-wrap font-mono">{doc}</pre>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* EXAMPLES MODAL */}
            {showExamples && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border-2 border-green-500 p-6 rounded max-w-4xl w-full max-h-[80vh] overflow-y-auto relative shadow-[0_0_30px_rgba(0,255,0,0.3)] no-scrollbar">
                        <button
                            onClick={() => setShowExamples(false)}
                            className="absolute top-4 right-4 text-green-500 hover:text-white font-bold"
                        >
                            [X] CERRAR
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-green-800 pb-2">MODELOS DE PROGRAMAS</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(EXAMPLES).map(([difficulty, programs]) => (
                                <div key={difficulty} className="flex flex-col gap-4">
                                    <h3 className={`text-xl font-bold border-b pb-1 ${difficulty === 'FACIL' ? 'text-green-300 border-green-300' : difficulty === 'MEDIO' ? 'text-yellow-300 border-yellow-300' : 'text-red-400 border-red-400'}`}>{difficulty}</h3>
                                    {programs.map((prog, idx) => (
                                        <div key={idx} className="bg-black border border-green-900 p-3 rounded hover:border-green-500 transition-colors cursor-default group">
                                            <h4 className="text-green-100 font-bold mb-1 group-hover:text-green-400">{prog.title}</h4>
                                            <p className="text-xs text-green-600 mb-2 italic border-b border-green-900/50 pb-2">{prog.description}</p>
                                            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono bg-gray-900/50 p-2 rounded">{prog.code}</pre>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT PANEL */}
            <div className="w-full md:w-1/3 bg-gray-900 border-2 border-green-800 p-6 rounded shadow-[0_0_15px_rgba(0,255,0,0.1)] flex flex-col z-10 gap-4">
                <div className="border-b border-green-800 pb-4 text-center">
                    <h1 className="text-3xl font-bold mb-1 tracking-widest text-green-400 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">TERMINAL v.2</h1>
                    <div className="text-[10px] text-green-700 uppercase tracking-[0.3em]">System Ready</div>
                </div>

                {/* HELP & EXAMPLES BUTTONS */}
                <div className="flex flex-col gap-2 mx-8">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-xs bg-green-900/40 border border-green-600 hover:bg-green-600 hover:text-black text-green-200 font-bold px-4 py-2 rounded shadow-[0_0_10px_rgba(0,255,0,0.1)] transition-all uppercase tracking-wider"
                    >
                        [?] Manual de Ayuda
                    </button>
                    <button
                        onClick={() => setShowExamples(true)}
                        className="text-xs bg-green-900/40 border border-green-600 hover:bg-green-600 hover:text-black text-green-200 font-bold px-4 py-2 rounded shadow-[0_0_10px_rgba(0,255,0,0.1)] transition-all uppercase tracking-wider"
                    >
                        [#] Ejemplos de código
                    </button>
                </div>

                <div className="flex-1 flex flex-col mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl text-green-400 font-bold">NIVEL {currentLevel.id}</h2>
                        <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded border border-green-700">{currentLevel.type === 'trace' ? 'ANÁLISIS' : 'CODIFICACIÓN'}</span>
                    </div>
                    <p className="text-green-300 font-bold mb-1">{currentLevel.title}</p>
                    <p className="text-green-600 text-sm mb-4 leading-relaxed">{currentLevel.description}</p>

                    {currentLevel.type === 'trace' ? (
                        <div className="bg-black border border-green-700 p-4 mb-4 rounded relative flex-1 overflow-y-auto custom-scrollbar">
                            <span className="absolute top-0 right-0 bg-green-900 text-[10px] px-2 text-green-200">READ-ONLY</span>
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed opacity-90 font-mono text-green-400">{currentLevel.code}</pre>
                        </div>
                    ) : (
                        <div className="bg-green-900/10 p-3 rounded border border-green-800 text-sm mb-4">
                            <strong className="text-green-400 block mb-1">OBJETIVO:</strong>
                            <span className="text-green-600">{currentLevel.goal}</span>
                        </div>
                    )}
                </div>

                {/* CONTROLS */}
                {currentLevel.type === 'trace' ? (
                    <div className="mt-auto pt-4 border-t border-green-900">
                        <label className="block text-xs mb-2 uppercase tracking-wider text-green-500">Introduce el resultado:</label>
                        <div className="flex gap-2">
                            <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} className="bg-black border border-green-600 p-2 flex-1 min-w-0 outline-none text-green-400 font-bold placeholder-green-900" placeholder=">_" />
                            <button onClick={runInterpreter} className="bg-green-700 text-black font-bold px-4 hover:bg-green-600 border border-green-500 flex-shrink-0">CHECK</button>
                        </div>
                    </div>

                ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar border-t border-green-900 pt-2">
                        <h3 className="text-[10px] font-bold mb-2 text-green-700 uppercase tracking-widest text-center">- COMANDOS -</h3>
                        <div className="grid grid-cols-4 gap-1">
                            {commands.map(cmd => (
                                <button
                                    key={cmd}
                                    onClick={() => addToCode(cmd)}
                                    onMouseEnter={(e) => handleCmdMouseEnter(cmd, e)}
                                    onMouseLeave={handleCmdMouseLeave}
                                    className="w-full bg-gray-900 border border-green-800 hover:border-green-400 text-xs py-1 px-1 rounded hover:bg-green-900 text-green-400 font-bold transition-all transform hover:scale-105"
                                >
                                    {cmd}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT PANEL: TERMINAL */}
            <div className="flex-1 flex flex-col gap-4 z-10">
                {currentLevel.type === 'coding' && (
                    <div className="flex-1 bg-black border-2 border-green-800 rounded p-4 relative output-glow flex flex-col">
                        <div className="absolute top-0 right-0 bg-green-800 text-black text-xs px-2 font-bold uppercase rounded-bl">EDITOR DE CÓDIGO</div>
                        <textarea ref={codeAreaRef} value={code} onChange={(e) => setCode(e.target.value)} className="w-full flex-1 bg-transparent border-none outline-none resize-none font-mono text-green-500 placeholder-green-900 leading-relaxed mt-4 custom-scrollbar" placeholder="// Escribe tu código aquí..." />
                    </div>
                )}
                <div className={`flex-1 bg-black border-2 border-green-800 rounded p-4 overflow-y-auto font-mono text-sm relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] custom-scrollbar ${currentLevel.type === 'trace' ? 'h-full' : 'h-1/2'}`}>
                    <div className="absolute top-0 left-0 bg-green-900/30 text-green-600 text-[10px] px-2 w-full border-b border-green-900 uppercase tracking-widest flex justify-between items-center">
                        <span>System Output</span>
                        <span className="text-[9px] animate-pulse">● LIVE</span>
                    </div>
                    <div className="mt-6 flex flex-col gap-1">
                        {inputs.map((line, i) => <div key={i} className="opacity-90 border-l-2 border-green-900 pl-2">{line}</div>)}
                        {isRunning && <span className="animate-pulse pl-2">_</span>}
                        {feedback && <div className={`mt-4 p-2 border-l-4 ${isSuccess ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-red-500 text-red-500 bg-red-900/20'}`}>{feedback}</div>}
                        {isSuccess && <button onClick={nextLevel} className="mt-4 bg-green-600 text-black font-bold py-3 w-full hover:bg-green-500 animate-bounce shadow-[0_0_15px_rgba(0,255,0,0.6)] uppercase tracking-widest">{'>'}{'>'} SIGUIENTE NIVEL {'>'}{'>'}</button>}
                    </div>
                    <div ref={bottomRef}></div>
                </div>
                {currentLevel.type === 'coding' && (
                    <div className="flex gap-2">
                        <button onClick={runInterpreter} disabled={isRunning} className="flex-1 bg-green-700 text-black font-bold py-3 rounded hover:bg-green-600 disabled:opacity-50 tracking-widest text-lg shadow-[0_0_15px_rgba(0,255,0,0.3)] border border-green-500 transition-all hover:scale-[1.01] active:scale-[0.99]">
                            {isRunning ? 'E J E C U T A N D O . . .' : '▶ E J E C U T A R'}
                        </button>
                        <button onClick={() => setCode('')} className="bg-red-900/20 text-red-500 border border-red-900 px-6 rounded hover:bg-red-900/40 hover:text-red-400 transition-colors uppercase font-bold text-xs tracking-wider">
                            LIMPIAR
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scanline { 0% { background-position: 0% 0%; } 100% { background-position: 0% 100%; } }
                .output-glow { box-shadow: 0 0 10px rgba(0, 255, 0, 0.1); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #001100; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #004400; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #006600; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default TerminalRetro;
