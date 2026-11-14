// Rendered building art: images in /public/art/<arc>/ made in Blender by tools/blender (256 px wide, the
// tile's bottom corner on the canvas bottom), listed in /public/art/manifest.json as {arc: {kind: frames}}.
// One frame is <kind>.webp; a moving building has <kind>_0.webp .. <kind>_<n-1>.webp. Only the people being
// shown is loaded (about 150 small images), and another people's art is dropped when the view switches, so
// memory stays at one people's worth. An arc's art asks with paintedFrames() and keeps its drawing when
// nothing is there.

/**
 * Off (Theo, 14 Nov 2026: "semua assetnya jangan pakai asset blender"): the game draws every building,
 * citizen, icon and wild piece with its own pixel-art code. The Blender renders and this loader stay, so
 * turning it back on is this one flag.
 */
export const USE_BLENDER_ART = false;

type Manifest = Record<string, Record<string, number | Record<string, number>>>;

const cache = new Map<string, HTMLCanvasElement[]>();
const loaded = new Map<string, Promise<void>>();
let manifestP: Promise<Manifest> | null = null;
let manifest: Manifest = {};

function loadImage(src: string): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      c.dataset.smooth = '1';
      resolve(c);
    };
    img.onerror = () => resolve(null); // missing art: the drawing stays
    img.src = src;
  });
}

async function loadKind(arc: string, kind: string, frames: number) {
  const srcs = frames > 1 ? Array.from({ length: frames }, (_, i) => `/art/${arc}/${kind}_${i}.webp`) : [`/art/${arc}/${kind}.webp`];
  const imgs = await Promise.all(srcs.map(loadImage));
  if (imgs.every(Boolean)) cache.set(`${arc}/${kind}`, imgs as HTMLCanvasElement[]);
}

async function loadWildPiece(arc: string, key: string, frames: number) {
  const srcs = Array.from({ length: frames }, (_, f) => `/art/${arc}/wild_${key}_${f}.webp`);
  const imgs = await Promise.all(srcs.map(loadImage));
  if (imgs.every(Boolean)) cache.set(`${arc}/_wild/${key}`, imgs as HTMLCanvasElement[]);
}

async function loadPeople(arc: string, cit: number, frames: number) {
  const names = [...Array.from({ length: cit }, (_, v) => [`cit_${v}_front`, `cit_${v}_back`]).flat(), 'sol_front', 'sol_back'];
  await Promise.all(names.map(async (n) => {
    const imgs = await Promise.all(Array.from({ length: frames }, (_, f) => loadImage(`/art/${arc}/${n}_${f}.webp`)));
    if (imgs.every(Boolean)) cache.set(`${arc}/_people/${n}`, imgs as HTMLCanvasElement[]);
  }));
}

async function loadLandPiece(arc: string, key: string, frames: number) {
  const srcs = Array.from({ length: frames }, (_, f) => `/art/${arc}/land_${key}_${f}.webp`);
  const imgs = await Promise.all(srcs.map(loadImage));
  if (imgs.every(Boolean)) cache.set(`${arc}/_land/${key}`, imgs as HTMLCanvasElement[]);
}

function loadManifest(): Promise<Manifest> {
  manifestP ??= fetch('/art/manifest.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : {}))
    .catch(() => ({})) // no manifest: every people keeps its drawings
    .then((m) => (manifest = m));
  return manifestP;
}

/** Load one people's art (and forget every other people's). Resolves when it is ready to use. */
export function preloadPaintedArt(arc: string | null): Promise<void> {
  for (const key of [...cache.keys()]) if (!key.startsWith(`${arc}/`)) cache.delete(key);
  for (const a of [...loaded.keys()]) if (a !== arc) loaded.delete(a);
  if (!arc || !USE_BLENDER_ART) return Promise.resolve();
  let p = loaded.get(arc);
  if (!p) {
    p = loadManifest().then((m) => {
      const arcData = m[arc] ?? {};
      const loads: Promise<void>[] = [];
      for (const [k, v] of Object.entries(arcData)) {
        if (k === '_wild' && typeof v === 'object' && v !== null) {
          for (const [iv, frames] of Object.entries(v as Record<string, number>)) {
            loads.push(loadWildPiece(arc, iv, frames));
          }
        } else if (k === '_land' && typeof v === 'object' && v !== null) {
          for (const [key, frames] of Object.entries(v as Record<string, number>)) {
            loads.push(loadLandPiece(arc, key, frames));
          }
        } else if (k === '_people' && typeof v === 'object' && v !== null) {
          const pv = v as Record<string, number>;
          loads.push(loadPeople(arc, pv.cit ?? 0, pv.frames ?? 0));
        } else if (typeof v === 'number') {
          loads.push(loadKind(arc, k, v));
        }
      }
      return Promise.all(loads);
    }).then(() => undefined);
    loaded.set(arc, p);
  }
  return p;
}

/** Kinds with rendered art for this people (after preloadPaintedArt). */
export const paintedNames = (arc: string) => Object.keys(manifest[arc] ?? {}).filter((k) => !k.startsWith('_') && cache.has(`${arc}/${k}`));

/** The rendered frames (shared: callers must not draw on them), or undefined when there is no art. */
export function paintedFrames(arc: string, kind: string): HTMLCanvasElement[] | undefined {
  return cache.get(`${arc}/${kind}`);
}

/** First frame only (kept for older callers). */
export function paintedArt(arc: string, kind: string): HTMLCanvasElement | undefined {
  return paintedFrames(arc, kind)?.[0];
}

/** Rendered wild scenery frames for recipe index i and copy variant v, or undefined when missing. */
export function paintedWild(arc: string, i: number, v: number): HTMLCanvasElement[] | undefined {
  return cache.get(`${arc}/_wild/${i}_${v}`);
}

/** Rendered land piece frames for index k (0..2), or undefined when missing. */
export function paintedLand(arc: string, k: number | string): HTMLCanvasElement[] | undefined {
  return cache.get(`${arc}/_land/${k}`);
}

/** Rendered walker frames (64x96, 4 walk + 1 idle): 'cit_<v>_<view>' or 'sol_<view>', or undefined when missing. */
export function paintedPeople(arc: string, name: string): HTMLCanvasElement[] | undefined {
  return cache.get(`${arc}/_people/${name}`);
}
