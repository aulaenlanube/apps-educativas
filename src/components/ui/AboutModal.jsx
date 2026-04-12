import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Linkedin, X } from 'lucide-react';
import IconXSocial from '../icons/IconXSocial';

const Dialog = DialogPrimitive.Root;
const DialogContent = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const DialogHeader = ({ className, ...props }) => <div className={`text-center ${className}`} {...props} />;
const DialogFooter = ({ className, ...props }) => <div className={` ${className}`} {...props} />;

const ENTER_DURATION = 1500;
const EXIT_DURATION = 1200;

// ── Estilos de la animación de interferencia ULTRA ──
const glitchStyles = `
/* ═══════════════════════════════════════════════════════
   ANIMACIONES DE ENTRADA
   ═══════════════════════════════════════════════════════ */

@keyframes glitch-overlay-in {
  0%   { opacity: 0; background: rgba(0,0,0,0); }
  3%   { opacity: 1; background: rgba(0,255,255,0.15); }
  6%   { opacity: 0.3; background: rgba(255,0,128,0.12); }
  9%   { opacity: 0.9; background: rgba(0,0,0,0.5); }
  12%  { opacity: 0.2; background: rgba(128,0,255,0.1); }
  18%  { opacity: 0.85; background: rgba(0,0,0,0.55); }
  25%  { opacity: 0.5; background: rgba(0,255,200,0.08); }
  35%  { opacity: 0.75; background: rgba(0,0,0,0.58); }
  50%  { opacity: 0.9; }
  100% { opacity: 1; background: rgba(0,0,0,0.6); }
}

@keyframes glitch-modal-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3) skewX(25deg) skewY(-5deg);
    filter: hue-rotate(90deg) brightness(5) saturate(8) blur(8px);
    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  }
  4% {
    opacity: 1;
    transform: translate(-48%, -55%) scale(1.15) skewX(-15deg) skewY(3deg);
    filter: hue-rotate(270deg) brightness(3) saturate(5) blur(2px);
    clip-path: polygon(0% 0%, 100% 0%, 100% 15%, 0% 20%);
  }
  8% {
    transform: translate(-53%, -48%) scale(0.95) skewX(8deg) skewY(-2deg);
    filter: hue-rotate(180deg) brightness(0.4) saturate(3) blur(0px);
    clip-path: polygon(0% 0%, 100% 0%, 100% 35%, 0% 30%);
  }
  12% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.02) skewX(-4deg);
    filter: hue-rotate(45deg) brightness(4) saturate(2);
    clip-path: polygon(0% 10%, 100% 5%, 100% 55%, 0% 50%);
  }
  16% {
    opacity: 1;
    transform: translate(-47%, -52%) scale(0.98) skewX(6deg) skewY(1deg);
    filter: hue-rotate(315deg) brightness(0.6) saturate(4);
    clip-path: polygon(0% 0%, 100% 0%, 100% 65%, 0% 70%);
  }
  22% {
    opacity: 0.7;
    transform: translate(-51%, -49%) scale(1.01) skewX(-2deg);
    filter: hue-rotate(135deg) brightness(2.5) saturate(1.5);
    clip-path: polygon(0% 15%, 100% 20%, 100% 80%, 0% 75%);
  }
  28% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) skewX(3deg);
    filter: hue-rotate(0deg) brightness(1.8);
    clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 0% 90%);
  }
  35% {
    opacity: 0.85;
    transform: translate(-50%, -51%) skewX(-1.5deg);
    filter: brightness(0.7) contrast(1.5);
    clip-path: polygon(0% 5%, 100% 0%, 100% 95%, 0% 100%);
  }
  42% {
    opacity: 1;
    transform: translate(-50%, -50%) skewX(1deg);
    filter: brightness(1.6) contrast(0.9);
    clip-path: inset(0 0 0 0);
  }
  50% {
    transform: translate(-50%, -50%) skewX(-0.8deg);
    filter: brightness(0.85);
  }
  58% {
    transform: translate(-50%, -50%) skewX(0.5deg);
    filter: brightness(1.3) hue-rotate(10deg);
  }
  66% {
    transform: translate(-50%, -50%) skewX(-0.3deg);
    filter: brightness(0.95);
  }
  75% {
    transform: translate(-50%, -50%) skewX(0.15deg);
    filter: brightness(1.1);
  }
  85% {
    transform: translate(-50%, -50%) skewX(0deg);
    filter: brightness(1.05);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) skewX(0deg) skewY(0deg);
    filter: none;
    clip-path: inset(0 0 0 0);
  }
}

/* ═══════════════════════════════════════════════════════
   ANIMACIONES DE SALIDA
   ═══════════════════════════════════════════════════════ */

@keyframes glitch-overlay-out {
  0%   { opacity: 1; background: rgba(0,0,0,0.6); }
  10%  { opacity: 0.9; background: rgba(255,0,128,0.12); }
  20%  { opacity: 0.7; background: rgba(0,0,0,0.5); }
  30%  { opacity: 0.5; background: rgba(0,255,255,0.08); }
  45%  { opacity: 0.8; background: rgba(128,0,255,0.06); }
  55%  { opacity: 0.3; }
  70%  { opacity: 0.5; }
  80%  { opacity: 0.15; }
  90%  { opacity: 0.4; }
  95%  { opacity: 0.05; }
  100% { opacity: 0; background: rgba(0,0,0,0); }
}

@keyframes glitch-modal-out {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) skewX(0deg);
    filter: none;
    clip-path: inset(0 0 0 0);
  }
  5% {
    opacity: 1;
    transform: translate(-50%, -50%) skewX(-3deg);
    filter: brightness(1.8) hue-rotate(20deg);
  }
  10% {
    transform: translate(-48%, -50%) skewX(6deg) skewY(-1deg);
    filter: hue-rotate(90deg) brightness(0.5) saturate(3);
    clip-path: inset(0 0 0 0);
  }
  18% {
    opacity: 0.8;
    transform: translate(-52%, -50%) skewX(-8deg) skewY(2deg);
    filter: hue-rotate(200deg) brightness(3) saturate(5);
    clip-path: polygon(0% 5%, 100% 0%, 100% 90%, 0% 95%);
  }
  25% {
    opacity: 1;
    transform: translate(-50%, -52%) scale(1.05) skewX(4deg);
    filter: hue-rotate(315deg) brightness(0.3);
    clip-path: polygon(0% 10%, 100% 15%, 100% 80%, 0% 85%);
  }
  35% {
    opacity: 0.5;
    transform: translate(-49%, -48%) scale(0.97) skewX(-10deg);
    filter: hue-rotate(45deg) brightness(4) blur(1px);
    clip-path: polygon(0% 20%, 100% 25%, 100% 70%, 0% 65%);
  }
  45% {
    opacity: 0.9;
    transform: translate(-51%, -50%) scale(1.1) skewX(12deg) skewY(-3deg);
    filter: hue-rotate(180deg) brightness(0.6) blur(2px);
    clip-path: polygon(0% 30%, 100% 35%, 100% 60%, 0% 55%);
  }
  55% {
    opacity: 0.3;
    transform: translate(-50%, -55%) scale(0.9) skewX(-15deg);
    filter: hue-rotate(270deg) brightness(5) saturate(8) blur(3px);
    clip-path: polygon(0% 40%, 100% 42%, 100% 55%, 0% 52%);
  }
  68% {
    opacity: 0.7;
    transform: translate(-47%, -45%) scale(1.2) skewX(20deg) skewY(4deg);
    filter: hue-rotate(135deg) brightness(0.2) blur(5px);
    clip-path: polygon(0% 45%, 100% 47%, 100% 52%, 0% 50%);
  }
  80% {
    opacity: 0.2;
    transform: translate(-53%, -50%) scale(0.5) skewX(-25deg) skewY(-5deg);
    filter: hue-rotate(90deg) brightness(6) saturate(10) blur(8px);
    clip-path: polygon(0% 48%, 100% 49%, 100% 51%, 0% 50%);
  }
  92% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.2) skewX(30deg);
    filter: brightness(8) blur(12px);
    clip-path: polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.1) skewX(40deg) skewY(-8deg);
    filter: hue-rotate(90deg) brightness(10) saturate(15) blur(20px);
    clip-path: polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%);
  }
}

/* ═══════════════════════════════════════════════════════
   ANIMACIONES DE EFECTOS (compartidas)
   ═══════════════════════════════════════════════════════ */

@keyframes glitch-clone-cyan {
  0%, 100%   { opacity: 0; transform: translate(0, 0); }
  4%         { opacity: 0.7; transform: translate(8px, -4px); }
  8%         { opacity: 0; }
  12%        { opacity: 0.5; transform: translate(-6px, 3px); }
  16%        { opacity: 0; }
  22%        { opacity: 0.6; transform: translate(4px, -2px); }
  28%        { opacity: 0.3; transform: translate(-3px, 1px); }
  35%        { opacity: 0.15; transform: translate(2px, 0); }
  42%        { opacity: 0; }
  58%        { opacity: 0.08; transform: translate(1px, 0); }
  66%        { opacity: 0; }
}

@keyframes glitch-clone-magenta {
  0%, 100%   { opacity: 0; transform: translate(0, 0); }
  4%         { opacity: 0.6; transform: translate(-7px, 5px); }
  8%         { opacity: 0; }
  12%        { opacity: 0.4; transform: translate(5px, -3px); }
  16%        { opacity: 0; }
  22%        { opacity: 0.5; transform: translate(-3px, 2px); }
  28%        { opacity: 0.2; transform: translate(2px, -1px); }
  35%        { opacity: 0.1; transform: translate(-1px, 0); }
  42%        { opacity: 0; }
  58%        { opacity: 0.06; transform: translate(-1px, 0); }
  66%        { opacity: 0; }
}

@keyframes glitch-clone-cyan-out {
  0%         { opacity: 0; transform: translate(0, 0); }
  8%         { opacity: 0.5; transform: translate(-6px, 3px); }
  15%        { opacity: 0; }
  25%        { opacity: 0.7; transform: translate(10px, -5px); }
  35%        { opacity: 0.3; transform: translate(-8px, 4px); }
  50%        { opacity: 0.8; transform: translate(12px, -6px); }
  65%        { opacity: 0.4; transform: translate(-5px, 2px); }
  80%        { opacity: 0.9; transform: translate(15px, -8px); }
  100%       { opacity: 0; transform: translate(20px, -10px); }
}

@keyframes glitch-clone-magenta-out {
  0%         { opacity: 0; transform: translate(0, 0); }
  8%         { opacity: 0.4; transform: translate(5px, -3px); }
  15%        { opacity: 0; }
  25%        { opacity: 0.6; transform: translate(-9px, 6px); }
  35%        { opacity: 0.2; transform: translate(7px, -4px); }
  50%        { opacity: 0.7; transform: translate(-11px, 7px); }
  65%        { opacity: 0.3; transform: translate(6px, -3px); }
  80%        { opacity: 0.8; transform: translate(-14px, 9px); }
  100%       { opacity: 0; transform: translate(-18px, 12px); }
}

@keyframes scanline-sweep-1 {
  0%   { top: -5%; opacity: 0.8; }
  100% { top: 105%; opacity: 0; }
}
@keyframes scanline-sweep-2 {
  0%   { top: 110%; opacity: 0.6; }
  100% { top: -10%; opacity: 0; }
}
@keyframes scanline-sweep-3 {
  0%   { top: -5%; opacity: 0.5; }
  100% { top: 105%; opacity: 0; }
}

@keyframes scanline-sweep-out-1 {
  0%   { top: 50%; opacity: 0; }
  10%  { opacity: 1; }
  100% { top: -10%; opacity: 0; }
}
@keyframes scanline-sweep-out-2 {
  0%   { top: 50%; opacity: 0; }
  10%  { opacity: 0.8; }
  100% { top: 110%; opacity: 0; }
}

@keyframes glitch-bar-1 {
  0%        { opacity: 0; height: 0; top: 20%; }
  5%        { opacity: 0.9; height: 8px; }
  8%        { opacity: 0; }
  15%       { opacity: 0.7; height: 4px; top: 45%; }
  18%       { opacity: 0; }
  25%       { opacity: 0.5; height: 12px; top: 70%; }
  30%       { opacity: 0; }
  40%       { opacity: 0.3; height: 3px; top: 30%; }
  45%, 100% { opacity: 0; }
}
@keyframes glitch-bar-2 {
  0%        { opacity: 0; height: 0; top: 60%; }
  7%        { opacity: 0.8; height: 6px; }
  10%       { opacity: 0; }
  18%       { opacity: 0.6; height: 10px; top: 25%; }
  22%       { opacity: 0; }
  32%       { opacity: 0.4; height: 5px; top: 80%; }
  38%       { opacity: 0; }
  48%, 100% { opacity: 0; }
}

@keyframes glitch-bar-out-1 {
  0%        { opacity: 0; height: 0; top: 50%; }
  10%       { opacity: 0.8; height: 6px; top: 30%; }
  20%       { opacity: 0; }
  30%       { opacity: 0.9; height: 15px; top: 55%; }
  40%       { opacity: 0; }
  55%       { opacity: 0.7; height: 20px; top: 20%; }
  65%       { opacity: 0; }
  75%       { opacity: 1; height: 30px; top: 65%; }
  85%       { opacity: 0.5; height: 50px; top: 10%; }
  100%      { opacity: 0; height: 100%; top: 0; }
}
@keyframes glitch-bar-out-2 {
  0%        { opacity: 0; height: 0; top: 50%; }
  12%       { opacity: 0.7; height: 8px; top: 70%; }
  22%       { opacity: 0; }
  35%       { opacity: 0.8; height: 12px; top: 40%; }
  45%       { opacity: 0; }
  60%       { opacity: 0.9; height: 25px; top: 75%; }
  70%       { opacity: 0; }
  80%       { opacity: 1; height: 40px; top: 35%; }
  90%       { opacity: 0.6; height: 60px; top: 50%; }
  100%      { opacity: 0; height: 100%; top: 0; }
}

@keyframes static-flicker {
  0%   { opacity: 0.06; background-position: 0 0; }
  10%  { opacity: 0.12; background-position: 50px 30px; }
  20%  { opacity: 0.03; background-position: -20px 50px; }
  30%  { opacity: 0.09; background-position: 30px -10px; }
  40%  { opacity: 0.05; background-position: -40px 40px; }
  50%  { opacity: 0.11; background-position: 10px 20px; }
  60%  { opacity: 0.02; background-position: 60px -30px; }
  70%  { opacity: 0.08; background-position: -10px 60px; }
  80%  { opacity: 0.04; background-position: 40px 10px; }
  90%  { opacity: 0.07; background-position: 20px -50px; }
  100% { opacity: 0.03; background-position: 0 0; }
}

@keyframes static-flicker-out {
  0%   { opacity: 0.02; background-position: 0 0; }
  15%  { opacity: 0.15; background-position: -30px 20px; }
  30%  { opacity: 0.08; background-position: 40px -40px; }
  50%  { opacity: 0.25; background-position: -20px 60px; }
  65%  { opacity: 0.12; background-position: 50px -10px; }
  80%  { opacity: 0.3; background-position: -40px 30px; }
  100% { opacity: 0.4; background-position: 0 0; }
}

@keyframes digital-grid {
  0%        { opacity: 0; }
  5%        { opacity: 0.15; }
  15%       { opacity: 0.08; }
  25%       { opacity: 0.12; }
  40%       { opacity: 0.05; }
  60%, 100% { opacity: 0; }
}

@keyframes digital-grid-out {
  0%        { opacity: 0; }
  20%       { opacity: 0.05; }
  40%       { opacity: 0.12; }
  60%       { opacity: 0.08; }
  80%       { opacity: 0.2; }
  100%      { opacity: 0.3; }
}

@keyframes white-flash {
  0%        { opacity: 0; }
  3%        { opacity: 0.7; }
  5%        { opacity: 0; }
  15%       { opacity: 0.4; }
  17%       { opacity: 0; }
  28%       { opacity: 0.2; }
  30%       { opacity: 0; }
  100%      { opacity: 0; }
}

@keyframes white-flash-out {
  0%        { opacity: 0; }
  60%       { opacity: 0; }
  70%       { opacity: 0.3; }
  75%       { opacity: 0; }
  85%       { opacity: 0.5; }
  88%       { opacity: 0; }
  95%       { opacity: 0.9; }
  100%      { opacity: 1; }
}

/* ═══════════════════════════════════════════════════════
   CLASES DE ENTRADA
   ═══════════════════════════════════════════════════════ */

.glitch-overlay-enter {
  animation: glitch-overlay-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.glitch-modal-enter {
  animation: glitch-modal-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ═══════════════════════════════════════════════════════
   CLASES DE SALIDA
   ═══════════════════════════════════════════════════════ */

.glitch-overlay-exit {
  animation: glitch-overlay-out 1.2s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

.glitch-modal-exit {
  animation: glitch-modal-out 1.2s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

/* ═══════════════════════════════════════════════════════
   CLASES DE EFECTOS – ENTRADA
   ═══════════════════════════════════════════════════════ */

.glitch-clone-cyan {
  position: absolute; inset: 0; border-radius: inherit;
  mix-blend-mode: screen; z-index: 90; pointer-events: none;
  background: rgba(0, 255, 255, 0.12);
  animation: glitch-clone-cyan 1.5s ease-out forwards;
}
.glitch-clone-magenta {
  position: absolute; inset: 0; border-radius: inherit;
  mix-blend-mode: multiply; z-index: 91; pointer-events: none;
  background: rgba(255, 0, 128, 0.1);
  animation: glitch-clone-magenta 1.5s ease-out forwards;
}
.glitch-scanline-1 {
  position: absolute; left: 0; width: 100%; height: 3px;
  background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.6) 30%, rgba(0,255,255,0.3) 50%, rgba(255,255,255,0.6) 70%, transparent 95%);
  z-index: 100; pointer-events: none; mix-blend-mode: overlay;
  animation: scanline-sweep-1 0.4s linear 0s forwards;
}
.glitch-scanline-2 {
  position: absolute; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent 10%, rgba(255,0,128,0.4) 50%, transparent 90%);
  z-index: 100; pointer-events: none; mix-blend-mode: overlay; opacity: 0;
  animation: scanline-sweep-2 0.35s linear 0.15s forwards;
}
.glitch-scanline-3 {
  position: absolute; left: 0; width: 100%; height: 5px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  z-index: 100; pointer-events: none; mix-blend-mode: overlay; opacity: 0;
  animation: scanline-sweep-3 0.6s linear 0.5s forwards;
}
.glitch-bar-1 {
  position: absolute; left: -5%; width: 110%; z-index: 95; pointer-events: none;
  background: rgba(0, 255, 255, 0.2); mix-blend-mode: screen;
  animation: glitch-bar-1 1.5s ease-out forwards;
}
.glitch-bar-2 {
  position: absolute; left: -5%; width: 110%; z-index: 95; pointer-events: none;
  background: rgba(255, 0, 128, 0.15); mix-blend-mode: screen;
  animation: glitch-bar-2 1.5s ease-out forwards;
}
.glitch-noise {
  position: absolute; inset: 0; pointer-events: none; z-index: 92; border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  background-size: 200px 200px; mix-blend-mode: overlay;
  animation: static-flicker 0.15s steps(8) 10;
}
.glitch-grid {
  position: absolute; inset: 0; pointer-events: none; z-index: 93; border-radius: inherit;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
  animation: digital-grid 1.5s ease-out forwards;
}
.glitch-white-flash {
  position: absolute; inset: 0; pointer-events: none; z-index: 101; border-radius: inherit;
  background: white;
  animation: white-flash 1.5s ease-out forwards;
}

/* ═══════════════════════════════════════════════════════
   CLASES DE EFECTOS – SALIDA
   ═══════════════════════════════════════════════════════ */

.glitch-clone-cyan-out {
  position: absolute; inset: 0; border-radius: inherit;
  mix-blend-mode: screen; z-index: 90; pointer-events: none;
  background: rgba(0, 255, 255, 0.12);
  animation: glitch-clone-cyan-out 1.2s ease-in forwards;
}
.glitch-clone-magenta-out {
  position: absolute; inset: 0; border-radius: inherit;
  mix-blend-mode: multiply; z-index: 91; pointer-events: none;
  background: rgba(255, 0, 128, 0.1);
  animation: glitch-clone-magenta-out 1.2s ease-in forwards;
}
.glitch-scanline-out-1 {
  position: absolute; left: 0; width: 100%; height: 4px;
  background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.8) 30%, rgba(255,0,128,0.4) 50%, rgba(255,255,255,0.8) 70%, transparent 95%);
  z-index: 100; pointer-events: none; mix-blend-mode: overlay;
  animation: scanline-sweep-out-1 0.35s linear 0.1s forwards;
  opacity: 0;
}
.glitch-scanline-out-2 {
  position: absolute; left: 0; width: 100%; height: 4px;
  background: linear-gradient(90deg, transparent 10%, rgba(0,255,255,0.5) 50%, transparent 90%);
  z-index: 100; pointer-events: none; mix-blend-mode: overlay;
  animation: scanline-sweep-out-2 0.3s linear 0.1s forwards;
  opacity: 0;
}
.glitch-bar-out-1 {
  position: absolute; left: -5%; width: 110%; z-index: 95; pointer-events: none;
  background: rgba(0, 255, 255, 0.25); mix-blend-mode: screen;
  animation: glitch-bar-out-1 1.2s ease-in forwards;
}
.glitch-bar-out-2 {
  position: absolute; left: -5%; width: 110%; z-index: 95; pointer-events: none;
  background: rgba(255, 0, 128, 0.2); mix-blend-mode: screen;
  animation: glitch-bar-out-2 1.2s ease-in forwards;
}
.glitch-noise-out {
  position: absolute; inset: 0; pointer-events: none; z-index: 92; border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  background-size: 200px 200px; mix-blend-mode: overlay;
  animation: static-flicker-out 0.1s steps(6) 12;
}
.glitch-grid-out {
  position: absolute; inset: 0; pointer-events: none; z-index: 93; border-radius: inherit;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
  animation: digital-grid-out 1.2s ease-in forwards;
}
.glitch-white-flash-out {
  position: absolute; inset: 0; pointer-events: none; z-index: 101; border-radius: inherit;
  background: white;
  animation: white-flash-out 1.2s ease-in forwards;
}

/* ═══════════════════════════════════════════════════════
   INTERFERENCIA PERIÓDICA (idle glitch)
   ═══════════════════════════════════════════════════════ */

@keyframes idle-glitch-modal {
  0%   { transform: translate(-50%, -50%) skewX(0deg); filter: none; }
  5%   { transform: translate(-50%, -50%) skewX(-4deg) scaleY(1.008); filter: hue-rotate(60deg) brightness(1.4); }
  8%   { transform: translate(-49.2%, -50%) skewX(6deg) scaleY(0.995); filter: hue-rotate(-90deg) brightness(0.6) saturate(2.5); }
  11%  { transform: translate(-50.8%, -50%) skewX(-2deg); filter: brightness(2.2) contrast(1.8); }
  14%  { transform: translate(-50%, -49.5%) skewX(3deg) scaleX(1.003); filter: hue-rotate(180deg) brightness(0.4); }
  17%  { transform: translate(-50%, -50.3%) skewX(-1deg); filter: brightness(1.6) saturate(0.2); }
  20%  { transform: translate(-50.4%, -50%) skewX(0.5deg); filter: hue-rotate(-45deg) brightness(1.1); }
  25%  { transform: translate(-50%, -50%) skewX(0deg); filter: none; }

  /* Second micro-burst */
  55%  { transform: translate(-50%, -50%) skewX(0deg); filter: none; }
  58%  { transform: translate(-50.6%, -50%) skewX(3deg); filter: hue-rotate(120deg) brightness(1.8); }
  60%  { transform: translate(-49.5%, -50.2%) skewX(-5deg) scaleY(1.005); filter: brightness(0.3) saturate(4); }
  63%  { transform: translate(-50%, -50%) skewX(1deg); filter: brightness(1.5); }
  66%  { transform: translate(-50%, -50%) skewX(0deg); filter: none; }
  100% { transform: translate(-50%, -50%) skewX(0deg); filter: none; }
}

@keyframes idle-chromatic-red {
  0%, 24%, 54%, 67%, 100% { opacity: 0; transform: translate(0, 0); }
  5%   { opacity: 0.5; transform: translate(5px, -2px); }
  8%   { opacity: 0.7; transform: translate(-8px, 1px); }
  11%  { opacity: 0.3; transform: translate(6px, -1px); }
  17%  { opacity: 0.4; transform: translate(-3px, 0); }
  58%  { opacity: 0.6; transform: translate(7px, -2px); }
  60%  { opacity: 0.4; transform: translate(-5px, 1px); }
  63%  { opacity: 0.2; transform: translate(3px, 0); }
}

@keyframes idle-chromatic-blue {
  0%, 24%, 54%, 67%, 100% { opacity: 0; transform: translate(0, 0); }
  5%   { opacity: 0.5; transform: translate(-4px, 2px); }
  8%   { opacity: 0.6; transform: translate(7px, -1px); }
  11%  { opacity: 0.35; transform: translate(-5px, 1px); }
  17%  { opacity: 0.3; transform: translate(2px, 0); }
  58%  { opacity: 0.55; transform: translate(-6px, 2px); }
  60%  { opacity: 0.45; transform: translate(4px, -1px); }
  63%  { opacity: 0.15; transform: translate(-2px, 0); }
}

/* Horizontal tear slices */
@keyframes idle-tear-slice-1 {
  0%, 22%, 55%, 68%, 100% { clip-path: inset(0); transform: translateX(0); opacity: 0; }
  6%   { clip-path: inset(15% 0 78% 0); transform: translateX(12px); opacity: 1; }
  9%   { clip-path: inset(15% 0 78% 0); transform: translateX(-8px); opacity: 0.8; }
  13%  { clip-path: inset(15% 0 78% 0); transform: translateX(4px); opacity: 0.5; }
  59%  { clip-path: inset(35% 0 58% 0); transform: translateX(-10px); opacity: 1; }
  62%  { clip-path: inset(35% 0 58% 0); transform: translateX(6px); opacity: 0.6; }
}

@keyframes idle-tear-slice-2 {
  0%, 22%, 55%, 68%, 100% { clip-path: inset(0); transform: translateX(0); opacity: 0; }
  5%   { clip-path: inset(42% 0 48% 0); transform: translateX(-15px); opacity: 1; }
  8%   { clip-path: inset(42% 0 48% 0); transform: translateX(10px); opacity: 0.9; }
  12%  { clip-path: inset(42% 0 48% 0); transform: translateX(-5px); opacity: 0.4; }
  58%  { clip-path: inset(70% 0 22% 0); transform: translateX(13px); opacity: 1; }
  61%  { clip-path: inset(70% 0 22% 0); transform: translateX(-7px); opacity: 0.7; }
}

@keyframes idle-tear-slice-3 {
  0%, 22%, 55%, 68%, 100% { clip-path: inset(0); transform: translateX(0); opacity: 0; }
  7%   { clip-path: inset(68% 0 25% 0); transform: translateX(18px); opacity: 1; }
  10%  { clip-path: inset(68% 0 25% 0); transform: translateX(-12px); opacity: 0.7; }
  14%  { clip-path: inset(68% 0 25% 0); transform: translateX(6px); opacity: 0.3; }
  57%  { clip-path: inset(8% 0 85% 0); transform: translateX(-14px); opacity: 1; }
  60%  { clip-path: inset(8% 0 85% 0); transform: translateX(9px); opacity: 0.5; }
}

/* CRT distortion wave */
@keyframes idle-crt-wave {
  0%   { top: -15%; opacity: 0; }
  10%  { opacity: 0.9; }
  90%  { opacity: 0.9; }
  100% { top: 110%; opacity: 0; }
}

/* Digital corruption blocks */
@keyframes idle-corrupt-block-1 {
  0%, 25%, 54%, 70%, 100% { opacity: 0; }
  5%  { opacity: 0.9; background: rgba(0,255,200,0.5); top: 22%; left: 10%; width: 35%; height: 6%; }
  8%  { opacity: 0.7; background: rgba(255,0,100,0.4); top: 22%; left: 55%; width: 40%; height: 6%; }
  11% { opacity: 0.5; background: rgba(0,150,255,0.5); top: 60%; left: 5%; width: 50%; height: 4%; }
  15% { opacity: 0.3; background: rgba(255,200,0,0.3); top: 45%; left: 30%; width: 45%; height: 5%; }
  58% { opacity: 0.8; background: rgba(255,0,200,0.5); top: 75%; left: 15%; width: 30%; height: 5%; }
  62% { opacity: 0.4; background: rgba(0,255,100,0.4); top: 30%; left: 40%; width: 35%; height: 4%; }
}

@keyframes idle-corrupt-block-2 {
  0%, 25%, 54%, 70%, 100% { opacity: 0; }
  6%  { opacity: 0.8; background: rgba(255,50,50,0.5); top: 50%; left: 60%; width: 30%; height: 5%; }
  9%  { opacity: 0.6; background: rgba(50,200,255,0.4); top: 35%; left: 5%; width: 25%; height: 7%; }
  13% { opacity: 0.4; background: rgba(200,0,255,0.3); top: 80%; left: 45%; width: 40%; height: 4%; }
  59% { opacity: 0.7; background: rgba(0,255,255,0.5); top: 15%; left: 50%; width: 35%; height: 6%; }
  63% { opacity: 0.3; background: rgba(255,150,0,0.4); top: 55%; left: 10%; width: 45%; height: 5%; }
}

/* Screen flicker / brightness pulse */
@keyframes idle-screen-flicker {
  0%, 24%, 54%, 67%, 100% { opacity: 0; }
  5%  { opacity: 0.15; background: white; }
  6%  { opacity: 0; }
  8%  { opacity: 0.25; background: rgba(0,255,255,0.1); }
  9%  { opacity: 0; }
  11% { opacity: 0.1; background: white; }
  12% { opacity: 0; }
  58% { opacity: 0.2; background: white; }
  59% { opacity: 0; }
  60% { opacity: 0.12; background: rgba(255,0,128,0.1); }
  61% { opacity: 0; }
}

/* Static noise burst */
@keyframes idle-static-burst {
  0%, 23%, 53%, 68%, 100% { opacity: 0; }
  4%  { opacity: 0.2; background-position: 0 0; }
  6%  { opacity: 0.35; background-position: 30px -20px; }
  8%  { opacity: 0.15; background-position: -15px 40px; }
  10% { opacity: 0.3; background-position: 50px 10px; }
  12% { opacity: 0.1; background-position: -30px -30px; }
  15% { opacity: 0.2; background-position: 20px 50px; }
  18% { opacity: 0.05; }
  57% { opacity: 0.25; background-position: -20px 0; }
  59% { opacity: 0.4; background-position: 40px -30px; }
  61% { opacity: 0.2; background-position: -10px 20px; }
  63% { opacity: 0.3; background-position: 30px 40px; }
  65% { opacity: 0.08; }
}

/* Horizontal sync loss lines */
@keyframes idle-hsync-line {
  0%   { top: -4px; opacity: 0; }
  100% { top: calc(100% + 4px); opacity: 0; }
}

@keyframes idle-hsync-opacity {
  0%, 100% { opacity: 0; }
  10% { opacity: 0.8; }
  50% { opacity: 1; }
  90% { opacity: 0.8; }
}

/* Classes for idle interference */
.idle-glitch-active {
  animation: idle-glitch-modal 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) forwards !important;
}

.idle-chromatic-red {
  position: absolute; inset: 0; border-radius: inherit;
  mix-blend-mode: screen; z-index: 90; pointer-events: none;
  background: rgba(255, 30, 30, 0.12);
  animation: idle-chromatic-red 0.7s ease-out forwards;
}

.idle-chromatic-blue {
  position: absolute; inset: 0; border-radius: inherit;
  mix-blend-mode: screen; z-index: 90; pointer-events: none;
  background: rgba(30, 80, 255, 0.12);
  animation: idle-chromatic-blue 0.7s ease-out forwards;
}

.idle-tear-slice-1 {
  position: absolute; inset: 0; border-radius: inherit;
  z-index: 96; pointer-events: none;
  background: inherit; mix-blend-mode: difference;
  animation: idle-tear-slice-1 0.7s ease-out forwards;
}

.idle-tear-slice-2 {
  position: absolute; inset: 0; border-radius: inherit;
  z-index: 96; pointer-events: none;
  background: inherit; mix-blend-mode: exclusion;
  animation: idle-tear-slice-2 0.7s ease-out forwards;
}

.idle-tear-slice-3 {
  position: absolute; inset: 0; border-radius: inherit;
  z-index: 96; pointer-events: none;
  background: inherit; mix-blend-mode: difference;
  animation: idle-tear-slice-3 0.7s ease-out forwards;
}

.idle-crt-wave {
  position: absolute; left: -5%; width: 110%; height: 25%;
  z-index: 97; pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255,255,255,0.03) 15%,
    rgba(0,255,255,0.06) 30%,
    rgba(255,255,255,0.12) 45%,
    rgba(255,0,128,0.08) 55%,
    rgba(255,255,255,0.06) 70%,
    rgba(0,255,200,0.04) 85%,
    transparent 100%
  );
  animation: idle-crt-wave 0.5s linear forwards;
  mix-blend-mode: overlay;
}

.idle-corrupt-block-1 {
  position: absolute; z-index: 98; pointer-events: none;
  border-radius: 2px; mix-blend-mode: screen;
  animation: idle-corrupt-block-1 0.7s steps(1) forwards;
}

.idle-corrupt-block-2 {
  position: absolute; z-index: 98; pointer-events: none;
  border-radius: 2px; mix-blend-mode: screen;
  animation: idle-corrupt-block-2 0.7s steps(1) forwards;
}

.idle-screen-flicker {
  position: absolute; inset: 0; z-index: 99; pointer-events: none;
  border-radius: inherit;
  animation: idle-screen-flicker 0.7s ease-out forwards;
}

.idle-static-burst {
  position: absolute; inset: 0; z-index: 92; pointer-events: none;
  border-radius: inherit; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 150px 150px;
  animation: idle-static-burst 0.7s steps(10) forwards;
}

.idle-hsync-line {
  position: absolute; left: -5%; width: 110%; height: 3px;
  z-index: 100; pointer-events: none;
  background: linear-gradient(90deg,
    transparent 5%,
    rgba(255,255,255,0.7) 20%,
    rgba(0,255,255,0.4) 40%,
    rgba(255,0,128,0.3) 60%,
    rgba(255,255,255,0.7) 80%,
    transparent 95%
  );
  mix-blend-mode: overlay;
  animation: idle-hsync-line 0.25s linear forwards, idle-hsync-opacity 0.25s ease forwards;
}

.idle-hsync-line-2 {
  position: absolute; left: -5%; width: 110%; height: 2px;
  z-index: 100; pointer-events: none;
  background: linear-gradient(90deg,
    transparent 10%,
    rgba(255,200,0,0.5) 30%,
    rgba(0,255,200,0.3) 50%,
    rgba(255,200,0,0.5) 70%,
    transparent 90%
  );
  mix-blend-mode: overlay;
  animation: idle-hsync-line 0.3s linear 0.08s forwards, idle-hsync-opacity 0.3s ease 0.08s forwards;
}
`;

