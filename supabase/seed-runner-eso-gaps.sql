-- =====================================================================
-- Seed Runner ESO Gaps - Programacion y Robotica
-- Genera 23 categorias (230 palabras) para completar los huecos de:
--   - ESO Programacion 2o (4 categorias)
--   - ESO Programacion 3o (4 categorias)
--   - ESO Robotica 2o (5 categorias)
--   - ESO Robotica 3o (5 categorias)
--   - ESO Robotica 4o (5 categorias)
-- Palabras en minusculas, sin acentos, sin espacios.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ESO PROGRAMACION 2o (faltan 4)
-- ---------------------------------------------------------------------

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{2}', 'Operadores Aritmeticos y Logicos', '["suma","resta","multiplicacion","division","modulo","potencia","igual","distinto","mayor","menor"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{2}', 'Extensiones de Archivo', '["doc","xls","ppt","txt","mp3","jpg","gif","html","css","exe"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{2}', 'Tipos Primitivos de Datos', '["entero","decimal","cadena","booleano","caracter","flotante","doble","nulo","texto","byte"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{2}', 'Comandos Git', '["commit","push","pull","clone","branch","merge","init","status","fetch","checkout"]');

-- ---------------------------------------------------------------------
-- ESO PROGRAMACION 3o (faltan 4)
-- ---------------------------------------------------------------------

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{3}', 'Palabras Reservadas Python', '["def","return","import","lambda","yield","global","pass","raise","elif","none"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{3}', 'Metodos de Cadenas', '["upper","lower","split","strip","replace","join","find","count","startswith","endswith"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{3}', 'Excepciones Comunes', '["typeerror","valueerror","keyerror","indexerror","nameerror","zerodivision","attributeerror","ioerror","syntaxerror","importerror"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'eso', '{3}', 'Librerias Estandar Python', '["math","random","datetime","sys","collections","itertools","pickle","sqlite","socket","hashlib"]');

-- ---------------------------------------------------------------------
-- ESO ROBOTICA 2o (faltan 5)
-- ---------------------------------------------------------------------

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{2}', 'herramientas_taller', '["martillo","destornillador","alicates","tenaza","lima","sierra","taladro","llave","pelacables","cutter"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{2}', 'unidades_electricas', '["voltio","amperio","ohmio","vatio","faradio","hercio","culombio","julio","henrio","siemens"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{2}', 'robots_ficcion', '["terminator","bender","bumblebee","optimus","eva","chappie","sonny","marvin","baymax","robocop"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{2}', 'elementos_fijacion', '["tornillo","tuerca","arandela","perno","remache","clavo","chincheta","abrazadera","brida","grapa"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{2}', 'soldadura_estano', '["estano","flux","cautin","plomo","pasta","alambre","punta","esponja","desoldador","resina"]');

-- ---------------------------------------------------------------------
-- ESO ROBOTICA 3o (faltan 5)
-- ---------------------------------------------------------------------

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{3}', 'materiales_impresion_3d', '["pla","abs","petg","tpu","nylon","pva","hips","asa","policarbonato","flexible"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{3}', 'tipos_motores_electricos', '["paso","brushless","lineal","vibrador","sincrono","asincrono","inductor","coreless","piezoelectrico","universal"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{3}', 'placas_desarrollo', '["esp8266","stm32","microbit","teensy","nodemcu","beaglebone","orangepi","jetson","particle","feather"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{3}', 'transmision_mecanica', '["polea","correa","cadena","pinon","cremallera","leva","biela","embrague","husillo","rodamiento"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{3}', 'baterias_alimentacion', '["lipo","lifepo","niquel","alcalina","boton","recargable","cargador","regulador","convertidor","pila"]');

-- ---------------------------------------------------------------------
-- ESO ROBOTICA 4o (faltan 5)
-- ---------------------------------------------------------------------

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{4}', 'robots_industriales', '["kuka","fanuc","abb","yaskawa","epson","motoman","staubli","kawasaki","denso","omron"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{4}', 'drones_uav', '["cuadricoptero","hexacoptero","octocoptero","dron","helice","fpv","gimbal","multirotor","despegue","aterrizaje"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{4}', 'exploracion_espacial', '["rover","curiosity","perseverance","spirit","opportunity","sojourner","zhurong","yutu","voyager","viking"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{4}', 'lenguajes_entornos_robotica', '["labview","matlab","simulink","gazebo","rviz","moveit","slam","urdf","catkin","webots"]');

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('robotica', 'eso', '{4}', 'biomateriales_biomecanica', '["protesis","ortesis","exoesqueleto","implante","biopolimero","colageno","quitina","hidrogel","biosensor","tejido"]');
