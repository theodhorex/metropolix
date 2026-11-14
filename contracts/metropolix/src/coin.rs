// $METRO: a NEP-141 coin whose worth is backed by the cities. A constant-product pool trades it for NEAR
// (1% fee into the treasury). NAV = (treasury + the cities' gold index * k) / supply, where the gold index is
// the sum of sqrt(gold) over every saved city (sqrt damps the game's gold inflation; k is tunable by the owner).
// mNAV = pool price / NAV. Rules after every swap: mNAV >= 2x issues 0.5% more METRO into the pool,
// mNAV < 0.9x spends 10% of the treasury buying METRO back and burns it. Raids move gold and so move NAV.
use near_contract_standards::fungible_token::core::FungibleTokenCore;
use near_contract_standards::fungible_token::events::{FtBurn, FtMint};
use near_contract_standards::fungible_token::metadata::{FT_METADATA_SPEC, FungibleTokenMetadata, FungibleTokenMetadataProvider};
use near_contract_standards::fungible_token::resolver::FungibleTokenResolver;
use near_contract_standards::storage_management::{StorageBalance, StorageBalanceBounds, StorageManagement};
use near_sdk::json_types::U128;
use near_sdk::serde_json::json;
use near_sdk::{AccountId, NearToken, Promise, PromiseOrValue, assert_one_yocto, env, near, require};

use crate::{Metropolix, MetropolixExt, emit};

pub const DECIMALS: u8 = 18;
pub const ONE: u128 = 1_000_000_000_000_000_000;
pub const WELCOME_GRANT: u128 = 100 * ONE;
pub const FEE_BPS: u128 = 100;
pub const ISSUE_AT_PM: u128 = 2000;
pub const BUYBACK_BELOW_PM: u128 = 900;
/// Starting k: yoctoNEAR of backing per point of the cities' gold index (0.001 NEAR).
pub const DEFAULT_NAV_K: u128 = 1_000_000_000_000_000_000_000;

const ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23f2a33a' stroke='%23201810' stroke-width='2'/%3E%3Cpath d='M8 23V10l8 7 8-7v13' fill='none' stroke='%23201810' stroke-width='3'/%3E%3C/svg%3E";


/// floor(a * b / d) without overflow: the 256-bit product divided by d. Panics if the result needs more than 128 bits.
pub fn mul_div(a: u128, b: u128, d: u128) -> u128 {
    require!(d > 0, "division by zero");
    const M: u128 = u64::MAX as u128;
    let (a1, a0, b1, b0) = (a >> 64, a & M, b >> 64, b & M);
    let (p00, p01, p10, p11) = (a0 * b0, a0 * b1, a1 * b0, a1 * b1);
    let mid = (p00 >> 64) + (p01 & M) + (p10 & M);
    let lo = (p00 & M) | (mid << 64);
    let hi = p11 + (p01 >> 64) + (p10 >> 64) + (mid >> 64);
    let (mut rem, mut q) = (0u128, 0u128);
    for i in (0..256).rev() {
        let bit = if i >= 128 { (hi >> (i - 128)) & 1 } else { (lo >> i) & 1 };
        let carry = rem >> 127;
        rem = (rem << 1) | bit;
        if carry == 1 || rem >= d {
            rem = rem.wrapping_sub(d);
            require!(i < 128, "amount too large");
            q |= 1 << i;
        }
    }
    q
}

#[near(serializers = [borsh])]
#[derive(Clone, Debug, Default)]
pub struct Pool {
    pub near_reserve: u128,
    pub treasury: u128,
    pub city_index: u128,
    pub nav_k: u128,
    pub issued: u128,
    pub burned: u128,
    pub swaps: u64,
    pub volume_near: u128,
}

#[near(serializers = [json])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CoinView {
    pub symbol: String,
    pub decimals: u8,
    pub supply: U128,
    pub metro_reserve: U128,
    pub near_reserve: U128,
    pub treasury: U128,
    pub city_index: U128,
    pub nav_k: U128,
    /// yoctoNEAR per whole METRO
    pub price: U128,
    pub nav: U128,
    /// price / NAV in permille (1000 = 1.0x), 0 while there is no NAV yet
    pub mnav_pm: U128,
    pub issued: U128,
    pub burned: U128,
    pub swaps: u64,
    pub volume_near: U128,
}

