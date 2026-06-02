use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

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
