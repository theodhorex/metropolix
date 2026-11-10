# Metropolix contract

On-chain half of a hybrid city builder. The simulation runs off-chain (`packages/sim`); this contract holds ownership, the committed city snapshot, ChainPower and asynchronous battles. near-sdk 5.30.0, NEAR testnet only.

## Methods
| Method | Who | What |
|---|---|---|
| `mint_city()` | any account, once | creates an empty 40x40 city |
| `commit_snapshot(grid, troops, tick, econ_score)` | owner | validates grid (1600 bytes, codes 0..8), non-decreasing tick, troops <= 20 x barracks, econ_score <= `max_econ_score(grid)` |
| `attack(target)` | owner | resolves vs target's committed defense; 60 s cooldown per target; random factor 0.85..1.15 from `env::random_seed()`; returns `{win, force, target_defense, troops_lost, loot}` |
| `claim_loot()` | owner | returns and zeroes `loot_claimable` |
| `get_city(account_id)`, `get_leaderboard(from_index, limit<=50)`, `get_constants()` | view | derived `attack`, `defense`, `chain_power` are computed on read |

Events (NEP-297, standard `metropolix` 1.0.0): `city_minted`, `snapshot_committed`, `battle_resolved`.

## Trust boundary (honest limit)
The contract bounds what a client may claim (grid validity, troop cap, an upper bound on econ_score) but does not replay the simulation. `econ_score` and loot are client-reported within those bounds. Planned fix: deterministic replay or checkpoint verification, since `packages/sim` is integer-only and reproducible. `get_leaderboard` is O(N) over all cities; fine for a hackathon, not for scale.

## Commands
```
cargo test                                              # 22 unit + property tests
cargo build --target wasm32-unknown-unknown --release   # cargo-near is not installed
cargo test --test workspaces -- --ignored               # sandbox e2e; needs network on first run
```
