-- =============================================================================
-- ROSCO BACHILLERATO: Lengua 1o, Lengua 2o, Filosofia 1o, Filosofia 2o
-- 75 preguntas x 4 asignaturas = 300 preguntas
-- =============================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty)
VALUES

-- =============================================================================
-- LENGUA 1o BACHILLERATO (75 preguntas)
-- Temas: Renacimiento, Barroco, Siglo de Oro, sintaxis compleja,
--         morfologia, semantica, pragmatica, tipologia textual,
--         figuras retoricas, metrica, generos, autores y obras
-- =============================================================================

-- 1
('A', 'empieza', 'Figura retorica que consiste en la repeticion de una o varias palabras al comienzo de versos o frases sucesivas', 'anafora', 'lengua', 'bachillerato', '{1}', 1),
-- 2
('A', 'empieza', 'Figura retorica que consiste en la supresion de conjunciones para dar mayor dinamismo y rapidez al enunciado', 'asindeton', 'lengua', 'bachillerato', '{1}', 1),
-- 3
('A', 'empieza', 'Figura retorica que consiste en atribuir cualidades de seres animados a objetos inanimados o ideas abstractas', 'animismo', 'lengua', 'bachillerato', '{1}', 2),
-- 4
('B', 'empieza', 'Movimiento literario y artistico del siglo XVII espanol caracterizado por la complejidad formal, el desengano y el contraste', 'barroco', 'lengua', 'bachillerato', '{1}', 1),
-- 5
('B', 'empieza', 'Subgenero poetico pastoril cultivado en el Renacimiento que idealiza la naturaleza como locus amoenus', 'bucolica', 'lengua', 'bachillerato', '{1}', 2),
-- 6
('C', 'empieza', 'Estrofa de cuatro versos endecasilabos con rima consonante ABBA, muy empleada en los sonetos renacentistas', 'cuarteto', 'lengua', 'bachillerato', '{1}', 1),
-- 7
('C', 'empieza', 'Corriente estetica del Barroco que se caracteriza por la oscuridad, los latinismos y la ornamentacion del lenguaje, representada por Gongora', 'culteranismo', 'lengua', 'bachillerato', '{1}', 1),
-- 8
('C', 'empieza', 'Corriente estetica barroca que busca la agudeza del ingenio y el juego de ideas, representada por Quevedo y Gracian', 'conceptismo', 'lengua', 'bachillerato', '{1}', 1),
-- 9
('D', 'empieza', 'Composicion poetica formada por dos versos que riman entre si, usada a veces como remate de sonetos en la tradicion inglesa', 'distico', 'lengua', 'bachillerato', '{1}', 2),
-- 10
('D', 'empieza', 'Fenomeno semantico por el cual una misma palabra tiene dos o mas acepciones distintas pero relacionadas entre si', 'disemia', 'lengua', 'bachillerato', '{1}', 3),
-- 11
('E', 'empieza', 'Verso de once silabas metricas, base de la poesia renacentista espanola introducido por Boscan y Garcilaso', 'endecasilabo', 'lengua', 'bachillerato', '{1}', 1),
-- 12
('E', 'empieza', 'Figura retorica que consiste en suavizar una expresion que podria resultar dura, desagradable o malsonante', 'eufemismo', 'lengua', 'bachillerato', '{1}', 1),
-- 13
('E', 'empieza', 'Poema pastoril en forma de dialogo entre pastores sobre temas amorosos, cultivado por Garcilaso y Virgilio', 'egloga', 'lengua', 'bachillerato', '{1}', 1),
-- 14
('F', 'empieza', 'Recursos expresivos del lenguaje literario que se apartan del uso comun para producir un efecto estetico determinado', 'figuras', 'lengua', 'bachillerato', '{1}', 1),
-- 15
('F', 'empieza', 'Tipo de texto cuya intencion comunicativa principal es influir en la conducta o las opiniones del receptor', 'funcional', 'lengua', 'bachillerato', '{1}', 2),
-- 16
('G', 'empieza', 'Poeta renacentista toledano autor de las Eglogas, considerado el introductor del petrarquismo en la lirica espanola', 'garcilaso', 'lengua', 'bachillerato', '{1}', 1),
-- 17
('G', 'empieza', 'Cada una de las grandes categorias en que se clasifican las obras literarias: lirico, narrativo y dramatico', 'genero', 'lengua', 'bachillerato', '{1}', 1),
-- 18
('G', 'empieza', 'Escritor barroco aragones autor de El Criticon y el Oraculo manual y arte de prudencia, teorico del conceptismo', 'gracian', 'lengua', 'bachillerato', '{1}', 2),
-- 19
('H', 'empieza', 'Figura retorica que consiste en la exageracion desmesurada de las cualidades o acciones para enfatizar una idea', 'hiperbole', 'lengua', 'bachillerato', '{1}', 1),
-- 20
('H', 'empieza', 'Verso de siete silabas metricas, frecuente en las liras y silvas del Renacimiento y el Barroco', 'heptasilabo', 'lengua', 'bachillerato', '{1}', 1),
-- 21
('H', 'empieza', 'Fenomeno semantico por el cual dos palabras distintas tienen identica forma pero significados diferentes y sin relacion', 'homonimia', 'lengua', 'bachillerato', '{1}', 2),
-- 22
('I', 'empieza', 'Figura retorica que consiste en expresar lo contrario de lo que se quiere decir, manteniendo apariencia de veracidad', 'ironia', 'lengua', 'bachillerato', '{1}', 1),
-- 23
('I', 'empieza', 'Recurso retorico que consiste en la descripcion viva y detallada de personas, paisajes u objetos apelando a los sentidos', 'imagen', 'lengua', 'bachillerato', '{1}', 2),
-- 24
('J', 'empieza', 'Composicion lirica popular de la Edad Media hispanohebrea o hispanoarebe que suele expresar una queja amorosa femenina', 'jarcha', 'lengua', 'bachillerato', '{1}', 2),
-- 25
('K', 'contiene', 'Figura retorica que une dos terminos de significado opuesto en una misma expresion, como musica callada o soledad sonora', 'oximoron', 'lengua', 'bachillerato', '{1}', 2),
-- 26
('L', 'empieza', 'Estrofa de cinco versos que combina heptasilabos y endecasilabos con rima consonante, introducida por Garcilaso en la poesia espanola', 'lira', 'lengua', 'bachillerato', '{1}', 1),
-- 27
('L', 'empieza', 'Genero literario que agrupa las obras que expresan sentimientos y emociones del yo poetico, en verso o prosa', 'lirica', 'lengua', 'bachillerato', '{1}', 1),
-- 28
('M', 'empieza', 'Figura retorica que consiste en identificar un termino real con otro imaginario con el que guarda una relacion de semejanza', 'metafora', 'lengua', 'bachillerato', '{1}', 1),
-- 29
('M', 'empieza', 'Disciplina que estudia la medida, el ritmo, la pausa y la combinacion de los versos en la poesia', 'metrica', 'lengua', 'bachillerato', '{1}', 1),
-- 30
('M', 'empieza', 'Figura retorica que consiste en designar una cosa con el nombre de otra con la que mantiene una relacion de contiguidad', 'metonimia', 'lengua', 'bachillerato', '{1}', 2),
-- 31
('M', 'empieza', 'Parte de la gramatica que estudia la estructura interna de las palabras y sus procesos de formacion', 'morfologia', 'lengua', 'bachillerato', '{1}', 1),
-- 32
('N', 'empieza', 'Genero literario que presenta una historia ficticia protagonizada por personajes en un espacio y tiempo determinados', 'narrativa', 'lengua', 'bachillerato', '{1}', 1),
-- 33
('N', 'empieza', 'Subgenero narrativo del Renacimiento que idealiza la vida de los pastores en un entorno idilico', 'novela', 'lengua', 'bachillerato', '{1}', 2),
-- 34
('Ñ', 'contiene', 'Composicion teatral breve y comica del Siglo de Oro que se representaba en los entreactos de las comedias principales', 'entremes', 'lengua', 'bachillerato', '{1}', 2),
-- 35
('O', 'empieza', 'Composicion lirica extensa de tono elevado destinada a la alabanza, cultivada por Fray Luis de Leon', 'oda', 'lengua', 'bachillerato', '{1}', 2),
-- 36
('O', 'empieza', 'Estrofa de ocho versos endecasilabos con rima consonante ABABABCC, usada en la poesia epica renacentista', 'octava', 'lengua', 'bachillerato', '{1}', 2),
-- 37
('P', 'empieza', 'Novela del Siglo de Oro que narra las aventuras de un protagonista de baja condicion social que sirve a varios amos', 'picaresca', 'lengua', 'bachillerato', '{1}', 1),
-- 38
('P', 'empieza', 'Figura retorica que consiste en la repeticion innecesaria de palabras o ideas para reforzar un concepto', 'pleonasmo', 'lengua', 'bachillerato', '{1}', 2),
-- 39
('P', 'empieza', 'Figura retorica que consiste en atribuir cualidades o acciones humanas a seres inanimados o abstractos', 'prosopopeya', 'lengua', 'bachillerato', '{1}', 2),
-- 40
('P', 'empieza', 'Fenomeno semantico por el cual una misma palabra posee multiples significados relacionados entre si', 'polisemia', 'lengua', 'bachillerato', '{1}', 1),
-- 41
('Q', 'empieza', 'Escritor barroco madrileno autor de El Buscon y los Suenos, maximo representante del conceptismo', 'quevedo', 'lengua', 'bachillerato', '{1}', 1),
-- 42
('R', 'empieza', 'Movimiento cultural europeo de los siglos XV y XVI que recupera los ideales clasicos grecolatinos', 'renacimiento', 'lengua', 'bachillerato', '{1}', 1),
-- 43
('R', 'empieza', 'Coincidencia de sonidos a partir de la ultima vocal acentuada entre dos o mas versos', 'rima', 'lengua', 'bachillerato', '{1}', 1),
-- 44
('R', 'empieza', 'Composicion poetica formada por versos octasilabos con rima asonante en los pares, tipica de la tradicion oral espanola', 'romance', 'lengua', 'bachillerato', '{1}', 1),
-- 45
('S', 'empieza', 'Composicion poetica de catorce versos endecasilabos distribuidos en dos cuartetos y dos tercetos con rima consonante', 'soneto', 'lengua', 'bachillerato', '{1}', 1),
-- 46
('S', 'empieza', 'Figura retorica que designa una parte por el todo o el todo por una parte', 'sinecdoque', 'lengua', 'bachillerato', '{1}', 2),
-- 47
('S', 'empieza', 'Combinacion libre de versos endecasilabos y heptasilabos con rima consonante sin esquema fijo, frecuente en el Barroco', 'silva', 'lengua', 'bachillerato', '{1}', 2),
-- 48
('S', 'empieza', 'Comparacion explicita entre dos elementos usando nexos como como, cual, igual que o semejante a', 'simil', 'lengua', 'bachillerato', '{1}', 1),
-- 49
('T', 'empieza', 'Estrofa de tres versos endecasilabos con rima encadenada ABA BCB CDC, usada por Garcilaso', 'terceto', 'lengua', 'bachillerato', '{1}', 1),
-- 50
('T', 'empieza', 'Genero dramatico del Siglo de Oro codificado por Lope de Vega en su Arte nuevo de hacer comedias', 'teatro', 'lengua', 'bachillerato', '{1}', 1),
-- 51
('U', 'empieza', 'Relacion semantica entre palabras que poseen un significado unico e inequivoco en todo contexto', 'univocidad', 'lengua', 'bachillerato', '{1}', 3),
-- 52
('V', 'empieza', 'Dramaturgo del Siglo de Oro autor de Fuenteovejuna y El caballero de Olmedo, creador de la comedia nueva', 'vega', 'lengua', 'bachillerato', '{1}', 1),
-- 53
('V', 'empieza', 'Cada una de las lineas de un poema, cuya medida se cuenta en silabas metricas', 'verso', 'lengua', 'bachillerato', '{1}', 1),
-- 54
('X', 'contiene', 'Tipo de texto que presenta hechos, conceptos o ideas de forma objetiva para hacerlos comprensibles al receptor', 'expositivo', 'lengua', 'bachillerato', '{1}', 1),
-- 55
('Y', 'contiene', 'Figura retorica que consiste en la repeticion de una conjuncion copulativa para unir elementos, dando solemnidad al discurso', 'polisindeton', 'lengua', 'bachillerato', '{1}', 2),
-- 56
('Z', 'contiene', 'Poeta mistico del siglo XVI autor del Cantico espiritual y Noche oscura del alma, cumbre de la lirica renacentista', 'cruz', 'lengua', 'bachillerato', '{1}', 2),
-- 57
('A', 'empieza', 'Tipo de oracion subordinada que desempena la funcion de un adverbio modificando al verbo principal', 'adverbial', 'lengua', 'bachillerato', '{1}', 2),
-- 58
('B', 'empieza', 'Novela picaresca del siglo XVII escrita por Quevedo que narra la vida del picaro don Pablos', 'buscon', 'lengua', 'bachillerato', '{1}', 1),
-- 59
('C', 'empieza', 'Dramaturgo barroco autor de La vida es sueno y El alcalde de Zalamea, maxima figura del teatro del siglo XVII', 'calderon', 'lengua', 'bachillerato', '{1}', 1),
-- 60
('D', 'empieza', 'Fenomeno linguistico por el cual ciertos elementos del texto remiten al contexto situacional del acto comunicativo', 'deixis', 'lengua', 'bachillerato', '{1}', 3),
-- 61
('E', 'empieza', 'Licencia metrica que consiste en la union en una sola silaba de la vocal final de una palabra con la inicial de la siguiente', 'encabalgamiento', 'lengua', 'bachillerato', '{1}', 2),
-- 62
('F', 'empieza', 'Poeta y prosista renacentista agustino, autor de la Oda a la vida retirada y De los nombres de Cristo', 'fray', 'lengua', 'bachillerato', '{1}', 2),
-- 63
('G', 'empieza', 'Poeta barroco cordobes autor de la Fabula de Polifemo y Galatea y las Soledades, maximo culteranista', 'gongora', 'lengua', 'bachillerato', '{1}', 1),
-- 64
('H', 'empieza', 'Figura retorica que consiste en alterar el orden logico habitual de los elementos de la oracion', 'hiperbaton', 'lengua', 'bachillerato', '{1}', 1),
-- 65
('I', 'empieza', 'Corriente literaria renacentista de origen italiano basada en la imitacion de los modelos clasicos grecolatinos', 'italianismo', 'lengua', 'bachillerato', '{1}', 3),
-- 66
('J', 'contiene', 'Obra picaresca anonima de 1554 cuyo protagonista sirve a un ciego, un clerigo y un escudero, entre otros amos', 'lazarillo', 'lengua', 'bachillerato', '{1}', 1),
-- 67
('L', 'empieza', 'Tipo de texto que presenta argumentos a favor de una tesis con la intencion de convencer al receptor', 'legislativo', 'lengua', 'bachillerato', '{1}', 3),
-- 68
('N', 'empieza', 'Parte de la linguistica que establece las reglas del uso correcto de una lengua en un momento dado', 'norma', 'lengua', 'bachillerato', '{1}', 2),
-- 69
('O', 'empieza', 'Propiedad textual que asegura que las ideas se presentan de modo logico y estructurado en el discurso', 'organizacion', 'lengua', 'bachillerato', '{1}', 2),
-- 70
('P', 'empieza', 'Disciplina linguistica que estudia el uso del lenguaje en contexto y la relacion entre hablante y receptor', 'pragmatica', 'lengua', 'bachillerato', '{1}', 2),
-- 71
('S', 'empieza', 'Parte de la gramatica que estudia el significado de las palabras y sus relaciones semanticas', 'semantica', 'lengua', 'bachillerato', '{1}', 1),
-- 72
('T', 'empieza', 'Clasificacion de los textos segun su intencion comunicativa: narrativo, descriptivo, expositivo, argumentativo y dialogico', 'tipologia', 'lengua', 'bachillerato', '{1}', 2),
-- 73
('V', 'empieza', 'Fenomeno linguistico por el que una palabra puede tener multiples acepciones distintas pero registradas bajo una misma entrada', 'vocablo', 'lengua', 'bachillerato', '{1}', 3),
-- 74
('W', 'contiene', 'Tipo de novela renacentista de aventuras fantasticas protagonizada por caballeros andantes que Cervantes parodio en su obra maestra', 'caballeresca', 'lengua', 'bachillerato', '{1}', 2),
-- 75
('Z', 'contiene', 'Obra maestra de Calderon de la Barca en la que Segismundo reflexiona sobre la realidad, la libertad y los suenos', 'razonamiento', 'lengua', 'bachillerato', '{1}', 2),

