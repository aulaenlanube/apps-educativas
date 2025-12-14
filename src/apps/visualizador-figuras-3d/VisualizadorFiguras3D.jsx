import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, ContactShadows, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Box, Rotate3D, Palette, Calculator, Ruler } from 'lucide-react';

// --- CONFIGURACIÓN DE MATERIALES ---
const PRESETS_MATERIAL = {
  plastico: { nombre: 'Plástico', settings: { metalness: 0.1, roughness: 0.5, clearcoat: 0 } },
  metal: { nombre: 'Metal', settings: { metalness: 0.7, roughness: 0.2, clearcoat: 1, color: '#aaaaff' } },
  ceramica: { nombre: 'Cerámica', settings: { metalness: 0.0, roughness: 0.2, clearcoat: 1 } },
  cristal: { nombre: 'Cristal (Sim)', settings: { metalness: 0.1, roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.5 } }
};

// --- LÓGICA MATEMÁTICA Y GEOMÉTRICA ---
const DATOS_FIGURAS = {
  cubo: { 
    nombre: 'Cubo', 
    tipo: 'tamano',
    formulaVolumen: 'V = a³',
    formulaArea: 'A = 6a²',
    calc: (d) => ({ v: Math.pow(d.tamano, 3), a: 6 * Math.pow(d.tamano, 2) }),
    info: 'Poliedro regular de 6 caras cuadradas.' 
  },
  esfera: { 
    nombre: 'Esfera', 
    tipo: 'radio', 
    formulaVolumen: 'V = ⁴/₃πr³',
    formulaArea: 'A = 4πr²',
    calc: (d) => ({ v: (4/3) * Math.PI * Math.pow(d.radio, 3), a: 4 * Math.PI * Math.pow(d.radio, 2) }),
    info: 'Superficie curva donde todos los puntos equidistan del centro.'
  },
  cilindro: { 
    nombre: 'Cilindro', 
    tipo: 'radio-altura', 
    formulaVolumen: 'V = πr²h',
    formulaArea: 'A = 2πr(r + h)',
    calc: (d) => ({ v: Math.PI * Math.pow(d.radio, 2) * d.altura, a: 2 * Math.PI * d.radio * (d.radio + d.altura) }),
    info: 'Cuerpo redondo de bases circulares paralelas.'
  },
  cono: { 
    nombre: 'Cono', 
    tipo: 'radio-altura', 
    formulaVolumen: 'V = ¹/₃πr²h',
    formulaArea: 'A = πr(r + g)',
    calc: (d) => {
        const g = Math.sqrt(d.radio*d.radio + d.altura*d.altura);
        return { v: (1/3) * Math.PI * Math.pow(d.radio, 2) * d.altura, a: Math.PI * d.radio * (d.radio + g) };
    },
    info: 'Sólido de revolución generado por un triángulo rectángulo.'
  },
  piramide: { 
    nombre: 'Pirámide (Base Cuad.)', 
    tipo: 'tamano-altura',
    formulaVolumen: 'V = ¹/₃l²h',
    formulaArea: 'A = l(l + 2ap)',
    calc: (d) => {
        const l = d.tamano;
        const h = d.altura;
        const ap = Math.sqrt(Math.pow(l/2, 2) + Math.pow(h, 2));
        return { v: (1/3) * l * l * h, a: l * (l + 2 * ap) };
    },
    info: 'Poliedro con base cuadrada y caras laterales triangulares.'
  },
  toro: { 
    nombre: 'Toro', 
    tipo: 'radio-tubo', 
    formulaVolumen: 'V = 2π²Rr²',
    formulaArea: 'A = 4π²Rr',
    calc: (d) => ({ v: 2 * Math.pow(Math.PI, 2) * d.radio * Math.pow(d.tubo, 2), a: 4 * Math.pow(Math.PI, 2) * d.radio * d.tubo }),
    info: 'Superficie generada por una circunferencia que gira alrededor de una recta.'
  }
};

