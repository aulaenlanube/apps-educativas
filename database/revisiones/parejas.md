# Revisión: Parejas Items

Estado actual:

| Métrica | Valor |
|---|---|
| Total parejas | 2.754 |
| Asignaturas | 27 |

Mecánica: el alumno empareja `term_a` con su pareja correcta `term_b` (ej. `Perro ↔ 🐶`, `Bonjour ↔ Hola`).

## Resultado del grep global

| Categoría | Resultado |
|---|---|
| Anotaciones internas | 0 |
| Caracteres extraños | 0 (legítimos: %, →) |
| Espacios al inicio/final | 1 |
| Items vacíos | 0 |
| **`term_a == term_b`** (bug grave: la pareja es idéntica) | **89** |
| **Duplicados exactos** | **3** |
| **`term_a` ambiguo** (mismo a, b distinto en mismo curso) | 8 (la mayoría legítimos) |

## 🔴 Bug crítico: 89 parejas con `term_a == term_b`

El generador rellenó la columna del texto descriptivo con el mismo emoji que la columna visual. Resultado: **el alumno ve dos cartas con el mismo emoji y "encontrar la pareja" se trivializa**.

Distribución por asignatura:

| Asignatura | Cantidad | Categoría |
|---|---|---|
| ESO Ed.Física | 12 | Deportes (⚽, 🏀, 🎾...) |
| ESO Música | 12 | Instrumentos (🎹, 🎸, 🎻...) |
| ESO Plástica | 12 | Arte (🎨, 🖌️, 🖍️...) |
| ESO Tecnología | 12 | Tech (💻, 🤖, ⚙️...) |
| ESO Tutoría | 12 | Emociones (😃, 😢, 😠...) |
| Primaria CCSS 1º | 24 | Familia, transporte, lugares |
| Primaria Valencià | 3 | Casa, Pera, Dormir |
| Primaria Francés | 1 | Piano |
| Primaria Inglés | 1 | Hospital |

**Acción**: reescribir `term_a` con el texto descriptivo en español (o valenciano/francés/inglés según asignatura). El emoji va en `term_b`. Resultado: `Pelota ↔ ⚽`, `Piano ↔ 🎹`, etc.

## 🔴 Bug menor: 3 duplicados

| ids | sub | a ↔ b |
|---|---|---|
| 378, 384 | francés | Fromage ↔ Queso |
| 312, 1671 | francés | Salut ↔ Hola / Adiós |
| 314, 1673 | francés | S'il vous plaît ↔ Por favor |

Borrar los segundos.

## 🟠 Bug específico: id 166 con caracter zero-width

```
165 ciencias-sociales g1 | 👮 ↔ 👮
166 ciencias-sociales g1 | 👮 ↔ 👮‍   ← join character invisible al final
```

Las dos parejas son iguales en realidad. Borrar 166.

## 🟡 Espacio al final

| id | sub | term_b |
|---|---|---|
| 2020 | inglés | `Until now (negative/?) ` |

Trim.

## term_a ambiguos (revisar pero no son bugs reales)

| sub/grade | term_a | term_b alternativos |
|---|---|---|
| ccss/1 | 👮 | 👮 / 👮‍ | (cubierto arriba) |
| frances/1 | Bonjour | "Hola / Buenos días" / "Buenos días" | duplicado parcial — borrar uno |
| lengua/2 | Verbo | "Acción" / "Núcleo del predicado" | son ambos correctos pedagógicamente — mantener |
| tutoria/1 | Esfuerzo | dos definiciones distintas | mantener |

Solo el de francés (`Bonjour`) requiere acción: borrar uno.

---

## Cambios totales

| Acción | Cantidad |
|---|---|
| DELETE (duplicados + caracter invisible + Bonjour) | 5 |
| UPDATE (89 reescrituras + 1 trim) | 90 |

**Total**: 95 cambios.

---

SQL en [parejas.sql](parejas.sql).
