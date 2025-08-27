export async function getFrases(nivel, curso, asignatura_id) {
  try {    
    let fileName;
    if (nivel === 'primaria') {
      if (asignatura_id && asignatura_id !== 'general') {
        fileName = `${asignatura_id}-ordena-frase.json`;
      } else {
        fileName = 'ordena-frase.json';
      }
    } else {
      fileName = `${asignatura_id}-ordena-frase.json`;
    }

    const response = await fetch(`/data/${nivel}/${curso}/${fileName}`);
    if (!response.ok) {      
      if (nivel === 'primaria' && fileName !== 'ordena-frase.json') {
        const fallbackResp = await fetch(`/data/${nivel}/${curso}/ordena-frase.json`);
        if (fallbackResp.ok) {
          return await fallbackResp.json();
        }
      }
      throw new Error(`Error HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al cargar 'ordena-frase' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}

export async function getHistorias(nivel, curso, asignatura_id) {
  try {
    let fileName;
    if (nivel === 'primaria') {
      if (asignatura_id && asignatura_id !== 'general') {
        fileName = `${asignatura_id}-ordena-historia.json`;
      } else {
        fileName = 'ordena-historia.json';
      }
    } else {
      fileName = `${asignatura_id}-ordena-historia.json`;
    }
    const response = await fetch(`/data/${nivel}/${curso}/${fileName}`);
    if (!response.ok) {
      if (nivel === 'primaria' && fileName !== 'ordena-historia.json') {
        const fallbackResp = await fetch(`/data/${nivel}/${curso}/ordena-historia.json`);
        if (fallbackResp.ok) {
          return await fallbackResp.json();
        }
      }
      throw new Error(`Error HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al cargar 'ordena-historia' para ${nivel}/${curso}/${asignatura_id}:`, error);
    return [];
  }
}