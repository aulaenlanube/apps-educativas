import React from 'react';
import ArtFrame from '@/components/art/ArtFrame';
import SET1 from '@/components/icons/subject/set1';
import SET2 from '@/components/icons/subject/set2';
import SET3 from '@/components/icons/subject/set3';
import SET4 from '@/components/icons/subject/set4';

// Icono de asignatura (rediseño 2026). Dibujos en src/components/icons/subject/*
// con el contrato de rendimiento de src/components/art/README.md.
const ICONS = { ...SET1, ...SET2, ...SET3, ...SET4 };

// Color de acento de cada asignatura (halo y borde de su tarjeta en SubjectPage).
const ACCENT = {
  'lengua': 'rgb(99, 102, 241)',
  'matematicas': 'rgb(59, 130, 246)',
  'ciencias-naturales': 'rgb(16, 185, 129)',
  'ciencias-sociales': 'rgb(20, 184, 166)',
  'tutoria': 'rgb(245, 158, 11)',
  'valenciano': 'rgb(249, 115, 22)',
  'ingles': 'rgb(37, 99, 235)',
  'frances': 'rgb(37, 99, 235)',
  'programacion': 'rgb(6, 182, 212)',
  'historia': 'rgb(217, 119, 6)',
  'biologia': 'rgb(16, 185, 129)',
  'fisica': 'rgb(139, 92, 246)',
  'musica': 'rgb(236, 72, 153)',
  'plastica': 'rgb(168, 85, 247)',
  'tecnologia': 'rgb(100, 116, 139)',
  'ed-fisica': 'rgb(239, 68, 68)',
  'robotica': 'rgb(56, 189, 248)',
  'ia': 'rgb(124, 58, 237)',
  'latin': 'rgb(202, 138, 4)',
  'economia': 'rgb(5, 150, 105)',
  'filosofia': 'rgb(124, 58, 237)',
  'historia-mundo': 'rgb(37, 99, 235)',
  'historia-espana': 'rgb(220, 38, 38)',
  'dibujo-tecnico': 'rgb(71, 85, 105)',
  'literatura-universal': 'rgb(190, 24, 93)',
  'economia-empresa': 'rgb(4, 120, 87)',
  'geografia': 'rgb(13, 148, 136)',
  'arte': 'rgb(147, 51, 234)',
  'quimica': 'rgb(124, 58, 237)',
  'articulacion': 'rgb(234, 88, 12)',
  'vocabulario': 'rgb(219, 39, 119)',
  'morfosintaxis': 'rgb(124, 58, 237)',
  'pragmatica': 'rgb(6, 182, 212)',
  'conciencia-fonologica': 'rgb(217, 119, 6)',
  'comprension-oral': 'rgb(13, 148, 136)',
  'lectoescritura': 'rgb(225, 29, 72)',
  'atencion': 'rgb(239, 68, 68)',
  'memoria': 'rgb(124, 58, 237)',
  'funciones-ejecutivas': 'rgb(37, 99, 235)',
  'habilidades-sociales': 'rgb(236, 72, 153)',
  'razonamiento': 'rgb(245, 158, 11)',
  'autonomia': 'rgb(16, 185, 129)',
  'lectoescritura-adaptada': 'rgb(99, 102, 241)',
};

const SubjectIcon = ({ subjectId, className = '' }) => {
  const Icon = ICONS[subjectId];
  if (!Icon) return null;
  return (
    <ArtFrame className={`shrink-0 ${className}`} style={{ width: 58, height: 58, margin: '-5px 0' }}>
      <Icon />
    </ArtFrame>
  );
};

// Color de acento sólido de la asignatura. Lo usan las tarjetas de SubjectPage
// para el halo/borde.
export const getSubjectAccent = (subjectId) => ACCENT[subjectId] || null;

export default SubjectIcon;
