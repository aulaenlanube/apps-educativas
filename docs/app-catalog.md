# App Catalog - Mapa completo de aplicaciones educativas

> Fichero vivo de referencia. Documenta la estructura, distribucion y naturaleza
> de cada app de la plataforma. Usalo para tomar decisiones sobre puntuaciones,
> rankings, valoraciones e insignias.

---

## Conceptos clave

| Concepto | Descripcion |
|----------|-------------|
| **app_id** | Identificador unico de la app en la URL y en `game_sessions` |
| **Parametrizada** | Mismo componente; el contenido cambia segun `level/grade/subjectId` |
| **Por curso** | Componente diferente para cada curso (ej: SumasPrimaria1 vs SumasPrimaria6) |
| **score_key** | Clave para agrupar puntuaciones. Apps parametrizadas: `app_id + level + grade + subjectId`. Apps unicas/por-curso: solo `app_id` |

---

## 1. Apps universales (parametrizadas)

Aparecen en **TODAS** las asignaturas de **TODOS** los cursos (Primaria 1-6, ESO 1-4, Bachillerato 1-2).
Mismo componente, contenido generado a partir de los datos de la asignatura/curso.

> **Ranking**: la puntuacion es por combinacion `(app_id, level, grade, subjectId)`.
> **Valoracion**: una unica valoracion por `app_id` (es la misma app).

| app_id | Nombre | Componente |
|--------|--------|------------|
| busca-el-intruso | Busca el Intruso | BuscaElIntruso |
| runner | Education Dash | Runner |
| excavacion-selectiva | Excavacion Selectiva | ExcavacionSelectiva |
| rosco-del-saber | El Rosco del Saber | RoscoJuego |
| ahorcado | Ahorcado | Ahorcado |
| crucigrama | Crucigrama | Crucigrama |
| sopa-de-letras | Sopa de Letras | SopaDeLetras |
| millonario | Millonario | Millonario |
| anagramas | Anagramas | Anagramas |
| criptograma | Criptograma | Criptograma |
| velocidad-respuesta | Velocidad | VelocidadRespuesta |
| conecta-parejas | Conecta Parejas | ConectaParejas |
| dictado-interactivo | Dictado | DictadoInteractivo |
| torre-palabras | Torre de Palabras | TorrePalabras |
| ordena-la-frase | Ordena la Frase | OrdenaLaFraseJuego |
| ordena-la-historia | Ordena la Historia | OrdenaLaHistoriaJuego |
| parejas | Parejas de Cartas | ParejasDeCartas |
| lluvia-de-palabras | Lluvia de Palabras | LluviaDePalabras |
| clasificador | Clasificador | Clasificador |
| snake | Snake | SnakePalabras |
| comprension-escrita | Comprension Escrita | ComprensionEscrita |
| comprension-oral | Comprension Oral | ComprensionOral |

---

## 2. Apps de idiomas (parametrizadas, solo asignaturas de lengua)

Asignaturas: `lengua`, `ingles`, `valenciano`, `frances`.
Todos los niveles donde existan esas asignaturas.

| app_id | Nombre | Componente |
|--------|--------|------------|
| detective-de-palabras | Detective de Palabras | DetectiveDePalabras |

---

## 3. Apps casi-universales (parametrizadas, desde cierto curso)

| app_id | Nombre | Desde | Asignaturas |
|--------|--------|-------|-------------|
| juego-memoria | Juego de Memoria | Primaria 4 | Todas |

---

## 4. Apps de matematicas (parametrizadas, solo `matematicas`)

| app_id | Nombre | Niveles | Notas |
|--------|--------|---------|-------|
| ordena-bolas | Ordena las Bolas | P1-6, ESO 1-4, Bach 1-2 | Fisica (matter-js) |
| visualizador-3d | Lab Figuras 3D | ESO 1-4, Bach 1-2 | Three.js |
| rotaciones-grid | Giros y Rotaciones | P4-6 | |
| laboratorio-funciones-2d | Lab Funciones 2D | ESO 1-4, Bach 1-2 | Recharts |
| fracciones-eso | Fracciones PRO | ESO 1, Bach 1 | |

---

## 5. Apps de ciencias (parametrizadas)

