import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BOARD_TILES } from '../data/boardConfig';
import {
  CameraPreset,
  FacilityId,
  Player,
  TileConfig,
} from '../types/game';
import {
  createCardDeck,
  createCenterGlobeAssembly,
  createDiceMesh,
  createFacilityBuilding,
  createPlayerPawn,
  getDiceTargetEuler,
} from '../three/models';
import { createCenterBoardTexture, createTileTexture } from '../three/textures';
import {
  WorldSkyTheme,
  createCountryLandmarks,
  createSkyDomeTexture,
  createWorldSurroundings,
} from '../three/landmarks';

// Pre-allocated scratch math helpers (zero GC in render loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _quatTarget = new THREE.Quaternion();

const TILE_SIDE_W = 1.8;
const TILE_DEPTH = 2.6;
const CORNER_SIZE = 2.6;
const CORNER_OFFSET = 5.8; // 4.5 + 1.3
const BOARD_SURFACE_Y = 0.22;

export function getTileTransform(index: number): {
  x: number;
  z: number;
  rotY: number;
  isCorner: boolean;
} {
  if (index === 0) return { x: -CORNER_OFFSET, z: CORNER_OFFSET, rotY: 0, isCorner: true };
  if (index >= 1 && index <= 5) {
    return {
      x: -CORNER_OFFSET,
      z: 3.6 - (index - 1) * 1.8,
      rotY: -Math.PI / 2,
      isCorner: false,
    };
  }
  if (index === 6) return { x: -CORNER_OFFSET, z: -CORNER_OFFSET, rotY: 0, isCorner: true };
  if (index >= 7 && index <= 11) {
    return {
      x: -3.6 + (index - 7) * 1.8,
      z: -CORNER_OFFSET,
      rotY: Math.PI,
      isCorner: false,
    };
  }
  if (index === 12) return { x: CORNER_OFFSET, z: -CORNER_OFFSET, rotY: 0, isCorner: true };
  if (index >= 13 && index <= 17) {
    return {
      x: CORNER_OFFSET,
      z: -3.6 + (index - 13) * 1.8,
      rotY: Math.PI / 2,
      isCorner: false,
    };
  }
  if (index === 18) return { x: CORNER_OFFSET, z: CORNER_OFFSET, rotY: 0, isCorner: true };
  // 19..23 Bottom edge going left from Brasil -> Afrika Selatan .. Australia -> START
  return {
    x: 3.6 - (index - 19) * 1.8,
    z: CORNER_OFFSET,
    rotY: 0,
    isCorner: false,
  };
}

interface DiceAnimRequest {
  rollId: number;
  value: number;
}

interface BurstRequest {
  id: number;
  tileIndex: number;
  color: string;
}

interface Board3DProps {
  players: Player[];
  activePlayerIndex: number;
  cameraPreset: CameraPreset;
  cameraPresetVersion: number;
  skyTheme: WorldSkyTheme;
  diceRequest: DiceAnimRequest | null;
  burstRequest: BurstRequest | null;
  animationSpeed: number;
  onTileClick: (tile: TileConfig) => void;
  onPawnHop?: () => void;
  onPawnArrival?: (playerId: string) => void;
  onManualCameraStart?: () => void;
}

interface PawnAnimState {
  currentVisualIndex: number;
  queue: number[];
  hopProgress: number;
  fromIndex: number;
  toIndex: number;
  directJump: boolean;
  mesh: THREE.Group;
  ringMesh: THREE.Mesh;
}

