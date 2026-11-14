// City maths shared by snapshots and battles, ported from packages/sim (upgrade.ts weightedCounts, war.ts compute).
// Pure integer functions so they can be unit-tested without a blockchain.
use crate::tables::*;

pub const GRID_CELLS: usize = 1600;

const fn pm(v: u64, m: u64) -> u64 {
    v * m / 1000
}

/// Level of the building on cell i: 0 empty, else 1..=3 (a stored 0 on a building means level 1).
pub fn level_at(grid: &[u8], levels: &[u8], i: usize) -> u64 {
    if grid[i] == 0 {
        0
    } else {
        u64::from(levels.get(i).copied().unwrap_or(1).clamp(1, MAX_BLD_LEVEL))
    }
}

/// Sum of a per-kind stat over the grid, weighted by building level (permille LEVEL_PM), like the sim's stats().
pub fn weighted(grid: &[u8], levels: &[u8], table: &[u64; BUILDING_COUNT]) -> u64 {
    let mut sum = 0u64;
    for i in 0..grid.len() {
        let c = grid[i];
        if c == 0 {
            continue;
        }
        let k = usize::from(c - 1);
        sum += pm(table[k], LEVEL_PM[level_at(grid, levels, i) as usize]);
    }
    sum
}

pub fn troop_cap(grid: &[u8], levels: &[u8]) -> u64 {
    weighted(grid, levels, &TROOP_CAP)
}
pub fn tower_defense(grid: &[u8], levels: &[u8]) -> u64 {
    weighted(grid, levels, &DEFENSE)
}

/// Attack bonus in permille from buildings (armory...) and upgraded barracks, each capped like the sim.
pub fn attack_bonus_pm(grid: &[u8], levels: &[u8]) -> u64 {
    let build = weighted(grid, levels, &ATK_PM).min(BUILD_ATK_CAP_PM);
    let barracks = BUILDING_KINDS.iter().position(|k| *k == "barracks").map(|p| p as u8 + 1);
    let mut drill = 0u64;
    for i in 0..grid.len() {
        if Some(grid[i]) == barracks {
            drill += (level_at(grid, levels, i) - 1) * DRILL_PM;
        }
    }
    build + drill.min(DRILL_CAP_PM)
}

/// Most gold a city can earn per second: every job filled, full productivity, the highest tax.
pub fn max_income(grid: &[u8], levels: &[u8]) -> u64 {
    let gross = weighted(grid, levels, &OUTPUT) + weighted(grid, levels, &JOBS) * BASE_WAGE;
    gross * MAX_TAX / 10
}

/// Economy score from the grid alone (what the city can produce), so the chain never trusts a reported number.
pub fn econ_score(grid: &[u8], levels: &[u8], arc: u8) -> u64 {
    let gross = weighted(grid, levels, &OUTPUT) + weighted(grid, levels, &JOBS) * BASE_WAGE;
    let pop = weighted(grid, levels, &HOUSING);
    pm(gross * 2 + pop / 2, ARC_ECON_PM[usize::from(arc)])
}

pub fn troops(army: &[u32; 3]) -> u64 {
    army.iter().map(|&n| u64::from(n)).sum()
}
pub fn attack_power(army: &[u32; 3], arc: u8) -> u64 {
    pm(troops(army) * TROOP_ATTACK, ARC_ATTACK_PM[usize::from(arc)])
}
pub fn defense_power(army: &[u32; 3], grid: &[u8], levels: &[u8], arc: u8) -> u64 {
    pm(troops(army) * TROOP_DEFENSE + tower_defense(grid, levels), ARC_DEFENSE_PM[usize::from(arc)])
}
pub fn chain_power(econ: u64, attack: u64, defense: u64) -> u64 {
    econ + attack + defense * 3 / 2
}

pub fn level_from_xp(xp: u64) -> u8 {
    let mut lv = 1u8;
    for (i, need) in LEVEL_XP.iter().enumerate().skip(1) {
        if xp >= *need {
            lv = i as u8 + 1;
        }
    }
    lv
}

