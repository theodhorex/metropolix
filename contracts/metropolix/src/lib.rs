// Metropolix v2 on NEAR testnet: cities, snapshots with bounds, real player-vs-player raids,
// the $METRO coin (NEP-141 + a constant-product pool backed by the cities' treasuries) and relic NFTs (NEP-171).
// The game itself runs in the browser (packages/sim, integer-only); the chain owns identity, the committed city,
// battles between players, the coin and the relics. Rule tables come from the sim (src/tables.rs, generated).
//
// Sources: near-sdk 5.30 #[near] macros and store collections (docs.rs/near-sdk/5.30.0),
// near-contract-standards 5.30 FungibleToken / NonFungibleToken, NEP-141, NEP-171, NEP-297 events.

pub mod coin;
pub mod relics;
pub mod tables;
pub mod war;

use std::collections::BTreeMap;

use near_contract_standards::fungible_token::FungibleToken;
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::json_types::U128;
use near_sdk::serde_json::{self, json};
use near_sdk::store::{IterableMap, LookupMap};
use near_sdk::{AccountId, BorshStorageKey, PanicOnDefault, env, near, require};

use crate::tables::*;
use crate::war::*;

pub const NS: u64 = 1_000_000_000;
/// Grace on the tick clock: a city may report this many more seconds than the chain saw pass.
pub const TICK_GRACE_SECS: u64 = 120;
/// What a brand-new city may already hold on its first snapshot (a local save started before the wallet).
pub const FIRST_GOLD_ALLOWANCE: u64 = 50_000;
/// Extra gold per second the bound allows on top of the grid's income: market sales and citizen gifts.
pub const TRADE_MARGIN_PER_SEC: u64 = 200;
/// Cities below this level cannot be raided by other players.
pub const NEWBIE_LEVEL: u8 = 3;
pub const BATTLES_KEPT: u64 = 200;
pub const MAX_NAME_LEN: usize = 24;
pub const MAX_PAGE: u32 = 100;

