# Revisión: Ordena Frases · Fase 2 · Bugs cualitativos globales

## Estado tras Fase 1

- 7.771 frases (de 7.814 originales, -43 duplicados borrados).
- 0 anotaciones internas reales.
- 0 placeholders masivos.

## Hallazgos Fase 2

### 1. Espacios al final de la frase (4 entradas)

ESO Francés 2º — 4 frases con espacio sobrante al final:

| id | sentence (con espacio final) |
|---|---|
| 3711 | `Le professeur explique la différence entre « être » et « avoir ». ` |
| 3714 | `J'ai besoin d'un rappel sur l'orthographe du mot « accident ». ` |
| 3726 | `J'ai besoin d'une petite aide pour comprendre l'accord du participe passé avec « avoir ». ` |
| 3729 | `Le professeur explique comment écrire correctement l'accord du participe passé après avoir utilisé le verbe « être ». ` |

Cosmético pero limpio de hacer.

### 2. Frases compartidas entre cursos (NO son bugs)

| Subject | Grades compartidos | Frases | ¿Bug? |
|---|---|---|---|
| Primaria Programación | 1,2,3,4,5,6 (todas) | 50 | ❌ Diseño: 50 frases para 6 cursos |
| ESO Inglés | 3,4 | 97 | ❌ Diseño |
| ESO Lengua | 1,2 | 3 frases | ❌ Diseño/coincidencia |
| ESO Matemáticas | 1,2 | 3 | ❌ Diseño |
| ESO Música | 1,2 | 1 | ❌ Diseño |
| ESO Tecnología | 1,2 | 1 | ❌ Diseño |

Estas frases tienen `grades` con varios cursos a la vez (no son duplicados). El generador deliberadamente las puso para varios cursos. **No requieren acción**.

### 3. Caracteres especiales legítimos (3 entradas)

| id | subject | sentence |
|---|---|---|
| 5412 | matemáticas | `Un intervalo cerrado [a, b] incluye los extremos a y b.` (corchetes legítimos) |
| 5801 | música | `El soul es un género que fusiona el R&B con la intensidad del góspel.` (& legítimo) |
| 5858 | música | `El 'rhythm and blues' (R&B) es un precursor del rock and roll.` (& legítimo) |

**No son bugs** — los caracteres son contextualmente correctos.

### 4. Frases muy cortas (26) y muy largas (32)

- Las cortas son francés A1 ("Le soleil brille.", "L'oiseau chante.") — **válidas** para introducir verbo+sujeto en idiomas extranjeros.
- Las largas son leyes/teoremas (Pitágoras, Newton) — **válidas** para 4º ESO.

**No requieren acción.**

---

## Resumen Fase 2

| Acción | Cantidad |
|---|---|
| Trim de espacios sobrantes | 4 frases |

**Total**: 4 updates. Es la fase de cambios más pequeña de toda la revisión.

---

## Conclusión Ordena Frases

La app **"Ordena Frases" está extraordinariamente limpia** comparada con el rosco:

- **Fase 1**: 43 duplicados borrados.
- **Fase 2**: 4 trim de espacios.

**Total: 47 cambios sobre 7.814 frases (~0,6%)** vs ~10% del rosco.

La calidad del contenido sugiere que las frases fueron **escritas a mano** (no generadas automáticamente con un patrón roto como el rosco). No detecto:
- ❌ Anotaciones internas del autor
- ❌ Placeholders masivos
- ❌ Mayúsculas truncadas
- ❌ Definiciones autorreferenciales
- ❌ Frases sin sentido
- ❌ Idiomas mezclados

**Sin necesidad de revisión asignatura por asignatura.** El grep global ya detectó todo lo que había.

---

SQL en [ordena-frases-fase2.sql](ordena-frases-fase2.sql).
