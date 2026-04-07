# Revisión: ESO · Tecnología

Estado actual del slice (`level=eso`, `subject_id=tecnologia`, 1.083 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 272 | 132 | 135 | 5 |
| 2º ESO | 271 | 133 | 130 | 8 |
| 3º ESO | 270 | 113 | 61 | **96** |
| 4º ESO | 270 | 111 | 138 | 21 |

**Diagnóstico**: 1º, 2º y 4º ESO están en buen estado. **3º ESO Tecnología es un desastre catastrófico**: de las 270 entradas, **~190 son placeholders** con `solution` repetido por letra y definiciones que describen palabras correctas distintas. Es el único caso de toda la revisión donde el contenido del curso completo está prácticamente roto. La distribución de difficulty (96 difíciles sobre 270) ya delata el problema: el generador marcó como "difíciles" todas las entradas placeholder.

---

## 🔴🔴 3º ESO · BUG SISTÉMICO MASIVO

El generador automático produjo, en cada letra del rosco, **una entrada legítima + 5-9 entradas placeholder** con la misma `solution` repetida. Las definiciones describen palabras correctas (resistencia, viga, latón, transformador…) pero la `solution` es siempre el mismo placeholder por letra:

| Letra | Placeholder repetido | Entradas placeholder a borrar |
|---|---|---|
| A | `agua` | 4 |
| B | `banio maria` | 8 |
| C | `capa de ozono` | 5 |
| D | `dioxido de carbono` | 6 |
| E | `energia no renovable` | **10 (todas)** |
| F | `frecuencia cardiaca` | 4 |
| G | `gato` | 9 |
| H | `homo sapiens` | 7 |
| I | `isla` | **9 (todas salvo `inercia`)** |
| J | `juegos olimpicos` | 9 |
| K | `kilo` | 7 |
| L | `lugar geometrico` | 7 |
| M | `mano alzada` | 8 |
| N | `numero atomico` | **10 (todas)** |
| Ñ | `mañana` | **10 (todas)** |
| O | `ojo` | 9 |
| P | `presion de grupo` | 6 |
| Q | `queso` | **10 (todas)** |
| R | `rosa de los vientos` | 7 |
| S | `sol` | 8 |
| T | `toma de decisiones` | 6 |
| U | `uno` | **10 (todas)** |
| V | `vaso de precipitados` | 7 |
| W | `kiwi` | 9 |
| X | `examen` | **10 (todas)** |
| Y | `espacios y lineas` | **10 (todas)** |
| Z | `zona` | **10 (todas)** |

**Total a borrar: ~196 entradas**.

Tras el borrado, **8 letras quedarán vacías** (E, N, Ñ, Q, U, X, Y, Z) — el generador ni siquiera produjo entradas legítimas para ellas. El rosco de 3º ESO Tecnología quedará reducido a ~74 entradas en 19 letras.

### Decisión: borrar todo + insertar contenido nuevo

Se borran los ~196 placeholders **y** se insertan **70 entradas nuevas** con vocabulario tecnológico real de 3º ESO LOMLOE para rellenar las 8 letras vacías y reforzar las 14 letras con menos de 5 entradas. Tras el SQL, el curso queda con **~144 entradas válidas en las 27 letras**, perfectamente jugable.

**Inserciones nuevas por letra** (~5 mínimo en cada una):

| Letra | Nuevas | Palabras añadidas |
|---|---|---|
| B | +3 | bombilla, broca, biela |
| D | +1 | diagrama |
| **E** | **+5** | estructura, esfuerzo, engranaje, electricidad, escala |
| G | +4 | generador, grafito, giro, grados |
| H | +2 | hardware, herramienta |
| I | +4 | interruptor, intensidad, internet, impresora |
| J | +4 | julio, joystick, juego, junta |
| K | +3 | kelvin, kilobyte, kit |
| L | +2 | lubricante, ladrillo |
| M | +3 | motor, madera, mecanismo |
| **N** | **+5** | nube, neumática, navegador, neutro, nodo |
| **Ñ** | **+5** | piñón, diseño, estaño, pestaña, señal |
| O | +4 | ordenador, onda, óxido, objeto |
| **Q** | **+5** | esquema, máquina, arquitectura, bloque, etiqueta (todas `contiene Q`) |
| R | +2 | rozamiento, robot |
| S | +2 | sensor, software |
| **U** | **+5** | usb, unión, usuario, unidad, utilidad |
| V | +2 | velocidad, voltio |
| W | +4 | wifi, web, windows, word |
| **X** | **+5** | píxel, mixto, conexión, flexible, hexagonal (todas `contiene X`) |
| **Y** | **+5** | proyecto, ensayo, ley, rayo (`contiene Y`) + yunque (`empieza`) |
| **Z** | **+5** | zócalo, zumbador (`empieza`) + pinza, pieza, lápiz (`contiene Z`) |

**Total: 70 inserts** (en negrita las 8 letras antes vacías).

Vocabulario alineado con LOMLOE 3º ESO Tecnología: materiales, estructuras, mecanismos, electricidad/electrónica básica, energías, dibujo técnico, programación básica, robótica básica, internet/redes.

---

## 1º ESO

Limpio. Bugs menores:

| id | problema | corrección |
|---|---|---|
| 27713 | `Junta` mayúscula J duplica con 27714 `junta` | borrar 27713 |
| 27730, 27731 | 2x `kilo` K — 27731 def 'Nombre del metal Ni' (níquel, no K) | borrar 27731 |
| 27802 | `níquel` Q def `'Metal resistente a la corrosión (contiene Q).'` — `níquel` no contiene Q | borrar (no encaja en Q) |

---

## 2º ESO

Limpio. Bugs menores:

| id | problema | corrección |
|---|---|---|
| 28000, 28001, 28002 | 3x `kilo` K — 28001 (coque), 28002 (níquel) | borrar 28001 y 28002 |
| 28007 | `Ley` mayúscula L duplica con 28008 `ley de ohm` | borrar 28007 |
| 28073 | `níquel` Q def `'Metal Ni (contiene Q).'` — níquel no tiene Q | borrar |

---

## 4º ESO

Muy limpio. Bugs menores:

| id | problema | corrección |
|---|---|---|
| 28608 | `queso` Q def `'Base de montaje electrónica (Pla...a, contiene Q).'` describe **placa** | renombrar a `solution='placa'`, def `'Base de montaje electrónica (contiene Q).'` ❌ — `placa` no contiene Q. **Borrar.** |
| 28610 | `queso` Q def `'Ciclos por segundo (Fre...uencia, contiene Q).'` describe **frecuencia** (sí contiene Q) | renombrar a `solution='frecuencia'` |

---

## Resumen de cambios

| Curso | Bugs (delete) | Bugs (update) | Inserts |
|---|---|---|---|
| 1º | 3 | 0 | 0 |
| 2º | 4 | 0 | 0 |
| 3º | **~196 (borrado masivo)** | 0 | **70 nuevas** |
| 4º | 1 | 1 | 0 |

**Total**: ~204 deletes + 1 update + 70 inserts.

---

## Estado del rosco tras aplicar el SQL

- **1º, 2º, 4º**: jugables, ~270 entradas válidas cada uno.
- **3º ESO**: ~144 entradas en las **27 letras completas**. Jugable y con vocabulario tecnológico real LOMLOE.

---

SQL en [eso-tecnologia.sql](eso-tecnologia.sql). **No se aplica nada hasta tu visto bueno.**
