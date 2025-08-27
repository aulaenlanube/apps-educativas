// Modificación de OrdenaLaHistoriaJuego para enlazar los JSON según la materia
// Al igual que en OrdenaLaFraseJuego, el código original cargaba siempre
// historias genéricas en primaria usando 'general' como identificador de
// asignatura. Este archivo cambia esa lógica para que se emplee el
// `subjectId` de la URL cuando esté disponible. Esto permite que el
// método getHistorias busque archivos del tipo `<asignatura>-ordena-historia.json`.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';
import { getHistorias } from './../../../public/data/api';

const OrdenaLaHistoriaJuego = () => {
  const { level, grade, subjectId } = useParams();
  const [historias, setHistorias] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hook inicial para el juego; se activa el temporizador a partir de 3º
  const conTemporizador = grade >= 3;
  const game = useOrdenaLaHistoriaGame(historias || [], conTemporizador);

  useEffect(() => {
    const cargarContenido = async () => {
      setIsLoading(true);
      // En primaria usamos subjectId si está definido; de lo contrario 'general'
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const historiasData = await getHistorias(level, grade, asignatura);
      setHistorias(historiasData);
      setIsLoading(false);
    };
    cargarContenido();
  }, [level, grade, subjectId]);

  if (isLoading) {
    return <div className="text-center p-10 font-bold">Cargando juego...</div>;
  }
  if (!historias || historias.length === 0) {
    return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía.</div>;
  }
  if (game.isTestMode) {
    return <OrdenaLaHistoriaTestScreen game={game} />;
  }
  return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaJuego;