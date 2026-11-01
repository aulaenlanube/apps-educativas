// Datos de los 195 estados (193 miembros de la ONU + Ciudad del Vaticano y
// Palestina, observadores). Nombres y capitales según la grafía recomendada por
// la RAE / Fundéu. Población aproximada (millones, estimación 2024).
//
// Campos:
//   c     código ISO 3166-1 alfa-2 (nombre del fichero de la bandera)
//   n     código ISO numérico (id de la geometría en world-atlas)
//   name  nombre en español          cap   capital
//   cont  continente (CONTINENTS)    sub   subregión (SUBREGIONS)
//   t     escalón de dificultad 1-5 (1 = muy conocido para un alumno español)
//   pop   población en millones
//   city  ciudad más poblada cuando NO es la capital (false = dato discutido:
//         no se pregunta)
//   cont2 segundo continente aceptado (países transcontinentales)
//   capAlt  otras capitales válidas (no se usan como distractor)
//   capNote aclaración que se muestra en la ficha
//   noCapQ  no se pregunta la capital (estatus disputado)
//   alias   otros nombres (buscador del atlas)

export const CONTINENTS = {
  europa: { id: 'europa', name: 'Europa', color: '#818cf8', deep: '#4f46e5' },
  asia: { id: 'asia', name: 'Asia', color: '#fbbf24', deep: '#d97706' },
  africa: { id: 'africa', name: 'África', color: '#fb923c', deep: '#ea580c' },
  america: { id: 'america', name: 'América', color: '#34d399', deep: '#059669' },
  oceania: { id: 'oceania', name: 'Oceanía', color: '#f472b6', deep: '#db2777' },
  antartida: { id: 'antartida', name: 'Antártida', color: '#e2e8f0', deep: '#94a3b8' },
};

// Continentes con países (la Antártida solo aparece en el minijuego de continentes).
export const INHABITED = ['europa', 'asia', 'africa', 'america', 'oceania'];

export const SUBREGIONS = {
  'eu-norte': 'Europa del Norte',
  'eu-oeste': 'Europa Occidental',
  'eu-sur': 'Europa del Sur',
  'eu-este': 'Europa del Este',
  'as-oriental': 'Asia Oriental',
  'as-sudeste': 'Sudeste Asiático',
  'as-sur': 'Asia del Sur',
  'as-central': 'Asia Central',
  'as-occidental': 'Asia Occidental (Oriente Próximo)',
  'af-norte': 'Norte de África',
  'af-oeste': 'África Occidental',
  'af-central': 'África Central',
  'af-este': 'África Oriental',
  'af-sur': 'África Austral',
  'am-norte': 'América del Norte',
  'am-central': 'América Central',
  'am-caribe': 'Caribe',
  'am-sur': 'América del Sur',
  'oc-australasia': 'Australia y Nueva Zelanda',
  'oc-melanesia': 'Melanesia',
  'oc-micronesia': 'Micronesia',
  'oc-polinesia': 'Polinesia',
};

