# Revisión: ESO · Lengua

Estado actual del slice (`level=eso`, `subject_id=lengua`, 1.097 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 273 | 135 | 128 | 10 |
| 2º ESO | 280 | 123 | 143 | 14 |
| 3º ESO | 273 | 139 | 125 | 9 |
| 4º ESO | 271 | 128 | 130 | 13 |

**Buena noticia**: distribución de dificultad **mucho mejor** que cualquier asignatura revisada hasta ahora (~50/45/5%). Letra Ñ correctamente poblada en los 4 cursos. Definiciones contextualizadas (especialmente en 3º y 4º, con referencias al canon literario español por épocas).

**Diagnóstico general**: la asignatura está bien diseñada en cuanto a progresión (1º conceptos básicos, 2º morfosintaxis, 3º Edad Media-Siglos de Oro, 4º Realismo-Vanguardias-Generación del 27). El problema **no es la dificultad**, son los **bugs de datos**: triplicados, soluciones que no corresponden a la definición, anotaciones internas filtradas y dos errores conceptuales graves.

---

## 1º ESO

### 🔴 Bugs

| id | problema | corrección |
|---|---|---|
| 22447 | `solution='común'` con def `'Conjunto de palabras con la misma raíz (Campo...).'` — la definición describe **familia léxica** o **campo semántico**, no `común`. Además duplica solución con id 22448. | `solution='campo lexico'`, def `'Conjunto de palabras con la misma raíz.'`, `letter='C'` → conflicto C. Mejor: `solution='copla'`, def `'Estrofa popular española de cuatro versos.'` |
| 22664 | `solution='examen'` X con def `'Morfema delante de la raíz (contiene X).'` — describe **prefijo**, no `examen`. Duplica solución con 22669. | `solution='prefijo'` no entra en X. Cambiar a: `solution='léxico'`... pero ya existe. Reescribir como: `solution='axioma'`, def `'Verdad evidente que no necesita demostración (contiene X).'` |
| 22433 | `ballade` (palabra francesa) | `balada` (forma española) |
| 22446 | `campo semantico` sin tilde | `campo semántico` |
| 22499 | `hiperónimo` def `'(ej: flor de rosa)'` ambiguo | `'(ej: flor es hiperónimo de rosa)'` |
| 22498 | `hipónimo` def `'(ej: rosa de flor)'` ambiguo | `'(ej: rosa es hipónimo de flor)'` |

### 🟠 Reclasificaciones

**Bajar `3 → 2`**:
- 22431 bibliografía (concepto básico A2)
- 22439 comunicación (concepto básico)
- 22452 determinante (concepto gramatical básico)
- 22501 interrogación (signo ortográfico — coherencia con `exclamación` que está en 2)
- 22505 introducción (parte del texto, concepto básico)
- 22586 protagonista (concepto básico, ya aparece en Primaria)

**Mantener en 3**: interjección (22507), sobreesdrújula (22614), extranjerismo (22666), `campo semantico` (22446 — tras corregir tilde).

---

## 2º ESO

### 🔴 Bugs críticos

| id | problema | corrección |
|---|---|---|
| **22695, 22696, 22697** | **TRIPLICADO**: tres entradas en letra A con `solution='arte mayor'`, definiciones casi idénticas. | Eliminar dos (22696, 22697), dejar 22695 con def consolidada. |
| **22853** | `oxítona` def `'Palabra con acento en la sílaba anterior a la antepenúltima (Sujétamelo).'` — **CONCEPTO INCORRECTO**. Oxítona = aguda (acento en última). La definición describe **sobresdrújula**. | `'Palabra con acento en la última sílaba (sinónimo de aguda).'` |
| **22877** | `enfoque` def `'Antónimo de riqueza (contiene Q).'` — `enfoque` no es antónimo de riqueza (eso sería `pobreza`). | `'Punto de vista o forma de abordar un tema (contiene Q).'` |
| **22876** | `flaqueza` def `'Sinónimo de flaqueza (Fla..., contiene Q).'` — definición circular (sinónimo de sí misma). | `'Debilidad física o moral (contiene Q).'` |
| **22840** | Ñ `enseñar` def `'Sinónimo de enseñar (contiene Ñ).'` — circular. | `'Verbo: instruir o transmitir conocimientos (contiene Ñ).'` |
| **22945** | `examen` X duplica con 22949. Def `'Morfema delante (Pre..., contiene X).'` describe **prefijo**. | Reescribir como: `solution='axioma'`, def `'Verdad evidente sin necesidad de demostración (contiene X).'` |
| 22815 | `literaria` def `'Figura retórica (metonimia, etc) o Licencia...'` — frase incompleta | `'Adjetivo: relativo a la literatura.'` |
| 22754 | `femenino` def `'Gènere gramatical (Masculino/...).'` — "Gènere" en catalán, debe ser "Género" | `'Género gramatical opuesto al masculino.'` |
| 22719 | `comedia` def `'Gènere teatral divertido.'` — "Gènere" catalán | `'Género teatral con final feliz y tono humorístico.'` |
| 22765 | `género` duplica con 22755 (mismo solution, distintas definiciones) | Eliminar 22765, mantener 22755 (concepto literario) |
| 22748 | `familia lexica` sin tilde | `familia léxica` |

### 🟠 Reclasificaciones

**Bajar `3 → 2`**: 22709 (bibliografía), 22725 (determinante), 22781 (interrogación), 22785 (instrucciones), 22865 (personificación), 22866 (protagonista).

**Mantener en 3**: 22748 (familia léxica), 22862 (parasíntesis), 22884 (romanticismo), 22782 (interjección), 22784 (intransitivo).

---

## 3º ESO

Excelente calidad. Pocas erratas.

### 🔴 Bugs

| id | problema | corrección |
|---|---|---|
| 22976 | `solution='Auto'` con mayúscula. Duplica con 22977. | Eliminar 22976, mantener 22977. |
| 23000 | `solution='Carpe'` con mayúscula. Duplica con 23001. | Eliminar 23000, mantener 23001. |

### 🟠 Reclasificaciones

**Bajar `3 → 2`**: 22985 (bibliografía), 23004 (determinante), 23056 (interrogación), 23060 (introducción).

**Mantener en 3**: 23015 (endecasílabo), 23024 (fuenteovejuna), 23105 (neoclasicismo), 23153 (renacimiento).

---

## 4º ESO

Calidad excelente, integración del canon literario muy buena. Solo 2 bugs.

### 🔴 Bugs críticos

| id | problema | corrección |
|---|---|---|
| **23420** | Q `franquismo` def: `'Poeta del 27 (Lor...a, contiene Q? No, C). Contexto histórico (Fran...ismo, contiene Q).'` — **anotación interna del autor filtrada a producción** (igual que en Latín id 31422). | `'Régimen político español (1939-1975) que afectó profundamente a la literatura (contiene Q).'` |
| **23337** | J `solution='juegos olimpicos'` con def `'Literatura destinada a los jóvenes (... y juvenil).'` — la definición describe **literatura juvenil**, no juegos olímpicos. Sin tilde además. | `solution='juvenil'`, def `'Literatura destinada a los jóvenes lectores.'` Y bajar dificultad de 3 a 2. |

### 🟠 Reclasificaciones

**Bajar `3 → 2`**: 23326 (interrogación), 23331 (introducción), 23332 (interjección — concepto ya estudiado en cursos anteriores), 23337 (juvenil tras fix).

**Mantener en 3**: 23292 (encabalgamiento), 23378 (novecentismo), 23424 (romanticismo), 23464 (valle-inclán), 23489 (existencialismo), 23490 (extranjerismo), 23497 (yuxtaposición), 23245 (argumentativo), 23349 (frankenstein).

---

## Resumen de cambios

| Curso | Bugs | Reclasificaciones | Definiciones |
|---|---|---|---|
| 1º | 6 | 6 | 2 |
| 2º | 13 (incl. triplicado y concepto erróneo) | 6 | 4 |
| 3º | 2 (duplicados de mayúscula) | 4 | 0 |
| 4º | 2 (anotación filtrada + bug de juegos olímpicos) | 4 | 0 |

**Total**: ~50 cambios sobre 1.097 entradas (~4,5%). Asignatura **mucho más sana** que las idiomas o latín.

## Hallazgos transversales

1. **Patrón repetitivo "examen X bug"**: en 1º y 2º ESO hay una entrada con `solution='examen'` y definición que describe `prefijo`. Probablemente un copy-paste defectuoso al generar la letra X. Lo arreglo en ambos cursos.

2. **Anotación filtrada (4º ESO id 23420)**: idéntico patrón al detectado en Latín (id 31422). Sugiere que el generador original dejó comentarios de borrador en producción en al menos 2 asignaturas. Recomendación: hacer un grep general en producción de patrones como `'? No)'`, `'¿No?'`, `'(comentario'` etc. en `definition` para detectar más casos. Lo añado al TODO global.

3. **Concepto erróneo grave (2º ESO id 22853 oxítona)**: el único error conceptual de toda la asignatura, pero crítico. Una definición que enseña algo falso a los alumnos.

---

SQL en [eso-lengua.sql](eso-lengua.sql). **No se aplica nada hasta tu visto bueno.**
