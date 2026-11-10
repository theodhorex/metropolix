// End-to-end flow on a local NEAR sandbox: mint -> commit -> attack.
// Ignored by default: near-workspaces downloads the sandbox binary on first use (needs network).
// Run with: cargo build --target wasm32-unknown-unknown --release && cargo test --test workspaces -- --ignored
use near_workspaces::types::NearToken;
use serde_json::json;

#[tokio::test]
#[ignore = "needs the near-sandbox binary (downloaded on first run) and a prebuilt wasm"]
async fn mint_commit_attack_flow() -> Result<(), Box<dyn std::error::Error>> {
    let worker = near_workspaces::sandbox().await?;
    let wasm = std::fs::read("target/wasm32-unknown-unknown/release/metropolix_contract.wasm")?;
    let contract = worker.dev_deploy(&wasm).await?;
    let alice = worker.dev_create_account().await?;
    let bob = worker.dev_create_account().await?;

    for acc in [&alice, &bob] {
        acc.call(contract.id(), "mint_city").args_json(json!({ "arc": 0 })).transact().await?.into_result()?;
    }

    // Alice: 40x40 grid with one barracks (code 7) at index 0 and 5 troops.
    let mut grid = vec![0u8; 1600];
    grid[0] = 7;
    alice
        .call(contract.id(), "commit_snapshot")
        .args_json(json!({ "grid": grid, "troops": 5, "tick": 1, "econ_score": 0 }))
        .transact().await?.into_result()?;

    let city: serde_json::Value = contract.view("get_city").args_json(json!({ "account_id": alice.id() })).await?.json()?;
    assert_eq!(city["troops"], 5);

    let res = alice
        .call(contract.id(), "attack")
        .args_json(json!({ "target": bob.id() }))
        .max_gas()
        .deposit(NearToken::from_yoctonear(0))
        .transact().await?.into_result()?;
    let outcome: serde_json::Value = res.json()?;
    assert!(outcome.get("win").is_some());
    Ok(())
}
