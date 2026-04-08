# Revisión: Primaria · Lengua

Estado actual del slice (`level=primaria`, `subject_id=lengua`, 812 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º | 135 | 109 | 26 | 0 |
| 2º | 130 | 75 | 54 | 1 |
| 3º | 130 | 76 | 52 | 2 |
| 4º | 130 | 75 | 52 | 3 |
| 5º | 148 | 50 | 93 | 5 |
| 6º | 139 | 32 | 96 | 11 |

**Distribución progresiva ejemplar**: dificultad creciente curso a curso, sin saltos bruscos. Ñ correcta en los 6 cursos.

**Diagnóstico**: la asignatura es **estructuralmente saludable** — sin placeholders masivos, sin mayúsculas truncadas, sin bug del generador. **Solo bugs leves**: 1 duplicado, ~30 definiciones que dan la respuesta o son autoreferenciales/circulares, y 1 anotación interna que se me había escapado en el grep global.

---

## 🔴 Bugs

### 1. Anotación interna del autor adicional (no detectada en grep global)

| id | curso | problema | corrección |
|---|---|---|---|
| **13312** | 5º | `yegua` Y def `'Hijo del hijo (empieza con y, trampa sonora). Busquemos: Yegua.'` — anotación filtrada + def absurda ("hijo del hijo" no es yegua) | reescribir def `'Hembra del caballo, animal usado en transporte y carrera.'` |

### 2. Duplicado

| id | curso | letra | solución |
|---|---|---|---|
| 13384, 13388 | 6º | M | métrica (2 defs distintas: ciencia / haiku) |

→ Mantener 13384 (ciencia de los versos) y reescribir 13388 a `solution='haiku'` letra H... pero ya hay otras palabras en M. Mejor: renombrar 13388 a `solution='moraleja'` con def adecuada para mantener la letra M.

### 3. Definiciones autoreferenciales o circulares (~12 más graves)

| id | curso | actual | propuesta |
|---|---|---|---|
| 12738 | 1º | `raqueta` def `'Deporte con raqueta.'` | `'Pala con cuerdas para jugar al tenis o al pádel.'` |
| 12821 | 2º | `hablar` def `'Hablar o conversar.'` | `'Verbo: comunicarse con palabras.'` |
| 12858 | 2º | `araña` def `'Animal con telaraña.'` | `'Arácnido de ocho patas que teje telas.'` |
| 12909 | 2º | `zapato` def `'Zapato o calzado.'` | `'Prenda que se pone en los pies.'` |
| 12938 | 3º | `explicar` def `'Acción de explicar.'` | `'Verbo: hacer entender algo a alguien.'` |
| 12943 | 3º | `final` def `'Final de una historia.'` | `'Última parte de una narración o cuento.'` |
| 12957 | 3º | `idioma` def `'Idioma o sistema de hablar.'` | `'Lengua propia de un pueblo o nación.'` |
| 12971 | 3º | `lista` def `'Lista de nombres o cosas.'` | `'Enumeración ordenada de elementos.'` |
| 12991 | 3º | `autor` def `'Persona que escribe el autor.'` | `'Persona que escribe una obra literaria.'` |
| 13002 | 3º | `pequeño` def `'Sinónimo de pequeño.'` | `'Adjetivo: de poco tamaño, opuesto a grande (contiene Q).'` |
| 13023 | 3º | `autor` def `'Escritura de autor.'` | `'Escritor de una obra (contiene U).'` |
| 13042 | 3º | `azul` def `'Color del cielo azul.'` | `'Color del cielo o del mar.'` |
| 13067 | 4º | `enlace` def `'Enlace de palabras o frases.'` | `'Palabra que une oraciones o partes de un texto (Conjunción).'` |
| 13072 | 4º | `felicidad` def `'Felicidad (sinónimo).'` | `'Estado de alegría y bienestar.'` |
| 13088 | 4º | `inicial` def `'Letra inicial.'` | `'Primera letra de una palabra o nombre.'` |
| 13103 | 4º | `letra` def `'Letra mayúscula.'` | `'Cada uno de los signos del alfabeto.'` |
| 13108 | 4º | `minúscula` def `'Letra minúscula.'` | `'Letra pequeña, opuesta a la mayúscula.'` |
| 13117 | 4º | `compañero` def `'Compañero escolar (contiene la Ñ).'` | `'Persona con la que se comparte clase o trabajo (contiene Ñ).'` |
| 13132 | 4º | `pequeño` def `'Dicho de algo pequeño (contiene la Q).'` | `'Adjetivo: de poco tamaño (contiene Q).'` |
| 13153 | 4º | `nudo` def `'Hacer un nudo (contiene la U).'` | `'Atadura que hace una cuerda al doblarse sobre sí misma (contiene U).'` |
| 13161 | 4º | `explicar` def `'Explicar algo.'` | `'Verbo: dar una razón o aclaración (contiene X).'` |
| 13172 | 4º | `azul` def `'Color azulado.'` | `'Color del cielo y del mar (contiene Z).'` |
| 13257 | 5º | `añadir` def `'Acción de añadir algo a otra cosa (contiene la Ñ).'` | `'Verbo: sumar o agregar algo más (contiene Ñ).'` |
| 13270 | 5º | `queja` def `'Dicho que expresa una queja.'` | `'Expresión de descontento o protesta (contiene Q).'` |
| 13396 | 6º | `compañero` def `'Compañero o amigo en tono coloquial (contiene Ñ).'` | `'Persona con quien se realiza una actividad común (contiene Ñ).'` |
| 13398 | 6º | `mañana` def `'Referente a la mañana o que sucede en ella (contiene Ñ).'` | `'Parte del día desde el amanecer hasta el mediodía (contiene Ñ).'` |
| 13432 | 6º | `urgente` def `'Texto breve que se escribe para avisar de algo urgente.'` | `'Adjetivo: que requiere atención inmediata.'` |

(Las anotaciones tipo `Buscamos: ...` ya están en `global-anotaciones.sql`.)

### 4. Definición que da respuesta a otra cosa

| id | curso | problema | corrección |
|---|---|---|---|
| 12777 | 1º | `rey` Y (correcto, contiene Y), def `'Monarca.'` | mantener |
| 13312 | 5º | ya cubierto arriba |

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1º | 0 | 1 |
| 2º | 0 | 3 |
| 3º | 0 | 8 |
| 4º | 0 | 11 |
| 5º | 0 | 3 (yegua, añadir, queja) |
| 6º | 1 (métrica dup) | 4 (compañero, mañana, urgente, métrica/moraleja) |

**Total**: 1 delete + 30 updates. Asignatura **estructuralmente sana**, los bugs son cosméticos (definiciones poco trabajadas).

---

SQL en [primaria-lengua.sql](primaria-lengua.sql).
