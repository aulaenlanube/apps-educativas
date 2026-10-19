// src/apps/sistema-solar/scene/textures.js
// Mapas de color por cuerpo y resolución: 1k en calidad baja (móviles y
// equipos modestos), 2k en media/alta.
import sun2 from '../textures/2k_sun.webp';
import mercury2 from '../textures/2k_mercury.webp';
import venus2 from '../textures/2k_venus_atmosphere.webp';
import earth2 from '../textures/2k_earth_daymap.webp';
import earthNight2 from '../textures/2k_earth_nightmap.webp';
import clouds2 from '../textures/2k_earth_clouds.webp';
import moon2 from '../textures/2k_moon.webp';
import mars2 from '../textures/2k_mars.webp';
import jupiter2 from '../textures/2k_jupiter.webp';
import saturn2 from '../textures/2k_saturn.webp';
import uranus2 from '../textures/2k_uranus.webp';
import neptune2 from '../textures/2k_neptune.webp';
import milky2 from '../textures/2k_stars_milky_way.webp';
import sun1 from '../textures/1k_sun.webp';
import mercury1 from '../textures/1k_mercury.webp';
import venus1 from '../textures/1k_venus_atmosphere.webp';
import earth1 from '../textures/1k_earth_daymap.webp';
import earthNight1 from '../textures/1k_earth_nightmap.webp';
import clouds1 from '../textures/1k_earth_clouds.webp';
import moon1 from '../textures/1k_moon.webp';
import mars1 from '../textures/1k_mars.webp';
import jupiter1 from '../textures/1k_jupiter.webp';
import saturn1 from '../textures/1k_saturn.webp';
import uranus1 from '../textures/1k_uranus.webp';
import neptune1 from '../textures/1k_neptune.webp';
import milky1 from '../textures/1k_stars_milky_way.webp';
import saturnRing from '../textures/2k_saturn_ring_alpha.webp';

const SETS = {
  '2k': {
    sun: sun2, mercury: mercury2, venus: venus2, earth: earth2, earthNight: earthNight2, clouds: clouds2,
    moon: moon2, mars: mars2, jupiter: jupiter2, saturn: saturn2, uranus: uranus2, neptune: neptune2, milky: milky2,
  },
  '1k': {
    sun: sun1, mercury: mercury1, venus: venus1, earth: earth1, earthNight: earthNight1, clouds: clouds1,
    moon: moon1, mars: mars1, jupiter: jupiter1, saturn: saturn1, uranus: uranus1, neptune: neptune1, milky: milky1,
  },
};

export const RING_TEXTURE = saturnRing;

export const textureSet = (res = '2k') => SETS[res] || SETS['2k'];

// Para las miniaturas DOM (PlanetOrb con textura): siempre 1k (pesan poco).
export const thumbTexture = (id) => SETS['1k'][id] || null;