/// Integer square root (floor).
pub fn isqrt(n: u128) -> u128 {
    if n < 2 {
        return n;
    }
    let mut x = (n as f64).sqrt() as u128;
    while x * x > n {
        x -= 1;
    }
    while (x + 1) * (x + 1) <= n {
        x += 1;
    }
    x
}

pub struct Side<'a> {
    pub army: [u32; 3],
    pub arc: u8,
    pub grid: &'a [u8],
    pub levels: &'a [u8],
    pub gold: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Fight {
    pub sent: [u32; 3],
    pub n: u64,
    pub force: u64,
    pub eff_defense: u64,
    pub destruction: u64,
    pub stars: u8,
    pub loot: u64,
    pub lost: u64,
    pub trophies: i64,
}

/// The War Room battle (sim war.ts compute) against a real player's committed city.
/// `commit` is the percent of the army sent (10..=100), `focus` 0 balanced, 1 loot, 2 trophy, `roll` 850..=1149.
pub fn fight(atk: &Side, def: &Side, commit: u8, focus: u8, roll: u64) -> Fight {
    let commit = u64::from(commit.clamp(10, 100));
    let mut sent = [0u32; 3];
    for r in 0..3 {
        sent[r] = (u64::from(atk.army[r]) * commit / 100) as u32;
    }
    let mut n: u64 = sent.iter().map(|&v| u64::from(v)).sum();
    if n == 0 {
        if let Some(r) = (0..3).find(|&r| atk.army[r] > 0) {
            sent[r] = 1;
            n = 1;
        }
    }
    // the defender: garrison and towers, both scaled by its people's defense
    let dpm = ARC_DEFENSE_PM[usize::from(def.arc)];
    let garrison = pm(troops(&def.army) * TROOP_DEFENSE, dpm);
    let towers = pm(tower_defense(def.grid, def.levels), dpm);
    let bypass = if n > 0 { (u64::from(sent[2]) * 500 / n).min(800) } else { 0 };
    let eff_defense = (garrison + towers * (1000 - bypass) / 1000).max(1);
    // the attacker
    let mut atk_raw = 0u64;
    let (mut loot_w, mut loss_w) = (0u64, 0u64);
    for r in 0..3 {
        atk_raw += u64::from(sent[r]) * TROOP_ATTACK * ROLE_ATK_PM[r];
        loot_w += u64::from(sent[r]) * ROLE_LOOT_PM[r];
        loss_w += u64::from(sent[r]) * ROLE_LOSS_PM[r];
    }
    atk_raw /= 1000;
    let apm = ARC_ATTACK_PM[usize::from(atk.arc)] * (1000 + attack_bonus_pm(atk.grid, atk.levels)) / 1000;
    let force = pm(atk_raw, apm) * roll / 1000;
    let destruction = (force * 65 / eff_defense).min(100);
    let stars = if destruction >= 100 { 3 } else if destruction >= 75 { 2 } else if destruction >= 50 { 1 } else { 0 };
    let focus_loot: u64 = match focus { 1 => 1200, 2 => 700, _ => 1000 };
    // in u128: a treasury near u64::MAX must not make the city impossible to raid
    let cap = u128::from(def.gold) * u128::from(MAX_LOOT_PCT) / 100;
    let loot = if n > 0 {
        let base = cap * u128::from(destruction) / 100;
        let l = base * u128::from(focus_loot) / 1000 * u128::from(loot_w / n) / 1000 * u128::from(ARC_LOOT_PM[usize::from(atk.arc)]) / 1000;
        u64::try_from(l.min(cap)).unwrap_or(u64::MAX)
    } else {
        0
    };
    let loss_base = 25 + (100 - destruction) * 3 / 10;
    let lost = if n > 0 { (n * loss_base * (loss_w / n) / 100_000).max(1).min(n) } else { 0 };
    let trophies = if stars == 0 { -5 } else { i64::from(stars) * 8 * if focus == 2 { 3 } else { 2 } / 2 };
    Fight { sent, n, force, eff_defense, destruction, stars, loot, lost, trophies }
}

