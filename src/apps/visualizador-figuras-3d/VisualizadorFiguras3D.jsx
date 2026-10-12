// Laboratorio de Figuras 3D — rediseño 2026 del "chrome" sobre el kit de
// interfaz (_shared/kit, tema noche): panel de figuras, medidas, fórmulas y
// apariencia, y marcador sobre el lienzo. La escena r3f (luces, materiales,
// geometría, controles) no cambia.
import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, ContactShadows, Float } from '@react-three/drei';
import {
  Box, Rotate3D, Palette, Calculator, Ruler, ChevronDown, X, PanelLeftOpen, PanelLeftClose,
  Grid3x3, Pause, Play, Sigma,
} from 'lucide-react';
import { GameShell, GameHeader, Hud, HudStat, Panel, GameButton } from '../_shared/kit';
import './VisualizadorFiguras3D.css';

// --- CONFIGURACIÓN DE MATERIALES ---
const PRESETS_MATERIAL = {
  plastico: { nombre: 'Plástico', settings: { metalness: 0.1, roughness: 0.5, clearcoat: 0 } },
  metal: { nombre: 'Metal', settings: { metalness: 0.7, roughness: 0.2, clearcoat: 1, color: '#aaaaff' } },
  ceramica: { nombre: 'Cerámica', settings: { metalness: 0.0, roughness: 0.2, clearcoat: 1 } },
  cristal: { nombre: 'Cristal', settings: { metalness: 0.1, roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.5 } }
};

// --- DATOS MATEMÁTICOS ---
const DATOS_FIGURAS = {
  cubo: {
    nombre: 'Cubo', tipo: 'tamano',
    formulaVolumen: 'V = a³', formulaArea: 'A = 6a²',
    calc: (d) => ({ v: Math.pow(d.tamano, 3), a: 6 * Math.pow(d.tamano, 2) }),
    info: 'Hexaedro regular limitado por 6 cuadrados iguales.'
  },
  esfera: {
    nombre: 'Esfera', tipo: 'radio',
    formulaVolumen: 'V = ⁴/₃πr³', formulaArea: 'A = 4πr²',
    calc: (d) => ({ v: (4/3) * Math.PI * Math.pow(d.radio, 3), a: 4 * Math.PI * Math.pow(d.radio, 2) }),
    info: 'Superficie curva equidistante del centro.'
  },
  cilindro: {
    nombre: 'Cilindro', tipo: 'radio-altura',
    formulaVolumen: 'V = πr²h', formulaArea: 'A = 2πr(r + h)',
    calc: (d) => ({ v: Math.PI * Math.pow(d.radio, 2) * d.altura, a: 2 * Math.PI * d.radio * (d.radio + d.altura) }),
    info: 'Cuerpo redondo de bases circulares.'
  },
  cono: {
    nombre: 'Cono', tipo: 'radio-altura',
    formulaVolumen: 'V = ¹/₃πr²h', formulaArea: 'A = πr(r + g)',
    calc: (d) => {
        const g = Math.sqrt(d.radio*d.radio + d.altura*d.altura);
        return { v: (1/3) * Math.PI * Math.pow(d.radio, 2) * d.altura, a: Math.PI * d.radio * (d.radio + g) };
    },
    info: 'Sólido de revolución triangular.'
  },
  tetraedro: {
    nombre: 'Tetraedro', tipo: 'tamano',
    formulaVolumen: 'V = (√2/12)a³', formulaArea: 'A = √3a²',
    calc: (d) => ({ v: (Math.sqrt(2)/12) * Math.pow(d.tamano, 3), a: Math.sqrt(3) * Math.pow(d.tamano, 2) }),
    info: '4 caras triangulares equiláteras.'
  },
  octaedro: {
    nombre: 'Octaedro', tipo: 'tamano',
    formulaVolumen: 'V = (√2/3)a³', formulaArea: 'A = 2√3a²',
    calc: (d) => ({ v: (Math.sqrt(2)/3) * Math.pow(d.tamano, 3), a: 2 * Math.sqrt(3) * Math.pow(d.tamano, 2) }),
    info: '8 caras triangulares equiláteras.'
  },
  dodecaedro: {
    nombre: 'Dodecaedro', tipo: 'tamano',
    formulaVolumen: 'V ≈ 7.66a³', formulaArea: 'A ≈ 20.64a²',
    calc: (d) => ({
        v: ((15 + 7 * Math.sqrt(5)) / 4) * Math.pow(d.tamano, 3),
        a: 3 * Math.sqrt(25 + 10 * Math.sqrt(5)) * Math.pow(d.tamano, 2)
    }),
    info: '12 caras pentagonales.'
  },
  icosaedro: {
    nombre: 'Icosaedro', tipo: 'tamano',
    formulaVolumen: 'V ≈ 2.18a³', formulaArea: 'A = 5√3a²',
    calc: (d) => ({
        v: (5 * (3 + Math.sqrt(5)) / 12) * Math.pow(d.tamano, 3),
        a: 5 * Math.sqrt(3) * Math.pow(d.tamano, 2)
    }),
    info: '20 caras triangulares.'
  },
  'prisma-tri': {
    nombre: 'Prisma Tri.', tipo: 'tamano-altura',
    formulaVolumen: 'V = (√3/4)l²h', formulaArea: 'A = 3lh + 2Ab',
    calc: (d) => {
        const areaBase = (Math.sqrt(3)/4) * Math.pow(d.tamano, 2);
        return { v: areaBase * d.altura, a: (3 * d.tamano * d.altura) + (2 * areaBase) };
    },
    info: 'Prisma de base triangular.'
  },
  'prisma-hex': {
    nombre: 'Prisma Hex.', tipo: 'tamano-altura',
    formulaVolumen: 'V = (3√3/2)l²h', formulaArea: 'A = 6lh + 2Ab',
    calc: (d) => {
        const areaBase = (3 * Math.sqrt(3) / 2) * Math.pow(d.tamano, 2);
        return { v: areaBase * d.altura, a: (6 * d.tamano * d.altura) + (2 * areaBase) };
    },
    info: 'Prisma de base hexagonal.'
  },
  piramide: {
    nombre: 'Pirámide', tipo: 'tamano-altura',
    formulaVolumen: 'V = ¹/₃l²h', formulaArea: 'A = l(l + 2ap)',
    calc: (d) => {
        const l = d.tamano;
        const h = d.altura;
        const ap = Math.sqrt(Math.pow(l/2, 2) + Math.pow(h, 2));
        return { v: (1/3) * l * l * h, a: l * (l + 2 * ap) };
    },
    info: 'Base cuadrada y caras triangulares.'
  },
  toro: {
    nombre: 'Toro', tipo: 'radio-tubo',
    formulaVolumen: 'V = 2π²Rr²', formulaArea: 'A = 4π²Rr',
    calc: (d) => ({ v: 2 * Math.pow(Math.PI, 2) * d.radio * Math.pow(d.tubo, 2), a: 4 * Math.pow(Math.PI, 2) * d.radio * d.tubo }),
    info: 'Forma de rosquilla.'
  }
};

