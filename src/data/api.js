// src/data/api.js

/**
 * Carga dinámicamente las frases para el juego "Ordena la Frase".
 */
export async function getFrases(nivel, curso, asignatura_id) {
  try {
    const fileName = nivel === 'primaria'
      ? 'ordena-frase.json'
      : `${asignatura_id}-ordena-frase.json`;

    // RUTA CORREGIDA: La ruta debe ser relativa a este mismo fichero (api.js)
    const module = await import(`./${nivel}/${curso}/${fileName}`);
    return module.default;
  } catch (error) {
    console.error(`Error al cargar 'ordena-frase' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}

/**
 * Carga dinámicamente las historias para el juego "Ordena la Historia".
 */
export async function getHistorias(nivel, curso, asignatura_id) {
  try {
    const fileName = nivel === 'primaria'
      ? 'ordena-historia.json'
      : `${asignatura_id}-ordena-historia.json`;
      
    // RUTA CORREGIDA: La ruta debe ser relativa a este mismo fichero (api.js)
    const module = await import(`./${nivel}/${curso}/${fileName}`);
    return module.default;
  } catch (error) {
    console.error(`Error al cargar 'ordena-historia' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}