const IDLE_GLITCH_DURATION = 700;
const IDLE_GLITCH_MIN_INTERVAL = 3500;
const IDLE_GLITCH_MAX_INTERVAL = 7000;

const AboutModal = ({ open, onOpenChange }) => {
  // Estado interno: mantiene el modal visible durante la animación de cierre
  const [internalOpen, setInternalOpen] = useState(false);
  const [phase, setPhase] = useState('closed'); // 'closed' | 'entering' | 'open' | 'exiting'
  const [idleGlitching, setIdleGlitching] = useState(false);
  const idleGlitchKey = useRef(0);
  const effectKey = useRef(0);
  const exitTimerRef = useRef(null);
  const enterTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const idleGlitchEndRef = useRef(null);

  // Cuando el padre pide abrir → animación de entrada
  useEffect(() => {
    if (open && phase === 'closed') {
      effectKey.current += 1;
      setInternalOpen(true);
      setPhase('entering');
      enterTimerRef.current = setTimeout(() => setPhase('open'), ENTER_DURATION + 300);
    }
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [open]);

  // Cuando el padre pide cerrar → animación de salida
  useEffect(() => {
    if (!open && (phase === 'open' || phase === 'entering')) {
      effectKey.current += 1;
      setPhase('exiting');
      exitTimerRef.current = setTimeout(() => {
        setInternalOpen(false);
        setPhase('closed');
      }, EXIT_DURATION + 100);
    }
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [open]);

  // Interferencia periódica mientras el modal está abierto
  useEffect(() => {
    if (phase !== 'open') {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (idleGlitchEndRef.current) clearTimeout(idleGlitchEndRef.current);
      setIdleGlitching(false);
      return;
    }

    const scheduleNext = () => {
      const delay = IDLE_GLITCH_MIN_INTERVAL + Math.random() * (IDLE_GLITCH_MAX_INTERVAL - IDLE_GLITCH_MIN_INTERVAL);
      idleTimerRef.current = setTimeout(() => {
        idleGlitchKey.current += 1;
        setIdleGlitching(true);
        idleGlitchEndRef.current = setTimeout(() => {
          setIdleGlitching(false);
          scheduleNext();
        }, IDLE_GLITCH_DURATION);
      }, delay);
    };

    scheduleNext();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (idleGlitchEndRef.current) clearTimeout(idleGlitchEndRef.current);
    };
  }, [phase]);

  // Interceptar el cierre del dialog para lanzar la animación
  const handleOpenChange = useCallback((newOpen) => {
    if (!newOpen) {
      // No cerramos inmediatamente: le decimos al padre que cierre
      // y el useEffect de arriba arrancará la animación de salida
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const isEntering = phase === 'entering';
  const isExiting = phase === 'exiting';

  return (
    <>
      <style>{glitchStyles}</style>
      <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isEntering ? 'glitch-overlay-enter' : ''
              } ${isExiting ? 'glitch-overlay-exit' : ''}`}
          />

          <DialogContent
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[425px] bg-white dark:bg-slate-800 dark:text-gray-200 rounded-2xl p-6 shadow-2xl overflow-hidden ${isEntering ? 'glitch-modal-enter' : ''
              } ${isExiting ? 'glitch-modal-exit' : ''} ${idleGlitching ? 'idle-glitch-active' : ''}`}
            onEscapeKeyDown={(e) => { if (isExiting) e.preventDefault(); }}
            onPointerDownOutside={(e) => { if (isExiting) e.preventDefault(); }}
          >
            {/* Capas de interferencia – ENTRADA */}
            {isEntering && (
              <div key={`enter-${effectKey.current}`}>
                <div className="glitch-white-flash" />
                <div className="glitch-clone-cyan" />
                <div className="glitch-clone-magenta" />
                <div className="glitch-scanline-1" />
                <div className="glitch-scanline-2" />
                <div className="glitch-scanline-3" />
                <div className="glitch-bar-1" />
                <div className="glitch-bar-2" />
                <div className="glitch-noise" />
                <div className="glitch-grid" />
              </div>
            )}

            {/* Capas de interferencia – SALIDA */}
            {isExiting && (
              <div key={`exit-${effectKey.current}`}>
                <div className="glitch-white-flash-out" />
                <div className="glitch-clone-cyan-out" />
                <div className="glitch-clone-magenta-out" />
                <div className="glitch-scanline-out-1" />
                <div className="glitch-scanline-out-2" />
                <div className="glitch-bar-out-1" />
                <div className="glitch-bar-out-2" />
                <div className="glitch-noise-out" />
                <div className="glitch-grid-out" />
              </div>
            )}

            {/* Capas de interferencia periódica – IDLE */}
            {idleGlitching && (
              <div key={`idle-${idleGlitchKey.current}`}>
                <div className="idle-chromatic-red" />
                <div className="idle-chromatic-blue" />
                <div className="idle-tear-slice-1" />
                <div className="idle-tear-slice-2" />
                <div className="idle-tear-slice-3" />
                <div className="idle-crt-wave" />
                <div className="idle-corrupt-block-1" />
                <div className="idle-corrupt-block-2" />
                <div className="idle-screen-flicker" />
                <div className="idle-static-burst" />
                <div className="idle-hsync-line" />
                <div className="idle-hsync-line-2" />
              </div>
            )}

            <DialogHeader>
              <DialogTitle className="text-3xl font-bold gradient-text">Soy Edu Torregrosa</DialogTitle>
            </DialogHeader>

            <DialogDescription asChild>
              <div className="py-4 text-center">
                <img
                  src="/images/edu.webp"
                  alt="Edu Torregrosa"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-200"
                />
                <p className="text-gray-600 leading-relaxed">
                  Profesor de Informática con más de 15 años de experiencia en ESO, bachillerato y FP. Tengo varios canales de YouTube, uno de videotutoriales y cursos gratuitos (Aula en la nube), y otro donde enseño a docentes a usar la IA en el aula (IA para docentes).
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Mi propósito: aportar mi granito de arena en mejorar la educación.
                </p>
                <div className="flex justify-center items-center space-x-6 my-6">
                  <a href="https://instagram.com/edutorregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors">
                    <Instagram size={28} />
                  </a>
                  <a href="https://youtube.com/c/aulaenlanube" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600 transition-colors">
                    <Youtube size={32} />
                  </a>
                  <a href="https://x.com/_edu_torregrosa" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                    <IconXSocial size={24} />
                  </a>
                  <a href="https://www.linkedin.com/in/edutorregrosa/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors">
                    <Linkedin size={28} />
                  </a>
                </div>
              </div>
            </DialogDescription>

            <DialogFooter>
              <a href="https://edutorregrosa.com/" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Ver web personal
                </Button>
              </a>
            </DialogFooter>

            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </DialogContent>
        </DialogPrimitive.Portal>
      </Dialog>
    </>
  );
};

export default AboutModal;