impl Metropolix {
    fn me() -> AccountId {
        env::current_account_id()
    }
    fn metro_reserve(&self) -> u128 {
        self.token.accounts.get(&Self::me()).unwrap_or(0)
    }
    fn nav_k(&self) -> u128 {
        if self.pool.nav_k == 0 { DEFAULT_NAV_K } else { self.pool.nav_k }
    }
    pub(crate) fn ensure_registered(&mut self, a: &AccountId) {
        if !self.token.accounts.contains_key(a) {
            self.token.internal_register_account(a);
        }
    }
    pub(crate) fn grant_welcome(&mut self, a: &AccountId) {
        self.ensure_registered(a);
        self.token.internal_deposit(a, WELCOME_GRANT);
        FtMint { owner_id: a, amount: U128(WELCOME_GRANT), memo: Some("welcome grant for a new city") }.emit();
    }
    fn price(&self) -> u128 {
        let m = self.metro_reserve();
        if m == 0 { 0 } else { mul_div(self.pool.near_reserve, ONE, m) }
    }
    fn nav(&self) -> u128 {
        let supply = self.token.total_supply;
        // no saved city yet: nothing backs the coin, so there is no NAV and the rules wait
        if supply == 0 || self.pool.city_index == 0 {
            return 0;
        }
        mul_div(self.pool.treasury + self.pool.city_index * self.nav_k(), ONE, supply)
    }
    fn mnav_pm(&self) -> u128 {
        let nav = self.nav();
        if nav == 0 { 0 } else { mul_div(self.price(), 1000, nav) }
    }
    /// The coin's rules, applied after each trade, in proportion to its size: a trade of 1% of the pool's NEAR or
    /// more applies them in full, a dust trade barely at all (so they cannot be farmed with tiny swaps).
    fn rebalance(&mut self, near_moved: u128) {
        if self.nav() == 0 || self.pool.near_reserve == 0 {
            return;
        }
        let size_pm = mul_div(near_moved, 100_000, self.pool.near_reserve).min(1000);
        let mnav = self.mnav_pm();
        let me = Self::me();
        if mnav >= ISSUE_AT_PM {
            let m = mul_div(self.metro_reserve() / 200, size_pm, 1000);
            if m > 0 {
                self.token.internal_deposit(&me, m);
                self.pool.issued += m;
                FtMint { owner_id: &me, amount: U128(m), memo: Some("mNAV above 2x: new METRO into the pool") }.emit();
            }
        } else if mnav < BUYBACK_BELOW_PM && self.pool.treasury > 0 {
            let spend = mul_div(self.pool.treasury / 10, size_pm, 1000);
            let out = mul_div(self.metro_reserve(), spend, self.pool.near_reserve + spend);
            if out > 0 {
                self.pool.treasury -= spend;
                self.pool.near_reserve += spend;
                self.token.internal_withdraw(&me, out);
                self.pool.burned += out;
                FtBurn { owner_id: &me, amount: U128(out), memo: Some("mNAV below 0.9x: treasury buyback and burn") }.emit();
            }
        }
    }
}

#[near]
impl Metropolix {
    /// Owner only: put NEAR (attached) and newly minted METRO into the pool.
    #[payable]
    pub fn seed_pool(&mut self, metro: U128) {
        require!(env::predecessor_account_id() == self.owner_id, "Owner only");
        let me = Self::me();
        self.token.internal_deposit(&me, metro.0);
        self.pool.near_reserve += env::attached_deposit().as_yoctonear();
        if self.pool.nav_k == 0 {
            self.pool.nav_k = DEFAULT_NAV_K;
        }
        FtMint { owner_id: &me, amount: metro, memo: Some("pool seed") }.emit();
    }

    /// Owner only: retune how much backing one point of the cities' gold index is worth.
    pub fn set_nav_k(&mut self, k: U128) {
        require!(env::predecessor_account_id() == self.owner_id, "Owner only");
        require!(k.0 > 0, "k must be positive");
        self.pool.nav_k = k.0;
    }

