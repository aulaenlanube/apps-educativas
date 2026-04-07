# Revisión: ESO · Plástica

Estado actual del slice (`level=eso`, `subject_id=plastica`, 1.090 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 279 | 134 | 130 | 15 |
| 2º ESO | 271 | 127 | 130 | 14 |
| 3º ESO | 270 | 110 | 109 | **51** |
| 4º ESO | 270 | 122 | 134 | 14 |

**Diagnóstico**: 1º, 2º, 4º limpios. **3º ESO Plástica afectado por el mismo bug sistémico** que Tecnología y Música — ~80 entradas placeholder en 12 letras con `solution` repetido (`banio maria`, `dioxido de carbono`, `energia no renovable`, `homo sapiens`, `juegos olimpicos`, `sketch`, `mano alzada`, `numero atomico`, `mañana`, `queso`, `kiwi`, `examen`, `espacios y lineas`, `zona`, `capa de ozono`). Menos masivo que los anteriores pero del mismo tipo.

---

## 🔴🔴 3º ESO · Borrado masivo + inserción

Tras el borrado, las letras vacías o casi vacías son **J, K, Ñ, Q, W, Y**. Necesito ~27 inserciones nuevas con vocabulario plástico/dibujo técnico LOMLOE.

Inserciones por letra:
- **J** (vacía, +5): jeroglífico, jaspeado, jarrón, jónico, jpg
- **K** (+3): kraft, kandinsky, klimt
- **Ñ** (+4, contiene Ñ): pequeño, montaña, compañero, caña
- **Q** (vacía, +5, contiene Q): arquitectura, maqueta, esquema, bosquejo, equilibrio
- **W** (vacía, +5): warhol, whistler, watteau, wright, web
- **Y** (vacía, +5): yeso (empieza), yuxtaposición, proyecto, ensayo, mayor (contienen Y)

---

## 1º ESO

Limpio. Bugs menores:

| id | problema | corrección |
|---|---|---|
| 25807 | `folk` K anotación interna ya cubierta en global-anotaciones.sql | — |

(Sin más bugs detectables.)

---

## 2º ESO

| id | problema | corrección |
|---|---|---|
| 26100 | `Mano` mayúscula | minúscula |

---

## 4º ESO

(Sin bugs significativos detectados.)

---

## Resumen de cambios

| Curso | Deletes | Updates | Inserts |
|---|---|---|---|
| 1º | 0 | 0 | 0 |
| 2º | 0 | 1 | 0 |
| 3º | ~80 | 0 | **27** |
| 4º | 0 | 0 | 0 |

---

SQL en [eso-plastica.sql](eso-plastica.sql).
