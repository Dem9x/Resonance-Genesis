pub mod claim_re;
pub mod initialize;
pub mod migrate_global_config;
pub mod register_node_mint;
pub mod set_traits;
pub mod stake_node;
pub mod unstake_node;
pub mod update_config;

pub use claim_re::ClaimRe;
pub use initialize::{Initialize, InitializeArgs};
pub use migrate_global_config::{MigrateGlobalConfig, MigrateGlobalConfigArgs};
pub use register_node_mint::{RegisterNodeMint, RegisterNodeMintArgs};
pub use set_traits::{SetNodeTraits, SetNodeTraitsArgs};
pub use stake_node::StakeNode;
pub use unstake_node::UnstakeNode;
pub use update_config::{UpdateConfig, UpdateConfigArgs};

use crate::errors::ResonanceError;
use crate::state::NodeTraits;

pub fn hashrate(traits: &NodeTraits) -> Result<u64, ResonanceError> {
    if !traits.initialized {
        return Err(ResonanceError::NodeTraitsNotInitialized);
    }
    let frequency_weight = integer_sqrt(traits.frequency as u64)
        .checked_mul(100)
        .ok_or(ResonanceError::MathOverflow)?;
    let delta = traits.mode_n.abs_diff(traits.mode_m) as u64;
    let mode_complexity = (traits.mode_n as u64)
        .checked_mul(traits.mode_m as u64)
        .and_then(|value| value.checked_add(delta.checked_mul(3)?))
        .ok_or(ResonanceError::MathOverflow)?;
    let symmetry_bonus = if delta <= 1 { 500 } else if delta <= 3 { 250 } else { 0 };
    let base = frequency_weight
        .checked_add(mode_complexity.checked_mul(40).ok_or(ResonanceError::MathOverflow)?)
        .and_then(|value| value.checked_add((traits.node_density_bps as u64).checked_mul(3)?))
        .and_then(|value| value.checked_add((traits.line_thickness_bps as u64).checked_mul(2)?))
        .and_then(|value| value.checked_add(symmetry_bonus))
        .ok_or(ResonanceError::MathOverflow)?;
    base.checked_mul(rarity_multiplier(traits.rarity_tier))
        .and_then(|value| value.checked_div(100))
        .ok_or(ResonanceError::MathOverflow)
}

pub fn pending_re(hashrate: u64, elapsed_seconds: u64, energy_scale: u64) -> Result<u64, ResonanceError> {
    hashrate
        .checked_mul(elapsed_seconds)
        .and_then(|value| value.checked_mul(crate::state::RE_DECIMALS))
        .and_then(|value| value.checked_div(energy_scale.max(1)))
        .ok_or(ResonanceError::MathOverflow)
}

fn rarity_multiplier(rarity_tier: u8) -> u64 {
    match rarity_tier {
        1 => 115,
        2 => 135,
        3 => 165,
        4 => 210,
        5 => 280,
        _ => 100,
    }
}

fn integer_sqrt(x: u64) -> u64 {
    if x == 0 {
        return 0;
    }
    let mut z = (x + 1) / 2;
    let mut y = x;
    while z < y {
        y = z;
        z = (x / z + z) / 2;
    }
    y
}
