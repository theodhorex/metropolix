// Procedural citizens: six sub-species per race, front/back views, 4-frame walk cycle + idle.
// 16x24 canvases, feet on row 23. Mirroring for left/right is done by the renderer.
import type { ArcId } from '@metropolix/sim';

const OUT = '#12151d';
export const SPECIES_COUNT = 6;
export const WALK_FRAMES = 4; // frame 4 = idle

type Hair = 'short' | 'long' | 'bald' | 'mohawk' | 'hood' | 'bun' | 'helmet' | 'wild';
type Tool = 'none' | 'bow' | 'club' | 'spear' | 'dagger' | 'basket' | 'hammer' | 'staff' | 'pick';
type Build = 'normal' | 'broad' | 'child';
interface Species {
  name: string; skin: string; hair: string; hairStyle: Hair; top: string; trim: string; bottom: string;
  build: Build; tool: Tool; eye?: string; beard?: boolean; apron?: boolean; goggles?: boolean; crown?: boolean;
}

const S = (name: string, skin: string, hair: string, hairStyle: Hair, top: string, trim: string, bottom: string, tool: Tool, build: Build = 'normal', extra: Partial<Species> = {}): Species =>
  ({ name, skin, hair, hairStyle, top, trim, bottom, tool, build, ...extra });

