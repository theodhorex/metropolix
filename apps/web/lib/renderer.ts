import {
  Application,
  CanvasSource,
  Container,
  Graphics,
  Sprite,
  Texture,
  TilingSprite,
  type FederatedPointerEvent,
  type Ticker,
} from 'pixi.js';
import { buildingLevel, GRID, type ArcId, type BuildingKind, type GameState } from '@metropolix/sim';
import { Ambience, type LightSpot, type WaterSpot } from './ambience';
import { preloadPaintedArt } from './painted';
import { pickProp, ringShade, WILD_RINGS, wildTheme, type WildTheme } from './wilds';
import { GLOW_SCALE, MAP_H, MAP_W, occupancyKey, paintGlow, paintPatches, paintPaths, shadowCanvas, TERRAIN_SCALE, terrainLook, vignetteCanvas } from './terrain';
import { BADGE_H, BADGE_W, buildSpriteBank, destroySpriteBank, SPRITE_W, TILE_H, tileHash, type SpriteBank } from './sprites';

export const TW = 64; // tile width in world px
export const TH = 32; // tile height
const MARGIN_TOP = 110; // room for tall buildings above the grid

type Tile = { x: number; y: number };

/** 'high': sharp on HiDPI, 60 fps, full crowd. 'lite': 1x pixels, 30 fps, smaller crowd. */
export type Quality = 'high' | 'lite';
const QUALITY = {
  high: { maxRes: 2, fps: 60, walkers: 36, soldiers: 12 },
  lite: { maxRes: 1, fps: 30, walkers: 14, soldiers: 6 },
} as const;

interface AnimEntry {
  sprite: Sprite;
  frames: Texture[];
  phase: number;
}

interface Walker {
  sprite: Sprite;
  x: number;
  y: number;
  tx: number;
  ty: number;
  v: number;
  speed: number;
  wait: number;
  dist: number;
  view: 0 | 1;
  flip: number;
  id: number;
  ax?: number;
  ay?: number;
}

/** Art drawn at 2x (128 px wide) is shown at half scale, so every sprite covers one 64 px tile. */
function fitTile(sp: Sprite) {
  const k = SPRITE_W / (sp.texture.width || SPRITE_W);
  if (sp.scale.x !== k) sp.scale.set(k);
}

/** A seamless tile of forest canopy (256x128 world px) packed with the given tree clumps, back to front. */
function canopyCanvas(trees: HTMLCanvasElement[]): HTMLCanvasElement {
  const W = 256, H = 128, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const spots: { x: number; y: number; t: HTMLCanvasElement }[] = [];
  for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) {
    const h = tileHash(i, j, 917);
    spots.push({ x: i * 64 + (j & 1) * 32 + (h % 9) - 4, y: j * 16 + ((h >>> 4) % 5) - 2, t: trees[(h >>> 8) % trees.length]! });
  }
  spots.sort((a, b) => a.y - b.y);
  // each tree is drawn with its wrapped copies, so the tile repeats with no seam
  for (const dy of [-H, 0, H]) for (const s of spots) for (const dx of [-W, 0, W]) {
    const k = 64 / s.t.width, hh = s.t.height * k;
    ctx.drawImage(s.t, s.x + dx - 32, s.y + dy + 16 - hh, 64, hh);
  }
  return c;
}

export const tileToWorld = (x: number, y: number) => ({ x: ((x - y) * TW) / 2, y: ((x + y) * TH) / 2 });

export interface CityRendererOptions {
  /** Draw without the dark backdrop (the canvas is see-through), for pages that paint their own sky. */
  transparent?: boolean;
  /**
   * Draw only the tiles in this inclusive rectangle and hang an earthen cliff, vines, a small waterfall
   * and drifting rocks under its two front edges, so the map reads as a floating island (landing page).
   * Citizens stay on the island. The game itself leaves this unset.
   */
  island?: { x0: number; y0: number; x1: number; y1: number };
}

/** Earth and stone layers of the island cliff, [lit face, shaded face], top to bottom. */
const CLIFF = {
  lip: [0x4f9a45, 0x3d7d39],
  soil: [0x9a6238, 0x774a2a],
  earth: [0x7d4c2c, 0x5f3920],
  deep: [0x613a24, 0x472a19],
  stone: [0x777482, 0x58566a],
  rim: [0x46434f, 0x34323f],
  pebble: [0xa39c94, 0x857f78],
  root: [0xc9a46c, 0xa88552],
  vine: 0x3f8f3c,
  leaf: 0x6fc25a,
};

export class CityRenderer {
  private app = new Application();
  private world = new Container();
  private ground = new Container();
  private blocks = new Container();
  private badges = new Container();
  private cursor = new Graphics();
  private ready = false;
  private destroyed = false;
  private state: GameState | null = null;
  private hover: Tile | null = null;
  private hoverBad = false;
  /** Optional judge for the hover tile (set by the UI): true paints the cursor red. */
  hoverCheck: ((t: Tile) => boolean) | null = null;
  private placing = true;
  private arc: ArcId | null = null;

  private bank: SpriteBank | null = null;
  private groundSprites: Sprite[][] = [];
  private baseGroundTex: Texture[][] = [];
  private spritePool: Sprite[] = [];
  private badgePool: Sprite[] = [];
  private animEntries: AnimEntry[] = [];
  private animElapsedMs = 0;
  private animTick = 0;
  private walkers: Walker[] = [];
  private soldiers: Walker[] = [];
  private barracksAnchors: Tile[] = [];
  private walkLayer = new Container();
  private underside = new Container();
  // the wilds around the map (game only): ground, scenery behind and in front of the city, then the air
  private wildGround = new Container();
  private wildBack = new Container();
  private wildFront = new Container();
  private skyLayer = new Container();
  private airLayer = new Container();
  private wildTex: Texture[][] = [];
  // game only: painted ground patches, worn paths, warm light, building shadows and a screen vignette
  private terrain = new Container();
  private shadows = new Container();
  private shadowPool: Sprite[] = [];
  private shadowTex: Texture | null = null;
  private patchTex: Texture | null = null;
  private pathCanvas: HTMLCanvasElement | null = null;
  private pathTex: Texture | null = null;
  private glowCanvas: HTMLCanvasElement | null = null;
  private glowTex: Texture | null = null;
  private occKey = '';
  // game only: wild props (trees, rocks, bushes) standing on open map tiles; cleared where you build
  private theme: WildTheme | null = null;
  private propTex: Texture[][] = [];
  private decor: Int16Array | null = null;
  private decorKey = '';
  private vignette: Sprite | null = null;
  private framed = false;
  private wildAnims: AnimEntry[] = [];
  private wildMs = 0;
  private wildTick = 0;
  private ambience: Ambience | null = null;
  private readonly calm = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  private rocks: { g: Graphics; y: number; phase: number }[] = [];
  private falls: TilingSprite[] = [];
  private waterTex: Texture | null = null;
  private bobMs = 0;
  private baseY = 0;
  private effK = 1;
  // tiles citizens may use: the whole map, or the island
  private bx0 = 0;
  private by0 = 0;
  private bx1 = GRID - 1;
  private by1 = GRID - 1;
  private wantWalkers = 0;
  private previews = new Map<string, string>();
  private quality: Quality = 'high';
  /** In auto mode the renderer drops to 'lite' by itself when frames stay slow. */
  private autoQuality = true;
  private slowMs = 0;
  private sampleMs = 0;
  private paused = false;
  /** Called when auto mode switches quality, so the UI can show it. */
  onQualityChange: (q: Quality) => void = () => {};

