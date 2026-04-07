# Revisión: ESO · Matemáticas

Estado actual del slice (`level=eso`, `subject_id=matematicas`, 1.091 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 273 | 129 | 136 | 8 |
| 2º ESO | 278 | 118 | 149 | 11 |
| 3º ESO | 270 | 109 | 155 | 6 |
| 4º ESO | 270 | 105 | 157 | 8 |

**Ñ**: poblada en los 4 cursos. Distribución de dificultad razonable.

**Diagnóstico general**: la asignatura tiene buena estructura de conceptos por curso (1º aritmética/geometría básica, 2º álgebra, 3º trigonometría/funciones, 4º cálculo avanzado), pero **1º y 2º ESO están seriamente contaminados por bugs sistémicos**: placeholders, anotaciones internas filtradas y duplicados masivos. **3º y 4º ESO están limpios** salvo el bug del "examen X".

---

## 🔴 BUGS CRÍTICOS SISTÉMICOS (1º y 2º ESO)

### 1. Letra Z: 14 entradas placeholder rotas

En 1º ESO **6 entradas** (ids 23780-23785) y en 2º ESO **6 entradas** (ids 24059-24064) tienen `solution='diez'` con definición idéntica `'Número que contiene la letra Z (ej: diez).'` — placeholder repetido literalmente.

Tras el SQL, la letra Z queda con 4 entradas legítimas en 1º ESO (`azar`, `raíz`, `zigzag`, `zona`) y 4 en 2º (`azar`, `raíz`, `zigzag`, `zona`). El rosco se adapta automáticamente al menor número de entradas (verificado en el SQL de inglés: el hook agrupa por letras presentes).

**Decisión**: borrar los placeholders. Como mejora futura, conviene **insertar palabras matemáticas con Z** (`pizarra`, `decena` no, `rozamiento`, `desplazamiento`, `fuerza`, `tiza` — varias ya están en 3º/4º). Lo dejo como TODO.

### 2. Letra K: múltiples `kilo` con definiciones absurdas o anotaciones internas

| id | curso | def actual | acción |
|---|---|---|---|
| 23619 | 1º | `Fórmula popular para área del triángulo (Base por...).` | borrar (def describe base×altura) |
| 23620 | 1º | `Medida de superficie agraria (contiene K, es Hectárea, difícil con K). Usaremos: Kilo.` | borrar (anotación interna del autor) |
| 23623 | 1º | `Mil gramos (empieza por K).` | borrar (duplica con 23614) |
| 23892 | 2º | `Área de 100x100 metros (contiene K, es Hectárea).` | borrar (anotación interna) |
| 23898 | 2º | `Nombre común del kilogramo.` | borrar (duplica con 23891) |

Tras el borrado, K queda con: `kilo`, `kilogramo`, `kilolitro`, `kilobyte`, `kilómetro`, `karate`, `kiwi` en 1º; y similares en 2º. Suficiente para componer rosco.

### 3. Otras anotaciones internas filtradas (mismo patrón Latín/Lengua)

| id | curso | def actual | corrección |
|---|---|---|---|
| 23888 | 2º | `Símbolos de agrupación ( ) (contiene J, errata, son paréntesis). Usaremos: Ejemplo.` | reescribir como `solution='paréntesis'` def `'Símbolos de agrupación matemática (contiene J: parénte... no, mejor: ). (contiene J)'` → mejor: `solution='ejemplo'` def `'Caso concreto que ilustra una regla matemática (contiene J).'` |
| 23965 | 2º | `Resto de la división (contiene Q? No, empieza por R). Use: Izquierda.` | duplica con 23966 — borrar |
| 23972 | 2º | `Medida de peso (contiene Q? no). Use: Arquímedes.` | reescribir def `'Famoso matemático griego de Siracusa (contiene Q).'` |

### 4. Otros duplicados a eliminar

| id | curso | duplicado de | acción |
|---|---|---|---|
| 23653 | 1º | 23652 (nonágono) | borrar |
| 23663 | 1º | 23662 (mañana Ñ) | borrar |
| 23757 | 1º | 23756 (x) | borrar (mismo eje X) |
| 23920 | 2º | 23916 (múltiplo) | borrar |
| 23976 | 2º | 23975 (regla de tres) | borrar |
| 23966 | 2º | 23965 (izquierda) | borrar (después de borrar 23965 por anotación) — **conflicto**: borrar primero 23965, dejar 23966 |
| 23845 | 2º | 23838 (función) | borrar |
| 23853 | 2º | 23849 (grado) | mantener (definiciones distintas, OK) |
| 23805 | 2º | 23799 (base) | mantener (definiciones distintas) |
| 23532 | 1º | 23524 (base) | mantener (definiciones distintas) |

**Resolución letra Q en 2º**: borro 23965 (anotación interna) y mantengo 23966 (def correcta).

### 5. Letra X: bug `examen` repetido en los 4 cursos

| id | curso | def actual |
|---|---|---|
| 22945 | (Lengua 2º — ya cubierto) | — |
| 24310 | 3º Mat | `Línea de referencia (contiene X, E... de coordenadas).` — describe `eje`, no `examen` |
| 24580 | 4º Mat | `Línea de referencia (contiene X, E... de coordenadas).` — mismo bug |

**Corrección**: cambiar `solution` a otra palabra matemática con X. Ya tienen `hexágono`, `máximo`, `mixto`, `sexto`, `próximo`, `extremo`, `exponente`, `exacto`, `convexo`, `aproximación`. Falta una "X" inicial real. Propongo: `solution='axial'` def `'Que se refiere a un eje (contiene X).'`

### 6. Otros bugs menores

| id | curso | problema | corrección |
|---|---|---|---|
| 23735 | 1º | `valor absoluto` con def que da pista entre paréntesis | reescribir def `'Distancia de un número al cero, siempre positivo.'` |
| 23844 | 2º | `fúncion lineal` (con tilde mal puesta) | `función lineal` |
| 23899 | 2º | `kilómetros` (plural) | `kilómetro` |
| 23653 | 1º | def repite "Nonágono" entre paréntesis | borrar (duplicado) |

---

## 🟠 Reclasificaciones de dificultad

Pocas en matemáticas porque la distribución ya es razonable. Solo conceptos mal categorizados:

**1º ESO bajar `3 → 2`**:
- 23535 cuadrilátero (es básico, no más difícil que rectángulo)
- 23536 circunferencia (concepto básico de geometría)
- 23601 intersección (concepto básico)
- 23719 transportador (instrumento, no concepto)
- 23690 equivalentes

**1º ESO bajar `3 → 1`**:
- 23635 multiplicación (operación básica desde Primaria)

**2º ESO bajar `3 → 2`**:
- 23802 bidimensional
- 23814 cuadrilátero
- 23809 circunferencia
- 23912 multiplicación
- 24002 transportador
- 23964 equivalentes

**3º ESO bajar `3 → 2`**:
- 24086 circunferencia
- 24189 multiplicación
- 24308 aproximación

**4º ESO bajar `3 → 2`**:
- 24356 circunferencia
- 24459 multiplicación
- 24578 aproximación

**Mantener difíciles**: factorización, regla de tres, lugar geométrico, probabilidad, combinatoria, trigonometría, distributiva, intersección (en cursos avanzados), desplazamiento.

---

## Resumen de cambios

| Curso | Bugs (delete) | Bugs (update) | Reclasificaciones |
|---|---|---|---|
| 1º | 8 (placeholders Z + duplicados K/N/Ñ/X) | 1 (valor absoluto) | 6 |
| 2º | 9 (placeholders Z + duplicados K/F/M/Q/R) | 4 (anotaciones + función lineal) | 6 |
| 3º | 0 | 1 (examen X) | 3 |
| 4º | 0 | 1 (examen X) | 3 |

**Total**: ~42 cambios sobre 1.091 entradas (~3,8%). Pero incluye **17 deletes** de placeholders/duplicados, que son los más impactantes en la jugabilidad.

## TODO de creación (no incluido en SQL)

- **Letra Z en 1º y 2º ESO**: tras borrar placeholders quedan 4 entradas. Conviene insertar 4-6 palabras matemáticas reales con Z: `pizarra`, `tiza`, `mezcla`, `trazar`, `desplazar`, `azaroso`. Lo planteo como segunda fase.
- **Patrón de anotaciones del autor filtradas**: ya van **3 asignaturas afectadas** (Latín, Lengua, Matemáticas). Confirmo el TODO global de hacer un grep ampliado:
  ```sql
  SELECT id, subject_id, level, definition FROM rosco_questions
  WHERE definition ~* 'Use:|Usaremos:|errata|\? No\)|\? no\)';
  ```

---

SQL en [eso-matematicas.sql](eso-matematicas.sql). **No se aplica nada hasta tu visto bueno.**
