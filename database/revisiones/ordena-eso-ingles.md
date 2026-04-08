# Revisión: Ordena Frases · ESO · Inglés

Estado actual del slice (`level=eso`, `subject_id=ingles`):

| Curso | Frases |
|---|---|
| 1º ESO | 99 |
| 2º ESO | 97 |
| 3º + 4º ESO (compartido) | 97 |

**Total**: 293 frases.

## Diagnóstico

✅ **Sin bugs detectados.** La asignatura está excelentemente curada:

- Frases gramaticalmente correctas
- Sin caracteres españoles ni puntuación rara
- Sin duplicados internos
- Longitud adecuada (8-12 palabras de media)
- Progresión clara: A1 (1º) → A2 (2º) → B1/B2 (3º+4º)

## Decisión de diseño detectada

3º y 4º ESO comparten el mismo banco de 97 frases (`grades=[3,4]`). Es una decisión consciente del autor — no es un duplicado masivo. Pedagógicamente debatible (3º podría tener su propio nivel A2/B1 antes de pasar a B1/B2 en 4º), pero **no es un bug**. Lo dejo como observación.

## Conclusión

**Sin SQL necesario.** ESO Inglés (Ordena Frases) está limpia.
