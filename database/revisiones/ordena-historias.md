# Revisión: Ordena Historias

Estado actual:

| Métrica | Valor |
|---|---|
| Total historias | 3.848 |
| Frases por historia | 3 a 5 |
| Asignaturas | 27 (18 ESO + 9 Primaria) |

## Resultado del grep global

| Categoría | Resultado |
|---|---|
| Anotaciones internas del autor | **0** |
| Frases vacías o nulas | 0 |
| Historias con frases duplicadas internamente | 0 |
| Frases con espacios al inicio/final | 0 |
| Caracteres extraños | 0 (28 son `%` legítimos en matemáticas) |
| Caracteres españoles en inglés | 0 |
| **Historias duplicadas exactas** | **240** |

## Bug crítico: 240 historias duplicadas

**3 asignaturas afectadas, todas en 1º ESO:**

| Asignatura | Total slice | Sobrantes | Patrón |
|---|---|---|---|
| ESO Plástica 1º | 100 entradas | 80 sobrantes | 20 historias distintas duplicadas hasta 5 veces cada una |
| ESO Tecnología 1º | 100 | 80 | igual patrón |
| ESO Tutoría 1º | 100 | 80 | igual patrón |

Es claramente un **bug del generador automático**: produjo el mismo lote de 20 historias 5 veces para cada una de estas 3 asignaturas en 1º ESO.

Tras el SQL: 1º ESO Plástica/Tecnología/Tutoría quedará con **20 historias** (no 100). Esto es **menos contenido** del que tiene el resto de cursos de esas asignaturas (40 cada uno). Recomendación posterior: regenerar contenido para llegar a las 40 historias en 1º ESO.

## Cambios totales

| Acción | Cantidad |
|---|---|
| Borrar historias duplicadas | 240 |

**Total**: 240 deletes (~6,2% del total).

---

## Conclusión Ordena Historias

La app está **muy limpia** salvo por este bug masivo de duplicados en 1º ESO de 3 asignaturas. **Sin anotaciones internas, sin placeholders, sin frases mal formadas**. Una vez aplicado el SQL, queda completamente sana.

---

SQL en [ordena-historias.sql](ordena-historias.sql).
