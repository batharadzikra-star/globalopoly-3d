import * as THREE from 'three';
import { TileConfig } from '../types/game';

function configureTexture(tex: THREE.CanvasTexture, maxAniso: number): THREE.CanvasTexture {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAniso || 4);
  tex.needsUpdate = true;
  return tex;
}

function drawFlag(
  ctx: CanvasRenderingContext2D,
  tile: TileConfig,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const colors = tile.flagColors || ['#2563EB', '#FFFFFF', '#DC2626'];
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.clip();

  if (tile.flagDirection === 'horizontal') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = colors[1];
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = colors[2];
    ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  } else if (tile.flagDirection === 'vertical') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w / 3, h);
    ctx.fillStyle = colors[1];
    ctx.fillRect(x + w / 3, y, w / 3, h);
    ctx.fillStyle = colors[2];
    ctx.fillRect(x + (2 * w) / 3, y, w / 3, h);
  } else if (tile.flagDirection === 'circle') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (tile.flagDirection === 'cross') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colors[1];
    ctx.fillRect(x + w * 0.4, y, w * 0.2, h);
    ctx.fillRect(x, y + h * 0.38, w, h * 0.24);
    ctx.fillStyle = colors[2];
    ctx.fillRect(x + w * 0.44, y, w * 0.12, h);
    ctx.fillRect(x, y + h * 0.43, w, h * 0.14);
  } else if (tile.flagDirection === 'star') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(x + w * 0.28, y + h * 0.36, Math.min(w, h) * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // canton style (US, AU)
    ctx.fillStyle = colors[2];
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colors[1];
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x, y + i * (h / 4), w, h / 8);
    }
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w * 0.46, h * 0.52);
  }

  ctx.restore();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.stroke();
}

export function createTileTexture(tile: TileConfig, maxAniso: number): THREE.CanvasTexture {
  const isCorner =
    tile.type === 'start' ||
    tile.type === 'free_parking' ||
    tile.type === 'jail' ||
    tile.type === 'go_to_jail';
  const canvas = document.createElement('canvas');
  canvas.width = isCorner ? 384 : 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Base cream/white board card surface
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle inner frame
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  if (tile.type === 'country') {
    // Top continent color strip
    ctx.fillStyle = tile.color;
    ctx.fillRect(10, 10, canvas.width - 20, 74);

    // Continent label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tile.continentLabel.toUpperCase(), canvas.width / 2, 54);

    // Country name
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 30px "Outfit", sans-serif';
    const words = tile.name.split(' ');
    if (words.length > 1 && tile.name.length > 10) {
      ctx.fillText(words[0], canvas.width / 2, 126);
      ctx.fillText(words.slice(1).join(' '), canvas.width / 2, 160);
    } else {
      ctx.fillText(tile.name, canvas.width / 2, 144);
    }

    // Crisp Flag graphic
    drawFlag(ctx, tile, 52, 182, canvas.width - 104, 98);

    // Price footer bar
    ctx.fillStyle = '#EFF6FF';
    ctx.fillRect(24, 304, canvas.width - 48, 56);
    ctx.strokeStyle = '#BFDBFE';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 304, canvas.width - 48, 56);

    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText(`${tile.price} GC`, canvas.width / 2, 342);
  } else if (tile.type === 'chance') {
    // Green & Pink Chance card tile matching PDF
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.fillStyle = '#059669';
    ctx.fillRect(10, 10, canvas.width - 20, 68);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHANCE', canvas.width / 2, 52);

    // Big question mark badge
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 200, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 82px "Outfit", sans-serif';
    ctx.fillText('?', canvas.width / 2, 228);

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('KESEMPATAN', canvas.width / 2, 326);
  } else if (tile.type === 'community_chest') {
    ctx.fillStyle = '#F5F3FF';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(10, 10, canvas.width - 20, 68);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DANA UMUM', canvas.width / 2, 52);

    // Treasure chest icon drawn cleanly
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(68, 152, canvas.width - 136, 94, 14);
    ctx.fill();
    ctx.fillStyle = '#B45309';
    ctx.fillRect(68, 186, canvas.width - 136, 16);
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(canvas.width / 2 - 14, 178, 28, 32);

    ctx.fillStyle = '#4C1D95';
    ctx.font = 'bold 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('COMMUNITY', canvas.width / 2, 306);
    ctx.fillText('CHEST', canvas.width / 2, 334);
  } else {
    // Corner tiles
    ctx.textAlign = 'center';
    if (tile.type === 'start') {
      ctx.fillStyle = '#EFF6FF';
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = '#0284C7';
      ctx.font = 'bold 54px "Outfit", sans-serif';
      ctx.fillText('START', canvas.width / 2, 130);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('EROPA · +200 GC', canvas.width / 2, 190);
      // Forward arrow
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 235);
      ctx.lineTo(canvas.width / 2 + 54, 295);
      ctx.lineTo(canvas.width / 2 + 20, 295);
      ctx.lineTo(canvas.width / 2 + 20, 335);
      ctx.lineTo(canvas.width / 2 - 20, 335);
      ctx.lineTo(canvas.width / 2 - 20, 295);
      ctx.lineTo(canvas.width / 2 - 54, 295);
      ctx.closePath();
      ctx.fill();
    } else if (tile.type === 'free_parking') {
      ctx.fillStyle = '#FFFBEB';
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 155, 68, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 70px "Outfit", sans-serif';
      ctx.fillText('P', canvas.width / 2, 180);
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 34px "Outfit", sans-serif';
      ctx.fillText('FREE PARKING', canvas.width / 2, 286);
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ZONA ISTIRAHAT', canvas.width / 2, 326);
    } else if (tile.type === 'jail') {
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = '#334155';
      ctx.fillRect(88, 76, canvas.width - 176, 150);
      ctx.fillStyle = '#CBD5E1';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(112 + i * 44, 76, 12, 150);
      }
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 44px "Outfit", sans-serif';
      ctx.fillText('JAIL', canvas.width / 2, 286);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('BERKUNJUNG / TAHAN', canvas.width / 2, 326);
    } else if (tile.type === 'go_to_jail') {
      ctx.fillStyle = '#FEF2F2';
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 148, 66, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px "Outfit", sans-serif';
      ctx.fillText('!', canvas.width / 2, 172);
      ctx.fillStyle = '#991B1B';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('GO TO JAIL', canvas.width / 2, 282);
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PINDAH KE PENJARA', canvas.width / 2, 324);
    }
  }

  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

