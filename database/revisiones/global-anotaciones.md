# Revisión global: anotaciones internas del autor filtradas a producción

Tras el grep sobre las 21.364 preguntas del rosco, he detectado **65 entradas** con texto del autor de borrador filtrado al campo `definition` (patrones `Use:`, `Usaremos:`, `Buscamos:`, `Vamos con:`, `(no)`, `? No)`, `Error.`, `errata`, `No hay.`).

## Cómo se reconoce el patrón

Son entradas donde el autor (probablemente una generación automática) no encontró una palabra apropiada para una letra concreta, escribió su búsqueda mental en la definición, y eligió finalmente la palabra que aparece en `solution`. Resultado típico:

```
solution: "cigüeña"
definition: "Animal que trepa por los árboles y tiene cola larga (contiene la Ñ). No. Usaremos: Cigüeña."
```

Lo correcto sería que la definición describiera **la palabra elegida** (`cigüeña`), no el descarte previo.

## Distribución

| Asignatura | Total |
|---|---|
| primaria/ciencias-naturales | 12 |
| primaria/ciencias-sociales | 12 |
| primaria/matematicas | 8 |
| primaria/programacion | 7 |
| primaria/tutoria | 6 |
| eso/fisica | 4 |
| eso/matematicas | 4 (ya cubiertos en eso-matematicas.sql) |
| primaria/ingles | 2 |
| primaria/valenciano | 2 |
| eso/ingles | 2 (falsos positivos: `mistake` = "Error." es legítimo) |
| eso/biologia, eso/historia, eso/musica, eso/plastica, eso/latin (cubierto), primaria/lengua | 1 cada |

**Concentración temporal**: prácticamente todo en **6º Primaria** y **2º ESO**, lo que confirma que fue una tanda de generación específica que se quedó sin pulir.

## Estrategia

Para cada entrada:
1. **Mantengo la `solution`** (la palabra elegida está bien).
2. **Reescribo la `definition`** desde cero para que describa correctamente la `solution`.
3. **Mantengo el `type`** (`empieza`/`contiene`).

No genero nuevas entradas, no borro nada. Son 58 `UPDATE` que **no afectan a la jugabilidad** del rosco (siguen siendo las mismas posiciones), solo arreglan el contenido de la pregunta.

## Casos especiales / decisiones tomadas

- **id 18931** `eso/fisica/4 K`: `solution='k'` (una sola letra). Es válido para la letra K en física como símbolo de la constante de Boltzmann o constante de equilibrio. Mantengo. Reescribo definición.
- **id 18934** `eso/fisica/4 K`: `solution='sklodowska'` (apellido de soltera de Marie Curie, contiene K en `sklodowska`). Mantengo, reescribo.
- **id 14887** `primaria/tutoria/6 Ñ`: `solution='empeño'` def `'(contiene la Ñ - No existe).'` — el autor pensó que Ñ no existía pero `empeño` sí la tiene. Solo limpiar.
- **id 14931, 14934**: en tutoría, `solution='show'` para letra W y `solution='kiwi'` para letra W, ambas con definiciones absurdas porque buscaban palabras de "kindness/amabilidad". Reescribo a definiciones literales.
- **id 14452** `link` (programación): la solución `link` es correcta para K. Reescribir.
- **Falsos positivos**: ids **21755** y **22286** (`mistake = Error.`) NO son anotaciones, es la traducción literal. **No los toco.**
- **Ya cubiertos**: 23620, 23888, 23965, 23972 (Mat ESO), 31422 (Latín ESO), 23420 (Lengua ESO 4) — están en sus respectivos `.sql` previos. **No los toco aquí.**

## Salida

SQL en [global-anotaciones.sql](global-anotaciones.sql) con **109 `UPDATE`** (58 del primer grep + 51 de la ampliación con `Buscamos:`/`Usarem:`/`(no).`/`trampa)`).

Distribución final:

| Asignatura | Total |
|---|---|
| primaria/ciencias-sociales | 21 |
| primaria/ciencias-naturales | 14 |
| primaria/valenciano | 14 |
| primaria/matematicas | 9 |
| primaria/programacion | 13 |
| primaria/lengua | 7 |
| primaria/tutoria | 7 |
| primaria/ingles | 5 |
| primaria/frances | 1 |
| eso/fisica | 4 |
| eso/historia | 1 |
| eso/biologia | 1 |
| eso/musica | 1 |
| eso/plastica | 1 |
| eso/tecnologia | 0 (28568 era falso positivo: `not` = puerta lógica NOT) |
| Ya cubiertos en SQL previos | 6 (eso/lengua, eso/latin, eso/matematicas) |

**Total reescrito**: 109 `UPDATE` que tocan ~109 entradas.

Tras aplicar este SQL + los anteriores, las 17 asignaturas restantes que aún no he revisado a fondo seguirán teniendo otros bugs (reclasificaciones, definiciones imprecisas), pero al menos **estarán libres del bug sistémico de las anotaciones internas**, que es el más grave porque convierte la pregunta en injugable.