-- =============================================================================
-- LENGUA 2o BACHILLERATO (75 preguntas)
-- Temas: Ilustracion, Romanticismo, Realismo, Naturalismo, Gen.98,
--         Gen.27, posguerra, narrativa experimental, poesia contemporanea,
--         teatro siglo XX, comentario de texto, linguistica textual
-- =============================================================================

-- 1
('A', 'empieza', 'Poeta de la Generacion del 27 autor de La destruccion o el amor, premio Nobel de Literatura en 1977', 'aleixandre', 'lengua', 'bachillerato', '{2}', 1),
-- 2
('A', 'empieza', 'Propiedad textual que garantiza que el texto se ajusta a la situacion comunicativa, al registro y a la intencion del emisor', 'adecuacion', 'lengua', 'bachillerato', '{2}', 1),
-- 3
('A', 'empieza', 'Poeta de la Generacion del 27, autor de Marinero en tierra y Sobre los angeles, exiliado tras la Guerra Civil', 'alberti', 'lengua', 'bachillerato', '{2}', 1),
-- 4
('A', 'empieza', 'Seudo nombre del escritor Jose Martinez Ruiz, miembro de la Generacion del 98, autor de La voluntad y Castilla', 'azorin', 'lengua', 'bachillerato', '{2}', 1),
-- 5
('B', 'empieza', 'Poeta romantico sevillano autor de las Rimas y las Leyendas, maximo representante del Romanticismo tardio espanol', 'becquer', 'lengua', 'bachillerato', '{2}', 1),
-- 6
('B', 'empieza', 'Dramaturgo de posguerra autor de Historia de una escalera, El tragaluz y En la ardiente oscuridad', 'buero', 'lengua', 'bachillerato', '{2}', 1),
-- 7
('C', 'empieza', 'Novelista de posguerra autor de La familia de Pascual Duarte y La colmena, premio Nobel en 1989', 'cela', 'lengua', 'bachillerato', '{2}', 1),
-- 8
('C', 'empieza', 'Propiedad textual que garantiza que todas las ideas del texto se relacionan con el tema global de forma logica', 'coherencia', 'lengua', 'bachillerato', '{2}', 1),
-- 9
('C', 'empieza', 'Propiedad textual que se logra mediante mecanismos linguisticos que conectan las oraciones entre si dentro del texto', 'cohesion', 'lengua', 'bachillerato', '{2}', 1),
-- 10
('D', 'empieza', 'Novelista vallisoletano autor de El camino, Los santos inocentes y Cinco horas con Mario', 'delibes', 'lengua', 'bachillerato', '{2}', 1),
-- 11
('D', 'empieza', 'Poeta hispanoamericano autor de Azul y Prosas profanas, lider del movimiento que renovo la lirica en espanol a fines del XIX', 'dario', 'lengua', 'bachillerato', '{2}', 2),
-- 12
('E', 'empieza', 'Subgenero teatral creado por Valle-Inclan que deforma sistematicamente la realidad mediante una estetica degradante y grotesca', 'esperpento', 'lengua', 'bachillerato', '{2}', 1),
-- 13
('E', 'empieza', 'Poeta romantico autor de El estudiante de Salamanca y la Cancion del pirata, representante del Romanticismo exaltado', 'espronceda', 'lengua', 'bachillerato', '{2}', 1),
-- 14
('E', 'empieza', 'Corriente narrativa del siglo XX que rompe con la linealidad, usa el monologo interior y experimenta con la estructura', 'experimental', 'lengua', 'bachillerato', '{2}', 2),
-- 15
('F', 'empieza', 'Poeta y dramaturgo de la Generacion del 27, autor del Romancero gitano y La casa de Bernarda Alba, asesinado en 1936', 'federico', 'lengua', 'bachillerato', '{2}', 1),
-- 16
('F', 'empieza', 'Ensayista ilustrado espanol del siglo XVIII autor del Teatro critico universal y las Cartas eruditas y curiosas', 'feijoo', 'lengua', 'bachillerato', '{2}', 2),
-- 17
('G', 'empieza', 'Grupo de escritores espanoles nacidos en torno a 1870 que reflexionaron sobre Espana tras el desastre colonial de 1898', 'generacion', 'lengua', 'bachillerato', '{2}', 1),
-- 18
('G', 'empieza', 'Novelista realista canario autor de los Episodios Nacionales y Fortunata y Jacinta, cumbre del Realismo espanol', 'galdos', 'lengua', 'bachillerato', '{2}', 1),
-- 19
('G', 'empieza', 'Poeta de la Generacion del 27 autor de Cantico, representante de la poesia pura y la afirmacion vital', 'guillen', 'lengua', 'bachillerato', '{2}', 2),
-- 20
('H', 'empieza', 'Poeta vinculado a la Generacion del 27, autor de Perito en lunas y El rayo que no cesa, fallecido en prision en 1942', 'hernandez', 'lengua', 'bachillerato', '{2}', 1),
-- 21
('I', 'empieza', 'Movimiento cultural del siglo XVIII basado en la razon, la ciencia y el progreso, llamado tambien Siglo de las Luces', 'ilustracion', 'lengua', 'bachillerato', '{2}', 1),
-- 22
('J', 'empieza', 'Poeta moguereano autor de Platero y yo y Diario de un poeta recien casado, premio Nobel en 1956', 'juanramon', 'lengua', 'bachillerato', '{2}', 1),
-- 23
('K', 'contiene', 'Novelista autor de Tiempo de silencio, obra clave de la narrativa experimental espanola de los anos sesenta', 'martindesantos', 'lengua', 'bachillerato', '{2}', 3),
-- 24
('L', 'empieza', 'Autor romantico de articulos costumbristas y satiricos firmados con el seudonimo Figaro, figura clave del periodismo espanol', 'larra', 'lengua', 'bachillerato', '{2}', 1),
-- 25
('L', 'empieza', 'Poeta granadino de la Generacion del 27 autor de Poeta en Nueva York y Yerma', 'lorca', 'lengua', 'bachillerato', '{2}', 1),
-- 26
('M', 'empieza', 'Poeta sevillano de la Generacion del 98 autor de Campos de Castilla y Soledades, galerias y otros poemas', 'machado', 'lengua', 'bachillerato', '{2}', 1),
-- 27
('M', 'empieza', 'Corriente literaria hispanoamericana de finales del XIX que renovo la estetica poetica en espanol con musicalidad y exotismo', 'modernismo', 'lengua', 'bachillerato', '{2}', 1),
-- 28
('M', 'empieza', 'Tecnica narrativa del siglo XX que reproduce el fluir desordenado del pensamiento de un personaje sin intervencion del narrador', 'monologo', 'lengua', 'bachillerato', '{2}', 2),
-- 29
('N', 'empieza', 'Corriente literaria derivada del Realismo que aplica el metodo cientifico al estudio de la conducta humana, influida por Zola', 'naturalismo', 'lengua', 'bachillerato', '{2}', 1),
-- 30
('Ñ', 'contiene', 'Tecnica narrativa de posguerra en la que el narrador se limita a registrar acciones y dialogos como una camara objetiva', 'banobjetivist', 'lengua', 'bachillerato', '{2}', 3),
-- 31
('O', 'empieza', 'Tecnica narrativa en la que el narrador no interviene y se limita a registrar lo que dicen y hacen los personajes', 'objetivismo', 'lengua', 'bachillerato', '{2}', 2),
-- 32
('O', 'empieza', 'Pensador espanol autor de La rebelion de las masas y Meditaciones del Quijote, influyente en el ensayo del siglo XX', 'ortega', 'lengua', 'bachillerato', '{2}', 2),
-- 33
('P', 'empieza', 'Novelista gallega autora de Los pazos de Ulloa, introductora del Naturalismo en Espana', 'pardo', 'lengua', 'bachillerato', '{2}', 1),
-- 34
('P', 'empieza', 'Tipo de narrador que conoce los pensamientos y sentimientos de todos los personajes, propio de la novela realista del XIX', 'perspectiva', 'lengua', 'bachillerato', '{2}', 2),
-- 35
('P', 'empieza', 'Poeta de la Generacion del 27 autor de La voz a ti debida y Razon de amor, representante de la poesia amorosa pura', 'pedro', 'lengua', 'bachillerato', '{2}', 2),
-- 36
('Q', 'contiene', 'Recurso de cohesion textual que sustituye un elemento por otro equivalente para evitar la repeticion en el discurso', 'anaforicotext', 'lengua', 'bachillerato', '{2}', 3),
-- 37
('R', 'empieza', 'Movimiento literario del siglo XIX que busca representar la realidad social de forma objetiva y detallada', 'realismo', 'lengua', 'bachillerato', '{2}', 1),
-- 38
('R', 'empieza', 'Movimiento literario de la primera mitad del siglo XIX que exalta la libertad, el sentimiento y la subjetividad', 'romanticismo', 'lengua', 'bachillerato', '{2}', 1),
-- 39
('R', 'empieza', 'Novela naturalista de Leopoldo Alas Clarin ambientada en Vetusta que retrata la hipocresia provincial', 'regenta', 'lengua', 'bachillerato', '{2}', 1),
-- 40
('S', 'empieza', 'Novelista autor de El Jarama, obra cumbre del realismo social espanol de los anos cincuenta', 'sanchez', 'lengua', 'bachillerato', '{2}', 2),
-- 41
('S', 'empieza', 'Movimiento poetico de vanguardia que explora el subconsciente, los suenos y la escritura automatica', 'surrealismo', 'lengua', 'bachillerato', '{2}', 1),
-- 42
('S', 'empieza', 'Poeta de la Generacion del 27 autor de La realidad y el deseo y Los placeres prohibidos, exiliado en Mexico', 'salinas', 'lengua', 'bachillerato', '{2}', 2),
-- 43
('T', 'empieza', 'Corriente de la novela de posguerra caracterizada por la violencia y la crudeza, inaugurada con La familia de Pascual Duarte', 'tremendismo', 'lengua', 'bachillerato', '{2}', 1),
-- 44
('T', 'empieza', 'Tipo de texto que presenta razones a favor o en contra de una tesis con el fin de convencer al receptor', 'tesis', 'lengua', 'bachillerato', '{2}', 2),
-- 45
('U', 'empieza', 'Escritor de la Generacion del 98 autor de Niebla, San Manuel Bueno y Del sentimiento tragico de la vida', 'unamuno', 'lengua', 'bachillerato', '{2}', 1),
-- 46
('V', 'empieza', 'Dramaturgo gallego de la Generacion del 98 autor de Luces de bohemia y las Comedias barbaras', 'valleinclan', 'lengua', 'bachillerato', '{2}', 1),
-- 47
('V', 'empieza', 'Corrientes artisticas de principios del siglo XX que rompen con la tradicion: futurismo, dadaismo, surrealismo, ultraismo', 'vanguardias', 'lengua', 'bachillerato', '{2}', 1),
-- 48
('W', 'contiene', 'Autor romantico del Duque de Rivas cuyo drama Don Alvaro o la fuerza del sino es emblema del teatro romantico espanol', 'rivas', 'lengua', 'bachillerato', '{2}', 2),
-- 49
('X', 'contiene', 'Propiedad de los textos que permite analizarlos como unidades comunicativas completas con sentido global', 'texto', 'lengua', 'bachillerato', '{2}', 1),
-- 50
('Y', 'contiene', 'Autor teatral de posguerra creador de Tres sombreros de copa y Maribel y la extrana familia', 'mihura', 'lengua', 'bachillerato', '{2}', 2),
-- 51
('Z', 'contiene', 'Periodista romantico que escribio articulos satiricos sobre la sociedad espanola con el seudonimo Figaro', 'larra', 'lengua', 'bachillerato', '{2}', 2),
-- 52
('A', 'empieza', 'Tipo de comentario academico que analiza la organizacion, los recursos linguisticos y la intencion comunicativa de un escrito', 'analisis', 'lengua', 'bachillerato', '{2}', 2),
-- 53
('B', 'empieza', 'Escritor de la Generacion del 98 autor de El arbol de la ciencia y la trilogia La lucha por la vida', 'baroja', 'lengua', 'bachillerato', '{2}', 1),
-- 54
('C', 'empieza', 'Novela de Cela de 1951 que retrata la vida cotidiana del Madrid de posguerra a traves de multiples personajes', 'colmena', 'lengua', 'bachillerato', '{2}', 1),
-- 55
('D', 'empieza', 'Mecanismo de cohesion textual por el cual un elemento linguistico remite a otro anterior en el discurso', 'deixis', 'lengua', 'bachillerato', '{2}', 3),
-- 56
('E', 'empieza', 'Genero periodistico de opinion en el que el autor expone su valoracion personal sobre un tema de actualidad', 'editorial', 'lengua', 'bachillerato', '{2}', 2),
-- 57
('F', 'empieza', 'Funcion del lenguaje centrada en la forma del mensaje, predominante en los textos literarios segun Jakobson', 'funcion', 'lengua', 'bachillerato', '{2}', 2),
-- 58
('G', 'empieza', 'Grupo de poetas que tomaron su nombre del homenaje a Gongora en 1927 en Sevilla: Lorca, Alberti, Cernuda, Guillen, Salinas y otros', 'generacion27', 'lengua', 'bachillerato', '{2}', 1),
-- 59
('H', 'empieza', 'Movimiento poetico de fin del XIX y principios del XX que busca la renovacion formal y tematica del verso en castellano', 'hispanismo', 'lengua', 'bachillerato', '{2}', 3),
-- 60
('I', 'empieza', 'Movimiento teatral del siglo XX en Espana que incorpora elementos absurdos, simbolicos y experimentales alejados del realismo', 'innovacion', 'lengua', 'bachillerato', '{2}', 3),
-- 61
('J', 'contiene', 'Novela social de los anos cincuenta de Sanchez Ferlosio que transcurre junto al rio Henares en una sola jornada', 'jarama', 'lengua', 'bachillerato', '{2}', 1),
-- 62
('L', 'empieza', 'Disciplina que estudia el texto como unidad comunicativa, analizando su estructura, coherencia y cohesion', 'linguistica', 'lengua', 'bachillerato', '{2}', 2),
-- 63
('M', 'empieza', 'Dramaturgo de posguerra autor de Tres sombreros de copa, representante del teatro comico y del humor absurdo', 'mihura', 'lengua', 'bachillerato', '{2}', 2),
-- 64
('N', 'empieza', 'Tipo de novela espanola de los anos cincuenta comprometida con la denuncia de las desigualdades sociales', 'neorrealismo', 'lengua', 'bachillerato', '{2}', 2),
-- 65
('O', 'empieza', 'Mecanismo de cohesion textual que ordena las ideas mediante conectores logicos y marcadores del discurso', 'organizador', 'lengua', 'bachillerato', '{2}', 2),
-- 66
('P', 'empieza', 'Genero literario cultivado en el siglo XVIII con finalidad didactica y moralizante, propio de la Ilustracion espanola', 'prosa', 'lengua', 'bachillerato', '{2}', 2),
-- 67
('R', 'empieza', 'Tipo de registro linguistico empleado en situaciones formales, propio de textos academicos y cientificos', 'registro', 'lengua', 'bachillerato', '{2}', 2),
-- 68
('S', 'empieza', 'Autor de La Regenta, novelista asturiano del Realismo cuyo verdadero nombre era Leopoldo Alas', 'sobrenombre', 'lengua', 'bachillerato', '{2}', 3),
-- 69
('T', 'empieza', 'Tecnica narrativa que alterna diferentes planos temporales rompiendo la cronologia lineal del relato', 'temporal', 'lengua', 'bachillerato', '{2}', 2),
-- 70
('U', 'contiene', 'Genero periodistico breve de opinion en el que un autor habitual del medio expresa su punto de vista sobre la actualidad', 'columna', 'lengua', 'bachillerato', '{2}', 2),
-- 71
('V', 'empieza', 'Corriente de vanguardia espanola que busca reducir la poesia a la imagen y la metafora pura, eliminando la anecdota', 'vanguardia', 'lengua', 'bachillerato', '{2}', 2),
-- 72
('W', 'contiene', 'Escritor irlandes cuya novela Ulises influyo en la narrativa experimental espanola de los anos sesenta', 'joyce', 'lengua', 'bachillerato', '{2}', 3),
-- 73
('X', 'contiene', 'Tipo de escrito periodistico que ofrece una exposicion detallada y documentada sobre un tema de interes publico', 'reportaje', 'lengua', 'bachillerato', '{2}', 2),
-- 74
('Y', 'contiene', 'Ensayo de Ortega y Gasset de 1925 que analiza el arte nuevo como un proceso de deshumanizacion y formalismo', 'ensayo', 'lengua', 'bachillerato', '{2}', 2),
-- 75
('Z', 'contiene', 'Novelista gallego autor de la serie Los gozos y las sombras, representante de la narrativa de posguerra', 'torrente', 'lengua', 'bachillerato', '{2}', 2),

