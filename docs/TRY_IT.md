# Try Metropolix

A 5 to 10 minute walkthrough in "do X, see Y" form. Everything runs on **NEAR testnet**: no mainnet account, no real funds. The game is live at <https://metropolix-city.vercel.app/play>.

What lives where: the per-second city simulation runs in your browser. The Rust contract `metropolix.testnet` keeps saved cities, bounds what every save may claim, resolves raids, and holds the $METRO coin and the relic NFTs.

## Part 1. No wallet (about 4 minutes)

| Do this | You should see |
|---|---|
| **1.** Open [/play](https://metropolix-city.vercel.app/play). Pick a people from the portrait strip at the bottom (try Elves, then Dragonkin), press **Choose the …**, then **Yes, found my city**. | Five peoples, each with its own land, strengths, weaknesses and trade good. The choice cannot be changed. |
| **2.** Type a mayor name (3 to 20 characters) and press **Take office**. Skip the tutorial if you like. | A big empty map, 800 gold, and a HUD with gold, citizens, happiness and storehouse goods. |
| **3.** **Shop → Residential → House**, then tap an empty tile. Repeat three times. Then **Shop → Industry → Farm** and tap a tile. | Each placement costs gold and wood and shows `-100` floating over the tile. Citizens move in; the Houses counter in the top bar fills (for example 8/40). |
| **4.** Click **City → Economy**. | A table of every tax rate with what it earns and what it costs in happiness, before you pick one. The other tabs (Overview, Demand, Happiness, Education, Military, Resources, Progress) explain every number. |
| **5.** Tap a building, then **Upgrade**. | Now versus next, and the building changes shape on the map (levels 1 to 3). |
| **6.** Click **Market**. | Trading post, City offers, Wanted and My trades. Each people makes one trade good the others need (Moonleaf, Spice, Hides, Emberstone, Gears). |
| **7.** Click **Vault**. | Your treasures and a chronicle. Mines and mills dig up relics rarely, so a new city may have none yet. |
| **8.** Open [/verify](https://metropolix-city.vercel.app/verify) and press **Re-run audit**. | The page reads raw contract data from a NEAR testnet RPC node and recomputes every saved city and the $METRO backing in your browser. A green line says they match to the digit. A mismatch would turn red. |

## Part 2. With a NEAR testnet wallet (about 5 minutes)

You need a testnet wallet with a little testnet NEAR (at least 0.5). Meteor and Intear appear in the connector list. Testnet NEAR has no real value.

| Do this | You should see |
|---|---|
| **1.** In the right panel "NEAR testnet", press **Connect NEAR wallet** and approve in your wallet. | The panel shows your account id. |
| **2.** Press **Found my city on chain** and approve. It attaches **0.05 NEAR** for storage. | A transaction on `metropolix.testnet`; your city now exists on chain and you receive the welcome grant: up to 100 $METRO, never worth more than half the deposit. One city per account. |
| **3.** Press **Turn on autosave (one wallet confirmation)** and approve. | Your wallet shows an access key whose receiver is `metropolix.testnet`, limited to four methods (`commit_snapshot`, `attack`, `mint_relic`, `return_relic`) with a 0.25 NEAR gas allowance. It cannot move your NEAR. From then on the city saves itself every five minutes with no pop-ups. |
| **4.** Play for a while (build a **Barracks**, train troops), then open **Players on chain** and press **Raid** on a target. | Raids need troops saved on chain, and the target must be level 3 or higher, saved on chain at least twice and not shielded. The battle runs inside the contract with randomness from the chain. The log reports stars, gold gained and troops lost. A win moves gold between saved treasuries and shields the loser for five minutes; a raid with no star takes nothing. |
| **5.** Open the transaction on <https://testnet.nearblocks.io/address/metropolix.testnet>. | The `attack` call and its receipts. |
| **6.** Press **$METRO market**. | Pool price, NAV, the mNAV band and a history chart. $METRO is a NEP-141 coin in an x·y=k pool against testnet NEAR. Try a small buy (about 0.1 NEAR) and watch your balance update. Above 2x mNAV the contract issues more coins into the pool; below 0.9x the treasury buys back and burns. |
| **7.** Open **Vault**, pick a relic and press **Mint NFT** (if you have one). | A NEP-171 token minted to your account (minting needs your city saved on chain at level 3 or higher). Bringing it home burns it again. |
| **8.** Reopen [/verify](https://metropolix-city.vercel.app/verify) and press **Re-run audit**. | Your city now appears in the cities table, with the chain value and the recomputed value side by side. |

## Things worth knowing

- The simulation runs in the browser. The chain bounds what a save may claim (valid layout, troops inside the barracks, gold and XP clamped to what the city could have earned), but the minute-to-minute play is not on chain.
- Testnet only. $METRO and the NFTs have no real value, and the contract is not audited.
- The raid button stays disabled until you have saved troops on chain and the target is eligible. If it is greyed out, check the target's level and shield, then **Refresh** the list.
- Starting over: clear this site's browser data to get a fresh offline city. A saved city is restored from chain with **Load my city from chain**.

Claims mapped to evidence are in `JUDGES.md`; the contract is in `contracts/metropolix`.
