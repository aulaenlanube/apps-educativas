import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Componente para la figura
const Figura = ({ tipo, autoRotar, wireframe, color }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (autoRotar && meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const materialProps = {
    color: color,
    wireframe: wireframe,
    metalness: 0.1,
    roughness: 0.5,
  };

  return (
    <mesh ref={meshRef} scale={1.8}>
      {/* Figuras Básicas */}
      {tipo === 'cubo' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
      {tipo === 'esfera' && <sphereGeometry args={[1, 32, 32]} />}
      {tipo === 'cilindro' && <cylinderGeometry args={[1, 1, 2, 32]} />}
      {tipo === 'cono' && <coneGeometry args={[1, 2, 32]} />}
      {tipo === 'toro' && <torusGeometry args={[1, 0.4, 16, 100]} />}
      
      {/* Figuras Triangulares / Nuevas */}
      {/* Tetraedro: 4 caras triangulares */}
      {tipo === 'tetraedro' && <tetrahedronGeometry args={[1.5, 0]} />}
      {/* Octaedro: 8 caras triangulares */}
      {tipo === 'octaedro' && <octahedronGeometry args={[1.4, 0]} />}
      {/* Pirámide: Un cono con 4 segmentos radiales crea una pirámide de base cuadrada */}
      {tipo === 'piramide' && <coneGeometry args={[1.2, 1.5, 4]} />}
      {/* Prisma Triangular: Un cilindro con 3 segmentos radiales */}
      {tipo === 'prisma-tri' && <cylinderGeometry args={[1, 1, 2, 3]} />}

      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
};

const VisualizadorFiguras3D = () => {
  const [figuraActual, setFiguraActual] = useState('cubo');
  const [autoRotar, setAutoRotar] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  
  // Estados para colores
  const [colorFigura, setColorFigura] = useState('#6366f1'); // Índigo inicial
  const [colorFondo, setColorFondo] = useState('#0f172a'); // Slate-900 inicial

  const figuras = [
    { id: 'cubo', nombre: 'Cubo' },
    { id: 'esfera', nombre: 'Esfera' },
    { id: 'cilindro', nombre: 'Cilindro' },
    { id: 'cono', nombre: 'Cono' },
    { id: 'toro', nombre: 'Toro' },
    // Nuevas figuras
    { id: 'tetraedro', nombre: 'Tetraedro (Triangular)' },
    { id: 'piramide', nombre: 'Pirámide (Cuadrada)' },
    { id: 'prisma-tri', nombre: 'Prisma Triangular' },
    { id: 'octaedro', nombre: 'Octaedro' },
  ];

  return (
    // CAMBIO: h-[calc(100vh-xxx)] para forzar que ocupe la pantalla menos el header
    <div className="flex flex-col md:flex-row gap-4 p-4 w-full h-[calc(100vh-140px)]">
      
      {/* 1. Panel de Controles (Scrollable si es necesario) */}
      <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Geometría 3D</h2>
          <div className="grid grid-cols-2 gap-2">
            {figuras.map((fig) => (
              <Button
                key={fig.id}
                variant={figuraActual === fig.id ? "default" : "outline"}
                onClick={() => setFiguraActual(fig.id)}
                size="sm"
                className="justify-start text-xs overflow-hidden text-ellipsis"
                title={fig.nombre}
              >
                {fig.nombre}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-3 text-slate-700">Visualización</h3>
          <div className="flex flex-col gap-3">
            <Button 
                variant={autoRotar ? "secondary" : "outline"} 
                onClick={() => setAutoRotar(!autoRotar)}
                className="w-full justify-between"
            >
                <span>Rotación</span> {autoRotar ? 'On' : 'Off'}
            </Button>
            <Button 
                variant={wireframe ? "secondary" : "outline"} 
                onClick={() => setWireframe(!wireframe)}
                className="w-full justify-between"
            >
                <span>Modo</span> {wireframe ? 'Malla' : 'Sólido'}
            </Button>

            <div className="border-t pt-3 mt-1 space-y-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="color-figura" className="text-xs text-slate-500">Color Figura</Label>
                    <div className="flex items-center gap-2">
                        <input 
                            id="color-figura"
                            type="color" 
                            value={colorFigura}
                            onChange={(e) => setColorFigura(e.target.value)}
                            className="h-8 w-full cursor-pointer rounded border border-gray-300"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="color-fondo" className="text-xs text-slate-500">Color Fondo</Label>
                    <div className="flex items-center gap-2">
                        <input 
                            id="color-fondo"
                            type="color" 
                            value={colorFondo}
                            onChange={(e) => setColorFondo(e.target.value)}
                            className="h-8 w-full cursor-pointer rounded border border-gray-300"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. El Visor 3D */}
      {/* CAMBIO: flex-1 y h-full para que crezca todo lo posible */}
      <div className="flex-1 h-full bg-slate-100 rounded-xl overflow-hidden shadow-xl relative border border-slate-300">
        
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            {/* Color de fondo dinámico dentro del Canvas */}
            <color attach="background" args={[colorFondo]} />

            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Figura 
                tipo={figuraActual} 
                autoRotar={autoRotar} 
                wireframe={wireframe}
                color={colorFigura}
            />
            
            <OrbitControls enableZoom={true} />
        </Canvas>

        <div className="absolute bottom-4 right-4 bg-black/40 text-white px-3 py-1 rounded-full text-xs pointer-events-none backdrop-blur-sm">
          {figuras.find(f => f.id === figuraActual)?.nombre}
        </div>
      </div>
    </div>
  );
};

export default VisualizadorFiguras3D;