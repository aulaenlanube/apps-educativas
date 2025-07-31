// src/data/api.js

export async function getFrases(nivel, curso, asignatura_id) {
  try {
    const fileName = nivel === 'primaria'
      ? 'ordena-frase.json'
      : `${asignatura_id}-ordena-frase.json`;
    
    // CAMBIO: Usamos fetch para cargar el JSON como un activo estático desde la carpeta 'public'.
    const response = await fetch(`/data/${nivel}/${curso}/${fileName}`);
    
    // Si la respuesta no es OK (ej. 404 Not Found), lanzamos un error para verlo en la consola.
    if (!response.ok) {
      throw new Error(`Error HTTP! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Error al cargar 'ordena-frase' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return []; // Devuelve un array vacío si hay cualquier error
  }
}

export async function getHistorias(nivel, curso, asignatura_id) {
  try {
    const fileName = nivel === 'primaria'
      ? 'ordena-historia.json'
      : `${asignatura_id}-ordena-historia.json`;
      
    // CAMBIO: Usamos fetch para cargar el JSON como un activo estático.
    const response = await fetch(`/data/${nivel}/${curso}/${fileName}`);

    if (!response.ok) {
      throw new Error(`Error HTTP! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`Error al cargar 'ordena-historia' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return []; // Devuelve un array vacío si hay cualquier error
  }
}