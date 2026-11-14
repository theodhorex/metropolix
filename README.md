<p align="center"><img src="docs/logo.svg" width="112" height="112" alt="Metropolix logo: a gold pixel castle gate"></p>

<h1 align="center">Metropolix</h1>

<p align="center"><b>A pixel fantasy city builder you can learn in ten minutes and keep coming back to.</b></p>

<p align="center">
  <img alt="NEAR testnet" src="https://img.shields.io/badge/NEAR-LIVE%20ON%20TESTNET-000000?style=flat-square&labelColor=555555">
  <img alt="Tests" src="https://img.shields.io/badge/TESTS-122%20SIM%20%2B%2030%20CONTRACT-16A34A?style=flat-square&labelColor=555555">
  <img alt="Next.js" src="https://img.shields.io/badge/NEXT.JS-16-000000?style=flat-square&labelColor=555555">
  <img alt="PixiJS" src="https://img.shields.io/badge/PIXIJS-8-8B5CF6?style=flat-square&labelColor=555555">
  <img alt="License" src="https://img.shields.io/badge/LICENSE-MIT-F4B728?style=flat-square&labelColor=555555">
</p>

<img src="docs/screenshots/city.jpg" width="1440" alt="An elven city in Metropolix: tree houses, fountains, farms and barracks on a pixel isometric map">

Pick one of five peoples, raise a city tile by tile, balance taxes against
happiness, dig up rare treasures and raid rival mayors. It all runs in the
browser with no sign-up. Connect a NEAR wallet and your city is saved on
testnet, other players can raid it, and you can trade the game's coin,
**$METRO**, and mint your treasures as NFTs.

