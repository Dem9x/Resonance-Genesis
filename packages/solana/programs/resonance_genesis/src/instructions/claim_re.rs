use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use crate::errors::ResonanceError;
use crate::instructions::{hashrate, pending_re};
use crate::state::{GlobalConfig, NodeTraits, REClaimed, StakeAccount};

#[derive(Accounts)]
pub struct ClaimRe<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut, address = global_config.re_mint @ ResonanceError::InvalidReMint)]
    pub re_mint: Account<'info, Mint>,
    #[account(mut, constraint = user_re_account.mint == re_mint.key() @ ResonanceError::InvalidReMint)]
    pub user_re_account: Account<'info, TokenAccount>,
    #[account(seeds = [b"node_traits", stake_account.nft_mint.as_ref()], bump = node_traits.bump)]
    pub node_traits: Account<'info, NodeTraits>,
    #[account(mut, seeds = [b"stake", stake_account.nft_mint.as_ref()], bump = stake_account.bump)]
    pub stake_account: Account<'info, StakeAccount>,
    /// CHECK: mint authority PDA for the RE mint.
    #[account(seeds = [b"re_mint_authority"], bump)]
    pub re_mint_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimRe>) -> Result<()> {
    let owner = ctx.accounts.owner.key();
    let stake = &mut ctx.accounts.stake_account;
    require!(stake.active, ResonanceError::NotStaked);
    require!(stake.owner == owner, ResonanceError::NotStakeOwner);

    let now = Clock::get()?.unix_timestamp;
    let elapsed = now.saturating_sub(stake.last_claim_at) as u64;
    let amount = pending_re(hashrate(&ctx.accounts.node_traits)?, elapsed, ctx.accounts.global_config.energy_scale)?;
    require!(amount >= ctx.accounts.global_config.min_claim_re, ResonanceError::MinimumClaimNotReached);
    require!(
        ctx.accounts.global_config.total_claimed_re.checked_add(amount).ok_or(ResonanceError::MathOverflow)?
            <= ctx.accounts.global_config.max_re_supply,
        ResonanceError::MaxSupplyReached
    );

    let signer_seeds: &[&[&[u8]]] = &[&[b"re_mint_authority", &[ctx.bumps.re_mint_authority]]];
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.re_mint.to_account_info(),
                to: ctx.accounts.user_re_account.to_account_info(),
                authority: ctx.accounts.re_mint_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    stake.last_claim_at = now;
    stake.claimed_re = stake.claimed_re.checked_add(amount).ok_or(ResonanceError::MathOverflow)?;
    ctx.accounts.global_config.total_claimed_re = ctx
        .accounts
        .global_config
        .total_claimed_re
        .checked_add(amount)
        .ok_or(ResonanceError::MathOverflow)?;

    emit!(REClaimed {
        owner,
        nft_mint: stake.nft_mint,
        amount,
    });
    Ok(())
}
