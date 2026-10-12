import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import {
    Check, ChevronsRight, Code2, Cpu, Eraser, FileCode2, Lock, Play, ScanSearch, ShieldAlert, Unlock,
} from 'lucide-react';
import { getAppContent } from '../../services/gameDataService';
import { GameShell, GameHeader, Hud, HudStat } from '../_shared/kit';
import './TerminalRetro.css';

// Solo presentación: familia de cada comando para colorear la leyenda de su tecla.
const CMD_GROUP = {
    SET: 'io', PRINT: 'io', READ: 'io',
    ADD: 'math', SUB: 'math', MUL: 'math', DIV: 'math', MOD: 'math',
    IF: 'flow', ELSE: 'flow', REPEAT: 'flow', WHILE: 'flow', END: 'flow',
    '>': 'cmp', '<': 'cmp', '==': 'cmp',
};
const pad2 = (n) => String(n).padStart(2, '0');

// Marco del monitor CRT (carcasa, cristal con scanlines/viñeta/reflejo y frontal).
function CrtMonitor({ children, led = 'on' }) {
    return (
        <section className={`trx-monitor is-${led}`} aria-label="Terminal">
            <div className="trx-monitor__frame">
                <div className="trx-glass">
                    <span className="trx-glass__refresh" aria-hidden="true" />
                    {children}
                </div>
            </div>
            <div className="trx-monitor__chin" aria-hidden="true">
                <span className="trx-vents"><i /><i /><i /><i /><i /></span>
                <span className="trx-plate">EDU·TERM <b>2000</b></span>
                <span className={`trx-power is-${led}`}><i />PWR</span>
            </div>
        </section>
    );
}

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
                const data = await getAppContent('terminal-retro', 'eso', grade || '1');
                if (data) {

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
                    // eslint-disable-next-line eqeqeq
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

    // ---- Solo presentación: numeración de líneas del editor sincronizada con su scroll ----
    const gutterRef = useRef(null);
    const syncGutter = (e) => {
        if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
    };

    if (!currentLevel) return (
        <GameShell theme="dark" accent="#22c55e" accent2="#a3e635" wide className="trx-shell">
            <GameHeader />
            <CrtMonitor led="boot">
                <div className="trx-boot" role="status">
                    <span>EDU-TERM BIOS v2.0</span>
                    <span>MEMORIA ............. OK</span>
                    <span>MÓDULOS DE MISIÓN ... CARGANDO</span>
                    <strong>LOADING SYSTEM...<span className="trx-cursor">_</span></strong>
                </div>
            </CrtMonitor>
        </GameShell>
    );

    const isTrace = currentLevel.type === 'trace';
    const codeLines = code.split('\n');
    const isIdle = inputs.length === 0 && !feedback && !isRunning;

    return (
        <GameShell theme="dark" accent="#22c55e" accent2="#a3e635" wide className="trx-shell">
            {/* FIXED TOOLTIP (en <body> para quedar por encima de todo) */}
            {hoveredCmd && createPortal(
                <div
                    className="trx-tooltip"
                    style={{
                        left: Math.min(hoveredCmd.x, window.innerWidth - 300),
                        top: hoveredCmd.y
                    }}
                >
                    <div className="trx-tooltip__cmd">{hoveredCmd.cmd}</div>
                    {HELP_DOCS[hoveredCmd.cmd] ? HELP_DOCS[hoveredCmd.cmd].split('\n').slice(1).join('\n') : 'Insertar comando'}
                </div>,
                document.body
            )}

            {/* HELP MODAL */}
            {showHelp && createPortal(
                <div className="trx-modal-bg" role="dialog" aria-modal="true" aria-labelledby="trx-help-title">
                    <div className="trx-window trx-window--md">
                        <div className="trx-window__bar">
                            <span className="trx-window__lights" aria-hidden="true"><i /><i /><i /></span>
                            <span className="trx-window__name">MANUAL.TXT</span>
                            <button type="button" onClick={() => setShowHelp(false)} className="trx-window__close">
                                [X] CERRAR
                            </button>
                        </div>
                        <div className="trx-window__body">
                            <h2 id="trx-help-title" className="trx-window__title">MANUAL DE COMANDOS v1.0</h2>
                            <div className="trx-docs">
                                {Object.entries(HELP_DOCS).map(([cmd, doc]) => (
                                    <div key={cmd} className={`trx-doc is-${CMD_GROUP[cmd] || 'io'}`}>
                                        <h3 className="trx-doc__cmd">{cmd}</h3>
                                        <pre className="trx-doc__text">{doc}</pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* EXAMPLES MODAL */}
            {showExamples && createPortal(
                <div className="trx-modal-bg" role="dialog" aria-modal="true" aria-labelledby="trx-examples-title">
                    <div className="trx-window trx-window--lg">
                        <div className="trx-window__bar">
                            <span className="trx-window__lights" aria-hidden="true"><i /><i /><i /></span>
                            <span className="trx-window__name">EJEMPLOS.BAS</span>
                            <button type="button" onClick={() => setShowExamples(false)} className="trx-window__close">
                                [X] CERRAR
                            </button>
                        </div>
                        <div className="trx-window__body">
                            <h2 id="trx-examples-title" className="trx-window__title">MODELOS DE PROGRAMAS</h2>
                            <div className="trx-examples">
                                {Object.entries(EXAMPLES).map(([difficulty, programs]) => (
                                    <div key={difficulty} className={`trx-examples__col is-${difficulty === 'FACIL' ? 'easy' : difficulty === 'MEDIO' ? 'medium' : 'hard'}`}>
                                        <h3 className="trx-examples__h">{difficulty}</h3>
                                        {programs.map((prog, idx) => (
                                            <div key={idx} className="trx-example">
                                                <h4 className="trx-example__title">{prog.title}</h4>
                                                <p className="trx-example__desc">{prog.description}</p>
                                                <pre className="trx-example__code">{prog.code}</pre>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <GameHeader
                right={(
                    <Hud>
                        <HudStat icon={Cpu} tone="good" value={`${currentLevelIndex + 1}/${levelData.length}`} label="Nivel" />
                        <HudStat icon={isTrace ? ScanSearch : Code2} tone="accent" value={isTrace ? 'Análisis' : 'Código'} label="Tipo" />
                    </Hud>
                )}
            />

            {/* Barra: progreso de niveles (indicador visual) + manual y ejemplos */}
            <div className="trx-bar">
                <div className="trx-strip" aria-label="Progreso de niveles">
                    <span className="trx-strip__label">Nivel</span>
                    <ol className="trx-strip__track">
                        {levelData.map((lvl, i) => {
                            const state = i < currentLevelIndex ? 'done' : i === currentLevelIndex ? 'current' : 'locked';
                            const cleared = state === 'done' || (state === 'current' && isSuccess);
                            return (
                                <li
                                    key={i}
                                    className={`trx-seg is-${state} ${cleared ? 'is-cleared' : ''}`}
                                    aria-current={state === 'current' ? 'step' : undefined}
                                    title={`Nivel ${i + 1} · ${lvl.type === 'trace' ? 'Análisis' : 'Codificación'}`}
                                >
                                    <span className="trx-seg__num">{pad2(i + 1)}</span>
                                    <span className="trx-seg__type" aria-hidden="true">
                                        {lvl.type === 'trace' ? <ScanSearch size={13} /> : <Code2 size={13} />}
                                    </span>
                                    <span className="trx-seg__icon" aria-hidden="true">
                                        {cleared ? <Check size={13} strokeWidth={3} /> : state === 'locked' ? <Lock size={12} /> : <ChevronsRight size={14} />}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
                <div className="trx-bar__tools">
                    <button type="button" onClick={() => setShowHelp(true)} className="trx-tool">
                        <span className="trx-tool__glyph" aria-hidden="true">?</span> Manual de ayuda
                    </button>
                    <button type="button" onClick={() => setShowExamples(true)} className="trx-tool">
                        <span className="trx-tool__glyph" aria-hidden="true">#</span> Ejemplos de código
                    </button>
                </div>
            </div>

            <div className={`trx-rig ${isTrace ? 'is-trace' : 'is-coding'}`}>
                {/* EXPEDIENTE DE LA MISIÓN */}
                <section className="trx-dossier" aria-label="Expediente de la misión">
                    <span className="trx-dossier__tab">Expediente</span>
                    <div className="trx-dossier__sheet">
                        <span className="trx-stamp" aria-hidden="true">Clasificado</span>
                        <div className="trx-dossier__head">
                            <h2 className="trx-dossier__level">NIVEL {currentLevel.id}</h2>
                            <span className="trx-badge">{isTrace ? 'ANÁLISIS' : 'CODIFICACIÓN'}</span>
                        </div>
                        <p className="trx-dossier__title">{currentLevel.title}</p>
                        <p className="trx-dossier__desc">{currentLevel.description}</p>

                        {isTrace ? (
                            <div className="trx-printout">
                                <span className="trx-printout__chip">READ-ONLY</span>
                                <div className="trx-printout__paper">
                                    {String(currentLevel.code || '').split('\n').map((ln, i) => (
                                        <div key={i} className="trx-printout__line">
                                            <span className="trx-printout__ln" aria-hidden="true">{pad2(i + 1)}</span>
                                            <code>{ln || ' '}</code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="trx-goal">
                                <strong>OBJETIVO:</strong>
                                <span>{currentLevel.goal}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* MONITOR CRT */}
                <CrtMonitor led={isRunning ? 'busy' : feedback && !isSuccess ? 'alert' : 'on'}>
                    {!isTrace && (
                        <div className="trx-pane trx-pane--editor">
                            <div className="trx-pane__bar">
                                <span><FileCode2 size={12} aria-hidden="true" /> EDITOR DE CÓDIGO</span>
                                <span className="trx-pane__file">MISION_{pad2(currentLevel.id)}.BAS</span>
                            </div>
                            <div className="trx-editor">
                                <div className="trx-editor__gutter" ref={gutterRef} aria-hidden="true">
                                    {codeLines.map((_, i) => <span key={i}>{i + 1}</span>)}
                                </div>
                                <textarea
                                    ref={codeAreaRef}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onScroll={syncGutter}
                                    className="trx-editor__input"
                                    placeholder="// Escribe tu código aquí..."
                                    spellCheck={false}
                                    wrap="off"
                                    aria-label="Editor de código"
                                />
                            </div>
                        </div>
                    )}

                    <div className="trx-pane trx-pane--output">
                        <div className="trx-pane__bar">
                            <span>SYSTEM OUTPUT</span>
                            <span className="trx-live">● LIVE</span>
                        </div>
                        <div className="trx-output">
                            {isIdle && (
                                <div className="trx-idle" aria-hidden="true">
                                    <span>EDU-TERM v2.0 · SISTEMA LISTO</span>
                                    {isTrace ? (
                                        <>
                                            <span>&gt; ANALIZA EL CÓDIGO DEL EXPEDIENTE</span>
                                            <span>&gt; ESCRIBE EL RESULTADO EN EL PROMPT</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>&gt; ESCRIBE TU PROGRAMA EN EL EDITOR</span>
                                            <span>&gt; PULSA EJECUTAR PARA LANZARLO</span>
                                        </>
                                    )}
                                    <span className="trx-cursor">_</span>
                                </div>
                            )}
                            {inputs.map((line, i) => (
                                <div key={i} className={`trx-line ${line.startsWith('INPUT') ? 'is-input' : ''}`}>{line}</div>
                            ))}
                            {isRunning && <span className="trx-cursor trx-cursor--run">_</span>}
                            <div ref={bottomRef}></div>
                        </div>
                        {/* Aviso y tecla de siguiente nivel fijos al pie de la salida (siempre visibles) */}
                        {(feedback || isSuccess) && (
                            <div className="trx-output__foot">
                                {feedback && (
                                    <div key={feedback} role="status" className={`trx-alert ${isSuccess ? 'is-ok' : 'is-ko'}`}>
                                        <span className="trx-alert__icon" aria-hidden="true">
                                            {isSuccess ? <Unlock size={22} /> : <ShieldAlert size={22} />}
                                        </span>
                                        <span className="trx-alert__text">
                                            <strong>{isSuccess ? 'ACCESO CONCEDIDO' : 'ALERTA DEL SISTEMA'}</strong>
                                            <span>{feedback}</span>
                                        </span>
                                    </div>
                                )}
                                {isSuccess && (
                                    <button type="button" onClick={nextLevel} className="trx-next">
                                        <span className="trx-next__cap">SIGUIENTE NIVEL <ChevronsRight size={20} aria-hidden="true" /></span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {isTrace && (
                        <div className="trx-prompt">
                            <label htmlFor="trx-answer" className="trx-prompt__label">Introduce el resultado:</label>
                            <div className="trx-prompt__row">
                                <span className="trx-prompt__ps" aria-hidden="true">root@edu:~$</span>
                                <input
                                    id="trx-answer"
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    className="trx-prompt__input"
                                    placeholder=">_"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <button type="button" onClick={runInterpreter} className="trx-check">CHECK</button>
                            </div>
                        </div>
                    )}
                </CrtMonitor>
            </div>

            {/* TECLADO DE COMANDOS (solo niveles de codificación) */}
            {!isTrace && (
                <section className="trx-deck" aria-label="Teclado de comandos">
                    <div className="trx-deck__top">
                        <span className="trx-deck__label">Comandos</span>
                        <span className="trx-deck__hint">Pulsa una tecla para insertarla · pasa el ratón para ver su ayuda</span>
                        <span className="trx-deck__leds" aria-hidden="true"><i className="is-on" /><i className={isRunning ? 'is-on' : ''} /><i /></span>
                    </div>
                    <div className="trx-deck__body">
                        <div className="trx-keys">
                            {commands.map(cmd => (
                                <button
                                    key={cmd}
                                    type="button"
                                    onClick={() => addToCode(cmd)}
                                    onMouseEnter={(e) => handleCmdMouseEnter(cmd, e)}
                                    onMouseLeave={handleCmdMouseLeave}
                                    className={`trx-key is-${CMD_GROUP[cmd] || 'io'}`}
                                >
                                    <span className="trx-key__cap">{cmd}</span>
                                </button>
                            ))}
                        </div>
                        <div className="trx-deck__actions">
                            <button type="button" onClick={() => setCode('')} className="trx-key trx-key--clear">
                                <span className="trx-key__cap"><Eraser size={16} aria-hidden="true" /> LIMPIAR</span>
                            </button>
                            <button type="button" onClick={runInterpreter} disabled={isRunning} className={`trx-key trx-key--run ${isRunning ? 'is-busy' : ''}`}>
                                <span className="trx-key__cap">
                                    <Play size={18} aria-hidden="true" /> {isRunning ? 'EJECUTANDO...' : 'EJECUTAR'}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </GameShell>
    );
};

export default TerminalRetro;
