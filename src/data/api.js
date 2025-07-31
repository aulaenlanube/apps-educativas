// src/data/api.js

/**
 * Carga dinámicamente las frases para el juego "Ordena la Frase".
 * @param {string} nivel - 'primaria' o 'eso'.
 * @param {string} curso - El número del curso, ej: '1', '2'.
 * @param {string} asignatura_id - El id de la asignatura, ej: 'lengua', 'general'.
 * @returns {Promise<string[]>} Un array con las frases del juego.
 */
export async function getFrases(nivel, curso, asignatura_id) {
  try {
    // CORRECCIÓN: Creamos el nombre del archivo dependiendo del nivel
    const fileName = nivel === 'primaria'
      ? 'ordena-frase.json'
      : `${asignatura_id}-ordena-frase.json`;

    const path = `./${nivel}/${curso}/${fileName}`;
    
    // Vite necesita que la ruta del import dinámico sea relativamente explícita
    const module = await import(/* @vite-ignore */ `../data/${nivel}/${curso}/${fileName}`);
    return module.default;
  } catch (error) {
    console.error(`Error al cargar el contenido de 'ordena-frase' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}

/**
 * Carga dinámicamente las historias para el juego "Ordena la Historia".
 * @param {string} nivel - 'primaria' o 'eso'.
 * @param {string} curso - El número del curso, ej: '1', '2'.
 * @param {string} asignatura_id - El id de la asignatura, ej: 'general'.
 * @returns {Promise<string[][]>} Un array de arrays con las historias.
 */
export async function getHistorias(nivel, curso, asignatura_id) {
  try {
    // CORRECCIÓN: Creamos el nombre del archivo dependiendo del nivel
    const fileName = nivel === 'primaria'
      ? 'ordena-historia.json'
      : `${asignatura_id}-ordena-historia.json`;

    const module = await import(/* @vite-ignore */ `../data/${nivel}/${curso}/${fileName}`);
    return module.default;
  } catch (error) {
    console.error(`Error al cargar el contenido de 'ordena-historia' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}