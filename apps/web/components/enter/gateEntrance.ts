import { gsap } from 'gsap';

/** Session flag read by /play (./ArriveFade) so the game fades in out of the same gold light. */
export const ENTER_FLAG = 'mx-enter';
const COLS = 16, ROWS = 9;

/**
 * "Play now" through the gate: the portcullis snaps up, the hall floods with light, the camera dives
 * through the arch, and the screen dissolves into gold in pixel tiles before `go()` navigates. Only
 * transform and opacity animate. Returns a cleanup that removes the overlay (call it on unmount).
 */
export function enterGate(section: HTMLElement, caption: string, go: () => void): () => void {
  const scene = section.querySelector<HTMLElement>('.night-scene');
  const card = section.querySelector<HTMLElement>('.night-card');
  const hall = section.querySelector<SVGGraphicsElement>('.g-hall');
  section.setAttribute('data-enter', '');

  // zoom into the middle of the arch, wherever the sliced SVG put it on this screen
  let origin = '50% 60%';
  if (scene && hall) {
    const s = scene.getBoundingClientRect(), h = hall.getBoundingClientRect();
    const ox = h.left + h.width / 2 - s.left, oy = h.top + Math.min(h.height, s.height) * 0.42 - s.top;
    origin = `${ox}px ${oy}px`;
  }

  // the gold veil: a grid of tiles that light up in a random order, then a caption
  const veil = document.createElement('div');
  veil.className = 'enter-veil';
  veil.setAttribute('aria-hidden', 'true');
  const grid = document.createElement('div');
  grid.className = 'enter-tiles';
  grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  for (let i = 0; i < COLS * ROWS; i++) grid.appendChild(document.createElement('i'));
  const text = document.createElement('p');
  text.className = 'enter-caption';
  text.textContent = caption;
  veil.append(grid, text);
  document.body.appendChild(veil);
  const tiles = grid.children;

  const tl = gsap.timeline({
    onComplete: () => {
      try { sessionStorage.setItem(ENTER_FLAG, '1'); } catch { /* private mode: /play just appears */ }
      go();
    },
  });
  if (card) tl.to(card, { y: 28, scale: 0.94, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0);
  if (scene) {
    tl.set(scene, { transformOrigin: origin, willChange: 'transform' }, 0);
    tl.to(scene, { scale: 1.08, duration: 0.4, ease: 'power1.out' }, 0.05) // the gate draws a breath
      .to(scene, { scale: 7, duration: 1.05, ease: 'power3.in' }, 0.45);   // and pulls you through
  }
  tl.to(tiles, { opacity: 1, scale: 1, duration: 0.18, ease: 'steps(3)', stagger: { each: 0.0045, from: 'random' } }, 0.95)
    .to(text, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 1.35)
    .to({}, { duration: 0.25 });

  return () => {
    tl.kill();
    veil.remove();
  };
}

/**
 * The same gold entrance from anywhere on the page (the navbar button): the page leans toward the
 * button, and the gold tiles spread out from it across the screen before `go()` navigates.
 * Only transform and opacity animate. Returns a cleanup that removes the overlay.
 */
export function enterFrom(button: HTMLElement, caption: string, go: () => void): () => void {
  const page = document.querySelector<HTMLElement>('main');
  const b = button.getBoundingClientRect();
  const bx = b.left + b.width / 2, by = b.top + b.height / 2;

  const veil = document.createElement('div');
  veil.className = 'enter-veil';
  veil.setAttribute('aria-hidden', 'true');
  const grid = document.createElement('div');
  grid.className = 'enter-tiles';
  grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  for (let i = 0; i < COLS * ROWS; i++) grid.appendChild(document.createElement('i'));
  const text = document.createElement('p');
  text.className = 'enter-caption';
  text.textContent = caption;
  veil.append(grid, text);
  document.body.appendChild(veil);

  // the tile under the button lights first, the rest follow by distance
  const col = Math.min(COLS - 1, Math.max(0, Math.floor((bx / window.innerWidth) * COLS)));
  const row = Math.min(ROWS - 1, Math.max(0, Math.floor((by / window.innerHeight) * ROWS)));

  const tl = gsap.timeline({
    onComplete: () => {
      try { sessionStorage.setItem(ENTER_FLAG, '1'); } catch { /* private mode: /play just appears */ }
      go();
    },
  });
  tl.fromTo(button, { scale: 1 }, { scale: 0.92, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, 0);
  if (page) {
    tl.set(page, { transformOrigin: `${bx}px ${by + window.scrollY}px`, willChange: 'transform' }, 0)
      .to(page, { scale: 1.06, duration: 0.35, ease: 'power1.out' }, 0.05)
      .to(page, { scale: 1.6, opacity: 0.6, duration: 0.8, ease: 'power3.in' }, 0.35);
  }
  tl.to(grid.children, { opacity: 1, scale: 1, duration: 0.18, ease: 'steps(3)', stagger: { each: 0.028, grid: [ROWS, COLS], from: row * COLS + col } }, 0.3)
    .to(text, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.95)
    .to({}, { duration: 0.25 });

  return () => {
    tl.kill();
    veil.remove();
    if (page) gsap.set(page, { clearProps: 'transform,opacity,transformOrigin,willChange' });
  };
}
