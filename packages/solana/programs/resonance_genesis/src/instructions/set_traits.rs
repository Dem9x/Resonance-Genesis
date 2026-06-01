use anchor_lang::prelude::*;

use crate::errors::ResonanceError;
use crate::state::{GlobalConfig, NodeTraits, NodeTraitsSet};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SetNodeTraitsArgs {
    pub nft_mint: Pubkey,
    pub frequency: u32,
    pub mode_n: u8,
    pub mode_m: u8,
    pub node_density_bps: u16,
    pub line_thickness_bps: u16,
    pub rarity_tier: u8,
    pub pattern_family_hash: u32,
}

#[derive(Accounts)]
#[instruction(args: SetNodeTraitsArgs)]
pub struct SetNodeTraits<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(seeds = [b"global_config"], bump = global_config.bump, has_one = authority @ ResonanceError::Unauthorized)]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(
        init_if_needed,
        payer = authority,
        space = NodeTraits::LEN,
        seeds = [b"node_traits", args.nft_mint.as_ref()],
        bump
    )]
    pub node_traits: Account<'info, NodeTraits>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SetNodeTraits>, args: SetNodeTraitsArgs) -> Result<()> {
    require!(args.frequency > 0 && args.mode_n > 0 && args.mode_m > 0, ResonanceError::InvalidTrait);
    require!(args.node_density_bps <= 10_000 && args.line_thickness_bps <= 10_000, ResonanceError::InvalidTrait);
    require!(args.rarity_tier <= 5, ResonanceError::InvalidTrait);

    let traits = &mut ctx.accounts.node_traits;
    traits.nft_mint = args.nft_mint;
    traits.frequency = args.frequency;
    traits.mode_n = args.mode_n;
    traits.mode_m = args.mode_m;
    traits.node_density_bps = args.node_density_bps;
    traits.line_thickness_bps = args.line_thickness_bps;
    traits.rarity_tier = args.rarity_tier;
    traits.pattern_family_hash = args.pattern_family_hash;
    traits.initialized = true;
    traits.bump = ctx.bumps.node_traits;

    emit!(NodeTraitsSet {
        nft_mint: args.nft_mint,
        frequency: args.frequency,
        mode_n: args.mode_n,
        mode_m: args.mode_m,
        rarity_tier: args.rarity_tier,
    });
    Ok(())
}
