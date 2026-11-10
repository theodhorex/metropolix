// Source-driven citations:
// - near-sdk 5.30.0 #[near(contract_state)], #[near(serializers = [borsh, json])], store::IterableMap:
//   https://docs.rs/near-sdk/5.30.0/near_sdk/attr.near.html
//   https://docs.rs/near-sdk/5.30.0/near_sdk/store/struct.IterableMap.html
// - NEP-297 Events format:
//   https://github.com/near/NEPs/blob/master/neps/nep-0297.md

use std::collections::BTreeMap;
use near_sdk::serde_json::{self, json};
use near_sdk::store::IterableMap;
use near_sdk::{AccountId, BorshStorageKey, env, near, require};

pub const GRID_SIZE: u32 = 40;
pub const GRID_CELLS: usize = 1600;
pub const MAX_BUILDING_CODE: u8 = 14; // 1..8 functional, 9..12 decorations (no stats), 13 lumber camp, 14 mine
pub const ARC_COUNT: u8 = 5; // 0 elf, 1 lizard, 2 caveman, 3 dragon, 4 goblin
// Permille modifiers per arc, mirrors packages/sim ARCS. 1000 = neutral.
pub const ATTACK_PM: [u64; 5] = [950, 1050, 1100, 1250, 950];
pub const DEFENSE_PM: [u64; 5] = [1200, 1000, 900, 1000, 850];
pub const LOOT_PM: [u64; 5] = [900, 1100, 1000, 1100, 1300];
pub const MAX_ECON_PM: u64 = 1100; // highest econ modifier (elf)
pub const TROOP_COST: u64 = 40;
pub const TROOP_ATTACK: u64 = 5;
pub const TROOP_DEFENSE: u64 = 3;
pub const BARRACKS_TROOP_CAP: u32 = 20;
pub const TOWER_DEFENSE: u64 = 40;
pub const BASE_WAGE: u64 = 1;
pub const ATTACK_COOLDOWN_SECS: u64 = 60;
pub const ATTACK_COOLDOWN_NS: u64 = 60_000_000_000;
pub const MAX_LEADERBOARD_LIMIT: u32 = 50;

#[near(serializers = [borsh])]
#[derive(BorshStorageKey)]
enum StorageKey {
    Cities,
}