export const SPECIES: Record<ArcId, Species[]> = {
  elf: [
    S('Wood elf', '#f0d2b0', '#7a4a2a', 'long', '#2f8f55', '#d9c46a', '#5a3a22', 'bow'),
    S('High elf', '#f6e2c8', '#e8e8f0', 'long', '#f0ead8', '#e0b83a', '#c9c2ae', 'staff'),
    S('Dark elf', '#a9a0c0', '#f2f2ff', 'short', '#3a2f5a', '#8f6fd0', '#221a38', 'dagger', 'normal', { eye: '#ff6a8a' }),
    S('Elf child', '#f0d2b0', '#c9a050', 'short', '#6bbf6a', '#f0e0a0', '#7a5a3a', 'none', 'child'),
    S('Elf farmer', '#ecc9a2', '#8a5a30', 'bun', '#d8c070', '#8a6a30', '#5a4a2a', 'basket'),
    S('Elf guard', '#f0d2b0', '#5a3a22', 'helmet', '#3a7a4a', '#c0c8d0', '#34503a', 'spear'),
  ],
  lizard: [
    S('Marsh skink', '#4fae8a', '#2f7a5e', 'bald', '#d98a2b', '#f0e0a0', '#6a4a2a', 'staff', 'normal', { eye: '#f8e060' }),
    S('Sun gecko', '#e8a13a', '#c0501a', 'mohawk', '#a83a3a', '#f8d060', '#6a2a1a', 'none', 'normal', { eye: '#2a1a05' }),
    S('Iguana warrior', '#5a8ad0', '#2a4a8a', 'mohawk', '#4a5a7a', '#c0d0e8', '#2a3248', 'spear', 'broad', { eye: '#fff080' }),
    S('Chameleon trader', '#a888d8', '#6a48a8', 'bald', '#e0c24a', '#7a4ac0', '#4a3a2a', 'basket', 'normal', { eye: '#fff080' }),
    S('Hatchling', '#7fcf8a', '#3a9a58', 'bald', '#e07a2a', '#f8e060', '#6a4a2a', 'none', 'child', { eye: '#2a1a05' }),
    S('Cobra priest', '#7a9a4a', '#4a5a2a', 'hood', '#7a2a6a', '#f0d060', '#3a1a38', 'staff', 'normal', { eye: '#ffe040' }),
  ],
  caveman: [
    S('Hunter', '#d9a679', '#3a2418', 'wild', '#a8743f', '#e8d8b8', '#6f4a2a', 'club', 'normal', { beard: true }),
    S('Elder', '#d9b08a', '#e8e8e8', 'bald', '#c0a880', '#e8d8b8', '#8a6a42', 'staff', 'normal', { beard: true }),
    S('Gatherer', '#d9a679', '#5a3a22', 'bun', '#8a5a32', '#e8d8b8', '#6a4a2a', 'basket'),
    S('Cave child', '#e0b08a', '#4a2a18', 'wild', '#b88a52', '#e8d8b8', '#7a5a38', 'none', 'child'),
    S('Shaman', '#c8956a', '#2a1a10', 'wild', '#4a6a8a', '#e8d8b8', '#2a3a4a', 'staff', 'normal', { beard: true }),
    S('Brute', '#c8956a', '#2a1a10', 'bald', '#6f4a2a', '#c8a060', '#4a3220', 'hammer', 'broad', { beard: true }),
  ],
  dragon: [
    S('Drake warrior', '#b8483c', '#2a1a1a', 'bald', '#3a2a3a', '#d9a64a', '#1e1624', 'spear', 'broad', { eye: '#ffd34a' }),
    S('Scalekin smith', '#8a3a34', '#2a1a1a', 'bald', '#5a4a40', '#2a2a2a', '#2a2018', 'hammer', 'broad', { apron: true, eye: '#ffd34a' }),
    S('Wyrmling', '#d0604a', '#3a1a18', 'bald', '#d9a64a', '#fff0b0', '#5a2a20', 'none', 'child', { eye: '#ffffff' }),
    S('Dragon mage', '#a04a8a', '#2a1a2a', 'hood', '#5a2a8a', '#ffd34a', '#2a1648', 'staff', 'normal', { eye: '#ffe070' }),
    S('Ember noble', '#c85a3a', '#2a1a1a', 'bald', '#7a1a2a', '#ffd34a', '#3a0e18', 'none', 'normal', { crown: true, eye: '#ffd34a' }),
    S('Drake miner', '#7a6a6a', '#2a2a2a', 'helmet', '#4a4a52', '#d9a64a', '#2a2a32', 'pick', 'normal', { eye: '#ffd34a' }),
  ],
  goblin: [
    S('Scrapper', '#7fb347', '#3a4a22', 'mohawk', '#6b5a3a', '#9a9aa8', '#3a3020', 'dagger', 'normal', { eye: '#ffe04a' }),
    S('Tinker', '#8cbf4f', '#4a3a22', 'bald', '#7a4a2a', '#c8a050', '#3a2a1a', 'hammer', 'normal', { goggles: true, eye: '#ffe04a' }),
    S('Sneak', '#5f9a3a', '#2a3a1a', 'hood', '#3a4a3a', '#6a7a5a', '#222a1e', 'dagger', 'normal', { eye: '#ff9a3a' }),
    S('Gobbo kid', '#9ccf5a', '#4a5a2a', 'wild', '#8a6a2a', '#c8a050', '#4a3a1a', 'none', 'child', { eye: '#ffe04a' }),
    S('Warboss', '#6a9a3a', '#2a3a1a', 'helmet', '#5a4a3a', '#b8b8c8', '#2e2418', 'club', 'broad', { eye: '#ff6a3a' }),
    S('Scavenger', '#86b64a', '#4a3a22', 'bun', '#8a7a4a', '#c8a050', '#3a3220', 'basket', 'normal', { eye: '#ffe04a' }),
  ],
};
export const NAMES: Record<ArcId, string[]> = {
  elf: ['Aelwen', 'Thalior', 'Sylvara', 'Eryndor', 'Lirael', 'Faelan', 'Mirelle', 'Caerys'],
  lizard: ['Sssora', 'Ketzal', 'Vessik', 'Nahuatl', 'Ixchel', 'Zarrak', 'Tessa-ka', 'Oloxi'],
  caveman: ['Ugra', 'Brok', 'Mogha', 'Tarn', 'Grusha', 'Dokk', 'Yara', 'Bonk'],
  dragon: ['Pyrrhax', 'Ignara', 'Vaelkor', 'Cindra', 'Drakon', 'Embris', 'Skaldra', 'Rhogar'],
  goblin: ['Snik', 'Gribble', 'Nurk', 'Zazzle', 'Fizzwick', 'Grot', 'Mizzle', 'Krag'],
};
export const npcName = (arc: ArcId, id: number) => NAMES[arc][id % NAMES[arc].length]!;
export const speciesName = (arc: ArcId, v: number) => SPECIES[arc][v % SPECIES_COUNT]!.name;

