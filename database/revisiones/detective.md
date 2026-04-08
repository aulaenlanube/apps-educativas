# Revisión: Detective Sentences

Estado actual:

| Métrica | Valor |
|---|---|
| Total frases | 3.388 |
| Asignaturas | 14 (5 ESO + 9 Primaria) |

Subset de Ordena Frases — solo asignaturas de idiomas, lengua, matemáticas, ciencias y técnicas. Mismo schema (frase plana). El alumno debe encontrar las palabras dentro de la frase pegada (sin espacios).

## Resultado del grep global

| Categoría | Resultado |
|---|---|
| Anotaciones internas reales | **0** (1 falso positivo: `buscamos` legítimo) |
| Frases vacías o cortas | 0 |
| Caracteres extraños | 0 |
| Dobles espacios | 0 |
| Frases con minúsculas raras | 0 |
| **Espacios al inicio/final** | **5** (todas en ESO Francés) |
| **Duplicados exactos** | **43** (34 ESO Valencià + 9 ESO Francés) |

**Mismo patrón que Ordena Frases**: las mismas asignaturas afectadas con bugs casi idénticos. Sospecho que **Detective Sentences se generó copiando contenido de Ordena Frases**, y heredó los mismos bugs antes de que Ordena Frases fuera limpiado en la Fase 1.

## Cambios

| Acción | Cantidad |
|---|---|
| Borrar duplicados | 43 |
| Trim de espacios sobrantes | 5 |

**Total**: 48 cambios.

## Conclusión

Detective Sentences está **en el mismo estado que estaba Ordena Frases antes de la Fase 1**. Una vez aplicado este SQL queda completamente sano.

---

SQL en [detective.sql](detective.sql).