// Solo presentación: silueta de cada cuerpo (caras con tres intensidades de luz)
const SOLID_GLYPHS = {
  cubo: [['M12 3 L20 7.5 L12 12 L4 7.5 Z', 1], ['M4 7.5 L12 12 L12 21 L4 16.5 Z', .55], ['M20 7.5 L12 12 L12 21 L20 16.5 Z', .8]],
  esfera: [['M12 3 A9 9 0 1 1 11.99 3 Z', .7], ['M8 6 A5 4 0 0 1 14 5 A6 6 0 0 0 7 11 Z', 1], ['M3 12 A9 3 0 0 0 21 12', 0]],
  cilindro: [['M4 6 L4 18 A8 3 0 0 0 20 18 L20 6 Z', .7], ['M4 6 A8 3 0 1 0 20 6 A8 3 0 1 0 4 6 Z', 1]],
  cono: [['M12 3 L20 18 A8 3 0 0 1 4 18 Z', .7], ['M12 3 L12 21 A8 3 0 0 1 4 18 Z', .9]],
  tetraedro: [['M12 3 L21 19 L12 21 Z', .6], ['M12 3 L12 21 L3 19 Z', .95]],
  octaedro: [['M12 2 L20 12 L12 15 Z', .8], ['M12 2 L12 15 L4 12 Z', 1], ['M4 12 L12 15 L12 22 Z', .55], ['M20 12 L12 15 L12 22 Z', .4]],
  dodecaedro: [['M12 2.5 L21 9 L17.6 20 L6.4 20 L3 9 Z', .6], ['M12 7 L16.3 10.2 L14.6 15.3 L9.4 15.3 L7.7 10.2 Z', 1]],
  icosaedro: [['M12 2 L20.5 7 L20.5 17 L12 22 L3.5 17 L3.5 7 Z', .55], ['M12 2 L20.5 7 L12 9 L3.5 7 Z', .9], ['M3.5 7 L12 9 L7.5 17 Z', 1], ['M20.5 7 L12 9 L16.5 17 Z', .75], ['M7.5 17 L16.5 17 L12 9 Z', .85]],
  'prisma-tri': [['M4 8 L12 4 L20 8 L12 10 Z', 1], ['M4 8 L12 10 L12 21 L4 18 Z', .6], ['M20 8 L12 10 L12 21 L20 18 Z', .82]],
  'prisma-hex': [['M5 7 L9 4.5 L15 4.5 L19 7 L15 9.5 L9 9.5 Z', 1], ['M5 7 L9 9.5 L9 20 L5 17.5 Z', .5], ['M9 9.5 L15 9.5 L15 20 L9 20 Z', .7], ['M15 9.5 L19 7 L19 17.5 L15 20 Z', .85]],
  piramide: [['M12 3 L21 16 L12 20 Z', .8], ['M12 3 L12 20 L3 16 Z', .55]],
  toro: [['M12 6 C19 6 22 9.5 22 12.5 C22 16 18 18.5 12 18.5 C6 18.5 2 16 2 12.5 C2 9.5 5 6 12 6 Z M12 10.5 C9 10.5 8 11.6 8 12.5 C8 13.6 9.4 14.4 12 14.4 C14.6 14.4 16 13.6 16 12.5 C16 11.6 15 10.5 12 10.5 Z', .8], ['M4 10 C6 7.5 9 6.6 12 6.6 C15 6.6 18 7.5 20 10 C17 8.6 7 8.6 4 10 Z', 1]],
};
const SolidGlyph = ({ id }) => (
  <svg viewBox="0 0 24 24" className="vf3-glyph" aria-hidden="true">
    {(SOLID_GLYPHS[id] || []).map(([d, o], i) => (
      o === 0
        ? <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />
        : <path key={i} d={d} fill="currentColor" fillOpacity={o} fillRule="evenodd" />
    ))}
  </svg>
);

