use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::ResonanceError;
use crate::state::{GlobalConfig, DEFAULT_MAX_NODE_SUPPLY};

const DISCRIMINATOR_LEN: usize = 8;
const PUBKEY_LEN: usize = 32;
const U64_LEN: usize = 8;
const AUTHORITY_OFFSET: usize = DISCRIMINATOR_LEN;
const OLD_BUMP_OFFSET: usize = DISCRIMINATOR_LEN + PUBKEY_LEN * 4 + U64_LEN * 4;
const NEXT_TOKEN_ID_OFFSET: usize = OLD_BUMP_OFFSET;
const MAX_SUPPLY_OFFSET: usize = NEXT_TOKEN_ID_OFFSET + U64_LEN;
const MINTED_COUNT_OFFSET: usize = MAX_SUPPLY_OFFSET + U64_LEN;
const NEW_BUMP_OFFSET: usize = MINTED_COUNT_OFFSET + U64_LEN;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MigrateGlobalConfigArgs {
    pub next_token_id: Option<u64>,
    pub max_supply: Option<u64>,
    pub minted_count: Option<u64>,
}

#[derive(Accounts)]
pub struct MigrateGlobalConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"global_config"], bump)]
    /// CHECK: This instruction migrates both the old and new GlobalConfig layouts by raw bytes.
    pub global_config: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MigrateGlobalConfig>, args: MigrateGlobalConfigArgs) -> Result<()> {
    let global_config = &ctx.accounts.global_config;
    require!(global_config.owner == ctx.program_id, ResonanceError::Unauthorized);

    let current_len = global_config.data_len();
    require!(
        current_len == GlobalConfig::OLD_LEN || current_len == GlobalConfig::LEN,
        ResonanceError::InvalidGlobalConfigLayout
    );

    {
        let data = global_config.try_borrow_data()?;
        let authority_bytes = &data[AUTHORITY_OFFSET..AUTHORITY_OFFSET + PUBKEY_LEN];
        require!(authority_bytes == ctx.accounts.authority.key().as_ref(), ResonanceError::Unauthorized);
    }

    let next_token_id = args.next_token_id.unwrap_or(1);
    let max_supply = args.max_supply.unwrap_or(DEFAULT_MAX_NODE_SUPPLY);
    let minted_count = args.minted_count.unwrap_or(next_token_id.saturating_sub(1));
    require!(next_token_id > 0, ResonanceError::InvalidTokenId);
    require!(max_supply > 0, ResonanceError::InvalidTrait);
    require!(minted_count < next_token_id, ResonanceError::InvalidTokenId);
    require!(next_token_id <= max_supply.saturating_add(1), ResonanceError::SoldOut);

    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(GlobalConfig::LEN);
    let current_lamports = global_config.lamports();
    if current_lamports < required_lamports {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: global_config.to_account_info(),
                },
            ),
            required_lamports - current_lamports,
        )?;
    }

    if current_len < GlobalConfig::LEN {
        global_config.realloc(GlobalConfig::LEN, false)?;
    }

    let old_bump = {
        let data = global_config.try_borrow_data()?;
        data[OLD_BUMP_OFFSET]
    };

    let mut data = global_config.try_borrow_mut_data()?;
    data[NEXT_TOKEN_ID_OFFSET..NEXT_TOKEN_ID_OFFSET + U64_LEN].copy_from_slice(&next_token_id.to_le_bytes());
    data[MAX_SUPPLY_OFFSET..MAX_SUPPLY_OFFSET + U64_LEN].copy_from_slice(&max_supply.to_le_bytes());
    data[MINTED_COUNT_OFFSET..MINTED_COUNT_OFFSET + U64_LEN].copy_from_slice(&minted_count.to_le_bytes());
    data[NEW_BUMP_OFFSET] = old_bump;

    Ok(())
}