export const Board3D: React.FC<Board3DProps> = ({
  players,
  activePlayerIndex,
  cameraPreset,
  cameraPresetVersion,
  skyTheme,
  diceRequest,
  burstRequest,
  animationSpeed,
  onTileClick,
  onPawnHop,
  onPawnArrival,
  onManualCameraStart,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  // Mutable refs for animation loop without tearing down WebGL context
  const playersRef = useRef(players);
  playersRef.current = players;
  const activePlayerIdxRef = useRef(activePlayerIndex);
  activePlayerIdxRef.current = activePlayerIndex;
  const cameraPresetRef = useRef(cameraPreset);
  cameraPresetRef.current = cameraPreset;
  const animSpeedRef = useRef(animationSpeed);
  animSpeedRef.current = animationSpeed;
  const callbacksRef = useRef({ onTileClick, onPawnHop, onPawnArrival, onManualCameraStart });
  callbacksRef.current = { onTileClick, onPawnHop, onPawnArrival, onManualCameraStart };

  const cameraTransitionActiveRef = useRef(true);
  const lastDiceRollIdRef = useRef<number>(-1);
  const diceAnimRef = useRef<{
    active: boolean;
    elapsed: number;
    duration: number;
    targetValue: number;
  }>({ active: false, elapsed: 0, duration: 1.0, targetValue: 1 });

  const lastBurstIdRef = useRef<number>(-1);
  const pendingBurstRef = useRef<BurstRequest | null>(null);

  useEffect(() => {
    cameraTransitionActiveRef.current = true;
  }, [cameraPreset, cameraPresetVersion, activePlayerIndex]);

  useEffect(() => {
    if (diceRequest && diceRequest.rollId !== lastDiceRollIdRef.current) {
      lastDiceRollIdRef.current = diceRequest.rollId;
      diceAnimRef.current = {
        active: true,
        elapsed: 0,
        duration: 0.95 / Math.max(0.5, animSpeedRef.current),
        targetValue: diceRequest.value,
      };
    }
  }, [diceRequest]);

  useEffect(() => {
    if (burstRequest && burstRequest.id !== lastBurstIdRef.current) {
      lastBurstIdRef.current = burstRequest.id;
      pendingBurstRef.current = burstRequest;
    }
  }, [burstRequest]);

  // Keep synced ownership & facilities map via ref
  const ownershipSyncRef = useRef<{
    updateOwnership: (pls: Player[]) => void;
    syncPawns: (pls: Player[]) => void;
  } | null>(null);

  const skyUpdaterRef = useRef<((theme: WorldSkyTheme) => void) | null>(null);

  useEffect(() => {
    skyUpdaterRef.current?.(skyTheme);
  }, [skyTheme]);

  useEffect(() => {
    ownershipSyncRef.current?.updateOwnership(players);
    ownershipSyncRef.current?.syncPawns(players);
  }, [players]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.Fog(0xbae6fd, 34, 72);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 140);
    camera.position.set(0, 15.2, 16.0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI * 0.44;
    controls.minDistance = 8.5;
    controls.maxDistance = 32;
    controls.target.set(0, 0.4, 0.2);
    controls.addEventListener('start', () => {
      cameraTransitionActiveRef.current = false;
      callbacksRef.current.onManualCameraStart?.();
    });

    // Studio 3-point warm/cool lighting rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    keyLight.position.set(11, 18, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 48;
    const d = 14;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.65);
    rimLight.position.set(-12, 9, -12);
    scene.add(rimLight);

    // 360-degree Scenic World Sky Dome
    let activeSkyTex = createSkyDomeTexture(skyTheme);
    const skyDomeMat = new THREE.MeshBasicMaterial({
      map: activeSkyTex,
      side: THREE.BackSide,
      fog: false,
    });
    const skyDome = new THREE.Mesh(new THREE.SphereGeometry(62, 32, 20), skyDomeMat);
    scene.add(skyDome);

    const applySkyTheme = (theme: WorldSkyTheme) => {
      const nextTex = createSkyDomeTexture(theme);
      skyDomeMat.map = nextTex;
      skyDomeMat.needsUpdate = true;
      activeSkyTex.dispose();
      activeSkyTex = nextTex;

      if (theme === 'daylight') {
        scene.background = new THREE.Color(0xbae6fd);
        scene.fog = new THREE.Fog(0xbae6fd, 34, 72);
        keyLight.color.setHex(0xfff7ed);
        keyLight.intensity = 1.85;
        hemiLight.intensity = 0.95;
      } else if (theme === 'sunset') {
        scene.background = new THREE.Color(0xfdba74);
        scene.fog = new THREE.Fog(0xfdba74, 34, 72);
        keyLight.color.setHex(0xfb923c);
        keyLight.intensity = 1.65;
        hemiLight.intensity = 0.78;
      } else {
        scene.background = new THREE.Color(0x0b1220);
        scene.fog = new THREE.Fog(0x0b1220, 32, 70);
        keyLight.color.setHex(0x93c5fd);
        keyLight.intensity = 1.15;
        hemiLight.intensity = 0.52;
      }
    };
    skyUpdaterRef.current = applySkyTheme;
    applySkyTheme(skyTheme);

    // World Ocean & 4 Continent Terraces
    const worldSurroundings = createWorldSurroundings();
    scene.add(worldSurroundings);

    // 12 Composite 3D Country Landmarks around the Board
    const countryLandmarks = createCountryLandmarks();
    countryLandmarks.forEach((landmarkGroup) => {
      scene.add(landmarkGroup);
    });

    // Main Board Base Plinth
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(14.7, 0.44, 14.7),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.45 }),
    );
    boardFrame.position.y = -0.06;
    boardFrame.receiveShadow = true;
    boardFrame.castShadow = true;
    boardGroup.add(boardFrame);

    // Gold trim border
    const boardTrim = new THREE.Mesh(
      new THREE.BoxGeometry(14.82, 0.12, 14.82),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.28, metalness: 0.8 }),
    );
    boardTrim.position.y = -0.22;
    boardGroup.add(boardTrim);

    // Inner Center Map Plate
    const centerMapTex = createCenterBoardTexture(maxAniso);
    const centerPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(9.0, 9.0),
      new THREE.MeshStandardMaterial({
        map: centerMapTex,
        roughness: 0.48,
        metalness: 0.06,
      }),
    );
    centerPlate.rotation.x = -Math.PI / 2;
    centerPlate.position.y = BOARD_SURFACE_Y + 0.01;
    centerPlate.receiveShadow = true;
    boardGroup.add(centerPlate);

    // Center Rotating Globe + Orbiting Airplane
    const globeAssembly = createCenterGlobeAssembly(maxAniso);
    globeAssembly.root.position.set(0, BOARD_SURFACE_Y + 0.01, -0.1);
    boardGroup.add(globeAssembly.root);

    // Separate Card Decks on Board Center (Chance & Community Chest)
    const chanceDeckMesh = createCardDeck('chance', maxAniso);
    chanceDeckMesh.position.set(-2.6, BOARD_SURFACE_Y + 0.01, -2.1);
    chanceDeckMesh.rotation.y = -0.35;
    boardGroup.add(chanceDeckMesh);

    const chestDeckMesh = createCardDeck('community_chest', maxAniso);
    chestDeckMesh.position.set(2.6, BOARD_SURFACE_Y + 0.01, 2.0);
    chestDeckMesh.rotation.y = -0.35;
    boardGroup.add(chestDeckMesh);

    // 3D Die positioned in center foreground area
    const dieMesh = createDiceMesh(maxAniso);
    dieMesh.position.set(-2.3, BOARD_SURFACE_Y + 0.44, 2.0);
    boardGroup.add(dieMesh);

    // Build 24 Tiles + Ownership Bars + Facility Anchors + Click Proxies
    const tileMeshes: THREE.Mesh[] = [];
    const ownerBars = new Map<string, THREE.Mesh>();
    const facilityGroups = new Map<string, THREE.Group>();
    const builtFacilityTracker = new Map<string, string>();
    const tileHighlightRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.15, 24),
      new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      }),
    );
    tileHighlightRing.rotation.x = -Math.PI / 2;
    tileHighlightRing.visible = false;
    boardGroup.add(tileHighlightRing);

    const tileTexturesToDispose: THREE.Texture[] = [centerMapTex];

    BOARD_TILES.forEach((tile) => {
      const tf = getTileTransform(tile.index);
      const w = tf.isCorner ? CORNER_SIZE : TILE_SIDE_W;
      const h = tf.isCorner ? CORNER_SIZE : TILE_DEPTH;

      const tileGroup = new THREE.Group();
      tileGroup.position.set(tf.x, BOARD_SURFACE_Y, tf.z);
      tileGroup.rotation.y = tf.rotY;
      boardGroup.add(tileGroup);

      // Raised tile plinth
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.06, 0.08, h - 0.06),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55, metalness: 0.05 }),
      );
      plinth.position.y = -0.04;
      plinth.receiveShadow = true;
      tileGroup.add(plinth);

      // Crisp procedural CanvasTexture face
      const tex = createTileTexture(tile, maxAniso);
      tileTexturesToDispose.push(tex);
      const faceMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w - 0.1, h - 0.1),
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.45,
          metalness: 0.04,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        }),
      );
      faceMesh.rotation.x = -Math.PI / 2;
      faceMesh.position.y = 0.015;
      faceMesh.receiveShadow = true;
      faceMesh.userData.tile = tile;
      faceMesh.layers.enable(1);
      tileGroup.add(faceMesh);
      tileMeshes.push(faceMesh);

      if (tile.type === 'country') {
        // Ownership glowing bar along the inner edge
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(w - 0.18, 0.09, 0.18),
          new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.35,
            metalness: 0.4,
            visible: false,
          }),
        );
        bar.position.set(0, 0.05, -h / 2 + 0.12);
        tileGroup.add(bar);
        ownerBars.set(tile.id, bar);

        // Container for up to 3 physical 3D facility buildings
        const facHolder = new THREE.Group();
        facHolder.position.set(0, 0.02, -h / 2 + 0.42);
        tileGroup.add(facHolder);
        facilityGroups.set(tile.id, facHolder);
      }
    });

    // Player Pawns Map
    const pawnMap = new Map<string, PawnAnimState>();

    const syncPawns = (pls: Player[]) => {
      const activeIds = new Set(pls.map((p) => p.id));
      // Remove stale
      pawnMap.forEach((state, id) => {
        if (!activeIds.has(id)) {
          boardGroup.remove(state.mesh);
          boardGroup.remove(state.ringMesh);
          pawnMap.delete(id);
        }
      });

      pls.forEach((p, idx) => {
        let state = pawnMap.get(p.id);
        if (!state) {
          const skinIdx =
            p.pawnId === 'arka_blue'
              ? 0
              : p.pawnId === 'nara_purple'
                ? 1
                : p.pawnId === 'saga_green'
                  ? 2
                  : 3;
          const mesh = createPlayerPawn(p.color, p.secondaryColor, skinIdx);
          mesh.scale.setScalar(0.95);
          const ringMesh = new THREE.Mesh(
            new THREE.RingGeometry(0.36, 0.46, 24),
            new THREE.MeshBasicMaterial({
              color: new THREE.Color(p.secondaryColor),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.85,
            }),
          );
          ringMesh.rotation.x = -Math.PI / 2;
          const tf = getTileTransform(p.position);
          const offsetAngle = (idx / Math.max(1, pls.length)) * Math.PI * 2;
          const ox = Math.cos(offsetAngle) * 0.42;
          const oz = Math.sin(offsetAngle) * 0.42;
          mesh.position.set(tf.x + ox, BOARD_SURFACE_Y + 0.02, tf.z + oz);
          ringMesh.position.set(tf.x + ox, BOARD_SURFACE_Y + 0.03, tf.z + oz);
          boardGroup.add(mesh);
          boardGroup.add(ringMesh);
          state = {
            currentVisualIndex: p.position,
            queue: [],
            hopProgress: 0,
            fromIndex: p.position,
            toIndex: p.position,
            directJump: false,
            mesh,
            ringMesh,
          };
          pawnMap.set(p.id, state);
        }

        state.mesh.visible = !p.bankrupt;
        state.ringMesh.visible = !p.bankrupt && idx === activePlayerIdxRef.current;

        const targetPos = p.position;
        const lastQueued =
          state.queue.length > 0 ? state.queue[state.queue.length - 1] : state.toIndex;

        if (targetPos !== lastQueued) {
          // If sent directly to Jail (from Go To Jail index 18 -> 12), do a direct arc jump
          if (lastQueued === 18 && targetPos === 12 && p.inJail) {
            state.queue.push(12);
            state.directJump = true;
          } else {
            let cur = lastQueued;
            let guard = 0;
            while (cur !== targetPos && guard < 24) {
              cur = (cur + 1) % 24;
              state.queue.push(cur);
              guard++;
            }
          }
        }
      });
    };

    const updateOwnership = (pls: Player[]) => {
      const ownerLookup = new Map<string, { player: Player; facilities: FacilityId[] }>();
      pls.forEach((p) => {
        p.ownedCountries.forEach((tid) => {
          ownerLookup.set(tid, { player: p, facilities: p.facilities[tid] || [] });
        });
      });

      ownerBars.forEach((bar, tid) => {
        const mat = bar.material as THREE.MeshStandardMaterial;
        const info = ownerLookup.get(tid);
        if (info) {
          mat.visible = true;
          mat.color.set(info.player.color);
          mat.emissive.set(info.player.color);
          mat.emissiveIntensity = 0.25;
        } else {
          mat.visible = false;
        }
      });

      facilityGroups.forEach((holder, tid) => {
        const info = ownerLookup.get(tid);
        const key = info ? info.facilities.join(',') : '';
        if (builtFacilityTracker.get(tid) === key) return;
        builtFacilityTracker.set(tid, key);

        while (holder.children.length > 0) {
          holder.remove(holder.children[0]);
        }
        if (info && info.facilities.length > 0) {
          info.facilities.forEach((fid, idx) => {
            const b = createFacilityBuilding(fid);
            b.position.set((idx - (info.facilities.length - 1) / 2) * 0.5, 0, 0);
            b.scale.setScalar(0.85);
            holder.add(b);
          });
        }
      });
    };

    ownershipSyncRef.current = { updateOwnership, syncPawns };
    syncPawns(playersRef.current);
    updateOwnership(playersRef.current);

    // Coin burst particles pool
    interface CoinParticle {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
    }
    const activeParticles: CoinParticle[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 14);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });

    const spawnBurst = (tileIndex: number, colorHex: string) => {
      const tf = getTileTransform(tileIndex);
      const count = 12;
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(coinGeo, coinMat.clone());
        (m.material as THREE.MeshStandardMaterial).color.set(
          i % 2 === 0 ? '#FACC15' : colorHex,
        );
        m.position.set(tf.x, BOARD_SURFACE_Y + 0.5, tf.z);
        m.rotation.x = Math.PI / 2;
        boardGroup.add(m);
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.3;
        const spd = 1.2 + Math.random() * 1.6;
        activeParticles.push({
          mesh: m,
          vx: Math.cos(ang) * spd,
          vy: 3.4 + Math.random() * 2.0,
          vz: Math.sin(ang) * spd,
          life: 1.0,
        });
      }
    };

    // Raycasting for tile hover & click
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Was dragging camera
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(tileMeshes, false);
      if (hits.length > 0) {
        const tile = hits[0].object.userData.tile as TileConfig | undefined;
        if (tile) {
          tileHighlightRing.position.set(
            getTileTransform(tile.index).x,
            BOARD_SURFACE_Y + 0.03,
            getTileTransform(tile.index).z,
          );
          tileHighlightRing.visible = true;
          callbacksRef.current.onTileClick(tile);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop with software WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const rawDelta = clock.getDelta();
      const delta = Math.min(rawDelta, 0.08);
      const elapsed = clock.elapsedTime;

      // 1. Center globe & airplane motion
      globeAssembly.globeMesh.rotation.y += delta * 0.25;
      globeAssembly.planePivot.rotation.y -= delta * 0.85;
      globeAssembly.planePivot.position.y = 2.02 + Math.sin(elapsed * 2.2) * 0.08;

      // 2. Spawn burst if requested
      if (pendingBurstRef.current) {
        spawnBurst(pendingBurstRef.current.tileIndex, pendingBurstRef.current.color);
        pendingBurstRef.current = null;
      }

      // 3. Update particles
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const pt = activeParticles[i];
        pt.vy -= 9.5 * delta;
        pt.mesh.position.x += pt.vx * delta;
        pt.mesh.position.y += pt.vy * delta;
        pt.mesh.position.z += pt.vz * delta;
        pt.mesh.rotation.z += delta * 9;
        pt.life -= delta * 1.1;
        if (pt.life <= 0 || pt.mesh.position.y < BOARD_SURFACE_Y) {
          boardGroup.remove(pt.mesh);
          (pt.mesh.material as THREE.Material).dispose();
          activeParticles.splice(i, 1);
        }
      }

      // 4. Dice roll physics animation
      if (diceAnimRef.current.active) {
        diceAnimRef.current.elapsed += delta;
        const t = Math.min(1, diceAnimRef.current.elapsed / diceAnimRef.current.duration);
        const bounceHeight = Math.abs(Math.sin(t * Math.PI * 2.5)) * (1 - t) * 2.6;
        dieMesh.position.y = BOARD_SURFACE_Y + 0.44 + bounceHeight;
        dieMesh.position.x = THREE.MathUtils.lerp(-3.2, -2.3, t);
        dieMesh.position.z = THREE.MathUtils.lerp(1.2, 2.0, t);

        if (t < 0.72) {
          dieMesh.rotation.x += delta * 15;
          dieMesh.rotation.y += delta * 12;
          dieMesh.rotation.z += delta * 10;
        } else {
          const targetEuler = getDiceTargetEuler(diceAnimRef.current.targetValue);
          _quatTarget.setFromEuler(targetEuler);
          dieMesh.quaternion.slerp(_quatTarget, 1 - Math.exp(-16 * delta));
        }

        if (t >= 1) {
          diceAnimRef.current.active = false;
          const targetEuler = getDiceTargetEuler(diceAnimRef.current.targetValue);
          dieMesh.rotation.copy(targetEuler);
          dieMesh.position.set(-2.3, BOARD_SURFACE_Y + 0.44, 2.0);
        }
      }

      // 5. Pawn step-by-step hopping
      const pls = playersRef.current;
      const totalPlayers = Math.max(1, pls.length);
      const speedMult = animSpeedRef.current;

      pls.forEach((p, idx) => {
        const st = pawnMap.get(p.id);
        if (!st) return;

        const offsetAngle = (idx / totalPlayers) * Math.PI * 2;
        const ox = Math.cos(offsetAngle) * 0.42;
        const oz = Math.sin(offsetAngle) * 0.42;

        if (st.fromIndex === st.toIndex && st.queue.length > 0) {
          const nextIdx = st.queue.shift()!;
          st.toIndex = nextIdx;
          st.hopProgress = 0;
          callbacksRef.current.onPawnHop?.();
        }

        if (st.fromIndex !== st.toIndex) {
          const stepRate = st.directJump ? 1.8 * speedMult : 4.2 * speedMult;
          st.hopProgress += delta * stepRate;
          const t = Math.min(1, st.hopProgress);
          const fromTf = getTileTransform(st.fromIndex);
          const toTf = getTileTransform(st.toIndex);

          const curX = THREE.MathUtils.lerp(fromTf.x + ox, toTf.x + ox, t);
          const curZ = THREE.MathUtils.lerp(fromTf.z + oz, toTf.z + oz, t);
          const hopArc = Math.sin(t * Math.PI) * (st.directJump ? 2.2 : 0.65);

          st.mesh.position.set(curX, BOARD_SURFACE_Y + 0.02 + hopArc, curZ);
          st.ringMesh.position.set(curX, BOARD_SURFACE_Y + 0.03, curZ);

          if (t >= 1) {
            st.fromIndex = st.toIndex;
            st.currentVisualIndex = st.toIndex;
            st.directJump = false;
            if (st.queue.length === 0) {
              callbacksRef.current.onPawnArrival?.(p.id);
            }
          }
        } else {
          // Idle gentle bob for active player
          const tf = getTileTransform(st.currentVisualIndex);
          const isActive = idx === activePlayerIdxRef.current && !p.bankrupt;
          const bob = isActive ? Math.sin(elapsed * 3.4) * 0.06 + 0.06 : 0;
          st.mesh.position.set(tf.x + ox, BOARD_SURFACE_Y + 0.02 + bob, tf.z + oz);
          st.ringMesh.position.set(tf.x + ox, BOARD_SURFACE_Y + 0.03, tf.z + oz);
          if (isActive) {
            const pulseScale = 1 + Math.sin(elapsed * 4) * 0.08;
            st.ringMesh.scale.set(pulseScale, pulseScale, 1);
          }
        }
      });

      // 5b. Highlight active player's country landmark if standing on a country
      const activePlayerNow = pls[activePlayerIdxRef.current];
      const activeTileNow = activePlayerNow ? BOARD_TILES[activePlayerNow.position] : undefined;
      countryLandmarks.forEach((lGroup, countryId) => {
        const halo = lGroup.getObjectByName('landmark_halo') as THREE.Mesh | undefined;
        if (halo) {
          const mat = halo.material as THREE.MeshBasicMaterial;
          const isTarget = activeTileNow?.id === countryId;
          mat.opacity = isTarget ? 0.65 + Math.sin(elapsed * 4) * 0.25 : 0.0;
        }
      });

      // 6. Camera choreography using smooth exponential damping
      if (cameraTransitionActiveRef.current) {
        const preset = cameraPresetRef.current;
        if (preset === 'isometric') {
          _vec3A.set(0, 15.2, 16.0);
          _vec3B.set(0, 0.4, 0.2);
        } else if (preset === 'top') {
          _vec3A.set(0, 21.5, 2.2);
          _vec3B.set(0, 0, 0);
        } else {
          // Follow active pawn
          const activeP = pls[activePlayerIdxRef.current];
          const pState = activeP ? pawnMap.get(activeP.id) : undefined;
          const px = pState ? pState.mesh.position.x : 0;
          const pz = pState ? pState.mesh.position.z : 0;
          _vec3A.set(px * 0.6, 9.2, pz * 0.6 + 8.6);
          _vec3B.set(px * 0.68, 0.4, pz * 0.68);
        }
        const dampLambda = 4.5;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _vec3A.x, dampLambda, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _vec3A.y, dampLambda, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _vec3A.z, dampLambda, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _vec3B.x, dampLambda, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _vec3B.y, dampLambda, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _vec3B.z, dampLambda, delta);

        if (
          preset !== 'follow' &&
          camera.position.distanceTo(_vec3A) < 0.05 &&
          controls.target.distanceTo(_vec3B) < 0.05
        ) {
          cameraTransitionActiveRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      tileTexturesToDispose.forEach((t) => t.dispose());
      activeSkyTex.dispose();
      envTex.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-100 p-6">
        <div className="max-w-md text-center space-y-3 bg-slate-800/90 p-6 rounded-xl border border-slate-700">
          <h2 className="font-display text-xl font-bold text-amber-400">
            Tampilan 3D Memerlukan WebGL
          </h2>
          <p className="text-sm text-slate-300">
            Peramban saat ini mengalami kendala konteks WebGL. Coba muat ulang halaman atau aktifkan akselerasi grafis pada peramban Anda.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full relative" />;
};
