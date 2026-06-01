use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::state::{GlobalConfig, DEFAULT_ENERGY_SCALE, MAX_RE_SUPPLY, MIN_CLAIM_RE};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeArgs {
    pub treasury: Pubkey,
    pub energy_scale: Option<u64>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub re_mint: Account<'info, Mint>,
    pub collection_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = GlobalConfig::LEN,
        seeds = [b"global_config"],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    config.authority = ctx.accounts.authority.key();
    config.re_mint = ctx.accounts.re_mint.key();
    config.collection_mint = ctx.accounts.collection_mint.key();
    config.treasury = args.treasury;
    config.total_claimed_re = 0;
    config.max_re_supply = MAX_RE_SUPPLY;
    config.min_claim_re = MIN_CLAIM_RE;
    config.energy_scale = args.energy_scale.unwrap_or(DEFAULT_ENERGY_SCALE);
    config.bump = ctx.bumps.global_config;
    Ok(())
}
