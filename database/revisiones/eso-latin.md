# Revisión: ESO · Latín · 4º ESO

Estado actual del slice (`level=eso`, `subject_id=latin`, `grades=[4]`, 265 entradas):

| Dificultad | Cantidad |
|---|---|
| 1 (fácil) | 178 |
| 2 (medio) | 84 |
| 3 (difícil) | 3 |

26 letras (sin Ñ), 10-13 entradas por letra. Tipos: `empieza` mayoritariamente, `contiene` en K/Q/W/X/Y/Z. **No hay problema estructural de Ñ.**

**El problema serio en latín no es la dificultad — son los bugs de datos.** Detecto al menos 10 entradas rotas: definiciones que describen palabras distintas a la solución, soluciones duplicadas con definiciones incoherentes, anotaciones internas filtradas, y un patrón sistemático de "definición + (palabra latina entre paréntesis)" que **da la respuesta**.

---

## 🔴 Bugs críticos (datos rotos)

### 1. `id 31240` — solución y definición no tienen ninguna relación

```
solution: "homo sapiens"
definition: "General cartaginés que cruzó los Alpes."
```

La definición describe a **Aníbal**. La letra es H. Probablemente la entrada original era `hannibal` y se corrompió. **Propuesta**: `solution='hannibal'`, definición `'General cartaginés que cruzó los Alpes con elefantes.'`

### 2. `id 31422` — anotación interna del autor filtrada a producción

```
solution: "ayuda"
definition: "Planta (Hiedra - Hedera, o Hierba - Herba? Hierba contiene Y? No). Ayuda (Auxilium). A...uda."
```

Es un comentario de borrador olvidado. **Propuesta**: definición `'Asistencia o socorro a alguien (Auxilium).'`

### 3. Letra Q: **3 entradas con `solution='queso'` apuntando a otras palabras**

| id | solution | definition | qué describe en realidad |
|---|---|---|---|
| 31330 | queso | Cruce de cuatro caminos (Quadrivium). | quadrivium |
| 31333 | queso | Palabra común que empieza por Q. | (vacía / placeholder) |
| 31342 | queso | Antiguo (Anti...uo, contiene Q). | antiquo |

Tres preguntas con respuesta `queso` (palabra que ni siquiera es latín) y definiciones de 3 conceptos distintos. **Propuesta**:

- 31330 → `solution='quadrivium'`, def `'Cruce de cuatro caminos en una ciudad romana.'`, `type='empieza'`
- 31333 → `solution='quintus'`, def `'Quinto, nombre romano frecuente (también número 5).'`, `type='empieza'`
- 31342 → `solution='antiquo'`, def `'Antiguo en latín, raíz de la palabra anticuario.'`, `type='contiene'`

### 4. `id 31231` — solución genérica colisiona con otra entrada

```
solution: "Guerras"  (con mayúscula)
definition: "Conflictos entre Roma y Cartago (Guerras...)."
```

La definición describe las **Guerras Púnicas**, pero `solution='Guerras'` se solapa con `id 31232` (`guerra` con G). **Propuesta**: `solution='guerras púnicas'` o, si el rosco no admite multipalabra fiable, `solution='púnicas'` con letra `P` (cambiar de letra). Más limpio: `solution='galos'`, def `'Pueblo conquistado por César en la Galia.'` para evitar tocar la letra G dos veces con el mismo concepto.

### 5. `id 31177` — solución con mayúscula y definición que da la respuesta

```
solution: "Aurum"
definition: "Metal valioso (Aurum)."
```

**Propuesta**: `solution='aurum'` (minúscula), def `'Metal precioso amarillo, símbolo químico Au.'`

### 6. `id 31335` — mayúscula

```
solution: "Quattuor"
```

**Propuesta**: `solution='quattuor'`.

### 7. `id 31379` — definición incorrecta

```
solution: "umbral"
definition: "Sombra (Umbra)."
```

`umbra` significa sombra, pero `umbral` significa entrada/threshold. La etimología es errónea (umbral viene de `liminem`). **Propuesta**: cambiar la solución a `umbra` (también empieza por U) con def `'Sombra que proyecta un cuerpo opaco al sol.'` Mejor que arreglar `umbral`.

### 8. `id 31380` — definición incorrecta

```
solution: "urna"
definition: "Jarra de agua."
```

Una urna romana no es una jarra de agua, es una vasija para cenizas funerarias o votación. **Propuesta**: def `'Vasija romana usada para guardar cenizas o para votar.'`

### 9. `id 31381` — definición incorrecta

```
solution: "uxoricidio"
definition: "Esposa (Uxor)."
```

`uxoricidio` no significa esposa: significa **asesinato de la esposa**. Da la etimología pero confunde el significado. **Propuesta**: def `'Asesinato cometido contra la propia esposa (de Uxor: esposa).'`

### 10. `id 31273` — `type` incorrecto

```
solution: "koiné"
letter: "K"
type: "contiene"
```

`koiné` empieza por K, no la contiene en medio. **Propuesta**: `type='empieza'`.

### 11. Duplicado de letra J

`id 31262` y `id 31268` ambas tienen `solution='julio'` (mes y César). El rosco puede caer dos veces sobre la misma respuesta en la misma letra. **Propuesta**: cambiar 31268 a `solution='julio césar'` o, mejor, `solution='juliano'`, def `'Calendario romano implantado por César.'`

---

## 🟡 Patrón sistemático: definiciones que dan la respuesta

Más de **40 entradas** siguen el patrón `Significado en español (PALABRA_LATINA)`, donde la palabra latina entre paréntesis **es la respuesta**:

```
solution: "bélico"     definition: "Guerra (Bellum)."
solution: "filial"     definition: "Hijo (Filius)."
solution: "mortal"     definition: "Muerte (Mors)."
solution: "cívico"     definition: "Ciudadano (Civis)."
solution: "ocular"     definition: "Ojo (Oculus)."
solution: "nominal"    definition: "Nombre (Nomen)."
solution: "nocturno"   definition: "Noche (Nox)."
solution: "silvestre"  definition: "Bosque (Silva)."
solution: "ubicación"  definition: "Donde (Ubi)."
solution: "universo"   definition: "Todo (Universus)."
solution: "habere"     definition: "Verbo: Tener."     (no da respuesta pero es directa)
solution: "heri"       definition: "Ayer (Heri)."     (da literalmente la respuesta)
... y unas 30 más
```

Este patrón **rompe el rosco porque la respuesta está en la pregunta**. Pedagógicamente puede tener sentido (mostrar etimología), pero como pregunta de adivinanza no funciona.

**Decisión necesaria**: ¿Cómo lo abordamos?

- **(a)** Reescribir todas las definiciones quitando el paréntesis con la palabra latina. Mucho trabajo (~40 entradas), tarea de revisión específica.
- **(b)** Aceptarlo como diseño y dejarlo: en latín, mostrar la etimología entre paréntesis es habitual. Si el alumno ve "Guerra (Bellum)" sabe que la respuesta es algo derivado de Bellum (`bélico`), no `bellum` directamente. El problema es que en `id 31249 heri` y `id 31252 idus` la palabra latina entre paréntesis **sí es la respuesta**, no la etimología.
- **(c)** Solución intermedia: arreglar solo las entradas donde la palabra latina entre paréntesis **es la solución exacta** (no la etimología). Eso reduce el alcance a ~10 entradas.

**Recomendación**: opción **(c)** ahora. SQL incluye solo esas correcciones. La revisión masiva de etimologías queda como TODO.

Entradas afectadas por (c) — la palabra entre paréntesis ES la solución:

| id | solution | definition actual | propuesta |
|---|---|---|---|
| 31249 | heri | Ayer (Heri). | Adverbio latino: el día anterior a hoy. |
| 31252 | idus | Días del mes (Idus de marzo). | Día central del mes en el calendario romano (15 en marzo). |
| 31246 | habere | Verbo: Tener. | (mantener — la respuesta no está en la definición) |
| 31338 | querella | Queja o reclamación (Querella). | Queja formal o reclamación judicial. |
| 31270 | kalendas | Primer día de cada mes en el calendario romano. | (mantener — está bien) |

---

## 🟠 Reclasificación de `difficulty`

### Dificultad `3` actual: solo 3 entradas, 2 son bugs

| id | actual | situación |
|---|---|---|
| 31240 | homo sapiens | bug crítico (ver §1) — tras el fix queda en `2` |
| 31248 | horticultura | OK como difícil |
| 31315 | omnipresente | OK como difícil |

Tras arreglar el bug, queda un curso de 4º ESO con **2 difíciles sobre 265**. Insuficiente.

### Subir `2 → 3` (vocabulario clásico realmente complejo):

| id | palabra | motivo |
|---|---|---|
| 31201 | declinación | concepto gramatical avanzado |
| 31302 | nominativo | concepto gramatical avanzado |
| 31309 | nominal | concepto gramatical |
| 31230 | genitivo | concepto gramatical |
| 31307 | necrópolis | léxico especializado |
| 31308 | nihilismo | abstracto |
| 31317 | oratoria | concepto retórico |
| 31337 | quirites | léxico histórico especializado |
| 31352 | retórica | concepto cultural |
| 31382 | universo | abstracto |

### Subir `1 → 2` (palabras con cierta dificultad histórica/léxica):

31244 (hostis), 31255 (ius), 31257 (ibi), 31258 (insula), 31259 (in), 31329 (pan → no, A1), 31358 (salve), 31388 (verbo), 31391 (verdad), 31373 (urbe), 31378 (urania), 31375 (ulises), 31413 (yugo)

(Filtro: dejo solo los menos transparentes para un alumno hispanohablante.)

→ Final: 31244, 31255, 31258, 31373, 31378, 31413.

### Bajar `2 → 1` (latín cotidiano fácil de deducir):

31168 (acueducto), 31188 (coliseo), 31180 (basílica), 31184 (biblioteca), 31189 (calzada), 31197 (capitolio), 31228 (gladiador), 31219 (familia), 31220 (fortuna), 31250 (imperio), 31260 (júpiter), 31290 (marte ya está en 1), 31291 (mercurio), 31292 (mosaico), 31300 (neptuno), 31322 (panteón), 31323 (pompeya), 31346 (república), 31354 (saturno), 31371 (taberna), 31368 (troyano), 31385 (vulcano)

---

## Resumen de cambios

| Categoría | Cantidad |
|---|---|
| Bugs críticos arreglados | 11 |
| Definiciones corregidas (etimología confusa) | 3 |
| Subir 2 → 3 | 10 |
| Subir 1 → 2 | 6 |
| Bajar 2 → 1 | 21 |

**Total**: ~50 cambios sobre 265 preguntas (~19% del slice).

## TODO (no incluido en SQL)

- Revisión sistemática del patrón "definición (palabra latina)" en ~30 entradas adicionales para decidir caso por caso si la palabra latina entre paréntesis es etimología (mantener) o respuesta (reescribir).
- 4º ESO de Latín se beneficiaría de **vocabulario propiamente clásico** (más palabras latinas como solución directa, menos derivados castellanos): `magister, discipulus, schola, calidus, frigidus, niger, albus, parvus, magnus, multus, paucus, ire, venire, ducere, mittere, capere, scribere, legere, audire, dicere…`. Sería una segunda fase de creación.

---

SQL en [eso-latin.sql](eso-latin.sql). **No se aplica nada hasta tu visto bueno.**
