# Revisión: ESO · Física y Química

Estado actual del slice (`level=eso`, `subject_id=fisica`, 1.101 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 272 | 131 | 134 | 7 |
| 2º ESO | 279 | 109 | 157 | 13 |
| 3º ESO | 276 | 119 | 144 | 13 |
| 4º ESO | 274 | 104 | 156 | 14 |

Distribución razonable, Ñ correcta. Definiciones científicamente correctas en general.

**Diagnóstico**: la asignatura está afectada **gravemente por el bug sistémico de la letra K** (igual patrón que Mat y Bio): múltiples entradas con `solution='kilogramo'` cuando la definición describe palabras distintas (níquel, coque, bloque, kinética, kilate del oro…). Además se reproduce el bug **`solution='capa de ozono'`** en 3º y 4º ESO con definiciones de **hercio**. 4 anotaciones internas del autor ya están en `global-anotaciones.sql`.

---

## 🔴 BUGS CRÍTICOS SISTÉMICOS

### 1. Letra K: 9 entradas `kilogramo`/`kilo` rotas en los 4 cursos

| id | curso | def actual | acción |
|---|---|---|---|
| 18101 | 1º | 'Metal magnético de símbolo Ni' (describe níquel) | borrar |
| 18102 | 1º | 'Combustible derivado del carbón' (describe coque) | borrar |
| 18103 | 1º | 'Trozo compacto de material' (describe bloque) | borrar |
| 18099 | 1º | 'Nombre común del kilogramo' — duplica con 18096 | borrar |
| 18379 | 2º | 'Metal de transición Ni' (describe níquel) | borrar |
| 18380 | 2º | 'Combustible sólido' (describe coque) | borrar |
| 18655 | 3º | 'Energía del movimiento (Inglés: Kinetic)' — describe cinética. Ya existe `kinetic` 18936. | borrar |
| 18932 | 4º | 'Energía del movimiento (Cinética...)' — describe cinética. Duplica con 18936 | borrar |
| 18933 | 4º | 'Medida de la pureza del oro' (describe quilate) | borrar |

Tras borrar quedan en cada curso: `kilogramo` (1), `kelvin`, `kilómetro`, `kriptón`, `kepler`, `kilovatio`, `kínética`/cinética, `k` (Potasio), `kraft`, `kefir`, `kinetic`, `eureka`, etc. **Letra K queda con 7-10 entradas legítimas en cada curso** — suficiente.

### 2. `solution='capa de ozono'` en 3º y 4º con definición de hercio

| id | curso | def actual | acción |
|---|---|---|---|
| 18822 | 3º | 'Unidad de frecuencia (Her...io, contiene Z).' | renombrar a `solution='hertz'`, def `'Unidad de frecuencia del Sistema Internacional (símbolo Hz, contiene Z).'` |
| 19096 | 4º | 'Unidad de frecuencia (Her...io, contiene Z).' | mismo fix |

(Bug idéntico al detectado en Historia 1º/2º. Es un patrón del generador.)

### 3. Errata ortográfica en letra K 2º ESO

| id | problema | corrección |
|---|---|---|
| 18376 | `kínética` (tilde mal puesta sobre la i) | `cinética` o `kinética` (sin tilde aguda en la primera i). En realidad la forma castellana es `cinética`, y `kinética` es anglicismo. Mejor: `cinética` y dejar la entrada en letra C... pero entonces no encaja en K. **Decisión**: cambiar a `solution='kinetic'` def `'Energía del movimiento (en inglés, cinética con K).'` para conservar la entrada en K |

---

## Otros bugs por curso

### 1º ESO

| id | problema | corrección |
|---|---|---|
| 18227, 18228 | 2x `watt` W | borrar 18228 |
| 18240 | `extensión` X anotación interna | **ya cubierto en global-anotaciones.sql** |

### 2º ESO

| id | problema | corrección |
|---|---|---|
| 18282, 18283 | 2x `bullir` B | borrar 18283 (ambas describen ebullición; mantener una) |
| 18321, 18326 | 2x `fusión` F | mantener ambas (conceptos distintos: cambio de estado vs nuclear) — **decisión**: cambiar 18326 a `solution='fusión nuclear'` para diferenciar |
| 18406, 18407 | 2x `numero atomico` (sin tilde) N | borrar 18407 + corregir tilde a `número atómico` en 18406 |
| 18405, 18412 | 2x `newton` N (científico vs unidad) | mantener ambas (conceptualmente distintas, pero misma respuesta — verificar). **Decisión**: cambiar 18405 a `solution='isaac'` def `'Nombre del científico inglés Newton (descubridor de la gravedad).'` para diferenciar |
| 18287 | `batería` (anotación interna) | **ya cubierto en global-anotaciones.sql** |
| 18449 | `pequeño` Q (anotación interna) | **ya cubierto en global-anotaciones.sql** |

### 3º ESO

| id | problema | corrección |
|---|---|---|
| 18598, 18606 | 2x `fusión` F (estado vs nuclear) | cambiar 18606 a `solution='fusión nuclear'` |
| 18643, 18646 | 2x `joule` J (efecto vs físico) | cambiar 18646 a `solution='james'` def `'Nombre de pila de Joule, físico inglés de la energía (contiene J).'` |
| **18680** | `Nivel` mayúscula N (truncamiento de "Nivel de energía") | minúscula `nivel` |
| **18686** | `Nube` mayúscula N (truncamiento de "Nube electrónica") | minúscula `nube` |
| **18759** | `Tubo` mayúscula T (truncamiento de "Tubo de ensayo") | minúscula `tubo` |
| 18789 | `browniano` W def correcta — OK | mantener |

### 4º ESO

| id | problema | corrección |
|---|---|---|
| 18930, 18931 | 2x `k` K | mantener 18930 (K = Potasio), borrar 18931 (anotación filtrada — ya cubierto en global-anotaciones.sql, no requiere borrado) |
| 18931 | anotación interna | **ya cubierto en global** |
| 18934 | `sklodowska` anotación | **ya cubierto en global** |
| 19063 | `browniano` W (duplica con 3º) | mantener (cursos distintos) |

---

## Resumen de cambios

| Curso | Bugs (delete) | Bugs (update) |
|---|---|---|
| 1º | 5 (3 kilogramo + 1 kilo + watt) | 0 |
| 2º | 4 (2 kilogramo + bullir + numero atomico) | 4 (kínética → kinetic, número atómico, newton, fusión nuclear) |
| 3º | 1 (kilogramo) | 5 (capa de ozono → hertz, fusión nuclear, james, 3 mayúsculas) |
| 4º | 2 (kilogramo) | 1 (capa de ozono → hertz) |

**Total**: ~22 cambios sobre 1.101 entradas (~2%).

---

## Hallazgos transversales acumulados

Confirmado el patrón **`solution='capa de ozono'` con definición de otra cosa** en 3 asignaturas:
- Historia 1º (cenit) y 2º (Aljafería)
- Física 3º (hercio) y 4º (hercio)

Y el patrón **`solution='kilo/kilogramo'` placeholder en STEM** en 3 asignaturas:
- Matemáticas (1º y 2º)
- Biología (2º y 3º)
- Física (1º, 2º, 3º, 4º)

**Recomendación**: tras terminar las asignaturas restantes, ejecutar un grep global de `solution = 'capa de ozono'` para verificar que no quedan más casos.

---

SQL en [eso-fisica.sql](eso-fisica.sql). **No se aplica nada hasta tu visto bueno.**
