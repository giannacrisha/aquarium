import * as THREE from 'three';

export const TANK = {
  width: 10,
  height: 6,
  depth: 7,
  floorY: -3,
};

// Shared glass material
function makeGlass(opacity = 0.12) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity,
    roughness: 0,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// Shared frame material
function makeFrame() {
  return new THREE.MeshStandardMaterial({
    color: 0x334455,
    roughness: 0.4,
    metalness: 0.8,
  });
}

/**
 * Build a rectangular aquarium: 4 glass walls + floor
 */
function buildRectangle() {
  const group = new THREE.Group();
  const { width: W, height: H, depth: D, floorY } = TANK;
  const glass = makeGlass();
  const frame = makeFrame();
  const thickness = 0.08;

  const panels = [
    // Front wall
    { w: W, h: H, pos: [0, 0, D / 2], ry: 0 },
    // Back wall
    { w: W, h: H, pos: [0, 0, -D / 2], ry: Math.PI },
    // Left wall
    { w: D, h: H, pos: [-W / 2, 0, 0], ry: Math.PI / 2 },
    // Right wall
    { w: D, h: H, pos: [W / 2, 0, 0], ry: -Math.PI / 2 },
  ];

  panels.forEach(({ w, h, pos, ry }) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, glass.clone());
    mesh.position.set(...pos);
    mesh.rotation.y = ry;
    group.add(mesh);

    // Frame edge bars
    const barGeo = new THREE.BoxGeometry(w + thickness * 2, thickness, thickness);
    const topBar = new THREE.Mesh(barGeo, frame);
    topBar.position.set(pos[0], floorY + H, pos[2]);
    topBar.rotation.y = ry;
    group.add(topBar);
  });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(W, D);
  const floorMesh = new THREE.Mesh(floorGeo, makeGlass(0.05));
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = floorY;
  group.add(floorMesh);

  group.userData.shape = 'rectangle';
  return group;
}

/**
 * Build a cylindrical aquarium
 */
function buildCylinder() {
  const group = new THREE.Group();
  const { height: H, floorY } = TANK;
  const radius = 4;
  const glass = makeGlass(0.1);

  // Side wall (open-ended cylinder)
  const sideGeo = new THREE.CylinderGeometry(radius, radius, H, 48, 1, true);
  const side = new THREE.Mesh(sideGeo, glass);
  side.position.y = 0;
  group.add(side);

  // Circular floor
  const diskGeo = new THREE.CircleGeometry(radius, 48);
  const disk = new THREE.Mesh(diskGeo, makeGlass(0.05));
  disk.rotation.x = -Math.PI / 2;
  disk.position.y = floorY;
  group.add(disk);

  // Top rim
  const rimGeo = new THREE.TorusGeometry(radius, 0.06, 8, 48);
  const rim = new THREE.Mesh(rimGeo, makeFrame());
  rim.position.y = H / 2;
  group.add(rim);

  // Bottom rim
  const rimBot = rim.clone();
  rimBot.position.y = floorY;
  group.add(rimBot);

  group.userData.shape = 'cylinder';
  return group;
}

/**
 * Build a hexagonal aquarium
 */
function buildHexagon() {
  const group = new THREE.Group();
  const { height: H, floorY } = TANK;
  const glass = makeGlass();
  const frame = makeFrame();
  const r = 4; // circumradius
  const sides = 6;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + Math.PI / 6;
    const nextAngle = ((i + 1) / sides) * Math.PI * 2 + Math.PI / 6;
    const midAngle = (angle + nextAngle) / 2;

    // Panel width = chord length
    const x1 = Math.cos(angle) * r;
    const z1 = Math.sin(angle) * r;
    const x2 = Math.cos(nextAngle) * r;
    const z2 = Math.sin(nextAngle) * r;
    const chord = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);

    const geo = new THREE.PlaneGeometry(chord, H);
    const mesh = new THREE.Mesh(geo, glass.clone());
    mesh.position.set(
      Math.cos(midAngle) * r,
      0,
      Math.sin(midAngle) * r
    );
    mesh.rotation.y = -midAngle;
    group.add(mesh);

    // Vertical corner bar
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, H + 0.1, 6);
    const bar = new THREE.Mesh(barGeo, frame);
    bar.position.set(x1, 0, z1);
    group.add(bar);
  }

  // Hexagonal floor using Shape
  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(angle) * (r - 0.01);
    const z = Math.sin(angle) * (r - 0.01);
    i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z);
  }
  shape.closePath();
  const floorGeo = new THREE.ShapeGeometry(shape);
  const floorMesh = new THREE.Mesh(floorGeo, makeGlass(0.05));
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = floorY;
  group.add(floorMesh);

  group.userData.shape = 'hexagon';
  return group;
}

