import React, { memo } from 'react';
import ArtFrame from '@/components/art/ArtFrame';
import SET1 from '@/components/icons/app/set1';
import SET2 from '@/components/icons/app/set2';
import SET3 from '@/components/icons/app/set3';

// Icono (baldosa) de cada app (rediseño 2026). Dibujos en src/components/icons/app/*
// con el contrato de rendimiento de src/components/art/README.md: sin filtros ni
// animaciones inline; en reposo como mucho un destello (nivel de efectos alto,
// en pantalla) y la animación vistosa al pasar el ratón por la tarjeta (.group).
const allIcons = { ...SET1, ...SET2, ...SET3 };

// Aliases para apps que comparten icono (variantes por curso)
const aliases = {
  'sumas-primaria-1': 'sumas-primaria',
  'sumas-primaria-2-drag': 'sumas-primaria',
  'sumas-primaria-3-drag': 'sumas-primaria',
  'sumas-primaria-4-drag': 'sumas-primaria',
  'sumas-primaria-5-drag': 'sumas-primaria',
  'sumas-primaria-6-drag': 'sumas-primaria',
  'restas-primaria-1': 'restas-primaria',
  'restas-primaria-2': 'restas-primaria',
  'restas-primaria-3': 'restas-primaria',
  'restas-primaria-4': 'restas-primaria',
  'restas-primaria-5': 'restas-primaria',
  'restas-primaria-6': 'restas-primaria',
  'multiplicaciones-primaria-3': 'multiplicaciones-primaria',
  'multiplicaciones-primaria-4': 'multiplicaciones-primaria',
  'multiplicaciones-primaria-5': 'multiplicaciones-primaria',
  'multiplicaciones-primaria-6': 'multiplicaciones-primaria',
  'divisiones-primaria-4': 'divisiones-primaria',
  'divisiones-primaria-5': 'divisiones-primaria',
  'divisiones-primaria-6': 'divisiones-primaria',
  'supermercado-matematico-1': 'supermercado-matematico',
  'supermercado-matematico-2': 'supermercado-matematico',
  'supermercado-matematico-3': 'supermercado-matematico',
  'supermercado-matematico-4': 'supermercado-matematico',
  'supermercado-matematico-5': 'supermercado-matematico',
  'supermercado-matematico-6': 'supermercado-matematico',
  'numeros-romanos-3': 'numeros-romanos',
  'numeros-romanos-4': 'numeros-romanos',
  'numeros-romanos-5': 'numeros-romanos',
  'numeros-romanos-6': 'numeros-romanos',
  'numeros-romanos-eso': 'numeros-romanos',
  'mayor-menor-1': 'mayor-menor',
  'mayor-menor-2': 'mayor-menor',
  'mayor-menor-3': 'mayor-menor',
  'mayor-menor-4': 'mayor-menor',
  'mayor-menor-5': 'mayor-menor',
  'mayor-menor-6': 'mayor-menor',
  'ordena-numeros-1': 'ordena-numeros',
  'ordena-numeros-2': 'ordena-numeros',
  'ordena-numeros-3': 'ordena-numeros',
  'ordena-numeros-4': 'ordena-numeros',
  'ordena-numeros-5': 'ordena-numeros',
  'ordena-numeros-6': 'ordena-numeros',
  'longitud-comparar': 'medidas',
  'longitud-ordenar': 'medidas',
  'masa-comparar': 'medidas',
  'masa-ordenar': 'medidas',
  'capacidad-comparar': 'medidas',
  'capacidad-ordenar': 'medidas',
  'celula-animal': 'celula-animal',
  'celula-vegetal': 'celula-vegetal',
  'parejas': 'parejas',
  'snake': 'snake',
  'rosco-del-saber': 'rosco-del-saber',
  'comprension-escrita': 'comprension-escrita',
  'comprension-oral': 'comprension-oral',
};

const AppIcon = memo(({ appId, className = '', size = 48 }) => {
  const resolvedId = aliases[appId] || appId;
  const Icon = allIcons[resolvedId];
  if (!Icon) return null;
  return (
    <ArtFrame className={`shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Icon />
    </ArtFrame>
  );
});

AppIcon.displayName = 'AppIcon';

// Indica si existe un icono SVG (propio o por alias) para un appId dado.
export const hasAppIcon = (appId) => Boolean(allIcons[aliases[appId] || appId]);

export default AppIcon;
export { allIcons as appIcons };
