// Post-proceso de BLOOM SELECTIVO (solo tier alto, Q.bloom). Patrón clásico de
// three.js con dos composers y SIN @react-three/postprocessing (todo desde
// three/examples/jsm, ya en node_modules):
//   1) pasada de bloom: se oscurecen a negro los objetos que NO están en
//      BLOOM_LAYER, se renderiza y se aplica UnrealBloomPass → textura de glow.
//   2) pasada final: render normal + mezcla adit. del glow + OutputPass (aplica
//      tone mapping ACES UNA sola vez). Así los prismas de palabra (fuera de la
//      capa bloom) conservan el texto nítido y solo brillan halos/orbes/FX/estrellas.
// Se ejecuta en useFrame con priority=1 → r3f deja de auto-renderizar y este
// componente toma el control del render loop.
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { BLOOM_LAYER } from '../engine/config';

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);

export default function Effects({ strength = 0.9, radius = 0.55, threshold = 0.1 }) {
  const { gl, scene, camera, size } = useThree();
  // fog:false → en la pasada de bloom el cielo/suelo oscurecidos dan negro PURO
  // (sin teñirse por la niebla), evitando un velo de glow uniforme en el fondo.
  const dark = useMemo(() => new THREE.MeshBasicMaterial({ color: 'black', fog: false }), []);
  const store = useMemo(() => new Map(), []);

  const ctx = useMemo(() => {
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), strength, radius, threshold);
    const bloomComposer = new EffectComposer(gl);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const mixPass = new ShaderPass(new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main(){ gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv); }',
    }), 'baseTexture');
    mixPass.needsSwap = true;

    const outputPass = new OutputPass();
    const finalComposer = new EffectComposer(gl);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(mixPass);
    finalComposer.addPass(outputPass);

    return { bloomComposer, finalComposer, bloomPass, mixPass, outputPass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    const pr = gl.getPixelRatio();
    ctx.bloomComposer.setPixelRatio(pr);
    ctx.finalComposer.setPixelRatio(pr);
    ctx.bloomComposer.setSize(size.width, size.height);
    ctx.finalComposer.setSize(size.width, size.height);
    ctx.bloomPass.setSize(size.width, size.height);
  }, [ctx, gl, size]);

  // EffectComposer.dispose() NO libera los passes añadidos (solo sus RTs y copyPass),
  // así que liberamos cada pass a mano para no fugar materiales/FullScreenQuads al
  // remontar el Canvas (cambio de tier / recuperación de contexto WebGL).
  useEffect(() => () => {
    ctx.bloomComposer.dispose();
    ctx.finalComposer.dispose();
    ctx.bloomPass.dispose();
    ctx.mixPass.dispose();
    ctx.outputPass.dispose();
    dark.dispose();
  }, [ctx, dark]);

  const darken = (obj) => {
    if ((obj.isMesh || obj.isPoints) && obj.material && !bloomLayer.test(obj.layers)) {
      store.set(obj, obj.material);
      obj.material = dark;
    }
  };
  const restore = (obj) => {
    const m = store.get(obj);
    if (m) { obj.material = m; store.delete(obj); }
  };

  useFrame(() => {
    scene.traverse(darken);
    try {
      ctx.bloomComposer.render();
    } finally {
      scene.traverse(restore); // garantiza reponer materiales aunque render() lance
    }
    ctx.finalComposer.render();
  }, 1);

  return null;
}
