// Trading post, buy orders and packing up buildings.
// Imports from './index' are only used inside functions (index imports this module back).
import {
  BUILDINGS, GRID, clearLevel, NPC_CITIES, RELICS, RELIC_FILL_PER10K, RESOURCE_KINDS, YOU, addStock, fairPrice, goodMaker, isBuilding, isGood, isRelic, isResource, itemName, levelFromXp, pushLog, rngInt, stockOf,
  type GameState, type ItemKind, type ResourceKind, type Result,
} from './index';

/** The trading post buys and sells instantly, at a price: convenience costs extra. */
export const POST_BUY_PM = 1600;   // you pay 160% of the fair price
export const POST_SELL_PM = 600;   // it pays you 60%
export const POST_CAP_MATERIAL = 40;
export const POST_CAP_GOOD = 12;
export const POST_REFILL_TICKS = 6; // one unit of every item comes back every 6 seconds

export const postCap = (k: ResourceKind) => (isGood(k) ? POST_CAP_GOOD : POST_CAP_MATERIAL);
export const postBuyPrice = (k: ResourceKind) => Math.ceil((fairPrice(k) * POST_BUY_PM) / 1000);
export const postSellPrice = (k: ResourceKind) => Math.max(1, Math.floor((fairPrice(k) * POST_SELL_PM) / 1000));

export function freshPost(): Record<ResourceKind, number> {
  const out = {} as Record<ResourceKind, number>;
  for (const k of ['wood', 'ore', 'food', 'moonleaf', 'spice', 'hides', 'emberstone', 'gears'] as ResourceKind[]) out[k] = isGood(k) ? 6 : 20;
  return out;
}

const whole = (n: number) => Number.isInteger(n) && n >= 1;

export function postBuy(s: GameState, k: ResourceKind, n: number): Result {
  if (!isResource(k)) return { ok: false, msg: 'The trading post only deals in raw goods' };
  if (!whole(n)) return { ok: false, msg: 'Invalid amount' };
  if ((s.post[k] ?? 0) < n) return { ok: false, msg: `The trading post has only ${s.post[k] ?? 0} ${itemName(k)} left` };
  const cost = n * postBuyPrice(k);
  if (s.gold < cost) return { ok: false, msg: `Not enough gold (need ${cost})` };
  s.gold -= cost; s.post[k] -= n; addStock(s, k, n);
  pushLog(s, `Trading post: bought ${n} ${itemName(k)} for ${cost} gold.`);
  return { ok: true, cost };
}

export function postSell(s: GameState, k: ResourceKind, n: number): Result {
  if (!isResource(k)) return { ok: false, msg: 'The trading post only deals in raw goods' };
  if (!whole(n)) return { ok: false, msg: 'Invalid amount' };
  if (stockOf(s, k) < n) return { ok: false, msg: `You have only ${stockOf(s, k)} ${itemName(k)}` };
  const room = postCap(k) * 2 - (s.post[k] ?? 0);
  if (room < n) return { ok: false, msg: `The trading post can take only ${Math.max(0, room)} more ${itemName(k)}` };
  const pay = n * postSellPrice(k);
  addStock(s, k, -n); s.post[k] = (s.post[k] ?? 0) + n; s.gold += pay;
  pushLog(s, `Trading post: sold ${n} ${itemName(k)} for ${pay} gold.`);
  return { ok: true, pay };
}

/** Post a buy order. The gold for the whole order is held until it fills or you cancel. */
export function placeOrder(s: GameState, k: ItemKind, qty: number, price: number): Result {
  if (!whole(qty) || !whole(price)) return { ok: false, msg: 'Invalid order' };
  if (price > fairPrice(k) * 10) return { ok: false, msg: 'Price is too high' };
  if (s.orders.filter((o) => o.buyer === YOU).length >= 8) return { ok: false, msg: 'You can have 8 open orders at most' };
  const escrow = qty * price;
  if (s.gold < escrow) return { ok: false, msg: `Not enough gold to back this order (need ${escrow})` };
  s.gold -= escrow;
  s.orders.push({ id: s.nextListingId++, buyer: YOU, kind: k, qty, price });
  pushLog(s, `Order placed: ${qty} ${itemName(k)} at ${price} gold each.`);
  return { ok: true };
}

export function cancelOrder(s: GameState, id: number): Result {
  const o = s.orders.find((x) => x.id === id);
  if (!o || o.buyer !== YOU) return { ok: false, msg: 'Not your order' };
  s.orders = s.orders.filter((x) => x.id !== id);
  s.gold += o.qty * o.price;
  return { ok: true };
}

/** Sell into another city's buy order, straight from your stock. */
export function fillOrder(s: GameState, id: number, amount: number): Result {
  const o = s.orders.find((x) => x.id === id);
  if (!o) return { ok: false, msg: 'That order is gone' };
  if (o.buyer === YOU) return { ok: false, msg: 'That is your own order' };
  const n = Math.min(Math.max(1, Math.floor(amount)), o.qty, stockOf(s, o.kind));
  if (n < 1) return { ok: false, msg: `You have no ${itemName(o.kind)} to sell` };
  addStock(s, o.kind, -n);
  s.gold += n * o.price;
  o.qty -= n;
  if (o.qty <= 0) s.orders = s.orders.filter((x) => x.id !== id);
  pushLog(s, `Sold ${n} ${itemName(o.kind)} to ${o.buyer} for ${n * o.price} gold.`);
  return { ok: true, n };
}

/** Lift a placed building into storage, so it can be moved or sold. */
export function packUp(s: GameState, x: number, y: number): Result {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= GRID || y >= GRID) return { ok: false, msg: 'Out of bounds' };
  const k = s.grid[y]![x];
  if (!k) return { ok: false, msg: 'Nothing here' };
  s.grid[y]![x] = null;
  clearLevel(s, x, y); // a packed building goes back to level 1
  s.inventory[k] = (s.inventory[k] ?? 0) + 1;
  pushLog(s, `${BUILDINGS[k].name} packed into storage.`);
  return { ok: true, kind: k };
}

/** One market second: the post restocks, other mayors fill your orders when the price is fair. */
export function tradeStep(s: GameState) {
  if (!s.post) return;
  if (s.tick % POST_REFILL_TICKS === 0)
    for (const k of RESOURCE_KINDS) if ((s.post[k] ?? 0) < postCap(k)) s.post[k] = (s.post[k] ?? 0) + 1;
  for (const o of s.orders.slice()) {
    if (o.buyer !== YOU) continue;
    if (isBuilding(o.kind) && levelFromXp(s.xp) < BUILDINGS[o.kind].unlockLevel) continue;
    if (o.price * 100 < fairPrice(o.kind) * 90) continue; // lowballs never fill
    // relics are scarce everywhere: the rarer, the longer a fair order waits
    if (isRelic(o.kind) ? rngInt(s, 10_000) >= RELIC_FILL_PER10K[RELICS[o.kind].rarity] : rngInt(s, 100) >= 6) continue;
    const n = isResource(o.kind) ? Math.min(o.qty, isGood(o.kind) ? 3 : 10) : 1;
    addStock(s, o.kind, n);
    o.qty -= n;
    const pool = isGood(o.kind) ? NPC_CITIES.filter((c) => c.arc === goodMaker(o.kind as never).id) : NPC_CITIES;
    const from = pool[rngInt(s, pool.length)]!;
    pushLog(s, `${from.name} filled your order: +${n} ${itemName(o.kind)}.`);
    if (o.qty <= 0) s.orders = s.orders.filter((x) => x.id !== o.id);
  }
}
