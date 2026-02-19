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
`;

const AboutModal = ({ open, onOpenChange }) => {
  // Estado interno: mantiene el modal visible durante la animación de cierre
  const [internalOpen, setInternalOpen] = useState(false);
  const [phase, setPhase] = useState('closed'); // 'closed' | 'entering' | 'open' | 'exiting'
  const effectKey = useRef(0);
  const exitTimerRef = useRef(null);
  const enterTimerRef = useRef(null);

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
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[425px] bg-white rounded-2xl p-6 shadow-2xl overflow-hidden ${isEntering ? 'glitch-modal-enter' : ''
              } ${isExiting ? 'glitch-modal-exit' : ''}`}
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