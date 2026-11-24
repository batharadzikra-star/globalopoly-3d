import * as THREE from 'three';
import { getTileTransform } from '../components/Board3D';

export type WorldSkyTheme = 'daylight' | 'sunset' | 'night';

export function createSkyDomeTexture(theme: WorldSkyTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  if (theme === 'daylight') {
    grad.addColorStop(0, '#0284C7');
    grad.addColorStop(0.45, '#38BDF8');
    grad.addColorStop(0.75, '#BAE6FD');
    grad.addColorStop(1, '#E0F2FE');
  } else if (theme === 'sunset') {
    grad.addColorStop(0, '#1E1B4B');
    grad.addColorStop(0.35, '#7C3AED');
    grad.addColorStop(0.65, '#F97316');
    grad.addColorStop(1, '#FDE68A');
  } else {
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0F172A');
    grad.addColorStop(0.85, '#1E293B');
    grad.addColorStop(1, '#334155');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  if (theme === 'night') {
    // Crisp starfield
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 160; i++) {
      const sx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const sy = (Math.sin(i * 78.233) * 24634.6345) % 1;
      const x = Math.abs(sx) * 1024;
      const y = Math.abs(sy) * 340;
      const r = (i % 3) * 0.6 + 0.6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Soft painted cloud bands
    ctx.fillStyle =
      theme === 'daylight' ? 'rgba(255, 255, 255, 0.42)' : 'rgba(254, 215, 170, 0.32)';
    const clouds = [
      [140, 210, 90, 22],
      [210, 200, 70, 26],
      [480, 180, 110, 24],
      [560, 192, 75, 20],
      [820, 220, 100, 25],
      [900, 210, 65, 18],
    ];
    clouds.forEach(([cx, cy, rx, ry]) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Subtle distant world skyline silhouette along horizon
  ctx.fillStyle =
    theme === 'daylight'
      ? 'rgba(14, 116, 144, 0.25)'
      : theme === 'sunset'
        ? 'rgba(49, 46, 129, 0.4)'
        : 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  for (let x = 0; x <= 1024; x += 32) {
    const h = 370 + Math.sin(x * 0.02) * 22 + Math.cos(x * 0.055) * 14;
    ctx.lineTo(x, h);
  }
  ctx.lineTo(1024, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Surrounding 4-continent archipelago terrain islands around the Monopoly board.
 */
export function createWorldSurroundings(): THREE.Group {
  const group = new THREE.Group();

  // Ocean horizon disc
  const oceanGeo = new THREE.CylinderGeometry(58, 58, 0.4, 64);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.25,
    metalness: 0.15,
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.position.y = -0.6;
  ocean.receiveShadow = true;
  group.add(ocean);

  // Subtle coastal foam ring around the board island
  const islandBase = new THREE.Mesh(
    new THREE.BoxGeometry(23.5, 0.42, 23.5),
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.85,
      metalness: 0.02,
    }),
  );
  islandBase.position.y = -0.45;
  islandBase.receiveShadow = true;
  group.add(islandBase);

  // Four continent-themed outer terraces behind each side of the board
  const terraces: {
    pos: [number, number, number];
    size: [number, number, number];
    color: number;
  }[] = [
    // Europe (Left -X): Lush green highlands
    { pos: [-9.8, -0.26, 0], size: [4.0, 0.36, 17.5], color: 0x15803d },
    // Asia (Top -Z): Emerald & sakura plateau
    { pos: [0, -0.26, -9.8], size: [17.5, 0.36, 4.0], color: 0x0d9488 },
    // Americas (Right +X): Vibrant canyon/forest terrace
    { pos: [9.8, -0.26, 0], size: [4.0, 0.36, 17.5], color: 0x16a34a },
    // Africa & Oceania (Bottom +Z): Warm savanna & coastal sand
    { pos: [0, -0.26, 9.8], size: [17.5, 0.36, 4.0], color: 0xd97706 },
  ];

  terraces.forEach((t) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...t.size),
      new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.78, metalness: 0.05 }),
    );
    mesh.position.set(...t.pos);
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // Scattered scenic trees around outer islands
  const treePositions: [number, number][] = [
    [-9.6, 7.2],
    [-10.4, -7.0],
    [-7.2, -9.5],
    [7.2, -9.5],
    [9.6, -7.2],
    [10.2, 7.0],
    [7.5, 9.4],
    [-7.5, 9.4],
  ];
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
  treePositions.forEach(([tx, tz], i) => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.55, 8), trunkMat);
    trunk.position.y = 0.275;
    trunk.castShadow = true;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.95, 7),
      i % 3 === 0
        ? new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7 }) // Sakura accent on Asia/corners
        : leafMat,
    );
    crown.position.y = 0.85;
    crown.castShadow = true;
    tree.add(trunk, crown);
    tree.position.set(tx, -0.08, tz);
    group.add(tree);
  });

  return group;
}

// =========================================================================
// 12 COMPOSITE 3D COUNTRY LANDMARKS (3-8 Parts Each, Bottom-Center Grounded)
// =========================================================================

function buildBigBen(): THREE.Group {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0xd6b88d, roughness: 0.65 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.3 });
  const dial = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0xfde047,
    emissiveIntensity: 0.35,
  });

  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.2, 0.75), stone);
  shaft.position.y = 1.1;
  shaft.castShadow = true;
  g.add(shaft);

  const belfry = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.65, 0.88), stone);
  belfry.position.y = 2.45;
  belfry.castShadow = true;
  g.add(belfry);

  const clockBand = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 0.92), dial);
  clockBand.position.y = 2.45;
  g.add(clockBand);

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.05, 4), roof);
  spire.position.y = 3.3;
  spire.rotation.y = Math.PI / 4;
  spire.castShadow = true;
  g.add(spire);
  return g;
}

function buildBrandenburgGate(): THREE.Group {
  const g = new THREE.Group();
  const sandstone = new THREE.MeshStandardMaterial({ color: 0xe7d3b0, roughness: 0.68 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3, metalness: 0.7 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.2, 0.75), sandstone);
  plinth.position.y = 0.1;
  g.add(plinth);

  [-0.78, -0.26, 0.26, 0.78].forEach((cx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.35, 10), sandstone);
    col.position.set(cx, 0.85, 0);
    col.castShadow = true;
    g.add(col);
  });

  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 0.72), sandstone);
  beam.position.y = 1.7;
  beam.castShadow = true;
  g.add(beam);

  const quadriga = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.4), bronze);
  quadriga.position.y = 2.05;
  quadriga.castShadow = true;
  g.add(quadriga);
  return g;
}

function buildEiffelTower(): THREE.Group {
  const g = new THREE.Group();
  const iron = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.38, metalness: 0.65 });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.25,
    metalness: 0.8,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 1.0, 4), iron);
  base.position.y = 0.5;
  base.rotation.y = Math.PI / 4;
  base.castShadow = true;
  g.add(base);

  const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.55, 1.15, 4), iron);
  mid.position.y = 1.55;
  mid.rotation.y = Math.PI / 4;
  mid.castShadow = true;
  g.add(mid);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.75), gold);
  deck.position.y = 1.02;
  g.add(deck);

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.35, 4), iron);
  spire.position.y = 2.8;
  spire.rotation.y = Math.PI / 4;
  spire.castShadow = true;
  g.add(spire);
  return g;
}

function buildJapanFujiTorii(): THREE.Group {
  const g = new THREE.Group();
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 });

  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.55, 20), mountainMat);
  cone.position.set(0.15, 0.775, -0.2);
  cone.castShadow = true;
  g.add(cone);

  const snowCap = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.65, 20), snowMat);
  snowCap.position.set(0.15, 1.25, -0.2);
  g.add(snowCap);

  // Foreground Torii Gate
  [-0.55, 0.15].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.0, 10), redMat);
    pillar.position.set(px, 0.5, 0.62);
    pillar.castShadow = true;
    g.add(pillar);
  });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.11, 0.14), redMat);
  topBar.position.set(-0.2, 1.02, 0.62);
  g.add(topBar);
  return g;
}

function buildChinaPagoda(): THREE.Group {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.38 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.25 });

  for (let tier = 0; tier < 3; tier++) {
    const s = 1 - tier * 0.2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95 * s, 0.55, 0.95 * s), wallMat);
    body.position.y = 0.28 + tier * 0.72;
    body.castShadow = true;
    g.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 0.36, 4), roofMat);
    roof.position.y = 0.7 + tier * 0.72;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
  }
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 8), goldMat);
  finial.position.y = 2.55;
  g.add(finial);
  return g;
}

function buildSeoulTower(): THREE.Group {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.45 });
  const podMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    metalness: 0.6,
  });

  const hill = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.95, 0.45, 16), baseMat);
  hill.position.y = 0.225;
  g.add(hill);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.0, 14), shaftMat);
  shaft.position.y = 1.4;
  shaft.castShadow = true;
  g.add(shaft);

  const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.38, 16), podMat);
  pod.position.y = 2.35;
  pod.castShadow = true;
  g.add(pod);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 0.95, 8), shaftMat);
  spire.position.y = 2.95;
  g.add(spire);
  return g;
}

function buildStatueOfLiberty(): THREE.Group {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
  const patina = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.4, metalness: 0.25 });
  const torch = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.5,
  });

  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.0, 0.95), stone);
  ped.position.y = 0.5;
  ped.castShadow = true;
  g.add(ped);

  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 1.45, 12), patina);
  robe.position.y = 1.72;
  robe.castShadow = true;
  g.add(robe);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), patina);
  head.position.y = 2.58;
  g.add(head);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.75, 8), patina);
  arm.position.set(0.26, 2.65, 0);
  arm.rotation.z = -0.3;
  g.add(arm);

  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), torch);
  flame.position.set(0.38, 3.06, 0);
  g.add(flame);
  return g;
}

function buildCanadaCNTower(): THREE.Group {
  const g = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.25,
    metalness: 0.65,
  });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 2.5, 16), concrete);
  shaft.position.y = 1.25;
  shaft.castShadow = true;
  g.add(shaft);

  const pod = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.14, 10, 24), glass);
  pod.rotation.x = Math.PI / 2;
  pod.position.y = 2.2;
  g.add(pod);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 1.1, 8), concrete);
  spire.position.y = 2.95;
  g.add(spire);
  return g;
}

function buildBrazilChrist(): THREE.Group {
  const g = new THREE.Group();
  const mountain = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });

  const hill = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.35, 14), mountain);
  hill.position.y = 0.675;
  hill.castShadow = true;
  g.add(hill);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.1, 12), stone);
  torso.position.y = 1.8;
  torso.castShadow = true;
  g.add(torso);

  const arms = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 0.16), stone);
  arms.position.y = 2.15;
  arms.castShadow = true;
  g.add(arms);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), stone);
  head.position.y = 2.45;
  g.add(head);
  return g;
}

function buildSouthAfricaTableMountain(): THREE.Group {
  const g = new THREE.Group();
  const rock = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
  const green = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.78 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.35, 1.1, 8), rock);
  base.position.y = 0.55;
  base.castShadow = true;
  g.add(base);

  const plateau = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.22, 0.9), green);
  plateau.position.y = 1.15;
  g.add(plateau);

  // Clean energy wind turbine accent
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
  );
  pole.position.set(0.55, 1.65, 0.1);
  g.add(pole);
  return g;
}

function buildKenyaSavanna(): THREE.Group {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.75 });
  const peakMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });

  const peak = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.1, 14), peakMat);
  peak.position.set(-0.35, 0.55, -0.2);
  peak.castShadow = true;
  g.add(peak);

  const snow = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.4, 14),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }),
  );
  snow.position.set(-0.35, 0.92, -0.2);
  g.add(snow);

  // Iconic flat-top Acacia tree
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.85, 8), trunkMat);
  trunk.position.set(0.45, 0.425, 0.3);
  trunk.castShadow = true;
  g.add(trunk);

  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.42, 0.22, 12), canopyMat);
  canopy.position.set(0.45, 0.92, 0.3);
  canopy.castShadow = true;
  g.add(canopy);
  return g;
}

function buildSydneyOperaHouse(): THREE.Group {
  const g = new THREE.Group();
  const pier = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.65 });
  const shell = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.12 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 1.1), pier);
  base.position.y = 0.11;
  base.receiveShadow = true;
  g.add(base);

  [-0.52, 0, 0.48].forEach((ox, idx) => {
    const h = idx === 1 ? 1.15 : 0.85;
    const vault = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, h, 8, 1, false, 0, Math.PI),
      shell,
    );
    vault.position.set(ox, 0.22 + h * 0.45, 0);
    vault.rotation.z = -0.24;
    vault.rotation.y = Math.PI / 2;
    vault.castShadow = true;
    g.add(vault);
  });
  return g;
}

export function createCountryLandmarks(): Map<string, THREE.Group> {
  const builders: Record<string, { tileIndex: number; fn: () => THREE.Group }> = {
    inggris: { tileIndex: 1, fn: buildBigBen },
    jerman: { tileIndex: 3, fn: buildBrandenburgGate },
    prancis: { tileIndex: 5, fn: buildEiffelTower },
    jepang: { tileIndex: 7, fn: buildJapanFujiTorii },
    tiongkok: { tileIndex: 9, fn: buildChinaPagoda },
    korea_selatan: { tileIndex: 11, fn: buildSeoulTower },
    amerika_serikat: { tileIndex: 13, fn: buildStatueOfLiberty },
    kanada: { tileIndex: 15, fn: buildCanadaCNTower },
    brasil: { tileIndex: 17, fn: buildBrazilChrist },
    afrika_selatan: { tileIndex: 19, fn: buildSouthAfricaTableMountain },
    kenya: { tileIndex: 21, fn: buildKenyaSavanna },
    australia: { tileIndex: 23, fn: buildSydneyOperaHouse },
  };

  const map = new Map<string, THREE.Group>();

  Object.entries(builders).forEach(([countryId, { tileIndex, fn }]) => {
    const tf = getTileTransform(tileIndex);
    const group = fn();

    // Offset outward behind each country's tile on the outer continent terrace
    const outwardDist = 3.2;
    let lx = tf.x;
    let lz = tf.z;
    if (tileIndex >= 1 && tileIndex <= 5) {
      lx -= outwardDist; // Left (Europe)
    } else if (tileIndex >= 7 && tileIndex <= 11) {
      lz -= outwardDist; // Top (Asia)
    } else if (tileIndex >= 13 && tileIndex <= 17) {
      lx += outwardDist; // Right (Americas)
    } else if (tileIndex >= 19 && tileIndex <= 23) {
      lz += outwardDist; // Bottom (Africa & Oceania)
    }

    group.position.set(lx, -0.08, lz);
    group.rotation.y = tf.rotY;

    // Subtle circular pedestal ring under each landmark for highlight feedback
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.18, 24),
      new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.03;
    halo.name = 'landmark_halo';
    group.add(halo);

    map.set(countryId, group);
  });

  return map;
}
