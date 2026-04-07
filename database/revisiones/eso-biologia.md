# Revisión: ESO · Biología

Estado actual del slice (`level=eso`, `subject_id=biologia`, 1.099 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 270 | 113 | 142 | 15 |
| 2º ESO | 286 | 139 | 135 | 12 |
| 3º ESO | 270 | 100 | 155 | 15 |
| 4º ESO | 273 | 101 | 153 | 19 |

Distribución razonable, Ñ correcta. Definiciones de calidad media-alta, especialmente en 3º y 4º.

**Diagnóstico**: la asignatura tiene **bugs sistémicos en la letra K** muy similares a los detectados en Matemáticas: múltiples entradas con `solution='kilo'` cuando la definición describe una palabra distinta (rótula, esqueleto, queratina, plancton, krill…). El generador automático puso `kilo` como placeholder cuando no encontró la palabra real con K. **2º y 3º ESO están afectados gravemente**, 1º y 4º limpios. Además hay duplicados puntuales y soluciones truncadas con mayúscula en 3º/4º.

---

## 🔴 BUGS CRÍTICOS SISTÉMICOS

### Letra K en 2º y 3º ESO: 12 entradas `kilo` con definiciones desalineadas

Las definiciones describen palabras correctas distintas, pero `solution='kilo'` repetido. Estrategia:

- **Renombrar** las que tienen una palabra real con K: krill, keratina, k, eucariota.
- **Borrar** las que describen palabras sin K (rótula, esqueleto, epidermis, procariota, analgésico).

| id | curso | def actual | acción |
|---|---|---|---|
| 16173 | 2º | Microorganismos del plancton | renombrar a `krill` |
| 16176 | 2º | Fragmento de roca en un volcán | borrar (bomba/bloque no contienen K) |
| 16177 | 2º | Hueso de la rodilla | **ya cubierto en global-anotaciones.sql** |
| 16178 | 2º | Conjunto de huesos | borrar (esqueleto no tiene K) |
| 16179 | 2º | Capa externa de la piel | borrar (epidermis no tiene K) |
| 16445 | 3º | Célula con núcleo definido | renombrar a `eucariota` |
| 16446 | 3º | Célula sin núcleo definido | borrar (procariota no tiene K) |
| 16449 | 3º | Proteína del pelo y uñas | renombrar a `keratina` |
| 16450 | 3º | Capa externa de la piel | borrar |
| 16451 | 3º | Medicamento del dolor | borrar |
| 16453 | 3º | Microorganismo plancton | borrar (duplicaría `krill` con 16175 ya existente) |
| 16454 | 3º | Estructura ósea | borrar |

### Otros placeholders rotos en 3º ESO

| id | letra | problema |
|---|---|---|
| 16490 | Ñ | def `'Palabra común que contiene la letra Ñ.'` placeholder |
| 16492 | Ñ | mismo placeholder |
| 16493 | Ñ | mismo placeholder |
| 16576 | W | `web` def `'Palabra común que empieza por W.'` placeholder (duplica con 16582) |
| 16583 | W | `kiwi` def `'Palabra común que contiene la letra W.'` placeholder |
| 16614 | Z | `zona` def `'Palabra común que empieza por Z.'` placeholder (duplica con 16606) |

Borrar duplicados, reescribir el resto.

---

## 1º ESO

Limpio. Solo:

| id | problema | corrección |
|---|---|---|
| 15886 | `juntura` def `'Articulación entre huesos (sinónimo de juntura).'` — definición circular | reescribir def `'Punto de unión o articulación entre dos huesos.'` |

---

## 2º ESO

Además del bloque K sistémico (arriba):

| id | problema | corrección |
|---|---|---|
| **16161** | `juegos olimpicos` J def `'Hueso de la cara (contiene J, arriba de la mandíbula).'` — describe **maxilar** o **mejilla**. Bug grave. | renombrar a `solution='mejilla'` def `'Parte carnosa de la cara entre el ojo y la mandíbula (contiene J).'` |
| **16156** | `caja` J def `'Unión entre huesos (contiene J).'` — describe articulación, no caja | reescribir def `'Recipiente cuadrado o rectangular (contiene J).'` |
| **16164** | `pájaro` J def `'Cría de ave (contiene J).'` — describe pollito, no pájaro. Duplica con 16165 | borrar 16164 |
| 16252 | `queso` Q def `'Duna de arena en media luna (contiene Q).'` — describe **barján** | reescribir def `'Producto lácteo elaborado a partir de leche cuajada (contiene Q).'` |
| 16119, 16120 | dos `fuente` F | borrar 16120 |
| 16171, 16180 | dos `eukarya` K | borrar 16171 |
| 16205 | `nucli` N — errata, debería ser `núcleo`. Duplica con 16206. | borrar 16205 |
| 16193 | `mèdula` con grave — errata | corregir a `médula` |
| 16095, 16382 | `dioxido de carbono` sin tilde | corregir a `dióxido de carbono` |
| 16209 | `nivel freatico` sin tilde | corregir a `nivel freático` |
| 16154 | `jugos gastricos` sin tilde | corregir a `jugos gástricos` |
| 16313 | `yellowstone` (raro pero válido contiene W) | mantener |

---

## 3º ESO

Además del bloque K sistémico:

| id | problema | corrección |
|---|---|---|
| **16442** | `juegos olimpicos` J def `'Capa grasa bajo la piel (tejido...).'` — describe **adiposo**. Bug. | borrar (no encaja en J) |
| 16554 | `Trompas` mayúscula T | minúscula `trompas` |

---

## 4º ESO

Solo soluciones con mayúscula que duplican entradas existentes en minúscula:

| id | problema | corrección |
|---|---|---|
| **16648** | `Deriva` mayúscula D | minúscula `deriva` |
| **16747** | `Nicho` mayúscula N — duplica con 16748 `nicho` | borrar 16747 |
| **16749** | `Nivel` mayúscula N — duplica con 16750 `nivel` | borrar 16749 |
| **16778** | `Placa` mayúscula P — duplica con 16779 `placa` | borrar 16778 |

---

## Resumen de cambios

| Curso | Bugs (delete) | Bugs (update) |
|---|---|---|
| 1º | 0 | 1 |
| 2º | 8 (4 K rotas + nucli + fuente + eukarya + pájaro) | 9 (mejilla, caja, queso, médula, 4 tildes, yellowstone) |
| 3º | 9 (5 K rotas + 2 Ñ placeholder + web placeholder + zona placeholder + juegos olimpicos) | 4 (krill, eucariota, keratina, kiwi web, trompas, dióxido carbono) |
| 4º | 3 (Nicho, Nivel, Placa duplicados) | 1 (Deriva → deriva) |

**Total**: ~35 cambios sobre 1.099 entradas (~3,2%).

---

## Hallazgo crítico transversal

**La letra K en STEM (Matemáticas, Biología, Física, Tecnología) es un bug sistémico común**. El generador automático no encontraba palabras científicas en español con K, así que usó `kilo` como placeholder repetido. Recomiendo en una segunda fase:

```sql
SELECT id, subject_id, level, grades, definition FROM rosco_questions
WHERE solution = 'kilo' AND definition NOT LIKE '%mil%' AND definition NOT LIKE '%Mil%';
```

Para detectar en otras asignaturas STEM las que aún quedan rotas. Lo añado al TODO global.

---

SQL en [eso-biologia.sql](eso-biologia.sql). **No se aplica nada hasta tu visto bueno.**
