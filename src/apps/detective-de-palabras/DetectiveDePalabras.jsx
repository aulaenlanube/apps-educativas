// src/apps/detective-de-palabras/DetectiveDePalabras.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDetectiveDePalabras } from '../../hooks/useDetectiveDePalabras';
import DetectiveDePalabrasUI from '../_shared/DetectiveDePalabrasUI';
import DetectiveDePalabrasTestScreen from '../_shared/DetectiveDePalabrasTestScreen';

const DetectiveDePalabras = () => {
  // Grado desde la URL
  const { grade } = useParams();
  const grado = useMemo(() => {
    const n = parseInt(grade, 10);
    return Number.isFinite(n) && n >= 1 && n <= 6 ? String(n) : '1';
  }, [grade]);

  // Estado de datos
  const [frasesDelNivel, setFrasesDelNivel] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Temporizador activo desde 3º
  const conTemporizador = parseInt(grado, 10) >= 3;

  // Llamar siempre al hook para mantener el orden de hooks
  const game = useDetectiveDePalabras(frasesDelNivel, conTemporizador);

  // Normaliza y baraja
  const normalizar = (entrada) => {
    if (!Array.isArray(entrada)) throw new Error('Formato inválido');
    return entrada
      .map((item) => {
        if (typeof item === 'string') return { solucion: item.trim() };
        if (item && typeof item.solucion === 'string') return { solucion: item.solucion.trim() };
        return null;
      })
      .filter(Boolean);
  };

  // Baraja con Fisher–Yates
  const shuffle = (arr) => {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };

  // Carga del JSON y barajado
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    const base = import.meta.env.BASE_URL || '/';
    const urlPrincipal = `${base}data/primaria/${grado}/detective-palabras.json`;
    const urlFallback = `${base}data/primaria/1/detective-palabras.json`;

    const cargar = async (url) => {
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const datos = await resp.json();
      return shuffle(normalizar(datos));
    };

    (async () => {
      try {
        const frases = await cargar(urlPrincipal);
        if (!cancelado) {
          setFrasesDelNivel(frases);
          setCargando(false);
        }
      } catch {
        try {
          const fallback = await cargar(urlFallback);
          if (!cancelado) {
            setFrasesDelNivel(fallback);
            setCargando(false);
          }
        } catch (e2) {
          if (!cancelado) {
            setError('No se pudieron cargar las frases');
            setCargando(false);
          }
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [grado]);

  // Estados intermedios
  if (cargando) return <div style={{ padding: 16 }}>Cargando frases…</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;

  // Render
  if (game.isTestMode) return <DetectiveDePalabrasTestScreen game={game} />;
  return <DetectiveDePalabrasUI game={game} />;
};

export default DetectiveDePalabras;
