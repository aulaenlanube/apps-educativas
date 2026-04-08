# Revisión: Primaria · Ciencias Naturales

Estado actual del slice (`level=primaria`, `subject_id=ciencias-naturales`, 800 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º | 125 | 88 | 36 | 1 |
| 2º | 125 | 74 | 48 | 3 |
| 3º | 125 | 66 | 53 | 6 |
| 4º | 125 | 58 | 62 | 5 |
| 5º | 156 | 38 | 109 | 9 |
| 6º | 144 | 17 | 110 | 17 |

Distribución progresiva ejemplar. Ñ correcta. **Sin placeholders masivos, sin mayúsculas truncadas**. Asignatura **estructuralmente sana**.

**Diagnóstico**: bugs mínimos:
- 1 duplicado (`vatio` 5º W)
- 11 definiciones autorreferenciales/circulares (las otras 15 ya están en `global-anotaciones.sql`)

---

## 🔴 Bugs

### 1. Duplicado

| id | curso | letra | solución | acción |
|---|---|---|---|---|
| 10700, 10704 | 5º | W | vatio | El primero (`empieza`) está mal: vatio empieza por V, no W. Borrar 10700 y mantener 10704 (`contiene`) |

### 2. Definiciones autorreferenciales

| id | curso | actual | corrección |
|---|---|---|---|
| 10278 | 2º | `líquido` def `'Líquido de las flores.'` | `'Néctar de las flores (contiene Q).'` ❌ — `líquido` no contiene Q. La def del autor era de **néctar**. **Renombrar** a `solution='néctar'`, def `'Líquido dulce que producen las flores.'` letra N. ❌ ya está en N. **Borrar.** |
| 10291 | 2º | `tronco` def `'Tronco grueso de un árbol.'` | `'Parte alargada y gruesa que sostiene las ramas del árbol.'` |
| 10315 | 2º | `zumo` def `'Zumo que sale al exprimir.'` | `'Líquido que sale al exprimir una fruta (contiene Z).'` |
| 10343 | 3º | `estado` def `'Estado del agua cuando hace mucho frío.'` | `'Forma en la que se encuentra el agua (sólido, líquido, gas).'` |
| 10392 | 3º | `olfato` def `'Sentido del olfato.'` | `'Sentido que nos permite percibir los olores.'` |
| 10403 | 3º | `bosque` def `'Sinónimo de bosque.'` | `'Lugar lleno de árboles donde viven muchos animales (contiene Q).'` |
| 10481 | 4º | `hielo` def `'Agua de hielo.'` | `'Agua en estado sólido.'` |
| 10528 | 4º | `máquina` def `'Máquina de calor (contiene la Q).'` | `'Aparato que realiza un trabajo (contiene Q).'` |
| 10548 | 4º | `refugio` def `'Lugar de refugio (contiene la U).'` | `'Lugar seguro donde protegerse del peligro (contiene U).'` |
| 10564 | 4º | `zumo` def `'Zumo.'` | `'Líquido obtenido al exprimir una fruta (contiene Z).'` |
| 10623 | 5º | `jabón` def `'Materia grasa para fabricar jabón.'` | `'Producto que sirve para limpiar y desinfectar (contiene J).'` |
| 10651 | 5º | `daño` def `'Daño que causamos al medio ambiente (contiene la Ñ).'` | `'Perjuicio o destrucción causada al entorno (contiene Ñ).'` |

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1º | 0 | 0 |
| 2º | 1 (líquido) | 2 |
| 3º | 0 | 3 |
| 4º | 0 | 4 |
| 5º | 1 (vatio empieza) | 2 |
| 6º | 0 | 0 (todo en global) |

**Total**: 2 deletes + 11 updates.

---

SQL en [primaria-ciencias-naturales.sql](primaria-ciencias-naturales.sql).