// --- COMPONENTE ACORDEÓN ---
const SeccionDesplegable = ({ titulo, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <Panel variant="surface" className={`vf3-section ${isOpen ? 'is-open' : ''}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="vf3-section__head"
                aria-expanded={isOpen}
            >
                {Icon && <span className="vf3-section__icon" aria-hidden="true"><Icon size={17} /></span>}
                <span className="vf3-section__title">{titulo}</span>
                <ChevronDown size={18} className="vf3-section__chev" />
            </button>
            {isOpen && <div className="vf3-section__body">{children}</div>}
        </Panel>
    );
};

// Deslizador de medida (mismos rangos y pasos de siempre)
const DimSlider = ({ label, value, min, max, step, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="vf3-dim">
      <div className="vf3-dim__head">
        <span className="vf3-dim__label">{label}</span>
        <span key={value} className="vf3-dim__value">{value}m</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={onChange}
        className="vf3-range"
        style={{ '--p': `${pct}%` }}
        aria-label={label}
      />
    </div>
  );
};

// --- COMPONENTE 3D ---
const FiguraDinamica = ({ tipo, dims, autoRotar, wireframe, color, materialSettings }) => {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (autoRotar && meshRef.current) meshRef.current.rotation.y += delta * 0.5;
  });

  const material = <meshPhysicalMaterial color={color} wireframe={wireframe} {...materialSettings} />;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} castShadow receiveShadow>
            {tipo === 'cubo' && <boxGeometry args={[dims.tamano, dims.tamano, dims.tamano]} />}
            {tipo === 'esfera' && <sphereGeometry args={[dims.radio, 64, 64]} />}
            {tipo === 'cilindro' && <cylinderGeometry args={[dims.radio, dims.radio, dims.altura, 32]} />}
            {tipo === 'cono' && <coneGeometry args={[dims.radio, dims.altura, 32]} />}
            {tipo === 'tetraedro' && <tetrahedronGeometry args={[dims.tamano * 0.8, 0]} />}
            {tipo === 'octaedro' && <octahedronGeometry args={[dims.tamano * 0.8, 0]} />}
            {tipo === 'dodecaedro' && <dodecahedronGeometry args={[dims.tamano * 1.2, 0]} />}
            {tipo === 'icosaedro' && <icosahedronGeometry args={[dims.tamano, 0]} />}
            {tipo === 'prisma-tri' && <cylinderGeometry args={[dims.tamano / 1.7, dims.tamano / 1.7, dims.altura, 3]} />}
            {tipo === 'prisma-hex' && <cylinderGeometry args={[dims.tamano, dims.tamano, dims.altura, 6]} />}
            {tipo === 'piramide' && <cylinderGeometry args={[0, dims.tamano / 1.4, dims.altura, 4]} />}
            {tipo === 'toro' && <torusGeometry args={[dims.radio, dims.tubo, 32, 100]} />}
            {material}
        </mesh>
    </Float>
  );
};

// --- COMPONENTE PRINCIPAL ---
const VisualizadorFiguras3D = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estados App
  const [figuraActual, setFiguraActual] = useState('cubo');
  const [dimensiones, setDimensiones] = useState({ tamano: 2, radio: 1, altura: 2, tubo: 0.4 });
  const [autoRotar, setAutoRotar] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [tipoMaterial, setTipoMaterial] = useState('plastico');
  const [colorFigura, setColorFigura] = useState('#6366f1');
  const [colorFondo, setColorFondo] = useState('#1e293b');

  const datos = DATOS_FIGURAS[figuraActual];
  const materialActual = PRESETS_MATERIAL[tipoMaterial].settings;
  const resultados = useMemo(() => datos.calc(dimensiones), [datos, dimensiones]);

  const updateDim = (key, value) => {
    setDimensiones(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  return (
    <GameShell theme="dark" wide accent="#6366f1" accent2="#22d3ee" className="vf3">
      <GameHeader
        right={(
          <Hud>
            <HudStat icon={Box} tone="accent" value={datos.nombre} label="Figura" />
            <HudStat icon={Sigma} tone="time" value={`${resultados.v.toFixed(2)} m³`} label="Volumen" />
            <GameButton
              variant="soft"
              size="sm"
              icon={sidebarOpen ? PanelLeftClose : PanelLeftOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="vf3-toggle"
            >
              {sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
            </GameButton>
          </Hud>
        )}
      />

      <div className={`vf3-layout ${sidebarOpen ? 'is-open' : 'is-closed'}`}>
        {/* 1. PANEL LATERAL */}
        {/* Se mantiene montado al ocultarlo para conservar las secciones abiertas */}
          <aside className="vf3-side" aria-hidden={!sidebarOpen}>
            <div className="vf3-side__mobilehead">
              <span>Laboratorio 3D</span>
              <GameButton variant="soft" size="sm" icon={X} onClick={() => setSidebarOpen(false)} aria-label="Cerrar panel" />
            </div>

            {/* SELECCIÓN DE FIGURA */}
            <SeccionDesplegable titulo="Selección de figura" icon={Box} defaultOpen={true}>
              <div className="vf3-figs">
                {Object.keys(DATOS_FIGURAS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFiguraActual(key)}
                    className={`vf3-fig ${figuraActual === key ? 'is-active' : ''}`}
                    aria-pressed={figuraActual === key}
                  >
                    <SolidGlyph id={key} />
                    <span>{DATOS_FIGURAS[key].nombre}</span>
                  </button>
                ))}
              </div>
              <p key={figuraActual} className="vf3-info">"{datos.info}"</p>
            </SeccionDesplegable>

            {/* DIMENSIONES */}
            <SeccionDesplegable titulo="Dimensiones y medidas" icon={Ruler} defaultOpen={true}>
              <div className="vf3-dims">
                {(datos.tipo.includes('tamano')) && (
                  <DimSlider label="Arista / Lado" value={dimensiones.tamano} min="0.5" max="3" step="0.1" onChange={(e) => updateDim('tamano', e.target.value)} />
                )}
                {(datos.tipo.includes('radio')) && (
                  <DimSlider label="Radio (r)" value={dimensiones.radio} min="0.5" max="2" step="0.1" onChange={(e) => updateDim('radio', e.target.value)} />
                )}
                {(datos.tipo.includes('altura')) && (
                  <DimSlider label="Altura (h)" value={dimensiones.altura} min="0.5" max="4" step="0.1" onChange={(e) => updateDim('altura', e.target.value)} />
                )}
                {(datos.tipo.includes('tubo')) && (
                  <DimSlider label="Grosor tubo" value={dimensiones.tubo} min="0.1" max="1" step="0.05" onChange={(e) => updateDim('tubo', e.target.value)} />
                )}
              </div>
            </SeccionDesplegable>

            {/* MATEMÁTICAS */}
            <SeccionDesplegable titulo="Fórmulas y cálculo" icon={Calculator} defaultOpen={false}>
              <div className="vf3-metrics">
                <Panel variant="screen" className="vf3-metric vf3-metric--vol">
                  <span className="vf3-metric__label">Volumen</span>
                  <span className="vf3-metric__formula">{datos.formulaVolumen}</span>
                  <span className="vf3-metric__value">{resultados.v.toFixed(2)} <small>m³</small></span>
                </Panel>
                <Panel variant="screen" className="vf3-metric vf3-metric--area">
                  <span className="vf3-metric__label">Área superficie</span>
                  <span className="vf3-metric__formula">{datos.formulaArea}</span>
                  <span className="vf3-metric__value">{resultados.a.toFixed(2)} <small>m²</small></span>
                </Panel>
              </div>
            </SeccionDesplegable>

            {/* ESTILO */}
            <SeccionDesplegable titulo="Apariencia" icon={Palette} defaultOpen={false}>
              <div className="vf3-look">
                <span className="vf3-look__label">Material</span>
                <div className="vf3-mats">
                  {Object.keys(PRESETS_MATERIAL).map((matKey) => (
                    <button
                      key={matKey}
                      type="button"
                      onClick={() => setTipoMaterial(matKey)}
                      className={`vf3-mat vf3-mat--${matKey} ${tipoMaterial === matKey ? 'is-active' : ''}`}
                      aria-pressed={tipoMaterial === matKey}
                    >
                      <span className="vf3-mat__ball" aria-hidden="true" />
                      {PRESETS_MATERIAL[matKey].nombre}
                    </button>
                  ))}
                </div>

                <div className="vf3-swatches">
                  <label className="vf3-swatch">
                    <span className="vf3-look__label">Color figura</span>
                    <span className="vf3-swatch__chip" style={{ backgroundColor: colorFigura }}>
                      <input type="color" value={colorFigura} onChange={(e) => setColorFigura(e.target.value)} />
                    </span>
                  </label>
                  <label className="vf3-swatch">
                    <span className="vf3-look__label">Color fondo</span>
                    <span className="vf3-swatch__chip" style={{ backgroundColor: colorFondo }}>
                      <input type="color" value={colorFondo} onChange={(e) => setColorFondo(e.target.value)} />
                    </span>
                  </label>
                </div>

                <div className="vf3-toggles">
                  <GameButton variant={wireframe ? 'primary' : 'soft'} icon={Grid3x3} onClick={() => setWireframe(!wireframe)}>
                    {wireframe ? 'Modo: malla visible' : 'Modo: sólido'}
                  </GameButton>
                  <GameButton variant={autoRotar ? 'primary' : 'soft'} icon={autoRotar ? Pause : Play} onClick={() => setAutoRotar(!autoRotar)}>
                    {autoRotar ? 'Detener rotación' : 'Iniciar rotación'}
                  </GameButton>
                </div>
              </div>
            </SeccionDesplegable>
          </aside>

        {/* 2. ESCENARIO 3D (CANVAS) */}
        <div className="vf3-stage">
          {/* HUD decorativo (no intercepta el ratón): viñeta + ficha de la figura */}
          <div className="vf3-vignette" aria-hidden="true" />
          <div key={figuraActual} className="vf3-hud" aria-hidden="true">
            <span className="vf3-hud__glyph"><SolidGlyph id={figuraActual} /></span>
            <span className="vf3-hud__name">{datos.nombre}</span>
            <span className="vf3-hud__metric"><b>V</b> {resultados.v.toFixed(2)} m³</span>
            <span className="vf3-hud__metric"><b>A</b> {resultados.a.toFixed(2)} m²</span>
          </div>
          <div className="vf3-help" aria-hidden="true">
            <Rotate3D size={14} /> Arrastra para girar · rueda para acercar
          </div>

          {!sidebarOpen && (
            <button type="button" className="vf3-fab" onClick={() => setSidebarOpen(true)} aria-label="Abrir panel">
              <PanelLeftOpen size={22} />
            </button>
          )}

          <Canvas shadows camera={{ position: [5, 4, 7], fov: 45 }}>
              <color attach="background" args={[colorFondo]} />

              <ambientLight intensity={0.7} />
              <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-10, 5, -10]} intensity={0.5} color="#818cf8" />
              <pointLight position={[0, -5, 5]} intensity={0.3} color="#fca5a5" />

              <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2.5} far={5} />

              <FiguraDinamica
                  tipo={figuraActual}
                  dims={dimensiones}
                  autoRotar={autoRotar}
                  wireframe={wireframe}
                  color={colorFigura}
                  materialSettings={materialActual}
              />

              <gridHelper args={[30, 30, 0x555555, 0x222222]} position={[0, -2.5, 0]} />
              <axesHelper args={[2]} position={[0, -2.49, 0]} />

              <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} enableDamping />

              <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                  <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
              </GizmoHelper>
          </Canvas>
        </div>
      </div>
    </GameShell>
  );
};

export default VisualizadorFiguras3D;
