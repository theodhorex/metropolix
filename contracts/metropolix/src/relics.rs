// Relic NFTs (NEP-171): a treasure found in the game can leave the vault as an NFT the mayor owns on chain,
// move between players with nft_transfer, and come home again (burned here, back into the vault in the game).
// Mints are rate-limited per city, since finds are rare in the game itself.
use std::collections::HashMap;

use near_contract_standards::non_fungible_token::core::{NonFungibleTokenCore, NonFungibleTokenResolver};
use near_contract_standards::non_fungible_token::enumeration::NonFungibleTokenEnumeration;
use near_contract_standards::non_fungible_token::events::NftBurn;
use near_contract_standards::non_fungible_token::metadata::{NFT_METADATA_SPEC, NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::json_types::U128;
use near_sdk::serde_json::{self, json};
use near_sdk::{AccountId, PromiseOrValue, env, near, require};

use crate::tables::{RELIC_DESC, RELIC_KINDS, RELIC_NAMES, RELIC_RARITY};
use crate::{Metropolix, MetropolixExt, NS, emit};

pub const RELIC_MINTS_PER_HOUR: u32 = 3;
/// NEAR the contract keeps free for cities and battles; relic mints (whose storage it pays) stop above this line.
pub const RELIC_STORAGE_RESERVE_YOCTO: u128 = 2_000_000_000_000_000_000_000_000; // 2 NEAR

fn rarity_label(r: &str) -> &'static str {
    match r {
        "rare" => "Rare",
        "epic" => "Epic",
        "legendary" => "Legendary",
        _ => "Super Legendary",
    }
}

#[near]
impl Metropolix {
    /// Turn a relic from your vault into an NFT you own. Up to 3 per city per hour.
    pub fn mint_relic(&mut self, kind: String) -> Token {
        let me = env::predecessor_account_id();
        let idx = RELIC_KINDS.iter().position(|k| *k == kind).unwrap_or_else(|| env::panic_str("Unknown relic"));
        let now = env::block_timestamp();
        let mut city = self.cities.get(&me).cloned().unwrap_or_else(|| env::panic_str("Mint a city first"));
        // finds are not proven on chain, so only a saved city of level 3 or more mints, and rarer relics need more
        require!(city.commits > 0, "Save your city on chain before minting relics");
        let need = match RELIC_RARITY[idx] { "mythic" => 7, "legendary" => 5, _ => 3 };
        require!(crate::war::level_from_xp(city.xp) >= need, "Your city's saved level is too low to mint a relic this rare");
        if now >= city.relic_window_ns + 3600 * NS {
            city.relic_window_ns = now;
            city.relic_mints = 0;
        }
        require!(city.relic_mints < RELIC_MINTS_PER_HOUR, "Relic mint limit reached: try again within the hour");
        city.relic_mints += 1;
        self.cities.insert(me.clone(), city);

        let token_id: TokenId = self.next_relic.to_string();
        self.next_relic += 1;
        let rarity = RELIC_RARITY[idx];
        let meta = TokenMetadata {
            title: Some(format!("{} ({})", RELIC_NAMES[idx], rarity_label(rarity))),
            description: Some(RELIC_DESC[idx].to_string()),
            media: None,
            media_hash: None,
            copies: Some(1),
            issued_at: Some((now / 1_000_000).to_string()),
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: Some(json!({ "kind": kind, "rarity": rarity }).to_string()),
            reference: None,
            reference_hash: None,
        };
        let token = self.nft.internal_mint_with_refund(token_id, me.clone(), Some(meta), None);
        // the contract pays each relic's storage, so minting pauses before it could eat the reserve the game needs
        // for new cities and battles
        let locked = u128::from(env::storage_usage()) * env::storage_byte_cost().as_yoctonear();
        require!(env::account_balance().as_yoctonear() >= locked + RELIC_STORAGE_RESERVE_YOCTO, "Relic minting is paused: the game's storage reserve is low");
        emit("relic_minted", json!({ "owner": me, "token_id": token.token_id, "kind": kind }));
        token
    }

    /// Bring a relic NFT home: it is burned here and goes back into your vault in the game. Returns its kind.
    pub fn return_relic(&mut self, token_id: TokenId) -> String {
        let me = env::predecessor_account_id();
        let owner = self.nft.owner_by_id.get(&token_id).unwrap_or_else(|| env::panic_str("No such relic"));
        require!(owner == me, "Only the owner can bring a relic home");
        let kind = self
            .nft
            .token_metadata_by_id
            .as_ref()
            .and_then(|m| m.get(&token_id))
            .and_then(|m| m.extra)
            .and_then(|e| serde_json::from_str::<HashMap<String, String>>(&e).ok())
            .and_then(|e| e.get("kind").cloned())
            .unwrap_or_default();
        self.nft.owner_by_id.remove(&token_id);
        if let Some(meta) = self.nft.token_metadata_by_id.as_mut() {
            meta.remove(&token_id);
        }
        if let Some(per_owner) = self.nft.tokens_per_owner.as_mut() {
            if let Some(mut set) = per_owner.get(&owner) {
                set.remove(&token_id);
                if set.is_empty() {
                    per_owner.remove(&owner);
                } else {
                    per_owner.insert(&owner, &set);
                }
            }
        }
        NftBurn { owner_id: &owner, token_ids: &[&token_id], authorized_id: None, memo: Some("returned to the vault") }.emit();
        emit("relic_returned", json!({ "owner": me, "token_id": token_id, "kind": kind }));
        kind
    }
}

