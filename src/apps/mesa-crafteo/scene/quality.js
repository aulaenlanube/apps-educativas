// src/apps/mesa-crafteo/scene/quality.js
// Presupuesto de la escena por nivel de calidad gráfica global
// (src/services/graphicsQuality.js). Solo afecta a lo visual.
//   sphereSeg / bondSeg: segmentos de esferas y cilindros
//   physical: material con capa de barniz (clearcoat) en los átomos
//   env: reflejos de entorno (RoomEnvironment → PMREM, generado en local)
//   halos: brillo aditivo de los electrones libres · beam: haz holográfico
//   dust: partículas de ambiente · burst: partículas de la celebración
//   fps: tope de fotogramas mientras hay animación (en reposo no se pinta)
export const MC_TIERS = {
  low: { sphereSeg: 18, bondSeg: 8, physical: false, env: false, halos: false, beam: false, dust: 0, burst: 48, fps: 30 },
  medium: { sphereSeg: 30, bondSeg: 12, physical: false, env: true, halos: true, beam: true, dust: 110, burst: 140, fps: 50 },
  high: { sphereSeg: 44, bondSeg: 16, physical: true, env: true, halos: true, beam: true, dust: 260, burst: 280, fps: 60 },
};

export const tierParams = (tier) => MC_TIERS[tier] || MC_TIERS.medium;
