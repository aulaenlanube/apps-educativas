# Revisión: Ordena la Frase · Duplicados globales (Fase 1)

## Resultado del grep global

Sobre las 7.814 frases de `ordena_frases`:

| Métrica | Valor |
|---|---|
| Anotaciones internas reales | **0** (2 falsos positivos) |
| Frases muy cortas / vacías | 0 |
| Frases en una sola palabra | 0 |
| Frases con minúsculas raras | 0 |
| **Frases duplicadas exactas** | **25 grupos**, **43 registros sobrantes** |

## Distribución de duplicados por asignatura

| Asignatura | Grupos duplicados | Sobrantes |
|---|---|---|
| ESO Valencià 3º | 6 grupos | 25 |
| ESO Francés 2º | 5 grupos | 8 |
| Otras asignaturas (CCSS, Mat, Bio, IA) | varios grupos pequeños | 10 |

## Fase 1 — SQL de borrado

[ordena-frases-duplicados.sql](ordena-frases-duplicados.sql) borra **43 IDs** (mantiene el ID más bajo de cada grupo). Operación segura: solo elimina copias exactas, no toca contenido único.

Tras aplicar:
- Total esperado: 7.814 - 43 = **7.771 frases**.
- ESO Valencià 3º quedará con 41 frases (de 66 actuales, perdiendo las 25 duplicadas).
- ESO Francés 2º quedará con 53 frases.

Estas asignaturas quedarán con menos de 50 frases en algunos cursos. **Recomendación posterior** (Fase 3): generar frases nuevas para Valencià 3º y Francés 2º para llegar al rango ~90-100 que tienen los demás cursos.

---

## Próximos pasos

- **Fase 1**: aplicar este SQL.
- **Fase 2**: revisión cualitativa asignatura por asignatura (lectura humana de las frases).
- **Fase 3**: añadir punto final a las 74 frases sin puntuación + generar frases nuevas para Valencià 3º y Francés 2º.
