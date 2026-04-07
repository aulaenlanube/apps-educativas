# Revisión: ESO · Música

Estado actual del slice (`level=eso`, `subject_id=musica`, 1.089 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 271 | 133 | 131 | 7 |
| 2º ESO | 278 | 132 | 135 | 11 |
| 3º ESO | 270 | 127 | 140 | **3** |
| 4º ESO | 270 | 142 | 119 | 9 |

**Diagnóstico**: 1º, 2º y 4º ESO están bastante limpios (algunos duplicados puntuales). **3º ESO Música sufre el mismo desastre sistémico que 3º ESO Tecnología**: ~110 entradas placeholder repartidas por casi todas las letras (`dinámica`, `escala`, `himno`, `intervalo`, `jota`, `kilo`, `legato`, `nota`, `mañana`, `obertura`, `pentagrama`, `queso`, `ritmo`, `sinfonía`, `unísono`, `waltz`, `examen`, `yodle`, `zarzuela`). El difíciles=3 sobre 270 ya delata el problema.

---

## 🔴🔴 3º ESO · Borrado masivo + inserción de contenido nuevo

Las letras Ñ, Y, X tienen 100% placeholders. Otras (D, J, Q, U, W, Z) tienen ≥7 placeholders. Total a borrar: ~110 entradas.

Tras el borrado, cuento de entradas legítimas que quedan por letra:

| Letra | Quedan | Necesita |
|---|---|---|
| A | 10 | OK |
| B | 10 | OK |
| C | 10 | OK (borrar `Clasicismo` mayúscula bug) |
| D | 3 (decrescendo, do, decibelio) | +2 |
| E | 7 (sin placeholders) | OK |
| F | 8 | OK |
| G | 5 | +1 |
| H | 5 | OK |
| I | 5 | OK |
| J | 3 (jazz, jota legítima, juego) | +2 |
| K | 3 (keyboard, kilovatio, klezmer) | +2 |
| L | 6 | OK |
| M | 8 | OK |
| N | 3 (nota legítima, nocturno, natural) | +2 |
| **Ñ** | **0** | **+5** |
| O | 6 | OK |
| P | 6 | OK |
| **Q** | 1 (quinteto) | **+4** |
| R | 5 | OK |
| S | 7 | OK |
| T | 8 | OK |
| **U** | 1 (unísono legítimo) | **+4** |
| V | 8 | OK |
| W | 2 (wagner, waltz legítimo) | **+3** |
| **X** | 1 (xilófono) | **+4** |
| **Y** | **0** | **+5** |
| Z | 2 (zarzuela legítima, danza) | **+3** |

**Total de inserts necesarios para 3º ESO Música: ~37 entradas nuevas**.

Vocabulario LOMLOE 3º ESO Música: notación y lenguaje musical, instrumentos, voces, géneros (sinfónico, ópera, jazz, folclore), historia de la música (Edad Media → Romanticismo → contemporáneo), elementos del sonido.

---

## 1º ESO

| id | problema | corrección |
|---|---|---|
| 24687, 24692 | 2x `intervalo` I | borrar 24692 |
| 24707 | `kilo` K def 'Prefijo para mil hertzios' — es legítima conceptualmente | mantener (kilohercio es válido) |

---

## 2º ESO

| id | problema | corrección |
|---|---|---|
| 24879, 24880 | 2x `ars nova` A | borrar 24880 |
| 24905, 24906 | 2x `clave` C | borrar 24906 |
| 24935, 24940 | 2x `fuerte` F | borrar 24940 |
| 25026, 25032 | 2x `tañer` Ñ — 25032 era anotación interna **ya cubierta en global-anotaciones.sql** | borrar 25026 (duplicado) |
| 24928 | `Espacios` E mayúscula | minúscula `espacios` |

---

## 4º ESO

| id | problema | corrección |
|---|---|---|
| 25454, 25459 | 2x `disco` D | borrar 25459 |
| 25532 | `kilo` K def 'Banda de metal (Metallic..., contiene K)' — describe Metallica, no kilo | renombrar a `solution='metallica'`, def `'Famosa banda de metal estadounidense (contiene K).'` |

---

## Resumen de cambios

| Curso | Deletes | Updates | Inserts |
|---|---|---|---|
| 1º | 1 | 0 | 0 |
| 2º | 5 | 1 | 0 |
| 3º | ~110 (borrado masivo) | 0 | **~37** |
| 4º | 1 | 1 | 0 |

**Total**: ~117 deletes + 2 updates + 37 inserts.

---

SQL en [eso-musica.sql](eso-musica.sql). **No se aplica nada hasta tu visto bueno.**