-- =============================================================================
-- FILOSOFIA 1o BACHILLERATO (75 preguntas)
-- Temas: presocraticos, sofistas, Socrates, Platon, Aristoteles,
--         helenismo, filosofia medieval, racionalismo, empirismo,
--         Kant, etica, politica, estetica, logica formal, argumentacion
-- =============================================================================

-- 1
('A', 'empieza', 'Filosofo griego discipulo de Platon, autor de la Etica a Nicomaco y la Politica, sistematizador de la logica formal', 'aristoteles', 'filosofia', 'bachillerato', '{1}', 1),
-- 2
('A', 'empieza', 'Disciplina filosofica que estudia la naturaleza de lo bello, el arte y la experiencia estetica', 'estetica', 'filosofia', 'bachillerato', '{1}', 2),
-- 3
('A', 'empieza', 'Razonamiento que establece una relacion de semejanza entre dos casos para inferir una conclusion probable', 'analogia', 'filosofia', 'bachillerato', '{1}', 2),
-- 4
('B', 'empieza', 'Filosofo empirista irlandes del siglo XVIII que nego la existencia de la materia y afirmo que ser es ser percibido', 'berkeley', 'filosofia', 'bachillerato', '{1}', 2),
-- 5
('B', 'empieza', 'Concepto aristotelico que designa la busqueda del supremo fin de la accion humana, identificado con la felicidad', 'bien', 'filosofia', 'bachillerato', '{1}', 1),
-- 6
('C', 'empieza', 'Actitud filosofica helenistica de rechazo a las convenciones sociales, representada por Diogenes de Sinope', 'cinismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 7
('C', 'empieza', 'Concepto kantiano que designa las formas a priori del entendimiento que organizan la experiencia, como sustancia o causalidad', 'categoria', 'filosofia', 'bachillerato', '{1}', 2),
-- 8
('D', 'empieza', 'Filosofo racionalista frances del siglo XVII autor del Discurso del metodo y las Meditaciones metafisicas', 'descartes', 'filosofia', 'bachillerato', '{1}', 1),
-- 9
('D', 'empieza', 'Metodo filosofico basado en el dialogo y la confrontacion de ideas opuestas para alcanzar la verdad', 'dialectica', 'filosofia', 'bachillerato', '{1}', 1),
-- 10
('D', 'empieza', 'Posicion filosofica que defiende que la realidad se compone de dos sustancias irreductibles, como mente y materia', 'dualismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 11
('D', 'empieza', 'Razonamiento logico que parte de principios generales para llegar a conclusiones particulares necesarias', 'deduccion', 'filosofia', 'bachillerato', '{1}', 1),
-- 12
('E', 'empieza', 'Corriente filosofica moderna que sostiene que todo conocimiento procede de la experiencia sensible', 'empirismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 13
('E', 'empieza', 'Corriente filosofica helenistica fundada por Epicuro que identifica el bien con el placer moderado y la ataraxia', 'epicureismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 14
('E', 'empieza', 'Disciplina filosofica que estudia los principios morales que rigen la conducta humana y la distincion entre el bien y el mal', 'etica', 'filosofia', 'bachillerato', '{1}', 1),
-- 15
('E', 'empieza', 'Teoria del conocimiento que estudia la naturaleza, el origen y los limites del saber humano', 'epistemologia', 'filosofia', 'bachillerato', '{1}', 1),
-- 16
('F', 'empieza', 'Error en el razonamiento que invalida un argumento a pesar de su apariencia logica de validez', 'falacia', 'filosofia', 'bachillerato', '{1}', 1),
-- 17
('F', 'empieza', 'Concepto aristotelico que designa la causa final de los seres naturales, su tendencia hacia un proposito', 'finalismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 18
('G', 'empieza', 'Corriente religiosa y filosofica de los primeros siglos que buscaba la salvacion mediante un conocimiento secreto y revelado', 'gnosis', 'filosofia', 'bachillerato', '{1}', 3),
-- 19
('H', 'empieza', 'Filosofo presocratico de Efeso que afirmo que todo fluye, que la guerra es padre de todas las cosas y que el logos rige el cosmos', 'heraclito', 'filosofia', 'bachillerato', '{1}', 1),
-- 20
('H', 'empieza', 'Periodo de la filosofia griega que abarca desde la muerte de Alejandro Magno hasta el inicio del dominio romano', 'helenismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 21
('H', 'empieza', 'Filosofo empirista escoces que cuestiono la causalidad y afirmo que el conocimiento se basa en impresiones e ideas', 'hume', 'filosofia', 'bachillerato', '{1}', 1),
-- 22
('H', 'empieza', 'Posicion etica que define el placer como el bien supremo y fin ultimo de la vida humana', 'hedonismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 23
('I', 'empieza', 'Teoria del conocimiento que defiende que ciertas ideas son innatas y no proceden de la experiencia', 'innatismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 24
('I', 'empieza', 'Razonamiento logico que parte de casos particulares observados para establecer una conclusion general probable', 'induccion', 'filosofia', 'bachillerato', '{1}', 1),
-- 25
('I', 'empieza', 'Principio moral kantiano que ordena actuar de forma incondicional, sin depender de fines o deseos particulares', 'imperativo', 'filosofia', 'bachillerato', '{1}', 1),
-- 26
('J', 'empieza', 'Concepto central de la filosofia politica que designa la virtud de dar a cada uno lo que le corresponde', 'justicia', 'filosofia', 'bachillerato', '{1}', 1),
-- 27
('K', 'empieza', 'Filosofo aleman del siglo XVIII autor de la Critica de la razon pura que sintetizo racionalismo y empirismo', 'kant', 'filosofia', 'bachillerato', '{1}', 1),
-- 28
('L', 'empieza', 'Filosofo empirista ingles autor del Ensayo sobre el entendimiento humano y defensor del liberalismo politico', 'locke', 'filosofia', 'bachillerato', '{1}', 1),
-- 29
('L', 'empieza', 'Disciplina filosofica que estudia las formas validas de razonamiento y la estructura de los argumentos', 'logica', 'filosofia', 'bachillerato', '{1}', 1),
-- 30
('L', 'empieza', 'Filosofo racionalista aleman creador de la monadologia y del calculo infinitesimal junto con Newton', 'leibniz', 'filosofia', 'bachillerato', '{1}', 2),
-- 31
('M', 'empieza', 'Metodo socratico que consiste en ayudar al interlocutor a alumbrar la verdad por si mismo mediante preguntas sucesivas', 'mayeutica', 'filosofia', 'bachillerato', '{1}', 1),
-- 32
('M', 'empieza', 'Rama de la filosofia que estudia la naturaleza ultima de la realidad, el ser y los primeros principios', 'metafisica', 'filosofia', 'bachillerato', '{1}', 1),
-- 33
('M', 'empieza', 'Doctrina filosofica que defiende la existencia de un solo tipo de sustancia o realidad fundamental', 'monismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 34
('N', 'empieza', 'Concepto kantiano que designa la realidad en si misma, inaccesible al conocimiento humano, opuesto al fenomeno', 'noumeno', 'filosofia', 'bachillerato', '{1}', 2),
-- 35
('Ñ', 'contiene', 'Corriente filosofica helenistica que ensenaba a vivir conforme a la naturaleza y la razon, aceptando el destino con fortaleza', 'estoicismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 36
('O', 'empieza', 'Rama de la filosofia que estudia el ser en cuanto ser, es decir, las categorias fundamentales de la existencia', 'ontologia', 'filosofia', 'bachillerato', '{1}', 2),
-- 37
('P', 'empieza', 'Filosofo griego fundador de la Academia, autor de La Republica y el Banquete, creador de la teoria de las Ideas', 'platon', 'filosofia', 'bachillerato', '{1}', 1),
-- 38
('P', 'empieza', 'Filosofo presocratico que afirmo que la realidad es una, inmovil y eterna, negando la existencia del cambio y el movimiento', 'parmenides', 'filosofia', 'bachillerato', '{1}', 1),
-- 39
('P', 'empieza', 'Doctrina que defiende la existencia de varios principios o realidades fundamentales irreductibles entre si', 'pluralismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 40
('Q', 'contiene', 'Argumento tomista que demuestra la existencia de Dios mediante cinco vias racionales basadas en la experiencia del mundo', 'aquino', 'filosofia', 'bachillerato', '{1}', 2),
-- 41
('R', 'empieza', 'Corriente filosofica moderna que afirma que la razon es la fuente principal del conocimiento, por encima de la experiencia', 'racionalismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 42
('R', 'empieza', 'Concepto platonico que designa el recuerdo del conocimiento que el alma adquirio antes de encarnarse en un cuerpo', 'reminiscencia', 'filosofia', 'bachillerato', '{1}', 2),
-- 43
('R', 'empieza', 'Corriente etica que sostiene que los valores morales dependen del contexto cultural y no son universales ni absolutos', 'relativismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 44
('S', 'empieza', 'Filosofo ateniense condenado a muerte, maestro de Platon, que afirmaba que solo sabia que no sabia nada', 'socrates', 'filosofia', 'bachillerato', '{1}', 1),
-- 45
('S', 'empieza', 'Forma de razonamiento deductivo compuesto por dos premisas y una conclusion, formalizado por Aristoteles', 'silogismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 46
('S', 'empieza', 'Maestros itinerantes de la Grecia clasica que ensenaban retorica a cambio de dinero y relativizaban la verdad', 'sofistas', 'filosofia', 'bachillerato', '{1}', 1),
-- 47
('S', 'empieza', 'Racionalista holandes del XVII autor de la Etica demostrada segun el orden geometrico, defensor del panteismo', 'spinoza', 'filosofia', 'bachillerato', '{1}', 2),
-- 48
('T', 'empieza', 'Filosofo medieval del siglo XIII autor de la Suma Teologica que armonizo la fe cristiana con la filosofia aristotelica', 'tomas', 'filosofia', 'bachillerato', '{1}', 1),
-- 49
('T', 'empieza', 'Presocratico de Mileto considerado el primer filosofo occidental, que propuso el agua como principio originario de todo', 'tales', 'filosofia', 'bachillerato', '{1}', 1),
-- 50
('T', 'empieza', 'Concepto kantiano que designa aquello que es condicion de posibilidad de la experiencia, previo a ella', 'trascendental', 'filosofia', 'bachillerato', '{1}', 2),
-- 51
('U', 'empieza', 'Teoria etica moderna que juzga la bondad de una accion por la cantidad de felicidad que produce para el mayor numero', 'utilitarismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 52
('U', 'empieza', 'Concepto aristotelico referido a lo que se predica de todos los individuos de una clase o especie sin excepcion', 'universal', 'filosofia', 'bachillerato', '{1}', 2),
-- 53
('V', 'empieza', 'Propiedad de un argumento logico cuya conclusion se sigue necesariamente de sus premisas', 'validez', 'filosofia', 'bachillerato', '{1}', 1),
-- 54
('V', 'empieza', 'Disposicion habitual y firme a obrar bien, concepto central de la etica aristotelica de las virtudes', 'virtud', 'filosofia', 'bachillerato', '{1}', 1),
-- 55
('X', 'contiene', 'Doctrina de Parmenides que afirma que solo lo que es puede pensarse, y que el no-ser es impensable e inexistente', 'existir', 'filosofia', 'bachillerato', '{1}', 2),
-- 56
('Y', 'contiene', 'Concepto aristotelico que designa la teoria de la materia y la forma como principios constitutivos de toda sustancia natural', 'hilemorfismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 57
('Z', 'contiene', 'Metodo cartesiano de investigacion que comienza poniendo sistematicamente en duda todos los conocimientos previos', 'razon', 'filosofia', 'bachillerato', '{1}', 2),
-- 58
('A', 'empieza', 'Concepto aristotelico que designa la realizacion plena de las potencialidades de un ser, opuesto a la potencia', 'acto', 'filosofia', 'bachillerato', '{1}', 1),
-- 59
('B', 'empieza', 'Concepto kantiano que designa la intencion de actuar por deber y no por inclinacion, fundamento de la moralidad', 'buenavoluntad', 'filosofia', 'bachillerato', '{1}', 2),
-- 60
('C', 'empieza', 'Tipo de conocimiento que en Descartes se caracteriza por ser claro y distinto, libre de toda duda posible', 'certeza', 'filosofia', 'bachillerato', '{1}', 2),
-- 61
('D', 'empieza', 'Presocratico que junto con Leucipo formulo la teoria de que la realidad se compone de particulas indivisibles en el vacio', 'democrito', 'filosofia', 'bachillerato', '{1}', 1),
-- 62
('E', 'empieza', 'Presocratico siciliano que propuso los cuatro elementos como raices de toda la realidad: tierra, agua, aire y fuego', 'empedocles', 'filosofia', 'bachillerato', '{1}', 2),
-- 63
('F', 'empieza', 'Disciplina que estudia la naturaleza, los metodos y los limites del conocimiento humano en general', 'filosofia', 'filosofia', 'bachillerato', '{1}', 1),
-- 64
('G', 'empieza', 'Rama de la filosofia que se ocupa de la teoria del conocimiento, sus condiciones y posibilidades', 'gnoseologia', 'filosofia', 'bachillerato', '{1}', 3),
-- 65
('I', 'contiene', 'Filosofo griego presocratico que propuso el aire como principio originario y sustancia fundamental de toda la realidad', 'anaximenes', 'filosofia', 'bachillerato', '{1}', 2),
-- 66
('J', 'contiene', 'Sofista griego que declaro que el hombre es la medida de todas las cosas, relativizando verdad y valores morales', 'protagoras', 'filosofia', 'bachillerato', '{1}', 2),
-- 67
('K', 'contiene', 'Posicion filosofica que suspende el juicio sobre la posibilidad de alcanzar un conocimiento verdadero y seguro', 'escepticismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 68
('L', 'empieza', 'Concepto kantiano referido a la norma moral que el sujeto se da a si mismo mediante la razon, base de la autonomia', 'ley', 'filosofia', 'bachillerato', '{1}', 2),
-- 69
('M', 'empieza', 'Concepto platonico de la alegoria de la caverna: los prisioneros confunden las proyecciones con la verdadera realidad', 'mito', 'filosofia', 'bachillerato', '{1}', 2),
-- 70
('N', 'empieza', 'Doctrina medieval que sostiene que los conceptos universales son meros nombres sin realidad propia fuera de la mente', 'nominalismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 71
('O', 'empieza', 'Principio logico-metafisico que afirma la imposibilidad de que un enunciado sea verdadero y falso al mismo tiempo', 'oposicion', 'filosofia', 'bachillerato', '{1}', 3),
-- 72
('P', 'empieza', 'Concepto aristotelico que designa la capacidad de un ser para llegar a ser algo que aun no es', 'potencia', 'filosofia', 'bachillerato', '{1}', 1),
-- 73
('R', 'empieza', 'Arte de persuadir mediante el discurso, ensenada por los sofistas y sistematizada como disciplina por Aristoteles', 'retorica', 'filosofia', 'bachillerato', '{1}', 2),
-- 74
('S', 'empieza', 'Concepto platonico referido al conocimiento mas alto: la contemplacion directa de las Ideas eternas por el alma', 'sabiduria', 'filosofia', 'bachillerato', '{1}', 2),
-- 75
('V', 'contiene', 'Presocratico de Mileto que propuso lo indefinido o ilimitado como principio originario de todas las cosas', 'anaximandro', 'filosofia', 'bachillerato', '{1}', 2),

-- =============================================================================
-- FILOSOFIA 2o BACHILLERATO (75 preguntas)
-- Temas: Platon en profundidad, Aristoteles, Tomas de Aquino, Descartes,
--         Hume, Kant, Marx, Nietzsche, Ortega, Habermas, Rawls,
--         existencialismo
-- =============================================================================

-- 1
('A', 'empieza', 'Concepto platonico que designa el proceso de ascenso del alma desde las sombras hasta la contemplacion de la Idea del Bien', 'alegoria', 'filosofia', 'bachillerato', '{2}', 1),
-- 2
('A', 'empieza', 'Concepto aristotelico que designa la realizacion plena de las potencialidades de un ser, opuesto a la potencia', 'acto', 'filosofia', 'bachillerato', '{2}', 1),
-- 3
('A', 'empieza', 'Concepto humeano que designa la conexion de ideas por semejanza, contiguidad y causa-efecto como base del pensamiento', 'asociacion', 'filosofia', 'bachillerato', '{2}', 2),
-- 4
('B', 'empieza', 'Concepto marxista que designa la estructura economica de la sociedad: fuerzas productivas y relaciones de produccion', 'base', 'filosofia', 'bachillerato', '{2}', 2),
-- 5
('B', 'empieza', 'Clase social propietaria de los medios de produccion en el sistema capitalista segun el analisis marxista', 'burguesia', 'filosofia', 'bachillerato', '{2}', 1),
-- 6
('C', 'empieza', 'Primera verdad indubitable cartesiana que se formula como pienso luego existo, base de todo el sistema racionalista', 'cogito', 'filosofia', 'bachillerato', '{2}', 1),
-- 7
('C', 'empieza', 'Tipo de imperativo kantiano que ordena de forma incondicional, sin depender de ningun fin o deseo particular', 'categorico', 'filosofia', 'bachillerato', '{2}', 1),
-- 8
('C', 'empieza', 'Concepto orteguiano que designa todo lo que rodea al individuo y condiciona su vida: su mundo historico, social y personal', 'circunstancia', 'filosofia', 'bachillerato', '{2}', 1),
-- 9
('C', 'empieza', 'Concepto aristotelico referido a las cuatro explicaciones de por que algo es como es: material, formal, eficiente y final', 'causalidad', 'filosofia', 'bachillerato', '{2}', 2),
-- 10
('D', 'empieza', 'Metodo cartesiano que consiste en poner en cuestion todo conocimiento hasta hallar una verdad absolutamente cierta', 'duda', 'filosofia', 'bachillerato', '{2}', 1),
-- 11
('D', 'empieza', 'Concepto nietzscheano referido a la dimension racional, ordenada y armoniosa de la cultura griega, opuesto a lo dionisiaco', 'dicotomia', 'filosofia', 'bachillerato', '{2}', 3),
-- 12
('E', 'empieza', 'Corriente filosofica del siglo XX que afirma que la existencia precede a la esencia y el ser humano se construye a si mismo', 'existencialismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 13
('E', 'empieza', 'Concepto nietzscheano que designa la vuelta ciclica e infinita de todos los acontecimientos del universo', 'eterno', 'filosofia', 'bachillerato', '{2}', 2),
-- 14
('E', 'empieza', 'Concepto aristotelico que designa la forma sustancial, la naturaleza permanente que define lo que un ser es', 'esencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 15
('E', 'empieza', 'Concepto marxista que designa la separacion del trabajador respecto del producto de su trabajo, de si mismo y de los otros', 'enajenacion', 'filosofia', 'bachillerato', '{2}', 1),
-- 16
('F', 'empieza', 'Concepto kantiano que designa lo que se presenta a la conciencia, mediado por las formas a priori de la sensibilidad y el entendimiento', 'fenomeno', 'filosofia', 'bachillerato', '{2}', 2),
-- 17
('F', 'empieza', 'Concepto aristotelico que designa el principio determinante que da estructura y esencia a la materia', 'forma', 'filosofia', 'bachillerato', '{2}', 1),
-- 18
('F', 'empieza', 'Concepto aristotelico de la felicidad entendida como actividad del alma conforme a la virtud mas perfecta', 'felicidad', 'filosofia', 'bachillerato', '{2}', 1),
-- 19
('G', 'empieza', 'Metodo nietzscheano que investiga el origen historico y psicologico de los valores morales para revelar su funcion de poder', 'genealogia', 'filosofia', 'bachillerato', '{2}', 2),
-- 20
('H', 'empieza', 'Filosofo aleman contemporaneo autor de la Teoria de la accion comunicativa y la etica del discurso', 'habermas', 'filosofia', 'bachillerato', '{2}', 1),
-- 21
('H', 'empieza', 'Concepto humeano que designa la costumbre o la repeticion como base de nuestra creencia en la conexion causal', 'habito', 'filosofia', 'bachillerato', '{2}', 2),
-- 22
('H', 'empieza', 'Teoria aristotelica que explica toda sustancia natural como compuesto inseparable de materia y forma', 'hilemorfismo', 'filosofia', 'bachillerato', '{2}', 2),
-- 23
('I', 'empieza', 'Concepto platonico que designa las realidades eternas, inmutables y perfectas del mundo inteligible', 'idea', 'filosofia', 'bachillerato', '{2}', 1),
-- 24
('I', 'empieza', 'Principio kantiano que ordena actuar segun una maxima universalizable, sin depender de fines particulares', 'imperativo', 'filosofia', 'bachillerato', '{2}', 1),
-- 25
('I', 'empieza', 'Concepto marxista que designa el conjunto de representaciones y valores que la clase dominante impone para legitimar el orden social', 'ideologia', 'filosofia', 'bachillerato', '{2}', 1),
-- 26
('I', 'empieza', 'Concepto humeano que designa las percepciones directas y vividas que recibimos a traves de los sentidos', 'impresion', 'filosofia', 'bachillerato', '{2}', 1),
-- 27
('J', 'empieza', 'Concepto central de la teoria de Rawls que establece los principios de organizacion social tras el velo de la ignorancia', 'justicia', 'filosofia', 'bachillerato', '{2}', 1),
-- 28
('J', 'empieza', 'Enunciado que en Kant conecta un sujeto con un predicado, pudiendo ser analitico, sintetico a posteriori o sintetico a priori', 'juicio', 'filosofia', 'bachillerato', '{2}', 2),
-- 29
('K', 'empieza', 'Filosofo de Konigsberg que distinguio entre fenomeno y noumeno y establecio los limites del conocimiento humano', 'kant', 'filosofia', 'bachillerato', '{2}', 1),
-- 30
('L', 'empieza', 'Concepto marxista que describe el enfrentamiento entre clases sociales como motor fundamental de la historia', 'lucha', 'filosofia', 'bachillerato', '{2}', 1),
-- 31
('L', 'empieza', 'Concepto habermasiano referido al uso del lenguaje orientado al entendimiento mutuo y libre de coaccion', 'lenguaje', 'filosofia', 'bachillerato', '{2}', 2),
-- 32
('M', 'empieza', 'Filosofo aleman del siglo XIX autor de El Capital y del Manifiesto Comunista, creador del materialismo historico', 'marx', 'filosofia', 'bachillerato', '{2}', 1),
-- 33
('M', 'empieza', 'Concepto marxista que interpreta la historia a partir de las condiciones materiales y economicas de produccion', 'materialismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 34
('M', 'empieza', 'Concepto platonico de la participacion o imitacion por la cual las cosas sensibles reflejan las Ideas del mundo inteligible', 'mimesis', 'filosofia', 'bachillerato', '{2}', 2),
-- 35
('M', 'empieza', 'Concepto nietzscheano que designa los valores de los debiles basados en el resentimiento contra los fuertes y nobles', 'moral', 'filosofia', 'bachillerato', '{2}', 2),
-- 36
('N', 'empieza', 'Filosofo aleman del siglo XIX autor de Asi hablo Zaratustra y La genealogia de la moral', 'nietzsche', 'filosofia', 'bachillerato', '{2}', 1),
-- 37
('N', 'empieza', 'Concepto nietzscheano que designa la perdida de todos los valores y sentidos absolutos en la cultura occidental', 'nihilismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 38
('N', 'empieza', 'Concepto kantiano que designa la realidad en si misma, independiente de nuestra percepcion, inaccesible al conocimiento', 'noumeno', 'filosofia', 'bachillerato', '{2}', 2),
-- 39
('Ñ', 'contiene', 'Concepto tomista que designa la ley moral grabada en la naturaleza humana por Dios, accesible a la razon natural', 'ensenanza', 'filosofia', 'bachillerato', '{2}', 2),
-- 40
('O', 'empieza', 'Filosofo espanol del siglo XX autor de La rebelion de las masas y defensor del raciovitalismo y el perspectivismo', 'ortega', 'filosofia', 'bachillerato', '{2}', 1),
-- 41
('O', 'empieza', 'Concepto aristotelico que designa la sustancia primera, el ser individual y concreto que subyace a los accidentes', 'ousia', 'filosofia', 'bachillerato', '{2}', 3),
-- 42
('P', 'empieza', 'Concepto aristotelico que designa la capacidad de un ser para llegar a ser algo que todavia no es, opuesto al acto', 'potencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 43
('P', 'empieza', 'Clase trabajadora desposeida de los medios de produccion segun el analisis marxista de la sociedad capitalista', 'proletariado', 'filosofia', 'bachillerato', '{2}', 1),
-- 44
('P', 'empieza', 'Concepto orteguiano que designa la vision individual del mundo, siempre parcial y complementaria con la de otros', 'perspectiva', 'filosofia', 'bachillerato', '{2}', 1),
-- 45
('P', 'empieza', 'Concepto marxista que designa el excedente de valor que el trabajador produce y que se apropia el capitalista', 'plusvalia', 'filosofia', 'bachillerato', '{2}', 1),
-- 46
('Q', 'contiene', 'Concepto tomista que designa las cinco demostraciones racionales de la existencia de Dios a partir del mundo sensible', 'aquino', 'filosofia', 'bachillerato', '{2}', 2),
-- 47
('R', 'empieza', 'Concepto orteguiano que designa su filosofia como sintesis de razon y vida frente al racionalismo abstracto', 'raciovitalismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 48
('R', 'empieza', 'Filosofo estadounidense autor de Teoria de la justicia, creador del concepto de posicion original y velo de la ignorancia', 'rawls', 'filosofia', 'bachillerato', '{2}', 1),
-- 49
('R', 'empieza', 'Concepto platonico por el cual el alma recupera el conocimiento de las Ideas que contemplo antes de nacer', 'reminiscencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 50
('S', 'empieza', 'Concepto nietzscheano que designa al ser humano que supera los valores de la moral tradicional y crea los suyos propios', 'superhombre', 'filosofia', 'bachillerato', '{2}', 1),
-- 51
('S', 'empieza', 'Concepto aristotelico que designa la realidad individual compuesta de materia y forma, sujeto de propiedades', 'sustancia', 'filosofia', 'bachillerato', '{2}', 1),
-- 52
('S', 'empieza', 'Filosofo existencialista frances autor de El ser y la nada, defensor de la libertad radical y la responsabilidad del individuo', 'sartre', 'filosofia', 'bachillerato', '{2}', 1),
-- 53
('S', 'empieza', 'Tipo de juicio kantiano que amplia el conocimiento y a la vez es universal y necesario, como los de la matematica y la fisica', 'sintetico', 'filosofia', 'bachillerato', '{2}', 2),
-- 54
('T', 'empieza', 'Filosofo medieval del XIII que armonizo la filosofia aristotelica con la teologia cristiana en su Suma Teologica', 'tomas', 'filosofia', 'bachillerato', '{2}', 1),
-- 55
('T', 'empieza', 'Concepto kantiano referido a las condiciones que hacen posible la experiencia y el conocimiento objetivo', 'trascendental', 'filosofia', 'bachillerato', '{2}', 2),
-- 56
('U', 'contiene', 'Concepto platonico que divide el alma en tres partes: racional, irascible y concupiscible, cada una con su propia virtud', 'estructura', 'filosofia', 'bachillerato', '{2}', 2),
-- 57
('V', 'empieza', 'Concepto rawlsiano que designa la cortina hipotetica tras la cual se desconoce la posicion social al elegir principios de justicia', 'velo', 'filosofia', 'bachillerato', '{2}', 1),
-- 58
('V', 'empieza', 'Concepto nietzscheano que designa el impulso fundamental de todo ser vivo hacia la autoafirmacion y la expansion', 'voluntad', 'filosofia', 'bachillerato', '{2}', 1),
-- 59
('V', 'empieza', 'Concepto orteguiano que designa la razon enraizada en la vida concreta del individuo, no abstracta ni pura', 'vital', 'filosofia', 'bachillerato', '{2}', 2),
-- 60
('W', 'contiene', 'Concepto marxista por el cual el obrero pierde el control sobre su actividad productiva y su producto en el sistema capitalista', 'enajenamiento', 'filosofia', 'bachillerato', '{2}', 2),
-- 61
('X', 'contiene', 'Concepto sartreano que designa la relacion del ser humano con su propia libertad y con el mundo que lo rodea', 'existencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 62
('Y', 'contiene', 'Frase orteguiana que expresa que el sujeto no puede entenderse aislado de su entorno vital e historico', 'yomicircunstancia', 'filosofia', 'bachillerato', '{2}', 2),
-- 63
('Z', 'contiene', 'Obra central de Nietzsche donde expone el superhombre, la voluntad de poder y el eterno retorno', 'zaratustra', 'filosofia', 'bachillerato', '{2}', 1),
-- 64
('A', 'empieza', 'Concepto habermasiano que designa la comunicacion orientada al acuerdo racional libre de dominacion y coaccion', 'accion', 'filosofia', 'bachillerato', '{2}', 2),
-- 65
('B', 'empieza', 'Concepto tomista que designa la felicidad suprema como contemplacion de Dios, fin ultimo del ser humano', 'beatitud', 'filosofia', 'bachillerato', '{2}', 2),
-- 66
('C', 'empieza', 'Concepto marxista referido al sistema economico basado en la propiedad privada de los medios de produccion y la explotacion del trabajo', 'capitalismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 67
('D', 'empieza', 'Concepto cartesiano referido al recurso argumentativo de suponer un ser enganador todopoderoso para llevar la duda al extremo', 'demonio', 'filosofia', 'bachillerato', '{2}', 2),
-- 68
('E', 'empieza', 'Concepto habermasiano que designa la moral basada en el dialogo racional entre todos los afectados por una norma', 'etica', 'filosofia', 'bachillerato', '{2}', 2),
-- 69
('F', 'empieza', 'Concepto nietzscheano referido al espiritu libre que no acepta valores impuestos y crea su propia tabla valorativa', 'filosofo', 'filosofia', 'bachillerato', '{2}', 3),
-- 70
('G', 'empieza', 'Concepto aristotelico de la ley natural que Tomas de Aquino retomo como fundamento de la ley moral y politica', 'gracia', 'filosofia', 'bachillerato', '{2}', 3),
-- 71
('H', 'empieza', 'Concepto marxista que interpreta la historia como un proceso dialectico de luchas entre clases sociales opuestas', 'historicismo', 'filosofia', 'bachillerato', '{2}', 3),
-- 72
('L', 'empieza', 'Concepto rawlsiano que establece que las desigualdades sociales solo se justifican si benefician a los mas desfavorecidos', 'liberalismo', 'filosofia', 'bachillerato', '{2}', 2),
-- 73
('N', 'contiene', 'Concepto tomista que designa la participacion de la criatura racional en la ley eterna divina, accesible por la razon', 'natural', 'filosofia', 'bachillerato', '{2}', 1),
-- 74
('O', 'empieza', 'Concepto orteguiano que afirma que la vida humana es la realidad radical desde la cual todo lo demas cobra sentido', 'ontologia', 'filosofia', 'bachillerato', '{2}', 3),
-- 75
('P', 'empieza', 'Concepto platonico referido a la relacion por la que las cosas sensibles reciben su ser y su inteligibilidad de las Ideas', 'participacion', 'filosofia', 'bachillerato', '{2}', 2);