| app_id | Nombre | Niveles | Asignaturas |
|--------|--------|---------|-------------|
| sistema-solar | Sistema Solar 3D | P1-6 (cn), ESO 1-4 (bio), Bach 1-2 (bio) | ciencias-naturales, biologia |
| celula-animal | La Celula Animal | ESO 1-4, Bach 1-2 | biologia |
| celula-vegetal | La Celula Vegetal | ESO 1-4, Bach 1-2 | biologia |
| mesa-crafteo | Mesa de Crafteo | ESO 1-4 (fis+qui), Bach 1 (fis), Bach 2 (fis+qui) | fisica, quimica |
| entrenador-tabla | Entrenador Tabla Periodica | ESO 1-4 (fis+qui), Bach 1 (fis), Bach 2 (fis+qui) | fisica, quimica |

---

## 6. Apps de tutoria (parametrizadas, solo `tutoria`)

| app_id | Nombre | Niveles |
|--------|--------|---------|
| isla-de-la-calma | Isla de la Calma | P1-6, ESO 1-4, Bach 1-2 |
| generador-personajes-historicos | Generador de Personajes | P1-6, ESO 1-4, Bach 1-2 |
| banco-recursos-tutoria | Banco de Recursos | P1-6, ESO 1-4, Bach 1-2 |

---

## 7. Apps de programacion (parametrizadas, solo `programacion`)

| app_id | Nombre | Niveles |
|--------|--------|---------|
| terminal-retro | Terminal de Hackeo | ESO 1-4, Bach 1-2 |
| programacion-bloques-windows | Programacion Visual 3.1 | ESO 1-4, Bach 1-2 |

---

## 8. Apps de matematicas por curso (componente diferente por curso)

Cada fila es un **componente distinto** con contenido fijo.

> **Ranking**: la puntuacion es solo por `app_id` (ya es unico por curso).
> **Valoracion**: una valoracion por familia (ej: todas las "sumas" valoran la misma app).

### Sumas (solo `matematicas`)
| app_id | Curso | Componente | Descripcion |
|--------|-------|------------|-------------|
| sumas-primaria-1 | P1 | SumasPrimaria1 | Sin llevadas |
| sumas-primaria-2-drag | P2 | SumasPrimaria2 | Con llevadas |
| sumas-primaria-3-drag | P3 | SumasPrimaria3 | 3-4 cifras |
| sumas-primaria-4-drag | P4 | SumasPrimaria4 | Triples |
| sumas-primaria-5-drag | P5 | SumasPrimaria5 | Decimales |
| sumas-primaria-6-drag | P6 | SumasPrimaria6 | Triples+decimales |

### Restas (solo `matematicas`)
| app_id | Curso | Componente | Descripcion |
|--------|-------|------------|-------------|
| restas-primaria-1 | P1 | RestasPrimaria1 | Sin llevadas |
| restas-primaria-2 | P2 | RestasPrimaria2 | Con llevadas |
| restas-primaria-3 | P3 | RestasPrimaria3 | 3-4 cifras |
| restas-primaria-4 | P4 | RestasPrimaria4 | Intro decimales |
| restas-primaria-5 | P5 | RestasPrimaria5 | Decimales complejos |
| restas-primaria-6 | P6 | RestasPrimaria6 | Completar |

### Multiplicaciones (solo `matematicas`)
| app_id | Curso | Componente |
|--------|-------|------------|
| multiplicaciones-primaria-3 | P3 | MultiplicacionesPrimaria3 |
| multiplicaciones-primaria-4 | P4 | MultiplicacionesPrimaria4 |
| multiplicaciones-primaria-5 | P5 | MultiplicacionesPrimaria5 |
| multiplicaciones-primaria-6 | P6 | MultiplicacionesPrimaria6 |

### Divisiones (solo `matematicas`)
| app_id | Curso | Componente |
|--------|-------|------------|
| divisiones-primaria-4 | P4 | DivisionesPrimaria4 |
| divisiones-primaria-5 | P5 | DivisionesPrimaria5 |
| divisiones-primaria-6 | P6 | DivisionesPrimaria6 |