#[near(serializers = [borsh])]
#[derive(BorshStorageKey)]
enum StorageKey {
    Cities,
    Battles,
    FtAccounts,
    NftOwners,
    NftMeta,
    NftEnum,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Record {
    pub won: u32,
    pub lost: u32,
    pub held: u32,
    pub breached: u32,
}

#[near(serializers = [borsh])]
#[derive(Clone, Debug)]
pub struct City {
    pub owner: AccountId,
    pub name: String,
    pub arc: u8,
    pub portrait: u32,
    pub grid: Vec<u8>,
    pub levels: Vec<u8>,
    pub army: [u32; 3],
    pub gold: u64,
    pub xp: u64,
    pub tick: u64,
    pub minted_ns: u64,
    pub committed_ns: u64,
    pub commits: u64,
    pub trophies: u32,
    pub record: Record,
    pub shield_until_ns: u64,
    /// Gold other players took since the last snapshot; the next snapshot subtracts it.
    pub gold_lost_unsynced: u64,
    /// Gold won in raids since the last snapshot; the next snapshot's bound allows it.
    pub loot_unsynced: u64,
    pub last_attack_ns: BTreeMap<AccountId, u64>,
    pub relic_window_ns: u64,
    pub relic_mints: u32,
}

#[near(serializers = [json])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CityView {
    pub owner: AccountId,
    pub name: String,
    pub arc: u8,
    pub portrait: u32,
    pub level: u8,
    pub xp: u64,
    pub gold: u64,
    pub army: [u32; 3],
    pub troops: u64,
    pub tick: u64,
    pub committed_ns: u64,
    pub commits: u64,
    pub trophies: u32,
    pub record: Record,
    pub shield_until_ns: u64,
    pub gold_lost_unsynced: u64,
    pub buildings: u32,
    pub econ_score: u64,
    pub attack: u64,
    pub defense: u64,
    pub chain_power: u64,
    pub grid: Option<Vec<u8>>,
    pub levels: Option<Vec<u8>>,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Battle {
    pub seq: u64,
    pub ts_ns: u64,
    pub attacker: AccountId,
    pub target: AccountId,
    pub sent: u64,
    pub destruction: u64,
    pub stars: u8,
    pub loot: u64,
    pub lost: u64,
    pub trophies: i64,
    pub force: u64,
    pub eff_defense: u64,
    pub win: bool,
}

#[near(serializers = [json])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CommitResult {
    pub gold: u64,
    pub lost_applied: u64,
    pub trophies: u32,
    pub shield_until_ns: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Metropolix {
    pub(crate) owner_id: AccountId,
    pub(crate) cities: IterableMap<AccountId, City>,
    pub(crate) battles: LookupMap<u64, Battle>,
    pub(crate) next_battle: u64,
    pub(crate) token: FungibleToken,
    pub(crate) pool: coin::Pool,
    pub(crate) nft: NonFungibleToken,
    pub(crate) next_relic: u64,
}

pub(crate) fn emit(event: &str, data: serde_json::Value) {
    let log = json!({ "standard": "metropolix", "version": "2.0.0", "event": event, "data": [data] });
    env::log_str(&format!("EVENT_JSON:{log}"));
}

fn now_ns() -> u64 {
    env::block_timestamp()
}

impl City {
    fn view(&self, full: bool) -> CityView {
        let econ = econ_score(&self.grid, &self.levels, self.arc);
        let attack = attack_power(&self.army, self.arc);
        let defense = defense_power(&self.army, &self.grid, &self.levels, self.arc);
        CityView {
            owner: self.owner.clone(),
            name: self.name.clone(),
            arc: self.arc,
            portrait: self.portrait,
            level: level_from_xp(self.xp),
            xp: self.xp,
            gold: self.gold,
            army: self.army,
            troops: troops(&self.army),
            tick: self.tick,
            committed_ns: self.committed_ns,
            commits: self.commits,
            trophies: self.trophies,
            record: self.record.clone(),
            shield_until_ns: self.shield_until_ns,
            gold_lost_unsynced: self.gold_lost_unsynced,
            buildings: self.grid.iter().filter(|&&c| c != 0).count() as u32,
            econ_score: econ,
            attack,
            defense,
            chain_power: chain_power(econ, attack, defense),
            grid: full.then(|| self.grid.clone()),
            levels: full.then(|| self.levels.clone()),
        }
    }
}

/// Check a snapshot's grid and levels against the game's rules; panics with a reason.
pub fn check_layout(grid: &[u8], levels: &[u8], arc: u8) {
    require!(grid.len() == GRID_CELLS, "Invalid grid length: expected 1600 cells");
    require!(levels.len() == GRID_CELLS, "Invalid levels length: expected 1600 cells");
    let mut counts = [0u64; BUILDING_COUNT];
    for i in 0..GRID_CELLS {
        let c = grid[i];
        require!(usize::from(c) <= BUILDING_COUNT, "Invalid building code");
        let lv = levels[i];
        require!(lv <= MAX_BLD_LEVEL, "Invalid building level");
        if c == 0 {
            require!(lv == 0, "Level on an empty tile");
            continue;
        }
        let k = usize::from(c - 1);
        counts[k] += 1;
        require!(lv <= 1 || CAN_UPGRADE[k], "This building cannot be upgraded");
        require!(WONDER_ARC[k] == 255 || WONDER_ARC[k] == arc, "Wonder of another people");
    }
    for k in 0..BUILDING_COUNT {
        require!(LIMIT[k] == 0 || counts[k] <= LIMIT[k], "Too many of a limited building");
    }
}

#[near]
impl Metropolix {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        let mut this = Self {
            owner_id: owner_id.clone(),
            cities: IterableMap::new(StorageKey::Cities),
            battles: LookupMap::new(StorageKey::Battles),
            next_battle: 1,
            token: FungibleToken::new(StorageKey::FtAccounts),
            pool: coin::Pool::default(),
            nft: NonFungibleToken::new(StorageKey::NftOwners, owner_id, Some(StorageKey::NftMeta), Some(StorageKey::NftEnum), None::<StorageKey>),
            next_relic: 1,
        };
        let me = env::current_account_id();
        this.token.internal_register_account(&me);
        this
    }

