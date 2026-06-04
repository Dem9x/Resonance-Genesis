use anchor_lang::prelude::*;

pub const RE_DECIMALS: u64 = 1_000_000_000;
pub const MAX_RE_SUPPLY: u64 = 1_000_000_000 * RE_DECIMALS;
pub const MIN_CLAIM_RE: u64 = 33 * RE_DECIMALS;
pub const DEFAULT_ENERGY_SCALE: u64 = 86_400;
pub const DEFAULT_MAX_NODE_SUPPLY: u64 = 1_212;

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub re_mint: Pubkey,
    pub collection_mint: Pubkey,
    pub treasury: Pubkey,
    pub total_claimed_re: u64,
    pub max_re_supply: u64,
    pub min_claim_re: u64,
    pub energy_scale: u64,
    pub next_token_id: u64,
    pub max_supply: u64,
    pub minted_count: u64,
    pub bump: u8,
}

impl GlobalConfig {
    pub const LEN: usize = 8 + 32 * 4 + 8 * 7 + 1;
    pub const OLD_LEN: usize = 8 + 32 * 4 + 8 * 4 + 1;
}

#[account]
pub struct MintRecord {
    pub token_id: u64,
    pub nft_mint: Pubkey,
    pub owner: Pubkey,
    pub metadata_uri_hash: u32,
    pub minted_at: i64,
    pub bump: u8,
}

impl MintRecord {
    pub const LEN: usize = 8 + 8 + 32 + 32 + 4 + 8 + 1;
}

#[account]
pub struct NodeTraits {
    pub nft_mint: Pubkey,
    pub frequency: u32,
    pub mode_n: u8,
    pub mode_m: u8,
    pub node_density_bps: u16,
    pub line_thickness_bps: u16,
    pub rarity_tier: u8,
    pub pattern_family_hash: u32,
    pub initialized: bool,
    pub bump: u8,
}

impl NodeTraits {
    pub const LEN: usize = 8 + 32 + 4 + 1 + 1 + 2 + 2 + 1 + 4 + 1 + 1;
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub staked_at: i64,
    pub last_claim_at: i64,
    pub claimed_re: u64,
    pub active: bool,
    pub bump: u8,
}

impl StakeAccount {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1;
}

#[event]
pub struct NodeTraitsSet {
    pub nft_mint: Pubkey,
    pub frequency: u32,
    pub mode_n: u8,
    pub mode_m: u8,
    pub rarity_tier: u8,
}

#[event]
pub struct NodeStaked {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
}

#[event]
pub struct NodeUnstaked {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
}

#[event]
pub struct REClaimed {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ConfigUpdated {
    pub authority: Pubkey,
    pub min_claim_re: u64,
    pub energy_scale: u64,
}

#[event]
pub struct NodeMintRegistered {
    pub token_id: u64,
    pub nft_mint: Pubkey,
    pub owner: Pubkey,
    pub metadata_uri_hash: u32,
}
