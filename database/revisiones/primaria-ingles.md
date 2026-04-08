# Revisión: Primaria · Inglés

Estado actual del slice (`level=primaria`, `subject_id=ingles`, 540 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º-3º (compartido) | 135 | 125 | 10 | 0 |
| 4º | 130 | 94 | 36 | 0 |
| 5º | 143 | 85 | 58 | 0 |
| 6º | 132 | 22 | 102 | 8 |

**Estructura**: 1º, 2º y 3º comparten un único set de 135 entradas (`grades=[1,2,3]`). Cursos 4º, 5º, 6º independientes.

**Diagnóstico**: distribución similar a ESO Inglés — fuertemente sesgada hacia "fácil" (idioma extranjero en Primaria). Sin placeholders masivos, sin mayúsculas. **Mismo bug crítico que ESO Inglés**: la letra Ñ existe en el dataset pero **no es Ñ real** — son palabras inglesas con la letra **N** (banana, ten, one, green, rain) marcadas como `letter='Ñ'` y `definition='(contiene la letra N)'`. El generador confundió N con Ñ.

---

## 🔴 Bug crítico

### Letra Ñ rota — son palabras con N, no con Ñ

5 entradas en grades [1,2,3] con `letter='Ñ'` que en realidad son palabras con N:

| id | solution | def actual |
|---|---|---|
| 12179 | banana | "Plátano (contiene la letra N)" |
| 12180 | ten | "Número 10 (contiene la letra N)" |
| 12181 | one | "Número 1 (contiene la letra N)" |
| 12182 | green | "Color verde (contiene la letra N)" |
| 12183 | rain | "Lluvia (contiene la letra N)" |

**Decisión idéntica a ESO Inglés**: en inglés no existe la letra Ñ. **Borrar las 5**. El rosco se renderizará automáticamente con 26 letras (verificado al revisar ESO Inglés).

---

## 🟠 Otros bugs

### Anotación interna adicional (no en grep global)

| id | curso | actual | corrección |
|---|---|---|---|
| **12373** | 4º | `size` def `'A prize given to a winner (ends in E, but has a Z sound - actually let''s use ''size'').'` — anotación filtrada y descripción de **prize**, no size | reescribir def `'How big or small something is.'` |

### Definiciones autorreferenciales

| id | curso | actual | corrección |
|---|---|---|---|
| 12111 | 1-3 | `animal` def `'Animal en inglés.'` | `'A living being like a dog, cat or bird.'` |
| 12123 | 1-3 | `color` def `'Color en inglés.'` | `'Red, blue, green, yellow are examples of this.'` |
| 12203 | 1-3 | `robot` def `'Robot en inglés.'` | `'A machine that can do tasks automatically.'` |
| 12232 | 1-3 | `taxi` def `'Taxi en inglés (contiene X).'` | `'A car you pay to ride in (contains X).'` |
| 12246 | 4º | `afternoon` def `'Afternoon in English.'` | `'The time of day after midday and before evening.'` |
| 12268 | 4º | `every` def `'Every day, every week... (each one).'` | `'Each one of a group, with no exceptions.'` |
| 12456 | 5º | `orange` def `'The orange fruit that grows on a tree.'` | `'A round citrus fruit, also a color.'` |
| 12643 | 6º | `story` def `'A story told to children (contiene Y).'` | `'A narrative or tale (contains Y).'` |

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1-3 | 5 (Ñ rota) | 4 (animal, color, robot, taxi) |
| 4º | 0 | 3 (size, afternoon, every) |
| 5º | 0 | 1 (orange) |
| 6º | 0 | 1 (story) |

**Total**: 5 deletes + 9 updates.

---

## Hallazgo transversal

**Bug "Ñ enmascarada como N" confirmado en Primaria Inglés** — mismo origen que en ESO Inglés (Ñ rota). Resolución idéntica: borrar las entradas Ñ y dejar el rosco con 26 letras automáticamente.

---

SQL en [primaria-ingles.sql](primaria-ingles.sql).
