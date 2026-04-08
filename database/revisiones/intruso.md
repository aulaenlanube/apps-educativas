# Revisión: Intruso Sets

Estado actual:

| Métrica | Valor |
|---|---|
| Total sets | 808 |
| Asignaturas | 27 |
| Items por correct | 7-24 |
| Items por intruder | 3-16 |

Mecánica: el alumno ve una mezcla de items correctos (de la categoría) e intrusos, y debe identificar los intrusos.

## Resultado del grep global

| Categoría | Resultado |
|---|---|
| Anotaciones internas | 0 |
| Categorías vacías | 0 |
| Sets sin intruders | 0 |
| Sets con <3 correct items | 0 |
| **Items en correct ∩ intruder** (bug grave de jugabilidad) | **18** |
| **Items duplicados dentro de correct** | **102** |
| **Items duplicados dentro de intruder** | **11** |
| **Sets duplicados exactos** | **1** (Números Primos en mat ESO) |

## 🔴 Bug crítico: items en correct ∩ intruder (18 sets)

El alumno ve el mismo item en la lista de "correctos" y de "intrusos" simultáneamente — bug grave de jugabilidad. En todos los casos detectados el item **es legítimamente parte de la categoría correcta**, así que la corrección es **borrar el item del array `intruder`**.

| id | sub | curso | categoría | item conflicto |
|---|---|---|---|---|
| 19 | ccnn | 3º P | Fenómenos Atmosféricos | ☁️, 🌈 |
| 59 | ccss | 3º P | Medios de Transporte | Bicicleta |
| 94 | francés | 3º P | Animaux | 🐬 |
| 108 | francés | 5º P | Moyens de Transports | Vélo |
| 173 | lengua | 3º P | Frutas y Verduras | 🍎 |
| 180 | lengua | 3º P | Palabras con B | Nube |
| 181 | lengua | 4º P | Palabras Llanas | Silla, Nube |
| 182 | lengua | 4º P | Palabras Esdrújulas | Teléfono |
| 243 | programación | 3º P | Internet y Redes | Nube |
| 273 | tutoría | 3º P | Higiene y Salud | 🍎 |
| 307 | valencià | 3º P | Animals | 🐬 |
| 318 | valencià | 4º P | Animals Salvatges | Lleó |
| 323 | valencià | 6º P | Paraules Esdrúixoles | Telèfon |
| 419 | física | 4º E | Interacciones y Fuerzas | 🔋 |
| 564 | mat | 1º E | Geometría | ➰ |
| 568 | mat | 1º E | Clasificación de Triángulos | Rectángulo |
| 603 | música | 1º E | Notas y Lectura Musical | Pentagrama |
| 767 | valencià | 1º E | Aliments | 🥣 |

## 🟠 Items duplicados dentro de correct/intruder (113 sets)

El generador insertó el mismo emoji/palabra varias veces dentro del mismo array. No es bug de jugabilidad porque la app baraja los items, pero es desperdicio. Se deduplica.

## Set duplicado completo (1)

| ids | sub | categoría |
|---|---|---|
| 228, 235 | mat ESO | Números Primos |

Borrar 235.

## Cambios totales

| Acción | Cantidad |
|---|---|
| DELETE (set duplicado) | 1 |
| UPDATE (cruces y dedupe) | 123 |

**Total**: 124 cambios sobre 808 sets (~15%).

## Hallazgo importante

El bug del **`intruder` con items de relleno repetidos en distintos sets** es generalizado. Por ejemplo, el array `["🍕","🚲","🐬","🔨","☁️","👞","🌈","🎸","🍎","🚗"]` aparece literalmente como `intruder_items` en ids 19, 94, 173, 273, 307 — el generador usó la misma "lista de intrusos genéricos" para varios sets, lo que provoca colisiones cuando el `correct` contiene alguno de esos items.

**Recomendación posterior**: revisar manualmente los sets de Primaria para añadir intrusos más temáticos por categoría (no la misma lista genérica para todo). Lo dejo como TODO de mejora cualitativa.

---

SQL en [intruso.sql](intruso.sql).
