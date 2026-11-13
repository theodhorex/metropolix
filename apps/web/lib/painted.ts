// Painted building art: PNGs in /public/art made with free online image tools, fitted to the tile by
// .agy/ai-art/fit.py (256 px wide, tile's bottom vertex on the canvas bottom). Loaded once before the
// sprite bank is built; an arc's art module asks for a picture with paintedArt() and falls back to
// its procedural drawing when the picture is missing.

/** Pictures that exist, per arc. Add a name here after dropping its PNG into public/art/<arc>/. */
const PAINTED: Record<string, string[]> = {
  goblin: ['house', 'rowhouse', 'manor', 'cottage', 'longhouse', 'tenement'],
};

export const paintedNames = (arc: string) => PAINTED[arc] ?? [];

const cache = new Map<string, HTMLCanvasElement>();
let loading: Promise<void> | null = null;

function load(arc: string, name: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      c.dataset.smooth = '1';
      cache.set(`${arc}/${name}`, c);
      resolve();
    };
    img.onerror = () => resolve(); // missing art: the procedural drawing stays
    img.src = `/art/${arc}/${name}.png`;
  });
}

export function preloadPaintedArt(): Promise<void> {
  loading ??= Promise.all(Object.entries(PAINTED).flatMap(([arc, names]) => names.map((n) => load(arc, n)))).then(() => {});
  return loading;
}

/** A copy of the painted picture (callers may draw on it), or undefined when it is not loaded. */
export function paintedArt(arc: string, name: string): HTMLCanvasElement | undefined {
  const src = cache.get(`${arc}/${name}`);
  if (!src) return undefined;
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  c.dataset.smooth = '1';
  return c;
}