### Supermercado Matematico (solo `matematicas`)
| app_id | Curso | Componente |
|--------|-------|------------|
| supermercado-matematico-1 | P1 | SupermercadoMatematico1 |
| supermercado-matematico-2 | P2 | SupermercadoMatematico2 |
| supermercado-matematico-3 | P3 | SupermercadoMatematico3 |
| supermercado-matematico-4 | P4 | SupermercadoMatematico4 |
| supermercado-matematico-5 | P5 | SupermercadoMatematico5 |
| supermercado-matematico-6 | P6 | SupermercadoMatematico6 |

### Numeros Romanos (solo `matematicas`)
| app_id | Curso | Componente |
|--------|-------|------------|
| numeros-romanos-3 | P3 | NumerosRomanos3 |
| numeros-romanos-4 | P4 | NumerosRomanos4 |
| numeros-romanos-5 | P5 | NumerosRomanos5 |
| numeros-romanos-6 | P6 | NumerosRomanos6 |
| numeros-romanos-eso | ESO 1-4 | NumerosRomanosESO |

### Mayor Menor (solo `matematicas`)
| app_id | Curso | Componente |
|--------|-------|------------|
| mayor-menor-1 | P1 | MayorMenor1 |
| mayor-menor-2 | P2 | MayorMenor2 |
| mayor-menor-3 | P3 | MayorMenor3 |
| mayor-menor-4 | P4 | MayorMenor4 |
| mayor-menor-5 | P5 | MayorMenor5 |
| mayor-menor-6 | P6 + ESO 1-4 | MayorMenor6 |

### Medidas (solo `matematicas`)
| app_id | Curso | Componente |
|--------|-------|------------|
| medidas-1 | P1 | Medidas1 |
| medidas-2 | P2 | Medidas2 |
| medidas-3 | P3 | Medidas3 |
| medidas-4 | P4 | Medidas4 |
| medidas-5 | P5 | Medidas5 |
| medidas-6 | P6 + ESO 1-4 | Medidas6 |

---

## Resumen de conteo

| Categoria | Apps unicas | Nota sobre puntuaciones |
|-----------|-------------|------------------------|
| Universales parametrizadas | 22 | Ranking por (app_id, level, grade, subjectId) |
| Idiomas parametrizadas | 1 | Ranking por (app_id, level, grade, subjectId) |
| Casi-universales | 1 | Ranking por (app_id, level, grade, subjectId) |
| Matematicas parametrizadas | 5 | Ranking por (app_id, level, grade, subjectId) |
| Ciencias parametrizadas | 5 | Ranking por (app_id, level, grade, subjectId) |
| Tutoria | 3 | Sin ranking competitivo (bienestar) |
| Programacion | 2 | Ranking por (app_id, level, grade, subjectId) |
| Mates por curso | 42 | Ranking solo por app_id (ya unico) |
| **TOTAL** | **81 app_ids** | |

---

## Reglas para puntuaciones y rankings

1. **score** (puntuacion) es independiente de **nota** (0-10). La nota mide conocimiento; la puntuacion mide maestria (sin limite).
2. Para apps parametrizadas, el ranking se segmenta por `(app_id, level, grade, subjectId)` — asi "Ahorcado de Mates 3o Primaria" no compite con "Ahorcado de Lengua 1o ESO".
3. Para apps por curso (sumas-primaria-3-drag), el `app_id` ya es unico, asi que el ranking es global para ese app_id.
4. Apps de tutoria (isla-de-la-calma, generador-personajes, banco-recursos) **no generan puntuaciones competitivas** — son herramientas de bienestar.
5. **Ranking de clase**: top 3 mejores puntuaciones de alumnos del mismo `group_id`.
6. **Ranking global**: top 10 mejores puntuaciones de toda la plataforma.
7. **high_scores**: tabla separada de `game_sessions` — almacena solo la mejor puntuacion de cada usuario por contexto.

---

## Reglas para valoraciones de apps

1. Apps parametrizadas (mismo componente): una unica valoracion por `app_id`, independientemente del curso/asignatura.
2. Apps por curso (sumas-primaria-1, sumas-primaria-2...): valoracion por `app_id` individual.
3. No valorar apps de tutoria que no son juegos (banco-recursos-tutoria).
