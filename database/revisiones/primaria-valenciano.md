# Revisión: Primaria · Valencià

Estado actual del slice (`level=primaria`, `subject_id=valenciano`, 838 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º | 130 | 109 | 20 | 1 |
| 2º | 130 | 108 | 21 | 1 |
| 3º | 135 | 110 | 25 | 0 |
| 4º | 135 | 82 | 52 | 1 |
| 5º | 161 | 96 | 64 | 1 |
| 6º | 147 | 45 | 99 | 3 |

Distribución progresiva. Sin placeholders masivos, sin mayúsculas. **Asignatura sana** con bugs puntuales.

---

## ✅ Letra Ñ — caso pedagógico defendible (como Francés)

10 entradas con `letter='Ñ'` que son palabras valencianas con el dígrafo **NY** (equivalente fonético español de la ñ): `castanya`, `muntanya`, `aranya`, `bany`, `rossinyol`, `pinyó`, etc. Pedagógicamente correcto: el alumno aprende que el valenciano usa NY para el sonido ñ.

### Bugs en las entradas Ñ

| id | curso | actual | corrección |
|---|---|---|---|
| 15284 | 3º | `pinyó` def `'Menut o xicotet (conté NY).'` — describe **petit**, no pinyó | reescribir def `'Llavor del pi, comestible (conté NY).'` |
| 15285 | 3º | `lenya` — errata: la forma correcta es `llenya` | corregir solution a `llenya` |

---

## 🔴 Bugs

### 1. Anotaciones internas adicionales en 5º (no detectadas en grep global)

| id | curso | actual | corrección |
|---|---|---|---|
| **15497** | 5º | `vertical` def `'Línia que va de dalt a baix... (en valencià). Busquem: Vertical.'` | reescribir def `'Línia perpendicular a l''horitzó.'` |
| **15551** | 5º | `llebre` def `'Animal nocturn que plana o vola (sinònim de ratpenat en algunes zones). Busquem: Llebre.'` — la def describe **ratpenat** (murciélago), no llebre (liebre) | reescribir def `'Mamífer corredor de camps i prats, semblant al conill però més gros.'` |
| **15632** | 5º | `ioiò` def `'Joguet que puja i baixa per un fil (valencià antic). Busquem: Ioiò.'` | reescribir def `'Joguet que puja i baixa per un fil.'` |
| **15633** | 5º | `platja` def `'Lloc de la costa amb sorra (conté la i grega en castellà). Busquem: Platja.'` | reescribir def `'Lloc de la costa amb sorra (conté Y en l''ortografia castellana).'` ❌ — la versión valenciana es `platja` sin Y. Mejor borrar de letra Y. **Borrar.** |

### 2. Duplicado

| ids | curso | letra | acción |
|---|---|---|---|
| 15710, 15712 | 6º | M | mètrica — 15712 ya está en `global-anotaciones.sql` (def reescrita allí) |

### 3. Anotaciones de 6º — todas en global-anotaciones.sql

15659, 15693, 15696, 15712, 15737, 15740, 15745, 15761, 15777, 15780, 15781, 15782, 15788 ya están cubiertas.

### 4. Otras 4 anotaciones en 5º letra Y

15634 (`egua`), 15635 (`maig`), 15636 (`llegenda`) — **ya en `global-anotaciones.sql`**.

15631 (`excursió`) — **ya en global-anotaciones.sql**.

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 3º | 0 | 2 (pinyó, lenya→llenya) |
| 5º | 1 (platja Y) | 3 (vertical, llebre, ioiò) |
| Resto | 0 | 0 |

**Total**: 1 delete + 5 updates.

---

SQL en [primaria-valenciano.sql](primaria-valenciano.sql).
