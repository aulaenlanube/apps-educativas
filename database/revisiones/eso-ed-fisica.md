# Revisión: ESO · Educación Física

Estado actual del slice (`level=eso`, `subject_id=ed-fisica`, 1.108 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 274 | 121 | 139 | 14 |
| 2º ESO | 284 | 114 | 156 | 14 |
| 3º ESO | 278 | 108 | 156 | 14 |
| 4º ESO | 272 | 111 | 149 | 12 |

**Distribución limpia y consistente en los 4 cursos**. Ñ correctamente poblada (40 entradas).

**Diagnóstico**: ESO Ed.Física es la asignatura **menos afectada** de toda la revisión. **No tiene el bug masivo de 3º ESO** que afectaba a Tecnología/Música/Plástica/Tutoría/Valencià. Solo presenta **9 duplicados puntuales y 7 truncamientos con mayúscula** (parte del patrón sistémico de soluciones multipalabra truncadas).

---

## Bugs

### Truncamientos con mayúscula (multipalabra cortadas)

| id | curso | actual | corrección |
|---|---|---|---|
| 17265 | 2º | `Jai-` | `jai alai` (deporte vasco de pelota) |
| 17272 | 2º | `Kick` | `kick boxing` (deporte de contacto) |
| 17496 | 3º | `Educación` (def: "Asignatura escolar") | borrar (duplica con 17497) |
| 17497 | 3º | `Educación` (def: "Parte de la asignatura...") | renombrar a `educación física`, def `'Asignatura escolar dedicada al deporte y la actividad física.'` |
| 17518 | 3º | `Gesto` | renombrar a `gesto técnico`, def `'Movimiento corporal específico de un deporte.'` |
| 17774 | 4º | `Educación` (def: "Asignatura") | borrar (duplica con 17775) |
| 17775 | 4º | `Educación` (def: "Nombre de la materia") | renombrar a `educación física`, def `'Materia escolar centrada en el desarrollo motor y la actividad física.'` |

### Otros duplicados

| id | curso | letra | solución | acción |
|---|---|---|---|---|
| 17062, 17069 | 1º | Q | equipo | borrar 17069 |
| 17258, 17266 | 2º | J | juego limpio | borrar 17266 |
| 17296, 17297 | 2º | M | motricidad | borrar 17297 |
| 17342, 17347 | 2º | Q | equipo | borrar 17347 |
| 17409, 17410, 17412 | 2º | W | kiwi (×3) | borrar 17410 y 17412 |
| 17500, 17501 | 3º | F | frecuencia cardiaca | borrar 17501 |

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1º | 1 | 0 |
| 2º | 5 | 2 (jai alai, kick boxing) |
| 3º | 2 | 2 (educación física, gesto técnico) |
| 4º | 1 | 1 (educación física) |

**Total**: 9 deletes + 5 updates. **La asignatura más limpia** revisada en este sprint.

---

SQL en [eso-ed-fisica.sql](eso-ed-fisica.sql).
