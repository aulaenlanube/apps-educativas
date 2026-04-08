# Revisión: Primaria · Tutoría

Estado actual del slice (`level=primaria`, `subject_id=tutoria`, 410 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º-3º (compartido) | 135 | 79 | 55 | 1 |
| 4º-5º (compartido) | 135 | 56 | 74 | 5 |
| 6º | 140 | 44 | 91 | 5 |

**Estructura compartida**: igual que Primaria Francés (1-3 + 4-5 + 6). Sin placeholders masivos, sin mayúsculas, sin duplicados, **sin el bug catastrófico** que tenía ESO Tutoría 3º.

**Diagnóstico**: asignatura **muy limpia**. La gran mayoría de bugs (las 7 anotaciones de 6º) **ya están cubiertos en `global-anotaciones.sql`**. Solo quedan 4 autorrefs leves por arreglar.

---

## 🔴 Bugs (mínimos)

### Definiciones autorreferenciales

| id | curso | actual | corrección |
|---|---|---|---|
| 14620 | 1-3 | `ojos` def `'Usar los ojos para mirar.'` | `'Órganos del sentido de la vista.'` |
| 14739 | 4-5 | `modales` def `'Educación y buenos modales.'` | `'Forma de comportarse en sociedad.'` |
| 14750 | 4-5 | `enseñar` def `'Enseñar algo a alguien (contiene Ñ).'` | `'Verbo: transmitir conocimientos a otra persona (contiene Ñ).'` |
| 14807 | 4-5 | `capaz` def `'Capaz de lograr objetivos (contiene Z).'` | `'Que tiene la habilidad o aptitud para algo (contiene Z).'` |

### Ya cubiertos en global-anotaciones.sql

- 14881 (nobleza), 14887 (empeño), 14931 (show), 14934 (kiwi), 14943 (diálogo), 14945 (apoyo), 14949 (gozo)

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1-3 | 0 | 1 |
| 4-5 | 0 | 3 |
| 6 | 0 | 0 |

**Total**: 4 updates.

---

SQL en [primaria-tutoria.sql](primaria-tutoria.sql).