/**
 * Build a bow-front aquarium (curved front, flat sides/back)
 */
function buildBowfront() {
  const group = new THREE.Group();
  const { width: W, height: H, depth: D, floorY } = TANK;
  const glass = makeGlass();
  const frame = makeFrame();

  // Curved front panel using cylinder segment
  const frontRadius = W * 0.85;
  const arcAngle = Math.asin((W / 2) / frontRadius) * 2;
  const frontGeo = new THREE.CylinderGeometry(
    frontRadius, frontRadius, H,
    32, 1, true,
    Math.PI / 2 - arcAngle / 2,
    arcAngle
  );
  const front = new THREE.Mesh(frontGeo, makeGlass(0.1));
  const frontZ = Math.sqrt(frontRadius ** 2 - (W / 2) ** 2);
  front.position.set(0, 0, D / 2 - (frontRadius - frontZ));
  front.rotation.y = Math.PI;
  group.add(front);

  // Back wall (flat)
  const backGeo = new THREE.PlaneGeometry(W, H);
  const back = new THREE.Mesh(backGeo, glass.clone());
  back.position.set(0, 0, -D / 2);
  back.rotation.y = Math.PI;
  group.add(back);

  // Side walls (flat)
  [-1, 1].forEach(sign => {
    const sideGeo = new THREE.PlaneGeometry(D * 0.85, H);
    const side = new THREE.Mesh(sideGeo, glass.clone());
    side.position.set(sign * W / 2, 0, -D * 0.05);
    side.rotation.y = sign * Math.PI / 2;
    group.add(side);
  });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(W, D);
  const floorMesh = new THREE.Mesh(floorGeo, makeGlass(0.05));
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = floorY;
  group.add(floorMesh);

  // Top rim bar
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.1, 0.08, 0.08),
    frame
  );
  topBar.position.set(0, H / 2, -D / 2);
  group.add(topBar);

  group.userData.shape = 'bowfront';
  return group;
}

/**
 * Main factory: creates and returns the aquarium group based on shape name.
 * Also adds a water volume plane and edge frames.
 */
export function buildAquarium(shape = 'rectangle') {
  const group = new THREE.Group();

  let tank;
  switch (shape) {
    case 'cylinder': tank = buildCylinder(); break;
    case 'hexagon':  tank = buildHexagon();  break;
    case 'bowfront': tank = buildBowfront(); break;
    default:         tank = buildRectangle(); break;
  }
  group.add(tank);

  // Water surface (top of tank)
  const waterY = TANK.floorY + TANK.height - 0.1;
  const waterGeo = new THREE.PlaneGeometry(TANK.width * 0.98, TANK.depth * 0.98, 32, 32);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0055aa,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const waterSurface = new THREE.Mesh(waterGeo, waterMat);
  waterSurface.rotation.x = -Math.PI / 2;
  waterSurface.position.y = waterY;
  waterSurface.userData.isWater = true;
  group.add(waterSurface);
  group.userData.waterSurface = waterSurface;

  return group;
}

/**
 * Animate water surface ripple
 */
export function animateWater(aquariumGroup, time) {
  const water = aquariumGroup.userData.waterSurface;
  if (!water) return;
  const pos = water.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, Math.sin(x * 1.5 + time * 1.2) * 0.04 + Math.sin(z * 1.2 + time) * 0.03);
  }
  pos.needsUpdate = true;
}

/**
 * Returns tank floor plane for raycasting (so items can be placed on click)
 */
export function getTankFloorPlane() {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(TANK.width, TANK.depth),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
  );
}
