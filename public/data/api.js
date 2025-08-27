// This file extends the original API helpers to support subject‑specific JSON
// files for primaria in addition to ESO. The previous implementation always
// fetched a generic file (e.g. `ordena-frase.json`) for primaria. To bring
// feature parity with the ESO level, we now attempt to load JSON files whose
// filename is prefixed with the subject identifier (e.g.
// `matematicas-ordena-frase.json`) when available. If no subject is provided
// or the file does not exist, we gracefully fall back to the original
// generic file. The behaviour for ESO remains unchanged.

export async function getFrases(nivel, curso, asignatura_id) {
  try {
    // Determine file name based on level and subject. For primaria we try a
    // subject‑specific file when a valid subjectId is provided; otherwise we
    // default to the generic "ordena‑frase.json". ESO always uses the
    // subjectId prefix.
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
      // If the subject‑specific file is missing we fall back to the generic
      // primaria file for backwards compatibility.
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