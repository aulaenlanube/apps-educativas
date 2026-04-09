-- =============================================================================
-- SEED: Bachillerato — Ciencias Sociales y Humanidades
-- Asignaturas: historia-mundo (1), historia-espana (2), geografia (2),
--              arte (2), economia (1), economia-empresa (2),
--              latin (1 y 2)
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. ROSCO QUESTIONS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO (1º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Doctrina política que defiende la eliminación del Estado y toda autoridad coercitiva', 'anarquismo', 'historia-mundo', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Nombre del muro que dividió la ciudad alemana en dos sectores entre 1961 y 1989', 'berlin', 'historia-mundo', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Conflicto ideológico y geopolítico entre EEUU y la URSS sin enfrentamiento directo entre ambas potencias', 'coldwar', 'historia-mundo', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Sistema político y económico que busca la propiedad colectiva de los medios de producción según Marx', 'comunismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Proceso por el cual las colonias africanas y asiáticas obtuvieron su independencia tras la II Guerra Mundial', 'descolonizacion', 'historia-mundo', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Periodo de la historia francesa en que Napoleón Bonaparte gobernó como emperador (1804-1815)', 'empire', 'historia-mundo', 'bachillerato', '{1}', 3),
('E', 'empieza', 'Movimiento filosófico e intelectual del siglo XVIII que promovió la razón y los derechos del individuo', 'enciclopedismo', 'historia-mundo', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Ideología totalitaria de extrema derecha surgida en Italia con Mussolini tras la I Guerra Mundial', 'fascismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Política de transparencia impulsada por Gorbachov en la URSS durante los años 80', 'glasnost', 'historia-mundo', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Exterminio sistemático de seis millones de judíos por el régimen nazi durante la II Guerra Mundial', 'holocausto', 'historia-mundo', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Política de expansión territorial y dominio de potencias europeas sobre África y Asia en el siglo XIX', 'imperialismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Club político radical de la Revolución Francesa liderado por Robespierre', 'jacobinos', 'historia-mundo', 'bachillerato', '{1}', 2),
('K', 'empieza', 'Economista británico cuyas teorías sobre la intervención estatal dominaron la posguerra', 'keynes', 'historia-mundo', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Político ruso que lideró la Revolución de Octubre de 1917 e instauró el régimen soviético', 'lenin', 'historia-mundo', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Plan económico de ayuda estadounidense para la reconstrucción de Europa tras la II Guerra Mundial', 'marshall', 'historia-mundo', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Ideología del partido de Hitler basada en el racismo, el antisemitismo y el expansionismo territorial', 'nazismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Organización de Naciones Unidas creada en 1945 para mantener la paz y la seguridad internacionales', 'onu', 'historia-mundo', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Política de reestructuración económica impulsada por Gorbachov en la URSS', 'perestroika', 'historia-mundo', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Transformación tecnológica y económica iniciada en Gran Bretaña a finales del siglo XVIII', 'revolucion', 'historia-mundo', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Doctrina política y económica que aboga por la propiedad social de los medios de producción', 'socialismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Tratado firmado en 1919 que impuso duras condiciones a Alemania tras la I Guerra Mundial', 'tratado', 'historia-mundo', 'bachillerato', '{1}', 2),
('U', 'contiene', 'Nombre con el que se conoce la alianza militar occidental liderada por EEUU desde 1949', 'otan', 'historia-mundo', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Ciudad francesa donde se firmó el tratado de paz tras la I Guerra Mundial en 1919', 'versalles', 'historia-mundo', 'bachillerato', '{1}', 1),
('W', 'empieza', 'República democrática alemana establecida tras la I Guerra Mundial entre 1919 y 1933', 'weimar', 'historia-mundo', 'bachillerato', '{1}', 2),
('Y', 'empieza', 'Conferencia de 1945 entre Churchill, Roosevelt y Stalin para reorganizar Europa tras la guerra', 'yalta', 'historia-mundo', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Canal egipcio cuya crisis en 1956 marco el declive del imperialismo franco-britanico', 'suez', 'historia-mundo', 'bachillerato', '{1}', 2);

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA (2º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Territorio peninsular bajo dominio musulmán desde el 711 hasta la caída de Granada en 1492', 'alandalus', 'historia-espana', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Dinastía francesa que accedió al trono español en 1700 con Felipe V tras la Guerra de Sucesión', 'borbones', 'historia-espana', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Proceso histórico de avance cristiano hacia el sur peninsular para recuperar territorios musulmanes', 'conquista', 'historia-espana', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Primera Constitución española aprobada en Cádiz en 1812 durante la Guerra de Independencia', 'constitucion', 'historia-espana', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Proceso político español iniciado tras la muerte de Franco que estableció la monarquía parlamentaria', 'democracia', 'historia-espana', 'bachillerato', '{2}', 1),
('E', 'contiene', 'Sistema político del siglo XIX español en que liberales y conservadores se alternaban en el poder de forma pactada', 'turnismo', 'historia-espana', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Régimen dictatorial español que gobernó entre 1939 y 1975 bajo el general Franco', 'franquismo', 'historia-espana', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Conflicto bélico español entre 1936 y 1939 que enfrentó al bando republicano y al sublevado', 'guerra', 'historia-espana', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Pueblo prerromano que habitaba la zona levantina de la Península Ibérica', 'iberos', 'historia-espana', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Tribunal religioso establecido por los Reyes Católicos en 1478 para perseguir la herejía', 'inquisicion', 'historia-espana', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Rey de España que impulsó el gobierno de los validos y bajo cuyo reinado se inició la decadencia de los Austrias', 'juancarlos', 'historia-espana', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Movimiento político del siglo XIX que defendía la soberanía nacional y los derechos individuales en España', 'liberalismo', 'historia-espana', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Forma de gobierno restaurada en España en 1975 con Juan Carlos I como jefe del Estado', 'monarquia', 'historia-espana', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Movimiento cultural del siglo XVI español caracterizado por la expansión artística y la conquista de América', 'neoclasicismo', 'historia-espana', 'bachillerato', '{2}', 3),
('O', 'contiene', 'Valido de Felipe III que dirigió la política española a comienzos del siglo XVII', 'lerma', 'historia-espana', 'bachillerato', '{2}', 3),
('P', 'empieza', 'Periodo de la dictadura de Primo de Rivera entre 1923 y 1930 que suspendió la Constitución', 'primoderrivera', 'historia-espana', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Proceso medieval de avance de los reinos cristianos del norte hacia el sur peninsular contra Al-Ándalus', 'reconquista', 'historia-espana', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Sistema político de la Restauración ideado por Cánovas en el que dos partidos se alternaban en el gobierno', 'sufragio', 'historia-espana', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Periodo de la historia española entre 1975 y 1982 que condujo de la dictadura a la democracia', 'transicion', 'historia-espana', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Nombre de la dinastía que gobernó España en los siglos XVI y XVII, también llamada Habsburgo', 'austrias', 'historia-espana', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Pueblo germánico que invadió Hispania en el siglo V y estableció un reino con capital en Toledo', 'visigodos', 'historia-espana', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Batalla de 1808 en la que las tropas españolas vencieron por primera vez a Napoleón en campo abierto', 'bailen', 'historia-espana', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Periodo de máxima extensión del Imperio español bajo los reinados de Carlos I y Felipe II', 'maxima', 'historia-espana', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'General que protagonizó un fallido golpe de Estado en España el 23 de febrero de 1981', 'tejero', 'historia-espana', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Ciudad aragonesa donde se celebraron Cortes medievales con importantes fueros y libertades', 'zaragoza', 'historia-espana', 'bachillerato', '{2}', 2);

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA (2º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Fenómeno de despoblación de las áreas rurales hacia las ciudades en España', 'abandono', 'geografia', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Cuenca hidrográfica peninsular cuyo río principal desemboca en el Atlántico cerca de Lisboa', 'badajoz', 'geografia', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Tipo de clima caracterizado por veranos cálidos y secos e inviernos suaves y lluviosos en la costa mediterránea', 'clima', 'geografia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Indicador que mide el número de habitantes por kilómetro cuadrado en un territorio', 'densidad', 'geografia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Proceso de pérdida de suelo fértil por acción del agua y el viento, especialmente grave en el sureste español', 'erosion', 'geografia', 'bachillerato', '{2}', 1),
('F', 'contiene', 'Relieve tabular elevado de la Meseta castellana con superficie plana y bordes escarpados', 'paramo', 'geografia', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Corriente de agua subterránea continental fundamental para el riego en zonas semiáridas de España', 'gota', 'geografia', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Ciencia que estudia las aguas continentales y marinas de un territorio', 'hidrografia', 'geografia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Línea que une puntos de igual altitud en un mapa topográfico', 'isobara', 'geografia', 'bachillerato', '{2}', 3),
('J', 'contiene', 'Río más largo de la Península Ibérica con 1007 km que desemboca en Lisboa', 'tajo', 'geografia', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Tipo de vegetación de hojas perennes y duras adaptada al clima mediterráneo seco', 'laurisilva', 'geografia', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Unidad de relieve que ocupa el centro de la Península Ibérica con una altitud media de 650 m', 'meseta', 'geografia', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Tasa que mide la diferencia entre nacimientos y defunciones en una población', 'natalidad', 'geografia', 'bachillerato', '{2}', 1),
('O', 'contiene', 'Fenómeno meteorológico de lluvias torrenciales en el Mediterráneo español causado por masas de aire frío en altura', 'gotafria', 'geografia', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Estructura de la población según edad y sexo representada gráficamente en forma de pirámide', 'piramide', 'geografia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Conjunto de formas del terreno que caracterizan la superficie de un territorio', 'relieve', 'geografia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Actividades económicas de servicios que constituyen el sector dominante en la economía española', 'servicios', 'geografia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Actividad del sector terciario que constituye una de las principales fuentes de ingresos de España', 'turismo', 'geografia', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Proceso de concentración de la población en ciudades que se aceleró en España desde los años 60', 'urbanizacion', 'geografia', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Tipo de formación vegetal densa adaptada al clima oceánico del norte peninsular', 'vegetacion', 'geografia', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Recurso natural renovable aprovechado en los parques eólicos de España para generar electricidad', 'eolica', 'geografia', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Proceso de pérdida extrema de humedad del suelo que lleva a la desertificacion', 'aridez', 'geografia', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Archipiélago atlántico español de origen volcánico situado frente a la costa africana', 'canarias', 'geografia', 'bachillerato', '{2}', 1),
('Z', 'empieza', 'Área periurbana que rodea las grandes ciudades y donde conviven usos rurales y urbanos', 'zona', 'geografia', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Organización supranacional a la que España pertenece desde 1986 y que influye en su política agraria', 'adhesion', 'geografia', 'bachillerato', '{2}', 2);

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE (2º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Estilo arquitectónico medieval con arcos apuntados, bóvedas de crucería y grandes vidrieras', 'arcogotico', 'arte', 'bachillerato', '{2}', 3),
('B', 'empieza', 'Estilo artístico del siglo XVII caracterizado por la exuberancia, el movimiento y los contrastes de luz', 'barroco', 'arte', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Movimiento artístico de principios del siglo XX que fragmenta las formas en figuras geométricas, creado por Picasso y Braque', 'cubismo', 'arte', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Técnica pictórica renacentista de transición suave entre luces y sombras perfeccionada por Leonardo', 'degradado', 'arte', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Movimiento artístico que busca representar emociones intensas deformando la realidad, con Munch como referente', 'expresionismo', 'arte', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Movimiento vanguardista italiano que exaltaba la velocidad, la máquina y la modernidad', 'futurismo', 'arte', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Famoso cuadro de Picasso que denuncia el bombardeo de una villa vasca durante la Guerra Civil española', 'guernica', 'arte', 'bachillerato', '{2}', 1),
('H', 'contiene', 'Estilo artístico excesivo y recargado del Barroco tardío, con decoración abundante y formas curvas', 'churrigueresco', 'arte', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Movimiento pictórico de finales del siglo XIX que busca captar la luz y el instante, con Monet como máximo exponente', 'impresionismo', 'arte', 'bachillerato', '{2}', 1),
('J', 'contiene', 'Estilo ornamental y curvilíneo de principios del siglo XX también llamado Art Nouveau o Modernismo', 'modernismo', 'arte', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Pintor ruso considerado pionero del arte abstracto con obras como Composición VIII', 'kandinsky', 'arte', 'bachillerato', '{2}', 2),
('L', 'contiene', 'Pintura mural de Leonardo da Vinci que representa la última cena de Jesús con sus discípulos', 'leonardo', 'arte', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Escultor y pintor renacentista autor de la bóveda de la Capilla Sixtina y el David', 'miguelangel', 'arte', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Estilo artístico de finales del XVIII que recupera las formas grecorromanas como reacción al Barroco', 'neoclasicismo', 'arte', 'bachillerato', '{2}', 1),
('O', 'contiene', 'Tipo de columna griega de capitel con volutas enrolladas característico de los templos jónicos', 'jonico', 'arte', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Técnica artística del siglo XX que introduce collages y objetos reales en la obra de arte', 'popart', 'arte', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Movimiento cultural y artístico nacido en Italia en el siglo XV que recupera los ideales clásicos', 'renacimiento', 'arte', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Movimiento artístico del siglo XX influido por el psicoanálisis que explora el subconsciente y los sueños', 'surrealismo', 'arte', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Técnica decorativa de pequeñas piezas de piedra o vidrio coloreado típica del arte romano y bizantino', 'tesela', 'arte', 'bachillerato', '{2}', 2),
('U', 'contiene', 'Término que designa los movimientos artísticos rupturistas de principios del siglo XX', 'vanguardias', 'arte', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Pintor español del Barroco autor de Las Meninas y La rendición de Breda', 'velazquez', 'arte', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Arquitecto norteamericano que diseñó el Museo Guggenheim de Nueva York con su forma espiral', 'wright', 'arte', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de grabado en madera utilizado en el expresionismo alemán por artistas como Kirchner', 'xilografia', 'arte', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Pintor español surrealista nacido en Figueres autor de La persistencia de la memoria', 'dali', 'arte', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Friso decorativo del Altar de Zeus en Pérgamo que representa la lucha entre dioses y gigantes', 'zeus', 'arte', 'bachillerato', '{2}', 3);

-- ---------------------------------------------------------------------------
-- ECONOMÍA (1º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Impuesto indirecto español aplicado al valor añadido en cada fase de producción y venta', 'arancel', 'economia', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Institución financiera central de un país que controla la política monetaria y la emisión de dinero', 'banco', 'economia', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Situación de mercado en la que muchas empresas ofrecen productos similares sin poder fijar el precio', 'competencia', 'economia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Cantidad de un bien o servicio que los consumidores desean y pueden adquirir a un precio determinado', 'demanda', 'economia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Punto en el que la oferta y la demanda se igualan determinando el precio de mercado', 'equilibrio', 'economia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Conjunto de medidas del gobierno sobre ingresos y gastos públicos para influir en la economía', 'fiscal', 'economia', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Fenómeno económico mundial de interconexión de mercados, capitales y culturas', 'globalizacion', 'economia', 'bachillerato', '{1}', 1),
('H', 'contiene', 'Fenómeno de subida generalizada y sostenida de los precios en una economía', 'inflacion', 'economia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Aumento generalizado y sostenido del nivel de precios que reduce el poder adquisitivo del dinero', 'inflacion', 'economia', 'bachillerato', '{1}', 1),
('J', 'contiene', 'Tipo de interés fijado por el Banco Central Europeo que influye en el coste del crédito', 'interes', 'economia', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Economista británico autor de la Teoría General que propuso la intervención estatal en épocas de crisis', 'keynes', 'economia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Doctrina económica que defiende la mínima intervención del Estado y el libre mercado', 'liberalismo', 'economia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Situación de mercado en la que una sola empresa controla toda la oferta de un bien o servicio', 'monopolio', 'economia', 'bachillerato', '{1}', 1),
('N', 'contiene', 'Indicador macroeconómico que mide el valor total de bienes y servicios producidos en un país en un año', 'pib', 'economia', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Cantidad de un bien o servicio que los productores están dispuestos a vender a un precio dado', 'oferta', 'economia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Indicador macroeconómico que mide el valor de toda la producción de bienes y servicios de un país', 'pib', 'economia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Periodo de contracción económica con caída del PIB durante al menos dos trimestres consecutivos', 'recesion', 'economia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Conjunto de instituciones bancarias y mercados financieros que canalizan el ahorro hacia la inversión', 'sistema', 'economia', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Impuesto o gravamen que se aplica a los productos importados para proteger la industria nacional', 'tarifa', 'economia', 'bachillerato', '{1}', 2),
('U', 'contiene', 'Tasa que mide el porcentaje de la población activa que no encuentra empleo', 'desempleo', 'economia', 'bachillerato', '{1}', 1),
('V', 'contiene', 'Tipo de impuesto que grava el consumo de bienes y servicios como el IVA', 'iva', 'economia', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Organización internacional que regula el comercio entre naciones, con sede en Ginebra', 'omc', 'economia', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Diferencia entre exportaciones e importaciones de un país que puede ser positiva o negativa', 'exportacion', 'economia', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Flujo de dinero que reciben las personas y empresas por su actividad productiva', 'renta', 'economia', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Zona de libre comercio entre países que elimina aranceles y barreras comerciales internas', 'arancel', 'economia', 'bachillerato', '{1}', 2);

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA (2º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Registro contable del patrimonio de una empresa que refleja bienes, derechos y obligaciones', 'activo', 'economia-empresa', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Documento contable que refleja la situación patrimonial de una empresa en un momento dado', 'balance', 'economia-empresa', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Conjunto de bienes y derechos que posee una empresa necesarios para su actividad productiva', 'capital', 'economia-empresa', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Proceso de transferencia de poder de decisión desde la cúpula a niveles inferiores de la organización', 'descentralizacion', 'economia-empresa', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Persona que crea y gestiona una empresa asumiendo riesgos a cambio de un beneficio potencial', 'emprendedor', 'economia-empresa', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Conjunto de recursos económicos disponibles en una empresa para financiar sus operaciones', 'financiacion', 'economia-empresa', 'bachillerato', '{2}', 1),
('G', 'contiene', 'Representación gráfica de la estructura jerárquica y funcional de una empresa', 'organigrama', 'economia-empresa', 'bachillerato', '{2}', 1),
('H', 'contiene', 'Área de la empresa encargada de la selección, formación y gestión del personal', 'recursos', 'economia-empresa', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Relación entre la producción obtenida y los recursos empleados en el proceso productivo', 'inversion', 'economia-empresa', 'bachillerato', '{2}', 2),
('J', 'contiene', 'Reunión de los socios de una empresa para tomar decisiones sobre la gestión y el reparto de beneficios', 'junta', 'economia-empresa', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Capacidad de una empresa para hacer frente a sus obligaciones de pago a corto plazo', 'liquidez', 'economia-empresa', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Conjunto de estrategias para conocer al consumidor y satisfacer sus necesidades de forma rentable', 'marketing', 'economia-empresa', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Proceso de discusión entre empresa y trabajadores para acordar condiciones laborales', 'negociacion', 'economia-empresa', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Cantidad de un bien o servicio que una empresa está dispuesta a producir y vender', 'oferta', 'economia-empresa', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Documento que describe la viabilidad de un nuevo negocio incluyendo análisis financiero y de mercado', 'plan', 'economia-empresa', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Indicador que mide el beneficio obtenido en relación con la inversión realizada', 'rentabilidad', 'economia-empresa', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Tipo de empresa mercantil con capital dividido en acciones y responsabilidad limitada de los socios', 'sociedad', 'economia-empresa', 'bachillerato', '{2}', 1),
('T', 'contiene', 'Organización taylorista del trabajo basada en la división de tareas y la especialización', 'taylorismo', 'economia-empresa', 'bachillerato', '{2}', 2),
('U', 'contiene', 'Beneficio que obtiene un consumidor al adquirir un producto que satisface su necesidad', 'utilidad', 'economia-empresa', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Cantidad de unidades de un producto que una empresa logra comercializar en un periodo', 'ventas', 'economia-empresa', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Margen de beneficio neto resultante de restar todos los costes a los ingresos por ventas', 'neto', 'economia-empresa', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de costes que no varían con el nivel de producción como el alquiler del local', 'fijos', 'economia-empresa', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Herramienta de análisis estratégico que identifica debilidades, amenazas, fortalezas y oportunidades', 'dafo', 'economia-empresa', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Estrategia de marketing basada en adaptar el producto a las necesidades de cada segmento del mercado', 'segmentacion', 'economia-empresa', 'bachillerato', '{2}', 2);

-- ---------------------------------------------------------------------------
-- LATÍN I (1º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Caso latino que indica el complemento directo de la oración', 'acusativo', 'latin', 'bachillerato', '{1}', 1),
('B', 'contiene', 'Forma verbal latina no personal equivalente al infinitivo castellano', 'verbo', 'latin', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Sistema de flexión nominal latina que agrupa los sustantivos en cinco modelos según su tema', 'conjugacion', 'latin', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Conjunto de formas que adopta un nombre latino según su función en la oración', 'declinacion', 'latin', 'bachillerato', '{1}', 1),
('E', 'contiene', 'Caso latino que indica el complemento indirecto o el destinatario de la acción', 'dativo', 'latin', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Espacio público romano rodeado de edificios donde se celebraban asambleas y comercio', 'foro', 'latin', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Caso latino que indica posesión o pertenencia, equivalente al complemento del nombre', 'genitivo', 'latin', 'bachillerato', '{1}', 1),
('H', 'contiene', 'Dios romano del fuego y la fragua, equivalente al griego Hefesto', 'vulcano', 'latin', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Modo verbal latino que expresa la acción como real y objetiva', 'indicativo', 'latin', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Dios romano supremo, padre de los dioses, equivalente al griego Zeus', 'jupiter', 'latin', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Calendario romano reformado por Julio César que estableció el año de 365 días', 'kalendas', 'latin', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Lengua itálica de la que derivan las lenguas romances como el español, francés e italiano', 'latin', 'latin', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Diosa romana de la sabiduría y las artes, equivalente a la griega Atenea', 'minerva', 'latin', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Caso latino que designa al sujeto de la oración y al atributo', 'nominativo', 'latin', 'bachillerato', '{1}', 1),
('O', 'contiene', 'Forma verbal latina de la voz pasiva en que el sujeto recibe la acción', 'pasivo', 'latin', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Tiempo verbal latino que expresa una acción acabada en el pasado, equivalente al pretérito perfecto', 'perfecto', 'latin', 'bachillerato', '{1}', 1),
('R', 'contiene', 'Ciudad fundada según la leyenda por Rómulo y Remo en el 753 a.C.', 'roma', 'latin', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Modo verbal latino que expresa deseo, posibilidad o irrealidad', 'subjuntivo', 'latin', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Edificio romano destinado a baños públicos con salas de agua caliente, templada y fría', 'termas', 'latin', 'bachillerato', '{1}', 1),
('U', 'contiene', 'Héroe troyano que según Virgilio fundó la estirpe romana tras huir de Troya', 'eneas', 'latin', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Caso latino que se usa para dirigirse directamente a una persona o invocarla', 'vocativo', 'latin', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Palabra latina que significa lobo, animal sagrado en la fundación de Roma', 'lupa', 'latin', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Prefijo latino que significa fuera de, presente en palabras como exportar o excluir', 'extra', 'latin', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Poema épico de Virgilio que narra el viaje de Eneas desde Troya hasta Italia', 'eneida', 'latin', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Dios griego equivalente a Júpiter romano, padre de los dioses del Olimpo', 'zeus', 'latin', 'bachillerato', '{1}', 1);

-- ---------------------------------------------------------------------------
-- LATÍN II (2º Bach)
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Caso latino que expresa circunstancias de lugar, tiempo, modo o instrumento', 'ablativo', 'latin', 'bachillerato', '{2}', 1),
('B', 'contiene', 'Orador y filósofo romano autor de las Catilinarias y defensor de la República', 'ciceron', 'latin', 'bachillerato', '{2}', 1),
('C', 'empieza', 'General y dictador romano autor de La guerra de las Galias, asesinado en los idus de marzo', 'cesar', 'latin', 'bachillerato', '{2}', 1),
('D', 'contiene', 'Tipo de oración subordinada latina introducida por conjunciones como cum, ut o quod', 'subordinada', 'latin', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Género literario latino cultivado por Horacio y Juvenal que critica los vicios de la sociedad', 'elegia', 'latin', 'bachillerato', '{2}', 3),
('F', 'contiene', 'Recurso retórico que consiste en atribuir cualidades humanas a seres inanimados', 'prosopopeya', 'latin', 'bachillerato', '{2}', 3),
('G', 'contiene', 'Obra poética de Virgilio que trata sobre la agricultura y la vida campesina romana', 'georgicas', 'latin', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Poeta lírico latino autor de las Odas y las Sátiras, defensor del carpe diem', 'horacio', 'latin', 'bachillerato', '{2}', 1),
('I', 'contiene', 'Construcción latina con sujeto en acusativo y verbo en infinitivo propia del estilo indirecto', 'infinitivo', 'latin', 'bachillerato', '{2}', 2),
('J', 'contiene', 'Poeta satírico latino que criticó duramente la corrupción de la Roma imperial', 'juvenal', 'latin', 'bachillerato', '{2}', 2),
('L', 'contiene', 'Historiador romano que escribió Ab Urbe Condita narrando la historia de Roma desde su fundación', 'livio', 'latin', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Sistema de medida del ritmo en la poesía latina basado en sílabas largas y breves', 'metrica', 'latin', 'bachillerato', '{2}', 1),
('N', 'contiene', 'Filósofo cordobés y preceptor de Nerón, autor de tratados morales y tragedias', 'seneca', 'latin', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Poeta latino autor de las Metamorfosis y el Arte de amar, exiliado por Augusto', 'ovidio', 'latin', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Construcción latina absoluta con sujeto en ablativo y participio concertado', 'participio', 'latin', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Arte de la persuasión mediante el discurso, fundamental en la educación romana', 'retorica', 'latin', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Historiador romano autor de La conjuración de Catilina y La guerra de Jugurta', 'salustio', 'latin', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Historiador romano que narró la historia del Imperio en sus Anales y las Historias', 'tacito', 'latin', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Verso latino compuesto por seis pies dáctilos utilizado en la épica', 'hexametro', 'latin', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Poeta latino autor de la Eneida, las Bucólicas y las Geórgicas, máximo exponente de la épica latina', 'virgilio', 'latin', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Lengua derivada del latín vulgar hablada en los territorios del antiguo Imperio Romano', 'romance', 'latin', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Máxima o expresión breve latina que encierra una enseñanza moral o práctica', 'maxima', 'latin', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Tipo de oración subordinada latina que expresa finalidad introducida por ut con subjuntivo', 'final', 'latin', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Filósofo estoico romano de origen hispano que fue preceptor del emperador Nerón', 'seneca', 'latin', 'bachillerato', '{2}', 1);


-- =============================================================================
-- 2. RUNNER CATEGORIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('historia-mundo', 'bachillerato', '{1}', 'Revolucion Francesa', '["guillotina","bastilla","jacobinos","girondinos","robespierre","danton","convencion","directorio","asamblea","termidor","sans-culottes","borbones"]'),
('historia-mundo', 'bachillerato', '{1}', 'Revolucion Industrial', '["fabrica","vapor","ferrocarril","proletariado","burguesia","ludismo","cartismo","textil","carbon","siderurgia","urbanizacion","mecanizacion"]'),
('historia-mundo', 'bachillerato', '{1}', 'Imperialismo', '["colonia","metrópoli","protectorado","concesion","berlin","exploracion","misionero","mandato","cipayo","boer","suez","congo"]'),
('historia-mundo', 'bachillerato', '{1}', 'Primera Guerra Mundial', '["trinchera","verdun","somme","armisticio","aliados","imperios","zepelin","gas","marne","gallipoli","lusitania","propaganda"]'),
('historia-mundo', 'bachillerato', '{1}', 'Periodo entreguerras', '["fascismo","nazismo","crack","depresion","hiperinflacion","weimar","mussolini","hitler","stalin","colectivizacion","purgas","estalinismo"]'),
('historia-mundo', 'bachillerato', '{1}', 'Segunda Guerra Mundial', '["blitzkrieg","stalingrado","normandia","hiroshima","holocausto","resistencia","pearl harbor","nuremberg","enigma","midway","yalta","potsdam"]'),
('historia-mundo', 'bachillerato', '{1}', 'Guerra Fria', '["bipolaridad","telón","otan","varsovia","coexistencia","disuasion","mccarthismo","sputnik","muro","cuba","vietnam","détente"]'),
('historia-mundo', 'bachillerato', '{1}', 'Descolonizacion', '["independencia","negritud","panarabismo","bandung","nehru","nasser","gandhi","apartheid","mandela","argelia","congo","sukarno"]'),
('historia-mundo', 'bachillerato', '{1}', 'Mundo actual', '["globalizacion","terrorismo","internet","multipolaridad","brexit","cambio climatico","migracion","populismo","ciberguerra","pandemia","desinformacion","sostenibilidad"]'),
('historia-mundo', 'bachillerato', '{1}', 'Ideologias contemporaneas', '["liberalismo","socialismo","comunismo","anarquismo","fascismo","conservadurismo","feminismo","ecologismo","nacionalismo","populismo","socialdemocracia","neoliberalismo"]');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('historia-espana', 'bachillerato', '{2}', 'Al-Andalus', '["omeyas","califato","taifas","almohades","almoravides","alhambra","mezquita","acequia","alcazar","medina","zoco","mudejar"]'),
('historia-espana', 'bachillerato', '{2}', 'Reconquista', '["covadonga","navas","fernandoiii","jaimeI","pelayo","cid","cruzada","repoblacion","fueros","ordenes militares","parias","frontera"]'),
('historia-espana', 'bachillerato', '{2}', 'Reyes Catolicos', '["isabel","fernando","granada","inquisicion","america","colon","santa hermandad","cortes","capitulaciones","moriscos","judios","expulsion"]'),
('historia-espana', 'bachillerato', '{2}', 'Imperio de los Austrias', '["carlosv","felipeii","armada","lepanto","flandes","valido","olivares","lerma","decadencia","westfalia","escorial","tercios"]'),
('historia-espana', 'bachillerato', '{2}', 'Siglo XVIII Borbones', '["felipev","sucesion","utrecht","decretos","ilustracion","reformas","jovellanos","floridablanca","despotismo","centralismo","manufactura","aranjuez"]'),
('historia-espana', 'bachillerato', '{2}', 'Siglo XIX', '["cadiz","constitucion","carlismo","desamortizacion","mendizabal","isabelii","sexenio","restauracion","canovas","turnismo","caciquismo","regeneracionismo"]'),
('historia-espana', 'bachillerato', '{2}', 'Republica y Guerra Civil', '["republica","azana","frente popular","alzamiento","franco","brigadas","guernica","ebro","evacuacion","exilio","maquis","retaguardia"]'),
('historia-espana', 'bachillerato', '{2}', 'Franquismo', '["autarquia","desarrollismo","opus","tecnócratas","censura","sindical","falange","concordato","bases","apertura","represion","monocultivo"]'),
('historia-espana', 'bachillerato', '{2}', 'Transicion y democracia', '["juancarlos","suarez","reforma","amnistia","constitucion","autonomias","golpe","tejero","psoe","gonzalez","europa","descentralizacion"]'),
('historia-espana', 'bachillerato', '{2}', 'Hispania romana', '["numancia","romanizacion","calzada","acueducto","villa","senado","legión","derecho","hispania","emerita","tarraco","itálica"]');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('geografia', 'bachillerato', '{2}', 'Relieve peninsular', '["meseta","pirineos","betica","iberica","cantabrica","penillanura","paramo","submeseta","depresion","guadalquivir","ebro","sierra"]'),
('geografia', 'bachillerato', '{2}', 'Climas de España', '["oceanico","mediterraneo","continental","subtropical","aridez","precipitacion","isoterma","anticiclon","borrasca","foehn","cierzo","calima"]'),
('geografia', 'bachillerato', '{2}', 'Hidrografia', '["ebro","duero","tajo","guadiana","guadalquivir","segura","jucar","embalse","acuifero","cuenca","caudal","estiaje"]'),
('geografia', 'bachillerato', '{2}', 'Vegetacion', '["encina","alcornoque","roble","haya","laurisilva","maquia","garriga","estepa","pinsapo","dehesa","coscojar","tabaiba"]'),
('geografia', 'bachillerato', '{2}', 'Poblacion', '["natalidad","mortalidad","migracion","envejecimiento","piramide","densidad","censo","padron","exodo","inmigracion","fecundidad","esperanza"]'),
('geografia', 'bachillerato', '{2}', 'Urbanismo', '["metrópoli","conurbacion","periurbano","ensanche","casco","periferia","suburbanizacion","gentrificacion","dormitorio","poligono","peatonalizacion","movilidad"]'),
('geografia', 'bachillerato', '{2}', 'Sector primario', '["agricultura","ganaderia","pesca","mineria","regadio","secano","pac","latifundio","minifundio","acuicultura","invernadero","monocultivo"]'),
('geografia', 'bachillerato', '{2}', 'Sector secundario y terciario', '["industria","energia","turismo","transporte","comercio","servicios","reconversion","tecnologia","exportacion","logistica","innovacion","eolica"]'),
('geografia', 'bachillerato', '{2}', 'España en la UE', '["adhesion","fondos","convergencia","eurozona","schengen","politica agraria","cohesion","mercado","directiva","parlamento","comision","tratado"]'),
('geografia', 'bachillerato', '{2}', 'Medio ambiente', '["desertificacion","erosion","contaminacion","residuos","reciclaje","renovable","parque natural","biodiversidad","cambio climatico","huella","sostenible","proteccion"]');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('arte', 'bachillerato', '{2}', 'Arte griego y romano', '["partenon","dorico","jonico","corintio","acropolis","coliseo","panteon","mosaico","escultura","frontón","arco","anfiteatro"]'),
('arte', 'bachillerato', '{2}', 'Romanico y Gotico', '["arco medio punto","boveda cañon","cruceria","arbotante","rosetón","portico","timpano","capitel","claustro","catedral","vidriera","contrafuerte"]'),
('arte', 'bachillerato', '{2}', 'Renacimiento', '["perspectiva","proporcion","sfumato","cupula","brunelleschi","donatello","botticelli","rafael","leonardo","miguelangel","mecenas","humanismo"]'),
('arte', 'bachillerato', '{2}', 'Barroco', '["claroscuro","tenebrismo","columna salomonica","caravaggio","bernini","rembrandt","velazquez","rubens","dinamismo","teatralidad","contrarreforma","grandeza"]'),
('arte', 'bachillerato', '{2}', 'Neoclasicismo y Romanticismo', '["david","canova","goya","delacroix","turner","sublime","ruinas","razon","emocion","libertad","ingres","friedrich"]'),
('arte', 'bachillerato', '{2}', 'Impresionismo y Postimpresionismo', '["monet","renoir","degas","pissarro","cezanne","vangogh","gauguin","seurat","puntillismo","luz","plein air","instantánea"]'),
('arte', 'bachillerato', '{2}', 'Vanguardias', '["cubismo","expresionismo","futurismo","dadaismo","surrealismo","abstraccion","constructivismo","fauvismo","picasso","braque","kandinsky","duchamp"]'),
('arte', 'bachillerato', '{2}', 'Arte contemporaneo', '["popart","minimalismo","conceptual","instalacion","performance","warhol","pollock","rothko","hiperrealismo","videoarte","land art","haring"]'),
('arte', 'bachillerato', '{2}', 'Arte español', '["velazquez","goya","gaudi","picasso","dali","miro","tapies","chillida","sorolla","zurbarán","murillo","berruguete"]'),
('arte', 'bachillerato', '{2}', 'Arquitectura siglo XX', '["funcionalismo","bauhaus","lecorbusier","mies","wright","rascacielos","brutalismo","deconstructivismo","gehry","calatrava","foster","hormigon"]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('economia', 'bachillerato', '{1}', 'Conceptos basicos', '["escasez","necesidad","coste oportunidad","frontera","eficiencia","equidad","produccion","distribucion","consumo","intercambio","especializacion","ventaja"]'),
('economia', 'bachillerato', '{1}', 'Mercado', '["oferta","demanda","equilibrio","precio","competencia","monopolio","oligopolio","elasticidad","excedente","externalidad","regulación","subsidio"]'),
('economia', 'bachillerato', '{1}', 'Macroeconomia', '["pib","inflacion","desempleo","crecimiento","recesion","deficit","deuda","balanza","renta","ahorro","inversion","productividad"]'),
('economia', 'bachillerato', '{1}', 'Politica economica', '["fiscal","monetaria","presupuesto","impuesto","gasto","interes","bce","intervencion","regulacion","estabilizacion","redistribucion","liberalizacion"]'),
('economia', 'bachillerato', '{1}', 'Sistema financiero', '["banco","bolsa","accion","bono","hipoteca","deposito","credito","seguro","fondo","riesgo","liquidez","rentabilidad"]'),
('economia', 'bachillerato', '{1}', 'Comercio internacional', '["exportacion","importacion","arancel","cuota","balanza","divisa","proteccionismo","libre comercio","omc","globalizacion","competitividad","ventaja comparativa"]'),
('economia', 'bachillerato', '{1}', 'Sector publico', '["estado","impuesto","irpf","iva","presupuesto","gasto","deficit","deuda","pensiones","sanidad","educacion","bienestar"]'),
('economia', 'bachillerato', '{1}', 'Dinero e inflacion', '["dinero","moneda","euro","tipo interes","deflacion","estanflacion","ipc","hiperinflacion","bce","reserva","encaje","multiplicador"]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('economia-empresa', 'bachillerato', '{2}', 'Formas juridicas', '["autonomo","sociedad limitada","anonima","cooperativa","comanditaria","colectiva","comunidad bienes","franquicia","holding","grupo empresarial","filial","matriz"]'),
('economia-empresa', 'bachillerato', '{2}', 'Organizacion', '["organigrama","jerarquia","departamento","staff","lineal","funcional","matricial","divisional","delegacion","centralizacion","coordinacion","supervision"]'),
('economia-empresa', 'bachillerato', '{2}', 'Recursos humanos', '["seleccion","contrato","nomina","convenio","formacion","motivacion","liderazgo","despido","sindicato","negociacion","productividad","evaluacion"]'),
('economia-empresa', 'bachillerato', '{2}', 'Marketing', '["producto","precio","distribucion","promocion","marca","publicidad","segmentacion","posicionamiento","fidelizacion","merchandising","estudio mercado","packaging"]'),
('economia-empresa', 'bachillerato', '{2}', 'Contabilidad', '["balance","activo","pasivo","patrimonio","cuenta resultados","amortizacion","provision","inventario","asiento","debe","haber","pgc"]'),
('economia-empresa', 'bachillerato', '{2}', 'Financiacion', '["autofinanciacion","credito","prestamo","leasing","factoring","capital","reservas","empréstito","subvencion","crowdfunding","business angel","accion"]'),
('economia-empresa', 'bachillerato', '{2}', 'Produccion', '["productividad","eficiencia","calidad","inventario","just in time","cadena valor","outsourcing","innovacion","tecnología","automatizacion","logistica","stock"]'),
('economia-empresa', 'bachillerato', '{2}', 'Analisis estrategico', '["dafo","pest","porter","mision","vision","estrategia","ventaja competitiva","cadena valor","benchmarking","stakeholder","entorno","diversificacion"]');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('latin', 'bachillerato', '{1}', 'Casos latinos', '["nominativo","vocativo","acusativo","genitivo","dativo","ablativo","sujeto","complemento","posesion","instrumento","direccion","agente"]'),
('latin', 'bachillerato', '{1}', 'Declinaciones', '["primera","segunda","tercera","cuarta","quinta","rosa","dominus","consul","manus","dies","tema","desinencia"]'),
('latin', 'bachillerato', '{1}', 'Conjugaciones', '["primera","segunda","tercera","cuarta","mixta","amo","habeo","lego","audio","capio","sum","possum"]'),
('latin', 'bachillerato', '{1}', 'Dioses romanos', '["jupiter","juno","minerva","marte","venus","mercurio","neptuno","pluton","diana","apolo","vulcano","ceres"]'),
('latin', 'bachillerato', '{1}', 'Vida romana', '["foro","senado","termas","anfiteatro","domus","insula","toga","legion","gladiador","patricio","plebeyo","esclavo"]'),
('latin', 'bachillerato', '{1}', 'Lexico latino en español', '["acuatico","agricultura","capital","doctor","familia","gratitud","humano","laborar","magistrado","nocturno","orbita","popular"]'),
('latin', 'bachillerato', '{1}', 'Tiempos verbales', '["presente","imperfecto","futuro","perfecto","pluscuamperfecto","futuro perfecto","indicativo","subjuntivo","imperativo","infinitivo","participio","gerundio"]'),
('latin', 'bachillerato', '{1}', 'Mitologia romana', '["romulo","remo","eneas","dido","orfeo","proserpina","hercules","teseo","minotauro","medusa","perseo","aquiles"]');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('latin', 'bachillerato', '{2}', 'Autores latinos', '["virgilio","horacio","ovidio","ciceron","cesar","salustio","livio","tacito","seneca","juvenal","catulo","lucrecio"]'),
('latin', 'bachillerato', '{2}', 'Obras latinas', '["eneida","odas","metamorfosis","catilinarias","galias","historias","anales","cartas","sátiras","bucólicas","georgicas","elegías"]'),
('latin', 'bachillerato', '{2}', 'Generos literarios latinos', '["epica","lirica","satira","elegia","oratoria","historiografia","epistola","fabula","comedia","tragedia","didactica","filosofia"]'),
('latin', 'bachillerato', '{2}', 'Retorica', '["metafora","metonimia","hiperbole","anafora","aliteracion","antitesis","ironia","prosopopeya","paralelismo","climax","elipsis","quiasmo"]'),
('latin', 'bachillerato', '{2}', 'Metrica latina', '["hexametro","pentametro","distico","yambo","dactilo","espondeo","cesura","elisión","prosodia","pie","arsis","tesis"]'),
('latin', 'bachillerato', '{2}', 'Pervivencia del latin', '["romance","castellano","catalan","gallego","portugues","frances","italiano","rumano","cultismo","patrimonial","semicultismo","prestamo"]'),
('latin', 'bachillerato', '{2}', 'Sintaxis latina avanzada', '["ablativo absoluto","acusativo exclamativo","genitivo partitivo","dativo posesivo","consecutiva","final","causal","concesiva","temporal","condicional","comparativa","relativa"]'),
('latin', 'bachillerato', '{2}', 'Expresiones latinas', '["carpe diem","alea jacta est","veni vidi vici","in dubio pro reo","ad hoc","curriculum","alma mater","alter ego","habeas corpus","sui generis","grosso modo","modus operandi"]');


-- =============================================================================
-- 3. INTRUSO SETS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('historia-mundo', 'bachillerato', '{1}', 'Lideres de la Revolucion Francesa', '["Robespierre","Danton","Marat","Saint-Just"]', '["Bismarck","Garibaldi"]'),
('historia-mundo', 'bachillerato', '{1}', 'Batallas de la I Guerra Mundial', '["Verdún","Somme","Marne","Gallípoli"]', '["Stalingrado","Normandía"]'),
('historia-mundo', 'bachillerato', '{1}', 'Paises del Eje en la IIGM', '["Alemania","Italia","Japón","Hungría"]', '["Francia","URSS"]'),
('historia-mundo', 'bachillerato', '{1}', 'Organizaciones de la Guerra Fria', '["OTAN","Pacto Varsovia","COMECON","SEATO"]', '["ONU","Cruz Roja"]'),
('historia-mundo', 'bachillerato', '{1}', 'Inventos de la Revolucion Industrial', '["Máquina de vapor","Telar mecánico","Locomotora","Altos hornos"]', '["Teléfono","Avión"]'),
('historia-mundo', 'bachillerato', '{1}', 'Dictadores del siglo XX', '["Hitler","Mussolini","Stalin","Franco"]', '["Churchill","Roosevelt"]'),
('historia-mundo', 'bachillerato', '{1}', 'Conferencias de paz IIGM', '["Yalta","Potsdam","Teherán","Casablanca"]', '["Viena","Berlín"]'),
('historia-mundo', 'bachillerato', '{1}', 'Causas de la I Guerra Mundial', '["Imperialismo","Nacionalismo","Militarismo","Alianzas"]', '["Comunismo","Fascismo"]'),
('historia-mundo', 'bachillerato', '{1}', 'Lideres de la descolonizacion', '["Gandhi","Nehru","Nasser","Ho Chi Minh"]', '["De Gaulle","Truman"]'),
('historia-mundo', 'bachillerato', '{1}', 'Consecuencias del Tratado de Versalles', '["Reparaciones alemanas","Pérdida de Alsacia","Desmilitarización Renania","Sociedad de Naciones"]', '["Plan Marshall","Muro de Berlín"]');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('historia-espana', 'bachillerato', '{2}', 'Reinos medievales cristianos', '["Castilla","Aragón","Navarra","León"]', '["Granada","Córdoba"]'),
('historia-espana', 'bachillerato', '{2}', 'Reformas de los Reyes Catolicos', '["Inquisición","Santa Hermandad","Expulsión judíos","Conquista Granada"]', '["Desamortización","Constitución"]'),
('historia-espana', 'bachillerato', '{2}', 'Reyes de la Casa de Austria', '["Carlos I","Felipe II","Felipe III","Carlos II"]', '["Felipe V","Carlos III"]'),
('historia-espana', 'bachillerato', '{2}', 'Constituciones españolas del XIX', '["Constitución 1812","Constitución 1837","Constitución 1845","Constitución 1876"]', '["Constitución 1931","Constitución 1978"]'),
('historia-espana', 'bachillerato', '{2}', 'Batallas de la Guerra Civil', '["Ebro","Brunete","Jarama","Teruel"]', '["Trafalgar","Bailén"]'),
('historia-espana', 'bachillerato', '{2}', 'Politicos de la Transicion', '["Adolfo Suárez","Torcuato Fernández Miranda","Santiago Carrillo","Manuel Fraga"]', '["Cánovas","Sagasta"]'),
('historia-espana', 'bachillerato', '{2}', 'Etapas de Al-Andalus', '["Emirato dependiente","Califato de Córdoba","Reinos de Taifas","Reino Nazarí"]', '["Reino Visigodo","Corona de Aragón"]'),
('historia-espana', 'bachillerato', '{2}', 'Medidas del franquismo', '["Autarquía","Censura","Movimiento Nacional","Sindicato Vertical"]', '["Sufragio universal","Autonomías"]'),
('historia-espana', 'bachillerato', '{2}', 'Presidentes de la democracia', '["Suárez","González","Aznar","Zapatero"]', '["Primo de Rivera","Cánovas"]'),
('historia-espana', 'bachillerato', '{2}', 'Pueblos prerromanos de Hispania', '["Iberos","Celtas","Celtíberos","Tartessos"]', '["Vikingos","Francos"]');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('geografia', 'bachillerato', '{2}', 'Rios de la vertiente atlantica', '["Tajo","Duero","Guadiana","Guadalquivir"]', '["Ebro","Júcar"]'),
('geografia', 'bachillerato', '{2}', 'Cordilleras de la Peninsula', '["Pirineos","Cantábrica","Ibérica","Bética"]', '["Alpes","Apeninos"]'),
('geografia', 'bachillerato', '{2}', 'Climas de España', '["Oceánico","Mediterráneo","Continental","Subtropical"]', '["Ecuatorial","Polar"]'),
('geografia', 'bachillerato', '{2}', 'Comunidades mas pobladas', '["Andalucía","Cataluña","Madrid","Valencia"]', '["La Rioja","Cantabria"]'),
('geografia', 'bachillerato', '{2}', 'Energias renovables', '["Eólica","Solar","Hidroeléctrica","Biomasa"]', '["Nuclear","Gas natural"]'),
('geografia', 'bachillerato', '{2}', 'Problemas ambientales de España', '["Desertificación","Incendios forestales","Contaminación","Sobreexplotación acuíferos"]', '["Tsunamis","Terremotos"]'),
('geografia', 'bachillerato', '{2}', 'Ciudades españolas patrimonio UNESCO', '["Toledo","Segovia","Córdoba","Salamanca"]', '["Bilbao","Alicante"]'),
('geografia', 'bachillerato', '{2}', 'Arboles del bosque mediterraneo', '["Encina","Alcornoque","Acebuche","Pino carrasco"]', '["Haya","Abedul"]'),
('geografia', 'bachillerato', '{2}', 'Actividades del sector terciario', '["Turismo","Comercio","Transporte","Educación"]', '["Minería","Ganadería"]'),
('geografia', 'bachillerato', '{2}', 'Parques nacionales españoles', '["Doñana","Ordesa","Teide","Picos de Europa"]', '["Yellowstone","Serengeti"]');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('arte', 'bachillerato', '{2}', 'Pintores impresionistas', '["Monet","Renoir","Degas","Pissarro"]', '["Picasso","Dalí"]'),
('arte', 'bachillerato', '{2}', 'Obras de Velazquez', '["Las Meninas","La rendición de Breda","La fragua de Vulcano","Las hilanderas"]', '["El Guernica","La Gioconda"]'),
('arte', 'bachillerato', '{2}', 'Elementos del arte gotico', '["Arco apuntado","Bóveda de crucería","Arbotante","Rosetón"]', '["Arco de medio punto","Bóveda de cañón"]'),
('arte', 'bachillerato', '{2}', 'Artistas del Renacimiento italiano', '["Leonardo","Miguel Ángel","Rafael","Botticelli"]', '["Rembrandt","Rubens"]'),
('arte', 'bachillerato', '{2}', 'Movimientos de vanguardia', '["Cubismo","Surrealismo","Dadaísmo","Futurismo"]', '["Romanticismo","Neoclasicismo"]'),
('arte', 'bachillerato', '{2}', 'Escultores del Barroco', '["Bernini","Gregorio Fernández","Salzillo","Juan de Mesa"]', '["Donatello","Praxíteles"]'),
('arte', 'bachillerato', '{2}', 'Ordenes arquitectonicos griegos', '["Dórico","Jónico","Corintio","Compuesto"]', '["Románico","Gótico"]'),
('arte', 'bachillerato', '{2}', 'Obras de Goya', '["Los fusilamientos","La maja desnuda","Saturno","El coloso"]', '["Las meninas","La Gioconda"]'),
('arte', 'bachillerato', '{2}', 'Arquitectos modernistas', '["Gaudí","Domènech i Montaner","Puig i Cadafalch","Horta"]', '["Le Corbusier","Mies van der Rohe"]'),
('arte', 'bachillerato', '{2}', 'Artistas del Pop Art', '["Warhol","Lichtenstein","Oldenburg","Hamilton"]', '["Mondrian","Kandinsky"]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('economia', 'bachillerato', '{1}', 'Tipos de mercado', '["Competencia perfecta","Monopolio","Oligopolio","Competencia monopolística"]', '["Mercado negro","Trueque"]'),
('economia', 'bachillerato', '{1}', 'Indicadores macroeconomicos', '["PIB","IPC","Tasa de paro","Balanza de pagos"]', '["DAFO","ROI"]'),
('economia', 'bachillerato', '{1}', 'Impuestos directos', '["IRPF","Impuesto de Sociedades","Impuesto de Patrimonio","Impuesto de Sucesiones"]', '["IVA","Impuestos Especiales"]'),
('economia', 'bachillerato', '{1}', 'Funciones del dinero', '["Medio de cambio","Depósito de valor","Unidad de cuenta","Patrón de pagos"]', '["Bien de consumo","Factor productivo"]'),
('economia', 'bachillerato', '{1}', 'Factores de produccion', '["Tierra","Trabajo","Capital","Tecnología"]', '["Dinero","Precio"]'),
('economia', 'bachillerato', '{1}', 'Politicas expansivas', '["Bajar impuestos","Aumentar gasto público","Bajar tipos de interés","Comprar deuda"]', '["Subir impuestos","Reducir gasto"]'),
('economia', 'bachillerato', '{1}', 'Organismos economicos internacionales', '["FMI","Banco Mundial","OMC","OCDE"]', '["OMS","UNESCO"]'),
('economia', 'bachillerato', '{1}', 'Causas de la inflacion', '["Exceso de demanda","Aumento costes","Exceso de dinero","Expectativas alcistas"]', '["Recesión","Deflación"]'),
('economia', 'bachillerato', '{1}', 'Tipos de desempleo', '["Friccional","Estructural","Cíclico","Estacional"]', '["Inflacionario","Fiscal"]'),
('economia', 'bachillerato', '{1}', 'Ventajas del libre comercio', '["Especialización","Economías de escala","Mayor variedad","Menores precios"]', '["Desempleo","Dependencia"]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('economia-empresa', 'bachillerato', '{2}', 'Funciones del marketing mix', '["Producto","Precio","Distribución","Comunicación"]', '["Contabilidad","Producción"]'),
('economia-empresa', 'bachillerato', '{2}', 'Fuentes de financiacion propia', '["Capital social","Reservas","Amortizaciones","Beneficios no distribuidos"]', '["Préstamo bancario","Leasing"]'),
('economia-empresa', 'bachillerato', '{2}', 'Teorias de motivacion', '["Maslow","Herzberg","McGregor","Vroom"]', '["Taylor","Ford"]'),
('economia-empresa', 'bachillerato', '{2}', 'Tipos de sociedad mercantil', '["Anónima","Limitada","Cooperativa","Comanditaria"]', '["Autónomo","Comunidad de bienes"]'),
('economia-empresa', 'bachillerato', '{2}', 'Documentos contables', '["Balance","Cuenta de resultados","Memoria","Estado de flujos de efectivo"]', '["Factura","Albarán"]'),
('economia-empresa', 'bachillerato', '{2}', 'Estrategias de crecimiento', '["Diversificación","Integración vertical","Fusión","Joint venture"]', '["Quiebra","Liquidación"]'),
('economia-empresa', 'bachillerato', '{2}', 'Elementos del plan de empresa', '["Estudio de mercado","Plan financiero","Plan de marketing","Plan de operaciones"]', '["Declaración fiscal","Nóminas"]'),
('economia-empresa', 'bachillerato', '{2}', 'Criterios de seleccion de inversiones', '["VAN","TIR","Payback","Índice rentabilidad"]', '["ROA","EBITDA"]'),
('economia-empresa', 'bachillerato', '{2}', 'Funciones del departamento de RRHH', '["Selección","Formación","Evaluación","Prevención riesgos"]', '["Facturación","Logística"]'),
('economia-empresa', 'bachillerato', '{2}', 'Tipos de estructura organizativa', '["Lineal","Funcional","Matricial","Divisional"]', '["Fiscal","Monetaria"]');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('latin', 'bachillerato', '{1}', 'Casos del latin', '["Nominativo","Acusativo","Genitivo","Dativo"]', '["Indicativo","Subjuntivo"]'),
('latin', 'bachillerato', '{1}', 'Dioses olímpicos romanos', '["Júpiter","Marte","Venus","Neptuno"]', '["Zeus","Poseidón"]'),
('latin', 'bachillerato', '{1}', 'Tiempos del indicativo latino', '["Presente","Imperfecto","Futuro imperfecto","Perfecto"]', '["Presente subjuntivo","Imperativo"]'),
('latin', 'bachillerato', '{1}', 'Edificios romanos', '["Coliseo","Panteón","Foro","Termas"]', '["Partenón","Acrópolis"]'),
('latin', 'bachillerato', '{1}', 'Sustantivos de la 1a declinacion', '["Rosa","Puella","Poeta","Agricola"]', '["Dominus","Puer"]'),
('latin', 'bachillerato', '{1}', 'Heroes de la mitologia romana', '["Eneas","Hércules","Rómulo","Perseo"]', '["Odiseo","Aquiles"]'),
('latin', 'bachillerato', '{1}', 'Clases sociales romanas', '["Patricio","Plebeyo","Esclavo","Liberto"]', '["Faraón","Vasallo"]'),
('latin', 'bachillerato', '{1}', 'Palabras españolas de origen latino', '["Acueducto","Manuscrito","Omnívoro","Agricultura"]', '["Algoritmo","Almacén"]'),
('latin', 'bachillerato', '{1}', 'Provincias de Hispania romana', '["Tarraconense","Bética","Lusitania","Gallaecia"]', '["Galia","Britania"]'),
('latin', 'bachillerato', '{1}', 'Partes de la domus romana', '["Atrium","Tablinum","Triclinium","Peristylum"]', '["Ágora","Stoa"]');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('latin', 'bachillerato', '{2}', 'Poetas latinos', '["Virgilio","Horacio","Ovidio","Catulo"]', '["Homero","Hesíodo"]'),
('latin', 'bachillerato', '{2}', 'Obras de Ciceron', '["Catilinarias","De amicitia","De re publica","Filípicas"]', '["Eneida","Metamorfosis"]'),
('latin', 'bachillerato', '{2}', 'Historiadores latinos', '["Tácito","Livio","Salustio","Suetonio"]', '["Heródoto","Tucídides"]'),
('latin', 'bachillerato', '{2}', 'Figuras retoricas latinas', '["Metáfora","Anáfora","Hipérbole","Aliteración"]', '["Ablativo","Genitivo"]'),
('latin', 'bachillerato', '{2}', 'Tipos de oracion subordinada latina', '["Completiva","Causal","Final","Consecutiva"]', '["Nominativo","Vocativo"]'),
('latin', 'bachillerato', '{2}', 'Metros de la poesia latina', '["Hexámetro","Pentámetro","Yambo","Dístico elegíaco"]', '["Soneto","Alejandrino"]'),
('latin', 'bachillerato', '{2}', 'Lenguas romances', '["Castellano","Francés","Italiano","Portugués"]', '["Alemán","Inglés"]'),
('latin', 'bachillerato', '{2}', 'Obras de Virgilio', '["Eneida","Bucólicas","Geórgicas","Égloga IV"]', '["Odas","Metamorfosis"]'),
('latin', 'bachillerato', '{2}', 'Autores de teatro latino', '["Plauto","Terencio","Séneca","Livio Andrónico"]', '["Sófocles","Eurípides"]'),
('latin', 'bachillerato', '{2}', 'Expresiones latinas vigentes', '["Carpe diem","Habeas corpus","Curriculum vitae","Alter ego"]', '["Déjà vu","Rendez-vous"]');


-- =============================================================================
-- 4. PAREJAS ITEMS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('historia-mundo', 'bachillerato', '{1}', 'Revolución Francesa', '1789'),
('historia-mundo', 'bachillerato', '{1}', 'Revolución Industrial', 'Gran Bretaña'),
('historia-mundo', 'bachillerato', '{1}', 'Napoleón', 'Emperador francés'),
('historia-mundo', 'bachillerato', '{1}', 'Congreso de Viena', 'Restauración 1815'),
('historia-mundo', 'bachillerato', '{1}', 'Karl Marx', 'El Capital'),
('historia-mundo', 'bachillerato', '{1}', 'Bismarck', 'Unificación alemana'),
('historia-mundo', 'bachillerato', '{1}', 'Conferencia de Berlín', 'Reparto de África'),
('historia-mundo', 'bachillerato', '{1}', 'Archiduque Francisco Fernando', 'Atentado Sarajevo'),
('historia-mundo', 'bachillerato', '{1}', 'Tratado de Versalles', 'Fin I Guerra Mundial'),
('historia-mundo', 'bachillerato', '{1}', 'Crack del 29', 'Gran Depresión'),
('historia-mundo', 'bachillerato', '{1}', 'Hitler', 'Nazismo'),
('historia-mundo', 'bachillerato', '{1}', 'Mussolini', 'Fascismo italiano'),
('historia-mundo', 'bachillerato', '{1}', 'Desembarco de Normandía', '6 junio 1944'),
('historia-mundo', 'bachillerato', '{1}', 'Hiroshima', 'Bomba atómica'),
('historia-mundo', 'bachillerato', '{1}', 'Plan Marshall', 'Reconstrucción Europa'),
('historia-mundo', 'bachillerato', '{1}', 'OTAN', 'Alianza occidental'),
('historia-mundo', 'bachillerato', '{1}', 'Muro de Berlín', '1961-1989'),
('historia-mundo', 'bachillerato', '{1}', 'Gandhi', 'Independencia India'),
('historia-mundo', 'bachillerato', '{1}', 'Gorbachov', 'Perestroika'),
('historia-mundo', 'bachillerato', '{1}', 'Caída URSS', '1991');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('historia-espana', 'bachillerato', '{2}', 'Batalla de Covadonga', '722'),
('historia-espana', 'bachillerato', '{2}', 'Califato de Córdoba', 'Abderramán III'),
('historia-espana', 'bachillerato', '{2}', 'Navas de Tolosa', '1212'),
('historia-espana', 'bachillerato', '{2}', 'Reyes Católicos', 'Unión dinástica'),
('historia-espana', 'bachillerato', '{2}', 'Descubrimiento de América', '1492'),
('historia-espana', 'bachillerato', '{2}', 'Carlos I', 'Emperador del Sacro Imperio'),
('historia-espana', 'bachillerato', '{2}', 'Felipe II', 'El Escorial'),
('historia-espana', 'bachillerato', '{2}', 'Guerra de Sucesión', 'Tratado de Utrecht'),
('historia-espana', 'bachillerato', '{2}', 'Constitución de Cádiz', '1812'),
('historia-espana', 'bachillerato', '{2}', 'Desamortización', 'Mendizábal'),
('historia-espana', 'bachillerato', '{2}', 'Guerras carlistas', 'Conflicto sucesorio'),
('historia-espana', 'bachillerato', '{2}', 'Restauración', 'Cánovas del Castillo'),
('historia-espana', 'bachillerato', '{2}', 'Desastre del 98', 'Pérdida de Cuba'),
('historia-espana', 'bachillerato', '{2}', 'Dictadura Primo de Rivera', '1923-1930'),
('historia-espana', 'bachillerato', '{2}', 'II República', '14 abril 1931'),
('historia-espana', 'bachillerato', '{2}', 'Guerra Civil', '1936-1939'),
('historia-espana', 'bachillerato', '{2}', 'Plan de Estabilización', '1959'),
('historia-espana', 'bachillerato', '{2}', 'Muerte de Franco', '20 noviembre 1975'),
('historia-espana', 'bachillerato', '{2}', 'Constitución española', '1978'),
('historia-espana', 'bachillerato', '{2}', 'Ingreso en la CEE', '1986');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('geografia', 'bachillerato', '{2}', 'Meseta Central', 'Submeseta Norte y Sur'),
('geografia', 'bachillerato', '{2}', 'Pirineos', 'Frontera con Francia'),
('geografia', 'bachillerato', '{2}', 'Teide', 'Punto más alto de España'),
('geografia', 'bachillerato', '{2}', 'Ebro', 'Desemboca en Mediterráneo'),
('geografia', 'bachillerato', '{2}', 'Guadalquivir', 'Desemboca en Atlántico'),
('geografia', 'bachillerato', '{2}', 'Clima oceánico', 'Cornisa cantábrica'),
('geografia', 'bachillerato', '{2}', 'Clima mediterráneo', 'Veranos secos'),
('geografia', 'bachillerato', '{2}', 'Dehesa', 'Encina y alcornoque'),
('geografia', 'bachillerato', '{2}', 'Éxodo rural', 'Años 60 del siglo XX'),
('geografia', 'bachillerato', '{2}', 'Envejecimiento', 'Baja natalidad'),
('geografia', 'bachillerato', '{2}', 'PAC', 'Política Agraria Común'),
('geografia', 'bachillerato', '{2}', 'Reconversión industrial', 'Años 80'),
('geografia', 'bachillerato', '{2}', 'Turismo de sol y playa', 'Sector terciario'),
('geografia', 'bachillerato', '{2}', 'Ensanche', 'Expansión urbana siglo XIX'),
('geografia', 'bachillerato', '{2}', 'Doñana', 'Parque Nacional Huelva'),
('geografia', 'bachillerato', '{2}', 'Desertificación', 'Sureste peninsular'),
('geografia', 'bachillerato', '{2}', 'FEDER', 'Fondos estructurales UE'),
('geografia', 'bachillerato', '{2}', 'España vaciada', 'Despoblación rural'),
('geografia', 'bachillerato', '{2}', 'Islas Canarias', 'Clima subtropical'),
('geografia', 'bachillerato', '{2}', 'Energía eólica', 'Fuente renovable');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('arte', 'bachillerato', '{2}', 'Partenón', 'Arte griego clásico'),
('arte', 'bachillerato', '{2}', 'Coliseo', 'Anfiteatro romano'),
('arte', 'bachillerato', '{2}', 'Catedral de Chartres', 'Gótico francés'),
('arte', 'bachillerato', '{2}', 'La Gioconda', 'Leonardo da Vinci'),
('arte', 'bachillerato', '{2}', 'La Capilla Sixtina', 'Miguel Ángel'),
('arte', 'bachillerato', '{2}', 'Las Meninas', 'Velázquez'),
('arte', 'bachillerato', '{2}', 'El Guernica', 'Picasso'),
('arte', 'bachillerato', '{2}', 'La persistencia de la memoria', 'Salvador Dalí'),
('arte', 'bachillerato', '{2}', 'Impresión: sol naciente', 'Claude Monet'),
('arte', 'bachillerato', '{2}', 'El David', 'Miguel Ángel'),
('arte', 'bachillerato', '{2}', 'Éxtasis de Santa Teresa', 'Bernini'),
('arte', 'bachillerato', '{2}', 'Los fusilamientos', 'Goya'),
('arte', 'bachillerato', '{2}', 'La Sagrada Familia', 'Gaudí'),
('arte', 'bachillerato', '{2}', 'Noche estrellada', 'Van Gogh'),
('arte', 'bachillerato', '{2}', 'Latas de sopa Campbell', 'Andy Warhol'),
('arte', 'bachillerato', '{2}', 'Sfumato', 'Técnica de Leonardo'),
('arte', 'bachillerato', '{2}', 'Claroscuro', 'Caravaggio'),
('arte', 'bachillerato', '{2}', 'Arco apuntado', 'Arquitectura gótica'),
('arte', 'bachillerato', '{2}', 'Bóveda de cañón', 'Arquitectura románica'),
('arte', 'bachillerato', '{2}', 'Ready-made', 'Marcel Duchamp');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('economia', 'bachillerato', '{1}', 'Adam Smith', 'Liberalismo económico'),
('economia', 'bachillerato', '{1}', 'Keynes', 'Intervención estatal'),
('economia', 'bachillerato', '{1}', 'PIB', 'Producción total de un país'),
('economia', 'bachillerato', '{1}', 'IPC', 'Índice de precios'),
('economia', 'bachillerato', '{1}', 'Inflación', 'Subida general de precios'),
('economia', 'bachillerato', '{1}', 'Deflación', 'Bajada general de precios'),
('economia', 'bachillerato', '{1}', 'Monopolio', 'Un solo oferente'),
('economia', 'bachillerato', '{1}', 'Oligopolio', 'Pocos oferentes'),
('economia', 'bachillerato', '{1}', 'IRPF', 'Impuesto directo progresivo'),
('economia', 'bachillerato', '{1}', 'IVA', 'Impuesto indirecto al consumo'),
('economia', 'bachillerato', '{1}', 'BCE', 'Banco Central Europeo'),
('economia', 'bachillerato', '{1}', 'FMI', 'Fondo Monetario Internacional'),
('economia', 'bachillerato', '{1}', 'Balanza comercial', 'Exportaciones menos importaciones'),
('economia', 'bachillerato', '{1}', 'Coste de oportunidad', 'Lo que se renuncia al elegir'),
('economia', 'bachillerato', '{1}', 'Ley de oferta', 'Más precio, más cantidad'),
('economia', 'bachillerato', '{1}', 'Ley de demanda', 'Más precio, menos cantidad'),
('economia', 'bachillerato', '{1}', 'Política fiscal', 'Impuestos y gasto público'),
('economia', 'bachillerato', '{1}', 'Política monetaria', 'Control del dinero en circulación'),
('economia', 'bachillerato', '{1}', 'Desempleo estructural', 'Cambio en sectores productivos'),
('economia', 'bachillerato', '{1}', 'Ventaja comparativa', 'Menor coste de oportunidad');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('economia-empresa', 'bachillerato', '{2}', 'Balance', 'Situación patrimonial'),
('economia-empresa', 'bachillerato', '{2}', 'Activo', 'Bienes y derechos'),
('economia-empresa', 'bachillerato', '{2}', 'Pasivo', 'Obligaciones y deudas'),
('economia-empresa', 'bachillerato', '{2}', 'Patrimonio neto', 'Activo menos pasivo'),
('economia-empresa', 'bachillerato', '{2}', 'Marketing mix', 'Producto, precio, distribución, comunicación'),
('economia-empresa', 'bachillerato', '{2}', 'DAFO', 'Debilidades, amenazas, fortalezas, oportunidades'),
('economia-empresa', 'bachillerato', '{2}', 'VAN', 'Valor Actual Neto'),
('economia-empresa', 'bachillerato', '{2}', 'TIR', 'Tasa Interna de Rentabilidad'),
('economia-empresa', 'bachillerato', '{2}', 'Punto muerto', 'Ingresos igualan costes'),
('economia-empresa', 'bachillerato', '{2}', 'ROA', 'Rentabilidad sobre activos'),
('economia-empresa', 'bachillerato', '{2}', 'Maslow', 'Pirámide de necesidades'),
('economia-empresa', 'bachillerato', '{2}', 'Taylor', 'Organización científica del trabajo'),
('economia-empresa', 'bachillerato', '{2}', 'Sociedad Anónima', 'Capital en acciones'),
('economia-empresa', 'bachillerato', '{2}', 'Sociedad Limitada', 'Capital en participaciones'),
('economia-empresa', 'bachillerato', '{2}', 'Leasing', 'Arrendamiento financiero'),
('economia-empresa', 'bachillerato', '{2}', 'Factoring', 'Cesión de derechos de cobro'),
('economia-empresa', 'bachillerato', '{2}', 'Organigrama', 'Estructura jerárquica'),
('economia-empresa', 'bachillerato', '{2}', 'Costes fijos', 'No varían con producción'),
('economia-empresa', 'bachillerato', '{2}', 'Costes variables', 'Varían con producción'),
('economia-empresa', 'bachillerato', '{2}', 'Segmentación', 'Dividir mercado en grupos');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('latin', 'bachillerato', '{1}', 'Nominativo', 'Sujeto'),
('latin', 'bachillerato', '{1}', 'Acusativo', 'Complemento directo'),
('latin', 'bachillerato', '{1}', 'Genitivo', 'Complemento del nombre'),
('latin', 'bachillerato', '{1}', 'Dativo', 'Complemento indirecto'),
('latin', 'bachillerato', '{1}', 'Ablativo', 'Complemento circunstancial'),
('latin', 'bachillerato', '{1}', 'Vocativo', 'Apelación directa'),
('latin', 'bachillerato', '{1}', 'Júpiter', 'Zeus'),
('latin', 'bachillerato', '{1}', 'Venus', 'Afrodita'),
('latin', 'bachillerato', '{1}', 'Marte', 'Ares'),
('latin', 'bachillerato', '{1}', 'Mercurio', 'Hermes'),
('latin', 'bachillerato', '{1}', 'Minerva', 'Atenea'),
('latin', 'bachillerato', '{1}', 'Diana', 'Artemisa'),
('latin', 'bachillerato', '{1}', 'Amo, amas', '1ª conjugación'),
('latin', 'bachillerato', '{1}', 'Habeo, habes', '2ª conjugación'),
('latin', 'bachillerato', '{1}', 'Lego, legis', '3ª conjugación'),
('latin', 'bachillerato', '{1}', 'Audio, audis', '4ª conjugación'),
('latin', 'bachillerato', '{1}', 'Rosa, rosae', '1ª declinación'),
('latin', 'bachillerato', '{1}', 'Dominus, domini', '2ª declinación'),
('latin', 'bachillerato', '{1}', 'Consul, consulis', '3ª declinación'),
('latin', 'bachillerato', '{1}', 'Foro', 'Plaza pública romana');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('latin', 'bachillerato', '{2}', 'Virgilio', 'Eneida'),
('latin', 'bachillerato', '{2}', 'Horacio', 'Odas'),
('latin', 'bachillerato', '{2}', 'Ovidio', 'Metamorfosis'),
('latin', 'bachillerato', '{2}', 'Cicerón', 'Catilinarias'),
('latin', 'bachillerato', '{2}', 'César', 'De bello Gallico'),
('latin', 'bachillerato', '{2}', 'Tácito', 'Anales'),
('latin', 'bachillerato', '{2}', 'Livio', 'Ab Urbe Condita'),
('latin', 'bachillerato', '{2}', 'Salustio', 'Conjuración de Catilina'),
('latin', 'bachillerato', '{2}', 'Séneca', 'Epístolas morales'),
('latin', 'bachillerato', '{2}', 'Juvenal', 'Sátiras'),
('latin', 'bachillerato', '{2}', 'Plauto', 'Comedia latina'),
('latin', 'bachillerato', '{2}', 'Catulo', 'Poesía lírica amorosa'),
('latin', 'bachillerato', '{2}', 'Hexámetro dactílico', 'Verso de la épica'),
('latin', 'bachillerato', '{2}', 'Dístico elegíaco', 'Hexámetro + pentámetro'),
('latin', 'bachillerato', '{2}', 'Carpe diem', 'Aprovecha el momento'),
('latin', 'bachillerato', '{2}', 'Alea iacta est', 'La suerte está echada'),
('latin', 'bachillerato', '{2}', 'Ablativo absoluto', 'Construcción participial independiente'),
('latin', 'bachillerato', '{2}', 'Oración completiva', 'Ut/ne + subjuntivo'),
('latin', 'bachillerato', '{2}', 'Cum histórico', 'Conjunción temporal-causal'),
('latin', 'bachillerato', '{2}', 'Acusativo con infinitivo', 'Estilo indirecto latino');


-- =============================================================================
-- 5. ORDENA FRASES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Francesa de 1789 acabó con el Antiguo Régimen y proclamó los derechos del hombre y del ciudadano'),
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Industrial transformó la economía europea al sustituir el trabajo manual por máquinas movidas por vapor'),
('historia-mundo', 'bachillerato', '{1}', 'El imperialismo europeo del siglo XIX provocó el reparto colonial de África y Asia entre las grandes potencias'),
('historia-mundo', 'bachillerato', '{1}', 'El asesinato del archiduque Francisco Fernando en Sarajevo desencadenó el estallido de la Primera Guerra Mundial'),
('historia-mundo', 'bachillerato', '{1}', 'El Tratado de Versalles impuso duras condiciones a Alemania que generaron un profundo resentimiento en la población'),
('historia-mundo', 'bachillerato', '{1}', 'La crisis económica de 1929 provocó una Gran Depresión mundial con millones de desempleados en Europa y América'),
('historia-mundo', 'bachillerato', '{1}', 'Hitler llegó al poder en Alemania en 1933 aprovechando la crisis económica y el descontento de la población'),
('historia-mundo', 'bachillerato', '{1}', 'La Segunda Guerra Mundial terminó en 1945 con la derrota de las potencias del Eje y millones de víctimas'),
('historia-mundo', 'bachillerato', '{1}', 'La Guerra Fría enfrentó a dos bloques ideológicos liderados por Estados Unidos y la Unión Soviética durante décadas'),
('historia-mundo', 'bachillerato', '{1}', 'El proceso de descolonización permitió que numerosos países de África y Asia alcanzaran su independencia política'),
('historia-mundo', 'bachillerato', '{1}', 'La caída del Muro de Berlín en 1989 simbolizó el final de la división europea y el inicio de una nueva era'),
('historia-mundo', 'bachillerato', '{1}', 'La creación de la ONU en 1945 buscaba mantener la paz mundial y resolver conflictos mediante el diálogo diplomático'),
('historia-mundo', 'bachillerato', '{1}', 'El Plan Marshall proporcionó ayuda económica estadounidense a los países europeos devastados por la Segunda Guerra Mundial'),
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Rusa de 1917 derrocó al zarismo e instauró el primer Estado socialista de la historia moderna'),
('historia-mundo', 'bachillerato', '{1}', 'La globalización ha intensificado las conexiones económicas y culturales entre todos los países del mundo contemporáneo');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('historia-espana', 'bachillerato', '{2}', 'La conquista musulmana de la Península Ibérica en el año 711 dio inicio a ocho siglos de presencia islámica'),
('historia-espana', 'bachillerato', '{2}', 'La Reconquista fue un proceso de varios siglos mediante el cual los reinos cristianos recuperaron territorio peninsular'),
('historia-espana', 'bachillerato', '{2}', 'Los Reyes Católicos unificaron los reinos de Castilla y Aragón y completaron la conquista de Granada en 1492'),
('historia-espana', 'bachillerato', '{2}', 'El Imperio español alcanzó su máxima extensión durante los reinados de Carlos I y Felipe II en el siglo XVI'),
('historia-espana', 'bachillerato', '{2}', 'La Guerra de Sucesión Española terminó con el Tratado de Utrecht y la instauración de la dinastía Borbón'),
('historia-espana', 'bachillerato', '{2}', 'La Constitución de Cádiz de 1812 fue la primera carta magna española y estableció la soberanía nacional'),
('historia-espana', 'bachillerato', '{2}', 'Las desamortizaciones del siglo XIX transformaron la propiedad de la tierra al vender bienes eclesiásticos y comunales'),
('historia-espana', 'bachillerato', '{2}', 'El sistema de la Restauración se basó en el turno pacífico entre conservadores y liberales ideado por Cánovas'),
('historia-espana', 'bachillerato', '{2}', 'El desastre del 98 supuso la pérdida de Cuba y Filipinas y provocó una profunda crisis nacional en España'),
('historia-espana', 'bachillerato', '{2}', 'La Segunda República española se proclamó el 14 de abril de 1931 tras la victoria republicana en las municipales'),
('historia-espana', 'bachillerato', '{2}', 'La Guerra Civil española enfrentó al bando republicano y al sublevado entre julio de 1936 y abril de 1939'),
('historia-espana', 'bachillerato', '{2}', 'El franquismo mantuvo un régimen dictatorial en España durante casi cuatro décadas hasta la muerte de Franco'),
('historia-espana', 'bachillerato', '{2}', 'La Transición democrática permitió pasar de la dictadura a un sistema democrático de forma pacífica y consensuada'),
('historia-espana', 'bachillerato', '{2}', 'La Constitución de 1978 estableció una monarquía parlamentaria y el Estado de las Autonomías en España'),
('historia-espana', 'bachillerato', '{2}', 'La entrada de España en la Comunidad Económica Europea en 1986 supuso una modernización económica y social profunda');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('geografia', 'bachillerato', '{2}', 'La Meseta Central ocupa la mayor parte de la Península Ibérica y se divide en Submeseta Norte y Sur'),
('geografia', 'bachillerato', '{2}', 'El clima mediterráneo se caracteriza por veranos cálidos y secos e inviernos suaves con precipitaciones moderadas'),
('geografia', 'bachillerato', '{2}', 'Los ríos de la vertiente atlántica son los más largos y caudalosos de la Península Ibérica por la inclinación del relieve'),
('geografia', 'bachillerato', '{2}', 'El envejecimiento de la población española se debe a la baja natalidad y al aumento de la esperanza de vida'),
('geografia', 'bachillerato', '{2}', 'El éxodo rural de los años sesenta provocó el despoblamiento del interior y el crecimiento de las grandes ciudades'),
('geografia', 'bachillerato', '{2}', 'El turismo constituye uno de los principales motores económicos de España y genera millones de empleos directos'),
('geografia', 'bachillerato', '{2}', 'La Política Agraria Común de la Unión Europea ha condicionado la modernización del sector primario español'),
('geografia', 'bachillerato', '{2}', 'La reconversión industrial de los años ochenta transformó la estructura productiva de las regiones siderúrgicas españolas'),
('geografia', 'bachillerato', '{2}', 'La desertificación afecta especialmente al sureste peninsular debido a la escasez de precipitaciones y la degradación del suelo'),
('geografia', 'bachillerato', '{2}', 'Las energías renovables como la eólica y la solar tienen un peso creciente en el sistema energético español'),
('geografia', 'bachillerato', '{2}', 'El sistema urbano español se organiza en torno a las grandes áreas metropolitanas de Madrid y Barcelona'),
('geografia', 'bachillerato', '{2}', 'Las Islas Canarias presentan un clima subtropical con temperaturas suaves durante todo el año y escasas precipitaciones'),
('geografia', 'bachillerato', '{2}', 'El sector servicios emplea a más del sesenta por ciento de la población activa española en la actualidad'),
('geografia', 'bachillerato', '{2}', 'La inmigración ha sido un factor clave del crecimiento demográfico español desde finales del siglo veinte'),
('geografia', 'bachillerato', '{2}', 'Los espacios naturales protegidos de España contribuyen a la conservación de la biodiversidad y los ecosistemas peninsulares');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('arte', 'bachillerato', '{2}', 'El arte griego clásico estableció los cánones de belleza y proporción que influyeron en toda la cultura occidental'),
('arte', 'bachillerato', '{2}', 'La arquitectura románica se caracteriza por el arco de medio punto y las bóvedas de cañón con muros gruesos'),
('arte', 'bachillerato', '{2}', 'Las catedrales góticas alcanzaron grandes alturas gracias al uso de arbotantes y bóvedas de crucería con vidrieras'),
('arte', 'bachillerato', '{2}', 'El Renacimiento italiano recuperó los ideales clásicos de belleza y colocó al ser humano como centro del arte'),
('arte', 'bachillerato', '{2}', 'El Barroco utilizó la teatralidad y los contrastes de luz para provocar emociones intensas en el espectador'),
('arte', 'bachillerato', '{2}', 'Velázquez revolucionó la pintura barroca española con su dominio de la perspectiva aérea y la captación de la luz'),
('arte', 'bachillerato', '{2}', 'Goya fue un artista puente entre el Neoclasicismo y el Romanticismo que anticipó las vanguardias del siglo XX'),
('arte', 'bachillerato', '{2}', 'Los pintores impresionistas abandonaron el taller para pintar al aire libre y captar los efectos cambiantes de la luz'),
('arte', 'bachillerato', '{2}', 'Las vanguardias artísticas del siglo XX rompieron con la tradición académica y exploraron nuevas formas de expresión'),
('arte', 'bachillerato', '{2}', 'Picasso creó el cubismo junto a Braque fragmentando los objetos en múltiples perspectivas geométricas simultáneas'),
('arte', 'bachillerato', '{2}', 'El surrealismo exploró el mundo del subconsciente y los sueños influido por las teorías psicoanalíticas de Freud'),
('arte', 'bachillerato', '{2}', 'Gaudí desarrolló una arquitectura orgánica única que integra formas naturales y técnicas innovadoras en Barcelona'),
('arte', 'bachillerato', '{2}', 'El arte contemporáneo ha ampliado los límites de la creación artística incorporando nuevos materiales y tecnologías digitales'),
('arte', 'bachillerato', '{2}', 'El Pop Art tomó imágenes de la cultura popular y la publicidad para crear obras que cuestionaban el consumismo moderno'),
('arte', 'bachillerato', '{2}', 'La arquitectura funcionalista del siglo XX priorizó la utilidad y los nuevos materiales como el hormigón armado y el acero');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('economia', 'bachillerato', '{1}', 'La ley de la oferta y la demanda determina el precio de equilibrio en un mercado de competencia perfecta'),
('economia', 'bachillerato', '{1}', 'El Producto Interior Bruto mide el valor total de los bienes y servicios producidos en un país durante un año'),
('economia', 'bachillerato', '{1}', 'La inflación supone una subida generalizada y sostenida de los precios que reduce el poder adquisitivo del dinero'),
('economia', 'bachillerato', '{1}', 'La política fiscal utiliza los impuestos y el gasto público para influir en el nivel de actividad económica'),
('economia', 'bachillerato', '{1}', 'La política monetaria del Banco Central Europeo regula la cantidad de dinero en circulación y los tipos de interés'),
('economia', 'bachillerato', '{1}', 'El desempleo estructural se produce cuando las habilidades de los trabajadores no coinciden con las necesidades del mercado'),
('economia', 'bachillerato', '{1}', 'La balanza de pagos registra todas las transacciones económicas de un país con el resto del mundo'),
('economia', 'bachillerato', '{1}', 'El coste de oportunidad representa el valor de la mejor alternativa a la que se renuncia al tomar una decisión'),
('economia', 'bachillerato', '{1}', 'Los monopolios reducen la competencia y pueden fijar precios más altos al ser los únicos oferentes del mercado'),
('economia', 'bachillerato', '{1}', 'El sistema financiero canaliza el ahorro de las familias hacia la inversión productiva de las empresas'),
('economia', 'bachillerato', '{1}', 'La globalización económica ha intensificado el comercio internacional y la interdependencia entre las economías nacionales'),
('economia', 'bachillerato', '{1}', 'Los impuestos progresivos como el IRPF gravan más a quienes tienen mayores ingresos para redistribuir la riqueza'),
('economia', 'bachillerato', '{1}', 'Las externalidades negativas como la contaminación suponen costes sociales que el mercado no refleja en los precios'),
('economia', 'bachillerato', '{1}', 'La especialización productiva permite a los países comerciar aprovechando sus ventajas comparativas en costes de producción'),
('economia', 'bachillerato', '{1}', 'El Estado del bienestar proporciona servicios públicos esenciales como sanidad y educación financiados mediante impuestos');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('economia-empresa', 'bachillerato', '{2}', 'El balance de situación refleja los bienes derechos y obligaciones de una empresa en un momento determinado'),
('economia-empresa', 'bachillerato', '{2}', 'El marketing mix combina las variables de producto precio distribución y comunicación para satisfacer al consumidor'),
('economia-empresa', 'bachillerato', '{2}', 'El análisis DAFO identifica las debilidades amenazas fortalezas y oportunidades de una empresa frente a su entorno'),
('economia-empresa', 'bachillerato', '{2}', 'La sociedad anónima es una forma jurídica cuyo capital está dividido en acciones y sus socios tienen responsabilidad limitada'),
('economia-empresa', 'bachillerato', '{2}', 'El punto muerto indica el nivel de ventas a partir del cual la empresa comienza a obtener beneficios netos'),
('economia-empresa', 'bachillerato', '{2}', 'La selección de personal busca encontrar al candidato más adecuado para cubrir un puesto de trabajo en la organización'),
('economia-empresa', 'bachillerato', '{2}', 'El Valor Actual Neto permite evaluar la rentabilidad de una inversión actualizando los flujos de caja futuros esperados'),
('economia-empresa', 'bachillerato', '{2}', 'La segmentación de mercado consiste en dividir a los consumidores en grupos homogéneos según sus características y necesidades'),
('economia-empresa', 'bachillerato', '{2}', 'La estructura organizativa define cómo se distribuyen las tareas y responsabilidades dentro de una empresa para alcanzar sus objetivos'),
('economia-empresa', 'bachillerato', '{2}', 'Los costes fijos permanecen constantes independientemente del volumen de producción mientras que los variables cambian proporcionalmente'),
('economia-empresa', 'bachillerato', '{2}', 'La autofinanciación permite a la empresa crecer utilizando sus propios beneficios sin recurrir a fuentes externas de capital'),
('economia-empresa', 'bachillerato', '{2}', 'El plan de empresa es un documento que describe la viabilidad económica y financiera de un nuevo proyecto empresarial'),
('economia-empresa', 'bachillerato', '{2}', 'La productividad mide la relación entre la cantidad de bienes producidos y los recursos utilizados en el proceso productivo'),
('economia-empresa', 'bachillerato', '{2}', 'La responsabilidad social corporativa integra preocupaciones sociales y medioambientales en las actividades comerciales de la empresa'),
('economia-empresa', 'bachillerato', '{2}', 'El liderazgo empresarial implica la capacidad de motivar y dirigir a los empleados hacia los objetivos estratégicos de la organización');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('latin', 'bachillerato', '{1}', 'El latín es una lengua indoeuropea de la que derivan las lenguas romances como el español y el francés'),
('latin', 'bachillerato', '{1}', 'Las declinaciones latinas son cinco modelos de flexión nominal que indican la función del sustantivo en la oración'),
('latin', 'bachillerato', '{1}', 'El caso acusativo en latín indica el complemento directo y se usa también para expresar dirección hacia un lugar'),
('latin', 'bachillerato', '{1}', 'Los romanos construyeron calzadas acueductos y anfiteatros que aún perviven como testimonio de su avanzada civilización'),
('latin', 'bachillerato', '{1}', 'La mitología romana adoptó muchos dioses griegos cambiándoles el nombre como Júpiter por Zeus o Venus por Afrodita'),
('latin', 'bachillerato', '{1}', 'El foro romano era el centro de la vida pública donde se celebraban asambleas políticas y transacciones comerciales'),
('latin', 'bachillerato', '{1}', 'Las conjugaciones latinas agrupan los verbos en cuatro modelos según la vocal temática de su raíz'),
('latin', 'bachillerato', '{1}', 'El alfabeto latino es la base del sistema de escritura utilizado en la mayoría de las lenguas europeas actuales'),
('latin', 'bachillerato', '{1}', 'Los gladiadores combatían en el anfiteatro para entretenimiento del pueblo romano en espectáculos públicos organizados por el Estado'),
('latin', 'bachillerato', '{1}', 'La sociedad romana se dividía en patricios plebeyos libertos y esclavos según su nacimiento y condición jurídica'),
('latin', 'bachillerato', '{1}', 'El verbo latino tiene seis tiempos en indicativo y cuatro en subjuntivo además del imperativo y las formas nominales'),
('latin', 'bachillerato', '{1}', 'Muchas palabras españolas de uso cotidiano proceden directamente del latín como familia doctor capital y agricultura'),
('latin', 'bachillerato', '{1}', 'Rómulo y Remo fueron según la leyenda los fundadores de Roma tras ser amamantados por una loba en el monte'),
('latin', 'bachillerato', '{1}', 'El genitivo latino expresa posesión y es equivalente al complemento del nombre introducido por la preposición de en español'),
('latin', 'bachillerato', '{1}', 'La Eneida de Virgilio narra el viaje del héroe troyano Eneas hasta Italia donde fundó la estirpe romana');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('latin', 'bachillerato', '{2}', 'Virgilio es considerado el mayor poeta latino gracias a la Eneida que narra el origen mítico de Roma'),
('latin', 'bachillerato', '{2}', 'Cicerón fue el orador más importante de Roma y sus discursos contra Catilina son modelos de elocuencia latina'),
('latin', 'bachillerato', '{2}', 'El ablativo absoluto es una construcción latina formada por un sustantivo en ablativo y un participio concertado'),
('latin', 'bachillerato', '{2}', 'Las Metamorfosis de Ovidio recopilan más de doscientos mitos de transformación de la mitología grecorromana'),
('latin', 'bachillerato', '{2}', 'La métrica latina se basa en la cantidad vocálica distinguiendo entre sílabas largas y breves para formar los versos'),
('latin', 'bachillerato', '{2}', 'Horacio acuñó la expresión carpe diem que invita a disfrutar del momento presente sin preocuparse por el futuro'),
('latin', 'bachillerato', '{2}', 'César narró sus campañas militares en la Galia con un estilo claro y directo que lo convirtió en modelo de prosa'),
('latin', 'bachillerato', '{2}', 'Séneca fue un filósofo estoico hispano que escribió tratados morales y tragedias siendo preceptor del emperador Nerón'),
('latin', 'bachillerato', '{2}', 'Las lenguas romances heredaron del latín vulgar la mayor parte de su léxico y buena parte de su estructura gramatical'),
('latin', 'bachillerato', '{2}', 'Tácito es considerado el historiador más crítico de Roma imperial por sus Anales y sus Historias sobre los emperadores'),
('latin', 'bachillerato', '{2}', 'El hexámetro dactílico es el verso fundamental de la épica latina compuesto por seis pies métricos alternados'),
('latin', 'bachillerato', '{2}', 'La retórica latina desarrolló técnicas de persuasión que siguen siendo la base de la argumentación y la oratoria moderna'),
('latin', 'bachillerato', '{2}', 'Las expresiones latinas como habeas corpus o curriculum vitae perviven en el lenguaje jurídico y académico actual'),
('latin', 'bachillerato', '{2}', 'Salustio escribió sobre la conjuración de Catilina con un estilo conciso que influyó en los historiadores posteriores'),
('latin', 'bachillerato', '{2}', 'La pervivencia del latín en el español se observa tanto en cultismos heredados directamente como en palabras patrimoniales evolucionadas');


-- =============================================================================
-- 6. ORDENA HISTORIAS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('historia-mundo', 'bachillerato', '{1}', '["En 1789, el pueblo de París asaltó la Bastilla como símbolo contra el absolutismo.","La Asamblea Nacional aprobó la Declaración de los Derechos del Hombre y del Ciudadano.","Robespierre instauró el Terror ejecutando a miles de opositores en la guillotina.","Napoleón Bonaparte dio un golpe de Estado y se proclamó emperador de Francia.","Tras la derrota en Waterloo, el Congreso de Viena restauró el orden monárquico en Europa."]'),
('historia-mundo', 'bachillerato', '{1}', '["El asesinato del archiduque Francisco Fernando en Sarajevo desencadenó la I Guerra Mundial.","Las trincheras del frente occidental causaron un estancamiento militar sin precedentes.","La entrada de Estados Unidos en 1917 inclinó la balanza a favor de los aliados.","Alemania firmó el armisticio el 11 de noviembre de 1918 poniendo fin al conflicto.","El Tratado de Versalles impuso a Alemania reparaciones de guerra y pérdidas territoriales."]'),
('historia-mundo', 'bachillerato', '{1}', '["La crisis económica del 29 provocó el desplome de la bolsa de Nueva York.","Millones de personas perdieron su empleo y se extendió la pobreza en todo el mundo.","Hitler aprovechó el descontento social para llegar al poder en Alemania en 1933.","La invasión de Polonia en 1939 desencadenó el estallido de la Segunda Guerra Mundial.","Los aliados liberaron Europa y la guerra terminó con la rendición de Alemania y Japón en 1945."]'),
('historia-mundo', 'bachillerato', '{1}', '["Tras la II Guerra Mundial, el mundo se dividió en dos bloques liderados por EEUU y la URSS.","La OTAN y el Pacto de Varsovia organizaron militarmente a cada bloque.","La crisis de los misiles de Cuba en 1962 llevó al mundo al borde de la guerra nuclear.","La carrera espacial y armamentística marcó décadas de tensión entre ambas superpotencias.","La caída del Muro de Berlín en 1989 simbolizó el fin de la Guerra Fría."]'),
('historia-mundo', 'bachillerato', '{1}', '["Las potencias europeas colonizaron África y Asia durante el siglo XIX en busca de materias primas.","Tras la II Guerra Mundial, los movimientos independentistas cobraron fuerza en las colonias.","La India logró su independencia en 1947 liderada por Mahatma Gandhi y su lucha no violenta.","Numerosos países africanos alcanzaron la independencia durante la década de 1960.","La descolonización dejó fronteras artificiales que generaron conflictos étnicos y políticos duraderos."]');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('historia-espana', 'bachillerato', '{2}', '["En el año 711, los musulmanes cruzaron el estrecho de Gibraltar e invadieron la Península.","El Califato de Córdoba alcanzó su máximo esplendor cultural y económico en el siglo X.","La fragmentación del Califato en reinos de taifas debilitó Al-Ándalus.","Los reinos cristianos avanzaron hacia el sur en la Reconquista durante varios siglos.","La toma de Granada en 1492 por los Reyes Católicos puso fin a la presencia musulmana."]'),
('historia-espana', 'bachillerato', '{2}', '["Carlos I heredó un vasto imperio que incluía España, los Países Bajos y América.","Felipe II convirtió a España en la primera potencia mundial y construyó El Escorial.","La derrota de la Armada Invencible en 1588 marcó el inicio del declive naval español.","Los reinados de Felipe III y Felipe IV se caracterizaron por el gobierno de los validos.","Carlos II murió sin descendencia provocando la Guerra de Sucesión y el fin de los Austrias."]'),
('historia-espana', 'bachillerato', '{2}', '["Napoleón invadió España en 1808 provocando el levantamiento popular del 2 de mayo.","Las Cortes de Cádiz aprobaron en 1812 la primera Constitución liberal española.","Fernando VII restauró el absolutismo y anuló las reformas liberales de Cádiz.","Las guerras carlistas enfrentaron a liberales y absolutistas durante décadas del siglo XIX.","La Restauración borbónica de 1874 estableció un sistema de turnismo político hasta 1923."]'),
('historia-espana', 'bachillerato', '{2}', '["La dictadura de Primo de Rivera cayó en 1930 dando paso a un periodo de inestabilidad.","La Segunda República se proclamó el 14 de abril de 1931 con grandes esperanzas de reforma.","El alzamiento militar del 18 de julio de 1936 dividió España en dos bandos enfrentados.","La Guerra Civil duró tres años y causó cientos de miles de muertos y el exilio de miles.","Franco instauró una dictadura que perduró desde 1939 hasta su muerte en noviembre de 1975."]'),
('historia-espana', 'bachillerato', '{2}', '["Tras la muerte de Franco, Juan Carlos I fue proclamado rey e impulsó la reforma política.","Adolfo Suárez lideró la Transición negociando con todas las fuerzas políticas del país.","La Constitución de 1978 fue aprobada en referéndum estableciendo una monarquía parlamentaria.","El intento de golpe de Estado del 23-F en 1981 fue frustrado reforzando la democracia.","La entrada de España en la CEE en 1986 consolidó su integración europea y modernización."]');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('geografia', 'bachillerato', '{2}', '["La Meseta Central es la unidad de relieve más extensa de la Península Ibérica.","Las cordilleras que bordean la Meseta son la Cantábrica al norte y Sierra Morena al sur.","Los Pirineos forman la frontera natural entre España y Francia al noreste.","Las depresiones del Ebro y del Guadalquivir se sitúan entre la Meseta y las cordilleras exteriores.","Las costas españolas alternan playas bajas en el Mediterráneo con acantilados en el Cantábrico."]'),
('geografia', 'bachillerato', '{2}', '["El éxodo rural de los años sesenta vació el interior de España de población.","Las grandes ciudades como Madrid y Barcelona crecieron rápidamente con la inmigración interior.","En los años ochenta la llegada de inmigrantes extranjeros cambió la estructura demográfica.","El envejecimiento de la población se ha convertido en un problema demográfico grave.","La España vaciada busca soluciones para revitalizar los municipios rurales despoblados."]'),
('geografia', 'bachillerato', '{2}', '["El sector primario español se modernizó con la entrada en la Comunidad Económica Europea.","La reconversión industrial de los ochenta cerró muchas fábricas obsoletas en el norte.","El turismo de sol y playa se consolidó como motor económico desde los años sesenta.","El sector servicios pasó a emplear a más de la mitad de la población activa española.","La economía española se diversifica hoy con tecnología, energías renovables y logística."]'),
('geografia', 'bachillerato', '{2}', '["El clima oceánico del norte peninsular se caracteriza por lluvias abundantes durante todo el año.","El clima mediterráneo domina la mayor parte de la península con veranos secos y calurosos.","El interior presenta un clima continental con grandes diferencias de temperatura entre estaciones.","Las Islas Canarias disfrutan de un clima subtropical con temperaturas suaves todo el año.","El cambio climático amenaza con agravar la aridez y la desertificación en el sureste español."]'),
('geografia', 'bachillerato', '{2}', '["España ingresó en la CEE en 1986 iniciando un proceso de convergencia económica.","Los fondos estructurales europeos financiaron infraestructuras y modernización del país.","La adopción del euro en 2002 integró plenamente a España en la economía europea.","La crisis de 2008 golpeó duramente la economía española con alto desempleo.","La recuperación posterior apostó por exportaciones, turismo y transformación digital."]');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('arte', 'bachillerato', '{2}', '["El arte griego estableció los órdenes dórico, jónico y corintio en la arquitectura clásica.","Roma adoptó el arte griego y desarrolló nuevas técnicas como el arco y la bóveda.","El arte románico surgió en la Europa medieval con iglesias de muros gruesos y poca luz.","El gótico revolucionó la arquitectura con catedrales de grandes alturas y vidrieras luminosas.","El Renacimiento recuperó los ideales clásicos y situó al ser humano en el centro del arte."]'),
('arte', 'bachillerato', '{2}', '["Leonardo da Vinci pintó La Gioconda revolucionando el retrato con la técnica del sfumato.","Miguel Ángel esculpió el David y pintó la bóveda de la Capilla Sixtina en Roma.","Rafael alcanzó la perfección clásica en La escuela de Atenas en los aposentos del Vaticano.","El Manierismo introdujo formas alargadas y composiciones inestables como reacción al equilibrio renacentista.","El Barroco estalló con Caravaggio y su uso dramático del claroscuro en escenas religiosas."]'),
('arte', 'bachillerato', '{2}', '["Velázquez dominó la pintura barroca española con obras maestras como Las Meninas.","Goya transitó del Neoclasicismo al Romanticismo y anticipó la modernidad con sus Pinturas Negras.","Los impresionistas franceses como Monet pintaron al aire libre capturando los efectos de la luz.","Las vanguardias del siglo XX rompieron con la tradición: cubismo, expresionismo, surrealismo.","Picasso pintó el Guernica en 1937 denunciando los horrores de la guerra con formas cubistas."]'),
('arte', 'bachillerato', '{2}', '["El Neoclasicismo recuperó las formas grecorromanas como reacción a los excesos del Barroco tardío.","El Romanticismo exaltó las emociones, la naturaleza salvaje y el individualismo del artista.","El Realismo de mediados del XIX retrató la vida cotidiana de las clases trabajadoras.","El Impresionismo abandonó el taller para captar la luz natural y el instante fugaz.","El Postimpresionismo de Cézanne y Van Gogh sentó las bases de las vanguardias del siglo XX."]'),
('arte', 'bachillerato', '{2}', '["Gaudí comenzó las obras de la Sagrada Familia en Barcelona en 1883 con un estilo único.","El Art Nouveau se extendió por Europa a principios del siglo XX con formas orgánicas y curvas.","La Bauhaus alemana unió arte, diseño y funcionalidad en los años veinte.","Le Corbusier propuso una arquitectura funcional basada en pilotis, planta libre y fachada cortina.","La arquitectura contemporánea de Gehry y Calatrava experimenta con formas orgánicas y nuevos materiales."]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('economia', 'bachillerato', '{1}', '["Los seres humanos tienen necesidades ilimitadas pero los recursos para satisfacerlas son escasos.","La economía estudia cómo asignar eficientemente los recursos escasos entre usos alternativos.","Los agentes económicos son las familias, las empresas y el sector público.","Las familias ofrecen trabajo y consumen bienes; las empresas producen y contratan trabajadores.","El Estado interviene regulando, redistribuyendo la renta y proporcionando bienes públicos."]'),
('economia', 'bachillerato', '{1}', '["La oferta y la demanda determinan los precios en un mercado de competencia perfecta.","Cuando el precio sube, la cantidad demandada tiende a bajar según la ley de demanda.","Cuando el precio sube, la cantidad ofertada tiende a subir según la ley de oferta.","El equilibrio se alcanza cuando la cantidad ofertada iguala a la cantidad demandada.","Si el gobierno fija un precio máximo por debajo del equilibrio, se genera escasez."]'),
('economia', 'bachillerato', '{1}', '["El PIB mide el valor de toda la producción de bienes y servicios en un año.","Una economía crece cuando su PIB real aumenta de un periodo a otro.","La inflación reduce el poder adquisitivo del dinero encareciendo los bienes y servicios.","El desempleo refleja la proporción de población activa que busca trabajo sin encontrarlo.","El gobierno utiliza políticas fiscales y monetarias para estabilizar la economía."]'),
('economia', 'bachillerato', '{1}', '["El sistema financiero conecta a los ahorradores con los inversores a través de intermediarios.","Los bancos captan depósitos de los ahorradores y conceden préstamos a empresas y familias.","La bolsa de valores permite a las empresas obtener financiación vendiendo acciones al público.","El Banco Central controla los tipos de interés para influir en el crédito y la inflación.","Una crisis financiera puede desencadenar una recesión económica con graves consecuencias sociales."]'),
('economia', 'bachillerato', '{1}', '["El comercio internacional permite a los países especializarse en aquello que producen de forma más eficiente.","Las exportaciones generan ingresos para el país mientras las importaciones satisfacen demanda interna.","Los aranceles son impuestos a los productos importados que protegen la industria nacional.","La Organización Mundial del Comercio promueve la reducción de barreras comerciales entre países.","La globalización ha intensificado los flujos comerciales y financieros a escala planetaria."]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('economia-empresa', 'bachillerato', '{2}', '["Un emprendedor detecta una oportunidad de negocio en el mercado.","Elabora un plan de empresa con análisis de mercado, plan financiero y estrategia de marketing.","Elige la forma jurídica más adecuada: autónomo, sociedad limitada o anónima.","Busca financiación a través de ahorros propios, préstamos bancarios o inversores.","La empresa comienza a operar y debe gestionar producción, ventas y contabilidad."]'),
('economia-empresa', 'bachillerato', '{2}', '["El departamento de marketing analiza las necesidades y preferencias de los consumidores.","Se segmenta el mercado dividiendo a los clientes en grupos con características similares.","Se diseña el producto y se fija un precio competitivo acorde al posicionamiento deseado.","Se seleccionan los canales de distribución para hacer llegar el producto al consumidor final.","Se lanza una campaña de comunicación y publicidad para dar a conocer el producto."]'),
('economia-empresa', 'bachillerato', '{2}', '["La contabilidad registra todas las operaciones económicas de la empresa en el libro diario.","Al final del ejercicio se elabora el balance de situación con activo, pasivo y patrimonio neto.","La cuenta de pérdidas y ganancias refleja los ingresos y gastos del periodo.","Se calculan ratios financieros como la liquidez, solvencia y rentabilidad.","Los resultados se presentan a la junta de socios para decidir el reparto de beneficios."]'),
('economia-empresa', 'bachillerato', '{2}', '["El departamento de recursos humanos planifica las necesidades de personal de la empresa.","Se publican las ofertas de empleo y se realiza un proceso de selección de candidatos.","Los trabajadores seleccionados firman un contrato y reciben formación inicial.","La empresa evalúa el desempeño de los empleados y diseña planes de carrera.","La negociación colectiva entre empresa y sindicatos fija las condiciones laborales."]'),
('economia-empresa', 'bachillerato', '{2}', '["La empresa evalúa una inversión calculando los flujos de caja futuros esperados.","Se aplica el criterio del VAN descontando los flujos al tipo de interés adecuado.","Si el VAN es positivo, la inversión generará más valor del que cuesta financiarla.","Se calcula también la TIR para conocer la rentabilidad porcentual de la inversión.","Se compara con alternativas y se toma la decisión de invertir o rechazar el proyecto."]');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('latin', 'bachillerato', '{1}', '["El latín surgió como lengua de una pequeña comunidad del Lacio en la Península Itálica.","Con la expansión de Roma, el latín se extendió por todo el Mediterráneo.","El latín culto era la lengua de la literatura mientras el vulgar se hablaba en la calle.","Tras la caída del Imperio Romano, el latín vulgar evolucionó en distintas lenguas romances.","El español, francés, italiano, portugués y rumano son las principales lenguas derivadas del latín."]'),
('latin', 'bachillerato', '{1}', '["Según la leyenda, Rómulo y Remo fueron abandonados junto al río Tíber al nacer.","Una loba los encontró y los amamantó hasta que un pastor los recogió y crió.","Al crecer, los gemelos decidieron fundar una nueva ciudad en el monte Palatino.","Rómulo mató a Remo en una disputa y se convirtió en el primer rey de Roma.","La ciudad de Roma fue fundada según la tradición en el año 753 antes de Cristo."]'),
('latin', 'bachillerato', '{1}', '["Los sustantivos latinos se agrupan en cinco declinaciones según su tema vocálico.","Cada declinación tiene seis casos que indican la función del sustantivo en la oración.","El nominativo indica el sujeto, el acusativo el complemento directo y el genitivo la posesión.","El dativo expresa el complemento indirecto y el ablativo las circunstancias de la acción.","El vocativo se usa para dirigirse directamente a alguien y suele coincidir con el nominativo."]'),
('latin', 'bachillerato', '{1}', '["Los verbos latinos se clasifican en cuatro conjugaciones según su vocal temática.","La primera conjugación tiene tema en -a como amo, amas, amat.","La segunda conjugación tiene tema en -e como habeo, habes, habet.","La tercera conjugación tiene tema en consonante como lego, legis, legit.","La cuarta conjugación tiene tema en -i como audio, audis, audit."]'),
('latin', 'bachillerato', '{1}', '["Júpiter era el dios supremo romano, señor del cielo y del rayo.","Juno, esposa de Júpiter, protegía el matrimonio y a las mujeres casadas.","Minerva era la diosa de la sabiduría, las artes y la estrategia militar.","Marte, dios de la guerra, era considerado padre de Rómulo y protector de Roma.","Venus, diosa del amor, era madre de Eneas y antepasada mítica de los romanos."]');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('latin', 'bachillerato', '{2}', '["Virgilio nació en Mantua y estudió retórica y filosofía en Roma y Nápoles.","Sus Bucólicas le dieron fama con diez églogas sobre la vida pastoral idealizada.","Las Geórgicas trataron sobre la agricultura como alegoría de la vida virtuosa.","Augusto le encargó la Eneida, una epopeya sobre el origen divino de Roma.","Virgilio murió en el 19 a.C. sin terminar la Eneida pidiendo que la quemaran."]'),
('latin', 'bachillerato', '{2}', '["Cicerón se formó como orador en Roma y Grecia estudiando retórica y filosofía.","Fue elegido cónsul en el 63 a.C. y desbarató la conjuración de Catilina.","Sus cuatro discursos contra Catilina son obras maestras de la oratoria latina.","Tras el asesinato de César, atacó a Marco Antonio en sus Filípicas.","Antonio ordenó su asesinato y Cicerón fue ejecutado en diciembre del 43 a.C."]'),
('latin', 'bachillerato', '{2}', '["César conquistó la Galia entre el 58 y el 51 a.C. ampliando el territorio romano.","Escribió De bello Gallico narrando sus campañas con un estilo claro y preciso.","Cruzó el Rubicón con su ejército y se enfrentó a Pompeyo en una guerra civil.","Tras vencer, se hizo dictador perpetuo e impulsó reformas como el calendario juliano.","Fue asesinado por un grupo de senadores en los idus de marzo del 44 a.C."]'),
('latin', 'bachillerato', '{2}', '["El latín vulgar hablado en las provincias fue divergiendo del latín literario.","Tras las invasiones germánicas, cada región desarrolló rasgos lingüísticos propios.","En la Península Ibérica surgieron el castellano, el catalán, el gallego y el portugués.","En la Galia el latín evolucionó hacia la lengua de oïl en el norte y la de oc en el sur.","Hoy las lenguas romances son habladas por más de ochocientos millones de personas en el mundo."]'),
('latin', 'bachillerato', '{2}', '["La retórica latina distingue cinco fases: inventio, dispositio, elocutio, memoria y actio.","La inventio consiste en encontrar los argumentos adecuados para persuadir al auditorio.","La dispositio organiza esos argumentos en un orden eficaz dentro del discurso.","La elocutio elige las palabras y figuras retóricas que darán fuerza expresiva al texto.","La actio es la puesta en escena del discurso con voz, gestos y presencia ante el público."]');


-- =============================================================================
-- 7. DETECTIVE SENTENCES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Francesa comenzó en 1789 con la toma de la Bastilla por el pueblo de París'),
('historia-mundo', 'bachillerato', '{1}', 'Napoleón Bonaparte se coronó emperador de los franceses en el año 1804'),
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Industrial se inició en Gran Bretaña a finales del siglo XVIII'),
('historia-mundo', 'bachillerato', '{1}', 'La Primera Guerra Mundial estalló en 1914 tras el asesinato del archiduque en Sarajevo'),
('historia-mundo', 'bachillerato', '{1}', 'El Tratado de Versalles de 1919 impuso condiciones muy duras a la Alemania derrotada'),
('historia-mundo', 'bachillerato', '{1}', 'La Gran Depresión comenzó con el crack bursátil de Wall Street en octubre de 1929'),
('historia-mundo', 'bachillerato', '{1}', 'Hitler fue nombrado canciller de Alemania en enero de 1933 por el presidente Hindenburg'),
('historia-mundo', 'bachillerato', '{1}', 'La Segunda Guerra Mundial terminó en Europa el 8 de mayo de 1945 con la rendición alemana'),
('historia-mundo', 'bachillerato', '{1}', 'El Plan Marshall ayudó a reconstruir la economía de los países europeos devastados por la guerra'),
('historia-mundo', 'bachillerato', '{1}', 'La crisis de los misiles de Cuba en 1962 fue el momento más tenso de la Guerra Fría'),
('historia-mundo', 'bachillerato', '{1}', 'El Muro de Berlín fue construido en 1961 para impedir la fuga de ciudadanos al oeste'),
('historia-mundo', 'bachillerato', '{1}', 'La descolonización de África se aceleró durante la década de 1960 con numerosas independencias');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('historia-espana', 'bachillerato', '{2}', 'Los musulmanes invadieron la Península Ibérica en el año 711 cruzando el estrecho de Gibraltar'),
('historia-espana', 'bachillerato', '{2}', 'El Califato de Córdoba fue la etapa de máximo esplendor de Al-Ándalus en el siglo X'),
('historia-espana', 'bachillerato', '{2}', 'Los Reyes Católicos conquistaron el reino nazarí de Granada en enero de 1492'),
('historia-espana', 'bachillerato', '{2}', 'Carlos I de España fue también emperador del Sacro Imperio Romano Germánico como Carlos V'),
('historia-espana', 'bachillerato', '{2}', 'La Armada Invencible fue derrotada por los ingleses en 1588 durante el reinado de Felipe II'),
('historia-espana', 'bachillerato', '{2}', 'La Guerra de Sucesión Española enfrentó a borbónicos y austracistas entre 1701 y 1714'),
('historia-espana', 'bachillerato', '{2}', 'La Constitución de Cádiz fue aprobada el 19 de marzo de 1812 durante la ocupación francesa'),
('historia-espana', 'bachillerato', '{2}', 'Las desamortizaciones del siglo XIX pusieron en venta tierras de la Iglesia y los municipios'),
('historia-espana', 'bachillerato', '{2}', 'La Segunda República española se proclamó el 14 de abril de 1931 tras las elecciones municipales'),
('historia-espana', 'bachillerato', '{2}', 'La Guerra Civil española duró tres años desde julio de 1936 hasta abril de 1939'),
('historia-espana', 'bachillerato', '{2}', 'Francisco Franco gobernó España como dictador durante casi cuarenta años hasta su muerte en 1975'),
('historia-espana', 'bachillerato', '{2}', 'La Constitución española de 1978 fue aprobada en referéndum por la mayoría de los ciudadanos');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('geografia', 'bachillerato', '{2}', 'La Meseta Central ocupa aproximadamente la mitad de la superficie de la Península Ibérica'),
('geografia', 'bachillerato', '{2}', 'El Teide con sus 3718 metros es el pico más alto de España y se encuentra en Tenerife'),
('geografia', 'bachillerato', '{2}', 'El río Ebro es el más caudaloso de España y desemboca en el mar Mediterráneo formando un delta'),
('geografia', 'bachillerato', '{2}', 'El clima oceánico se caracteriza por temperaturas suaves y precipitaciones abundantes todo el año'),
('geografia', 'bachillerato', '{2}', 'España tiene una densidad de población desigual con grandes contrastes entre la costa y el interior'),
('geografia', 'bachillerato', '{2}', 'El turismo representa aproximadamente el doce por ciento del Producto Interior Bruto español'),
('geografia', 'bachillerato', '{2}', 'La Política Agraria Común regula la actividad agrícola en los países miembros de la Unión Europea'),
('geografia', 'bachillerato', '{2}', 'Las Islas Canarias tienen un clima subtropical debido a su cercanía al trópico de Cáncer'),
('geografia', 'bachillerato', '{2}', 'La desertificación amenaza especialmente a las regiones del sureste peninsular como Almería y Murcia'),
('geografia', 'bachillerato', '{2}', 'La encina es el árbol más representativo del bosque mediterráneo de la Península Ibérica'),
('geografia', 'bachillerato', '{2}', 'Madrid y Barcelona son las dos áreas metropolitanas más pobladas del sistema urbano español'),
('geografia', 'bachillerato', '{2}', 'España ingresó en la Comunidad Económica Europea el primero de enero de mil novecientos ochenta y seis');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('arte', 'bachillerato', '{2}', 'El Partenón de Atenas es el ejemplo más representativo de la arquitectura griega del orden dórico'),
('arte', 'bachillerato', '{2}', 'La catedral de Notre Dame de París es una obra maestra de la arquitectura gótica del siglo XIII'),
('arte', 'bachillerato', '{2}', 'Leonardo da Vinci pintó La Gioconda utilizando la técnica del sfumato para difuminar los contornos'),
('arte', 'bachillerato', '{2}', 'Miguel Ángel tardó cuatro años en pintar los frescos de la bóveda de la Capilla Sixtina'),
('arte', 'bachillerato', '{2}', 'Caravaggio revolucionó la pintura barroca con su uso dramático del claroscuro o tenebrismo'),
('arte', 'bachillerato', '{2}', 'Velázquez pintó Las Meninas en 1656 mostrando su dominio de la perspectiva y la luz'),
('arte', 'bachillerato', '{2}', 'Goya pintó Los fusilamientos del 3 de mayo como denuncia de la represión francesa en España'),
('arte', 'bachillerato', '{2}', 'Claude Monet pintó Impresión sol naciente en 1872 dando nombre al movimiento impresionista'),
('arte', 'bachillerato', '{2}', 'Picasso y Braque crearon el cubismo a principios del siglo XX fragmentando las formas en geometrías'),
('arte', 'bachillerato', '{2}', 'Dalí es el máximo exponente del surrealismo español con obras como La persistencia de la memoria'),
('arte', 'bachillerato', '{2}', 'Gaudí diseñó la Sagrada Familia de Barcelona combinando formas naturales con innovación estructural'),
('arte', 'bachillerato', '{2}', 'El Pop Art de Andy Warhol convirtió imágenes de la cultura de masas en obras de arte reconocidas');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('economia', 'bachillerato', '{1}', 'La ley de la demanda establece que al subir el precio de un bien su cantidad demandada disminuye'),
('economia', 'bachillerato', '{1}', 'El PIB es el indicador macroeconómico que mide la producción total de un país en un periodo'),
('economia', 'bachillerato', '{1}', 'La inflación es la subida generalizada y sostenida del nivel de precios de una economía'),
('economia', 'bachillerato', '{1}', 'El monopolio es una estructura de mercado en la que existe un único vendedor del producto'),
('economia', 'bachillerato', '{1}', 'El Banco Central Europeo fija los tipos de interés para controlar la inflación en la eurozona'),
('economia', 'bachillerato', '{1}', 'Los impuestos progresivos gravan proporcionalmente más a las personas con mayores ingresos'),
('economia', 'bachillerato', '{1}', 'La balanza comercial es positiva cuando las exportaciones superan a las importaciones de un país'),
('economia', 'bachillerato', '{1}', 'El coste de oportunidad es el valor de la mejor alternativa a la que se renuncia al decidir'),
('economia', 'bachillerato', '{1}', 'Adam Smith defendió el libre mercado y la mano invisible como regulador natural de la economía'),
('economia', 'bachillerato', '{1}', 'Keynes propuso la intervención del Estado en la economía para combatir el desempleo y las crisis'),
('economia', 'bachillerato', '{1}', 'El IVA es un impuesto indirecto que grava el consumo de bienes y servicios en cada transacción'),
('economia', 'bachillerato', '{1}', 'Una recesión económica se produce cuando el PIB de un país cae durante dos trimestres consecutivos');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('economia-empresa', 'bachillerato', '{2}', 'El balance de situación muestra el patrimonio de la empresa dividido en activo pasivo y neto'),
('economia-empresa', 'bachillerato', '{2}', 'La sociedad anónima requiere un capital mínimo de sesenta mil euros dividido en acciones'),
('economia-empresa', 'bachillerato', '{2}', 'El punto muerto es el nivel de ventas donde los ingresos totales igualan a los costes totales'),
('economia-empresa', 'bachillerato', '{2}', 'La pirámide de Maslow ordena las necesidades humanas desde las fisiológicas hasta la autorrealización'),
('economia-empresa', 'bachillerato', '{2}', 'El marketing mix combina las cuatro variables de producto precio distribución y comunicación'),
('economia-empresa', 'bachillerato', '{2}', 'El Valor Actual Neto es la diferencia entre el valor actual de los cobros y los pagos de una inversión'),
('economia-empresa', 'bachillerato', '{2}', 'El organigrama representa gráficamente la estructura jerárquica y funcional de una empresa'),
('economia-empresa', 'bachillerato', '{2}', 'Los costes fijos no varían con el nivel de producción mientras que los variables sí lo hacen'),
('economia-empresa', 'bachillerato', '{2}', 'El análisis DAFO identifica debilidades amenazas fortalezas y oportunidades de la empresa'),
('economia-empresa', 'bachillerato', '{2}', 'La segmentación del mercado divide a los consumidores en grupos homogéneos con necesidades similares'),
('economia-empresa', 'bachillerato', '{2}', 'La autofinanciación es la capacidad de la empresa para financiarse con sus propios recursos generados'),
('economia-empresa', 'bachillerato', '{2}', 'La responsabilidad social corporativa integra preocupaciones sociales y ambientales en la gestión empresarial');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('latin', 'bachillerato', '{1}', 'El latín es una lengua indoeuropea que se hablaba originariamente en la región del Lacio en Italia'),
('latin', 'bachillerato', '{1}', 'Las declinaciones latinas son cinco modelos de flexión que agrupan los sustantivos según su tema'),
('latin', 'bachillerato', '{1}', 'El caso nominativo indica el sujeto de la oración y el acusativo el complemento directo'),
('latin', 'bachillerato', '{1}', 'Los verbos latinos se conjugan en cuatro conjugaciones según la vocal temática de su raíz'),
('latin', 'bachillerato', '{1}', 'Júpiter era el dios supremo del panteón romano equivalente al Zeus de los griegos'),
('latin', 'bachillerato', '{1}', 'El foro romano era el centro de la vida política religiosa y comercial de la ciudad'),
('latin', 'bachillerato', '{1}', 'Los gladiadores luchaban en el anfiteatro como espectáculo para el entretenimiento del pueblo romano'),
('latin', 'bachillerato', '{1}', 'La sociedad romana se dividía en patricios plebeyos libertos y esclavos según su condición'),
('latin', 'bachillerato', '{1}', 'Rómulo fundó la ciudad de Roma según la tradición en el año setecientos cincuenta y tres antes de Cristo'),
('latin', 'bachillerato', '{1}', 'Las calzadas romanas conectaban todo el imperio y muchas de ellas todavía son visibles en la actualidad'),
('latin', 'bachillerato', '{1}', 'La Eneida de Virgilio narra el viaje del troyano Eneas hasta Italia donde fundó la estirpe romana'),
('latin', 'bachillerato', '{1}', 'Muchas palabras del español actual proceden directamente del latín como familia doctor o capital');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('latin', 'bachillerato', '{2}', 'Virgilio escribió la Eneida por encargo de Augusto para glorificar los orígenes de Roma'),
('latin', 'bachillerato', '{2}', 'Cicerón pronunció las Catilinarias en el Senado romano para denunciar la conspiración de Catilina'),
('latin', 'bachillerato', '{2}', 'César cruzó el río Rubicón con sus legiones pronunciando la célebre frase alea iacta est'),
('latin', 'bachillerato', '{2}', 'Horacio escribió las Odas donde acuñó la expresión carpe diem que invita a aprovechar el presente'),
('latin', 'bachillerato', '{2}', 'Las Metamorfosis de Ovidio reúnen más de doscientos mitos sobre transformaciones de la mitología clásica'),
('latin', 'bachillerato', '{2}', 'Séneca fue un filósofo estoico nacido en Córdoba que ejerció como tutor del emperador Nerón'),
('latin', 'bachillerato', '{2}', 'El ablativo absoluto es una construcción sintáctica con sustantivo y participio en caso ablativo'),
('latin', 'bachillerato', '{2}', 'El hexámetro dactílico es el metro por excelencia de la poesía épica latina de Virgilio y Ennio'),
('latin', 'bachillerato', '{2}', 'Tácito narró la historia del Imperio romano en sus Anales con un estilo conciso y crítico'),
('latin', 'bachillerato', '{2}', 'Las lenguas romances como el castellano derivan del latín vulgar hablado en las provincias del Imperio'),
('latin', 'bachillerato', '{2}', 'La retórica latina distingue cinco fases del discurso inventio dispositio elocutio memoria y actio'),
('latin', 'bachillerato', '{2}', 'Expresiones latinas como habeas corpus o curriculum vitae siguen vigentes en el lenguaje actual');


-- =============================================================================
-- 8. COMPRENSION TEXTS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HISTORIA DEL MUNDO CONTEMPORÁNEO
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Francesa y sus consecuencias',
'La Revolución Francesa de 1789 fue uno de los acontecimientos más trascendentales de la historia moderna. Sus causas fueron múltiples: la crisis financiera de la monarquía, la desigualdad social del Antiguo Régimen, la influencia de las ideas ilustradas y el descontento del Tercer Estado. La toma de la Bastilla el 14 de julio marcó el inicio simbólico de la revolución. La Asamblea Nacional abolió los privilegios feudales y aprobó la Declaración de los Derechos del Hombre y del Ciudadano, que proclamaba la libertad, la igualdad y la soberanía nacional. Sin embargo, la revolución atravesó distintas fases: la monarquía constitucional, la república jacobina con el Terror de Robespierre y el Directorio. Finalmente, Napoleón Bonaparte dio un golpe de Estado en 1799 y se proclamó emperador en 1804. Las guerras napoleónicas extendieron las ideas revolucionarias por toda Europa, pero también provocaron el rechazo de las potencias absolutistas. Tras la derrota de Napoleón en Waterloo, el Congreso de Viena intentó restaurar el orden anterior, pero las semillas de la revolución ya habían germinado: el liberalismo, el nacionalismo y la soberanía popular serían las fuerzas dominantes del siglo XIX.',
'[{"pregunta":"¿Cuál fue una causa de la Revolución Francesa?","opciones":["La invasión napoleónica","La crisis financiera de la monarquía","La independencia de las colonias americanas","La Revolución Industrial"],"correcta":1},{"pregunta":"¿Qué documento proclamó la libertad y la igualdad?","opciones":["La Constitución de Cádiz","El Tratado de Versalles","La Declaración de los Derechos del Hombre","La Carta Magna"],"correcta":2},{"pregunta":"¿Quién instauró el periodo del Terror?","opciones":["Napoleón","Danton","Luis XVI","Robespierre"],"correcta":3},{"pregunta":"¿Qué intentó hacer el Congreso de Viena?","opciones":["Extender la revolución","Restaurar el orden absolutista","Crear la ONU","Unificar Alemania"],"correcta":1}]'),

('historia-mundo', 'bachillerato', '{1}', 'La Guerra Fría: un mundo dividido',
'Tras la Segunda Guerra Mundial, el mundo quedó dividido en dos bloques antagónicos liderados por Estados Unidos y la Unión Soviética. Esta rivalidad, conocida como Guerra Fría, no desembocó en un enfrentamiento militar directo entre ambas superpotencias, pero se manifestó en conflictos regionales, carreras armamentísticas y competencia espacial. La OTAN, creada en 1949, agrupó a los países occidentales, mientras que el Pacto de Varsovia reunió a los aliados soviéticos desde 1955. La crisis de los misiles de Cuba en 1962 llevó al mundo al borde de la guerra nuclear. La doctrina de la disuasión, basada en la destrucción mutua asegurada, mantuvo un frágil equilibrio. La Guerra Fría tuvo expresiones en Asia, con las guerras de Corea y Vietnam, y en Europa con la construcción del Muro de Berlín en 1961. La carrera espacial, con el lanzamiento del Sputnik soviético y la llegada del hombre a la Luna, reflejó la pugna tecnológica. La política de distensión de los años setenta dio paso a una nueva escalada con Reagan. Finalmente, la perestroika de Gorbachov y la caída del Muro de Berlín en 1989 marcaron el fin de la Guerra Fría y la desaparición de la URSS en 1991.',
'[{"pregunta":"¿Qué caracterizó a la Guerra Fría?","opciones":["Un enfrentamiento militar directo","Una rivalidad sin guerra directa entre superpotencias","La unificación de Europa","La colonización de África"],"correcta":1},{"pregunta":"¿Qué crisis llevó al mundo al borde de la guerra nuclear en 1962?","opciones":["Crisis de Suez","Crisis de Cuba","Crisis de Berlín","Crisis de Corea"],"correcta":1},{"pregunta":"¿Qué fue la perestroika?","opciones":["Una alianza militar","Una reforma económica soviética","Un tratado de paz","Una doctrina nuclear"],"correcta":1},{"pregunta":"¿En qué año cayó el Muro de Berlín?","opciones":["1985","1987","1989","1991"],"correcta":2}]'),

('historia-mundo', 'bachillerato', '{1}', 'La Revolución Industrial y sus transformaciones',
'La Revolución Industrial, iniciada en Gran Bretaña a finales del siglo XVIII, transformó radicalmente la economía, la sociedad y la vida cotidiana. La introducción de la máquina de vapor, inventada por James Watt, permitió mecanizar la producción textil y la minería del carbón. El ferrocarril revolucionó el transporte conectando ciudades y mercados como nunca antes. Esta transformación tuvo profundas consecuencias sociales: millones de campesinos emigraron a las ciudades en busca de empleo en las fábricas, formando una nueva clase social, el proletariado industrial. Las condiciones de trabajo eran durísimas, con jornadas de catorce horas, trabajo infantil y salarios miserables. Como reacción surgieron movimientos obreros como el ludismo, que destruía las máquinas, y el cartismo, que reclamaba derechos políticos para los trabajadores. Karl Marx analizó las contradicciones del capitalismo industrial y propuso la revolución proletaria como solución. La industrialización se extendió por Europa y América durante el siglo XIX, creando una economía mundial interconectada. La segunda revolución industrial, a finales del XIX, introdujo la electricidad, el petróleo y el acero, acelerando aún más el proceso de modernización productiva.',
'[{"pregunta":"¿Dónde se inició la Revolución Industrial?","opciones":["Francia","Alemania","Gran Bretaña","Estados Unidos"],"correcta":2},{"pregunta":"¿Qué invento revolucionó el transporte?","opciones":["El automóvil","El ferrocarril","El avión","El barco de vapor"],"correcta":1},{"pregunta":"¿Qué movimiento destruía máquinas como protesta?","opciones":["Cartismo","Socialismo","Ludismo","Anarquismo"],"correcta":2},{"pregunta":"¿Qué energías introdujo la segunda revolución industrial?","opciones":["Energía solar y eólica","Vapor y carbón","Electricidad y petróleo","Nuclear y gas"],"correcta":2}]');

-- ---------------------------------------------------------------------------
-- HISTORIA DE ESPAÑA
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('historia-espana', 'bachillerato', '{2}', 'La Transición española a la democracia',
'La Transición española es el proceso político que permitió pasar de la dictadura franquista a una democracia parlamentaria entre 1975 y 1982. Tras la muerte de Franco el 20 de noviembre de 1975, Juan Carlos I fue proclamado rey. El monarca, contra lo que muchos esperaban, apostó por la reforma política. Nombró presidente del Gobierno a Adolfo Suárez, quien pilotó la Ley para la Reforma Política aprobada por las propias Cortes franquistas y refrendada en referéndum. En 1977 se celebraron las primeras elecciones democráticas desde 1936, ganadas por UCD. Se legalizaron todos los partidos, incluido el Partido Comunista de Santiago Carrillo. Los Pactos de la Moncloa estabilizaron la economía en un momento de crisis. La Constitución de 1978, fruto del consenso entre las principales fuerzas políticas, estableció una monarquía parlamentaria, un Estado de las Autonomías y un amplio catálogo de derechos fundamentales. El intento de golpe de Estado del 23 de febrero de 1981, protagonizado por el teniente coronel Tejero, fracasó y reforzó la democracia. La victoria socialista de Felipe González en 1982 consolidó la alternancia y marcó el final simbólico de la Transición.',
'[{"pregunta":"¿Quién fue el primer presidente democrático tras Franco?","opciones":["Felipe González","Santiago Carrillo","Adolfo Suárez","Manuel Fraga"],"correcta":2},{"pregunta":"¿En qué año se aprobó la Constitución española vigente?","opciones":["1975","1977","1978","1982"],"correcta":2},{"pregunta":"¿Qué estableció la Constitución de 1978?","opciones":["Una república federal","Una dictadura militar","Una monarquía parlamentaria","Un Estado centralizado"],"correcta":2},{"pregunta":"¿Quién protagonizó el intento de golpe del 23-F?","opciones":["Adolfo Suárez","Antonio Tejero","Santiago Carrillo","Manuel Fraga"],"correcta":1}]'),

('historia-espana', 'bachillerato', '{2}', 'El Imperio de los Austrias',
'Los Austrias, o Habsburgo españoles, gobernaron España durante los siglos XVI y XVII, periodo en el que el país se convirtió en la primera potencia mundial. Carlos I heredó en 1516 un vasto imperio que incluía los reinos hispánicos, los Países Bajos, posesiones italianas y las Indias americanas. Además, fue coronado emperador del Sacro Imperio como Carlos V. Su hijo Felipe II añadió Portugal en 1580 y convirtió a España en el mayor imperio de la época, con territorios en cuatro continentes. Sin embargo, la derrota de la Armada Invencible frente a Inglaterra en 1588 marcó un punto de inflexión. Los llamados Austrias menores —Felipe III, Felipe IV y Carlos II— delegaron el gobierno en validos como el duque de Lerma y el conde-duque de Olivares. España se vio envuelta en costosas guerras en Flandes, con Francia y dentro de la propia Península. La crisis económica, agravada por la inflación de los metales americanos y la expulsión de los moriscos, debilitó al país. Carlos II, el último Austria, murió sin descendencia en 1700, lo que provocó la Guerra de Sucesión entre partidarios de los Borbones y los Habsburgo, resuelta con el Tratado de Utrecht.',
'[{"pregunta":"¿Quién fue el primer Austria español?","opciones":["Felipe II","Carlos I","Felipe III","Carlos II"],"correcta":1},{"pregunta":"¿Qué hecho marcó el inicio del declive naval español?","opciones":["La conquista de América","La derrota de la Armada Invencible","El Tratado de Utrecht","La expulsión de los moriscos"],"correcta":1},{"pregunta":"¿Qué eran los validos?","opciones":["Generales militares","Consejeros religiosos","Personas de confianza que gobernaban en nombre del rey","Embajadores diplomáticos"],"correcta":2},{"pregunta":"¿Qué provocó la muerte sin descendencia de Carlos II?","opciones":["La Reconquista","La Guerra de Sucesión","La Revolución Francesa","La independencia de América"],"correcta":1}]'),

('historia-espana', 'bachillerato', '{2}', 'La Guerra Civil española',
'La Guerra Civil española (1936-1939) fue el conflicto más traumático de la historia contemporánea de España. Sus causas son complejas: la polarización política durante la Segunda República, la conflictividad social, el problema agrario, los nacionalismos periféricos y la intervención militar en la política. El 18 de julio de 1936, un grupo de militares liderados por el general Franco se sublevó contra el gobierno legítimo de la República. España quedó dividida en dos zonas: la republicana, que controlaba las grandes ciudades y la costa mediterránea, y la nacional, que dominaba el norte y el oeste. La guerra se internacionalizó: Alemania e Italia apoyaron a Franco con armamento y tropas, mientras la URSS y las Brigadas Internacionales ayudaron a la República. El bombardeo de Guernica por la Legión Cóndor alemana en 1937 se convirtió en símbolo de la barbarie bélica. La batalla del Ebro en 1938 fue el último gran esfuerzo republicano. Barcelona cayó en enero de 1939 y Madrid en marzo. La guerra terminó el 1 de abril de 1939 con la victoria del bando nacional. Las consecuencias fueron devastadoras: cientos de miles de muertos, medio millón de exiliados y una dictadura que duraría casi cuarenta años.',
'[{"pregunta":"¿Cuándo comenzó la Guerra Civil española?","opciones":["14 de abril de 1931","18 de julio de 1936","1 de abril de 1939","20 de noviembre de 1975"],"correcta":1},{"pregunta":"¿Qué potencias apoyaron al bando nacional?","opciones":["Francia y Gran Bretaña","URSS y México","Alemania e Italia","Estados Unidos y Japón"],"correcta":2},{"pregunta":"¿Qué fue el bombardeo de Guernica?","opciones":["Una batalla naval","Un ataque aéreo alemán contra una población civil vasca","Una ofensiva republicana","Un asedio a Madrid"],"correcta":1},{"pregunta":"¿Cuál fue la última gran batalla de la guerra?","opciones":["Batalla de Madrid","Batalla del Jarama","Batalla de Brunete","Batalla del Ebro"],"correcta":3}]');

-- ---------------------------------------------------------------------------
-- GEOGRAFÍA
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('geografia', 'bachillerato', '{2}', 'El relieve de la Península Ibérica',
'El relieve de la Península Ibérica se organiza en torno a la Meseta Central, una extensa llanura elevada que ocupa aproximadamente la mitad de la superficie peninsular con una altitud media de 650 metros. La Meseta está dividida en dos submesetas por el Sistema Central: la Submeseta Norte, más alta y fría, drenada por el río Duero; y la Submeseta Sur, más baja, atravesada por los ríos Tajo y Guadiana. Alrededor de la Meseta se disponen los rebordes montañosos: el Macizo Galaico al noroeste, la Cordillera Cantábrica al norte, el Sistema Ibérico al este y Sierra Morena al sur. Las cordilleras exteriores son los Pirineos al noreste y las Cordilleras Béticas al sureste, donde se encuentra el Mulhacén, techo de la Península con 3.482 metros. Entre la Meseta y las cordilleras exteriores se abren dos grandes depresiones: la del Ebro, cerrada por los Pirineos y el Sistema Ibérico, y la del Guadalquivir, abierta al Atlántico. Este relieve variado condiciona el clima, la hidrografía y los usos del suelo. La elevada altitud media de España, la segunda de Europa tras Suiza, influye en las temperaturas y explica la continentalidad del interior frente a la suavidad de las costas.',
'[{"pregunta":"¿Qué divide la Meseta en dos submesetas?","opciones":["Sierra Morena","El Sistema Central","Los Pirineos","La Cordillera Cantábrica"],"correcta":1},{"pregunta":"¿Cuál es el pico más alto de la Península?","opciones":["Teide","Aneto","Mulhacén","Almanzor"],"correcta":2},{"pregunta":"¿Qué depresión se abre al Atlántico?","opciones":["Depresión del Ebro","Depresión del Duero","Depresión del Tajo","Depresión del Guadalquivir"],"correcta":3},{"pregunta":"¿Por qué el interior peninsular es continental?","opciones":["Por su cercanía al mar","Por la elevada altitud media","Por las corrientes marinas","Por la vegetación"],"correcta":1}]'),

('geografia', 'bachillerato', '{2}', 'La población española: retos demográficos',
'España tiene aproximadamente 48 millones de habitantes, con una distribución territorial muy desigual. La mayor parte de la población se concentra en las áreas costeras y las grandes ciudades como Madrid, Barcelona, Valencia y Sevilla, mientras que amplias zonas del interior están prácticamente despobladas: es lo que se conoce como la España vaciada. El éxodo rural de los años sesenta del siglo XX, cuando millones de personas abandonaron el campo para buscar trabajo en la industria urbana, explica en gran parte esta distribución. El envejecimiento es el principal reto demográfico: la tasa de natalidad es una de las más bajas de Europa y la esperanza de vida supera los 83 años. Esto genera una pirámide de población invertida, con una base estrecha de jóvenes y una cúspide amplia de ancianos, lo que pone en riesgo la sostenibilidad del sistema de pensiones y los servicios públicos. La inmigración ha sido un factor clave del crecimiento demográfico desde finales del siglo XX, aportando población joven y activa. Sin embargo, la España vaciada necesita políticas específicas para frenar la despoblación: mejora de infraestructuras, acceso a servicios digitales, incentivos fiscales y oportunidades de empleo en el medio rural.',
'[{"pregunta":"¿Cómo se llama al fenómeno de despoblación interior?","opciones":["Éxodo urbano","España vaciada","Urbanización","Gentrificación"],"correcta":1},{"pregunta":"¿Cuál es el principal reto demográfico de España?","opciones":["El crecimiento excesivo","La emigración masiva","El envejecimiento","La inmigración ilegal"],"correcta":2},{"pregunta":"¿Qué provocó el éxodo rural de los años 60?","opciones":["La guerra civil","La búsqueda de empleo industrial en las ciudades","Las inundaciones","La Unión Europea"],"correcta":1},{"pregunta":"¿Qué efecto ha tenido la inmigración en la demografía española?","opciones":["Ha aumentado el envejecimiento","Ha aportado población joven y activa","Ha reducido la población total","Ha vaciado las ciudades"],"correcta":1}]'),

('geografia', 'bachillerato', '{2}', 'Los climas de España',
'España presenta una gran diversidad climática debido a su posición geográfica, su variado relieve y la influencia de masas de aire de distinto origen. El clima oceánico domina la cornisa cantábrica y Galicia, con precipitaciones abundantes y regulares durante todo el año y temperaturas suaves con escasa amplitud térmica. El clima mediterráneo es el más extendido y se caracteriza por veranos calurosos y secos e inviernos suaves, con precipitaciones concentradas en otoño y primavera. Dentro del mediterráneo se distinguen variantes: el costero, con influencia del mar; el continentalizado del interior, con inviernos muy fríos y veranos muy calurosos; y el semiárido del sureste, con precipitaciones inferiores a 300 mm anuales. El clima de montaña aparece en las zonas elevadas con temperaturas bajas y precipitaciones abundantes, a menudo en forma de nieve. Las Islas Canarias disfrutan de un clima subtropical, con temperaturas suaves y estables durante todo el año gracias a la influencia del anticiclón de las Azores y la corriente fría de Canarias. La gota fría o DANA es un fenómeno frecuente en otoño en el Mediterráneo que provoca lluvias torrenciales y graves inundaciones.',
'[{"pregunta":"¿Qué clima domina la cornisa cantábrica?","opciones":["Mediterráneo","Continental","Oceánico","Subtropical"],"correcta":2},{"pregunta":"¿Cuál es la característica principal del clima mediterráneo?","opciones":["Lluvias todo el año","Veranos calurosos y secos","Temperaturas bajo cero en invierno","Nieves perpetuas"],"correcta":1},{"pregunta":"¿Qué es una DANA o gota fría?","opciones":["Un viento del norte","Lluvias torrenciales en el Mediterráneo","Una ola de calor","Un fenómeno volcánico"],"correcta":1},{"pregunta":"¿Por qué Canarias tiene clima subtropical?","opciones":["Por su altitud","Por estar cerca del Ecuador","Por el anticiclón de Azores y la corriente de Canarias","Por la vegetación tropical"],"correcta":2}]');

-- ---------------------------------------------------------------------------
-- HISTORIA DEL ARTE
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('arte', 'bachillerato', '{2}', 'Velázquez y Las Meninas',
'Diego Velázquez (1599-1660) es considerado el mayor pintor del Barroco español y uno de los más grandes de la historia universal del arte. Nacido en Sevilla, se formó en el taller de Francisco Pacheco antes de trasladarse a Madrid como pintor de cámara de Felipe IV. Su obra maestra, Las Meninas (1656), es una de las pinturas más analizadas y admiradas de todos los tiempos. El cuadro muestra a la infanta Margarita rodeada de sus damas de honor, un mastín, dos enanos y el propio Velázquez pintando ante un gran lienzo. En el espejo del fondo aparecen reflejados los reyes Felipe IV y Mariana de Austria, lo que sugiere que el pintor los está retratando. Esta composición revolucionaria juega con la perspectiva, la relación entre el espectador y la obra, y la naturaleza misma de la representación. Velázquez empleó la perspectiva aérea, difuminando las figuras del fondo para crear profundidad espacial. Su pincelada suelta y su dominio de la luz anticiparon la pintura moderna. Otras obras fundamentales son La rendición de Breda, Las hilanderas, La fragua de Vulcano y sus retratos de bufones. Velázquez influyó decisivamente en pintores posteriores como Goya, Manet y Picasso, quien realizó una serie completa de variaciones sobre Las Meninas.',
'[{"pregunta":"¿Dónde nació Velázquez?","opciones":["Madrid","Toledo","Sevilla","Córdoba"],"correcta":2},{"pregunta":"¿Qué aparece reflejado en el espejo de Las Meninas?","opciones":["La infanta Margarita","Los reyes Felipe IV y Mariana","El propio Velázquez","Un paisaje"],"correcta":1},{"pregunta":"¿Qué técnica usó Velázquez para crear profundidad?","opciones":["Claroscuro","Sfumato","Perspectiva aérea","Puntillismo"],"correcta":2},{"pregunta":"¿Qué pintor moderno hizo variaciones sobre Las Meninas?","opciones":["Dalí","Miró","Goya","Picasso"],"correcta":3}]'),

('arte', 'bachillerato', '{2}', 'Las vanguardias artísticas del siglo XX',
'Las vanguardias artísticas revolucionaron el arte occidental en las primeras décadas del siglo XX, rompiendo con la tradición académica y explorando nuevas formas de expresión. El Fauvismo, con Matisse como líder, liberó el color de su función descriptiva, usando tonos puros y violentos. El Expresionismo, representado por Munch y el grupo Die Brücke, deformó la realidad para transmitir estados emocionales intensos. El Cubismo, creado por Picasso y Braque hacia 1907, fragmentó los objetos en múltiples perspectivas geométricas simultáneas, destruyendo la visión única del Renacimiento. El Futurismo italiano exaltó la velocidad y la máquina. El Dadaísmo de Duchamp cuestionó la propia definición de arte introduciendo objetos cotidianos como ready-mades. El Surrealismo, inspirado por las teorías de Freud sobre el subconsciente, exploró el mundo de los sueños y el automatismo; Dalí y Miró fueron sus máximos representantes españoles. El arte abstracto, iniciado por Kandinsky, eliminó toda referencia figurativa para crear un lenguaje puramente visual de formas y colores. Estas vanguardias sentaron las bases del arte contemporáneo y cuestionaron los límites entre arte y vida, abriendo caminos como el expresionismo abstracto, el Pop Art y el arte conceptual.',
'[{"pregunta":"¿Quién creó el Cubismo junto a Braque?","opciones":["Dalí","Matisse","Kandinsky","Picasso"],"correcta":3},{"pregunta":"¿Qué movimiento se inspiró en las teorías de Freud?","opciones":["Fauvismo","Cubismo","Surrealismo","Futurismo"],"correcta":2},{"pregunta":"¿Qué introdujo Duchamp en el arte?","opciones":["El puntillismo","Los ready-mades","La perspectiva","El sfumato"],"correcta":1},{"pregunta":"¿Quién inició el arte abstracto?","opciones":["Mondrian","Malevich","Kandinsky","Pollock"],"correcta":2}]'),

('arte', 'bachillerato', '{2}', 'El arte gótico: las catedrales de la luz',
'El arte gótico surgió en la Isla de Francia a mediados del siglo XII y se extendió por toda Europa hasta el siglo XV. Representó una revolución respecto al Románico anterior: mientras que las iglesias románicas eran oscuras y macizas, las catedrales góticas aspiraban a la verticalidad y a la luz como símbolo de la presencia divina. La innovación técnica clave fue la bóveda de crucería, que permitía distribuir el peso del techo en puntos concretos en lugar de en muros continuos. Esto posibilitó abrir grandes vanos que se llenaron de vidrieras multicolores. Los arbotantes y contrafuertes exteriores sostenían los empujes laterales, liberando los muros de su función portante. El arco apuntado u ojival sustituyó al medio punto románico, permitiendo mayor altura. Las fachadas se decoraron con esculturas cada vez más naturalistas en portadas y tímpanos. Los rosetones, grandes vidrieras circulares, se convirtieron en el elemento decorativo más emblemático. Notre Dame de París, Chartres, Reims, León, Burgos y Toledo son ejemplos destacados. El gótico flamígero tardío alcanzó una decoración exuberante. En España, el gótico isabelino incorporó elementos mudéjares creando un estilo singular que combinaba tradiciones cristianas e islámicas.',
'[{"pregunta":"¿Dónde surgió el arte gótico?","opciones":["Italia","Alemania","Isla de Francia","España"],"correcta":2},{"pregunta":"¿Qué innovación técnica fue clave en el gótico?","opciones":["El arco de medio punto","La bóveda de cañón","La bóveda de crucería","La cúpula"],"correcta":2},{"pregunta":"¿Qué función tenían los arbotantes?","opciones":["Decorar la fachada","Sostener los empujes laterales","Iluminar el interior","Servir de campanario"],"correcta":1},{"pregunta":"¿Qué caracteriza al gótico isabelino español?","opciones":["La influencia italiana","La combinación de elementos cristianos y mudéjares","El uso del hormigón","La ausencia de decoración"],"correcta":1}]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('economia', 'bachillerato', '{1}', 'La oferta, la demanda y el equilibrio de mercado',
'El mercado es el mecanismo mediante el cual compradores y vendedores interactúan para determinar el precio y la cantidad de un bien o servicio. La ley de la demanda establece que, ceteris paribus, cuando el precio de un bien sube, la cantidad demandada disminuye, y viceversa. Esto se debe al efecto renta (el consumidor pierde poder adquisitivo) y al efecto sustitución (busca alternativas más baratas). La curva de demanda tiene pendiente negativa. Por su parte, la ley de la oferta indica que, al subir el precio, los productores están dispuestos a ofrecer más cantidad, ya que resulta más rentable producir. La curva de oferta tiene pendiente positiva. El punto donde ambas curvas se cruzan es el equilibrio de mercado: el precio al que la cantidad ofrecida iguala a la cantidad demandada. Si el precio está por encima del equilibrio, se genera un excedente de oferta que presiona el precio a la baja. Si está por debajo, hay escasez y el precio tiende a subir. El gobierno puede intervenir fijando precios máximos o mínimos, pero esto genera ineficiencias como escasez o excedentes artificiales. La elasticidad mide la sensibilidad de la demanda o la oferta ante variaciones del precio.',
'[{"pregunta":"¿Qué establece la ley de la demanda?","opciones":["A mayor precio, mayor demanda","A mayor precio, menor demanda","El precio no afecta a la demanda","La oferta determina la demanda"],"correcta":1},{"pregunta":"¿Qué ocurre en el punto de equilibrio?","opciones":["Hay excedente","Hay escasez","Cantidad ofrecida iguala a la demandada","El precio es cero"],"correcta":2},{"pregunta":"¿Qué genera un precio máximo por debajo del equilibrio?","opciones":["Excedente","Equilibrio","Escasez","Inflación"],"correcta":2},{"pregunta":"¿Qué mide la elasticidad?","opciones":["La calidad del producto","La sensibilidad ante cambios de precio","El beneficio empresarial","La inflación"],"correcta":1}]'),

('economia', 'bachillerato', '{1}', 'La política fiscal y monetaria',
'Las autoridades económicas disponen de dos instrumentos principales para estabilizar la economía: la política fiscal y la política monetaria. La política fiscal es competencia del gobierno y utiliza los impuestos y el gasto público para influir en la actividad económica. En una recesión, el gobierno puede aplicar una política fiscal expansiva, reduciendo impuestos o aumentando el gasto para estimular la demanda agregada. En un periodo de inflación excesiva, puede optar por una política restrictiva, subiendo impuestos o recortando el gasto. Los presupuestos generales del Estado son el instrumento donde se concretan estas decisiones. La política monetaria, en la zona euro, es competencia del Banco Central Europeo. Su principal herramienta es el tipo de interés oficial: al bajar los tipos, el crédito se abarata, lo que estimula la inversión y el consumo; al subirlos, se encarece el crédito y se frena la actividad para controlar la inflación. El BCE también puede comprar deuda pública en el mercado secundario para inyectar liquidez. Ambas políticas deben coordinarse: una política fiscal expansiva combinada con una monetaria restrictiva puede ser contraproducente. El debate entre keynesianos, que priorizan la fiscal, y monetaristas, que confían más en la monetaria, sigue vigente.',
'[{"pregunta":"¿Quién ejecuta la política fiscal?","opciones":["El Banco Central","El gobierno","Las empresas","Los bancos comerciales"],"correcta":1},{"pregunta":"¿Qué hace una política fiscal expansiva?","opciones":["Sube impuestos y recorta gasto","Baja impuestos o aumenta gasto","Sube tipos de interés","Vende deuda pública"],"correcta":1},{"pregunta":"¿Qué controla el BCE con los tipos de interés?","opciones":["El desempleo","Los salarios","La inflación y el crédito","Los impuestos"],"correcta":2},{"pregunta":"¿Qué escuela prioriza la política fiscal?","opciones":["Monetarista","Neoclásica","Keynesiana","Marxista"],"correcta":2}]'),

('economia', 'bachillerato', '{1}', 'El comercio internacional y la globalización',
'El comercio internacional permite a los países especializarse en la producción de aquellos bienes en los que tienen ventaja comparativa, es decir, menor coste de oportunidad relativo. Según la teoría de David Ricardo, incluso un país que produce todo de forma menos eficiente que otro puede beneficiarse del comercio si se especializa en lo que hace relativamente mejor. Las exportaciones generan ingresos y empleo, mientras que las importaciones permiten acceder a productos que no se fabrican internamente o que son más baratos en el exterior. La balanza comercial registra la diferencia entre exportaciones e importaciones: es positiva (superávit) cuando se exporta más de lo que se importa. La Organización Mundial del Comercio promueve la liberalización comercial reduciendo aranceles y barreras. Sin embargo, el proteccionismo sigue presente mediante aranceles, cuotas y subvenciones que buscan proteger la industria nacional. La globalización ha intensificado los flujos comerciales, financieros y migratorios a escala planetaria, creando una economía interconectada. Las multinacionales deslocalizan su producción buscando menores costes. Esta interdependencia tiene ventajas, como el crecimiento y la variedad de productos, pero también riesgos: desigualdad, dependencia externa y vulnerabilidad ante crisis globales como la de 2008.',
'[{"pregunta":"¿Qué es la ventaja comparativa?","opciones":["Producir más barato en términos absolutos","Tener mayor tecnología","Producir con menor coste de oportunidad relativo","Exportar más que importar"],"correcta":2},{"pregunta":"¿Cuándo hay superávit comercial?","opciones":["Cuando se importa más","Cuando se exporta más de lo que se importa","Cuando la balanza es cero","Cuando sube la inflación"],"correcta":1},{"pregunta":"¿Qué promueve la OMC?","opciones":["El proteccionismo","La autarquía","La liberalización del comercio","La planificación central"],"correcta":2},{"pregunta":"¿Qué riesgo tiene la globalización?","opciones":["Mayor variedad de productos","Crecimiento económico","Vulnerabilidad ante crisis globales","Reducción de aranceles"],"correcta":2}]');

-- ---------------------------------------------------------------------------
-- ECONOMÍA DE LA EMPRESA
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('economia-empresa', 'bachillerato', '{2}', 'El balance de situación y el análisis financiero',
'El balance de situación es el documento contable fundamental que refleja la situación patrimonial de una empresa en un momento determinado. Se estructura en dos grandes masas: el activo, que recoge los bienes y derechos de la empresa (lo que tiene y lo que le deben), y el pasivo junto al patrimonio neto, que refleja cómo se ha financiado ese activo (lo que debe y los fondos propios). El activo se divide en activo no corriente (bienes de uso duradero como maquinaria, edificios o patentes) y activo corriente (bienes que se convierten en dinero en menos de un año, como existencias, clientes y tesorería). El pasivo se divide en pasivo no corriente (deudas a largo plazo) y pasivo corriente (deudas a corto plazo). El patrimonio neto incluye el capital social, las reservas y los resultados del ejercicio. La ecuación fundamental de la contabilidad establece que el activo es igual al pasivo más el patrimonio neto. A partir del balance se calculan ratios financieros: la liquidez (activo corriente entre pasivo corriente), la solvencia (activo total entre pasivo total) y el endeudamiento (pasivo entre patrimonio neto). Estos ratios permiten evaluar la salud financiera de la empresa y tomar decisiones informadas.',
'[{"pregunta":"¿Qué refleja el balance de situación?","opciones":["Los ingresos y gastos del año","La situación patrimonial de la empresa","Las ventas del trimestre","Los salarios de los empleados"],"correcta":1},{"pregunta":"¿Qué incluye el activo corriente?","opciones":["Maquinaria y edificios","Existencias, clientes y tesorería","Capital social y reservas","Deudas a largo plazo"],"correcta":1},{"pregunta":"¿Cuál es la ecuación fundamental de la contabilidad?","opciones":["Activo = Pasivo","Ingresos = Gastos","Activo = Pasivo + Patrimonio neto","Capital = Reservas + Beneficios"],"correcta":2},{"pregunta":"¿Qué mide el ratio de liquidez?","opciones":["La rentabilidad de la empresa","La capacidad de pago a corto plazo","El nivel de endeudamiento","Las ventas anuales"],"correcta":1}]'),

('economia-empresa', 'bachillerato', '{2}', 'El marketing mix: las 4P',
'El marketing mix es el conjunto de herramientas que una empresa utiliza para implementar su estrategia de marketing. Tradicionalmente se agrupa en las llamadas cuatro P: producto, precio, plaza (distribución) y promoción (comunicación). El producto es el bien o servicio que la empresa ofrece al mercado para satisfacer una necesidad. Incluye no solo el producto físico, sino también el diseño, la marca, el envase y los servicios postventa. El precio es la cantidad de dinero que el consumidor paga; su fijación depende de los costes, la demanda, la competencia y los objetivos de la empresa. Estrategias como la penetración (precios bajos para ganar cuota) o el descremado (precios altos iniciales) son habituales. La distribución comprende los canales a través de los cuales el producto llega al consumidor final: distribuidores, mayoristas, minoristas, venta directa o comercio electrónico. La comunicación incluye la publicidad, la promoción de ventas, las relaciones públicas, el marketing directo y cada vez más el marketing digital en redes sociales. Un marketing mix eficaz requiere que las cuatro variables sean coherentes entre sí y estén alineadas con el posicionamiento deseado y las necesidades del segmento de mercado objetivo.',
'[{"pregunta":"¿Cuáles son las cuatro P del marketing mix?","opciones":["Producción, personal, planificación, presupuesto","Producto, precio, plaza, promoción","Publicidad, packaging, posicionamiento, precio","Producto, personal, proceso, prueba"],"correcta":1},{"pregunta":"¿En qué consiste la estrategia de penetración?","opciones":["Precios altos para ganar exclusividad","Precios bajos para ganar cuota de mercado","No hacer publicidad","Reducir la distribución"],"correcta":1},{"pregunta":"¿Qué incluye la variable comunicación?","opciones":["Solo publicidad en televisión","Publicidad, promoción, relaciones públicas y marketing digital","Solo redes sociales","Solo relaciones públicas"],"correcta":1},{"pregunta":"¿Qué requisito debe cumplir un buen marketing mix?","opciones":["Que el precio sea siempre el más bajo","Que solo use un canal de distribución","Que las cuatro variables sean coherentes entre sí","Que no considere a la competencia"],"correcta":2}]'),

('economia-empresa', 'bachillerato', '{2}', 'La organización de la empresa',
'La organización empresarial define cómo se estructuran las tareas, responsabilidades y relaciones jerárquicas dentro de una empresa para alcanzar sus objetivos de forma eficiente. Los principios clásicos de organización incluyen la división del trabajo (especialización de tareas), la jerarquía (cadena de mando), la unidad de mando (un solo jefe por subordinado) y el tramo de control (número de personas que puede supervisar un directivo). Existen diversos modelos de estructura organizativa. La estructura lineal es la más sencilla, con una cadena de mando directa del jefe a los subordinados; es propia de empresas pequeñas. La estructura funcional agrupa las actividades por departamentos según su función (producción, marketing, finanzas, recursos humanos). La estructura divisional organiza la empresa en divisiones autónomas por producto, zona geográfica o tipo de cliente. La estructura matricial combina los criterios funcional y divisional, con doble dependencia jerárquica. Taylor propuso la organización científica del trabajo, basada en la medición de tiempos y la especialización extrema. Fayol estableció las funciones de la administración: planificar, organizar, dirigir y controlar. Actualmente, las organizaciones tienden a ser más planas, flexibles y orientadas a equipos de trabajo multidisciplinares.',
'[{"pregunta":"¿Qué establece el principio de unidad de mando?","opciones":["Varios jefes por trabajador","Un solo jefe por subordinado","Todos deciden en asamblea","No hay jerarquía"],"correcta":1},{"pregunta":"¿Qué estructura agrupa por funciones como marketing o finanzas?","opciones":["Lineal","Divisional","Funcional","Matricial"],"correcta":2},{"pregunta":"¿Quién propuso la organización científica del trabajo?","opciones":["Fayol","Maslow","Taylor","Weber"],"correcta":2},{"pregunta":"¿Cuáles son las funciones de la administración según Fayol?","opciones":["Producir, vender, cobrar, pagar","Planificar, organizar, dirigir, controlar","Investigar, desarrollar, innovar, comercializar","Comprar, fabricar, almacenar, distribuir"],"correcta":1}]');

-- ---------------------------------------------------------------------------
-- LATÍN I
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('latin', 'bachillerato', '{1}', 'La sociedad y la vida cotidiana en Roma',
'La sociedad romana se organizaba en una estructura jerárquica rígida. En la cúspide estaban los patricios, familias aristocráticas descendientes de los fundadores de Roma, que controlaban el Senado y los cargos políticos. Los plebeyos, la mayoría de la población libre, fueron conquistando derechos a lo largo de siglos hasta equipararse legalmente con los patricios. Los libertos eran antiguos esclavos manumitidos que, aunque libres, conservaban obligaciones con su antiguo amo. Los esclavos carecían de derechos y eran propiedad de sus dueños; trabajaban en casas, campos y minas. La familia romana estaba presidida por el paterfamilias, que tenía autoridad absoluta sobre esposa, hijos y esclavos. La educación de los niños incluía lectura, escritura, cálculo y, para los más acomodados, retórica y filosofía griega. Los romanos vivían en domus (casas unifamiliares con atrio y peristilo) si eran ricos, o en insulae (bloques de pisos) si eran humildes. Las termas eran el centro de la vida social: no solo servían para el baño, sino también para hacer ejercicio, conversar y cerrar negocios. Los espectáculos públicos, como las luchas de gladiadores en el anfiteatro y las carreras de cuadrigas en el circo, eran fundamentales para el entretenimiento y el control social.',
'[{"pregunta":"¿Quiénes estaban en la cúspide de la sociedad romana?","opciones":["Los plebeyos","Los libertos","Los patricios","Los esclavos"],"correcta":2},{"pregunta":"¿Qué era un liberto?","opciones":["Un patricio rico","Un antiguo esclavo liberado","Un soldado romano","Un sacerdote"],"correcta":1},{"pregunta":"¿Cómo se llamaba la casa romana unifamiliar?","opciones":["Insula","Villa","Domus","Atrium"],"correcta":2},{"pregunta":"¿Para qué servían las termas además de para bañarse?","opciones":["Solo para rezar","Para hacer ejercicio, conversar y hacer negocios","Solo para comer","Para impartir justicia"],"correcta":1}]'),

('latin', 'bachillerato', '{1}', 'Las declinaciones y los casos latinos',
'El latín es una lengua flexiva, lo que significa que las palabras cambian su terminación para indicar su función en la oración. Este sistema de flexión nominal se llama declinación. Existen cinco declinaciones en latín, cada una con un tema vocálico característico: la primera en -a (rosa, rosae), la segunda en -o (dominus, domini), la tercera en consonante o -i (consul, consulis), la cuarta en -u (manus, manus) y la quinta en -e (dies, diei). Cada sustantivo se declina en seis casos que expresan funciones sintácticas. El nominativo indica el sujeto y el atributo. El vocativo se usa para llamar o invocar directamente a alguien. El acusativo señala el complemento directo y la dirección hacia un lugar. El genitivo expresa posesión, equivalente al complemento del nombre con la preposición de en español. El dativo indica el complemento indirecto, es decir, el destinatario o beneficiario de la acción. El ablativo es el caso más versátil: expresa circunstancias de lugar, tiempo, modo, causa e instrumento. Los adjetivos concuerdan con el sustantivo en género, número y caso. Este sistema de casos es lo que permite al latín tener un orden de palabras muy libre en la oración, ya que la función no depende de la posición sino de la desinencia.',
'[{"pregunta":"¿Cuántas declinaciones tiene el latín?","opciones":["Tres","Cuatro","Cinco","Seis"],"correcta":2},{"pregunta":"¿Qué función indica el caso genitivo?","opciones":["Sujeto","Complemento directo","Posesión","Complemento indirecto"],"correcta":2},{"pregunta":"¿Por qué el latín tiene un orden de palabras libre?","opciones":["Porque no tiene gramática","Porque la función la indica la desinencia, no la posición","Porque es una lengua muerta","Porque todas las palabras son iguales"],"correcta":1},{"pregunta":"¿Cuál es el caso más versátil en latín?","opciones":["Nominativo","Acusativo","Dativo","Ablativo"],"correcta":3}]'),

('latin', 'bachillerato', '{1}', 'La mitología romana y su influencia',
'La mitología romana fue en gran parte una adaptación de la griega, aunque los romanos añadieron dioses y leyendas propios. Júpiter, equivalente a Zeus, era el padre de los dioses y señor del cielo y el rayo. Su esposa Juno, equivalente a Hera, protegía el matrimonio. Minerva, la Atenea romana, era diosa de la sabiduría. Marte, dios de la guerra, tenía una importancia especial en Roma como padre de Rómulo. Venus, diosa del amor, era considerada antepasada de los romanos a través de su hijo Eneas. Neptuno gobernaba los mares, Plutón el mundo de los muertos y Mercurio era el mensajero de los dioses. La mitología romana incluía también leyendas propias como la fundación de Roma por Rómulo y Remo, amamantados por la loba capitolina. La Eneida de Virgilio conectó la historia de Roma con la guerra de Troya a través del héroe Eneas. Los romanos practicaban una religión politeísta con rituales públicos dirigidos por sacerdotes como los pontífices y los augures, que interpretaban los presagios. La mitología romana ha influido enormemente en el arte, la literatura, la música y el lenguaje occidental: los días de la semana, los meses, los planetas y múltiples expresiones cotidianas llevan nombres de dioses romanos.',
'[{"pregunta":"¿Cuál era el equivalente romano de Zeus?","opciones":["Marte","Neptuno","Júpiter","Plutón"],"correcta":2},{"pregunta":"¿Quién era considerada antepasada de los romanos?","opciones":["Juno","Minerva","Diana","Venus"],"correcta":3},{"pregunta":"¿Qué obra conectó Roma con la guerra de Troya?","opciones":["La Odisea","La Eneida","Las Metamorfosis","Las Geórgicas"],"correcta":1},{"pregunta":"¿Qué influencia tiene la mitología romana hoy?","opciones":["Ninguna","Solo en Italia","En los nombres de días, meses, planetas y expresiones","Solo en la religión"],"correcta":2}]');

-- ---------------------------------------------------------------------------
-- LATÍN II
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('latin', 'bachillerato', '{2}', 'Virgilio y la Eneida',
'Publio Virgilio Marón (70-19 a.C.) es considerado el mayor poeta de la literatura latina. Nacido cerca de Mantua, estudió en Cremona, Milán, Roma y Nápoles. Sus primeras obras fueron las Bucólicas, diez églogas pastoriles que idealizaban la vida campestre, y las Geórgicas, un poema didáctico sobre la agricultura que Mecenas le encargó para promover el retorno al campo. Su obra cumbre es la Eneida, un poema épico en doce libros y más de diez mil versos en hexámetros dactílicos, encargado por Augusto para glorificar los orígenes de Roma. La obra narra el viaje del troyano Eneas desde la caída de Troya hasta Italia, donde funda la estirpe que dará lugar a Roma. Los seis primeros libros, inspirados en la Odisea, narran los viajes y naufragios de Eneas, incluyendo su amor trágico con Dido en Cartago y su descenso al mundo de los muertos. Los seis últimos, inspirados en la Ilíada, relatan las guerras de Eneas en el Lacio. Virgilio murió en Brindisi sin haber terminado la Eneida, pidiendo que se quemara el manuscrito. Augusto ordenó su publicación. La Eneida fue considerada durante toda la Antigüedad y la Edad Media como la obra maestra de la literatura latina, y Dante eligió a Virgilio como guía en la Divina Comedia.',
'[{"pregunta":"¿Cuántos libros tiene la Eneida?","opciones":["Seis","Diez","Doce","Veinticuatro"],"correcta":2},{"pregunta":"¿Quién encargó la Eneida a Virgilio?","opciones":["Julio César","Mecenas","Augusto","Nerón"],"correcta":2},{"pregunta":"¿Qué narran los seis primeros libros de la Eneida?","opciones":["Las guerras en el Lacio","Los viajes de Eneas hasta Italia","La fundación de Roma","La muerte de Eneas"],"correcta":1},{"pregunta":"¿Qué pidió Virgilio al morir?","opciones":["Que publicaran la Eneida","Que la quemaran","Que la enviaran a Grecia","Que la enterraran con él"],"correcta":1}]'),

('latin', 'bachillerato', '{2}', 'La retórica latina y Cicerón',
'La retórica, el arte de persuadir mediante el discurso, fue una disciplina fundamental en la educación y la vida pública romana. Los romanos la heredaron de los griegos, pero la perfeccionaron y sistematizaron. El proceso retórico se dividía en cinco fases: la inventio (búsqueda de argumentos), la dispositio (organización del discurso en exordio, narración, argumentación y peroración), la elocutio (elección del estilo y las figuras retóricas), la memoria (técnicas de memorización) y la actio (puesta en escena con voz y gestos). Marco Tulio Cicerón (106-43 a.C.) fue el orador más brillante de Roma. Nacido en Arpino, se formó en Roma y Grecia. Como cónsul en el 63 a.C., desenmascaró la conjuración de Catilina con cuatro célebres discursos, las Catilinarias, que comienzan con la famosa frase «¿Hasta cuándo, Catilina, abusarás de nuestra paciencia?». Cicerón también escribió tratados filosóficos y retóricos como De oratore, De re publica y De amicitia. Tras el asesinato de César, sus Filípicas contra Marco Antonio le costaron la vida. Su prosa, elegante y equilibrada, se convirtió en el modelo del latín clásico. La retórica ciceroniana influyó en la oratoria occidental durante siglos y sus técnicas siguen siendo la base de la comunicación persuasiva moderna.',
'[{"pregunta":"¿Cuántas fases tiene el proceso retórico latino?","opciones":["Tres","Cuatro","Cinco","Seis"],"correcta":2},{"pregunta":"¿Contra quién pronunció Cicerón las Catilinarias?","opciones":["Julio César","Marco Antonio","Catilina","Pompeyo"],"correcta":2},{"pregunta":"¿Qué fase retórica corresponde a la elección del estilo?","opciones":["Inventio","Dispositio","Elocutio","Actio"],"correcta":2},{"pregunta":"¿Qué discursos le costaron la vida a Cicerón?","opciones":["Las Catilinarias","Las Filípicas","De oratore","De re publica"],"correcta":1}]'),

('latin', 'bachillerato', '{2}', 'La pervivencia del latín en las lenguas romances',
'El latín no murió: se transformó. Tras la caída del Imperio Romano de Occidente en el 476 d.C., el latín vulgar hablado por el pueblo en las distintas provincias fue evolucionando de forma independiente, dando lugar a las lenguas romances. Este proceso se vio favorecido por el aislamiento de las regiones tras las invasiones germánicas y la desaparición de la administración unificada romana. Las principales lenguas romances son el castellano, el catalán, el gallego, el portugués, el francés, el italiano, el rumano y el occitano. Todas comparten un origen común pero han evolucionado de formas distintas según el sustrato prerromano, el superestrato germánico y las influencias posteriores. En español, las palabras heredadas del latín siguieron dos vías: las patrimoniales, que evolucionaron fonéticamente (filium dio hijo), y los cultismos, que se tomaron directamente del latín escrito conservando su forma original (filial). También existen semicultismos con una evolución parcial. El latín pervive además en el vocabulario científico, jurídico y religioso: habeas corpus, curriculum vitae, in vitro, per capita, etcétera. Las lenguas romances mantienen la estructura gramatical básica del latín, aunque simplificada: perdieron el sistema de declinaciones y desarrollaron artículos y preposiciones para expresar las funciones que antes indicaban los casos.',
'[{"pregunta":"¿De qué variedad del latín derivan las lenguas romances?","opciones":["Del latín clásico","Del latín vulgar","Del latín eclesiástico","Del latín jurídico"],"correcta":1},{"pregunta":"¿Qué es una palabra patrimonial?","opciones":["Una tomada del griego","Una que evolucionó fonéticamente desde el latín","Una inventada en la Edad Media","Una que se mantuvo igual"],"correcta":1},{"pregunta":"¿Qué perdieron las lenguas romances respecto al latín?","opciones":["Los verbos","El vocabulario","El sistema de declinaciones","Las vocales"],"correcta":2},{"pregunta":"¿En qué campos pervive el latín directamente?","opciones":["Solo en la religión","En ciencia, derecho y religión","Solo en la medicina","En el comercio"],"correcta":1}]');

COMMIT;