    /// Found your city: pick a people (0 elf, 1 lizard, 2 caveman, 3 dragon, 4 goblin) and the mayor's name.
    /// The chain pays the storage. Every new mayor gets the welcome grant of $METRO.
    pub fn mint_city(&mut self, arc: u8, name: String, portrait: Option<u32>) -> CityView {
        let caller = env::predecessor_account_id();
        require!(usize::from(arc) < ARC_IDS.len(), "Unknown people");
        require!(!self.cities.contains_key(&caller), "City already minted");
        let name = name.trim().to_string();
        require!(!name.is_empty() && name.chars().count() <= MAX_NAME_LEN, "Name must be 1-24 characters");
        let city = City {
            owner: caller.clone(),
            name,
            arc,
            portrait: portrait.unwrap_or(0),
            grid: vec![0; GRID_CELLS],
            levels: vec![0; GRID_CELLS],
            army: [0; 3],
            gold: 0,
            xp: 0,
            tick: 0,
            minted_ns: now_ns(),
            committed_ns: 0,
            commits: 0,
            trophies: 0,
            record: Record::default(),
            shield_until_ns: 0,
            gold_lost_unsynced: 0,
            loot_unsynced: 0,
            last_attack_ns: BTreeMap::new(),
            relic_window_ns: 0,
            relic_mints: 0,
        };
        let view = city.view(false);
        self.cities.insert(caller.clone(), city);
        self.grant_welcome(&caller);
        emit("city_minted", json!({ "owner": caller, "arc": arc, "name": view.name }));
        view
    }

    /// Save the city. Bounded, not replayed: valid layout, troops within the barracks, the tick clock no faster
    /// than the chain's, gold no more than the grid could have earned (plus raid winnings), XP never falling.
    /// Gold other players took since the last save is subtracted here and reported back as `lost_applied`.
    pub fn commit_snapshot(&mut self, grid: Vec<u8>, levels: Vec<u8>, army: [u32; 3], gold: U128, xp: U128, tick: U128) -> CommitResult {
        let caller = env::predecessor_account_id();
        let (gold, xp, tick) = (gold.0 as u64, xp.0 as u64, tick.0 as u64);
        let now = now_ns();
        let mut city = self.cities.get(&caller).cloned().unwrap_or_else(|| env::panic_str("City not found: mint a city first"));
        check_layout(&grid, &levels, city.arc);
        require!(troops(&army) <= troop_cap(&grid, &levels) + 5, "Invalid troops: more than the barracks hold");
        require!(xp >= city.xp, "XP cannot go down");
        require!(tick >= city.tick, "Invalid tick: older than the saved city");
        let first = city.commits == 0;
        let elapsed = if first { tick } else { (now - city.committed_ns) / NS + TICK_GRACE_SECS };
        require!(first || tick - city.tick <= elapsed, "Invalid tick: the city clock ran faster than real time");
        // income comes from the city as it was saved; buildings claimed now only earn from the next save on
        let rate = if first { max_income(&grid, &levels) } else { max_income(&city.grid, &city.levels) } + TRADE_MARGIN_PER_SEC;
        let base = if first { FIRST_GOLD_ALLOWANCE } else { city.gold };
        let bound = base + rate * (tick - city.tick) + city.loot_unsynced;
        require!(gold <= bound, "Invalid gold: more than this city could have earned");

        let old_index = isqrt(u128::from(city.gold));
        let lost_applied = city.gold_lost_unsynced.min(gold);
        city.grid = grid;
        city.levels = levels;
        city.army = army;
        city.gold = gold - lost_applied;
        city.xp = xp;
        city.tick = tick;
        city.committed_ns = now;
        city.commits += 1;
        city.gold_lost_unsynced = 0;
        city.loot_unsynced = 0;
        let new_index = isqrt(u128::from(city.gold));
        self.pool.city_index = self.pool.city_index - old_index + new_index;
        let out = CommitResult { gold: city.gold, lost_applied, trophies: city.trophies, shield_until_ns: city.shield_until_ns };
        let v = city.view(false);
        self.cities.insert(caller.clone(), city);
        emit("snapshot_committed", json!({ "owner": caller, "tick": tick, "gold": out.gold, "chain_power": v.chain_power }));
        out
    }