**Play:** [metropolix-city.vercel.app/play](https://metropolix-city.vercel.app/play) · **Contract:** [`metropolix.testnet`](https://testnet.nearblocks.io/address/metropolix.testnet)

> **What you get in one sitting**
> - **5 peoples** on different land: the dragonkin have no forests and buy every plank.
> - **60 buildings**, each drawn for your people, each up to level 3.
> - **500 mayor portraits** in six tiers. Yours is drawn once. Only two are Super Legendary.
> - **40 rival mayors** with real treasuries to scout and raid. They raid you back.
> - **A city that explains itself**: every number on screen opens into what moved it.

---

## Play it

```bash
pnpm install
pnpm dev        # http://localhost:3000 is the landing page, /play is the game
```

| Do this | You'll see |
|---|---|
| **1.** Press **Play now** and choose a people | Five portraits with their land, strengths and trade good. Then name your city. |
| **2.** **Shop → House**, tap empty tiles, then add a **Farm** and a **Market Stall** | Citizens walk in, jobs fill, gold per second turns positive. |
| **3.** Hover the happiness chip, then open **City → Economy** | What raises and lowers happiness, and every tax rate with its cost before you pick it. |
| **4.** Tap a building and press **Upgrade** | Now versus next, and the building changes shape on the map. |
| **5.** Build a **Barracks**, **Open war room**, pick a target | The expected loot before you attack, the result in the log, your record on your profile. |
| **6.** Click your card at the top left | Your portrait and its tier, your rank and your city's value. |
| **7.** **Connect NEAR wallet**, **Found my city on chain**, **Turn on autosave** | One wallet confirmation; from then on the city saves itself every 5 minutes with no popup. |
| **8.** **Players on chain → Raid**, then **$METRO market** | A battle against another player's saved city, gold moved on chain, and the coin's price against its NAV. |

---

## Why it is fun

<table>
<tr>
<td width="50%"><img src="docs/screenshots/choose-people.png" alt="The people picker showing the Dragonkin: no forests, double ore, strong attack"><br><b>Peoples who need each other.</b> Each makes one trade good the others need. Your clinic wants moonleaf, your bank wants gears.</td>
<td width="50%"><img src="docs/screenshots/shop.jpg" alt="The elven city with the shop open on the Services row"><br><b>Sixty buildings.</b> Houses bring citizens, jobs bring gold. A level 3 farm grows cheese; an upgraded barracks marches out recruits.</td>
</tr>
<tr>
<td><img src="docs/screenshots/war-room.png" alt="The war room attack tab with rival mayors, a map of the target and the expected loot"><br><b>Raid with your eyes open.</b> Scout the target's defense and treasury, aim for gold or trophies, bring rage, heal or a ram. Lose, and a shield buys you time.</td>
<td><img src="docs/screenshots/vault.png" alt="The vault with a relic on display and four treasures inside"><br><b>Treasure you cannot look up.</b> Mines and mills dig up relics, rarely: one or two an hour in a big city. Display three for a bonus, sell to the crown, or list on the market.</td>
</tr>
<tr>
<td><img src="docs/screenshots/profile.png" alt="A mayor profile with a Legendary portrait, rank, battle record and city value"><br><b>A profile worth showing.</b> Portrait and tier, rank by ChainPower, battle record, treasures on display and a city value counted in game gold.</td>
<td><img src="docs/screenshots/economy.png" alt="The economy tab with a table of every tax rate and its effect on happiness"><br><b>No hidden math.</b> The tax table shows what every rate earns and what it costs in happiness, before you choose.</td>
</tr>
</table>

<img src="docs/screenshots/portraits.png" width="1200" alt="Twenty mayor portraits from all five peoples, from Common to Super Legendary">

**500 portraits, six tiers** (250 Common down to 2 Super Legendary), all drawn
in code from layered traits. Yours is picked once, when you found your city,
and never re-rolled.

| People | Land | Plays like | Trade good |
|---|---|---|---|
| **Elves** | 160% forests, 40% ore | Strong defense, better economy | Moonleaf |
| **Lizardfolk** | 110% forests, 70% ore | Cheap soldiers, good loot, balanced | Spice |
| **Cavemen** | 130% forests, 60% ore | Very cheap soldiers, poor economy | Hides |
| **Dragonkin** | no forests, 200% ore | Devastating attack, buy every plank | Emberstone |
| **Goblins** | 60% forests, 150% ore | Best loot, fragile walls | Gears |

---

## On chain

The game runs in your browser; one contract on NEAR testnet,
[`metropolix.testnet`](https://testnet.nearblocks.io/address/metropolix.testnet),
keeps what has to be shared and trusted: your city, raids between players,
the $METRO coin and treasure NFTs.

| Method | What it does |
|---|---|
| `mint_city(arc, name, portrait)` | one city per account; attach 0.05 NEAR for its storage, get a 100 $METRO welcome grant |
| `commit_snapshot(grid, levels, army, gold, xp, tick)` | saves the city after checking the layout (60 building kinds, tables generated from the simulation), the troop cap and XP never falling; the tick clock, gold and XP are clamped to what the chain can vouch for (real time, what the saved city could have earned, what that gold could have bought) and the result says what was kept |
| `attack(target, commit, focus)` | a War Room battle against another player's saved city, luck from `env::random_seed()`; loot up to 35% of their on-chain gold, a 5 min shield after any loot, 60 s cooldown, new cities under level 3 protected |
| `buy_metro`, `sell_metro`, `quote_*`, `get_coin` | $METRO (NEP-141) against testnet NEAR in an x·y=k pool, 1% fee to the treasury |
| `mint_relic(kind)`, `return_relic(token_id)` | a treasure from your vault as a NEP-171 NFT (3 an hour; epic, legendary and mythic need saved level 3, 5 and 7); returning it burns the token; `nft_transfer` sends it to another player |
| `get_city`, `get_cities`, `get_leaderboard`, `get_battles` | read cities, ChainPower and the last 200 battles |

**$METRO and its NAV.** NAV = (treasury + city index × k) / supply, where the
city index grows with the gold saved by every player. mNAV is the pool price
over NAV. When mNAV reaches 2x the contract issues 0.5% more METRO into the
pool; under 0.9x the treasury buys METRO back and burns it. Each trade applies
the rules in proportion to its size (full at 1% of the pool), so dust swaps
cannot farm them. Raids move gold
between cities, so they move NAV, and players can trade the gap.

**No popup for every save.** Turning on autosave adds one function-call access
key to your account, limited to `commit_snapshot`, `attack`, `mint_relic` and
`return_relic`, with no deposits and a 0.25 NEAR gas allowance. It lives in your
browser. Anything that moves NEAR still goes through your wallet.

**Reads go through an indexer.** `/api/chain/*` pulls the contract's views at
most every 5 minutes (and on demand after an action) into Postgres when
`DATABASE_URL` is set, or into server memory otherwise. A GitHub Actions cron
also calls `/api/chain/sync` every 5 minutes. The game reads players, battles,
coin history and NFTs from there and your own city straight from the RPC.

The wallet layer is `@hot-labs/near-connect`, loaded only when the browser is
idle or you press Connect, so the city is playable first.

## How it is built

| Part | What | Where |
|---|---|---|
| **The world** | Integer-only, seeded, deterministic simulation: the same seed and moves give the same city on every machine, so the contract can replay it later. 122 tests, property tests with fast-check among them. | [`packages/sim/`](packages/sim/) |
| **The indexer** | Next.js route handlers over the contract's views, Neon Postgres or memory. | [`apps/web/app/api/chain/`](apps/web/app/api/chain/) |
| **The game** | Next.js 16, React 19, PixiJS 8 isometric renderer with HD and Lite modes. Every sprite, tile, icon and portrait is pixel art drawn in code; no third-party art. | [`apps/web/`](apps/web/) |
| **The chain** | Rust NEAR contract (near-sdk 5, near-contract-standards for NEP-141 and NEP-171), 30 unit tests; a test fails when its building tables drift from the simulation. | [`contracts/metropolix/`](contracts/metropolix/) |

On a production build the city paints in about half a second and holds around
56 FPS with no long tasks while you play.

**Libraries:** Next.js, React, PixiJS, three.js, GSAP, Lenis, Tailwind CSS,
near-api-js, @hot-labs/near-connect, @neondatabase/serverless, Vitest,
fast-check, near-sdk, near-contract-standards.

**Built with AI, said plainly.** Claude Code planned the work, wrote most of
the simulation, contract, game UI and landing page, and reviewed every change.
Worker agents (Gemini and Claude Sonnet through the Antigravity CLI) drew most
of the sprites and the portrait generator from written task files; their output
was reviewed and fixed by hand. The owner set the idea, the peoples and the
look, played every build and decided what shipped. Everything here was written
for the hackathon, starting 10 November 2026, with no starter template.

## Limits, stated plainly

- Testnet only. $METRO and the NFTs have no real value.
- The contract bounds what a client may claim (layout, troops, clock, gold, XP) but does not replay the simulation. Gold from trades and AI raids beyond that bound is saved at the bound, and the panel says so.
- Treasure finds are not proven on chain: the vault lives in the browser. Minting is rate-limited and gated by saved level.
- The contract was reviewed by an AI auditor before the deadline (storage refunds, first-save bounds, dust rebalancing, double-counted loot, overflow); every finding is fixed and has a test.
- Rival AI mayors are simulated in the browser; only players who founded a city on chain can be raided on chain.
- Heroes, spells and rams are left out of on-chain battles.
- Desktop only for now.

## Commands

```bash
pnpm test        # 122 simulation tests, including the contract-table sync check
pnpm typecheck
pnpm build && pnpm --filter @metropolix/web exec next start

cd contracts/metropolix
cargo test                                          # 30 unit tests
cargo build --target wasm32-unknown-unknown --release   # .cargo/config.toml adds --cfg near so panics keep their message
# tables.rs is generated: cd packages/sim && UPDATE=1 npx vitest run tests/contract-tables.test.ts
```

## License

[MIT](LICENSE).

> Build a city, find something rare, and see whether you want to come back tomorrow.
