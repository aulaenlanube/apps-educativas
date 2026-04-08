# Revisión: Primaria · Matemáticas

Estado actual del slice (`level=primaria`, `subject_id=matematicas`, 828 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º | 135 | 100 | 35 | 0 |
| 2º | 135 | 88 | 46 | 1 |
| 3º | 135 | 77 | 55 | 3 |
| 4º | 135 | 71 | 60 | 4 |
| 5º | 147 | 66 | 78 | 3 |
| 6º | 141 | 36 | 93 | 12 |

Distribución progresiva ejemplar. Ñ correcta. Sin placeholders masivos, sin mayúsculas truncadas.

**Diagnóstico**: asignatura **estructuralmente sana** como Primaria Lengua. Los bugs son:
- 5 duplicados (todos con definiciones distintas — diferenciar o borrar)
- 2 anotaciones internas adicionales no detectadas en el grep global (`14147 trazar`, parte de `14195 cuentas`)
- ~28 definiciones autorreferenciales o circulares
- Numerosas definiciones cortas que aunque legítimas (`Número 80`, `Mil gramos`) podrían enriquecerse — no las toco (no son bugs)

---

## 🔴 Bugs

### 1. Anotaciones internas no detectadas en grep global

| id | curso | actual | corrección |
|---|---|---|---|
| **14147** | 5º | `trazar` Z def `'Instrumento para trazar arcos (contiene la Z, erróneo es con C). Busquemos: Trazar.'` — anotación filtrada + def absurda (un compás traza arcos, no se llama "trazar") | reescribir def `'Verbo: dibujar líneas o figuras (contiene Z).'` |
| 14195 | 6º | `cuentas` J def `'... (coloquial: hacer las...)'` — paréntesis con anotación coloquial parcial | reescribir def `'Operaciones matemáticas básicas: sumas, restas, multiplicaciones (contiene J en con-jun-to... mal).'` → mejor: `'Operaciones aritméticas (contiene J en cuenta).'` ❌ — `cuentas` no contiene J. **Borrar entrada.** |

### 2. Duplicados

| id | curso | letra | solución | acción |
|---|---|---|---|---|
| 14002, 14007 | 5º | A | área | borrar 14007 |
| 14009, 14011 | 5º | B | base | mantener ambas (defs distintas: lado del polígono / número de potencia) |
| 14061, 14062 | 5º | K | kilo | borrar 14062 (def "nombre común del kilogramo" — duplica) |
| 14078, 14083 | 5º | Ñ | año | borrar 14083 |
| 14244, 14246 | 6º | R | recta | borrar 14246 (def "lado de un polígono" es errónea: el lado es un segmento, no recta) |

### 3. Definiciones autorreferenciales o circulares

| id | curso | actual | corrección |
|---|---|---|---|
| 13675 | 2º | `ochenta` def `'Número ochenta.'` | `'Ocho veces diez.'` |
| 13699 | 2º | `treinta` def `'Número treinta.'` | `'Tres veces diez.'` |
| 13768 | 3º | `horizontal` def `'Línea horizontal que va de lado a lado.'` | `'Línea paralela al horizonte.'` |
| 13769 | 3º | `ochenta` def `'Número ochenta.'` | `'Ocho veces diez.'` |
| 13799 | 3º | `noventa` def `'Número noventa.'` | `'Nueve veces diez.'` |
| 13800 | 3º | `cincuenta` def `'Número cincuenta.'` | `'Cinco veces diez.'` |
| 13803 | 3º | `otoño` def `'Estación del otoño.'` | `'Estación del año entre el verano y el invierno (contiene Ñ).'` |
| 13816 | 3º | `quince` def `'Número quince.'` | `'Diez más cinco.'` |
| 13820 | 3º | `pequeño` def `'Sinónimo de pequeño.'` | `'Adjetivo: de poco tamaño (contiene Q).'` |
| 13834 | 3º | `treinta` def `'Número treinta.'` | `'Tres veces diez.'` |
| 13879 | 4º | `cien` def `'Número formado por cien unidades.'` | `'Diez veces diez.'` |
| 13880 | 4º | `capacidad` def `'Capacidad de contener algo.'` | `'Cantidad que cabe en un recipiente, medida en litros.'` |
| 13940 | 4º | `añadir` def `'Acción de añadir (contiene la Ñ).'` | `'Verbo: sumar o agregar algo (contiene Ñ).'` |
| 13979 | 4º | `veces` def `'Número que indica la veces que se repite algo.'` | `'Cantidad de repeticiones de una acción.'` |
| 13994 | 4º | `rayas` def `'Rayas paralelas del sol.'` | `'Líneas rectas paralelas (contiene Y).'` |
| 13997 | 4º | `trazar` def `'Trazar una línea con regla.'` | `'Verbo: dibujar líneas con un instrumento (contiene Z).'` |
| 14191 | 6º | `capacidad` def `'Capacidad de un recipiente para contener líquidos, medida en litros.'` (contiene la respuesta) | `'Magnitud que indica cuánto líquido cabe en un recipiente.'` |
| 14260 | 6º | `universo` def `'Conjunto que contiene todos los elementos de estudio (Universo u...).'` (da pista) | `'Conjunto que contiene todos los elementos posibles de un experimento.'` |

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1º | 0 | 0 |
| 2º | 0 | 2 |
| 3º | 0 | 8 |
| 4º | 0 | 6 |
| 5º | 4 (área, kilo, año, trazar) | 1 (trazar) |
| 6º | 2 (recta, cuentas) | 2 (capacidad, universo) |

**Total**: 6 deletes + 19 updates.

---

SQL en [primaria-matematicas.sql](primaria-matematicas.sql).