    /// Raid another player's saved city with the War Room rules. `commit` = percent of your army (10..100),
    /// `focus` 0 balanced, 1 loot, 2 trophy. Loot comes out of their on-chain treasury.
    pub fn attack(&mut self, target: AccountId, commit: Option<u8>, focus: Option<u8>) -> Battle {
        let me = env::predecessor_account_id();
        require!(me != target, "Cannot attack your own city");
        let now = now_ns();
        let mut a = self.cities.get(&me).cloned().unwrap_or_else(|| env::panic_str("Attacker does not have a city"));
        let mut d = self.cities.get(&target).cloned().unwrap_or_else(|| env::panic_str("Target does not have a city"));
        require!(troops(&a.army) > 0, "No troops: train some and save your city first");
        require!(d.commits > 0, "That city has never been saved on chain");
        require!(level_from_xp(d.xp) >= NEWBIE_LEVEL, "New cities (below level 3) are protected");
        require!(d.shield_until_ns <= now, "That city is shielded after a recent raid");
        if let Some(&last) = a.last_attack_ns.get(&target) {
            require!(now >= last + ATTACK_COOLDOWN_SECS * NS, "Target is on cooldown");
        }
        let seed = env::random_seed();
        let roll = 850 + (u64::from(u16::from_le_bytes([seed[0], seed[1]])) % 300);
        let f = {
            let atk = Side { army: a.army, arc: a.arc, grid: &a.grid, levels: &a.levels, gold: a.gold };
            let def = Side { army: d.army, arc: d.arc, grid: &d.grid, levels: &d.levels, gold: d.gold };
            fight(&atk, &def, commit.unwrap_or(100), focus.unwrap_or(0), roll)
        };
        let win = f.stars >= 1;
        // attacker
        lose_troops(&mut a.army, &f.sent, f.lost);
        a.trophies = (i64::from(a.trophies) + f.trophies).max(0) as u32;
        if win { a.record.won += 1 } else { a.record.lost += 1 }
        a.last_attack_ns.retain(|_, t| now < *t + ATTACK_COOLDOWN_SECS * NS);
        a.last_attack_ns.insert(target.clone(), now);
        // defender
        if win {
            d.record.breached += 1;
            d.trophies = d.trophies.saturating_sub(6);
            d.shield_until_ns = now + SHIELD_SECS * NS;
        } else {
            d.record.held += 1;
            d.trophies += 3;
        }
        // gold moves between the treasuries
        let ai = isqrt(u128::from(a.gold)) + isqrt(u128::from(d.gold));
        d.gold -= f.loot;
        d.gold_lost_unsynced += f.loot;
        a.gold += f.loot;
        a.loot_unsynced += f.loot;
        let bi = isqrt(u128::from(a.gold)) + isqrt(u128::from(d.gold));
        self.pool.city_index = self.pool.city_index - ai + bi;

        let b = Battle {
            seq: self.next_battle,
            ts_ns: now,
            attacker: me.clone(),
            target: target.clone(),
            sent: f.n,
            destruction: f.destruction,
            stars: f.stars,
            loot: f.loot,
            lost: f.lost,
            trophies: f.trophies,
            force: f.force,
            eff_defense: f.eff_defense,
            win,
        };
        self.cities.insert(me, a);
        self.cities.insert(target, d);
        self.battles.insert(b.seq, b.clone());
        if b.seq > BATTLES_KEPT {
            self.battles.remove(&(b.seq - BATTLES_KEPT));
        }
        self.next_battle += 1;
        emit("battle_resolved", serde_json::to_value(&b).unwrap());
        b
    }

    // ---------- views ----------
    pub fn get_city(&self, account_id: AccountId, full: Option<bool>) -> Option<CityView> {
        self.cities.get(&account_id).map(|c| c.view(full.unwrap_or(true)))
    }

    /// Cities in insertion order (for the indexer), without grids unless asked.
    pub fn get_cities(&self, from_index: Option<u32>, limit: Option<u32>, full: Option<bool>) -> Vec<CityView> {
        let full = full.unwrap_or(false);
        self.cities
            .values()
            .skip(from_index.unwrap_or(0) as usize)
            .take(limit.unwrap_or(50).min(MAX_PAGE) as usize)
            .map(|c| c.view(full))
            .collect()
    }

    pub fn get_city_count(&self) -> u32 {
        self.cities.len()
    }

    /// Top cities by ChainPower. O(N): fine for a hackathon; the indexer sorts at scale.
    pub fn get_leaderboard(&self, limit: Option<u32>) -> Vec<CityView> {
        let mut all: Vec<CityView> = self.cities.values().map(|c| c.view(false)).collect();
        all.sort_by(|x, y| y.chain_power.cmp(&x.chain_power).then(x.owner.cmp(&y.owner)));
        all.truncate(limit.unwrap_or(20).min(MAX_PAGE) as usize);
        all
    }

    /// Battles with seq >= from_seq (the last 200 are kept).
    pub fn get_battles(&self, from_seq: Option<u64>, limit: Option<u32>) -> Vec<Battle> {
        let first = self.next_battle.saturating_sub(BATTLES_KEPT).max(1).max(from_seq.unwrap_or(1));
        (first..self.next_battle)
            .take(limit.unwrap_or(50).min(MAX_PAGE) as usize)
            .filter_map(|s| self.battles.get(&s).cloned())
            .collect()
    }

