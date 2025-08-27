// Modificación de OrdenaLaFraseJuego para enlazar los JSON según la materia
// En la versión original de esta app, para cursos de primaria se cargaban
// siempre frases genéricas usando el identificador de asignatura 'general'.
// Este archivo modifica ese comportamiento para que, cuando se navegue
// desde una asignatura concreta, se utilice el `subjectId` del parámetro
// de la ruta. Así, las funciones getFrases podrán recuperar el archivo
// `<asignatura>-ordena-frase.json` que hayamos creado. Si por cualquier
// motivo no existe subjectId (por ejemplo, por rutas antiguas), se
// mantiene el fallback a 'general'.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';
import { getFrases } from './../../../public/data/api';

const OrdenaLaFraseJuego = () => {
  const { level, grade, subjectId } = useParams();
  const [frases, setFrases] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mantener el hook al inicio para no cambiar el orden de llamadas
  const conTemporizador = (level === 'primaria' && grade >= 3) || level === 'eso';
  const game = useOrdenaLaFraseGame(frases || [], conTemporizador);

  useEffect(() => {
    const cargarContenido = async () => {
      setIsLoading(true);
      // Para primaria utilizamos el subjectId si existe; de lo contrario
      // recurrimos a 'general'. Esto permite cargar frases específicas
      // para cada asignatura.
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const frasesData = await getFrases(level, grade, asignatura);
      setFrases(frasesData);
      setIsLoading(false);
    };
    cargarContenido();
  }, [level, grade, subjectId]);

  if (isLoading) {
    return <div className="text-center p-10 font-bold">Cargando juego...</div>;
  }

  if (!frases || frases.length === 0) {
    return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía.</div>;
  }

  if (game.isTestMode) {
    return <OrdenaLaFraseTestScreen game={game} />;
  }
  return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseJuego;