import * as THREE from 'three';
import { FacilityId } from '../types/game';
import { createCardDeckTexture, createDiceFaceTexture, createGlobeTexture } from './textures';

/**
 * Composite 5-part Kokeshi/Penjelajah Pawn (bottom-center grounded pivot at y = 0).
 * Varies roughness & metalness between adjacent parts per studio PBR guidelines.
 */
export function createPlayerPawn(
  primaryColor: string,
  secondaryColor: string,
  skinIndex: number,
): THREE.Group {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.75,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    roughness: 0.45,
    metalness: 0.12,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(secondaryColor),
    roughness: 0.25,
    metalness: 0.65,
  });
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.6,
    metalness: 0.05,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: skinIndex === 3 ? 0x92400e : new THREE.Color(primaryColor).multiplyScalar(0.75),
    roughness: 0.55,
    metalness: 0.1,
  });

  // 1. Base pedestal (y: 0 -> 0.14)
  const baseGeo = new THREE.CylinderGeometry(0.28, 0.33, 0.14, 24);
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.07;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Lathe-profiled kimono/cloak body (y: 0.14 -> 0.74)
  const lathePoints = [
    new THREE.Vector2(0.26, 0.0),
    new THREE.Vector2(0.28, 0.18),
    new THREE.Vector2(0.22, 0.45),
    new THREE.Vector2(0.16, 0.58),
    new THREE.Vector2(0.01, 0.6),
  ];
  const bodyGeo = new THREE.LatheGeometry(lathePoints, 24);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.14;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 3. Obi / Collar metallic ring
  const collarGeo = new THREE.TorusGeometry(0.21, 0.045, 12, 24);
  const collarMesh = new THREE.Mesh(collarGeo, trimMat);
  collarMesh.rotation.x = Math.PI / 2;
  collarMesh.position.y = 0.44;
  collarMesh.castShadow = true;
  group.add(collarMesh);

  // 4. Head sphere
  const headGeo = new THREE.SphereGeometry(0.23, 24, 20);
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.y = 0.92;
  headMesh.castShadow = true;
  group.add(headMesh);

  // 5. Hair crown / character crest
  const crownGeo = new THREE.SphereGeometry(0.24, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const crownMesh = new THREE.Mesh(crownGeo, hairMat);
  crownMesh.position.y = 0.95;
  crownMesh.rotation.x = -0.18;
  crownMesh.castShadow = true;
  group.add(crownMesh);

  // 6. Distinct top ornament per pawn skin
  if (skinIndex === 0) {
    // Arka twin buns
    [-0.17, 0.17].forEach((ox) => {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), hairMat);
      bun.position.set(ox, 1.15, -0.02);
      bun.castShadow = true;
      group.add(bun);
    });
  } else if (skinIndex === 1) {
    // Nara top updo bun
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), hairMat);
    bun.position.set(0, 1.2, -0.02);
    bun.castShadow = true;
    group.add(bun);
  } else {
    // Saga / Surya explorer crest visor
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 6), trimMat);
    crest.position.set(0, 1.23, 0);
    crest.castShadow = true;
    group.add(crest);
  }

  return group;
}

/**
 * Center 3D Globe Diorama with Pedestal, Brass Meridian Ring, and Orbiting Airplane.
 */
export function createCenterGlobeAssembly(maxAniso: number): {
  root: THREE.Group;
  globeMesh: THREE.Mesh;
  planePivot: THREE.Group;
} {
  const root = new THREE.Group();

  // 1. Pedestal base via LatheGeometry
  const standPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.05, 0.0),
    new THREE.Vector2(0.95, 0.18),
    new THREE.Vector2(0.45, 0.35),
    new THREE.Vector2(0.28, 0.72),
    new THREE.Vector2(0.0, 0.72),
  ];
  const standGeo = new THREE.LatheGeometry(standPoints, 32);
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.45,
    metalness: 0.25,
  });
  const standMesh = new THREE.Mesh(standGeo, standMat);
  standMesh.castShadow = true;
  standMesh.receiveShadow = true;
  root.add(standMesh);

  // 2. Brass Meridian Ring
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.22,
    metalness: 0.88,
  });
  const ringGeo = new THREE.TorusGeometry(1.38, 0.06, 16, 48);
  const ringMesh = new THREE.Mesh(ringGeo, brassMat);
  ringMesh.position.y = 1.95;
  ringMesh.rotation.z = 0.22;
  ringMesh.castShadow = true;
  root.add(ringMesh);

  // 3. Globe sphere with procedural continent CanvasTexture
  const globeTex = createGlobeTexture(maxAniso);
  const globeMat = new THREE.MeshStandardMaterial({
    map: globeTex,
    roughness: 0.35,
    metalness: 0.1,
  });
  const globeGeo = new THREE.SphereGeometry(1.22, 36, 28);
  const globeMesh = new THREE.Mesh(globeGeo, globeMat);
  globeMesh.position.y = 1.95;
  globeMesh.castShadow = true;
  root.add(globeMesh);

  // 4. Orbiting 4-part Miniature Expedition Airplane
  const planePivot = new THREE.Group();
  planePivot.position.y = 2.05;

  const planeGroup = new THREE.Group();
  planeGroup.position.set(1.75, 0.35, 0);

  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.28,
    metalness: 0.25,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.35,
    metalness: 0.45,
  });

  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.46, 8, 12), fuselageMat);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  planeGroup.add(fuselage);

  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.03, 0.2), wingMat);
  wings.position.set(0, 0.01, 0.02);
  wings.castShadow = true;
  planeGroup.add(wings);

  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.16), wingMat);
  tailFin.position.set(0, 0.12, -0.22);
  planeGroup.add(tailFin);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.1), wingMat);
  hStab.position.set(0, 0.02, -0.22);
  planeGroup.add(hStab);

  planePivot.add(planeGroup);
  root.add(planePivot);

  return { root, globeMesh, planePivot };
}

/**
 * 3D Card Deck Stack for Chance (Kesempatan) & Community Chest (Dana Umum).
 */
export function createCardDeck(
  deck: 'chance' | 'community_chest',
  maxAniso: number,
): THREE.Group {
  const group = new THREE.Group();
  const topTex = createCardDeckTexture(deck, maxAniso);

  const sideMat = new THREE.MeshStandardMaterial({
    color: deck === 'chance' ? 0xbe185d : 0x0369a1,
    roughness: 0.55,
    metalness: 0.1,
  });
  const topMat = new THREE.MeshStandardMaterial({
    map: topTex,
    roughness: 0.32,
    metalness: 0.12,
  });

  // Base holder tray
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(2.25, 0.08, 1.55),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.4 }),
  );
  tray.position.y = 0.04;
  tray.receiveShadow = true;
  group.add(tray);

  // Stacked cards block
  const stack = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.34, 1.38),
    [sideMat, sideMat, topMat, sideMat, sideMat, sideMat],
  );
  stack.position.y = 0.25;
  stack.castShadow = true;
  stack.receiveShadow = true;
  group.add(stack);

  return group;
}

/**
 * 3D Die with 6 distinct pip faces (1..6).
 * Face order in BoxGeometry: +X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)
 * We map: +Y = 1, -Y = 6, +X = 3, -X = 4, +Z = 2, -Z = 5
 */
export function createDiceMesh(maxAniso: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
  const faceValues = [3, 4, 1, 6, 2, 5];
  const materials = faceValues.map(
    (v) =>
      new THREE.MeshStandardMaterial({
        map: createDiceFaceTexture(v, maxAniso),
        roughness: 0.28,
        metalness: 0.08,
      }),
  );
  const die = new THREE.Mesh(geo, materials);
  die.castShadow = true;
  return die;
}

export function getDiceTargetEuler(value: number): THREE.Euler {
  // Rotate so the rolled face value points UP (+Y)
  switch (value) {
    case 1:
      return new THREE.Euler(0, 0, 0);
    case 2:
      return new THREE.Euler(-Math.PI / 2, 0, 0);
    case 3:
      return new THREE.Euler(0, 0, Math.PI / 2);
    case 4:
      return new THREE.Euler(0, 0, -Math.PI / 2);
    case 5:
      return new THREE.Euler(Math.PI / 2, 0, 0);
    case 6:
    default:
      return new THREE.Euler(Math.PI, 0, 0);
  }
}

/**
 * Composite 4-part Facility Buildings placed on owned Country tiles.
 */
export function createFacilityBuilding(type: FacilityId): THREE.Group {
  const group = new THREE.Group();

  if (type === 'pusat_inovasi') {
    // Sleek futuristic innovation dome & antenna
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.27, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 }),
    );
    plinth.position.y = 0.04;
    group.add(plinth);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.18, metalness: 0.55 }),
    );
    dome.position.y = 0.08;
    dome.castShadow = true;
    group.add(dome);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.025, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.85 }),
    );
    spire.position.y = 0.34;
    group.add(spire);
  } else if (type === 'pabrik_pintar') {
    // Smart factory with twin bays & solar roof
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.22, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.2 }),
    );
    hall.position.y = 0.11;
    hall.castShadow = true;
    group.add(hall);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.05, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.6 }),
    );
    roof.position.y = 0.245;
    group.add(roof);

    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.26, 10),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35, metalness: 0.4 }),
    );
    chimney.position.set(0.12, 0.28, -0.06);
    chimney.castShadow = true;
    group.add(chimney);
  } else {
    // Pusat Pendidikan Digital: tiered library campus
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.14, 0.34),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6, metalness: 0.05 }),
    );
    base.position.y = 0.07;
    base.castShadow = true;
    group.add(base);

    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.14, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.38, metalness: 0.25 }),
    );
    upper.position.y = 0.21;
    upper.castShadow = true;
    group.add(upper);

    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08, 0),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 }),
    );
    beacon.position.y = 0.35;
    group.add(beacon);
  }

  return group;
}
