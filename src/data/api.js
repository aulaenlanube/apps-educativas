// src/data/api.js

// Función para obtener las frases de una materia concreta
export async function getFrases(nivel, curso, asignatura_id) {
  try {
    // Construimos la ruta al archivo JSON dinámicamente
    const path = `/${nivel}/${curso}/${asignatura_id}-ordena-frase.json`;
    const module = await import(`./${path}`);
    return module.default; // Los JSON se importan como el export 'default'
  } catch (error) {
    console.error("No se encontró el contenido para 'ordena-frase':", error);
    return []; // Devolvemos un array vacío si el archivo no existe
  }
}

// Función para obtener las historias de una materia concreta
export async function getHistorias(nivel, curso, asignatura_id) {
    try {
      const path = `/${nivel}/${curso}/${asignatura_id}-ordena-historia.json`;
      const module = await import(`./${path}`);
      return module.default;
    } catch (error) {
      console.error("No se encontró el contenido para 'ordena-historia':", error);
      return [];
    }
}