import * as THREE from 'three';

// ─── Material helpers ─────────────────────────────────────────────────────────

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...opts });
}

// ─── Coral builders ───────────────────────────────────────────────────────────

/** Brain Coral — sphere with torus ring grooves */
function buildBrainCoral() {
  const group = new THREE.Group();
  const color = 0xcc8855;

  const bodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
  const body = new THREE.Mesh(bodyGeo, mat(color));
  body.castShadow = true;
  group.add(body);

  // Surface ridges
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI;
    const rGeo = new THREE.TorusGeometry(0.28, 0.035, 6, 24);
    const ring = new THREE.Mesh(rGeo, mat(0xaa6633));
    ring.rotation.x = angle;
    ring.rotation.z = angle * 0.7;
    group.add(ring);
  }
  return group;
}

/** Staghorn Coral — branching cylinders */
function buildStaghorn() {
  const group = new THREE.Group();
  const color = 0xffbbaa;

  function addBranch(parent, from, direction, len, radius, depth) {
    if (depth === 0) return;
    const geo = new THREE.CylinderGeometry(radius * 0.6, radius, len, 7);
    const mesh = new THREE.Mesh(geo, mat(color));

    const axis = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    mesh.position.copy(from).addScaledVector(axis, len / 2);
    parent.add(mesh);

    if (depth > 1) {
      const tip = from.clone().addScaledVector(axis, len);
      const spread = 0.55;
      for (let i = 0; i < 2; i++) {
        const angle = (i / 2) * Math.PI * 2 + Math.random() * 0.5;
        const newDir = new THREE.Vector3(
          Math.sin(angle) * spread + direction.x * 0.5,
          direction.y * 0.6 + 0.5,
          Math.cos(angle) * spread + direction.z * 0.5
        ).normalize();
        addBranch(parent, tip, newDir, len * 0.7, radius * 0.65, depth - 1);
      }
    }
  }

  addBranch(group, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0.35, 0.06, 4);
  return group;
}

/** Tube Coral — cluster of vertical open tubes */
function buildTubeCoral() {
  const group = new THREE.Group();
  const tubeColors = [0x4466ff, 0x6644ff, 0x4488ff, 0x8855ff, 0x44aaff, 0x6666ff];

  const count = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const height = 0.3 + Math.random() * 0.35;
    const radius = 0.055 + Math.random() * 0.04;
    const outerGeo = new THREE.CylinderGeometry(radius, radius * 0.85, height, 10, 1, true);
    const tube = new THREE.Mesh(outerGeo, mat(tubeColors[i % tubeColors.length], { side: THREE.BackSide }));

    const angle = (i / count) * Math.PI * 2;
    const dist = Math.random() * 0.22;
    tube.position.set(
      Math.cos(angle) * dist,
      height / 2,
      Math.sin(angle) * dist
    );
    tube.rotation.x = (Math.random() - 0.5) * 0.3;
    tube.rotation.z = (Math.random() - 0.5) * 0.3;

    // Rim cap
    const rimGeo = new THREE.TorusGeometry(radius, 0.018, 6, 18);
    const rim = new THREE.Mesh(rimGeo, mat(tubeColors[(i + 1) % tubeColors.length]));
    rim.position.copy(tube.position);
    rim.position.y += height / 2;
    rim.rotation.copy(tube.rotation);
    group.add(tube, rim);
  }
  return group;
}

/** Sea Anemone — base with tentacles */
function buildAnemone() {
  const group = new THREE.Group();
  const baseColor = 0xff6644;
  const tentacleColor = 0xff8866;

  // Base disc
  const baseGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.1, 16);
  const base = new THREE.Mesh(baseGeo, mat(baseColor));
  group.add(base);

  // Tentacles
  const count = 14;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = 0.14 + Math.random() * 0.08;
    const height = 0.22 + Math.random() * 0.18;

    const tentGeo = new THREE.CylinderGeometry(0.018, 0.028, height, 6);
    const tent = new THREE.Mesh(tentGeo, mat(tentacleColor));
    tent.position.set(Math.cos(angle) * dist, height / 2 + 0.05, Math.sin(angle) * dist);
    tent.rotation.x = Math.cos(angle) * 0.25;
    tent.rotation.z = Math.sin(angle) * 0.25;
    tent.userData.tentAngle = i;
    tent.name = 'tentacle';
    group.add(tent);

    // Bulbous tip
    const tipGeo = new THREE.SphereGeometry(0.026, 6, 6);
    const tip = new THREE.Mesh(tipGeo, mat(0xffaa88));
    tip.position.set(
      tent.position.x + Math.cos(angle) * 0.04,
      tent.position.y + height / 2,
      tent.position.z + Math.sin(angle) * 0.04
    );
    group.add(tip);
  }
  return group;
}

