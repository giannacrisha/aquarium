import * as THREE from 'three';
import { TANK } from './aquarium.js';

// ─── Material helpers ─────────────────────────────────────────────────────────

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1, ...opts });
}

// ─── Fish body builders ───────────────────────────────────────────────────────

function addEye(group, x, y, z) {
  const eyeGeo = new THREE.SphereGeometry(0.055, 8, 8);
  const eyeMesh = new THREE.Mesh(eyeGeo, mat(0x111111, { roughness: 0 }));
  eyeMesh.position.set(x, y, z);
  // White highlight
  const hlGeo = new THREE.SphereGeometry(0.025, 6, 6);
  const hl = new THREE.Mesh(hlGeo, mat(0xffffff, { roughness: 0 }));
  hl.position.set(x + 0.02, y + 0.02, z + 0.03);
  group.add(eyeMesh, hl);
}

/** Clownfish — orange with white stripes */
function buildClownfish() {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.32, 12, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0xff6600));
  body.scale.set(1.1, 0.72, 0.55);
  group.add(body);

  // White stripes (3 rings)
  [0.12, 0, -0.12].forEach((zOff, i) => {
    const ringGeo = new THREE.TorusGeometry(0.28, 0.06, 6, 20);
    const ring = new THREE.Mesh(ringGeo, mat(0xffffff));
    ring.rotation.y = Math.PI / 2;
    ring.position.x = zOff + (i === 0 ? 0.04 : 0);
    ring.scale.set(1, 0.72, 0.55);
    group.add(ring);
  });

  // Tail (forked)
  [-1, 1].forEach(sign => {
    const tailGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
    const tail = new THREE.Mesh(tailGeo, mat(0xff5500));
    tail.position.set(-0.42, sign * 0.09, 0);
    tail.rotation.z = sign * 0.55 - Math.PI / 2;
    group.add(tail);
  });

  // Dorsal fin
  const dfGeo = new THREE.ConeGeometry(0.06, 0.22, 4);
  const df = new THREE.Mesh(dfGeo, mat(0xff7700, { transparent: true, opacity: 0.85 }));
  df.position.set(0.1, 0.32, 0);
  df.rotation.z = -0.2;
  df.name = 'dorsalFin';
  group.add(df);

  // Eyes
  addEye(group, 0.28, 0.1, 0.18);
  addEye(group, 0.28, 0.1, -0.18);

  group.userData.tailParts = group.children.filter(c => c.name !== 'dorsalFin').slice(5, 7);
  return group;
}

/** Blue Tang */
function buildBlueTang() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(0.3, 12, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0x1166dd));
  body.scale.set(1.2, 0.9, 0.45);
  group.add(body);

  // Yellow accent near tail
  const accentGeo = new THREE.BoxGeometry(0.12, 0.36, 0.14);
  const accent = new THREE.Mesh(accentGeo, mat(0xffcc00));
  accent.position.set(-0.2, 0, 0);
  group.add(accent);

  // Tail
  const tailGeo = new THREE.ConeGeometry(0.22, 0.22, 4);
  const tail = new THREE.Mesh(tailGeo, mat(0x0044bb));
  tail.position.x = -0.44;
  tail.rotation.z = -Math.PI / 2;
  tail.name = 'tail';
  group.add(tail);

  // Top/bottom fins
  [1, -1].forEach(sign => {
    const finGeo = new THREE.BoxGeometry(0.38, 0.06, 0.01);
    const fin = new THREE.Mesh(finGeo, mat(0x1166dd, { transparent: true, opacity: 0.75 }));
    fin.position.set(0, sign * 0.32, 0);
    fin.rotation.z = sign * 0.15;
    group.add(fin);
  });

  addEye(group, 0.28, 0.08, 0.18);
  addEye(group, 0.28, 0.08, -0.18);
  return group;
}

/** Angelfish — tall, flat, silver/black stripes */
function buildAngelfish() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(0.28, 12, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0xddddcc));
  body.scale.set(0.85, 1.5, 0.3);
  group.add(body);

  // Black stripes
  [0.08, -0.05, -0.2].forEach(xOff => {
    const stripGeo = new THREE.BoxGeometry(0.05, 0.78, 0.16);
    const strip = new THREE.Mesh(stripGeo, mat(0x111111));
    strip.position.x = xOff;
    group.add(strip);
  });

  // Tall top fin
  const topFinGeo = new THREE.ConeGeometry(0.08, 0.55, 4);
  const topFin = new THREE.Mesh(topFinGeo, mat(0xddddcc, { transparent: true, opacity: 0.8 }));
  topFin.position.set(0.05, 0.58, 0);
  topFin.rotation.z = -0.15;
  group.add(topFin);

  // Bottom fin (anal fin)
  const botFinGeo = new THREE.ConeGeometry(0.06, 0.45, 4);
  const botFin = new THREE.Mesh(botFinGeo, mat(0xddddcc, { transparent: true, opacity: 0.8 }));
  botFin.position.set(0.05, -0.58, 0);
  botFin.rotation.z = 0.2;
  group.add(botFin);

  // Tail
  const tailGeo = new THREE.ConeGeometry(0.24, 0.22, 4);
  const tail = new THREE.Mesh(tailGeo, mat(0xddddcc));
  tail.position.x = -0.36;
  tail.rotation.z = -Math.PI / 2;
  tail.name = 'tail';
  group.add(tail);

  addEye(group, 0.2, 0.15, 0.12);
  addEye(group, 0.2, 0.15, -0.12);
  return group;
}

/** Goldfish — round, fancy tail */
function buildGoldfish() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(0.3, 12, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0xff9900));
  body.scale.set(1.05, 0.9, 0.8);
  group.add(body);

  // Fancy forked tail (4 lobes)
  [[0.16, 0.14], [0.16, -0.14], [-0.16, 0.14], [-0.16, -0.14]].forEach(([y, z]) => {
    const tailGeo = new THREE.ConeGeometry(0.13, 0.28, 4);
    const tail = new THREE.Mesh(tailGeo, mat(0xff7700, { transparent: true, opacity: 0.9 }));
    tail.position.set(-0.38, y, z);
    tail.rotation.z = -Math.PI / 2;
    tail.name = 'tail';
    group.add(tail);
  });

  // Dorsal fin
  const dfGeo = new THREE.ConeGeometry(0.08, 0.28, 4);
  const df = new THREE.Mesh(dfGeo, mat(0xff8800, { transparent: true, opacity: 0.85 }));
  df.position.set(0, 0.32, 0);
  group.add(df);

  // Pectoral fins
  [-1, 1].forEach(sign => {
    const fGeo = new THREE.BoxGeometry(0.18, 0.05, 0.16);
    const fin = new THREE.Mesh(fGeo, mat(0xffaa00, { transparent: true, opacity: 0.75 }));
    fin.position.set(0.12, -0.1, sign * 0.28);
    fin.rotation.z = sign * 0.4;
    group.add(fin);
  });

  addEye(group, 0.26, 0.1, 0.22);
  addEye(group, 0.26, 0.1, -0.22);
  return group;
}

/** Shark — streamlined, grey */
function buildShark() {
  const group = new THREE.Group();

  // Main body (elongated)
  const bodyGeo = new THREE.CylinderGeometry(0.18, 0.06, 0.95, 12);
  const body = new THREE.Mesh(bodyGeo, mat(0x7788aa));
  body.rotation.z = Math.PI / 2;
  body.scale.set(1, 1, 0.7);
  group.add(body);

  // Underbelly (lighter)
  const bellyGeo = new THREE.CylinderGeometry(0.155, 0.05, 0.95, 12, 1, false, Math.PI, Math.PI);
  const belly = new THREE.Mesh(bellyGeo, mat(0xccddee));
  belly.rotation.z = Math.PI / 2;
  belly.scale.set(1, 1, 0.7);
  group.add(belly);

  // Snout
  const snoutGeo = new THREE.ConeGeometry(0.18, 0.32, 12);
  const snout = new THREE.Mesh(snoutGeo, mat(0x7788aa));
  snout.position.x = 0.6;
  snout.rotation.z = -Math.PI / 2;
  group.add(snout);

  // Dorsal fin (top)
  const dfGeo = new THREE.ConeGeometry(0.05, 0.38, 3);
  const df = new THREE.Mesh(dfGeo, mat(0x667799));
  df.position.set(0.05, 0.25, 0);
  df.rotation.z = -0.2;
  group.add(df);

  // Pectoral fins (sides)
  [-1, 1].forEach(sign => {
    const finGeo = new THREE.ConeGeometry(0.06, 0.38, 3);
    const fin = new THREE.Mesh(finGeo, mat(0x7788aa));
    fin.position.set(0.15, -0.05, sign * 0.2);
    fin.rotation.x = sign * 1.3;
    fin.rotation.z = sign * 0.4;
    group.add(fin);
  });

  // Caudal fin (tail — 2 lobes)
  [[0.18, 0], [-0.1, 0]].forEach(([y, z]) => {
    const finGeo = new THREE.ConeGeometry(0.06, 0.3, 3);
    const fin = new THREE.Mesh(finGeo, mat(0x667799));
    fin.position.set(-0.52, y, z);
    fin.rotation.z = -Math.PI / 2 + (y > 0 ? 0.4 : -0.3);
    fin.name = 'tail';
    group.add(fin);
  });

  addEye(group, 0.3, 0.08, 0.14);
  addEye(group, 0.3, 0.08, -0.14);

  return group;
}

/** Guppy — small, colorful fan tail */
function buildGuppy() {
  const group = new THREE.Group();
  const colors = [0xff44aa, 0x44aaff, 0x44ff88, 0xff8844, 0xaa44ff];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const bodyGeo = new THREE.SphereGeometry(0.18, 10, 8);
  const body = new THREE.Mesh(bodyGeo, mat(color));
  body.scale.set(1.3, 0.75, 0.65);
  group.add(body);

  // Fan tail
  for (let i = -2; i <= 2; i++) {
    const tailGeo = new THREE.ConeGeometry(0.06, 0.32, 4);
    const tail = new THREE.Mesh(tailGeo, mat(color, { transparent: true, opacity: 0.8 }));
    tail.position.set(-0.26, i * 0.07, 0);
    tail.rotation.z = -Math.PI / 2;
    tail.rotation.y = (i / 4) * 0.4;
    tail.name = 'tail';
    group.add(tail);
  }

  // Top fin
  const tfGeo = new THREE.ConeGeometry(0.04, 0.2, 4);
  const tf = new THREE.Mesh(tfGeo, mat(color, { transparent: true, opacity: 0.75 }));
  tf.position.set(0.02, 0.2, 0);
  tf.rotation.z = -0.2;
  group.add(tf);

  addEye(group, 0.16, 0.06, 0.12);
  addEye(group, 0.16, 0.06, -0.12);
  return group;
}

// ─── Fish class (handles swim animation) ─────────────────────────────────────

const LABELS = {
  clownfish: 'Clownfish',
  bluetang: 'Blue Tang',
  angelfish: 'Angelfish',
  goldfish: 'Goldfish',
  shark: 'Shark',
  guppy: 'Guppy',
};

const SIZES = {
  clownfish: 0.9,
  bluetang: 1.0,
  angelfish: 0.95,
  goldfish: 0.85,
  shark: 1.8,
  guppy: 0.65,
};

export class Fish {
  constructor(type) {
    this.type = type;
    this.label = LABELS[type] || type;
    this.mesh = buildFishMesh(type);
    this.mesh.scale.setScalar(SIZES[type] || 1);
    this.mesh.userData.fishRef = this;

    this.t = Math.random();
    this.speed = (0.00025 + Math.random() * 0.0003) * (type === 'shark' ? 0.7 : 1);
    this.curve = this._generateCurve();
    this.tailAngle = 0;

    // Place at starting position
    const pos = this.curve.getPoint(this.t);
    this.mesh.position.copy(pos);
  }

  _generateCurve() {
    const { width: W, height: H, depth: D, floorY } = TANK;
    const mx = W / 2 - 1.2;
    const mz = D / 2 - 1.2;
    const yRange = [floorY + 0.8, floorY + H - 1];

    // Generate 6 random waypoints inside tank
    const points = [];
    const numPts = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPts; i++) {
      const angle = (i / numPts) * Math.PI * 2;
      const dist = mx * (0.4 + Math.random() * 0.5);
      points.push(new THREE.Vector3(
        Math.cos(angle) * dist * (W / (D + W)),
        yRange[0] + Math.random() * (yRange[1] - yRange[0]),
        Math.sin(angle) * dist * (D / (D + W)),
      ));
    }
    return new THREE.CatmullRomCurve3(points, true, 'centripetal');
  }

  update(delta) {
    this.t = (this.t + this.speed * delta) % 1;
    const pos = this.curve.getPoint(this.t);
    const tangent = this.curve.getTangent(this.t);

    this.mesh.position.copy(pos);

    // Orient fish along tangent
    const target = pos.clone().add(tangent);
    this.mesh.lookAt(target);
    this.mesh.rotateY(Math.PI); // flip to face forward

    // Tail wobble
    this.tailAngle += delta * 0.012;
    const wobble = Math.sin(this.tailAngle) * 0.3;
    this.mesh.traverse(child => {
      if (child.name === 'tail') {
        child.rotation.y = wobble;
      }
      if (child.name === 'dorsalFin') {
        child.rotation.z = Math.sin(this.tailAngle * 0.7) * 0.08;
      }
    });

    // Gentle vertical bob
    this.mesh.position.y += Math.sin(this.tailAngle * 0.4) * 0.018;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function buildFishMesh(type) {
  switch (type) {
    case 'clownfish':  return buildClownfish();
    case 'bluetang':   return buildBlueTang();
    case 'angelfish':  return buildAngelfish();
    case 'goldfish':   return buildGoldfish();
    case 'shark':      return buildShark();
    case 'guppy':      return buildGuppy();
    default:           return buildClownfish();
  }
}