export function drawCitizen(arc: ArcId | null, variant: number, view: 'front' | 'back', frame: number): HTMLCanvasElement {
  const a: ArcId = arc ?? 'elf';
  const sp = SPECIES[a][variant % SPECIES_COUNT]!;
  const c = document.createElement('canvas'); c.width = 16; c.height = 24;
  const ctx = c.getContext('2d')!;
  const R = (x: number, y: number, w: number, h: number, col: string) => { ctx.fillStyle = col; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const O = (x: number, y: number, w: number, h: number) => R(x - 1, y - 1, w + 2, h + 2, OUT);

  const idle = frame >= 4;
  const f = idle ? 0 : frame & 3;
  const liftL = idle ? 0 : [2, 1, 0, 1][f]!;
  const liftR = idle ? 0 : [0, 1, 2, 1][f]!;
  const armL = idle ? 0 : [1, 0, -1, 0][f]!;
  const armR = -armL;
  const bob = idle ? 0 : [0, -1, 0, -1][f]!;

  const child = sp.build === 'child', broad = sp.build === 'broad';
  const legLen = child ? 3 : 6, torsoH = child ? 5 : 7, tw = broad ? 8 : 6;
  const legTop = 23 - legLen, torsoTop = legTop - torsoH + bob, headTop = torsoTop - 6;
  const tx = 8 - tw / 2;
  const back = view === 'back';
  const dark = (col: string) => shade(col, -34);

  // tails and wings sit behind the body
  if (a === 'lizard' || a === 'dragon') {
    const tc = a === 'lizard' ? sp.skin : sp.skin;
    const sway = idle ? 0 : [0, 1, 0, -1][f]!;
    O(10, legTop - 1, 4, 2); R(10, legTop - 1, 4, 2, tc); O(13 + sway, legTop, 2, 2); R(13 + sway, legTop, 2, 2, dark(tc));
  }
  if (a === 'dragon' && !child) { R(3, torsoTop + 1, 2, 3, '#7a2a24'); R(11, torsoTop + 1, 2, 3, '#7a2a24'); }

  // legs (raised leg is drawn shorter)
  const legW = broad ? 3 : 2;
  const lx = 8 - legW - 0, rx = 8;
  O(lx, legTop + liftL, legW, legLen - liftL); R(lx, legTop + liftL, legW, legLen - liftL, sp.bottom);
  O(rx, legTop + liftR, legW, legLen - liftR); R(rx, legTop + liftR, legW, legLen - liftR, sp.bottom);
  R(lx, 22 - liftL * 0, legW, 1, dark(sp.bottom)); R(rx, 22, legW, 1, dark(sp.bottom));
  if (a === 'caveman' || a === 'lizard') { R(lx, legTop + liftL + 1, legW, legLen - liftL - 1, sp.skin); R(rx, legTop + liftR + 1, legW, legLen - liftR - 1, sp.skin); }

  // arms
  const armH = child ? 3 : 5;
  const axL = tx - 2, axR = tx + tw;
  O(axL, torsoTop + 1 + armL, 2, armH); R(axL, torsoTop + 1 + armL, 2, armH, sp.skin);
  O(axR, torsoTop + 1 + armR, 2, armH); R(axR, torsoTop + 1 + armR, 2, armH, sp.skin);
  R(axL, torsoTop + 1 + armL, 2, 2, sp.top); R(axR, torsoTop + 1 + armR, 2, 2, sp.top);

  // tool in the right hand
  tool(sp.tool, axR + 1, torsoTop + armR, child, R, O, sp);

  // torso
  O(tx, torsoTop, tw, torsoH); R(tx, torsoTop, tw, torsoH, sp.top);
  R(tx, torsoTop + torsoH - 2, tw, 1, sp.trim); // belt / hem
  R(tx, torsoTop + 1, 1, torsoH - 3, shade(sp.top, 26)); // light from the left
  if (sp.apron) R(tx + 1, torsoTop + 2, tw - 2, torsoH - 2, '#8a6a42');
  if (a === 'caveman' && !back) { R(tx + 1, torsoTop + 1, 1, 1, sp.trim); R(tx + tw - 2, torsoTop + 2, 1, 1, sp.trim); }
  if (back && a === 'goblin') R(tx + 1, torsoTop + 1, tw - 2, 2, '#4a3a22');

  // head
  const hx = 5, hw = 6;
  if (a === 'elf' || a === 'goblin') {
    const big = a === 'goblin';
    O(hx - (big ? 3 : 2), headTop + 2, big ? 3 : 2, 1); R(hx - (big ? 3 : 2), headTop + 2, big ? 3 : 2, 1, sp.skin);
    O(hx + hw, headTop + 2, big ? 3 : 2, 1); R(hx + hw, headTop + 2, big ? 3 : 2, 1, sp.skin);
  }
  O(hx, headTop, hw, 6); R(hx, headTop, hw, 6, sp.skin);
  if (a === 'dragon') { R(hx, headTop - 2, 1, 2, '#e8d8b8'); R(hx + hw - 1, headTop - 2, 1, 2, '#e8d8b8'); }
  if (a === 'lizard' && sp.hairStyle !== 'hood') { R(hx + 1, headTop - 1, 4, 1, sp.hair); }
  hair(sp.hairStyle, hx, hw, headTop, back, sp, R, O);
  if (sp.crown) { R(hx, headTop - 1, hw, 1, '#ffd34a'); R(hx + 1, headTop - 2, 1, 1, '#ffd34a'); R(hx + 4, headTop - 2, 1, 1, '#ffd34a'); }
  if (!back) {
    const ey = headTop + 3;
    R(hx + 1, ey, 1, 1, sp.eye ?? '#1a1a22'); R(hx + hw - 2, ey, 1, 1, sp.eye ?? '#1a1a22');
    if (sp.goggles) { R(hx, ey - 1, hw, 2, '#6a5a2a'); R(hx + 1, ey - 1, 1, 2, '#9ad0e0'); R(hx + hw - 2, ey - 1, 1, 2, '#9ad0e0'); }
    if (sp.beard) R(hx + 1, headTop + 4, hw - 2, 2, sp.hair);
    else R(hx + 2, headTop + 5, 2, 1, dark(sp.skin));
    if (a === 'lizard' && !child) R(hx + 2, headTop + 4, 2, 1, dark(sp.skin));
  }
  return c;
}

function hair(style: Hair, hx: number, hw: number, headTop: number, back: boolean, sp: Species, R: (x: number, y: number, w: number, h: number, c: string) => void, O: (x: number, y: number, w: number, h: number) => void) {
  const col = sp.hair;
  switch (style) {
    case 'short': R(hx, headTop, hw, back ? 5 : 2, col); break;
    case 'long': R(hx, headTop, hw, back ? 6 : 2, col); R(hx - 1, headTop + 1, 1, 6, col); R(hx + hw, headTop + 1, 1, 6, col); break;
    case 'bald': if (back) R(hx, headTop, hw, 1, shade(sp.skin, -20)); break;
    case 'mohawk': R(hx + 2, headTop - 2, 2, 3, col); if (back) R(hx + 2, headTop + 1, 2, 4, col); break;
    case 'hood': O(hx - 1, headTop - 1, hw + 2, 3); R(hx - 1, headTop - 1, hw + 2, back ? 7 : 3, sp.top); R(hx - 1, headTop - 1, hw + 2, 1, shade(sp.top, 24)); break;
    case 'bun': R(hx, headTop, hw, back ? 4 : 2, col); R(hx + 2, headTop - 2, 2, 2, col); break;
    case 'helmet': O(hx - 1, headTop - 1, hw + 2, 3); R(hx - 1, headTop - 1, hw + 2, back ? 5 : 3, '#8a95a8'); R(hx - 1, headTop - 1, hw + 2, 1, '#c8d0e0'); R(hx + 2, headTop - 3, 2, 2, sp.trim); break;
    case 'wild': R(hx - 1, headTop - 1, hw + 2, back ? 6 : 3, col); R(hx, headTop - 2, 2, 1, col); R(hx + 3, headTop - 2, 2, 1, col); break;
  }
}

function tool(t: Tool, x: number, y: number, child: boolean, R: (x: number, y: number, w: number, h: number, c: string) => void, O: (x: number, y: number, w: number, h: number) => void, sp: Species) {
  if (t === 'none' || child) return;
  const wood = '#7a5230';
  switch (t) {
    case 'bow': R(x + 1, y - 4, 1, 12, wood); R(x, y - 3, 1, 1, wood); R(x, y + 6, 1, 1, wood); R(x + 2, y - 3, 1, 10, '#e8e8d8'); break;
    case 'club': R(x + 1, y + 1, 2, 6, wood); R(x, y - 2, 4, 3, '#8a6240'); break;
    case 'spear': R(x + 1, y - 6, 1, 15, wood); R(x, y - 8, 3, 3, '#c8d0e0'); break;
    case 'dagger': R(x + 1, y + 3, 1, 4, '#c8d0e0'); R(x, y + 6, 3, 1, wood); break;
    case 'basket': R(x - 2, y + 4, 5, 3, '#b88a42'); R(x - 2, y + 4, 5, 1, '#d8aa5a'); R(x - 1, y + 3, 3, 1, sp.hair); break;
    case 'hammer': R(x + 1, y - 1, 1, 9, wood); R(x - 1, y - 3, 5, 3, '#9aa3b4'); break;
    case 'staff': R(x + 1, y - 7, 1, 16, wood); R(x, y - 9, 3, 3, sp.trim); break;
    case 'pick': R(x + 1, y - 2, 1, 10, wood); R(x - 2, y - 3, 7, 2, '#9aa3b4'); break;
  }
}

function shade(hex: string, d: number): string {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const r = cl((n >> 16) + d), g = cl(((n >> 8) & 255) + d), b = cl((n & 255) + d);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
