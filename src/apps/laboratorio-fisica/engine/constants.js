// Tablas físicas compartidas por las escenas. Valores didácticos estándar
// (los mismos que usan los libros de texto), en unidades SI.

export const G_UNIVERSAL = 6.674e-11; // N·m²/kg²
export const P_ATM = 101325;          // Pa (presión atmosférica estándar)

// Cuerpos celestes para comparar gravedades (g en m/s²)
export const PLANETAS = {
  luna: { label: '🌕 Luna', g: 1.6 },
  marte: { label: '🔴 Marte', g: 3.7 },
  tierra: { label: '🌍 Tierra', g: 9.8 },
  jupiter: { label: '🟠 Júpiter', g: 24.8 },
};

// Superficies con coeficientes de rozamiento (estático / dinámico)
export const SUPERFICIES = {
  hielo: { label: '🧊 Hielo', muS: 0.1, muK: 0.05, color: '#bae6fd' },
  madera: { label: '🪵 Madera', muS: 0.45, muK: 0.3, color: '#a16207' },
  goma: { label: '⚫ Goma', muS: 0.9, muK: 0.7, color: '#374151' },
};

// Líquidos: densidad (kg/m³) y viscosidad dinámica (Pa·s) para Stokes
export const LIQUIDOS = {
  gasolina: { label: '⛽ Gasolina', rho: 680, mu: 0.0006, color: '#fbbf24' },
  aceite: { label: '🫒 Aceite', rho: 920, mu: 0.08, color: '#a3e635' },
  agua: { label: '💧 Agua', rho: 1000, mu: 0.001, color: '#38bdf8' },
  glicerina: { label: '🧴 Glicerina', rho: 1260, mu: 1.4, color: '#e9d5ff' },
  miel: { label: '🍯 Miel', rho: 1420, mu: 10, color: '#f59e0b' },
  mercurio: { label: '☿ Mercurio', rho: 13600, mu: 0.0015, color: '#cbd5e1' },
};

// Materiales de objetos: densidad (kg/m³) para flotación/Arquímedes
export const MATERIALES = {
  corcho: { label: '🍾 Corcho', rho: 240, color: '#d9b38c' },
  madera: { label: '🪵 Madera', rho: 700, color: '#a16207' },
  hielo: { label: '🧊 Hielo', rho: 917, color: '#e0f2fe' },
  plastico: { label: '🧱 Plástico', rho: 1100, color: '#f472b6' },
  aluminio: { label: '🥫 Aluminio', rho: 2700, color: '#cbd5e1' },
  acero: { label: '⚙️ Acero', rho: 7850, color: '#64748b' },
  oro: { label: '🥇 Oro', rho: 19300, color: '#fbbf24' },
};
