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

    const generateStudyMaterialFromData = (roscoData) => {
        if (!roscoData || !Array.isArray(roscoData)) return null;

        const seccionesMap = {};
        roscoData.forEach(item => {
            if (!seccionesMap[item.letra]) {
                seccionesMap[item.letra] = {
                    letra: item.letra,
                    conceptos: []
                };
            }
            seccionesMap[item.letra].conceptos.push({
                termino: item.solucion,
                definicion: item.definicion,
                pista: item.tipo === 'empieza' ? `Empieza por ${item.letra}` : `Contiene la ${item.letra}`
            });
        });

        const secciones = Object.values(seccionesMap).sort((a, b) => {
            return a.letra.localeCompare(b.letra, 'es');
        });

        return {
            titulo: `Material de Estudio - ${asignatura.charAt(0).toUpperCase() + asignatura.slice(1)}`,
            introduccion: `Repasa este vocabulario de ${asignatura} para ganar en el Rosco.`,
            secciones
        };
    };

    const loadStudyMaterial = async () => {
        if (studyMaterial) return studyMaterial;

        try {
            const path = `/data/${level}/${grade}/${asignatura}-rosco-material-de-estudio.json`;
            const response = await fetch(path);
            if (response.ok) {
                const material = await response.json();
                setStudyMaterial(material);
                return material;
            }
        } catch (error) {
            console.warn("No se encontró archivo de material, generando desde datos del rosco...");
        }

        const generated = generateStudyMaterialFromData(data);
        setStudyMaterial(generated);
        return generated;
    };

    const game = useRoscoGame(data);

    return <RoscoUI {...game} loadStudyMaterial={loadStudyMaterial} />;
};

export default RoscoJuego;