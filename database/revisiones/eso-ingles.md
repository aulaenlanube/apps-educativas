# Revisión: ESO · Inglés

Estado actual del slice (`level=eso`, `subject_id=ingles`):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 270 | 211 | 59 | 0 |
| 2º ESO | 270 | 197 | 73 | 0 |
| 3º ESO | 260 | 220 | 40 | 0 |
| 4º ESO | 260 | 197 | 59 | 4 |

**Diagnóstico general de la asignatura**: La escala 1/2/3 está infrautilizada — prácticamente todo el rosco vive en `1` con algo de `2`, y `3` es casi inexistente. Para una progresión real entre 1º y 4º ESO se debería usar el **MCER (A1/A2/B1/B2)** como criterio:

- **1º ESO** → A1 mayoritario, A2 puntual. `dif=1`: A1 frecuente · `dif=2`: A1 menos frecuente / A2 inicial · `dif=3`: A2+
- **2º ESO** → A1/A2 mayoritario.
- **3º ESO** → A2/B1.
- **4º ESO** → B1/B2.

A medida que avanza el curso, la palabra debería ser menos frecuente y más larga, no solo "más rara".

---

## 1º ESO (`grades=[1]`, 270 entradas)

### ✅ Resuelto: Letra **Ñ** eliminada del rosco de inglés

Decisión confirmada: en inglés no existe la letra Ñ, así que se **borra** la letra entera de la asignatura (1º y 2º ESO; 3º y 4º no la tenían). Verificación realizada en código:

