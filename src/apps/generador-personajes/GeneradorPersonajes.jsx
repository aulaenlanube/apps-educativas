import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './GeneradorPersonajes.css';

const GeneradorPersonajes = () => {
  const { level, grade } = useParams();
  const [personajes, setPersonajes] = useState([]);
  const [sexo, setSexo] = useState('Cualquiera');
  const [categoria, setCategoria] = useState('Cualquiera');
  const [aleatorioTotal, setAleatorioTotal] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [ultimoNombre, setUltimoNombre] = useState('');

  // New state for the assigner feature
  const [isAssignerVisible, setIsAssignerVisible] = useState(false);
  const [studentList, setStudentList] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const ruta = `${import.meta.env.BASE_URL}data/${level}/${grade}/generador-personajes.json`;
    fetch(ruta, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`No se pudo cargar ${ruta} (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('El JSON no es un array');
        setPersonajes(data);
        const uniqueCategorias = [...new Set(data.map(p => p.categoria))];
        setCategorias(uniqueCategorias);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [level, grade]);

  const seleccionarAleatorioTotal = () => {
    if (personajes.length === 0) return null;
    let candidato = null;
    let intentos = 0;
    do {
      candidato = personajes[Math.floor(Math.random() * personajes.length)];
      intentos++;
    } while (candidato && candidato.nombre === ultimoNombre && intentos < 10);
    return candidato;
  };

  const seleccionarConFiltros = (sexoFiltro, categoriaFiltro) => {
    const candidatos = personajes.filter((p) => {
      const coincideSexo = sexoFiltro === 'Cualquiera' ? true : p.sexo === sexoFiltro;
      const coincideCat = categoriaFiltro === 'Cualquiera' ? true : p.categoria === categoriaFiltro;
      return coincideSexo && coincideCat;
    });
    if (candidatos.length === 0) return null;
    let candidato = null;
    let intentos = 0;
    do {
      candidato = candidatos[Math.floor(Math.random() * candidatos.length)];
      intentos++;
    } while (candidato && candidato.nombre === ultimoNombre && intentos < 10);
    return candidato;
  };

  const handleObtener = async () => {
    if (personajes.length === 0) return;
    let personaje = null;
    if (aleatorioTotal) {
      personaje = seleccionarAleatorioTotal();
    } else {
      personaje = seleccionarConFiltros(sexo, categoria);
    }
    if (!personaje) {
      setResultado(null);
      setMensaje('sin');
      return;
    }
    setMensaje(null);
    setResultado(personaje);
    setUltimoNombre(personaje.nombre);
  };

  const handleAssignCharacters = () => {
    if (personajes.length === 0 || !studentList.trim()) return;

    const students = studentList.trim().split('\n').filter(name => name.trim() !== '');
    if (students.length === 0) return;

    // Shuffle characters array (Fisher-Yates shuffle)
    const shuffledPersonajes = [...personajes];
    for (let i = shuffledPersonajes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPersonajes[i], shuffledPersonajes[j]] = [shuffledPersonajes[j], shuffledPersonajes[i]];
    }

    const newAssignments = students.map((student, index) => ({
      student: student.trim(),
      character: shuffledPersonajes[index % shuffledPersonajes.length]
    }));

    setAssignments(newAssignments);
  };

  const handleExportToCSV = () => {
    if (assignments.length === 0) return;

    const csvHeader = 'Alumno;Personaje;Sexo;Categoría\n';
    const csvRows = assignments.map(item => 
      `${item.student};${item.character.nombre};${item.character.sexo};${item.character.categoria}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'asignacion_personajes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderResultado = () => {
    if (error) {
      return (
        <div className="gp-tarjeta">
          <div className="gp-titulo" style={{ color: 'var(--gp-warning)' }}>Error al cargar datos</div>
          <div className="gp-detalle">{error}</div>
        </div>
      );
    }
    if (mensaje === 'sin') {
      return (
        <div className="gp-tarjeta">
          <div className="gp-titulo" style={{ color: 'var(--gp-warning)' }}>Sin coincidencias</div>
          <div className="gp-detalle">Prueba a cambiar el sexo o la categoría</div>
        </div>
      );
    }
    if (resultado) {
      return (
        <div className="gp-tarjeta">
          <div>
            <div className="gp-titulo">{resultado.nombre}</div>
            <div className="gp-detalle">{resultado.sexo} · {resultado.categoria}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="gp-tarjeta">
        <div className="gp-titulo">Pulsa el botón para empezar</div>
        <div className="gp-detalle">Puedes usar «Aleatorio total» o filtrar por sexo y categoría</div>
      </div>
    );
  };

  return (
    <div className="gp-contenedor">
      <div className="gp-content">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span role="img" aria-label="Personas">✨</span> 
          <span className="gradient-text">Generador de personajes</span>
        </h1>
        
        <section className="gp-controles">
          <div className="gp-fila">
            <input
              type="checkbox"
              id="gp-aleatorio-total"
              checked={aleatorioTotal}
              onChange={(e) => setAleatorioTotal(e.target.checked)}
            />
            <label htmlFor="gp-aleatorio-total">Aleatorio total</label>
          </div>
          <div className="gp-fila">
            <label htmlFor="gp-select-sexo">Sexo</label>
            <select
              id="gp-select-sexo"
              className="gp-select"
              value={sexo}
              disabled={aleatorioTotal}
              onChange={(e) => setSexo(e.target.value)}
            >
              <option value="Cualquiera">Cualquiera</option>
              <option value="Mujer">Mujer</option>
              <option value="Hombre">Hombre</option>
            </select>
          </div>
          <div className="gp-fila">
            <label htmlFor="gp-select-categoria">Categoría</label>
            <select
              id="gp-select-categoria"
              className="gp-select"
              value={categoria}
              disabled={aleatorioTotal}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Cualquiera">Cualquiera</option>
              {categorias.map((cat) => (
                <option value={cat} key={cat}>
                  {cat}
                </option>
              ))}}
            </select>
          </div>
          <button className="gp-boton-primario" onClick={handleObtener}>
            Obtener personaje
          </button>
        </section>
        <section className="gp-resultado" aria-live="polite">
          {renderResultado()}
        </section>

        <div className="w-full mt-8">
          <button 
            className="gp-boton-primario w-full" 
            onClick={() => setIsAssignerVisible(!isAssignerVisible)}
          >
            {isAssignerVisible ? 'Ocultar Asignador por Alumno' : 'Mostrar Asignador por Alumno'}
          </button>
        </div>

        {isAssignerVisible && (
          <section className="gp-controles mt-8 w-full">
            <h2 className="text-2xl font-bold mb-4 text-center col-span-full">Asignar Personajes a Alumnos</h2>
            <div className="col-span-full">
              <label htmlFor="student-list" className="block text-sm font-medium text-gray-700 mb-2">Lista de Alumnos (uno por línea)</label>
              <textarea
                id="student-list"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows="10"
                value={studentList}
                onChange={(e) => setStudentList(e.target.value)}
                placeholder="Pega aquí la lista de alumnos, uno por cada línea..."
              />
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4" role="alert">
                <p className="font-bold">Información de Privacidad</p>
                <p>ℹ️ Puedes incluir los nombres reales de tus alumnos sin miedo a la protección de datos. La lista de alumnos no se almacena en ningún servidor. El proceso se realiza localmente en tu navegador.</p>
              </div>
            </div>
            <div className="col-span-full flex justify-center gap-4">
              <button className="gp-boton-primario" onClick={handleAssignCharacters}>
                Asignar Personajes
              </button>
              <button 
                className="gp-boton-primario"
                onClick={handleExportToCSV} 
                disabled={assignments.length === 0}
              >
                Exportar a CSV
              </button>
            </div>

            {assignments.length > 0 && (
              <div className="col-span-full mt-6">
                <h3 className="text-xl font-bold mb-4">Asignaciones</h3>
                <ul className="divide-y divide-gray-200">
                  {assignments.map((item, index) => (
                    <li key={index} className="py-4 flex">
                      <p className="font-medium text-gray-900">{item.student}</p>
                      <p className="ml-auto text-gray-500">{item.character.nombre}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default GeneradorPersonajes;