use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

pub use instructions::{
    ClaimRe, Initialize, InitializeArgs, MigrateGlobalConfig, MigrateGlobalConfigArgs, RegisterNodeMint, RegisterNodeMintArgs, SetNodeTraits, SetNodeTraitsArgs,
    StakeNode, UnstakeNode, UpdateConfig, UpdateConfigArgs,
};
use instructions::claim_re::__client_accounts_claim_re;
use instructions::initialize::__client_accounts_initialize;
use instructions::migrate_global_config::__client_accounts_migrate_global_config;
use instructions::register_node_mint::__client_accounts_register_node_mint;
use instructions::set_traits::__client_accounts_set_node_traits;
use instructions::stake_node::__client_accounts_stake_node;
use instructions::unstake_node::__client_accounts_unstake_node;
use instructions::update_config::__client_accounts_update_config;

declare_id!("EMrGu6bcLn7YjuTsf7YEQb5fecu4vukPFtU48v2y53k1");

#[program]
pub mod resonance_genesis {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
        instructions::initialize::handler(ctx, args)
    }

    pub fn set_node_traits(ctx: Context<SetNodeTraits>, args: SetNodeTraitsArgs) -> Result<()> {
        instructions::set_traits::handler(ctx, args)
    }

    pub fn register_node_mint(ctx: Context<RegisterNodeMint>, args: RegisterNodeMintArgs) -> Result<()> {
        instructions::register_node_mint::handler(ctx, args)
    }

    pub fn migrate_global_config(ctx: Context<MigrateGlobalConfig>, args: MigrateGlobalConfigArgs) -> Result<()> {
        instructions::migrate_global_config::handler(ctx, args)
    }

    pub fn stake_node(ctx: Context<StakeNode>) -> Result<()> {
        instructions::stake_node::handler(ctx)
    }

    pub fn unstake_node(ctx: Context<UnstakeNode>) -> Result<()> {
        instructions::unstake_node::handler(ctx)
    }

    pub fn claim_re(ctx: Context<ClaimRe>) -> Result<()> {
        instructions::claim_re::handler(ctx)
    }

    pub fn update_config(ctx: Context<UpdateConfig>, args: UpdateConfigArgs) -> Result<()> {
        instructions::update_config::handler(ctx, args)
    }
}
