use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

pub use instructions::{ClaimRe, Initialize, InitializeArgs, SetNodeTraits, SetNodeTraitsArgs, StakeNode, UnstakeNode, UpdateConfig, UpdateConfigArgs};
pub use instructions::claim_re::__client_accounts_claim_re;
pub use instructions::initialize::__client_accounts_initialize;
pub use instructions::set_traits::__client_accounts_set_node_traits;
pub use instructions::stake_node::__client_accounts_stake_node;
pub use instructions::unstake_node::__client_accounts_unstake_node;
pub use instructions::update_config::__client_accounts_update_config;

declare_id!("bRDSZkzbgqprvxAMTaWTkfHNcdQJMBgCNjHntKirDo7");

#[program]
pub mod resonance_genesis {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
        instructions::initialize::handler(ctx, args)
    }

    pub fn set_node_traits(ctx: Context<SetNodeTraits>, args: SetNodeTraitsArgs) -> Result<()> {
        instructions::set_traits::handler(ctx, args)
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
