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

export async function getRosco(nivel, curso, asignatura_id) {
  try {
    // Si es primaria y no especificamos asignatura, buscamos por defecto lengua o el nombre que le demos
    // Para escalar, usaremos el patrón: asignatura-rosco.json
    // En tu caso actual: public/data/primaria/1/lengua-rosco.json
    
    const subjectPrefix = asignatura_id ? asignatura_id : 'lengua'; 
    const fileName = `${subjectPrefix}-rosco.json`;
    
    const response = await fetch(`/data/${nivel}/${curso}/${fileName}`);
    
    if (!response.ok) {
        // Fallback por si en primaria solo lo llamamos 'rosco.json' en el futuro
        if (nivel === 'primaria') {
             const fallbackResponse = await fetch(`/data/${nivel}/${curso}/rosco.json`);
             if (fallbackResponse.ok) return await fallbackResponse.json();
        }
        throw new Error(`Error HTTP! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`Error al cargar 'rosco' para ${nivel}/${curso}:`, error);
    return [];
  }
}

