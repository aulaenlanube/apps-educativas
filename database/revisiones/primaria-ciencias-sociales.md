# Revisión: Primaria · Ciencias Sociales

Estado actual del slice (`level=primaria`, `subject_id=ciencias-sociales`, 844 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º | 135 | 73 | 61 | 1 |
| 2º | 135 | 81 | 53 | 1 |
| 3º | 135 | 72 | 63 | 0 |
| 4º | 135 | 67 | 65 | 3 |
| 5º | 154 | 40 | 108 | 6 |
| 6º | 150 | 22 | 107 | 21 |

Distribución progresiva. Ñ correcta. Sin placeholders masivos, sin mayúsculas. **Asignatura estructuralmente sana** pero con **muchas anotaciones internas filtradas adicionales** no detectadas en el grep global, sobre todo en 5º.

---

## 🔴 Bugs

### 1. Anotaciones internas adicionales (no en grep global)

#### 5º — generación con "trampa sonora" defectuosa

Patrón: el autor intentó poner palabras "trampa" donde la pronunciación engaña, dejando la anotación filtrada y a menudo asignando la `solution` a la palabra equivocada:

| id | actual | corrección |
|---|---|---|
| **11443** | F `franco` def `'Moneda oficial de muchos países de la Unión Europea (trampa, empieza por e). Busquemos: Franco.'` — la def describe **euro**, no franco | reescribir def `'Antigua moneda de Francia, anterior al euro.'` |
| **11460** | I `isla` def `'Línea imaginaria que une puntos con la misma precipitación (trampa). Busquemos: Isleta.'` — describe **isoyeta**, no isla | reescribir def `'Porción de tierra rodeada de agua por todas partes.'` |
| **11468** | J `júpiter` def `'Planeta con anillos del sistema solar (trampa, es el 5º). Busquemos: Júpiter.'` — describe **saturno** | reescribir def `'Planeta más grande del sistema solar.'` |
| **11533** | U `urna` def `'Moneda compartida por la mayoría de países de la Unión Europea (trampa sonora). Busquemos: Urna.'` — describe **euro** | reescribir def `'Recipiente para depositar votos en unas elecciones.'` |
| **11534** | U `urano` def `'Planeta más grande del sistema solar (es el 7º). Busquemos: Urano.'` — describe **júpiter** | reescribir def `'Séptimo planeta del sistema solar.'` |
| **11539** | V `valle` def `'Relacionado con los visigodos o con la Vía Láctea (trampa). Busquemos: Valle.'` | reescribir def `'Terreno bajo entre dos montañas.'` |
| **11544** | W `vatio` def `'Moneda oficial del Reino Unido (trampa sonora, contiene W). Busquemos: Vatio.'` — describe **libra** | reescribir def `'Unidad de potencia eléctrica (contiene W).'` |

#### 6º — anotaciones del tipo `(...). No.`

| id | actual | corrección |
|---|---|---|
| 11642 | `dueño` def `'Persona titular de una parte de una empresa (Accionista, contiene Ñ). No. Dueño.'` | reescribir def `'Persona propietaria de algo (contiene Ñ).'` |
| 11643 | `campiña` def `'Relativo al campo o a la agricultura (Campaña, contiene Ñ). No. Campiña.'` | reescribir def `'Terreno llano dedicado al cultivo (contiene Ñ).'` |
| 11645 | `cabaña` def `'Lugar donde viven las personas (contiene Ñ). No. Cabaña.'` | reescribir def `'Casa rústica pequeña, hecha de troncos o piedra (contiene Ñ).'` |

### 2. Duplicados

| ids | curso | letra | acción |
|---|---|---|---|
| 11119, 11123 | 2º | W | borrar 11123 (def "nombre del navegador" — confunde web con navegador) |
| 11544, 11545 | 5º | W | 11544 ya se reescribe arriba; mantener 11545 |

### 3. Definiciones autorreferenciales

| id | curso | actual | corrección |
|---|---|---|---|
| 10918 | 1º | `julio` def `'Mes del año en verano.'` | mantener (correcta) |
| 11038 | 2º | `guía` def `'Persona que guía.'` | `'Persona que orienta o conduce a otros.'` |
| 11043 | 2º | `hermano` def `'Hermano o hermana.'` | `'Hijo de los mismos padres.'` |
| 11067 | 2º | `mundo` def `'Nuestro mundo.'` | `'El planeta Tierra y todo lo que hay en él.'` |
| 11084 | 2º | `pueblo` def `'Pueblo pequeño con poca gente.'` | `'Localidad pequeña con pocos habitantes.'` |
| 11107 | 2º | `tren` def `'Tren sobre vías.'` | `'Vehículo de transporte que circula sobre raíles.'` |
| 11113 | 2º | `unidad` def `'Unidad de bomberos.'` | `'Grupo organizado de personas o cosas.'` |
| 11118 | 2º | `voto` def `'Voto de las elecciones.'` | `'Acción de elegir en unas elecciones.'` |
| 11176 | 3º | `hábitat` def `'Lugar donde vive el ser humano.'` | mantener (correcta, no autoref real) |
| 11192 | 3º | `pueblo` def `'Sinónimo de pueblo.'` (letra K — `pueblo` no contiene K) | borrar |
| 11199 | 3º | `montaña` def `'Elevación natural del terreno.'` | mantener (correcta) |
| 11222 | 3º | `pueblo` def `'Sinónimo de pueblo.'` | `'Localidad pequeña habitada por personas.'` |
| 11236 | 3º | `servicios` def `'Sector que ofrece servicios.'` | `'Sector económico terciario, ofrece atención sin producir bienes.'` |
| 11243 | 3º | `teatro` def `'Lugar de teatro.'` | `'Edificio donde se representan obras dramáticas.'` |
| 11253 | 3º | `volcán` def `'País con volcán.'` (letra V — correcta) | `'Montaña por la que sale magma del interior de la Tierra.'` |
| 11265 | 3º | `playa` def `'Arena de playa.'` (Y — correcta) | `'Costa con arena junto al mar (contiene Y).'` |
| 11302 | 4º | `finca` def `'Propiedad de un terreno.'` | `'Terreno rural con propietario, dedicado al cultivo o ganado.'` |
| 11334 | 4º | `montaña` def `'Gran elevación de terreno.'` | mantener (correcta) |
| 11360 | 4º | `pequeño` def `'Dicho de algo pequeño (contiene la Q).'` | `'Adjetivo: de poco tamaño, opuesto a grande (contiene Q).'` |
| 11392 | 4º | `washington` def `'Washington (capital).'` | `'Capital de Estados Unidos (contiene W).'` |
| 11401 | 4º | `familia` def `'Gente de la familia.'` | `'Grupo de personas unidas por parentesco (contiene Y).'` |
| 11402 | 4º | `playa` def `'Arena de playa.'` | `'Zona de arena junto al mar (contiene Y).'` |
| 11409 | 5º | `asociación` def `'Grupo de personas que se unen para defender un interés común (Asociación, pero busquemos algo más histórico).'` | reescribir def `'Grupo organizado de personas con un objetivo común.'` |
| 11413 | 5º | `acuífero` def `'Capa de agua que se encuentra bajo la superficie terrestre (Acuífero).'` | reescribir def `'Capa de agua subterránea que se acumula entre las rocas.'` |
| 11455 | 5º | `humanismo` def correcta | mantener |
| 11484 | 5º | `municipio` def `'Institución que administra un municipio.'` | `'Pueblo o ciudad gobernada por un ayuntamiento.'` |
| 11514 | 5º | `máquina` def `'Máquina para imprimir libros inventada por Gutenberg (contiene la Q).'` | reescribir def `'Imprenta de Gutenberg (contiene Q).'` ❌ — `máquina` no es eso. `'Aparato mecánico que realiza un trabajo (contiene Q).'` |
| 11535 | 5º | `unidad` def `'Unidad de relieve que se encuentra en el centro de España.'` (describe meseta) | renombrar `solution='meseta'` letra M (ya hay otras en M; mejor reescribir def): `'Cantidad básica que se toma como referencia.'` |
| 11551 | 5º | `ejes` def `'Puntos de corte entre ejes cartesianos (contiene la X).'` | reescribir def `'Líneas de referencia del plano cartesiano (contiene X).'` |
| 11617 | 6º | `unión` def `'Unión de varios países para defender intereses comunes (Junta u...).'` (J — correcta, contiene U... no contiene J) | borrar (`unión` no contiene J) |
| 11650 | 6º | `ocupación` def `'Ocupación de un lugar por parte de un ejército extranjero.'` | `'Acción de tomar un territorio por parte de un ejército extranjero.'` |
| 11666 | 6º | `renacimiento` def `'Época de gran esplendor cultural y renacimiento de las artes en los siglos XV y XVI.'` | `'Movimiento cultural y artístico de los siglos XV y XVI.'` |
| 11671 | 6º | `servicios` def correcta | mantener |
| 11673 | 6º | `solar` def `'Tipo de energía obtenida de la radiación solar.'` | `'Tipo de energía obtenida del Sol.'` |
| 11686 | 6º | `vía` def correcta | mantener |
| 11689 | 6º | `vertiente` def correcta | mantener |
| 11711 | 6º | `caza` def `'Relativo a la caza o a los cazadores (contiene la Z).'` | `'Actividad de capturar animales salvajes (contiene Z).'` |

### 4. Errata mínima

| id | curso | actual | corrección |
|---|---|---|---|
| 11101 | 2º | `sanidad` def `'Cuidado de enfermos.'` | mantener (correcta) |
| 11432 | 5º | `dni` def correcta | mantener |
| 11480 | 5º | `lago` def correcta | mantener |

---

## Resumen de cambios

| Curso | Deletes | Updates |
|---|---|---|
| 1º | 0 | 0 |
| 2º | 1 (web) | 7 |
| 3º | 1 (pueblo K) | 5 |
| 4º | 0 | 5 |
| 5º | 0 | 13 |
| 6º | 1 (unión J) | 8 |

**Total**: 3 deletes + 38 updates.

---

SQL en [primaria-ciencias-sociales.sql](primaria-ciencias-sociales.sql).
