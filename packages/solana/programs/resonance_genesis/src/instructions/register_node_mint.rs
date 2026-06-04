use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::errors::ResonanceError;
use crate::state::{GlobalConfig, MintRecord, NodeMintRegistered, NodeTraits, NodeTraitsSet};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterNodeMintArgs {
    pub token_id: u64,
    pub nft_mint: Pubkey,
    pub metadata_uri_hash: u32,
    pub frequency: u32,
    pub mode_n: u8,
    pub mode_m: u8,
    pub node_density_bps: u16,
    pub line_thickness_bps: u16,
    pub rarity_tier: u8,
    pub pattern_family_hash: u32,
}

#[derive(Accounts)]
#[instruction(args: RegisterNodeMintArgs)]
pub struct RegisterNodeMint<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(address = args.nft_mint)]
    pub nft_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = owner,
        space = MintRecord::LEN,
        seeds = [b"mint_record", args.token_id.to_le_bytes().as_ref()],
        bump
    )]
    pub mint_record: Account<'info, MintRecord>,
    #[account(
        init,
        payer = owner,
        space = NodeTraits::LEN,
        seeds = [b"node_traits", args.nft_mint.as_ref()],
        bump
    )]
    pub node_traits: Account<'info, NodeTraits>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterNodeMint>, args: RegisterNodeMintArgs) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    require!(args.token_id > 0, ResonanceError::InvalidTokenId);
    require!(args.token_id == config.next_token_id, ResonanceError::InvalidTokenId);
    require!(config.next_token_id <= config.max_supply, ResonanceError::SoldOut);
    require!(args.frequency > 0 && args.mode_n > 0 && args.mode_m > 0, ResonanceError::InvalidTrait);
    require!(args.node_density_bps <= 10_000 && args.line_thickness_bps <= 10_000, ResonanceError::InvalidTrait);
    require!(args.rarity_tier <= 5, ResonanceError::InvalidTrait);
    require!(
        ctx.accounts.nft_mint.decimals == 0 && ctx.accounts.nft_mint.supply == 1,
        ResonanceError::InvalidNftTokenAccount
    );

    let record = &mut ctx.accounts.mint_record;
    record.token_id = args.token_id;
    record.nft_mint = ctx.accounts.nft_mint.key();
    record.owner = ctx.accounts.owner.key();
    record.metadata_uri_hash = args.metadata_uri_hash;
    record.minted_at = Clock::get()?.unix_timestamp;
    record.bump = ctx.bumps.mint_record;

    let traits = &mut ctx.accounts.node_traits;
    traits.nft_mint = ctx.accounts.nft_mint.key();
    traits.frequency = args.frequency;
    traits.mode_n = args.mode_n;
    traits.mode_m = args.mode_m;
    traits.node_density_bps = args.node_density_bps;
    traits.line_thickness_bps = args.line_thickness_bps;
    traits.rarity_tier = args.rarity_tier;
    traits.pattern_family_hash = args.pattern_family_hash;
    traits.initialized = true;
    traits.bump = ctx.bumps.node_traits;

    config.next_token_id = config.next_token_id.checked_add(1).ok_or(ResonanceError::MathOverflow)?;
    config.minted_count = config.minted_count.checked_add(1).ok_or(ResonanceError::MathOverflow)?;

    emit!(NodeMintRegistered {
        token_id: record.token_id,
        nft_mint: record.nft_mint,
        owner: record.owner,
        metadata_uri_hash: record.metadata_uri_hash,
    });

    emit!(NodeTraitsSet {
        nft_mint: traits.nft_mint,
        frequency: traits.frequency,
        mode_n: traits.mode_n,
        mode_m: traits.mode_m,
        rarity_tier: traits.rarity_tier,
    });

    Ok(())
}
