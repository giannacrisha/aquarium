import * as THREE from 'three';
import { TANK } from './aquarium.js';

// ─── Lighting ─────────────────────────────────────────────────────────────────

export function setupLights(scene) {
  // Soft blue ambient
  const ambient = new THREE.AmbientLight(0x88ccff, 0.5);
  scene.add(ambient);

  // Main directional (sun from above-front)
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(3, 14, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  // Underwater blue-cyan fill
  const fill = new THREE.PointLight(0x0088ff, 1.2, 22);
  fill.position.set(0, TANK.floorY + TANK.height - 0.5, 0);
  scene.add(fill);

  // Warm accent from front
  const front = new THREE.PointLight(0x44aaff, 0.6, 15);
  front.position.set(0, TANK.floorY + TANK.height * 0.5, TANK.depth / 2 + 2);
  scene.add(front);

  return { ambient, sun, fill, front };
}

// ─── Caustics (animated light pattern on floor) ───────────────────────────────

export function createCausticsPlane() {
  const geo = new THREE.PlaneGeometry(TANK.width * 1.1, TANK.depth * 1.1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = TANK.floorY + 0.02;
  mesh.name = 'caustics';
  return mesh;
}

export function animateCaustics(causticsMesh, time) {
  if (!causticsMesh) return;
  // Pulse opacity for shimmer effect
  causticsMesh.material.opacity = 0.04 + Math.sin(time * 1.8) * 0.025 + Math.sin(time * 2.7 + 1) * 0.015;
}

// ─── Substrate (tank floor) ───────────────────────────────────────────────────

export function createSubstrate(color = '#c4a882') {
  const { width: W, depth: D, floorY } = TANK;

  // Main substrate plane
  const geo = new THREE.PlaneGeometry(W - 0.2, D - 0.2, 40, 40);

  // Gently undulate vertices for a natural look
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i); // PlaneGeometry uses Y before rotation
    pos.setZ(i,
      Math.sin(x * 1.4 + 0.5) * 0.04 +
      Math.sin(z * 1.7 + 1.2) * 0.03 +
      Math.sin(x * 3.1 + z * 2.4) * 0.02
    );
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 1.0,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = floorY + 0.01;
  mesh.receiveShadow = true;
  mesh.name = 'substrate';
  return mesh;
}

export function setSubstrateColor(substrateMesh, color) {
  if (!substrateMesh) return;
  substrateMesh.material.color.set(color);
}

// ─── Bubble Particle System ───────────────────────────────────────────────────

const BUBBLE_COUNT = 280;

export function createBubbles() {
  const { width: W, depth: D, floorY, height: H } = TANK;

  const positions = new Float32Array(BUBBLE_COUNT * 3);
  const speeds = new Float32Array(BUBBLE_COUNT);
  const offsets = new Float32Array(BUBBLE_COUNT);
  const sizes = new Float32Array(BUBBLE_COUNT);

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    // Random position on floor within tank (rough approximation)
    positions[i * 3]     = (Math.random() - 0.5) * (W - 1);
    positions[i * 3 + 1] = floorY + Math.random() * H; // random start height
    positions[i * 3 + 2] = (Math.random() - 0.5) * (D - 1);
    speeds[i]  = 0.4 + Math.random() * 0.8;
    offsets[i] = Math.random() * Math.PI * 2;
    sizes[i]   = 0.8 + Math.random() * 1.6;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xaaddff,
    size: 0.08,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  points.name = 'bubbles';
  points.userData = { speeds, offsets };

  return points;
}

export function animateBubbles(bubbles, delta) {
  if (!bubbles || !bubbles.visible) return;
  const { floorY, height: H } = TANK;
  const positions = bubbles.geometry.attributes.position;
  const { speeds, offsets } = bubbles.userData;

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    let y = positions.getY(i);
    y += speeds[i] * delta * 0.001;
    // Gentle horizontal drift
    const t = (y - floorY) / H;
    const x = positions.getX(i) + Math.sin(t * 4 + offsets[i]) * 0.003;

    if (y > floorY + H) {
      // Reset to floor
      y = floorY + Math.random() * 0.3;
    }
    positions.setXYZ(i, x, y, positions.getZ(i));
  }
  positions.needsUpdate = true;
}

// ─── Scene background / fog ───────────────────────────────────────────────────

export const WATER_PRESETS = {
  ocean:      { bg: '#001a33', fog: '#003366', water: '#004488' },
  tropical:   { bg: '#00264d', fog: '#0055aa', water: '#0066cc' },
  deepsea:    { bg: '#000a1a', fog: '#001133', water: '#002255' },
  freshwater: { bg: '#0d2b1a', fog: '#1a5c35', water: '#2a7a50' },
  sunset:     { bg: '#1a1035', fog: '#4a1060', water: '#5a2070' },
};

export function applyWaterPreset(scene, presetKey) {
  const preset = WATER_PRESETS[presetKey] || WATER_PRESETS.ocean;
  scene.background = new THREE.Color(preset.bg);
  if (scene.fog) {
    scene.fog.color.set(preset.fog);
  }
  return preset;
}

export function setupFog(scene) {
  scene.fog = new THREE.FogExp2(0x003366, 0.018);
}

export function setFogEnabled(scene, enabled) {
  if (scene.fog) {
    scene.fog.density = enabled ? 0.018 : 0;
  }
}