    /// Buy METRO with the attached NEAR. Fails if you would get less than `min_out`.
    #[payable]
    pub fn buy_metro(&mut self, min_out: Option<U128>) -> U128 {
        let buyer = env::predecessor_account_id();
        let near_in = env::attached_deposit().as_yoctonear();
        require!(near_in > 0, "Attach NEAR to buy");
        require!(self.pool.near_reserve > 0, "The pool is not open yet");
        let fee = near_in * FEE_BPS / 10_000;
        let net = near_in - fee;
        let out = mul_div(self.metro_reserve(), net, self.pool.near_reserve + net);
        require!(out > 0 && out >= min_out.map(|v| v.0).unwrap_or(0), "Price moved: you would get less than your minimum");
        self.ensure_registered(&buyer);
        self.token.internal_transfer(&Self::me(), &buyer, out, Some("buy".into()));
        self.pool.near_reserve += net;
        self.pool.treasury += fee;
        self.pool.swaps += 1;
        self.pool.volume_near += near_in;
        self.rebalance(near_in);
        emit("coin_swap", json!({ "account": buyer, "side": "buy", "near": U128(near_in), "metro": U128(out), "price": U128(self.price()) }));
        U128(out)
    }

    /// Sell METRO for NEAR (needs 1 yoctoNEAR attached, so the wallet always asks). Fails below `min_out`.
    #[payable]
    pub fn sell_metro(&mut self, amount: U128, min_out: Option<U128>) -> U128 {
        assert_one_yocto();
        let seller = env::predecessor_account_id();
        require!(amount.0 > 0, "Nothing to sell");
        let metro_res = self.metro_reserve();
        let gross = mul_div(self.pool.near_reserve, amount.0, metro_res + amount.0);
        let fee = gross * FEE_BPS / 10_000;
        let out = gross - fee;
        require!(out > 0 && out >= min_out.map(|v| v.0).unwrap_or(0), "Price moved: you would get less than your minimum");
        self.token.internal_transfer(&seller, &Self::me(), amount.0, Some("sell".into()));
        self.pool.near_reserve -= gross;
        self.pool.treasury += fee;
        self.pool.swaps += 1;
        self.pool.volume_near += gross;
        self.rebalance(gross);
        emit("coin_swap", json!({ "account": seller, "side": "sell", "near": U128(out), "metro": amount, "price": U128(self.price()) }));
        Promise::new(seller).transfer(NearToken::from_yoctonear(out)).detach();
        U128(out)
    }

    /// What `near_in` yoctoNEAR buys right now (after the fee).
    pub fn quote_buy(&self, near_in: U128) -> U128 {
        let net = near_in.0 - near_in.0 * FEE_BPS / 10_000;
        if self.pool.near_reserve == 0 { return U128(0); }
        U128(mul_div(self.metro_reserve(), net, self.pool.near_reserve + net))
    }

    /// What selling `metro_in` pays right now (after the fee).
    pub fn quote_sell(&self, metro_in: U128) -> U128 {
        if self.metro_reserve() + metro_in.0 == 0 { return U128(0); }
        let gross = mul_div(self.pool.near_reserve, metro_in.0, self.metro_reserve() + metro_in.0);
        U128(gross - gross * FEE_BPS / 10_000)
    }

    pub fn get_coin(&self) -> CoinView {
        CoinView {
            symbol: "METRO".into(),
            decimals: DECIMALS,
            supply: U128(self.token.total_supply),
            metro_reserve: U128(self.metro_reserve()),
            near_reserve: U128(self.pool.near_reserve),
            treasury: U128(self.pool.treasury),
            city_index: U128(self.pool.city_index),
            nav_k: U128(self.nav_k()),
            price: U128(self.price()),
            nav: U128(self.nav()),
            mnav_pm: U128(self.mnav_pm()),
            issued: U128(self.pool.issued),
            burned: U128(self.pool.burned),
            swaps: self.pool.swaps,
            volume_near: U128(self.pool.volume_near),
        }
    }
}

// ---------- NEP-141 plumbing (delegates to near-contract-standards) ----------
#[near]
impl FungibleTokenCore for Metropolix {
    #[payable]
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        self.token.ft_transfer(receiver_id, amount, memo)
    }
    #[payable]
    fn ft_transfer_call(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>, msg: String) -> PromiseOrValue<U128> {
        self.token.ft_transfer_call(receiver_id, amount, memo, msg)
    }
    fn ft_total_supply(&self) -> U128 {
        self.token.ft_total_supply()
    }
    fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        self.token.ft_balance_of(account_id)
    }
}