// --- COMPONENTE DE FIGURA DINÁMICA ---
const FiguraDinamica = ({ tipo, dims, autoRotar, wireframe, color, materialSettings }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (autoRotar && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const material = <meshPhysicalMaterial color={color} wireframe={wireframe} {...materialSettings} />;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} castShadow receiveShadow>
            {tipo === 'cubo' && <boxGeometry args={[dims.tamano, dims.tamano, dims.tamano]} />}
            {tipo === 'esfera' && <sphereGeometry args={[dims.radio, 64, 64]} />}
            {tipo === 'cilindro' && <cylinderGeometry args={[dims.radio, dims.radio, dims.altura, 32]} />}
            {tipo === 'cono' && <coneGeometry args={[dims.radio, dims.altura, 32]} />}
            {tipo === 'piramide' && <cylinderGeometry args={[0, dims.tamano / Math.sqrt(2), dims.altura, 4]} />}
            {tipo === 'toro' && <torusGeometry args={[dims.radio, dims.tubo, 32, 100]} />}
            
            {material}
        </mesh>
    </Float>
  );
};

// --- COMPONENTE PRINCIPAL ---
const VisualizadorFiguras3D = () => {
  const [figuraActual, setFiguraActual] = useState('cubo');
  const [dimensiones, setDimensiones] = useState({ tamano: 2, radio: 1, altura: 2, tubo: 0.4 });

  const [autoRotar, setAutoRotar] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [tipoMaterial, setTipoMaterial] = useState('plastico');
  const [colorFigura, setColorFigura] = useState('#6366f1');
  const [colorFondo, setColorFondo] = useState('#1e293b');
  const [mostrarGrid] = useState(true); // Se mantiene pero sin setter si no se usa

  const datos = DATOS_FIGURAS[figuraActual];
  const materialActual = PRESETS_MATERIAL[tipoMaterial].settings;

  const resultados = useMemo(() => datos.calc(dimensiones), [datos, dimensiones]);

  const updateDim = (key, value) => {
    setDimensiones(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  return (
    // CAMBIO CLAVE: overflow-hidden para que no haya scroll en la página general, el scroll será interno en el panel
    <div className="flex flex-col lg:flex-row gap-4 p-4 w-full h-[calc(100vh-140px)] overflow-hidden">
      
      {/* 1. PANEL DE CONTROL */}
      {/* CAMBIO CLAVE: h-[45%] en móvil fuerza a que ocupe menos de la mitad. lg:h-full restaura la altura completa en escritorio. */}
      <div className="w-full lg:w-96 h-[45%] lg:h-full flex-none flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Selector de Figuras */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold mb-3 text-slate-800 flex items-center gap-2">
                <Box size={16} /> Selección de Figura
            </h2>
            <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(DATOS_FIGURAS).map((key) => (
                <Button
                    key={key}
                    variant={figuraActual === key ? "default" : "outline"}
                    onClick={() => setFiguraActual(key)}
                    size="sm"
                    className="text-[10px] h-8 px-1"
                >
                    {DATOS_FIGURAS[key].nombre}
                </Button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 italic bg-slate-50 p-2 rounded border border-slate-100">
                "{datos.info}"
            </p>
        </div>

        {/* CONTROLES MÉTRICOS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold mb-4 text-slate-800 flex items-center gap-2">
                <Ruler size={16} className="text-indigo-600"/> Dimensiones (Metros)
            </h2>
            
            <div className="space-y-4">
                {(datos.tipo.includes('tamano')) && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <Label>Lado / Tamaño</Label>
                            <span className="font-mono text-slate-500">{dimensiones.tamano}m</span>
                        </div>
                        <input type="range" min="0.5" max="3" step="0.1" value={dimensiones.tamano} 
                            onChange={(e) => updateDim('tamano', e.target.value)}
                            className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
                    </div>
                )}
                {(datos.tipo.includes('radio')) && (
                    <div className="space-y-1">
                         <div className="flex justify-between text-xs">
                            <Label>Radio (r)</Label>
                            <span className="font-mono text-slate-500">{dimensiones.radio}m</span>
                        </div>
                        <input type="range" min="0.5" max="2" step="0.1" value={dimensiones.radio} 
                             onChange={(e) => updateDim('radio', e.target.value)}
                             className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
                    </div>
                )}
                {(datos.tipo.includes('altura')) && (
                    <div className="space-y-1">
                         <div className="flex justify-between text-xs">
                            <Label>Altura (h)</Label>
                            <span className="font-mono text-slate-500">{dimensiones.altura}m</span>
                        </div>
                        <input type="range" min="0.5" max="4" step="0.1" value={dimensiones.altura} 
                             onChange={(e) => updateDim('altura', e.target.value)}
                             className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
                    </div>
                )}
                {(datos.tipo.includes('tubo')) && (
                    <div className="space-y-1">
                         <div className="flex justify-between text-xs">
                            <Label>Grosor Tubo</Label>
                            <span className="font-mono text-slate-500">{dimensiones.tubo}m</span>
                        </div>
                        <input type="range" min="0.1" max="1" step="0.05" value={dimensiones.tubo} 
                             onChange={(e) => updateDim('tubo', e.target.value)}
                             className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
                    </div>
                )}
            </div>
        </div>

        {/* CALCULADORA */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl shadow-md border border-slate-700 text-white">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-indigo-300">
                <Calculator size={16} /> Matemáticas en Vivo
            </h2>
            <div className="space-y-3">
                <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Volumen</div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-mono text-indigo-300 opacity-70">{datos.formulaVolumen}</span>
                        <span className="text-xl font-bold font-mono text-white">{resultados.v.toFixed(2)} m³</span>
                    </div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Área Superficie</div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-mono text-emerald-300 opacity-70">{datos.formulaArea}</span>
                        <span className="text-xl font-bold font-mono text-white">{resultados.a.toFixed(2)} m²</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Panel Estilo */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-sm font-bold mb-3 text-slate-800 flex items-center gap-2">
                <Palette size={16} /> Estilo
            </h2>
            <div className="flex gap-2 mb-3">
                 <div className="flex-1 bg-slate-100 p-1 rounded border">
                    <input type="color" value={colorFigura} onChange={(e) => setColorFigura(e.target.value)} className="w-full h-6 block cursor-pointer" title="Color Figura"/>
                 </div>
                 <div className="flex-1 bg-slate-100 p-1 rounded border">
                    <input type="color" value={colorFondo} onChange={(e) => setColorFondo(e.target.value)} className="w-full h-6 block cursor-pointer" title="Color Fondo"/>
                 </div>
            </div>
             <div className="grid grid-cols-2 gap-2">
                 <Button variant={wireframe ? "default" : "outline"} onClick={() => setWireframe(!wireframe)} size="sm" className="text-xs">
                    {wireframe ? 'Malla' : 'Sólido'}
                 </Button>
                 <Button variant={autoRotar ? "secondary" : "outline"} onClick={() => setAutoRotar(!autoRotar)} size="sm" className="text-xs">
                    <Rotate3D size={12} className="mr-1"/> Rotar
                 </Button>
            </div>
        </div>
      </div>

      {/* 2. ESCENARIO 3D DINÁMICO */}
      {/* CAMBIO CLAVE: flex-1 ocupa todo el espacio restante (55% en móvil). min-h-0 evita que flexbox lo expanda más de la cuenta. */}
      <div className="flex-1 min-h-0 bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative border-4 border-slate-800">
        <Canvas shadows camera={{ position: [5, 3, 7], fov: 45 }}>
            <color attach="background" args={[colorFondo]} />
            
            <ambientLight intensity={0.6} />
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

            {mostrarGrid && (
                <>
                  <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -2.5, 0]} />
                  <axesHelper args={[2]} position={[0, -2.49, 0]} />
                </>
            )}
            
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} enableDamping />
            
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
            </GizmoHelper>
        </Canvas>

        {/* Overlay de Material */}
        <div className="absolute top-4 right-4 flex gap-2">
             {Object.keys(PRESETS_MATERIAL).map((matKey) => (
                <button
                    key={matKey}
                    onClick={() => setTipoMaterial(matKey)}
                    className={`px-3 py-1 text-[10px] rounded-full backdrop-blur-md border transition-colors
                    ${tipoMaterial === matKey ? 'bg-white/20 border-white text-white' : 'bg-black/30 border-white/10 text-slate-400 hover:bg-black/50'}`}
                >
                    {PRESETS_MATERIAL[matKey].nombre}
                </button>
             ))}
        </div>
      </div>
    </div>
  );
};

export default VisualizadorFiguras3D;