- [src/hooks/useRoscoGame.js:83-99](src/hooks/useRoscoGame.js#L83-L99) — agrupa por las letras presentes en los datos (`Object.keys(grouped)`), no asume nº fijo.
- [src/apps/_shared/RoscoUI.jsx:375-433](src/apps/_shared/RoscoUI.jsx#L375-L433) — calcula las posiciones del rosco con `letters.length` dinámico.
- [src/services/gameDataService.js:60](src/services/gameDataService.js#L60) — la `maxQuestions` también se deriva del dataset.

**Por tanto no hace falta tocar código.** Al borrar las 20 filas Ñ de inglés ESO, el rosco se renderiza automáticamente con 26 letras. SQL aplica `DELETE`.

### 🔴 Bloqueante 2: `autumn` con definición invertida

[id 21366] dice `"Otoño (Am. English) en inglés."` → **incorrecto**: `autumn` es **British English**; el americano es `fall`. Hay que quitar el "(Am. English)".

### 🟠 Reclasificación de `difficulty`

Aplico el criterio MCER + frecuencia. Para 1º ESO: vocabulario A1 ultra-frecuente = `1`; A1 menos frecuente o A2 inicial = `2`; A2+ = `3`.

**Subir a `2` (eran `1`, son menos básicas que el resto del nivel 1):**

| id | palabra | motivo |
|---|---|---|
| 21516 | often | adverbio de frecuencia, A1 pero abstracto |
| 21513 | ocean | A2, menos común que `sea` |
| 21536 | quite | adverbio de matiz, A2 |
| 21533 | queue | léxico A2, ortografía atípica |
| 21462 | knee | parte del cuerpo menos básica, ortografía con K muda |
| 21461 | knife | ortografía con K muda |
| 21466 | keep | verbo polisémico, A2 |
| 21576 | uk → useful | reescrita: `uk` no es vocabulario, se sustituye por `useful` (A2) |
| 21570 | up | A1 puro pero la definición "Arriba" es ambigua sin contexto |
| 21573 | use | verbo común — déjalo en 1 (descartado) |
| 21587 | violet | léxico cromático secundario, A2 |
| 21577 | very | A1, mantener — descartado |

→ Mantengo solo: `often`, `ocean`, `quite`, `queue`, `knee`, `knife`, `keep`, `violet` ⇒ **subir a 2**.

**Bajar a `1` (eran `2`, son A1 puro):**

| id | palabra | motivo |
|---|---|---|
| 21370 | brother | A1, debería estar al nivel de `sister`/`mother` |
| 21372 | breakfast | A1 (rutinas) |
| 21375 | bedroom | A1 (casa) |
| 21380 | classroom | A1 (clase) |
| 21381 | computer | A1 |
| 21386 | clothes | A1 (ropa) |
| 21391 | december | A1 (meses) — coherencia con `april`, `may`, `june`, `july`, `march` que están en 1 |
| 21396 | dangerous | A2 — **mantener en 2** (descartado) |
| 21397 | elephant | A1 (animales) |
| 21404 | english | A1 |
| 21406 | evening | A1 (partes del día) |
| 21412 | february | A1 (meses) — coherencia |
| 21419 | grandfather | A1 (familia) |
| 21420 | grandmother | A1 (familia) |
| 21425 | glasses | A1 |
| 21426 | geography | A1 (asignaturas) |
| 21430 | homework | A1 |
| 21437 | ice cream | A1 |
| 21443 | interesting | A2 — **mantener en 2** (descartado) |
| 21444 | important | A2 — **mantener en 2** (descartado) |
| 21439 | internet | A1 |
| 21447 | january | A1 (meses) |
| 21459 | kitchen | A1 (casa) |
| 21464 | kangaroo | A2 — **mantener en 2** (descartado) |
| 21473 | library | A1 (lugares colegio) |
| 21496 | notebook | A1 (clase) |
| 21491 | november | A1 (meses) |
| 21509 | october | A1 (meses) |
| 21528 | question | A1 |
| 21530 | quarter | A2 — **mantener en 2** (descartado) |
| 21534 | quality | A2 — **mantener en 2** (descartado) |
| 21535 | quantity | A2 — **mantener en 2** (descartado) |
| 21552 | saturday | A1 (días) — coherencia con `monday`, `friday` que están en 1 |
| 21553 | september | A1 (meses) |
| 21561 | teacher | A1 (colegio) |
| 21562 | tuesday | A1 (días) |
| 21563 | thursday | A1 (días) |
| 21567 | umbrella | A2 — **mantener en 2** (descartado) |
| 21572 | uniform | A2 — **mantener en 2** (descartado) |
| 21574 | university | A2 — **mantener en 2** (descartado) |
| 21586 | vampire | léxico anecdótico, **mantener en 2** (descartado) |
| 21581 | vegetable | A1 (comida) |
| 21582 | village | A2 — **mantener en 2** (descartado) |
| 21584 | volleyball | A1 (deportes) |
| 21590 | wednesday | A1 (días) |
| 21605 | example | A2 — **mantener en 2** (descartado) |
| 21606 | exercise | A1 (rutinas) |
| 21612 | yesterday | A1 (tiempo) |

→ Bajar a 1 (lista final tras descartes): brother, breakfast, bedroom, classroom, computer, clothes, december, elephant, english, evening, february, grandfather, grandmother, glasses, geography, homework, ice cream, internet, january, kitchen, library, notebook, november, october, question, saturday, september, teacher, tuesday, thursday, vegetable, volleyball, wednesday, exercise, yesterday.

### 🟡 Definiciones a mejorar

| id | actual | propuesta | motivo |
|---|---|---|---|
| 21366 | `Otoño (Am. English) en inglés.` | `Otoño en inglés (palabra británica).` | corrige el error de variante |
| 21476 | `Reino Unido (siglas) en inglés.` | (eliminar pregunta) | `uk` no es vocabulario, son siglas; mejor sustituir por `umbrella` u otra |
| 21441 | `Dentro en inglés.` | `Preposición de lugar: dentro de.` | "in" suelto es ambiguo |
| 21570 | `Arriba en inglés.` | `Preposición/adverbio: hacia arriba.` | desambiguación |
| 21575 | `Nosotros (pronombre objeto) en inglés.` | OK — mantener |
| 21532 | `Concurso/Cuestionario en inglés.` | `Pequeño examen o concurso de preguntas.` | claridad |

### 🟢 Letra X y Z — coherencia OK

`type=contiene` aplicado correctamente en X y Z. Buenas elecciones (box, fox, six, taxi, next, text, relax, mix, example, exercise / size, lazy, crazy). No requiere cambios salvo dificultad.

### 🟢 Faltan dificultad `3`

En 1º ESO no es crítico tener `3`, pero conviene aportar 8-10 palabras A2+ para poder generar partidas más exigentes a estudiantes avanzados. Propuesta para añadir en una segunda iteración (no incluida en el SQL de esta tanda):

`adventure, beautiful, breakfast→difficult, dictionary, fantastic, holiday, neighbour, opposite, restaurant, vocabulary, weekend`

(Lo dejo como TODO, no se inserta en este SQL.)

---

---

## 2º ESO (`grades=[2]`, 270 entradas)

### ✅ Letra Ñ eliminada (mismas razones que 1º ESO, ids 21767-21776)

### 🟠 Reclasificaciones de `difficulty`

**Bajar `2 → 1`** (vocabulario A1 escolar de uso diario que en 2º ya debería ser fácil):

| id | palabra | motivo |
|---|---|---|
| 21639 | because | conector A1 ultra-frecuente |
| 21643 | biology | nombre de asignatura A1 |
| 21652 | chemistry | nombre de asignatura A1 |
| 21687 | geography | nombre de asignatura A1 |
| 21702 | history | nombre de asignatura A1 |
| 21705 | hospital | A1 (lugares ciudad) |
| 21734 | kitchen | A1 (casa) |
| 21743 | library | A1 (lugares colegio) |
| 21794 | picture | A1 |
| 21838 | umbrella | A1 (objetos) |
| 21848 | vegetable | A1 (comida) |
| 21851 | village | A1 (lugares) |
| 21854 | volleyball | A1 (deportes) |
| 21856 | vocabulary | A1 (clase) |
| 21865 | weather | A1 (tiempo) |
| 21880 | yesterday | A1 (tiempo) |
| 21882 | yoghurt | A1 (comida) |

**Subir `1 → 2`** (vocabulario que en 2º ESO debería ser claramente A2):

| id | palabra | motivo |
|---|---|---|
| 21640 | become | verbo abstracto A2 |
| 21644 | borrow | A2 (vs lend) |
| 21671 | engine | A2 |
| 21686 | forget | A2 |
| 21704 | hope | A2 (matiz) |
| 21725 | just | A2 (adverbio polisémico) |
| 21746 | luck | A2 |
| 21762 | news | A2 (sustantivo no contable, abstracto) |
| 21746 | luck | A2 |

**Falta dificultad 3** completa (0/270). Propongo subir a `3` los 6 elementos B1+ más claros del slice (alternativa a añadir nuevas):
- 21675 expensive → 3
- 21676 explain → 3 (verbo abstracto B1)
- 21761 neighbour → 3
- 21784 opposite → 3 (B1, abstracto)
- 21841 understand → 3
- 21846 unusual → 3

### 🟡 Definiciones a mejorar

| id | actual | propuesta |
|---|---|---|
| 21709 | `Si (condicional).` | `Conjunción condicional: si.` |
| 21737 | `Lago.` | OK (mantener) |

---

## 3º ESO (`grades=[3]`, 260 entradas)

### ✅ Sin letra Ñ — coherente con 1º y 2º (borradas allí)

3º ESO ya viene sin Ñ y así se queda: el rosco de inglés es de 26 letras en todos los cursos. No requiere cambios de código.

### 🟠 Reclasificación de `difficulty`

3º ESO está catastróficamente sesgado a `1`: **220 fáciles vs 40 medias y 0 difíciles** sobre 260. Para A2/B1 no es razonable.

**Bajar `2 → 1`** (vocabulario A1 puro, repaso):

| id | palabra |
|---|---|
| 21907 | breakfast |
| 21911 | brother |
| 21915 | building |
| 21918 | clothes |
| 21942 | elephant |
| 21945 | evening |
| 21989 | january |
| 22004 | kitchen |

**Subir `1 → 2`** (palabras claramente A2/B1 incorrectamente fáciles):

| id | palabra |
|---|---|
| 21902 | above |
| 21906 | allow |
| 21897 | awake |
| 22028 | narrow |
| 22078 | safe |
| 22108 | value |
| 22116 | vote |
| 22122 | warm |

**Subir `2 → 3`** (B1 sólido — para crear el bloque difícil que falta):

| id | palabra |
|---|---|
| 21927 | dangerous |
| 21976 | healthy |
| 21986 | invitation |
| 21992 | journey |
| 22017 | machine |
| 22023 | medicine |
| 22033 | neighbor |
| 22066 | quotation |
| 22073 | remember |
| 22074 | restaurant |
| 22094 | teenager |
| 22101 | understand |
| 22103 | university |
| 22110 | vehicle |

### 🟡 Definiciones a mejorar

| id | actual | propuesta |
|---|---|---|
| 21897 | `Contrario de 'dormido' (Awake).` | `Despierto (contrario de asleep).` (no des la respuesta entre paréntesis) |
| 21908 | `Contrario de feo (Beautiful).` | `Muy bonito o atractivo.` (idem) |
| 21910 | `Color de la sangre.` | `Líquido rojo que circula por el cuerpo.` (la actual está describiendo color, no la palabra) |
| 21979 | `Enfermo (Illness es enfermedad).` | `Adjetivo: enfermo (no se siente bien).` |
| 21949 | `Otoño (en inglés americano).` | OK — buena aclaración |

---

## 4º ESO (`grades=[4]`, 260 entradas)

### ✅ Sin letra Ñ — igual que el resto de cursos.

### 🔴 Distribución gravemente desviada

| dif | esperado B1/B2 | actual |
|---|---|---|
| 1 | ~30% | 197 (76%) |
| 2 | ~50% | 59 (23%) |
| 3 | ~20% | 4 (1.5%) |

Solo 4 palabras como `3` (`accommodation`, `advertisement`, `disappointed`, `unemployment`). Para B1/B2 esto invalida el nivel.

### 🟠 Reclasificación masiva (lista priorizada, no exhaustiva)

**Subir `2 → 3`** (B2 claro):

| id | palabra |
|---|---|
| 22168 | baggage |
| 22170 | behavior |
| 22180 | ceiling |
| 22181 | challenge |
| 22184 | cheerful |
| 22185 | childhood |
| 22192 | departure |
| 22193 | develop |
| 22196 | disease |
| 22199 | easygoing |
| 22204 | employee |
| 22216 | foreign |
| 22245 | interview |
| 22249 | jealous |
| 22250 | jewellery |
| 22270 | landscape |
| 22293 | neighbor |
| 22305 | opportunity |
| 22313 | performance |
| 22314 | perhaps |
| 22332 | realize |
| 22356 | temperature |
| 22368 | valuable |
| 22370 | variety |
| 22384 | warning |
| 22405 | yourself |

**Subir `1 → 2`** (B1 que está en fácil):

| id | palabra |
|---|---|
| 22161 | afford |
| 22177 | career |
| 22183 | cheat |
| 22186 | clever |
| 22190 | deal |
| 22191 | delay |
| 22200 | edge |
| 22202 | effort |
| 22214 | fee |
| 22220 | gather |
| 22225 | goal |
| 22226 | guess |
| 22227 | habit |
| 22236 | hire |
| 22240 | income |
| 22243 | injury |
| 22248 | jail |
| 22255 | judge |
| 22257 | keen |
| 22267 | label |
| 22268 | lack |
| 22269 | ladder |
| 22273 | lawyer |
| 22280 | manage |
| 22289 | nasty |
| 22294 | nephew |
| 22297 | obey |
| 22310 | patient |
| 22316 | polite |
| 22329 | reach |
| 22335 | recipe |
| 22336 | refuse |
| 22339 | salary |
| 22343 | scared |
| 22350 | task |
| 22362 | unfair |
| 22365 | unless |
| 22366 | upset |
| 22385 | waste |
| 22404 | youth |
| 22406 | yell |

### 🟡 Definiciones a mejorar

| id | actual | propuesta |
|---|---|---|
| 22168 | `Equipaje (sinónimo de luggage).` | `Equipaje (variante americana de luggage).` |
| 22293 | `Vecino.` | OK pero confirmar variante: `neighbor` (US) vs `neighbour` (UK) — coexisten ambas en el dataset (cf. 21761 neighbour, 22033 neighbor). Unificar criterio. |
| 22387 | `Radiografía.` | OK, pero `x-ray` con guion: confirmar que el motor del rosco lo acepta como letra X (`empieza`). |

### Inconsistencia transversal: variantes US vs UK

El dataset mezcla:
- `autumn` (UK, 1º) y `fall` (US, 3º) — bien distinguidos.
- `neighbour` (UK, 21761 en 2º) y `neighbor` (US, 22033 en 3º y 22293 en 4º) — sin criterio.
- `behavior` (US, 22170) sin contraparte `behaviour` (UK).
- `yoghurt` (UK, 21882, 22145) y `yogurt` (21613 en 1º) — mezcla.

**Recomendación**: definir un criterio único (probablemente UK por estándar curricular español) y normalizar. **No incluido en este SQL** — es una segunda pasada después de validar el formato.

---

## Resumen de cambios para 2º+3º+4º ESO

| sección | UPDATEs | DELETEs | INSERTs |
|---|---|---|---|
| 2º ESO Ñ rota | 10 | 0 | 0 |
| 2º ESO reclasificación | 32 | 0 | 0 |
| 3º ESO reclasificación | 30 | 0 | 0 |
| 3º ESO definiciones | 4 | 0 | 0 |
| 3º ESO Ñ ausente | 0 | 0 | 10 (opcional, comentado) |
| 4º ESO reclasificación | 67 | 0 | 0 |
| 4º ESO Ñ ausente | 0 | 0 | 10 (opcional, comentado) |

SQL actualizado en [eso-ingles.sql](eso-ingles.sql). Sigue envuelto en `BEGIN/ROLLBACK` — no se aplica nada hasta tu visto bueno.

---

## Cambios resumidos para 1º ESO inglés

- 1 corrección de definición (autumn).
- 8 reclasificaciones a `dif=2`.
- 35 reclasificaciones a `dif=1`.
- 10 reemplazos completos en letra Ñ (palabras españolas reales con ñ).
- 4 mejoras de redacción de definiciones.

SQL listo en [eso-ingles.sql](eso-ingles.sql). **No se aplica nada hasta tu visto bueno.**
