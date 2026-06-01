use anchor_lang::prelude::*;

use crate::errors::ResonanceError;
use crate::state::{ConfigUpdated, GlobalConfig, MIN_CLAIM_RE};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateConfigArgs {
    pub authority: Option<Pubkey>,
    pub min_claim_re: Option<u64>,
    pub energy_scale: Option<u64>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"global_config"], bump = global_config.bump, has_one = authority @ ResonanceError::Unauthorized)]
    pub global_config: Account<'info, GlobalConfig>,
}

pub fn handler(ctx: Context<UpdateConfig>, args: UpdateConfigArgs) -> Result<()> {
    let config = &mut ctx.accounts.global_config;
    if let Some(authority) = args.authority {
        config.authority = authority;
    }
    if let Some(min_claim_re) = args.min_claim_re {
        require!(min_claim_re >= MIN_CLAIM_RE / 10, ResonanceError::InvalidTrait);
        config.min_claim_re = min_claim_re;
    }
    if let Some(energy_scale) = args.energy_scale {
        require!(energy_scale > 0, ResonanceError::InvalidTrait);
        config.energy_scale = energy_scale;
    }

    emit!(ConfigUpdated {
        authority: config.authority,
        min_claim_re: config.min_claim_re,
        energy_scale: config.energy_scale,
    });
    Ok(())
}