// ---------- NEP-171 plumbing (delegates to near-contract-standards) ----------
#[near]
impl NonFungibleTokenCore for Metropolix {
    #[payable]
    fn nft_transfer(&mut self, receiver_id: AccountId, token_id: TokenId, approval_id: Option<u64>, memo: Option<String>) {
        self.nft.nft_transfer(receiver_id, token_id, approval_id, memo)
    }
    #[payable]
    fn nft_transfer_call(&mut self, receiver_id: AccountId, token_id: TokenId, approval_id: Option<u64>, memo: Option<String>, msg: String) -> PromiseOrValue<bool> {
        self.nft.nft_transfer_call(receiver_id, token_id, approval_id, memo, msg)
    }
    fn nft_token(&self, token_id: TokenId) -> Option<Token> {
        self.nft.nft_token(token_id)
    }
}

#[near]
impl NonFungibleTokenResolver for Metropolix {
    #[private]
    fn nft_resolve_transfer(&mut self, previous_owner_id: AccountId, receiver_id: AccountId, token_id: TokenId, approved_account_ids: Option<HashMap<AccountId, u64>>) -> bool {
        self.nft.nft_resolve_transfer(previous_owner_id, receiver_id, token_id, approved_account_ids)
    }
}

#[near]
impl NonFungibleTokenEnumeration for Metropolix {
    fn nft_total_supply(&self) -> U128 {
        self.nft.nft_total_supply()
    }
    fn nft_tokens(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<Token> {
        self.nft.nft_tokens(from_index, limit)
    }
    fn nft_supply_for_owner(&self, account_id: AccountId) -> U128 {
        self.nft.nft_supply_for_owner(account_id)
    }
    fn nft_tokens_for_owner(&self, account_id: AccountId, from_index: Option<U128>, limit: Option<u64>) -> Vec<Token> {
        self.nft.nft_tokens_for_owner(account_id, from_index, limit)
    }
}

#[near]
impl NonFungibleTokenMetadataProvider for Metropolix {
    fn nft_metadata(&self) -> NFTContractMetadata {
        NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: "Metropolix Relics".to_string(),
            symbol: "RELIC".to_string(),
            icon: None,
            base_uri: None,
            reference: None,
            reference_hash: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_utils::*;
    use super::*;
    use near_sdk::json_types::U128;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{NearToken, testing_env};

    /// A city minted at t=10 and saved once at t=20 with `xp` (an empty grid).
    fn saved(c: &mut Metropolix, who: &str, xp: u128) {
        ctx(who, 10, crate::MINT_DEPOSIT_YOCTO);
        c.mint_city(0, "Mayor".into(), None);
        ctx(who, 20, 0);
        let (g, l) = layout(&[]);
        c.commit_snapshot(g, l, [0; 3], U128(0), U128(xp), U128(10));
    }

    #[test]
    fn mint_transfer_and_return() {
        let mut c = fresh();
        saved(&mut c, "alice.testnet", 500);
        let t = c.mint_relic("geode".into());
        assert_eq!(c.nft.nft_supply_for_owner(acc("alice.testnet")).0, 1);
        ctx("alice.testnet", 21, 1);
        c.nft_transfer(acc("bob.testnet"), t.token_id.clone(), None, None);
        ctx("bob.testnet", 22, 0);
        assert_eq!(c.return_relic(t.token_id.clone()), "geode");
        assert!(c.nft_token(t.token_id).is_none());
        assert_eq!(c.nft.nft_total_supply().0, 0);
    }

    #[test]
    #[should_panic(expected = "Save your city on chain")]
    fn a_city_never_saved_cannot_mint() {
        let mut c = fresh();
        ctx("alice.testnet", 10, crate::MINT_DEPOSIT_YOCTO);
        c.mint_city(0, "Alice".into(), None);
        ctx("alice.testnet", 10, 0);
        c.mint_relic("geode".into());
    }

    #[test]
    #[should_panic(expected = "level is too low")]
    fn even_a_rare_relic_needs_level_3() {
        let mut c = fresh();
        saved(&mut c, "alice.testnet", 100); // level 2
        c.mint_relic("geode".into());
    }

    #[test]
    #[should_panic(expected = "limit reached")]
    fn rate_limited() {
        let mut c = fresh();
        saved(&mut c, "alice.testnet", 500);
        for _ in 0..4 {
            c.mint_relic("geode".into());
        }
    }

    #[test]
    #[should_panic(expected = "level is too low")]
    fn rare_relics_need_a_bigger_city() {
        let mut c = fresh();
        saved(&mut c, "alice.testnet", 500);
        let mythic = crate::tables::RELIC_KINDS[crate::tables::RELIC_RARITY.iter().position(|r| *r == "mythic").unwrap()];
        c.mint_relic(mythic.into());
    }

    #[test]
    #[should_panic(expected = "storage reserve is low")]
    fn minting_pauses_before_the_storage_reserve() {
        let mut c = fresh();
        saved(&mut c, "alice.testnet", 500);
        // the contract holds only what its storage needs plus 1 NEAR: below the 2 NEAR reserve
        let locked = u128::from(env::storage_usage()) * env::storage_byte_cost().as_yoctonear();
        let mut b = VMContextBuilder::new();
        b.current_account_id(acc("metropolix.testnet"))
            .predecessor_account_id(acc("alice.testnet"))
            .block_timestamp(30 * crate::NS)
            .storage_usage(env::storage_usage())
            .account_balance(NearToken::from_yoctonear(locked + 1_000_000_000_000_000_000_000_000));
        testing_env!(b.build());
        c.mint_relic("geode".into());
    }

    #[test]
    #[should_panic(expected = "Unknown relic")]
    fn unknown_kind() {
        let mut c = fresh();
        saved(&mut c, "alice.testnet", 500);
        c.mint_relic("rubberduck".into());
    }
}