    pub fn get_next_battle(&self) -> u64 {
        self.next_battle
    }

    pub fn get_rules(&self) -> serde_json::Value {
        json!({
            "grid_cells": GRID_CELLS,
            "building_kinds": &BUILDING_KINDS[..],
            "arcs": &ARC_IDS[..],
            "relics": &RELIC_KINDS[..],
            "newbie_level": NEWBIE_LEVEL,
            "shield_secs": SHIELD_SECS,
            "attack_cooldown_secs": ATTACK_COOLDOWN_SECS,
            "max_loot_pct": MAX_LOOT_PCT,
            "tick_grace_secs": TICK_GRACE_SECS,
            "trade_margin_per_sec": TRADE_MARGIN_PER_SEC,
            "first_gold_allowance": FIRST_GOLD_ALLOWANCE,
        })
    }
}

#[cfg(test)]
pub(crate) mod test_utils {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{NearToken, testing_env};

    pub fn acc(s: &str) -> AccountId {
        s.parse().unwrap()
    }
    pub fn ctx(who: &str, ts_secs: u64, deposit: u128) {
        let mut b = VMContextBuilder::new();
        b.current_account_id(acc("metropolix.testnet"))
            .predecessor_account_id(acc(who))
            .signer_account_id(acc(who))
            .block_timestamp(ts_secs * NS)
            .attached_deposit(NearToken::from_yoctonear(deposit))
            .account_balance(NearToken::from_near(1000))
            .random_seed([7; 32]);
        testing_env!(b.build());
    }
    pub fn fresh() -> Metropolix {
        ctx("metropolix.testnet", 1, 0);
        Metropolix::new(acc("metropolix.testnet"))
    }
    pub fn code(kind: &str) -> u8 {
        BUILDING_KINDS.iter().position(|k| *k == kind).unwrap() as u8 + 1
    }
    pub fn layout(kinds: &[(&str, usize)]) -> (Vec<u8>, Vec<u8>) {
        let mut g = vec![0u8; GRID_CELLS];
        let mut i = 0;
        for (k, n) in kinds {
            for _ in 0..*n {
                g[i] = code(k);
                i += 1;
            }
        }
        (g, vec![0u8; GRID_CELLS])
    }
}

#[cfg(test)]
mod tests {
    use super::test_utils::*;
    use super::*;
    use near_contract_standards::fungible_token::core::FungibleTokenCore;

    fn founded(c: &mut Metropolix, who: &str, arc: u8, t: u64) {
        ctx(who, t, 0);
        c.mint_city(arc, format!("Mayor {who}"), None);
    }

