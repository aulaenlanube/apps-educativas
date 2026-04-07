# Revisión: ESO · Asignaturas menores (Economía, IA, Programación, Robótica)

| Asignatura | Total | Cursos | Estado |
|---|---|---|---|
| Economía | 274 | solo 4º ESO | ✅ casi limpia |
| Inteligencia Artificial | 130 | 1º-4º (compartido) | ✅ limpia |
| Programación | 513 | 1º (108) · 2º (189) · 3º (216) · 4º (108) | ✅ casi limpia |
| Robótica | 324 | 1º (81) · 2º (81) · 3º (81) · 4º (81) | ✅ limpia |

**Diagnóstico**: las 4 asignaturas técnicas/optativas están **mucho más limpias** que las troncales. **Ninguna sufre el bug masivo de 3º ESO**. Solo se detectan 2 bugs puntuales en total.

---

## Economía · 4º ESO

| id | bug | corrección |
|---|---|---|
| 31124 | `Valor` mayúscula con def `'Incremento de valor en el proceso productivo (Valor...)'` — truncamiento de "valor añadido" | renombrar a `valor añadido`, def `'Diferencia entre el valor del producto final y el coste de las materias primas.'` |

(Sin más bugs detectables.)

---

## Inteligencia Artificial · 1º-4º ESO

130 entradas compartidas (`grades=[1,2,3,4]`). **Todas las soluciones empiezan con mayúscula** (`Algoritmo`, `Big Data`, `Ada Lovelace`, `Backpropagation`, `Bot`...).

**Decisión**: **mantener tal cual**. Razones:
1. El hook del rosco normaliza con `cleanText()` (lowercase), así que las mayúsculas no afectan a la jugabilidad ([src/hooks/useRoscoGame.js:64-72](src/hooks/useRoscoGame.js#L64-L72)).
2. Es **consistente internamente**: las 130 entradas siguen la misma convención.
3. Muchas son **nombres propios legítimos** (Ada Lovelace, Alan Turing) o términos técnicos en inglés (Big Data, Backpropagation, Cluster, Hash) donde la mayúscula es habitual.

**Sin cambios.**

---

## Programación

| id | curso | bug | corrección |
|---|---|---|---|
| 27268, 27270 | 3º | 2x `wan` W (defs casi idénticas) | borrar 27270 |

(Sin más bugs detectables. Sin placeholders, sin mayúsculas raras, sin anotaciones internas.)

---

## Robótica

**Sin bugs detectables.** La asignatura más limpia de todo el ESO. Distribución de dificultad equilibrada en los 4 cursos, sin duplicados, sin placeholders, sin mayúsculas raras, sin anotaciones internas.

---

## Resumen de cambios

| Asignatura | Deletes | Updates |
|---|---|---|
| Economía | 0 | 1 (Valor → valor añadido) |
| IA | 0 | 0 |
| Programación | 1 (wan duplicado) | 0 |
| Robótica | 0 | 0 |

**Total: 1 delete + 1 update.** Es el SQL más corto de toda la revisión.

---

## Cierre del bloque ESO

Con estas 4 asignaturas, **ESO queda completamente revisado**:

| ESO | Estado |
|---|---|
| Inglés | ✅ |
| Francés | ✅ |
| Latín | ✅ |
| Lengua | ✅ |
| Matemáticas | ✅ |
| Historia | ✅ |
| Biología | ✅ |
| Física y Química | ✅ |
| Tecnología | ✅ |
| Música | ✅ |
| Plástica | ✅ |
| Tutoría | ✅ |
| Valencià | ✅ |
| Educación Física | ✅ |
| **Economía** | ✅ |
| **IA** | ✅ |
| **Programación** | ✅ |
| **Robótica** | ✅ |
| Global anotaciones | ✅ |

**18 asignaturas ESO + 1 SQL global** = 19 SQL listos. Quedan **8 asignaturas de Primaria**.

---

SQL en [eso-menores.sql](eso-menores.sql).