/// Remove `lost` troops from the sent ones, proportionally across roles (sim loseTroops with `only`).
pub fn lose_troops(army: &mut [u32; 3], sent: &[u32; 3], lost: u64) {
    let total: u64 = sent.iter().map(|&v| u64::from(v)).sum();
    let mut left = lost.min(troops(army));
    if total == 0 {
        return;
    }
    let mut removed = 0u64;
    for r in 0..3 {
        let d = (left * u64::from(sent[r]) / total).min(u64::from(army[r]));
        army[r] -= d as u32;
        removed += d;
    }
    for r in 0..3 {
        if removed >= left {
            break;
        }
        if army[r] > 0 && sent[r] > 0 {
            army[r] -= 1;
            removed += 1;
        }
    }
    left = left.saturating_sub(removed);
    let _ = left;
}

#[cfg(test)]
mod tests {
    use super::*;

    fn code(kind: &str) -> u8 {
        BUILDING_KINDS.iter().position(|k| *k == kind).unwrap() as u8 + 1
    }
    fn city(kinds: &[(&str, usize)]) -> Vec<u8> {
        let mut g = vec![0u8; GRID_CELLS];
        let mut i = 0;
        for (k, n) in kinds {
            for _ in 0..*n {
                g[i] = code(k);
                i += 1;
            }
        }
        g
    }

    #[test]
    fn levels_weight_stats() {
        let g = city(&[("barracks", 2)]);
        let mut lv = vec![0u8; GRID_CELLS];
        assert_eq!(troop_cap(&g, &lv), 40);
        lv[0] = 3;
        assert_eq!(troop_cap(&g, &lv), 60);
        assert_eq!(attack_bonus_pm(&g, &lv), 2 * DRILL_PM);
    }

    #[test]
    fn losses_scale_with_the_army() {
        // the sim bug divided by 1_000_000: 40 troops lost 1. Now 40 raiders lose about a third.
        let g = city(&[("house", 4)]);
        let lv = vec![0u8; GRID_CELLS];
        let atk = Side { army: [0, 40, 0], arc: 0, grid: &g, levels: &lv, gold: 0 };
        let def = Side { army: [10, 0, 0], arc: 1, grid: &g, levels: &lv, gold: 10_000 };
        let f = fight(&atk, &def, 100, 0, 1000);
        assert_eq!(f.stars, 3);
        assert!(f.lost >= 10 && f.lost <= 14, "lost {}", f.lost);
        assert!(f.loot > 0 && f.loot <= 3500);
    }

    #[test]
    fn strong_walls_hold() {
        let g = city(&[("fortress", 10)]);
        let lv = vec![0u8; GRID_CELLS];
        let empty = city(&[]);
        let atk = Side { army: [5, 0, 0], arc: 0, grid: &empty, levels: &lv, gold: 0 };
        let def = Side { army: [50, 0, 0], arc: 0, grid: &g, levels: &lv, gold: 10_000 };
        let f = fight(&atk, &def, 100, 1, 1149);
        assert_eq!(f.stars, 0);
        assert!(f.loot < 100, "a failed raid only scrapes the edge (like the sim): {}", f.loot);
        assert_eq!(f.trophies, -5);
    }

    #[test]
    fn loot_never_exceeds_the_cap() {
        let g = city(&[("armory", 20), ("barracks", 20)]);
        let lv = vec![3u8; GRID_CELLS];
        let empty = city(&[]);
        for roll in [850u64, 1000, 1149] {
            let atk = Side { army: [0, 400, 0], arc: 4, grid: &g, levels: &lv, gold: 0 };
            let def = Side { army: [0, 0, 0], arc: 0, grid: &empty, levels: &lv, gold: 1_000 };
            let f = fight(&atk, &def, 100, 1, roll);
            assert!(f.loot <= 350);
        }
    }

    #[test]
    fn lose_troops_matches_count() {
        let mut a = [10, 20, 30];
        lose_troops(&mut a, &[5, 10, 15], 9);
        assert_eq!(troops(&a), 51);
    }

    #[test]
    fn isqrt_floor() {
        for n in [0u128, 1, 2, 3, 4, 15, 16, 17, 1_000_000, 999_999, u64::MAX as u128] {
            let r = isqrt(n);
            assert!(r * r <= n && (r + 1) * (r + 1) > n);
        }
    }
}
