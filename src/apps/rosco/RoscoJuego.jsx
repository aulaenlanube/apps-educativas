import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRosco } from '../../../public/data/api'; // Ajusta la ruta relativa según corresponda
import { useRoscoGame } from '@/hooks/useRoscoGame';
import RoscoUI from '../_shared/RoscoUI.jsx';

const RoscoJuego = () => {
    const { level, grade, subjectId } = useParams();
    const [data, setData] = useState(null);

    // Si estamos en primaria y no hay subjectId en la URL (porque es genérico),
    // forzamos que cargue 'lengua' como definimos en el paso 1.
    const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

    useEffect(() => {
        const loadData = async () => {
            const roscoData = await getRosco(level, grade, asignatura);
            setData(roscoData);
        };
        loadData();
    }, [level, grade, asignatura]);

    const game = useRoscoGame(data);

    return <RoscoUI {...game} />;
};

export default RoscoJuego;