export function createCenterBoardTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Rich ocean gradient matching PDF center board
  const grad = ctx.createRadialGradient(512, 512, 60, 512, 512, 620);
  grad.addColorStop(0, '#38BDF8');
  grad.addColorStop(0.55, '#0284C7');
  grad.addColorStop(1, '#0F172A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Latitude / Longitude expedition grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 2;
  for (let r = 140; r <= 460; r += 80) {
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let a = 0; a < Math.PI; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(512 + Math.cos(a) * 480, 512 + Math.sin(a) * 480);
    ctx.lineTo(512 - Math.cos(a) * 480, 512 - Math.sin(a) * 480);
    ctx.stroke();
  }

  // Stylized continent silhouettes around center
  ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
  const blobs = [
    [220, 260, 95, 55],
    [760, 240, 110, 65],
    [780, 740, 90, 50],
    [240, 760, 85, 60],
  ];
  blobs.forEach(([bx, by, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dashed flight paths connecting continents
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(512, 512, 340, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Title banner
  ctx.save();
  ctx.translate(512, 200);
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(-340, -64, 680, 128, 24);
  ctx.fill();
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '800 64px "Outfit", sans-serif';
  ctx.fillText('GLOBALOPOLY', 0, 8);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('EKSPEDISI LINTAS BENUA', 0, 46);
  ctx.restore();

  // Bottom theme tagline from PDF Page 3
  ctx.save();
  ctx.translate(512, 840);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(-380, -44, 760, 88, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Melempar Dadu, Menghadapi Tantangan', 0, -4);
  ctx.fillStyle = '#FCD34D';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Era Revolusi Industri hingga Era Digital!', 0, 26);
  ctx.restore();

  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

export function createGlobeTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0284C7';
  ctx.fillRect(0, 0, 512, 256);

  // Ocean grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Stylized continents
  ctx.fillStyle = '#22C55E';
  const continents = [
    [110, 90, 48, 38], // North America
    [145, 165, 32, 42], // South America
    [250, 75, 42, 26], // Europe
    [265, 138, 44, 48], // Africa
    [350, 82, 72, 42], // Asia
    [405, 180, 34, 22], // Australia
  ];
  continents.forEach(([cx, cy, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

export function createCardDeckTexture(
  deck: 'chance' | 'community_chest',
  maxAniso: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  if (deck === 'chance') {
    const grad = ctx.createLinearGradient(0, 0, 320, 220);
    grad.addColorStop(0, '#F472B6');
    grad.addColorStop(1, '#DB2777');
    ctx.fillStyle = grad;
  } else {
    const grad = ctx.createLinearGradient(0, 0, 320, 220);
    grad.addColorStop(0, '#38BDF8');
    grad.addColorStop(1, '#0284C7');
    ctx.fillStyle = grad;
  }
  ctx.fillRect(0, 0, 320, 220);

  // Subtle circuit chip motif matching PDF page 15 & 17 card visuals
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, 292, 192);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.roundRect(32, 78, 38, 28, 5);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '800 28px "Outfit", sans-serif';
  ctx.fillText(deck === 'chance' ? 'KESEMPATAN' : 'DANA UMUM', 178, 102);
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(deck === 'chance' ? 'KARTU CHANCE' : 'COMMUNITY CHEST', 178, 134);

  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}

export function createDiceFaceTexture(value: number, maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 240, 240);

  const pipPositions: Record<number, [number, number][]> = {
    1: [[128, 128]],
    2: [
      [68, 68],
      [188, 188],
    ],
    3: [
      [68, 68],
      [128, 128],
      [188, 188],
    ],
    4: [
      [68, 68],
      [188, 68],
      [68, 188],
      [188, 188],
    ],
    5: [
      [68, 68],
      [188, 68],
      [128, 128],
      [68, 188],
      [188, 188],
    ],
    6: [
      [68, 64],
      [188, 64],
      [68, 128],
      [188, 128],
      [68, 192],
      [188, 192],
    ],
  };

  ctx.fillStyle = value === 1 ? '#DC2626' : '#0F172A';
  for (const [px, py] of pipPositions[value] || []) {
    ctx.beginPath();
    ctx.arc(px, py, value === 1 ? 28 : 21, 0, Math.PI * 2);
    ctx.fill();
  }

  return configureTexture(new THREE.CanvasTexture(canvas), maxAniso);
}
