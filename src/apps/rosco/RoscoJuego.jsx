import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRoscoData } from '../../services/gameDataService';
import { useRoscoGame } from '@/hooks/useRoscoGame';
import RoscoUI from '../_shared/RoscoUI.jsx';

const RoscoJuego = ({ onGameComplete } = {}) => {
    const { level, grade, subjectId } = useParams();
    const [data, setData] = useState(null);
    const [studyMaterial, setStudyMaterial] = useState(null);

    const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

    useEffect(() => {
        const loadData = async () => {
            const roscoData = await getRoscoData(level, grade, asignatura);
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

        // Optimización: Si ya tenemos los datos del juego cargados, los usamos directamente.
        // Esto evita tener ficheros duplicados *-material-de-estudio.json cuando el contenido es el mismo.
        if (data && Array.isArray(data) && data.length > 0) {
            const generated = generateStudyMaterialFromData(data);
            setStudyMaterial(generated);
            return generated;
        }

        // Si no hay datos cargados, intentar cargar del servicio
        try {
            const roscoData = await getRoscoData(level, grade, asignatura);
            if (roscoData && roscoData.length > 0) {
                const material = generateStudyMaterialFromData(roscoData);
                setStudyMaterial(material);
                return material;
            }
        } catch (error) {
            console.warn("No se pudo generar material de estudio.");
        }
        return null;
    };

    const game = useRoscoGame(data);

    return <RoscoUI {...game} loadStudyMaterial={loadStudyMaterial} onGameComplete={onGameComplete} />;
};

export default RoscoJuego;