/** Sea Grass — cluster of ribbon blades */
function buildSeagrass() {
  const group = new THREE.Group();
  const count = 8 + Math.floor(Math.random() * 6);

  for (let i = 0; i < count; i++) {
    const height = 0.4 + Math.random() * 0.5;
    const geo = new THREE.PlaneGeometry(0.06, height, 1, 8);

    // Curve the blade
    const pos = geo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const t = (pos.getY(j) + height / 2) / height;
      pos.setX(j, pos.getX(j) + Math.sin(t * Math.PI) * 0.12);
    }
    pos.needsUpdate = true;

    const mesh = new THREE.Mesh(geo, mat(0x228833, {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }));

    const angle = (i / count) * Math.PI * 2;
    const dist = Math.random() * 0.25;
    mesh.position.set(Math.cos(angle) * dist, height / 2, Math.sin(angle) * dist);
    mesh.rotation.y = angle + Math.random() * 0.5;
    mesh.name = 'blade';
    mesh.userData.bladeOffset = i;
    group.add(mesh);
  }
  return group;
}

/** Fan Worm — feathery spiral fan */
function buildFanworm() {
  const group = new THREE.Group();

  // Tube
  const tubeGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.45, 8);
  const tube = new THREE.Mesh(tubeGeo, mat(0x553333));
  tube.position.y = 0.22;
  group.add(tube);

  // Fan feathers
  const fanColor = 0xcc44aa;
  const spirals = 2;
  const feathers = 16;
  for (let s = 0; s < spirals; s++) {
    for (let i = 0; i < feathers; i++) {
      const t = i / feathers;
      const angle = t * Math.PI * 2 + (s / spirals) * Math.PI;
      const fLength = 0.08 + t * 0.16;

      const fGeo = new THREE.ConeGeometry(0.015, fLength, 4);
      const f = new THREE.Mesh(fGeo, mat(fanColor, { transparent: true, opacity: 0.85 }));
      f.position.set(
        Math.cos(angle) * (0.04 + t * 0.14),
        0.45 + t * 0.08,
        Math.sin(angle) * (0.04 + t * 0.14)
      );
      f.lookAt(new THREE.Vector3(0, 0.6, 0));
      f.name = 'feather';
      group.add(f);
    }
  }
  return group;
}

// ─── Decoration builders ──────────────────────────────────────────────────────

/** Rock — dodecahedron with random deformation */
function buildRock() {
  const group = new THREE.Group();
  const geo = new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.2, 0);

  // Randomly deform vertices
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i,
      pos.getX(i) * (0.85 + Math.random() * 0.3),
      pos.getY(i) * (0.75 + Math.random() * 0.3),
      pos.getZ(i) * (0.85 + Math.random() * 0.3)
    );
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const colors = [0x778899, 0x667788, 0x556677, 0x889988];
  const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    roughness: 0.9,
    metalness: 0.02,
    flatShading: true,
  }));
  rock.castShadow = true;
  group.add(rock);

  // Smaller accent rock
  if (Math.random() > 0.4) {
    const sg = new THREE.DodecahedronGeometry(0.16, 0);
    const sr = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({
      color: 0x889999, roughness: 0.9, flatShading: true
    }));
    sr.position.set(0.28, -0.06, 0.18);
    sr.rotation.y = Math.random() * Math.PI;
    group.add(sr);
  }
  return group;
}