#[near]
impl FungibleTokenResolver for Metropolix {
    #[private]
    fn ft_resolve_transfer(&mut self, sender_id: AccountId, receiver_id: AccountId, amount: U128) -> U128 {
        let (used, burned) = self.token.internal_ft_resolve_transfer(&sender_id, receiver_id, amount);
        if burned > 0 {
            FtBurn { owner_id: &sender_id, amount: U128(burned), memo: Some("refund to a closed account") }.emit();
        }
        used.into()
    }
}

#[near]
impl StorageManagement for Metropolix {
    #[payable]
    fn storage_deposit(&mut self, account_id: Option<AccountId>, registration_only: Option<bool>) -> StorageBalance {
        self.token.storage_deposit(account_id, registration_only)
    }
    #[payable]
    fn storage_withdraw(&mut self, amount: Option<NearToken>) -> StorageBalance {
        self.token.storage_withdraw(amount)
    }
    /// Not supported: accounts are registered by the game for free, so unregistering would refund storage the
    /// account never paid for.
    #[payable]
    fn storage_unregister(&mut self, _force: Option<bool>) -> bool {
        env::panic_str("Unregistering is not supported")
    }
    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        self.token.storage_balance_bounds()
    }
    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        self.token.storage_balance_of(account_id)
    }
}

#[near]
impl FungibleTokenMetadataProvider for Metropolix {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.to_string(),
            name: "Metropolix".to_string(),
            symbol: "METRO".to_string(),
            icon: Some(ICON.to_string()),
            reference: None,
            reference_hash: None,
            decimals: DECIMALS,
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_utils::*;
    use near_sdk::json_types::U128;
    use super::*;

    const NEAR: u128 = 1_000_000_000_000_000_000_000_000;

    fn seeded() -> Metropolix {
        let mut c = fresh();
        ctx("metropolix.testnet", 2, 2 * NEAR);
        c.seed_pool(U128(20_000 * ONE));
        c
    }

    #[test]
    fn buy_then_sell_keeps_the_invariant_and_pays_fees() {
        let mut c = seeded();
        ctx("alice.testnet", 5, NEAR / 10);
        let (x0, y0) = (c.metro_reserve(), c.pool.near_reserve);
        let got = c.buy_metro(None).0;
        assert!(got > 0);
        // x1*y1 >= x0*y0, compared without overflow
        assert!(mul_div(c.metro_reserve(), c.pool.near_reserve, y0) >= x0, "x*y must not shrink");
        assert_eq!(c.pool.treasury, NEAR / 10 / 100);
        let supply_before = c.token.total_supply;
        ctx("alice.testnet", 6, 1);
        let back = c.sell_metro(U128(got), None).0;
        assert!(back < NEAR / 10, "a round trip loses the fees");
        assert!(c.token.total_supply <= supply_before);
    }

    #[test]
    fn mul_div_is_exact() {
        assert_eq!(mul_div(u128::MAX, 3, 3), u128::MAX);
        assert_eq!(mul_div(10u128.pow(30), 10u128.pow(30), 10u128.pow(25)), 10u128.pow(35));
        assert_eq!(mul_div(7, 9, 4), 15);
    }

    #[test]
    fn supply_equals_the_sum_of_balances() {
        let mut c = seeded();
        ctx("alice.testnet", 5, NEAR / 3);
        c.buy_metro(None);
        ctx("bob.testnet", 6, NEAR / 7);
        c.buy_metro(None);
        let sum: u128 = ["metropolix.testnet", "alice.testnet", "bob.testnet"].iter().map(|a| c.token.ft_balance_of(acc(a)).0).sum();
        assert_eq!(sum, c.token.total_supply);
    }

    #[test]
    #[should_panic(expected = "less than your minimum")]
    fn slippage_guard() {
        let mut c = seeded();
        ctx("alice.testnet", 5, NEAR / 10);
        c.buy_metro(Some(U128(1_000_000 * ONE)));
    }

    #[test]
    fn rules_issue_when_rich_and_burn_when_cheap() {
        let mut c = seeded();
        c.pool.city_index = 1; // almost no backing: mNAV is huge
        ctx("alice.testnet", 5, NEAR / 100);
        let supply = c.token.total_supply;
        c.buy_metro(None);
        assert!(c.pool.issued > 0 && c.token.total_supply > supply);
        c.pool.city_index = 10_000_000; // rich cities: the coin looks cheap
        ctx("bob.testnet", 6, NEAR / 100);
        c.buy_metro(None);
        assert!(c.pool.burned > 0);
    }
}
