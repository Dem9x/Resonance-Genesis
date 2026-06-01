use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ResonanceError;
use crate::state::{GlobalConfig, NodeStaked, NodeTraits, StakeAccount};

#[derive(Accounts)]
pub struct StakeNode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    pub nft_mint: Account<'info, Mint>,
    #[account(seeds = [b"node_traits", nft_mint.key().as_ref()], bump = node_traits.bump)]
    pub node_traits: Account<'info, NodeTraits>,
    #[account(
        mut,
        constraint = user_nft_account.owner == owner.key() @ ResonanceError::InvalidNftTokenAccount,
        constraint = user_nft_account.mint == nft_mint.key() @ ResonanceError::InvalidNftTokenAccount,
        constraint = user_nft_account.amount == 1 @ ResonanceError::InvalidNftTokenAccount
    )]
    pub user_nft_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = owner,
        token::mint = nft_mint,
        token::authority = vault_authority,
        seeds = [b"vault", nft_mint.key().as_ref()],
        bump
    )]
    pub vault_nft_account: Account<'info, TokenAccount>,
    /// CHECK: PDA signer for the NFT vault.
    #[account(seeds = [b"vault_authority"], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = StakeAccount::LEN,
        seeds = [b"stake", nft_mint.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<StakeNode>) -> Result<()> {
    require!(ctx.accounts.node_traits.initialized, ResonanceError::NodeTraitsNotInitialized);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_nft_account.to_account_info(),
                to: ctx.accounts.vault_nft_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        1,
    )?;

    let now = Clock::get()?.unix_timestamp;
    let stake = &mut ctx.accounts.stake_account;
    stake.owner = ctx.accounts.owner.key();
    stake.nft_mint = ctx.accounts.nft_mint.key();
    stake.staked_at = now;
    stake.last_claim_at = now;
    stake.claimed_re = 0;
    stake.active = true;
    stake.bump = ctx.bumps.stake_account;

    emit!(NodeStaked {
        owner: ctx.accounts.owner.key(),
        nft_mint: ctx.accounts.nft_mint.key(),
    });
    Ok(())
}