/** Castle — tower with battlements */
function buildCastle() {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.85, metalness: 0.1 });

  // Main tower body
  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.75, 8);
  const body = new THREE.Mesh(bodyGeo, stoneMat);
  body.position.y = 0.375;
  group.add(body);

  // Battlement ring
  const battleCount = 8;
  for (let i = 0; i < battleCount; i++) {
    const angle = (i / battleCount) * Math.PI * 2;
    const isOpen = i % 2 === 0;
    if (isOpen) continue;
    const bGeo = new THREE.BoxGeometry(0.1, 0.14, 0.1);
    const b = new THREE.Mesh(bGeo, stoneMat);
    b.position.set(
      Math.cos(angle) * 0.27,
      0.75 + 0.07,
      Math.sin(angle) * 0.27
    );
    group.add(b);
  }

  // Cone roof
  const roofGeo = new THREE.ConeGeometry(0.3, 0.35, 8);
  const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.7 }));
  roof.position.y = 0.75 + 0.14 + 0.175;
  group.add(roof);

  // Door arch
  const doorGeo = new THREE.BoxGeometry(0.14, 0.22, 0.12);
  const door = new THREE.Mesh(doorGeo, new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.9 }));
  door.position.set(0, 0.11, 0.3);
  group.add(door);

  // Small side tower
  const stGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.55, 8);
  const st = new THREE.Mesh(stGeo, stoneMat);
  st.position.set(0.3, 0.275, 0.3);
  group.add(st);

  const stRoofGeo = new THREE.ConeGeometry(0.16, 0.22, 8);
  const stRoof = new THREE.Mesh(stRoofGeo, new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.7 }));
  stRoof.position.set(0.3, 0.55 + 0.11, 0.3);
  group.add(stRoof);

  return group;
}

/** Treasure Chest */
function buildChest() {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 0.85 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xddaa22, roughness: 0.3, metalness: 0.8 });

  // Base box
  const baseGeo = new THREE.BoxGeometry(0.5, 0.3, 0.35);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.y = 0.15;
  group.add(base);

  // Lid (half-cylinder, open/tilted)
  const lidGeo = new THREE.CylinderGeometry(0.175, 0.175, 0.35, 12, 1, false, 0, Math.PI);
  const lid = new THREE.Mesh(lidGeo, woodMat);
  lid.rotation.x = Math.PI / 2;
  lid.rotation.z = Math.PI;
  lid.position.set(0, 0.3 + 0.015, 0);
  // Tilt lid open
  lid.rotation.x = -Math.PI / 2 - 0.5;
  lid.position.set(-0.05, 0.38, -0.06);
  group.add(lid);

  // Gold trim strips
  [[-0.16, 0], [0, 0], [0.16, 0]].forEach(([x]) => {
    const trimGeo = new THREE.BoxGeometry(0.02, 0.31, 0.36);
    const trim = new THREE.Mesh(trimGeo, goldMat);
    trim.position.set(x, 0.15, 0);
    group.add(trim);
  });

  // Front lock
  const lockGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
  const lock = new THREE.Mesh(lockGeo, goldMat);
  lock.position.set(0, 0.15, 0.185);
  group.add(lock);

  // Gold coins spilling out
  for (let i = 0; i < 6; i++) {
    const coinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10);
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.position.set(
      (Math.random() - 0.5) * 0.35,
      0.02,
      (Math.random() - 0.5) * 0.25
    );
    coin.rotation.x = Math.random() * 0.5;
    coin.rotation.z = Math.random() * Math.PI;
    group.add(coin);
  }

  return group;
}

/** Driftwood — curved branch cluster */
function buildDriftwood() {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x5c3d1a,
    roughness: 0.95,
    flatShading: true,
  });

  function addPiece(pos, rotation, size) {
    const geo = new THREE.CylinderGeometry(
      size * 0.55, size * 0.85,
      size * 8, 7
    );
    const mesh = new THREE.Mesh(geo, woodMat);
    mesh.position.copy(pos);
    mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    group.add(mesh);
  }

  // Main branch (angled)
  addPiece(
    new THREE.Vector3(0, 0.18, 0),
    new THREE.Euler(0, 0, Math.PI / 2 - 0.3),
    0.06
  );
  // Side branch
  addPiece(
    new THREE.Vector3(-0.1, 0.28, 0.15),
    new THREE.Euler(0.4, 0.3, Math.PI / 2 - 0.6),
    0.04
  );
  // Small twig
  addPiece(
    new THREE.Vector3(0.15, 0.12, -0.1),
    new THREE.Euler(-0.3, 0.5, Math.PI / 2 - 0.2),
    0.03
  );

  return group;
}