    #[test]
    fn mint_once_with_a_name() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10);
        let v = c.get_city(acc("alice.testnet"), Some(false)).unwrap();
        assert_eq!(v.name, "Mayor alice.testnet");
        assert_eq!(c.token.ft_balance_of(acc("alice.testnet")).0, coin::WELCOME_GRANT);
    }

    #[test]
    #[should_panic(expected = "City already minted")]
    fn mint_twice_fails() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10);
        founded(&mut c, "alice.testnet", 0, 11);
    }

    #[test]
    fn snapshot_within_bounds() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10);
        let (g, l) = layout(&[("barracks", 2), ("house", 10), ("shop", 5)]);
        ctx("alice.testnet", 20, 0);
        let r = c.commit_snapshot(g.clone(), l.clone(), [10, 10, 0], U128(5_000), U128(500), U128(600));
        assert_eq!(r.gold, 5_000);
        // ten minutes later, a little richer
        ctx("alice.testnet", 620, 0);
        c.commit_snapshot(g, l, [20, 10, 10], U128(8_000), U128(900), U128(1_200));
        let v = c.get_city(acc("alice.testnet"), Some(false)).unwrap();
        assert_eq!((v.gold, v.troops, v.commits), (8_000, 40, 2));
    }

    #[test]
    #[should_panic(expected = "Invalid gold")]
    fn gold_from_nowhere_fails() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10);
        let (g, l) = layout(&[("house", 1)]);
        ctx("alice.testnet", 20, 0);
        c.commit_snapshot(g.clone(), l.clone(), [0; 3], U128(100), U128(0), U128(10));
        ctx("alice.testnet", 80, 0);
        c.commit_snapshot(g, l, [0; 3], U128(10_000_000), U128(0), U128(60));
    }

    #[test]
    #[should_panic(expected = "ran faster than real time")]
    fn fast_clock_fails() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10);
        let (g, l) = layout(&[("house", 1)]);
        ctx("alice.testnet", 20, 0);
        c.commit_snapshot(g.clone(), l.clone(), [0; 3], U128(100), U128(0), U128(10));
        ctx("alice.testnet", 30, 0);
        c.commit_snapshot(g, l, [0; 3], U128(100), U128(0), U128(10_000));
    }

    #[test]
    #[should_panic(expected = "Wonder of another people")]
    fn foreign_wonder_fails() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10); // elf
        let (g, l) = layout(&[("emberthrone", 1)]);
        ctx("alice.testnet", 20, 0);
        c.commit_snapshot(g, l, [0; 3], U128(0), U128(0), U128(1));
    }

    #[test]
    #[should_panic(expected = "Invalid troops")]
    fn troops_need_barracks() {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 0, 10);
        let (g, l) = layout(&[("barracks", 1)]);
        ctx("alice.testnet", 20, 0);
        c.commit_snapshot(g, l, [30, 0, 0], U128(0), U128(0), U128(1));
    }

    fn two_cities() -> Metropolix {
        let mut c = fresh();
        founded(&mut c, "alice.testnet", 4, 10);
        founded(&mut c, "bob.testnet", 0, 10);
        let (g, l) = layout(&[("barracks", 5), ("armory", 2), ("house", 10)]);
        ctx("alice.testnet", 20, 0);
        c.commit_snapshot(g, l, [20, 60, 20], U128(1_000), U128(2_000), U128(10));
        let (g, l) = layout(&[("house", 20), ("shop", 10), ("barracks", 1)]);
        ctx("bob.testnet", 20, 0);
        c.commit_snapshot(g, l, [5, 0, 0], U128(20_000), U128(2_000), U128(10));
        c
    }

    #[test]
    fn raid_moves_gold_and_syncs_on_next_save() {
        let mut c = two_cities();
        ctx("alice.testnet", 100, 0);
        let b = c.attack(acc("bob.testnet"), None, Some(1));
        assert!(b.win && b.loot > 0 && b.lost >= 1);
        let bob = c.get_city(acc("bob.testnet"), Some(false)).unwrap();
        assert_eq!(bob.gold, 20_000 - b.loot);
        assert_eq!(bob.gold_lost_unsynced, b.loot);
        assert!(bob.shield_until_ns > 100 * NS);
        assert_eq!(c.get_battles(None, None).len(), 1);
        // bob's game still thinks it has 20,000 and more: the save subtracts the raid
        let (g, l) = layout(&[("house", 20), ("shop", 10), ("barracks", 1)]);
        ctx("bob.testnet", 200, 0);
        let r = c.commit_snapshot(g, l, [5, 0, 0], U128(20_500), U128(2_100), U128(180));
        assert_eq!(r.lost_applied, b.loot);
        assert_eq!(r.gold, 20_500 - b.loot);
        // alice may save her loot
        let (g, l) = layout(&[("barracks", 5), ("armory", 2), ("house", 10)]);
        ctx("alice.testnet", 200, 0);
        let a = c.get_city(acc("alice.testnet"), Some(false)).unwrap();
        c.commit_snapshot(g, l, a.army, U128(1_000 + u128::from(b.loot)), U128(2_100), U128(180));
    }

    #[test]
    #[should_panic(expected = "shielded")]
    fn shield_after_a_raid() {
        let mut c = two_cities();
        ctx("alice.testnet", 100, 0);
        c.attack(acc("bob.testnet"), None, None);
        ctx("alice.testnet", 170, 0);
        c.attack(acc("bob.testnet"), None, None);
    }

    #[test]
    #[should_panic(expected = "protected")]
    fn newbies_are_protected() {
        let mut c = two_cities();
        founded(&mut c, "carol.testnet", 1, 30);
        let (g, l) = layout(&[("house", 1)]);
        ctx("carol.testnet", 40, 0);
        c.commit_snapshot(g, l, [0; 3], U128(500), U128(10), U128(5));
        ctx("alice.testnet", 100, 0);
        c.attack(acc("carol.testnet"), None, None);
    }

    #[test]
    fn leaderboard_sorted() {
        let c = two_cities();
        let lb = c.get_leaderboard(None);
        assert_eq!(lb.len(), 2);
        assert!(lb[0].chain_power >= lb[1].chain_power);
    }
}
