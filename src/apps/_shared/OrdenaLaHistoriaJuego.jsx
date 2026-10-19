import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import { getOrdenaHistoriasConBloques } from '../../services/gameDataService';
import { useBloquesTematicos, BloquePicker } from './BloquesTematicos';
import { GameShell, GameHeader, GameLoading, GameEmpty } from './kit';

// Colores del icono de la app (amanecer → noche: la historia avanza)
const SHELL = { accent: '#f97316', accent2: '#6366f1' };
// Mínimo de historias distintas para ofrecer un bloque (examen = 5; margen para no repetir).
const MIN_HISTORIAS_BLOQUE = 8;

const OrdenaLaHistoriaJuego = ({ onGameComplete } = {}) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => {
    const n = parseInt(gradeParam, 10);
    return Number.isNaN(n) ? 1 : n;
  }, [gradeParam]);

  const [historias, setHistorias] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const conTemporizador = grade >= 3;
  const { bloques, bloque, setBloque, elementos } = useBloquesTematicos(historias, MIN_HISTORIAS_BLOQUE);
  const game = useOrdenaLaHistoriaGame(elementos, conTemporizador);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      setIsLoading(true);
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const data = await getOrdenaHistoriasConBloques(level, grade, asignatura);
      if (!vivo) return;
      setHistorias(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };
    cargar();
    return () => { vivo = false; };
  }, [level, grade, subjectId]);

  if (isLoading) {
    return (
      <GameShell {...SHELL}>
        <GameLoading label="Preparando historias…" />
      </GameShell>
    );
  }
  if (!historias || historias.length === 0) {
    return (
      <GameShell {...SHELL}>
        <GameHeader />
        <GameEmpty title="Aún no hay historias">
          No hay contenido disponible para este juego todavía.
        </GameEmpty>
      </GameShell>
    );
  }

  // Un único UI que muestra práctica o test según game.isTestMode
  return (
    <OrdenaLaHistoriaUI
      game={game}
      onGameComplete={onGameComplete}
      total={elementos.length}
      bloque={bloque}
      filters={<BloquePicker bloques={bloques} value={bloque} onChange={setBloque} total={historias.length} unidad="historias" />}
    />
  );
};

export default OrdenaLaHistoriaJuego;
