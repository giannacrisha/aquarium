import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { TANK, buildAquarium, animateWater, getTankFloorPlane } from './aquarium.js';
import { Fish } from './fish.js';
import { buildDecoration, getLabel, animateDecorations } from './decorations.js';
import {
  setupLights, createSubstrate, setSubstrateColor,
  createBubbles, animateBubbles,
  createCausticsPlane, animateCaustics,
  setupFog, setFogEnabled,
} from './environment.js';
import { exportPNG, shareAquarium } from './exporter.js';
import {
  showToast, initShapePanel, initWaterPresets, initSubstratePresets,
  initEffectToggles, initTabs, initItemCards, initSelectionBar,
  showSelectionBar, hideSelectionBar, initExportButtons,
} from './ui.js';

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  tankShape: 'rectangle',
  items: [],          // { id, type, category, mesh, fishRef? }
  selected: null,     // id of selected item
  nextId: 1,
};

// ─── Scene Setup ──────────────────────────────────────────────────────────────

const canvas = document.getElementById('aquarium-canvas');
const container = document.getElementById('canvas-container');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,  // required for PNG export
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#001a33');
setupFog(scene);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
camera.position.set(0, 9, 18);
camera.lookAt(0, 0, 0);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 35;
controls.maxPolarAngle = Math.PI * 0.78;
controls.target.set(0, 0, 0);

// ─── Environment ──────────────────────────────────────────────────────────────

setupLights(scene);

let substrateMesh = createSubstrate('#c4a882');
scene.add(substrateMesh);

const bubbles = createBubbles();
scene.add(bubbles);

const caustics = createCausticsPlane();
scene.add(caustics);

// ─── Aquarium Tank ────────────────────────────────────────────────────────────

let aquariumGroup = buildAquarium(state.tankShape);
scene.add(aquariumGroup);

// Invisible floor plane for raycasting (item placement)
const floorPlane = getTankFloorPlane();
floorPlane.rotation.x = -Math.PI / 2;
floorPlane.position.y = TANK.floorY + 0.05;
scene.add(floorPlane);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rebuildTank(shape) {
  scene.remove(aquariumGroup);
  aquariumGroup = buildAquarium(shape);
  scene.add(aquariumGroup);
}

function getItemById(id) {
  return state.items.find(item => item.id === id) || null;
}

function selectItem(id) {
  // Deselect previous
  if (state.selected !== null) {
    const prev = getItemById(state.selected);
    if (prev) {
      prev.mesh.traverse(child => {
        if (child.isMesh) child.material.emissive?.set(0x000000);
      });
    }
  }

  state.selected = id;
  if (id === null) {
    hideSelectionBar();
    return;
  }

  const item = getItemById(id);
  if (!item) return;

  // Highlight selected item
  item.mesh.traverse(child => {
    if (child.isMesh && child.material.emissive) {
      child.material.emissive.set(0x334455);
    }
  });

  showSelectionBar(getLabel(item.type));
}

function removeItem(id) {
  const item = getItemById(id);
  if (!item) return;
  scene.remove(item.mesh);
  state.items = state.items.filter(i => i.id !== id);
  if (state.selected === id) {
    state.selected = null;
    hideSelectionBar();
  }
}

function addItem(type, category) {
  const id = state.nextId++;
  let mesh;

  if (category === 'fish') {
    const fish = new Fish(type);
    mesh = fish.mesh;
    mesh.userData.itemId = id;
    scene.add(mesh);
    state.items.push({ id, type, category, mesh, fishRef: fish });
  } else {
    mesh = buildDecoration(type);
    mesh.userData.itemId = id;

    // Place at center of tank floor, slightly above substrate
    mesh.position.set(
      (Math.random() - 0.5) * (TANK.width - 2),
      TANK.floorY + 0.01,
      (Math.random() - 0.5) * (TANK.depth - 2)
    );
    scene.add(mesh);
    state.items.push({ id, type, category, mesh });
  }

  showToast(`${getLabel(type)} added!`);
  return id;
}

// ─── Raycaster (click to select items) ───────────────────────────────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getClickedItem(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const meshes = [];
  state.items.forEach(item => {
    item.mesh.traverse(child => {
      if (child.isMesh) meshes.push(child);
    });
  });

  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length === 0) return null;

  // Walk up to find item root
  let obj = hits[0].object;
  while (obj) {
    if (obj.userData.itemId !== undefined) return obj.userData.itemId;
    obj = obj.parent;
  }
  return null;
}

renderer.domElement.addEventListener('click', event => {
  const itemId = getClickedItem(event);
  if (itemId !== null) {
    selectItem(itemId);
  } else {
    selectItem(null);
  }
});

// ─── Resize Handler ───────────────────────────────────────────────────────────

function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', onResize);
onResize();

// ─── UI Initialization ────────────────────────────────────────────────────────

initTabs();

initShapePanel(shape => {
  state.tankShape = shape;
  rebuildTank(shape);
});

initWaterPresets(({ bg, fog, water }) => {
  scene.background.set(bg);
  if (scene.fog) scene.fog.color.set(fog);
  // Update water surface color
  aquariumGroup.traverse(child => {
    if (child.userData.isWater) child.material.color.set(water);
  });
});

initSubstratePresets(color => {
  scene.remove(substrateMesh);
  substrateMesh = createSubstrate(color);
  scene.add(substrateMesh);
});

initEffectToggles({
  onBubblesToggle: enabled => { bubbles.visible = enabled; },
  onCausticsToggle: enabled => { caustics.visible = enabled; },
  onFogToggle: enabled => setFogEnabled(scene, enabled),
});

initItemCards((type, category) => {
  addItem(type, category);
});

initSelectionBar({
  onRemove: () => {
    if (state.selected !== null) removeItem(state.selected);
  },
  onRotate: () => {
    const item = getItemById(state.selected);
    if (item) item.mesh.rotation.y += Math.PI / 6;
  },
  onScaleUp: () => {
    const item = getItemById(state.selected);
    if (item) {
      const s = item.mesh.scale.x;
      if (s < 2.5) item.mesh.scale.setScalar(s * 1.2);
    }
  },
  onScaleDown: () => {
    const item = getItemById(state.selected);
    if (item) {
      const s = item.mesh.scale.x;
      if (s > 0.3) item.mesh.scale.setScalar(s * 0.85);
    }
  },
  onDeselect: () => selectItem(null),
});

initExportButtons({
  onExport: () => exportPNG(renderer, scene, camera),
  onShare: () => shareAquarium(renderer, scene, camera, showToast),
});

// ─── Render Loop ──────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta() * 1000; // ms
  const elapsed = clock.getElapsedTime();

  // Update fish
  state.items.forEach(item => {
    if (item.fishRef) item.fishRef.update(delta);
  });

  // Update decorations (waving anemone tentacles, seagrass, etc.)
  animateDecorations(state.items, elapsed);

  // Water surface ripple
  animateWater(aquariumGroup, elapsed);

  // Bubbles
  animateBubbles(bubbles, delta);

  // Caustics
  animateCaustics(caustics, elapsed);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ─── Starter scene: add a couple of fish so the tank isn't empty ──────────────

setTimeout(() => {
  addItem('clownfish', 'fish');
  addItem('bluetang', 'fish');
  addItem('braincoral', 'coral');
  addItem('rock', 'decor');
}, 100);
