# Revisión: Primaria · Francés

Estado actual del slice (`level=primaria`, `subject_id=frances`, 396 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º-3º (compartido) | 135 | 107 | 28 | 0 |
| 4º-5º (compartido) | 130 | 104 | 25 | 1 |
| 6º | 131 | 93 | 36 | 2 |

**Estructura especial**: la asignatura usa **dos pares de cursos compartidos** (1º-3º y 4º-5º) más 6º independiente. Es la asignatura más pequeña de Primaria y la única que comparte cursos así.

**Diagnóstico**: muy limpia. Sin placeholders masivos, sin mayúsculas, sin duplicados.

---

## ✅ Letra Ñ — caso especial defendible

5 entradas con `letter='Ñ'` que son palabras francesas con el dígrafo **gn** (que se pronuncia como Ñ española):

- 11783 `montagne` — Montaña
- 11784 `champignon` — Champiñón
- 11785 `araignée` — Araña
- 11786 `ligne` — Línea
- 11787 `signal` — Señal

**Decisión**: **mantener**. Es pedagógicamente correcto: el alumno aprende que el francés escribe `gn` lo que en español sería ñ. La definición actual `(contiene el sonido Ñ - gn)` es **didácticamente buena**. Sin cambios.

---

## 🔴 Bugs (mínimos)

### 1. Anotación interna (ya cubierta en `global-anotaciones.sql`)

| id | curso | entrada | estado |
|---|---|---|---|
| 12088 | 6º | `ville` con `Buscamos: Ville` | ya en global-anotaciones.sql |

### 2. Definiciones autorreferenciales — **NO se tocan**

26 entradas tienen el patrón `'X en francés.'` o `'X (contiene W)'` donde X es la solución. **No son bugs reales** porque son **préstamos lingüísticos**: la palabra francesa es idéntica a la española (`kiwi`, `koala`, `kilo`, `image`, `gris`, `taxi`, `sandwich`, `wifi`, `uniforme`, `grand`, `blanc`...). La definición "Kiwi en francés" es válida — el alumno aprende que se escribe igual.

---

## Resumen de cambios

**0 deletes + 0 updates**. La asignatura está tan limpia que no requiere cambios en este pase. La única anotación adicional ya está cubierta en `global-anotaciones.sql`.

---

## Hallazgo

Primaria Francés es la **asignatura más limpia** de toda la revisión Primaria hasta ahora. La estructura compartida 1º-3º + 4º-5º + 6º es eficiente para una asignatura optativa con poco volumen, y el contenido está bien curado.

---

**Sin SQL específico**. Esta entrada queda como nota de revisión sin acción.
