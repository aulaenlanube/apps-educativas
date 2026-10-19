import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import { getOrdenaFrasesConBloques } from '../../services/gameDataService';
import { useBloquesTematicos, BloquePicker } from './BloquesTematicos';
import { GameShell, GameHeader, GameLoading, GameEmpty } from './kit';

// Colores del icono de la app (fichas blancas sobre baldosa rosa + ficha índigo)
const SHELL = { accent: '#f43f5e', accent2: '#8b5cf6' };
// Mínimo de frases distintas para ofrecer un bloque (examen = 5; margen para no repetir).
const MIN_FRASES_BLOQUE = 12;

const OrdenaLaFraseJuego = ({ onGameComplete } = {}) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);

  const [frases, setFrases] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const conTemporizador = (level === 'primaria' && grade >= 3) || level === 'eso';
  const { bloques, bloque, setBloque, elementos } = useBloquesTematicos(frases, MIN_FRASES_BLOQUE);
  const game = useOrdenaLaFraseGame(elementos, conTemporizador);

  useEffect(() => {
    const cargarContenido = async () => {
      setIsLoading(true);
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const frasesData = await getOrdenaFrasesConBloques(level, grade, asignatura);
      setFrases(frasesData || []);
      setIsLoading(false);
    };
    cargarContenido();
  }, [level, grade, subjectId]);

  if (isLoading) {
    return (
      <GameShell {...SHELL}>
        <GameLoading label="Preparando frases…" />
      </GameShell>
    );
  }
  if (!frases || frases.length === 0) {
    return (
      <GameShell {...SHELL}>
        <GameHeader />
        <GameEmpty title="Aún no hay frases">
          No hay contenido disponible para este juego todavía.
        </GameEmpty>
      </GameShell>
    );
  }

  // Un único componente UI gestiona práctica y test
  return (
    <OrdenaLaFraseUI
      game={game}
      onGameComplete={onGameComplete}
      total={elementos.length}
      bloque={bloque}
      filters={<BloquePicker bloques={bloques} value={bloque} onChange={setBloque} total={frases.length} unidad="frases" />}
    />
  );
};

export default OrdenaLaFraseJuego;