export const COUNTRIES = [
  // ───────────── Europa (45) ─────────────
  { c: 'es', n: 724, name: 'España', cap: 'Madrid', cont: 'europa', sub: 'eu-sur', t: 1, pop: 48.6 },
  { c: 'pt', n: 620, name: 'Portugal', cap: 'Lisboa', cont: 'europa', sub: 'eu-sur', t: 1, pop: 10.6 },
  { c: 'fr', n: 250, name: 'Francia', cap: 'París', cont: 'europa', sub: 'eu-oeste', t: 1, pop: 68 },
  { c: 'it', n: 380, name: 'Italia', cap: 'Roma', cont: 'europa', sub: 'eu-sur', t: 1, pop: 59 },
  { c: 'de', n: 276, name: 'Alemania', cap: 'Berlín', cont: 'europa', sub: 'eu-oeste', t: 1, pop: 84 },
  { c: 'gb', n: 826, name: 'Reino Unido', cap: 'Londres', cont: 'europa', sub: 'eu-norte', t: 1, pop: 69, alias: ['Gran Bretaña', 'Inglaterra'] },
  { c: 'gr', n: 300, name: 'Grecia', cap: 'Atenas', cont: 'europa', sub: 'eu-sur', t: 1, pop: 10.4 },
  { c: 'ru', n: 643, name: 'Rusia', cap: 'Moscú', cont: 'europa', cont2: 'asia', sub: 'eu-este', t: 1, pop: 144 },
  { c: 'ie', n: 372, name: 'Irlanda', cap: 'Dublín', cont: 'europa', sub: 'eu-norte', t: 2, pop: 5.3 },
  { c: 'nl', n: 528, name: 'Países Bajos', cap: 'Ámsterdam', cont: 'europa', sub: 'eu-oeste', t: 2, pop: 18, alias: ['Holanda'], capNote: 'El Gobierno y el Parlamento están en La Haya.' },
  { c: 'be', n: 56, name: 'Bélgica', cap: 'Bruselas', cont: 'europa', sub: 'eu-oeste', t: 2, pop: 11.8, city: false },
  { c: 'ch', n: 756, name: 'Suiza', cap: 'Berna', cont: 'europa', sub: 'eu-oeste', t: 2, pop: 9, city: 'Zúrich' },
  { c: 'at', n: 40, name: 'Austria', cap: 'Viena', cont: 'europa', sub: 'eu-oeste', t: 2, pop: 9.1 },
  { c: 'se', n: 752, name: 'Suecia', cap: 'Estocolmo', cont: 'europa', sub: 'eu-norte', t: 2, pop: 10.6 },
  { c: 'no', n: 578, name: 'Noruega', cap: 'Oslo', cont: 'europa', sub: 'eu-norte', t: 2, pop: 5.6 },
  { c: 'fi', n: 246, name: 'Finlandia', cap: 'Helsinki', cont: 'europa', sub: 'eu-norte', t: 2, pop: 5.6 },
  { c: 'dk', n: 208, name: 'Dinamarca', cap: 'Copenhague', cont: 'europa', sub: 'eu-norte', t: 2, pop: 5.9 },
  { c: 'pl', n: 616, name: 'Polonia', cap: 'Varsovia', cont: 'europa', sub: 'eu-este', t: 2, pop: 37 },
  { c: 'ua', n: 804, name: 'Ucrania', cap: 'Kiev', cont: 'europa', sub: 'eu-este', t: 2, pop: 37 },
  { c: 'is', n: 352, name: 'Islandia', cap: 'Reikiavik', cont: 'europa', sub: 'eu-norte', t: 2, pop: 0.39 },
  { c: 'ad', n: 20, name: 'Andorra', cap: 'Andorra la Vieja', cont: 'europa', sub: 'eu-sur', t: 2, pop: 0.08 },
  { c: 'va', n: 336, name: 'Ciudad del Vaticano', cap: 'Ciudad del Vaticano', cont: 'europa', sub: 'eu-sur', t: 2, pop: 0.0008, alias: ['Vaticano'] },
  { c: 'lu', n: 442, name: 'Luxemburgo', cap: 'Luxemburgo', cont: 'europa', sub: 'eu-oeste', t: 3, pop: 0.67 },
  { c: 'cz', n: 203, name: 'Chequia', cap: 'Praga', cont: 'europa', sub: 'eu-este', t: 3, pop: 10.9, alias: ['República Checa'] },
  { c: 'sk', n: 703, name: 'Eslovaquia', cap: 'Bratislava', cont: 'europa', sub: 'eu-este', t: 3, pop: 5.4 },
  { c: 'hu', n: 348, name: 'Hungría', cap: 'Budapest', cont: 'europa', sub: 'eu-este', t: 3, pop: 9.6 },
  { c: 'ro', n: 642, name: 'Rumanía', cap: 'Bucarest', cont: 'europa', sub: 'eu-este', t: 3, pop: 19 },
  { c: 'bg', n: 100, name: 'Bulgaria', cap: 'Sofía', cont: 'europa', sub: 'eu-este', t: 3, pop: 6.4 },
  { c: 'hr', n: 191, name: 'Croacia', cap: 'Zagreb', cont: 'europa', sub: 'eu-sur', t: 3, pop: 3.9 },
  { c: 'si', n: 705, name: 'Eslovenia', cap: 'Liubliana', cont: 'europa', sub: 'eu-sur', t: 3, pop: 2.1 },
  { c: 'rs', n: 688, name: 'Serbia', cap: 'Belgrado', cont: 'europa', sub: 'eu-sur', t: 3, pop: 6.6 },
  { c: 'ba', n: 70, name: 'Bosnia y Herzegovina', cap: 'Sarajevo', cont: 'europa', sub: 'eu-sur', t: 3, pop: 3.2 },
  { c: 'me', n: 499, name: 'Montenegro', cap: 'Podgorica', cont: 'europa', sub: 'eu-sur', t: 3, pop: 0.62 },
  { c: 'al', n: 8, name: 'Albania', cap: 'Tirana', cont: 'europa', sub: 'eu-sur', t: 3, pop: 2.8 },
  { c: 'mk', n: 807, name: 'Macedonia del Norte', cap: 'Skopie', cont: 'europa', sub: 'eu-sur', t: 3, pop: 1.8, alias: ['Macedonia'] },
  { c: 'md', n: 498, name: 'Moldavia', cap: 'Chisináu', cont: 'europa', sub: 'eu-este', t: 3, pop: 2.5, alias: ['Moldova'] },
  { c: 'by', n: 112, name: 'Bielorrusia', cap: 'Minsk', cont: 'europa', sub: 'eu-este', t: 3, pop: 9.2, alias: ['Belarús'] },
  { c: 'lt', n: 440, name: 'Lituania', cap: 'Vilna', cont: 'europa', sub: 'eu-norte', t: 3, pop: 2.9 },
  { c: 'lv', n: 428, name: 'Letonia', cap: 'Riga', cont: 'europa', sub: 'eu-norte', t: 3, pop: 1.9 },
  { c: 'ee', n: 233, name: 'Estonia', cap: 'Tallin', cont: 'europa', sub: 'eu-norte', t: 3, pop: 1.4 },
  { c: 'mt', n: 470, name: 'Malta', cap: 'La Valeta', cont: 'europa', sub: 'eu-sur', t: 3, pop: 0.54, city: false },
  { c: 'cy', n: 196, name: 'Chipre', cap: 'Nicosia', cont: 'europa', cont2: 'asia', sub: 'eu-sur', t: 3, pop: 1.3 },
  { c: 'mc', n: 492, name: 'Mónaco', cap: 'Mónaco', cont: 'europa', sub: 'eu-oeste', t: 3, pop: 0.039 },
  { c: 'sm', n: 674, name: 'San Marino', cap: 'San Marino', cont: 'europa', sub: 'eu-sur', t: 3, pop: 0.034, city: false },
  { c: 'li', n: 438, name: 'Liechtenstein', cap: 'Vaduz', cont: 'europa', sub: 'eu-oeste', t: 3, pop: 0.04, city: 'Schaan' },

  // ───────────── Asia (47) ─────────────
  { c: 'cn', n: 156, name: 'China', cap: 'Pekín', cont: 'asia', sub: 'as-oriental', t: 1, pop: 1410, city: 'Shanghái' },
  { c: 'jp', n: 392, name: 'Japón', cap: 'Tokio', cont: 'asia', sub: 'as-oriental', t: 1, pop: 124 },
  { c: 'in', n: 356, name: 'India', cap: 'Nueva Delhi', cont: 'asia', sub: 'as-sur', t: 1, pop: 1450, city: 'Bombay' },
  { c: 'tr', n: 792, name: 'Turquía', cap: 'Ankara', cont: 'asia', cont2: 'europa', sub: 'as-occidental', t: 2, pop: 87, city: 'Estambul' },
  { c: 'kr', n: 410, name: 'Corea del Sur', cap: 'Seúl', cont: 'asia', sub: 'as-oriental', t: 2, pop: 51.7 },
  { c: 'sa', n: 682, name: 'Arabia Saudí', cap: 'Riad', cont: 'asia', sub: 'as-occidental', t: 2, pop: 34, alias: ['Arabia Saudita'] },
  { c: 'id', n: 360, name: 'Indonesia', cap: 'Yakarta', cont: 'asia', sub: 'as-sudeste', t: 2, pop: 283 },
  { c: 'th', n: 764, name: 'Tailandia', cap: 'Bangkok', cont: 'asia', sub: 'as-sudeste', t: 2, pop: 71.7 },
  { c: 'kp', n: 408, name: 'Corea del Norte', cap: 'Pionyang', cont: 'asia', sub: 'as-oriental', t: 3, pop: 26.5 },
  { c: 'vn', n: 704, name: 'Vietnam', cap: 'Hanói', cont: 'asia', sub: 'as-sudeste', t: 3, pop: 101, city: 'Ciudad Ho Chi Minh' },
  { c: 'ph', n: 608, name: 'Filipinas', cap: 'Manila', cont: 'asia', sub: 'as-sudeste', t: 3, pop: 116, city: false },
  { c: 'pk', n: 586, name: 'Pakistán', cap: 'Islamabad', cont: 'asia', sub: 'as-sur', t: 3, pop: 251, city: 'Karachi' },
  { c: 'ir', n: 364, name: 'Irán', cap: 'Teherán', cont: 'asia', sub: 'as-sur', t: 3, pop: 91 },
  { c: 'iq', n: 368, name: 'Irak', cap: 'Bagdad', cont: 'asia', sub: 'as-occidental', t: 3, pop: 46 },
  { c: 'af', n: 4, name: 'Afganistán', cap: 'Kabul', cont: 'asia', sub: 'as-sur', t: 3, pop: 42 },
  { c: 'mn', n: 496, name: 'Mongolia', cap: 'Ulán Bator', cont: 'asia', sub: 'as-oriental', t: 3, pop: 3.5 },
  { c: 'kz', n: 398, name: 'Kazajistán', cap: 'Astaná', cont: 'asia', cont2: 'europa', sub: 'as-central', t: 3, pop: 20.6, city: 'Almatý' },
  { c: 'il', n: 376, name: 'Israel', cap: 'Jerusalén', cont: 'asia', sub: 'as-occidental', t: 3, pop: 9.9, noCapQ: true, capNote: 'Israel la proclama su capital, pero muchos países no lo reconocen y tienen sus embajadas en Tel Aviv.' },
  { c: 'sy', n: 760, name: 'Siria', cap: 'Damasco', cont: 'asia', sub: 'as-occidental', t: 3, pop: 24 },
  { c: 'ae', n: 784, name: 'Emiratos Árabes Unidos', cap: 'Abu Dabi', cont: 'asia', sub: 'as-occidental', t: 3, pop: 11, city: 'Dubái' },
  { c: 'my', n: 458, name: 'Malasia', cap: 'Kuala Lumpur', cont: 'asia', sub: 'as-sudeste', t: 3, pop: 35.5 },
  { c: 'jo', n: 400, name: 'Jordania', cap: 'Amán', cont: 'asia', sub: 'as-occidental', t: 4, pop: 11.5 },
  { c: 'lb', n: 422, name: 'Líbano', cap: 'Beirut', cont: 'asia', sub: 'as-occidental', t: 4, pop: 5.8 },
  { c: 'ye', n: 887, name: 'Yemen', cap: 'Saná', cont: 'asia', sub: 'as-occidental', t: 4, pop: 40 },
  { c: 'om', n: 512, name: 'Omán', cap: 'Mascate', cont: 'asia', sub: 'as-occidental', t: 4, pop: 5.3 },
  { c: 'qa', n: 634, name: 'Catar', cap: 'Doha', cont: 'asia', sub: 'as-occidental', t: 4, pop: 3, alias: ['Qatar'] },
  { c: 'kw', n: 414, name: 'Kuwait', cap: 'Kuwait', cont: 'asia', sub: 'as-occidental', t: 4, pop: 4.9 },
  { c: 'bh', n: 48, name: 'Baréin', cap: 'Manama', cont: 'asia', sub: 'as-occidental', t: 4, pop: 1.6, alias: ['Bahréin'] },
  { c: 'bd', n: 50, name: 'Bangladés', cap: 'Daca', cont: 'asia', sub: 'as-sur', t: 4, pop: 173, alias: ['Bangladesh'] },
  { c: 'np', n: 524, name: 'Nepal', cap: 'Katmandú', cont: 'asia', sub: 'as-sur', t: 4, pop: 29.7 },
  { c: 'lk', n: 144, name: 'Sri Lanka', cap: 'Sri Jayawardenapura Kotte', cont: 'asia', sub: 'as-sur', t: 4, pop: 23, city: 'Colombo' },
  { c: 'mm', n: 104, name: 'Birmania', cap: 'Naipyidó', cont: 'asia', sub: 'as-sudeste', t: 4, pop: 54.5, city: 'Rangún', alias: ['Myanmar'] },
  { c: 'kh', n: 116, name: 'Camboya', cap: 'Nom Pen', cont: 'asia', sub: 'as-sudeste', t: 4, pop: 17.6 },
  { c: 'la', n: 418, name: 'Laos', cap: 'Vientián', cont: 'asia', sub: 'as-sudeste', t: 4, pop: 7.8 },
  { c: 'uz', n: 860, name: 'Uzbekistán', cap: 'Taskent', cont: 'asia', sub: 'as-central', t: 4, pop: 36 },
  { c: 'tm', n: 795, name: 'Turkmenistán', cap: 'Asjabad', cont: 'asia', sub: 'as-central', t: 4, pop: 7.5 },
  { c: 'kg', n: 417, name: 'Kirguistán', cap: 'Biskek', cont: 'asia', sub: 'as-central', t: 4, pop: 7.2, alias: ['Kirguizistán'] },
  { c: 'tj', n: 762, name: 'Tayikistán', cap: 'Dusambé', cont: 'asia', sub: 'as-central', t: 4, pop: 10.6 },
  { c: 'ge', n: 268, name: 'Georgia', cap: 'Tiflis', cont: 'asia', cont2: 'europa', sub: 'as-occidental', t: 4, pop: 3.7 },
  { c: 'am', n: 51, name: 'Armenia', cap: 'Ereván', cont: 'asia', cont2: 'europa', sub: 'as-occidental', t: 4, pop: 3 },
  { c: 'az', n: 31, name: 'Azerbaiyán', cap: 'Bakú', cont: 'asia', cont2: 'europa', sub: 'as-occidental', t: 4, pop: 10.2 },
  { c: 'sg', n: 702, name: 'Singapur', cap: 'Singapur', cont: 'asia', sub: 'as-sudeste', t: 4, pop: 5.9 },
  { c: 'ps', n: 275, name: 'Palestina', cap: 'Ramala', cont: 'asia', sub: 'as-occidental', t: 4, pop: 5.5, noCapQ: true, capNote: 'Palestina proclama Jerusalén Este como capital; la sede del Gobierno está en Ramala.' },
  { c: 'bn', n: 96, name: 'Brunéi', cap: 'Bandar Seri Begawan', cont: 'asia', sub: 'as-sudeste', t: 5, pop: 0.46 },
  { c: 'bt', n: 64, name: 'Bután', cap: 'Timbu', cont: 'asia', sub: 'as-sur', t: 5, pop: 0.79 },
  { c: 'mv', n: 462, name: 'Maldivas', cap: 'Malé', cont: 'asia', sub: 'as-sur', t: 5, pop: 0.53 },
  { c: 'tl', n: 626, name: 'Timor Oriental', cap: 'Dili', cont: 'asia', sub: 'as-sudeste', t: 5, pop: 1.4, alias: ['Timor-Leste'] },

  // ───────────── África (54) ─────────────
  { c: 'ma', n: 504, name: 'Marruecos', cap: 'Rabat', cont: 'africa', sub: 'af-norte', t: 1, pop: 38, city: 'Casablanca' },
  { c: 'eg', n: 818, name: 'Egipto', cap: 'El Cairo', cont: 'africa', cont2: 'asia', sub: 'af-norte', t: 1, pop: 116 },
  { c: 'za', n: 710, name: 'Sudáfrica', cap: 'Pretoria', cont: 'africa', sub: 'af-sur', t: 1, pop: 64, city: 'Johannesburgo', capAlt: ['Ciudad del Cabo', 'Bloemfontein'], capNote: 'Tiene tres capitales: Pretoria (Gobierno), Ciudad del Cabo (Parlamento) y Bloemfontein (justicia).' },
  { c: 'dz', n: 12, name: 'Argelia', cap: 'Argel', cont: 'africa', sub: 'af-norte', t: 2, pop: 46.8 },
  { c: 'ng', n: 566, name: 'Nigeria', cap: 'Abuya', cont: 'africa', sub: 'af-oeste', t: 2, pop: 233, city: 'Lagos' },
  { c: 'ke', n: 404, name: 'Kenia', cap: 'Nairobi', cont: 'africa', sub: 'af-este', t: 2, pop: 56 },
  { c: 'tn', n: 788, name: 'Túnez', cap: 'Túnez', cont: 'africa', sub: 'af-norte', t: 3, pop: 12.3 },
  { c: 'ly', n: 434, name: 'Libia', cap: 'Trípoli', cont: 'africa', sub: 'af-norte', t: 3, pop: 7.4 },
  { c: 'et', n: 231, name: 'Etiopía', cap: 'Adís Abeba', cont: 'africa', sub: 'af-este', t: 3, pop: 132 },
  { c: 'sn', n: 686, name: 'Senegal', cap: 'Dakar', cont: 'africa', sub: 'af-oeste', t: 3, pop: 18.5 },
  { c: 'gq', n: 226, name: 'Guinea Ecuatorial', cap: 'Malabo', cont: 'africa', sub: 'af-central', t: 3, pop: 1.9, city: 'Bata' },
  { c: 'mr', n: 478, name: 'Mauritania', cap: 'Nuakchot', cont: 'africa', sub: 'af-oeste', t: 3, pop: 5.2 },
  { c: 'gh', n: 288, name: 'Ghana', cap: 'Acra', cont: 'africa', sub: 'af-oeste', t: 3, pop: 34.4, city: false },
  { c: 'ci', n: 384, name: 'Costa de Marfil', cap: 'Yamusukro', cont: 'africa', sub: 'af-oeste', t: 3, pop: 31.9, city: 'Abiyán' },
  { c: 'ao', n: 24, name: 'Angola', cap: 'Luanda', cont: 'africa', sub: 'af-central', t: 3, pop: 37.9 },
  { c: 'mg', n: 450, name: 'Madagascar', cap: 'Antananarivo', cont: 'africa', sub: 'af-este', t: 3, pop: 31.9 },
  { c: 'tz', n: 834, name: 'Tanzania', cap: 'Dodoma', cont: 'africa', sub: 'af-este', t: 3, pop: 69, city: 'Dar es Salaam' },
  { c: 'cd', n: 180, name: 'República Democrática del Congo', short: 'R. D. del Congo', cap: 'Kinsasa', cont: 'africa', sub: 'af-central', t: 3, pop: 109, alias: ['RD Congo', 'Congo-Kinsasa'] },
  { c: 'sd', n: 729, name: 'Sudán', cap: 'Jartum', cont: 'africa', sub: 'af-norte', t: 3, pop: 50, city: false },
  { c: 'ml', n: 466, name: 'Malí', cap: 'Bamako', cont: 'africa', sub: 'af-oeste', t: 3, pop: 24.5 },
  { c: 'cm', n: 120, name: 'Camerún', cap: 'Yaundé', cont: 'africa', sub: 'af-central', t: 3, pop: 29, city: false },
  { c: 'ne', n: 562, name: 'Níger', cap: 'Niamey', cont: 'africa', sub: 'af-oeste', t: 4, pop: 27 },
  { c: 'td', n: 148, name: 'Chad', cap: 'Yamena', cont: 'africa', sub: 'af-central', t: 4, pop: 20 },
  { c: 'bf', n: 854, name: 'Burkina Faso', cap: 'Uagadugú', cont: 'africa', sub: 'af-oeste', t: 4, pop: 23.5 },
  { c: 'gn', n: 324, name: 'Guinea', cap: 'Conakri', cont: 'africa', sub: 'af-oeste', t: 4, pop: 14.8 },
  { c: 'sl', n: 694, name: 'Sierra Leona', cap: 'Freetown', cont: 'africa', sub: 'af-oeste', t: 4, pop: 8.6 },
  { c: 'lr', n: 430, name: 'Liberia', cap: 'Monrovia', cont: 'africa', sub: 'af-oeste', t: 4, pop: 5.6 },
  { c: 'bj', n: 204, name: 'Benín', cap: 'Porto Novo', cont: 'africa', sub: 'af-oeste', t: 4, pop: 14.5, city: 'Cotonú' },
  { c: 'tg', n: 768, name: 'Togo', cap: 'Lomé', cont: 'africa', sub: 'af-oeste', t: 4, pop: 9.5 },
  { c: 'ga', n: 266, name: 'Gabón', cap: 'Libreville', cont: 'africa', sub: 'af-central', t: 4, pop: 2.5 },
  { c: 'cg', n: 178, name: 'República del Congo', short: 'Congo', cap: 'Brazzaville', cont: 'africa', sub: 'af-central', t: 4, pop: 6.3, alias: ['Congo', 'Congo-Brazzaville'] },
  { c: 'cf', n: 140, name: 'República Centroafricana', short: 'R. Centroafricana', cap: 'Bangui', cont: 'africa', sub: 'af-central', t: 4, pop: 5.3 },
  { c: 'ss', n: 728, name: 'Sudán del Sur', cap: 'Yuba', cont: 'africa', sub: 'af-este', t: 4, pop: 11.9 },
  { c: 'er', n: 232, name: 'Eritrea', cap: 'Asmara', cont: 'africa', sub: 'af-este', t: 4, pop: 3.5 },
  { c: 'so', n: 706, name: 'Somalia', cap: 'Mogadiscio', cont: 'africa', sub: 'af-este', t: 4, pop: 19 },
  { c: 'ug', n: 800, name: 'Uganda', cap: 'Kampala', cont: 'africa', sub: 'af-este', t: 4, pop: 50 },
  { c: 'rw', n: 646, name: 'Ruanda', cap: 'Kigali', cont: 'africa', sub: 'af-este', t: 4, pop: 14.3 },
  { c: 'zm', n: 894, name: 'Zambia', cap: 'Lusaka', cont: 'africa', sub: 'af-este', t: 4, pop: 21.3 },
  { c: 'zw', n: 716, name: 'Zimbabue', cap: 'Harare', cont: 'africa', sub: 'af-este', t: 4, pop: 16.6, alias: ['Zimbabwe'] },
  { c: 'mz', n: 508, name: 'Mozambique', cap: 'Maputo', cont: 'africa', sub: 'af-este', t: 4, pop: 34.6 },
  { c: 'na', n: 516, name: 'Namibia', cap: 'Windhoek', cont: 'africa', sub: 'af-sur', t: 4, pop: 3 },
  { c: 'bw', n: 72, name: 'Botsuana', cap: 'Gaborone', cont: 'africa', sub: 'af-sur', t: 4, pop: 2.5, alias: ['Botswana'] },
  { c: 'cv', n: 132, name: 'Cabo Verde', cap: 'Praia', cont: 'africa', sub: 'af-oeste', t: 4, pop: 0.52 },
  { c: 'gm', n: 270, name: 'Gambia', cap: 'Banjul', cont: 'africa', sub: 'af-oeste', t: 4, pop: 2.8, city: 'Serekunda' },
  { c: 'dj', n: 262, name: 'Yibuti', cap: 'Yibuti', cont: 'africa', sub: 'af-este', t: 5, pop: 1.2, alias: ['Djibouti'] },
  { c: 'km', n: 174, name: 'Comoras', cap: 'Moroni', cont: 'africa', sub: 'af-este', t: 5, pop: 0.87 },
  { c: 'mu', n: 480, name: 'Mauricio', cap: 'Port Louis', cont: 'africa', sub: 'af-este', t: 5, pop: 1.3 },
  { c: 'sc', n: 690, name: 'Seychelles', cap: 'Victoria', cont: 'africa', sub: 'af-este', t: 5, pop: 0.13 },
  { c: 'st', n: 678, name: 'Santo Tomé y Príncipe', cap: 'Santo Tomé', cont: 'africa', sub: 'af-central', t: 5, pop: 0.24 },
  { c: 'gw', n: 624, name: 'Guinea-Bisáu', cap: 'Bisáu', cont: 'africa', sub: 'af-oeste', t: 5, pop: 2.2 },
  { c: 'bi', n: 108, name: 'Burundi', cap: 'Gitega', cont: 'africa', sub: 'af-este', t: 5, pop: 14, city: 'Buyumbura', capNote: 'Gitega es la capital desde 2019; antes lo era Buyumbura.' },
  { c: 'mw', n: 454, name: 'Malaui', cap: 'Lilongüe', cont: 'africa', sub: 'af-este', t: 5, pop: 21.7, alias: ['Malawi'] },
  { c: 'ls', n: 426, name: 'Lesoto', cap: 'Maseru', cont: 'africa', sub: 'af-sur', t: 5, pop: 2.3, alias: ['Lesotho'] },
  { c: 'sz', n: 748, name: 'Esuatini', cap: 'Mbabane', cont: 'africa', sub: 'af-sur', t: 5, pop: 1.2, city: false, alias: ['Suazilandia'], capAlt: ['Lobamba'], capNote: 'Mbabane es la capital administrativa; Lobamba, la real y legislativa.' },

  // ───────────── América (35) ─────────────
  { c: 'us', n: 840, name: 'Estados Unidos', cap: 'Washington D. C.', cont: 'america', sub: 'am-norte', t: 1, pop: 340, city: 'Nueva York', alias: ['EE. UU.', 'EEUU'] },
  { c: 'ca', n: 124, name: 'Canadá', cap: 'Ottawa', cont: 'america', sub: 'am-norte', t: 1, pop: 41, city: 'Toronto' },
  { c: 'mx', n: 484, name: 'México', cap: 'Ciudad de México', cont: 'america', sub: 'am-norte', t: 1, pop: 131 },
  { c: 'br', n: 76, name: 'Brasil', cap: 'Brasilia', cont: 'america', sub: 'am-sur', t: 1, pop: 212, city: 'São Paulo' },
  { c: 'ar', n: 32, name: 'Argentina', cap: 'Buenos Aires', cont: 'america', sub: 'am-sur', t: 1, pop: 46 },
  { c: 'cu', n: 192, name: 'Cuba', cap: 'La Habana', cont: 'america', sub: 'am-caribe', t: 2, pop: 10 },
  { c: 'co', n: 170, name: 'Colombia', cap: 'Bogotá', cont: 'america', sub: 'am-sur', t: 2, pop: 52.9 },
  { c: 'pe', n: 604, name: 'Perú', cap: 'Lima', cont: 'america', sub: 'am-sur', t: 2, pop: 34 },
  { c: 'cl', n: 152, name: 'Chile', cap: 'Santiago de Chile', cont: 'america', sub: 'am-sur', t: 2, pop: 19.8 },
  { c: 've', n: 862, name: 'Venezuela', cap: 'Caracas', cont: 'america', sub: 'am-sur', t: 2, pop: 28.4 },
  { c: 'uy', n: 858, name: 'Uruguay', cap: 'Montevideo', cont: 'america', sub: 'am-sur', t: 2, pop: 3.4 },
  { c: 'ec', n: 218, name: 'Ecuador', cap: 'Quito', cont: 'america', sub: 'am-sur', t: 2, pop: 18, city: false },
  { c: 'bo', n: 68, name: 'Bolivia', cap: 'Sucre', cont: 'america', sub: 'am-sur', t: 2, pop: 12.4, city: 'Santa Cruz de la Sierra', capAlt: ['La Paz'], capNote: 'Sucre es la capital constitucional y La Paz, la sede del Gobierno.' },
  { c: 'py', n: 600, name: 'Paraguay', cap: 'Asunción', cont: 'america', sub: 'am-sur', t: 3, pop: 6.9 },
  { c: 'gt', n: 320, name: 'Guatemala', cap: 'Ciudad de Guatemala', cont: 'america', sub: 'am-central', t: 3, pop: 18.4 },
  { c: 'hn', n: 340, name: 'Honduras', cap: 'Tegucigalpa', cont: 'america', sub: 'am-central', t: 3, pop: 10.8 },
  { c: 'sv', n: 222, name: 'El Salvador', cap: 'San Salvador', cont: 'america', sub: 'am-central', t: 3, pop: 6.3 },
  { c: 'ni', n: 558, name: 'Nicaragua', cap: 'Managua', cont: 'america', sub: 'am-central', t: 3, pop: 7 },
  { c: 'cr', n: 188, name: 'Costa Rica', cap: 'San José', cont: 'america', sub: 'am-central', t: 3, pop: 5.1 },
  { c: 'pa', n: 591, name: 'Panamá', cap: 'Ciudad de Panamá', cont: 'america', sub: 'am-central', t: 3, pop: 4.5 },
  { c: 'do', n: 214, name: 'República Dominicana', short: 'R. Dominicana', cap: 'Santo Domingo', cont: 'america', sub: 'am-caribe', t: 3, pop: 11.4 },
  { c: 'ht', n: 332, name: 'Haití', cap: 'Puerto Príncipe', cont: 'america', sub: 'am-caribe', t: 3, pop: 11.8 },
  { c: 'jm', n: 388, name: 'Jamaica', cap: 'Kingston', cont: 'america', sub: 'am-caribe', t: 3, pop: 2.8 },
  { c: 'bs', n: 44, name: 'Bahamas', cap: 'Nasáu', cont: 'america', sub: 'am-caribe', t: 4, pop: 0.4 },
  { c: 'bz', n: 84, name: 'Belice', cap: 'Belmopán', cont: 'america', sub: 'am-central', t: 4, pop: 0.42, city: 'Ciudad de Belice' },
  { c: 'gy', n: 328, name: 'Guyana', cap: 'Georgetown', cont: 'america', sub: 'am-sur', t: 4, pop: 0.83 },
  { c: 'sr', n: 740, name: 'Surinam', cap: 'Paramaribo', cont: 'america', sub: 'am-sur', t: 4, pop: 0.63 },
  { c: 'tt', n: 780, name: 'Trinidad y Tobago', cap: 'Puerto España', cont: 'america', sub: 'am-caribe', t: 4, pop: 1.5, city: false },
  { c: 'ag', n: 28, name: 'Antigua y Barbuda', cap: "Saint John's", cont: 'america', sub: 'am-caribe', t: 5, pop: 0.094 },
  { c: 'bb', n: 52, name: 'Barbados', cap: 'Bridgetown', cont: 'america', sub: 'am-caribe', t: 5, pop: 0.28 },
  { c: 'dm', n: 212, name: 'Dominica', cap: 'Roseau', cont: 'america', sub: 'am-caribe', t: 5, pop: 0.067 },
  { c: 'gd', n: 308, name: 'Granada', cap: "Saint George's", cont: 'america', sub: 'am-caribe', t: 5, pop: 0.12 },
  { c: 'kn', n: 659, name: 'San Cristóbal y Nieves', cap: 'Basseterre', cont: 'america', sub: 'am-caribe', t: 5, pop: 0.047 },
  { c: 'lc', n: 662, name: 'Santa Lucía', cap: 'Castries', cont: 'america', sub: 'am-caribe', t: 5, pop: 0.18 },
  { c: 'vc', n: 670, name: 'San Vicente y las Granadinas', short: 'San Vicente y Granadinas', cap: 'Kingstown', cont: 'america', sub: 'am-caribe', t: 5, pop: 0.1 },

  // ───────────── Oceanía (14) ─────────────
  { c: 'au', n: 36, name: 'Australia', cap: 'Canberra', cont: 'oceania', sub: 'oc-australasia', t: 1, pop: 27, city: 'Sídney' },
  { c: 'nz', n: 554, name: 'Nueva Zelanda', cap: 'Wellington', cont: 'oceania', sub: 'oc-australasia', t: 2, pop: 5.2, city: 'Auckland' },
  { c: 'pg', n: 598, name: 'Papúa Nueva Guinea', cap: 'Port Moresby', cont: 'oceania', sub: 'oc-melanesia', t: 3, pop: 10.6 },
  { c: 'fj', n: 242, name: 'Fiyi', cap: 'Suva', cont: 'oceania', sub: 'oc-melanesia', t: 3, pop: 0.93, alias: ['Fiji'] },
  { c: 'sb', n: 90, name: 'Islas Salomón', cap: 'Honiara', cont: 'oceania', sub: 'oc-melanesia', t: 4, pop: 0.82 },
  { c: 'vu', n: 548, name: 'Vanuatu', cap: 'Port Vila', cont: 'oceania', sub: 'oc-melanesia', t: 4, pop: 0.33 },
  { c: 'ws', n: 882, name: 'Samoa', cap: 'Apia', cont: 'oceania', sub: 'oc-polinesia', t: 4, pop: 0.22 },
  { c: 'to', n: 776, name: 'Tonga', cap: 'Nukualofa', cont: 'oceania', sub: 'oc-polinesia', t: 4, pop: 0.1 },
  { c: 'ki', n: 296, name: 'Kiribati', cap: 'Tarawa', cont: 'oceania', sub: 'oc-micronesia', t: 5, pop: 0.13 },
  { c: 'mh', n: 584, name: 'Islas Marshall', cap: 'Majuro', cont: 'oceania', sub: 'oc-micronesia', t: 5, pop: 0.04 },
  { c: 'fm', n: 583, name: 'Micronesia', cap: 'Palikir', cont: 'oceania', sub: 'oc-micronesia', t: 5, pop: 0.11, city: false },
  { c: 'nr', n: 520, name: 'Nauru', cap: 'Yaren', cont: 'oceania', sub: 'oc-micronesia', t: 5, pop: 0.012, capNote: 'No tiene capital oficial: el Gobierno está en el distrito de Yaren.' },
  { c: 'pw', n: 585, name: 'Palaos', cap: 'Ngerulmud', cont: 'oceania', sub: 'oc-micronesia', t: 5, pop: 0.018, city: 'Koror', alias: ['Palau'] },
  { c: 'tv', n: 798, name: 'Tuvalu', cap: 'Funafuti', cont: 'oceania', sub: 'oc-polinesia', t: 5, pop: 0.01 },
];

export const BY_ISO = Object.fromEntries(COUNTRIES.map((k) => [k.c, k]));

// id de la geometría (world-atlas usa el código numérico con ceros: "036").
export const geoIdOf = (k) => String(k.n).padStart(3, '0');

export const displayName = (k) => k.short || k.name;

// ¿Pertenece el país (también) a este continente?
export const inContinent = (k, cont) => k.cont === cont || k.cont2 === cont;

// Ciudad más poblada (string) o null si el dato es discutido.
export const largestCity = (k) => (k.city === false ? null : k.city || k.cap);

const fmtInt = (n) => Math.round(n).toLocaleString('es-ES');

// "≈ 48 millones", "≈ 5,3 millones", "≈ 39.000 habitantes"
export function formatPopulation(pop) {
  if (pop >= 10) return `≈ ${fmtInt(pop)} millones`;
  if (pop >= 1) return `≈ ${String(Math.round(pop * 10) / 10).replace('.', ',')} millones`;
  const people = pop * 1e6;
  const rounded = people >= 100000 ? Math.round(people / 10000) * 10000 : people >= 10000 ? Math.round(people / 1000) * 1000 : Math.round(people / 100) * 100;
  return `≈ ${fmtInt(rounded)} habitantes`;
}
