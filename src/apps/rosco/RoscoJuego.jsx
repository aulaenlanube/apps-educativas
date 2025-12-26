import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRosco } from '../../../public/data/api'; // Ajusta la ruta relativa según corresponda
import { useRoscoGame } from '@/hooks/useRoscoGame';
import RoscoUI from '../_shared/RoscoUI.jsx';

const RoscoJuego = () => {
    const { level, grade, subjectId } = useParams();
    const [data, setData] = useState(null);
    const [studyMaterial, setStudyMaterial] = useState(null);

    const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

    useEffect(() => {
        const loadData = async () => {
            const roscoData = await getRosco(level, grade, asignatura);
            setData(roscoData);
        };
        loadData();
    }, [level, grade, asignatura]);

    const loadStudyMaterial = async () => {
        if (studyMaterial) return studyMaterial;
        try {
            // Reutilizamos la lógica de rutas, asumiendo que el material sigue el patrón
            const path = `/data/${level}/${grade}/${asignatura}-rosco-material-de-estudio.json`;
            const response = await fetch(path);
            if (!response.ok) throw new Error('No se encontró el material');
            const material = await response.json();
            setStudyMaterial(material);
            return material;
        } catch (error) {
            console.error("Error cargando material de estudio:", error);
            return null;
        }
    };

    const game = useRoscoGame(data);

    return <RoscoUI {...game} loadStudyMaterial={loadStudyMaterial} />;
};

export default RoscoJuego;