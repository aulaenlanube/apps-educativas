# Revisión: Runner Categories

Estado actual:

| Métrica | Valor |
|---|---|
| Total categorías | 899 |
| Asignaturas | 28 (incl. ESO Química independiente) |
| Words por categoría | 10-30 (avg 14) |

**Nota importante**: esta tabla alimenta **6 minijuegos**: Runner, Memoria, Clasificador, LluviaDePalabras, ExcavacionSelectiva, SnakePalabras. Cualquier bug aquí afecta a todos.

## Resultado del grep global

| Categoría | Resultado |
|---|---|
| Categorías vacías | 0 |
| Categorías duplicadas exactas | 0 |
| `category_name` repetidos | 0 |
| Anotaciones internas | 0 |
| Caracteres extraños | 0 |
| Espacios sobrantes | 0 |
| Categorías con <4 words | 0 |
| **Words duplicados internos** | **10** |

## Bugs detectados

| id | sub | category_name | duplicados |
|---|---|---|---|
| 8 | ccnn | insectos | libélula×2, luciérnaga×2 |
| 50 | ccss | rios_vertiente_atlantica | Tambre×2, Ulla×2 |
| 57 | ccss | rios_europa | Ródano×2 |
| 86 | francés | les_vetements_hiver | imperméable×2 |
| 155 | mat | tipos_de_lineas | secante×2 |
| 157 | mat | conceptos_operaciones | doble×2 |
| 158 | mat | tipos_angulos | agudo×2, recto×2, obtuso×2 |
| 162 | mat | elementos_circulo | diámetro×2 |
| 200 | tutoría | emociones_agradables | gozo×2 |
| 252 | valencià | connectors_textuals | però×2 |

## Hallazgo nuevo

Aparece **`eso::quimica`** con 10 categorías como asignatura independiente. En las demás tablas (rosco, parejas, ordena_frases) Física y Química estaban combinadas en `subject_id='fisica'`. Esto sugiere que **Runner Categories sí separa las dos asignaturas**, lo cual es correcto curricularmente. **No es un bug**, solo una observación.

## Cambios totales

| Acción | Cantidad |
|---|---|
| Updates (dedupe words) | 10 |

**Total**: 10 cambios sobre 899 categorías (~1,1%). Es la app más limpia de toda la revisión.

---

SQL en [runner.sql](runner.sql).
