const fs = require('fs');

const path = 'c:\\Users\\edtor\\Desktop\\apps-educativas\\src\\apps\\banco-recursos-tutoria\\BancoRecursosTutoria.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update imports
content = content.replace(
    /import React, { useState } from 'react';/,
    "import React, { useState, useEffect } from 'react';"
);

// 2. Find the component start and the end of the blocks array
const startMarker = 'const BancoRecursosTutoria = () => {';
const endMarker = 'const currentBlock = blocks.find';

const startIndex = content.indexOf(startMarker) + startMarker.length;
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found');
    process.exit(1);
}

const newLogic = `
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBlock, setActiveBlock] = useState('block1');
    const [activeSessionIdx, setActiveSessionIdx] = useState(0);
    const [expandedRubrics, setExpandedRubrics] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/data/bancoRecursosTutoriaBlocks.json');
                const data = await response.json();
                setBlocks(data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error loading tutoring data:", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleRubric = (id) => {
        setExpandedRubrics(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleBlockChange = (blockId) => {
        setActiveBlock(blockId);
        setActiveSessionIdx(0);
        setExpandedRubrics({});
    };

    if (loading) {
        return (
            <div className="tutoria-app loading-screen">
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Cargando recursos...</p>
                </div>
            </div>
        );
    }

    if (!blocks || blocks.length === 0) {
        return (
            <div className="tutoria-app error-screen">
                <p>No se pudieron cargar los datos de tutoría.</p>
            </div>
        );
    }
`;

const updatedContent = content.substring(0, startIndex) + newLogic + "\n    " + content.substring(endIndex);

fs.writeFileSync(path, updatedContent, 'utf8');
console.log('File updated successfully');