#[near(serializers = [borsh])]
#[derive(Clone, Debug)]
pub struct City {
    pub owner: AccountId,
    pub grid: Vec<u8>,
    pub troops: u32,
    pub tick: u64,
    pub econ_score: u64,
    pub trophies: u32,
    pub loot_claimable: u64,
    pub raided: u32,
    pub arc: u8,
    pub last_attack_ns: BTreeMap<AccountId, u64>,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CityView {
    pub owner: AccountId,
    pub grid: Vec<u8>,
    pub troops: u32,
    pub tick: u64,
    pub econ_score: u64,
    pub trophies: u32,
    pub loot_claimable: u64,
    pub raided: u32,
    pub arc: u8,
    pub attack: u64,
    pub defense: u64,
    pub chain_power: u64,
}

#[near(contract_state)]
pub struct MetropolixContract {
    cities: IterableMap<AccountId, City>,
}

impl Default for MetropolixContract {
    fn default() -> Self {
        Self {
            cities: IterableMap::new(StorageKey::Cities),
        }
    }
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct BattleOutcome {
    pub win: bool,
    pub force: u64,
    pub target_defense: u64,
    pub troops_lost: u32,
    pub loot: u64,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct GameConstants {
    pub grid_size: u32,
    pub grid_cells: u32,
    pub max_building_code: u8,
    pub building_kinds: Vec<String>,
    pub troop_cost: u64,
    pub troop_attack: u64,
    pub troop_defense: u64,
    pub barracks_troop_cap: u32,
    pub tower_defense: u64,
    pub base_wage: u64,
    pub attack_cooldown_secs: u64,
    pub max_leaderboard_limit: u32,
}

pub fn max_econ_score(grid: &[u8]) -> u64 {
    let mut sum_housing: u64 = 0;
    let mut sum_jobs: u64 = 0;
    let mut sum_output: u64 = 0;

    for &code in grid {
        match code {
            1 => sum_housing = sum_housing.saturating_add(10),
            2 => {
                sum_jobs = sum_jobs.saturating_add(4);
                sum_output = sum_output.saturating_add(6);
            }
            3 => {
                sum_jobs = sum_jobs.saturating_add(6);
                sum_output = sum_output.saturating_add(10);
            }
            4 => {
                sum_jobs = sum_jobs.saturating_add(8);
                sum_output = sum_output.saturating_add(16);
            }
            13 | 14 => sum_jobs = sum_jobs.saturating_add(4), // lumber camp, mine: jobs, resource output is off-chain
            _ => {}
        }
    }

    let max_gross = sum_output.saturating_add(sum_jobs.saturating_mul(BASE_WAGE));
    // upper bound: arc economy modifier is at most MAX_ECON_PM permille
    max_gross
        .saturating_mul(2)
        .saturating_add(sum_housing / 2)
        .saturating_mul(MAX_ECON_PM)
        / 1000
}
fn emit_event(event: &str, data: serde_json::Value) {
    let payload = json!({
        "standard": "metropolix",
        "version": "1.0.0",
        "event": event,
        "data": [data],
    });
    env::log_str(&format!("EVENT_JSON:{payload}"));
}

pub fn count_building(grid: &[u8], code: u8) -> u64 {
    grid.iter().filter(|&&c| c == code).count() as u64
}

pub fn compute_attack(troops: u32, arc: u8) -> u64 {
    u64::from(troops)
        .saturating_mul(TROOP_ATTACK)
        .saturating_mul(ATTACK_PM[usize::from(arc) % 5])
        / 1000
}

pub fn compute_defense(troops: u32, grid: &[u8], arc: u8) -> u64 {
    let tower_count = count_building(grid, 8);
    u64::from(troops)
        .saturating_mul(TROOP_DEFENSE)
        .saturating_add(TOWER_DEFENSE.saturating_mul(tower_count))
        .saturating_mul(DEFENSE_PM[usize::from(arc) % 5])
        / 1000
}

pub fn compute_chain_power(econ_score: u64, attack: u64, defense: u64) -> u64 {
    econ_score
        .saturating_add(attack)
        .saturating_add(defense.saturating_mul(3) / 2)
}

impl City {
    pub fn to_view(&self) -> CityView {
        let attack = compute_attack(self.troops, self.arc);
        let defense = compute_defense(self.troops, &self.grid, self.arc);
        let chain_power = compute_chain_power(self.econ_score, attack, defense);
        CityView {
            owner: self.owner.clone(),
            grid: self.grid.clone(),
            troops: self.troops,
            tick: self.tick,
            econ_score: self.econ_score,
            trophies: self.trophies,
            loot_claimable: self.loot_claimable,
            raided: self.raided,
            arc: self.arc,
            attack,
            defense,
            chain_power,
        }
    }
}

#[near]
impl MetropolixContract {
    pub fn mint_city(&mut self, arc: u8) {
        require!(arc < ARC_COUNT, "Invalid arc: choose 0..4 (elf, lizard, caveman, dragon, goblin)");
        let caller = env::predecessor_account_id();
        require!(
            !self.cities.contains_key(&caller),
            "City already minted for this account"
        );
        let city = City {
            owner: caller.clone(),
            grid: vec![0u8; GRID_CELLS],
            troops: 0,
            tick: 0,
            econ_score: 0,
            trophies: 0,
            loot_claimable: 0,
            raided: 0,
            arc,
            last_attack_ns: BTreeMap::new(),
        };
        self.cities.insert(caller.clone(), city);
        emit_event("city_minted", json!({ "owner": caller }));
    }

    pub fn get_city(&self, account_id: AccountId) -> Option<CityView> {
        self.cities.get(&account_id).map(City::to_view)
    }

    pub fn commit_snapshot(&mut self, grid: Vec<u8>, troops: u32, tick: u64, econ_score: u64) {
        let caller = env::predecessor_account_id();
        require!(
            grid.len() == GRID_CELLS,
            "Invalid grid length: expected 1600 bytes"
        );
        require!(
            grid.iter().all(|&c| c <= MAX_BUILDING_CODE),
            "Invalid building code: must be 0..=8"
        );

        let city = self
            .cities
            .get_mut(&caller)
            .unwrap_or_else(|| env::panic_str("City not found: mint a city first"));
        require!(
            city.owner == caller,
            "Only the city owner can commit a snapshot"
        );
        require!(
            tick >= city.tick,
            "Invalid tick: must be >= stored tick"
        );

        let barracks_count = count_building(&grid, 7);
        let max_troops = u64::from(BARRACKS_TROOP_CAP).saturating_mul(barracks_count);
        require!(
            u64::from(troops) <= max_troops,
            "Invalid troops: exceeds barracks capacity"
        );

        let max_econ = max_econ_score(&grid);
        require!(
            econ_score <= max_econ,
            "Invalid econ_score: exceeds maximum possible for grid"
        );

        city.grid = grid;
        city.troops = troops;
        city.tick = tick;
        city.econ_score = econ_score;

        let attack = compute_attack(city.troops, city.arc);
        let defense = compute_defense(city.troops, &city.grid, city.arc);
        let chain_power = compute_chain_power(city.econ_score, attack, defense);

        emit_event(
            "snapshot_committed",
            json!({
                "owner": caller,
                "tick": tick,
                "troops": troops,
                "econ_score": econ_score,
                "chain_power": chain_power,
            }),
        );
    }

    pub fn get_constants(&self) -> GameConstants {
        GameConstants {
            grid_size: GRID_SIZE,
            grid_cells: GRID_CELLS as u32,
            max_building_code: MAX_BUILDING_CODE,
            building_kinds: vec![
                "house".to_string(),
                "farm".to_string(),
                "shop".to_string(),
                "factory".to_string(),
                "school".to_string(),
                "park".to_string(),
                "barracks".to_string(),
                "tower".to_string(),
            ],
            troop_cost: TROOP_COST,
            troop_attack: TROOP_ATTACK,
            troop_defense: TROOP_DEFENSE,
            barracks_troop_cap: BARRACKS_TROOP_CAP,
            tower_defense: TOWER_DEFENSE,
            base_wage: BASE_WAGE,
            attack_cooldown_secs: ATTACK_COOLDOWN_SECS,
            max_leaderboard_limit: MAX_LEADERBOARD_LIMIT,
        }
    }

    pub fn attack(&mut self, target: AccountId) -> BattleOutcome {
        let attacker_id = env::predecessor_account_id();
        require!(attacker_id != target, "Cannot attack your own city");
        require!(
            self.cities.contains_key(&attacker_id),
            "Attacker does not have a city"
        );

        let target_defense = {
            let target_city = self
                .cities
                .get(&target)
                .unwrap_or_else(|| env::panic_str("Target does not have a city"));
            compute_defense(target_city.troops, &target_city.grid, target_city.arc)
        };

        let now = env::block_timestamp();
        let (attacker_troops, attacker_arc) = {
            let attacker = self
                .cities
                .get(&attacker_id)
                .unwrap_or_else(|| env::panic_str("Attacker does not have a city"));
            require!(attacker.troops > 0, "No troops available to attack");
            if let Some(&last_ns) = attacker.last_attack_ns.get(&target) {
                require!(
                    now >= last_ns.saturating_add(ATTACK_COOLDOWN_NS),
                    "Target is on cooldown"
                );
            }
            (attacker.troops, attacker.arc)
        };

        let seed = env::random_seed();
        let rand_bytes: [u8; 4] = seed[0..4]
            .try_into()
            .unwrap_or_else(|_| env::panic_str("Invalid random_seed length"));
        let rand_u32 = u32::from_le_bytes(rand_bytes);
        let roll = 850u64.saturating_add(u64::from(rand_u32 % 300));
        let force = u64::from(attacker_troops)
            .saturating_mul(TROOP_ATTACK)
            .saturating_mul(ATTACK_PM[usize::from(attacker_arc) % 5])
            / 1000
            * roll
            / 1000;

        let win = force > target_defense;
        let (troops_lost, loot) = if win {
            let lost = std::cmp::max(1, (u64::from(attacker_troops) * 15 / 100) as u32)
                .min(attacker_troops);
            let base_loot =
                std::cmp::max(50, 15u64.saturating_mul(target_defense).saturating_mul(6) / 100);
            let earned_loot = base_loot.saturating_mul(LOOT_PM[usize::from(attacker_arc) % 5]) / 1000;
            (lost, earned_loot)
        } else {
            let lost = std::cmp::max(1, (u64::from(attacker_troops) * 40 / 100) as u32)
                .min(attacker_troops);
            (lost, 0)
        };

        {
            let attacker = self
                .cities
                .get_mut(&attacker_id)
                .unwrap_or_else(|| env::panic_str("Attacker does not have a city"));
            attacker.troops = attacker.troops.saturating_sub(troops_lost);
            attacker.last_attack_ns.insert(target.clone(), now);
            if win {
                attacker.trophies = attacker.trophies.saturating_add(1);
                attacker.loot_claimable = attacker.loot_claimable.saturating_add(loot);
            }
        }

        if win {
            let target_city = self
                .cities
                .get_mut(&target)
                .unwrap_or_else(|| env::panic_str("Target does not have a city"));
            target_city.raided = target_city.raided.saturating_add(1);
        }

        emit_event(
            "battle_resolved",
            json!({
                "attacker": attacker_id,
                "target": target,
                "win": win,
                "force": force,
                "target_defense": target_defense,
                "troops_lost": troops_lost,
                "loot": loot,
            }),
        );

        BattleOutcome {
            win,
            force,
            target_defense,
            troops_lost,
            loot,
        }
    }

    pub fn claim_loot(&mut self) -> u64 {
        let caller = env::predecessor_account_id();
        let city = self
            .cities
            .get_mut(&caller)
            .unwrap_or_else(|| env::panic_str("City not found: mint a city first"));
        require!(
            city.owner == caller,
            "Only the city owner can claim loot"
        );
        let claimed = city.loot_claimable;
        city.loot_claimable = 0;
        claimed
    }

    /// Returns up to `limit` (capped at 50) cities sorted by `chain_power` descending.
    /// Note: Iterates and sorts all cities in memory (`O(N log N)`), which is suitable for small N.
    pub fn get_leaderboard(&self, from_index: u32, limit: u32) -> Vec<CityView> {
        let capped_limit = limit.min(MAX_LEADERBOARD_LIMIT) as usize;
        if capped_limit == 0 {
            return Vec::new();
        }
        let mut views: Vec<CityView> = self.cities.values().map(City::to_view).collect();
        views.sort_by(|a, b| {
            b.chain_power
                .cmp(&a.chain_power)
                .then_with(|| b.trophies.cmp(&a.trophies))
                .then_with(|| b.econ_score.cmp(&a.econ_score))
                .then_with(|| a.owner.cmp(&b.owner))
        });
        views
            .into_iter()
            .skip(from_index as usize)
            .take(capped_limit)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{VMContextBuilder, accounts, get_logs};
    use near_sdk::testing_env;

    fn set_context(predecessor: AccountId, timestamp_ns: u64, seed: [u8; 32]) {
        let mut builder = VMContextBuilder::new();
        builder
            .predecessor_account_id(predecessor.clone())
            .signer_account_id(predecessor)
            .block_timestamp(timestamp_ns)
            .random_seed(seed);
        testing_env!(builder.build());
    }

    #[test]
    fn test_mint_city_creates_empty_city_and_emits_event() {
        let alice = accounts(0);
        set_context(alice.clone(), 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();

        contract.mint_city(0);

        let city = contract.get_city(alice.clone()).expect("city should exist");
        assert_eq!(city.owner, alice);
        assert_eq!(city.grid.len(), GRID_CELLS);
        assert!(city.grid.iter().all(|&b| b == 0));
        assert_eq!(city.troops, 0);
        assert_eq!(city.tick, 0);
        assert_eq!(city.econ_score, 0);
        assert_eq!(city.trophies, 0);
        assert_eq!(city.loot_claimable, 0);
        assert_eq!(city.raided, 0);
        assert_eq!(city.attack, 0);
        assert_eq!(city.defense, 0);
        assert_eq!(city.chain_power, 0);

        let logs = get_logs();
        assert_eq!(logs.len(), 1);
        assert!(logs[0].starts_with("EVENT_JSON:"));
        let event_json: near_sdk::serde_json::Value =
            near_sdk::serde_json::from_str(logs[0].strip_prefix("EVENT_JSON:").unwrap()).unwrap();
        assert_eq!(event_json["standard"], "metropolix");
        assert_eq!(event_json["version"], "1.0.0");
        assert_eq!(event_json["event"], "city_minted");
        assert_eq!(event_json["data"][0]["owner"], alice.as_str());
    }

    #[test]
    #[should_panic(expected = "City already minted")]
    fn test_mint_city_twice_fails() {
        let alice = accounts(0);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        contract.mint_city(0);
    }

    #[test]
    #[should_panic(expected = "City not found")]
    fn test_commit_snapshot_unminted_caller_fails() {
        let alice = accounts(0);
        let bob = accounts(1);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);

        // Bob has no city and cannot commit
        set_context(bob, 1_000, [0u8; 32]);
        contract.commit_snapshot(vec![0u8; GRID_CELLS], 0, 1, 0);
    }

    #[test]
    #[should_panic(expected = "Invalid grid length")]
    fn test_commit_snapshot_invalid_grid_len_fails() {
        let alice = accounts(0);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        contract.commit_snapshot(vec![0u8; 195], 0, 1, 0);
    }

    #[test]
    #[should_panic(expected = "Invalid building code")]
    fn test_commit_snapshot_invalid_building_code_fails() {
        let alice = accounts(0);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        let mut grid = vec![0u8; GRID_CELLS];
        grid[10] = 15; // codes above MAX_BUILDING_CODE (14) are rejected
        contract.commit_snapshot(grid, 0, 1, 0);
    }

    #[test]
    #[should_panic(expected = "Invalid tick")]
    fn test_commit_snapshot_tick_regression_fails() {
        let alice = accounts(0);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        contract.commit_snapshot(vec![0u8; GRID_CELLS], 0, 10, 0);
        contract.commit_snapshot(vec![0u8; GRID_CELLS], 0, 9, 0);
    }

    #[test]
    #[should_panic(expected = "Invalid troops")]
    fn test_commit_snapshot_troops_exceed_barracks_cap_fails() {
        let alice = accounts(0);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        let mut grid = vec![0u8; GRID_CELLS];
        grid[0] = 7; // 1 barracks => cap 20
        contract.commit_snapshot(grid, 21, 1, 0);
    }

    #[test]
    #[should_panic(expected = "Invalid econ_score")]
    fn test_commit_snapshot_econ_score_exceeds_max_fails() {
        let alice = accounts(0);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        let mut grid = vec![0u8; GRID_CELLS];
        // 1 house (housing=10), 1 farm (jobs=4, output=6)
        // max_econ_score = (2 * (6 + 4*1) + 10/2) * 1100 / 1000 = 25 * 1.1 = 27
        grid[0] = 1;
        grid[1] = 2;
        contract.commit_snapshot(grid, 0, 1, 28);
    }

    #[test]
    fn test_commit_snapshot_valid_and_derived_stats_match_hand_computed() {
        let alice = accounts(0);
        set_context(alice.clone(), 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);

        let mut grid = vec![0u8; GRID_CELLS];
        // 2 houses (code 1): housing = 20
        // 1 farm (code 2): jobs = 4, output = 6
        // 1 shop (code 3): jobs = 6, output = 10
        // 1 factory (code 4): jobs = 8, output = 16
        // 2 barracks (code 7): troopCap = 40
        // 3 towers (code 8): defense = 120
        // sum(output) = 6 + 10 + 16 = 32
        // sum(jobs) = 4 + 6 + 8 = 18
        // sum(housing) = 20
        // max_econ_score = 2 * (32 + 18 * 1) + 20 / 2 = 100 + 10 = 110
        grid[0] = 1;
        grid[1] = 1;
        grid[2] = 2;
        grid[3] = 3;
        grid[4] = 4;
        grid[5] = 7;
        grid[6] = 7;
        grid[7] = 8;
        grid[8] = 8;
        grid[9] = 8;

        assert_eq!(max_econ_score(&grid), 121);

        // Commit at exact boundary: troops = 35 (<= 40), tick = 42, econ_score = 110
        contract.commit_snapshot(grid.clone(), 35, 42, 110);

        let view = contract.get_city(alice.clone()).expect("city should exist");
        // Hand-computed derived values:
        // arc 0 (elf): attack x0.95, defense x1.2
        // attack = 35 * 5 * 950 / 1000 = 166
        // defense = (35 * 3 + 40 * 3) * 1200 / 1000 = 225 * 1.2 = 270
        // chain_power = 110 + 166 + (270 * 3) / 2 = 110 + 166 + 405 = 681
        assert_eq!(view.grid, grid);
        assert_eq!(view.troops, 35);
        assert_eq!(view.tick, 42);
        assert_eq!(view.econ_score, 110);
        assert_eq!(view.attack, 166);
        assert_eq!(view.defense, 270);
        assert_eq!(view.chain_power, 681);

        let logs = get_logs();
        let last_log = logs.last().expect("event log");
        let event_json: serde_json::Value =
            serde_json::from_str(last_log.strip_prefix("EVENT_JSON:").unwrap()).unwrap();
        assert_eq!(event_json["standard"], "metropolix");
        assert_eq!(event_json["version"], "1.0.0");
        assert_eq!(event_json["event"], "snapshot_committed");
        assert_eq!(event_json["data"][0]["owner"], alice.as_str());
        assert_eq!(event_json["data"][0]["tick"], 42);
        assert_eq!(event_json["data"][0]["troops"], 35);
        assert_eq!(event_json["data"][0]["econ_score"], 110);
        assert_eq!(event_json["data"][0]["chain_power"], 681);

        let constants = contract.get_constants();
        assert_eq!(constants.grid_size, 40);
        assert_eq!(constants.grid_cells, 1600);
        assert_eq!(constants.troop_attack, 5);
        assert_eq!(constants.troop_defense, 3);
        assert_eq!(constants.barracks_troop_cap, 20);
        assert_eq!(constants.tower_defense, 40);
    }

    #[test]
    #[should_panic(expected = "Cannot attack your own city")]
    fn test_attack_self_fails() {
        let alice = accounts(0);
        set_context(alice.clone(), 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        contract.attack(alice);
    }

    #[test]
    #[should_panic(expected = "Attacker does not have a city")]
    fn test_attack_without_attacker_city_fails() {
        let alice = accounts(0);
        let bob = accounts(1);
        set_context(bob.clone(), 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);

        set_context(alice, 1_000, [0u8; 32]);
        contract.attack(bob);
    }

    #[test]
    #[should_panic(expected = "Target does not have a city")]
    fn test_attack_without_target_city_fails() {
        let alice = accounts(0);
        let bob = accounts(1);
        set_context(alice, 1_000, [0u8; 32]);
        let mut contract = MetropolixContract::default();
        contract.mint_city(0);
        contract.attack(bob);
    }

    #[test]
    #[should_panic(expected = "No troops")]
    fn test_attack_with_zero_troops_fails() {
        let alice = accounts(0);
        let bob = accounts(1);
        let mut contract = MetropolixContract::default();

        set_context(alice.clone(), 1_000, [0u8; 32]);
        contract.mint_city(0);
        set_context(bob.clone(), 1_000, [0u8; 32]);
        contract.mint_city(0);

        set_context(alice, 1_000, [0u8; 32]);
        contract.attack(bob);
    }

    #[test]
    fn test_attack_win_branch_and_claim_loot() {
        let alice = accounts(0);
        let bob = accounts(1);
        let mut contract = MetropolixContract::default();

        // Alice mints & commits 2 barracks (code 7), 40 troops
        set_context(alice.clone(), 1_000, [0u8; 32]);
        contract.mint_city(0);
        let mut alice_grid = vec![0u8; GRID_CELLS];
        alice_grid[0] = 7;
        alice_grid[1] = 7;
        contract.commit_snapshot(alice_grid, 40, 1, 0);

        // Bob mints & commits 2 towers (code 8), 1 barracks (code 7), 10 troops
        // Bob defense = 10 * 3 + 40 * 2 = 110
        set_context(bob.clone(), 1_000, [0u8; 32]);
        contract.mint_city(0);
        let mut bob_grid = vec![0u8; GRID_CELLS];
        bob_grid[0] = 7;
        bob_grid[1] = 8;
        bob_grid[2] = 8;
        contract.commit_snapshot(bob_grid, 10, 1, 0);

        // Seed with first 4 bytes LE u32 = 150 => rand % 300 = 150
        // elf attacker: attack = 40 * 5 * 950 / 1000 = 190, force = 190 * (850 + 150) / 1000 = 190
        // elf target defense = 110 * 1200 / 1000 = 132, so 190 > 132 (win!)
        // troops_lost = max(1, 40 * 15 / 100) = 6 => remaining troops = 34
        // loot = max(50, 15 * 132 * 6 / 100) = 118, x0.9 elf loot modifier = 106
        let mut seed = [0u8; 32];
        seed[0..4].copy_from_slice(&150u32.to_le_bytes());
        set_context(alice.clone(), 10_000_000_000, seed);

        let res = contract.attack(bob.clone());
        assert_eq!(
            res,
            BattleOutcome {
                win: true,
                force: 190,
                target_defense: 132,
                troops_lost: 6,
                loot: 106,
            }
        );

        let alice_view = contract.get_city(alice.clone()).unwrap();
        assert_eq!(alice_view.troops, 34);
        assert_eq!(alice_view.trophies, 1);
        assert_eq!(alice_view.loot_claimable, 106);

        let bob_view = contract.get_city(bob.clone()).unwrap();
        assert_eq!(bob_view.raided, 1);

        let logs = get_logs();
        let last_log = logs.last().expect("battle_resolved log");
        let event_json: serde_json::Value =
            serde_json::from_str(last_log.strip_prefix("EVENT_JSON:").unwrap()).unwrap();
        assert_eq!(event_json["event"], "battle_resolved");
        assert_eq!(event_json["data"][0]["attacker"], alice.as_str());
        assert_eq!(event_json["data"][0]["target"], bob.as_str());
        assert_eq!(event_json["data"][0]["win"], true);
        assert_eq!(event_json["data"][0]["force"], 190);
        assert_eq!(event_json["data"][0]["target_defense"], 132);
        assert_eq!(event_json["data"][0]["troops_lost"], 6);
        assert_eq!(event_json["data"][0]["loot"], 106);

        // Claim loot zeroes loot_claimable and returns 99
        let claimed = contract.claim_loot();
        assert_eq!(claimed, 106);
        assert_eq!(contract.get_city(alice.clone()).unwrap().loot_claimable, 0);
        assert_eq!(contract.claim_loot(), 0);
    }

    #[test]
    fn test_attack_lose_branch() {
        let alice = accounts(0);
        let bob = accounts(1);
        let mut contract = MetropolixContract::default();

        // Alice: 1 barracks, 10 troops
        set_context(alice.clone(), 1_000, [0u8; 32]);
        contract.mint_city(0);
        let mut alice_grid = vec![0u8; GRID_CELLS];
        alice_grid[0] = 7;
        contract.commit_snapshot(alice_grid, 10, 1, 0);

        // Bob: 3 towers => defense = 120
        set_context(bob.clone(), 1_000, [0u8; 32]);
        contract.mint_city(0);
        let mut bob_grid = vec![0u8; GRID_CELLS];
        bob_grid[0] = 8;
        bob_grid[1] = 8;
        bob_grid[2] = 8;
        contract.commit_snapshot(bob_grid, 0, 1, 0);

        // elf: attack = 10 * 5 * 950 / 1000 = 47, force = 47 * 850 / 1000 = 39
        // target defense = 100 * 1.2 = 120 (2 towers + troops) => 39 <= 144 (lose!)
        // troops_lost = max(1, 10 * 40 / 100) = 4 => remaining troops = 6
        set_context(alice.clone(), 10_000_000_000, [0u8; 32]);
        let res = contract.attack(bob.clone());
        assert_eq!(
            res,
            BattleOutcome {
                win: false,
                force: 39,
                target_defense: 144,
                troops_lost: 4,
                loot: 0,
            }
        );

        let alice_view = contract.get_city(alice).unwrap();
        assert_eq!(alice_view.troops, 6);
        assert_eq!(alice_view.trophies, 0);
        assert_eq!(alice_view.loot_claimable, 0);

        let bob_view = contract.get_city(bob).unwrap();
        assert_eq!(bob_view.raided, 0);
    }

    #[test]
    #[should_panic(expected = "cooldown")]
    fn test_attack_cooldown_blocks_before_60s() {
        let alice = accounts(0);
        let bob = accounts(1);
        let mut contract = MetropolixContract::default();

        set_context(alice.clone(), 0, [0u8; 32]);
        contract.mint_city(0);
        let mut alice_grid = vec![0u8; GRID_CELLS];
        alice_grid[0] = 7;
        contract.commit_snapshot(alice_grid, 20, 1, 0);

        set_context(bob.clone(), 0, [0u8; 32]);
        contract.mint_city(0);

        // First attack at t = 10s
        set_context(alice.clone(), 10_000_000_000, [0u8; 32]);
        contract.attack(bob.clone());

        // Second attack at t = 69.999999999s (still on cooldown)
        set_context(alice, 69_999_999_999, [0u8; 32]);
        contract.attack(bob);
    }

    #[test]
    fn test_attack_cooldown_per_target_and_expires_at_60s() {
        let alice = accounts(0);
        let bob = accounts(1);
        let charlie = accounts(2);
        let mut contract = MetropolixContract::default();

        set_context(alice.clone(), 0, [0u8; 32]);
        contract.mint_city(0);
        let mut alice_grid = vec![0u8; GRID_CELLS];
        alice_grid[0] = 7;
        contract.commit_snapshot(alice_grid, 20, 1, 0);

        set_context(bob.clone(), 0, [0u8; 32]);
        contract.mint_city(0);
        set_context(charlie.clone(), 0, [0u8; 32]);
        contract.mint_city(0);

        // Attack Bob at t = 10s
        set_context(alice.clone(), 10_000_000_000, [0u8; 32]);
        contract.attack(bob.clone());

        // Attack Charlie at t = 20s (different target, not on cooldown!)
        set_context(alice.clone(), 20_000_000_000, [0u8; 32]);
        contract.attack(charlie);

        // Attack Bob again at t = 70s (60s elapsed since 10s => allowed!)
        set_context(alice, 70_000_000_000, [0u8; 32]);
        let res = contract.attack(bob);
        assert!(res.win);
    }

    #[test]
    fn test_get_leaderboard_sorted_desc_paginated_and_bounds_safe() {
        let alice = accounts(0);
        let bob = accounts(1);
        let charlie = accounts(2);
        let mut contract = MetropolixContract::default();

        // Alice: 1 barracks (7), 10 troops => chain_power = 0 + 47 + 54 = 101 (elf mods)
        set_context(alice.clone(), 0, [0u8; 32]);
        contract.mint_city(0);
        let mut g_a = vec![0u8; GRID_CELLS];
        g_a[0] = 7;
        contract.commit_snapshot(g_a, 10, 1, 0);

        // Bob: 2 towers (8) => defense = 80 * 1.2 = 96 => chain_power = 0 + 0 + 144 = 144
        set_context(bob.clone(), 0, [0u8; 32]);
        contract.mint_city(0);
        let mut g_b = vec![0u8; GRID_CELLS];
        g_b[0] = 8;
        g_b[1] = 8;
        contract.commit_snapshot(g_b, 0, 1, 0);

        // Charlie: 1 barracks (7), 20 troops => attack 95, defense 60 * 1.2 = 72 => chain_power = 0 + 95 + 108 = 203
        set_context(charlie.clone(), 0, [0u8; 32]);
        contract.mint_city(0);
        let mut g_c = vec![0u8; GRID_CELLS];
        g_c[0] = 7;
        contract.commit_snapshot(g_c, 20, 1, 0);

        let all = contract.get_leaderboard(0, 100);
        assert_eq!(all.len(), 3);
        assert_eq!(all[0].owner, charlie);
        assert_eq!(all[0].chain_power, 203);
        assert_eq!(all[1].owner, bob);
        assert_eq!(all[1].chain_power, 144);
        assert_eq!(all[2].owner, alice);
        assert_eq!(all[2].chain_power, 101);

        let page = contract.get_leaderboard(1, 1);
        assert_eq!(page.len(), 1);
        assert_eq!(page[0].owner, bob);

        // Out-of-bounds index or zero limit never panics
        assert!(contract.get_leaderboard(999, 10).is_empty());
        assert!(contract.get_leaderboard(0, 0).is_empty());
    }

    #[test]
    fn test_get_leaderboard_caps_limit_at_50() {
        let mut contract = MetropolixContract::default();
        for i in 0..55u32 {
            let acct: AccountId = format!("mayor{i}.testnet").parse().unwrap();
            set_context(acct, 0, [0u8; 32]);
            contract.mint_city(0);
        }
        let board = contract.get_leaderboard(0, 100);
        assert_eq!(board.len(), 50);
    }

    mod proptests {
        use super::*;
        use proptest::prelude::*;

        proptest! {
            #[test]
            fn prop_max_econ_score_never_panics_on_valid_grid(
                grid in proptest::collection::vec(0u8..=MAX_BUILDING_CODE, GRID_CELLS)
            ) {
                let score = max_econ_score(&grid);
                // Upper bound for 1600 factories (jobs=8, output=16): 2 * 1600 * 24 = 76800
                prop_assert!(score <= 84480);
            }

            #[test]
            fn prop_chain_power_is_monotonic_in_troops(
                grid in proptest::collection::vec(0u8..=MAX_BUILDING_CODE, GRID_CELLS),
                econ_score in 0u64..=10_000u64,
                t1 in 0u32..=2_000u32,
                delta in 1u32..=2_000u32,
            ) {
                let t2 = t1 + delta;
                let atk1 = compute_attack(t1, 0);
                let def1 = compute_defense(t1, &grid, 0);
                let cp1 = compute_chain_power(econ_score, atk1, def1);

                let atk2 = compute_attack(t2, 0);
                let def2 = compute_defense(t2, &grid, 0);
                let cp2 = compute_chain_power(econ_score, atk2, def2);

                prop_assert!(cp2 > cp1);
            }

            #[test]
            fn prop_commit_then_view_round_trips(
                mut grid in proptest::collection::vec(0u8..=MAX_BUILDING_CODE, GRID_CELLS),
                extra_barracks in 0usize..=10usize,
                troops_frac in 0u32..=100u32,
                econ_frac in 0u64..=100u64,
                tick in 0u64..=1_000_000u64,
            ) {
                for i in 0..extra_barracks.min(GRID_CELLS) {
                    grid[i] = 7;
                }
                let barracks = count_building(&grid, 7) as u32;
                let max_troops = barracks * BARRACKS_TROOP_CAP;
                let troops = (max_troops * troops_frac) / 100;
                let max_econ = max_econ_score(&grid);
                let econ_score = (max_econ * econ_frac) / 100;

                let alice = accounts(0);
                let mut builder = VMContextBuilder::new();
                builder
                    .predecessor_account_id(alice.clone())
                    .signer_account_id(alice.clone());
                near_sdk::env::set_blockchain_interface(near_sdk::MockedBlockchain::new(
                    builder.build(),
                    near_sdk::test_vm_config(),
                    near_sdk::RuntimeFeesConfig::test(),
                    vec![],
                    Default::default(),
                    Default::default(),
                    None,
                ));
                let mut contract = MetropolixContract::default();
                contract.mint_city(0);
                contract.commit_snapshot(grid.clone(), troops, tick, econ_score);

                let view = contract.get_city(alice.clone()).expect("city must exist");
                prop_assert_eq!(view.owner, alice);
                prop_assert_eq!(&view.grid, &grid);
                prop_assert_eq!(view.troops, troops);
                prop_assert_eq!(view.tick, tick);
                prop_assert_eq!(view.econ_score, econ_score);
                prop_assert_eq!(view.attack, compute_attack(troops, 0));
                prop_assert_eq!(view.defense, compute_defense(troops, &grid, 0));
                prop_assert_eq!(
                    view.chain_power,
                    compute_chain_power(econ_score, view.attack, view.defense)
                );
            }
        }
    }
}
