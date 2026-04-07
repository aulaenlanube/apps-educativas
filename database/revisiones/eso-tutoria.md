# Revisión: ESO · Tutoría

Estado actual del slice (`level=eso`, `subject_id=tutoria`, 1.078 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 274 | 96 | 159 | 19 |
| 2º ESO | 272 | 97 | 161 | 14 |
| 3º ESO | 260 | 106 | 37 | **117** |
| 4º ESO | 272 | 90 | 161 | 21 |

**Diagnóstico**: 1º, 2º y 4º limpios. **3º ESO Tutoría es el caso más extremo de toda la revisión**: solo **23 entradas legítimas de 260** (~9%). Las **27 letras** del rosco tienen placeholders masivos. El curso es prácticamente injugable y necesita regenerarse casi por completo.

---

## 🔴🔴🔴 3º ESO · El peor caso

Las 27 letras tienen 5-10 placeholders cada una con `solution` repetido (`agua`, `banio maria`, `capa de ozono`, `dioxido de carbono`, `energia no renovable`, `frecuencia cardiaca`, `gato`, `homo sapiens`, `isla`, `juegos olimpicos`, `kilo`, `lugar geometrico`, `mano alzada`, `numero atomico`, `mañana`, `ojo`, `presion de grupo`, `queso`, `rosa de los vientos`, `sol`, `toma de decisiones`, `uno`, `vaso de precipitados`, `kiwi`, `examen`, `espacios y lineas`, `zona`). El difíciles=117 ya delata la magnitud (todos los placeholders están marcados como difíciles).

**Entradas legítimas que se mantienen** (solo 23, en 8 letras):
- A: autonomía, asertividad, adicción, aptitud, acoso (5)
- B: bullying, bienestar (2)
- C: colaboración, cáncer (2)
- D: decisión, depresión, dilema, dignidad (4) — borro `dureza` (29284) que es física, no tutoría
- E: empatía, educación, empleo, ética, emocional (5) — borro `ej.` (29292) errata
- M: 0 — borro `marco` (29377) por def errónea
- O: orientación (1)
- T: tolerancia (1)

**Total tras limpieza**: 20 entradas legítimas en 8 letras.

**Plan**: borrar ~240 entradas (placeholders + 3 erratas) e insertar **~150 entradas nuevas** con vocabulario LOMLOE de 3º ESO Tutoría: educación emocional, habilidades sociales, autoestima, asertividad, gestión de conflictos, prevención del bullying, hábitos saludables, técnicas de estudio, orientación vocacional, valores, ciudadanía, igualdad, diversidad.

Tras el SQL: ~170 entradas válidas en 27 letras (5-7 entradas por letra), perfectamente jugable.

---

## Distribución de inserciones

| Letra | Existentes | Nuevas | Palabras añadidas |
|---|---|---|---|
| A | 5 | +2 | amistad, ayuda |
| B | 2 | +5 | bachillerato, brecha, bondad, bullying (refuerzo def), buenismo |
| C | 2 | +6 | comunicación, conflicto, cooperación, ciberacoso, compromiso, confianza |
| D | 4 | +3 | diálogo, diversidad, drogas |
| E | 5 | +3 | esfuerzo, equipo, equidad |
| F | 0 | +6 | familia, felicidad, frustración, futuro, formación, fortaleza |
| G | 0 | +6 | género, grupo, gratitud, generosidad, gestión, guía |
| H | 0 | +6 | hábitos, honestidad, humildad, humor, higiene, humanidad |
| I | 0 | +6 | igualdad, inclusión, identidad, intolerancia, ira, imagen |
| J | 0 | +5 | justicia, juventud, juicio, juego, jactancia |
| K | 0 | +4 | karma, kárate, kit, kilo |
| L | 0 | +6 | libertad, lealtad, liderazgo, límites, ludopatía, lectura |
| M | 0 | +6 | mediación, motivación, mente, mindfulness, madurez, machismo |
| N | 0 | +6 | normas, negociación, naturaleza, novato, noviazgo, nervios |
| Ñ | 0 | +5 | compañero, enseñanza, pequeño, niño, año |
| O | 1 | +5 | objetivo, optimismo, organización, oportunidad, opinión |
| P | 0 | +6 | paz, prejuicio, prevención, proyecto, presión, profesión |
| Q | 0 | +5 | equilibrio, bloqueo, esquema, conquista, etiqueta |
| R | 0 | +6 | respeto, responsabilidad, resiliencia, relajación, riesgo, refuerzo |
| S | 0 | +6 | salud, solidaridad, sentimientos, sociedad, sexualidad, suspenso |
| T | 1 | +5 | tristeza, tutor, timidez, técnicas, trabajo |
| U | 0 | +5 | unión, universidad, urgencia, útil, unidad |
| V | 0 | +6 | valores, voluntad, víctima, vocación, vida, violencia |
| W | 0 | +5 | wifi, whatsapp, web, twitter, workshop |
| X | 0 | +5 | conexión, experiencia, expresión, examen, éxito |
| Y | 0 | +5 | ayuda, apoyo, ensayo, proyecto, yoga |
| Z | 0 | +5 | zona, pereza, pizarra, razón, corazón |

**Total nuevas: ~145 entradas**

---

## 1º, 2º, 4º ESO

Casi limpios:

| Curso | Bug |
|---|---|
| 1º | 28912/28913 `toma de decisiones` T duplicado → borrar 28913 |
| 4º | 29580 `Habilidades` mayúscula H → minúscula |

(Las entradas con `solution=examen, kilo, kiwi, uno` en 1º/2º/4º Tutoría son **legítimas** porque su definición es coherente con el concepto, no placeholders.)

---

## Resumen de cambios

| Curso | Deletes | Updates | Inserts |
|---|---|---|---|
| 1º | 1 | 0 | 0 |
| 2º | 0 | 0 | 0 |
| 3º | ~240 | 0 | **~145** |
| 4º | 0 | 1 | 0 |

---

SQL en [eso-tutoria.sql](eso-tutoria.sql).