  // camera: (cx, cy) is the world point at screen centre, k the zoom
  private cx = 0;
  private cy = 0;
  private k = 1;
  private minK = 0.2;
  private zoomBoost = 1;
  private drag: { sx: number; sy: number; px: number; py: number; moved: boolean } | null = null;
  private wheelHandler: ((e: WheelEvent) => void) | null = null;

  onTileClick: (t: Tile) => void = () => {};
  onTileHover: (t: Tile | null) => void = () => {};
  onNpcClick: (n: { id: number; variant: number; x: number; y: number }) => void = () => {};
  private pausedNpc = -1;
  private hoverNpc = -1;
  private npcSeq = 0;

  constructor(private readonly options: CityRendererOptions = {}) {
    const isl = options.island;
    if (isl) { this.bx0 = isl.x0; this.by0 = isl.y0; this.bx1 = isl.x1; this.by1 = isl.y1; }
  }

  private inBounds(x: number, y: number) { return x >= this.bx0 && y >= this.by0 && x <= this.bx1 && y <= this.by1; }
  private clampX(v: number) { return Math.max(this.bx0, Math.min(this.bx1, v)); }
  private clampY(v: number) { return Math.max(this.by0, Math.min(this.by1, v)); }

  async init(host: HTMLElement) {
    // PixiJS v8 Application initialization & stage setup
    // Source: https://pixijs.download/v8.22.0/docs/app.Application.html#init
    await this.app.init({
      resizeTo: host,
      ...(this.options.transparent ? { backgroundAlpha: 0 } : { background: 0x0e131d }),
      antialias: false,
      roundPixels: true,
      resolution: Math.min(window.devicePixelRatio || 1, QUALITY[this.quality].maxRes),
      autoDensity: true,
      // a flat pixel-art scene runs fine on the integrated GPU; this saves battery on dual-GPU laptops
      powerPreference: 'low-power',
    });
    this.app.ticker.maxFPS = QUALITY[this.quality].fps;
    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }
    // this people's rendered art must be in memory before the bank is built (re-check: the arc may change meanwhile)
    for (let a = this.arc; ; a = this.arc) { await preloadPaintedArt(a); if (a === this.arc || this.destroyed) break; }
    if (this.destroyed) { this.app.destroy(true); return; }
    this.bank = buildSpriteBank(this.arc);
    host.appendChild(this.app.canvas);
    this.walkLayer.sortableChildren = true;
    // the stage is interactive, so descendants inherit it: keep decor out of hit testing so citizens receive clicks
    this.ground.eventMode = 'none';
    this.blocks.eventMode = 'none';
    this.badges.eventMode = 'none';
    this.cursor.eventMode = 'none';
    this.underside.eventMode = 'none';
    for (const c of [this.wildGround, this.wildBack, this.wildFront, this.skyLayer, this.airLayer, this.terrain, this.shadows]) c.eventMode = 'none';
    this.world.addChild(this.underside, this.wildGround, this.ground, this.terrain, this.shadows, this.wildBack, this.blocks, this.wildFront, this.badges, this.walkLayer, this.skyLayer, this.airLayer, this.cursor);
    this.app.stage.addChild(this.world);
    if (!this.options.island) {
      this.shadowTex = Texture.from(shadowCanvas());
      this.vignette = new Sprite({ eventMode: 'none' });
      this.app.stage.addChild(this.vignette);
    }
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
      this.drag = { sx: e.global.x, sy: e.global.y, px: this.cx, py: this.cy, moved: false };
    });
    this.app.stage.on('pointermove', (e: FederatedPointerEvent) => {
      const d = this.drag;
      if (d) {
        const dx = e.global.x - d.sx, dy = e.global.y - d.sy;
        if (!d.moved && Math.hypot(dx, dy) > 5) d.moved = true;
        if (d.moved) {
          this.cx = d.px - dx / this.k;
          this.cy = d.py - dy / this.k;
          this.applyView();
          this.setHover(null);
          return;
        }
      }
      this.setHover(this.pick(e));
    });
    const endDrag = (e: FederatedPointerEvent) => {
      const d = this.drag;
      this.drag = null;
      if (d && !d.moved) {
        const t = this.pick(e);
        if (t) this.onTileClick(t);
      }
    };
    this.app.stage.on('pointerup', endDrag);
    this.app.stage.on('pointerupoutside', () => { this.drag = null; });
    this.app.stage.on('pointerleave', () => this.setHover(null));
    this.wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      this.zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.offsetX, e.offsetY);
    };
    this.app.canvas.addEventListener('wheel', this.wheelHandler, { passive: false });
    this.app.renderer.on('resize', () => this.applyView());
    // PixiJS v8 Ticker listener for lightweight sprite frame animation
    // Source: https://pixijs.download/v8.22.0/docs/ticker.Ticker.html#add
    this.app.ticker.add(this.onTick, this);
    this.drawGround();
    this.drawWilds();
    this.drawTerrain();
    this.drawIsland();
    this.resetView();
    this.ready = true;
    this.applyQuality(this.quality);
    if (this.paused) this.app.ticker.stop();
    this.warmPreviews();
    if (this.state) this.draw(this.state);
  }

  destroy() {
    this.destroyed = true;
    if (this.ready) {
      if (this.wheelHandler) this.app.canvas.removeEventListener('wheel', this.wheelHandler);
      this.app.ticker.remove(this.onTick, this);
      this.app.destroy(true, { children: true });
    }
    this.ambience?.destroy();
    this.ambience = null;
    this.clearWildTex();
    this.clearTerrain();
    this.shadowTex?.destroy(true);
    this.shadowTex = null;
    this.waterTex?.destroy(true);
    this.waterTex = null;
    this.falls.length = 0;
    this.rocks.length = 0;
    this.clearPreviews();
    if (this.bank) {
      destroySpriteBank(this.bank);
      this.bank = null;
    }
    this.groundSprites.length = 0;
    this.baseGroundTex.length = 0;
    this.spritePool.length = 0;
    this.badgePool.length = 0;
    this.animEntries.length = 0;
    this.walkers.length = 0;
    this.soldiers.length = 0;
    this.barracksAnchors.length = 0;
  }

  private onTick(ticker: Ticker) {
    this.watchFrameRate(ticker.deltaMS);
    this.moveWalkers(ticker.deltaMS);
    if (this.options.island) this.floatIsland(ticker.deltaMS);
    this.animateWilds(ticker.deltaMS);
    if (this.animEntries.length === 0) return;
    this.animElapsedMs += ticker.deltaMS;
    if (this.animElapsedMs < 280) return;
    this.animElapsedMs %= 280;
    this.animTick = (this.animTick + 1) >>> 0;
    for (let i = 0; i < this.animEntries.length; i++) {
      const entry = this.animEntries[i]!;
      entry.sprite.texture = entry.frames[(this.animTick + entry.phase) % entry.frames.length]!;
    }
  }

  /**
   * Auto quality: if most frames over the last few seconds missed the target by a wide margin,
   * switch to 'lite' once. Long gaps (tab in background, a breakpoint) are ignored.
   */
  private watchFrameRate(dt: number) {
    if (!this.autoQuality || this.quality === 'lite' || dt > 250) return;
    this.sampleMs += dt;
    if (dt > 1000 / 38) this.slowMs += dt;
    if (this.sampleMs < 4000) return;
    const slow = this.slowMs / this.sampleMs;
    this.sampleMs = 0; this.slowMs = 0;
    if (slow > 0.5) { this.applyQuality('lite'); this.onQualityChange('lite'); }
  }

  /** Pick a quality. 'auto' starts high (or lite when the browser asks to save data) and watches the frame rate. */
  setQuality(q: Quality | 'auto') {
    this.autoQuality = q === 'auto';
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { saveData?: boolean } }) : null;
    const start: Quality = q === 'auto' ? (nav?.connection?.saveData ? 'lite' : 'high') : q;
    this.sampleMs = 0; this.slowMs = 0;
    this.applyQuality(start);
    return start;
  }

  private applyQuality(q: Quality) {
    this.quality = q;
    if (!this.ready) return;
    const cfg = QUALITY[q];
    const res = Math.min(window.devicePixelRatio || 1, cfg.maxRes);
    if (this.app.renderer.resolution !== res) this.app.renderer.resize(this.app.screen.width, this.app.screen.height, res);
    this.app.ticker.maxFPS = cfg.fps;
    this.ambience?.setLite(q === 'lite');
    this.syncWalkers();
  }

  /** Stop drawing while a full window covers the map; the city keeps simulating. */
  setPaused(p: boolean) {
    if (p === this.paused) return;
    this.paused = p;
    if (!this.ready) return;
    if (p) this.app.ticker.stop(); else this.app.ticker.start();
  }

  /** Free tiles (no building) a citizen may stand on; they roam only between roads of empty land. */
  private freeTile(): Tile | null {
    const s = this.state;
    if (!s) return null;
    for (let i = 0; i < 30; i++) {
      const x = this.bx0 + Math.floor(Math.random() * (this.bx1 - this.bx0 + 1));
      const y = this.by0 + Math.floor(Math.random() * (this.by1 - this.by0 + 1));
      if (!s.grid[y]![x]) return { x, y };
    }
    return null;
  }

  /** Free tile within ~3 tiles of a barracks at (ax, ay) for soldier patrol. */
  private freeSoldierTile(ax: number, ay: number): Tile | null {
    const s = this.state;
    if (!s) return null;
    for (let i = 0; i < 24; i++) {
      const x = this.clampX(ax + Math.floor(Math.random() * 7) - 3);
      const y = this.clampY(ay + Math.floor(Math.random() * 7) - 3);
      if (!s.grid[y]![x]) return { x, y };
    }
    for (let dy = -3; dy <= 3; dy++) {
      const y = ay + dy;
      for (let dx = -3; dx <= 3; dx++) {
        const x = ax + dx;
        if (this.inBounds(x, y) && !s.grid[y]![x]) return { x, y };
      }
    }
    return this.freeTile();
  }

  private syncWalkers() {
    const bank = this.bank, s = this.state;
    if (!bank || !s) return;
    const want = Math.min(QUALITY[this.quality].walkers, Math.ceil(s.pop / 5));
    while (this.walkers.length > want) { const w = this.walkers.pop()!; w.sprite.destroy(); }
    while (this.walkers.length < want) {
      const t = this.freeTile();
      if (!t) break;
      const v = Math.floor(Math.random() * bank.citizens.length);
      const sprite = new Sprite({ texture: bank.citizens[v]![0]![4]!, roundPixels: true });
      sprite.scale.set((0.8 * 16) / (sprite.texture.width || 16));
      sprite.anchor.set(0.5, 1);
      const id = this.npcSeq++;
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      sprite.on('pointerover', () => { this.hoverNpc = id; this.setHover(null); });
      sprite.on('pointerout', () => { if (this.hoverNpc === id) this.hoverNpc = -1; });
      sprite.on('pointerdown', (e: FederatedPointerEvent) => e.stopPropagation());
      sprite.on('pointerup', (e: FederatedPointerEvent) => e.stopPropagation());
      sprite.on('pointertap', (e: FederatedPointerEvent) => {
        e.stopPropagation();
        const w = this.walkers.find((x) => x.id === id);
        if (!w) return;
        const g = sprite.getGlobalPosition();
        this.onNpcClick({ id, variant: w.v, x: g.x, y: g.y - 12 });
      });
      this.walkLayer.addChild(sprite);
      this.walkers.push({ sprite, x: t.x, y: t.y, tx: t.x, ty: t.y, v, speed: (v === 3 ? 0.9 : 0.6) + Math.random() * 0.4, wait: Math.random() * 2000, dist: Math.random() * 4, view: 0, flip: 1, id });
    }
    for (const w of this.walkers) {
      if (s.grid[Math.round(w.y)]?.[Math.round(w.x)]) { const t = this.freeTile(); if (t) { w.x = w.tx = t.x; w.y = w.ty = t.y; } }
    }

    // Collect barracks anchors prioritized by building level (level 3 first, then 2, then 1)
    this.barracksAnchors.length = 0;
    for (let targetLv = 3; targetLv >= 1; targetLv--) {
      for (let y = 0; y < GRID; y++) {
        const row = s.grid[y]!;
        for (let x = 0; x < GRID; x++) {
          if (row[x] === 'barracks' && buildingLevel(s, x, y) === targetLv) {
            for (let rep = 0; rep < targetLv; rep++) {
              this.barracksAnchors.push({ x, y });
            }
          }
        }
      }
    }

    const wantSoldiers = this.barracksAnchors.length > 0 && s.troops > 0
      ? Math.min(QUALITY[this.quality].soldiers, Math.ceil(s.troops / 6))
      : 0;
    while (this.soldiers.length > wantSoldiers) { const w = this.soldiers.pop()!; w.sprite.destroy(); }
    while (this.soldiers.length < wantSoldiers) {
      const anchor = this.barracksAnchors[this.soldiers.length % this.barracksAnchors.length]!;
      const t = this.freeSoldierTile(anchor.x, anchor.y);
      if (!t) break;
      const sprite = new Sprite({ texture: bank.soldiers[0]![4]!, roundPixels: true });
      sprite.anchor.set(0.5, 1);
      sprite.scale.set((0.8 * 16) / (sprite.texture.width || 16));
      sprite.position.set(((t.x - t.y) * TW) / 2, ((t.x + t.y) * TH) / 2 + TH / 2 + 2);
      sprite.zIndex = t.x + t.y;
      sprite.eventMode = 'none';
      this.walkLayer.addChild(sprite);
      this.soldiers.push({
        sprite,
        x: t.x,
        y: t.y,
        tx: t.x,
        ty: t.y,
        v: 0,
        speed: 0.75 + Math.random() * 0.35,
        wait: Math.random() * 800,
        dist: Math.random() * 4,
        view: 0,
        flip: 1,
        id: -1,
        ax: anchor.x,
        ay: anchor.y,
      });
    }
    for (let i = 0; i < this.soldiers.length; i++) {
      const w = this.soldiers[i]!;
      const anchor = this.barracksAnchors[i % this.barracksAnchors.length]!;
      w.ax = anchor.x;
      w.ay = anchor.y;
      if (s.grid[Math.round(w.y)]?.[Math.round(w.x)] || Math.abs(w.x - anchor.x) > 4 || Math.abs(w.y - anchor.y) > 4) {
        const t = this.freeSoldierTile(anchor.x, anchor.y);
        if (t) {
          w.x = w.tx = t.x;
          w.y = w.ty = t.y;
          w.sprite.position.set(((t.x - t.y) * TW) / 2, ((t.x + t.y) * TH) / 2 + TH / 2 + 2);
          w.sprite.zIndex = t.x + t.y;
        }
      }
    }
  }

  private stepWalker(w: Walker, set: Texture[][], s: GameState, dt: number) {
    const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
    let frame = 4; // idle
    if (w.id >= 0 && (w.id === this.pausedNpc || w.id === this.hoverNpc)) {
      w.wait = Math.max(w.wait, 500); // stand still and wait while the player talks to them
    } else if (d < 0.05) {
      w.wait -= dt;
      if (w.wait <= 0) {
        const nx = w.ax !== undefined
          ? this.clampX(w.ax + Math.floor(Math.random() * 7) - 3)
          : this.clampX(Math.round(w.x + (Math.random() * 8 - 4)));
        const ny = w.ay !== undefined
          ? this.clampY(w.ay + Math.floor(Math.random() * 7) - 3)
          : this.clampY(Math.round(w.y + (Math.random() * 8 - 4)));
        if (!s.grid[ny]![nx]) { w.tx = nx; w.ty = ny; }
        w.wait = w.ax !== undefined ? 300 + Math.random() * 1400 : 400 + Math.random() * 2500;
      }
    } else {
      const stepLen = Math.min(d, (w.speed * dt) / 1000);
      const nx = w.x + (dx / d) * stepLen, ny = w.y + (dy / d) * stepLen;
      if (s.grid[Math.round(ny)]?.[Math.round(nx)]) { w.tx = w.x; w.ty = w.y; w.wait = 0; }
      else { w.x = nx; w.y = ny; w.dist += stepLen; }
      // screen direction from the dominant tile axis: +x down-right, +y down-left, -x up-left, -y up-right
      const alongX = Math.abs(dx) >= Math.abs(dy);
      const down = alongX ? dx > 0 : dy > 0;
      w.view = down ? 0 : 1;
      w.flip = alongX ? (down ? 1 : -1) : (down ? -1 : 1);
      frame = Math.floor(w.dist * 5) % 4;
    }
    w.sprite.texture = set[w.view]![frame]!;
    // walkers show 16x24 art at 0.8; rendered (Blender) walkers are 64x96, so they are scaled by their width
    const k = (0.8 * 16) / (w.sprite.texture.width || 16);
    w.sprite.scale.set(w.flip * k, k);
    w.sprite.position.set(((w.x - w.y) * TW) / 2, ((w.x + w.y) * TH) / 2 + TH / 2 + 2);
    w.sprite.zIndex = w.x + w.y;
  }

  private moveWalkers(dt: number) {
    const bank = this.bank, s = this.state;
    if (!bank || !s || (this.walkers.length === 0 && this.soldiers.length === 0)) return;
    for (let i = 0; i < this.walkers.length; i++) {
      const w = this.walkers[i]!;
      this.stepWalker(w, bank.citizens[w.v]!, s, dt);
    }
    for (let i = 0; i < this.soldiers.length; i++) {
      this.stepWalker(this.soldiers[i]!, bank.soldiers, s, dt);
    }
  }

  private static readonly MAX_K = 2.5;
  private static readonly VISIBLE_TILES = 24; // default view shows about this many tiles across

  private applyView() {
    const { width, height } = this.app.screen;
    const fit = Math.min(width / (GRID * TW + 40), height / (GRID * TH + MARGIN_TOP + 30));
    // in the game the wilds frame the map, so zooming out a little further shows the forest around it
    this.minK = this.options.island ? fit : fit * 0.8;
    this.k = Math.min(CityRenderer.MAX_K, Math.max(this.minK, this.k));
    const padX = this.options.island ? 0 : 4 * TW, padY = this.options.island ? 0 : 4 * TH;
    this.cx = Math.min((GRID * TW) / 2 + padX, Math.max(-(GRID * TW) / 2 - padX, this.cx));
    this.cy = Math.min(GRID * TH + padY, Math.max(-MARGIN_TOP - padY, this.cy));
    const effK = Math.min(CityRenderer.MAX_K, Math.max(this.minK, this.k * this.zoomBoost));
    this.effK = effK;
    this.baseY = Math.round(height / 2 - this.cy * effK);
    this.world.scale.set(effK);
    this.world.position.set(Math.round(width / 2 - this.cx * effK), this.baseY + this.bob());
    this.app.stage.hitArea = this.app.screen;
    if (this.vignette) { this.vignette.width = width; this.vignette.height = height; }
  }

  /** Centre the map at a comfortable default zoom. */
  resetView() {
    if (this.frameCity()) return;
    const { width } = this.app.screen;
    this.k = width / (CityRenderer.VISIBLE_TILES * TW);
    this.cx = 0;
    this.cy = (GRID * TH) / 2;
    this.applyView();
  }

  /** Game only: frame the built-up part of the map so the town fills most of the view. False if nothing is built. */
  private frameCity(): boolean {
    const s = this.state;
    if (!s || this.options.island) return false;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      if (!s.grid[y]![x]) continue;
      const c = tileToWorld(x, y);
      x0 = Math.min(x0, c.x - TW / 2); x1 = Math.max(x1, c.x + TW / 2);
      y0 = Math.min(y0, c.y - TH * 1.5); y1 = Math.max(y1, c.y + TH);
    }
    if (x0 === Infinity) return false;
    const { width, height } = this.app.screen;
    // a small town is shown close up, a big one fills about three quarters of the view
    const w = Math.max(x1 - x0, 12 * TW), h = Math.max(y1 - y0, 12 * TH);
    this.k = Math.min(1.6, (width * 0.78) / w, (height * 0.78) / h);
    this.cx = (x0 + x1) / 2;
    this.cy = (y0 + y1) / 2;
    this.applyView();
    return true;
  }

  /** Look at the world point (cx, cy) at zoom k (used by the landing page to frame its showcase town). */
  setView(cx: number, cy: number, k: number) {
    if (!this.ready) return;
    this.cx = cx; this.cy = cy; this.k = k;
    this.applyView();
  }

  /** Opt-in camera zoom multiplier for landing hero scroll exit transitions. */
  setZoomMultiplier(factor: number) {
    if (!this.ready) return;
    this.zoomBoost = factor;
    this.applyView();
  }

  /** Opt-in tint method for night mode / scene grading (keeps game default 0xffffff unchanged). */
  setTint(color: number) {
    if (!this.ready) return;
    this.world.tint = color;
  }

  /** Zoom by a factor, keeping the screen point (ax, ay) fixed (defaults to the centre). */
  zoomBy(f: number, ax?: number, ay?: number) {
    if (!this.ready) return;
    const { width, height } = this.app.screen;
    const gx = ax ?? width / 2, gy = ay ?? height / 2;
    const p = this.world.toLocal({ x: gx, y: gy });
    this.k = Math.min(CityRenderer.MAX_K, Math.max(this.minK, this.k * f));
    this.cx = p.x - (gx - width / 2) / this.k;
    this.cy = p.y - (gy - height / 2) / this.k;
    this.applyView();
  }

  private pick(e: FederatedPointerEvent): Tile | null {
    const p = this.world.toLocal(e.global);
    const a = p.x / (TW / 2);
    const b = p.y / (TH / 2);
    const x = Math.floor((a + b) / 2);
    const y = Math.floor((b - a) / 2);
    return this.inBounds(x, y) ? { x, y } : null;
  }

  private diamond(g: Graphics, cx: number, cy: number, w: number, h: number) {
    return g.poly([cx, cy, cx + w, cy + h, cx, cy + 2 * h, cx - w, cy + h]);
  }

  private drawGround() {
    const bank = this.bank;
    if (!bank) return;
    this.ground.removeChildren();
    this.groundSprites = Array.from({ length: GRID }, () => Array<Sprite>(GRID));
    this.baseGroundTex = Array.from({ length: GRID }, () => Array<Texture>(GRID));

    for (let d = 0; d < GRID * 2; d++) {
      for (let y = 0; y < GRID; y++) {
        const x = d - y;
        if (x < 0 || x >= GRID || !this.inBounds(x, y)) continue;
        const parity = ((x + y) & 1) as 0 | 1;
        const h = tileHash(x, y, 101);
        // Weighted variant selection: ~55% lush grass (0), ~15% yellow flowers (1), ~15% blue/pink flowers (2), ~15% pebbles (3)
        const r = h % 20;
        const variant = r < 11 ? 0 : r < 14 ? 1 : r < 17 ? 2 : 3;
        const tex = bank.ground[parity]![variant]!;
        const c = tileToWorld(x, y);
        // PixiJS v8 Sprite with roundPixels for crisp pixel art
        // Source: https://pixijs.download/v8.22.0/docs/scene.Sprite.html
        const sp = new Sprite({
          texture: tex,
          x: c.x - SPRITE_W / 2,
          y: c.y,
          roundPixels: true,
        });
        fitTile(sp);
        this.ground.addChild(sp);
        this.groundSprites[y]![x] = sp;
        this.baseGroundTex[y]![x] = tex;
      }
    }
  }

  private clearWildTex() {
    for (const frames of this.wildTex) for (const t of frames) t.destroy(true);
    this.wildTex = [];
    this.wildAnims.length = 0;
  }

  /**
   * The wilds: WILD_RINGS rings of themed land around the map (a forest for the Elves, a swamp for the
   * Lizardfolk, volcanic rock for the Dragonkin...). The first rings stay open like a clearing, it
   * grows denser and darker further out until it melts into the backdrop. Tall scenery only stands
   * behind the map or well in front of it, so it never hides the city. The game only, not the island.
   */
  private drawWilds() {
    const bank = this.bank;
    if (!bank || this.options.island) return;
    for (const c of [this.wildGround, this.wildBack, this.wildFront]) c.removeChildren().forEach((ch) => ch.destroy());
    this.clearWildTex();
    this.ambience?.destroy();
    this.ambience = null;
    const theme: WildTheme = wildTheme(this.arc);
    if (!this.options.transparent) this.app.renderer.background.color = theme.backdrop;
    const toTex = (c: HTMLCanvasElement) => {
      // rendered (Blender) scenery is smooth art, sampled like the rendered buildings; the pixel drawings stay crisp
      if (c.dataset.smooth === '1') return new Texture({ source: new CanvasSource({ resource: c, scaleMode: 'linear', autoGenerateMipmaps: true }) });
      const t = Texture.from(c); t.source.scaleMode = 'nearest'; return t;
    };
    this.wildTex = theme.props.map((p) => p.frames.map(toTex));
    this.theme = theme;
    this.propTex = this.wildTex.slice(0, theme.props.length);
    this.decorKey = '';
    const groundTex = theme.ground.map(toTex);
    this.wildTex.push(groundTex); // destroyed with the props
    const waterTex = (theme.water ?? []).map((m) => m.map(toTex));
    this.wildTex.push(...waterTex);
    // the map itself wears the wilds' seamless ground, so no tile outlines show (paths come from terrain.ts)
    const hd = groundTex[0]!.width > 100;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const gSp = this.groundSprites[y]?.[x];
      if (!gSp) continue;
      const tex = groundTex[tileHash(x, y, 101) & 3]!;
      const c = tileToWorld(x, y);
      gSp.texture = tex;
      gSp.scale.set(hd ? 0.5 : 1);
      gSp.position.set(c.x - SPRITE_W / 2 - 1, c.y - 1);
      this.baseGroundTex[y]![x] = tex;
    }
    const R = WILD_RINGS, water: WaterSpot[] = [], glows: LightSpot[] = [];
    const shadeColor = (base: number, k: number) => {
      const r = Math.round(((base >> 16) & 255) * k), g = Math.round(((base >> 8) & 255) * k), b = Math.round((base & 255) * k);
      return (r << 16) | (g << 8) | b;
    };
    // past the last ring the backdrop shows; on a day theme a band of forest stands on it (trees only, no
    // ground tiles: the backdrop is the faded ground) over an endless canopy, so no pan or zoom finds bare grass
    const RF = theme.day && !this.options.transparent ? R + (this.quality === 'lite' ? 6 : 10) : R;
    const farTall = theme.scatter?.tall ?? [];
    if (RF > R && farTall.length) {
      const canopy = canopyCanvas([...new Set(farTall)].slice(0, 6).map((i) => theme.props[i]!.frames[0]!));
      const ct = Texture.from(canopy); ct.source.scaleMode = 'nearest'; ct.source.addressMode = 'repeat';
      this.wildTex.push([ct]);
      const span = 400 * TW;
      const cs = new TilingSprite({ texture: ct, width: span * 2, height: span, x: -span + (GRID * TW) / 2, y: -span / 2 + (GRID * TH) / 2 });
      cs.tint = shadeColor(0xffffff, ringShade(99, true));
      this.wildGround.addChildAt(cs, 0);
    }
    for (let d = -2 * RF; d <= 2 * (GRID + RF); d++) {
      for (let y = -RF; y < GRID + RF; y++) {
        const x = d - y;
        if (x < -RF || x >= GRID + RF) continue;
        if (x >= 0 && y >= 0 && x < GRID && y < GRID) continue;
        const ring = Math.max(-x, -y, x - (GRID - 1), y - (GRID - 1));
        const shade = ringShade(ring, theme.day);
        const c = tileToWorld(x, y);
        const h = tileHash(x, y, 101);
        if (ring >= R) {
          if (!farTall.length || h % 100 >= 88) continue;
          const fi = farTall[(h >>> 8) % farTall.length]!;
          const src = theme.props[fi]!, pk = SPRITE_W / src.frames[0]!.width;
          const sp = new Sprite({ texture: this.wildTex[fi]![0]!, roundPixels: true });
          sp.scale.set(pk);
          sp.position.set(c.x - SPRITE_W / 2, c.y + TILE_H - src.frames[0]!.height * pk);
          sp.tint = shadeColor(0xffffff, shade);
          (x >= GRID || y >= GRID ? this.wildFront : this.wildBack).addChild(sp);
          continue;
        }
        const spot = theme.place?.(x, y, ring) ?? null;
        const wetTex = spot?.ground === 'water' ? waterTex[spot.mask ?? 0] : undefined;
        const g = new Sprite({ texture: wetTex ? wetTex[0]! : groundTex[h & 3]!, x: c.x - SPRITE_W / 2 - 1, y: c.y - 1, roundPixels: true });
        if (groundTex[0]!.width > 100) g.scale.set(0.5); // HD wild ground (2x)
        g.tint = shadeColor(0xffffff, shade);
        this.wildGround.addChild(g);
        if (wetTex && !this.calm) this.wildAnims.push({ sprite: g, frames: wetTex, phase: 0 });
        const front = x >= GRID || y >= GRID;
        const pi = spot ? (spot.prop ?? -1) : pickProp(theme, x, y, ring, front);
        if (pi < 0) continue;
        const frames = this.wildTex[pi]!;
        const src = theme.props[pi]!;
        const sp = new Sprite({ texture: frames[0]!, roundPixels: true });
        const pk = SPRITE_W / src.frames[0]!.width;
        sp.scale.set(pk);
        sp.position.set(c.x - SPRITE_W / 2, c.y + TILE_H - src.frames[0]!.height * pk);
        sp.tint = shadeColor(0xffffff, Math.min(1, shade * 1.08));
        (front ? this.wildFront : this.wildBack).addChild(sp);
        if (frames.length > 1 && !this.calm) this.wildAnims.push({ sprite: sp, frames, phase: (h >>> 4) & 3 });
        if (src.water && ring <= 12) water.push({ x: c.x, y: c.y + TILE_H / 2, kind: src.water });
        if (src.glow && ring <= 13) glows.push({ x: c.x, y: c.y + TILE_H / 2 - 4, color: src.glow });
      }
    }
    if (!this.calm) this.ambience = new Ambience(this.airLayer, this.skyLayer, this.arc, water, this.quality === 'lite', glows);
  }

  /** Wind in the trees, water and lava on the move, and the life in the air. */
  private animateWilds(dt: number) {
    this.ambience?.update(dt);
    if (this.wildAnims.length === 0) return;
    this.wildMs += dt;
    if (this.wildMs < 320) return;
    this.wildMs %= 320;
    this.wildTick = (this.wildTick + 1) >>> 0;
    for (const e of this.wildAnims) e.sprite.texture = e.frames[(this.wildTick + e.phase) % e.frames.length]!;
  }

  /** The island's outline in world px (top vertex, the side corners, the bottom vertex). */
  private islandCorners() {
    const isl = this.options.island!;
    return {
      top: tileToWorld(isl.x0, isl.y0),
      left: tileToWorld(isl.x0, isl.y1 + 1),
      right: tileToWorld(isl.x1 + 1, isl.y0),
      bottom: tileToWorld(isl.x1 + 1, isl.y1 + 1),
    };
  }

  /** Deepest point of the cliff below the island's bottom vertex, in world px. */
  private islandDepth() {
    const { left, right } = this.islandCorners();
    return Math.round(((right.x - left.x) / 2) * 0.52);
  }

  /**
   * World-space box that holds the whole island: the tallest buildings above the back corner, the cliff
   * and the drifting rocks below. The landing page frames its camera on this.
   */
  islandBounds() {
    if (!this.options.island) return null;
    const { top, left, right, bottom } = this.islandCorners();
    const y0 = top.y - MARGIN_TOP + 20;
    const y1 = bottom.y + this.islandDepth() + 70;
    return { x: left.x, y: y0, w: right.x - left.x, h: y1 - y0 };
  }

  /**
   * The cliff under the two front edges, drawn once in 4 px columns so it stays pixel art at any zoom:
   * grass lip, soil with roots, earth, deep earth and stone, tapering to a jagged point under the bottom
   * vertex. The left face is lit, the right one shaded, like the buildings. Then vines, a waterfall and
   * three rocks that drift below.
   */
  private drawIsland() {
    if (!this.options.island) return;
    this.underside.removeChildren();
    const { left: L, right: R, bottom: B } = this.islandCorners();
    const half = (R.x - L.x) / 2;
    const DMAX = this.islandDepth();
    const S = 4;
    const q = (v: number) => Math.round(v / S) * S;
    const edgeY = (x: number) => (x <= B.x ? L.y + (x - L.x) * 0.5 : B.y - (x - B.x) * 0.5);
    // smooth value noise along x (knots every 48 px) so the depth wanders without jitter
    const knot = (i: number) => (tileHash(i, 7, 911) % 1000) / 1000;
    const noise = (x: number) => {
      const t = (x - L.x) / 48, i = Math.floor(t), f = t - i, s = f * f * (3 - 2 * f);
      return knot(i) * (1 - s) + knot(i + 1) * s;
    };
    const depthAt = (x: number) => {
      const u = Math.min(1, Math.abs(x - B.x) / half);
      return q(14 + DMAX * Math.pow(1 - u, 1.3) * (0.78 + 0.44 * noise(x)) + (tileHash(Math.round(x), 3, 17) % 3) * S);
    };

    const face = new Graphics();
    const extras = new Graphics();
    for (let x = L.x; x < R.x; x += S) {
      const side = x + S / 2 <= B.x ? 0 : 1;
      const top = Math.floor(Math.min(edgeY(x), edgeY(x + S))) - 2;
      const d = depthAt(x + S / 2);
      const h = tileHash(Math.round(x), 11, 5);
      const lip = 6 + (h % 5 === 0 ? 8 : h % 3 === 0 ? 4 : 0);
      const soil = Math.min(d, lip + 12 + q(noise(x + 300) * 10));
      const earth = Math.min(d, Math.max(soil, q(d * (0.5 + 0.12 * noise(x + 600)))));
      const deep = Math.min(d, Math.max(earth, q(d * (0.74 + 0.1 * noise(x + 900)))));
      const bands: [number, number, number][] = [
        [0, lip, CLIFF.lip[side]!], [lip, soil, CLIFF.soil[side]!], [soil, earth, CLIFF.earth[side]!],
        [earth, deep, CLIFF.deep[side]!], [deep, d - S, CLIFF.stone[side]!], [d - S, d, CLIFF.rim[side]!],
      ];
      for (const [a, b, c] of bands) if (b > a) face.rect(x, top + a, S, b - a).fill(c);
      // a pebble in the earth, a root in the soil
      if (h % 7 === 0 && earth - soil > 12) extras.rect(x, top + soil + q((h >>> 4) % Math.max(1, earth - soil - 8)), S * (h % 2 ? 2 : 1), S).fill(CLIFF.pebble[side]!);
      if (h % 11 === 1 && soil - lip > 6) extras.rect(x + 1, top + lip, 2, soil - lip + 4).fill(CLIFF.root[side]!);
      // vines hang over the lip and sometimes past the bottom
      if (h % 9 === 2) {
        const len = 10 + ((h >>> 6) % 15) * S;
        extras.rect(x, top + 2, S, len).fill(CLIFF.vine);
        for (let k = 8; k < len; k += 12) extras.rect(k % 24 === 8 ? x - S : x + S, top + 2 + k, S, S).fill(CLIFF.leaf);
        extras.rect(x, top + 2 + len, S, S).fill(CLIFF.leaf);
      }
    }
    this.underside.addChild(face, extras);

    // a thin waterfall pouring off the shaded face into the sky
    const wx = q(B.x + half * 0.42);
    const wTop = Math.floor(edgeY(wx)) - 4;
    const wLen = depthAt(wx) + 60;
    const tex = (this.waterTex ??= this.waterTexture());
    const segs: [number, number, number][] = [[0, wLen, 0.95], [wLen, 34, 0.55], [wLen + 34, 30, 0.25]];
    for (const [y, len, alpha] of segs) {
      const f = new TilingSprite({ texture: tex, width: 12, height: len });
      f.position.set(wx, wTop + y);
      f.alpha = alpha;
      this.underside.addChild(f);
      this.falls.push(f);
    }
    // spray where it leaves the lip
    extras.rect(wx - S, wTop + 2, S, S).fill(0xdff4ff).rect(wx + 12, wTop + 4, S, S).fill(0xdff4ff);

    // rocks drifting below the tip
    this.rocks.length = 0;
    const rockAt: [number, number, number][] = [[-0.36, 0.62, 5], [0.32, 0.78, 4], [0.05, 1.06, 3]];
    rockAt.forEach(([fx, fy, size], i) => {
      const g = new Graphics();
      const w = size * 8;
      g.rect(-w / 2, 0, w, S).fill(CLIFF.lip[0]!);
      g.rect(-w / 2, S, w / 2, w / 2).fill(CLIFF.earth[0]!).rect(0, S, w / 2, w / 2).fill(CLIFF.earth[1]!);
      g.rect(-w / 4, S + w / 2, w / 4, w / 4).fill(CLIFF.stone[0]!).rect(0, S + w / 2, w / 4, w / 4).fill(CLIFF.stone[1]!);
      const y = B.y + DMAX * fy;
      g.position.set(q(B.x + half * fx), y);
      this.underside.addChild(g);
      this.rocks.push({ g, y, phase: i * 2.1 });
    });
  }

  /** 12x24 pixel water: pale streaks on blue, tiled and scrolled down every frame. */
  private waterTexture() {
    const c = document.createElement('canvas');
    c.width = 12; c.height = 24;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#5fb4ea'; ctx.fillRect(0, 0, 12, 24);
    ctx.fillStyle = '#8fd2fa'; ctx.fillRect(4, 0, 4, 24);
    ctx.fillStyle = '#e6f7ff';
    for (const [x, y, h] of [[0, 2, 6], [4, 10, 8], [8, 16, 6], [4, 0, 3], [8, 4, 4]] as const) ctx.fillRect(x, y, 4, h);
    ctx.fillStyle = '#3f8fcf'; ctx.fillRect(0, 12, 4, 6); ctx.fillRect(8, 8, 4, 4);
    const t = Texture.from(c);
    t.source.scaleMode = 'nearest';
    return t;
  }

  /** The island breathes: a slow 3 px bob, the waterfall runs, the rocks drift on their own beat. */
  private bob() { return this.options.island ? Math.round(Math.sin(this.bobMs / 1500) * 3 * this.effK) : 0; }
  private floatIsland(dt: number) {
    this.bobMs += Math.min(dt, 100);
    this.world.position.y = this.baseY + this.bob();
    for (const f of this.falls) f.tilePosition.y = (f.tilePosition.y + dt * 0.09) % 24;
    for (const r of this.rocks) r.g.position.y = Math.round(r.y + Math.sin(this.bobMs / 1100 + r.phase) * 6);
  }

  private drawBlocks() {
    const s = this.state;
    const bank = this.bank;
    if (!s || !bank) return;

    let used = 0;
    let badgeUsed = 0;
    let shadowUsed = 0;
    const island = !!this.options.island;
    const decor = island ? null : this.decorFor(s);
    this.animEntries.length = 0;

    // Depth-sorted by x+y diagonal, matching the original drawBlocks order
    for (let d = 0; d < GRID * 2; d++) {
      for (let y = 0; y < GRID; y++) {
        const x = d - y;
        if (x < 0 || x >= GRID) continue;
        const kind = s.grid[y]![x];
        const gSp = this.groundSprites[y]?.[x];
        if (!kind) {
          if (gSp && island) { gSp.texture = this.baseGroundTex[y]![x]!; fitTile(gSp); }
          const pi = decor ? decor[y * GRID + x]! : -1;
          if (pi >= 0) {
            const frames = this.propTex[pi]!;
            const phase = (x * 5 + y * 3) & 3;
            let sp = this.spritePool[used];
            if (!sp) {
              sp = new Sprite({ roundPixels: true });
              this.spritePool.push(sp);
              this.blocks.addChild(sp);
            }
            sp.texture = frames[(this.animTick + phase) % frames.length]!;
            fitTile(sp);
            const c = tileToWorld(x, y);
            sp.position.set(c.x - SPRITE_W / 2, c.y + TILE_H - sp.height);
            sp.visible = true;
            used++;
            if (frames.length > 1 && !this.calm) this.animEntries.push({ sprite: sp, frames, phase });
          }
          continue;
        }
        // the island keeps its tile plates; the game paints worn ground under the town instead (terrain.ts)
        if (gSp && island) { gSp.texture = bank.foundation; fitTile(gSp); }

        const lv = buildingLevel(s, x, y);
        const frames = lv >= 2 ? bank.levelFrames(kind, lv) : bank.buildings[kind];
        const phase = (x * 3 + y * 5) & 7;
        const tex = frames[(this.animTick + phase) % frames.length]!;
        const c = tileToWorld(x, y);

        let sp = this.spritePool[used];
        if (!sp) {
          sp = new Sprite({ roundPixels: true });
          this.spritePool.push(sp);
          this.blocks.addChild(sp);
        }
        sp.texture = tex;
        fitTile(sp); // HD art (128 px) is drawn at half scale, so it fills the same tile
        sp.position.set(c.x - SPRITE_W / 2, c.y + TILE_H - sp.height); // tall art grows upward from the tile
        sp.visible = true;
        used++;

        if (this.shadowTex) {
          let sh = this.shadowPool[shadowUsed];
          if (!sh) {
            sh = new Sprite({ texture: this.shadowTex, anchor: 0.5 });
            this.shadowPool.push(sh);
            this.shadows.addChild(sh);
          }
          // taller buildings cast a wider shadow, thrown a little to the lower right
          const tall = Math.min(1, Math.max(0, (sp.height - TILE_H * 1.6) / (TILE_H * 2)));
          sh.scale.set(((TW * (1.05 + 0.3 * tall)) / 128));
          sh.position.set(c.x + 5 + 6 * tall, c.y + TH / 2 + 3 + 2 * tall);
          sh.visible = true;
          shadowUsed++;
        }

        if (frames.length > 1) {
          this.animEntries.push({ sprite: sp, frames, phase });
        }

        if (lv >= 2) {
          const bTex = bank.badges[lv >= 3 ? 1 : 0]!;
          let bSp = this.badgePool[badgeUsed];
          if (!bSp) {
            bSp = new Sprite({ roundPixels: true });
            this.badgePool.push(bSp);
            this.badges.addChild(bSp);
          }
          bSp.texture = bTex;
          bSp.position.set(c.x - BADGE_W / 2, c.y + TILE_H - BADGE_H - 1);
          bSp.visible = true;
          badgeUsed++;
        }
      }
    }

    for (let i = used; i < this.spritePool.length; i++) {
      this.spritePool[i]!.visible = false;
    }
    for (let i = badgeUsed; i < this.badgePool.length; i++) {
      this.badgePool[i]!.visible = false;
    }
    for (let i = shadowUsed; i < this.shadowPool.length; i++) this.shadowPool[i]!.visible = false;
    this.updatePaths(s);
  }

  /** Game only: build the painted terrain layers for the current people (patches, paths, glow, vignette). */
  private drawTerrain() {
    if (this.options.island) return;
    this.clearTerrain();
    const look = terrainLook(this.arc);
    const place = (tex: Texture, k = TERRAIN_SCALE) => {
      const sp = new Sprite({ texture: tex, x: -MAP_W / 2, y: 0 });
      sp.scale.set(1 / k);
      this.terrain.addChild(sp);
      return sp;
    };
    this.patchTex = Texture.from(paintPatches(this.arc));
    place(this.patchTex);
    const blank = (k = TERRAIN_SCALE) => { const c = document.createElement('canvas'); c.width = Math.ceil(MAP_W * k); c.height = Math.ceil(MAP_H * k); return c; };
    this.pathCanvas = blank();
    this.pathTex = Texture.from(this.pathCanvas);
    place(this.pathTex);
    this.glowCanvas = blank(GLOW_SCALE);
    this.glowTex = Texture.from(this.glowCanvas);
    const glow = place(this.glowTex, GLOW_SCALE);
    glow.blendMode = 'add';
    glow.visible = look.glowA > 0;
    this.occKey = '';
    if (this.vignette) {
      this.vignette.texture?.destroy(true);
      this.vignette.texture = Texture.from(vignetteCanvas(look.vignette));
      this.applyView();
    }
    if (this.state) this.updatePaths(this.state);
  }

  /**
   * Which wild prop (index into the theme's props, or -1) stands on each open map tile. Nothing grows
   * right next to buildings; further out the land turns into meadow, copse and rocks, and tall trees
   * only stand well away from the town. Recomputed only when buildings come or go.
   */
  private decorFor(s: GameState): Int16Array | null {
    const theme = this.theme;
    if (!theme || this.propTex.length === 0) return null;
    const key = occupancyKey(s);
    if (this.decor && key === this.decorKey) return this.decor;
    this.decorKey = key;
    // distance (in tiles, 8-way) to the nearest building
    const dist = new Int16Array(GRID * GRID).fill(99);
    const queue: number[] = [];
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (s.grid[y]![x]) { dist[y * GRID + x] = 0; queue.push(y * GRID + x); }
    for (let qi = 0; qi < queue.length; qi++) {
      const i = queue[qi]!, x = i % GRID, y = (i / GRID) | 0, d = dist[i]! + 1;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
        const j = ny * GRID + nx;
        if (dist[j]! > d) { dist[j] = d; queue.push(j); }
      }
    }
    const dry = (i: number) => !theme.props[i]!.water;
    const tall = (theme.scatter?.tall ?? theme.props.map((p, i) => (p.tall ? i : -1)).filter((i) => i >= 0)).filter(dry);
    const low = (theme.scatter?.low ?? theme.props.map((p, i) => (p.tall ? -1 : i)).filter((i) => i >= 0)).filter(dry);
    const out = new Int16Array(GRID * GRID).fill(-1);
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const d = dist[y * GRID + x]!;
      if (d < 2) continue;
      const h = tileHash(x, y, 777);
      const pct = d < 3 ? 5 : d < 5 ? 11 : 16;
      if (h % 100 >= pct) continue;
      const useTall = d >= 4 && tall.length > 0 && ((h >>> 8) % 100) < 45;
      const list = useTall ? tall : low;
      if (list.length) out[y * GRID + x] = list[(h >>> 12) % list.length]!;
    }
    this.decor = out;
    return out;
  }

  /** Repaint paths and glow when buildings came or went. */
  private updatePaths(s: GameState) {
    if (!this.pathCanvas || !this.glowCanvas) return;
    const key = occupancyKey(s);
    if (key === this.occKey) return;
    this.occKey = key;
    paintPaths(this.pathCanvas, s, this.arc);
    paintGlow(this.glowCanvas, s, this.arc);
    this.pathTex?.source.update();
    this.glowTex?.source.update();
  }

  private clearTerrain() {
    this.terrain.removeChildren().forEach((c) => c.destroy());
    for (const t of [this.patchTex, this.pathTex, this.glowTex]) t?.destroy(true);
    this.patchTex = this.pathTex = this.glowTex = null;
    this.pathCanvas = this.glowCanvas = null;
  }

  private drawCursor() {
    const g = this.cursor;
    g.clear();
    if (!this.hover) return;
    const c = tileToWorld(this.hover.x, this.hover.y);
    this.diamond(g, c.x, c.y, TW / 2, TH / 2)
      .fill({ color: this.hoverBad ? 0xef5350 : 0x4fc3f7, alpha: 0.35 })
      .stroke({ width: 2, color: this.hoverBad ? 0xef5350 : 0x4fc3f7 });
  }

  private setHover(t: Tile | null) {
    const same = (!t && !this.hover) || (t && this.hover && t.x === this.hover.x && t.y === this.hover.y);
    if (same) return;
    this.hover = t;
    this.updateCursorColor();
    this.drawCursor();
    this.onTileHover(t);
  }

  private updateCursorColor() {
    if (!this.hover) { this.hoverBad = false; return; }
    this.hoverBad = this.hoverCheck ? this.hoverCheck(this.hover) : !!(this.state && this.state.grid[this.hover.y]![this.hover.x] && this.placing);
  }

  /** Switch the colour theme (and later per-arc sprites) for the whole city. */
  setArc(arc: ArcId | null) {
    if (arc === this.arc) return;
    this.arc = arc;
    this.clearPreviews();
    if (!this.ready) return;
    // load the new people's art first; a newer switch or a destroyed view wins over this one
    void preloadPaintedArt(arc).then(() => { if (arc === this.arc && !this.destroyed) this.rebuildBank(); });
  }

  private rebuildBank() {
    const arc = this.arc;
    const old = this.bank;
    this.bank = buildSpriteBank(arc);
    this.drawGround();
    this.drawWilds();
    this.drawTerrain();
    if (this.state) this.drawBlocks();
    for (const w of this.walkers) w.sprite.destroy();
    this.walkers.length = 0;
    for (const w of this.soldiers) w.sprite.destroy();
    this.soldiers.length = 0;
    this.syncWalkers();
    if (old) destroySpriteBank(old);
    this.warmPreviews();
  }

  /** Freeze one citizen in place (while a dialog is open); pass -1 to release. */
  pauseNpc(id: number) { this.pausedNpc = id; }

  /** Image URL of a building's sprite in the current race style (cached), for UI cards. */
  previewUrl(kind: string, level = 1): string | null {
    const key = level >= 2 ? `${kind}@${level >= 3 ? 3 : 2}` : kind;
    const hit = this.previews.get(key);
    if (hit) return hit;
    const c = this.previewCanvas(kind, level);
    if (!c) return null;
    // not warmed yet: encode now (synchronous, ~8 ms per sprite)
    const url = c.toDataURL();
    this.previews.set(key, url);
    return url;
  }

  private previewCanvas(kind: string, level = 1): HTMLCanvasElement | null {
    const bank = this.bank;
    if (!bank || !(kind in bank.buildings)) return null;
    const k = kind as BuildingKind;
    const frames = level >= 2 ? bank.levelFrames(k, level) : bank.buildings[k];
    const res = frames[0]?.source.resource as unknown;
    return res instanceof HTMLCanvasElement ? res : null;
  }

  /**
   * Encode every building preview in the background (toBlob runs off the main thread),
   * so opening the shop for the first time does not stall on 20+ PNG encodes.
   */
  private warmPreviews() {
    const bank = this.bank;
    // the landing island has no shop, so it never needs previews; the game warms them while the browser is idle,
    // a few at a time, so drawing 60 buildings does not hold up the first frame
    if (!bank || this.options.island) return;
    const kinds = Object.keys(bank.buildings).filter((k) => !this.previews.has(k));
    const idle = (fn: () => void) => { if (typeof requestIdleCallback === 'function') requestIdleCallback(() => fn(), { timeout: 2000 }); else setTimeout(fn, 50); };
    const step = () => {
      if (this.bank !== bank || this.destroyed) return;
      for (const kind of kinds.splice(0, 4)) {
        if (this.previews.has(kind)) continue;
        this.previewCanvas(kind)?.toBlob((b) => {
          if (!b || this.bank !== bank || this.previews.has(kind)) return;
          this.previews.set(kind, URL.createObjectURL(b));
        });
      }
      if (kinds.length) idle(step);
    };
    idle(step);
  }

  private clearPreviews() {
    for (const url of this.previews.values()) if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    this.previews.clear();
  }

  setPlacing(p: boolean) {
    this.placing = p;
    this.updateCursorColor();
    this.drawCursor();
  }

  draw(state: GameState) {
    this.state = state;
    if (!this.ready) return;
    this.drawBlocks();
    if (!this.framed) { this.framed = true; this.frameCity(); }
    this.syncWalkers();
    this.updateCursorColor();
    this.drawCursor();
  }
}
