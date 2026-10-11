import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, ContactShadows, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Box, Rotate3D, Palette, Calculator, Ruler, ChevronDown, ChevronRight, Settings2, X, Menu } from 'lucide-react';
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

// --- COMPONENTE ACORDEÓN ---
const SeccionDesplegable = ({ titulo, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className={`vf3d-section rounded-2xl overflow-hidden mb-3 ${isOpen ? 'is-open' : ''}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="vf3d-section-head w-full flex items-center justify-between p-4"
                aria-expanded={isOpen}
            >
                <div className="vf3d-section-title flex items-center gap-3 font-bold text-base">
                    {Icon && <span className="vf3d-section-icon" aria-hidden="true"><Icon size={18}/></span>}
                    {titulo}
                </div>
                {isOpen ? <ChevronDown size={20} className="vf3d-chevron"/> : <ChevronRight size={20} className="vf3d-chevron"/>}
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="vf3d-section-body p-4">
                    {children}
                </div>
            </div>
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
    <div className="vf3d-root flex w-full h-[calc(100vh-140px)] overflow-hidden relative rounded-3xl">
      
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      {/* NOTA: Cambiado breakpoint 'md' -> 'lg' para que TABLET se comporte como MÓVIL */}
      <div 
        className={`
            vf3d-sidebar z-20 flex flex-col transition-all duration-500 ease-in-out
            ${sidebarOpen ? 'w-full lg:w-[420px] opacity-100' : 'w-0 opacity-0 lg:w-0'} 
            overflow-hidden
            absolute lg:relative h-full
        `}
      >
        <div className="p-4 overflow-y-auto h-full custom-scrollbar min-w-[320px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="vf3d-title text-2xl font-bold">
                    <span className="vf3d-title-icon" aria-hidden="true"><Box size={20} /></span>
                    Laboratorio 3D
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                    <X size={24} />
                </Button>
            </div>

            {/* SELECCIÓN DE FIGURA */}
            <SeccionDesplegable titulo="Selección de Figura" icon={Box} defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {Object.keys(DATOS_FIGURAS).map((key) => (
                    <Button
                        key={key}
                        variant={figuraActual === key ? "default" : "outline"}
                        onClick={() => setFiguraActual(key)}
                        className={`vf3d-fig-btn h-12 text-sm justify-start px-3 font-medium ${figuraActual === key ? 'is-active' : ''}`}
                    >
                        {DATOS_FIGURAS[key].nombre}
                    </Button>
                    ))}
                </div>
                <div key={figuraActual} className="vf3d-info p-4 rounded-xl">
                    <p className="text-sm italic leading-relaxed">
                        "{datos.info}"
                    </p>
                </div>
            </SeccionDesplegable>

            {/* DIMENSIONES */}
            <SeccionDesplegable titulo="Dimensiones y Medidas" icon={Ruler} defaultOpen={true}>
                 <div className="space-y-6">
                    {(datos.tipo.includes('tamano')) && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-base text-slate-700">Arista / Lado</Label>
                                <span className="vf3d-value font-mono text-lg font-bold px-2 py-1 rounded-lg">{dimensiones.tamano}m</span>
                            </div>
                            <input type="range" min="0.5" max="3" step="0.1" value={dimensiones.tamano} 
                                onChange={(e) => updateDim('tamano', e.target.value)}
                                className="vf3d-range w-full h-3 rounded-lg accent-indigo-600 cursor-pointer"/>
                        </div>
                    )}
                    {(datos.tipo.includes('radio')) && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-base text-slate-700">Radio (r)</Label>
                                <span className="vf3d-value font-mono text-lg font-bold px-2 py-1 rounded-lg">{dimensiones.radio}m</span>
                            </div>
                            <input type="range" min="0.5" max="2" step="0.1" value={dimensiones.radio} 
                                onChange={(e) => updateDim('radio', e.target.value)}
                                className="vf3d-range w-full h-3 rounded-lg accent-indigo-600 cursor-pointer"/>
                        </div>
                    )}
                    {(datos.tipo.includes('altura')) && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-base text-slate-700">Altura (h)</Label>
                                <span className="vf3d-value font-mono text-lg font-bold px-2 py-1 rounded-lg">{dimensiones.altura}m</span>
                            </div>
                            <input type="range" min="0.5" max="4" step="0.1" value={dimensiones.altura} 
                                onChange={(e) => updateDim('altura', e.target.value)}
                                className="vf3d-range w-full h-3 rounded-lg accent-indigo-600 cursor-pointer"/>
                        </div>
                    )}
                     {(datos.tipo.includes('tubo')) && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-base text-slate-700">Grosor Tubo</Label>
                                <span className="vf3d-value font-mono text-lg font-bold px-2 py-1 rounded-lg">{dimensiones.tubo}m</span>
                            </div>
                            <input type="range" min="0.1" max="1" step="0.05" value={dimensiones.tubo} 
                                onChange={(e) => updateDim('tubo', e.target.value)}
                                className="vf3d-range w-full h-3 rounded-lg accent-indigo-600 cursor-pointer"/>
                        </div>
                    )}
                </div>
            </SeccionDesplegable>

            {/* MATEMÁTICAS */}
            <SeccionDesplegable titulo="Fórmulas y Cálculo" icon={Calculator} defaultOpen={false}>
                <div className="space-y-4">
                    <div className="vf3d-metric vf3d-metric--vol p-4 rounded-2xl text-white">
                        <div className="text-xs text-slate-300 uppercase tracking-widest font-bold mb-1">Volumen</div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-mono text-indigo-300 opacity-80">{datos.formulaVolumen}</span>
                            <span className="text-3xl font-bold font-mono text-white">{resultados.v.toFixed(2)} <span className="text-lg">m³</span></span>
                        </div>
                    </div>
                    <div className="vf3d-metric vf3d-metric--area p-4 rounded-2xl text-white">
                        <div className="text-xs text-slate-300 uppercase tracking-widest font-bold mb-1">Área Superficie</div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-mono text-emerald-300 opacity-80">{datos.formulaArea}</span>
                            <span className="text-3xl font-bold font-mono text-white">{resultados.a.toFixed(2)} <span className="text-lg">m²</span></span>
                        </div>
                    </div>
                </div>
            </SeccionDesplegable>

            {/* ESTILO */}
            <SeccionDesplegable titulo="Apariencia" icon={Palette} defaultOpen={false}>
                 <div className="space-y-4">
                     <div>
                        <Label className="text-sm text-slate-500 mb-2 block">Material</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys(PRESETS_MATERIAL).map((matKey) => (
                                <button
                                    key={matKey}
                                    onClick={() => setTipoMaterial(matKey)}
                                    className={`vf3d-chip px-3 py-3 text-sm rounded-xl border font-medium
                                    ${tipoMaterial === matKey ? 'is-active' : ''}`}
                                >
                                    {PRESETS_MATERIAL[matKey].nombre}
                                </button>
                            ))}
                        </div>
                     </div>
                     
                     <div className="flex gap-4">
                        <div className="flex-1">
                            <Label className="text-sm text-slate-500 mb-2 block">Color Figura</Label>
                            <div className="vf3d-swatch h-10 w-full rounded-xl p-1 flex items-center cursor-pointer relative overflow-hidden">
                                <input type="color" value={colorFigura} onChange={(e) => setColorFigura(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                                <div className="w-full h-full rounded bg-current" style={{backgroundColor: colorFigura}}></div>
                            </div>
                        </div>
                        <div className="flex-1">
                             <Label className="text-sm text-slate-500 mb-2 block">Color Fondo</Label>
                            <div className="vf3d-swatch h-10 w-full rounded-xl p-1 flex items-center cursor-pointer relative overflow-hidden">
                                <input type="color" value={colorFondo} onChange={(e) => setColorFondo(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"/>
                                <div className="w-full h-full rounded bg-current" style={{backgroundColor: colorFondo}}></div>
                            </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 pt-2">
                        <Button variant={wireframe ? "default" : "outline"} onClick={() => setWireframe(!wireframe)} className="w-full h-11 text-base">
                            {wireframe ? 'Modo: Malla Visible' : 'Modo: Sólido'}
                        </Button>
                        <Button variant={autoRotar ? "secondary" : "outline"} onClick={() => setAutoRotar(!autoRotar)} className="w-full h-11 text-base">
                            <Rotate3D className="mr-2 h-5 w-5"/> {autoRotar ? 'Detener Rotación' : 'Iniciar Rotación'}
                        </Button>
                     </div>
                 </div>
            </SeccionDesplegable>

        </div>
      </div>

      {/* 2. ESCENARIO 3D (CANVAS) */}
      <div className="vf3d-stage flex-1 h-full relative bg-slate-900 w-full">
        {/* HUD decorativo (no intercepta el ratón): viñeta + ficha de la figura */}
        <div className="vf3d-vignette" aria-hidden="true" />
        <div key={figuraActual} className="vf3d-hud" aria-hidden="true">
            <span className="vf3d-hud-dot" />
            <span className="vf3d-hud-name">{datos.nombre}</span>
            <span className="vf3d-hud-formula">{datos.formulaVolumen}</span>
        </div>
        
        {/* BOTONES DE APERTURA: Lógica separada para Móvil/Tablet y Escritorio */}
        
        {/* A) ESCRITORIO (>= lg): Icono Settings */}
        {!sidebarOpen && (
            <Button 
                onClick={() => setSidebarOpen(true)}
                className="vf3d-fab hidden lg:flex absolute top-4 left-4 z-10 h-12 w-12 rounded-full"
            >
                <Settings2 size={24} />
            </Button>
        )}
        
        {/* B) MÓVIL Y TABLET (< lg): Icono Hamburguesa */}
        {!sidebarOpen && (
             <Button 
                onClick={() => setSidebarOpen(true)} 
                className="vf3d-fab lg:hidden absolute top-4 left-4 z-10 h-12 w-12 rounded-full p-0 border-none flex items-center justify-center"
             >
                <Menu size={24} />
             </Button>
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
  );
};

export default VisualizadorFiguras3D;