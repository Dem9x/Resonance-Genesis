use anchor_lang::prelude::*;

#[error_code]
pub enum ResonanceError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid Chladni trait input")]
    InvalidTrait,
    #[msg("Node traits are not initialized")]
    NodeTraitsNotInitialized,
    #[msg("Node is already staked")]
    AlreadyStaked,
    #[msg("Node is not staked")]
    NotStaked,
    #[msg("Signer is not the stake owner")]
    NotStakeOwner,
    #[msg("Minimum claim threshold not reached")]
    MinimumClaimNotReached,
    #[msg("RE max supply reached")]
    MaxSupplyReached,
    #[msg("Invalid NFT token account")]
    InvalidNftTokenAccount,
    #[msg("Invalid RE mint")]
    InvalidReMint,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Chladni Node collection is sold out")]
    SoldOut,
    #[msg("Invalid token id")]
    InvalidTokenId,
    #[msg("Mint record already exists")]
    MintRecordAlreadyExists,
    #[msg("Invalid global config account layout")]
    InvalidGlobalConfigLayout,
}