/** Shipwreck — broken hull */
function buildShipwreck() {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.95, flatShading: true });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.6, metalness: 0.4 });

  // Hull
  const hullGeo = new THREE.CylinderGeometry(0.18, 0.32, 1.1, 8, 1, true, 0, Math.PI);
  const hull = new THREE.Mesh(hullGeo, woodMat);
  hull.rotation.x = Math.PI / 2;
  hull.rotation.z = 0.35;
  hull.position.set(0, 0.12, 0);
  group.add(hull);

  // Deck planks
  for (let i = -2; i <= 2; i++) {
    const plankGeo = new THREE.BoxGeometry(0.06, 0.03, 1.1);
    const plank = new THREE.Mesh(plankGeo, woodMat);
    plank.position.set(i * 0.07, 0.18, 0);
    plank.rotation.z = 0.35;
    group.add(plank);
  }

  // Broken mast
  const mastGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.7, 7);
  const mast = new THREE.Mesh(mastGeo, woodMat);
  mast.position.set(0.05, 0.35, 0);
  mast.rotation.z = 0.6;
  group.add(mast);

  // Porthole
  const portGeo = new THREE.TorusGeometry(0.07, 0.02, 6, 16);
  const port = new THREE.Mesh(portGeo, metalMat);
  port.position.set(0, 0.22, 0.26);
  port.rotation.x = Math.PI / 2;
  group.add(port);

  return group;
}

/** Stone arch */
function buildArch() {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xaa9977,
    roughness: 0.9,
    flatShading: true,
  });

  // Left pillar
  const pilGeo = new THREE.BoxGeometry(0.16, 0.65, 0.18);
  [-1, 1].forEach(sign => {
    const pil = new THREE.Mesh(pilGeo, stoneMat);
    pil.position.set(sign * 0.3, 0.325, 0);
    group.add(pil);
  });

  // Arch (torus segment)
  const archGeo = new THREE.TorusGeometry(0.3, 0.09, 8, 20, Math.PI);
  const arch = new THREE.Mesh(archGeo, stoneMat);
  arch.position.set(0, 0.65, 0);
  arch.rotation.z = -Math.PI / 2;
  group.add(arch);

  // Keystone
  const ksGeo = new THREE.BoxGeometry(0.14, 0.1, 0.2);
  const ks = new THREE.Mesh(ksGeo, stoneMat);
  ks.position.set(0, 0.97, 0);
  group.add(ks);

  return group;
}

// ─── Labels & factories ───────────────────────────────────────────────────────

const LABELS = {
  braincoral: 'Brain Coral',
  staghorn: 'Staghorn Coral',
  tubecoral: 'Tube Coral',
  anemone: 'Sea Anemone',
  seagrass: 'Sea Grass',
  fanworm: 'Fan Worm',
  rock: 'Rock',
  castle: 'Castle',
  chest: 'Treasure Chest',
  driftwood: 'Driftwood',
  shipwreck: 'Shipwreck',
  arch: 'Stone Arch',
};

export function getLabel(type) {
  return LABELS[type] || type;
}

export function buildDecoration(type) {
  switch (type) {
    case 'braincoral': return buildBrainCoral();
    case 'staghorn':   return buildStaghorn();
    case 'tubecoral':  return buildTubeCoral();
    case 'anemone':    return buildAnemone();
    case 'seagrass':   return buildSeagrass();
    case 'fanworm':    return buildFanworm();
    case 'rock':       return buildRock();
    case 'castle':     return buildCastle();
    case 'chest':      return buildChest();
    case 'driftwood':  return buildDriftwood();
    case 'shipwreck':  return buildShipwreck();
    case 'arch':       return buildArch();
    default:           return buildRock();
  }
}

/** Animate decorations that need it (anemone tentacles, seagrass blades) */
export function animateDecorations(items, time) {
  items.forEach(item => {
    if (!item.mesh) return;
    item.mesh.traverse(child => {
      if (child.name === 'tentacle') {
        const offset = child.userData.tentAngle || 0;
        child.rotation.x = Math.sin(time * 0.8 + offset) * 0.15;
        child.rotation.z = Math.cos(time * 0.6 + offset * 0.7) * 0.1;
      }
      if (child.name === 'blade') {
        const offset = child.userData.bladeOffset || 0;
        child.rotation.z = Math.sin(time * 1.2 + offset * 0.8) * 0.18;
      }
      if (child.name === 'feather') {
        child.rotation.y = Math.sin(time * 1.5 + child.id * 0.3) * 0.12;
      }
    });
  });
}
