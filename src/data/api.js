// src/data/api.js

export async function getFrases(nivel, curso, asignatura_id) {
  try {
    const fileName = nivel === 'primaria'
      ? 'ordena-frase.json'
      : `${asignatura_id}-ordena-frase.json`;

    // CORRECCIÓN: Usamos una ruta absoluta desde /src/ para que Vite la entienda
    const module = await import(`/src/data/${nivel}/${curso}/${fileName}`);
    return module.default;
  } catch (error) {
    console.error(`Error al cargar 'ordena-frase' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}

export async function getHistorias(nivel, curso, asignatura_id) {
  try {
    const fileName = nivel === 'primaria'
      ? 'ordena-historia.json'
      : `${asignatura_id}-ordena-historia.json`;
      
    // CORRECCIÓN: Usamos una ruta absoluta desde /src/ para que Vite la entienda
    const module = await import(`/src/data/${nivel}/${curso}/${fileName}`);
    return module.default;
  } catch (error) {
    console.error(`Error al cargar 'ordena-historia' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}