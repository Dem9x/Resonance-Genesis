use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ResonanceError;
use crate::state::{GlobalConfig, NodeUnstaked, StakeAccount};

#[derive(Accounts)]
pub struct UnstakeNode<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    pub nft_mint: Account<'info, Mint>,
    #[account(mut, constraint = user_nft_account.owner == owner.key() @ ResonanceError::InvalidNftTokenAccount)]
    pub user_nft_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault", nft_mint.key().as_ref()], bump)]
    pub vault_nft_account: Account<'info, TokenAccount>,
    /// CHECK: PDA signer for the NFT vault.
    #[account(seeds = [b"vault_authority"], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"stake", nft_mint.key().as_ref()], bump = stake_account.bump)]
    pub stake_account: Account<'info, StakeAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<UnstakeNode>) -> Result<()> {
    let stake = &mut ctx.accounts.stake_account;
    require!(stake.active, ResonanceError::NotStaked);
    require!(stake.owner == ctx.accounts.owner.key(), ResonanceError::NotStakeOwner);

    let signer_seeds: &[&[&[u8]]] = &[&[b"vault_authority", &[ctx.bumps.vault_authority]]];
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_nft_account.to_account_info(),
                to: ctx.accounts.user_nft_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    stake.active = false;
    emit!(NodeUnstaked {
        owner: ctx.accounts.owner.key(),
        nft_mint: ctx.accounts.nft_mint.key(),
    });
    Ok(())
}
