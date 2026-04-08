# Revisión: Primaria · Programación

Estado actual del slice (`level=primaria`, `subject_id=programacion`, 252 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º-5º (compartido) | 108 | 62 | 46 | 0 |
| 6º | 144 | 40 | 99 | 5 |

**Estructura especial**: 1º a 5º comparten un único set de 108 entradas (`grades=[1,2,3,4,5]`). Solo 6º es independiente.

**Diagnóstico**: asignatura **muy limpia**. Sin placeholders masivos, sin mayúsculas, sin duplicados. La mayoría de bugs (13 anotaciones internas en 6º) **ya están en `global-anotaciones.sql`**. Solo 5 autorrefs leves por arreglar.

---

## 🔴 Bugs (mínimos)

### Definiciones autorreferenciales (no cubiertas en global)

| id | curso | actual | corrección |
|---|---|---|---|
| 14448 | 6º | `jerarquía` def `'Jerarquía o niveles de importancia en un programa.'` | `'Organización por niveles de importancia o mando.'` |
| 14477 | 6º | `tamaño` def `'Tamaño de la pantalla o de la letra (contiene la Ñ).'` | `'Dimensión o medida de un objeto digital (contiene Ñ).'` |
| 14490 | 6º | `bloque` def `'Bloque de código que se puede arrastrar en Scratch (contiene Q).'` | `'Pieza de código que se arrastra en Scratch para programar (contiene Q).'` |
| 14491 | 6º | `equipo` def `'Componentes físicos del equipo informático (contiene Q).'` | `'Conjunto de componentes físicos del ordenador (contiene Q).'` |
| 14515 | 6º | `unir` def `'Unir dos o más cadenas de texto.'` | `'Verbo: juntar o concatenar dos cadenas de texto.'` |

### Anotaciones internas (ya cubiertas en `global-anotaciones.sql`)

13 entradas: 14425, 14430, 14438, 14445, 14452, 14453, 14473, 14489, 14492, 14508, 14528, 14535, 14540.

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 6º | 0 | 5 |

**Total**: 5 updates.

---

SQL en [primaria-programacion.sql](primaria-programacion.sql).
